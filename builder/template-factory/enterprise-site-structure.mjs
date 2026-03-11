import fs from "fs";

const enterpriseSiteStructureUrl = new URL("../shared/enterprise-site-structure.json", import.meta.url);
const enterpriseSiteStructure = JSON.parse(fs.readFileSync(enterpriseSiteStructureUrl, "utf8"));

function normalizeEnterprisePagePath(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "home" || raw === "index") return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
}

export const ENTERPRISE_SITE_PAGES = Array.isArray(enterpriseSiteStructure?.pages)
  ? enterpriseSiteStructure.pages.map((page) => ({
      ...page,
      path: normalizeEnterprisePagePath(page?.path || "/"),
      requiredCategories: Array.isArray(page?.requiredCategories) ? [...page.requiredCategories] : [],
    }))
  : [];

const ENTERPRISE_PROMPT_PATTERN =
  /(企业官网|公司官网|官方网站|企业站|官网|企业|公司|制造商|工厂|工业|设备|机械|manufacturer|manufactur|factory|industrial|machinery|equipment|b2b|corporate|enterprise|official website|company website)/i;

const ENTERPRISE_PAGE_SIGNAL_PATTERN =
  /(core product|flagship|featured product|products?|catalog|solutions?|cases?|case studies|about|company|contact|privacy|policy|核心产品|旗舰产品|明星产品|产品|解决方案|案例|关于|联系|隐私)/i;
export { normalizeEnterprisePagePath };

const pageDepth = (path) => normalizeEnterprisePagePath(path).split("/").filter(Boolean).length;

const unique = (values = []) => Array.from(new Set((Array.isArray(values) ? values : []).filter(Boolean)));

const tokenFromPage = (page = {}) =>
  `${normalizeEnterprisePagePath(page?.path || "/")} ${String(page?.name || "").trim()}`.toLowerCase();

const isPrivacyPage = (page) => /(privacy|policy|legal|terms?|cookie|gdpr|隐私|政策)/.test(tokenFromPage(page));

const isContactPage = (page) =>
  /(contact|quote|consult|demo|get[-\s]?in[-\s]?touch|sales|support|联系|询价|咨询)/.test(tokenFromPage(page));

const isAboutPage = (page) =>
  /(about|company|team|story|mission|vision|history|founder|leadership|culture|关于|公司|团队|历程|创始人|理念)/.test(
    tokenFromPage(page)
  );

const isCasesPage = (page) =>
  /(case|customer|project|portfolio|success|scenario|application|案例|客户|场景)/.test(tokenFromPage(page));

const isSolutionsPage = (page) =>
  /(solution|service|capabilit|workflow|industry|integration|解决方案|方案|应用)/.test(tokenFromPage(page));

const isProductsListingPage = (page) => {
  const path = normalizeEnterprisePagePath(page?.path || "/");
  if (/^\/products?\/?$/.test(path)) return true;
  return /(all products|product catalog|products|catalog|产品中心|全部产品|产品列表)/.test(tokenFromPage(page));
};

const isCoreProductPage = (page, pages = []) => {
  const path = normalizeEnterprisePagePath(page?.path || "/");
  const token = tokenFromPage(page);
  if (/core[-\s]?product|flagship|featured[-\s]?product|核心产品|旗舰产品|明星产品/.test(token)) return true;
  if (isProductsListingPage(page)) return false;
  const hasProductsListing = (Array.isArray(pages) ? pages : []).some((candidate) => isProductsListingPage(candidate));
  const looksLikeProductDetail =
    /^\/products?\/[^/]+/.test(path) ||
    /^\/(machines?|equipment|models?|series|portfolio)\/[^/]+/.test(path) ||
    (pageDepth(path) >= 2 && /(product|machine|equipment|model|series|center|产品|设备|机型)/.test(token));
  return hasProductsListing && looksLikeProductDetail;
};

const matchesEnterpriseKey = (page, key, pages = []) => {
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

const buildPromptToken = ({ site = {}, pages = [] } = {}) =>
  [
    site?.prompt,
    site?.description,
    site?.name,
    site?.title,
    ...(Array.isArray(pages) ? pages.map((page) => `${page?.path || ""} ${page?.name || ""}`) : []),
  ]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .join(" ");

export const looksLikeEnterpriseWebsiteSite = ({ site = {}, pages = [] } = {}) => {
  const token = buildPromptToken({ site, pages });
  if (ENTERPRISE_PROMPT_PATTERN.test(token)) return true;
  if (ENTERPRISE_PAGE_SIGNAL_PATTERN.test(token) && /(about|contact|privacy|products?|solutions?|cases?)/i.test(token)) {
    return true;
  }
  const normalizedPages = Array.isArray(pages) ? pages : [];
  if (normalizedPages.length < 4) return false;
  const matchedKeys = new Set();
  normalizedPages.forEach((page) => {
    for (const definition of ENTERPRISE_SITE_PAGES) {
      if (matchesEnterpriseKey(page, definition.key, normalizedPages)) matchedKeys.add(definition.key);
    }
  });
  return (
    matchedKeys.has("about") &&
    matchedKeys.has("contact") &&
    (matchedKeys.has("products") || matchedKeys.has("solutions") || matchedKeys.has("cases"))
  );
};

const mergeEnterpriseDefaults = (page, definition) => {
  const next = page && typeof page === "object" ? { ...page } : {};
  next.path = normalizeEnterprisePagePath(next?.path || definition.path);
  next.name = String(next?.name || "").trim() || definition.name;
  if (!String(next?.taxonomy_type || "").trim()) {
    next.taxonomy_type = definition.taxonomyType;
  }
  const currentCategories = Array.isArray(next?.required_categories) ? next.required_categories : [];
  next.required_categories = unique([...currentCategories, ...definition.requiredCategories]);
  next.enterprise_page_key = definition.key;
  return next;
};

export const ensureEnterpriseSitePages = ({ pages = [], site = {} } = {}) => {
  const normalizedPages = Array.isArray(pages) ? pages : [];
  if (!looksLikeEnterpriseWebsiteSite({ site, pages: normalizedPages })) {
    return normalizedPages.map((page) => ({
      ...(page && typeof page === "object" ? page : {}),
      path: normalizeEnterprisePagePath(page?.path || "/"),
    }));
  }
  const claimedIndexes = new Set();
  const next = normalizedPages.map((page) => ({
    ...(page && typeof page === "object" ? page : {}),
    path: normalizeEnterprisePagePath(page?.path || "/"),
  }));
  for (const definition of ENTERPRISE_SITE_PAGES) {
    const exactPathIndex = next.findIndex(
      (page, index) => !claimedIndexes.has(index) && normalizeEnterprisePagePath(page?.path || "/") === definition.path
    );
    if (exactPathIndex >= 0) {
      claimedIndexes.add(exactPathIndex);
      next[exactPathIndex] = mergeEnterpriseDefaults(next[exactPathIndex], definition);
      continue;
    }
    const semanticIndex = next.findIndex(
      (page, index) => !claimedIndexes.has(index) && matchesEnterpriseKey(page, definition.key, next)
    );
    if (semanticIndex >= 0) {
      claimedIndexes.add(semanticIndex);
      next[semanticIndex] = mergeEnterpriseDefaults(next[semanticIndex], definition);
    }
  }
  return next;
};

export const selectEnterpriseRequiredPages = ({ pages = [], site = {} } = {}) => {
  const normalizedPages = ensureEnterpriseSitePages({ pages, site });
  const claimedIndexes = new Set();
  const selected = [];
  for (const definition of ENTERPRISE_SITE_PAGES) {
    const index = normalizedPages.findIndex(
      (page, pageIndex) =>
        !claimedIndexes.has(pageIndex) &&
        (normalizeEnterprisePagePath(page?.path || "/") === definition.path ||
          matchesEnterpriseKey(page, definition.key, normalizedPages))
    );
    if (index < 0) continue;
    claimedIndexes.add(index);
    selected.push(mergeEnterpriseDefaults(normalizedPages[index], definition));
  }
  return selected;
};

export const buildEnterpriseCanonicalLinks = ({ pages = [], site = {}, requireExisting = false } = {}) => {
  const normalizedPages = ensureEnterpriseSitePages({ pages, site });
  const byPath = new Map(
    normalizedPages.map((page) => [normalizeEnterprisePagePath(page?.path || "/"), page] as const)
  );
  return ENTERPRISE_SITE_PAGES.map((definition) => {
    const existing = byPath.get(definition.path);
    if (requireExisting && !existing) return null;
    return {
      key: definition.key,
      label: String(existing?.name || definition.name).trim() || definition.name,
      href: definition.path,
    };
  }).filter(Boolean);
};

export const buildEnterpriseCanonicalFooterColumns = ({ pages = [], site = {}, requireExisting = false } = {}) => {
  const links = buildEnterpriseCanonicalLinks({ pages, site, requireExisting });
  const byKey = new Map(links.map((item) => [item.key, item] as const));
  const pick = (key, fallbackLabel, fallbackHref = "/") => ({
    label: byKey.get(key)?.label || fallbackLabel,
    href: byKey.get(key)?.href || fallbackHref,
  });
  const columns = [
    {
      title: "Overview",
      links: [pick("home", "Home"), pick("core_product", "Core Product"), pick("products", "Products")],
    },
    {
      title: "Solutions",
      links: [pick("solutions", "Solutions"), pick("cases", "Cases")],
    },
    {
      title: "Company",
      links: [pick("about", "About"), pick("contact", "Contact")],
    },
    {
      title: "Legal",
      links: [pick("privacy", "Privacy")],
    },
  ];
  return requireExisting
    ? columns
        .map((column) => ({
          ...column,
          links: column.links.filter((link) => links.some((item) => item.href === link.href)),
        }))
        .filter((column) => column.links.length)
    : columns;
};
