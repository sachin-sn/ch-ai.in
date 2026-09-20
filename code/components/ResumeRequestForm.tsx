"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import Reveal from "@/components/Reveal";

// Cloudflare Turnstile's implicit-render API attaches itself to
// window.turnstile once its script loads. Minimal typing for the two
// calls this component makes -- see https://developers.cloudflare.com/turnstile/.
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

type Status = "idle" | "submitting" | "success" | "error";

// Public by design -- Turnstile's site key is meant to ship in client code;
// the secret key that actually verifies tokens lives only in the resume-api
// function's environment (see ../gcp-functions/resume-api; the original
// AWS Lambda at ../lambda/resume-api still has its own copy too). Baked
// in at build time by Next
// (NEXT_PUBLIC_ vars are inlined into the static export) -- set as a
// GitHub Actions repo variable, see DEPLOYMENT.md.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

// Same-origin via a Firebase Hosting rewrite (see firebase.json and
// infra-gcp/resume-api.ts) -- no CORS to configure, this is just a
// normal relative fetch. (Ran through a CloudFront custom origin to the
// same effect before the GCP migration -- see ../lambda/resume-api.)
const REQUEST_ENDPOINT = "/api/resume/request";

export default function ResumeRequestForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string>("");

  const renderTurnstile = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current || !window.turnstile) return;
    if (widgetIdRef.current) return; // already rendered once
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "auto",
      // Must match TURNSTILE_ACTION in ../gcp-functions/resume-api/src/index.ts --
      // the function verifies this server-side so a token minted for some
      // other Turnstile integration can't be replayed against this endpoint.
      action: "resume-request",
      callback: (token: string) => {
        tokenRef.current = token;
      },
      "expired-callback": () => {
        tokenRef.current = "";
      },
    });
  }, []);

  useEffect(() => {
    // Covers client-side navigation back to this page after the script has
    // already loaded once -- next/script's onLoad only fires on first load.
    if (window.turnstile) renderTurnstile();
  }, [renderTurnstile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const honeypot =
      (event.currentTarget.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "";

    if (TURNSTILE_SITE_KEY && !tokenRef.current) {
      setStatus("error");
      setErrorMessage("Please complete the captcha.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(REQUEST_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, company: honeypot, turnstileToken: tokenRef.current }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string | null; error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      // A honeypot-triggered response has no url but still looks like a
      // success -- see handler.ts. Rendering it as success either way means
      // a bot learns nothing from the difference.
      setDownloadUrl(data.url ?? null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      // Turnstile tokens are single-use -- reset so a retry can get a fresh one.
      if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
      tokenRef.current = "";
    }
  }

  return (
    <Reveal>
      <div className="rounded-lg border border-surface-line bg-surface-panel p-6 sm:p-8">
        {TURNSTILE_SITE_KEY ? (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="afterInteractive"
            onLoad={renderTurnstile}
          />
        ) : null}

        {status === "success" ? (
          <div className="space-y-4">
            <p className="font-display text-lg font-bold text-ink">You&rsquo;re set.</p>
            {downloadUrl ? (
              <>
                <p className="text-sm text-ink-dim">This link expires in 10 minutes — download it now.</p>
                <a
                  href={downloadUrl}
                  className="inline-block rounded-md bg-accent-bright px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-surface transition hover:opacity-90"
                >
                  Download resume
                </a>
              </>
            ) : (
              <p className="text-sm text-ink-dim">Thanks — check your submission.</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative space-y-4" noValidate>
            <div>
              <label
                htmlFor="resume-email"
                className="block font-mono text-xs uppercase tracking-wide text-ink-dim"
              >
                Email address
              </label>
              <input
                id="resume-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-2 w-full rounded-md border border-surface-line bg-surface px-4 py-2.5 text-ink outline-none placeholder:text-ink-dim/60 focus:border-accent-bright"
              />
            </div>

            {/* Honeypot: real visitors never see this field. Kept off-screen
                (not display:none, which some bots specifically skip when
                deciding what to fill in) rather than merely hidden. */}
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="resume-company">Company</label>
              <input id="resume-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {TURNSTILE_SITE_KEY ? <div ref={turnstileRef} /> : null}

            {status === "error" ? (
              <p className="text-sm text-red-400" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center gap-2 rounded-md bg-accent-bright px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-surface border-t-transparent"
                  />
                  Preparing your link
                </>
              ) : (
                "Get the resume"
              )}
            </button>
          </form>
        )}
      </div>
    </Reveal>
  );
}
