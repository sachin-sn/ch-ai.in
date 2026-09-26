---
title: "Adding Motion to ch-ai.in with anime.js"
date: "2026-09-25"
excerpt: "A visit counter that rolls up, diagrams that draw themselves, blog cards that zoom into the page, and a dark mode that closes in on the button. What anime.js was great at, where it stopped, and the one animation I ripped back out."
tags: ["animejs", "animation", "nextjs", "react", "view-transitions", "frontend"]
draft: true
---

This site was static in the most literal sense: things appeared, and
that was it. The only motion was a few CSS keyframes — a blinking caret
in the pixel theme, some drifting blobs in material. I wanted it to feel
a bit more alive without turning into a motion demo, so I spent a day
wiring in [anime.js](https://animejs.com).

## What anime.js is

A small, MIT-licensed JavaScript animation engine. You give it targets —
DOM elements, SVG, CSS properties, or plain JS objects — and it tweens
them with easings, staggers and timelines. Version 4 was a rewrite into
ES modules, so you import only what you use:

```ts
import { animate, createTimeline, stagger, svg, utils } from "animejs";
```

The pieces I ended up using: `animate()`, `createTimeline()`,
`stagger()`, `svg.createDrawable()` and `svg.createMotionPath()`.

The one rule in a Next.js App Router project: anime.js touches the DOM,
so it only runs in client components, inside `useEffect`.

## 1. The visit counter rolls up

The footer counter used to just pop in. Now it fades in and counts up
from 0 to the real total. The trick is that anime.js happily animates a
plain object, not only elements:

```ts
const tally = { value: 0 };
animate(tally, {
  value: count,
  duration: 1400,
  ease: "outExpo",
  onUpdate: () => {
    numEl.textContent = Math.round(tally.value).toLocaleString();
  },
});
```

The real number is rendered first and only then animated, so if the
animation never runs, you still see the right count. Screen readers get
an `aria-label` with the final value instead of every intermediate one.

## 2. Architecture diagrams that draw themselves

The "how did I make this" pages have hand-drawn inline SVG diagrams.
When one scrolls into view, the boxes fade in one after another, the
arrows draw themselves, and a small dot runs along the main path twice.

```ts
const drawables = svg.createDrawable(solidPaths);
createTimeline({ defaults: { ease: "outQuad" } })
  .add(shapes, { opacity: [0, 1], duration: 350, delay: stagger(25) })
  .add(drawables, { draw: ["0 0", "0 1"], duration: 700, delay: stagger(180) }, "-=150")
  .add(dashedPaths, { opacity: [0, 1], duration: 500 }, "-=300");
```

Two things bit me here:

- **Arrowheads show up early.** `marker-end` renders at the end of the
  path whether the line has reached it or not. So the markers are
  detached while drawing and put back when the timeline finishes.
- **Dashed lines can't be "drawn".** The draw effect works by rewriting
  `stroke-dasharray`, which wipes out the dashes. Dashed paths just fade
  in instead.

The dot is `svg.createMotionPath(path)` spread into an `animate()` call.
It loops twice and then removes itself. I didn't want anything moving
forever.

## 3. Blog cards that zoom into the post

This is the one I'm happiest with. Click a card on the blog list and the
post grows out of that card's rectangle until it fills the screen. Hit
"Back to Writing" and it shrinks back into the card.

The first version was pure anime.js. A route change unmounts the card,
so the card itself can't be what grows. Instead, clone it into a
`position: fixed` overlay on `<body>` (which survives the navigation),
animate that clone from the card's rect to the full viewport, navigate
underneath it, then fade it away. That version still runs as the
fallback.

The version most browsers now get uses the **View Transitions API**. The
browser snapshots the old page, the router navigates, and then I animate
the snapshots: the new page starts clipped to the card's rectangle and
expands, while the list behind zooms in slightly.

## 4. Where anime.js stopped: view transitions

The snapshots live on pseudo-elements like `::view-transition-new(root)`.
anime.js animates real elements and JS objects, and it can't target
those. The native Web Animations API can:

```ts
document.documentElement.animate(
  { clipPath: [cardInset, "inset(0 round 0)"] },
  { duration: 700, easing: "cubic-bezier(0.32, 0.72, 0, 1)",
    pseudoElement: "::view-transition-new(root)" },
);
```

So the zoom and the dark-mode reveal below are native Web Animations
code, not anime.js. anime.js still handles everything on real elements
around them.

The nastiest bug of the day came from here. The view transition's update
callback navigates and then waits for the new page to render. I polled
for that with `requestAnimationFrame`, and it hung. **The browser pauses
rendering while that callback is pending, and rAF callbacks go with
it.** Polling with `setTimeout` fixed it.

## 5. Dark mode closes in, light mode spreads out

Toggling to light, the new colours spread out from the toggle button in
a circle. Toggling to dark does the reverse: the dark closes in from the
edges onto the button. The first version was a hard-edged `clip-path`
circle, which looked mechanical. The current one is a radial-gradient
mask with a wide soft band at the edge, so it reads as a wash rather than
a line.

To animate the gradient's radius, it has to be a registered custom
property:

```css
@property --rt-r {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}
```

Without `@property`, the browser treats `--rt-r` as a string and snaps
between values instead of interpolating. For the dark direction, the
*old* (light) snapshot sits on top and its circle shrinks, so the new
dark page appears from the outside in.

## 6. The one I ripped back out

I also animated the nav: the current page slid up and faded out when you
clicked a link, *then* the router navigated, and the new page faded in.
It looked nice in isolation and felt slow in use, because every click
waited 180ms before anything happened.

It's gone. What replaced it is entrance-only: the click navigates
immediately and the new page glides in (fade plus a 14px rise). On first
load that's a CSS animation, so it runs before hydration with no flash.
On client-side route changes it's anime.js. Theme switches get a soft
cross-fade through a view transition.

Lesson: **never make the user wait for an exit animation.** Animate the
arrival.

## Things I'd tell myself at the start

- **Respect `prefers-reduced-motion` everywhere.** Every one of these
  checks it and falls back to an instant change.
- **Never leave a `transform` on `<main>`.** A transform makes the
  element the containing block for its `position: fixed` children, which
  would pin the themes' fixed backdrops to `<main>` instead of the
  viewport. Every animation on it cleans up its inline styles when it
  finishes, and the CSS load animation uses `backwards` fill, not `both`.
- **Animations that follow a navigation need to know about each other.**
  The page-enter glide checks whether a blog card transition is already
  in flight and stands aside, otherwise two effects stack on the same
  page.
- **Keep the static render correct.** The counter, the diagrams and the
  pages are all right before any animation runs. Motion is layered on
  top, never load-bearing.

anime.js turned out to be the right size for this: small, modular, and
happy to animate anything from an SVG path to a plain `{ value: 0 }`. For
page-level transitions, the View Transitions API does the heavy lifting.
The two work well side by side.
