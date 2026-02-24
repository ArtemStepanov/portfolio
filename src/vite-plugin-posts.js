import fs from "node:fs";
import path from "node:path";
import { glob } from "node:fs/promises";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import Shiki from "@shikijs/markdown-it";
import { postTemplate } from "./post-template.js";
import { postsArchiveTemplate } from "./posts-archive-template.js";

const VIRTUAL_MODULE_ID = "virtual:posts-meta";
const RESOLVED_VIRTUAL_MODULE_ID = "\0" + VIRTUAL_MODULE_ID;

function normalizeDate(value, filePath) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    console.warn(
      `[posts] Invalid date in ${path.basename(filePath)}: ${value}`,
    );
    return null;
  }
  return parsed.toISOString();
}

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
    if (postsCache && postsCache.root === root) {
      return postsCache.posts;
    }
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
      const date = normalizeDate(data.date, filePath);
      const sortDate = date ? new Date(date).getTime() : Number.NEGATIVE_INFINITY;

      posts.push({
        slug,
        title: data.title || slug,
        date,
        tags: data.tags || [],
        excerpt: data.excerpt || "",
        bodyHtml,
        sortDate,
      });
    }

    // Sort by date descending (newest first)
    posts.sort((a, b) => {
      if (a.sortDate !== b.sortDate) return b.sortDate - a.sortDate;
      return a.slug.localeCompare(b.slug);
    });
    postsCache = { root, posts };
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
        const meta = posts.map(({ bodyHtml, sortDate, ...rest }) => rest);
        return `export default ${JSON.stringify(meta)};`;
      }
    },

    configureServer(server) {
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
          slug: post.slug,
          title: post.title,
          date: post.date,
          tags: post.tags,
          excerpt: post.excerpt,
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

    async generateBundle(options, bundle) {
      const root = postsDir ? path.resolve(postsDir, "..") : process.cwd();
      const posts = await loadPosts(root);

      // Find the CSS asset in the bundle
      let builtCssPath = "/src/style.css";
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk" || !chunk.isEntry) continue;
        const importedCss = chunk.viteMetadata?.importedCss;
        if (!importedCss || importedCss.size === 0) continue;
        for (const cssFile of importedCss) {
          builtCssPath = "/" + cssFile;
          break;
        }
        break;
      }

      if (builtCssPath === "/src/style.css") {
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (fileName.endsWith(".css")) {
            builtCssPath = "/" + fileName;
            break;
          }
        }
      }

      for (const post of posts) {
        const html = postTemplate({
          slug: post.slug,
          title: post.title,
          date: post.date,
          tags: post.tags,
          excerpt: post.excerpt,
          bodyHtml: post.bodyHtml,
          cssPath: builtCssPath,
        });

        this.emitFile({
          type: "asset",
          fileName: `posts/${post.slug}/index.html`,
          source: html,
        });
      }

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
    },
  };
}
