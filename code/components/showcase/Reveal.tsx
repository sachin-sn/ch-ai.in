"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Scroll-triggered fade/rise for showcase sections -- the .sc-section /
// .sc-in pairing in showcase.css does the actual animating; this just
// flips the class on once a section crosses into view (one-shot, like
// the theme pages' own reveal primitives) via IntersectionObserver.
// prefers-reduced-motion is handled in CSS (the transition itself is
// disabled there), so there's nothing extra to branch on here.
export default function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`sc-section ${visible ? "sc-in" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}
