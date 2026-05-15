import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildPageJsText,
  componentNameToSlug,
  loadConfig,
  renderPage,
  rewriteHtmlAssetUrls,
  rewriteCssUrls
} from "../scripts/builder-core.mjs";

async function makeFixture() {
  const root = await mkdtemp(path.join(tmpdir(), "tailwind-html-builder-"));

  await mkdir(path.join(root, "src/pages"), { recursive: true });
  await mkdir(path.join(root, "src/js/component"), { recursive: true });
  await mkdir(path.join(root, "src/components/header"), { recursive: true });
  await mkdir(path.join(root, "src/components/app-header"), { recursive: true });
  await mkdir(path.join(root, "src/components/nav"), { recursive: true });
  await mkdir(path.join(root, "src/assets/images"), { recursive: true });
  await mkdir(path.join(root, "src/assets/fonts"), { recursive: true });

  await writeFile(path.join(root, "builder.config.mjs"), `
export default {
  pages: "src/pages/**/*.html",
  componentsDir: "src/components",
  assetsDir: "src/assets",
  outDir: "dist",
  componentTagPattern: "PascalCaseSelfClosing"
};
`);

  await writeFile(path.join(root, "src/pages/index.html"), `<!doctype html>
<html>
  <head>
    <!-- 保留 head 註解 -->
    <title>Home</title>
  </head>
  <body class="bg-white text-slate-900">
    <Header />
    <main>Home</main>
    <!-- 保留 body 註解 -->
  </body>
</html>
`);

  await writeFile(path.join(root, "src/pages/about.html"), `<!doctype html>
<html>
  <head><title>About</title></head>
  <body><AppHeader /><main>About</main></body>
</html>
`);

  await writeFile(path.join(root, "src/components/header/header.html"), `<header class="px-6 py-4">
  <Nav />
  <h1>Header</h1>
</header>
`);
  await writeFile(path.join(root, "src/components/app-header/app-header.html"), `<header class="app-header">
  <h1>App Header</h1>
</header>
`);
  await writeFile(path.join(root, "src/components/nav/nav.html"), `<nav class="flex gap-4">
  <a href="./index.html">Home</a>
</nav>
`);
  await writeFile(path.join(root, "src/components/nav/nav.css"), `/* nav CSS 註解 */
.nav-logo {
  background-image: url("../../assets/images/logo.svg");
}
`);
  await writeFile(path.join(root, "src/components/header/header.css"), `/* header CSS 註解 */
.site-header {
  background: url("../../assets/images/header.png");
}
@font-face {
  font-family: "Demo";
  src: url("../../assets/fonts/demo.woff2") format("woff2");
}
`);
  await writeFile(path.join(root, "src/components/header/header.js"), `// header JS 註解
window.headerLoaded = true;
`);
  await writeFile(path.join(root, "src/pages/index.css"), `/* 頁面 CSS 註解 */
.home-hero {
  color: black;
}
`);
  await writeFile(path.join(root, "src/pages/index.js"), `// 頁面 JS 註解
window.pageLoaded = true;
`);
  await writeFile(path.join(root, "src/js/index.js"), `// 頁面 JS 註解
window.pageLoaded = true;
`);
  await writeFile(path.join(root, "src/js/component/header.js"), `// header JS 註解
window.headerLoaded = true;
`);

  return root;
}

test("maps PascalCase component tags to kebab-case component folders", () => {
  assert.equal(componentNameToSlug("Header"), "header");
  assert.equal(componentNameToSlug("AppHeader"), "app-header");
});

test("renders Vue-like component tags and collects component css/js in dependency order", async () => {
  const root = await makeFixture();

  try {
    const config = await loadConfig(root);
    const result = await renderPage(path.join(root, "src/pages/index.html"), config);

    assert.match(result.html, /<!-- 保留 head 註解 -->/);
    assert.match(result.html, /<nav class="flex gap-4">/);
    assert.match(result.html, /<header class="px-6 py-4">/);
    assert.doesNotMatch(result.html, /<Header\s*\/>/);
    assert.deepEqual(
      result.componentCssFiles.map((filePath) => path.relative(root, filePath).replaceAll("\\", "/")),
      [
        "src/components/nav/nav.css",
        "src/components/header/header.css"
      ]
    );
    assert.deepEqual(
      result.componentJsFiles.map((filePath) => path.relative(root, filePath).replaceAll("\\", "/")),
      ["src/js/component/header.js"]
    );
    assert.equal(path.relative(root, result.pageCssFile).replaceAll("\\", "/"), "src/pages/index.css");
    assert.equal(path.relative(root, result.pageJsFile).replaceAll("\\", "/"), "src/js/index.js");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("combines component js before page js from the dedicated js folders", async () => {
  const root = await makeFixture();

  try {
    const config = await loadConfig(root);
    const result = await renderPage(path.join(root, "src/pages/index.html"), config);
    const js = await buildPageJsText(result, config);

    assert.match(js, /\/\* 組件: src\/js\/component\/header\.js \*\//);
    assert.match(js, /\/\* 頁面: src\/js\/index\.js \*\//);
    assert.ok(
      js.indexOf("header JS 註解") < js.indexOf("頁面 JS 註解"),
      "component js should be emitted before page js"
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("renders multi-word components using kebab-case folder names", async () => {
  const root = await makeFixture();

  try {
    const config = await loadConfig(root);
    const result = await renderPage(path.join(root, "src/pages/about.html"), config);

    assert.match(result.html, /<header class="app-header">/);
    assert.doesNotMatch(result.html, /<AppHeader\s*\/>/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("detects circular component references", async () => {
  const root = await makeFixture();

  try {
    await writeFile(path.join(root, "src/components/nav/nav.html"), `<Header />`);
    const config = await loadConfig(root);

    await assert.rejects(
      () => renderPage(path.join(root, "src/pages/index.html"), config),
      /Circular component reference: header -> nav -> header/
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rewrites component css asset urls relative to generated page css", async () => {
  const root = await makeFixture();

  try {
    const cssPath = path.join(root, "src/components/header/header.css");
    const css = await readFile(cssPath, "utf8");
    const rewritten = rewriteCssUrls({
      css,
      sourceCssPath: cssPath,
      rootDir: root,
      assetsDir: path.join(root, "src/assets"),
      outputCssPath: path.join(root, "dist/assets/css/index.css")
    });

    assert.match(rewritten, /url\("\.\.\/images\/header\.png"\)/);
    assert.match(rewritten, /url\("\.\.\/fonts\/demo\.woff2"\)/);
    assert.match(rewritten, /\/\* header CSS 註解 \*\//);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rewrites html asset urls for direct-open dist pages", async () => {
  const root = await makeFixture();

  try {
    const rewritten = rewriteHtmlAssetUrls({
      html: `<img src="../../assets/images/logo.svg" alt="Logo">`,
      sourceHtmlPath: path.join(root, "src/components/header/header.html"),
      rootDir: root,
      assetsDir: path.join(root, "src/assets"),
      targetHtmlPath: path.join(root, "dist/about/team.html"),
      mode: "build"
    });

    assert.equal(rewritten, `<img src="../assets/images/logo.svg" alt="Logo">`);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("vite config uses localhost port 3000 and ignores generated folders", async () => {
  const viteConfig = await import(`../vite.config.js?t=${Date.now()}`);
  const config = viteConfig.default;

  assert.equal(config.server.port, 3000);
  assert.equal(config.server.host, "localhost");
  assert.equal(config.server.strictPort, true);
  assert.deepEqual(config.server.watch.ignored, ["**/.cache/**", "**/dist/**"]);
});
