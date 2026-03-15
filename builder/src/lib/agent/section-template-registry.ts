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

export type TemplatePageType =
  | "home"
  | "about"
  | "solutions"
  | "products"
  | "cases"
  | "contact"
  | "blog"
  | "legal"
  | "support"
  | "generic";

export type SiteStyleShell = {
  styleFamily?: string;
  theme?: Record<string, unknown>;
  navigationBlockType?: string;
  footerBlockType?: string;
  motionProfile?: "none" | "subtle" | "showcase" | "immersive";
};

export type SiteTemplatePage = {
  path: string;
  name: string;
  pageType?: TemplatePageType;
  requiredCategories: SectionKind[];
};

export type PageTemplateSpec = {
  path: string;
  name: string;
  pageType?: TemplatePageType;
  requiredCategories: SectionKind[];
  templates: Partial<Record<SectionKind, SectionTemplateBlock>>;
  sections?: Array<{
    kind: SectionKind;
    block: SectionTemplateBlock;
    source?: "profile" | "page";
    ordinal?: number;
  }>;
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
  siteStyleShell?: SiteStyleShell;
  version?: string;
  createdAt?: string;
};

const normalizeToken = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
const normalizeSemanticText = (value: string) => value.trim().toLowerCase().normalize("NFKC");
const normalizeComparableToken = (value: string) =>
  normalizeSemanticText(value).replace(/[^a-z0-9\u3400-\u9fff]+/g, "");
const containsCjk = (value: string) => /[\u3400-\u9fff]/.test(value);
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const includesSemanticToken = (haystack: string, needle: string) => {
  const normalizedNeedle = normalizeComparableToken(needle);
  if (!normalizedNeedle) return false;
  if (!containsCjk(needle) && /^[a-z0-9]+$/.test(normalizedNeedle) && normalizedNeedle.length <= 3) {
    const wordHaystack = normalizeSemanticText(haystack).replace(/[^a-z0-9\u3400-\u9fff]+/g, " ");
    return new RegExp(`(^|\\s)${escapeRegExp(normalizedNeedle)}(?=$|\\s)`, "i").test(wordHaystack);
  }
  const normalizedHaystack = normalizeComparableToken(haystack);
  if (normalizedHaystack.includes(normalizedNeedle)) return true;
  if (!containsCjk(needle)) return false;
  const rawNeedle = normalizeSemanticText(needle).replace(/\s+/g, "");
  const rawHaystack = normalizeSemanticText(haystack).replace(/\s+/g, "");
  return !!rawNeedle && rawHaystack.includes(rawNeedle);
};
const countSemanticTokenMatches = (haystack: string, needles: string[]) =>
  needles.reduce((count, needle) => count + (includesSemanticToken(haystack, needle) ? 1 : 0), 0);

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

const pageTypeTokens: TemplatePageType[] = [
  "home",
  "about",
  "solutions",
  "products",
  "cases",
  "contact",
  "blog",
  "legal",
  "support",
  "generic",
];

const normalizePageTypeToken = (value: unknown): TemplatePageType | null => {
  const token = normalizeToken(typeof value === "string" ? value : "");
  const found = pageTypeTokens.find((entry) => normalizeToken(entry) === token);
  return found ?? null;
};

const inferTemplatePageType = (pathValue: unknown, nameValue: unknown): TemplatePageType => {
  const pathToken = normalizeToken(typeof pathValue === "string" ? pathValue : "");
  const nameToken = normalizeToken(typeof nameValue === "string" ? nameValue : "");
  const token = `${pathToken} ${nameToken}`.trim();
  if (!token || token === "/") return "home";
  if (pathToken === "/" || /(^|[^a-z])home($|[^a-z])/.test(token)) return "home";
  if (/(about|company|story|mission|vision|who|team)/.test(token)) return "about";
  if (/(solution|service|capabilit|workflow|industry)/.test(token)) return "solutions";
  if (/(product|catalog|collection|pricing|plan|store|shop)/.test(token)) return "products";
  if (/(case|customer|testimonial|proof|review|success|portfolio)/.test(token)) return "cases";
  if (/(contact|quote|inquir|demo|consult|book)/.test(token)) return "contact";
  if (/(blog|news|journal|article|insight|press)/.test(token)) return "blog";
  if (/(legal|privacy|term|policy|cookie|gdpr)/.test(token)) return "legal";
  if (/(support|help|faq|docs|documentation)/.test(token)) return "support";
  return "generic";
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
  const pageType =
    normalizePageTypeToken(value.pageType ?? value.page_type) ?? inferTemplatePageType(path, name);
  return {
    path,
    name,
    pageType,
    requiredCategories: Array.from(new Set(requiredCategories)),
  };
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
  const sections = Array.isArray(value.sections)
    ? value.sections
        .map((entry) => {
          if (!isRecord(entry)) return null;
          const kind = normalizeSectionKindToken(entry.kind);
          if (!kind) return null;
          const block = validateTemplateBlock(entry.block);
          if (!block) return null;
          const source =
            entry.source === "profile" || entry.source === "page"
              ? entry.source
              : undefined;
          const ordinal = Number.isFinite(Number(entry.ordinal)) ? Number(entry.ordinal) : undefined;
          return {
            kind,
            block,
            ...(source ? { source } : {}),
            ...(ordinal ? { ordinal } : {}),
          };
        })
        .filter(
          (
            entry
          ): entry is {
            kind: SectionKind;
            block: SectionTemplateBlock;
            source?: "profile" | "page";
            ordinal?: number;
          } => Boolean(entry)
        )
    : [];
  if (!requiredCategories.length && Object.keys(templates).length) {
    requiredCategories = sectionKinds.filter((kind) => Boolean(templates[kind]));
  }
  if (!requiredCategories.length && sections.length) {
    requiredCategories = Array.from(new Set(sections.map((entry) => entry.kind)));
  }
  if (!requiredCategories.length) return null;
  const pageType =
    normalizePageTypeToken(value.pageType ?? value.page_type) ?? inferTemplatePageType(path, name);
  return {
    path,
    name,
    pageType,
    requiredCategories,
    templates,
    ...(sections.length ? { sections } : {}),
  };
};

const validateSiteStyleShell = (value: unknown): SiteStyleShell | undefined => {
  if (!isRecord(value)) return undefined;
  const styleFamily = typeof value.styleFamily === "string" && value.styleFamily.trim()
    ? value.styleFamily.trim()
    : typeof value.style_family === "string" && value.style_family.trim()
      ? value.style_family.trim()
      : "";
  const theme = isRecord(value.theme) ? value.theme : undefined;
  const navigationBlockType =
    typeof value.navigationBlockType === "string" && value.navigationBlockType.trim()
      ? value.navigationBlockType.trim()
      : typeof value.navigation_block_type === "string" && value.navigation_block_type.trim()
        ? value.navigation_block_type.trim()
        : "";
  const footerBlockType =
    typeof value.footerBlockType === "string" && value.footerBlockType.trim()
      ? value.footerBlockType.trim()
      : typeof value.footer_block_type === "string" && value.footer_block_type.trim()
        ? value.footer_block_type.trim()
        : "";
  const motionToken = String(value.motionProfile ?? value.motion_profile ?? "").trim().toLowerCase();
  const motionProfile =
    motionToken === "none" || motionToken === "subtle" || motionToken === "showcase" || motionToken === "immersive"
      ? (motionToken as SiteStyleShell["motionProfile"])
      : undefined;
  if (!styleFamily && !theme && !navigationBlockType && !footerBlockType && !motionProfile) return undefined;
  return {
    ...(styleFamily ? { styleFamily } : {}),
    ...(theme ? { theme } : {}),
    ...(navigationBlockType ? { navigationBlockType } : {}),
    ...(footerBlockType ? { footerBlockType } : {}),
    ...(motionProfile ? { motionProfile } : {}),
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
  const siteStyleShell = validateSiteStyleShell(value.siteStyleShell ?? value.site_style_shell);
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
    ...(siteStyleShell ? { siteStyleShell } : {}),
    ...(version ? { version } : {}),
    ...(createdAt ? { createdAt } : {}),
  };
};

type ExternalLibraryPayload = {
  profiles?: unknown[];
  templateExclusiveComponents?: unknown[];
  templateBlockCatalog?: unknown[];
  templateGenerationContracts?: unknown[];
};

type EditableFieldType = "text" | "image" | "link" | "style" | "number" | "boolean";

export type EditableFieldContract = {
  path: string;
  type: EditableFieldType;
};

type TemplateExclusiveComponentContract = {
  name: string;
  editableFields: EditableFieldContract[];
};

type PublishedBlockCatalogEntry = {
  blockType: string;
  kind: SectionKind;
  source: "profile" | "page";
  profileId: string;
  styleFamily?: string;
  pagePath?: string;
  pageType?: TemplatePageType;
  props: Record<string, unknown>;
  editableFields: EditableFieldContract[];
  baseBlockType?: string;
  sourceDomain?: string;
  qualityScore?: number;
};

export type PublishedSectionGenerationContract = {
  kind: SectionKind;
  blockType: string;
  source: "profile" | "page";
  editableFields: EditableFieldContract[];
  baseBlockType?: string;
  slotId?: string;
  role?: string;
  imageIntent?: string;
};

export type PublishedPageGenerationContract = {
  path: string;
  name: string;
  pageType?: TemplatePageType;
  requiredCategories: SectionKind[];
  sections: PublishedSectionGenerationContract[];
};

type PublishedProfileGenerationContract = {
  profileId: string;
  name: string;
  sourceDomain?: string;
  styleFamily?: string;
  keywords?: string[];
  qualityScore?: number;
  shared?: Partial<Record<"navigation" | "footer", PublishedSectionGenerationContract>>;
  pages: PublishedPageGenerationContract[];
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

const defaultTemplateExclusiveComponentsPath = path.join(
  process.cwd(),
  "template-factory",
  "library",
  "template-exclusive-components.generated.json"
);

const resolveTemplateExclusiveComponentsPath = () => {
  const configured = process.env.BUILDER_TEMPLATE_EXCLUSIVE_COMPONENTS_PATH?.trim();
  if (!configured) {
    const sibling = path.join(path.dirname(resolveExternalLibraryPath()), "template-exclusive-components.generated.json");
    return fs.existsSync(sibling) ? sibling : defaultTemplateExclusiveComponentsPath;
  }
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
};

const defaultTemplateBlockCatalogPath = path.join(
  process.cwd(),
  "template-factory",
  "library",
  "template-block-catalog.generated.json"
);

const resolveTemplateBlockCatalogPath = () => {
  const configured = process.env.BUILDER_TEMPLATE_BLOCK_CATALOG_PATH?.trim();
  if (!configured) {
    const sibling = path.join(path.dirname(resolveExternalLibraryPath()), "template-block-catalog.generated.json");
    return fs.existsSync(sibling) ? sibling : defaultTemplateBlockCatalogPath;
  }
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
};

const defaultTemplateGenerationContractsPath = path.join(
  process.cwd(),
  "template-factory",
  "library",
  "template-generation-contracts.generated.json"
);

const resolveTemplateGenerationContractsPath = () => {
  const configured = process.env.BUILDER_TEMPLATE_GENERATION_CONTRACTS_PATH?.trim();
  if (!configured) {
    const sibling = path.join(path.dirname(resolveExternalLibraryPath()), "template-generation-contracts.generated.json");
    return fs.existsSync(sibling) ? sibling : defaultTemplateGenerationContractsPath;
  }
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
};

const isEditableFieldType = (value: unknown): value is EditableFieldType =>
  typeof value === "string" &&
  ["text", "image", "link", "style", "number", "boolean"].includes(value.trim().toLowerCase());

const validateEditableField = (value: unknown): EditableFieldContract | null => {
  if (!isRecord(value)) return null;
  const pathValue = typeof value.path === "string" ? value.path.trim() : "";
  const typeValue = typeof value.type === "string" ? value.type.trim().toLowerCase() : "";
  if (!pathValue || !isEditableFieldType(typeValue)) return null;
  return {
    path: pathValue,
    type: typeValue,
  };
};

const collectEditableFieldsFromDefaults = (value: unknown, prefix: string[] = []): EditableFieldContract[] => {
  if (!isRecord(value) && !Array.isArray(value)) return [];
  if (Array.isArray(value)) {
    const sample = value.find((entry) => entry && typeof entry === "object");
    if (!sample) return [];
    return collectEditableFieldsFromDefaults(sample, [...prefix, "[]"]);
  }
  const rows: EditableFieldContract[] = [];
  for (const [key, entry] of Object.entries(value)) {
    const normalized = key.trim().toLowerCase();
    if (!normalized || normalized === "id" || normalized === "__v") continue;
    if (/(^|_)(id|anchor|variant|class(name)?|style|motionpreset|maxwidth|paddingy)$/.test(normalized)) continue;
    const nextPrefix = [...prefix, key];
    if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
      const type: EditableFieldType =
        /(image|img|media).*(src|url)$/.test(normalized) || /(src|url)$/.test(normalized)
          ? "image"
          : /(href|link|path)$/.test(normalized)
            ? "link"
            : /(color|background|gradient|overlay|shadow|stroke|fill)$/.test(normalized)
              ? "style"
              : typeof entry === "number"
                ? "number"
                : typeof entry === "boolean"
                  ? "boolean"
                  : "text";
      rows.push({ path: nextPrefix.join("."), type });
      continue;
    }
    if (Array.isArray(entry)) {
      const sample = entry.find((item) => item && typeof item === "object");
      if (sample && typeof sample === "object") {
        rows.push(...collectEditableFieldsFromDefaults(sample, [...nextPrefix, "[]"]));
      } else if (entry.length && (typeof entry[0] === "string" || typeof entry[0] === "number")) {
        rows.push({
          path: [...nextPrefix, "[]"].join("."),
          type: typeof entry[0] === "number" ? "number" : "text",
        });
      }
      continue;
    }
    if (entry && typeof entry === "object") {
      rows.push(...collectEditableFieldsFromDefaults(entry, nextPrefix));
    }
  }
  const dedup = new Map<string, EditableFieldContract>();
  rows.forEach((row) => {
    const key = `${row.path}::${row.type}`;
    if (!dedup.has(key)) dedup.set(key, row);
  });
  return Array.from(dedup.values());
};

const validateTemplateExclusiveComponentContract = (value: unknown): TemplateExclusiveComponentContract | null => {
  if (!isRecord(value)) return null;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  if (!name) return null;
  const editableFields = Array.isArray(value.editableFields)
    ? value.editableFields.map((entry) => validateEditableField(entry)).filter((entry): entry is EditableFieldContract => Boolean(entry))
    : [];
  const fallbackFields =
    editableFields.length > 0
      ? editableFields
      : isRecord(value.defaultProps)
        ? collectEditableFieldsFromDefaults(value.defaultProps)
        : [];
  if (!fallbackFields.length) return null;
  return {
    name,
    editableFields: fallbackFields,
  };
};

const validatePublishedBlockCatalogEntry = (value: unknown): PublishedBlockCatalogEntry | null => {
  if (!isRecord(value)) return null;
  const blockType = typeof value.blockType === "string" ? value.blockType.trim() : "";
  const kind = normalizeSectionKindToken(value.kind);
  const sourceToken = String(value.source || "").trim().toLowerCase();
  const source = sourceToken === "page" || sourceToken === "profile" ? sourceToken : "";
  const profileId = typeof value.profileId === "string" ? value.profileId.trim() : "";
  const props = isRecord(value.props) ? value.props : null;
  if (!blockType || !kind || !source || !profileId || !props) return null;
  const editableFields = Array.isArray(value.editableFields)
    ? value.editableFields.map((entry) => validateEditableField(entry)).filter((entry): entry is EditableFieldContract => Boolean(entry))
    : [];
  const fallbackFields = editableFields.length ? editableFields : collectEditableFieldsFromDefaults(props);
  const pagePath = typeof value.pagePath === "string" ? normalizeTemplatePagePath(value.pagePath) : "";
  const pageType = normalizePageTypeToken(value.pageType) ?? (pagePath ? inferTemplatePageType(pagePath, "") : null);
  const styleFamily = typeof value.styleFamily === "string" && value.styleFamily.trim() ? value.styleFamily.trim() : "";
  const baseBlockType = typeof value.baseBlockType === "string" && value.baseBlockType.trim() ? value.baseBlockType.trim() : "";
  const sourceDomain = normalizeDomain(value.sourceDomain ?? value.source_domain);
  const qualityScore = clampScore(value.qualityScore ?? value.quality_score);
  return {
    blockType,
    kind,
    source: source as "profile" | "page",
    profileId,
    ...(styleFamily ? { styleFamily } : {}),
    ...(pagePath ? { pagePath } : {}),
    ...(pageType ? { pageType } : {}),
    props,
    editableFields: fallbackFields,
    ...(baseBlockType ? { baseBlockType } : {}),
    ...(sourceDomain ? { sourceDomain } : {}),
    ...(qualityScore !== undefined ? { qualityScore } : {}),
  };
};

const validatePublishedSectionGenerationContract = (value: unknown): PublishedSectionGenerationContract | null => {
  if (!isRecord(value)) return null;
  const kind = normalizeSectionKindToken(value.kind);
  const blockType = typeof value.blockType === "string" ? value.blockType.trim() : "";
  const sourceToken = String(value.source || "").trim().toLowerCase();
  const source = sourceToken === "page" || sourceToken === "profile" ? sourceToken : "";
  if (!kind || !blockType || !source) return null;
  const editableFields = Array.isArray(value.editableFields)
    ? value.editableFields.map((entry) => validateEditableField(entry)).filter((entry): entry is EditableFieldContract => Boolean(entry))
    : [];
  const baseBlockType = typeof value.baseBlockType === "string" && value.baseBlockType.trim() ? value.baseBlockType.trim() : "";
  const slotId = typeof value.slotId === "string" && value.slotId.trim() ? value.slotId.trim() : "";
  const role = typeof value.role === "string" && value.role.trim() ? value.role.trim() : "";
  const imageIntent = typeof value.imageIntent === "string" && value.imageIntent.trim() ? value.imageIntent.trim() : "";
  return {
    kind,
    blockType,
    source: source as "profile" | "page",
    editableFields,
    ...(baseBlockType ? { baseBlockType } : {}),
    ...(slotId ? { slotId } : {}),
    ...(role ? { role } : {}),
    ...(imageIntent ? { imageIntent } : {}),
  };
};

const validatePublishedPageGenerationContract = (value: unknown): PublishedPageGenerationContract | null => {
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
  const sections = Array.isArray(value.sections)
    ? value.sections
        .map((entry) => validatePublishedSectionGenerationContract(entry))
        .filter((entry): entry is PublishedSectionGenerationContract => Boolean(entry))
    : [];
  const requiredCategories = toRequiredCategories(value);
  if (!requiredCategories.length && !sections.length) return null;
  const pageType = normalizePageTypeToken(value.pageType ?? value.page_type) ?? inferTemplatePageType(path, name);
  return {
    path,
    name,
    ...(pageType ? { pageType } : {}),
    requiredCategories: requiredCategories.length ? requiredCategories : sections.map((entry) => entry.kind),
    sections,
  };
};

const validatePublishedProfileGenerationContract = (value: unknown): PublishedProfileGenerationContract | null => {
  if (!isRecord(value)) return null;
  const profileId = typeof value.profileId === "string" ? value.profileId.trim() : "";
  const name = typeof value.name === "string" ? value.name.trim() : "";
  if (!profileId || !name) return null;
  const pages = Array.isArray(value.pages)
    ? value.pages
        .map((entry) => validatePublishedPageGenerationContract(entry))
        .filter((entry): entry is PublishedPageGenerationContract => Boolean(entry))
    : [];
  if (!pages.length) return null;
  const sharedValue = isRecord(value.shared) ? value.shared : {};
  const navigation = validatePublishedSectionGenerationContract(sharedValue.navigation);
  const footer = validatePublishedSectionGenerationContract(sharedValue.footer);
  const keywords = Array.isArray(value.keywords)
    ? value.keywords.map((entry) => (typeof entry === "string" ? entry.trim() : "")).filter(Boolean)
    : [];
  const sourceDomain = normalizeDomain(value.sourceDomain ?? value.source_domain);
  const styleFamily =
    typeof value.styleFamily === "string" && value.styleFamily.trim()
      ? value.styleFamily.trim()
      : typeof value.style_family === "string" && value.style_family.trim()
        ? value.style_family.trim()
        : "";
  const qualityScore = clampScore(value.qualityScore ?? value.quality_score);
  return {
    profileId,
    name,
    ...(sourceDomain ? { sourceDomain } : {}),
    ...(styleFamily ? { styleFamily } : {}),
    ...(keywords.length ? { keywords } : {}),
    ...(qualityScore !== undefined ? { qualityScore } : {}),
    ...((navigation || footer)
      ? {
          shared: {
            ...(navigation ? { navigation } : {}),
            ...(footer ? { footer } : {}),
          },
        }
      : {}),
    pages,
  };
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

const loadTemplateExclusiveContractsFromLibrary = (): TemplateExclusiveComponentContract[] => {
  const filePath = resolveExternalLibraryPath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as ExternalLibraryPayload | unknown[];
    const candidates = Array.isArray(parsed)
      ? []
      : Array.isArray((parsed as ExternalLibraryPayload)?.templateExclusiveComponents)
        ? (parsed as ExternalLibraryPayload).templateExclusiveComponents ?? []
        : [];
    return candidates
      .map((entry) => validateTemplateExclusiveComponentContract(entry))
      .filter((entry): entry is TemplateExclusiveComponentContract => Boolean(entry));
  } catch {
    return [];
  }
};

const loadTemplateExclusiveContractsFromCatalog = (): TemplateExclusiveComponentContract[] => {
  const filePath = resolveTemplateExclusiveComponentsPath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as { components?: unknown[] } | unknown[];
    const candidates = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { components?: unknown[] })?.components)
        ? (parsed as { components?: unknown[] }).components ?? []
        : [];
    return candidates
      .map((entry) => validateTemplateExclusiveComponentContract(entry))
      .filter((entry): entry is TemplateExclusiveComponentContract => Boolean(entry));
  } catch {
    return [];
  }
};

const loadPublishedBlockCatalogFromLibrary = (): PublishedBlockCatalogEntry[] => {
  const filePath = resolveExternalLibraryPath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as ExternalLibraryPayload | unknown[];
    const candidates = Array.isArray(parsed)
      ? []
      : Array.isArray((parsed as ExternalLibraryPayload)?.templateBlockCatalog)
        ? (parsed as ExternalLibraryPayload).templateBlockCatalog ?? []
        : [];
    return candidates
      .map((entry) => validatePublishedBlockCatalogEntry(entry))
      .filter((entry): entry is PublishedBlockCatalogEntry => Boolean(entry));
  } catch {
    return [];
  }
};

const loadPublishedBlockCatalogFromSidecar = (): PublishedBlockCatalogEntry[] => {
  const filePath = resolveTemplateBlockCatalogPath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as { entries?: unknown[] } | unknown[];
    const candidates = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { entries?: unknown[] })?.entries)
        ? (parsed as { entries?: unknown[] }).entries ?? []
        : [];
    return candidates
      .map((entry) => validatePublishedBlockCatalogEntry(entry))
      .filter((entry): entry is PublishedBlockCatalogEntry => Boolean(entry));
  } catch {
    return [];
  }
};

const loadPublishedGenerationContractsFromLibrary = (): PublishedProfileGenerationContract[] => {
  const filePath = resolveExternalLibraryPath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as ExternalLibraryPayload | unknown[];
    const candidates = Array.isArray(parsed)
      ? []
      : Array.isArray((parsed as ExternalLibraryPayload)?.templateGenerationContracts)
        ? (parsed as ExternalLibraryPayload).templateGenerationContracts ?? []
        : [];
    return candidates
      .map((entry) => validatePublishedProfileGenerationContract(entry))
      .filter((entry): entry is PublishedProfileGenerationContract => Boolean(entry));
  } catch {
    return [];
  }
};

const loadPublishedGenerationContractsFromSidecar = (): PublishedProfileGenerationContract[] => {
  const filePath = resolveTemplateGenerationContractsPath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as { contracts?: unknown[] } | unknown[];
    const candidates = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { contracts?: unknown[] })?.contracts)
        ? (parsed as { contracts?: unknown[] }).contracts ?? []
        : [];
    return candidates
      .map((entry) => validatePublishedProfileGenerationContract(entry))
      .filter((entry): entry is PublishedProfileGenerationContract => Boolean(entry));
  } catch {
    return [];
  }
};

const dedupeTemplateExclusiveContracts = (items: TemplateExclusiveComponentContract[]) => {
  const map = new Map<string, TemplateExclusiveComponentContract>();
  items.forEach((item) => {
    const key = String(item.name || "").trim();
    if (!key) return;
    map.set(key, item);
  });
  return map;
};

const dedupePublishedBlockCatalog = (items: PublishedBlockCatalogEntry[]) => {
  const map = new Map<string, PublishedBlockCatalogEntry>();
  items.forEach((item) => {
    const key = [
      item.profileId,
      item.pagePath || "",
      item.pageType || "",
      item.kind,
      item.blockType,
      item.source,
    ].join("::");
    if (!map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
};

const dedupePublishedGenerationContracts = (items: PublishedProfileGenerationContract[]) => {
  const map = new Map<string, PublishedProfileGenerationContract>();
  for (const item of items) {
    const key = String(item.profileId || "").trim().toLowerCase();
    if (!key) continue;
    map.set(key, item);
  }
  return Array.from(map.values());
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
const styleProfileById = new Map(styleProfiles.map((profile) => [profile.id, profile]));

const templateExclusiveContractMap = dedupeTemplateExclusiveContracts([
  ...loadTemplateExclusiveContractsFromLibrary(),
  ...loadTemplateExclusiveContractsFromCatalog(),
]);
const publishedBlockCatalogEntries = dedupePublishedBlockCatalog([
  ...loadPublishedBlockCatalogFromSidecar(),
  ...loadPublishedBlockCatalogFromLibrary(),
]);
const fallbackPublishedGenerationContracts = styleProfiles.map((profile) => {
  const toSectionContract = (
    block: SectionTemplateBlock | undefined,
    kind: SectionKind,
    source: "profile" | "page"
  ): PublishedSectionGenerationContract | null => {
    if (!block?.type) return null;
    return {
      kind,
      blockType: String(block.type).trim(),
      source,
      editableFields: collectEditableFieldsFromDefaults(block.props ?? {}),
    };
  };
  const shared = {
    ...(toSectionContract(profile.templates?.navigation, "navigation", "profile")
      ? { navigation: toSectionContract(profile.templates?.navigation, "navigation", "profile")! }
      : {}),
    ...(toSectionContract(profile.templates?.footer, "footer", "profile")
      ? { footer: toSectionContract(profile.templates?.footer, "footer", "profile")! }
      : {}),
  };
  return {
    profileId: profile.id,
    name: profile.name,
    ...(profile.sourceDomain ? { sourceDomain: profile.sourceDomain } : {}),
    ...(profile.siteStyleShell?.styleFamily ? { styleFamily: profile.siteStyleShell.styleFamily } : {}),
    ...(Array.isArray(profile.keywords) ? { keywords: profile.keywords } : {}),
    ...(profile.qualityScore !== undefined ? { qualityScore: profile.qualityScore } : {}),
    ...(Object.keys(shared).length ? { shared } : {}),
    pages: (Array.isArray(profile.pageSpecs) ? profile.pageSpecs : []).map((page) => ({
      path: normalizeTemplatePagePath(page.path),
      name: page.name,
      ...(page.pageType ? { pageType: page.pageType } : {}),
      requiredCategories: Array.from(new Set(page.requiredCategories || [])),
      sections: (Array.isArray(page.sections) && page.sections.length
        ? page.sections
            .map((section) =>
              toSectionContract(section.block, section.kind, section.source === "profile" ? "profile" : "page")
            )
        : (page.requiredCategories || []).map((kind) => {
            const pageBlock = page.templates?.[kind];
            const profileBlock = profile.templates?.[kind];
            return toSectionContract(pageBlock ?? profileBlock, kind, pageBlock ? "page" : "profile");
          }))
        .filter((entry): entry is PublishedSectionGenerationContract => Boolean(entry)),
    })),
  };
});
const publishedGenerationContracts = dedupePublishedGenerationContracts([
  ...loadPublishedGenerationContractsFromSidecar(),
  ...loadPublishedGenerationContractsFromLibrary(),
  ...fallbackPublishedGenerationContracts,
]);
const publishedGenerationContractByProfileId = new Map(
  publishedGenerationContracts.map((contract) => [contract.profileId, contract])
);

const mergeEditableFieldContracts = (...lists: EditableFieldContract[][]): EditableFieldContract[] => {
  const map = new Map<string, EditableFieldContract>();
  for (const list of lists) {
    for (const field of Array.isArray(list) ? list : []) {
      if (!field?.path || map.has(field.path)) continue;
      map.set(field.path, field);
    }
  }
  return Array.from(map.values());
};

type BlockTemplateCatalogEntry = {
  kind: SectionKind;
  block: SectionTemplateBlock;
  profile: StyleProfile;
  pageSpec: PageTemplateSpec | null;
  source: "profile" | "page";
};

const buildRuntimeBlockTemplateCatalog = (profiles: StyleProfile[]) => {
  const byType = new Map<string, { entries: BlockTemplateCatalogEntry[]; editableFields: EditableFieldContract[] }>();
  const register = (entry: BlockTemplateCatalogEntry) => {
    const blockType = String(entry?.block?.type || "").trim();
    if (!blockType) return;
    const current = byType.get(blockType) ?? { entries: [], editableFields: [] };
    current.entries.push(entry);
    current.editableFields = mergeEditableFieldContracts(
      current.editableFields,
      collectEditableFieldsFromDefaults(entry.block.props)
    );
    byType.set(blockType, current);
  };

  for (const profile of profiles) {
    (Object.entries(profile.templates ?? {}) as Array<[SectionKind, SectionTemplateBlock | undefined]>).forEach(([kind, block]) => {
      if (!block) return;
      register({
        kind,
        block,
        profile,
        pageSpec: null,
        source: "profile",
      });
    });
    for (const pageSpec of Array.isArray(profile.pageSpecs) ? profile.pageSpecs : []) {
      (Object.entries(pageSpec.templates ?? {}) as Array<[SectionKind, SectionTemplateBlock | undefined]>).forEach(([kind, block]) => {
        if (!block) return;
        register({
          kind,
          block,
          profile,
          pageSpec,
          source: "page",
        });
      });
    }
  }

  return byType;
};

const buildPublishedBlockTemplateCatalog = (entries: PublishedBlockCatalogEntry[]) => {
  const byType = new Map<string, { entries: PublishedBlockCatalogEntry[]; editableFields: EditableFieldContract[] }>();
  for (const entry of entries) {
    const blockType = String(entry?.blockType || "").trim();
    if (!blockType) continue;
    const current = byType.get(blockType) ?? { entries: [], editableFields: [] };
    current.entries.push(entry);
    current.editableFields = mergeEditableFieldContracts(current.editableFields, entry.editableFields);
    byType.set(blockType, current);
  }
  return byType;
};

const publishedBlockTemplateCatalog = buildPublishedBlockTemplateCatalog(publishedBlockCatalogEntries);
const runtimeBlockTemplateCatalog = buildRuntimeBlockTemplateCatalog(styleProfiles);

const getTemplateExclusiveEditableFields = (componentName: string): EditableFieldContract[] => {
  if (!componentName) return [];
  const direct = templateExclusiveContractMap.get(componentName);
  if (direct?.editableFields?.length) return direct.editableFields;
  return [];
};

const getCatalogEditableFields = (componentName: string): EditableFieldContract[] => {
  if (!componentName) return [];
  return getCatalogEditableFieldInfo(componentName).editableFields;
};

const getCatalogEditableFieldInfo = (
  componentName: string
): { editableFields: EditableFieldContract[]; source: "published" | "runtime" | "none" } => {
  if (!componentName) return { editableFields: [], source: "none" };
  const published = publishedBlockTemplateCatalog.get(componentName)?.editableFields;
  if (published?.length) {
    return { editableFields: published, source: "published" };
  }
  const runtime = runtimeBlockTemplateCatalog.get(componentName)?.editableFields;
  if (runtime?.length) {
    return { editableFields: runtime, source: "runtime" };
  }
  return { editableFields: [], source: "none" };
};

const resolveEditableFieldContracts = (
  componentName: string,
  props: Record<string, unknown>
): EditableFieldContract[] => {
  const direct = getTemplateExclusiveEditableFields(componentName);
  const catalog = getCatalogEditableFields(componentName);
  const inferred = collectEditableFieldsFromDefaults(props);
  return mergeEditableFieldContracts(direct, catalog, inferred);
};

export const getStyleProfiles = () => styleProfiles;

// ---------------------------------------------------------------------------
// Industry taxonomy for semantic matching
// ---------------------------------------------------------------------------
const industryTaxonomy: Record<string, string[]> = {
  technology: [
    "tech",
    "saas",
    "software",
    "app",
    "platform",
    "ai",
    "cloud",
    "startup",
    "digital",
    "api",
    "devtool",
    "iot",
    "automation",
    "technology",
    "developer",
    "tooling",
    "人工智能",
    "技术",
    "软件",
    "平台",
    "开发者",
    "云",
  ],
  ecommerce: [
    "shop",
    "store",
    "ecommerce",
    "commerce",
    "retail",
    "marketplace",
    "fashion",
    "apparel",
    "clothing",
    "sneaker",
    "shoe",
    "shopping",
    "consumer",
    "d2c",
    "电商",
    "零售",
    "消费品牌",
    "商品",
    "购买",
  ],
  industrial: [
    "industrial",
    "manufacturing",
    "manufacturer",
    "factory",
    "machinery",
    "machine",
    "engineering",
    "automation",
    "cnc",
    "steel",
    "metal",
    "heavy",
    "equipment",
    "b2b",
    "industrialtech",
    "industrialtechnology",
    "precision",
    "robot",
    "inspection",
    "industrialoperations",
    "industrialmetaverse",
    "procurement",
    "工业",
    "制造",
    "制造业",
    "制造商",
    "工厂",
    "设备",
    "装备",
    "机械",
    "机床",
    "工程",
    "企业",
    "采购",
    "工业风",
    "自动化",
    "数控",
    "机器人",
    "产线",
    "生产线",
    "零部件",
    "解决方案",
    "质检",
    "检测",
  ],
  luxury: [
    "luxury",
    "premium",
    "highend",
    "bespoke",
    "exclusive",
    "couture",
    "artisan",
    "craftsmanship",
    "heritage",
    "高端",
    "奢华",
    "精品",
    "定制",
    "低调奢华",
  ],
  creative: [
    "design",
    "studio",
    "agency",
    "creative",
    "portfolio",
    "photography",
    "art",
    "gallery",
    "architect",
    "interior",
    "设计",
    "工作室",
    "创意",
    "画廊",
    "建筑",
    "室内",
    "室内设计",
  ],
  food: ["restaurant", "cafe", "food", "dining", "bakery", "coffee", "tea", "culinary", "chef", "catering", "bar"],
  health: [
    "health",
    "medical",
    "clinic",
    "wellness",
    "fitness",
    "gym",
    "yoga",
    "spa",
    "pharma",
    "dental",
    "hospital",
    "care",
    "healthcare",
    "诊所",
    "医疗",
    "健康",
    "体检",
    "康复",
    "护理",
  ],
  education: [
    "education",
    "school",
    "university",
    "course",
    "learning",
    "academy",
    "training",
    "tutorial",
    "edtech",
    "student",
    "lesson",
    "curriculum",
    "教育",
    "在线教育",
    "课程",
    "学员",
    "培训",
    "学习",
    "平台",
  ],
  finance: [
    "finance",
    "bank",
    "fintech",
    "insurance",
    "investment",
    "crypto",
    "trading",
    "payment",
    "accounting",
    "wealth",
    "capital",
    "wallet",
    "payments",
    "financial",
    "金融",
    "银行",
    "支付",
    "保险",
    "投资",
    "理财",
    "交易",
  ],
  travel: [
    "travel",
    "hospitality",
    "hotel",
    "resort",
    "booking",
    "destination",
    "tour",
    "journey",
    "stay",
    "retreat",
    "旅行",
    "旅游",
    "酒店",
    "度假",
    "预订",
    "民宿",
    "精品酒店",
  ],
  realestate: ["realestate", "property", "housing", "apartment", "home", "villa", "estate", "realtor", "construction"],
};

// Style taxonomy for visual tone matching
const styleTaxonomy: Record<string, string[]> = {
  minimal: ["minimal", "minimalist", "clean", "simple", "whitespace", "understated", "zen", "scandinavian", "nordic", "极简", "简洁", "留白"],
  bold: ["bold", "vibrant", "colorful", "energetic", "dynamic", "loud", "striking", "neon", "gradient"],
  elegant: ["elegant", "sophisticated", "refined", "classic", "timeless", "graceful", "editorial", "serif", "优雅", "典雅", "精致", "衬线"],
  modern: ["modern", "contemporary", "sleek", "futuristic", "geometric", "sharp", "glassmorphism"],
  dark: ["dark", "darkmode", "night", "moody", "cinematic", "noir", "dramatic"],
  playful: ["playful", "fun", "whimsical", "cartoon", "rounded", "friendly", "casual", "warm"],
  corporate: ["corporate", "professional", "enterprise", "business", "formal", "trustworthy", "institutional", "专业", "企业级", "可信"],
  japanese: ["japanese", "japan", "wabi", "sabi", "zen", "tatami", "matcha", "sakura", "nihon"],
};

const extractTaxonomySignals = (text: string): { industries: string[]; styles: string[] } => {
  const industries: string[] = [];
  const styles: string[] = [];
  for (const [category, tokens] of Object.entries(industryTaxonomy)) {
    if (tokens.some((t) => includesSemanticToken(text, t))) industries.push(category);
  }
  for (const [category, tokens] of Object.entries(styleTaxonomy)) {
    if (tokens.some((t) => includesSemanticToken(text, t))) styles.push(category);
  }
  return { industries, styles };
};

const computeProfileSemanticScore = (
  profile: StyleProfile,
  promptSignals: { industries: string[]; styles: string[] }
): number => {
  const profileText = `${profile.name} ${profile.keywords.join(" ")}`;
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

const PROFILE_IDENTITY_BLACKLIST = new Set([
  "desktop",
  "mobile",
  "homepage",
  "website",
  "site",
  "home",
  "page",
  "official",
  "group",
  "global",
  "tech",
  "new",
]);

const GENERIC_PROFILE_KEYWORD_BLACKLIST = new Set([
  "home",
  "homepage",
  "website",
  "site",
  "template",
  "navigation",
  "hero",
  "story",
  "about",
  "contact",
  "footer",
  "cta",
  "news",
  "events",
  "blog",
  "company",
  "official",
  "comprehensive",
  "enterprise",
  "technology",
  "tech",
  "industrial",
  "product",
  "products",
  "solution",
  "solutions",
  "service",
  "services",
  "support",
  "showcase",
  "trust",
  "proof",
  "platform",
  "digital",
  "profileselector",
]);

const collectProfileIdentityTokens = (profile: StyleProfile): string[] => {
  const tokens = new Set<string>();
  const pushToken = (value: string) => {
    const token = normalizeComparableToken(value);
    if (token.length >= 4) tokens.add(token);
  };

  for (const rawValue of [profile.id, profile.name, profile.sourceDomain || ""]) {
    const raw = String(rawValue || "").trim();
    if (!raw) continue;
    pushToken(raw);
    const parts = raw
      .toLowerCase()
      .replace(/https?:\/\//g, " ")
      .replace(/[^a-z0-9\u3400-\u9fff]+/g, " ")
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 4 && !PROFILE_IDENTITY_BLACKLIST.has(item));
    for (const part of parts) pushToken(part);
    if (parts.length > 1) pushToken(parts.join(""));
  }

  return Array.from(tokens);
};

const computeIdentityMatch = (
  profile: StyleProfile,
  normalizedPrompt: string
): { score: number; matchedChars: number } => {
  let bestScore = 0;
  let bestMatchedChars = 0;
  for (const token of collectProfileIdentityTokens(profile)) {
    if (!token || !normalizedPrompt.includes(token)) continue;
    const nextScore = token.length >= 12 ? 12 : token.length >= 8 ? 10 : 8;
    if (nextScore > bestScore || (nextScore === bestScore && token.length > bestMatchedChars)) {
      bestScore = nextScore;
      bestMatchedChars = token.length;
    }
  }
  return { score: bestScore, matchedChars: bestMatchedChars };
};

const extractExplicitReferenceTokens = (prompt: string): string[] => {
  const raw = String(prompt || "");
  if (!raw.trim()) return [];
  const matches = new Set<string>();
  const patterns = [
    /\b(?:like|inspired by|based on|similar to|reference(?:d)? from|modeled on)\s+(.+?)(?=\b(?:with|for|and|to|using|featuring|that|but|need|needs|include|includes|including|must)\b|[,.!?;:，。！？；：]|$)/gi,
    /\buse\s+(.+?)\s+as\s+(?:the\s+)?(?:(?:visual\s+style|visual\s+template|template|style|visual)\s+)?(?:reference|base)\b/gi,
    /(?:类似|像|参考|参照|对标|仿照)\s*([a-z0-9\u3400-\u9fff -]+?)(?=(?:的|风格|官网|首页|网站|页面|版本|移动端|桌面端|需要|包含|必须|整站)|[，。！？；：,.;!?]|$)/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null = pattern.exec(raw);
    while (match) {
      const value = String(match[1] || "").trim();
      if (value) matches.add(value);
      match = pattern.exec(raw);
    }
  }

  const tokens = new Set<string>();
  for (const value of matches) {
    const normalized = normalizeComparableToken(value);
    if (normalized.length >= 4) tokens.add(normalized);
    const parts = value
      .toLowerCase()
      .replace(/[^a-z0-9\u3400-\u9fff]+/g, " ")
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 4 && !PROFILE_IDENTITY_BLACKLIST.has(item));
    for (const part of parts) tokens.add(normalizeComparableToken(part));
    if (parts.length > 1) tokens.add(normalizeComparableToken(parts.join("")));
  }
  return Array.from(tokens);
};

const computeExplicitReferenceMatch = (
  profile: StyleProfile,
  prompt: string
): { score: number; matchedChars: number } => {
  const references = extractExplicitReferenceTokens(prompt);
  if (!references.length) return { score: 0, matchedChars: 0 };
  const identityTokens = collectProfileIdentityTokens(profile);

  let bestScore = 0;
  let bestMatchedChars = 0;
  for (const reference of references) {
    for (const token of identityTokens) {
      if (!reference || !token) continue;
      const isMatch =
        reference === token ||
        reference.includes(token) ||
        token.includes(reference);
      if (!isMatch) continue;
      const nextChars = Math.min(reference.length, token.length);
      const nextScore = nextChars >= 10 ? 24 : 20;
      if (nextScore > bestScore || (nextScore === bestScore && nextChars > bestMatchedChars)) {
        bestScore = nextScore;
        bestMatchedChars = nextChars;
      }
    }
  }
  return { score: bestScore, matchedChars: bestMatchedChars };
};

const inferPromptViewportPreference = (prompt: string): "desktop" | "mobile" | null => {
  const raw = String(prompt || "");
  if (!raw.trim()) return null;
  if (
    /\b(mobile(?:-first)?|mobile first|mobile version|mobile site|mobile layout|for mobile|phone layout|phone version|handheld)\b/i.test(raw) ||
    /(移动端版本|手机版|手机端|移动版|手机页面|移动页面|移动端首页|移动端网站|移动端落地页|mobile端)/i.test(raw)
  ) {
    return "mobile";
  }
  if (/\b(desktop|website|web site|web|landing page|homepage|home page)\b/i.test(raw) || /(桌面端|官网|网站|落地页|首页)/.test(raw))
    return "desktop";
  return null;
};

const computeViewportPreferenceScore = (
  profile: StyleProfile,
  promptPreference: "desktop" | "mobile" | null
): number => {
  const identity = normalizeToken(`${profile.id} ${profile.name}`);
  const isMobile = identity.includes("mobile");
  const isDesktop = identity.includes("desktop");
  if (promptPreference === "mobile") {
    if (isMobile) return 8;
    if (isDesktop) return -6;
    return 0;
  }
  if (promptPreference === "desktop") {
    if (isDesktop) return 4;
    if (isMobile) return -2;
    return 0;
  }
  if (isDesktop) return 1;
  return 0;
};

const INDUSTRIAL_INTENT_TOKENS = industryTaxonomy.industrial;
const TECHNOLOGY_INTENT_TOKENS = industryTaxonomy.technology;
const ECOMMERCE_INTENT_TOKENS = industryTaxonomy.ecommerce;
const FINANCE_INTENT_TOKENS = industryTaxonomy.finance;
const HEALTH_INTENT_TOKENS = industryTaxonomy.health;
const EDUCATION_INTENT_TOKENS = industryTaxonomy.education;
const TRAVEL_INTENT_TOKENS = industryTaxonomy.travel;
const ADDITIVE_MANUFACTURING_INTENT_TOKENS = [
  "3d printing",
  "3d-printing",
  "3d printer",
  "3d printers",
  "additive manufacturing",
  "打印",
  "3d打印",
  "增材制造",
  "打印科技",
];
const SATELLITE_CONNECTIVITY_INTENT_TOKENS = [
  "satellite",
  "connectivity",
  "satcom",
  "mobility network",
  "卫星",
  "卫星通信",
  "连接",
  "移动通信",
];
const RETRO_EDITORIAL_TECH_INTENT_TOKENS = [
  "retro-tech",
  "retro tech",
  "nostalgic",
  "nostalgia",
  "editorial tech",
  "retro hardware",
  "复古科技",
  "怀旧科技",
  "编辑感",
];
const AUDIO_HARDWARE_INTENT_TOKENS = [
  "audio hardware",
  "music hardware",
  "synth",
  "synthesizer",
  "sound device",
  "audio device",
  "premium audio",
  "音频硬件",
  "合成器",
  "音乐硬件",
];
const DESIGN_LED_ECOMMERCE_INTENT_TOKENS = [
  "design-led ecommerce",
  "lifestyle ecommerce",
  "featured products",
  "consumer lifestyle",
  "生活方式",
  "设计驱动",
  "精选产品",
];
const DEVELOPER_INTENT_TOKENS = [
  "developer",
  "developers",
  "tooling",
  "devtool",
  "devtools",
  "docs",
  "documentation",
  "sdk",
  "api",
  "cli",
  "open source",
  "opensource",
  "平台工程",
  "开发者",
  "文档",
  "工具链",
  "接口",
];
const INDUSTRIAL_PROFILE_TOKENS = [
  "industrial",
  "enterprise",
  "manufacturing",
  "manufacturer",
  "factory",
  "machinery",
  "equipment",
  "engineering",
  "automation",
  "solution",
  "solutions",
  "product",
  "products",
  "service",
  "services",
  "support",
  "procurement",
  "precision",
  "工业",
  "制造",
  "制造商",
  "设备",
  "机械",
  "工程",
  "企业",
  "采购",
  "解决方案",
  "产品",
  "服务",
  "应用行业",
];
const CONSUMER_LIFESTYLE_TOKENS = [
  "luxury",
  "editorial",
  "interior",
  "fashion",
  "beauty",
  "wellness",
  "travel",
  "hotel",
  "audio",
  "acoustic",
  "ecommerce",
  "retail",
  "consumer",
  "餐厅",
  "酒店",
  "时尚",
  "电商",
];
const TECHNOLOGY_PROFILE_TOKENS = [
  "technology",
  "tech",
  "software",
  "saas",
  "platform",
  "cloud",
  "api",
  "developer",
  "tooling",
  "data",
  "analytics",
  "automation",
  "infrastructure",
  "digital",
  "artificial intelligence",
  "ai",
  "support",
  "blog",
  "documentation",
  "技术",
  "平台",
  "软件",
  "云",
  "开发者",
  "数据",
  "人工智能",
];
const CONSUMER_HARDWARE_TOKENS = [
  "audio",
  "apparel",
  "accessories",
  "fashion",
  "clothing",
  "retail",
  "ecommerce",
  "headphone",
  "ear",
  "phone",
  "offers",
  "telescope",
  "telescopes",
  "binocular",
  "binoculars",
  "鞋",
  "服饰",
  "耳机",
  "手机",
];
const FINANCE_PROFILE_TOKENS = [
  "finance",
  "fintech",
  "payment",
  "payments",
  "bank",
  "banking",
  "insurance",
  "investment",
  "trading",
  "trust",
  "trusted",
  "secure",
  "security",
  "金融",
  "支付",
  "银行",
  "可信",
];
const ECOMMERCE_PROFILE_TOKENS = [
  "shop",
  "store",
  "retail",
  "brand",
  "offers",
  "product",
  "products",
  "accessories",
  "audio",
  "phone",
  "phones",
  "apparel",
  "clothing",
  "bike",
  "bikes",
  "speaker",
  "turntable",
  "diffuser",
  "rides",
  "shopping",
  "consumer",
  "offer",
  "offers",
  "shop",
  "购买",
  "零售",
  "电商",
  "商品",
  "品牌",
];
const ECOMMERCE_B2B_MISMATCH_TOKENS = [
  "industrial",
  "manufacturing",
  "industries",
  "partners",
  "resources",
  "solutions",
  "services",
  "engineering",
  "precision",
  "procurement",
  "enterprise",
  "工业",
  "制造",
  "合作伙伴",
  "解决方案",
  "服务",
];
const EDUCATION_PROFILE_TOKENS = [
  "learning",
  "academy",
  "course",
  "tutorial",
  "support",
  "blog",
  "guides",
  "downloads",
  "resources",
  "platform",
  "technology",
  "documentation",
  "community",
  "教育",
  "课程",
  "资源",
  "指南",
  "平台",
];
const HEALTH_PROFILE_TOKENS = [
  "health",
  "medical",
  "clinic",
  "wellness",
  "care",
  "spa",
  "premium",
  "luxury",
  "editorial",
  "story",
  "trust",
  "approach",
  "metrics",
  "proof",
  "cta",
  "healthcare",
  "医疗",
  "健康",
  "诊所",
  "护理",
];
const TRAVEL_PROFILE_TOKENS = [
  "travel",
  "hotel",
  "hospitality",
  "tour",
  "guided",
  "journey",
  "story",
  "history",
  "premium",
  "luxury",
  "editorial",
  "booking",
  "destination",
  "旅行",
  "酒店",
  "预订",
  "度假",
];
const DEVELOPER_PROFILE_TOKENS = [
  "developer",
  "developers",
  "tooling",
  "devtool",
  "platform",
  "api",
  "support",
  "blog",
  "documentation",
  "guides",
  "downloads",
  "open source",
  "opensource",
  "technical",
  "开发者",
  "文档",
  "平台",
  "工具",
];

const computeSpecializedIntentScore = (profile: StyleProfile, prompt: string): number => {
  const profileId = String(profile.id || "").toLowerCase();
  const profileToken = normalizeToken(profile.id);
  const additivePrompt = countSemanticTokenMatches(prompt, ADDITIVE_MANUFACTURING_INTENT_TOKENS) > 0;
  const satellitePrompt = countSemanticTokenMatches(prompt, SATELLITE_CONNECTIVITY_INTENT_TOKENS) > 0;
  const retroEditorialPrompt = countSemanticTokenMatches(prompt, RETRO_EDITORIAL_TECH_INTENT_TOKENS) > 0;
  const audioHardwarePrompt = countSemanticTokenMatches(prompt, AUDIO_HARDWARE_INTENT_TOKENS) > 0;
  const designLedCommercePrompt = countSemanticTokenMatches(prompt, DESIGN_LED_ECOMMERCE_INTENT_TOKENS) > 0;
  let score = 0;

  if (additivePrompt) {
    if (profileId.includes("carbon3d")) score += 18;
    else if (/(breton|fptindustrie|pamamachinetools|sandvik)/.test(profileId)) score += 4;
    else if (/(siemens|ionq|analogue|teenage|audeze)/.test(profileId)) score -= 5;
  }

  if (satellitePrompt) {
    if (profileId.includes("kymeta")) score += 18;
    else if (/(ionq|breton|sandvik|fptindustrie)/.test(profileId)) score += 3;
    else if (/(pagani|vanmoof|nothing|teenage|analogue|audeze)/.test(profileId)) score -= 5;
  }

  if (retroEditorialPrompt) {
    if (profileId.includes("analogue")) score += 16;
    else if (/(nothing[-_\s]?tech|teenage[-_\s]?engineering)/.test(profileId)) score += 4;
    else if (/(ionq|kymeta|breton|fptindustrie|siemens)/.test(profileId)) score -= 4;
  }

  if (audioHardwarePrompt) {
    if (/(teenage[-_\s]?engineering)/.test(profileId)) score += 28;
    else if (/(transpa[-_\s]?rent|nothing[-_\s]?tech|auto_audeze-home)/.test(profileId)) score += 8;
    else if (/(breton|fptindustrie|kymeta|sandvik|siemens|pamamachinetools)/.test(profileId)) score -= 10;
  }

  if (designLedCommercePrompt) {
    if (/(transpa[-_\s]?rent)/.test(profileId)) score += 22;
    else if (/(auto_audeze-home|nothing[-_\s]?tech|analogue)/.test(profileId)) score += 4;
    else if (/(breton|fptindustrie|kymeta|sandvik|siemens|pamamachinetools)/.test(profileId)) score -= 8;
  }

  // Fallback for normalized ids that lose punctuation.
  if (audioHardwarePrompt && /(teenage engineering)/.test(profileToken)) score += 8;
  if (designLedCommercePrompt && /(transpa rent|transparent)/.test(profileToken)) score += 8;
  return score;
};

const buildProfileSearchText = (profile: StyleProfile) =>
  [
    profile.id,
    profile.name,
    profile.sourceDomain || "",
    profile.keywords.join(" "),
    ...(profile.siteTemplates ?? []).flatMap((page) => [page.pageType ?? "", page.name, page.path]),
    ...(profile.pageSpecs ?? []).flatMap((page) => [page.pageType ?? "", page.name, page.path]),
  ]
    .filter(Boolean)
    .join(" ");

const computeIntentStructureScore = (
  profile: StyleProfile,
  prompt: string,
  promptSignals: { industries: string[]; styles: string[] }
): number => {
  const profileText = buildProfileSearchText(profile);
  const pageTypes = new Set(
    [...(profile.siteTemplates ?? []), ...(profile.pageSpecs ?? [])]
      .map((page) => page.pageType)
      .filter((value): value is TemplatePageType => Boolean(value))
  );

  let score = 0;
  const industrialPrompt =
    promptSignals.industries.includes("industrial") || countSemanticTokenMatches(prompt, INDUSTRIAL_INTENT_TOKENS) > 0;
  const technologyPrompt =
    promptSignals.industries.includes("technology") || countSemanticTokenMatches(prompt, TECHNOLOGY_INTENT_TOKENS) > 0;
  const financePrompt =
    promptSignals.industries.includes("finance") || countSemanticTokenMatches(prompt, FINANCE_INTENT_TOKENS) > 0;
  const ecommercePrompt =
    promptSignals.industries.includes("ecommerce") || countSemanticTokenMatches(prompt, ECOMMERCE_INTENT_TOKENS) > 0;
  const educationPrompt =
    promptSignals.industries.includes("education") || countSemanticTokenMatches(prompt, EDUCATION_INTENT_TOKENS) > 0;
  const healthPrompt =
    promptSignals.industries.includes("health") || countSemanticTokenMatches(prompt, HEALTH_INTENT_TOKENS) > 0;
  const travelPrompt =
    promptSignals.industries.includes("travel") || countSemanticTokenMatches(prompt, TRAVEL_INTENT_TOKENS) > 0;
  const developerPrompt = countSemanticTokenMatches(prompt, DEVELOPER_INTENT_TOKENS) > 0;
  const explicitMultiPagePrompt =
    /(?:about|contact|privacy|products?|solutions?|cases?|support|blog)\s*(?:page|pages|route|routes|menu|menus|nav)|(?:关于|联系|隐私|产品页|产品中心|解决方案页|案例页|支持页|博客页)/i.test(
      prompt
    ) && /(?:about|contact|privacy|products?|solutions?|cases?|support|blog|关于|联系|隐私|产品页|产品中心|解决方案页|案例页|支持页|博客页)/i.test(prompt);

  if (explicitMultiPagePrompt) {
    if (pageTypes.has("products")) score += 2;
    if (pageTypes.has("solutions")) score += 2;
    if (pageTypes.has("about")) score += 1;
    if (pageTypes.has("contact")) score += 1;
    if (pageTypes.has("blog") || pageTypes.has("support")) score += 1;
    if (pageTypes.size === 0) score -= 14;
  }

  if (industrialPrompt) {
    const industrialMatches = countSemanticTokenMatches(profileText, INDUSTRIAL_PROFILE_TOKENS);
    const consumerMatches = countSemanticTokenMatches(profileText, CONSUMER_LIFESTYLE_TOKENS);
    const consumerHardwareMatches = countSemanticTokenMatches(profileText, CONSUMER_HARDWARE_TOKENS);

    if (industrialMatches >= 6) score += 8;
    else if (industrialMatches >= 4) score += 6;
    else if (industrialMatches >= 2) score += 4;
    else if (industrialMatches >= 1) score += 2;

    if (pageTypes.has("products")) score += 2;
    if (pageTypes.has("solutions")) score += 2;
    if (pageTypes.has("support")) score += 1;
    if (pageTypes.has("contact")) score += 1;
    if (pageTypes.has("about")) score += 1;

    if (consumerMatches >= 2 && industrialMatches <= 2) score -= 4;
    else if (consumerMatches >= 1 && industrialMatches === 0) score -= 2;
    if (consumerHardwareMatches >= 3) score -= 12;
    else if (consumerHardwareMatches >= 2) score -= 10;
    else if (consumerHardwareMatches >= 1 && industrialMatches === 0) score -= 5;
  }

  if (technologyPrompt && !promptSignals.industries.includes("ecommerce")) {
    const technologyMatches = countSemanticTokenMatches(profileText, TECHNOLOGY_PROFILE_TOKENS);
    const consumerHardwareMatches = countSemanticTokenMatches(profileText, CONSUMER_HARDWARE_TOKENS);

    if (technologyMatches >= 6) score += 6;
    else if (technologyMatches >= 4) score += 4;
    else if (technologyMatches >= 2) score += 2;

    if (pageTypes.has("support")) score += 1;
    if (pageTypes.has("blog")) score += 1;
    if (pageTypes.has("products")) score += 1;
    if (pageTypes.has("contact")) score += 1;

    if (consumerHardwareMatches >= 2 && technologyMatches <= 2) score -= 4;
    else if (consumerHardwareMatches >= 1 && technologyMatches === 0) score -= 2;
  }

  if (financePrompt) {
    const financeMatches = countSemanticTokenMatches(profileText, FINANCE_PROFILE_TOKENS);
    const industrialMatches = countSemanticTokenMatches(profileText, INDUSTRIAL_PROFILE_TOKENS);
    const ecommerceMatches = countSemanticTokenMatches(profileText, ECOMMERCE_PROFILE_TOKENS);
    const consumerHardwareMatches = countSemanticTokenMatches(profileText, CONSUMER_HARDWARE_TOKENS);
    const consumerMatches = countSemanticTokenMatches(profileText, CONSUMER_LIFESTYLE_TOKENS);
    const technologyMatches = countSemanticTokenMatches(profileText, TECHNOLOGY_PROFILE_TOKENS);

    if (financeMatches >= 6) score += 7;
    else if (financeMatches >= 4) score += 5;
    else if (financeMatches >= 2) score += 3;
    else if (technologyMatches >= 4) score += 5;
    else if (technologyMatches >= 2) score += 3;
    else if (technologyPrompt) score += 1;

    if (pageTypes.has("about")) score += 1;
    if (pageTypes.has("contact")) score += 1;
    if (pageTypes.has("blog")) score += 1;
    if (pageTypes.has("support")) score += 1;
    if (technologyMatches >= 3 && pageTypes.has("products") && pageTypes.has("contact")) score += 4;
    if (technologyMatches >= 3 && (pageTypes.has("blog") || pageTypes.has("support"))) score += 2;

    if (industrialMatches >= 2 && financeMatches <= 2) score -= 10;
    if (ecommerceMatches >= 3 && financeMatches <= 2) score -= 3;
    if (consumerHardwareMatches >= 1 && financeMatches <= 2) score -= 6;
    if (consumerMatches >= 2 && financeMatches === 0 && technologyMatches <= 1) score -= 4;
    if (technologyMatches === 0 && financeMatches === 0) score -= 4;
    if (pageTypes.size === 0 && financeMatches <= 1) score -= 12;
  }

  if (ecommercePrompt) {
    const ecommerceMatches = countSemanticTokenMatches(profileText, ECOMMERCE_PROFILE_TOKENS);
    const industrialMatches = countSemanticTokenMatches(profileText, INDUSTRIAL_PROFILE_TOKENS);
    const financeMatches = countSemanticTokenMatches(profileText, FINANCE_PROFILE_TOKENS);
    const technologyMatches = countSemanticTokenMatches(profileText, TECHNOLOGY_PROFILE_TOKENS);
    const b2bMismatchMatches = countSemanticTokenMatches(profileText, ECOMMERCE_B2B_MISMATCH_TOKENS);

    if (ecommerceMatches >= 6) score += 8;
    else if (ecommerceMatches >= 4) score += 6;
    else if (ecommerceMatches >= 2) score += 4;
    else if (pageTypes.has("products")) score += 1;

    if (pageTypes.has("products")) score += 2;
    if (pageTypes.has("support")) score += 1;
    if (pageTypes.has("contact")) score += 1;
    if (pageTypes.has("about")) score += 1;

    if (industrialMatches >= 3 && ecommerceMatches <= 2) score -= 5;
    if (financeMatches >= 3 && ecommerceMatches <= 2) score -= 2;
    if (technologyMatches >= 4 && ecommerceMatches <= 2) score -= 3;
    if (b2bMismatchMatches >= 3 && ecommerceMatches <= 3) score -= 5;
  }

  if (educationPrompt) {
    const educationMatches = countSemanticTokenMatches(profileText, EDUCATION_PROFILE_TOKENS);
    const technologyMatches = countSemanticTokenMatches(profileText, TECHNOLOGY_PROFILE_TOKENS);
    const industrialMatches = countSemanticTokenMatches(profileText, INDUSTRIAL_PROFILE_TOKENS);

    if (educationMatches >= 5) score += 7;
    else if (educationMatches >= 3) score += 5;
    else if (educationMatches >= 1) score += 3;
    else if (technologyMatches >= 3) score += 2;

    if (pageTypes.has("support")) score += 2;
    if (pageTypes.has("blog")) score += 2;
    if (pageTypes.has("about")) score += 1;
    if (pageTypes.has("contact")) score += 1;
    if (pageTypes.has("support") && pageTypes.has("blog")) score += 2;

    if (industrialMatches >= 3 && educationMatches === 0) score -= 4;
  }

  if (healthPrompt) {
    const healthMatches = countSemanticTokenMatches(profileText, HEALTH_PROFILE_TOKENS);
    const luxuryMatches = countSemanticTokenMatches(profileText, industryTaxonomy.luxury);
    const industrialMatches = countSemanticTokenMatches(profileText, INDUSTRIAL_PROFILE_TOKENS);
    const technologyMatches = countSemanticTokenMatches(profileText, TECHNOLOGY_PROFILE_TOKENS);

    if (healthMatches >= 5) score += 7;
    else if (healthMatches >= 3) score += 5;
    else if (healthMatches >= 1) score += 3;
    else if (luxuryMatches >= 2) score += 4;
    if (promptSignals.industries.includes("luxury") && luxuryMatches >= 2) score += 2;
    if (promptSignals.styles.includes("elegant") && luxuryMatches >= 2) score += 1;

    if (pageTypes.has("about")) score += 1;
    if (pageTypes.has("contact")) score += 1;

    if (industrialMatches >= 2 && healthMatches === 0) score -= 6;
    if (technologyMatches >= 4 && healthMatches === 0 && luxuryMatches < 2) score -= 2;
  }

  if (travelPrompt) {
    const travelMatches = countSemanticTokenMatches(profileText, TRAVEL_PROFILE_TOKENS);
    const luxuryMatches = countSemanticTokenMatches(profileText, industryTaxonomy.luxury);
    const industrialMatches = countSemanticTokenMatches(profileText, INDUSTRIAL_PROFILE_TOKENS);
    const technologyMatches = countSemanticTokenMatches(profileText, TECHNOLOGY_PROFILE_TOKENS);

    if (travelMatches >= 5) score += 7;
    else if (travelMatches >= 3) score += 5;
    else if (travelMatches >= 1) score += 3;
    else if (luxuryMatches >= 2) score += 4;
    if (promptSignals.industries.includes("luxury") && luxuryMatches >= 2) score += 2;
    if (promptSignals.styles.includes("elegant") && luxuryMatches >= 2) score += 1;

    if (pageTypes.has("about")) score += 1;
    if (pageTypes.has("contact")) score += 1;

    if (industrialMatches >= 3 && travelMatches === 0) score -= 3;
    if (technologyMatches >= 4 && travelMatches === 0 && luxuryMatches < 2) score -= 2;
  }

  if (developerPrompt) {
    const developerMatches = countSemanticTokenMatches(profileText, DEVELOPER_PROFILE_TOKENS);
    const technologyMatches = countSemanticTokenMatches(profileText, TECHNOLOGY_PROFILE_TOKENS);
    const industrialMatches = countSemanticTokenMatches(profileText, INDUSTRIAL_PROFILE_TOKENS);
    const consumerHardwareMatches = countSemanticTokenMatches(profileText, CONSUMER_HARDWARE_TOKENS);

    if (developerMatches >= 5) score += 8;
    else if (developerMatches >= 3) score += 6;
    else if (developerMatches >= 1) score += 4;
    else if (technologyMatches >= 3) score += 2;

    if (pageTypes.has("support")) score += 2;
    if (pageTypes.has("blog")) score += 2;
    if (pageTypes.has("products")) score += 1;
    if (pageTypes.has("contact")) score += 1;
    if (pageTypes.has("support") && pageTypes.has("blog")) score += 3;

    if (industrialMatches >= 3 && developerMatches === 0) score -= 3;
    if (consumerHardwareMatches >= 2 && developerMatches <= 2) score -= 3;
  }

  return score;
};

const computeQualityBonus = (profile: StyleProfile): number => {
  const quality = clampScore(profile.qualityScore);
  if (quality === undefined) return -1;
  return Number((quality / 25).toFixed(2));
};

export const selectStyleProfile = (prompt: string): StyleProfile | null => {
  const normalizedPrompt = normalizeComparableToken(prompt);
  if (!normalizedPrompt) return null;

  const promptSignals = extractTaxonomySignals(prompt);
  const promptDomain = extractPromptDomain(prompt);
  const promptViewportPreference = inferPromptViewportPreference(prompt);

  let best: StyleProfile | null = null;
  let bestScore = 0;
  let bestMatchedChars = 0;
  let bestTemplateCount = 0;
  let bestQuality = -1;
  for (const profile of styleProfiles) {
    // --- Layer 1: exact keyword matching (original logic) ---
    let matchedChars = 0;
    const keywordScore = profile.keywords.reduce((acc, keyword) => {
      const token = normalizeComparableToken(keyword);
      if (!token || GENERIC_PROFILE_KEYWORD_BLACKLIST.has(token)) return acc;
      if (token && includesSemanticToken(prompt, keyword)) {
        matchedChars += token.length;
        return acc + 1;
      }
      return acc;
    }, 0);

    // --- Layer 2: semantic taxonomy matching ---
    const explicitReferenceMatch = computeExplicitReferenceMatch(profile, prompt);
    const identityMatch = computeIdentityMatch(profile, normalizedPrompt);
    const semanticScore = computeProfileSemanticScore(profile, promptSignals);
    const domainScore = computeDomainMatchScore(profile, promptDomain);
    const viewportScore = computeViewportPreferenceScore(profile, promptViewportPreference);
    const intentStructureScore = computeIntentStructureScore(profile, prompt, promptSignals);
    const specializedIntentScore = computeSpecializedIntentScore(profile, prompt);
    const qualityBonus = computeQualityBonus(profile);

    // Require at least one intent signal, avoid selecting only by quality.
    if (
      keywordScore <= 0 &&
      explicitReferenceMatch.score <= 0 &&
      identityMatch.score <= 0 &&
      semanticScore <= 0 &&
      domainScore <= 0 &&
      intentStructureScore <= 0 &&
      specializedIntentScore <= 0
    ) continue;

    matchedChars += explicitReferenceMatch.matchedChars + identityMatch.matchedChars;
    const score =
      keywordScore +
      explicitReferenceMatch.score +
      identityMatch.score +
      semanticScore +
      domainScore +
      viewportScore +
      intentStructureScore +
      specializedIntentScore +
      qualityBonus;
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

export const resolvePublishedPageGenerationContract = (input: {
  prompt: string;
  pagePath?: string;
  pageName?: string;
}): {
  profileId: string;
  page: PublishedPageGenerationContract;
  shared: Partial<Record<"navigation" | "footer", PublishedSectionGenerationContract>>;
} | null => {
  const profile = selectStyleProfile(input.prompt);
  if (!profile) return null;
  const contract = publishedGenerationContractByProfileId.get(profile.id);
  if (!contract) return null;
  const normalizedPagePath = normalizeTemplatePagePath(input.pagePath);
  const targetPageType = inferTemplatePageType(normalizedPagePath, input.pageName ?? "");
  const page =
    contract.pages.find((entry) => normalizeTemplatePagePath(entry.path) === normalizedPagePath) ??
    contract.pages.find((entry) => (entry.pageType ?? inferTemplatePageType(entry.path, entry.name)) === targetPageType) ??
    contract.pages[0] ??
    null;
  if (!page) return null;
  return {
    profileId: profile.id,
    page,
    shared: contract.shared ?? {},
  };
};

const getProfileStyleFamily = (profile: StyleProfile | null | undefined): string => {
  const raw = typeof profile?.siteStyleShell?.styleFamily === "string" ? profile.siteStyleShell.styleFamily : "";
  return normalizeToken(raw);
};

const findMatchingPageSpec = (
  profile: StyleProfile,
  normalizedPagePath: string,
  targetPageType: TemplatePageType
): PageTemplateSpec | null => {
  if (!Array.isArray(profile.pageSpecs) || !profile.pageSpecs.length) return null;
  return (
    profile.pageSpecs.find((entry) => normalizeTemplatePagePath(entry.path) === normalizedPagePath) ??
    profile.pageSpecs.find(
      (entry) => (entry.pageType ?? inferTemplatePageType(entry.path, entry.name)) === targetPageType
    ) ??
    null
  );
};

type ResolvedTemplateCandidate = {
  profile: StyleProfile;
  pageSpec: PageTemplateSpec | null;
  template: SectionTemplateBlock;
  layer: "page" | "section" | "block" | "style-family-page" | "style-family-section" | "style-family-block";
  catalogSource: "published" | "runtime" | "none";
};

export type ResolvedSectionTemplateAsset = {
  block: SectionTemplateBlock;
  layer: "page" | "section" | "block" | "style-family-page" | "style-family-section" | "style-family-block";
  profileId: string;
  styleFamily: string | null;
  editableFields: EditableFieldContract[];
  catalogSource: "published" | "runtime" | "none";
};

const computeBlockFallbackScore = (
  pageSpec: PageTemplateSpec | null,
  normalizedPagePath: string,
  targetPageType: TemplatePageType,
  source: "profile" | "page"
) => {
  if (source === "profile") return 50;
  if (!pageSpec) return 0;
  let score = 10;
  const pagePath = normalizeTemplatePagePath(pageSpec.path);
  const pageType = pageSpec.pageType ?? inferTemplatePageType(pageSpec.path, pageSpec.name);
  if (pagePath === normalizedPagePath) score += 1000;
  if (pageType === targetPageType) score += 500;
  if (pagePath === "/") score += 50;
  if (targetPageType !== "home" && pageType === "home") score -= 300;
  if (targetPageType !== "home" && pagePath === "/") score -= 180;
  score += Math.min(20, Object.keys(pageSpec.templates ?? {}).length);
  return score;
};

const computeKindFitBonus = (
  kind: SectionKind,
  template: { type: string; props: Record<string, unknown> }
): number => {
  const typeToken = normalizeToken(template.type);
  const keyToken = Object.keys(template.props ?? {})
    .map((key) => normalizeToken(key))
    .join(" ");
  if (kind === "products") {
    const productSignals = /(product|catalog|collection|sku|store|shop|plan|pricing|module|capability|grid|item|accordion|spec)/;
    const contactSignals = /(contact|lead|inquiry|form|consult)/;
    let score = 0;
    if (productSignals.test(typeToken)) score += 180;
    if (productSignals.test(keyToken)) score += 120;
    if (contactSignals.test(typeToken) && !productSignals.test(typeToken)) score -= 220;
    if (contactSignals.test(keyToken) && !productSignals.test(keyToken)) score -= 180;
    return score;
  }
  if (kind === "contact") {
    if (/(contact|lead|inquiry|form|consult)/.test(typeToken)) return 120;
    if (/(contact|lead|inquiry|form|consult)/.test(keyToken)) return 80;
  }
  if (kind === "cta") {
    if (/(cta|lead|capture|signup|trial|book|requestdemo)/.test(typeToken)) return 120;
    if (/(cta|lead|capture|signup|trial|book|requestdemo)/.test(keyToken)) return 80;
  }
  return 0;
};

const findBlockLevelCandidate = (input: {
  profiles: StyleProfile[];
  kind: SectionKind;
  normalizedPagePath: string;
  targetPageType: TemplatePageType;
  layer: "block" | "style-family-block";
}): ResolvedTemplateCandidate | null => {
  const allowedProfileIds = new Set(input.profiles.map((profile) => profile.id));
  if (publishedBlockCatalogEntries.length) {
    const rankedPublished: Array<ResolvedTemplateCandidate & { score: number }> = [];
    for (const entry of publishedBlockCatalogEntries) {
      if (entry.kind !== input.kind || !allowedProfileIds.has(entry.profileId)) continue;
      const profile = styleProfileById.get(entry.profileId);
      if (!profile) continue;
      const entryPagePath = entry.pagePath ? normalizeTemplatePagePath(entry.pagePath) : input.normalizedPagePath;
      const entryPageType = entry.pageType ?? inferTemplatePageType(entryPagePath, "");
      const template = {
        type: entry.blockType,
        props: cloneProps(entry.props),
      };
      const pageSpec =
        entry.source === "page"
          ? findMatchingPageSpec(profile, entryPagePath, entryPageType)
          : null;
      rankedPublished.push({
        profile,
        pageSpec,
        template,
        layer: input.layer,
        catalogSource: "published",
        score: computeBlockFallbackScore(
          pageSpec ??
            (entry.source === "page"
              ? {
                  path: entryPagePath,
                  name: "Page",
                  pageType: entryPageType,
                  requiredCategories: [input.kind],
                  templates: {},
                }
              : null),
          input.normalizedPagePath,
          input.targetPageType,
          entry.source
        ) + computeKindFitBonus(input.kind, template),
      });
    }
    rankedPublished.sort((a, b) => b.score - a.score);
    const bestPublished = rankedPublished[0];
    if (bestPublished) {
      if (input.targetPageType !== "home" && bestPublished.score < 120) return null;
      return {
        profile: bestPublished.profile,
        pageSpec: bestPublished.pageSpec,
        template: bestPublished.template,
        layer: bestPublished.layer,
        catalogSource: "published",
      };
    }
  }

  const ranked: Array<ResolvedTemplateCandidate & { score: number }> = [];
  for (const profile of input.profiles) {
    for (const pageSpec of Array.isArray(profile.pageSpecs) ? profile.pageSpecs : []) {
      const template = pageSpec.templates?.[input.kind];
      if (!template) continue;
      ranked.push({
        profile,
        pageSpec,
        template,
        layer: input.layer,
        catalogSource: "runtime",
        score: computeBlockFallbackScore(pageSpec, input.normalizedPagePath, input.targetPageType, "page"),
      });
    }
  }
  ranked.sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (!best) return null;
  if (input.targetPageType !== "home" && best.score < 120) return null;
  return {
    profile: best.profile,
    pageSpec: best.pageSpec,
    template: best.template,
    layer: best.layer,
    catalogSource: "runtime",
  };
};

const resolveTemplateCandidate = (input: {
  profile: StyleProfile;
  kind: SectionKind;
  normalizedPagePath: string;
  targetPageType: TemplatePageType;
}): ResolvedTemplateCandidate | null => {
  const basePageSpec = findMatchingPageSpec(input.profile, input.normalizedPagePath, input.targetPageType);
  const baseProfileTemplate = input.profile.templates[input.kind];
  const basePageTemplate = basePageSpec?.templates?.[input.kind];
  const allowNonHomeSectionFallback =
    input.targetPageType === "home" ||
    input.kind === "navigation" ||
    input.kind === "footer" ||
    input.kind === "cta" ||
    input.kind === "contact";

  const directCandidates: ResolvedTemplateCandidate[] =
    input.kind === "navigation" || input.kind === "footer"
      ? [
          ...(baseProfileTemplate
            ? [{
                profile: input.profile,
                pageSpec: basePageSpec,
                template: baseProfileTemplate,
                layer: "section" as const,
                catalogSource: getCatalogEditableFieldInfo(baseProfileTemplate.type).source,
              }]
            : []),
          ...(basePageTemplate
            ? [{
                profile: input.profile,
                pageSpec: basePageSpec,
                template: basePageTemplate,
                layer: "page" as const,
                catalogSource: getCatalogEditableFieldInfo(basePageTemplate.type).source,
              }]
            : []),
        ]
      : [
          ...(basePageTemplate
            ? [{
                profile: input.profile,
                pageSpec: basePageSpec,
                template: basePageTemplate,
                layer: "page" as const,
                catalogSource: getCatalogEditableFieldInfo(basePageTemplate.type).source,
              }]
            : []),
          ...(baseProfileTemplate && allowNonHomeSectionFallback
            ? [{
                profile: input.profile,
                pageSpec: basePageSpec,
                template: baseProfileTemplate,
                layer: "section" as const,
                catalogSource: getCatalogEditableFieldInfo(baseProfileTemplate.type).source,
              }]
            : []),
        ];
  if (directCandidates.length) return directCandidates[0];

  const directBlockCandidate = findBlockLevelCandidate({
    profiles: [input.profile],
    kind: input.kind,
    normalizedPagePath: input.normalizedPagePath,
    targetPageType: input.targetPageType,
    layer: "block",
  });
  if (directBlockCandidate) return directBlockCandidate;

  const styleFamily = getProfileStyleFamily(input.profile);
  if (!styleFamily) return null;
  const siblingProfiles = styleProfiles.filter(
    (profile) => profile.id !== input.profile.id && getProfileStyleFamily(profile) === styleFamily
  );
  for (const sibling of siblingProfiles) {
    const siblingPageSpec = findMatchingPageSpec(sibling, input.normalizedPagePath, input.targetPageType);
    const siblingProfileTemplate = sibling.templates[input.kind];
    const siblingPageTemplate = siblingPageSpec?.templates?.[input.kind];
    const siblingCandidates: ResolvedTemplateCandidate[] =
      input.kind === "navigation" || input.kind === "footer"
        ? [
            ...(siblingProfileTemplate
              ? [{
                  profile: sibling,
                  pageSpec: siblingPageSpec,
                  template: siblingProfileTemplate,
                  layer: "style-family-section" as const,
                  catalogSource: getCatalogEditableFieldInfo(siblingProfileTemplate.type).source,
                }]
              : []),
            ...(siblingPageTemplate
              ? [{
                  profile: sibling,
                  pageSpec: siblingPageSpec,
                  template: siblingPageTemplate,
                  layer: "style-family-page" as const,
                  catalogSource: getCatalogEditableFieldInfo(siblingPageTemplate.type).source,
                }]
              : []),
          ]
        : [
            ...(siblingPageTemplate
              ? [{
                  profile: sibling,
                  pageSpec: siblingPageSpec,
                  template: siblingPageTemplate,
                  layer: "style-family-page" as const,
                  catalogSource: getCatalogEditableFieldInfo(siblingPageTemplate.type).source,
                }]
              : []),
            ...(siblingProfileTemplate && allowNonHomeSectionFallback
              ? [{
                  profile: sibling,
                  pageSpec: siblingPageSpec,
                  template: siblingProfileTemplate,
                  layer: "style-family-section" as const,
                  catalogSource: getCatalogEditableFieldInfo(siblingProfileTemplate.type).source,
                }]
              : []),
          ];
    if (siblingCandidates.length) return siblingCandidates[0];
  }
  const siblingBlockCandidate = findBlockLevelCandidate({
    profiles: siblingProfiles,
    kind: input.kind,
    normalizedPagePath: input.normalizedPagePath,
    targetPageType: input.targetPageType,
    layer: "style-family-block",
  });
  if (siblingBlockCandidate) return siblingBlockCandidate;
  return null;
};

// ---------------------------------------------------------------------------
// Template personalization context — carries architect blueprint signals
// ---------------------------------------------------------------------------
export type TemplatePersonalizationContext = {
  /** The raw user prompt */
  prompt: string;
  profileId?: string;
  profileDomain?: string;
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
  // Try Chinese pattern: 为X生成/制作/创建官网
  const chinese = prompt.match(/为\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s-]{1,30})\s*(?:生成|制作|创建|构建|设计)/i);
  if (chinese) return chinese[1].trim();
  // Try English pattern: for X generate/build/create
  const english = prompt.match(/for\s+([A-Za-z][A-Za-z0-9\s-]{1,40})\s+(?:generate|build|create|design)/i);
  if (english) return english[1].trim();
  // Try "叫/called/named X" pattern
  const named = prompt.match(/(?:叫|called|named|品牌名?(?:为|是)?)\s*[：:]?\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s]{0,30})/i);
  if (named) return named[1].trim();
  return null;
};

const pickHintText = (hints: Record<string, unknown> | undefined, keys: string[]): string | null => {
  if (!hints) return null;
  for (const key of keys) {
    const value = hints[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
};

const sanitizeSourceBrandToken = (value: string): string => value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");

const sourceBrandStopwords = new Set([
  "www",
  "com",
  "net",
  "org",
  "io",
  "cn",
  "home",
  "page",
  "profile",
  "selector",
  "template",
  "default",
  "primary",
  "alt",
  "pen",
]);

const inferSourceBrandTokens = (
  ctx: TemplatePersonalizationContext,
  _props: Record<string, unknown>
): string[] => {
  const candidates = new Set<string>();
  const fromDomain = String(ctx.profileDomain || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/.:-]/)
    .map((token) => sanitizeSourceBrandToken(token))
    .filter(Boolean);
  fromDomain.forEach((token) => candidates.add(token));
  const fromProfileId = String(ctx.profileId || "")
    .toLowerCase()
    .split(/[-_:/]/)
    .map((token) => sanitizeSourceBrandToken(token))
    .filter(Boolean);
  fromProfileId.forEach((token) => candidates.add(token));
  return Array.from(candidates).filter((token) => !sourceBrandStopwords.has(token));
};

const replaceSourceBrandTokens = (value: string, sourceTokens: string[], brandName: string): string => {
  if (!value.trim() || !sourceTokens.length || !brandName.trim()) return value;
  let next = value;
  sourceTokens.forEach((token) => {
    if (!token) return;
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    next = next.replace(new RegExp(`\\b${escaped}\\b`, "gi"), brandName);
  });
  return next;
};

const hashSeed = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % 997;
};

const semanticImageGallery: Record<string, string[]> = {
  industrial: [
    "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
  ],
  technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
  ],
  space: [
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1600&q=80",
  ],
  product: [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1600&q=80",
  ],
  team: [
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=80",
  ],
  neutral: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80",
  ],
};

const isDynamicUnsplashUrl = (value: string) => /^https?:\/\/source\.unsplash\.com\//i.test(value.trim());

const inferGalleryBucket = (query: string) => {
  const token = query.toLowerCase();
  if (/(space|astronomy|telescope|nebula|planet|galaxy|cosmos|stargazing)/.test(token)) return "space";
  if (/(factory|industrial|robot|manufactur|inspection|automation|warehouse|plant)/.test(token)) return "industrial";
  if (/(product|device|hardware|equipment|headphone|sensor|camera|binocular|telescope)/.test(token)) return "product";
  if (/(team|office|meeting|collaboration|consulting|service)/.test(token)) return "team";
  if (/(ai|technology|software|digital|platform|chip|data|cloud|visual)/.test(token)) return "technology";
  return "neutral";
};

const buildSemanticImageUrl = (query: string, seedKey: string) => {
  const seed = hashSeed(seedKey);
  const normalizedQuery = query
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  if (!normalizedQuery) return "";
  const bucket = inferGalleryBucket(normalizedQuery);
  const choices = semanticImageGallery[bucket] ?? semanticImageGallery.neutral;
  if (!choices.length) return "";
  return choices[seed % choices.length];
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

const isGenericPlaceholderText = (value: unknown): boolean => {
  const text = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!text) return true;
  if (text.length <= 3) return true;
  return (
    /^(welcome|hero|headline|title|subtitle|description|about|our story|section|content|placeholder)$/.test(text) ||
    /^(welcome to |discover |explore |learn more)/.test(text)
  );
};

const isGenericSectionIntent = (value: unknown): boolean => {
  const text = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!text) return true;
  return (
    /^(story|approach|socialproof|products?|cta|contact|hero|navigation|footer)\s*section$/.test(text) ||
    /^(section|content|generic)$/.test(text)
  );
};

const sanitizeSectionIntent = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (!text || isGenericSectionIntent(text)) return "";
  if (text.length > 90) return "";
  if (/https?:\/\//i.test(text)) return "";
  if (/profile_selector|template[_-]?first|run-template-factory|不要照搬|仅生成/i.test(text)) return "";
  return text;
};

const hasInstructionNoise = (value: unknown): boolean => {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return false;
  if (text.length > 180) return true;
  return /profile_selector|template[_-]?first|run-template-factory|仅生成|不要照搬|导航与\s*footer|保留可编辑|https?:\/\//i.test(
    text
  );
};

const stripInstructionNoise = (value: string): string => {
  const text = String(value || "");
  if (!text) return "";
  return text
    .replace(/profile_selector[_\w-]*/gi, "")
    .replace(/template[_-]?first/gi, "")
    .replace(/run-template-factory/gi, "")
    .replace(/template\s*selector\s*token[:：]?\s*[\w-]+/gi, "")
    .replace(/\bform\s*builder\b/gi, "")
    .replace(/仅生成|不要照搬|保留可编辑|导航与\s*footer/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const stripCjkForEnglishCopy = (value: string, brandName: string): string => {
  const text = String(value || "");
  if (!text || !/[\u4e00-\u9fff]/.test(text)) return text;
  const marker = "__BRAND_MARKER__";
  let next = text;
  if (brandName && /[\u4e00-\u9fff]/.test(brandName)) {
    next = next.split(brandName).join(marker);
  }
  next = next.replace(/[\u4e00-\u9fff]+/g, " ").replace(/\s{2,}/g, " ").trim();
  if (next.includes(marker)) {
    next = next.split(marker).join(brandName);
  }
  return next.trim();
};

type SemanticReplacement = { pattern: RegExp; value: string };

const buildSemanticReplacements = (prompt: string, northStar: Record<string, unknown>): SemanticReplacement[] => {
  const raw = `${String(prompt || "")} ${String(northStar.industry || "")} ${JSON.stringify(northStar.coreProducts || [])}`.toLowerCase();
  const astronomyIntent = /(astronomy|astronomical|telescope|stargazing|space|nebula|planet|galaxy|cosmos)/i.test(raw);
  if (astronomyIntent) return [];
  const cncIntent =
    /(cnc|machine tool|machine-tools|machining|metal cutting|milling|lathe|spindle|five-axis|5-axis|加工中心|机床|数控|刀具|切削)/i.test(
      raw
    );
  if (cncIntent) {
    return [
      { pattern: /\bsmart telescopes?\b/gi, value: "CNC machine platforms" },
      { pattern: /\btelescopes?\b/gi, value: "machine tools" },
      { pattern: /\bsmart binoculars?\b/gi, value: "automation modules" },
      { pattern: /\bbinoculars?\b/gi, value: "automation modules" },
      { pattern: /\bstargazing\b/gi, value: "precision machining" },
      { pattern: /\bnight sky\b/gi, value: "machining environments" },
      { pattern: /\buniverse\b/gi, value: "shop-floor operations" },
      { pattern: /\bastronom(?:y|er|ers)\b/gi, value: "manufacturing teams" },
      { pattern: /\bspace\b/gi, value: "manufacturing operations" },
      { pattern: /\bai vision\b/gi, value: "CNC automation" },
      { pattern: /\bmachine vision\b/gi, value: "process automation" },
      { pattern: /\bcomputer vision\b/gi, value: "process control" },
      { pattern: /\binspection systems?\b/gi, value: "machine platforms" },
      { pattern: /\bedge vision modules?\b/gi, value: "automation modules" },
    ];
  }
  const industrialIntent = /(industrial|inspection|factory|manufactur|automation|machine|hardware|ai vision|vision ai|computer vision|智能硬件|工业检测|ai视觉)/i.test(
    raw
  );
  if (industrialIntent) {
    return [
      { pattern: /\bsmart telescopes?\b/gi, value: "AI vision systems" },
      { pattern: /\btelescopes?\b/gi, value: "inspection systems" },
      { pattern: /\bsmart binoculars?\b/gi, value: "edge vision modules" },
      { pattern: /\bbinoculars?\b/gi, value: "vision modules" },
      { pattern: /\bstargazing\b/gi, value: "industrial monitoring" },
      { pattern: /\bnight sky\b/gi, value: "production lines" },
      { pattern: /\buniverse\b/gi, value: "the operation environment" },
      { pattern: /\bastronom(?:y|er|ers)\b/gi, value: "operations teams" },
      { pattern: /\bspace\b/gi, value: "industrial operations" },
    ];
  }
  return [
    { pattern: /\bsmart telescopes?\b/gi, value: "intelligent platforms" },
    { pattern: /\btelescopes?\b/gi, value: "platforms" },
    { pattern: /\bbinoculars?\b/gi, value: "modules" },
    { pattern: /\bstargazing\b/gi, value: "real-world operations" },
    { pattern: /\buniverse\b/gi, value: "your business environment" },
    { pattern: /\bastronom(?:y|er|ers)\b/gi, value: "professional teams" },
  ];
};

const applySemanticReplacements = (value: string, replacements: SemanticReplacement[]): string => {
  if (!value || !replacements.length) return value;
  let next = value;
  replacements.forEach((item) => {
    next = next.replace(item.pattern, item.value);
  });
  return next.replace(/\s{2,}/g, " ").trim();
};

const shouldSkipResidualTextRewrite = (key: string): boolean => {
  const token = String(key || "").toLowerCase();
  if (!token) return true;
  if (keepLiteralString(token)) return true;
  return /(href|src|url|path|class|variant|align|mode|font|weight|style|token|id$|anchor|icon|size|padding|margin|radius|shadow|color|opacity|zindex|width|height)/.test(
    token
  );
};

const sanitizeResidualTextProps = (
  props: Record<string, unknown>,
  ctx: TemplatePersonalizationContext,
  brandName: string,
  northStar: Record<string, unknown>
) => {
  const forceEnglishCopy = !shouldUseChineseContent(ctx.prompt || "");
  const sourceTokens = inferSourceBrandTokens(ctx, props);
  const semanticReplacements = buildSemanticReplacements(ctx.prompt || "", northStar);
  const walk = (value: unknown, keyPath: string[]): unknown => {
    if (typeof value === "string") {
      const key = String(keyPath[keyPath.length - 1] || "").toLowerCase();
      if (shouldSkipResidualTextRewrite(key)) return value;
      let next = replaceSourceBrandTokens(value, sourceTokens, brandName);
      next = stripInstructionNoise(next);
      next = applySemanticReplacements(next, semanticReplacements);
      if (forceEnglishCopy) {
        next = stripCjkForEnglishCopy(next, brandName);
      }
      if (hasInstructionNoise(next)) return "";
      return next || value;
    }
    if (Array.isArray(value)) return value.map((entry, index) => walk(entry, [...keyPath, String(index)]));
    if (!isRecord(value)) return value;
    const next: Record<string, unknown> = {};
    Object.entries(value).forEach(([childKey, childValue]) => {
      next[childKey] = walk(childValue, [...keyPath, childKey]);
    });
    return next;
  };
  Object.entries(props).forEach(([key, value]) => {
    props[key] = walk(value, [key]);
  });
};

const shouldUseChineseContent = (prompt: string) => {
  const raw = String(prompt || "");
  const explicitChinese = /(中文|简体|繁體|繁体|chinese|mandarin|zh-cn|zh-hans|zh-hant)/i.test(raw);
  const explicitEnglish = /(英文|english|en-us|en-gb|\benglish\b)/i.test(raw);
  return explicitChinese && !explicitEnglish;
};

const buildSectionFallbackText = (
  kind: SectionKind,
  ctx: TemplatePersonalizationContext,
  brandName: string,
  northStar: Record<string, unknown>
) => {
  const industry =
    typeof northStar.industry === "string" && northStar.industry.trim() ? northStar.industry.trim() : "industry";
  const isZh = shouldUseChineseContent(ctx.prompt || "");
  if (isZh) {
    if (kind === "story") {
      return {
        title: `${brandName} 技术能力与应用场景`,
        subtitle: `围绕${industry}场景，构建可落地、可持续优化的智能化能力。`,
      };
    }
    if (kind === "socialproof") {
      return {
        title: "客户案例与品牌背书",
        subtitle: `来自${industry}一线客户与合作伙伴的真实验证。`,
      };
    }
    if (kind === "approach") {
      return {
        title: "方案优势与实施路径",
        subtitle: "以结构化方法推进从试点到规模化部署。",
      };
    }
    if (kind === "products") {
      return {
        title: "核心产品矩阵",
        subtitle: `面向${industry}场景的模块化产品与能力组合。`,
      };
    }
    if (kind === "cta" || kind === "contact") {
      return {
        title: "立即开始业务咨询",
        subtitle: "提交需求，我们将在一个工作日内与您联系。",
      };
    }
  }
  if (kind === "story") {
    return {
      title: `${brandName} Technology Story`,
      subtitle: `Built for ${industry} teams with production-ready reliability.`,
    };
  }
  if (kind === "socialproof") {
    return {
      title: "Customer Proof & Partnerships",
      subtitle: `Trusted by leading teams across ${industry}.`,
    };
  }
  if (kind === "approach") {
    return {
      title: "Implementation Approach",
      subtitle: "From pilot to scale with measurable outcomes.",
    };
  }
  if (kind === "products") {
    return {
      title: "Core Product Portfolio",
      subtitle: `Modular capabilities tailored for ${industry} use cases.`,
    };
  }
  if (kind === "cta" || kind === "contact") {
    return {
      title: "Talk to Our Team",
      subtitle: "Share your requirements and get a tailored plan.",
    };
  }
  return {
    title: brandName,
    subtitle: "",
  };
};

type ProductCopyHint = { title: string; desc: string; tag: string; cta: string; image: string };

const normalizeProductHints = (
  hints: Record<string, unknown>,
  northStar: Record<string, unknown>,
  brandName: string
): ProductCopyHint[] => {
  const fromProducts = Array.isArray(hints.products) ? (hints.products as Array<Record<string, unknown>>) : [];
  const fromItems = Array.isArray(hints.items) ? (hints.items as Array<Record<string, unknown>>) : [];
  const source = fromProducts.length ? fromProducts : fromItems;
  const mapped = source
    .map((item, index) => {
      const title =
        (typeof item?.name === "string" && item.name.trim()) ||
        (typeof item?.title === "string" && item.title.trim()) ||
        `${brandName} Product ${index + 1}`;
      const desc =
        (typeof item?.tagline === "string" && item.tagline.trim()) ||
        (typeof item?.description === "string" && item.description.trim()) ||
        (typeof item?.desc === "string" && item.desc.trim()) ||
        "";
      const tag = typeof item?.tag === "string" && item.tag.trim() ? item.tag.trim() : "";
      const cta =
        (typeof item?.cta === "string" && item.cta.trim()) ||
        (typeof item?.button === "string" && item.button.trim()) ||
        "Learn More";
      const image = typeof item?.image === "string" && item.image.trim() ? item.image.trim() : "";
      return {
        title: String(title).slice(0, 72),
        desc: String(desc).slice(0, 220),
        tag: String(tag).slice(0, 48),
        cta: String(cta).slice(0, 40),
        image: String(image).slice(0, 260),
      };
    })
    .filter((entry) => entry.title);
  if (mapped.length) return mapped.slice(0, 8);
  const coreProducts = Array.isArray(northStar.coreProducts) ? northStar.coreProducts : [];
  return coreProducts
    .map((entry, index) => {
      const title = typeof entry === "string" && entry.trim() ? entry.trim() : `${brandName} Product ${index + 1}`;
      return { title: title.slice(0, 72), desc: "", tag: "", cta: "Learn More", image: "" };
    })
    .slice(0, 8);
};

const extractIndexFromKey = (key: string): number => {
  const matched = key.match(/(\d{1,2})/);
  if (!matched) return 0;
  const parsed = Number(matched[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed - 1;
};

const looksLikeImageField = (key: string) =>
  /(image|img|media).*(src|url)$/.test(key) || /(src|url)$/.test(key) || /(image|img)$/.test(key);

const keepLiteralString = (key: string) =>
  /(^|_)(id|anchor|variant|padding|maxwidth|headingfont|bodyfont|motionpreset|class|style|layout|href|url)$/.test(key);

const buildImageQuery = (
  kind: SectionKind,
  hints: Record<string, unknown>,
  northStar: Record<string, unknown>,
  card: ProductCopyHint | undefined,
  brandName: string
) => {
  const industry = typeof northStar.industry === "string" && northStar.industry.trim() ? northStar.industry.trim() : "";
  const mood = pickHintText(hints, ["imageStyle", "imageMood"]) || (typeof northStar.imageMood === "string" ? northStar.imageMood : "");
  const cardTitle = card?.title ? card.title : "";
  const pieces = [brandName, industry, cardTitle, mood, kind === "hero" ? "hero background" : "product photography"]
    .map((entry) => String(entry || "").replace(/[^\w\u4e00-\u9fff\s-]+/g, " ").trim())
    .filter(Boolean);
  return pieces.join(", ");
};

const parseEditablePathTokens = (value: string): string[] =>
  String(value || "")
    .split(".")
    .map((entry) => entry.trim())
    .filter(Boolean);

const updateValueByEditablePath = (
  root: Record<string, unknown>,
  pathTokens: string[],
  updater: (current: unknown, key: string) => unknown
) => {
  const walk = (node: unknown, index: number): void => {
    if (!node || (typeof node !== "object" && !Array.isArray(node))) return;
    if (index >= pathTokens.length) return;
    const token = pathTokens[index];
    if (token === "[]") {
      if (!Array.isArray(node)) return;
      node.forEach((item) => walk(item, index + 1));
      return;
    }
    const isLeaf = index === pathTokens.length - 1;
    const record = node as Record<string, unknown>;
    if (isLeaf) {
      record[token] = updater(record[token], token);
      return;
    }
    if (!(token in record) || record[token] === undefined || record[token] === null) {
      const nextToken = pathTokens[index + 1];
      record[token] = nextToken === "[]" ? [] : {};
    }
    walk(record[token], index + 1);
  };
  walk(root, 0);
};

const applyEditableFieldContract = (
  props: Record<string, unknown>,
  editableFields: EditableFieldContract[],
  input: {
    kind: SectionKind;
    ctx: TemplatePersonalizationContext;
    brandName: string;
    hints: Record<string, unknown>;
    northStar: Record<string, unknown>;
    sectionFallback: { title: string; subtitle: string };
    cleanIntent: string;
  }
) => {
  if (!editableFields.length) return;
  const { kind, ctx, brandName, hints, northStar, sectionFallback, cleanIntent } = input;
  const forceEnglishCopy = !shouldUseChineseContent(ctx.prompt || "");
  const semanticReplacements = buildSemanticReplacements(ctx.prompt || "", northStar);
  const sourceTokens = inferSourceBrandTokens(ctx, props);
  const heroTitle =
    pickHintText(hints, ["headline", "title", "heroTitle", "h1"]) ||
    cleanIntent ||
    sectionFallback.title;
  const heroSubtitle =
    pickHintText(hints, ["subheadline", "subtitle", "description", "body"]) || sectionFallback.subtitle;
  const heroEyebrow =
    pickHintText(hints, ["eyebrow", "tagline"]) ||
    (typeof northStar.industry === "string" && northStar.industry.trim() ? northStar.industry.trim() : brandName);
  const primaryCta = pickHintText(hints, ["ctaPrimary", "ctaLabel", "primaryCtaLabel", "buttonLabel"]) || "Get Started";
  const secondaryCta = pickHintText(hints, ["ctaSecondary", "secondaryCtaLabel"]) || "Learn More";
  const productHints = normalizeProductHints(hints, northStar, brandName);

  editableFields.forEach((field) => {
    const pathTokens = parseEditablePathTokens(field.path);
    if (!pathTokens.length) return;
    const pathKey = pathTokens.join(".");
    const keyToken = pathTokens[pathTokens.length - 1].toLowerCase();
    updateValueByEditablePath(props, pathTokens, (current) => {
      if (field.type === "image") {
        const currentUrl = typeof current === "string" ? current.trim() : "";
        if (currentUrl.startsWith("/generated-pen-assets/")) return currentUrl;
        const idx = extractIndexFromKey(pathKey);
        const product = productHints[idx] ?? productHints[0];
        const hintedImage = product?.image ?? "";
        if (/^https?:\/\//i.test(hintedImage)) return hintedImage;
        if (/^https?:\/\//i.test(currentUrl) && !isDynamicUnsplashUrl(currentUrl)) return currentUrl;
        const query = buildImageQuery(kind, hints, northStar, product, brandName);
        return buildSemanticImageUrl(query, `${ctx.sectionId}:${pathKey}:${idx}`) || currentUrl;
      }
      if (field.type === "link") {
        const href = typeof current === "string" ? current.trim() : "";
        if (!href || href === "#") return "/";
        if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
        return href.startsWith("/") ? href : `/${href.replace(/^\/+/, "")}`;
      }
      if (field.type === "style" || field.type === "boolean" || field.type === "number") return current;

      const currentText = typeof current === "string" ? current : "";
      let rewritten = replaceSourceBrandTokens(currentText, sourceTokens, brandName);
      if (kind === "hero") {
        if (/(h1text|herotitle|titletext|headline|^title$)/.test(keyToken)) rewritten = heroTitle;
        else if (/(h1desc|subtitle|subheadline|bodytext|desctext|^body$|^description$)/.test(keyToken))
          rewritten = heroSubtitle;
        else if (/(tagtext|eyebrow|overline)/.test(keyToken)) rewritten = heroEyebrow;
        else if (/(learn|primary).*(txt|label|text)|cta(primary)?text|btnlabel/.test(keyToken)) rewritten = primaryCta;
        else if (/(order|secondary).*(txt|label|text)/.test(keyToken)) rewritten = secondaryCta;
      } else if (kind === "products") {
        const idx = extractIndexFromKey(pathKey);
        const product = productHints[idx] ?? productHints[0];
        if (product) {
          if (/(prodtitle|cardtitle|itemtitle|titletext|^title$)/.test(keyToken)) rewritten = product.title;
          else if (/(proddesc|carddesc|itemdesc|description|bodytext|^subtitle$)/.test(keyToken))
            rewritten = product.desc || sectionFallback.subtitle;
          else if (/(prodtag|cardtag|tagtext|eyebrow)/.test(keyToken)) rewritten = product.tag || brandName;
          else if (/(btnlabel|ctalabel|buttontext|btntext)/.test(keyToken)) rewritten = product.cta || primaryCta;
        }
      } else if (kind === "cta" || kind === "contact") {
        if (/(titletext|headline|^title$)/.test(keyToken)) rewritten = cleanIntent || sectionFallback.title;
        else if (/(subtitle|subheadline|desctext|body|description|note|meta|copy)/.test(keyToken))
          rewritten = pickHintText(hints, ["subheadline", "subtitle", "description"]) || sectionFallback.subtitle;
        else if (/(btnlabel|ctalabel|buttontext|btntext|ctatext)/.test(keyToken)) rewritten = primaryCta;
      } else if (kind === "story" || kind === "approach" || kind === "socialproof") {
        if (/(titletext|headline|^title$|tagtext|eyebrow|overline)/.test(keyToken)) rewritten = cleanIntent || sectionFallback.title;
        else if (/(subtitle|subheadline|desctext|body|description|copy|meta)/.test(keyToken))
          rewritten = pickHintText(hints, ["body", "description", "subtitle", "subheadline"]) || sectionFallback.subtitle;
      } else if (kind === "navigation" || kind === "footer") {
        if (/(logo|brand|legal|copy|copyright)/.test(keyToken)) {
          rewritten =
            kind === "footer" && /(legal|copy|copyright)/.test(keyToken)
              ? `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`
              : brandName;
        }
      }
      rewritten = stripInstructionNoise(rewritten);
      rewritten = applySemanticReplacements(rewritten, semanticReplacements);
      if (forceEnglishCopy) {
        rewritten = stripCjkForEnglishCopy(rewritten, brandName);
      }
      if (hasInstructionNoise(rewritten)) {
        rewritten = /(title|headline|name|label)/.test(keyToken) ? sectionFallback.title : sectionFallback.subtitle;
      }
      if (!rewritten && (/(title|headline|name|label)/.test(keyToken) || !currentText)) {
        rewritten = cleanIntent || sectionFallback.title || brandName;
      }
      return rewritten || currentText;
    });
  });
};

const rewriteTemplateSpecificProps = (
  props: Record<string, unknown>,
  kind: SectionKind,
  ctx: TemplatePersonalizationContext,
  brandName: string,
  hints: Record<string, unknown>,
  northStar: Record<string, unknown>
) => {
  const sourceTokens = inferSourceBrandTokens(ctx, props);
  const cleanIntent = sanitizeSectionIntent(ctx.sectionIntent);
  const sectionFallback = buildSectionFallbackText(kind, ctx, brandName, northStar);
  const forceEnglishCopy = !shouldUseChineseContent(ctx.prompt || "");
  const semanticReplacements = buildSemanticReplacements(ctx.prompt || "", northStar);
  const heroTitle =
    pickHintText(hints, ["headline", "title", "heroTitle", "h1"]) ||
    cleanIntent;
  const heroSubtitle = pickHintText(hints, ["subheadline", "subtitle", "description", "body"]) || "";
  const heroEyebrow =
    pickHintText(hints, ["eyebrow", "tagline"]) ||
    (typeof northStar.industry === "string" && northStar.industry.trim() ? northStar.industry.trim() : brandName);
  const primaryCta = pickHintText(hints, ["ctaPrimary", "ctaLabel", "primaryCtaLabel", "buttonLabel"]) || "Get Started";
  const secondaryCta = pickHintText(hints, ["ctaSecondary", "secondaryCtaLabel"]) || "Learn More";
  const storyTitle = pickHintText(hints, ["title", "headline"]) || cleanIntent || sectionFallback.title;
  const storyBody =
    pickHintText(hints, ["body", "description", "subheadline", "subtitle"]) ||
    cleanIntent ||
    sectionFallback.subtitle;
  const productHints = normalizeProductHints(hints, northStar, brandName);
  const ctaTitle = pickHintText(hints, ["headline", "title"]) || cleanIntent || sectionFallback.title;
  const ctaSub = pickHintText(hints, ["subheadline", "subtitle", "description"]) || "";

  if (kind === "navigation") {
    const navBrand = brandName.toUpperCase();
    props.logotext = navBrand;
    props.logoText = brandName;
    props.brandtext = navBrand;
  }
  if (kind === "hero") {
    if (heroTitle && (typeof props.h1text !== "string" || !props.h1text.trim())) props.h1text = heroTitle;
    if (heroSubtitle && (typeof props.h1desctext !== "string" || !props.h1desctext.trim())) props.h1desctext = heroSubtitle;
    if (heroEyebrow && (typeof props.h1tagtext !== "string" || !props.h1tagtext.trim())) props.h1tagtext = heroEyebrow;
  }
  if (kind === "footer") {
    const footerBrand = brandName.toUpperCase();
    props.ftlogotext = footerBrand;
    props.footerBrandtext = footerBrand;
    props.brandtext = footerBrand;
    props.copytext = `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;
  }
  const rewriteString = (current: string, key: string, pathKey: string): string => {
    if (keepLiteralString(key)) return current;
    let rewritten = replaceSourceBrandTokens(current, sourceTokens, brandName);

    if (kind === "hero") {
      if (/(h1text|herotitle|titletext|headline|^title$)/.test(key) && heroTitle) rewritten = heroTitle;
      else if (/(h1desc|subtitle|subheadline|bodytext|desctext|^body$|^description$)/.test(key) && heroSubtitle)
        rewritten = heroSubtitle;
      else if (/(tagtext|eyebrow|overline)/.test(key) && heroEyebrow) rewritten = heroEyebrow;
      else if (/(learn|primary).*(txt|label|text)|cta(primary)?text|btnlabel/.test(key)) rewritten = primaryCta;
      else if (/(order|secondary).*(txt|label|text)/.test(key)) rewritten = secondaryCta;
    } else if (kind === "story") {
      if (/(titletext|headline|^title$)/.test(key) && storyTitle) rewritten = storyTitle;
      else if (/(body|desc|copy|meta|subtitle|subheadline)/.test(key) && storyBody) rewritten = storyBody;
      else if (/(tagtext|eyebrow|overline|metacopy)/.test(key)) rewritten = storyTitle || sectionFallback.title;
    } else if (kind === "products") {
      const idx = extractIndexFromKey(key);
      const product = productHints[idx] ?? productHints[0];
      if (product) {
        if (/(prodtitle|cardtitle|itemtitle|titletext)/.test(key)) rewritten = product.title;
        else if (/(proddesc|carddesc|itemdesc|description|bodytext)/.test(key) && product.desc) rewritten = product.desc;
        else if (/(prodtag|cardtag|tagtext|eyebrow)/.test(key) && product.tag) rewritten = product.tag;
        else if (/(btnlabel|ctalabel|buttontext|btntext)/.test(key)) rewritten = product.cta;
      }
    } else if (kind === "cta" || kind === "contact") {
      if (/(titletext|headline|^title$)/.test(key) && ctaTitle) rewritten = ctaTitle;
      else if (/(subtitle|subheadline|desctext|body|description|note|meta|copy)/.test(key) && (ctaSub || sectionFallback.subtitle))
        rewritten = ctaSub || sectionFallback.subtitle;
      else if (/(btnlabel|ctalabel|buttontext|btntext|ctatext)/.test(key)) rewritten = primaryCta;
    } else if (kind === "socialproof") {
      if (/(titletext|headline|^title$)/.test(key)) rewritten = sectionFallback.title;
      else if (/(subtitle|subheadline|desctext|body|description)/.test(key)) rewritten = sectionFallback.subtitle;
    } else if (kind === "footer" && /(copy|legal|copyright)/.test(key)) {
      rewritten = `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;
    }

    if (looksLikeImageField(key)) {
      if (current.startsWith("/generated-pen-assets/")) return current;
      const idx = extractIndexFromKey(key);
      const product = productHints[idx] ?? productHints[0];
      const hintedImage = product?.image ?? "";
      if (/^https?:\/\//i.test(hintedImage)) return hintedImage;
      if (/^https?:\/\//i.test(current) && !isDynamicUnsplashUrl(current)) return current;
      const query = buildImageQuery(kind, hints, northStar, product, brandName);
      const imageUrl = buildSemanticImageUrl(query, `${ctx.sectionId}:${pathKey}:${idx}`);
      if (imageUrl) return imageUrl;
    }
    rewritten = stripInstructionNoise(rewritten);
    rewritten = applySemanticReplacements(rewritten, semanticReplacements);
    if (forceEnglishCopy) {
      rewritten = stripCjkForEnglishCopy(rewritten, brandName);
    }
    if (hasInstructionNoise(rewritten)) {
      return /(title|headline|name|label)/.test(key) ? sectionFallback.title : sectionFallback.subtitle;
    }
    return rewritten || current;
  };

  const rewriteValue = (value: unknown, keyPath: string[]): unknown => {
    if (typeof value === "string") {
      const key = String(keyPath[keyPath.length - 1] || "").toLowerCase();
      return rewriteString(value, key, keyPath.join("."));
    }
    if (Array.isArray(value)) return value.map((entry, index) => rewriteValue(entry, [...keyPath, String(index)]));
    if (!isRecord(value)) return value;
    const next: Record<string, unknown> = {};
    Object.entries(value).forEach(([childKey, childValue]) => {
      next[childKey] = rewriteValue(childValue, [...keyPath, childKey]);
    });
    return next;
  };

  Object.entries(props).forEach(([key, value]) => {
    props[key] = rewriteValue(value, [key]);
  });
};

// ---------------------------------------------------------------------------
// Deep personalization: apply architect signals to template props
// ---------------------------------------------------------------------------
const personalizeTemplateProps = (
  props: Record<string, unknown>,
  kind: SectionKind,
  ctx: TemplatePersonalizationContext,
  blockType: string,
  options?: {
    editableFields?: EditableFieldContract[];
    strictEditableOnly?: boolean;
  }
): void => {
  const hints = ctx.propsHints ?? {};
  const northStar = ctx.designNorthStar ?? {};
  const brandName = extractBrandName(ctx.prompt) ?? ctx.pageName ?? "Brand";
  const cleanIntent = sanitizeSectionIntent(ctx.sectionIntent);
  const sectionFallback = buildSectionFallbackText(kind, ctx, brandName, northStar);
  const editableFields = options?.editableFields ?? resolveEditableFieldContracts(blockType, props);

  // --- Universal: id & anchor ---
  if (typeof props.id !== "string" || !props.id) {
    props.id = ctx.idBase;
  }
  if (typeof props.anchor !== "string" || !props.anchor) {
    props.anchor = kind === "navigation" ? "top" : ctx.anchor;
  }
  if (options?.strictEditableOnly) {
    if (editableFields.length) {
      applyEditableFieldContract(props, editableFields, {
        kind,
        ctx,
        brandName,
        hints,
        northStar,
        sectionFallback,
        cleanIntent,
      });
    }
    sanitizeResidualTextProps(props, ctx, brandName, northStar);
    return;
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
    const currentTitle = typeof props.title === "string" ? props.title.trim() : "";
    const currentSubtitle = typeof props.subtitle === "string" ? props.subtitle.trim() : "";
    // Title from intent or hints
    const intentTitle = cleanIntent;
    if (intentTitle && (!currentTitle || isGenericPlaceholderText(currentTitle))) {
      props.title = intentTitle.slice(0, 96);
    }
    const hintedTitle = typeof hints.title === "string" && hints.title.trim() ? hints.title.trim() : null;
    if (hintedTitle && (!currentTitle || isGenericPlaceholderText(currentTitle))) {
      props.title = hintedTitle.slice(0, 96);
    }
    // Subtitle
    const sub = extractSubtitle(hints, ctx.sectionIntent);
    if (sub && sub !== props.title && (!currentSubtitle || isGenericPlaceholderText(currentSubtitle))) {
      props.subtitle = sub;
    }
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
    const currentTitle = typeof props.title === "string" ? props.title.trim() : "";
    const currentSubtitle = typeof props.subtitle === "string" ? props.subtitle.trim() : "";
    const currentBody = typeof props.body === "string" ? props.body.trim() : "";
    const intentTitle = cleanIntent;
    if (intentTitle && (!currentTitle || isGenericPlaceholderText(currentTitle))) {
      props.title = intentTitle.slice(0, 96);
    }
    const sub = extractSubtitle(hints) || sectionFallback.subtitle;
    if (sub && (!currentSubtitle || isGenericPlaceholderText(currentSubtitle))) {
      props.subtitle = sub;
    }
    const body = typeof hints.body === "string" && hints.body.trim() ? hints.body.trim() : null;
    if (body && (!currentBody || isGenericPlaceholderText(currentBody))) {
      props.body = body.slice(0, 500);
    }
  }

  // --- Approach / Features ---
  if (kind === "approach") {
    const intentTitle = cleanIntent || sectionFallback.title;
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    const sub = extractSubtitle(hints) || sectionFallback.subtitle;
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
    const intentTitle = cleanIntent || sectionFallback.title;
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    if (sectionFallback.subtitle && (typeof props.subtitle !== "string" || isGenericPlaceholderText(props.subtitle))) {
      props.subtitle = sectionFallback.subtitle.slice(0, 140);
    }
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
    const intentTitle = cleanIntent || sectionFallback.title;
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    const sub = extractSubtitle(hints) || sectionFallback.subtitle;
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
    const intentTitle = cleanIntent || sectionFallback.title;
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    const sub = extractSubtitle(hints) || sectionFallback.subtitle;
    if (sub) props.subtitle = sub;
    props.ctaLabel = extractCtaLabel(hints, props.ctaLabel as string);
    // Secondary CTA
    const secondaryLabel = typeof hints.secondaryCtaLabel === "string" && hints.secondaryCtaLabel.trim()
      ? hints.secondaryCtaLabel.trim().slice(0, 48) : undefined;
    if (secondaryLabel) props.secondaryCtaLabel = secondaryLabel;
  }

  // --- Contact ---
  if (kind === "contact") {
    const intentTitle = cleanIntent || sectionFallback.title;
    if (intentTitle) props.title = intentTitle.slice(0, 96);
    if (
      sectionFallback.subtitle &&
      (typeof props.subtitle !== "string" || isGenericPlaceholderText(props.subtitle))
    ) {
      props.subtitle = sectionFallback.subtitle.slice(0, 140);
    }
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

  rewriteTemplateSpecificProps(props, kind, ctx, brandName, hints, northStar);
  if (editableFields.length) {
    applyEditableFieldContract(props, editableFields, {
      kind,
      ctx,
      brandName,
      hints,
      northStar,
      sectionFallback,
      cleanIntent,
    });
  }
  sanitizeResidualTextProps(props, ctx, brandName, northStar);
};

export const resolveSectionTemplateAsset = (input: TemplatePersonalizationContext): ResolvedSectionTemplateAsset | null => {
  const profile = selectStyleProfile(input.prompt);
  if (!profile) return null;

  const kind = inferSectionKind(input.sectionType, input.sectionId);
  if (!kind) return null;

  const normalizedPagePath = normalizeTemplatePagePath(input.pagePath);
  const targetPageType = inferTemplatePageType(normalizedPagePath, input.pageName);
  const candidate = resolveTemplateCandidate({
    profile,
    kind,
    normalizedPagePath,
    targetPageType,
  });
  if (!candidate?.template) return null;

  const props = cloneProps(candidate.template.props);
  const editableFields = resolveEditableFieldContracts(candidate.template.type, props);
  const strictEditableOnly =
    candidate.layer === "page" ||
    candidate.layer === "block" ||
    candidate.layer === "style-family-page" ||
    candidate.layer === "style-family-block";
  personalizeTemplateProps(props, kind, {
    ...input,
    profileId: candidate.profile.id,
    profileDomain: candidate.profile.sourceDomain,
  }, candidate.template.type, {
    editableFields,
    strictEditableOnly,
  });

  return {
    block: { type: candidate.template.type, props },
    layer: candidate.layer,
    profileId: candidate.profile.id,
    styleFamily: getProfileStyleFamily(candidate.profile) || null,
    editableFields,
    catalogSource: candidate.catalogSource,
  };
};

export const resolveSectionTemplateBlock = (input: TemplatePersonalizationContext): SectionTemplateBlock | null => {
  const asset = resolveSectionTemplateAsset(input);
  return asset?.block ?? null;
};
