---
name: commit
description: 依本專案的輕量 git flow 規範完成 commit。分析已暫存的變更、判斷分支類型、產生 Conventional Commits 格式（描述用繁體中文）的 commit message 並送出。當使用者要求 commit、提交變更、或問「這些改動要怎麼 commit」時使用。
---

# /commit

依照 `docs/commit-workflow.md` 執行。該檔是 Codex 與 Claude Code 共用的單一事實來源，
本檔僅為 Claude Code 的進入點；若內容衝突，以 `docs/commit-workflow.md` 為準。

開始前先讀取 `docs/commit-workflow.md`，再依其步驟執行。

## 重點提醒

- 這個 repo **沒有 `develop` 分支**，不要執行 `git flow init`，feature 直接合併回 `main`。
- `demo` 分支是部署產出，不是開發分支。
- 只 commit 已暫存的內容；未追蹤檔案若不是本次工作產生的，保持原狀不要納入。
- commit message：type/scope 用英文，描述用繁體中文。
- 禁止 `--no-verify`。
- commit 後停住，**不要** push、merge 或 deploy，除非使用者明確要求。
