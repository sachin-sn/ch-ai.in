import Link from "next/link";
import type { Metadata } from "next";
import { getAllBlueprints, getBlueprintIndex, getDeck } from "@/lib/blueprints/designs";
import { DeckArrows, DeckBar } from "@/components/blueprints/DeckNav";

export const metadata: Metadata = {
  title: "Blueprints — ch-ai.in",
  description:
    "System design interview answers, one slide at a time: chat, video streaming, rate limiting, queues, encryption and more — with diagrams.",
};

export default function BlueprintsIndexPage() {
  const designs = getAllBlueprints();
  const index = getBlueprintIndex();
  const deck = getDeck();

  return (
    <div className="deck-slide" data-deck-href="/blueprints">
      <DeckArrows deck={deck} position={0} />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-sm uppercase tracking-wide text-ink-dim">
          Blueprints · {designs.length} designs
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">
          System design, one slide at a time
        </h1>
        <div
          className="blog-prose mt-6 text-ink-dim"
          dangerouslySetInnerHTML={{ __html: index.introHtml }}
        />

        {designs[0] && (
          <Link
            href={`/blueprints/${designs[0].slug}`}
            className="deck-start mt-8"
          >
            Start with {designs[0].shortTitle} <span aria-hidden="true">&rarr;</span>
          </Link>
        )}

        <ol className="blueprint-grid mt-12">
          {designs.map((d) => (
            <li key={d.slug}>
              <Link href={`/blueprints/${d.slug}`} className="blueprint-card">
                <span className="blueprint-card-num">
                  {String(d.number).padStart(2, "0")}
                </span>
                <span className="blueprint-card-body">
                  <span className="blueprint-card-title">{d.title}</span>
                  {d.topic && <span className="blueprint-card-topic">{d.topic}</span>}
                  {d.diagramCount > 0 && (
                    <span className="blueprint-card-meta">
                      {d.diagramCount} diagram{d.diagramCount === 1 ? "" : "s"}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div
          className="blog-prose mt-16"
          dangerouslySetInnerHTML={{ __html: index.sectionsHtml }}
        />
      </div>

      <DeckBar deck={deck} position={0} />
    </div>
  );
}
