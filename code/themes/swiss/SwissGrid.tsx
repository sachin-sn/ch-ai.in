"use client";

import { useEffect, useState } from "react";

// The Swiss theme's grid overlay. Swiss design is built on a visible
// mathematical grid, so the page lets you see its own: the "Grid" button
// (or the G key) lays the 12-column grid the whole homepage is set on --
// the same max-w-5xl container, gutters and columns as the content --
// over the viewport in translucent red. Purely presentational: it ignores
// pointer events and is hidden from assistive tech.
export default function SwissGrid() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "g" && e.key !== "G") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      setOn((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className="sw-grid-toggle"
        aria-pressed={on}
        onClick={() => setOn((v) => !v)}
        title="Show the 12-column grid (G)"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M1 1h4v14H1zM6 1h4v14H6zM11 1h4v14h-4z" />
        </svg>
        {on ? "Hide grid" : "Show grid"}
      </button>
      <div className={`sw-grid-overlay${on ? " is-on" : ""}`} aria-hidden="true">
        <div className="mx-auto max-w-5xl px-6 sw-grid-cols">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} style={{ ["--i" as string]: i }} />
          ))}
        </div>
      </div>
    </>
  );
}
