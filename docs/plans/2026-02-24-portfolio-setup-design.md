# Portfolio Site — Setup & Design

## Overview

Personal developer portfolio. Single page, smooth scroll, dark-mode-first with a brutalist-clean terminal-inspired aesthetic.

## Stack

- **Build:** Vite + vanilla JS
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin
- **No config files:** No tailwind.config.js, no postcss.config.js — all theme customization in CSS via `@theme`

## Design Tokens

| Token | Value |
|-------|-------|
| Background | zinc-950 |
| Surface/cards | zinc-900, border zinc-800 |
| Primary text | zinc-100 |
| Secondary text | zinc-400 |
| Accent | green-400 (terminal green) |
| Font — headings/accents | Monospace: JetBrains Mono / Fira Code, fallback ui-monospace |
| Font — body | System sans-serif (Inter or system default) |
| Borders | Sharp corners (no border-radius), 1px solid zinc-700/800 |
| Spacing | Generous whitespace, large section padding |
| Dark mode | Default via prefers-color-scheme, no light toggle |

## Page Structure

Single page with fixed top nav and smooth scroll between five sections:

1. **Nav** — fixed top bar, monospace font, section links with smooth scroll
2. **Hero** — name, one-liner tagline, blinking terminal-cursor animation
3. **About** — short bio, 2-3 sentences
4. **Projects** — data-driven grid of cards rendered from a JS array (title, description, tech tags, link)
5. **Skills** — grouped list or tag cloud (languages, frameworks, tools)
6. **Contact** — email, GitHub, LinkedIn links — minimal, no form

## File Structure

```
index.html          — semantic HTML shell with section containers
style.css           — @import "tailwindcss", @theme overrides, custom utilities
main.js             — imports CSS, defines projects data, renders sections to DOM
vite.config.js      — Tailwind Vite plugin only
```
