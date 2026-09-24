import * as functions from "@google-cloud/functions-framework";
import { Firestore, FieldValue } from "@google-cloud/firestore";

const db = new Firestore();

const FIRESTORE_COLLECTION = process.env.FIRESTORE_COLLECTION ?? "visits";

// One doc per counter: `site` for the whole-site total (the footer), and
// `blog-<slug>` reserved for per-post read counts later. Keys are
// validated against this pattern so a caller can't mint arbitrary doc IDs
// (Firestore IDs can't contain "/", and "__.*__" is reserved).
const SITE_KEY = "site";
const PAGE_KEY_RE = /^blog-[a-z0-9-]{1,100}$/;

// Crawlers that execute JS (Googlebot, Lighthouse, headless Chrome) would
// otherwise POST on every render. They still get the count back -- they
// just don't bump it. Not a security control (the UA is caller-supplied),
// just keeps the honest-bot noise out.
const BOT_UA_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly/i;

// Same idea as the UA check: a cheap filter against casual scripted
// inflation, not a real defense (curl can set any Origin). This is a
// vanity counter, so "good enough to keep honest" is the bar -- see
// README.md.
const ALLOWED_ORIGINS = new Set(["https://ch-ai.in", "https://www.ch-ai.in"]);

async function readCount(key: string): Promise<number> {
  const snap = await db.collection(FIRESTORE_COLLECTION).doc(key).get();
  const count = snap.exists ? snap.get("count") : 0;
  return typeof count === "number" ? count : 0;
}

async function increment(key: string): Promise<void> {
  // set+merge so the first visit creates the doc -- update() would throw
  // NOT_FOUND on a fresh counter. increment() is atomic server-side, so
  // concurrent visits never lose a count.
  await db
    .collection(FIRESTORE_COLLECTION)
    .doc(key)
    .set({ count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

functions.http("visit", async (req: functions.Request, res: functions.Response) => {
  if (req.method !== "GET" && req.method !== "POST") {
    res.set("cache-control", "no-store");
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const rawPage = req.method === "POST" ? req.body?.page : req.query.page;
  const page = typeof rawPage === "string" && PAGE_KEY_RE.test(rawPage) ? rawPage : undefined;

  try {
    if (req.method === "POST") {
      // Never let the Firebase Hosting CDN cache a write.
      res.set("cache-control", "no-store");

      const origin = req.get("origin");
      const userAgent = req.get("user-agent") ?? "";
      const countable = (!origin || ALLOWED_ORIGINS.has(origin)) && !BOT_UA_RE.test(userAgent);

      if (countable) {
        await Promise.all([increment(SITE_KEY), ...(page ? [increment(page)] : [])]);
      }
    } else {
      // Reads are safe to cache briefly at the edge -- repeat-session
      // visitors in the same minute share one Firestore read.
      res.set("cache-control", "public, max-age=60, s-maxage=60");
    }

    const [site, pageCount] = await Promise.all([
      readCount(SITE_KEY),
      page ? readCount(page) : Promise.resolve(undefined),
    ]);

    res.status(200).json(page ? { site, page: pageCount } : { site });
  } catch (err) {
    console.error("visit counter failed", err);
    res.set("cache-control", "no-store");
    // The footer hides itself on any non-2xx, so a Firestore hiccup is
    // invisible to visitors.
    res.status(502).json({ error: "counter unavailable" });
  }
});
