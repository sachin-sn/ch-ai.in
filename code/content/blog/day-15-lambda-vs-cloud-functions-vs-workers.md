---
title: "Day 15 — The Slow First Request Wasn't a Cold Start"
date: "2026-10-06"
excerpt: "One small function on Cloudflare Workers, AWS Lambda and Google Cloud Run functions. The code crashed on Workers because of a random number, and a slow first request turned out to be mostly something other than a cold start."
tags:
  [
    "30-day-challenge",
    "day-15",
    "serverless",
    "aws-lambda",
    "cloud-functions",
    "cloudflare-workers",
    "typescript",
  ]
draft: false
---

Day 14 described servers as code. Day 15 takes the servers out of the
picture: you give a platform one small function, and it decides where and
when to run it. AWS Lambda, Google Cloud Functions (now called Cloud Run
functions) and Cloudflare Workers all sell this idea. The plan was to write
one function and run it on all three, so that every difference came from the
platform and not from my code.

The function ended up running locally on all three and deployed on all three.
Getting there took longer than the code did. This post covers what I measured,
the parts that come from the documentation, and the limits of my numbers.

## One core, three adapters

All the behaviour is in one file, `core.ts`, with no platform imports:
`GET /hash?input=abc` returns the SHA-256, `GET /info` returns an
`instanceId`, a `requestCount` and an `initMs`, and anything else is a 404.
The `instanceId` and the counter live at module level, so they are created
once per instance. A new `instanceId` means a new instance.

Each platform gets a short adapter that only converts its request into my
`Req` type and my `Res` back into its own format. The shapes are different:

```
AWS Lambda     event.requestContext.http.method, event.rawPath,
               event.queryStringParameters   -> { statusCode, headers, body }
Google         Express req / res             -> res.status(n).send(...)
Cloudflare     Request                       -> new Response(body, { status })
```

I ran all three locally: a fake Function URL event for Lambda,
`functions-framework` for Google, and `wrangler dev` for Cloudflare. For the
input `abc`, all three returned the same hash,
`ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`.

## The code that crashed on Workers

The first `wrangler dev` run failed before it served a request:

```
Uncaught Error: Disallowed operation called within global scope. Asynchronous I/O
(ex: fetch() or connect()), setting a timeout, and generating random values are not
allowed within global scope. To fix this error, perform this operation within a handler.
```

My `core.ts` called `crypto.randomUUID()` at module level to make the
`instanceId`. That worked on Lambda and on Google. Workers does not allow
random values in global scope. The fix was small: create the ID on the first
`/info` request (`instanceId ??= crypto.randomUUID()`). It is still created
once per instance. The "same code everywhere" idea held for the logic, but
not for what the code may do when it loads.

## Deploying to Cloudflare

Two commands: `npx wrangler login`, then `npx wrangler deploy`. On a new
account the first deploy also asks you to register a `workers.dev` subdomain,
with three prompts. The upload and the trigger set-up took about six seconds,
for a bundle of 1.58 KiB. The URL has the form
`<worker-name>.<account-subdomain>.workers.dev`.

## Measuring the first request on Cloudflare

My prediction for each platform was that the first request would be slower:
about 100 ms for the first call, and 5 to 10 ms for the calls after it. I
also predicted that the `instanceId` would be different across requests.

I wrote `bench.ts` to send one request and then 30 more, one after another.
I ran it three times against the deployed Worker:

```
run 1  first 106.8 ms  (requestCount 1)   next 30: median 15.2 ms, p95 48.8 ms
run 2  first  65.8 ms  (requestCount 32)  next 30: median 14.8 ms, p95 44.3 ms
run 3  first  94.0 ms  (requestCount 63)  next 30: median 14.0 ms, p95 40.8 ms
```

Two of the three predictions did not hold. The calls after the first took
about 14 to 15 ms, not 5 to 10. And the `instanceId` stayed the same across
all 93 requests. Only the first one held: the first request was slower in
every run, and run 1 landed on 106.8 ms.

The more interesting number is in runs 2 and 3. Their `requestCount` shows
that they started on the same instance that run 1 had created, so the
instance was already running. Their first requests were still 4 to 7 times
slower than their medians. So the slow first request is not mainly the
function starting. My bench opens a new connection for its first request
(DNS, TCP and TLS), and the next 30 reuse it. That fits the numbers. I did
not time the connection setup on its own, so it is an explanation and not a
measurement.

Two more limits on these numbers. The 14 to 15 ms median includes the trip
from my Mac to the nearest Cloudflare location, so it is not the cost of
running the function. And I do not know how long the Worker had been idle
before run 1: `requestCount: 1` only shows that the instance was new. I never
controlled the idle time on Cloudflare, so this is not a cold-start
measurement.

## The same test on Lambda

The Lambda function ended up in us-east-1, and I ran the bench from my Mac,
so the network distance is large and these numbers cannot be compared with
Cloudflare's. Four runs against the Function URL:

```
run 1  first 726.9 ms  (requestCount 2)   next 30: median 226.6 ms, p95 310.8 ms
run 2  first 781.3 ms  (requestCount 33)  next 30: median 250.1 ms, p95 287.8 ms
run 3  first 956.9 ms  (requestCount 64)  next 30: median 251.9 ms, p95 341.9 ms
run 4  first 688.8 ms  (requestCount 95)  next 30: median 232.0 ms, p95 399.5 ms
```

One instance served all 126 requests. The first request was 3.0 to 3.8 times
the median every time, even when the instance was already running, as on
Cloudflare.

The Lambda log shows why that cannot be the function. For a warm request,
Lambda reports a `Duration` of about 1.2 to 1.5 ms, billed as 2 ms, with 77 MB
of the 128 MB used. The first invocation of a bench run took 1.33 ms inside
Lambda, while my client measured 689 to 957 ms for its first request. So
almost all of the time I measured is outside the function. A first request that
needs a DNS lookup, a TCP connection, a TLS handshake and then the request
would take about three round trips, and the first request was about three
times the median. That fits, but I never timed the connection separately.

## Making Lambda cold-start

Waiting did not produce one. The instance survived the pauses between my runs,
and no log line had an `Init Duration`. So I forced it: I changed an
environment variable on the function, which makes Lambda create new
environments. The next invocation logged this:

```
INIT_START Runtime Version: nodejs:22.mainline.v122
REPORT  Duration: 150.73 ms  Billed Duration: 312 ms  Memory Size: 128 MB
        Max Memory Used: 75 MB  Init Duration: 160.76 ms
```

Starting the runtime and loading the module took 160.76 ms. The first call then
took 150.73 ms inside the handler, against about 1.3 to 1.8 ms for the calls
after it. That is about 311 ms inside Lambda before the first answer, and the
billed duration, 312 ms, is the sum of the two, so the Init time was billed for
this function. A warm request is billed 2 ms. I did not test why the first
handler call was that slow. I also did not capture my client's time for this
particular request, so I cannot say how much of what I would have seen from my
Mac was the cold start and how much was the network.

A slow first invocation is not always a cold start. After a pause of about four
and a half minutes, the first two invocations in the old environment took
180.61 ms and 59.50 ms, with no `Init Duration`. I do not know why.

## The same test on Google

Cloud Run functions was the slowest to set up. The first deploy failed with a
403: "Read access to project ... was denied: please check billing account."
My project had no billing account linked, and the deploy needs one. I linked
mine and ran the deploy again, which then failed because the Cloud Functions
API was not enabled; I had skipped that step. The third attempt worked.

I deployed to asia-south1, so this is again a different distance from my Mac.
Two runs:

```
run 1  first 191.4 ms  (requestCount 2)   next 30: median 44.0 ms, p95 60.9 ms
run 2  first 136.2 ms  (requestCount 33)  next 30: median 41.9 ms, p95 70.7 ms
```

One instance served all 63 requests, and the first request was 3.3 to 4.3 times
the median, including run 2, which started on an instance that was already
running. To get a cold one I redeployed with a changed environment variable,
which creates a new revision:

```
first request: 174.4 ms  (new instanceId, requestCount 1)
next 30: median 46.2 ms, p95 54.0 ms
```

The cold request took 174.4 ms, which sits inside the range of the two first
requests on an already running instance (136.2 and 191.4 ms). With one cold
sample from my Mac, I cannot separate the instance starting from the
connection setup. I did not capture a Google-side start-up time, so there is
no equivalent of Lambda's `Init Duration` here.

## Limits and pricing, from the documentation

I read these on 6 October 2026 on the official pages, and they change, so
check them again before relying on them.

```
                  Lambda               Cloud Run functions     Workers
longest request   900 s                60 min (HTTP)           10 ms CPU (Free);
                                                               5 min CPU, default
                                                               30 s (Paid)
memory            128-10,240 MB        up to 32 GiB            128 MB
request body      6 MB                 32 MB                   100 MB (Free/Pro)
billed on         requests + GB-s      requests + vCPU-s       requests + CPU time
                                       + GiB-s, 100 ms steps
```

The pricing models differ in what they count. Lambda and Cloud Run functions
bill for the time the function runs. Workers bills for CPU time, so a
request that mostly waits on another service costs little. Lambda also bills
the initialisation code outside the handler as duration.

I worked out three workloads, assuming 50 ms per request, 128 MB on Lambda, 256 MiB and 0.167
vCPU on Google (the setup in Google's own pricing example), free tiers fully
available, and 5 ms of CPU per request on Workers:

```
                        Lambda      Cloud Run functions    Workers
1M requests, 50 ms      $0          $0                     $0 (Free) / $5 (Paid)
100M requests, 50 ms    ~$23.55     ~$80.31                ~$41.40
4-minute job, 20/day    $0          $0                     $5 or more
```

Two things stood out. Google rounds up to 100 ms, so a 50 ms request is
billed as 100 ms, and that doubles the compute part at 100M requests. And the
4-minute job fits inside Lambda's and Google's limits, but on Workers it needs
the Paid plan and a CPU limit raised above its 30-second default if the job
computes the whole time. If each Workers request used the full 50 ms of CPU
instead of 5 ms, the 100M-request cost goes from about $41 to about $131. The
arithmetic for all of it is in the repo. The 50 ms was an assumption: the real
function was billed 2 ms per warm request, so those Lambda numbers are about 25
times higher than what this code would cost.

## What I'm leaving open

The three platforms were tested from my Mac at three different distances:
Lambda in us-east-1, Google in asia-south1, and Cloudflare at its nearest
location. So the medians (about 230 ms, 42 ms and 14 ms) say more about
distance than about the platforms, and I did not measure that distance. I did
not time the connection setup separately. I have one forced cold start on
Lambda (with the platform's own `Init Duration`), one on Google (client time
only), and none I controlled on Cloudflare. I did not capture my client's time
for the Lambda cold request. I have not chosen a platform, because these
numbers do not support a choice. What I have is the same function on three
platforms, a clearer idea of what to measure next time (control the idle time,
time the connection separately, and test all three from the same place).

## What's next

Day 16 looks at deploying to the edge, with Cloudflare Workers or Vercel Edge.
Full code in the [repo](#) — `day-15-lambda-vs-cloud-functions-vs-workers/`.
