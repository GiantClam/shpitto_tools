import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROTOCOL_VERSION = "1.0.0";
const DOMAIN = "corporate";

const readJson = (fileName, fallback) => {
  try {
    const fullPath = path.join(CURRENT_DIR, fileName);
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch {
    return fallback;
  }
};

const PAGE_TYPES_DEF = readJson("page-types.corporate.v1.json", { pageTypes: [] });
const HOME_SKELETONS_DEF = readJson("home-skeletons.corporate.v1.json", { skeletons: [] });
const SECTION_TAXONOMY_DEF = readJson("section-taxonomy.corporate.v1.json", { sections: [] });
const REVIEW_STATUS_DEF = readJson("review-status.v1.json", { statuses: ["draft", "reviewed", "approved", "deprecated"] });

export const CORPORATE_PAGE_TYPES = Array.isArray(PAGE_TYPES_DEF.pageTypes) ? PAGE_TYPES_DEF.pageTypes : [];
export const CORPORATE_HOME_SKELETONS = Array.isArray(HOME_SKELETONS_DEF.skeletons) ? HOME_SKELETONS_DEF.skeletons : [];
export const CORPORATE_SECTION_TAXONOMY = Array.isArray(SECTION_TAXONOMY_DEF.sections)
  ? SECTION_TAXONOMY_DEF.sections
  : [];
export const TEMPLATE_REVIEW_STATUSES = Array.isArray(REVIEW_STATUS_DEF.statuses) ? REVIEW_STATUS_DEF.statuses : [];

const PAGE_TYPE_SET = new Set(CORPORATE_PAGE_TYPES);
const HOME_SKELETON_SET = new Set(CORPORATE_HOME_SKELETONS);
const SECTION_SET = new Set(CORPORATE_SECTION_TAXONOMY);
const REVIEW_STATUS_SET = new Set(TEMPLATE_REVIEW_STATUSES);
const REVIEW_STATUS_TRANSITIONS = Object.freeze({
  draft: new Set(["draft", "reviewed", "approved", "deprecated"]),
  reviewed: new Set(["reviewed", "approved", "deprecated"]),
  approved: new Set(["approved", "deprecated"]),
  deprecated: new Set(["deprecated"]),
});

const asArray = (value) => (Array.isArray(value) ? value : []);

const slug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const normalizePath = (value) => {
  const rawInput = String(value || "").trim();
  if (!rawInput) return "/";
  let raw = rawInput;
  if (/^https?:\/\//i.test(rawInput)) {
    try {
      raw = new URL(rawInput).pathname || "/";
    } catch {
      raw = rawInput;
    }
  }
  const normalized = (raw.startsWith("/") ? raw : `/${raw}`).replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
  return normalized === "" ? "/" : normalized;
};

const dedupe = (items = []) => Array.from(new Set(asArray(items).filter(Boolean)));

const SECTION_KIND_TO_TAXONOMY = Object.freeze({
  hero: "Hero",
  logos: "LogoWall",
  logo: "LogoWall",
  logowall: "LogoWall",
  approach: "FeatureGrid",
  features: "FeatureGrid",
  featuregrid: "FeatureGrid",
  products: "ProductPreview",
  productpreview: "ProductPreview",
  solutions: "Solutions",
  solution: "Solutions",
  cases: "CaseStudyHighlight",
  casestudy: "CaseStudyHighlight",
  case_study: "CaseStudyHighlight",
  stats: "Stats",
  numbers: "Stats",
  socialproof: "Testimonial",
  testimonials: "Testimonial",
  testimonial: "Testimonial",
  team: "TeamPreview",
  faq: "FAQ",
  cta: "CTABanner",
  leadcapturecta: "CTABanner",
  contact: "ContactSection",
});

const mapSectionKind = (kind) => {
  const normalized = String(kind || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, "");
  return SECTION_KIND_TO_TAXONOMY[normalized] || null;
};

const inferPageType = ({ pagePath = "/", pageName = "", taxonomyType = "" } = {}) => {
  const normalizedPath = normalizePath(pagePath).toLowerCase();
  const token = `${normalizedPath} ${String(pageName || "").toLowerCase()}`;
  const explicit = String(taxonomyType || "").trim().toLowerCase();
  if (explicit === "home") return "home";
  if (explicit === "about") return "about";
  if (explicit === "contact" || explicit === "help_faq") return "contact";
  if (explicit === "product_service_list") return "product_overview";
  if (explicit === "detail") return "product_detail";
  if (explicit === "blog_list" || explicit === "blog_detail") return "news_blog";
  if (explicit === "legal") return "legal";
  if (normalizedPath === "/") return "home";
  if (/\/about|\/company|\/team|\/mission|\/story/.test(token)) return "about";
  if (/\/contact|\/get-in-touch|\/support|\/help/.test(token)) return "contact";
  if (/\/services?|\/solutions?/.test(token)) return "services_solutions";
  if (/\/products?|\/collections?|\/technology/.test(token)) {
    return normalizedPath.split("/").filter(Boolean).length >= 2 ? "product_detail" : "product_overview";
  }
  if (/\/case[-_]?stud/.test(token)) return "case_study";
  if (/\/careers?|\/jobs?/.test(token)) return "careers";
  if (/\/news|\/blogs?|\/insights?|\/resources?/.test(token)) return "news_blog";
  if (/\/terms|\/privacy|\/policy|\/legal/.test(token)) return "legal";
  return "generic";
};

const inferHomeSkeleton = (sections = []) => {
  const sectionTypes = asArray(sections).map((section) => String(section?.type || ""));
  const has = (token) => sectionTypes.includes(token);
  const proofCount = ["LogoWall", "Stats", "Testimonial", "CaseStudyHighlight"].filter((token) => has(token)).length;
  if (has("ProductPreview")) return "product-first";
  if (has("Solutions")) return "solution-first";
  if (has("TeamPreview") || (proofCount >= 3 && has("CaseStudyHighlight"))) return "authority-heavy";
  if (has("FAQ") && has("CTABanner")) return "conversion-driven";
  return "trust-first";
};

const inferSkeleton = ({ pageType = "generic", sections = [] } = {}) => {
  if (pageType === "home") return inferHomeSkeleton(sections);
  if (pageType === "about") return "authority-heavy";
  if (pageType === "contact") return "conversion-driven";
  if (pageType === "services_solutions") return "solution-first";
  if (pageType === "product_overview" || pageType === "product_detail") return "product-first";
  return "generic";
};

const toSectionRows = (sectionSpecs = {}) => {
  const specs = sectionSpecs && typeof sectionSpecs === "object" ? sectionSpecs : {};
  const rows = [];
  for (const [kind, entry] of Object.entries(specs)) {
    const type = mapSectionKind(kind);
    if (!type) continue;
    rows.push({
      id: String(kind || ""),
      type,
      variantHint: String(entry?.defaults?.variant || entry?.template_variant?.variant || "default"),
      visualWeight: type === "Hero" || type === "CTABanner" ? "high" : "medium",
      blockType: String(entry?.block_type || ""),
    });
  }
  return rows;
};

const inferVisualProfile = (sections = []) => {
  const count = sections.length;
  const density = count >= 8 ? "high" : count >= 5 ? "medium" : "low";
  const ctaCount = sections.filter((section) => section.type === "CTABanner").length;
  const proofCount = sections.filter((section) => ["LogoWall", "Stats", "Testimonial"].includes(section.type)).length;
  return {
    maxWidth: "xl",
    sectionSpacing: density === "high" ? "md" : "lg",
    density,
    typeScaleBucket: "h1:48-56",
    headlineWeight: "bold",
    motion: "off",
    tone: "professional",
    ctaStyle: ctaCount > 0 ? "contact" : "none",
    proofPriority: proofCount >= 2 ? "high" : "normal",
  };
};

const inferStyleLock = (sections = []) => {
  const heroIndex = sections.findIndex((section) => section.type === "Hero");
  const ctaIndex = sections.findIndex((section) => section.type === "CTABanner");
  const ctaBelowFold = ctaIndex >= 0 && ctaIndex >= Math.floor(sections.length / 2);
  return {
    heroHeight: heroIndex === 0 ? "large" : "medium",
    ctaPlacement: ctaIndex < 0 ? "none" : ctaBelowFold ? "below-fold" : "above-fold",
    proofPriority:
      sections.filter((section) => ["LogoWall", "Stats", "Testimonial", "CaseStudyHighlight"].includes(section.type)).length >= 2
        ? "high"
        : "normal",
  };
};

const summarizeBlockDecisions = (sectionSpecs = {}) => {
  const specs = sectionSpecs && typeof sectionSpecs === "object" ? sectionSpecs : {};
  const counts = { reuse: 0, new_variant: 0, new_private: 0 };
  for (const entry of Object.values(specs)) {
    const blockType = String(entry?.block_type || "");
    const hasTemplateVariant = Boolean(entry?.template_variant);
    if (/^TemplateExclusive/i.test(blockType) || /^private\./i.test(blockType)) {
      counts.new_private += 1;
    } else if (hasTemplateVariant) {
      counts.new_variant += 1;
    } else {
      counts.reuse += 1;
    }
  }
  return counts;
};

const extractVisualHashByPath = (specPack = {}) => {
  const byPath = {};
  const pages = asArray(specPack?.site_pages);
  for (const page of pages) {
    const pathValue = normalizePath(page?.path || "/");
    const signature =
      page?.visualSignature && typeof page.visualSignature === "object"
        ? page.visualSignature
        : page?.summary?.visualSignature && typeof page.summary.visualSignature === "object"
          ? page.summary.visualSignature
          : null;
    if (!signature) continue;
    const candidates = [signature.dhash, signature.dHash, signature.visualDHash, signature.visual_dhash, signature.hash];
    const token = candidates
      .map((entry) => String(entry || "").trim().toLowerCase())
      .find((entry) => /^[0-9a-f]{8,}$/i.test(entry));
    if (token) byPath[pathValue] = token;
  }
  return byPath;
};

const buildTaxonomyTypeByPath = (specPack = {}) => {
  const map = {};
  for (const row of asArray(specPack?.site_pages)) {
    const pathValue = normalizePath(row?.path || "/");
    const taxonomyType = String(row?.taxonomy_type || "").trim().toLowerCase();
    if (taxonomyType && !map[pathValue]) map[pathValue] = taxonomyType;
  }
  for (const row of asArray(specPack?.taxonomy_selected_pages)) {
    const pathValue = normalizePath(row?.path || "/");
    const taxonomyType = String(row?.taxonomy_type || "").trim().toLowerCase();
    if (taxonomyType && !map[pathValue]) map[pathValue] = taxonomyType;
  }
  return map;
};

export const buildTemplateAssetManifest = ({ site = {}, indexCard = {}, specPack = {} } = {}) => {
  const rootSectionSpecs = specPack?.section_specs && typeof specPack.section_specs === "object" ? specPack.section_specs : {};
  const pageSpecs = asArray(specPack?.page_specs).length
    ? asArray(specPack?.page_specs)
    : [{ path: "/", name: String(indexCard?.source?.title || site?.id || "Home"), section_specs: rootSectionSpecs }];
  const taxonomyTypeByPath = buildTaxonomyTypeByPath(specPack);
  const pageRows = pageSpecs.map((page, index) => {
    const pagePath = normalizePath(page?.path || "/");
    const sectionSpecs = page?.section_specs && typeof page.section_specs === "object" ? page.section_specs : rootSectionSpecs;
    const sections = toSectionRows(sectionSpecs);
    const pageType = inferPageType({
      pagePath,
      pageName: String(page?.name || ""),
      taxonomyType: taxonomyTypeByPath[pagePath] || "",
    });
    const skeleton = inferSkeleton({ pageType, sections });
    return {
      templateId: `${slug(String(site?.id || "site")) || "site"}-${slug(pagePath) || "home"}-${String(index + 1)}`,
      pagePath,
      pageName: String(page?.name || "").trim() || "Untitled Page",
      pageType,
      skeleton,
      layoutVariant: String(specPack?.recipe_id || "").trim() || "default",
      sections,
      visualProfile: inferVisualProfile(sections),
      styleLock: inferStyleLock(sections),
      blockDecisions: summarizeBlockDecisions(sectionSpecs),
      qa: {
        fidelityScore: null,
        reviewStatus: "draft",
      },
    };
  });

  const reviewInput =
    (site?.assetApproval && typeof site.assetApproval === "object"
      ? site.assetApproval
      : site?.specialRules?.assetApproval && typeof site.specialRules.assetApproval === "object"
        ? site.specialRules.assetApproval
        : site?.specialRules?.asset_approval && typeof site.specialRules.asset_approval === "object"
          ? site.specialRules.asset_approval
          : {}) || {};
  const reviewStatusToken = String(reviewInput?.status || "").trim().toLowerCase();
  const reviewStatus = REVIEW_STATUS_SET.has(reviewStatusToken) ? reviewStatusToken : "draft";

  return {
    protocolVersion: PROTOCOL_VERSION,
    domain: DOMAIN,
    source: {
      siteId: String(site?.id || ""),
      siteUrl: String(site?.url || ""),
      capturedAt: new Date().toISOString(),
      recipeId: String(specPack?.recipe_id || ""),
    },
    pages: pageRows,
    review: {
      status: reviewStatus,
      fromStatus: String(reviewInput?.fromStatus || reviewInput?.from_status || "").trim().toLowerCase(),
      reviewedBy: String(reviewInput?.reviewedBy || reviewInput?.reviewed_by || "").trim(),
      notes: String(reviewInput?.notes || "").trim(),
    },
    stats: {
      totalPages: pageRows.length,
      pageTypes: dedupe(pageRows.map((row) => row.pageType)),
      skeletons: dedupe(pageRows.map((row) => row.skeleton)),
      sectionTypes: dedupe(pageRows.flatMap((row) => row.sections.map((section) => section.type))),
    },
  };
};

export const buildTemplateDedupFingerprints = ({ manifest = {}, specPack = {} } = {}) => {
  const visualHashByPath = extractVisualHashByPath(specPack);
  const pages = asArray(manifest?.pages);
  const fingerprints = pages.map((page) => {
    const sectionTypes = asArray(page?.sections).map((section) => String(section?.type || "")).filter(Boolean);
    const structureFingerprint = `${DOMAIN}|${String(page?.pageType || "generic")}|${String(page?.skeleton || "generic")}|${sectionTypes.join(
      ">"
    )}`;
    const visualProfile = page?.visualProfile && typeof page.visualProfile === "object" ? page.visualProfile : {};
    const layoutFingerprint = [
      String(visualProfile?.maxWidth || ""),
      String(visualProfile?.sectionSpacing || ""),
      String(visualProfile?.density || ""),
      String(visualProfile?.typeScaleBucket || ""),
      String(visualProfile?.headlineWeight || ""),
      String(visualProfile?.motion || ""),
      String(visualProfile?.tone || ""),
      String(visualProfile?.ctaStyle || ""),
    ].join("|");
    const pagePath = normalizePath(page?.pagePath || "/");
    return {
      templateId: String(page?.templateId || ""),
      pagePath,
      pageType: String(page?.pageType || "generic"),
      skeleton: String(page?.skeleton || "generic"),
      structureFingerprint,
      layoutFingerprint,
      visualFingerprint: String(visualHashByPath[pagePath] || ""),
    };
  });

  return {
    protocolVersion: PROTOCOL_VERSION,
    domain: DOMAIN,
    fingerprints,
  };
};

const percentage = (ok, total) => (total <= 0 ? 100 : Number(((ok / total) * 100).toFixed(2)));

export const evaluateTemplateAssetContracts = ({ manifest = {}, dedup = {}, runtime = {} } = {}) => {
  const issues = [];
  const pages = asArray(manifest?.pages);
  const fingerprints = asArray(dedup?.fingerprints);
  const reviewStatus = String(manifest?.review?.status || "").trim();
  const reviewFromStatus = String(manifest?.review?.fromStatus || "").trim().toLowerCase();
  const runtimeInput = runtime && typeof runtime === "object" ? runtime : {};
  const fidelitySimilarityToken = runtimeInput?.fidelitySimilarity;
  const fidelitySimilarityRaw =
    typeof fidelitySimilarityToken === "number"
      ? fidelitySimilarityToken
      : typeof fidelitySimilarityToken === "string" && fidelitySimilarityToken.trim() !== ""
        ? Number(fidelitySimilarityToken)
        : NaN;
  const fidelitySimilarity = Number.isFinite(fidelitySimilarityRaw)
    ? Math.max(0, Math.min(100, fidelitySimilarityRaw))
    : null;
  const fidelityThresholdToken = runtimeInput?.fidelityThreshold;
  const fidelityThresholdRaw =
    typeof fidelityThresholdToken === "number"
      ? fidelityThresholdToken
      : typeof fidelityThresholdToken === "string" && fidelityThresholdToken.trim() !== ""
        ? Number(fidelityThresholdToken)
        : NaN;
  const fidelityThreshold = Number.isFinite(fidelityThresholdRaw)
    ? Math.max(0, Math.min(100, fidelityThresholdRaw))
    : null;

  if (!pages.length) {
    issues.push({
      code: "empty_pages",
      severity: "error",
      message: "template asset manifest contains zero pages",
    });
  }
  if (!REVIEW_STATUS_SET.has(reviewStatus)) {
    issues.push({
      code: "invalid_review_status",
      severity: "error",
      message: `review status is invalid: ${reviewStatus || "(empty)"}`,
    });
  }
  if (reviewFromStatus) {
    if (!REVIEW_STATUS_SET.has(reviewFromStatus)) {
      issues.push({
        code: "invalid_review_from_status",
        severity: "error",
        message: `review fromStatus is invalid: ${reviewFromStatus}`,
      });
    } else if (!REVIEW_STATUS_TRANSITIONS[reviewFromStatus]?.has(reviewStatus)) {
      issues.push({
        code: "invalid_review_transition",
        severity: "error",
        message: `invalid review transition: ${reviewFromStatus} -> ${reviewStatus}`,
      });
    }
  }

  const validPageTypeCount = pages.filter((page) => PAGE_TYPE_SET.has(String(page?.pageType || ""))).length;
  const pageTypeCompliance = percentage(validPageTypeCount, pages.length);
  if (pageTypeCompliance < 100) {
    issues.push({
      code: "page_type_non_compliant",
      severity: "warn",
      message: `page type compliance below 100% (${pageTypeCompliance})`,
    });
  }

  const homePages = pages.filter((page) => String(page?.pageType || "") === "home");
  const homeSkeletonOk = homePages.filter((page) => HOME_SKELETON_SET.has(String(page?.skeleton || ""))).length;
  const homeSkeletonCompliance = percentage(homeSkeletonOk, homePages.length || 1);
  if (homePages.length > 0 && homeSkeletonCompliance < 100) {
    issues.push({
      code: "home_skeleton_non_compliant",
      severity: "warn",
      message: `home skeleton compliance below 100% (${homeSkeletonCompliance})`,
    });
  }

  const sectionRows = pages.flatMap((page) => asArray(page?.sections));
  const validSectionCount = sectionRows.filter((section) => SECTION_SET.has(String(section?.type || ""))).length;
  const sectionTaxonomyCompliance = percentage(validSectionCount, sectionRows.length || 1);
  if (sectionRows.length > 0 && sectionTaxonomyCompliance < 95) {
    issues.push({
      code: "section_taxonomy_non_compliant",
      severity: "warn",
      message: `section taxonomy compliance below 95% (${sectionTaxonomyCompliance})`,
    });
  }

  const metaCompletenessCount = pages.filter((page) => {
    if (!page || typeof page !== "object") return false;
    const required = ["templateId", "pagePath", "pageType", "skeleton", "sections", "visualProfile", "styleLock"];
    return required.every((key) => {
      if (!(key in page)) return false;
      const value = page[key];
      if (key === "sections") return Array.isArray(value);
      if (typeof value === "string") return value.trim().length > 0;
      return Boolean(value && typeof value === "object");
    });
  }).length;
  const templateMetaCompleteness = percentage(metaCompletenessCount, pages.length);

  const dedupCompleteCount = fingerprints.filter((row) => {
    const structure = String(row?.structureFingerprint || "").trim();
    const layout = String(row?.layoutFingerprint || "").trim();
    return Boolean(structure && layout);
  }).length;
  const dedupFingerprintCompleteness = percentage(dedupCompleteCount, fingerprints.length || pages.length || 1);

  if (fingerprints.length < pages.length) {
    issues.push({
      code: "dedup_fingerprint_missing_pages",
      severity: "warn",
      message: `dedup fingerprints missing for some pages (${fingerprints.length}/${pages.length})`,
    });
  }

  if (fidelitySimilarity !== null && fidelityThreshold !== null && fidelitySimilarity < fidelityThreshold) {
    issues.push({
      code: "fidelity_below_target",
      severity: "warn",
      message: `fidelity similarity below threshold (${fidelitySimilarity.toFixed(2)} < ${fidelityThreshold.toFixed(2)})`,
    });
  }

  const baseScore = Number(
    (
      templateMetaCompleteness * 0.3 +
      pageTypeCompliance * 0.2 +
      homeSkeletonCompliance * 0.1 +
      sectionTaxonomyCompliance * 0.2 +
      dedupFingerprintCompleteness * 0.2
    ).toFixed(2)
  );
  const overallScore =
    fidelitySimilarity === null
      ? baseScore
      : Number((baseScore * 0.75 + fidelitySimilarity * 0.25).toFixed(2));
  const hasError = issues.some((issue) => issue.severity === "error");
  const passed = !hasError && overallScore >= 85;

  return {
    protocolVersion: PROTOCOL_VERSION,
    generatedAt: new Date().toISOString(),
    passed,
    overallScore,
    scores: {
      templateMetaCompleteness,
      pageTypeCompliance,
      homeSkeletonCompliance,
      sectionTaxonomyCompliance,
      dedupFingerprintCompleteness,
      fidelitySimilarity,
    },
    observations: {
      pageCount: pages.length,
      sectionCount: sectionRows.length,
      fingerprintCount: fingerprints.length,
      reviewStatus,
      reviewFromStatus,
      fidelityThreshold,
    },
    issues,
  };
};
