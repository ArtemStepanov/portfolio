# Posts Archive Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `/posts/` archive page listing all blog posts, with a "view all posts" link on the main page.

**Architecture:** Extend the existing Vite plugin to generate a new `/posts/index.html` page (dev middleware + build emit), using a new archive template. The main page keeps its 3-post teaser and gains a conditional "view all" link.

**Tech Stack:** Vite plugin (Node.js), vanilla JS, Tailwind CSS v4

---

### Task 1: Create archive page template

**Files:**
- Create: `src/posts-archive-template.js`

**Reference:** `src/post-template.js` — reuse the same nav/footer HTML structure.

**Step 1: Create `src/posts-archive-template.js`**

```js
export function postsArchiveTemplate({ posts, cssPath }) {
  const postCards = posts
    .map((p) => {
      const date = new Date(p.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const tagPills = p.tags
        .map(
          (t) =>
            `<span class="text-xs font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded-sm">${t}</span>`,
        )
        .join("");
      return `
    <a href="/posts/${p.slug}/" class="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-5 rounded-sm transition-colors flex flex-col group">
      <div class="flex items-center gap-3 mb-2">
        <time class="font-mono text-xs text-zinc-500">${date}</time>
        <div class="flex flex-wrap gap-1">${tagPills}</div>
      </div>
      <h3 class="font-mono font-bold text-white mb-2 group-hover:text-accent transition-colors">${p.title}</h3>
      <p class="text-zinc-400 text-sm mb-4">${p.excerpt}</p>
      <span class="mt-auto font-mono text-xs text-accent">read more &rarr;</span>
    </a>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Posts — Artem Stepanov</title>
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
          <a href="/posts/" class="text-accent transition-colors">posts</a>
          <a href="/#skills" class="hover:text-accent transition-colors">skills</a>
          <a href="/#contact" class="hover:text-accent transition-colors">contact</a>
        </div>
      </div>
    </nav>

    <!-- Posts Archive -->
    <section class="pt-32 pb-24">
      <div class="max-w-5xl mx-auto px-6">
        <a href="/" class="font-mono text-sm text-accent hover:underline mb-8 inline-block">&larr; back to home</a>
        <h1 class="font-mono text-accent text-sm mb-8">// posts</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${postCards}
        </div>
      </div>
    </section>

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
git add src/posts-archive-template.js
git commit -m "feat: add posts archive page template"
```

---

### Task 2: Add archive page to Vite plugin (dev middleware)

**Files:**
- Modify: `src/vite-plugin-posts.js:7` (add import)
- Modify: `src/vite-plugin-posts.js:93-119` (add route to `configureServer`)

**Step 1: Add import at top of file**

At line 7, after the `postTemplate` import, add:

```js
import { postsArchiveTemplate } from "./posts-archive-template.js";
```

**Step 2: Add `/posts/` route in `configureServer` middleware**

In the `configureServer` method, the existing middleware at line 94 matches `/posts/<slug>`. We need to add a handler for `/posts/` (the archive index) **before** the slug matcher. Replace the middleware function (lines 94-119) so that it first checks for `/posts/` or `/posts`, then falls through to the existing slug route:

Inside `configureServer(server)`, replace the `server.middlewares.use(...)` block (lines 94-119) with:

```js
      server.middlewares.use(async (req, res, next) => {
        // Archive listing: /posts/ or /posts
        if (req.url === "/posts/" || req.url === "/posts") {
          const posts = await loadPosts(server.config.root);
          const meta = posts.map(({ bodyHtml, ...rest }) => rest);
          const html = postsArchiveTemplate({
            posts: meta,
            cssPath: "/src/style.css",
          });
          const transformed = await server.transformIndexHtml("/posts/", html);
          res.setHeader("Content-Type", "text/html");
          res.end(transformed);
          return;
        }

        // Individual post: /posts/<slug>/
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

        const transformed = await server.transformIndexHtml(
          `/posts/${slug}/`,
          html,
        );
        res.setHeader("Content-Type", "text/html");
        res.end(transformed);
      });
```

**Step 3: Verify in dev**

```bash
npm run dev
```

Open `http://localhost:5173/posts/` — should show all posts in a 3-column grid.

**Step 4: Commit**

```bash
git add src/vite-plugin-posts.js
git commit -m "feat: serve /posts/ archive page in dev"
```

---

### Task 3: Add archive page to Vite plugin (build emit)

**Files:**
- Modify: `src/vite-plugin-posts.js:141-169` (`generateBundle` hook)

**Step 1: Emit `posts/index.html` in `generateBundle`**

After the existing `for (const post of posts)` loop (which emits individual post pages), add the archive page emit. Add after line 168 (after the `for` loop's closing brace), before the `generateBundle`'s closing brace:

```js
      // Emit archive listing page
      const archiveMeta = posts.map(({ bodyHtml, ...rest }) => rest);
      const archiveHtml = postsArchiveTemplate({
        posts: archiveMeta,
        cssPath: builtCssPath,
      });
      this.emitFile({
        type: "asset",
        fileName: "posts/index.html",
        source: archiveHtml,
      });
```

**Step 2: Verify build**

```bash
npm run build && ls dist/posts/index.html
```

Expected: file exists.

**Step 3: Preview and check**

```bash
npm run preview
```

Open `http://localhost:4173/posts/` — should render correctly with built CSS.

**Step 4: Commit**

```bash
git add src/vite-plugin-posts.js
git commit -m "feat: emit /posts/index.html at build time"
```

---

### Task 4: Add "view all posts" link on main page

**Files:**
- Modify: `src/main.js:74-107` (`renderPosts` function)

**Step 1: Add "view all" link after the grid**

Replace the `renderPosts` function (lines 74-107) with:

```js
function renderPosts() {
  const grid = document.getElementById("posts-grid");
  if (!grid) return;

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

  if (posts.length > 3) {
    grid.insertAdjacentHTML(
      "afterend",
      '<a href="/posts/" class="inline-block mt-6 font-mono text-sm text-accent hover:underline">view all posts &rarr;</a>',
    );
  }
}
```

The only change from the original is the `if (posts.length > 3)` block at the end that appends the link after the grid.

**Step 2: Verify in dev**

```bash
npm run dev
```

Open `http://localhost:5173/` — the posts section should show 3 cards with a "view all posts →" link below. Clicking it navigates to `/posts/`.

**Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: add 'view all posts' link when more than 3 posts"
```

---

### Task 5: Final verification

**Step 1: Full build + preview**

```bash
npm run build && npm run preview
```

**Step 2: Check all routes work**

- `http://localhost:4173/` — main page shows 3 posts + "view all posts →" link
- `http://localhost:4173/posts/` — archive page shows all posts in responsive grid
- Click any post card on archive — navigates to individual post page
- Individual post page "← back to posts" link goes to `/#posts` (main page section)
- Archive page "← back to home" link goes to `/`
- Archive page nav "posts" link is highlighted (text-accent, no hover:)

**Step 3: Commit (if any fixes needed)**

```bash
git add -A && git commit -m "fix: post-verification adjustments"
```
