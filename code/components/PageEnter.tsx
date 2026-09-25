"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { playPageEnter } from "@/lib/motion/pageEnter";

// Renders nothing: plays the page-enter animation on every client-side
// route change (the first load is the CSS "page-in" animation instead).
export default function PageEnter() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    return playPageEnter();
  }, [pathname]);

  return null;
}
