// A small "automatic type acquisition" for the playground editor: when the
// code imports an npm package, fetch its .d.ts files from jsDelivr (the
// package's own typings, or DefinitelyTyped's @types/* as a fallback) and
// register them with Monaco under file:///node_modules/..., so the
// TypeScript language service resolves them like a local install and
// IntelliSense / hover / signature help work for library APIs too.

import type { Monaco } from "@monaco-editor/react";

const CDN = "https://cdn.jsdelivr.net/npm/";
const MAX_FILES_PER_PKG = 120;
const MAX_DEP_DEPTH = 2;

export type TypeStatus = "loading" | "ready" | "none";

const status = new Map<string, TypeStatus>();
const inflight = new Map<string, Promise<void>>();

async function text(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    return r.ok ? await r.text() : null;
  } catch {
    return null;
  }
}

function typesEntry(pkg: Record<string, unknown>): string | null {
  const direct = (pkg.types ?? pkg.typings) as string | undefined;
  if (direct) return direct;
  const exp = pkg.exports as Record<string, unknown> | undefined;
  const dot = exp?.["."];
  if (dot && typeof dot === "object") {
    const d = dot as Record<string, unknown>;
    const t = d.types ?? (d.import as Record<string, unknown> | undefined)?.types;
    if (typeof t === "string") return t;
  }
  return null;
}

const REF_RE =
  /(?:from\s*|import\s*\(\s*|require\s*\(\s*|import\s+)['"]([^'"\n]+)['"]|\/\/\/\s*<reference\s+(path|types)\s*=\s*['"]([^'"]+)['"]/g;

function bareName(spec: string) {
  const p = spec.split("/");
  return spec.startsWith("@") ? `${p[0]}/${p[1]}` : p[0];
}

async function loadPackage(monaco: Monaco, name: string, depth: number): Promise<boolean> {
  const pkgText = await text(`${CDN}${name}/package.json`);
  if (!pkgText) return false;
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(pkgText);
  } catch {
    return false;
  }
  const version = pkg.version as string;
  const base = `${CDN}${name}@${version}/`;
  let entry = typesEntry(pkg);
  if (!entry && (await text(`${base}index.d.ts`)) !== null) entry = "index.d.ts";
  if (!entry) return false;

  const add = (path: string, content: string) => {
    const uri = `file:///node_modules/${name}/${path}`;
    monaco.languages.typescript.typescriptDefaults.addExtraLib(content, uri);
    monaco.languages.typescript.javascriptDefaults.addExtraLib(content, uri);
  };
  // package.json lets TS's node resolution find the "types" entry itself.
  add("package.json", JSON.stringify({ name, version, types: entry.replace(/^\.\//, "") }));

  const seen = new Set<string>();
  const deps = new Set<string>();
  const queue = [entry.replace(/^\.\//, "")];
  while (queue.length && seen.size < MAX_FILES_PER_PKG) {
    const path = queue.shift()!;
    if (seen.has(path)) continue;
    seen.add(path);
    // try the path as given, then with .d.ts, then as a directory index
    let content: string | null = null;
    let resolved = path;
    const cands = /\.d\.[mc]?ts$/.test(path)
      ? [path]
      : /\.[mc]?js$/.test(path)
        ? [path.replace(/\.(m|c)?js$/, ".d.$1ts")] // "./x.js" in a .d.ts means "./x.d.ts"
        : [`${path}.d.ts`, `${path}/index.d.ts`];
    for (const cand of cands) {
      content = await text(base + cand);
      if (content !== null) {
        resolved = cand;
        break;
      }
    }
    if (content === null) continue;
    add(resolved, content);
    seen.add(resolved);
    const dir = resolved.includes("/") ? resolved.slice(0, resolved.lastIndexOf("/") + 1) : "";
    for (const m of content.matchAll(REF_RE)) {
      const spec = m[1] ?? m[3];
      const isTypesRef = m[2] === "types";
      if (!isTypesRef && spec.startsWith(".")) {
        queue.push(new URL(spec, `http://x/${dir}`).pathname.slice(1));
      } else if (!isTypesRef && m[2] === "path") {
        queue.push(new URL(spec, `http://x/${dir}`).pathname.slice(1));
      } else if (!spec.startsWith("node:")) {
        deps.add(bareName(spec));
      }
    }
  }
  if (depth < MAX_DEP_DEPTH) {
    await Promise.all([...deps].filter((d) => d !== name).map((d) => ensure(monaco, d, depth + 1)));
  }
  return true;
}

function ensure(monaco: Monaco, name: string, depth: number): Promise<void> {
  if (inflight.has(name)) return inflight.get(name)!;
  const p = (async () => {
    status.set(name, "loading");
    let ok = await loadPackage(monaco, name, depth);
    if (!ok && !name.startsWith("@types/")) {
      // DefinitelyTyped: @scope/pkg -> @types/scope__pkg
      const dt = `@types/${name.startsWith("@") ? name.slice(1).replace("/", "__") : name}`;
      ok = await loadPackage(monaco, dt, depth);
    }
    status.set(name, ok ? "ready" : "none");
  })();
  inflight.set(name, p);
  return p;
}

/** Loads typings for each package; calls onChange as statuses update. */
export async function acquireTypes(
  monaco: Monaco,
  packages: string[],
  onChange: (s: Record<string, TypeStatus>) => void,
) {
  const snapshot = () =>
    onChange(Object.fromEntries(packages.map((p) => [p, status.get(p) ?? "loading"])));
  snapshot();
  await Promise.all(packages.map((p) => ensure(monaco, p, 0).then(snapshot)));
}
