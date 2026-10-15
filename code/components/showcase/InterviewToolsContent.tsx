import Link from "next/link";
import Reveal from "./Reveal";
import InterviewToolsArchDiagram from "./InterviewToolsArchDiagram";
import DiagramAnimator from "./DiagramAnimator";

// The write-up for /howdidimakethis/interview-tools -- how /whiteboard and
// /playground actually work. Every technical claim here is real, pulled from
// components/whiteboard, components/playground and lib/playground in this
// repo, not a generic description of "how you'd build a code runner".
export default function InterviewToolsContent() {
  return (
    <>
      <div className="sc-hero">
        <p className="sc-boot-line">
          $ whoami<br />
          <span className="sc-ok">&gt;</span> someone sketching a system design, or running a two-sum
        </p>
        <p className="sc-boot-line">
          $ cat ./README.md | head -2<br />
          <span className="sc-ok">&gt;</span> a whiteboard and a code runner for interviews, with no backend
        </p>
        <p className="sc-boot-line">
          $ ./reveal --app=interview-tools<br />
          <span className="sc-ok">&gt;</span> booting write-up...
        </p>
        <h1 className="sc-hero-title">
          Two interview tools, and neither one has a server.
          <span className="sc-cursor" aria-hidden="true" />
        </h1>
        <p className="sc-hero-sub">
          <Link href="/whiteboard">/whiteboard</Link> is draw.io in an iframe;{" "}
          <Link href="/playground">/playground</Link> runs JavaScript and TypeScript
          in a Web Worker. Both ship in the same static export as the rest of the
          site — the visitor&apos;s browser does all the work.
        </p>
      </div>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat decisions.md
          <h2>why embed, and why run code in the browser</h2>
        </div>
        <p>
          <strong>draw.io, not a home-made canvas.</strong> The ask was to use{" "}
          <code>jgraph/drawio-desktop</code> — but that&apos;s an Electron app,
          and Electron can&apos;t be dropped into a web page. What it wraps is the{" "}
          <code>jgraph/drawio</code> web editor, which also ships an official{" "}
          <em>embed mode</em> at <code>embed.diagrams.net</code>: the same editor,
          every shape library, driven by a parent page over{" "}
          <code>postMessage</code>. Self-hosting that editor was on the table
          too, but it&apos;s ~110 MB of static files to carry in the repo and
          deploy for a feature that works fine from draw.io&apos;s own host.
        </p>
        <p>
          <strong>Client-side execution, not a sandbox service.</strong> The site
          is <code>output: &quot;export&quot;</code> — there&apos;s no server to
          run code on, and running other people&apos;s code server-side means
          building a sandbox (containers, resource limits, abuse handling). A
          browser already <em>is</em> a sandbox. The trade-off is that only
          browser-compatible JavaScript runs: no <code>fs</code>, no{" "}
          <code>http</code>, no <code>require()</code>.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat architecture.md
          <h2>what talks to what</h2>
        </div>
        <p>
          Everything below happens in the visitor&apos;s browser. Nothing new got
          provisioned for either tool; the dashed boxes are third-party hosts
          this repo doesn&apos;t own.
        </p>
        <div className="sc-diagram">
          <DiagramAnimator>
            <InterviewToolsArchDiagram />
          </DiagramAnimator>
        </div>
        <p className="sc-diagram-caption">
          Top: the whiteboard page and draw.io trade JSON messages across the
          iframe boundary. Bottom: the playground compiles, rewrites and runs code
          in a worker, pulling packages from esm.sh and typings from jsDelivr.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat components/whiteboard/Whiteboard.tsx | grep event
          <h2>the whiteboard is a postMessage handshake</h2>
        </div>
        <div className="sc-timeline">
          <div className="sc-timeline-item">
            <strong>1.</strong> The iframe loads{" "}
            <code>embed.diagrams.net/?embed=1&amp;proto=json&amp;libraries=1</code>.
            When the editor is ready it posts <code>{"{event: \"init\"}"}</code> to
            the parent — and then waits, showing its menus over an empty, greyed-out
            canvas, until it&apos;s handed a diagram.
          </div>
          <div className="sc-timeline-item">
            <strong>2.</strong> The page answers with{" "}
            <code>{"{action: \"load\", xml, autosave: 1}"}</code> — the active
            board&apos;s saved XML. Messages are only accepted from that origin and
            from the current iframe&apos;s own <code>contentWindow</code>.
          </div>
          <div className="sc-timeline-item">
            <strong>3.</strong> With autosave on, every edit comes back as{" "}
            <code>{"{event: \"autosave\", xml}"}</code>, which is written straight
            to <code>localStorage</code> under that board. Boards are just named
            XML strings — one per interview — so they also open from and download
            to plain <code>.drawio</code> files.
          </div>
          <div className="sc-timeline-item">
            <strong>4.</strong> PNG and SVG export is the same trick in reverse:
            the page sends <code>{"{action: \"export\", format}"}</code>, draw.io
            renders it and replies with a <code>data:</code> URI the page downloads.
          </div>
          <div className="sc-timeline-item">
            <strong>5.</strong> Switching the site between light and dark mode
            re-keys the iframe with the matching draw.io theme. Autosave has
            already stored the XML, so the reload loses nothing.
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> git log --grep=403
          <h2>the bug that looked like a broken editor</h2>
        </div>
        <p>
          The first version worked in every test and failed on the dev machine:
          draw.io drew its menus, then nothing — no shapes panel, nothing
          clickable. That&apos;s exactly what step 1 above looks like when step 2
          never happens. The browser console had the real answer:{" "}
          <code>embed.diagrams.net</code> was returning{" "}
          <strong>403 Forbidden</strong> for the iframe whenever the{" "}
          <code>Referer</code> was <code>http://localhost:3000</code>. The same URL
          loaded fine from an https page, and fine from localhost with the
          referrer stripped.
        </p>
        <p>
          The fix is one attribute: <code>referrerPolicy=&quot;no-referrer&quot;</code>{" "}
          on the iframe — the embed has no use for knowing who&apos;s embedding it.
          The lesson went in too: if draw.io hasn&apos;t sent <code>init</code>{" "}
          within 20 seconds, the page now says so, with a Retry button, instead of
          leaving a blank canvas that reads like a bug in the editor.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> ls lib/playground/
          <h2>the playground: compile, rewrite, run, format</h2>
        </div>
        <p>
          <strong>A Web Worker, not an iframe or <code>eval</code>.</strong> A{" "}
          <code>while (true) {"{}"}</code> in the page&apos;s own thread would freeze
          the whole tab. In a worker it can&apos;t, and the worker can be killed:
          Stop calls <code>worker.terminate()</code>, and so does a 10-second
          timeout if the code never finishes evaluating. Each run gets a fresh
          worker, so nothing leaks between runs.
        </p>
        <p>
          <strong>Any npm package, with no bundler.</strong> Before running,{" "}
          <code>imports.ts</code> rewrites bare specifiers —{" "}
          <code>import _ from &quot;lodash&quot;</code> becomes{" "}
          <code>https://esm.sh/lodash</code>, which serves any npm package as a
          browser-ready ES module. The rewritten code becomes a{" "}
          <code>blob:</code> URL that the worker <code>import()</code>s, which is
          also why top-level <code>await</code> just works.
        </p>
        <p>
          <strong>TypeScript without shipping TypeScript.</strong> Monaco already
          runs the TypeScript language service in its own worker for IntelliSense.
          The playground asks that same worker for <code>getEmitOutput</code> on
          the model, so transpiling costs no extra download.
        </p>
        <p>
          <strong>IntelliSense for the packages you import.</strong>{" "}
          <code>types.ts</code> is a small &quot;automatic type acquisition&quot;:
          for each imported package it reads <code>package.json</code> from
          jsDelivr, follows <code>types</code> (or falls back to{" "}
          <code>@types/*</code>), walks the <code>.d.ts</code> import graph, and
          registers every file with Monaco under{" "}
          <code>file:///node_modules/…</code> — so the language service resolves
          them exactly like a local install. Type <code>_.chu</code> and{" "}
          <code>chunk</code> comes up with its signature.
        </p>
        <p>
          <strong>Output that reads like Node.</strong> The worker replaces{" "}
          <code>console.*</code> with a small <code>util.inspect</code>-style
          formatter — nested objects, <code>Map</code>/<code>Set</code>, circular
          references, <code>%s</code>/<code>%d</code>, <code>console.table</code>{" "}
          as a box-drawn table — and posts finished strings back to the page.
          Stack traces have their <code>blob:</code> URLs rewritten to{" "}
          <code>main.js:line:col</code>.
        </p>
        <p>
          <strong>Sharing is a URL hash.</strong> &quot;Share link&quot; base64-encodes
          the code into <code>#code=…</code>. The hash never reaches a server, so
          sending a candidate a starting problem doesn&apos;t store anything
          anywhere.
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat trade-offs.md
          <h2>what this deliberately doesn&apos;t do</h2>
        </div>
        <p>
          <strong>No live collaboration.</strong> Boards and code live in one
          browser&apos;s <code>localStorage</code>; during an interview, the
          candidate sees them through screen-share. Real-time co-editing would
          need a sync backend, which is the one thing this whole design avoids.
        </p>
        <p>
          <strong>Three third-party hosts.</strong> draw.io&apos;s embed host,
          esm.sh and jsDelivr all have to be reachable. Monaco is pinned to an
          exact version so an upstream release can&apos;t change behaviour
          silently; packages imported in the playground resolve to their latest
          version unless the code pins one (<code>lodash@4</code>).
        </p>
      </Reveal>

      <Reveal>
        <div className="sc-section-head">
          <span className="sc-prompt">$</span> cat package.json | grep monaco
          <h2>stack</h2>
        </div>
        <div className="sc-chip-grid">
          {[
            "draw.io embed mode (proto=json)",
            "postMessage + localStorage",
            "@monaco-editor/react — Monaco 0.52.2 from jsDelivr",
            "Monaco's TypeScript worker for transpiling",
            "Module Web Worker + blob: URLs",
            "esm.sh — npm packages as ES modules",
            "jsDelivr — .d.ts type acquisition",
            "Static export — no new infrastructure",
          ].map((item) => (
            <span key={item} className="sc-chip">
              {item}
            </span>
          ))}
        </div>
      </Reveal>

      <div className="sc-footer">
        <p style={{ margin: 0 }}>
          Try them: <Link href="/whiteboard">open the whiteboard</Link> or{" "}
          <Link href="/playground">run some code</Link>. Or{" "}
          <Link href="/howdidimakethis">see what else has a page like this</Link>.
        </p>
      </div>
    </>
  );
}
