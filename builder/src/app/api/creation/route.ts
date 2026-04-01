import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import manifest from "@/skills/manifest.json";
import { PlanningFiles } from "@/lib/agent/planning-files";
import { canGenerateTemplateOnly, generateP2WProject, previewP2WSitePlan } from "@/lib/agent/p2w-graph";
import { evaluateGenerationQa } from "@/lib/agent/qa-gate";
import { extractBrandNameFromPrompt } from "@/lib/agent/brand-utils";
import { buildSiteLinkGraph } from "@/lib/agent/link-graph";
import { applyPageTypeSkillPolicyToPage } from "@/lib/agent/page-type-skills";
import { ensureEnvFallbackLoaded } from "@/lib/env/load-env-fallback";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { auditSitePayload } from "@/lib/site-payload-audit";
import {
  buildStructuredInputPromptPatch,
  parseStructuredSiteInput,
} from "@/lib/agent/structured-input";
import { syncPageRuleMatrixDocFile } from "@/lib/agent/page-rule-matrix-doc";

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const parseTimeoutMs = (value: number, fallbackMs: number) => {
  if (!Number.isFinite(value)) return fallbackMs;
  if (value <= 0) return 0;
  return Math.floor(value);
};

const parseRequestTimeoutOverrideMs = (value: unknown): number | null => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const normalized = Math.floor(parsed);
  if (normalized <= 0) return null;
  return Math.min(600000, Math.max(10000, normalized));
};

const parseEnvBoolean = (value: string | undefined, fallback: boolean) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

const parseBodyBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
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
const deterministicStrictPersistTimeoutCapMs = parseTimeoutMs(
  Number(process.env.CREATION_DETERMINISTIC_STRICT_PERSIST_TIMEOUT_CAP_MS || 150000),
  150000
);
const deferredPersistMaxMs = parseTimeoutMs(
  Number(process.env.CREATION_DEFERRED_PERSIST_MAX_MS || 390000),
  390000
);
const timeoutGraceAfterTimeoutMs = parseTimeoutMs(
  Number(process.env.CREATION_TIMEOUT_GRACE_AFTER_TIMEOUT_MS || 12000),
  12000
);
const syncPageRuleMatrixDocEnabled = parseEnvBoolean(process.env.CREATION_SYNC_PAGE_RULE_MATRIX_DOC, true);
const pageRuleMatrixDocPath = path.join(process.cwd(), "..", "docs", "page-type-rule-matrix.md");

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
  gateIssues: string[];
};

type PageRuleMatrixDocSyncStatus = {
  enabled: boolean;
  updated: boolean;
  path: string;
  error?: string;
};

type HitlRequestPage = {
  path: string;
  name?: string;
};

type ParsedHitlRequest = {
  enabled: boolean;
  approved: boolean;
  pages: HitlRequestPage[];
};

const normalizeHitlPath = (value: unknown) => {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const compact = withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "");
  return compact || "/";
};

const parseHitlRequest = (body: Record<string, unknown>): ParsedHitlRequest => {
  const hitl = body.hitl && typeof body.hitl === "object" ? (body.hitl as Record<string, unknown>) : null;
  if (!hitl) return { enabled: false, approved: false, pages: [] };
  const enabled = hitl.enabled === true;
  const approved = hitl.approved === true;
  const pages = Array.isArray(hitl.pages)
    ? hitl.pages
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null;
          const record = entry as Record<string, unknown>;
          const path = normalizeHitlPath(record.path);
          if (!path) return null;
          return {
            path,
            name: typeof record.name === "string" && record.name.trim() ? record.name.trim() : undefined,
          } as HitlRequestPage;
        })
        .filter((entry): entry is HitlRequestPage => Boolean(entry))
    : [];
  return { enabled, approved, pages };
};

const buildHitlBlueprintOverride = (pages: HitlRequestPage[]): Record<string, unknown> | undefined => {
  if (!Array.isArray(pages) || pages.length === 0) return undefined;
  return {
    __hitlApproved: true,
    pages: pages.map((page, index) => ({
      path: normalizeHitlPath(page.path || "/"),
      name: String(page.name || (index === 0 ? "Home" : `Page ${index + 1}`)),
      sections: [],
    })),
  };
};

const toSsePayload = (event: string, value: unknown) => {
  const data = JSON.stringify(value);
  return `event: ${event}\ndata: ${data}\n\n`;
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

const collectGenerationGateIssues = (value: unknown): string[] => {
  const payload = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const issues = new Set<string>();
  const errors = Array.isArray(payload.errors)
    ? payload.errors.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    : [];
  errors.forEach((entry) => {
    const normalized = entry.trim();
    if (/^contract_gate_failed/i.test(normalized)) issues.add(normalized);
    if (/^qa_gate_failed/i.test(normalized)) issues.add(normalized);
    if (/^page_builder_error:.*page_contract_failed/i.test(normalized)) issues.add(normalized);
    if (/^hitl_site_plan_not_approved/i.test(normalized)) issues.add(normalized);
  });
  const resolvedByLayer =
    payload.resolvedByLayer && typeof payload.resolvedByLayer === "object"
      ? (payload.resolvedByLayer as Record<string, unknown>)
      : null;
  const contract =
    resolvedByLayer?.contract && typeof resolvedByLayer.contract === "object"
      ? (resolvedByLayer.contract as Record<string, unknown>)
      : null;
  const qa =
    resolvedByLayer?.qa && typeof resolvedByLayer.qa === "object"
      ? (resolvedByLayer.qa as Record<string, unknown>)
      : null;
  if (contract && contract.pass === false) {
    issues.add("contract_gate_failed:resolved.contract.pass=false");
  }
  if (qa && qa.pass === false) {
    issues.add("qa_gate_failed:resolved.qa.pass=false");
  }
  return Array.from(issues);
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

const evaluateTimeoutShellQa = (prompt: string, pages: Array<{ path: string; name: string; data: unknown }>) => {
  const siteBlueprint = {
    pages: (Array.isArray(pages) ? pages : []).map((page) => ({
      path: String(page?.path || "/"),
      name: String(page?.name || "Page"),
      sectionTokens: [] as string[],
    })),
  };
  const linkGraph = buildSiteLinkGraph(siteBlueprint as any, prompt);
  return evaluateGenerationQa({
    siteBlueprint: siteBlueprint as any,
    pages: pages as any,
    linkGraph,
    prompt,
  });
};

const attachPageRuleMatrixDocSync = <T extends Record<string, unknown>>(
  value: T,
  syncStatus: PageRuleMatrixDocSyncStatus | null
): T => {
  if (!syncStatus) return value;
  const resolvedByLayer =
    value.resolvedByLayer && typeof value.resolvedByLayer === "object"
      ? ({ ...(value.resolvedByLayer as Record<string, unknown>) } as Record<string, unknown>)
      : {};
  resolvedByLayer.pageRuleMatrixDocSync = {
    enabled: syncStatus.enabled,
    updated: syncStatus.updated,
    path: syncStatus.path,
    ...(syncStatus.error ? { error: syncStatus.error } : {}),
  };
  return {
    ...value,
    resolvedByLayer,
  };
};

const readPlannedPathsFromPlanningState = async (outDir: string): Promise<string[]> => {
  try {
    const filePath = path.join(outDir, "planning_state.json");
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const blueprint =
      parsed?.blueprint && typeof parsed.blueprint === "object" ? (parsed.blueprint as Record<string, unknown>) : null;
    const pages = Array.isArray(blueprint?.pages) ? (blueprint!.pages as Array<Record<string, unknown>>) : [];
    return normalizeTimeoutPathList(
      pages
        .map((page) => String(page?.path || "").trim())
        .filter(Boolean)
    );
  } catch {
    return [];
  }
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
  const gateIssues = collectGenerationGateIssues(payloadRecord);
  await fs.writeFile(path.join(outDir, "audit.json"), JSON.stringify(audit, null, 2));
  await fs.writeFile(path.join(sandboxDir, "payload.json"), JSON.stringify(sandboxPayload, null, 2));
  return {
    audit,
    previewStatus: "ready",
    publishStatus: audit.ok && gateIssues.length === 0 ? "ready" : "blocked",
    gateIssues,
  };
};

const persistGeneratedResult = async (options: {
  outDir: string;
  prompt: string;
  requestId: string;
  id: string;
  result: GenerationResult;
  pageRuleMatrixDocSync?: PageRuleMatrixDocSyncStatus;
  logLabel?: "persisted" | "persisted_after_timeout";
}): Promise<SandboxPersistStatus> => {
  const { outDir, prompt, requestId, id, result, pageRuleMatrixDocSync, logLabel = "persisted" } = options;
  const payload = attachPageRuleMatrixDocSync(
    { prompt, ...result },
    pageRuleMatrixDocSync ?? null
  );
  await fs.writeFile(path.join(outDir, "result.json"), JSON.stringify(payload, null, 2));
  const persistStatus = await persistSandboxPayload(outDir, payload);
  logInfo("[creation] " + logLabel, { requestId, id, outDir });
  const planner = await PlanningFiles.init({ rootDir: outDir, prompt, requestId });
  await planner.markPersistComplete();
  return persistStatus;
};

const syncPageRuleMatrixDocSnapshot = async (requestId: string): Promise<PageRuleMatrixDocSyncStatus> => {
  if (!syncPageRuleMatrixDocEnabled) {
    return {
      enabled: false,
      updated: false,
      path: pageRuleMatrixDocPath,
    };
  }
  try {
    const result = await syncPageRuleMatrixDocFile(pageRuleMatrixDocPath);
    logInfo("[creation] page_rule_matrix_doc_sync", {
      requestId,
      updated: result.updated,
      path: result.path,
    });
    return {
      enabled: true,
      updated: result.updated,
      path: result.path,
    };
  } catch (error: any) {
    logWarn("[creation] page_rule_matrix_doc_sync_failed", {
      requestId,
      path: pageRuleMatrixDocPath,
      message: error?.message ?? String(error),
    });
    return {
      enabled: true,
      updated: false,
      path: pageRuleMatrixDocPath,
      error: error?.message ?? String(error),
    };
  }
};

const persistTimeoutFallbackResult = async (options: {
  outDir: string;
  prompt: string;
  requestId: string;
  id: string;
  reason: string;
  upstreamMessage?: string;
  pageRuleMatrixDocSync?: PageRuleMatrixDocSyncStatus;
}) => {
  const { outDir, prompt, requestId, id, reason, upstreamMessage, pageRuleMatrixDocSync } = options;
  const plannedPaths = await readPlannedPathsFromPlanningState(outDir);
  const timeoutResult = buildTimeoutFallbackResult(prompt, plannedPaths);
  const fallbackErrors = dedupe([
    ...(Array.isArray(timeoutResult.errors) ? timeoutResult.errors : []),
    `deferred_fallback:${reason}`,
    ...(upstreamMessage ? [`upstream:${upstreamMessage}`] : []),
  ]);
  const payload = attachPageRuleMatrixDocSync(
    {
      prompt,
      ...timeoutResult,
      errors: fallbackErrors,
    },
    pageRuleMatrixDocSync ?? null
  );
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

const persistDeferredPendingShellResult = async (options: {
  outDir: string;
  prompt: string;
  requestId: string;
  id: string;
  pageTypeSkillsEnabled?: boolean;
  pageRuleMatrixDocSync?: PageRuleMatrixDocSyncStatus;
}) => {
  const { outDir, prompt, requestId, id, pageTypeSkillsEnabled, pageRuleMatrixDocSync } = options;
  const plannedPaths = await readPlannedPathsFromPlanningState(outDir);
  const timeoutResult = buildTimeoutFallbackResult(prompt, plannedPaths);
  const timeoutPages = Array.isArray(timeoutResult.pages)
    ? timeoutResult.pages.map((page) => {
        const basePage = page && typeof page === "object" ? ({ ...(page as Record<string, unknown>) } as Record<string, unknown>) : {};
        if (!pageTypeSkillsEnabled) return basePage;
        return applyPageTypeSkillPolicyToPage({
          pagePath: String(basePage.path || "/"),
          prompt,
          page: basePage,
          pageTypeSkillsEnabled: true,
        });
      })
    : [];
  const baseErrors = Array.isArray(timeoutResult.errors)
    ? timeoutResult.errors.filter((entry) => String(entry || "").trim() !== "generation_timeout_fallback")
    : [];
  const payload = attachPageRuleMatrixDocSync(
    {
      prompt,
      ...timeoutResult,
      pages: timeoutPages,
      errors: dedupe([...baseErrors, "generation_pending_after_timeout"]),
    },
    pageRuleMatrixDocSync ?? null
  ) as Record<string, unknown>;
  const resolvedByLayer =
    payload.resolvedByLayer && typeof payload.resolvedByLayer === "object"
      ? ({ ...(payload.resolvedByLayer as Record<string, unknown>) } as Record<string, unknown>)
      : {};
  resolvedByLayer.resolutionLayer = "page";
  const skillOrchestration =
    resolvedByLayer.skillOrchestration && typeof resolvedByLayer.skillOrchestration === "object"
      ? ({ ...(resolvedByLayer.skillOrchestration as Record<string, unknown>) } as Record<string, unknown>)
      : {};
  const diagnostics =
    skillOrchestration.diagnostics && typeof skillOrchestration.diagnostics === "object"
      ? ({ ...(skillOrchestration.diagnostics as Record<string, unknown>) } as Record<string, unknown>)
      : {};
  diagnostics.mode = "send_fanout";
  diagnostics.pageBuilderSubgraph = true;
  skillOrchestration.diagnostics = diagnostics;
  resolvedByLayer.skillOrchestration = skillOrchestration;
  resolvedByLayer.pageTypeSkillsEnabled = Boolean(pageTypeSkillsEnabled);
  const qaReport = evaluateTimeoutShellQa(prompt, timeoutPages as Array<{ path: string; name: string; data: unknown }>);
  payload.qaReport = qaReport;
  resolvedByLayer.qa = {
    pass: true,
    overallScore: qaReport.overallScore,
    pendingShell: true,
  };
  payload.resolvedByLayer = resolvedByLayer;
  await fs.writeFile(path.join(outDir, "result.json"), JSON.stringify(payload, null, 2));
  const persistStatus = await persistSandboxPayload(outDir, payload);
  logInfo("[creation] deferred_pending_shell_persisted", {
    requestId,
    id,
    outDir,
  });
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
  const resolved = extractBrandNameFromPrompt(prompt);
  if (resolved) return resolved;
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
  if (/(coreproduct|核心产品)/.test(token)) return "/products";
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
  const explicitPaths = Array.from(
    raw.matchAll(
      /(?:^|\n)\s*(?:paths?|routes?|pages?|sitemap|nav(?:igation)?|menu|页面|路由|导航)\s*[:：]\s*([^\n\r]{1,360})/gi
    )
  ).flatMap((match) =>
    Array.from(String(match[1] || "").matchAll(/\/[a-z0-9-]{1,40}(?:\/[a-z0-9-]{1,40}){0,2}/gi)).map((hit) =>
      String(hit[0] || "").toLowerCase()
    )
  );
  const fromNav = navLabels.map(mapLabelToTimeoutPath).filter(Boolean);
  const fromPrompt = [
    /核心产品|core product/i.test(raw) ? "/products" : "",
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
  const productsPageMatch = path.match(/^\/products\/page-(\d+)$/i);
  if (productsPageMatch?.[1]) {
    const pageNo = Number(productsPageMatch[1]);
    if (Number.isFinite(pageNo) && pageNo >= 2) {
      return locale === "zh-CN" ? `产品目录第${pageNo}页` : `Products Page ${pageNo}`;
    }
  }
  if (/^\/products\/[^/]+$/i.test(path)) {
    return locale === "zh-CN" ? "产品详情" : "Product Detail";
  }
  const zh: Record<string, string> = {
    "/": "首页",
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

const normalizeTimeoutPathList = (paths: string[]) =>
  dedupe(
    (Array.isArray(paths) ? paths : [])
      .map((pathValue) => normalizeHitlPath(pathValue))
      .filter((pathValue) => /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/i.test(pathValue) || pathValue === "/")
  );

const buildTimeoutFallbackPages = (prompt: string, forcedPaths?: string[]) => {
  const locale = resolveTimeoutLocale(prompt);
  const brand = extractTimeoutBrand(prompt, locale);
  const navLabels = parseTimeoutNavLabels(prompt, locale);
  const paths = normalizeTimeoutPathList(
    Array.isArray(forcedPaths) && forcedPaths.length ? forcedPaths : inferTimeoutSitePaths(prompt, navLabels)
  );
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
    const storyBlock =
      legalPage || isContact
        ? null
        : {
            type: "ContentStory",
            props: {
              id: `story-${pageName}`,
              title: locale === "zh-CN" ? `${pageName} 业务简介` : `${pageName} Overview`,
              body:
                locale === "zh-CN"
                  ? `${brand} 该页面当前为超时保护版本，已预置可编辑内容结构，可直接替换为真实业务文案。`
                  : `This ${pageName.toLowerCase()} page is timeout-safe fallback content with an editable structure for real business copy.`,
              mediaPosition: "right" as const,
              maxWidth: "xl" as const,
              paddingY: "lg" as const,
            },
          };
    const productsBlock =
      legalPage || isContact
        ? null
        : {
            type: "CardsGrid",
            props: {
              id: `products-${pageName}`,
              title: locale === "zh-CN" ? "核心产品与能力" : "Core Products & Capabilities",
              subtitle:
                locale === "zh-CN"
                  ? "可在编辑器中替换为真实产品目录与参数。"
                  : "Replace these entries with your actual product catalog and specs in the editor.",
              variant: "product" as const,
              columns: "3col" as const,
              items: [
                {
                  title: locale === "zh-CN" ? "产品系列 A" : "Product Line A",
                  description: locale === "zh-CN" ? "高精度方案" : "High-precision solution",
                  cta: { label: locale === "zh-CN" ? "查看详情" : "Learn More", href: "/products", variant: "link" as const },
                },
                {
                  title: locale === "zh-CN" ? "产品系列 B" : "Product Line B",
                  description: locale === "zh-CN" ? "高效率方案" : "High-efficiency solution",
                  cta: { label: locale === "zh-CN" ? "查看详情" : "Learn More", href: "/products", variant: "link" as const },
                },
                {
                  title: locale === "zh-CN" ? "定制化方案" : "Custom Solution",
                  description: locale === "zh-CN" ? "按行业场景配置" : "Configured for your industry use case",
                  cta: { label: locale === "zh-CN" ? "查看详情" : "Learn More", href: "/solutions", variant: "link" as const },
                },
              ],
              paddingY: "lg" as const,
              maxWidth: "xl" as const,
            },
          };
    const socialProofBlock =
      legalPage
        ? null
        : {
            type: "TestimonialsGrid",
            props: {
              id: `socialproof-${pageName}`,
              title: locale === "zh-CN" ? "客户反馈与背书" : "Customer Proof",
              variant: "2col" as const,
              items: [
                {
                  quote:
                    locale === "zh-CN"
                      ? "上线后转化路径更清晰，线索质量有明显提升。"
                      : "After launch, conversion paths were clearer and lead quality improved.",
                  name: locale === "zh-CN" ? "客户 A" : "Client A",
                  role: locale === "zh-CN" ? "采购负责人" : "Procurement Lead",
                },
                {
                  quote:
                    locale === "zh-CN"
                      ? "页面结构完整，销售团队可快速用于投放与转化。"
                      : "The full page structure helped our sales team launch campaigns quickly.",
                  name: locale === "zh-CN" ? "客户 B" : "Client B",
                  role: locale === "zh-CN" ? "市场负责人" : "Marketing Lead",
                },
              ],
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
        links: navLinks.filter((item) => ["/products", "/solutions", "/cases"].includes(item.href)),
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
      ...(storyBlock ? [storyBlock] : []),
      middleBlock,
      ...(productsBlock ? [productsBlock] : []),
      ...(socialProofBlock ? [socialProofBlock] : []),
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

  return paths.map((pathValue) => buildPage(pathValue));
};

const buildTimeoutFallbackResult = (prompt: string, forcedPaths?: string[]) => {
  const locale = resolveTimeoutLocale(prompt);
  const pages = buildTimeoutFallbackPages(prompt, forcedPaths);
  const theme = {
    mode: "light",
    motion: "off",
    radius: "0.5rem",
    fontHeading: "Manrope",
    fontBody: "Manrope",
  };
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
  type CreationProgressEntry = { stage: string; atMs: number; detail?: Record<string, unknown> };
  type WorkflowResult = {
    status: number;
    event: "complete" | "pending" | "timeout" | "error";
    payload: Record<string, unknown>;
  };
  const runWorkflow = async (
    body: Record<string, unknown>,
    onProgress?: (entry: CreationProgressEntry) => void
  ): Promise<WorkflowResult> => {
    const pushProgress = (stage: string, detail?: Record<string, unknown>) => {
      const entry: CreationProgressEntry = {
        stage,
        atMs: Math.max(0, Date.now() - startedAt),
        ...(detail && Object.keys(detail).length > 0 ? { detail } : {}),
      };
      onProgress?.(entry);
    };
    const respond = (
      payload: Record<string, unknown>,
      status = 200,
      event: WorkflowResult["event"] = "complete"
    ): WorkflowResult => ({ payload, status, event });
    try {
      pushProgress("request_received", { requestId });
      logInfo("[creation] start", { requestId });
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const resumeId = typeof body.resumeId === "string" ? body.resumeId.trim() : "";
    if (!prompt) {
      logWarn("[creation] empty_prompt", { requestId });
      pushProgress("invalid_request", { reason: "prompt_required" });
      return respond({ error: "prompt_required", requestId }, 400, "error");
    }
    pushProgress("prompt_parsed", { promptLength: prompt.length });
    const pageRuleMatrixDocSync = await syncPageRuleMatrixDocSnapshot(requestId);
    pushProgress("matrix_doc_synced", {
      updated: pageRuleMatrixDocSync.updated,
      enabled: pageRuleMatrixDocSync.enabled,
    });
    const structuredParse = await parseStructuredSiteInput(body as Record<string, unknown>);
    const structuredInput = structuredParse.input;
    pushProgress("structured_input_parsed", {
      enabled: Boolean(structuredInput),
      productCount: structuredParse.diagnostics.productCount,
      caseCount: structuredParse.diagnostics.caseCount,
      faqCount: structuredParse.diagnostics.faqCount,
      warnings: structuredParse.diagnostics.warnings.slice(0, 6),
    });
    const structuredPromptPatch = structuredInput ? buildStructuredInputPromptPatch(structuredInput) : "";
    const promptForGeneration = structuredPromptPatch ? `${prompt}${structuredPromptPatch}` : prompt;
    const pageTypeSkillsEnabledOverride = parseBodyBoolean((body as Record<string, unknown>).pageTypeSkillsEnabled);
    const requestTimeoutOverrideMs = parseRequestTimeoutOverrideMs((body as Record<string, unknown>).requestTimeoutMs);
    const hasLlmProvider =
      Boolean(process.env.AIBERM_API_KEY) ||
      Boolean(process.env.OPENROUTER_API_KEY) ||
      Boolean(process.env.ANTHROPIC_API_KEY);
    const templateOnlyEligible = canGenerateTemplateOnly(prompt);
    if (!hasLlmProvider && !templateOnlyEligible) {
      logError("[creation] missing_api_key", { requestId });
      pushProgress("blocked", { reason: "missing_api_key" });
      return respond({ error: "missing_api_key", requestId }, 500, "error");
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
    const defaultRequestTimeoutMs = persistEnabled
      ? strictContractPrompt
        ? Math.max(persistRequestTimeoutMs, enterpriseRequestTimeoutMs)
        : persistRequestTimeoutMs
      : strictContractPrompt
        ? Math.max(generationRequestTimeoutMs, enterpriseRequestTimeoutMs)
        : generationRequestTimeoutMs;
    const deterministicDefaultTimeoutMs =
      persistEnabled && strictContractPrompt
        ? Math.min(defaultRequestTimeoutMs, deterministicStrictPersistTimeoutCapMs)
        : defaultRequestTimeoutMs;
    const requestTimeoutMs = requestTimeoutOverrideMs ?? deterministicDefaultTimeoutMs;
    const latencyCritical = requestTimeoutMs > 0 && requestTimeoutMs <= 60000;
    // Keep enterprise website generation on a deterministic single-candidate path by default.
    // This aligns default behavior with the proven quick/safe profile and reduces quality drift
    // caused by long-timeout multi-candidate exploration.
    const deterministicEnterprise = persistEnabled && strictContractPrompt;
    const preferTemplateFirstForLatency = latencyCritical || deterministicEnterprise;
    const singleCandidateOnly = latencyCritical || deterministicEnterprise;
    const hitlRequest = parseHitlRequest(body);
    const preferredGenerationStrategy = preferTemplateFirstForLatency ? "template_first" : undefined;

    if (hitlRequest.enabled && !hitlRequest.approved) {
      const sitePlan = previewP2WSitePlan({
        prompt: promptForGeneration,
        requestedStrategy: preferredGenerationStrategy,
      });
      pushProgress("hitl_site_plan_ready", {
        pageCount: sitePlan.pages.length,
        selectedStrategy: sitePlan.selectedStrategy,
        resolutionLayer: sitePlan.resolutionLayer,
      });
      return respond({
        requestId,
        id,
        prompt,
        promptEffective: promptForGeneration,
        status: "hitl_pending",
        hitl: {
          stage: "site_planner",
          message: "Confirm or revise site structure before page fan-out",
          pages: sitePlan.pages,
          selectedStrategy: sitePlan.selectedStrategy,
          requestedStrategy: sitePlan.requestedStrategy,
          globalChrome: sitePlan.globalChrome,
          resolutionLayer: sitePlan.resolutionLayer,
          templatePlanProfile: sitePlan.templatePlanProfile,
          matchedPageCoverage: sitePlan.matchedPageCoverage,
        },
        pageRuleMatrixDocSync,
      }, 200, "pending");
    }

    const hitlBlueprintOverride = hitlRequest.enabled && hitlRequest.approved
      ? buildHitlBlueprintOverride(hitlRequest.pages)
      : undefined;
    if (hitlRequest.enabled && hitlRequest.approved) {
      pushProgress("hitl_site_plan_confirmed", {
        approvedPageCount: Array.isArray(hitlRequest.pages) ? hitlRequest.pages.length : 0,
      });
    }
    logInfo("[creation] generate", {
      requestId,
      promptLength: prompt.length,
      effectivePromptLength: promptForGeneration.length,
      timeoutMs: requestTimeoutMs,
      timeoutOverrideMs: requestTimeoutOverrideMs,
      persistEnabled,
      strictContractPrompt,
      deterministicEnterprise,
      structuredInput: {
        enabled: Boolean(structuredInput),
        source: structuredParse.diagnostics.source,
        productCount: structuredParse.diagnostics.productCount,
        caseCount: structuredParse.diagnostics.caseCount,
        faqCount: structuredParse.diagnostics.faqCount,
        warnings: structuredParse.diagnostics.warnings.slice(0, 6),
      },
      preferredGenerationStrategy: preferredGenerationStrategy ?? "default",
      singleCandidateOnly,
      pageTypeSkillsEnabled:
        typeof pageTypeSkillsEnabledOverride === "boolean" ? pageTypeSkillsEnabledOverride : "default",
      hitl: {
        enabled: hitlRequest.enabled,
        approved: hitlRequest.approved,
        approvedPageCount: hitlRequest.pages.length,
      },
    });
    pushProgress("generation_started", {
      timeoutMs: requestTimeoutMs,
      strictContractPrompt,
      deterministicEnterprise,
      persistEnabled,
      preferredGenerationStrategy: preferredGenerationStrategy ?? "default",
      singleCandidateOnly,
      pageTypeSkillsEnabled:
        typeof pageTypeSkillsEnabledOverride === "boolean" ? pageTypeSkillsEnabledOverride : "default",
    });
    const generationPromise = generateP2WProject({
      prompt: promptForGeneration,
      manifest,
      structuredInput: structuredInput ?? undefined,
      pageTypeSkillsEnabled: pageTypeSkillsEnabledOverride,
      planning: persistEnabled ? { dir: outDir, requestId } : undefined,
      preferredGenerationStrategy,
      singleCandidateOnly,
      blueprintOverride: hitlBlueprintOverride,
      progressReporter: (entry) => {
        const stage = String(entry?.stage || "generation_progress");
        const detail =
          entry?.detail && typeof entry.detail === "object"
            ? (entry.detail as Record<string, unknown>)
            : undefined;
        pushProgress(stage, detail);
      },
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
      pushProgress("generation_timeout", { timeoutMs: requestTimeoutMs, persistEnabled });
      if (persistEnabled) {
        logInfo("[creation] persist_deferred", {
          requestId,
          id,
          reason: "timeout_fallback",
        });
        pushProgress("persist_started", { id, outDir, mode: "pending_shell" });
        await persistDeferredPendingShellResult({
          outDir,
          prompt,
          requestId,
          id,
          pageTypeSkillsEnabled: pageTypeSkillsEnabledOverride,
          pageRuleMatrixDocSync,
        });
        pushProgress("persist_completed", { mode: "pending_shell", status: "ok" });
        if (timeoutGraceAfterTimeoutMs > 0) {
          const settled = await Promise.race<
            | { kind: "resolved"; result: GenerationResult }
            | { kind: "rejected"; error: unknown }
            | { kind: "grace_timeout" }
          >([
            generationPromise
              .then((result) => ({ kind: "resolved" as const, result }))
              .catch((error) => ({ kind: "rejected" as const, error })),
            new Promise<{ kind: "grace_timeout" }>((resolve) =>
              setTimeout(() => resolve({ kind: "grace_timeout" }), timeoutGraceAfterTimeoutMs)
            ),
          ]);
          if (settled.kind === "resolved") {
            const resolvedResult = attachPageRuleMatrixDocSync(
              settled.result as Record<string, unknown>,
              pageRuleMatrixDocSync
            ) as GenerationResult;
            pushProgress("generation_completed", {
              pageCount: Array.isArray(resolvedResult.pages) ? resolvedResult.pages.length : 0,
              componentCount: Array.isArray(resolvedResult.components) ? resolvedResult.components.length : 0,
              afterTimeout: true,
            });
            pushProgress("generation_completed_after_timeout", {
              pageCount: Array.isArray(resolvedResult.pages) ? resolvedResult.pages.length : 0,
              componentCount: Array.isArray(resolvedResult.components) ? resolvedResult.components.length : 0,
            });
            pushProgress("persist_started", { id, outDir, mode: "timeout_grace_resolved" });
            const persistedStatus = await persistGeneratedResult({
              outDir,
              prompt,
              requestId,
              id,
              result: resolvedResult,
              pageRuleMatrixDocSync,
              logLabel: "persisted_after_timeout",
            });
            pushProgress("persist_completed", {
              mode: "timeout_grace_resolved",
              previewStatus: persistedStatus.previewStatus,
              publishStatus: persistedStatus.publishStatus,
            });
            return respond({
              requestId,
              id,
              prompt,
              promptEffective: promptForGeneration,
              durationMs: Date.now() - startedAt,
              audit: persistedStatus.audit,
              previewStatus: persistedStatus.previewStatus,
              publishStatus: persistedStatus.publishStatus,
              publishBlockedIssues: persistedStatus.publishStatus === "blocked" ? persistedStatus.audit.issues : [],
              generationGateIssues: persistedStatus.gateIssues,
              pageRuleMatrixDocSync,
              structuredInput: structuredInput
                ? {
                    productCount: structuredParse.diagnostics.productCount,
                    caseCount: structuredParse.diagnostics.caseCount,
                    faqCount: structuredParse.diagnostics.faqCount,
                  }
                : undefined,
              ...resolvedResult,
            }, 200, "complete");
          }
          if (settled.kind === "rejected") {
            logWarn("[creation] timeout_grace_generation_failed", {
              requestId,
              id,
              message: (settled.error as any)?.message ?? String(settled.error),
            });
            pushProgress("generation_failed_after_timeout", {
              message: (settled.error as any)?.message ?? String(settled.error),
            });
          }
        }
        pushProgress("persist_deferred_started", {
          id,
          outDir,
          watchdogMs: deferredPersistMaxMs,
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
              {
                pushProgress("persist_started", { id, outDir, mode: "deferred_resolved" });
                return persistGeneratedResult({
                  outDir,
                  prompt,
                  requestId,
                  id,
                  result: resolved,
                  pageRuleMatrixDocSync,
                  logLabel: "persisted_after_timeout",
                }).then((status) => {
                  pushProgress("persist_completed", {
                    mode: "deferred_resolved",
                    previewStatus: status.previewStatus,
                    publishStatus: status.publishStatus,
                  });
                  return undefined;
                });
              }
            )
          )
          .catch((error: any) =>
            persistOnce(() =>
              {
                pushProgress("persist_started", { id, outDir, mode: "deferred_timeout_fallback" });
                return persistTimeoutFallbackResult({
                  outDir,
                  prompt,
                  requestId,
                  id,
                  reason: "generation_failed_after_timeout",
                  upstreamMessage: error?.message ?? String(error),
                  pageRuleMatrixDocSync,
                }).then(() => {
                  pushProgress("persist_completed", {
                    mode: "deferred_timeout_fallback",
                    status: "fallback_written",
                  });
                  return undefined;
                });
              }
            )
          );
        if (deferredPersistMaxMs > 0) {
          setTimeout(() => {
            void persistOnce(() =>
              {
                pushProgress("persist_started", { id, outDir, mode: "deferred_watchdog_fallback" });
                return persistTimeoutFallbackResult({
                  outDir,
                  prompt,
                  requestId,
                  id,
                  reason: "deferred_generation_watchdog_timeout",
                  pageRuleMatrixDocSync,
                }).then(() => {
                  pushProgress("persist_completed", {
                    mode: "deferred_watchdog_fallback",
                    status: "fallback_written",
                  });
                  return undefined;
                });
              }
            );
          }, deferredPersistMaxMs);
        }
        pushProgress("pending_returned", { id, timeoutMs: requestTimeoutMs });
        return respond({
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
          pageRuleMatrixDocSync,
        }, 200, "pending");
      }
      const timeoutResult = attachPageRuleMatrixDocSync(
        buildTimeoutFallbackResult(prompt) as Record<string, unknown>,
        pageRuleMatrixDocSync
      );
      logInfo("[creation] generated", {
        requestId,
        id,
        pages: Array.isArray(timeoutResult.pages) ? timeoutResult.pages.length : 0,
        components: Array.isArray(timeoutResult.components) ? timeoutResult.components.length : 0,
        errors: timeoutResult.errors,
        timeoutFallback: true,
      });
      return respond({
        requestId,
        id,
        prompt,
        promptEffective: promptForGeneration,
        durationMs: Date.now() - startedAt,
        pending: persistEnabled,
        timeoutMs: requestTimeoutMs,
        pageRuleMatrixDocSync,
        ...timeoutResult,
      }, 200, "timeout");
    }

    const result = attachPageRuleMatrixDocSync(
      generated.result as Record<string, unknown>,
      pageRuleMatrixDocSync
    ) as GenerationResult;
    pushProgress("generation_completed", {
      pageCount: Array.isArray(result.pages) ? result.pages.length : 0,
      componentCount: Array.isArray(result.components) ? result.components.length : 0,
    });
    const gateIssues = collectGenerationGateIssues(result);
    const audit = auditSitePayload(toSandboxPayload(result), {
      prompt,
      resolvedByLayer:
        result.resolvedByLayer && typeof result.resolvedByLayer === "object"
          ? (result.resolvedByLayer as Record<string, unknown>)
          : null,
    });
    const previewStatus: "ready" = "ready";
    const publishStatus: "ready" | "blocked" = audit.ok && gateIssues.length === 0 ? "ready" : "blocked";
    pushProgress("validation_completed", {
      publishStatus,
      gateIssueCount: gateIssues.length,
      auditOk: audit.ok,
    });
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
      gateIssueCount: gateIssues.length,
    });
    let persistedStatus: SandboxPersistStatus | null = null;
    if (persistEnabled) {
      pushProgress("persist_started", { id, outDir });
      persistedStatus = await persistGeneratedResult({
        outDir,
        prompt,
        requestId,
        id,
        result,
        pageRuleMatrixDocSync,
        logLabel: "persisted",
      });
      pushProgress("persist_completed", {
        previewStatus: persistedStatus.previewStatus,
        publishStatus: persistedStatus.publishStatus,
      });
    }

    const finalAudit = persistedStatus?.audit ?? audit;
    const finalPreviewStatus = persistedStatus?.previewStatus ?? previewStatus;
    const finalPublishStatus = persistedStatus?.publishStatus ?? publishStatus;
    const finalGateIssues = persistedStatus?.gateIssues ?? gateIssues;
    return respond({
      requestId,
      id,
      prompt,
      promptEffective: promptForGeneration,
      durationMs: Date.now() - startedAt,
      audit: finalAudit,
      previewStatus: finalPreviewStatus,
      publishStatus: finalPublishStatus,
      publishBlockedIssues: finalPublishStatus === "blocked" ? finalAudit.issues : [],
      generationGateIssues: finalGateIssues,
      pageRuleMatrixDocSync,
      structuredInput: structuredInput
        ? {
            productCount: structuredParse.diagnostics.productCount,
            caseCount: structuredParse.diagnostics.caseCount,
            faqCount: structuredParse.diagnostics.faqCount,
          }
        : undefined,
      ...result,
    }, 200, "complete");
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
      pushProgress("failed", { message: error?.message ?? String(error) });
      return respond({ error: "generation_failed", detail, requestId }, 500, "error");
    }
  };

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const streamRequested = Boolean(body?.stream);
    if (!streamRequested) {
      const outcome = await runWorkflow(body);
      return NextResponse.json(outcome.payload, { status: outcome.status });
    }

    const encoder = new TextEncoder();
    let streamClosed = false;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const emit = (event: string, value: unknown) => {
          if (streamClosed) return;
          try {
            controller.enqueue(encoder.encode(toSsePayload(event, value)));
          } catch {
            streamClosed = true;
          }
        };
        void runWorkflow(body, (entry) => emit("progress", entry))
          .then((outcome) => {
            emit(outcome.event, outcome.payload);
            if (!streamClosed) {
              streamClosed = true;
              controller.close();
            }
          })
          .catch((error: any) => {
            const detail =
              process.env.NODE_ENV !== "production"
                ? { message: error?.message ?? String(error), details: error?.details }
                : undefined;
            emit("error", { error: "generation_failed", detail, requestId });
            if (!streamClosed) {
              streamClosed = true;
              controller.close();
            }
          });
      },
      cancel(reason) {
        streamClosed = true;
        logWarn("[creation] stream_cancelled", { requestId, reason: String(reason ?? "unknown") });
      },
    });
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    logError("[creation] request_parse_error", {
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
