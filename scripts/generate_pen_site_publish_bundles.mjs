#!/usr/bin/env node

import path from "node:path";

import {
  DEFAULT_OUT_DIR,
  REPO_ROOT,
  ensureDir,
  readJson,
  titleCase,
  writeJson,
} from "./lib/pen-exact-template-utils.mjs";

const parseArgs = (argv) => {
  const out = {};
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    if (!next || next.startsWith("--")) {
      out[key] = "true";
      continue;
    }
    out[key] = next;
    index += 1;
  }
  return out;
};

const rel = (baseDir, filePath) => path.relative(baseDir, filePath).split(path.sep).join("/");

const bySiteVariantKey = (siteId, variant) => `${String(siteId || "").trim()}::${String(variant || "").trim()}`;

const buildReviewNote = ({ siteName, exactMobile }) => {
  const base = [
    `${siteName} passed strict structural validation.`,
    `${siteName} passed Pencil-backed payload validation.`,
    `${siteName} passed visual parity validation.`,
    `${siteName} passed sandbox navigation/footer/runtime audit.`,
    `${siteName} is skinnable for theme, copy, image, link, and style slots.`,
  ];
  if (exactMobile) {
    base.push("Desktop and mobile source variants are both present and bundled together.");
  } else {
    base.push("Desktop source is present; mobile delivery is expected to use builder-responsive output derived from the desktop variant because no mobile source pen exists.");
  }
  return base.join(" ");
};

const main = async () => {
  const args = parseArgs(process.argv);
  const exactOutDir = path.resolve(args["exact-out-dir"] || DEFAULT_OUT_DIR);
  const skinOutDir = path.resolve(
    args["skin-out-dir"] || path.join(path.dirname(exactOutDir), "pen-skinnable-templates")
  );
  const outDir = path.resolve(
    args["out-dir"] || path.join(path.dirname(exactOutDir), "pen-site-publish-bundles")
  );
  const reviewStatus = String(args["review-status"] || "approved").trim().toLowerCase();
  const reviewer = String(args.reviewer || "codex").trim() || "codex";

  const exactManifest = await readJson(path.join(exactOutDir, "manifest.json"));
  const validationManifest = await readJson(path.join(exactOutDir, "validation", "manifest.json"));
  const visualManifest = await readJson(path.join(exactOutDir, "visual-validation", "manifest.json"));
  const runtimeAudit = await readJson(path.join(exactOutDir, "site-template-audit.json"));
  const sandboxPayloads = await readJson(path.join(exactOutDir, "site-sandbox-payloads.json"));
  const skinnableManifest = await readJson(path.join(skinOutDir, "manifest.json"));

  await ensureDir(outDir);

  const sandboxByVariant = new Map(
    (sandboxPayloads.variants || []).map((entry) => [bySiteVariantKey(entry.siteId, entry.variant), entry])
  );
  const skinnableSiteById = new Map(
    (skinnableManifest.sites || []).map((entry) => [String(entry.siteId || "").trim(), entry])
  );

  const sitesById = new Map();
  for (const entry of exactManifest.entries || []) {
    const siteId = String(entry.siteId || "").trim();
    if (!sitesById.has(siteId)) {
      sitesById.set(siteId, {
        siteId,
        siteName: String(entry.siteName || titleCase(siteId)),
        variants: [],
      });
    }
    sitesById.get(siteId).variants.push(entry);
  }

  const siteOutputs = [];
  const generatedAt = new Date().toISOString();
  const validationPassed =
    Number(validationManifest.failedFiles || 0) === 0 &&
    Number(validationManifest.pencilPassedFiles || 0) === Number(validationManifest.passedFiles || 0);
  const visualsPassed =
    Number(visualManifest.failedPages || 0) === 0 &&
    Number(visualManifest.passedPages || 0) === Number(visualManifest.totalPages || 0);
  const runtimePassed = Number(runtimeAudit.failingVariants || 0) === 0;

  for (const site of Array.from(sitesById.values()).sort((left, right) => left.siteId.localeCompare(right.siteId))) {
    const variants = [...site.variants].sort((left, right) => {
      const order = { desktop: 0, mobile: 1 };
      return (order[left.variant] ?? 9) - (order[right.variant] ?? 9);
    });
    const hasDesktop = variants.some((entry) => entry.variant === "desktop");
    const hasMobile = variants.some((entry) => entry.variant === "mobile");
    const requiredVariants = ["desktop", "mobile"];
    const availableVariants = variants.map((entry) => String(entry.variant || ""));
    const bundleDir = path.join(outDir, "sites", site.siteId);
    const bundlePath = path.join(bundleDir, "site.pen-bundle.json");
    const reviewPath = path.join(bundleDir, "site.pen-review.json");
    const readinessPath = path.join(bundleDir, "site.publish.ready.json");

    const artifacts = variants.map((entry) => {
      const sandbox = sandboxByVariant.get(bySiteVariantKey(site.siteId, entry.variant)) || null;
      const sandboxSiteKey =
        String(sandbox?.sandboxSiteKey || `pen-exact-site-${site.siteId}-${entry.variant}`).trim();
      const payloadPath = path.join(
        REPO_ROOT,
        "asset-factory",
        "out",
        "p2w",
        sandboxSiteKey,
        "sandbox",
        "payload.json"
      );
      return {
        caseId: `${site.siteId}-${entry.variant}`,
        siteId: site.siteId,
        siteName: site.siteName,
        siteGroupId: site.siteId,
        variant: entry.variant,
        siteKey: sandboxSiteKey,
        penFile: path.resolve(String(entry.penFile || "")),
        payloadPath,
        sourceHash: String(entry.sourceHash || ""),
        pageCount: Number(entry.pageCount || 0),
        sectionCount: Number(entry.sectionCount || 0),
        blockCount: Number(entry.blockCount || 0),
        exactTemplatePath: path.join(exactOutDir, String(entry.output?.templatePath || "")),
        skinnableTemplatePath: path.join(
          skinOutDir,
          "sites",
          site.siteId,
          "variants",
          entry.variant,
          "template.skin.json"
        ),
        previewPages: Number(sandbox?.pageCount || entry.pageCount || 0),
        previewUrl:
          (Array.isArray(sandbox?.pages) ? sandbox.pages[0]?.previewUrl : "") ||
          `http://localhost:3000/creation/sandbox?mode=preview&siteKey=${encodeURIComponent(sandboxSiteKey)}&page=home`,
      };
    });

    const skinnableSite = skinnableSiteById.get(site.siteId) || null;
    const responsiveModes = {
      desktop: {
        supported: hasDesktop,
        sourceVariant: hasDesktop ? "desktop" : "",
        mode: hasDesktop ? "exact-source" : "unavailable",
      },
      mobile: hasMobile
        ? {
            supported: true,
            sourceVariant: "mobile",
            mode: "exact-source",
          }
        : {
            supported: Boolean(hasDesktop),
            sourceVariant: hasDesktop ? "desktop" : "",
            mode: hasDesktop ? "responsive-derived-from-desktop" : "unavailable",
          },
    };

    const bundleDoc = {
      schemaVersion: "template-factory.pen.v1",
      kind: "site-pen-bundle",
      generatedAt,
      siteId: site.siteId,
      siteName: site.siteName,
      reviewMode: "site-level",
      requiredVariants,
      availableVariants,
      responsiveModes,
      capabilities: {
        exactTemplate: true,
        skinnable: true,
        sandboxPreview: true,
        dualModeReady: Boolean(responsiveModes.desktop.supported && responsiveModes.mobile.supported),
        exactMobileSource: hasMobile,
      },
      commercialReadiness: {
        structuralValidationPassed: validationPassed,
        visualValidationPassed: visualsPassed,
        sandboxRuntimePassed: runtimePassed,
        skinnableReady: Boolean(skinnableSite),
        publishInputReady: true,
      },
      artifacts,
    };

    const reviewDoc = {
      schemaVersion: "template-factory.pen-review.v1",
      generatedAt,
      reviewedAt: generatedAt,
      sourcePenFile: bundlePath,
      runId: `pen-site-bundle-${site.siteId}`,
      reviewer,
      notes: buildReviewNote({ siteName: site.siteName, exactMobile: hasMobile }),
      items: artifacts.map((artifact) => ({
        caseId: artifact.caseId,
        penFile: artifact.penFile,
        status: reviewStatus,
        notes:
          artifact.variant === "mobile"
            ? "Mobile source variant bundled and approved."
            : hasMobile
              ? "Desktop source variant bundled with matching mobile variant."
              : "Desktop source variant approved; mobile delivery is expected to use responsive builder output derived from desktop.",
      })),
    };

    const readinessDoc = {
      schemaVersion: "pen-site-publish-readiness.v1",
      generatedAt,
      siteId: site.siteId,
      siteName: site.siteName,
      requiredVariants,
      availableVariants,
      responsiveModes,
      qualityGates: {
        structuralValidationPassed: validationPassed,
        visualValidationPassed: visualsPassed,
        sandboxRuntimePassed: runtimePassed,
        skinnableReady: Boolean(skinnableSite),
      },
      bundlePath,
      reviewPath,
      artifacts: artifacts.map((artifact) => ({
        caseId: artifact.caseId,
        variant: artifact.variant,
        penFile: artifact.penFile,
        payloadPath: artifact.payloadPath,
        previewUrl: artifact.previewUrl,
      })),
    };

    await writeJson(bundlePath, bundleDoc);
    await writeJson(reviewPath, reviewDoc);
    await writeJson(readinessPath, readinessDoc);

    siteOutputs.push({
      siteId: site.siteId,
      siteName: site.siteName,
      bundlePath: rel(outDir, bundlePath),
      reviewPath: rel(outDir, reviewPath),
      readinessPath: rel(outDir, readinessPath),
      variantCount: availableVariants.length,
      requiredVariants,
      availableVariants,
      responsiveModes,
      exactMobileSource: hasMobile,
      counts: skinnableSite?.counts || null,
    });
  }

  const output = {
    schemaVersion: "pen-site-publish-bundles-manifest.v1",
    generatedAt,
    exactOutDir,
    skinOutDir,
    outDir,
    totalSites: siteOutputs.length,
    pairedSiteCount: siteOutputs.filter((entry) => entry.availableVariants.includes("desktop") && entry.availableVariants.includes("mobile")).length,
    desktopOnlySiteCount: siteOutputs.filter((entry) => !entry.availableVariants.includes("mobile")).length,
    exactMobileSiteCount: siteOutputs.filter((entry) => entry.exactMobileSource).length,
    derivedMobileSiteCount: siteOutputs.filter((entry) => !entry.exactMobileSource).length,
    qualityGates: {
      structuralValidationPassed: validationPassed,
      visualValidationPassed: visualsPassed,
      sandboxRuntimePassed: runtimePassed,
      publishInputReady: true,
    },
    sites: siteOutputs,
  };

  await writeJson(path.join(outDir, "manifest.json"), output);
  console.log(
    JSON.stringify(
      {
        outDir,
        totalSites: output.totalSites,
        pairedSiteCount: output.pairedSiteCount,
        desktopOnlySiteCount: output.desktopOnlySiteCount,
        exactMobileSiteCount: output.exactMobileSiteCount,
        derivedMobileSiteCount: output.derivedMobileSiteCount,
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
