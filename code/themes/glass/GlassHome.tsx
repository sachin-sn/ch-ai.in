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
import GlassReveal from "./GlassReveal";
import useGlassGlare from "./useGlassGlare";

// Glassmorphism -- frosted panes floating over a slowly drifting aurora
// (painted once for the whole site by glass.css on body::before, so every
// page sits on it, not just this one). Each pane (.gl-glass) blurs and
// tints whatever drifts behind it, carries a bright top edge like real
// glass, and catches a glare that follows the cursor (useGlassGlare).
// Sections condense out of a blur as they scroll in (GlassReveal). All
// copy comes from lib/content/profile like every other theme.

function Arrow() {
  return (
    <svg className="gl-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14M13 6l6 6-6 6"
      />
    </svg>
  );
}

function SectionHead({ num, title, sub }: { num: string; title: string; sub?: string }) {
  return (
    <GlassReveal as="div" className="gl-section-head gl-reveal">
      <span className="gl-section-num gl-glass">{num}</span>
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      <span className="gl-section-line" aria-hidden="true" />
    </GlassReveal>
  );
}

export default function GlassHome({ featured }: { featured: ProjectEntry[] }) {
  useGlassGlare();
  const orbs = ["violet", "cyan", "pink"] as const;

  return (
    <div className="gl-page">
      {/* ---------------- hero ---------------- */}
      <header className="mx-auto max-w-5xl px-6 gl-hero">
        <GlassReveal as="div" className="gl-hero-copy gl-stagger">
          <span className="gl-pill gl-glass">
            <span className="gl-live" aria-hidden="true" />
            {person.openToWork.headline} &middot; {person.location}
          </span>
          <h1 className="gl-hero-title">
            Building systems <span className="gl-gradient-text">that hold.</span>
          </h1>
          <p className="gl-hero-sub">
            Senior full-stack engineer at Oracle &mdash; 12+ years across MERN, ASP.NET, and
            cloud-native architecture, shipping secure, accessible, high-performing platforms.
          </p>
          <div className="gl-btn-row">
            <a className="gl-btn gl-btn-primary" href={`mailto:${person.email}`}>
              Get in touch
              <Arrow />
            </a>
            <a className="gl-btn gl-glass" href="#career">
              View experience
            </a>
          </div>
          <div className="gl-chip-row">
            <span className="gl-chip">MERN</span>
            <span className="gl-chip">ASP.NET</span>
            <span className="gl-chip">Cloud-native</span>
            <span className="gl-chip">AI / RAG</span>
          </div>
        </GlassReveal>

        <GlassReveal as="div" className="gl-portrait-col gl-reveal" style={{ transitionDelay: "0.15s" }}>
          <div className="gl-portrait gl-glass">
            <div className="gl-portrait-frame">
              <Image
                src="/images/sachin-mono-portrait.jpg"
                alt={`Portrait of ${person.fullName}`}
                fill
                sizes="(max-width: 860px) 280px, 340px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <div className="gl-portrait-caption">
              <span>{person.name}</span>
              <span>Bengaluru</span>
            </div>
          </div>
          <span className="gl-float gl-float-a gl-glass">
            <b>12+</b> yrs engineering
          </span>
          <span className="gl-float gl-float-b gl-glass">
            now @ <b>Oracle</b>
          </span>
          <span className="gl-float gl-float-c gl-glass">
            MERN &middot; .NET &middot; Cloud
          </span>
        </GlassReveal>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* latest-post status bar */}
        {featured[0] && (
          <GlassReveal as="div" className="gl-reveal">
            <Link className="gl-status gl-glass" href={featured[0].slug}>
              <span className="gl-status-tag">Latest</span>
              <span className="gl-status-title">{featured[0].title}</span>
              <Arrow />
            </Link>
          </GlassReveal>
        )}

        {/* ---------------- bio ---------------- */}
        <section className="gl-section">
          <GlassReveal as="div" className="gl-bio gl-glass gl-reveal">
            <p className="gl-bio-text">{person.summary}</p>
            <div className="gl-hire">
              <span className="gl-hire-title">{person.openToWork.headline}</span>
              <p>{person.openToWork.body}</p>
              <a className="gl-btn gl-btn-primary gl-btn-sm" href={`mailto:${person.email}`}>
                Email me
                <Arrow />
              </a>
            </div>
          </GlassReveal>
        </section>

        {/* ---------------- writing ---------------- */}
        <section className="gl-section" id="projects">
          <SectionHead num="02" title="Latest writing" sub="Notes from the 30-day build challenge" />
          <GlassReveal as="div" className="gl-card-grid gl-stagger">
            {featured.map((project) => (
              <Link className="gl-card gl-glass" href={project.slug} key={project.id}>
                <span className="gl-card-kicker">{project.kicker}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <span className="gl-card-cta">
                  Read the post
                  <span className="gl-round-arrow">
                    <Arrow />
                  </span>
                </span>
              </Link>
            ))}
          </GlassReveal>
        </section>

        {/* ---------------- career ---------------- */}
        <section className="gl-section" id="career">
          <SectionHead num="03" title="Where I've worked" />
          <GlassReveal as="div" className="gl-timeline gl-stagger">
            {experience.map((role) => {
              const current = role.end === "Present";
              return (
                <article className={`gl-role gl-glass${current ? " is-current" : ""}`} key={role.id}>
                  <span className="gl-role-dot" aria-hidden="true" />
                  <div className="gl-role-head">
                    <div>
                      <h3>{role.role}</h3>
                      <span className="gl-role-company">{role.company}</span>
                    </div>
                    <span className="gl-role-years">
                      {role.start} &ndash; {role.end}
                    </span>
                  </div>
                  <ul>
                    {role.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </GlassReveal>
        </section>

        {/* ---------------- off the clock ---------------- */}
        <section className="gl-section">
          <SectionHead num="04" title="Off the clock" />
          <GlassReveal as="div" className="gl-tile-grid gl-stagger">
            {offTheClock.map((item, i) => (
              <div className={`gl-tile gl-glass gl-orb-${orbs[i % orbs.length]}`} key={item.id}>
                <span className="gl-orb" aria-hidden="true" />
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </GlassReveal>
        </section>

        {/* ---------------- tech specs: bento ---------------- */}
        <section className="gl-section" id="specs">
          <SectionHead num="05" title="Tech specs" />
          <GlassReveal as="div" className="gl-bento gl-stagger">
            {techSpecs.map((spec) => (
              <div className={`gl-bento-tile gl-glass${spec.items.length >= 6 ? " is-wide" : ""}`} key={spec.group}>
                <span className="gl-bento-label">{spec.group}</span>
                <ul>
                  {spec.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </GlassReveal>
        </section>
      </main>
    </div>
  );
}
