import {
  extractBrandNameFromPrompt as extractBrandNameFromPromptShared,
  sanitizeBrandCandidate as sanitizeBrandCandidateShared,
} from "@/lib/agent/brand-utils";

type SerperOrganicItem = {
  title?: string;
  link?: string;
  snippet?: string;
};

type SerperKnowledgeGraph = {
  title?: string;
  description?: string;
  attributes?: Record<string, unknown>;
};

type SerperSearchResponse = {
  organic?: SerperOrganicItem[];
  knowledgeGraph?: SerperKnowledgeGraph;
};

type FactField = "company" | "products" | "specs" | "cases" | "faq";

export type SerperFactPack = {
  enabled: boolean;
  used: boolean;
  queryCount: number;
  queries: string[];
  sourceCount: number;
  context: string;
  requiredFields: FactField[];
  coveredFields: FactField[];
  missingFields: FactField[];
};

const parseEnvBoolean = (value: string | undefined, fallback: boolean) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

const normalizeWhitespace = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const extractFirstUrlFromPrompt = (prompt: string) => {
  const match = String(prompt || "").match(/https?:\/\/[^\s)'"`]+/i);
  return match ? normalizeWhitespace(match[0]) : "";
};

const extractDomain = (value: string) => {
  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./i, "").trim().toLowerCase();
  } catch {
    return "";
  }
};

const BRAND_NOISE_PATTERN =
  /\b(navigation|nav|header|footer|menu|section|layout|template|hero|cta|page|pages|route|path|type|contract|retrieval|scoped|scope|required|field|fields|current|content)\b/i;

const cleanBrandCandidate = (value: string) => {
  const normalized = sanitizeBrandCandidateShared(value);
  if (!normalized) return "";
  if (normalized.length < 2 || normalized.length > 64) return "";
  if (BRAND_NOISE_PATTERN.test(normalized)) return "";
  if (/^(home|about|contact|products?|solutions?|cases?|support|privacy|terms?)$/i.test(normalized)) return "";
  return normalized;
};

const extractBrandNameFromPrompt = (prompt: string) => {
  const shared = cleanBrandCandidate(extractBrandNameFromPromptShared(prompt));
  if (shared) return shared;
  const text = String(prompt || "");
  const cn = text.match(
    /为\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s·&().\-]{1,48})\s*(?:生成|制作|创建|构建|设计)/i
  );
  if (cn?.[1]) {
    const cleaned = cleanBrandCandidate(cn[1]);
    if (cleaned) return cleaned;
  }
  const quotedMatches = Array.from(text.matchAll(/["“”「『]([^"“”」』]{1,64})["“”」』]/g));
  for (const match of quotedMatches) {
    const cleaned = cleanBrandCandidate(String(match[1] || ""));
    if (cleaned) return cleaned;
  }
  const englishFor = text.match(
    /\bfor\s+([A-Za-z][A-Za-z0-9&().\-\s]{1,48})\s+(?:company|brand|website|site|factory)\b/i
  );
  if (englishFor?.[1]) {
    const cleaned = cleanBrandCandidate(englishFor[1]);
    if (cleaned) return cleaned;
  }
  return "";
};

const extractPromptSignals = (prompt: string) => {
  const raw = String(prompt || "");
  return {
    hasCompany: /(公司|企业|about|关于|who we are|简介|工厂|manufacturer|factory)/i.test(raw),
    hasProducts: /(产品|products?|catalog|机型|machine|model)/i.test(raw),
    hasSpecs: /(参数|spec|specification|行程|精度|spindle|rpm|定位)/i.test(raw),
    hasCases: /(案例|case|application|客户)/i.test(raw),
    hasFaq: /(faq|常见问题|问题|售后|support)/i.test(raw),
  };
};

const resolveSearchKeywordsFromPrompt = (prompt: string, limit: number) => {
  const raw = String(prompt || "");
  const pieces = raw
    .replace(/[^\p{L}\p{N}\u4e00-\u9fff\s]/gu, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((token) => token.length >= 2 && token.length <= 28)
    .filter((token) => !BRAND_NOISE_PATTERN.test(token))
    .filter((token) => !/^(home|about|contact|products?|solutions?|cases?|support|privacy|terms?)$/i.test(token));
  return Array.from(new Set(pieces)).slice(0, Math.max(1, limit));
};

const buildQueries = (input: {
  prompt: string;
  missingFields: FactField[];
  queryBudget: number;
  brandHint?: string;
  domainHint?: string;
  pageTypeHint?: string;
  pagePathHint?: string;
}) => {
  const prompt = input.prompt;
  const missingFields = input.missingFields;
  const queryBudget = input.queryBudget;
  const url = extractFirstUrlFromPrompt(prompt);
  const domainFromHint =
    extractDomain(input.domainHint || "") ||
    normalizeWhitespace(input.domainHint || "")
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split(/[/?#]/)[0]
      .trim()
      .toLowerCase();
  const domain = domainFromHint || extractDomain(url);
  const hintBrand = cleanBrandCandidate(input.brandHint || "");
  const brand = hintBrand || extractBrandNameFromPrompt(prompt);
  const pageType = normalizeWhitespace(input.pageTypeHint || "");
  const pagePath = normalizeWhitespace(input.pagePathHint || "");
  const queries: string[] = [];
  if (domain) {
    queries.push(`site:${domain} ${brand || ""} company profile products cases specs faq`.trim());
  }
  if (brand) {
    queries.push(`${brand} company profile products applications cases contact`);
  }
  const fieldQueriesEn: Record<FactField, string> = {
    company: "company profile history certifications location contact",
    products: "product catalog models machines lineup",
    specs: "product specifications parameters precision rpm travel",
    cases: "case studies applications customer outcomes",
    faq: "faq support service maintenance",
  };
  const fieldQueriesZh: Record<FactField, string> = {
    company: "公司简介 发展历程 资质认证 联系方式",
    products: "产品中心 机型 设备 型号",
    specs: "技术参数 精度 行程 主轴 转速",
    cases: "应用案例 客户案例 成果",
    faq: "常见问题 售后 技术支持",
  };
  const pageScopeSuffix = [pageType, pagePath]
    .filter(Boolean)
    .join(" ")
    .replace(/[^\p{L}\p{N}\u4e00-\u9fff\s/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  missingFields.forEach((field) => {
    if (domain) {
      queries.push(`site:${domain} ${fieldQueriesEn[field]} ${pageScopeSuffix}`.trim());
      queries.push(`site:${domain} ${fieldQueriesZh[field]} ${pageScopeSuffix}`.trim());
    }
    if (brand) {
      queries.push(`${brand} ${fieldQueriesEn[field]} ${pageScopeSuffix}`.trim());
      queries.push(`${brand} ${fieldQueriesZh[field]} ${pageScopeSuffix}`.trim());
    }
  });
  const fieldQueries: Record<FactField, string[]> = {
    company: [
      `${brand || domain || "company"} company profile history certifications`,
      `${brand || domain || "company"} 关于 公司简介 联系方式`,
    ],
    products: [
      `${brand || domain || "company"} product catalog models machines`,
      `${brand || domain || "company"} 产品中心 机型 设备`,
    ],
    specs: [
      `${brand || domain || "company"} product specifications parameters rpm precision`,
      `${brand || domain || "company"} 技术参数 精度 行程 主轴`,
    ],
    cases: [
      `${brand || domain || "company"} case studies applications customer`,
      `${brand || domain || "company"} 应用案例 客户案例`,
    ],
    faq: [
      `${brand || domain || "company"} faq support service`,
      `${brand || domain || "company"} 常见问题 售后 技术支持`,
    ],
  };
  missingFields.forEach((field) => queries.push(...fieldQueries[field]));
  if (!queries.length) {
    const fallbackKeywords = resolveSearchKeywordsFromPrompt(prompt, 6).join(" ");
    const fallbackBase = brand || domain || fallbackKeywords;
    if (fallbackBase) {
      queries.push(`${fallbackBase} company profile products specs cases faq`);
      queries.push(`${fallbackBase} 公司简介 产品中心 技术参数 应用案例`);
    }
  }
  return Array.from(new Set(queries)).slice(0, Math.max(2, queryBudget));
};

const toSnippetLine = (item: SerperOrganicItem) => {
  const title = normalizeWhitespace(item.title);
  const link = normalizeWhitespace(item.link);
  const snippet = normalizeWhitespace(item.snippet).slice(0, 180);
  if (!title && !snippet) return "";
  const parts = [title, snippet].filter(Boolean);
  if (link) parts.push(`(${link})`);
  return `- ${parts.join(" | ")}`;
};

const callSerperSearch = async (apiKey: string, query: string, timeoutMs: number) => {
  const endpoint = process.env.SERPER_ENDPOINT || "https://google.serper.dev/search";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("serper_timeout"), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        q: query,
        gl: process.env.SERPER_GL || "cn",
        hl: process.env.SERPER_HL || "zh-cn",
        num: Number(process.env.SERPER_NUM || 5),
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`serper_http_${response.status}`);
    }
    return (await response.json()) as SerperSearchResponse;
  } finally {
    clearTimeout(timer);
  }
};

type BuildSerperFactPackOptions = {
  structuredInput?: {
    company?: { name?: string; summary?: string };
    products?: Array<{ name?: string; specs?: Record<string, string> }>;
    cases?: Array<{ title?: string }>;
    faqs?: Array<{ question?: string; answer?: string }>;
  };
  retrievalContext?: {
    companyName?: string;
    companyWebsite?: string;
    pageType?: string;
    pagePath?: string;
  };
  queryHints?: string[];
  queryMode?: "prepend" | "append" | "replace";
  maxQueries?: number;
  timeoutMs?: number;
  maxDurationMs?: number;
};

export const buildSerperFactPack = async (
  prompt: string,
  options: BuildSerperFactPackOptions = {}
): Promise<SerperFactPack> => {
  return buildSerperFactPackWithOptions(prompt, options);
};

const detectCoveredFieldsFromLine = (line: string): FactField[] => {
  const token = String(line || "").toLowerCase();
  const fields: FactField[] = [];
  if (/(company|about|history|factory|manufacturer|企业|公司|简介)/.test(token)) fields.push("company");
  if (/(product|catalog|machine|model|机型|产品|设备)/.test(token)) fields.push("products");
  if (/(spec|parameter|precision|rpm|travel|行程|精度|参数|主轴)/.test(token)) fields.push("specs");
  if (/(case|application|customer|project|案例|应用|客户)/.test(token)) fields.push("cases");
  if (/(faq|support|service|question|常见问题|支持|售后)/.test(token)) fields.push("faq");
  return fields;
};

export const buildSerperFactPackWithOptions = async (
  prompt: string,
  options: BuildSerperFactPackOptions
): Promise<SerperFactPack> => {
  const enabled = parseEnvBoolean(process.env.SERPER_ENABLED, true);
  const apiKey = normalizeWhitespace(process.env.SERPER_API_KEY || "");
  const requiredFields: FactField[] = ["company", "products", "specs", "cases", "faq"];
  const promptSignals = extractPromptSignals(prompt);
  const structured = options.structuredInput;
  const hasStructuredCompany = Boolean(normalizeWhitespace(structured?.company?.name || structured?.company?.summary || ""));
  const hasStructuredProducts = Array.isArray(structured?.products) && structured!.products!.length > 0;
  const hasStructuredSpecs = Boolean(
    Array.isArray(structured?.products) &&
      structured!.products!.some((item) => item?.specs && Object.keys(item.specs).length > 0)
  );
  const hasStructuredCases = Array.isArray(structured?.cases) && structured!.cases!.length > 0;
  const hasStructuredFaq = Array.isArray(structured?.faqs) && structured!.faqs!.length > 0;
  const missingFields = requiredFields.filter((field) => {
    if (field === "company") return !hasStructuredCompany && !promptSignals.hasCompany;
    if (field === "products") return !hasStructuredProducts && !promptSignals.hasProducts;
    if (field === "specs") return !hasStructuredSpecs && !promptSignals.hasSpecs;
    if (field === "cases") return !hasStructuredCases && !promptSignals.hasCases;
    if (field === "faq") return !hasStructuredFaq && !promptSignals.hasFaq;
    return false;
  });
  if (!enabled || !apiKey) {
    return {
      enabled,
      used: false,
      queryCount: 0,
      queries: [],
      sourceCount: 0,
      context: "",
      requiredFields,
      coveredFields: [],
      missingFields,
    };
  }

  const timeoutMs = Math.max(1000, Number(options.timeoutMs ?? process.env.SERPER_TIMEOUT_MS ?? 8000));
  const queryBudgetSeed = Number(process.env.SERPER_QUERY_BUDGET);
  const queryBudgetBase = Number.isFinite(queryBudgetSeed)
    ? Math.max(2, Math.min(12, Math.floor(queryBudgetSeed)))
    : Math.min(8, Math.max(4, missingFields.length * 2));
  const queryBudget =
    Number.isFinite(Number(options.maxQueries)) && Number(options.maxQueries) > 0
      ? Math.max(1, Math.min(queryBudgetBase, Math.floor(Number(options.maxQueries))))
      : queryBudgetBase;
  const normalizeQueryHints = (items: string[] | undefined) =>
    Array.from(
      new Set(
        (Array.isArray(items) ? items : [])
          .map((item) => normalizeWhitespace(item))
          .filter(Boolean)
      )
    );
  const mergeQueriesWithHints = (baseQueries: string[]) => {
    const hints = normalizeQueryHints(options.queryHints);
    if (!hints.length) return baseQueries.slice(0, queryBudget);
    const mode = options.queryMode || "prepend";
    const merged =
      mode === "replace"
        ? hints
        : mode === "append"
          ? [...baseQueries, ...hints]
          : [...hints, ...baseQueries];
    return Array.from(new Set(merged)).slice(0, queryBudget);
  };
  const structuredBrandHint = normalizeWhitespace(structured?.company?.name || "");
  const structuredWebsiteHint = normalizeWhitespace(
    options.retrievalContext?.companyWebsite || ""
  );
  const queries = mergeQueriesWithHints(
    buildQueries({
      prompt,
      missingFields,
      queryBudget,
      brandHint: options.retrievalContext?.companyName || structuredBrandHint,
      domainHint: structuredWebsiteHint || extractFirstUrlFromPrompt(prompt),
      pageTypeHint: options.retrievalContext?.pageType,
      pagePathHint: options.retrievalContext?.pagePath,
    })
  );
  const lines: string[] = [];
  let sourceCount = 0;
  const coveredFields = new Set<FactField>();
  const startedAt = Date.now();
  const maxDurationMs = Math.max(0, Number(options.maxDurationMs || process.env.SERPER_MAX_DURATION_MS || 0));

  for (const query of queries) {
    if (maxDurationMs > 0 && Date.now() - startedAt >= maxDurationMs) break;
    if (requiredFields.every((field) => coveredFields.has(field))) break;
    try {
      const payload = await callSerperSearch(apiKey, query, timeoutMs);
      const knowledgeTitle = normalizeWhitespace(payload?.knowledgeGraph?.title);
      const knowledgeDesc = normalizeWhitespace(payload?.knowledgeGraph?.description).slice(0, 180);
      if (knowledgeTitle || knowledgeDesc) {
        const line = `- ${[knowledgeTitle, knowledgeDesc].filter(Boolean).join(" | ")}`;
        lines.push(line);
        detectCoveredFieldsFromLine(line).forEach((field) => coveredFields.add(field));
        sourceCount += 1;
      }
      const organicItems = Array.isArray(payload?.organic) ? payload.organic : [];
      for (const item of organicItems.slice(0, 3)) {
        const line = toSnippetLine(item);
        if (!line) continue;
        lines.push(line);
        detectCoveredFieldsFromLine(line).forEach((field) => coveredFields.add(field));
        sourceCount += 1;
      }
    } catch {
      // Non-fatal: keep generation path deterministic even when search is unavailable.
      continue;
    }
  }

  const uniqueLines = Array.from(new Set(lines)).slice(0, 8);
  if (!uniqueLines.length) {
    return {
      enabled,
      used: false,
      queryCount: queries.length,
      queries,
      sourceCount: 0,
      context: "",
      requiredFields,
      coveredFields: Array.from(coveredFields),
      missingFields: requiredFields.filter((field) => !coveredFields.has(field)),
    };
  }

  const missingAfterSearch = requiredFields.filter((field) => !coveredFields.has(field));

  return {
    enabled,
    used: true,
    queryCount: queries.length,
    queries,
    sourceCount,
    requiredFields,
    coveredFields: Array.from(coveredFields),
    missingFields: missingAfterSearch,
    context: `\n\n# External Fact Pack (Serper)\n仅可将以下条目作为事实线索，不要照抄原句，优先用于补全公司介绍、产品、参数、案例与FAQ。\nCoverage: ${Array.from(
      coveredFields
    ).join(", ") || "none"}\nMissing: ${missingAfterSearch.join(", ") || "none"}\n${uniqueLines.join(
      "\n"
    )}`,
  };
};
