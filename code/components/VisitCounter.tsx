"use client";

import { useEffect, useState } from "react";

// Once-per-session flag: the first page load in a tab POSTs (counts a
// visit), every later load/navigation just GETs the current total -- so
// refreshes and clicking around the site don't inflate the number.
// Nothing identifying is stored; it's a boolean in sessionStorage.
const SESSION_FLAG = "ch-ai-visit-counted";

function alreadyCounted(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_FLAG) === "1";
  } catch {
    // Storage blocked (private mode, strict settings): treat as counted
    // so we never double-count, and fall back to a read.
    return true;
  }
}

function markCounted(): void {
  try {
    window.sessionStorage.setItem(SESSION_FLAG, "1");
  } catch {
    /* ignore -- see alreadyCounted() */
  }
}

// Footer visit counter, backed by gcp-functions/visit-api via the
// /api/visit Firebase Hosting rewrite. Renders nothing until the count
// arrives, and nothing at all if the API fails (or doesn't exist, as
// under `next dev`) -- a missing counter is fine, an error line isn't.
export default function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const shouldCount = !alreadyCounted();

    fetch("/api/visit", {
      method: shouldCount ? "POST" : "GET",
      headers: shouldCount ? { "content-type": "application/json" } : undefined,
      body: shouldCount ? "{}" : undefined,
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { site?: unknown } | null) => {
        if (typeof data?.site !== "number") return;
        if (shouldCount) markCounted();
        setCount(data.site);
      })
      .catch(() => {
        /* aborted or offline -- stay hidden */
      });

    return () => controller.abort();
  }, []);

  if (count === null) return null;

  return (
    <span className="font-mono text-xs text-ink-dim" title="Visits since launch (one per browser session)">
      {count.toLocaleString()} visits
    </span>
  );
}
