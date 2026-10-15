// Finds and rewrites module specifiers in user code for the /playground
// code runner. The runner has no bundler and no node_modules: a bare
// import like `import _ from "lodash"` is rewritten to an esm.sh URL, which
// serves any npm package as a browser-ready ES module.

const SPECIFIER_RE =
  /(\bimport\s*(?:[\w*{}\s,$]+?\s*from\s*)?|\bexport\s*[\w*{}\s,$]*?\s*from\s*|\bimport\s*\(\s*)(['"])([^'"\n]+)\2/g;

export const ESM_CDN = "https://esm.sh/";

function isBare(spec: string) {
  return !/^(\.{0,2}\/|[a-z][a-z0-9+.-]*:)/i.test(spec);
}

/** `lodash/fp` -> `lodash`, `@scope/pkg/sub` -> `@scope/pkg`, strips `@version`. */
export function packageName(spec: string) {
  const parts = spec.split("/");
  const name = spec.startsWith("@") ? `${parts[0]}/${parts[1] ?? ""}` : parts[0];
  // drop a pinned version: lodash@4 / @scope/pkg@1.2
  const at = name.lastIndexOf("@");
  return at > 0 ? name.slice(0, at) : name;
}

/** Bare package names imported by `code` (deduped, in order). */
export function findPackages(code: string): string[] {
  const out = new Set<string>();
  for (const m of code.matchAll(SPECIFIER_RE)) {
    const spec = m[3];
    if (isBare(spec)) out.add(packageName(spec));
  }
  return [...out];
}

/** Rewrites bare specifiers to esm.sh URLs; leaves URLs untouched. */
export function rewriteImports(code: string): string {
  return code.replace(SPECIFIER_RE, (full, head: string, q: string, spec: string) =>
    isBare(spec) ? `${head}${q}${ESM_CDN}${spec}${q}` : full,
  );
}
