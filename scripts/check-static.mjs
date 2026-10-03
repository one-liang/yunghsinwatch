import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// 檢查 file:// 交付所需的本機資源與相對路徑，不啟動伺服器或下載任何檔案。
export async function checkStaticSite(directory) {
  const root = path.resolve(directory);
  let checked = 0;
  let pages = 0;
  const isExternal = (value) => /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value);

  const checkReference = async (file, value, { localOnly = false } = {}) => {
    if (!value || value.startsWith("#") || value.startsWith("data:")) return;
    if (isExternal(value)) {
      assert.ok(!localOnly, `${file}: runtime resource must be local: ${value}`);
      return;
    }
    assert.ok(!value.startsWith("/"), `${file}: use a relative URL: ${value}`);
    assert.ok(!value.includes("@assets"), `${file}: unresolved asset alias: ${value}`);
    const resolved = fileURLToPath(new URL(value, pathToFileURL(file)));
    const relative = path.relative(root, resolved);
    assert.ok(
      relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative),
      `${file}: reference leaves the delivery directory: ${value}`
    );
    assert.ok((await stat(resolved)).isFile(), `${file}: missing resource: ${value}`);
    checked++;
  };

  const walk = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(file);
        continue;
      }
      if (!/\.(?:html|css)$/.test(entry.name)) continue;
      const text = await readFile(file, "utf8");
      if (entry.name.endsWith(".html")) {
        pages++;
        assert.doesNotMatch(text, /<c-[a-z][a-z0-9-]*[\s/>]/, `${file}: unexpanded component`);
        assert.doesNotMatch(text, /<script[^>]*\btype=["']module["']/i, `${file}: module script`);
        for (const tag of text.matchAll(/<(?:script|link|img|iframe|a|video|source)\b[^>]*>/gi)) {
          const localOnly =
            /^<(?:script|img|video|source)\b/i.test(tag[0]) ||
            (/^<link\b/i.test(tag[0]) && /\brel=["']stylesheet["']/i.test(tag[0]));
          for (const attribute of tag[0].matchAll(/\b(?:src|href|poster)=["']([^"']*)["']/gi)) {
            await checkReference(file, attribute[1], { localOnly });
          }
        }
      } else {
        assert.doesNotMatch(text, /@import\s/i, `${file}: CSS import must be compiled`);
        for (const url of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
          await checkReference(file, url[1].trim(), { localOnly: true });
        }
      }
    }
  };

  await walk(root);
  assert.ok(pages > 0, "expected at least one HTML page");
  return { pages, references: checked };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await checkStaticSite(process.argv[2] ?? "dist");
  console.log(
    `checked static delivery: ${result.pages} pages, ${result.references} local references`
  );
}
