#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { DEFAULT_OUT_DIR, DEFAULT_SOURCE_DIR, slugify, writeJson } from "../../scripts/lib/pen-exact-template-utils.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const VISUAL_QA_ROOT = path.resolve(SCRIPT_DIR, "..");
const DEFAULT_VISUAL_DIR = path.join(DEFAULT_OUT_DIR, "visual-validation");
const PENCIL_MCP_COMMAND = "/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64";

const parseArgs = (argv) => {
  const out = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (token.startsWith("--") && next && !next.startsWith("--")) {
      out[token.slice(2)] = next;
      index += 1;
      continue;
    }
    if (token.startsWith("--")) out[token.slice(2)] = "true";
  }
  return out;
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const camelToKebab = (value = "") => String(value).replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

const scaleNumber = (value, scale = 1) => {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return Number((value * scale).toFixed(4));
};

const cssPx = (value) => (typeof value === "number" ? `${value}px` : undefined);

const normalizeBoxValues = (value = []) => {
  if (!Array.isArray(value)) return null;
  if (value.length === 2) {
    const [vertical, horizontal] = value;
    return [vertical, horizontal, vertical, horizontal];
  }
  if (value.length === 4) return value;
  if (value.length === 1) return [value[0], value[0], value[0], value[0]];
  return null;
};

const flexAlignment = (value = "") =>
  ({
    start: "flex-start",
    end: "flex-end",
    center: "center",
    stretch: "stretch",
    space_between: "space-between",
    space_around: "space-around",
    space_evenly: "space-evenly",
  })[String(value || "").trim().toLowerCase()] || undefined;

const isAutoLayoutNode = (node = {}) => {
  if (!Array.isArray(node.children) || node.children.length === 0) return false;
  if (node.layout === "vertical") return true;
  if (node.layout && node.layout !== "none") return true;
  if (node.justifyContent || node.alignItems || node.gap || node.padding) {
    return node.children.some((child) => child && typeof child === "object" && child.x === undefined && child.y === undefined);
  }
  return false;
};

const resolveImageMode = (mode = "") =>
  ({
    fill: "cover",
    fit: "contain",
    stretch: "100% 100%",
  })[String(mode || "").trim().toLowerCase()] || "cover";

const linearGradientCss = (fill = {}) => {
  const rotation = typeof fill.rotation === "number" ? fill.rotation : 180;
  const stops = Array.isArray(fill.colors)
    ? fill.colors.map((entry) => `${entry.color} ${Math.round((Number(entry.position || 0) || 0) * 10000) / 100}%`)
    : [];
  if (!stops.length) return "";
  return `linear-gradient(${rotation}deg, ${stops.join(", ")})`;
};

const imageCache = new Map();

const mimeFromExtension = (value = "") =>
  ({
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
  })[String(value || "").trim().toLowerCase()] || "application/octet-stream";

const maybeToDataUri = async (source = "", assetMap = new Map()) => {
  const raw = String(source || "").trim();
  if (!raw) return "";
  if (/^data:/i.test(raw)) return raw;
  if (/^https?:/i.test(raw)) {
    if (imageCache.has(raw)) return imageCache.get(raw);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(raw, { signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") || mimeFromExtension(path.extname(new URL(raw).pathname).slice(1));
      const dataUri = `data:${contentType};base64,${buffer.toString("base64")}`;
      imageCache.set(raw, dataUri);
      return dataUri;
    } catch {
      imageCache.set(raw, raw);
      return raw;
    }
  }
  const resolved = assetMap.get(raw) || raw;
  if (!path.isAbsolute(resolved)) return resolved;
  if (imageCache.has(resolved)) return imageCache.get(resolved);
  try {
    const buffer = await fs.readFile(resolved);
    const ext = path.extname(resolved).slice(1).toLowerCase() || "png";
    const mime = mimeFromExtension(ext);
    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;
    imageCache.set(resolved, dataUri);
    return dataUri;
  } catch {
    imageCache.set(resolved, resolved);
    return resolved;
  }
};

const buildShadow = (effect = {}, scaleX = 1, scaleY = 1) => {
  if (effect?.type !== "shadow") return "";
  const offsetX = scaleNumber(effect?.offset?.x || 0, scaleX) || 0;
  const offsetY = scaleNumber(effect?.offset?.y || 0, scaleY) || 0;
  const blur = scaleNumber(effect?.blur || 0, Math.max(scaleX, scaleY)) || 0;
  const color = String(effect?.color || "").trim();
  if (!color) return "";
  return `${offsetX}px ${offsetY}px ${blur}px ${color}`;
};

const serializeStyle = (style = {}) =>
  Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${camelToKebab(key)}:${String(value)}`)
    .join(";");

const renderLucideIcon = (iconName = "") => {
  const common = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    globe:
      `<svg viewBox="0 0 24 24" ${common}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    search:
      `<svg viewBox="0 0 24 24" ${common}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    "shopping-bag":
      `<svg viewBox="0 0 24 24" ${common}><path d="M6 2h12l1 5H5l1-5Z"/><path d="M3 7h18l-1 14H4L3 7Z"/><path d="M9 10a3 3 0 0 0 6 0"/></svg>`,
    wrench:
      `<svg viewBox="0 0 24 24" ${common}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-3 3-2-2 3-3Z"/></svg>`,
    newspaper:
      `<svg viewBox="0 0 24 24" ${common}><path d="M5 22h14a2 2 0 0 0 2-2V5H7a2 2 0 0 0-2 2v15Z"/><path d="M5 22a2 2 0 0 1-2-2V9"/><path d="M9 9h8"/><path d="M9 13h8"/><path d="M9 17h5"/></svg>`,
    "heart-handshake":
      `<svg viewBox="0 0 24 24" ${common}><path d="M16 4a4 4 0 0 1 3.5 5.9L12 21l-7.5-11.1A4 4 0 0 1 8 4c1.7 0 3 1 4 2 1-1 2.3-2 4-2Z"/><path d="m8 12 2 2 5-5"/></svg>`,
    "message-square":
      `<svg viewBox="0 0 24 24" ${common}><path d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>`,
  };
  return icons[iconName] || "";
};

const iconFontHtml = (node = {}, styleText = "") => {
  const family = String(node.iconFontFamily || "").trim().toLowerCase();
  const name = String(node.iconFontName || "").trim();
  const size = Math.max(Number(node.width || 0), Number(node.height || 0), 16);
  if (family === "material symbols rounded") {
    return `<span data-pen-node="${escapeHtml(node.id || "")}" class="material-symbols-rounded" style="${styleText};font-size:${size}px;line-height:1">${escapeHtml(
      name
    )}</span>`;
  }
  if (family === "phosphor") {
    return `<i data-pen-node="${escapeHtml(node.id || "")}" class="ph ph-${escapeHtml(name)}" style="${styleText};font-size:${size}px;line-height:1"></i>`;
  }
  if (family === "lucide") {
    const svg = renderLucideIcon(name);
    return `<span data-pen-node="${escapeHtml(node.id || "")}" class="pen-icon-svg" style="${styleText}">${svg}</span>`;
  }
  return `<span data-pen-node="${escapeHtml(node.id || "")}" style="${styleText};font-size:${size}px;line-height:1">${escapeHtml(
    name
  )}</span>`;
};

const resolveNumeric = (value, scale = 1) => {
  if (typeof value === "number") return cssPx(scaleNumber(value, scale));
  return undefined;
};

const buildNodeStyle = async (node = {}, context, parent = null, scaleX = 1, scaleY = 1, isRoot = false) => {
  const style = {
    boxSizing: "border-box",
  };
  const autoLayout = isAutoLayoutNode(node);
  if (!isRoot && !autoLayout) {
    style.position = "absolute";
    if (typeof node.x === "number") style.left = cssPx(scaleNumber(node.x, scaleX));
    if (typeof node.y === "number") style.top = cssPx(scaleNumber(node.y, scaleY));
  }
  if (autoLayout) {
    style.display = "flex";
    style.flexDirection = node.layout === "vertical" ? "column" : "row";
    style.justifyContent = flexAlignment(node.justifyContent) || undefined;
    style.alignItems = flexAlignment(node.alignItems) || undefined;
    if (typeof node.gap === "number") style.gap = cssPx(scaleNumber(node.gap, Math.max(scaleX, scaleY)));
  }

  const width =
    node.width === "fill_container"
      ? "100%"
      : typeof node.width === "number"
        ? cssPx(scaleNumber(node.width, scaleX))
        : undefined;
  const height =
    node.height === "fill_container"
      ? "100%"
      : typeof node.height === "number"
        ? cssPx(scaleNumber(node.height, scaleY))
        : undefined;

  if (width) style.width = width;
  if (height) style.height = height;

  if (node.width === "fill_container" && autoLayout) style.flex = style.flex || "1 1 auto";
  if (node.height === "fill_container" && autoLayout && node.layout === "vertical") style.flex = style.flex || "1 1 auto";

  const padding = normalizeBoxValues(node.padding);
  if (padding) {
    style.padding = padding
      .map((value, index) => cssPx(scaleNumber(value, index % 2 === 0 ? scaleY : scaleX) || 0))
      .join(" ");
  }

  if (node.cornerRadius !== undefined) {
    const radius = scaleNumber(Number(node.cornerRadius || 0), Math.max(scaleX, scaleY));
    style.borderRadius = cssPx(radius || 0);
  }
  if (node.clip || node.cornerRadius !== undefined) style.overflow = "hidden";

  if (typeof node.fill === "string" && node.type !== "text" && node.type !== "icon_font" && node.type !== "path") {
    style.background = node.fill;
  }
  if (node.stroke && typeof node.stroke === "object") {
    const thickness = scaleNumber(Number(node.stroke.thickness || 0), Math.max(scaleX, scaleY)) || 0;
    if (thickness > 0 && node.stroke.fill) {
      style.border = `${thickness}px solid ${node.stroke.fill}`;
    }
  }
  if (node.effect) {
    const shadow = buildShadow(node.effect, scaleX, scaleY);
    if (shadow) style.boxShadow = shadow;
  }
  if (typeof node.opacity === "number") style.opacity = String(node.opacity);

  if (node.rotation !== undefined) {
    const rotation = Number(node.rotation);
    if (!Number.isNaN(rotation)) {
      const unit = Math.abs(rotation) <= Math.PI * 2 ? "rad" : "deg";
      style.transform = `${style.transform ? `${style.transform} ` : ""}rotate(${rotation}${unit})`;
      style.transformOrigin = "top left";
    }
  }

  if (node.type === "text" || node.type === "icon_font") {
    style.color = typeof node.fill === "string" ? node.fill : undefined;
    if (node.fontFamily) style.fontFamily = `"${String(node.fontFamily)}", "Helvetica Neue", Arial, sans-serif`;
    if (node.fontSize !== undefined) style.fontSize = resolveNumeric(Number(node.fontSize || 0), Math.max(scaleX, scaleY));
    if (node.fontWeight !== undefined) style.fontWeight = String(node.fontWeight);
    if (node.lineHeight !== undefined) {
      const lineHeight = Number(node.lineHeight);
      style.lineHeight = Number.isFinite(lineHeight)
        ? lineHeight <= 4
          ? String(lineHeight)
          : cssPx(scaleNumber(lineHeight, scaleY))
        : undefined;
    }
    if (node.letterSpacing !== undefined) {
      style.letterSpacing = cssPx(scaleNumber(Number(node.letterSpacing || 0), scaleX) || 0);
    }
    if (node.textAlign) style.textAlign = String(node.textAlign).toLowerCase();
    if (node.textAlignVertical) {
      style.display = "flex";
      style.alignItems =
        ({
          top: "flex-start",
          middle: "center",
          center: "center",
          bottom: "flex-end",
        })[String(node.textAlignVertical || "").trim().toLowerCase()] || style.alignItems;
      style.justifyContent =
        ({
          left: "flex-start",
          center: "center",
          right: "flex-end",
        })[String(node.textAlign || "").trim().toLowerCase()] || style.justifyContent;
    }
    style.whiteSpace = "pre-wrap";
    style.overflowWrap = "break-word";
  }

  if (node.fill && typeof node.fill === "object") {
    if (node.fill.type === "image") {
      const url = await maybeToDataUri(node.fill.url, context.assetMap);
      style.backgroundImage = `url('${String(url).replace(/'/g, "%27")}')`;
      style.backgroundRepeat = "no-repeat";
      style.backgroundPosition = "center center";
      style.backgroundSize = resolveImageMode(node.fill.mode);
    } else if (node.fill.type === "gradient") {
      style.backgroundImage = linearGradientCss(node.fill);
    }
  }

  if (node.type === "frame" && !autoLayout && !style.position && !isRoot) style.position = "absolute";
  if (isRoot) {
    style.position = "relative";
    style.left = undefined;
    style.top = undefined;
  }

  return style;
};

const renderNodeHtml = async (node, context, parent = null, isRoot = false) => {
  if (!node || typeof node !== "object" || node.enabled === false) return "";
  const style = await buildNodeStyle(node, context, parent, context.scaleX, context.scaleY, isRoot);
  const styleText = serializeStyle(style);

  if (node.type === "text") {
    return `<div data-pen-node="${escapeHtml(node.id || "")}" style="${escapeHtml(styleText)}">${escapeHtml(node.content || "")}</div>`;
  }

  if (node.type === "icon_font") {
    return iconFontHtml(node, escapeHtml(styleText));
  }

  if (node.type === "path") {
    return `<svg data-pen-node="${escapeHtml(node.id || "")}" style="${escapeHtml(styleText)}" viewBox="0 0 ${Number(
      node.width || 0
    )} ${Number(
      node.height || 0
    )}" preserveAspectRatio="none"><path d="${escapeHtml(node.geometry || "")}" fill="${escapeHtml(
      typeof node.fill === "string" ? node.fill : "#000000"
    )}"></path></svg>`;
  }

  if (node.type === "line") {
    const strokeColor = String(node?.stroke?.fill || "#000000");
    const strokeWidth = scaleNumber(Number(node?.stroke?.thickness || 1), Math.max(context.scaleX, context.scaleY)) || 1;
    const width = Number(node.width || 0);
    const height = Number(node.height || 0);
    return `<svg data-pen-node="${escapeHtml(node.id || "")}" style="${escapeHtml(styleText)}" viewBox="0 0 ${Math.max(
      width,
      1
    )} ${Math.max(
      height || strokeWidth,
      1
    )}" preserveAspectRatio="none"><line x1="0" y1="${strokeWidth / 2}" x2="${Math.max(width, 1)}" y2="${
      strokeWidth / 2
    }" stroke="${escapeHtml(strokeColor)}" stroke-width="${strokeWidth}" /></svg>`;
  }

  const childrenHtml = Array.isArray(node.children)
    ? await Promise.all(node.children.map((child) => renderNodeHtml(child, context, node, false)))
    : [];

  const tag = node.href ? "a" : "div";
  const extra = node.href ? ` href="${escapeHtml(node.href)}"` : "";
  return `<${tag} data-pen-node="${escapeHtml(node.id || "")}"${extra} style="${escapeHtml(styleText)}">${childrenHtml.join(
    ""
  )}</${tag}>`;
};

const buildHtmlDocument = async (pageNode, pngSize, assetRefs = []) => {
  const pageWidth = Number(pageNode?.width || 1);
  const pageHeight = Number(pageNode?.height || 1);
  const scaleX = pngSize.width / pageWidth;
  const scaleY = pngSize.height / pageHeight;
  const assetMap = new Map(
    (Array.isArray(assetRefs) ? assetRefs : [])
      .filter((item) => item && typeof item === "object" && item.rawUrl && item.resolvedPath)
      .map((item) => [String(item.rawUrl), String(item.resolvedPath)])
  );
  const rootHtml = await renderNodeHtml(pageNode, { scaleX, scaleY, assetMap }, null, true);
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
    <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
    <style>
      html, body { margin: 0; padding: 0; background: #ffffff; }
      body { width: ${pngSize.width}px; min-height: ${pngSize.height}px; overflow-x: hidden; }
      a { color: inherit; text-decoration: none; }
      .pen-icon-svg svg { width: 100%; height: 100%; display: block; }
      .material-symbols-rounded { font-variation-settings: "FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24; }
    </style>
  </head>
  <body>
    ${rootHtml}
  </body>
</html>`;
};

const pngInfo = (buffer) => {
  const png = PNG.sync.read(buffer);
  return { width: png.width, height: png.height, png };
};

const diffPngBuffers = async (originalBuffer, renderedBuffer, outDiffPath) => {
  const original = PNG.sync.read(originalBuffer);
  const rendered = PNG.sync.read(renderedBuffer);
  const width = Math.max(original.width, rendered.width);
  const height = Math.max(original.height, rendered.height);
  const originalPad = new PNG({ width, height });
  const renderedPad = new PNG({ width, height });
  const diff = new PNG({ width, height });
  PNG.bitblt(original, originalPad, 0, 0, original.width, original.height, 0, 0);
  PNG.bitblt(rendered, renderedPad, 0, 0, rendered.width, rendered.height, 0, 0);
  const diffPixels = pixelmatch(originalPad.data, renderedPad.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false,
    alpha: 0.5,
  });
  await fs.writeFile(outDiffPath, PNG.sync.write(diff));
  const totalPixels = width * height;
  const diffRatio = diffPixels / totalPixels;
  return {
    width,
    height,
    diffPixels,
    totalPixels,
    diffRatio,
    similarity: 1 - diffRatio,
  };
};

const computeRenderSize = (pageNode = {}, variant = "desktop") => {
  const pageWidth = Number(pageNode?.width || 1);
  const pageHeight = Number(pageNode?.height || 1);
  const maxWidth = variant === "mobile" ? 390 : 420;
  const maxHeight = 1800;
  const scale = Math.min(maxWidth / pageWidth, maxHeight / pageHeight, 1);
  return {
    width: Math.max(1, Math.round(pageWidth * scale)),
    height: Math.max(1, Math.round(pageHeight * scale)),
  };
};

const renderPageToPng = async (browserPage, pageNode, assetRefs, variant, outPath) => {
  const renderSize = computeRenderSize(pageNode, variant);
  const html = await buildHtmlDocument(pageNode, renderSize, assetRefs);
  await browserPage.setViewportSize({
    width: Math.max(renderSize.width, 1),
    height: Math.min(Math.max(renderSize.height, 1), 1200),
  });
  await browserPage.setContent(html, { waitUntil: "domcontentloaded", timeout: 60000 });
  await browserPage.evaluate(() => document.fonts?.ready ?? Promise.resolve());
  await browserPage.waitForTimeout(1200);
  await browserPage.screenshot({
    path: outPath,
    fullPage: true,
    timeout: 120000,
  });
  return { renderSize, html };
};

const parseJsonMaybe = (value = "") => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const rewriteAssetUrlsDeep = (value, assetMap) => {
  if (Array.isArray(value)) return value.map((entry) => rewriteAssetUrlsDeep(entry, assetMap));
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key === "url" && typeof entry === "string" && assetMap.has(entry)) {
      out[key] = assetMap.get(entry);
      continue;
    }
    out[key] = rewriteAssetUrlsDeep(entry, assetMap);
  }
  return out;
};

const materializePenFileForVisuals = async (penFile, assetMap, tempDir) => {
  const raw = JSON.parse(await fs.readFile(penFile, "utf8"));
  const rewritten = rewriteAssetUrlsDeep(raw, assetMap);
  const outPath = path.join(tempDir, path.basename(penFile));
  await fs.mkdir(tempDir, { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(rewritten, null, 2)}\n`, "utf8");
  return outPath;
};

const exportPencilScreenshotsForPen = async (penFile, pageIds) =>
  new Promise((resolve, reject) => {
    const child = spawn(PENCIL_MCP_COMMAND, ["--app", "desktop"], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let requestId = 1;
    let stage = "init";
    let currentIndex = 0;
    let stdoutBuffer = "";
    let stderr = "";
    let settled = false;
    const screenshots = new Map();

    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        child.kill("SIGTERM");
      } catch {}
      if (error) {
        reject(new Error(`${error instanceof Error ? error.message : String(error)}${stderr ? `\n${stderr}` : ""}`));
        return;
      }
      resolve(screenshots);
    };

    const send = (payload) => {
      child.stdin.write(`${JSON.stringify(payload)}\n`);
    };

    const sendInitialize = () => {
      send({
        jsonrpc: "2.0",
        id: requestId++,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          clientInfo: { name: "pen-exact-visual-validator", version: "1.0.0" },
          capabilities: {},
        },
      });
    };

    const sendOpen = () => {
      send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
      send({
        jsonrpc: "2.0",
        id: requestId++,
        method: "tools/call",
        params: {
          name: "open_document",
          arguments: { filePathOrTemplate: penFile },
        },
      });
    };

    const sendScreenshot = () => {
      if (currentIndex >= pageIds.length) {
        finish(null);
        return;
      }
      const nodeId = pageIds[currentIndex];
      send({
        jsonrpc: "2.0",
        id: requestId++,
        method: "tools/call",
        params: {
          name: "get_screenshot",
          arguments: {
            filePath: penFile,
            nodeId,
          },
        },
      });
    };

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.stdout.on("data", (chunk) => {
      stdoutBuffer += String(chunk);
      const lines = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = lines.pop() || "";
      for (const line of lines) {
        const parsed = parseJsonMaybe(line.trim());
        if (!parsed) continue;
        if (parsed?.error) {
          finish(new Error(JSON.stringify(parsed.error)));
          return;
        }
        if (stage === "init" && parsed?.result?.serverInfo) {
          stage = "opening";
          sendOpen();
          continue;
        }
        if (stage === "opening" && parsed?.result?.content) {
          stage = "screenshots";
          sendScreenshot();
          continue;
        }
        if (stage === "screenshots" && parsed?.result?.content) {
          const nodeId = pageIds[currentIndex];
          const imageEntry = parsed.result.content.find((item) => item?.type === "image" && typeof item?.data === "string");
          if (!imageEntry) {
            finish(new Error(`missing image payload for ${nodeId}`));
            return;
          }
          screenshots.set(nodeId, Buffer.from(imageEntry.data, "base64"));
          currentIndex += 1;
          sendScreenshot();
        }
      }
    });

    child.on("error", finish);
    child.on("close", (code) => {
      if (!settled && code !== 0) finish(new Error(`pencil MCP exited with code ${code}`));
    });

    const timer = setTimeout(() => finish(new Error(`timeout exporting screenshots for ${penFile}`)), 120000);
    sendInitialize();
  });

const main = async () => {
  const options = parseArgs(process.argv);
  const outDir = path.resolve(options["out-dir"] || DEFAULT_OUT_DIR);
  const sourceDir = path.resolve(options["source-dir"] || DEFAULT_SOURCE_DIR);
  const visualDir = path.resolve(options["visual-dir"] || DEFAULT_VISUAL_DIR);
  const tempPenDir = path.join(os.tmpdir(), "pen-exact-visual-validator");
  const comparisonMode = String(options["comparison-mode"] || "source-render").trim().toLowerCase();
  const capturePencilReference = options["capture-pencil-reference"] !== "false";
  const siteFilter = String(options.site || "").trim().toLowerCase();
  const variantFilter = String(options.variant || "").trim().toLowerCase();
  const pageFilter = String(options["page-id"] || "").trim();
  const limit = Number(options.limit || 0);
  const similarityThreshold = Number(options["similarity-threshold"] || "0.995");

  const manifestPath = path.join(outDir, "manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const pageJobs = [];

  for (const entry of manifest.entries || []) {
    if (siteFilter && String(entry.siteId || "").trim().toLowerCase() !== siteFilter) continue;
    if (variantFilter && String(entry.variant || "").trim().toLowerCase() !== variantFilter) continue;
    const templatePath = path.join(outDir, entry.output.templatePath);
    const template = JSON.parse(await fs.readFile(templatePath, "utf8"));
    for (const page of template.pages || []) {
      if (pageFilter && String(page.pageId || "") !== pageFilter) continue;
      pageJobs.push({
        siteId: entry.siteId,
        siteName: entry.siteName,
        variant: entry.variant,
        penFile: template.source?.penFile || path.join(sourceDir, `${entry.siteId}.pen`),
        pageId: page.pageId,
        pageName: page.pageName,
        pageNode: page.rawPageNode,
        assetRefs: page.assetRefs || [],
      });
    }
  }

  const selectedJobs = limit > 0 ? pageJobs.slice(0, limit) : pageJobs;
  const jobsByPen = new Map();
  const sourceDocsByPen = new Map();
  for (const job of selectedJobs) {
    if (!jobsByPen.has(job.penFile)) jobsByPen.set(job.penFile, []);
    jobsByPen.get(job.penFile).push(job);
  }
  for (const penFile of jobsByPen.keys()) {
    sourceDocsByPen.set(penFile, JSON.parse(await fs.readFile(penFile, "utf8")));
  }

  await fs.mkdir(visualDir, { recursive: true });
  const browser = await chromium.launch();
  const browserPage = await browser.newPage();
  const reports = [];

  for (const [penFile, jobs] of jobsByPen.entries()) {
    const assetMap = new Map(
      jobs
        .flatMap((job) => (Array.isArray(job.assetRefs) ? job.assetRefs : []))
        .filter((item) => item && typeof item === "object" && item.rawUrl && item.resolvedPath)
        .map((item) => [String(item.rawUrl), String(item.resolvedPath)])
    );
    const sourceDoc = sourceDocsByPen.get(penFile) || {};
    const sourcePages = new Map(Array.isArray(sourceDoc.children) ? sourceDoc.children.map((page) => [String(page.id || ""), page]) : []);
    let screenshotMap = new Map();
    if (capturePencilReference) {
      const penFileForScreenshots = await materializePenFileForVisuals(
        penFile,
        assetMap,
        path.join(tempPenDir, slugify(path.basename(penFile, ".pen")))
      );
      screenshotMap = await exportPencilScreenshotsForPen(
        penFileForScreenshots,
        jobs.map((job) => job.pageId)
      );
    }

    for (const job of jobs) {
      const sourcePageNode = sourcePages.get(job.pageId);
      if (!sourcePageNode) {
        reports.push({
          siteId: job.siteId,
          variant: job.variant,
          pageId: job.pageId,
          pageName: job.pageName,
          penFile,
          passed: false,
          error: "missing source page node",
        });
        continue;
      }

      const pageDir = path.join(visualDir, job.siteId, job.variant, `${slugify(job.pageId)}-${slugify(job.pageName || "page")}`);
      await fs.mkdir(pageDir, { recursive: true });
      const originalPath = path.join(pageDir, "source-render.png");
      const renderedPath = path.join(pageDir, "template-render.png");
      const diffPath = path.join(pageDir, "diff.png");
      const sourceHtmlPath = path.join(pageDir, "source-render.html");
      const templateHtmlPath = path.join(pageDir, "template-render.html");
      const pencilPath = path.join(pageDir, "pencil-reference.png");

      const sourceRender = await renderPageToPng(browserPage, sourcePageNode, job.assetRefs, job.variant, originalPath);
      await fs.writeFile(sourceHtmlPath, sourceRender.html, "utf8");
      const templateRender = await renderPageToPng(browserPage, job.pageNode, job.assetRefs, job.variant, renderedPath);
      await fs.writeFile(templateHtmlPath, templateRender.html, "utf8");

      const originalBuffer = await fs.readFile(originalPath);
      const renderedBuffer = await fs.readFile(renderedPath);
      const diffResult = await diffPngBuffers(originalBuffer, renderedBuffer, diffPath);
      const pencilBuffer = screenshotMap.get(job.pageId);
      if (pencilBuffer) await fs.writeFile(pencilPath, pencilBuffer);
      const report = {
        siteId: job.siteId,
        variant: job.variant,
        pageId: job.pageId,
        pageName: job.pageName,
        penFile,
        comparisonMode,
        originalPath,
        renderedPath,
        diffPath,
        sourceHtmlPath,
        templateHtmlPath,
        pencilReferencePath: pencilBuffer ? pencilPath : "",
        similarityThreshold,
        passed: diffResult.similarity >= similarityThreshold,
        ...diffResult,
      };
      await writeJson(path.join(pageDir, "report.json"), report);
      reports.push(report);
      console.log(
        JSON.stringify({
          siteId: job.siteId,
          variant: job.variant,
          pageId: job.pageId,
          similarity: Number(report.similarity.toFixed(6)),
          passed: report.passed,
        })
      );
    }
  }

  await browser.close();

  const summary = {
    generatedAt: new Date().toISOString(),
    outDir,
    visualDir,
    comparisonMode,
    capturePencilReference,
    totalPages: reports.length,
    passedPages: reports.filter((item) => item.passed).length,
    failedPages: reports.filter((item) => !item.passed).length,
    similarityThreshold,
    averageSimilarity:
      reports.length > 0 ? reports.reduce((sum, item) => sum + Number(item.similarity || 0), 0) / reports.length : 0,
  };
  const failures = reports
    .filter((item) => !item.passed)
    .sort((a, b) => Number(a.similarity || 0) - Number(b.similarity || 0))
    .map((item) => ({
      siteId: item.siteId,
      variant: item.variant,
      pageId: item.pageId,
      pageName: item.pageName,
      similarity: item.similarity,
      diffRatio: item.diffRatio,
      diffPath: item.diffPath,
      renderedPath: item.renderedPath,
      originalPath: item.originalPath,
      error: item.error || "",
    }));

  const manifestOut = {
    schemaVersion: "pen-exact-visual-validation.v1",
    ...summary,
    failures,
  };
  await writeJson(path.join(visualDir, "manifest.json"), manifestOut);
  console.log(JSON.stringify(manifestOut, null, 2));
  process.exit(summary.failedPages > 0 ? 1 : 0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
