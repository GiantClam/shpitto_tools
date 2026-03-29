import { classifyEnterprisePageType, normalizeSitePath, type EnterprisePageType } from "@/lib/agent/page-classifier";

export type PageContractIssue = {
  severity: "error" | "warning";
  code:
    | "missing_required_section"
    | "missing_lead_capture"
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
};

const TEMPLATE_COPY_PATTERN =
  /\blorem ipsum\b|\byour brand\b|\bour (?:mission|vision|values?|services?|products?)\b|\btrusted by\b|\bbook (?:a )?demo\b|\bget started\b|\bdiscover more\b|\blearn more\b|\bthis section\b|\bplaceholder\b|\{\{[^}]+\}\}|\[\s*(?:title|subtitle|description|content|cta)\s*\]/i;

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

const requiredKindsByPageType = (pageType: EnterprisePageType): string[] => {
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
    new Set([...(requiredKindsByPageType(pageType) || []), ...((input.requiredSectionKinds || []).filter(Boolean) as string[])])
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

  return {
    pass: !issues.some((issue) => issue.severity === "error"),
    pageType,
    issues,
  };
};
