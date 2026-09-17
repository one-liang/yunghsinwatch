# Repository Guidelines

## 專案結構與模組組織

本專案是以 Vite 與 Tailwind CSS v4 製作的靜態網站建置器。頁面放在 `src/pages/`，共用 HTML 組件放在 `src/components/<slug>/`，頁面與組件腳本分別位於 `src/js/`、`src/js/component/`。全站 Tailwind token 與 utility 集中於 `src/styles/tailwind.css`，圖片與字型置於 `src/assets/`。建置核心、開發伺服器與部署工具在 `scripts/`；測試在 `tests/`。`dist/` 與 `.cache/` 是產生物，請勿手動編輯或提交。

## 建置、測試與開發指令

- `npm install`：安裝依賴並啟用 `.githooks/pre-commit`。
- `npm run dev`：啟動 `http://localhost:3000/` 開發伺服器。
- `npm run build`：將 `src/pages/**/*.html` 建置至 `dist/`。
- `npm run preview`：在本機預覽建置結果。
- `npm run check`：依序執行測試、建置及輸出品質檢查；送出 PR 前應執行。
- `npm run format:check`：確認 Prettier 格式；使用 `npm run format` 自動修正。

## 程式風格與命名

遵循 `.prettierrc.json`：2 空格縮排、雙引號、分號、100 字元行寬及 LF 換行。優先使用 Tailwind utility；全域 token 寫入 `@theme`，sidecar CSS 僅用於複雜 selector、動畫或資源 URL。組件採 kebab-case，例如 `src/components/site-banner/site-banner.html`，並以純自閉合 `<c-site-banner />` 引用；不支援 props 或 slots。頁面腳本路徑須對應頁面，例如 `src/pages/news/detail.html` 對應 `src/js/news/detail.js`。

## 測試準則

測試使用 `node:test` 與 `node:assert`，檔名遵循 `tests/*.test.mjs`。修改 `scripts/builder-core.mjs`、URL 改寫或組件展開行為時，須新增成功與錯誤案例。可用 `node --test tests/builder.test.mjs` 執行單檔測試；目前沒有明訂覆蓋率門檻。

## Commit 與 Pull Request

沿用 Git 歷史中的 Conventional Commits，例如 `feat(build): 新增頁面輸出`、`chore(ui): 調整首頁` 或 `docs: 更新說明`。每個 commit 聚焦單一目的。PR 應說明變更動機、驗證指令與相關 issue；視覺變更附前後截圖，部署或建置變更則列出受影響的輸出路徑。不要把 `dist/` 納入主分支；`npm run deploy` 會發佈至 `demo` 分支。

## AI 工具協作

`AGENTS.md` 是 Codex 與 Claude Code 的共用規範；`CLAUDE.md` 必須以 `@AGENTS.md` 匯入，再補充工具專用內容。開始修改前先執行 `git status --short`，保留其他工作者的既有變更。平行開發時，每個工具使用獨立 branch 與 git worktree，並避免同時修改相同檔案。交接前執行 `npm run format:check` 與 `npm run check`，清楚列出異動檔案、驗證結果及未完成事項。除非使用者明確要求，AI 工具不得執行 `npm run deploy`、push、rebase 或刪除分支。
