"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type SketchRevealTag = "div" | "p" | "h2" | "span" | "section";

type SketchRevealProps = {
  children: ReactNode;
  className?: string;
  as?: SketchRevealTag;
  style?: CSSProperties;
};

// Sketch's scroll-reveal primitive. Like the other themes' reveal helpers
// it only toggles one "in" class on first intersection; everything that
// moves is declarative CSS in sketch.css keyed off that class:
//   .sk-reveal  -- the element "lands" on the page: fades in from a
//                  slight tilt, like a card being dropped onto the desk.
//   .sk-stagger -- the same, for each child, a beat apart.
//   .sk-draw    -- any <path class="sk-draw"> inside gets drawn with a pen
//                  (stroke-dashoffset), so underlines, arrows and circles
//                  sketch themselves in as they scroll into view.
// One primitive covers all three by varying className.
export default function SketchReveal({ children, className = "", as = "div", style }: SketchRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  // Every allowed tag is a plain block/inline HTML element, so typing the
  // dynamic tag as "div" keeps the ref type simple without a per-tag branch.
  const Tag = as as "div";
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
