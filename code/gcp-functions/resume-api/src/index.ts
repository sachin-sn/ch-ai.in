import * as functions from "@google-cloud/functions-framework";
import { Firestore } from "@google-cloud/firestore";
import { Storage } from "@google-cloud/storage";
import { resolveMx } from "node:dns/promises";

const db = new Firestore();
const storage = new Storage();

const RESUME_BUCKET = process.env.RESUME_BUCKET ?? "";
const RESUME_KEY = process.env.RESUME_KEY ?? "";
const FIRESTORE_COLLECTION = process.env.FIRESTORE_COLLECTION ?? "resume-requests";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY ?? "";

// Long enough to click a button, short enough that a leaked/shared link is
// worthless within the hour. Same value as the AWS version.
const SIGNED_URL_TTL_SECONDS = 600;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Must match the `action` option passed to turnstile.render() in
// ResumeRequestForm.tsx. Verifying it server-side means a token minted for
// some other Turnstile integration (if this secret key were ever reused
// elsewhere) can't be replayed against this endpoint.
const TURNSTILE_ACTION = "resume-request";
// Cloudflare's own recommended defense-in-depth check: confirms the token
// was actually issued on this site, not a stolen/misrouted one.
const TURNSTILE_ALLOWED_HOSTNAME = "ch-ai.in";

async function verifyTurnstile(token: string, remoteIp: string | undefined): Promise<boolean> {
  // Cheap checks before spending a network call on Cloudflare -- also
  // guards the URLSearchParams call below against a non-string value.
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return false;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      // Fails fast well inside the function's own timeout, rather than
      // leaving the request hanging if Cloudflare is slow to respond.
      signal: AbortSignal.timeout(8_000),
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
      "error-codes"?: string[];
    };
    const ok =
      data.success === true &&
      data.action === TURNSTILE_ACTION &&
      data.hostname === TURNSTILE_ALLOWED_HOSTNAME;
    if (!ok) {
      // None of these fields are secret -- siteverify never echoes back the
      // secret key -- so this is safe to log as-is. Exists specifically to
      // tell apart "wrong secret key" (error-codes: invalid-input-secret),
      // "token already used" (timeout-or-duplicate), and a hostname/action
      // mismatch, which otherwise all collapse into the same generic
      // 400 the client sees.
      console.warn("turnstile verification rejected", {
        success: data.success,
        action: data.action,
        hostname: data.hostname,
        errorCodes: data["error-codes"],
      });
    }
    return ok;
  } catch (err) {
    // Cloudflare being unreachable (including our own timeout above) should
    // fail CLOSED (reject the submission), not silently skip verification.
    console.error("turnstile verification request failed", err);
    return false;
  }
}

async function hasMxRecord(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    // A DNS hiccup or an unusual TLD shouldn't hard-block a real person --
    // this is a soft signal stored alongside the record, not a gate.
    return true;
  }
}

// Registered under the entry point name the CDKTF google_cloudfunctions2_function
// resource references (infra-gcp/resume-api.ts's buildConfig.entryPoint).
//
// Security note vs. the AWS version: the Lambda behind CloudFront checked a
// CloudFront-injected X-Origin-Verify header, because Lambda Function URLs
// have no equivalent of S3's origin-access-control. Firebase Hosting
// rewrites don't support injecting a custom header into the proxied
// request, so there's no equivalent trick here -- this function has to
// allow unauthenticated invocation for the Hosting rewrite to reach it at
// all, which makes its own Cloud Run URL just as reachable directly. In
// practice that's fine: Turnstile + the honeypot field below are the real
// gate either way, exactly like on AWS -- this is just an honest case
// where the AWS setup had one more (mostly cosmetic) layer.
functions.http("resumeRequest", async (req: functions.Request, res: functions.Response) => {
  res.set("cache-control", "no-store");

  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  // functions-framework parses a JSON body into req.body automatically when
  // content-type is application/json; an unparsable body lands here as {}.
  const payload = (req.body ?? {}) as Record<string, unknown>;

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  // Hidden form field real users never fill in -- see ResumeRequestForm.tsx.
  const honeypot = typeof payload.company === "string" ? payload.company.trim() : "";
  const turnstileToken = typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";

  const sourceIp = req.ip ?? "unknown";
  // CloudFront injected a viewer-country header on AWS; there's no
  // confirmed Firebase Hosting / Cloud Functions equivalent, so this is
  // left "unknown" rather than guessing at a header that may not be set.
  const country = "unknown";

  // Bots that fill out every field (including hidden ones) get a
  // convincing-looking success response with no real URL behind it, rather
  // than an error that would teach them to leave the field blank.
  if (honeypot) {
    res.status(200).json({ url: null, message: "Thanks — check your submission." });
    return;
  }

  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }

  const captchaOk = await verifyTurnstile(turnstileToken, sourceIp);
  if (!captchaOk) {
    res.status(400).json({ error: "Captcha verification failed — please try again." });
    return;
  }

  const mxVerified = await hasMxRecord(email);
  const requestedAt = new Date().toISOString();

  try {
    await db.collection(FIRESTORE_COLLECTION).add({
      email,
      requestedAt,
      ip: sourceIp,
      country,
      mxVerified,
    });
  } catch (err) {
    // Telemetry is nice-to-have; a logging failure should never be the
    // reason a real visitor doesn't get their resume.
    console.error("failed to write telemetry row", err);
  }

  try {
    const [url] = await storage
      .bucket(RESUME_BUCKET)
      .file(RESUME_KEY)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
      });

    res.status(200).json({ url, expiresInSeconds: SIGNED_URL_TTL_SECONDS });
  } catch (err) {
    console.error("failed to sign resume URL", err);
    res.status(502).json({ error: "Could not prepare the download link. Please try again." });
  }
});
