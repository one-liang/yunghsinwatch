---
name: commit
description: 依本專案的輕量 Git Flow 規範分析或提交已暫存的變更。當使用者要求 commit、提交變更、產生 commit message，或詢問目前變更應如何提交時使用。
---

# Commit

先讀取專案根目錄的 `docs/commit-workflow.md`，並以該檔作為 Codex 與 Claude Code
共用的單一事實來源；若本檔與其衝突，以 `docs/commit-workflow.md` 為準。

依使用者的要求決定操作範圍：

- 使用者明確要求執行 commit 時，依共用流程完成提交。
- 使用者只要求建議、分析或 commit message 時，只提供結果，不建立分支或提交。

只處理已暫存的內容，保留無關的工作區變更與未追蹤檔案。除非使用者明確要求，
完成 commit 後不得 push、merge、rebase、deploy 或刪除分支。
