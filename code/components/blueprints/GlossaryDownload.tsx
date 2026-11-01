"use client";

import { useEffect, useState } from "react";

const PDF_URL = "/downloads/Tech-Interview-Terminology-Glossary.pdf";
const COUNTER = "glossary";

// Open (no email) PDF download with a public counter. The count lives in
// gcp-functions/visit-api (`download-glossary`); it is shown only once it
// loads, and the download works either way, including under `next dev` and
// on hosts without the API.
export default function GlossaryDownload() {
  const [downloads, setDownloads] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/visit?download=${COUNTER}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { downloads?: unknown } | null) => {
        if (typeof data?.downloads === "number") setDownloads(data.downloads);
      })
      .catch(() => {
        /* offline, aborted or no API -- stay hidden */
      });
    return () => controller.abort();
  }, []);

  function countDownload() {
    // keepalive lets the request finish while the browser starts the file save.
    fetch("/api/visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ download: COUNTER }),
      keepalive: true,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { downloads?: unknown } | null) => {
        if (typeof data?.downloads === "number") setDownloads(data.downloads);
      })
      .catch(() => {
        /* the file still downloads */
      });
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-ink-dim/30 p-4">
      <a
        href={PDF_URL}
        download
        onClick={countDownload}
        className="inline-flex items-center gap-2 rounded-md bg-accent-bright px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-surface no-underline transition hover:opacity-90"
      >
        Download PDF
      </a>
      <span className="text-sm text-ink-dim">Printable book, A4, 47 chapters</span>
      {downloads !== null && (
        <span
          className="font-mono text-xs text-ink-dim"
          aria-label={`${downloads.toLocaleString()} downloads`}
        >
          <span className="tabular-nums">{downloads.toLocaleString()}</span> downloads
        </span>
      )}
    </div>
  );
}
