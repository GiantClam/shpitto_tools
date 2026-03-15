import path from "node:path";

import { slugify } from "./pen-exact-template-utils.mjs";

const stripHash = (value = "") => String(value || "").replace(/^#/, "").trim();

const decodeEntities = (value = "") =>
  String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const normalizeSemanticText = (value = "") =>
  decodeEntities(value)
    .toLowerCase()
    .replace(/[|｜]+/g, " ")
    .replace(/[·•▪]+/g, " ")
    .replace(/[↗▾⌄›]+/g, " ")
    .replace(/[_/]+/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, " ")
    .trim()
    .replace(/\s+/g, " ");

const pluralVariants = (value = "") => {
  const normalized = normalizeSemanticText(value);
  if (!normalized) return [];
  const values = new Set([normalized]);
  if (normalized.endsWith("s")) values.add(normalized.slice(0, -1));
  else if (normalized.length > 2) values.add(`${normalized}s`);
  return Array.from(values).filter(Boolean);
};

const tokenize = (value = "") => normalizeSemanticText(value).split(/\s+/).filter(Boolean);

const pageBaseSlug = (page = {}) => {
  const rawId = String(page.pageId || "").trim();
  if (rawId && /^page-/i.test(rawId)) return slugify(rawId.replace(/^page-/i, ""));
  const rawName = String(page.pageName || "").trim();
  if (rawName) return slugify(rawName);
  if (rawId) return slugify(rawId);
  return "page";
};

export const buildPageEntries = (pages = []) => {
  const used = new Set();
  return pages.map((page, index) => {
    const home =
      String(page.pageType || "") === "home" ||
      (index === 0 && !pages.some((entry) => String(entry?.pageType || "") === "home"));
    let slug = home ? "home" : pageBaseSlug(page);
    if (!home) {
      const original = slug;
      let counter = 2;
      while (used.has(slug)) {
        slug = `${original}-${counter}`;
        counter += 1;
      }
    }
    used.add(slug);
    const pagePath = home ? "/" : `/${slug}`;
    const aliases = new Set(
      [
        String(page.pageId || "").trim(),
        slugify(String(page.pageId || "").trim()),
        slugify(String(page.pageName || "").trim()),
        slug,
      ].filter(Boolean)
    );
    const rawId = String(page.pageId || "").trim();
    if (/^page-/i.test(rawId)) aliases.add(rawId.replace(/^page-/i, ""));
    if (page.pageKey) aliases.add(String(page.pageKey || "").trim());
    return {
      pageId: String(page.pageId || ""),
      pageName: String(page.pageName || ""),
      pageType: String(page.pageType || ""),
      pagePath,
      pageParam: home ? "home" : pagePath,
      aliases,
      page,
    };
  });
};

export const collectNodeIds = (node, out = new Set()) => {
  if (!node || typeof node !== "object") return out;
  if (typeof node.id === "string" && node.id.trim()) out.add(node.id.trim());
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectNodeIds(child, out);
  }
  return out;
};

export const collectTextNodes = (node, out = []) => {
  if (!node || typeof node !== "object") return out;
  if (typeof node.content === "string" && node.content.trim()) {
    out.push({
      id: String(node.id || ""),
      name: String(node.name || ""),
      type: String(node.type || ""),
      content: decodeEntities(String(node.content || "")),
      fontSize: typeof node.fontSize === "number" ? node.fontSize : null,
    });
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectTextNodes(child, out);
  }
  return out;
};

export const collectRenderableNodes = (node, out = []) => {
  if (!node || typeof node !== "object") return out;
  if (typeof node.id === "string" && node.id.trim()) {
    out.push({
      id: String(node.id || ""),
      name: String(node.name || ""),
      type: String(node.type || ""),
    });
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectRenderableNodes(child, out);
  }
  return out;
};

export const indexPageTargets = (pageEntries = []) => {
  const byAlias = new Map();
  for (const entry of pageEntries) {
    for (const alias of entry.aliases) {
      if (!alias) continue;
      byAlias.set(String(alias).trim().toLowerCase(), entry);
    }
  }
  return { byAlias };
};

export const createHrefResolver = ({ siteKey, pageEntries, currentPageId, currentNodeIds = new Set() }) => {
  const { byAlias } = indexPageTargets(pageEntries);
  const stats = {
    total: 0,
    rewrittenToPage: 0,
    keptLocalAnchor: 0,
    keptExternal: 0,
    keptRaw: 0,
    removedInvalid: 0,
  };

  const toSandboxUrl = (targetPage) =>
    `/creation/sandbox?mode=preview&siteKey=${encodeURIComponent(siteKey)}&page=${encodeURIComponent(targetPage.pageParam)}`;

  const findPageTarget = (token = "") => {
    const normalized = stripHash(token).replace(/^\/+/, "").trim().toLowerCase();
    if (!normalized) return null;
    if (byAlias.has(normalized)) return byAlias.get(normalized);
    const pageLike = normalized.startsWith("page-") ? normalized.slice(5) : normalized;
    if (byAlias.has(pageLike)) return byAlias.get(pageLike);
    const asSlug = slugify(normalized);
    if (byAlias.has(asSlug)) return byAlias.get(asSlug);
    return null;
  };

  const resolveHref = (href = "") => {
    const raw = String(href || "").trim();
    if (!raw) return "";
    stats.total += 1;
    if (/^(mailto:|tel:|javascript:|data:)/i.test(raw)) {
      stats.keptRaw += 1;
      return raw;
    }
    if (/^https?:\/\//i.test(raw)) {
      stats.keptExternal += 1;
      return raw;
    }
    if (raw.startsWith("#")) {
      const pageTarget = findPageTarget(raw);
      if (pageTarget && String(pageTarget.pageId || "") !== String(currentPageId || "")) {
        stats.rewrittenToPage += 1;
        return toSandboxUrl(pageTarget);
      }
      const anchor = stripHash(raw);
      if (anchor && currentNodeIds.has(anchor)) {
        stats.keptLocalAnchor += 1;
        return `#${anchor}`;
      }
      if (pageTarget && String(pageTarget.pageId || "") === String(currentPageId || "")) {
        stats.keptLocalAnchor += 1;
        return "#";
      }
      stats.removedInvalid += 1;
      return "";
    }
    if (raw.startsWith("/")) {
      const direct = pageEntries.find((entry) => entry.pagePath === raw);
      if (direct) {
        stats.rewrittenToPage += 1;
        return toSandboxUrl(direct);
      }
      const alias = findPageTarget(raw);
      if (alias) {
        stats.rewrittenToPage += 1;
        return toSandboxUrl(alias);
      }
      stats.removedInvalid += 1;
      return "";
    }
    const relative = findPageTarget(raw);
    if (relative) {
      stats.rewrittenToPage += 1;
      return toSandboxUrl(relative);
    }
    stats.removedInvalid += 1;
    return "";
  };

  return { resolveHref, stats };
};

export const collectLinkNodes = (node, out = []) => {
  if (!node || typeof node !== "object") return out;
  if (typeof node.href === "string" && node.href.trim()) {
    out.push({
      id: String(node.id || ""),
      name: String(node.name || ""),
      type: String(node.type || ""),
      href: String(node.href || ""),
      content: typeof node.content === "string" ? decodeEntities(node.content) : "",
    });
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectLinkNodes(child, out);
  }
  return out;
};

export const looksLikeMultiLinkText = (text = "") => {
  const raw = decodeEntities(String(text || "")).trim();
  if (!raw) return false;
  if (raw.includes("   ")) return true;
  const parts = raw
    .split(/\n+|\s{2,}|\s\|\s| · | • | ▪ /)
    .map((item) => item.trim())
    .filter(Boolean);
  return parts.length >= 2;
};

const splitLinkishText = (text = "") =>
  decodeEntities(String(text || ""))
    .split(/\n+|\s{2,}|\s\|\s| · | • | ▪ /)
    .map((item) => item.replace(/[↗▾⌄›]+/g, " ").trim())
    .filter(Boolean)
    .filter((item) => item.length <= 80);

const SITE_TYPE_ALIASES = {
  home: ["home", "homepage"],
  about: ["about", "about us", "company", "company overview", "about company", "关于", "关于我们"],
  blog: ["blog", "blogs", "news", "newsroom", "insights", "resources", "publications", "知识", "资源"],
  catalog: ["product", "products", "product services", "products services", "shop", "technology", "solutions", "产品", "刀具", "解决方案"],
  contact: ["contact", "contact us", "get started", "联系我们", "联系", "客服中心"],
  generic: [],
};

const siteTokens = ({ siteId = "", siteName = "" } = {}) =>
  Array.from(new Set([...tokenize(siteId), ...tokenize(siteName)])).filter(Boolean);

const stripSiteWords = (value = "", siteWords = []) => {
  const tokens = tokenize(value).filter((token) => !siteWords.includes(token));
  return tokens.join(" ").trim();
};

const collectPageCopyAliases = (page = {}) => {
  const aliases = new Set();
  for (const section of page.sections || []) {
    if (section?.sectionKind === "navigation" || section?.sectionKind === "footer") continue;
    const texts = collectTextNodes(section.rawSectionNode, [])
      .filter((entry) => entry.content.length <= 48)
      .sort((left, right) => Number(right.fontSize || 0) - Number(left.fontSize || 0))
      .slice(0, 6);
    for (const entry of texts) {
      const normalized = normalizeSemanticText(entry.content);
      if (!normalized || normalized.split(/\s+/).length > 6) continue;
      aliases.add(normalized);
    }
    if (aliases.size >= 8) break;
  }
  return aliases;
};

const buildEntrySemanticRecord = (entry, { siteId = "", siteName = "" } = {}) => {
  const words = siteTokens({ siteId, siteName });
  const aliasSet = new Set();
  const addAlias = (value = "") => {
    for (const variant of pluralVariants(value)) {
      if (variant) aliasSet.add(variant);
    }
  };

  addAlias(entry.pageName);
  addAlias(entry.pageId);
  addAlias(entry.pagePath);
  addAlias(entry.pageParam);
  addAlias(stripSiteWords(entry.pageName, words));
  addAlias(stripSiteWords(entry.pageId, words));
  addAlias(stripSiteWords(entry.pagePath, words));
  addAlias(stripSiteWords(slugify(entry.pageName).replace(/-/g, " "), words));
  for (const alias of entry.aliases || []) addAlias(alias);
  for (const alias of SITE_TYPE_ALIASES[String(entry.pageType || "").trim().toLowerCase()] || []) addAlias(alias);

  if (String(entry.pageParam || "") === "home") {
    addAlias(siteName);
    addAlias(siteId);
    const brand = stripSiteWords(siteName || siteId, []);
    if (brand) addAlias(`why ${brand}`);
  }

  for (const alias of collectPageCopyAliases(entry.page)) addAlias(alias);
  return {
    ...entry,
    semanticAliases: Array.from(aliasSet).filter(Boolean),
    semanticTokens: new Set(
      Array.from(aliasSet)
        .flatMap((alias) => tokenize(alias))
        .filter(Boolean)
    ),
  };
};

const scoreSemanticMatch = (segment = "", entryRecord, homeRecord = null) => {
  const normalized = normalizeSemanticText(segment);
  if (!normalized) return 0;
  if (entryRecord.semanticAliases.includes(normalized)) return 100;
  let best = 0;
  for (const alias of entryRecord.semanticAliases) {
    if (!alias || alias.length < 2) continue;
    if (normalized.includes(alias) || alias.includes(normalized)) {
      best = Math.max(best, alias.length >= 4 ? 86 : 76);
    }
  }
  const segmentTokens = new Set(tokenize(normalized));
  const overlap = Array.from(segmentTokens).filter((token) => entryRecord.semanticTokens.has(token));
  if (overlap.length) best = Math.max(best, 44 + overlap.length * 14);
  if (homeRecord && entryRecord.pageParam === "home") {
    const brandAlias = homeRecord.semanticAliases.find((alias) => alias && normalized.includes(alias));
    if (brandAlias) best = Math.max(best, 82);
  }
  return best;
};

const inferTextLinkItems = ({ textNodes = [], semanticEntries = [], homeRecord = null }) => {
  const grouped = [];
  const seenNodeTargets = new Set();

  for (const node of textNodes) {
    const items = [];
    const segments = splitLinkishText(node.content);
    if (segments.length <= 1 && !/^[A-Z][A-Z0-9 _-]+$/.test(node.content.trim()) && node.content.trim().length > 24) {
      continue;
    }
    for (const segment of segments.length ? segments : [node.content.trim()]) {
      const normalizedSegment = normalizeSemanticText(segment);
      if (!normalizedSegment || normalizedSegment.length < 2) continue;
      const matches = semanticEntries
        .map((entry) => ({ entry, score: scoreSemanticMatch(normalizedSegment, entry, homeRecord) }))
        .filter((candidate) => candidate.score >= 58)
        .sort((left, right) => right.score - left.score);
      const best = matches[0];
      if (!best) continue;
      const dedupeKey = `${node.id}::${best.entry.pageParam}`;
      if (seenNodeTargets.has(dedupeKey)) continue;
      seenNodeTargets.add(dedupeKey);
      items.push({
        label: segment.trim(),
        pageId: best.entry.pageId,
        pageParam: best.entry.pageParam,
        pagePath: best.entry.pagePath,
      });
    }
    if (items.length) {
      grouped.push({
        nodeId: node.id,
        content: node.content,
        items,
      });
    }
  }

  return grouped;
};

const chooseAnchorNodeId = (textNodes = [], sectionNodes = [], excludedIds = new Set(), preferMenu = false) => {
  const menuAnchor = sectionNodes.find(
    (node) => !excludedIds.has(node.id) && /menu|hamburger|toggle/i.test(`${node.id} ${node.name}`)
  )?.id;
  if (preferMenu && menuAnchor) return menuAnchor;
  const textAnchor =
    textNodes.find((node) => !excludedIds.has(node.id) && normalizeSemanticText(node.content).length <= 40)?.id ||
    textNodes.find((node) => !excludedIds.has(node.id))?.id;
  if (textAnchor) return textAnchor;
  if (menuAnchor) return menuAnchor;
  const brandAnchor = sectionNodes.find(
    (node) => !excludedIds.has(node.id) && /brand|logo/i.test(`${node.id} ${node.name}`)
  )?.id;
  if (brandAnchor) return brandAnchor;
  return sectionNodes.find((node) => !excludedIds.has(node.id))?.id || sectionNodes[0]?.id || "";
};

export const buildInteractionEnhancements = ({
  siteId = "",
  siteName = "",
  siteKey = "",
  page = {},
  pageEntries = [],
} = {}) => {
  const semanticEntries = pageEntries.map((entry) => buildEntrySemanticRecord(entry, { siteId, siteName }));
  const homeRecord = semanticEntries.find((entry) => entry.pageParam === "home") || null;
  const toSandboxUrl = (pageParam) =>
    `/creation/sandbox?mode=preview&siteKey=${encodeURIComponent(siteKey)}&page=${encodeURIComponent(pageParam)}`;

  const navSections = (page.sections || []).filter((section) => section?.sectionKind === "navigation");
  const footerSections = (page.sections || []).filter((section) => section?.sectionKind === "footer");
  const navTextNodes = navSections.flatMap((section) => collectTextNodes(section.rawSectionNode, []));
  const footerTextNodes = footerSections.flatMap((section) => collectTextNodes(section.rawSectionNode, []));
  const navRenderableNodes = navSections.flatMap((section) => collectRenderableNodes(section.rawSectionNode, []));
  const footerRenderableNodes = footerSections.flatMap((section) => collectRenderableNodes(section.rawSectionNode, []));

  const navGroups = inferTextLinkItems({ textNodes: navTextNodes, semanticEntries, homeRecord });
  const footerGroups = inferTextLinkItems({ textNodes: footerTextNodes, semanticEntries, homeRecord });

  const navCovered = new Set(navGroups.flatMap((group) => group.items.map((item) => item.pageParam)));
  const footerCovered = new Set(footerGroups.flatMap((group) => group.items.map((item) => item.pageParam)));
  const navGroupNodeIds = new Set(navGroups.map((group) => group.nodeId));
  const footerGroupNodeIds = new Set(footerGroups.map((group) => group.nodeId));

  const navEnhancements = navGroups.map((group) => ({
    type: "segment-links",
    location: "navigation",
    nodeId: group.nodeId,
    items: group.items.map((item) => ({
      label: item.label,
      href: toSandboxUrl(item.pageParam),
      pageParam: item.pageParam,
    })),
  }));
  const footerEnhancements = footerGroups.map((group) => ({
    type: "segment-links",
    location: "footer",
    nodeId: group.nodeId,
    items: group.items.map((item) => ({
      label: item.label,
      href: toSandboxUrl(item.pageParam),
      pageParam: item.pageParam,
    })),
  }));

  const missingFromNav = semanticEntries
    .filter((entry) => !navCovered.has(entry.pageParam))
    .map((entry) => entry.pageParam);
  const missingFromFooter = semanticEntries
    .filter((entry) => entry.pageParam !== "home" && !footerCovered.has(entry.pageParam))
    .map((entry) => entry.pageParam);

  const navAnchorNodeId = chooseAnchorNodeId(navTextNodes, navRenderableNodes, navGroupNodeIds, true);
  const footerAnchorNodeId = chooseAnchorNodeId(footerTextNodes, footerRenderableNodes, footerGroupNodeIds, false);

  const dropdownEnhancements = [];
  if (navAnchorNodeId && missingFromNav.length) {
    dropdownEnhancements.push({
      type: "menu",
      location: "navigation",
      nodeId: navAnchorNodeId,
      title: "All pages",
      items: semanticEntries
        .filter((entry) => missingFromNav.includes(entry.pageParam))
        .map((entry) => ({
          label: decodeEntities(entry.page.pageName || entry.pageName || entry.pageParam),
          href: toSandboxUrl(entry.pageParam),
          pageParam: entry.pageParam,
        })),
    });
  }
  if (footerAnchorNodeId && missingFromFooter.length) {
    dropdownEnhancements.push({
      type: "menu",
      location: "footer",
      nodeId: footerAnchorNodeId,
      title: "Site map",
      items: semanticEntries
        .filter((entry) => missingFromFooter.includes(entry.pageParam))
        .map((entry) => ({
          label: decodeEntities(entry.page.pageName || entry.pageName || entry.pageParam),
          href: toSandboxUrl(entry.pageParam),
          pageParam: entry.pageParam,
        })),
    });
  }

  return {
    enhancements: [...navEnhancements, ...footerEnhancements, ...dropdownEnhancements],
    coverage: {
      navigation: Array.from(new Set([...navCovered, ...(dropdownEnhancements.find((item) => item.location === "navigation")?.items || []).map((item) => item.pageParam)])).sort(),
      footer: Array.from(new Set([...footerCovered, ...(dropdownEnhancements.find((item) => item.location === "footer")?.items || []).map((item) => item.pageParam)])).sort(),
    },
    stats: {
      inferredNavGroupCount: navGroups.length,
      inferredFooterGroupCount: footerGroups.length,
      navMenuInjected: dropdownEnhancements.some((item) => item.location === "navigation"),
      footerMenuInjected: dropdownEnhancements.some((item) => item.location === "footer"),
      missingFromNav,
      missingFromFooter,
    },
  };
};

export const resolveVariantTemplatePath = (outDir, siteId, variant) =>
  path.join(outDir, "sites", siteId, "variants", variant, "template.json");
