import { execFileSync } from "node:child_process";

function git(cwd, args, input) {
  return execFileSync("git", args, {
    cwd,
    input,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
  });
}

// 鏡像 remote 的 demo commit：內容沿用 baseCommit（origin 的 demo），只把根目錄的 README.md
// 換成 readme，接在鏡像自己的 demo（parent）之後，因此推送一律是 fast-forward，不需要 force。
// 內容和 parent 完全相同時回傳 null，不產生空 commit；parent 為 null 時建立無父 commit（orphan）。
export function commitWithReadme({ cwd, baseCommit, parent, readme, message }) {
  const blob = git(cwd, ["hash-object", "-w", "--stdin"], readme).trim();
  const entries = git(cwd, ["ls-tree", "-z", `${baseCommit}^{tree}`])
    .split("\0")
    .filter((entry) => entry && entry.split("\t")[1] !== "README.md");
  entries.push(`100644 blob ${blob}\tREADME.md`);
  const tree = git(cwd, ["mktree", "-z"], `${entries.join("\0")}\0`).trim();

  if (parent && git(cwd, ["rev-parse", `${parent}^{tree}`]).trim() === tree) return null;

  const parentArgs = parent ? ["-p", parent] : [];
  return git(cwd, ["commit-tree", tree, ...parentArgs, "-m", message]).trim();
}
