// Source of the Web Worker that executes playground code. Running in a
// worker (rather than an iframe or the page itself) means a runaway
// `while (true)` never freezes the UI, and Stop / the timeout can simply
// worker.terminate() it. console.* is captured and posted back to the
// page as pre-formatted strings, Node-`util.inspect` style.
//
// Kept as a plain string so it can be turned into a Blob URL at runtime
// (no bundler config, works with the static export).

export const WORKER_SOURCE = String.raw`
const MAX_DEPTH = 4;
const MAX_ITEMS = 100;

function fmt(v, depth, seen, nested) {
  const t = typeof v;
  if (v === null) return "null";
  if (t === "undefined") return "undefined";
  if (t === "string") return nested ? JSON.stringify(v) : v;
  if (t === "number" || t === "boolean") return Object.is(v, -0) ? "-0" : String(v);
  if (t === "bigint") return v + "n";
  if (t === "symbol") return v.toString();
  if (t === "function") {
    const isClass = /^class[\s{]/.test(Function.prototype.toString.call(v));
    return "[" + (isClass ? "class " : "Function") + (v.name ? (isClass ? "" : ": ") + v.name : isClass ? "(anonymous)" : " (anonymous)") + "]";
  }
  if (v instanceof Error) return nested ? "[" + v.name + ": " + v.message + "]" : (v.stack || v.name + ": " + v.message);
  if (v instanceof Date) return isNaN(v) ? "Invalid Date" : v.toISOString();
  if (v instanceof RegExp) return String(v);
  if (typeof Promise !== "undefined" && v instanceof Promise) return "Promise { <pending?> }";
  if (seen.has(v)) return "[Circular]";
  if (depth > MAX_DEPTH) return Array.isArray(v) ? "[Array]" : "[Object]";
  seen.add(v);
  const ind = "  ".repeat(depth + 1), end = "  ".repeat(depth);
  const wrap = (open, items, close, prefix) => {
    if (!items.length) return (prefix || "") + open + close;
    const one = (prefix || "") + open + " " + items.join(", ") + " " + close;
    const out = one.length <= 72 && !one.includes("\n") ? one
      : (prefix || "") + open + "\n" + ind + items.join(",\n" + ind) + "\n" + end + close;
    return out;
  };
  let res;
  try {
    if (Array.isArray(v) || ArrayBuffer.isView(v)) {
      const arr = Array.from(v).slice(0, MAX_ITEMS).map((x) => fmt(x, depth + 1, seen, true));
      if (v.length > MAX_ITEMS) arr.push("... " + (v.length - MAX_ITEMS) + " more items");
      const pre = Array.isArray(v) ? "" : v.constructor.name + "(" + v.length + ") ";
      res = wrap("[", arr, "]", pre);
    } else if (v instanceof Map) {
      const items = [...v].slice(0, MAX_ITEMS).map(([k, x]) => fmt(k, depth + 1, seen, true) + " => " + fmt(x, depth + 1, seen, true));
      res = wrap("{", items, "}", "Map(" + v.size + ") ");
    } else if (v instanceof Set) {
      const items = [...v].slice(0, MAX_ITEMS).map((x) => fmt(x, depth + 1, seen, true));
      res = wrap("{", items, "}", "Set(" + v.size + ") ");
    } else {
      const keys = Object.keys(v);
      const items = keys.slice(0, MAX_ITEMS).map((k) =>
        (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ": " + fmt(v[k], depth + 1, seen, true));
      if (keys.length > MAX_ITEMS) items.push("... " + (keys.length - MAX_ITEMS) + " more keys");
      const ctor = Object.getPrototypeOf(v);
      const name = ctor === null ? "[Object: null prototype] " : ctor.constructor && ctor.constructor.name !== "Object" ? ctor.constructor.name + " " : "";
      res = wrap("{", items, "}", name);
    }
  } finally {
    seen.delete(v);
  }
  return res;
}

const format = (args) => {
  // printf-style %s %d %i %f %o %O %j substitution, like Node.
  if (typeof args[0] === "string" && /%[sdifoOjc%]/.test(args[0]) && args.length > 1) {
    let i = 1;
    const head = args[0].replace(/%([sdifoOjc%])/g, (m, c) => {
      if (c === "%") return "%";
      if (i >= args.length) return m;
      const a = args[i++];
      if (c === "s") return typeof a === "string" ? a : fmt(a, 0, new Set(), true);
      if (c === "d" || c === "i") return String(c === "i" ? parseInt(a) : Number(a));
      if (c === "f") return String(parseFloat(a));
      if (c === "c") return "";
      return fmt(a, 0, new Set(), true);
    });
    args = [head, ...args.slice(i)];
  }
  return args.map((a) => fmt(a, 0, new Set(), false)).join(" ");
};

const send = (level, text) => postMessage({ type: "log", level, text });
const counts = {}, timers = {};
let group = 0;
const out = (level) => (...a) => send(level, "  ".repeat(group) + format(a));
console.log = out("log");
console.info = out("info");
console.debug = out("debug");
console.warn = out("warn");
console.error = out("error");
console.dir = (v) => send("log", "  ".repeat(group) + fmt(v, 0, new Set(), true));
console.trace = (...a) => send("log", format(a) + "\n" + (new Error().stack || "").split("\n").slice(2).join("\n"));
console.assert = (c, ...a) => { if (!c) send("error", "Assertion failed" + (a.length ? ": " + format(a) : "")); };
console.count = (l = "default") => send("log", l + ": " + (counts[l] = (counts[l] || 0) + 1));
console.countReset = (l = "default") => { counts[l] = 0; };
console.time = (l = "default") => { timers[l] = performance.now(); };
console.timeLog = (l = "default", ...a) => send("log", l + ": " + (performance.now() - timers[l]).toFixed(3) + "ms" + (a.length ? " " + format(a) : ""));
console.timeEnd = (l = "default") => { console.timeLog(l); delete timers[l]; };
console.group = console.groupCollapsed = (...a) => { if (a.length) console.log(...a); group++; };
console.groupEnd = () => { group = Math.max(0, group - 1); };
console.clear = () => postMessage({ type: "clear" });
console.table = (data) => {
  if (!data || typeof data !== "object") return console.log(data);
  const rows = Object.entries(data);
  const cols = [];
  for (const [, r] of rows) if (r && typeof r === "object") for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k);
  const hasValues = rows.some(([, r]) => !r || typeof r !== "object");
  const head = ["(index)", ...cols, ...(hasValues ? ["Values"] : [])];
  const body = rows.map(([k, r]) => [k, ...cols.map((c) => r && typeof r === "object" && c in r ? fmt(r[c], 1, new Set(), true) : ""), ...(hasValues ? [r && typeof r === "object" ? "" : fmt(r, 1, new Set(), true)] : [])]);
  const w = head.map((h, i) => Math.max(h.length, ...body.map((b) => b[i].length)));
  const line = (l, m, r) => l + w.map((n) => "─".repeat(n + 2)).join(m) + r;
  const row = (cells) => "│" + cells.map((c, i) => " " + c.padEnd(w[i]) + " ").join("│") + "│";
  send("log", [line("┌", "┬", "┐"), row(head), line("├", "┼", "┤"), ...body.map(row), line("└", "┴", "┘")].join("\n"));
};

self.addEventListener("error", (e) => {
  e.preventDefault();
  send("error", e.error ? fmt(e.error, 0, new Set(), false) : "Uncaught " + e.message);
});
self.addEventListener("unhandledrejection", (e) => {
  e.preventDefault();
  send("error", "Uncaught (in promise) " + fmt(e.reason, 0, new Set(), false));
});

self.onmessage = async (e) => {
  if (e.data.type !== "run") return;
  const t0 = performance.now();
  try {
    await import(e.data.url);
    postMessage({ type: "done", ms: performance.now() - t0 });
  } catch (err) {
    send("error", fmt(err, 0, new Set(), false));
    postMessage({ type: "done", ms: performance.now() - t0, failed: true });
  }
};
`;
