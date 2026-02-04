import Anthropic from "@anthropic-ai/sdk";
import { HttpsProxyAgent } from "https-proxy-agent";

function getProxyAgent() {
  const proxyUrl = process.env.PROXY_URL || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
  if (proxyUrl) {
    return new HttpsProxyAgent(proxyUrl);
  }
  return undefined;
}

const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY;
const agent = getProxyAgent();
const timeout = Number(process.env.OPENROUTER_TIMEOUT_MS || process.env.ANTHROPIC_TIMEOUT_MS || 60000);
const maxRetries = Number(process.env.OPENROUTER_MAX_RETRIES || 1);

const llm = new Anthropic({
  apiKey,
  baseURL: "https://openrouter.ai/api",
  timeout,
  maxRetries,
  httpAgent: agent,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/anomalyco/opencode",
    "X-Title": "opencode"
  }
});

export { llm };
