import type { SiteBlueprint } from "@/lib/agent/site-planner";
import type { SiteLinkGraph } from "@/lib/agent/link-graph";
import { resolveOutputLanguage } from "@/lib/agent/language";

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
    languageMismatchPages: string[];
    templateCopyPages: string[];
    contactGradientTextPages: string[];
    thinMiddleSectionPages: string[];
    repetitiveSectionPages: string[];
    repetitiveStructurePairs: string[];
    criticalDuplicatePairs: string[];
    inconsistentNavSignaturePages: string[];
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

const extractNavSignature = (blocks: Array<{ type?: string; props?: Record<string, unknown> }>) => {
  const navbar = blocks.find((block) => blockIsNavbar(block));
  if (!navbar || !navbar.props || typeof navbar.props !== "object") return "";
  const props = navbar.props as Record<string, unknown>;
  const linksRaw = Array.isArray(props.links) ? (props.links as Array<Record<string, unknown>>) : [];
  const fromLinks = linksRaw
    .map((entry) => ({
      label: String(entry?.label || "").replace(/\s+/g, " ").trim(),
      href: String(entry?.href || "").trim(),
    }))
    .filter((entry) => entry.href.startsWith("/"))
    .map((entry) => ({ ...entry, href: normalizePagePath(entry.href) }));
  const fromLegacySlots = Array.from({ length: 8 }, (_, index) => {
    const slot = index + 1;
    return {
      label: String(props[`navl${slot}text`] || "").replace(/\s+/g, " ").trim(),
      href: String(props[`navl${slot}href`] || "").trim(),
    };
  })
    .filter((entry) => entry.label && entry.href.startsWith("/"))
    .map((entry) => ({ ...entry, href: normalizePagePath(entry.href) }));
  const links = [...fromLinks, ...fromLegacySlots];
  if (!links.length) return "";
  const deduped = Array.from(
    new Map(links.map((entry) => [`${entry.label}::${entry.href}`, entry] as const)).values()
  );
  return deduped.map((entry) => `${entry.label}::${entry.href}`).join("|");
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

const CONTACT_TEXT_GRADIENT_PATTERN = /\b(text-gradient|bg-clip-text|text-transparent)\b/i;

const collectClassLikeValues = (value: unknown, out: string[]) => {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectClassLikeValues(item, out));
    return;
  }
  if (typeof value !== "object") return;
  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    if (typeof entry === "string" && /class/i.test(key)) {
      const compact = entry.trim();
      if (compact) out.push(compact);
      return;
    }
    collectClassLikeValues(entry, out);
  });
};

const blockHasForbiddenContactGradientText = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  if (!blockIsCtaOrContact(item)) return false;
  const type = String(item?.type || "").toLowerCase();
  if (type.includes("leadcapture") && String(item?.props?.emphasis || "").toLowerCase() === "high") return true;
  const classValues: string[] = [];
  collectClassLikeValues(item?.props, classValues);
  return classValues.some((entry) => CONTACT_TEXT_GRADIENT_PATTERN.test(entry));
};

const inferPageIntent = (pathValue: string, nameValue: string) => {
  const token = `${normalizePagePath(pathValue)} ${String(nameValue || "")}`.toLowerCase();
  if (/privacy|terms?|policy|legal|cookie|gdpr/.test(token)) return "legal";
  if (/contact|consult|quote|sales|get[-\s]?in[-\s]?touch/.test(token)) return "contact";
  if (/faq|support|help|docs|documentation|knowledge/.test(token)) return "support";
  if (/about|company|team|history|profile/.test(token)) return "about";
  if (/products?|catalog|pricing|plans?|series|models?/.test(token)) return "products";
  if (/solutions?|approach|workflow|capability/.test(token)) return "solutions";
  if (/cases?|projects?|applications?|portfolio|customers?/.test(token)) return "cases";
  if (/home|^\/$/.test(token)) return "home";
  return "generic";
};

const minMiddleSectionsForIntent = (intent: string) => {
  if (intent === "home") return 4;
  if (intent === "products" || intent === "solutions" || intent === "cases") return 3;
  if (intent === "about") return 2;
  if (intent === "contact" || intent === "support" || intent === "legal") return 1;
  return 2;
};

const blockRoleToken = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  const type = String(item?.type || "").toLowerCase();
  if (!type) return "other";
  if (/hero|masthead|intro/.test(type)) return "hero";
  if (/feature|approach|process|workflow|capability|faq/.test(type)) return "approach";
  if (/product|catalog|pricing|plan|cardsgrid|showcase/.test(type)) return "products";
  if (/testimonial|review|social|proof|logo|trust/.test(type)) return "socialproof";
  if (/story|content|timeline|team|resource|blog|news/.test(type)) return "story";
  if (/contact|leadcapture|cta/.test(type)) return "contact";
  return "other";
};

const roleSequenceSimilarity = (left: string[], right: string[]) => {
  if (!left.length && !right.length) return 1;
  if (!left.length || !right.length) return 0;
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
  return (2 * dp[left.length][right.length]) / (left.length + right.length);
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
  const named = prompt.match(
    /(?:叫|called|named|品牌(?:名称|名)|公司(?:名称|名)|企业(?:名称|名))(?:\s*(?:为|是)\s*|[：:]\s*)([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s]{0,30})/i
  );
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

const genericPlaceholderRegex =
  /^(?:this\s+)?(?:story|approach|social\s*proof|socialproof|product|products|cta|contact|hero|navigation|footer)\s+section(?:\s*(?:content|copy|text|details|placeholder|goes\s+here))?[.!?]?$/i;
const templateCopyRegex =
  /\blorem ipsum\b|\byour brand\b|\bthis section\b|\bplaceholder(?:\s+(?:text|copy))?\b|\{\{[^}]+\}\}|\[\s*(?:title|subtitle|description|content|cta)\s*\]/i;
const brandCandidateStopwords = new Set(
  [
    "home",
    "products",
    "solutions",
    "cases",
    "about",
    "contact",
    "support",
    "blog",
    "privacy",
    "legal",
    "quote",
    "catalog",
    "machine",
    "machines",
    "industrial",
    "company",
  ].map((item) => item.toLowerCase())
);

const normalizeBrandToken = (value: string) =>
  String(value || "")
    .toLowerCase()
    .replace(/[™®]/g, "")
    .replace(/[\s\-_]+/g, "")
    .trim();

const extractBrandCandidatesFromText = (value: string) => {
  const text = String(value || "");
  const matches = [
    ...Array.from(text.matchAll(/\b[A-Z]{2,}(?:-[A-Z0-9]{2,})+\b/g)).map((m) => String(m[0] || "")),
    ...Array.from(text.matchAll(/\b[A-Z][A-Za-z0-9]{2,}(?:\s+[A-Z][A-Za-z0-9]{2,}){0,2}\b/g)).map((m) =>
      String(m[0] || "")
    ),
    ...Array.from(text.matchAll(/\b[A-Za-z][A-Za-z0-9-]{1,}[™®]\b/g)).map((m) => String(m[0] || "")),
  ]
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => normalizeBrandToken(token).length >= 4)
    .filter((token) => !brandCandidateStopwords.has(normalizeBrandToken(token)));
  return Array.from(new Set(matches));
};

export const evaluateGenerationQa = (input: {
  siteBlueprint: SiteBlueprint;
  pages: GenerationPage[];
  linkGraph: SiteLinkGraph;
  prompt?: string;
  thresholds?: Partial<QaGateReport["thresholds"]>;
}): QaGateReport => {
  const strictRepetitionGate = !["0", "false", "off", "no"].includes(
    String(process.env.BUILDER_QA_STRICT_REPETITION_GATE || "true").trim().toLowerCase()
  );
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
  const repetitiveSectionPages: string[] = [];
  const middleTypeSet = new Set<string>();
  const pageRoleSequences: Array<{ path: string; roles: string[] }> = [];
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
    pageRoleSequences.push({
      path: pagePath,
      roles: substantiveBlocks.map((block) => blockRoleToken(block)),
    });
    const roleCounts = new Map<string, number>();
    substantiveBlocks.forEach((block) => {
      const role = blockRoleToken(block);
      if (!role || role === "other") return;
      roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
    });
    const repetitiveRoles = Array.from(roleCounts.entries())
      .filter(([, count]) => count >= 3)
      .map(([role]) => role);
    if (repetitiveRoles.length > 0) {
      repetitiveSectionPages.push(`${pagePath}:${repetitiveRoles.join("+")}`);
    }
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
  const repetitiveStructurePairs: string[] = [];
  const criticalDuplicatePairs: string[] = [];
  const inconsistentNavSignaturePages: string[] = [];
  const totalPairs = Math.max(0, (pageRoleSequences.length * (pageRoleSequences.length - 1)) / 2);
  for (let left = 0; left < pageRoleSequences.length; left += 1) {
    for (let right = left + 1; right < pageRoleSequences.length; right += 1) {
      const l = pageRoleSequences[left];
      const r = pageRoleSequences[right];
      if (!l || !r || !l.roles.length || !r.roles.length) continue;
      if (l.roles.join(">") !== r.roles.join(">")) continue;
      const similarity = roleSequenceSimilarity(l.roles, r.roles);
      if (similarity >= 0.95) repetitiveStructurePairs.push(`${l.path}<->${r.path}`);
    }
  }
  const pathSequenceMap = new Map(pageRoleSequences.map((entry) => [normalizePagePath(entry.path), entry.roles]));
  const criticalPairs: Array<[string, string]> = [
    ["/", "/about"],
    ["/products", "/solutions"],
    ["/solutions", "/cases"],
    ["/products", "/cases"],
  ];
  for (const [leftPath, rightPath] of criticalPairs) {
    const leftRoles = pathSequenceMap.get(leftPath) || [];
    const rightRoles = pathSequenceMap.get(rightPath) || [];
    if (!leftRoles.length || !rightRoles.length) continue;
    const similarity = roleSequenceSimilarity(leftRoles, rightRoles);
    if (similarity >= 0.92) {
      criticalDuplicatePairs.push(`${leftPath}<->${rightPath}`);
    }
  }
  const structuralDiversityScore =
    totalPairs <= 0 ? 1 : clamp(1 - repetitiveStructurePairs.length / totalPairs);
  const localRepetitionScore = clamp(
    contentPages.length ? 1 - repetitiveSectionPages.length / contentPages.length : 1
  );
  const middleSectionScore = clamp(
    middleDensityScore * 0.5 +
      middleDiversityScore * 0.2 +
      structuralDiversityScore * 0.15 +
      localRepetitionScore * 0.15
  );

  const expectedBrand = extractPromptBrand(String(input.prompt || ""));
  const targetLanguage = resolveOutputLanguage(String(input.prompt || ""));
  const normalizedExpectedBrand = normalizeBrandToken(expectedBrand);
  const semanticHitPages: string[] = [];
  const genericPlaceholderPages: string[] = [];
  const languageMismatchPages: string[] = [];
  const templateCopyPages: string[] = [];
  const contactGradientTextPages: string[] = [];
  const sourceBrandLeakPages: string[] = [];
  const pageBrandCandidates = new Map<string, string[]>();
  const brandCandidatePageHits = new Map<string, number>();
  for (const page of contentPages) {
    const pagePath = normalizePagePath(page?.path);
    const textValues: string[] = [];
    collectTextValues(page?.data?.content, textValues);
    const joinedRaw = textValues.join(" ");
    const joinedLower = joinedRaw.toLowerCase();
    if (expectedBrand && joinedLower.includes(expectedBrand.toLowerCase())) semanticHitPages.push(pagePath);
    const hasGenericPlaceholder = textValues.some((item) =>
      genericPlaceholderRegex.test(String(item || "").replace(/\s+/g, " ").trim().toLowerCase())
    );
    if (hasGenericPlaceholder) genericPlaceholderPages.push(pagePath);
    if (templateCopyRegex.test(joinedLower)) templateCopyPages.push(pagePath);
    const cjkCount = (joinedLower.match(/[\u3400-\u9fff]/g) || []).length;
    const latinCount = (joinedLower.match(/[a-z]/gi) || []).length;
    const likelyChinese = cjkCount >= 24 || (cjkCount >= 10 && cjkCount >= latinCount * 0.45);
    const likelyEnglish = latinCount >= 28 && latinCount >= cjkCount * 1.3;
    if (targetLanguage === "zh-CN" && !likelyChinese) languageMismatchPages.push(pagePath);
    if (targetLanguage === "en-US" && !likelyEnglish && latinCount + cjkCount >= 28) {
      languageMismatchPages.push(pagePath);
    }
    if (inferPageIntent(pagePath, String(page?.name || "")) === "contact") {
      const blocks = Array.isArray(page?.data?.content) ? page.data.content : [];
      if (blocks.some((block) => blockHasForbiddenContactGradientText(block))) {
        contactGradientTextPages.push(pagePath);
      }
    }
    const candidates = extractBrandCandidatesFromText(joinedRaw)
      .map((token) => normalizeBrandToken(token))
      .filter(Boolean)
      .filter((token) => {
        if (!normalizedExpectedBrand) return true;
        return !token.includes(normalizedExpectedBrand) && !normalizedExpectedBrand.includes(token);
      });
    const uniqueCandidates = Array.from(new Set(candidates));
    pageBrandCandidates.set(pagePath, uniqueCandidates);
    uniqueCandidates.forEach((token) => {
      brandCandidatePageHits.set(token, (brandCandidatePageHits.get(token) || 0) + 1);
    });
  }
  const driftThreshold = Math.max(2, Math.ceil(contentPages.length * 0.3));
  const driftCandidates = new Set(
    Array.from(brandCandidatePageHits.entries())
      .filter(([, hits]) => hits >= driftThreshold)
      .map(([token]) => token)
  );
  pageBrandCandidates.forEach((tokens, pagePath) => {
    if (tokens.some((token) => driftCandidates.has(token))) {
      sourceBrandLeakPages.push(pagePath);
    }
  });
  const brandCoverage =
    !expectedBrand || contentPages.length === 0 ? 1 : semanticHitPages.length / Math.max(1, contentPages.length);
  const placeholderPenalty =
    contentPages.length === 0 ? 0 : genericPlaceholderPages.length / Math.max(1, contentPages.length);
  const languageMismatchPenalty =
    contentPages.length === 0 ? 0 : languageMismatchPages.length / Math.max(1, contentPages.length);
  const contactGradientPenalty = contactGradientTextPages.length > 0 ? 0.2 : 0;
  // Brand drift is a universal quality signal (for diagnosis), not a release-blocking hard gate.
  const semanticFidelityScore = clamp(
    brandCoverage * 0.7 + (1 - placeholderPenalty) * 0.15 + (1 - languageMismatchPenalty) * 0.15 - contactGradientPenalty
  );

  const navSignatures = contentPages
    .map((page) => ({
      path: normalizePagePath(page?.path),
      signature: extractNavSignature(Array.isArray(page?.data?.content) ? page.data.content : []),
    }))
    .filter((entry) => entry.signature);
  const baseNavSignature = navSignatures[0]?.signature || "";
  if (baseNavSignature) {
    navSignatures.forEach((entry) => {
      if (entry.signature !== baseNavSignature) inconsistentNavSignaturePages.push(entry.path);
    });
  }

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
    overallScore >= thresholds.overall &&
    contactGradientTextPages.length === 0 &&
    templateCopyPages.length === 0 &&
    criticalDuplicatePairs.length === 0 &&
    inconsistentNavSignaturePages.length === 0 &&
    (!strictRepetitionGate || repetitiveSectionPages.length === 0);

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
      languageMismatchPages: Array.from(new Set(languageMismatchPages)),
      templateCopyPages: Array.from(new Set(templateCopyPages)),
      contactGradientTextPages: Array.from(new Set(contactGradientTextPages)),
      thinMiddleSectionPages: Array.from(new Set(thinMiddleSectionPages)),
      repetitiveSectionPages: Array.from(new Set(repetitiveSectionPages)),
      repetitiveStructurePairs: Array.from(new Set(repetitiveStructurePairs)),
      criticalDuplicatePairs: Array.from(new Set(criticalDuplicatePairs)),
      inconsistentNavSignaturePages: Array.from(new Set(inconsistentNavSignaturePages)),
    },
  };
};
