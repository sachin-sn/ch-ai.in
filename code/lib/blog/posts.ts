import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

// Blog posts are plain Markdown files in content/blog/, one per post,
// slug = filename without extension. This mirrors the rest of the site's
// "content lives in the repo, rendered by Next.js at build time" approach
// (see lib/showcase/apps.ts for the same shape applied to project
// write-ups) rather than a separate CMS or S3-hosted content store:
// publishing a post is a git commit through the same review/CI path as
// any other change, and output: "export" (next.config.ts) means every
// post's HTML -- title, body, Open Graph tags -- is fully pre-rendered at
// build time. No runtime infra, and LinkedIn's link-preview scraper (which
// doesn't execute JavaScript) sees real tags instead of an empty shell.

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostFrontmatter = {
  title: string;
  date: string; // ISO date, e.g. "2026-09-18"
  excerpt: string;
  tags?: string[];
  /** Set true to keep working on a post without it showing up on the
   * live site -- it's simply excluded from every function below. */
  draft?: boolean;
};

export type PostSummary = PostFrontmatter & { slug: string };
export type Post = PostSummary & { html: string };

function readSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

function readFrontmatter(slug: string): {
  data: PostFrontmatter;
  content: string;
} {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { data: data as PostFrontmatter, content };
}

/** All published (non-draft) posts, newest first. Only parses frontmatter
 * -- never renders a post's Markdown body -- so listing posts on the
 * index page doesn't pay for rendering the ones it isn't showing. */
export function getAllPosts(): PostSummary[] {
  return readSlugs()
    .map((slug) => ({ ...readFrontmatter(slug).data, slug }))
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

/** Every tag used by a published post, alphabetical, de-duplicated. Drives
 * both /blog/tags/[tag]'s generateStaticParams and any tag-chip UI. */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags ?? []) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/** Published posts carrying a given tag, newest first -- same ordering as
 * getAllPosts(), just pre-filtered. */
export function getPostsByTag(tag: string): PostSummary[] {
  return getAllPosts().filter((post) => post.tags?.includes(tag));
}

/** One post, fully rendered. This -- and the Markdown parser it pulls in
 * -- only ever runs during `next build`'s static generation, never in the
 * browser, so there's no Markdown-parsing JS shipped to visitors. */
export function getPostBySlug(slug: string): Post | undefined {
  if (!readSlugs().includes(slug)) return undefined;
  const { data, content } = readFrontmatter(slug);
  if (data.draft) return undefined;
  // sanitize: false -- posts are self-authored and trusted (same model as
  // the rest of the site's content), so raw HTML written inline in a
  // Markdown file (e.g. a <figure>) is allowed through rather than
  // stripped. This is not a spot to relax if posts are ever accepted from
  // anyone other than the site's own author.
  const html = remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .processSync(content)
    .toString();
  return { ...data, slug, html };
}
