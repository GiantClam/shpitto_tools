import type { SiteBlueprint } from "@/lib/agent/site-planner";
import type { SiteLinkGraph } from "@/lib/agent/link-graph";

export type GenerationPage = {
  path?: string;
  name?: string;
  data?: {
    content?: Array<{ type?: string; props?: Record<string, unknown> }>;
    root?: { props?: Record<string, unknown> };
  };
};

export type QaGateReport = {
  pass: boolean;
  coverageScore: number;
  linkIntegrityScore: number;
  themeConsistencyScore: number;
  middleSectionScore: number;
  semanticFidelityScore: number;
  overallScore: number;
  thresholds: {
    coverage: number;
    linkIntegrity: number;
    themeConsistency: number;
    middleSection: number;
    semantic: number;
    overall: number;
  };
  details: {
    expectedPages: string[];
    generatedPages: string[];
    missingPages: string[];
    brokenLinks: string[];
    inconsistentThemePages: string[];
    expectedBrand: string;
    semanticHitPages: string[];
    sourceBrandLeakPages: string[];
    genericPlaceholderPages: string[];
    thinMiddleSectionPages: string[];
  };
};

const clamp = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

const normalizePagePath = (value: unknown) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
};

const isExternalOrAnchorHref = (href: string) => {
  const normalized = href.trim().toLowerCase();
  return (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("mailto:") ||
    normalized.startsWith("tel:") ||
    normalized.startsWith("#")
  );
};

const collectHrefs = (value: unknown, out: string[]) => {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectHrefs(item, out));
    return;
  }
  if (typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  if (typeof record.href === "string" && record.href.trim()) out.push(record.href.trim());
  Object.values(record).forEach((entry) => collectHrefs(entry, out));
};

const blockIsNavbar = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  const type = String(item?.type || "").toLowerCase();
  const anchor = String(item?.props?.anchor || "").toLowerCase();
  const id = String(item?.props?.id || "").toLowerCase();
  return type.includes("navbar") || type.includes("navigation") || anchor === "top" || id.includes("navbar");
};

const blockIsFooter = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  const type = String(item?.type || "").toLowerCase();
  const anchor = String(item?.props?.anchor || "").toLowerCase();
  const id = String(item?.props?.id || "").toLowerCase();
  return type.includes("footer") || anchor === "footer" || id.includes("footer");
};

const blockIsHero = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  const type = String(item?.type || "").toLowerCase();
  const id = String(item?.props?.id || "").toLowerCase();
  return type.includes("hero") || type.includes("masthead") || id.includes("hero");
};

const blockIsCtaOrContact = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  const type = String(item?.type || "").toLowerCase();
  const id = String(item?.props?.id || "").toLowerCase();
  const anchor = String(item?.props?.anchor || "").toLowerCase();
  return (
    type.includes("cta") ||
    type.includes("calltoaction") ||
    type.includes("leadcapture") ||
    type.includes("contact") ||
    id.includes("cta") ||
    id.includes("contact") ||
    anchor.includes("cta") ||
    anchor.includes("contact")
  );
};

const inferPageIntent = (pathValue: string, nameValue: string) => {
  const token = `${normalizePagePath(pathValue)} ${String(nameValue || "")}`.toLowerCase();
  if (/privacy|terms?|policy|legal|cookie|gdpr/.test(token)) return "legal";
  if (/contact|consult|quote|sales|get[-\s]?in[-\s]?touch/.test(token)) return "contact";
  if (/faq|support|help|docs|documentation|knowledge/.test(token)) return "support";
  if (/home|^\/$/.test(token)) return "home";
  return "generic";
};

const minMiddleSectionsForIntent = (intent: string) => {
  if (intent === "home") return 3;
  if (intent === "contact" || intent === "support" || intent === "legal") return 1;
  return 2;
};

const stableThemeFingerprint = (theme: unknown) => {
  const record = theme && typeof theme === "object" ? (theme as Record<string, unknown>) : {};
  const palette = record.palette && typeof record.palette === "object" ? (record.palette as Record<string, unknown>) : {};
  return JSON.stringify({
    mode: record.mode || "",
    fontHeading: record.fontHeading || "",
    fontBody: record.fontBody || "",
    bg: palette.bg || "",
    text: palette.text || "",
    primary: palette.primary || "",
    accent: palette.accent || "",
  });
};

const extractPromptBrand = (prompt: string): string => {
  const quoted = prompt.match(/["「]([^"」]{1,40})["」]/);
  if (quoted) return quoted[1].trim();
  const chinese = prompt.match(/为\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s-]{1,30})\s*(?:生成|制作|创建|构建|设计)/i);
  if (chinese) return chinese[1].trim();
  const english = prompt.match(/for\s+([A-Za-z][A-Za-z0-9\s-]{1,40})\s+(?:generate|build|create|design)/i);
  if (english) return english[1].trim();
  const named = prompt.match(/(?:叫|called|named|品牌名?(?:为|是)?)\s*[：:]?\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s]{0,30})/i);
  if (named) return named[1].trim();
  return "";
};

const collectTextValues = (value: unknown, out: string[]) => {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectTextValues(item, out));
    return;
  }
  if (typeof value === "string") {
    const text = value.replace(/\s+/g, " ").trim();
    if (text) out.push(text);
    return;
  }
  if (typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  Object.entries(record).forEach(([key, entry]) => {
    if (/href|src|url|id|anchor|variant|class/i.test(key)) return;
    collectTextValues(entry, out);
  });
};

const sourceBrandLeakRegex = /\b(?:unistellar|audeze|devialet|master\s*dynamic|arch|kef)\b/i;
const genericPlaceholderRegex = /\b(?:story|approach|socialproof|products?|cta|contact|hero|navigation|footer)\s+section\b/i;

export const evaluateGenerationQa = (input: {
  siteBlueprint: SiteBlueprint;
  pages: GenerationPage[];
  linkGraph: SiteLinkGraph;
  prompt?: string;
  thresholds?: Partial<QaGateReport["thresholds"]>;
}): QaGateReport => {
  const thresholds: QaGateReport["thresholds"] = {
    coverage: clamp(Number(input.thresholds?.coverage ?? 0.85)),
    linkIntegrity: clamp(Number(input.thresholds?.linkIntegrity ?? 0.95)),
    themeConsistency: clamp(Number(input.thresholds?.themeConsistency ?? 0.9)),
    middleSection: clamp(Number(input.thresholds?.middleSection ?? 0.75)),
    semantic: clamp(Number(input.thresholds?.semantic ?? 0.9)),
    overall: clamp(Number(input.thresholds?.overall ?? 0.9)),
  };

  const expectedPages = Array.from(new Set(input.siteBlueprint.pages.map((page) => normalizePagePath(page.path))));
  const generatedPages = Array.from(
    new Set((Array.isArray(input.pages) ? input.pages : []).map((page) => normalizePagePath(page?.path)))
  );
  const missingPages = expectedPages.filter((path) => !generatedPages.includes(path));
  const pageCoverage = expectedPages.length ? (expectedPages.length - missingPages.length) / expectedPages.length : 1;

  const contentPages = Array.isArray(input.pages) ? input.pages : [];
  let pagesWithNavFooter = 0;
  for (const page of contentPages) {
    const blocks = Array.isArray(page?.data?.content) ? page.data.content : [];
    const hasNav = blocks.some((block) => blockIsNavbar(block));
    const hasFooter = blocks.some((block) => blockIsFooter(block));
    if (hasNav && hasFooter) pagesWithNavFooter += 1;
  }
  const chromeCoverage = contentPages.length ? pagesWithNavFooter / contentPages.length : 0;
  const coverageScore = clamp(pageCoverage * 0.7 + chromeCoverage * 0.3);

  const brokenLinks: string[] = [];
  let validLinks = 0;
  let invalidLinks = 0;
  for (const page of contentPages) {
    const blocks = Array.isArray(page?.data?.content) ? page.data.content : [];
    for (const block of blocks) {
      if (!blockIsNavbar(block) && !blockIsFooter(block)) continue;
      const hrefs: string[] = [];
      collectHrefs(block?.props, hrefs);
      hrefs.forEach((href) => {
        if (isExternalOrAnchorHref(href)) {
          validLinks += 1;
          return;
        }
        const normalized = normalizePagePath(href);
        if (input.linkGraph.validInternalHrefs.has(normalized)) {
          validLinks += 1;
        } else {
          invalidLinks += 1;
          brokenLinks.push(`${normalizePagePath(page?.path)} -> ${href}`);
        }
      });
    }
  }
  const linkIntegrityScore = clamp(validLinks + invalidLinks > 0 ? validLinks / (validLinks + invalidLinks) : 1);

  const themeFingerprints = contentPages.map((page) => {
    const rootTheme = page?.data?.root?.props?.theme;
    return {
      path: normalizePagePath(page?.path),
      fingerprint: stableThemeFingerprint(rootTheme),
    };
  });
  const baseline = themeFingerprints[0]?.fingerprint || "";
  const inconsistentThemePages = themeFingerprints
    .filter((entry) => baseline && entry.fingerprint !== baseline)
    .map((entry) => entry.path);
  const themeConsistencyScore = clamp(
    themeFingerprints.length ? (themeFingerprints.length - inconsistentThemePages.length) / themeFingerprints.length : 1
  );

  let middleSectionPoints = 0;
  const thinMiddleSectionPages: string[] = [];
  const middleTypeSet = new Set<string>();
  for (const page of contentPages) {
    const pagePath = normalizePagePath(page?.path);
    const pageIntent = inferPageIntent(pagePath, String(page?.name || ""));
    const blocks = Array.isArray(page?.data?.content) ? page.data.content : [];
    const middleBlocks = blocks.filter(
      (block) => !blockIsNavbar(block) && !blockIsFooter(block) && !blockIsHero(block)
    );
    const substantiveBlocks =
      pageIntent === "contact" || pageIntent === "support" || pageIntent === "legal"
        ? middleBlocks
        : middleBlocks.filter((block) => !blockIsCtaOrContact(block));
    substantiveBlocks.forEach((block) => {
      const type = String(block?.type || "").toLowerCase();
      if (!type) return;
      if (/feature|approach|process|workflow|capability/.test(type)) middleTypeSet.add("approach");
      else if (/product|catalog|pricing|plan|tier/.test(type)) middleTypeSet.add("products");
      else if (/testimonial|review|social|proof|logo|trust/.test(type)) middleTypeSet.add("socialproof");
      else if (/team|timeline|history|story|content|editorial|faq|resource|blog/.test(type)) middleTypeSet.add("story");
      else middleTypeSet.add("generic");
    });
    const minRequired = minMiddleSectionsForIntent(pageIntent);
    const densityScore = clamp(substantiveBlocks.length / Math.max(1, minRequired));
    middleSectionPoints += densityScore;
    if (substantiveBlocks.length < minRequired) thinMiddleSectionPages.push(pagePath);
  }
  const middleDensityScore = clamp(contentPages.length ? middleSectionPoints / contentPages.length : 1);
  const middleDiversityScore = clamp(middleTypeSet.size / 4);
  const middleSectionScore = clamp(middleDensityScore * 0.75 + middleDiversityScore * 0.25);

  const expectedBrand = extractPromptBrand(String(input.prompt || ""));
  const semanticHitPages: string[] = [];
  const sourceBrandLeakPages: string[] = [];
  const genericPlaceholderPages: string[] = [];
  for (const page of contentPages) {
    const pagePath = normalizePagePath(page?.path);
    const textValues: string[] = [];
    collectTextValues(page?.data?.content, textValues);
    const joined = textValues.join(" ").toLowerCase();
    if (expectedBrand && joined.includes(expectedBrand.toLowerCase())) semanticHitPages.push(pagePath);
    if (sourceBrandLeakRegex.test(joined)) sourceBrandLeakPages.push(pagePath);
    if (genericPlaceholderRegex.test(joined)) genericPlaceholderPages.push(pagePath);
  }
  const brandCoverage =
    !expectedBrand || contentPages.length === 0 ? 1 : semanticHitPages.length / Math.max(1, contentPages.length);
  const leakPenalty =
    contentPages.length === 0 ? 0 : sourceBrandLeakPages.length / Math.max(1, contentPages.length);
  const placeholderPenalty =
    contentPages.length === 0 ? 0 : genericPlaceholderPages.length / Math.max(1, contentPages.length);
  const semanticFidelityScore = clamp(
    brandCoverage * 0.6 + (1 - leakPenalty) * 0.25 + (1 - placeholderPenalty) * 0.15
  );

  const overallScore = clamp(
    coverageScore * 0.25 +
      linkIntegrityScore * 0.2 +
      themeConsistencyScore * 0.2 +
      middleSectionScore * 0.15 +
      semanticFidelityScore * 0.2
  );
  const pass =
    coverageScore >= thresholds.coverage &&
    linkIntegrityScore >= thresholds.linkIntegrity &&
    themeConsistencyScore >= thresholds.themeConsistency &&
    middleSectionScore >= thresholds.middleSection &&
    semanticFidelityScore >= thresholds.semantic &&
    overallScore >= thresholds.overall;

  return {
    pass,
    coverageScore,
    linkIntegrityScore,
    themeConsistencyScore,
    middleSectionScore,
    semanticFidelityScore,
    overallScore,
    thresholds,
    details: {
      expectedPages,
      generatedPages,
      missingPages,
      brokenLinks: Array.from(new Set(brokenLinks)).slice(0, 50),
      inconsistentThemePages,
      expectedBrand,
      semanticHitPages: Array.from(new Set(semanticHitPages)),
      sourceBrandLeakPages: Array.from(new Set(sourceBrandLeakPages)),
      genericPlaceholderPages: Array.from(new Set(genericPlaceholderPages)),
      thinMiddleSectionPages: Array.from(new Set(thinMiddleSectionPages)),
    },
  };
};
