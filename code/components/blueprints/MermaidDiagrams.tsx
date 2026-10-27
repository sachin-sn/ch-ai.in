"use client";

import { useEffect, useRef } from "react";
import { createMermaidPlayer, type MermaidPlayer } from "@/lib/motion/animateMermaid";

// Turns every ```mermaid code block inside its container into a drawn
// diagram. Markdown -> HTML happens at build time (lib/blueprints), which
// leaves each diagram as <pre><code class="language-mermaid">; this swaps
// those for SVG in the browser.
//
// Mermaid is ~1 MB, so it's imported lazily here and only blueprint pages
// ever load it. Diagram colours come from the active theme's semantic
// tokens, and the diagrams are redrawn whenever the theme or light/dark
// mode changes (both live as attributes on <html>).
//
// Used by the blueprints and by blog posts. With `animate`, each diagram
// plays in once as it scrolls into view (lib/motion/animateMermaid.ts) and
// gets a Replay button; a theme change redraws it finished, not replaying.
// prefers-reduced-motion turns the animation (and the button) off.

type Props = { containerId: string; animate?: boolean };

let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;
function loadMermaid() {
  mermaidPromise ??= import("mermaid").then((m) => m.default);
  return mermaidPromise;
}

/** Resolve a CSS custom property to the computed colour string. */
function resolveColor(name: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}

/**
 * Resolve a CSS custom property to a plain, opaque hex colour Mermaid can
 * parse. Some themes (glass) use translucent tokens like
 * rgba(255,255,255,0.5) for panels -- Mermaid can't use those (and its
 * derived shades go wrong), so the colour is painted onto a 1x1 canvas
 * over `base` (the page surface) and the composited pixel is read back.
 * That also flattens any colour syntax the canvas understands (color-mix,
 * oklch, ...) to hex.
 */
function token(name: string, fallback: string, base = "#ffffff"): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallback;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = fallback;
  ctx.fillStyle = resolveColor(name); // ignored if the browser can't parse it
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function themeVariables() {
  // Surface first (flattened over white, in case it is ever translucent),
  // then every other token composited over that surface.
  const surface = token("--color-surface", "#12100e");
  const panel = token("--color-surface-panel", "#1c1916", surface);
  const ink = token("--color-ink", "#ede6d8", surface);
  const dim = token("--color-ink-dim", "#a89e8c", surface);
  const accent = token("--color-accent", "#b8863b", surface);
  const bright = token("--color-accent-bright", "#d4a256", surface);
  const mode = document.documentElement.getAttribute("data-mode");
  return {
    darkMode: mode !== "light",
    background: surface,
    fontFamily: getComputedStyle(document.body).fontFamily,
    fontSize: "15px",
    primaryColor: panel,
    primaryTextColor: ink,
    primaryBorderColor: accent,
    secondaryColor: panel,
    tertiaryColor: surface,
    lineColor: dim,
    textColor: ink,
    mainBkg: panel,
    nodeBorder: accent,
    clusterBkg: surface,
    clusterBorder: dim,
    titleColor: ink,
    edgeLabelBackground: surface,
    actorBkg: panel,
    actorBorder: accent,
    actorTextColor: ink,
    actorLineColor: dim,
    signalColor: ink,
    signalTextColor: ink,
    labelBoxBkgColor: panel,
    labelBoxBorderColor: accent,
    labelTextColor: ink,
    loopTextColor: ink,
    noteBkgColor: panel,
    noteBorderColor: bright,
    noteTextColor: ink,
    activationBkgColor: panel,
    activationBorderColor: bright,
    sequenceNumberColor: surface,
  };
}

let renderCount = 0;

export default function MermaidDiagrams({ containerId, animate = false }: Props) {
  const generation = useRef(0);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // First pass: replace each <pre> with an empty figure that keeps the
    // diagram source, so later redraws (theme change) don't need the <pre>.
    container
      .querySelectorAll<HTMLElement>("pre > code.language-mermaid")
      .forEach((code) => {
        const pre = code.parentElement!;
        // Already wrapped (effect re-ran, e.g. React strict mode).
        if (pre.parentElement?.classList.contains("blueprint-diagram")) return;
        const figure = document.createElement("figure");
        figure.className = "blueprint-diagram";
        figure.dataset.source = code.textContent ?? "";
        figure.setAttribute("aria-busy", "true");
        // Keep the source visible until Mermaid is ready (and as the
        // fallback if a diagram fails to parse).
        pre.replaceWith(figure);
        figure.appendChild(pre);
      });

    let cancelled = false;

    // ---- optional animation ------------------------------------------------
    const motionOk =
      animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const players = new Map<HTMLElement, MermaidPlayer>();
    const waiting = new Map<HTMLElement, IntersectionObserver>();
    const played = new WeakSet<HTMLElement>();

    function enhance(figure: HTMLElement) {
      players.get(figure)?.stop();
      waiting.get(figure)?.disconnect();
      waiting.delete(figure);
      const player = createMermaidPlayer(figure);
      if (!player) return; // diagram type we don't animate: leave it as drawn
      players.set(figure, player);

      const replay = document.createElement("button");
      replay.type = "button";
      replay.className = "diagram-replay";
      replay.textContent = "↻ Replay";
      replay.setAttribute("aria-label", "Replay the diagram animation");
      replay.addEventListener("click", () => {
        player.stop();
        player.reset();
        player.play();
      });
      figure.appendChild(replay);

      // A redraw after a theme change shows the finished diagram.
      if (played.has(figure)) return;
      played.add(figure);
      player.reset();
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          waiting.delete(figure);
          player.play();
        },
        { threshold: 0.1 },
      );
      waiting.set(figure, io);
      io.observe(figure);
    }

    async function drawAll() {
      const run = ++generation.current;
      const mermaid = await loadMermaid();
      if (cancelled || run !== generation.current) return;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables: themeVariables(),
        flowchart: { htmlLabels: true, curve: "basis" },
      });
      const figures = container!.querySelectorAll<HTMLElement>(
        "figure.blueprint-diagram",
      );
      for (const figure of figures) {
        const source = figure.dataset.source ?? "";
        try {
          const { svg } = await mermaid.render(`bp-mermaid-${++renderCount}`, source);
          if (cancelled || run !== generation.current) return;
          figure.innerHTML = svg;
          // Don't let a wide diagram shrink below a readable size on small
          // screens -- past that point the figure scrolls sideways instead.
          const el = figure.querySelector("svg");
          const natural = el?.viewBox.baseVal?.width;
          if (el && natural) el.style.minWidth = `${Math.min(natural, 560)}px`;
          figure.classList.remove("is-error");
          if (motionOk) enhance(figure);
        } catch {
          // Leave (or restore) the source as a code block on parse error.
          figure.classList.add("is-error");
          if (!figure.querySelector("pre")) {
            const pre = document.createElement("pre");
            const code = document.createElement("code");
            code.textContent = source;
            pre.appendChild(code);
            figure.replaceChildren(pre);
          }
        }
        figure.removeAttribute("aria-busy");
      }
    }

    drawAll();

    // Redraw on theme / light-dark switch. A short delay lets the theme's
    // CSS variables (and any view transition) settle before we read them.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(drawAll, 120);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-mode"],
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      observer.disconnect();
      waiting.forEach((io) => io.disconnect());
      players.forEach((p) => p.stop());
    };
  }, [containerId, animate]);

  return null;
}
