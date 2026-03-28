import Anthropic from "@anthropic-ai/sdk";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ensureEnvFallbackLoaded } from "@/lib/env/load-env-fallback";

ensureEnvFallbackLoaded();

type LlmProviderName = "aiberm" | "openrouter" | "anthropic";

type LlmProviderClient = {
  name: LlmProviderName;
  client: Anthropic;
};

const isTruthy = (value: string | undefined | null) => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
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

const resolveApiKey = (primary: string | undefined, aliases: string[] = []) => {
  if (typeof primary === "string" && primary.trim().length > 0) return primary.trim();
  for (const alias of aliases) {
    const candidate = process.env[alias];
    if (typeof candidate === "string" && candidate.trim().length > 0) return candidate.trim();
  }
  return "";
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
  const order = Array.from(new Set(preferred));

  const enableOpenrouterFallback =
    process.env.LLM_OPENROUTER_FALLBACK === undefined
      ? true
      : isTruthy(process.env.LLM_OPENROUTER_FALLBACK);
  const hasOpenrouterKey = Boolean(
    resolveApiKey(process.env.OPENROUTER_API_KEY, ["OPENROUTER_KEY", "OR_API_KEY"])
  );
  const primaryProvider = order[0];
  if (
    enableOpenrouterFallback &&
    hasOpenrouterKey &&
    primaryProvider === "aiberm" &&
    !order.includes("openrouter")
  ) {
    order.splice(1, 0, "openrouter");
  }

  return order;
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
    apiKey: resolveApiKey(process.env.AIBERM_API_KEY, ["AIBERM_KEY"]),
    baseURL: process.env.AIBERM_BASE_URL || "https://aiberm.com/v1",
    timeout: Number(
      process.env.AIBERM_TIMEOUT_MS ||
        process.env.OPENROUTER_TIMEOUT_MS ||
        process.env.ANTHROPIC_TIMEOUT_MS ||
        60000
    ),
    maxRetries: Number(process.env.AIBERM_MAX_RETRIES || process.env.OPENROUTER_MAX_RETRIES || 1),
  },
  openrouter: {
    apiKey: resolveApiKey(process.env.OPENROUTER_API_KEY, ["OPENROUTER_KEY", "OR_API_KEY"]),
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
