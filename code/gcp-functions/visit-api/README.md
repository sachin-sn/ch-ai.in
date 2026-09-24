# visit-api (GCP)

Cloud Function (2nd gen) behind the `/api/visit` Firebase Hosting rewrite
(see `../../firebase.json`). Powers the visit counter in the site footer
(`components/VisitCounter.tsx`).

## API

| Method | Body / query            | Effect                                        | Response            |
| ------ | ----------------------- | --------------------------------------------- | ------------------- |
| `POST` | `{ "page"?: "blog-x" }` | Increments `visits/site` (and `visits/<page>`) | `{ site, page? }`  |
| `GET`  | `?page=blog-x`          | Read only (edge-cached 60s)                   | `{ site, page? }`   |

The client POSTs once per browser session (a `sessionStorage` flag), and
GETs on every other page load, so refreshes and in-site navigation don't
inflate the count.

`page` must match `^blog-[a-z0-9-]{1,100}$` — reserved for per-post read
counts later; anything else is ignored.

## Storage

Firestore collection `visits` in the project's `(default)` database (the
one `infra-gcp/resume-api.ts` provisions). Docs: `{ count, updatedAt }`.

Firestore sustains roughly one write/sec per document. Far above what a
portfolio sees; if a post ever goes viral, switch to a sharded counter.

## Security model

It's a vanity counter, so the bar is "keep honest noise out", not
"tamper-proof":

- Bot user agents and foreign `Origin` headers get the count back but
  don't increment it. Both are caller-supplied, so a determined `curl`
  loop can still inflate it.
- `maxInstanceCount` is capped low in infra-gcp so a flood can't run up
  a bill; Firestore's free tier covers ~20k writes/day.
- No personal data is stored — no IP, no UA, no cookie. Just a number.

## Build & deploy

```bash
npm install
npm run build          # tsc -> dist/, then dist.zip
cd ../../infra-gcp && npx cdktf deploy
```
