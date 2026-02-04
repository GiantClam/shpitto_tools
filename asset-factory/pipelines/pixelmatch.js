import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const [basePath, comparePath, diffPath, outputPath] = process.argv.slice(2);

if (!basePath || !comparePath || !diffPath || !outputPath) {
  console.error("Usage: node pixelmatch.js <base> <compare> <diff> <output>");
  process.exit(1);
}

const readPng = (filePath) => {
  const data = fs.readFileSync(filePath);
  return PNG.sync.read(data);
};

const base = readPng(basePath);
const compare = readPng(comparePath);

const width = Math.max(base.width, compare.width);
const height = Math.max(base.height, compare.height);

const padTo = (src, targetWidth, targetHeight) => {
  if (src.width === targetWidth && src.height === targetHeight) return src;
  const out = new PNG({ width: targetWidth, height: targetHeight });
  out.data.fill(255);
  PNG.bitblt(src, out, 0, 0, src.width, src.height, 0, 0);
  return out;
};

const basePadded = padTo(base, width, height);
const comparePadded = padTo(compare, width, height);
const diff = new PNG({ width, height });

const mismatch = pixelmatch(
  basePadded.data,
  comparePadded.data,
  diff.data,
  width,
  height,
  { threshold: 0.1 }
);

fs.mkdirSync(path.dirname(diffPath), { recursive: true });
fs.writeFileSync(diffPath, PNG.sync.write(diff));

const mismatchPercent = width * height > 0 ? mismatch / (width * height) : 0;

const payload = {
  base: basePath,
  compare: comparePath,
  diff: diffPath,
  width,
  height,
  mismatch,
  mismatchPercent,
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload, null, 2));
