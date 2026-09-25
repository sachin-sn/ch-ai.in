import Link from "next/link";
import Reveal from "./Reveal";
import ResumeArchDiagram from "./ResumeArchDiagram";
import DiagramAnimator from "./DiagramAnimator";

// The write-up for /howdidimakethis/resume -- how the /resume page's
// email-gated download actually works. Every technical claim here is
// real, pulled from code/gcp-functions/resume-api and
// code/infra-gcp/resume-api.ts in this repo, not a generic description
// of "how you'd build this".
export default function ResumeContent() {
  return (
    <>
      <div className="sc-hero">
        <p className="sc-boot-line">
          $ whoami<br />
          <span className="sc-ok">&gt;</span> someone who just typed their email into /resume
        </p>
        <p className="sc-boot-line">
          $ cat ./README.md | head -2<br />
          <span className="sc-ok">&gt;</span> a gated resume download that counts real interest, not just hits
        </p>
        <p className="sc-boot-line">
          $ ./reveal --app=resume<br />
          <span className="sc-ok">&gt;</span> booting write-up...
        </p>
        <h1 className="sc-hero-title">
          One PDF. Rather more infrastructure than that implies.
          <span className="sc-cursor" aria-hidden="true" />
        </h1>
        <p className="sc-hero-sub">
          The whole site is static — no server, no database, no API routes.
          The resume download is the one deliberate exception: a small,
          real backend that exists for exactly one job. It moved from AWS
          to GCP along with the rest of the site — see{" "}
          <Link href="/howdidimakethis/ch-ai">how ch-ai.in itself is built</Link>{" "}
          for why.
        </p>
      </div>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat decisions.md
          <h2>why not just a link to a PDF</h2>
        </div>
        <p>
          A static link works fine right up until you want to know whether
          anyone&apos;s actually looking at it. Three decisions shaped this
          instead:
        </p>
        <p>
          <strong>Instant, on-screen link — not emailed.</strong> Emailing
          the link adds latency, a mail-sending dependency, and a reason for
          the link to end up in spam. A signed URL handed back immediately
          is simpler and just as safe, as long as it expires fast.
        </p>
        <p>
          <strong>Firestore for telemetry — not a JSON file in a bucket.</strong>{" "}
          A shared JSON file has no atomic read-modify-write: two requests
          landing close together can race and clobber each other&apos;s
          write. Firestore costs about the same at this traffic level and
          removes the race entirely — same reasoning DynamoDB served on the
          AWS version.
        </p>
        <p>
          <strong>Turnstile + a honeypot field — not Cloud Armor.</strong> A
          free, invisible CAPTCHA plus a hidden form field bots fill in but
          humans never see catches the overwhelming majority of abuse for
          zero added cost. A WAF is a reasonable next step if that ever stops
          being true, not a day-one requirement — true on either cloud.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat request-flow.md
          <h2>request flow</h2>
        </div>
        <p>
          The static site and this one dynamic endpoint are both served
          through the same Firebase Hosting site —{" "}
          <code>/api/resume/**</code> is a rewrite pointed at a Cloud
          Function instead of a static file. Same domain, so the browser
          never has to deal with CORS.
        </p>
        <div className="sc-diagram">
          <DiagramAnimator>
            <ResumeArchDiagram />
          </DiagramAnimator>
        </div>
        <p className="sc-diagram-caption">
          Everything in the request/response cycle is synchronous except
          the Firestore write, which is fire-and-forget — a logging
          failure should never be the reason a real visitor doesn&apos;t
          get their resume.
        </p>
        <p>
          The AWS version had one more layer here worth being honest
          about: a Lambda Function URL has no equivalent of S3&apos;s
          Origin Access Control, so what actually closed that gap was a
          shared secret — CloudFront injected an{" "}
          <code>X-Origin-Verify</code> header, and the Lambda rejected
          anything missing it. Firebase Hosting rewrites don&apos;t
          support injecting a custom header into the proxied request, so
          there&apos;s no equivalent trick available here — this function
          has to allow unauthenticated invocation for the rewrite to
          reach it at all, which makes its own Cloud Run URL just as
          reachable directly. In practice that&apos;s a small difference:
          the honeypot field and Turnstile below are the real gate on
          either cloud, this is just one fewer (mostly cosmetic) layer on
          top of them.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat index.ts | grep -A2 verify
          <h2>the gate, in order</h2>
        </div>
        <div className="sc-timeline">
          <div className="sc-timeline-item">
            <strong>1.</strong> Honeypot field — a hidden{" "}
            <code>company</code> input real visitors never see or fill.
            Anything in it gets a convincing 200 response with no real URL,
            rather than an error that would teach a bot to leave it blank.
          </div>
          <div className="sc-timeline-item">
            <strong>2.</strong> Email shape check, then a Turnstile
            verification against Cloudflare&apos;s <code>siteverify</code>{" "}
            endpoint — checked for <code>success</code>,{" "}
            <em>and</em> that the token&apos;s <code>action</code> and{" "}
            <code>hostname</code> match this exact integration, per
            Cloudflare&apos;s own defense-in-depth guidance. A network
            hiccup talking to Cloudflare fails <strong>closed</strong>{" "}
            (rejects the submission) rather than skipping the check.
          </div>
          <div className="sc-timeline-item">
            <strong>3.</strong> A soft MX-record lookup on the email domain
            — stored alongside the telemetry row as a signal, never used to
            block a real person with an unusual mail setup.
          </div>
          <div className="sc-timeline-item">
            <strong>4.</strong> A V4 signed <code>GetObject</code>-equivalent
            GCS URL, good for 600 seconds — long enough to click a button,
            short enough that a leaked or shared link is worthless within
            the hour. Signed via the function&apos;s own service-account
            identity through the IAM API, not a private key file.
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat infra-gcp/resume-api.ts
          <h2>infra</h2>
        </div>
        <p>
          The Cloud Function, its Firestore database, the private
          resume-asset GCS bucket, its dedicated service account, and the
          IAM bindings that connect them all live in one CDKTF construct (
          <code>resume-api.ts</code>) inside the same <code>infra-gcp</code>{" "}
          stack that provisions Cloud DNS and the Firebase project — one{" "}
          <code>cdktf deploy</code>, one piece of state, same pattern the
          AWS version used.
        </p>
        <p>
          The function&apos;s service account is scoped to exactly this
          bucket and this Firestore database — nothing broader — plus one
          narrow grant to sign blobs as itself, which is what lets it mint
          V4 signed URLs without a private key file. Turnstile&apos;s
          secret key is a Terraform variable, supplied at deploy time and
          never written to a file in this repo. Unlike the static site&apos;s
          content, this stack doesn&apos;t deploy from CI yet — it&apos;s
          still a hand-run <code>cdktf deploy</code>, same as the rest of{" "}
          <code>infra-gcp</code> for now.
        </p>
        <div className="sc-chip-grid">
          {[
            "Cloud Functions 2nd gen (Node.js 20)",
            "Firestore — Native mode",
            "GCS V4 signed URLs",
            "Firebase Hosting rewrite (/api/resume/**)",
            "Cloudflare Turnstile",
            "CDKTF (Terraform CDK)",
          ].map((item) => (
            <span key={item} className="sc-chip">
              {item}
            </span>
          ))}
        </div>
      </Reveal>

      <div className="sc-footer">
        <p style={{ margin: 0 }}>
          Curious about the site this feature lives on?{" "}
          <Link href="/howdidimakethis/ch-ai">Read how ch-ai.in itself is built</Link>, or{" "}
          <Link href="/howdidimakethis">see what else has a page like this</Link>.
        </p>
      </div>
    </>
  );
}
