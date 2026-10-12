import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { commitWithReadme } from "../scripts/deploy-mirror.mjs";

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", shell: false }).trim();
}

// 建立一個有 demo 內容（含 README 與子資料夾）的暫存 repo，回傳 repo 路徑與 commit
async function createDemoRepo(t) {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "deploy-mirror-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  git(cwd, ["init", "--quiet"]);
  git(cwd, ["config", "user.name", "Test"]);
  git(cwd, ["config", "user.email", "test@example.com"]);
  git(cwd, ["config", "core.autocrlf", "false"]);
  await mkdir(path.join(cwd, "assets"));
  await writeFile(path.join(cwd, "index.html"), "<p>home</p>\n");
  await writeFile(path.join(cwd, "assets", "site.css"), "p{}\n");
  await writeFile(path.join(cwd, ".nojekyll"), "");
  await writeFile(
    path.join(cwd, "README.md"),
    "[首頁](https://one-liang.github.io/x/index.html)\n"
  );
  git(cwd, ["add", "-A"]);
  git(cwd, ["commit", "--quiet", "-m", "deploy: origin"]);
  return { cwd, base: git(cwd, ["rev-parse", "HEAD"]) };
}

function filesOf(cwd, commit) {
  return git(cwd, ["ls-tree", "-r", "--name-only", commit]).split("\n");
}

test("commitWithReadme 只換掉 README，其他檔案沿用 baseCommit，並接在 parent 之後", async (t) => {
  const { cwd, base } = await createDemoRepo(t);
  const readme = "[首頁](https://for-demo.github.io/x/index.html)\n";

  const commit = commitWithReadme({
    cwd,
    baseCommit: base,
    parent: base,
    readme,
    message: "deploy: mirror",
  });

  assert.equal(git(cwd, ["rev-parse", `${commit}^`]), base);
  assert.equal(git(cwd, ["show", `${commit}:README.md`]), readme.trim());
  assert.deepEqual(filesOf(cwd, commit), filesOf(cwd, base));
  assert.equal(git(cwd, ["diff", "--name-only", base, commit]), "README.md");
  assert.equal(git(cwd, ["log", "-1", "--format=%s", commit]), "deploy: mirror");
});

test("commitWithReadme 在內容和 parent 相同時回傳 null，不產生空 commit", async (t) => {
  const { cwd, base } = await createDemoRepo(t);
  const readme = "[首頁](https://for-demo.github.io/x/index.html)\n";
  const first = commitWithReadme({ cwd, baseCommit: base, parent: base, readme, message: "m" });

  assert.equal(
    commitWithReadme({ cwd, baseCommit: base, parent: first, readme, message: "m" }),
    null
  );
});

test("commitWithReadme 在 parent 為 null 時建立無父 commit，baseCommit 沒有 README 也會補上", async (t) => {
  const { cwd } = await createDemoRepo(t);
  git(cwd, ["rm", "--quiet", "README.md"]);
  git(cwd, ["commit", "--quiet", "-m", "no readme"]);
  const base = git(cwd, ["rev-parse", "HEAD"]);

  const commit = commitWithReadme({
    cwd,
    baseCommit: base,
    parent: null,
    readme: "hi\n",
    message: "m",
  });

  assert.equal(git(cwd, ["rev-list", "--count", commit]), "1");
  assert.equal(git(cwd, ["show", `${commit}:README.md`]), "hi");
  assert.ok(filesOf(cwd, commit).includes("assets/site.css"));
});

test("commitWithReadme 遇到不存在的 baseCommit 會丟錯", async (t) => {
  const { cwd } = await createDemoRepo(t);

  assert.throws(() =>
    commitWithReadme({ cwd, baseCommit: "does-not-exist", parent: null, readme: "x", message: "m" })
  );
});
