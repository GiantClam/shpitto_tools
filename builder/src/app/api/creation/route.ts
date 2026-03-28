import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import manifest from "@/skills/manifest.json";
import { PlanningFiles } from "@/lib/agent/planning-files";
import { canGenerateTemplateOnly, generateP2WProject } from "@/lib/agent/p2w-graph";
import { ensureEnvFallbackLoaded } from "@/lib/env/load-env-fallback";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { auditSitePayload } from "@/lib/site-payload-audit";
import {
  buildStructuredInputPromptPatch,
  parseStructuredSiteInput,
} from "@/lib/agent/structured-input";

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const parseTimeoutMs = (value: number, fallbackMs: number) => {
  if (!Number.isFinite(value)) return fallbackMs;
  if (value <= 0) return 0;
  return Math.floor(value);
};

const generationRequestTimeoutMs = parseTimeoutMs(
  Number(process.env.CREATION_REQUEST_TIMEOUT_MS || 120000),
  120000
);
const persistRequestTimeoutMs = parseTimeoutMs(
  Number(process.env.CREATION_PERSIST_REQUEST_TIMEOUT_MS || 90000),
  90000
);
const enterpriseRequestTimeoutMs = parseTimeoutMs(
  Number(process.env.CREATION_ENTERPRISE_REQUEST_TIMEOUT_MS || 300000),
  300000
);
const deferredPersistMaxMs = parseTimeoutMs(
  Number(process.env.CREATION_DEFERRED_PERSIST_MAX_MS || 240000),
  240000
);

type GenerationResult = Awaited<ReturnType<typeof generateP2WProject>>;

type SandboxPayload = {
  components: Array<{ name: string; code: string }>;
  pages: Array<{ path: string; name: string; data: unknown }>;
  theme?: Record<string, unknown>;
};

type SandboxPersistStatus = {
  audit: ReturnType<typeof auditSitePayload>;
  previewStatus: "ready";
  publishStatus: "ready" | "blocked";
};

const hasStrictPromptContract = (prompt: string) => {
  const raw = String(prompt || "");
  if (!raw.trim()) return false;
  const hasEnterpriseIntent =
    /(企业官网|官网|公司网站|enterprise website|corporate website|factory website)/i.test(raw);
  const hasStructuredSections = /(header|hero|footer|导航|页眉|页脚|产品中心|解决方案|应用案例|关于我们|联系我们)\s*[:：]/i.test(raw);
  const requiredPageHits = [
    /core[-\s]?product|核心产品/i,
    /products?|产品中心/i,
    /solutions?|解决方案/i,
    /cases?|应用案例/i,
    /about|关于我们/i,
    /contact|联系我们/i,
  ].filter((pattern) => pattern.test(raw)).length;
  return hasEnterpriseIntent || hasStructuredSections || requiredPageHits >= 4;
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

const persistSandboxPayload = async (outDir: string, value: unknown): Promise<SandboxPersistStatus> => {
  const sandboxDir = path.join(outDir, "sandbox");
  await ensureDir(sandboxDir);
  const sandboxPayload = toSandboxPayload(value);
  const payloadRecord = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const resolvedByLayer =
    payloadRecord.resolvedByLayer && typeof payloadRecord.resolvedByLayer === "object"
      ? (payloadRecord.resolvedByLayer as Record<string, unknown>)
      : null;
  const audit = auditSitePayload(sandboxPayload, {
    prompt: typeof payloadRecord.prompt === "string" ? payloadRecord.prompt : undefined,
    resolvedByLayer,
  });
  await fs.writeFile(path.join(outDir, "audit.json"), JSON.stringify(audit, null, 2));
  await fs.writeFile(path.join(sandboxDir, "payload.json"), JSON.stringify(sandboxPayload, null, 2));
  return {
    audit,
    previewStatus: "ready",
    publishStatus: audit.ok ? "ready" : "blocked",
  };
};

const persistGeneratedResult = async (options: {
  outDir: string;
  prompt: string;
  requestId: string;
  id: string;
  result: GenerationResult;
  logLabel?: "persisted" | "persisted_after_timeout";
}): Promise<SandboxPersistStatus> => {
  const { outDir, prompt, requestId, id, result, logLabel = "persisted" } = options;
  await fs.writeFile(path.join(outDir, "result.json"), JSON.stringify({ prompt, ...result }, null, 2));
  const persistStatus = await persistSandboxPayload(outDir, { prompt, ...result });
  logInfo("[creation] " + logLabel, { requestId, id, outDir });
  const planner = await PlanningFiles.init({ rootDir: outDir, prompt, requestId });
  await planner.markPersistComplete();
  return persistStatus;
};

const persistTimeoutFallbackResult = async (options: {
  outDir: string;
  prompt: string;
  requestId: string;
  id: string;
  reason: string;
  upstreamMessage?: string;
}) => {
  const { outDir, prompt, requestId, id, reason, upstreamMessage } = options;
  const timeoutResult = buildTimeoutFallbackResult(prompt);
  const fallbackErrors = dedupe([
    ...(Array.isArray(timeoutResult.errors) ? timeoutResult.errors : []),
    `deferred_fallback:${reason}`,
    ...(upstreamMessage ? [`upstream:${upstreamMessage}`] : []),
  ]);
  const payload = {
    prompt,
    ...timeoutResult,
    errors: fallbackErrors,
  };
  await fs.writeFile(path.join(outDir, "result.json"), JSON.stringify(payload, null, 2));
  const persistStatus = await persistSandboxPayload(outDir, payload);
  logWarn("[creation] deferred_fallback_persisted", {
    requestId,
    id,
    reason,
    outDir,
    upstreamMessage,
  });
  const planner = await PlanningFiles.init({ rootDir: outDir, prompt, requestId });
  await planner.markPersistComplete();
  return persistStatus;
};

type TimeoutLocale = "zh-CN" | "en-US";

const dedupe = <T,>(items: T[]) => Array.from(new Set(items));

const resolveTimeoutLocale = (prompt: string): TimeoutLocale => {
  const raw = String(prompt || "");
  const explicitChinese = /(中文|简体|繁體|繁体|简中|中文网站|中文官网|chinese|mandarin|zh-cn|zh-hans|zh-hant)/i.test(raw);
  const explicitEnglish = /(英文|英语|english|en-us|en-gb|\benglish\b)/i.test(raw);
  if (explicitChinese && !explicitEnglish) return "zh-CN";
  if (explicitEnglish && !explicitChinese) return "en-US";
  const cjkCount = (raw.match(/[\u3400-\u9fff]/g) || []).length;
  const latinCount = (raw.match(/[A-Za-z]/g) || []).length;
  if (cjkCount >= 20 || (cjkCount >= 10 && cjkCount >= latinCount * 0.6)) return "zh-CN";
  return "en-US";
};

const extractTimeoutBrand = (prompt: string, locale: TimeoutLocale) => {
  const raw = String(prompt || "");
  const quoted = raw.match(/[“"「]([^"”」]{2,40})["”」]/);
  if (quoted?.[1]) return quoted[1].trim();
  const chinese = raw.match(/为\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s-]{1,30})\s*(?:生成|制作|创建|构建|设计)/i);
  if (chinese?.[1]) return chinese[1].trim();
  const english = raw.match(/for\s+([A-Za-z][A-Za-z0-9\s-]{1,40})\s+(?:generate|build|create|design)/i);
  if (english?.[1]) return english[1].trim();
  return locale === "zh-CN" ? "本公司" : "Company";
};

const parseFirst = (prompt: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return "";
};

const parseTimeoutNavLabels = (prompt: string, locale: TimeoutLocale) => {
  const line = parseFirst(prompt, [
    /(?:^|\n)\s*Nav\s*[:：]\s*([^\n\r]{1,260})/i,
    /(?:^|\n)\s*Navigation\s*[:：]\s*([^\n\r]{1,260})/i,
    /(?:^|\n)\s*导航\s*[:：]\s*([^\n\r]{1,260})/i,
  ]);
  if (!line) {
    return locale === "zh-CN"
      ? ["首页", "产品中心", "解决方案", "应用案例", "关于我们", "联系我们"]
      : ["Home", "Products", "Solutions", "Cases", "About", "Contact"];
  }
  return line
    .split(/[|｜•·,，、/]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
};

const mapLabelToTimeoutPath = (label: string) => {
  const token = String(label || "").toLowerCase().replace(/\s+/g, "");
  if (!token) return "/";
  if (/^(home|homepage|首页|主页|首屏)$/.test(token)) return "/";
  if (/(coreproduct|核心产品)/.test(token)) return "/core-product";
  if (/(products?|3cmachines?|machine|产品中心)/.test(token)) return "/products";
  if (/(customsolutions?|solutions?|解决方案|定制方案)/.test(token)) return "/solutions";
  if (/(cases?|casestudy|应用案例|案例)/.test(token)) return "/cases";
  if (/(about|aboutus|关于我们|公司简介)/.test(token)) return "/about";
  if (/(pricing|price|定价|价格)/.test(token)) return "/pricing";
  if (/(support|help|faq|服务支持|支持中心)/.test(token)) return "/support";
  if (/(blog|news|insight|资讯|博客)/.test(token)) return "/blog";
  if (/(contact|联系|联系我们|quote|询价)/.test(token)) return "/contact";
  if (/(privacy|隐私)/.test(token)) return "/privacy";
  if (/(terms|条款|服务条款)/.test(token)) return "/terms";
  return "";
};

const inferTimeoutSitePaths = (prompt: string, navLabels: string[]) => {
  const raw = String(prompt || "");
  const explicitPaths = Array.from(raw.matchAll(/\/[a-z0-9-]{2,}/gi)).map((m) => m[0].toLowerCase());
  const fromNav = navLabels.map(mapLabelToTimeoutPath).filter(Boolean);
  const fromPrompt = [
    /核心产品|core product/i.test(raw) ? "/core-product" : "",
    /产品中心|products?/i.test(raw) ? "/products" : "",
    /解决方案|solutions?/i.test(raw) ? "/solutions" : "",
    /应用案例|cases?/i.test(raw) ? "/cases" : "",
    /关于我们|about/i.test(raw) ? "/about" : "",
    /联系我们|contact/i.test(raw) ? "/contact" : "",
    /定价|pricing/i.test(raw) ? "/pricing" : "",
    /支持中心|support|faq/i.test(raw) ? "/support" : "",
    /博客|blog|news/i.test(raw) ? "/blog" : "",
    /隐私|privacy/i.test(raw) ? "/privacy" : "",
    /条款|terms?/i.test(raw) ? "/terms" : "",
  ].filter(Boolean);
  const enterpriseLike = /(企业官网|官网|公司网站|corporate website|enterprise website|factory website)/i.test(raw);
  const defaultEnterprise = ["/", "/products", "/solutions", "/cases", "/about", "/contact"];
  const paths = dedupe([
    "/",
    ...(enterpriseLike ? defaultEnterprise : []),
    ...fromNav,
    ...fromPrompt,
    ...explicitPaths,
  ]);
  return paths
    .filter((path) => /^\/[a-z0-9-]*$/i.test(path))
    .map((path) => (path === "/" ? "/" : path.replace(/\/+$/g, "")));
};

const timeoutPageName = (pathValue: string, locale: TimeoutLocale) => {
  const path = String(pathValue || "/").toLowerCase();
  const zh: Record<string, string> = {
    "/": "首页",
    "/core-product": "核心产品",
    "/products": "产品中心",
    "/solutions": "解决方案",
    "/cases": "应用案例",
    "/about": "关于我们",
    "/pricing": "定价",
    "/support": "支持中心",
    "/blog": "博客",
    "/contact": "联系我们",
    "/privacy": "隐私政策",
    "/terms": "服务条款",
  };
  const en: Record<string, string> = {
    "/": "Home",
    "/core-product": "Core Product",
    "/products": "Products",
    "/solutions": "Solutions",
    "/cases": "Cases",
    "/about": "About",
    "/pricing": "Pricing",
    "/support": "Support",
    "/blog": "Blog",
    "/contact": "Contact",
    "/privacy": "Privacy",
    "/terms": "Terms",
  };
  return locale === "zh-CN" ? zh[path] || "页面" : en[path] || "Page";
};

const buildTimeoutFallbackResult = (prompt: string) => {
  const locale = resolveTimeoutLocale(prompt);
  const brand = extractTimeoutBrand(prompt, locale);
  const navLabels = parseTimeoutNavLabels(prompt, locale);
  const paths = inferTimeoutSitePaths(prompt, navLabels);
  const navLinks = paths.map((pathValue) => ({
    label: timeoutPageName(pathValue, locale),
    href: pathValue,
    variant: "link" as const,
  }));
  const primaryCta = locale === "zh-CN" ? "立即咨询" : "Contact Sales";
  const secondaryCta = locale === "zh-CN" ? "获取资料" : "Request Catalog";
  const heroTitle =
    parseFirst(prompt, [/(?:^|\n)\s*(?:Title|标题)\s*[:：]\s*([^\n\r]{4,160})/i]) ||
    (locale === "zh-CN" ? `${brand} 企业官网` : `${brand} Corporate Website`);
  const heroSubtitle =
    parseFirst(prompt, [/(?:^|\n)\s*(?:Sub|Subtitle|副标题)\s*[:：]\s*([^\n\r]{4,220})/i]) ||
    (locale === "zh-CN"
      ? "当前为超时保护页面，已按输入契约生成可编辑多页结构。"
      : "Timeout-safe fallback generated from your prompt contract with editable multi-page structure.");

  const theme = {
    mode: "light",
    motion: "off",
    radius: "0.5rem",
    fontHeading: "Manrope",
    fontBody: "Manrope",
  };

  const buildPage = (pathValue: string) => {
    const pageName = timeoutPageName(pathValue, locale);
    const isHome = pathValue === "/";
    const isContact = pathValue === "/contact";
    const legalPage = pathValue === "/privacy" || pathValue === "/terms";
    const heroBlock = {
      type: "HeroCentered",
      props: {
        id: `hero-${pageName}`,
        title: isHome ? heroTitle : `${pageName}`,
        subtitle: isHome
          ? heroSubtitle
          : locale === "zh-CN"
            ? `${pageName} 页面为超时保护生成，内容可继续编辑完善。`
            : `${pageName} fallback page generated after timeout. Content remains fully editable.`,
        ctas: [{ label: primaryCta, href: "/contact", variant: "primary" as const }],
        align: "center" as const,
        paddingY: "lg" as const,
        maxWidth: "xl" as const,
      },
    };
    const middleBlock = legalPage
      ? {
          type: "ContentStory",
          props: {
            id: `content-${pageName}`,
            title: pageName,
            body:
              locale === "zh-CN"
                ? "该页面内容将在生成完成后自动替换，当前可在编辑器中先行维护。"
                : "This page content will be replaced once generation completes. You can edit it now in the sandbox.",
            maxWidth: "xl" as const,
            paddingY: "lg" as const,
          },
        }
      : {
          type: "FeatureGrid",
          props: {
            id: `features-${pageName}`,
            title: locale === "zh-CN" ? `${pageName} 重点信息` : `${pageName} Highlights`,
            items: [
              {
                title: locale === "zh-CN" ? "结构已就绪" : "Structure Ready",
                desc:
                  locale === "zh-CN"
                    ? "页面结构与站点导航已按输入契约落地。"
                    : "Page structure and site navigation follow your prompt contract.",
              },
              {
                title: locale === "zh-CN" ? "主题可编辑" : "Theme Editable",
                desc:
                  locale === "zh-CN"
                    ? "可继续在编辑器中统一视觉与品牌内容。"
                    : "Continue editing visual style and branded copy in the editor.",
              },
              {
                title: locale === "zh-CN" ? "可继续发布" : "Publish Ready",
                desc:
                  locale === "zh-CN"
                    ? "该降级站点保持可预览、可编辑、可发布。"
                    : "This fallback site remains previewable, editable, and publishable.",
              },
            ],
            variant: "3col" as const,
            paddingY: "lg" as const,
            maxWidth: "xl" as const,
          },
        };
    const ctaBlock =
      isContact || legalPage
        ? null
        : {
            type: "LeadCaptureCTA",
            props: {
              id: `cta-${pageName}`,
              title: locale === "zh-CN" ? "获取专属方案" : "Get a tailored proposal",
              subtitle: locale === "zh-CN" ? "留下需求，我们会尽快联系你。" : "Share your requirements and we'll follow up soon.",
              cta: { label: secondaryCta, href: "/contact", variant: "secondary" as const },
              maxWidth: "xl" as const,
              paddingY: "md" as const,
            },
          };
    const footerColumns = [
      {
        title: locale === "zh-CN" ? "产品" : "Product",
        links: navLinks.filter((item) => ["/core-product", "/products", "/solutions", "/cases"].includes(item.href)),
      },
      {
        title: locale === "zh-CN" ? "公司" : "Company",
        links: navLinks.filter((item) => ["/about", "/contact", "/support", "/blog"].includes(item.href)),
      },
      {
        title: locale === "zh-CN" ? "法务" : "Legal",
        links: navLinks.filter((item) => ["/privacy", "/terms"].includes(item.href)),
      },
    ].filter((column) => column.links.length > 0);

    const blocks = [
      {
        type: "Navbar",
        props: {
          id: `navbar-${pageName}`,
          links: navLinks,
          ctas: [{ label: primaryCta, href: "/contact", variant: "primary" as const }],
          sticky: true,
          paddingY: "sm" as const,
          maxWidth: "xl" as const,
          logoText: brand,
        },
      },
      heroBlock,
      middleBlock,
      ...(ctaBlock ? [ctaBlock] : []),
      {
        type: "Footer",
        props: {
          id: `footer-${pageName}`,
          columns: footerColumns,
          variant: "multiColumn" as const,
          paddingY: "md" as const,
          maxWidth: "xl" as const,
          legal:
            locale === "zh-CN"
              ? `© ${new Date().getFullYear()} ${brand} 版权所有`
              : `© ${new Date().getFullYear()} ${brand}. All rights reserved.`,
        },
      },
    ];

    return {
      path: pathValue,
      name: pageName,
      data: {
        content: blocks,
        root: {
          props: {
            title: pageName,
            theme,
          },
        },
      },
    };
  };

  const pages = paths.map((pathValue) => buildPage(pathValue));
  return {
    blueprint: {
      pages: pages.map((page) => ({
        path: page.path,
        name: page.name,
        sections: [
          { id: "hero", type: "HeroCentered", intent: "Timeout fallback hero" },
          { id: "content", type: "FeatureGrid", intent: "Timeout fallback content" },
          { id: "footer", type: "Footer", intent: "Timeout fallback footer" },
        ],
      })),
    },
    theme,
    components: [],
    pages,
    errors: ["generation_timeout_fallback"],
  };
};

export async function POST(request: NextRequest) {
  ensureEnvFallbackLoaded();
  const requestId = `creation_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();
  try {
    logInfo("[creation] start", { requestId });
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const resumeId = typeof body.resumeId === "string" ? body.resumeId.trim() : "";
    if (!prompt) {
      logWarn("[creation] empty_prompt", { requestId });
      return NextResponse.json({ error: "prompt_required", requestId }, { status: 400 });
    }
    const structuredParse = parseStructuredSiteInput(body as Record<string, unknown>);
    const structuredInput = structuredParse.input;
    const structuredPromptPatch = structuredInput ? buildStructuredInputPromptPatch(structuredInput) : "";
    const promptForGeneration = structuredPromptPatch ? `${prompt}${structuredPromptPatch}` : prompt;
    const hasLlmProvider =
      Boolean(process.env.AIBERM_API_KEY) ||
      Boolean(process.env.OPENROUTER_API_KEY) ||
      Boolean(process.env.ANTHROPIC_API_KEY);
    const templateOnlyEligible = canGenerateTemplateOnly(prompt);
    if (!hasLlmProvider && !templateOnlyEligible) {
      logError("[creation] missing_api_key", { requestId });
      return NextResponse.json({ error: "missing_api_key", requestId }, { status: 500 });
    }
    if (!hasLlmProvider && templateOnlyEligible) {
      logInfo("[creation] template_only_without_api_key", { requestId });
    }

    const id = resumeId || `p2w_${Date.now()}`;
    const persistEnabled = Boolean(body.persist) || Boolean(resumeId);
    const outDir = persistEnabled
      ? path.join(process.cwd(), "..", "asset-factory", "out", "p2w", id)
      : "";
    if (persistEnabled) {
      await ensureDir(outDir);
    }

    const strictContractPrompt = hasStrictPromptContract(promptForGeneration) || Boolean(structuredInput);
    const requestTimeoutMs = persistEnabled
      ? persistRequestTimeoutMs
      : strictContractPrompt
        ? Math.max(generationRequestTimeoutMs, enterpriseRequestTimeoutMs)
        : generationRequestTimeoutMs;
    logInfo("[creation] generate", {
      requestId,
      promptLength: prompt.length,
      effectivePromptLength: promptForGeneration.length,
      timeoutMs: requestTimeoutMs,
      persistEnabled,
      strictContractPrompt,
      structuredInput: {
        enabled: Boolean(structuredInput),
        source: structuredParse.diagnostics.source,
        productCount: structuredParse.diagnostics.productCount,
        caseCount: structuredParse.diagnostics.caseCount,
        faqCount: structuredParse.diagnostics.faqCount,
      },
    });
    const generationPromise = generateP2WProject({
      prompt: promptForGeneration,
      manifest,
      structuredInput: structuredInput ?? undefined,
      planning: persistEnabled ? { dir: outDir, requestId } : undefined,
    });

    const generated =
      requestTimeoutMs > 0
        ? await Promise.race([
            generationPromise.then((result) => ({ kind: "ok" as const, result })),
            new Promise<{ kind: "timeout" }>((resolve) =>
              setTimeout(() => resolve({ kind: "timeout" }), requestTimeoutMs)
            ),
          ])
        : ({ kind: "ok" as const, result: await generationPromise });

    if (generated.kind === "timeout") {
      logWarn("[creation] timeout_fallback", { requestId, timeoutMs: requestTimeoutMs, persistEnabled });
      if (persistEnabled) {
        logInfo("[creation] persist_deferred", {
          requestId,
          id,
          reason: "timeout_fallback",
        });
        let deferredPersistSettled = false;
        const persistOnce = async (work: () => Promise<void>) => {
          if (deferredPersistSettled) return;
          deferredPersistSettled = true;
          try {
            await work();
          } catch (error: any) {
            logError("[creation] persist_deferred_finalize_failed", {
              requestId,
              id,
              message: error?.message ?? String(error),
              details: error?.details,
            });
          }
        };
        void generationPromise
          .then((resolved) =>
            persistOnce(() =>
              persistGeneratedResult({
                outDir,
                prompt,
                requestId,
                id,
                result: resolved,
                logLabel: "persisted_after_timeout",
              }).then(() => undefined)
            )
          )
          .catch((error: any) =>
            persistOnce(() =>
              persistTimeoutFallbackResult({
                outDir,
                prompt,
                requestId,
                id,
                reason: "generation_failed_after_timeout",
                upstreamMessage: error?.message ?? String(error),
              }).then(() => undefined)
            )
          );
        if (deferredPersistMaxMs > 0) {
          setTimeout(() => {
            void persistOnce(() =>
              persistTimeoutFallbackResult({
                outDir,
                prompt,
                requestId,
                id,
                reason: "deferred_generation_watchdog_timeout",
              }).then(() => undefined)
            );
          }, deferredPersistMaxMs);
        }
        return NextResponse.json({
          requestId,
          id,
          prompt,
          durationMs: Date.now() - startedAt,
          pending: true,
          timeoutMs: requestTimeoutMs,
          components: [],
          pages: [],
          theme: {},
          errors: ["generation_pending_after_timeout"],
        });
      }
      const timeoutResult = buildTimeoutFallbackResult(prompt);
      logInfo("[creation] generated", {
        requestId,
        id,
        pages: Array.isArray(timeoutResult.pages) ? timeoutResult.pages.length : 0,
        components: Array.isArray(timeoutResult.components) ? timeoutResult.components.length : 0,
        errors: timeoutResult.errors,
        timeoutFallback: true,
      });
      return NextResponse.json({
        requestId,
        id,
        prompt,
        promptEffective: promptForGeneration,
        durationMs: Date.now() - startedAt,
        pending: persistEnabled,
        timeoutMs: requestTimeoutMs,
        ...timeoutResult,
      });
    }

    const result = generated.result;
    const audit = auditSitePayload(toSandboxPayload(result), {
      prompt,
      resolvedByLayer:
        result.resolvedByLayer && typeof result.resolvedByLayer === "object"
          ? (result.resolvedByLayer as Record<string, unknown>)
          : null,
    });
    const previewStatus: "ready" = "ready";
    const publishStatus: "ready" | "blocked" = audit.ok ? "ready" : "blocked";
    if (!audit.ok) {
      logWarn("[creation] payload_audit_failed", {
        requestId,
        id,
        issues: audit.issues,
      });
    }
    logInfo("[creation] generated", {
      requestId,
      id,
      pages: Array.isArray(result.pages) ? result.pages.length : 0,
      components: Array.isArray(result.components) ? result.components.length : 0,
      errors: result.errors,
      previewStatus,
      publishStatus,
    });
    let persistedStatus: SandboxPersistStatus | null = null;
    if (persistEnabled) {
      persistedStatus = await persistGeneratedResult({
        outDir,
        prompt,
        requestId,
        id,
        result,
        logLabel: "persisted",
      });
    }

    const finalAudit = persistedStatus?.audit ?? audit;
    const finalPreviewStatus = persistedStatus?.previewStatus ?? previewStatus;
    const finalPublishStatus = persistedStatus?.publishStatus ?? publishStatus;
    return NextResponse.json({
      requestId,
      id,
      prompt,
      promptEffective: promptForGeneration,
      durationMs: Date.now() - startedAt,
      audit: finalAudit,
      previewStatus: finalPreviewStatus,
      publishStatus: finalPublishStatus,
      publishBlockedIssues: finalPublishStatus === "blocked" ? finalAudit.issues : [],
      structuredInput: structuredInput
        ? {
            productCount: structuredParse.diagnostics.productCount,
            caseCount: structuredParse.diagnostics.caseCount,
            faqCount: structuredParse.diagnostics.faqCount,
          }
        : undefined,
      ...result,
    });
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
    return NextResponse.json({ error: "generation_failed", detail, requestId }, { status: 500 });
  }
}
