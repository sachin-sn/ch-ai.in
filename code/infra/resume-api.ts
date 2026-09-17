import * as path from "path";
import { Construct } from "constructs";
import { AssetType, TerraformAsset, TerraformOutput } from "cdktf";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block";
import { DynamodbTable } from "@cdktf/provider-aws/lib/dynamodb-table";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicy } from "@cdktf/provider-aws/lib/iam-role-policy";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { LambdaFunctionUrl } from "@cdktf/provider-aws/lib/lambda-function-url";
import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission";
import { CloudwatchLogGroup } from "@cdktf/provider-aws/lib/cloudwatch-log-group";

export interface ResumeApiProps {
  /** The apex domain, used only to namespace resource names (e.g. "ch-ai.in" -> "ch-ai-in-*"). */
  domainName: string;
  /** Cloudflare Turnstile secret key -- server-side verification. Never hardcode; comes from a TerraformVariable. */
  turnstileSecretKey: string;
  /** Shared secret CloudFront injects as a custom header on this origin; the handler rejects requests without it. */
  originVerifySecret: string;
  /** S3 key the resume PDF is uploaded under, inside the bucket this construct creates. */
  resumeObjectKey: string;
}

// Wires up the one dynamic piece of an otherwise fully static site: an
// email-gated, presigned-URL resume download, plus a telemetry row per
// request. See ../lambda/resume-api for the handler and README.md there
// for the security model in more detail.
export class ResumeApi extends Construct {
  /** Bare hostname (no scheme) of the Lambda Function URL -- for use as a CloudFront custom origin. */
  public readonly functionUrlDomain: string;
  public readonly resumeBucketName: string;
  public readonly resumeObjectKey: string;

  constructor(scope: Construct, id: string, props: ResumeApiProps) {
    super(scope, id);
    const { domainName, turnstileSecretKey, originVerifySecret, resumeObjectKey } = props;
    const namePrefix = domainName.replace(/\./g, "-"); // "ch-ai.in" -> "ch-ai-in"
    this.resumeObjectKey = resumeObjectKey;

    // ---------------------------------------------------------------
    // 1. A separate, small private bucket for just the resume file --
    //    deliberately NOT the static site's bucket, so this Lambda's
    //    IAM permissions never overlap with the site-deploy role's
    //    permissions (see infra-bootstrap/main.ts). Smaller blast
    //    radius if either role or bucket is ever misconfigured.
    // ---------------------------------------------------------------
    const resumeBucket = new S3Bucket(this, "resume-bucket", {
      bucket: `${namePrefix}-resume-assets`,
      // Convenient while iterating; consider removing once this holds a
      // resume version you'd be annoyed to lose to a stray `destroy`.
      forceDestroy: true,
    });
    this.resumeBucketName = resumeBucket.bucket;

    new S3BucketPublicAccessBlock(this, "resume-bucket-block", {
      bucket: resumeBucket.id,
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    });

    // ---------------------------------------------------------------
    // 2. Telemetry table: one item per resume request. On-demand
    //    billing -- at personal-portfolio volume this is pennies a
    //    month, and it avoids the read-modify-write race a "just
    //    append to a JSON file in S3" approach has under concurrent
    //    submissions (S3 has no atomic read-modify-write).
    // ---------------------------------------------------------------
    const requestsTable = new DynamodbTable(this, "requests-table", {
      name: `${namePrefix}-resume-requests`,
      billingMode: "PAY_PER_REQUEST",
      hashKey: "id",
      attribute: [{ name: "id", type: "S" }],
    });

    // ---------------------------------------------------------------
    // 3. Lambda execution role -- scoped to exactly what the handler
    //    needs: write its own table, read the one resume object
    //    (presigned URLs are signed with this role's credentials, so
    //    it needs real GetObject rights for the link to actually
    //    work), and log to its own CloudWatch log group. Nothing
    //    bucket-wide, nothing table-wide beyond this one table.
    // ---------------------------------------------------------------
    const logGroup = new CloudwatchLogGroup(this, "lambda-log-group", {
      name: `/aws/lambda/${namePrefix}-resume-api`,
      retentionInDays: 30,
    });

    const assumeRolePolicy = new DataAwsIamPolicyDocument(this, "lambda-assume-role-policy", {
      statement: [
        {
          effect: "Allow",
          principals: [{ type: "Service", identifiers: ["lambda.amazonaws.com"] }],
          actions: ["sts:AssumeRole"],
        },
      ],
    });

    const executionRole = new IamRole(this, "lambda-execution-role", {
      name: `${namePrefix}-resume-api-lambda`,
      assumeRolePolicy: assumeRolePolicy.json,
    });

    const executionPermissions = new DataAwsIamPolicyDocument(this, "lambda-execution-permissions", {
      statement: [
        {
          sid: "Logs",
          effect: "Allow",
          actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
          resources: [`${logGroup.arn}:*`],
        },
        {
          sid: "ReadResumeObject",
          effect: "Allow",
          actions: ["s3:GetObject"],
          resources: [`${resumeBucket.arn}/${resumeObjectKey}`],
        },
        {
          sid: "WriteTelemetry",
          effect: "Allow",
          actions: ["dynamodb:PutItem"],
          resources: [requestsTable.arn],
        },
      ],
    });

    new IamRolePolicy(this, "lambda-execution-role-policy", {
      name: "resume-api-lambda-permissions",
      role: executionRole.id,
      policy: executionPermissions.json,
    });

    // ---------------------------------------------------------------
    // 4. The function itself. Code is bundled ahead of time --
    //    `npm run build` in ../lambda/resume-api produces dist/handler.js
    //    and then zips it to dist.zip itself (via the `zip` CLI). We point
    //    this at that pre-built zip as a plain FILE asset rather than
    //    letting cdktf's TerraformAsset(AssetType.ARCHIVE) zip the
    //    directory itself -- cdktf shells out to node + the `archiver`
    //    package for that, and it reliably produces a truncated zip
    //    (missing end-of-central-directory record) on Node 20/22, which
    //    AWS then rejects with "Could not unzip uploaded file". Using a
    //    FILE asset still content-hashes the zip so a deploy only
    //    replaces the function when the bundle actually changed, it just
    //    skips cdktf's own (buggy) zipping step.
    // ---------------------------------------------------------------
    const asset = new TerraformAsset(this, "lambda-code", {
      path: path.resolve(__dirname, "../lambda/resume-api/dist.zip"),
      type: AssetType.FILE,
    });

    const fn = new LambdaFunction(this, "function", {
      functionName: `${namePrefix}-resume-api`,
      role: executionRole.arn,
      handler: "handler.handler",
      runtime: "nodejs20.x",
      filename: asset.path,
      sourceCodeHash: asset.assetHash,
      timeout: 10,
      memorySize: 256,
      environment: {
        variables: {
          TABLE_NAME: requestsTable.name,
          RESUME_BUCKET: resumeBucket.bucket,
          RESUME_KEY: resumeObjectKey,
          ORIGIN_VERIFY_SECRET: originVerifySecret,
          TURNSTILE_SECRET_KEY: turnstileSecretKey,
        },
      },
      dependsOn: [logGroup],
    });

    // ---------------------------------------------------------------
    // 5. Function URL. Lambda Function URLs have no equivalent of S3's
    //    origin-access-control, so this is technically public -- what
    //    actually keeps it from being hit directly (bypassing
    //    CloudFront/Turnstile/caching) is the ORIGIN_VERIFY_SECRET
    //    header the handler checks on every request, injected only by
    //    the CloudFront origin config in static-site.ts.
    // ---------------------------------------------------------------
    const functionUrl = new LambdaFunctionUrl(this, "function-url", {
      functionName: fn.functionName,
      authorizationType: "NONE",
    });

    new LambdaPermission(this, "function-url-invoke-permission", {
      statementId: "AllowInvokeViaFunctionUrl",
      action: "lambda:InvokeFunctionUrl",
      functionName: fn.functionName,
      principal: "*",
      functionUrlAuthType: "NONE",
    });

    // Function URLs come back as "https://<id>.lambda-url.<region>.on.aws/"
    // -- CloudFront's custom-origin domainName wants just the host.
    this.functionUrlDomain = functionUrl.functionUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

    new TerraformOutput(this, "resume_bucket_name", {
      value: resumeBucket.bucket,
      description: `Upload the resume PDF here: aws s3 cp <file> s3://<this bucket>/${resumeObjectKey}`,
    });

    new TerraformOutput(this, "resume_requests_table", {
      value: requestsTable.name,
      description: "DynamoDB table holding one item per resume request (email, timestamp, ip, country).",
    });
  }
}
