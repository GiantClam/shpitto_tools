import fs from "fs/promises";
import path from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export type DiffResult = {
  width: number;
  height: number;
  diffPixels: number;
  totalPixels: number;
  diffRatio: number;
  similarity: number;
};

export async function diffPair(
  siteKey: string,
  viewport: "desktop" | "mobile"
): Promise<DiffResult> {
  const dir = path.join(
    process.cwd(),
    "..",
    "asset-factory",
    "out",
    siteKey,
    "visual-qa",
    viewport
  );
  const aPath = path.join(dir, "original.png");
  const bPath = path.join(dir, "puck.png");
  const outPath = path.join(dir, "diff.png");
  const reportPath = path.join(dir, "report.json");

  const a = PNG.sync.read(await fs.readFile(aPath));
  const b = PNG.sync.read(await fs.readFile(bPath));

  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);

  const a2 = padTo(a, width, height);
  const b2 = padTo(b, width, height);

  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(a2.data, b2.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false,
    alpha: 0.5,
  });

  await fs.writeFile(outPath, PNG.sync.write(diff));

  const totalPixels = width * height;
  const diffRatio = diffPixels / totalPixels;
  const similarity = 1 - diffRatio;

  const result: DiffResult = {
    width,
    height,
    diffPixels,
    totalPixels,
    diffRatio,
    similarity,
  };

  await fs.writeFile(reportPath, JSON.stringify(result, null, 2), "utf-8");
  return result;
}

function padTo(src: PNG, width: number, height: number): PNG {
  if (src.width === width && src.height === height) return src;

  const out = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      out.data[idx] = 255;
      out.data[idx + 1] = 255;
      out.data[idx + 2] = 255;
      out.data[idx + 3] = 255;
    }
  }

  PNG.bitblt(src, out, 0, 0, src.width, src.height, 0, 0);
  return out;
}
