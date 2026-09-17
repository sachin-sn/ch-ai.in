"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { defaultTheme, isThemeId, type ThemeId } from "./themes";

const STORAGE_KEY = "ch-ai-theme";
const MODE_STORAGE_KEY = "ch-ai-mode";

export type Mode = "light" | "dark";

function isMode(value: string | null): value is Mode {
  return value === "light" || value === "dark";
}

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  // Mode lives here rather than as each component's own useState because a
  // mobile burger panel and the desktop nav row can both have a ModeToggle
  // mounted at the same time -- two independent useState instances would go
  // out of sync the moment either one is toggled. Mirrors the theme/setTheme
  // pattern below exactly.
  mode: Mode;
  setMode: (mode: Mode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Applies the theme to <html data-theme="..."> so every themed CSS block
// (scoped as [data-theme="magazine"] etc.) activates together. A blocking
// inline script in layout.tsx sets this attribute (and data-mode) before
// first paint too, so there is no flash of the wrong theme/mode on load —
// this effect just keeps state and DOM in sync after hydration and on
// future changes.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(defaultTheme);
  const [mode, setModeState] = useState<Mode>("light");

  // Reads the theme/mode actually applied by the blocking inline script in
  // layout.tsx (or localStorage directly) once, right after mount, so
  // React state matches the DOM/localStorage. This intentionally sets
  // state from an external system inside an effect — the safe pattern for
  // syncing client-only state (localStorage) without an SSR/hydration
  // mismatch, since the server and first client render both use the
  // defaults above.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const current = document.documentElement.getAttribute("data-theme");
    const resolved = isThemeId(stored) ? stored : isThemeId(current) ? current : null;
    if (resolved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage/DOM on mount, not a render loop
      setThemeState(resolved);
    }

    const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY);
    const currentMode = document.documentElement.getAttribute("data-mode");
    const resolvedMode = isMode(storedMode) ? storedMode : isMode(currentMode) ? currentMode : null;
    if (resolvedMode) {
      setModeState(resolvedMode);
    }
  }, []);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage can throw (private mode, quota) — theme still applies
      // for this page view via the DOM attribute above.
    }
  }, []);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    document.documentElement.setAttribute("data-mode", next);
    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {
      // localStorage can throw (private mode, quota) — mode still applies
      // for this page view via the DOM attribute above.
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
