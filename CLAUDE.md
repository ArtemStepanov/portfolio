# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal developer portfolio at https://awocy.dev — single-page site with a dark, terminal-inspired aesthetic. Hosted on Cloudflare Workers.

## Stack

- **Vite** + vanilla JavaScript (ES modules, no framework)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — theme defined inline in `src/style.css` using `@theme`, no tailwind.config.js
- **Markdown posts**: markdown-it, gray-matter, shiki (syntax highlighting) — processed by custom Vite plugin
- No TypeScript, no testing framework, no linter

## Commands

- `npm run dev` — start dev server with hot reload
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build

## Architecture

Single HTML page (`index.html`) with section containers. `src/main.js` holds all data (skills, projects) as plain objects/arrays and renders them to the DOM via template literals and `innerHTML`. No routing, no state management, no components.

**Rendering flow:** `main.js` defines data → render functions map data to HTML strings → inject into container elements by ID (`#skills-list`, `#projects-grid`, `#posts-grid`).

**Sections** (anchored by ID for smooth scroll nav): `#hero`, `#experience`, `#projects`, `#posts`, `#skills`, `#contact`.

### Engineering Posts

Markdown-based blog built with a custom Vite plugin (`src/vite-plugin-posts.js`):

- **Posts** live in `posts/*.md` with YAML frontmatter (`title`, `date`, `tags`, `excerpt`)
- **Vite plugin** reads markdown at build/dev time, renders HTML with Shiki syntax highlighting, and:
  - Serves post pages during dev via middleware (`/posts/<slug>/`)
  - Emits static HTML files during build (`dist/posts/<slug>/index.html`)
  - Exposes `virtual:posts-meta` module for the main page post listing
- **Post template** (`src/post-template.js`) wraps rendered markdown in a full HTML document with nav, article layout, and footer
- **Prose styles** in `src/style.css` (`.prose` class) style rendered markdown content
- Main page shows up to 3 latest posts in `#posts-grid` via `renderPosts()` in `main.js`

## Design Tokens

- **Background:** zinc-950, **Surface/cards:** zinc-900 with zinc-800 borders
- **Text:** zinc-100 (primary), zinc-400 (secondary)
- **Accent:** green-400 (terminal green)
- **Fonts:** JetBrains Mono (headings/accents), Inter/system sans (body)
- **Borders:** sharp corners (no border-radius), 1px solid zinc-700/800
- Dark mode only — no light theme toggle

## Conventions

- Data for dynamic sections lives in `src/main.js` as hardcoded objects — add new projects/skills there
- Add new blog posts as `posts/<slug>.md` with frontmatter — the Vite plugin picks them up automatically
- Tailwind utility classes directly in HTML; custom utilities and theme in `src/style.css`
- Mobile-first responsive design using Tailwind breakpoints (`sm:`, `md:`)
- External links use `target="_blank" rel="noopener"`
