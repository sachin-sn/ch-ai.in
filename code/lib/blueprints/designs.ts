import fs from "node:fs";
import path from "node:path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

// Blueprints: system design interview write-ups, one Markdown file per
// design in content/blueprints/, rendered at build time exactly like the
// blog (lib/blog/posts.ts) -- no Markdown parser ships to the browser.
//
// File naming carries the deck order: "00-index.md" is the landing page,
// "NN-some-slug.md" are the slides, in NN order. The URL slug is the
// filename minus the "NN-" prefix, so reordering the deck (renumbering
// files) never breaks a shared link.

const BLUEPRINTS_DIR = path.join(process.cwd(), "content", "blueprints");
const INDEX_FILE = "00-index.md";
const FILE_PATTERN = /^(\d{2})-(.+)\.md$/;

// Short labels for the pager / nav arrows, where the full H1 ("Design an
// Elastic System That Scales up to 5 Million Requests Without Breaking")
// is too long. A design without an entry here falls back to its H1 with
// the leading "Design a/an" trimmed off.
const SHORT_TITLES: Record<string, string> = {
  "chat-service-whatsapp": "Real-Time Chat (WhatsApp)",
  "video-streaming-youtube": "Video Streaming (YouTube)",
  "low-latency-distributed-systems": "Low-Latency Systems",
  "ordered-message-queues": "Ordered Message Queues",
  "url-shortener": "URL Shortener",
  "rate-limiter": "Rate Limiter",
  "notification-system": "Notification System",
  "news-feed": "News Feed",
  "offline-messaging": "Offline Messaging",
  "circuit-breaker": "Circuit Breaker",
  "self-healing-infrastructure": "Self-Healing Infrastructure",
  "scaling-5-million-users": "Scaling to 5M Users",
  "handling-5-million-requests": "Handling 5M Requests",
  "end-to-end-encryption": "End-to-End Encryption",
  "realtime-react-dashboard": "Real-Time React Dashboard",
  "data-transfer-fast-to-slow-server": "Fast-to-Slow File Transfer",
  "ride-hailing-uber": "Ride-Hailing (Uber, Ola)",
  "ticket-booking-bookmyshow": "Ticket Booking (BookMyShow)",
  "unique-id-generator": "Unique ID Generator",
};

// Sections of 00-index.md that are notes for the author, not for readers
// (or that the landing page replaces with its own UI).
const HIDDEN_INDEX_SECTIONS = ["writing standard", "architecture files"];

export type BlueprintSummary = {
  slug: string;
  /** 1-based position in the deck, from the filename's NN prefix. */
  number: number;
  /** Full title, from the file's H1. */
  title: string;
  /** Short label for arrows and the pager. */
  shortTitle: string;
  /** One-line "what's inside", from the Topic column of 00-index.md. */
  topic: string;
  diagramCount: number;
};

export type Blueprint = BlueprintSummary & { html: string };

export type BlueprintIndex = {
  title: string;
  /** Rendered HTML for the intro and the reader-facing sections. */
  introHtml: string;
  sectionsHtml: string;
};

function render(markdown: string): string {
  // sanitize: false -- same trust model as the blog: self-authored files
  // in the repo, not user input.
  return remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .processSync(markdown)
    .toString();
}

function readFile(file: string): string {
  return fs.readFileSync(path.join(BLUEPRINTS_DIR, file), "utf8");
}

function splitTitle(markdown: string): { title: string; body: string } {
  const match = markdown.match(/^#\s+(.+)\s*\n/);
  if (!match) return { title: "", body: markdown };
  return { title: match[1].trim(), body: markdown.slice(match[0].length) };
}

/** filename -> Topic column of the index table. */
function readTopics(): Record<string, string> {
  if (!fs.existsSync(path.join(BLUEPRINTS_DIR, INDEX_FILE))) return {};
  const topics: Record<string, string> = {};
  for (const line of readFile(INDEX_FILE).split("\n")) {
    const row = line.match(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*(.+?)\s*\|\s*$/);
    if (row) topics[row[1]] = row[2];
  }
  return topics;
}

function fallbackShortTitle(title: string): string {
  return title.replace(/^(Design (an?|the)?\s*|How\s+)/i, "").trim();
}

let cache: { file: string; summary: BlueprintSummary }[] | null = null;

function readAll(): { file: string; summary: BlueprintSummary }[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  if (!fs.existsSync(BLUEPRINTS_DIR)) return [];
  const topics = readTopics();
  cache = fs
    .readdirSync(BLUEPRINTS_DIR)
    .filter((file) => file !== INDEX_FILE && FILE_PATTERN.test(file))
    .sort()
    .map((file) => {
      const [, num, slug] = file.match(FILE_PATTERN)!;
      const raw = readFile(file);
      const { title } = splitTitle(raw);
      return {
        file,
        summary: {
          slug,
          number: Number(num),
          title,
          shortTitle: SHORT_TITLES[slug] ?? fallbackShortTitle(title),
          topic: topics[file] ?? "",
          diagramCount: (raw.match(/^```mermaid\s*$/gm) ?? []).length,
        },
      };
    });
  return cache;
}

/** Every design, in deck order. */
export function getAllBlueprints(): BlueprintSummary[] {
  return readAll().map((entry) => entry.summary);
}

export function getBlueprintBySlug(slug: string): Blueprint | undefined {
  const entry = readAll().find((e) => e.summary.slug === slug);
  if (!entry) return undefined;
  const { body } = splitTitle(readFile(entry.file));
  return { ...entry.summary, html: render(body) };
}

/** The landing page: 00-index.md minus the author-only sections. */
export function getBlueprintIndex(): BlueprintIndex {
  const { title, body } = splitTitle(readFile(INDEX_FILE));
  const [intro, ...sections] = body.split(/^(?=## )/m);
  const visible = sections
    .filter((section) => {
      const heading = section.match(/^##\s+(.+)/)?.[1]?.trim().toLowerCase() ?? "";
      return !HIDDEN_INDEX_SECTIONS.includes(heading);
    })
    // The trailing "diagrams use Mermaid syntax" note is advice for
    // reading the raw files; on the site every diagram is already drawn.
    .map((section) => section.replace(/^>\s*\*\*Note:\*\*.*Mermaid.*$/gm, ""));
  return {
    title,
    introHtml: render(intro),
    sectionsHtml: render(visible.join("\n")),
  };
}

/** One stop in the slide deck: the index is stop 0, designs follow. */
export type DeckStop = {
  href: string;
  /** null for the index. */
  number: number | null;
  shortTitle: string;
  topic: string;
};

export const BLUEPRINTS_HREF = "/blueprints";

/** The whole deck, index first. Drives the arrows, pager and progress dots. */
export function getDeck(): DeckStop[] {
  const designs = getAllBlueprints();
  return [
    {
      href: BLUEPRINTS_HREF,
      number: null,
      shortTitle: "All blueprints",
      topic: `All ${designs.length} designs and the interview answer method`,
    },
    ...designs.map((d) => ({
      href: `${BLUEPRINTS_HREF}/${d.slug}`,
      number: d.number,
      shortTitle: d.shortTitle,
      topic: d.topic,
    })),
  ];
}
