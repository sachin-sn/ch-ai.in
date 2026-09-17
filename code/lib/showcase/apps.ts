// Registry for the /howdidimakethis/<appname> "peek under the hood" pages --
// a self-documenting appendix that walks through how each of Sachin's
// projects is actually built (stack, architecture, infra, CI/CD). Adding a
// new project later means adding one entry here; the route itself
// (app/howdidimakethis/[app]/page.tsx) and its layout are already generic.
//
// Only entries with `status: "live"` get a real, pre-rendered page --
// output: "export" (see next.config.ts) means every path has to be known
// at build time, so generateStaticParams in [app]/page.tsx filters to
// these. "coming-soon" entries still show up in the /howdidimakethis index
// so the pattern reads as intentional, not incomplete.

export type ShowcaseStatus = "live" | "coming-soon";

export type ShowcaseApp = {
  slug: string;
  name: string;
  tagline: string;
  status: ShowcaseStatus;
  /** Public GitHub repo for this project, if there is one to show. Shown
   * as a "view source" link in the page's topbar (see ShowcaseTopBar) --
   * optional because a future entry might not have a public repo yet. */
  repoUrl?: string;
};

export const showcaseApps: ShowcaseApp[] = [
  {
    slug: "ch-ai",
    name: "ch-ai.in",
    tagline: "This site. The one you're reading right now.",
    status: "live",
    repoUrl: "https://github.com/sachin-sn/ch-ai.in",
  },
  {
    slug: "chitragupta",
    name: "Chitragupta",
    tagline: "Public good-deed / bad-deed feedback, without the pitchforks.",
    status: "coming-soon",
  },
  {
    slug: "ttl-cache",
    name: "TTL cache module",
    tagline: "A closure-based, microtask-batched client cache.",
    status: "coming-soon",
  },
];

export function getShowcaseApp(slug: string): ShowcaseApp | undefined {
  return showcaseApps.find((app) => app.slug === slug);
}

export function getLiveShowcaseApps(): ShowcaseApp[] {
  return showcaseApps.filter((app) => app.status === "live");
}
