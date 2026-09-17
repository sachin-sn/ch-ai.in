"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import type { ThemeId } from "@/lib/theme/themes";

// Light/dark mode toggle, rendered in the shared Nav next to
// ThemeSwitcher -- and, on mobile, a second time inside MobileMenu's
// dropdown panel. Only visible while the active theme actually defines a
// [data-theme="<id>"][data-mode="dark"] palette -- magazine, pixel,
// material, and monochrome all do. Mode itself lives in ThemeProvider's
// shared context (not local state here) precisely because two instances
// of this component can be mounted at once (desktop row + mobile panel);
// reading/writing through context keeps them in sync the same way
// ThemeSwitcher's theme already does.
const MODE_AWARE_THEMES: ThemeId[] = ["magazine", "pixel", "material", "monochrome"];
export default function ModeToggle() {
  const { theme, mode, setMode } = useTheme();

  if (!MODE_AWARE_THEMES.includes(theme)) return null;

  function toggle() {
    setMode(mode === "dark" ? "light" : "dark");
  }

  return (
    <button
      type="button"
      className="mode-toggle"
      onClick={toggle}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {mode === "dark" ? (
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"
          />
        ) : (
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5Z"
          />
        )}
        {mode === "dark" && <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />}
      </svg>
    </button>
  );
}
