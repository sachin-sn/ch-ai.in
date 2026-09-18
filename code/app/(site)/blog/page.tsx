import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog/posts";
import BlogIndex from "@/components/blog/BlogIndex";

export const metadata: Metadata = {
  title: "Writing — ch-ai.in",
  description: "Notes on building things, written up as they happen.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold text-ink">Writing</h1>

      {posts.length === 0 ? (
        <p className="mt-6 text-ink-dim">Nothing published yet — check back soon.</p>
      ) : (
        <BlogIndex posts={posts} />
      )}
    </div>
  );
}
