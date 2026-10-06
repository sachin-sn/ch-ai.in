"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { deckTransition } from "@/lib/motion/deckTransition";

// Mounted once by app/(site)/blueprints/layout.tsx. Any click on a link to
// another slide (arrows, bottom bar, pager cards, dots, index cards, "All
// blueprints") -- and the ← / → keys, via goToSlide -- plays the slide
// transition, sliding the direction that matches deck order.

const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

let go: ((href: string) => void) | null = null;

/** Navigate to a slide with the transition (falls back to a plain push). */
export function goToSlide(href: string, fallback: (href: string) => void) {
  if (go) go(href);
  else fallback(href);
}

export default function DeckTransitions({ order }: { order: string[] }) {
  const router = useRouter();

  useEffect(() => {
    const positionOf = (path: string) => order.indexOf(normalize(path));

    go = (href: string) => {
      const from = positionOf(window.location.pathname);
      const to = positionOf(href);
      if (to === -1 || from === -1 || to === from) {
        router.push(href);
        return;
      }
      deckTransition({
        href,
        direction: to > from ? "forward" : "back",
        navigate: () => router.push(href),
      });
    };

    // Capture phase on document runs before React's own listeners, so
    // stopping the event here keeps next/link from also navigating.
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash) return;
      if (positionOf(url.pathname) === -1) return;
      if (normalize(url.pathname) === normalize(window.location.pathname)) return;
      e.preventDefault();
      e.stopPropagation();
      go!(url.pathname);
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      go = null;
    };
  }, [order, router]);

  return null;
}
