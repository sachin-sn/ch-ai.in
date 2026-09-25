// Theme switch: a soft cross-fade where the new theme rises slightly into
// place, via the View Transitions API (the browser snapshots the old
// theme; the ::view-transition pseudo-elements are styled under
// html.theme-transition in globals.css). No startViewTransition, or
// prefers-reduced-motion: switch instantly.
export function switchThemeSmoothly(apply: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }
  const root = document.documentElement;
  root.classList.add("theme-transition");
  doc.startViewTransition(apply).finished.finally(() => root.classList.remove("theme-transition"));
}
