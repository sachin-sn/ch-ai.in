"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, createTimeline, stagger, svg, utils } from "animejs";

// Wraps one of the hand-drawn showcase SVGs and plays it in when it
// scrolls into view (one-shot):
//   1. boxes and labels fade in, staggered
//   2. solid arrows draw themselves (svg.createDrawable); dashed ones,
//      whose dasharray the draw effect would clobber, just fade in
//   3. a small "packet" dot runs along every path marked data-flow,
//      a couple of times, then disappears -- no endless motion
// Everything starts hidden only once JS has run, so without JS or with
// prefers-reduced-motion the diagram renders as the plain static SVG.
export default function DiagramAnimator({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const svgEl = root?.querySelector("svg");
    if (!root || !svgEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const shapes = Array.from(svgEl.querySelectorAll<SVGElement>("rect, text"));
    const paths = Array.from(svgEl.querySelectorAll<SVGPathElement>("path")).filter(
      (p) => !p.closest("defs"),
    );
    const solid = paths.filter((p) => !p.getAttribute("stroke-dasharray"));
    const dashed = paths.filter((p) => p.getAttribute("stroke-dasharray"));
    const flows = paths.filter((p) => p.hasAttribute("data-flow"));

    // Arrowheads would sit at the far end before the line reaches them, so
    // detach markers while drawing and put them back afterwards.
    const markers = new Map(paths.map((p) => [p, p.getAttribute("marker-end")]));
    const restoreMarkers = () =>
      markers.forEach((m, p) => {
        if (m) p.setAttribute("marker-end", m);
      });

    utils.set([...shapes, ...dashed], { opacity: 0 });
    utils.set(solid, { opacity: 0 });
    paths.forEach((p) => p.removeAttribute("marker-end"));

    const packets: SVGCircleElement[] = [];
    let tl: ReturnType<typeof createTimeline> | null = null;
    const loops: ReturnType<typeof animate>[] = [];

    const play = () => {
      const drawables = svg.createDrawable(solid);
      utils.set(drawables, { draw: "0 0" });
      tl = createTimeline({ defaults: { ease: "outQuad" } })
        .add(shapes, { opacity: [0, 1], duration: 350, delay: stagger(25) })
        .add(solid, { opacity: [0, 1], duration: 1 }, "-=150")
        .add(drawables, { draw: ["0 0", "0 1"], duration: 700, ease: "inOutQuad", delay: stagger(180) }, "<")
        .add(dashed, { opacity: [0, 1], duration: 500 }, "-=300")
        .call(() => {
          restoreMarkers();
          flows.forEach((path) => {
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("r", "3.5");
            dot.setAttribute("fill", "var(--sc-accent-bright)");
            path.parentNode?.appendChild(dot);
            packets.push(dot);
            loops.push(
              animate(dot, {
                ...svg.createMotionPath(path),
                opacity: [{ to: 1, duration: 150 }, { to: 1, duration: 1100 }, { to: 0, duration: 150 }],
                duration: 1400,
                ease: "inOutSine",
                loop: 2,
                loopDelay: 400,
                onComplete: () => dot.remove(),
              }),
            );
          });
        });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          play();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      tl?.pause();
      loops.forEach((a) => a.pause());
      packets.forEach((d) => d.remove());
      // Leave the diagram fully visible and intact if we unmount mid-play.
      utils.set([...shapes, ...paths], { opacity: 1 });
      paths.forEach((p) => p.style.removeProperty("stroke-dasharray"));
      restoreMarkers();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
