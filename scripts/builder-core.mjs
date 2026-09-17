import { spawnSync } from "node:child_process";
import { constants, cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { accessSync, createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// 組件標籤採 `c-` 前綴的 kebab-case custom element（如 <c-header />、<c-site-banner />）。
// 連字號讓 Prettier 的 HTML parser 原樣保留標籤（不會像 PascalCase 那樣被小寫化），
// 因此來源 HTML 可以安全格式化。擷取群組為去掉 `c-` 後的 slug，直接對應組件資料夾。
const HTML_COMPONENT_TAG_RE = /<c-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\s*\/>/g;
// 匹配任何 <c-名稱…> 開標籤（到第一個 > 為止）；group 2 是名稱與 > 之間的內容，
// 用來判斷是否為合法的純自閉合形式（trim 後應為 "/"），否則視為不支援語法。
const HTML_ANY_COMPONENT_TAG_RE = /<c-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)([^>]*)>/g;
const CSS_URL_RE = /url\(\s*(["']?)([^"')]+)\1\s*\)/g;
const HTML_ASSET_ATTR_RE = /\b(src|href|poster)=("([^"]*)"|'([^']*)')/g;

export function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

export async function loadConfig(rootDir = process.cwd()) {
  const configPath = path.resolve(rootDir, "builder.config.mjs");
  const configUrl = `${pathToFileURL(configPath).href}?t=${Date.now()}`;
  const loaded = await import(configUrl);
  const rawConfig = loaded.default ?? {};
  const pages = rawConfig.pages ?? "src/pages/**/*.html";
  const pagesDir = path.resolve(rootDir, getBaseDirFromGlob(pages));

  return {
    rootDir: path.resolve(rootDir),
    pages,
    pagesDir,
    componentsDir: path.resolve(rootDir, rawConfig.componentsDir ?? "src/components"),
    pageJsDir: path.resolve(rootDir, rawConfig.pageJsDir ?? "src/js"),
    componentJsDir: path.resolve(rootDir, rawConfig.componentJsDir ?? "src/js/component"),
    assetsDir: path.resolve(rootDir, rawConfig.assetsDir ?? "src/assets"),
    outDir: path.resolve(rootDir, rawConfig.outDir ?? "dist"),
    componentTagPattern: rawConfig.componentTagPattern ?? "CPrefixSelfClosing",
    tailwindEntry: path.resolve(rootDir, rawConfig.tailwindEntry ?? "src/styles/tailwind.css"),
  };
}

export async function discoverPages(config) {
  const pages = await walkFiles(config.pagesDir, ".html");
  return pages.sort((a, b) => normalizePath(a).localeCompare(normalizePath(b)));
}

export function getPageOutputInfo(pagePath, config) {
  const pageRelative = path.relative(config.pagesDir, pagePath);
  const htmlOutputPath = path.join(config.outDir, pageRelative);
  const pageName = pageRelative.replace(path.extname(pageRelative), "").split(path.sep).join("-");
  const cssOutputPath = path.join(config.outDir, "assets", "css", `${pageName}.css`);
  const jsOutputPath = path.join(config.outDir, "assets", "js", `${pageName}.js`);

  return {
    pageRelative,
    pageName,
    htmlOutputPath,
    cssOutputPath,
    jsOutputPath,
    cssHref: toHtmlRelativeUrl(path.dirname(htmlOutputPath), cssOutputPath),
    jsSrc: toHtmlRelativeUrl(path.dirname(htmlOutputPath), jsOutputPath),
  };
}

export async function renderPage(pagePath, config, options = {}) {
  const html = await readFile(pagePath, "utf8");
  const context = {
    config,
    options,
    componentCssFiles: [],
    componentJsFiles: [],
    seenCssFiles: new Set(),
    seenJsFiles: new Set(),
    componentStack: [],
  };
  const rewrittenHtml = rewriteHtmlAssetUrlsForOptions(html, pagePath, config, options);
  const renderedHtml = await renderHtml(rewrittenHtml, context, pagePath);
  const pageCssFile = await sidecarFile(pagePath, ".css");
  const pageJsFile = await pageJsFileForPage(pagePath, config);

  return {
    pagePath,
    html: renderedHtml,
    componentCssFiles: context.componentCssFiles,
    componentJsFiles: context.componentJsFiles,
    pageCssFile,
    pageJsFile,
  };
}

// 用 Prettier 格式化最終輸出字串。僅在 build 流程（buildSite）中呼叫，
// 採動態 import 以避免 dev server / middleware 載入 prettier。
// 格式化失敗時警告並回傳原字串，確保 build 不會中斷、頁面不出錯。
async function formatOutput(content, parser, rootDir) {
  if (!content || !content.trim()) return content;
  try {
    const prettier = await import("prettier");
    const options = (await prettier.resolveConfig(path.join(rootDir, ".prettierrc.json"))) ?? {};
    return await prettier.format(content, { ...options, parser });
  } catch (error) {
    console.warn(`格式化輸出失敗（${parser}），改用未格式化內容：${error.message}`);
    return content;
  }
}

export async function buildSite(rootDir = process.cwd()) {
  const config = await loadConfig(rootDir);
  const pages = await discoverPages(config);
  const builtPages = [];

  await rm(config.outDir, { recursive: true, force: true });
  await mkdir(config.outDir, { recursive: true });
  await copyAssets(config);

  for (const pagePath of pages) {
    const outputInfo = getPageOutputInfo(pagePath, config);
    const rendered = await renderPage(pagePath, config, {
      htmlAssetMode: "build",
      targetHtmlPath: outputInfo.htmlOutputPath,
    });
    const css = await buildPageCssText(rendered, config, outputInfo);
    const js = await buildPageJsText(rendered, config);
    const html = injectPageAssets(rendered.html, {
      cssHref: outputInfo.cssHref,
      jsSrc: js.trim() ? outputInfo.jsSrc : null,
    });

    await mkdir(path.dirname(outputInfo.htmlOutputPath), { recursive: true });
    await mkdir(path.dirname(outputInfo.cssOutputPath), { recursive: true });
    await mkdir(path.dirname(outputInfo.jsOutputPath), { recursive: true });

    await writeFile(
      outputInfo.htmlOutputPath,
      await formatOutput(html, "html", config.rootDir),
      "utf8"
    );
    await writeFile(
      outputInfo.cssOutputPath,
      await formatOutput(css, "css", config.rootDir),
      "utf8"
    );

    if (js.trim()) {
      await writeFile(
        outputInfo.jsOutputPath,
        await formatOutput(js, "babel", config.rootDir),
        "utf8"
      );
    }

    builtPages.push({ ...outputInfo, rendered, hasJs: Boolean(js.trim()) });
  }

  return { config, pages: builtPages };
}

export async function renderDevHtml(urlPathname, config, server) {
  const pagePath = await findPageByUrl(urlPathname, config);
  if (!pagePath) return null;

  const outputInfo = getPageOutputInfo(pagePath, config);
  const rendered = await renderPage(pagePath, config, { htmlAssetMode: "dev" });
  const js = await buildPageJsText(rendered, config);
  const html = injectPageAssets(rendered.html, {
    cssHref: `/@builder/assets/css/${outputInfo.pageName}.css`,
    jsSrc: js.trim() ? `/@builder/assets/js/${outputInfo.pageName}.js` : null,
  });

  if (server) {
    return server.transformIndexHtml(urlPathname, html);
  }

  return html;
}

export async function renderDevCss(pageName, config) {
  const pagePath = await findPageByName(pageName, config);
  if (!pagePath) return null;

  const outputInfo = getPageOutputInfo(pagePath, config);
  const rendered = await renderPage(pagePath, config, { htmlAssetMode: "dev" });

  return buildPageCssText(rendered, config, outputInfo, { cssAssetMode: "dev" });
}

export async function renderDevJs(pageName, config) {
  const pagePath = await findPageByName(pageName, config);
  if (!pagePath) return null;

  const rendered = await renderPage(pagePath, config, { htmlAssetMode: "dev" });
  return buildPageJsText(rendered, config);
}

export async function buildPageCssText(renderedPage, config, outputInfo, options = {}) {
  const cssAssetMode = options.cssAssetMode ?? "build";
  const compiledTailwindCss = await compileTailwindCss(renderedPage, config, outputInfo.pageName);
  const tailwindCss = rewriteCssUrls({
    css: compiledTailwindCss,
    sourceCssPath: config.tailwindEntry,
    rootDir: config.rootDir,
    assetsDir: config.assetsDir,
    outputCssPath: outputInfo.cssOutputPath,
    mode: cssAssetMode,
  });
  const chunks = [tailwindCss.trimEnd()];

  for (const cssPath of renderedPage.componentCssFiles) {
    const css = await readFile(cssPath, "utf8");
    chunks.push(sectionComment(`組件: ${path.relative(config.rootDir, cssPath)}`));
    chunks.push(
      rewriteCssUrls({
        css,
        sourceCssPath: cssPath,
        rootDir: config.rootDir,
        assetsDir: config.assetsDir,
        outputCssPath: outputInfo.cssOutputPath,
        mode: cssAssetMode,
      }).trimEnd()
    );
  }

  if (renderedPage.pageCssFile) {
    const css = await readFile(renderedPage.pageCssFile, "utf8");
    chunks.push(sectionComment(`頁面: ${path.relative(config.rootDir, renderedPage.pageCssFile)}`));
    chunks.push(
      rewriteCssUrls({
        css,
        sourceCssPath: renderedPage.pageCssFile,
        rootDir: config.rootDir,
        assetsDir: config.assetsDir,
        outputCssPath: outputInfo.cssOutputPath,
        mode: cssAssetMode,
      }).trimEnd()
    );
  }

  return `${chunks.filter(Boolean).join("\n\n")}\n`;
}

export async function buildPageJsText(renderedPage, config = null) {
  const chunks = [];

  for (const jsPath of renderedPage.componentJsFiles) {
    const js = await readFile(jsPath, "utf8");
    chunks.push(sectionComment(`組件: ${sourceLabel(jsPath, config)}`));
    chunks.push(js.trimEnd());
  }

  if (renderedPage.pageJsFile) {
    const js = await readFile(renderedPage.pageJsFile, "utf8");
    chunks.push(sectionComment(`頁面: ${sourceLabel(renderedPage.pageJsFile, config)}`));
    chunks.push(js.trimEnd());
  }

  return chunks.length ? `${chunks.join("\n\n")}\n` : "";
}

export function rewriteCssUrls({
  css,
  sourceCssPath,
  rootDir,
  assetsDir,
  outputCssPath,
  mode = "build",
}) {
  return css.replace(CSS_URL_RE, (match, quote, rawUrl) => {
    const resolved = resolveLocalAssetUrl(rawUrl, sourceCssPath, rootDir, assetsDir);
    if (!resolved) return match;

    if (mode === "dev") {
      const assetRelative = normalizePath(path.relative(assetsDir, resolved.filePath));
      const devUrl = `/assets/${assetRelative}${resolved.suffix}`;
      return `url(${quote || '"'}${devUrl}${quote || '"'})`;
    }

    const relativeUrl =
      toHtmlRelativeUrl(
        path.dirname(outputCssPath),
        path.join(path.dirname(outputCssPath), "..", path.relative(assetsDir, resolved.filePath))
      ) + resolved.suffix;

    return `url(${quote || '"'}${relativeUrl}${quote || '"'})`;
  });
}

export function rewriteHtmlAssetUrls({
  html,
  sourceHtmlPath,
  rootDir,
  assetsDir,
  targetHtmlPath,
  mode,
  outDir = path.join(rootDir, "dist"),
}) {
  return html.replace(
    HTML_ASSET_ATTR_RE,
    (match, attrName, quotedValue, doubleValue, singleValue) => {
      const value = doubleValue ?? singleValue ?? "";
      const quote = quotedValue.startsWith("'") ? "'" : '"';
      const resolved = resolveLocalAssetUrl(value, sourceHtmlPath, rootDir, assetsDir);
      if (!resolved) return match;

      const assetRelative = normalizePath(path.relative(assetsDir, resolved.filePath));

      if (mode === "dev") {
        return `${attrName}=${quote}/assets/${assetRelative}${resolved.suffix}${quote}`;
      }

      const outputAssetPath = path.join(outDir, "assets", assetRelative);
      const buildUrl = `${toHtmlRelativeUrl(path.dirname(targetHtmlPath), outputAssetPath)}${resolved.suffix}`;

      return `${attrName}=${quote}${buildUrl}${quote}`;
    }
  );
}

export function injectPageAssets(html, { cssHref, jsSrc }) {
  const cssTag = `    <link rel="stylesheet" href="${cssHref}">`;
  const jsTag = jsSrc ? `    <script src="${jsSrc}"></script>` : "";
  let output = html;

  if (output.includes("</head>")) {
    output = output.replace("</head>", `${cssTag}\n  </head>`);
  } else {
    output = `${cssTag}\n${output}`;
  }

  if (jsTag) {
    if (output.includes("</body>")) {
      output = output.replace("</body>", `${jsTag}\n  </body>`);
    } else {
      output = `${output}\n${jsTag}\n`;
    }
  }

  return output.endsWith("\n") ? output : `${output}\n`;
}

export async function findPageByUrl(urlPathname, config) {
  const cleanPath = decodeURIComponent(urlPathname.split("?")[0]).replace(/^\/+/, "");
  const relativePath = cleanPath === "" ? "index.html" : cleanPath;
  const candidates = [
    path.join(config.pagesDir, relativePath),
    path.join(config.pagesDir, relativePath, "index.html"),
  ];

  for (const candidate of candidates) {
    if ((await fileExists(candidate)) && candidate.endsWith(".html")) {
      return candidate;
    }
  }

  return null;
}

export async function findPageByName(pageName, config) {
  const pages = await discoverPages(config);
  return (
    pages.find((pagePath) => getPageOutputInfo(pagePath, config).pageName === pageName) ?? null
  );
}

export function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".avif": "image/avif",
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".mp4": "video/mp4",
    ".otf": "font/otf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ttf": "font/ttf",
    ".txt": "text/plain; charset=utf-8",
    ".webm": "video/webm",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };

  return types[ext] ?? "application/octet-stream";
}

export function createBuilderMiddleware(rootDir = process.cwd()) {
  let configPromise = loadConfig(rootDir);

  return async function builderMiddleware(req, res, next) {
    try {
      const config = await configPromise;
      const server = this;
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "127.0.0.1"}`);

      if (req.method !== "GET" && req.method !== "HEAD") {
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
      }

      if (url.pathname.startsWith("/@builder/assets/css/")) {
        const pageName = path.basename(url.pathname, ".css");
        const css = await renderDevCss(pageName, config);
        if (css === null) return next();

        res.setHeader("Content-Type", "text/css; charset=utf-8");
        res.end(css);
        return;
      }

      if (url.pathname.startsWith("/@builder/assets/js/")) {
        const pageName = path.basename(url.pathname, ".js");
        const js = await renderDevJs(pageName, config);
        if (js === null) return next();

        res.setHeader("Content-Type", "text/javascript; charset=utf-8");
        res.end(js);
        return;
      }

      if (url.pathname.startsWith("/assets/")) {
        await serveDevAsset(url.pathname, config, res, next);
        return;
      }

      const html = await renderDevHtml(url.pathname, config, server);
      if (html !== null) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(html);
        return;
      }

      next();
    } catch (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(error instanceof Error ? error.stack : String(error));
    }
  };
}

async function renderHtml(html, context, sourceHtmlPath) {
  assertNoUnsupportedComponentTags(html, sourceHtmlPath);

  const componentTagRe = new RegExp(HTML_COMPONENT_TAG_RE.source, "g");
  let rendered = "";
  let lastIndex = 0;
  let match;

  while ((match = componentTagRe.exec(html)) !== null) {
    rendered += html.slice(lastIndex, match.index);
    rendered += await renderComponent(match[1], context);
    lastIndex = match.index + match[0].length;
  }

  rendered += html.slice(lastIndex);
  return rendered;
}

async function renderComponent(slug, context) {
  if (context.componentStack.includes(slug)) {
    throw new Error(
      `Circular component reference: ${[...context.componentStack, slug].join(" -> ")}`
    );
  }

  const componentDir = path.join(context.config.componentsDir, slug);
  const componentHtmlPath = path.join(componentDir, `${slug}.html`);
  if (!(await fileExists(componentHtmlPath))) {
    throw new Error(`Component <c-${slug} /> not found at ${componentHtmlPath}`);
  }

  const html = await readFile(componentHtmlPath, "utf8");
  const childContext = {
    ...context,
    componentStack: [...context.componentStack, slug],
  };
  const rewrittenHtml = rewriteHtmlAssetUrlsForOptions(
    html,
    componentHtmlPath,
    context.config,
    context.options
  );
  const renderedHtml = await renderHtml(rewrittenHtml, childContext, componentHtmlPath);
  const cssFile = path.join(componentDir, `${slug}.css`);
  const jsFile = path.join(context.config.componentJsDir, `${slug}.js`);

  await addExistingFile(cssFile, context.componentCssFiles, context.seenCssFiles);
  await addExistingFile(jsFile, context.componentJsFiles, context.seenJsFiles);

  return renderedHtml;
}

function assertNoUnsupportedComponentTags(html, sourceHtmlPath) {
  const anyComponentTagRe = new RegExp(HTML_ANY_COMPONENT_TAG_RE.source, "g");
  let match;
  while ((match = anyComponentTagRe.exec(html)) !== null) {
    // 合法的純自閉合標籤，名稱與 > 之間只會是 "/"（如 <c-header /> → " /" → "/"）。
    if (match[2].trim() === "/") continue;
    throw new Error(
      `Unsupported component syntax <c-${match[1]}${match[2]}> in ${sourceHtmlPath}. Use pure self-closing tags like <c-${match[1]} />.`
    );
  }
}

function rewriteHtmlAssetUrlsForOptions(html, sourceHtmlPath, config, options) {
  if (!options.htmlAssetMode) return html;

  return rewriteHtmlAssetUrls({
    html,
    sourceHtmlPath,
    rootDir: config.rootDir,
    assetsDir: config.assetsDir,
    targetHtmlPath: options.targetHtmlPath,
    mode: options.htmlAssetMode,
    outDir: config.outDir,
  });
}

async function compileTailwindCss(renderedPage, config, pageName) {
  const cacheDir = path.join(config.rootDir, ".cache", "tailwind", pageName);
  const inputCssPath = path.join(cacheDir, "input.css");
  const outputCssPath = path.join(cacheDir, "tailwind.css");
  const sourceHtmlPath = path.join(cacheDir, "source.html");
  const sourceParts = [renderedPage.html];

  for (const jsPath of renderedPage.componentJsFiles) {
    sourceParts.push(await readFile(jsPath, "utf8"));
  }

  if (renderedPage.pageJsFile) {
    sourceParts.push(await readFile(renderedPage.pageJsFile, "utf8"));
  }

  await mkdir(cacheDir, { recursive: true });
  await writeFile(sourceHtmlPath, sourceParts.join("\n\n"), "utf8");
  await writeFile(inputCssPath, await createTailwindInput(config, sourceHtmlPath), "utf8");

  const cliPath = findTailwindCli(config.rootDir);
  const result = spawnSync(
    cliPath.command,
    [...cliPath.args, "-i", inputCssPath, "-o", outputCssPath],
    {
      cwd: config.rootDir,
      encoding: "utf8",
      shell: false,
    }
  );

  if (result.status !== 0) {
    throw new Error(
      `Tailwind CSS build failed:\n${result.error?.message ?? ""}\n${result.stdout ?? ""}\n${result.stderr ?? ""}`
    );
  }

  return readFile(outputCssPath, "utf8");
}

async function createTailwindInput(config, sourceHtmlPath) {
  let tailwindEntry = `@import "tailwindcss" source(none);\n`;

  if (await fileExists(config.tailwindEntry)) {
    tailwindEntry = await readFile(config.tailwindEntry, "utf8");
    tailwindEntry = tailwindEntry.replace(
      /@import\s+(["'])tailwindcss\1\s*;/,
      '@import "tailwindcss" source(none);'
    );
  }

  const sourcePath = normalizePath(
    path.relative(path.dirname(path.join(config.rootDir, ".cache", "tailwind")), sourceHtmlPath)
  );
  const localSourcePath = normalizePath(
    path.relative(
      path.dirname(
        path.join(
          config.rootDir,
          ".cache",
          "tailwind",
          path.basename(path.dirname(sourceHtmlPath)),
          "input.css"
        )
      ),
      sourceHtmlPath
    )
  );

  return `${tailwindEntry.trimEnd()}\n@source "${localSourcePath}";\n`;
}

function findTailwindCli(rootDir) {
  const localCli = path.join(rootDir, "node_modules", "@tailwindcss", "cli", "dist", "index.mjs");

  if (existsSync(localCli)) {
    return { command: process.execPath, args: [localCli] };
  }

  return {
    command: process.platform === "win32" ? "npx.cmd" : "npx",
    args: ["@tailwindcss/cli"],
  };
}

async function copyAssets(config) {
  if (!(await fileExists(config.assetsDir))) return;

  await cp(config.assetsDir, path.join(config.outDir, "assets"), {
    recursive: true,
    force: true,
  });
}

async function walkFiles(dir, extension) {
  if (!(await fileExists(dir))) return [];

  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath, extension)));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(entryPath);
    }
  }

  return files;
}

async function sidecarFile(filePath, extension) {
  const candidate = filePath.replace(path.extname(filePath), extension);
  return (await fileExists(candidate)) ? candidate : null;
}

async function pageJsFileForPage(pagePath, config) {
  const pageRelative = path.relative(config.pagesDir, pagePath);
  const pageScriptRelative = pageRelative.replace(path.extname(pageRelative), ".js");
  const candidate = path.join(config.pageJsDir, pageScriptRelative);

  return (await fileExists(candidate)) ? candidate : null;
}

async function addExistingFile(filePath, list, seen) {
  if (seen.has(filePath)) return;
  if (!(await fileExists(filePath))) return;

  seen.add(filePath);
  list.push(filePath);
}

async function fileExists(filePath) {
  try {
    accessSync(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function getBaseDirFromGlob(globPattern) {
  const firstGlobIndex = globPattern.search(/[*?[{]/);
  const staticPart = firstGlobIndex === -1 ? globPattern : globPattern.slice(0, firstGlobIndex);
  return staticPart.replace(/[\\/]?$/, "") || ".";
}

function resolveLocalAssetUrl(rawUrl, sourceFilePath, rootDir, assetsDir) {
  const cleanUrl = rawUrl.trim();
  if (!cleanUrl || isExternalUrl(cleanUrl)) return null;

  const [pathname, suffix = ""] = splitUrlSuffix(cleanUrl);
  let resolved;

  if (pathname.startsWith("@assets/")) {
    resolved = path.join(assetsDir, pathname.slice("@assets/".length));
  } else if (pathname.startsWith("/assets/")) {
    resolved = path.join(assetsDir, pathname.slice("/assets/".length));
  } else {
    resolved = path.resolve(path.dirname(sourceFilePath), pathname);
  }

  const relativeToAssets = path.relative(assetsDir, resolved);
  const isInsideAssets =
    relativeToAssets && !relativeToAssets.startsWith("..") && !path.isAbsolute(relativeToAssets);
  const isAssetsRoot = path.resolve(resolved) === path.resolve(assetsDir);

  if (!isInsideAssets && !isAssetsRoot) return null;

  return { filePath: resolved, suffix };
}

function splitUrlSuffix(url) {
  const hashIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");
  const suffixIndex = [hashIndex, queryIndex]
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (suffixIndex === undefined) return [url, ""];
  return [url.slice(0, suffixIndex), url.slice(suffixIndex)];
}

function isExternalUrl(url) {
  return /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(url);
}

function toHtmlRelativeUrl(fromDir, toPath) {
  let relative = normalizePath(path.relative(fromDir, toPath));
  if (!relative.startsWith(".")) {
    relative = `./${relative}`;
  }

  return relative;
}

function sectionComment(label) {
  return `/* ${normalizePath(label)} */`;
}

function sourceLabel(filePath, config) {
  return config ? path.relative(config.rootDir, filePath) : filePath;
}

async function serveDevAsset(urlPathname, config, res, next) {
  const assetRelative = decodeURIComponent(urlPathname.replace(/^\/assets\//, ""));
  const assetPath = path.resolve(config.assetsDir, assetRelative);
  const relative = path.relative(config.assetsDir, assetPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  try {
    const info = await stat(assetPath);
    if (!info.isFile()) return next();

    res.setHeader("Content-Type", contentTypeFor(assetPath));
    createReadStream(assetPath).pipe(res);
  } catch {
    next();
  }
}
