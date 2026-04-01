#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const ROOT = process.cwd();
const REPO_ROOT = path.resolve(ROOT, "..");
const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const DEFAULT_OUT_DIR = path.join(ROOT, "regression", "reports");

const normalizePath = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
};

const timestampForFile = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(
    date.getMinutes()
  )}${pad(date.getSeconds())}`;
};

const toPageParam = (pathValue) => {
  const normalized = normalizePath(pathValue);
  return normalized === "/" ? "home" : encodeURIComponent(normalized);
};

const parseArgs = (argv) => {
  const options = {
    baseUrl: DEFAULT_BASE_URL,
    outDir: DEFAULT_OUT_DIR,
    siteKey: "",
    pages: [],
    reuseReportFile: "",
    caseId: "",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--base-url" && next) {
      options.baseUrl = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--out-dir" && next) {
      options.outDir = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--site-key" && next) {
      options.siteKey = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--pages" && next) {
      options.pages = String(next)
        .split(",")
        .map((item) => normalizePath(item))
        .filter(Boolean);
      i += 1;
      continue;
    }
    if (arg === "--reuse-report" && next) {
      options.reuseReportFile = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--case-id" && next) {
      options.caseId = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--help") {
      console.log(`Usage: node regression/run-sandbox-nav-consistency.mjs [options]

Options:
  --base-url <url>          Builder base URL (default: ${DEFAULT_BASE_URL})
  --site-key <id>           Existing site key to validate
  --reuse-report <path>     Creation/browser report JSON to resolve site key
  --case-id <id>            Optional case id when using --reuse-report
  --pages <a,b,c>           Optional page paths to check (default: infer from result.json)
  --out-dir <path>          Report output directory (default: regression/reports)
`);
      process.exit(0);
    }
  }
  return options;
};

const resolveSiteKeyFromReport = async (reportPath, caseId) => {
  if (!reportPath) return "";
  try {
    const raw = await fs.readFile(reportPath, "utf8");
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed?.results) ? parsed.results : [];
    if (!rows.length) return "";
    if (caseId) {
      const hit = rows.find((item) => String(item?.id || "").trim() === caseId);
      return String(hit?.responseId || "").trim();
    }
    return String(rows[0]?.responseId || "").trim();
  } catch {
    return "";
  }
};

const readPagesFromResult = async (siteKey) => {
  if (!siteKey) return [];
  const filePath = path.join(REPO_ROOT, "asset-factory", "out", "p2w", siteKey, "result.json");
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const pages = Array.isArray(parsed?.pages) ? parsed.pages : [];
    return pages.map((page) => normalizePath(page?.path)).filter(Boolean);
  } catch {
    return [];
  }
};

const formatMarkdown = (report) => {
  const lines = [];
  lines.push("# Sandbox URL & Navigation Consistency Report");
  lines.push("");
  lines.push(`- generatedAt: ${report.generatedAt}`);
  lines.push(`- baseUrl: ${report.baseUrl}`);
  lines.push(`- siteKey: ${report.siteKey}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- allStatus200: ${report.summary.allStatus200}`);
  lines.push(`- allReady: ${report.summary.allReady}`);
  lines.push(`- allFinalUrlMatchExpected: ${report.summary.allFinalUrlMatchExpected}`);
  lines.push(`- navSignatureConsistent: ${report.summary.navSignatureConsistent}`);
  lines.push(`- hasNonSandboxInternalHref: ${report.summary.hasNonSandboxInternalHref}`);
  lines.push("");
  lines.push("## Page Checks");
  lines.push("");
  lines.push("| page | status | ready | navCount | finalUrlMatch | nonSandboxInternalCount |");
  lines.push("|---|---:|---|---:|---|---:|");
  report.results.forEach((row) => {
    lines.push(
      `| ${row.path} | ${row.status ?? "-"} | ${row.ready ? "yes" : "no"} | ${row.navCount} | ${
        row.finalUrlMatchExpected ? "yes" : "no"
      } | ${Array.isArray(row.nonSandboxInternal) ? row.nonSandboxInternal.length : 0} |`
    );
  });
  if (report.summary.distinctNavSignatures > 1) {
    lines.push("");
    lines.push("## Distinct Navigation Signatures");
    lines.push("");
    report.navSignatures.forEach((sig, idx) => {
      lines.push(`### Signature ${idx + 1}`);
      lines.push("");
      lines.push("```text");
      lines.push(sig || "(empty)");
      lines.push("```");
      lines.push("");
    });
  }
  return `${lines.join("\n")}\n`;
};

const main = async () => {
  const options = parseArgs(process.argv);
  await fs.mkdir(options.outDir, { recursive: true });

  let siteKey = String(options.siteKey || "").trim();
  if (!siteKey && options.reuseReportFile) {
    siteKey = await resolveSiteKeyFromReport(options.reuseReportFile, options.caseId);
  }
  if (!siteKey) {
    throw new Error("siteKey is required. Pass --site-key or --reuse-report.");
  }

  const inferredPages = options.pages.length ? [] : await readPagesFromResult(siteKey);
  const pagePaths = Array.from(
    new Set((options.pages.length ? options.pages : inferredPages).map((item) => normalizePath(item)).filter(Boolean))
  );
  const effectivePages = pagePaths.length
    ? pagePaths
    : ["/", "/about", "/products", "/cases", "/solutions", "/contact", "/privacy"];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const results = [];

  try {
    for (const pathValue of effectivePages) {
      const page = await context.newPage();
      const pageParam = toPageParam(pathValue);
      const expectedUrl = `${options.baseUrl}/creation/sandbox?mode=preview&siteKey=${encodeURIComponent(
        siteKey
      )}&page=${pageParam}`;
      const row = {
        path: pathValue,
        pageParam,
        expectedUrl,
        status: null,
        ready: false,
        finalUrl: "",
        finalUrlMatchExpected: false,
        navCount: 0,
        navSignature: "",
        nonSandboxInternal: [],
        error: "",
      };
      try {
        const res = await page.goto(expectedUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
        row.status = res ? res.status() : null;
        await page.waitForSelector('[data-sandbox-ready="1"]', { timeout: 120000 });
        row.ready = true;
        row.finalUrl = page.url();
        row.finalUrlMatchExpected = row.finalUrl === expectedUrl;
        const data = await page.evaluate(() => {
          const navRoot = document.querySelector("nav") || document.querySelector("header") || document.body;
          const nav = Array.from(navRoot.querySelectorAll("a[href]"))
            .slice(0, 24)
            .map((anchor) => ({
              label: String(anchor.textContent || "").replace(/\s+/g, " ").trim(),
              href: String(anchor.getAttribute("href") || "").trim(),
            }))
            .filter((item) => item.label || item.href);
          const hrefs = Array.from(document.querySelectorAll("a[href]"))
            .map((anchor) => String(anchor.getAttribute("href") || "").trim())
            .filter(Boolean);
          const nonSandboxInternal = hrefs.filter(
            (href) => href.startsWith("/") && !href.startsWith("/creation/sandbox")
          );
          return { nav, nonSandboxInternal };
        });
        row.navCount = data.nav.length;
        row.navSignature = data.nav.map((item) => `${item.label}::${item.href}`).join("|");
        row.nonSandboxInternal = Array.from(new Set(data.nonSandboxInternal)).slice(0, 20);
      } catch (error) {
        row.error = error instanceof Error ? error.message : String(error);
        row.finalUrl = page.url();
      }
      results.push(row);
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const navSignatures = Array.from(new Set(results.map((row) => row.navSignature).filter(Boolean)));
  const summary = {
    pageCount: results.length,
    allStatus200: results.every((row) => row.status === 200),
    allReady: results.every((row) => row.ready === true),
    allFinalUrlMatchExpected: results.every((row) => row.finalUrlMatchExpected),
    navSignatureConsistent: navSignatures.length <= 1,
    distinctNavSignatures: navSignatures.length,
    hasNonSandboxInternalHref: results.some((row) => Array.isArray(row.nonSandboxInternal) && row.nonSandboxInternal.length > 0),
    errors: results.filter((row) => row.error).map((row) => `${row.path}:${row.error}`),
  };

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: options.baseUrl,
    siteKey,
    summary,
    navSignatures,
    results,
  };

  const stamp = timestampForFile();
  const jsonPath = path.join(options.outDir, `sandbox-nav-consistency-${stamp}.json`);
  const mdPath = path.join(options.outDir, `sandbox-nav-consistency-${stamp}.md`);
  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await fs.writeFile(mdPath, formatMarkdown(report), "utf8");

  console.log(`[sandbox-nav] json=${jsonPath}`);
  console.log(`[sandbox-nav] md=${mdPath}`);
  console.log(
    `[sandbox-nav] allStatus200=${summary.allStatus200} allReady=${summary.allReady} finalUrlMatch=${summary.allFinalUrlMatchExpected} navConsistent=${summary.navSignatureConsistent} nonSandboxInternal=${summary.hasNonSandboxInternalHref}`
  );

  const pass =
    summary.allStatus200 &&
    summary.allReady &&
    summary.allFinalUrlMatchExpected &&
    summary.navSignatureConsistent &&
    !summary.hasNonSandboxInternalHref &&
    summary.errors.length === 0;
  if (!pass) process.exit(1);
};

main().catch((error) => {
  console.error(`[sandbox-nav] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

