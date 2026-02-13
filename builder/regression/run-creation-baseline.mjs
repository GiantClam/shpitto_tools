#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import fetch from "node-fetch";

const ROOT = process.cwd();
const DEFAULT_BASE_URL = "http://localhost:3000";
const DEFAULT_PROMPTS_FILE = path.join(ROOT, "regression", "prompts.baseline.json");
const DEFAULT_LOG_FILE = path.join(ROOT, "logs", "creation.log");
const DEFAULT_OUT_DIR = path.join(ROOT, "regression", "reports");

const parseArgs = (argv) => {
  const options = {
    baseUrl: DEFAULT_BASE_URL,
    promptsFile: DEFAULT_PROMPTS_FILE,
    logFile: DEFAULT_LOG_FILE,
    outDir: DEFAULT_OUT_DIR,
    maxCases: 0,
    delayMs: 350,
    persist: true,
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
    if (arg === "--log-file" && next) {
      options.logFile = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--out-dir" && next) {
      options.outDir = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--max-cases" && next) {
      options.maxCases = Number(next) || 0;
      i += 1;
      continue;
    }
    if (arg === "--delay-ms" && next) {
      options.delayMs = Number(next) || 350;
      i += 1;
      continue;
    }
    if (arg === "--persist" && next) {
      options.persist = ["1", "true", "yes", "on"].includes(String(next).toLowerCase());
      i += 1;
      continue;
    }
    if (arg === "--help") {
      console.log(`Usage: node regression/run-creation-baseline.mjs [options]\n\nOptions:\n  --base-url <url>     API base URL (default: ${DEFAULT_BASE_URL})\n  --prompts <path>     Prompt cases JSON (default: regression/prompts.baseline.json)\n  --log-file <path>    creation.log path (default: logs/creation.log)\n  --out-dir <path>     Report output directory (default: regression/reports)\n  --max-cases <n>      Run first N cases only\n  --delay-ms <n>       Delay between requests in ms (default: 350)\n  --persist <bool>     Send persist=true/false to /api/creation (default: true)`);
      process.exit(0);
    }
  }
  return options;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeType = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const categorizeBlock = (block) => {
  const type = normalizeType(block?.type);
  const variant = normalizeType(block?.props?.variant);
  const categories = new Set();
  if (!type) return categories;
  if (/(navigation|navbar|header)/.test(type)) categories.add("navigation");
  if (/hero/.test(type)) categories.add("hero");
  if (/(studiostory|story|content|editorial|philosophy|narrative)/.test(type)) categories.add("story");
  if (/(approach|metric|stats|stat|feature|valueprop)/.test(type)) categories.add("approach");
  if (/(social|trust|testimonial|logo|collaborator)/.test(type)) categories.add("socialproof");
  if (/(footercta|leadcapture|contactcta|cta)/.test(type)) categories.add("cta");
  if (/footer/.test(type)) categories.add("footer");
  if (/(product|catalog|pricing|shop|store)/.test(type)) categories.add("products");
  if (/cardsgrid/.test(type) && /(product|catalog|shop|store)/.test(variant)) categories.add("products");
  if (/(contact|inquiry|form)/.test(type)) categories.add("contact");
  return categories;
};

const toPercent = (value) => `${(value * 100).toFixed(1)}%`;

const percentile = (items, p) => {
  if (!items.length) return 0;
  const sorted = [...items].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
};

const sumByRegex = (text, regex) => {
  let match;
  let total = 0;
  while ((match = regex.exec(text))) {
    total += Number(match[1]) || 0;
  }
  return total;
};

const countByRegex = (text, regex) => {
  let match;
  let total = 0;
  while ((match = regex.exec(text))) {
    total += 1;
  }
  return total;
};

const readLogSize = async (logFile) => {
  try {
    const stat = await fs.stat(logFile);
    return stat.size;
  } catch {
    return 0;
  }
};

const readLogSlice = async (logFile, start, end) => {
  if (end <= start) return "";
  try {
    const handle = await fs.open(logFile, "r");
    try {
      const length = end - start;
      const buffer = Buffer.alloc(length);
      const { bytesRead } = await handle.read(buffer, 0, length, start);
      return buffer.subarray(0, bytesRead).toString("utf8");
    } finally {
      await handle.close();
    }
  } catch {
    return "";
  }
};

const parseLogMetrics = (slice) => {
  return {
    usageInputTokens: sumByRegex(slice, /"usageInputTokens"\s*:\s*(\d+)/g),
    usageOutputTokens: sumByRegex(slice, /"usageOutputTokens"\s*:\s*(\d+)/g),
    sectionOk: countByRegex(slice, /builder:section:ok/g),
    sectionFallback: countByRegex(slice, /builder:section:fallback/g),
    parseFailed: countByRegex(slice, /builder:section:parse_failed/g),
    layoutInvalid: countByRegex(slice, /builder:section:layout_invalid/g),
    providerFailed: countByRegex(slice, /request:provider_failed/g),
    toolMissing: countByRegex(slice, /response:tool_missing/g),
    toolEmptyPayload: countByRegex(slice, /response:tool_empty_payload/g),
    timeoutFallback: countByRegex(slice, /timeout_fallback/g),
  };
};

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const timestampForFile = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

const formatMs = (ms) => {
  if (!Number.isFinite(ms)) return "-";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const run = async () => {
  const options = parseArgs(process.argv);
  const promptsRaw = await fs.readFile(options.promptsFile, "utf8");
  const promptsConfig = JSON.parse(promptsRaw);
  const rawCases = Array.isArray(promptsConfig?.cases) ? promptsConfig.cases : [];
  const cases = options.maxCases > 0 ? rawCases.slice(0, options.maxCases) : rawCases;
  if (!cases.length) {
    throw new Error(`No prompt cases found in ${options.promptsFile}`);
  }

  console.log(`[baseline] baseUrl=${options.baseUrl}`);
  console.log(`[baseline] prompts=${options.promptsFile}`);
  console.log(`[baseline] cases=${cases.length}`);

  const results = [];

  for (let i = 0; i < cases.length; i += 1) {
    const c = cases[i];
    const title = `${i + 1}/${cases.length} ${c.id}`;
    const before = await readLogSize(options.logFile);
    const startedAt = Date.now();

    let response;
    let payload;
    let requestError = null;

    try {
      response = await fetch(`${options.baseUrl}/api/creation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: c.prompt, persist: options.persist }),
      });
      payload = await safeJson(response);
    } catch (error) {
      requestError = error instanceof Error ? error.message : String(error);
      payload = null;
    }

    const durationMs = Date.now() - startedAt;
    await sleep(options.delayMs);

    const after = await readLogSize(options.logFile);
    const logSlice = await readLogSlice(options.logFile, before, after);
    const logMetrics = parseLogMetrics(logSlice);

    const blocks = Array.isArray(payload?.pages?.[0]?.data?.content) ? payload.pages[0].data.content : [];
    const blockTypes = blocks.map((item) => String(item?.type ?? "")).filter(Boolean);
    const categories = new Set();
    for (const block of blocks) {
      const mapped = categorizeBlock(block);
      for (const cat of mapped) categories.add(cat);
    }

    const errors = Array.isArray(payload?.errors) ? payload.errors.map((e) => String(e)) : [];
    const required = Array.isArray(c.requiredCategories)
      ? c.requiredCategories.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
      : [];
    const missingRequired = required.filter((item) => !categories.has(item));

    const hasFallbackBlock = blockTypes.some((type) => normalizeType(type) === "creationfallbacksection");
    const hasSectionFallbackError = errors.some((item) => item.includes("builder_section_fallback"));
    const hasTimeoutFallback = errors.includes("generation_timeout_fallback") || logMetrics.timeoutFallback > 0;

    const passed =
      !requestError &&
      Boolean(response?.ok) &&
      missingRequired.length === 0 &&
      !hasFallbackBlock &&
      !hasSectionFallbackError &&
      !hasTimeoutFallback;

    const row = {
      id: c.id,
      description: c.description,
      requestId: payload?.requestId ?? null,
      responseId: payload?.id ?? null,
      statusCode: response?.status ?? null,
      passed,
      durationMs,
      errors,
      missingRequired,
      blockTypes,
      detectedCategories: Array.from(categories).sort(),
      hasFallbackBlock,
      hasSectionFallbackError,
      hasTimeoutFallback,
      componentsCount: Array.isArray(payload?.components) ? payload.components.length : 0,
      pageCount: Array.isArray(payload?.pages) ? payload.pages.length : 0,
      requestError,
      logMetrics,
    };

    results.push(row);

    const statusTag = passed ? "PASS" : "FAIL";
    console.log(
      `[${statusTag}] ${title} duration=${formatMs(durationMs)} ` +
        `types=${blockTypes.length} missing=[${missingRequired.join(",")}] ` +
        `inTok=${logMetrics.usageInputTokens} outTok=${logMetrics.usageOutputTokens}`
    );
  }

  const total = results.length;
  const passed = results.filter((item) => item.passed).length;
  const failed = total - passed;
  const withFallback = results.filter((item) => item.hasFallbackBlock || item.hasSectionFallbackError).length;
  const withTimeout = results.filter((item) => item.hasTimeoutFallback).length;

  const durationList = results.map((item) => item.durationMs);
  const summary = {
    total,
    passed,
    failed,
    successRate: total ? passed / total : 0,
    fallbackRate: total ? withFallback / total : 0,
    timeoutRate: total ? withTimeout / total : 0,
    avgDurationMs: total ? Math.round(durationList.reduce((a, b) => a + b, 0) / total) : 0,
    p95DurationMs: percentile(durationList, 95),
    totalUsageInputTokens: results.reduce((sum, item) => sum + item.logMetrics.usageInputTokens, 0),
    totalUsageOutputTokens: results.reduce((sum, item) => sum + item.logMetrics.usageOutputTokens, 0),
    totalProviderFailures: results.reduce((sum, item) => sum + item.logMetrics.providerFailed, 0),
    totalParseFailures: results.reduce((sum, item) => sum + item.logMetrics.parseFailed, 0),
    totalLayoutInvalid: results.reduce((sum, item) => sum + item.logMetrics.layoutInvalid, 0),
    totalToolMissing: results.reduce((sum, item) => sum + item.logMetrics.toolMissing, 0),
    totalToolEmptyPayload: results.reduce((sum, item) => sum + item.logMetrics.toolEmptyPayload, 0),
  };

  await fs.mkdir(options.outDir, { recursive: true });
  const stamp = timestampForFile(new Date());
  const jsonPath = path.join(options.outDir, `creation-baseline-${stamp}.json`);
  const mdPath = path.join(options.outDir, `creation-baseline-${stamp}.md`);

  const report = {
    generatedAt: new Date().toISOString(),
    options,
    summary,
    results,
  };

  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    `# Creation Baseline Report`,
    "",
    `- generatedAt: ${report.generatedAt}`,
    `- baseUrl: ${options.baseUrl}`,
    `- prompts: ${options.promptsFile}`,
    "",
    "## Summary",
    "",
    `- total: ${summary.total}`,
    `- passed: ${summary.passed}`,
    `- failed: ${summary.failed}`,
    `- successRate: ${toPercent(summary.successRate)}`,
    `- fallbackRate: ${toPercent(summary.fallbackRate)}`,
    `- timeoutRate: ${toPercent(summary.timeoutRate)}`,
    `- avgDuration: ${formatMs(summary.avgDurationMs)}`,
    `- p95Duration: ${formatMs(summary.p95DurationMs)}`,
    `- inputTokens(sum): ${summary.totalUsageInputTokens}`,
    `- outputTokens(sum): ${summary.totalUsageOutputTokens}`,
    "",
    "## Cases",
    "",
    "| case | status | duration | missingRequired | inputTokens | outputTokens |",
    "|---|---|---:|---|---:|---:|",
    ...results.map((item) => {
      const status = item.passed ? "PASS" : "FAIL";
      const missing = item.missingRequired.length ? item.missingRequired.join(",") : "-";
      return `| ${item.id} | ${status} | ${formatMs(item.durationMs)} | ${missing} | ${item.logMetrics.usageInputTokens} | ${item.logMetrics.usageOutputTokens} |`;
    }),
    "",
  ];

  await fs.writeFile(mdPath, `${mdLines.join("\n")}\n`, "utf8");

  console.log("\n[baseline] completed");
  console.log(`[baseline] successRate=${toPercent(summary.successRate)} fallbackRate=${toPercent(summary.fallbackRate)} timeoutRate=${toPercent(summary.timeoutRate)}`);
  console.log(`[baseline] tokens input=${summary.totalUsageInputTokens} output=${summary.totalUsageOutputTokens}`);
  console.log(`[baseline] json=${jsonPath}`);
  console.log(`[baseline] md=${mdPath}`);

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[baseline] failed: ${message}`);
  process.exit(1);
});
