"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { loader, type Monaco, type OnMount } from "@monaco-editor/react";
import { WORKER_SOURCE } from "@/lib/playground/worker-source";
import { findPackages, rewriteImports } from "@/lib/playground/imports";
import { acquireTypes, type TypeStatus } from "@/lib/playground/types";
import { useSiteMode } from "@/components/interview/useSiteMode";
import "@/components/interview/interview-tools.css";

type Lang = "javascript" | "typescript";
type Line = { level: string; text: string };
type Status = "idle" | "running" | "done" | "error" | "stopped" | "timeout";

// Monaco itself loads from jsDelivr at runtime (keeps it out of the JS
// bundle). Pinned so an upstream release can't change behaviour silently.
loader.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" } });

const STORAGE_KEY = "ch-ai-playground";
const TIMEOUT_MS = 10_000;

const SAMPLES: Record<Lang, string> = {
  javascript: `// Ctrl/Cmd + Enter to run. Import any npm package — it loads from esm.sh.
import _ from "lodash";
import { format } from "date-fns";

function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return null;
}

console.log("twoSum:", twoSum([2, 7, 11, 15], 9));
console.log(_.chunk([1, 2, 3, 4, 5, 6, 7], 3));
console.table([{ lang: "js", year: 1995 }, { lang: "ts", year: 2012 }]);
console.log("today:", format(new Date(), "EEE, d MMM yyyy"));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(300);
console.log("top-level await works too");
`,
  typescript: `// Ctrl/Cmd + Enter to run. TypeScript is type-checked in the editor
// and transpiled in the browser before running.
import { z } from "zod";

type Interval = [start: number, end: number];

function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const out: Interval[] = [];
  for (const [s, e] of sorted) {
    const last = out.at(-1);
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else out.push([s, e]);
  }
  return out;
}

console.log(mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]));

const User = z.object({ name: z.string(), age: z.number().int().positive() });
console.log(User.safeParse({ name: "Ada", age: 36 }).success);
console.log(User.safeParse({ name: "Bob", age: -1 }).error?.issues[0].message);
`,
};

function encode(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

function loadSaved(): { lang: Lang; code: Record<Lang, string> } {
  const fallback = { lang: "javascript" as Lang, code: { ...SAMPLES } };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch {}
  return fallback;
}

export default function Playground() {
  const mode = useSiteMode();
  const [lang, setLang] = useState<Lang>("javascript");
  const [code, setCode] = useState<Record<Lang, string>>(SAMPLES);
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [types, setTypes] = useState<Record<string, TypeStatus>>({});
  const [copied, setCopied] = useState(false);

  const monacoRef = useRef<Monaco | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<number | null>(null);
  const urlsRef = useRef<string[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<() => void>(() => {});

  // Restore: a shared #code= link wins over what's saved locally.
  useEffect(() => {
    const saved = loadSaved();
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const shared = hash.get("code");
    if (shared) {
      try {
        const l = (hash.get("lang") === "typescript" ? "typescript" : "javascript") as Lang;
        saved.lang = l;
        saved.code = { ...saved.code, [l]: decode(shared) };
      } catch {}
      history.replaceState(null, "", window.location.pathname);
    }
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from localStorage / share link on mount, not a render loop */
    setLang(saved.lang);
    setCode(saved.code);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang, code }));
    } catch {}
  }, [lang, code, ready]);

  // Fetch typings for whatever packages the code imports (debounced).
  const current = code[lang];
  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;
    const t = window.setTimeout(() => {
      const pkgs = findPackages(current);
      if (pkgs.length) acquireTypes(monaco, pkgs, setTypes);
      else setTypes({});
    }, 600);
    return () => window.clearTimeout(t);
  }, [current]);

  useEffect(() => {
    consoleRef.current?.scrollTo({ top: consoleRef.current.scrollHeight });
  }, [lines]);

  const cleanup = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    urlsRef.current.forEach(URL.revokeObjectURL);
    urlsRef.current = [];
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const stop = useCallback(() => {
    if (!workerRef.current) return;
    cleanup();
    setStatus("stopped");
    setLines((l) => [...l, { level: "system", text: "■ Stopped" }]);
  }, [cleanup]);

  const run = useCallback(async () => {
    cleanup();
    setLines([]);
    setElapsed(null);
    setStatus("running");

    let js = code[lang];
    const monaco = monacoRef.current;
    if (lang === "typescript" && monaco) {
      try {
        const model = monaco.editor.getModels().find((m: { uri: { path: string } }) => m.uri.path === "/main.ts");
        const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
        const ts = await getWorker(model!.uri);
        const out = await ts.getEmitOutput(model!.uri.toString());
        js = out.outputFiles[0]?.text ?? js;
      } catch (e) {
        setLines([{ level: "error", text: `TypeScript transpile failed: ${String(e)}` }]);
        setStatus("error");
        return;
      }
    }

    const userUrl = URL.createObjectURL(
      new Blob([rewriteImports(js)], { type: "text/javascript" }),
    );
    const workerUrl = URL.createObjectURL(
      new Blob([WORKER_SOURCE], { type: "text/javascript" }),
    );
    urlsRef.current.push(userUrl, workerUrl);

    const worker = new Worker(workerUrl, { type: "module" });
    workerRef.current = worker;
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "log") {
        // Stack frames point at the code's blob: URL; show "main.js:line:col".
        const text = (msg.text as string).replace(/blob:[^\s)]+?:(\d+):(\d+)/g, `main.${lang === "typescript" ? "ts" : "js"}:$1:$2`);
        setLines((l) => [...l, { level: msg.level, text }]);
      }
      else if (msg.type === "clear") setLines([]);
      else if (msg.type === "done") {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = null;
        setElapsed(msg.ms);
        setStatus(msg.failed ? "error" : "done");
        // The worker stays alive so pending timers/promises can still log.
      }
    };
    worker.onerror = (e) => {
      setLines((l) => [...l, { level: "error", text: e.message || "Worker error" }]);
      setStatus("error");
    };
    timerRef.current = window.setTimeout(() => {
      cleanup();
      setStatus("timeout");
      setLines((l) => [
        ...l,
        { level: "error", text: `⏱ Stopped after ${TIMEOUT_MS / 1000}s — infinite loop?` },
      ]);
    }, TIMEOUT_MS);
    worker.postMessage({ type: "run", url: userUrl });
  }, [cleanup, code, lang]);

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  const beforeMount = (monaco: Monaco) => {
    const ts = monaco.languages.typescript;
    const opts = {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      allowJs: true,
      allowNonTsExtensions: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      noEmit: false,
      lib: ["esnext", "webworker"],
    };
    ts.typescriptDefaults.setCompilerOptions(opts);
    ts.javascriptDefaults.setCompilerOptions({ ...opts, checkJs: false, strict: false });
    // JS: completions + syntax errors, but no red squiggles for loose JS.
    ts.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true });
    ts.typescriptDefaults.setDiagnosticsOptions({
      // 1375/1378: top-level await "only allowed when module is es2022"
      diagnosticCodesToIgnore: [1375, 1378],
    });
    ts.typescriptDefaults.setEagerModelSync(true);
    ts.javascriptDefaults.setEagerModelSync(true);
  };

  const onMount: OnMount = (editor, monaco) => {
    monacoRef.current = monaco;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
    const pkgs = findPackages(editor.getValue());
    if (pkgs.length) acquireTypes(monaco, pkgs, setTypes);
  };

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#lang=${lang}&code=${encode(code[lang])}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  const reset = () => setCode((c) => ({ ...c, [lang]: SAMPLES[lang] }));
  const blank = () => setCode((c) => ({ ...c, [lang]: "" }));

  const statusText: Record<Status, string> = {
    idle: "ready",
    running: "running…",
    done: `done${elapsed !== null ? ` in ${elapsed.toFixed(1)} ms` : ""}`,
    error: "finished with errors",
    stopped: "stopped",
    timeout: "timed out",
  };

  return (
    <div className="itool">
      <div className="itool-bar">
        <div className="itool-group">
          <span className="itool-title">Playground</span>
          <select
            className="itool-select"
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            aria-label="Language"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
          </select>
          {status === "running" ? (
            <button className="itool-btn itool-btn-danger" onClick={stop}>
              ■ Stop
            </button>
          ) : (
            <button className="itool-btn itool-btn-primary" onClick={run} title="Ctrl/Cmd + Enter">
              ▶ Run
            </button>
          )}
          <button className="itool-btn" onClick={() => setLines([])}>Clear output</button>
        </div>
        <div className="itool-group">
          <button className="itool-btn" onClick={blank}>Blank</button>
          <button className="itool-btn" onClick={reset}>Sample</button>
          <button className="itool-btn" onClick={share} title="Copy a link containing this code">
            {copied ? "Link copied ✓" : "Share link"}
          </button>
        </div>
      </div>

      <div className="itool-split">
        <div className="itool-editor">
          {ready && (
            <Editor
              key={lang}
              path={lang === "typescript" ? "file:///main.ts" : "file:///main.js"}
              language={lang}
              value={code[lang]}
              onChange={(v) => setCode((c) => ({ ...c, [lang]: v ?? "" }))}
              theme={mode === "light" ? "vs" : "vs-dark"}
              beforeMount={beforeMount}
              onMount={onMount}
              loading={<div className="itool-loading">Loading editor…</div>}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 2,
                automaticLayout: true,
                fixedOverflowWidgets: true,
                padding: { top: 12 },
              }}
            />
          )}
        </div>

        <div className="itool-console">
          <div className="itool-console-head">
            <span>Console</span>
            <span className={`itool-status itool-status-${status}`}>{statusText[status]}</span>
          </div>
          {Object.keys(types).length > 0 && (
            <div className="itool-pkgs">
              {Object.entries(types).map(([p, s]) => (
                <span key={p} className={`itool-pkg itool-pkg-${s}`} title={
                  s === "ready" ? "Types loaded — IntelliSense available"
                    : s === "loading" ? "Loading types…" : "No type definitions found (still runs)"
                }>
                  {p}
                </span>
              ))}
            </div>
          )}
          <div className="itool-output" ref={consoleRef}>
            {lines.length === 0 ? (
              <p className="itool-empty">
                Output appears here. Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> to run.
              </p>
            ) : (
              lines.map((l, i) => (
                <pre key={i} className={`itool-line itool-line-${l.level}`}>{l.text}</pre>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
