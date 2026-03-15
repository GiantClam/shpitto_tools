#!/usr/bin/env node

import path from "node:path";

import { DEFAULT_OUT_DIR, readJson } from "./lib/pen-exact-template-utils.mjs";
import { buildPenHtmlDocument } from "./lib/pen-page-html-render.mjs";

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

const main = async () => {
  const args = parseArgs(process.argv);
  const exactOutDir = path.resolve(args["exact-out-dir"] || DEFAULT_OUT_DIR);
  const outDir = path.resolve(args["out-dir"] || path.join(path.dirname(exactOutDir), "pen-skinnable-templates"));
  const manifest = await readJson(path.join(outDir, "manifest.json"));

  const failures = [];
  const checks = [];

  for (const variant of manifest.variants || []) {
    if ((variant.counts?.textSlotCount || 0) < 1) failures.push(`no text slots: ${variant.siteId}/${variant.variant}`);
    if ((variant.counts?.styleSlotCount || 0) < 1) failures.push(`no style slots: ${variant.siteId}/${variant.variant}`);
  }

  const sampleVariants = (manifest.variants || []).slice(0, 4);
  for (const variant of sampleVariants) {
    const skin = await readJson(path.join(outDir, variant.templatePath));
    const exactTemplate = await readJson(path.join(exactOutDir, "sites", variant.siteId, "variants", variant.variant, "template.json"));
    const page = exactTemplate.pages[0];
    const pageSkin = skin.pages.find((entry) => entry.pageId === page.pageId) || skin.pages[0];
    const textSlot = pageSkin?.editable?.textSlots?.[0];
    const imageSlot = pageSkin?.editable?.imageSlots?.[0];
    const overrideMap = {};
    if (textSlot) overrideMap[textSlot.nodeId] = { content: `Skinnable Preview ${variant.siteId} ${variant.variant}` };
    if (imageSlot) overrideMap[imageSlot.nodeId] = {
      ...(overrideMap[imageSlot.nodeId] || {}),
      fill: { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" },
    };

    const html = await buildPenHtmlDocument(
      page.rawPageNode,
      { width: Number(page.rawPageNode?.width || 1440), height: Number(page.rawPageNode?.height || 1600) },
      page.assetRefs || [],
      { overrideMap }
    );

    if (textSlot && !html.includes(`Skinnable Preview ${variant.siteId} ${variant.variant}`)) {
      failures.push(`text override missing in html: ${variant.siteId}/${variant.variant}`);
    }
    if (imageSlot && !html.includes("images.unsplash.com")) {
      failures.push(`image override missing in html: ${variant.siteId}/${variant.variant}`);
    }

    checks.push({
      siteId: variant.siteId,
      variant: variant.variant,
      textSlotChecked: Boolean(textSlot),
      imageSlotChecked: Boolean(imageSlot),
    });
  }

  console.log(
    JSON.stringify(
      {
        outDir,
        variantCount: manifest.totalVariants,
        failureCount: failures.length,
        checks,
        failures,
      },
      null,
      2
    )
  );
  if (failures.length) process.exitCode = 1;
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
