#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_SOURCE_DIR = "/Users/beihuang/Documents/opencode/shpitto_tools/pen";
const DEFAULT_OUT_DIR = path.resolve(
  "/Users/beihuang/.codex/worktrees/266d/shpitto_tools/template-factory/generated/pen-site-templates"
);

const FILE_ALIAS_MAP = new Map([
  ["carbon3d", ["carbon"]],
  ["nothing-tech", ["nothing"]],
  ["teenage-engineering", ["teenage"]],
  ["pamamachinetools", ["pamama", "pama"]],
  ["fptindustrie", ["fpt"]],
  ["ridecake", ["ridecake"]],
  ["pagani", ["pagani"]],
  ["breton", ["breton"]],
  ["analogue", ["analogue"]],
  ["vanmoof", ["vanmoof"]],
  ["transpa-rent", ["transpa-rent"]],
]);

const PAGE_TYPE_RULES = [
  { type: "home", re: /(^|[-_\s])home(page)?($|[-_\s])/i },
  { type: "contact", re: /contact|support|dealer|dealers/i },
  { type: "about", re: /about|company|history|story/i },
  { type: "blog", re: /blog|news|journal|insight|resources/i },
  { type: "downloads", re: /download|guide|manual|docs?/i },
  { type: "catalog", re: /products?|platform|audio|phones|accessories|industries|technology|services|designs?/i },
  { type: "product-detail", re: /utopia|huayra|zonda|puro|tx-6|op-xy|phone|headphone|ear|hydra|kappa|printer|backpack/i },
  { type: "legal", re: /privacy|terms|policy/i },
];

const SECTION_KIND_RULES = [
  { kind: "navigation", re: /nav|header|menu|categories/i },
  { kind: "hero", re: /^hero$|hero/i },
  { kind: "footer", re: /footer/i },
  { kind: "contact", re: /contact|support|form/i },
  { kind: "cta", re: /\bcta\b|call.to.action|banner/i },
  { kind: "products", re: /products?|featured|catalog|cards|categories/i },
  { kind: "story", re: /history|story|about|insight|past|present|future|downloads|guides|designs/i },
];

const BLOCK_ROLE_RULES = [
  { role: "image", re: /image|photo|logo|bg$/i },
  { role: "button", re: /cta|button|btn/i },
  { role: "title", re: /title|headline/i },
  { role: "subtitle", re: /sub|desc|copy|body/i },
  { role: "navigation", re: /nav|menu|header/i },
];

const IMAGE_FILL_KEYS = new Set(["url", "mode", "enabled", "type"]);

const slugify = (input = "") =>
  String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";

const titleCase = (value = "") =>
  String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

const writeJson = async (filePath, data) => {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
};

const incrementMap = (map, rawValue) => {
  const value = String(rawValue ?? "").trim();
  if (!value) return;
  map.set(value, (map.get(value) || 0) + 1);
};

const normalizeColor = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("#")) return raw.toUpperCase();
  return raw;
};

const sortCountEntries = (map) =>
  Array.from(map.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

const pickRule = (rules, text, fallback) => {
  const value = String(text || "");
  for (const rule of rules) {
    if (rule.re.test(value)) return rule.type || rule.kind || rule.role;
  }
  return fallback;
};

const tokenName = (prefix, index) => `${prefix}${String(index + 1).padStart(2, "0")}`;

const buildTokenGroup = (entries, prefix, formatter = (value) => value) => {
  const tokens = {};
  const refMap = new Map();
  entries.forEach(([value, count], index) => {
    const key = tokenName(prefix, index);
    tokens[key] = {
      value: formatter(value),
      raw: value,
      usageCount: count,
    };
    refMap.set(value, key);
  });
  return { tokens, refMap };
};

const safeRelPath = (baseDir, filePath) => {
  if (!filePath) return "";
  return path.relative(baseDir, filePath).split(path.sep).join("/");
};

const guessSiteAliases = (siteId) => {
  const aliases = new Set([siteId, slugify(siteId)]);
  for (const alias of FILE_ALIAS_MAP.get(siteId) || []) {
    aliases.add(alias);
  }
  if (siteId.endsWith("-tech")) aliases.add(siteId.replace(/-tech$/, ""));
  if (siteId.endsWith("engineering")) aliases.add("teenage");
  return Array.from(aliases).filter(Boolean);
};

const detectPageType = (page) => {
  const sample = `${page.id || ""} ${page.name || ""}`;
  return pickRule(PAGE_TYPE_RULES, sample, "generic");
};

const detectSectionKind = (section) => {
  const sample = `${section.id || ""} ${section.name || ""}`;
  return pickRule(SECTION_KIND_RULES, sample, "generic");
};

const detectBlockRole = (node) => {
  const sample = `${node.id || ""} ${node.name || ""}`;
  if (node.type === "text") return pickRule(BLOCK_ROLE_RULES, sample, "text");
  if (node.type === "frame") return pickRule(BLOCK_ROLE_RULES, sample, "container");
  if (node.type === "rectangle" || node.type === "ellipse") {
    if (node.fill && typeof node.fill === "object" && node.fill.type === "image") return "image";
    return pickRule(BLOCK_ROLE_RULES, sample, "shape");
  }
  return pickRule(BLOCK_ROLE_RULES, sample, node.type || "node");
};

const buildAssetIndex = async (sourceDir) => {
  const root = path.join(sourceDir, "assets-structured");
  const byAlias = new Map();
  const globalByBasename = new Map();

  const walk = async (dirPath, currentAlias = "") => {
    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const abs = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const alias = currentAlias || entry.name;
        await walk(abs, alias);
        continue;
      }
      const basename = path.basename(entry.name);
      if (!byAlias.has(currentAlias)) byAlias.set(currentAlias, new Map());
      byAlias.get(currentAlias).set(basename, abs);
      if (!globalByBasename.has(basename)) globalByBasename.set(basename, []);
      globalByBasename.get(basename).push(abs);
    }
  };

  await walk(root);
  return { byAlias, globalByBasename };
};

const resolveAssetPath = async ({ rawUrl, siteId, assetIndex, sourceDir }) => {
  const raw = String(rawUrl || "").trim();
  if (!raw) return { rawUrl: raw, resolvedPath: "", relativePath: "", exists: false };

  const directExists = await fs
    .access(raw)
    .then(() => true)
    .catch(() => false);
  if (directExists) {
    return {
      rawUrl: raw,
      resolvedPath: raw,
      relativePath: safeRelPath(sourceDir, raw),
      exists: true,
    };
  }

  const basename = path.basename(raw);
  for (const alias of guessSiteAliases(siteId)) {
    const match = assetIndex.byAlias.get(alias)?.get(basename);
    if (match) {
      return {
        rawUrl: raw,
        resolvedPath: match,
        relativePath: safeRelPath(sourceDir, match),
        exists: true,
      };
    }
  }
  const fallback = assetIndex.globalByBasename.get(basename)?.[0] || "";
  return {
    rawUrl: raw,
    resolvedPath: fallback,
    relativePath: fallback ? safeRelPath(sourceDir, fallback) : "",
    exists: Boolean(fallback),
  };
};

const collectStatsFromNode = (node, stats) => {
  if (!node || typeof node !== "object") return;
  if (typeof node.fill === "string") incrementMap(stats.colors, normalizeColor(node.fill));
  if (node.fill && typeof node.fill === "object" && node.fill.type !== "image") {
    for (const [key, value] of Object.entries(node.fill)) {
      if (!IMAGE_FILL_KEYS.has(key)) incrementMap(stats.colors, normalizeColor(value));
    }
  }
  if (node.stroke?.fill) incrementMap(stats.colors, normalizeColor(node.stroke.fill));
  if (node.type === "text") {
    incrementMap(stats.textColors, normalizeColor(node.fill));
    incrementMap(stats.fontFamilies, node.fontFamily);
    incrementMap(stats.fontSizes, String(node.fontSize || ""));
    incrementMap(stats.fontWeights, String(node.fontWeight || ""));
  }
  if (typeof node.cornerRadius === "number") incrementMap(stats.radii, String(node.cornerRadius));
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectStatsFromNode(child, stats);
  }
};

const buildTheme = (siteId, stats) => {
  const colorEntries = sortCountEntries(stats.colors);
  const textColorEntries = sortCountEntries(stats.textColors);
  const fontFamilyEntries = sortCountEntries(stats.fontFamilies);
  const fontSizeEntries = sortCountEntries(stats.fontSizes);
  const fontWeightEntries = sortCountEntries(stats.fontWeights);
  const radiusEntries = sortCountEntries(stats.radii);

  const colors = buildTokenGroup(colorEntries, "color");
  const textColors = buildTokenGroup(textColorEntries, "text");
  const fontFamilies = buildTokenGroup(fontFamilyEntries, "family");
  const fontSizes = buildTokenGroup(fontSizeEntries, "size", (value) => Number(value));
  const fontWeights = buildTokenGroup(fontWeightEntries, "weight");
  const radii = buildTokenGroup(radiusEntries, "radius", (value) => Number(value));

  const backgroundColor = colorEntries[0]?.[0] || "";
  const textPrimary = textColorEntries[0]?.[0] || "";
  const textSecondary = textColorEntries[1]?.[0] || textPrimary;
  const accent = colorEntries.find(([value]) => value !== backgroundColor && value !== textPrimary)?.[0] || "";

  return {
    schemaVersion: "pen-site-theme.v1",
    siteId,
    tokens: {
      color: { palette: colors.tokens },
      textColor: { palette: textColors.tokens },
      fontFamily: { palette: fontFamilies.tokens },
      fontSize: { palette: fontSizes.tokens },
      fontWeight: { palette: fontWeights.tokens },
      radius: { palette: radii.tokens },
    },
    skinSlots: {
      background: backgroundColor ? `color.palette.${colors.refMap.get(backgroundColor)}` : "",
      textPrimary: textPrimary ? `textColor.palette.${textColors.refMap.get(textPrimary)}` : "",
      textSecondary: textSecondary ? `textColor.palette.${textColors.refMap.get(textSecondary)}` : "",
      accent: accent ? `color.palette.${colors.refMap.get(accent)}` : "",
      fontPrimary:
        fontFamilyEntries[0]?.[0] ? `fontFamily.palette.${fontFamilies.refMap.get(fontFamilyEntries[0][0])}` : "",
      fontSecondary:
        fontFamilyEntries[1]?.[0]
          ? `fontFamily.palette.${fontFamilies.refMap.get(fontFamilyEntries[1][0])}`
          : fontFamilyEntries[0]?.[0]
            ? `fontFamily.palette.${fontFamilies.refMap.get(fontFamilyEntries[0][0])}`
            : "",
    },
    stats: {
      colorCount: colorEntries.length,
      textColorCount: textColorEntries.length,
      fontFamilyCount: fontFamilyEntries.length,
      fontSizeCount: fontSizeEntries.length,
      radiusCount: radiusEntries.length,
    },
    refMaps: {
      color: colors.refMap,
      textColor: textColors.refMap,
      fontFamily: fontFamilies.refMap,
      fontSize: fontSizes.refMap,
      fontWeight: fontWeights.refMap,
      radius: radii.refMap,
    },
  };
};

const buildStyleRefs = (node, theme) => {
  const refs = {};
  const style = {};

  if (typeof node.fill === "string") {
    const normalized = normalizeColor(node.fill);
    style.fill = normalized;
    const key = theme.refMaps.color.get(normalized);
    if (key) refs.fill = `color.palette.${key}`;
  } else if (node.fill && typeof node.fill === "object" && node.fill.type === "image") {
    style.fill = { type: "image", mode: node.fill.mode || "fill" };
  }

  if (node.stroke?.fill) {
    const normalized = normalizeColor(node.stroke.fill);
    style.stroke = { color: normalized, thickness: node.stroke.thickness || 1 };
    const key = theme.refMaps.color.get(normalized);
    if (key) refs.strokeColor = `color.palette.${key}`;
  }

  if (node.type === "text") {
    style.typography = {
      fill: normalizeColor(node.fill),
      fontFamily: node.fontFamily || "",
      fontSize: node.fontSize || 0,
      fontWeight: node.fontWeight || "",
      letterSpacing: node.letterSpacing || "",
      textAlign: node.textAlign || "",
      textAlignVertical: node.textAlignVertical || "",
    };
    const textColorKey = theme.refMaps.textColor.get(style.typography.fill);
    const fontFamilyKey = theme.refMaps.fontFamily.get(style.typography.fontFamily);
    const fontSizeKey = theme.refMaps.fontSize.get(String(style.typography.fontSize));
    const fontWeightKey = theme.refMaps.fontWeight.get(String(style.typography.fontWeight));
    if (textColorKey) refs.textColor = `textColor.palette.${textColorKey}`;
    if (fontFamilyKey) refs.fontFamily = `fontFamily.palette.${fontFamilyKey}`;
    if (fontSizeKey) refs.fontSize = `fontSize.palette.${fontSizeKey}`;
    if (fontWeightKey) refs.fontWeight = `fontWeight.palette.${fontWeightKey}`;
  }

  if (typeof node.cornerRadius === "number") {
    style.cornerRadius = node.cornerRadius;
    const radiusKey = theme.refMaps.radius.get(String(node.cornerRadius));
    if (radiusKey) refs.cornerRadius = `radius.palette.${radiusKey}`;
  }

  if (node.layout) style.layout = node.layout;
  return { style, refs };
};

const normalizeNode = async ({ node, siteId, theme, assetIndex, sourceDir }) => {
  const { style, refs } = buildStyleRefs(node, theme);
  const normalized = {
    id: node.id || "",
    name: node.name || "",
    type: node.type || "node",
    role: detectBlockRole(node),
    bounds: {
      x: Number(node.x || 0),
      y: Number(node.y || 0),
      width: Number(node.width || 0),
      height: Number(node.height || 0),
    },
    href: node.href || "",
    content: node.type === "text" ? node.content || "" : "",
    style,
    tokenRefs: refs,
  };

  if (node.fill && typeof node.fill === "object" && node.fill.type === "image") {
    normalized.asset = {
      ...(await resolveAssetPath({ rawUrl: node.fill.url, siteId, assetIndex, sourceDir })),
      mode: node.fill.mode || "fill",
    };
  }

  if (Array.isArray(node.children) && node.children.length) {
    normalized.children = [];
    for (const child of node.children) {
      normalized.children.push(await normalizeNode({ node: child, siteId, theme, assetIndex, sourceDir }));
    }
  }

  return normalized;
};

const extractDevicePages = async ({ doc, device, siteId, theme, assetIndex, sourceDir }) => {
  const pages = [];
  for (const [index, pageNode] of (doc.children || []).entries()) {
    const pageKey = slugify((pageNode.id || "").replace(/^page-/, "") || pageNode.name || `page-${index + 1}`);
    const sectionNodes = Array.isArray(pageNode.children)
      ? pageNode.children.filter((child) => child.type === "frame")
      : [];
    const supportNodes = Array.isArray(pageNode.children)
      ? pageNode.children.filter((child) => child.type !== "frame")
      : [];

    const page = {
      device,
      index,
      pageId: pageNode.id || pageKey,
      pageKey,
      pageName: pageNode.name || titleCase(pageKey),
      pageType: detectPageType(pageNode),
      bounds: {
        width: Number(pageNode.width || 0),
        height: Number(pageNode.height || 0),
      },
      sections: [],
      supportBlocks: [],
    };

    for (const sectionNode of sectionNodes) {
      const section = {
        sectionId: sectionNode.id || slugify(sectionNode.name || "section"),
        sectionName: sectionNode.name || titleCase(sectionNode.id || "section"),
        sectionKind: detectSectionKind(sectionNode),
        bounds: {
          x: Number(sectionNode.x || 0),
          y: Number(sectionNode.y || 0),
          width: Number(sectionNode.width || 0),
          height: Number(sectionNode.height || 0),
        },
        blockCount: Array.isArray(sectionNode.children) ? sectionNode.children.length : 0,
        blockTree: await normalizeNode({ node: sectionNode, siteId, theme, assetIndex, sourceDir }),
      };
      page.sections.push(section);
    }

    for (const supportNode of supportNodes) {
      page.supportBlocks.push(await normalizeNode({ node: supportNode, siteId, theme, assetIndex, sourceDir }));
    }

    pages.push(page);
  }
  return pages;
};

const mergeDevicePages = (desktopPages, mobilePages) => {
  const pageMap = new Map();
  const registerPage = (devicePage) => {
    if (!pageMap.has(devicePage.pageKey)) {
      pageMap.set(devicePage.pageKey, {
        pageId: devicePage.pageId,
        pageKey: devicePage.pageKey,
        pageName: devicePage.pageName,
        pageType: devicePage.pageType,
        order: {},
        devices: {},
        sections: new Map(),
      });
    }
    const merged = pageMap.get(devicePage.pageKey);
    merged.pageName = merged.pageName || devicePage.pageName;
    if (merged.pageType === "generic" && devicePage.pageType !== "generic") {
      merged.pageType = devicePage.pageType;
    }
    merged.order[devicePage.device] = devicePage.index;
    merged.devices[devicePage.device] = {
      bounds: devicePage.bounds,
      supportBlocks: devicePage.supportBlocks,
    };
    for (const [sectionIndex, section] of devicePage.sections.entries()) {
      const sectionKey = slugify(section.sectionId || section.sectionName);
      if (!merged.sections.has(sectionKey)) {
        merged.sections.set(sectionKey, {
          sectionId: section.sectionId,
          sectionKey,
          sectionName: section.sectionName,
          sectionKind: section.sectionKind,
          order: {},
          devices: {},
        });
      }
      const mergedSection = merged.sections.get(sectionKey);
      if (mergedSection.sectionKind === "generic" && section.sectionKind !== "generic") {
        mergedSection.sectionKind = section.sectionKind;
      }
      mergedSection.order[devicePage.device] = sectionIndex;
      mergedSection.devices[devicePage.device] = {
        bounds: section.bounds,
        blockCount: section.blockCount,
        blockTree: section.blockTree,
      };
    }
  };

  desktopPages.forEach(registerPage);
  mobilePages.forEach(registerPage);

  return Array.from(pageMap.values())
    .map((page) => ({
      pageId: page.pageId,
      pageKey: page.pageKey,
      pageName: page.pageName,
      pageType: page.pageType,
      devices: page.devices,
      sections: Array.from(page.sections.values()).sort((a, b) => {
        const aOrder = a.order.desktop ?? a.order.mobile ?? 999;
        const bOrder = b.order.desktop ?? b.order.mobile ?? 999;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.sectionName.localeCompare(b.sectionName);
      }),
    }))
    .sort((a, b) => {
      const aOrder = a.devices.desktop ? desktopPages.find((page) => page.pageKey === a.pageKey)?.index ?? 999 : 999;
      const bOrder = b.devices.desktop ? desktopPages.find((page) => page.pageKey === b.pageKey)?.index ?? 999 : 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.pageName.localeCompare(b.pageName);
    });
};

const collectBlockCatalogEntry = (node, catalog, base) => {
  if (!node) return;
  const key = `${node.type}:${node.role}`;
  if (!catalog.has(key)) {
    catalog.set(key, {
      blockType: node.type,
      role: node.role,
      usageCount: 0,
      samples: [],
    });
  }
  const entry = catalog.get(key);
  entry.usageCount += 1;
  if (entry.samples.length < 8) {
    entry.samples.push(base);
  }
  for (const child of node.children || []) {
    collectBlockCatalogEntry(child, catalog, base);
  }
};

const collectPenPairs = async (sourceDir) => {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const pairs = new Map();
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".pen")) continue;
    const base = entry.name.replace(/\.pen$/i, "");
    const isMobile = base.endsWith("-mobile");
    const siteId = isMobile ? base.replace(/-mobile$/, "") : base;
    if (!pairs.has(siteId)) pairs.set(siteId, { siteId, desktop: "", mobile: "" });
    const item = pairs.get(siteId);
    if (isMobile) item.mobile = path.join(sourceDir, entry.name);
    else item.desktop = path.join(sourceDir, entry.name);
  }
  return Array.from(pairs.values()).sort((a, b) => a.siteId.localeCompare(b.siteId));
};

const buildSiteTemplate = async ({ pair, assetIndex, sourceDir }) => {
  const desktopDoc = await readJson(pair.desktop);
  const mobileDoc = await readJson(pair.mobile);

  const stats = {
    colors: new Map(),
    textColors: new Map(),
    fontFamilies: new Map(),
    fontSizes: new Map(),
    fontWeights: new Map(),
    radii: new Map(),
  };

  for (const pageNode of [...(desktopDoc.children || []), ...(mobileDoc.children || [])]) {
    collectStatsFromNode(pageNode, stats);
  }

  const theme = buildTheme(pair.siteId, stats);
  const desktopPages = await extractDevicePages({
    doc: desktopDoc,
    device: "desktop",
    siteId: pair.siteId,
    theme,
    assetIndex,
    sourceDir,
  });
  const mobilePages = await extractDevicePages({
    doc: mobileDoc,
    device: "mobile",
    siteId: pair.siteId,
    theme,
    assetIndex,
    sourceDir,
  });

  const pages = mergeDevicePages(desktopPages, mobilePages);
  const blockCatalog = new Map();
  const sectionCatalog = [];

  for (const page of pages) {
    for (const section of page.sections) {
      const devices = Object.keys(section.devices);
      sectionCatalog.push({
        siteId: pair.siteId,
        pageKey: page.pageKey,
        pageType: page.pageType,
        sectionKey: section.sectionKey,
        sectionId: section.sectionId,
        sectionName: section.sectionName,
        sectionKind: section.sectionKind,
        devices,
        desktopBlockCount: section.devices.desktop?.blockCount || 0,
        mobileBlockCount: section.devices.mobile?.blockCount || 0,
      });
      for (const device of devices) {
        collectBlockCatalogEntry(section.devices[device].blockTree, blockCatalog, {
          siteId: pair.siteId,
          pageKey: page.pageKey,
          sectionKey: section.sectionKey,
          device,
        });
      }
    }
  }

  return {
    schemaVersion: "pen-site-template.v1",
    generatedAt: new Date().toISOString(),
    siteId: pair.siteId,
    siteName: titleCase(pair.siteId),
    source: {
      desktopPen: pair.desktop,
      mobilePen: pair.mobile,
      sourceDir,
    },
    theme: {
      schemaVersion: theme.schemaVersion,
      siteId: theme.siteId,
      tokens: theme.tokens,
      skinSlots: theme.skinSlots,
      stats: theme.stats,
    },
    counts: {
      pages: pages.length,
      sections: sectionCatalog.length,
      blockKinds: blockCatalog.size,
    },
    pages,
    catalogs: {
      sections: sectionCatalog,
      blocks: Array.from(blockCatalog.values()).sort((a, b) => b.usageCount - a.usageCount),
    },
  };
};

const main = async () => {
  const sourceDir = path.resolve(process.argv[2] || DEFAULT_SOURCE_DIR);
  const outDir = path.resolve(process.argv[3] || DEFAULT_OUT_DIR);

  const pairs = await collectPenPairs(sourceDir);
  const pairedSites = pairs.filter((pair) => pair.desktop && pair.mobile);
  const skippedSites = pairs
    .filter((pair) => !pair.desktop || !pair.mobile)
    .map((pair) => ({
      siteId: pair.siteId,
      missingDesktop: !pair.desktop,
      missingMobile: !pair.mobile,
    }));

  const assetIndex = await buildAssetIndex(sourceDir);

  const siteManifest = [];
  const pageCatalog = [];
  const sectionCatalog = [];
  const blockCatalog = new Map();

  await ensureDir(outDir);
  await ensureDir(path.join(outDir, "sites"));

  for (const pair of pairedSites) {
    const template = await buildSiteTemplate({ pair, assetIndex, sourceDir });
    const siteDir = path.join(outDir, "sites", pair.siteId);
    await ensureDir(path.join(siteDir, "pages"));

    await writeJson(path.join(siteDir, "site.template.json"), template);
    await writeJson(path.join(siteDir, "theme.tokens.json"), template.theme);

    for (const page of template.pages) {
      await writeJson(path.join(siteDir, "pages", `${page.pageKey}.json`), page);
      pageCatalog.push({
        siteId: template.siteId,
        pageKey: page.pageKey,
        pageName: page.pageName,
        pageType: page.pageType,
        devices: Object.keys(page.devices),
        sectionCount: page.sections.length,
      });
      for (const section of page.sections) {
        sectionCatalog.push({
          siteId: template.siteId,
          pageKey: page.pageKey,
          pageType: page.pageType,
          sectionKey: section.sectionKey,
          sectionName: section.sectionName,
          sectionKind: section.sectionKind,
          devices: Object.keys(section.devices),
        });
      }
    }

    for (const block of template.catalogs.blocks) {
      const key = `${block.blockType}:${block.role}`;
      if (!blockCatalog.has(key)) {
        blockCatalog.set(key, {
          blockType: block.blockType,
          role: block.role,
          usageCount: 0,
          samples: [],
        });
      }
      const merged = blockCatalog.get(key);
      merged.usageCount += block.usageCount;
      for (const sample of block.samples) {
        if (merged.samples.length >= 16) break;
        merged.samples.push(sample);
      }
    }

    siteManifest.push({
      siteId: template.siteId,
      siteName: template.siteName,
      pages: template.counts.pages,
      sections: template.counts.sections,
      blockKinds: template.counts.blockKinds,
      themeSkinSlots: template.theme.skinSlots,
      output: {
        siteTemplate: safeRelPath(outDir, path.join(siteDir, "site.template.json")),
        themeTokens: safeRelPath(outDir, path.join(siteDir, "theme.tokens.json")),
      },
    });
  }

  await writeJson(path.join(outDir, "site-manifest.json"), {
    schemaVersion: "pen-site-template-manifest.v1",
    generatedAt: new Date().toISOString(),
    sourceDir,
    pairedSiteCount: pairedSites.length,
    skippedSiteCount: skippedSites.length,
    sites: siteManifest,
    skippedSites,
  });

  await writeJson(path.join(outDir, "page-catalog.json"), {
    schemaVersion: "pen-page-catalog.v1",
    generatedAt: new Date().toISOString(),
    entries: pageCatalog,
  });

  await writeJson(path.join(outDir, "section-catalog.json"), {
    schemaVersion: "pen-section-catalog.v1",
    generatedAt: new Date().toISOString(),
    entries: sectionCatalog,
  });

  await writeJson(path.join(outDir, "block-catalog.json"), {
    schemaVersion: "pen-block-catalog.v1",
    generatedAt: new Date().toISOString(),
    entries: Array.from(blockCatalog.values()).sort((a, b) => b.usageCount - a.usageCount),
  });

  console.log(
    JSON.stringify(
      {
        sourceDir,
        outDir,
        pairedSites: pairedSites.map((item) => item.siteId),
        skippedSites,
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
