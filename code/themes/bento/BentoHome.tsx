import Image from "next/image";
import Link from "next/link";
import {
  person,
  experience,
  offTheClock,
  techSpecs,
  type ProjectEntry,
} from "@/lib/content/profile";
import BentoReveal from "./BentoReveal";
import { CareerTile, ClockTile, SpecsTile, YearsTile } from "./BentoTiles";

// Bento Grid -- the portfolio as a keynote-style bento board: every piece
// of content is a self-contained tile on a strict grid, tiles vary in size
// to set the hierarchy, and a few are live modules (a ticking Bengaluru
// clock, a years counter, a scrolling stack, an expandable career list,
// tabbed tech specs -- see BentoTiles.tsx). Boards assemble tile by tile
// as they scroll in (BentoReveal). All copy comes from lib/content/profile.

const STACK_A = ["TypeScript", "React", "Node.js", "Next.js", "MongoDB", "Express", "GraphQL", "Tailwind CSS"];
const STACK_B = ["ASP.NET", "C#", "AWS", "GCP", "Oracle Cloud", "Docker", "Terraform", "RAG", "Agentic AI"];
const HOBBY_ICONS = [
  // prompt cookbook: a terminal prompt
  "M4 6h16v12H4zM7 10l3 2-3 2M12 15h5",
  // riders' club: a group of people
  "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 19c0-3 3-5 6-5s6 2 6 5M16 11a2.5 2.5 0 1 0 0-5M17 14c2 .4 4 2 4 5",
  // 3D printing & NAS: a cube
  "M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5",
];

function Arrow() {
  return (
    <svg className="bn-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

export default function BentoHome({ featured }: { featured: ProjectEntry[] }) {
  const current = experience.find((r) => r.end === "Present") ?? experience[0];

  return (
    <div className="bn-page mx-auto max-w-5xl px-6">
      {/* ---------------- board 1: hero ---------------- */}
      <BentoReveal className="bn-grid bn-grid-hero">
        <section className="bn-tile bn-intro">
          <span className="bn-label">Portfolio &mdash; {new Date().getFullYear()}</span>
          <h1 className="bn-title">
            Building systems <span>that hold.</span>
          </h1>
          <p className="bn-intro-sub">
            Senior full-stack engineer at Oracle &mdash; 12+ years across MERN, ASP.NET, and
            cloud-native architecture, shipping secure, accessible, high-performing platforms.
          </p>
          <div className="bn-btn-row">
            <a className="bn-btn bn-btn-primary" href={`mailto:${person.email}`}>
              Get in touch
            </a>
            <a className="bn-btn" href="#career">
              View experience
            </a>
          </div>
        </section>

        <figure className="bn-tile bn-photo">
          <Image
            src="/images/sachin-mono-portrait.jpg"
            alt={`Portrait of ${person.fullName}`}
            fill
            sizes="(max-width: 860px) 50vw, 240px"
            style={{ objectFit: "cover" }}
            priority
          />
          <figcaption>
            <b>{person.name}</b>
            <span>{person.location}</span>
          </figcaption>
        </figure>

        <section className="bn-tile bn-status">
          <span className="bn-label">Status</span>
          <div>
            <span className="bn-status-line">
              <span className="bn-dot" aria-hidden="true" />
              {person.openToWork.headline}
            </span>
            <a className="bn-mini-link" href={`mailto:${person.email}`}>
              Say hello <Arrow />
            </a>
          </div>
        </section>

        <section className="bn-tile bn-clock-tile">
          <ClockTile />
        </section>

        <section className="bn-tile bn-years-tile">
          <YearsTile years={12} />
        </section>

        <section className="bn-tile bn-now">
          <span className="bn-label">Now</span>
          <div>
            <b>{current.company}</b>
            <span className="bn-sub">
              {current.role} &middot; since {current.start}
            </span>
          </div>
        </section>

        <section className="bn-tile bn-stack" aria-label="Primary stack">
          <span className="bn-label">Stack</span>
          <div className="bn-marquee" aria-hidden="true">
            {[STACK_A, STACK_B].map((row, r) => (
              <div className={`bn-marquee-row${r ? " is-reverse" : ""}`} key={r}>
                {[...row, ...row].map((item, i) => (
                  <span key={i}>{item}</span>
                ))}
              </div>
            ))}
          </div>
          <p className="sr-only">{[...STACK_A, ...STACK_B].join(", ")}</p>
        </section>
      </BentoReveal>

      {/* ---------------- board 2: about + writing ---------------- */}
      <BentoReveal className="bn-grid bn-grid-about" style={{ marginTop: 16 }}>
        <section className="bn-tile bn-bio">
          <span className="bn-label">About</span>
          <p>{person.summary}</p>
        </section>
        {featured.map((project, i) => (
          <Link className={`bn-tile bn-post bn-post-${i}`} href={project.slug} key={project.id} id={i === 0 ? "projects" : undefined}>
            <span className="bn-label">{project.kicker}</span>
            <span className="bn-post-title">{project.title}</span>
            <span className="bn-post-desc">{project.description}</span>
            <span className="bn-round">
              <Arrow />
            </span>
          </Link>
        ))}
      </BentoReveal>

      {/* ---------------- board 3: career + off the clock ---------------- */}
      <BentoReveal className="bn-grid bn-grid-career" style={{ marginTop: 16 }}>
        <section className="bn-tile bn-career-tile" id="career">
          <CareerTile roles={experience} />
        </section>
        {offTheClock.map((item, i) => (
          <section className={`bn-tile bn-hobby bn-hobby-${i}`} key={item.id}>
            <svg className="bn-hobby-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d={HOBBY_ICONS[i % HOBBY_ICONS.length]} />
            </svg>
            <div>
              <span className="bn-hobby-title">{item.title}</span>
              <span className="bn-sub">{item.description}</span>
            </div>
          </section>
        ))}
        <a className="bn-tile bn-contact" href={`mailto:${person.email}`}>
          <span className="bn-label">Contact</span>
          <span className="bn-contact-title">Let&rsquo;s build something that holds.</span>
          <span className="bn-contact-mail">
            {person.email}
            <Arrow />
          </span>
        </a>
      </BentoReveal>

      {/* ---------------- board 4: tech specs ---------------- */}
      <BentoReveal className="bn-grid bn-grid-specs" style={{ marginTop: 16 }}>
        <section className="bn-tile bn-specs" id="specs">
          <SpecsTile specs={techSpecs} />
        </section>
      </BentoReveal>
    </div>
  );
}
