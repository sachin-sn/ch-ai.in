# resume-api Lambda

Behind CloudFront at `/api/resume/request` (see `../../infra/resume-api.ts`
and `../../infra/static-site.ts`). Handles the resume-request form on
`/resume`: validates the submission, verifies a Turnstile captcha token,
writes a telemetry row to DynamoDB, and returns a short-lived presigned S3
URL to the resume PDF.

## Why this exists as a separate mini-project

The rest of the site (`code/app`, `code/infra`) has no server at all — it's
a static export. This Lambda is the one exception, kept in its own folder
with its own `package.json` and dependency tree (AWS SDK v3 clients) so
those dependencies never leak into the Next.js app's bundle or the CDKTF
project's dependency tree.

## Build

```bash
npm install
npm run build     # bundles src/handler.ts -> dist/handler.js via esbuild
```

`../../infra/resume-api.ts` zips whatever is in `dist/` as the deployed
Lambda code — run `npm run build` here before `cdktf diff`/`deploy` in
`code/infra` (the GitHub Actions infra workflow does this automatically).

## Security model, in one paragraph

Lambda Function URLs have no equivalent of S3's origin-access-control, so
this one is technically public. What keeps it from being hit directly
(bypassing CloudFront, Turnstile, and whatever caching/WAF sits in front)
is a shared secret: CloudFront injects a custom header
(`X-Origin-Verify`) on every request it forwards to this origin, and the
handler rejects anything missing or mismatching it with a 403 *before*
touching S3, DynamoDB, or Turnstile. The secret lives only in Terraform
variables (`TF_VAR_origin_verify_secret`) — never committed.

## Environment variables (set by Terraform, not by hand)

| Variable | Purpose |
|---|---|
| `TABLE_NAME` | DynamoDB table for telemetry rows |
| `RESUME_BUCKET` / `RESUME_KEY` | Where the resume PDF lives |
| `ORIGIN_VERIFY_SECRET` | Must match CloudFront's injected header |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server-side verification |
