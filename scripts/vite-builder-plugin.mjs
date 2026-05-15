import { createBuilderMiddleware, loadConfig, normalizePath } from "./builder-core.mjs";

export function tailwindHtmlBuilder() {
  return {
    name: "tailwind-html-builder",
    async configureServer(server) {
      const config = await loadConfig(server.config.root);
      const reloadRoots = [
        config.pagesDir,
        config.componentsDir,
        config.assetsDir,
        config.pageJsDir,
        config.componentJsDir,
        config.tailwindEntry,
        `${config.rootDir}/builder.config.mjs`
      ];

      for (const watchedPath of reloadRoots) {
        server.watcher.add(watchedPath);
      }

      server.watcher.on("change", (filePath) => {
        const normalized = normalizePath(filePath);
        if (normalized.includes("/.cache/") || normalized.includes("/dist/")) return;
        if (normalized.includes("/src/") || normalized.endsWith("/builder.config.mjs")) {
          server.ws.send({ type: "full-reload" });
        }
      });

      server.middlewares.use(createBuilderMiddleware(server.config.root).bind(server));
    }
  };
}
