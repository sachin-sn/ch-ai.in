"use client";

// Single shared scroll-direction tracker used by every <Reveal direction="auto">
// instance. One scroll listener for the whole page (not one per section),
// with a small delta threshold so tiny jitters (trackpad, elastic overscroll)
// don't flip the direction back and forth.

export type ScrollDirection = "down" | "up";

const DIRECTION_THRESHOLD_PX = 4;

let direction: ScrollDirection = "down";
let lastY = 0;
let ticking = false;
let initialized = false;
const listeners = new Set<() => void>();

function handleScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const delta = y - lastY;
    if (Math.abs(delta) >= DIRECTION_THRESHOLD_PX) {
      const next: ScrollDirection = delta > 0 ? "down" : "up";
      lastY = y;
      if (next !== direction) {
        direction = next;
        listeners.forEach((listener) => listener());
      }
    }
    ticking = false;
  });
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  lastY = window.scrollY;
  window.addEventListener("scroll", handleScroll, { passive: true });
}

export function getScrollDirection(): ScrollDirection {
  return direction;
}

export function subscribeScrollDirection(listener: () => void): () => void {
  ensureInitialized();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
