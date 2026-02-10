import Anthropic from "@anthropic-ai/sdk";
import { HttpsProxyAgent } from "https-proxy-agent";

type LlmProviderName = "aiberm" | "openrouter" | "anthropic";

type LlmProviderClient = {
  name: LlmProviderName;
  client: Anthropic;
};

function getProxyAgent() {
  const proxyUrl = process.env.PROXY_URL || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
  if (proxyUrl) {
    return new HttpsProxyAgent(proxyUrl);
  }
  return undefined;
}

const agent = getProxyAgent();

const parseProviderName = (value: string | undefined | null): LlmProviderName | null => {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "aiberm" || normalized === "openrouter" || normalized === "anthropic") {
    return normalized as LlmProviderName;
  }
  return null;
};

const buildOrder = () => {
  const explicitOrder = (process.env.LLM_PROVIDER_ORDER ?? "")
    .split(",")
    .map((part) => parseProviderName(part))
    .filter(Boolean) as LlmProviderName[];
  const primary = parseProviderName(process.env.LLM_PROVIDER);
  const defaults: LlmProviderName[] = ["aiberm", "openrouter", "anthropic"];
  const preferred = explicitOrder.length
    ? explicitOrder
    : primary
      ? [primary, ...defaults.filter((item) => item !== primary)]
      : defaults;
  return Array.from(new Set(preferred));
};

const providerConfigs: Record<
  LlmProviderName,
  {
    apiKey: string;
    baseURL?: string;
    timeout: number;
    maxRetries: number;
    defaultHeaders?: Record<string, string>;
  }
> = {
  aiberm: {
    apiKey: process.env.AIBERM_API_KEY ?? "",
    baseURL: process.env.AIBERM_BASE_URL || "https://aiberm.com",
    timeout: Number(
      process.env.AIBERM_TIMEOUT_MS ||
        process.env.OPENROUTER_TIMEOUT_MS ||
        process.env.ANTHROPIC_TIMEOUT_MS ||
        60000
    ),
    maxRetries: Number(process.env.AIBERM_MAX_RETRIES || process.env.OPENROUTER_MAX_RETRIES || 1),
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api",
    timeout: Number(
      process.env.OPENROUTER_TIMEOUT_MS ||
        process.env.AIBERM_TIMEOUT_MS ||
        process.env.ANTHROPIC_TIMEOUT_MS ||
        60000
    ),
    maxRetries: Number(process.env.OPENROUTER_MAX_RETRIES || process.env.AIBERM_MAX_RETRIES || 1),
    defaultHeaders: {
      "HTTP-Referer": "https://github.com/anomalyco/opencode",
      "X-Title": "opencode",
    },
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
    timeout: Number(
      process.env.ANTHROPIC_TIMEOUT_MS ||
        process.env.AIBERM_TIMEOUT_MS ||
        process.env.OPENROUTER_TIMEOUT_MS ||
        60000
    ),
    maxRetries: Number(process.env.ANTHROPIC_MAX_RETRIES || process.env.AIBERM_MAX_RETRIES || 1),
  },
};

const createClient = (name: LlmProviderName): LlmProviderClient | null => {
  const config = providerConfigs[name];
  if (!config.apiKey) return null;
  const client = new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    timeout: config.timeout,
    maxRetries: config.maxRetries,
    httpAgent: agent,
    defaultHeaders: config.defaultHeaders,
  });
  return { name, client };
};

const llmProviders = buildOrder()
  .map((name) => createClient(name))
  .filter(Boolean) as LlmProviderClient[];

const llm = llmProviders[0]?.client;

export type { LlmProviderName, LlmProviderClient };
export { llm, llmProviders };
