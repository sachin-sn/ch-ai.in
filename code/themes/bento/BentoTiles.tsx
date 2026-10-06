"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ExperienceEntry, TechSpec } from "@/lib/content/profile";

// The live tiles of the Bento homepage -- the small interactive modules
// that make a bento board feel like a dashboard rather than a poster.
// Each is self-contained and degrades to a static, readable tile without
// JS or under reduced motion.

/* ---------------- local time in Bengaluru ---------------- */
// Renders "--:--" on the server and first paint (the visitor's clock is
// not known at build time, so rendering a time there would mismatch on
// hydration), then ticks every second. The analog hands are driven by
// CSS custom properties.
export function ClockTile() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  let h = 0;
  let m = 0;
  let s = 0;
  let label = "--:--";
  if (now) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
    h = get("hour");
    m = get("minute");
    s = get("second");
    label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return (
    <>
      <span className="bn-label">Local time</span>
      <div className="bn-clock">
        <svg
          className="bn-clock-face"
          viewBox="0 0 100 100"
          aria-hidden="true"
          style={{
            ["--h" as string]: `${(h % 12) * 30 + m * 0.5}deg`,
            ["--m" as string]: `${m * 6 + s * 0.1}deg`,
            ["--s" as string]: `${s * 6}deg`,
          }}
        >
          <circle cx="50" cy="50" r="46" className="bn-clock-rim" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="50" y1="9" x2="50" y2={i % 3 === 0 ? 17 : 13} transform={`rotate(${i * 30} 50 50)`} className="bn-clock-tick" />
          ))}
          <line x1="50" y1="50" x2="50" y2="28" className="bn-hand bn-hand-h" />
          <line x1="50" y1="50" x2="50" y2="17" className="bn-hand bn-hand-m" />
          <line x1="50" y1="56" x2="50" y2="13" className="bn-hand bn-hand-s" />
          <circle cx="50" cy="50" r="3" className="bn-clock-pin" />
        </svg>
        <div>
          <time className="bn-clock-digital" suppressHydrationWarning>
            {label}
          </time>
          <span className="bn-sub">Bengaluru &middot; IST</span>
        </div>
      </div>
    </>
  );
}

/* ---------------- years counter ---------------- */
// Counts up from 0 the first time the tile scrolls into view.
export function YearsTile({ years }: { years: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(years);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const run = (t: number) => {
          const p = Math.min(1, (t - start) / 1400);
          setValue(Math.round(years * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(run);
        };
        setValue(0);
        raf = requestAnimationFrame(run);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [years]);

  return (
    <>
      <span className="bn-label">Experience</span>
      <div className="bn-years">
        <span ref={ref} className="bn-years-num">
          {value}
          <sup>+</sup>
        </span>
        <span className="bn-sub">years shipping software</span>
      </div>
    </>
  );
}

/* ---------------- career accordion ---------------- */
// One row per role; the current role starts open. Rows expand with a
// grid-template-rows 0fr -> 1fr transition (no height measuring).
export function CareerTile({ roles }: { roles: ExperienceEntry[] }) {
  const [open, setOpen] = useState<string | null>(roles[0]?.id ?? null);
  const baseId = useId();

  return (
    <>
      <span className="bn-label">Where I&rsquo;ve worked</span>
      <ul className="bn-career">
        {roles.map((role) => {
          const isOpen = open === role.id;
          const current = role.end === "Present";
          const panelId = `${baseId}-${role.id}`;
          return (
            <li key={role.id} className={`bn-role${isOpen ? " is-open" : ""}`}>
              <button
                type="button"
                className="bn-role-head"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : role.id)}
              >
                <span className="bn-role-years">
                  {current
                    ? `${role.start.slice(-4)}–now`
                    : role.start.slice(-4) === role.end.slice(-4)
                      ? role.start.slice(-4)
                      : `${role.start.slice(-4)}–${role.end.slice(-4)}`}
                </span>
                <span className="bn-role-title">
                  {role.role}
                  <small>{role.company}</small>
                </span>
                {current && <span className="bn-pill-live">Current</span>}
                <span className="bn-role-toggle" aria-hidden="true" />
              </button>
              <div className="bn-role-panel" id={panelId} role="region">
                <div>
                  <ul>
                    {role.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* ---------------- tech specs with tabs ---------------- */
export function SpecsTile({ specs }: { specs: TechSpec[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Arrow-key navigation across the tab list (WAI-ARIA tabs pattern).
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + specs.length) % specs.length;
    setActive(next);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  const spec = specs[active];
  return (
    <>
      <div className="bn-specs-top">
        <span className="bn-label">Tech specs</span>
        <span className="bn-sub">
          {String(active + 1).padStart(2, "0")} / {String(specs.length).padStart(2, "0")}
        </span>
      </div>
      <div className="bn-tabs" role="tablist" aria-label="Tech spec groups" ref={tabsRef} onKeyDown={onKeyDown}>
        {specs.map((s, i) => (
          <button
            key={s.group}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel`}
            tabIndex={i === active ? 0 : -1}
            className="bn-tab"
            onClick={() => setActive(i)}
          >
            {s.group}
          </button>
        ))}
      </div>
      <div
        className="bn-specs-panel"
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${active}`}
        key={spec.group}
      >
        {spec.items.map((item, i) => (
          <span className="bn-spec" key={item} style={{ ["--i" as string]: i }}>
            {item}
          </span>
        ))}
      </div>
    </>
  );
}
