---
title: "Day 19 — A Canary That Said Promote Three Times Out of Five"
date: "2026-10-10"
excerpt: "A GitHub Actions matrix build that cancelled the job I expected to finish, and a simulated 10% canary whose decision changed between runs although nothing about the versions changed."
tags:
  ["30-day-challenge", "day-19", "ci-cd", "github-actions", "canary", "nodejs"]
draft: false
---

Day 18 looked at one request. Day 19 looks at what happens before and after a
release: a matrix build that tests on more than one Node version, and a small
script that decides whether a canary should go on. This is the second day in the
shorter 90-minute format.

## The matrix build

The test side is tiny: an `add()` function, a test file with Node's built-in test
runner, and one workflow with a matrix of two Node versions. Three things went
wrong before the first green run.

My test failed on my Mac with `Cannot use import statement outside a module`. The
files used `import` and `export`, and `package.json` had no `"type": "module"`.
Adding the line fixed it. My Mac runs Node v22.2.0, which is an old 22. I think
newer 22.x versions detect the module type on their own, which would make this a
case where the same code passes on one machine and fails on another, but I did not
check that.

The workflow file was in a folder called `workflow/`. GitHub only reads
`.github/workflows/`, so it would never have run.

Then the first run was refused: `actions/checkout@v4` and `actions/setup-node@v4`
were "not allowed ... because all actions must be from a repository owned by
sachin-sn". The repository was set to allow only my own actions, and GitHub's
standard actions belong to GitHub. I changed that setting, and both jobs passed.

## One version fails

I added a test that passes on Node 22 and fails on anything else. My prediction:
the job for the other version would still run. It did not. The Node 24 job failed
with the message I wanted (`AssertionError ... v24.21.0`). The Node 22 job ended
with `Error: The operation was canceled.`, and not with its own test result,
although its test would pass.

That fits the default of `strategy.fail-fast`, which is `true` and cancels the
other running jobs when one fails. I am going from my memory of the GitHub docs
here, not from a sentence I checked. After I added `fail-fast: false`, the Node 22
job passed and the Node 24 job failed. So with the default setting, one broken
version can hide the result of the others.

## The canary

The script sends 100 simulated requests. Each goes to v2 with a 10% chance. v1
fails 1% of the time and v2 fails 5%. It rolls back if v2's error rate is more than
2 percentage points above v1's. I ran it five times.

```
run   v2 requests   v1 rate   v2 rate   decision
1     13            3.4%      0.0%      PROMOTE
2     13            2.3%      15.4%     ROLLBACK
3     14            1.2%      14.3%     ROLLBACK
4     15            1.2%      0.0%      PROMOTE
5      6            1.1%      0.0%      PROMOTE
```

My prediction was 20 to 40 requests on v2 per run. Wrong: the counts were 13, 13,
14, 15 and 6, around the 10 that a 10% chance gives you.

The part I will remember: the versions did not change between runs. v2 really
fails 5% and v1 1%. Yet three runs said promote and two said roll back. With 6 to
15 requests on v2, one failure moves its error rate by 7 to 17 points. In run 1,
v1 even had the higher error rate. A rule like "more than 2 points worse" only
means something once v2 has seen enough requests.

## What I'm leaving open

Five canary runs and one run of each workflow setting. I did not work out how many
requests a canary needs before the decision is stable. I did not repeat the
default `fail-fast` run, so I do not know if the Node 22 job is always cancelled
or only when it is still running. The job durations from the run pages are not in
this post.

## What's next

Day 20 is OAuth2, OIDC and JWT: signing tokens and trying to break them. Full
code in the [repo](https://github.com/sachin-sn/30-day-learning-challenge/blob/main/day-19-cicd-matrix-canary) — `day-19-cicd-matrix-canary/`.
