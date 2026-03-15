#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

import { DEFAULT_OUT_DIR, readJson, writeJson } from "./lib/pen-exact-template-utils.mjs";

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

const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  const args = parseArgs(process.argv);
  const exactOutDir = path.resolve(args["exact-out-dir"] || DEFAULT_OUT_DIR);
  const bundleOutDir = path.resolve(
    args["out-dir"] || path.join(path.dirname(exactOutDir), "pen-site-publish-bundles")
  );

  const exactManifest = await readJson(path.join(exactOutDir, "manifest.json"));
  const validationManifest = await readJson(path.join(exactOutDir, "validation", "manifest.json"));
  const visualManifest = await readJson(path.join(exactOutDir, "visual-validation", "manifest.json"));
  const runtimeAudit = await readJson(path.join(exactOutDir, "site-template-audit.json"));
  const bundleManifest = await readJson(path.join(bundleOutDir, "manifest.json"));

  const expectedBySite = new Map();
  for (const entry of exactManifest.entries || []) {
    const siteId = String(entry.siteId || "").trim();
    if (!expectedBySite.has(siteId)) expectedBySite.set(siteId, new Set());
    expectedBySite.get(siteId).add(String(entry.variant || "").trim());
  }

  const siteResults = [];
  let failureCount = 0;

  for (const site of bundleManifest.sites || []) {
    const bundlePath = path.join(bundleOutDir, String(site.bundlePath || ""));
    const reviewPath = path.join(bundleOutDir, String(site.reviewPath || ""));
    const readinessPath = path.join(bundleOutDir, String(site.readinessPath || ""));
    const problems = [];

    const [bundleExists, reviewExists, readinessExists] = await Promise.all([
      exists(bundlePath),
      exists(reviewPath),
      exists(readinessPath),
    ]);
    if (!bundleExists) problems.push("missing_bundle");
    if (!reviewExists) problems.push("missing_review");
    if (!readinessExists) problems.push("missing_readiness");

    const bundleDoc = bundleExists ? await readJson(bundlePath) : null;
    const reviewDoc = reviewExists ? await readJson(reviewPath) : null;
    const expectedVariants = expectedBySite.get(String(site.siteId || "").trim()) || new Set();

    if (bundleDoc) {
      const availableVariants = new Set(
        (Array.isArray(bundleDoc.availableVariants) ? bundleDoc.availableVariants : []).map((entry) =>
          String(entry || "").trim()
        )
      );
      for (const variant of expectedVariants) {
        if (!availableVariants.has(variant)) problems.push(`missing_variant:${variant}`);
      }
      if (!bundleDoc?.responsiveModes?.desktop?.supported) problems.push("desktop_mode_not_supported");
      if (!bundleDoc?.responsiveModes?.mobile?.supported) problems.push("mobile_mode_not_supported");
      if (!Array.isArray(bundleDoc.artifacts) || !bundleDoc.artifacts.length) problems.push("missing_artifacts");

      for (const artifact of Array.isArray(bundleDoc.artifacts) ? bundleDoc.artifacts : []) {
        if (!(await exists(String(artifact.penFile || "")))) {
          problems.push(`missing_pen_file:${artifact.caseId}`);
        }
        if (!(await exists(String(artifact.payloadPath || "")))) {
          problems.push(`missing_payload:${artifact.caseId}`);
        }
      }
    }

    if (reviewDoc && bundleDoc) {
      const reviewItems = new Map(
        (Array.isArray(reviewDoc.items) ? reviewDoc.items : []).map((item) => [String(item.caseId || ""), item])
      );
      for (const artifact of Array.isArray(bundleDoc.artifacts) ? bundleDoc.artifacts : []) {
        const reviewItem = reviewItems.get(String(artifact.caseId || ""));
        if (!reviewItem) {
          problems.push(`missing_review_item:${artifact.caseId}`);
          continue;
        }
        if (String(reviewItem.status || "").trim().toLowerCase() !== "approved") {
          problems.push(`review_not_approved:${artifact.caseId}`);
        }
      }
    }

    if (problems.length) failureCount += 1;
    siteResults.push({
      siteId: site.siteId,
      siteName: site.siteName,
      passed: problems.length === 0,
      problems,
      bundlePath,
      reviewPath,
      readinessPath,
    });
  }

  const output = {
    schemaVersion: "pen-site-publish-bundles-verification.v1",
    generatedAt: new Date().toISOString(),
    outDir: bundleOutDir,
    totalSites: siteResults.length,
    passedSites: siteResults.filter((entry) => entry.passed).length,
    failedSites: failureCount,
    sourceQualityGates: {
      structuralValidationPassed:
        Number(validationManifest.failedFiles || 0) === 0 &&
        Number(validationManifest.structuralPassedFiles || 0) === Number(validationManifest.passedFiles || 0),
      pencilValidationPassed:
        Number(validationManifest.failedFiles || 0) === 0 &&
        Number(validationManifest.pencilPassedFiles || 0) === Number(validationManifest.passedFiles || 0),
      visualValidationPassed:
        Number(visualManifest.failedPages || 0) === 0 &&
        Number(visualManifest.passedPages || 0) === Number(visualManifest.totalPages || 0),
      sandboxRuntimePassed: Number(runtimeAudit.failingVariants || 0) === 0,
    },
    sites: siteResults,
  };

  await writeJson(path.join(bundleOutDir, "verification.json"), output);
  console.log(
    JSON.stringify(
      {
        outDir: bundleOutDir,
        totalSites: output.totalSites,
        passedSites: output.passedSites,
        failedSites: output.failedSites,
        verificationPath: path.join(bundleOutDir, "verification.json"),
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
