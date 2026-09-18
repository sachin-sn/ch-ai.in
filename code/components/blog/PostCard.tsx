import Link from "next/link";
import type { PostSummary } from "@/lib/blog/posts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Shared between the main index (via BlogIndex) and each /blog/tags/[tag]
// page -- one card definition, so a future style tweak doesn't need to be
// made twice.
//
// Tag chips are Links of their own, not nested inside the card's main
// Link -- an <a> can't contain another <a>, and tags need their own
// destination (/blog/tags/[tag]), so the "whole card is clickable" link
// wraps everything except the tag row, with `group` moved up to the
// outer element so the title/arrow hover effects still fire off hovering
// anywhere on the card.
export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <div className="group rounded-lg border border-surface-line bg-surface-panel p-6 shadow-sm transition hover:border-accent-bright/50 hover:shadow-md sm:p-8">
      <Link href={`/blog/${post.slug}`} className="block">
        <p className="font-mono text-sm text-ink-dim">{formatDate(post.date)}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink transition group-hover:text-accent-bright">
          {post.title}
        </h2>
        <p className="mt-2 text-ink-dim">{post.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1 font-mono text-sm font-semibold text-accent-bright">
          Read more
          <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
            &rarr;
          </span>
        </span>
      </Link>

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
    </div>
  );
}
