import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base must match the GitHub Pages repo path (/routine-dashboard/) so built
// asset URLs resolve correctly once deployed.
export default defineConfig({
  base: "/routine-dashboard/",
  plugins: [react(), tailwindcss()],
});
