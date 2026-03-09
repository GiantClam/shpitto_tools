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

const normalizeFidelityScoringPhase = (value) => {
  const token = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  if (token === "structure" || token === "structure_first") return "structure";
  if (token === "visual" || token === "visual_first") return "visual";
  if (token === "balanced") return "balanced";
  return "auto";
};

const normalizeSiteStyleProfile = (value) => {
  const token = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  if (!token || token === "sourceauto") return "source_auto";
  if (token === "corporate_minimal") return "corporate_minimal";
  if (token === "corporate_trust_heavy" || token === "corporate_trust" || token === "trust_heavy") {
    return "corporate_trust_heavy";
  }
  if (token === "corporate_modern") return "corporate_modern";
  return "source_auto";
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

const normalizeTemplateFactoryMode = (value) => {
  const token = String(value || "").trim().toLowerCase();
  if (token === "pen-build" || token === "pen_build") return "pen-build";
  if (token === "pen-review" || token === "pen_review") return "pen-review";
  if (token === "template-from-pen" || token === "template_from_pen") return "template-publish";
  return "template-publish";
};

const normalizePenReviewStatus = (value) => {
  const token = String(value || "").trim().toLowerCase();
  if (token === "approved" || token === "rejected" || token === "pending") return token;
  return "pending";
};

export const normalizeTemplateFactoryOptions = (input, context = {}) => {
  const root = context.root ? path.resolve(context.root) : process.cwd();
  const autoRepairIterationsExplicit =
    context?.autoRepairIterationsExplicit === true ||
    (input?.autoRepairIterations !== undefined &&
      input?.autoRepairIterations !== null &&
      String(input.autoRepairIterations).trim().length > 0);
  const manifestRaw = String(input?.manifest || "").trim();
  const manifest = manifestRaw ? (path.isAbsolute(manifestRaw) ? manifestRaw : path.resolve(root, manifestRaw)) : "";
  const intakeReviewFileRaw = String(input?.intakeReviewFile || "").trim();
  const intakeReviewFile = intakeReviewFileRaw
    ? path.isAbsolute(intakeReviewFileRaw)
      ? intakeReviewFileRaw
      : path.resolve(root, intakeReviewFileRaw)
    : "";
  const assetApprovalFileRaw = String(input?.assetApprovalFile || "").trim();
  const assetApprovalFile = assetApprovalFileRaw
    ? path.isAbsolute(assetApprovalFileRaw)
      ? assetApprovalFileRaw
      : path.resolve(root, assetApprovalFileRaw)
    : "";
  const penFileRaw = String(input?.penFile || "").trim();
  const penFile = penFileRaw
    ? path.isAbsolute(penFileRaw)
      ? penFileRaw
      : path.resolve(root, penFileRaw)
    : "";
  const penReviewFileRaw = String(input?.penReviewFile || "").trim();
  const penReviewFile = penReviewFileRaw
    ? path.isAbsolute(penReviewFileRaw)
      ? penReviewFileRaw
      : path.resolve(root, penReviewFileRaw)
    : "";

  const options = {
    mode: normalizeTemplateFactoryMode(input?.mode),
    penFile,
    penReviewFile,
    penReviewStatus: normalizePenReviewStatus(input?.penReviewStatus),
    penReviewer: String(input?.penReviewer || "").trim(),
    penReviewNotes: String(input?.penReviewNotes || "").trim(),
    openPencilAfterPenBuild: input?.openPencilAfterPenBuild !== false,
    penPreviewCompare: input?.penPreviewCompare !== false,
    pencilEnabled: input?.pencilEnabled !== false,
    pencilCommand: String(input?.pencilCommand || "").trim(),
    pencilStrict: input?.pencilStrict !== false,
    manifest,
    runId: String(input?.runId || "").trim(),
    skipIngest: Boolean(input?.skipIngest),
    homeOnly: Boolean(input?.homeOnly),
    homeOnlyEval: Boolean(input?.homeOnlyEval),
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
    intakeReviewFile,
    assetApprovalFile,
    siteStyleProfile: normalizeSiteStyleProfile(input?.siteStyleProfile),
    requiredPagesPerSite: clampInt(input?.requiredPagesPerSite, { min: 1, max: 12, fallback: 4 }),
    strictAvgSimilarityMin: clampInt(input?.strictAvgSimilarityMin, { min: 0, max: 100, fallback: 95 }),
    strictPageSimilarityMin: clampInt(input?.strictPageSimilarityMin, { min: 0, max: 100, fallback: 90 }),
    fidelityStructureWeight: clampNumber(input?.fidelityStructureWeight, { min: 0, max: 1, fallback: 0.2 }),
    fidelityScoringPhase: normalizeFidelityScoringPhase(input?.fidelityScoringPhase),
    antiCrawlPrecheck: input?.antiCrawlPrecheck !== false,
    antiCrawlTimeoutMs: clampInt(input?.antiCrawlTimeoutMs, { min: 1000, fallback: 25000 }),
    fastMode: Boolean(input?.fastMode),
    fidelityMode: normalizeFidelityMode(input?.fidelityMode),
    fidelityThreshold: clampInt(input?.fidelityThreshold, { min: 0, max: 100, fallback: 72 }),
    fidelityEnforcement: normalizeFidelityEnforcement(input?.fidelityEnforcement),
    strictRequiredCasesPolicy: normalizeStrictRequiredCasesPolicy(input?.strictRequiredCasesPolicy),
    gateMinSitePages: clampInt(input?.gateMinSitePages, { min: 1, max: 200, fallback: 8 }),
    gateMinPageSpecCoverage: clampInt(input?.gateMinPageSpecCoverage, { min: 0, max: 100, fallback: 90 }),
    gateMinLinkSuccessRate: clampInt(input?.gateMinLinkSuccessRate, { min: 0, max: 100, fallback: 98 }),
    gateMinNavFooterLinkSuccessRate: clampInt(input?.gateMinNavFooterLinkSuccessRate, {
      min: 0,
      max: 100,
      fallback: 95,
    }),
    gateMinRequiredRoleCoverage: clampInt(input?.gateMinRequiredRoleCoverage, { min: 0, max: 100, fallback: 100 }),
    gateMinDesignContractScore: clampInt(input?.gateMinDesignContractScore, { min: 0, max: 100, fallback: 90 }),
    gateMinAccessibilityScore: clampInt(input?.gateMinAccessibilityScore, { min: 0, max: 100, fallback: 90 }),
    gateMinAssetContractScore: clampInt(input?.gateMinAssetContractScore, { min: 0, max: 100, fallback: 85 }),
    gateMinOverallSimilarity: clampInt(input?.gateMinOverallSimilarity, { min: 0, max: 100, fallback: 95 }),
    gateMinSiteSimilarity: clampInt(input?.gateMinSiteSimilarity, { min: 0, max: 100, fallback: 95 }),
    gateMinSiteVisualSimilarity: clampInt(input?.gateMinSiteVisualSimilarity, { min: 0, max: 100, fallback: 90 }),
    gateRequireKeyFlowIntegrity: input?.gateRequireKeyFlowIntegrity !== false,
    templateExclusiveBlocks: input?.templateExclusiveBlocks !== false,
    autoRepairIterations: clampInt(input?.autoRepairIterations, { min: 0, max: 5, fallback: 0 }),
    regressionCandidatesPerAttempt: clampInt(input?.regressionCandidatesPerAttempt, { min: 1, max: 5, fallback: 2 }),
    homeCopyHardConstraints: input?.homeCopyHardConstraints !== false,
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
    structureFirstPipeline: input?.structureFirstPipeline !== false,
    structureFirstDisableImages: input?.structureFirstDisableImages !== false,
    structureFirstDisableMotion: input?.structureFirstDisableMotion !== false,
    structureFirstBackfillImages: input?.structureFirstBackfillImages !== false,
    structureFirstBackfillMotion: input?.structureFirstBackfillMotion !== false,
    autoPrivateBlocks: input?.autoPrivateBlocks !== false,
    autoPrivateSectionSimilarityThreshold: clampInt(input?.autoPrivateSectionSimilarityThreshold, {
      min: 0,
      max: 100,
      fallback: 97,
    }),
    autoPrivateTargetKinds: normalizePatternList(input?.autoPrivateTargetKinds),
  };

  if (options.pixelMode) {
    options.fidelityMode = "strict";
    options.fidelityThreshold = Math.max(82, options.fidelityThreshold);
    options.fidelityEnforcement = "warn";
    options.autoRepairIterations = Math.max(2, options.autoRepairIterations);
  }

  if (options.homeOnly) {
    options.requiredPagesPerSite = 1;
    options.crawlCapturePages = 1;
    options.maxCases = options.maxCases > 0 ? Math.min(options.maxCases, 1) : 1;
    options.crawlMaxDepth = Math.min(options.crawlMaxDepth, 1);
    options.crawlMaxPages = Math.min(options.crawlMaxPages, 8);
    options.strictRequiredCasesPolicy = "warn";
    if (!autoRepairIterationsExplicit) {
      options.autoRepairIterations = Math.max(4, options.autoRepairIterations);
    }
    options.gateMinSitePages = 1;
    options.gateMinRequiredRoleCoverage = Math.min(options.gateMinRequiredRoleCoverage, 25);
    options.gateMinOverallSimilarity = 0;
    options.gateMinSiteSimilarity = 0;
    options.gateMinSiteVisualSimilarity = 0;
    options.gateRequireKeyFlowIntegrity = false;
    options.fastMode = options.homeOnlyEval ? options.fastMode : true;
  }

  return options;
};
