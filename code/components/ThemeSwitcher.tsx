"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
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
          onClick={() => t.available && setTheme(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
