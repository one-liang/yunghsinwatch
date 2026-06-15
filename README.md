# Yunghsinwatch

這是一個以 Vite + Tailwind CSS v4 製作的靜態 HTML 範本。它支援類 Vue 的自閉合組件標籤，例如 `<c-header />`，並在開發與建置時自動組合頁面 HTML、Tailwind CSS、組件 CSS、頁面 CSS、組件 JS 與頁面 JS。

## 環境需求

- Node.js 18 以上
- npm

安裝依賴：

```bash
npm install
```

## 常用指令

```bash
npm run dev
npm run build
npm run preview
npm run deploy
npm run check
```

- `npm run dev`：啟動 Vite 開發伺服器，網址是 `http://localhost:3000/`。
- `npm run build`：建置靜態網站到 `dist/`。
- `npm run preview`：啟動 `dist/` 的靜態預覽伺服器，預設是 `http://127.0.0.1:4173/`，可用 `PORT` 與 `HOST` 環境變數覆寫。
- `npm run deploy`：重新建置，並把 `dist/` 內容發佈到 `demo` 分支供 GitHub Pages demo（見下方「部署到 GitHub Pages」）。
- `npm run check`：執行 node 測試、建置網站，並檢查 `dist/` 輸出是否符合基本規則。

## 專案結構

```text
src/pages/              頁面 HTML；每個 .html 都會輸出成 dist 裡的頁面
src/components/         HTML 組件；資料夾名稱使用 kebab-case
src/js/                 頁面 JS；路徑會對應 src/pages 裡的頁面
src/js/component/       組件 JS；檔名會對應 component slug
src/styles/tailwind.css Tailwind v4 CSS-first 入口
src/assets/             圖片、字體與其他靜態資源
scripts/                自製 builder 與開發工具
tests/                  builder 行為測試
dist/                   建置輸出，已由 .gitignore 排除
```

## 頁面

新增頁面時，只要在 `src/pages` 建立 HTML 檔即可：

```text
src/pages/contact.html
```

對應輸出：

```text
dist/contact.html
```

若頁面需要 JavaScript，可新增對應檔案：

```text
src/pages/contact.html -> src/js/contact.js
```

目前建議優先把樣式寫成 Tailwind utility classes。頁面 sidecar CSS 只保留給 Tailwind class 不適合處理的情境，例如複雜 selector、keyframes、第三方樣式覆寫，或需要 builder 重寫 `url(...)` 資源路徑的 CSS。

## 組件

頁面可以使用 `c-` 前綴的 kebab-case 自閉合組件標籤：

```html
<c-header /> <c-footer />
```

`<c-header />` 會對應到：

```text
src/components/header/header.html
src/components/header/header.css
src/js/component/header.js
```

`<c-footer />` 會對應到：

```text
src/components/footer/footer.html
src/components/footer/footer.css
src/js/component/footer.js
```

`header.css`、`footer.css` 與 component JS 都是選用檔案；不存在時 builder 會略過。多字組件用 kebab-case，例如 `<c-site-banner />` 會尋找 `src/components/site-banner/site-banner.html`（slug 即標籤去掉 `c-` 前綴）。

組件標籤刻意採 `c-` 前綴的 custom-element 寫法：連字號讓 Prettier 不會把標籤小寫化，來源 HTML 因此能安全格式化。語法只支援純自閉合標籤，不支援 props 或 slots：

```html
<c-header />
```

## CSS 管理方式

此專案使用 Tailwind CSS v4 的 CSS-first 寫法：

```css
@import "tailwindcss" source(none);

@theme {
  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
}
```

管理原則：

- 全站設計 token 放在 `src/styles/tailwind.css` 的 `@theme`。
- 共用且有語意的短樣式可用 Tailwind v4 的 `@utility` 定義。
- 頁面與組件優先使用 Tailwind utility classes。
- sidecar CSS 只作為例外工具，不作為主要切版方式。
- builder 會依每個頁面實際渲染出的 HTML 與 JS 注入 Tailwind source，因此每頁只產生該頁需要的 utility CSS。

## JavaScript 管理方式

頁面 JS 放在 `src/js`，路徑對應 `src/pages`：

```text
src/pages/index.html        -> src/js/index.js
src/pages/about.html        -> src/js/about.js
src/pages/news/detail.html  -> src/js/news/detail.js
```

組件 JS 放在 `src/js/component`：

```text
<c-header /> -> src/js/component/header.js
<c-footer /> -> src/js/component/footer.js
```

如果頁面或組件沒有互動需求，就不要建立 JS 檔。空 JS 或只設定未被使用的 dataset 會讓輸出多出不必要的 script。

## scripts 目錄說明

- `scripts/dev.mjs`：建立 Vite dev server，實際 host、port 與 watch 設定來自 `vite.config.js`。
- `scripts/build.mjs`：呼叫 builder 核心，將 `src/pages/**/*.html` 建置到 `dist/`。
- `scripts/preview.mjs`：用 Node.js HTTP server 預覽已建置的 `dist/` 靜態檔案。
- `scripts/deploy.mjs`：重新建置後，用 git worktree 把 `dist/` 內容攤平發佈到 `demo` 分支並 push（供 GitHub Pages）。可用 `DEPLOY_BRANCH`、`DEPLOY_REMOTE` 環境變數覆寫目標分支與遠端。
- `scripts/check.mjs`：檢查 `dist/` 是否有基本輸出品質，例如頁面有載入 CSS、沒有殘留原始 component tag、輸出維持可讀換行。
- `scripts/builder-core.mjs`：builder 核心，負責讀取設定、尋找頁面、渲染組件、收集 CSS/JS、編譯 Tailwind、改寫 asset URL、輸出 `dist/`。
- `scripts/vite-builder-plugin.mjs`：Vite 開發模式 plugin，提供 dev middleware、即時渲染頁面、提供虛擬 CSS/JS 路徑，並在來源檔變更時觸發 full reload。

## 設定檔

- `builder.config.mjs`：設定頁面來源、組件目錄、JS 目錄、資源目錄、輸出目錄與組件標籤模式。
- `vite.config.js`：設定 Vite 開發伺服器，目前固定使用 `localhost:3000` 並啟用 `strictPort`。

## 建置輸出

執行：

```bash
npm run build
```

會產生：

```text
dist/index.html
dist/about.html
dist/assets/css/*.css
dist/assets/js/*.js
dist/assets/images/*
dist/assets/fonts/*
```

`dist/` 可以直接部署到靜態主機，也可以用 `npm run preview` 在本機檢查建置結果。輸出的所有路徑都是相對路徑（`./assets/...`、`./about.html`），因此可以直接用瀏覽器打開 `dist/index.html` 瀏覽，也能放在任意子路徑下提供服務，不需要設定 base path。

## 部署到 GitHub Pages

`dist/` 在 `main` 上是 gitignored 的產生物，發佈時不直接 commit 到 `main`，而是透過 `demo` 分支：

```bash
npm run deploy
```

這個指令會：

1. 重新跑一次 build 產生最新的 `dist/`。
2. 用 git worktree 切換到 `demo` 分支（不存在時自動建立 orphan 分支），把 `dist/` 內容**攤平**到分支根目錄，並加上 `.nojekyll`（避免 GitHub Pages 跑 Jekyll）。
3. commit 後 push 到 `origin/demo`，最後清理 worktree（不影響你目前在 `main` 的工作樹）。

首次部署後，到 GitHub repo 設定一次 Pages 來源即可：

**Settings → Pages → Build and deployment → Source: `Deploy from a branch` → Branch: `demo` / `(root)`**

之後 demo 網址為 `https://<account>.github.io/<repo>/`（本專案為 `https://one-liang.github.io/yunghsinwatch/`）。因為輸出全為相對路徑，子路徑下也能正確載入頁面、CSS、圖片與頁面間連結。日後要更新 demo，只要再跑一次 `npm run deploy`。
