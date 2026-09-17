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
    </footer>
  );
}
