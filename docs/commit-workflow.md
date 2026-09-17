# Commit 流程規範

本檔是 Codex 與 Claude Code 共用的 commit 規範，也是 commit 技能的單一事實來源。
工具端的進入點（`.claude/skills/commit/SKILL.md`、`.agents/skills/commit/SKILL.md`）只做轉介，
實際流程一律以本檔為準。

## 本專案的分支現況

**這個 repo 沒有 `develop` 分支，也沒有執行過 `git flow init`。**

- `main`：唯一的開發主線。
- `demo`：`npm run deploy` 產生的部署輸出分支（orphan），**不是**開發分支，不要從它開分支或合併進來。

因此採用「輕量 git flow」：沿用 git flow 的分支命名慣例，但不建立 `develop`，
feature 完成後直接合併回 `main`。若日後真的要導入完整 git flow，需先與維護者確認，
不可由 AI 工具逕自執行 `git flow init`。

## 執行步驟

### 1. 盤點現況

```bash
git status --short
git diff --cached --stat
git diff --cached
```

- 暫存區為空就停下來，請使用者先 `git add`，不要自作主張 `git add -A`。
- **看到不是自己產生的變更（尤其是未追蹤檔案），一律保持原狀**，不要順手納入 commit。
  這些可能是其他工作者或其他 AI 工具進行中的工作。
- 掃過 `git diff --cached` 全文，確認沒有金鑰、token、密碼被夾帶進來。
  可疑檔名要打開看內容再決定。

### 2. 判斷分支類型

| 變更內容                                | 分支前綴   |
| --------------------------------------- | ---------- |
| 新功能、新頁面、新組件、設計 token 匯入 | `feature/` |
| 修復既有功能的 bug                      | `bugfix/`  |
| 緊急線上修復                            | `hotfix/`  |
| 版本發布準備                            | `release/` |
| 設定、CI/CD、文件、工具鏈               | `chore/`   |

分支名用 kebab-case 英文，例如 `feature/figma-color-tokens`、`chore/commit-skill`。

目前若在 `main` 上，先開分支再 commit：

```bash
git checkout -b feature/<slug>
```

### 3. 拆分 commit

一個 commit 只做一件事。若暫存區同時包含數個不相關的目的，
分成不同分支、不同 commit，各自可獨立合併。

### 4. 撰寫 commit message

格式為 Conventional Commits，**type 與 scope 用英文，描述用繁體中文**：

```
<type>(<scope>): <繁體中文摘要>

<繁體中文說明：改了什麼、為什麼>

Co-Authored-By: <模型名稱> <noreply@anthropic.com>
```

- type：`feat`、`fix`、`chore`、`docs`、`build`、`ci`、`refactor`、`test`
- scope：受影響的模組或資料夾，例如 `ui`、`build`、`deploy`、`config`
- 摘要控制在一行，不加句號
- 沿用 git 歷史既有風格，例如 `feat(build): 新增頁面輸出`、`chore(ui): 調整首頁`

### 5. 送出

```bash
git commit -F - <<'EOF'
...
EOF
```

- **禁止** `--no-verify`、`--no-gpg-sign` 或任何略過 hook 的參數。
  `.githooks/pre-commit` 會格式化 staged 檔並重新 stage，這是預期行為。
- hook 失敗時要找出原因並修正，不可繞過。

### 6. 交付

commit 完成後回報：異動檔案、驗證結果、後續合併建議。**到此為止。**

除非使用者明確要求，**不得**執行：

- `git push`（含 `--force`）
- `git merge` 進 `main`
- `npm run deploy`
- `git rebase`
- 刪除任何分支

合併指令只提供給使用者參考，由使用者自行決定時機：

```bash
git checkout main && git merge --no-ff feature/<slug>
```

## 送 PR 前

執行 `npm run format:check` 與 `npm run check`，並在 PR 說明中列出變更動機、
驗證指令與受影響的輸出路徑；視覺變更附上前後截圖。
