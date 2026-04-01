import { classifyEnterprisePageType, normalizeSitePath, type EnterprisePageType } from "@/lib/agent/page-classifier";

export type PageContractIssue = {
  severity: "error" | "warning";
  code:
    | "missing_required_section"
    | "missing_lead_capture"
    | "products_incomplete"
    | "solutions_approach_points_incomplete"
    | "cases_incomplete"
    | "content_density_insufficient"
    | "media_coverage_insufficient"
    | "contact_gradient_text_forbidden"
    | "template_placeholder_copy"
    | "language_mismatch";
  message: string;
  details?: Record<string, unknown>;
};

type GeneratedBlock = {
  type?: string;
  props?: Record<string, unknown>;
};

type GeneratedPage = {
  path?: string;
  name?: string;
  data?: {
    content?: GeneratedBlock[];
  };
};

type EvaluatePageContractInput = {
  page: GeneratedPage;
  requiredSectionKinds?: string[];
  outputLanguage: "zh-CN" | "en-US";
  expectedProductCount?: number;
  expectedCaseCount?: number;
};

const TEMPLATE_COPY_PATTERN =
  /\blorem ipsum\b|\byour brand\b|\bthis section\b|\bplaceholder(?:\s+(?:text|copy))?\b|\{\{[^}]+\}\}|\[\s*(?:title|subtitle|description|content|cta)\s*\]/i;

const CONTACT_GRADIENT_TEXT_PATTERN = /\b(text-gradient|bg-clip-text|text-transparent)\b/i;

const collectTextValues = (value: unknown, out: string[]) => {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectTextValues(item, out));
    return;
  }
  if (typeof value === "string") {
    const compact = value.replace(/\s+/g, " ").trim();
    if (compact) out.push(compact);
    return;
  }
  if (typeof value !== "object") return;
  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    if (/href|url|src|id|anchor|variant|class/i.test(key)) return;
    collectTextValues(item, out);
  });
};

const collectClassLikeValues = (value: unknown, out: string[]) => {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectClassLikeValues(item, out));
    return;
  }
  if (typeof value !== "object") return;
  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    if (typeof item === "string" && /class/i.test(key)) {
      const compact = item.trim();
      if (compact) out.push(compact);
      return;
    }
    collectClassLikeValues(item, out);
  });
};

const inferBlockKind = (block: GeneratedBlock): string => {
  const token = `${String(block?.type || "")} ${String(block?.props?.id || "")} ${String(block?.props?.anchor || "")}`
    .toLowerCase()
    .trim();
  if (!token) return "other";
  if (/navigation|navbar|header|topnav|menu/.test(token)) return "navigation";
  if (/hero|masthead|banner|intro/.test(token)) return "hero";
  if (/story|content|timeline|about/.test(token)) return "story";
  if (/approach|feature|process|workflow|capability|faq/.test(token)) return "approach";
  if (/product|catalog|showcase|pricing/.test(token)) return "products";
  if (/social|proof|testimonial|logo|certification/.test(token)) return "socialproof";
  if (/contact|lead|form|quote/.test(token)) return "contact";
  if (/cta|calltoaction|call-to-action/.test(token)) return "cta";
  if (/footer|copyright|legal/.test(token)) return "footer";
  return "other";
};

const isChromeLikeKind = (kind: string) => kind === "navigation" || kind === "footer";

const isLanguageMismatch = (text: string, outputLanguage: "zh-CN" | "en-US") => {
  const cjkCount = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;
  if (outputLanguage === "zh-CN") {
    if (cjkCount >= 20) return false;
    if (cjkCount >= 10 && cjkCount >= latinCount * 0.45) return false;
    return latinCount >= 40;
  }
  if (latinCount >= 40 && latinCount >= cjkCount * 1.25) return false;
  return cjkCount >= 24;
};

const hasLeadCapture = (blocks: GeneratedBlock[]) =>
  blocks.some((block) => {
    const type = String(block?.type || "").toLowerCase();
    const id = String(block?.props?.id || "").toLowerCase();
    return type.includes("leadcapture") || type.includes("contact") || id.includes("contact") || id.includes("quote");
  });

const hasForbiddenContactGradientText = (blocks: GeneratedBlock[]) =>
  blocks.some((block) => {
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
    return classValues.some((entry) => CONTACT_GRADIENT_TEXT_PATTERN.test(entry));
  });

const countProductItemsFromBlock = (block: GeneratedBlock) => {
  const props = block?.props && typeof block.props === "object" ? (block.props as Record<string, unknown>) : {};
  const candidates = ["items", "products", "list", "cards", "entries", "models", "catalog"];
  const countedByArray = candidates.reduce((max, key) => {
    const value = props[key];
    if (!Array.isArray(value)) return max;
    const valid = value.filter((item) => {
      if (!item || typeof item !== "object") return false;
      const record = item as Record<string, unknown>;
      const title = String(record.title || record.name || record.model || "").trim();
      const description = String(record.description || record.desc || record.summary || "").trim();
      return Boolean(title || description);
    }).length;
    return Math.max(max, valid);
  }, 0);
  if (countedByArray > 0) return countedByArray;
  const cardTitleCount = Object.keys(props).filter((key) => /^card\d+(title|name)$/i.test(key)).length;
  if (cardTitleCount > 0) return cardTitleCount;
  const productLikeTextCount = Object.values(props).filter((value) => {
    if (typeof value !== "string") return false;
    return /(?:型号|机型|产品|product|model|series)/i.test(value);
  }).length;
  return productLikeTextCount > 0 ? 1 : 0;
};

const countVisibleProducts = (blocks: GeneratedBlock[]) =>
  blocks.reduce((sum, block) => {
    const kind = inferBlockKind(block);
    if (kind !== "products") return sum;
    return sum + Math.max(1, countProductItemsFromBlock(block));
  }, 0);

const countApproachPointsFromBlock = (block: GeneratedBlock) => {
  const props = block?.props && typeof block.props === "object" ? (block.props as Record<string, unknown>) : {};
  const candidates = [
    "items",
    "points",
    "features",
    "benefits",
    "steps",
    "capabilities",
    "highlights",
    "rows",
    "list",
  ];
  const countedByArray = candidates.reduce((max, key) => {
    const value = props[key];
    if (!Array.isArray(value)) return max;
    const valid = value.filter((item) => {
      if (!item) return false;
      if (typeof item === "string") return item.trim().length > 0;
      if (typeof item !== "object") return false;
      const record = item as Record<string, unknown>;
      const title = String(record.title || record.name || record.label || "").trim();
      const description = String(record.description || record.summary || record.text || "").trim();
      return Boolean(title || description);
    }).length;
    return Math.max(max, valid);
  }, 0);
  if (countedByArray > 0) return countedByArray;
  const keyedCount = Object.entries(props).filter(([key, value]) => {
    if (!/^(?:item|point|feature|benefit|step|capability)\d+$/i.test(key)) return false;
    return typeof value === "string" && value.trim().length > 0;
  }).length;
  return keyedCount;
};

const countVisibleApproachPoints = (blocks: GeneratedBlock[]) =>
  blocks.reduce((sum, block) => {
    const kind = inferBlockKind(block);
    if (kind !== "approach") return sum;
    return sum + countApproachPointsFromBlock(block);
  }, 0);

const isCaseLikeBlock = (block: GeneratedBlock) => {
  const token = `${String(block?.type || "")} ${String(block?.props?.id || "")} ${String(block?.props?.anchor || "")}`
    .toLowerCase()
    .trim();
  if (!token) return false;
  return /case|application|testimonial|project|portfolio|customer/.test(token);
};

const countCaseItemsFromBlock = (block: GeneratedBlock) => {
  const props = block?.props && typeof block.props === "object" ? (block.props as Record<string, unknown>) : {};
  const candidates = ["items", "cases", "stories", "testimonials", "entries", "projects", "results", "slides"];
  const countedByArray = candidates.reduce((max, key) => {
    const value = props[key];
    if (!Array.isArray(value)) return max;
    const valid = value.filter((item) => {
      if (!item) return false;
      if (typeof item === "string") return item.trim().length > 0;
      if (typeof item !== "object") return false;
      const record = item as Record<string, unknown>;
      const title = String(record.title || record.name || record.client || record.industry || "").trim();
      const description = String(record.description || record.summary || record.result || "").trim();
      return Boolean(title || description);
    }).length;
    return Math.max(max, valid);
  }, 0);
  if (countedByArray > 0) return countedByArray;
  const keyedCount = Object.entries(props).filter(([key, value]) => {
    if (!/^(?:case|story|testimonial|project)\d+(?:title|name|client)?$/i.test(key)) return false;
    return typeof value === "string" && value.trim().length > 0;
  }).length;
  return keyedCount;
};

const countVisibleCases = (blocks: GeneratedBlock[]) =>
  blocks.reduce((sum, block) => {
    const kind = inferBlockKind(block);
    if (kind !== "socialproof" && !isCaseLikeBlock(block)) return sum;
    return sum + countCaseItemsFromBlock(block);
  }, 0);

const hasMediaSignalInValue = (value: unknown): boolean => {
  if (!value) return false;
  if (Array.isArray(value)) return value.some((item) => hasMediaSignalInValue(item));
  if (typeof value === "string") {
    const token = value.trim().toLowerCase();
    if (!token) return false;
    if (/^https?:\/\//.test(token) && /\.(?:png|jpe?g|webp|gif|avif|svg|mp4|webm)(?:\?.*)?$/.test(token)) return true;
    if (/^data:image\//.test(token)) return true;
    return false;
  }
  if (typeof value !== "object") return false;
  return Object.entries(value as Record<string, unknown>).some(([key, item]) => {
    if (/(?:image|img|media|photo|cover|thumbnail|poster|video|background)/i.test(key)) {
      if (typeof item === "string" && String(item).trim()) return true;
      if (Array.isArray(item) && item.length > 0) return true;
      if (item && typeof item === "object") return true;
    }
    return hasMediaSignalInValue(item);
  });
};

const hasVisualMediaCoverage = (blocks: GeneratedBlock[]) =>
  blocks.some((block) => {
    const token = `${String(block?.type || "")} ${String(block?.props?.id || "")} ${String(block?.props?.anchor || "")}`
      .toLowerCase()
      .trim();
    if (!token) return false;
    if (/(withmedia|gallery|carousel|slider|video|image|photo|showcase|mosaic|splithero)/.test(token)) return true;
    const props = block?.props && typeof block.props === "object" ? (block.props as Record<string, unknown>) : {};
    return hasMediaSignalInValue(props);
  });

export const resolveRequiredSectionKindsByPageType = (pageType: EnterprisePageType): string[] => {
  switch (pageType) {
    case "home":
      return ["navigation", "hero", "cta", "footer"];
    case "products":
      return ["navigation", "hero", "products", "footer"];
    case "solutions":
      return ["navigation", "hero", "approach", "footer"];
    case "cases":
      return ["navigation", "hero", "socialproof", "footer"];
    case "about":
      return ["navigation", "hero", "story", "footer"];
    case "contact":
      return ["navigation", "hero", "contact", "footer"];
    case "pricing":
      return ["navigation", "hero", "products", "footer"];
    case "support":
      return ["navigation", "hero", "footer"];
    case "legal":
      return ["navigation", "story", "footer"];
    case "blog":
      return ["navigation", "hero", "footer"];
    case "generic":
    default:
      return ["navigation", "hero", "footer"];
  }
};

export const evaluateGeneratedPageContract = (
  input: EvaluatePageContractInput
): { pass: boolean; pageType: EnterprisePageType; issues: PageContractIssue[] } => {
  const pagePath = normalizeSitePath(input.page?.path || "/");
  const pageType = classifyEnterprisePageType({ path: pagePath, name: input.page?.name }).pageType;
  const blocks = Array.isArray(input.page?.data?.content) ? input.page.data!.content! : [];
  const requiredKinds = Array.from(
    new Set([
      ...(resolveRequiredSectionKindsByPageType(pageType) || []),
      ...((input.requiredSectionKinds || []).filter(Boolean) as string[]),
    ])
  );
  const presentKinds = new Set(blocks.map((block) => inferBlockKind(block)));
  const issues: PageContractIssue[] = [];

  requiredKinds.forEach((kind) => {
    if (presentKinds.has(kind)) return;
    issues.push({
      severity: kind === "navigation" || kind === "hero" || kind === "footer" ? "error" : "warning",
      code: "missing_required_section",
      message: `Page "${pagePath}" is missing required section kind "${kind}"`,
      details: { path: pagePath, pageType, kind },
    });
  });

  const textValues: string[] = [];
  collectTextValues(blocks, textValues);
  const corpus = textValues.join(" ");
  if (corpus && TEMPLATE_COPY_PATTERN.test(corpus)) {
    issues.push({
      severity: "error",
      code: "template_placeholder_copy",
      message: `Page "${pagePath}" still contains template placeholder copy`,
      details: { path: pagePath },
    });
  }
  if (corpus && isLanguageMismatch(corpus, input.outputLanguage)) {
    issues.push({
      severity: input.outputLanguage === "zh-CN" ? "error" : "warning",
      code: "language_mismatch",
      message: `Page "${pagePath}" may not match requested language "${input.outputLanguage}"`,
      details: { path: pagePath, outputLanguage: input.outputLanguage },
    });
  }

  if (pageType === "contact") {
    if (!hasLeadCapture(blocks)) {
      issues.push({
        severity: "error",
        code: "missing_lead_capture",
        message: `Contact page "${pagePath}" is missing lead capture`,
        details: { path: pagePath },
      });
    }
    if (hasForbiddenContactGradientText(blocks)) {
      issues.push({
        severity: "error",
        code: "contact_gradient_text_forbidden",
        message: `Contact page "${pagePath}" uses forbidden gradient text styles`,
        details: { path: pagePath },
      });
    }
  }

  const expectedProductCount = Number(input.expectedProductCount ?? 0);
  if (pageType === "products" && Number.isFinite(expectedProductCount) && expectedProductCount > 0) {
    const generatedProductCount = countVisibleProducts(blocks);
    if (generatedProductCount < expectedProductCount) {
      issues.push({
        severity: "error",
        code: "products_incomplete",
        message: `Products page "${pagePath}" renders ${generatedProductCount}/${expectedProductCount} expected products`,
        details: { path: pagePath, expectedProductCount, generatedProductCount },
      });
    }
  }

  if (pageType === "solutions") {
    const approachPoints = countVisibleApproachPoints(blocks);
    if (approachPoints < 3) {
      issues.push({
        severity: "error",
        code: "solutions_approach_points_incomplete",
        message: `Solutions page "${pagePath}" only renders ${approachPoints}/3 required approach points`,
        details: { path: pagePath, expectedApproachPoints: 3, generatedApproachPoints: approachPoints },
      });
    }
  }

  const expectedCaseCount = Number(input.expectedCaseCount ?? 0);
  if (pageType === "cases" && Number.isFinite(expectedCaseCount) && expectedCaseCount > 0) {
    const generatedCaseCount = countVisibleCases(blocks);
    if (generatedCaseCount < expectedCaseCount) {
      issues.push({
        severity: "error",
        code: "cases_incomplete",
        message: `Cases page "${pagePath}" renders ${generatedCaseCount}/${expectedCaseCount} expected cases`,
        details: { path: pagePath, expectedCaseCount, generatedCaseCount },
      });
    }
  }

  const shouldEnforceDenseContent = ["home", "products", "solutions", "cases", "about", "contact"].includes(pageType);
  if (shouldEnforceDenseContent) {
    const sectionKinds = blocks.map((block) => inferBlockKind(block)).filter(Boolean);
    const substantiveKinds = sectionKinds.filter((kind) => !isChromeLikeKind(kind) && kind !== "other");
    const substantiveBlockCount = sectionKinds.filter((kind) => !isChromeLikeKind(kind)).length;
    const uniqueSubstantiveKindCount = new Set(substantiveKinds).size;
    const textLength = corpus.replace(/\s+/g, "").length;
    const densityRuleByPageType: Record<
      EnterprisePageType,
      { minBlocks: number; minUniqueKinds: number; minTextLength: number }
    > = {
      home: { minBlocks: 5, minUniqueKinds: 4, minTextLength: 420 },
      products: { minBlocks: 4, minUniqueKinds: 3, minTextLength: 360 },
      solutions: { minBlocks: 5, minUniqueKinds: 3, minTextLength: 420 },
      cases: { minBlocks: 5, minUniqueKinds: 3, minTextLength: 420 },
      about: { minBlocks: 3, minUniqueKinds: 2, minTextLength: 240 },
      contact: { minBlocks: 2, minUniqueKinds: 2, minTextLength: 180 },
      pricing: { minBlocks: 3, minUniqueKinds: 2, minTextLength: 220 },
      support: { minBlocks: 3, minUniqueKinds: 2, minTextLength: 220 },
      blog: { minBlocks: 3, minUniqueKinds: 2, minTextLength: 220 },
      legal: { minBlocks: 1, minUniqueKinds: 1, minTextLength: 120 },
      generic: { minBlocks: 3, minUniqueKinds: 2, minTextLength: 220 },
    };
    const densityRule = densityRuleByPageType[pageType] || densityRuleByPageType.generic;
    const minBlocks = densityRule.minBlocks;
    const minUniqueKinds = densityRule.minUniqueKinds;
    const minTextLength = densityRule.minTextLength;
    if (
      substantiveBlockCount < minBlocks ||
      uniqueSubstantiveKindCount < minUniqueKinds ||
      textLength < minTextLength
    ) {
      issues.push({
        severity: "error",
        code: "content_density_insufficient",
        message: `Page "${pagePath}" content density is insufficient for "${pageType}"`,
        details: {
          path: pagePath,
          pageType,
          substantiveBlockCount,
          uniqueSubstantiveKindCount,
          textLength,
          minBlocks,
          minUniqueKinds,
          minTextLength,
        },
      });
    }
  }

  if (["home", "products", "solutions", "cases"].includes(pageType)) {
    const hasMediaCoverage = hasVisualMediaCoverage(blocks);
    if (!hasMediaCoverage) {
      issues.push({
        severity: "error",
        code: "media_coverage_insufficient",
        message: `Page "${pagePath}" is missing media-forward coverage`,
        details: { path: pagePath, pageType },
      });
    }
  }

  return {
    pass: !issues.some((issue) => issue.severity === "error"),
    pageType,
    issues,
  };
};
