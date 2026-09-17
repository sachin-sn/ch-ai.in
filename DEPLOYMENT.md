# Deploying ch-ai.in

Two GitHub Actions workflows run this site:

- **`.github/workflows/infra.yml`** — deploys `code/infra` (the CDKTF stack:
  Route53 zone, ACM cert, S3 bucket, CloudFront). PRs get a read-only
  `cdktf diff`; pushes to `main` run `cdktf deploy`, gated behind manual
  approval.
- **`.github/workflows/app-deploy.yml`** — builds the Next.js static export
  and syncs it to the S3 bucket, then invalidates CloudFront. Runs on every
  push to `main` that touches the app code.

Both authenticate to AWS via GitHub's OIDC provider — no access keys are
stored anywhere. This only works after a one-time setup, below.

## One-time setup (do this once, in order)

### 1. Run the bootstrap stack

```bash
cd code/infra-bootstrap
npm install
npm run deploy
```

This creates the remote Terraform state bucket + lock table, and the IAM
role GitHub Actions will assume. Full details: `code/infra-bootstrap/README.md`.
Keep its three outputs handy — you'll need them in the next two steps.

### 2. Point the main stack at the new state backend

`code/infra/main.ts` already has an `S3Backend` block with two placeholders:

```ts
new S3Backend(this, {
  bucket: "REPLACE_WITH_state_bucket_name_OUTPUT",
  key: "ch-ai-portfolio/terraform.tfstate",
  region: "ap-south-1",
  dynamodbTable: "REPLACE_WITH_state_lock_table_name_OUTPUT",
  encrypt: true,
});
```

Replace both placeholders with the `state_bucket_name` and
`state_lock_table_name` outputs from step 1. Then, from `code/infra`, run:

```bash
npx cdktf deploy
```

locally, one more time. Terraform will notice the backend changed and ask
to copy your existing state (the zone, cert, bucket you already have) into
the new bucket — confirm yes. After this, `code/infra` has no local
`.tfstate` at all, and CI can safely apply it.

### 3. Set GitHub repo variables

Settings → Secrets and variables → Actions → **Variables** tab (these are
plain variables, not secrets — an OIDC role ARN and bucket names aren't
sensitive):

| Variable | Value |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `deploy_role_arn` output from step 1 |
| `AWS_REGION` | `ap-south-1` |
| `S3_SITE_BUCKET` | `ch-ai-in-site` |
| `CLOUDFRONT_DISTRIBUTION_ID` | leave unset for now — see step 6 |

(`TF_STATE_BUCKET` / `TF_STATE_LOCK_TABLE` aren't needed as CI variables —
they're baked into `code/infra/main.ts` in step 2.)

### 4. Create a `production` environment

Settings → Environments → New environment → name it `production` → add
yourself as a required reviewer. `infra.yml` deploys through this
environment, so an actual `cdktf deploy` always pauses for your approval
before touching DNS, the cert, or the CDN — regardless of what triggered it.

### 5. Commit and push

Review what's changed (`git status` / `git diff`) and commit when you're
ready — this includes the workflow files, the `.gitignore` fix, the new
`infra-bootstrap` project, the `S3Backend` addition, and the
`next.config.ts` static-export settings. Push to `main`.

### 6. First infra deploy → get the CloudFront distribution ID

Once pushed, `infra.yml` runs, pauses at the `production` environment for
your approval, and — once approved — creates the CloudFront distribution
(this is the piece that wasn't applied yet). Grab its ID from the AWS
console or `npx cdktf output` in `code/infra`, then set it as the
`CLOUDFRONT_DISTRIBUTION_ID` repo variable from step 3. From then on,
`app-deploy.yml` will invalidate the cache automatically on every deploy;
until it's set, deploys still sync to S3, they just skip the invalidation
step (and say so in the workflow log).

## Everyday use after that

- Change something under `code/app` (or components/lib/public/themes) and
  push to `main` → `app-deploy.yml` builds and syncs automatically, no
  approval needed.
- Change something under `code/infra` and push to `main` → `infra.yml`
  runs `cdktf diff` on the PR, then waits for your approval on `main`
  before applying.

## Troubleshooting

### "Your account must be verified before you can add new CloudFront resources" (403 AccessDenied)

Not a bug in this setup — it's AWS's own anti-fraud gate for accounts that
are new or haven't spent much yet. The first time you try to create a
CloudFront distribution, AWS may require a manual account verification
before it'll provision one.

Fix: open a case with AWS Support (console → Support → Create case) and
include the exact error message. Once they clear the account, just re-run
`npm run deploy` (or let `infra.yml` re-run in CI) — everything created
before hitting this (the Route53 zone, ACM cert, S3 bucket, OAC) is
already in state, so Terraform will only create the missing distribution,
nothing gets recreated.

While waiting: you can still set the `AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`,
and `S3_SITE_BUCKET` repo variables and create the `production`
environment (steps 3–4 above) — none of that depends on the distribution
existing. Just hold off on pushing to `main` (or expect `infra.yml`'s
first run to fail the same way) until the account is verified.

### DynamoDB `AccessDenied` on the lock table (CreateTable, or later DescribeContinuousBackups / DescribeTimeToLive)

The identity you run `cdktf deploy` as locally needs explicit DynamoDB
permissions on the lock table — they don't come bundled with typical
S3/IAM-focused policies. If you see `AccessDeniedException` for
`dynamodb:CreateTable`, `dynamodb:DescribeContinuousBackups`, or
`dynamodb:DescribeTimeToLive` against `ch-ai-in-tfstate-lock`, attach an
inline policy to that IAM user/role granting on
`arn:aws:dynamodb:ap-south-1:<account-id>:table/ch-ai-in-tfstate-lock`:

```
dynamodb:CreateTable, DescribeTable, DeleteTable, TagResource,
UntagResource, ListTagsOfResource, DescribeContinuousBackups,
UpdateContinuousBackups, DescribeTimeToLive, UpdateTimeToLive,
PutItem, GetItem, DeleteItem, UpdateItem
```

Terraform reads back point-in-time-recovery and TTL settings on every
refresh even when your table config doesn't set them, so both Describe
permissions are needed even for a table with no special settings.
