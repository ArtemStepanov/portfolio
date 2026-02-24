# Engineering Posts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add markdown-based engineering posts to the portfolio with build-time static HTML generation via a custom Vite plugin.

**Architecture:** Custom Vite plugin reads `posts/*.md`, parses frontmatter + markdown, highlights code with Shiki, generates static HTML post pages, and exposes a virtual module (`virtual:posts-meta`) for the main page to render a post listing grid.

**Tech Stack:** Vite 7, markdown-it, gray-matter, shiki, @shikijs/markdown-it, Tailwind CSS v4

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install markdown-it, gray-matter, shiki, and the shiki markdown-it plugin**

Run:
```bash
npm install markdown-it gray-matter shiki @shikijs/markdown-it
```

**Step 2: Verify installation**

Run:
```bash
node -e "import('markdown-it').then(m => console.log('markdown-it OK')); import('gray-matter').then(m => console.log('gray-matter OK')); import('shiki').then(m => console.log('shiki OK'));"
```
Expected: All three print OK.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add markdown-it, gray-matter, shiki dependencies for posts"
```

---

### Task 2: Create the post HTML template function

**Files:**
- Create: `src/post-template.js`

**Step 1: Create the template module**

Create `src/post-template.js` — a function that takes post data and body HTML and returns a complete HTML document string. This is used by the Vite plugin to wrap each rendered post.

```javascript
export function postTemplate({ title, date, tags, bodyHtml, cssPath }) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tagPills = tags
    .map(
      (t) =>
        `<span class="text-xs font-mono text-zinc-500 border border-zinc-800 px-2 py-1 rounded-sm">${t}</span>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} — Artem Stepanov</title>
    <meta name="author" content="Artem Stepanov" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/favicon.svg" />
    <link rel="stylesheet" href="${cssPath}" />
  </head>
  <body class="bg-zinc-950 text-zinc-100 font-sans">
    <!-- Nav -->
    <nav class="fixed top-0 w-full bg-zinc-950/80 backdrop-blur border-b border-zinc-800 z-50">
      <div class="max-w-5xl mx-auto px-6 py-4 flex justify-center sm:justify-between items-center">
        <a href="/" class="font-mono font-bold text-accent hidden sm:block">~/awocy</a>
        <div class="flex gap-4 sm:gap-6 font-mono text-sm text-zinc-400">
          <a href="/#experience" class="hover:text-accent transition-colors">experience</a>
          <a href="/#projects" class="hover:text-accent transition-colors">projects</a>
          <a href="/#posts" class="hover:text-accent transition-colors">posts</a>
          <a href="/#skills" class="hover:text-accent transition-colors">skills</a>
          <a href="/#contact" class="hover:text-accent transition-colors">contact</a>
        </div>
      </div>
    </nav>

    <!-- Post -->
    <article class="pt-32 pb-24">
      <div class="max-w-3xl mx-auto px-6">
        <a href="/#posts" class="font-mono text-sm text-accent hover:underline mb-8 inline-block">&larr; back to posts</a>
        <h1 class="text-3xl sm:text-4xl font-bold font-mono text-zinc-100 mb-4">${title}</h1>
        <div class="flex items-center gap-4 mb-8">
          <time class="font-mono text-xs text-zinc-500">${formattedDate}</time>
          <div class="flex flex-wrap gap-2">${tagPills}</div>
        </div>
        <div class="prose">
${bodyHtml}
        </div>
      </div>
    </article>

    <!-- Footer -->
    <footer class="border-t border-zinc-800 py-8">
      <div class="max-w-5xl mx-auto px-6 text-center">
        <p class="font-mono text-xs text-zinc-500">&copy; 2026 Artem Stepanov</p>
      </div>
    </footer>
  </body>
</html>`;
}
```

**Step 2: Commit**

```bash
git add src/post-template.js
git commit -m "feat: add post HTML template function"
```

---

### Task 3: Create the Vite plugin

**Files:**
- Create: `src/vite-plugin-posts.js`

**Step 1: Create the plugin**

Create `src/vite-plugin-posts.js`. This is the core of the feature — it:
- Reads and parses all `posts/*.md` files
- Converts markdown to HTML with syntax highlighting
- Serves post pages during dev via middleware
- Emits static HTML files during build via `generateBundle`
- Exposes `virtual:posts-meta` for the main page

```javascript
import fs from "node:fs";
import path from "node:path";
import { glob } from "node:fs/promises";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import Shiki from "@shikijs/markdown-it";
import { postTemplate } from "./post-template.js";

const VIRTUAL_MODULE_ID = "virtual:posts-meta";
const RESOLVED_VIRTUAL_MODULE_ID = "\0" + VIRTUAL_MODULE_ID;

export default function postsPlugin() {
  let postsDir;
  let cssPath;
  let md;
  let postsCache = null;

  async function initMarkdown() {
    if (md) return md;
    md = new MarkdownIt({ html: true, linkify: true });
    md.use(
      await Shiki({
        theme: "vitesse-dark",
      }),
    );
    return md;
  }

  function getPostsDir(root) {
    return path.resolve(root, "posts");
  }

  async function loadPosts(root) {
    const dir = getPostsDir(root);
    if (!fs.existsSync(dir)) return [];

    const files = [];
    for await (const entry of glob(path.join(dir, "*.md"))) {
      files.push(entry);
    }

    const mdInstance = await initMarkdown();
    const posts = [];

    for (const filePath of files) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const slug = path.basename(filePath, ".md");
      const bodyHtml = mdInstance.render(content);

      posts.push({
        slug,
        title: data.title || slug,
        date: data.date ? new Date(data.date).toISOString() : null,
        tags: data.tags || [],
        excerpt: data.excerpt || "",
        bodyHtml,
      });
    }

    // Sort by date descending (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return posts;
  }

  return {
    name: "vite-plugin-posts",

    configResolved(config) {
      postsDir = getPostsDir(config.root);
      // In dev, Tailwind is injected via Vite — use the main CSS import from style.css
      // In build, we'll reference the built CSS asset
      cssPath = "/src/style.css";
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },

    async load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const posts = await loadPosts(
          postsDir ? path.resolve(postsDir, "..") : process.cwd(),
        );
        // Export only metadata (no bodyHtml) for the listing page
        const meta = posts.map(({ bodyHtml, ...rest }) => rest);
        return `export default ${JSON.stringify(meta)};`;
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/posts\/([a-z0-9-]+)\/?$/);
        if (!match) return next();

        const slug = match[1];
        const posts = await loadPosts(server.config.root);
        const post = posts.find((p) => p.slug === slug);

        if (!post) return next();

        const html = postTemplate({
          title: post.title,
          date: post.date,
          tags: post.tags,
          bodyHtml: post.bodyHtml,
          cssPath: "/src/style.css",
        });

        // Transform through Vite's HTML pipeline so Tailwind/HMR work
        const transformed = await server.transformIndexHtml(
          `/posts/${slug}/`,
          html,
        );
        res.setHeader("Content-Type", "text/html");
        res.end(transformed);
      });

      // Watch posts directory for changes
      if (fs.existsSync(postsDir)) {
        server.watcher.add(postsDir);
      }

      server.watcher.on("change", (filePath) => {
        if (filePath.startsWith(postsDir) && filePath.endsWith(".md")) {
          postsCache = null;
          // Invalidate the virtual module so the listing re-renders
          const mod = server.moduleGraph.getModuleById(
            RESOLVED_VIRTUAL_MODULE_ID,
          );
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
          }
          server.ws.send({ type: "full-reload" });
        }
      });
    },

    async generateBundle(options) {
      const root = postsDir ? path.resolve(postsDir, "..") : process.cwd();
      const posts = await loadPosts(root);

      // Find the CSS asset filename from the bundle
      let builtCssPath = "/src/style.css";
      // We'll reference the CSS via root-relative path; Cloudflare Pages handles it
      // The CSS is in the assets directory after build
      for (const [fileName] of Object.entries(this.getFileName ? {} : {})) {
        // Not needed — we use a simpler approach below
      }

      for (const post of posts) {
        const html = postTemplate({
          title: post.title,
          date: post.date,
          tags: post.tags,
          bodyHtml: post.bodyHtml,
          cssPath: builtCssPath,
        });

        this.emitFile({
          type: "asset",
          fileName: `posts/${post.slug}/index.html`,
          source: html,
        });
      }
    },
  };
}
```

**Step 2: Commit**

```bash
git add src/vite-plugin-posts.js
git commit -m "feat: add custom Vite plugin for markdown posts"
```

---

### Task 4: Wire up the plugin and fix build CSS injection

**Files:**
- Modify: `vite.config.js`

**Step 1: Register the posts plugin in vite config**

Update `vite.config.js` to import and use the posts plugin:

```javascript
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import postsPlugin from "./src/vite-plugin-posts.js";

export default defineConfig({
  plugins: [tailwindcss(), postsPlugin()],
});
```

**Step 2: Commit**

```bash
git add vite.config.js
git commit -m "feat: register posts plugin in Vite config"
```

---

### Task 5: Create a sample post

**Files:**
- Create: `posts/hello-world.md`

**Step 1: Create posts directory and a sample post**

Create `posts/hello-world.md` with frontmatter and markdown content that exercises key features (headings, code blocks, lists, links, inline code):

```markdown
---
title: "Hello World: First Post"
date: 2026-02-24
tags: ["meta"]
excerpt: "The first post on my engineering blog. Testing the new posts system."
---

## Why a blog?

I wanted a place to share notes on my homelab, engineering tips, and things I learn along the way.

## What to expect

- **Homelab write-ups** — Proxmox, networking, self-hosting
- **Engineering tips** — .NET, Go, Kubernetes
- **Tools and workflows** — things that make life easier

## A code sample

Here's a simple Go HTTP server:

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Hello from the homelab!")
    })
    http.ListenAndServe(":8080", nil)
}
\```

That's it for now. More posts coming soon.
```

> **Note:** The closing triple backtick above should NOT have a backslash — that's just escaping for this plan doc. Write it as a normal closing code fence.

**Step 2: Verify dev server serves the post**

Run:
```bash
npm run dev
```

Visit `http://localhost:5173/posts/hello-world` in a browser. Verify:
- Page loads with nav, title, date, tags, body content
- Code block has syntax highlighting
- Tailwind styles are applied (dark background, correct fonts)

**Step 3: Commit**

```bash
git add posts/hello-world.md
git commit -m "feat: add sample hello-world post"
```

---

### Task 6: Add prose styling for post content

**Files:**
- Modify: `src/style.css`

**Step 1: Add scoped prose styles**

Append to `src/style.css` — these style the rendered markdown inside `.prose` containers on post pages:

```css
/* Post prose styling */
.prose {
  color: var(--color-zinc-300);
  line-height: 1.75;
}

.prose h2 {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--color-zinc-100);
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

.prose h3 {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-zinc-100);
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.prose h4 {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-zinc-200);
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.prose p {
  margin-bottom: 1.25rem;
}

.prose a {
  color: var(--color-green-400);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose a:hover {
  color: var(--color-green-300);
}

.prose strong {
  color: var(--color-zinc-100);
  font-weight: 700;
}

.prose ul, .prose ol {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}

.prose ul {
  list-style-type: disc;
}

.prose ol {
  list-style-type: decimal;
}

.prose li {
  margin-bottom: 0.375rem;
}

.prose code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  color: var(--color-green-400);
  background: var(--color-zinc-800);
  padding: 0.125rem 0.375rem;
  border-radius: 2px;
}

.prose pre {
  margin-bottom: 1.5rem;
  padding: 1rem;
  overflow-x: auto;
  border: 1px solid var(--color-zinc-800);
  border-radius: 2px;
}

.prose pre code {
  background: none;
  padding: 0;
  color: inherit;
}

.prose blockquote {
  border-left: 3px solid var(--color-green-400);
  padding-left: 1rem;
  color: var(--color-zinc-400);
  font-style: italic;
  margin-bottom: 1.25rem;
}

.prose img {
  max-width: 100%;
  border: 1px solid var(--color-zinc-800);
  margin-bottom: 1.5rem;
}

.prose hr {
  border: none;
  border-top: 1px solid var(--color-zinc-800);
  margin: 2rem 0;
}
```

**Step 2: Verify styling on the sample post**

Run dev server, visit the hello-world post, verify:
- Headings use JetBrains Mono
- Code blocks have border and syntax colors
- Lists have bullets
- Links are green

**Step 3: Commit**

```bash
git add src/style.css
git commit -m "feat: add prose styling for post content"
```

---

### Task 7: Add #posts section to the main page

**Files:**
- Modify: `index.html`

**Step 1: Add "posts" nav link**

In `index.html`, add a "posts" link to the nav bar between "projects" and "skills":

```html
<a href="#posts" class="hover:text-accent transition-colors">posts</a>
```

The nav links should be: experience, projects, posts, skills, contact.

**Step 2: Add #posts section HTML**

Add a new section between `<!-- Projects -->` (closing `</section>`) and `<!-- Skills -->`:

```html
<!-- Posts -->
<section id="posts" class="py-24">
    <div class="max-w-5xl mx-auto px-6">
        <h2 class="font-mono text-accent text-sm mb-8">// posts</h2>
        <div
            id="posts-grid"
            class="grid gap-6 grid-cols-1 sm:grid-cols-2"
        >
            <!-- Rendered by main.js -->
        </div>
    </div>
</section>
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add #posts section and nav link to main page"
```

---

### Task 8: Add renderPosts() to main.js

**Files:**
- Modify: `src/main.js`

**Step 1: Import post metadata and add render function**

At the top of `src/main.js`, add the virtual module import:

```javascript
import posts from "virtual:posts-meta";
```

Add the `renderPosts()` function (after `renderProjects()`):

```javascript
function renderPosts() {
  const grid = document.getElementById("posts-grid");
  if (!grid) return;

  // Show at most 3 latest posts (already sorted newest-first by plugin)
  const latest = posts.slice(0, 3);

  if (latest.length === 0) {
    grid.innerHTML = '<p class="text-zinc-500 font-mono text-sm">No posts yet.</p>';
    return;
  }

  grid.innerHTML = latest
    .map((p) => {
      const date = new Date(p.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return `
    <a href="/posts/${p.slug}/" class="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-5 rounded-sm transition-colors flex flex-col group">
      <div class="flex items-center gap-3 mb-2">
        <time class="font-mono text-xs text-zinc-500">${date}</time>
        <div class="flex flex-wrap gap-1">
          ${p.tags.map((t) => `<span class="text-xs font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded-sm">${t}</span>`).join("")}
        </div>
      </div>
      <h3 class="font-mono font-bold text-white mb-2 group-hover:text-accent transition-colors">${p.title}</h3>
      <p class="text-zinc-400 text-sm mb-4">${p.excerpt}</p>
      <span class="mt-auto font-mono text-xs text-accent">read more &rarr;</span>
    </a>`;
    })
    .join("");
}
```

Call `renderPosts()` at the bottom alongside the other render calls:

```javascript
renderSkills();
renderProjects();
renderPosts();
```

**Step 2: Verify on dev server**

Run dev server, visit the main page. Verify:
- #posts section appears between projects and skills
- The hello-world post card shows with title, date, tags, excerpt
- Clicking the card navigates to `/posts/hello-world/`

**Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: add renderPosts() with virtual module import"
```

---

### Task 9: Fix build output — CSS injection for post pages

**Files:**
- Modify: `src/vite-plugin-posts.js`

**Step 1: Update generateBundle to reference the built CSS asset**

The `generateBundle` hook needs to find the actual CSS filename from the bundle (since Vite hashes asset filenames in production). Update the `generateBundle` method in the plugin:

Replace the `generateBundle` function in `src/vite-plugin-posts.js` with:

```javascript
async generateBundle(options, bundle) {
  const root = postsDir ? path.resolve(postsDir, "..") : process.cwd();
  const posts = await loadPosts(root);

  // Find the CSS asset in the bundle
  let builtCssPath = "/src/style.css";
  for (const [fileName, chunk] of Object.entries(bundle)) {
    if (fileName.endsWith(".css")) {
      builtCssPath = "/" + fileName;
      break;
    }
  }

  for (const post of posts) {
    const html = postTemplate({
      title: post.title,
      date: post.date,
      tags: post.tags,
      bodyHtml: post.bodyHtml,
      cssPath: builtCssPath,
    });

    this.emitFile({
      type: "asset",
      fileName: `posts/${post.slug}/index.html`,
      source: html,
    });
  }
},
```

**Step 2: Verify production build**

Run:
```bash
npm run build
```

Verify:
- `dist/posts/hello-world/index.html` exists
- The HTML references the correct CSS file (e.g., `/assets/style-abc123.css`)
- The post content is rendered with syntax-highlighted code blocks

**Step 3: Preview production build**

Run:
```bash
npm run preview
```

Visit `http://localhost:4173/posts/hello-world/` — verify it loads correctly with styles.

**Step 4: Commit**

```bash
git add src/vite-plugin-posts.js
git commit -m "fix: resolve built CSS asset path in post page generation"
```

---

### Task 10: End-to-end verification and final commit

**Step 1: Run full build and preview**

```bash
npm run build && npm run preview
```

Verify all of the following:
- Main page loads at `/` with all sections including #posts
- Posts grid shows the hello-world card
- Clicking the card navigates to `/posts/hello-world/`
- Post page has: nav, back link, title, date, tags, styled prose content, syntax-highlighted code, footer
- Nav links on post page navigate back to main page sections (e.g., `/#experience`)

**Step 2: Verify the dist output**

```bash
ls dist/posts/hello-world/
```

Expected: `index.html`

**Step 3: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "feat: complete engineering posts feature"
```

---

## Summary of files changed

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add markdown-it, gray-matter, shiki deps |
| `src/vite-plugin-posts.js` | Create | Custom Vite plugin — core of the feature |
| `src/post-template.js` | Create | HTML template for post pages |
| `vite.config.js` | Modify | Register posts plugin |
| `posts/hello-world.md` | Create | Sample post for testing |
| `src/style.css` | Modify | Add prose styling for post content |
| `index.html` | Modify | Add #posts section + nav link |
| `src/main.js` | Modify | Add renderPosts() + virtual module import |
