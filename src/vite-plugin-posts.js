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
  };
}
