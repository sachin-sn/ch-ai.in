---
title: 'From AWS to GCP: rebuilding ch-ai.in''s infrastructure mid-flight'
date: '2026-09-20'
excerpt: >-
  AWS support went quiet on a billing issue, so instead of waiting I rebuilt
  this site's entire infrastructure on GCP. Here's what broke, what I learned,
  and why the old AWS stack is still sitting there, orphaned on purpose.
tags:
  - infrastructure
  - aws
  - gcp
  - devops
  - cdktf
---

This is my first real post here, so it might as well be about the thing that ate most of my evenings this month: moving this site's entire hosting stack from AWS to GCP, live, without really planning to.

## How this started

ch-ai.in began as an idea for a different app entirely — a feedback site themed around Chitragupta, the record-keeper from Hindu mythology who tracks everyone's good and bad deeds. Somewhere in scoping that out, I decided the domain was better used as my own portfolio: a place to host what I build and write about how I built it. So I set it up properly — a static Next.js site, exported and served from S3 behind CloudFront, DNS on Route53, TLS via ACM, all of it defined in code with CDKTF (the TypeScript flavor of Terraform CDK) and deployed through GitHub Actions using short-lived OIDC credentials instead of stored keys. No servers, no consoles, nothing clicked by hand.

From there it grew a couple of real features: a resume page that emails nobody and instead hands out a signed download link on the spot, gated behind Cloudflare Turnstile and a honeypot field, backed by a Lambda function, DynamoDB, and a private S3 bucket sitting behind its own CloudFront route. Then a blog module — this one — built as plain Markdown files rendered at compile time, specifically so posts would have real Open Graph tags baked in when I eventually shared them on LinkedIn.

It was a good, boring, well-behaved AWS setup. Then I hit a wall that had nothing to do with any of it.

## The wall

I ran into a billing/account issue on the AWS side and opened a support case. It sat there. No real response, just repeated nudges to buy a support plan before anyone would actually look at it. I didn't want to pay for the privilege of getting my own account issue looked at, and I didn't want the site's infrastructure held hostage by a ticket queue either.

So I made a call: instead of waiting it out, I'd stand up the same site on GCP and, if it worked, cut over completely. Worst case, I'd end up with a second, working deployment and a decent multi-cloud story to tell in interviews. Best case, the AWS problem would simply stop mattering.

## The rule that made the decision easy

The one thing I didn't want to do was just delete a perfectly good AWS deployment out of spite. So the question for every resource became: is this actually costing me money right now?

I audited the whole stack — S3, CloudFront, Lambda, DynamoDB, ACM, IAM, CloudWatch Logs, Route53 — against AWS's free tier at this traffic level. Everything cleared it except one thing: the Route53 hosted zone, a flat $0.50/month that exists the moment the zone does, traffic or not. Everything else could just sit there, unused but deployed, still `cdktf deploy`-able if I ever wanted to demo the old architecture live. Only DNS had to actually move, so I migrated `ch-ai.in`'s nameservers to GCP Cloud DNS, confirmed the cutover, and deleted the Route53 zone. Everything else from the old stack is still up right now, quietly costing nothing, which is exactly the point.

## Rebuilding it on GCP

The GCP side mirrors the AWS one on purpose: two CDKTF projects instead of one big one, splitting a one-time bootstrap (identity and state setup) from the actual infrastructure, the same pattern the AWS stack used. Workload Identity Federation replaced OIDC as the keyless bridge between GitHub Actions and the cloud — no service account JSON ever touches the repo. The static site moved to Firebase Hosting. DNS went to Cloud DNS rather than a free option like Cloudflare, mostly to keep everything inside one IAM boundary and put some GCP signup credit to use.

The harder piece was the resume backend — the one part of the site with actual server-side logic. Lambda, DynamoDB, and S3 presigned URLs became Cloud Functions (2nd gen), Firestore, and GCS V4 signed URLs, wired in through a Firebase Hosting rewrite instead of a CloudFront custom origin. That swap cost me one real security feature: on AWS, CloudFront injected a shared-secret header the Lambda checked before doing anything else, so the function only ever accepted traffic that actually came through the CDN. Firebase Hosting's rewrites call the function as a plain unauthenticated request with no way to inject that header, so the gate now leans entirely on Turnstile, the honeypot field, and logging every request — a real, documented trade-off, not an oversight.

## The shape of it, end to end

```
GitHub (push to main)
   |
   |  Workload Identity Federation (no stored keys)
   v
GitHub Actions CI --- build static export (Next.js)
   |
   |  firebase deploy --only hosting
   v
Firebase Hosting  <----  Cloud DNS (ch-ai.in)
   |         ^
   |         |
   |      visitor
   |
   |  rewrite: /api/resume/**
   v
Cloud Function (2nd gen)
   Turnstile + honeypot check
   |                    |
   v                    v
Firestore            GCS
(telemetry row)      (V4 signed URL -> resume PDF)


------------------------------------------------------------
orphaned (DNS no longer points here, but still deployed):

AWS: CloudFront -> S3 -> Lambda -> DynamoDB -> ACM -> IAM
Route53's hosted zone (the only thing costing money) is
the one piece actually deleted.
```

## Three things that broke in interesting ways

**The auth check that only trusted a placeholder.** The Workload Identity Federation provider is supposed to verify that deploys are coming from this exact GitHub repo. Mine was deployed checking against literal placeholder text — `REPLACE_ME_github_owner/REPLACE_ME_github_repo` — because the environment variables meant to fill those in were never set the one time it mattered, during the original bootstrap run, and the code's defaults got baked straight into live infrastructure. Every deploy failed with `unauthorized_client` and a fairly unhelpful error until I stopped reading the code and read the actual deployed Terraform state instead. The fix was a one-line default change and a redeploy; finding it took reading the truth instead of my assumptions.

**The permission that was correct and still didn't work.** Cloud Functions (2nd gen) are Cloud Run services wearing a trench coat. I'd granted the standard `cloudfunctions.invoker` role to public callers, which is normally enough — except a 2nd-gen function's actual authorization check lives at the Cloud Run layer underneath, and that grant doesn't reliably propagate down to it. Every request through the Firebase Hosting rewrite kept 403ing until I went and looked at the Cloud Run console directly, saw "Require authentication" staring back at me, and added a second, explicit `run.invoker` binding on the underlying service.

**The secret that looked exactly like the other secret.** Once the previous two were fixed, form submissions started failing server-side with an unhelpful `invalid-input-secret` from Turnstile's verification API. I'd pasted the *site key* — the public one, visible right there in the widget's own script tag — into the field meant for the actual secret key. Both values share the same `0x4AAAAAAA...` shape, so nothing about them looks wrong at a glance. What made it hard to catch was that the verification function swallowed the failure silently, just returning `false` with no logging, which looked identical to someone simply not completing the captcha correctly. Adding logging around every failure path was what actually surfaced it.

## What's live now, and what isn't

`ch-ai.in` runs entirely on GCP today — Firebase Hosting behind Cloud DNS, deployed on every push via GitHub Actions and Workload Identity Federation, with the resume flow fully ported to Cloud Functions, Firestore, and signed GCS URLs. Email forwarding survived the DNS rebuild without a hiccup.

The old AWS stack — CloudFront, S3, Lambda, DynamoDB, ACM, IAM, the works — is still deployed, still defined in code, and still capable of being brought back live with a single `cdktf deploy`. It's just not pointed at by DNS anymore. I like that it's still there. It turned a blocked support ticket into a second, working example of the same site built two different ways, which is a much better answer to "tell me about a time infrastructure went wrong" than "AWS support didn't reply."

## What I actually took away from this

The two gnarliest bugs here weren't really cloud-specific — they were both cases where what I'd written and what was actually deployed or actually running had quietly drifted apart, and the only way out was to go check reality directly instead of trusting the code. That's a habit worth keeping regardless of which cloud you're on. The secret-key mixup was a smaller, sillier lesson: when two values look identical, don't let your own code fail silently on the difference — log it, or it'll cost you an evening.

And practically: having the whole site defined as code, twice now, in two different clouds, is what made a forced migration feel like a weekend project instead of a crisis. If you want the fully technical version — architecture diagrams, the actual CDKTF constructs, the rest of the field notes I didn't cram in here — there's a deeper write-up at [ch-ai.in/howdidimakethis/ch-ai](https://ch-ai.in/howdidimakethis/ch-ai).
