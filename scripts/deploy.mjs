import { execFileSync } from "node:child_process";
import { cp, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildSite, loadConfig } from "./builder-core.mjs";

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

// 1. 重新建置 dist/
console.log("building site...");
await buildSite(rootDir);
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

  // 6. commit + push（無變更則跳過）
  execFileSync("git", ["add", "-A"], { cwd: worktreeDir, stdio: "inherit", shell: false });
  const status = execFileSync("git", ["status", "--porcelain"], {
    cwd: worktreeDir,
    encoding: "utf8",
    shell: false,
  });

  if (status.trim() === "") {
    console.log("no changes to deploy.");
  } else {
    const message = `deploy: ${new Date().toISOString()}`;
    execFileSync("git", ["commit", "-m", message], {
      cwd: worktreeDir,
      stdio: "inherit",
      shell: false,
    });
    execFileSync("git", ["push", "-u", remote, branch], {
      cwd: worktreeDir,
      stdio: "inherit",
      shell: false,
    });
    console.log(`deployed to ${remote}/${branch}.`);

    // 鏡像推送同一份 demo 分支到額外 remote（如 for-demo）
    for (const mirror of mirrorRemotes) {
      if (mirror === remote) continue;
      if (!gitQuiet(["remote", "get-url", mirror])) {
        console.log(`mirror remote "${mirror}" not configured, skipped.`);
        continue;
      }
      execFileSync("git", ["push", "-u", mirror, branch], {
        cwd: worktreeDir,
        stdio: "inherit",
        shell: false,
      });
      console.log(`mirrored to ${mirror}/${branch}.`);
    }
  }
} finally {
  // 7. 清理 worktree
  await cleanupWorktree();
}
