import enterpriseSiteStructure from "../../../shared/enterprise-site-structure.json";

import type { TemplatePageType } from "@/lib/agent/section-template-registry";

export type EnterpriseSitePageKey =
  | "home"
  | "core_product"
  | "products"
  | "solutions"
  | "cases"
  | "about"
  | "contact"
  | "privacy";

export type EnterpriseSitePageDefinition = {
  key: EnterpriseSitePageKey;
  path: string;
  name: string;
  pageType: TemplatePageType;
  taxonomyType: "home" | "detail" | "product_service_list" | "about" | "contact" | "legal";
  requiredCategories: string[];
  description: string;
};

type PageLike = {
  path?: string;
  name?: string;
};

type EnterpriseIntentInput = {
  prompt?: string;
  pages?: PageLike[];
};

function normalizeEnterprisePagePath(value: unknown) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || raw === "home" || raw === "index") return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
}

export const ENTERPRISE_SITE_PAGES = ((enterpriseSiteStructure as { pages?: EnterpriseSitePageDefinition[] })?.pages ?? []).map(
  (page) => ({
    ...page,
    path: normalizeEnterprisePagePath(page.path),
    requiredCategories: Array.isArray(page.requiredCategories) ? [...page.requiredCategories] : [],
  })
);

export const ENTERPRISE_SITE_PAGE_KEYS = ENTERPRISE_SITE_PAGES.map((page) => page.key);

export const ENTERPRISE_SITE_STRUCTURE_BRIEF = ENTERPRISE_SITE_PAGES.map(
  (page) => `${page.path} (${page.name})`
).join(", ");

const ENTERPRISE_PROMPT_PATTERN =
  /(企业官网|公司官网|官方网站|企业站|官网|企业|公司|制造商|工厂|工业|设备|机械|manufacturer|manufactur|factory|industrial|machinery|equipment|b2b|corporate|enterprise|official website|company website)/i;

const ENTERPRISE_PAGE_SIGNAL_PATTERN =
  /(core product|flagship|featured product|products?|catalog|solutions?|cases?|case studies|about|company|contact|privacy|policy|核心产品|旗舰产品|明星产品|产品|解决方案|案例|关于|联系|隐私)/i;

const pageDepth = (path: string) => normalizeEnterprisePagePath(path).split("/").filter(Boolean).length;

const tokenFromPage = (page: PageLike) =>
  `${normalizeEnterprisePagePath(page?.path || "/")} ${String(page?.name || "").trim()}`.toLowerCase();

const isPrivacyPage = (page: PageLike) => /(privacy|policy|legal|terms?|cookie|gdpr|隐私|政策)/.test(tokenFromPage(page));

const isContactPage = (page: PageLike) =>
  /(contact|quote|consult|demo|get[-\s]?in[-\s]?touch|sales|support|联系|询价|咨询)/.test(tokenFromPage(page));

const isAboutPage = (page: PageLike) =>
  /(about|company|team|story|mission|vision|history|founder|leadership|culture|关于|公司|团队|历程|创始人|理念)/.test(
    tokenFromPage(page)
  );

const isCasesPage = (page: PageLike) =>
  /(case|customer|project|portfolio|success|scenario|application|案例|客户|场景)/.test(tokenFromPage(page));

const isSolutionsPage = (page: PageLike) =>
  /(solution|service|capabilit|workflow|industry|integration|解决方案|方案|应用)/.test(tokenFromPage(page));

const isProductsListingPage = (page: PageLike) => {
  const path = normalizeEnterprisePagePath(page?.path || "/");
  const token = tokenFromPage(page);
  if (/^\/products?\/?$/.test(path)) return true;
  return /(all products|product catalog|products|catalog|产品中心|全部产品|产品列表)/.test(token);
};

const isCoreProductPage = (page: PageLike, pages: PageLike[]) => {
  const path = normalizeEnterprisePagePath(page?.path || "/");
  const token = tokenFromPage(page);
  if (/core[-\s]?product|flagship|featured[-\s]?product|核心产品|旗舰产品|明星产品/.test(token)) return true;
  if (isProductsListingPage(page)) return false;
  const hasProductsListing = pages.some((candidate) => isProductsListingPage(candidate));
  const looksLikeProductDetail =
    /^\/products?\/[^/]+/.test(path) ||
    /^\/(machines?|equipment|models?|series|portfolio)\/[^/]+/.test(path) ||
    (pageDepth(path) >= 2 && /(product|machine|equipment|model|series|center|产品|设备|机型)/.test(token));
  return hasProductsListing && looksLikeProductDetail;
};

const matchesEnterpriseKey = (page: PageLike, key: EnterpriseSitePageKey, pages: PageLike[]) => {
  const path = normalizeEnterprisePagePath(page?.path || "/");
  if (key === "home") return path === "/";
  if (key === "privacy") return isPrivacyPage(page);
  if (key === "contact") return isContactPage(page);
  if (key === "about") return isAboutPage(page);
  if (key === "cases") return isCasesPage(page);
  if (key === "solutions") return isSolutionsPage(page);
  if (key === "products") return isProductsListingPage(page);
  if (key === "core_product") return isCoreProductPage(page, pages);
  return false;
};

export const looksLikeEnterpriseWebsite = ({ prompt = "", pages = [] }: EnterpriseIntentInput) => {
  const rawPrompt = String(prompt || "");
  if (ENTERPRISE_PROMPT_PATTERN.test(rawPrompt)) return true;
  if (ENTERPRISE_PAGE_SIGNAL_PATTERN.test(rawPrompt) && /(about|contact|privacy|products?|solutions?|cases?)/i.test(rawPrompt)) {
    return true;
  }
  const normalizedPages = Array.isArray(pages) ? pages : [];
  if (normalizedPages.length < 4) return false;
  const matchedKeys = new Set<EnterpriseSitePageKey>();
  normalizedPages.forEach((page) => {
    ENTERPRISE_SITE_PAGE_KEYS.forEach((key) => {
      if (matchesEnterpriseKey(page, key, normalizedPages)) matchedKeys.add(key);
    });
  });
  const hasCoreSignals =
    matchedKeys.has("about") &&
    matchedKeys.has("contact") &&
    (matchedKeys.has("products") || matchedKeys.has("solutions") || matchedKeys.has("cases"));
  return hasCoreSignals;
};

export const ensureEnterpriseSitePages = <T extends PageLike>(
  pages: T[],
  createPage: (definition: EnterpriseSitePageDefinition) => T
) => {
  const normalizedPages = Array.isArray(pages) ? [...pages] : [];
  const claimedIndexes = new Set<number>();
  const next = [...normalizedPages];

  ENTERPRISE_SITE_PAGES.forEach((definition) => {
    const exactPathIndex = normalizedPages.findIndex(
      (page, index) =>
        !claimedIndexes.has(index) && normalizeEnterprisePagePath(page?.path || "") === definition.path
    );
    if (exactPathIndex >= 0) {
      claimedIndexes.add(exactPathIndex);
      return;
    }
    const semanticIndex = normalizedPages.findIndex(
      (page, index) => !claimedIndexes.has(index) && matchesEnterpriseKey(page, definition.key, normalizedPages)
    );
    if (semanticIndex >= 0) {
      claimedIndexes.add(semanticIndex);
      return;
    }
    next.push(createPage(definition));
  });

  return next;
};
