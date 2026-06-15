# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用指令

```bash
npm run dev      # Vite 開發伺服器，網址 http://localhost:3000/（strictPort）
npm run build    # 建置靜態網站到 dist/
npm run preview  # 用 Node HTTP 預覽 dist/（預設 http://127.0.0.1:4173/，可用 PORT/HOST 覆寫）
npm run check    # 執行測試、建置，再驗證 dist/ 輸出
```

用 Node 內建測試執行器跑單一測試：

```bash
node --test tests/builder.test.mjs
node --test --test-name-pattern "<substring>" tests/builder.test.mjs
```

`npm run check` 是完整的把關流程：先執行 `node --test tests/*.test.mjs`，接著 `build.mjs`，最後 `check.mjs`（驗證 `dist/` 中每個頁面都有載入 CSS、不含殘留的原始 component tag，並維持可讀換行）。

## 架構

這是一套**自製的靜態網站 builder**，而非標準 Vite 專案。Vite 僅作為開發伺服器的宿主（`appType: "custom"`）；真正的邏輯位於 `scripts/builder-core.mjs`，並由開發模式 middleware 與正式建置共用。各個輕量進入點腳本（`dev.mjs`、`build.mjs`、`preview.mjs`、`check.mjs`）只是呼叫這個核心。

**單一事實來源（Single source of truth）：** `scripts/builder-core.mjs` 匯出所有重要函式（`buildSite`、`renderPage`、`renderDevHtml/Css/Js`、`createBuilderMiddleware`、各種 URL 改寫器等）。開發模式（`vite-builder-plugin.mjs`）與建置模式都透過同一條 `renderPage` → `injectPageAssets` 路徑產生相同的 HTML；兩者只差在 `options.htmlAssetMode`（`"dev"` 與 `"build"`），用來控制 asset URL 如何改寫。要更改渲染行為時，請改在核心，確保兩種模式維持一致。

**頁面探索與輸出命名：** 頁面來源為 `src/pages/**/*.html`。輸出路徑會對應來源路徑，但推導出的 `pageName` 會用 `-` 把巢狀路徑*壓平*：`src/pages/news/detail.html` → `pageName` 為 `news-detail` → `dist/assets/css/news-detail.css` 與 `.../js/news-detail.js`。HTML 本身仍保留巢狀位置（`dist/news/detail.html`）。

**組件模型：** HTML 中的 PascalCase 自閉合標籤會被就地展開。`<SiteBanner />` → slug `site-banner`（透過 `componentNameToSlug`）→ `src/components/site-banner/site-banner.html`，並可選用同目錄的 sidecar `site-banner.css` 以及 `src/js/component/site-banner.js`。組件會遞迴渲染（組件 HTML 內可再包含其他 component tag）。builder 強制的限制：
- 只支援純自閉合標籤。帶屬性或內容的標籤（`<Header class="x">`、`<Footer>...`）會丟出錯誤（`assertNoUnsupportedComponentTags`）。不支援 props 或 slots。
- 循環引用會丟出錯誤（透過 `componentStack` 追蹤）。
- 缺少組件 HTML 會丟出錯誤；缺少 CSS/JS 則直接略過。
- 每個組件的 CSS/JS 每頁最多只收集一次（透過 `seenCssFiles`/`seenJsFiles` 去重）。

**每頁的 asset 打包：** 每個頁面會依序串接所有被引用的組件 CSS、接著該頁的 sidecar CSS，合併成單一檔案 `assets/css/<pageName>.css`；JS 同理，先組件 JS、後頁面 JS，合併成 `assets/js/<pageName>.js`。頁面 JS 位於 `src/js/<page-path>.js`（對應 `src/pages`）；組件 JS 位於 `src/js/component/<slug>.js`。**只有在串接後的內容 trim 後非空時，JS 才會被輸出並注入 `<script>`** —— 因此空的或未使用的 JS 檔不會留下 script tag。

**每頁的 Tailwind 編譯（關鍵細節）：** Tailwind v4 會在 `compileTailwindCss` 中*為每個頁面分別編譯*。builder 會把該頁渲染後的 HTML *加上其所有 JS 來源*寫入 `.cache/tailwind/<pageName>/source.html`，產生一份強制 `@import "tailwindcss" source(none)` 的 input CSS，並用單一 `@source` 指向該檔案，接著呼叫 Tailwind CLI。結果是每頁的 CSS 只包含該頁實際用到的 utility。`src/styles/tailwind.css` 進入點（`@theme` 中的設計 token、共用的 `@utility` 定義）會被讀入，並在編譯前把其中的 `@import "tailwindcss"` 改寫為 `source(none)`。Tailwind CLI 會從 `node_modules/@tailwindcss/cli` 解析，找不到時退回 `npx @tailwindcss/cli`。

**Asset URL 改寫：** HTML 屬性（`src`/`href`/`poster`）與 CSS 的 `url(...)` 都會被改寫成指向 `dist/assets/` 下複製過去的 asset。只有解析後落在 `assetsDir`（`src/assets`）*內部*的 URL 才會被改寫；外部 URL、錨點與協定相對 URL 不予更動。引用 asset 可用 `@assets/...`、`/assets/...`，或相對於來源檔案的路徑。query/hash 後綴會被保留。

**開發伺服器流程：** `createBuilderMiddleware` 會即時渲染頁面提供服務。它會公開虛擬 asset 路由 `/@builder/assets/css/<pageName>.css` 與 `/@builder/assets/js/<pageName>.js`（每次請求即時編譯），並從 `src/assets` 在 `/assets/...` 提供原始檔案。來源變更會觸發 full reload（無 HMR）。

## 設定檔

- `builder.config.mjs` —— 來源 glob 與各目錄位置（`pages`、`componentsDir`、`pageJsDir`、`componentJsDir`、`assetsDir`、`outDir`、`componentTagPattern`）。`loadConfig` 會套用預設值，因此設定鍵都是選用的。
- `vite.config.js` —— 僅供開發伺服器使用（固定 `localhost:3000`、`strictPort`，忽略 `.cache/` 與 `dist/`）。

## 慣例

- HTML 中優先使用 Tailwind utility classes。Sidecar CSS（頁面或組件）是處理 utility 無法表達情境的逃生口 —— 複雜 selector、keyframes、第三方樣式覆寫，或需要 `url(...)` asset 改寫的 CSS。
- 全站設計 token 放在 `src/styles/tailwind.css` 的 `@theme`，共用且有語意的簡寫放在 `@utility`。
- 組件目錄名稱用 kebab-case；標籤用 PascalCase。
- `dist/` 與 `.cache/` 為產生物且已被 gitignore —— 請勿手動編輯。
