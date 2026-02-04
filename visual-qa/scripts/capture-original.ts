import { chromium } from "playwright";
import path from "path";
import fs from "fs/promises";
import { stabilizePage } from "./common.ts";

type Viewport = {
  name: "desktop" | "mobile";
  width: number;
  height: number;
  deviceScaleFactor?: number;
};

const VIEWPORTS: Viewport[] = [
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: "mobile", width: 390, height: 844, deviceScaleFactor: 2 },
];

export async function captureOriginal(siteKey: string, url: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const timeoutMs = Number(process.env.VISUAL_QA_TIMEOUT_MS ?? "120000");
  const waitUntil =
    (process.env.VISUAL_QA_WAIT_UNTIL as "load" | "domcontentloaded" | "networkidle") ??
    "load";

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(url, { waitUntil, timeout: timeoutMs });
    await stabilizePage(page);

    const outDir = path.join(
      process.cwd(),
      "..",
      "asset-factory",
      "out",
      siteKey,
      "visual-qa",
      vp.name
    );
    await fs.mkdir(outDir, { recursive: true });

    await page.screenshot({
      path: path.join(outDir, "original.png"),
      fullPage: true,
    });
  }

  await browser.close();
}
