// Hand-drawn architecture diagram for the /howdidimakethis/resume
// showcase page: what actually happens between a visitor typing their
// email and a signed S3 URL landing back in their browser. Plain inline
// SVG (no chart library), sized by viewBox so it scales with its
// container; colors come from the page's own --sc-* custom properties so
// it stays in sync with showcase.css without duplicating values here.
export default function ResumeArchDiagram() {
  return (
    <svg
      viewBox="0 0 720 400"
      role="img"
      aria-label="Architecture diagram: a visitor's browser posts an email and a Turnstile token to a CloudFront path, which forwards it to a Lambda Function URL carrying a shared-secret header. The Lambda verifies the token with Cloudflare, writes a telemetry row to DynamoDB, and returns a short-lived presigned S3 URL."
    >
      <defs>
        <marker id="sc-r-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--sc-accent-bright)" />
        </marker>
        <marker id="sc-r-arrow-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--sc-ink-dim)" />
        </marker>
      </defs>

      <g style={{ fontFamily: "var(--sc-font-mono)" }}>
        {/* -------- left: the visitor -------- */}
        <rect x="14" y="60" width="150" height="64" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="89" y="86" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--sc-ink)">a visitor</text>
        <text x="89" y="102" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">email + honeypot +</text>
        <text x="89" y="114" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">Turnstile token</text>

        {/* -------- AWS cluster -------- */}
        <rect x="264" y="14" width="270" height="372" rx="10" fill="none" stroke="var(--sc-line)" strokeDasharray="4 3" />
        <text x="399" y="4" textAnchor="middle" fontSize="10.5" fill="var(--sc-ink-dim)" transform="translate(0,12)">AWS — ap-south-1</text>

        <rect x="284" y="34" width="230" height="52" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="399" y="56" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">CloudFront</text>
        <text x="399" y="72" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">/api/resume/* — CachingDisabled</text>

        <rect x="284" y="110" width="230" height="64" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="399" y="132" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">Lambda Function URL</text>
        <text x="399" y="148" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">resume-api — checks</text>
        <text x="399" y="161" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">X-Origin-Verify first</text>

        <rect x="284" y="212" width="108" height="60" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="338" y="234" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--sc-ink)">DynamoDB</text>
        <text x="338" y="249" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">telemetry row</text>
        <text x="338" y="261" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">(non-blocking)</text>

        <rect x="406" y="212" width="108" height="60" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="460" y="234" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--sc-ink)">S3 bucket</text>
        <text x="460" y="249" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">private — resume</text>
        <text x="460" y="261" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">PDF only</text>

        <rect x="284" y="300" width="230" height="66" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="399" y="322" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">CDKTF (Terraform CDK)</text>
        <text x="399" y="338" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">provisions the boxes above,</text>
        <text x="399" y="351" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">reuses the same infra stack</text>

        {/* -------- outside AWS: Cloudflare -------- */}
        <rect x="580" y="110" width="126" height="64" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="643" y="132" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--sc-ink)">Cloudflare</text>
        <text x="643" y="148" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">Turnstile</text>
        <text x="643" y="160" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">siteverify</text>

        {/* visitor -> cloudfront */}
        <path d="M164 92 L284 60" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-r-arrow)" />
        <text x="168" y="76" fontSize="9.5" fill="var(--sc-accent)">POST /api/resume/request</text>

        {/* cloudfront -> lambda, with injected header */}
        <path d="M399 86 L399 110" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-r-arrow)" />
        <text x="404" y="102" fontSize="9" fill="var(--sc-accent)">+X-Origin-Verify</text>

        {/* lambda -> dynamodb */}
        <path d="M369 174 L346 212" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.3" markerEnd="url(#sc-r-arrow-dim)" />

        {/* lambda -> s3 */}
        <path d="M429 174 L452 212" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-r-arrow)" />
        <text x="432" y="196" fontSize="9" fill="var(--sc-accent)">GetObject, 600s</text>

        {/* lambda <-> cloudflare turnstile (round trip) */}
        <path d="M514 132 L580 132" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.3" strokeDasharray="3 3" markerEnd="url(#sc-r-arrow-dim)" />
        <text x="518" y="124" fontSize="8.5" fill="var(--sc-ink-dim)">verify token</text>

        {/* s3 -> visitor (the actual download, dashed since it's a separate request) */}
        <path d="M460 300 C 460 380, 89 380, 89 124" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.2" strokeDasharray="2 3" markerEnd="url(#sc-r-arrow-dim)" />
        <text x="120" y="392" fontSize="9" fill="var(--sc-ink-dim)">browser follows the signed URL straight to S3 — the PDF itself never touches Lambda</text>
      </g>
    </svg>
  );
}
