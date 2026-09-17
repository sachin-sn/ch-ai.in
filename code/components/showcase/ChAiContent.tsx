import Link from "next/link";
import Reveal from "./Reveal";
import ArchDiagram from "./ArchDiagram";

// The actual write-up for /howdidimakethis/ch-ai. Every technical claim
// here is real, pulled from this repo's own infra/CI config (code/infra,
// code/infra-bootstrap, .github/workflows) rather than a generic
// "how portfolios usually deploy" description -- the whole point of this
// page is that it's true.
export default function ChAiContent() {
  return (
    <>
      <div className="sc-hero">
        <p className="sc-boot-line">
          $ whoami<br />
          <span className="sc-ok">&gt;</span> a visitor who found the trapdoor
        </p>
        <p className="sc-boot-line">
          $ cat ./README.md | head -2<br />
          <span className="sc-ok">&gt;</span> ch-ai.in — a portfolio with four skins and an unreasonable amount of care
        </p>
        <p className="sc-boot-line">
          $ ./reveal --app=ch-ai<br />
          <span className="sc-ok">&gt;</span> booting write-up...
        </p>
        <h1 className="sc-hero-title">
          So, you found the trapdoor.
          <span className="sc-cursor" aria-hidden="true" />
        </h1>
        <p className="sc-hero-sub">
          This is how ch-ai.in — the site you were just looking at — is actually
          built: the stack, the four-theme engine, the infrastructure, and the
          pipeline that ships it. No marketing copy, just the real thing.
        </p>
      </div>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat stack.txt
          <h2>stack</h2>
        </div>
        <p>
          <strong>Next.js 16</strong> (App Router, built with Turbopack) running
          on <strong>React 19</strong> and <strong>TypeScript</strong> in strict
          mode, styled with <strong>Tailwind CSS v4</strong>. The whole site is a
          static export — <code>output: &quot;export&quot;</code> in{" "}
          <code>next.config.ts</code> — so there is no server at request time,
          no API routes, no middleware. Just files.
        </p>
        <div className="sc-chip-grid">
          {[
            "Next.js 16 (App Router)",
            "React 19",
            "TypeScript (strict)",
            "Tailwind CSS v4",
            "CDKTF (Terraform CDK)",
            "GitHub Actions",
            "AWS: Route53, ACM, S3, CloudFront",
          ].map((item) => (
            <span key={item} className="sc-chip">
              {item}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat architecture.md
          <h2>architecture</h2>
        </div>
        <p>
          Two flows worth knowing about: what happens when a change gets
          pushed, and what happens when someone opens the site. Both end up at
          the same three AWS resources.
        </p>
        <div className="sc-diagram">
          <ArchDiagram />
        </div>
        <p className="sc-diagram-caption">
          Both flows converge on the same private S3 bucket and CloudFront
          distribution — one writes to it, the other reads from it.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat infra/README.md
          <h2>infra</h2>
        </div>
        <p>
          Infrastructure is code, not console clicks: <strong>CDKTF</strong>{" "}
          (Terraform CDK, written in TypeScript) defines a Route53 hosted
          zone, an ACM certificate (requested in <code>us-east-1</code> — a
          hard CloudFront requirement, regardless of where everything else
          runs), a private S3 bucket, and a CloudFront distribution that
          reaches that bucket through Origin Access Control rather than a
          public bucket policy.
        </p>
        <p>
          It&apos;s actually <strong>two</strong> CDKTF stacks. A one-time,
          hand-run <code>infra-bootstrap</code> stack creates the remote
          Terraform state bucket, a DynamoDB lock table, and the IAM OIDC role
          GitHub Actions assumes. The real stack, <code>infra</code>, reads
          and writes its state there — shared between a laptop and CI, so
          neither one applies a change the other can&apos;t see.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat .github/workflows/*.yml
          <h2>ci / cd</h2>
        </div>
        <p>
          Two path-filtered GitHub Actions workflows, both authenticating to
          AWS via GitHub&apos;s OIDC provider — there are no long-lived AWS
          keys sitting in repo secrets anywhere.
        </p>
        <p>
          <strong>app-deploy.yml</strong> runs on every push to{" "}
          <code>main</code> that touches the app code: install, lint, build
          the static export, sync the output to S3 with{" "}
          <code>--delete</code>, invalidate CloudFront. No approval gate — a
          content change is low-stakes and reversible.
        </p>
        <p>
          <strong>infra.yml</strong> is more careful, because this stack can
          touch live DNS and the CDN in front of a real domain. A pull
          request touching <code>infra/**</code> only ever gets a read-only{" "}
          <code>cdktf diff</code> comment. An actual <code>cdktf deploy</code>{" "}
          only runs on push to <code>main</code>, and even then it pauses at
          a GitHub <code>production</code> environment with a required
          reviewer — meaning me, by hand, every time.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat themes/README.md
          <h2>the four-theme engine</h2>
        </div>
        <p>
          The site you were on has four completely different skins —
          magazine, pixel, material, and the one this page&apos;s aesthetic is
          deliberately <em>not</em> — sharing one semantic CSS custom-property
          contract (<code>--color-surface</code>, <code>--color-ink</code>,{" "}
          <code>--color-accent</code>, and so on). Each theme overrides that
          contract under its own <code>[data-theme=&quot;id&quot;]</code>{" "}
          selector, so shared components like the nav and footer reskin
          automatically without per-theme component variants.
        </p>
        <p>
          Light/dark mode is a second, independent layer on top (
          <code>data-mode</code>), and both the active theme and mode persist
          to <code>localStorage</code>. A blocking inline script in the root
          layout applies whatever was stored before the first paint, so
          switching themes — or just reloading the page — never flashes the
          wrong one.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> git log --grep=&quot;fix&quot;
          <h2>field notes</h2>
        </div>
        <p>A few bugs that were more interesting than they looked.</p>
        <div style={{ marginTop: "16px" }}>
          <div className="sc-note">
            <div className="sc-note-title">the sticky nav that wasn&apos;t</div>
            <p>
              <code>overflow-x: hidden</code> on <code>body</code> quietly
              forces <code>overflow-y</code> into a scrolling value too, per
              spec — which turned <code>body</code> into its own scroll
              container and broke the nav&apos;s <code>position: sticky</code>{" "}
              (it stuck to body&apos;s box, not the viewport). Fixed with{" "}
              <code>overflow-x: clip</code>, which suppresses the same
              horizontal overflow without creating a new scroll container.
            </p>
          </div>
          <div className="sc-note">
            <div className="sc-note-title">the half-pixel hero</div>
            <p>
              One theme&apos;s hero section used a <code>padding</code>{" "}
              shorthand that quietly zeroed out Tailwind&apos;s{" "}
              <code>px-6</code> on the same element — shorthand properties
              always set all four sides, and the custom class won on
              specificity. The content sat flush against the screen edge on
              mobile only. Fixed with longhand{" "}
              <code>padding-top</code>/<code>padding-bottom</code>.
            </p>
          </div>
          <div className="sc-note">
            <div className="sc-note-title">the burger menu that only opened a sliver</div>
            <p>
              The mobile dropdown was <code>position: absolute</code>, meant
              to anchor to the sticky header. A leftover{" "}
              <code>position: relative</code> on its own wrapper div became
              the real containing block instead, so it inherited that
              wrapper&apos;s content width — about 48px — rather than the
              header&apos;s. Removed the stray <code>position: relative</code>{" "}
              and it opened full-width, as intended.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> git log --oneline --reverse
          <h2>how it got here</h2>
        </div>
        <div className="sc-timeline">
          <div className="sc-timeline-item">
            <strong>v0.</strong> One theme — &quot;Ink &amp; Brass&quot; — a
            single dark, warm palette for the whole site.
          </div>
          <div className="sc-timeline-item">
            <strong>v1.</strong> The infrastructure went in first: CDKTF,
            OIDC, the two-workflow CI/CD split — before there was much of a
            site to deploy.
          </div>
          <div className="sc-timeline-item">
            <strong>v2.</strong> The four-theme engine: magazine, pixel,
            material, and monochrome, each with its own type pairing,
            animation language, and light/dark palette, all sharing one
            token contract.
          </div>
          <div className="sc-timeline-item">
            <strong>v3.</strong> A full mobile-responsiveness pass across all
            four, driven by real device screenshots, then a proper burger
            menu to replace a nav row that was getting squeezed.
          </div>
          <div className="sc-timeline-item">
            <strong>v4.</strong> This page — a self-documenting appendix,
            reachable only if you go looking for it.
          </div>
        </div>
      </Reveal>

      <div className="sc-footer">
        <p style={{ margin: 0 }}>
          Curious about the other projects?{" "}
          <Link href="/howdidimakethis">See what else has a page like this</Link>.
        </p>
      </div>
    </>
  );
}
