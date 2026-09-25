import { animate, createTimeline, stagger } from "animejs";
import { radialTransitionActive, waitFor } from "./radialTransition";
import { zoomTransition, zoomTransitionActive } from "./zoomTransition";

const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// "Card grows into the page" transition for the blog index.
//
// A route change unmounts the card, so the card itself can't be what
// grows. Instead we clone it into a fixed-position overlay on <body>
// (which survives the navigation), grow that clone from the card's rect
// to the full viewport while its colors blend into the page background,
// navigate underneath it, then fade the overlay out and ease the new
// post's content in. Plain FLIP-style work driven by anime.js; Next's
// router does the actual navigation via `navigate`.
// True while a card expand is on screen; the site-wide page-enter
// animation (components/PageEnter) stands aside so the two don't stack.
let expanding = false;

// Whether a blog card transition owns the next page change: an expand in
// flight, or a fresh "returning from a post" record that the list is
// about to zoom back onto (peeked, not consumed).
export function blogTransitionPending(): boolean {
  if (expanding || radialTransitionActive() || zoomTransitionActive()) return true;
  try {
    const raw = window.sessionStorage.getItem(RETURN_KEY);
    if (!raw) return false;
    const { t } = JSON.parse(raw) as { t?: number };
    return typeof t === "number" && Date.now() - t < RETURN_WINDOW_MS;
  } catch {
    return false;
  }
}

export function expandCardToPage(card: HTMLElement, href: string, navigate: () => void) {
  expanding = true;
  const rect = card.getBoundingClientRect();
  const pageBg = getComputedStyle(document.body).backgroundColor;

  const overlay = card.cloneNode(true) as HTMLElement;
  overlay.setAttribute("aria-hidden", "true");
  overlay.inert = true;
  Object.assign(overlay.style, {
    position: "fixed",
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    zIndex: "60",
    overflow: "hidden",
    pointerEvents: "none",
    boxSizing: "border-box",
    transition: "none",
    boxShadow: "none",
  });
  document.body.appendChild(overlay);
  card.style.visibility = "hidden";

  createTimeline({ defaults: { ease: "inOutQuart" } })
    .add(Array.from(overlay.children), { opacity: 0, y: -8, duration: 200, ease: "outQuad" })
    .add(
      overlay,
      {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        backgroundColor: pageBg,
        borderColor: pageBg,
        duration: 520,
      },
      "<<+=60",
    )
    .call(() => {
      navigate();
      card.style.visibility = "";
      revealWhenReady(overlay, href);
    });
}

// Wait until the new route has actually rendered (pathname matches and
// the post's <article> is in the DOM), then drop the overlay and stagger
// the post in. Falls back after 3s so a slow load never leaves the page
// covered.
function revealWhenReady(overlay: HTMLElement, href: string) {
  const target = normalize(href);
  const started = performance.now();

  const tick = () => {
    const arrived =
      normalize(window.location.pathname) === target && document.querySelector("article h1");
    if (!arrived && performance.now() - started < 3000) {
      requestAnimationFrame(tick);
      return;
    }

    const parts = document.querySelectorAll<HTMLElement>("article > *");
    if (arrived && parts.length) {
      animate(parts, {
        opacity: [0, 1],
        y: [14, 0],
        duration: 450,
        delay: stagger(60),
        ease: "outQuad",
        onComplete: () => parts.forEach((p) => p.style.removeProperty("transform")),
      });
    }
    animate(overlay, {
      opacity: 0,
      duration: 300,
      ease: "outQuad",
      onComplete: () => {
        overlay.remove();
        expanding = false;
      },
    });
  };

  requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------
// The reverse: zoom back out to the card when returning to the list.
//
// Leaving a post (Back link, browser back, the nav) records which post
// it was with a timestamp. When a list mounts within RETURN_WINDOW_MS and
// that post's card is on screen, a full-viewport panel in the page color
// shrinks down onto the card while taking on the card's own colors and
// corners, then hands off to the real card. The timestamp keeps a stale
// record from replaying the effect on some unrelated later visit.
const RETURN_KEY = "ch-ai:blog-return";
const RETURN_WINDOW_MS = 1500;

export function markLeavingPost(slug: string) {
  try {
    window.sessionStorage.setItem(RETURN_KEY, JSON.stringify({ slug, t: Date.now() }));
  } catch {
    /* storage blocked -- the list just renders without the zoom */
  }
}

function takeReturnSlug(): string | null {
  try {
    const raw = window.sessionStorage.getItem(RETURN_KEY);
    window.sessionStorage.removeItem(RETURN_KEY);
    if (!raw) return null;
    const { slug, t } = JSON.parse(raw) as { slug?: string; t?: number };
    if (typeof slug !== "string" || typeof t !== "number") return null;
    return Date.now() - t < RETURN_WINDOW_MS ? slug : null;
  } catch {
    return null;
  }
}

// Returns a cleanup that removes the overlay if the list unmounts mid-zoom.
export function zoomBackToCard(): (() => void) | undefined {
  const slug = takeReturnSlug();
  // A zoom-out close (Back link) is already animating this return.
  if (!slug || prefersReducedMotion() || zoomTransitionActive()) return;
  const card = document.querySelector<HTMLElement>(`[data-post-card="${CSS.escape(slug)}"]`);
  if (!card) return;

  const pageBg = getComputedStyle(document.body).backgroundColor;

  // Cover the list straight away (same frame as mount) so it never
  // flashes before the zoom starts.
  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: `${window.innerWidth}px`,
    height: `${window.innerHeight}px`,
    zIndex: "60",
    pointerEvents: "none",
    boxSizing: "border-box",
    border: `1px solid ${pageBg}`,
    background: pageBg,
  });
  document.body.appendChild(overlay);
  const content = Array.from(card.children) as HTMLElement[];
  content.forEach((el) => (el.style.opacity = "0"));

  let raf = 0;
  // Two frames: let Next finish any scroll restoration before measuring.
  raf = requestAnimationFrame(() => {
    raf = requestAnimationFrame(() => {
      const r0 = card.getBoundingClientRect();
      if (r0.top < 0 || r0.bottom > window.innerHeight) {
        card.scrollIntoView({ block: "center" });
      }
      const rect = card.getBoundingClientRect();
      const cs = getComputedStyle(card);

      createTimeline({ defaults: { ease: "inOutQuart" } })
        .add(overlay, {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: cs.borderTopLeftRadius,
          backgroundColor: cs.backgroundColor,
          borderColor: cs.borderTopColor,
          duration: 520,
        })
        .add(overlay, { opacity: 0, duration: 200, ease: "outQuad", onComplete: () => overlay.remove() })
        .add(
          content,
          {
            opacity: [0, 1],
            y: [8, 0],
            duration: 320,
            delay: stagger(60),
            ease: "outQuad",
            onComplete: () => content.forEach((el) => el.style.removeProperty("transform")),
          },
          "<<",
        );
    });
  });

  return () => {
    cancelAnimationFrame(raf);
    overlay.remove();
    content.forEach((el) => {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
    });
  };
}

// Quick fade-out of the post before an in-app Back navigation, so the
// page doesn't just vanish before the list zooms in.
export function fadeOutArticle(done: () => void) {
  const parts = document.querySelectorAll<HTMLElement>("article > *");
  if (!parts.length || prefersReducedMotion()) {
    done();
    return;
  }
  animate(parts, {
    opacity: 0,
    y: -8,
    duration: 180,
    delay: stagger(25, { reversed: true }),
    ease: "inQuad",
    onComplete: done,
  });
}

// ---------------------------------------------------------------------
// Zoom in fill / zoom out fill (lib/motion/zoomTransition.ts). Used
// wherever the browser has View Transitions; the overlay expand/zoom
// above is the fallback, and still handles the browser Back button
// (which can't be wrapped in a view transition from here).

/** Card -> post: the post zooms out of the card to fill the screen. */
export function openPostZoom(card: HTMLElement, href: string, navigate: () => void) {
  const r = card.getBoundingClientRect();
  const target = normalize(href);
  zoomTransition({
    direction: "in",
    rect: () => r,
    update: async () => {
      navigate();
      await waitFor(
        () => normalize(window.location.pathname) === target && !!document.querySelector("article h1"),
      );
    },
  });
}

/** Post -> list (Back link): the post zooms back down into its card. */
export function closePostZoom(slug: string, listHref: string, navigate: () => void) {
  const target = normalize(listHref);
  zoomTransition({
    direction: "out",
    update: async () => {
      navigate();
      await waitFor(
        () => normalize(window.location.pathname) === target && !!document.getElementById("blog-search"),
      );
    },
    rect: () => {
      const card = document.querySelector(`[data-post-card="${CSS.escape(slug)}"]`);
      if (!card) {
        // Card not rendered (e.g. behind "Load more"): shrink to the middle.
        const w = window.innerWidth * 0.6;
        const h = window.innerHeight * 0.25;
        return { left: (window.innerWidth - w) / 2, top: (window.innerHeight - h) / 2, width: w, height: h };
      }
      const r0 = card.getBoundingClientRect();
      if (r0.top < 0 || r0.bottom > window.innerHeight) card.scrollIntoView({ block: "center" });
      return card.getBoundingClientRect();
    },
  });
}
