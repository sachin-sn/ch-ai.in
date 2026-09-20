import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput } from "cdktf";

import { GoogleProvider } from "./.gen/providers/google/provider";
import { ProjectService } from "./.gen/providers/google/project-service";
import { DataGoogleProject } from "./.gen/providers/google/data-google-project";
import { StorageBucket } from "./.gen/providers/google/storage-bucket";
import { ServiceAccount } from "./.gen/providers/google/service-account";
import { ProjectIamMember } from "./.gen/providers/google/project-iam-member";
import { StorageBucketIamMember } from "./.gen/providers/google/storage-bucket-iam-member";
import { IamWorkloadIdentityPool } from "./.gen/providers/google/iam-workload-identity-pool";
import { IamWorkloadIdentityPoolProvider } from "./.gen/providers/google/iam-workload-identity-pool-provider";
import { ServiceAccountIamMember } from "./.gen/providers/google/service-account-iam-member";

/**
 * infra-gcp-bootstrap
 * ===================
 * Hand-run, once, from your own machine (same pattern as AWS's infra-bootstrap):
 * this sets up the *ability* to deploy to GCP from GitHub Actions, without
 * ever writing a service-account JSON key to disk or to a GitHub secret.
 *
 * State: intentionally LOCAL (cdktf.out/terraform.tfstate), not GCS. This
 * project is what CREATES the GCS state bucket that infra-gcp's stack uses,
 * so it can't depend on that bucket already existing.
 *
 * Run order (see README.md for the full runbook):
 *   1. gcloud auth application-default login
 *   2. npm install && npx cdktf get
 *   3. npx cdktf deploy
 *   4. copy the printed outputs into GitHub repo variables
 */

// ---- fill these in before running ----
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID ?? "my-project-1530065360314";
const GCP_REGION = process.env.GCP_REGION ?? "asia-south1"; // Mumbai; change if you want the state bucket elsewhere
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "REPLACE_ME_github_owner";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "REPLACE_ME_github_repo"; // just the repo name, not owner/repo
// ---------------------------------------

class GcpBootstrapStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new GoogleProvider(this, "google", {
      project: GCP_PROJECT_ID,
      region: GCP_REGION,
    });

    // APIs this bootstrap project itself needs enabled to do its job.
    // (firebase.googleapis.com / firebasehosting.googleapis.com are enabled
    // by the infra-gcp stack instead, since bootstrap shouldn't need to know
    // about what CI will eventually deploy.)
    const requiredApis = [
      "iam.googleapis.com",
      "iamcredentials.googleapis.com",
      "sts.googleapis.com",
      "cloudresourcemanager.googleapis.com",
      "serviceusage.googleapis.com",
      "storage.googleapis.com",
    ];
    const enabledApis = requiredApis.map(
      (service) =>
        new ProjectService(this, `api-${service.split(".")[0]}`, {
          project: GCP_PROJECT_ID,
          service,
          disableOnDestroy: false,
        }),
    );

    // Needed to build the full WIF provider resource name (uses the numeric
    // project number, not the project ID).
    const project = new DataGoogleProject(this, "project", {
      projectId: GCP_PROJECT_ID,
    });

    // --- Terraform/CDKTF state bucket for the infra-gcp stack ---
    const stateBucket = new StorageBucket(this, "tfstate", {
      name: `${GCP_PROJECT_ID}-tfstate`,
      location: GCP_REGION,
      project: GCP_PROJECT_ID,
      uniformBucketLevelAccess: true,
      publicAccessPrevention: "enforced",
      versioning: { enabled: true },
      dependsOn: enabledApis,
    });

    // --- Workload Identity Federation: trust GitHub Actions OIDC tokens ---
    const pool = new IamWorkloadIdentityPool(this, "github-pool", {
      project: GCP_PROJECT_ID,
      workloadIdentityPoolId: "github-actions-pool",
      displayName: "GitHub Actions",
      dependsOn: enabledApis,
    });

    const provider = new IamWorkloadIdentityPoolProvider(
      this,
      "github-provider",
      {
        project: GCP_PROJECT_ID,
        workloadIdentityPoolId: pool.workloadIdentityPoolId,
        workloadIdentityPoolProviderId: "github-actions-provider",
        displayName: "GitHub Actions OIDC",
        attributeMapping: {
          "google.subject": "assertion.sub",
          "attribute.repository": "assertion.repository",
          "attribute.repository_owner": "assertion.repository_owner",
          "attribute.ref": "assertion.ref",
        },
        // Narrows *which tokens the pool will accept* to this one repo, before
        // any IAM binding is even evaluated - belt and suspenders.
        attributeCondition: `assertion.repository == "${GITHUB_OWNER}/${GITHUB_REPO}"`,
        oidc: {
          issuerUri: "https://token.actions.githubusercontent.com",
        },
      },
    );

    // --- The service account GitHub Actions will impersonate ---
    const deploySa = new ServiceAccount(this, "deploy-sa", {
      project: GCP_PROJECT_ID,
      accountId: "gha-gcp-deploy",
      displayName: "GitHub Actions - GCP static site deploy",
    });

    // Only workflows running FROM this exact repo may impersonate the SA.
    new ServiceAccountIamMember(this, "deploy-sa-wif-binding", {
      serviceAccountId: deploySa.name,
      role: "roles/iam.workloadIdentityUser",
      member: `principalSet://iam.googleapis.com/${pool.name}/attribute.repository/${GITHUB_OWNER}/${GITHUB_REPO}`,
    });

    // Permissions the deploy SA actually needs. Start narrow; if a real
    // `firebase deploy` or `cdktf deploy` run in CI comes back with a 403,
    // add the specific missing role the same way infra-bootstrap's AWS IAM
    // policy was built up - one real failure at a time, not by guessing a
    // broad role up front.
    new ProjectIamMember(this, "deploy-sa-hosting-admin", {
      project: GCP_PROJECT_ID,
      role: "roles/firebasehosting.admin",
      member: `serviceAccount:${deploySa.email}`,
    });
    new ProjectIamMember(this, "deploy-sa-service-usage", {
      project: GCP_PROJECT_ID,
      role: "roles/serviceusage.serviceUsageConsumer",
      member: `serviceAccount:${deploySa.email}`,
    });
    // Read/write on the state bucket only (bucket-scoped binding, not a
    // project-wide storage role) - in case CI is ever trusted to run
    // `cdktf deploy` for infra-gcp too.
    new StorageBucketIamMember(this, "deploy-sa-state-bucket", {
      bucket: stateBucket.name,
      role: "roles/storage.objectAdmin",
      member: `serviceAccount:${deploySa.email}`,
    });

    new TerraformOutput(this, "state_bucket_name", { value: stateBucket.name });
    new TerraformOutput(this, "workload_identity_provider", {
      value: `projects/${project.number}/locations/global/workloadIdentityPools/${pool.workloadIdentityPoolId}/providers/${provider.workloadIdentityPoolProviderId}`,
      description:
        "Paste into the GCP_WORKLOAD_IDENTITY_PROVIDER GitHub repo variable",
    });
    new TerraformOutput(this, "deploy_service_account_email", {
      value: deploySa.email,
      description:
        "Paste into the GCP_DEPLOY_SERVICE_ACCOUNT GitHub repo variable",
    });
  }
}

const app = new App();
new GcpBootstrapStack(app, "infra-gcp-bootstrap");
app.synth();
