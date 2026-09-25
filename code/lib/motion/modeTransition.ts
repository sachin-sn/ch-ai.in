import { centerOf, radialTransition } from "./radialTransition";

// Light/dark switch: light spreads out from the toggle button ("out"),
// dark closes in from the edges onto it ("in"). The soft circular mask
// itself lives in radialTransition.ts; "mode-transition" additionally
// pauses the themes' own color fades (globals.css) so the old color
// doesn't show inside the circle.
export function switchModeFromPoint(
  origin: HTMLElement,
  apply: () => void,
  direction: "out" | "in" = "out",
) {
  const point = centerOf(origin);
  radialTransition({ update: apply, direction, origin: () => point, extraClass: "mode-transition" });
}
