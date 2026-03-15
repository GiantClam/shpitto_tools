import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const parseEnvContent = (raw) => {
  const pairs = [];
  for (const line of String(raw || "").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2] || "";
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    pairs.push([key, value]);
  }
  return pairs;
};

const listWorktreeRoots = (cwd) => {
  try {
    const output = execFileSync("git", ["worktree", "list", "--porcelain"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output
      .split(/\r?\n/)
      .filter((line) => line.startsWith("worktree "))
      .map((line) => line.slice("worktree ".length).trim())
      .filter(Boolean);
  } catch {
    return [];
  }
};

const uniqueExistingPaths = async (paths) => {
  const unique = [];
  const seen = new Set();
  for (const candidate of paths) {
    const normalized = path.resolve(candidate);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    try {
      await fs.access(normalized);
      unique.push(normalized);
    } catch {
      // ignore missing env files
    }
  }
  return unique;
};

export const buildRegressionEnv = async ({ builderRoot, repoRoot }) => {
  const originalKeys = new Set(Object.keys(process.env));
  const env = { ...process.env };
  const allWorktrees = listWorktreeRoots(builderRoot);
  const currentRepoRoot = path.resolve(repoRoot);
  const secondaryWorktrees = allWorktrees.filter((root) => path.resolve(root) !== currentRepoRoot);

  const lowPrecedenceCandidates = [];
  for (const worktreeRoot of secondaryWorktrees) {
    lowPrecedenceCandidates.push(
      path.join(worktreeRoot, ".env"),
      path.join(worktreeRoot, "builder", ".env"),
      path.join(worktreeRoot, ".env.local"),
      path.join(worktreeRoot, "builder", ".env.local")
    );
  }

  const highPrecedenceCandidates = [
    path.join(repoRoot, ".env"),
    path.join(builderRoot, ".env"),
    path.join(repoRoot, ".env.local"),
    path.join(builderRoot, ".env.local"),
  ];

  const candidateFiles = await uniqueExistingPaths([...lowPrecedenceCandidates, ...highPrecedenceCandidates]);
  const loadedFiles = [];

  for (const filePath of candidateFiles) {
    const raw = await fs.readFile(filePath, "utf8");
    const pairs = parseEnvContent(raw);
    let applied = 0;
    for (const [key, value] of pairs) {
      if (originalKeys.has(key)) continue;
      env[key] = value;
      applied += 1;
    }
    loadedFiles.push({ filePath, applied });
  }

  return { env, loadedFiles };
};
