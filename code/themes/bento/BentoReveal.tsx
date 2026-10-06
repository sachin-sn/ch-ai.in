"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type BentoRevealProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

// Bento's scroll-reveal primitive: one per grid. Same contract as the
// other themes' helpers -- it only adds an "in" class on first
// intersection -- and bento.css turns that into the theme's "assemble"
// motion: each tile scales up into its cell, in grid order, a beat apart,
// as if the board were being laid out piece by piece.
export default function BentoReveal({ children, className = "", style }: BentoRevealProps) {
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
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
