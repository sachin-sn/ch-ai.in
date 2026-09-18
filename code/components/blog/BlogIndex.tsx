"use client";

import { useMemo, useState } from "react";
import type { PostSummary } from "@/lib/blog/posts";
import PostCard from "@/components/blog/PostCard";

const PAGE_SIZE = 6;

// Search is a plain client-side filter over data that's already shipped
// to the browser -- getAllPosts() runs at build time (lib/blog/posts.ts)
// and its result is passed down as the `posts` prop, so there's no search
// index file, no API route, and no new dependency. That's a deliberate
// trade for a personal blog's scale: fine for tens to a few hundred
// posts; if post bodies (not just title/excerpt/tags) ever need to be
// searched, or the list gets long enough that shipping it all to the
// client is wasteful, that's the point to reach for a build-time search
// tool (e.g. Pagefind) instead of scaling this up.
//
// Pagination is "load more" (grow how much of the filtered list is
// shown), not separate /blog/page/2 routes -- the full list is already
// client-side for search to work, so slicing it further costs nothing
// extra, and a personal blog's index doesn't need page-2-specific URLs
// for SEO (individual posts are what get indexed/shared, not the index's
// pagination state).
export default function BlogIndex({ posts }: { posts: PostSummary[] }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => {
      const haystack = [post.title, post.excerpt, ...(post.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      <label htmlFor="blog-search" className="sr-only">
        Search posts
      </label>
      <input
        id="blog-search"
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setVisibleCount(PAGE_SIZE); // fresh search starts unpaginated
        }}
        placeholder="Search posts by title, tag, or topic…"
        className="mt-10 w-full rounded-md border border-surface-line bg-surface px-4 py-2.5 text-ink outline-none placeholder:text-ink-dim/60 focus:border-accent-bright"
      />

      {filtered.length === 0 ? (
        <p className="mt-10 text-ink-dim">No posts match &ldquo;{query}&rdquo;.</p>
      ) : (
        <>
          <ul className="mt-8 space-y-6">
            {visible.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                className="rounded-md border border-surface-line px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-ink-dim transition hover:border-accent-bright/50 hover:text-accent-bright"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
