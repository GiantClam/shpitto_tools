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

const classifyPageRole = (page) => {
  const pathValue = normalizeTemplatePagePath(page?.path || "/");
  const name = String(page?.name || "").toLowerCase();
  const required = Array.isArray(page?.required_categories)
    ? page.required_categories.map((entry) => String(entry || "").toLowerCase())
    : [];
  const token = `${pathValue} ${name}`;

  if (pathValue === "/") return "home";
  if (/contact|quote|book|demo|get[-\s]?in[-\s]?touch|support|help/.test(token) || required.includes("contact")) {
    return "contact";
  }
  if (
    /\/products?\/?$|\/services?\/?$|\/solutions?\/?$|\/blog\/?$|\/blogs\/?$|\/news\/?$|\/insights?\/?$|\/resources?\/?$|\/collections?\/?$/.test(
      pathValue
    ) ||
    required.includes("products")
  ) {
    return "listing";
  }
  if (
    /\/products?\/.+|\/blog\/.+|\/blogs\/.+|\/article\/.+|\/news\/.+|\/insights?\/.+|\/stories\/.+|\/case[-_]studies?\/.+/.test(
      pathValue
    ) ||
    pageDepth(pathValue) >= 2
  ) {
    return "detail";
  }
  return "generic";
};

const toPageRows = (siteItem) => {
  const pageSpecs = Array.isArray(siteItem?.specPack?.page_specs) ? siteItem.specPack.page_specs : [];
  if (pageSpecs.length) {
    return pageSpecs.map((page) => ({
      path: normalizeTemplatePagePath(page?.path || "/"),
      name: String(page?.name || "").trim() || "Page",
      required_categories: Array.isArray(page?.required_categories) ? page.required_categories : [],
    }));
  }
  const sitePages = Array.isArray(siteItem?.specPack?.site_pages) ? siteItem.specPack.site_pages : [];
  return sitePages.map((page) => ({
    path: normalizeTemplatePagePath(page?.path || "/"),
    name: String(page?.name || "").trim() || "Page",
    required_categories: Array.isArray(page?.required_categories) ? page.required_categories : [],
  }));
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

  const selected = [];
  const selectedPaths = new Set();
  const pushIf = (entry, reason) => {
    if (!entry?.path || selectedPaths.has(entry.path)) return;
    selectedPaths.add(entry.path);
    selected.push({ ...entry, reason });
  };

  const pickByRole = (role) => unique.find((page) => page.role === role);
  pushIf(pickByRole("home"), "home");
  pushIf(pickByRole("listing"), "listing");
  pushIf(pickByRole("detail"), "detail");
  pushIf(pickByRole("contact"), "contact");

  for (const page of unique) {
    if (selected.length >= Math.max(1, Math.floor(Number(maxPagesPerSite) || 4))) break;
    pushIf(page, "top_reachable");
  }

  if (!selected.length) {
    pushIf(unique[0], "fallback_first");
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
