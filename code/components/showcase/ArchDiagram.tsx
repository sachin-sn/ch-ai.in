// Hand-drawn architecture diagram for the ch-ai showcase page: where a
// `git push` ends up, and what actually answers a visitor's request.
// Plain inline SVG (no chart library -- this is a fixed illustration, not
// data-driven), sized by viewBox so it scales with its container; text
// uses the page's own --sc-* custom properties via inline style so it
// stays in sync with showcase.css without duplicating color values here.
export default function ArchDiagram() {
  return (
    <svg viewBox="0 0 720 330" role="img" aria-label="Architecture diagram: a git push flows through GitHub Actions into AWS (Route53, CloudFront, S3); a visitor's browser requests ch-ai.in and is served from that same AWS cluster.">
      <defs>
        <marker id="sc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--sc-accent-bright)" />
        </marker>
        <marker id="sc-arrow-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--sc-ink-dim)" />
        </marker>
      </defs>

      <g style={{ fontFamily: "var(--sc-font-mono)" }}>
        {/* -------- left column: actors -------- */}
        <rect x="16" y="24" width="168" height="52" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="100" y="46" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--sc-ink)">you</text>
        <text x="100" y="63" textAnchor="middle" fontSize="10.5" fill="var(--sc-ink-dim)">git push main</text>

        <rect x="16" y="116" width="168" height="60" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="100" y="138" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--sc-ink)">GitHub Actions</text>
        <text x="100" y="155" textAnchor="middle" fontSize="10" fill="var(--sc-ink-dim)">OIDC role assume —</text>
        <text x="100" y="168" textAnchor="middle" fontSize="10" fill="var(--sc-ink-dim)">no stored AWS keys</text>

        <rect x="16" y="248" width="168" height="52" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="100" y="270" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--sc-ink)">a visitor</text>
        <text x="100" y="287" textAnchor="middle" fontSize="10.5" fill="var(--sc-ink-dim)">opens ch-ai.in</text>

        {/* you -> actions */}
        <path d="M100 76 L100 116" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.5" markerEnd="url(#sc-arrow-dim)" />

        {/* -------- right cluster: AWS -------- */}
        <rect x="420" y="14" width="284" height="302" rx="10" fill="none" stroke="var(--sc-line)" strokeDasharray="4 3" />
        <text x="562" y="0" textAnchor="middle" fontSize="10.5" fill="var(--sc-ink-dim)" transform="translate(0,12)">AWS — ap-south-1 (ACM cert in us-east-1)</text>

        <rect x="440" y="34" width="244" height="50" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="562" y="55" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">Route53</text>
        <text x="562" y="71" textAnchor="middle" fontSize="10" fill="var(--sc-ink-dim)">hosted zone for ch-ai.in</text>

        <rect x="440" y="102" width="244" height="50" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="562" y="123" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">CloudFront</text>
        <text x="562" y="139" textAnchor="middle" fontSize="10" fill="var(--sc-ink-dim)">CDN, CachingOptimized policy</text>

        <rect x="440" y="170" width="244" height="50" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="562" y="191" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">S3 bucket</text>
        <text x="562" y="207" textAnchor="middle" fontSize="10" fill="var(--sc-ink-dim)">private — reachable only via OAC</text>

        <rect x="440" y="238" width="244" height="56" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="562" y="260" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">CDKTF (Terraform CDK)</text>
        <text x="562" y="276" textAnchor="middle" fontSize="10" fill="var(--sc-ink-dim)">provisions the three boxes above,</text>
        <text x="562" y="289" textAnchor="middle" fontSize="10" fill="var(--sc-ink-dim)">gated behind manual approval</text>

        {/* actions -> deploy targets */}
        <path d="M184 146 C 300 146, 320 59, 440 59" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-arrow)" />
        <text x="270" y="112" fontSize="9.5" fill="var(--sc-accent)">infra.yml: cdktf deploy</text>

        <path d="M184 156 C 280 156, 300 195, 440 195" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-arrow)" />
        <text x="240" y="230" fontSize="9.5" fill="var(--sc-accent)">app-deploy.yml: build, sync ./out,</text>
        <text x="240" y="242" fontSize="9.5" fill="var(--sc-accent)">invalidate cache</text>

        {/* actions -> cdktf label box */}
        <path d="M184 166 C 300 166, 320 263, 440 263" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#sc-arrow-dim)" />

        {/* visitor -> cloudfront (request path -- lands on CloudFront, not
            S3 directly: a cache hit never touches the bucket at all, and
            an explicit CloudFront -> S3 arrow would overstate how often
            that origin fetch actually happens) */}
        <path d="M184 268 C 320 268, 320 127, 440 127" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.3" strokeDasharray="2 3" markerEnd="url(#sc-arrow-dim)" />
        <text x="196" y="316" fontSize="9.5" fill="var(--sc-ink-dim)">DNS lookup, then HTTPS GET — CloudFront answers</text>
        <text x="196" y="328" fontSize="9.5" fill="var(--sc-ink-dim)">from its cache, or fetches the file from S3 once</text>
      </g>
    </svg>
  );
}
