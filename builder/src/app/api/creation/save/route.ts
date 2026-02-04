import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : null;
    if (!id) {
      return NextResponse.json({ error: "missing_id" }, { status: 400 });
    }
    const payload = body.payload ?? body;
    const outDir = path.join(process.cwd(), "..", "asset-factory", "out", "p2w", id);
    await ensureDir(outDir);
    await fs.writeFile(path.join(outDir, "result.json"), JSON.stringify(payload, null, 2));
    return NextResponse.json({ status: "ok", id });
  } catch (error) {
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
