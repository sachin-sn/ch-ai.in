import * as path from "path";
import { Construct } from "constructs";
import { TerraformAsset, TerraformOutput, AssetType } from "cdktf";
import { ProjectService } from "./.gen/providers/google/project-service";
import { StorageBucketObject } from "./.gen/providers/google/storage-bucket-object";
import { FirestoreDatabase } from "./.gen/providers/google/firestore-database";
import { ServiceAccount } from "./.gen/providers/google/service-account";
import { ProjectIamMember } from "./.gen/providers/google/project-iam-member";
import { Cloudfunctions2Function } from "./.gen/providers/google/cloudfunctions2-function";
import { Cloudfunctions2FunctionIamMember } from "./.gen/providers/google/cloudfunctions2-function-iam-member";
import { CloudRunServiceIamMember } from "./.gen/providers/google/cloud-run-service-iam-member";

export interface VisitApiProps {
  projectId: string;
  region: string;
  /** The project's (default) Firestore database -- provisioned by ResumeApi. */
  firestore: FirestoreDatabase;
  /** Function-source bucket -- also provisioned by ResumeApi. */
  sourceBucketName: string;
  /** APIs ResumeApi enables (Cloud Functions, Run, Build, ...), so this function waits on them. */
  enabledApis: ProjectService[];
}

// The footer visit counter: a tiny public HTTP function that bumps a
// Firestore counter. Deliberately piggybacks on ResumeApi's Firestore
// database and source bucket rather than declaring its own -- a project
// has exactly one "(default)" database, and a second
// `${projectId}-fn-source` bucket would collide on the name.
export class VisitApi extends Construct {
  constructor(scope: Construct, id: string, props: VisitApiProps) {
    super(scope, id);
    const { projectId, region, firestore, sourceBucketName, enabledApis } = props;

    // Own runtime identity, so this function can only touch Firestore --
    // not the resume bucket or signBlob that resume-api-fn holds.
    const functionSa = new ServiceAccount(this, "function-sa", {
      project: projectId,
      accountId: "visit-api-fn",
      displayName: "visit-api Cloud Function runtime identity",
    });

    new ProjectIamMember(this, "function-sa-firestore-write", {
      project: projectId,
      role: "roles/datastore.user",
      member: `serviceAccount:${functionSa.email}`,
      dependsOn: [firestore],
    });

    // Built ahead of time: `npm run build` in ../gcp-functions/visit-api.
    const asset = new TerraformAsset(this, "function-code", {
      path: path.resolve(__dirname, "../gcp-functions/visit-api/dist.zip"),
      type: AssetType.FILE,
    });

    const sourceObject = new StorageBucketObject(this, "function-source-object", {
      bucket: sourceBucketName,
      name: `visit-api-${asset.assetHash}.zip`,
      source: asset.path,
    });

    const fn = new Cloudfunctions2Function(this, "function", {
      name: "visit-api",
      location: region,
      project: projectId,
      dependsOn: [...enabledApis, firestore],
      buildConfig: {
        runtime: "nodejs20",
        entryPoint: "visit",
        source: {
          storageSource: {
            bucket: sourceBucketName,
            object: sourceObject.name,
          },
        },
      },
      serviceConfig: {
        // Low cap on purpose: a scripted flood hits 429s long before it
        // can run up a bill. A portfolio's real traffic never needs more.
        maxInstanceCount: 3,
        availableMemory: "256M",
        timeoutSeconds: 10,
        serviceAccountEmail: functionSa.email,
        environmentVariables: {
          FIRESTORE_COLLECTION: "visits",
        },
      },
    });

    // Same two-level public-invoker grant as resume-api.ts -- see the
    // comment there on why the Cloud Run binding is needed too.
    new Cloudfunctions2FunctionIamMember(this, "function-invoker", {
      cloudFunction: fn.name,
      location: region,
      role: "roles/cloudfunctions.invoker",
      member: "allUsers",
    });

    new CloudRunServiceIamMember(this, "function-run-invoker", {
      project: projectId,
      service: fn.name,
      location: region,
      role: "roles/run.invoker",
      member: "allUsers",
    });

    new TerraformOutput(this, "visit_function_url", {
      value: fn.url,
      description: "Direct Cloud Run URL for the visit counter -- the site calls it via the /api/visit Firebase Hosting rewrite.",
    });
  }
}
