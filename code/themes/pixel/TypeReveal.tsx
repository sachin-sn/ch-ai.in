"use client";

import { useEffect, useRef } from "react";

type TypeRevealProps = {
  text: string;
  /** Stagger (ms) before typing starts, once visible — lets sibling lines
   * (e.g. quest objectives) type one after another instead of together. */
  delay?: number;
  className?: string;
};

// A description line that "plays back" as game-dialogue typing the first
// time it scrolls into view, with a blinking cursor that keeps blinking at
// the end of the line once typing finishes (a permanent "ready" caret,
// like a terminal prompt). Renders the full text up front (SSR-visible,
// works with JS disabled, reduced-motion-safe) then, once fonts are
// ready, locks its parent box to that text's rendered height *before*
// clearing back to "" — so the box the line lives in (a dialogue panel, a
// card, a list item) never grows or shifts while the line types back in.
export default function TypeReveal({ text, delay = 0, className = "" }: TypeRevealProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    const cursor = cursorRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      if (cursor) cursor.style.display = "none";
      return;
    }

    let cancelled = false;
    let io: IntersectionObserver | undefined;
    let typeTimer: ReturnType<typeof setInterval> | undefined;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    function reserveHeight() {
      const box = el?.parentElement;
      if (!box || !el) return;
      box.style.minHeight = "0px";
      el.textContent = text;
      const full = box.getBoundingClientRect().height;
      box.style.minHeight = `${Math.ceil(full)}px`;
    }

    function typeEl() {
      if (!el) return;
      const len = text.length;
      // Slow, deliberate game-dialogue pacing -- short lines still read at
      // a readable clip, long paragraphs are capped so they don't crawl
      // forever. The cursor is left blinking once typing finishes, as a
      // permanent end-of-line marker rather than disappearing.
      const interval = Math.max(28, Math.min(70, 2400 / Math.max(len, 1)));
      let i = 0;
      typeTimer = setInterval(() => {
        i += 1;
        if (el) el.textContent = text.slice(0, i);
        if (i >= len && typeTimer) {
          clearInterval(typeTimer);
        }
      }, interval);
    }

    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(reserveHeight, 150);
    }

    function begin() {
      if (cancelled || !el) return;
      reserveHeight();
      el.textContent = "";
      window.addEventListener("resize", onResize);

      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            io?.unobserve(entry.target);
            if (delay) {
              setTimeout(typeEl, delay);
            } else {
              typeEl();
            }
          }
        },
        { threshold: 0.35 }
      );
      io.observe(el);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(begin).catch(begin);
    } else {
      begin();
    }

    return () => {
      cancelled = true;
      if (typeTimer) clearInterval(typeTimer);
      if (resizeTimer) clearTimeout(resizeTimer);
      io?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [text, delay]);

  return (
    <>
      <span ref={spanRef} className={className}>
        {text}
      </span>
      <span ref={cursorRef} className="px-type-cursor" aria-hidden="true">
        ▌
      </span>
    </>
  );
}
