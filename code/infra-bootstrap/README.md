# ch-ai.in — infra bootstrap

A second, separate CDKTF app. It exists only to set up the two things the
main stack (`../infra`) needs before GitHub Actions can drive it:

1. An S3 bucket + DynamoDB table for **remote Terraform state**, shared
   between your laptop and CI (the main stack currently only has local
   state — nothing but this machine has ever applied it).
2. An **IAM OIDC provider + role** that GitHub Actions can assume with a
   short-lived token — no AWS access keys stored as GitHub secrets.

This is a one-time, hand-run thing. It is not meant to live in CI, and it
keeps its own local state (it can't manage the bucket it creates as its
own backend — that's the usual chicken-and-egg with bootstrap stacks).

## Prerequisites

Same as `../infra`: Node 18+, Terraform installed, AWS credentials
available locally (`aws configure`, or `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY` env vars) for an identity with enough IAM/S3/
DynamoDB permissions to create these resources.

## Run it

```bash
npm install
npm run compile   # type-check only
npm run diff       # shows what would be created
npm run deploy     # prompts for confirmation, then applies
```

It will print three outputs when done:

- `deploy_role_arn` — the role GitHub Actions will assume.
- `state_bucket_name` — the new state bucket.
- `state_lock_table_name` — the new lock table.

## What to do with those outputs

1. **Migrate the main stack's state.** Open `../infra/main.ts` and add the
   `S3Backend` block (see that file — it's already there with placeholder
   values if I've made the change, otherwise fill in `state_bucket_name`
   and `state_lock_table_name` from above). Then, from `../infra`, run
   `npx cdktf deploy` once locally — Terraform will detect the backend
   change and ask to copy your existing local state into the new bucket.
   Say yes. This is the only time this migration happens.

2. **Set GitHub repo variables** (Settings → Secrets and variables →
   Actions → Variables — these aren't secret, an OIDC role ARN and bucket
   names aren't sensitive on their own, so plain variables are fine):

   | Variable | Value |
   |---|---|
   | `AWS_DEPLOY_ROLE_ARN` | `deploy_role_arn` output |
   | `AWS_REGION` | `ap-south-1` |
   | `TF_STATE_BUCKET` | `state_bucket_name` output |
   | `TF_STATE_LOCK_TABLE` | `state_lock_table_name` output |
   | `S3_SITE_BUCKET` | `ch-ai-in-site` |
   | `CLOUDFRONT_DISTRIBUTION_ID` | fill in after the *first* successful `infra.yml` run creates the CloudFront distribution — check the AWS console or `cdktf output` in `../infra` |

   Via `gh` CLI instead of the UI, once you have the values:
   ```bash
   gh variable set AWS_DEPLOY_ROLE_ARN --body "<arn>"
   gh variable set AWS_REGION --body "ap-south-1"
   gh variable set TF_STATE_BUCKET --body "<bucket>"
   gh variable set TF_STATE_LOCK_TABLE --body "<table>"
   gh variable set S3_SITE_BUCKET --body "ch-ai-in-site"
   # CLOUDFRONT_DISTRIBUTION_ID comes later, after the first infra deploy
   ```

3. **Create a GitHub Environment named `production`** (Settings →
   Environments → New environment) and add yourself as a required
   reviewer. `infra.yml` deploys through this environment so that an
   actual `cdktf deploy` — which can touch DNS, the certificate, and the
   CDN — always pauses for your manual approval first, no matter what
   pushed the change.

## If an OIDC provider already exists

AWS only allows one IAM OIDC provider per URL per account. If you've
wired up GitHub Actions + AWS OIDC before on this account, `cdktf deploy`
will fail creating `github-oidc` with `EntityAlreadyExists`. In that case,
import the existing one instead of creating a second:

```bash
npx cdktf import github-oidc <existing-provider-arn> --stack ch-ai-bootstrap
```

then re-run `npm run deploy`.

## Tearing down

Don't — this manages your CI's ability to deploy at all, and (if you
migrated state per step 1 above) the main stack's state now lives in the
bucket this creates. If you genuinely want to undo it, migrate state back
to local first, then `npm run destroy`.
