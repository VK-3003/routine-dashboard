import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base must match the GitHub Pages repo path (/routine-bot/) so built asset
// URLs resolve correctly once deployed.
export default defineConfig({
  base: "/routine-bot/",
  plugins: [react(), tailwindcss()],
});
