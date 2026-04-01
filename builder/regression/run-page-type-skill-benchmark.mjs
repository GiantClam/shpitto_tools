#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const DEFAULT_BASE_URL = "http://localhost:3000";
const DEFAULT_PROMPTS_FILE = path.join(ROOT, "regression", "prompts.website-refactor.json");
const DEFAULT_OUT_DIR = path.join(ROOT, "regression", "reports");

const parseArgs = (argv) => {
  const options = {
    baseUrl: DEFAULT_BASE_URL,
    promptsFile: DEFAULT_PROMPTS_FILE,
    outDir: DEFAULT_OUT_DIR,
    maxCases: 2,
    requestTimeoutMs: 120000,
    pendingWaitMs: 180000,
    enforcePublishReady: true,
    enforceNoGateIssues: true,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--base-url" && next) {
      options.baseUrl = next;
      i += 1;
      continue;
    }
    if (arg === "--prompts" && next) {
      options.promptsFile = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--out-dir" && next) {
      options.outDir = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--max-cases" && next) {
      options.maxCases = Math.max(0, Number(next) || 0);
      i += 1;
      continue;
    }
    if (arg === "--request-timeout-ms" && next) {
      options.requestTimeoutMs = Math.max(0, Number(next) || 0);
      i += 1;
      continue;
    }
    if (arg === "--pending-wait-ms" && next) {
      options.pendingWaitMs = Math.max(0, Number(next) || 0);
      i += 1;
      continue;
    }
    if (arg === "--enforce-publish-ready" && next) {
      options.enforcePublishReady = ["1", "true", "yes", "on"].includes(String(next).toLowerCase());
      i += 1;
      continue;
    }
    if (arg === "--enforce-no-gate-issues" && next) {
      options.enforceNoGateIssues = ["1", "true", "yes", "on"].includes(String(next).toLowerCase());
      i += 1;
      continue;
    }
    if (arg === "--help") {
      console.log(`Usage: node regression/run-page-type-skill-benchmark.mjs [options]

Options:
  --base-url <url>                API base URL (default: ${DEFAULT_BASE_URL})
  --prompts <path>                Prompt cases JSON (default: regression/prompts.website-refactor.json)
  --max-cases <n>                 Run first N cases (default: 2)
  --request-timeout-ms <n>        Per-request timeout override (default: 120000)
  --pending-wait-ms <n>           Max wait when request returns pending=true (default: 180000)
  --enforce-publish-ready <bool>  Require publishStatus=ready (default: true)
  --enforce-no-gate-issues <bool> Require generationGateIssues empty (default: true)
  --out-dir <path>                Benchmark report output dir (default: regression/reports)`);
      process.exit(0);
    }
  }
  return options;
};

const timestampForFile = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

const toPercent = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`;

const runBaseline = async ({ label, pageTypeSkillsEnabled, options }) => {
  const args = [
    "regression/run-creation-baseline.mjs",
    "--base-url",
    options.baseUrl,
    "--prompts",
    path.relative(ROOT, options.promptsFile),
    "--max-cases",
    String(options.maxCases),
    "--request-timeout-ms",
    String(options.requestTimeoutMs),
    "--pending-wait-ms",
    String(options.pendingWaitMs),
    "--enforce-publish-ready",
    String(Boolean(options.enforcePublishReady)),
    "--enforce-no-gate-issues",
    String(Boolean(options.enforceNoGateIssues)),
  ];
  const env = {
    ...process.env,
    BUILDER_PAGE_TYPE_SKILLS_ENABLED: pageTypeSkillsEnabled ? "1" : "0",
    BUILDER_MULTI_CANDIDATE_SELECTION: process.env.BUILDER_MULTI_CANDIDATE_SELECTION || "false",
    BUILDER_SECTION_GENERATION_STRATEGY: process.env.BUILDER_SECTION_GENERATION_STRATEGY || "template_first",
    LLM_SECTION_MAX_ATTEMPTS: process.env.LLM_SECTION_MAX_ATTEMPTS || "1",
    LLM_NETWORK_RETRY_ATTEMPTS: process.env.LLM_NETWORK_RETRY_ATTEMPTS || "0",
    LLM_ENABLE_REPAIR: process.env.LLM_ENABLE_REPAIR || "false",
    LLM_ENABLE_REFINEMENT: process.env.LLM_ENABLE_REFINEMENT || "false",
    CREATION_DEFERRED_PERSIST_MAX_MS: process.env.CREATION_DEFERRED_PERSIST_MAX_MS || "120000",
  };
  console.log(
    `[benchmark] run=${label} BUILDER_PAGE_TYPE_SKILLS_ENABLED=${env.BUILDER_PAGE_TYPE_SKILLS_ENABLED}`
  );
  const child = spawn("node", args, { cwd: ROOT, env, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    stdout += text;
    process.stdout.write(`[${label}] ${text}`);
  });
  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    stderr += text;
    process.stderr.write(`[${label}] ${text}`);
  });
  const code = await new Promise((resolve) => child.on("close", resolve));
  if (code !== 0) {
    const message = stderr.trim() || stdout.trim() || `baseline failed with code ${code}`;
    throw new Error(`[${label}] ${message}`);
  }
  const jsonMatch = stdout.match(/\[baseline\]\s+json=(.+)\s*$/m);
  if (!jsonMatch?.[1]) {
    throw new Error(`[${label}] unable to locate baseline json path in output`);
  }
  const reportPath = jsonMatch[1].trim();
  const raw = await fs.readFile(reportPath, "utf8");
  const report = JSON.parse(raw);
  return {
    label,
    reportPath,
    summary: report?.summary || {},
  };
};

const scoreSummary = (summary) => {
  const success = Number(summary?.successRate || 0);
  const fallback = Number(summary?.fallbackRate || 0);
  const timeout = Number(summary?.timeoutRate || 0);
  const assertionFailure = Number(summary?.assertionFailureRate || 0);
  const qa = Number(summary?.avgQaOverallScore || 0);
  return Number((success - fallback - timeout - assertionFailure + qa * 0.2).toFixed(6));
};

const run = async () => {
  const options = parseArgs(process.argv);
  const generic = await runBaseline({
    label: "generic",
    pageTypeSkillsEnabled: false,
    options,
  });
  const specialized = await runBaseline({
    label: "specialized",
    pageTypeSkillsEnabled: true,
    options,
  });

  const genericSummary = generic.summary;
  const specializedSummary = specialized.summary;
  const genericScore = scoreSummary(genericSummary);
  const specializedScore = scoreSummary(specializedSummary);
  const qaGeneric = Number(genericSummary?.avgQaOverallScore || 0);
  const qaSpecialized = Number(specializedSummary?.avgQaOverallScore || 0);
  const scoreDelta = Number((specializedScore - genericScore).toFixed(6));
  const qaDelta = Number((qaSpecialized - qaGeneric).toFixed(6));

  const pass =
    Number(specializedSummary?.successRate || 0) >= Number(genericSummary?.successRate || 0) &&
    Number(specializedSummary?.fallbackRate || 0) <= Number(genericSummary?.fallbackRate || 0) &&
    Number(specializedSummary?.timeoutRate || 0) <= Number(genericSummary?.timeoutRate || 0) &&
    Number(specializedSummary?.assertionFailureRate || 0) <= Number(genericSummary?.assertionFailureRate || 0) &&
    scoreDelta >= 0 &&
    qaDelta >= 0 &&
    (scoreDelta > 0 || qaDelta > 0);

  await fs.mkdir(options.outDir, { recursive: true });
  const stamp = timestampForFile();
  const jsonPath = path.join(options.outDir, `page-type-skill-benchmark-${stamp}.json`);
  const mdPath = path.join(options.outDir, `page-type-skill-benchmark-${stamp}.md`);

  const report = {
    generatedAt: new Date().toISOString(),
    options,
    pass,
    comparison: {
      generic: {
        reportPath: generic.reportPath,
        summary: genericSummary,
        score: genericScore,
      },
      specialized: {
        reportPath: specialized.reportPath,
        summary: specializedSummary,
        score: specializedScore,
      },
      deltas: {
        score: scoreDelta,
        qaOverall: qaDelta,
      },
    },
  };

  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    "# Page-Type Skill Benchmark",
    "",
    `- generatedAt: ${report.generatedAt}`,
    `- pass: ${pass}`,
    `- baseUrl: ${options.baseUrl}`,
    `- prompts: ${options.promptsFile}`,
    "",
    "## Summary",
    "",
    "| variant | successRate | fallbackRate | timeoutRate | assertionFailureRate | avgQaOverall | score | baselineReport |",
    "|---|---:|---:|---:|---:|---:|---:|---|",
    `| generic | ${toPercent(genericSummary?.successRate)} | ${toPercent(genericSummary?.fallbackRate)} | ${toPercent(genericSummary?.timeoutRate)} | ${toPercent(genericSummary?.assertionFailureRate)} | ${genericSummary?.avgQaOverallScore ?? "-"} | ${genericScore} | ${generic.reportPath} |`,
    `| specialized | ${toPercent(specializedSummary?.successRate)} | ${toPercent(specializedSummary?.fallbackRate)} | ${toPercent(specializedSummary?.timeoutRate)} | ${toPercent(specializedSummary?.assertionFailureRate)} | ${specializedSummary?.avgQaOverallScore ?? "-"} | ${specializedScore} | ${specialized.reportPath} |`,
    "",
    `- delta.score: ${scoreDelta}`,
    `- delta.avgQaOverall: ${qaDelta}`,
    "",
  ];
  await fs.writeFile(mdPath, `${mdLines.join("\n")}\n`, "utf8");

  console.log(`[benchmark] json=${jsonPath}`);
  console.log(`[benchmark] md=${mdPath}`);
  console.log(
    `[benchmark] pass=${pass} scoreDelta=${scoreDelta} qaDelta=${qaDelta} specializedSuccess=${toPercent(
      specializedSummary?.successRate
    )}`
  );

  if (!pass) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[benchmark] failed: ${message}`);
  process.exit(1);
});
