#!/usr/bin/env node

import path from "node:path";

import {
  DEFAULT_OUT_DIR,
  DEFAULT_SOURCE_DIR,
  buildAssetIndex,
  buildExactTemplate,
  collectPenFiles,
  ensureDir,
  parsePenIdentity,
  readJson,
  slugify,
  stableHash,
  titleCase,
  writeJson,
} from "./lib/pen-exact-template-utils.mjs";

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

  const registerPage = (record, page) => {
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
    if (!mergedPage.pageName) mergedPage.pageName = page.pageName;
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
  };

  for (const record of sortedRecords) {
    for (const page of record.template.pages) registerPage(record, page);
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

const main = async () => {
  const options = parseArgs(process.argv);
  const sourceDir = path.resolve(options["source-dir"] || process.argv[2] || DEFAULT_SOURCE_DIR);
  const outDir = path.resolve(options["out-dir"] || process.argv[3] || DEFAULT_OUT_DIR);

  const penFiles = await collectPenFiles(sourceDir);
  const assetIndex = await buildAssetIndex(sourceDir);
  const siteGroups = new Map();
  const manifestEntries = [];
  const siteCatalog = [];
  const pageCatalog = [];
  const sectionCatalog = [];
  const blockCatalog = [];

  await ensureDir(outDir);

  for (const penFile of penFiles) {
    const identity = parsePenIdentity(penFile);
    const doc = await readJson(penFile);
    const template = await buildExactTemplate({
      filePath: penFile,
      doc,
      assetIndex,
      sourceDir,
    });

    const siteDir = path.join(outDir, "sites", identity.siteId);
    const variantDir = path.join(siteDir, "variants", identity.variantKey);
    const pagesDir = path.join(variantDir, "pages");
    const sectionsDir = path.join(variantDir, "sections");
    const blocksDir = path.join(variantDir, "blocks");
    await ensureDir(blocksDir);

    const templatePath = path.join(variantDir, "template.json");
    const themePath = path.join(variantDir, "theme.tokens.json");
    await writeJson(templatePath, template);
    await writeJson(themePath, template.theme);

    const pageOutput = new Map();
    const sectionOutput = new Map();
    const blockOutput = new Map();

    for (const page of template.pages) {
      const pagePath = path.join(pagesDir, pageFileName(page));
      await writeJson(pagePath, page);
      pageOutput.set(page.pageId, rel(outDir, pagePath));
      pageCatalog.push({
        siteId: identity.siteId,
        siteName: identity.siteName,
        variant: identity.variantKey,
        penFile,
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
          pagePath: rel(outDir, pagePath),
        },
      });

      for (const section of page.sections) {
        const sectionPath = path.join(sectionsDir, sectionFileName(page, section));
        await writeJson(sectionPath, section);
        sectionOutput.set(`${section.sectionId}::${section.order}`, rel(outDir, sectionPath));
        sectionCatalog.push({
          siteId: identity.siteId,
          siteName: identity.siteName,
          variant: identity.variantKey,
          penFile,
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
            sectionPath: rel(outDir, sectionPath),
          },
        });

        for (const block of section.blocks) {
          const blockPath = path.join(blocksDir, blockFileName(page, section, block));
          await writeJson(blockPath, block);
          blockOutput.set(
            `${page.pageId}::${section.sectionId}::${section.order}::${block.blockId}::${block.order}`,
            rel(outDir, blockPath)
          );
          blockCatalog.push({
            siteId: identity.siteId,
            siteName: identity.siteName,
            variant: identity.variantKey,
            penFile,
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
              blockPath: rel(outDir, blockPath),
            },
          });
        }
      }
    }

    const manifestEntry = {
      penFile,
      siteId: identity.siteId,
      siteName: identity.siteName,
      variant: identity.variantKey,
      pageCount: template.counts.pageCount,
      sectionCount: template.counts.totalSectionCount,
      blockCount: template.counts.totalBlockCount,
      totalNodeCount: template.counts.totalNodeCount,
      sourceHash: template.sourceHash,
      output: {
        templatePath: rel(outDir, templatePath),
        themePath: rel(outDir, themePath),
        pagesDir: rel(outDir, pagesDir),
        sectionsDir: rel(outDir, sectionsDir),
        blocksDir: rel(outDir, blocksDir),
      },
    };
    manifestEntries.push(manifestEntry);

    if (!siteGroups.has(identity.siteId)) siteGroups.set(identity.siteId, []);
    siteGroups.get(identity.siteId).push({
      penFile,
      identity,
      template,
      output: manifestEntry.output,
      pageOutput,
      sectionOutput,
      blockOutput,
    });
  }

  for (const [siteId, records] of Array.from(siteGroups.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    const siteDir = path.join(outDir, "sites", siteId);
    const siteTemplate = mergeSiteVariants(siteId, records);
    const siteTemplatePath = path.join(siteDir, "site.template.json");
    const siteBundlePath = path.join(siteDir, "site.bundle.json");
    await writeJson(siteTemplatePath, siteTemplate);
    await writeJson(siteBundlePath, {
      siteId,
      siteName: titleCase(siteId),
      bundleHash: siteTemplate.bundleHash,
      variants: siteTemplate.variants,
      output: {
        siteTemplatePath: rel(outDir, siteTemplatePath),
      },
    });
    siteCatalog.push({
      siteId,
      siteName: titleCase(siteId),
      variantCount: siteTemplate.counts.variantCount,
      pageCount: siteTemplate.counts.pageCount,
      sectionCount: siteTemplate.counts.sectionCount,
      blockCount: siteTemplate.counts.blockCount,
      variants: siteTemplate.variants.map((variant) => variant.variant),
      output: {
        siteTemplatePath: rel(outDir, siteTemplatePath),
        siteBundlePath: rel(outDir, siteBundlePath),
      },
    });
  }

  pageCatalog.sort((a, b) =>
    a.siteId.localeCompare(b.siteId) ||
    a.variant.localeCompare(b.variant) ||
    a.order - b.order ||
    a.pageKey.localeCompare(b.pageKey)
  );
  sectionCatalog.sort((a, b) =>
    a.siteId.localeCompare(b.siteId) ||
    a.variant.localeCompare(b.variant) ||
    a.pageKey.localeCompare(b.pageKey) ||
    a.order - b.order ||
    a.sectionKey.localeCompare(b.sectionKey)
  );
  blockCatalog.sort((a, b) =>
    a.siteId.localeCompare(b.siteId) ||
    a.variant.localeCompare(b.variant) ||
    a.pageKey.localeCompare(b.pageKey) ||
    a.sectionKey.localeCompare(b.sectionKey) ||
    a.order - b.order ||
    a.blockKey.localeCompare(b.blockKey)
  );

  await writeJson(path.join(outDir, "site-catalog.json"), siteCatalog);
  await writeJson(path.join(outDir, "page-catalog.json"), pageCatalog);
  await writeJson(path.join(outDir, "section-catalog.json"), sectionCatalog);
  await writeJson(path.join(outDir, "block-catalog.json"), blockCatalog);

  const manifest = {
    schemaVersion: "pen-exact-template-manifest.v2",
    generatedAt: new Date().toISOString(),
    sourceDir,
    penFileCount: penFiles.length,
    siteCount: siteGroups.size,
    pageCount: pageCatalog.length,
    sectionCount: sectionCatalog.length,
    blockCount: blockCatalog.length,
    entries: manifestEntries.sort((a, b) => a.penFile.localeCompare(b.penFile)),
    catalogs: {
      siteCatalog: "site-catalog.json",
      pageCatalog: "page-catalog.json",
      sectionCatalog: "section-catalog.json",
      blockCatalog: "block-catalog.json",
    },
  };

  await writeJson(path.join(outDir, "manifest.json"), manifest);
  console.log(
    JSON.stringify(
      {
        sourceDir,
        outDir,
        penFileCount: penFiles.length,
        siteCount: siteGroups.size,
        pageCount: pageCatalog.length,
        sectionCount: sectionCatalog.length,
        blockCount: blockCatalog.length,
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
