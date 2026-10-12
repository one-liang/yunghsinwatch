import path from "node:path";

// demo 分支 README 的頁面分類表：順序即 README 的呈現順序。
// label 為顯示名稱，route 對應 dist/ 內的相對路徑；沒有 label 的群組會攤平成單層項目。
export const DEMO_PAGE_GROUPS = [
  { items: [{ route: "index.html", label: "首頁" }] },
  {
    label: "時計系列",
    items: [
      { route: "collection.html", label: "時計系列" },
      { route: "collection-series.html", label: "單系列列表" },
      { route: "collection-model.html", label: "單錶介紹頁" },
    ],
  },
  {
    label: "品牌專賣店",
    items: [
      { route: "boutique.html", label: "精品店" },
      { route: "team.html", label: "我們的團隊" },
      { route: "about.html", label: "關於永新" },
    ],
  },
  { items: [{ route: "service.html", label: "維修保養" }] },
  { items: [{ route: "contact.html", label: "聯絡我們" }] },
  { items: [{ route: "terms.html", label: "服務條款" }] },
  { items: [{ route: "privacy.html", label: "隱私權政策" }] },
];

const UNCLASSIFIED_GROUP_LABEL = "其他";

function toRoute(page) {
  return page.pageRelative.split(path.sep).join("/");
}

function toHref(route, baseUrl) {
  return baseUrl ? `${baseUrl}${route}` : `./${route}`;
}

// 從 git 遠端網址推導 GitHub Pages base URL；不是 GitHub 網址時回傳 null，README 改用相對連結。
// deploy 會對每個 remote 各自推導，README 才會連到該 repo 自己的 Pages。
export function pagesBaseUrlFromRemote(remoteUrl) {
  const match = remoteUrl.trim().match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/i);
  if (!match) return null;
  const [, owner, repo] = match;
  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return `https://${owner}.github.io/`;
  }
  return `https://${owner}.github.io/${repo}/`;
}

// 產生 demo 分支的 README（決定性內容，維持無變更則跳過的 idempotency）。
// 傳入 locale 時只列該語系的頁面：英文版由各頁的語系切換進入，不另外列在 README。
export function renderReadme(builtPages, baseUrl, { locale } = {}) {
  const listedPages =
    locale === undefined ? builtPages : builtPages.filter((page) => page.locale === locale);
  const builtRoutes = new Set(listedPages.map(toRoute));
  const classifiedRoutes = new Set();
  const groups = [];

  for (const group of DEMO_PAGE_GROUPS) {
    // 只列出這次 build 真的有產生的頁面，避免 README 出現死連結
    const items = group.items.filter((item) => builtRoutes.has(item.route));
    for (const item of items) classifiedRoutes.add(item.route);
    if (items.length > 0) groups.push({ label: group.label, items });
  }

  // 分類表沒登記到的頁面集中列在最後，避免新頁面在 README 中靜默消失
  const unclassifiedItems = [...builtRoutes]
    .filter((route) => !classifiedRoutes.has(route))
    .sort()
    .map((route) => ({ route, label: route }));
  if (unclassifiedItems.length > 0) {
    groups.push({ label: UNCLASSIFIED_GROUP_LABEL, items: unclassifiedItems });
  }

  const lines = ["# 頁面 demo 連結", ""];
  let index = 0;

  for (const group of groups) {
    if (group.label) {
      index += 1;
      lines.push(`${index}. ${group.label}`);
      group.items.forEach((item, itemIndex) => {
        lines.push(`   ${itemIndex + 1}. [${item.label}](${toHref(item.route, baseUrl)})`);
      });
      continue;
    }

    for (const item of group.items) {
      index += 1;
      lines.push(`${index}. [${item.label}](${toHref(item.route, baseUrl)})`);
    }
  }

  return `${lines.join("\n")}\n`;
}
