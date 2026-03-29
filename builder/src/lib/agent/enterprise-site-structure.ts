import enterpriseSiteStructure from "../../../shared/enterprise-site-structure.json";

import type { TemplatePageType } from "@/lib/agent/section-template-registry";
import { resolveCanonicalRoute } from "@/lib/agent/route-contract";

export type EnterpriseSitePageKey =
  | "home"
  | "core_product"
  | "products"
  | "solutions"
  | "cases"
  | "about"
  | "pricing"
  | "support"
  | "blog"
  | "contact"
  | "privacy"
  | "terms";

export type EnterpriseSitePageDefinition = {
  key: EnterpriseSitePageKey;
  path: string;
  name: string;
  pageType: TemplatePageType;
  taxonomyType:
    | "home"
    | "detail"
    | "product_service_list"
    | "about"
    | "contact"
    | "pricing"
    | "help_faq"
    | "blog_list"
    | "blog_detail"
    | "legal";
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

const SINGLE_PAGE_HOMEPAGE_PATTERN =
  /(single[-\s]?page|one[-\s]?page|strictly one page|single page only|homepage(?:\s+only)?|only\s+home(?:\s*page)?|仅首页|只保留首页|仅保留首页|仅保留一个页面|单页(?:网站|站点)?|landing page(?:\s+only)?)/i;

const EXPLICIT_MULTI_PAGE_CONTRACT_PATTERN =
  /(multi[-\s]?page|full site|full website|complete site|complete website|must include pages?|required pages?|页面结构|站点结构|网站结构|页面包含|页面包括|必须包含页面|需包含页面|完整多页|多页站点|多页面)/i;

const STRONG_ENTERPRISE_BUSINESS_PATTERN =
  /(企业官网|公司官网|官方网站|制造商|工厂|工业|设备|机械|manufacturer|manufactur|factory|industrial|machinery|equipment|b2b|corporate|enterprise|official website|company website)/i;

const ENTERPRISE_MULTI_PAGE_ROUTE_PATTERNS = [
  /(?:about(?:\s+us)?|company|team|mission|history)\s*(?:page|pages|route|routes|nav|menu|menus)|(?:关于(?:我们)?|公司简介|品牌故事)(?:页面|页|导航|栏目)/i,
  /(?:contact|contact us|get[-\s]?in[-\s]?touch|sales)\s*(?:page|pages|route|routes|nav|menu|menus)|(?:联系(?:我们)?|咨询|询价)(?:页面|页|导航|栏目)/i,
  /(?:support|help|faq|docs|documentation)\s*(?:page|pages|route|routes|nav|menu|menus)|(?:支持|帮助中心|常见问题|文档)(?:页面|页|导航|栏目)/i,
  /(?:pricing|plans?|quote|cost|subscription)\s*(?:page|pages|route|routes|nav|menu|menus)|(?:定价|价格|套餐|报价)(?:页面|页|导航|栏目)/i,
  /(?:blog|news|insights?|resources?|articles?)\s*(?:page|pages|route|routes|nav|menu|menus)|(?:博客|新闻|洞察|资讯)(?:页面|页|导航|栏目)/i,
  /(?:privacy|policy|terms?|legal|gdpr|cookie)\s*(?:page|pages|route|routes|nav|menu|menus)|(?:隐私|政策|条款)(?:页面|页|导航|栏目)/i,
  /(?:solutions?|services?|capabilities|workflow|industr(?:y|ies))\s*(?:page|pages|route|routes|nav|menu|menus)|(?:解决方案|服务|能力|行业方案)(?:页面|页|导航|栏目)/i,
  /(?:cases?|case studies|customers?|portfolio|projects?)\s*(?:page|pages|route|routes|nav|menu|menus)|(?:案例|客户案例|项目案例)(?:页面|页|导航|栏目)/i,
  /(?:products?|catalog|shop|collection|collections|product catalog|product page)\s*(?:page|pages|route|routes|nav|menu|menus)?|(?:产品页|产品中心|产品列表|商城|商品列表|商品页)/i,
  /(?:core product|flagship|featured product)\s*(?:page|pages|route|routes|nav|menu|menus)|(?:核心产品|旗舰产品|明星产品)(?:页面|页|导航|栏目)/i,
] as const;

const countExplicitMultiPageSignals = (prompt: string) => {
  const rawPrompt = String(prompt || "");
  return ENTERPRISE_MULTI_PAGE_ROUTE_PATTERNS.reduce((count, pattern) => count + (pattern.test(rawPrompt) ? 1 : 0), 0);
};

const countExplicitRouteReferences = (prompt: string) => {
  const rawPrompt = String(prompt || "");
  if (!rawPrompt.trim()) return 0;
  const routeSet = new Set<string>();
  const matches = rawPrompt.matchAll(/(?:^|[\s|,;:()[\]{}<>])\/([a-z0-9][a-z0-9-]{0,40})(?=$|[\s|,;:()[\]{}<>])/gi);
  for (const match of matches) {
    const slug = String(match[1] || "").trim();
    if (!slug) continue;
    const canonical = resolveCanonicalRoute(`/${slug}`);
    const normalized = normalizeEnterprisePagePath(canonical);
    if (normalized === "/") continue;
    routeSet.add(normalized);
  }
  return routeSet.size;
};

const hasExplicitMultiPageContract = (prompt: string) => {
  const rawPrompt = String(prompt || "");
  if (!rawPrompt.trim()) return false;
  if (EXPLICIT_MULTI_PAGE_CONTRACT_PATTERN.test(rawPrompt)) return true;
  if (countExplicitMultiPageSignals(rawPrompt) >= 2) return true;
  return countExplicitRouteReferences(rawPrompt) >= 2;
};

const pageDepth = (path: string) => normalizeEnterprisePagePath(path).split("/").filter(Boolean).length;

const tokenFromPage = (page: PageLike) =>
  `${normalizeEnterprisePagePath(page?.path || "/")} ${String(page?.name || "").trim()}`.toLowerCase();

const isPrivacyPage = (page: PageLike) => /(privacy|policy|cookie|gdpr|隐私|政策)/.test(tokenFromPage(page));

const isTermsPage = (page: PageLike) =>
  /(terms?|legal|tos|user[-\s]?agreement|使用条款|服务条款|法律声明)/.test(tokenFromPage(page));

const isContactPage = (page: PageLike) =>
  /(contact|quote|consult|demo|get[-\s]?in[-\s]?touch|sales|联系|询价|咨询)/.test(tokenFromPage(page));

const isAboutPage = (page: PageLike) =>
  /(about|company|team|story|mission|vision|history|founder|leadership|culture|关于|公司|团队|历程|创始人|理念)/.test(
    tokenFromPage(page)
  );

const isPricingPage = (page: PageLike) =>
  /(pricing|plans?|tiers?|quote|cost|subscription|定价|价格|套餐|报价)/.test(tokenFromPage(page));

const isSupportPage = (page: PageLike) =>
  /(support|help|faq|docs|documentation|knowledge|guide|支持|帮助|常见问题|文档)/.test(tokenFromPage(page));

const isBlogPage = (page: PageLike) =>
  /(blog|news|journal|insight|resource|article|press|博客|新闻|洞察|资讯)/.test(tokenFromPage(page));

const isCasesPage = (page: PageLike) =>
  /(case|customer|project|portfolio|success|scenario|application|案例|客户|场景)/.test(tokenFromPage(page));

const isSolutionsPage = (page: PageLike) =>
  /(solution|service|capabilit|workflow|industry|integration|解决方案|方案|应用)/.test(tokenFromPage(page));

const isProductsListingPage = (page: PageLike) => {
  const path = normalizeEnterprisePagePath(page?.path || "/");
  const token = tokenFromPage(page);
  if (/^\/products?\/?$/.test(path)) return true;
  if (
    /^\/(?:machines?|equipment|models?|series|portfolio|catalog|lineup|centers?)\/?$/.test(path) ||
    /^\/[a-z0-9-]*(?:machines?|equipment|models?|series|portfolio|catalog|lineup|centers?)[a-z0-9-]*\/?$/.test(path)
  ) {
    return true;
  }
  return /(all products|product catalog|products|catalog|machines?|equipment|cnc|machining centers?|产品中心|全部产品|产品列表|设备列表|机型列表)/.test(
    token
  );
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
  if (key === "terms") return isTermsPage(page);
  if (key === "privacy") return isPrivacyPage(page);
  if (key === "contact") return isContactPage(page);
  if (key === "support") return isSupportPage(page);
  if (key === "blog") return isBlogPage(page);
  if (key === "pricing") return isPricingPage(page);
  if (key === "about") return isAboutPage(page);
  if (key === "cases") return isCasesPage(page);
  if (key === "solutions") return isSolutionsPage(page);
  if (key === "products") return isProductsListingPage(page);
  if (key === "core_product") return isCoreProductPage(page, pages);
  return false;
};

export const looksLikeEnterpriseWebsite = ({ prompt = "", pages = [] }: EnterpriseIntentInput) => {
  const rawPrompt = String(prompt || "");
  const singlePageHomepageIntent = SINGLE_PAGE_HOMEPAGE_PATTERN.test(rawPrompt);
  const explicitMultiPageSignals = hasExplicitMultiPageContract(rawPrompt);
  if (singlePageHomepageIntent && !explicitMultiPageSignals) return false;
  if (ENTERPRISE_PROMPT_PATTERN.test(rawPrompt)) return true;
  if (explicitMultiPageSignals) {
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
    (matchedKeys.has("products") || matchedKeys.has("solutions") || matchedKeys.has("cases") || matchedKeys.has("pricing"));
  return hasCoreSignals;
};

export const ensureEnterpriseSitePages = <T extends PageLike>(
  pages: T[],
  createPage: (definition: EnterpriseSitePageDefinition) => T,
  options?: { prompt?: string; allowCoreProduct?: boolean }
) => {
  const normalizedPages = Array.isArray(pages) ? [...pages] : [];
  const claimedIndexes = new Set<number>();
  const next = [...normalizedPages];
  const prompt = String(options?.prompt || "");
  const hasCoreProductPromptSignal =
    /(?:core[-\s]?product|flagship|featured[-\s]?product|核心产品|旗舰产品|明星产品|单机详情|单机型|detail\s+page)/i.test(
      prompt
    );
  const hasProductsListingPage = normalizedPages.some((page) => isProductsListingPage(page));
  const hasCoreProductPathSignal = normalizedPages.some((page) => {
    const normalizedPath = normalizeEnterprisePagePath(page?.path || "/");
    return /^\/products\/[^/]+/.test(normalizedPath);
  });
  const includeCoreProductPage =
    Boolean(options?.allowCoreProduct) ||
    (!hasProductsListingPage && (hasCoreProductPromptSignal || hasCoreProductPathSignal));

  ENTERPRISE_SITE_PAGES.forEach((definition) => {
    if (definition.key === "core_product" && !includeCoreProductPage) return;
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
