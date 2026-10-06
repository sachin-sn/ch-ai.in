"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { switchThemeSmoothly } from "@/lib/motion/themeTransition";
import { themes } from "@/lib/theme/themes";
import ModeToggle from "./ModeToggle";

// One compact pill holding both appearance controls: the light/dark
// toggle (ModeToggle) and the theme button. The theme button shows the current
// theme's name, and each click moves to the next available theme in
// registry order (lib/theme/themes.ts), wrapping from the last back to the
// first -- Magazine → Pixel → Material → Mono → Sketch → Glass → Clay → Magazine … The cycle icon
// spins a full turn on every click.
export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [turns, setTurns] = useState(0);

  const cycle = themes.filter((t) => t.available);
  const index = Math.max(0, cycle.findIndex((t) => t.id === theme));
  const current = cycle[index];
  const next = cycle[(index + 1) % cycle.length];

  return (
    <div className="theme-switch" role="group" aria-label="Appearance">
      <ModeToggle />
      <span className="theme-switch-divider" aria-hidden="true" />
      <button
        type="button"
        className="theme-cycle"
        aria-label={`Theme: ${current.label}. Switch to ${next.label}`}
        title={`Switch to ${next.label}`}
        onClick={() => {
          setTurns((n) => n + 1);
          // Cross-fade into the new theme (lib/motion/themeTransition);
          // flushSync commits it inside the view transition's snapshot.
          switchThemeSmoothly(() => flushSync(() => setTheme(next.id)));
        }}
      >
        <span className="theme-cycle-label" aria-hidden="true">
          {current.label}
        </span>
        <span
          className="theme-cycle-icon"
          aria-hidden="true"
          style={{ transform: `rotate(${turns * 360}deg)` }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12a8 8 0 0 1-13.66 5.66" />
            <path d="M4 12a8 8 0 0 1 13.66-5.66" />
            <path d="M17.5 2.5v4h-4" />
            <path d="M6.5 21.5v-4h4" />
          </svg>
        </span>
      </button>
    </div>
  );
}
