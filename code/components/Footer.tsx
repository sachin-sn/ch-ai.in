import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
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
        <Link href="/howdidimakethis/ch-ai" className="footer-egg-link">
          peek under the hood
        </Link>
      </div>
    </footer>
  );
}
