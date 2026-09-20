import Link from "next/link";
import Reveal from "./Reveal";
import ArchDiagram from "./ArchDiagram";

// The actual write-up for /howdidimakethis/ch-ai. Every technical claim
// here is real, pulled from this repo's own infra/CI config (code/infra,
// code/infra-bootstrap, code/infra-gcp, code/infra-gcp-bootstrap,
// .github/workflows) rather than a generic "how portfolios usually
// deploy" description -- the whole point of this page is that it's true.
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
            "GitHub Actions (Workload Identity Federation)",
            "GCP: Cloud DNS, Firebase Hosting",
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
          pushed, and what happens when someone opens the site. Both end up
          at the same two GCP resources.
        </p>
        <div className="sc-diagram">
          <ArchDiagram />
        </div>
        <p className="sc-diagram-caption">
          Both flows converge on the same Firebase Hosting site — one
          deploys to it, the other is served from it.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat infra/README.md
          <h2>infra</h2>
        </div>
        <p>
          Infrastructure is code, not console clicks: <strong>CDKTF</strong>{" "}
          (Terraform CDK, written in TypeScript) defines a{" "}
          <strong>Cloud DNS</strong> managed zone for <code>ch-ai.in</code>{" "}
          — carrying the MX/SPF records that keep email forwarding working,
          plus the A and TXT records Firebase needs to verify and serve the
          custom domain — and a <strong>Firebase Hosting</strong> site the
          static export deploys to.
        </p>
        <p>
          It&apos;s actually <strong>two</strong> CDKTF stacks, the same split
          the AWS stack used. A one-time, hand-run{" "}
          <code>infra-gcp-bootstrap</code> stack sets up{" "}
          <strong>Workload Identity Federation</strong> — a WIF pool and
          provider GitHub Actions federates into, a deploy service account
          scoped to exactly this project, and the Cloud Storage bucket the
          real stack&apos;s state lives in. The real stack,{" "}
          <code>infra-gcp</code>, reads and writes its state there.
        </p>
        <p>
          This site didn&apos;t start on GCP. It ran entirely on AWS — S3 +
          CloudFront + Route53 + ACM — until a billing/support dead end
          made GCP the faster path forward. Rather than tear the AWS stack
          down, it&apos;s left deployed on purpose: CloudFront, S3, ACM,
          Lambda, DynamoDB, and IAM are all still there, orphaned, free to
          run at this traffic level, and ready to <code>cdktf deploy</code>{" "}
          live in an interview if the multi-cloud story is worth telling.
          Only Route53&apos;s hosted zone got deleted — the one AWS resource
          in this whole stack that actually cost money ($0.50/mo), and the
          only thing DNS ownership required removing.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat .github/workflows/*.yml
          <h2>ci / cd</h2>
        </div>
        <p>
          The live deploy path authenticates to GCP the same way the AWS
          one did to AWS — no long-lived credentials sitting in repo
          secrets anywhere.
        </p>
        <p>
          <strong>gcp-static-deploy.yml</strong> runs on every push to{" "}
          <code>main</code> that touches the app code: install, build the
          static export, federate into a scoped GCP service account via{" "}
          <strong>Workload Identity Federation</strong> — no service-account
          JSON key ever touches this repo — then{" "}
          <code>firebase deploy --only hosting</code>. No approval gate — a
          content change is low-stakes and reversible.
        </p>
        <p>
          Cloud DNS and Firebase project changes (<code>infra-gcp</code>)
          don&apos;t have a CI pipeline yet — they&apos;re applied by hand,{" "}
          <code>npx cdktf deploy</code> from a laptop. The AWS stack&apos;s{" "}
          <code>infra.yml</code>, by contrast, still exists exactly as it
          did before the migration: a pull request touching{" "}
          <code>infra/**</code> gets a read-only <code>cdktf diff</code>{" "}
          comment, and an actual deploy pauses at a required reviewer. It
          still works — it&apos;s just not wired to anything that affects
          the live site anymore, since DNS no longer points at CloudFront.
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
          <div className="sc-note">
            <div className="sc-note-title">the WIF condition that only matched a placeholder</div>
            <p>
              The Workload Identity Federation provider&apos;s{" "}
              <code>attributeCondition</code> is supposed to check the
              deploying repo is this one. It got deployed checking against{" "}
              <code>REPLACE_ME_github_owner/REPLACE_ME_github_repo</code>{" "}
              instead — the real values were meant to come from env vars
              that were never actually set on the bootstrap run that created
              it, so the code&apos;s placeholder defaults got baked into
              live infrastructure. Every deploy failed auth with{" "}
              <code>unauthorized_client</code> until that got spotted by
              reading the deployed Terraform state directly and hardcoding
              the real repo as the default instead.
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
          <div className="sc-timeline-item">
            <strong>v5.</strong> Hosting migrated to GCP — Firebase Hosting
            behind Cloud DNS — after a billing/support dead end on AWS. The
            original stack stays deployed and orphaned as a live demo;
            Route53&apos;s hosted zone, the one piece of it that actually
            cost money, is the only part that got deleted.
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
