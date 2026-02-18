import path from "node:path";

const clampInt = (value, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, fallback = 0 } = {}) => {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  if (n < min) return min;
  if (n > max) return max;
  return n;
};

const clampNumber = (value, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, fallback = 0 } = {}) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  if (n < min) return min;
  if (n > max) return max;
  return n;
};

const normalizeRenderer = (value) => (String(value || "").trim().toLowerCase() === "render" ? "render" : "sandbox");

const normalizeFidelityMode = (value) => (String(value || "").trim().toLowerCase() === "strict" ? "strict" : "standard");

const normalizeFidelityEnforcement = (value) =>
  (String(value || "").trim().toLowerCase() === "fail" ? "fail" : "warn");

const normalizeStrictRequiredCasesPolicy = (value) => {
  const token = String(value || "").trim().toLowerCase();
  if (token === "fail" || token === "ignore" || token === "warn") return token;
  return "warn";
};

const normalizePatternList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const normalizeTemplateFactoryOptions = (input, context = {}) => {
  const root = context.root ? path.resolve(context.root) : process.cwd();
  const manifestRaw = String(input?.manifest || "").trim();
  const manifest = manifestRaw ? (path.isAbsolute(manifestRaw) ? manifestRaw : path.resolve(root, manifestRaw)) : "";

  const options = {
    manifest,
    runId: String(input?.runId || "").trim(),
    skipIngest: Boolean(input?.skipIngest),
    requestedSkipRegression: Boolean(input?.requestedSkipRegression),
    publish: input?.publish !== false,
    groups: String(input?.groups || "").trim() || "C_template_first",
    renderer: normalizeRenderer(input?.renderer),
    maxCases: clampInt(input?.maxCases, { min: 0, fallback: 0 }),
    previewBaseUrl: String(input?.previewBaseUrl || "").trim() || "http://127.0.0.1:3110",
    launchPreviewServer: input?.launchPreviewServer !== false,
    crawlSite: Boolean(input?.crawlSite),
    crawlMaxPages: clampInt(input?.crawlMaxPages, { min: 1, fallback: 16 }),
    crawlMaxDepth: clampInt(input?.crawlMaxDepth, { min: 0, fallback: 1 }),
    crawlCapturePages: clampInt(input?.crawlCapturePages, { min: 0, fallback: 12 }),
    maxDiscoveredPages: clampInt(input?.maxDiscoveredPages, { min: 4, fallback: 24 }),
    maxNavLinks: clampInt(input?.maxNavLinks, { min: 3, fallback: 8 }),
    mustIncludePatterns: normalizePatternList(input?.mustIncludePatterns),
    requiredPagesPerSite: clampInt(input?.requiredPagesPerSite, { min: 1, max: 12, fallback: 4 }),
    strictAvgSimilarityMin: clampInt(input?.strictAvgSimilarityMin, { min: 0, max: 100, fallback: 85 }),
    strictPageSimilarityMin: clampInt(input?.strictPageSimilarityMin, { min: 0, max: 100, fallback: 78 }),
    fidelityStructureWeight: clampNumber(input?.fidelityStructureWeight, { min: 0, max: 1, fallback: 0.2 }),
    antiCrawlPrecheck: input?.antiCrawlPrecheck !== false,
    antiCrawlTimeoutMs: clampInt(input?.antiCrawlTimeoutMs, { min: 1000, fallback: 25000 }),
    fastMode: Boolean(input?.fastMode),
    fidelityMode: normalizeFidelityMode(input?.fidelityMode),
    fidelityThreshold: clampInt(input?.fidelityThreshold, { min: 0, max: 100, fallback: 72 }),
    fidelityEnforcement: normalizeFidelityEnforcement(input?.fidelityEnforcement),
    strictRequiredCasesPolicy: normalizeStrictRequiredCasesPolicy(input?.strictRequiredCasesPolicy),
    templateExclusiveBlocks: input?.templateExclusiveBlocks !== false,
    autoRepairIterations: clampInt(input?.autoRepairIterations, { min: 0, max: 5, fallback: 0 }),
    pixelMode: Boolean(input?.pixelMode),
    pipelineParallel: Boolean(input?.pipelineParallel),
    pipelineParallelConcurrency: clampInt(input?.pipelineParallelConcurrency, { min: 1, max: 10, fallback: 3 }),
    screenshotConcurrency: clampInt(input?.screenshotConcurrency, { min: 1, max: 20, fallback: 2 }),
    crawlConcurrency: clampInt(input?.crawlConcurrency, { min: 1, max: 20, fallback: 2 }),
    regressionConcurrency: clampInt(input?.regressionConcurrency, { min: 1, max: 20, fallback: 3 }),
    screenshotTimeoutMs: clampInt(input?.screenshotTimeoutMs, { min: 5000, fallback: 90000 }),
    crawlTimeoutMs: clampInt(input?.crawlTimeoutMs, { min: 5000, fallback: 20000 }),
    siteRetryCount: clampInt(input?.siteRetryCount, { min: 0, max: 5, fallback: 1 }),
    siteRetryDelayMs: clampInt(input?.siteRetryDelayMs, { min: 0, fallback: 1500 }),
    siteCircuitBreakerThreshold: clampInt(input?.siteCircuitBreakerThreshold, { min: 1, max: 5, fallback: 2 }),
    regressionTimeoutMs: clampInt(input?.regressionTimeoutMs, { min: 0, fallback: 0 }),
    totalTimeoutMs: clampInt(input?.totalTimeoutMs, { min: 0, fallback: 0 }),
  };

  if (options.pixelMode) {
    options.fidelityMode = "strict";
    options.fidelityThreshold = Math.max(82, options.fidelityThreshold);
    options.fidelityEnforcement = "warn";
    options.autoRepairIterations = Math.max(2, options.autoRepairIterations);
  }

  return options;
};
