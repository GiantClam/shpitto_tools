import Anthropic from "@anthropic-ai/sdk";
import { HttpsProxyAgent } from "https-proxy-agent";
import fs from "fs";
import path from "path";

// Simple .env parser
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  content.split("\n").forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

// Load environment variables from parent directory
const rootEnvPath = path.resolve(process.cwd(), "../.env");
console.log(`Loading env from: ${rootEnvPath}`);
loadEnv(rootEnvPath);

// Also try local .env
const localEnvPath = path.resolve(process.cwd(), ".env.local");
loadEnv(localEnvPath);

console.log("Testing OpenRouter connection...");
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY;
console.log("API Key present:", !!apiKey);
if (apiKey) {
    console.log("API Key prefix:", apiKey.substring(0, 10) + "...");
}

const proxyUrl = process.env.PROXY_URL || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
console.log("Proxy URL:", proxyUrl || "Not set");

function getProxyAgent() {
  if (proxyUrl) {
    console.log("Using proxy agent:", proxyUrl);
    return new HttpsProxyAgent(proxyUrl);
  }
  return undefined;
}

const agent = getProxyAgent();

const llm = new Anthropic({
  apiKey,
  baseURL: "https://openrouter.ai/api",
  httpAgent: agent,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/anomalyco/opencode",
    "X-Title": "opencode"
  }
});

async function test() {
  try {
    console.log("Sending request to OpenRouter...");
    const response = await llm.messages.create({
      model: "anthropic/claude-3-haiku", 
      max_tokens: 10,
      messages: [{ role: "user", content: "Hello" }],
    });
    console.log("Connection successful!");
    console.log("Response:", response.content[0].text);
  } catch (error) {
    console.error("Connection failed!");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}

test();
