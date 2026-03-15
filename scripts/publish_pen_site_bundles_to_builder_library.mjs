#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

import { DEFAULT_OUT_DIR, REPO_ROOT, readJson, slugify, writeJson } from "./lib/pen-exact-template-utils.mjs";

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

const run = ({ cmd, args, cwd }) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk || "");
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk || "");
    });
    child.on("close", (code) => {
      resolve({ code: Number(code || 0), stdout, stderr });
    });
  });

const backupIfExists = async (sourcePath, targetPath) => {
  try {
    await fs.access(sourcePath);
  } catch {
    return false;
  }
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);
  return true;
};

const rel = (base, filePath) => path.relative(base, filePath).split(path.sep).join("/");

const main = async () => {
  const args = parseArgs(process.argv);
  const exactOutDir = path.resolve(args["exact-out-dir"] || DEFAULT_OUT_DIR);
  const bundleOutDir = path.resolve(
    args["out-dir"] || path.join(path.dirname(exactOutDir), "pen-site-publish-bundles")
  );
  const manifest = await readJson(path.join(bundleOutDir, "manifest.json"));

  const builderDir = path.join(REPO_ROOT, "builder");
  const libraryDir = path.join(builderDir, "template-factory", "library");
  const generatedAt = new Date().toISOString();
  const stamp = generatedAt.replace(/[:.]/g, "-");
  const backupDir = path.join(libraryDir, "backups", `pen-site-publish-${stamp}`);

  const filesToBackup = [
    "style-profiles.generated.json",
    "template-exclusive-components.generated.json",
    "template-block-catalog.generated.json",
    "template-generation-contracts.generated.json",
  ];
  const backups = [];
  for (const fileName of filesToBackup) {
    const sourcePath = path.join(libraryDir, fileName);
    const targetPath = path.join(backupDir, fileName);
    if (await backupIfExists(sourcePath, targetPath)) {
      backups.push({ fileName, backupPath: targetPath });
    }
  }

  const publishRows = [];
  for (const site of manifest.sites || []) {
    const runId = `tf-${String(site.siteId || "site")}-site-bundle-publish`;
    const bundlePath = path.join(bundleOutDir, String(site.bundlePath || ""));
    const reviewPath = path.join(bundleOutDir, String(site.reviewPath || ""));
    const result = await run({
      cmd: "npm",
      args: [
        "run",
        "template:factory",
        "--",
        "--mode",
        "template-from-pen",
        "--run-id",
        runId,
        "--pen-file",
        bundlePath,
        "--pen-review-file",
        reviewPath,
      ],
      cwd: builderDir,
    });
    publishRows.push({
      siteId: site.siteId,
      siteName: site.siteName,
      passed: result.code === 0,
      exitCode: result.code,
      runId,
      bundlePath,
      reviewPath,
      stdoutTail: result.stdout.split("\n").slice(-30).join("\n").trim(),
      stderrTail: result.stderr.split("\n").slice(-30).join("\n").trim(),
    });
    if (result.code !== 0) break;
  }

  const styleProfilesDoc = await readJson(path.join(libraryDir, "style-profiles.generated.json"));
  const profiles = Array.isArray(styleProfilesDoc?.profiles) ? styleProfilesDoc.profiles : [];
  const siteRegistry = (manifest.sites || []).map((site) => {
    const availableVariants = Array.isArray(site.availableVariants) ? site.availableVariants : [];
    const profileIds = availableVariants.map((variant) => `${slugify(site.siteId)}-${variant}`);
    return {
      siteId: site.siteId,
      siteName: site.siteName,
      availableVariants,
      responsiveModes: site.responsiveModes,
      profileIds,
      publishedProfileIds: profileIds.filter((profileId) =>
        profiles.some((profile) => String(profile?.id || "").trim() === profileId)
      ),
    };
  });

  const siteRegistryPath = path.join(libraryDir, "pen-site-registry.generated.json");
  await writeJson(siteRegistryPath, {
    generatedAt,
    source: "pen-site-publish-bundles",
    siteCount: siteRegistry.length,
    sites: siteRegistry,
  });

  const output = {
    schemaVersion: "pen-site-library-publish.v1",
    generatedAt,
    bundleOutDir,
    builderDir,
    backupDir,
    backups: backups.map((entry) => ({ fileName: entry.fileName, backupPath: rel(REPO_ROOT, entry.backupPath) })),
    attemptedSites: publishRows.length,
    publishedSites: publishRows.filter((entry) => entry.passed).length,
    failedSites: publishRows.filter((entry) => !entry.passed).length,
    profileCount: Number(styleProfilesDoc?.profileCount || profiles.length || 0),
    penSiteRegistryPath: rel(REPO_ROOT, siteRegistryPath),
    rows: publishRows,
  };

  await writeJson(path.join(bundleOutDir, "publish-report.json"), output);
  console.log(
    JSON.stringify(
      {
        bundleOutDir,
        backupDir,
        attemptedSites: output.attemptedSites,
        publishedSites: output.publishedSites,
        failedSites: output.failedSites,
        profileCount: output.profileCount,
        publishReportPath: path.join(bundleOutDir, "publish-report.json"),
        penSiteRegistryPath: siteRegistryPath,
      },
      null,
      2
    )
  );

  if (output.failedSites > 0) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
