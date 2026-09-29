import { getAllPosts } from "./posts";
import type { ProjectEntry } from "@/lib/content/profile";

// The homepage "featured" slot shows the latest blog posts (the case-study
// pages for Chitraguptha / TTL Cache aren't built yet). Runs at build time
// in the server page and is handed to the client-side theme components as
// plain data, in the same ProjectEntry shape every theme already renders.

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function getFeaturedPosts(count = 2): ProjectEntry[] {
  return getAllPosts()
    .slice(0, count)
    .map((post) => ({
      id: post.slug,
      slug: `/blog/${post.slug}`,
      kicker: `Latest Post — ${formatDate(post.date)}`,
      title: post.title,
      description: post.excerpt,
    }));
}
