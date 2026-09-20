import { defineConfig } from "vite";

export default defineConfig({
  // "./" makes the built site work from any folder, including GitHub Pages.
  base: "./",
  server: {
    port: 5173,
    strictPort: true, // if 5173 is busy, say so instead of quietly using another port
  },
});
