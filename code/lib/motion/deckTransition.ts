import { waitFor } from "./radialTransition";

// Slide-show transition for /blueprints: the current slide slides out one
// way while the next slides in from the other, like a carousel. Going to a
// later slide moves left (new slide enters from the right); going back
// moves right.
//
// View Transitions API, same approach as radialTransition/zoomTransition:
// the browser snapshots the page, `navigate` swaps the route, then the old
// and new root snapshots slide via CSS (html.deck-transition in
// globals.css). The site header and the deck's own controls get their own
// view-transition-name while this runs, so they stay put instead of
// sliding with the page.

type ViewTransitionLike = { ready: Promise<void>; finished: Promise<void> };
type DocWithVT = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => ViewTransitionLike;
};

const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

let active = false;
/** True while a deck slide is running (PageEnter stands aside). */
export const deckTransitionActive = () => active;

export function canDeckTransition(): boolean {
  return (
    typeof (document as DocWithVT).startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function deckTransition({
  href,
  direction,
  navigate,
}: {
  href: string;
  direction: "forward" | "back";
  navigate: () => void;
}) {
  const doc = document as DocWithVT;
  if (active) return; // ignore key-repeat / double clicks mid-slide
  if (!canDeckTransition() || !doc.startViewTransition) {
    navigate();
    return;
  }

  const root = document.documentElement;
  const target = normalize(href);
  const classes = ["deck-transition", `deck-${direction}`];
  root.classList.add(...classes);
  active = true;

  const transition = doc.startViewTransition(async () => {
    navigate();
    // New slide rendered and scrolled to the top before the "new"
    // snapshot is taken.
    await waitFor(
      () =>
        normalize(window.location.pathname) === target &&
        document.querySelector(".deck-slide")?.getAttribute("data-deck-href") === target,
    );
    window.scrollTo(0, 0);
  });

  transition.ready.catch(() => {
    /* transition skipped -- navigation still happened */
  });
  transition.finished.finally(() => {
    active = false;
    root.classList.remove(...classes);
  });
}
