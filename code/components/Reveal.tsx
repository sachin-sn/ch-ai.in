"use client";

import * as React from "react";
import { useEffect, useRef, type ReactNode } from "react";
import { getScrollDirection, subscribeScrollDirection } from "@/lib/scroll/scrollDirection";

type RevealDirection = "auto" | "up" | "left" | "right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "div" | "section" | "article";
  /**
   * "auto" (default) ties the entrance side to live scroll direction: while
   * the page is scrolling down, sections enter left-to-right; scroll back up
   * and sections re-arm and enter right-to-left instead. "left"/"right" pin
   * a fixed side regardless of scroll direction; "up" keeps the plain
   * fade-up used before directional reveals existed.
   */
  direction?: RevealDirection;
};

function sideClassFor(direction: RevealDirection): "reveal-left" | "reveal-right" | null {
  if (direction === "left") return "reveal-left";
  if (direction === "right") return "reveal-right";
  if (direction === "auto") {
    return getScrollDirection() === "down" ? "reveal-left" : "reveal-right";
  }
  return null;
}

// Scroll-in wrapper shared by every theme. Respects prefers-reduced-motion
// via the .reveal CSS in globals.css (which removes the transition and
// forces the visible state), and falls back to visible immediately if
// IntersectionObserver isn't available.
export default function Reveal({
  children,
  className = "",
  id,
  as = "div",
  direction = "auto",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  // Mirrors whether the element is currently showing its "in" (revealed)
  // state, tracked outside React state so scroll/intersection updates stay
  // imperative and don't re-render the tree on every tick.
  const isInRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const applySide = () => {
      const side = sideClassFor(direction);
      el.classList.toggle("reveal-left", side === "reveal-left");
      el.classList.toggle("reveal-right", side === "reveal-right");
    };

    applySide();

    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            isInRef.current = true;
          } else if (direction === "auto" && isInRef.current) {
            // Only scroll-tied sections re-arm: drop "in" once the section
            // has fully scrolled out of view so the next entrance plays
            // again, from whichever side matches the scroll direction at
            // that moment. Fixed-direction sections stay revealed once
            // shown, as before.
            entry.target.classList.remove("in");
            isInRef.current = false;
          }
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);

    // While a scroll-tied section is off-screen (not yet revealed, or
    // re-armed after scrolling past it), keep its entrance side in sync
    // with live scroll direction so it always enters from the correct
    // side whenever it next comes into view.
    let unsubscribe: (() => void) | undefined;
    if (direction === "auto") {
      unsubscribe = subscribeScrollDirection(() => {
        if (!isInRef.current) applySide();
      });
    }

    return () => {
      io.disconnect();
      unsubscribe?.();
    };
  }, [direction]);

  const combinedClassName = ["reveal", className].filter(Boolean).join(" ");

  if (as === "section") {
    return (
      <section ref={ref as React.Ref<HTMLElement>} id={id} className={combinedClassName}>
        {children}
      </section>
    );
  }
  if (as === "article") {
    return (
      <article ref={ref as React.Ref<HTMLElement>} id={id} className={combinedClassName}>
        {children}
      </article>
    );
  }
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} id={id} className={combinedClassName}>
      {children}
    </div>
  );
}
