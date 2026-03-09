#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const parseArgs = (argv) => {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg.startsWith("--") && next && !next.startsWith("--")) {
      out[arg.slice(2)] = next;
      i += 1;
      continue;
    }
    if (arg.startsWith("--")) out[arg.slice(2)] = "true";
  }
  return out;
};

const normalizePath = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
};

const parseJsonMaybe = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const loadClaudePencilServerConfig = async (serverName = "pencil") => {
  const configPath = path.join(os.homedir(), ".claude.json");
  const raw = await fs.readFile(configPath, "utf8");
  const parsed = JSON.parse(raw);
  const entry = parsed?.mcpServers?.[serverName];
  if (!entry || typeof entry !== "object") return null;
  const command = String(entry?.command || "").trim();
  if (!command) return null;
  const args = Array.isArray(entry?.args) ? entry.args.map((item) => String(item)) : [];
  return { command, args };
};

const sendRpcLine = (child, payload) => {
  child.stdin.write(`${JSON.stringify(payload)}\n`);
};

const resolveConnection = async ({ app = "desktop", command = "", serverName = "pencil" } = {}) => {
  const explicit = String(command || "").trim();
  if (explicit) {
    return { command: explicit, args: app ? ["--app", app] : [] };
  }
  const fromClaude = await loadClaudePencilServerConfig(serverName).catch(() => null);
  if (!fromClaude) throw new Error("No pencil MCP config found in ~/.claude.json");
  const args = [...fromClaude.args];
  if (app && !args.includes("--app")) args.push("--app", app);
  return { command: fromClaude.command, args };
};

const callPencilTools = async ({ penFile = "", command = "", args = [], timeoutMs = 20000 } = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdoutBuffer = "";
    let stderr = "";
    let settled = false;
    let requestId = 1;
    let initialized = false;
    let opened = false;
    let batchGetResult = null;

    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { child.kill("SIGTERM"); } catch {}
      if (error) {
        const msg = error instanceof Error ? error.message : String(error);
        reject(new Error(`${msg}${stderr ? `\n${stderr}` : ""}`));
        return;
      }
      resolve(result);
    };

    const sendInitialize = () => {
      sendRpcLine(child, {
        jsonrpc: "2.0",
        id: requestId,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          clientInfo: { name: "template-factory-pencil-export", version: "1.0.0" },
          capabilities: {},
        },
      });
      requestId += 1;
    };

    const sendOpenDocument = () => {
      sendRpcLine(child, { jsonrpc: "2.0", method: "notifications/initialized", params: {} });
      sendRpcLine(child, {
        jsonrpc: "2.0",
        id: requestId,
        method: "tools/call",
        params: {
          name: "open_document",
          arguments: { filePathOrTemplate: penFile },
        },
      });
      requestId += 1;
    };

    const sendBatchGet = () => {
      sendRpcLine(child, {
        jsonrpc: "2.0",
        id: requestId,
        method: "tools/call",
        params: {
          name: "batch_get",
          arguments: {
            filePath: penFile,
            readDepth: 4,
          },
        },
      });
      requestId += 1;
    };

    const handleLine = (line) => {
      const raw = String(line || "").trim();
      if (!raw) return;
      const msg = parseJsonMaybe(raw);
      if (!msg) return;
      if (msg?.error) {
        finish(new Error(`MCP error: ${JSON.stringify(msg.error)}`));
        return;
      }
      if (!initialized && msg?.result?.serverInfo) {
        initialized = true;
        sendOpenDocument();
        return;
      }
      if (initialized && !opened && msg?.result?.content) {
        opened = true;
        sendBatchGet();
        return;
      }
      if (opened && msg?.result?.content) {
        batchGetResult = msg.result;
        finish(null, batchGetResult);
      }
    };

    child.stdout.on("data", (chunk) => {
      stdoutBuffer += String(chunk);
      const lines = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = lines.pop() || "";
      for (const line of lines) handleLine(line);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => finish(error));
    child.on("close", (code) => {
      if (!settled && code !== 0) finish(new Error(`pencil MCP exited with code=${code}`));
    });
    const timer = setTimeout(() => finish(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs);
    sendInitialize();
  });

const normalizeBlockType = (node = {}, index = 0) => {
  const source = `${String(node?.name || "")} ${String(node?.type || "")} ${String(node?.ref || "")}`.toLowerCase();
  if (/nav|header|menu/.test(source)) return "Navbar";
  if (/hero/.test(source)) return "HeroSplit";
  if (/feature.*media|story|split/.test(source)) return "FeatureWithMedia";
  if (/feature.*grid|approach/.test(source)) return "FeatureGrid";
  if (/card|product|catalog/.test(source)) return "CardsGrid";
  if (/testimonial|social/.test(source)) return "TestimonialsGrid";
  if (/lead|cta|contact/.test(source)) return "LeadCaptureCTA";
  if (/footer/.test(source)) return "Footer";
  if (/hero.*center/.test(source)) return "HeroCentered";
  return index === 0 ? "Navbar" : "CreationFallbackSection";
};

const textFromNode = (node = {}) => {
  const texts = [];
  const walk = (entry) => {
    if (!entry || typeof entry !== "object") return;
    if (entry.type === "text" && typeof entry.content === "string" && entry.content.trim()) {
      texts.push(entry.content.trim());
    }
    if (Array.isArray(entry.children)) {
      for (const child of entry.children) walk(child);
    }
  };
  walk(node);
  return texts;
};

const toPayloadSection = (node = {}, index = 0) => {
  const blockType = normalizeBlockType(node, index);
  const texts = textFromNode(node);
  return {
    type: blockType,
    _key: String(node?.id || `${String(blockType).toLowerCase()}-${index + 1}`),
    props: {
      title: texts[0] || String(node?.name || blockType),
      subtitle: texts[1] || "",
      body: texts.slice(2).join(" "),
    },
  };
};

const toPayload = (nodes = []) => {
  const sections = (Array.isArray(nodes) ? nodes : []).map((node, index) => toPayloadSection(node, index));
  return {
    components: [],
    pages: [
      {
        path: "/",
        name: "Home",
        data: {
          root: { props: { theme: {} } },
          content: sections,
        },
      },
    ],
  };
};

const main = async () => {
  const args = parseArgs(process.argv);
  const penFile = normalizePath(args["pen-file"]);
  const outPath = normalizePath(args.out);
  if (!penFile || !outPath) {
    throw new Error("[pencil-export-payload] required args: --pen-file --out");
  }
  const mcpApp = String(args["mcp-app"] || "desktop").trim() || "desktop";
  const mcpServerName = String(args["mcp-server-name"] || "pencil").trim() || "pencil";
  const mcpCommand = String(args["mcp-command"] || "").trim();
  const connection = await resolveConnection({ app: mcpApp, command: mcpCommand, serverName: mcpServerName });
  const result = await callPencilTools({
    penFile,
    command: connection.command,
    args: connection.args,
    timeoutMs: Number(args["timeout-ms"] || 25000) || 25000,
  });
  const contentRows = Array.isArray(result?.content) ? result.content : [];
  const textRow = contentRows.find((row) => row?.type === "text" && typeof row?.text === "string");
  const nodes = Array.isArray(parseJsonMaybe(textRow?.text)) ? parseJsonMaybe(textRow?.text) : [];
  const payload = toPayload(nodes);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        penFile,
        mcp: {
          command: connection.command,
          args: connection.args,
        },
        nodeCount: nodes.length,
        payload,
      },
      null,
      2
    )
  );
  process.stdout.write(JSON.stringify({ ok: true, outPath, nodeCount: nodes.length }) + "\n");
};

main().catch((error) => {
  const message = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
  process.stderr.write(`[pencil-export-payload:fatal] ${message}\n`);
  process.exit(1);
});

