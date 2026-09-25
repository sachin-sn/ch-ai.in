// Soft-edged circular page transition, shared by the light/dark toggle
// and the blog card open/close.
//
// Uses the View Transitions API: the browser snapshots the page, `update`
// changes the DOM (flip data-mode, or navigate), and then one snapshot is
// masked by a radial gradient centered on `origin`:
//   "out": the NEW page shows inside a circle that grows from the origin
//          to past the farthest corner (spreads out from the point)
//   "in":  the OLD page shows inside a circle that shrinks onto the
//          origin (the new page closes in from the edges onto the point)
// The mask's edge is a wide gradient band, so it reads as a wash rather
// than a line. The radius is a registered custom property (--rt-r,
// @property in globals.css) animated with the native Web Animations API
// -- the only way to animate a ::view-transition pseudo-element; anime.js
// targets real elements and objects.

type Point = { x: number; y: number };
type ViewTransitionLike = { ready: Promise<void>; finished: Promise<void> };
type DocWithVT = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => ViewTransitionLike;
};

export function canRadialTransition(): boolean {
  return (
    typeof (document as DocWithVT).startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function centerOf(el: Element): Point {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

let active = false;
/** True while a radial transition is running (other page animations stand aside). */
export const radialTransitionActive = () => active;

export function radialTransition({
  update,
  direction,
  origin,
  duration = 1100,
  extraClass,
}: {
  update: () => void | Promise<void>;
  direction: "out" | "in";
  /** Evaluated once the new page is in place, so it can measure new DOM. */
  origin: () => Point;
  duration?: number;
  /** Extra class on <html> for the transition's lifetime (e.g. mode-transition). */
  extraClass?: string;
}) {
  const doc = document as DocWithVT;
  if (!canRadialTransition() || !doc.startViewTransition) {
    void update();
    return;
  }

  const root = document.documentElement;
  const feather = Math.round(Math.hypot(window.innerWidth, window.innerHeight) * 0.35);
  root.style.setProperty("--rt-feather", `${feather}px`);
  const classes = ["radial-transition", `radial-${direction}`, ...(extraClass ? [extraClass] : [])];
  root.classList.add(...classes);
  active = true;

  const transition = doc.startViewTransition(update);

  transition.ready
    .then(() => {
      const { x, y } = origin();
      root.style.setProperty("--rt-x", `${x}px`);
      root.style.setProperty("--rt-y", `${y}px`);
      const full = `${Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + feather}px`;
      root.animate(
        { "--rt-r": direction === "out" ? ["0px", full] : [full, "0px"] } as PropertyIndexedKeyframes,
        {
          duration,
          easing: "cubic-bezier(0.45, 0, 0.25, 1)",
          fill: "both",
          pseudoElement:
            direction === "out" ? "::view-transition-new(root)" : "::view-transition-old(root)",
        },
      );
    })
    .catch(() => {
      /* transition skipped -- the update still applied */
    });

  transition.finished.finally(() => {
    active = false;
    root.classList.remove(...classes);
    ["--rt-x", "--rt-y", "--rt-feather"].forEach((p) => root.style.removeProperty(p));
  });
}

/**
 * Resolve once `check` passes, or after `timeout` ms regardless. Polls
 * with setTimeout, not requestAnimationFrame: rendering (and with it rAF)
 * is paused while a view transition's update callback is pending.
 */
export function waitFor(check: () => boolean, timeout = 3000): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = () => {
      if (check() || performance.now() - start > timeout) resolve();
      else window.setTimeout(tick, 16);
    };
    tick();
  });
}
