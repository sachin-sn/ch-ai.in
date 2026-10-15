---
title: "I Added a Whiteboard and a Code Runner to My Site. The Hardest Bug Was a 403 on localhost"
date: "2026-10-15"
excerpt: "ch-ai.in now has /whiteboard (draw.io) and /playground (JavaScript and TypeScript with IntelliSense and any npm package). Neither has a server. The editor was easy. The bug that took longest was draw.io refusing to load, only on localhost."
tags:
  [
    "interviews",
    "drawio",
    "monaco",
    "web-workers",
    "nextjs",
    "frontend",
    "ch-ai-in",
  ]
draft: false
---

I have sat on interview panels, and right now I am the one being interviewed. Both
sides need the same two things: somewhere to draw a system design, and somewhere to run a bit of
JavaScript. Usually that means three browser tabs and a "can you see my screen?".
So I added both to this site:

- [/whiteboard](/whiteboard): draw.io, with named boards saved in the browser.
- [/playground](/playground): JavaScript and TypeScript with IntelliSense, any npm
  package via `import`, and a Stop button that actually stops.

The site is a static export. There is no server behind it, so both tools had to run
entirely in the browser. I built them with Claude in one afternoon. Most of that
afternoon went into one bug.

## The whiteboard: draw.io in an iframe

I started from `jgraph/drawio-desktop`. That is an Electron app, and you cannot put
an Electron app in a web page. What it wraps is the draw.io web editor, and that
editor has an official embed mode at `embed.diagrams.net`. You load it in an
iframe and talk to it with `postMessage`:

1. The editor loads and sends `{event: "init"}` to the parent page.
2. The page answers with `{action: "load", xml, autosave: 1}`.
3. Every edit comes back as `{event: "autosave", xml}`, which I store in
   `localStorage`, one entry per board.
4. For PNG or SVG export, the page sends `{action: "export"}` and gets a `data:`
   URI back.

Self-hosting draw.io was the other option. The web app is about 110 MB of static
files. For a feature that works fine from draw.io's own host, that was not worth
putting in the repo.

## The bug: menus, but nothing to draw

It worked in every test I ran. On my Mac it did not. draw.io showed its menus and
toolbar, then nothing: an empty shape panel, greyed-out menus, nothing clickable.
My first question was whether I needed an API key. No. Embed mode needs no key and
no sign-up.

That screen is exactly what step 1 looks like when step 2 never happens. draw.io
draws its chrome and waits for `load`. But my page never got `init`, so it never
sent `load`.

The real answer was one line in the browser console:

```
?embed=1&proto=json&...  Failed to load resource: the server responded with a status of 403 ()
```

`embed.diagrams.net` was answering **403 Forbidden** to the iframe. Then three
checks in my own Chrome:

| Page embedding draw.io        | Referer sent | Result      |
| ----------------------------- | ------------ | ----------- |
| `https://example.com`         | yes          | loads       |
| `http://localhost:3000`       | yes          | 403         |
| `http://localhost:3000`       | no           | loads       |

So it was the `Referer` header. A page on `http://localhost` gets refused, and the
same request without a referrer goes through. I do not know why draw.io's host
does this, and I did not find it documented. The fix is one attribute:

```tsx
<iframe src={src} referrerPolicy="no-referrer" ... />
```

My earlier tests passed because they served the draw.io files locally instead of
from `embed.diagrams.net`. They tested my code against the real editor, but not
against the real server. That is the gap the bug came through.

One more change came out of it. If draw.io has not sent `init` within 20 seconds,
the page now says "draw.io didn't load" with a Retry button. A blank canvas looks
like a broken editor. A message tells you where to look.

## The playground: four small pieces

**A Web Worker, not `eval`.** If you run `while (true) {}` on the page's main
thread, the whole tab freezes. In a worker it cannot, and you can kill the worker.
Stop calls `worker.terminate()`. In my test, Stop cleared an infinite loop in about
60 ms. A 10-second timeout does the same if the code never finishes.

**Any npm package, with no bundler.** Before running, I rewrite bare imports:

```js
import _ from "lodash";               // what you type
import _ from "https://esm.sh/lodash"; // what runs
```

[esm.sh](https://esm.sh) serves any npm package as a browser-ready ES module. The
rewritten code becomes a `blob:` URL that the worker imports. That is also why
top-level `await` works.

**IntelliSense for those packages.** The editor is Monaco, the editor inside VS
Code. It already has a TypeScript language service, but it does not know what
`lodash` is. So for each imported package, I fetch its `package.json` from
jsDelivr, follow its `types` entry (or fall back to `@types/lodash`), download the
`.d.ts` files it imports, and register them with Monaco under
`file:///node_modules/...`. Monaco then resolves them like a local install. Type
`_.chu` and `chunk` comes up with its signature. My first version tried too many
file paths and made about 365 failed requests for a few packages. Trying the
likely path first cut that to about 100.

**Output that looks like Node.** `console.log(obj)` in a browser worker gives you
nothing useful to print. I replaced `console.*` in the worker with a small
formatter: nested objects, `Map` and `Set`, circular references, `%s` and `%d`,
and `console.table` drawn as a box. TypeScript is compiled by Monaco's own
TypeScript worker, so nothing extra is downloaded for it.

## What I'm leaving open

No live collaboration. Boards and code live in one browser, so in an interview the
other person sees them through screen share. Real-time editing would need a
backend, which is the one thing this whole design avoids.

Three hosts I do not control: `embed.diagrams.net`, esm.sh and jsDelivr. If one is
down or blocked, that tool does not work. Monaco is pinned to one version.
Packages you import resolve to their latest version unless you pin one, like
`lodash@4`.

Node-only code does not run. No `fs`, no `http`, no `require()`.

## Try it

Draw something on the [whiteboard](/whiteboard), or paste a problem into the
[playground](/playground) and press Ctrl/⌘ + Enter. "Share link" puts the code in
the URL, so you can send someone a starting problem. The full architecture,
with a diagram, is in [how the interview tools are built](/howdidimakethis/interview-tools).
