import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact(), tailwindcss()],
  build: {
    outDir: "../server/view-build/",
    emptyOutDir: true,
  },
  server: {
    port: 4000,
    strictPort: true,
    proxy: {
      "/mcp": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
