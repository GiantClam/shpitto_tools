#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

import {
  DEFAULT_OUT_DIR,
  DEFAULT_SOURCE_DIR,
  buildAssetIndex,
  buildExactTemplate,
  collectPenFiles,
  parsePenIdentity,
  readJson,
  slugify,
  stableHash,
  titleCase,
  writeJson,
} from "./lib/pen-exact-template-utils.mjs";

const PENCIL_EXECUTABLE = "/Applications/Pencil.app/Contents/MacOS/Pencil";
const PENCIL_EXPORT_SCRIPT = path.resolve(
  "/Users/beihuang/.codex/worktrees/266d/shpitto_tools/builder/template-factory/pencil-export-payload.mjs"
);
const BUILDER_DIR = path.resolve("/Users/beihuang/.codex/worktrees/266d/shpitto_tools/builder");

const rel = (baseDir, filePath) => path.relative(baseDir, filePath).split(path.sep).join("/");
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
const orderToken = (value) => String(value).padStart(2, "0");
const pageFileName = (page) => `${orderToken(page.order)}-${slugify(page.pageId || page.pageName || "page")}.json`;
const sectionFileName = (page, section) =>
  `${orderToken(page.order)}-${slugify(page.pageId || page.pageName || "page")}__${orderToken(section.order)}-${slugify(
    section.sectionId || section.sectionName || "section"
  )}.json`;
const blockFileName = (page, section, block) =>
  `${orderToken(page.order)}-${slugify(page.pageId || page.pageName || "page")}__${orderToken(section.order)}-${slugify(
    section.sectionId || section.sectionName || "section"
  )}__${orderToken(block.order)}-${slugify(block.blockId || block.blockName || block.blockType || "block")}.json`;

const preferredVariantOrder = new Map([
  ["desktop", 0],
  ["mobile", 1],
]);

const sortVariants = (records) =>
  [...records].sort((a, b) => {
    const aOrder = preferredVariantOrder.get(a.identity.variantKey) ?? 99;
    const bOrder = preferredVariantOrder.get(b.identity.variantKey) ?? 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.identity.variantKey.localeCompare(b.identity.variantKey);
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

const slugifyRoute = (value = "") => {
  const token = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!token || token === "home") return "/";
  return `/${token}`;
};

const expectedPencilPayload = (template) => ({
  components: [],
  pages: template.pages.map((page, index) => {
    const pageNode = page.rawPageNode || {};
    const pageChildren = Array.isArray(pageNode.children) ? pageNode.children : [];
    return {
      path: slugifyRoute(String(pageNode?.name || "").trim() || `page-${index + 1}`),
      name: String(pageNode?.name || "").trim() || `Page ${index + 1}`,
      data: {
        root: { props: { theme: {} } },
        content: pageChildren.map((child, childIndex) => toPayloadSection(child, childIndex)),
      },
    };
  }),
});

const buildPencilPayloadSignature = (payload) => ({
  pages: Array.isArray(payload?.pages)
    ? payload.pages.map((page) => ({
        path: page?.path || "",
        name: page?.name || "",
        content: Array.isArray(page?.data?.content)
          ? page.data.content.map((item) => ({
              type: item?.type || "",
              key: item?._key || "",
              text: [item?.props?.title || "", item?.props?.subtitle || "", item?.props?.body || ""]
                .filter(Boolean)
                .join("\n"),
            }))
          : [],
      }))
    : [],
});

const parsePencilRawNodes = (pencilExport) => {
  if (Array.isArray(pencilExport?.rawNodes)) return pencilExport.rawNodes;
  const text = pencilExport?.rawResult?.content?.find?.((row) => row?.type === "text" && typeof row?.text === "string")?.text;
  if (typeof text !== "string" || !text.trim()) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const projectSourceToPencilTree = (source, observed) => {
  if (Array.isArray(observed)) {
    return observed.map((item, index) => projectSourceToPencilTree(Array.isArray(source) ? source[index] : undefined, item));
  }
  if (observed && typeof observed === "object") {
    const out = {};
    for (const [key, value] of Object.entries(observed)) {
      const sourceValue = source && typeof source === "object" ? source[key] : undefined;
      if (value && typeof value === "object") {
        out[key] = projectSourceToPencilTree(sourceValue, value);
      } else if (key === "mode" && observed.type === "image") {
        out[key] = value;
      } else if (key === "id") {
        out[key] = value;
      } else {
        out[key] = sourceValue === undefined ? value : sourceValue;
      }
    }
    return out;
  }
  return source === undefined ? observed : source;
};

const fileExists = async (targetPath) =>
  fs
    .access(targetPath)
    .then(() => true)
    .catch(() => false);

const startPencilDesktop = async () => {
  if (!(await fileExists(PENCIL_EXECUTABLE))) {
    return { attempted: false, started: false, error: `missing Pencil executable: ${PENCIL_EXECUTABLE}` };
  }
  const child = spawn(PENCIL_EXECUTABLE, ["--help"], {
    detached: false,
    stdio: "ignore",
  });
  child.unref();
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return { attempted: true, started: true, error: "" };
};

const runPencilPayloadExport = async (penFile, outDir) => {
  const outPath = path.join(outDir, `${parsePenIdentity(penFile).penKey}.pencil-export.json`);
  return new Promise((resolve) => {
    const child = spawn(
      "node",
      [PENCIL_EXPORT_SCRIPT, "--pen-file", penFile, "--out", outPath, "--include-raw", "true", "--timeout-ms", "8000"],
      {
        cwd: BUILDER_DIR,
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("close", async (code) => {
      if (code !== 0) {
        resolve({
          attempted: true,
          passed: false,
          error: stderr.trim() || stdout.trim() || `exit ${code}`,
          outPath: "",
        });
        return;
      }
      try {
        const payload = JSON.parse(await fs.readFile(outPath, "utf8"));
        resolve({
          attempted: true,
          passed: true,
          error: "",
          outPath,
          exported: payload,
        });
      } catch (error) {
        resolve({
          attempted: true,
          passed: false,
          error: error instanceof Error ? error.message : String(error),
          outPath: "",
        });
      }
    });
  });
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryPencilResult = (result) => {
  if (!result?.passed) return true;
  const nodeCount = Number(result?.exported?.nodeCount || 0);
  return nodeCount === 0;
};

const runPencilPayloadExportWithRetry = async (penFile, outDir, attempts = 3) => {
  let last = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    last = await runPencilPayloadExport(penFile, outDir);
    last.attemptCount = attempt;
    if (!shouldRetryPencilResult(last)) return last;
    if (attempt < attempts) await delay(400);
  }
  return last;
};

const probePencilOnce = async (samplePenFile, outDir) => {
  let first = await runPencilPayloadExportWithRetry(samplePenFile, outDir);
  if (first.passed) return { available: true, launch: { attempted: false, started: false, error: "" }, result: first };
  const launch = await startPencilDesktop();
  const second = await runPencilPayloadExportWithRetry(samplePenFile, outDir);
  return {
    available: Boolean(second.passed),
    launch,
    result: second.passed ? second : first,
  };
};

const variantPageMeta = (record, page) => ({
  pageId: page.pageId,
  pageName: page.pageName,
  pageType: page.pageType,
  order: page.order,
  bounds: page.bounds,
  layout: page.layout,
  pageHash: page.pageHash,
  sectionCount: page.sectionCount,
  blockCount: page.blockCount,
  output: {
    templatePath: record.output.templatePath,
    pagePath: record.pageOutput.get(page.pageId),
  },
});

const variantSectionMeta = (record, section) => ({
  sectionId: section.sectionId,
  sectionName: section.sectionName,
  sectionKind: section.sectionKind,
  order: section.order,
  bounds: section.bounds,
  treeHash: section.treeHash,
  blockCount: section.blockCount,
  output: {
    templatePath: record.output.templatePath,
    sectionPath: record.sectionOutput.get(`${section.sectionId}::${section.order}`),
  },
});

const variantBlockMeta = (record, block, pageId, section) => ({
  blockId: block.blockId,
  blockName: block.blockName,
  blockType: block.blockType,
  blockRole: block.blockRole,
  order: block.order,
  bounds: block.bounds,
  treeHash: block.treeHash,
  output: {
    templatePath: record.output.templatePath,
    blockPath: record.blockOutput.get(`${pageId}::${section.sectionId}::${section.order}::${block.blockId}::${block.order}`),
  },
});

const mergeSiteVariants = (siteId, records) => {
  const sortedRecords = sortVariants(records);
  const pageMap = new Map();

  for (const record of sortedRecords) {
    for (const page of record.template.pages) {
      const pageKey = slugify(page.pageId || page.pageName || `page-${page.order + 1}`);
      if (!pageMap.has(pageKey)) {
        pageMap.set(pageKey, {
          pageId: page.pageId,
          pageKey,
          pageName: page.pageName,
          pageType: page.pageType,
          variants: {},
          sections: new Map(),
        });
      }
      const mergedPage = pageMap.get(pageKey);
      if (mergedPage.pageType === "generic" && page.pageType !== "generic") mergedPage.pageType = page.pageType;
      mergedPage.variants[record.identity.variantKey] = variantPageMeta(record, page);

      for (const section of page.sections) {
        const sectionKey = slugify(section.sectionId || section.sectionName || `section-${section.order + 1}`);
        if (!mergedPage.sections.has(sectionKey)) {
          mergedPage.sections.set(sectionKey, {
            sectionId: section.sectionId,
            sectionKey,
            sectionName: section.sectionName,
            sectionKind: section.sectionKind,
            variants: {},
            blocks: new Map(),
          });
        }
        const mergedSection = mergedPage.sections.get(sectionKey);
        if (mergedSection.sectionKind === "generic" && section.sectionKind !== "generic") {
          mergedSection.sectionKind = section.sectionKind;
        }
        mergedSection.variants[record.identity.variantKey] = variantSectionMeta(record, section);

        for (const block of section.blocks) {
          const blockKey = slugify(block.blockId || block.blockName || `${block.blockType}-${block.order + 1}`);
          if (!mergedSection.blocks.has(blockKey)) {
            mergedSection.blocks.set(blockKey, {
              blockId: block.blockId,
              blockKey,
              blockName: block.blockName,
              blockType: block.blockType,
              blockRole: block.blockRole,
              variants: {},
            });
          }
          mergedSection.blocks.get(blockKey).variants[record.identity.variantKey] = variantBlockMeta(
            record,
            block,
            page.pageId,
            section
          );
        }
      }
    }
  }

  const pages = Array.from(pageMap.values())
    .map((page) => ({
      pageId: page.pageId,
      pageKey: page.pageKey,
      pageName: page.pageName,
      pageType: page.pageType,
      variants: page.variants,
      sections: Array.from(page.sections.values())
        .map((section) => ({
          sectionId: section.sectionId,
          sectionKey: section.sectionKey,
          sectionName: section.sectionName,
          sectionKind: section.sectionKind,
          variants: section.variants,
          blocks: Array.from(section.blocks.values()).sort((a, b) => {
            const aOrder = a.variants.desktop?.order ?? a.variants.mobile?.order ?? 999;
            const bOrder = b.variants.desktop?.order ?? b.variants.mobile?.order ?? 999;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return a.blockKey.localeCompare(b.blockKey);
          }),
        }))
        .sort((a, b) => {
          const aOrder = a.variants.desktop?.order ?? a.variants.mobile?.order ?? 999;
          const bOrder = b.variants.desktop?.order ?? b.variants.mobile?.order ?? 999;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return a.sectionKey.localeCompare(b.sectionKey);
        }),
    }))
    .sort((a, b) => {
      const aOrder = a.variants.desktop?.order ?? a.variants.mobile?.order ?? 999;
      const bOrder = b.variants.desktop?.order ?? b.variants.mobile?.order ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.pageKey.localeCompare(b.pageKey);
    });

  return {
    schemaVersion: "pen-exact-site-template.v1",
    generatedAt: new Date().toISOString(),
    siteId,
    siteName: titleCase(siteId),
    variants: sortedRecords.map((record) => ({
      variant: record.identity.variantKey,
      penFile: record.penFile,
      sourceHash: record.template.sourceHash,
      pageCount: record.template.counts.pageCount,
      sectionCount: record.template.counts.totalSectionCount,
      blockCount: record.template.counts.totalBlockCount,
      output: record.output,
    })),
    themes: Object.fromEntries(sortedRecords.map((record) => [record.identity.variantKey, record.template.theme])),
    counts: {
      variantCount: sortedRecords.length,
      pageCount: pages.length,
      sectionCount: pages.reduce((sum, page) => sum + page.sections.length, 0),
      blockCount: pages.reduce(
        (sum, page) => sum + page.sections.reduce((sectionSum, section) => sectionSum + section.blocks.length, 0),
        0
      ),
    },
    pages,
    bundleHash: stableHash(
      sortedRecords.map((record) => ({
        variant: record.identity.variantKey,
        sourceHash: record.template.sourceHash,
      }))
    ),
  };
};

const compareBlocks = (expectedBlocks, actualBlocks, context) => {
  const failures = [];
  const reports = [];
  const maxLen = Math.max(expectedBlocks.length, actualBlocks.length);
  for (let index = 0; index < maxLen; index += 1) {
    const expected = expectedBlocks[index];
    const actual = actualBlocks[index];
    const prefix = `${context} block[${index}]`;
    const blockFailures = [];
    if (!expected || !actual) {
      blockFailures.push("missing block entry");
    } else {
      if (expected.blockId !== actual.blockId) blockFailures.push(`blockId mismatch: ${expected.blockId} vs ${actual.blockId}`);
      if (expected.blockType !== actual.blockType) {
        blockFailures.push(`blockType mismatch: ${expected.blockType} vs ${actual.blockType}`);
      }
      if (expected.blockRole !== actual.blockRole) {
        blockFailures.push(`blockRole mismatch: ${expected.blockRole} vs ${actual.blockRole}`);
      }
      if (expected.treeHash !== actual.treeHash) blockFailures.push(`treeHash mismatch: ${expected.blockId}`);
      if (stableHash(expected.rawBlockNode) !== stableHash(actual.rawBlockNode)) {
        blockFailures.push(`rawBlockNode hash mismatch: ${expected.blockId}`);
      }
    }
    if (blockFailures.length) failures.push(...blockFailures.map((item) => `${prefix}: ${item}`));
    reports.push({ index, blockId: expected?.blockId || actual?.blockId || "", passed: blockFailures.length === 0, failures: blockFailures });
  }
  return { failures, reports };
};

const compareSections = (expectedSections, actualSections, context) => {
  const failures = [];
  const reports = [];
  const maxLen = Math.max(expectedSections.length, actualSections.length);
  for (let index = 0; index < maxLen; index += 1) {
    const expected = expectedSections[index];
    const actual = actualSections[index];
    const prefix = `${context} section[${index}]`;
    const sectionFailures = [];
    let blockReports = [];
    if (!expected || !actual) {
      sectionFailures.push("missing section entry");
    } else {
      if (expected.sectionId !== actual.sectionId) {
        sectionFailures.push(`sectionId mismatch: ${expected.sectionId} vs ${actual.sectionId}`);
      }
      if (expected.sectionKind !== actual.sectionKind) {
        sectionFailures.push(`sectionKind mismatch: ${expected.sectionKind} vs ${actual.sectionKind}`);
      }
      if (expected.treeHash !== actual.treeHash) sectionFailures.push(`treeHash mismatch: ${expected.sectionId}`);
      if (expected.blockCount !== actual.blockCount) {
        sectionFailures.push(`blockCount mismatch: expected=${expected.blockCount} actual=${actual.blockCount}`);
      }
      if (stableHash(expected.rawSectionNode) !== stableHash(actual.rawSectionNode)) {
        sectionFailures.push(`rawSectionNode hash mismatch: ${expected.sectionId}`);
      }
      const blockComparison = compareBlocks(expected.blocks || [], actual.blocks || [], `${context}:${expected.sectionId}`);
      sectionFailures.push(...blockComparison.failures);
      blockReports = blockComparison.reports;
    }
    if (sectionFailures.length) failures.push(...sectionFailures.map((item) => `${prefix}: ${item}`));
    reports.push({
      index,
      sectionId: expected?.sectionId || actual?.sectionId || "",
      passed: sectionFailures.length === 0,
      failures: sectionFailures,
      blockReports,
    });
  }
  return { failures, reports };
};

const comparePages = (expectedPages, actualPages) => {
  const failures = [];
  const pageReports = [];
  const maxLen = Math.max(expectedPages.length, actualPages.length);
  for (let index = 0; index < maxLen; index += 1) {
    const expected = expectedPages[index];
    const actual = actualPages[index];
    const pageFailures = [];
    let sectionReports = [];
    if (!expected || !actual) {
      pageFailures.push("missing page entry");
    } else {
      if (expected.pageId !== actual.pageId) pageFailures.push(`pageId mismatch: ${expected.pageId} vs ${actual.pageId}`);
      if (expected.pageType !== actual.pageType) pageFailures.push(`pageType mismatch: ${expected.pageType} vs ${actual.pageType}`);
      if (expected.pageHash !== actual.pageHash) pageFailures.push(`pageHash mismatch: ${expected.pageId}`);
      if (expected.sectionCount !== actual.sectionCount) {
        pageFailures.push(`sectionCount mismatch: expected=${expected.sectionCount} actual=${actual.sectionCount}`);
      }
      if (expected.blockCount !== actual.blockCount) {
        pageFailures.push(`blockCount mismatch: expected=${expected.blockCount} actual=${actual.blockCount}`);
      }
      if (stableHash(expected.rawPageNode) !== stableHash(actual.rawPageNode)) {
        pageFailures.push(`rawPageNode hash mismatch: ${expected.pageId}`);
      }
      const sectionComparison = compareSections(expected.sections || [], actual.sections || [], expected.pageId);
      pageFailures.push(...sectionComparison.failures);
      sectionReports = sectionComparison.reports;
    }
    if (pageFailures.length) failures.push(...pageFailures.map((item) => `${expected?.pageId || actual?.pageId || `page[${index}]`}: ${item}`));
    pageReports.push({
      index,
      pageId: expected?.pageId || actual?.pageId || "",
      passed: pageFailures.length === 0,
      failures: pageFailures,
      sectionReports,
    });
  }
  return { failures, pageReports };
};

const stripGeneratedAtDeep = (value) => {
  if (Array.isArray(value)) return value.map(stripGeneratedAtDeep);
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key === "generatedAt") continue;
    out[key] = stripGeneratedAtDeep(entry);
  }
  return out;
};

const compareFileHash = async (expected, filePath) => {
  try {
    const actual = await readJson(filePath);
    return {
      passed: stableHash(stripGeneratedAtDeep(expected)) === stableHash(stripGeneratedAtDeep(actual)),
      error: "",
    };
  } catch (error) {
    return {
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const buildExpectedArtifacts = (outDir, recordsBySite) => {
  const siteCatalog = [];
  const pageCatalog = [];
  const sectionCatalog = [];
  const blockCatalog = [];

  for (const [siteId, records] of Array.from(recordsBySite.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    const siteTemplate = mergeSiteVariants(siteId, records);
    siteCatalog.push({
      siteId,
      siteName: titleCase(siteId),
      variantCount: siteTemplate.counts.variantCount,
      pageCount: siteTemplate.counts.pageCount,
      sectionCount: siteTemplate.counts.sectionCount,
      blockCount: siteTemplate.counts.blockCount,
      variants: siteTemplate.variants.map((variant) => variant.variant),
      output: {
        siteTemplatePath: rel(outDir, path.join(outDir, "sites", siteId, "site.template.json")),
        siteBundlePath: rel(outDir, path.join(outDir, "sites", siteId, "site.bundle.json")),
      },
    });

    for (const record of records) {
      const identity = record.identity;
      const templatePath = path.join(outDir, "sites", identity.siteId, "variants", identity.variantKey, "template.json");
      for (const page of record.template.pages) {
        pageCatalog.push({
          siteId: identity.siteId,
          siteName: identity.siteName,
          variant: identity.variantKey,
          penFile: record.penFile,
          pageId: page.pageId,
          pageKey: slugify(page.pageId || page.pageName || `page-${page.order + 1}`),
          pageName: page.pageName,
          pageType: page.pageType,
          order: page.order,
          sectionCount: page.sectionCount,
          blockCount: page.blockCount,
          pageHash: page.pageHash,
          output: {
            templatePath: rel(outDir, templatePath),
            pagePath: rel(outDir, path.join(outDir, "sites", identity.siteId, "variants", identity.variantKey, "pages", pageFileName(page))),
          },
        });

        for (const section of page.sections) {
          sectionCatalog.push({
            siteId: identity.siteId,
            siteName: identity.siteName,
            variant: identity.variantKey,
            penFile: record.penFile,
            pageId: page.pageId,
            pageKey: slugify(page.pageId || page.pageName || `page-${page.order + 1}`),
            sectionId: section.sectionId,
            sectionKey: slugify(section.sectionId || section.sectionName || `section-${section.order + 1}`),
            sectionName: section.sectionName,
            sectionKind: section.sectionKind,
            order: section.order,
            blockCount: section.blockCount,
            treeHash: section.treeHash,
            output: {
              templatePath: rel(outDir, templatePath),
              sectionPath: rel(
                outDir,
                path.join(outDir, "sites", identity.siteId, "variants", identity.variantKey, "sections", sectionFileName(page, section))
              ),
            },
          });

          for (const block of section.blocks) {
            blockCatalog.push({
              siteId: identity.siteId,
              siteName: identity.siteName,
              variant: identity.variantKey,
              penFile: record.penFile,
              pageId: page.pageId,
              pageKey: slugify(page.pageId || page.pageName || `page-${page.order + 1}`),
              sectionId: section.sectionId,
              sectionKey: slugify(section.sectionId || section.sectionName || `section-${section.order + 1}`),
              blockId: block.blockId,
              blockKey: slugify(block.blockId || block.blockName || `${block.blockType}-${block.order + 1}`),
              blockName: block.blockName,
              blockType: block.blockType,
              blockRole: block.blockRole,
              order: block.order,
              treeHash: block.treeHash,
              output: {
                templatePath: rel(outDir, templatePath),
                blockPath: rel(
                  outDir,
                  path.join(outDir, "sites", identity.siteId, "variants", identity.variantKey, "blocks", blockFileName(page, section, block))
                ),
              },
            });
          }
        }
      }
    }
  }

  return {
    siteCatalog,
    pageCatalog: pageCatalog.sort((a, b) =>
      a.siteId.localeCompare(b.siteId) ||
      a.variant.localeCompare(b.variant) ||
      a.order - b.order ||
      a.pageKey.localeCompare(b.pageKey)
    ),
    sectionCatalog: sectionCatalog.sort((a, b) =>
      a.siteId.localeCompare(b.siteId) ||
      a.variant.localeCompare(b.variant) ||
      a.pageKey.localeCompare(b.pageKey) ||
      a.order - b.order ||
      a.sectionKey.localeCompare(b.sectionKey)
    ),
    blockCatalog: blockCatalog.sort((a, b) =>
      a.siteId.localeCompare(b.siteId) ||
      a.variant.localeCompare(b.variant) ||
      a.pageKey.localeCompare(b.pageKey) ||
      a.sectionKey.localeCompare(b.sectionKey) ||
      a.order - b.order ||
      a.blockKey.localeCompare(b.blockKey)
    ),
  };
};

const main = async () => {
  const options = parseArgs(process.argv);
  const sourceDir = path.resolve(options["source-dir"] || process.argv[2] || DEFAULT_SOURCE_DIR);
  const outDir = path.resolve(options["out-dir"] || process.argv[3] || DEFAULT_OUT_DIR);
  const skipPencil = options["skip-pencil"] === "true";
  const requirePencil = options["require-pencil"] === "true";
  if (skipPencil && requirePencil) {
    throw new Error("--skip-pencil and --require-pencil cannot be used together");
  }
  const validationDir = path.join(outDir, "validation");
  const pencilTempDir = path.join(os.tmpdir(), "pen-exact-template-pencil");

  const penFiles = await collectPenFiles(sourceDir);
  const assetIndex = await buildAssetIndex(sourceDir);
  const reports = [];
  const recordsBySite = new Map();

  await fs.mkdir(validationDir, { recursive: true });
  await fs.mkdir(pencilTempDir, { recursive: true });

  const pencilProbe = skipPencil
    ? {
        available: false,
        skipped: true,
        launch: { attempted: false, started: false, error: "" },
        result: { attempted: false, passed: false, skipped: true, error: "" },
      }
    : penFiles.length > 0
      ? await probePencilOnce(penFiles[0], pencilTempDir)
      : null;

  for (const penFile of penFiles) {
    const identity = parsePenIdentity(penFile);
    const doc = await readJson(penFile);
    const expected = await buildExactTemplate({
      filePath: penFile,
      doc,
      assetIndex,
      sourceDir,
    });
    const variantDir = path.join(outDir, "sites", identity.siteId, "variants", identity.variantKey);
    const templatePath = path.join(variantDir, "template.json");
    const pagesDir = path.join(variantDir, "pages");
    const sectionsDir = path.join(variantDir, "sections");
    const blocksDir = path.join(variantDir, "blocks");

    let actual = null;
    let templateReadError = "";
    try {
      actual = await readJson(templatePath);
    } catch (error) {
      templateReadError = error instanceof Error ? error.message : String(error);
    }

    const failures = [];
    let pageReports = [];
    const splitFileChecks = [];

    if (!actual) {
      failures.push(`template read failed: ${templateReadError}`);
    } else {
      if (expected.sourceHash !== actual.sourceHash) failures.push("sourceHash mismatch");
      if (stableHash(expected.rawDocument) !== stableHash(actual.rawDocument)) failures.push("rawDocument hash mismatch");
      if (expected.counts.pageCount !== actual.counts.pageCount) {
        failures.push(`counts.pageCount mismatch: expected=${expected.counts.pageCount} actual=${actual.counts.pageCount}`);
      }
      if (expected.counts.totalSectionCount !== actual.counts.totalSectionCount) {
        failures.push(
          `counts.totalSectionCount mismatch: expected=${expected.counts.totalSectionCount} actual=${actual.counts.totalSectionCount}`
        );
      }
      if (expected.counts.totalBlockCount !== actual.counts.totalBlockCount) {
        failures.push(
          `counts.totalBlockCount mismatch: expected=${expected.counts.totalBlockCount} actual=${actual.counts.totalBlockCount}`
        );
      }
      if (expected.counts.totalNodeCount !== actual.counts.totalNodeCount) {
        failures.push(
          `counts.totalNodeCount mismatch: expected=${expected.counts.totalNodeCount} actual=${actual.counts.totalNodeCount}`
        );
      }
      const pageComparison = comparePages(expected.pages, actual.pages || []);
      failures.push(...pageComparison.failures);
      pageReports = pageComparison.pageReports;

      for (const page of expected.pages) {
        const pagePath = path.join(pagesDir, pageFileName(page));
        const pageCheck = await compareFileHash(page, pagePath);
        splitFileChecks.push({ kind: "page", id: page.pageId, path: pagePath, passed: pageCheck.passed, error: pageCheck.error });
        if (!pageCheck.passed) failures.push(`page file mismatch: ${pagePath}${pageCheck.error ? ` (${pageCheck.error})` : ""}`);

        for (const section of page.sections) {
          const sectionPath = path.join(sectionsDir, sectionFileName(page, section));
          const sectionCheck = await compareFileHash(section, sectionPath);
          splitFileChecks.push({
            kind: "section",
            id: `${page.pageId}:${section.sectionId}`,
            path: sectionPath,
            passed: sectionCheck.passed,
            error: sectionCheck.error,
          });
          if (!sectionCheck.passed) {
            failures.push(`section file mismatch: ${sectionPath}${sectionCheck.error ? ` (${sectionCheck.error})` : ""}`);
          }

          for (const block of section.blocks) {
            const blockPath = path.join(blocksDir, blockFileName(page, section, block));
            const blockCheck = await compareFileHash(block, blockPath);
            splitFileChecks.push({
              kind: "block",
              id: `${page.pageId}:${section.sectionId}:${block.blockId}`,
              path: blockPath,
              passed: blockCheck.passed,
              error: blockCheck.error,
            });
            if (!blockCheck.passed) {
              failures.push(`block file mismatch: ${blockPath}${blockCheck.error ? ` (${blockCheck.error})` : ""}`);
            }
          }
        }
      }
    }

    let pencil;
    if (skipPencil) {
      pencil = {
        attempted: false,
        passed: false,
        skipped: true,
        error: "",
      };
    } else if (!pencilProbe?.available) {
      pencil = {
        attempted: false,
        passed: false,
        blockedByGlobalProbe: true,
        error: pencilProbe?.result?.error || "pencil probe did not run",
      };
      if (requirePencil || !skipPencil) failures.push(`pencil export blocked: ${pencil.error}`);
    } else {
      pencil = await runPencilPayloadExportWithRetry(penFile, pencilTempDir);
      if (!pencil.passed) {
        failures.push(`pencil export failed: ${pencil.error}`);
      } else {
        const exportedRawNodes = parsePencilRawNodes(pencil.exported);
        const expectedProjectedNodes = projectSourceToPencilTree(expected.rawDocument.children || [], exportedRawNodes);
        const exported = pencil.exported?.payload || { components: [], pages: [] };
        const expectedPayload = expectedPencilPayload(expected);
        const exportedSignature = buildPencilPayloadSignature(exported);
        const expectedSignature = buildPencilPayloadSignature(expectedPayload);
        pencil.nodeCountMatch = Number(pencil.exported?.nodeCount || 0) === expected.counts.pageCount;
        pencil.rawTreeCountMatch = exportedRawNodes.length === expected.counts.pageCount;
        pencil.rawTreeHashMatch = stableHash(exportedRawNodes) === stableHash(expectedProjectedNodes);
        pencil.payloadExactHashMatch = stableHash(exported) === stableHash(expectedPayload);
        pencil.payloadHashMatch = stableHash(exportedSignature) === stableHash(expectedSignature);
        pencil.exportedPageCount = Array.isArray(exported?.pages) ? exported.pages.length : 0;
        pencil.expectedPageCount = expected.counts.pageCount;
        if (!pencil.nodeCountMatch) {
          failures.push(`pencil nodeCount mismatch: expected=${expected.counts.pageCount} actual=${pencil.exported?.nodeCount || 0}`);
        }
        if (!pencil.rawTreeCountMatch) {
          failures.push(`pencil raw tree count mismatch: expected=${expected.counts.pageCount} actual=${exportedRawNodes.length}`);
        }
        if (!pencil.rawTreeHashMatch) {
          failures.push(`pencil raw tree mismatch: ${penFile}`);
        }
      }
    }

    const structuralFailures = failures.filter((item) => !item.startsWith("pencil "));
    const report = {
      schemaVersion: "pen-exact-template-validation.v2",
      generatedAt: new Date().toISOString(),
      identity,
      penFile,
      templatePath,
      passed: failures.length === 0,
      structuralPassed: structuralFailures.length === 0,
      failureCount: failures.length,
      failures,
      checks: {
        sourceHashMatch: actual ? expected.sourceHash === actual.sourceHash : false,
        rawDocumentHashMatch: actual ? stableHash(expected.rawDocument) === stableHash(actual.rawDocument) : false,
        pageCountMatch: actual ? expected.counts.pageCount === actual.counts.pageCount : false,
        sectionCountMatch: actual ? expected.counts.totalSectionCount === actual.counts.totalSectionCount : false,
        blockCountMatch: actual ? expected.counts.totalBlockCount === actual.counts.totalBlockCount : false,
        totalNodeCountMatch: actual ? expected.counts.totalNodeCount === actual.counts.totalNodeCount : false,
      },
      pageReports,
      splitFileChecks,
      pencil,
    };

    reports.push(report);

    if (!recordsBySite.has(identity.siteId)) recordsBySite.set(identity.siteId, []);
    recordsBySite.get(identity.siteId).push({
      penFile,
      identity,
      template: expected,
      output: {
        templatePath: rel(outDir, templatePath),
        themePath: rel(outDir, path.join(variantDir, "theme.tokens.json")),
        pagesDir: rel(outDir, pagesDir),
        sectionsDir: rel(outDir, sectionsDir),
        blocksDir: rel(outDir, blocksDir),
      },
      pageOutput: new Map(expected.pages.map((page) => [page.pageId, rel(outDir, path.join(pagesDir, pageFileName(page)))])),
      sectionOutput: new Map(
        expected.pages.flatMap((page) =>
          page.sections.map((section) => [
            `${section.sectionId}::${section.order}`,
            rel(outDir, path.join(sectionsDir, sectionFileName(page, section))),
          ])
        )
      ),
      blockOutput: new Map(
        expected.pages.flatMap((page) =>
          page.sections.flatMap((section) =>
            section.blocks.map((block) => [
              `${page.pageId}::${section.sectionId}::${section.order}::${block.blockId}::${block.order}`,
              rel(outDir, path.join(blocksDir, blockFileName(page, section, block))),
            ])
          )
        )
      ),
    });

    await writeJson(path.join(validationDir, `${identity.penKey}.validation.json`), report);
  }

  const expectedArtifacts = buildExpectedArtifacts(outDir, recordsBySite);
  const siteTemplateChecks = [];
  const catalogChecks = [];
  const globalFailures = [];

  for (const [siteId, records] of Array.from(recordsBySite.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    const expectedSiteTemplate = mergeSiteVariants(siteId, records);
    const siteTemplatePath = path.join(outDir, "sites", siteId, "site.template.json");
    const siteBundlePath = path.join(outDir, "sites", siteId, "site.bundle.json");
    const siteTemplateCheck = await compareFileHash(expectedSiteTemplate, siteTemplatePath);
    siteTemplateChecks.push({ siteId, path: siteTemplatePath, passed: siteTemplateCheck.passed, error: siteTemplateCheck.error });
    if (!siteTemplateCheck.passed) {
      globalFailures.push(`site template mismatch: ${siteTemplatePath}${siteTemplateCheck.error ? ` (${siteTemplateCheck.error})` : ""}`);
    }

    const expectedBundle = {
      siteId,
      siteName: titleCase(siteId),
      bundleHash: expectedSiteTemplate.bundleHash,
      variants: expectedSiteTemplate.variants,
      output: {
        siteTemplatePath: rel(outDir, siteTemplatePath),
      },
    };
    const bundleCheck = await compareFileHash(expectedBundle, siteBundlePath);
    siteTemplateChecks.push({ siteId, path: siteBundlePath, passed: bundleCheck.passed, error: bundleCheck.error });
    if (!bundleCheck.passed) {
      globalFailures.push(`site bundle mismatch: ${siteBundlePath}${bundleCheck.error ? ` (${bundleCheck.error})` : ""}`);
    }
  }

  const catalogFiles = [
    ["siteCatalog", "site-catalog.json"],
    ["pageCatalog", "page-catalog.json"],
    ["sectionCatalog", "section-catalog.json"],
    ["blockCatalog", "block-catalog.json"],
  ];
  for (const [key, fileName] of catalogFiles) {
    const filePath = path.join(outDir, fileName);
    const check = await compareFileHash(expectedArtifacts[key], filePath);
    catalogChecks.push({ key, path: filePath, passed: check.passed, error: check.error });
    if (!check.passed) globalFailures.push(`catalog mismatch: ${filePath}${check.error ? ` (${check.error})` : ""}`);
  }

  const manifest = {
    schemaVersion: "pen-exact-template-validation-manifest.v2",
    generatedAt: new Date().toISOString(),
    sourceDir,
    outDir,
    pencilProbe,
    totalFiles: reports.length,
    passedFiles: reports.filter((report) => report.passed).length,
    structuralPassedFiles: reports.filter((report) => report.structuralPassed).length,
    failedFiles: reports.filter((report) => !report.passed).length,
    pencilPassedFiles: reports.filter((report) => report.pencil?.passed && report.pencil?.rawTreeHashMatch).length,
    pencilSkippedFiles: reports.filter((report) => report.pencil?.skipped).length,
    skipPencil,
    requirePencil,
    siteTemplateChecks,
    catalogChecks,
    globalFailureCount: globalFailures.length,
    globalFailures,
    failuresByFile: reports
      .filter((report) => !report.passed)
      .map((report) => ({
        penFile: report.penFile,
        failureCount: report.failureCount,
        failures: report.failures,
      })),
  };

  await writeJson(path.join(validationDir, "manifest.json"), manifest);
  console.log(JSON.stringify(manifest, null, 2));
  process.exit(manifest.failedFiles > 0 || globalFailures.length > 0 ? 1 : 0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
