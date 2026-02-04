import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const resolveParams = (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const siteKey = searchParams.get("siteKey") ?? searchParams.get("site") ?? "demo";
  const page = searchParams.get("page") ?? "home";
  const iter = searchParams.get("iter");
  return { siteKey, page, iter };
};

const workDirFor = (siteKey: string) =>
  path.join(process.cwd(), "..", "asset-factory", "out", siteKey, "work");

const pagePathFor = (siteKey: string, page: string) =>
  path.join(process.cwd(), "..", "asset-factory", "out", siteKey, "pages", page, "page.json");

const latestIterPath = async (workDir: string) => {
  try {
    const entries = await fs.readdir(workDir);
    const latest = entries
      .filter((name) => name.startsWith("puck.iter.") && name.endsWith(".json"))
      .map((name) => ({
        name,
        idx: parseInt(name.replace("puck.iter.", "").replace(".json", ""), 10),
      }))
      .filter((item) => !Number.isNaN(item.idx))
      .sort((a, b) => b.idx - a.idx)[0];
    return latest ? path.join(workDir, latest.name) : null;
  } catch (error) {
    return null;
  }
};

export async function GET(request: NextRequest) {
  const { siteKey, page, iter } = resolveParams(request);
  const workDir = workDirFor(siteKey);
  let filePath: string | null = null;
  if (iter) {
    filePath = path.join(workDir, `puck.iter.${iter}.json`);
  } else if (process.env.AUTO_USE_LATEST_ITER !== "0") {
    filePath = await latestIterPath(workDir);
  }
  if (!filePath) {
    filePath = pagePathFor(siteKey, page);
  }
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const siteKey = body.siteKey ?? body.site ?? "demo";
  const page = body.page ?? "home";
  const data = body.data;
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  const workDir = workDirFor(siteKey);
  await fs.mkdir(workDir, { recursive: true });
  const iter = String(Date.now());
  const filePath = path.join(workDir, `puck.iter.${iter}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  return NextResponse.json({ status: "ok", siteKey, page, iter, path: filePath });
}
