import Link from "next/link";
import Reveal from "./Reveal";
import ResumeArchDiagram from "./ResumeArchDiagram";

// The write-up for /howdidimakethis/resume -- how the /resume page's
// email-gated download actually works. Every technical claim here is
// real, pulled from code/lambda/resume-api and code/infra/resume-api.ts
// in this repo, not a generic description of "how you'd build this".
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
          real backend that exists for exactly one job.
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
          the link to end up in spam. A presigned URL handed back
          immediately is simpler and just as safe, as long as it expires
          fast.
        </p>
        <p>
          <strong>DynamoDB for telemetry — not a JSON file on S3.</strong> A
          shared JSON file has no atomic read-modify-write: two requests
          landing close together can race and clobber each other&apos;s
          write. DynamoDB&apos;s on-demand billing costs about the same at
          this traffic level and removes the race entirely.
        </p>
        <p>
          <strong>Turnstile + a honeypot field — not AWS WAF.</strong> A
          free, invisible CAPTCHA plus a hidden form field bots fill in but
          humans never see catches the overwhelming majority of abuse for
          zero added cost. WAF is a reasonable next step if that ever stops
          being true, not a day-one requirement.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat request-flow.md
          <h2>request flow</h2>
        </div>
        <p>
          The static site and this one dynamic endpoint share the same
          CloudFront distribution — <code>/api/resume/*</code> is a second,{" "}
          <code>CachingDisabled</code> cache behavior pointed at a Lambda
          Function URL instead of the S3 origin. Same domain, so the
          browser never has to deal with CORS.
        </p>
        <div className="sc-diagram">
          <ResumeArchDiagram />
        </div>
        <p className="sc-diagram-caption">
          Everything in the request/response cycle is synchronous except
          the DynamoDB write, which is fire-and-forget — a logging failure
          should never be the reason a real visitor doesn&apos;t get their
          resume.
        </p>
        <p>
          A Lambda Function URL has no equivalent of S3&apos;s Origin
          Access Control, so on its own it&apos;d be just as reachable
          directly as through CloudFront. What actually closes that gap is
          a shared secret: CloudFront injects an{" "}
          <code>X-Origin-Verify</code> header on this one origin, and the
          Lambda&apos;s first line rejects any request that doesn&apos;t
          carry it — before parsing the body, before touching Turnstile or
          DynamoDB.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat handler.ts | grep -A2 verify
          <h2>the gate, in order</h2>
        </div>
        <div className="sc-timeline">
          <div className="sc-timeline-item">
            <strong>1.</strong> <code>X-Origin-Verify</code> header check —
            wrong or missing secret, and the request never gets parsed at
            all.
          </div>
          <div className="sc-timeline-item">
            <strong>2.</strong> Honeypot field — a hidden{" "}
            <code>company</code> input real visitors never see or fill.
            Anything in it gets a convincing 200 response with no real URL,
            rather than an error that would teach a bot to leave it blank.
          </div>
          <div className="sc-timeline-item">
            <strong>3.</strong> Email shape check, then a Turnstile
            verification against Cloudflare&apos;s <code>siteverify</code>{" "}
            endpoint — checked for <code>success</code>,{" "}
            <em>and</em> that the token&apos;s <code>action</code> and{" "}
            <code>hostname</code> match this exact integration, per
            Cloudflare&apos;s own defense-in-depth guidance. A network
            hiccup talking to Cloudflare fails <strong>closed</strong>{" "}
            (rejects the submission) rather than skipping the check.
          </div>
          <div className="sc-timeline-item">
            <strong>4.</strong> A soft MX-record lookup on the email domain
            — stored alongside the telemetry row as a signal, never used to
            block a real person with an unusual mail setup.
          </div>
          <div className="sc-timeline-item">
            <strong>5.</strong> A presigned <code>GetObject</code> URL,
            good for 600 seconds — long enough to click a button, short
            enough that a leaked or shared link is worthless within the
            hour.
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat infra/resume-api.ts
          <h2>infra</h2>
        </div>
        <p>
          The Lambda, its DynamoDB table, the private resume-asset S3
          bucket, and the execution role all live in one CDKTF construct (
          <code>resume-api.ts</code>) inside the same <code>infra</code>{" "}
          stack that provisions the rest of the site — one{" "}
          <code>cdktf deploy</code>, one piece of state, no separate stack
          to keep in sync.
        </p>
        <p>
          The execution role and the GitHub Actions deploy role are both
          scoped to exactly this function&apos;s and this table&apos;s
          ARNs — nothing broader. Turnstile&apos;s secret key and the{" "}
          <code>X-Origin-Verify</code> value are Terraform variables backed
          by GitHub Actions secrets; neither one is ever written to a file
          in this repo.
        </p>
        <div className="sc-chip-grid">
          {[
            "AWS Lambda (Node.js 20, esbuild bundle)",
            "DynamoDB — on-demand billing",
            "S3 presigned URLs",
            "CloudFront custom origin, shared-secret header",
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
