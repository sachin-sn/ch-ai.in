"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { switchThemeSmoothly } from "@/lib/motion/themeTransition";
import { themes, type ThemeId } from "@/lib/theme/themes";
import ModeToggle from "./ModeToggle";

// One compact pill holding both appearance controls: the light/dark
// toggle (ModeToggle) and the theme button. The theme button shows the current
// theme's name, and each click moves to the next available theme in
// registry order (lib/theme/themes.ts), wrapping from the last back to the
// first -- Magazine → Pixel → Material → Mono → Sketch → Glass → Clay → Bento → Magazine … The cycle icon
// spins a full turn on every click.
//
// Pressing and holding the theme button (about half a second -- a ring
// fills around the icon while you hold) opens a dropdown listing every
// available theme instead, so any theme is one pick away rather than a
// lap of clicks. The same menu also opens on right-click and, from the
// keyboard, with ArrowDown/ArrowUp on the focused button. It follows the
// WAI-ARIA menu pattern (menuitemradio items, roving focus, Home/End,
// Escape returns focus to the button) and closes on any outside press.
// A long press never also counts as a click, so it can't cycle as well.
const HOLD_MS = 450;

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [turns, setTurns] = useState(0);
  const [open, setOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  const cycle = themes.filter((t) => t.available);
  const index = Math.max(0, cycle.findIndex((t) => t.id === theme));
  const current = cycle[index];
  const next = cycle[(index + 1) % cycle.length];

  const applyTheme = useCallback(
    (id: ThemeId) => {
      setTurns((n) => n + 1);
      // Cross-fade into the new theme (lib/motion/themeTransition);
      // flushSync commits it inside the view transition's snapshot.
      switchThemeSmoothly(() => flushSync(() => setTheme(id)));
    },
    [setTheme]
  );

  const clearHold = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setHolding(false);
  };

  const closeMenu = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);

  // Focus the current theme's item when the menu opens.
  useEffect(() => {
    if (!open) return;
    const items = menuRef.current?.querySelectorAll<HTMLButtonElement>("[role=menuitemradio]");
    const active = menuRef.current?.querySelector<HTMLButtonElement>("[aria-checked=true]");
    (active ?? items?.[0])?.focus();
  }, [open]);

  // Close on a press anywhere outside the switcher.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    longPressed.current = false;
    setHolding(true);
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      longPressed.current = true;
      setHolding(false);
      setOpen(true);
      navigator.vibrate?.(12);
    }, HOLD_MS);
  }

  function onClick() {
    // The click that ends a long press only finishes opening the menu.
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    if (open) {
      setOpen(false);
      return;
    }
    applyTheme(next.id);
  }

  function onButtonKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent) {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>("[role=menuitemradio]") ?? []
    );
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    let target = -1;
    if (e.key === "ArrowDown") target = (at + 1) % items.length;
    else if (e.key === "ArrowUp") target = (at - 1 + items.length) % items.length;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = items.length - 1;
    else if (e.key === "Escape") {
      e.preventDefault();
      // Keep the mobile burger panel (which also listens for Escape) open.
      e.stopPropagation();
      closeMenu(true);
      return;
    } else if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (target >= 0) {
      e.preventDefault();
      items[target]?.focus();
    }
  }

  return (
    <div className="theme-switch" role="group" aria-label="Appearance" ref={rootRef}>
      <ModeToggle />
      <span className="theme-switch-divider" aria-hidden="true" />
      <button
        ref={buttonRef}
        type="button"
        className={`theme-cycle${holding ? " is-holding" : ""}`}
        aria-label={`Theme: ${current.label}. Click to switch to ${next.label}; press and hold for all themes`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        title={`Switch to ${next.label} — hold for all themes`}
        style={{ ["--hold-ms" as string]: `${HOLD_MS}ms` }}
        onPointerDown={onPointerDown}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        onPointerCancel={clearHold}
        onContextMenu={(e) => {
          e.preventDefault();
          clearHold();
          setOpen(true);
        }}
        onKeyDown={onButtonKeyDown}
        onClick={onClick}
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

      {open && (
        <div className="theme-menu">
          <ul
            ref={menuRef}
            id={menuId}
            className="theme-menu-list"
            role="menu"
            aria-label="Choose a theme"
            onKeyDown={onMenuKeyDown}
          >
            {cycle.map((t) => {
              const selected = t.id === theme;
              return (
                <li key={t.id} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    tabIndex={-1}
                    className="theme-menu-item"
                    onClick={() => {
                      closeMenu(true);
                      if (!selected) applyTheme(t.id);
                    }}
                  >
                    <span>{t.label}</span>
                    <svg className="theme-menu-check" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="theme-menu-hint" aria-hidden="true">
            Click cycles &middot; hold opens this list
          </p>
        </div>
      )}
    </div>
  );
}
