#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import fetch from "node-fetch";
import { chromium } from "playwright";
import { buildRegressionEnv } from "./regression-env.mjs";

const ROOT = process.cwd();
const REPO_ROOT = path.resolve(ROOT, "..");
const DEFAULT_BASE_URL = "http://127.0.0.1:3110";
const DEFAULT_PROMPTS_FILE = path.join(ROOT, "regression", "prompts.website-refactor.json");
const DEFAULT_OUT_DIR = path.join(ROOT, "regression", "reports");

const parseArgs = (argv) => {
  const options = {
    baseUrl: DEFAULT_BASE_URL,
    promptsFile: DEFAULT_PROMPTS_FILE,
    outDir: DEFAULT_OUT_DIR,
    maxCases: 0,
    persist: true,
    waitMs: 1400,
    pendingWaitMs: 420000,
    requestTimeoutMs: 180000,
    requestRetries: 1,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--base-url" && next) {
      options.baseUrl = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--prompts" && next) {
      options.promptsFile = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--out-dir" && next) {
      options.outDir = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--max-cases" && next) {
      options.maxCases = Number(next) || 0;
      i += 1;
      continue;
    }
    if (arg === "--persist" && next) {
      options.persist = ["1", "true", "yes", "on"].includes(String(next).toLowerCase());
      i += 1;
      continue;
    }
    if (arg === "--wait-ms" && next) {
      options.waitMs = Math.max(0, Number(next) || 0);
      i += 1;
      continue;
    }
    if (arg === "--pending-wait-ms" && next) {
      options.pendingWaitMs = Math.max(0, Number(next) || 0);
      i += 1;
      continue;
    }
    if (arg === "--request-timeout-ms" && next) {
      options.requestTimeoutMs = Math.max(1000, Number(next) || 1000);
      i += 1;
      continue;
    }
    if (arg === "--request-retries" && next) {
      options.requestRetries = Math.max(0, Number(next) || 0);
      i += 1;
      continue;
    }
  }
  return options;
};

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const toList = (value) => (Array.isArray(value) ? value : []);

const slug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";

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

const compareRequiredPagePaths = (pages, requiredPaths) => {
  const required = toList(requiredPaths).map((item) => normalizePath(item)).filter(Boolean);
  if (!required.length) return [];
  const actual = new Set(toList(pages).map((page) => normalizePath(page?.path)));
  return required.filter((pathValue) => !actual.has(pathValue)).map((pathValue) => `requiredPageMissing:${pathValue}`);
};

const compareForbiddenPagePaths = (pages, forbiddenPaths) => {
  const forbidden = toList(forbiddenPaths).map((item) => normalizePath(item)).filter(Boolean);
  if (!forbidden.length) return [];
  const actual = new Set(toList(pages).map((page) => normalizePath(page?.path)));
  return forbidden.filter((pathValue) => actual.has(pathValue)).map((pathValue) => `forbiddenPagePresent:${pathValue}`);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toRecord = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});

const getPageByPath = (pages, pagePath) => {
  const normalized = normalizePath(String(pagePath || "/"));
  return toList(pages).find((page) => normalizePath(page?.path) === normalized) || null;
};

const collectAbsoluteUrls = (value, acc = []) => {
  if (typeof value === "string") {
    const compact = value.trim();
    if (/^https?:\/\//i.test(compact)) acc.push(compact);
    return acc;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectAbsoluteUrls(item, acc));
    return acc;
  }
  if (!value || typeof value !== "object") return acc;
  Object.values(value).forEach((child) => collectAbsoluteUrls(child, acc));
  return acc;
};

const collectTextFragments = (value, acc = []) => {
  if (typeof value === "string") {
    const compact = value.replace(/\s+/g, " ").trim();
    if (compact) acc.push(compact);
    return acc;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectTextFragments(item, acc));
    return acc;
  }
  if (!value || typeof value !== "object") return acc;
  Object.values(value).forEach((child) => collectTextFragments(child, acc));
  return acc;
};

const compareRequiredBlockTypesByPage = (pages, requiredByPage) => {
  const config = toRecord(requiredByPage);
  const failures = [];
  for (const [pathKey, requiredTypesRaw] of Object.entries(config)) {
    const page = getPageByPath(pages, pathKey);
    const normalizedPath = normalizePath(pathKey);
    if (!page) {
      failures.push(`requiredBlocksPageMissing:${normalizedPath}`);
      continue;
    }
    const requiredTypes = toList(requiredTypesRaw).map((item) => String(item || "").trim()).filter(Boolean);
    const actualTypes = new Set(toList(page?.data?.content).map((block) => String(block?.type || "").trim()));
    requiredTypes.forEach((type) => {
      if (!actualTypes.has(type)) failures.push(`requiredBlockMissing:${normalizedPath}:${type}`);
    });
  }
  return failures;
};

const compareMinCardsGridItemsByPage = (pages, minByPage) => {
  const config = toRecord(minByPage);
  const failures = [];
  for (const [pathKey, minRaw] of Object.entries(config)) {
    const minExpected = Number(minRaw);
    if (!Number.isFinite(minExpected) || minExpected <= 0) continue;
    const page = getPageByPath(pages, pathKey);
    const normalizedPath = normalizePath(pathKey);
    if (!page) {
      failures.push(`cardsPageMissing:${normalizedPath}`);
      continue;
    }
    const totalItems = toList(page?.data?.content)
      .filter((block) => String(block?.type || "") === "CardsGrid")
      .reduce((sum, block) => sum + toList(block?.props?.items).length, 0);
    if (totalItems < minExpected) failures.push(`cardsTooFew:${normalizedPath}:${totalItems}<${minExpected}`);
  }
  return failures;
};

const compareMinImageUrlsByPage = (pages, minByPage) => {
  const config = toRecord(minByPage);
  const failures = [];
  for (const [pathKey, minRaw] of Object.entries(config)) {
    const minExpected = Number(minRaw);
    if (!Number.isFinite(minExpected) || minExpected <= 0) continue;
    const page = getPageByPath(pages, pathKey);
    const normalizedPath = normalizePath(pathKey);
    if (!page) {
      failures.push(`imagePageMissing:${normalizedPath}`);
      continue;
    }
    const imageUrls = collectAbsoluteUrls(page?.data?.content || []);
    if (imageUrls.length < minExpected) failures.push(`imageTooFew:${normalizedPath}:${imageUrls.length}<${minExpected}`);
  }
  return failures;
};

const compareExpectedKeywordsByPage = (pages, expectedByPage) => {
  const config = toRecord(expectedByPage);
  const failures = [];
  for (const [pathKey, keywordsRaw] of Object.entries(config)) {
    const keywords = toList(keywordsRaw).map((item) => String(item || "").trim()).filter(Boolean);
    if (!keywords.length) continue;
    const page = getPageByPath(pages, pathKey);
    const normalizedPath = normalizePath(pathKey);
    if (!page) {
      failures.push(`keywordPageMissing:${normalizedPath}`);
      continue;
    }
    const corpus = collectTextFragments(page?.data?.content || []).join(" ").toLowerCase();
    keywords.forEach((keyword) => {
      if (!corpus.includes(keyword.toLowerCase())) failures.push(`keywordMissing:${normalizedPath}:${keyword}`);
    });
  }
  return failures;
};

const roleTokenForBlock = (block) => {
  const type = String(block?.type || "").toLowerCase();
  if (!type) return "other";
  if (/navbar|navigation|header|topnav/.test(type)) return "navigation";
  if (/footer|copyright|legal/.test(type)) return "footer";
  if (/hero|masthead|banner/.test(type)) return "hero";
  if (/approach|feature|capability|process|workflow|metric|stats/.test(type)) return "approach";
  if (/product|catalog|pricing|plan|cardsgrid|showcase|collection/.test(type)) return "products";
  if (/social|proof|testimonial|review|logo|trust|case/.test(type)) return "socialproof";
  if (/contact|leadcapture|form|quote|consult/.test(type)) return "contact";
  if (/cta|calltoaction/.test(type)) return "cta";
  if (/story|content|about|narrative|timeline|team/.test(type)) return "story";
  return "other";
};

const roleSequenceForPage = (page) =>
  toList(page?.data?.content)
    .map((block) => roleTokenForBlock(block))
    .filter((role) => role !== "navigation" && role !== "footer")
    .join(">");

const compareForbiddenIdenticalRolePairs = (pages, forbiddenPairs) => {
  const pairs = toList(forbiddenPairs)
    .map((pair) => (Array.isArray(pair) ? pair : []))
    .filter((pair) => pair.length >= 2);
  if (!pairs.length) return [];
  const failures = [];
  for (const pair of pairs) {
    const leftPath = normalizePath(String(pair[0] || "/"));
    const rightPath = normalizePath(String(pair[1] || "/"));
    const left = getPageByPath(pages, leftPath);
    const right = getPageByPath(pages, rightPath);
    if (!left || !right) continue;
    const leftSeq = roleSequenceForPage(left);
    const rightSeq = roleSequenceForPage(right);
    if (leftSeq && rightSeq && leftSeq === rightSeq) {
      failures.push(`roleSequenceIdentical:${leftPath}<->${rightPath}`);
    }
  }
  return failures;
};

const loadPersistedResultWhenPending = async (repoRoot, payload, waitMs) => {
  const pending = Boolean(payload?.pending);
  const siteKey = String(payload?.id || "").trim();
  if (!pending || !siteKey || waitMs <= 0) return payload;
  const resultPath = path.join(repoRoot, "asset-factory", "out", "p2w", siteKey, "result.json");
  const startedAt = Date.now();
  while (Date.now() - startedAt <= waitMs) {
    try {
      const raw = await fs.readFile(resultPath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.pages) && parsed.pages.length > 0) {
        return {
          ...(payload && typeof payload === "object" ? payload : {}),
          ...parsed,
          id: siteKey,
          pending: false,
        };
      }
    } catch {}
    await sleep(2500);
  }
  return payload;
};

const isRetryableRequestError = (error) => {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    /socket hang up|econnreset|etimedout|timeout|network|fetch failed|aborted|eai_again|enotfound/.test(message)
  );
};

const requestCreation = async ({ baseUrl, prompt, persist, requestTimeoutMs, requestRetries }) => {
  const attempts = Math.max(1, Number(requestRetries || 0) + 1);
  let lastError = null;
  for (let i = 0; i < attempts; i += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.max(1000, Number(requestTimeoutMs || 180000)));
    try {
      const res = await fetch(`${baseUrl}/api/creation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, persist }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const payload = await safeJson(res);
      return { res, payload };
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (i >= attempts - 1 || !isRetryableRequestError(error)) break;
      await sleep(1500 * (i + 1));
    }
  }
  throw lastError || new Error("request_failed");
};

const extractRuntimeMetrics = async (page) =>
  page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("*"));
    const sampled = all.slice(0, 240);
    const gradientCount = sampled.filter((entry) => {
      const bg = window.getComputedStyle(entry).backgroundImage || "";
      return /gradient/i.test(bg);
    }).length;
    const rootStyle = window.getComputedStyle(document.documentElement);
    return {
      title: String(document.title || "").trim(),
      textLength: String(document.body?.innerText || "").trim().length,
      linkCount: document.querySelectorAll("a[href]").length,
      buttonCount: document.querySelectorAll("button").length,
      inputCount: document.querySelectorAll("input,textarea,select").length,
      headingCount: document.querySelectorAll("h1,h2,h3").length,
      sectionCount: document.querySelectorAll("section,article,main").length,
      gradientCount,
      theme: {
        primary: rootStyle.getPropertyValue("--primary").trim(),
        background: rootStyle.getPropertyValue("--background").trim(),
        fontHeading: rootStyle.getPropertyValue("--font-heading").trim(),
        fontBody: rootStyle.getPropertyValue("--font-body").trim(),
      },
    };
  });

const run = async () => {
  const options = parseArgs(process.argv);
  const regressionEnvState = await buildRegressionEnv({ builderRoot: ROOT, repoRoot: REPO_ROOT });
  const effectiveEnv = regressionEnvState.env || process.env;
  const hasLlmProvider =
    Boolean(effectiveEnv.AIBERM_API_KEY) ||
    Boolean(effectiveEnv.OPENROUTER_API_KEY) ||
    Boolean(effectiveEnv.ANTHROPIC_API_KEY);
  const promptsRaw = await fs.readFile(options.promptsFile, "utf8");
  const promptsConfig = JSON.parse(promptsRaw);
  const allCases = Array.isArray(promptsConfig?.cases) ? promptsConfig.cases : [];
  const cases = options.maxCases > 0 ? allCases.slice(0, options.maxCases) : allCases;
  if (!cases.length) throw new Error(`No cases found in ${options.promptsFile}`);

  await fs.mkdir(options.outDir, { recursive: true });
  const runStamp = timestampForFile();
  const screenshotDir = path.join(options.outDir, `browser-refactor-${runStamp}-screenshots`);
  await fs.mkdir(screenshotDir, { recursive: true });
  if (regressionEnvState.loadedFiles.length > 0) {
    for (const item of regressionEnvState.loadedFiles) {
      console.log(`[env] loaded ${item.filePath} keys=${item.applied}`);
    }
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  const results = [];
  try {
    for (const [index, c] of cases.entries()) {
      const startedAt = Date.now();
      const row = {
        id: String(c?.id || `case-${index + 1}`),
        statusCode: null,
        passed: false,
        skipped: false,
        durationMs: 0,
        requestError: null,
        assertionFailures: [],
        pageMetrics: [],
        screenshots: [],
      };
      if (Boolean(c.requiresLlm) && !hasLlmProvider) {
        row.passed = true;
        row.skipped = true;
        results.push(row);
        console.log(`[browser-refactor] ${index + 1}/${cases.length} ${row.id} SKIP requiresLlm=true but no LLM key`);
        continue;
      }

      let payload = null;
      let requestError = null;
      try {
        const { res, payload: rawPayload } = await requestCreation({
          baseUrl: options.baseUrl,
          prompt: c.prompt,
          persist: options.persist,
          requestTimeoutMs: options.requestTimeoutMs,
          requestRetries: options.requestRetries,
        });
        row.statusCode = res.status;
        payload = rawPayload;
        payload = await loadPersistedResultWhenPending(REPO_ROOT, payload, options.pendingWaitMs);
      } catch (error) {
        requestError = error instanceof Error ? error.message : String(error);
      }
      row.requestError = requestError;
      if (requestError) {
        row.assertionFailures.push(`requestError:${requestError}`);
        row.durationMs = Date.now() - startedAt;
        results.push(row);
        continue;
      }

      const pages = toList(payload?.pages);
      row.assertionFailures.push(...compareRequiredPagePaths(pages, c.requiredPagePaths));
      row.assertionFailures.push(...compareForbiddenPagePaths(pages, c.forbiddenPagePaths));
      row.assertionFailures.push(...compareRequiredBlockTypesByPage(pages, c.requiredBlockTypesByPage));
      row.assertionFailures.push(...compareMinCardsGridItemsByPage(pages, c.minCardsGridItemsByPage));
      row.assertionFailures.push(...compareMinImageUrlsByPage(pages, c.minImageUrlsByPage));
      row.assertionFailures.push(...compareExpectedKeywordsByPage(pages, c.expectedKeywordsByPage));
      row.assertionFailures.push(...compareForbiddenIdenticalRolePairs(pages, c.forbiddenIdenticalRolePairs));
      if (typeof c.minPages === "number" && pages.length < Number(c.minPages)) {
        row.assertionFailures.push(`minPages:${pages.length}<${Number(c.minPages)}`);
      }
      if (typeof c.maxPages === "number" && pages.length > Number(c.maxPages)) {
        row.assertionFailures.push(`maxPages:${pages.length}>${Number(c.maxPages)}`);
      }

      const siteKey = String(payload?.id || "").trim();
      if (!siteKey) {
        row.assertionFailures.push("missingSiteKey");
      }

      const requestedBrowserPages = toList(c.browserPages).map((entry) => normalizePath(entry));
      const fallbackPages = ["/"];
      const pagesToVisit = (requestedBrowserPages.length ? requestedBrowserPages : fallbackPages).filter((pagePath) =>
        pages.some((page) => normalizePath(page?.path) === pagePath)
      );
      if (!pagesToVisit.length && pages.length) {
        pagesToVisit.push(normalizePath(pages[0]?.path));
      }

      const themeTokens = [];
      const skipBrowser = Boolean(c.skipBrowser);
      if (!skipBrowser) {
        for (const pagePath of pagesToVisit) {
          const tab = await context.newPage();
          const consoleErrors = [];
          const pageErrors = [];
          tab.on("console", (msg) => {
            if (msg.type() === "error") consoleErrors.push(msg.text());
          });
          tab.on("pageerror", (err) => {
            pageErrors.push(err?.message || String(err));
          });

          try {
            const url = `${options.baseUrl}/creation/sandbox?siteKey=${encodeURIComponent(siteKey)}&page=${encodeURIComponent(pagePath)}`;
            await tab.goto(url, { waitUntil: "domcontentloaded", timeout: 180000 });
            if (options.waitMs > 0) await tab.waitForTimeout(options.waitMs);
            await tab.waitForSelector("body", { state: "attached", timeout: 60000 });
            await tab.waitForSelector('[data-sandbox-ready="1"]', { timeout: 120000 });

            const metrics = await extractRuntimeMetrics(tab);
            const sandboxNavMetrics = await tab.evaluate(() => {
              const hrefs = Array.from(document.querySelectorAll("a[href]"))
                .map((anchor) => String(anchor.getAttribute("href") || "").trim())
                .filter(Boolean);
              const navRoot =
                document.querySelector("nav") ||
                document.querySelector("header") ||
                document.body;
              const navSignature = Array.from(navRoot.querySelectorAll("a[href]"))
                .slice(0, 16)
                .map((anchor) => {
                  const href = String(anchor.getAttribute("href") || "").trim();
                  const label = String(anchor.textContent || "").replace(/\s+/g, " ").trim();
                  return `${label}::${href}`;
                })
                .filter(Boolean)
                .join("|");
              const nonSandboxInternal = hrefs.filter(
                (href) => href.startsWith("/") && !href.startsWith("/creation/sandbox")
              );
              return {
                hrefCount: hrefs.length,
                navSignature,
                nonSandboxInternalCount: nonSandboxInternal.length,
                nonSandboxInternalSample: nonSandboxInternal.slice(0, 8),
              };
            });
            const screenshotName = `${slug(row.id)}-${slug(pagePath.replaceAll("/", "-") || "home")}.png`;
            const screenshotPath = path.join(screenshotDir, screenshotName);
            await tab.screenshot({ path: screenshotPath, fullPage: true });
            row.screenshots.push(screenshotPath);
            row.pageMetrics.push({
              pagePath,
              ...metrics,
              sandboxNavMetrics,
              consoleErrors,
              pageErrors,
            });

            const minTextLength = Math.max(60, Number(c.minTextLengthPerPage || 120));
            const minLinks = Math.max(1, Number(c.minLinksPerPage || 2));
            if (metrics.textLength < minTextLength) row.assertionFailures.push(`textTooShort:${pagePath}:${metrics.textLength}`);
            if (metrics.linkCount < minLinks) row.assertionFailures.push(`linksTooFew:${pagePath}:${metrics.linkCount}`);
            if (pagePath === "/" && metrics.headingCount < 1) row.assertionFailures.push(`missingHeading:${pagePath}`);
            if (pagePath === "/contact" && metrics.inputCount < 1) row.assertionFailures.push(`missingFormField:${pagePath}`);
            if (metrics.sectionCount < 1) row.assertionFailures.push(`missingSections:${pagePath}`);
            if (metrics.gradientCount < 1 && pagePath === "/") row.assertionFailures.push(`missingVisualLayer:${pagePath}`);
            if (sandboxNavMetrics.nonSandboxInternalCount > 0) {
              row.assertionFailures.push(
                `nonSandboxHref:${pagePath}:${sandboxNavMetrics.nonSandboxInternalSample.join("|")}`
              );
            }
            if (consoleErrors.length > 0) row.assertionFailures.push(`consoleError:${pagePath}:${consoleErrors[0]}`);
            if (pageErrors.length > 0) row.assertionFailures.push(`pageError:${pagePath}:${pageErrors[0]}`);

            themeTokens.push({
              pagePath,
              primary: metrics.theme.primary,
              background: metrics.theme.background,
              fontHeading: metrics.theme.fontHeading,
              fontBody: metrics.theme.fontBody,
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            row.assertionFailures.push(`sandboxRenderFailed:${pagePath}:${message}`);
          } finally {
            await tab.close();
          }
        }
      }

      const primarySet = new Set(themeTokens.map((token) => token.primary).filter(Boolean));
      const backgroundSet = new Set(themeTokens.map((token) => token.background).filter(Boolean));
      const fontHeadingSet = new Set(themeTokens.map((token) => token.fontHeading).filter(Boolean));
      const fontBodySet = new Set(themeTokens.map((token) => token.fontBody).filter(Boolean));
      const navSignatureSet = new Set(
        row.pageMetrics
          .map((item) => String(item?.sandboxNavMetrics?.navSignature || "").trim())
          .filter(Boolean)
      );
      if (primarySet.size > 1) row.assertionFailures.push(`themePrimaryInconsistent:${Array.from(primarySet).join("|")}`);
      if (backgroundSet.size > 1) row.assertionFailures.push(`themeBackgroundInconsistent:${Array.from(backgroundSet).join("|")}`);
      if (fontHeadingSet.size > 1) row.assertionFailures.push(`themeFontHeadingInconsistent:${Array.from(fontHeadingSet).join("|")}`);
      if (fontBodySet.size > 1) row.assertionFailures.push(`themeFontBodyInconsistent:${Array.from(fontBodySet).join("|")}`);
      if (pagesToVisit.length > 1 && navSignatureSet.size > 1) {
        row.assertionFailures.push(`navSignatureInconsistent:${Array.from(navSignatureSet).slice(0, 3).join("||")}`);
      }

      row.passed = row.assertionFailures.length === 0 && row.statusCode === 200;
      row.durationMs = Date.now() - startedAt;
      results.push(row);
      console.log(`[browser-refactor] ${index + 1}/${cases.length} ${row.id} ${row.passed ? "PASS" : "FAIL"} duration=${row.durationMs}ms failures=${row.assertionFailures.length}`);
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const total = results.length;
  const skipped = results.filter((item) => item.skipped).length;
  const executedRows = results.filter((item) => !item.skipped);
  const executed = executedRows.length;
  const passed = executedRows.filter((item) => item.passed).length;
  const failed = executed - passed;
  const summary = {
    total,
    executed,
    skipped,
    passed,
    failed,
    successRate: executed ? Number((passed / executed).toFixed(4)) : 1,
    avgDurationMs: executed ? Math.round(executedRows.reduce((sum, item) => sum + item.durationMs, 0) / executed) : 0,
  };
  const report = {
    generatedAt: new Date().toISOString(),
    options,
    summary,
    results,
    screenshotDir,
  };

  const reportJsonPath = path.join(options.outDir, `browser-refactor-${runStamp}.json`);
  const reportMdPath = path.join(options.outDir, `browser-refactor-${runStamp}.md`);
  await fs.writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const md = [
    "# Browser Refactor Validation Report",
    "",
    `- generatedAt: ${report.generatedAt}`,
    `- baseUrl: ${options.baseUrl}`,
    `- prompts: ${options.promptsFile}`,
    `- screenshots: ${screenshotDir}`,
    "",
    "## Summary",
    "",
    `- total: ${summary.total}`,
    `- executed: ${summary.executed}`,
    `- skipped: ${summary.skipped}`,
    `- passed: ${summary.passed}`,
    `- failed: ${summary.failed}`,
    `- successRate: ${(summary.successRate * 100).toFixed(1)}%`,
    "",
    "## Cases",
    "",
    "| case | status | durationMs | failures |",
    "|---|---|---:|---|",
    ...results.map((item) => {
      const status = item.skipped ? "SKIP" : item.passed ? "PASS" : "FAIL";
      const failures = item.assertionFailures.length ? item.assertionFailures.join(", ") : "-";
      return `| ${item.id} | ${status} | ${item.durationMs} | ${failures} |`;
    }),
    "",
  ].join("\n");
  await fs.writeFile(reportMdPath, `${md}\n`, "utf8");

  console.log(`[browser-refactor] json=${reportJsonPath}`);
  console.log(`[browser-refactor] md=${reportMdPath}`);
  console.log(
    `[browser-refactor] successRate=${(summary.successRate * 100).toFixed(1)}% passed=${summary.passed}/${summary.total}`
  );

  if (failed > 0) process.exitCode = 1;
};

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[browser-refactor] failed: ${message}`);
  process.exit(1);
});
