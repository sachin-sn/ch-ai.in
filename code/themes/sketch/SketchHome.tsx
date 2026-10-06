import Image from "next/image";
import Link from "next/link";
import {
  person,
  experience,
  offTheClock,
  techSpecs,
  type ProjectEntry,
} from "@/lib/content/profile";
import SketchDefs from "./SketchDefs";
import SketchReveal from "./SketchReveal";

// Conceptual Sketch -- the portfolio drawn as an architect's concept
// sketchbook page: graph paper, graphite lines that wobble, red-pen
// margin notes, tape, sticky notes, and dimension lines. Every underline,
// arrow and circle draws itself in as it scrolls into view (SketchReveal +
// .sk-draw in sketch.css). All copy comes from lib/content/profile like
// every other theme; only the voice and the drawing change.

function Arrow({ className = "sk-icon" }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href="#sk-i-arrow" />
    </svg>
  );
}

// Section heading: a red-pen circled number, the title in handwriting,
// and a scribbled underline that draws in when the heading is reached.
function SectionHead({ num, title, note }: { num: string; title: string; note?: string }) {
  return (
    <SketchReveal as="div" className="sk-section-head">
      <span className="sk-section-num">
        {num}
        <svg className="sk-num-ring" viewBox="0 0 60 50" aria-hidden="true">
          <path
            className="sk-draw"
            pathLength={1}
            d="M33 4C18 2 5 10 4 24c-1 13 12 22 27 21 15-1 26-10 25-22C55 11 43 3 27 6"
          />
        </svg>
      </span>
      <h2>
        {title}
        <svg className="sk-underline" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">
          <path className="sk-draw" pathLength={1} d="M3 10c40-5 90-7 140-5s100 4 154-2" />
          <path className="sk-draw sk-draw-late" pathLength={1} d="M30 14c50-3 120-4 200-1" />
        </svg>
      </h2>
      {note && <span className="sk-margin-note">{note}</span>}
    </SketchReveal>
  );
}

export default function SketchHome({ featured }: { featured: ProjectEntry[] }) {
  const tones = ["yellow", "pink", "blue"] as const;

  return (
    <div className="sk-page">
      <SketchDefs />

      {/* ---------------- hero ---------------- */}
      <header className="sk-hero">
        <div className="mx-auto max-w-5xl px-6 sk-hero-grid">
          <SketchReveal as="div" className="sk-stagger">
            <p className="sk-eyebrow">
              <span className="sk-eyebrow-tag">Sketch N&deg; 01</span>
              concept for a portfolio &mdash; {person.location}
            </p>
            <h1 className="sk-hero-title">
              Building systems <br />
              <span className="sk-hero-hold">
                that hold.
                <svg className="sk-hero-scribble" viewBox="0 0 320 40" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    className="sk-draw"
                    pathLength={1}
                    d="M6 26c50-10 120-14 190-12 40 1 80 4 116 9M40 34c60-6 150-8 240-3"
                  />
                </svg>
              </span>
            </h1>
            <div className="sk-hero-note" aria-hidden="true">
              <svg viewBox="0 0 90 60">
                <path className="sk-draw" pathLength={1} d="M84 8C60 4 30 10 18 34c-3 6-4 12-4 18M6 40c3 5 6 9 8 13 4-4 8-7 13-10" />
              </svg>
              <span>the whole idea, really</span>
            </div>
            <p className="sk-hero-sub">
              Senior full-stack engineer at Oracle &mdash; 12+ years across MERN, ASP.NET, and
              cloud-native architecture, shipping secure, accessible, high-performing platforms.
            </p>
            <div className="sk-btn-row">
              <a className="sk-btn sk-btn-ink" href={`mailto:${person.email}`}>
                Get in touch
                <Arrow />
              </a>
              <a className="sk-btn sk-btn-outline" href="#career">
                View experience
              </a>
            </div>
            <div className="sk-chip-row">
              <span className="sk-chip sk-chip-live">{person.openToWork.headline}</span>
              <span className="sk-chip">MERN</span>
              <span className="sk-chip">ASP.NET</span>
              <span className="sk-chip">Cloud-native</span>
            </div>
          </SketchReveal>

          <SketchReveal as="div" className="sk-portrait-col sk-reveal" style={{ transitionDelay: "0.2s" }}>
            <div className="sk-polaroid">
              <span className="sk-tape sk-tape-left" aria-hidden="true" />
              <span className="sk-tape sk-tape-right" aria-hidden="true" />
              <div className="sk-portrait-frame">
                <Image
                  src="/images/sachin-mono-portrait.jpg"
                  alt={`Portrait of ${person.fullName}`}
                  fill
                  sizes="(max-width: 860px) 260px, 320px"
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
              <p className="sk-polaroid-caption">fig. 1 &mdash; {person.firstName}, roughly</p>
            </div>
          </SketchReveal>
        </div>

        {/* dimension line: the "measurements" of the drawing */}
        <div className="mx-auto max-w-5xl px-6">
          <SketchReveal as="div" className="sk-dimension sk-reveal" style={{ transitionDelay: "0.35s" }}>
            <svg className="sk-dimension-line" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">
              <path className="sk-draw" pathLength={1} d="M4 10C250 8 600 12 996 9M4 2v16M996 1v16M4 10l14-6M4 10l14 6M996 9l-14-6M996 9l-14 6" />
            </svg>
            <div className="sk-dimension-labels">
              <span><b>12+ yrs</b> engineering</span>
              <span><b>MERN</b> / <b>ASP.NET</b> / <b>Cloud</b></span>
              <span>now @ <b>Oracle</b></span>
              <span>latest: <b>{featured[0]?.title ?? "coming soon"}</b></span>
            </div>
          </SketchReveal>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* ---------------- bio + sticky note ---------------- */}
        <section className="sk-section sk-bio-grid">
          <SketchReveal as="p" className="sk-bio-text sk-reveal">
            {person.summary}
          </SketchReveal>
          <SketchReveal as="div" className="sk-sticky sk-sticky-yellow sk-reveal" style={{ transitionDelay: "0.15s" }}>
            <span className="sk-tape sk-tape-top" aria-hidden="true" />
            <span className="sk-sticky-title">{person.openToWork.headline}!</span>
            <p>{person.openToWork.body}</p>
            <a className="sk-sticky-link" href={`mailto:${person.email}`}>
              email me <Arrow />
            </a>
          </SketchReveal>
        </section>

        {/* ---------------- writing ---------------- */}
        <section className="sk-section" id="projects">
          <SectionHead num="02" title="Latest writing" note="fresh off the notebook" />
          <SketchReveal as="div" className="sk-card-grid sk-stagger">
            {featured.map((project, i) => (
              <article className="sk-card" key={project.id}>
                <span className="sk-card-index">{String(i + 1).padStart(2, "0")}</span>
                <div className="sk-card-kicker">{project.kicker}</div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <Link className="sk-link" href={project.slug}>
                  Read the post
                  <Arrow />
                </Link>
              </article>
            ))}
          </SketchReveal>
        </section>

        {/* ---------------- career timeline ---------------- */}
        <section className="sk-section" id="career">
          <SectionHead num="03" title="Where I've worked" />
          <SketchReveal as="div" className="sk-timeline sk-stagger">
            {experience.map((role) => {
              const current = role.end === "Present";
              return (
                <div className={`sk-timeline-row${current ? " is-current" : ""}`} key={role.id}>
                  <div className="sk-timeline-years">
                    {role.yearLabel}
                    {role.yearSub && <small>{role.yearSub.toLowerCase()}</small>}
                  </div>
                  <span className="sk-timeline-node" aria-hidden="true" />
                  <div className="sk-timeline-body">
                    <h3>
                      {role.role}
                      {current && (
                        <span className="sk-now">
                          <svg className="sk-icon" aria-hidden="true">
                            <use href="#sk-i-star" />
                          </svg>
                          now
                        </span>
                      )}
                    </h3>
                    <span className="sk-timeline-company">{role.company}</span>
                    <ul>
                      {role.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </SketchReveal>
        </section>

        {/* ---------------- off the clock: pinned notes ---------------- */}
        <section className="sk-section">
          <SectionHead num="04" title="Off the clock" note="weekend doodles" />
          <SketchReveal as="div" className="sk-notes-grid sk-stagger">
            {offTheClock.map((item, i) => (
              <div className={`sk-sticky sk-sticky-${tones[i % tones.length]}`} key={item.id}>
                <span className="sk-pin" aria-hidden="true" />
                <span className="sk-sticky-title">{item.title}</span>
                <p>{item.description}</p>
              </div>
            ))}
          </SketchReveal>
        </section>

        {/* ---------------- tech specs: annotated parts list ---------------- */}
        <section className="sk-section" id="specs">
          <SectionHead num="05" title="Tech specs" note="parts list" />
          <SketchReveal as="div" className="sk-specs sk-stagger">
            {techSpecs.map((spec) => (
              <div className="sk-specs-row" key={spec.group}>
                <div className="sk-specs-label">
                  {spec.group}
                  <Arrow />
                </div>
                <ul className="sk-specs-items">
                  {spec.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </SketchReveal>
        </section>
      </main>
    </div>
  );
}
