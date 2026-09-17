import { App, TerraformStack, TerraformOutput, TerraformVariable, S3Backend } from "cdktf";
import { Construct } from "constructs";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { StaticSite } from "./static-site";
import { ResumeApi } from "./resume-api";

const DOMAIN_NAME = "ch-ai.in";
const RESUME_OBJECT_KEY = "sachin-nagaraja-resume.pdf";

class PortfolioStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Remote state — shared between your laptop and GitHub Actions so
    // neither one applies changes the other can't see. Created once by
    // ../infra-bootstrap; the bucket/table names below come straight from
    // that stack's outputs (state_bucket_name / state_lock_table_name).
    //
    // The FIRST time this runs after adding the backend, Terraform will
    // notice the backend changed and ask to migrate your existing local
    // state into this bucket — say yes. After that, this stack has no
    // local .tfstate at all; everything lives in S3.
    new S3Backend(this, {
      bucket: "ch-ai-in-tfstate-630898426885",
      key: "ch-ai-portfolio/terraform.tfstate",
      region: "ap-south-1",
      dynamodbTable: "ch-ai-in-tfstate-lock",
      encrypt: true,
    });

    // Primary provider — everything except the ACM certificate deploys here.
    // Swap the region for whichever is closest to you or your audience;
    // it has no bearing on CloudFront, which is already global.
    new AwsProvider(this, "aws", {
      region: "ap-south-1",
    });

    // CloudFront requires its ACM certificate to be requested in us-east-1,
    // full stop, regardless of the primary region above. A second, aliased
    // provider instance is CDKTF's way of sending one resource to a
    // different region than the rest of the stack.
    const usEast1 = new AwsProvider(this, "aws-us-east-1", {
      alias: "us_east_1",
      region: "us-east-1",
    });

    // Two secrets the resume-request API needs, supplied at synth/deploy
    // time as TF_VAR_turnstile_secret_key / TF_VAR_origin_verify_secret
    // (GitHub Actions secrets in CI, a local env var for you) — never
    // hardcoded in source or committed anywhere. See DEPLOYMENT.md for
    // where each value comes from and how to generate origin_verify_secret.
    const turnstileSecretKey = new TerraformVariable(this, "turnstile_secret_key", {
      type: "string",
      sensitive: true,
      description: "Cloudflare Turnstile secret key, from the Turnstile dashboard.",
    });

    const originVerifySecret = new TerraformVariable(this, "origin_verify_secret", {
      type: "string",
      sensitive: true,
      description:
        "Random shared secret CloudFront injects as a header when calling the resume-api Lambda, so the Lambda can reject requests that didn't come through CloudFront. Generate once with: openssl rand -hex 32",
    });

    const resumeApi = new ResumeApi(this, "resume-api", {
      domainName: DOMAIN_NAME,
      turnstileSecretKey: turnstileSecretKey.value,
      originVerifySecret: originVerifySecret.value,
      resumeObjectKey: RESUME_OBJECT_KEY,
    });

    const site = new StaticSite(this, "portfolio", {
      domainName: DOMAIN_NAME,
      usEast1Provider: usEast1,
      apiOrigin: {
        domainName: resumeApi.functionUrlDomain,
        originVerifySecret: originVerifySecret.value,
        pathPattern: "/api/resume/*",
      },
    });

    new TerraformOutput(this, "name_servers", {
      value: site.nameServers,
      description:
        "Update these at your domain registrar (wherever ch-ai.in is registered) so DNS resolves through this new hosted zone.",
    });

    new TerraformOutput(this, "cloudfront_domain", {
      value: site.distributionDomainName,
      description:
        "The *.cloudfront.net domain backing ch-ai.in — useful for debugging before DNS propagates.",
    });

    new TerraformOutput(this, "s3_bucket_name", {
      value: site.bucketName,
      description: "Where your build output gets synced from CI.",
    });
  }
}

const app = new App();
new PortfolioStack(app, "ch-ai-portfolio");
app.synth();
