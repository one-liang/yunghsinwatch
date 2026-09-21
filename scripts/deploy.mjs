import { execFileSync } from "node:child_process";
import { cp, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildSite, loadConfig } from "./builder-core.mjs";
import { renderReadme } from "./demo-readme.mjs";

const rootDir = process.cwd();
const branch = process.env.DEPLOY_BRANCH ?? "demo";
const remote = process.env.DEPLOY_REMOTE ?? "origin";
// 額外鏡像推送的 remote（預設 yunghsin → for-demo）。
// 推送前會檢查 remote 是否存在，缺少時自動略過，因此乾淨 clone 上是安全的 no-op。
const mirrorRemotes = (process.env.DEPLOY_MIRROR_REMOTES ?? "yunghsin")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const worktreeDir = path.join(rootDir, ".cache", "deploy-worktree");

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: rootDir,
    stdio: options.capture ? ["ignore", "pipe", "ignore"] : "inherit",
    encoding: "utf8",
    shell: false,
  });
}

function gitQuiet(args) {
  try {
    git(args, { capture: true });
    return true;
  } catch {
    return false;
  }
}

async function cleanupWorktree() {
  gitQuiet(["worktree", "remove", "--force", worktreeDir]);
  await rm(worktreeDir, { recursive: true, force: true });
}

function branchExists() {
  // 本地或遠端有 demo 分支都算存在
  if (gitQuiet(["show-ref", "--verify", "--quiet", `refs/heads/${branch}`])) return true;
  gitQuiet(["fetch", remote, branch]);
  return gitQuiet(["show-ref", "--verify", "--quiet", `refs/remotes/${remote}/${branch}`]);
}

// 從 git 遠端網址推導 GitHub Pages base URL，解析失敗時退回相對連結
function pagesBaseUrl() {
  let url;
  try {
    url = git(["config", "--get", `remote.${remote}.url`], { capture: true }).trim();
  } catch {
    return null;
  }
  const match = url.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/i);
  if (!match) return null;
  const [, owner, repo] = match;
  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return `https://${owner}.github.io/`;
  }
  return `https://${owner}.github.io/${repo}/`;
}

// 1. 重新建置 dist/
console.log("building site...");
const { pages } = await buildSite(rootDir);
const config = await loadConfig(rootDir);
const outDir = config.outDir;

// 2. 清掉殘留 worktree（上一次中斷留下的）
await cleanupWorktree();

// 3. 建立指向 demo 分支的 worktree
if (branchExists()) {
  git(["worktree", "add", worktreeDir, branch]);
} else {
  console.log(`creating orphan branch "${branch}"...`);
  // git < 2.42 沒有 `worktree add --orphan`，改用 detached worktree + checkout --orphan
  git(["worktree", "add", "--detach", worktreeDir]);
  execFileSync("git", ["checkout", "--orphan", branch], {
    cwd: worktreeDir,
    stdio: "inherit",
    shell: false,
  });
}

try {
  // 4. 清空 worktree（保留 .git），再把 dist 內容攤平複製到 root
  for (const entry of await readdir(worktreeDir)) {
    if (entry === ".git") continue;
    await rm(path.join(worktreeDir, entry), { recursive: true, force: true });
  }
  await cp(outDir, worktreeDir, { recursive: true });

  // 5. 避免 GitHub Pages 跑 Jekyll
  await writeFile(path.join(worktreeDir, ".nojekyll"), "");

  // 5b. 產生列出各頁 demo 連結的 README.md
  await writeFile(path.join(worktreeDir, "README.md"), renderReadme(pages, pagesBaseUrl()));

  // 6. commit（內容有變更才產生新 commit）
  execFileSync("git", ["add", "-A"], { cwd: worktreeDir, stdio: "inherit", shell: false });
  const status = execFileSync("git", ["status", "--porcelain"], {
    cwd: worktreeDir,
    encoding: "utf8",
    shell: false,
  });

  if (status.trim() === "") {
    console.log("demo 內容無變更，沿用現有 commit。");
  } else {
    const message = `deploy: ${new Date().toISOString()}`;
    execFileSync("git", ["commit", "-m", message], {
      cwd: worktreeDir,
      stdio: "inherit",
      shell: false,
    });
    console.log("committed demo update.");
  }

  // 7. 推送到 origin 與所有 mirror（每次都同步；已最新時 git 回報 up-to-date，為安全 no-op，
  //    因此即使 origin 沒新 commit、落後的 mirror 也會被補上）
  const targets = [remote, ...mirrorRemotes.filter((mirror) => mirror !== remote)];
  for (const target of targets) {
    if (!gitQuiet(["remote", "get-url", target])) {
      console.log(`remote "${target}" not configured, skipped.`);
      continue;
    }
    execFileSync("git", ["push", "-u", target, branch], {
      cwd: worktreeDir,
      stdio: "inherit",
      shell: false,
    });
    console.log(`pushed to ${target}/${branch}.`);
  }
} finally {
  // 8. 清理 worktree
  await cleanupWorktree();
}
