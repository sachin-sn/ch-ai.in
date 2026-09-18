---
title: "Hello, world"
date: "2026-09-18"
excerpt: "The first post on this blog, and a one-line note on how it's built."
tags: ["meta"]
---

This is a placeholder post so the pipeline has something real to render — replace or delete it once you've got real writing to publish.

Posts here are plain Markdown files in `content/blog/`, checked into the same repo as the rest of the site. Publishing a new one is a normal commit + PR, same review path as any other change, and it goes out through the CI pipeline that's already wired up.

## Why Markdown-in-repo, not a CMS

- No new infrastructure: no extra S3 bucket, no new CloudFront behavior, no Lambda. Just more files in a repo that already deploys itself.
- Every post is fully static HTML at build time, so the title, description, and Open Graph tags are baked into the page CloudFront serves — the LinkedIn share button links to a URL whose preview card LinkedIn's scraper can actually read.
- It rides on the theme system for free — this post looks right in all four themes without any extra work.

The trade-off is the one worth knowing about: publishing means a git push and a CI build, not an instant edit. For a personal blog, that's a fair price for the simplicity.
