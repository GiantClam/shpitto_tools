import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

type SandboxPayload = {
  components: Array<{ name: string; code: string }>;
  pages: Array<{ path: string; name: string; data: unknown }>;
  theme?: Record<string, unknown>;
};

const toSandboxPayload = (value: unknown): SandboxPayload => {
  const payload = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const components = Array.isArray(payload.components)
    ? payload.components.filter(
        (item): item is { name: string; code: string } =>
          Boolean(
            item &&
              typeof item === "object" &&
              typeof (item as Record<string, unknown>).name === "string" &&
              typeof (item as Record<string, unknown>).code === "string"
          )
      )
    : [];
  const pages = Array.isArray(payload.pages)
    ? payload.pages.filter(
        (item): item is { path: string; name: string; data: unknown } =>
          Boolean(
            item &&
              typeof item === "object" &&
              typeof (item as Record<string, unknown>).path === "string" &&
              typeof (item as Record<string, unknown>).name === "string" &&
              typeof (item as Record<string, unknown>).data === "object"
          )
      )
    : [];
  const theme =
    payload.theme && typeof payload.theme === "object" ? (payload.theme as Record<string, unknown>) : undefined;
  return { components, pages, theme };
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
    const sandboxDir = path.join(outDir, "sandbox");
    await ensureDir(sandboxDir);
    await fs.writeFile(path.join(sandboxDir, "payload.json"), JSON.stringify(toSandboxPayload(payload), null, 2));
    return NextResponse.json({ status: "ok", id });
  } catch (error) {
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
