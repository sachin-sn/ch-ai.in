import Link from "next/link";
import Reveal from "@/components/Reveal";
import {
  person,
  experience,
  featuredProjects,
  offTheClock,
  techSpecs,
} from "@/lib/content/profile";
import ParallaxCoverPhoto from "./ParallaxCoverPhoto";

export default function MagazineHome() {
  return (
    <div>
      <div className="mag-cover-outer">
        <div className="mag-cover-frame reveal in">
          <div className="mag-streaks" aria-hidden="true">
            <div className="mag-streak" style={{ right: "14%", top: "-10%" }} />
            <div
              className="mag-streak mag-streak-highlight"
              style={{ right: "20%", top: "8%", height: 180 }}
            />
            <div className="mag-streak" style={{ right: "9%", top: "30%", height: 200 }} />
            <div
              className="mag-streak mag-streak-highlight"
              style={{ right: "26%", top: "-4%", height: 140 }}
            />
          </div>

          <div className="mag-cover-grid">
            <div className="mag-cover-photo-col">
              <ParallaxCoverPhoto
                src="/images/sachin-watercolor.jpg"
                alt={person.fullName}
              />
              <div className="mag-duotone-overlay" />
              <div className="mag-duotone-overlay2" />
              <div className="mag-masthead-scrim" />
            </div>

            <div className="mag-cover-text-col">
              <span className="mag-cover-eyebrow">A career trends report</span>
              <h1 className="mag-cover-headline">
                Building at <span className="mag-accent">scale</span>,<br />
                end to end.
              </h1>
              <ul className="mag-cover-teasers">
                <li>
                  <a href="#career">
                    <span className="mag-t-label">
                      12+ years across MERN, ASP.NET &amp; cloud
                    </span>
                    <span className="mag-t-tag">Career</span>
                  </a>
                </li>
                <li>
                  <a href="#career">
                    <span className="mag-t-label">
                      Currently: Oracle Cloud Shell &amp; UXE Console
                    </span>
                    <span className="mag-t-tag">Now</span>
                  </a>
                </li>
                <li>
                  <a href="#projects">
                    <span className="mag-t-label">
                      Case studies: Chitraguptha &amp; TTL Cache
                    </span>
                    <span className="mag-t-tag">Projects</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mag-cover-masthead">
            <p className="mag-name">
              Sachin <em>Sira</em>
              <br />
              Nagaraja
            </p>
            <div className="mag-rule" />
          </div>

          <div className="mag-edition-line">
            <span>Bengaluru Ed.</span>
            <span>
              <b>Issue 01</b> — Engineering Edition, {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>

      <Reveal as="section" className="mag-standfirst">
        <div className="mx-auto max-w-5xl px-6 mag-standfirst-inner">
          <div className="mag-standfirst-label">Profile</div>
          <p>{person.summary}</p>
        </div>
      </Reveal>

      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="mag-callout">
          <div className="mag-stamp">{person.openToWork.headline}</div>
          <p>{person.openToWork.body}</p>
          <a className="mag-email" href={`mailto:${person.email}`}>
            {person.email} →
          </a>
        </Reveal>

        <Reveal as="section" className="mag-block" id="projects">
          <div className="mag-section-head">
            <span className="mag-num">01</span>
            <h2>Featured Stories</h2>
            <span className="mag-rule-flex" />
          </div>
          <div className="mag-stories">
            {featuredProjects.map((project) => (
              <article className="mag-story" key={project.id}>
                <div className="mag-kicker">{project.kicker}</div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <Link className="mag-read" href={project.slug}>
                  Read the case study →
                </Link>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" className="mag-block" id="career">
          <div className="mag-section-head">
            <span className="mag-num">02</span>
            <h2>The Career Issue</h2>
            <span className="mag-rule-flex" />
          </div>
          <div>
            {experience.map((role) => (
              <div className="mag-toc-row" key={role.id}>
                <div className="mag-toc-year">
                  {role.yearLabel}
                  {role.yearSub && <small>{role.yearSub}</small>}
                </div>
                <div className="mag-toc-role">
                  <h4>{role.role}</h4>
                  <span className="mag-company">{role.company}</span>
                  <ul>
                    {role.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
                <div className="mag-page">
                  {role.start} {role.end === "Present" ? "→" : `– ${role.end}`}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" className="mag-block">
          <div className="mag-section-head">
            <span className="mag-num">03</span>
            <h2>Off The Clock &amp; The Specs</h2>
            <span className="mag-rule-flex" />
          </div>
          <div className="mag-split">
            <div>
              {offTheClock.map((item) => (
                <div className="mag-offclock-item" key={item.id}>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mag-specs">
              <span className="mag-specs-title">Tech Specs</span>
              <dl>
                {techSpecs.map((spec) => (
                  <div className="mag-grp" key={spec.group}>
                    <dt>{spec.group}</dt>
                    <dd>{spec.items}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
