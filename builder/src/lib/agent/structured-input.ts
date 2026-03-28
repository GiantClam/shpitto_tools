export type StructuredProductRecord = {
  id?: string;
  name: string;
  model?: string;
  category?: string;
  summary?: string;
  image?: string;
  ctaLabel?: string;
  specs?: Record<string, string>;
};

export type StructuredCaseRecord = {
  title: string;
  customerType?: string;
  problem?: string;
  solution?: string;
  result?: string;
};

export type StructuredFaqRecord = {
  question: string;
  answer: string;
};

export type StructuredCompanyRecord = {
  name?: string;
  website?: string;
  summary?: string;
  address?: string;
  email?: string;
  phone?: string;
};

export type StructuredSiteInput = {
  company?: StructuredCompanyRecord;
  nav?: string[];
  pages?: string[];
  products?: StructuredProductRecord[];
  cases?: StructuredCaseRecord[];
  faqs?: StructuredFaqRecord[];
  contactFields?: string[];
  targetLanguage?: "zh-CN" | "en-US";
  catalogPageSize?: number;
};

type ParseResult = {
  input: StructuredSiteInput | null;
  diagnostics: {
    source: Array<"json" | "csv">;
    productCount: number;
    caseCount: number;
    faqCount: number;
  };
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeLanguage = (value: unknown): StructuredSiteInput["targetLanguage"] => {
  const token = normalizeText(value).toLowerCase();
  if (!token) return undefined;
  if (["zh", "zh-cn", "zh-hans", "chinese", "cn"].includes(token)) return "zh-CN";
  if (["en", "en-us", "english", "us"].includes(token)) return "en-US";
  return undefined;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeProduct = (raw: Record<string, unknown>): StructuredProductRecord | null => {
  const name =
    normalizeText(raw.name) ||
    normalizeText(raw.product) ||
    normalizeText(raw.title) ||
    normalizeText(raw.productName) ||
    normalizeText(raw["产品"]) ||
    normalizeText(raw["产品名称"]);
  if (!name) return null;
  const model =
    normalizeText(raw.model) ||
    normalizeText(raw.sku) ||
    normalizeText(raw.code) ||
    normalizeText(raw["型号"]) ||
    "";
  const category =
    normalizeText(raw.category) ||
    normalizeText(raw.group) ||
    normalizeText(raw.series) ||
    normalizeText(raw["分类"]) ||
    "";
  const summary =
    normalizeText(raw.summary) ||
    normalizeText(raw.description) ||
    normalizeText(raw.desc) ||
    normalizeText(raw["简介"]) ||
    "";
  const image =
    normalizeText(raw.image) ||
    normalizeText(raw.imageUrl) ||
    normalizeText(raw.img) ||
    normalizeText(raw["图片"]) ||
    "";
  const ctaLabel = normalizeText(raw.ctaLabel) || normalizeText(raw.cta) || "";
  const specsRaw = raw.specs && typeof raw.specs === "object" ? (raw.specs as Record<string, unknown>) : {};
  const specs = Object.entries(specsRaw).reduce<Record<string, string>>((acc, [key, value]) => {
    const normalizedKey = normalizeText(key);
    const normalizedValue = normalizeText(value);
    if (!normalizedKey || !normalizedValue) return acc;
    acc[normalizedKey] = normalizedValue;
    return acc;
  }, {});
  return {
    id: normalizeText(raw.id) || undefined,
    name,
    model: model || undefined,
    category: category || undefined,
    summary: summary || undefined,
    image: image || undefined,
    ctaLabel: ctaLabel || undefined,
    specs: Object.keys(specs).length ? specs : undefined,
  };
};

const normalizeCase = (raw: Record<string, unknown>): StructuredCaseRecord | null => {
  const title =
    normalizeText(raw.title) ||
    normalizeText(raw.name) ||
    normalizeText(raw.case) ||
    normalizeText(raw["案例"]) ||
    normalizeText(raw["案例名称"]);
  if (!title) return null;
  return {
    title,
    customerType:
      normalizeText(raw.customerType) ||
      normalizeText(raw.customer) ||
      normalizeText(raw["客户类型"]) ||
      undefined,
    problem: normalizeText(raw.problem) || normalizeText(raw["问题"]) || undefined,
    solution: normalizeText(raw.solution) || normalizeText(raw["方案"]) || undefined,
    result: normalizeText(raw.result) || normalizeText(raw["结果"]) || undefined,
  };
};

const normalizeFaq = (raw: Record<string, unknown>): StructuredFaqRecord | null => {
  const question =
    normalizeText(raw.question) ||
    normalizeText(raw.q) ||
    normalizeText(raw["问题"]) ||
    normalizeText(raw["FAQ问题"]);
  const answer =
    normalizeText(raw.answer) ||
    normalizeText(raw.a) ||
    normalizeText(raw["回答"]) ||
    normalizeText(raw["FAQ回答"]);
  if (!question || !answer) return null;
  return { question, answer };
};

const parseJsonInput = (body: Record<string, unknown>): StructuredSiteInput | null => {
  const candidate =
    (body.structuredInput && typeof body.structuredInput === "object" ? body.structuredInput : null) ||
    (body.data && typeof body.data === "object" ? body.data : null) ||
    (body.structured && typeof body.structured === "object" ? body.structured : null);
  if (!candidate) return null;
  const source = candidate as Record<string, unknown>;
  const productsSource = Array.isArray(source.products) ? source.products : [];
  const casesSource = Array.isArray(source.cases) ? source.cases : [];
  const faqsSource = Array.isArray(source.faqs) ? source.faqs : [];
  const navSource = Array.isArray(source.nav) ? source.nav : [];
  const pagesSource = Array.isArray(source.pages) ? source.pages : [];
  const contactFieldsSource = Array.isArray(source.contactFields) ? source.contactFields : [];
  const companySource =
    source.company && typeof source.company === "object" ? (source.company as Record<string, unknown>) : {};
  const normalized: StructuredSiteInput = {
    company: {
      name:
        normalizeText(companySource.name) ||
        normalizeText(companySource.brand) ||
        normalizeText(source.brand) ||
        undefined,
      website: normalizeText(companySource.website) || normalizeText(source.website) || undefined,
      summary: normalizeText(companySource.summary) || normalizeText(source.summary) || undefined,
      address: normalizeText(companySource.address) || undefined,
      email: normalizeText(companySource.email) || undefined,
      phone: normalizeText(companySource.phone) || normalizeText(companySource.tel) || undefined,
    },
    nav: navSource.map((item) => normalizeText(item)).filter(Boolean).slice(0, 12),
    pages: pagesSource.map((item) => normalizeText(item)).filter(Boolean).slice(0, 24),
    products: productsSource
      .map((item) => (item && typeof item === "object" ? normalizeProduct(item as Record<string, unknown>) : null))
      .filter((item): item is StructuredProductRecord => Boolean(item)),
    cases: casesSource
      .map((item) => (item && typeof item === "object" ? normalizeCase(item as Record<string, unknown>) : null))
      .filter((item): item is StructuredCaseRecord => Boolean(item)),
    faqs: faqsSource
      .map((item) => (item && typeof item === "object" ? normalizeFaq(item as Record<string, unknown>) : null))
      .filter((item): item is StructuredFaqRecord => Boolean(item)),
    contactFields: contactFieldsSource.map((item) => normalizeText(item)).filter(Boolean).slice(0, 12),
    targetLanguage: normalizeLanguage(source.targetLanguage),
    catalogPageSize:
      Number.isFinite(Number(source.catalogPageSize)) && Number(source.catalogPageSize) > 0
        ? clamp(Number(source.catalogPageSize), 6, 24)
        : undefined,
  };
  if (
    !normalized.company?.name &&
    !normalized.products?.length &&
    !normalized.cases?.length &&
    !normalized.faqs?.length &&
    !normalized.nav?.length
  ) {
    return null;
  }
  return normalized;
};

const parseCsvRow = (line: string) => {
  const cells: string[] = [];
  let current = "";
  let inQuote = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && inQuote && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (char === "," && !inQuote) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
};

const findColumn = (headers: string[], patterns: RegExp[]) => {
  for (let index = 0; index < headers.length; index += 1) {
    const header = headers[index];
    if (patterns.some((pattern) => pattern.test(header))) return index;
  }
  return -1;
};

const parseCsvProducts = (rawCsv: string): StructuredProductRecord[] => {
  const lines = String(rawCsv || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvRow(lines[0]).map((header) => header.toLowerCase());
  const nameIndex = findColumn(headers, [/^name$/, /product/, /title/, /产品/]);
  if (nameIndex < 0) return [];
  const modelIndex = findColumn(headers, [/model/, /^sku$/, /型号/, /机型/]);
  const categoryIndex = findColumn(headers, [/category/, /group/, /series/, /分类/]);
  const summaryIndex = findColumn(headers, [/summary/, /description/, /简介/, /描述/]);
  const imageIndex = findColumn(headers, [/image/, /img/, /图片/]);
  const ctaIndex = findColumn(headers, [/cta/, /button/, /按钮/]);
  const specsIndex = findColumn(headers, [/spec/, /参数/]);
  const records: StructuredProductRecord[] = [];
  lines.slice(1).forEach((line) => {
    const row = parseCsvRow(line);
    const name = normalizeText(row[nameIndex]);
    if (!name) return;
    const item: StructuredProductRecord = { name };
    if (modelIndex >= 0) item.model = normalizeText(row[modelIndex]) || undefined;
    if (categoryIndex >= 0) item.category = normalizeText(row[categoryIndex]) || undefined;
    if (summaryIndex >= 0) item.summary = normalizeText(row[summaryIndex]) || undefined;
    if (imageIndex >= 0) item.image = normalizeText(row[imageIndex]) || undefined;
    if (ctaIndex >= 0) item.ctaLabel = normalizeText(row[ctaIndex]) || undefined;
    if (specsIndex >= 0) {
      const specsValue = normalizeText(row[specsIndex]);
      if (specsValue) {
        const specEntries = specsValue
          .split(/[;；|]/)
          .map((entry) => entry.trim())
          .filter(Boolean);
        const specs = specEntries.reduce<Record<string, string>>((acc, entry, idx) => {
          const [key, ...rest] = entry.split(/[:：]/);
          const k = normalizeText(key || `Spec ${idx + 1}`);
          const v = normalizeText(rest.join(":"));
          if (!k || !v) return acc;
          acc[k] = v;
          return acc;
        }, {});
        if (Object.keys(specs).length) item.specs = specs;
      }
    }
    records.push(item);
  });
  return records;
};

export const parseStructuredSiteInput = (body: Record<string, unknown>): ParseResult => {
  const jsonInput = parseJsonInput(body);
  const readRawCsv = (value: unknown) =>
    typeof value === "string" && value.trim().length > 0 ? value : "";
  const csvRaw = readRawCsv(body.productsCsv) || readRawCsv(body.catalogCsv) || readRawCsv(body.csvProducts) || "";
  const csvProducts = csvRaw ? parseCsvProducts(csvRaw) : [];

  const source: Array<"json" | "csv"> = [];
  if (jsonInput) source.push("json");
  if (csvProducts.length) source.push("csv");

  const merged: StructuredSiteInput = {
    ...(jsonInput || {}),
    products: [
      ...((jsonInput?.products || []) as StructuredProductRecord[]),
      ...csvProducts,
    ],
  };

  const dedupedProducts = Array.from(
    (merged.products || []).reduce((acc, item) => {
      const key = `${normalizeText(item.name).toLowerCase()}::${normalizeText(item.model).toLowerCase()}`;
      if (!key || acc.has(key)) return acc;
      acc.set(key, item);
      return acc;
    }, new Map<string, StructuredProductRecord>())
  ).map((entry) => entry[1]);

  merged.products = dedupedProducts;
  if (
    !merged.company?.name &&
    !merged.products?.length &&
    !merged.cases?.length &&
    !merged.faqs?.length &&
    !merged.nav?.length
  ) {
    return {
      input: null,
      diagnostics: {
        source,
        productCount: 0,
        caseCount: 0,
        faqCount: 0,
      },
    };
  }
  return {
    input: merged,
    diagnostics: {
      source,
      productCount: merged.products?.length || 0,
      caseCount: merged.cases?.length || 0,
      faqCount: merged.faqs?.length || 0,
    },
  };
};

export const buildStructuredInputPromptPatch = (input: StructuredSiteInput): string => {
  if (!input) return "";
  const products = Array.isArray(input.products) ? input.products : [];
  const cases = Array.isArray(input.cases) ? input.cases : [];
  const faqs = Array.isArray(input.faqs) ? input.faqs : [];
  const company = input.company || {};
  const catalogPageSize = clamp(Number(input.catalogPageSize) || 12, 6, 24);
  const categoryList = Array.from(
    new Set(
      products
        .map((item) => normalizeText(item.category))
        .filter(Boolean)
    )
  ).slice(0, 24);
  const productsForPrompt = products.slice(0, 30).map((item) => ({
    name: item.name,
    model: item.model,
    category: item.category,
    summary: item.summary,
    specs: item.specs,
    image: item.image,
  }));

  return `\n\n# Structured Input Contract\nGeneration mode: dual-chain (marketing + catalog)\nMarketing pages (hard): /, /about, /contact\nCatalog pages (hard): /products, /products/page-{n}, /products/{slug}\nCatalog rules: list + filter + pagination + detail\nCatalog page size: ${catalogPageSize}\nCategory filters: ${categoryList.join(" | ") || "auto"}\nMissing-field enrichment fields (hard): company, products, specs, cases, faq\n\n## Structured Data (JSON)\n${JSON.stringify(
    {
      company,
      targetLanguage: input.targetLanguage,
      nav: input.nav,
      pages: input.pages,
      contactFields: input.contactFields,
      catalogPageSize,
      productCount: products.length,
      caseCount: cases.length,
      faqCount: faqs.length,
      products: productsForPrompt,
      cases: cases.slice(0, 12),
      faqs: faqs.slice(0, 12),
    },
    null,
    2
  )}`;
};
