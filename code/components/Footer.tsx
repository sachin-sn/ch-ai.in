"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Maps a site route to its /howdidimakethis/<slug> write-up, for pages
// that have one -- currently just /resume. Anything not listed here (the
// homepage, /blog, the other theme showcases) falls back to the
// /howdidimakethis index rather than guessing at a specific project, since
// there isn't one specific write-up that page is "about".
const PATH_TO_SHOWCASE_SLUG: Record<string, string> = {
  "/resume": "resume",
};

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const showcaseSlug = pathname ? PATH_TO_SHOWCASE_SLUG[pathname] : undefined;
  const showcaseHref = showcaseSlug ? `/howdidimakethis/${showcaseSlug}` : "/howdidimakethis";
  return (
    <footer className="ledger-rule mt-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 font-mono text-sm text-ink-dim sm:flex-row sm:items-center sm:justify-between">
        <span className="font-display font-bold text-ink">
          Sachin Nagaraja — © {year}
        </span>
        <div className="flex gap-5">
          <a href="mailto:hello@ch-ai.in" className="hover:text-accent-bright">
            email
          </a>
          <a
            href="https://github.com/sachin-sn"
            className="hover:text-accent-bright"
            target="_blank"
            rel="noreferrer"
          >
            github
          </a>
          <a
            href="https://linkedin.com/in/sachin-s-nagaraja"
            className="hover:text-accent-bright"
            target="_blank"
            rel="noreferrer"
          >
            linkedin
          </a>
        </div>
      </div>

      {/* The easter egg: deliberately understated (small, dim, centered on
          its own line) rather than styled like the links above -- it's
          meant to be stumbled on, not advertised. The glitch is CSS-only
          (.footer-egg-link in globals.css), so the payoff on click is the
          destination page's own boot-sequence entrance, not a delayed
          navigation here. */}
      <div className="flex justify-center pb-6">
        <Link href={showcaseHref} className="footer-egg-link">
          peek under the hood
        </Link>
      </div>
    </footer>
  );
}
