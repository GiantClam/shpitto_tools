#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const DEFAULT_PROMPTS_FILE = path.join(ROOT, "regression", "prompts.quick.json");
const DEFAULT_TIMEOUT_PAGINATION_PROMPTS_FILE = path.join(ROOT, "regression", "prompts.timeout-pagination.json");

const parseArgs = (argv) => {
  const options = {
    baseUrl: DEFAULT_BASE_URL,
    promptsFile: DEFAULT_PROMPTS_FILE,
    maxCases: 1,
    creationOnly: false,
    browserOnly: false,
    profile: "safe", // safe | aggressive | none
    stabilityRuns: 1,
    caseIds: [],
    screenshotMode: "on-fail", // always | on-fail | none
    reuseReportFile: "",
    allowTimeoutFallback: false,
    skipNavConsistency: false,
    withTimeoutPagination: false,
    timeoutPaginationPromptsFile: DEFAULT_TIMEOUT_PAGINATION_PROMPTS_FILE,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--base-url" && next) {
      options.baseUrl = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--prompts" && next) {
      options.promptsFile = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--max-cases" && next) {
      options.maxCases = Math.max(1, Number(next) || 1);
      i += 1;
      continue;
    }
    if (arg === "--creation-only") {
      options.creationOnly = true;
      continue;
    }
    if (arg === "--browser-only") {
      options.browserOnly = true;
      continue;
    }
    if (arg === "--profile" && next) {
      const profile = String(next).trim().toLowerCase();
      if (["safe", "aggressive", "none"].includes(profile)) {
        options.profile = profile;
      }
      i += 1;
      continue;
    }
    if (arg === "--stability-runs" && next) {
      options.stabilityRuns = Math.max(1, Number(next) || 1);
      i += 1;
      continue;
    }
    if (arg === "--case-id" && next) {
      options.caseIds.push(String(next).trim());
      i += 1;
      continue;
    }
    if (arg === "--case-ids" && next) {
      options.caseIds.push(
        ...String(next)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      );
      i += 1;
      continue;
    }
    if (arg === "--screenshot-mode" && next) {
      const mode = String(next).trim().toLowerCase();
      if (["always", "on-fail", "none"].includes(mode)) {
        options.screenshotMode = mode;
      }
      i += 1;
      continue;
    }
    if (arg === "--reuse-report" && next) {
      options.reuseReportFile = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--allow-timeout-fallback" && next) {
      options.allowTimeoutFallback = ["1", "true", "yes", "on"].includes(String(next).toLowerCase());
      i += 1;
      continue;
    }
    if (arg === "--skip-nav-consistency") {
      options.skipNavConsistency = true;
      continue;
    }
    if (arg === "--with-timeout-pagination") {
      options.withTimeoutPagination = true;
      continue;
    }
    if (arg === "--timeout-pagination-prompts" && next) {
      options.timeoutPaginationPromptsFile = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--help") {
      console.log(`Usage: node regression/run-quick-regression.mjs [options]

Options:
  --base-url <url>      Builder base URL (default: ${DEFAULT_BASE_URL})
  --prompts <path>      Prompt file (default: regression/prompts.quick.json)
  --max-cases <n>       Run first N cases only (default: 1)
  --creation-only       Run only creation baseline quick pass
  --browser-only        Run only browser validation quick pass
  --profile <name>      Fast env profile: safe | aggressive | none (default: safe)
  --stability-runs <n>  Repeat creation quick pass N times for stability gate (default: 1)
  --case-id <id>        Run only one case id (repeatable)
  --case-ids <a,b,c>    Run only listed case ids (comma-separated)
  --screenshot-mode <m> Browser screenshot mode: always | on-fail | none (default: on-fail)
  --reuse-report <path> Reuse siteKey by case id from old regression report (browser run)
  --allow-timeout-fallback <bool> Treat generation_timeout_fallback as non-fatal in quick creation (default: false)
  --with-timeout-pagination Run extra timeout+pagination preservation gate after quick creation
  --timeout-pagination-prompts <path> Prompt file for timeout pagination gate (default: regression/prompts.timeout-pagination.json)
  --skip-nav-consistency Skip sandbox URL/navigation consistency gate after browser run

Examples:
  node regression/run-quick-regression.mjs
  node regression/run-quick-regression.mjs --creation-only
  node regression/run-quick-regression.mjs --max-cases 2 --profile aggressive
`);
      process.exit(0);
    }
  }
  if (options.creationOnly && options.browserOnly) {
    throw new Error("Invalid arguments: --creation-only and --browser-only cannot be used together.");
  }
  options.caseIds = Array.from(new Set(options.caseIds.filter(Boolean)));
  return options;
};

const FAST_ENV_BY_PROFILE = {
  safe: {
    BUILDER_MULTI_CANDIDATE_SELECTION: "false",
    BUILDER_SECTION_GENERATION_STRATEGY: "template_first",
    LLM_SECTION_MAX_ATTEMPTS: "1",
    LLM_NETWORK_RETRY_ATTEMPTS: "0",
    LLM_ENABLE_REPAIR: "false",
    LLM_ENABLE_REFINEMENT: "false",
    BUILDER_TEMPLATE_REFINEMENT: "false",
    CREATION_REQUEST_TIMEOUT_MS: "45000",
    CREATION_ENTERPRISE_REQUEST_TIMEOUT_MS: "60000",
    CREATION_PERSIST_REQUEST_TIMEOUT_MS: "45000",
    CREATION_DEFERRED_PERSIST_MAX_MS: "120000",
  },
  aggressive: {
    BUILDER_MULTI_CANDIDATE_SELECTION: "false",
    BUILDER_SECTION_GENERATION_STRATEGY: "template_first",
    BUILDER_SCOPED_RAG_ENABLED: "false",
    LLM_SECTION_MAX_ATTEMPTS: "1",
    LLM_NETWORK_RETRY_ATTEMPTS: "0",
    LLM_ENABLE_REPAIR: "false",
    LLM_ENABLE_REFINEMENT: "false",
    BUILDER_TEMPLATE_REFINEMENT: "false",
    CREATION_REQUEST_TIMEOUT_MS: "75000",
    CREATION_ENTERPRISE_REQUEST_TIMEOUT_MS: "90000",
    CREATION_PERSIST_REQUEST_TIMEOUT_MS: "60000",
    CREATION_DEFERRED_PERSIST_MAX_MS: "120000",
  },
  none: {},
};

const mergeFastEnv = (profile) => {
  const preset = FAST_ENV_BY_PROFILE[profile] || {};
  return {
    ...process.env,
    ...preset,
  };
};

const runScript = (scriptPath, args, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: ROOT,
      stdio: "inherit",
      env,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(scriptPath)} exited with code ${code}`));
    });
  });

const findLatestReport = async (prefix) => {
  const reportsDir = path.join(ROOT, "regression", "reports");
  const entries = await fs.readdir(reportsDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.startsWith(prefix) && entry.name.endsWith(".json"))
    .map((entry) => path.join(reportsDir, entry.name));
  if (!files.length) return "";
  const stats = await Promise.all(
    files.map(async (filePath) => ({
      filePath,
      mtimeMs: (await fs.stat(filePath)).mtimeMs,
    }))
  );
  stats.sort((left, right) => right.mtimeMs - left.mtimeMs);
  return stats[0]?.filePath || "";
};

const buildCreationArgs = (options) => [
  "--base-url",
  options.baseUrl,
  "--prompts",
  path.relative(ROOT, options.promptsFile),
  "--max-cases",
  String(options.maxCases),
  "--persist",
  "true",
  "--delay-ms",
  "0",
  "--pending-wait-ms",
  "180000",
  "--request-timeout-ms",
  "45000",
  "--allow-timeout-fallback",
  options.allowTimeoutFallback ? "true" : "false",
  "--enforce-publish-ready",
  "true",
  "--enforce-no-gate-issues",
  "true",
  ...(options.caseIds.length ? ["--case-ids", options.caseIds.join(",")] : []),
];

const buildBrowserArgs = (options) => [
  "--base-url",
  options.baseUrl,
  "--prompts",
  path.relative(ROOT, options.promptsFile),
  "--max-cases",
  String(options.maxCases),
  "--persist",
  "true",
  "--wait-ms",
  "250",
  "--pending-wait-ms",
  "180000",
  "--request-timeout-ms",
  "240000",
  "--request-retries",
  "0",
  "--creation-timeout-ms",
  "45000",
  "--screenshot-mode",
  options.screenshotMode,
  ...(options.caseIds.length ? ["--case-ids", options.caseIds.join(",")] : []),
  ...(options.reuseReportFile ? ["--reuse-report", path.relative(ROOT, options.reuseReportFile)] : []),
];

const buildTimeoutPaginationArgs = (options) => [
  "--base-url",
  options.baseUrl,
  "--prompts",
  path.relative(ROOT, options.timeoutPaginationPromptsFile),
  "--case-id",
  "timeout-catalog-pagination-preserved",
  "--persist",
  "true",
  "--delay-ms",
  "0",
  "--pending-wait-ms",
  "180000",
  "--request-timeout-ms",
  "10000",
  "--allow-timeout-fallback",
  "false",
  "--enforce-progress-stages",
  "true",
  "--enforce-publish-ready",
  "false",
  "--enforce-no-gate-issues",
  "false",
];

const main = async () => {
  const options = parseArgs(process.argv);
  const env = mergeFastEnv(options.profile);

  const runCreation = !options.browserOnly;
  const runBrowser = !options.creationOnly;

  console.log(
    `[quick-regression] baseUrl=${options.baseUrl} prompts=${options.promptsFile} maxCases=${options.maxCases} profile=${options.profile} stabilityRuns=${options.stabilityRuns} screenshotMode=${options.screenshotMode}`
  );
  if (runCreation) {
    for (let runIndex = 1; runIndex <= options.stabilityRuns; runIndex += 1) {
      console.log(`[quick-regression] step=creation:start run=${runIndex}/${options.stabilityRuns}`);
      await runScript(path.join(ROOT, "regression", "run-creation-baseline.mjs"), buildCreationArgs(options), env);
      console.log(`[quick-regression] step=creation:done run=${runIndex}/${options.stabilityRuns}`);
    }
    if (options.withTimeoutPagination) {
      console.log("[quick-regression] step=timeout-pagination:start");
      await runScript(
        path.join(ROOT, "regression", "run-creation-baseline.mjs"),
        buildTimeoutPaginationArgs(options),
        env
      );
      console.log("[quick-regression] step=timeout-pagination:done");
    }
  }
  if (runBrowser) {
    console.log("[quick-regression] step=browser:start");
    await runScript(
      path.join(ROOT, "regression", "run-browser-refactor-validation.mjs"),
      buildBrowserArgs(options),
      env
    );
    console.log("[quick-regression] step=browser:done");
    if (!options.skipNavConsistency) {
      const fallbackReport =
        options.reuseReportFile && options.reuseReportFile.trim() ? options.reuseReportFile : await findLatestReport("browser-refactor-");
      if (!fallbackReport) {
        throw new Error("sandbox-nav-consistency gate failed: unable to resolve browser report for siteKey.");
      }
      const navArgs = [
        "--base-url",
        options.baseUrl,
        "--reuse-report",
        path.relative(ROOT, fallbackReport),
        ...(options.caseIds.length > 0 ? ["--case-id", options.caseIds[0]] : []),
      ];
      console.log("[quick-regression] step=sandbox-nav:start");
      await runScript(path.join(ROOT, "regression", "run-sandbox-nav-consistency.mjs"), navArgs, env);
      console.log("[quick-regression] step=sandbox-nav:done");
    }
  }
  console.log("[quick-regression] done");
};

main().catch((error) => {
  console.error("[quick-regression] failed:", error?.message || error);
  process.exit(1);
});
