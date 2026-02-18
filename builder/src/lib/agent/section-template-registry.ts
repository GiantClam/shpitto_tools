import fs from "fs";
import path from "path";

import { logInfo, logWarn } from "@/lib/logger";

type SectionKind =
  | "navigation"
  | "hero"
  | "story"
  | "approach"
  | "socialproof"
  | "products"
  | "contact"
  | "cta"
  | "footer";

export type SectionTemplateBlock = {
  type: string;
  props: Record<string, unknown>;
};

export type SiteTemplatePage = {
  path: string;
  name: string;
  requiredCategories: SectionKind[];
};

export type PageTemplateSpec = {
  path: string;
  name: string;
  requiredCategories: SectionKind[];
  templates: Partial<Record<SectionKind, SectionTemplateBlock>>;
};

export type StyleProfile = {
  id: string;
  name: string;
  keywords: string[];
  templates: Partial<Record<SectionKind, SectionTemplateBlock>>;
  siteTemplates?: SiteTemplatePage[];
  pageSpecs?: PageTemplateSpec[];
  qualityScore?: number;
  coverageScore?: number;
  linkIntegrityScore?: number;
  sourceDomain?: string;
  version?: string;
  createdAt?: string;
};

const normalizeToken = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

const cloneProps = (value: Record<string, unknown>) => JSON.parse(JSON.stringify(value)) as Record<string, unknown>;

const inferSectionKind = (sectionType: string, sectionId: string): SectionKind | null => {
  const typeToken = normalizeToken(sectionType);
  const idToken = normalizeToken(sectionId);
  const token = `${typeToken} ${idToken}`.trim();
  if (!token) return null;

  // Strong type-based routing first to avoid id keyword collisions like "project-proof".
  if (/(navigation|navbar|header|topnav)/.test(typeToken)) return "navigation";
  if (/(hero|pagehero|showcasehero)/.test(typeToken)) return "hero";
  if (/(studiostory|story|editorial|content|philosophy|narrative|about|mission)/.test(typeToken)) return "story";
  if (/(approach|metric|stats|feature|valueprop|process)/.test(typeToken)) return "approach";
  if (/(product|catalog|collection|store|shop|showcase|gallery|capability|module)/.test(typeToken))
    return "products";
  if (/(social|testimonial|trust|logo|collaborator|proof)/.test(typeToken)) return "socialproof";
  if (/(footercta|calltoaction|cta|pricing|plan|tier)/.test(typeToken)) return "cta";
  if (/(contact|lead|inquiry|form)/.test(typeToken)) return "contact";
  if (/footer/.test(typeToken)) return "footer";

  // Fallback to combined token matching.
  if (/(navigation|navbar|header|topnav)/.test(token)) return "navigation";
  if (/(hero|pagehero|showcasehero)/.test(token)) return "hero";
  if (/(studiostory|story|editorial|content|philosophy|narrative|about|mission)/.test(token)) return "story";
  if (/(approach|metric|stats|feature|valueprop|process)/.test(token)) return "approach";
  if (/(product|catalog|collection|store|shop|showcase|gallery|capability|module)/.test(token))
    return "products";
  if (/(social|proof|testimonial|trust|logo|collaborator)/.test(token)) return "socialproof";
  if (/(footercta|calltoaction|cta|pricing|plan|tier)/.test(token)) return "cta";
  if (/(contact|lead|inquiry|form)/.test(token)) return "contact";
  if (/footer/.test(token)) return "footer";
  return null;
};

const auraEditorialProfile: StyleProfile = {
  id: "aura_editorial_luxury",
  name: "Shpitto Editorial Luxury",
  keywords: [
    "aura",
    "sixtine",
    "timeless spatial design",
    "gallery-like minimalism",
    "editorial aesthetic",
    "understated luxury",
    "digital-design-13",
  ],
  templates: {
    navigation: {
      type: "Navbar",
      props: {
        logo: "Sixtine",
        links: [
          { label: "STUDIO", href: "#studio", variant: "link" },
          { label: "EXPERTISE", href: "#approach", variant: "link" },
          { label: "JOURNAL", href: "#journal", variant: "link" },
          { label: "PORTFOLIO", href: "#projects", variant: "link" },
          { label: "CONTACT", href: "#contact", variant: "link" },
        ],
        ctas: [{ label: "Start the Dialogue", href: "#contact", variant: "secondary" }],
        variant: "withCTA",
        sticky: true,
        paddingY: "sm",
        maxWidth: "xl",
      },
    },
    hero: {
      type: "HeroSplit",
      props: {
        eyebrow: "The Sixtine Residence",
        title: "Timeless Spatial Design",
        subtitle: "Curated interiors, crafted with restraint and enduring material poetry.",
        ctas: [
          { label: "View Project", href: "#projects", variant: "link" },
          { label: "Inquire", href: "#contact", variant: "secondary" },
        ],
        mediaPosition: "right",
        paddingY: "lg",
        maxWidth: "xl",
      },
    },
    story: {
      type: "ContentStory",
      props: {
        title: "Our Studio",
        subtitle: "Light, texture, and proportion; composed into a calm spatial narrative.",
        body: "We orchestrate bespoke architectural planning and heritage materials to shape homes that feel inevitable.",
        ctas: [{ label: "Explore the Studio", href: "#studio", variant: "link" }],
        variant: "split",
        maxWidth: "xl",
      },
    },
    approach: {
      type: "FeatureGrid",
      props: {
        title: "Define Your Signature Legacy",
        subtitle: "Bespoke interiors, curated for you.",
        items: [
          { title: "Project Scale", desc: "45 custom residences per annum", icon: "layers" },
          { title: "Material Sourcing", desc: "100% ethically sourced stone", icon: "shield" },
          { title: "Client Retention", desc: "98% satisfaction rate", icon: "chart" },
        ],
        variant: "3col",
        maxWidth: "xl",
      },
    },
    socialproof: {
      type: "TestimonialsGrid",
      props: {
        title: "Building for world-class innovators",
        items: [
          {
            quote: "They curated a lifestyle, not only a space.",
            name: "Alexander Vane",
            role: "CEO at Shpitto",
          },
          {
            quote: "A masterclass in restraint and elegance.",
            name: "Isabelle Dubois",
            role: "Founder of ArtHouse",
          },
        ],
        variant: "2col",
        maxWidth: "xl",
      },
    },
    cta: {
      type: "LeadCaptureCTA",
      props: {
        title: "Ready to define your space?",
        subtitle: "Book a private consultation or browse the lookbook.",
        cta: { label: "Inquire Now", href: "#contact", variant: "primary" },
        variant: "banner",
        maxWidth: "xl",
      },
    },
    footer: {
      type: "Footer",
      props: {
        logoText: "Sixtine",
        columns: [
          { title: "Studio", links: [{ label: "Approach", href: "#approach" }, { label: "Projects", href: "#projects" }] },
          { title: "Company", links: [{ label: "Journal", href: "#journal" }, { label: "Contact", href: "#contact" }] },
          { title: "Legal", links: [{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }] },
        ],
        legal: "© 2026 Sixtine Interiors. All rights reserved.",
        variant: "multiColumn",
        paddingY: "md",
        maxWidth: "xl",
      },
    },
  },
};

const builtInStyleProfiles: StyleProfile[] = [auraEditorialProfile];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sectionKinds: SectionKind[] = [
  "navigation",
  "hero",
  "story",
  "approach",
  "socialproof",
  "products",
  "contact",
  "cta",
  "footer",
];

const validateTemplateBlock = (value: unknown): SectionTemplateBlock | null => {
  if (!isRecord(value)) return null;
  if (typeof value.type !== "string" || !value.type.trim()) return null;
  if (!isRecord(value.props)) return null;
  return { type: value.type.trim(), props: value.props };
};

const toRequiredCategories = (value: unknown): SectionKind[] => {
  const rawCategories = Array.isArray((value as Record<string, unknown>)?.requiredCategories)
    ? ((value as Record<string, unknown>).requiredCategories as unknown[])
    : Array.isArray((value as Record<string, unknown>)?.required_categories)
      ? ((value as Record<string, unknown>).required_categories as unknown[])
      : [];
  const requiredCategories = rawCategories
    .map((entry) => normalizeSectionKindToken(entry))
    .filter((entry): entry is SectionKind => Boolean(entry));
  return Array.from(new Set(requiredCategories));
};

const validateTemplateMap = (value: unknown): Partial<Record<SectionKind, SectionTemplateBlock>> => {
  if (!isRecord(value)) return {};
  const templates: Partial<Record<SectionKind, SectionTemplateBlock>> = {};
  for (const kind of sectionKinds) {
    if (!(kind in value)) continue;
    const block = validateTemplateBlock(value[kind]);
    if (!block) continue;
    templates[kind] = block;
  }
  return templates;
};

const validateSectionSpecsMap = (value: unknown): Partial<Record<SectionKind, SectionTemplateBlock>> => {
  if (!isRecord(value)) return {};
  const templates: Partial<Record<SectionKind, SectionTemplateBlock>> = {};
  for (const kind of sectionKinds) {
    if (!(kind in value)) continue;
    const entry = value[kind];
    if (!isRecord(entry)) continue;
    const blockType =
      typeof entry.block_type === "string" && entry.block_type.trim()
        ? entry.block_type.trim()
        : typeof entry.blockType === "string" && entry.blockType.trim()
          ? entry.blockType.trim()
          : "";
    const props = isRecord(entry.defaults)
      ? entry.defaults
      : isRecord(entry.props)
        ? entry.props
        : null;
    if (!blockType || !props) continue;
    templates[kind] = { type: blockType, props };
  }
  return templates;
};

const normalizeTemplatePagePath = (value: unknown) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const normalized = withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
  return normalized === "" ? "/" : normalized;
};

const normalizeSectionKindToken = (value: unknown): SectionKind | null => {
  const token = normalizeToken(typeof value === "string" ? value : "");
  const found = sectionKinds.find((kind) => normalizeToken(kind) === token);
  return found ?? null;
};

const clampScore = (value: unknown): number | undefined => {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Number(n.toFixed(2));
};

const normalizeDomain = (value: unknown): string => {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  return raw.replace(/^www\./, "");
};

const validateSiteTemplatePage = (value: unknown): SiteTemplatePage | null => {
  if (!isRecord(value)) return null;
  const path = normalizeTemplatePagePath(value.path);
  const name =
    typeof value.name === "string" && value.name.trim()
      ? value.name.trim()
      : path === "/"
        ? "Home"
        : path
            .split("/")
            .filter(Boolean)
            .pop()
            ?.replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (ch) => ch.toUpperCase()) || "Page";
  const requiredCategories = toRequiredCategories(value);
  if (!requiredCategories.length) return null;
  return { path, name, requiredCategories: Array.from(new Set(requiredCategories)) };
};

const validatePageTemplateSpec = (value: unknown): PageTemplateSpec | null => {
  if (!isRecord(value)) return null;
  const path = normalizeTemplatePagePath(value.path);
  const name =
    typeof value.name === "string" && value.name.trim()
      ? value.name.trim()
      : path === "/"
        ? "Home"
        : path
            .split("/")
            .filter(Boolean)
            .pop()
            ?.replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (ch) => ch.toUpperCase()) || "Page";
  let requiredCategories = toRequiredCategories(value);
  const templatesFromTemplates = validateTemplateMap(value.templates);
  const templatesFromSectionSpecs = validateSectionSpecsMap(value.section_specs ?? value.sectionSpecs);
  const templates = Object.keys(templatesFromTemplates).length ? templatesFromTemplates : templatesFromSectionSpecs;
  if (!requiredCategories.length && Object.keys(templates).length) {
    requiredCategories = sectionKinds.filter((kind) => Boolean(templates[kind]));
  }
  if (!requiredCategories.length) return null;
  return {
    path,
    name,
    requiredCategories,
    templates,
  };
};

const validateStyleProfile = (value: unknown): StyleProfile | null => {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id.trim()) return null;
  if (typeof value.name !== "string" || !value.name.trim()) return null;
  if (!Array.isArray(value.keywords) || !value.keywords.length) return null;
  const keywords = value.keywords
    .map((keyword) => (typeof keyword === "string" ? keyword.trim() : ""))
    .filter(Boolean);
  if (!keywords.length) return null;
  if (!isRecord(value.templates)) return null;

  const templates = validateTemplateMap(value.templates);
  if (!Object.keys(templates).length) return null;
  const rawSiteTemplates = Array.isArray(value.siteTemplates)
    ? value.siteTemplates
    : Array.isArray(value.site_templates)
      ? value.site_templates
      : [];
  const siteTemplates = rawSiteTemplates
    .map((entry) => validateSiteTemplatePage(entry))
    .filter((entry): entry is SiteTemplatePage => Boolean(entry));
  const rawPageSpecs = Array.isArray(value.pageSpecs)
    ? value.pageSpecs
    : Array.isArray(value.page_specs)
      ? value.page_specs
      : [];
  const pageSpecs = rawPageSpecs
    .map((entry) => validatePageTemplateSpec(entry))
    .filter((entry): entry is PageTemplateSpec => Boolean(entry));
  const qualityScore = clampScore(value.qualityScore ?? value.quality_score);
  const coverageScore = clampScore(value.coverageScore ?? value.coverage_score);
  const linkIntegrityScore = clampScore(value.linkIntegrityScore ?? value.link_integrity_score);
  const sourceDomain = normalizeDomain(value.sourceDomain ?? value.source_domain);
  const version = typeof value.version === "string" && value.version.trim() ? value.version.trim() : "";
  const createdAt = typeof value.createdAt === "string" && value.createdAt.trim()
    ? value.createdAt.trim()
    : typeof value.created_at === "string" && value.created_at.trim()
      ? value.created_at.trim()
      : "";

  return {
    id: value.id.trim(),
    name: value.name.trim(),
    keywords,
    templates,
    ...(siteTemplates.length ? { siteTemplates } : {}),
    ...(pageSpecs.length ? { pageSpecs } : {}),
    ...(qualityScore !== undefined ? { qualityScore } : {}),
    ...(coverageScore !== undefined ? { coverageScore } : {}),
    ...(linkIntegrityScore !== undefined ? { linkIntegrityScore } : {}),
    ...(sourceDomain ? { sourceDomain } : {}),
    ...(version ? { version } : {}),
    ...(createdAt ? { createdAt } : {}),
  };
};

type ExternalLibraryPayload = {
  profiles?: unknown[];
};

const defaultExternalLibraryPath = path.join(
  process.cwd(),
  "template-factory",
  "library",
  "style-profiles.generated.json"
);

const resolveExternalLibraryPath = () => {
  const configured = process.env.BUILDER_TEMPLATE_LIBRARY_PATH?.trim();
  if (!configured) return defaultExternalLibraryPath;
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
};

const loadExternalStyleProfiles = (): StyleProfile[] => {
  const filePath = resolveExternalLibraryPath();
  if (!fs.existsSync(filePath)) return [];

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as ExternalLibraryPayload | unknown[];
    const profileValues = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as ExternalLibraryPayload)?.profiles)
        ? (parsed as ExternalLibraryPayload).profiles ?? []
        : [];
    const profiles = profileValues
      .map((item) => validateStyleProfile(item))
      .filter((item): item is StyleProfile => Boolean(item));
    if (!profiles.length) {
      logInfo("[creation:agent] template-library:external_empty", { filePath });
      return [];
    }
    logInfo("[creation:agent] template-library:external_loaded", {
      filePath,
      profiles: profiles.length,
    });
    return profiles;
  } catch (error: any) {
    logWarn("[creation:agent] template-library:external_load_failed", {
      filePath,
      message: error?.message ?? String(error),
    });
    return [];
  }
};

const dedupeProfiles = (profiles: StyleProfile[]) => {
  const seen = new Set<string>();
  const ordered: StyleProfile[] = [];
  for (const profile of profiles) {
    const id = profile.id.trim().toLowerCase();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ordered.push(profile);
  }
  return ordered;
};

const styleProfiles: StyleProfile[] = dedupeProfiles([
  ...loadExternalStyleProfiles(),
  ...builtInStyleProfiles,
]);

export const getStyleProfiles = () => styleProfiles;

// ---------------------------------------------------------------------------
// Industry taxonomy for semantic matching
// ---------------------------------------------------------------------------
const industryTaxonomy: Record<string, string[]> = {
  technology: ["tech", "saas", "software", "app", "platform", "ai", "cloud", "startup", "digital", "api", "devtool", "iot", "automation"],
  ecommerce: ["shop", "store", "ecommerce", "commerce", "retail", "product", "marketplace", "brand", "fashion", "apparel", "clothing", "sneaker", "shoe"],
  industrial: ["industrial", "manufacturing", "factory", "machinery", "engineering", "automation", "cnc", "steel", "metal", "heavy", "equipment"],
  luxury: ["luxury", "premium", "highend", "bespoke", "exclusive", "couture", "artisan", "craftsmanship", "heritage"],
  creative: ["design", "studio", "agency", "creative", "portfolio", "photography", "art", "gallery", "architect", "interior"],
  food: ["restaurant", "cafe", "food", "dining", "bakery", "coffee", "tea", "culinary", "chef", "catering", "bar"],
  health: ["health", "medical", "clinic", "wellness", "fitness", "gym", "yoga", "spa", "pharma", "dental", "hospital"],
  education: ["education", "school", "university", "course", "learning", "academy", "training", "tutorial", "edtech"],
  finance: ["finance", "bank", "fintech", "insurance", "investment", "crypto", "trading", "payment", "accounting"],
  realestate: ["realestate", "property", "housing", "apartment", "home", "villa", "estate", "realtor", "construction"],
};

// Style taxonomy for visual tone matching
const styleTaxonomy: Record<string, string[]> = {
  minimal: ["minimal", "minimalist", "clean", "simple", "whitespace", "understated", "zen", "scandinavian", "nordic"],
  bold: ["bold", "vibrant", "colorful", "energetic", "dynamic", "loud", "striking", "neon", "gradient"],
  elegant: ["elegant", "sophisticated", "refined", "classic", "timeless", "graceful", "editorial", "serif"],
  modern: ["modern", "contemporary", "sleek", "futuristic", "geometric", "sharp", "glassmorphism"],
  dark: ["dark", "darkmode", "night", "moody", "cinematic", "noir", "dramatic"],
  playful: ["playful", "fun", "whimsical", "cartoon", "rounded", "friendly", "casual", "warm"],
  corporate: ["corporate", "professional", "enterprise", "business", "formal", "trustworthy", "institutional"],
  japanese: ["japanese", "japan", "wabi", "sabi", "zen", "tatami", "matcha", "sakura", "nihon"],
};

const extractTaxonomySignals = (text: string): { industries: string[]; styles: string[] } => {
  const normalized = normalizeToken(text);
  const industries: string[] = [];
  const styles: string[] = [];
  for (const [category, tokens] of Object.entries(industryTaxonomy)) {
    if (tokens.some((t) => normalized.includes(t))) industries.push(category);
  }
  for (const [category, tokens] of Object.entries(styleTaxonomy)) {
    if (tokens.some((t) => normalized.includes(t))) styles.push(category);
  }
  return { industries, styles };
};

const computeProfileSemanticScore = (
  profile: StyleProfile,
  promptSignals: { industries: string[]; styles: string[] }
): number => {
  const profileText = normalizeToken(
    `${profile.name} ${profile.keywords.join(" ")}`
  );
  const profileSignals = extractTaxonomySignals(profileText);

  let score = 0;
  // Industry overlap: strong signal (3 points each)
  for (const industry of promptSignals.industries) {
    if (profileSignals.industries.includes(industry)) score += 3;
  }
  // Style overlap: moderate signal (2 points each)
  for (const style of promptSignals.styles) {
    if (profileSignals.styles.includes(style)) score += 2;
  }
  return score;
};

const extractPromptDomain = (prompt: string): string => {
  const raw = String(prompt || "").trim();
  if (!raw) return "";

  const urlMatch = raw.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch) {
    try {
      return normalizeDomain(new URL(urlMatch[0]).hostname);
    } catch {
      // no-op
    }
  }

  const domainLike = raw.match(/\b(?:www\.)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)\b/i);
  if (domainLike?.[1]) {
    return normalizeDomain(domainLike[1]);
  }
  return "";
};

const computeDomainMatchScore = (profile: StyleProfile, promptDomain: string): number => {
  if (!promptDomain) return 0;
  const profileDomain = normalizeDomain(profile.sourceDomain || "");
  if (!profileDomain) return 0;
  if (profileDomain === promptDomain) return 8;
  if (promptDomain.endsWith(`.${profileDomain}`) || profileDomain.endsWith(`.${promptDomain}`)) return 4;
  return 0;
};

const computeQualityBonus = (profile: StyleProfile): number => {
  const quality = clampScore(profile.qualityScore);
  if (quality === undefined) return 0;
  return Number((quality / 25).toFixed(2));
};

export const selectStyleProfile = (prompt: string): StyleProfile | null => {
  const normalizedPrompt = normalizeToken(prompt);
  if (!normalizedPrompt) return null;

  const promptSignals = extractTaxonomySignals(prompt);
  const promptDomain = extractPromptDomain(prompt);

  let best: StyleProfile | null = null;
  let bestScore = 0;
  let bestMatchedChars = 0;
  let bestTemplateCount = 0;
  let bestQuality = -1;
  for (const profile of styleProfiles) {
    // --- Layer 1: exact keyword matching (original logic) ---
    let matchedChars = 0;
    const keywordScore = profile.keywords.reduce((acc, keyword) => {
      const token = normalizeToken(keyword);
      if (token && normalizedPrompt.includes(token)) {
        matchedChars += token.length;
        return acc + 1;
      }
      return acc;
    }, 0);

    // --- Layer 2: semantic taxonomy matching ---
    const semanticScore = computeProfileSemanticScore(profile, promptSignals);
    const domainScore = computeDomainMatchScore(profile, promptDomain);
    const qualityBonus = computeQualityBonus(profile);

    // Require at least one intent signal, avoid selecting only by quality.
    if (keywordScore <= 0 && semanticScore <= 0 && domainScore <= 0) continue;

    const score = keywordScore + semanticScore + domainScore + qualityBonus;
    if (score <= 0) continue;

    const templateCount = Object.keys(profile.templates ?? {}).length;
    const qualityScore = clampScore(profile.qualityScore) ?? 0;
    const shouldReplace =
      score > bestScore ||
      (score === bestScore && matchedChars > bestMatchedChars) ||
      (score === bestScore && matchedChars === bestMatchedChars && qualityScore > bestQuality) ||
      (score === bestScore &&
        matchedChars === bestMatchedChars &&
        qualityScore === bestQuality &&
        templateCount > bestTemplateCount) ||
      // Tie-breaker: prefer the later profile (usually the latest generated one).
      (score === bestScore &&
        matchedChars === bestMatchedChars &&
        qualityScore === bestQuality &&
        templateCount === bestTemplateCount);

    if (shouldReplace) {
      best = profile;
      bestScore = score;
      bestMatchedChars = matchedChars;
      bestTemplateCount = templateCount;
      bestQuality = qualityScore;
    }
  }

  if (best) {
    logInfo("[creation:agent] template-library:profile_selected", {
      profileId: best.id,
      score: bestScore,
      matchedChars: bestMatchedChars,
      qualityScore: best.qualityScore ?? null,
      sourceDomain: best.sourceDomain ?? "",
      promptDomain,
      promptIndustries: promptSignals.industries.join(","),
      promptStyles: promptSignals.styles.join(","),
    });
  }

  return bestScore > 0 ? best : null;
};

// ---------------------------------------------------------------------------
// Template personalization context — carries architect blueprint signals
// ---------------------------------------------------------------------------
export type TemplatePersonalizationContext = {
  /** The raw user prompt */
  prompt: string;
  pagePath?: string;
  pageName: string;
  sectionType: string;
  sectionId: string;
  sectionIntent?: string;
  idBase: string;
  anchor: string;
  /** Architect-generated design north star */
  designNorthStar?: Record<string, unknown>;
  /** Architect-generated theme */
  theme?: Record<string, unknown>;
  /** Architect propsHints for this section */
  propsHints?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Extract brand name from prompt (first quoted string, or first capitalized phrase)
// ---------------------------------------------------------------------------
const extractBrandName = (prompt: string): string | null => {
  // Try quoted brand name first: "Brand Name" or 「品牌名」
  const quoted = prompt.match(/["「]([^"」]{1,40})["」]/);
  if (quoted) return quoted[1].trim();
  // Try "叫/called/named X" pattern
  const named = prompt.match(/(?:叫|called|named|品牌名?(?:为|是)?)\s*[：:]?\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s]{0,30})/i);
  if (named) return named[1].trim();
  return null;
};

// ---------------------------------------------------------------------------
// Extract CTA labels from propsHints or intent
// ---------------------------------------------------------------------------
const extractCtaLabel = (hints?: Record<string, unknown>, fallback?: string): string => {
  if (hints) {
    const label = hints.ctaLabel ?? hints.cta_label ?? hints.primaryCtaLabel;
    if (typeof label === "string" && label.trim()) return label.trim().slice(0, 48);
  }
  return fallback ?? "Get Started";
};

const extractSubtitle = (hints?: Record<string, unknown>, intent?: string): string | null => {
  if (hints) {
    const sub = hints.subtitle ?? hints.description ?? hints.tagline;
    if (typeof sub === "string" && sub.trim()) return sub.trim().slice(0, 200);
  }
  if (intent && intent.trim()) return intent.trim().slice(0, 200);
  return null;
};

// ---------------------------------------------------------------------------
// Deep personalization: apply architect signals to template props
// ---------------------------------------------------------------------------
const personalizeTemplateProps = (
  props: Record<string, unknown>,
  kind: SectionKind,
  ctx: TemplatePersonalizationContext
): void => {
  const hints = ctx.propsHints ?? {};
  const northStar = ctx.designNorthStar ?? {};
  const brandName = extractBrandName(ctx.prompt) ?? ctx.pageName ?? "Brand";

  // --- Universal: id & anchor ---
  if (typeof props.id !== "string" || !props.id) {
    props.id = ctx.idBase;
  }
  if (typeof props.anchor !== "string" || !props.anchor) {
    props.anchor = kind === "navigation" ? "top" : ctx.anchor;
  }

  // --- Navigation ---
  if (kind === "navigation") {
    const logoValue = props.logo;
    if (typeof logoValue === "string") {
      props.logo = { alt: brandName };
    } else if (isRecord(logoValue)) {
      const src = typeof logoValue.src === "string" && logoValue.src.trim() ? logoValue.src.trim() : undefined;
      props.logo = src ? { src, alt: brandName } : { alt: brandName };
    } else {
      props.logo = { alt: brandName };
    }
    // Personalize CTA label in nav
    if (Array.isArray(props.ctas) && props.ctas.length > 0) {
      const navCta = props.ctas[0] as Record<string, unknown>;
      const hintedCtaLabel = extractCtaLabel(hints);
      if (hintedCtaLabel !== "Get Started") navCta.label = hintedCtaLabel;
    }
  }

  // --- Footer ---
  if (kind === "footer") {
    props.logoText = brandName;
    // Apply footer links from hints
    if (Array.isArray((hints as any).footerLinks)) {
      const links = ((hints as any).footerLinks as Array<Record<string, unknown>>)
        .map((item) => ({
          label: typeof item?.label === "string" ? item.label.trim().slice(0, 24) : "",
          href: typeof item?.href === "string" ? item.href.trim().slice(0, 200) : "#",
        }))
        .filter((item) => item.label)
        .slice(0, 6);
      if (links.length) props.footerLinks = links;
    }
    // Apply legal text
    const legal = typeof hints.legal === "string" && hints.legal.trim()
      ? hints.legal.trim().slice(0, 120)
      : `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;
    props.legal = legal;
  }

  // --- Hero ---
  if (kind === "hero") {
    // Title from intent or hints
    const intentTitle = ctx.sectionIntent?.trim();
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    const hintedTitle = typeof hints.title === "string" && hints.title.trim() ? hints.title.trim() : null;
    if (hintedTitle) props.title = hintedTitle.slice(0, 96);
    // Subtitle
    const sub = extractSubtitle(hints, ctx.sectionIntent);
    if (sub && sub !== props.title) props.subtitle = sub;
    // Eyebrow from industry or brand
    const industry = typeof northStar.industry === "string" && northStar.industry.trim()
      ? northStar.industry.trim()
      : null;
    if (industry) props.eyebrow = industry.slice(0, 48);
    // CTA labels
    if (Array.isArray(props.ctas) && props.ctas.length > 0) {
      const primaryCta = props.ctas[0] as Record<string, unknown>;
      primaryCta.label = extractCtaLabel(hints, primaryCta.label as string);
    }
  }

  // --- Story / Content ---
  if (kind === "story") {
    const intentTitle = ctx.sectionIntent?.trim();
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    const sub = extractSubtitle(hints);
    if (sub) props.subtitle = sub;
    const body = typeof hints.body === "string" && hints.body.trim() ? hints.body.trim() : null;
    if (body) props.body = body.slice(0, 500);
  }

  // --- Approach / Features ---
  if (kind === "approach") {
    const intentTitle = ctx.sectionIntent?.trim();
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    const sub = extractSubtitle(hints);
    if (sub) props.subtitle = sub;
    // Apply items from propsHints if available
    if (Array.isArray(hints.items) && hints.items.length > 0) {
      const items = (hints.items as Array<Record<string, unknown>>)
        .map((item) => ({
          title: typeof item?.title === "string" ? item.title.trim().slice(0, 64) : "",
          desc: typeof item?.desc === "string" ? item.desc.trim().slice(0, 200)
            : typeof item?.description === "string" ? item.description.trim().slice(0, 200) : "",
          icon: typeof item?.icon === "string" ? item.icon.trim() : undefined,
        }))
        .filter((item) => item.title)
        .slice(0, 8);
      if (items.length) props.items = items;
    }
  }

  // --- Social Proof / Testimonials ---
  if (kind === "socialproof") {
    const intentTitle = ctx.sectionIntent?.trim();
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    // Apply testimonials from hints
    if (Array.isArray(hints.testimonials) && hints.testimonials.length > 0) {
      const testimonials = (hints.testimonials as Array<Record<string, unknown>>)
        .map((item) => ({
          name: typeof item?.name === "string" ? item.name.trim().slice(0, 48) : "",
          role: typeof item?.role === "string" ? item.role.trim().slice(0, 64) : "",
          quote: typeof item?.quote === "string" ? item.quote.trim().slice(0, 220) : "",
        }))
        .filter((item) => item.name || item.quote)
        .slice(0, 6);
      if (testimonials.length) props.items = testimonials;
    }
    // Apply logos from hints
    if (Array.isArray(hints.logos) && hints.logos.length > 0) {
      const logos = (hints.logos as Array<Record<string, unknown> | string>)
        .map((item) => {
          if (typeof item === "string") return { name: item.trim().slice(0, 32) };
          return {
            name: typeof item?.name === "string" ? item.name.trim().slice(0, 32) : "",
            src: typeof item?.src === "string" ? item.src.trim().slice(0, 200) : undefined,
          };
        })
        .filter((item) => item.name)
        .slice(0, 8);
      if (logos.length) props.logos = logos;
    }
  }

  // --- Products / Catalog ---
  if (kind === "products") {
    const intentTitle = ctx.sectionIntent?.trim();
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    const sub = extractSubtitle(hints);
    if (sub) props.subtitle = sub;
    // Apply product items from hints or designNorthStar.coreProducts
    const hintItems = Array.isArray(hints.items) ? hints.items as Array<Record<string, unknown>> : [];
    const coreProducts = Array.isArray(northStar.coreProducts) ? northStar.coreProducts as string[] : [];
    if (hintItems.length > 0) {
      const items = hintItems
        .map((item) => ({
          title: typeof item?.title === "string" ? item.title.trim().slice(0, 64) : "",
          desc: typeof item?.desc === "string" ? item.desc.trim().slice(0, 200)
            : typeof item?.description === "string" ? item.description.trim().slice(0, 200) : "",
        }))
        .filter((item) => item.title)
        .slice(0, 8);
      if (items.length) props.items = items;
    } else if (coreProducts.length > 0) {
      props.items = coreProducts.slice(0, 8).map((name) => ({
        title: typeof name === "string" ? name.trim().slice(0, 64) : "Product",
        desc: "",
      }));
    }
  }

  // --- CTA ---
  if (kind === "cta") {
    const intentTitle = ctx.sectionIntent?.trim();
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    const sub = extractSubtitle(hints);
    if (sub) props.subtitle = sub;
    props.ctaLabel = extractCtaLabel(hints, props.ctaLabel as string);
    // Secondary CTA
    const secondaryLabel = typeof hints.secondaryCtaLabel === "string" && hints.secondaryCtaLabel.trim()
      ? hints.secondaryCtaLabel.trim().slice(0, 48) : undefined;
    if (secondaryLabel) props.secondaryCtaLabel = secondaryLabel;
  }

  // --- Contact ---
  if (kind === "contact") {
    const intentTitle = ctx.sectionIntent?.trim();
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    // Form fields from hints
    if (Array.isArray(hints.formFields) && hints.formFields.length > 0) {
      const fields = (hints.formFields as string[])
        .map((f) => typeof f === "string" ? f.trim() : "")
        .filter(Boolean)
        .slice(0, 8);
      if (fields.length) props.formFields = fields;
    }
    // WhatsApp
    const whatsapp = typeof hints.whatsappNumber === "string" ? hints.whatsappNumber.replace(/[^0-9+]/g, "") : "";
    if (whatsapp) props.whatsapp = whatsapp;
  }
};

export const resolveSectionTemplateBlock = (input: TemplatePersonalizationContext): SectionTemplateBlock | null => {
  const profile = selectStyleProfile(input.prompt);
  if (!profile) return null;

  const kind = inferSectionKind(input.sectionType, input.sectionId);
  if (!kind) return null;

  const normalizedPagePath = normalizeTemplatePagePath(input.pagePath);
  const pageSpec =
    Array.isArray(profile.pageSpecs) &&
    profile.pageSpecs.find((entry) => normalizeTemplatePagePath(entry.path) === normalizedPagePath);
  const template = pageSpec?.templates?.[kind] ?? profile.templates[kind];
  if (!template) return null;

  const props = cloneProps(template.props);
  personalizeTemplateProps(props, kind, input);

  return { type: template.type, props };
};
