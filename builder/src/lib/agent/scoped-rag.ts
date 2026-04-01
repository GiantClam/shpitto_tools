import { inferEnterprisePageTypeFromPath, normalizeSitePath, type EnterprisePageType } from "@/lib/agent/page-classifier";
import { buildSerperFactPack } from "@/lib/agent/serper";
import type { StructuredSiteInput } from "@/lib/agent/structured-input";
import type { KnowledgeBaseClient } from "@/lib/agent/knowledge-base";

type FactField = "company" | "products" | "specs" | "cases" | "faq";

type PageLike = {
  path?: string;
  name?: string;
  queryHints?: string[];
};

type ScopedRagPageResult = {
  path: string;
  pageType: EnterprisePageType;
  requiredFields: FactField[];
  coveredFields: FactField[];
  missingFields: FactField[];
  queryCount: number;
  sourceCount: number;
  used: boolean;
  context: string;
  queries: string[];
};

type BuildScopedRagInput = {
  prompt: string;
  pages: PageLike[];
  structuredInput?: StructuredSiteInput | null;
  knowledgeBaseClient?: KnowledgeBaseClient | null;
  enabled: boolean;
  concurrency?: number;
  fastMode?: boolean;
};

export type BuildScopedRagOutput = {
  byPath: Record<string, ScopedRagPageResult>;
  summary: {
    enabled: boolean;
    pageCount: number;
    usedPageCount: number;
    queryCount: number;
    sourceCount: number;
  };
};

const dedupe = <T,>(items: T[]) => Array.from(new Set(items));

const normalizeFieldList = (fields: FactField[]) => dedupe(fields).filter(Boolean);

const requiredFieldsByPageType = (pageType: EnterprisePageType): FactField[] => {
  switch (pageType) {
    case "home":
      return ["company", "products"];
    case "products":
      return ["products", "specs", "company"];
    case "pricing":
      return ["products", "specs", "company"];
    case "solutions":
      return ["cases", "products", "company"];
    case "cases":
      return ["cases", "products", "company"];
    case "about":
      return ["company", "cases"];
    case "contact":
      return ["company"];
    case "support":
      return ["faq", "company"];
    case "blog":
      return ["company", "cases"];
    case "legal":
      return [];
    case "generic":
    default:
      return ["company", "products"];
  }
};

const detectCoveredFieldsFromStructuredInput = (
  structuredInput: StructuredSiteInput | null | undefined
): Set<FactField> => {
  const covered = new Set<FactField>();
  const company = structuredInput?.company;
  if (company?.name || company?.summary || company?.website) {
    covered.add("company");
  }
  if (Array.isArray(structuredInput?.products) && structuredInput!.products!.length > 0) {
    covered.add("products");
  }
  if (
    Array.isArray(structuredInput?.products) &&
    structuredInput!.products!.some((item) => item?.specs && Object.keys(item.specs).length > 0)
  ) {
    covered.add("specs");
  }
  if (Array.isArray(structuredInput?.cases) && structuredInput!.cases!.length > 0) {
    covered.add("cases");
  }
  if (Array.isArray(structuredInput?.faqs) && structuredInput!.faqs!.length > 0) {
    covered.add("faq");
  }
  return covered;
};

const buildScopedPrompt = (prompt: string, pagePath: string, pageName: string, pageType: EnterprisePageType, fields: FactField[]) =>
  `${String(prompt || "").trim()}

# Page Scoped Retrieval Contract
Current page path: ${pagePath}
Current page name: ${pageName || pagePath}
Current page type: ${pageType}
Required enrichment fields for this page: ${fields.join(", ") || "none"}
Return only concise facts for this page scope.`;

const buildScopedQueryHints = (input: {
  pageType: EnterprisePageType;
  pagePath: string;
  requiredFields: FactField[];
  structuredInput?: StructuredSiteInput | null;
}) => {
  const hints: string[] = [];
  const companyName = String(input.structuredInput?.company?.name || "").trim();
  const website = String(input.structuredInput?.company?.website || "").trim();
  if (companyName) hints.push(`${companyName} ${input.pageType}`);
  if (companyName && website) hints.push(`${companyName} site:${website.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split(/[/?#]/)[0]}`);
  const fieldHintByName: Record<FactField, string> = {
    company: "company profile history certifications 联系方式",
    products: "product catalog models 产品 机型",
    specs: "specifications parameters 精度 行程 主轴",
    cases: "case studies applications 应用案例",
    faq: "faq support service 常见问题",
  };
  input.requiredFields.forEach((field) => {
    hints.push(`${companyName || "company"} ${fieldHintByName[field]} ${input.pageType}`);
  });
  if (input.pagePath) hints.push(`${companyName || "company"} ${input.pagePath}`);
  return dedupe(hints.map((item) => item.trim()).filter(Boolean)).slice(0, 8);
};

const extractQueriesFromFactPackContext = (context: string): string[] => {
  const lines = String(context || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return dedupe(
    lines
      .filter((line) => line.startsWith("- "))
      .map((line) => line.replace(/^-+\s*/, "").slice(0, 180))
      .filter(Boolean)
  ).slice(0, 6);
};

const runWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> => {
  const resolvedLimit = Math.max(1, Number.isFinite(limit) ? Math.floor(limit) : 1);
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const runners = new Array(Math.min(resolvedLimit, items.length)).fill(null).map(async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
};

export const buildScopedRagContextByPage = async (input: BuildScopedRagInput): Promise<BuildScopedRagOutput> => {
  const pages = Array.isArray(input.pages) ? input.pages : [];
  const structuredInput = input.structuredInput ?? null;
  const knowledgeBaseClient = input.knowledgeBaseClient ?? null;
  const coveredByStructured = detectCoveredFieldsFromStructuredInput(structuredInput);
  const concurrency = Math.max(1, Number(input.concurrency || 2));
  const enabled = Boolean(input.enabled);
  const fastMode = Boolean(input.fastMode);

  const results = await runWithConcurrency(
    pages,
    concurrency,
    async (page): Promise<ScopedRagPageResult> => {
      const path = normalizeSitePath(page?.path || "/");
      const pageName = String(page?.name || "").trim();
      const pageQueryHints = Array.isArray(page?.queryHints) ? page.queryHints : [];
      const pageType = inferEnterprisePageTypeFromPath(path);
      const requiredFields = normalizeFieldList(requiredFieldsByPageType(pageType));
      const coveredFields = requiredFields.filter((field) => coveredByStructured.has(field));
      const missingFields = requiredFields.filter((field) => !coveredByStructured.has(field));

      if (!enabled || missingFields.length === 0) {
        return {
          path,
          pageType,
          requiredFields,
          coveredFields,
          missingFields,
          queryCount: 0,
          sourceCount: 0,
          used: false,
          context: "",
          queries: [],
        };
      }

      let coveredAfterKnowledgeBase: FactField[] = [...coveredFields];
      let missingAfterKnowledgeBase: FactField[] = [...missingFields];
      let knowledgeBaseContext = "";
      let knowledgeBaseQueryCount = 0;
      let knowledgeBaseSourceCount = 0;
      if (!fastMode && knowledgeBaseClient?.isAvailable()) {
        try {
          const knowledgeResult = await knowledgeBaseClient.retrieve({
            prompt: input.prompt,
            pagePath: path,
            pageName,
            pageType,
            fields: missingFields,
          });
          knowledgeBaseContext = knowledgeResult.context;
          knowledgeBaseQueryCount = Number(knowledgeResult.queryCount || 0);
          knowledgeBaseSourceCount = Number(knowledgeResult.sourceCount || 0);
          const coveredByKnowledge = Array.from(
            new Set(
              (knowledgeResult.coveredFields || []).filter((field): field is FactField =>
                ["company", "products", "specs", "cases", "faq"].includes(field)
              )
            )
          );
          coveredAfterKnowledgeBase = Array.from(
            new Set<FactField>([...coveredAfterKnowledgeBase, ...coveredByKnowledge])
          );
          missingAfterKnowledgeBase = missingFields.filter((field) => !coveredAfterKnowledgeBase.includes(field));
        } catch {
          // ignore knowledge base errors and fallback to search
        }
      }
      const scopedPrompt = buildScopedPrompt(input.prompt, path, pageName, pageType, missingAfterKnowledgeBase);
      const scopedQueryHints = dedupe([
        ...pageQueryHints,
        ...buildScopedQueryHints({
          pageType,
          pagePath: path,
          requiredFields: missingAfterKnowledgeBase,
          structuredInput,
        }),
      ]).slice(0, fastMode ? 5 : 10);
      const factPack =
        missingAfterKnowledgeBase.length > 0
          ? await buildSerperFactPack(scopedPrompt, {
              structuredInput,
              retrievalContext: {
                companyName: String(structuredInput?.company?.name || "").trim(),
                companyWebsite: String(structuredInput?.company?.website || "").trim(),
                pageType,
                pagePath: path,
              },
              queryHints: scopedQueryHints,
              queryMode: "prepend",
              maxQueries: fastMode ? 3 : undefined,
              timeoutMs: fastMode ? 5000 : undefined,
              maxDurationMs: fastMode ? 9000 : undefined,
            })
          : {
              enabled: false,
              used: false,
              queryCount: 0,
              queries: [] as string[],
              sourceCount: 0,
              context: "",
              requiredFields: requiredFields as FactField[],
              coveredFields: [] as FactField[],
              missingFields: requiredFields as FactField[],
            };
      const context = [knowledgeBaseContext, factPack.context].filter(Boolean).join("\n");
      const coveredBySearch: FactField[] = factPack.coveredFields
        .filter((field): field is FactField =>
          ["company", "products", "specs", "cases", "faq"].includes(field)
        )
        .map((field) => field as FactField);
      const mergedCovered: FactField[] = Array.from(
        new Set<FactField>([...coveredAfterKnowledgeBase, ...coveredBySearch])
      );
      const mergedMissing = requiredFields.filter((field) => !mergedCovered.includes(field));
      return {
        path,
        pageType,
        requiredFields,
        coveredFields: mergedCovered,
        missingFields: mergedMissing,
        queryCount: Number(factPack.queryCount || 0) + knowledgeBaseQueryCount,
        sourceCount: Number(factPack.sourceCount || 0) + knowledgeBaseSourceCount,
        used: Boolean(knowledgeBaseContext) || factPack.used,
        context,
        queries: dedupe([...(factPack.queries || []), ...extractQueriesFromFactPackContext(context)]).slice(0, 8),
      };
    }
  );

  const byPath = results.reduce<Record<string, ScopedRagPageResult>>((acc, item) => {
    acc[item.path] = item;
    return acc;
  }, {});
  const usedPageCount = results.filter((item) => item.used).length;
  const queryCount = results.reduce((sum, item) => sum + Number(item.queryCount || 0), 0);
  const sourceCount = results.reduce((sum, item) => sum + Number(item.sourceCount || 0), 0);

  return {
    byPath,
    summary: {
      enabled,
      pageCount: results.length,
      usedPageCount,
      queryCount,
      sourceCount,
    },
  };
};
