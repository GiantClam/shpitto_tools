import {
  buildTemplateAdaptationSummary,
  type TemplateAdaptationSummary,
} from "@/lib/agent/template-adaptation";

type PayloadComponent = { name?: string; code?: string };
type PayloadBlock = { type?: string; props?: Record<string, unknown> };
type PayloadPage = { path?: string; name?: string; data?: { content?: PayloadBlock[] } };
type PayloadLike = {
  components?: PayloadComponent[];
  pages?: PayloadPage[];
  theme?: Record<string, unknown>;
};
type SitePayloadAuditContext = {
  prompt?: string;
  profileId?: unknown;
  resolvedByLayer?: Record<string, unknown> | null;
};

export type SitePayloadAuditIssue = {
  severity: "error" | "warning";
  code:
    | "unknown_block_type"
    | "unregistered_fallback_block"
    | "duplicate_page_path"
    | "high_template_reuse"
    | "high_structural_similarity"
    | "scenario_page_contract_violation"
    | "template_semantic_mismatch"
    | "template_brand_residue"
    | "contact_gradient_text_forbidden";
  message: string;
  details?: Record<string, unknown>;
};

export type SitePayloadPageShape = {
  path: string;
  name: string;
  shape: string;
  blockTypes: string[];
  roleShape: string;
  roles: string[];
};

export type SitePayloadAuditReport = {
  ok: boolean;
  mode: "generated" | "exact-preview";
  pageCount: number;
  issueCount: number;
  issues: SitePayloadAuditIssue[];
  pageShapes: SitePayloadPageShape[];
  adaptation?: TemplateAdaptationSummary;
  structure?: {
    comparedAgainstPath: string;
    sameShapeCount: number;
    sameRoleShapeCount: number;
    averageRoleSimilarity: number;
    maxRoleSimilarity: number;
    highlySimilarPageCount: number;
    duplicateInteriorPairCount: number;
    duplicateInteriorPairs: string[];
  };
};

const REGISTERED_BLOCK_NAMES = new Set([
  "AtomicText",
  "AtomicButton",
  "AtomicImage",
  "Navbar",
  "HeroCentered",
  "HeroSplit",
  "FeatureGrid",
  "FeatureWithMedia",
  "PricingCards",
  "FAQAccordion",
  "Footer",
  "LogoCloud",
  "TestimonialsGrid",
  "CaseStudies",
  "LeadCaptureCTA",
  "CardsGrid",
  "NeonHeroBeam",
  "NeonDashboardStrip",
  "NeonMetricsOrbit",
  "NeonFeatureCards",
  "NeonResultsShowcase",
  "NeonPricingSplit",
  "NeonFooterGlow",
  "NexusNavPulse",
  "NexusHeroDock",
  "NexusCapabilityStrip",
  "NexusOpsMatrix",
  "NexusControlPanel",
  "NexusProofMosaic",
  "NexusFooterCommand",
  "DesignerHeroEditorial",
  "DesignerCapabilitiesStrip",
  "DesignerProjectsSplit",
  "DesignerQuoteBand",
  "ComparisonSection",
  "ContentStory",
  "ProductCatalog",
  "ProductShowcase",
  "CreationFooterFallback",
  "ExactPenPagePreview",
  "ExactPenHomePreview",
]);

const isPatternRegistered = (type: string) =>
  /^(TemplateExclusive|PublishedSection_|CustomTemplateExclusive)/.test(type);

const normalizeBlockTypes = (page: PayloadPage) =>
  (Array.isArray(page?.data?.content) ? page.data.content : [])
    .map((block) => String(block?.type || "").trim())
    .filter(Boolean);

const normalizePath = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
};

const CONTACT_TEXT_GRADIENT_PATTERN = /\b(text-gradient|bg-clip-text|text-transparent)\b/i;

const collectClassLikeValues = (value: unknown, out: string[]) => {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectClassLikeValues(item, out));
    return;
  }
  if (typeof value !== "object") return;
  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    if (typeof child === "string" && /class/i.test(key)) {
      const compact = child.trim();
      if (compact) out.push(compact);
      return;
    }
    collectClassLikeValues(child, out);
  });
};

const pageHasForbiddenContactGradientText = (page: PayloadPage) => {
  const blocks = Array.isArray(page?.data?.content) ? page.data.content : [];
  return blocks.some((block) => {
    const type = String(block?.type || "").toLowerCase();
    const id = String(block?.props?.id || "").toLowerCase();
    const anchor = String(block?.props?.anchor || "").toLowerCase();
    const isContactLike =
      type.includes("leadcapture") ||
      type.includes("contact") ||
      type.includes("cta") ||
      id.includes("contact") ||
      anchor.includes("contact");
    if (!isContactLike) return false;
    if (type.includes("leadcapture") && String(block?.props?.emphasis || "").toLowerCase() === "high") return true;
    const classValues: string[] = [];
    collectClassLikeValues(block?.props, classValues);
    return classValues.some((entry) => CONTACT_TEXT_GRADIENT_PATTERN.test(entry));
  });
};

const isExactPreviewPayload = (pageShapes: Array<{ shape: string; blockTypes: string[] }>) =>
  pageShapes.length > 0 &&
  pageShapes.every((page) => page.blockTypes.length === 1 && /^(ExactPenPagePreview|ExactPenHomePreview)$/.test(page.blockTypes[0] || ""));

const toRole = (type: string) => {
  if (!type) return "other";
  if (/FloatingWhatsApp|Atomic/i.test(type)) return "utility";
  if (/Navbar|Nav/i.test(type)) return "nav";
  if (/Footer/i.test(type)) return "footer";
  if (/Hero|IntroBand/i.test(type)) return "hero";
  if (/Contact|LeadCapture/i.test(type)) return "contact";
  if (/Cta|CTA|QuoteBand/i.test(type)) return "cta";
  if (/CaseStudies|Projects|Cases/i.test(type)) return "cases";
  if (/Testimonials|LogoCloud|Certification|Proof/i.test(type)) return "proof";
  if (/FeatureGrid|FeatureWithMedia|Capability|Metrics|Ops|ControlPanel|Comparison|FAQ/i.test(type)) return "features";
  if (/CardsGrid|Catalog|Product|ContentStory|Showcase|Pricing/i.test(type)) return "content";
  return "other";
};

const lcsLength = (left: string[], right: string[]) => {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      dp[row][col] =
        left[row - 1] === right[col - 1]
          ? dp[row - 1][col - 1] + 1
          : Math.max(dp[row - 1][col], dp[row][col - 1]);
    }
  }
  return dp[left.length][right.length];
};

const sequenceSimilarity = (left: string[], right: string[]) => {
  if (!left.length && !right.length) return 1;
  if (!left.length || !right.length) return 0;
  return (2 * lcsLength(left, right)) / (left.length + right.length);
};

export const auditSitePayload = (payload: PayloadLike, context: SitePayloadAuditContext = {}): SitePayloadAuditReport => {
  const issues: SitePayloadAuditIssue[] = [];
  const customNames = new Set(
    (Array.isArray(payload?.components) ? payload.components : [])
      .map((component) => String(component?.name || "").trim())
      .filter(Boolean)
  );
  const seenPaths = new Set<string>();
  const pages = Array.isArray(payload?.pages) ? payload.pages : [];
  const pageShapes = pages.map((page) => {
    const path = String(page?.path || "").trim() || "/";
    const name = String(page?.name || "").trim() || path;
    const blockTypes = normalizeBlockTypes(page);
    if (seenPaths.has(path)) {
      issues.push({
        severity: "error",
        code: "duplicate_page_path",
        message: `Duplicate page path detected: ${path}`,
        details: { path },
      });
    }
    seenPaths.add(path);
    for (const type of blockTypes) {
      if (type === "CreationFallbackSection") {
        issues.push({
          severity: "error",
          code: "unregistered_fallback_block",
          message: `Payload uses disallowed fallback block "${type}" on page ${path}`,
          details: { path, type },
        });
        continue;
      }
      if (REGISTERED_BLOCK_NAMES.has(type) || customNames.has(type) || isPatternRegistered(type)) {
        continue;
      }
      issues.push({
        severity: "error",
        code: "unknown_block_type",
        message: `Unknown block type "${type}" on page ${path}`,
        details: { path, type },
      });
    }
    if (normalizePath(path) === "/contact" && pageHasForbiddenContactGradientText(page)) {
      issues.push({
        severity: "error",
        code: "contact_gradient_text_forbidden",
        message: `Contact page "${path}" uses forbidden gradient text styles`,
        details: { path },
      });
    }
    const roles = blockTypes.map((type) => toRole(type)).filter((role) => role !== "nav" && role !== "footer" && role !== "utility");
    return {
      path,
      name,
      shape: blockTypes.join(">"),
      blockTypes,
      roles,
      roleShape: roles.join(">"),
    };
  });

  const mode: "generated" | "exact-preview" = isExactPreviewPayload(pageShapes) ? "exact-preview" : "generated";
  let structure: SitePayloadAuditReport["structure"] | undefined;

  if (mode === "generated" && pageShapes.length > 2) {
    const homeShape = pageShapes[0]?.shape || "";
    const homeRoleShape = pageShapes[0]?.roleShape || "";
    const sameAsHomeCount = pageShapes.filter((page) => page.shape === homeShape).length;
    const sameRoleShapeCount = pageShapes.filter((page) => page.roleShape === homeRoleShape).length;
    const reuseRatio = sameAsHomeCount / pageShapes.length;
    const similarities = pageShapes.map((page) => sequenceSimilarity(pageShapes[0]?.roles || [], page.roles || []));
    const averageRoleSimilarity =
      similarities.reduce((sum, value) => sum + value, 0) / Math.max(similarities.length, 1);
    const maxRoleSimilarity = Math.max(...similarities);
    const highlySimilarPageCount = similarities.filter((value) => value >= 0.9).length;
    const duplicateInteriorPairs: string[] = [];
    for (let left = 1; left < pageShapes.length; left += 1) {
      for (let right = left + 1; right < pageShapes.length; right += 1) {
        const leftPage = pageShapes[left];
        const rightPage = pageShapes[right];
        if (!leftPage?.roleShape || !rightPage?.roleShape) continue;
        if (leftPage.roleShape !== rightPage.roleShape) continue;
        const similarity = sequenceSimilarity(leftPage.roles || [], rightPage.roles || []);
        if (similarity >= 0.95) {
          duplicateInteriorPairs.push(`${leftPage.path}<->${rightPage.path}`);
        }
      }
    }
    structure = {
      comparedAgainstPath: pageShapes[0]?.path || "/",
      sameShapeCount: sameAsHomeCount,
      sameRoleShapeCount,
      averageRoleSimilarity,
      maxRoleSimilarity,
      highlySimilarPageCount,
      duplicateInteriorPairCount: duplicateInteriorPairs.length,
      duplicateInteriorPairs,
    };
    if (homeShape && reuseRatio >= 0.8) {
      issues.push({
        severity: "warning",
        code: "high_template_reuse",
        message: `Page block structure is highly repetitive across the site (${sameAsHomeCount}/${pageShapes.length} match the first page)`,
        details: { sameAsHomeCount, pageCount: pageShapes.length, reuseRatio },
      });
    }
    const roleReuseRatio = sameRoleShapeCount / pageShapes.length;
    const similarityRatio = highlySimilarPageCount / pageShapes.length;
    if (homeRoleShape && roleReuseRatio >= 0.8 && similarityRatio >= 0.8) {
      issues.push({
        severity: "warning",
        code: "high_structural_similarity",
        message: `Page semantic structure is highly similar across the site (${highlySimilarPageCount}/${pageShapes.length} are >= 0.90 similar to the first page)`,
        details: {
          sameRoleShapeCount,
          highlySimilarPageCount,
          pageCount: pageShapes.length,
          roleReuseRatio,
          averageRoleSimilarity,
          maxRoleSimilarity,
        },
      });
    }
    const interiorPageCount = Math.max(pageShapes.length - 1, 0);
    const possibleInteriorPairs =
      interiorPageCount >= 2 ? (interiorPageCount * (interiorPageCount - 1)) / 2 : 0;
    const duplicateInteriorPairRatio =
      possibleInteriorPairs > 0 ? duplicateInteriorPairs.length / possibleInteriorPairs : 0;
    if (duplicateInteriorPairs.length >= 2 && duplicateInteriorPairRatio >= 0.35) {
      issues.push({
        severity: "warning",
        code: "high_structural_similarity",
        message: `Interior pages share near-identical semantic structure (${duplicateInteriorPairs.length} pair(s))`,
        details: {
          duplicateInteriorPairCount: duplicateInteriorPairs.length,
          duplicateInteriorPairs,
          duplicateInteriorPairRatio,
          possibleInteriorPairs,
        },
      });
    }
  }

  const adaptation =
    mode === "generated"
      ? buildTemplateAdaptationSummary({
          prompt: context.prompt,
          profileId:
            context.profileId ??
            (context.resolvedByLayer && typeof context.resolvedByLayer === "object"
              ? context.resolvedByLayer.templatePlanProfile
              : undefined),
          pages,
        })
      : undefined;
  if (adaptation) {
    for (const finding of adaptation.findings) {
      issues.push({
        severity: finding.severity,
        code: finding.code,
        message: finding.message,
        details: finding.details,
      });
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;

  return {
    ok: errorCount === 0,
    mode,
    pageCount: pageShapes.length,
    issueCount: issues.length,
    issues,
    pageShapes,
    adaptation,
    structure,
  };
};
