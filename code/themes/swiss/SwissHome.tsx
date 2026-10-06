"use client";

import Image from "next/image";
import Link from "next/link";
import {
  person,
  experience,
  offTheClock,
  techSpecs,
  type ProjectEntry,
} from "@/lib/content/profile";
import SwissReveal from "./SwissReveal";
import SwissGrid from "./SwissGrid";

// Swiss Design -- the International Typographic Style: one strict
// 12-column grid for the whole page, flush-left ragged-right grotesk set
// big and tight, black and white with a single Swiss red, hairline-free
// heavy rules, objective (grayscale) photography and one pure geometric
// form -- a red circle -- in the spirit of the 1950s-60s Zurich posters.
// Every section hangs off the same columns: a numbered label in the first
// three, content in the remaining nine. The "Show grid" toggle (or G)
// overlays that grid (SwissGrid). All copy comes from lib/content/profile.

const SECTIONS = [
  { num: "01", id: "profile", label: "Profile" },
  { num: "02", id: "projects", label: "Writing" },
  { num: "03", id: "career", label: "Experience" },
  { num: "04", id: "off-the-clock", label: "Off the clock" },
  { num: "05", id: "specs", label: "Tech specs" },
];

function Arrow() {
  return (
    <svg className="sw-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  );
}

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="sw-section-label">
      <span className="sw-section-num">{num}</span>
      <span className="sw-section-name">{label}</span>
    </div>
  );
}

export default function SwissHome({ featured }: { featured: ProjectEntry[] }) {
  return (
    <div className="sw-page">
      <SwissGrid />

      {/* ---------------- poster ---------------- */}
      <header className="mx-auto max-w-5xl px-6 sw-hero">
        <SwissReveal as="div" className="sw-meta sw-grid">
          <span className="sw-rule" aria-hidden="true" />
          <span className="sw-col-3">{person.name}</span>
          <span className="sw-col-3">Senior Full-Stack Engineer</span>
          <span className="sw-col-3">{person.location}</span>
          <span className="sw-col-3">Portfolio 2026</span>
        </SwissReveal>

        <div className="sw-poster sw-grid">
          <span className="sw-circle" aria-hidden="true" />
          <SwissReveal as="h1" className="sw-headline">
            {["Building", "systems", "that", "hold."].map((word, i) => (
              <span className="sw-mask" key={word}>
                <span style={{ transitionDelay: `${0.08 * i + 0.1}s` }}>{word}</span>
              </span>
            ))}
          </SwissReveal>
          <SwissReveal as="div" className="sw-portrait sw-reveal" style={{ transitionDelay: "0.35s" }}>
            <span className="sw-portrait-block" aria-hidden="true" />
            <div className="sw-portrait-frame">
              <Image
                src="/images/sachin-mono-portrait.jpg"
                alt={`Portrait of ${person.fullName}`}
                fill
                sizes="(max-width: 860px) 60vw, 240px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <span className="sw-caption">Fig. 1 &mdash; {person.fullName}</span>
          </SwissReveal>
          <span className="sw-vertical" aria-hidden="true">
            International Typographic Style &mdash; Nº 09
          </span>
        </div>

        <SwissReveal as="div" className="sw-columns sw-grid sw-stagger">
          <div className="sw-col-4 sw-info">
            <span className="sw-info-label">Profile</span>
            <p>
              Senior full-stack engineer at Oracle. 12+ years across MERN, ASP.NET and cloud-native
              architecture, shipping secure, accessible, high-performing platforms.
            </p>
          </div>
          <div className="sw-col-4 sw-info">
            <span className="sw-info-label">Status</span>
            <p>
              <span className="sw-square" aria-hidden="true" />
              {person.openToWork.headline}. {person.openToWork.body}
            </p>
            <a className="sw-btn" href={`mailto:${person.email}`}>
              Get in touch <Arrow />
            </a>
          </div>
          <nav className="sw-col-4 sw-info" aria-label="On this page">
            <span className="sw-info-label">Index</span>
            <ol className="sw-index">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span>{s.num}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </SwissReveal>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* 01 profile */}
        <SwissReveal as="section" className="sw-section sw-grid">
          <span className="sw-rule" aria-hidden="true" />
          <SectionLabel num="01" label="Profile" />
          <p className="sw-bio sw-content" id="profile">
            {person.summary}
          </p>
        </SwissReveal>

        {/* 02 writing */}
        <SwissReveal as="section" className="sw-section sw-grid">
          <span className="sw-rule" aria-hidden="true" />
          <SectionLabel num="02" label="Writing" />
          <div className="sw-content sw-stagger" id="projects">
            {featured.map((project, i) => (
              <Link className="sw-entry" href={project.slug} key={project.id}>
                <span className="sw-entry-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="sw-entry-title">
                  <small>{project.kicker}</small>
                  {project.title}
                </span>
                <span className="sw-entry-desc">{project.description}</span>
                <span className="sw-entry-arrow">
                  <Arrow />
                </span>
              </Link>
            ))}
          </div>
        </SwissReveal>

        {/* 03 experience */}
        <SwissReveal as="section" className="sw-section sw-grid">
          <span className="sw-rule" aria-hidden="true" />
          <SectionLabel num="03" label="Experience" />
          <div className="sw-content sw-stagger" id="career">
            {experience.map((role) => {
              const current = role.end === "Present";
              return (
                <article className={`sw-role${current ? " is-current" : ""}`} key={role.id}>
                  <span className="sw-role-years">
                    {role.start.slice(-4)}
                    {role.start.slice(-4) !== role.end.slice(-4) && (
                      <>&ndash;{current ? "Now" : role.end.slice(-4)}</>
                    )}
                  </span>
                  <div className="sw-role-title">
                    <h3>{role.role}</h3>
                    <span>{role.company}</span>
                  </div>
                  <ul>
                    {role.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </SwissReveal>

        {/* 04 off the clock */}
        <SwissReveal as="section" className="sw-section sw-grid">
          <span className="sw-rule" aria-hidden="true" />
          <SectionLabel num="04" label="Off the clock" />
          <div className="sw-content sw-trio sw-stagger" id="off-the-clock">
            {offTheClock.map((item, i) => (
              <div className="sw-trio-item" key={item.id}>
                <span className="sw-trio-num">{String.fromCharCode(65 + i)}</span>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </SwissReveal>

        {/* 05 tech specs */}
        <SwissReveal as="section" className="sw-section sw-grid">
          <span className="sw-rule" aria-hidden="true" />
          <SectionLabel num="05" label="Tech specs" />
          <div className="sw-content sw-specs sw-stagger" id="specs">
            {techSpecs.map((spec) => (
              <div className="sw-spec" key={spec.group}>
                <span className="sw-spec-label">{spec.group}</span>
                <ul>
                  {spec.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SwissReveal>
      </main>
    </div>
  );
}
