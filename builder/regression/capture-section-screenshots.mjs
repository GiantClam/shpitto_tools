/**
 * capture-section-screenshots.mjs
 *
 * Captures per-section screenshots from a rendered Puck page.
 * Uses Playwright to detect section boundaries via DOM [data-puck-component] or <section> elements,
 * then crops the full-page screenshot into individual section images.
 *
 * Usage (as module):
 *   import { captureSectionScreenshots } from "./capture-section-screenshots.mjs";
 *   const result = await captureSectionScreenshots({ url, outDir, fullPageScreenshot });
 *
 * Usage (CLI):
 *   node capture-section-screenshots.mjs --url <url> --out-dir <dir> [--full-page <path>] [--timeout 30000]
 */

import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";

const runShell = (cmd, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn("zsh", ["-lc", cmd], {
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...(options.env || {}) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += String(chunk); });
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0 && !options.allowFailure) {
        reject(new Error(`Command failed (${code}): ${cmd}\n${stderr || stdout}`));
        return;
      }
      resolve({ code: code ?? 0, stdout, stderr });
    });
  });

const runNodeEval = (script, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn("node", ["-e", script], {
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...(options.env || {}) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0 && !options.allowFailure) {
        reject(new Error(`Command failed (${code}): node -e <script>\n${stderr || stdout}`));
        return;
      }
      resolve({ code: code ?? 0, stdout, stderr });
    });
  });

/**
 * Use Playwright to visit a URL and extract section bounding boxes.
 * Returns array of { id, type, top, left, width, height } for each section.
 */
const detectSectionBounds = async ({ url, timeout = 30000, waitForTimeout = 2000 }) => {
  // We use a small inline Playwright script to avoid importing playwright directly
  // (which may not be available as ESM). The script outputs JSON to stdout.
  const script = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(${JSON.stringify(url)}, { waitUntil: 'networkidle', timeout: ${timeout} });
  await page.waitForTimeout(${waitForTimeout});

  const sections = await page.evaluate(() => {
    // Strategy 1: Puck component markers
    let elements = Array.from(document.querySelectorAll('[data-puck-component]'));
    if (!elements.length) {
      // Strategy 2: <section> elements with id or data-section
      elements = Array.from(document.querySelectorAll('section[id], section[data-section], [data-section]'));
    }
    if (!elements.length) {
      // Strategy 3: direct children of main or #puck-root
      const root = document.querySelector('main') || document.querySelector('#puck-root') || document.body;
      elements = Array.from(root.children).filter(el => {
        const tag = el.tagName.toLowerCase();
        return tag !== 'script' && tag !== 'style' && tag !== 'link';
      });
    }
    return elements.map((el, index) => {
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      return {
        index,
        id: el.id || el.getAttribute('data-section') || el.getAttribute('data-puck-component') || ('section-' + index),
        type: el.getAttribute('data-puck-component') || el.tagName.toLowerCase(),
        top: Math.round(rect.top + scrollY),
        left: Math.round(rect.left + scrollX),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    }).filter(s => s.height > 20 && s.width > 100);
  });

  console.log(JSON.stringify(sections));
  await browser.close();
})();
`;
  const { stdout } = await runNodeEval(script, { allowFailure: false });
  try {
    return JSON.parse(stdout.trim());
  } catch {
    return [];
  }
};

/**
 * Crop a region from a full-page screenshot using Python PIL.
 */
const cropImage = async ({ sourcePath, targetPath, top, left, width, height }) => {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  const cmd = `python3 - <<'PY'
from PIL import Image
img = Image.open(${JSON.stringify(sourcePath)})
box = (${left}, ${top}, ${left + width}, ${top + height})
# Clamp to image bounds
w, h = img.size
box = (max(0, box[0]), max(0, box[1]), min(w, box[2]), min(h, box[3]))
if box[2] > box[0] and box[3] > box[1]:
    cropped = img.crop(box)
    cropped.save(${JSON.stringify(targetPath)})
    print("ok")
else:
    print("skip")
PY`;
  const { stdout } = await runShell(cmd, { allowFailure: true });
  return stdout.trim() === "ok";
};

/**
 * Capture per-section screenshots from a rendered page.
 *
 * @param {Object} options
 * @param {string} options.url - The URL to capture
 * @param {string} options.outDir - Directory to write section screenshots
 * @param {string} [options.fullPageScreenshot] - Path to existing full-page screenshot (skip re-capture)
 * @param {number} [options.timeout] - Navigation timeout in ms
 * @param {number} [options.waitForTimeout] - Wait after load in ms
 * @returns {Promise<{ sections: Array<{ id, type, index, screenshotPath, bounds }>, fullPagePath }>}
 */
export const captureSectionScreenshots = async ({
  url,
  outDir,
  fullPageScreenshot = "",
  timeout = 30000,
  waitForTimeout = 2000,
}) => {
  await fs.mkdir(outDir, { recursive: true });

  // Step 1: Detect section boundaries
  const bounds = await detectSectionBounds({ url, timeout, waitForTimeout });
  if (!bounds.length) {
    return { sections: [], fullPagePath: fullPageScreenshot || "" };
  }

  // Step 2: Ensure we have a full-page screenshot
  let fullPagePath = fullPageScreenshot;
  if (!fullPagePath) {
    fullPagePath = path.join(outDir, "_full-page.png");
    const captureScript = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(${JSON.stringify(url)}, { waitUntil: 'networkidle', timeout: ${timeout} });
  await page.waitForTimeout(${waitForTimeout});
  await page.screenshot({ path: ${JSON.stringify(fullPagePath)}, fullPage: true });
  await browser.close();
})();
`;
    await runNodeEval(captureScript, { allowFailure: false });
  }

  // Step 3: Crop each section
  const sections = [];
  for (const bound of bounds) {
    const slug = String(bound.id || `section-${bound.index}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const screenshotPath = path.join(outDir, `${slug}.png`);
    const ok = await cropImage({
      sourcePath: fullPagePath,
      targetPath: screenshotPath,
      top: bound.top,
      left: bound.left,
      width: bound.width,
      height: bound.height,
    });
    sections.push({
      id: bound.id,
      type: bound.type,
      index: bound.index,
      screenshotPath: ok ? screenshotPath : "",
      bounds: {
        top: bound.top,
        left: bound.left,
        width: bound.width,
        height: bound.height,
      },
    });
  }

  return { sections, fullPagePath };
};

// CLI mode
if (process.argv[1] && process.argv[1].endsWith("capture-section-screenshots.mjs")) {
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const idx = args.indexOf(name);
    return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : "";
  };
  const url = getArg("--url");
  const outDir = getArg("--out-dir");
  const fullPage = getArg("--full-page");
  const timeout = Number(getArg("--timeout")) || 30000;

  if (!url || !outDir) {
    console.error("Usage: node capture-section-screenshots.mjs --url <url> --out-dir <dir> [--full-page <path>] [--timeout 30000]");
    process.exit(1);
  }

  captureSectionScreenshots({ url, outDir, fullPageScreenshot: fullPage, timeout })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
