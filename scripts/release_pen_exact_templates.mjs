#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

import { DEFAULT_OUT_DIR, DEFAULT_SOURCE_DIR, writeJson } from "./lib/pen-exact-template-utils.mjs";

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

const runNodeScript = async (scriptPath, args) =>
  new Promise((resolve, reject) => {
    const child = spawn("node", [scriptPath, ...args], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(scriptPath)} exited with code ${code}`));
    });
  });

const main = async () => {
  const options = parseArgs(process.argv);
  const sourceDir = path.resolve(options["source-dir"] || DEFAULT_SOURCE_DIR);
  const outDir = path.resolve(options["out-dir"] || DEFAULT_OUT_DIR);
  const validationManifestPath = path.join(outDir, "validation", "manifest.json");
  const releaseManifestPath = path.join(outDir, "release-manifest.json");

  await runNodeScript(path.resolve("scripts/generate_pen_exact_templates.mjs"), ["--source-dir", sourceDir, "--out-dir", outDir]);
  await runNodeScript(path.resolve("scripts/validate_pen_exact_templates.mjs"), [
    "--source-dir",
    sourceDir,
    "--out-dir",
    outDir,
    "--require-pencil",
  ]);

  const validationManifest = JSON.parse(await fs.readFile(validationManifestPath, "utf8"));
  const releaseManifest = {
    schemaVersion: "pen-exact-template-release-manifest.v1",
    generatedAt: new Date().toISOString(),
    sourceDir,
    outDir,
    releaseGate: {
      pencilRequired: true,
      failedFiles: validationManifest.failedFiles,
      structuralPassedFiles: validationManifest.structuralPassedFiles,
      pencilPassedFiles: validationManifest.pencilPassedFiles,
      globalFailureCount: validationManifest.globalFailureCount,
    },
    validationManifestPath,
    releaseReady:
      validationManifest.failedFiles === 0 &&
      validationManifest.globalFailureCount === 0 &&
      validationManifest.totalFiles === validationManifest.structuralPassedFiles &&
      validationManifest.totalFiles === validationManifest.pencilPassedFiles,
  };

  await writeJson(releaseManifestPath, releaseManifest);
  console.log(JSON.stringify(releaseManifest, null, 2));
  process.exit(releaseManifest.releaseReady ? 0 : 1);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
