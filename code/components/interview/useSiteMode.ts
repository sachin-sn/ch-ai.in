"use client";

import { useEffect, useState } from "react";

/** Tracks the site's light/dark mode (the data-mode attribute on <html>). */
export function useSiteMode(): "light" | "dark" {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setMode(el.getAttribute("data-mode") === "light" ? "light" : "dark");
    read();
    const obs = new MutationObserver(read);
    obs.observe(el, { attributes: true, attributeFilter: ["data-mode"] });
    return () => obs.disconnect();
  }, []);
  return mode;
}
