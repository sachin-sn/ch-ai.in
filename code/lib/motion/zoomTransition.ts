// "Zoom in fill" / "zoom out fill" page transition for the blog cards.
//
// View Transitions API: the browser snapshots the page, `update`
// navigates, then the two snapshots are animated (native Web Animations
// on the ::view-transition pseudo-elements -- anime.js can't target
// those):
//   "in"  (open):  the new page starts clipped to the card's rectangle,
//                  slightly scaled down around the card, and grows until
//                  it fills the viewport; the old page zooms in a touch
//                  behind it, as if the camera is moving into the card.
//   "out" (close): the reverse -- the current page shrinks back into the
//                  card's rectangle and fades as it lands, while the list
//                  behind settles from a slight zoom back to normal.

type Rect = { top: number; left: number; width: number; height: number };
type ViewTransitionLike = { ready: Promise<void>; finished: Promise<void> };
type DocWithVT = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => ViewTransitionLike;
};

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const DURATION = 700;
const CARD_RADIUS = "8px"; // matches PostCard's rounded-lg

let active = false;
/** True while a zoom transition is running (other page animations stand aside). */
export const zoomTransitionActive = () => active;

export function canZoomTransition(): boolean {
  return (
    typeof (document as DocWithVT).startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function insetFor(r: Rect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const top = Math.max(0, r.top);
  const left = Math.max(0, r.left);
  const right = Math.max(0, vw - (r.left + r.width));
  const bottom = Math.max(0, vh - (r.top + r.height));
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${CARD_RADIUS})`;
}
const FULL = "inset(0px 0px 0px 0px round 0px)";

function originFor(r: Rect) {
  return `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
}

export function zoomTransition({
  update,
  direction,
  rect,
}: {
  update: () => void | Promise<void>;
  direction: "in" | "out";
  /** The card's rect. For "out" it's evaluated after the list renders. */
  rect: () => Rect;
}) {
  const doc = document as DocWithVT;
  if (!canZoomTransition() || !doc.startViewTransition) {
    void update();
    return;
  }

  const root = document.documentElement;
  const classes = ["zoom-transition", `zoom-${direction}`];
  // "in" knows the card up front: start the new layer already clipped to
  // it (CSS reads --zt-clip) so nothing flashes before the animation runs.
  if (direction === "in") root.style.setProperty("--zt-clip", insetFor(rect()));
  root.classList.add(...classes);
  active = true;

  const openRect = direction === "in" ? rect() : null;
  const transition = doc.startViewTransition(update);

  transition.ready
    .then(() => {
      const r = openRect ?? rect();
      const clip = insetFor(r);
      const origin = originFor(r);
      const opts = { duration: DURATION, easing: EASE, fill: "both" as const };

      if (direction === "in") {
        root.animate(
          { clipPath: [clip, FULL], transform: ["scale(0.92)", "scale(1)"], transformOrigin: [origin, origin] },
          { ...opts, pseudoElement: "::view-transition-new(root)" },
        );
        root.animate(
          { transform: ["scale(1)", "scale(1.06)"], transformOrigin: [origin, origin], opacity: [1, 0.6] },
          { ...opts, pseudoElement: "::view-transition-old(root)" },
        );
      } else {
        // Keyframe list (not property-indexed) so the fade can start at 75%
        // while the clip/scale run the whole way; the eased timing
        // function applies across the whole list.
        root.animate(
          [
            { offset: 0, clipPath: FULL, transform: "scale(1)", transformOrigin: origin, opacity: 1 },
            { offset: 0.75, opacity: 1 },
            { offset: 1, clipPath: clip, transform: "scale(0.92)", transformOrigin: origin, opacity: 0 },
          ],
          { ...opts, pseudoElement: "::view-transition-old(root)" },
        );
        root.animate(
          { transform: ["scale(1.06)", "scale(1)"], transformOrigin: [origin, origin], opacity: [0.6, 1] },
          { ...opts, pseudoElement: "::view-transition-new(root)" },
        );
      }
    })
    .catch(() => {
      /* transition skipped -- navigation still happened */
    });

  transition.finished.finally(() => {
    active = false;
    root.classList.remove(...classes);
    root.style.removeProperty("--zt-clip");
  });
}
