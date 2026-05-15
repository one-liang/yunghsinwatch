import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { discoverPages, getPageOutputInfo, loadConfig } from "./builder-core.mjs";

const config = await loadConfig(process.cwd());
const pages = await discoverPages(config);

assert.ok(pages.length > 0, "expected at least one source page");

for (const pagePath of pages) {
  const outputInfo = getPageOutputInfo(pagePath, config);
  const html = await readFile(outputInfo.htmlOutputPath, "utf8");
  const css = await readFile(outputInfo.cssOutputPath, "utf8");

  assert.ok(html.includes(`href="${outputInfo.cssHref}"`), `${outputInfo.pageRelative} should load page css`);
  assert.doesNotMatch(html, /<[A-Z][A-Za-z0-9]*\s*\/>/, `${outputInfo.pageRelative} should not contain raw component tags`);
  assert.ok(html.split(/\r?\n/).length > 5, `${outputInfo.pageRelative} html should keep readable newlines`);
  assert.ok(css.split(/\r?\n/).length > 5, `${outputInfo.pageRelative} css should keep readable newlines`);

  if (html.includes(outputInfo.jsSrc)) {
    const js = await readFile(outputInfo.jsOutputPath, "utf8");
    assert.ok(js.split(/\r?\n/).length > 2, `${outputInfo.pageRelative} js should keep readable newlines`);
  }
}

await stat(path.join(config.outDir, "assets"));

console.log(`checked ${pages.length} page(s) in ${config.outDir}`);
