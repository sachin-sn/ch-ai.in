import { animate } from "animejs";
import { blogTransitionPending } from "./expandCardToPage";

// Entrance-only page transition: nothing delays the click -- the router
// navigates immediately -- and the new page glides in (fade + short rise)
// once it renders. The very first load is handled by a CSS animation on
// <main> (globals.css, "page-in") so there's no flash before hydration;
// this covers client-side route changes after that.
//
// Blog card expand/zoom-back run their own choreography, so this stands
// aside for those.
export function playPageEnter() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (blogTransitionPending()) return;
  const main = document.querySelector<HTMLElement>("body > main, body main");
  if (!main) return;

  const anim = animate(main, {
    opacity: [0, 1],
    y: [14, 0],
    duration: 520,
    ease: "outQuart",
    onComplete: clear,
  });

  // A lingering transform on <main> would become the containing block for
  // any position: fixed children (theme backdrops), so always clean up.
  function clear() {
    main!.style.removeProperty("opacity");
    main!.style.removeProperty("transform");
  }
  return () => {
    anim.pause();
    clear();
  };
}
