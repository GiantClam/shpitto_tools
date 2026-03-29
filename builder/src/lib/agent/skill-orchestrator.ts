import {
  classifyEnterprisePageType,
  normalizeSitePath,
  type EnterprisePageType,
} from "@/lib/agent/page-classifier";
import {
  PAGE_HARDNESS_RULES_BY_TYPE,
  SECTION_KIND_RULES,
  SECTION_PRIORITY_BY_PAGE_TYPE,
  STRATEGY_INTERIOR_PAGE_TYPES,
  STRATEGY_SUGGESTION_RULES,
  STRUCTURED_SIGNAL_PATTERNS,
  type PageHardnessRule,
  type SectionKind,
} from "@/lib/agent/page-rule-matrix";

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

type Strategy = "llm_first" | "hybrid" | "template_first";

export type SkillOrchestrationResult = {
  pages: PageLike[];
  strategySuggestion: Strategy | null;
  diagnostics: {
    pageTypeHints: Array<{ path: string; name: string; pageType: EnterprisePageType; confidence: number }>;
    sectionReorderedPages: string[];
    structuredSignalCount: number;
  };
};

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

const clonePage = (page: PageLike): PageLike => ({
  ...page,
  root:
    page.root && typeof page.root === "object"
      ? {
          ...page.root,
          props:
            page.root.props && typeof page.root.props === "object"
              ? ({ ...page.root.props } as Record<string, unknown>)
              : undefined,
        }
      : undefined,
  sections: Array.isArray(page.sections) ? page.sections.map((section) => cloneSection(section)) : [],
});

const inferSectionKind = (section: SectionLike): SectionKind => {
  const token = `${String(section?.type || "")} ${String(section?.id || "")} ${String(section?.intent || "")}`.toLowerCase();
  for (const rule of SECTION_KIND_RULES) {
    if (rule.pattern.test(token)) return rule.kind;
  }
  return "other";
};

const mergeHints = (
  source: Record<string, unknown> | undefined,
  patch: Record<string, unknown>
): Record<string, unknown> => ({
  ...(source && typeof source === "object" ? source : {}),
  ...patch,
});

const applyPageHardnessToSection = (
  section: SectionLike,
  kind: SectionKind,
  pageType: EnterprisePageType
): SectionLike => {
  const rule = PAGE_HARDNESS_RULES_BY_TYPE[pageType] || PAGE_HARDNESS_RULES_BY_TYPE.generic;
  const next = cloneSection(section);
  if (kind === "navigation") {
    next.propsHints = mergeHints(next.propsHints, {
      variant: rule.nav.variant,
      maxWidth: rule.nav.maxWidth,
      paddingY: rule.nav.paddingY,
      pageTypeContract: pageType,
    });
    return next;
  }
  if (kind === "hero") {
    next.layoutHint = mergeHints(next.layoutHint, {
      structure: rule.hero.structure,
      density: rule.hero.density,
      align: rule.hero.align,
      media: rule.hero.media,
      list: rule.hero.list,
      compositionPreset: rule.hero.compositionPreset,
    });
    next.propsHints = mergeHints(next.propsHints, {
      motionPreset: rule.hero.motionPreset,
      rhythm: rule.hero.rhythm,
      pageTypeContract: pageType,
    });
    return next;
  }
  if (kind === "approach" || kind === "products" || kind === "socialproof" || kind === "story") {
    next.layoutHint = mergeHints(next.layoutHint, {
      structure: rule.content.preferredStructure,
      list: rule.content.preferredList,
    });
    next.propsHints = mergeHints(next.propsHints, {
      pageTypeContract: pageType,
    });
    return next;
  }
  if (kind === "contact" || kind === "cta") {
    next.layoutHint = mergeHints(next.layoutHint, {
      structure: pageType === "contact" ? "single" : rule.content.preferredStructure,
      density: pageType === "contact" ? "compact" : "normal",
      align: "start",
      list: "rows",
    });
    next.propsHints = mergeHints(next.propsHints, {
      pageTypeContract: pageType,
      forbidGradientText: pageType === "contact",
      textGradientAllowed: pageType === "contact" ? false : undefined,
    });
    return next;
  }
  return next;
};

const dedupeSectionsByKindBudget = (
  sections: SectionLike[],
  pageType: EnterprisePageType
): SectionLike[] => {
  const rule: PageHardnessRule = PAGE_HARDNESS_RULES_BY_TYPE[pageType] || PAGE_HARDNESS_RULES_BY_TYPE.generic;
  const defaultBudget: Partial<Record<SectionKind, number>> = {
    navigation: 1,
    hero: 1,
    story: 1,
    approach: 1,
    products: 1,
    socialproof: 1,
    contact: 1,
    cta: 1,
    footer: 1,
    other: 2,
  };
  const budget = { ...defaultBudget, ...(rule.sectionRepeatBudget || {}) };
  const countByKind = new Map<SectionKind, number>();
  const seenSignatures = new Set<string>();
  const result: SectionLike[] = [];
  sections.forEach((section) => {
    const kind = inferSectionKind(section);
    const signature = `${kind}:${String(section?.type || "").toLowerCase()}:${String(section?.id || "")
      .toLowerCase()
      .replace(/\d+/g, "")}:${String(section?.intent || "").toLowerCase().replace(/\s+/g, " ").trim()}`;
    if (seenSignatures.has(signature)) return;
    const current = countByKind.get(kind) || 0;
    const max = Math.max(1, Number(budget[kind] ?? budget.other ?? 1));
    if (current >= max) return;
    countByKind.set(kind, current + 1);
    seenSignatures.add(signature);
    result.push(section);
  });
  return result;
};

const countStructuredSignals = (prompt: string) =>
  STRUCTURED_SIGNAL_PATTERNS.reduce((sum, regex) => sum + (regex.test(prompt) ? 1 : 0), 0);

const hasCriticalPagePairs = (paths: string[]) => {
  const set = new Set(paths.map((item) => normalizeSitePath(item)));
  return set.has("/solutions") && set.has("/cases");
};

const maybeSuggestStrategy = (input: {
  prompt: string;
  currentStrategy: Strategy;
  pageHints: Array<{ path: string; pageType: EnterprisePageType; confidence: number }>;
  structuredSignalCount: number;
}): Strategy | null => {
  const highConfidenceCount = input.pageHints.filter((hint) => hint.confidence >= 0.45).length;
  const hasEnterpriseInterior = input.pageHints.some((hint) => STRATEGY_INTERIOR_PAGE_TYPES.includes(hint.pageType));
  const hasCriticalPair = hasCriticalPagePairs(input.pageHints.map((hint) => hint.path));
  // When product/case critical pairs are present, avoid template-first lock to reduce page isomorphism.
  if (input.currentStrategy === "template_first" && hasCriticalPair) {
    return "hybrid";
  }
  for (const rule of STRATEGY_SUGGESTION_RULES) {
    if (!rule.allowedCurrent.includes(input.currentStrategy)) continue;
    if (typeof rule.minStructuredSignals === "number" && input.structuredSignalCount < rule.minStructuredSignals) continue;
    if (typeof rule.maxStructuredSignals === "number" && input.structuredSignalCount > rule.maxStructuredSignals) continue;
    if (typeof rule.minHighConfidenceCount === "number" && highConfidenceCount < rule.minHighConfidenceCount) continue;
    if (rule.requireInteriorPageType && !hasEnterpriseInterior) continue;
    return rule.suggest;
  }
  return null;
};

export const orchestrateTemplateAndSectionCandidates = (input: {
  prompt: string;
  pages: PageLike[];
  strategy: Strategy;
}): SkillOrchestrationResult => {
  const prompt = String(input.prompt || "");
  const pages = Array.isArray(input.pages) ? input.pages.map((page) => clonePage(page)) : [];
  const pageTypeHints = pages.map((page) => {
    const path = normalizeSitePath(page.path);
    const name = String(page.name || "").trim();
    const classification = classifyEnterprisePageType({ path, name });
    return {
      path,
      name,
      pageType: classification.pageType,
      confidence: classification.confidence,
    };
  });
  const sectionReorderedPages: string[] = [];

  const orchestratedPages = pages.map((page, index) => {
    const path = normalizeSitePath(page.path || (index === 0 ? "/" : ""));
    const hint = pageTypeHints[index];
    const priority = SECTION_PRIORITY_BY_PAGE_TYPE[hint?.pageType || "generic"] || SECTION_PRIORITY_BY_PAGE_TYPE.generic;
    const sections = Array.isArray(page.sections) ? page.sections.map((section) => cloneSection(section)) : [];
    if (sections.length <= 1) {
      const hardened = sections.map((section) =>
        applyPageHardnessToSection(section, inferSectionKind(section), hint?.pageType || "generic")
      );
      return {
        ...page,
        path,
        root: {
          ...(page.root && typeof page.root === "object" ? page.root : {}),
          props: mergeHints(page.root?.props, {
            pageTypeContract: hint?.pageType || "generic",
          }),
        },
        sections: hardened,
      };
    }
    const withScore = sections.map((section, sectionIndex) => {
      const kind = inferSectionKind(section);
      const rank = priority.indexOf(kind);
      return {
        section,
        sectionIndex,
        rank: rank >= 0 ? rank : 999,
      };
    });
    const reordered = withScore
      .sort((left, right) => (left.rank === right.rank ? left.sectionIndex - right.sectionIndex : left.rank - right.rank))
      .map((entry) => entry.section);
    const deduped = dedupeSectionsByKindBudget(reordered, hint?.pageType || "generic");
    const hardened = deduped.map((section) =>
      applyPageHardnessToSection(section, inferSectionKind(section), hint?.pageType || "generic")
    );
    const sameOrder =
      deduped.length === sections.length &&
      deduped.every((section, orderIndex) => section === sections[orderIndex]);
    if (!sameOrder) sectionReorderedPages.push(path);
    return {
      ...page,
      path,
      root: {
        ...(page.root && typeof page.root === "object" ? page.root : {}),
        props: mergeHints(page.root?.props, {
          pageTypeContract: hint?.pageType || "generic",
        }),
      },
      sections: hardened,
    };
  });

  const structuredSignalCount = countStructuredSignals(prompt);
  const strategySuggestion = maybeSuggestStrategy({
    prompt,
    currentStrategy: input.strategy,
    pageHints: pageTypeHints,
    structuredSignalCount,
  });

  return {
    pages: orchestratedPages,
    strategySuggestion,
    diagnostics: {
      pageTypeHints,
      sectionReorderedPages,
      structuredSignalCount,
    },
  };
};
