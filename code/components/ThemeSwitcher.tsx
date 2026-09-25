"use client";

import { flushSync } from "react-dom";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { switchThemeSmoothly } from "@/lib/motion/themeTransition";
import { themes } from "@/lib/theme/themes";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="theme-switch"
      role="radiogroup"
      aria-label="Site theme"
    >
      {themes.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={theme === t.id}
          disabled={!t.available}
          title={t.available ? undefined : `${t.label} — coming soon`}
          className={theme === t.id ? "active" : undefined}
          onClick={() => {
            if (!t.available || t.id === theme) return;
            // Cross-fade into the new theme (lib/motion/themeTransition);
            // flushSync commits it inside the view transition's snapshot.
            switchThemeSmoothly(() => flushSync(() => setTheme(t.id)));
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
