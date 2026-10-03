import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { checkStaticSite } from "../scripts/check-static.mjs";

async function fixture(t, html) {
  const root = await mkdtemp(path.join(tmpdir(), "static delivery-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "assets"));
  await writeFile(path.join(root, "index.html"), html);
  await writeFile(path.join(root, "assets/site.js"), "console.log('local');");
  await writeFile(path.join(root, "assets/site.css"), 'body { background: url("./image.png"); }');
  await writeFile(path.join(root, "assets/image.png"), "fixture");
  return root;
}

test("static delivery resolves assets relative to HTML and CSS without a server", async (t) => {
  const root = await fixture(
    t,
    '<link rel="stylesheet" href="./assets/site.css"><script src="./assets/site.js"></script>' +
      '<a href="./index.html?lang=en#section">Local</a><iframe src="https://maps.google.com"></iframe>'
  );
  assert.deepEqual(await checkStaticSite(root), { pages: 1, references: 4 });
});

for (const [label, html, pattern] of [
  ["missing resource", '<script src="./missing.js"></script>', /ENOENT/],
  ["CDN dependency", '<script src="https://cdn.example.com/site.js"></script>', /must be local/],
  ["server root path", '<script src="/assets/site.js"></script>', /relative URL/],
  ["escaping the delivery", '<script src="../outside.js"></script>', /leaves the delivery/],
  ["module script", '<script type="module" src="./assets/site.js"></script>', /module script/],
]) {
  test(`static delivery rejects ${label}`, async (t) => {
    const root = await fixture(t, html);
    await assert.rejects(checkStaticSite(root), pattern);
  });
}
