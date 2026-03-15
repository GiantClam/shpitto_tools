import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const defaultOutDir = path.join(repoRoot, "template-factory", "generated", "pen-exact-templates");

const parseArgs = (argv) => {
  const options = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (!next || next.startsWith("--")) {
      options[key] = "true";
      continue;
    }
    options[key] = next;
    index += 1;
  }
  return options;
};

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

const extractPageParam = (url) => {
  const parsed = new URL(String(url));
  return String(parsed.searchParams.get("page") || "").trim();
};

const ensureFrameReady = async (page) => {
  await page.waitForSelector("iframe[title]", { state: "attached", timeout: 120000 });
  const frameHandle = await page.locator("iframe[title]").first().elementHandle();
  const frame = await frameHandle?.contentFrame();
  if (!frame) throw new Error("Sandbox iframe unavailable");
  await frame.waitForSelector("body", { state: "attached", timeout: 120000 });
  await frame.waitForSelector("[data-pen-node]", { state: "attached", timeout: 120000 });
  await frame.waitForTimeout(150);
  return frame;
};

const summarizeFrame = async (frame) =>
  frame.evaluate(() => ({
    nodeCount: document.querySelectorAll("[data-pen-node]").length,
    navSegmentCount: document.querySelectorAll('[data-location="navigation"][data-pen-overlay="segment-link"]').length,
    navMenuCount: document.querySelectorAll('.pen-overlay-menu-item[data-location="navigation"]').length,
    footerSegmentCount: document.querySelectorAll('[data-location="footer"][data-pen-overlay="segment-link"]').length,
    footerMenuCount: document.querySelectorAll('.pen-overlay-menu-item[data-location="footer"]').length,
    bodyTextLength: document.body.innerText.trim().length,
    sectionCount: document.querySelectorAll("[data-pen-section='true']").length,
  }));

const clickLocation = async (page, frame, location) => {
  const menuTrigger = frame.locator(`.pen-overlay-menu-trigger[data-location="${location}"]`).first();
  if ((await menuTrigger.count()) > 0) {
    await menuTrigger.hover();
    const menuItem = frame.locator(`.pen-overlay-menu-item[data-location="${location}"]`).first();
    if ((await menuItem.count()) > 0) {
      const expectedPageParam = await menuItem.getAttribute("data-page-param");
      if (!expectedPageParam) return { attempted: false, reason: "missing-page-param" };
      await Promise.all([
        page.waitForURL((url) => extractPageParam(url.toString()) === expectedPageParam, {
          timeout: 120000,
          waitUntil: "commit",
        }),
        menuItem.click(),
      ]);
      return { attempted: true, expectedPageParam, mode: "menu-item" };
    }
  }

  const segmentLocator = frame.locator(
    `[data-location="${location}"][data-pen-overlay="segment-link"]`
  );
  if ((await segmentLocator.count()) > 0) {
    const link = segmentLocator.first();
    const expectedPageParam = await link.getAttribute("data-page-param");
    if (!expectedPageParam) return { attempted: false, reason: "missing-page-param" };
    await Promise.all([
      page.waitForURL((url) => extractPageParam(url.toString()) === expectedPageParam, {
        timeout: 120000,
        waitUntil: "commit",
      }),
      link.click(),
    ]);
    return { attempted: true, expectedPageParam, mode: "segment-link" };
  }

  return { attempted: false, reason: "no-actionable-control" };
};

const main = async () => {
  const options = parseArgs(process.argv);
  const outDir = path.resolve(options["out-dir"] || defaultOutDir);
  const manifest = await readJson(path.join(outDir, "site-sandbox-payloads.json"));
  const siteFilter = String(options["site-id"] || "").trim();
  const variantFilter = String(options.variant || "").trim();
  const startIndex = Number(options["start-index"] || 0) || 0;
  const maxPages = Number(options["max-pages"] || 0) || 0;
  const homeOnly = String(options["home-only"] || "").trim() === "true";
  const reportDir = path.join(outDir, "runtime-validation");
  await fs.mkdir(reportDir, { recursive: true });

  const filteredVariants = (manifest.variants || [])
    .filter((entry) => !siteFilter || entry.siteId === siteFilter)
    .filter((entry) => !variantFilter || entry.variant === variantFilter)
    .map((entry) => ({
      ...entry,
      pages: (() => {
        const candidatePages = homeOnly
          ? (entry.pages || []).filter((page) => page.pagePath === "/" || extractPageParam(page.previewUrl) === "home")
          : entry.pages || [];
        if (maxPages > 0) return candidatePages.slice(startIndex, startIndex + maxPages);
        if (startIndex > 0) return candidatePages.slice(startIndex);
        return candidatePages;
      })(),
    }));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  const report = {
    schemaVersion: "pen-site-runtime-validation.v1",
    generatedAt: new Date().toISOString(),
    outDir,
    totalPages: 0,
    passedPages: 0,
    failedPages: 0,
    failures: [],
    variants: [],
  };

  try {
    for (const variant of filteredVariants) {
      const variantReport = {
        siteId: variant.siteId,
        variant: variant.variant,
        pageCount: 0,
        passedPages: 0,
        failedPages: 0,
      };

      for (const preview of variant.pages || []) {
        report.totalPages += 1;
        variantReport.pageCount += 1;
        const pageResult = {
          siteId: variant.siteId,
          variant: variant.variant,
          pageId: preview.pageId,
          pagePath: preview.pagePath,
          previewUrl: preview.previewUrl,
        };

        try {
          await page.goto(preview.previewUrl, { waitUntil: "commit", timeout: 120000 });
          const frame = await ensureFrameReady(page);
          const summary = await summarizeFrame(frame);
          if (!summary.nodeCount || !summary.bodyTextLength) {
            throw new Error(`render-empty:${JSON.stringify(summary)}`);
          }

          pageResult.summary = summary;

          if (summary.navSegmentCount + summary.navMenuCount > 0) {
            const navClick = await clickLocation(page, frame, "navigation");
            pageResult.navClick = navClick;
            if (!navClick.attempted) {
              throw new Error(`nav-click:${navClick.reason || "unknown"}`);
            }
          }

          await page.goto(preview.previewUrl, { waitUntil: "commit", timeout: 120000 });
          const footerFrame = await ensureFrameReady(page);
          const footerSummary = await summarizeFrame(footerFrame);
          if (footerSummary.footerSegmentCount + footerSummary.footerMenuCount > 0) {
            const footerClick = await clickLocation(page, footerFrame, "footer");
            pageResult.footerClick = footerClick;
            if (!footerClick.attempted) {
              throw new Error(`footer-click:${footerClick.reason || "unknown"}`);
            }
          }

          report.passedPages += 1;
          variantReport.passedPages += 1;
        } catch (error) {
          report.failedPages += 1;
          variantReport.failedPages += 1;
          report.failures.push({
            ...pageResult,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      report.variants.push(variantReport);
    }
  } finally {
    await page.close();
    await browser.close();
  }

  await fs.writeFile(path.join(reportDir, "site-runtime-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(
    JSON.stringify(
      {
        outDir,
        totalPages: report.totalPages,
        passedPages: report.passedPages,
        failedPages: report.failedPages,
        outputPath: path.join(reportDir, "site-runtime-report.json"),
      },
      null,
      2
    )
  );
  if (report.failedPages > 0) process.exitCode = 1;
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
