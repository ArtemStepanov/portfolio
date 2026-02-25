import { formatDate } from "./utils.js";

export function postTemplate({
  slug,
  title,
  date,
  tags,
  excerpt,
  bodyHtml,
  cssPath,
}) {
  const formattedDate = formatDate(date, { month: "long" });
  const canonicalUrl = slug ? `https://awocy.dev/posts/${slug}/` : null;
  const description = excerpt || "Engineering notes and homelab write-ups.";

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
    <meta name="description" content="${description}" />
    <meta name="author" content="Artem Stepanov" />
    <meta name="theme-color" content="#09090b" />
    <meta property="og:title" content="${title} — Artem Stepanov" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:image" content="https://awocy.dev/posts/${slug}/og-image.png" />
    ${canonicalUrl ? `<meta property="og:url" content="${canonicalUrl}" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:creator" content="@awocy" />
    <meta name="twitter:image" content="https://awocy.dev/posts/${slug}/og-image.png" />
    ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}" />` : ""}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/favicon.svg" />
    <link rel="stylesheet" href="${cssPath}" />
  </head>
  <body class="bg-zinc-950 text-zinc-100 font-sans">
    <!-- Nav -->
    <nav class="fixed top-0 w-full bg-zinc-950/80 backdrop-blur border-b border-zinc-800 z-50">
      <div class="max-w-5xl mx-auto px-6 py-4 flex justify-center sm:justify-between items-center">
        <a href="/" class="nav-logo font-mono font-bold text-accent hidden sm:block">awocy</a>
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
