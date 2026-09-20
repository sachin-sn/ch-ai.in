# resume-api Cloud Function (2nd gen)

Behind Firebase Hosting at `/api/resume/request` via a rewrite in
`../../firebase.json` (see `../../infra-gcp/resume-api.ts` for the
Terraform-managed function, bucket, and Firestore database). Handles the
resume-request form on `/resume`: validates the submission, verifies a
Turnstile captcha token, writes a telemetry row to Firestore, and returns
a short-lived V4 signed GCS URL to the resume PDF.

This is the GCP port of `../../lambda/resume-api` (the original AWS
Lambda). The AWS version is still deployed and still works -- this one is
what the live `ch-ai.in` domain actually calls now that the site's DNS
points at Firebase Hosting instead of CloudFront.

## Why this exists as a separate mini-project

Same reasoning as the Lambda version: the rest of the site has no server
at all -- it's a static export. This function is the one exception, kept
in its own folder with its own `package.json` and dependency tree so
those dependencies never leak into the Next.js app's bundle or the
`infra-gcp` CDKTF project's dependency tree.

## Build

```bash
npm install
npm run build   # tsc -> dist/, then zips dist/ (+ package.json) to dist.zip
```

`../../infra-gcp/resume-api.ts` uploads whatever `dist.zip` contains as
the deployed function's source -- run `npm run build` here before
`cdktf diff`/`deploy` in `code/infra-gcp`. Cloud Functions' build step
runs `npm install` itself from the `package.json` inside the zip
(buildpacks), so `dist.zip` only needs to carry `dist/index.js` and
`package.json` -- no `node_modules`.

## Security model, in one paragraph

Firebase Hosting rewrites don't support injecting a custom header the way
CloudFront could on AWS, so this function has to allow unauthenticated
invocation for the Hosting rewrite to reach it at all -- which makes its
own Cloud Run URL just as reachable directly, unlike the AWS version's
`X-Origin-Verify` trick. In practice that's a minor difference: Turnstile
and the honeypot field are the real gate on both clouds. The function's
service account is scoped to exactly what it needs -- read the one resume
object (signed URLs are signed with this identity, via IAM `signBlob`,
so it needs real read rights for the link to work), write to one
Firestore collection, and sign blobs as itself.

## Environment variables (set by Terraform, not by hand)

| Variable | Purpose |
|---|---|
| `RESUME_BUCKET` / `RESUME_KEY` | Where the resume PDF lives in GCS |
| `FIRESTORE_COLLECTION` | Collection telemetry rows are written to |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server-side verification |
