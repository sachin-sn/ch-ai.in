"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { expandCardToPage, openPostZoom, prefersReducedMotion } from "@/lib/motion/expandCardToPage";
import { canZoomTransition } from "@/lib/motion/zoomTransition";
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
//
// Clicking the card grows it into the post page (lib/motion/expandCardToPage).
// onNavigate only fires for plain in-app navigations, so cmd/ctrl-click,
// middle-click and "open in new tab" keep working as normal links; with
// prefers-reduced-motion it's a plain navigation too.
export default function PostCard({ post }: { post: PostSummary }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const href = `/blog/${post.slug}`;

  return (
    <div ref={cardRef} data-post-card={post.slug} className="group rounded-lg border border-surface-line bg-surface-panel p-6 shadow-sm transition hover:border-accent-bright/50 hover:shadow-md sm:p-8">
      <Link
        href={href}
        className="block"
        onNavigate={(e) => {
          const card = cardRef.current;
          if (!card || prefersReducedMotion()) return;
          e.preventDefault();
          // Zoom-in fill via View Transitions where supported; the
          // card-grows-into-page overlay otherwise.
          if (canZoomTransition()) openPostZoom(card, href, () => router.push(href));
          else expandCardToPage(card, href, () => router.push(href));
        }}
      >
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
