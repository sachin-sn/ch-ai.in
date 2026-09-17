import Link from "next/link";
import Image from "next/image";
import {
  person,
  experience,
  featuredProjects,
  offTheClock,
  techSpecs,
} from "@/lib/content/profile";
import PixelIcons from "./PixelIcons";
import TypeReveal from "./TypeReveal";

// Cosmetic-only flavor data (not resume facts) keyed by the content
// entries' existing ids, so it stays in sync if profile.ts is reordered.
const levelStars: Record<string, number> = {
  chitraguptha: 3,
  ttlcache: 4,
};

const questRewards: Record<string, string> = {
  oracle: "MAX",
  diligent: "5200",
  "one-advanced": "3400",
  ness: "2100",
  tenet: "900",
};

// techSpecs.items are pre-formatted display strings (" · " separated, or
// comma-separated with parenthetical groupings like "AWS (S3, EC2,
// Lambda, Bedrock)"). Split into individual inventory chips without
// breaking apart anything inside parentheses.
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

export default function PixelHome() {
  return (
    <div>
      <PixelIcons />

      <header className="px-hero">
        <div className="mx-auto max-w-5xl px-6 px-hero-grid">
          <div className="px-char-card">
            <div className="px-frame">
              <div className="px-notch-bl"></div>
              <div className="px-notch-br"></div>
              <div className="px-char-photo-frame">
                <Image
                  src="/images/sachin-pixel-avatar.png"
                  alt={`Pixel-art portrait of ${person.fullName}`}
                  width={504}
                  height={630}
                  priority
                  unoptimized
                />
              </div>
            </div>
            <div className="px-char-name-plate">
              <div className="px-name">
                {person.firstName.toUpperCase()} {person.middleName.toUpperCase()}
                <br />
                {person.lastName.toUpperCase()}
              </div>
              <div className="px-class-line">CLASS: FULL-STACK ENGINEER</div>
            </div>
            <div className="px-char-stats">
              <div className="px-stat-row">
                <span className="px-stat-label">LV.12</span>
                <div className="px-stat-bar-track">
                  <div className="px-stat-bar-fill px-lv"></div>
                </div>
              </div>
              <div className="px-stat-row">
                <span className="px-stat-label">HP</span>
                <div className="px-stat-bar-track">
                  <div className="px-stat-bar-fill px-hp"></div>
                </div>
              </div>
              <div className="px-stat-row">
                <span className="px-stat-label">XP</span>
                <div className="px-stat-bar-track">
                  <div className="px-stat-bar-fill px-xp"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-hero-copy">
            <div className="px-eyebrow">NEW GAME — CONTINUE PROFILE</div>
            <h1 className="px-hero-title">
              BUILDING AT <span className="px-hl">SCALE</span>,<br />
              END TO END.
            </h1>
            <p className="px-hero-sub">
              Senior full-stack engineer at Oracle — 12+ years across MERN, ASP.NET &amp;
              cloud-native architecture. Currently shipping the Oracle Cloud Shell &amp; UXE
              Console.
            </p>
            <a className="px-press-start" href="#projects">
              <svg className="px-icon">
                <use href="#px-i-controller" />
              </svg>
              PRESS START
            </a>
            <div className="px-insert-coin">INSERT COIN TO CONTINUE ▸ SCROLL DOWN</div>
          </div>
        </div>

        <div className="px-marquee-bar">
          <div className="px-marquee-track">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i}>
                <span>★ 12+ YEARS MERN / ASP.NET / CLOUD</span>
                <span>★ CURRENTLY: ORACLE CLOUD SHELL &amp; UXE CONSOLE</span>
                <span>★ CASE STUDIES: CHITRAGUPTHA &amp; TTL CACHE</span>
                <span>★ OPEN TO NEW ROLES</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="px-section" style={{ paddingTop: 8 }}>
          <span className="px-dialogue-label">&gt; PROFILE.TXT</span>
          <div className="px-dialogue">
            <TypeReveal text={person.summary} />
            <div className="px-dialogue-tail"></div>
          </div>

          <div className="px-quest-banner">
            <div>
              <span className="px-tag">NEW QUEST AVAILABLE</span>
              <p>
                <TypeReveal text={person.openToWork.body} />
              </p>
            </div>
            <a className="px-cta" href={`mailto:${person.email}`}>
              PRESS A TO EMAIL →
            </a>
          </div>
        </section>

        <section className="px-section" id="projects">
          <div className="px-section-head">
            <span className="px-num">01</span>
            <h2>LEVEL SELECT — FEATURED PROJECTS</h2>
            <span className="px-rule"></span>
          </div>
          <div className="px-level-grid">
            {featuredProjects.map((project, i) => (
              <article className="px-level-card" key={project.id}>
                <div className="px-level-card-top">
                  <span className="px-level-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="px-level-stars">
                    {Array.from({ length: levelStars[project.id] ?? 3 }).map((_, s) => (
                      <svg className="px-icon-sm" key={s}>
                        <use href="#px-i-star" />
                      </svg>
                    ))}
                  </span>
                </div>
                <h3>{project.title.toUpperCase()}</h3>
                <p>
                  <TypeReveal text={project.description} />
                </p>
                <Link className="px-level-enter" href={project.slug}>
                  ENTER LEVEL
                  <svg className="px-icon-sm">
                    <use href="#px-i-arrow" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="px-section" id="career">
          <div className="px-section-head">
            <span className="px-num">02</span>
            <h2>QUEST LOG — COMPLETED</h2>
            <span className="px-rule"></span>
          </div>
          <div className="px-quest-log">
            {experience.map((role) => (
              <div className="px-quest-card" key={role.id}>
                <div>
                  <span className="px-quest-status">
                    {role.end === "Present" ? "ACTIVE" : "CLEAR"}
                  </span>
                  <div className="px-quest-years">
                    {role.yearLabel}
                    {role.yearSub && (
                      <>
                        <br />
                        {role.yearSub}
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="px-quest-title">{role.role.toUpperCase()}</h3>
                  <span className="px-quest-giver">QUEST GIVER: {role.company.toUpperCase()}</span>
                  <ul className="px-quest-objectives">
                    {role.highlights.map((h, i) => (
                      <li key={h}>
                        <svg className="px-icon-sm">
                          <use href="#px-i-check" />
                        </svg>
                        <TypeReveal text={h} delay={i * 250} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-quest-reward">
                  +XP
                  <br />
                  {questRewards[role.id] ?? "—"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-section">
          <div className="px-section-head">
            <span className="px-num">03</span>
            <h2>SIDE QUESTS — OFF THE CLOCK</h2>
            <span className="px-rule"></span>
          </div>
          <div className="px-side-grid">
            {offTheClock.map((item) => (
              <div className="px-side-card" key={item.id}>
                <span className="px-tag">SIDE QUEST</span>
                <h4>{item.title.toUpperCase()}</h4>
                <p>
                  <TypeReveal text={item.description} />
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-section" id="specs">
          <div className="px-section-head">
            <span className="px-num">04</span>
            <h2>INVENTORY — TECH SPECS</h2>
            <span className="px-rule"></span>
          </div>
          <div className="px-inventory">
            <div className="px-inventory-title">
              <svg className="px-icon">
                <use href="#px-i-shield" />
              </svg>
              EQUIPPED ITEMS
            </div>
            {techSpecs.map((spec) => (
              <div className="px-inv-row" key={spec.group}>
                <div className="px-inv-group">{spec.group.toUpperCase()}</div>
                <div className="px-inv-items">
                  {splitItems(spec.items).map((item) => (
                    <span className="px-inv-chip" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
