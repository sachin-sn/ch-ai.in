// Hand-drawn architecture diagram for the /howdidimakethis/resume
// showcase page: what actually happens between a visitor typing their
// email and a signed GCS URL landing back in their browser. Plain inline
// SVG (no chart library), sized by viewBox so it scales with its
// container; colors come from the page's own --sc-* custom properties so
// it stays in sync with showcase.css without duplicating values here.
export default function ResumeArchDiagram() {
  return (
    <svg
      viewBox="0 0 720 430"
      role="img"
      aria-label="Architecture diagram: a visitor's browser posts an email and a Turnstile token through a Firebase Hosting rewrite to a Cloud Function. The function verifies the token with Cloudflare, writes a telemetry document to Firestore, and returns a short-lived V4 signed GCS URL."
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
        <rect x="14" y="70" width="150" height="64" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="89" y="96" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--sc-ink)">a visitor</text>
        <text x="89" y="112" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">email + honeypot +</text>
        <text x="89" y="124" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">Turnstile token</text>

        {/* -------- GCP cluster -------- */}
        <rect x="264" y="14" width="270" height="372" rx="10" fill="none" stroke="var(--sc-line)" strokeDasharray="4 3" />
        <text x="399" y="4" textAnchor="middle" fontSize="10.5" fill="var(--sc-ink-dim)" transform="translate(0,12)">GCP — asia-south1</text>

        <rect x="284" y="34" width="230" height="46" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="399" y="54" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">Firebase Hosting</text>
        <text x="399" y="70" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">/api/resume/** rewrite</text>

        <rect x="284" y="92" width="230" height="64" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="399" y="114" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">Cloud Function (2nd gen)</text>
        <text x="399" y="130" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">resume-api — public invoker,</text>
        <text x="399" y="143" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">no shared-secret header here</text>

        <rect x="284" y="214" width="108" height="60" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="338" y="236" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--sc-ink)">Firestore</text>
        <text x="338" y="251" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">telemetry doc</text>
        <text x="338" y="263" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">(non-blocking)</text>

        <rect x="406" y="214" width="108" height="60" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="460" y="236" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--sc-ink)">GCS bucket</text>
        <text x="460" y="251" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">private — resume</text>
        <text x="460" y="263" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">PDF only</text>

        <rect x="284" y="300" width="230" height="66" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="399" y="322" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">CDKTF (Terraform CDK)</text>
        <text x="399" y="338" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">provisions the boxes above,</text>
        <text x="399" y="351" textAnchor="middle" fontSize="9.5" fill="var(--sc-ink-dim)">hand-run deploy (no CI yet)</text>

        {/* -------- outside GCP: Cloudflare -------- */}
        <rect x="580" y="110" width="126" height="64" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="643" y="132" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--sc-ink)">Cloudflare</text>
        <text x="643" y="148" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">Turnstile</text>
        <text x="643" y="160" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">siteverify</text>

        {/* visitor -> firebase hosting */}
        <path d="M164 102 L284 57" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-r-arrow)" />
        <text x="168" y="86" fontSize="9.5" fill="var(--sc-accent)">POST /api/resume/request</text>

        {/* hosting -> function (no header injected, unlike CloudFront) */}
        <path d="M399 80 L399 92" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-r-arrow)" />

        {/* function -> firestore */}
        <path d="M369 156 L346 214" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.3" markerEnd="url(#sc-r-arrow-dim)" />

        {/* function -> gcs */}
        <path d="M429 156 L452 214" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-r-arrow)" />
        <text x="432" y="196" fontSize="9" fill="var(--sc-accent)">sign V4 URL, 600s</text>

        {/* function <-> cloudflare turnstile (round trip) */}
        <path d="M514 124 L580 124" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.3" strokeDasharray="3 3" markerEnd="url(#sc-r-arrow-dim)" />
        <text x="518" y="116" fontSize="8.5" fill="var(--sc-ink-dim)">verify token</text>

        {/* gcs -> visitor (the actual download, dashed since it's a separate request) */}
        <path d="M460 300 C 460 400, 89 400, 89 134" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.2" strokeDasharray="2 3" markerEnd="url(#sc-r-arrow-dim)" />
        <text x="120" y="416" fontSize="9" fill="var(--sc-ink-dim)">browser follows the signed URL straight to GCS — the PDF itself never touches the function</text>
      </g>
    </svg>
  );
}
