# Posts Archive Page Design

## Problem

The main page shows only 3 latest posts (`posts.slice(0, 3)` in `main.js`). With 6+ posts now in `posts/`, the rest are invisible to visitors.

## Solution

Add a dedicated `/posts/` archive page that lists all posts. The main page keeps its 3-post teaser with a "view all posts" link.

## Architecture

Extend the existing Vite plugin (`vite-plugin-posts.js`) to generate `/posts/index.html` — same pattern it already uses for individual post pages.

Touch points:
1. **New template** (`src/posts-archive-template.js`) — HTML for the archive page
2. **Vite plugin** — serve `/posts/` in dev, emit `posts/index.html` at build
3. **Main page** (`src/main.js`) — add "view all posts" link when posts > 3

## Archive Page Layout

- **Container:** `max-w-5xl` (same as main page sections)
- **Grid:** responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- **Cards:** same style as main page post cards (zinc-900 bg, zinc-800 border, hover:border-zinc-600)
- **Nav/footer:** reuse from `post-template.js` pattern
- **Back link:** `← back to home` at top
- **Section heading:** `// posts` in accent mono (matches main page style)
- **All posts shown** — no pagination (sufficient for dozens of posts)

## Main Page Changes

Below the 3-post grid, add:
```
view all posts →
```
Styled: `font-mono text-sm text-accent hover:underline`, left-aligned. Only shown when total posts > 3.

## Files

| File | Action |
|------|--------|
| `src/posts-archive-template.js` | Create — archive page HTML template |
| `src/vite-plugin-posts.js` | Modify — add archive page to dev middleware + build |
| `src/main.js` | Modify — add "view all posts" link |
