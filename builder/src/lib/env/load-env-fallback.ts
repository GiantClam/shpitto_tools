import fs from "fs";
import os from "os";
import path from "path";

let envFallbackLoaded = false;

const isTruthy = (value: string | undefined) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
};

const hasLlmKey = () =>
  Boolean(process.env.AIBERM_API_KEY) ||
  Boolean(process.env.OPENROUTER_API_KEY) ||
  Boolean(process.env.ANTHROPIC_API_KEY);

const parseEnvLine = (line: string): { key: string; value: string } | null => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const body = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
  const index = body.indexOf("=");
  if (index <= 0) return null;
  const key = body.slice(0, index).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return null;
  let value = body.slice(index + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
};

const loadEnvFile = (filePath: string) => {
  if (!filePath || !fs.existsSync(filePath)) return 0;
  const text = fs.readFileSync(filePath, "utf8");
  let loadedCount = 0;
  text.split(/\r?\n/).forEach((line) => {
    const parsed = parseEnvLine(line);
    if (!parsed) return;
    if (typeof process.env[parsed.key] === "string" && process.env[parsed.key]!.length > 0) return;
    process.env[parsed.key] = parsed.value;
    loadedCount += 1;
  });
  return loadedCount;
};

const defaultEnvFallbackPaths = () => {
  const cwd = process.cwd();
  const cwdBase = path.basename(path.resolve(cwd));
  const parentBase = path.basename(path.resolve(cwd, ".."));
  const explicitRepoName = String(process.env.BUILDER_ENV_REPO_NAME || "").trim();
  const repoNames = Array.from(
    new Set(
      [explicitRepoName, cwdBase === "builder" ? parentBase : cwdBase, parentBase]
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
  const home = os.homedir();
  const localPaths = [
    path.resolve(cwd, ".env.local"),
    path.resolve(cwd, ".env"),
    path.resolve(cwd, "..", ".env.local"),
    path.resolve(cwd, "..", ".env"),
    path.resolve(cwd, "..", "..", ".env.local"),
    path.resolve(cwd, "..", "..", ".env"),
  ];
  const externalPaths = repoNames.flatMap((repoName) => [
    path.resolve(home, "Documents", "opencode", repoName, ".env.local"),
    path.resolve(home, "Documents", "opencode", repoName, ".env"),
    path.resolve(home, "Documents", "opencode", repoName, "builder", ".env.local"),
    path.resolve(home, "Documents", "opencode", repoName, "builder", ".env"),
  ]);
  return Array.from(new Set([...localPaths, ...externalPaths]));
};

export const ensureEnvFallbackLoaded = () => {
  if (envFallbackLoaded) return;
  envFallbackLoaded = true;

  const force = isTruthy(process.env.BUILDER_ENV_FORCE_FALLBACK);
  if (!force && hasLlmKey()) return;

  const explicit = (process.env.BUILDER_ENV_FILE || "").trim();
  const configuredList = (process.env.BUILDER_ENV_FALLBACK_PATHS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const candidates = Array.from(
    new Set([...(explicit ? [explicit] : []), ...configuredList, ...defaultEnvFallbackPaths()])
  );

  for (const candidate of candidates) {
    loadEnvFile(candidate);
    if (hasLlmKey() && !force) break;
  }
};
