#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

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

const main = async () => {
  const args = parseArgs(process.argv);
  const sourcePath = normalizePath(args.source);
  const payloadPath = normalizePath(args.payload);
  const outputPath = normalizePath(args.output);
  if (!sourcePath || !payloadPath || !outputPath) {
    throw new Error("[pencil-bridge] required args: --source --payload --output");
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
  const result = {
    ok: true,
    outputPath,
    pageCount: penDoc.document.pages.length,
    componentCount: penDoc.document.components.length,
  };
  process.stdout.write(`${JSON.stringify(result)}\n`);
};

main().catch((error) => {
  const message = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
  process.stderr.write(`[pencil-bridge:fatal] ${message}\n`);
  process.exit(1);
});

