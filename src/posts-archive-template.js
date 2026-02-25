import { formatDate } from "./utils.js";

export function postsArchiveTemplate({ posts, cssPath }) {
  const postCards = posts
    .map((p) => {
      const date = formatDate(p.date, { month: "short" });
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
