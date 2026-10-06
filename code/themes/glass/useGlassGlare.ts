"use client";

import { useEffect } from "react";

// Pointer-tracked glare for every .gl-glass pane on the page: one passive
// pointermove listener on the document writes the cursor position, relative
// to whichever pane is under it, into that pane's --mx/--my custom
// properties. glass.css paints a soft highlight (and a brighter rim on the
// pane's edge) centred on those coordinates, so light seems to catch the
// glass wherever the cursor goes. Touch/coarse pointers and reduced-motion
// users skip it entirely -- the panes still look like glass, just static.
export default function useGlassGlare() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduceMotion) return;

    let frame = 0;
    let last: PointerEvent | null = null;

    const paint = () => {
      frame = 0;
      if (!last) return;
      const pane = (last.target as Element | null)?.closest?.<HTMLElement>(".gl-glass");
      if (!pane) return;
      const rect = pane.getBoundingClientRect();
      pane.style.setProperty("--mx", `${last.clientX - rect.left}px`);
      pane.style.setProperty("--my", `${last.clientY - rect.top}px`);
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
