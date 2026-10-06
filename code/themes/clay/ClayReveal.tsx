"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type ClayRevealTag = "div" | "p" | "section" | "span";

type ClayRevealProps = {
  children: ReactNode;
  className?: string;
  as?: ClayRevealTag;
  style?: CSSProperties;
};

// Clay's scroll-reveal primitive. Same contract as the other themes'
// helpers -- it only adds an "in" class on first intersection -- and the
// motion it drives in clay.css is its own: things *pop* into place like a
// lump of clay dropped on a table, squashing on landing and springing
// back (.cl-reveal, and each child of .cl-stagger a beat apart).
export default function ClayReveal({ children, className = "", as = "div", style }: ClayRevealProps) {
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
