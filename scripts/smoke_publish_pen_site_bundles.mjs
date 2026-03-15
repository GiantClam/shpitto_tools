#!/usr/bin/env node

import { spawn } from "node:child_process";
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

const main = async () => {
  const args = parseArgs(process.argv);
  const exactOutDir = path.resolve(args["exact-out-dir"] || DEFAULT_OUT_DIR);
  const bundleOutDir = path.resolve(
    args["out-dir"] || path.join(path.dirname(exactOutDir), "pen-site-publish-bundles")
  );
  const manifest = await readJson(path.join(bundleOutDir, "manifest.json"));
  const builderDir = path.join(process.cwd(), "builder");
  const siteFilter = String(args["site-id"] || "").trim();
  const limit = Number(args.limit || 0);

  let sites = Array.isArray(manifest.sites) ? [...manifest.sites] : [];
  if (siteFilter) {
    sites = sites.filter((entry) => String(entry.siteId || "").trim() === siteFilter);
  }
  if (limit > 0) sites = sites.slice(0, limit);

  const rows = [];
  for (const site of sites) {
    const runId = `tf-${String(site.siteId || "site")}-site-bundle-smoke`;
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
        "--no-publish",
      ],
      cwd: builderDir,
    });
    rows.push({
      siteId: site.siteId,
      siteName: site.siteName,
      passed: result.code === 0,
      exitCode: result.code,
      runId,
      bundlePath,
      reviewPath,
      stdoutTail: result.stdout.split("\n").slice(-20).join("\n").trim(),
      stderrTail: result.stderr.split("\n").slice(-20).join("\n").trim(),
    });
  }

  const output = {
    schemaVersion: "pen-site-publish-smoke.v1",
    generatedAt: new Date().toISOString(),
    outDir: bundleOutDir,
    siteCount: rows.length,
    passedSites: rows.filter((entry) => entry.passed).length,
    failedSites: rows.filter((entry) => !entry.passed).length,
    sites: rows,
  };

  await writeJson(path.join(bundleOutDir, "smoke-publish.json"), output);
  console.log(
    JSON.stringify(
      {
        outDir: bundleOutDir,
        siteCount: output.siteCount,
        passedSites: output.passedSites,
        failedSites: output.failedSites,
        reportPath: path.join(bundleOutDir, "smoke-publish.json"),
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
