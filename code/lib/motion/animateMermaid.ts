import { createTimeline, svg, utils } from "animejs";

// Plays a rendered Mermaid diagram in, step by step (anime.js):
//   flowchart  -> the clusters fade in, then nodes appear top to bottom and
//                 each arrow draws itself on its way in
//   sequence   -> the actors and their lifelines appear, then each message
//                 draws in order from the top, notes fade in at their place
// Anything the player does not recognise stays visible, so the worst case
// is a diagram that simply does not animate. Other diagram types return
// null. Call reset() before play() to replay.

export type MermaidPlayer = {
  /** Hide everything that will animate (call right before play). */
  reset(): void;
  /** Run the animation. onDone fires once it has finished. */
  play(onDone?: () => void): void;
  /** Stop and leave the diagram fully visible, exactly as Mermaid drew it. */
  stop(): void;
};

type Timeline = ReturnType<typeof createTimeline>;

const FADE = 280;
const DRAW = 420;

const isDashed = (el: Element) => {
  const d = getComputedStyle(el).strokeDasharray;
  return !!d && d !== "none" && d !== "0";
};

export function createMermaidPlayer(figure: HTMLElement): MermaidPlayer | null {
  const svgEl = figure.querySelector("svg");
  if (!svgEl) return null;
  const kind = svgEl.getAttribute("aria-roledescription") ?? "";
  if (kind.startsWith("flowchart")) return flowchartPlayer(svgEl);
  if (kind.startsWith("sequence")) return sequencePlayer(svgEl);
  return null;
}

/** Shared plumbing: hide, build a timeline from steps, restore on stop. */
function makePlayer(
  everything: SVGElement[],
  drawn: SVGGraphicsElement[],
  build: (tl: Timeline, drawables: Map<Element, unknown>) => void,
): MermaidPlayer {
  const markers = new Map<Element, string | null>(
    drawn.map((p) => [p, p.getAttribute("marker-end")]),
  );
  // Mermaid styles some elements inline (dashed lines use
  // style="stroke-dasharray: 3, 3"), so remember exactly how each one was
  // drawn and put that back, rather than stripping properties.
  const DRAW_ATTRS = ["stroke-dasharray", "stroke-dashoffset", "pathLength", "vector-effect"];
  const styleOf = new Map<Element, string | null>(everything.map((e) => [e, e.getAttribute("style")]));
  const attrsOf = new Map<Element, (string | null)[]>(
    drawn.map((p) => [p, DRAW_ATTRS.map((a) => p.getAttribute(a))]),
  );
  let tl: Timeline | null = null;

  const restore = () => {
    for (const el of everything) {
      const style = styleOf.get(el);
      if (!style) el.removeAttribute("style");
      else el.setAttribute("style", style);
    }
    for (const p of drawn) {
      const saved = attrsOf.get(p)!;
      DRAW_ATTRS.forEach((a, i) => {
        if (saved[i] === null) p.removeAttribute(a);
        else p.setAttribute(a, saved[i]!);
      });
      const m = markers.get(p);
      if (m) p.setAttribute("marker-end", m);
    }
  };

  return {
    reset() {
      tl?.pause();
      utils.set(everything, { opacity: 0 });
      for (const p of drawn) p.removeAttribute("marker-end");
    },
    play(onDone) {
      const drawables = new Map<Element, unknown>();
      const solid = drawn.filter((p) => !isDashed(p));
      const proxies = svg.createDrawable(solid) as unknown[];
      solid.forEach((p, i) => drawables.set(p, proxies[i]));
      utils.set(proxies as never, { draw: "0 0" });
      tl = createTimeline({
        defaults: { ease: "outQuad" },
        // One frame later, so anime's own final write cannot undo the restore.
        onComplete: () =>
          requestAnimationFrame(() => {
            restore();
            onDone?.();
          }),
      });
      build(tl, drawables);
    },
    stop() {
      tl?.pause();
      tl = null;
      restore();
    },
  };
}

/** Fade an element in, or (for a line / path) draw it and bring its arrowhead back. */
function reveal(
  tl: Timeline,
  el: SVGElement,
  at: number,
  drawables: Map<Element, unknown>,
  markers: Map<Element, string | null>,
) {
  const proxy = drawables.get(el);
  if (proxy) {
    tl.add(el, { opacity: [0, 1], duration: 1 }, at);
    tl.add(proxy as never, { draw: ["0 0", "0 1"], duration: DRAW, ease: "inOutQuad" }, at);
    const m = markers.get(el);
    if (m) tl.call(() => el.setAttribute("marker-end", m), at + DRAW);
  } else {
    tl.add(el, { opacity: [0, 1], duration: FADE }, at);
  }
}

function markerMap(els: Element[]) {
  return new Map(els.map((e) => [e, e.getAttribute("marker-end")]));
}

// ---------------------------------------------------------------- flowchart

function flowchartPlayer(root: SVGSVGElement): MermaidPlayer | null {
  const nodes = Array.from(root.querySelectorAll<SVGGElement>("g.node"));
  const edges = Array.from(root.querySelectorAll<SVGPathElement>("path.flowchart-link"));
  if (nodes.length === 0) return null;

  // "...flowchart-b1-0" -> "b1"
  const keyOf = new Map<string, SVGGElement>();
  for (const n of nodes) {
    const m = n.id.match(/flowchart-(.+)-\d+$/);
    if (m) keyOf.set(m[1], n);
  }

  // Edge labels sit next to the edge paths, in the same order.
  const labels: (SVGGElement | undefined)[] = edges.map((e) => {
    const group = e.parentElement;
    const siblings = group?.nextElementSibling?.querySelectorAll<SVGGElement>(":scope > g.edgeLabel");
    const index = group ? Array.from(group.querySelectorAll("path.flowchart-link")).indexOf(e) : -1;
    return siblings && index >= 0 ? siblings[index] : undefined;
  });

  // "...L_b1_b2_0" -> ["b1", "b2"] (node keys may themselves hold underscores).
  const ends = edges.map((e) => {
    const body = e.id.match(/L_(.+)_\d+$/)?.[1] ?? "";
    const parts = body.split("_");
    for (let i = 1; i < parts.length; i++) {
      const a = parts.slice(0, i).join("_");
      const b = parts.slice(i).join("_");
      if (keyOf.has(a) && keyOf.has(b)) return [a, b] as const;
    }
    return null;
  });

  // Reading order: top to bottom, then left to right.
  const centre = (n: Element) => {
    const r = n.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const ordered = [...nodes].sort((a, b) => {
    const ca = centre(a);
    const cb = centre(b);
    return Math.round(ca.y / 12) - Math.round(cb.y / 12) || ca.x - cb.x;
  });
  const rank = new Map(ordered.map((n, i) => [n, i]));

  const clusters = Array.from(root.querySelectorAll<SVGGElement>("g.cluster"));
  const everything: SVGElement[] = [...clusters, ...nodes, ...edges, ...labels.filter((l): l is SVGGElement => !!l)];
  const markers = markerMap(edges);

  return makePlayer(everything, edges, (tl, drawables) => {
    clusters.forEach((c) => tl.add(c, { opacity: [0, 1], duration: FADE }, 0));
    const STEP = 330;
    ordered.forEach((node, k) => {
      const at = 200 + k * STEP;
      tl.add(node, { opacity: [0, 1], duration: FADE }, at + 120);
      // Edges whose later end is this node draw in just before it appears.
      edges.forEach((edge, i) => {
        const pair = ends[i];
        if (!pair) return;
        const last = Math.max(rank.get(keyOf.get(pair[0])!)!, rank.get(keyOf.get(pair[1])!)!);
        if (last !== k) return;
        reveal(tl, edge, at, drawables, markers);
        const label = labels[i];
        if (label) tl.add(label, { opacity: [0, 1], duration: FADE }, at + DRAW / 2);
      });
    });
    // Edges and labels we could not place are shown at the end rather than lost.
    edges.forEach((edge, i) => {
      if (ends[i]) return;
      reveal(tl, edge, 200 + ordered.length * STEP, drawables, markers);
      const label = labels[i];
      if (label) tl.add(label, { opacity: [0, 1], duration: FADE }, 200 + ordered.length * STEP);
    });
  });
}

// ----------------------------------------------------------------- sequence

function sequencePlayer(root: SVGSVGElement): MermaidPlayer | null {
  const actors = Array.from(root.querySelectorAll<SVGElement>("rect.actor, text.actor"));
  const lifelines = Array.from(root.querySelectorAll<SVGLineElement>("line.actor-line"));
  const parts = Array.from(
    root.querySelectorAll<SVGElement>(".messageText, .messageLine0, .messageLine1, rect.note, .noteText"),
  );

  // Group the flat, document-ordered parts into steps.
  type Step = { shapes: SVGElement[]; lines: SVGGraphicsElement[]; y: number };
  const steps: Step[] = [];
  let text: SVGElement | null = null;
  let note: SVGElement | null = null;
  const top = (el: Element) => el.getBoundingClientRect().top;
  for (const el of parts) {
    if (el.classList.contains("messageText")) {
      text = el;
    } else if (el.classList.contains("messageLine0") || el.classList.contains("messageLine1")) {
      steps.push({ shapes: text ? [text] : [], lines: [el as SVGGraphicsElement], y: top(el) });
      text = null;
    } else if (el.tagName.toLowerCase() === "rect") {
      note = el;
    } else if (el.classList.contains("noteText")) {
      steps.push({ shapes: note ? [note, el] : [el], lines: [], y: top(note ?? el) });
      note = null;
    }
  }
  if (steps.length === 0) return null;
  steps.sort((a, b) => a.y - b.y);

  const lines = steps.flatMap((s) => s.lines);
  const everything: SVGElement[] = [...actors, ...lifelines, ...steps.flatMap((s) => [...s.shapes, ...s.lines])];
  const markers = markerMap([...lines, ...lifelines]);

  return makePlayer(everything, [...lifelines, ...lines], (tl, drawables) => {
    actors.forEach((a) => tl.add(a, { opacity: [0, 1], duration: FADE }, 0));
    lifelines.forEach((l) => reveal(tl, l, 120, drawables, markers));
    const STEP = 620;
    steps.forEach((step, k) => {
      const at = 600 + k * STEP;
      step.shapes.forEach((s) => tl.add(s, { opacity: [0, 1], duration: FADE }, at));
      step.lines.forEach((l) => reveal(tl, l, at + 100, drawables, markers));
    });
  });
}
