import Image from "next/image";
import Link from "next/link";
import {
  person,
  experience,
  featuredProjects,
  offTheClock,
  techSpecs,
} from "@/lib/content/profile";
import MaterialIcons from "./MaterialIcons";

// techSpecs.items are pre-formatted display strings (" · " separated, or
// comma-separated with parenthetical groupings like "AWS (S3, EC2,
// Lambda, Bedrock)"). Split into individual chips without breaking apart
// anything inside parentheses. Same helper as themes/pixel/PixelHome.tsx.
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

const projectBarColors = ["terracotta", "sage"] as const;

export default function MaterialHome() {
  return (
    <div>
      <MaterialIcons />

      <header className="m-hero">
        <div
          className="m-blob m-elev-1"
          style={{
            width: 420,
            height: 420,
            background: "var(--m-rose)",
            top: -160,
            right: -120,
            opacity: 0.28,
            animationDuration: "26s",
          }}
        />
        <div
          className="m-blob"
          style={{
            width: 280,
            height: 280,
            background: "var(--m-mustard)",
            bottom: -120,
            left: -80,
            opacity: 0.22,
            animationDuration: "19s",
            animationDelay: "-6s",
          }}
        />
        <div
          className="m-ring-accent"
          style={{ width: 110, height: 110, top: 40, left: "38%", animationDuration: "30s" }}
        />
        <div className="mx-auto max-w-5xl px-6 m-hero-grid">
          <div className="m-arch-frame">
            <svg className="m-branch left" aria-hidden="true">
              <use href="#m-i-branch" />
            </svg>
            <svg className="m-branch right" aria-hidden="true">
              <use href="#m-i-branch" />
            </svg>
            <div className="m-arch-clip m-elev-3">
              <Image
                src="/images/sachin-boho-portrait.jpg"
                alt={`Portrait of ${person.fullName}`}
                fill
                sizes="(max-width: 860px) 220px, 300px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          </div>
          <div className="m-hero-copy">
            <p className="m-eyebrow">Portfolio — {person.location}</p>
            <h1 className="m-hero-title">
              Building <em>calm, considered</em>
              <br />
              software at scale.
            </h1>
            <p className="m-hero-sub">
              Senior full-stack engineer at Oracle — 12+ years across MERN, ASP.NET, and
              cloud-native architecture, shipping secure, accessible, high-performing platforms.
            </p>
            <div className="m-btn-row">
              <a className="m-btn m-btn-filled" href={`mailto:${person.email}`}>
                Get in touch
                <svg className="m-icon-sm" aria-hidden="true">
                  <use href="#m-i-arrow" />
                </svg>
              </a>
              <a className="m-btn m-btn-outline" href="#career">
                View experience
              </a>
            </div>
            <div className="m-chip-row">
              <span className="m-chip dot">{person.openToWork.headline}</span>
              <span className="m-chip">MERN</span>
              <span className="m-chip">ASP.NET</span>
              <span className="m-chip">Cloud-native</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="m-section">
          <div
            className="m-blob"
            style={{
              width: 180,
              height: 180,
              background: "var(--m-rose)",
              top: -30,
              left: -90,
              opacity: 0.24,
              animationDuration: "22s",
            }}
          />
          <div
            className="m-blob spin"
            style={{
              width: 110,
              height: 110,
              background: "var(--color-highlight)",
              bottom: 10,
              right: -40,
              opacity: 0.18,
              animationDuration: "17s",
              animationDelay: "-4s",
            }}
          />
          <div className="m-section-inner">
            <div className="m-card m-elev-2">
              <div className="m-bio-quote">&ldquo;</div>
              <p className="m-bio-text">{person.summary}</p>
            </div>
            <div className="m-banner">
              <div className="m-banner-text">
                <span className="m-tag">{person.openToWork.headline}</span>
                <p>{person.openToWork.body}</p>
              </div>
              <a className="m-btn m-btn-filled" href={`mailto:${person.email}`}>
                Email me
                <svg className="m-icon-sm" aria-hidden="true">
                  <use href="#m-i-arrow" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <section className="m-section" id="projects">
          <div
            className="m-blob"
            style={{
              width: 200,
              height: 200,
              background: "var(--m-mustard)",
              top: -40,
              right: -70,
              opacity: 0.2,
              animationDuration: "24s",
              animationDelay: "-9s",
            }}
          />
          <div
            className="m-leaf-accent"
            style={{ width: 34, height: 34, top: 6, left: -6, animationDuration: "8s" }}
          >
            <svg aria-hidden="true">
              <use href="#m-i-leaf" />
            </svg>
          </div>
          <div className="m-section-inner">
            <div className="m-section-head">
              <p className="m-section-eyebrow">Selected work</p>
              <h2>Featured projects</h2>
            </div>
            <div className="m-project-grid">
              {featuredProjects.map((project, i) => (
                <article className="m-project-card m-elev-1" key={project.id}>
                  <div className={`m-project-bar ${projectBarColors[i % projectBarColors.length]}`} />
                  <div className="m-project-body">
                    <div className="m-project-kicker">{project.kicker}</div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <Link className="m-project-link" href={project.slug}>
                      Read the case study
                      <svg className="m-icon-sm" aria-hidden="true">
                        <use href="#m-i-arrow" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="m-section" id="career">
          <div
            className="m-blob"
            style={{
              width: 260,
              height: 260,
              background: "var(--color-highlight)",
              top: 60,
              right: -130,
              opacity: 0.16,
              animationDuration: "28s",
              animationDelay: "-14s",
            }}
          />
          <div
            className="m-ring-accent"
            style={{ width: 90, height: 90, bottom: 60, left: -40, animationDuration: "21s" }}
          />
          <div className="m-section-inner">
            <div className="m-section-head">
              <p className="m-section-eyebrow">Experience</p>
              <h2>Where I&rsquo;ve worked</h2>
            </div>
            <div className="m-stepper">
              {experience.map((role) => {
                const current = role.end === "Present";
                return (
                  <div className={`m-step${current ? " current" : ""}`} key={role.id}>
                    <div className="m-step-dot" />
                    <div className="m-step-card m-elev-1">
                      <div className="m-step-meta">
                        <span className="m-step-years">
                          {role.yearLabel}
                          {role.yearSub ? ` — ${role.yearSub}` : ""}
                        </span>
                        {current && <span className="m-step-current-badge">Current</span>}
                      </div>
                      <h3>{role.role}</h3>
                      <span className="m-step-company">{role.company}</span>
                      <ul>
                        {role.highlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="m-section">
          <div
            className="m-blob"
            style={{
              width: 150,
              height: 150,
              background: "var(--m-mustard)",
              bottom: -50,
              left: "20%",
              opacity: 0.2,
              animationDuration: "20s",
              animationDelay: "-11s",
            }}
          />
          <div
            className="m-leaf-accent"
            style={{ width: 30, height: 30, top: -4, right: "8%", animationDuration: "7.5s", animationDelay: "-2s" }}
          >
            <svg aria-hidden="true">
              <use href="#m-i-leaf" />
            </svg>
          </div>
          <div className="m-section-inner">
            <div className="m-section-head">
              <p className="m-section-eyebrow">Off the clock</p>
              <h2>Outside of work</h2>
            </div>
            <div className="m-side-grid">
              {offTheClock.map((item) => (
                <div className="m-side-card" key={item.id}>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="m-section" id="specs">
          <div
            className="m-blob"
            style={{
              width: 190,
              height: 190,
              background: "var(--m-rose)",
              bottom: -70,
              left: -90,
              opacity: 0.22,
              animationDuration: "23s",
              animationDelay: "-7s",
            }}
          />
          <div
            className="m-ring-accent"
            style={{ width: 70, height: 70, top: 0, right: "6%", animationDuration: "18s" }}
          />
          <div className="m-section-inner">
            <div className="m-section-head">
              <p className="m-section-eyebrow">Toolbox</p>
              <h2>Tech specs</h2>
            </div>
            <div className="m-specs-card m-elev-1">
              {techSpecs.map((spec) => (
                <div className="m-specs-group" key={spec.group}>
                  <div className="m-specs-label">{spec.group}</div>
                  <div className="m-chip-cloud">
                    {splitItems(spec.items).map((item) => (
                      <span className="m-tech-chip" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
