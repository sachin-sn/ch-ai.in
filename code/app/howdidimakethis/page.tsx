import type { Metadata } from "next";
import Link from "next/link";
import ShowcaseTopBar from "@/components/showcase/ShowcaseTopBar";
import { showcaseApps } from "@/lib/showcase/apps";

export const metadata: Metadata = {
  title: "peek under the hood — ch-ai.in",
  description: "How Sachin's projects are actually built, one write-up per project.",
};

// Index of every /howdidimakethis/<appname> page. Only "live" entries are
// links to a real, pre-rendered page (see [app]/page.tsx's
// generateStaticParams) -- "coming-soon" ones render as inert cards so the
// pattern reads as a deliberate roadmap, not a broken link.
export default function HowDidIMakeThisIndex() {
  return (
    <div className="sc-shell">
      <ShowcaseTopBar path="/howdidimakethis" />

      <div className="sc-hero">
        <p className="sc-boot-line">
          $ ls ./howdidimakethis<br />
          <span className="sc-ok">&gt;</span> {showcaseApps.length} project{showcaseApps.length === 1 ? "" : "s"} found
        </p>
        <h1 className="sc-hero-title">
          pick a project.
          <span className="sc-cursor" aria-hidden="true" />
        </h1>
        <p className="sc-hero-sub">
          Behind-the-scenes write-ups: stack, architecture, infra, and CI/CD
          for each of Sachin&apos;s projects — the same format every time.
        </p>
      </div>

      <div className="sc-index-grid">
        {showcaseApps.map((app) =>
          app.status === "live" ? (
            <Link
              key={app.slug}
              href={`/howdidimakethis/${app.slug}`}
              className="sc-index-card"
              data-status={app.status}
            >
              <div className="sc-index-card-name">{app.name}</div>
              <div className="sc-index-card-tagline">{app.tagline}</div>
              <span className="sc-index-card-status">read the write-up &rarr;</span>
            </Link>
          ) : (
            <div key={app.slug} className="sc-index-card" data-status={app.status}>
              <div className="sc-index-card-name">{app.name}</div>
              <div className="sc-index-card-tagline">{app.tagline}</div>
              <span className="sc-index-card-status">coming soon</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
