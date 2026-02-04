import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import manifest from "@/skills/manifest.json";
import { PlanningFiles } from "@/lib/agent/planning-files";
import { generateP2WProject } from "@/lib/agent/p2w-graph";
import { logError, logInfo, logWarn } from "@/lib/logger";

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

export async function POST(request: NextRequest) {
  const requestId = `creation_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    logInfo("[creation] start", { requestId });
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const resumeId = typeof body.resumeId === "string" ? body.resumeId.trim() : "";
    if (!prompt) {
      logWarn("[creation] empty_prompt", { requestId });
      return NextResponse.json({ error: "prompt_required" }, { status: 400 });
    }
    if (!process.env.OPENROUTER_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      logError("[creation] missing_api_key", { requestId });
      return NextResponse.json({ error: "missing_api_key" }, { status: 500 });
    }

    const id = resumeId || `p2w_${Date.now()}`;
    const persistEnabled = Boolean(body.persist) || Boolean(resumeId);
    const outDir = persistEnabled
      ? path.join(process.cwd(), "..", "asset-factory", "out", "p2w", id)
      : "";
    if (persistEnabled) {
      await ensureDir(outDir);
    }

    logInfo("[creation] generate", { requestId, promptLength: prompt.length });
    const result = await generateP2WProject({
      prompt,
      manifest,
      planning: persistEnabled ? { dir: outDir, requestId } : undefined,
    });
    logInfo("[creation] generated", {
      requestId,
      id,
      pages: Array.isArray(result.pages) ? result.pages.length : 0,
      components: Array.isArray(result.components) ? result.components.length : 0,
      errors: result.errors,
    });
    if (persistEnabled) {
      await fs.writeFile(path.join(outDir, "result.json"), JSON.stringify({ prompt, ...result }, null, 2));
      logInfo("[creation] persisted", { requestId, id, outDir });
      const planner = await PlanningFiles.init({ rootDir: outDir, prompt, requestId });
      await planner.markPersistComplete();
    }

    return NextResponse.json({ id, prompt, ...result });
  } catch (error: any) {
    logError("[creation] error", {
      requestId,
      message: error?.message ?? String(error),
      details: error?.details,
    });
    const detail =
      process.env.NODE_ENV !== "production"
        ? { message: error?.message ?? String(error), details: error?.details }
        : undefined;
    return NextResponse.json({ error: "generation_failed", detail }, { status: 500 });
  }
}
