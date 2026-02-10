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

const generationRequestTimeoutMs = Number(process.env.CREATION_REQUEST_TIMEOUT_MS || 30000);

const buildTimeoutFallbackResult = (prompt: string) => {
  const title = prompt?.trim() ? prompt.trim().slice(0, 56) : "Generated Landing Page";
  return {
    blueprint: {
      pages: [
        {
          path: "/",
          name: "Home",
          sections: [
            { id: "hero", type: "HeroCentered", intent: "Fallback hero due timeout." },
            { id: "features", type: "FeatureGrid", intent: "Fallback feature cards due timeout." },
            { id: "footer", type: "Footer", intent: "Fallback footer due timeout." },
          ],
        },
      ],
    },
    theme: {
      mode: "light",
      motion: "off",
      radius: "0.5rem",
      fontHeading: "Manrope",
      fontBody: "Manrope",
    },
    components: [],
    pages: [
      {
        path: "/",
        name: "Home",
        data: {
          content: [
            {
              type: "Navbar",
              props: {
                id: "Navbar-1",
                links: [
                  { label: "Home", href: "#top" },
                  { label: "Features", href: "#features" },
                  { label: "Contact", href: "#contact" },
                ],
                ctas: [{ label: "Start", href: "#contact", variant: "primary" }],
                sticky: true,
                paddingY: "sm",
                maxWidth: "xl",
              },
            },
            {
              type: "HeroCentered",
              props: {
                id: "HeroCentered-1",
                title,
                subtitle: "Fast fallback loaded. Retry generation to replace with full AI output.",
                ctas: [{ label: "Retry Generate", href: "#top", variant: "primary" }],
                align: "center",
                paddingY: "lg",
                maxWidth: "xl",
              },
            },
            {
              type: "FeatureGrid",
              props: {
                id: "FeatureGrid-1",
                title: "Highlights",
                items: [
                  { title: "Stable", desc: "Timeout-safe fallback rendering.", icon: "shield" },
                  { title: "Fast", desc: "Page stays usable when AI call is slow.", icon: "rocket" },
                  { title: "Editable", desc: "You can continue editing in sandbox.", icon: "sparkles" },
                ],
                variant: "3col",
                paddingY: "lg",
                maxWidth: "xl",
              },
            },
            {
              type: "Footer",
              props: {
                id: "Footer-1",
                columns: [
                  { title: "Product", links: [{ label: "Overview", href: "#" }, { label: "Roadmap", href: "#" }] },
                  { title: "Company", links: [{ label: "About", href: "#" }, { label: "Contact", href: "#" }] },
                  { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
                ],
                variant: "multiColumn",
                paddingY: "md",
                maxWidth: "xl",
              },
            },
          ],
          root: {
            props: {
              title: "Home",
              theme: {
                mode: "light",
                motion: "off",
                radius: "0.5rem",
                fontHeading: "Manrope",
                fontBody: "Manrope",
              },
            },
          },
        },
      },
    ],
    errors: ["generation_timeout_fallback"],
  };
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
    const generated = await Promise.race([
      generateP2WProject({
        prompt,
        manifest,
        planning: persistEnabled ? { dir: outDir, requestId } : undefined,
      }).then((result) => ({ kind: "ok" as const, result })),
      new Promise<{ kind: "timeout" }>((resolve) =>
        setTimeout(() => resolve({ kind: "timeout" }), generationRequestTimeoutMs)
      ),
    ]);
    const result =
      generated.kind === "ok" ? generated.result : buildTimeoutFallbackResult(prompt);
    if (generated.kind === "timeout") {
      logWarn("[creation] timeout_fallback", { requestId, timeoutMs: generationRequestTimeoutMs });
    }
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
