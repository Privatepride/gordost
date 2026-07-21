import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "strip-crossorigin",
      transformIndexHtml: {
        order: "post",
        handler(html: string) {
          return html.replace(/\s+crossorigin(?:="anonymous")?/gi, "");
        },
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // tdesktop / актуальные мобильные клиенты тянут ES modules; legacy+SystemJS там давал пустой экран.
    target: ["es2020", "edge88", "safari14", "ios14", "chrome87"],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://127.0.0.1:8787", changeOrigin: true },
    },
  },
});
