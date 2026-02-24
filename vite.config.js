import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import postsPlugin from "./src/vite-plugin-posts.js";

export default defineConfig({
  plugins: [tailwindcss(), postsPlugin()],
});
