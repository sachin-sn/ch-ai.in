# Blog authoring CLI

`blog.mjs` is Phase 2 of the blog feature: a small local tool for creating
and managing posts in `content/blog/`, so you don't have to hand-write
frontmatter or remember the exact field names every time. See
`../lib/blog/posts.ts` for how the site actually reads these files, and
the `claude/blog-architecture-decision.md` project doc for why this is a
CLI rather than a GUI app or an S3-backed tool.

It only ever touches files under `content/blog/` — it never runs `git`
for you. Review, commit, and push on your own terms, same as any other
change in this repo.

## Commands

Run from `code/` (where `package.json` lives). Anything after `--` is
passed through to the script as its `<slug>` argument.

```bash
npm run blog:new                    # interactive: scaffold a new post
npm run blog:list                   # list every post, including drafts
npm run blog:edit -- <slug>         # open an existing post in $EDITOR
npm run blog:publish -- <slug>      # clear draft: true
npm run blog:unpublish -- <slug>    # set draft: true
npm run blog:delete -- <slug>       # delete a post file (asks to confirm)
```

You can also run it directly without the `npm run` wrapper:
`node scripts/blog.mjs <command> <slug>`.

### `blog:new`

Prompts for:

- **Title** — required.
- **Slug** — suggested from the title (lowercased, hyphenated); press
  Enter to accept, or type your own. Re-prompts if a post with that slug
  already exists.
- **Excerpt** — the one-liner shown on the `/blog` index and used as the
  page's meta description / LinkedIn preview text.
- **Tags** — comma-separated, optional.
- **Date** — defaults to today (`YYYY-MM-DD`).

The post is created with `draft: true`, so it exists in the repo but
`getAllPosts()`/`getPostBySlug()` skip it — it won't show up on the live
site until you publish it. If `$EDITOR` (or `$VISUAL`) is set, the new
file opens automatically; otherwise the command just prints its path.

### `blog:publish` / `blog:unpublish`

Flips the `draft` key in the post's frontmatter and rewrites the file
through the same YAML serializer (`gray-matter`) the rest of the pipeline
uses, so the result parses identically to a hand-written post. Publishing
removes the `draft` key entirely rather than writing `draft: false`, so a
published post's frontmatter stays clean.

### `blog:delete`

Asks `[y/N]` before deleting. There's no undo — if you just want a post
off the site without losing the draft, use `blog:unpublish` instead.

## Images and embeds

Not part of this CLI, but worth knowing while drafting:

- **Images**: put files under `code/public/blog/<slug>/...` and reference
  them with a normal Markdown path (`![alt](/blog/<slug>/cover.jpg)`) —
  they ship as static assets like everything else on the site.
- **YouTube / other embeds**: paste the raw `<iframe>` embed snippet
  directly into the `.md` file. It renders as-is (frontmatter parsing
  uses `sanitize: false` since posts are self-authored/trusted) — there's
  just no responsive-sizing CSS for it yet.
