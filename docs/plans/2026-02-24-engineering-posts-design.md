# Engineering Posts Feature — Design

## Overview

Add a blog/posts feature to the portfolio at awocy.dev for publishing engineering content (homelab write-ups, tips & tricks, tutorials). Posts are authored as markdown files, converted to static HTML at build time, and served alongside the existing single-page portfolio.

Hosted on Cloudflare Workers/Pages — static HTML output works natively.

## Decisions

| Decision            | Choice                          | Rationale                                                     |
| ------------------- | ------------------------------- | ------------------------------------------------------------- |
| Authoring           | Markdown files in repo          | Git-native workflow, public repo is fine                      |
| Navigation          | Separate page per post          | Own URL, SEO-friendly, clean reading experience               |
| Integration         | New #posts section on main page | Latest 3 posts as cards, consistent with #projects            |
| Build strategy      | Custom Vite plugin              | Single pipeline, HMR support, full control, no framework deps |
| Markdown features   | Standard (extensible later)     | Headings, lists, code, links, images, bold/italic             |
| Syntax highlighting | Shiki (build-time)              | Zero client JS, dark theme matching site aesthetic            |

## File Structure

```
posts/
  my-homelab-setup.md
  tips-for-kubernetes.md
  ...
```

### Frontmatter Format

```yaml
---
title: "My Homelab Setup"
date: 2026-02-24
tags: ["homelab", "proxmox", "networking"]
excerpt: "How I built a home server running Proxmox with automated backups."
---
```

Slug derived from filename: `my-homelab-setup.md` → `/posts/my-homelab-setup/`

## Vite Plugin (`vite-plugin-posts`)

### Build Time

1. Glob `posts/*.md`
2. Parse frontmatter with `gray-matter`
3. Convert markdown to HTML with `markdown-it`
4. Syntax-highlight code blocks with Shiki (dark theme, e.g. `vitesse-dark` or `github-dark-dimmed`)
5. Wrap HTML in shared post template (nav, footer, styling — consistent with main page)
6. Emit static HTML to `dist/posts/<slug>/index.html`
7. Expose `virtual:posts-meta` module for `main.js` to import post metadata (title, date, tags, excerpt, slug)

### Dev Server

- Serve post pages via Vite dev middleware
- Watch `posts/*.md` for changes, trigger reload

### Dependencies

- `markdown-it` — markdown parsing
- `gray-matter` — frontmatter parsing
- `shiki` — build-time syntax highlighting

## Main Page Integration

New `#posts` section between `#projects` and `#skills`:

- Grid of latest 3 post cards (same layout pattern as #projects)
- Each card: title, date, tag pills, excerpt, "Read more →" link
- Nav bar gets "posts" link
- `renderPosts()` in `main.js` imports from `virtual:posts-meta`, renders cards into `#posts-grid`
- Same design tokens: `bg-zinc-900`, `border-zinc-800`, `text-accent` tags

## Post Page Template

Standalone static HTML per post:

- **Nav:** Same nav bar as main page (links to `/#experience`, `/#projects`, etc.)
- **Header:** Title (h1, JetBrains Mono), date, tag pills
- **Body:** Rendered markdown HTML with prose styling
- **Back link:** "← Back to posts" → `/#posts`
- **Footer:** Same as main page

### Typography / Prose Styling

- Scoped CSS rules in `style.css` for markdown content (h1-h4, p, ul/ol, a, code, pre, blockquote, img)
- Shiki-generated HTML for code blocks
- Content max-width ~65ch or `max-w-3xl` for readability
- No client-side JS on post pages — pure static HTML + CSS
