import { App, TerraformStack, TerraformOutput } from "cdktf";
import { Construct } from "constructs";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { DataAwsCallerIdentity } from "@cdktf/provider-aws/lib/data-aws-caller-identity";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketVersioningA } from "@cdktf/provider-aws/lib/s3-bucket-versioning";
import { S3BucketServerSideEncryptionConfigurationA } from "@cdktf/provider-aws/lib/s3-bucket-server-side-encryption-configuration";
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block";
import { DynamodbTable } from "@cdktf/provider-aws/lib/dynamodb-table";
import { IamOpenidConnectProvider } from "@cdktf/provider-aws/lib/iam-openid-connect-provider";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicy } from "@cdktf/provider-aws/lib/iam-role-policy";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";

// GitHub repos created after July 15, 2026 get an "immutable subject
// format" OIDC token by default: the owner and repo NAMES are suffixed
// with their permanent numeric IDs (repo:OWNER@OWNER_ID/REPO@REPO_ID:...)
// instead of the plain repo:OWNER/REPO:... form most existing docs and
// examples still show. This is deliberate on GitHub's part — it stops
// someone from renaming/recreating a repo to match an old trust condition
// and hijack a role. Confirmed from an actual CloudTrail
// AssumeRoleWithWebIdentity record for this repo (2026-09-17): the sub
// claim GitHub actually sends is
// "repo:sachin-sn@50323030/ch-ai.in@1372767592:...". If this repo is ever
// transferred to a different owner, only the owner ID changes (the repo
// keeps its ID), and the "sachin-sn" name portion would also need
// updating to match the new owner's login.
const GITHUB_REPO = "sachin-sn@50323030/ch-ai.in@1372767592";

// Must match the AwsProvider region in code/infra/main.ts — the state
// bucket and lock table live alongside everything else this deploys.
const AWS_REGION = "ap-south-1";

// Must match the bucket name StaticSite creates in code/infra/static-site.ts
// (currently `${domainName.replace(/\./g, "-")}-site"`, i.e. "ch-ai-in-site").
// Hardcoded here (rather than imported) because this is a separate CDKTF
// app with its own state — there's nothing to cross-reference against.
const SITE_BUCKET_NAME = "ch-ai-in-site";

// Resource names created by code/infra/resume-api.ts — same reasoning as
// SITE_BUCKET_NAME above: hardcoded because this is a separate CDKTF app
// with no way to reference the other stack's resources directly.
const RESUME_BUCKET_NAME = "ch-ai-in-resume-assets";
const RESUME_TABLE_NAME = "ch-ai-in-resume-requests";
const RESUME_FUNCTION_NAME = "ch-ai-in-resume-api";
const RESUME_LAMBDA_ROLE_NAME = "ch-ai-in-resume-api-lambda";
const RESUME_LOG_GROUP_NAME = `/aws/lambda/${RESUME_FUNCTION_NAME}`;

// GitHub's own thumbprint verification is no longer enforced by AWS for
// this specific OIDC endpoint (AWS validates against its own trusted root
// list instead), but the Terraform resource still requires a non-empty
// list. This is the widely-documented value; its exact bytes don't matter.
const GITHUB_OIDC_THUMBPRINT = "6938fd4d98bab03faadb97b34396831e3780aea1";

/**
 * One-time, hand-run bootstrap stack. It creates the things the *main*
 * stack (code/infra) needs before it can be driven from CI:
 *
 *   1. An S3 bucket + DynamoDB table for Terraform's remote state, so
 *      GitHub Actions and your laptop share the same source of truth
 *      instead of each having their own local .tfstate.
 *   2. An IAM OIDC provider + role that GitHub Actions can assume via
 *      short-lived tokens — no AWS access keys stored as GitHub secrets.
 *
 * This stack deliberately keeps its OWN local state (it has no backend
 * configured). It can't manage the bucket it creates for the *other*
 * stack's backend without a chicken-and-egg problem, and in practice you
 * run this once, maybe touch it again if permissions need widening — it
 * doesn't belong in the CI loop the way the main stack does.
 */
class BootstrapStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "aws", {
      region: AWS_REGION,
    });

    const current = new DataAwsCallerIdentity(this, "current");

    // ---------------------------------------------------------------
    // 1. Remote state bucket + lock table.
    //    Bucket names are global across all of AWS, so the account ID
    //    is folded in to keep this collision-free without you having to
    //    pick a unique name yourself.
    // ---------------------------------------------------------------
    const stateBucket = new S3Bucket(this, "tf-state", {
      bucket: `ch-ai-in-tfstate-${current.accountId}`,
    });

    new S3BucketVersioningA(this, "tf-state-versioning", {
      bucket: stateBucket.id,
      versioningConfiguration: {
        status: "Enabled",
      },
    });

    new S3BucketServerSideEncryptionConfigurationA(this, "tf-state-encryption", {
      bucket: stateBucket.id,
      rule: [
        {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: "AES256",
          },
        },
      ],
    });

    new S3BucketPublicAccessBlock(this, "tf-state-block", {
      bucket: stateBucket.id,
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    });

    const lockTable = new DynamodbTable(this, "tf-lock", {
      name: "ch-ai-in-tfstate-lock",
      billingMode: "PAY_PER_REQUEST",
      hashKey: "LockID",
      attribute: [{ name: "LockID", type: "S" }],
    });

    // ---------------------------------------------------------------
    // 2. GitHub OIDC provider + a role scoped to this one repo.
    //    If your AWS account already has a token.actions.githubusercontent.com
    //    provider from a previous project, this resource will fail with
    //    "EntityAlreadyExists" — see the README for how to import the
    //    existing one instead of creating a second.
    // ---------------------------------------------------------------
    const githubOidc = new IamOpenidConnectProvider(this, "github-oidc", {
      url: "https://token.actions.githubusercontent.com",
      clientIdList: ["sts.amazonaws.com"],
      thumbprintList: [GITHUB_OIDC_THUMBPRINT],
    });

    // Trust policy: only workflow runs from this exact repo can assume the
    // role — pushes to main (for real deploys) and pull requests (for
    // read-only `diff`/`plan` runs). Nothing else, no other repo, no other
    // branch, can mint a token this role will accept.
    const trustPolicy = new DataAwsIamPolicyDocument(this, "trust-policy", {
      statement: [
        {
          effect: "Allow",
          principals: [
            {
              type: "Federated",
              identifiers: [githubOidc.arn],
            },
          ],
          actions: ["sts:AssumeRoleWithWebIdentity"],
          condition: [
            {
              test: "StringEquals",
              variable: "token.actions.githubusercontent.com:aud",
              values: ["sts.amazonaws.com"],
            },
            {
              test: "StringLike",
              variable: "token.actions.githubusercontent.com:sub",
              values: [
                `repo:${GITHUB_REPO}:ref:refs/heads/main`,
                `repo:${GITHUB_REPO}:pull_request`,
                // Jobs that reference a GitHub Environment (like infra.yml's
                // `deploy` job, gated behind the `production` environment for
                // manual approval) get a DIFFERENT sub claim shape than a
                // plain branch push — GitHub swaps in
                // "repo:<repo-part>:environment:NAME" instead of the
                // ref-based one, regardless of which branch triggered it.
                // Without this line, that job's token matches neither of
                // the two conditions above and AWS denies the assume-role
                // call with a generic "not authorized" error.
                `repo:${GITHUB_REPO}:environment:production`,
              ],
            },
          ],
        },
      ],
    });

    const deployRole = new IamRole(this, "gh-actions-deploy-role", {
      name: "ch-ai-in-github-actions-deploy",
      assumeRolePolicy: trustPolicy.json,
      description:
        "Assumed by GitHub Actions (OIDC) in sachin-sn/ch-ai.in to deploy the ch-ai.in site and infra.",
    });

    // Least-privilege-ish permissions: scoped to the specific state
    // bucket/table and the specific site bucket by ARN. CloudFront, ACM
    // and Route 53 don't support resource-level ARN scoping for the
    // actions used here, so those three sections use "*" — standard
    // practice for these services, not a shortcut taken for convenience.
    const permissions = new DataAwsIamPolicyDocument(this, "deploy-permissions", {
      statement: [
        {
          sid: "TerraformStateBucket",
          effect: "Allow",
          actions: ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
          resources: [stateBucket.arn, `${stateBucket.arn}/*`],
        },
        {
          sid: "TerraformLockTable",
          effect: "Allow",
          actions: ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"],
          resources: [lockTable.arn],
        },
        {
          sid: "SiteBucket",
          effect: "Allow",
          actions: [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject",
            "s3:ListBucket",
            "s3:GetBucketLocation",
            "s3:GetBucketPolicy",
            "s3:PutBucketPolicy",
            "s3:GetBucketPublicAccessBlock",
            "s3:PutBucketPublicAccessBlock",
            "s3:CreateBucket",
            "s3:PutEncryptionConfiguration",
            "s3:GetEncryptionConfiguration",
            "s3:PutLifecycleConfiguration",
            "s3:GetLifecycleConfiguration",
            // The rest below are all read-only "Get*" calls the AWS
            // provider makes unconditionally while refreshing an
            // aws_s3_bucket resource, to detect drift on settings this
            // stack never actually configures (ACL, CORS, website hosting,
            // versioning, logging, tags, replication, object lock,
            // what this role can change — they're the same lesson as the
            // DynamoDB DescribeContinuousBackups/DescribeTimeToLive gap:
            // Terraform reads back far more than a resource's own config
            // block sets, so a "least privilege" policy has to cover the
            // provider's reads, not just the fields you actually set.
            "s3:GetBucketAcl",
            "s3:GetBucketCors",
            "s3:GetBucketWebsite",
            "s3:GetBucketVersioning",
            "s3:GetBucketLogging",
            "s3:GetBucketTagging",
            "s3:GetReplicationConfiguration",
            "s3:GetBucketObjectLockConfiguration",
            "s3:GetBucketRequestPayment",
            "s3:GetAccelerateConfiguration",
            // Same story, one level down: aws_s3_object's refresh reads
            // per-object tagging and ACL unconditionally too.
            "s3:GetObjectTagging",
            "s3:GetObjectAcl",
          ],
          resources: [
            `arn:aws:s3:::${SITE_BUCKET_NAME}`,
            `arn:aws:s3:::${SITE_BUCKET_NAME}/*`,
          ],
        },
        // -----------------------------------------------------------
        // Everything below this line was added for the resume-request
        // API (code/infra/resume-api.ts) — the site's first dynamic
        // backend. Every ARN is scoped to the one specific resource
        // that construct creates; nothing here is broader than what
        // that one Lambda needs to exist.
        // -----------------------------------------------------------
        {
          sid: "ResumeAssetBucket",
          effect: "Allow",
          // Same action list as SiteBucket above, same reasoning: Terraform
          // reads back far more per-bucket state than this stack sets.
          actions: [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject",
            "s3:ListBucket",
            "s3:GetBucketLocation",
            "s3:GetBucketPolicy",
            "s3:PutBucketPolicy",
            "s3:GetBucketPublicAccessBlock",
            "s3:PutBucketPublicAccessBlock",
            "s3:CreateBucket",
            "s3:PutEncryptionConfiguration",
            "s3:GetEncryptionConfiguration",
            "s3:PutLifecycleConfiguration",
            "s3:GetLifecycleConfiguration",
            "s3:GetBucketAcl",
            "s3:GetBucketCors",
            "s3:GetBucketWebsite",
            "s3:GetBucketVersioning",
            "s3:GetBucketLogging",
            "s3:GetBucketTagging",
            "s3:GetReplicationConfiguration",
            "s3:GetBucketObjectLockConfiguration",
            "s3:GetBucketRequestPayment",
            "s3:GetAccelerateConfiguration",
            "s3:GetObjectTagging",
            "s3:GetObjectAcl",
          ],
          resources: [
            `arn:aws:s3:::${RESUME_BUCKET_NAME}`,
            `arn:aws:s3:::${RESUME_BUCKET_NAME}/*`,
          ],
        },
        {
          sid: "ResumeTelemetryTable",
          effect: "Allow",
          actions: [
            "dynamodb:CreateTable",
            "dynamodb:DeleteTable",
            "dynamodb:DescribeTable",
            "dynamodb:UpdateTable",
            "dynamodb:TagResource",
            "dynamodb:UntagResource",
            "dynamodb:ListTagsOfResource",
            // Terraform's refresh reads these back unconditionally, same
            // gap as the tfstate lock table (see DEPLOYMENT.md).
            "dynamodb:DescribeContinuousBackups",
            "dynamodb:UpdateContinuousBackups",
            "dynamodb:DescribeTimeToLive",
            "dynamodb:UpdateTimeToLive",
          ],
          resources: [
            `arn:aws:dynamodb:${AWS_REGION}:${current.accountId}:table/${RESUME_TABLE_NAME}`,
          ],
        },
        {
          sid: "ResumeLambdaExecutionRole",
          effect: "Allow",
          actions: [
            "iam:CreateRole",
            "iam:DeleteRole",
            "iam:GetRole",
            "iam:PutRolePolicy",
            "iam:DeleteRolePolicy",
            "iam:GetRolePolicy",
            "iam:ListRolePolicies",
            "iam:ListAttachedRolePolicies",
            "iam:ListInstanceProfilesForRole",
            "iam:TagRole",
            "iam:UntagRole",
          ],
          resources: [`arn:aws:iam::${current.accountId}:role/${RESUME_LAMBDA_ROLE_NAME}`],
        },
        {
          // iam:PassRole is the classic privilege-escalation footgun: it
          // must name this ONE role and nothing else, or a compromised
          // deploy role could hand the Lambda a role with much broader
          // permissions than it's supposed to have.
          sid: "PassResumeLambdaRoleToLambda",
          effect: "Allow",
          actions: ["iam:PassRole"],
          resources: [`arn:aws:iam::${current.accountId}:role/${RESUME_LAMBDA_ROLE_NAME}`],
          condition: [
            {
              test: "StringEquals",
              variable: "iam:PassedToService",
              values: ["lambda.amazonaws.com"],
            },
          ],
        },
        {
          sid: "ResumeApiLambda",
          effect: "Allow",
          actions: [
            "lambda:CreateFunction",
            "lambda:GetFunction",
            "lambda:GetFunctionCodeSigningConfig",
            "lambda:ListVersionsByFunction",
            "lambda:UpdateFunctionCode",
            "lambda:UpdateFunctionConfiguration",
            "lambda:DeleteFunction",
            "lambda:TagResource",
            "lambda:UntagResource",
            "lambda:ListTags",
            "lambda:GetPolicy",
            "lambda:AddPermission",
            "lambda:RemovePermission",
            "lambda:CreateFunctionUrlConfig",
            "lambda:GetFunctionUrlConfig",
            "lambda:UpdateFunctionUrlConfig",
            "lambda:DeleteFunctionUrlConfig",
          ],
          resources: [`arn:aws:lambda:${AWS_REGION}:${current.accountId}:function:${RESUME_FUNCTION_NAME}`],
        },
        {
          sid: "ResumeApiLogGroup",
          effect: "Allow",
          actions: [
            "logs:CreateLogGroup",
            "logs:DeleteLogGroup",
            "logs:DescribeLogGroups",
            "logs:PutRetentionPolicy",
            "logs:TagResource",
            "logs:UntagResource",
            "logs:ListTagsForResource",
          ],
          resources: [
            `arn:aws:logs:${AWS_REGION}:${current.accountId}:log-group:${RESUME_LOG_GROUP_NAME}`,
            `arn:aws:logs:${AWS_REGION}:${current.accountId}:log-group:${RESUME_LOG_GROUP_NAME}:*`,
          ],
        },
        {
          sid: "CloudFront",
          effect: "Allow",
          actions: [
            "cloudfront:CreateDistribution",
            "cloudfront:GetDistribution",
            "cloudfront:UpdateDistribution",
            "cloudfront:DeleteDistribution",
            "cloudfront:TagResource",
            "cloudfront:ListTagsForResource",
            "cloudfront:CreateInvalidation",
            "cloudfront:GetInvalidation",
            "cloudfront:ListInvalidations",
            "cloudfront:CreateOriginAccessControl",
            "cloudfront:GetOriginAccessControl",
            "cloudfront:UpdateOriginAccessControl",
            "cloudfront:DeleteOriginAccessControl",
          ],
          resources: ["*"],
        },
        {
          sid: "AcmCertUsEast1",
          effect: "Allow",
          actions: [
            "acm:RequestCertificate",
            "acm:DescribeCertificate",
            "acm:DeleteCertificate",
            "acm:AddTagsToCertificate",
            "acm:ListTagsForCertificate",
          ],
          resources: ["*"],
        },
        {
          sid: "Route53HostedZone",
          effect: "Allow",
          actions: [
            "route53:CreateHostedZone",
            "route53:DeleteHostedZone",
            "route53:GetHostedZone",
            "route53:ListHostedZones",
            "route53:ChangeResourceRecordSets",
            "route53:ListResourceRecordSets",
            "route53:GetChange",
            "route53:ChangeTagsForResource",
            "route53:ListTagsForResource",
          ],
          resources: ["*"],
        },
      ],
    });

    new IamRolePolicy(this, "gh-actions-deploy-policy", {
      name: "ch-ai-in-deploy-permissions",
      role: deployRole.id,
      policy: permissions.json,
    });

    new TerraformOutput(this, "deploy_role_arn", {
      value: deployRole.arn,
      description:
        "Set this as the AWS_DEPLOY_ROLE_ARN variable in the GitHub repo (Settings > Secrets and variables > Actions > Variables).",
    });

    new TerraformOutput(this, "state_bucket_name", {
      value: stateBucket.bucket,
      description: "Set as TF_STATE_BUCKET, and use it in code/infra/main.ts's S3Backend block.",
    });

    new TerraformOutput(this, "state_lock_table_name", {
      value: lockTable.name,
      description: "Set as TF_STATE_LOCK_TABLE, and use it in code/infra/main.ts's S3Backend block.",
    });
  }
}

const app = new App();
new BootstrapStack(app, "ch-ai-bootstrap");
app.synth();
