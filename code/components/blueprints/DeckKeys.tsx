"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { goToSlide } from "./DeckTransitions";

// ← / → move through the blueprint deck. Ignored while typing in a field
// or when a modifier is held (so browser shortcuts like Alt+← still work).
export default function DeckKeys({
  prevHref,
  nextHref,
}: {
  prevHref: string | null;
  nextHref: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      const href = e.key === "ArrowLeft" ? prevHref : e.key === "ArrowRight" ? nextHref : null;
      if (!href) return;
      e.preventDefault();
      goToSlide(href, (h) => router.push(h));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevHref, nextHref, router]);

  // Warm the neighbours so an arrow press feels instant.
  useEffect(() => {
    if (prevHref) router.prefetch(prevHref);
    if (nextHref) router.prefetch(nextHref);
  }, [prevHref, nextHref, router]);

  return null;
}
