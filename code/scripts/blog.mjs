#!/usr/bin/env node
// Phase 2's "local app," scoped down to what Phase 1's architecture
// actually needs: content/blog/*.md is the source of truth (see
// lib/blog/posts.ts), so authoring it is a CLI that reads and writes
// those files directly -- no S3, no separate content store, and (per
// the decision made alongside this) no automated git add/commit/push
// either. This tool only ever touches files; you stay in control of
// what actually gets committed and pushed.
//
// No new dependency beyond gray-matter, which lib/blog/posts.ts already
// uses to parse frontmatter -- this script uses it to read AND write
// frontmatter (matter.stringify), so a post this CLI produces round-trips
// through exactly the same parser the site renders with.
//
// Commands:
//   npm run blog:new                  interactive -- scaffold a new post
//   npm run blog:list                 list every post, including drafts
//   npm run blog:edit -- <slug>       open an existing post in $EDITOR
//   npm run blog:publish -- <slug>    clear draft: true
//   npm run blog:unpublish -- <slug>  set draft: true
//   npm run blog:delete -- <slug>     delete a post file (asks to confirm)

import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const BLOG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "content",
  "blog"
);

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function postPath(slug) {
  return path.join(BLOG_DIR, `${slug}.md`);
}

function readPost(slug) {
  const file = postPath(slug);
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { data, content, file };
}

function writePost(slug, data, content) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.writeFileSync(postPath(slug), matter.stringify(content, data));
}

function listAllPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, f), "utf8"));
      return { slug, ...data };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function prompt(rl, question, fallback = "") {
  const answer = (await rl.question(question)).trim();
  return answer || fallback;
}

function openInEditor(file) {
  const editor = process.env.VISUAL || process.env.EDITOR;
  if (!editor || !process.stdout.isTTY) {
    console.log(`  (set $EDITOR to have this open automatically)`);
    return;
  }
  spawnSync(editor, [file], { stdio: "inherit" });
}

async function cmdNew() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    let title = "";
    while (!title) {
      title = (await rl.question("Title: ")).trim();
      if (!title) console.log("  Title can't be empty.");
    }

    let slug = "";
    while (!slug) {
      slug = await prompt(rl, `Slug [${slugify(title)}]: `, slugify(title));
      if (fs.existsSync(postPath(slug))) {
        console.log(`  content/blog/${slug}.md already exists -- pick another slug.`);
        slug = "";
      }
    }

    const excerpt = await prompt(rl, "Excerpt (one line, shown on the index): ");
    const tagsRaw = await prompt(rl, "Tags (comma-separated, optional): ");
    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : undefined;
    const date = await prompt(rl, `Date [${today()}]: `, today());

    const data = { title, date, excerpt, draft: true };
    if (tags && tags.length > 0) data.tags = tags;

    writePost(slug, data, "\nStart writing here.\n");
    const file = postPath(slug);
    console.log(`\nCreated ${path.relative(process.cwd(), file)} (draft: true).`);
    console.log(`Publish when ready:  npm run blog:publish -- ${slug}\n`);
    openInEditor(file);
  } finally {
    rl.close();
  }
}

function cmdList() {
  const posts = listAllPosts();
  if (posts.length === 0) {
    console.log("No posts in content/blog/ yet -- try `npm run blog:new`.");
    return;
  }
  for (const post of posts) {
    const flag = post.draft ? "  [draft]" : "        ";
    const tags = post.tags?.length ? `  tags: ${post.tags.join(", ")}` : "";
    console.log(`${post.date}${flag}  ${post.slug}  -- ${post.title}${tags}`);
  }
}

function cmdEdit(slug) {
  const post = readPost(slug);
  if (!post) {
    console.error(`✖ No post at content/blog/${slug}.md`);
    process.exit(1);
  }
  console.log(`Opening ${path.relative(process.cwd(), post.file)}...`);
  openInEditor(post.file);
}

function setDraft(slug, draft) {
  const post = readPost(slug);
  if (!post) {
    console.error(`✖ No post at content/blog/${slug}.md`);
    process.exit(1);
  }
  const data = { ...post.data };
  if (draft) {
    data.draft = true;
  } else {
    delete data.draft; // published posts just don't carry the key
  }
  writePost(slug, data, post.content);
  console.log(`${draft ? "Unpublished" : "Published"} ${slug}.`);
}

async function cmdDelete(slug) {
  const post = readPost(slug);
  if (!post) {
    console.error(`✖ No post at content/blog/${slug}.md`);
    process.exit(1);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(
      `Delete "${post.data.title}" (content/blog/${slug}.md)? [y/N] `
    );
    if (answer.trim().toLowerCase() !== "y") {
      console.log("Cancelled.");
      return;
    }
    fs.unlinkSync(post.file);
    console.log(`Deleted content/blog/${slug}.md.`);
  } finally {
    rl.close();
  }
}

function usage() {
  console.log(`Usage:
  npm run blog:new
  npm run blog:list
  npm run blog:edit -- <slug>
  npm run blog:publish -- <slug>
  npm run blog:unpublish -- <slug>
  npm run blog:delete -- <slug>`);
}

const [command, arg] = process.argv.slice(2);

switch (command) {
  case "new":
    await cmdNew();
    break;
  case "list":
    cmdList();
    break;
  case "edit":
    if (!arg) { usage(); process.exit(1); }
    cmdEdit(arg);
    break;
  case "publish":
    if (!arg) { usage(); process.exit(1); }
    setDraft(arg, false);
    break;
  case "unpublish":
    if (!arg) { usage(); process.exit(1); }
    setDraft(arg, true);
    break;
  case "delete":
    if (!arg) { usage(); process.exit(1); }
    await cmdDelete(arg);
    break;
  default:
    usage();
    process.exit(command ? 1 : 0);
}
