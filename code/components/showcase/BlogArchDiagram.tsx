// Hand-drawn diagram for the /howdidimakethis/blog showcase page. Unlike
// the resume feature's diagram (a request-time flow through new AWS
// resources), the interesting part of this architecture is a build-time
// pipeline feeding infrastructure that already existed -- so the bottom
// cluster is drawn dashed and labeled "already exists" rather than as a
// new box, on purpose. Same conventions as ResumeArchDiagram.tsx: plain
// inline SVG, viewBox-scaled, colors from the page's --sc-* custom
// properties.
export default function BlogArchDiagram() {
  return (
    <svg
      viewBox="0 0 720 420"
      role="img"
      aria-label="Architecture diagram: at build time, Markdown files in content/blog are parsed by lib/blog/posts.ts and turned into static routes and Open Graph tags by next build, which deploys through the same Firebase Hosting site the rest of the site already uses. At request time, a visitor's browser gets fully static HTML; the BlogIndex component adds client-side search and pagination after load, and the LinkedIn share button opens linkedin.com directly, outside the site's own infrastructure."
    >
      <defs>
        <marker id="sc-b-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--sc-accent-bright)" />
        </marker>
        <marker id="sc-b-arrow-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--sc-ink-dim)" />
        </marker>
      </defs>

      <g style={{ fontFamily: "var(--sc-font-mono)" }}>
        <text x="14" y="16" fontSize="10" fill="var(--sc-ink-dim)">build time — `next build`</text>

        {/* -------- row 1: build pipeline -------- */}
        <rect x="14" y="26" width="146" height="70" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="87" y="52" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">content/blog/*.md</text>
        <text x="87" y="68" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">Markdown +</text>
        <text x="87" y="80" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">YAML frontmatter</text>

        <rect x="200" y="16" width="190" height="90" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="295" y="40" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">lib/blog/posts.ts</text>
        <text x="295" y="58" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">gray-matter → frontmatter</text>
        <text x="295" y="72" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">remark + remark-gfm → HTML</text>
        <text x="295" y="86" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">(sanitize: false — trusted author)</text>

        <rect x="426" y="6" width="210" height="110" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="531" y="28" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">next build</text>
        <text x="531" y="46" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">generateStaticParams —</text>
        <text x="531" y="59" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">one route per post + tag</text>
        <text x="531" y="76" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">generateMetadata —</text>
        <text x="531" y="89" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">Open Graph tags baked in</text>
        <text x="531" y="105" textAnchor="middle" fontSize="8.5" fill="var(--sc-ink-dim)">output: &quot;export&quot;</text>

        <path d="M160 61 L200 61" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-b-arrow)" />
        <path d="M390 61 L426 61" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-b-arrow)" />

        {/* -------- row 2: existing deploy target, drawn dashed on purpose -------- */}
        <rect x="200" y="150" width="290" height="86" rx="8" fill="none" stroke="var(--sc-line)" strokeDasharray="4 3" />
        <text x="345" y="140" textAnchor="middle" fontSize="10" fill="var(--sc-ink-dim)">already exists — nothing new provisioned</text>
        <text x="345" y="176" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">Firebase Hosting</text>
        <text x="345" y="194" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">the same Firebase Hosting site</text>
        <text x="345" y="207" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">that serves the rest of ch-ai.in</text>
        <text x="345" y="222" textAnchor="middle" fontSize="8.5" fill="var(--sc-ink-dim)">deployed by the existing GitHub Actions pipeline</text>

        <path d="M531 116 L531 133 L390 133 L390 150" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-b-arrow)" />

        {/* -------- row 3: request time / the browser -------- */}
        <text x="14" y="266" fontSize="10" fill="var(--sc-ink-dim)">request time — a visitor&apos;s browser</text>

        <rect x="14" y="278" width="150" height="70" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="89" y="304" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">visitor</text>
        <text x="89" y="320" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">/blog, /blog/[slug],</text>
        <text x="89" y="332" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">/blog/tags/[tag]</text>

        <path d="M290 236 L200 236 L200 260 L164 300" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-b-arrow)" />
        <text x="196" y="256" fontSize="9" fill="var(--sc-accent)">fully static HTML</text>

        <rect x="200" y="278" width="210" height="70" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="305" y="300" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--sc-ink)">BlogIndex</text>
        <text x="305" y="316" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">client-side search + &quot;Load more&quot;</text>
        <text x="305" y="329" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">runs after load — no round trip</text>

        <path d="M164 313 L200 313" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.3" markerEnd="url(#sc-b-arrow-dim)" />

        <rect x="460" y="278" width="234" height="70" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="577" y="300" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--sc-ink)">linkedin.com/sharing</text>
        <text x="577" y="316" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">share-offsite dialog, new tab</text>
        <text x="577" y="329" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">no API key · no OAuth</text>

        <path d="M164 300 L460 300" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.3" strokeDasharray="3 3" markerEnd="url(#sc-b-arrow-dim)" />
        <text x="230" y="292" fontSize="9" fill="var(--sc-ink-dim)">Share button click</text>
      </g>
    </svg>
  );
}
