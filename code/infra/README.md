# ch-ai.in — infrastructure

CDK for Terraform (CDKTF), TypeScript. Provisions the hosting foundation for
the portfolio: a Route 53 hosted zone, an ACM certificate, a private S3
bucket, and a CloudFront distribution in front of it — no server, no
running compute, just static hosting.

## What this does _not_ do

- It doesn't register the `ch-ai.in` domain — that has to already be bought
  somewhere (a registrar like GoDaddy, Namecheap, Route 53 Domains, etc).
  This script only creates the _hosted zone_ (the DNS records), not the
  domain registration itself.
- It doesn't upload your actual site — just a one-line placeholder page, so
  you have something to look at while the rest gets built. Real deploys
  come later, from CI (see the implementation plan — GitHub Actions syncing
  a build folder to the S3 bucket, then invalidating the CloudFront cache).
- It doesn't set up `www.ch-ai.in`. The cert and CloudFront distribution
  cover the apex domain only. To add `www` later: add it to the
  certificate's `subjectAlternativeNames`, add a second DNS validation
  record for it (this needs a `TerraformIterator` since a cert with
  multiple domains produces multiple validation options — worth doing as
  a follow-up exercise), add `www.ch-ai.in` to the distribution's
  `aliases`, and add matching alias records in Route 53.

## Prerequisites

- Node.js 18+
- An AWS account with credentials available locally — either run
  `aws configure` first, or export `AWS_ACCESS_KEY_ID` /
  `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` as environment variables.
  The AWS provider picks these up automatically; nothing in this code
  handles credentials directly.
- The domain `ch-ai.in` already purchased somewhere.

## Setup

```bash
npm install
npm run compile   # type-check only, no infra touched
npm run synth     # generates the Terraform JSON into cdktf.out/ — safe, read-only
```

- Terraform
- in case you do not have terraform set up / installed in your machine

```
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

## Deploying

```bash
npm run diff      # shows what would be created, like `terraform plan`
npm run deploy    # prompts for confirmation, then applies
```

The first deploy will:

1. Create the Route 53 hosted zone.
2. Request the ACM certificate and create its DNS validation record inside
   that same zone.
3. **Wait for the certificate to validate.** This can only succeed once
   public DNS resolvers can see the validation record — which means your
   registrar needs to be pointed at the new zone's nameservers _first_.

### The nameserver chicken-and-egg problem

Because the hosted zone is created by this same `deploy`, you won't have
its nameservers to give your registrar until after the first apply starts.
In practice:

1. Run `npm run deploy`. It will hang at the certificate validation step
   (this is expected — cancel it with Ctrl+C if it's been more than a
   couple of minutes).
2. Check the partial state for the nameservers:
   `npx cdktf output name_servers` (or check the AWS Route 53 console).
3. Update your domain registrar's nameserver (NS) records to the four
   values it gives you.
4. Wait for propagation — anywhere from a few minutes to a few hours.
5. Run `npm run deploy` again. This time validation should complete
   quickly, since the record is now publicly resolvable.

### After it's up

`npm run deploy` will print three outputs:

- `name_servers` — only needed once, for the registrar step above.
- `cloudfront_domain` — the `*.cloudfront.net` address, useful for
  sanity-checking that the distribution itself works before DNS catches up.
- `s3_bucket_name` — this is what your CI pipeline's deploy step needs to
  sync the built site into.

Visiting `https://ch-ai.in` once DNS has propagated should show the
placeholder page.

## Tearing down

```bash
npm run destroy
```

Removes everything this stack created. The S3 bucket has `forceDestroy:
true` set, so it will delete along with any objects in it — fine while
there's only a placeholder page, worth reconsidering once real content
lives there.
