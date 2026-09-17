依照本專案 `docs/commit-workflow.md` 的規範，為目前已暫存的變更完成 commit。

先讀取 `docs/commit-workflow.md`，再依其步驟執行。該檔是 Codex 與 Claude Code 共用的
單一事實來源；若與本檔衝突，以 `docs/commit-workflow.md` 為準。

重點提醒：

- 這個 repo 沒有 `develop` 分支，不要執行 `git flow init`，feature 直接合併回 `main`。
- `demo` 分支是部署產出，不是開發分支。
- 只 commit 已暫存的內容；未追蹤檔案若不是本次工作產生的，保持原狀不要納入。
- commit message 用 Conventional Commits，type/scope 用英文，描述用繁體中文。
- 禁止 `--no-verify`。
- commit 後停住，不要 push、merge 或 deploy，除非使用者明確要求。
