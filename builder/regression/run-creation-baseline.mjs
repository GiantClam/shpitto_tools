#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import fetch from "node-fetch";
import { buildRegressionEnv } from "./regression-env.mjs";

const ROOT = process.cwd();
const REPO_ROOT = path.resolve(ROOT, "..");
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
    pendingWaitMs: 420000,
    requestTimeoutMs: 0,
    allowTimeoutFallback: false,
    enforcePublishReady: true,
    enforceNoGateIssues: true,
    streamProgress: true,
    enforceProgressStages: true,
    caseIds: [],
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
    if (arg === "--pending-wait-ms" && next) {
      options.pendingWaitMs = Math.max(0, Number(next) || 0);
      i += 1;
      continue;
    }
    if (arg === "--request-timeout-ms" && next) {
      options.requestTimeoutMs = Math.max(0, Number(next) || 0);
      i += 1;
      continue;
    }
    if (arg === "--allow-timeout-fallback" && next) {
      options.allowTimeoutFallback = ["1", "true", "yes", "on"].includes(String(next).toLowerCase());
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
    if (arg === "--stream-progress" && next) {
      options.streamProgress = ["1", "true", "yes", "on"].includes(String(next).toLowerCase());
      i += 1;
      continue;
    }
    if (arg === "--enforce-progress-stages" && next) {
      options.enforceProgressStages = ["1", "true", "yes", "on"].includes(String(next).toLowerCase());
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
    if (arg === "--help") {
      console.log(`Usage: node regression/run-creation-baseline.mjs [options]\n\nOptions:\n  --base-url <url>        API base URL (default: ${DEFAULT_BASE_URL})\n  --prompts <path>        Prompt cases JSON (default: regression/prompts.baseline.json)\n  --log-file <path>       creation.log path (default: logs/creation.log)\n  --out-dir <path>        Report output directory (default: regression/reports)\n  --max-cases <n>         Run first N cases only\n  --case-id <id>          Run only one case id (repeatable)\n  --case-ids <a,b,c>      Run only listed case ids (comma-separated)\n  --delay-ms <n>          Delay between requests in ms (default: 350)\n  --persist <bool>        Send persist=true/false to /api/creation (default: true)\n  --pending-wait-ms <n>   Max wait for persisted result when API returns pending=true (default: 420000)\n  --request-timeout-ms <n> Override backend request timeout for this run (sent in request body)\n  --allow-timeout-fallback <bool> Treat generation_timeout_fallback as non-fatal\n  --stream-progress <bool> Send stream=true and parse SSE progress (default: true)\n  --enforce-progress-stages <bool> Require critical progress stages in SSE (default: true)\n  --enforce-publish-ready <bool> Require publishStatus=ready to pass (default: true)\n  --enforce-no-gate-issues <bool> Require generationGateIssues empty to pass (default: true)`);
      process.exit(0);
    }
  }
  options.caseIds = Array.from(new Set(options.caseIds.filter(Boolean)));
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
  const id = normalizeType(block?.props?.id);
  const anchor = normalizeType(block?.props?.anchor);
  const token = `${type} ${variant} ${id} ${anchor}`;
  const categories = new Set();
  if (!type) return categories;
  if (/(navigation|navbar|header)/.test(type)) categories.add("navigation");
  if (/hero/.test(type)) categories.add("hero");
  if (/(studiostory|story|content|editorial|philosophy|narrative)/.test(type)) categories.add("story");
  if (/(approach|metric|stats|stat|feature|valueprop)/.test(type)) categories.add("approach");
  if (/(social|trust|testimonial|logo|collaborator|case|casestud|customerstory)/.test(token)) categories.add("socialproof");
  if (/(footercta|leadcapture|contactcta|cta)/.test(type)) categories.add("cta");
  if (/footer/.test(type)) categories.add("footer");
  if (/(product|catalog|pricing|shop|store)/.test(token)) categories.add("products");
  if (/cardsgrid/.test(type) && /(product|catalog|shop|store|products)/.test(`${variant} ${id} ${anchor}`)) categories.add("products");
  if (/(contact|inquiry|form)/.test(type)) categories.add("contact");
  return categories;
};

const inferCategoriesFromPagePaths = (pages) => {
  const inferred = new Set();
  const normalizedPaths = (Array.isArray(pages) ? pages : []).map((page) => String(page?.path || "").trim().toLowerCase());
  normalizedPaths.forEach((pathValue) => {
    if (/^\/products?(\/|$)/.test(pathValue) || /^\/core-product(\/|$)/.test(pathValue)) inferred.add("products");
    if (/^\/pricing(\/|$)/.test(pathValue)) inferred.add("products");
    if (/^\/contact(\/|$)/.test(pathValue)) inferred.add("contact");
    if (/^\/support(\/|$)|^\/faq(\/|$)/.test(pathValue)) inferred.add("contact");
    if (/^\/about(\/|$)/.test(pathValue)) inferred.add("story");
    if (/^\/blog(\/|$)|^\/news(\/|$)|^\/insights?(\/|$)/.test(pathValue)) inferred.add("story");
    if (/^\/solutions?(\/|$)/.test(pathValue)) inferred.add("approach");
  });
  return inferred;
};

const deriveWorkspaceRootFromEnvFile = (filePath) => {
  const resolved = path.resolve(String(filePath || ""));
  const parent = path.dirname(resolved);
  if (path.basename(parent) === "builder") return path.dirname(parent);
  return parent;
};

const buildResultSearchRoots = ({ primaryRoot, loadedFiles }) => {
  const roots = new Set();
  if (primaryRoot) roots.add(path.resolve(primaryRoot));
  (Array.isArray(loadedFiles) ? loadedFiles : []).forEach((item) => {
    const fp = item?.filePath;
    if (!fp) return;
    roots.add(deriveWorkspaceRootFromEnvFile(fp));
  });
  return [...roots];
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

const parseSseEvents = (rawText) => {
  const text = String(rawText || "");
  if (!text.trim()) return [];
  const events = [];
  const chunks = text.split(/\r?\n\r?\n/).filter((chunk) => chunk.trim().length > 0);
  for (const chunk of chunks) {
    const lines = chunk.split(/\r?\n/);
    let event = "message";
    const dataLines = [];
    for (const line of lines) {
      if (!line || line.startsWith(":")) continue;
      if (line.startsWith("event:")) {
        event = line.slice("event:".length).trim() || "message";
        continue;
      }
      if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trimStart());
      }
    }
    if (!dataLines.length) continue;
    const dataRaw = dataLines.join("\n");
    let data = dataRaw;
    try {
      data = JSON.parse(dataRaw);
    } catch {}
    events.push({ event, data });
  }
  return events;
};

const readStreamResponse = async (res) => {
  const text = await res.text();
  const events = parseSseEvents(text);
  const progressStages = [];
  const progressDetails = [];
  let terminalEvent = null;
  let payload = null;
  for (const entry of events) {
    if (entry.event === "progress") {
      const stage = String(entry?.data?.stage || "").trim();
      if (stage) progressStages.push(stage);
      if (entry?.data && typeof entry.data === "object") {
        progressDetails.push(entry.data);
      }
      continue;
    }
    if (entry.event === "complete" || entry.event === "pending" || entry.event === "timeout" || entry.event === "error") {
      terminalEvent = entry.event;
      payload = entry.data;
    }
  }
  return {
    payload,
    terminalEvent,
    progressStages,
    progressDetails,
    progressEventCount: progressStages.length,
    eventCount: events.length,
  };
};

const parseOptionalBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
};

const collectGenerationGateIssues = (payload) => {
  const value = payload && typeof payload === "object" ? payload : {};
  const issues = new Set();
  const errors = Array.isArray(value.errors) ? value.errors.map((entry) => String(entry || "").trim()).filter(Boolean) : [];
  for (const entry of errors) {
    if (/^contract_gate_failed/i.test(entry)) issues.add(entry);
    if (/^qa_gate_failed/i.test(entry)) issues.add(entry);
    if (/^page_builder_error:.*page_contract_failed/i.test(entry)) issues.add(entry);
    if (/^hitl_site_plan_not_approved/i.test(entry)) issues.add(entry);
  }
  const resolvedByLayer =
    value.resolvedByLayer && typeof value.resolvedByLayer === "object" ? value.resolvedByLayer : null;
  const contract =
    resolvedByLayer?.contract && typeof resolvedByLayer.contract === "object" ? resolvedByLayer.contract : null;
  const qa = resolvedByLayer?.qa && typeof resolvedByLayer.qa === "object" ? resolvedByLayer.qa : null;
  if (contract?.pass === false) issues.add("contract_gate_failed:resolved.contract.pass=false");
  if (qa?.pass === false) issues.add("qa_gate_failed:resolved.qa.pass=false");
  return Array.from(issues);
};

const loadPersistedResultWhenPending = async (resultSearchRoots, payload, waitMs) => {
  const pending = Boolean(payload?.pending);
  const siteKey = String(payload?.id || "").trim();
  if (!pending || !siteKey || waitMs <= 0) return payload;
  const roots = Array.isArray(resultSearchRoots) && resultSearchRoots.length ? resultSearchRoots : [REPO_ROOT];
  const startedAt = Date.now();
  while (Date.now() - startedAt <= waitMs) {
    for (const root of roots) {
      const resultPath = path.join(root, "asset-factory", "out", "p2w", siteKey, "result.json");
      try {
        const raw = await fs.readFile(resultPath, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.pages) && parsed.pages.length > 0) {
          let auditOk = null;
          const auditPath = path.join(root, "asset-factory", "out", "p2w", siteKey, "audit.json");
          try {
            const auditRaw = await fs.readFile(auditPath, "utf8");
            const audit = JSON.parse(auditRaw);
            auditOk = Boolean(audit?.ok);
          } catch {}
          const gateIssues = collectGenerationGateIssues(parsed);
          const publishStatus =
            auditOk === null ? (gateIssues.length === 0 ? "ready" : "blocked") : auditOk && gateIssues.length === 0 ? "ready" : "blocked";
          return {
            ...(payload && typeof payload === "object" ? payload : {}),
            ...parsed,
            id: siteKey,
            pending: false,
            publishStatus,
            generationGateIssues: gateIssues,
          };
        }
      } catch {}
    }
    await sleep(2500);
  }
  return payload;
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

const pickEvaluationPages = (pages, scope = "home") => {
  const allPages = Array.isArray(pages) ? pages : [];
  if (!allPages.length) return [];
  if (scope === "site") return allPages;
  const home = allPages.find((page) => String(page?.path || "").trim() === "/");
  return [home || allPages[0]];
};

const toList = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
};

const extractPageShapes = (pages) => {
  const shapes = {};
  for (const page of Array.isArray(pages) ? pages : []) {
    const pagePath = String(page?.path || "").trim();
    if (!pagePath) continue;
    const content = Array.isArray(page?.data?.content) ? page.data.content : [];
    const blockTypes = content.map((item) => String(item?.type || "").trim()).filter(Boolean);
    shapes[pagePath] = blockTypes;
  }
  return shapes;
};

const shapeToString = (shape) =>
  (Array.isArray(shape) ? shape : toList(shape))
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(" > ");

const compareExpectedPageShapes = (actualShapes, expectedShapes) => {
  const failures = [];
  const normalizedExpected =
    expectedShapes && typeof expectedShapes === "object" && !Array.isArray(expectedShapes) ? expectedShapes : {};
  for (const [pagePath, expectedShape] of Object.entries(normalizedExpected)) {
    const actualShape = Array.isArray(actualShapes?.[pagePath]) ? actualShapes[pagePath] : null;
    if (!actualShape) {
      failures.push(`pageShapeMissing:${pagePath}`);
      continue;
    }
    const actualText = shapeToString(actualShape);
    const expectedText = shapeToString(expectedShape);
    if (actualText !== expectedText) {
      failures.push(`pageShape:${pagePath}:${actualText || "-"}!=${expectedText || "-"}`);
    }
  }
  return failures;
};

const compareRequiredPagePaths = (pages, requiredPaths) => {
  const required = Array.isArray(requiredPaths)
    ? requiredPaths.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  if (!required.length) return [];
  const normalizedActual = new Set(
    (Array.isArray(pages) ? pages : [])
      .map((page) => String(page?.path || "").trim())
      .filter(Boolean)
  );
  const missing = required.filter((pathValue) => !normalizedActual.has(pathValue));
  return missing.map((pathValue) => `requiredPageMissing:${pathValue}`);
};

const compareForbiddenPagePaths = (pages, forbiddenPaths) => {
  const forbidden = Array.isArray(forbiddenPaths)
    ? forbiddenPaths.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  if (!forbidden.length) return [];
  const normalizedActual = new Set(
    (Array.isArray(pages) ? pages : [])
      .map((page) => String(page?.path || "").trim())
      .filter(Boolean)
  );
  const invalid = forbidden.filter((pathValue) => normalizedActual.has(pathValue));
  return invalid.map((pathValue) => `forbiddenPagePresent:${pathValue}`);
};

const matchesExpectedValue = (actual, expected) => {
  const actualValue = String(actual ?? "");
  return toList(expected).some((candidate) => String(candidate) === actualValue);
};

const matchesExpectedPattern = (actual, expectedPattern) => {
  if (!expectedPattern) return true;
  try {
    return new RegExp(String(expectedPattern), "i").test(String(actual ?? ""));
  } catch {
    return false;
  }
};

const run = async () => {
  const options = parseArgs(process.argv);
  const pageTypeSkillsEnabledOverride = parseOptionalBoolean(process.env.BUILDER_PAGE_TYPE_SKILLS_ENABLED);
  const regressionEnvState = await buildRegressionEnv({ builderRoot: ROOT, repoRoot: REPO_ROOT });
  const effectiveEnv = regressionEnvState.env || process.env;
  const hasLlmProvider =
    Boolean(effectiveEnv.AIBERM_API_KEY) ||
    Boolean(effectiveEnv.OPENROUTER_API_KEY) ||
    Boolean(effectiveEnv.ANTHROPIC_API_KEY);
  const promptsRaw = await fs.readFile(options.promptsFile, "utf8");
  const promptsConfig = JSON.parse(promptsRaw);
  const rawCases = Array.isArray(promptsConfig?.cases) ? promptsConfig.cases : [];
  const caseFilterSet = new Set(options.caseIds);
  const filteredCases = caseFilterSet.size
    ? rawCases.filter((item) => caseFilterSet.has(String(item?.id || "").trim()))
    : rawCases;
  const missingCaseIds = caseFilterSet.size
    ? [...caseFilterSet].filter((id) => !filteredCases.some((item) => String(item?.id || "").trim() === id))
    : [];
  if (missingCaseIds.length > 0) {
    console.warn(`[baseline] warning: case ids not found: ${missingCaseIds.join(", ")}`);
  }
  const cases = options.maxCases > 0 ? filteredCases.slice(0, options.maxCases) : filteredCases;
  if (!cases.length) {
    throw new Error(`No prompt cases found in ${options.promptsFile}`);
  }

  console.log(`[baseline] baseUrl=${options.baseUrl}`);
  console.log(`[baseline] prompts=${options.promptsFile}`);
  console.log(`[baseline] cases=${cases.length}`);
  if (regressionEnvState.loadedFiles.length > 0) {
    for (const item of regressionEnvState.loadedFiles) {
      console.log(`[env] loaded ${item.filePath} keys=${item.applied}`);
    }
  }
  const resultSearchRoots = buildResultSearchRoots({
    primaryRoot: REPO_ROOT,
    loadedFiles: regressionEnvState.loadedFiles,
  });

  const results = [];

  for (let i = 0; i < cases.length; i += 1) {
    const c = cases[i];
    const title = `${i + 1}/${cases.length} ${c.id}`;
    if (Boolean(c.requiresLlm) && !hasLlmProvider) {
      const skippedRow = {
        id: c.id,
        description: c.description,
        requestId: null,
        responseId: null,
        statusCode: null,
        passed: true,
        skipped: true,
        durationMs: 0,
        errors: [],
        missingRequired: [],
        blockTypes: [],
        detectedCategories: [],
        hasFallbackBlock: false,
        hasSectionFallbackError: false,
        hasTimeoutFallback: false,
        assertionFailures: [],
        componentsCount: 0,
        pageCount: 0,
        pageShapes: {},
        templatePlanProfile: "",
        resolutionLayer: "",
        shortCircuited: false,
        publishStatus: "",
        gateIssueCount: 0,
        generationGateIssues: [],
        requestError: null,
        logMetrics: {
          usageInputTokens: 0,
          usageOutputTokens: 0,
          sectionOk: 0,
          sectionFallback: 0,
          parseFailed: 0,
          layoutInvalid: 0,
          providerFailed: 0,
          toolMissing: 0,
          toolEmptyPayload: 0,
          timeoutFallback: 0,
        },
      };
      results.push(skippedRow);
      console.log(`[SKIP] ${title} requiresLlm=true but no LLM provider key detected in environment`);
      continue;
    }
    const before = await readLogSize(options.logFile);
    const startedAt = Date.now();

    let response;
    let payload;
    let requestError = null;
    let progressTerminalEvent = "";
    let progressStages = [];
    let progressEventCount = 0;
    let progressRawEventCount = 0;

    try {
      const caseRequestBody =
        c.requestBody && typeof c.requestBody === "object" && !Array.isArray(c.requestBody)
          ? c.requestBody
          : {};
      const requestBody = {
        prompt: c.prompt,
        persist: options.persist,
        ...(options.streamProgress ? { stream: true } : {}),
        ...caseRequestBody,
        ...(options.requestTimeoutMs > 0 ? { requestTimeoutMs: options.requestTimeoutMs } : {}),
        ...(typeof pageTypeSkillsEnabledOverride === "boolean"
          ? { pageTypeSkillsEnabled: pageTypeSkillsEnabledOverride }
          : {}),
      };
      response = await fetch(`${options.baseUrl}/api/creation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (options.streamProgress) {
        const streamResult = await readStreamResponse(response);
        payload = streamResult.payload;
        progressTerminalEvent = String(streamResult.terminalEvent || "");
        progressStages = Array.isArray(streamResult.progressStages) ? streamResult.progressStages : [];
        progressEventCount = Number(streamResult.progressEventCount || 0);
        progressRawEventCount = Number(streamResult.eventCount || 0);
        if (progressTerminalEvent === "error") {
          const streamError = String(streamResult?.payload?.error || "generation_failed");
          requestError = requestError || `streamError:${streamError}`;
        }
      } else {
        payload = await safeJson(response);
      }
      payload = await loadPersistedResultWhenPending(resultSearchRoots, payload, options.pendingWaitMs);
    } catch (error) {
      requestError = error instanceof Error ? error.message : String(error);
      payload = null;
    }

    const durationMs = Date.now() - startedAt;
    await sleep(options.delayMs);

    const after = await readLogSize(options.logFile);
    const logSlice = await readLogSlice(options.logFile, before, after);
    const logMetrics = parseLogMetrics(logSlice);

    const evaluationScope = c.categoryScope === "site" ? "site" : "home";
    const evaluationPages = pickEvaluationPages(payload?.pages, evaluationScope);
    const blocks = evaluationPages.flatMap((page) =>
      Array.isArray(page?.data?.content) ? page.data.content : []
    );
    const pageShapes = extractPageShapes(payload?.pages);
    const blockTypes = blocks.map((item) => String(item?.type ?? "")).filter(Boolean);
    const categories = new Set();
    for (const block of blocks) {
      const mapped = categorizeBlock(block);
      for (const cat of mapped) categories.add(cat);
    }
    if (evaluationScope === "site") {
      const inferredByPath = inferCategoriesFromPagePaths(payload?.pages);
      for (const cat of inferredByPath) categories.add(cat);
    }

    const errors = Array.isArray(payload?.errors) ? payload.errors.map((e) => String(e)) : [];
    const required = Array.isArray(c.requiredCategories)
      ? c.requiredCategories.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
      : [];
    const missingRequired = required.filter((item) => !categories.has(item));

    const hasFallbackBlock = blockTypes.some((type) => normalizeType(type) === "creationfallbacksection");
    const hasSectionFallbackError = errors.some((item) => item.includes("builder_section_fallback"));
    const pageCount = Array.isArray(payload?.pages) ? payload.pages.length : 0;
    const recoveredFromDeferredPersist =
      Boolean(payload && payload.pending === false) &&
      pageCount > 0 &&
      !errors.includes("generation_timeout_fallback") &&
      logMetrics.timeoutFallback > 0;
    const hasTimeoutFallback =
      errors.includes("generation_timeout_fallback") ||
      (logMetrics.timeoutFallback > 0 && !recoveredFromDeferredPersist);
    const resolvedByLayer =
      payload?.resolvedByLayer && typeof payload.resolvedByLayer === "object" ? payload.resolvedByLayer : {};
    const candidateSelection =
      resolvedByLayer?.candidateSelection && typeof resolvedByLayer.candidateSelection === "object"
        ? resolvedByLayer.candidateSelection
        : {};
    const templatePlanProfile = String(resolvedByLayer?.templatePlanProfile ?? "");
    const resolutionLayer = String(resolvedByLayer?.resolutionLayer ?? "");
    const fanOutMode = String(resolvedByLayer?.skillOrchestration?.diagnostics?.mode ?? "");
    const pageBuilderSubgraph = Boolean(resolvedByLayer?.skillOrchestration?.diagnostics?.pageBuilderSubgraph);
    const shortCircuited = Boolean(candidateSelection?.shortCircuited);
    const publishStatus = String(payload?.publishStatus || "");
    const generationGateIssues = Array.isArray(payload?.generationGateIssues)
      ? payload.generationGateIssues.map((entry) => String(entry)).filter(Boolean)
      : [];
    const qaOverallFromReport = Number(payload?.qaReport?.overallScore);
    const qaOverallFromResolved = Number(resolvedByLayer?.qa?.overallScore);
    const qaOverallRaw = Number.isFinite(qaOverallFromReport) ? qaOverallFromReport : qaOverallFromResolved;
    const qaOverallScore = Number.isFinite(qaOverallRaw) && qaOverallRaw > 0 ? qaOverallRaw : null;
    const publishReady = publishStatus ? publishStatus === "ready" : true;
    const noGateIssues = generationGateIssues.length === 0;

    const assertionFailures = [];
    if (c.expectedProfileId && !matchesExpectedValue(templatePlanProfile, c.expectedProfileId)) {
      assertionFailures.push(`profile:${templatePlanProfile || "-"}`);
    }
    if (c.expectedProfilePattern && !matchesExpectedPattern(templatePlanProfile, c.expectedProfilePattern)) {
      assertionFailures.push(`profilePattern:${templatePlanProfile || "-"}`);
    }
    if (c.expectedResolutionLayer && !matchesExpectedValue(resolutionLayer, c.expectedResolutionLayer)) {
      assertionFailures.push(`layer:${resolutionLayer || "-"}`);
    }
    if (c.expectedFanOutMode && !matchesExpectedValue(fanOutMode, c.expectedFanOutMode)) {
      assertionFailures.push(`fanOutMode:${fanOutMode || "-"}`);
    }
    if (typeof c.expectPageBuilderSubgraph === "boolean" && pageBuilderSubgraph !== c.expectPageBuilderSubgraph) {
      assertionFailures.push(`pageBuilderSubgraph:${pageBuilderSubgraph}`);
    }
    const expectedProgressTerminalEvents = toList(c.expectedProgressTerminalEvents)
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);
    if (
      options.streamProgress &&
      expectedProgressTerminalEvents.length > 0 &&
      !expectedProgressTerminalEvents.includes(progressTerminalEvent)
    ) {
      assertionFailures.push(
        `progressTerminalEvent:${progressTerminalEvent || "-"}!=${expectedProgressTerminalEvents.join("|")}`
      );
    }
    if (typeof c.minPages === "number" && pageCount < c.minPages) {
      assertionFailures.push(`minPages:${pageCount}<${c.minPages}`);
    }
    if (typeof c.maxPages === "number" && pageCount > c.maxPages) {
      assertionFailures.push(`maxPages:${pageCount}>${c.maxPages}`);
    }
    if (typeof c.expectShortCircuited === "boolean" && shortCircuited !== c.expectShortCircuited) {
      assertionFailures.push(`shortCircuited:${shortCircuited}`);
    }
    assertionFailures.push(...compareRequiredPagePaths(payload?.pages, c.requiredPagePaths));
    assertionFailures.push(...compareForbiddenPagePaths(payload?.pages, c.forbiddenPagePaths));
    assertionFailures.push(...compareExpectedPageShapes(pageShapes, c.expectedPageShapes));
    if (options.streamProgress && options.enforceProgressStages && !requestError) {
      const normalizedProgressStages = new Set(progressStages.map((entry) => String(entry || "").trim()).filter(Boolean));
      const requireStage = (stage) => {
        if (!normalizedProgressStages.has(stage)) {
          assertionFailures.push(`progressStageMissing:${stage}`);
        }
      };
      const requireAnyStage = (stages, label) => {
        const hasAny = stages.some((stage) => normalizedProgressStages.has(stage));
        if (!hasAny) assertionFailures.push(`progressStageMissingAny:${label}`);
      };
      requireStage("request_received");
      requireStage("prompt_parsed");
      requireStage("structured_input_parsed");
      requireStage("generation_started");
      requireStage("planner_started");
      requireStage("planner_completed");
      requireStage("page_builder_started");
      if (options.persist) {
        requireStage("persist_started");
      }
      if (progressTerminalEvent === "complete") {
        requireStage("generation_completed");
        requireStage("assembler_started");
        requireStage("assembler_completed");
        if (options.persist) requireStage("persist_completed");
      } else if (progressTerminalEvent === "pending" || progressTerminalEvent === "timeout") {
        requireAnyStage(["generation_timeout", "generation_completed_after_timeout"], "timeout_or_grace_complete");
        if (options.persist) requireAnyStage(["persist_completed", "pending_returned"], "persist_completed_or_pending");
      } else {
        assertionFailures.push(`progressTerminalEvent:${progressTerminalEvent || "-"}`);
      }
    }

    const timeoutFallbackFailed = options.allowTimeoutFallback ? false : hasTimeoutFallback;
    if (options.enforcePublishReady && !publishReady) {
      assertionFailures.push(`publishStatus:${publishStatus || "-"}`);
    }
    if (options.enforceNoGateIssues && !noGateIssues) {
      assertionFailures.push(`gateIssues:${generationGateIssues.length}`);
    }
    const passed =
      !requestError &&
      Boolean(response?.ok) &&
      missingRequired.length === 0 &&
      !hasFallbackBlock &&
      !hasSectionFallbackError &&
      !timeoutFallbackFailed &&
      assertionFailures.length === 0;

    const row = {
      id: c.id,
      description: c.description,
      requestId: payload?.requestId ?? null,
      responseId: payload?.id ?? null,
      statusCode: response?.status ?? null,
      passed,
      skipped: false,
      durationMs,
      errors,
      missingRequired,
      blockTypes,
      detectedCategories: Array.from(categories).sort(),
      hasFallbackBlock,
      hasSectionFallbackError,
      hasTimeoutFallback,
      assertionFailures,
      componentsCount: Array.isArray(payload?.components) ? payload.components.length : 0,
      pageCount,
      pageShapes,
      templatePlanProfile,
      resolutionLayer,
      fanOutMode,
      pageBuilderSubgraph,
      shortCircuited,
      publishStatus,
      gateIssueCount: generationGateIssues.length,
      generationGateIssues,
      qaOverallScore,
      progressTerminalEvent,
      progressEventCount,
      progressRawEventCount,
      progressStages: Array.from(new Set(progressStages)),
      requestError,
      logMetrics,
    };

    results.push(row);

    const statusTag = passed ? "PASS" : "FAIL";
    console.log(
      `[${statusTag}] ${title} duration=${formatMs(durationMs)} ` +
        `types=${blockTypes.length} missing=[${missingRequired.join(",")}] gates=${generationGateIssues.length} asserts=[${assertionFailures.join(",")}] ` +
        `inTok=${logMetrics.usageInputTokens} outTok=${logMetrics.usageOutputTokens}`
    );
  }

  const total = results.length;
  const skipped = results.filter((item) => item.skipped).length;
  const executed = Math.max(0, total - skipped);
  const passed = results.filter((item) => item.passed && !item.skipped).length;
  const failed = Math.max(0, executed - passed);
  const executedRows = results.filter((item) => !item.skipped);
  const withFallback = executedRows.filter((item) => item.hasFallbackBlock || item.hasSectionFallbackError).length;
  const withTimeout = executedRows.filter((item) => item.hasTimeoutFallback).length;
  const withAssertionFailures = executedRows.filter((item) => item.assertionFailures.length > 0).length;

  const durationList = executedRows.map((item) => item.durationMs);
  const qaScoreList = executedRows
    .map((item) => (Number.isFinite(Number(item.qaOverallScore)) ? Number(item.qaOverallScore) : null))
    .filter((item) => item !== null);
  const summary = {
    total,
    executed,
    skipped,
    passed,
    failed,
    successRate: executed ? passed / executed : 1,
    fallbackRate: executed ? withFallback / executed : 0,
    timeoutRate: executed ? withTimeout / executed : 0,
    avgDurationMs: executed ? Math.round(durationList.reduce((a, b) => a + b, 0) / executed) : 0,
    p95DurationMs: percentile(durationList, 95),
    totalUsageInputTokens: executedRows.reduce((sum, item) => sum + item.logMetrics.usageInputTokens, 0),
    totalUsageOutputTokens: executedRows.reduce((sum, item) => sum + item.logMetrics.usageOutputTokens, 0),
    totalProviderFailures: executedRows.reduce((sum, item) => sum + item.logMetrics.providerFailed, 0),
    totalParseFailures: executedRows.reduce((sum, item) => sum + item.logMetrics.parseFailed, 0),
    totalLayoutInvalid: executedRows.reduce((sum, item) => sum + item.logMetrics.layoutInvalid, 0),
    totalToolMissing: executedRows.reduce((sum, item) => sum + item.logMetrics.toolMissing, 0),
    totalToolEmptyPayload: executedRows.reduce((sum, item) => sum + item.logMetrics.toolEmptyPayload, 0),
    assertionFailureRate: executed ? withAssertionFailures / executed : 0,
    avgQaOverallScore: qaScoreList.length
      ? Number((qaScoreList.reduce((sum, score) => sum + score, 0) / qaScoreList.length).toFixed(4))
      : null,
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
    `- skipped: ${summary.skipped}`,
    `- successRate: ${toPercent(summary.successRate)}`,
    `- fallbackRate: ${toPercent(summary.fallbackRate)}`,
    `- timeoutRate: ${toPercent(summary.timeoutRate)}`,
    `- assertionFailureRate: ${toPercent(summary.assertionFailureRate)}`,
    `- avgDuration: ${formatMs(summary.avgDurationMs)}`,
    `- p95Duration: ${formatMs(summary.p95DurationMs)}`,
    `- avgQaOverallScore: ${summary.avgQaOverallScore ?? "-"}`,
    `- inputTokens(sum): ${summary.totalUsageInputTokens}`,
    `- outputTokens(sum): ${summary.totalUsageOutputTokens}`,
    "",
    "## Cases",
    "",
    "| case | status | duration | profile | pages | publishStatus | gateIssues | qaOverall | missingRequired | assertionFailures | inputTokens | outputTokens |",
    "|---|---|---:|---|---:|---|---:|---:|---|---|---:|---:|",
    ...results.map((item) => {
      const status = item.skipped ? "SKIP" : item.passed ? "PASS" : "FAIL";
      const missing = item.missingRequired.length ? item.missingRequired.join(",") : "-";
      const assertions = item.assertionFailures.length ? item.assertionFailures.join(",") : "-";
      return `| ${item.id} | ${status} | ${formatMs(item.durationMs)} | ${item.templatePlanProfile || "-"} | ${item.pageCount} | ${item.publishStatus || "-"} | ${item.gateIssueCount || 0} | ${item.qaOverallScore ?? "-"} | ${missing} | ${assertions} | ${item.logMetrics.usageInputTokens} | ${item.logMetrics.usageOutputTokens} |`;
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
