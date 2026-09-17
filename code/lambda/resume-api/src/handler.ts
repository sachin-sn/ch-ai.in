import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { resolveMx } from "node:dns/promises";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

const TABLE_NAME = process.env.TABLE_NAME ?? "";
const RESUME_BUCKET = process.env.RESUME_BUCKET ?? "";
const RESUME_KEY = process.env.RESUME_KEY ?? "";
const ORIGIN_VERIFY_SECRET = process.env.ORIGIN_VERIFY_SECRET ?? "";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY ?? "";

// Long enough to click a button, short enough that a leaked/shared link is
// worthless within the hour.
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

function json(
  statusCode: number,
  body: unknown,
  extraHeaders: Record<string, string> = {}
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extraHeaders },
    body: JSON.stringify(body),
  };
}

function header(event: APIGatewayProxyEventV2, name: string): string | undefined {
  // API Gateway v2 / Lambda Function URL events lower-case header keys, but
  // don't rely on that being universal across every path CloudFront might
  // take -- check case-insensitively.
  const target = name.toLowerCase();
  const headers = event.headers ?? {};
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === target) return headers[key];
  }
  return undefined;
}

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
      // Fails fast well inside the Lambda's own 10s timeout, rather than
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
    };
    return (
      data.success === true &&
      data.action === TURNSTILE_ACTION &&
      data.hostname === TURNSTILE_ALLOWED_HOSTNAME
    );
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

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  // Reject anything that didn't come through CloudFront with the shared
  // secret it injects on this one origin. Lambda Function URLs have no
  // equivalent of S3's origin-access-control, so this header is what
  // actually keeps the endpoint from being hit directly.
  if (!ORIGIN_VERIFY_SECRET || header(event, "x-origin-verify") !== ORIGIN_VERIFY_SECRET) {
    return json(403, { error: "forbidden" });
  }

  if (event.requestContext?.http?.method !== "POST") {
    return json(405, { error: "method not allowed" });
  }

  let payload: Record<string, unknown>;
  try {
    const rawBody =
      event.isBase64Encoded && event.body
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body ?? "{}";
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  // Hidden form field real users never fill in -- see ResumeRequestForm.tsx.
  const honeypot = typeof payload.company === "string" ? payload.company.trim() : "";
  const turnstileToken = typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";

  const sourceIp = event.requestContext?.http?.sourceIp ?? "unknown";
  const country = header(event, "cloudfront-viewer-country") ?? "unknown";

  // Bots that fill out every field (including hidden ones) get a
  // convincing-looking success response with no real URL behind it, rather
  // than an error that would teach them to leave the field blank.
  if (honeypot) {
    return json(200, { url: null, message: "Thanks — check your submission." });
  }

  if (!EMAIL_RE.test(email)) {
    return json(400, { error: "Enter a valid email address." });
  }

  const captchaOk = await verifyTurnstile(turnstileToken, sourceIp);
  if (!captchaOk) {
    return json(400, { error: "Captcha verification failed — please try again." });
  }

  const mxVerified = await hasMxRecord(email);
  const requestedAt = new Date().toISOString();

  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id: randomUUID(),
          email,
          requestedAt,
          ip: sourceIp,
          country,
          mxVerified,
        },
      })
    );
  } catch (err) {
    // Telemetry is nice-to-have; a logging failure should never be the
    // reason a real visitor doesn't get their resume.
    console.error("failed to write telemetry row", err);
  }

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: RESUME_BUCKET, Key: RESUME_KEY }),
    { expiresIn: SIGNED_URL_TTL_SECONDS }
  );

  return json(200, { url, expiresInSeconds: SIGNED_URL_TTL_SECONDS });
};
