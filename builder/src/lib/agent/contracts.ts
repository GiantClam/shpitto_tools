import { looksLikeEnterpriseWebsite } from "@/lib/agent/enterprise-site-structure";
import { resolveOutputLanguage } from "@/lib/agent/language";
import {
  classifyEnterprisePageType,
  normalizeSitePath,
  type EnterprisePageType,
} from "@/lib/agent/page-classifier";
import { resolveCanonicalRoute } from "@/lib/agent/route-contract";

type ContractSeverity = "error" | "warning";

export type SiteContractIssue = {
  severity: ContractSeverity;
  code:
    | "duplicate_path_removed"
    | "route_alias_canonicalized"
    | "domain_like_path_removed"
    | "missing_home_page"
    | "missing_required_page"
    | "missing_global_chrome"
    | "missing_contact_capture"
    | "contact_gradient_text_forbidden"
    | "language_mismatch"
    | "template_copy_detected";
  message: string;
  details?: Record<string, unknown>;
};

type PageLike = {
  path?: string;
  name?: string;
  sections?: unknown[];
  data?: { content?: Array<{ type?: string; props?: Record<string, unknown> }> };
};

export type SiteContractNormalizationResult<T extends PageLike> = {
  pages: T[];
  issues: SiteContractIssue[];
};

type SiteContractNormalizationOptions = {
  prompt?: string;
};

const looksLikeDomainPath = (path: string) =>
  path !== "/" && (/^\/(www|http|https)(\/|$)/i.test(path) || /\.[a-z]{2,}/i.test(path));

type RequiredPageToken = EnterprisePageType | "privacy";

const extractExplicitRequiredPageTypesFromPrompt = (prompt: string): Set<RequiredPageToken> => {
  const raw = String(prompt || "").trim();
  if (!raw) return new Set<RequiredPageToken>();
  const hasExplicitPageScope =
    /(?:\binclude(?:d|s|ing)?\b|\bwith\b|\bpages?\b|\broutes?\b|\bsitemap\b|\bnavigation\b|包含|包括|页面|路由|导航|栏目|清单)/i.test(
      raw
    );
  if (!hasExplicitPageScope) return new Set<RequiredPageToken>();
  const required = new Set<RequiredPageToken>();
  if (/(?:首页|主页|\bhome(?:\s*page)?\b)/i.test(raw)) required.add("home");
  if (/(?:关于我们|关于|公司概况|公司简介|\babout(?:\s*us)?\b)/i.test(raw)) required.add("about");
  if (/(?:联系我们|联系(?:我们)?|\bcontact\b)/i.test(raw)) required.add("contact");
  if (/(?:隐私(?:政策)?|\bprivacy\b)/i.test(raw)) required.add("privacy");
  if (/(?:产品中心|产品|\bproducts?\b)/i.test(raw)) required.add("products");
  if (/(?:解决方案|方案|\bsolutions?\b)/i.test(raw)) required.add("solutions");
  if (/(?:应用案例|案例|\bcases?\b|\bcase\s*stud(?:y|ies)\b)/i.test(raw)) required.add("cases");
  return required;
};

const detectMissingRequiredPageTypes = (pages: PageLike[], prompt: string): RequiredPageToken[] => {
  const detected = new Set<EnterprisePageType>();
  let hasPrivacyPage = false;
  pages.forEach((page) => {
    const type = classifyEnterprisePageType({ path: page.path, name: page.name }).pageType;
    detected.add(type);
    if (normalizeSitePath(page?.path) === "/privacy") hasPrivacyPage = true;
  });
  const explicitRequired = extractExplicitRequiredPageTypesFromPrompt(prompt);
  if (explicitRequired.size > 0) {
    const missing: RequiredPageToken[] = [];
    explicitRequired.forEach((pageType) => {
      if (pageType === "privacy") {
        if (!hasPrivacyPage) missing.push("privacy");
        return;
      }
      if (!detected.has(pageType)) missing.push(pageType);
    });
    return missing;
  }
  const missing: RequiredPageToken[] = [];
  if (!detected.has("home")) missing.push("home");
  if (!detected.has("about")) missing.push("about");
  if (!detected.has("contact")) missing.push("contact");
  if (!hasPrivacyPage) missing.push("privacy");
  if (!detected.has("products") && !detected.has("solutions") && !detected.has("cases")) {
    missing.push("products");
  }
  return missing;
};

const hasNavbarAndFooter = (page: PageLike) => {
  const blocks = Array.isArray(page?.data?.content) ? page.data.content : [];
  const hasNavbar = blocks.some((block) => /navbar|navigation/i.test(String(block?.type || "")));
  const hasFooter = blocks.some((block) => /footer/i.test(String(block?.type || "")));
  return hasNavbar && hasFooter;
};

const hasContactCapture = (page: PageLike) => {
  const blocks = Array.isArray(page?.data?.content) ? page.data.content : [];
  return blocks.some((block) => {
    const type = String(block?.type || "").toLowerCase();
    const id = String(block?.props?.id || "").toLowerCase();
    return type.includes("leadcapture") || type.includes("contact") || id.includes("contact") || id.includes("quote");
  });
};

const CONTACT_GRADIENT_TEXT_PATTERN = /\b(text-gradient|bg-clip-text|text-transparent)\b/i;

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

const hasForbiddenContactGradientText = (page: PageLike) => {
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
    return classValues.some((item) => CONTACT_GRADIENT_TEXT_PATTERN.test(item));
  });
};

const collectTextValues = (value: unknown, out: string[]) => {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectTextValues(item, out));
    return;
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (text) out.push(text);
    return;
  }
  if (typeof value !== "object") return;
  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    if (/href|url|src|id|anchor|variant|class/i.test(key)) return;
    collectTextValues(entry, out);
  });
};

const isLanguageMismatch = (page: PageLike, outputLanguage: "zh-CN" | "en-US") => {
  const blocks = Array.isArray(page?.data?.content) ? page.data.content : [];
  const textValues: string[] = [];
  collectTextValues(blocks, textValues);
  const text = textValues.join(" ");
  if (!text.trim()) return false;
  const cjkCount = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;
  if (outputLanguage === "zh-CN") {
    if (cjkCount >= 20) return false;
    if (cjkCount >= 10 && cjkCount >= latinCount * 0.45) return false;
    return latinCount >= 36;
  }
  if (latinCount >= 36 && latinCount >= cjkCount * 1.3) return false;
  return cjkCount >= 24;
};

const TEMPLATE_COPY_PATTERN =
  /\blorem ipsum\b|\byour brand\b|\bthis section\b|\bplaceholder(?:\s+(?:text|copy))?\b|\{\{[^}]+\}\}|\[\s*(?:title|subtitle|description|content|cta)\s*\]/i;

const hasTemplateCopy = (page: PageLike) => {
  const blocks = Array.isArray(page?.data?.content) ? page.data.content : [];
  const textValues: string[] = [];
  collectTextValues(blocks, textValues);
  const corpus = [String(page?.name || ""), ...textValues].join(" ").replace(/\s+/g, " ").trim();
  if (!corpus) return false;
  return TEMPLATE_COPY_PATTERN.test(corpus);
};

export const normalizePagesBySiteContract = <T extends PageLike>(
  pages: T[],
  _options?: SiteContractNormalizationOptions
): SiteContractNormalizationResult<T> => {
  const issues: SiteContractIssue[] = [];
  const result: T[] = [];
  const seenPaths = new Set<string>();

  (Array.isArray(pages) ? pages : []).forEach((page, index) => {
    const normalizedPath = normalizeSitePath(page?.path || (index === 0 ? "/" : `/page-${index + 1}`));
    const canonicalPath = resolveCanonicalRoute(normalizedPath);
    if (looksLikeDomainPath(normalizedPath)) {
      issues.push({
        severity: "warning",
        code: "domain_like_path_removed",
        message: `Removed domain-like path "${normalizedPath}"`,
        details: { path: normalizedPath },
      });
      return;
    }
    if (canonicalPath !== normalizedPath) {
      issues.push({
        severity: "warning",
        code: "route_alias_canonicalized",
        message: `Canonicalized route alias "${normalizedPath}" -> "${canonicalPath}"`,
        details: { from: normalizedPath, to: canonicalPath },
      });
    }
    if (seenPaths.has(canonicalPath)) {
      issues.push({
        severity: "warning",
        code: "duplicate_path_removed",
        message: `Removed duplicated path "${canonicalPath}"`,
        details: { path: canonicalPath, source: normalizedPath },
      });
      return;
    }
    seenPaths.add(canonicalPath);
    result.push({ ...(page as T), path: canonicalPath });
  });

  if (!result.some((page) => normalizeSitePath(page?.path) === "/")) {
    issues.push({
      severity: "error",
      code: "missing_home_page",
      message: "Site contract requires a home page path '/'",
    });
  }

  return { pages: result, issues };
};

export const validateGeneratedSiteContract = (input: {
  prompt?: string;
  pages: PageLike[];
}): { pass: boolean; issues: SiteContractIssue[] } => {
  const prompt = String(input.prompt || "");
  const pages = Array.isArray(input.pages) ? input.pages : [];
  const issues: SiteContractIssue[] = [];
  const enterpriseLike = looksLikeEnterpriseWebsite({ prompt, pages });
  const outputLanguage = resolveOutputLanguage(prompt);
  const languageMismatchPages: string[] = [];
  const templateCopyPages: string[] = [];

  pages.forEach((page) => {
    const pagePath = normalizeSitePath(page?.path);
    if (!hasNavbarAndFooter(page)) {
      issues.push({
        severity: "warning",
        code: "missing_global_chrome",
        message: `Page "${pagePath}" is missing navbar or footer`,
        details: { path: pagePath },
      });
    }
    const pageType = classifyEnterprisePageType({ path: pagePath, name: page?.name }).pageType;
    if (pageType === "contact" && !hasContactCapture(page)) {
      issues.push({
        severity: "error",
        code: "missing_contact_capture",
        message: `Contact page "${pagePath}" is missing lead capture section`,
        details: { path: pagePath },
      });
    }
    if (pageType === "contact" && hasForbiddenContactGradientText(page)) {
      issues.push({
        severity: "error",
        code: "contact_gradient_text_forbidden",
        message: `Contact page "${pagePath}" uses forbidden gradient text styles`,
        details: { path: pagePath },
      });
    }
    if (isLanguageMismatch(page, outputLanguage)) {
      languageMismatchPages.push(pagePath);
    }
    if (hasTemplateCopy(page)) {
      templateCopyPages.push(pagePath);
    }
  });

  if (enterpriseLike) {
    const missing = detectMissingRequiredPageTypes(pages, prompt);
    missing.forEach((pageType) => {
      issues.push({
        severity: "error",
        code: "missing_required_page",
        message: `Enterprise site is missing required page type "${pageType}"`,
        details: { pageType },
      });
    });
  }
  if (languageMismatchPages.length > 0) {
    const ratio = languageMismatchPages.length / Math.max(1, pages.length);
    if (ratio >= 0.4 || languageMismatchPages.length >= 2) {
      issues.push({
        severity: "error",
        code: "language_mismatch",
        message: `Generated content language mismatches requested "${outputLanguage}"`,
        details: { outputLanguage, pages: languageMismatchPages },
      });
    } else {
      issues.push({
        severity: "warning",
        code: "language_mismatch",
        message: `Some pages may not match requested language "${outputLanguage}"`,
        details: { outputLanguage, pages: languageMismatchPages },
      });
    }
  }
  if (templateCopyPages.length > 0) {
    issues.push({
      severity: "error",
      code: "template_copy_detected",
      message: "Generated pages still contain template default copy",
      details: { pages: Array.from(new Set(templateCopyPages)) },
    });
  }

  return {
    pass: !issues.some((issue) => issue.severity === "error"),
    issues,
  };
};
