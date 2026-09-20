import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base must match the GitHub Pages repo path (/routine-dashboard/) so built
// asset URLs resolve correctly once deployed. The Electron/Capacitor shells
// load the build from a local file:// origin instead, which needs relative
// paths - they set VITE_BASE=./ when building.
export default defineConfig({
  base: process.env.VITE_BASE ?? "/routine-dashboard/",
  plugins: [react(), tailwindcss()],
});
