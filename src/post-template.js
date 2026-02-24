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
