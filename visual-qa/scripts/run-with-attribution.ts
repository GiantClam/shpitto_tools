import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import { stabilizePage } from "./common.ts";
import { probe } from "./probe.ts";
import { attribute } from "./attribute.ts";
import { diffPair } from "./diff.ts";

async function runViewport(
  siteKey: string,
  viewport: "desktop" | "mobile",
  originalUrl: string,
  renderUrl: string
) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const vp =
    viewport === "desktop"
      ? { width: 1440, height: 900 }
      : { width: 390, height: 844 };

  await page.setViewportSize(vp);

  const timeoutMs = Number(process.env.VISUAL_QA_TIMEOUT_MS ?? "120000");
  const waitUntil =
    (process.env.VISUAL_QA_WAIT_UNTIL as
      | "load"
      | "domcontentloaded"
      | "networkidle") ?? "load";

  await page.goto(originalUrl, { waitUntil, timeout: timeoutMs });
  await stabilizePage(page);
  const originalProbe = await probe(page, viewport);

  await page.goto(renderUrl, { waitUntil, timeout: timeoutMs });
  await stabilizePage(page);
  const puckProbe = await probe(page, viewport);

  await browser.close();

  const diff = await diffPair(siteKey, viewport);
  const att = attribute(originalProbe, puckProbe);

  const outDir = path.join(
    process.cwd(),
    "..",
    "asset-factory",
    "out",
    siteKey,
    "visual-qa",
    viewport
  );
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(
    path.join(outDir, "probe.original.json"),
    JSON.stringify(originalProbe, null, 2)
  );
  await fs.writeFile(
    path.join(outDir, "probe.puck.json"),
    JSON.stringify(puckProbe, null, 2)
  );
  await fs.writeFile(
    path.join(outDir, "attribution.json"),
    JSON.stringify({ diff, ...att }, null, 2)
  );
}

async function main() {
  const siteKey = process.env.SITE_KEY ?? "demo";
  const originalUrl = process.env.ORIGINAL_URL ?? "https://example.com";
  const renderUrl =
    process.env.RENDER_URL ??
    "http://localhost:3000/render?siteKey=demo&page=home";

  await runViewport(siteKey, "desktop", originalUrl, renderUrl);
  await runViewport(siteKey, "mobile", originalUrl, renderUrl);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
