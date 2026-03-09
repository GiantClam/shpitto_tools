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

const sanitizeNodeType = (value) => {
  const token = String(value || "").trim();
  return token || "Section";
};

const toSectionNode = (entry = {}, index = 0) => ({
  id: String(entry?._key || `${String(entry?.type || "section").toLowerCase()}-${index + 1}`),
  type: sanitizeNodeType(entry?.type),
  props: entry?.props && typeof entry.props === "object" ? entry.props : {},
});

const toPageFrame = (page = {}, index = 0) => {
  const routePath = String(page?.path || "/");
  const name = String(page?.name || "").trim() || (routePath === "/" ? "Home" : routePath);
  const content = Array.isArray(page?.data?.content) ? page.data.content : [];
  return {
    id: `page-${index + 1}`,
    name,
    path: routePath,
    children: content.map((entry, itemIndex) => toSectionNode(entry, itemIndex)),
    theme: page?.data?.root?.props?.theme && typeof page.data.root.props.theme === "object" ? page.data.root.props.theme : {},
  };
};

const parseJsonArrayArg = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item));
  } catch {
    return [];
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
  return { command, args, source: configPath };
};

const sendRpcLine = (child, payload) => {
  child.stdin.write(`${JSON.stringify(payload)}\n`);
};

const runMcpHealthcheck = async ({ command, args = [], timeoutMs = 15000 }) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdoutBuffer = "";
    let stderr = "";
    let settled = false;

    const finishOk = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { child.kill("SIGTERM"); } catch {}
      resolve(result);
    };

    const finishErr = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { child.kill("SIGTERM"); } catch {}
      const message = error instanceof Error ? error.message : String(error);
      reject(new Error(`${message}${stderr ? `\n${stderr}` : ""}`));
    };

    const onLine = (line) => {
      const token = String(line || "").trim();
      if (!token) return;
      let msg;
      try {
        msg = JSON.parse(token);
      } catch {
        return;
      }
      if (msg?.id === 1 && msg?.result) {
        sendRpcLine(child, { jsonrpc: "2.0", method: "notifications/initialized", params: {} });
        sendRpcLine(child, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
        return;
      }
      if (msg?.id === 2) {
        if (msg?.error) {
          finishErr(new Error(`tools/list failed: ${JSON.stringify(msg.error)}`));
          return;
        }
        const tools = Array.isArray(msg?.result?.tools) ? msg.result.tools : [];
        finishOk({
          ok: true,
          toolCount: tools.length,
          toolNames: tools.map((tool) => String(tool?.name || "").trim()).filter(Boolean),
        });
      }
    };

    child.stdout.on("data", (chunk) => {
      stdoutBuffer += String(chunk);
      const lines = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = lines.pop() || "";
      for (const line of lines) onLine(line);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      finishErr(error);
    });

    child.on("close", (code) => {
      if (!settled && code !== 0) {
        finishErr(new Error(`mcp process exited with code=${code}`));
      }
    });

    const timer = setTimeout(() => {
      finishErr(new Error(`mcp handshake timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    sendRpcLine(child, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        clientInfo: { name: "template-factory-pencil-bridge", version: "1.0.0" },
        capabilities: {},
      },
    });
  });

const resolveMcpConnection = async (args) => {
  const explicitCommand = String(args["mcp-command"] || "").trim();
  const explicitArgs = parseJsonArrayArg(args["mcp-args-json"]);
  const explicitApp = String(args["mcp-app"] || "").trim();
  if (explicitCommand) {
    const mergedArgs = explicitArgs.length > 0 ? explicitArgs : [];
    if (explicitApp && !mergedArgs.includes("--app")) {
      mergedArgs.push("--app", explicitApp);
    }
    return {
      command: explicitCommand,
      args: mergedArgs,
      source: "cli",
    };
  }

  const serverName = String(args["mcp-server-name"] || "pencil").trim() || "pencil";
  const fromClaude = await loadClaudePencilServerConfig(serverName).catch(() => null);
  if (!fromClaude) return null;
  const outArgs = [...fromClaude.args];
  if (explicitApp && !outArgs.includes("--app")) {
    outArgs.push("--app", explicitApp);
  }
  return {
    command: fromClaude.command,
    args: outArgs,
    source: fromClaude.source,
  };
};

const main = async () => {
  const args = parseArgs(process.argv);
  const sourcePath = normalizePath(args.source);
  const payloadPath = normalizePath(args.payload);
  const outputPath = normalizePath(args.output);
  if (!sourcePath || !payloadPath || !outputPath) {
    throw new Error("[pencil-mcp-bridge] required args: --source --payload --output");
  }

  const mcpRequired = args["mcp-required"] === "true";
  const mcpTimeoutMs = Number(args["mcp-timeout-ms"] || 15000) || 15000;
  const mcpConfig = await resolveMcpConnection(args);
  let mcpProbe = {
    attempted: false,
    connected: false,
    source: "",
    command: "",
    args: [],
    toolCount: 0,
    toolNames: [],
    error: "",
  };

  if (mcpConfig?.command) {
    mcpProbe.attempted = true;
    mcpProbe.source = mcpConfig.source;
    mcpProbe.command = mcpConfig.command;
    mcpProbe.args = mcpConfig.args;
    try {
      const checked = await runMcpHealthcheck({
        command: mcpConfig.command,
        args: mcpConfig.args,
        timeoutMs: mcpTimeoutMs,
      });
      mcpProbe.connected = Boolean(checked?.ok);
      mcpProbe.toolCount = Number(checked?.toolCount || 0);
      mcpProbe.toolNames = Array.isArray(checked?.toolNames) ? checked.toolNames : [];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      mcpProbe.error = message;
      if (mcpRequired) {
        throw new Error(`[pencil-mcp-bridge] failed to connect MCP server: ${message}`);
      }
    }
  } else if (mcpRequired) {
    throw new Error("[pencil-mcp-bridge] --mcp-required enabled, but no MCP server config was found.");
  }

  const [sourceRaw, payloadRaw] = await Promise.all([fs.readFile(sourcePath, "utf8"), fs.readFile(payloadPath, "utf8")]);
  const source = JSON.parse(sourceRaw);
  const payload = JSON.parse(payloadRaw);
  const pages = Array.isArray(payload?.pages) ? payload.pages : [];
  const components = Array.isArray(payload?.components) ? payload.components : [];

  const penDoc = {
    schemaVersion: "pencil.pen.v1",
    generatedAt: new Date().toISOString(),
    source: {
      caseId: String(args["case-id"] || source?.caseId || "").trim(),
      siteKey: String(args["site-key"] || source?.siteKey || "").trim(),
      sourceUrl: String(args["source-url"] || source?.sourceUrl || "").trim(),
      previewUrl: String(args["preview-url"] || source?.previewUrl || "").trim(),
      sourcePenPath: sourcePath,
      payloadPath,
      pencilMcp: mcpProbe,
    },
    document: {
      type: "document",
      pages: pages.map((page, pageIndex) => toPageFrame(page, pageIndex)),
      components: components.map((component) => ({
        name: String(component?.name || "").trim(),
        hasCode: Boolean(String(component?.code || "").trim()),
      })),
    },
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(penDoc, null, 2));
  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      outputPath,
      pageCount: penDoc.document.pages.length,
      componentCount: penDoc.document.components.length,
      mcpConnected: mcpProbe.connected,
      mcpToolCount: mcpProbe.toolCount,
      mcpCommand: mcpProbe.command || "",
    })}\n`,
  );
};

main().catch((error) => {
  const message = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
  process.stderr.write(`[pencil-mcp-bridge:fatal] ${message}\n`);
  process.exit(1);
});

