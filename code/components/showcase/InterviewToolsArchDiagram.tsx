// Hand-drawn diagram for the /howdidimakethis/interview-tools showcase page.
// Both tools live entirely in the visitor's browser -- the site is still a
// static export with no backend -- so the whole drawing is "request time",
// split into one lane per tool. Third-party origins (draw.io's embed host,
// the two CDNs) are drawn dashed, since nothing about them is provisioned
// by this repo. Same conventions as BlogArchDiagram.tsx: plain inline SVG,
// viewBox-scaled, colors from the page's --sc-* custom properties, and
// data-flow on the paths DiagramAnimator should run a packet along.
export default function InterviewToolsArchDiagram() {
  return (
    <svg
      viewBox="0 0 720 430"
      role="img"
      aria-label="Architecture diagram. Whiteboard lane: the /whiteboard page (Whiteboard.tsx) embeds draw.io from embed.diagrams.net in an iframe and talks to it over postMessage — it sends load and export, draw.io sends init, autosave and export back — and autosaved diagram XML is kept per board in localStorage. Playground lane: the Monaco editor, loaded from jsDelivr along with npm type definitions, feeds code to a transpile-and-rewrite step that turns bare imports into esm.sh URLs; the result runs as a module inside a Web Worker, which imports packages from esm.sh and posts console output back to the console panel. Stop or a 10 second timeout terminates the worker."
    >
      <defs>
        <marker id="sc-i-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--sc-accent-bright)" />
        </marker>
        <marker id="sc-i-arrow-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--sc-ink-dim)" />
        </marker>
      </defs>

      <g style={{ fontFamily: "var(--sc-font-mono)" }}>
        {/* ================= lane 1: /whiteboard ================= */}
        <text x="14" y="16" fontSize="10" fill="var(--sc-ink-dim)">/whiteboard — the visitor&apos;s browser</text>

        <rect x="14" y="28" width="180" height="76" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="104" y="52" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">Whiteboard.tsx</text>
        <text x="104" y="69" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">boards, toolbar,</text>
        <text x="104" y="82" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">20s load watchdog</text>

        <rect x="420" y="28" width="286" height="76" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" strokeDasharray="4 3" />
        <text x="563" y="52" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">draw.io in an &lt;iframe&gt;</text>
        <text x="563" y="69" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">embed.diagrams.net · embed=1&amp;proto=json</text>
        <text x="563" y="82" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">referrerPolicy=&quot;no-referrer&quot;</text>

        <path d="M194 52 L420 52" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.3" markerEnd="url(#sc-i-arrow-dim)" />
        <text x="307" y="45" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">load · export</text>
        <path data-flow d="M420 82 L194 82" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-i-arrow)" />
        <text x="307" y="98" textAnchor="middle" fontSize="9" fill="var(--sc-accent)">init · autosave · export</text>

        <rect x="14" y="134" width="180" height="56" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="104" y="157" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--sc-ink)">localStorage</text>
        <text x="104" y="174" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">named boards → .drawio XML</text>

        <path data-flow d="M104 104 L104 134" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-i-arrow)" />
        <text x="112" y="123" fontSize="9" fill="var(--sc-accent)">autosaved XML</text>

        <text x="420" y="134" fontSize="9" fill="var(--sc-ink-dim)">• never sees the diagram&apos;s storage —</text>
        <text x="420" y="148" fontSize="9" fill="var(--sc-ink-dim)">  only the XML it&apos;s handed in `load`</text>
        <text x="420" y="166" fontSize="9" fill="var(--sc-ink-dim)">• PNG / SVG export comes back as a</text>
        <text x="420" y="180" fontSize="9" fill="var(--sc-ink-dim)">  data: URI → downloaded by the page</text>

        {/* ================= lane 2: /playground ================= */}
        <line x1="14" y1="212" x2="706" y2="212" stroke="var(--sc-line)" strokeDasharray="2 4" />
        <text x="14" y="232" fontSize="10" fill="var(--sc-ink-dim)">/playground — the visitor&apos;s browser</text>

        <rect x="14" y="244" width="150" height="76" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="89" y="268" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--sc-ink)">Monaco editor</text>
        <text x="89" y="285" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">JS / TS IntelliSense</text>
        <text x="89" y="298" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">Ctrl/⌘ + Enter</text>

        <rect x="194" y="244" width="150" height="76" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="269" y="268" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--sc-ink)">emit + rewrite</text>
        <text x="269" y="285" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">TS worker → JS</text>
        <text x="269" y="298" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">&quot;lodash&quot; → esm.sh/lodash</text>

        <rect x="374" y="244" width="150" height="76" rx="6" fill="var(--sc-bg-panel-raised)" stroke="var(--sc-line)" />
        <text x="449" y="268" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--sc-ink)">Web Worker</text>
        <text x="449" y="285" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">import(blob: URL)</text>
        <text x="449" y="298" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">console.* captured</text>

        <rect x="554" y="244" width="152" height="76" rx="6" fill="var(--sc-bg-panel)" stroke="var(--sc-line)" />
        <text x="630" y="268" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--sc-ink)">console panel</text>
        <text x="630" y="285" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">util.inspect-style</text>
        <text x="630" y="298" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">formatted lines</text>

        <path data-flow d="M164 282 L194 282" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-i-arrow)" />
        <path data-flow d="M344 282 L374 282" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-i-arrow)" />
        <path data-flow d="M524 282 L554 282" fill="none" stroke="var(--sc-accent-bright)" strokeWidth="1.5" markerEnd="url(#sc-i-arrow)" />
        <text x="539" y="240" textAnchor="middle" fontSize="8.5" fill="var(--sc-accent)">postMessage</text>

        <text x="368" y="336" textAnchor="end" fontSize="9" fill="var(--sc-ink-dim)">Stop / 10s → worker.terminate()</text>

        {/* third-party CDNs, dashed: nothing here is provisioned by this repo */}
        <rect x="14" y="358" width="150" height="56" rx="6" fill="none" stroke="var(--sc-line)" strokeDasharray="4 3" />
        <text x="89" y="381" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--sc-ink)">cdn.jsdelivr.net</text>
        <text x="89" y="398" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">Monaco + npm .d.ts files</text>

        <rect x="374" y="358" width="150" height="56" rx="6" fill="none" stroke="var(--sc-line)" strokeDasharray="4 3" />
        <text x="449" y="381" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--sc-ink)">esm.sh</text>
        <text x="449" y="398" textAnchor="middle" fontSize="9" fill="var(--sc-ink-dim)">any npm package as ESM</text>

        <path d="M89 358 L89 320" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.3" markerEnd="url(#sc-i-arrow-dim)" />
        <text x="97" y="351" fontSize="9" fill="var(--sc-ink-dim)">typings → IntelliSense</text>
        <path d="M478 320 L478 358" fill="none" stroke="var(--sc-ink-dim)" strokeWidth="1.3" markerEnd="url(#sc-i-arrow-dim)" />
        <text x="486" y="343" fontSize="9" fill="var(--sc-ink-dim)">import</text>
      </g>
    </svg>
  );
}
