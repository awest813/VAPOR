import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { scopeBigPictureCss } from "./src/big-picture/vite-scope-big-picture-css";

export default defineConfig({
  root: resolve(__dirname, "src/renderer"),
  build: {
    outDir: resolve(__dirname, "out/web"),
    emptyOutDir: true,
    sourcemap: true,
    target: "esnext",
    rollupOptions: {
      input: resolve(__dirname, "src/renderer/web.html"),
    },
  },
  css: {
    postcss: {
      plugins: [scopeBigPictureCss()],
    },
    preprocessorOptions: {
      scss: {
        api: "modern",
      },
    },
  },
  resolve: {
    alias: {
      "@renderer": resolve(__dirname, "src/renderer/src"),
      "@locales": resolve(__dirname, "src/locales"),
      "@shared": resolve(__dirname, "src/shared"),
    },
  },
  plugins: [svgr(), react()],
});
