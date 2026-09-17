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

## Resume-request feature: additional one-time setup

The `/resume` page gates the resume download behind an email form, backed
by a new Lambda (`code/lambda/resume-api`) that CloudFront routes to at
`/api/resume/*` (see `code/infra/resume-api.ts` and the "Decisions made"
notes it links back to). This added a second dynamic piece to an
otherwise fully static site, so it needs a few things the original setup
above doesn't cover.

### 1. Generate the origin-verify secret

This is the shared secret CloudFront injects as a header on every request
it sends to the resume-api Lambda, so the Lambda can reject anything that
reached its Function URL some other way (Lambda Function URLs have no
equivalent of S3's origin-access-control). Generate one and keep it safe:

```bash
openssl rand -hex 32
```

### 2. Create a Cloudflare Turnstile widget

Turnstile is the captcha used to keep the form from being scraped. In the
[Cloudflare dashboard](https://dash.cloudflare.com/) → Turnstile → Add
site, create a widget for `ch-ai.in`. You'll get two values:

- A **site key** — public, safe to ship in client-side code.
- A **secret key** — used server-side by the Lambda to verify tokens; treat
  it like a password.

### 3. Upload the resume PDF

`code/infra/resume-api.ts` creates a dedicated private bucket for this
(kept separate from the site bucket on purpose — see the comments in that
file). After the first `cdktf deploy` of this feature, upload the resume:

```bash
aws s3 cp /path/to/resume.pdf s3://<resume_bucket_name output>/sachin-nagaraja-resume.pdf
```

(`resume_bucket_name` is a `cdktf output` from `code/infra` — matches the
`RESUME_OBJECT_KEY` constant in `code/infra/main.ts`, currently
`sachin-nagaraja-resume.pdf`, if you rename the file, update that constant.)

### 4. Re-run infra-bootstrap once, locally

The GitHub Actions deploy role's permissions were widened to allow
creating the new Lambda, its execution role, the DynamoDB table, and the
resume bucket (all narrowly scoped to those specific resources — see the
`Resume*` policy statements in `code/infra-bootstrap/main.ts`). This
change has to be applied once, locally, the same way the original
bootstrap was:

```bash
cd code/infra-bootstrap
npm install
npm run deploy
```

### 5. Set the new GitHub repo secrets and variables

Settings → Secrets and variables → Actions:

| Type | Name | Value |
|---|---|---|
| Secret | `TURNSTILE_SECRET_KEY` | Turnstile secret key from step 2 |
| Secret | `RESUME_ORIGIN_VERIFY_SECRET` | value from step 1 |
| Variable | `TURNSTILE_SITE_KEY` | Turnstile site key from step 2 |

The two secrets feed `code/infra/main.ts`'s `TerraformVariable`s
(`turnstile_secret_key`, `origin_verify_secret`) as `TF_VAR_*` env vars in
`infra.yml`. The variable feeds `NEXT_PUBLIC_TURNSTILE_SITE_KEY` at build
time in `app-deploy.yml` — it's public, so a plain repo variable is fine,
unlike the two secrets above.

To run `cdktf diff`/`deploy` locally instead of through CI, export the
same two values as `TF_VAR_turnstile_secret_key` and
`TF_VAR_origin_verify_secret` in your shell first.

### 6. Deploy

Push to `main` as usual — `infra.yml` builds the Lambda bundle and applies
the new resources (behind the same manual-approval gate as any other infra
change), then `app-deploy.yml` picks up the new `/resume` page on its next
run. Do step 3 (upload the resume) after the first successful infra
deploy, since the bucket doesn't exist until then.

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

### OIDC role assumption fails with "Not authorized to perform sts:AssumeRoleWithWebIdentity" despite a correct-looking trust policy

Check the actual token GitHub is sending before assuming the trust policy
is wrong. GitHub repos created after **July 15, 2026** get an "immutable
subject format" OIDC token by default: the owner and repo *names* are
suffixed with their permanent numeric IDs —

```
repo:OWNER@OWNER_ID/REPO@REPO_ID:ref:refs/heads/main
```

— instead of the plain `repo:OWNER/REPO:ref:refs/heads/main` form still
shown in most AWS/GitHub OIDC examples and docs (including earlier
versions of this file). GitHub did this deliberately: it stops someone
from renaming or recreating a repo/org to match an old trust condition and
hijack a role that trusted the name alone.

For this repo, the real value (confirmed via CloudTrail) is:

```
repo:sachin-sn@50323030/ch-ai.in@1372767592:...
```

`code/infra-bootstrap/main.ts`'s `GITHUB_REPO` constant already uses this
form. If this ever breaks again after a change to the repo (rename,
ownership transfer), don't guess the new value — pull the real one from
CloudTrail:

1. AWS Console → CloudTrail → Event history (make sure the region
   selector matches where your role lives, e.g. `ap-south-1` — Event
   History can behave inconsistently for global-service events like STS
   outside the region you're viewing).
2. Filter by Resource name = `ch-ai-in-github-actions-deploy` (more
   reliable than filtering by event name).
3. Open the most recent `AssumeRoleWithWebIdentity` record and read the
   exact `sub` value out of `userIdentity.principalId` or `.userName`.
4. Update `GITHUB_REPO` in `code/infra-bootstrap/main.ts` to match, then
   `npm run deploy` from `infra-bootstrap` — this only updates the IAM
   role's trust policy in place, nothing else gets touched.

Two things that look like clues but aren't, if you go looking: the role's
"Last activity" in the IAM console only reflects usage *after* a
successful assumption, so it stays blank no matter how many failed
assume-role attempts happen — it's not evidence either way. And CloudTrail
Event History's region scoping can make correctly-logged events seem
missing if you're viewing the wrong region.
