import { captureOriginal } from "./capture-original.ts";
import { capturePuck } from "./render-puck.ts";
import { diffPair } from "./diff.ts";

type Job = {
  siteKey: string;
  originalUrl: string;
  renderUrl: string;
};

async function main() {
  const job: Job = {
    siteKey: process.env.SITE_KEY ?? "demo",
    originalUrl: process.env.ORIGINAL_URL ?? "https://example.com",
    renderUrl:
      process.env.RENDER_URL ??
      "http://localhost:3000/render?siteKey=demo&page=home",
  };

  console.log("Capture original...");
  await captureOriginal(job.siteKey, job.originalUrl);

  console.log("Capture puck render...");
  await capturePuck(job.siteKey, job.renderUrl);

  console.log("Diff desktop...");
  const d1 = await diffPair(job.siteKey, "desktop");

  console.log("Diff mobile...");
  const d2 = await diffPair(job.siteKey, "mobile");

  console.log("Done.");
  console.log({ desktop: d1, mobile: d2 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
