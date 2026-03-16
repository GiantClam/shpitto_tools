import path from "node:path";
import { TEMPLATE_FACTORY_DEFAULTS } from "./defaults.mjs";
import { normalizeTemplateFactoryOptions } from "./schema.mjs";

const nowStamp = () => {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(
    d.getSeconds()
  )}`;
};

const slug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const resolveCliOptions = (argv, context = {}) => {
  const root = context.root ? path.resolve(context.root) : process.cwd();
  const defaults = {
    ...TEMPLATE_FACTORY_DEFAULTS,
    manifest: context.defaultManifest || TEMPLATE_FACTORY_DEFAULTS.manifest,
    groups: context.defaultTemplateFirstGroup || TEMPLATE_FACTORY_DEFAULTS.groups,
    previewBaseUrl: context.defaultPreviewBaseUrl || TEMPLATE_FACTORY_DEFAULTS.previewBaseUrl,
    runId: `${TEMPLATE_FACTORY_DEFAULTS.runIdPrefix}-${nowStamp()}`,
  };

  const raw = { ...defaults };
  let autoRepairIterationsExplicit = false;

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--mode" && next) {
      raw.mode = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--template-fidelity") {
      raw.templateFidelityEnabled = true;
      continue;
    }
    if (arg === "--no-template-fidelity") {
      raw.templateFidelityEnabled = false;
      continue;
    }
    if (arg === "--template-fidelity-replay-count" && next) {
      raw.templateFidelityReplayCount = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--template-fidelity-case-file" && next) {
      raw.templateFidelityCaseFile = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--template-fidelity-case-id" && next) {
      raw.templateFidelityCaseId = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--template-fidelity-screenshot-similarity-min" && next) {
      raw.templateFidelityScreenshotSimilarityMin = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--template-fidelity-structure-similarity-min" && next) {
      raw.templateFidelityStructureSimilarityMin = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--template-fidelity-nav-footer-contrast-min" && next) {
      raw.templateFidelityNavFooterContrastMin = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--pen-file" && next) {
      raw.penFile = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--pen-review-file" && next) {
      raw.penReviewFile = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--pen-review-status" && next) {
      raw.penReviewStatus = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--pen-reviewer" && next) {
      raw.penReviewer = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--pen-review-notes" && next) {
      raw.penReviewNotes = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--open-pencil-after-pen-build") {
      raw.openPencilAfterPenBuild = true;
      continue;
    }
    if (arg === "--no-open-pencil-after-pen-build") {
      raw.openPencilAfterPenBuild = false;
      continue;
    }
    if (arg === "--pen-preview-compare") {
      raw.penPreviewCompare = true;
      continue;
    }
    if (arg === "--no-pen-preview-compare") {
      raw.penPreviewCompare = false;
      continue;
    }
    if (arg === "--pencil-command" && next) {
      raw.pencilCommand = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--pencil-enabled") {
      raw.pencilEnabled = true;
      continue;
    }
    if (arg === "--no-pencil-enabled") {
      raw.pencilEnabled = false;
      continue;
    }
    if (arg === "--pencil-strict") {
      raw.pencilStrict = true;
      continue;
    }
    if (arg === "--no-pencil-strict") {
      raw.pencilStrict = false;
      continue;
    }
    if (arg === "--manifest" && next) {
      raw.manifest = path.resolve(root, String(next));
      i += 1;
      continue;
    }
    if (arg === "--run-id" && next) {
      raw.runId = slug(next) || raw.runId;
      i += 1;
      continue;
    }
    if (arg === "--groups" && next) {
      raw.groups = String(next).trim() || raw.groups;
      i += 1;
      continue;
    }
    if (arg === "--renderer" && next) {
      raw.renderer = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--preview-base-url" && next) {
      raw.previewBaseUrl = String(next).trim() || raw.previewBaseUrl;
      i += 1;
      continue;
    }
    if (arg === "--max-cases" && next) {
      raw.maxCases = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--skip-ingest") {
      raw.skipIngest = true;
      continue;
    }
    if (arg === "--home-only") {
      raw.homeOnly = true;
      continue;
    }
    if (arg === "--home-only-eval") {
      raw.homeOnlyEval = true;
      continue;
    }
    if (arg === "--no-home-only-eval") {
      raw.homeOnlyEval = false;
      continue;
    }
    if (arg === "--no-home-only") {
      raw.homeOnly = false;
      continue;
    }
    if (arg === "--skip-regression") {
      raw.requestedSkipRegression = true;
      continue;
    }
    if (arg === "--crawl-site") {
      raw.crawlSite = true;
      continue;
    }
    if (arg === "--crawl-max-pages" && next) {
      raw.crawlMaxPages = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--crawl-max-depth" && next) {
      raw.crawlMaxDepth = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--crawl-capture-pages" && next) {
      raw.crawlCapturePages = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--max-discovered-pages" && next) {
      raw.maxDiscoveredPages = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--max-nav-links" && next) {
      raw.maxNavLinks = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--must-include-patterns" && next) {
      raw.mustIncludePatterns = String(next);
      i += 1;
      continue;
    }
    if (arg === "--intake-review-file" && next) {
      raw.intakeReviewFile = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--asset-approval-file" && next) {
      raw.assetApprovalFile = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--site-style-profile" && next) {
      raw.siteStyleProfile = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--required-pages-per-site" && next) {
      raw.requiredPagesPerSite = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--strict-avg-similarity-min" && next) {
      raw.strictAvgSimilarityMin = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--strict-page-similarity-min" && next) {
      raw.strictPageSimilarityMin = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--fidelity-structure-weight" && next) {
      raw.fidelityStructureWeight = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--fidelity-scoring-phase" && next) {
      raw.fidelityScoringPhase = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--anti-crawl-precheck") {
      raw.antiCrawlPrecheck = true;
      continue;
    }
    if (arg === "--no-anti-crawl-precheck") {
      raw.antiCrawlPrecheck = false;
      continue;
    }
    if (arg === "--anti-crawl-timeout-ms" && next) {
      raw.antiCrawlTimeoutMs = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--fast") {
      raw.fastMode = true;
      continue;
    }
    if (arg === "--structure-first-pipeline") {
      raw.structureFirstPipeline = true;
      continue;
    }
    if (arg === "--no-structure-first-pipeline") {
      raw.structureFirstPipeline = false;
      continue;
    }
    if (arg === "--structure-first-disable-images") {
      raw.structureFirstDisableImages = true;
      continue;
    }
    if (arg === "--no-structure-first-disable-images") {
      raw.structureFirstDisableImages = false;
      continue;
    }
    if (arg === "--structure-first-disable-motion") {
      raw.structureFirstDisableMotion = true;
      continue;
    }
    if (arg === "--no-structure-first-disable-motion") {
      raw.structureFirstDisableMotion = false;
      continue;
    }
    if (arg === "--structure-first-backfill-images") {
      raw.structureFirstBackfillImages = true;
      continue;
    }
    if (arg === "--no-structure-first-backfill-images") {
      raw.structureFirstBackfillImages = false;
      continue;
    }
    if (arg === "--structure-first-backfill-motion") {
      raw.structureFirstBackfillMotion = true;
      continue;
    }
    if (arg === "--no-structure-first-backfill-motion") {
      raw.structureFirstBackfillMotion = false;
      continue;
    }
    if (arg === "--auto-private-blocks") {
      raw.autoPrivateBlocks = true;
      continue;
    }
    if (arg === "--no-auto-private-blocks") {
      raw.autoPrivateBlocks = false;
      continue;
    }
    if (arg === "--auto-private-section-similarity-threshold" && next) {
      raw.autoPrivateSectionSimilarityThreshold = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--auto-private-target-kinds" && next) {
      raw.autoPrivateTargetKinds = String(next);
      i += 1;
      continue;
    }
    if (arg === "--fidelity-mode" && next) {
      raw.fidelityMode = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--fidelity-threshold" && next) {
      raw.fidelityThreshold = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--fidelity-enforcement" && next) {
      raw.fidelityEnforcement = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--strict-required-cases-policy" && next) {
      raw.strictRequiredCasesPolicy = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--gate-min-site-pages" && next) {
      raw.gateMinSitePages = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--gate-min-page-spec-coverage" && next) {
      raw.gateMinPageSpecCoverage = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--gate-min-link-success-rate" && next) {
      raw.gateMinLinkSuccessRate = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--gate-min-nav-footer-link-success-rate" && next) {
      raw.gateMinNavFooterLinkSuccessRate = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--gate-min-required-role-coverage" && next) {
      raw.gateMinRequiredRoleCoverage = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--gate-min-design-contract-score" && next) {
      raw.gateMinDesignContractScore = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--gate-min-accessibility-score" && next) {
      raw.gateMinAccessibilityScore = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--gate-min-asset-contract-score" && next) {
      raw.gateMinAssetContractScore = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--gate-min-overall-similarity" && next) {
      raw.gateMinOverallSimilarity = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--gate-min-site-similarity" && next) {
      raw.gateMinSiteSimilarity = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--gate-min-site-visual-similarity" && next) {
      raw.gateMinSiteVisualSimilarity = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--no-gate-require-key-flow-integrity") {
      raw.gateRequireKeyFlowIntegrity = false;
      continue;
    }
    if (arg === "--gate-require-key-flow-integrity") {
      raw.gateRequireKeyFlowIntegrity = true;
      continue;
    }
    if (arg === "--template-exclusive-blocks") {
      raw.templateExclusiveBlocks = true;
      continue;
    }
    if (arg === "--no-template-exclusive-blocks") {
      raw.templateExclusiveBlocks = false;
      continue;
    }
    if (arg === "--auto-repair-iterations" && next) {
      raw.autoRepairIterations = Number(next);
      autoRepairIterationsExplicit = true;
      i += 1;
      continue;
    }
    if (arg === "--regression-candidates-per-attempt" && next) {
      raw.regressionCandidatesPerAttempt = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--home-copy-hard-constraints") {
      raw.homeCopyHardConstraints = true;
      continue;
    }
    if (arg === "--no-home-copy-hard-constraints") {
      raw.homeCopyHardConstraints = false;
      continue;
    }
    if (arg === "--pixel-mode") {
      raw.pixelMode = true;
      continue;
    }
    if (arg === "--no-publish") {
      raw.publish = false;
      continue;
    }
    if (arg === "--no-preview-server") {
      raw.launchPreviewServer = false;
      continue;
    }
    if (arg === "--pipeline-parallel") {
      raw.pipelineParallel = true;
      continue;
    }
    if (arg === "--pipeline-parallel-concurrency" && next) {
      raw.pipelineParallelConcurrency = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--screenshot-concurrency" && next) {
      raw.screenshotConcurrency = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--crawl-concurrency" && next) {
      raw.crawlConcurrency = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--regression-concurrency" && next) {
      raw.regressionConcurrency = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--screenshot-timeout-ms" && next) {
      raw.screenshotTimeoutMs = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--crawl-timeout-ms" && next) {
      raw.crawlTimeoutMs = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--site-retry-count" && next) {
      raw.siteRetryCount = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--site-retry-delay-ms" && next) {
      raw.siteRetryDelayMs = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--site-circuit-breaker-threshold" && next) {
      raw.siteCircuitBreakerThreshold = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--regression-timeout-ms" && next) {
      raw.regressionTimeoutMs = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--total-timeout-ms" && next) {
      raw.totalTimeoutMs = Number(next);
      i += 1;
      continue;
    }
  }

  return normalizeTemplateFactoryOptions(raw, { root, autoRepairIterationsExplicit });
};
