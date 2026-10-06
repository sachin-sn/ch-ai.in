import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBlueprints, getBlueprintBySlug, getDeck } from "@/lib/blueprints/designs";
import { DeckArrows, DeckBar, DeckPager, DeckProgress } from "@/components/blueprints/DeckNav";
import MermaidDiagrams from "@/components/blueprints/MermaidDiagrams";

// output: "export" -- one static page per design, known at build time.
export function generateStaticParams() {
  return getAllBlueprints().map((d) => ({ slug: d.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const design = getBlueprintBySlug(slug);
  if (!design) return {};
  return {
    title: `${design.title} — Blueprints — ch-ai.in`,
    description: design.topic || design.title,
    openGraph: {
      title: design.title,
      description: design.topic || design.title,
      url: `https://ch-ai.in/blueprints/${design.slug}`,
      type: "article",
    },
  };
}

export default async function BlueprintPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const design = getBlueprintBySlug(slug);
  if (!design) notFound();

  const deck = getDeck();
  const position = deck.findIndex((stop) => stop.href === `/blueprints/${slug}`);
  const bodyId = `blueprint-body-${design.slug}`;

  return (
    // key: moving between slides swaps the whole subtree, so the Mermaid
    // pass runs fresh on the new slide's HTML.
    <div className="deck-slide" key={design.slug} data-deck-href={`/blueprints/${design.slug}`}>
      <DeckArrows deck={deck} position={position} />

      <article className="mx-auto max-w-3xl px-6 py-12">
        <DeckProgress deck={deck} position={position} />

        <p className="mt-10 font-mono text-sm uppercase tracking-wide text-ink-dim">
          Blueprint {String(design.number).padStart(2, "0")}
          {design.diagramCount > 0 &&
            ` · ${design.diagramCount} diagram${design.diagramCount === 1 ? "" : "s"}`}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">{design.title}</h1>
        {design.topic && <p className="mt-3 text-lg text-ink-dim">{design.topic}</p>}

        {/* Built from the repo's own Markdown at build time (lib/blueprints). */}
        <div
          id={bodyId}
          className="blog-prose blueprint-prose mt-10"
          dangerouslySetInnerHTML={{ __html: design.html }}
        />
        <MermaidDiagrams containerId={bodyId} />

        <DeckPager deck={deck} position={position} />
      </article>

      <DeckBar deck={deck} position={position} />
    </div>
  );
}
