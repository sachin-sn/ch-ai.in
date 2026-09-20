# GCP static site + blog — Phase 1 runbook

Parallel to the existing AWS setup, not a replacement. AWS infra is untouched.
Two new CDKTF projects, matching the `infra` / `infra-bootstrap` split already
used for AWS:

```
code/infra-gcp-bootstrap/   <- hand-run once: WIF trust, deploy SA, state bucket
code/infra-gcp/             <- enables Firebase on the GCP project
```

Drop these two folders in at `code/infra-gcp-bootstrap/` and `code/infra-gcp/`
(sibling to `code/infra/` and `code/infra-bootstrap/`).

## Why the Hosting site isn't in Terraform

`google_firebase_hosting_site` and `google_firebase_hosting_custom_domain` are
both **beta** resources in the Google Terraform provider, and searching around
turns up real reports of them failing outright (a 404 creating the site, for
one). Rather than repeat the cdktf-zip-archiver debugging saga for a
one-time, five-minute action, Terraform handles everything stable (APIs, the
Firebase project link, the state bucket, the CI trust) and the Hosting
site + custom domain get created by hand via the Firebase CLI/console once.
If Google ships GA support for these later, moving them into Terraform is a
small follow-up, not a redesign.

## First: install and authenticate the gcloud CLI locally

```bash
# macOS, via Homebrew (matches your existing setup)
brew install --cask google-cloud-sdk
gcloud init                                   # pick/create the GCP project
gcloud auth application-default login         # so Terraform can use your own creds
```

## Step 1 — bootstrap (run once, by hand)

```bash
cd code/infra-gcp-bootstrap
npm install
# edit main.ts (or export env vars) with your real values:
#   GCP_PROJECT_ID, GCP_REGION, GITHUB_OWNER, GITHUB_REPO
npx cdktf get        # generates ./.gen from the real hashicorp/google provider
npx tsc --noEmit     # sanity check before touching real infra
npx cdktf deploy
```

This can't be validated end-to-end in a sandboxed environment (no network
route to the Terraform Registry to run `cdktf get` for real, and no
`terraform` binary available) - same class of limitation as `cdktf
synth`/`diff` not running fully in the AWS-side sandbox. The code was hand
type-checked against stub bindings matching the current `hashicorp/google`
v6.x resource shapes; treat the first real `cdktf get && cdktf deploy` as the
actual validation, the way the AWS Lambda zip bug was only ever caught by a
real deploy.

**Copy the two printed outputs into GitHub → Settings → Secrets and
variables → Actions → Variables:**
- `workload_identity_provider` → repo variable `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `deploy_service_account_email` → repo variable `GCP_DEPLOY_SERVICE_ACCOUNT`

Neither is a secret — no key file exists anywhere. That's the point of
Workload Identity Federation: GitHub's own OIDC token is what gets trusted,
scoped to your one repo by the `attributeCondition` in `main.ts`.

If a later `cdktf deploy` or CI run comes back with a 403, that means the
deploy service account is missing a permission — add the specific role
Terraform/CI names, the same incremental way the AWS deploy role's IAM
policy was built up. The roles in `main.ts` are a starting guess, not a
verified-complete set.

## Step 2 — main infra (run once, by hand)

```bash
cd code/infra-gcp
npm install
npx cdktf get
npx tsc --noEmit
npx cdktf deploy
```

## Step 3 — create the Hosting site + attach the domain (manual, one-time)

```bash
npm install -g firebase-tools
firebase login
firebase hosting:sites:create <site-id>          # e.g. ch-ai-in
```

Then in the [Firebase console](https://console.firebase.google.com) →
Hosting → Add custom domain → follow the TXT-record verification and A-record
steps shown there. SSL provisions automatically once DNS propagates (minutes
to ~24h).

Copy `firebase-config/firebase.json` and `firebase-config/.firebaserc` from
this delivery into `code/`, filling in the real `site` id and project id.
**Double-check `cleanUrls`/`trailingSlash` in `firebase.json` against your
actual `next.config.js` trailingSlash setting** — I don't have that file, so
these are set to Next's default (`trailingSlash: false`) and worth a quick
diff against a real `npm run build` output before the first deploy.

## Step 4 — wire up GitHub Actions

Copy `github-workflow/gcp-static-deploy.yml` into
`code/.github/workflows/gcp-static-deploy.yml`. It builds the same
`npm run build` your AWS workflow already runs and deploys the `out/` folder
to Firebase Hosting — nothing about the AWS workflow changes.

## Don't forget: `code/tsconfig.json`

Add `"infra-gcp"` and `"infra-gcp-bootstrap"` to its `exclude` array, next to
`infra`, `infra-bootstrap`, `Chitragpta`, and `lambda`. This is exactly the
gap that caused the CI-only `TS2307` failure on the resume Lambda — the
Next app's `tsc` would otherwise try to type-check these two new
projects against dependencies they don't have.

## Cost recap

Firebase Hosting's free tier (10 GB storage, 360 MB/day transfer, custom
domain + SSL + CDN included) comfortably covers a personal portfolio site
indefinitely — not credit-funded, same "always free" character as Lambda's
tier on the AWS side. Nothing in this phase should generate a bill.

## Once this is live and tested

Phase 2 (resume API → Cloud Run + Firestore) picks up from here — separate
conversation, not blocking on this one.
