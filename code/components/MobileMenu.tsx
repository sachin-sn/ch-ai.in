"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import ModeToggle from "./ModeToggle";

type NavLink = { href: string; label: string };

// The burger-menu counterpart to Nav's desktop row (nav links + mode
// toggle + theme switcher). Nav.tsx renders both this and the plain
// desktop row unconditionally; which one is visible is decided purely by
// CSS media queries (.site-nav-desktop / .site-nav-mobile in
// globals.css), so there's no client-side viewport detection or layout
// flash -- only the open/closed state of the dropdown itself needs JS.
export default function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  // Close on Escape, and if the panel is left open and the viewport grows
  // back past the desktop breakpoint (e.g. rotating a tablet), close it
  // rather than leaving an orphaned open dropdown a resize-hidden burger
  // button can no longer toggle shut.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onResize() {
      if (window.innerWidth > 860) setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <div className="site-nav-mobile">
      <button
        type="button"
        className="nav-burger"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {open ? (
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              d="M5 5l14 14M19 5L5 19"
            />
          ) : (
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              d="M4 7h16M4 12h16M4 17h16"
            />
          )}
        </svg>
      </button>

      {open && (
        <div id="mobile-nav-panel" className="nav-burger-panel">
          <nav>
            <ul className="nav-burger-links">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => setOpen(false)}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="nav-burger-controls">
            <ModeToggle />
            <ThemeSwitcher />
          </div>
        </div>
      )}
    </div>
  );
}
