import * as path from "path";
import { Construct } from "constructs";
import { TerraformAsset, TerraformOutput, AssetType } from "cdktf";
import { StorageBucket } from "./.gen/providers/google/storage-bucket";
import { StorageBucketIamMember } from "./.gen/providers/google/storage-bucket-iam-member";
import { StorageBucketObject } from "./.gen/providers/google/storage-bucket-object";
import { FirestoreDatabase } from "./.gen/providers/google/firestore-database";
import { ServiceAccount } from "./.gen/providers/google/service-account";
import { ServiceAccountIamMember } from "./.gen/providers/google/service-account-iam-member";
import { ProjectIamMember } from "./.gen/providers/google/project-iam-member";
import { Cloudfunctions2Function } from "./.gen/providers/google/cloudfunctions2-function";
import { Cloudfunctions2FunctionIamMember } from "./.gen/providers/google/cloudfunctions2-function-iam-member";

export interface ResumeApiProps {
  projectId: string;
  region: string;
  /** Cloudflare Turnstile secret key -- server-side verification. Never hardcode; comes from a TerraformVariable. */
  turnstileSecretKey: string;
  /** GCS key the resume PDF is uploaded under, inside the bucket this construct creates. */
  resumeObjectKey: string;
}

// The GCP port of ../infra/resume-api.ts (AWS). Same feature -- an
// email-gated, presigned-URL resume download plus a telemetry row per
// request -- rebuilt on Cloud Functions (2nd gen) + Firestore + GCS
// signed URLs. See ../gcp-functions/resume-api for the function source
// and its README for how the security model differs from the Lambda
// version (no CloudFront-injected shared secret; Firebase Hosting
// rewrites don't support that, so this relies on public invocation +
// Turnstile/honeypot instead).
export class ResumeApi extends Construct {
  public readonly resumeBucketName: string;
  public readonly resumeObjectKey: string;

  constructor(scope: Construct, id: string, props: ResumeApiProps) {
    super(scope, id);
    const { projectId, region, turnstileSecretKey, resumeObjectKey } = props;
    this.resumeObjectKey = resumeObjectKey;

    // ---------------------------------------------------------------
    // 1. A separate, small private bucket for just the resume file --
    //    deliberately not the site's own bucket (there isn't one here
    //    anyway, Firebase Hosting manages its own storage), so this
    //    function's IAM permissions never overlap with anything else.
    //    GCS bucket names are globally unique, same constraint as S3,
    //    hence the project-id prefix.
    // ---------------------------------------------------------------
    const resumeBucket = new StorageBucket(this, "resume-bucket", {
      name: `${projectId}-resume-assets`,
      location: region,
      uniformBucketLevelAccess: true,
      publicAccessPrevention: "enforced",
      // Convenient while iterating; consider removing once this holds a
      // resume version you'd be annoyed to lose to a stray `destroy`.
      forceDestroy: true,
    });
    this.resumeBucketName = resumeBucket.name;

    // ---------------------------------------------------------------
    // 2. Firestore (Native mode) telemetry -- DynamoDB's equivalent. A
    //    GCP project gets exactly one Firestore database, always named
    //    "(default)"; this construct is what provisions it for this
    //    project.
    // ---------------------------------------------------------------
    const firestore = new FirestoreDatabase(this, "database", {
      project: projectId,
      name: "(default)",
      locationId: region,
      type: "FIRESTORE_NATIVE",
      deletionPolicy: "DELETE",
    });

    // ---------------------------------------------------------------
    // 3. Dedicated runtime identity, scoped narrowly -- same spirit as
    //    the Lambda execution role: read the one resume object (signed
    //    URLs are signed with this identity via the IAM API, so it
    //    needs real read rights for the link to work), write to one
    //    Firestore collection, and sign blobs as itself.
    // ---------------------------------------------------------------
    const functionSa = new ServiceAccount(this, "function-sa", {
      project: projectId,
      accountId: "resume-api-fn",
      displayName: "resume-api Cloud Function runtime identity",
    });

    new StorageBucketIamMember(this, "function-sa-read-resume", {
      bucket: resumeBucket.name,
      role: "roles/storage.objectViewer",
      member: `serviceAccount:${functionSa.email}`,
    });

    new ProjectIamMember(this, "function-sa-firestore-write", {
      project: projectId,
      role: "roles/datastore.user",
      member: `serviceAccount:${functionSa.email}`,
      dependsOn: [firestore],
    });

    // V4 signed URLs need this identity to sign as itself via the IAM
    // API (no private key file involved) -- without this, getSignedUrl()
    // in the function fails with a permission error.
    new ServiceAccountIamMember(this, "function-sa-self-sign", {
      serviceAccountId: functionSa.name,
      role: "roles/iam.serviceAccountTokenCreator",
      member: `serviceAccount:${functionSa.email}`,
    });

    // ---------------------------------------------------------------
    // 4. Function source. Built ahead of time -- `npm run build` in
    //    ../gcp-functions/resume-api produces dist.zip (tsc -> dist/,
    //    then zipped alongside package.json). Cloud Build's Node.js
    //    buildpack runs `npm install` itself from that package.json
    //    during deploy, so the zip never needs to carry node_modules --
    //    unlike the Lambda version, which has to bundle everything
    //    itself ahead of time.
    // ---------------------------------------------------------------
    const asset = new TerraformAsset(this, "function-code", {
      path: path.resolve(__dirname, "../gcp-functions/resume-api/dist.zip"),
      type: AssetType.FILE,
    });

    const sourceBucket = new StorageBucket(this, "function-source-bucket", {
      name: `${projectId}-fn-source`,
      location: region,
      uniformBucketLevelAccess: true,
      publicAccessPrevention: "enforced",
      forceDestroy: true,
    });

    // Content-hashed object name -- a deploy only replaces the function's
    // source when the bundle actually changed.
    const sourceObject = new StorageBucketObject(this, "function-source-object", {
      bucket: sourceBucket.name,
      name: `resume-api-${asset.assetHash}.zip`,
      source: asset.path,
    });

    // ---------------------------------------------------------------
    // 5. The function itself.
    // ---------------------------------------------------------------
    const fn = new Cloudfunctions2Function(this, "function", {
      name: "resume-api",
      location: region,
      project: projectId,
      buildConfig: {
        runtime: "nodejs20",
        entryPoint: "resumeRequest",
        source: {
          storageSource: {
            bucket: sourceBucket.name,
            object: sourceObject.name,
          },
        },
      },
      serviceConfig: {
        maxInstanceCount: 5,
        availableMemory: "256M",
        timeoutSeconds: 10,
        serviceAccountEmail: functionSa.email,
        environmentVariables: {
          RESUME_BUCKET: resumeBucket.name,
          RESUME_KEY: resumeObjectKey,
          FIRESTORE_COLLECTION: "resume-requests",
          TURNSTILE_SECRET_KEY: turnstileSecretKey,
        },
      },
    });

    // ---------------------------------------------------------------
    // 6. Firebase Hosting rewrites proxy as an unauthenticated caller,
    //    and don't support injecting a custom header the way CloudFront
    //    could -- so, unlike the Lambda Function URL's X-Origin-Verify
    //    trick, this function just has to allow public invocation for
    //    the rewrite (see ../firebase.json) to reach it at all. See
    //    ../gcp-functions/resume-api/README.md's security-model note.
    // ---------------------------------------------------------------
    new Cloudfunctions2FunctionIamMember(this, "function-invoker", {
      cloudFunction: fn.name,
      location: region,
      role: "roles/cloudfunctions.invoker",
      member: "allUsers",
    });

    new TerraformOutput(this, "resume_bucket_name", {
      value: resumeBucket.name,
      description: `Upload the resume PDF here: gsutil cp <file> gs://<this bucket>/${resumeObjectKey}`,
    });

    new TerraformOutput(this, "resume_function_url", {
      value: fn.url,
      description: "Direct Cloud Run URL for the function -- reachable directly (see the security-model note above), but the live site calls it only via the /api/resume/** Firebase Hosting rewrite.",
    });
  }
}
