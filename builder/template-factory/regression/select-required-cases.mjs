const normalizeTemplatePagePath = (value) => {
  const rawInput = String(value || "").trim();
  if (!rawInput) return "/";
  let raw = rawInput;
  if (/^https?:\/\//i.test(rawInput)) {
    try {
      raw = new URL(rawInput).pathname || "/";
    } catch {
      raw = rawInput;
    }
  }
  const withoutHash = raw.split("#")[0] || "";
  const withoutQuery = withoutHash.split("?")[0] || "";
  const withSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  const normalized = withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
  return normalized === "" ? "/" : normalized;
};

const pageDepth = (pathValue) =>
  normalizeTemplatePagePath(pathValue)
    .split("/")
    .filter(Boolean).length;

const isSuccessfulCrawlStatus = (value) => {
  const status = Number(value || 0);
  return Number.isFinite(status) && status >= 200 && status < 400;
};

const classifyPageRole = (page) => {
  const pathValue = normalizeTemplatePagePath(page?.path || "/");
  const explicitType = String(page?.taxonomy_type || "").trim().toLowerCase();
  const name = String(page?.name || "").toLowerCase();
  const required = Array.isArray(page?.required_categories)
    ? page.required_categories.map((entry) => String(entry || "").toLowerCase())
    : [];
  const token = `${pathValue} ${name}`;

  if (pathValue === "/") return "home";
  if (explicitType === "product_service_list" || explicitType === "blog_list") return "listing";
  if (explicitType === "detail" || explicitType === "blog_detail") return "detail";
  if (explicitType === "contact" || explicitType === "help_faq") return "contact";
  if (/contact|quote|book|demo|get[-\s]?in[-\s]?touch|support|help/.test(token) || required.includes("contact")) {
    return "contact";
  }
  if (
    /\/products?\/?$|\/services?\/?$|\/solutions?\/?$|\/blog\/?$|\/blogs\/?$|\/news\/?$|\/insights?\/?$|\/resources?\/?$|\/collections?\/?$|\/collections\/[^/]+\/?$/.test(
      pathValue
    ) ||
    required.includes("products")
  ) {
    return "listing";
  }
  if (
    /\/products?\/.+|\/blog\/.+|\/blogs\/[^/]+\/[^/]+|\/article\/.+|\/news\/.+|\/insights?\/.+|\/stories\/.+|\/case[-_]studies?\/.+/.test(
      pathValue
    ) ||
    pageDepth(pathValue) >= 3
  ) {
    return "detail";
  }
  return "generic";
};

const toPageRows = (siteItem) => {
  const pageSpecs = Array.isArray(siteItem?.specPack?.page_specs) ? siteItem.specPack.page_specs : [];
  const sitePages = Array.isArray(siteItem?.specPack?.site_pages) ? siteItem.specPack.site_pages : [];
  const renderablePathSet = new Set([
    "/",
    ...pageSpecs.map((page) => normalizeTemplatePagePath(page?.path || "/")),
  ]);
  const crawlByPath =
    siteItem?.crawlAssetPack?.byPath instanceof Map
      ? siteItem.crawlAssetPack.byPath
      : new Map(
          (Array.isArray(siteItem?.crawlAssetPack?.pages) ? siteItem.crawlAssetPack.pages : [])
            .map((page) => {
              const path = normalizeTemplatePagePath(page?.path || "/");
              return [path, page];
            })
            .filter(([path]) => Boolean(path))
        );
  const rows = [];
  const seen = new Set();
  const push = (page, source) => {
    const path = normalizeTemplatePagePath(page?.path || "/");
    if (!path || seen.has(path)) return;
    seen.add(path);
    rows.push({
      path,
      name: String(page?.name || "").trim() || "Page",
      required_categories: Array.isArray(page?.required_categories) ? page.required_categories : [],
      taxonomy_type: String(page?.taxonomy_type || "").trim(),
      source,
      comparable: crawlByPath.size
        ? (() => {
            const crawlRow = crawlByPath.get(path);
            if (!crawlRow) return false;
            return isSuccessfulCrawlStatus(crawlRow?.status);
          })()
        : true,
      renderable: renderablePathSet.has(path),
    });
  };
  for (const page of pageSpecs) push(page, "page_spec");
  for (const page of sitePages) push(page, "site_page");
  return rows;
};

export const selectRequiredPagesForSite = ({ siteItem, maxPagesPerSite = 4 }) => {
  const pages = toPageRows(siteItem);
  const unique = [];
  const seen = new Set();
  for (const page of pages) {
    if (!page?.path || seen.has(page.path)) continue;
    seen.add(page.path);
    unique.push({ ...page, role: classifyPageRole(page) });
  }
  if (!unique.length) {
    return [{ path: "/", name: "Home", required_categories: [], role: "home", reason: "fallback_home" }];
  }
  const fromPageSpecs = unique.filter((page) => page.source === "page_spec");
  const candidateBase = fromPageSpecs.length ? fromPageSpecs : unique;
  const candidateComparableRenderable = candidateBase.filter((page) => page.comparable && page.renderable);
  const candidateComparable = candidateBase.filter((page) => page.comparable);
  const pool = candidateComparableRenderable.length
    ? candidateComparableRenderable
    : candidateComparable.length
      ? candidateComparable
      : candidateBase;

  const selected = [];
  const selectedPaths = new Set();
  const pushIf = (entry, reason) => {
    if (!entry?.path || selectedPaths.has(entry.path)) return;
    selectedPaths.add(entry.path);
    selected.push({ ...entry, reason });
  };

  const scoreRolePreference = (page, role) => {
    if (!page || role !== "listing") return 0;
    const explicitType = String(page?.taxonomy_type || "").trim().toLowerCase();
    const pathValue = normalizeTemplatePagePath(page?.path || "/");
    if (explicitType === "product_service_list") return 300;
    if (explicitType === "blog_list") return 120;
    if (/^\/(products?|collections?|shop|store)(\/|$)/i.test(pathValue)) return 260;
    if (/^\/blogs?(\/|$)/i.test(pathValue)) return 100;
    return 0;
  };
  const pickByRole = (role) =>
    pool
      .filter((page) => page.role === role)
      .sort((a, b) => scoreRolePreference(b, role) - scoreRolePreference(a, role))[0];
  pushIf(pickByRole("home"), "home");
  pushIf(pickByRole("listing"), "listing");
  pushIf(pickByRole("detail"), "detail");
  pushIf(pickByRole("contact"), "contact");

  for (const page of pool) {
    if (selected.length >= Math.max(1, Math.floor(Number(maxPagesPerSite) || 4))) break;
    pushIf(page, "top_reachable");
  }

  if (!selected.length) {
    pushIf(pool[0] || unique[0], "fallback_first");
  }

  return selected.slice(0, Math.max(1, Math.floor(Number(maxPagesPerSite) || 4)));
};

export const selectRequiredCases = ({ processed = [], fidelityByCase = new Map(), maxPagesPerSite = 4 }) => {
  const strictCaseIds = [];
  const requiredPageCases = [];
  const seenCase = new Set();
  const seenPageCase = new Set();

  for (const item of Array.isArray(processed) ? processed : []) {
    const caseId = String(item?.site?.id || "").trim();
    if (!caseId) continue;
    const mode = String(fidelityByCase.get(caseId)?.mode || "standard").toLowerCase();
    if (mode !== "strict") continue;

    if (!seenCase.has(caseId)) {
      seenCase.add(caseId);
      strictCaseIds.push(caseId);
    }

    const pages = selectRequiredPagesForSite({ siteItem: item, maxPagesPerSite });
    for (const page of pages) {
      const path = normalizeTemplatePagePath(page?.path || "/");
      const id = `${caseId}:${path}`;
      if (seenPageCase.has(id)) continue;
      seenPageCase.add(id);
      requiredPageCases.push({
        id,
        caseId,
        pagePath: path,
        pageName: String(page?.name || "").trim() || "Page",
        role: String(page?.role || "generic"),
        reason: String(page?.reason || "selected"),
      });
    }

    if (!requiredPageCases.some((entry) => entry.caseId === caseId)) {
      const id = `${caseId}:/`;
      if (!seenPageCase.has(id)) {
        seenPageCase.add(id);
        requiredPageCases.push({ id, caseId, pagePath: "/", pageName: "Home", role: "home", reason: "fallback_home" });
      }
    }
  }

  return {
    strictCaseIds,
    requiredPageCases,
  };
};
