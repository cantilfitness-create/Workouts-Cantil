import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Caminho relativo: o site funciona no GitHub Pages (subpasta) e no Netlify
  base: "./",
});
