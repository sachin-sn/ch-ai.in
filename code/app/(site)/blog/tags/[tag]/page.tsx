import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/blog/posts";
import BlogIndex from "@/components/blog/BlogIndex";

// output: "export" means every tag path has to be known at build time --
// same generateStaticParams pattern as post slugs and the showcase app
// registry.
export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `Posts tagged "${decoded}" — ch-ai.in`,
    description: `Writing tagged "${decoded}".`,
  };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);
  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 font-mono text-sm text-ink-dim transition hover:text-accent-bright"
      >
        <span aria-hidden="true">&larr;</span> Back to Writing
      </Link>

      <p className="mt-8 font-mono text-sm text-ink-dim">Tagged</p>
      <h1 className="mt-1 font-display text-4xl font-bold text-ink">{decoded}</h1>

      {/* Reuses the same search+pagination component as the main index,
          just pre-filtered to this tag's posts -- a tag page is "the
          index, scoped," not a separate feature. */}
      <BlogIndex posts={posts} />
    </div>
  );
}
