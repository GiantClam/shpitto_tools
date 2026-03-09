const asArray = (value) => (Array.isArray(value) ? value : []);

const normalizePath = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  const cleaned = raw.replace(/\/+$/, "") || "/";
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
};

const inferPageType = (page = {}) => {
  const explicit = String(page?.taxonomy_type || "").trim();
  if (explicit) return explicit;
  const path = normalizePath(page?.path || "/");
  if (path === "/") return "home";
  const token = `${path} ${String(page?.name || "").toLowerCase()}`;
  if (/pricing|plans?|billing/.test(token)) return "pricing";
  if (/contact|support|help|faq/.test(token)) return "contact";
  if (/privacy|terms|policy|legal/.test(token)) return "legal";
  if (/^\/blogs?(?:\/)?$/.test(path) || /^\/blogs?\/[^/]+(?:\/)?$/.test(path)) return "blog_list";
  if (/^\/blogs?\/[^/]+\/[^/]+/.test(path)) return "blog_detail";
  if (/^\/(products?|collections?|shop|store)(?:\/|$)/.test(path)) {
    if (/^\/collections?\/[^/]+(?:\/)?$/.test(path)) return "product_service_list";
    return path.split("/").filter(Boolean).length > 1 ? "detail" : "product_service_list";
  }
  if (/about|company|team/.test(token)) return "about";
  return path.split("/").filter(Boolean).length > 1 ? "detail" : "product_service_list";
};

export const buildAssemblyManifest = ({ site = {}, specPack = {} } = {}) => {
  const taxonomyPages = asArray(specPack?.taxonomy_selected_pages);
  const pageSpecs = asArray(specPack?.page_specs);
  const sourcePages = taxonomyPages.length ? taxonomyPages : pageSpecs;
  const byType = {};
  for (const page of sourcePages) {
    const type = inferPageType(page);
    if (!byType[type]) byType[type] = [];
    byType[type].push({
      path: normalizePath(page?.path || "/"),
      name: String(page?.name || "").trim() || "",
    });
  }

  const selectedTemplates = {};
  for (const [type, pages] of Object.entries(byType)) {
    const first = asArray(pages)[0];
    if (!first) continue;
    selectedTemplates[type] = first.path;
  }

  const requiredPageTypes = ["home", "product_service_list", "detail", "contact", "legal"];
  return {
    generatedAt: new Date().toISOString(),
    siteId: String(site?.id || ""),
    sourceUrl: String(site?.url || ""),
    required_page_types: requiredPageTypes,
    available_page_types: Object.keys(byType),
    selected_templates: selectedTemplates,
    shared_components: {
      navigation: String(specPack?.section_specs?.navigation?.block_type || ""),
      footer: String(specPack?.section_specs?.footer?.block_type || ""),
    },
    selected_pages_by_type: byType,
  };
};

export const evaluateKeyFlowIntegrity = ({ specPack = {}, assemblyManifest = null } = {}) => {
  const pageSpecs = asArray(specPack?.page_specs);
  const taxonomyPages = asArray(specPack?.taxonomy_selected_pages);
  const sourcePages = pageSpecs.length ? pageSpecs : taxonomyPages;
  const inferredTypes = new Set(sourcePages.map((page) => inferPageType(page)));
  const pathSet = new Set(sourcePages.map((page) => normalizePath(page?.path || "/")));

  const hasHome = pathSet.has("/");
  const hasListing = inferredTypes.has("product_service_list") || inferredTypes.has("blog_list");
  const hasDetail = inferredTypes.has("detail") || inferredTypes.has("blog_detail");
  const hasContactOrPricing =
    inferredTypes.has("contact") || inferredTypes.has("help_faq") || inferredTypes.has("pricing");
  const required = ["home", "listing", "detail", "contact_or_pricing"];
  const present = [];
  if (hasHome) present.push("home");
  if (hasListing) present.push("listing");
  if (hasDetail) present.push("detail");
  if (hasContactOrPricing) present.push("contact_or_pricing");
  const missing = required.filter((item) => !present.includes(item));
  const coverageRate = Number((((required.length - missing.length) / required.length) * 100).toFixed(2));

  return {
    generatedAt: new Date().toISOString(),
    required,
    present,
    missing,
    coverageRate,
    passed: missing.length === 0,
    manifestVersion: assemblyManifest?.generatedAt || "",
  };
};
