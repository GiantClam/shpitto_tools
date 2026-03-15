#!/usr/bin/env node

import path from "node:path";

import { DEFAULT_OUT_DIR, ensureDir, readJson, writeJson } from "./lib/pen-exact-template-utils.mjs";
import { buildSkinnableSiteBundle, buildSkinnableTemplate } from "./lib/pen-skinnable-template-utils.mjs";

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

const rel = (baseDir, filePath) => path.relative(baseDir, filePath).split(path.sep).join("/");

const main = async () => {
  const args = parseArgs(process.argv);
  const exactOutDir = path.resolve(args["exact-out-dir"] || DEFAULT_OUT_DIR);
  const outDir = path.resolve(args["out-dir"] || path.join(path.dirname(exactOutDir), "pen-skinnable-templates"));

  const manifest = await readJson(path.join(exactOutDir, "manifest.json"));
  await ensureDir(outDir);

  const variantOutputs = [];
  const siteBundles = [];
  const variantsBySite = new Map();

  for (const entry of manifest.entries || []) {
    if (!variantsBySite.has(entry.siteId)) {
      variantsBySite.set(entry.siteId, {
        siteId: entry.siteId,
        siteName: entry.siteName,
        variants: [],
      });
    }
    variantsBySite.get(entry.siteId).variants.push(entry);
  }

  for (const siteEntry of variantsBySite.values()) {
    const variantEntries = [];
    for (const variantMeta of siteEntry.variants || []) {
      const templatePath = path.join(exactOutDir, variantMeta.output.templatePath);
      const exactTemplate = await readJson(templatePath);
      const skinnableTemplate = buildSkinnableTemplate({ exactTemplate, templatePath: rel(outDir, templatePath) });
      const variantDir = path.join(outDir, "sites", siteEntry.siteId, "variants", variantMeta.variant);
      const variantOutPath = path.join(variantDir, "template.skin.json");
      await writeJson(variantOutPath, skinnableTemplate);

      const editableCatalogPath = path.join(variantDir, "editable.catalog.json");
      await writeJson(editableCatalogPath, {
        schemaVersion: "pen-skinnable-editable-catalog.v1",
        generatedAt: new Date().toISOString(),
        identity: skinnableTemplate.identity,
        counts: skinnableTemplate.counts,
        pages: skinnableTemplate.pages.map((page) => ({
          pageId: page.pageId,
          pageName: page.pageName,
          pageType: page.pageType,
          counts: page.counts,
          sections: page.sections,
        })),
      });

      const variantEntry = {
        siteId: siteEntry.siteId,
        siteName: siteEntry.siteName,
        variant: variantMeta.variant,
        counts: skinnableTemplate.counts,
        templatePath: rel(outDir, variantOutPath),
        editableCatalogPath: rel(outDir, editableCatalogPath),
      };
      variantEntries.push(variantEntry);
      variantOutputs.push(variantEntry);
    }

    const siteBundle = buildSkinnableSiteBundle({
      siteId: siteEntry.siteId,
      siteName: siteEntry.siteName,
      variants: variantEntries,
    });
    const siteBundlePath = path.join(outDir, "sites", siteEntry.siteId, "site.skin.json");
    await writeJson(siteBundlePath, siteBundle);
    siteBundles.push({
      siteId: siteEntry.siteId,
      siteName: siteEntry.siteName,
      siteBundlePath: rel(outDir, siteBundlePath),
      counts: siteBundle.counts,
      variantCount: siteBundle.variantCount,
    });
  }

  const output = {
    schemaVersion: "pen-skinnable-template-manifest.v1",
    generatedAt: new Date().toISOString(),
    exactOutDir,
    outDir,
    totalSites: siteBundles.length,
    totalVariants: variantOutputs.length,
    counts: {
      pageCount: variantOutputs.reduce((sum, variant) => sum + Number(variant.counts?.pageCount || 0), 0),
      textSlotCount: variantOutputs.reduce((sum, variant) => sum + Number(variant.counts?.textSlotCount || 0), 0),
      imageSlotCount: variantOutputs.reduce((sum, variant) => sum + Number(variant.counts?.imageSlotCount || 0), 0),
      linkSlotCount: variantOutputs.reduce((sum, variant) => sum + Number(variant.counts?.linkSlotCount || 0), 0),
      styleSlotCount: variantOutputs.reduce((sum, variant) => sum + Number(variant.counts?.styleSlotCount || 0), 0),
    },
    sites: siteBundles,
    variants: variantOutputs,
  };

  await writeJson(path.join(outDir, "manifest.json"), output);
  console.log(
    JSON.stringify(
      {
        exactOutDir,
        outDir,
        totalSites: output.totalSites,
        totalVariants: output.totalVariants,
        counts: output.counts,
        outputPath: path.join(outDir, "manifest.json"),
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
