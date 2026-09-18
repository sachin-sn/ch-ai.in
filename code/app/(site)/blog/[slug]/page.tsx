import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/blog/posts";
import LinkedInShareButton from "@/components/LinkedInShareButton";

const SITE_URL = "https://ch-ai.in";

// output: "export" means every dynamic path has to be known at build time
// -- generateStaticParams pre-renders one route per published post, same
// pattern as app/howdidimakethis/[app]/page.tsx for project write-ups.
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: `${post.title} — ch-ai.in`,
    description: post.excerpt,
    // These render into the page's <head> at build time -- not injected
    // client-side -- so LinkedIn's (and any other) link-preview scraper
    // sees a real title/description/URL on first fetch, no JS execution
    // required.
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 font-mono text-sm text-ink-dim transition hover:text-accent-bright"
      >
        <span aria-hidden="true">&larr;</span> Back to Writing
      </Link>

      <p className="mt-8 font-mono text-sm text-ink-dim">{formatDate(post.date)}</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink">{post.title}</h1>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tags/${encodeURIComponent(tag)}`}
              className="rounded-full border border-surface-line px-2.5 py-0.5 font-mono text-xs text-ink-dim transition hover:border-accent-bright/50 hover:text-accent-bright"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        <LinkedInShareButton url={url} />
      </div>

      {/* Markdown -> HTML happened at build time (lib/blog/posts.ts); this
          is the site's own trusted content, not user input, so rendering
          it directly is the same trust model as the rest of the site. */}
      <div
        className="blog-prose mt-10"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
