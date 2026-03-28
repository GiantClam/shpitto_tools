import {
  getStyleProfiles,
  selectStyleProfile,
  type SiteStyleShell,
  type StyleProfile,
  type TemplatePageType,
} from "@/lib/agent/section-template-registry";

type SectionLike = {
  id?: string;
  type?: string;
  intent?: string;
  layoutHint?: Record<string, unknown>;
  propsHints?: Record<string, unknown>;
};

type PageLike = {
  path?: string;
  name?: string;
  sections?: SectionLike[];
  root?: { props?: Record<string, unknown> };
};

type ProfilePageLike = {
  path: string;
  name: string;
  pageType: TemplatePageType;
  kinds: TemplatePlanSectionKind[];
};

type TemplatePlanSectionKind =
  | "navigation"
  | "hero"
  | "story"
  | "approach"
  | "products"
  | "socialproof"
  | "contact"
  | "cta"
  | "footer";

const sectionOrder: TemplatePlanSectionKind[] = [
  "navigation",
  "hero",
  "story",
  "approach",
  "products",
  "socialproof",
  "contact",
  "cta",
  "footer",
];

const sectionPatterns: Record<TemplatePlanSectionKind, RegExp[]> = {
  navigation: [/navigation|navbar|header|topnav|menu/],
  hero: [/hero|masthead|pagehero|banner|intro/],
  story: [/story|about|narrative|philosophy|studio|editorial|mission|vision|who/],
  approach: [/approach|metric|stats|feature|value|process|capability|benefit|numbers?|technology|technical|tech(?:\s|-)?highlight|innovation|science|价值点|优势|能力|方法|指标|流程|特性|亮点|技术|科技/],
  products: [/product|catalog|collection|pricing|plan|showcase|gallery|module|offer|package|产品|目录|机型|设备|商品|套餐|报价/],
  socialproof: [/social|proof|testimonial|review|trust|logo|collaborator|partner/],
  contact: [/contact|lead|inquiry|form|quote|consult/],
  cta: [/cta|calltoaction|call-to-action|footercta|start|trial|getstarted/],
  footer: [/footer|legal|copyright|bottom/],
};

const sectionTypeByKind: Record<TemplatePlanSectionKind, string> = {
  navigation: "Navigation",
  hero: "Hero",
  story: "Content",
  approach: "Features",
  products: "ProductCatalog",
  socialproof: "SocialProof",
  contact: "Contact",
  cta: "CTA",
  footer: "Footer",
};

const sectionIdByKind: Record<TemplatePlanSectionKind, string> = {
  navigation: "navigation",
  hero: "hero",
  story: "story",
  approach: "approach",
  products: "products",
  socialproof: "social-proof",
  contact: "contact",
  cta: "footer-cta",
  footer: "footer",
};

const normalizePagePath = (value: unknown) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
};

const normalizeKind = (value: unknown): TemplatePlanSectionKind | null => {
  const token = String(value ?? "").trim().toLowerCase() as TemplatePlanSectionKind;
  return sectionOrder.includes(token) ? token : null;
};

const inferPromptDrivenKinds = (prompt: string): TemplatePlanSectionKind[] => {
  const raw = String(prompt || "")
    .trim()
    .toLowerCase();
  if (!raw) return [];
  return sectionOrder.filter((kind) => {
    if (kind === "navigation" || kind === "hero" || kind === "footer") return false;
    return sectionPatterns[kind].some((pattern) => pattern.test(raw));
  });
};

const inferPageType = (pathValue: unknown, nameValue: unknown): TemplatePageType => {
  const pathToken = String(pathValue || "").trim().toLowerCase();
  const nameToken = String(nameValue || "").trim().toLowerCase();
  const token = `${pathToken} ${nameToken}`;
  if (!pathToken || pathToken === "/") return "home";
  if (pathToken === "/" || /(^|[^a-z])home($|[^a-z])/.test(token)) return "home";
  if (/(about|company|story|mission|vision|who|team)/.test(token)) return "about";
  if (/(careers?|jobs?|hiring|join[-\s]?us|talent|recruit)/.test(token)) return "careers";
  if (/(legal|privacy|term|policy|cookie|gdpr)/.test(token)) return "legal";
  if (/(pricing|plans?|tiers?|subscription|quote|cost|套餐|报价|价格)/.test(token)) return "pricing";
  if (/(faq|frequently\s*asked|questions?|q&a|qanda|常见问题|问答)/.test(token)) return "faq";
  if (/(support|help|docs|documentation|knowledge|guide)/.test(token)) return "support";
  if (/(blog|news|journal|article|insight|press)/.test(token)) return "blog";
  if (/(contact|quote|inquir|demo|consult|book)/.test(token)) return "contact";
  if (/(case|customer|testimonial|proof|review|success|portfolio|use-case|usecase|results?)/.test(token))
    return "cases";
  if (/(solution|service|capabilit|workflow|industry|technology|technologies|integration)/.test(token))
    return "solutions";
  if (
    /(product|catalog|collection|store|shop|telescope|binocular|device|hardware|machine|machines|equipment|center|centres|cnc|model|models|series|frame|shell|bezel|keypad|lineup)/.test(
      token
    )
  )
    return "products";
  return "generic";
};

const toKinds = (values: unknown[]): TemplatePlanSectionKind[] => {
  const set = new Set<TemplatePlanSectionKind>();
  values.forEach((value) => {
    const kind = normalizeKind(value);
    if (kind) set.add(kind);
  });
  return sectionOrder.filter((kind) => set.has(kind));
};

const toSlug = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const cloneSection = (section: SectionLike): SectionLike => ({
  ...section,
  layoutHint:
    section.layoutHint && typeof section.layoutHint === "object"
      ? ({ ...section.layoutHint } as Record<string, unknown>)
      : undefined,
  propsHints:
    section.propsHints && typeof section.propsHints === "object"
      ? ({ ...section.propsHints } as Record<string, unknown>)
      : undefined,
});

const sectionMatchesKind = (section: SectionLike, kind: TemplatePlanSectionKind) => {
  const token = `${section.type ?? ""} ${section.id ?? ""}`.toLowerCase();
  return sectionPatterns[kind].some((pattern) => pattern.test(token));
};

const syntheticIntentByKind: Record<TemplatePlanSectionKind, string> = {
  navigation: "Site navigation",
  hero: "Present the core value proposition",
  story: "Explain brand narrative and positioning",
  approach: "Explain solution approach and capabilities",
  products: "Showcase core product offerings",
  socialproof: "Show trust signals and testimonials",
  contact: "Provide contact and conversion entry points",
  cta: "Drive the primary conversion action",
  footer: "Provide global footer links and legal info",
};

const createSyntheticSection = (kind: TemplatePlanSectionKind): SectionLike => ({
  id: sectionIdByKind[kind],
  type: sectionTypeByKind[kind],
  intent: syntheticIntentByKind[kind],
});

const canonicalizeSection = (section: SectionLike, kind: TemplatePlanSectionKind): SectionLike => {
  const fallbackId = sectionIdByKind[kind];
  const baseId = typeof section.id === "string" && section.id.trim() ? section.id : fallbackId;
  const normalizedId = toSlug(baseId) || fallbackId;
  const shouldResetFooterLikeId =
    kind !== "footer" && /(^|-)footer($|-)|(^|-)legal($|-)|(^|-)copyright($|-)|(^|-)bottom($|-)/.test(normalizedId);
  return {
    ...cloneSection(section),
    id: shouldResetFooterLikeId ? fallbackId : sectionMatchesKind(section, kind) ? normalizedId : fallbackId,
    type: sectionTypeByKind[kind],
    intent:
      typeof section.intent === "string" && section.intent.trim() ? section.intent : `${kind} section`,
  };
};

const parseProfilePages = (profile: StyleProfile) => {
  const rawPages = Array.isArray(profile.siteTemplates)
    ? profile.siteTemplates
    : Array.isArray(profile.pageSpecs)
      ? profile.pageSpecs
      : [];
  const pages: ProfilePageLike[] = [];
  for (const rawPage of rawPages) {
    const record = rawPage as Record<string, unknown>;
    const path = normalizePagePath(record.path);
    const name = typeof record.name === "string" && record.name.trim() ? record.name.trim() : path === "/" ? "Home" : "Page";
    const requiredCategories = Array.isArray(record.requiredCategories)
      ? record.requiredCategories
      : Array.isArray(record.required_categories)
        ? record.required_categories
        : [];
    const kinds = toKinds(requiredCategories);
    if (!kinds.length) continue;
    const pageType =
      typeof record.pageType === "string" && record.pageType.trim()
        ? inferPageType(record.pageType, name)
        : inferPageType(path, name);
    pages.push({ path, name, pageType, kinds });
  }
  return pages;
};

const defaultKindsByPageType: Record<TemplatePageType, TemplatePlanSectionKind[]> = {
  home: ["navigation", "hero", "story", "products", "socialproof", "cta", "footer"],
  about: ["navigation", "hero", "story", "approach", "socialproof", "cta", "footer"],
  solutions: ["navigation", "hero", "approach", "products", "story", "socialproof", "contact", "cta", "footer"],
  products: ["navigation", "hero", "story", "products", "approach", "socialproof", "contact", "cta", "footer"],
  pricing: ["navigation", "hero", "products", "approach", "socialproof", "contact", "cta", "footer"],
  cases: ["navigation", "hero", "products", "socialproof", "story", "contact", "cta", "footer"],
  contact: ["navigation", "hero", "story", "socialproof", "contact", "cta", "footer"],
  faq: ["navigation", "hero", "story", "approach", "contact", "cta", "footer"],
  blog: ["navigation", "hero", "story", "products", "socialproof", "cta", "footer"],
  careers: ["navigation", "hero", "story", "approach", "socialproof", "contact", "cta", "footer"],
  legal: ["navigation", "story", "footer"],
  support: ["navigation", "hero", "story", "approach", "contact", "cta", "footer"],
  generic: ["navigation", "hero", "story", "approach", "cta", "footer"],
};

const pathSpecificDefaultKinds: Array<{ pattern: RegExp; kinds: TemplatePlanSectionKind[] }> = [
  {
    pattern: /^\/core-product(?:\/|$)/i,
    kinds: ["navigation", "hero", "story", "approach", "socialproof", "cta", "footer"],
  },
  {
    pattern: /^\/products(?:\/|$)/i,
    kinds: ["navigation", "hero", "products", "approach", "contact", "cta", "footer"],
  },
  {
    pattern: /^\/solutions(?:\/|$)/i,
    kinds: ["navigation", "hero", "approach", "story", "contact", "cta", "footer"],
  },
  {
    pattern: /^\/cases(?:\/|$)/i,
    kinds: ["navigation", "hero", "socialproof", "products", "story", "cta", "footer"],
  },
];

const resolveDefaultKindsForPath = (
  path: string,
  pageType: TemplatePageType
): TemplatePlanSectionKind[] => {
  const normalized = normalizePagePath(path);
  const pathRule = pathSpecificDefaultKinds.find((entry) => entry.pattern.test(normalized));
  if (pathRule) return [...pathRule.kinds];
  return [...(defaultKindsByPageType[pageType] || defaultKindsByPageType.generic)];
};

const dedupeKinds = (kinds: TemplatePlanSectionKind[]) => {
  const set = new Set<TemplatePlanSectionKind>();
  const deduped: TemplatePlanSectionKind[] = [];
  kinds.forEach((kind) => {
    if (set.has(kind)) return;
    set.add(kind);
    deduped.push(kind);
  });
  return deduped;
};

const strictProfilePageTypes = new Set<TemplatePageType>(["about", "solutions", "cases", "pricing", "faq", "careers"]);

const filterTemplateFirstFallbackKinds = (
  pageType: TemplatePageType,
  kinds: TemplatePlanSectionKind[]
): TemplatePlanSectionKind[] => {
  if (pageType === "home") return kinds;
  const homeOnlyFallback = new Set<TemplatePlanSectionKind>(["hero", "story", "products"]);
  return kinds.filter((kind) => !homeOnlyFallback.has(kind));
};

const chooseProfilePageForInput = (input: {
  pagePath: string;
  pageName: string;
  pageType: TemplatePageType;
  profilePages: ProfilePageLike[];
  usedProfilePaths: Set<string>;
}) => {
  const path = normalizePagePath(input.pagePath);
  const pathToken = path.toLowerCase();
  const nameToken = String(input.pageName || "").toLowerCase();
  const exactPathMatch = input.profilePages.find((candidate) => normalizePagePath(candidate.path) === path);
  if (exactPathMatch) {
    input.usedProfilePaths.add(normalizePagePath(exactPathMatch.path));
    return exactPathMatch;
  }
  const candidatePool = strictProfilePageTypes.has(input.pageType)
    ? input.profilePages.filter((candidate) => candidate.pageType === input.pageType)
    : input.profilePages;
  const scored = candidatePool
    .map((candidate) => {
      let score = 0;
      if (candidate.pageType === input.pageType) score += 200;
      if (input.pageType !== "home" && candidate.pageType === "home") score -= 80;
      const candidateToken = `${candidate.path} ${candidate.name}`.toLowerCase();
      if (pathToken !== "/" && candidateToken.includes(pathToken.replace(/^\//, ""))) score += 40;
      if (nameToken && candidateToken.includes(nameToken)) score += 24;
      if (input.usedProfilePaths.has(normalizePagePath(candidate.path))) score -= 30;
      score += Math.min(20, candidate.kinds.length);
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score);
  const picked = scored[0]?.candidate;
  if (picked) input.usedProfilePaths.add(normalizePagePath(picked.path));
  return picked;
};

const isCompatibleProfilePage = (
  pageType: TemplatePageType,
  candidate: ProfilePageLike | undefined
) => {
  if (!candidate) return false;
  if (candidate.pageType === pageType) return true;
  if (pageType !== "home" && candidate.pageType === "home") return false;
  if (strictProfilePageTypes.has(pageType)) return false;
  return true;
};

const profileTemplateKinds = (profile: StyleProfile): TemplatePlanSectionKind[] =>
  Object.keys(profile.templates ?? {})
    .map((key) => normalizeKind(key))
    .filter((kind): kind is TemplatePlanSectionKind => Boolean(kind));

export type LayeredTemplateResolution = {
  profileId: string | null;
  siteStyleShell: SiteStyleShell | null;
  layer: "full-site" | "page" | "section" | "block" | "llm";
  pages: PageLike[];
  diagnostics: {
    matchedPagePaths: string[];
    matchedPageCoverage: number;
    templateKinds: TemplatePlanSectionKind[];
    strategy: string;
  };
};

const planPageSections = (input: {
  page: PageLike;
  profilePage?: ProfilePageLike;
  fallbackKinds: TemplatePlanSectionKind[];
  pageType: TemplatePageType;
  promptKinds?: TemplatePlanSectionKind[];
  strategy: "llm_first" | "hybrid" | "template_first";
}) => {
  const defaultKinds = resolveDefaultKindsForPath(String(input.page?.path || "/"), input.pageType);
  const profileKinds = input.profilePage?.kinds?.length ? input.profilePage.kinds : [];
  const promptKinds = Array.isArray(input.promptKinds) ? input.promptKinds : [];
  const preserveProfileSkeleton =
    input.strategy === "template_first" && profileKinds.length > 0;
  const shouldPreferDefaultKinds =
    !preserveProfileSkeleton &&
    (input.pageType === "solutions" ||
      input.pageType === "cases" ||
      (input.pageType === "about" && !input.profilePage));
  const pageKinds =
    preserveProfileSkeleton
      ? dedupeKinds([...profileKinds])
      : shouldPreferDefaultKinds
        ? dedupeKinds([...defaultKinds, ...profileKinds, ...promptKinds])
        : dedupeKinds([...profileKinds, ...promptKinds, ...(input.fallbackKinds || []), ...defaultKinds]);
  const shouldSuppressHomeProducts =
    input.pageType === "home" && promptKinds.includes("approach") && !promptKinds.includes("products");
  const normalizedPageKinds = shouldSuppressHomeProducts
    ? pageKinds.filter((kind) => kind !== "products")
    : pageKinds;
  if (!normalizedPageKinds.length) return input.page;

  const sourceSections = Array.isArray(input.page.sections)
    ? input.page.sections.map((section) => cloneSection(section))
    : [];
  const used = new Set<number>();
  const planned = normalizedPageKinds.map((kind) => {
    const index = sourceSections.findIndex(
      (section, sectionIndex) => !used.has(sectionIndex) && sectionMatchesKind(section, kind)
    );
    if (index >= 0) {
      used.add(index);
      return canonicalizeSection(sourceSections[index], kind);
    }
    return createSyntheticSection(kind);
  });

  return {
    ...input.page,
    path: normalizePagePath(input.page.path),
    sections: planned,
  };
};

const chooseProfile = (prompt: string, pages: PageLike[] = []): StyleProfile | null => {
  const direct = selectStyleProfile(prompt);
  if (direct) return direct;
  const profiles = getStyleProfiles();
  const normalizedPrompt = String(prompt || "").toLowerCase();
  const byDomain = profiles.find((profile) => {
    const domain = String(profile.sourceDomain || "").toLowerCase();
    return domain && normalizedPrompt.includes(domain);
  });
  return byDomain || null;
};

export const resolveTemplatePlan = (input: {
  prompt: string;
  pages: PageLike[];
  strategy: "llm_first" | "hybrid" | "template_first";
}): LayeredTemplateResolution => {
  const profile = chooseProfile(input.prompt, input.pages);
  const promptKinds = inferPromptDrivenKinds(input.prompt);
  if (!profile || input.strategy === "llm_first") {
    return {
      profileId: profile?.id ?? null,
      siteStyleShell: profile?.siteStyleShell ?? null,
      layer: profile ? "section" : "llm",
      pages: input.pages,
      diagnostics: {
        matchedPagePaths: [],
        matchedPageCoverage: 0,
        templateKinds: [],
        strategy: input.strategy,
      },
    };
  }

  const templateKinds = profileTemplateKinds(profile);
  if (!templateKinds.length) {
    return {
      profileId: profile.id,
      siteStyleShell: profile.siteStyleShell ?? null,
      layer: "block",
      pages: input.pages,
      diagnostics: {
        matchedPagePaths: [],
        matchedPageCoverage: 0,
        templateKinds,
        strategy: input.strategy,
      },
    };
  }

  const profilePages = parseProfilePages(profile);
  const profilePageByPath = new Map(profilePages.map((page) => [normalizePagePath(page.path), page] as const));
  const usedProfilePaths = new Set<string>();
  const matchedPagePaths: string[] = [];
  let matchedTemplatePageCount = 0;

  let mergedPages = input.pages;
  let layer: LayeredTemplateResolution["layer"] = "section";

  if (profilePages.length) {
    if (input.strategy === "template_first") {
      layer = "full-site";
      if (input.pages.length) {
        mergedPages = input.pages.map((page) => {
          const key = normalizePagePath(page.path);
          const pageType = inferPageType(key, page.name);
          const matched =
            profilePageByPath.get(key) ??
            chooseProfilePageForInput({
              pagePath: key,
              pageName: String(page.name || ""),
              pageType,
              profilePages,
              usedProfilePaths,
            });
          const compatibleMatch = isCompatibleProfilePage(pageType, matched) ? matched : undefined;
          if (compatibleMatch) {
            matchedPagePaths.push(key);
            matchedTemplatePageCount += 1;
          }
          return compatibleMatch
            ? { ...page, path: key, name: page.name || compatibleMatch.name }
            : { ...page, path: key };
        });
      } else {
        mergedPages = profilePages.map((tpl) => {
          const key = normalizePagePath(tpl.path);
          matchedPagePaths.push(key);
          matchedTemplatePageCount += 1;
          return { path: key, name: tpl.name || (key === "/" ? "Home" : "Page"), sections: [] };
        });
      }
    } else {
      layer = "page";
      input.pages.forEach((page) => {
        const key = normalizePagePath(page.path);
        const pageType = inferPageType(key, page.name);
        const matched =
          profilePageByPath.get(key) ??
          chooseProfilePageForInput({
            pagePath: key,
            pageName: String(page.name || ""),
            pageType,
            profilePages,
            usedProfilePaths,
          });
        const compatibleMatch = isCompatibleProfilePage(pageType, matched) ? matched : undefined;
        if (compatibleMatch) {
          matchedPagePaths.push(key);
          matchedTemplatePageCount += 1;
        }
      });
    }
  } else {
    layer = "page";
  }

  const matchedPageCoverage =
    input.pages.length > 0
      ? Number((matchedTemplatePageCount / Math.max(1, input.pages.length)).toFixed(3))
      : profilePages.length > 0
        ? 1
        : 0;
  if (input.strategy === "template_first") {
    if (matchedTemplatePageCount === 0 && input.pages.length > 0) {
      layer = "section";
    } else if (input.pages.length > 0 && matchedPageCoverage < 0.6) {
      layer = "page";
    }
  }

  const plannedPages = mergedPages.map((page) => {
    const pagePath = normalizePagePath(page.path);
    const pageType = inferPageType(pagePath, page.name);
    const matchedProfilePage =
      profilePageByPath.get(pagePath) ??
      chooseProfilePageForInput({
        pagePath,
        pageName: String(page.name || ""),
        pageType,
        profilePages,
        usedProfilePaths,
      });
    const profilePage = isCompatibleProfilePage(pageType, matchedProfilePage) ? matchedProfilePage : undefined;
    const fallbackKinds =
      input.strategy === "template_first"
        ? filterTemplateFirstFallbackKinds(
            pageType,
            sectionOrder.filter((kind) => templateKinds.includes(kind))
          )
        : [];
    return planPageSections({
      page: { ...page, path: pagePath },
      profilePage,
      fallbackKinds,
      pageType,
      promptKinds,
      strategy: input.strategy,
    });
  });

  return {
    profileId: profile.id,
    siteStyleShell: profile.siteStyleShell ?? null,
    layer,
    pages: plannedPages,
    diagnostics: {
      matchedPagePaths,
      matchedPageCoverage,
      templateKinds,
      strategy: input.strategy,
    },
  };
};
