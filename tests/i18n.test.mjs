import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildSite,
  discoverPageVariants,
  findPageByName,
  findPageByUrl,
  getPageOutputInfo,
  loadConfig,
  renderPage,
  stripCodeComments,
  stripHtmlComments,
} from "../scripts/builder-core.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");

async function makeI18nFixture(t, { en = {} } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "builder-i18n-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(path.join(root, "src/pages"), { recursive: true });
  await mkdir(path.join(root, "src/components/header"), { recursive: true });
  await mkdir(path.join(root, "src/i18n"), { recursive: true });
  await mkdir(path.join(root, "src/js"), { recursive: true });
  await mkdir(path.join(root, "src/assets/vendor"), { recursive: true });

  await writeFile(
    path.join(root, "builder.config.mjs"),
    `export default {
  i18n: {
    dir: "src/i18n",
    defaultLocale: "zh",
    locales: {
      zh: { htmlLang: "zh-Hant", dir: "" },
      en: { htmlLang: "en", dir: "en" },
    },
  },
};
`
  );

  await writeFile(
    path.join(root, "src/components/header/header.html"),
    `<!-- header 說明註解 -->
<nav>
  <a href="./about.html?tab=1#team" data-i18n="nav.about">關於</a>
  <a href="https://example.com/page.html">外部</a>
  <a data-lang-switch="zh">ZH</a>
  <a data-lang-switch="en">EN</a>
</nav>
`
  );

  await writeFile(
    path.join(root, "src/pages/index.html"),
    `<!doctype html>
<html lang="zh-Hant">
  <head><title>首頁</title></head>
  <body>
    <c-header />
    <h1 class="title" data-i18n="home.title">首頁 <span>舊內容</span></h1>
    <input type="text" placeholder="舊" data-i18n-attr="placeholder:form.name, aria-label:form.label" />
    <a href="./missing.html">不存在的頁面</a>
  </body>
</html>
`
  );

  await writeFile(
    path.join(root, "src/pages/about.html"),
    `<!doctype html>
<html lang="zh-Hant">
  <body><c-header /></body>
</html>
`
  );

  const zh = {
    "nav.about": "關於我們",
    "home.title": "歡迎 & 光臨",
    "form.name": "姓名",
    "form.label": "姓名欄位",
  };
  const enDictionary = {
    "nav.about": "About",
    "home.title": "Welcome <home>",
    "form.name": 'Your "name"',
    "form.label": "Name field",
    ...en,
  };
  for (const [locale, dictionary] of [
    ["zh", zh],
    ["en", enDictionary],
  ]) {
    await writeFile(
      path.join(root, `src/i18n/${locale}.mjs`),
      `export default ${JSON.stringify(dictionary, null, 2)};\n`
    );
  }

  return root;
}

test("expands every page into one variant per locale inside its locale folder", async (t) => {
  const root = await makeI18nFixture(t);
  const config = await loadConfig(root);
  const variants = await discoverPageVariants(config);

  assert.deepEqual(
    variants.map(({ pagePath, locale }) => getPageOutputInfo(pagePath, config, locale).pageName),
    ["about", "en-about", "index", "en-index"]
  );
  const enInfo = getPageOutputInfo(path.join(root, "src/pages/index.html"), config, "en");
  assert.equal(path.relative(root, enInfo.htmlOutputPath), path.join("dist", "en", "index.html"));
  assert.equal(enInfo.cssHref, "../assets/css/en-index.css");
});

test("renders the english variant without any i18n markers", async (t) => {
  const root = await makeI18nFixture(t);
  const config = await loadConfig(root);
  const { html } = await renderPage(path.join(root, "src/pages/index.html"), config, {
    locale: "en",
  });

  assert.match(html, /<html lang="en">/);
  assert.match(html, /<h1 class="title">Welcome &lt;home&gt;<\/h1>/);
  assert.match(
    html,
    /<input type="text" placeholder="Your &quot;name&quot;" aria-label="Name field" \/>/
  );
  assert.match(html, /<a href="\.\/about\.html\?tab=1#team">About<\/a>/);
  assert.match(html, /<a href="https:\/\/example\.com\/page\.html">/);
  assert.match(html, /<a href="\.\/missing\.html">/);
  assert.match(html, /<a href="\.\.\/index\.html">ZH<\/a>/);
  assert.match(html, /<a href="\.\/index\.html" aria-current="true">EN<\/a>/);
  assert.doesNotMatch(html, /data-i18n|data-lang-switch/);
});

test("renders the default locale with its own dictionary and untouched internal links", async (t) => {
  const root = await makeI18nFixture(t);
  const config = await loadConfig(root);
  const { html } = await renderPage(path.join(root, "src/pages/index.html"), config);

  assert.match(html, /<html lang="zh-Hant">/);
  assert.match(html, /<h1 class="title">歡迎 &amp; 光臨<\/h1>/);
  assert.match(html, /<a href="\.\/about\.html\?tab=1#team">關於我們<\/a>/);
  assert.match(html, /<a href="\.\/index\.html" aria-current="true">ZH<\/a>/);
  assert.match(html, /<a href="\.\/en\/index\.html">EN<\/a>/);
});

test("data-i18n-html inserts dictionary markup without escaping", async (t) => {
  const root = await makeI18nFixture(t, {
    en: { "team.bio": 'Lives by “<strong>give back more</strong>”\n<span lang="en">Leo</span>' },
  });
  const pagePath = path.join(root, "src/pages/team.html");
  await writeFile(
    pagePath,
    `<html lang="zh-Hant"><body><p class="bio" data-i18n-html="team.bio">舊 <b>內容</b></p></body></html>\n`
  );
  const config = await loadConfig(root);
  const { html } = await renderPage(pagePath, config, { locale: "en" });

  assert.match(
    html,
    /<p class="bio">Lives by “<strong>give back more<\/strong>”<br \/><span lang="en">Leo<\/span><\/p>/
  );
  assert.doesNotMatch(html, /data-i18n|舊|<b>/);
});

test("dictionary newlines become <br /> so formatted output keeps the line breaks", async (t) => {
  const root = await makeI18nFixture(t, {
    en: { "home.title": "First line, long enough to be wrapped by Prettier & co.\nSecond <line>" },
  });
  await symlink(
    path.join(projectRoot, "node_modules"),
    path.join(root, "node_modules"),
    "junction"
  );
  const config = await loadConfig(root);
  const { html } = await renderPage(path.join(root, "src/pages/index.html"), config, {
    locale: "en",
  });

  assert.match(
    html,
    /<h1 class="title">First line, long enough to be wrapped by Prettier &amp; co\.<br \/>Second &lt;line&gt;<\/h1>/
  );

  await buildSite(root);
  const built = await readFile(path.join(root, "dist/en/index.html"), "utf8");
  assert.match(built, /co\.<br \/>\s*Second\s+&lt;line&gt;/);
});

test("data-i18n-html rejects void elements and mixing with data-i18n", async (t) => {
  const root = await makeI18nFixture(t, { en: { "team.bio": "<strong>bio</strong>" } });
  const config = await loadConfig(root);
  const pagePath = path.join(root, "src/pages/team.html");
  const render = async (body) => {
    await writeFile(pagePath, `<html><body>${body}</body></html>\n`);
    return renderPage(pagePath, config, { locale: "en" });
  };

  await assert.rejects(
    () => render(`<img data-i18n-html="team.bio" />`),
    /data-i18n-html requires an element with an end tag \(<img>\)/
  );
  await assert.rejects(
    () => render(`<p data-i18n="team.bio" data-i18n-html="team.bio">x</p>`),
    /data-i18n and data-i18n-html cannot be used on the same element \(<p>\)/
  );
  await assert.rejects(
    () => render(`<p data-i18n-html="team.missing">x</p>`),
    /Missing i18n key "team\.missing" for locale "en"/
  );
});

test("throws when a dictionary is missing a key", async (t) => {
  const root = await makeI18nFixture(t, { en: { "home.title": undefined } });
  const config = await loadConfig(root);

  await assert.rejects(
    () => renderPage(path.join(root, "src/pages/index.html"), config, { locale: "en" }),
    /Missing i18n key "home\.title" for locale "en"/
  );
});

test("rejects source pages that collide with generated locale pages", async (t) => {
  const root = await makeI18nFixture(t);
  await mkdir(path.join(root, "src/pages/en"), { recursive: true });
  await writeFile(path.join(root, "src/pages/en/news.html"), "<p>news</p>\n");
  const config = await loadConfig(root);

  await assert.rejects(() => discoverPageVariants(config), /reserved locale folder "en"/);
});

test("dev lookups resolve locale variants by url and page name", async (t) => {
  const root = await makeI18nFixture(t);
  const config = await loadConfig(root);
  const indexPath = path.join(root, "src/pages/index.html");

  assert.deepEqual(await findPageByUrl("/en/index.html", config), {
    pagePath: indexPath,
    locale: "en",
  });
  assert.deepEqual(await findPageByUrl("/", config), { pagePath: indexPath, locale: "zh" });
  assert.deepEqual(await findPageByName("en-index", config), { pagePath: indexPath, locale: "en" });
  assert.deepEqual(await findPageByUrl("/en/", config), { pagePath: indexPath, locale: "en" });
  assert.equal(await findPageByUrl("/en/missing.html", config), null);
});

test("strips html comments but keeps conditional comments", () => {
  const html = `<div>
  <!-- 自己的註解 -->
  <p>內容</p><!-- 行尾註解 -->
  <!--[if IE]><p>IE</p><![endif]-->
</div>
`;

  assert.equal(
    stripHtmlComments(html),
    `<div>
  <p>內容</p>
  <!--[if IE]><p>IE</p><![endif]-->
</div>
`
  );
});

test("strips js and css comments but keeps license comments", async () => {
  const js = await stripCodeComments(
    `/*! Lib 1.0 | MIT */
// 自己的註解
const items = new WeakSet(); /* 行內註解 */
const label = "// 不是註解";
`,
    "js"
  );
  assert.match(js, /^\/\*! Lib 1\.0 \| MIT \*\//);
  assert.doesNotMatch(js, /自己的註解|行內註解|@__PURE__/);
  assert.match(js, /const label = "\/\/ 不是註解";/);
  assert.match(js, /const items = new WeakSet\(\);/);

  const css = await stripCodeComments(
    `/*! tailwindcss v4 | MIT License */
/* 組件: src/components/header/header.css */
.a { color: red; /* 說明 */ }
`,
    "css"
  );
  assert.match(css, /^\/\*! tailwindcss v4 \| MIT License \*\//);
  assert.doesNotMatch(css, /組件|說明/);
  assert.match(css, /color: red;/);
});

test("build writes locale pages without markers, own comments, or asset docs", async (t) => {
  const root = await makeI18nFixture(t);
  await symlink(
    path.join(projectRoot, "node_modules"),
    path.join(root, "node_modules"),
    "junction"
  );
  await writeFile(path.join(root, "src/assets/vendor/README.md"), "# notes\n");
  await writeFile(path.join(root, "src/assets/vendor/lib.min.js"), "/*! lib */var a=1;// keep\n");
  await writeFile(path.join(root, "src/js/index.js"), "// 頁面註解\nwindow.ready = true;\n");

  await buildSite(root);

  const enHtml = await readFile(path.join(root, "dist/en/index.html"), "utf8");
  assert.match(enHtml, /lang="en"/);
  assert.doesNotMatch(enHtml, /data-i18n|data-lang-switch|<!--/);

  const enJs = await readFile(path.join(root, "dist/assets/js/en-index.js"), "utf8");
  assert.equal(enJs, "window.ready = true;\n");

  const css = await readFile(path.join(root, "dist/assets/css/en-index.css"), "utf8");
  assert.doesNotMatch(css, /\/\*(?!!)/);

  await assert.rejects(() => access(path.join(root, "dist/assets/vendor/README.md")));
  assert.equal(
    await readFile(path.join(root, "dist/assets/vendor/lib.min.js"), "utf8"),
    "/*! lib */var a=1;// keep\n"
  );
});
