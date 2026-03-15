import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(SCRIPT_DIR, "../..");
export const LEGACY_SOURCE_DIR = "/Users/beihuang/Documents/opencode/shpitto_tools/pen";
export const DEFAULT_SOURCE_DIR = process.env.PEN_SOURCE_DIR || LEGACY_SOURCE_DIR;
export const DEFAULT_OUT_DIR = path.resolve(
  process.env.PEN_EXACT_OUT_DIR || path.join(REPO_ROOT, "template-factory/generated/pen-exact-templates")
);

const PAGE_TYPE_RULES = [
  { type: "home", re: /(^|[-_\s])home(page)?($|[-_\s])/i },
  { type: "contact", re: /contact|support|dealer|dealers/i },
  { type: "about", re: /about|company|history|story|application/i },
  { type: "blog", re: /blog|news|journal|insight|resources/i },
  { type: "downloads", re: /download|guide|manual|docs?/i },
  { type: "catalog", re: /products?|platform|audio|phones|accessories|industries|technology|services|designs?/i },
  { type: "product-detail", re: /utopia|huayra|zonda|puro|tx-6|op-xy|phone|headphone|ear|hydra|kappa|printer|backpack/i },
  { type: "legal", re: /privacy|terms|policy/i },
];

const SECTION_KIND_RULES = [
  { kind: "navigation", re: /nav|header|menu|announcement|categories/i },
  { kind: "hero", re: /^hero\d*$|hero/i },
  { kind: "footer", re: /footer/i },
  { kind: "contact", re: /contact|support|form/i },
  { kind: "cta", re: /\bcta\b|call.to.action|banner/i },
  { kind: "products", re: /products?|featured|catalog|cards|categories/i },
  { kind: "story", re: /history|story|about|insight|past|present|future|downloads|guides|designs|application/i },
];

const BLOCK_ROLE_RULES = [
  { role: "image", re: /image|photo|logo|bg$/i },
  { role: "button", re: /cta|button|btn/i },
  { role: "title", re: /title|headline/i },
  { role: "subtitle", re: /sub|desc|copy|body/i },
  { role: "navigation", re: /nav|menu|header/i },
];

const FILE_ALIAS_MAP = new Map([
  ["carbon3d", ["carbon"]],
  ["nothing-tech", ["nothing"]],
  ["teenage-engineering", ["teenage"]],
  ["pamamachinetools", ["pamama", "pama"]],
  ["fptindustrie", ["fpt"]],
]);

const IMAGE_FILL_KEYS = new Set(["url", "mode", "enabled", "type"]);

export const slugify = (input = "") =>
  String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";

export const titleCase = (value = "") =>
  String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

export const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

export const writeJson = async (filePath, data) => {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
};

export const normalizeColor = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("#")) return raw.toUpperCase();
  return raw;
};

export const incrementMap = (map, rawValue) => {
  const value = String(rawValue ?? "").trim();
  if (!value) return;
  map.set(value, (map.get(value) || 0) + 1);
};

const sortObjectDeep = (value) => {
  if (Array.isArray(value)) return value.map(sortObjectDeep);
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const key of Object.keys(value).sort()) {
    out[key] = sortObjectDeep(value[key]);
  }
  return out;
};

export const stableHash = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(sortObjectDeep(value))).digest("hex");

const pickRule = (rules, text, fallback) => {
  const value = String(text || "");
  for (const rule of rules) {
    if (rule.re.test(value)) return rule.type || rule.kind;
  }
  return fallback;
};

export const parsePenIdentity = (filePath) => {
  const baseName = path.basename(filePath, ".pen");
  const isMobile = baseName.endsWith("-mobile");
  const siteId = isMobile ? baseName.replace(/-mobile$/, "") : baseName;
  return {
    fileName: `${baseName}.pen`,
    penKey: slugify(baseName),
    siteId,
    siteName: titleCase(siteId),
    variant: isMobile ? "mobile" : "desktop",
    variantKey: isMobile ? "mobile" : "desktop",
  };
};

export const detectPageType = (pageNode) =>
  pickRule(PAGE_TYPE_RULES, `${pageNode?.id || ""} ${pageNode?.name || ""}`, "generic");

export const detectSectionKind = (sectionNode) =>
  pickRule(SECTION_KIND_RULES, `${sectionNode?.id || ""} ${sectionNode?.name || ""}`, "generic");

export const detectBlockRole = (node) => {
  const sample = `${node?.id || ""} ${node?.name || ""}`;
  if (node?.type === "text") return pickRule(BLOCK_ROLE_RULES, sample, "text");
  if (node?.type === "frame") return pickRule(BLOCK_ROLE_RULES, sample, "container");
  if (node?.type === "rectangle" || node?.type === "ellipse") {
    if (node?.fill && typeof node.fill === "object" && node.fill.type === "image") return "image";
    return pickRule(BLOCK_ROLE_RULES, sample, "shape");
  }
  return pickRule(BLOCK_ROLE_RULES, sample, String(node?.type || "node"));
};

export const countNodes = (node) => {
  if (!node || typeof node !== "object") return 0;
  const children = Array.isArray(node.children) ? node.children : [];
  return 1 + children.reduce((sum, child) => sum + countNodes(child), 0);
};

export const countNodesList = (nodes = []) => (Array.isArray(nodes) ? nodes.reduce((sum, node) => sum + countNodes(node), 0) : 0);

export const summarizeNode = (node) => ({
  id: String(node?.id || ""),
  name: String(node?.name || ""),
  type: String(node?.type || ""),
  width: typeof node?.width === "number" ? node.width : String(node?.width || ""),
  height: typeof node?.height === "number" ? node.height : String(node?.height || ""),
});

export const summarizeBounds = (node) => ({
  x: Number(node?.x || 0),
  y: Number(node?.y || 0),
  width: typeof node?.width === "number" ? node.width : String(node?.width || ""),
  height: typeof node?.height === "number" ? node.height : String(node?.height || ""),
});

export const collectStatsFromNode = (node, stats) => {
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

const sortCountEntries = (map) =>
  Array.from(map.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

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

export const buildThemeFromDoc = (siteId, doc) => {
  const stats = {
    colors: new Map(),
    textColors: new Map(),
    fontFamilies: new Map(),
    fontSizes: new Map(),
    fontWeights: new Map(),
    radii: new Map(),
  };
  for (const node of Array.isArray(doc?.children) ? doc.children : []) {
    collectStatsFromNode(node, stats);
  }

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
    schemaVersion: "pen-exact-theme.v1",
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
      fontWeightCount: fontWeightEntries.length,
      radiusCount: radiusEntries.length,
    },
  };
};

export const guessSiteAliases = (siteId) => {
  const aliases = new Set([siteId, slugify(siteId)]);
  for (const alias of FILE_ALIAS_MAP.get(siteId) || []) aliases.add(alias);
  if (siteId.endsWith("-tech")) aliases.add(siteId.replace(/-tech$/, ""));
  return Array.from(aliases).filter(Boolean);
};

export const buildAssetIndex = async (sourceDir) => {
  const roots = [path.join(sourceDir, "assets-structured"), path.join(sourceDir, "assets-mobile")];
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
        await walk(abs, currentAlias || entry.name);
        continue;
      }
      const basename = path.basename(entry.name);
      if (!byAlias.has(currentAlias)) byAlias.set(currentAlias, new Map());
      byAlias.get(currentAlias).set(basename, abs);
      if (!globalByBasename.has(basename)) globalByBasename.set(basename, []);
      globalByBasename.get(basename).push(abs);
    }
  };

  for (const root of roots) {
    await walk(root);
  }
  return { byAlias, globalByBasename };
};

export const resolveAssetPath = async ({ rawUrl, siteId, assetIndex, sourceDir }) => {
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
      relativePath: path.relative(sourceDir, raw).split(path.sep).join("/"),
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
        relativePath: path.relative(sourceDir, match).split(path.sep).join("/"),
        exists: true,
      };
    }
  }
  const fallback = assetIndex.globalByBasename.get(basename)?.[0] || "";
  return {
    rawUrl: raw,
    resolvedPath: fallback,
    relativePath: fallback ? path.relative(sourceDir, fallback).split(path.sep).join("/") : "",
    exists: Boolean(fallback),
  };
};

const collectImageAssets = async ({ node, siteId, assetIndex, sourceDir, assets }) => {
  if (!node || typeof node !== "object") return;
  if (node.fill && typeof node.fill === "object" && node.fill.type === "image" && node.fill.url) {
    assets.push(
      await resolveAssetPath({
        rawUrl: node.fill.url,
        siteId,
        assetIndex,
        sourceDir,
      })
    );
  }
  for (const child of Array.isArray(node.children) ? node.children : []) {
    await collectImageAssets({ node: child, siteId, assetIndex, sourceDir, assets });
  }
};

const buildNodeAssetRef = async ({ node, siteId, assetIndex, sourceDir }) => {
  if (!node?.fill || typeof node.fill !== "object" || node.fill.type !== "image" || !node.fill.url) return null;
  return {
    ...(await resolveAssetPath({
      rawUrl: node.fill.url,
      siteId,
      assetIndex,
      sourceDir,
    })),
    mode: node.fill.mode || "fill",
  };
};

const buildSectionIndex = (sectionNode, order) => ({
  sectionId: String(sectionNode?.id || ""),
  sectionName: String(sectionNode?.name || ""),
  sectionKind: detectSectionKind(sectionNode),
  order,
  bounds: summarizeBounds(sectionNode),
  directChildCount: Array.isArray(sectionNode?.children) ? sectionNode.children.length : 0,
  recursiveNodeCount: countNodes(sectionNode),
  treeHash: stableHash(sectionNode),
});

const buildBlockIndex = (blockNode, order) => ({
  blockId: String(blockNode?.id || ""),
  blockName: String(blockNode?.name || ""),
  blockType: String(blockNode?.type || ""),
  blockRole: detectBlockRole(blockNode),
  order,
  bounds: summarizeBounds(blockNode),
  directChildCount: Array.isArray(blockNode?.children) ? blockNode.children.length : 0,
  recursiveNodeCount: countNodes(blockNode),
  treeHash: stableHash(blockNode),
});

const buildBlockEntry = async ({ blockNode, order, siteId, assetIndex, sourceDir }) => ({
  ...buildBlockIndex(blockNode, order),
  assetRef: await buildNodeAssetRef({ node: blockNode, siteId, assetIndex, sourceDir }),
  rawBlockNode: blockNode,
});

const buildSectionEntry = async ({ sectionNode, order, siteId, assetIndex, sourceDir }) => {
  const blockNodes = Array.isArray(sectionNode?.children) ? sectionNode.children : [];
  const assetRefs = [];
  await collectImageAssets({ node: sectionNode, siteId, assetIndex, sourceDir, assets: assetRefs });

  const blocks = [];
  for (const [blockOrder, blockNode] of blockNodes.entries()) {
    blocks.push(await buildBlockEntry({ blockNode, order: blockOrder, siteId, assetIndex, sourceDir }));
  }

  return {
    ...buildSectionIndex(sectionNode, order),
    blockCount: blocks.length,
    blockIndex: blocks.map((block) => ({
      blockId: block.blockId,
      blockName: block.blockName,
      blockType: block.blockType,
      blockRole: block.blockRole,
      order: block.order,
      bounds: block.bounds,
      directChildCount: block.directChildCount,
      recursiveNodeCount: block.recursiveNodeCount,
      treeHash: block.treeHash,
    })),
    assetRefs,
    blocks,
    rawSectionNode: sectionNode,
  };
};

const buildPageEntry = async ({ pageNode, pageOrder, siteId, assetIndex, sourceDir }) => {
  const sectionNodes = Array.isArray(pageNode?.children)
    ? pageNode.children.filter((child) => String(child?.type || "").toLowerCase() === "frame")
    : [];
  const looseNodes = Array.isArray(pageNode?.children)
    ? pageNode.children.filter((child) => String(child?.type || "").toLowerCase() !== "frame")
    : [];
  const assetRefs = [];
  await collectImageAssets({ node: pageNode, siteId, assetIndex, sourceDir, assets: assetRefs });

  const sections = [];
  for (const [sectionOrder, sectionNode] of sectionNodes.entries()) {
    sections.push(await buildSectionEntry({ sectionNode, order: sectionOrder, siteId, assetIndex, sourceDir }));
  }

  return {
    pageId: String(pageNode?.id || ""),
    pageName: String(pageNode?.name || ""),
    pageType: detectPageType(pageNode),
    order: pageOrder,
    bounds: summarizeBounds(pageNode),
    layout: {
      layout: String(pageNode?.layout || ""),
      gap: typeof pageNode?.gap === "number" ? pageNode.gap : Array.isArray(pageNode?.gap) ? pageNode.gap : "",
      padding: Array.isArray(pageNode?.padding) ? pageNode.padding : "",
      clip: Boolean(pageNode?.clip),
    },
    pageHash: stableHash(pageNode),
    directChildCount: Array.isArray(pageNode?.children) ? pageNode.children.length : 0,
    recursiveNodeCount: countNodes(pageNode),
    sectionCount: sections.length,
    sectionIndex: sections.map((section) => ({
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      sectionKind: section.sectionKind,
      order: section.order,
      bounds: section.bounds,
      directChildCount: section.directChildCount,
      recursiveNodeCount: section.recursiveNodeCount,
      treeHash: section.treeHash,
      blockCount: section.blockCount,
    })),
    sections,
    blockCount: sections.reduce((sum, section) => sum + section.blockCount, 0),
    looseNodeCount: looseNodes.length,
    looseNodes: looseNodes.map(summarizeNode),
    assetRefs,
    rawPageNode: pageNode,
  };
};

export const buildExactTemplate = async ({ filePath, doc, assetIndex, sourceDir }) => {
  const identity = parsePenIdentity(filePath);
  const topLevelNodes = Array.isArray(doc?.children) ? doc.children : [];
  const pageNodes = topLevelNodes.filter((node) => String(node?.type || "").toLowerCase() === "frame");
  const rootLooseNodes = topLevelNodes.filter((node) => String(node?.type || "").toLowerCase() !== "frame");
  const theme = buildThemeFromDoc(identity.siteId, doc);

  const pages = [];
  for (const [pageOrder, pageNode] of pageNodes.entries()) {
    pages.push(await buildPageEntry({ pageNode, pageOrder, siteId: identity.siteId, assetIndex, sourceDir }));
  }

  return {
    schemaVersion: "pen-exact-template.v1",
    generatedAt: new Date().toISOString(),
    identity,
    source: {
      penFile: filePath,
      sourceDir,
    },
    sourceHash: stableHash(doc),
    counts: {
      topLevelNodeCount: topLevelNodes.length,
      rootLooseNodeCount: rootLooseNodes.length,
      pageCount: pages.length,
      totalNodeCount: countNodesList(topLevelNodes),
      totalSectionCount: pages.reduce((sum, page) => sum + page.sectionCount, 0),
      totalBlockCount: pages.reduce((sum, page) => sum + page.blockCount, 0),
    },
    theme,
    pageOrder: pages.map((page) => page.pageId),
    pages,
    rootLooseNodes: rootLooseNodes.map(summarizeNode),
    rawDocument: doc,
  };
};

export const collectPenFiles = async (sourceDir) => {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".pen"))
    .map((entry) => path.join(sourceDir, entry.name))
    .sort((a, b) => a.localeCompare(b));
};
