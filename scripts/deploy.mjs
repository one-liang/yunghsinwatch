import { execFileSync } from "node:child_process";
import { cp, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildSite } from "./builder-core.mjs";
import { commitWithReadme } from "./deploy-mirror.mjs";
import { pagesBaseUrlFromRemote, renderReadme } from "./demo-readme.mjs";

const rootDir = process.cwd();
const branch = process.env.DEPLOY_BRANCH ?? "demo";
const remote = process.env.DEPLOY_REMOTE ?? "origin";
// 額外鏡像推送的 remote（預設 yunghsin → for-demo）。
// 推送前會檢查 remote 是否存在，缺少時自動略過，因此乾淨 clone 上是安全的 no-op。
// 每個 remote 的 demo README 都連到自己的 GitHub Pages，所以鏡像推的是另一個只換掉 README 的 commit。
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

// 從該 remote 的網址推導 GitHub Pages base URL，解析失敗時退回相對連結
function pagesBaseUrl(target) {
  let url;
  try {
    url = git(["config", "--get", `remote.${target}.url`], { capture: true });
  } catch {
    return null;
  }
  return pagesBaseUrlFromRemote(url);
}

// 鏡像 remote 上 demo 分支目前的 commit（並抓回本機）；分支還不存在時回傳 null
function remoteBranchTip(target) {
  const ref = `refs/heads/${branch}`;
  const line = git(["ls-remote", target, ref], { capture: true })
    .split("\n")
    .find((entry) => entry.endsWith(`\t${ref}`));
  if (!line) return null;
  git(["fetch", target, branch], { capture: true });
  return line.split("\t")[0];
}

// 1. 重新建置 dist/
console.log("building site...");
const { config, pages } = await buildSite(rootDir);
const outDir = config.outDir;
// README 只列預設語系的頁面
const readmeLocale = config.i18n ? config.i18n.defaultLocale : undefined;
const readmeFor = (target) => renderReadme(pages, pagesBaseUrl(target), { locale: readmeLocale });

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

  // 5b. 產生列出各頁 demo 連結的 README.md（連到 origin 的 Pages，鏡像在步驟 8 換成自己的）
  await writeFile(path.join(worktreeDir, "README.md"), readmeFor(remote));

  // 6. commit（內容有變更才產生新 commit）
  execFileSync("git", ["add", "-A"], { cwd: worktreeDir, stdio: "inherit", shell: false });
  const status = execFileSync("git", ["status", "--porcelain"], {
    cwd: worktreeDir,
    encoding: "utf8",
    shell: false,
  });

  const message = `deploy: ${new Date().toISOString()}`;
  if (status.trim() === "") {
    console.log("demo 內容無變更，沿用現有 commit。");
  } else {
    execFileSync("git", ["commit", "-m", message], {
      cwd: worktreeDir,
      stdio: "inherit",
      shell: false,
    });
    console.log("committed demo update.");
  }

  // 7. 推送到 origin（已最新時 git 回報 up-to-date，為安全 no-op）
  if (gitQuiet(["remote", "get-url", remote])) {
    execFileSync("git", ["push", "-u", remote, branch], {
      cwd: worktreeDir,
      stdio: "inherit",
      shell: false,
    });
    console.log(`pushed to ${remote}/${branch}.`);
  } else {
    console.log(`remote "${remote}" not configured, skipped.`);
  }

  // 8. 推送到各 mirror：內容同 origin 的 demo，只把 README 換成連到該 mirror 自己的 Pages，
  //    接在 mirror 現有的 demo 之後。每次都和 mirror 比對，所以即使 origin 沒新 commit、
  //    落後的 mirror 也會被補上
  const baseCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: worktreeDir,
    encoding: "utf8",
    shell: false,
  }).trim();
  for (const mirror of mirrorRemotes.filter((name) => name !== remote)) {
    if (!gitQuiet(["remote", "get-url", mirror])) {
      console.log(`remote "${mirror}" not configured, skipped.`);
      continue;
    }
    const commit = commitWithReadme({
      cwd: rootDir,
      baseCommit,
      parent: remoteBranchTip(mirror),
      readme: readmeFor(mirror),
      message,
    });
    if (!commit) {
      console.log(`${mirror}/${branch} 已是最新，略過。`);
      continue;
    }
    git(["push", mirror, `${commit}:refs/heads/${branch}`]);
    console.log(`pushed to ${mirror}/${branch}.`);
  }
} finally {
  // 9. 清理 worktree
  await cleanupWorktree();
}
