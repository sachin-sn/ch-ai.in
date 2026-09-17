import Image from "next/image";
import Link from "next/link";
import {
  person,
  experience,
  featuredProjects,
  offTheClock,
  techSpecs,
} from "@/lib/content/profile";
import MonochromeIcons from "./MonochromeIcons";
import MonoReveal from "./MonoReveal";

// techSpecs.items are pre-formatted display strings (" · " separated, or
// comma-separated with parenthetical groupings like "AWS (S3, EC2,
// Lambda, Bedrock)"). Split into individual entries without breaking
// apart anything inside parentheses, then rejoin with " / " to match
// Mono's spec-sheet voice. Same helper as themes/pixel/PixelHome.tsx and
// themes/material/MaterialHome.tsx.
function splitItems(items: string): string[] {
  if (items.includes(" · ")) {
    return items.split(" · ").map((s) => s.trim());
  }
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of items) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export default function MonochromeHome() {
  return (
    <div>
      <MonochromeIcons />

      <header className="mo-hero">
        <div className="mx-auto max-w-5xl px-6 mo-hero-grid">
          <MonoReveal as="div" className="mo-stagger">
            <p className="mo-eyebrow">
              <b>N&deg; 01</b> — Portfolio Index — {person.location}
            </p>
            <h1 className="mo-hero-title">
              Building systems
              <br />
              that hold.
            </h1>
            <p className="mo-hero-sub">
              Senior full-stack engineer at Oracle — 12+ years across MERN, ASP.NET, and
              cloud-native architecture, shipping secure, accessible, high-performing platforms.
            </p>
            <div className="mo-btn-row">
              <a className="mo-btn mo-btn-filled" href={`mailto:${person.email}`}>
                Get in touch
                <svg className="mo-icon-sm" aria-hidden="true">
                  <use href="#mo-i-arrow" />
                </svg>
              </a>
              <a className="mo-btn mo-btn-outline" href="#career">
                View experience
              </a>
            </div>
            <div className="mo-chip-row">
              <span className="mo-chip dot">{person.openToWork.headline}</span>
              <span className="mo-chip">MERN</span>
              <span className="mo-chip">ASP.NET</span>
              <span className="mo-chip">Cloud-native</span>
            </div>
          </MonoReveal>
          <MonoReveal as="div" className="mo-portrait-col mo-reveal" style={{ transitionDelay: "0.15s" }}>
            <div className="mo-portrait-frame">
              <Image
                src="/images/sachin-mono-portrait.jpg"
                alt={`Portrait of ${person.fullName}`}
                fill
                sizes="(max-width: 860px) 260px, 340px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <div className="mo-portrait-caption">
              <span>Fig. 01</span>
              <span>{person.name}</span>
            </div>
          </MonoReveal>
        </div>
        <div className="mx-auto max-w-5xl px-6">
          <MonoReveal as="div" className="mo-ticker mo-reveal" style={{ transitionDelay: "0.3s" }}>
            <span>
              <b>12+ yrs</b> engineering
            </span>
            <span>
              <b>MERN</b> / <b>ASP.NET</b> / <b>Cloud</b>
            </span>
            <span>
              Currently: <b>Oracle</b>
            </span>
            <span>
              Case studies:{" "}
              {featuredProjects.map((project, i) => (
                <span key={project.id}>
                  {i > 0 && " & "}
                  <b>{project.title}</b>
                </span>
              ))}
            </span>
          </MonoReveal>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="mo-section">
          <MonoReveal as="p" className="mo-bio-text mo-reveal">
            {person.summary}
          </MonoReveal>
          <MonoReveal as="div" className="mo-banner mo-reveal" style={{ transitionDelay: "0.1s" }}>
            <div className="mo-banner-text">
              <span className="mo-tag">{person.openToWork.headline}</span>
              <p>{person.openToWork.body}</p>
            </div>
            <a className="mo-btn mo-btn-filled" href={`mailto:${person.email}`}>
              Email me
              <svg className="mo-icon-sm" aria-hidden="true">
                <use href="#mo-i-arrow" />
              </svg>
            </a>
          </MonoReveal>
        </section>

        <section className="mo-section" id="projects">
          <MonoReveal as="div" className="mo-section-head">
            <span className="mo-section-num">N&deg; 02</span>
            <h2>Featured Projects</h2>
            <span className="mo-section-rule" />
          </MonoReveal>
          <MonoReveal as="div" className="mo-stagger">
            {featuredProjects.map((project, i) => (
              <article className="mo-project-row" key={project.id}>
                <div className="mo-project-index">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div className="mo-project-kicker">{project.kicker}</div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <Link className="mo-project-link" href={project.slug}>
                    Read the case study
                    <svg className="mo-icon-sm" aria-hidden="true">
                      <use href="#mo-i-arrow" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </MonoReveal>
        </section>

        <section className="mo-section" id="career">
          <MonoReveal as="div" className="mo-section-head">
            <span className="mo-section-num">N&deg; 03</span>
            <h2>Where I&rsquo;ve Worked</h2>
            <span className="mo-section-rule" />
          </MonoReveal>
          <MonoReveal as="div" className="mo-stagger">
            {experience.map((role) => {
              const current = role.end === "Present";
              return (
                <div className="mo-ledger-row" key={role.id}>
                  <div className="mo-ledger-years">
                    {role.yearLabel}
                    {role.yearSub ? ` — ${role.yearSub}` : ""}
                  </div>
                  <div>
                    {current && (
                      <div className="mo-ledger-meta">
                        <span className="mo-current-badge">Current</span>
                      </div>
                    )}
                    <h3>{role.role}</h3>
                    <span className="mo-ledger-company">{role.company}</span>
                    <ul>
                      {role.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </MonoReveal>
        </section>

        <section className="mo-section">
          <MonoReveal as="div" className="mo-section-head">
            <span className="mo-section-num">N&deg; 04</span>
            <h2>Off The Clock</h2>
            <span className="mo-section-rule" />
          </MonoReveal>
          <MonoReveal as="div" className="mo-side-grid mo-stagger">
            {offTheClock.map((item) => (
              <div className="mo-side-card" key={item.id}>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </MonoReveal>
        </section>

        <section className="mo-section" id="specs">
          <MonoReveal as="div" className="mo-section-head">
            <span className="mo-section-num">N&deg; 05</span>
            <h2>Tech Specs</h2>
            <span className="mo-section-rule" />
          </MonoReveal>
          <MonoReveal as="div" className="mo-stagger">
            {techSpecs.map((spec) => (
              <div className="mo-specs-row" key={spec.group}>
                <div className="mo-specs-label">{spec.group}</div>
                <div className="mo-specs-value">{splitItems(spec.items).join(" / ")}</div>
              </div>
            ))}
          </MonoReveal>
        </section>
      </main>
    </div>
  );
}
