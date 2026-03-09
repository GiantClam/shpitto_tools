import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));

const readJson = (fileName, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(CURRENT_DIR, fileName), "utf8"));
  } catch {
    return fallback;
  }
};

export const PAGE_TAXONOMY = readJson("page-taxonomy.json", { version: "1.0.0", categories: [] });
export const DEDUPE_RULES = readJson("dedupe-rules.json", {
  version: "1.0.0",
  selection: { maxPagesPerTypeDefault: 6, candidatePoolTopKDefault: 3, keepHomeAlways: true },
});

const normalizePath = (value) => {
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
  return normalized === "" ? "/" : normalized.toLowerCase();
};

const toSlugToken = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isTrackingParam = (key) => {
  const token = String(key || "").trim().toLowerCase();
  if (!token) return false;
  if (token.startsWith("utm_")) return true;
  return token === "fbclid" || token === "gclid" || token === "ref" || token === "source" || token === "campaign";
};

const canonicalizeUrlLike = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("/")) return normalizePath(raw);
  if (!/^https?:\/\//i.test(raw)) return normalizePath(raw);
  try {
    const parsed = new URL(raw);
    const params = new URLSearchParams(parsed.search || "");
    const next = new URLSearchParams();
    for (const [key, val] of params.entries()) {
      if (!isTrackingParam(key)) next.append(key.toLowerCase(), val);
    }
    parsed.hash = "";
    parsed.pathname = normalizePath(parsed.pathname);
    parsed.search = next.toString() ? `?${next.toString()}` : "";
    return `${parsed.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return normalizePath(raw);
  }
};

const pageDepth = (pathValue) => normalizePath(pathValue).split("/").filter(Boolean).length;

const asArray = (value) => (Array.isArray(value) ? value : []);

const LOW_QUALITY_TITLE_PATTERNS = [
  /请稍候|稍候|just a moment|one more step|attention required/i,
  /too many requests|rate limit|access denied|forbidden|unauthorized/i,
  /cloudflare|captcha|verify you are human|checking your browser/i,
  /^untitled\s*$/i,
];

const isLowQualityPageName = (value) => {
  const token = String(value || "").trim();
  if (!token) return true;
  return LOW_QUALITY_TITLE_PATTERNS.some((pattern) => pattern.test(token));
};

const hasNonAsciiName = (value) => /[^\u0000-\u007f]/.test(String(value || ""));

const hasCategorySignal = (requiredCategories, expected) =>
  asArray(requiredCategories).some((item) => String(item || "").toLowerCase() === expected);

const classifyPage = (page) => {
  const pathValue = normalizePath(page?.path || "/");
  const name = String(page?.name || "").toLowerCase();
  const token = `${pathValue} ${name}`;
  const requiredCategories = asArray(page?.required_categories).map((item) => String(item || "").toLowerCase());
  const evidence = [];
  let type = "detail";
  let confidence = 0.55;

  if (pathValue === "/") {
    return { type: "home", confidence: 1, evidence: ["path:/"] };
  }

  if (/privacy|terms|policy|legal|cookies?/.test(token)) {
    type = "legal";
    confidence = 0.95;
    evidence.push("keyword:legal");
  } else if (
    /^\/blogs?(?:\/)?$|^\/blogs?\/[^/]+(?:\/)?$|^\/(news|insights?|resources?)(?:\/)?$/.test(pathValue)
  ) {
    type = "blog_list";
    confidence = 0.92;
    evidence.push("path:blog_list");
  } else if (
    /^\/blogs?\/[^/]+\/[^/]+/.test(pathValue) ||
    /^\/(news|insights?|resources?)\/[^/]+/.test(pathValue)
  ) {
    type = "blog_detail";
    confidence = 0.93;
    evidence.push("path:blog_detail");
  } else if (/pricing|plans?|billing|subscription/.test(token)) {
    type = "pricing";
    confidence = 0.9;
    evidence.push("keyword:pricing");
  } else if (/support|help|faq|knowledge|docs|documentation/.test(token)) {
    type = "help_faq";
    confidence = 0.9;
    evidence.push("keyword:help_faq");
  } else if (/contact|get[-\s]?in[-\s]?touch|book|demo|quote|inquiry/.test(token)) {
    type = "contact";
    confidence = 0.9;
    evidence.push("keyword:contact");
  } else if (/about|company|team|mission|vision|story|studio/.test(token)) {
    type = "about";
    confidence = 0.88;
    evidence.push("keyword:about");
  } else if (
    /^\/(products?|services?|solutions?|collections?|shop|store)(?:\/)?$/.test(pathValue) ||
    /^\/collections?\/[^/]+(?:\/)?$/.test(pathValue) ||
    hasCategorySignal(requiredCategories, "products")
  ) {
    type = "product_service_list";
    confidence = 0.87;
    evidence.push("path:product_service_list");
  } else if (
    /^\/products?\/[^/]+/.test(pathValue) ||
    /^\/collections?\/[^/]+\/products?\/[^/]+/.test(pathValue) ||
    /\/(case[-_]studies?|portfolio|projects?)\/[^/]+/.test(pathValue)
  ) {
    type = "detail";
    confidence = 0.86;
    evidence.push("path:detail");
  } else {
    const depth = pageDepth(pathValue);
    if (depth <= 1) {
      type = "product_service_list";
      confidence = 0.7;
      evidence.push("heuristic:shallow_listing");
    } else {
      type = "detail";
      confidence = 0.68;
      evidence.push("heuristic:deep_detail");
    }
  }

  if (requiredCategories.length > 0) {
    confidence += 0.05;
    evidence.push("signal:required_categories");
  }
  confidence = Math.max(0, Math.min(1, Number(confidence.toFixed(2))));
  return { type, confidence, evidence };
};

export const classifyPagesByTaxonomy = ({ pages = [] } = {}) => {
  const rows = asArray(pages).map((page) => {
    const classification = classifyPage(page);
    return {
      ...page,
      taxonomy_type: classification.type,
      taxonomy_confidence: classification.confidence,
      taxonomy_evidence: classification.evidence,
    };
  });
  return {
    pages: rows,
    summary: {
      total: rows.length,
      countsByType: summarizeTaxonomyCounts(rows),
    },
  };
};

const representativeScore = (page) => {
  const weights =
    (DEDUPE_RULES?.selection?.representativeScoreWeights &&
      typeof DEDUPE_RULES.selection.representativeScoreWeights === "object"
      ? DEDUPE_RULES.selection.representativeScoreWeights
      : {}) || {};
  const pathValue = normalizePath(page?.path || "/");
  const requiredCount = asArray(page?.required_categories).length;
  const confidence = Number(page?.taxonomy_confidence || 0);
  const forceInclude = page?.forceInclude ? 1 : 0;
  const depth = pageDepth(pathValue);
  const lowQualityTitlePenalty = isLowQualityPageName(page?.name) ? Number(weights.lowQualityTitlePenalty || 45) : 0;
  const nonAsciiPenalty = hasNonAsciiName(page?.name) ? Number(weights.nonAsciiTitlePenalty || 12) : 0;
  const homeBonus = pathValue === "/" ? Number(weights.homeBonus || 100) : 0;
  const requiredScore = requiredCount * Number(weights.requiredCategories || 8);
  const confidenceScore = confidence * Number(weights.taxonomyConfidence || 20);
  const depthScore = Math.min(6, depth) * Number(weights.depth || 1.5);
  const forceIncludeScore = forceInclude * Number(weights.forceInclude || 50);
  return homeBonus + forceIncludeScore + requiredScore + confidenceScore + depthScore - lowQualityTitlePenalty - nonAsciiPenalty;
};

const parseHexHash = (value) => {
  const token = String(value || "").trim().toLowerCase();
  if (!/^[0-9a-f]+$/i.test(token)) return "";
  if (token.length < 8 || token.length % 2 !== 0) return "";
  return token;
};

const bitCountLut = (() => {
  const lut = new Array(256);
  for (let i = 0; i < 256; i += 1) {
    let v = i;
    let c = 0;
    while (v) {
      v &= v - 1;
      c += 1;
    }
    lut[i] = c;
  }
  return lut;
})();

const hammingDistanceHex = (a, b) => {
  const aa = parseHexHash(a);
  const bb = parseHexHash(b);
  if (!aa || !bb) return Number.POSITIVE_INFINITY;
  const len = Math.min(aa.length, bb.length);
  if (len <= 0) return Number.POSITIVE_INFINITY;
  let distance = 0;
  for (let i = 0; i < len; i += 2) {
    const x = parseInt(aa.slice(i, i + 2), 16);
    const y = parseInt(bb.slice(i, i + 2), 16);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    distance += bitCountLut[(x ^ y) & 0xff];
  }
  return distance;
};

export const summarizeTaxonomyCounts = (pages = []) => {
  const counts = {};
  for (const page of asArray(pages)) {
    const type = String(page?.taxonomy_type || "unknown").trim() || "unknown";
    counts[type] = Number(counts[type] || 0) + 1;
  }
  return counts;
};

export const dedupePagesByTaxonomy = ({ pages = [], options = {} } = {}) => {
  const maxPagesPerType = Math.max(
    1,
    Math.floor(
      Number(options?.maxPagesPerType || DEDUPE_RULES?.selection?.maxPagesPerTypeDefault || 6)
    )
  );
  const includeTypeSet =
    Array.isArray(options?.includeTypes) && options.includeTypes.length
      ? new Set(options.includeTypes.map((item) => String(item || "").trim()).filter(Boolean))
      : null;
  const candidatePoolTopK = Math.max(
    1,
    Math.floor(
      Number(
        options?.candidatePoolTopK ||
          DEDUPE_RULES?.selection?.candidatePoolTopKDefault ||
          3
      )
    )
  );
  const visualHashByPath =
    options?.visualHashByPath && typeof options.visualHashByPath === "object"
      ? options.visualHashByPath
      : {};
  const visualHashDistanceThreshold = Math.max(
    0,
    Math.floor(Number(options?.visualHashDistanceThreshold || DEDUPE_RULES?.visualFingerprint?.hammingThreshold || 8))
  );

  const rows = asArray(pages).map((page, index) => ({
    ...page,
    __index: index,
    __path: normalizePath(page?.path || "/"),
    __canonical: canonicalizeUrlLike(page?.path || page?.url || ""),
    __structure: asArray(page?.required_categories)
      .map((item) => toSlugToken(item))
      .filter(Boolean)
      .sort()
      .join("|"),
    __visualHash: parseHexHash(visualHashByPath[normalizePath(page?.path || "/")] || ""),
    __score: representativeScore(page),
  }));

  const dropped = [];
  const canonicalMap = new Map();
  for (const row of rows) {
    const key = row.__canonical || row.__path;
    if (!key) continue;
    const existing = canonicalMap.get(key);
    if (!existing) {
      canonicalMap.set(key, row);
      continue;
    }
    if (row.__score > existing.__score) {
      dropped.push({ path: existing.__path, reason: "url_duplicate", kept: row.__path });
      canonicalMap.set(key, row);
    } else {
      dropped.push({ path: row.__path, reason: "url_duplicate", kept: existing.__path });
    }
  }

  const afterCanonical = Array.from(canonicalMap.values()).sort((a, b) => a.__index - b.__index);
  const grouped = new Map();
  for (const row of afterCanonical) {
    const type = String(row?.taxonomy_type || "detail");
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type).push(row);
  }

  const selected = [];
  const candidatePoolsByType = {};
  for (const [type, groupRows] of grouped.entries()) {
    if (includeTypeSet && !includeTypeSet.has(type)) {
      for (const row of groupRows) {
        dropped.push({ path: row.__path, reason: "excluded_by_type_filter", kept: "" });
      }
      continue;
    }
    const sorted = [...groupRows].sort((a, b) => b.__score - a.__score || a.__index - b.__index);
    candidatePoolsByType[type] = sorted.slice(0, candidatePoolTopK).map((row) => ({
      path: row.__path,
      score: Number(row.__score.toFixed(2)),
      confidence: Number(row?.taxonomy_confidence || 0),
      requiredCategories: asArray(row?.required_categories).length,
      visualHash: row.__visualHash || "",
      forceInclude: Boolean(row?.forceInclude),
    }));
    const seenStructure = new Set();
    const keptRowsByStructure = new Map();
    let keptCount = 0;
    for (const row of sorted) {
      const isHome = row.__path === "/";
      const structureKey = row.__structure ? `${type}:${row.__structure}` : "";
      let duplicatedStructure = Boolean(structureKey) && seenStructure.has(structureKey) && !row.forceInclude && !isHome;
      if (duplicatedStructure && row.__visualHash) {
        const keptRef = keptRowsByStructure.get(structureKey);
        const keptHash = parseHexHash(keptRef?.__visualHash || "");
        const currentHash = parseHexHash(row.__visualHash);
        if (keptHash && currentHash) {
          const distance = hammingDistanceHex(keptHash, currentHash);
          // If structure is same but visual distance is large, keep both as visual variants.
          if (Number.isFinite(distance) && distance > visualHashDistanceThreshold) {
            duplicatedStructure = false;
          }
        }
      }
      if (duplicatedStructure) {
        dropped.push({ path: row.__path, reason: "structure_duplicate", kept: "" });
        continue;
      }
      if (!isHome && !row.forceInclude && keptCount >= maxPagesPerType) {
        dropped.push({ path: row.__path, reason: "per_type_cap", kept: "" });
        continue;
      }
      selected.push(row);
      keptCount += 1;
      if (structureKey) {
        seenStructure.add(structureKey);
        if (!keptRowsByStructure.has(structureKey)) keptRowsByStructure.set(structureKey, row);
      }
    }
  }

  const selectedByPath = new Set(selected.map((row) => row.__path));
  // Keep order stable based on original discovery order.
  const deduped = rows
    .filter((row) => selectedByPath.has(row.__path))
    .sort((a, b) => a.__index - b.__index)
    .map((row) => {
      const next = { ...row };
      next.taxonomy_representative_score = Number(row.__score.toFixed(2));
      if (row.__visualHash) next.taxonomy_visual_hash = row.__visualHash;
      delete next.__index;
      delete next.__path;
      delete next.__canonical;
      delete next.__structure;
      delete next.__visualHash;
      delete next.__score;
      return next;
    });

  return {
    pages: deduped,
    dropped,
    summary: {
      totalBefore: rows.length,
      totalAfter: deduped.length,
      dropped: dropped.length,
      candidatePoolTopK,
      visualHashDistanceThreshold,
      countsByTypeBefore: summarizeTaxonomyCounts(rows),
      countsByTypeAfter: summarizeTaxonomyCounts(deduped),
      maxPagesPerType,
    },
    candidatePoolsByType,
  };
};
