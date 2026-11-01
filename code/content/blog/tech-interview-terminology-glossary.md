---
title: "An Interviewer Told Me I Knew the Concepts but Missed the Terminology. So I Built a 2,620-Term Glossary"
date: "2026-11-01"
excerpt: "A free glossary of 47 topics, from JavaScript and AWS to OWASP and Playwright. Every term has a definition and a small example. Read it on the site or download it as a 139-page PDF."
tags:
  [
    "interviews",
    "glossary",
    "javascript",
    "typescript",
    "aws",
    "testing",
    "owasp",
    "claude",
    "ch-ai-in",
  ]
draft: false
---

After a second-round interview, the feedback was short: I knew how things work, but I did not
use the right words for them. I could explain what a closure does. I did not always say
"closure". I had shipped circuit breakers and sagas, and I described them with long
sentences instead of their names.

I have sat on the other side of the table too, in 20+ interviews at my last job. The
candidates who sound senior are usually the ones who name things precisely. So I fixed my
gap the way I fix most problems: I wrote it down, with Claude, until it was complete.

## What it is

A glossary of **47 topics and about 2,620 terms**. Every row has the same three columns:

| Column     | What it gives you                        |
| ---------- | ---------------------------------------- |
| Term       | The word an interviewer expects to hear  |
| Definition | One plain sentence                       |
| Example    | A small piece of code or a real scenario |

Read it on the site: [Tech interview terminology glossary](/blueprints/tech-terminology-glossary).
It is the first file in the [blueprints](/blueprints) deck.

The topics are grouped into eight parts:

1. **Languages and frameworks**: JavaScript, arrays and data structures, Node.js, React, Redux, TypeScript, and TypeScript in depth.
2. **Algorithms, design and architecture**: DSA terms, design principles, SOLID, design patterns, JavaScript patterns, distributed and resilience patterns (saga, circuit breaker), architecture styles, HLD and LLD.
3. **AWS**: core concepts, then seven deep dives: Lambda and Step Functions, DynamoDB and S3, EC2 and EKS, API Gateway and CloudFront, EventBridge, SQS and SNS, KMS and IAM.
4. **Data and messaging**: PostgreSQL, MongoDB, Kafka.
5. **Platform and delivery**: Kubernetes, DevOps, CI/CD, types of deployment, Git, SDLC, Agile.
6. **Testing and quality**: the test pyramid, types of testing, Jest, Mocha, Chai and Sinon, Playwright, Cypress, Selenium.
7. **APIs and security**: REST, GraphQL, WebSocket, and OWASP (the Top 10 for 2021 and 2025, the API Top 10, and the LLM Top 10).
8. **AI**: Gen AI, AI pillars and guardrails, spec-driven development.

## Download it

If you want to print it and read it on a train, there is a PDF: 139 pages, A4, with a
contents page. [Download it from the glossary page](/blueprints/tech-terminology-glossary).
There is no email form. The page shows how many times it has been downloaded.

## How I made it

The glossary lives in a document that I grew one chapter at a time. Each time I thought of
a topic I had been asked about, I added a chapter. That is how it went from 27 topics to
47 in a few days.

From that one source I produce two things:

- **The blueprint page.** The document is exported as Markdown and committed to this repo.
  The site renders it with the same pipeline as every other blueprint.
- **The PDF.** The same Markdown goes through the same Markdown-to-HTML step, then through
  WeasyPrint, which turns HTML and CSS into print-ready pages. The contents page numbers
  come from the layout itself, so they cannot drift from the chapters.

Having one source means a fix lands in both places once, instead of me editing two copies.

## What went wrong

**A fact that had changed.** The AWS chapter said an SQS message can be up to 256 KB. That
was true for years. AWS raised the limit to 1 MiB in August 2025. I only caught it because I
checked the number before printing it. I now check numbers, limits and "latest version" claims
against a source before they go in, and I do not trust my memory for those.

**A table that ran off the page.** My first PDF had tables that spilled past the right
margin. The column widths added up to 100%, but the cell padding was extra. One line of
CSS (`box-sizing: border-box`) fixed it. A later table with four columns broke the same
way, because my widths were written for three.

**Margins that looked wrong.** I had set mirrored margins, like a printed book, with a
wider inner edge. On a phone, the contents page jumped sideways when I swiped from one page
to the next. It looked like a bug. I switched to the same margin on both sides. The cost
is that there is no extra room for binding.

**The download counter.** The site is static, so a counter needs a small backend. I did not
build a new one. The footer visit counter already runs as a small function with a Firestore
database. I added a second counter name to it, so a download never changes the visit total.
It stores a number and nothing else: no IP address, no user agent, no cookie.

## What I would not trust it for

This is a study aid, not a reference. The definitions are short on purpose, and a short
definition leaves things out. Use it to find the word, then read the real documentation
for the detail. Some topics move fast (OWASP, AWS limits, Node features), so check anything
you plan to quote against the official source.

It also reflects what I was asked about. There is a lot of Node, React, AWS and
API security in it. If your stack is different, some chapters will matter
less to you.

## How I am using it

I read one part a day and say each term in a sentence about something I built. If I cannot
do that, I have found a gap. I would rather find the gap at home than in the interview.

If a term is missing or wrong, tell me. It is a living document, and the next version
will include your fix.
