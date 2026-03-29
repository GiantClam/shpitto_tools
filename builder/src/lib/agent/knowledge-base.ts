type FactField = "company" | "products" | "specs" | "cases" | "faq";

export type KnowledgeBaseQueryInput = {
  prompt: string;
  pagePath: string;
  pageName: string;
  pageType: string;
  fields: FactField[];
};

export type KnowledgeBaseRetrieveResult = {
  context: string;
  coveredFields: FactField[];
  queryCount: number;
  sourceCount: number;
  used: boolean;
};

export interface KnowledgeBaseClient {
  isAvailable(): boolean;
  retrieve(input: KnowledgeBaseQueryInput): Promise<KnowledgeBaseRetrieveResult>;
}

const parseEnvBoolean = (value: string | undefined, fallback: boolean) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

const normalizeContext = (value: unknown) =>
  String(value || "")
    .replace(/\s+\n/g, "\n")
    .trim();

const detectCoveredFields = (text: string): FactField[] => {
  const token = String(text || "").toLowerCase();
  const fields: FactField[] = [];
  if (/(company|about|profile|overview|mission|history|企业|公司|简介|介绍)/.test(token)) fields.push("company");
  if (/(product|catalog|model|machine|portfolio|产品|机型|设备)/.test(token)) fields.push("products");
  if (/(spec|parameter|rpm|precision|tolerance|行程|精度|参数|规格|主轴)/.test(token)) fields.push("specs");
  if (/(case|customer|deployment|result|应用案例|客户案例|项目案例)/.test(token)) fields.push("cases");
  if (/(faq|question|support|help|常见问题|问答)/.test(token)) fields.push("faq");
  return Array.from(new Set(fields));
};

const buildDefaultQueries = (input: KnowledgeBaseQueryInput) => {
  const base = `${input.pageName || input.pagePath} ${input.pageType}`.trim();
  return input.fields.map((field) => `${base} ${field}`.trim()).filter(Boolean);
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  const safeTimeout = Math.max(1000, Math.floor(timeoutMs));
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("knowledge_base_timeout")), safeTimeout);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

class HttpKnowledgeBaseClient implements KnowledgeBaseClient {
  constructor(
    private readonly endpoint: string,
    private readonly apiKey: string,
    private readonly timeoutMs: number
  ) {}

  isAvailable() {
    return Boolean(this.endpoint);
  }

  async retrieve(input: KnowledgeBaseQueryInput): Promise<KnowledgeBaseRetrieveResult> {
    if (!this.isAvailable()) {
      return { context: "", coveredFields: [], queryCount: 0, sourceCount: 0, used: false };
    }
    const queries = buildDefaultQueries(input);
    if (!queries.length) {
      return { context: "", coveredFields: [], queryCount: 0, sourceCount: 0, used: false };
    }

    const response = await withTimeout(
      fetch(this.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          prompt: input.prompt,
          pagePath: input.pagePath,
          pageName: input.pageName,
          pageType: input.pageType,
          fields: input.fields,
          queries,
        }),
      }),
      this.timeoutMs
    );
    if (!response.ok) {
      throw new Error(`knowledge_base_http_${response.status}`);
    }
    const payload = (await response.json()) as Record<string, unknown>;
    const context = normalizeContext(payload.context ?? payload.result ?? payload.text);
    const sourceCount = Array.isArray(payload.sources) ? payload.sources.length : Number(payload.sourceCount || 0);
    const coveredFields = Array.isArray(payload.coveredFields)
      ? (payload.coveredFields as unknown[])
          .map((item) => String(item || "").trim().toLowerCase())
          .filter((item): item is FactField =>
            item === "company" || item === "products" || item === "specs" || item === "cases" || item === "faq"
          )
      : detectCoveredFields(context);
    return {
      context,
      coveredFields,
      queryCount: queries.length,
      sourceCount: Number.isFinite(sourceCount) ? Math.max(0, sourceCount) : 0,
      used: Boolean(context),
    };
  }
}

export const createKnowledgeBaseClientFromEnv = (): KnowledgeBaseClient | null => {
  const enabled = parseEnvBoolean(process.env.KNOWLEDGE_BASE_ENABLED, false);
  if (!enabled) return null;
  const endpoint = String(process.env.KNOWLEDGE_BASE_ENDPOINT || "").trim();
  if (!endpoint) return null;
  const apiKey = String(process.env.KNOWLEDGE_BASE_API_KEY || "").trim();
  const timeoutMs = Number(process.env.KNOWLEDGE_BASE_TIMEOUT_MS || 10000);
  return new HttpKnowledgeBaseClient(endpoint, apiKey, timeoutMs);
};
