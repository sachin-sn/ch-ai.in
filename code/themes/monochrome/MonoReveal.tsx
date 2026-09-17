"use client";

import * as React from "react";
import { useEffect, useRef, type ReactNode } from "react";

type MonoRevealTag = "div" | "p" | "h1" | "h2" | "span";

type MonoRevealProps = {
  children: ReactNode;
  className?: string;
  as?: MonoRevealTag;
  style?: React.CSSProperties;
};

// Monochrome's own scroll-reveal primitive -- distinct in feel from the
// shared <Reveal> (magazine's scroll-direction-tied slide-in) and pixel's
// <TypeReveal> (dialogue typing). Monochrome's identity is a precise,
// mechanical "index": elements rise a few pixels into place a beat apart,
// like rows being stamped into a ledger, and section rules draw
// themselves left-to-right. This component only toggles one "in" class
// on its own root element on first intersection -- the actual motion
// (fade-up, rule-draw, staggered children) is declarative CSS keyed off
// that class in monochrome.css (.mo-reveal, .mo-stagger,
// .mo-section-head), so one primitive covers all three just by varying
// className. Above-the-fold elements (the hero) are already inside the
// viewport on mount, so IntersectionObserver fires for them immediately
// and they animate in on load with no special-casing; a per-element
// transition-delay (via the style prop) staggers a handful of them by
// hand where they aren't already inside a .mo-stagger container.
export default function MonoReveal({ children, className = "", as = "div", style }: MonoRevealProps) {
  const ref = useRef<HTMLElement>(null);

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

  if (as === "p") {
    return (
      <p ref={ref as React.Ref<HTMLParagraphElement>} className={className} style={style}>
        {children}
      </p>
    );
  }
  if (as === "h1") {
    return (
      <h1 ref={ref as React.Ref<HTMLHeadingElement>} className={className} style={style}>
        {children}
      </h1>
    );
  }
  if (as === "h2") {
    return (
      <h2 ref={ref as React.Ref<HTMLHeadingElement>} className={className} style={style}>
        {children}
      </h2>
    );
  }
  if (as === "span") {
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} className={className} style={style}>
        {children}
      </span>
    );
  }
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={className} style={style}>
      {children}
    </div>
  );
}
