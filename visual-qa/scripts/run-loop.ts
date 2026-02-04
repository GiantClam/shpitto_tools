import fs from "fs/promises";
import path from "path";
import { captureOriginal } from "./capture-original.ts";
import { capturePuck } from "./render-puck.ts";
import { diffPair } from "./diff.ts";
import { chromium } from "playwright";
import { stabilizePage } from "./common.ts";
import { probe } from "./probe.ts";
import { attribute } from "./attribute.ts";
import { applyPatch } from "./apply-patch.ts";
import { proposePatchRules } from "./propose-patch-rules.ts";

const MAX_ROUNDS = parseInt(process.env.MAX_ROUNDS ?? "5", 10);
const TARGET_SIMILARITY = parseFloat(process.env.TARGET_SIMILARITY ?? "0.92");
const MIN_IMPROVEMENT = parseFloat(process.env.MIN_IMPROVEMENT ?? "0.003");

type Viewport = "desktop" | "mobile";

async function runOneViewportProbe(url: string, viewport: Viewport) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const vp = viewport === "desktop" ? { width: 1440, height: 900 } : { width: 390, height: 844 };
  await page.setViewportSize(vp);

  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await stabilizePage(page);
  const p = await probe(page, viewport);

  await browser.close();
  return p;
}

async function writeJson(p: string, obj: any) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(obj, null, 2), "utf-8");
}

async function main() {
  const siteKey = process.env.SITE_KEY ?? "demo";
  const originalUrl = process.env.ORIGINAL_URL;
  const renderBase = process.env.RENDER_URL_BASE ?? "http://localhost:3000/render";
  const puckDataPath = process.env.PUCK_DATA_PATH ?? path.join(process.cwd(), "puck.json");

  if (!originalUrl) throw new Error("ORIGINAL_URL is required");
  console.log("Job:", { siteKey, originalUrl, renderBase, puckDataPath });

  const repoRoot = path.resolve(process.cwd(), "..");
  const workDir = path.join(repoRoot, "asset-factory", "out", siteKey, "work");
  await fs.mkdir(workDir, { recursive: true });

  const baseData = JSON.parse(await fs.readFile(puckDataPath, "utf-8"));
  const iter0 = path.join(workDir, "puck.iter.0.json");
  await writeJson(iter0, baseData);

  console.log("Capture original baseline once...");
  await captureOriginal(siteKey, originalUrl);

  let prevSimilarity = { desktop: 0, mobile: 0 };
  let best = { round: 0, desktop: 0, mobile: 0 };

  for (let round = 0; round < MAX_ROUNDS; round++) {
    console.log(`\n=== Round ${round} ===`);

    const puckFile = path.join(workDir, `puck.iter.${round}.json`);
    const renderUrl = `${renderBase}?siteKey=${encodeURIComponent(siteKey)}&iter=${round}`;
    console.log("Render URL:", renderUrl);

    await capturePuck(siteKey, renderUrl);

    const results: Record<Viewport, any> = { desktop: null, mobile: null };

    for (const vp of ["desktop", "mobile"] as Viewport[]) {
      const diff = await diffPair(siteKey, vp);

      const originalProbe = await runOneViewportProbe(originalUrl, vp);
      const puckProbe = await runOneViewportProbe(renderUrl, vp);

      const att = attribute(originalProbe, puckProbe);

      const outDir = path.join(
        process.cwd(),
        "..",
        "asset-factory",
        "out",
        siteKey,
        "visual-qa",
        vp
      );
      await writeJson(path.join(outDir, `probe.original.round.${round}.json`), originalProbe);
      await writeJson(path.join(outDir, `probe.puck.round.${round}.json`), puckProbe);
      await writeJson(path.join(outDir, `attribution.round.${round}.json`), { diff, ...att });

      results[vp] = { diff, att };
      console.log(vp, "similarity:", diff.similarity.toFixed(4), "primary:", att.summary.primary_cause);
    }

    const desktopSim = results.desktop.diff.similarity;
    const mobileSim = results.mobile.diff.similarity;
    const avg = (desktopSim + mobileSim) / 2;
    if (avg > (best.desktop + best.mobile) / 2) {
      best = { round, desktop: desktopSim, mobile: mobileSim };
    }

    if (desktopSim >= TARGET_SIMILARITY && mobileSim >= TARGET_SIMILARITY) {
      console.log("✅ Reached target similarity. Stop.");
      break;
    }

    const desktopImprove = desktopSim - prevSimilarity.desktop;
    const mobileImprove = mobileSim - prevSimilarity.mobile;

    if (round === 0) {
      prevSimilarity = { desktop: desktopSim, mobile: mobileSim };
    } else {
      if (desktopImprove < MIN_IMPROVEMENT && mobileImprove < MIN_IMPROVEMENT) {
        console.log("🟡 Improvement too small. Stop.");
        break;
      }
      prevSimilarity = { desktop: desktopSim, mobile: mobileSim };
    }

    const needReview = shouldTriggerReview(results.desktop.att, results.mobile.att);
    if (needReview.trigger) {
      console.log("🟥 Trigger manual review:", needReview.reasons);
      break;
    }

    const currentData = JSON.parse(await fs.readFile(puckFile, "utf-8"));
    const allowedEdits = buildAllowedEdits(currentData);

    const patch = proposePatchRules(results.desktop.att, allowedEdits);
    if (!patch) {
      console.log("🟡 No patch proposed. Stop.");
      break;
    }

    const nextData = applyPatch(structuredClone(currentData), patch);
    const nextFile = path.join(workDir, `puck.iter.${round + 1}.json`);
    await writeJson(nextFile, nextData);
    await writeJson(path.join(workDir, `patch.round.${round}.json`), patch);

    console.log("✅ Patch applied, proceed to next round.");
  }

  console.log("\nBest round:", best);
  console.log(
    "Artifacts in:",
    path.join(process.cwd(), "..", "asset-factory", "out", siteKey, "visual-qa")
  );
  console.log("Work files in:", path.join(process.cwd(), "work", siteKey));
}

function shouldTriggerReview(attA: any, attB: any) {
  const reasons: string[] = [];

  const collect = (att: any) => {
    const s = att.structure?.signals ?? [];
    const c = att.content?.signals ?? [];

    const missingBlock = s.find(
      (x: any) => x.kind === "missing_block" && x.severity === "high"
    );
    if (missingBlock) {
      reasons.push(`missing_block: ${missingBlock.blockId} (${missingBlock.blockType})`);
    }

    const manyBroken = c.filter((x: any) => x.kind === "image_broken").length;
    if (manyBroken >= 3) reasons.push(`too_many_broken_images: ${manyBroken}`);
  };

  collect(attA);
  collect(attB);

  return { trigger: reasons.length > 0, reasons };
}

function buildAllowedEdits(pageData: any) {
  const allow: any = {
    theme: [
      "root.props.branding.colors.background",
      "root.props.branding.colors.foreground",
      "root.props.branding.colors.primary",
      "root.props.branding.colors.primary_foreground",
      "root.props.branding.colors.secondary",
      "root.props.branding.colors.secondary_foreground",
      "root.props.branding.colors.muted",
      "root.props.branding.colors.muted_foreground",
      "root.props.branding.colors.border",
      "root.props.branding.typography.body",
      "root.props.branding.typography.heading",
      "root.props.branding.radius",
      "root.props.theme.motion",
    ],
  };

  for (const comp of pageData.content ?? []) {
    const id = comp?.props?.id;
    if (!id) continue;
    allow[id] = [
      "type",
      "props.title",
      "props.subtitle",
      "props.body",
      "props.ctas",
      "props.items",
      "props.logos",
      "props.plans",
      "props.columns",
      "props.links",
      "props.paddingY",
      "props.background",
      "props.align",
      "props.maxWidth",
      "props.emphasis",
      "props.variant",
      "props.mediaPosition",
      "props.media",
      "props.mediaSrc",
      "props.mediaAlt",
      "props.mediaKind",
    ];
  }
  allow.__meta = { order: Object.keys(allow).filter((k) => k !== "theme" && k !== "__meta") };
  return allow;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
