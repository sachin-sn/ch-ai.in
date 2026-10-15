"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSiteMode } from "@/components/interview/useSiteMode";
import "@/components/interview/interview-tools.css";

// draw.io (jgraph/drawio — the same editor drawio-desktop wraps in
// Electron) embedded via its official embed mode. The editor runs in an
// iframe from embed.diagrams.net and talks to this page over postMessage
// (proto=json): we send `load` with the board's XML, it sends back
// `autosave` events with updated XML, which we keep in localStorage.
// Diagrams never leave the browser — embed mode has no server-side storage.
// See https://www.drawio.com/doc/faq/embed-mode

const EMBED_ORIGIN = "https://embed.diagrams.net";
const STORAGE_KEY = "ch-ai-whiteboards";
const EMPTY_XML = '<mxfile><diagram name="Page-1"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>';

type Board = { id: string; name: string; xml: string; updatedAt: number };
type Store = { boards: Board[]; activeId: string };

const newId = () => Math.random().toString(36).slice(2, 10);

function defaultName() {
  const d = new Date();
  return `Interview ${d.toLocaleDateString(undefined, { day: "numeric", month: "short" })} ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
}

function loadStore(): Store {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Store;
      if (s.boards?.length) return s;
    }
  } catch {}
  const b = { id: newId(), name: defaultName(), xml: EMPTY_XML, updatedAt: Date.now() };
  return { boards: [b], activeId: b.id };
}

function saveStore(s: Store) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

function download(name: string, href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
}

const safeFile = (n: string) => n.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "whiteboard";

export default function Whiteboard() {
  const mode = useSiteMode();
  const [store, setStore] = useState<Store | null>(null);
  const [saved, setSaved] = useState<"saved" | "saving">("saved");
  const [renaming, setRenaming] = useState(false);
  // "loading" until draw.io's init handshake arrives; "stuck" if it never does.
  const [editorState, setEditorState] = useState<"loading" | "ready" | "stuck">("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const storeRef = useRef<Store | null>(null);
  const pendingExport = useRef<string | null>(null);

  useEffect(() => {
    const s = loadStore();
    storeRef.current = s;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from localStorage on mount, not a render loop
    setStore(s);
  }, []);

  const update = useCallback((fn: (s: Store) => Store) => {
    const next = fn(storeRef.current!);
    storeRef.current = next;
    saveStore(next);
    setStore(next);
  }, []);

  const active = store?.boards.find((b) => b.id === store.activeId) ?? store?.boards[0];

  const post = (msg: object) =>
    frameRef.current?.contentWindow?.postMessage(JSON.stringify(msg), EMBED_ORIGIN);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== EMBED_ORIGIN || e.source !== frameRef.current?.contentWindow) return;
      let msg: { event: string; xml?: string; data?: string; format?: string };
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      const s = storeRef.current;
      if (!s) return;
      const cur = s.boards.find((b) => b.id === s.activeId)!;
      if (msg.event === "init") {
        setEditorState("ready");
        post({ action: "load", xml: cur.xml, autosave: 1, title: cur.name });
      } else if ((msg.event === "autosave" || msg.event === "save") && msg.xml) {
        setSaved("saving");
        update((st) => ({
          ...st,
          boards: st.boards.map((b) =>
            b.id === st.activeId ? { ...b, xml: msg.xml!, updatedAt: Date.now() } : b,
          ),
        }));
        window.setTimeout(() => setSaved("saved"), 400);
      } else if (msg.event === "export" && msg.data) {
        const ext = pendingExport.current ?? msg.format ?? "png";
        pendingExport.current = null;
        download(`${safeFile(cur.name)}.${ext}`, msg.data);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [update]);

  // Iframe src depends on board + theme; changing either reloads the editor
  // with that board's saved XML (autosave has already persisted the old one).
  const src = `${EMBED_ORIGIN}/?embed=1&proto=json&spin=1&libraries=1&noSaveBtn=1&noExitBtn=1&saveAndExit=0&ui=${mode === "light" ? "kennedy" : "dark"}&dark=${mode === "light" ? 0 : 1}`;

  // If draw.io hasn't said hello within 20s, say so instead of leaving a
  // blank/greyed-out editor (e.g. network, ad blocker, or the server
  // refusing the request).
  const frameKey = `${active?.id}-${mode}-${reloadKey}`;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset per iframe (re)load, not a render loop
    setEditorState("loading");
    const t = window.setTimeout(
      () => setEditorState((s) => (s === "ready" ? s : "stuck")),
      20_000,
    );
    return () => window.clearTimeout(t);
  }, [frameKey]);

  const switchTo = (id: string) => update((s) => ({ ...s, activeId: id }));

  const createBoard = (name = defaultName(), xml = EMPTY_XML) => {
    const b = { id: newId(), name, xml, updatedAt: Date.now() };
    update((s) => ({ boards: [b, ...s.boards], activeId: b.id }));
  };

  const deleteBoard = () => {
    if (!active || !window.confirm(`Delete "${active.name}"? This can't be undone.`)) return;
    update((s) => {
      const boards = s.boards.filter((b) => b.id !== active.id);
      if (!boards.length) {
        const b = { id: newId(), name: defaultName(), xml: EMPTY_XML, updatedAt: Date.now() };
        return { boards: [b], activeId: b.id };
      }
      return { boards, activeId: boards[0].id };
    });
  };

  const rename = (name: string) => {
    const n = name.trim();
    if (n) update((s) => ({ ...s, boards: s.boards.map((b) => (b.id === s.activeId ? { ...b, name: n } : b)) }));
    setRenaming(false);
  };

  const exportAs = (format: "png" | "svg") => {
    pendingExport.current = format;
    post({ action: "export", format: format === "png" ? "png" : "svg", scale: 2, border: 10, background: "#ffffff" });
  };

  const downloadXml = () => {
    if (!active) return;
    const url = URL.createObjectURL(new Blob([active.xml], { type: "application/xml" }));
    download(`${safeFile(active.name)}.drawio`, url);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const openFile = async (f: File | undefined) => {
    if (!f) return;
    const xml = await f.text();
    createBoard(f.name.replace(/\.(drawio|xml)$/i, ""), xml);
    if (fileRef.current) fileRef.current.value = "";
  };

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen?.();
  };

  if (!store || !active) return <div className="itool"><div className="itool-loading">Loading…</div></div>;

  return (
    <div className="itool" ref={wrapRef}>
      <div className="itool-bar">
        <div className="itool-group">
          <span className="itool-title">Whiteboard</span>
          {renaming ? (
            <input
              className="itool-select"
              autoFocus
              defaultValue={active.name}
              onBlur={(e) => rename(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") rename(e.currentTarget.value);
                if (e.key === "Escape") setRenaming(false);
              }}
              aria-label="Board name"
            />
          ) : (
            <select
              className="itool-select"
              value={active.id}
              onChange={(e) => switchTo(e.target.value)}
              aria-label="Board"
            >
              {store.boards.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <button className="itool-btn itool-btn-primary" onClick={() => createBoard()}>+ New</button>
          <button className="itool-btn" onClick={() => setRenaming(true)}>Rename</button>
          <button className="itool-btn itool-btn-danger" onClick={deleteBoard}>Delete</button>
          <span className="itool-saved">{saved === "saving" ? "Saving…" : "Saved in this browser"}</span>
        </div>
        <div className="itool-group">
          <button className="itool-btn" onClick={() => fileRef.current?.click()}>Open .drawio</button>
          <input
            ref={fileRef}
            type="file"
            accept=".drawio,.xml"
            hidden
            onChange={(e) => openFile(e.target.files?.[0])}
          />
          <button className="itool-btn" onClick={downloadXml}>Download .drawio</button>
          <button className="itool-btn" onClick={() => exportAs("png")}>PNG</button>
          <button className="itool-btn" onClick={() => exportAs("svg")}>SVG</button>
          <button className="itool-btn" onClick={fullscreen} title="Fullscreen">⛶</button>
        </div>
      </div>
      <div className="itool-frame-wrap">
        <iframe
          key={frameKey}
          ref={frameRef}
          src={src}
          className="itool-frame"
          title="draw.io whiteboard"
          allow="clipboard-read; clipboard-write; fullscreen"
          // embed.diagrams.net answers 403 when the Referer is
          // http://localhost (seen in dev); the embed doesn't need it.
          referrerPolicy="no-referrer"
        />
        {editorState === "stuck" && (
          <div className="itool-overlay" role="alert">
            <p className="itool-overlay-title">draw.io didn&apos;t load</p>
            <p>
              The editor at embed.diagrams.net hasn&apos;t responded. Check your connection, or
              whether an ad blocker or network filter is blocking that site.
            </p>
            <button className="itool-btn itool-btn-primary" onClick={() => setReloadKey((k) => k + 1)}>
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
