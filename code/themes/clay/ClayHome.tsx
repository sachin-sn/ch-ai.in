"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  person,
  experience,
  offTheClock,
  techSpecs,
  type ProjectEntry,
} from "@/lib/content/profile";
import ClayReveal from "./ClayReveal";
import useClayParallax from "./useClayParallax";

// Claymorphism -- the portfolio modelled in soft pastel clay. Every
// surface is a puffy, rounded slab: lit from the top-left (inner
// highlight), shaded bottom-right (inner shadow), floating on a soft
// drop shadow. Clay shapes (a sphere, a pill, a ring, a cube) drift around
// the hero and lean away from the pointer (useClayParallax); content pops
// in with a squash-and-stretch (ClayReveal); buttons and keycaps squish
// when pressed. All copy comes from lib/content/profile.

const TONES = ["pink", "mint", "sky", "butter", "lilac", "peach"] as const;

function Arrow() {
  return (
    <svg className="cl-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14M13 6l6 6-6 6"
      />
    </svg>
  );
}

function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <ClayReveal as="div" className="cl-section-head cl-reveal">
      <span className="cl-section-num cl-clay">{num}</span>
      <h2>{title}</h2>
    </ClayReveal>
  );
}

export default function ClayHome({ featured }: { featured: ProjectEntry[] }) {
  const heroRef = useRef<HTMLElement>(null);
  useClayParallax(heroRef);

  return (
    <div className="cl-page">
      {/* ---------------- hero ---------------- */}
      <header className="cl-hero" ref={heroRef}>
        <div className="mx-auto max-w-5xl px-6 cl-hero-grid">
          <ClayReveal as="div" className="cl-hero-copy cl-stagger">
            <span className="cl-badge cl-clay">
              <span className="cl-live" aria-hidden="true" />
              {person.openToWork.headline}
            </span>
            <h1 className="cl-hero-title">
              Building systems <span className="cl-puffy">that hold.</span>
            </h1>
            <p className="cl-hero-sub">
              Senior full-stack engineer at Oracle &mdash; 12+ years across MERN, ASP.NET, and
              cloud-native architecture, shipping secure, accessible, high-performing platforms.
            </p>
            <div className="cl-btn-row">
              <a className="cl-btn cl-btn-primary" href={`mailto:${person.email}`}>
                Get in touch
                <Arrow />
              </a>
              <a className="cl-btn cl-btn-soft" href="#career">
                View experience
              </a>
            </div>
            <div className="cl-chip-row">
              <span className="cl-chip cl-tone-pink">MERN</span>
              <span className="cl-chip cl-tone-mint">ASP.NET</span>
              <span className="cl-chip cl-tone-sky">Cloud-native</span>
              <span className="cl-chip cl-tone-butter">{person.location}</span>
            </div>
          </ClayReveal>

          <ClayReveal as="div" className="cl-hero-art cl-reveal" style={{ transitionDelay: "0.15s" }}>
            <span className="cl-shape cl-sphere" style={{ ["--d" as string]: 26 }} aria-hidden="true" />
            <span className="cl-shape cl-pill" style={{ ["--d" as string]: -18 }} aria-hidden="true" />
            <span className="cl-shape cl-ring" style={{ ["--d" as string]: 34 }} aria-hidden="true" />
            <span className="cl-shape cl-cube" style={{ ["--d" as string]: -28 }} aria-hidden="true" />
            <span className="cl-shape cl-dot" style={{ ["--d" as string]: 44 }} aria-hidden="true" />
            <div className="cl-avatar cl-clay">
              <div className="cl-avatar-photo">
                <Image
                  src="/images/sachin-mono-portrait.jpg"
                  alt={`Portrait of ${person.fullName}`}
                  fill
                  sizes="(max-width: 860px) 240px, 300px"
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            </div>
            <span className="cl-sticker cl-clay">
              <b>12+</b> yrs
            </span>
          </ClayReveal>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* ---------------- bio ---------------- */}
        <section className="cl-section">
          <ClayReveal as="div" className="cl-bio cl-clay cl-reveal">
            <p className="cl-bio-text">{person.summary}</p>
            <div className="cl-bio-side">
              <div className="cl-stat cl-clay cl-tone-lilac">
                <b>12+</b>
                <span>years building</span>
              </div>
              <div className="cl-stat cl-clay cl-tone-mint">
                <b>Oracle</b>
                <span>right now</span>
              </div>
              <a className="cl-btn cl-btn-primary cl-btn-block" href={`mailto:${person.email}`}>
                Email me <Arrow />
              </a>
            </div>
          </ClayReveal>
        </section>

        {/* ---------------- writing ---------------- */}
        <section className="cl-section" id="projects">
          <SectionHead num="02" title="Latest writing" />
          <ClayReveal as="div" className="cl-card-grid cl-stagger">
            {featured.map((project, i) => (
              <Link className={`cl-card cl-clay cl-tone-${TONES[i % TONES.length]}`} href={project.slug} key={project.id}>
                <span className="cl-card-kicker">{project.kicker}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <span className="cl-card-cta">
                  Read the post
                  <span className="cl-knob cl-clay">
                    <Arrow />
                  </span>
                </span>
              </Link>
            ))}
          </ClayReveal>
        </section>

        {/* ---------------- career ---------------- */}
        <section className="cl-section" id="career">
          <SectionHead num="03" title="Where I've worked" />
          <ClayReveal as="div" className="cl-career cl-stagger">
            {experience.map((role) => {
              const current = role.end === "Present";
              return (
                <article className={`cl-role cl-clay${current ? " cl-tone-lilac is-current" : ""}`} key={role.id}>
                  <div className="cl-role-years cl-clay">
                    <b>{role.yearLabel}</b>
                    <span>{current ? "now" : role.yearSub.replace(/[–-]/, "") || "—"}</span>
                  </div>
                  <div className="cl-role-body">
                    <h3>{role.role}</h3>
                    <span className="cl-role-company">{role.company}</span>
                    <ul>
                      {role.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </ClayReveal>
        </section>

        {/* ---------------- off the clock ---------------- */}
        <section className="cl-section">
          <SectionHead num="04" title="Off the clock" />
          <ClayReveal as="div" className="cl-tiles cl-stagger">
            {offTheClock.map((item, i) => (
              <div className={`cl-tile cl-clay cl-tone-${["peach", "sky", "butter"][i % 3]}`} key={item.id}>
                <span className={`cl-tile-icon cl-tile-icon-${i % 3}`} aria-hidden="true" />
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </ClayReveal>
        </section>

        {/* ---------------- tech specs: keycaps ---------------- */}
        <section className="cl-section" id="specs">
          <SectionHead num="05" title="Tech specs" />
          <ClayReveal as="div" className="cl-trays cl-stagger">
            {techSpecs.map((spec) => (
              <div className="cl-tray cl-clay" key={spec.group}>
                <span className="cl-tray-label">{spec.group}</span>
                <ul>
                  {spec.items.map((item) => (
                    <li className="cl-key" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ClayReveal>
        </section>
      </main>
    </div>
  );
}
