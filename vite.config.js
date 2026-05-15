import { defineConfig } from "vite";

import { tailwindHtmlBuilder } from "./scripts/vite-builder-plugin.mjs";

export default defineConfig({
  appType: "custom",
  plugins: [tailwindHtmlBuilder()],
  server: {
    host: "localhost",
    port: 3000,
    strictPort: true,
    watch: {
      ignored: ["**/.cache/**", "**/dist/**"]
    }
  }
});
