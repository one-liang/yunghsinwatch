import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { renderReadme } from "../scripts/demo-readme.mjs";

const BASE_URL = "https://one-liang.github.io/yunghsinwatch/";

const ALL_ROUTES = [
  "index.html",
  "collection.html",
  "collection-series.html",
  "collection-model.html",
  "boutique.html",
  "team.html",
  "about.html",
  "service.html",
  "contact.html",
  "terms.html",
  "privacy.html",
];

function toPages(routes) {
  return routes.map((route) => ({ pageRelative: route.split("/").join(path.sep) }));
}

test("renderReadme 依分類輸出巢狀清單與 demo 網址", () => {
  // 故意用字母序傳入，確認輸出順序來自分類表而非 build 順序
  const readme = renderReadme(toPages([...ALL_ROUTES].sort()), BASE_URL);

  assert.equal(
    readme,
    [
      "# 頁面 demo 連結",
      "",
      `1. [首頁](${BASE_URL}index.html)`,
      "2. 時計系列",
      `   1. [時計系列](${BASE_URL}collection.html)`,
      `   2. [單系列列表](${BASE_URL}collection-series.html)`,
      `   3. [單錶介紹頁](${BASE_URL}collection-model.html)`,
      "3. 品牌專賣店",
      `   1. [精品店](${BASE_URL}boutique.html)`,
      `   2. [我們的團隊](${BASE_URL}team.html)`,
      `   3. [關於永新](${BASE_URL}about.html)`,
      `4. [維修保養](${BASE_URL}service.html)`,
      `5. [聯絡我們](${BASE_URL}contact.html)`,
      `6. [服務條款](${BASE_URL}terms.html)`,
      `7. [隱私權政策](${BASE_URL}privacy.html)`,
      "",
    ].join("\n")
  );
});

test("renderReadme 在沒有 baseUrl 時退回相對連結", () => {
  const readme = renderReadme(toPages(["index.html", "service.html"]), null);

  assert.match(readme, /^1\. \[首頁\]\(\.\/index\.html\)$/m);
  assert.match(readme, /^2\. \[維修保養\]\(\.\/service\.html\)$/m);
});

test("renderReadme 把未登記分類的頁面列在「其他」，並以 / 分隔巢狀路徑", () => {
  const readme = renderReadme(toPages(["index.html", "news/detail.html", "faq.html"]), BASE_URL);

  assert.equal(
    readme,
    [
      "# 頁面 demo 連結",
      "",
      `1. [首頁](${BASE_URL}index.html)`,
      "2. 其他",
      `   1. [faq.html](${BASE_URL}faq.html)`,
      `   2. [news/detail.html](${BASE_URL}news/detail.html)`,
      "",
    ].join("\n")
  );
});

test("renderReadme 略過這次 build 沒有產生的頁面", () => {
  const readme = renderReadme(toPages(["index.html", "collection.html"]), BASE_URL);

  assert.match(readme, /^2\. 時計系列$/m);
  assert.match(readme, /^ {3}1\. \[時計系列\]/m);
  assert.doesNotMatch(readme, /單系列列表|單錶介紹頁|精品店|其他/);
});
