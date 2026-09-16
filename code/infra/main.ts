import { App, TerraformStack, TerraformOutput } from "cdktf";
import { Construct } from "constructs";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { StaticSite } from "./static-site";

const DOMAIN_NAME = "ch-ai.in";

class PortfolioStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

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

    const site = new StaticSite(this, "portfolio", {
      domainName: DOMAIN_NAME,
      usEast1Provider: usEast1,
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
