"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type SwissRevealTag = "div" | "p" | "section" | "span" | "h1";

type SwissRevealProps = {
  children: ReactNode;
  className?: string;
  as?: SwissRevealTag;
  style?: CSSProperties;
};

// Swiss's scroll-reveal primitive. Same contract as the other themes'
// helpers -- it only adds an "in" class on first intersection -- and
// swiss.css keeps every motion on the grid's own axes: rules wipe in from
// the left edge (.sw-rule), headline lines rise from behind their baseline
// (.sw-mask), and blocks slide in horizontally a beat apart (.sw-reveal,
// .sw-stagger). No scaling, no rotation, no easing flourish -- just
// precise, linear-feeling movement along x and y.
export default function SwissReveal({ children, className = "", as = "div", style }: SwissRevealProps) {
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  // Every allowed tag is a plain HTML element, so typing the dynamic tag
  // as "div" keeps the ref type simple without a per-tag branch.
  const Tag = as as "div";
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
