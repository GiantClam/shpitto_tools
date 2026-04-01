import { promises as fs } from "fs";
import path from "path";
import { Annotation, END, START, Send, StateGraph, interrupt } from "@langchain/langgraph";
import type { Tool, ToolChoice } from "@anthropic-ai/sdk/resources/messages/messages";

import { llmProviders, type LlmProviderClient } from "@/lib/agent/graph";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { formatSummary, normalizeBlockProps } from "@/lib/design-system-enforcer";
import { ConsistencyGuardian } from "@/lib/consistency-guardian";
import { PlanningFiles } from "@/lib/agent/planning-files";
import {
  architectSystemPrompt,
  buildArchitectUserPrompt,
  builderSystemPrompt,
  buildBuilderCompactUserPrompt,
  buildBuilderUserPrompt,
} from "@/lib/agent/prompts";
import {
  resolvePublishedPageGenerationContract,
  resolveSectionTemplateAsset,
  resolveSectionTemplateBlock,
  selectStyleProfile,
  type TemplatePersonalizationContext,
} from "@/lib/agent/section-template-registry";
import {
  buildTemplateAdaptationSummary,
  getTemplateFamilyBrandTerms,
  inferKnownSiteScenario,
  inferTemplateFamily,
} from "@/lib/agent/template-adaptation";
import {
  ENTERPRISE_SITE_PAGES,
  ensureEnterpriseSitePages,
  looksLikeEnterpriseWebsite,
} from "@/lib/agent/enterprise-site-structure";
import { buildSiteBlueprint } from "@/lib/agent/site-planner";
import { resolveTemplatePlan, type LayeredTemplateResolution } from "@/lib/agent/template-resolver";
import { evaluateGenerationQa } from "@/lib/agent/qa-gate";
import {
  normalizePagesBySiteContract,
  validateGeneratedSiteContract,
} from "@/lib/agent/contracts";
import { orchestrateTemplateAndSectionCandidates } from "@/lib/agent/skill-orchestrator";
import {
  resolveEnterprisePagePathFromLabel,
  inferEnterprisePageTypeFromPath,
} from "@/lib/agent/page-classifier";
import { resolveCanonicalRoute } from "@/lib/agent/route-contract";
import {
  applyLinkGraphToFooterProps,
  applyLinkGraphToNavbarProps,
  buildSiteLinkGraph,
  sanitizeInternalHrefsInProps,
  type SiteLinkGraph,
} from "@/lib/agent/link-graph";
import { resolveOutputLanguage, shouldUseChineseContent } from "@/lib/agent/language";
import { applyPageTypeSkillPolicyToPage, buildPageTypeSkillDirective } from "@/lib/agent/page-type-skills";
import { buildScopedRagContextByPage } from "@/lib/agent/scoped-rag";
import {
  evaluateGeneratedPageContract,
  resolveRequiredSectionKindsByPageType,
} from "@/lib/agent/page-contract";
import { createKnowledgeBaseClientFromEnv } from "@/lib/agent/knowledge-base";
import {
  extractBrandNameFromPrompt as extractBrandNameFromPromptShared,
  sanitizeBrandCandidate as sanitizeBrandCandidateShared,
} from "@/lib/agent/brand-utils";
import { PAGE_HARDNESS_RULES_BY_TYPE, type PageHardnessRule } from "@/lib/agent/page-rule-matrix";
import type {
  StructuredCaseRecord,
  StructuredFaqRecord,
  StructuredProductRecord,
  StructuredSiteInput,
} from "@/lib/agent/structured-input";

const State = Annotation.Root({
  prompt: Annotation<string>,
  manifest: Annotation<Record<string, unknown>>,
  structuredInput: Annotation<StructuredSiteInput | null>({
    value: (_left, right) => right,
    default: () => null,
  }),
  pageTypeSkillsEnabled: Annotation<boolean | null>({
    value: (_left, right) => right,
    default: () => null,
  }),
  singleCandidateOnly: Annotation<boolean>({
    value: (_left, right) => Boolean(right),
    default: () => false,
  }),
  blueprint: Annotation<Record<string, unknown>>,
  generationStrategy: Annotation<SectionGenerationStrategy>({
    value: (_left, right) => right,
    default: () => "template_first",
  }),
  planning: Annotation<PlanningFiles | null>({ value: (_left, right) => right, default: () => null }),
  skillContext: Annotation<{ architect: string; builder: string }>({
    value: (_left, right) => right,
    default: () => ({ architect: "", builder: "" }),
  }),
  designSystemContext: Annotation<DesignSystemContext>({
    value: (_left, right) => right,
    default: () => ({ master: "", pages: {} }),
  }),
  components: Annotation<any[]>({ value: (_left, right) => right, default: () => [] }),
  pages: Annotation<any[]>({ value: (_left, right) => right, default: () => [] }),
  theme: Annotation<Record<string, unknown>>,
  siteBlueprint: Annotation<Record<string, unknown>>({
    value: (_left, right) => right,
    default: () => ({}),
  }),
  resolvedByLayer: Annotation<Record<string, unknown>>({
    value: (_left, right) => right,
    default: () => ({}),
  }),
  qaReport: Annotation<Record<string, unknown>>({
    value: (_left, right) => right,
    default: () => ({}),
  }),
  globalChrome: Annotation<GlobalChromeContract>({
    value: (_left, right) => right,
    default: () => ({
      navigationBlockType: "Navbar",
      footerBlockType: "CreationFooterFallback",
      motionProfile: "subtle",
    }),
  }),
  pageBuildJobs: Annotation<PageBuildJob[]>({
    value: (_left, right) => right,
    default: () => [],
  }),
  currentPageJob: Annotation<PageBuildJob | null>({
    value: (_left, right) => right,
    default: () => null,
  }),
  pageBuildResults: Annotation<PageBuildResult[]>({
    value: (left, right) => [...(left ?? []), ...(right ?? [])],
    default: () => [],
  }),
  pageBuildMode: Annotation<{ enabled: boolean; path?: string } | null>({
    value: (_left, right) => right,
    default: () => null,
  }),
  errors: Annotation<string[]>({ value: (_left, right) => right, default: () => [] }),
});

type GraphState = typeof State.State;

type GenerationProgressEntry = {
  stage: string;
  detail?: Record<string, unknown>;
};

type GenerationProgressReporter = (entry: GenerationProgressEntry) => void;

type LlmOptions = {
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Tool[];
  toolChoice?: ToolChoice;
  modelOverride?: string;
  requireToolUse?: boolean;
  allowProviderFallbackOnAnyError?: boolean;
  requestSignal?: AbortSignal;
};

type SkillContext = {
  architect: string;
  builder: string;
};

type DesignSystemContext = {
  master: string;
  pages: Record<string, string>;
};

type SkillEntry = {
  name: string;
  content: string;
};

type ArchitectSection = {
  id?: string;
  type?: string;
  intent?: string;
  propsHints?: Record<string, unknown>;
  layoutHint?: {
    structure?: "single" | "dual" | "triple" | "split";
    density?: "compact" | "normal" | "spacious";
    align?: "start" | "center";
    alignLocked?: boolean;
    media?: "none" | "image-left" | "image-right" | "background";
    list?: "cards" | "tiles" | "rows";
    compositionPreset?: string;
  };
};

type ArchitectPage = {
  path?: string;
  name?: string;
  sections?: ArchitectSection[];
  root?: { props?: Record<string, unknown> };
};

type ArchitectBlueprint = {
  designNorthStar?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  pages?: ArchitectPage[];
};

type ThemeContract = {
  voice?: string;
  tokens?: Record<string, string>;
  layoutRules?: Record<string, string> & {
    sectionAlignOverrides?: Record<string, "start" | "center">;
  };
  motionRules?: Record<string, string | number>;
  breakoutBudget?: {
    allowedSections?: string[];
    colorBoost?: number;
    motionBoost?: number;
    layoutVariants?: string[];
  };
};

type ThemeClassMapBase = {
  container: string;
  sectionPadding: string;
  grid: string;
  heading: string;
  body: string;
  card: string;
  accent: string;
  styleName: string;
  styleTokens: {
    surface: string;
    border: string;
    glow: string;
    hero: string;
    section: string;
  };
  breakout: {
    hero: string;
    showcase: string;
    fullBleed: string;
  };
  effects?: {
    glowButton: string;
    glassCard: string;
    gradientText: string;
    hoverLift: string;
    hoverUnderline: string;
  };
};

type ThemeClassMap = ThemeClassMapBase & {
  variants: Record<string, ThemeClassMap>;
};

type MotionPresets = {
  fadeUp: Record<string, unknown>;
  fadeIn: Record<string, unknown>;
  stagger: Record<string, unknown>;
};

type CompositionPreset = {
  id: string;
  name: string;
  sectionTypes?: string[];
  layout?: {
    structure?: "single" | "dual" | "triple" | "split";
    density?: "compact" | "normal" | "spacious";
    align?: "start" | "center";
    media?: "none" | "image-left" | "image-right" | "background";
    list?: "cards" | "tiles" | "rows";
  };
  requiredClasses?: string[];
  notes?: string[];
};

type SectionContext = {
  pageIndex: number;
  pagePath: string;
  pageName: string;
  sectionIndex: number;
  section: Required<Pick<ArchitectSection, "id" | "type">> &
    Omit<ArchitectSection, "id" | "type">;
};

type SectionComponent = {
  name: string;
  code: string;
  defaultProps?: Record<string, unknown>;
};

type SectionBlock = {
  type: string;
  props?: Record<string, unknown>;
};

type SectionPayload = {
  component?: SectionComponent;
  block?: SectionBlock;
};

type BuilderSectionResult =
  | {
      status: "ok";
      component: SectionComponent;
      block: SectionBlock;
      templateMeta?: {
        sourceLayer: string;
        profileId: string;
        styleFamily: string | null;
        editableFieldCount: number;
        catalogSource: "published" | "runtime" | "none";
      };
    }
  | { status: "fallback"; block: SectionBlock; error: string; failureType: FailureType }
  | { status: "error"; error: string; failureType: FailureType };

type PageBuildJob = {
  pageIndex: number;
  pagePath: string;
  pageName: string;
  pageType: ReturnType<typeof inferEnterprisePageTypeFromPath>;
  requiredSectionKinds: string[];
  ragQueries: string[];
  hardness: PageHardnessRule;
  page: ArchitectPage;
  strategy: SectionGenerationStrategy;
};

type PageBuildResult = {
  pageIndex: number;
  pagePath: string;
  pageName: string;
  page: Record<string, unknown>;
  components: Array<{ name: string; code: string }>;
  errors: string[];
  resolvedByLayer?: Record<string, unknown>;
  qaReport?: Record<string, unknown>;
  theme?: Record<string, unknown>;
};

type GlobalChromeContract = {
  navigationBlockType: string;
  footerBlockType: string;
  motionProfile: "none" | "subtle" | "showcase" | "immersive";
};

type PlannerPreparationMetadata = {
  prepared: true;
  requestedStrategy: SectionGenerationStrategy;
  selectedStrategy: SectionGenerationStrategy;
  templatePlanProfile: string | null;
  resolutionLayer: LayeredTemplateResolution["layer"];
  matchedPagePaths: string[];
  matchedPageCoverage: number;
  templateKinds: string[];
  styleFamily: string | null;
  motionProfile: string | null;
  globalChrome: GlobalChromeContract;
  contractNormalizationIssues: Array<Record<string, unknown>>;
  skillOrchestration: {
    applied: boolean;
    suggestion: SectionGenerationStrategy | null;
    diagnostics: Record<string, unknown>;
  };
  pages: ArchitectPage[];
};

type NdjsonLinePayload = {
  component?: SectionComponent;
  block?: SectionBlock;
};

type ReferenceProfile = "analogue" | "breton" | null;

const architectTool: Tool = {
  name: "architect_blueprint",
  description: "Return the site blueprint (theme + pages + sections) in strict JSON.",
  input_schema: {
    type: "object",
    additionalProperties: true,
    properties: {
      designNorthStar: { type: "object", additionalProperties: true },
      theme: {
        type: "object",
        additionalProperties: true,
        properties: {
          mode: { type: "string" },
          paletteRef: {
            type: "object",
            additionalProperties: false,
            properties: {
              primaryIndex: { type: "number" },
              accentIndex: { type: "number" },
            },
          },
          radius: { type: "string" },
          fontHeading: { type: "string" },
          fontBody: { type: "string" },
          motion: { type: "string" },
          tokens: { type: "object", additionalProperties: true },
          layoutRules: { type: "object", additionalProperties: true },
          themeContract: { type: "object", additionalProperties: true },
        },
        required: ["mode", "radius", "fontHeading", "fontBody", "motion"],
      },
      pages: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: true,
          properties: {
            path: { type: "string" },
            name: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: true,
                properties: {
                  id: { type: "string" },
                  type: { type: "string" },
                  intent: { type: "string" },
                  propsHints: { type: "object", additionalProperties: true },
                  layoutHint: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      structure: { type: "string", enum: ["single", "dual", "triple", "split"] },
                      density: { type: "string", enum: ["compact", "normal", "spacious"] },
                      align: { type: "string", enum: ["start", "center"] },
                      media: { type: "string", enum: ["none", "image-left", "image-right", "background"] },
                      list: { type: "string", enum: ["cards", "tiles", "rows"] },
                      compositionPreset: {
                        type: "string",
                        enum: [
                          "H01",
                          "H02",
                          "H03",
                          "F01",
                          "F02",
                          "F03",
                          "G01",
                          "G02",
                          "G03",
                          "S01",
                          "S02",
                          "CP01",
                          "P01",
                          "P02",
                          "P03",
                          "L01",
                          "L02",
                          "ST01",
                          "ST02",
                          "TL01",
                          "PR01",
                          "T01",
                          "T02",
                          "PRC01",
                          "C01",
                          "C02",
                          "C03",
                          "Q01",
                          "Q02",
                          "TM01",
                          "B01",
                          "IN01",
                          "CS01",
                          "CT01",
                          "MP01",
                          "FRM01",
                          "FT01",
                          "CN01",
                          "CN02",
                        ],
                      },
                    },
                  },
                },
                required: ["id", "type", "intent"],
              },
            },
          },
          required: ["path", "name", "sections"],
        },
      },
    },
    required: ["theme", "pages"],
  },
};

const builderTool: Tool = {
  name: "builder_section",
  description: "Return a single section component and block in strict JSON.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      component: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          code: { type: "string" },
          defaultProps: { type: "object", additionalProperties: true },
        },
        required: ["name", "code"],
      },
      block: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: { type: "string" },
          props: { type: "object", additionalProperties: true },
        },
        required: ["type"],
      },
    },
    required: ["component", "block"],
  },
};

const primaryModelDefault = process.env.LLM_MODEL || process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";
const fallbackModelDefault = process.env.LLM_MODEL_FALLBACK || process.env.OPENROUTER_MODEL_FALLBACK;
type ProviderModelName = LlmProviderClient["name"];
const providerPrimaryModelOverrides: Partial<Record<ProviderModelName, string>> = {
  aiberm: process.env.LLM_MODEL_AIBERM || process.env.AIBERM_MODEL || "",
  openrouter: process.env.LLM_MODEL_OPENROUTER || process.env.OPENROUTER_MODEL || "",
  anthropic: process.env.LLM_MODEL_ANTHROPIC || process.env.ANTHROPIC_MODEL || "",
};
const providerFallbackModelOverrides: Partial<Record<ProviderModelName, string>> = {
  aiberm: process.env.LLM_MODEL_FALLBACK_AIBERM || process.env.AIBERM_MODEL_FALLBACK || "",
  openrouter: process.env.LLM_MODEL_FALLBACK_OPENROUTER || process.env.OPENROUTER_MODEL_FALLBACK || "",
  anthropic: process.env.LLM_MODEL_FALLBACK_ANTHROPIC || process.env.ANTHROPIC_MODEL_FALLBACK || "",
};
const openrouterSafeFallbackModel =
  process.env.OPENROUTER_MODEL_SAFE ||
  process.env.OPENROUTER_NON_ANTHROPIC_MODEL ||
  process.env.OPENROUTER_MODEL_FALLBACK_SAFE ||
  "openai/gpt-4o-mini";
const parseModelCandidateCsv = (value: string | undefined, fallback: string[]) => {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const parsed = value
    .split(",")
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  return parsed.length ? parsed : fallback;
};
const openrouterFallbackModelCandidates = parseModelCandidateCsv(
  process.env.OPENROUTER_MODEL_CANDIDATES || process.env.LLM_MODEL_CANDIDATES_OPENROUTER,
  [
    openrouterSafeFallbackModel,
    "google/gemini-2.0-flash-001",
    "qwen/qwen-2.5-72b-instruct",
    "meta-llama/llama-3.3-70b-instruct",
  ]
);
const resolveProviderModel = (provider: ProviderModelName, requestedModel: string) => {
  const providerPrimary = providerPrimaryModelOverrides[provider];
  const providerFallback = providerFallbackModelOverrides[provider];
  if (requestedModel === fallbackModelDefault) {
    return providerFallback || providerPrimary || requestedModel;
  }
  if (requestedModel === primaryModelDefault) {
    return providerPrimary || requestedModel;
  }
  return requestedModel;
};
const dedupeModelCandidates = (models: string[]) =>
  Array.from(
    new Set(
      models
        .map((model) => String(model || "").trim())
        .filter(Boolean)
    )
  );
const looksLikeAnthropicModel = (model: string) => {
  const token = String(model || "").trim().toLowerCase();
  return /(^claude[-/])|(^anthropic\/)|(^anthropic:)|\banthropic\b/.test(token);
};
const resolveProviderModelCandidates = (provider: ProviderModelName, requestedModel: string) => {
  const resolved = resolveProviderModel(provider, requestedModel);
  if (provider !== "openrouter") return [resolved];
  const candidates = [resolved];
  if (looksLikeAnthropicModel(resolved)) candidates.push(openrouterSafeFallbackModel);
  candidates.push(...openrouterFallbackModelCandidates);
  return dedupeModelCandidates(candidates);
};
const defaultMaxTokens = Number(process.env.LLM_MAX_TOKENS || process.env.OPENROUTER_MAX_TOKENS || 4096);
const logPrefix = "[creation:agent]";
type CrossProviderFallbackMode = "all" | "network_only" | "none";
const crossProviderFallbackMode = (
  process.env.LLM_CROSS_PROVIDER_FALLBACK || "all"
).toLowerCase() as CrossProviderFallbackMode;
const defaultSectionConcurrency = Number(
  process.env.LLM_MAX_CONCURRENCY || process.env.OPENROUTER_MAX_CONCURRENCY || 3
);
const architectMaxTokens = Number(process.env.ARCHITECT_MAX_TOKENS || 1800);
const architectTimeoutMs = Number(process.env.ARCHITECT_TIMEOUT_MS || 25000);
const builderMaxTokens = Number(process.env.BUILDER_MAX_TOKENS || 1200);
const configuredBuilderRecoveryMaxTokens = Number(process.env.BUILDER_RECOVERY_MAX_TOKENS || 2200);
const builderRecoveryMaxTokens = Number.isFinite(configuredBuilderRecoveryMaxTokens)
  ? Math.max(builderMaxTokens, Math.floor(configuredBuilderRecoveryMaxTokens))
  : Math.max(builderMaxTokens, 2200);
const builderTimeoutMs = Number(process.env.BUILDER_TIMEOUT_MS || 30000);
const configuredBuilderRecoveryTimeoutMs = Number(process.env.BUILDER_RECOVERY_TIMEOUT_MS || 45000);
const builderRecoveryTimeoutMs = Number.isFinite(configuredBuilderRecoveryTimeoutMs)
  ? Math.max(builderTimeoutMs, Math.floor(configuredBuilderRecoveryTimeoutMs))
  : Math.max(builderTimeoutMs, 45000);
const defaultMaxPages = Number(process.env.CREATION_MAX_PAGES || 10);
const defaultMaxSectionsPerPage = Number(process.env.CREATION_MAX_SECTIONS_PER_PAGE || 8);
const defaultMaxSectionsTotal = Number(process.env.CREATION_MAX_SECTIONS_TOTAL || 48);
const defaultEnterpriseMaxSectionsPerPage = Number(process.env.CREATION_ENTERPRISE_MAX_SECTIONS_PER_PAGE || 6);
const defaultEnterpriseMaxSectionsTotal = Number(process.env.CREATION_ENTERPRISE_MAX_SECTIONS_TOTAL || 36);
type BuilderRetryMode = "legacy" | "network_only" | "none";
const builderRetryMode = ((process.env.LLM_RETRY_MODE || "legacy").toLowerCase() as BuilderRetryMode) ?? "legacy";
type SectionGenerationStrategy = "llm_first" | "hybrid" | "template_first";
const normalizeRouteToken = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

const parseEnvBoolean = (value: string | undefined, fallback: boolean) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};
const parseEnvCsv = (value: string | undefined, fallback: string[]) => {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const parsed = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return parsed.length ? parsed : fallback;
};
const forceOpenrouterFallbackOnAibermFailure = parseEnvBoolean(
  process.env.LLM_FORCE_OPENROUTER_FALLBACK_ON_AIBERM_FAILURE,
  true
);
const parseSectionGenerationStrategy = (
  value: string | undefined,
  fallback: SectionGenerationStrategy
): SectionGenerationStrategy => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "llm_first" || normalized === "hybrid" || normalized === "template_first") {
    return normalized;
  }
  return fallback;
};
const parseStrategyList = (
  value: string | undefined,
  fallback: SectionGenerationStrategy[]
): SectionGenerationStrategy[] => {
  const parsed = parseEnvCsv(value, []).map((item) => parseSectionGenerationStrategy(item, "template_first"));
  const deduped = Array.from(new Set(parsed));
  return deduped.length ? deduped : fallback;
};

const useCompactDesignSystemForBuilder = parseEnvBoolean(
  process.env.BUILDER_USE_COMPACT_DESIGN_SYSTEM_PROMPT,
  true
);
const sectionGenerationStrategy = parseSectionGenerationStrategy(
  process.env.BUILDER_SECTION_GENERATION_STRATEGY,
  "hybrid"
);
// Scoped RAG is mandatory in the current architecture. Keep the env key for backwards compatibility,
// but do not allow global fact-pack fallback mode.
const enableScopedRag = true;
const scopedRagConcurrency = Math.max(1, Number(process.env.BUILDER_SCOPED_RAG_CONCURRENCY || 2));
const enableMultiCandidateSelection = parseEnvBoolean(
  process.env.BUILDER_MULTI_CANDIDATE_SELECTION,
  true
);
const configuredCandidateStrategies = parseStrategyList(
  process.env.BUILDER_MULTI_CANDIDATE_STRATEGIES,
  ["hybrid", "template_first"]
);
const configuredDetailedCandidateStrategies = parseStrategyList(
  process.env.BUILDER_MULTI_CANDIDATE_DETAILED_STRATEGIES,
  ["hybrid", "template_first", "llm_first"]
);
const multiCandidateMaxPromptChars = Math.max(
  0,
  Number(process.env.BUILDER_MULTI_CANDIDATE_MAX_PROMPT_CHARS || 1400)
);
const templateFirstSectionTokens = parseEnvCsv(
  process.env.BUILDER_TEMPLATE_SECTIONS || process.env.BUILDER_TEMPLATE_FIRST_SECTIONS,
  ["footercta", "footer-cta", "cta", "socialproof", "social-proof", "testimonial", "trustlogo"]
);
const llmFirstSectionTokens = parseEnvCsv(
  process.env.BUILDER_LLM_SECTIONS,
  sectionGenerationStrategy === "template_first"
    ? []
    : ["hero", "studiostory", "story", "showcase"]
);
const templateFirstVariantTokens = new Set(
  parseEnvCsv(process.env.BUILDER_TEMPLATE_FIRST_VARIANTS, ["cta", "socialproof", "contact", "catalog"])
);
const templateRecoveryFailureTypes = new Set(
  parseEnvCsv(process.env.BUILDER_TEMPLATE_RECOVERY_FAILURE_TYPES, ["parse", "layout"])
);
const enableTemplateShadowRun = parseEnvBoolean(process.env.BUILDER_TEMPLATE_SHADOW_RUN, false);
const enableTemplateRefinement = parseEnvBoolean(process.env.BUILDER_TEMPLATE_REFINEMENT, true);
const templateRefinementMaxTokens = Math.max(512, Number(process.env.BUILDER_TEMPLATE_REFINEMENT_MAX_TOKENS || 2048));
const templateRefinementTimeoutMs = Math.max(5000, Number(process.env.BUILDER_TEMPLATE_REFINEMENT_TIMEOUT_MS || 15000));
const templateRefinementSkipSectionTokens = new Set(
  parseEnvCsv(process.env.BUILDER_TEMPLATE_REFINEMENT_SKIP_SECTIONS, [
    "navigation",
    "hero",
    "approach",
    "socialproof",
    "cta",
    "footer",
  ])
);
const skipTemplateExclusiveRefinement = parseEnvBoolean(
  process.env.BUILDER_TEMPLATE_REFINEMENT_SKIP_TEMPLATE_EXCLUSIVE,
  true
);
const allowTemplateFirstUpshift = parseEnvBoolean(
  process.env.BUILDER_ALLOW_TEMPLATE_FIRST_UPSHIFT,
  false
);
const forceHybridForZhEnterpriseWhenTemplateFirst = parseEnvBoolean(
  process.env.BUILDER_ZH_TEMPLATE_FORCE_HYBRID,
  false
);
const allowTemplateSeedWithoutProfile = parseEnvBoolean(
  process.env.BUILDER_TEMPLATE_SEED_WITHOUT_PROFILE,
  true
);
const knowledgeBaseClient = createKnowledgeBaseClientFromEnv();

const configuredSectionMaxAttempts = Math.max(1, Number(process.env.LLM_SECTION_MAX_ATTEMPTS || 3));
const configuredNetworkRetryAttempts = Math.max(0, Number(process.env.LLM_NETWORK_RETRY_ATTEMPTS || 1));
const effectiveSectionMaxAttempts =
  builderRetryMode === "legacy"
    ? configuredSectionMaxAttempts
    : Math.max(1, Number(process.env.LLM_SECTION_MAX_ATTEMPTS || 1));
const allowNonNetworkRetries = builderRetryMode === "legacy";
const enableBuilderRepair = parseEnvBoolean(process.env.LLM_ENABLE_REPAIR, builderRetryMode === "legacy");
const enableBuilderRefinement = parseEnvBoolean(process.env.LLM_ENABLE_REFINEMENT, builderRetryMode === "legacy");
const providerDisableMs = Math.max(0, Number(process.env.LLM_PROVIDER_DISABLE_MS || 300000));
const providerDisabledUntil = new Map<ProviderModelName, number>();

const isNetworkOrRetryableProviderError = (error: unknown) => {
  const message = String((error as any)?.message ?? "");
  const code = String((error as any)?.code ?? "");
  const status = Number((error as any)?.status);
  const hasStatus = Number.isFinite(status);
  if (/connection error|econn|etimedout|eai_again|socket|network|fetch failed|timeout/i.test(message)) {
    return true;
  }
  if (/econn|etimedout|eai_again|enotfound/i.test(code)) {
    return true;
  }
  if (hasStatus && (status >= 500 || status === 429 || status === 408)) {
    return true;
  }
  return false;
};

const isAuthOrQuotaProviderError = (error: unknown) => {
  const message = String((error as any)?.message ?? "");
  const code = String((error as any)?.code ?? "");
  const status = Number((error as any)?.status);
  if (Number.isFinite(status) && (status === 401 || status === 402)) {
    return true;
  }
  if (Number.isFinite(status) && status === 403) {
    // 403 may be model-policy denial (e.g. anthropic author banned on OpenRouter),
    // which should be handled by model fallback instead of disabling the provider.
    if (/author\s+anthropic\s+is\s+banned/i.test(message)) return false;
    if (/forbidden|unauthorized|invalid[_\s-]?api[_\s-]?key|quota|credit|insufficient/i.test(message)) {
      return true;
    }
  }
  if (/tokenstatusexhausted|insufficient|quota|credit|exhausted|unauthorized|invalid[_\s-]?api[_\s-]?key/i.test(message)) {
    return true;
  }
  if (/invalid_api_key|invalidapikey|authentication_error|auth_error|insufficient_quota/i.test(code)) {
    return true;
  }
  return false;
};

const isAbortLikeError = (error: unknown) => {
  const name = String((error as any)?.name ?? "");
  const code = String((error as any)?.code ?? "");
  const message = String((error as any)?.message ?? "");
  return (
    name === "AbortError" ||
    code === "ABORT_ERR" ||
    /aborted|aborterror|signal is aborted|request aborted/i.test(message)
  );
};

const shouldFallbackToNextProvider = (error: unknown) => {
  if (crossProviderFallbackMode === "none") return false;
  if (crossProviderFallbackMode === "all") return true;
  if (isAuthOrQuotaProviderError(error)) return true;
  return isNetworkOrRetryableProviderError(error);
};

const errorComponentName = "CreationErrorSection";
const errorComponentCode = `import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-exports";

export const config = {
  fields: {
    title: { type: "text" },
    message: { type: "text" },
    sectionId: { type: "text" },
    sectionType: { type: "text" }
  },
  defaultProps: {
    title: "Section generation failed",
    message: "This section failed to generate and was replaced with a placeholder.",
    sectionId: "",
    sectionType: ""
  }
};

export default function CreationErrorSection(props) {
  const { title, message, sectionId, sectionType } = props || {};
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-sm text-destructive">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <p>{message}</p>
        {sectionType ? <p>Section: {sectionType}</p> : null}
        {sectionId ? <p>ID: {sectionId}</p> : null}
      </CardContent>
    </Card>
  );
}
`;
const fallbackComponentName = "CreationFallbackSection";
const fallbackComponentCode = `import * as React from "react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "@/components/ui-exports";

export const config = {
  fields: {
    title: { type: "text" },
    subtitle: { type: "text" },
    variant: { type: "select", options: ["content", "catalog", "contact", "cta", "socialProof"] },
    ctaStyle: { type: "select", options: ["auto", "surface", "contrast"] },
    ctaLabel: { type: "text" },
    ctaHref: { type: "text" },
    secondaryCtaLabel: { type: "text" },
    secondaryCtaHref: { type: "text" },
    legal: { type: "text" },
    whatsapp: { type: "text" }
  },
  defaultProps: {
    title: "Section",
    subtitle: "",
    variant: "content",
    ctaStyle: "auto",
    ctaLabel: "",
    ctaHref: "#contact",
    secondaryCtaLabel: "",
    secondaryCtaHref: "",
    legal: "",
    whatsapp: ""
  }
};

export default function CreationFallbackSection(props) {
  const {
    anchor = "section",
    title = "Section",
    subtitle = "",
    variant = "content",
    ctaStyle = "auto",
    items = [],
    ctaLabel = "",
    ctaHref = "#contact",
    secondaryCtaLabel = "",
    secondaryCtaHref = "",
    legal = "",
    footerLinks = [],
    logos = [],
    testimonials = [],
    whatsapp = "",
  } = props || {};

  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const safeFooterLinks = Array.isArray(footerLinks) ? footerLinks.slice(0, 4) : [];
  const safeLogos = Array.isArray(logos) ? logos.filter(Boolean).slice(0, 8) : [];
  const safeTestimonials = Array.isArray(testimonials) ? testimonials.filter(Boolean).slice(0, 3) : [];
  const localeSeed = [title, subtitle, ctaLabel, legal]
    .filter((entry) => typeof entry === "string" && entry.trim())
    .join(" ");
  const useChinese = /[\\u3400-\\u9fff]/.test(localeSeed);
  const localeCopy = useChinese
      ? {
        fallbackCatalog: [
          { title: "核心产品线 A", desc: "面向重点场景提供稳定能力与可扩展配置。" },
          { title: "核心产品线 B", desc: "支持参数化选型与标准化快速交付。" },
          { title: "核心产品线 C", desc: "强化效率、稳定性与持续迭代空间。" },
          { title: "定制化解决方案", desc: "可按业务目标组合能力与实施节奏。" },
        ],
        productLabel: "产品",
        customizable: "支持按业务场景定制参数与配置。",
        leadCapture: "线索收集",
        placeholders: {
          name: "姓名",
          email: "邮箱",
          company: "公司名称",
          country: "所在地区",
          requirement: "请描述您的业务需求...",
        },
        cta: "立即咨询",
        whatsapp: "WhatsApp",
        link: "链接",
        socialTitle: "被重视交付质量与效率的团队持续采用",
        trustLabel: "行业信赖",
        fallbackLogos: ["消费电子", "企业服务", "工业应用", "医疗健康", "新能源", "智能硬件"],
        fallbackTestimonials: [
          {
            name: "生产负责人",
            role: "项目负责人",
            quote: "上线后交付节奏明显更稳，跨团队协作效率也同步提升。",
          },
          {
            name: "运营经理",
            role: "企业客户",
            quote: "方案落地后周期缩短，关键节点可视化让决策更快。",
          },
        ],
        brandLabel: "品牌",
        clientLabel: "客户",
        defaultQuote: "该模块为安全兜底内容，可在编辑器内继续替换为正式文案。",
      }
    : {
        fallbackCatalog: [
          { title: "Core Product Line A", desc: "Reliable capability and scalable configuration for key scenarios." },
          { title: "Core Product Line B", desc: "Supports parameterized selection and fast standardized rollout." },
          { title: "Core Product Line C", desc: "Built for efficiency, stability, and iterative optimization." },
          { title: "Custom Solution Program", desc: "Combines capabilities around business goals and milestones." },
        ],
        productLabel: "Product",
        customizable: "Customizable specs are available for your business scenario.",
        leadCapture: "Lead Capture",
        placeholders: {
          name: "Name",
          email: "Work Email",
          company: "Company",
          country: "Country",
          requirement: "Tell us your business requirements...",
        },
        cta: "Contact Sales",
        whatsapp: "WhatsApp",
        link: "Link",
        socialTitle: "Trusted by teams that care about delivery quality and speed",
        trustLabel: "Industry trust",
        fallbackLogos: ["Consumer Tech", "Enterprise SaaS", "Industrial", "Healthcare", "Energy", "Smart Devices"],
        fallbackTestimonials: [
          {
            name: "Program Director",
            role: "Enterprise Client",
            quote: "The rollout became more predictable and cross-team delivery improved quickly.",
          },
          {
            name: "Plant Manager",
            role: "Operations Team",
            quote: "Implementation support reduced cycle time while keeping quality standards consistent.",
          },
        ],
        brandLabel: "Brand",
        clientLabel: "Client",
        defaultQuote: "Trusted by teams that expect premium execution and clear outcomes.",
      };
  const resolvedCtaLabel =
    typeof ctaLabel === "string" && ctaLabel.trim() ? ctaLabel : localeCopy.cta;
  const catalogItems = safeItems.length
    ? safeItems.slice(0, 8)
    : localeCopy.fallbackCatalog;

  if (variant === "catalog") {
    return (
      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
            {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {catalogItems.map((item, index) => (
              <Card key={index} className="border-border/70 bg-background/70">
                <CardHeader>
                  <CardTitle className="text-base">{item.title || localeCopy.productLabel}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.desc || localeCopy.customizable}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "contact") {
    return (
      <section id="contact" className="py-20">
        <div className="mx-auto w-full max-w-4xl px-6">
          <Card className="border-border/70 bg-background/80">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">{localeCopy.leadCapture}</Badge>
              <CardTitle className="text-2xl">{title}</CardTitle>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input placeholder={localeCopy.placeholders.name} />
                <Input placeholder={localeCopy.placeholders.email} />
                <Input placeholder={localeCopy.placeholders.company} />
                <Input placeholder={localeCopy.placeholders.country} />
              </div>
              <Textarea placeholder={localeCopy.placeholders.requirement} rows={5} />
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={ctaHref}>{resolvedCtaLabel}</a>
                </Button>
                {whatsapp ? (
                  <Button asChild variant="secondary" size="lg">
                    <a href={whatsapp.startsWith("http") ? whatsapp : \`https://wa.me/\${String(whatsapp).replace(/[^0-9]/g, "")}\`}>{localeCopy.whatsapp}</a>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (variant === "cta") {
    const normalizedStyle = ["auto", "surface", "contrast"].includes(String(ctaStyle))
      ? String(ctaStyle)
      : "auto";
    const hasSecondary = Boolean(
      typeof secondaryCtaLabel === "string" &&
        secondaryCtaLabel.trim() &&
        typeof secondaryCtaHref === "string" &&
        secondaryCtaHref.trim()
    );
    const hasMeta = Boolean((typeof legal === "string" && legal.trim()) || safeFooterLinks.length);
    const sectionToneClass =
      normalizedStyle === "contrast"
        ? "bg-foreground text-background"
        : normalizedStyle === "surface"
          ? "bg-muted/40 text-foreground"
          : "bg-background text-foreground";
    const primaryBtnClass =
      normalizedStyle === "contrast"
        ? "rounded-full bg-background text-foreground hover:bg-background/90 px-8"
        : "rounded-full px-8";
    const secondaryBtnClass =
      normalizedStyle === "contrast"
        ? "rounded-full border-background/40 text-background hover:bg-background hover:text-foreground px-8"
        : "rounded-full px-8";

    return (
      <section id={anchor} className={\`\${sectionToneClass} py-20 md:py-24 lg:py-28\`}>
        <div className="mx-auto w-full max-w-[1200px] px-6 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-tight">{title}</h2>
            {subtitle ? (
              <p className={\`mx-auto max-w-2xl text-sm md:text-base \${normalizedStyle === "contrast" ? "text-background/75" : "text-muted-foreground"}\`}>
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className={\`flex flex-col items-center justify-center gap-3 \${hasSecondary ? "sm:flex-row" : ""}\`}>
            <Button asChild size="lg" className={primaryBtnClass}>
              <a href={ctaHref}>{resolvedCtaLabel}</a>
            </Button>
            {hasSecondary ? (
              <Button asChild size="lg" variant="outline" className={secondaryBtnClass}>
                <a href={secondaryCtaHref}>{secondaryCtaLabel}</a>
              </Button>
            ) : null}
          </div>
          {hasMeta ? (
            <div className={\`pt-8 border-t flex flex-col gap-4 text-xs md:flex-row md:items-center md:justify-between \${normalizedStyle === "contrast" ? "border-background/15 text-background/60" : "border-border text-muted-foreground"}\`}>
              <span>{legal}</span>
              {safeFooterLinks.length ? (
                <div className="flex items-center justify-center gap-4 md:justify-end">
                  {safeFooterLinks.map((item, index) => (
                    <a
                      key={index}
                      href={item?.href || "#"}
                      className={\`transition-colors \${normalizedStyle === "contrast" ? "hover:text-background" : "hover:text-foreground"}\`}
                    >
                      {item?.label || localeCopy.link}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (variant === "socialProof") {
    const fallbackLogos = safeLogos.length
      ? safeLogos
      : localeCopy.fallbackLogos;
    const fallbackTestimonials = safeTestimonials.length
      ? safeTestimonials
      : localeCopy.fallbackTestimonials;
    return (
      <section id={anchor} className="py-20 bg-muted/30">
        <div className="mx-auto w-full max-w-[1200px] px-6 space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{localeCopy.trustLabel}</p>
            <h2 className="font-heading text-3xl md:text-4xl tracking-tight">{title || localeCopy.socialTitle}</h2>
            {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-6">
            {fallbackLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center rounded-md border border-border/50 bg-background/60 px-4 py-3 text-sm text-muted-foreground"
              >
                {typeof logo === "string" ? logo : logo?.name || localeCopy.brandLabel}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fallbackTestimonials.map((item, index) => (
              <Card key={index} className="border-border/60 bg-background/80">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">{item?.name || localeCopy.clientLabel}</CardTitle>
                  <p className="text-xs text-muted-foreground">{item?.role || localeCopy.clientLabel}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item?.quote || localeCopy.defaultQuote}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="mx-auto w-full max-w-5xl px-6">
        <Card className="border-border/70 bg-background/70">
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
            <Button asChild>
              <a href={ctaHref}>{resolvedCtaLabel}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
`;
const navbarComponentName = "Navbar";
const navbarComponentCode = `import * as React from "react";
import { NavbarBlock } from "@/components/blocks/navbar/block";

export const config = {
  fields: {
    variant: { type: "select", options: ["simple", "withDropdown", "withCTA"] },
    sticky: { type: "boolean" },
    paddingY: { type: "select", options: ["sm", "md", "lg"] },
    background: { type: "select", options: ["none", "muted", "gradient", "image"] },
    maxWidth: { type: "select", options: ["lg", "xl", "2xl"] }
  }
};

export default function Navbar(props) {
  return <NavbarBlock {...props} />;
}
`;
const footerFallbackComponentName = "CreationFooterFallback";
const footerFallbackComponentCode = `import * as React from "react";

export const config = {
  fields: {
    logoText: { type: "text" },
    legal: { type: "text" },
    columns: {
      type: "array",
      arrayFields: {
        title: { type: "text" }
      }
    }
  },
  defaultProps: {
    logoText: "Company",
    legal: "",
    columns: []
  }
};

export default function CreationFooterFallback(props) {
  const {
    anchor = "footer",
    logoText = "Company",
    legal = "",
    columns = []
  } = props || {};
  const useChinese = /[\\u3400-\\u9fff]/.test(\`\${logoText || ""} \${legal || ""}\`);
  const fallbackColumns = useChinese
    ? [
        {
          title: "产品与方案",
          links: [{ label: "产品中心", href: "/products" }, { label: "解决方案", href: "/solutions" }]
        },
        {
          title: "服务支持",
          links: [{ label: "联系我们", href: "/contact" }, { label: "应用案例", href: "/cases" }]
        },
        {
          title: "法务信息",
          links: [{ label: "隐私政策", href: "/privacy" }]
        }
      ]
    : [
        {
          title: "Products",
          links: [{ label: "Catalog", href: "/products" }, { label: "Solutions", href: "/solutions" }]
        },
        {
          title: "Support",
          links: [{ label: "Contact", href: "/contact" }, { label: "Cases", href: "/cases" }]
        },
        {
          title: "Legal",
          links: [{ label: "Privacy", href: "/privacy" }]
        }
      ];
  const safeColumns = (Array.isArray(columns) && columns.length ? columns : fallbackColumns).slice(0, 4);
  const fallbackLogoText = useChinese ? "公司" : "Company";
  const fallbackLinksTitle = useChinese ? "链接" : "Links";
  const fallbackLinkLabel = useChinese ? "链接" : "Link";
  const resolvedLegal =
    typeof legal === "string" && legal.trim() ? legal : useChinese ? \`© \${new Date().getFullYear()} 保留所有权利\` : \`© \${new Date().getFullYear()} All rights reserved.\`;

  return (
    <footer id={anchor} className="border-t border-border bg-background py-12">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="text-base font-semibold">{logoText || fallbackLogoText}</div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-8 md:grid-cols-3">
            {safeColumns.map((col, index) => (
              <div key={\`${'${index}'}-\${col?.title || "col"}\`}>
                <div className="text-sm font-medium">{col?.title || fallbackLinksTitle}</div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(Array.isArray(col?.links) ? col.links : []).slice(0, 10).map((link, linkIndex) => (
                    <li key={\`${'${index}'}-\${linkIndex}\`}>
                      <a href={link?.href || "#"} className="hover:text-foreground transition-colors">
                        {link?.label || fallbackLinkLabel}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">{resolvedLegal}</div>
      </div>
    </footer>
  );
}
`;

const extractText = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) {
        return String((part as { text?: unknown }).text ?? "");
      }
      return "";
    })
    .join("");
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const clampPositiveInt = (value: number, fallback: number, min = 1, max = 100) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(value)));
};

const detectReferenceProfile = (prompt: string): ReferenceProfile => {
  const normalized = String(prompt ?? "").toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("analogue.co") || normalized.includes("analogue pocket")) return "analogue";
  if (normalized.includes("breton.it") || /\bbreton\b/.test(normalized)) {
    return "breton";
  }
  return null;
};

const skillCache = new Map<string, string>();
const designSystemCache = new Map<string, DesignSystemContext>();
const maxDesignSystemChars = Number(process.env.DESIGN_SYSTEM_PROMPT_MAX_CHARS || 6000);
const compactDesignSystemMasterChars = Number(
  process.env.DESIGN_SYSTEM_PROMPT_COMPACT_MASTER_MAX_CHARS || 1600
);
const compactDesignSystemPageChars = Number(
  process.env.DESIGN_SYSTEM_PROMPT_COMPACT_PAGE_MAX_CHARS || 1000
);

const skillRoots = () => {
  const cwd = process.cwd();
  return [
    path.resolve(cwd, "skills"),
    path.resolve(cwd, "..", "skills"),
  ];
};

const skillNamesForStage = (stage: "architect" | "builder") => {
  if (stage === "architect") {
    return [
      "website-generation-workflow",
      "design-system-enforcement",
      "content-quality-guidelines",
      "ui-ux-pro-max",
    ];
  }
  return [
    "design-system-enforcement",
    "responsive-by-default",
    "section-quality-checklist",
    "visual-qa-mandatory",
    "content-quality-guidelines",
    "end-to-end-validation",
    "ui-ux-pro-max",
  ];
};

const loadSkillContent = async (name: string) => {
  const cached = skillCache.get(name);
  if (cached) return cached;
  for (const root of skillRoots()) {
    const filePath = path.join(root, name, "SKILL.md");
    try {
      const content = await fs.readFile(filePath, "utf-8");
      if (content.trim()) {
        skillCache.set(name, content.trim());
        return content.trim();
      }
    } catch (error) {
      continue;
    }
  }
  return "";
};

const loadSkillsForStage = async (stage: "architect" | "builder") => {
  const entries: SkillEntry[] = [];
  for (const name of skillNamesForStage(stage)) {
    const content = await loadSkillContent(name);
    if (content) entries.push({ name, content });
  }
  return entries;
};

const buildSkillContext = (entries: SkillEntry[]) => {
  if (!entries.length) return "";
  return [
    "# Skills Context",
    ...entries.map((entry) => `## ${entry.name}\n${entry.content}`),
  ].join("\n\n");
};

const loadSkillContext = async (): Promise<SkillContext> => {
  const [architect, builder] = await Promise.all([
    loadSkillsForStage("architect"),
    loadSkillsForStage("builder"),
  ]);
  return {
    architect: buildSkillContext(architect),
    builder: buildSkillContext(builder),
  };
};

const applySkillContext = (system: string, context: string) =>
  context ? `${system}\n\n${context}` : system;

const designSystemRoots = () => {
  const cwd = process.cwd();
  return [
    path.resolve(cwd, "design-system"),
    path.resolve(cwd, "..", "design-system"),
  ];
};

const truncateForPrompt = (value: string, maxChars = maxDesignSystemChars) => {
  const text = value.trim();
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 40))}\n\n[truncated-for-prompt]`;
};

const readFileIfExists = async (filePath: string) => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content.trim();
  } catch (_error) {
    return "";
  }
};

const pageOverrideKeys = (pagePath?: string, pageName?: string) => {
  const keys = new Set<string>();
  const safePagePath = typeof pagePath === "string" ? pagePath : "";
  const safePageName = typeof pageName === "string" ? pageName : "";

  const normalizedPath = safePagePath
    .split(/[?#]/)[0]
    .replace(/^\/+|\/+$/g, "");

  if (!normalizedPath) {
    keys.add("home");
    keys.add("index");
    keys.add("root");
    keys.add("landing");
  } else {
    keys.add(normalizeKey(normalizedPath));
    keys.add(normalizeKey(normalizedPath.replace(/\//g, "-")));
  }

  if (safePageName.trim()) {
    keys.add(normalizeKey(safePageName));
  }

  return Array.from(keys).filter(Boolean);
};

const loadDesignSystemContext = async (): Promise<DesignSystemContext> => {
  const roots = designSystemRoots();
  const cacheKey = roots.join("|");
  const cached = designSystemCache.get(cacheKey);
  if (cached) return cached;

  let master = "";
  for (const root of roots) {
    master = await readFileIfExists(path.join(root, "MASTER.md"));
    if (master) break;
  }

  const pages: Record<string, string> = {};
  for (const root of roots) {
    const pagesDir = path.join(root, "pages");
    try {
      const entries = await fs.readdir(pagesDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".md")) continue;
        const key = normalizeKey(entry.name.replace(/\.md$/i, ""));
        if (!key || pages[key]) continue;
        const content = await readFileIfExists(path.join(pagesDir, entry.name));
        if (content) pages[key] = content;
      }
    } catch (_error) {
      continue;
    }
  }

  const context: DesignSystemContext = { master, pages };
  designSystemCache.set(cacheKey, context);
  return context;
};

const buildDesignSystemPromptContext = (
  context: DesignSystemContext | undefined,
  options?: { pagePath?: string; pageName?: string; compact?: boolean }
) => {
  if (!context) return "";

  const compact = Boolean(options?.compact);
  const master = truncateForPrompt(
    context.master,
    compact ? compactDesignSystemMasterChars : maxDesignSystemChars
  );
  const keys = pageOverrideKeys(options?.pagePath, options?.pageName);
  const pageOverride = keys.map((key) => context.pages[key]).find(Boolean) ?? "";
  const pageText = truncateForPrompt(
    pageOverride,
    compact ? compactDesignSystemPageChars : maxDesignSystemChars
  );

  if (!master && !pageText) return "";
  const lines: string[] = [];
  lines.push("# Project Design System (必须优先遵守)");
  if (master) {
    lines.push("## MASTER");
    lines.push(master);
  }
  if (pageText) {
    lines.push("## PAGE_OVERRIDE");
    lines.push(pageText);
  }
  lines.push("## RULE");
  lines.push("若 PAGE_OVERRIDE 与 MASTER 冲突，以 PAGE_OVERRIDE 为准。");
  return lines.join("\n");
};

const buildSectionKey = (context: SectionContext) =>
  `${context.pagePath}:${context.section.id}:${context.sectionIndex}`;

const isBreakoutSection = (
  section: ArchitectSection,
  themeContract?: ThemeContract
) => {
  const allowed = themeContract?.breakoutBudget?.allowedSections ?? [];
  if (!allowed.length) return false;
  const id = typeof section.id === "string" ? normalizeKey(section.id) : "";
  const type = typeof section.type === "string" ? normalizeKey(section.type) : "";
  return allowed.some((entry) => {
    const token = normalizeKey(String(entry));
    return (id && id.includes(token)) || (type && type.includes(token));
  });
};
const compositionPresets: Record<string, CompositionPreset> = {
  H01: {
    id: "H01",
    name: "Hero split showcase",
    sectionTypes: ["Hero", "PageHero", "PageHeader"],
    layout: { structure: "dual", density: "spacious", align: "center", media: "image-right" },
    requiredClasses: ["xl:grid-cols-12"],
    notes: ["Split content + visual, strong headline"],
  },
  H02: {
    id: "H02",
    name: "Hero image-led",
    sectionTypes: ["Hero", "PageHero"],
    layout: { structure: "single", density: "spacious", align: "center", media: "background" },
  },
  H03: {
    id: "H03",
    name: "Hero centered",
    sectionTypes: ["Hero"],
    layout: { structure: "single", density: "spacious", align: "center", media: "none" },
  },
  F01: {
    id: "F01",
    name: "Features 3-up cards",
    sectionTypes: ["Features"],
    layout: { structure: "triple", density: "normal", align: "start", list: "cards" },
    requiredClasses: ["grid"],
  },
  F02: {
    id: "F02",
    name: "Features bento grid",
    sectionTypes: ["Features", "CoreValues", "ValueProps"],
    layout: { structure: "triple", density: "spacious", align: "start", list: "tiles" },
    requiredClasses: ["grid", "auto-rows-", "grid-flow-dense"],
  },
  F03: {
    id: "F03",
    name: "Features icon list",
    sectionTypes: ["Features", "Benefits"],
    layout: { structure: "single", density: "normal", align: "start", list: "rows" },
    requiredClasses: ["space-y-4"],
  },
  G01: {
    id: "G01",
    name: "Gallery masonry",
    sectionTypes: ["Gallery", "Showcase", "ImageGallery", "ProductShowcase"],
    layout: { structure: "triple", density: "compact", align: "start", list: "tiles" },
    requiredClasses: ["grid", "auto-rows-", "grid-flow-dense"],
  },
  G02: {
    id: "G02",
    name: "Gallery carousel",
    sectionTypes: ["Gallery", "Showcase", "ImageGallery", "ProductShowcase"],
    layout: { structure: "single", density: "normal", align: "center" },
  },
  G03: {
    id: "G03",
    name: "Gallery stacked",
    sectionTypes: ["Gallery", "Showcase", "ImageGallery", "ProductShowcase"],
    layout: { structure: "single", density: "normal", align: "start", list: "rows" },
    requiredClasses: ["space-y-4"],
  },
  S01: {
    id: "S01",
    name: "Specs two-col table",
    sectionTypes: ["Specs", "SpecsTable", "TechnicalSpecs"],
    layout: { structure: "dual", density: "compact", align: "start", list: "rows" },
    requiredClasses: ["xl:grid-cols-12"],
  },
  S02: {
    id: "S02",
    name: "Specs row cards",
    sectionTypes: ["Specs", "SpecsTable"],
    layout: { structure: "single", density: "normal", align: "start", list: "rows" },
    requiredClasses: ["space-y-4"],
  },
  CP01: {
    id: "CP01",
    name: "Comparison table",
    sectionTypes: ["ProductComparison", "Comparison"],
    layout: { structure: "single", density: "compact", align: "start", list: "rows" },
    requiredClasses: ["grid"],
  },
  P01: {
    id: "P01",
    name: "Product catalog grid",
    sectionTypes: ["ProductCatalog", "ProductGrid", "Products"],
    layout: { structure: "triple", density: "normal", align: "start", list: "cards" },
    requiredClasses: ["grid"],
  },
  P02: {
    id: "P02",
    name: "Filter + grid",
    sectionTypes: ["ProductFilters", "ProductCatalog"],
    layout: { structure: "split", density: "normal", align: "start", list: "cards" },
    requiredClasses: ["xl:grid-cols-12"],
  },
  P03: {
    id: "P03",
    name: "Bundle grid",
    sectionTypes: ["BundleGrid", "ProductBundles"],
    layout: { structure: "triple", density: "normal", align: "start", list: "tiles" },
    requiredClasses: ["grid"],
  },
  L01: {
    id: "L01",
    name: "Logo marquee",
    sectionTypes: ["LogoBanner", "TrustBadges", "Trust", "TrustLogos"],
    layout: { structure: "single", density: "compact", align: "center" },
  },
  L02: {
    id: "L02",
    name: "Badge grid",
    sectionTypes: ["LogoBanner", "TrustBadges", "Trust", "TrustLogos"],
    layout: { structure: "triple", density: "compact", align: "center", list: "tiles" },
    requiredClasses: ["grid"],
  },
  ST01: {
    id: "ST01",
    name: "Stat tiles",
    sectionTypes: ["Stats"],
    layout: { structure: "triple", density: "compact", align: "center", list: "tiles" },
    requiredClasses: ["grid"],
  },
  ST02: {
    id: "ST02",
    name: "Stat strip",
    sectionTypes: ["Stats"],
    layout: { structure: "single", density: "compact", align: "center" },
    requiredClasses: ["grid"],
  },
  TL01: {
    id: "TL01",
    name: "Timeline horizontal",
    sectionTypes: ["Timeline"],
    layout: { structure: "single", density: "compact", align: "start", list: "rows" },
    requiredClasses: ["grid"],
  },
  PR01: {
    id: "PR01",
    name: "Process vertical",
    sectionTypes: ["Process", "Steps"],
    layout: { structure: "single", density: "normal", align: "start", list: "rows" },
    requiredClasses: ["space-y-4"],
  },
  T01: {
    id: "T01",
    name: "Testimonial carousel",
    sectionTypes: ["Testimonials"],
    layout: { structure: "single", density: "normal", align: "center" },
  },
  T02: {
    id: "T02",
    name: "Testimonial grid",
    sectionTypes: ["Testimonials"],
    layout: { structure: "triple", density: "normal", align: "start", list: "cards" },
    requiredClasses: ["grid"],
  },
  PRC01: {
    id: "PRC01",
    name: "Pricing 3-tier",
    sectionTypes: ["Pricing"],
    layout: { structure: "triple", density: "normal", align: "start", list: "cards" },
    requiredClasses: ["grid"],
  },
  C01: {
    id: "C01",
    name: "CTA split form",
    sectionTypes: ["CTA", "LeadCapture", "ContactCTA"],
    layout: { structure: "split", density: "spacious", align: "center", media: "image-right" },
    requiredClasses: ["xl:grid-cols-12"],
  },
  C02: {
    id: "C02",
    name: "CTA centered banner",
    sectionTypes: ["CTA", "Content"],
    layout: { structure: "single", density: "spacious", align: "center" },
    requiredClasses: ["text-center"],
  },
  CN01: {
    id: "CN01",
    name: "Content centered",
    sectionTypes: ["Content", "StudioStory", "ContentPhilosophy", "EditorialStory"],
    layout: { structure: "single", density: "spacious", align: "center", list: "rows" },
    requiredClasses: ["min-h-"],
  },
  CN02: {
    id: "CN02",
    name: "Content split",
    sectionTypes: ["Content", "StudioStory", "ContentPhilosophy", "EditorialStory"],
    layout: { structure: "dual", density: "spacious", align: "start", media: "image-right" },
  },
  C03: {
    id: "C03",
    name: "CTA image + form",
    sectionTypes: ["CTA", "LeadCapture"],
    layout: { structure: "dual", density: "spacious", align: "center", media: "image-left" },
    requiredClasses: ["xl:grid-cols-12"],
  },
  Q01: {
    id: "Q01",
    name: "FAQ accordion",
    sectionTypes: ["FAQ"],
    layout: { structure: "single", density: "normal", align: "start", list: "rows" },
    requiredClasses: ["space-y-4"],
  },
  Q02: {
    id: "Q02",
    name: "FAQ two-column",
    sectionTypes: ["FAQ"],
    layout: { structure: "dual", density: "normal", align: "start", list: "rows" },
    requiredClasses: ["xl:grid-cols-12"],
  },
  TM01: {
    id: "TM01",
    name: "Team profile grid",
    sectionTypes: ["Team"],
    layout: { structure: "triple", density: "normal", align: "start", list: "cards" },
    requiredClasses: ["grid"],
  },
  B01: {
    id: "B01",
    name: "Blog cards",
    sectionTypes: ["Blog", "News"],
    layout: { structure: "triple", density: "normal", align: "start", list: "cards" },
    requiredClasses: ["grid"],
  },
  IN01: {
    id: "IN01",
    name: "Integrations grid + steps",
    sectionTypes: ["Integrations"],
    layout: { structure: "dual", density: "normal", align: "start", list: "tiles" },
    requiredClasses: ["xl:grid-cols-12"],
  },
  CS01: {
    id: "CS01",
    name: "Case study split",
    sectionTypes: ["CaseStudy", "Case"],
    layout: { structure: "dual", density: "spacious", align: "start", media: "image-right" },
    requiredClasses: ["xl:grid-cols-12"],
  },
  CT01: {
    id: "CT01",
    name: "Contact form + info",
    sectionTypes: ["Contact", "ContactInfo"],
    layout: { structure: "dual", density: "normal", align: "start" },
    requiredClasses: ["xl:grid-cols-12"],
  },
  MP01: {
    id: "MP01",
    name: "Map + details",
    sectionTypes: ["Map"],
    layout: { structure: "dual", density: "normal", align: "start", media: "image-right" },
    requiredClasses: ["xl:grid-cols-12"],
  },
  FRM01: {
    id: "FRM01",
    name: "Detailed form",
    sectionTypes: ["Form", "ContactForm", "InquiryForm"],
    layout: { structure: "single", density: "normal", align: "start", list: "rows" },
    requiredClasses: ["space-y-4"],
  },
  FT01: {
    id: "FT01",
    name: "Footer columns",
    sectionTypes: ["Footer"],
    layout: { structure: "dual", density: "compact", align: "start", list: "rows" },
  },
};

const compositionPresetIds = Object.keys(compositionPresets);

const matchPresetForSection = (sectionType: string) => {
  const normalized = sectionType.toLowerCase();
  const rules: Array<[RegExp, string]> = [
    [/hero|pagehero|pageheader/, "H01"],
    [/features|benefits/, "F01"],
    [/gallery|showcase|marquee/, "G01"],
    [/specs|specification|technical/, "S01"],
    [/comparison|compare/, "CP01"],
    [/catalog|product|products|grid|bundle/, "P01"],
    [/trust|logo|badge/, "L01"],
    [/stat|metric|numbers/, "ST01"],
    [/timeline|process|step/, "PR01"],
    [/testimonial|review/, "T01"],
    [/pricing|plan/, "PRC01"],
    [/cta|lead|capture/, "C01"],
    [/content|philosophy|story/, "CN01"],
    [/faq|question/, "Q01"],
    [/team/, "TM01"],
    [/blog|news|article/, "B01"],
    [/integration/, "IN01"],
    [/case/, "CS01"],
    [/contact/, "CT01"],
    [/map/, "MP01"],
    [/form|inquiry/, "FRM01"],
    [/footer/, "FT01"],
  ];
  for (const [pattern, id] of rules) {
    if (pattern.test(normalized)) return id;
  }
  return "F01";
};

const resolveCompositionPresetId = (sectionType: string, preset?: string) => {
  if (preset && compositionPresets[preset]) {
    const allowed = compositionPresets[preset].sectionTypes ?? [];
    if (!allowed.length) return preset;
    const normalizedType = sectionType.toLowerCase();
    const ok = allowed.some((type) => normalizedType.includes(type.toLowerCase()));
    if (ok) return preset;
  }
  return matchPresetForSection(sectionType);
};

const upgradeShowcasePreset = (
  sectionType: string,
  sectionId: string,
  intent: string,
  presetId: string
) => {
  const type = sectionType.toLowerCase();
  if (presetId !== "G03") return presetId;
  if (!/(showcase|gallery|imagegallery|productshowcase)/i.test(type)) return presetId;
  const context = `${sectionId} ${intent}`.toLowerCase();
  if (/(scene|scenes|scenario|scenarios|lifestyle|moment|switcher|tab|tabs|carousel)/i.test(context)) {
    return "G02";
  }
  if (/(experience|immersive)/i.test(context)) return "G01";
  return presetId;
};

const applyCompositionDefaults = (
  layoutHint: ArchitectSection["layoutHint"] | undefined,
  preset?: CompositionPreset,
  sectionType?: string
): ArchitectSection["layoutHint"] | undefined => {
  if (!preset) return layoutHint;
  const base = layoutHint ?? {};
  let effectivePreset = preset;
  if (sectionType?.toLowerCase() === "content" && base.media && base.media !== "none") {
    const splitPreset = compositionPresets.CN02;
    if (splitPreset) effectivePreset = splitPreset;
  }
  const presetLayout = effectivePreset.layout ?? {};
  const forcePresetLayout = Boolean(base.compositionPreset);
  const alignLocked = Boolean(base.alignLocked);
  const resolvedAlign = alignLocked
    ? base.align ?? presetLayout.align
    : forcePresetLayout
      ? presetLayout.align
      : base.align ?? presetLayout.align;
  return {
    structure: forcePresetLayout ? presetLayout.structure : base.structure ?? presetLayout.structure,
    density: forcePresetLayout ? presetLayout.density : base.density ?? presetLayout.density,
    align: resolvedAlign,
    alignLocked,
    media: forcePresetLayout ? presetLayout.media : base.media ?? presetLayout.media,
    list: forcePresetLayout ? presetLayout.list : base.list ?? presetLayout.list,
    compositionPreset: effectivePreset.id,
  };
};

const getCompositionPresetRules = (
  sectionType: string,
  preset?: string
): CompositionPreset | undefined => {
  const resolved = resolveCompositionPresetId(sectionType, preset);
  return compositionPresets[resolved];
};

const normalizeLayoutHint = (
  hint: ArchitectSection["layoutHint"] | undefined
): ArchitectSection["layoutHint"] | undefined => {
  if (!hint || typeof hint !== "object") return undefined;
  const structureMap: Record<string, ArchitectSection["layoutHint"]["structure"]> = {
    single: "single",
    dual: "dual",
    triple: "triple",
    split: "split",
    grid: "single",
    bento: "single",
    "single-column": "single",
    singlecolumn: "single",
    "full-screen": "single",
    fullscreen: "single",
    "full-bleed": "single",
    "full-screen-hero": "single",
    "masonry-grid": "triple",
    masonry: "triple",
    "bento-grid": "triple",
    "comparison-grid": "triple",
    "table-grid": "dual",
    timeline: "single",
    "horizontal-scroll": "single",
    carousel: "single",
    "asymmetric-grid": "split",
    "two-column": "dual",
    "three-column": "triple",
    "four-column": "triple",
    columns: "triple",
    stacked: "single",
    list: "single",
    rows: "single",
    "card-grid": "triple",
    "tile-grid": "triple",
    "feature-grid": "triple",
    "logo-grid": "triple",
    "comparison-table": "dual",
    "specs-table": "dual",
    "table": "dual",
    "split-left": "split",
    "split-right": "split",
    "media-left": "split",
    "media-right": "split",
    "image-left": "split",
    "image-right": "split",
  };
  const densityMap: Record<string, ArchitectSection["layoutHint"]["density"]> = {
    compact: "compact",
    normal: "normal",
    spacious: "spacious",
    balanced: "normal",
    tight: "compact",
    loose: "spacious",
    airy: "spacious",
    dense: "compact",
    roomy: "spacious",
    "space-y": "normal",
  };
  const alignMap: Record<string, ArchitectSection["layoutHint"]["align"]> = {
    start: "start",
    center: "center",
    left: "start",
    right: "start",
    "bottom-left": "start",
    "top-left": "start",
    "bottom-right": "start",
    bottom: "center",
    top: "center",
    "center-left": "start",
    "center-right": "start",
    "text-left": "start",
    "text-center": "center",
  };
  const mediaMap: Record<string, ArchitectSection["layoutHint"]["media"]> = {
    none: "none",
    "image-left": "image-left",
    "image-right": "image-right",
    background: "background",
    "image-dominant": "image-right",
    "background-image": "background",
    "image-grid": "image-right",
    "image-only": "image-right",
    "image-top": "image-right",
    "image-bottom": "image-right",
    "mixed-sizes": "image-right",
    "media-left": "image-left",
    "media-right": "image-right",
    video: "image-right",
    image: "image-right",
    hero: "background",
    "hero-bg": "background",
    "full-bleed-image": "background",
    "full-bleed": "background",
    "split-media": "image-right",
    "split-image": "image-right",
    "split-video": "image-right",
    "image-center": "image-right",
    "gallery": "image-right",
    "media": "image-right",
  };
  const listMap: Record<string, ArchitectSection["layoutHint"]["list"] | undefined> = {
    cards: "cards",
    tiles: "tiles",
    rows: "rows",
    bento: "tiles",
    table: "rows",
    "bento-cards": "tiles",
    "vertical-cards": "cards",
    "table-rows": "rows",
    carousel: "tiles",
    "horizontal-scroll": "tiles",
    staggered: "tiles",
    masonry: "tiles",
    grid: "cards",
    "card-grid": "cards",
    "tile-grid": "tiles",
    "feature-list": "rows",
    "icon-list": "rows",
    "stat-strip": "rows",
    "timeline": "rows",
    "steps": "rows",
    "comparison": "rows",
    "specs": "rows",
    none: undefined,
  };
  const structureRaw = (hint as any).structure;
  const densityRaw = (hint as any).density;
  const alignRaw = (hint as any).align;
  const mediaRaw = (hint as any).media;
  const listRaw = (hint as any).list;
  const presetRaw = (hint as any).compositionPreset;
  const normalized: ArchitectSection["layoutHint"] = {
    structure: structureMap[String(structureRaw ?? "")] ?? "single",
    density: densityMap[String(densityRaw ?? "")] ?? "normal",
    align: alignMap[String(alignRaw ?? "")] ?? "start",
    alignLocked: Boolean((hint as any).alignLocked),
    media: mediaMap[String(mediaRaw ?? "")] ?? "none",
  };
  const list = listMap[String(listRaw ?? "")];
  if (list) normalized.list = list;
  if (typeof presetRaw === "string") {
    normalized.compositionPreset = compositionPresetIds.includes(presetRaw) ? presetRaw : undefined;
  }
  return normalized;
};

const applySectionAlignOverrides = (
  pages: Array<{ path: string; name: string; sections: ArchitectSection[]; root?: ArchitectPage["root"] }>,
  themeContract?: ThemeContract
) => {
  const overrides = themeContract?.layoutRules?.sectionAlignOverrides;
  if (!overrides || typeof overrides !== "object") return pages;
  const normalizeAlignOverride = (value: unknown): "start" | "center" | undefined => {
    const token = String(value ?? "").trim().toLowerCase();
    if (!token) return undefined;
    if (token === "center" || token === "centre" || token === "middle") return "center";
    if (token === "start" || token === "left" || token === "right" || token === "leading") return "start";
    return undefined;
  };
  const normalizedOverrides = new Map<string, "start" | "center">();
  Object.entries(overrides).forEach(([key, value]) => {
    if (!key) return;
    const normalizedValue = normalizeAlignOverride(value);
    if (!normalizedValue) return;
    normalizedOverrides.set(key.toLowerCase(), normalizedValue);
  });
  if (!normalizedOverrides.size) return pages;
  return pages.map((page) => ({
    ...page,
    sections: page.sections.map((section) => {
      const idKey = section.id?.toLowerCase?.();
      const typeKey = section.type?.toLowerCase?.();
      const override =
        (idKey ? normalizedOverrides.get(idKey) : undefined) ??
        (typeKey ? normalizedOverrides.get(typeKey) : undefined);
      if (!override) return section;
      const layoutHint = { ...(section.layoutHint ?? {}) };
      layoutHint.align = override;
      layoutHint.alignLocked = true;
      return { ...section, layoutHint };
    }),
  }));
};

const normalizeSectionToken = (section: ArchitectSection | undefined) =>
  `${typeof section?.type === "string" ? section.type : ""} ${typeof section?.id === "string" ? section.id : ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const isFooterLikeSection = (section: ArchitectSection | undefined) => normalizeSectionToken(section).includes("footer");

const isCtaLikeSection = (section: ArchitectSection | undefined) => {
  const token = normalizeSectionToken(section);
  return token.includes("footercta") || token.includes("leadcapture") || token.includes("calltoaction") || token.includes("cta");
};

const hasFooterSection = (sections: ArchitectSection[]) => sections.some((section) => isFooterLikeSection(section));

const hasCtaSection = (sections: ArchitectSection[]) => sections.some((section) => isCtaLikeSection(section));

const hasContactSection = (sections: ArchitectSection[]) =>
  sections.some((section) => /(contact|inquiry|quote|leadcapture|咨询|联系|表单)/.test(normalizeSectionToken(section)));

const isGlobalChromeSection = (section: { id?: string; type?: string; intent?: string } | undefined) => {
  const token = `${section?.type ?? ""} ${section?.id ?? ""} ${section?.intent ?? ""}`.toLowerCase();
  return /(navigation|navbar|header|topnav|menu|footer|legal|copyright|bottom)/.test(token);
};

const normalizePages = (blueprint: ArchitectBlueprint | Record<string, unknown>) => {
  const normalizePathToken = (value: unknown) => {
    const raw = typeof value === "string" ? value.trim() : "";
    if (!raw) return "/";
    const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
    return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
  };
  const rawPages = Array.isArray((blueprint as ArchitectBlueprint)?.pages)
    ? ((blueprint as ArchitectBlueprint).pages as ArchitectPage[])
    : [];
  let injectedFooterCount = 0;
  const pages = rawPages.map((page, pageIndex) => {
    const path =
      typeof page?.path === "string" && page.path.trim()
        ? page.path
        : pageIndex === 0
          ? "/"
          : `/page-${pageIndex + 1}`;
    const name =
      typeof page?.name === "string" && page.name.trim()
        ? page.name
        : `Page ${pageIndex + 1}`;
    const rawSections = Array.isArray(page?.sections) ? page.sections : [];
    const sections = rawSections.map((section, sectionIndex) => {
      const type =
        typeof section?.type === "string" && section.type.trim()
          ? section.type
          : "Section";
      const idSeed =
        typeof section?.id === "string" && section.id.trim()
          ? section.id
          : `${name}-${type}-${sectionIndex + 1}`;
      const id = toSlug(idSeed) || `section-${pageIndex + 1}-${sectionIndex + 1}`;
      const intent = typeof section?.intent === "string" ? section.intent : "";
      const propsHints =
        section?.propsHints && typeof section.propsHints === "object" ? section.propsHints : undefined;
      const normalizedHint = normalizeLayoutHint(
        section?.layoutHint && typeof section.layoutHint === "object"
          ? (section.layoutHint as ArchitectSection["layoutHint"])
          : undefined
      );
      let presetId = resolveCompositionPresetId(type, normalizedHint?.compositionPreset);
      presetId = upgradeShowcasePreset(type, id, intent, presetId);
      const layoutHint = applyCompositionDefaults(
        normalizedHint,
        compositionPresets[presetId],
        type
      );
      return { id, type, intent, propsHints, layoutHint };
    });
    if (!hasFooterSection(sections)) {
      injectedFooterCount += 1;
      const footerSeed = toSlug(`${name}-footer`) || `footer-${pageIndex + 1}`;
      sections.push({
        id: footerSeed,
        type: "Footer",
        intent: "Global footer with links, contact, and legal information.",
        propsHints: {
          columns: ["Products", "Support", "Legal"],
          legal: `© ${new Date().getFullYear()} All rights reserved.`,
        },
        layoutHint: {
          structure: "dual",
          density: "compact",
          align: "start",
          media: "none",
          list: "rows",
          compositionPreset: "FT01",
        },
      });
    }
    const normalizedPath = normalizePathToken(path);
    if (normalizedPath === "/contact" && !hasContactSection(sections)) {
      const contactSeed = toSlug(`${name}-contact`) || `contact-${pageIndex + 1}`;
      const contactSection = {
        id: contactSeed,
        type: "Contact",
        intent: "Contact form with name, email, company, message, and clear conversion CTA.",
        propsHints: {
          formFields: ["name", "email", "company", "message"],
          primaryCta: "Contact Sales",
        },
        layoutHint: {
          structure: "dual" as const,
          density: "normal" as const,
          align: "start" as const,
          media: "none" as const,
          list: "rows" as const,
          compositionPreset: "CT01",
        },
      };
      const footerIndex = sections.findIndex((section) => isFooterLikeSection(section));
      if (footerIndex > 0) {
        sections.splice(footerIndex, 0, contactSection);
      } else {
        sections.push(contactSection);
      }
    }
    return { path, name, sections, root: page?.root };
  });
  const themeContract = (blueprint as ArchitectBlueprint)?.theme?.themeContract as ThemeContract | undefined;
  const alignedPages = applySectionAlignOverrides(pages, themeContract);
  const originalPageCount = alignedPages.length;
  const originalSectionsTotal = alignedPages.reduce((sum, page) => sum + page.sections.length, 0);
  const configuredMaxPages = clampPositiveInt(defaultMaxPages, 6, 1, 24);
  const enterprisePathSet = new Set(ENTERPRISE_SITE_PAGES.map((page) => normalizePathToken(page.path)));
  const enterprisePathHits = alignedPages.reduce((count, page) => {
    const path = normalizePathToken(page.path);
    return count + (enterprisePathSet.has(path) ? 1 : 0);
  }, 0);
  const enterpriseMinPages = enterprisePathHits >= 3 ? Math.min(24, ENTERPRISE_SITE_PAGES.length) : 0;
  const enterpriseMultiPageMode = enterpriseMinPages >= 5;
  const maxPages = enterpriseMinPages > 0 ? Math.max(configuredMaxPages, enterpriseMinPages) : configuredMaxPages;
  const configuredSectionsPerPage = clampPositiveInt(defaultMaxSectionsPerPage, 8, 1, 20);
  const configuredSectionsTotal = clampPositiveInt(defaultMaxSectionsTotal, 48, 1, 240);
  const enterpriseSectionsPerPage = clampPositiveInt(defaultEnterpriseMaxSectionsPerPage, 6, 1, 20);
  const enterpriseSectionsTotal = clampPositiveInt(defaultEnterpriseMaxSectionsTotal, 36, 1, 240);
  const maxSectionsPerPage = enterpriseMultiPageMode
    ? Math.min(configuredSectionsPerPage, enterpriseSectionsPerPage)
    : configuredSectionsPerPage;
  const maxSectionsTotal = enterpriseMultiPageMode
    ? Math.min(configuredSectionsTotal, enterpriseSectionsTotal)
    : configuredSectionsTotal;
  let totalSections = 0;
  const limitedPages = alignedPages.slice(0, maxPages).map((page, pageIndex) => {
    if (totalSections >= maxSectionsTotal) {
      return { ...page, sections: pageIndex === 0 ? page.sections.slice(0, 1) : [] };
    }
    const budgetLeft = maxSectionsTotal - totalSections;
    const keepCount = Math.max(
      1,
      Math.min(page.sections.length, maxSectionsPerPage, budgetLeft)
    );
    const nextSections = page.sections.slice(0, keepCount);
    if (keepCount > 1 && hasFooterSection(page.sections) && !hasFooterSection(nextSections)) {
      const footerSection = [...page.sections].reverse().find((section) => isFooterLikeSection(section));
      if (footerSection) {
        nextSections[nextSections.length - 1] = footerSection;
      }
    }
    if (keepCount > 1 && hasCtaSection(page.sections) && !hasCtaSection(nextSections)) {
      const ctaSection = [...page.sections].reverse().find((section) => isCtaLikeSection(section));
      if (ctaSection) {
        const footerIndex = nextSections.findIndex((section) => isFooterLikeSection(section));
        const targetIndex = footerIndex > 0 ? footerIndex - 1 : nextSections.length - 1;
        nextSections[Math.max(0, targetIndex)] = ctaSection;
      }
    }
    totalSections += nextSections.length;
    return { ...page, sections: nextSections };
  });
  const limitedSectionsTotal = limitedPages.reduce((sum, page) => sum + page.sections.length, 0);
  if (originalPageCount !== limitedPages.length || originalSectionsTotal !== limitedSectionsTotal) {
    logWarn(`${logPrefix} blueprint:sections_limited`, {
      originalPages: originalPageCount,
      keptPages: limitedPages.length,
      originalSections: originalSectionsTotal,
      keptSections: limitedSectionsTotal,
      configuredMaxPages,
      enterpriseMinPages,
      maxPages,
      maxSectionsPerPage,
      maxSectionsTotal,
    });
  }
  if (injectedFooterCount > 0) {
    logInfo(`${logPrefix} blueprint:footer_injected`, {
      pages: injectedFooterCount,
      reason: "missing_footer_section",
    });
  }
  const seenPaths = new Set<string>();
  const dedupedPages = limitedPages
    .map((page, pageIndex) => {
      const normalizedPath = normalizePathToken(page.path || (pageIndex === 0 ? "/" : `/page-${pageIndex + 1}`));
      return { ...page, path: normalizedPath };
    })
    .filter((page, pageIndex) => {
      const path = normalizePathToken(page.path);
      if (path !== "/" && (/^\/(www|http|https)(\/|$)/i.test(path) || /\.[a-z]{2,}/i.test(path))) {
        logWarn(`${logPrefix} blueprint:drop_noise_page`, { path, reason: "domain_like_path" });
        return false;
      }
      if (seenPaths.has(path)) {
        logWarn(`${logPrefix} blueprint:drop_noise_page`, { path, reason: "duplicate_path" });
        return false;
      }
      seenPaths.add(path);
      if (!page.name || !String(page.name).trim()) {
        page.name = path === "/" ? "Home" : humanizeLabel(path.split("/").filter(Boolean).pop() || `Page ${pageIndex + 1}`);
      }
      return true;
    });
  return dedupedPages.length ? dedupedPages : [{ path: "/", name: "Home", sections: [] }];
};

type TemplatePlanSectionKind =
  | "navigation"
  | "hero"
  | "story"
  | "approach"
  | "products"
  | "socialproof"
  | "contact"
  | "cta"
  | "footer";

const templatePlanSectionOrder: TemplatePlanSectionKind[] = [
  "navigation",
  "hero",
  "story",
  "approach",
  "products",
  "socialproof",
  "contact",
  "cta",
  "footer",
];

const templatePlanKindPatterns: Record<TemplatePlanSectionKind, RegExp[]> = {
  navigation: [/navigation|navbar|header|topnav|menu/],
  hero: [/hero|masthead|pagehero|banner|intro/],
  story: [/story|about|narrative|philosophy|studio|editorial|mission|vision|who/],
  approach: [/approach|metric|stats|feature|value|process|capability|benefit|numbers?|technology|technical|tech(?:\s|-)?highlight|innovation|science|价值点|优势|能力|方法|指标|流程|特性|亮点|技术|科技/],
  products: [/product|catalog|collection|pricing|plan|showcase|gallery|module|offer|package|产品|目录|机型|设备|商品|套餐|报价/],
  socialproof: [/social|proof|testimonial|review|trust|logo|collaborator|partner/],
  contact: [/contact|lead|inquiry|form|quote|consult/],
  cta: [/cta|calltoaction|call-to-action|footercta|start|trial|getstarted/],
  footer: [/footer|legal|copyright|bottom/],
};

const templatePlanTypeByKind: Record<TemplatePlanSectionKind, string> = {
  navigation: "Navigation",
  hero: "Hero",
  story: "Content",
  approach: "Features",
  products: "ProductCatalog",
  socialproof: "SocialProof",
  contact: "Contact",
  cta: "CTA",
  footer: "Footer",
};

const templatePlanIdByKind: Record<TemplatePlanSectionKind, string> = {
  navigation: "navigation",
  hero: "hero",
  story: "story",
  approach: "approach",
  products: "products",
  socialproof: "social-proof",
  contact: "contact",
  cta: "footer-cta",
  footer: "footer",
};

const normalizeTemplatePlanKind = (value: string): TemplatePlanSectionKind | null => {
  const token = String(value ?? "")
    .trim()
    .toLowerCase() as TemplatePlanSectionKind;
  return templatePlanSectionOrder.includes(token) ? token : null;
};

const mergeTemplatePlanKinds = (...kindLists: TemplatePlanSectionKind[][]): TemplatePlanSectionKind[] => {
  const set = new Set<TemplatePlanSectionKind>();
  const merged: TemplatePlanSectionKind[] = [];
  for (const kind of templatePlanSectionOrder) {
    if (!kindLists.some((list) => Array.isArray(list) && list.includes(kind))) continue;
    if (set.has(kind)) continue;
    set.add(kind);
    merged.push(kind);
  }
  return merged;
};

const inferPromptDrivenTemplateKinds = (prompt: string): TemplatePlanSectionKind[] => {
  const raw = String(prompt || "")
    .trim()
    .toLowerCase();
  if (!raw) return [];
  return templatePlanSectionOrder.filter((kind) => {
    if (kind === "navigation" || kind === "footer" || kind === "hero") return false;
    return templatePlanKindPatterns[kind].some((pattern) => pattern.test(raw));
  });
};

type ProfileSiteTemplatePage = {
  path: string;
  name: string;
  kinds: TemplatePlanSectionKind[];
};

const normalizeTemplatePagePath = (value: unknown) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const normalized = withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
  return normalized === "" ? "/" : normalized;
};

const toTemplateKinds = (values: unknown[]): TemplatePlanSectionKind[] =>
  templatePlanSectionOrder.filter((kind) =>
    values
      .map((value) => normalizeTemplatePlanKind(String(value ?? "")))
      .filter((entry): entry is TemplatePlanSectionKind => Boolean(entry))
      .includes(kind)
  );

const readProfileSiteTemplatePages = (profile: unknown): ProfileSiteTemplatePage[] => {
  if (!profile || typeof profile !== "object") return [];
  const record = profile as Record<string, unknown>;
  const rawPages = Array.isArray(record.siteTemplates)
    ? record.siteTemplates
    : Array.isArray(record.site_templates)
      ? record.site_templates
      : Array.isArray(record.pageSpecs)
        ? record.pageSpecs
        : Array.isArray(record.page_specs)
          ? record.page_specs
      : [];
  const out: ProfileSiteTemplatePage[] = [];
  for (const rawPage of rawPages) {
    if (!rawPage || typeof rawPage !== "object") continue;
    const pageRecord = rawPage as Record<string, unknown>;
    const path = normalizeTemplatePagePath(pageRecord.path);
    const name =
      typeof pageRecord.name === "string" && pageRecord.name.trim()
        ? pageRecord.name.trim()
        : path === "/"
          ? "Home"
          : `Page ${out.length + 1}`;
    const rawKinds = Array.isArray(pageRecord.requiredCategories)
      ? pageRecord.requiredCategories
      : Array.isArray(pageRecord.required_categories)
        ? pageRecord.required_categories
        : [];
    const kinds = toTemplateKinds(rawKinds);
    if (!kinds.length) continue;
    out.push({ path, name, kinds });
  }
  return out;
};

const sectionMatchesTemplateKind = (section: ArchitectSection, kind: TemplatePlanSectionKind) => {
  const token = `${section.type ?? ""} ${section.id ?? ""}`.toLowerCase();
  return templatePlanKindPatterns[kind].some((pattern) => pattern.test(token));
};

const cloneLayoutHint = (layoutHint: ArchitectSection["layoutHint"]) =>
  layoutHint && typeof layoutHint === "object" ? { ...layoutHint } : undefined;

const createSyntheticTemplateSection = (kind: TemplatePlanSectionKind): ArchitectSection => ({
  id: templatePlanIdByKind[kind],
  type: templatePlanTypeByKind[kind],
  intent: `${humanizeLabel(kind)} section`,
  layoutHint: cloneLayoutHint(undefined),
});

const canonicalizeTemplateSection = (
  section: ArchitectSection,
  kind: TemplatePlanSectionKind
): ArchitectSection => {
  const fallbackId = templatePlanIdByKind[kind];
  const baseId = typeof section.id === "string" && section.id.trim() ? section.id : fallbackId;
  const normalizedId = toSlug(baseId) || fallbackId;
  const nextId = sectionMatchesTemplateKind(section, kind) ? normalizedId : fallbackId;
  return {
    ...section,
    id: nextId,
    type: templatePlanTypeByKind[kind],
    intent:
      typeof section.intent === "string" && section.intent.trim()
        ? section.intent
        : `${humanizeLabel(kind)} section`,
    layoutHint: cloneLayoutHint(section.layoutHint),
  };
};

const applyTemplateFirstSectionPlan = (
  pages: ReturnType<typeof normalizePages>,
  prompt: string
) => {
  if (sectionGenerationStrategy !== "template_first") return { pages, profileId: null as string | null };
  const profile = selectStyleProfile(prompt);
  if (!profile?.templates) return { pages, profileId: null as string | null };
  const templateKinds = Object.keys(profile.templates)
    .map((key) => normalizeTemplatePlanKind(key))
    .filter((kind): kind is TemplatePlanSectionKind => Boolean(kind));
  if (!templateKinds.length) return { pages, profileId: profile.id };

  const orderedKinds = templatePlanSectionOrder.filter((kind) => templateKinds.includes(kind));
  if (!orderedKinds.length) return { pages, profileId: profile.id };
  const promptDrivenKinds = inferPromptDrivenTemplateKinds(prompt);
  const profilePages = readProfileSiteTemplatePages(profile);
  const profilePageByPath = new Map(profilePages.map((page) => [normalizeTemplatePagePath(page.path), page]));
  let sourcePages = pages;
  if (profilePages.length) {
    const existingByPath = new Map(
      pages.map((page) => [normalizeTemplatePagePath(page.path), page] as const)
    );
    const consumed = new Set<string>();
    const mergedPages: ReturnType<typeof normalizePages> = profilePages.map((pageTemplate) => {
      const key = normalizeTemplatePagePath(pageTemplate.path);
      const existing = existingByPath.get(key);
      consumed.add(key);
      if (existing) {
        return {
          ...existing,
          path: key,
          name: pageTemplate.name || existing.name,
        };
      }
      return {
        path: key,
        name: pageTemplate.name || (key === "/" ? "Home" : "Page"),
        sections: [],
      };
    });
    for (const page of pages) {
      const key = normalizeTemplatePagePath(page.path);
      if (consumed.has(key)) continue;
      mergedPages.push(page);
    }
    sourcePages = mergedPages;
  }

  const nextPages = sourcePages.map((page) => {
    const sourceSections = Array.isArray(page.sections) ? page.sections : [];
    const pageTemplate = profilePageByPath.get(normalizeTemplatePagePath(page.path));
    const pageKinds = pageTemplate?.kinds?.length ? pageTemplate.kinds : orderedKinds;
    const orderedPageKinds = mergeTemplatePlanKinds(pageKinds, promptDrivenKinds);
    if (!orderedPageKinds.length) return { ...page, sections: sourceSections };
    const used = new Set<number>();
    const planned = orderedPageKinds.map((kind) => {
      const index = sourceSections.findIndex(
        (section, sectionIndex) => !used.has(sectionIndex) && sectionMatchesTemplateKind(section, kind)
      );
      if (index >= 0) {
        used.add(index);
        return canonicalizeTemplateSection(sourceSections[index], kind);
      }
      return createSyntheticTemplateSection(kind);
    });
    return { ...page, sections: planned };
  });

  return { pages: nextPages, profileId: profile.id };
};

const buildBretonFallbackSection = (slot: {
  id: string;
  type: string;
  intent: string;
  preset: string;
  align?: "start" | "center";
}): ArchitectSection => {
  const presetRules = compositionPresets[slot.preset];
  const layoutHint = applyCompositionDefaults(
    {
      compositionPreset: slot.preset,
      align: slot.align ?? presetRules?.layout?.align ?? "start",
      alignLocked: true,
    },
    presetRules,
    slot.type
  );
  return {
    id: slot.id,
    type: slot.type,
    intent: slot.intent,
    layoutHint,
    propsHints: { visualWeight: "high", sourceMode: "reference-guided" },
  };
};

const applyBretonBlueprintConstraints = (blueprint: ArchitectBlueprint): ArchitectBlueprint => {
  const pages = normalizePages(blueprint ?? {});
  const allSections = pages.flatMap((page) => (Array.isArray(page.sections) ? page.sections : []));
  const used = new Set<string>();
  const sectionFingerprint = (section: ArchitectSection) =>
    `${section.id ?? ""} ${section.type ?? ""} ${section.intent ?? ""}`.toLowerCase();
  const markKey = (section: ArchitectSection) => `${section.id ?? ""}::${section.type ?? ""}`;
  const pick = (patterns: RegExp[]) => {
    for (const section of allSections) {
      const key = markKey(section);
      if (used.has(key)) continue;
      const fingerprint = sectionFingerprint(section);
      if (patterns.some((pattern) => pattern.test(fingerprint))) {
        used.add(key);
        return section;
      }
    }
    return null;
  };

  const slots: Array<{
    id: string;
    type: string;
    intent: string;
    preset: string;
    align?: "start" | "center";
    patterns: RegExp[];
  }> = [
    {
      id: "hero",
      type: "Hero",
      intent: "Industrial hero banner with strong product photography and concise positioning.",
      preset: "H02",
      align: "start",
      patterns: [/hero|header|banner|masthead/],
    },
    {
      id: "industries",
      type: "ProductCatalog",
      intent: "Industry-focused cards showing key manufacturing domains and capabilities.",
      preset: "P01",
      patterns: [/industr|catalog|products?|solutions?|segments?|application|feature/],
    },
    {
      id: "whats-new",
      type: "News",
      intent: "Recent updates and product launches in compact editorial card layout.",
      preset: "B01",
      patterns: [/what.?s[- ]?new|news|blog|article|update|release/],
    },
    {
      id: "spotlight",
      type: "Showcase",
      intent: "One spotlight section combining narrative text with immersive industrial imagery.",
      preset: "G01",
      patterns: [/showcase|spotlight|technology|case|story|gallery/],
    },
    {
      id: "numbers",
      type: "Stats",
      intent: "Credibility stats in high-contrast tiles for scale and operational metrics.",
      preset: "ST01",
      align: "center",
      patterns: [/stats?|numbers?|kpi|metric|milestone|facts?/],
    },
    {
      id: "contact",
      type: "Contact",
      intent: "Lead capture section with clear corporate contact pathways.",
      preset: "CT01",
      patterns: [/contact|inquiry|support|form|lead|cta/],
    },
    {
      id: "footer",
      type: "Footer",
      intent: "Dense corporate footer with grouped links and legal/company information.",
      preset: "FT01",
      patterns: [/footer|legal|copyright/],
    },
  ];

  const orderedSections = slots.map((slot) => {
    const matched = pick(slot.patterns);
    if (!matched) return buildBretonFallbackSection(slot);
    const effectiveType = typeof matched.type === "string" && matched.type.trim() ? matched.type : slot.type;
    const presetRules = compositionPresets[slot.preset];
    const normalizedHint = normalizeLayoutHint(matched.layoutHint);
    const layoutHint = applyCompositionDefaults(
      {
        ...(normalizedHint ?? {}),
        compositionPreset: slot.preset,
        align: slot.align ?? normalizedHint?.align ?? presetRules?.layout?.align ?? "start",
        alignLocked: Boolean(slot.align ?? normalizedHint?.alignLocked),
      },
      presetRules,
      effectiveType
    );
    return {
      ...matched,
      id: slot.id,
      type: effectiveType,
      intent: matched.intent?.trim() ? matched.intent : slot.intent,
      layoutHint,
    };
  });

  const theme = blueprint?.theme && typeof blueprint.theme === "object" ? { ...blueprint.theme } : {};
  const contract = (theme?.themeContract as ThemeContract) ?? {};
  const tokens = {
    ...(contract.tokens ?? {}),
    primary: "primary",
    accent: "accent",
    neutral: "neutral",
    bg: "background",
    text: "foreground",
    textSecondary: "muted-foreground",
  };
  const layoutRules = {
    ...(contract.layoutRules ?? {}),
    maxWidth: "1280px",
    sectionPadding: "py-16 md:py-24",
    grid: "12-col",
    sectionAlignOverrides: {
      ...((contract.layoutRules?.sectionAlignOverrides as Record<string, "start" | "center"> | undefined) ?? {}),
      Hero: "start",
      ProductCatalog: "start",
      News: "start",
      Showcase: "start",
      Contact: "start",
      Footer: "start",
      Stats: "center",
    },
  };
  const nextTheme = {
    ...theme,
    mode: "light",
    motion: "subtle",
    radius: typeof (theme as any)?.radius === "string" ? (theme as any).radius : "0.25rem",
    fontHeading:
      typeof (theme as any)?.fontHeading === "string" && (theme as any).fontHeading.trim()
        ? (theme as any).fontHeading
        : "Manrope",
    fontBody:
      typeof (theme as any)?.fontBody === "string" && (theme as any).fontBody.trim()
        ? (theme as any).fontBody
        : "Manrope",
    primaryColor: "#9b0a3d",
    palette: {
      ...(((theme as any)?.palette ?? {}) as Record<string, string>),
      primary: "#9b0a3d",
      accent: "#1f2329",
      background: "#f4f5f6",
      text: "#101113",
      textSecondary: "#555b65",
    },
    themeContract: {
      ...contract,
      voice: "industrial",
      tokens,
      layoutRules,
      breakoutBudget: {
        ...(contract.breakoutBudget ?? {}),
        allowedSections: ["hero", "showcase"],
        colorBoost: 1.15,
        motionBoost: 1.1,
        layoutVariants: ["asymmetric", "full-bleed"],
      },
    },
  };

  const homePage = pages.find((page) => page.path === "/") ?? pages[0];
  return {
    ...blueprint,
    theme: nextTheme as Record<string, unknown>,
    pages: [
      {
        path: "/",
        name: homePage?.name || "Home",
        sections: orderedSections.slice(0, 9),
        root: homePage?.root,
      },
    ],
  };
};

const applyReferenceBlueprintConstraints = (
  blueprint: ArchitectBlueprint,
  prompt: string
): ArchitectBlueprint => {
  const profile = detectReferenceProfile(prompt);
  if (profile === "breton") return applyBretonBlueprintConstraints(blueprint);
  return blueprint;
};

const buildFallbackBlueprint = (prompt: string): ArchitectBlueprint => {
  const normalized = String(prompt ?? "").toLowerCase();
  const isIndustrial =
    /(industrial|manufactur|manufacturer|factory|machin|equipment|b2b|automation|cnc|procurement|engineering|工业|制造|制造商|工厂|设备|机械|机床|采购|工程|自动化)/i.test(
      normalized
    );
  const industry = isIndustrial ? "industrial-manufacturing" : "technology";
  const styleDNA = isIndustrial ? ["industrial", "precise", "high-clarity"] : ["clean", "modern", "high-clarity"];
  const imageMood = isIndustrial
    ? "precision machinery, factory-floor details, and controlled industrial photography"
    : "clean product photography";
  const coreProducts = isIndustrial
    ? ["industrial equipment", "automation systems", "technical support"]
    : ["core service", "platform", "support"];
  const themeVoice = isIndustrial ? "industrial" : "minimal";
  const sections: ArchitectSection[] = [
    {
      id: "hero",
      type: "Hero",
      intent: "Present the core value proposition with a clear headline and primary CTA.",
      layoutHint: applyCompositionDefaults({ compositionPreset: "H01", align: "start" }, compositionPresets.H01, "Hero"),
    },
    {
      id: "features",
      type: "Features",
      intent: "Show key differentiators with concise cards.",
      layoutHint: applyCompositionDefaults({ compositionPreset: "F01", align: "start" }, compositionPresets.F01, "Features"),
    },
    {
      id: "products",
      type: "ProductCatalog",
      intent: "Display the main product/service catalog with compact cards.",
      layoutHint: applyCompositionDefaults(
        { compositionPreset: "P01", align: "start" },
        compositionPresets.P01,
        "ProductCatalog"
      ),
    },
    {
      id: "contact",
      type: "Contact",
      intent: "Capture leads through a clear form and contact details.",
      layoutHint: applyCompositionDefaults({ compositionPreset: "CT01", align: "start" }, compositionPresets.CT01, "Contact"),
    },
    {
      id: "footer",
      type: "Footer",
      intent: "Provide navigation and legal links.",
      layoutHint: applyCompositionDefaults({ compositionPreset: "FT01", align: "start" }, compositionPresets.FT01, "Footer"),
    },
  ];
  return {
    designNorthStar: {
      styleDNA,
      typographyScale: "clear hierarchy",
      visualHierarchy: "headline-first",
      imageMood,
      industry,
      coreProducts,
    },
    theme: {
      mode: "light",
      radius: "0.5rem",
      fontHeading: "Manrope",
      fontBody: "Manrope",
      motion: "subtle",
      tokens: { surface: "card", border: "soft", shadow: "soft", accent: "flat" },
      themeContract: {
        voice: themeVoice,
        tokens: {
          primary: "primary",
          accent: "accent",
          neutral: "neutral",
          bg: "background",
          text: "foreground",
          textSecondary: "muted-foreground",
        },
        layoutRules: {
          maxWidth: "1200px",
          sectionPadding: "py-20",
          grid: "12-col",
          sectionAlignOverrides: {
            Hero: "start",
            Features: "start",
            ProductCatalog: "start",
            Contact: "start",
            Footer: "start",
          },
        },
      },
    },
    pages: [{ path: "/", name: "Home", sections }],
  };
};

const hasExplicitTemplateReference = (prompt: string) =>
  /(?:(?:like|inspired by|similar to|based on|reference(?:d)? from|modeled after)\s+[A-Za-z0-9\u4e00-\u9fff][^,.;\n]{1,50}|use\s+[A-Za-z0-9\u4e00-\u9fff][^,.;\n]{1,50}\s+as\s+(?:the\s+)?(?:(?:visual\s+style|visual\s+template|template|style|visual)\s+)?(?:reference|base)|(?:类似|像|参考|参照|对标|仿照)\s*[A-Za-z0-9\u4e00-\u9fff][^,.;，。！？；：\n]{1,50})/i.test(
    String(prompt || "")
  );

const hasTemplateSeedableBuildIntent = (prompt: string) =>
  /(?:homepage|home page|landing page|website|web site|company website|enterprise website|b2b|saas|官网|首页|企业官网|公司官网|落地页|工业制造官网)/i.test(
    String(prompt || "")
  );

const buildTemplateSeedBlueprint = (prompt: string): ArchitectBlueprint | null => {
  const selectedProfile = selectStyleProfile(prompt);
  const structuredBrief = parseStructuredBrief(prompt);
  const fallbackBlueprint = buildFallbackBlueprint(prompt);
  const explicitTemplatePrompt =
    hasExplicitTemplateReference(prompt) ||
    Boolean(extractBrandNameFromPromptLite(prompt)) ||
    Boolean(structuredBrief?.brand) ||
    extractSourceBrandTokens(prompt).length > 0;
  const hasProfileCoverage =
    Object.keys(selectedProfile?.templates ?? {}).length >= 5 ||
    (selectedProfile?.siteTemplates?.length ?? 0) >= 4 ||
    (selectedProfile?.pageSpecs?.length ?? 0) >= 4;
  const genericTemplatePrompt =
    hasTemplateSeedableBuildIntent(prompt) ||
    looksLikeEnterpriseWebsite({ prompt, pages: normalizePages(fallbackBlueprint) });
  const profileAllowsTemplateSeed = Boolean(selectedProfile) && hasProfileCoverage && genericTemplatePrompt;
  const genericAllowsTemplateSeed = allowTemplateSeedWithoutProfile && genericTemplatePrompt;
  if (!explicitTemplatePrompt && !profileAllowsTemplateSeed && !genericAllowsTemplateSeed) return null;

  const requestedPages = extractRequestedPagesFromPrompt(prompt);
  const seedPageMap = new Map<string, ArchitectPage>();
  normalizePages(fallbackBlueprint).forEach((page) => {
    seedPageMap.set(page.path, {
      path: page.path,
      name: page.name,
      sections: page.sections,
      root: page.root,
    });
  });
  requestedPages.forEach((page) => {
    if (seedPageMap.has(page.path)) return;
    seedPageMap.set(page.path, {
      path: page.path,
      name: page.name,
      sections: [],
    });
  });

  let seedPages = Array.from(seedPageMap.values());
  const hasStructuredNavContract = (structuredBrief?.nav?.length ?? 0) >= 3;
  const hasStructuredCatalogContract =
    hasStructuredCatalogContractSignal(structuredBrief) || hasStructuredCatalogContractSignalFromPrompt(prompt);
  if (looksLikeEnterpriseWebsite({ prompt, pages: seedPages })) {
    if (hasStructuredCatalogContract) {
      seedPages = ensureStructuredDualChainPages(seedPages as any[], prompt, structuredBrief) as ArchitectPage[];
    } else if (requestedPages.length < 3 && !hasStructuredNavContract) {
      seedPages = ensureEnterpriseSitePages(
        seedPages,
        (definition) => ({
          path: definition.path,
          name: definition.name,
          sections: [],
        }),
        { prompt }
      ) as ArchitectPage[];
    }
  }

  const templateResolution = resolveTemplatePlan({
    prompt,
    pages: seedPages,
    strategy: "template_first",
  });
  const resolvedPages = normalizePages({ pages: templateResolution.pages as any });
  if (!resolvedPages.length) return null;

  const shellTheme =
    templateResolution.siteStyleShell?.theme && typeof templateResolution.siteStyleShell.theme === "object"
      ? (templateResolution.siteStyleShell.theme as Record<string, unknown>)
      : null;
  const nextTheme = {
    ...(fallbackBlueprint.theme && typeof fallbackBlueprint.theme === "object"
      ? (fallbackBlueprint.theme as Record<string, unknown>)
      : {}),
    ...(shellTheme ?? {}),
    themeContract: {
      ...(((fallbackBlueprint.theme as any)?.themeContract &&
      typeof (fallbackBlueprint.theme as any).themeContract === "object"
        ? (fallbackBlueprint.theme as any).themeContract
        : {}) as Record<string, unknown>),
      ...((shellTheme?.themeContract && typeof shellTheme.themeContract === "object"
        ? shellTheme.themeContract
        : {}) as Record<string, unknown>),
    },
  };
  const brand = sanitizeBrandCandidate(String(structuredBrief?.brand || extractBrandNameFromPromptLite(prompt) || ""));

  return {
    ...fallbackBlueprint,
    designNorthStar: {
      ...(fallbackBlueprint.designNorthStar && typeof fallbackBlueprint.designNorthStar === "object"
        ? fallbackBlueprint.designNorthStar
        : {}),
      ...(brand ? { brand } : {}),
      ...(selectedProfile?.sourceDomain ? { referenceDomain: selectedProfile.sourceDomain } : {}),
    },
    theme: nextTheme,
    pages: resolvedPages,
  };
};

export const canGenerateTemplateOnly = (prompt: string) => Boolean(buildTemplateSeedBlueprint(prompt));

const buildThemeClassMap = (theme: Record<string, unknown>): ThemeClassMap => {
  const layout = (theme?.layoutRules as Record<string, string>) ?? {};
  const contract = (theme?.themeContract as ThemeContract) ?? {};
  const tokens = contract.tokens ?? {};
  const sectionPadding = layout.sectionPadding || "py-20";
  const maxWidth = layout.maxWidth || "1200px";
  const grid = layout.grid === "12-col" ? "grid grid-cols-12 gap-6" : "grid gap-6";
  const baseHeading = "font-heading text-4xl md:text-5xl tracking-tight";
  const baseBody = "font-body text-base md:text-lg text-muted-foreground";
  const baseCard = tokens.surface === "glass" ? "bg-white/60 backdrop-blur border border-white/20" : "bg-card";
  const baseAccent = tokens.accent === "glow" ? "shadow-[0_0_30px_rgba(0,0,0,0.12)]" : "shadow-md";
  const styleName = String(contract.voice ?? "minimal");

  const variants: Record<string, ThemeClassMapBase> = {};
  const makeVariant = (name: string, overrides: Partial<ThemeClassMapBase>) =>
    ({
      container: `mx-auto w-full px-6 max-w-[${maxWidth}]`,
      sectionPadding,
      grid,
      heading: baseHeading,
      body: baseBody,
      card: baseCard,
      accent: baseAccent,
      styleName: name,
      styleTokens: {
        surface: "bg-card",
        border: "border border-border",
        glow: "shadow-lg",
        hero: "",
        section: "",
      },
      breakout: {
        hero: "min-h-[70vh] py-24",
        showcase: "py-24",
        fullBleed: "w-screen relative left-1/2 right-1/2 -mx-[50vw]",
      },
      effects: {
        glowButton: "btn-glow",
        glassCard: "card-glass",
        gradientText: "text-gradient",
        hoverLift: "hover-lift",
        hoverUnderline: "hover-underline",
      },
      ...overrides,
    }) as ThemeClassMapBase;

  variants.minimal = makeVariant("minimal", {
    heading: "font-heading text-4xl md:text-5xl tracking-tight",
    body: "font-body text-base md:text-lg text-muted-foreground",
    card: "bg-white border border-border shadow-sm",
    styleTokens: {
      surface: "bg-white",
      border: "border border-border",
      glow: "shadow-sm",
      hero: "bg-gradient-to-b from-white to-muted/20",
      section: "bg-background",
    },
  });

  variants.luxury = makeVariant("luxury", {
    heading: "font-heading text-4xl md:text-6xl tracking-tight text-foreground",
    body: "font-body text-base md:text-lg text-muted-foreground",
    card: "bg-card/80 backdrop-blur border border-border shadow-2xl",
    accent: "shadow-[0_20px_60px_rgba(0,0,0,0.18)]",
    styleTokens: {
      surface: "bg-card/80 backdrop-blur",
      border: "border border-border/60",
      glow: "shadow-[0_20px_60px_rgba(0,0,0,0.18)]",
      hero: "bg-gradient-to-b from-background via-background to-muted/20",
      section: "bg-background",
    },
  });

  variants.tech = makeVariant("tech", {
    heading: "font-heading text-4xl md:text-6xl tracking-tight text-foreground",
    body: "font-body text-base md:text-lg text-muted-foreground",
    card: "bg-black/30 border border-white/10 backdrop-blur",
    accent: "shadow-[0_0_40px_rgba(56,189,248,0.25)]",
    styleTokens: {
      surface: "bg-black/30 backdrop-blur",
      border: "border border-white/10",
      glow: "shadow-[0_0_40px_rgba(56,189,248,0.25)]",
      hero: "bg-gradient-to-br from-slate-900 via-slate-950 to-black",
      section: "bg-slate-950/60",
    },
  });

  variants.art = makeVariant("art", {
    heading: "font-heading text-5xl md:text-7xl tracking-tight",
    body: "font-body text-base md:text-lg text-foreground/80",
    card: "bg-white/70 border border-black/10 backdrop-blur",
    accent: "shadow-[0_30px_80px_rgba(236,72,153,0.25)]",
    styleTokens: {
      surface: "bg-white/70 backdrop-blur",
      border: "border border-black/10",
      glow: "shadow-[0_30px_80px_rgba(236,72,153,0.25)]",
      hero: "bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100",
      section: "bg-white/60",
    },
  });

  variants.industrial = makeVariant("industrial", {
    heading: "font-heading text-4xl md:text-6xl tracking-tight uppercase",
    body: "font-body text-base md:text-lg text-muted-foreground",
    card: "bg-zinc-900 text-white border border-white/10",
    accent: "shadow-[0_0_24px_rgba(250,204,21,0.2)]",
    styleTokens: {
      surface: "bg-zinc-900 text-white",
      border: "border border-white/10",
      glow: "shadow-[0_0_24px_rgba(250,204,21,0.2)]",
      hero: "bg-gradient-to-br from-zinc-900 via-zinc-950 to-black",
      section: "bg-zinc-950/70",
    },
  });

  variants.fashion = makeVariant("fashion", {
    heading: "font-heading text-4xl md:text-6xl tracking-tight",
    body: "font-body text-base md:text-lg text-muted-foreground",
    card: "bg-white border border-black/10 shadow-xl",
    accent: "shadow-[0_20px_60px_rgba(0,0,0,0.12)]",
    styleTokens: {
      surface: "bg-white",
      border: "border border-black/10",
      glow: "shadow-[0_20px_60px_rgba(0,0,0,0.12)]",
      hero: "bg-gradient-to-b from-white via-white to-muted/10",
      section: "bg-white",
    },
  });

  const selected =
    variants[styleName] ||
    variants[
      styleName
        .toLowerCase()
        .replace(/[^a-z]/g, "")
    ] ||
    variants.minimal;

  return {
    container: `mx-auto w-full px-6 max-w-[${maxWidth}]`,
    sectionPadding,
    grid,
    heading: selected.heading,
    body: selected.body,
    card: selected.card,
    accent: selected.accent,
    styleName: selected.styleName,
    styleTokens: selected.styleTokens,
    breakout: {
      hero: "min-h-[70vh] py-24",
      showcase: "py-24",
      fullBleed: "w-screen relative left-1/2 right-1/2 -mx-[50vw]",
    },
    variants: variants as Record<string, ThemeClassMap>,
  };
};

const parseRangeSeconds = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const cleaned = value.replace(/\s+/g, "");
  const match = cleaned.match(/([\d.]+)(?:-(\d[\d.]+))?(ms|s)?/i);
  if (!match) return undefined;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : undefined;
  const unit = match[3]?.toLowerCase() ?? "s";
  const normalize = (num: number) => (unit === "ms" ? num / 1000 : num);
  if (Number.isNaN(start)) return undefined;
  const a = normalize(start);
  if (!end || Number.isNaN(end)) return a;
  const b = normalize(end);
  return (a + b) / 2;
};

const resolveEase = (value: unknown) => {
  if (typeof value !== "string") return "easeOut";
  const lower = value.toLowerCase();
  if (lower.includes("expo")) return [0.16, 1, 0.3, 1] as const;
  if (lower.includes("smooth")) return [0.4, 0, 0.2, 1] as const;
  if (lower.includes("inout")) return "easeInOut";
  return "easeOut";
};

const buildMotionPresets = (
  theme: Record<string, unknown>,
  designNorthStar?: Record<string, unknown>
): MotionPresets => {
  const contract = (theme?.themeContract as ThemeContract) ?? {};
  const motion = contract.motionRules ?? {};
  const spec = (designNorthStar as any)?.motionSpec ?? {};
  const base =
    Number(motion.durationBase ?? 0) || parseRangeSeconds(spec?.duration) || 0.6;
  const staggerDelay = parseRangeSeconds(spec?.stagger) ?? 0.12;
  const ease = resolveEase(motion.easing ?? spec?.easing);
  const distance =
    motion.distanceScale === "lg" ? 32 : motion.distanceScale === "sm" ? 12 : 20;
  return {
    fadeUp: {
      initial: { opacity: 0, y: distance },
      animate: { opacity: 1, y: 0 },
      transition: { duration: base, ease },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: base, ease },
    },
    stagger: {
      initial: {},
      animate: {
        transition: { staggerChildren: staggerDelay },
      },
    },
  };
};

const stripThemeVariants = (themeClassMap: ThemeClassMap) => {
  const { variants, ...rest } = themeClassMap;
  return rest;
};

const filterManifestWhitelist = (manifest: Record<string, unknown>) => {
  const excluded = new Set([
    "Progress",
    "Slider",
    "Skeleton",
    "DropdownMenu",
    "Sheet",
    "GradientText",
  ]);

  const filterList = (value: unknown) => {
    if (!Array.isArray(value)) return value;
    return value.filter((item) => {
      const name = item && typeof item === "object" ? (item as any).name : undefined;
      if (typeof name !== "string") return true;
      return !excluded.has(name);
    });
  };

  return {
    ...(manifest ?? {}),
    magic_ui: filterList((manifest as any)?.magic_ui),
    shadcn: filterList((manifest as any)?.shadcn),
    libraries: filterList((manifest as any)?.libraries),
  };
};

const flattenSections = (pages: ReturnType<typeof normalizePages>): SectionContext[] =>
  pages.flatMap((page, pageIndex) =>
    page.sections.map((section, sectionIndex) => ({
      pageIndex,
      pagePath: page.path,
      pageName: page.name,
      sectionIndex,
      section: {
        id: section.id ?? `section-${pageIndex + 1}-${sectionIndex + 1}`,
        type: section.type ?? "Section",
        intent: section.intent,
        propsHints: section.propsHints,
        layoutHint: section.layoutHint,
      },
    }))
  );

const normalizeGeneratedComponentCode = (code: string, componentName?: string) => {
  let next = code;
  // Canonicalize common wrong imports from generated code.
  // Some models emit magic components under "@/components/ui/*", which is invalid in our runtime.
  next = next.replace(
    /@\/components\/ui\/(animated-beam|bento-grid|border-beam|carousel|comparison-slider|scene-switcher|glow-card|gradient-text|magnifier|marquee|number-ticker|particles|text-reveal)/g,
    "@/components/magic/$1"
  );
  next = next.replace(
    /from\s+['"]@\/components\/magic\/(text-reveal|particles|number-ticker|marquee)['"]/g,
    "from '@/components/magic/$1'"
  );
  if (!/lg:grid-cols-12/.test(next) && /xl:grid-cols-12/.test(next)) {
    next = next.replace(/xl:grid-cols-12/g, "lg:grid-cols-12 xl:grid-cols-12");
  }
  const colSpanMatches = Array.from(next.matchAll(/xl:col-span-(\d+)/g));
  if (colSpanMatches.length) {
    const unique = Array.from(new Set(colSpanMatches.map((m) => m[1])));
    unique.forEach((span) => {
      const lgToken = `lg:col-span-${span}`;
      const xlToken = `xl:col-span-${span}`;
      if (!next.includes(lgToken)) {
        next = next.replace(new RegExp(`\\b${xlToken}\\b`, "g"), `${lgToken} ${xlToken}`);
      }
    });
  }
  if (!/lg:grid-cols-/.test(next) && /xl:grid-cols-\\d+/.test(next)) {
    next = next.replace(/xl:grid-cols-(\\d+)/g, "lg:grid-cols-$1 xl:grid-cols-$1");
  }
  const name = (componentName ?? "").toLowerCase();
  if (name.includes("designhero")) {
    next = next.replace(
      /className=\{\$\{themeClassMap\.body\} max-w-2xl\}/g,
      "className={`${themeClassMap.body} max-w-2xl text-[#2a2a2a]`}"
    );
    next = next.replace(/\bpx-8\b/g, "px-10");
  }
  if (name.includes("supporthero")) {
    next = next.replace(/min-h-\\[70vh\\]/g, "min-h-[55vh] lg:min-h-[70vh]");
  }
  if (name.includes("materialstory")) {
    next = next.replace(/space-y-6/g, "space-y-10");
    next = next.replace(/space-y-4/g, "space-y-6");
  }
  next = replaceThemeHexTokens(next);
  if (name.includes("philosophy") || name.includes("contentsection")) {
    next = ensureSectionMinHeight(next, "min-h-[50vh] lg:min-h-[70vh] flex items-center");
  }
  if (name.includes("corefeatures")) {
    if (!/grid-flow-dense/.test(next)) {
      next = next.replace(
        /grid-cols-12 gap-8 auto-rows-auto/g,
        "grid-cols-12 gap-8 auto-rows-[220px] md:auto-rows-[280px] grid-flow-dense"
      );
      next = next.replace(
        /grid-cols-12 gap-8/g,
        "grid-cols-12 gap-8 auto-rows-[220px] md:auto-rows-[280px] grid-flow-dense"
      );
    }
    next = next.replace(/min-h-\\[280px\\]/g, "min-h-[320px]");
    next = next.replace(/min-h-\\[600px\\]/g, "min-h-[640px]");
  }
  if (name.includes("experiencescenes") || name.includes("scenarios") || name.includes("lifestyle")) {
    const wantsCarousel =
      /\bCarousel\b/.test(next) || /\bSceneSwitcher\b/.test(next) || /overflow-x-auto/.test(next) || /snap-x/.test(next);
    if (!wantsCarousel) {
      next = next.replace(
        /className=\"space-y-4\"/g,
        'className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[220px] md:auto-rows-[280px] grid-flow-dense"'
      );
      next = next.replace(
        /grid grid-cols-1 md:grid-cols-12 gap-0/g,
        "flex flex-col"
      );
      next = next.replace(
        /grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-0/g,
        "flex flex-col"
      );
      next = next.replace(/md:col-span-7\\s*/g, "");
      next = next.replace(/md:col-span-5\\s*/g, "");
      next = next.replace(/lg:col-span-7 xl:col-span-7\\s*/g, "");
      next = next.replace(/lg:col-span-5 xl:col-span-5\\s*/g, "");
      next = next.replace(/md:aspect-auto md:min-h-\\[400px\\]/g, "min-h-[260px] md:min-h-[320px]");
      next = next.replace(/xl:aspect-auto xl:min-h-\\[500px\\]/g, "min-h-[280px] md:min-h-[360px]");
      if (!/grid-flow-dense/.test(next)) {
        next = next.replace(
          /grid grid-cols-1\b/g,
          "grid grid-cols-1 auto-rows-[220px] md:auto-rows-[280px] grid-flow-dense"
        );
      }
    }
  }
  if (name.includes("craftshowcase")) {
    if (!/grid-flow-dense/.test(next)) {
      next = next.replace(
        /grid-cols-12 gap-4 auto-rows-auto/g,
        "grid-cols-12 gap-4 auto-rows-[220px] md:auto-rows-[280px] grid-flow-dense"
      );
      next = next.replace(
        /grid-cols-12 gap-4/g,
        "grid-cols-12 gap-4 auto-rows-[220px] md:auto-rows-[280px] grid-flow-dense"
      );
    }
  }
  if (name.includes("designshowcase") || name.includes("craftshowcase") || name.includes("imagegallery")) {
    next = next.replace(
      /grid-cols-1 md:grid-cols-2 lg:grid-cols-3/g,
      "grid-cols-[repeat(auto-fit,minmax(240px,1fr))]"
    );
    next = next.replace(
      /grid-cols-1 md:grid-cols-2 xl:grid-cols-3/g,
      "grid-cols-[repeat(auto-fit,minmax(240px,1fr))]"
    );
    if (!/grid-flow-dense/.test(next)) {
      next = next.replace(
        /grid grid-cols-1\b/g,
        "grid grid-cols-1 auto-rows-[220px] md:auto-rows-[280px] grid-flow-dense"
      );
    }
    next = next.replace(/<Card([^>]*?)className=\"([^\"]*)\"/g, (_match, prefix, classes) => {
      if (classes.includes("border-0")) return `<Card${prefix}className=\"${classes}\"`;
      return `<Card${prefix}className=\"${classes} border-0\"`;
    });
    next = next.replace(/<Card([^>]*?)className=\\{`([^`]*)`\\}/g, (_match, prefix, classes) => {
      if (classes.includes("border-0")) return `<Card${prefix}className={\`${classes}\`}`;
      return `<Card${prefix}className={\`${classes} border-0\`}`;
    });
  }
  if (name.includes("trustlogos")) {
    next = normalizeTrustLogosMarquee(next);
  }
  if (name.includes("ctasection") || name === "cta") {
    next = next.replace(/px-12 py-6/g, "px-8 py-4 md:px-10 md:py-4");
    next = next.replace(/py-6 px-12/g, "py-4 px-8 md:py-4 md:px-10");
    next = next.replace(/<Button(?![^>]*\\bsize=)/g, '<Button size="lg"');
    if (/ctaSecondary|secondaryCta/i.test(next)) {
      next = next.replace(
        /<Button([^>]*?)>(\s*\{?\s*(ctaSecondary|secondaryCta)[^<]*<\/Button>)/g,
        (match, attrs, content) => {
          if (/variant=/.test(attrs)) {
            return `<Button${attrs.replace(/variant=\"[^\"]*\"/, 'variant=\"secondary\"')}>${content}`;
          }
          return `<Button variant=\"secondary\"${attrs}>${content}`;
        }
      );
    }
  }
  if (name.includes("hero")) {
    next = next.replace(/<Button(?![^>]*\\bsize=)/g, '<Button size="lg"');
    next = next.replace(
      /heading:\s*'font-heading text-4xl md:text-6xl tracking-tight text-foreground'/g,
      "heading: 'font-heading text-[56px] md:text-[88px] lg:text-[112px] leading-[0.9] tracking-[-0.02em] text-foreground'"
    );
    next = next.replace(
      /heading:\s*"font-heading text-4xl md:text-6xl tracking-tight text-foreground"/g,
      'heading: "font-heading text-[56px] md:text-[88px] lg:text-[112px] leading-[0.9] tracking-[-0.02em] text-foreground"'
    );
    next = next.replace(
      /\bfont-heading\s+text-4xl\s+md:text-6xl\b/g,
      "font-heading text-[56px] md:text-[88px] lg:text-[112px] leading-[0.9] tracking-[-0.02em]"
    );
    next = next.replace(
      /\bfont-heading\s+text-5xl\s+md:text-7xl\b/g,
      "font-heading text-[56px] md:text-[88px] lg:text-[112px] leading-[0.9] tracking-[-0.02em]"
    );
  }
  if (name.includes("comparison")) {
    next = next.replace(/<Badge(?![^>]*className=)/g, '<Badge className="absolute top-4 right-4 bg-primary text-primary-foreground shadow-sm">');
    next = next.replace(/<Badge([^>]*?)className=\"([^\"]*)\"/g, (_match, prefix, classes) => {
      if (classes.includes("absolute")) {
        return `<Badge${prefix}className=\"${classes}\"`;
      }
      return `<Badge${prefix}className=\"absolute top-4 right-4 bg-primary text-primary-foreground shadow-sm ${classes}\"`;
    });
  }
  if (name.includes("footerminimal") || name.includes("footer")) {
    next = next.replace(
      /grid-cols-12 xl:grid-cols-12 gap-4/g,
      "grid-cols-12 xl:grid-cols-12 gap-10"
    );
    next = next.replace(/sm:grid-cols-3 gap-8 sm:gap-4/g, "sm:grid-cols-3 gap-8 sm:gap-8");
  }
  return next;
};

const MODE_KEYWORDS = {
  dark: ["dark", "black", "noir", "midnight", "obsidian", "night"],
  light: ["light", "white", "bright", "airy", "ivory", "cream"],
};

const COLOR_KEYWORDS: Array<{ words: string[]; hex: string }> = [
  { words: ["gold", "golden", "brass", "bronze", "champagne", "金色"], hex: "#D4AF37" },
  { words: ["silver", "chrome", "platinum", "steel", "银色"], hex: "#C0C0C0" },
  { words: ["blue", "navy", "indigo", "azure", "cobalt", "蓝色"], hex: "#2563EB" },
  { words: ["green", "emerald", "olive", "mint", "绿色"], hex: "#10B981" },
  { words: ["red", "crimson", "scarlet", "ruby", "红色", "红"], hex: "#EF4444" },
  { words: ["orange", "amber", "tangerine", "coral", "橙色"], hex: "#F97316" },
  { words: ["purple", "violet", "lavender", "plum", "紫色"], hex: "#8B5CF6" },
  { words: ["pink", "rose", "magenta", "粉色"], hex: "#EC4899" },
  { words: ["brown", "tan", "beige", "sand", "taupe", "米黄", "米黄色", "米白", "米白色", "卡其"], hex: "#C2A37A" },
  { words: ["gray", "grey", "slate", "graphite", "charcoal", "灰色", "灰白"], hex: "#6B7280" },
];

const BASE_PALETTES = {
  light: {
    warm: { bg: "#F8F4EE", text: "#1A1A1A", neutral: "#E7DED3", textSecondary: "#6B6258" },
    cool: { bg: "#F5F7FA", text: "#111827", neutral: "#E5E7EB", textSecondary: "#6B7280" },
    neutral: { bg: "#F7F7F7", text: "#111111", neutral: "#E5E5E5", textSecondary: "#666666" },
  },
  dark: {
    warm: { bg: "#0D0B0A", text: "#F7F2EA", neutral: "#2A2521", textSecondary: "#B7AFA4" },
    cool: { bg: "#0B0D0F", text: "#E5E7EB", neutral: "#1F2937", textSecondary: "#9CA3AF" },
    neutral: { bg: "#0B0B0B", text: "#F5F5F5", neutral: "#1F1F1F", textSecondary: "#A3A3A3" },
  },
};

const TOKEN_NAME_MAP: Record<string, string> = {
  primary: "primary",
  accent: "accent",
  neutral: "neutral",
  bg: "background",
  text: "foreground",
  textSecondary: "muted-foreground",
  metallic: "metallic",
};

const isColorValue = (value: string) =>
  /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) || /^rgb|^hsl/i.test(value);

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasKeyword = (text: string, word: string) => {
  if (/[\u3400-\u9fff]/.test(word)) {
    return text.includes(word.toLowerCase());
  }
  const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
  return pattern.test(text);
};

const detectMode = (prompt: string) => {
  const lower = prompt.toLowerCase();
  const hasDark = MODE_KEYWORDS.dark.some((word) => hasKeyword(lower, word));
  const hasLight = MODE_KEYWORDS.light.some((word) => hasKeyword(lower, word));
  if (hasDark && !hasLight) return "dark";
  if (hasLight && !hasDark) return "light";
  return undefined;
};

const extractHexColors = (prompt: string) => {
  const matches = prompt.match(/#[0-9a-fA-F]{6}/g) ?? [];
  const unique = Array.from(new Set(matches.map((value) => value.toUpperCase())));
  return unique;
};

const extractColorWords = (prompt: string) => {
  const lower = prompt.toLowerCase();
  const colors: string[] = [];
  COLOR_KEYWORDS.forEach((entry) => {
    if (entry.words.some((word) => hasKeyword(lower, word))) {
      colors.push(entry.hex);
    }
  });
  return Array.from(new Set(colors));
};

const extractLabeledThemeColors = (prompt: string) => {
  const text = String(prompt ?? "").slice(0, 3600);
  const matches = Array.from(text.matchAll(/#[0-9a-fA-F]{6}/g));
  const labeled: Partial<Record<"bg" | "neutral" | "text" | "accent" | "textSecondary", string>> = {};
  for (const match of matches) {
    const hex = String(match[0]).toUpperCase();
    const index = match.index ?? 0;
    const context = text.slice(Math.max(0, index - 40), index).toLowerCase();
    if (
      !labeled.bg &&
      /(主背景|背景色|warm off-white|background|bg)/i.test(context) &&
      !/(次级|secondary)/i.test(context)
    ) {
      labeled.bg = hex;
      continue;
    }
    if (
      !labeled.neutral &&
      /(次级背景|secondary background|greige|neutral|辅助背景|副背景)/i.test(context)
    ) {
      labeled.neutral = hex;
      continue;
    }
    if (
      !labeled.text &&
      /(主文字|main text|charcoal|foreground|文字色|text)/i.test(context) &&
      !/(辅助|secondary|muted)/i.test(context)
    ) {
      labeled.text = hex;
      continue;
    }
    if (
      !labeled.accent &&
      /(强调色|accent|ochre|sienna|brand|主色)/i.test(context)
    ) {
      labeled.accent = hex;
      continue;
    }
    if (
      !labeled.textSecondary &&
      /(辅助灰|muted|secondary text|text secondary|sub text|副文字)/i.test(context)
    ) {
      labeled.textSecondary = hex;
      continue;
    }
  }
  return labeled;
};

const inferTone = (prompt: string, designNorthStar?: Record<string, unknown>) => {
  const context = `${prompt} ${JSON.stringify(designNorthStar ?? {})}`.toLowerCase();
  const warmKeywords = [
    "warm",
    "organic",
    "natural",
    "heritage",
    "craft",
    "handmade",
    "artisan",
    "luxury",
    "premium",
    "hotel",
    "hospitality",
    "fashion",
    "elegant",
    "brass",
    "gold",
    "leather",
    "wood",
  ];
  const coolKeywords = [
    "tech",
    "industrial",
    "modern",
    "minimal",
    "precision",
    "audio",
    "electronics",
    "studio",
    "sleek",
    "aluminum",
    "titanium",
    "futuristic",
    "digital",
    "智能",
    "视觉",
    "工业",
    "科技",
    "硬件",
    "检测",
  ];
  const warmScore = warmKeywords.filter((word) => hasKeyword(context, word)).length;
  const coolScore = coolKeywords.filter((word) => hasKeyword(context, word)).length;
  if (warmScore > coolScore) return "warm";
  if (coolScore > warmScore) return "cool";
  return "neutral";
};

const containsCjkText = (value: string) => /[\u3400-\u9fff]/.test(String(value || ""));

const applyUserThemeIntent = (
  blueprint: ArchitectBlueprint,
  prompt: string
): ArchitectBlueprint => {
  if (!prompt?.trim()) return blueprint;
  const theme = blueprint?.theme && typeof blueprint.theme === "object" ? { ...blueprint.theme } : {};
  const contract = (theme?.themeContract as ThemeContract) ?? {};
  const tokens = { ...(contract.tokens ?? {}) } as Record<string, string>;
  const existingPalette = { ...(((theme as any)?.palette ?? {}) as Record<string, string>) };
  Object.entries(tokens).forEach(([key, value]) => {
    if (typeof value === "string" && isColorValue(value)) {
      existingPalette[key] = value;
    }
  });

  const explicitHex = extractHexColors(prompt);
  const explicitWords = extractColorWords(prompt);
  const labeledColors = extractLabeledThemeColors(prompt);
  const explicitColors = [...explicitHex, ...explicitWords];
  const fallbackPrimary =
    (typeof (theme as any)?.primaryColor === "string" ? String((theme as any).primaryColor) : undefined) ||
    existingPalette.primary;

  const mode =
    detectMode(prompt) ?? (typeof (theme as any)?.mode === "string" ? String((theme as any).mode) : "light");
  const tone = inferTone(prompt, blueprint.designNorthStar as Record<string, unknown> | undefined);
  const basePalette = BASE_PALETTES[mode === "dark" ? "dark" : "light"][tone];

  const nextPalette = {
    ...basePalette,
    ...existingPalette,
  } as Record<string, string>;
  if (labeledColors.bg) nextPalette.bg = labeledColors.bg;
  if (labeledColors.neutral) nextPalette.neutral = labeledColors.neutral;
  if (labeledColors.text) nextPalette.text = labeledColors.text;
  if (labeledColors.textSecondary) nextPalette.textSecondary = labeledColors.textSecondary;

  const accent =
    labeledColors.accent || explicitColors[1] || existingPalette.accent || explicitColors[0] || fallbackPrimary;
  const primary = explicitColors[0] || labeledColors.accent || fallbackPrimary || accent;
  if (primary) nextPalette.primary = primary;
  if (accent) nextPalette.accent = accent;
  if (!nextPalette.primary) nextPalette.primary = nextPalette.text;
  if (!nextPalette.accent) nextPalette.accent = nextPalette.textSecondary;

  const semanticPaletteHint = /(?:ai|vision|industrial|smart|智能|视觉|工业|科技)/i.test(prompt);
  if (!explicitColors.length && !labeledColors.accent && semanticPaletteHint) {
    nextPalette.accent = mode === "dark" ? "#38BDF8" : "#2563EB";
    nextPalette.primary = mode === "dark" ? "#0F172A" : "#1E3A8A";
  }

  Object.keys(TOKEN_NAME_MAP).forEach((key) => {
    tokens[key] = TOKEN_NAME_MAP[key];
  });

  const hasCjk = containsCjkText(prompt);
  const currentHeading = typeof (theme as any)?.fontHeading === "string" ? String((theme as any).fontHeading) : "";
  const currentBody = typeof (theme as any)?.fontBody === "string" ? String((theme as any).fontBody) : "";
  const fontHeading =
    hasCjk && (!currentHeading || /inter|arial|helvetica|system/i.test(currentHeading))
      ? "Noto Sans SC"
      : currentHeading || "Manrope";
  const fontBody =
    hasCjk && (!currentBody || /inter|arial|helvetica|system/i.test(currentBody))
      ? "Noto Sans SC"
      : currentBody || "Manrope";

  const nextTheme = {
    ...theme,
    mode,
    fontHeading,
    fontBody,
    palette: nextPalette,
    primaryColor: nextPalette.primary,
    themeContract: {
      ...contract,
      tokens,
    },
  };
  return { ...blueprint, theme: nextTheme };
};

const replaceThemeHexTokens = (code: string) => {
  const replacements: Array<[RegExp, string]> = [
    [new RegExp("bg-\\\\[#0A0A0A\\\\]/([0-9]+)", "g"), "bg-background/$1"],
    [new RegExp("bg-\\\\[#0A0A0A\\\\]", "g"), "bg-background"],
    [new RegExp("from-\\\\[#0A0A0A\\\\]", "g"), "from-background"],
    [new RegExp("via-\\\\[#0A0A0A\\\\]/([0-9]+)", "g"), "via-background/$1"],
    [new RegExp("to-\\\\[#0A0A0A\\\\]", "g"), "to-background"],
    [new RegExp("bg-\\\\[#2A2A2A\\\\]", "g"), "bg-card"],
    [new RegExp("border-\\\\[#2A2A2A\\\\]", "g"), "border-border"],
    [new RegExp("border-\\\\[#3A3A3A\\\\]", "g"), "border-border"],
    [new RegExp("text-\\\\[#F5F5F5\\\\]", "g"), "text-foreground"],
    [new RegExp("text-\\\\[#A0A0A0\\\\]", "g"), "text-muted-foreground"],
    [new RegExp("text-\\\\[#0A0A0A\\\\]", "g"), "text-primary-foreground"],
    [new RegExp("bg-\\\\[#D4AF37\\\\]", "g"), "bg-primary"],
    [new RegExp("text-\\\\[#D4AF37\\\\]", "g"), "text-primary"],
    [new RegExp("border-\\\\[#D4AF37\\\\]", "g"), "border-primary"],
    [new RegExp("hover:bg-\\\\[#C0A030\\\\]", "g"), "hover:bg-primary/90"],
    [new RegExp("bg-\\\\[#C0A030\\\\]", "g"), "bg-primary/90"],
    [new RegExp("bg-\\\\[#C0C0C0\\\\]", "g"), "bg-muted"],
    [new RegExp("border-\\\\[#C0C0C0\\\\]", "g"), "border-muted"],
  ];
  return replacements.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), code);
};

const ensureSectionMinHeight = (code: string, tokens: string) => {
  if (new RegExp("min-h-\\[").test(code)) return code;
  const templatePattern = new RegExp("<section className=\\\\{`([^`]+)`\\\\}");
  if (templatePattern.test(code)) {
    return code.replace(templatePattern, (_match, cls) => {
      if (cls.includes("min-h-")) return _match;
      return `<section className={\`${cls} ${tokens}\`}`;
    });
  }
  const stringPattern = new RegExp('<section className=\"([^\"]+)\"');
  if (stringPattern.test(code)) {
    return code.replace(stringPattern, (_match, cls) => {
      if (cls.includes("min-h-")) return _match;
      return `<section className=\"${cls} ${tokens}\"`;
    });
  }
  return code;
};

const normalizeTrustLogosMarquee = (code: string) => {
  let next = code.replace(
    new RegExp("import\\\\s+Marquee\\\\s+from\\\\s+['\\\"]@\\\\/components\\\\/magic\\\\/marquee['\\\"];?", "g"),
    "import { Marquee } from '@/components/magic/marquee';"
  );
  if (!next.includes("Marquee")) return next;
  const marqueeItemsSnippet = `\n  const normalizedLogos = logos\n    .map((logo) => ({\n      ...logo,\n      _src: String(logo.image ?? logo.src ?? logo.url ?? \"\"),\n    }))\n    .filter((logo) => /^https?:\\\\/\\\\//.test(logo._src));\n  const marqueeItems = normalizedLogos.map((logo, index) => (\n    <div\n      key={\`${'${logo.name}'}-${'${index}'}\`}\n      className=\"flex items-center justify-center mx-12 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-500\"\n    >\n      <img\n        src={logo._src}\n        alt={logo.name}\n        className=\"h-8 md:h-10 w-auto object-contain\"\n      />\n    </div>\n  ));\n`;
  next = next.replace(
    /const\\s+\\{\\s*ref,\\s*controls\\s*\\}\\s*=\\s*useInViewReveal\\(\\);/,
    (match) => `${match}${marqueeItemsSnippet}`
  );
  next = next.replace(
    new RegExp("<Marquee[\\\\s\\\\S]*?<\\\\/Marquee>", "g"),
    `<Marquee className=\"py-8\" items={marqueeItems} />`
  );
  return next;
};

const ensureCompositionPresetClasses = (code: string, compositionPreset?: CompositionPreset) => {
  if (!compositionPreset?.requiredClasses?.length) return code;
  let next = code;
  const required = compositionPreset.requiredClasses;
  const missing = required.filter((token) => !new RegExp(token).test(next));
  if (!missing.length) return next;
  const tokenMap: Record<string, string[]> = {
    "auto-rows-": ["auto-rows-[220px]", "md:auto-rows-[280px]"],
    "grid-flow-dense": ["grid-flow-dense"],
    "grid": ["grid"],
    "space-y-4": ["space-y-4"],
    "xl:grid-cols-12": ["xl:grid-cols-12"],
  };
  const tokensToAdd = missing.flatMap((token) => tokenMap[token] ?? [token]);
  const appendTokens = (cls: string) => {
    const existing = cls.split(/\s+/).filter(Boolean);
    tokensToAdd.forEach((token) => {
      if (!existing.some((entry) => entry.includes(token))) existing.push(token);
    });
    return existing.join(" ").replace(/\s+/g, " ").trim();
  };
  const replaceOnce = (pattern: RegExp, replacer: (cls: string) => string) => {
    let applied = false;
    next = next.replace(pattern, (match, cls) => {
      if (applied) return match;
      applied = true;
      return match.replace(cls, replacer(cls));
    });
    return applied;
  };
  const patterns: RegExp[] = [
    /className=\\{`([^`]*grid[^`]*)`\\}/,
    /className=\\{'([^']*grid[^']*)'\\}/,
    /className=\\{\"([^\"]*grid[^\"]*)\"\\}/,
    /className=\"([^\"]*grid[^\"]*)\"/,
    /className='([^']*grid[^']*)'/,
    /className=\\{`([^`]*)`\\}/,
    /className=\\{'([^']*)'\\}/,
    /className=\\{\"([^\"]*)\"\\}/,
    /className=\"([^\"]*)\"/,
    /className='([^']*)'/,
  ];
  for (const pattern of patterns) {
    if (replaceOnce(pattern, appendTokens)) return next;
  }
  return next;
};

const coerceComponentPayload = (component: unknown) => {
  if (!component || typeof component === "object") return component as any;
  if (typeof component !== "string") return component as any;
  const trimmed = component.trim();
  if (!trimmed) return component as any;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") return parsed as any;
  } catch {
    // ignore parse failures and fall back to regex extraction
  }
  const nameMatch = trimmed.match(/\"name\"\\s*:\\s*\"([^\"]+)\"/);
  const codeMatch = trimmed.match(/\"code\"\\s*:\\s*`([\\s\\S]*?)`/);
  if (nameMatch && codeMatch) {
    return { name: nameMatch[1], code: codeMatch[1] };
  }
  const quotedCodeMatch = trimmed.match(/\"code\"\\s*:\\s*\"([\\s\\S]*?)\"/);
  if (nameMatch && quotedCodeMatch) {
    const raw = quotedCodeMatch[1];
    const decoded = raw
      .replace(/\\\\n/g, "\n")
      .replace(/\\\\\"/g, "\"")
      .replace(/\\\\'/g, "'")
      .replace(/\\\\\\\\/g, "\\");
    return { name: nameMatch[1], code: decoded };
  }
  return component as any;
};

const inferComponentNameFromCode = (code: string) => {
  const patterns = [
    /export\s+default\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/,
    /function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/,
    /const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*\(/,
    /const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*React\.memo\s*\(/,
  ];
  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
};

const extractComponentCode = (component: unknown): string | undefined => {
  const source = component as any;
  const candidates: unknown[] = [
    source?.code,
    source?.source,
    source?.tsx,
    source?.jsx,
    source?.content,
    source?.implementation,
    source?.componentCode,
    source?.reactCode,
    source?.render,
    source?.template,
    source?.code?.content,
    source?.content?.code,
    source?.content?.tsx,
    source?.content?.jsx,
  ];
  for (const item of candidates) {
    if (typeof item === "string" && item.trim()) return item;
  }
  if (Array.isArray(source?.code)) {
    const joined = source.code.filter((item: unknown) => typeof item === "string").join("\n");
    if (joined.trim()) return joined;
  }
  return undefined;
};

const normalizeBlockPayload = (block: unknown): SectionBlock | undefined => {
  if (!block) return undefined;
  if (typeof block === "string") return { type: block, props: {} };
  if (typeof block !== "object" || Array.isArray(block)) return undefined;
  const source = block as Record<string, unknown>;
  const type =
    typeof source.type === "string"
      ? source.type
      : typeof source.component === "string"
        ? source.component
        : typeof source.name === "string"
          ? source.name
          : typeof source.blockType === "string"
            ? source.blockType
            : undefined;
  const props =
    source.props && typeof source.props === "object" && !Array.isArray(source.props)
      ? (source.props as Record<string, unknown>)
      : source.defaultProps && typeof source.defaultProps === "object" && !Array.isArray(source.defaultProps)
        ? (source.defaultProps as Record<string, unknown>)
        : source.data && typeof source.data === "object" && !Array.isArray(source.data)
          ? (source.data as Record<string, unknown>)
          : {};
  if (!type) return undefined;
  return { type, props };
};

const normalizeSectionPayload = (
  payload: SectionPayload,
  compositionPreset?: CompositionPreset
) => {
  const component = coerceComponentPayload(payload.component);
  const block = normalizeBlockPayload(payload.block);
  let name =
    typeof component?.name === "string"
      ? component.name
      : typeof block?.type === "string"
        ? block.type
        : undefined;
  let rawCode = extractComponentCode(component);
  if (!name && rawCode) {
    name = inferComponentNameFromCode(rawCode) || undefined;
  }
  if (!name || !rawCode) return null;
  rawCode = normalizeGeneratedComponentCode(rawCode, name);
  rawCode = ensureCompositionPresetClasses(rawCode, compositionPreset);
  const resolvedBlock = block ?? { type: name, props: component?.defaultProps ?? {} };
  const blockProps =
    resolvedBlock.props && typeof resolvedBlock.props === "object"
      ? resolvedBlock.props
      : component?.defaultProps ?? {};
  return {
    component: { name, code: rawCode },
    block: { type: resolvedBlock.type || name, props: blockProps },
  };
};

const collectLayoutIssues = (
  code: string,
  layoutHint?: ArchitectSection["layoutHint"],
  themeClassMap?: ThemeClassMapBase,
  compositionPreset?: CompositionPreset,
  breakoutRequired?: boolean,
  layoutRules?: Record<string, string>,
  sectionMeta?: { id?: string; type?: string }
) => {
  const issues: string[] = [];
  if (!layoutHint) return issues;
  const normalizeStructure = (value?: string) => {
    const raw = String(value ?? "").toLowerCase().trim();
    if (!raw) return "";
    if (
      /single|center|centered|stack|vertical|banner|mono|one-col|onecol|hero/.test(raw)
    ) {
      return "single";
    }
    if (/dual|split|asymmetric|two-col|twocol|horizontal/.test(raw)) {
      return "dual";
    }
    if (/triple|three|3-col|3col/.test(raw)) {
      return "triple";
    }
    return raw;
  };
  const sectionSource = `${sectionMeta?.type ?? ""} ${sectionMeta?.id ?? ""}`;
  const sectionToken = sectionSource.toLowerCase();
  const sectionSpacedToken = sectionSource
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-z0-9]+/gi, " ")
    .toLowerCase()
    .trim();
  const sectionCompactToken = normalizeKey(sectionSource).replace(/-/g, "");
  const hasSectionKeyword = (...keywords: string[]) => {
    return keywords.some((keyword) => {
      const normalized = String(keyword).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (!normalized) return false;
      const compact = normalized.replace(/\s+/g, "");
      const boundaryPattern = new RegExp(`(?:^|\\s)${escapeRegex(normalized)}(?:$|\\s)`, "i");
      return (
        boundaryPattern.test(sectionToken) ||
        boundaryPattern.test(sectionSpacedToken) ||
        sectionCompactToken.includes(compact)
      );
    });
  };
  const isNavigationSection = hasSectionKeyword("navigation", "navbar", "header");
  const isFooterSection = hasSectionKeyword("footer");
  const isHeroSection = hasSectionKeyword("hero");
  const isCtaSection = hasSectionKeyword("cta", "call to action");
  const isContentStorySection = hasSectionKeyword(
    "content",
    "story",
    "studio story",
    "content philosophy",
    "editorial"
  );
  const { structure, density, align, list } = layoutHint;
  const normalizedStructure = normalizeStructure(structure);
  const isBentoPreset = compositionPreset?.id === "F02";
  const isCarouselPreset = compositionPreset?.id === "G02";
  const flexiblePresetIds = new Set([
    "F01",
    "G01",
    "G02",
    "G03",
    "L01",
    "L02",
    "T01",
    "T02",
    "P01",
    "P02",
    "P03",
    "S01",
    "S02",
    "CP01",
    "PRC01",
    "ST01",
    "TL01",
    "PR01",
    "CS01",
  ]);
  const isFlexiblePreset = compositionPreset?.id ? flexiblePresetIds.has(compositionPreset.id) : false;
  const hasGrid = /\bgrid\b/.test(code) || /\bgrid-cols-\d+\b/.test(code);
  const hasCols12 = /grid-cols-12/.test(code);
  const hasGap = /\b(gap-(2|3|4|5|6|8|10|12)|gap-y-(2|3|4|5|6|8|10|12)|space-y-(2|3|4|5|6|8|10|12))\b/.test(
    code
  );
  const hasResponsiveStack =
    /grid-cols-1/.test(code) && /(md:|lg:|xl:)grid-cols-\d+/.test(code);
  const hasSimpleResponsiveGrid = /(md:|lg:|xl:)grid-cols-\d+/.test(code);
  const hasResponsiveGrid = hasResponsiveStack || hasSimpleResponsiveGrid;
  const hasAnyGridCols = /grid-cols-\d+/.test(code);
  const hasFlex = /\bflex\b/.test(code) || /\bflex-(row|col)\b/.test(code);
  const hasResponsiveFlexSplit =
    /(md:|lg:|xl:)flex-(row|col)/.test(code) || /(md:|lg:|xl:)flex-\[[^\]]+\]/.test(code);
  const allowFlexSplitLayout =
    (isHeroSection || isCtaSection || isContentStorySection) && hasFlex && hasResponsiveFlexSplit;
  const skipStructureChecks = isNavigationSection;
  const isSingle = normalizedStructure === "single";
  if (
    !skipStructureChecks &&
    (normalizedStructure === "dual" || normalizedStructure === "triple" || normalizedStructure === "split")
  ) {
    if (isBentoPreset || isFlexiblePreset) {
      if (!hasGrid) issues.push("missing grid layout");
      if (!hasGap) issues.push("missing gap/spacing");
      if (!hasResponsiveGrid && !hasAnyGridCols) issues.push("missing responsive columns");
    } else {
      if (!hasGrid && !allowFlexSplitLayout) issues.push("missing grid layout");
      if (!hasCols12 && !allowFlexSplitLayout) issues.push("missing grid-cols-12");
      if (!hasGap) issues.push("missing gap/spacing");
      if (!hasResponsiveStack && !allowFlexSplitLayout) issues.push("missing responsive stacked columns");
    }
  }
  if (density && !hasGap && !isSingle && !isNavigationSection) issues.push("density requires gap/spacing");
  const asymmetricSplit = layoutRules?.asymmetricSplit;
  if (
    asymmetricSplit &&
    (normalizedStructure === "split" || normalizedStructure === "dual") &&
    !isBentoPreset &&
    !allowFlexSplitLayout &&
    !isNavigationSection
  ) {
    const hasSpan5 = /(?:^|\s)(?:\w+:)?col-span-5\b/.test(code);
    const hasSpan7 = /(?:^|\s)(?:\w+:)?col-span-7\b/.test(code);
    if (!(hasSpan5 && hasSpan7)) issues.push("missing asymmetric 5/7 grid split");
  }
  const shouldCheckAlign = !(list === "cards" || list === "tiles" || list === "rows");
  const skipAlignCheck = isNavigationSection || isFooterSection;
  const alignLocked = Boolean(layoutHint.alignLocked);
  const hasCenterAlignment = /(items-center|text-center|justify-center|mx-auto)/.test(code);
  const hasStartAlignment = /(items-start|text-left|justify-start|mr-auto)/.test(code);
  if (alignLocked && !skipAlignCheck) {
    if (align === "center" && !hasCenterAlignment) {
      issues.push("align center missing");
    }
    if (align === "start" && !hasStartAlignment) {
      issues.push("align start missing");
    }
  } else if (!skipAlignCheck && !isBentoPreset && shouldCheckAlign) {
    if (align === "start" && !hasStartAlignment) {
      issues.push("align start missing");
    }
    if (align === "center" && !hasCenterAlignment) {
      issues.push("align center missing");
    }
  }
  if (isCarouselPreset) {
    const hasSceneSwitcher = /\bSceneSwitcher\b/.test(code);
    const hasCarousel = /\bCarousel\b/.test(code) || /overflow-x-auto/.test(code) || /snap-x/.test(code);
    if (!hasSceneSwitcher) issues.push("missing scene switcher");
    if (!hasSceneSwitcher && !hasCarousel) issues.push("missing carousel");
  }
  if (themeClassMap) {
    const isTrustStripPreset = compositionPreset?.id === "L01" || compositionPreset?.id === "L02";
    const isTrustStripSection = hasSectionKeyword("trust", "logo", "badge", "endorsement", "cert");
    const requireHeadingAndBody = !(
      isTrustStripPreset ||
      isTrustStripSection ||
      isNavigationSection ||
      isFooterSection ||
      isCtaSection ||
      isContentStorySection
    );
    const requireSectionShell = !(isNavigationSection || isFooterSection || isCtaSection);
    const hasSectionPadding =
      code.includes(themeClassMap.sectionPadding) ||
      /\bpy-\d+\b/.test(code) ||
      (/\bpt-\d+\b/.test(code) && /\bpb-\d+\b/.test(code));
    const hasContainer =
      code.includes(themeClassMap.container) ||
      (/mx-auto/.test(code) &&
        (/max-w-\w+/.test(code) || /max-w-\[.*?\]/.test(code)));
    const hasHeading =
      code.includes(themeClassMap.heading) ||
      /font-heading/.test(code) ||
      /\btext-(2xl|3xl|4xl|5xl|6xl|7xl|8xl)\b/.test(code) ||
      /\btext-\[.*\]\b/.test(code);
    const hasBody =
      code.includes(themeClassMap.body) ||
      /font-body/.test(code) ||
      /text-muted-foreground/.test(code) ||
      /\btext-(sm|base|lg|xl|2xl)\b/.test(code) ||
      /\btext-\[.*\]\b/.test(code);
    if (requireSectionShell && (!hasSectionPadding || !hasContainer)) {
      issues.push("missing section padding/container");
    }
    if (requireHeadingAndBody && (!hasHeading || !hasBody)) {
      issues.push("missing heading/body typography");
    }
  }
  if (compositionPreset?.requiredClasses?.length) {
    const meetsPreset = compositionPreset.requiredClasses.every((token) => {
      if (token === "grid") return hasGrid;
      if (token === "text-center") {
        return /\btext-center\b/.test(code) || /\bitems-center\b/.test(code) || /\bjustify-center\b/.test(code);
      }
      if (token === "xl:grid-cols-12") {
        if (/\bgrid-cols-12\b/.test(code)) return true;
        if (allowFlexSplitLayout) return true;
        return false;
      }
      if (token.startsWith("space-y-")) {
        if (/\bspace-y-\d+\b/.test(code)) return true;
        if (/\bgap-(2|3|4|5|6|8|10|12)\b/.test(code)) return true;
        if (/\bgap-y-(2|3|4|5|6|8|10|12)\b/.test(code)) return true;
        if (isSingle && /flex[^"]*flex-col/.test(code)) return true;
        if (/divide-y/.test(code)) return true;
        return false;
      }
      return code.includes(token);
    });
    if (!meetsPreset) issues.push("missing composition preset classes");
  }
  if (breakoutRequired && themeClassMap?.breakout) {
    const breakoutClasses = Object.values(themeClassMap.breakout);
    const meetsDeclaredBreakout = breakoutClasses.some((token) => token && code.includes(token));
    const hasFullBleedFallback =
      /\bw-screen\b/.test(code) || /-mx-\[50vw\]/.test(code) || /\bleft-1\/2\b/.test(code);
    const hasMinHeightFallback = /\bmin-h-(screen|\[[^\]]+\]|\d+)/.test(code);
    const hasCtaBreakoutFallback =
      isCtaSection &&
      (code.includes(themeClassMap.sectionPadding) ||
        /\bpy-(16|18|20|24|28|32|36|40)\b/.test(code) ||
        /\bpt-(16|18|20|24|28|32|36|40)\b/.test(code) ||
        /\bpb-(16|18|20|24|28|32|36|40)\b/.test(code));
    const meetsBreakout =
      meetsDeclaredBreakout || hasFullBleedFallback || hasMinHeightFallback || hasCtaBreakoutFallback;
    if (!meetsBreakout) issues.push("missing breakout classes");
  }
  return issues;
};

const validateLayout = (
  code: string,
  layoutHint?: ArchitectSection["layoutHint"],
  themeClassMap?: ThemeClassMapBase,
  compositionPreset?: CompositionPreset,
  breakoutRequired?: boolean,
  layoutRules?: Record<string, string>,
  sectionMeta?: { id?: string; type?: string }
) => {
  return (
    collectLayoutIssues(
      code,
      layoutHint,
      themeClassMap,
      compositionPreset,
      breakoutRequired,
      layoutRules,
      sectionMeta
    ).length === 0
  );
};

type FailureType = "parse" | "layout" | "style" | "module" | "runtime" | "rate_limit" | "network" | "unknown";

const classifySectionError = (error: unknown): FailureType => {
  const message = ((error as any)?.message ?? String(error)).toLowerCase();
  const code = String((error as any)?.code ?? "").toLowerCase();
  if (code === "parse") return "parse";
  if (code === "layout") return "layout";
  if (code === "style") return "style";
  if (code === "tool_missing" || code === "tool_empty_payload") return "parse";
  if (message.includes("missing module") || message.includes("cannot find module")) return "module";
  if (message.includes("typeerror") || message.includes("referenceerror")) return "runtime";
  if (message.includes("rate limit") || message.includes("key limit") || message.includes(" 429")) return "rate_limit";
  if (message.includes("connection") || message.includes("econn") || message.includes("timeout")) return "network";
  return "unknown";
};

const buildRepairPrompt = (base: string) =>
  `${base}\n\n# Repair\n- 简化布局与内容，避免深层嵌套\n- 列表最多 4 项\n- 仍必须遵守 layoutHint 映射与基础 grid/gap\n- 必须使用 sectionPadding + container + heading + body（来自 Section Shell）\n- 必须遵守 Composition Preset Rules（如果存在）\n- 优先输出可用性与清晰层级\n- 只返回严格 JSON，不要 Markdown 或解释文本；必须通过工具输出 component + block`;

const ensurePropsId = (props: Record<string, unknown> | undefined, fallbackId: string) => {
  const nextProps = { ...(props ?? {}) } as Record<string, unknown>;
  if (typeof nextProps.id !== "string" || !nextProps.id) {
    nextProps.id = fallbackId;
  }
  return nextProps;
};

const ensureAnchor = (props: Record<string, unknown> | undefined, anchor: string) => {
  const nextProps = { ...(props ?? {}) } as Record<string, unknown>;
  if (typeof nextProps.anchor !== "string" || !nextProps.anchor) {
    nextProps.anchor = anchor;
  }
  return nextProps;
};

const extractSectionIdFromKey = (key: string) => {
  const parts = key.split(":");
  if (parts.length < 2) return "";
  return parts[1] || "";
};

const humanizeLabel = (value: string) => {
  const cleaned = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const normalizePromptPagePath = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const compact = withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
  return resolveCanonicalRoute(compact);
};

const stripSyntheticPromptAugmentations = (prompt: string) => {
  const raw = String(prompt || "");
  if (!raw.trim()) return raw;
  const markers = [
    raw.search(/\n#\s*Structured\s+Input\s+Contract\b/i),
    raw.search(/\n#\s*External\s+Fact\s+Pack(?:\s*\(Serper\))?/i),
  ].filter((index) => index >= 0);
  if (!markers.length) return raw;
  return raw.slice(0, Math.min(...markers)).trimEnd();
};

const slugifyRequestedPageLabel = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
    .replace(/^-+|-+$/g, "");

const inferRequestedPagePathFromLabel = (label: string) => {
  const normalizedLabel = String(label || "").trim();
  if (!normalizedLabel) return "/";
  if (/^(?:home|homepage|home page|index|首页|主页|首屏)$/i.test(normalizedLabel)) return "/";
  const routed = resolveEnterprisePagePathFromLabel(normalizedLabel);
  if (routed !== "/") return routed;
  const slug = slugifyRequestedPageLabel(normalizedLabel);
  return normalizePromptPagePath(slug ? `/${slug}` : "/");
};

const derivePageNameFromPath = (path: string) => {
  const normalized = normalizePromptPagePath(path);
  if (normalized === "/") return "Home";
  const token = normalized.split("/").filter(Boolean).pop() || "Page";
  return humanizeLabel(token);
};

const canonicalPromptRouteHeads = new Set([
  "about",
  "contact",
  "products",
  "product",
  "catalog",
  "solutions",
  "solution",
  "cases",
  "case",
  "support",
  "services",
  "service",
  "privacy",
  "terms",
  "blog",
  "news",
  "faq",
  "company",
  "team",
  "careers",
  "jobs",
]);

const looksLikeMeasurementToken = (segment: string) =>
  /^(?:[xyz]\d{2,6}(?:mm|cm|m)?|[a-z]\d{2,6}|\d{2,6}(?:mm|cm|m|rpm)?)$/i.test(segment);

const canUseGenericPromptPathMatch = (rawPrompt: string, matchIndex: number, pathValue: string) => {
  const normalized = normalizePromptPagePath(pathValue);
  if (!normalized || normalized.length > 80) return false;
  if (normalized === "/") return true;
  const segments = normalized.split("/").filter(Boolean);
  if (!segments.length || segments.some((segment) => segment.length > 40)) return false;
  if (segments.some((segment) => looksLikeMeasurementToken(segment))) return false;
  const head = String(segments[0] || "").toLowerCase();
  if (canonicalPromptRouteHeads.has(head)) return true;
  const context = rawPrompt.slice(Math.max(0, matchIndex - 48), matchIndex).toLowerCase();
  return /(route|routes|path|paths|page|pages|nav|navigation|menu|sitemap|路由|页面|导航)/i.test(context);
};

const splitRequestedPageLabelList = (value: string) =>
  String(value || "")
    .split(/\||｜|•|·|,|，|、|;|；|\n/)
    .map((item) =>
      item
        .replace(/^[\s\-–—>]+/, "")
        .replace(/\b(?:and|with|plus)\b/gi, " ")
        .replace(/^(?:nav(?:igation)?|menu|pages?|routes?)\s*[:：-]?\s*/i, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((item) => item.length >= 2 && item.length <= 48)
    .filter((item) => !/^https?:\/\//i.test(item))
    .filter(
      (item) =>
        !/(?:^|[\s])(cta|hero|footer|section|whatsapp|catalog|prototype|delivery|capabilities|capability|contact form|quote form|product portfolio)(?:[\s]|$)/i.test(
          item
        )
    );

const REQUESTED_PAGE_HINT_PATTERN =
  /(home|about|contact|products?|solutions?|cases?|support|blog|privacy|terms|pages?|routes?|导航|菜单|页面|栏目|首页|主页|产品|方案|案例|关于|联系|支持|博客|隐私|条款|公司|团队)/i;

const looksLikeRequestedPageLabel = (value: string) => {
  const label = String(value || "").trim();
  if (!label || label.length < 2 || label.length > 32) return false;
  if (/^https?:\/\//i.test(label)) return false;
  if (/^\d+(?:\.\d+)?(?:mm|cm|m|rpm|%|x)$/i.test(label)) return false;
  if (resolveEnterprisePagePathFromLabel(label) !== "/") return true;
  if (/^(?:home|homepage|home page|首页|主页|首屏)$/i.test(label)) return true;
  if (/^\/[a-z0-9\-\/]{1,32}$/i.test(label)) return true;
  if (
    /^[\u4e00-\u9fff]{2,10}$/u.test(label) &&
    /(首页|主页|关于|联系|产品|方案|案例|概况|服务|支持|资讯|招聘|团队|新闻|博客|隐私|条款|中心|页面?|页)$/u.test(label) &&
    !/(补充|完善|要求|需要|并|以及|参数|数据|资质|faq|FAQ|sandbox|站内|链接)/iu.test(label)
  ) {
    return true;
  }
  if (/^[A-Za-z][A-Za-z\s&/-]{1,26}$/.test(label) && REQUESTED_PAGE_HINT_PATTERN.test(label)) {
    return true;
  }
  return false;
};

const looksLikeRequestedPageListClause = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw || raw.length < 6 || raw.length > 260) return false;
  if (!/[|｜、,，;；]/.test(raw)) return false;
  const hintMatches = raw.match(new RegExp(REQUESTED_PAGE_HINT_PATTERN.source, "gi"));
  return (hintMatches?.length ?? 0) >= 2;
};

const collectRequestedPageLabelsFromPrompt = (prompt: string) => {
  const raw = stripSyntheticPromptAugmentations(String(prompt || ""));
  const labels: string[] = [];
  const pushLabels = (value: string) => {
    const firstSentence = String(value || "").split(/[。.!?！？]/)[0] || "";
    splitRequestedPageLabelList(firstSentence).forEach((candidate) => {
      if (!looksLikeRequestedPageLabel(candidate)) return;
      labels.push(candidate);
    });
  };

  const navMatches = Array.from(
    raw.matchAll(
      /(?:^|[\n\r。；;])\s*(?:nav(?:igation)?|menu)\s*[:：]\s*([^\n\r]{1,240})/gi
    )
  );
  navMatches.forEach((match) => {
    pushLabels(match[1] || "");
  });

  const zhNavMatches = Array.from(
    raw.matchAll(
      /(?:^|[\n\r。；;])\s*(?:导航(?:栏)?|菜单|页面清单|栏目(?:清单)?|导航菜单)\s*[:：]\s*([^\n\r]{1,260})/gim
    )
  );
  zhNavMatches.forEach((match) => {
    pushLabels(match[1] || "");
  });

  const explicitPageListMatches = Array.from(
    raw.matchAll(
      /(?:with|including|featuring|contains?)\s+([^.\n\r]{1,240}?)\s+(?:pages|routes)(?=[\s,.;]|$)/gi
    )
  );
  explicitPageListMatches.forEach((match) => {
    pushLabels(match[1] || "");
  });

  const zhExplicitPageListMatches = Array.from(
    raw.matchAll(
      /(?:包含|包括|涵盖|含有|需(?:要)?包含|网站包含|页面包含)\s*[:：]?\s*([^\n\r。；;]{2,260})(?=[。；;\n\r]|$)/gim
    )
  );
  zhExplicitPageListMatches.forEach((match) => {
    const candidate = String(match[1] || "");
    if (!looksLikeRequestedPageListClause(candidate)) return;
    pushLabels(candidate);
  });

  const deduped: string[] = [];
  const seen = new Set<string>();
  labels.forEach((label) => {
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(label);
  });
  return deduped;
};

const extractRequestedPagesFromPrompt = (prompt: string) => {
  const raw = stripSyntheticPromptAugmentations(String(prompt || ""));
  const useChinese = shouldUseChineseContent(raw);
  const matches = Array.from(
    raw.matchAll(/(?:^|[\s,，、;；:：(\[（【])\/([a-zA-Z0-9\-\/{}]*)(?:\s*[（(]([^()（）]{1,40})[)）])?/g)
  );
  const indexByPath = new Map<string, number>();
  const pages: Array<{ path: string; name: string }> = [];
  const pushPage = (pathValue: string, nameValue: string) => {
    const normalizedPath = normalizePromptPagePath(pathValue);
    if (normalizedPath.length > 80) return;
    const normalizedName = String(nameValue || "").trim().replace(/[：:]+$/g, "").trim();
    const fallbackName = derivePageNameFromPath(normalizedPath);
    const existingIndex = indexByPath.get(normalizedPath);
    if (typeof existingIndex === "number") {
      const existing = pages[existingIndex];
      if (!existing) return;
      if (normalizedName && (existing.name === fallbackName || !existing.name.trim())) {
        existing.name = normalizedName.slice(0, 48);
      }
      return;
    }
    pages.push({
      path: normalizedPath,
      name: (normalizedName || fallbackName).slice(0, 48),
    });
    indexByPath.set(normalizedPath, pages.length - 1);
  };
  matches.forEach((match) => {
    const pathPart = typeof match[1] === "string" ? match[1] : "";
    const cursor = match.index ?? -1;
    if (!pathPart && /https?:\/\//i.test(raw)) {
      if (cursor >= 0) {
        const neighborhood = raw.slice(Math.max(0, cursor - 12), cursor + 12).toLowerCase();
        if (neighborhood.includes("http://") || neighborhood.includes("https://")) return;
      }
    }
    if (/\./.test(pathPart)) return;
    if (/[{}:*]/.test(pathPart)) return;
    if (/^(www|http|https|com|cn|net|org)$/i.test(pathPart)) return;
    const normalizedPath = normalizePromptPagePath(pathPart ? `/${pathPart}` : "/");
    if (/\/page-$/.test(normalizedPath)) return;
    if (cursor >= 0 && !canUseGenericPromptPathMatch(raw, cursor, normalizedPath)) return;
    const rawName = typeof match[2] === "string" ? match[2].trim() : "";
    const name =
      rawName && (useChinese || !/[\u4e00-\u9fff]/.test(rawName))
        ? rawName.slice(0, 48)
        : derivePageNameFromPath(normalizedPath);
    pushPage(normalizedPath, name || derivePageNameFromPath(normalizedPath));
  });
  const routeListMatches = Array.from(
    raw.matchAll(/(?:^|\n)\s*[-*]\s*\/([a-zA-Z0-9\-\/{}]*)\s*(?:\(([^)（）:\n]{1,30})\)|([^\n:：]{1,24}))?\s*[:：]/g)
  );
  routeListMatches.forEach((match) => {
    const pathPart = typeof match[1] === "string" ? match[1] : "";
    if (/\./.test(pathPart)) return;
    if (/[{}:*]/.test(pathPart)) return;
    if (/^(www|http|https|com|cn|net|org)$/i.test(pathPart)) return;
    const normalizedPath = normalizePromptPagePath(pathPart ? `/${pathPart}` : "/");
    if (/\/page-$/.test(normalizedPath)) return;
    const rawName = String(match[2] || match[3] || "")
      .replace(/[()（）]/g, "")
      .replace(/^(?:page|页面)\s*/i, "")
      .trim();
    const nameCandidate =
      rawName && (useChinese || !/[\u4e00-\u9fff]/.test(rawName)) ? rawName.slice(0, 48) : derivePageNameFromPath(normalizedPath);
    pushPage(normalizedPath, nameCandidate);
  });
  collectRequestedPageLabelsFromPrompt(raw).forEach((label) => {
    const path = inferRequestedPagePathFromLabel(label);
    pushPage(path, label);
  });
  return pages;
};

const ensurePromptRequestedPages = (
  blueprint: ArchitectBlueprint | null | undefined,
  prompt: string
): ArchitectBlueprint | null | undefined => {
  if (!blueprint || typeof blueprint !== "object") return blueprint;
  const requestedPages = extractRequestedPagesFromPrompt(prompt);
  if (!requestedPages.length) return blueprint;
  const existingPages = Array.isArray(blueprint.pages) ? blueprint.pages : [];
  const byPath = new Map(
    existingPages.map((page) => [normalizePromptPagePath(String(page?.path || "")), page] as const)
  );
  requestedPages.forEach((requested) => {
    if (byPath.has(requested.path)) return;
    existingPages.push({
      path: requested.path,
      name: requested.name,
      sections: [],
    });
  });
  return { ...blueprint, pages: existingPages };
};

const ensureEnterpriseLegalBlueprintPages = (pages: any[], prompt: string) => {
  const existingPages = Array.isArray(pages) ? [...pages] : [];
  const byPath = new Set(
    existingPages.map((page, index) =>
      normalizePromptPagePath(String(page?.path || (index === 0 ? "/" : `/page-${index + 1}`)))
    )
  );
  const useChinese = shouldUseChineseContent(prompt);
  if (!byPath.has("/privacy")) {
    existingPages.push({
      path: "/privacy",
      name: useChinese ? "隐私政策" : "Privacy",
      sections: [],
    });
    byPath.add("/privacy");
  }
  const hasTermsSignal = /(?:terms?|条款|服务条款|legal|tos|user[-\s]?agreement|法律声明)/i.test(String(prompt || ""));
  if (hasTermsSignal && !byPath.has("/terms")) {
    existingPages.push({
      path: "/terms",
      name: useChinese ? "服务条款" : "Terms",
      sections: [],
    });
    byPath.add("/terms");
  }
  return existingPages;
};

const hasStructuredCatalogContractSignal = (brief: StructuredBrief | null | undefined) =>
  (Array.isArray(brief?.productDetails) && brief!.productDetails!.length > 0) ||
  (Array.isArray(brief?.productItems) && brief!.productItems!.length > 0);

const hasStructuredCatalogContractSignalFromPrompt = (prompt: string) => {
  const raw = String(prompt || "");
  if (!/#\s*Structured\s+Input\s+Contract\b/i.test(raw)) return false;
  if (/"productCount"\s*:\s*[1-9]\d*/i.test(raw)) return true;
  return /"products"\s*:\s*\[[\s\S]*\{[\s\S]*\}/i.test(raw);
};

const extractStructuredProductCountFromPrompt = (prompt: string) => {
  const raw = String(prompt || "");
  const productCountMatch = raw.match(/"productCount"\s*:\s*(\d+)/i);
  if (productCountMatch?.[1]) return Math.max(0, Number(productCountMatch[1]));
  const productsArrayMatch = raw.match(/"products"\s*:\s*\[([\s\S]*?)\]\s*(?:,|\n|$)/i);
  if (!productsArrayMatch?.[1]) return 0;
  const objectCount = (productsArrayMatch[1].match(/\{/g) || []).length;
  return Math.max(0, objectCount);
};

const extractStructuredCatalogPageSizeFromPrompt = (prompt: string) => {
  const raw = String(prompt || "");
  const match = raw.match(/"catalogPageSize"\s*:\s*(\d+)/i);
  if (!match?.[1]) return 0;
  return Math.max(0, Number(match[1]));
};

const ensureStructuredDualChainPages = (
  pages: any[],
  prompt: string,
  structuredBrief: StructuredBrief | null | undefined
) => {
  if (!hasStructuredCatalogContractSignal(structuredBrief) && !hasStructuredCatalogContractSignalFromPrompt(prompt)) {
    return Array.isArray(pages) ? pages : [];
  }
  const useChinese = shouldUseChineseContent(prompt);
  const includeCases = Array.isArray(structuredBrief?.caseItems) && structuredBrief!.caseItems!.length > 0;
  const includeSolutions = Array.isArray(structuredBrief?.featureItems) && structuredBrief!.featureItems!.length > 0;
  const includeTerms = /(?:terms?|条款|服务条款|legal|tos|user[-\s]?agreement|法律声明)/i.test(String(prompt || ""));
  const totalProducts = (() => {
    if (Array.isArray(structuredBrief?.productDetails) && structuredBrief!.productDetails!.length > 0) {
      return structuredBrief!.productDetails!.length;
    }
    if (Array.isArray(structuredBrief?.productItems) && structuredBrief!.productItems!.length > 0) {
      return structuredBrief!.productItems!.length;
    }
    return extractStructuredProductCountFromPrompt(prompt);
  })();
  const catalogPageSizeFromPrompt = extractStructuredCatalogPageSizeFromPrompt(prompt);
  const catalogPageSize = clampPositiveInt(
    Number(structuredBrief?.catalogPageSize || catalogPageSizeFromPrompt || process.env.BUILDER_CATALOG_PAGE_SIZE || 12),
    12,
    6,
    24
  );
  const catalogPageCount = totalProducts > 0 ? Math.ceil(totalProducts / Math.max(1, catalogPageSize)) : 1;
  const minimalPages: Array<{ path: string; name: string }> = [
    { path: "/", name: useChinese ? "首页" : "Home" },
    { path: "/about", name: useChinese ? "关于我们" : "About" },
    { path: "/contact", name: useChinese ? "联系我们" : "Contact" },
    { path: "/products", name: useChinese ? "产品中心" : "Products" },
    ...Array.from({ length: Math.max(0, catalogPageCount - 1) }, (_, index) => ({
      path: `/products/page-${index + 2}`,
      name: useChinese ? `产品目录第${index + 2}页` : `Products Page ${index + 2}`,
    })),
    ...(includeSolutions ? [{ path: "/solutions", name: useChinese ? "解决方案" : "Solutions" }] : []),
    ...(includeCases ? [{ path: "/cases", name: useChinese ? "应用案例" : "Cases" }] : []),
    { path: "/privacy", name: useChinese ? "隐私政策" : "Privacy" },
    ...(includeTerms ? [{ path: "/terms", name: useChinese ? "服务条款" : "Terms" }] : []),
  ];
  const existingByPath = new Map<string, Record<string, unknown>>();
  (Array.isArray(pages) ? pages : []).forEach((page, index) => {
    const normalizedPath = normalizePromptPagePath(String(page?.path || (index === 0 ? "/" : `/page-${index + 1}`)));
    if (!normalizedPath) return;
    if (!existingByPath.has(normalizedPath) && page && typeof page === "object") {
      existingByPath.set(normalizedPath, page as Record<string, unknown>);
    }
  });
  const requiredList = minimalPages.map((requiredPage) => {
    const existing = existingByPath.get(requiredPage.path);
    if (existing) {
      return {
        ...existing,
        path: requiredPage.path,
        name:
          typeof existing.name === "string" && String(existing.name).trim()
            ? String(existing.name).trim()
            : requiredPage.name,
      };
    }
    return {
      path: requiredPage.path,
      name: requiredPage.name,
      sections: [],
    };
  });
  const preservedCatalogChildren = Array.from(existingByPath.entries())
    .filter(([pathValue]) => /^\/products\/(?:page-\d+|[^/]+)$/i.test(pathValue))
    .filter(([pathValue]) => !/\/products\/page-$/.test(pathValue))
    .map(([, page]) => page);
  return [...requiredList, ...preservedCatalogChildren];
};

const ensureEnterpriseBlueprintPages = (
  blueprint: ArchitectBlueprint | null | undefined,
  prompt: string
): ArchitectBlueprint | null | undefined => {
  if (!blueprint || typeof blueprint !== "object") return blueprint;
  const requestedPages = extractRequestedPagesFromPrompt(prompt);
  const structuredBrief = parseStructuredBrief(prompt);
  const hasStructuredNavContract = (structuredBrief?.nav?.length ?? 0) >= 3;
  const hasStructuredCatalogContract =
    hasStructuredCatalogContractSignal(structuredBrief) || hasStructuredCatalogContractSignalFromPrompt(prompt);
  const existingPages = Array.isArray(blueprint.pages) ? blueprint.pages : [];
  if (!looksLikeEnterpriseWebsite({ prompt, pages: existingPages })) return blueprint;
  let pages = ensureEnterpriseLegalBlueprintPages(existingPages, prompt);
  if (hasStructuredCatalogContract) {
    pages = ensureStructuredDualChainPages(pages, prompt, structuredBrief);
  } else if (requestedPages.length < 3 && !hasStructuredNavContract) {
    pages = ensureEnterpriseSitePages(
      pages,
      (definition) => ({
        path: definition.path,
        name: definition.name,
        sections: [],
      }),
      { prompt }
    );
  }
  return { ...blueprint, pages };
};

const compactNavbarLabel = (label: string) => {
  const words = label.split(" ").filter(Boolean);
  if (!words.length) return label;
  let englishCount = 0;
  const filtered = words.filter((word) => {
    const hasEnglish = /[A-Za-z]/.test(word);
    if (!hasEnglish) return true;
    if (englishCount >= 2) return false;
    englishCount += 1;
    return true;
  });
  let compacted = filtered.join(" ");
  if (!compacted) compacted = words[0];
  if (compacted.length > 14) compacted = filtered[0] || words[0];
  return compacted;
};

const sanitizeBrandCandidate = (value: string): string => sanitizeBrandCandidateShared(value);

const extractPromptBrandName = (prompt: string): string => extractBrandNameFromPromptShared(prompt);

const resolveLocaleDefaults = (prompt: string) => {
  const useChinese = shouldUseChineseContent(prompt);
  return {
    useChinese,
    home: useChinese ? "首页" : "Home",
    section: useChinese ? "页面" : "Section",
    contact: useChinese ? "联系我们" : "Contact",
    pricing: useChinese ? "价格方案" : "Pricing",
    startTrial: useChinese ? "开始试用" : "Start Trial",
    getStarted: useChinese ? "立即开始" : "Get Started",
    productsTitle: useChinese ? "产品中心" : "Products",
    supportTitle: useChinese ? "服务支持" : "Support",
    legalTitle: useChinese ? "法律信息" : "Legal",
    catalog: useChinese ? "产品目录" : "Catalog",
    cases: useChinese ? "应用案例" : "Cases",
    requestQuote: useChinese ? "获取报价" : "Request Quote",
    privacy: useChinese ? "隐私政策" : "Privacy",
    company: useChinese ? "公司" : "Company",
    utility: useChinese ? "企业官网系统" : "Corporate website system",
    languageTag: useChinese ? "中" : "EN",
    addressFallback: useChinese ? "中国" : "Global",
    defaultRights:
      useChinese
        ? (brand: string) => `© ${new Date().getFullYear()} ${brand} 版权所有`
        : (brand: string) => `© ${new Date().getFullYear()} ${brand}. All rights reserved.`,
  };
};

const defaultPageLabelForPath = (path: string, prompt: string) => {
  const locale = resolveLocaleDefaults(prompt);
  const normalizedPath = normalizePromptPagePath(String(path || "/"));
  const pageType = inferEnterprisePageTypeFromPath(normalizedPath);
  const mapZh: Record<string, string> = {
    home: "首页",
    products: "产品中心",
    solutions: "解决方案",
    cases: "应用案例",
    about: "关于我们",
    contact: "联系我们",
    pricing: "价格方案",
    support: "服务支持",
    blog: "新闻资讯",
    legal: "法律信息",
    generic: "页面",
  };
  const mapEn: Record<string, string> = {
    home: "Home",
    products: "Products",
    solutions: "Solutions",
    cases: "Cases",
    about: "About",
    contact: "Contact",
    pricing: "Pricing",
    support: "Support",
    blog: "Blog",
    legal: "Legal",
    generic: "Page",
  };
  return locale.useChinese ? mapZh[pageType] || mapZh.generic : mapEn[pageType] || mapEn.generic;
};

const resolveLocalizedPageLabel = (rawLabel: string, path: string, prompt: string) => {
  const fallback = defaultPageLabelForPath(path, prompt);
  const normalizedRaw = String(rawLabel || "").trim();
  if (!normalizedRaw) return fallback;
  const locale = resolveLocaleDefaults(prompt);
  if (!locale.useChinese) return normalizedRaw;
  const hasCjk = /[\u3400-\u9fff]/.test(normalizedRaw);
  const englishOnly = /^[A-Za-z0-9\s&+/_-]{2,40}$/.test(normalizedRaw);
  if (!hasCjk && englishOnly) return fallback;
  return normalizedRaw;
};

const buildNavbarLinks = (
  page: ReturnType<typeof normalizePages>[number],
  linkGraph?: SiteLinkGraph,
  prompt?: string
) => {
  const locale = resolveLocaleDefaults(String(prompt || ""));
  if (linkGraph?.navigationLinks?.length) {
    return linkGraph.navigationLinks.map((link) => ({ ...link }));
  }
  const sections = Array.isArray(page.sections) ? page.sections : [];
  const links = sections
    .filter((section) => {
      const type = typeof section.type === "string" ? section.type.toLowerCase() : "";
      const id = typeof section.id === "string" ? section.id.toLowerCase() : "";
      if (!section.id) return false;
      if (type.includes("footer") || id.includes("footer")) return false;
      if (type.includes("navbar") || id.includes("navbar")) return false;
      return true;
    })
    .slice(0, 6)
    .map((section) => {
      const label = humanizeLabel(String(section.id || section.type || locale.section));
      const compacted = compactNavbarLabel(label);
      return { label: compacted || locale.section, href: `#${section.id}`, variant: "link" as const };
    });
  return links.length ? links : [{ label: locale.home, href: "#top", variant: "link" as const }];
};

const buildNavbarCtas = (
  page: ReturnType<typeof normalizePages>[number],
  linkGraph?: SiteLinkGraph,
  prompt?: string
) => {
  const locale = resolveLocaleDefaults(String(prompt || ""));
  if (linkGraph?.defaultNavCtas?.length) {
    return linkGraph.defaultNavCtas.map((cta) => ({ ...cta }));
  }
  const sections = Array.isArray(page.sections) ? page.sections : [];
  const target = sections.find((section) => {
    const key = `${section.id ?? ""} ${section.type ?? ""}`.toLowerCase();
    return /contact|cta|signup|pricing|trial|start/.test(key);
  });
  if (!target?.id) return undefined;
  const key = String(target.id).toLowerCase();
  const label = key.includes("contact")
    ? locale.contact
    : key.includes("pricing")
      ? locale.pricing
      : key.includes("trial")
        ? locale.startTrial
        : locale.getStarted;
  return [{ label, href: `#${target.id}`, variant: "primary" as const }];
};

const buildNavbarProps = (
  page: ReturnType<typeof normalizePages>[number],
  theme: Record<string, unknown>,
  linkGraph?: SiteLinkGraph,
  prompt?: string
) => {
  const headingFont = typeof (theme as any)?.fontHeading === "string" ? (theme as any).fontHeading : undefined;
  const bodyFont = typeof (theme as any)?.fontBody === "string" ? (theme as any).fontBody : undefined;
  const nameSeed = typeof page.name === "string" ? page.name : page.path || "home";
  const idSuffix = normalizeKey(nameSeed) || "home";
  const promptBrand =
    extractPromptBrandName(String(prompt || "")) || extractBrandNameFromPromptLite(String(prompt || ""));
  const logoAlt = promptBrand || "Company";
  const links = buildNavbarLinks(page, linkGraph, prompt);
  const ctas = buildNavbarCtas(page, linkGraph, prompt) ?? [];
  const hasChildren = links.some(
    (link) => Array.isArray((link as any).children) && (link as any).children.length > 0
  );
  const variant = ctas.length ? "withCTA" : hasChildren ? "withDropdown" : "simple";
  const base = {
    id: `navbar-${idSuffix}`,
    anchor: "top",
    logo: { alt: logoAlt },
    links,
    ctas,
    variant,
    sticky: true,
    paddingY: "sm",
    maxWidth: "xl",
    headingFont,
    bodyFont,
  };
  return linkGraph ? applyLinkGraphToNavbarProps(base as Record<string, unknown>, linkGraph) : base;
};

const buildFooterColumns = (
  page: ReturnType<typeof normalizePages>[number],
  linkGraph?: SiteLinkGraph,
  prompt?: string
) => {
  const locale = resolveLocaleDefaults(String(prompt || ""));
  if (linkGraph?.footerColumns?.length) {
    return linkGraph.footerColumns.map((column) => ({
      ...column,
      links: column.links.map((link) => ({ ...link })),
    }));
  }
  const sections = Array.isArray(page.sections) ? page.sections : [];
  const sectionLinks = sections
    .filter((section) => {
      const type = typeof section.type === "string" ? section.type.toLowerCase() : "";
      const id = typeof section.id === "string" ? section.id.toLowerCase() : "";
      if (!section.id) return false;
      if (type.includes("footer") || id.includes("footer")) return false;
      if (type.includes("navbar") || id.includes("navbar")) return false;
      return true;
    })
    .slice(0, 5)
    .map((section) => ({
      label: humanizeLabel(String(section.id || section.type || "Section")) || "Section",
      href: `#${section.id}`,
      variant: "link" as const,
    }));

  return [
    {
      title: locale.productsTitle,
      links: sectionLinks.length
        ? sectionLinks.slice(0, 2)
        : [
            { label: locale.catalog, href: "#products", variant: "link" as const },
            { label: locale.cases, href: "#cases", variant: "link" as const },
          ],
    },
    {
      title: locale.supportTitle,
      links: [
        { label: locale.contact, href: "#contact", variant: "primary" as const },
        { label: locale.requestQuote, href: "#contact", variant: "secondary" as const },
      ],
    },
    {
      title: locale.legalTitle,
      links: [{ label: locale.privacy, href: "#privacy", variant: "link" as const }],
    },
  ];
};

const buildFooterProps = (
  page: ReturnType<typeof normalizePages>[number],
  theme: Record<string, unknown>,
  linkGraph?: SiteLinkGraph,
  prompt?: string
) => {
  const locale = resolveLocaleDefaults(String(prompt || ""));
  const headingFont = typeof (theme as any)?.fontHeading === "string" ? (theme as any).fontHeading : undefined;
  const bodyFont = typeof (theme as any)?.fontBody === "string" ? (theme as any).fontBody : undefined;
  const nameSeed = typeof page.name === "string" ? page.name : page.path || "home";
  const idSuffix = normalizeKey(nameSeed) || "home";
  const promptBrand = extractPromptBrandName(String(prompt || ""));
  const footerBrand = promptBrand || page.name || "Company";
  const base = {
    id: `footer-${idSuffix}`,
    anchor: "footer",
    logoText: footerBrand,
    columns: buildFooterColumns(page, linkGraph, prompt),
    legal: locale.defaultRights(footerBrand),
    headingFont,
    bodyFont,
    variant: "multiColumn" as const,
    paddingY: "md" as const,
    maxWidth: "xl" as const,
  };
  return linkGraph ? applyLinkGraphToFooterProps(base as Record<string, unknown>, linkGraph) : base;
};

const isNavbarLikeBlock = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  const type = typeof item?.type === "string" ? item.type.toLowerCase() : "";
  const anchor = typeof item?.props?.anchor === "string" ? item.props.anchor.toLowerCase() : "";
  const id = typeof item?.props?.id === "string" ? item.props.id.toLowerCase() : "";
  if (type === errorComponentName.toLowerCase()) {
    return false;
  }
  return type.includes("navbar") || type.includes("navigation") || anchor === "top" || id.includes("navbar");
};

const isFooterLikeBlock = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  const type = typeof item?.type === "string" ? item.type.toLowerCase() : "";
  const anchor = typeof item?.props?.anchor === "string" ? item.props.anchor.toLowerCase() : "";
  const id = typeof item?.props?.id === "string" ? item.props.id.toLowerCase() : "";
  const props = (item?.props ?? {}) as Record<string, unknown>;
  const footerAnchor = anchor.includes("footer") && !anchor.includes("cta");
  const footerId = id.includes("footer") && !id.includes("cta") && !id.includes("contact");
  const typeFooter = type.includes("footer");
  const hasFooterPayload =
    (Array.isArray((props as any).columns) && (props as any).columns.length > 0) ||
    (Array.isArray((props as any).footerLinks) && (props as any).footerLinks.length > 0) ||
    (typeof (props as any).legal === "string" && String((props as any).legal).trim().length > 0) ||
    (typeof (props as any).copytext === "string" &&
      /all rights reserved|copyright|©/i.test(String((props as any).copytext)));
  if (type === errorComponentName.toLowerCase()) {
    return false;
  }
  if (type === fallbackComponentName.toLowerCase()) {
    return footerAnchor || hasFooterPayload;
  }
  return typeFooter || (footerAnchor && (typeFooter || footerId));
};

const isTemplateExclusiveBlock = (item: { type?: string; props?: Record<string, unknown> } | undefined) =>
  /^TemplateExclusive/i.test(String(item?.type || ""));

const isCtaLikeBlock = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  const type = typeof item?.type === "string" ? item.type.toLowerCase() : "";
  const anchor = typeof item?.props?.anchor === "string" ? item.props.anchor.toLowerCase() : "";
  const id = typeof item?.props?.id === "string" ? item.props.id.toLowerCase() : "";
  const variant = typeof item?.props?.variant === "string" ? item.props.variant.toLowerCase() : "";
  const productLike =
    /(product|catalog|collection|sku|store|shop|module|capability)/.test(type) ||
    /(product|catalog|collection|sku|store|shop|module|capability)/.test(anchor) ||
    /(product|catalog|collection|sku|store|shop|module|capability)/.test(id);
  if (type === errorComponentName.toLowerCase()) {
    return false;
  }
  if (productLike) {
    return false;
  }
  if (type === fallbackComponentName.toLowerCase()) {
    return variant === "cta" || anchor.includes("cta") || id.includes("cta");
  }
  return type.includes("leadcapture") || type.includes("cta") || anchor.includes("cta") || id.includes("cta");
};

const footerProvidesCta = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  if (!isFooterLikeBlock(item)) return false;
  const props = (item?.props ?? {}) as Record<string, unknown>;
  if (props.primaryCta && typeof props.primaryCta === "object") return true;
  if (props.secondaryCta && typeof props.secondaryCta === "object") return true;
  if (props.cta && typeof props.cta === "object") return true;
  if (Array.isArray((props as any).ctas) && (props as any).ctas.length > 0) return true;
  return false;
};

const pageHasFooterBlock = (content: Array<{ type?: string; props?: Record<string, unknown> }>) =>
  content.some((item) => isFooterLikeBlock(item));

const pageHasCtaBlock = (content: Array<{ type?: string; props?: Record<string, unknown> }>) =>
  content.some((item) => isCtaLikeBlock(item) || footerProvidesCta(item));

const pageHasNavigationSection = (page: ReturnType<typeof normalizePages>[number]) =>
  Array.isArray(page?.sections) &&
  page.sections.some((section) => {
    const token = `${section?.type ?? ""} ${section?.id ?? ""}`.toLowerCase();
    return /(?:^|\s)(navigation|navbar|nav|header)\b/.test(token);
  });

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const hasRenderableComponentShape = (value: unknown) => {
  if (!isObjectRecord(value)) return false;
  const code =
    typeof value.code === "string"
      ? value.code
      : typeof value.source === "string"
        ? value.source
        : typeof value.tsx === "string"
          ? value.tsx
          : typeof value.jsx === "string"
            ? value.jsx
            : undefined;
  return typeof value.name === "string" && Boolean(code);
};

const coercePayloadFromUnknown = (value: unknown): SectionPayload | null => {
  if (!isObjectRecord(value)) return null;
  const payload = value as Record<string, unknown>;

  let component: unknown =
    payload.component ?? payload.sectionComponent ?? payload.generatedComponent ?? payload.componentPayload;
  if (!component && hasRenderableComponentShape(payload)) {
    component = payload;
  }
  component = coerceComponentPayload(component);

  let block: unknown = payload.block ?? payload.sectionBlock ?? payload.generatedBlock ?? payload.blockPayload;
  if (!block) {
    const inferredType =
      typeof payload.type === "string"
        ? payload.type
        : typeof payload.blockType === "string"
          ? payload.blockType
          : typeof payload.component === "string"
            ? payload.component
            : typeof payload.block === "string"
              ? payload.block
              : undefined;
    if (inferredType) {
      block = {
        type: inferredType,
        props: isObjectRecord(payload.props)
          ? payload.props
          : isObjectRecord(payload.defaultProps)
            ? payload.defaultProps
            : {},
      };
    }
  }

  if (!component && !block) return null;
  return {
    component: component as SectionComponent | undefined,
    block: block as SectionBlock | undefined,
  };
};

const collectPayloadCandidates = (value: unknown, depth = 0): SectionPayload[] => {
  if (depth > 5 || value == null) return [];
  if (typeof value === "string") {
    const parsed = safeJsonParse<unknown>(value);
    if (!parsed) return [];
    return collectPayloadCandidates(parsed, depth + 1);
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectPayloadCandidates(entry, depth + 1));
  }
  if (!isObjectRecord(value)) return [];

  const results: SectionPayload[] = [];
  const direct = coercePayloadFromUnknown(value);
  if (direct) results.push(direct);

  const preferredKeys = [
    "payload",
    "result",
    "data",
    "response",
    "output",
    "input",
    "arguments",
    "json",
    "value",
    "message",
    "content",
    "tool_input",
    "toolUse",
    "tool_use",
  ];
  const keySet = new Set(preferredKeys);
  for (const key of preferredKeys) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      results.push(...collectPayloadCandidates((value as Record<string, unknown>)[key], depth + 1));
    }
  }
  for (const [key, nestedValue] of Object.entries(value)) {
    if (keySet.has(key)) continue;
    results.push(...collectPayloadCandidates(nestedValue, depth + 1));
  }

  return results;
};

const dedupePayloads = (items: SectionPayload[]) => {
  const seen = new Set<string>();
  const out: SectionPayload[] = [];
  for (const item of items) {
    const key = JSON.stringify({
      componentName: (item.component as any)?.name ?? "",
      componentCodeLen:
        typeof (item.component as any)?.code === "string"
          ? (item.component as any).code.length
          : typeof (item.component as any)?.source === "string"
            ? (item.component as any).source.length
            : 0,
      blockType: item.block?.type ?? "",
      blockPropsKeys:
        item.block?.props && typeof item.block.props === "object"
          ? Object.keys(item.block.props).sort()
          : [],
    });
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
};

const decodeJsonLikeString = (value: string) => {
  let out = "";
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char !== "\\") {
      out += char;
      continue;
    }
    const next = value[i + 1];
    if (!next) {
      out += "\\";
      break;
    }
    if (next === "n") {
      out += "\n";
      i += 1;
      continue;
    }
    if (next === "r") {
      out += "\r";
      i += 1;
      continue;
    }
    if (next === "t") {
      out += "\t";
      i += 1;
      continue;
    }
    if (next === "\"" || next === "'" || next === "\\" || next === "/") {
      out += next;
      i += 1;
      continue;
    }
    if (next === "u") {
      const unicodeHex = value.slice(i + 2, i + 6);
      if (/^[0-9a-fA-F]{4}$/.test(unicodeHex)) {
        out += String.fromCharCode(Number.parseInt(unicodeHex, 16));
        i += 5;
        continue;
      }
    }
    out += next;
    i += 1;
  }
  return out;
};

const extractBalancedObjectFrom = (value: string, start: number) => {
  if (start < 0 || start >= value.length || value[start] !== "{") return "";
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < value.length; i += 1) {
    const char = value[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return value.slice(start, i + 1);
    }
  }
  return "";
};

const extractJsonLikeStringField = (
  value: string,
  field: string,
  sentinels: string[]
) => {
  const fieldMatch = new RegExp(`"${escapeRegex(field)}"\\s*:\\s*"`, "m").exec(value);
  if (!fieldMatch) return "";
  const start = fieldMatch.index + fieldMatch[0].length;
  let end = -1;
  for (const sentinel of sentinels) {
    const idx = value.indexOf(sentinel, start);
    if (idx < 0) continue;
    end = end < 0 ? idx : Math.min(end, idx);
  }
  let segment = end >= 0 ? value.slice(start, end) : value.slice(start);
  segment = segment.replace(/"\s*,\s*$/, "");
  segment = segment.replace(/"\s*$/, "");
  if (!segment.trim()) return "";
  return decodeJsonLikeString(segment);
};

const extractJsonLikeObjectField = (value: string, field: string) => {
  const fieldMatch = new RegExp(`"${escapeRegex(field)}"\\s*:\\s*`, "m").exec(value);
  if (!fieldMatch) return null;
  const rest = value.slice(fieldMatch.index + fieldMatch[0].length);
  const objectStartOffset = rest.indexOf("{");
  if (objectStartOffset < 0) return null;
  const objectText = extractBalancedObjectFrom(rest, objectStartOffset);
  if (!objectText) return null;
  return safeJsonParse<Record<string, unknown>>(objectText);
};

const parseJsonishSectionPayload = (raw: string): SectionPayload | null => {
  const candidate = extractJsonCandidate(raw);
  if (!candidate.includes("\"component\"")) return null;

  const componentNameMatch = candidate.match(
    /"component"\s*:\s*\{[\s\S]*?"name"\s*:\s*"([^"]+)"/m
  );
  const componentName = componentNameMatch?.[1]?.trim();
  const componentCode = extractJsonLikeStringField(candidate, "code", [
    "\n    \"defaultProps\"",
    "\n  },\n  \"block\"",
    "\n    \"schema\"",
    "\n    \"config\"",
    "\n  }\n}",
  ]);
  if (!componentName || !componentCode) return null;

  const defaultProps = extractJsonLikeObjectField(candidate, "defaultProps") ?? undefined;
  const blockTypeMatch = candidate.match(/"block"\s*:\s*\{[\s\S]*?"type"\s*:\s*"([^"]+)"/m);
  const blockType = blockTypeMatch?.[1]?.trim() || componentName;
  const blockProps = extractJsonLikeObjectField(candidate, "props") ?? defaultProps ?? {};

  return {
    component: { name: componentName, code: componentCode, defaultProps },
    block: { type: blockType, props: blockProps },
  };
};

const parseNdjsonPayloads = (raw: string) => {
  const candidate = extractJsonCandidate(raw);
  const lines = candidate
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const parsedLines = lines
    .map((line) => safeJsonParse<NdjsonLinePayload>(line))
    .filter((item): item is NdjsonLinePayload => Boolean(item));

  if (parsedLines.length) {
    const component = parsedLines.find((item) => item.component)?.component;
    const block = parsedLines.find((item) => item.block)?.block;
    const combined = component || block ? [{ component, block }] : [];
    const linewise = parsedLines
      .map((entry) => ({
        component: entry.component,
        block: entry.block,
      }))
      .filter((entry) => entry.component || entry.block);
    const extracted = parsedLines.flatMap((entry) => collectPayloadCandidates(entry));
    const merged = dedupePayloads([...combined, ...linewise, ...extracted]);
    if (merged.length) return merged;
  }

  const parsedRoots: unknown[] = [];
  const fallback = safeJsonParse<unknown>(candidate);
  if (fallback) parsedRoots.push(fallback);
  extractJsonObjects(candidate).forEach((item) => {
    const parsed = safeJsonParse<unknown>(item);
    if (parsed) parsedRoots.push(parsed);
  });
  if (!parsedRoots.length) return [];

  const extracted = dedupePayloads(
    parsedRoots.flatMap((item) => collectPayloadCandidates(item))
  );
  if (extracted.length) {
    const component = extracted.find((entry) => entry.component)?.component;
    const block = extracted.find((entry) => entry.block)?.block;
    if (component || block) {
      return [{ component, block }, ...extracted.filter((entry) => entry.component || entry.block)];
    }
  }
  if (extracted.length) return extracted;
  const jsonishPayload = parseJsonishSectionPayload(candidate);
  return jsonishPayload ? [jsonishPayload] : extracted;
};

const createPlaceholderBlock = (
  context: SectionContext,
  message: string
): { type: string; props: Record<string, unknown>; _key: string } => ({
  type: errorComponentName,
  props: {
    title: "Section generation failed",
    message,
    sectionId: context.section.id,
    sectionType: context.section.type,
    id: `${context.pagePath}:${context.section.id}:${context.sectionIndex}:error`,
  },
  _key: `${context.pagePath}:${context.section.id}:${context.sectionIndex}:error`,
});

const trimLine = (value: string, fallback: string, max = 72) => {
  const compact = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!compact) return fallback;
  return compact.slice(0, max);
};

const sectionToken = (context: SectionContext) =>
  `${context.section.type} ${context.section.id}`.toLowerCase();

const inferTemplateRefinementSectionKind = (sectionType: string, sectionId: string) => {
  const token = `${String(sectionType || "").toLowerCase()} ${String(sectionId || "").toLowerCase()}`;
  if (/(navigation|navbar|header|topnav)/.test(token)) return "navigation";
  if (/(hero|pagehero|showcasehero)/.test(token)) return "hero";
  if (/(approach|metric|stats|feature|valueprop|process)/.test(token)) return "approach";
  if (/(social|proof|testimonial|trust|logo|collaborator)/.test(token)) return "socialproof";
  if (/(footercta|calltoaction|cta|pricing|plan|tier)/.test(token)) return "cta";
  if (/footer/.test(token)) return "footer";
  return "";
};

const localizeIndustryToken = (value: string, useChinese: boolean) => {
  const raw = String(value || "").trim();
  if (!raw) return useChinese ? "工业场景" : "industry";
  if (!useChinese) return raw;
  const normalized = raw.toLowerCase();
  if (normalized === "industrial-manufacturing") return "工业制造";
  if (normalized === "technology") return "科技行业";
  if (normalized === "medical-diagnostics") return "医疗器械";
  if (normalized === "luxury") return "高端制造";
  if (/^[a-z0-9-]+$/.test(normalized)) return normalized.replace(/-/g, " ");
  return raw;
};

const buildDeterministicFallbackBlock = (
  context: SectionContext,
  prompt: string,
  designNorthStar?: Record<string, unknown>,
  theme?: Record<string, unknown>,
  options?: {
    skipRegistry?: boolean;
    outputLanguage?: "zh-CN" | "en-US";
  }
): SectionBlock => {
  const token = sectionToken(context);
  const promptBrand = extractPromptBrandName(String(prompt || ""));
  const outputLanguage = options?.outputLanguage ?? resolveOutputLanguage(String(prompt || ""));
  const isZhPrompt = outputLanguage === "zh-CN";
  const rawIndustry =
    typeof designNorthStar?.industry === "string" && designNorthStar.industry.trim()
      ? designNorthStar.industry.trim()
      : isZhPrompt
        ? "行业"
        : "industry";
  const industry = localizeIndustryToken(rawIndustry, isZhPrompt);
  const shortPrompt = trimLine(prompt, "Business Website", 68);
  const safeHeroTitle = isZhPrompt
    ? `${promptBrand || "企业"}${industry}解决方案`
    : `${promptBrand || "Company"} ${industry} Solutions`;
  const safeSiteTitle = isZhPrompt
    ? `${promptBrand || "企业"} 咨询入口`
    : `${promptBrand || "Company"} Contact`;
  const localized = {
    home: isZhPrompt ? "首页" : "Home",
    services: isZhPrompt ? "服务" : "Services",
    about: isZhPrompt ? "关于" : "About",
    contact: isZhPrompt ? "联系" : "Contact",
    getStarted: isZhPrompt ? "立即开始" : "Get Started",
    exploreProducts: isZhPrompt ? "查看产品" : "Explore Products",
    contactSales: isZhPrompt ? "联系销售" : "Contact Sales",
    heroEyebrow: isZhPrompt ? "品牌与增长" : "Brand & Growth",
    heroSubtitle: isZhPrompt
      ? "围绕品牌定位、产品表达与转化目标，构建高完成度网站体验。"
      : "High-fidelity website experiences built around brand positioning, product clarity, and conversion goals.",
    productLines: isZhPrompt ? "产品矩阵" : "Product Lines",
    productSubtitle: isZhPrompt
      ? "支持清晰分类、参数展示与场景化说明的产品编排。"
      : "Structured product presentation with clear categories, specs, and use cases.",
    learnMore: isZhPrompt ? "了解详情" : "Learn More",
    latestStories: isZhPrompt ? "最新动态" : "Latest Stories",
    customerFeedback: isZhPrompt ? "客户反馈" : "Customer Feedback",
    collaboratorVoices: isZhPrompt ? "合作伙伴声音" : "What collaborators say",
    trustedBy: isZhPrompt ? "受到行业团队信任" : "Trusted by leading teams",
    ourStory: isZhPrompt ? "品牌故事" : "Our Story",
    storySubtitle: isZhPrompt
      ? "以精炼叙事连接品牌定位、工艺能力与客户价值。"
      : "A concise narrative that connects brand intent, craft, and client outcomes.",
    storyBody: isZhPrompt
      ? "我们以策略清晰度、视觉质感与工程执行力，持续打造可长期演进的数字化体验。"
      : "We combine strategic clarity, visual refinement, and execution discipline to create enduring digital experiences.",
    pricingTitle: isZhPrompt ? "服务方案" : "Service Plans",
    faqTitle: "FAQ",
    capabilities: isZhPrompt ? "核心能力" : "Key Strengths",
    capabilitiesSubtitle: isZhPrompt
      ? "围绕交付稳定性、可扩展性与业务转化构建。"
      : "Designed for reliable delivery, scalability, and measurable conversion.",
    processReliability: isZhPrompt ? "交付稳定性" : "Delivery Reliability",
    processReliabilityDesc: isZhPrompt
      ? "在持续迭代中保持可预期的体验质量与输出节奏。"
      : "Consistent quality and predictable output through iterative execution.",
    precisionControl: isZhPrompt ? "体验精细化" : "Experience Precision",
    precisionControlDesc: isZhPrompt
      ? "通过信息层级、文案与视觉细节提升表达准确度。"
      : "Sharper communication through information hierarchy, copy, and visual details.",
    operationVisibility: isZhPrompt ? "运营可视化" : "Operational Visibility",
    operationVisibilityDesc: isZhPrompt
      ? "通过清晰指标与反馈回路支持持续优化。"
      : "Actionable signals and feedback loops for continuous improvement.",
  };
  const idBase = `${toSlug(context.section.type || "section") || "section"}-${context.sectionIndex + 1}`;
  const anchor = context.section.id;
  const propsHints =
    context.section.propsHints && typeof context.section.propsHints === "object"
      ? (context.section.propsHints as Record<string, unknown>)
      : undefined;
  if (!options?.skipRegistry) {
    const registryTemplate = resolveSectionTemplateBlock({
      prompt,
      pagePath: context.pagePath,
      pageName: context.pageName,
      sectionType: context.section.type,
      sectionId: context.section.id,
      sectionIntent: context.section.intent,
      idBase,
      anchor,
      designNorthStar,
      theme,
      propsHints,
    });
    if (registryTemplate) {
      return registryTemplate;
    }
  }

  if (/navigation|navbar|header|topnav/.test(token)) {
    return {
      type: "Navbar",
      props: {
        id: idBase,
        anchor: "top",
        logo: trimLine(context.pageName || "Brand", "Brand", 24),
        links: [
          { label: localized.home, href: "#top", variant: "link" },
          { label: localized.services, href: "#services", variant: "link" },
          { label: localized.about, href: "#about", variant: "link" },
          { label: localized.contact, href: "#contact", variant: "link" },
        ],
        ctas: [{ label: localized.getStarted, href: "#contact", variant: "primary" }],
        variant: "simple",
        sticky: true,
        paddingY: "sm",
        maxWidth: "xl",
      },
    };
  }

  if (/hero|pagehero|pageheader/.test(token)) {
    return {
      type: "HeroSplit",
      props: {
        id: idBase,
        anchor,
        eyebrow: localized.heroEyebrow,
        title: safeHeroTitle,
        subtitle: localized.heroSubtitle,
        ctas: [
          { label: localized.exploreProducts, href: "#products", variant: "primary" },
          { label: localized.contactSales, href: "#contact", variant: "secondary" },
        ],
        mediaPosition: "right",
        paddingY: "lg",
        maxWidth: "xl",
      },
    };
  }

  if (/product|catalog|bundle|comparison/.test(token)) {
    return {
      type: "CardsGrid",
      props: {
        id: idBase,
        anchor,
        title: localized.productLines,
        subtitle: localized.productSubtitle,
        variant: "product",
        columns: "3col",
        density: "normal",
        cardStyle: "solid",
        maxWidth: "xl",
        items: [
          {
            title: isZhPrompt ? "核心产品线 A" : "Core Product Line A",
            description: isZhPrompt
              ? "面向重点场景提供稳定能力与可扩展配置。"
              : "Reliable capability and scalable configuration for priority scenarios.",
            cta: { label: isZhPrompt ? "查看" : "Details", href: "#", variant: "link" },
          },
          {
            title: isZhPrompt ? "核心产品线 B" : "Core Product Line B",
            description: isZhPrompt
              ? "支持参数化选型与多场景组合交付。"
              : "Supports parameterized selection and multi-scenario packaging.",
            cta: { label: isZhPrompt ? "查看" : "Details", href: "#", variant: "link" },
          },
          {
            title: isZhPrompt ? "核心产品线 C" : "Core Product Line C",
            description: isZhPrompt
              ? "强调效率、稳定性与后续迭代空间。"
              : "Focused on efficiency, stability, and future iteration room.",
            cta: { label: isZhPrompt ? "查看" : "Details", href: "#", variant: "link" },
          },
        ].map((item) => ({
          ...item,
          cta: { label: localized.learnMore, href: "#", variant: "link" as const },
        })),
      },
    };
  }

  if (/news|blog|article|case/.test(token)) {
    return {
      type: "CaseStudies",
      props: {
        id: idBase,
        anchor,
        title: localized.latestStories,
        variant: "cards",
        maxWidth: "xl",
        items: [
          {
            title: isZhPrompt ? "产线节拍提升 32%" : "Factory throughput increased by 32%",
            summary: isZhPrompt
              ? "通过运动控制与预测性维护联动，完成产线升级。"
              : "A production line upgrade combining motion control and predictive maintenance.",
            href: "#",
            tags: isZhPrompt ? ["自动化", "制造"] : ["Automation", "Manufacturing"],
          },
          {
            title: isZhPrompt ? "精整质量提升、报废率下降" : "Precision finishing with lower scrap rate",
            summary: isZhPrompt
              ? "通过校准与刀具策略优化，显著提升良率。"
              : "How calibration and tooling strategy improved output quality.",
            href: "#",
            tags: isZhPrompt ? ["质量", "运营"] : ["Quality", "Operations"],
          },
          {
            title: isZhPrompt ? "数字孪生分阶段落地" : "Digital twin rollout in phased deployment",
            summary: isZhPrompt
              ? "形成可执行的全厂监控与诊断导入路径。"
              : "Practical adoption path for plant-wide monitoring and diagnostics.",
            href: "#",
            tags: isZhPrompt ? ["数字孪生", "工业物联"] : ["Digital Twin", "IIoT"],
          },
        ],
      },
    };
  }

  if (/testimonial|review/.test(token)) {
    return {
      type: "TestimonialsGrid",
      props: {
        id: idBase,
        anchor,
        title: localized.customerFeedback,
        variant: "2col",
        maxWidth: "xl",
        items: [
          {
            quote: isZhPrompt ? "部署周期短，在峰值负载下依然保持稳定表现。" : "Deployment was fast and the stability under peak load is excellent.",
            name: isZhPrompt ? "工厂总监" : "Plant Director",
            role: isZhPrompt ? "重工制造" : "Heavy Industry",
          },
          {
            quote: isZhPrompt ? "界面清晰，上线后操作团队很快进入高效状态。" : "The interface is clean and operators became productive in days.",
            name: isZhPrompt ? "生产经理" : "Production Manager",
            role: isZhPrompt ? "先进制造" : "Advanced Manufacturing",
          },
        ],
      },
    };
  }

  if (/social|proof|collab|endorse/.test(token)) {
    return {
      type: "TestimonialsGrid",
      props: {
        id: idBase,
        anchor,
        title: localized.collaboratorVoices,
        variant: "2col",
        maxWidth: "xl",
        items: [
          {
            quote: isZhPrompt
              ? "从方案到交付，执行质量与协作沟通保持一致。"
              : "Execution quality and communication remained consistent from concept through delivery.",
            name: isZhPrompt ? "合作方团队" : "Partner Team",
            role: isZhPrompt ? "企业客户" : "Enterprise Client",
          },
          {
            quote: isZhPrompt
              ? "在较少迭代下兼顾品牌表达与转化清晰度。"
              : "The result balanced brand expression and conversion clarity with minimal iteration.",
            name: isZhPrompt ? "设计负责人" : "Design Lead",
            role: isZhPrompt ? "产品团队" : "Product Organization",
          },
        ],
      },
    };
  }

  if (/trust|logo|badge/.test(token)) {
    return {
      type: "LogoCloud",
      props: {
        id: idBase,
        anchor,
        title: localized.trustedBy,
        variant: "grid",
        maxWidth: "xl",
        logos: [
          { src: "/assets/logo-1.svg", alt: "Partner 1" },
          { src: "/assets/logo-2.svg", alt: "Partner 2" },
          { src: "/assets/logo-3.svg", alt: "Partner 3" },
          { src: "/assets/logo-4.svg", alt: "Partner 4" },
        ],
      },
    };
  }

  if (/story|editorial|narrative|philosophy|studio/.test(token)) {
    return {
      type: "ContentStory",
      props: {
        id: idBase,
        anchor,
        title: localized.ourStory,
        subtitle: localized.storySubtitle,
        body: localized.storyBody,
        ctas: [{ label: isZhPrompt ? "查看更多" : "Explore More", href: "#", variant: "link" }],
        variant: "split",
        maxWidth: "xl",
      },
    };
  }

  if (/pricing/.test(token)) {
    return {
      type: "PricingCards",
      props: {
        id: idBase,
        anchor,
        title: localized.pricingTitle,
        variant: "3up",
        maxWidth: "xl",
        plans: [
          {
            name: isZhPrompt ? "基础版" : "Starter",
            price: isZhPrompt ? "¥2,999" : "$299",
            period: isZhPrompt ? "月" : "mo",
            features: isZhPrompt ? ["远程诊断", "邮件支持", "周报机制"] : ["Remote diagnostics", "Email support", "Weekly reports"],
            cta: { label: isZhPrompt ? "选择基础版" : "Choose Starter", href: "#contact", variant: "secondary" },
          },
          {
            name: isZhPrompt ? "专业版" : "Pro",
            price: isZhPrompt ? "¥6,999" : "$699",
            period: isZhPrompt ? "月" : "mo",
            highlighted: true,
            features: isZhPrompt ? ["优先响应", "现场调优", "高级分析"] : ["Priority support", "On-site tuning", "Advanced analytics"],
            cta: { label: isZhPrompt ? "选择专业版" : "Choose Pro", href: "#contact", variant: "primary" },
          },
          {
            name: isZhPrompt ? "企业版" : "Enterprise",
            price: isZhPrompt ? "定制" : "Custom",
            period: isZhPrompt ? "月" : "mo",
            features: isZhPrompt ? ["专属团队", "SLA 保障", "定制集成"] : ["Dedicated team", "SLA contract", "Custom integration"],
            cta: { label: localized.contactSales, href: "#contact", variant: "link" },
          },
        ],
      },
    };
  }

  if (/faq|question/.test(token)) {
    return {
      type: "FAQAccordion",
      props: {
        id: idBase,
        anchor,
        title: localized.faqTitle,
        variant: "singleOpen",
        maxWidth: "xl",
        items: [
          {
            q: isZhPrompt ? "部署周期需要多久？" : "How long does deployment take?",
            a: isZhPrompt
              ? "通常根据现有生产环境规模，部署周期约为 2 到 6 周。"
              : "Typical setup takes 2 to 6 weeks based on the existing production environment.",
          },
          {
            q: isZhPrompt ? "是否支持现有 PLC 系统？" : "Do you support existing PLC systems?",
            a: isZhPrompt ? "支持。我们提供常见 PLC 与 MES 系统的集成方案。" : "Yes, we provide integration options for common PLC and MES stacks.",
          },
          {
            q: isZhPrompt ? "可以先从一条产线试点吗？" : "Can we start with one line first?",
            a: isZhPrompt ? "可以。支持分阶段上线，以降低风险并尽早验证 ROI。" : "Yes, phased rollout is supported to reduce risk and validate ROI early.",
          },
        ],
      },
    };
  }

  if (/contact|cta|lead|form|map/.test(token)) {
    const title = isZhPrompt
      ? `联系${promptBrand || "我们的团队"}`
      : promptBrand
        ? `Talk to ${promptBrand}`
        : "Talk to our team";
    const subtitle = isZhPrompt
      ? `围绕${industry}场景提供需求评估、方案设计与落地建议。`
      : `Share your ${industry} goals, constraints, and timeline to receive a tailored implementation plan.`;
    const ctaLabel = isZhPrompt ? "预约咨询" : "Contact Sales";
    const contactLikeIntent = /contact|lead|form|map/.test(token);
    return {
      type: "LeadCaptureCTA",
      props: {
        id: idBase,
        anchor,
        title,
        subtitle,
        cta: { label: ctaLabel, href: "/contact", variant: "primary" },
        note: safeSiteTitle,
        variant: "card",
        maxWidth: "xl",
        ...(contactLikeIntent ? { emphasis: "normal", forbidGradientText: true } : {}),
      },
    };
  }

  if (/footer/.test(token)) {
    return {
      type: "Footer",
      props: {
        id: idBase,
        anchor,
        variant: "multiColumn",
        maxWidth: "xl",
        columns: [
          {
            title: isZhPrompt ? "产品" : "Products",
            links: [
              { label: isZhPrompt ? "设备" : "Machines", href: "#" },
              { label: isZhPrompt ? "自动化" : "Automation", href: "#" },
              { label: isZhPrompt ? "软件" : "Software", href: "#" },
            ],
          },
          {
            title: isZhPrompt ? "公司" : "Company",
            links: [
              { label: isZhPrompt ? "关于我们" : "About", href: "#" },
              { label: isZhPrompt ? "新闻" : "News", href: "#" },
              { label: isZhPrompt ? "联系我们" : "Contact", href: "#contact" },
            ],
          },
          {
            title: isZhPrompt ? "法律" : "Legal",
            links: [
              { label: isZhPrompt ? "隐私政策" : "Privacy", href: "#" },
              { label: isZhPrompt ? "使用条款" : "Terms", href: "#" },
            ],
          },
        ],
      },
    };
  }

  if (/feature|benefit|value|industry|spec|timeline|process|stat/.test(token)) {
    return {
      type: "FeatureGrid",
      props: {
        id: idBase,
        anchor,
        title: localized.capabilities,
        subtitle: localized.capabilitiesSubtitle,
        variant: "3col",
        maxWidth: "xl",
        items: [
          {
            title: localized.processReliability,
            desc: localized.processReliabilityDesc,
            icon: "shield",
          },
          {
            title: localized.precisionControl,
            desc: localized.precisionControlDesc,
            icon: "target",
          },
          {
            title: localized.operationVisibility,
            desc: localized.operationVisibilityDesc,
            icon: "activity",
          },
        ],
      },
    };
  }

  return {
    type: "FeatureWithMedia",
    props: {
      id: idBase,
      anchor,
      title:
        shortPrompt.length <= 42 && !/https?:\/\//i.test(shortPrompt) && !/profile_selector|仅生成|不要照搬|https?:\/\//i.test(shortPrompt)
          ? shortPrompt
          : isZhPrompt
            ? `${promptBrand || "企业"}核心能力展示`
            : `${promptBrand || "Company"} Capability Overview`,
      subtitle: isZhPrompt
        ? `围绕${industry}场景，构建可复制、可扩展的落地方案。`
        : `Designed around ${industry} priorities with a scalable implementation approach.`,
      body: isZhPrompt
        ? "当前区块为稳定回退版本，可在编辑器中继续增强文案、媒体与交互细节。"
        : "This section uses a stable fallback layout and can be refined in the editor.",
      ctas: [{ label: isZhPrompt ? "了解更多" : "Learn More", href: "#top", variant: "primary" }],
      variant: "split",
      maxWidth: "xl",
    },
  };
};
const toStringList = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];

const buildFallbackSectionVariant = (context: SectionContext) => {
  const token = `${context.section.type ?? ""} ${context.section.id ?? ""}`.toLowerCase();
  if (/(cta|call[-_\s]?to[-_\s]?action|footercta|footer-cta)/.test(token)) return "cta";
  if (/(social|proof|testimonial|trust|logo|endorse|collab)/.test(token)) return "socialProof";
  if (/(contact|lead|form|inquiry|quote)/.test(token)) return "contact";
  if (/(product|catalog|grid|collection|shop|sku)/.test(token)) return "catalog";
  return "content";
};

const buildFallbackSectionItems = (
  context: SectionContext,
  designNorthStar?: Record<string, unknown>
) => {
  const hints =
    context.section.propsHints && typeof context.section.propsHints === "object"
      ? (context.section.propsHints as Record<string, unknown>)
      : {};
  const categories = toStringList(hints.categories);
  const coreProducts = toStringList((designNorthStar as any)?.coreProducts);
  const source = categories.length ? categories : coreProducts;
  return source.slice(0, 8).map((item) => ({
    title: humanizeLabel(item),
    desc: "OEM / ODM ready, fast sampling, reliable lead times.",
  }));
};

const normalizeFallbackVariant = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
const sectionMatchesTokenList = (context: SectionContext, tokens: string[]) => {
  const sectionToken = normalizeRouteToken(`${context.section.type ?? ""} ${context.section.id ?? ""}`);
  return tokens.some((token) => {
    const normalized = normalizeRouteToken(token);
    return normalized.length > 0 && sectionToken.includes(normalized);
  });
};

const isDetailedDesignBrief = (prompt: string) => {
  const text = String(prompt ?? "").trim();
  if (text.length < 1200) return false;
  let score = 0;
  if (/section\s*\d|section specifications|section\s+\d+\s*:|三、section|详细规格/i.test(text)) score += 2;
  if (/(design theme|north star metrics|响应式断点|色彩系统|字体策略|技术实现备注)/i.test(text)) score += 2;
  const sectionHits =
    text.match(/hero|navigation|studio|story|approach|metrics|social|testimonial|footer|cta/gi)?.length ?? 0;
  if (sectionHits >= 8) score += 2;
  return score >= 4;
};

const resolveTemplateCtaStyle = (
  hints: Record<string, unknown>,
  theme?: Record<string, unknown>
): "auto" | "surface" | "contrast" => {
  const hinted = typeof hints.ctaStyle === "string" ? hints.ctaStyle.trim().toLowerCase() : "";
  if (hinted === "auto" || hinted === "surface" || hinted === "contrast") return hinted;
  const mode = typeof (theme as any)?.mode === "string" ? String((theme as any).mode).toLowerCase() : "";
  if (mode === "dark") return "contrast";
  const voice =
    typeof (theme as any)?.themeContract?.voice === "string"
      ? String((theme as any).themeContract.voice).toLowerCase()
      : "";
  if (/(luxury|fashion|editorial)/.test(voice)) return "surface";
  return "auto";
};

const buildFallbackSectionProps = (
  context: SectionContext,
  prompt: string,
  designNorthStar?: Record<string, unknown>,
  theme?: Record<string, unknown>
) => {
  const useChinese = shouldUseChineseContent(String(prompt || ""));
  const variant = buildFallbackSectionVariant(context);
  const hints =
    context.section.propsHints && typeof context.section.propsHints === "object"
      ? (context.section.propsHints as Record<string, unknown>)
      : {};
  const formFields = toStringList(hints.formFields);
  const whatsappRaw = typeof hints.whatsappNumber === "string" ? hints.whatsappNumber : "";
  const whatsapp = whatsappRaw.replace(/[^0-9+]/g, "");
  const secondaryCtaLabel =
    typeof hints.secondaryCtaLabel === "string" && hints.secondaryCtaLabel.trim()
      ? hints.secondaryCtaLabel.trim().slice(0, 48)
      : undefined;
  const secondaryCtaHref =
    typeof hints.secondaryCtaHref === "string" && hints.secondaryCtaHref.trim()
      ? hints.secondaryCtaHref.trim().slice(0, 200)
      : undefined;
  const legal =
    typeof hints.legal === "string" && hints.legal.trim() ? hints.legal.trim().slice(0, 120) : undefined;
  const footerLinks = Array.isArray((hints as any).footerLinks)
    ? ((hints as any).footerLinks as Array<Record<string, unknown>>)
        .map((item) => ({
          label: typeof item?.label === "string" ? item.label.trim().slice(0, 24) : "",
          href: typeof item?.href === "string" ? item.href.trim().slice(0, 200) : "#",
        }))
        .filter((item) => item.label)
        .slice(0, 4)
    : undefined;
  const logos = Array.isArray((hints as any).logos)
    ? ((hints as any).logos as Array<Record<string, unknown> | string>)
        .map((item) => {
          if (typeof item === "string") {
            const name = item.trim().slice(0, 32);
            return name ? { name } : null;
          }
          return {
            name: typeof item?.name === "string" ? item.name.trim().slice(0, 32) : "",
            src: typeof item?.src === "string" ? item.src.trim().slice(0, 200) : "",
          };
        })
        .filter((item) => Boolean(item && typeof item.name === "string" && item.name.trim()))
        .slice(0, 8)
    : undefined;
  const testimonials = Array.isArray((hints as any).testimonials)
    ? ((hints as any).testimonials as Array<Record<string, unknown>>)
        .map((item) => ({
          name: typeof item?.name === "string" ? item.name.trim().slice(0, 48) : "",
          role: typeof item?.role === "string" ? item.role.trim().slice(0, 64) : "",
          quote: typeof item?.quote === "string" ? item.quote.trim().slice(0, 220) : "",
        }))
        .filter((item) => item.name || item.quote)
        .slice(0, 4)
    : undefined;
  const sectionLabel = humanizeLabel(String(context.section.id || context.section.type || "Section"));
  const intent = typeof context.section.intent === "string" ? context.section.intent.trim() : "";
  const title =
    variant === "cta"
      ? intent || (useChinese ? "准备开启项目？" : "Ready to define your space?")
      : sectionLabel || (useChinese ? "页面区块" : "Section");
  const subtitle =
    intent ||
    (variant === "cta"
      ? useChinese
        ? "预约专属咨询或查看产品资料。"
        : "Book a private consultation or browse our curated portfolio."
      : variant === "socialProof"
        ? useChinese
          ? "通过合作伙伴与客户案例建立信任。"
          : "Building trust with collaborators and client stories."
      : "") ||
    (variant === "contact"
      ? useChinese
        ? "提交产品需求，我们将尽快回复。"
        : "Share your product requirements and we will respond quickly."
      : variant === "catalog"
        ? useChinese
          ? "核心产品线支持按需定制。"
          : "Core product lines with customizable specifications."
        : useChinese
          ? "当前区块使用稳定回退模板生成，可在编辑器继续完善。"
          : "This section is generated using a resilient fallback template.");
  const ctaLabel = variant === "cta" ? (useChinese ? "立即咨询" : "Inquire Now") : variant === "contact" ? (useChinese ? "提交询盘" : "Send Inquiry") : useChinese ? "立即开始" : "Get Started";
  const ctaHref = variant === "cta" ? "#contact" : variant === "contact" ? "#contact" : "#top";
  const ctaStyleHint = resolveTemplateCtaStyle(hints, theme);

  return {
    id: `${context.pagePath}:${context.section.id}:${context.sectionIndex}:fallback`,
    anchor: context.section.id,
    title,
    subtitle,
    variant,
    ctaStyle: variant === "cta" ? ctaStyleHint : undefined,
    items: variant === "catalog" ? buildFallbackSectionItems(context, designNorthStar) : [],
    formFields: formFields.length ? formFields : useChinese ? ["姓名", "邮箱", "公司", "需求"] : ["name", "email", "company", "message"],
    secondaryCtaLabel,
    secondaryCtaHref,
    legal: variant === "cta" ? legal ?? (useChinese ? "© 2026 保留所有权利。" : "© 2026 All rights reserved.") : legal,
    footerLinks:
      variant === "cta"
        ? footerLinks ??
          [
            { label: useChinese ? "隐私政策" : "Privacy", href: "#privacy" },
            { label: useChinese ? "使用条款" : "Terms", href: "#terms" },
            { label: "Instagram", href: "#instagram" },
          ]
        : footerLinks,
    logos: variant === "socialProof" ? logos : undefined,
    testimonials: variant === "socialProof" ? testimonials : undefined,
    whatsapp,
    ctaLabel,
    ctaHref,
    sourcePrompt: prompt.slice(0, 280),
  };
};

const collectReferenceBrandPhrases = (prompt: string) => {
  const phrases = new Set<string>();
  const text = String(prompt || "");
  const englishReferenceMatches = Array.from(
    text.matchAll(
      /\b(?:like|inspired by|similar to|based on|using|modeled on|reference(?:d)? from)\s+([A-Za-z][A-Za-z0-9&().'’\s-]{1,50})/gi
    )
  );
  englishReferenceMatches.forEach((match) => {
    const value = String(match[1] || "")
      .trim()
      .split(/[.!?。！]/)[0]
      .replace(/[,.。！!?:;，；：]+$/g, "")
      .replace(/\s+(?:with|including|featuring|that|which)\b[\s\S]*$/i, "")
      .trim();
    if (value) phrases.add(value);
  });
  const templateReferenceMatches = Array.from(
    text.matchAll(/\buse\s+([A-Za-z][A-Za-z0-9&().'’\s-]{1,50})\s+as\s+(?:the\s+)?(?:(?:visual\s+style|visual\s+template|template|style|visual)\s+)?(?:reference|base)\b/gi)
  );
  templateReferenceMatches.forEach((match) => {
    const value = String(match[1] || "")
      .trim()
      .split(/[.!?。！]/)[0]
      .replace(/[,.。！!?:;，；：]+$/g, "")
      .trim();
    if (value) phrases.add(value);
  });
  const chineseReferenceMatches = Array.from(
    text.matchAll(/(?:类似|像|参考|参照|对标|仿照)\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s-]{1,30})/gi)
  );
  chineseReferenceMatches.forEach((match) => {
    const value = String(match[1] || "").trim();
    if (value) phrases.add(value);
  });
  return Array.from(phrases);
};

const extractBrandNameFromPromptLite = (prompt: string) => {
  const shared = extractBrandNameFromPromptShared(prompt);
  if (shared) return shared;
  const text = String(prompt || "");
  const englishInline = text.match(/for\s+([A-Za-z][A-Za-z0-9&.\s-]{1,48}?)(?:\s*\(|,|\s+(?:an?|the)\b)/i);
  if (englishInline) {
    const candidate = sanitizeBrandCandidate(englishInline[1]);
    if (candidate) return candidate;
  }
  return "";
};

const extractSourceBrandTokens = (prompt: string) => {
  const tokens = new Set<string>();
  const stopwords = new Set([
    "brand",
    "template",
    "style",
    "visual",
    "family",
    "exact",
    "reference",
    "base",
    "using",
    "use",
    "similar",
    "inspired",
    "match",
    "desktop",
    "mobile",
    "industrial",
    "website",
    "create",
    "build",
    "design",
    "page",
    "pages",
    "route",
    "routes",
    "home",
    "about",
    "contact",
    "privacy",
    "custom",
    "solutions",
    "solution",
    "products",
    "product",
    "machines",
    "machine",
    "cases",
    "case",
    "support",
    "catalog",
    "hero",
    "title",
    "subtitle",
    "primary",
    "secondary",
    "local",
    "lead",
    "time",
    "fast",
  ]);
  const text = String(prompt || "").toLowerCase();
  const urlMatches = text.match(/https?:\/\/[^\s）)]+/g) ?? [];
  urlMatches.forEach((rawUrl) => {
    try {
      const host = new URL(rawUrl).hostname.replace(/^www\./, "");
      host
        .split(/[.\-]/)
        .filter((token) => token.length >= 4)
        .forEach((token) => tokens.add(token));
    } catch {}
  });
  const selectorMatches: string[] = text.match(/profile_selector[_:-]?([a-z0-9-]+)/gi) ?? [];
  selectorMatches.forEach((value) => {
    value
      .split(/[_:-]/)
      .filter((token) => token.length >= 4 && token !== "profile" && token !== "selector" && token !== "home")
      .forEach((token) => tokens.add(token));
  });
  collectReferenceBrandPhrases(prompt).forEach((phrase) => {
    const value = String(phrase || "").trim();
    if (!value) return;
    tokens.add(value.toLowerCase());
    value
      .split(/[^a-z0-9\u4e00-\u9fff]+/)
      .filter((token) => {
        if (!token) return false;
        if (stopwords.has(token)) return false;
        if (/^[a-z0-9]+$/.test(token)) return token.length >= 4;
        return token.length >= 2;
      })
      .forEach((token) => tokens.add(token));
  });
  return Array.from(tokens);
};

const buildFinalSemanticReplacements = (prompt: string, designNorthStar?: Record<string, unknown>) => {
  void prompt;
  void designNorthStar;
  // Keep sanitization generic: do not inject scenario- or industry-specific hardcoded phrase rewrites.
  return [];
};

const shouldSkipGeneratedPropSanitization = (key: string) =>
  /(href|src|url|path|class|variant|align|mode|font|weight|style|token|id$|anchor|icon|size|padding|margin|radius|shadow|color|opacity|zindex|width|height)/i.test(
    key
  );

const normalizeSanitizedText = (value: string) =>
  String(value || "")
    .replace(/\b([A-Za-z][A-Za-z0-9 &/-]{2,})\.COM\b/g, "$1")
    .replace(/\bmanufacturing operations\b/gi, "general industrial manufacturing")
    .replace(/\bshop floor & machine tools\b/gi, "machine tool builders")
    .replace(/\s{2,}/g, " ")
    .trim();

type StructuredBrief = {
  brand?: string;
  nav?: string[];
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtas?: string[];
  productItems?: string[];
  featureItems?: string[];
  caseItems?: string[];
  aboutText?: string;
  certifications?: string[];
  footerLinks?: string[];
  whatsapp?: string;
  email?: string;
  address?: string;
  copyright?: string;
  contactTitle?: string;
  contactFields?: string[];
  consentText?: string;
  productDetails?: Array<{
    name: string;
    model?: string;
    category?: string;
    summary?: string;
    image?: string;
    specs?: Record<string, string>;
    ctaLabel?: string;
  }>;
  caseDetails?: Array<{
    title: string;
    customerType?: string;
    problem?: string;
    solution?: string;
    result?: string;
  }>;
  faqItems?: Array<{ question: string; answer: string }>;
  catalogPageSize?: number;
  mode?: "light" | "dark";
  palette?: { primary: string; accent: string; bg: string; neutral: string; text: string; textSecondary: string };
};

const extractPromptBriefSection = (prompt: string, label: string) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matched = String(prompt || "").match(new RegExp(`【${escaped}】([\\s\\S]*?)(?=\\n【|$)`, "i"));
  return matched?.[1]?.trim() || "";
};

const parsePipeList = (value: string) =>
  String(value || "")
    .split("|")
    .map((item) => item.replace(/^[\s-]+|[\s-]+$/g, "").replace(/[.。]+$/g, "").trim())
    .filter(Boolean);

const parseBulletList = (value: string) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^-\s+/.test(line))
    .map((line) => line.replace(/^-\s+/, "").trim())
    .filter(Boolean);

const extractFirstLineMatch = (value: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = value.match(pattern);
    const resolved = match?.[1]?.trim();
    if (resolved) return resolved;
  }
  return "";
};

const parseDelimitedList = (value: string) =>
  String(value || "")
    .split(/[|,]/)
    .map((item) => item.replace(/^[\s-]+|[\s-]+$/g, "").replace(/[.。]+$/g, "").trim())
    .filter(Boolean);

const parseContactFieldList = (value: string) =>
  String(value || "")
    .split(/[•|,，、;；]/)
    .map((item) => item.replace(/^[\s-]+|[\s-]+$/g, "").replace(/[.。]+$/g, "").trim())
    .filter(Boolean);

const extractMarkdownHeadingSection = (value: string, labels: string[]) => {
  const raw = String(value || "");
  if (!raw.trim()) return "";
  const normalizedLabels = labels.map((label) => String(label || "").trim().toLowerCase()).filter(Boolean);
  if (!normalizedLabels.length) return "";
  const lines = raw.split(/\r?\n/);
  let start = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!/^#{1,6}\s*/.test(line)) continue;
    const heading = line
      .replace(/^#{1,6}\s*/, "")
      .replace(/\*+/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (normalizedLabels.some((label) => heading.includes(label))) {
      start = index + 1;
      break;
    }
  }
  if (start < 0) return "";
  let end = lines.length;
  for (let index = start; index < lines.length; index += 1) {
    if (/^#{1,6}\s*/.test(lines[index].trim())) {
      end = index;
      break;
    }
  }
  return lines
    .slice(start, end)
    .join("\n")
    .trim();
};

const extractLabeledBlock = (value: string, labels: string[]) => {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?${escaped}(?:\s*[（(][^）)\n]{0,30}[)）])?\s*[:：]\s*([\s\S]*?)(?=\n\s*(?![-*]\s)(?![A-Za-z]\)\s)(?!\d+[.)、]\s)(?![一二三四五六七八九十]+[、.)]\s)(?:#{1,6}\s*)?(?:[A-Z][A-Za-z0-9 &/+\-]{1,60}|[\u4e00-\u9fffA-Za-z][\u4e00-\u9fffA-Za-z0-9（）()、/&+\- ]{1,40}|Page-specific intent|Business details|Avoid these failure modes|Home page requirements|Home page content requirements|Routes must be exactly|Navigation must be exactly)\s*[:：]|\n\s*$|$)`,
      "i"
    );
    const match = value.match(pattern);
    const resolved = match?.[1]?.trim();
    if (resolved) return resolved;
  }
  return "";
};

const parseStructuredInputFromPromptPatch = (prompt: string): StructuredSiteInput | null => {
  const rawPrompt = String(prompt || "");
  const markerMatch = rawPrompt.match(/##\s*Structured Data\s*\(JSON\)/i);
  if (!markerMatch) return null;
  const markerIndex = markerMatch.index ?? -1;
  if (markerIndex < 0) return null;
  const afterMarker = rawPrompt.slice(markerIndex + markerMatch[0].length);
  const firstBrace = afterMarker.indexOf("{");
  if (firstBrace < 0) return null;
  let depth = 0;
  let end = -1;
  for (let index = firstBrace; index < afterMarker.length; index += 1) {
    const char = afterMarker[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        end = index;
        break;
      }
    }
  }
  if (end < 0) return null;
  const raw = afterMarker.slice(firstBrace, end + 1).trim();
  if (!raw.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(raw) as StructuredSiteInput;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

const mergeStructuredInputIntoBrief = (
  brief: StructuredBrief,
  structuredInput?: StructuredSiteInput | null
): StructuredBrief => {
  if (!structuredInput) return brief;
  const products = (Array.isArray(structuredInput.products) ? structuredInput.products : [])
    .map((entry) => ({
      name: String((entry as StructuredProductRecord)?.name || "").trim(),
      model: String((entry as StructuredProductRecord)?.model || "").trim() || undefined,
      category: String((entry as StructuredProductRecord)?.category || "").trim() || undefined,
      summary: String((entry as StructuredProductRecord)?.summary || "").trim() || undefined,
      image: String((entry as StructuredProductRecord)?.image || "").trim() || undefined,
      specs:
        (entry as StructuredProductRecord)?.specs && typeof (entry as StructuredProductRecord).specs === "object"
          ? ((entry as StructuredProductRecord).specs as Record<string, string>)
          : undefined,
      ctaLabel: String((entry as StructuredProductRecord)?.ctaLabel || "").trim() || undefined,
    }))
    .filter((entry) => entry.name);
  const productItemsFromStructured = products
    .map((entry) => {
      const model = String(entry.model || "").trim();
      if (!model) return entry.name;
      if (entry.name.toLowerCase().includes(model.toLowerCase())) return entry.name;
      return `${entry.name}（${model}）`;
    })
    .filter(Boolean);
  const caseDetails = (Array.isArray(structuredInput.cases) ? structuredInput.cases : [])
    .map((entry) => ({
      title: String((entry as StructuredCaseRecord)?.title || "").trim(),
      customerType: String((entry as StructuredCaseRecord)?.customerType || "").trim() || undefined,
      problem: String((entry as StructuredCaseRecord)?.problem || "").trim() || undefined,
      solution: String((entry as StructuredCaseRecord)?.solution || "").trim() || undefined,
      result: String((entry as StructuredCaseRecord)?.result || "").trim() || undefined,
    }))
    .filter((entry) => entry.title);
  const caseItemsFromStructured = caseDetails.map((entry) => entry.title).filter(Boolean);
  const faqItems = (Array.isArray(structuredInput.faqs) ? structuredInput.faqs : [])
    .map((entry) => ({
      question: String((entry as StructuredFaqRecord)?.question || "").trim(),
      answer: String((entry as StructuredFaqRecord)?.answer || "").trim(),
    }))
    .filter((entry) => entry.question && entry.answer);
  return {
    ...brief,
    brand: sanitizeBrandCandidate(String(structuredInput.company?.name || "").trim()) || brief.brand,
    nav:
      Array.isArray(structuredInput.nav) && structuredInput.nav.length
        ? structuredInput.nav.map((item) => String(item || "").trim()).filter(Boolean)
        : brief.nav,
    productItems: productItemsFromStructured.length
      ? Array.from(new Set([...(brief.productItems || []), ...productItemsFromStructured]))
      : brief.productItems,
    caseItems: caseItemsFromStructured.length
      ? Array.from(new Set([...(brief.caseItems || []), ...caseItemsFromStructured]))
      : brief.caseItems,
    contactFields:
      Array.isArray(structuredInput.contactFields) && structuredInput.contactFields.length
        ? structuredInput.contactFields.map((item) => String(item || "").trim()).filter(Boolean)
        : brief.contactFields,
    productDetails: products.length ? products : brief.productDetails,
    caseDetails: caseDetails.length ? caseDetails : brief.caseDetails,
    faqItems: faqItems.length ? faqItems : brief.faqItems,
    catalogPageSize:
      Number.isFinite(Number(structuredInput.catalogPageSize)) && Number(structuredInput.catalogPageSize) > 0
        ? Math.max(6, Math.min(24, Number(structuredInput.catalogPageSize)))
        : brief.catalogPageSize,
    aboutText:
      String(structuredInput.company?.summary || "").trim() ||
      String(structuredInput.company?.website || "").trim() ||
      brief.aboutText,
    email: String(structuredInput.company?.email || "").trim() || brief.email,
    address: String(structuredInput.company?.address || "").trim() || brief.address,
    whatsapp: String(structuredInput.company?.phone || "").trim() || brief.whatsapp,
  };
};

const parseStructuredBrief = (prompt: string): StructuredBrief | null => {
  const promptStructuredInput = parseStructuredInputFromPromptPatch(prompt);
  const header = extractPromptBriefSection(prompt, "Header") || extractPromptBriefSection(prompt, "页眉");
  const hero =
    extractPromptBriefSection(prompt, "Hero Section") ||
    extractPromptBriefSection(prompt, "Hero") ||
    extractPromptBriefSection(prompt, "首屏");
  const productGrid =
    extractPromptBriefSection(prompt, "Product Grid") ||
    extractPromptBriefSection(prompt, "产品中心") ||
    extractPromptBriefSection(prompt, "产品模块");
  const featureStrip =
    extractPromptBriefSection(prompt, "Features Strip") ||
    extractPromptBriefSection(prompt, "能力优势") ||
    extractPromptBriefSection(prompt, "核心优势");
  const caseSlider =
    extractPromptBriefSection(prompt, "Case Slider") ||
    extractPromptBriefSection(prompt, "应用案例") ||
    extractPromptBriefSection(prompt, "案例");
  const about = extractPromptBriefSection(prompt, "About") || extractPromptBriefSection(prompt, "关于我们");
  const certification =
    extractPromptBriefSection(prompt, "Certification") ||
    extractPromptBriefSection(prompt, "资质认证") ||
    extractPromptBriefSection(prompt, "认证");
  const contactCapture =
    extractPromptBriefSection(prompt, "Contact & Capture") ||
    extractPromptBriefSection(prompt, "联系我们") ||
    extractPromptBriefSection(prompt, "联系与留资");
  const footer = extractPromptBriefSection(prompt, "Footer") || extractPromptBriefSection(prompt, "页脚");
  const plainBrandSection = extractLabeledBlock(prompt, ["品牌定位", "brand"]);
  const plainPagesSection = extractLabeledBlock(prompt, ["页面与目标", "页面清单", "pages"]);
  const plainProductsSection = extractLabeledBlock(prompt, ["产品样板", "产品清单", "products"]);
  const plainCasesSection = extractLabeledBlock(prompt, ["案例样板", "案例清单", "cases"]);
  const plainContactSection = extractLabeledBlock(prompt, ["联系方式与转化", "联系方式与线索字段", "联系方式", "contact"]);
  const plainAssetsSection = extractLabeledBlock(prompt, ["可信度资产", "SEO资产", "SEO 资产", "强烈建议"]);
  const fallbackHeader = extractLabeledBlock(prompt, ["Header", "Navigation"]);
  const fallbackProductGrid = extractLabeledBlock(prompt, [
    "Product Grid",
    "Product cards must feature these four machines",
    "Product cards must feature these machines",
  ]);
  const fallbackFeatureStrip = extractLabeledBlock(prompt, ["Features Strip", "Features strip must include"]);
  const fallbackCaseSlider = extractLabeledBlock(prompt, [
    "Case Slider",
    "Cases section must focus on these applications",
  ]);
  const fallbackAbout = extractLabeledBlock(prompt, ["About summary", "About"]);
  const fallbackCertification = extractLabeledBlock(prompt, ["Certification section", "Certifications", "Certification"]);
  const fallbackContactCapture = extractLabeledBlock(prompt, ["Contact & Capture", "Contact Capture", "Contact"]);
  const fallbackBusinessDetails = extractLabeledBlock(prompt, ["Business details"]);
  const fallbackFooter = extractLabeledBlock(prompt, ["Footer"]);
  const markdownBrandSection = extractMarkdownHeadingSection(prompt, ["brand", "品牌定位", "品牌"]) || plainBrandSection;
  const markdownPagesSection = extractMarkdownHeadingSection(prompt, ["pages", "页面清单", "页面与目标"]) || plainPagesSection;
  const markdownProductsSection =
    extractMarkdownHeadingSection(prompt, ["products", "产品清单", "产品样板"]) || plainProductsSection;
  const markdownCasesSection = extractMarkdownHeadingSection(prompt, ["cases", "案例清单", "案例样板"]) || plainCasesSection;
  const markdownContactSection = extractMarkdownHeadingSection(prompt, [
    "联系方式",
    "线索字段",
    "联系方式与转化",
    "联系方式与线索字段",
  ]) || plainContactSection;
  const markdownAssetsSection =
    extractMarkdownHeadingSection(prompt, ["强烈建议", "可信度资产", "seo 资产", "seo资产"]) || plainAssetsSection;
  const STRUCTURAL_NOISE_TOKEN_PATTERN =
    /\b(navigation|nav|header|footer|menu|section|layout|breadcrumb|topnav|sidebar)\b/gi;
  const STRUCTURAL_NOISE_TOKEN_PATTERN_ZH = /(导航栏?|页眉|页脚|菜单栏?|布局|面包屑|侧边栏)/g;
  const normalizeInlineToken = (value: string) =>
    String(value || "")
      .replace(/\*+/g, "")
      .replace(STRUCTURAL_NOISE_TOKEN_PATTERN, " ")
      .replace(STRUCTURAL_NOISE_TOKEN_PATTERN_ZH, " ")
      .replace(/^[\s-]+|[\s-]+$/g, "")
      .replace(/[.。]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const parseRouteLabelsFromSection = (value: string) => {
    const labels: string[] = [];
    const matches = Array.from(
      String(value || "").matchAll(/(?:^|\n)\s*[-*|]?\s*\/([a-zA-Z0-9\-\/]*)\s*(?:\(([^)（）:\n]{1,30})\)|([^\n:：]{1,24}))?\s*[:：]/g)
    );
    matches.forEach((match) => {
      const pathPart = String(match[1] || "").trim();
      const normalizedPath = normalizePromptPagePath(pathPart ? `/${pathPart}` : "/");
      const fallback = defaultPageLabelForPath(normalizedPath, prompt);
      const candidate = normalizeInlineToken(String(match[2] || match[3] || ""));
      labels.push(candidate || fallback);
    });
    return labels.filter(Boolean);
  };
  const parseProductItemsFromSamples = (value: string) => {
    const raw = String(value || "");
    if (!raw.trim()) return [] as string[];
    const blocks = raw.split(/\n(?=\s*\d+\s*[.)、])/);
    const items = blocks
      .map((block) => {
        const name =
          block.match(/(?:产品名称|名称)\s*[：:]\s*([^\n]+)/i)?.[1] ||
          block.match(/^\s*\d+\s*[.)、]\s*(.+)$/m)?.[1] ||
          "";
        const model = block.match(/型号\s*[：:]\s*([A-Za-z0-9-]{2,})/i)?.[1] || "";
        const title = normalizeInlineToken(name).replace(/\*+/g, "").trim();
        if (!title) return "";
        if (!model || title.toLowerCase().includes(model.toLowerCase())) return title;
        return `${title}（${model.trim()}）`;
      })
      .filter(Boolean);
    return Array.from(new Set(items)).slice(0, 8);
  };
  const parseCaseItemsFromSamples = (value: string) => {
    const raw = String(value || "");
    if (!raw.trim()) return [] as string[];
    const enumeratedItems = raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^([A-Za-z]\)|\d+[.)、]|[一二三四五六七八九十]+[、.)])\s*/.test(line))
      .map((line) => normalizeInlineToken(line.replace(/^([A-Za-z]\)|\d+[.)、]|[一二三四五六七八九十]+[、.)])\s*/, "")))
      .filter(Boolean);
    const headerMatches = Array.from(raw.matchAll(/案例\s*[A-Za-z0-9一二三四五六七八九十]*\s*[：:]\s*([^\n]+)/gi));
    if (!headerMatches.length) return Array.from(new Set(enumeratedItems)).slice(0, 8);
    const items = headerMatches.map((match, index) => {
      const title = normalizeInlineToken(String(match[1] || ""));
      const start = match.index ?? 0;
      const end = index < headerMatches.length - 1 ? headerMatches[index + 1].index ?? raw.length : raw.length;
      const block = raw.slice(start, end);
      const outcome = normalizeInlineToken(block.match(/(?:结果|成效)\s*[：:]\s*([^\n]+)/i)?.[1] || "");
      if (!title) return "";
      return outcome ? `${title}（${outcome}）` : title;
    });
    const merged = [...enumeratedItems, ...items.filter(Boolean)];
    const deduped = Array.from(
      merged.reduce((acc, item) => {
        const canonical = String(item || "")
          .replace(/^([A-Za-z]\)|\d+[.)、]|[一二三四五六七八九十]+[、.)])\s*/, "")
          .trim()
          .toLowerCase();
        if (!canonical) return acc;
        if (!acc.has(canonical)) acc.set(canonical, item);
        return acc;
      }, new Map<string, string>())
    ).map((entry) => entry[1]);
    return deduped.slice(0, 8);
  };
  const brandFromMarkdown =
    normalizeInlineToken(markdownBrandSection.match(/(?:公司|企业|品牌)\s*[：:]\s*([^\n]+)/i)?.[1] || "") ||
    normalizeInlineToken(markdownBrandSection.match(/name\s*[：:]\s*([^\n]+)/i)?.[1] || "");
  const logo =
    header.match(/Logo\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    header.match(/品牌\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    brandFromMarkdown ||
    extractFirstLineMatch(prompt, [/Company name\s*[:：]\s*(.+)/i]) ||
    "";
  const nav = parsePipeList(
    header.match(/Nav\s*[:：]\s*(.+)/i)?.[1] ||
      header.match(/导航\s*[:：]\s*(.+)/i)?.[1] ||
      parseRouteLabelsFromSection(markdownPagesSection).join(" | ") ||
      extractFirstLineMatch(prompt, [
        /Navigation(?: must be exactly)?\s*[:：]\s*(.+)/i,
        /Nav\s*[:：]\s*(.+)/i,
        /导航(?:必须)?\s*[:：]\s*(.+)/i,
      ])
  );
  const compactHeroLine = extractFirstLineMatch(prompt, [
    /Home hero\s*[:：]\s*(.+)/i,
    /Hero(?: section)?\s*[:：]\s*(.+)/i,
  ]);
  const compactHeroTitle = compactHeroLine
    ? compactHeroLine.replace(/\b(?:Subtitle|Sub|CTAs?|CTA)\s*[:：].*$/i, "").trim()
    : "";
  const compactHeroSubtitle =
    compactHeroLine.match(/\b(?:Subtitle|Sub)\s*[:：]\s*(.+?)(?=\bCTAs?\s*[:：]|$)/i)?.[1]?.trim() || "";
  const compactHeroCtaLine = compactHeroLine.match(/\bCTAs?\s*[:：]\s*(.+)$/i)?.[1]?.trim() || "";
  const heroTitle =
    hero.match(/Title\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    hero.match(/标题\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    extractFirstLineMatch(prompt, [/(?:^|\n)\s*Hero title\s*[:：]\s*(.+)/i, /(?:^|\n)\s*Title\s*[:：]\s*(.+)/i]) ||
    compactHeroTitle;
  const heroSubtitle =
    hero.match(/Sub\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    hero.match(/副标题\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    extractFirstLineMatch(prompt, [
      /(?:^|\n)\s*Hero subtitle\s*[:：]\s*(.+)/i,
      /(?:^|\n)\s*Sub(?:title)?\s*[:：]\s*(.+)/i,
      /(?:^|\n)\s*副标题\s*[:：]\s*(.+)/i,
    ]) ||
    compactHeroSubtitle;
  const ctaLine =
    hero.match(/CTA\s*[:：]\s*(.+)/i)?.[1] ||
    hero.match(/按钮\s*[:：]\s*(.+)/i)?.[1] ||
    markdownContactSection.match(/(?:CTA\s*文案|CTA)\s*[：:]\s*(.+)/i)?.[1] ||
    extractFirstLineMatch(prompt, [/(?:^|\n)\s*CTA\s*[:：]\s*(.+)/i, /(?:^|\n)\s*Primary CTA\s*[:：]\s*(.+)/i]) ||
    compactHeroCtaLine;
  const heroCtasFromLines = [
    extractFirstLineMatch(prompt, [/Primary CTA\s*[:：]\s*(.+)/i]),
    extractFirstLineMatch(prompt, [/Secondary CTA\s*[:：]\s*(.+)/i]),
  ].filter(Boolean);
  const heroCtas = heroCtasFromLines.length
    ? heroCtasFromLines
    : (() => {
        const piped = parsePipeList(ctaLine);
        if (piped.length > 1) return piped;
        const delimited = parseDelimitedList(ctaLine);
        return delimited.length ? delimited : piped;
      })();
  const combinedProductGrid = [productGrid, fallbackProductGrid, markdownProductsSection].filter(Boolean).join("\n");
  const combinedFeatureStrip = [featureStrip, fallbackFeatureStrip, markdownAssetsSection].filter(Boolean).join("\n");
  const combinedCaseSlider = [caseSlider, fallbackCaseSlider, markdownCasesSection].filter(Boolean).join("\n");
  const combinedAbout = [about, fallbackAbout, markdownBrandSection].filter(Boolean).join("\n");
  const combinedCertification = [certification, fallbackCertification, markdownAssetsSection].filter(Boolean).join("\n");
  const combinedContactCapture = [contactCapture, fallbackContactCapture, markdownContactSection].filter(Boolean).join("\n");
  const combinedFooter = [footer, fallbackFooter, fallbackBusinessDetails, markdownContactSection].filter(Boolean).join("\n");
  if (
    !header &&
    !hero &&
    !productGrid &&
    !featureStrip &&
    !caseSlider &&
    !about &&
    !contactCapture &&
    !footer &&
    !heroTitle &&
    !heroSubtitle &&
    !heroCtas.length &&
    !combinedProductGrid &&
    !combinedFeatureStrip &&
    !combinedCaseSlider &&
    !combinedAbout &&
    !combinedContactCapture &&
    !combinedFooter &&
    !markdownBrandSection &&
    !markdownPagesSection &&
    !markdownProductsSection &&
    !markdownCasesSection &&
    !markdownContactSection
  ) {
    return null;
  }
  const footerLinkLine =
    combinedFooter
      .split(/\n+/)
      .map((line) => line.trim())
      .find((line) => line.includes("|") && !/whatsapp|email|address|copyright/i.test(line)) || "";
  const footerLinks = parsePipeList(footerLinkLine).filter((label) => !/^sitemap$/i.test(label));
  const phoneTokens = Array.from(
    new Set(
      Array.from(prompt.matchAll(/(?:电话|热线|联系电话|Whatsapp|WhatsApp)\s*[:：]\s*([+0-9][0-9\-+\s、,，/]{5,})/gi))
        .flatMap((match) => String(match[1] || "").split(/[、,，/]/))
        .map((item) => item.replace(/\s+/g, "").trim())
        .filter((item) => /^(\+?\d[\d-]{5,})$/.test(item))
    )
  );
  const footerPhoneLine =
    combinedFooter.match(/(?:WhatsApp|电话|热线|联系电话)\s*[:：]\s*([^\n]+)/i)?.[1] || "";
  const footerPhones = Array.from(
    new Set(
      String(footerPhoneLine || "")
        .split(/[、,，/]/)
        .map((item) => item.replace(/\s+/g, "").trim())
        .filter((item) => /^(\+?\d[\d-]{5,})$/.test(item))
    )
  );
  const whatsapp = footerPhones.slice(0, 2).join(" / ") || phoneTokens.slice(0, 2).join(" / ") || "";
  const email =
    combinedFooter.match(/Email\s*[:：]\s*([^\s]+@[^\s]+)/i)?.[1]?.trim() ||
    prompt.match(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/)?.[1]?.trim() ||
    "";
  const address =
    combinedFooter.match(/Address\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    combinedFooter.match(/地址\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    "";
  const copyright =
    combinedFooter.match(/Copyright\s*©?\s*\d{4}.*$/im)?.[0]?.trim() ||
    combinedFooter.match(/版权\s*[:：]?\s*.*$/im)?.[0]?.trim() ||
    "";
  const contactTitle =
    combinedContactCapture.match(/Right\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    combinedContactCapture.match(/右侧\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    combinedContactCapture.match(/(?:Quick\s*Quote\s*Form|Quote\s*Form)\s*[:：]?\s*(.+)?/i)?.[1]?.trim() ||
    combinedContactCapture.match(/(?:在线留言板|在线留言|留言表单)\s*[:：]?\s*(.+)?/i)?.[1]?.trim() ||
    combinedContactCapture.match(/(?:询价表单|联系表单)\s*[:：]?\s*(.+)?/i)?.[1]?.trim() ||
    "";
  const contactFieldLine =
    combinedContactCapture.match(/Fields\s*[:：]\s*(.+)/i)?.[1] ||
    combinedContactCapture.match(/字段\s*[:：]\s*(.+)/i)?.[1] ||
    combinedContactCapture.match(/表单字段\s*[:：]\s*(.+)/i)?.[1] ||
    "";
  const contactFields = parseContactFieldList(contactFieldLine);
  const consentText =
    combinedContactCapture.match(/Consent\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    combinedContactCapture.match(/同意项\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    "";
  const productItems = Array.from(
    new Set([...parseProductItemsFromSamples(markdownProductsSection), ...parseBulletList(combinedProductGrid)])
  ).slice(0, 8);
  const parsedCaseItems = parseCaseItemsFromSamples(markdownCasesSection || combinedCaseSlider);
  const caseItems = (
    parsedCaseItems.length
      ? parsedCaseItems
      : Array.from(new Set([...parseBulletList(combinedCaseSlider), ...parsePipeList(combinedCaseSlider)]))
  ).slice(0, 8);
  const certificationLine = extractFirstLineMatch(combinedCertification, [
    /(?:证书|认证|certifications?|certification)\s*[:：]\s*(.+)/i,
  ]);
  const certifications = Array.from(
    new Set([...parsePipeList(combinedCertification.replace(/\n/g, " | ")), ...parseDelimitedList(certificationLine)])
  ).slice(0, 8);
  const baseBrief: StructuredBrief = {
    brand: sanitizeBrandCandidate(logo) || extractBrandNameFromPromptLite(prompt) || "Brand",
    nav,
    heroTitle,
    heroSubtitle,
    heroCtas,
    productItems,
    featureItems: parseBulletList(combinedFeatureStrip),
    caseItems,
    aboutText: combinedAbout.replace(/\s+/g, " ").trim(),
    certifications,
    footerLinks,
    whatsapp,
    email,
    address,
    copyright,
    contactTitle,
    contactFields,
    consentText,
    mode: /red\s*\+\s*beige|red and beige|红色.*米黄|米黄.*红色/i.test(prompt) ? "light" : undefined,
    palette: /red\s*\+\s*beige|red and beige|红色.*米黄|米黄.*红色/i.test(prompt)
      ? {
          primary: "#A32024",
          accent: "#D8C1A0",
          bg: "#F4EEE4",
          neutral: "#DDD4C8",
          text: "#1E1815",
          textSecondary: "#6C6157",
        }
      : undefined,
  };
  return mergeStructuredInputIntoBrief(baseBrief, promptStructuredInput);
};

const deriveStructuredBriefFromPrompt = (prompt: string): StructuredBrief => {
  const raw = String(prompt || "");
  const useChinese = shouldUseChineseContent(raw);
  const brand = sanitizeBrandCandidate(extractBrandNameFromPromptLite(raw)) || (useChinese ? "本公司" : "Company");
  const factPackSection = (() => {
    const marker = raw.search(/#\s*External\s+Fact\s+Pack(?:\s*\(Serper\))?/i);
    if (marker < 0) return "";
    return raw.slice(marker);
  })();
  const factLines = factPackSection
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^-\s+/.test(line))
    .map((line) => line.replace(/^-+\s*/, "").replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const sanitizeFactToken = (value: string) => {
    let next = String(value || "")
      .replace(/https?:\/\/\S+/gi, " ")
      .replace(/www\.\S+/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    next = next
      .replace(/(?:深圳|中国|广东|有限公司|有限责任公司|官网|官方网站|首页|详情|更多|项目|信息)/g, " ")
      .replace(/\b(?:official|website|home|details?|more|platform)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    next = next.replace(/^[-:：|,，。；;]+|[-:：|,，。；;]+$/g, "").trim();
    if (!next) return "";
    const maxLen = /[\u4e00-\u9fff]/.test(next) ? 22 : 48;
    if (next.length <= maxLen) return next;
    const split = next.split(/[，。；;,:：|]/).map((item) => item.trim()).filter(Boolean);
    const clipped = split.find((item) => item.length >= 4 && item.length <= maxLen) || next.slice(0, maxLen);
    return clipped.trim();
  };

  const factCandidates = Array.from(
    new Set(
      factLines
        .flatMap((line) => line.split(/[|｜]/))
        .map((item) => sanitizeFactToken(item))
        .filter((item) => item.length >= 4)
    )
  );

  const pickClean = (pattern: RegExp, limit: number) =>
    Array.from(new Set(factCandidates.filter((line) => pattern.test(line)))).slice(0, limit);

  const explicitProducts = Array.from(
    new Set(
      (raw.match(
        /(?:3C[^，。；;\n]{0,20}(?:加工中心|机床|设备|中心)|(?:手机|笔电|电脑|摄像头|按键)[^，。；;\n]{0,16}(?:加工中心|机床|设备|边框))/gi
      ) || [])
        .map((item) => sanitizeFactToken(item))
        .filter(Boolean)
    )
  ).slice(0, 6);
  const productItems = explicitProducts.length
    ? explicitProducts
    : pickClean(/(机床|加工|机型|设备|数控|cnc|machining|machine|product|center|精雕机|刀库机)/i, 6);

  const explicitCases = Array.from(
    new Set(
      (raw.match(/(?:手机中框|笔电外壳|摄像头边框|按键)[^，。；;\n]{0,12}(?:加工|案例)?/gi) || [])
        .map((item) => sanitizeFactToken(item))
        .filter(Boolean)
    )
  ).slice(0, 6);
  const caseItems = explicitCases.length
    ? explicitCases
    : pickClean(/(案例|应用|项目|客户|交付|case|application|project|customer)/i, 6);

  const featureItems = pickClean(/(交付|支持|定制|样机|服务|lead[-\s]?time|prototype|shipment|support|custom|打样)/i, 6);
  const certifications = Array.from(
    new Set(
      [
        ...pickClean(/(iso[\s-]*9001|iso|ce|sgs|认证|certification|certified)/i, 4),
        ...(raw.match(/\bISO\s*9001\b|\bCE\b|\bSGS\b/gi) || []),
      ]
        .map((item) => sanitizeFactToken(item))
        .filter(Boolean)
    )
  ).slice(0, 4);

  const genericProductDefaults = useChinese
    ? ["核心产品线 A", "核心产品线 B", "核心产品线 C", "定制化产品方案"]
    : ["Core Product Line A", "Core Product Line B", "Core Product Line C", "Custom Product Program"];
  const genericCaseDefaults = useChinese
    ? ["典型客户落地案例", "跨场景方案交付案例", "效率优化项目案例", "质量提升项目案例"]
    : [
        "Representative Customer Delivery Case",
        "Cross-Scenario Solution Case",
        "Efficiency Optimization Case",
        "Quality Improvement Case",
      ];
  const genericFeatureDefaults = useChinese
    ? ["快速方案评估", "分阶段交付", "本地化服务支持"]
    : ["Fast solution assessment", "Phased delivery", "Localized service support"];
  const fallbackProducts = Array.from(new Set([...productItems, ...genericProductDefaults])).filter(Boolean).slice(0, 6);
  const fallbackCases = Array.from(new Set([...caseItems, ...genericCaseDefaults])).filter(Boolean).slice(0, 6);
  const fallbackFeatures = Array.from(new Set([...featureItems, ...genericFeatureDefaults])).filter(Boolean).slice(0, 6);
  const fallbackCertifications =
    certifications.length > 0 ? certifications : /(iso|ce|sgs|认证)/i.test(raw) ? ["ISO 9001", "CE", "SGS"] : [];

  const aboutTextMatch =
    raw.match(/(?:关于|简介|about)[\s:：-]*([^\n]{12,220})/i)?.[1]?.trim() ||
    raw.match(/(?:since|成立于)\s*[0-9]{4}[^\n]{0,120}/i)?.[0]?.trim() ||
    "";
  const aboutText =
    aboutTextMatch ||
    (useChinese
      ? `${brand}专注于面向企业客户的网站与解决方案建设，提供从需求评估到持续优化的全流程支持。`
      : `${brand} focuses on enterprise websites and solution delivery, covering requirement discovery, rollout, and continuous optimization.`);

  return {
    brand,
    productItems: fallbackProducts,
    caseItems: fallbackCases,
    featureItems: fallbackFeatures,
    certifications: fallbackCertifications,
    aboutText,
  };
};

const applyGenericStructuredBriefOverrides = (
  pages: GeneratedPage[],
  brief: StructuredBrief,
  prompt: string
): GeneratedPage[] => {
  const isChinesePrompt = shouldUseChineseContent(prompt);
  const fallbackBrand = sanitizeBrandCandidate(String(brief.brand || "").trim()) || (isChinesePrompt ? "本公司" : "Company");
  const pagePathSet = new Set(pages.map((page) => normalizePromptPagePath(String(page.path || "/"))));

  const navLinks = (() => {
    const source = Array.isArray(brief.nav) ? brief.nav : [];
    const links = source
      .map((label) => String(label || "").trim())
      .filter(Boolean)
      .map((label) => {
        const preferred = resolveEnterprisePagePathFromLabel(label);
        const href =
          preferred !== "/"
            ? preferred
            : /^home|首页$/i.test(label)
              ? "/"
              : null;
        if (!href) return null;
        return { label, href, variant: "link" as const };
      })
      .filter((item): item is { label: string; href: string; variant: "link" } => Boolean(item));
    const deduped = Array.from(
      links.reduce((acc, item) => {
        if (!acc.has(item.href)) acc.set(item.href, item);
        return acc;
      }, new Map<string, { label: string; href: string; variant: "link" }>())
    ).map((entry) => entry[1]);
    if (deduped.length > 0) return deduped;
    const fallback = pages
      .map((page) => {
        const href = normalizePromptPagePath(String(page.path || "/"));
        const rawLabel = String(page.name || "").trim();
        const label = resolveLocalizedPageLabel(rawLabel, href, prompt);
        return { label, href, variant: "link" as const };
      })
      .filter((item) => item.href === "/" || pagePathSet.has(item.href));
    return fallback.slice(0, 8);
  })();

  const navText = navLinks.map((item) => item.label).join(" | ");
  const primaryCta = String(brief.heroCtas?.[0] || (isChinesePrompt ? "立即咨询" : "Contact")).trim();
  const secondaryCta = String(brief.heroCtas?.[1] || (isChinesePrompt ? "获取资料" : "Request Catalog")).trim();
  const footerColumns = (() => {
    if (Array.isArray(brief.footerLinks) && brief.footerLinks.length > 0) {
      return [
        {
          title: isChinesePrompt ? "快速入口" : "Quick Links",
          links: brief.footerLinks
            .map((label) => String(label || "").trim())
            .filter(Boolean)
            .map((label) => ({ label, href: resolveEnterprisePagePathFromLabel(label) || "/" })),
        },
      ];
    }
    const nonHome = navLinks.filter((item) => item.href !== "/");
    return [
      {
        title: isChinesePrompt ? "产品与方案" : "Products & Solutions",
        links: nonHome
          .filter((item) => {
            const type = inferEnterprisePageTypeFromPath(item.href);
            return type === "products" || type === "solutions" || type === "cases";
          })
          .slice(0, 4),
      },
      {
        title: isChinesePrompt ? "公司信息" : "Company",
        links: nonHome
          .filter((item) => {
            const type = inferEnterprisePageTypeFromPath(item.href);
            return type === "about" || type === "contact" || type === "support";
          })
          .slice(0, 4),
      },
      {
        title: isChinesePrompt ? "法务" : "Legal",
        links: [
          {
            label: isChinesePrompt ? "隐私政策" : "Privacy",
            href: pagePathSet.has("/privacy") ? "/privacy" : "/",
          },
        ],
      },
    ].filter((column) => column.links.length > 0);
  })();
  const navLabelByPath = new Map(navLinks.map((item) => [item.href, item.label] as const));

  const replaceLeakText = (value: string) => {
    let next = String(value || "");
    if (!next.trim()) return next;
    next = next
      .replace(/\b(navigation|nav|header|footer|menu|section|layout|breadcrumb|topnav|sidebar)\b/gi, " ")
      .replace(/(导航栏?|页眉|页脚|菜单栏?|布局|面包屑|侧边栏)/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!next) return "";
    const brandLikeHyphenPattern = /\b[A-Z]{2,}(?:-[A-Z0-9]{2,})+\b/g;
    next = next.replace(brandLikeHyphenPattern, (token) => {
      if (fallbackBrand && token.toLowerCase() === fallbackBrand.toLowerCase()) return token;
      return fallbackBrand;
    });
    const markedBrandPattern = /\b([A-Za-z][A-Za-z0-9-]{1,})(?:\s+[A-Za-z0-9-]{1,}){0,2}[™®]/g;
    next = next.replace(markedBrandPattern, fallbackBrand);
    next = next.replace(/\b(Contact|Talk to)\s+[A-Z][A-Za-z0-9-]{2,}(?:\s+[A-Z][A-Za-z0-9-]{2,})?\b/g, (_m, verb) => {
      return `${verb} ${fallbackBrand}`;
    });
    if (isChinesePrompt) {
      next = next.replace(/\bHome\b/g, "首页");
      next = next.replace(/\bProducts\b/g, "产品中心");
      next = next.replace(/\bSolutions\b/g, "解决方案");
      next = next.replace(/\bCases\b/g, "应用案例");
      next = next.replace(/\bAbout\b/g, "关于我们");
      next = next.replace(/\bContact\b/g, "联系我们");
    }
    return next;
  };

  const deepRewrite = (value: unknown): unknown => {
    if (typeof value === "string") return replaceLeakText(value);
    if (Array.isArray(value)) return value.map((entry) => deepRewrite(entry));
    if (!value || typeof value !== "object") return value;
    const next: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
      next[key] = deepRewrite(entry);
    });
    return next;
  };

  return pages.map((page) => {
    const pagePath = normalizePromptPagePath(String(page.path || "/"));
    const existingRoot =
      page?.data?.root && typeof page.data.root === "object"
        ? page.data.root
        : ({
            props: {
              title: String(page?.name || "Page"),
              theme: {},
            },
          } as any);
    const nextPage: GeneratedPage = {
      ...page,
      name: navLabelByPath.get(pagePath) || page.name,
      data: {
        ...((page.data || {}) as Record<string, unknown>),
        root: existingRoot,
        content: Array.isArray(page?.data?.content)
          ? page.data.content.map((item) => {
              const props = (deepRewrite(item?.props || {}) as Record<string, unknown>) || {};
              const token = `${String(item?.type || "")} ${String(props?.id || "")}`.toLowerCase();
              if (isNavbarLikeBlock(item as any)) {
                props.logoText = fallbackBrand;
                props.logotext = fallbackBrand;
                props.logotexttext = fallbackBrand;
                props.brandtext = fallbackBrand.toUpperCase();
                props.links = navLinks;
                props.navtext = navText;
                props.toplinkstext = navText;
                props.actionstext = primaryCta;
                props.ctahtxttext = primaryCta;
                props.logintxttext = isChinesePrompt ? "联系我们" : "Contact";
              }
              if (isFooterLikeBlock(item as any)) {
                props.logoText = fallbackBrand;
                props.columns = footerColumns;
                if (brief.copyright) props.legal = brief.copyright;
                if (brief.copyright) props.copytext = brief.copyright;
                if (brief.address) props.footeraddresstext = brief.address;
                if (brief.address) props.footercompanytext = brief.address;
                if (brief.whatsapp || brief.email) props.footercontacttext = brief.whatsapp || brief.email;
              }
              if (pagePath === "/" && /(hero|masthead|banner|intro)/.test(token)) {
                if (brief.heroTitle) {
                  props.title = brief.heroTitle;
                  props.titletext = brief.heroTitle;
                  props.herotitletext = brief.heroTitle;
                  props.heroTitletext = brief.heroTitle;
                }
                if (brief.heroSubtitle) {
                  props.subtitle = brief.heroSubtitle;
                  props.desctext = brief.heroSubtitle;
                  props.herodesctext = brief.heroSubtitle;
                  props.heroSubtext = brief.heroSubtitle;
                }
                if (brief.heroCtas?.[0]) {
                  props.heroPrimaryTexttext = brief.heroCtas[0];
                  props.herobtntexttext = brief.heroCtas[0];
                  props.ctatexttext = brief.heroCtas[0];
                }
                if (brief.heroCtas?.[1]) {
                  props.heroSecondaryTexttext = brief.heroCtas[1];
                  props.herobtntxttext = brief.heroCtas[1];
                }
              }
              if (pagePath === "/contact" && /(contact|lead|quote|form|cta)/.test(token)) {
                if (brief.contactTitle) props.title = brief.contactTitle;
                if (brief.consentText) props.note = brief.consentText;
                if (!props.submitLabel) props.submitLabel = isChinesePrompt ? "提交询盘" : "Submit Request";
                if (brief.contactFields?.length) {
                  props.formFields = brief.contactFields.map((field) => ({ label: field, key: normalizeKey(field) }));
                }
              }
              return { ...item, props };
            })
          : [],
      },
    };
    return nextPage;
  });
};

const applyStructuredBriefContentEnrichment = (
  pages: GeneratedPage[],
  brief: StructuredBrief,
  prompt: string
): GeneratedPage[] => {
  const useChinese = shouldUseChineseContent(prompt);
  const normalizeEntityKey = (value: string) =>
    String(value || "")
      .toLowerCase()
      .replace(/[（）()]/g, " ")
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const productDetails = Array.isArray(brief.productDetails)
    ? brief.productDetails
        .map((entry) => ({
          name: String(entry?.name || "").trim(),
          model: String(entry?.model || "").trim() || undefined,
          category: String(entry?.category || "").trim() || undefined,
          summary: String(entry?.summary || "").trim() || undefined,
          image: String(entry?.image || "").trim() || undefined,
          specs: entry?.specs && typeof entry.specs === "object" ? (entry.specs as Record<string, string>) : undefined,
          ctaLabel: String(entry?.ctaLabel || "").trim() || undefined,
        }))
        .filter((entry) => entry.name)
    : [];
  const caseDetails = Array.isArray(brief.caseDetails)
    ? brief.caseDetails
        .map((entry) => ({
          title: String(entry?.title || "").trim(),
          customerType: String(entry?.customerType || "").trim() || undefined,
          problem: String(entry?.problem || "").trim() || undefined,
          solution: String(entry?.solution || "").trim() || undefined,
          result: String(entry?.result || "").trim() || undefined,
        }))
        .filter((entry) => entry.title)
    : [];
  const productDetailByKey = new Map<string, (typeof productDetails)[number]>();
  productDetails.forEach((entry) => {
    const key = normalizeEntityKey(entry.name);
    if (key && !productDetailByKey.has(key)) productDetailByKey.set(key, entry);
    const keyedWithModel = normalizeEntityKey(`${entry.name} ${entry.model || ""}`);
    if (keyedWithModel && !productDetailByKey.has(keyedWithModel)) productDetailByKey.set(keyedWithModel, entry);
  });
  const caseDetailByKey = new Map<string, (typeof caseDetails)[number]>();
  caseDetails.forEach((entry) => {
    const key = normalizeEntityKey(entry.title);
    if (key && !caseDetailByKey.has(key)) caseDetailByKey.set(key, entry);
  });
  const detailNames = productDetails.map((entry) => entry.name);
  const productItems = Array.from(
    new Set([...(brief.productItems || []).map((item) => String(item || "").trim()).filter(Boolean), ...detailNames])
  ).slice(0, Math.max(12, Number(process.env.BUILDER_ENRICHMENT_PRODUCT_LIMIT || 36)));
  const featureItems = Array.from(new Set((brief.featureItems || []).map((item) => String(item || "").trim()).filter(Boolean))).slice(
    0,
    Math.max(8, Number(process.env.BUILDER_ENRICHMENT_FEATURE_LIMIT || 18))
  );
  const caseItems = Array.from(new Set((brief.caseItems || []).map((item) => String(item || "").trim()).filter(Boolean))).slice(
    0,
    Math.max(8, Number(process.env.BUILDER_ENRICHMENT_CASE_LIMIT || 18))
  );
  const mergedCaseItems = Array.from(new Set([...caseItems, ...caseDetails.map((entry) => entry.title)])).slice(
    0,
    Math.max(8, Number(process.env.BUILDER_ENRICHMENT_CASE_LIMIT || 18))
  );
  const splitSemanticSegments = (value: string) =>
    String(value || "")
      .split(/[；;，,、\/|]/)
      .map((part) => part.trim())
      .filter((part) => part.length >= (useChinese ? 2 : 4));
  const denseProductItems = (() => {
    const list = [...productItems];
    const add = (value: string) => {
      const text = String(value || "").trim();
      if (!text) return;
      if (!list.includes(text)) list.push(text);
    };
    productDetails.forEach((entry) => {
      if (entry.model && entry.name && !entry.name.includes(entry.model)) add(`${entry.name}（${entry.model}）`);
      if (entry.category && entry.name) add(useChinese ? `${entry.category}机型` : `${entry.category} models`);
      if (entry.model) add(useChinese ? `${entry.model} 机型` : `${entry.model} model`);
      splitSemanticSegments(entry.summary || "")
        .slice(0, 3)
        .forEach((segment) => add(useChinese ? `${entry.name} · ${segment}` : `${entry.name} · ${segment}`));
      Object.entries(entry.specs || {})
        .slice(0, 4)
        .forEach(([key, value]) => add(useChinese ? `${entry.name} ${key}${value}` : `${entry.name} ${key} ${value}`));
    });
    if (list.length < 8) {
      const fallback = useChinese
        ? ["高精密加工中心", "多主轴批量加工方案", "自动换刀复合加工方案", "玻璃/亚克力专用加工方案", "金属壳体加工方案", "定制化产线机型"]
        : [
            "High-precision machining center",
            "Multi-spindle batch machining line",
            "ATC integrated machining solution",
            "Glass/acrylic dedicated setup",
            "Metal housing machining setup",
            "Custom production-line configuration",
          ];
      fallback.forEach((item) => add(item));
    }
    return list.slice(0, Math.max(12, Number(process.env.BUILDER_ENRICHMENT_PRODUCT_LIMIT || 36)));
  })();
  const denseFeatureItems = (() => {
    const list = [...featureItems];
    const add = (value: string) => {
      const text = String(value || "").trim();
      if (!text) return;
      if (!list.includes(text)) list.push(text);
    };
    productDetails.forEach((entry) => {
      Object.entries(entry.specs || {})
        .slice(0, 2)
        .forEach(([key, value]) => {
          add(useChinese ? `${key}：${value}` : `${key}: ${value}`);
        });
      if (entry.summary) add(entry.summary);
    });
    caseDetails.forEach((entry) => {
      if (entry.result) add(entry.result);
      if (entry.solution) add(entry.solution);
      if (entry.problem) add(entry.problem);
    });
    if (list.length < 9) {
      const fallback = useChinese
        ? [
            "快速打样流程",
            "交期保障机制",
            "工艺参数可追溯",
            "本地化技术支持",
            "量产良率优化",
            "售后响应闭环",
            "现场调机支持",
            "设备健康巡检",
            "工艺迭代优化",
          ]
        : [
            "Rapid prototyping flow",
            "Lead-time assurance",
            "Traceable process parameters",
            "Localized technical support",
            "Yield optimization for production",
            "Closed-loop after-sales response",
            "On-site commissioning support",
            "Machine health inspection",
            "Continuous process tuning",
          ];
      fallback.forEach((item) => add(item));
    }
    return list.slice(0, Math.max(8, Number(process.env.BUILDER_ENRICHMENT_FEATURE_LIMIT || 18)));
  })();
  const denseCaseItems = (() => {
    const list = [...mergedCaseItems];
    const add = (value: string) => {
      const text = String(value || "").trim();
      if (!text) return;
      if (!list.includes(text)) list.push(text);
    };
    caseDetails.forEach((entry) => {
      if (entry.result) add(useChinese ? `${entry.title}（${entry.result}）` : `${entry.title} (${entry.result})`);
      if (entry.problem) add(entry.problem);
      if (entry.solution) add(entry.solution);
      if (entry.problem) add(useChinese ? `${entry.title}：问题 ${entry.problem}` : `${entry.title}: problem ${entry.problem}`);
      if (entry.solution) add(useChinese ? `${entry.title}：方案 ${entry.solution}` : `${entry.title}: solution ${entry.solution}`);
      if (entry.result) add(useChinese ? `${entry.title}：结果 ${entry.result}` : `${entry.title}: result ${entry.result}`);
    });
    if (list.length < 6) {
      const fallback = useChinese
        ? ["亚克力面板精加工", "手机中框精密加工", "笔记本外壳复杂型腔加工", "摄像头边框高光加工", "键盘按键批量加工", "复合材料高效加工"]
        : [
            "Acrylic panel precision finishing",
            "Phone-frame precision machining",
            "Laptop shell cavity machining",
            "Camera bezel high-gloss machining",
            "Keypad batch machining",
            "Composite material high-efficiency machining",
          ];
      fallback.forEach((item) => add(item));
    }
    return list.slice(0, Math.max(8, Number(process.env.BUILDER_ENRICHMENT_CASE_LIMIT || 18)));
  })();
  const certifications = Array.from(
    new Set((brief.certifications || []).map((item) => String(item || "").trim()).filter(Boolean))
  ).slice(0, 8);
  const aboutText = String(brief.aboutText || "").trim();
  const localImagePool = [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=80",
  ];
  const hash = (value: string) => {
    let h = 0;
    for (let index = 0; index < value.length; index += 1) {
      h = (h * 33 + value.charCodeAt(index)) >>> 0;
    }
    return h;
  };
  const pickImage = (pagePath: string, token: string, index = 0) => {
    const seed = hash(`${pagePath}:${token}:${index}`);
    return localImagePool[seed % localImagePool.length];
  };
  const buildProductDescription = (name: string, detail?: (typeof productDetails)[number]) => {
    if (!detail) return useChinese ? `${name}，支持参数定制与工艺验证。` : `${name} with configurable specs and process validation.`;
    const specsPreview = Object.entries(detail.specs || {})
      .slice(0, 2)
      .map(([key, value]) => `${key}: ${value}`)
      .join(useChinese ? "；" : " · ");
    const segments = [detail.summary || "", specsPreview].filter(Boolean);
    if (segments.length > 0) return segments.join(useChinese ? "；" : " ");
    return useChinese ? `${name}，支持参数定制与工艺验证。` : `${name} with configurable specs and process validation.`;
  };
  const buildCaseDescription = (name: string, detail?: (typeof caseDetails)[number]) => {
    if (!detail) return useChinese ? `${name}，覆盖方案落地与结果验证。` : `${name} with solution delivery and measurable outcomes.`;
    const segments = [detail.problem || "", detail.solution || "", detail.result || ""].filter(Boolean);
    if (segments.length > 0) return segments.join(useChinese ? "；" : " ");
    return useChinese ? `${name}，覆盖方案落地与结果验证。` : `${name} with solution delivery and measurable outcomes.`;
  };
  const toCards = (items: string[], href: string, pagePath: string, keySeed: string) =>
    items.map((item, index) => {
      const key = normalizeEntityKey(item);
      const productDetail = productDetailByKey.get(key);
      const caseDetail = caseDetailByKey.get(key);
      const isCaseContext = pagePath === "/cases" || href === "/cases" || /case/i.test(keySeed);
      const title = productDetail?.model ? `${productDetail.name} · ${productDetail.model}` : caseDetail?.title || item;
      const description = isCaseContext
        ? buildCaseDescription(item, caseDetail)
        : buildProductDescription(item, productDetail);
      const subtitle = productDetail?.category || caseDetail?.customerType || "";
      const imageSrc = productDetail?.image || pickImage(pagePath, `${keySeed}:${item}`, index);
      return {
        title,
        subtitle,
        description,
        image: imageSrc ? { src: imageSrc, alt: title } : undefined,
        cta: {
          label: productDetail?.ctaLabel || (useChinese ? "了解详情" : "Learn more"),
          href,
          variant: "link",
        },
      };
    });

  const toFeatures = (items: string[]) =>
    items.map((item) => ({
      title: item,
      desc: useChinese ? `${item}，确保项目交付与产线稳定运行。` : `${item} to ensure delivery and production stability.`,
      icon: "shield",
    }));

  const dedupeLocalContent = (content: any[]) => {
    const seen = new Set<string>();
    const deduped: any[] = [];
    content.forEach((item) => {
      const type = String(item?.type || "");
      const id = String(item?.props?.id || item?._key || "");
      const key = `${type}::${id}`;
      if (seen.has(key)) return;
      seen.add(key);
      deduped.push(item);
    });
    return deduped;
  };
  const capRepetitiveMiddleBlocks = (content: any[]) => {
    const roleMax = new Map<string, number>([
      ["approach", 2],
      ["products", 2],
      ["socialproof", 2],
      ["story", 2],
    ]);
    const roleCount = new Map<string, number>();
    const classify = (item: any) => {
      const token = String(item?.type || "").toLowerCase();
      if (/feature|approach|process|workflow|capability/.test(token)) return "approach";
      if (/cardsgrid|productcatalog|product|catalog|pricing|plan/.test(token)) return "products";
      if (/testimonial|social|proof|logo|certification/.test(token)) return "socialproof";
      if (/contentstory|story|timeline|about|faq/.test(token)) return "story";
      return "other";
    };
    return content.filter((item) => {
      const type = String(item?.type || "").toLowerCase();
      if (/navbar|navigation|hero|footer|creationfooterfallback|leadcapture|contact|cta/.test(type)) return true;
      const role = classify(item);
      const max = roleMax.get(role);
      if (!max) return true;
      const next = (roleCount.get(role) || 0) + 1;
      roleCount.set(role, next);
      return next <= max;
    });
  };

  return pages.map((page) => {
    const pagePath = normalizePromptPagePath(String(page.path || "/"));
    const content = Array.isArray(page?.data?.content) ? [...page.data.content] : [];
    if (!content.length) return page;

    const findIndex = (pattern: RegExp) => content.findIndex((item: any) => pattern.test(String(item?.type || "")));
    const hasType = (pattern: RegExp) => findIndex(pattern) >= 0;
    const ctaIndex = findIndex(/leadcapture|contact|cta/i);
    const applyHeroByPageType = () => {
      const heroIndex = findIndex(/hero/i);
      if (heroIndex < 0) return;
      const current = (content[heroIndex] || {}) as {
        type?: string;
        props?: Record<string, unknown>;
        [key: string]: unknown;
      };
      const currentProps =
        current?.props && typeof current.props === "object" ? { ...(current.props as Record<string, unknown>) } : {};
      const contactChannels = [brief.whatsapp, brief.email].filter((item) => String(item || "").trim()).join(" / ");
      const heroByPath = {
        "/": {
          title: brief.heroTitle || (useChinese ? "高精密数控机床解决方案" : "High-Precision CNC Solutions"),
          subtitle:
            brief.heroSubtitle ||
            (useChinese
              ? "聚焦3C零组件与精密零件加工，兼顾精度、节拍与交付效率。"
              : "Built for 3C components and precision parts with balanced quality, throughput, and lead-time."),
          primaryLabel: useChinese ? "查看产品中心" : "Explore Products",
          primaryHref: "/products",
          secondaryLabel: useChinese ? "获取定制方案" : "Request Custom Plan",
          secondaryHref: "/contact",
        },
        "/about": {
          title: useChinese ? "公司概况" : "About Us",
          subtitle: useChinese ? "聚焦企业历程、研发能力与制造体系。"
            : "Company background, R&D capability, and manufacturing system overview.",
          primaryLabel: useChinese ? "查看产品中心" : "View Products",
          primaryHref: "/products",
          secondaryLabel: useChinese ? "联系团队" : "Contact Team",
          secondaryHref: "/contact",
        },
        "/products": {
          title: useChinese ? "产品中心" : "Product Center",
          subtitle: useChinese ? "按机型、参数与应用场景快速选型。"
            : "Select models quickly by machine type, key specs, and use scenarios.",
          primaryLabel: useChinese ? "索取报价" : "Request Quote",
          primaryHref: "/contact",
          secondaryLabel: useChinese ? "查看案例" : "View Cases",
          secondaryHref: "/cases",
        },
        "/cases": {
          title: useChinese ? "应用案例" : "Application Cases",
          subtitle: useChinese ? "围绕材质、工艺难点与量产指标呈现真实项目。"
            : "Real projects covering material challenges, process methods, and KPI outcomes.",
          primaryLabel: useChinese ? "查看解决方案" : "View Solutions",
          primaryHref: "/solutions",
          secondaryLabel: useChinese ? "咨询同类场景" : "Discuss Your Scenario",
          secondaryHref: "/contact",
        },
        "/solutions": {
          title: useChinese ? "解决方案" : "Solutions",
          subtitle: useChinese ? "围绕工艺路线、设备配置与交付ROI制定方案。"
            : "Plan by process route, machine configuration, and delivery ROI.",
          primaryLabel: useChinese ? "获取定制方案" : "Get Custom Plan",
          primaryHref: "/contact",
          secondaryLabel: useChinese ? "查看产品组合" : "See Product Mix",
          secondaryHref: "/products",
        },
        "/contact": {
          title: brief.contactTitle || (useChinese ? "联系我们" : "Contact Us"),
          subtitle:
            (useChinese
              ? `提交需求信息，我们将在1个工作日内响应。${contactChannels ? `可通过 ${contactChannels} 快速沟通。` : ""}`
              : `Share your requirement and receive a response within one business day.${contactChannels ? ` Reach us via ${contactChannels}.` : ""}`
            ).trim(),
          primaryLabel: useChinese ? "提交询盘" : "Submit Inquiry",
          primaryHref: "/contact",
          secondaryLabel: useChinese ? "返回首页" : "Back to Home",
          secondaryHref: "/",
        },
      } as Record<string, { title: string; subtitle: string; primaryLabel: string; primaryHref: string; secondaryLabel?: string; secondaryHref?: string }>;
      const target = heroByPath[pagePath];
      if (!target) return;
      const ctas = [
        { label: target.primaryLabel, href: target.primaryHref, variant: "primary" as const },
        ...(target.secondaryLabel && target.secondaryHref
          ? [{ label: target.secondaryLabel, href: target.secondaryHref, variant: "secondary" as const }]
          : []),
      ];
      currentProps.title = target.title;
      currentProps.heading = target.title;
      currentProps.headline = target.title;
      currentProps.titletext = target.title;
      currentProps.herotitletext = target.title;
      currentProps.heroTitletext = target.title;
      currentProps.subtitle = target.subtitle;
      currentProps.description = target.subtitle;
      currentProps.subhead = target.subtitle;
      currentProps.desctext = target.subtitle;
      currentProps.herodesctext = target.subtitle;
      currentProps.heroSubtext = target.subtitle;
      currentProps.ctas = ctas;
      currentProps.heroPrimaryTexttext = target.primaryLabel;
      currentProps.herobtntexttext = target.primaryLabel;
      currentProps.ctatexttext = target.primaryLabel;
      if (target.secondaryLabel) {
        currentProps.heroSecondaryTexttext = target.secondaryLabel;
        currentProps.herobtntxttext = target.secondaryLabel;
      }
      content[heroIndex] = {
        ...current,
        type: String(current.type || "HeroSplit"),
        props: currentProps,
      } as any;
    };
    applyHeroByPageType();

    const upsertCardsBlock = (
      title: string,
      subtitle: string,
      items: string[],
      href: string,
      keySeed: string,
      replaceExisting = true
    ) => {
      if (!items.length) return;
      const block = {
        type: "CardsGrid",
        props: {
          id: `${keySeed}-cards`,
          anchor: keySeed,
          title,
          subtitle,
          variant: "product",
          columns: "3col",
          density: "normal",
          cardStyle: "solid",
          maxWidth: "xl",
          items: toCards(items, href, pagePath, keySeed),
          paddingY: "lg",
          motionPreset: "stagger",
        },
        _key: `${pagePath}:${keySeed}:enriched`,
      };
      const cardsIndex = findIndex(/cardsgrid|productcatalog/i);
      if (cardsIndex >= 0 && replaceExisting) {
        content[cardsIndex] = block;
      } else {
        content.splice(ctaIndex >= 0 ? ctaIndex : content.length, 0, block);
      }
    };

    const upsertFeatureBlock = (title: string, subtitle: string, items: string[], keySeed: string, replaceExisting = true) => {
      if (!items.length) return;
      const block = {
        type: "FeatureGrid",
        props: {
          id: `${keySeed}-features`,
          anchor: keySeed,
          title,
          subtitle,
          variant: "3col",
          maxWidth: "xl",
          items: toFeatures(items),
          paddingY: "lg",
          motionPreset: "stagger",
        },
        _key: `${pagePath}:${keySeed}:enriched`,
      };
      const featureIndex = findIndex(/featuregrid|features/i);
      if (featureIndex >= 0 && replaceExisting) {
        content[featureIndex] = block;
      } else {
        content.splice(ctaIndex >= 0 ? ctaIndex : content.length, 0, block);
      }
    };
    const ensureContentStory = (input: {
      id: string;
      anchor: string;
      title: string;
      subtitle: string;
      body: string;
      ctas?: Array<{ label: string; href: string; variant?: "link" | "primary" | "secondary" }>;
    }) => {
      const existingIndex = findIndex(/contentstory|story/i);
      const block = {
        type: "ContentStory",
        props: {
          id: input.id,
          anchor: input.anchor,
          title: input.title,
          subtitle: input.subtitle,
          body: input.body,
          ctas: Array.isArray(input.ctas) ? input.ctas : undefined,
          variant: "split",
          maxWidth: "xl",
          paddingY: "lg",
        },
        _key: `${pagePath}:${input.anchor}:enriched`,
      };
      if (existingIndex >= 0 && /selection-guide|solution-process|case-summary|about-overview/.test(String(input.id || ""))) {
        if (!String((content[existingIndex] as any)?.props?.id || "").includes(input.id)) {
          content.splice(existingIndex + 1, 0, block);
        }
      } else if (existingIndex < 0) {
        content.splice(ctaIndex >= 0 ? ctaIndex : content.length, 0, block);
      }
    };

    if (pagePath === "/") {
      upsertCardsBlock(
        useChinese ? "产品中心" : "Product Center",
        useChinese ? "核心产品与应用场景概览。" : "Overview of core offerings and application scenarios.",
        denseProductItems.slice(0, Math.max(4, Number(process.env.BUILDER_HOME_PRODUCTS_MIN || 6))),
        "/products",
        "home-products"
      );
      upsertFeatureBlock(
        useChinese ? "能力优势" : "Key Advantages",
        useChinese ? "围绕样机速度、交付效率与本地支持构建。" : "Built around prototyping speed, delivery efficiency, and local support.",
        denseFeatureItems,
        "home-features"
      );
      if (caseItems.length) {
        upsertCardsBlock(
          useChinese ? "应用案例" : "Application Cases",
          useChinese ? "典型行业应用与交付实践。" : "Representative industry applications and delivery practice.",
          denseCaseItems.slice(0, Math.max(4, Number(process.env.BUILDER_HOME_CASES_MIN || 6))),
          "/cases",
          "home-cases",
          false
        );
      }
      if (certifications.length) {
        content.splice(ctaIndex >= 0 ? ctaIndex : content.length, 0, {
          type: "ContentStory",
          props: {
            id: "home-certifications",
            anchor: "home-certifications",
            title: useChinese ? "资质认证" : "Certifications",
            subtitle: useChinese ? "质量与合规体系认证。" : "Quality and compliance certifications.",
            body: certifications.join(useChinese ? "；" : " · "),
            variant: "simple",
            maxWidth: "xl",
            paddingY: "lg",
          },
        });
      }
    } else if (pagePath === "/products") {
      upsertCardsBlock(
        useChinese ? "产品中心" : "Products",
        useChinese ? "按业务场景划分的完整产品列表。" : "Complete product lineup by business scenario.",
        denseProductItems.slice(0, Math.max(8, Number(process.env.BUILDER_PRODUCTS_PAGE_MIN || 12))),
        "/products",
        "products"
      );
      const productFeatureItems =
        denseFeatureItems.length > 0
          ? denseFeatureItems.slice(0, 6)
          : useChinese
          ? ["按工件材质选型", "按节拍目标匹配", "按精度与成本平衡"]
          : ["Select by material", "Match by cycle time", "Balance precision and cost"];
      upsertFeatureBlock(
        useChinese ? "选型维度" : "Selection Dimensions",
        useChinese ? "从材质、节拍、精度三个维度完成机型筛选。" : "Select models by material, throughput, and precision targets.",
        productFeatureItems,
        "products-dimensions",
        false
      );
      ensureContentStory({
        id: "products-selection-guide",
        anchor: "selection-guide",
        title: useChinese ? "选型指南" : "Selection Guide",
        subtitle: useChinese ? "按工件类型、节拍与精度要求匹配机型。" : "Match product combinations by use case, timeline, and target outcomes.",
        body: useChinese
          ? "围绕业务目标与约束条件，提供参数范围、试样建议与交付节奏。"
          : "Provide parameter ranges, pilot recommendations, and delivery cadence based on business goals and constraints.",
      });
    } else if (pagePath === "/solutions") {
      upsertFeatureBlock(
        useChinese ? "定制方案" : "Custom Solutions",
        useChinese ? "围绕客户工艺节拍提供方案配置。" : "Solution configuration aligned to customer process cadence.",
        denseFeatureItems.slice(0, Math.max(9, Number(process.env.BUILDER_SOLUTIONS_FEATURES_MIN || 12))),
        "solutions"
      );
      upsertCardsBlock(
        useChinese ? "推荐设备组合" : "Recommended Equipment Mix",
        useChinese ? "按典型应用场景组合主机、刀具与工艺参数。" : "Bundle machine, tooling, and process parameters by application scenario.",
        denseProductItems.slice(0, Math.max(6, Number(process.env.BUILDER_SOLUTIONS_PRODUCTS_MIN || 8))),
        "/products",
        "solutions-products",
        false
      );
      ensureContentStory({
        id: "solutions-process",
        anchor: "solution-process",
        title: useChinese ? "实施路径" : "Implementation Path",
        subtitle: useChinese ? "从需求澄清到验收交付的分阶段方法。" : "A phased method from requirement alignment to delivery acceptance.",
        body: denseFeatureItems.slice(0, 3).join(useChinese ? "；" : " · ") || (useChinese ? "需求评估；打样验证；量产交付" : "Assess requirements · Validate pilot · Deliver for production"),
      });
    } else if (pagePath === "/cases") {
      upsertCardsBlock(
        useChinese ? "应用案例" : "Cases",
        useChinese ? "真实项目案例与落地结果。" : "Real project examples and delivery outcomes.",
        denseCaseItems.slice(0, Math.max(6, Number(process.env.BUILDER_CASES_PAGE_MIN || 10))),
        "/cases",
        "cases"
      );
      const testimonialIndex = findIndex(/testimonial|review|socialproof/i);
      if (testimonialIndex < 0 && caseDetails.length > 0) {
        content.splice(ctaIndex >= 0 ? ctaIndex : content.length, 0, {
          type: "TestimonialsGrid",
          props: {
            id: "cases-outcomes",
            anchor: "case-outcomes",
            title: useChinese ? "结果与反馈" : "Outcomes & Feedback",
            subtitle: useChinese ? "聚焦良率、成本、交付周期等关键指标。" : "Focus on yield, cost, and delivery cycle KPIs.",
            items: caseDetails.slice(0, 6).map((entry) => ({
              quote: entry.result || entry.solution || (useChinese ? "项目交付稳定，产线效率提升。" : "Stable delivery with improved production efficiency."),
              author: entry.customerType || (useChinese ? "客户项目团队" : "Customer team"),
              role: entry.title,
              avatar: {
                src: pickImage(pagePath, entry.title, 0),
                alt: entry.title,
              },
            })),
            variant: "cards",
            maxWidth: "xl",
            paddingY: "lg",
          },
        });
      }
      ensureContentStory({
        id: "cases-summary",
        anchor: "case-summary",
        title: useChinese ? "案例方法论" : "Case Delivery Method",
        subtitle: useChinese ? "以问题定义、方案验证、量产复盘构建闭环。" : "Close the loop with problem framing, solution validation, and production review.",
        body: caseDetails
          .slice(0, 3)
          .map((entry) => entry.result || entry.solution || entry.problem || entry.title)
          .filter(Boolean)
          .join(useChinese ? "；" : " · "),
      });
    } else if (pagePath === "/about") {
      if (aboutText) {
        const storyIndex = findIndex(/contentstory|story|about/i);
        if (storyIndex >= 0) {
          const current = content[storyIndex];
          const currentProps = current?.props && typeof current.props === "object" ? current.props : {};
          content[storyIndex] = {
            ...current,
            type: "ContentStory",
            props: {
              ...currentProps,
              title: useChinese ? "关于我们" : "About Us",
              subtitle: useChinese ? "企业简介与发展历程" : "Company profile and development",
              body: aboutText,
              variant: "split",
            },
          };
        } else {
          ensureContentStory({
            id: "about-overview",
            anchor: "about-overview",
            title: useChinese ? "关于我们" : "About Us",
            subtitle: useChinese ? "企业简介与发展历程" : "Company profile and development",
            body: aboutText,
          });
        }
      }
      if (certifications.length) {
        upsertFeatureBlock(
          useChinese ? "资质认证" : "Certifications",
          useChinese ? "质量与合规体系认证。" : "Quality and compliance certifications.",
          certifications,
          "about-certifications"
        );
      }
    }

    const nextData = {
      ...(page.data as Record<string, unknown>),
      root: (page.data as any)?.root,
      content: capRepetitiveMiddleBlocks(dedupeLocalContent(content)),
    };
    return {
      ...(page as any),
      data: nextData,
    } as GeneratedPage;
  });
};

const chunkBy = <T,>(items: T[], chunkSize: number): T[][] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const safeSize = Math.max(1, Math.floor(chunkSize));
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }
  return chunks;
};

const cloneBlock = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const expandCatalogPagesFromBrief = (
  pages: GeneratedPage[],
  brief: StructuredBrief,
  prompt: string
): GeneratedPage[] => {
  type CatalogDetail = {
    name: string;
    model?: string;
    category?: string;
    summary?: string;
    image?: string;
    specs?: Record<string, string>;
    ctaLabel?: string;
    detailPath?: string;
  };
  const useChinese = shouldUseChineseContent(prompt);
  const pageSize = clampPositiveInt(
    Number(brief.catalogPageSize || process.env.BUILDER_CATALOG_PAGE_SIZE || 12),
    12,
    6,
    24
  );
  const maxDetailPages = clampPositiveInt(
    Number(process.env.BUILDER_CATALOG_MAX_DETAIL_PAGES || 120),
    120,
    1,
    240
  );
  const sourceDetails: CatalogDetail[] =
    Array.isArray(brief.productDetails) && brief.productDetails.length
      ? brief.productDetails.map((entry) => ({
          name: String(entry?.name || "").trim(),
          model: String(entry?.model || "").trim() || undefined,
          category: String(entry?.category || "").trim() || undefined,
          summary: String(entry?.summary || "").trim() || undefined,
          image: String(entry?.image || "").trim() || undefined,
          specs: entry?.specs && typeof entry.specs === "object" ? (entry.specs as Record<string, string>) : undefined,
          ctaLabel: String(entry?.ctaLabel || "").trim() || undefined,
        }))
      : Array.from(new Set((brief.productItems || []).map((item) => String(item || "").trim()).filter(Boolean))).map((item) => ({
          name: item,
          summary: useChinese ? `${item} 参数可定制，支持打样与批量交付。` : `${item} with configurable specs and pilot-to-mass delivery.`,
        }));
  const splitSummarySegments = (value: string) =>
    String(value || "")
      .split(/[；;，,、\/|]/)
      .map((part) => part.trim())
      .filter((part) => part.length >= (useChinese ? 2 : 4));
  const syntheticCatalogMin = clampPositiveInt(
    Number(process.env.BUILDER_CATALOG_SYNTHETIC_MIN || 8),
    8,
    2,
    24
  );
  const expandedSourceDetails: CatalogDetail[] = [];
  const pushCatalogDetail = (detail: CatalogDetail) => {
    const name = String(detail?.name || "").trim();
    if (!name) return;
    expandedSourceDetails.push({
      ...detail,
      name,
      model: String(detail?.model || "").trim() || undefined,
      category: String(detail?.category || "").trim() || undefined,
      summary: String(detail?.summary || "").trim() || undefined,
      image: String(detail?.image || "").trim() || undefined,
    });
  };
  sourceDetails.forEach((detail) => {
    pushCatalogDetail(detail);
    Object.entries(detail.specs || {})
      .slice(0, 3)
      .forEach(([key, value]) => {
        const specLabel = useChinese ? `${key}${value}` : `${key} ${value}`;
        pushCatalogDetail({
          ...detail,
          name: `${detail.name} · ${specLabel}`,
          summary: useChinese
            ? `${detail.name}，关键参数：${key}${value}。`
            : `${detail.name}, key spec: ${key} ${value}.`,
        });
      });
    splitSummarySegments(detail.summary || "")
      .slice(0, 2)
      .forEach((segment) => {
        pushCatalogDetail({
          ...detail,
          name: `${detail.name} · ${segment}`,
          summary: useChinese ? `${detail.name}，${segment}。` : `${detail.name}, ${segment}.`,
        });
      });
    if (detail.category) {
      pushCatalogDetail({
        ...detail,
        name: useChinese ? `${detail.category}应用机型` : `${detail.category} application model`,
        summary: detail.summary,
      });
    }
  });
  if (expandedSourceDetails.length < syntheticCatalogMin) {
    const fallbackSeeds = Array.from(
      new Set(
        [
          ...(brief.productItems || []),
          ...(brief.featureItems || []),
          ...(brief.caseItems || []),
        ]
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      )
    );
    fallbackSeeds.slice(0, syntheticCatalogMin - expandedSourceDetails.length).forEach((seed) => {
      pushCatalogDetail({
        name: seed,
        summary: useChinese ? `${seed}，支持按需求配置与交付。` : `${seed} with configurable delivery.`,
      });
    });
  }
  const normalizedDetails = Array.from(
    expandedSourceDetails.reduce((acc, item) => {
      const name = String(item?.name || "").trim();
      if (!name) return acc;
      const key = `${name.toLowerCase()}::${String(item?.model || "").trim().toLowerCase()}`;
      if (acc.has(key)) return acc;
      acc.set(key, {
        name,
        model: String(item?.model || "").trim() || undefined,
        category: String(item?.category || "").trim() || undefined,
        summary: String(item?.summary || "").trim() || undefined,
        image: String(item?.image || "").trim() || undefined,
        specs:
          item?.specs && typeof item.specs === "object"
            ? Object.entries(item.specs as Record<string, string>).reduce<Record<string, string>>((specs, [k, v]) => {
                const keyText = String(k || "").trim();
                const valueText = String(v || "").trim();
                if (!keyText || !valueText) return specs;
                specs[keyText] = valueText;
                return specs;
              }, {})
            : undefined,
        ctaLabel: String(item?.ctaLabel || "").trim() || undefined,
      });
      return acc;
    }, new Map<string, CatalogDetail>())
  ).map((entry) => entry[1]);

  if (!normalizedDetails.length) return pages;

  const normalizedPages = Array.isArray(pages) ? [...pages] : [];
  const normalizedPathSet = new Set(
    normalizedPages.map((page) => normalizePromptPagePath(String(page.path || "/")))
  );
  const allPageLinks = normalizedPages.map((page) => ({
    href: normalizePromptPagePath(String(page.path || "/")),
    label: resolveLocalizedPageLabel(String(page.name || ""), normalizePromptPagePath(String(page.path || "/")), prompt),
  }));
  const navLinks = Array.from(
    allPageLinks.reduce((acc, item) => {
      if (!item.href) return acc;
      if (!acc.has(item.href)) {
        acc.set(item.href, { label: item.label || defaultPageLabelForPath(item.href, prompt), href: item.href, variant: "link" as const });
      }
      return acc;
    }, new Map<string, { label: string; href: string; variant: "link" }>())
  )
    .map((entry) => entry[1])
    .filter((item) => inferEnterprisePageTypeFromPath(item.href) !== "legal")
    .slice(0, 8);

  const fallbackNavbar =
    normalizedPages
      .flatMap((page) => (Array.isArray(page?.data?.content) ? page.data.content : []))
      .find((block: any) => isNavbarLikeBlock(block)) || null;
  const fallbackFooter =
    [...normalizedPages]
      .reverse()
      .flatMap((page) => (Array.isArray(page?.data?.content) ? page.data.content : []).slice().reverse())
      .find((block: any) => isFooterLikeBlock(block)) || null;

  const createNavbarBlock = (pagePath: string, pageLabel: string) =>
    fallbackNavbar
      ? (() => {
          const cloned = cloneBlock(fallbackNavbar);
          const props =
            cloned?.props && typeof cloned.props === "object"
              ? ({ ...(cloned.props as Record<string, unknown>) } as Record<string, unknown>)
              : {};
          props.links = navLinks.length ? navLinks : props.links;
          props.ctas = [{ label: useChinese ? "获取报价" : "Get Quote", href: "/contact", variant: "primary" }];
          props.id = props.id || `navbar-${toSlug(pageLabel) || "page"}`;
          return { ...cloned, props };
        })()
      : {
          type: "Navbar",
          props: {
            id: `navbar-${toSlug(pageLabel) || "page"}`,
            links: navLinks.length ? navLinks : [{ label: useChinese ? "首页" : "Home", href: "/", variant: "link" }],
            ctas: [{ label: useChinese ? "获取报价" : "Get Quote", href: "/contact", variant: "primary" }],
            sticky: true,
            paddingY: "sm",
            maxWidth: "xl",
          },
        };

  const createFooterBlock = (pageLabel: string) =>
    fallbackFooter
      ? cloneBlock(fallbackFooter)
      : {
          type: "Footer",
          props: {
            id: `footer-${toSlug(pageLabel) || "page"}`,
            columns: [
              {
                title: useChinese ? "产品" : "Products",
                links: navLinks.filter((item) => /\/products|\/solutions|\/cases/.test(item.href)).slice(0, 5),
              },
              {
                title: useChinese ? "公司" : "Company",
                links: navLinks.filter((item) => /\/about|\/contact/.test(item.href)).slice(0, 4),
              },
            ],
            variant: "multiColumn",
            paddingY: "md",
            maxWidth: "xl",
            legal: useChinese ? "版权所有" : "All rights reserved.",
          },
        };

  const buildCardsFromDetails = (
    items: Array<{
      name: string;
      model?: string;
      category?: string;
      summary?: string;
      image?: string;
      specs?: Record<string, string>;
      ctaLabel?: string;
      detailPath?: string;
    }>
  ) =>
    items.map((item) => ({
      title: item.model ? `${item.name} · ${item.model}` : item.name,
      subtitle: item.category || "",
      description:
        item.summary ||
        (useChinese ? `${item.name} 支持参数定制与加工工艺验证。` : `${item.name} supports configurable specs and process validation.`),
      image: item.image ? { src: item.image, alt: item.name } : undefined,
      cta: {
        label: item.ctaLabel || (useChinese ? "查看详情" : "View details"),
        href: item.detailPath || "/products",
        variant: "link" as const,
      },
    }));

  const detailPathSet = new Set<string>();
  const detailRecords = normalizedDetails.slice(0, maxDetailPages).map((item, index) => {
    const seed = `${item.name}-${item.model || index}`;
    let slug = toSlug(seed);
    if (!slug) slug = `product-${index + 1}`;
    let path = `/products/${slug}`;
    let counter = 2;
    while (normalizedPathSet.has(path) || detailPathSet.has(path)) {
      path = `/products/${slug}-${counter}`;
      counter += 1;
    }
    detailPathSet.add(path);
    return { ...item, detailPath: path };
  });

  const productChunks = chunkBy(detailRecords, pageSize);
  const categories = Array.from(new Set(detailRecords.map((item) => String(item.category || "").trim()).filter(Boolean)));

  const createCatalogPage = (params: {
    path: string;
    name: string;
    chunk: typeof detailRecords;
    chunkIndex: number;
    totalChunks: number;
  }): GeneratedPage => {
    const paginationLabel = useChinese
      ? `第 ${params.chunkIndex + 1} / ${params.totalChunks} 页`
      : `Page ${params.chunkIndex + 1} of ${params.totalChunks}`;
    const paginationLinks = productChunks.map((_, index) => ({
      label: useChinese ? `第${index + 1}页` : `Page ${index + 1}`,
      href: index === 0 ? "/products" : `/products/page-${index + 1}`,
      variant: "link" as const,
    }));
    const contentBlocks: Array<{ type: string; props: Record<string, unknown> }> = [
      createNavbarBlock(params.path, params.name) as any,
      {
        type: "HeroCentered",
        props: {
          id: `catalog-hero-${params.chunkIndex + 1}`,
          title: useChinese ? "产品目录" : "Product Catalog",
          subtitle: useChinese
            ? `按分类浏览机型与参数，支持分页查看。${paginationLabel}`
            : `Browse machine models and specs by category with pagination. ${paginationLabel}`,
          ctas: [
            { label: useChinese ? "联系销售" : "Contact Sales", href: "/contact", variant: "primary" as const },
            { label: useChinese ? "案例中心" : "View Cases", href: "/cases", variant: "secondary" as const },
          ],
          align: "start",
          paddingY: "lg",
          maxWidth: "xl",
        },
      },
    ];
    contentBlocks.push({
      type: "FeatureGrid",
      props: {
        id: "products-filters",
        title: useChinese ? "选型维度" : "Selection Dimensions",
        subtitle:
          categories.length > 1
            ? useChinese
              ? "按设备分类快速定位目标机型。"
              : "Quickly locate models by category."
            : useChinese
            ? "从材质、节拍、精度三个维度完成机型筛选。"
            : "Select models by material, throughput, and precision targets.",
        variant: "4col",
        maxWidth: "xl",
        paddingY: "md",
        items:
          categories.length > 1 && params.chunkIndex === 0
            ? categories.slice(0, 12).map((category) => ({
                title: category,
                desc: useChinese ? `查看 ${category} 相关机型` : `Explore models under ${category}`,
                icon: "filter",
              }))
            : (useChinese
                ? ["按材质匹配主轴配置", "按节拍评估多头并行", "按精度确定治具与工艺", "按交期规划交付批次"]
                : [
                    "Match spindle setup by material",
                    "Evaluate multi-head throughput",
                    "Align tooling with precision goals",
                    "Plan delivery by production phase",
                  ]
              ).map((text) => ({
                title: text,
                desc: useChinese ? "支持按项目约束快速组合参数。" : "Build parameter sets around project constraints.",
                icon: "check-circle",
              })),
      },
    });
    contentBlocks.push({
      type: "CardsGrid",
      props: {
        id: `products-grid-${params.chunkIndex + 1}`,
        anchor: `products-page-${params.chunkIndex + 1}`,
        title: useChinese ? "机型列表" : "Models",
        subtitle: useChinese ? "支持目录分页与详情页跳转。" : "Catalog pagination with detail-page navigation.",
        variant: "imageText",
        columns: "3col",
        density: "normal",
        cardStyle: "solid",
        maxWidth: "xl",
        items: buildCardsFromDetails(params.chunk),
        paddingY: "lg",
        motionPreset: "stagger",
      },
    });
    contentBlocks.push({
      type: "ContentStory",
      props: {
        id: `products-guide-${params.chunkIndex + 1}`,
        title: useChinese ? "目录导览" : "Catalog Guide",
        subtitle:
          params.totalChunks > 1
            ? useChinese
              ? "快速跳转到其他目录页。"
              : "Jump between catalog pages."
            : useChinese
            ? "按机型能力、参数与交付节奏完成选型。"
            : "Choose models by capability, specs, and delivery cadence.",
        body:
          params.totalChunks > 1
            ? paginationLinks.map((item) => `${item.label} → ${item.href}`).join(" | ")
            : useChinese
            ? "建议先确定加工材质与精度目标，再结合节拍与预算筛选机型。"
            : "Start from material and precision targets, then filter by throughput and budget.",
        ctas: params.totalChunks > 1 ? paginationLinks : [{ label: useChinese ? "联系选型顾问" : "Talk to Advisor", href: "/contact", variant: "link" as const }],
        variant: "simple",
        maxWidth: "xl",
        paddingY: "md",
      },
    });
    if (Array.isArray(brief.faqItems) && brief.faqItems.length > 0 && params.chunkIndex === 0) {
      contentBlocks.push({
        type: "FAQAccordion",
        props: {
          id: "products-faq",
          title: useChinese ? "常见问题" : "FAQ",
          variant: "singleOpen",
          maxWidth: "xl",
          paddingY: "lg",
          items: brief.faqItems.slice(0, 12).map((item) => ({ q: item.question, a: item.answer })),
        },
      });
    }
    contentBlocks.push({
      type: "LeadCaptureCTA",
      props: {
        id: `products-cta-${params.chunkIndex + 1}`,
        title: useChinese ? "获取定制方案与报价" : "Get a tailored proposal and quote",
        subtitle: useChinese ? "提交需求后 24 小时内响应。" : "Submit requirements and get a response within 24 hours.",
        cta: { label: useChinese ? "提交询盘" : "Submit Inquiry", href: "/contact", variant: "primary" as const },
        maxWidth: "xl",
        paddingY: "md",
      },
    });
    contentBlocks.push(createFooterBlock(params.name) as any);
    return {
      path: params.path,
      name: params.name,
      data: {
        content: contentBlocks,
        root: {
          props: {
            title: params.name,
            theme: {},
          },
        },
      },
    };
  };

  const expandedPages = [...normalizedPages];
  const productsPageName = useChinese ? "产品中心" : "Products";
  const firstCatalog = createCatalogPage({
    path: "/products",
    name: productsPageName,
    chunk: productChunks[0] || detailRecords.slice(0, pageSize),
    chunkIndex: 0,
    totalChunks: Math.max(1, productChunks.length),
  });
  const productsIndex = expandedPages.findIndex((page) => normalizePromptPagePath(String(page.path || "/")) === "/products");
  if (productsIndex >= 0) expandedPages[productsIndex] = firstCatalog;
  else expandedPages.push(firstCatalog);

  if (productChunks.length > 1) {
    productChunks.slice(1).forEach((chunk, idx) => {
      const pageIndex = idx + 2;
      const path = `/products/page-${pageIndex}`;
      if (normalizedPathSet.has(path)) return;
      expandedPages.push(
        createCatalogPage({
          path,
          name: useChinese ? `产品目录第${pageIndex}页` : `Products Page ${pageIndex}`,
          chunk,
          chunkIndex: idx + 1,
          totalChunks: productChunks.length,
        })
      );
      normalizedPathSet.add(path);
    });
  }

  detailRecords.forEach((item, index) => {
    const path = item.detailPath;
    if (!path || normalizedPathSet.has(path)) return;
    const specItems = Object.entries(item.specs || {}).slice(0, 12);
    const specText = specItems.map(([key, value]) => `${key}: ${value}`).join(" | ");
    const detailPage: GeneratedPage = {
      path,
      name: item.model ? `${item.name} ${item.model}` : item.name,
      data: {
        content: [
          createNavbarBlock(path, item.name) as any,
          {
            type: "HeroCentered",
            props: {
              id: `product-detail-hero-${index + 1}`,
              title: item.model ? `${item.name} · ${item.model}` : item.name,
              subtitle:
                item.summary ||
                (useChinese
                  ? "单机详情页：用于展示核心参数、应用场景与交付建议。"
                  : "Product detail page for key specs, use cases, and delivery guidance."),
              ctas: [
                { label: useChinese ? "获取报价" : "Get Quote", href: "/contact", variant: "primary" as const },
                { label: useChinese ? "返回目录" : "Back to Catalog", href: "/products", variant: "secondary" as const },
              ],
              align: "start",
              paddingY: "lg",
              maxWidth: "xl",
            },
          },
          {
            type: "FeatureGrid",
            props: {
              id: `product-detail-specs-${index + 1}`,
              title: useChinese ? "核心参数" : "Key Specs",
              subtitle: useChinese ? "覆盖能力、配置、交付与服务等关键指标。" : "Coverage for capability, configuration, delivery, and support metrics.",
              variant: "3col",
              maxWidth: "xl",
              paddingY: "md",
              items:
                specItems.length > 0
                  ? specItems.map(([key, value]) => ({
                      title: key,
                      desc: value,
                      icon: "settings",
                    }))
                  : [
                      {
                        title: useChinese ? "参数待确认" : "Specs Pending",
                        desc:
                          specText ||
                          (useChinese
                            ? "请联系销售获取完整参数表。"
                            : "Contact sales for the complete specification sheet."),
                        icon: "file-text",
                      },
                    ],
            },
          },
          {
            type: "ContentStory",
            props: {
              id: `product-detail-story-${index + 1}`,
              title: useChinese ? "应用与工艺建议" : "Applications & Process Guidance",
              subtitle: item.category
                ? useChinese
                  ? `分类：${item.category}`
                  : `Category: ${item.category}`
                : undefined,
              body:
                item.summary ||
                (useChinese
                  ? "该产品支持按业务目标进行参数配置与实施建议。"
                  : "This offering supports configurable parameters and implementation guidance for business goals."),
              ctas: [
                { label: useChinese ? "预约咨询" : "Schedule Consultation", href: "/contact", variant: "link" as const },
              ],
              variant: "split",
              maxWidth: "xl",
              paddingY: "md",
            },
          },
          {
            type: "LeadCaptureCTA",
            props: {
              id: `product-detail-cta-${index + 1}`,
              title: useChinese ? "提交需求，获取定制配置" : "Share requirements for a tailored configuration",
              subtitle: useChinese ? "支持方案评估、分阶段实施与持续优化。" : "Supports solution assessment, phased implementation, and ongoing optimization.",
              cta: { label: useChinese ? "立即咨询" : "Talk to Sales", href: "/contact", variant: "primary" as const },
              maxWidth: "xl",
              paddingY: "md",
            },
          },
          createFooterBlock(item.name) as any,
        ],
        root: {
          props: {
            title: item.name,
            theme: {},
          },
        },
      },
    };
    expandedPages.push(detailPage);
    normalizedPathSet.add(path);
  });
  return expandedPages;
};

const applyStructuredBriefOverrides = (
  pages: GeneratedPage[],
  prompt: string,
  _profileIdHint?: string | null,
  structuredInput?: StructuredSiteInput | null
): GeneratedPage[] => {
  const parsed = parseStructuredBrief(prompt) || {};
  const derived = deriveStructuredBriefFromPrompt(prompt);
  const merged: StructuredBrief = {
    ...derived,
    ...parsed,
    nav: Array.isArray(parsed.nav) && parsed.nav.length ? parsed.nav : derived.nav,
    heroCtas: Array.isArray(parsed.heroCtas) && parsed.heroCtas.length ? parsed.heroCtas : derived.heroCtas,
    productItems:
      Array.isArray(parsed.productItems) && parsed.productItems.length ? parsed.productItems : derived.productItems,
    featureItems:
      Array.isArray(parsed.featureItems) && parsed.featureItems.length ? parsed.featureItems : derived.featureItems,
    caseItems: Array.isArray(parsed.caseItems) && parsed.caseItems.length ? parsed.caseItems : derived.caseItems,
    certifications:
      Array.isArray(parsed.certifications) && parsed.certifications.length
        ? parsed.certifications
        : derived.certifications,
  };
  const mergedWithInput = mergeStructuredInputIntoBrief(merged, structuredInput);
  const hasSignal = Boolean(
    mergedWithInput.brand ||
      (mergedWithInput.productItems && mergedWithInput.productItems.length) ||
      (mergedWithInput.featureItems && mergedWithInput.featureItems.length) ||
      (mergedWithInput.caseItems && mergedWithInput.caseItems.length) ||
      (mergedWithInput.aboutText && mergedWithInput.aboutText.trim())
  );
  if (!hasSignal) return pages;
  const genericOverridden = applyGenericStructuredBriefOverrides(pages, mergedWithInput, prompt);
  const enriched = applyStructuredBriefContentEnrichment(genericOverridden, mergedWithInput, prompt);
  return expandCatalogPagesFromBrief(enriched, mergedWithInput, prompt);
};

const hashSemanticImageSeed = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) >>> 0;
  }
  return hash % 997;
};

const semanticImageUrlPools: Record<string, string[]> = {
  hero: [
    "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
  ],
  products: [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
  ],
  cases: [
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  ],
  industry: [
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80",
  ],
  neutral: [
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80",
  ],
};

const isDynamicUnsplashUrl = (value: string) => /^https?:\/\/source\.unsplash\.com\//i.test(String(value || "").trim());

const isReplaceableExternalImageUrl = (value: string) => {
  const url = String(value || "").trim().toLowerCase();
  if (!url) return false;
  if (isDynamicUnsplashUrl(url)) return true;
  return /placeholder|dummyimage|placehold|loremflickr|picsum\.photos/.test(url);
};

const isCncLikePrompt = (value: string) =>
  /(cnc|machine tool|machine-tools|machining|metal cutting|milling|lathe|spindle|5-axis|加工中心|机床|数控|切削|精雕机|刀库机|3c)/i.test(
    value
  );

const semanticKeywordStopwords = new Set([
  "home",
  "about",
  "contact",
  "products",
  "solutions",
  "cases",
  "privacy",
  "terms",
  "page",
  "section",
  "website",
  "company",
  "企业",
  "官网",
  "页面",
  "网站",
]);

const extractSemanticPromptKeywords = (prompt: string, max = 6) =>
  Array.from(
    new Set(
      String(prompt || "")
        .toLowerCase()
        .replace(/https?:\/\/\S+/g, " ")
        .split(/[^a-z0-9\u4e00-\u9fff]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2)
        .filter((token) => !semanticKeywordStopwords.has(token))
        .slice(0, max)
    )
  );

const resolveSemanticImageBucket = (input: {
  prompt: string;
  pagePath: string;
  blockType?: string;
  token?: string;
  imageIntent?: string;
}) => {
  const pagePath = String(input.pagePath || "/").toLowerCase();
  const blockToken = `${String(input.blockType || "").toLowerCase()} ${String(input.token || "").toLowerCase()}`;
  const forced = String(input.imageIntent || "").trim().toLowerCase();
  if (forced === "none") return "none";
  if (forced === "cnc-case" || forced === "case") return "cases";
  if (forced === "cnc-industry" || forced === "industry") return "industry";
  if (forced === "cnc-product" || forced === "product") return "products";
  if (forced === "cnc-hero" || forced === "hero") return "hero";
  if (/\/cases\b/.test(pagePath) || /case|study|capture/.test(blockToken)) return "cases";
  if (/\/industries\b/.test(pagePath) || /industry|segment|application/.test(blockToken)) return "industry";
  if (/\/products\b|\/3c-machines\b/.test(pagePath) || /product|catalog|machine/.test(blockToken))
    return "products";
  if (pagePath === "/" || /hero|masthead|banner/.test(blockToken)) return "hero";
  return "neutral";
};

const buildSemanticUnsplashUrl = (input: {
  prompt: string;
  pagePath: string;
  blockType?: string;
  token?: string;
  index?: number;
  imageIntent?: string;
}) => {
  const bucket = resolveSemanticImageBucket(input);
  if (bucket === "none") return "";
  const pool = semanticImageUrlPools[bucket] ?? semanticImageUrlPools.neutral;
  const seed = hashSemanticImageSeed(
    `${input.pagePath}:${String(input.blockType || "")}:${String(input.token || "")}:${Number(input.index || 0)}`
  );
  return pool[seed % pool.length] || semanticImageUrlPools.neutral[0];
};

const looksLikeFinalImageField = (keyPath: string[]) => {
  const key = String(keyPath[keyPath.length - 1] || "").toLowerCase();
  const full = keyPath.join(".").toLowerCase();
  if (/(logo|avatar|icon)/.test(full)) return false;
  const parent = String(keyPath[keyPath.length - 2] || "").toLowerCase();
  if (
    (key === "src" || key === "url" || key === "mobilesrc") &&
    (/(image|img|cover|media|backgroundimage|backgroundmedia|photo|picture)/.test(parent) ||
      /(heroslides|slides|gallery|carousel)/.test(full))
  ) {
    return true;
  }
  return (
    /(image|img|media).*(src|url)$/.test(key) ||
    /(hero.*image|productimage|capture\d+image|backgroundmedia|\.image\.src$|\.cover\.src$|\.media\.src$|\.backgroundimage\.src$|\.backgroundmedia\.src$|heroslides\.\d+\.(src|mobilesrc)$)/.test(full)
  );
};

const buildFinalSemanticImageUrl = (
  currentValue: string,
  keyPath: string[],
  pagePath: string,
  input: { prompt: string; designNorthStar?: Record<string, unknown>; imageIntent?: string }
) => {
  const current = String(currentValue || "").trim();
  const isHttp = /^https?:\/\//i.test(current);
  if (!isHttp) return "";
  if (/^data:image\//i.test(current) || /\/generated-pen-assets\//i.test(current)) return "";
  if (!isReplaceableExternalImageUrl(current)) return "";
  const token = `${pagePath}:${keyPath.join(".")}:${current.slice(0, 48)}`;
  return buildSemanticUnsplashUrl({
    prompt: `${String(input.prompt || "")} ${String(input.designNorthStar?.industry || "")}`,
    pagePath,
    blockType: keyPath[keyPath.length - 2] || "",
    token,
    imageIntent: input.imageIntent,
  });
};

const pickSemanticGalleryImage = (input: {
  prompt: string;
  pagePath: string;
  blockType: string;
  token?: string;
  index?: number;
  imageIntent?: string;
}) => {
  return buildSemanticUnsplashUrl(input);
};

const hasAbsoluteMediaSrc = (value: unknown) => {
  if (!value || typeof value !== "object") return false;
  const src = typeof (value as Record<string, unknown>).src === "string" ? String((value as Record<string, unknown>).src).trim() : "";
  return /^https?:\/\//i.test(src);
};

const blockContainsAbsoluteMedia = (block: { type?: string; props?: Record<string, unknown> } | null | undefined) => {
  if (!block || typeof block !== "object") return false;
  const props = block.props && typeof block.props === "object" ? (block.props as Record<string, unknown>) : {};
  const hasViaKnownKeys = (() => {
    if (hasAbsoluteMediaSrc(props.media)) return true;
    if (hasAbsoluteMediaSrc(props.backgroundMedia)) return true;
    if (Array.isArray(props.heroSlides)) {
      return props.heroSlides.some((slide) => hasAbsoluteMediaSrc(slide));
    }
    if (Array.isArray(props.items)) {
      return props.items.some((item) => {
        if (!item || typeof item !== "object") return false;
        const rec = item as Record<string, unknown>;
        if (hasAbsoluteMediaSrc(rec.image)) return true;
        if (hasAbsoluteMediaSrc(rec.cover)) return true;
        if (hasAbsoluteMediaSrc(rec.avatar)) return true;
        const imageSrc = typeof rec.imageSrc === "string" ? rec.imageSrc : "";
        if (/^https?:\/\//i.test(imageSrc.trim())) return true;
        return false;
      });
    }
    return false;
  })();
  if (hasViaKnownKeys) return true;
  const visit = (entry: unknown): boolean => {
    if (typeof entry === "string") return /^https?:\/\//i.test(entry.trim());
    if (Array.isArray(entry)) return entry.some((item) => visit(item));
    if (!entry || typeof entry !== "object") return false;
    return Object.values(entry as Record<string, unknown>).some((child) => visit(child));
  };
  return visit(props);
};

const pageIntentForMedia = (pagePath: string) => {
  const normalized = String(pagePath || "/").toLowerCase();
  if (normalized === "/" || /home/.test(normalized)) return "cnc-hero";
  if (/\/cases\b/.test(normalized)) return "cnc-case";
  if (/\/products\b|\/3c-machines\b/.test(normalized)) return "cnc-product";
  if (/\/industries\b/.test(normalized)) return "cnc-industry";
  return "industrial";
};

const applyVisualMediaCoverage = (pages: GeneratedPage[], prompt: string): GeneratedPage[] =>
  pages.map((page) => {
    const pagePath = String(page.path || "/");
    const defaultIntent = pageIntentForMedia(pagePath);
    const content = Array.isArray(page?.data?.content) ? [...page.data.content] : [];
    if (!content.length) return page;

    const nextContent = content.map((entry, entryIndex) => {
      if (!entry || typeof entry !== "object") return entry;
      const item = entry as Record<string, unknown>;
      const type = String(item.type || "");
      const props =
        item.props && typeof item.props === "object" ? ({ ...(item.props as Record<string, unknown>) } as Record<string, unknown>) : {};
      const lowerType = type.toLowerCase();
      const blockToken = `${pagePath}:${lowerType}:${entryIndex}`;
      const mediaIntent =
        /case|study/.test(lowerType) ? "cnc-case" : /hero/.test(lowerType) ? "cnc-hero" : defaultIntent;
      const pickImage = (token: string, index = 0) =>
        pickSemanticGalleryImage({
          prompt,
          pagePath,
          blockType: lowerType,
          token,
          index,
          imageIntent: mediaIntent,
        });

      if (/herosplit/.test(lowerType)) {
        const hasMedia = hasAbsoluteMediaSrc(props.media);
        const hasBackgroundMedia = hasAbsoluteMediaSrc(props.backgroundMedia);
        const hasSlides =
          Array.isArray(props.heroSlides) &&
          props.heroSlides.some((slide) => {
            if (!slide || typeof slide !== "object") return false;
            const src = typeof (slide as Record<string, unknown>).src === "string" ? String((slide as Record<string, unknown>).src).trim() : "";
            return /^https?:\/\//i.test(src);
          });
        if (!hasMedia && !hasBackgroundMedia && !hasSlides) {
          const src = pickImage("hero", 0);
          if (src) {
            props.media = {
              kind: "image",
              src,
              alt: typeof props.title === "string" && props.title.trim() ? props.title : "Hero visual",
            };
          }
        }
        if (typeof props.mediaPosition !== "string" || !props.mediaPosition.trim()) {
          props.mediaPosition = /\/products\b|\/cases\b/.test(pagePath) ? "left" : "right";
        }
      } else if (/cardsgrid|productcatalog/.test(lowerType)) {
        const items = Array.isArray(props.items) ? [...(props.items as unknown[])] : [];
        if (items.length) {
          const withImages = items.map((rawItem, index) => {
            if (!rawItem || typeof rawItem !== "object") return rawItem;
            const card = { ...(rawItem as Record<string, unknown>) } as Record<string, unknown>;
            const hasImageObject = hasAbsoluteMediaSrc(card.image);
            const imageSrc = typeof card.imageSrc === "string" ? String(card.imageSrc).trim() : "";
            const hasImageSrc = /^https?:\/\//i.test(imageSrc);
            if (!hasImageObject && !hasImageSrc) {
              const title = typeof card.title === "string" ? card.title : `item-${index + 1}`;
              const src = pickImage(title, index);
              if (src) {
                card.image = { src, alt: title };
              }
            }
            return card;
          });
          props.items = withImages;
          const anyImage = withImages.some((rawItem) => {
            if (!rawItem || typeof rawItem !== "object") return false;
            const card = rawItem as Record<string, unknown>;
            if (hasAbsoluteMediaSrc(card.image)) return true;
            const imageSrc = typeof card.imageSrc === "string" ? String(card.imageSrc).trim() : "";
            return /^https?:\/\//i.test(imageSrc);
          });
          if (anyImage) {
            if (typeof props.variant !== "string" || props.variant === "product") props.variant = "imageText";
            if (typeof props.imagePosition !== "string" || !props.imagePosition.trim()) {
              props.imagePosition = /\/products\b/.test(pagePath) ? "left" : "top";
            }
            if (pagePath === "/" && typeof props.featureFirst !== "boolean") props.featureFirst = true;
          }
        }
      } else if (/casestudies/.test(lowerType)) {
        const items = Array.isArray(props.items) ? [...(props.items as unknown[])] : [];
        if (items.length) {
          props.items = items.map((rawItem, index) => {
            if (!rawItem || typeof rawItem !== "object") return rawItem;
            const itemRecord = { ...(rawItem as Record<string, unknown>) } as Record<string, unknown>;
            if (!hasAbsoluteMediaSrc(itemRecord.cover)) {
              const title = typeof itemRecord.title === "string" ? itemRecord.title : `case-${index + 1}`;
              const src = pickImage(title, index);
              if (src) {
                itemRecord.cover = { src, alt: title };
              }
            }
            return itemRecord;
          });
        }
      } else if (/featurewithmedia/.test(lowerType)) {
        const hasMediaObject = hasAbsoluteMediaSrc(props.media);
        const mediaSrc = typeof props.mediaSrc === "string" ? String(props.mediaSrc).trim() : "";
        const hasMediaSrc = /^https?:\/\//i.test(mediaSrc);
        if (!hasMediaObject && !hasMediaSrc) {
          const src = pickImage("feature", 0);
          if (src) {
            props.media = {
              kind: "image",
              src,
              alt: typeof props.title === "string" && props.title.trim() ? props.title : "Feature visual",
            };
          }
        }
      }
      if (pagePath === "/" && /hero|masthead|banner/.test(lowerType)) {
        const background = typeof props.background === "string" ? props.background.toLowerCase() : "";
        if (!background || background === "none") {
          props.background = "gradient";
        }
      }
      return {
        ...item,
        props,
      };
    });

    const pageType = inferEnterprisePageTypeFromPath(normalizePromptPagePath(pagePath));
    const minVisualByPageType: Record<string, number> = {
      home: 4,
      products: 4,
      cases: 3,
      solutions: 3,
      about: 2,
      contact: 2,
      support: 2,
      pricing: 3,
      legal: 1,
      blog: 2,
      generic: 2,
    };
    const minVisuals = minVisualByPageType[pageType] ?? 2;
    let bodyVisualCount = nextContent
      .filter((item) => !/(navbar|navigation|footer|creationfooterfallback)/i.test(String((item as any)?.type || "")))
      .filter((item) => blockContainsAbsoluteMedia(item as any)).length;
    if (bodyVisualCount < minVisuals) {
      const candidateIndices = nextContent
        .map((item, index) => ({ item, index }))
        .filter(
          ({ item }) =>
            !/(navbar|navigation|footer|creationfooterfallback)/i.test(String((item as any)?.type || "")) &&
            !blockContainsAbsoluteMedia(item as any)
        )
        .map(({ index }) => index);
      for (const [slot, targetIndex] of candidateIndices.entries()) {
        if (bodyVisualCount >= minVisuals) break;
        const target = nextContent[targetIndex] as Record<string, unknown>;
        const targetProps =
          target?.props && typeof target.props === "object"
            ? ({ ...(target.props as Record<string, unknown>) } as Record<string, unknown>)
            : {};
        const src = pickSemanticGalleryImage({
          prompt,
          pagePath,
          blockType: String(target?.type || "").toLowerCase(),
          token: `page-visual-quota-${slot + 1}`,
          index: slot,
          imageIntent: defaultIntent,
        });
        if (!src) continue;
        if (!hasAbsoluteMediaSrc(targetProps.media as any)) {
          targetProps.media = {
            kind: "image",
            src,
            alt:
              typeof targetProps.title === "string" && targetProps.title.trim()
                ? targetProps.title.trim()
                : "Section visual",
          };
        }
        targetProps.background = "image";
        targetProps.backgroundMedia = { kind: "image", src };
        if (typeof targetProps.backgroundOverlay !== "string" || !targetProps.backgroundOverlay.trim()) {
          targetProps.backgroundOverlay = "linear-gradient(180deg, rgba(3,8,12,0.2) 0%, rgba(3,8,12,0.46) 100%)";
        }
        if (typeof targetProps.backgroundOverlayOpacity !== "number") targetProps.backgroundOverlayOpacity = 0.34;
        nextContent[targetIndex] = {
          ...target,
          props: targetProps,
        };
        bodyVisualCount += 1;
      }
    }

    return {
      ...page,
      data: {
        ...(page.data as Record<string, unknown>),
        root: (page.data as any)?.root,
        content: nextContent as Array<{ type: string; props: Record<string, unknown> }>,
      },
    };
  });

const sanitizeGeneratedProps = (
  value: unknown,
  input: {
    prompt: string;
    designNorthStar?: Record<string, unknown>;
    pagePath?: string;
    imageIntent?: string;
    profileId?: unknown;
  }
): unknown => {
  const outputLanguage = resolveOutputLanguage(input.prompt);
  const pageType = inferEnterprisePageTypeFromPath(String(input.pagePath || "/"));
  const templateCopyPatterns = [
    /\blorem ipsum\b/i,
    /\byour brand\b/i,
    /\bcontact us today\b/i,
    /\bthis section\b/i,
    /\bslide\s*\d+\b/i,
    /\bhero\s*slide\b/i,
    /\blearn\s+more\b/i,
    /\bexplore\b/i,
    /\boverview\b/i,
    /\bdetails?\b/i,
    /\bwe\s+are\b/i,
    /\bhtml\b/i,
    /\bplaceholder(?:\s+(?:text|copy))?\b/i,
    /\{\{[^}]+\}\}/,
    /\[\s*(?:title|subtitle|description|content|cta)\s*\]/i,
  ];
  const textFallbacks =
    outputLanguage === "zh-CN"
      ? {
          home: "聚焦核心产品与交付能力，支持按需定制与快速落地。",
          products: "提供多型号设备与参数配置，可按场景扩展工艺能力。",
          solutions: "围绕真实产线需求提供工艺路线、设备组合与交付节奏建议。",
          cases: "基于客户场景沉淀可复用经验，覆盖打样、量产与质量稳定性。",
          about: "持续投入研发与制造体系建设，提供稳定交付与长期服务支持。",
          contact: "欢迎提交需求信息，我们将安排工程团队尽快联系。",
          generic: "基于业务目标提供清晰的信息结构与可执行内容。",
        }
      : {
          home: "Focused on core offerings and reliable delivery, with configurable implementation paths.",
          products: "Multiple equipment models and spec options are available for different production scenarios.",
          solutions: "Process routes, machine combinations, and delivery plans are tailored to real factory needs.",
          cases: "Case insights cover prototyping, mass production, and quality stability outcomes.",
          about: "Continuous investment in R&D and manufacturing systems ensures dependable delivery.",
          contact: "Share your requirements and our engineering team will follow up shortly.",
          generic: "Content is organized for business clarity and execution-ready communication.",
        };
  const titleFallbacks =
    outputLanguage === "zh-CN"
      ? {
          home: "核心能力与产品价值",
          products: "产品与参数总览",
          solutions: "行业解决方案",
          cases: "应用案例",
          about: "公司概况",
          contact: "联系我们",
          generic: "业务信息",
        }
      : {
          home: "Core Capability & Product Value",
          products: "Product & Specification Overview",
          solutions: "Industry Solutions",
          cases: "Application Cases",
          about: "Company Overview",
          contact: "Contact",
          generic: "Business Information",
        };
  const ctaFallback = outputLanguage === "zh-CN" ? "立即咨询" : "Contact";
  const isLikelyTemplateCopy = (text: string, keyPath: string[]) => {
    const compact = String(text || "").replace(/\s+/g, " ").trim();
    if (!compact) return false;
    if (templateCopyPatterns.some((pattern) => pattern.test(compact))) return true;
    const cjkCount = (compact.match(/[\u3400-\u9fff]/g) || []).length;
    const latinCount = (compact.match(/[A-Za-z]/g) || []).length;
    const leaf = String(keyPath[keyPath.length - 1] || "").toLowerCase();
    const textLikeLeaf = /(title|subtitle|headline|desc|description|summary|body|content|copy|text|label|cta|button|alt|caption|name|tag|eyebrow)/.test(
      leaf
    );
    const latinTokens = Array.from(new Set(compact.match(/[A-Za-z][A-Za-z0-9_-]{1,}/g) || []));
    const safeTechnicalToken = /^(?:ISO|CE|SGS|CNC|PCB|ATC|ROI|FAQ|API|SKU|OEM|ODM|SEA|LC|S)$/i;
    const meaningfulLatinTokenCount = latinTokens.filter((token) => !safeTechnicalToken.test(token)).length;
    if (
      outputLanguage === "zh-CN" &&
      textLikeLeaf &&
      !/^[A-Z0-9 .\-_/]{2,30}$/.test(compact) &&
      (cjkCount <= 1 && latinCount >= 8)
    ) {
      return true;
    }
    if (
      outputLanguage === "zh-CN" &&
      textLikeLeaf &&
      !/^[A-Z0-9 .\-_/]{2,30}$/.test(compact) &&
      latinCount >= 22 &&
      cjkCount / Math.max(1, latinCount) < 0.15
    ) {
      return true;
    }
    if (outputLanguage === "zh-CN" && textLikeLeaf && cjkCount === 0 && meaningfulLatinTokenCount >= 2) {
      return true;
    }
    return false;
  };
  const rewriteTemplateCopy = (text: string, keyPath: string[]) => {
    const leaf = String(keyPath[keyPath.length - 1] || "").toLowerCase();
    if (/(cta|button|label)/.test(leaf)) return ctaFallback;
    if (/(title|headline)/.test(leaf)) return titleFallbacks[pageType] || titleFallbacks.generic;
    if (/(subtitle|desc|description|body|content|copy|text)/.test(leaf))
      return textFallbacks[pageType] || textFallbacks.generic;
    return textFallbacks[pageType] || textFallbacks.generic;
  };
  const brandName = extractBrandNameFromPromptLite(input.prompt);
  const templateFamily = inferTemplateFamily(input.profileId);
  const structuredBrief = parseStructuredBrief(input.prompt);
  const familyBrandTokens = getTemplateFamilyBrandTerms(templateFamily)
    .flatMap((term) => [term, ...term.split(/[^A-Za-z0-9\u4e00-\u9fff]+/)])
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);
  const promptDerivedTokens =
    structuredBrief && templateFamily ? [] : extractSourceBrandTokens(input.prompt);
  const sourceTokens = Array.from(new Set([...promptDerivedTokens, ...familyBrandTokens]));
  const replacementBrand = brandName || "Brand";
  const replacements = buildFinalSemanticReplacements(input.prompt, input.designNorthStar);
  const walk = (entry: unknown, keyPath: string[]): unknown => {
    if (typeof entry === "string") {
      const key = String(keyPath[keyPath.length - 1] || "");
      if (looksLikeFinalImageField(keyPath)) {
        const rewrittenImage = buildFinalSemanticImageUrl(entry, keyPath, String(input.pagePath || "/"), input);
        if (rewrittenImage) return rewrittenImage;
      }
      if (shouldSkipGeneratedPropSanitization(key)) {
        if (/href|url|path/i.test(key)) {
          if (/^mailto:(sales|info|contact)@example\.com$/i.test(entry.trim())) return "/contact";
        }
        return entry;
      }
      let next = entry;
      sourceTokens.forEach((token) => {
        if (!token) return;
        const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const sourcePattern =
          /[\s()&.'’/-]/.test(token) || /\d/.test(token)
            ? new RegExp(escaped, "gi")
            : new RegExp(`\\b${escaped}\\b`, "gi");
        next = next.replace(sourcePattern, replacementBrand);
      });
      replacements.forEach((item) => {
        next = next.replace(item.pattern, item.value);
      });
      if (isLikelyTemplateCopy(next, keyPath)) {
        next = rewriteTemplateCopy(next, keyPath);
      }
      return normalizeSanitizedText(next);
    }
    if (Array.isArray(entry)) return entry.map((item, index) => walk(item, [...keyPath, String(index)]));
    if (!entry || typeof entry !== "object") return entry;
    const record = entry as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    Object.entries(record).forEach(([key, child]) => {
      next[key] = walk(child, [...keyPath, key]);
    });
    return next;
  };
  return walk(value, []);
};

type GeneratedPage = {
  path: string;
  name: string;
  data: {
    content: Array<{ type: string; props: Record<string, unknown> }>;
    root: { props: { title: string; theme: Record<string, unknown> } & Record<string, unknown> };
  };
};

const ensureUniqueIdsForPageContent = (
  content: Array<{ type?: string; props?: Record<string, unknown> }>,
  pagePath: string
) => {
  const usedIds = new Map<string, number>();
  const pageToken = toSlug(pagePath || "page") || "page";
  return content.map((item, itemIndex) => {
    if (!item || typeof item !== "object") return item;
    const props =
      item.props && typeof item.props === "object"
        ? ({ ...(item.props as Record<string, unknown>) } as Record<string, unknown>)
        : {};
    const rawId = typeof props.id === "string" ? props.id.trim() : "";
    const anchorToken = typeof props.anchor === "string" ? props.anchor.trim() : "";
    const typeToken = toSlug(String(item.type || "")) || "section";
    const fallbackId = `${pageToken}-${toSlug(anchorToken) || typeToken}-${itemIndex + 1}`;
    const baseId = rawId || fallbackId;
    const seen = (usedIds.get(baseId) ?? 0) + 1;
    usedIds.set(baseId, seen);
    const uniqueId = seen === 1 ? baseId : `${baseId}-${seen}`;
    props.id = uniqueId;
    return {
      ...item,
      props,
    };
  });
};

const sanitizeFinalPagesOutput = (
  pages: GeneratedPage[],
  input: { prompt: string; designNorthStar?: Record<string, unknown>; profileId?: unknown }
): GeneratedPage[] =>
  pages.map((page) => {
    const sanitizedData = sanitizeGeneratedProps(page.data, { ...input, pagePath: page.path }) as GeneratedPage["data"];
    const safeContent = Array.isArray(sanitizedData?.content) ? sanitizedData.content : [];
    return {
      ...page,
      data: {
        ...sanitizedData,
        content: ensureUniqueIdsForPageContent(safeContent as Array<{ type?: string; props?: Record<string, unknown> }>, page.path) as GeneratedPage["data"]["content"],
      },
    };
  });

const coerceInternalHrefToAvailablePath = (href: string, availablePaths: Set<string>) => {
  const raw = String(href || "").trim();
  if (!raw) return raw;
  if (/^(mailto:|tel:|#|https?:\/\/)/i.test(raw)) return raw;
  const pathname = normalizePromptPagePath(raw.split("?")[0]?.split("#")[0] || raw);
  const canonical = normalizePromptPagePath(resolveCanonicalRoute(pathname, availablePaths));
  if (availablePaths.has(canonical)) return canonical;
  const segments = canonical.split("/").filter(Boolean);
  if (segments.length > 1) {
    const topLevel = normalizePromptPagePath(resolveCanonicalRoute(`/${segments[0]}`, availablePaths));
    if (availablePaths.has(topLevel)) return topLevel;
  }
  if (/[0-9]/.test(pathname) && availablePaths.has("/products")) return "/products";
  if (/(case|study|project|result|proof)/i.test(pathname) && availablePaths.has("/cases")) return "/cases";
  if (/(service|solution|workflow|process|capability)/i.test(pathname) && availablePaths.has("/solutions")) {
    return "/solutions";
  }
  return availablePaths.has("/") ? "/" : canonical;
};

const coerceContentInternalHrefsToAvailablePaths = (
  content: Array<{ type?: string; props?: Record<string, unknown> }>,
  availablePaths: Set<string>
) => {
  const rewrite = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map((item) => rewrite(item));
    if (!value || typeof value !== "object") return value;
    const record = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    Object.entries(record).forEach(([key, child]) => {
      if (typeof child === "string" && /href$/i.test(key)) {
        next[key] = coerceInternalHrefToAvailablePath(child, availablePaths);
        return;
      }
      next[key] = rewrite(child);
    });
    return next;
  };
  return content.map((item) => {
    if (!item || typeof item !== "object") return item;
    const props =
      item.props && typeof item.props === "object"
        ? (rewrite(item.props) as Record<string, unknown>)
        : (item.props as Record<string, unknown> | undefined);
    return {
      ...item,
      ...(props ? { props } : {}),
    };
  });
};

const contextualFallbackHref = (
  keyPath: string[],
  currentValue: string,
  graph: SiteLinkGraph,
  pagePath: string
) => {
  const normalizedPagePath = normalizePromptPagePath(pagePath);
  const key = keyPath.join(".").toLowerCase();
  const leafKey = String(keyPath[keyPath.length - 1] || "").toLowerCase();
  const raw = currentValue.trim();
  if (!raw) return graph.homeHref;
  if (/^mailto:(sales|info|contact)@example\.com$/i.test(raw)) return "/contact";
  const isPlaceholder = raw === "/" || raw === "#" || raw === "#top";
  if (!isPlaceholder) return raw;
  const isNavbarHomeLink = /(navl?1href|links\.(0|home)\.href|homehref)/.test(key);
  const isFooterHomeLink = /(policyhome\d*href|columns\.\d+\.links\.(0|home)\.href)/.test(key);
  if (isNavbarHomeLink || isFooterHomeLink) return graph.homeHref;
  const prefersProducts =
    /(product|catalog|machine|equipment|sku|shop|prod(btn|uct)?|learnbtn|discoverbtn|explorebtn)/.test(key) ||
    (normalizedPagePath === "/products" && /(href|cta|button|btn|card\d+href)/.test(key));
  const prefersSolutions =
    /(solution|service|capability|workflow|process|automation)/.test(key) ||
    (normalizedPagePath === "/solutions" && /(href|cta|button|btn|card\d+href)/.test(key));
  const prefersIndustries =
    /(industry|application|market|usecard|sector)/.test(key) ||
    (normalizedPagePath === "/industries" && /(href|cta|button|btn|card\d+href)/.test(key));
  const prefersCases =
    /(case|study|customer|project|proof|result|card\d+href)/.test(key) ||
    (normalizedPagePath === "/cases" && /(href|cta|button|btn)/.test(key));
  const prefersAbout =
    /(about|company|team|story|mission|vision|history)/.test(key) ||
    (normalizedPagePath === "/about" && /(href|cta|button|btn)/.test(key));
  const prefersContact =
    /(contact|quote|sales|consult|orderbtn|request|inquire|book|demo)/.test(key) ||
    (normalizedPagePath === "/contact" && /(href|cta|button|btn)/.test(key));
  if (prefersProducts && graph.validInternalHrefs.has("/products")) {
    return "/products";
  }
  if (prefersSolutions && graph.validInternalHrefs.has("/solutions")) {
    return "/solutions";
  }
  if (prefersIndustries && graph.validInternalHrefs.has("/industries")) {
    return "/industries";
  }
  if (prefersCases && graph.validInternalHrefs.has("/cases")) {
    return "/cases";
  }
  if (prefersAbout && graph.validInternalHrefs.has("/about")) {
    return "/about";
  }
  if (prefersContact && graph.validInternalHrefs.has("/contact")) {
    return "/contact";
  }
  if (leafKey === "href" && normalizedPagePath !== "/" && graph.validInternalHrefs.has(normalizedPagePath)) {
    return normalizedPagePath;
  }
  if (normalizedPagePath === "/contact" && graph.validInternalHrefs.has("/contact")) {
    return "/contact";
  }
  return graph.homeHref;
};

const sanitizeSemanticProps = (
  value: unknown,
  graph: SiteLinkGraph,
  pagePath: string,
  keyPath: string[] = []
): unknown => {
  if (Array.isArray(value)) {
    return value.map((item, index) => sanitizeSemanticProps(item, graph, pagePath, [...keyPath, String(index)]));
  }
  if (typeof value === "string") {
    const key = String(keyPath[keyPath.length - 1] || "");
    if (/href|url|path/i.test(key)) {
      return contextualFallbackHref(keyPath, value, graph, pagePath);
    }
    return normalizeSanitizedText(value);
  }
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  Object.entries(record).forEach(([key, child]) => {
    next[key] = sanitizeSemanticProps(child, graph, pagePath, [...keyPath, key]);
  });
  return next;
};

const isContactLikeBlock = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  const type = typeof item?.type === "string" ? item.type.toLowerCase() : "";
  const anchor = typeof item?.props?.anchor === "string" ? item.props.anchor.toLowerCase() : "";
  const id = typeof item?.props?.id === "string" ? item.props.id.toLowerCase() : "";
  const variant = typeof item?.props?.variant === "string" ? item.props.variant.toLowerCase() : "";
  const productLike =
    /(product|catalog|collection|sku|store|shop|module|capability)/.test(type) ||
    /(product|catalog|collection|sku|store|shop|module|capability)/.test(anchor) ||
    /(product|catalog|collection|sku|store|shop|module|capability)/.test(id);
  if (type === errorComponentName.toLowerCase()) return false;
  if (productLike) return false;
  if (type === fallbackComponentName.toLowerCase()) {
    return variant === "contact" || anchor.includes("contact") || id.includes("contact");
  }
  return type.includes("contact") || type.includes("lead") || anchor.includes("contact") || id.includes("contact");
};

const CONTACT_TEXT_GRADIENT_CLASS_PATTERN = /\b(text-gradient|bg-clip-text|text-transparent)\b/gi;

const stripContactGradientTextClasses = (value: unknown) => {
  if (typeof value !== "string") return value;
  return value
    .replace(CONTACT_TEXT_GRADIENT_CLASS_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const enforceContactTextStyleProps = (props: Record<string, unknown>) => {
  const next: Record<string, unknown> = { ...props, emphasis: "normal", forbidGradientText: true };
  ["titleClassName", "headingClassName", "eyebrowClassName", "subtitleClassName", "labelClassName"].forEach(
    (key) => {
      if (typeof next[key] === "string") {
        next[key] = stripContactGradientTextClasses(next[key]);
      }
    }
  );
  return next;
};

const mergeThemeDrivenBlockProps = (
  baseProps: Record<string, unknown>,
  existingProps: Record<string, unknown>,
  variant: "cta" | "contact"
) => {
  const readString = (...keys: string[]) => {
    for (const key of keys) {
      const value = existingProps[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  };
  const next: Record<string, unknown> = { ...baseProps, variant };
  const title = readString(
    "title",
    "headline",
    "heading",
    "eyebrow",
    "ctahtext",
    "ctaheadtext",
    "ctaeyebrowtext"
  );
  const subtitle = readString(
    "subtitle",
    "subheadline",
    "description",
    "body",
    "content",
    "desc",
    "ctabodytext",
    "copytext"
  );
  const ctaLabel = readString(
    "ctaLabel",
    "buttonLabel",
    "primaryCtaLabel",
    "ctabttext",
    "ctatxtprimarytext",
    "ctatexttext"
  );
  const ctaHref = readString(
    "ctaHref",
    "buttonHref",
    "primaryCtaHref",
    "ctabhref",
    "ctabtnprimaryhref",
    "ctahref"
  );
  const secondaryCtaLabel = readString(
    "secondaryCtaLabel",
    "secondaryButtonLabel",
    "ctatxtsecondarytext"
  );
  const secondaryCtaHref = readString(
    "secondaryCtaHref",
    "secondaryButtonHref",
    "ctabtnsecondaryhref"
  );
  const preserveTitle = (() => {
    if (!title) return false;
    if (
      /latest stories|reviews?|field notes|next generation|discovery|observers?|clear night|smarter machining environments/i.test(
        title
      )
    ) {
      return false;
    }
    if (variant === "contact" && !/talk|contact|consult|quote|demo|sales|team/i.test(title)) {
      return false;
    }
    return true;
  })();
  const preserveSubtitle = (() => {
    if (!subtitle) return false;
    if (/all rights reserved|copyright|©|planetarium|deep-shop floor|city production environments/i.test(subtitle)) {
      return false;
    }
    return true;
  })();
  if (preserveTitle) next.title = title;
  if (preserveSubtitle) next.subtitle = subtitle;
  if (ctaLabel) next.ctaLabel = ctaLabel;
  if (ctaHref) next.ctaHref = ctaHref;
  if (secondaryCtaLabel) next.secondaryCtaLabel = secondaryCtaLabel;
  if (secondaryCtaHref) next.secondaryCtaHref = secondaryCtaHref;
  if (Array.isArray(existingProps.footerLinks)) next.footerLinks = existingProps.footerLinks;
  if (typeof existingProps.legal === "string" && existingProps.legal.trim()) next.legal = existingProps.legal;
  if (typeof existingProps.whatsapp === "string" && existingProps.whatsapp.trim()) next.whatsapp = existingProps.whatsapp;
  if (variant === "contact") return enforceContactTextStyleProps(next);
  return next;
};

const normalizeHexColor = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return null;
  if (raw.length === 4) {
    return `#${raw
      .slice(1)
      .split("")
      .map((char) => `${char}${char}`)
      .join("")
      .toUpperCase()}`;
  }
  return raw.toUpperCase();
};

const hexToRgb = (value: string): [number, number, number] | null => {
  const normalized = normalizeHexColor(value);
  if (!normalized) return null;
  const hex = normalized.slice(1);
  const parsed = Number.parseInt(hex, 16);
  if (!Number.isFinite(parsed)) return null;
  return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
};

const mixHexColors = (base: string, target: string, weight = 0.5): string => {
  const baseRgb = hexToRgb(base);
  const targetRgb = hexToRgb(target);
  if (!baseRgb || !targetRgb) return normalizeHexColor(base) || normalizeHexColor(target) || "#F4EEE4";
  const clamped = Math.max(0, Math.min(1, Number.isFinite(weight) ? weight : 0.5));
  const mixed = baseRgb.map((channel, index) =>
    Math.round(channel + (targetRgb[index] - channel) * clamped)
  ) as [number, number, number];
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
};

const rgbaFromHex = (value: string, alpha: number): string => {
  const rgb = hexToRgb(value) || [0, 0, 0];
  const clamped = Math.max(0, Math.min(1, Number.isFinite(alpha) ? alpha : 1));
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${clamped})`;
};

const readThemePaletteColors = (theme: Record<string, unknown>, prompt = "") => {
  if (/red\s*\+\s*beige|red and beige|红色.*米黄|米黄.*红色/i.test(prompt)) {
    return {
      bg: "#F4EEE4",
      neutral: "#DDD4C8",
      accent: "#D8C1A0",
      primary: "#A32024",
      text: "#1E1815",
      textSecondary: "#6C6157",
    };
  }
  const palette =
    theme?.palette && typeof theme.palette === "object"
      ? (theme.palette as Record<string, unknown>)
      : {};
  return {
    bg: normalizeHexColor(palette.bg) || "#F7F1E8",
    neutral: normalizeHexColor(palette.neutral) || "#E5DDD0",
    accent: normalizeHexColor(palette.accent) || "#D8C1A0",
    primary: normalizeHexColor(palette.primary) || normalizeHexColor(theme.primaryColor) || "#A32024",
    text: normalizeHexColor(palette.text) || "#1E1815",
    textSecondary: normalizeHexColor(palette.textSecondary) || "#6C6157",
  };
};

const buildBrandSectionGradient = (
  blockType: string,
  itemIndex: number,
  palette: ReturnType<typeof readThemePaletteColors>
): string => {
  const normalizedType = String(blockType || "").toLowerCase();
  if (/testimonials|socialproof/.test(normalizedType)) {
    return `linear-gradient(180deg, ${mixHexColors(palette.bg, palette.accent, 0.16)} 0%, ${mixHexColors(
      palette.accent,
      palette.neutral,
      0.5
    )} 100%)`;
  }
  if (/cards|catalog|product/.test(normalizedType)) {
    return `linear-gradient(180deg, ${mixHexColors(palette.bg, palette.neutral, 0.2)} 0%, ${mixHexColors(
      palette.neutral,
      palette.accent,
      0.42
    )} 100%)`;
  }
  if (/cta|contact|leadcapture/.test(normalizedType)) {
    return `linear-gradient(180deg, ${mixHexColors(palette.primary, palette.text, 0.18)} 0%, ${mixHexColors(
      palette.primary,
      palette.accent,
      0.22
    )} 100%)`;
  }
  const cycle = itemIndex % 3;
  if (cycle === 1) {
    return `linear-gradient(180deg, ${mixHexColors(palette.bg, palette.accent, 0.18)} 0%, ${mixHexColors(
      palette.accent,
      palette.neutral,
      0.4
    )} 100%)`;
  }
  if (cycle === 2) {
    return `linear-gradient(180deg, ${mixHexColors(palette.bg, palette.neutral, 0.24)} 0%, ${mixHexColors(
      palette.neutral,
      palette.accent,
      0.36
    )} 100%)`;
  }
  return `linear-gradient(180deg, ${mixHexColors(palette.bg, palette.neutral, 0.12)} 0%, ${mixHexColors(
    palette.bg,
    palette.accent,
    0.32
  )} 100%)`;
};

const harmonizeBlockThemeProps = (
  blockType: string,
  existingProps: Record<string, unknown>,
  theme: Record<string, unknown>,
  itemIndex: number,
  prompt = ""
): Record<string, unknown> => {
  const next = { ...existingProps };
  const palette = readThemePaletteColors(theme, prompt);
  const normalizedType = String(blockType || "").toLowerCase();
  const background = String(next.background || "").trim().toLowerCase();

  if (background === "gradient") {
    next.backgroundGradient = buildBrandSectionGradient(blockType, itemIndex, palette);
    if (!/cta|contact|leadcapture/.test(normalizedType) && typeof next.backgroundOverlay === "string") {
      next.backgroundOverlay = "";
    }
  }

  if (/herosplit/.test(normalizedType) && background === "image") {
    next.surfaceTone = "dark";
    next.backgroundOverlay = rgbaFromHex(mixHexColors(palette.text, palette.primary, 0.28), 0.72);
    next.backgroundOverlayOpacity = 0.72;
    if (typeof next.textPanel === "boolean" && next.textPanel) {
      next.textPanelBackground = rgbaFromHex(palette.text, 0.34);
      next.textPanelBorderColor = rgbaFromHex(palette.accent, 0.24);
    }
  }

  return next;
};

const createFallbackBlock = (
  context: SectionContext,
  prompt: string,
  designNorthStar?: Record<string, unknown>,
  theme?: Record<string, unknown>
): { type: string; props: Record<string, unknown>; _key: string } => ({
  type: fallbackComponentName,
  props: buildFallbackSectionProps(context, prompt, designNorthStar, theme),
  _key: `${context.pagePath}:${context.section.id}:${context.sectionIndex}:fallback`,
});

const shouldTemplateFirstForSection = (
  context: SectionContext,
  options?: { preferLlmForDesignFidelity?: boolean; strategy?: SectionGenerationStrategy }
) => {
  const strategy = options?.strategy ?? sectionGenerationStrategy;
  const sectionToken = `${context.section.type ?? ""} ${context.section.id ?? ""}`.toLowerCase();
  if (/(contact|cta|footer[-_\s]?cta|lead[-_\s]?capture|lead|inquiry|form)/.test(sectionToken)) {
    return true;
  }
  if (strategy === "template_first") return true;

  const variantToken = normalizeFallbackVariant(buildFallbackSectionVariant(context));
  const explicitTokenMatch = sectionMatchesTokenList(context, templateFirstSectionTokens);
  const llmTokenMatch = sectionMatchesTokenList(context, llmFirstSectionTokens);
  const variantMatch = templateFirstVariantTokens.has(variantToken);
  const hintTemplatePreferred =
    context.section.propsHints &&
    typeof context.section.propsHints === "object" &&
    parseEnvBoolean(String((context.section.propsHints as Record<string, unknown>).templatePreferred ?? ""), false);
  const hintLlmPreferred =
    context.section.propsHints &&
    typeof context.section.propsHints === "object" &&
    parseEnvBoolean(String((context.section.propsHints as Record<string, unknown>).llmPreferred ?? ""), false);

  if (hintLlmPreferred || llmTokenMatch) return false;
  if (hintTemplatePreferred) return true;
  if (options?.preferLlmForDesignFidelity && llmTokenMatch) {
    return false;
  }
  if (strategy === "llm_first") return Boolean(hintTemplatePreferred);
  return Boolean(explicitTokenMatch || variantMatch);
};

const shouldTemplateRecoverFromFailure = (
  context: SectionContext,
  failureType: FailureType,
  options?: { preferLlmForDesignFidelity?: boolean; strategy?: SectionGenerationStrategy }
) => {
  const strategy = options?.strategy ?? sectionGenerationStrategy;
  if (strategy === "llm_first") return false;
  if (!templateRecoveryFailureTypes.has(String(failureType))) return false;
  if (strategy === "template_first") return true;
  return shouldTemplateFirstForSection(context, options);
};

const createTemplateSectionResult = (
  context: SectionContext,
  prompt: string,
  designNorthStar?: Record<string, unknown>,
  theme?: Record<string, unknown>
): BuilderSectionResult => {
  const sectionToken = `${context.section.type ?? ""} ${context.section.id ?? ""}`.toLowerCase();
  const themeDrivenSection = /(contact|cta|footer[-_\s]?cta|lead[-_\s]?capture|lead|inquiry|form)/.test(sectionToken);
  if (themeDrivenSection) {
    const fallbackBlock = buildDeterministicFallbackBlock(context, prompt, designNorthStar, theme, {
      skipRegistry: true,
    });
    return {
      status: "ok",
      component: { name: fallbackComponentName, code: fallbackComponentCode },
      block: { type: fallbackBlock.type, props: fallbackBlock.props },
    };
  }
  const idBase = `${toSlug(context.section.type || "section") || "section"}-${context.sectionIndex + 1}`;
  const anchor = context.section.id;
  const propsHints =
    context.section.propsHints && typeof context.section.propsHints === "object"
      ? (context.section.propsHints as Record<string, unknown>)
      : undefined;
  const templateAsset = resolveSectionTemplateAsset({
    prompt,
    pagePath: context.pagePath,
    pageName: context.pageName,
    sectionType: context.section.type,
    sectionId: context.section.id,
    sectionIntent: context.section.intent,
    idBase,
    anchor,
    designNorthStar,
    theme,
    propsHints,
  });
  const templateBlock = templateAsset?.block ?? buildDeterministicFallbackBlock(context, prompt, designNorthStar, theme);
  return {
    status: "ok",
    component: { name: fallbackComponentName, code: fallbackComponentCode },
    block: { type: templateBlock.type, props: templateBlock.props },
    ...(templateAsset
        ? {
            templateMeta: {
              sourceLayer: templateAsset.layer,
              profileId: templateAsset.profileId,
              styleFamily: templateAsset.styleFamily,
              editableFieldCount: templateAsset.editableFields.length,
              catalogSource: templateAsset.catalogSource,
            },
          }
      : {}),
  };
};

let templateExclusiveRuntimeIndexPromise: Promise<Map<string, string>> | null = null;

const loadTemplateExclusiveRuntimeIndex = async () => {
  if (templateExclusiveRuntimeIndexPromise) return templateExclusiveRuntimeIndexPromise;
  templateExclusiveRuntimeIndexPromise = (async () => {
    const filePath = path.join(
      process.cwd(),
      "template-factory",
      "library",
      "template-exclusive-components.generated.json"
    );
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as { components?: Array<{ name?: unknown; kebabName?: unknown }> };
    const index = new Map<string, string>();
    for (const component of Array.isArray(parsed?.components) ? parsed.components : []) {
      const name = typeof component?.name === "string" ? component.name.trim() : "";
      const kebabName = typeof component?.kebabName === "string" ? component.kebabName.trim() : "";
      if (!name || !kebabName) continue;
      index.set(name, kebabName);
    }
    return index;
  })().catch((error) => {
    templateExclusiveRuntimeIndexPromise = null;
    throw error;
  });
  return templateExclusiveRuntimeIndexPromise;
};

const resolveTemplateExclusiveRuntimeComponent = async (componentName: string) => {
  if (!/^TemplateExclusive/i.test(String(componentName || ""))) return null;
  try {
    const index = await loadTemplateExclusiveRuntimeIndex();
    const kebabName = index.get(componentName);
    if (!kebabName) return null;
    const baseDir = path.join(process.cwd(), "src", "components", "blocks", kebabName);
    const candidates = ["block.tsx", "block.ts", "block.jsx", "block.js"].map((fileName) =>
      path.join(baseDir, fileName)
    );
    for (const filePath of candidates) {
      try {
        const code = await fs.readFile(filePath, "utf8");
        return { name: componentName, code };
      } catch {
        // try next extension
      }
    }
  } catch (error) {
    logWarn(`${logPrefix} builder:template_exclusive_component_lookup_failed`, {
      componentName,
      message: (error as any)?.message ?? String(error),
    });
  }
  return null;
};

// ---------------------------------------------------------------------------
// LLM lightweight refinement: takes a template block and refines text content
// using a fast, low-token LLM call. Falls back to original on any failure.
// ---------------------------------------------------------------------------
const templateRefinementSystemPrompt = `You are a website copy editor.
Refine copy fields in existing template props based on user intent.
Rules:
1. Only edit text-like fields (title, subtitle, body, eyebrow, label, desc, quote, name, role, etc.)
2. Do not modify structural fields (variant, columns, maxWidth, paddingY, sticky, href, etc.)
3. Do not add or remove fields
4. Copy must stay aligned with the requested industry/brand/product
5. Keep original tone and approximate text length
6. Use the user's dominant language; Chinese-heavy requests must stay in Chinese
7. Return JSON props only, no explanations`;

const buildTemplateRefinementPrompt = (
  prompt: string,
  sectionType: string,
  sectionIntent: string | undefined,
  blockType: string,
  props: Record<string, unknown>,
  designNorthStar?: Record<string, unknown>
): string => {
  const northStarSnippet = designNorthStar
    ? `\nIndustry: ${(designNorthStar as any).industry ?? "unknown"}\nCore products: ${JSON.stringify((designNorthStar as any).coreProducts ?? [])}\nStyle DNA: ${JSON.stringify((designNorthStar as any).styleDNA ?? [])}`
    : "";
  const intentLine = sectionIntent ? `\nSection intent: ${sectionIntent}` : "";
  // Only include text-relevant props to keep prompt small
  const propsJson = JSON.stringify(props, null, 2);
  return `User request: ${prompt.slice(0, 500)}${northStarSnippet}${intentLine}
Section type: ${sectionType} (component: ${blockType})

Current template props:
${propsJson.slice(0, 3000)}

Refine text fields to fit the user request and return the full JSON props object.`;
};

const applyRefinedProps = (
  original: Record<string, unknown>,
  refined: Record<string, unknown>
): Record<string, unknown> => {
  const result = JSON.parse(JSON.stringify(original)) as Record<string, unknown>;
  // Structural keys that must not be overwritten
  const structuralKeys = new Set([
    "variant", "columns", "maxWidth", "paddingY", "paddingX", "sticky",
    "background", "backgroundGradient", "backgroundOverlay", "mediaPosition",
    "headingSize", "bodySize", "density", "cardStyle", "id", "anchor",
    "formFields", "whatsapp", "href", "ctaStyle",
  ]);

  const mergeLevel = (target: Record<string, unknown>, source: Record<string, unknown>) => {
    for (const key of Object.keys(source)) {
      if (structuralKeys.has(key)) continue;
      if (!(key in target)) continue; // Don't add new keys
      const sourceVal = source[key];
      const targetVal = target[key];
      if (typeof sourceVal === "string" && typeof targetVal === "string") {
        target[key] = sourceVal;
      } else if (Array.isArray(sourceVal) && Array.isArray(targetVal)) {
        // Merge arrays item by item (for items, ctas, testimonials, etc.)
        for (let i = 0; i < Math.min(sourceVal.length, targetVal.length); i++) {
          if (
            sourceVal[i] && typeof sourceVal[i] === "object" &&
            targetVal[i] && typeof targetVal[i] === "object" &&
            !Array.isArray(sourceVal[i])
          ) {
            mergeLevel(targetVal[i] as Record<string, unknown>, sourceVal[i] as Record<string, unknown>);
          }
        }
      } else if (
        sourceVal && typeof sourceVal === "object" && !Array.isArray(sourceVal) &&
        targetVal && typeof targetVal === "object" && !Array.isArray(targetVal)
      ) {
        mergeLevel(targetVal as Record<string, unknown>, sourceVal as Record<string, unknown>);
      }
    }
  };

  mergeLevel(result, refined);
  return result;
};

const runWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
) => {
  const resolvedLimit = Math.max(1, limit);
  const results: R[] = new Array(items.length);
  let cursor = 0;

  const runners = new Array(Math.min(resolvedLimit, items.length)).fill(null).map(async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
};

const extractJsonCandidate = (value: string) => {
  const trimmed = value.trim().replace(/^\uFEFF/, "");
  const firstFence = trimmed.indexOf("```");
  const firstBrace = trimmed.indexOf("{");
  const fenceBeforeJson = firstFence >= 0 && (firstBrace < 0 || firstFence < firstBrace);
  if (fenceBeforeJson) {
    const closeFence = trimmed.indexOf("```", firstFence + 3);
    if (closeFence > firstFence) {
      const inner = trimmed.slice(firstFence + 3, closeFence);
      return inner.replace(/^json\s*/i, "").trim();
    }
  }
  return trimmed;
};

const parseVisualFingerprintHint = (prompt: string): { darkTheme: boolean | null; dominantColors: string[] } => {
  const text = String(prompt || "");
  const darkMatch = text.match(/darkTheme\s*=\s*(true|false)/i);
  const darkTheme = darkMatch ? darkMatch[1].toLowerCase() === "true" : null;
  const colorsMatch = text.match(/dominant colors\s*=\s*([^\n]+)/i);
  const dominantColors = colorsMatch
    ? Array.from(
        new Set(
          (colorsMatch[1].match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g) || []).map((item) => item.toLowerCase())
        )
      ).slice(0, 6)
    : [];
  return { darkTheme, dominantColors };
};

const lockThemeByVisualHint = (theme: Record<string, unknown>, prompt: string) => {
  const { darkTheme, dominantColors } = parseVisualFingerprintHint(prompt);
  if (darkTheme === null && dominantColors.length === 0) return theme;
  const next = { ...(theme || {}) } as Record<string, any>;
  if (darkTheme !== null) {
    next.mode = darkTheme ? "dark" : "light";
  }
  if (dominantColors.length) {
    const palette = { ...(next.palette && typeof next.palette === "object" ? next.palette : {}) } as Record<string, string>;
    if (darkTheme === false) {
      palette.bg = dominantColors[0] || palette.bg || "#f8f8f8";
      palette.text = palette.text || "#111827";
      palette.neutral = dominantColors[1] || palette.neutral || "#e5e7eb";
      palette.textSecondary = palette.textSecondary || "#4b5563";
      palette.primary = dominantColors[2] || palette.primary || "#111827";
      palette.accent = dominantColors[3] || dominantColors[2] || palette.accent || "#8b6227";
    } else if (darkTheme === true) {
      palette.bg = dominantColors[0] || palette.bg || "#0b0f14";
      palette.text = palette.text || "#e5e7eb";
      palette.neutral = dominantColors[1] || palette.neutral || "#1f2937";
      palette.textSecondary = palette.textSecondary || "#9ca3af";
      palette.primary = dominantColors[2] || palette.primary || "#1f2937";
      palette.accent = dominantColors[3] || dominantColors[2] || palette.accent || "#38bdf8";
    }
    next.palette = palette;
    if (!next.primaryColor && palette.primary) next.primaryColor = palette.primary;
  }
  return next;
};

// ---------------------------------------------------------------------------
// LLM lightweight refinement (placed after extractJsonCandidate for const ordering)
// ---------------------------------------------------------------------------
const refineTemplateWithLlm = async (
  context: SectionContext,
  prompt: string,
  block: SectionBlock,
  designNorthStar?: Record<string, unknown>
): Promise<SectionBlock> => {
  if (!enableTemplateRefinement) return block;
  if (!block.props || !Object.keys(block.props).length) return block;
  const sectionKind = inferTemplateRefinementSectionKind(context.section.type, context.section.id);
  if (sectionKind && templateRefinementSkipSectionTokens.has(sectionKind)) return block;
  if (skipTemplateExclusiveRefinement && /^TemplateExclusive/.test(String(block.type || ""))) {
    return block;
  }

  const refinementPrompt = buildTemplateRefinementPrompt(
    prompt,
    context.section.type,
    context.section.intent,
    block.type,
    block.props as Record<string, unknown>,
    designNorthStar
  );

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), templateRefinementTimeoutMs);
    const raw = await callLlm({
      system: templateRefinementSystemPrompt,
      prompt: refinementPrompt,
      temperature: 0.3,
      maxTokens: templateRefinementMaxTokens,
      allowProviderFallbackOnAnyError: true,
      requestSignal: controller.signal,
    });
    clearTimeout(timer);

    const candidate = extractJsonCandidate(raw);
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const refinedProps = applyRefinedProps(
        block.props as Record<string, unknown>,
        parsed as Record<string, unknown>
      );
      logInfo(`${logPrefix} builder:template_refinement:success`, {
        sectionType: context.section.type,
        sectionId: context.section.id,
        blockType: block.type,
      });
      return { type: block.type, props: refinedProps };
    }
  } catch (error) {
    logWarn(`${logPrefix} builder:template_refinement:failed`, {
      sectionType: context.section.type,
      sectionId: context.section.id,
      message: (error as any)?.message ?? String(error),
    });
  }
  // Fallback: return original block unchanged
  return block;
};

const stripJsonComments = (value: string) => {
  let out = "";
  let inString = false;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    const next = value[i + 1];

    if (inLineComment) {
      if (char === "\n" || char === "\r") {
        inLineComment = false;
        out += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        out += char;
        escaped = false;
        continue;
      }
      if (char === "\\") {
        out += char;
        escaped = true;
        continue;
      }
      if (char === "\"") {
        inString = false;
      }
      out += char;
      continue;
    }

    if (char === "\"") {
      inString = true;
      out += char;
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }

    out += char;
  }

  return out;
};

const quoteUnquotedKeys = (value: string) =>
  value.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_-]*)(\s*:)/g, '$1"$2"$3');

const replaceInvalidLiterals = (value: string) =>
  value
    .replace(/:\s*undefined\b/g, ": null")
    .replace(/:\s*NaN\b/g, ": null")
    .replace(/:\s*-?Infinity\b/g, ": null");

const repairJson = (value: string) => {
  let repaired = value;
  // Drop anything before first { and after last }
  const start = repaired.indexOf("{");
  const end = repaired.lastIndexOf("}");
  if (start >= 0 && end > start) {
    repaired = repaired.slice(start, end + 1);
  }
  repaired = stripJsonComments(repaired);
  // Remove trailing commas
  repaired = repaired.replace(/,\s*([}\]])/g, "$1");
  // Replace single-quoted keys
  repaired = repaired.replace(/([{,]\s*)'([^']+?)'\s*:/g, '$1"$2":');
  // Replace single-quoted string values
  repaired = repaired.replace(/:\s*'([^']*?)'(?=\s*[,\}])/g, ':"$1"');
  // Replace single-quoted array items
  repaired = repaired.replace(/,\s*'([^']*?)'/g, ',"$1"');
  repaired = quoteUnquotedKeys(repaired);
  repaired = replaceInvalidLiterals(repaired);
  return repaired;
};

const escapeNewlinesInStrings = (value: string) => {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (escaped) {
      out += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      out += char;
      escaped = true;
      continue;
    }
    if (char === "\"") {
      inString = !inString;
      out += char;
      continue;
    }
    if (inString && (char === "\n" || char === "\r")) {
      out += "\\n";
      // swallow \n after \r to avoid double escaping
      if (char === "\r" && value[i + 1] === "\n") {
        i += 1;
      }
      continue;
    }
    out += char;
  }
  return out;
};

const extractBalancedJsonObject = (value: string) => {
  const start = value.indexOf("{");
  if (start < 0) return value;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < value.length; i += 1) {
    const char = value[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return value.slice(start, i + 1);
      }
    }
  }
  return value;
};

const extractJsonObjects = (value: string) => {
  const cleaned = extractJsonCandidate(value);
  const results: string[] = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let start = -1;
  for (let i = 0; i < cleaned.length; i += 1) {
    const char = cleaned[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        results.push(cleaned.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return results;
};

const coerceParsedJson = <T,>(value: unknown, depth: number): T | null => {
  if (value && typeof value === "object") return value as T;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && depth < 2) {
      return safeJsonParse<T>(trimmed, depth + 1);
    }
  }
  return null;
};

const safeJsonParse = <T,>(value: string, depth = 0): T | null => {
  const cleaned = extractJsonCandidate(value);
  try {
    const normalized = escapeNewlinesInStrings(cleaned);
    const parsed = JSON.parse(normalized);
    return coerceParsedJson<T>(parsed, depth);
  } catch (error) {
    try {
      const balanced = extractBalancedJsonObject(cleaned);
      const normalized = escapeNewlinesInStrings(balanced);
      const repaired = repairJson(normalized);
      const parsed = JSON.parse(repaired);
      return coerceParsedJson<T>(parsed, depth);
    } catch (innerError) {
      return null;
    }
  }
};

const parseAffordableMaxTokens = (message: string): number | null => {
  if (!message) return null;
  const patterns = [
    /afford(?: up to)?\s*([0-9]{2,6})\s*(?:output\s*)?tokens/i,
    /reduce max[_\s-]?tokens to\s*([0-9]{2,6})/i,
    /max[_\s-]?tokens[^0-9]{0,20}([0-9]{2,6})/i,
    /only\s*([0-9]{2,6})\s*(?:output\s*)?tokens/i,
  ];
  for (const pattern of patterns) {
    const matched = message.match(pattern);
    if (!matched) continue;
    const value = Number(matched[1]);
    if (Number.isFinite(value) && value > 0) return Math.floor(value);
  }
  return null;
};

const clampTokenBudget = (value: number) => {
  if (!Number.isFinite(value)) return defaultMaxTokens;
  return Math.max(512, Math.min(8192, Math.floor(value)));
};

const isArchitectBlueprint = (value: unknown): value is ArchitectBlueprint => {
  if (!value || typeof value !== "object") return false;
  const blueprint = value as ArchitectBlueprint;
  const hasTheme =
    blueprint.theme && typeof blueprint.theme === "object" && Object.keys(blueprint.theme).length > 0;
  if (!hasTheme) return false;
  return normalizePages(blueprint).length > 0;
};

const collectNestedTextCandidates = (value: unknown, depth = 0): string[] => {
  if (depth > 4 || value == null) return [];
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectNestedTextCandidates(item, depth + 1));
  }
  if (typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const keys = [
    "content",
    "text",
    "message",
    "messages",
    "output",
    "output_text",
    "choices",
    "data",
    "result",
    "response",
    "input",
  ];
  const preferred = keys.flatMap((key) =>
    Object.prototype.hasOwnProperty.call(record, key)
      ? collectNestedTextCandidates(record[key], depth + 1)
      : []
  );
  const fallback = Object.values(record).flatMap((entry) =>
    collectNestedTextCandidates(entry, depth + 1)
  );
  return [...preferred, ...fallback];
};

const parseArchitectBlueprint = (raw: string): ArchitectBlueprint | null => {
  const queue: string[] = [raw];
  const seen = new Set<string>();
  let iterations = 0;

  while (queue.length && iterations < 80) {
    iterations += 1;
    const candidate = queue.shift()?.trim();
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    const parsed = safeJsonParse<unknown>(candidate);
    if (isArchitectBlueprint(parsed)) {
      return parsed;
    }

    if (parsed && typeof parsed === "object") {
      const nested = collectNestedTextCandidates(parsed);
      for (const text of nested) {
        const trimmed = text.trim();
        if (trimmed && !seen.has(trimmed)) {
          queue.push(trimmed);
        }
      }
    }

    const extractedObjects = extractJsonObjects(candidate);
    for (const objectText of extractedObjects) {
      const trimmed = objectText.trim();
      if (trimmed && !seen.has(trimmed)) {
        queue.push(trimmed);
      }
    }
  }

  return null;
};

const normalizeLlmResponse = (response: unknown) => {
  if (response && typeof response === "object") return response as any;
  if (typeof response === "string") {
    const parsed = safeJsonParse<Record<string, unknown>>(response);
    if (parsed && typeof parsed === "object") return parsed as any;
    return {
      content: [{ type: "text", text: response }],
      stop_reason: null,
      stop_sequence: null,
      usage: null,
    } as any;
  }
  return {
    content: [],
    stop_reason: null,
    stop_sequence: null,
    usage: null,
  } as any;
};

async function callLlm({
  system,
  prompt,
  temperature = 0.6,
  maxTokens,
  tools,
  toolChoice,
  modelOverride,
  requireToolUse = false,
  allowProviderFallbackOnAnyError = false,
  requestSignal,
}: LlmOptions) {
  if (!llmProviders.length) {
    throw Object.assign(new Error("missing_api_key"), {
      details: { message: "No LLM provider configured (AIBERM_API_KEY/OPENROUTER_API_KEY/ANTHROPIC_API_KEY)." },
    });
  }
  const toolOptions = tools && toolChoice ? { tools, tool_choice: toolChoice } : undefined;
  const requestedTokens = clampTokenBudget(maxTokens ?? defaultMaxTokens);
  const callWithProvider = async (
    provider: LlmProviderClient,
    requestedModelName: string,
    providerModelName: string,
    tokenBudget: number
  ) => {
    const startedAt = Date.now();
    logInfo(`${logPrefix} request`, {
      provider: provider.name,
      model: providerModelName,
      requestedModel: requestedModelName,
      promptLength: prompt.length,
      maxTokens: tokenBudget,
      prompt,
    });
    const rawResponse = await provider.client.messages.create({
      model: providerModelName,
      max_tokens: tokenBudget,
      temperature,
      system,
      messages: [{ role: "user", content: prompt }],
      ...(toolOptions ?? {}),
    }, requestSignal ? { signal: requestSignal } : undefined);
    const response = normalizeLlmResponse(rawResponse);
    let content = extractText(response.content);
    const rawText = content;
    let toolUsed = false;
    const contentBlockTypes = Array.isArray(response.content)
      ? response.content.map((block: any) => (block && typeof block === "object" ? block.type : typeof block))
      : [];
    const stopReason = (response as any)?.stop_reason ?? null;
    const stopSequence = (response as any)?.stop_sequence ?? null;
    const usageInputTokens = (response as any)?.usage?.input_tokens ?? null;
    const usageOutputTokens = (response as any)?.usage?.output_tokens ?? null;
    if (Array.isArray(response.content)) {
      const toolBlock = response.content.find(
        (block: any) => block && typeof block === "object" && block.type === "tool_use"
      ) as { input?: unknown } | undefined;
      if (toolBlock?.input !== undefined) {
        content = typeof toolBlock.input === "string" ? toolBlock.input : JSON.stringify(toolBlock.input);
        toolUsed = true;
      }
    }
    if (toolChoice && !toolUsed) {
      logWarn(`${logPrefix} response:tool_missing`, {
        provider: provider.name,
        model: providerModelName,
        requestedModel: requestedModelName,
        latencyMs: Date.now() - startedAt,
        stopReason,
        stopSequence,
        contentBlockTypes,
        textLength: rawText.length,
        textPreview: rawText.slice(0, 300),
      });
      const rawTrimmed = rawText.trim();
      const shouldFailOnMissingTool =
        requireToolUse || !rawTrimmed || stopReason === "max_tokens";
      if (shouldFailOnMissingTool) {
        throw Object.assign(new Error("tool_missing"), {
          code: "tool_missing",
          details: {
            provider: provider.name,
            model: providerModelName,
            requestedModel: requestedModelName,
            stopReason,
            stopSequence,
            contentBlockTypes,
            textLength: rawText.length,
            textPreview: rawText.slice(0, 300),
            reason: !rawTrimmed ? "empty_text" : stopReason === "max_tokens" ? "max_tokens" : "required",
          },
        });
      }
      // Some providers/models may ignore tool-use and still return valid JSON text.
      // Keep the text payload so downstream parsers/fallbacks can recover instead of hard-failing with empty content.
      content = rawText;
    }
    if (toolUsed) {
      const trimmed = content.trim();
      const isEmptyPayload = !trimmed || trimmed === "{}" || trimmed === "[]" || trimmed === "null";
      if (isEmptyPayload) {
        logWarn(`${logPrefix} response:tool_empty_payload`, {
          provider: provider.name,
          model: providerModelName,
          requestedModel: requestedModelName,
          latencyMs: Date.now() - startedAt,
          stopReason,
          stopSequence,
          contentBlockTypes,
          payloadPreview: trimmed,
        });
        throw Object.assign(new Error("tool_empty_payload"), {
          code: "tool_empty_payload",
          details: {
            provider: provider.name,
            model: providerModelName,
            requestedModel: requestedModelName,
            stopReason,
            stopSequence,
            contentBlockTypes,
            payloadPreview: trimmed,
          },
        });
      }
    }
    logInfo(`${logPrefix} response`, {
      provider: provider.name,
      model: providerModelName,
      requestedModel: requestedModelName,
      contentLength: content.length,
      latencyMs: Date.now() - startedAt,
      toolUsed,
      stopReason,
      stopSequence,
      usageInputTokens,
      usageOutputTokens,
      contentBlockTypes,
      content,
    });
    return content;
  };

  const callAcrossProviders = async (modelName: string, tokenBudget: number) => {
    let lastError: unknown = null;
    for (let index = 0; index < llmProviders.length; index += 1) {
      const provider = llmProviders[index];
      const disabledUntil = providerDisabledUntil.get(provider.name) ?? 0;
      if (disabledUntil > Date.now() && llmProviders.length > 1) {
        logInfo(`${logPrefix} request:provider_temporarily_disabled`, {
          provider: provider.name,
          requestedModel: modelName,
          disabledForMs: Math.max(0, disabledUntil - Date.now()),
        });
        continue;
      }
      const providerModelCandidates = resolveProviderModelCandidates(provider.name, modelName);
      let shouldStopProviderLoop = false;
      for (let candidateIndex = 0; candidateIndex < providerModelCandidates.length; candidateIndex += 1) {
        const providerModelName = providerModelCandidates[candidateIndex];
        try {
          return await callWithProvider(provider, modelName, providerModelName, tokenBudget);
        } catch (error) {
          if (isAbortLikeError(error)) {
            throw error;
          }
          const hasMoreCandidateModels = candidateIndex < providerModelCandidates.length - 1;
          const message = String((error as any)?.message ?? "").toLowerCase();
          const status = Number((error as any)?.status ?? NaN);
          const authorBanned =
            provider.name === "openrouter" &&
            Number.isFinite(status) &&
            status === 403 &&
            /author\s+[a-z0-9._-]+\s+is\s+banned/i.test(message);
          const anthropicBanned =
            provider.name === "openrouter" &&
            looksLikeAnthropicModel(providerModelName) &&
            (status === 403 ||
              message.includes("author anthropic is banned") ||
              message.includes("anthropic is banned"));
          if (hasMoreCandidateModels && authorBanned) {
            logWarn(`${logPrefix} request:provider_model_fallback`, {
              provider: provider.name,
              requestedModel: modelName,
              failedModel: providerModelName,
              nextModel: providerModelCandidates[candidateIndex + 1],
              reason: "openrouter_author_banned",
            });
            continue;
          }
          if (hasMoreCandidateModels && anthropicBanned) {
            logWarn(`${logPrefix} request:provider_model_fallback`, {
              provider: provider.name,
              requestedModel: modelName,
              failedModel: providerModelName,
              nextModel: providerModelCandidates[candidateIndex + 1],
              reason: "openrouter_anthropic_banned",
            });
            continue;
          }
          if (hasMoreCandidateModels && isAuthOrQuotaProviderError(error)) {
            logWarn(`${logPrefix} request:provider_model_fallback`, {
              provider: provider.name,
              requestedModel: modelName,
              failedModel: providerModelName,
              nextModel: providerModelCandidates[candidateIndex + 1],
              reason: "auth_or_quota",
            });
            continue;
          }
          lastError = error;
          if (
            providerDisableMs > 0 &&
            llmProviders.length > 1 &&
            (isAuthOrQuotaProviderError(error) || isNetworkOrRetryableProviderError(error))
          ) {
            providerDisabledUntil.set(provider.name, Date.now() + providerDisableMs);
            logWarn(`${logPrefix} request:provider_disabled`, {
              provider: provider.name,
              requestedModel: modelName,
              disableMs: providerDisableMs,
              reason: isAuthOrQuotaProviderError(error) ? "auth_or_quota" : "network_or_retryable",
            });
          }
          logWarn(`${logPrefix} request:provider_failed`, {
            provider: provider.name,
            model: providerModelName,
            requestedModel: modelName,
            message: (error as any)?.message ?? String(error),
            status: (error as any)?.status,
            code: (error as any)?.code,
          });
          const hasNextProvider = index < llmProviders.length - 1;
          const shouldForceOpenrouterFallback =
            forceOpenrouterFallbackOnAibermFailure &&
            provider.name === "aiberm" &&
            llmProviders.some((item) => item.name === "openrouter") &&
            isNetworkOrRetryableProviderError(error);
          const canFallbackToNextProvider =
            shouldForceOpenrouterFallback ||
            allowProviderFallbackOnAnyError ||
            shouldFallbackToNextProvider(error);
          if (hasNextProvider && !canFallbackToNextProvider) {
            logInfo(`${logPrefix} request:provider_fallback_skipped`, {
              provider: provider.name,
              model: providerModelName,
              requestedModel: modelName,
              mode: crossProviderFallbackMode,
            });
            shouldStopProviderLoop = true;
          }
          break;
        }
      }
      if (shouldStopProviderLoop) break;
    }
    throw lastError ?? new Error("llm_provider_unavailable");
  };

  const retryWithLowerBudget = async (modelName: string, error: unknown) => {
    const message = String((error as any)?.message ?? "");
    const status = Number((error as any)?.status ?? NaN);
    const looksLikeBudgetError =
      status === 402 || /insufficient|credit|quota|afford|max[_\s-]?tokens/i.test(message);
    if (!looksLikeBudgetError) return null;
    const affordable = parseAffordableMaxTokens(message);
    if (!affordable) return null;
    const lowered = clampTokenBudget(Math.min(affordable, requestedTokens - 128));
    if (lowered >= requestedTokens) return null;
    logWarn(`${logPrefix} request:token_backoff`, {
      model: modelName,
      requestedTokens,
      loweredTokens: lowered,
      status: Number.isFinite(status) ? status : undefined,
      message,
    });
    try {
      return await callAcrossProviders(modelName, lowered);
    } catch (loweredError) {
      logWarn(`${logPrefix} request:token_backoff_failed`, {
        model: modelName,
        loweredTokens: lowered,
        message: (loweredError as any)?.message ?? "token_backoff_failed",
      });
      return null;
    }
  };

  const primaryModel = modelOverride ?? primaryModelDefault;
  try {
    return await callAcrossProviders(primaryModel, requestedTokens);
  } catch (error) {
    const loweredAttempt = await retryWithLowerBudget(primaryModel, error);
    if (typeof loweredAttempt === "string" && loweredAttempt.trim()) {
      return loweredAttempt;
    }
    const message = (error as any)?.message ?? "";
    const isConnectionError = /connection error|ECONN|ETIMEDOUT|EAI_AGAIN|socket/i.test(message);
    if (fallbackModelDefault && fallbackModelDefault !== primaryModel) {
      if (!isConnectionError) {
        try {
          return await callAcrossProviders(fallbackModelDefault, requestedTokens);
        } catch (fallbackError) {
          const loweredFallbackAttempt = await retryWithLowerBudget(fallbackModelDefault, fallbackError);
          if (typeof loweredFallbackAttempt === "string" && loweredFallbackAttempt.trim()) {
            return loweredFallbackAttempt;
          }
          error = fallbackError;
        }
      }
    }
    const details = {
      name: (error as any)?.name,
      message: (error as any)?.message,
      status: (error as any)?.status,
      code: (error as any)?.code,
      error: (error as any)?.error,
    };
    throw Object.assign(new Error(details.message || "llm_error"), { details });
  }
}

async function callLlmWithLocalTimeout(
  options: LlmOptions,
  timeoutMs: number,
  timeoutErrorMessage: string
) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return callLlm(options);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(timeoutErrorMessage), timeoutMs);
  try {
    return await callLlm({ ...options, requestSignal: controller.signal });
  } catch (error) {
    if (isAbortLikeError(error)) {
      throw new Error(timeoutErrorMessage);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function architectNode(state: GraphState) {
  logInfo(`${logPrefix} architect:start`, { hasPrompt: Boolean(state.prompt) });
  const planning = state.planning ?? null;
  const existingBlueprint = (state.blueprint ??
    planning?.getBlueprint()) as ArchitectBlueprint | undefined;
  if (existingBlueprint) {
    const existingPages = normalizePages(existingBlueprint ?? {});
    const hasThemeExisting =
      existingBlueprint?.theme &&
      typeof existingBlueprint.theme === "object" &&
      Object.keys(existingBlueprint.theme).length > 0;
    if (hasThemeExisting && existingPages.length > 0) {
      logInfo(`${logPrefix} architect:resume`, {
        pages: existingPages.length,
        sections: existingPages.reduce((total, page) => total + page.sections.length, 0),
      });
      return { blueprint: existingBlueprint };
    }
  }
  const finalizeSeededBlueprint = async (
    seed: ArchitectBlueprint,
    stage: "template_seed" | "enterprise_seed"
  ) => {
    let seededBlueprint = applyUserThemeIntent(seed, state.prompt ?? "");
    seededBlueprint = applyReferenceBlueprintConstraints(seededBlueprint, state.prompt ?? "");
    seededBlueprint = ensurePromptRequestedPages(seededBlueprint, state.prompt ?? "") as ArchitectBlueprint;
    seededBlueprint = ensureEnterpriseBlueprintPages(seededBlueprint, state.prompt ?? "") as ArchitectBlueprint;
    const seededPagesContract = normalizePagesBySiteContract(normalizePages(seededBlueprint) as any[], {
      prompt: state.prompt ?? "",
    });
    seededPagesContract.issues.forEach((issue) =>
      logInfo(`${logPrefix} architect:contract_normalization`, {
        stage,
        severity: issue.severity,
        code: issue.code,
        message: issue.message,
      })
    );
    const seededPages = normalizePages({ pages: seededPagesContract.pages as any });
    seededBlueprint = {
      ...seededBlueprint,
      pages: seededPages.map((page) => ({
        path: page.path,
        name: page.name,
        sections: page.sections,
        root: page.root,
      })),
    };
    logInfo(`${logPrefix} architect:${stage}`, {
      profileId: selectStyleProfile(state.prompt ?? "")?.id ?? null,
      pages: seededPages.length,
      sections: seededPages.reduce((total, page) => total + page.sections.length, 0),
    });
    if (planning) {
      await planning.markArchitectComplete(seededBlueprint as Record<string, unknown>, seededPages);
    }
    return { blueprint: seededBlueprint };
  };

  const templateSeedBlueprint = buildTemplateSeedBlueprint(state.prompt ?? "");
  if (templateSeedBlueprint) {
    return finalizeSeededBlueprint(templateSeedBlueprint, "template_seed");
  }
  const enterpriseFallbackBlueprint = buildFallbackBlueprint(state.prompt ?? "");
  if (
    looksLikeEnterpriseWebsite({
      prompt: state.prompt ?? "",
      pages: normalizePages(enterpriseFallbackBlueprint),
    })
  ) {
    return finalizeSeededBlueprint(enterpriseFallbackBlueprint, "enterprise_seed");
  }
  const designSystemPrompt = buildDesignSystemPromptContext(state.designSystemContext);
  const basePrompt = buildArchitectUserPrompt(state.prompt ?? "", state.manifest ?? {});
  const prompt = designSystemPrompt ? `${basePrompt}\n\n${designSystemPrompt}` : basePrompt;
  const system = applySkillContext(architectSystemPrompt, state.skillContext?.architect ?? "");
  const retryPrompt = `${prompt}\n\nImportant: Return a complete JSON object. Do not return {} or empty arrays. Include at least 1 page and 1 section.`;
  const compactPrompt = `${prompt}\n\nImportant: Output compact JSON only (no extra prose). Keep propsHints concise (3-5 short keys), list items <= 6, and sections per page <= 6.`;
  let raw: string;
  try {
    raw = await callLlmWithLocalTimeout(
      {
        system,
        prompt,
        temperature: 0.4,
        maxTokens: architectMaxTokens,
        tools: [architectTool],
        toolChoice: { type: "tool", name: architectTool.name },
        requireToolUse: true,
        allowProviderFallbackOnAnyError: true,
      },
      architectTimeoutMs,
      "architect_timeout"
    );
  } catch (error) {
    logWarn(`${logPrefix} architect:tool_failed`, {
      message: (error as any)?.message ?? String(error),
    });
    try {
      raw = await callLlmWithLocalTimeout(
        {
          system,
          prompt: retryPrompt,
          temperature: 0.3,
          maxTokens: architectMaxTokens,
          allowProviderFallbackOnAnyError: true,
        },
        architectTimeoutMs,
        "architect_retry_timeout"
      );
    } catch {
      raw = "{}";
    }
  }
  let blueprint = parseArchitectBlueprint(raw);
  const initialPages = normalizePages(blueprint ?? {});
  const hasTheme =
    blueprint?.theme && typeof blueprint.theme === "object" && Object.keys(blueprint.theme).length > 0;
  if (!blueprint || !hasTheme || initialPages.length === 0) {
    logWarn(`${logPrefix} architect:tool_empty`, {
      rawPreview: raw.slice(0, 200),
      rawTail: raw.slice(-200),
      rawLength: raw.length,
      hasTheme,
      pages: initialPages.length,
    });
    const fallbackRaw = await callLlmWithLocalTimeout(
      {
        system,
        prompt: retryPrompt,
        temperature: 0.35,
        maxTokens: architectMaxTokens,
        allowProviderFallbackOnAnyError: true,
      },
      architectTimeoutMs,
      "architect_fallback_timeout"
    );
    blueprint = parseArchitectBlueprint(fallbackRaw);
    const fallbackPages = normalizePages(blueprint ?? {});
    const fallbackHasTheme =
      blueprint?.theme &&
      typeof blueprint.theme === "object" &&
      Object.keys(blueprint.theme).length > 0;
    if (!blueprint || !fallbackHasTheme || fallbackPages.length === 0) {
      logWarn(`${logPrefix} architect:empty_response`, {
        rawPreview: fallbackRaw.slice(0, 200),
        rawTail: fallbackRaw.slice(-200),
        rawLength: fallbackRaw.length,
        hasTheme: fallbackHasTheme,
        pages: fallbackPages.length,
      });
      const compactRaw = await callLlmWithLocalTimeout(
        {
          system,
          prompt: compactPrompt,
          temperature: 0.2,
          maxTokens: architectMaxTokens,
          allowProviderFallbackOnAnyError: true,
        },
        architectTimeoutMs,
        "architect_compact_timeout"
      );
      blueprint = parseArchitectBlueprint(compactRaw);
    }
    if (!blueprint || normalizePages(blueprint).length === 0) {
      blueprint = buildFallbackBlueprint(state.prompt ?? "");
      logInfo(`${logPrefix} architect:fallback_blueprint`, {
        pages: normalizePages(blueprint).length,
        reason: "invalid_or_empty_architect_response",
      });
    }
  }
  if (!blueprint) {
    logWarn(`${logPrefix} architect:parse_failed`, {
      rawPreview: raw.slice(0, 200),
      rawTail: raw.slice(-200),
      rawLength: raw.length,
    });
    return { errors: [...(state.errors ?? []), "architect_json_parse"] };
  }
  blueprint = applyUserThemeIntent(blueprint, state.prompt ?? "");
  blueprint = applyReferenceBlueprintConstraints(blueprint, state.prompt ?? "");
  blueprint = ensurePromptRequestedPages(blueprint, state.prompt ?? "") as ArchitectBlueprint;
  blueprint = ensureEnterpriseBlueprintPages(blueprint, state.prompt ?? "") as ArchitectBlueprint;
  const architectContractPages = normalizePagesBySiteContract(normalizePages(blueprint) as any[], {
    prompt: state.prompt ?? "",
  });
  architectContractPages.issues.forEach((issue) =>
    logInfo(`${logPrefix} architect:contract_normalization`, {
      stage: "architect_output",
      severity: issue.severity,
      code: issue.code,
      message: issue.message,
    })
  );
  const pages = normalizePages({ pages: architectContractPages.pages as any });
  blueprint = {
    ...blueprint,
    pages: pages.map((page) => ({
      path: page.path,
      name: page.name,
      sections: page.sections,
      root: page.root,
    })),
  };
  const sectionCount = pages.reduce((total, page) => total + page.sections.length, 0);
  logInfo(`${logPrefix} architect:ok`, {
    keys: Object.keys(blueprint),
    pages: pages.length,
    sections: sectionCount,
  });
  if (planning) {
    await planning.markArchitectComplete(blueprint as Record<string, unknown>, pages);
  }
  return { blueprint };
}

async function builderNode(state: GraphState) {
  const requestedSectionGenerationStrategy = state.generationStrategy ?? sectionGenerationStrategy;
  let activeSectionGenerationStrategy = requestedSectionGenerationStrategy;
  const fastPathMode = Boolean(state.singleCandidateOnly);
  const runtimeSectionMaxAttempts = fastPathMode ? 1 : effectiveSectionMaxAttempts;
  const runtimeNetworkRetryAttempts = fastPathMode ? 0 : configuredNetworkRetryAttempts;
  const runtimeAllowNonNetworkRetries = fastPathMode ? false : allowNonNetworkRetries;
  const runtimeEnableBuilderRepair = fastPathMode ? false : enableBuilderRepair;
  const runtimeEnableBuilderRefinement = fastPathMode ? false : enableBuilderRefinement;
  const runtimeEnableTemplateRefinement = fastPathMode ? false : enableTemplateRefinement;
  const runtimeBuilderTimeoutMs = fastPathMode ? Math.min(builderTimeoutMs, 18000) : builderTimeoutMs;
  const runtimeBuilderRecoveryTimeoutMs = fastPathMode ? Math.min(builderRecoveryTimeoutMs, 22000) : builderRecoveryTimeoutMs;
  const pageBuildMode = Boolean(state.pageBuildMode?.enabled);
  const pageBuildTargetPath = pageBuildMode
    ? normalizePromptPagePath(String(state.pageBuildMode?.path || "/"))
    : null;
  const blueprint = (state.blueprint ?? {}) as ArchitectBlueprint;
  const contractNormalizationIssues: Array<Record<string, unknown>> = [];
  let skillOrchestrationDiagnostics: Record<string, unknown> = {};
  let skillOrchestrationSuggestion: SectionGenerationStrategy | null = null;
  let skillOrchestrationApplied = false;
  let scopedRagDiagnostics: Record<string, unknown> = {
    enabled: enableScopedRag,
    knowledgeBaseEnabled: Boolean(knowledgeBaseClient?.isAvailable?.()),
    pageCount: 0,
    usedPageCount: 0,
    queryCount: 0,
    sourceCount: 0,
  };
  let pages = normalizePages(blueprint);
  if (pageBuildTargetPath) {
    pages = pages.filter((page) => normalizePromptPagePath(String(page.path || "/")) === pageBuildTargetPath);
  }
  const structuredBrief = parseStructuredBrief(state.prompt ?? "");
  const plannerPreparation =
    pageBuildMode &&
    blueprint &&
    typeof blueprint === "object" &&
    (blueprint as any).__plannerPreparation &&
    typeof (blueprint as any).__plannerPreparation === "object"
      ? ((blueprint as any).__plannerPreparation as PlannerPreparationMetadata)
      : null;
  const reusePlannerPreparation = Boolean(pageBuildMode && plannerPreparation?.prepared);
  let templateResolution: LayeredTemplateResolution;
  if (reusePlannerPreparation) {
    const preparedPages = normalizePages({ pages: (plannerPreparation?.pages ?? []) as any });
    if (preparedPages.length > 0) {
      pages = preparedPages;
    }
    activeSectionGenerationStrategy = parseSectionGenerationStrategy(
      plannerPreparation?.selectedStrategy,
      activeSectionGenerationStrategy
    );
    contractNormalizationIssues.push(...(plannerPreparation?.contractNormalizationIssues ?? []));
    skillOrchestrationApplied = Boolean(plannerPreparation?.skillOrchestration?.applied);
    skillOrchestrationSuggestion = plannerPreparation?.skillOrchestration?.suggestion ?? null;
    skillOrchestrationDiagnostics =
      plannerPreparation?.skillOrchestration?.diagnostics &&
      typeof plannerPreparation.skillOrchestration.diagnostics === "object"
        ? (plannerPreparation.skillOrchestration.diagnostics as Record<string, unknown>)
        : {};
    templateResolution = {
      profileId: plannerPreparation?.templatePlanProfile ?? null,
      siteStyleShell: null,
      layer: normalizeTemplateResolutionLayer(plannerPreparation?.resolutionLayer),
      pages,
      diagnostics: {
        matchedPagePaths: Array.isArray(plannerPreparation?.matchedPagePaths)
          ? plannerPreparation.matchedPagePaths
          : pages.map((page) => normalizePromptPagePath(String(page.path || "/"))),
        matchedPageCoverage:
          Number.isFinite(Number(plannerPreparation?.matchedPageCoverage)) && Number(plannerPreparation?.matchedPageCoverage) >= 0
            ? Number(plannerPreparation?.matchedPageCoverage)
            : pages.length > 0
              ? 1
              : 0,
        templateKinds: Array.isArray(plannerPreparation?.templateKinds)
          ? (plannerPreparation.templateKinds as any[])
          : [],
        strategy: activeSectionGenerationStrategy,
      },
    };
    logInfo(`${logPrefix} builder:planner_prepared_reuse`, {
      pageBuildTargetPath,
      pages: pages.length,
      strategy: activeSectionGenerationStrategy,
      profileId: templateResolution.profileId,
      layer: templateResolution.layer,
    });
  } else {
    const requestedPages = pageBuildMode ? [] : extractRequestedPagesFromPrompt(state.prompt ?? "");
    const hasStructuredNavContract = !pageBuildMode && (structuredBrief?.nav?.length ?? 0) >= 3;
    const hasStructuredCatalogContract =
      !pageBuildMode &&
      (hasStructuredCatalogContractSignal(structuredBrief) ||
        hasStructuredCatalogContractSignalFromPrompt(String(state.prompt || "")));
    if (requestedPages.length) {
      const byPath = new Map(pages.map((page) => [normalizePromptPagePath(String(page.path || "/")), page] as const));
      requestedPages.forEach((requested) => {
        if (byPath.has(requested.path)) return;
        byPath.set(requested.path, {
          path: requested.path,
          name: requested.name,
          sections: [],
        } as any);
      });
      pages = normalizePages({ pages: Array.from(byPath.values()) });
    }
    if (requestedPages.length >= 3 || hasStructuredNavContract) {
      const explicitPathSet = new Set<string>(["/"]);
      requestedPages.forEach((requested) => explicitPathSet.add(normalizePromptPagePath(String(requested.path || "/"))));
      if (Array.isArray(structuredBrief?.nav)) {
        structuredBrief.nav.forEach((label) => explicitPathSet.add(inferRequestedPagePathFromLabel(label)));
      }
      if (Array.isArray(structuredBrief?.footerLinks)) {
        structuredBrief.footerLinks.forEach((label) => explicitPathSet.add(inferRequestedPagePathFromLabel(label)));
      }
      // Keep legal pages stable for enterprise sites even when user nav is partial.
      explicitPathSet.add("/privacy");
      if (/(terms?|条款|服务条款|legal|tos)/i.test(String(state.prompt || ""))) {
        explicitPathSet.add("/terms");
      }
      pages = normalizePages({
        pages: pages.filter((page) => explicitPathSet.has(normalizePromptPagePath(String(page.path || "/")))),
      });
    }
    if (!pageBuildMode && looksLikeEnterpriseWebsite({ prompt: state.prompt ?? "", pages })) {
      const pageByPath = new Map(
        pages.map((page) => [normalizePromptPagePath(String(page.path || "/")), page] as const)
      );
      const useChinese = shouldUseChineseContent(state.prompt ?? "");
      if (!pageByPath.has("/privacy")) {
        pages = normalizePages({
          pages: [
            ...pages,
            {
              path: "/privacy",
              name: useChinese ? "隐私政策" : "Privacy",
              sections: [],
            } as any,
          ],
        });
      }
    }
    if (
      !pageBuildMode &&
      looksLikeEnterpriseWebsite({ prompt: state.prompt ?? "", pages }) &&
      requestedPages.length < 3 &&
      !hasStructuredNavContract
    ) {
      pages = normalizePages(
        hasStructuredCatalogContract
          ? {
              pages: ensureStructuredDualChainPages(pages as any[], state.prompt ?? "", structuredBrief),
            }
          : {
              pages: ensureEnterpriseSitePages(
                pages,
                (definition) => ({
                  path: definition.path,
                  name: definition.name,
                  sections: [],
                }),
                { prompt: state.prompt ?? "" }
              ),
            }
      );
    }
    const preTemplateContractNormalization = normalizePagesBySiteContract(pages as any[], {
      prompt: state.prompt ?? "",
    });
    preTemplateContractNormalization.issues.forEach((issue) => {
      contractNormalizationIssues.push({ stage: "pre_template", ...issue });
      const payload = { stage: "pre_template", code: issue.code, message: issue.message, details: issue.details };
      if (issue.severity === "error") {
        logWarn(`${logPrefix} builder:contract_normalization_error`, payload);
      } else {
        logInfo(`${logPrefix} builder:contract_normalization_warning`, payload);
      }
    });
    pages = normalizePages({ pages: preTemplateContractNormalization.pages as any });
    const skillOrchestration = orchestrateTemplateAndSectionCandidates({
      prompt: state.prompt ?? "",
      pages,
      strategy: activeSectionGenerationStrategy,
    });
    pages = normalizePages({ pages: skillOrchestration.pages as any });
    skillOrchestrationSuggestion = skillOrchestration.strategySuggestion;
    skillOrchestrationDiagnostics = {
      ...skillOrchestration.diagnostics,
      strategySuggestion: skillOrchestrationSuggestion,
    };
    if ((skillOrchestration.diagnostics.sectionReorderedPages ?? []).length > 0) {
      logInfo(`${logPrefix} builder:skill_orchestration_reorder`, {
        reorderedPages: skillOrchestration.diagnostics.sectionReorderedPages,
        count: skillOrchestration.diagnostics.sectionReorderedPages.length,
      });
    }
    if (skillOrchestrationSuggestion && skillOrchestrationSuggestion !== activeSectionGenerationStrategy) {
      const canOverrideStrategy =
        activeSectionGenerationStrategy === "hybrid" ||
        (activeSectionGenerationStrategy === "template_first" &&
          allowTemplateFirstUpshift &&
          (skillOrchestrationSuggestion === "hybrid" || skillOrchestrationSuggestion === "llm_first"));
      if (!canOverrideStrategy) {
        logInfo(`${logPrefix} builder:skill_orchestration_strategy_override_skipped`, {
          from: activeSectionGenerationStrategy,
          to: skillOrchestrationSuggestion,
        });
      } else {
        activeSectionGenerationStrategy = skillOrchestrationSuggestion;
        skillOrchestrationApplied = true;
        logInfo(`${logPrefix} builder:skill_orchestration_strategy_override`, {
          from: requestedSectionGenerationStrategy,
          to: activeSectionGenerationStrategy,
          reason: "structured_signal_and_page_type_match",
        });
      }
    }
    const outputLanguage = resolveOutputLanguage(state.prompt ?? "");
    if (
      forceHybridForZhEnterpriseWhenTemplateFirst &&
      outputLanguage === "zh-CN" &&
      activeSectionGenerationStrategy === "template_first" &&
      looksLikeEnterpriseWebsite({ prompt: state.prompt ?? "", pages })
    ) {
      activeSectionGenerationStrategy = "hybrid";
      skillOrchestrationApplied = true;
      logInfo(`${logPrefix} builder:strategy_language_override`, {
        from: requestedSectionGenerationStrategy,
        to: activeSectionGenerationStrategy,
        reason: "zh_enterprise_avoids_template_lock",
      });
    }
    templateResolution = resolveTemplatePlan({
      prompt: state.prompt ?? "",
      pages,
      strategy: activeSectionGenerationStrategy,
    });
    pages = normalizePages({ pages: templateResolution.pages as any });
    const postTemplateContractNormalization = normalizePagesBySiteContract(pages as any[], {
      prompt: state.prompt ?? "",
    });
    postTemplateContractNormalization.issues.forEach((issue) => {
      contractNormalizationIssues.push({ stage: "post_template", ...issue });
      const payload = { stage: "post_template", code: issue.code, message: issue.message, details: issue.details };
      if (issue.severity === "error") {
        logWarn(`${logPrefix} builder:contract_normalization_error`, payload);
      } else {
        logInfo(`${logPrefix} builder:contract_normalization_warning`, payload);
      }
    });
    pages = normalizePages({ pages: postTemplateContractNormalization.pages as any });
  }
  const siteBlueprint = buildSiteBlueprint({
    profileId: templateResolution.profileId,
    prompt: state.prompt ?? "",
    pages,
  });
  const linkGraph = buildSiteLinkGraph(siteBlueprint, state.prompt ?? "");
  const plannedRagQueriesByPath = new Map<string, string[]>(
    (Array.isArray(state.pageBuildJobs) ? state.pageBuildJobs : []).map((job) => [
      normalizePromptPagePath(job.pagePath || "/"),
      Array.isArray(job.ragQueries) ? job.ragQueries : [],
    ])
  );
  const hasPreScopedPrompt = pageBuildMode && /#\s*Page Scoped Fact Pack/i.test(String(state.prompt || ""));
  const scopedPromptByPath = new Map<string, string>();
  if (hasPreScopedPrompt) {
    pages.forEach((page) => scopedPromptByPath.set(page.path || "/", String(state.prompt ?? "")));
    scopedRagDiagnostics = {
      enabled: enableScopedRag,
      precomputed: true,
      pageCount: pages.length,
      usedPageCount: pages.length,
      queryCount: 0,
      sourceCount: 0,
    };
    logInfo(`${logPrefix} builder:scoped_rag`, scopedRagDiagnostics);
  } else {
    const scopedRag = await buildScopedRagContextByPage({
      prompt: state.prompt ?? "",
      pages: pages.map((page) => ({
        path: page.path,
        name: page.name,
        queryHints: plannedRagQueriesByPath.get(normalizePromptPagePath(page.path || "/")) || [],
      })),
      structuredInput: state.structuredInput ?? null,
      knowledgeBaseClient,
      enabled: enableScopedRag,
      concurrency: scopedRagConcurrency,
      fastMode: fastPathMode,
    });
    scopedRagDiagnostics = {
      ...scopedRag.summary,
      pages: Object.values(scopedRag.byPath).map((item) => ({
        path: item.path,
        pageType: item.pageType,
        requiredFields: item.requiredFields,
        coveredFields: item.coveredFields,
        missingFields: item.missingFields,
        used: item.used,
        queryCount: item.queryCount,
        sourceCount: item.sourceCount,
        queries: item.queries,
      })),
    };
    logInfo(`${logPrefix} builder:scoped_rag`, scopedRagDiagnostics);
    Object.values(scopedRag.byPath).forEach((item) => {
      const scopedPrompt = item.context
        ? `${String(state.prompt ?? "").trim()}\n\n# Page Scoped Fact Pack\n${item.context}`
        : String(state.prompt ?? "");
      scopedPromptByPath.set(item.path, scopedPrompt);
    });
  }
  const resolvePromptForPagePath = (pagePath: string) =>
    scopedPromptByPath.get(pagePath) ?? String(state.prompt ?? "");
  const allSections = flattenSections(pages);
  const contentSections = allSections.filter((context) => !isGlobalChromeSection(context.section));
  let theme =
    blueprint?.theme && typeof blueprint.theme === "object" ? blueprint.theme : {};
  const styleShellTheme =
    templateResolution.siteStyleShell?.theme &&
    typeof templateResolution.siteStyleShell.theme === "object"
      ? (templateResolution.siteStyleShell.theme as Record<string, unknown>)
      : null;
  if (styleShellTheme) {
    theme = {
      ...(theme && typeof theme === "object" ? (theme as Record<string, unknown>) : {}),
      ...styleShellTheme,
      themeContract: {
        ...((theme as any)?.themeContract && typeof (theme as any).themeContract === "object"
          ? (theme as any).themeContract
          : {}),
        ...(styleShellTheme.themeContract && typeof styleShellTheme.themeContract === "object"
          ? (styleShellTheme.themeContract as Record<string, unknown>)
          : {}),
      },
    };
    logInfo(`${logPrefix} builder:style_shell_applied`, {
      profileId: templateResolution.profileId,
      styleFamily: templateResolution.siteStyleShell?.styleFamily ?? "",
      navigationBlockType: templateResolution.siteStyleShell?.navigationBlockType ?? "",
      footerBlockType: templateResolution.siteStyleShell?.footerBlockType ?? "",
      motionProfile: templateResolution.siteStyleShell?.motionProfile ?? "",
    });
  }
  const plannerPreparationMeta =
    blueprint &&
    typeof blueprint === "object" &&
    (blueprint as any).__plannerPreparation &&
    typeof (blueprint as any).__plannerPreparation === "object"
      ? ((blueprint as any).__plannerPreparation as PlannerPreparationMetadata)
      : null;
  const globalChrome =
    plannerPreparationMeta?.globalChrome ??
    state.globalChrome ??
    resolvePlannerGlobalChrome({
      templateResolution,
      fallback: {
        navigationBlockType: navbarComponentName,
        footerBlockType: footerFallbackComponentName,
        motionProfile: "subtle",
      },
    });
  let themeContract = (theme?.themeContract as ThemeContract) ?? {};
  const planning = state.planning ?? null;
  const completedSectionKeys = planning?.getCompletedSectionKeys() ?? new Set<string>();
  const savedSectionOutputs = planning?.getSectionOutputs() ?? [];
  const sections = completedSectionKeys.size
    ? contentSections.filter((context) => !completedSectionKeys.has(buildSectionKey(context)))
    : contentSections;
  const guardian = new ConsistencyGuardian();
  const normalizedContract = guardian.normalizeThemeContract(themeContract);
  if (theme && typeof theme === "object") {
    theme.themeContract = normalizedContract as any;
  }
  themeContract = normalizedContract as ThemeContract;
  const designNorthStar =
    blueprint?.designNorthStar && typeof blueprint.designNorthStar === "object"
      ? blueprint.designNorthStar
      : {};
  const themeClassMap = buildThemeClassMap(theme);
  const themeClassMapForPrompt = stripThemeVariants(themeClassMap);
  const motionPresets = buildMotionPresets(theme, designNorthStar);
  const manifestForPrompt = filterManifestWhitelist(state.manifest ?? {});
  const errors = [...(state.errors ?? [])];
  const system = applySkillContext(builderSystemPrompt, state.skillContext?.builder ?? "");

  logInfo(`${logPrefix} builder:start`, {
    hasBlueprint: Boolean(state.blueprint),
    pages: pages.length,
    sections: allSections.length,
    contentSections: contentSections.length,
    pendingSections: sections.length,
    compactDesignSystemPrompt: useCompactDesignSystemForBuilder,
    sectionGenerationStrategy: activeSectionGenerationStrategy,
    templateFirstSections: templateFirstSectionTokens.join(","),
    llmFirstSections: llmFirstSectionTokens.join(","),
    templateFirstVariants: Array.from(templateFirstVariantTokens).join(","),
    requestedSectionGenerationStrategy,
    skillOrchestrationApplied,
    skillOrchestrationSuggestion: skillOrchestrationSuggestion ?? "",
    skillOrchestrationReorderedPageCount: Array.isArray(skillOrchestrationDiagnostics.sectionReorderedPages)
      ? (skillOrchestrationDiagnostics.sectionReorderedPages as unknown[]).length
      : 0,
    retryMode: fastPathMode ? `${builderRetryMode}:fast_path` : builderRetryMode,
    sectionMaxAttempts: runtimeSectionMaxAttempts,
    networkRetryAttempts: runtimeNetworkRetryAttempts,
    builderRecoveryMaxTokens,
    refinementEnabled: runtimeEnableBuilderRefinement,
    repairEnabled: runtimeEnableBuilderRepair,
    templateRefinementEnabled: runtimeEnableTemplateRefinement,
    fastPathMode,
    templatePlanProfile: templateResolution.profileId,
    skeleton: siteBlueprint.skeleton,
    sitePages: siteBlueprint.pages.map((page) => page.path).join(","),
    navLinks: linkGraph.navigationLinks.length,
      resolutionLayer: templateResolution.layer,
      matchedPageCoverage: templateResolution.diagnostics.matchedPageCoverage,
      scopedRagEnabled: Boolean((scopedRagDiagnostics as any).enabled),
      scopedRagUsedPages: Number((scopedRagDiagnostics as any).usedPageCount || 0),
      scopedRagQueryCount: Number((scopedRagDiagnostics as any).queryCount || 0),
      scopedRagSourceCount: Number((scopedRagDiagnostics as any).sourceCount || 0),
    });
  if (templateResolution.profileId) {
    logInfo(`${logPrefix} builder:template_plan_applied`, {
      profileId: templateResolution.profileId,
      pages: pages.length,
      sections: allSections.length,
      sectionIds: allSections.map((section) => `${section.pagePath}:${section.section.id}`).join(","),
    });
  }
  if (completedSectionKeys.size > 0) {
    logInfo(`${logPrefix} builder:resume`, {
      completed: completedSectionKeys.size,
      remaining: sections.length,
    });
  }

  const precheck = guardian.preGenerateValidation(normalizedContract);
  if (!precheck.passed) {
    logWarn(`${logPrefix} guardian:precheck_failed`, { errors: precheck.errors });
  } else if (precheck.warnings.length) {
    logInfo(`${logPrefix} guardian:precheck_warnings`, { warnings: precheck.warnings });
  }

  const isEmptyResponse = (value: string) => {
    const trimmed = value.trim();
    return !trimmed || trimmed === "{}" || trimmed === "[]" || trimmed === "null";
  };

  const callBuilderLlm = async (
    promptText: string,
    temperature: number,
    compactPromptText?: string
  ) => {
    const isToolProtocolError = (error: unknown) => {
      const code = String((error as any)?.code ?? "");
      const message = String((error as any)?.message ?? "");
      return code === "tool_missing" || code === "tool_empty_payload" || /tool_missing|tool_empty_payload/i.test(message);
    };

    const callWithBuilderTool = async (options: {
      prompt: string;
      temp: number;
      maxTokens?: number;
      modelOverride?: string;
      timeoutMs?: number;
    }) => {
      try {
        return await callLlmWithLocalTimeout(
          {
            system,
            prompt: options.prompt,
            temperature: options.temp,
            maxTokens: options.maxTokens ?? builderMaxTokens,
            tools: [builderTool],
            toolChoice: { type: "tool", name: builderTool.name },
            modelOverride: options.modelOverride,
          },
          options.timeoutMs ?? runtimeBuilderTimeoutMs,
          "builder_section_timeout"
        );
      } catch (error) {
        if (!isToolProtocolError(error)) throw error;
        logWarn(`${logPrefix} builder:section:tool_protocol_error`, {
          code: (error as any)?.code,
          message: (error as any)?.message ?? String(error),
          reason: (error as any)?.details?.reason,
          stopReason: (error as any)?.details?.stopReason,
        });
        return "";
      }
    };

    const raw = await callWithBuilderTool({
      prompt: promptText,
      temp: temperature,
      maxTokens: builderMaxTokens,
    });
    if (!isEmptyResponse(raw)) return raw;

    if (!runtimeAllowNonNetworkRetries) {
      if (compactPromptText) {
        const compactRetryPrompt = `${compactPromptText}\n\n必须通过工具返回 JSON，不要返回 {} 或空响应。只输出 component + block。`;
        logInfo(`${logPrefix} builder:section:tool_compact_recovery`, {
          promptLength: compactRetryPrompt.length,
          maxTokens: builderRecoveryMaxTokens,
        });
        const compactRaw = await callWithBuilderTool({
          prompt: compactRetryPrompt,
          temp: Math.max(0.15, temperature - 0.25),
          maxTokens: builderRecoveryMaxTokens,
          timeoutMs: runtimeBuilderRecoveryTimeoutMs,
        });
        if (!isEmptyResponse(compactRaw)) return compactRaw;
        if (fallbackModelDefault && fallbackModelDefault !== primaryModelDefault) {
          const compactFallbackRaw = await callWithBuilderTool({
            prompt: compactRetryPrompt,
            temp: Math.max(0.1, temperature - 0.3),
            maxTokens: builderRecoveryMaxTokens,
            modelOverride: fallbackModelDefault,
            timeoutMs: runtimeBuilderRecoveryTimeoutMs,
          });
          if (!isEmptyResponse(compactFallbackRaw)) return compactFallbackRaw;
        }
      }
      const emergencyBase = compactPromptText || promptText;
      const emergencyNoToolPrompt = `${emergencyBase}\n\n仅输出严格 JSON（component + block），不要 Markdown 或解释文本。组件保持最小可运行，避免超长 defaultProps。`;
      logInfo(`${logPrefix} builder:section:no_tool_emergency_retry`, {
        promptLength: emergencyNoToolPrompt.length,
        maxTokens: builderRecoveryMaxTokens,
      });
      const emergencyTextRaw = await callLlmWithLocalTimeout(
        {
          system,
          prompt: emergencyNoToolPrompt,
          temperature: Math.max(0.1, temperature - 0.3),
          maxTokens: builderRecoveryMaxTokens,
        },
        runtimeBuilderRecoveryTimeoutMs,
        "builder_section_emergency_timeout"
      );
      if (!isEmptyResponse(emergencyTextRaw)) return emergencyTextRaw;
      if (fallbackModelDefault && fallbackModelDefault !== primaryModelDefault) {
        const emergencyTextFallbackRaw = await callLlmWithLocalTimeout(
          {
            system,
            prompt: emergencyNoToolPrompt,
            temperature: Math.max(0.1, temperature - 0.3),
            maxTokens: builderRecoveryMaxTokens,
            modelOverride: fallbackModelDefault,
          },
          runtimeBuilderRecoveryTimeoutMs,
          "builder_section_emergency_fallback_timeout"
        );
        if (!isEmptyResponse(emergencyTextFallbackRaw)) return emergencyTextFallbackRaw;
      }
      throw Object.assign(new Error("builder_section_empty"), { code: "parse" });
    }

    const retryPrompt = `${promptText}\n\n必须通过工具返回 JSON，不要返回 {} 或空响应。只输出 component + block。`;
    const retryRaw = await callWithBuilderTool({
      prompt: retryPrompt,
      temp: Math.max(0.2, temperature - 0.2),
      maxTokens: builderMaxTokens,
      timeoutMs: runtimeBuilderTimeoutMs,
    });
    if (!isEmptyResponse(retryRaw)) return retryRaw;
    if (compactPromptText) {
      const compactRetryPrompt = `${compactPromptText}\n\n必须通过工具返回 JSON，不要返回 {} 或空响应。只输出 component + block。`;
      logInfo(`${logPrefix} builder:section:tool_compact_retry`, {
        promptLength: compactRetryPrompt.length,
      });
      const compactRaw = await callWithBuilderTool({
        prompt: compactRetryPrompt,
        temp: Math.max(0.15, temperature - 0.25),
        maxTokens: builderRecoveryMaxTokens,
        timeoutMs: runtimeBuilderRecoveryTimeoutMs,
      });
      if (!isEmptyResponse(compactRaw)) return compactRaw;
      if (fallbackModelDefault && fallbackModelDefault !== primaryModelDefault) {
        const compactFallbackRaw = await callWithBuilderTool({
          prompt: compactRetryPrompt,
          temp: Math.max(0.1, temperature - 0.3),
          maxTokens: builderRecoveryMaxTokens,
          modelOverride: fallbackModelDefault,
          timeoutMs: runtimeBuilderRecoveryTimeoutMs,
        });
        if (!isEmptyResponse(compactFallbackRaw)) return compactFallbackRaw;
      }
    }
    if (fallbackModelDefault && fallbackModelDefault !== primaryModelDefault) {
      const fallbackRaw = await callWithBuilderTool({
        prompt: retryPrompt,
        temp: Math.max(0.1, temperature - 0.3),
        maxTokens: builderRecoveryMaxTokens,
        modelOverride: fallbackModelDefault,
        timeoutMs: runtimeBuilderRecoveryTimeoutMs,
      });
      if (!isEmptyResponse(fallbackRaw)) return fallbackRaw;
    }
    const noToolPrompt = `${retryPrompt}\n\n如果工具调用不可用，直接输出严格 JSON（component + block），不要 Markdown 或解释文本。`;
    const textRaw = await callLlmWithLocalTimeout(
      {
        system,
        prompt: noToolPrompt,
        temperature: Math.max(0.1, temperature - 0.3),
        maxTokens: builderRecoveryMaxTokens,
      },
      runtimeBuilderRecoveryTimeoutMs,
      "builder_section_notool_timeout"
    );
    if (!isEmptyResponse(textRaw)) return textRaw;
    if (fallbackModelDefault && fallbackModelDefault !== primaryModelDefault) {
      const textFallbackRaw = await callLlmWithLocalTimeout(
        {
          system,
          prompt: noToolPrompt,
          temperature: Math.max(0.1, temperature - 0.3),
          maxTokens: builderRecoveryMaxTokens,
          modelOverride: fallbackModelDefault,
        },
        runtimeBuilderRecoveryTimeoutMs,
        "builder_section_notool_fallback_timeout"
      );
      if (!isEmptyResponse(textFallbackRaw)) return textFallbackRaw;
    }
    throw Object.assign(new Error("builder_section_empty"), { code: "parse" });
  };

  const maxConcurrency = Number.isFinite(defaultSectionConcurrency)
    ? Math.max(1, defaultSectionConcurrency)
    : 3;
  const skipTemplateRefinementForLargeSite =
    parseEnvBoolean(process.env.BUILDER_SKIP_TEMPLATE_REFINEMENT_FOR_LARGE_SITE, false) &&
    (pages.length >= 5 || sections.length >= 30);
      if (skipTemplateRefinementForLargeSite && runtimeEnableTemplateRefinement) {
    logInfo(`${logPrefix} builder:template_refinement_skipped`, {
      reason: "large_structured_site",
      pages: pages.length,
      sections: sections.length,
    });
  }

  const preferLlmForDesignFidelity = isDetailedDesignBrief(state.prompt ?? "");
    if (preferLlmForDesignFidelity) {
      logInfo(`${logPrefix} builder:quality_mode`, {
        mode: "detailed_design_brief",
      strategy: activeSectionGenerationStrategy,
      llmRoutedSections: llmFirstSectionTokens.join(","),
    });
  }

  const pageBuildConcurrency = Math.max(
    1,
    Number(process.env.BUILDER_PAGE_MAX_CONCURRENCY || process.env.LLM_PAGE_MAX_CONCURRENCY || 3)
  );
  const sectionWorker = async (context: SectionContext): Promise<BuilderSectionResult> => {
    const baseInfo = {
      pagePath: context.pagePath,
      sectionId: context.section.id,
      sectionType: context.section.type,
    };
    const templateVariant = normalizeFallbackVariant(buildFallbackSectionVariant(context));
    const templatePrimary = shouldTemplateFirstForSection(context, {
      preferLlmForDesignFidelity,
      strategy: activeSectionGenerationStrategy,
    });
    if (templatePrimary && !enableTemplateShadowRun) {
        logInfo(`${logPrefix} builder:section:template_primary`, {
          ...baseInfo,
          strategy: activeSectionGenerationStrategy,
          variant: templateVariant,
          refinementEnabled: runtimeEnableTemplateRefinement,
        });
      const baseResult = createTemplateSectionResult(
        context,
        resolvePromptForPagePath(context.pagePath),
        designNorthStar as Record<string, unknown>,
        theme as Record<string, unknown>
      );
      if (baseResult.status === "ok" && baseResult.templateMeta) {
        logInfo(`${logPrefix} builder:section:template_asset`, {
          ...baseInfo,
          sourceLayer: baseResult.templateMeta.sourceLayer,
          profileId: baseResult.templateMeta.profileId,
          styleFamily: baseResult.templateMeta.styleFamily,
          editableFieldCount: baseResult.templateMeta.editableFieldCount,
          catalogSource: baseResult.templateMeta.catalogSource,
        });
        logInfo(`${logPrefix} builder:block_catalog_source`, {
          ...baseInfo,
          catalogSource: baseResult.templateMeta.catalogSource,
        });
      }
      // LLM lightweight refinement: refine text content while keeping structure
      if (runtimeEnableTemplateRefinement && baseResult.status === "ok") {
        const allowRefinementForLayer =
          templateResolution.layer === "section" && !skipTemplateRefinementForLargeSite;
        if (!allowRefinementForLayer) {
          return baseResult;
        }
        const refinedBlock = await refineTemplateWithLlm(
          context,
          resolvePromptForPagePath(context.pagePath),
          baseResult.block,
          designNorthStar as Record<string, unknown>
        );
        return {
          ...baseResult,
          block: refinedBlock,
        };
      }
      return baseResult;
    }
    if (templatePrimary && enableTemplateShadowRun) {
        logInfo(`${logPrefix} builder:section:template_shadow_start`, {
          ...baseInfo,
          strategy: activeSectionGenerationStrategy,
          variant: templateVariant,
        });
    }
    const maxAttempts = runtimeAllowNonNetworkRetries
      ? runtimeSectionMaxAttempts
      : runtimeSectionMaxAttempts + runtimeNetworkRetryAttempts;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const compositionPreset = getCompositionPresetRules(
        context.section.type,
        context.section.layoutHint?.compositionPreset
      );
      const breakoutRequired = isBreakoutSection(context.section, themeContract);
      const constraints = guardian.buildConstraints(
        {
          type: context.section.type,
          layoutHint: context.section.layoutHint as Record<string, unknown> | undefined,
        },
        themeContract
      );
      const creativeGuidance = guardian.buildCreativeGuidance({
        id: context.section.id,
        type: context.section.type,
      });
      const promptOptions = {
        prompt: resolvePromptForPagePath(context.pagePath),
        manifest: manifestForPrompt,
        theme,
        designNorthStar,
        themeClassMap: themeClassMapForPrompt,
        motionPresets,
        compositionPreset,
        breakoutBudget: themeContract?.breakoutBudget ?? {},
        breakoutRequired,
        constraints,
        creativeGuidance,
        page: { path: context.pagePath, name: context.pageName },
        section: context.section,
        sectionIndex: context.sectionIndex,
      };
      const basePrompt = buildBuilderUserPrompt(promptOptions);
      const compactBasePrompt = buildBuilderCompactUserPrompt(promptOptions);
      const designSystemPrompt = buildDesignSystemPromptContext(state.designSystemContext, {
        pagePath: context.pagePath,
        pageName: context.pageName,
        compact: useCompactDesignSystemForBuilder,
      });
      const compactDesignSystemPrompt = buildDesignSystemPromptContext(state.designSystemContext, {
        pagePath: context.pagePath,
        pageName: context.pageName,
        compact: true,
      });
      const prompt = designSystemPrompt ? `${basePrompt}\n\n${designSystemPrompt}` : basePrompt;
      const compactPrompt = compactDesignSystemPrompt
        ? `${compactBasePrompt}\n\n${compactDesignSystemPrompt}`
        : compactBasePrompt;
      try {
        logInfo(`${logPrefix} builder:section:start`, { ...baseInfo, attempt });
        let raw = await callBuilderLlm(prompt, 0.6, compactPrompt);
        let parsed = parseNdjsonPayloads(raw);
        let normalized = parsed
          .map((payload) => normalizeSectionPayload(payload, compositionPreset))
          .find(Boolean);
        if (!normalized && runtimeAllowNonNetworkRetries) {
          const strictRaw = await callBuilderLlm(
            `${prompt}\n\n只返回严格 JSON，不要 Markdown、不要解释文本。`,
            0.3,
            compactPrompt
          );
          raw = strictRaw;
          parsed = parseNdjsonPayloads(strictRaw);
          normalized = parsed
            .map((payload) => normalizeSectionPayload(payload, compositionPreset))
            .find(Boolean);
        }
        if (!normalized) {
          if (!parsed.length) {
            logWarn(`${logPrefix} builder:section:parse_failed`, {
              ...baseInfo,
              rawLength: raw.length,
              rawPreview: raw.slice(0, 400),
              rawTail: raw.slice(-400),
            });
            throw Object.assign(new Error("builder_section_parse"), { code: "parse" });
          }
          logWarn(`${logPrefix} builder:section:invalid_payload`, {
            ...baseInfo,
            parsedCount: parsed.length,
            firstKeys: parsed[0] ? Object.keys(parsed[0]) : [],
          });
          throw Object.assign(new Error("builder_section_invalid"), { code: "parse" });
        }
        const layoutIssues = collectLayoutIssues(
          normalized.component.code,
          context.section.layoutHint,
          themeClassMapForPrompt,
          compositionPreset,
          breakoutRequired,
          (themeContract?.layoutRules as Record<string, string> | undefined),
          { id: context.section.id, type: context.section.type }
        );
        if (layoutIssues.length > 0) {
          logWarn(`${logPrefix} builder:section:layout_invalid`, {
            ...baseInfo,
            layoutHint: context.section.layoutHint,
            compositionPreset: compositionPreset?.id,
            breakoutRequired,
            issues: layoutIssues,
          });
          throw Object.assign(new Error("builder_section_layout_invalid"), { code: "layout" });
        }
        if (templatePrimary && enableTemplateShadowRun) {
          logInfo(`${logPrefix} builder:section:template_shadow_ok`, {
            ...baseInfo,
            variant: templateVariant,
          });
          return createTemplateSectionResult(
            context,
            resolvePromptForPagePath(context.pagePath),
            designNorthStar as Record<string, unknown>,
            theme as Record<string, unknown>
          );
        }
        logInfo(`${logPrefix} builder:section:ok`, { ...baseInfo });
        return { status: "ok", ...normalized };
      } catch (error) {
        const isLast = attempt === maxAttempts;
        const message = (error as any)?.message ?? "builder_section_failed";
        const failureType = classifySectionError(error);
        logWarn(`${logPrefix} builder:section:failed`, {
          ...baseInfo,
          attempt,
          message,
          failureType,
        });
        if (runtimeEnableBuilderRepair && isLast && (failureType === "parse" || failureType === "layout")) {
          try {
            const repairPrompt = buildRepairPrompt(prompt);
            const compactRepairPrompt = buildRepairPrompt(compactPrompt);
            let repairRaw = await callBuilderLlm(repairPrompt, 0.3, compactRepairPrompt);
            let repairParsed = parseNdjsonPayloads(repairRaw);
            let repairNormalized = repairParsed
              .map((payload) => normalizeSectionPayload(payload, compositionPreset))
              .find(Boolean);
            if (!repairNormalized) {
              const strictRepairRaw = await callBuilderLlm(
                `${repairPrompt}\n\n只返回严格 JSON，不要 Markdown、不要解释文本。`,
                0.2,
                compactRepairPrompt
              );
              repairRaw = strictRepairRaw;
              repairParsed = parseNdjsonPayloads(strictRepairRaw);
              repairNormalized = repairParsed
                .map((payload) => normalizeSectionPayload(payload, compositionPreset))
                .find(Boolean);
            }
            const repairIssues = repairNormalized
              ? collectLayoutIssues(
                  repairNormalized.component.code,
                  context.section.layoutHint,
                  themeClassMapForPrompt,
                  compositionPreset,
                  breakoutRequired,
                  (themeContract?.layoutRules as Record<string, string> | undefined),
                  { id: context.section.id, type: context.section.type }
                )
              : ["invalid_repair_payload"];
            if (repairNormalized && repairIssues.length === 0) {
              logInfo(`${logPrefix} builder:section:repair_ok`, { ...baseInfo });
              return { status: "ok" as const, ...repairNormalized };
            }
            if (repairIssues.length > 0) {
              logWarn(`${logPrefix} builder:section:repair_invalid`, {
                ...baseInfo,
                issues: repairIssues,
              });
            }
          } catch (repairError) {
            logWarn(`${logPrefix} builder:section:repair_failed`, {
              ...baseInfo,
              message: (repairError as any)?.message ?? "repair_failed",
            });
          }
        }
        const shouldRetry =
          !isLast &&
          (runtimeAllowNonNetworkRetries || (!runtimeAllowNonNetworkRetries && failureType === "network"));
        if (!shouldRetry) {
          if (templatePrimary && enableTemplateShadowRun) {
            logWarn(`${logPrefix} builder:section:template_shadow_failed`, {
              ...baseInfo,
              variant: templateVariant,
              failureType,
              message,
            });
            return createTemplateSectionResult(
              context,
              resolvePromptForPagePath(context.pagePath),
              designNorthStar as Record<string, unknown>,
              theme as Record<string, unknown>
            );
          }
          if (shouldTemplateRecoverFromFailure(context, failureType, { preferLlmForDesignFidelity })) {
            logInfo(`${logPrefix} builder:section:template_recovery`, {
              ...baseInfo,
              strategy: activeSectionGenerationStrategy,
              variant: templateVariant,
              failureType,
            });
            return createTemplateSectionResult(
              context,
              resolvePromptForPagePath(context.pagePath),
              designNorthStar as Record<string, unknown>,
              theme as Record<string, unknown>
            );
          }
          return { status: "error" as const, error: message, failureType };
        }
        const delay = attempt === 1 ? 500 : 2000;
        logInfo(`${logPrefix} builder:section:retry`, { ...baseInfo, delayMs: delay });
        await sleep(delay);
      }
    }
    return {
      status: "fallback",
      block: buildDeterministicFallbackBlock(
        context,
        state.prompt ?? "",
        designNorthStar as Record<string, unknown>,
        theme as Record<string, unknown>
      ),
      error: "builder_section_failed",
      failureType: "unknown",
    };
  };

  const pageBatches = pages
    .map((page, pageIndex) => ({
      pagePath: page.path || "/",
      pageIndex,
      sections: sections.filter((context) => context.pageIndex === pageIndex),
    }))
    .filter((batch) => batch.sections.length > 0);

  const sectionResultByKey = new Map<string, BuilderSectionResult>();
  await runWithConcurrency(pageBatches, pageBuildConcurrency, async (batch) => {
    logInfo(`${logPrefix} builder:page_builder:start`, {
      pagePath: batch.pagePath,
      pageIndex: batch.pageIndex,
      sections: batch.sections.length,
      pageConcurrency: pageBuildConcurrency,
      sectionConcurrency: maxConcurrency,
    });
    const pageResults = await runWithConcurrency(batch.sections, maxConcurrency, async (context) => sectionWorker(context));
    pageResults.forEach((result, index) => {
      const context = batch.sections[index];
      if (!context) return;
      sectionResultByKey.set(buildSectionKey(context), result);
    });
    logInfo(`${logPrefix} builder:page_builder:ok`, {
      pagePath: batch.pagePath,
      pageIndex: batch.pageIndex,
      generatedSections: pageResults.length,
    });
  });

  const results = sections.map((context) => {
    const result = sectionResultByKey.get(buildSectionKey(context));
    if (result) return result;
    return {
      status: "fallback" as const,
      block: buildDeterministicFallbackBlock(
        context,
        state.prompt ?? "",
        designNorthStar as Record<string, unknown>,
        theme as Record<string, unknown>
      ),
      error: "builder_section_missing_after_page_batch",
      failureType: "unknown" as FailureType,
    };
  });

  const needsAutoNavbarByPage = pages.map(() => true);
  const shouldRegisterAutoNavbar = needsAutoNavbarByPage.some(Boolean);
  const componentsMap = new Map<string, { name: string; code: string }>();
  if (shouldRegisterAutoNavbar) {
    if (componentsMap.has(navbarComponentName)) {
      errors.push(`builder_component_conflict:${navbarComponentName}`);
    } else {
      componentsMap.set(navbarComponentName, { name: navbarComponentName, code: navbarComponentCode });
    }
  }
  const normalizationSummary: Record<string, number> = {};
  let pagesOut = pages.map((page) => ({
    path: page.path,
    name: page.name,
    data: {
      content: [] as Array<{ type: string; props: Record<string, unknown> }>,
      root: { props: { title: page.name, theme, ...(page.root?.props ?? {}) } },
    },
  }));
  const existingKeys = new Set<string>();
  const pageIndexByPath = new Map<string, number>();
  type TemplateAssetMeta = {
    sourceLayer: string;
    profileId: string;
    styleFamily: string | null;
    editableFieldCount: number;
    catalogSource: "published" | "runtime" | "none";
  };
  pagesOut.forEach((page, index) => {
    if (page.path) pageIndexByPath.set(page.path, index);
  });
  const findSectionContextForPage = (
    pageIndex: number,
    predicate: (section: ReturnType<typeof normalizePages>[number]["sections"][number]) => boolean
  ): SectionContext | null => {
    const sourcePage = pages[pageIndex];
    if (!sourcePage || !Array.isArray(sourcePage.sections)) return null;
    const sectionIndex = sourcePage.sections.findIndex((section) => predicate(section));
    if (sectionIndex < 0) return null;
    const section = sourcePage.sections[sectionIndex];
    return {
      pageIndex,
      pagePath: sourcePage.path || "/",
      pageName: sourcePage.name || `Page ${pageIndex + 1}`,
      sectionIndex,
      section: {
        ...section,
        id: section?.id || `section-${pageIndex + 1}-${sectionIndex + 1}`,
        type: section?.type || "Section",
      },
    };
  };
  const buildSyntheticSectionContext = (
    pageIndex: number,
    sectionId: string,
    sectionType: string,
    sectionIntent = ""
  ): SectionContext | null => {
    const sourcePage = pages[pageIndex];
    if (!sourcePage) return null;
    return {
      pageIndex,
      pagePath: sourcePage.path || "/",
      pageName: sourcePage.name || `Page ${pageIndex + 1}`,
      sectionIndex: Array.isArray(sourcePage.sections) ? sourcePage.sections.length : 0,
      section: {
        id: sectionId,
        type: sectionType,
        intent: sectionIntent,
      },
    };
  };
  const resolveTemplateSectionOverride = (
    context: SectionContext | null,
    matcher: (item: { type?: string; props?: Record<string, unknown> } | undefined) => boolean
  ): { block: SectionBlock; templateMeta: TemplateAssetMeta } | null => {
    if (!context) return null;
    const result = createTemplateSectionResult(
      context,
      resolvePromptForPagePath(context.pagePath),
      designNorthStar as Record<string, unknown>,
      theme as Record<string, unknown>
    );
    if (result.status !== "ok" || !result.templateMeta) return null;
    const blockStub = { type: result.block.type, props: result.block.props };
    if (!matcher(blockStub)) return null;
    return {
      block: result.block,
      templateMeta: result.templateMeta,
    };
  };
  pagesOut.forEach((page, index) => {
    const source = pages[index];
    if (!source) return;
    if (!needsAutoNavbarByPage[index]) return;
    const key = `navbar:${page.path ?? index}`;
    if (existingKeys.has(key)) return;
    const templateNav = resolveTemplateSectionOverride(
      findSectionContextForPage(index, (section) => {
        const token = `${section?.type ?? ""} ${section?.id ?? ""}`.toLowerCase();
        return /(?:^|\s)(navigation|navbar|nav|header)\b/.test(token);
      }) ??
        buildSyntheticSectionContext(index, "navigation", "Navigation", "Provide primary navigation."),
      isNavbarLikeBlock
    );
    const baseBlock = templateNav
      ? templateNav.block
      : {
          type: navbarComponentName,
          props: buildNavbarProps(source, theme, linkGraph, state.prompt ?? ""),
        };
    const normalizedProps = normalizeBlockProps(baseBlock.type, baseBlock.props ?? {}, {
      logChanges: true,
      summary: normalizationSummary,
    });
    const propsWithId = ensurePropsId(
      normalizedProps,
      String(((baseBlock.props as Record<string, unknown>)?.id as string) || "navbar-global")
    );
    const propsWithAnchor = ensureAnchor(propsWithId, "top");
    page.data.content.unshift({
      type: baseBlock.type,
      props: propsWithAnchor,
      _key: key,
    } as any);
    existingKeys.add(key);
    if (templateNav) {
      logInfo(`${logPrefix} builder:navbar_materialized`, {
        pagePath: page.path,
        sourceLayer: templateNav.templateMeta.sourceLayer,
        profileId: templateNav.templateMeta.profileId,
        catalogSource: templateNav.templateMeta.catalogSource,
      });
    }
  });
  if (savedSectionOutputs.length) {
    savedSectionOutputs.forEach((output) => {
      const pageIndex = pageIndexByPath.get(output.pagePath ?? "");
      const page = typeof pageIndex === "number" ? pagesOut[pageIndex] : undefined;
      if (!page || existingKeys.has(output.key)) return;
      const blockStub = { type: output.type, props: output.props };
      if (isNavbarLikeBlock(blockStub) || isFooterLikeBlock(blockStub)) return;
      const sectionId = extractSectionIdFromKey(output.key);
      const propsWithAnchor = sectionId ? ensureAnchor(output.props, sectionId) : output.props;
      page.data.content.push({
        type: output.type,
        props: propsWithAnchor,
        _key: output.key,
      } as any);
      existingKeys.add(output.key);
      const existing = componentsMap.get(output.component.name);
      if (!existing) {
        componentsMap.set(output.component.name, output.component);
      } else if (existing.code !== output.component.code) {
        errors.push(`builder_component_conflict:${output.component.name}`);
      }
    });
  }

  const planningUpdates: Array<Promise<void>> = [];
  const refinementCandidates: Array<{
    context: SectionContext;
    failureType: FailureType;
    message: string;
  }> = [];

  results.forEach((result, index) => {
    const context = sections[index];
    if (!context) {
      errors.push(`builder_section_context_missing:${index}`);
      return;
    }
    const page = pagesOut[context.pageIndex];
    if (!page) return;

    if (result && result.status === "ok") {
      const component = result.component;
      const block = result.block;
      const existing = componentsMap.get(component.name);
      if (!existing) {
        componentsMap.set(component.name, component);
      } else if (existing.code !== component.code) {
        errors.push(`builder_component_conflict:${component.name}`);
      }
      const key = buildSectionKey(context);
      const normalizedProps = normalizeBlockProps(
        block.type,
        (block.props ?? {}) as Record<string, unknown>,
        { logChanges: true, summary: normalizationSummary }
      );
      const propsWithId = ensurePropsId(normalizedProps, key);
      const propsWithAnchor = ensureAnchor(propsWithId, context.section.id);
      if (!existingKeys.has(key)) {
        page.data.content.push({
          type: block.type,
          props: propsWithAnchor,
          _key: key,
        } as any);
        existingKeys.add(key);
      }
      if (planning) {
        planningUpdates.push(
          planning.recordSectionOutput(
          {
            key,
            pagePath: context.pagePath,
            pageName: context.pageName,
            type: block.type,
            props: propsWithId,
            component,
          },
            "success"
          )
        );
      }
    } else if (result.status === "fallback") {
      const key = buildSectionKey(context);
      const normalizedProps = normalizeBlockProps(
        result.block.type,
        (result.block.props ?? {}) as Record<string, unknown>,
        { logChanges: true, summary: normalizationSummary }
      );
      const propsWithId = ensurePropsId(normalizedProps, key);
      const propsWithAnchor = ensureAnchor(propsWithId, context.section.id);
      if (!existingKeys.has(key)) {
        page.data.content.push({
          type: result.block.type,
          props: propsWithAnchor,
          _key: key,
        } as any);
        existingKeys.add(key);
      }
      errors.push(`builder_section_fallback:${result.failureType}:${context.pagePath}:${context.section.id}`);
      if (planning) {
        planningUpdates.push(
          planning.recordSectionFailure({
            key: buildSectionKey(context),
            pagePath: context.pagePath,
            pageName: context.pageName,
            type: context.section.type,
          })
        );
      }
    } else {
      const message =
        result && "error" in result && typeof result.error === "string"
          ? result.error
          : "builder_section_failed";
      const failureType =
        result && "failureType" in result && typeof result.failureType === "string"
          ? (result.failureType as FailureType)
          : "unknown";
      const fallback = buildDeterministicFallbackBlock(
        context,
        state.prompt ?? "",
        designNorthStar as Record<string, unknown>,
        theme as Record<string, unknown>
      );
      const normalizedFallbackProps = normalizeBlockProps(
        fallback.type,
        fallback.props as Record<string, unknown>,
        { logChanges: true, summary: normalizationSummary }
      );
      const key = buildSectionKey(context);
      const propsWithId = ensurePropsId(normalizedFallbackProps, key);
      const propsWithAnchor = ensureAnchor(propsWithId, context.section.id);
      if (!existingKeys.has(key)) {
        page.data.content.push({
          type: fallback.type,
          props: propsWithAnchor,
          _key: key,
        } as any);
        existingKeys.add(key);
      }
      if (planning) {
        planningUpdates.push(
          planning.recordSectionOutput(
          {
            key: buildSectionKey(context),
            pagePath: context.pagePath,
            pageName: context.pageName,
            type: fallback.type,
            props: propsWithId,
            component: { name: fallbackComponentName, code: fallbackComponentCode },
          },
            "success"
          )
        );
      }
      if (fallback.type !== fallbackComponentName) {
        logInfo(`${logPrefix} builder:section:local_recovery`, {
          pagePath: context.pagePath,
          sectionId: context.section.id,
          sectionType: context.section.type,
          variant: normalizeFallbackVariant(buildFallbackSectionVariant(context)),
          blockType: fallback.type,
          failureType,
        });
        return;
      }
      refinementCandidates.push({ context, failureType, message });
      logWarn(`${logPrefix} builder:section:fallback`, {
        pagePath: context.pagePath,
        sectionId: context.section.id,
        sectionType: context.section.type,
        message,
        failureType,
      });
    }
  });
  if (planningUpdates.length) {
    await Promise.all(planningUpdates);
  }

  if (refinementCandidates.length && !runtimeEnableBuilderRefinement) {
    logInfo(`${logPrefix} builder:refine:skipped`, {
      sections: refinementCandidates.length,
      reason: "refinement_disabled",
      retryMode: fastPathMode ? `${builderRetryMode}:fast_path` : builderRetryMode,
    });
    refinementCandidates.forEach((candidate) => {
      const context = candidate.context;
      errors.push(`builder_section_fallback:${candidate.failureType}:${context.pagePath}:${context.section.id}`);
    });
  }

  if (refinementCandidates.length && runtimeEnableBuilderRefinement) {
    const refinementConcurrency = Math.max(
      1,
      Number(process.env.OPENROUTER_REFINEMENT_CONCURRENCY || 1)
    );
    logInfo(`${logPrefix} builder:refine:start`, {
      sections: refinementCandidates.length,
      concurrency: refinementConcurrency,
    });
    const refinementResults = await runWithConcurrency(
      refinementCandidates,
      refinementConcurrency,
      async (candidate) => {
        const context = candidate.context;
        try {
          const compositionPreset = getCompositionPresetRules(
            context.section.type,
            context.section.layoutHint?.compositionPreset
          );
          const breakoutRequired = isBreakoutSection(context.section, themeContract);
          const constraints = guardian.buildConstraints(
            {
              type: context.section.type,
              layoutHint: context.section.layoutHint as Record<string, unknown> | undefined,
            },
            themeContract
          );
          const creativeGuidance = guardian.buildCreativeGuidance({
            id: context.section.id,
            type: context.section.type,
          });
          const promptOptions = {
            prompt: resolvePromptForPagePath(context.pagePath),
            manifest: manifestForPrompt,
            theme,
            designNorthStar,
            themeClassMap: themeClassMapForPrompt,
            motionPresets,
            compositionPreset,
            breakoutBudget: themeContract?.breakoutBudget ?? {},
            breakoutRequired,
            constraints,
            creativeGuidance,
            page: { path: context.pagePath, name: context.pageName },
            section: context.section,
            sectionIndex: context.sectionIndex,
          };
          const basePrompt = buildBuilderUserPrompt(promptOptions);
          const compactBasePrompt = buildBuilderCompactUserPrompt(promptOptions);
          const designSystemPrompt = buildDesignSystemPromptContext(state.designSystemContext, {
            pagePath: context.pagePath,
            pageName: context.pageName,
            compact: useCompactDesignSystemForBuilder,
          });
          const compactDesignSystemPrompt = buildDesignSystemPromptContext(state.designSystemContext, {
            pagePath: context.pagePath,
            pageName: context.pageName,
            compact: true,
          });
          const prompt = designSystemPrompt ? `${basePrompt}\n\n${designSystemPrompt}` : basePrompt;
          const compactPrompt = compactDesignSystemPrompt
            ? `${compactBasePrompt}\n\n${compactDesignSystemPrompt}`
            : compactBasePrompt;
          const refinePrompt = `${prompt}\n\n# Refinement Pass\nPrevious output was empty or failed validation. Return a concise, runnable section that follows layoutHint. Output strict JSON only (component + block).`;
          const compactRefinePrompt = `${compactPrompt}\n\n# Refinement Pass\nPrevious output was empty or failed validation. Return a concise, runnable section that follows layoutHint. Output strict JSON only (component + block).`;
          let raw = await callBuilderLlm(refinePrompt, 0.3, compactRefinePrompt);
          let parsed = parseNdjsonPayloads(raw);
          let normalized = parsed
            .map((payload) => normalizeSectionPayload(payload, compositionPreset))
            .find(Boolean);
          if (!normalized) {
            const strictRaw = await callBuilderLlm(
              `${refinePrompt}\n\n只返回严格 JSON，不要 Markdown 或解释文本。`,
              0.2,
              compactRefinePrompt
            );
            raw = strictRaw;
            parsed = parseNdjsonPayloads(strictRaw);
            normalized = parsed
              .map((payload) => normalizeSectionPayload(payload, compositionPreset))
              .find(Boolean);
          }
          if (!normalized) {
            logWarn(`${logPrefix} builder:section:refine_parse_failed`, {
              pagePath: context.pagePath,
              sectionId: context.section.id,
              sectionType: context.section.type,
              parsedCount: parsed.length,
              rawLength: raw.length,
              rawPreview: raw.slice(0, 320),
              rawTail: raw.slice(-320),
            });
            return {
              status: "error" as const,
              context,
              failureType: candidate.failureType,
              message: "builder_section_empty",
            };
          }
          const layoutIssues = collectLayoutIssues(
            normalized.component.code,
            context.section.layoutHint,
            themeClassMapForPrompt,
            compositionPreset,
            breakoutRequired,
            (themeContract?.layoutRules as Record<string, string> | undefined),
            { id: context.section.id, type: context.section.type }
          );
          if (layoutIssues.length > 0) {
            return {
              status: "error" as const,
              context,
              failureType: "layout" as FailureType,
              message: "builder_section_layout_invalid",
            };
          }
          return {
            status: "ok" as const,
            context,
            component: normalized.component,
            block: normalized.block,
          };
        } catch (error) {
          return {
            status: "error" as const,
            context,
            failureType: classifySectionError(error),
            message: (error as any)?.message ?? "builder_section_refine_failed",
          };
        }
      }
    );

    const refinementPlanningUpdates: Array<Promise<void>> = [];
    refinementResults.forEach((result) => {
      const context = result.context;
      const key = buildSectionKey(context);
      const page = pagesOut[context.pageIndex];
      if (!page) return;

      if (result.status === "ok") {
        const existing = componentsMap.get(result.component.name);
        if (!existing) {
          componentsMap.set(result.component.name, result.component);
        } else if (existing.code !== result.component.code) {
          errors.push(`builder_component_conflict:${result.component.name}`);
        }
        const normalizedProps = normalizeBlockProps(
          result.block.type,
          (result.block.props ?? {}) as Record<string, unknown>,
          { logChanges: true, summary: normalizationSummary }
        );
        const propsWithId = ensurePropsId(normalizedProps, key);
        const propsWithAnchor = ensureAnchor(propsWithId, context.section.id);
        const index = page.data.content.findIndex((item: any) => item?._key === key);
        const block = {
          type: result.block.type,
          props: propsWithAnchor,
          _key: key,
        } as any;
        if (index >= 0) {
          page.data.content[index] = block;
        } else {
          page.data.content.push(block);
          existingKeys.add(key);
        }
        if (planning) {
          refinementPlanningUpdates.push(
            planning.recordSectionOutput(
              {
                key,
                pagePath: context.pagePath,
                pageName: context.pageName,
                type: result.block.type,
                props: propsWithId,
                component: result.component,
              },
              "success"
            )
          );
        }
        logInfo(`${logPrefix} builder:section:refine_ok`, {
          pagePath: context.pagePath,
          sectionId: context.section.id,
          sectionType: context.section.type,
        });
      } else {
        errors.push(`builder_section_fallback:${result.failureType}:${context.pagePath}:${context.section.id}`);
        logWarn(`${logPrefix} builder:section:refine_failed`, {
          pagePath: context.pagePath,
          sectionId: context.section.id,
          sectionType: context.section.type,
          failureType: result.failureType,
          message: result.message,
        });
      }
    });
    if (refinementPlanningUpdates.length) {
      await Promise.all(refinementPlanningUpdates);
    }
  }

  let injectedCtaBlocks = 0;
  const localeDefaults = resolveLocaleDefaults(state.prompt ?? "");
  const pageNameByPath = new Map(
    (Array.isArray((siteBlueprint as any)?.pages) ? (siteBlueprint as any).pages : [])
      .map((entry: any) => [normalizePromptPagePath(String(entry?.path || "/")), String(entry?.name || "").trim()] as const)
      .filter((entry) => Boolean(entry[0]))
  );
  const navTypeRank = new Map<string, number>([
    ["home", 0],
    ["products", 1],
    ["solutions", 2],
    ["cases", 3],
    ["about", 4],
    ["contact", 5],
    ["pricing", 6],
    ["support", 7],
    ["blog", 8],
    ["legal", 9],
    ["generic", 10],
  ]);

  pagesOut.forEach((page, pageIndex) => {
    const content = Array.isArray(page.data.content) ? page.data.content : [];
    if (pageHasCtaBlock(content as any)) return;
    const sourcePage = pages[pageIndex];
    if (!sourcePage) return;
    const key = `cta:${page.path ?? pageIndex}:injected`;
    if (existingKeys.has(key)) return;

    const sourceSection =
      [...(Array.isArray(sourcePage.sections) ? sourcePage.sections : [])].reverse().find(
        (section) => isCtaLikeSection(section) && !isFooterLikeSection(section)
      ) ?? null;
    const sectionId = toSlug(sourceSection?.id || "footer-cta") || "footer-cta";
    const sectionType =
      typeof sourceSection?.type === "string" && sourceSection.type.trim() ? sourceSection.type : "CTABanner";
    const sectionIntent =
      typeof sourceSection?.intent === "string" && sourceSection.intent.trim()
        ? sourceSection.intent
        : "Prompt users to take the next step with a clear call to action.";

    const ctaContext: SectionContext = {
      pageIndex,
      pagePath: page.path || sourcePage.path || "/",
      pageName: page.name || sourcePage.name || `Page ${pageIndex + 1}`,
      sectionIndex: sourcePage.sections.length,
      section: {
        id: sectionId,
        type: sectionType,
        intent: sectionIntent,
        propsHints: sourceSection?.propsHints,
        layoutHint: sourceSection?.layoutHint,
      },
    };
    const templateCta = resolveTemplateSectionOverride(
      ctaContext,
      (item) => isCtaLikeBlock(item) && !isFooterLikeBlock(item)
    );
    const baseBlock = templateCta
      ? templateCta.block
      : buildDeterministicFallbackBlock(
          ctaContext,
          state.prompt ?? "",
          designNorthStar as Record<string, unknown>,
          theme as Record<string, unknown>,
          { skipRegistry: true }
        );
    const normalizedProps = normalizeBlockProps(baseBlock.type, baseBlock.props ?? {}, {
      logChanges: true,
      summary: normalizationSummary,
    });
    const fallbackId =
      typeof normalizedProps?.id === "string" && normalizedProps.id
        ? normalizedProps.id
        : `${sectionId}-injected`;
    const propsWithId = ensurePropsId(normalizedProps, fallbackId);
    const propsWithAnchor = ensureAnchor(propsWithId, sectionId);
    const block = {
      type: baseBlock.type,
      props: propsWithAnchor,
      _key: key,
    } as any;

    const footerIndex = content.findIndex((item: any) => isFooterLikeBlock(item));
    if (footerIndex >= 0) {
      content.splice(footerIndex, 0, block);
    } else {
      content.push(block);
    }
    existingKeys.add(key);
    injectedCtaBlocks += 1;
    logInfo(`${logPrefix} builder:cta_injected`, {
      pagePath: page.path,
      pageName: page.name,
      reason: templateCta ? "missing_cta_block_template_materialized" : "missing_cta_block",
      cta_injected: true,
    });
    if (templateCta) {
      logInfo(`${logPrefix} builder:cta_materialized`, {
        pagePath: page.path,
        sourceLayer: templateCta.templateMeta.sourceLayer,
        profileId: templateCta.templateMeta.profileId,
        catalogSource: templateCta.templateMeta.catalogSource,
      });
    }
  });

  let injectedFooterBlocks = 0;
  pagesOut.forEach((page, pageIndex) => {
    const content = Array.isArray(page.data.content) ? page.data.content : [];
    if (pageHasFooterBlock(content as any)) return;
    const sourcePage = pages[pageIndex];
    if (!sourcePage) return;
    const key = `footer:${page.path ?? pageIndex}:injected`;
    if (existingKeys.has(key)) return;
    const templateFooter = resolveTemplateSectionOverride(
      findSectionContextForPage(pageIndex, isFooterLikeSection) ??
        buildSyntheticSectionContext(
          pageIndex,
          "footer",
          "Footer",
          "Provide navigation and legal links."
        ),
      isFooterLikeBlock
    );
    const baseBlock = templateFooter
      ? templateFooter.block
      : {
          type: footerFallbackComponentName,
          props: buildFooterProps(sourcePage, theme, linkGraph, state.prompt ?? ""),
        };
    const normalizedProps = normalizeBlockProps(baseBlock.type, baseBlock.props ?? {}, {
      logChanges: true,
      summary: normalizationSummary,
    });
    const propsWithId = ensurePropsId(
      normalizedProps,
      String(((baseBlock.props as Record<string, unknown>)?.id as string) || "footer-global")
    );
    const propsWithAnchor = ensureAnchor(propsWithId, "footer");
    page.data.content.push({
      type: baseBlock.type,
      props: propsWithAnchor,
      _key: key,
    } as any);
    existingKeys.add(key);
    injectedFooterBlocks += 1;
    logInfo(`${logPrefix} builder:footer_injected`, {
      pagePath: page.path,
      pageName: page.name,
      reason: templateFooter ? "missing_footer_block_template_materialized" : "missing_footer_block",
      footer_injected: true,
    });
    if (templateFooter) {
      logInfo(`${logPrefix} builder:footer_materialized`, {
        pagePath: page.path,
        sourceLayer: templateFooter.templateMeta.sourceLayer,
        profileId: templateFooter.templateMeta.profileId,
        catalogSource: templateFooter.templateMeta.catalogSource,
      });
    }
  });

  let harmonizedNavbarBlocks = 0;
  let harmonizedFooterBlocks = 0;
  let sanitizedContentLinkBlocks = 0;
  let demotedThemeDrivenBlocks = 0;
  const shouldPreserveTemplateExclusiveChrome =
    activeSectionGenerationStrategy === "template_first" && Boolean(templateResolution.profileId);
  pagesOut.forEach((page, pageIndex) => {
    const sourcePage = pages[pageIndex] ?? pages[0];
    if (!sourcePage) return;
    const fallbackNavbarProps = buildNavbarProps(sourcePage, theme, linkGraph, state.prompt ?? "");
    const fallbackFooterProps = buildFooterProps(sourcePage, theme, linkGraph, state.prompt ?? "");
    const content = Array.isArray(page.data.content) ? page.data.content : [];
    content.forEach((item: any) => {
      if (!item || typeof item !== "object") return;
      const itemType = typeof item.type === "string" ? item.type : "";
      const existingProps = item.props && typeof item.props === "object" ? item.props : {};
      const sanitizedExistingProps = sanitizeGeneratedProps(existingProps, {
        prompt: state.prompt ?? "",
        designNorthStar: designNorthStar as Record<string, unknown>,
        profileId: templateResolution.profileId ?? null,
      }) as Record<string, unknown>;
      if (isNavbarLikeBlock(item)) {
        if (shouldPreserveTemplateExclusiveChrome && isTemplateExclusiveBlock(item)) {
          const linkedProps = applyLinkGraphToNavbarProps(
            sanitizeInternalHrefsInProps(sanitizedExistingProps, linkGraph) as Record<string, unknown>,
            linkGraph
          );
          item.props = ensureAnchor(
            ensurePropsId(
              sanitizeSemanticProps(
                linkedProps,
                linkGraph,
                page.path || "/"
              ) as Record<string, unknown>,
              String((existingProps as Record<string, unknown>).id || "navbar-template")
            ),
            "top"
          );
          sanitizedContentLinkBlocks += 1;
          return;
        }
        const graphProps = applyLinkGraphToNavbarProps(
          { ...(fallbackNavbarProps as Record<string, unknown>) },
          linkGraph
        );
        const normalizedProps = normalizeBlockProps(navbarComponentName, graphProps, {
          logChanges: true,
          summary: normalizationSummary,
        });
        const fallbackId =
          typeof (existingProps as Record<string, unknown>).id === "string" &&
          String((existingProps as Record<string, unknown>).id).trim()
            ? String((existingProps as Record<string, unknown>).id)
            : String((fallbackNavbarProps as Record<string, unknown>).id || "navbar-global");
        item.type = navbarComponentName;
        item.props = ensureAnchor(ensurePropsId(normalizedProps, fallbackId), "top");
        harmonizedNavbarBlocks += 1;
        return;
      }
      if (isFooterLikeBlock(item)) {
        if (shouldPreserveTemplateExclusiveChrome && isTemplateExclusiveBlock(item)) {
          const linkedProps = applyLinkGraphToFooterProps(
            sanitizeInternalHrefsInProps(sanitizedExistingProps, linkGraph) as Record<string, unknown>,
            linkGraph
          );
          item.props = ensureAnchor(
            ensurePropsId(
              sanitizeSemanticProps(
                linkedProps,
                linkGraph,
                page.path || "/"
              ) as Record<string, unknown>,
              String((existingProps as Record<string, unknown>).id || "footer-template")
            ),
            "footer"
          );
          sanitizedContentLinkBlocks += 1;
          return;
        }
        const graphProps = applyLinkGraphToFooterProps(
          { ...(fallbackFooterProps as Record<string, unknown>) },
          linkGraph
        );
        const normalizedProps = normalizeBlockProps(footerFallbackComponentName, graphProps, {
          logChanges: true,
          summary: normalizationSummary,
        });
        const fallbackId =
          typeof (existingProps as Record<string, unknown>).id === "string" &&
          String((existingProps as Record<string, unknown>).id).trim()
            ? String((existingProps as Record<string, unknown>).id)
            : String((fallbackFooterProps as Record<string, unknown>).id || "footer-global");
        item.type = footerFallbackComponentName;
        item.props = ensureAnchor(ensurePropsId(normalizedProps, fallbackId), "footer");
        harmonizedFooterBlocks += 1;
        return;
      }
      if (isContactLikeBlock(item) || isCtaLikeBlock(item)) {
        if (shouldPreserveTemplateExclusiveChrome && isTemplateExclusiveBlock(item)) {
          const variant = isContactLikeBlock(item) ? "contact" : "footer-cta";
          item.props = ensureAnchor(
            ensurePropsId(
              sanitizeSemanticProps(
                sanitizeInternalHrefsInProps(sanitizedExistingProps, linkGraph),
                linkGraph,
                page.path || "/"
              ) as Record<string, unknown>,
              String(sanitizedExistingProps.id || `${variant}:${page.path ?? pageIndex}`)
            ),
            variant
          );
          sanitizedContentLinkBlocks += 1;
          return;
        }
        const variant = isContactLikeBlock(item) ? "contact" : "cta";
        const syntheticContext = buildSyntheticSectionContext(
          pageIndex,
          variant === "contact" ? "contact" : "footer-cta",
          variant === "contact" ? (localeDefaults.useChinese ? "联系" : "Contact") : "CTA",
          variant === "contact"
            ? localeDefaults.useChinese
              ? "提供咨询与线索收集入口。"
              : "Provide contact and consultation pathways."
            : localeDefaults.useChinese
              ? "引导访客完成下一步转化。"
              : "Prompt the visitor to take the next step."
        );
        const fallback = buildDeterministicFallbackBlock(
          syntheticContext,
          state.prompt ?? "",
          designNorthStar as Record<string, unknown>,
          theme as Record<string, unknown>,
          { skipRegistry: true }
        );
        const mergedProps = mergeThemeDrivenBlockProps(
          fallback.props as Record<string, unknown>,
          sanitizedExistingProps,
          variant
        );
        const normalizedProps = normalizeBlockProps(fallback.type, mergedProps, {
          logChanges: true,
          summary: normalizationSummary,
        });
        const fallbackId =
          typeof sanitizedExistingProps.id === "string" && String(sanitizedExistingProps.id).trim()
            ? String(sanitizedExistingProps.id)
            : `${variant}:${page.path ?? pageIndex}`;
        item.type = fallback.type;
        item.props = ensureAnchor(ensurePropsId(normalizedProps, fallbackId), variant === "contact" ? "contact" : "footer-cta");
        sanitizedContentLinkBlocks += 1;
        demotedThemeDrivenBlocks += 1;
        return;
      }
      item.props = sanitizeSemanticProps(
        sanitizeInternalHrefsInProps(sanitizedExistingProps, linkGraph),
        linkGraph,
        page.path || "/"
      ) as Record<string, unknown>;
      sanitizedContentLinkBlocks += 1;
    });
  });
  if (harmonizedNavbarBlocks > 0 || harmonizedFooterBlocks > 0 || sanitizedContentLinkBlocks > 0) {
    logInfo(`${logPrefix} builder:global_nav_footer_harmonized`, {
      navbarBlocks: harmonizedNavbarBlocks,
      footerBlocks: harmonizedFooterBlocks,
      contentLinkBlocks: sanitizedContentLinkBlocks,
      homeHref: linkGraph.homeHref,
    });
  }

  const dedupeComposedPageContent = (content: any[], pagePath: string) => {
    const safeContent = Array.isArray(content) ? content.filter(Boolean) : [];
    const navbar = safeContent.find((item) => isNavbarLikeBlock(item));
    const footer = [...safeContent].reverse().find((item) => isFooterLikeBlock(item));
    const body = safeContent.filter((item) => !isNavbarLikeBlock(item) && !isFooterLikeBlock(item));
    const dedupedBody: any[] = [];
    const anchorIndex = new Map<string, number>();
    const dedupeKind = (item: any) => {
      const token = `${String(item?.type || "")} ${String(item?.props?.__publishedOriginalType || "")}`.toLowerCase();
      if (/(hero|masthead|banner)/.test(token)) return "hero";
      if (/(feature|approach|metric|stats|capabilit|valueprop)/.test(token)) return "approach";
      if (/(product|catalog|pricing|plan|cardsgrid|showcase|collection)/.test(token)) return "products";
      if (/(testimonial|social|proof|logo|trust|case)/.test(token)) return "socialproof";
      if (/(contact|lead|form|quote|consult)/.test(token)) return "contact";
      if (/(cta|calltoaction)/.test(token)) return "cta";
      if (/(story|about|narrative|content)/.test(token)) return "story";
      return String(item?.type || "").toLowerCase();
    };
    const itemScore = (item: any, idx: number) => {
      const id = String(item?.props?.id || "");
      let score = 0;
      if (id.startsWith("structured-")) score += 20;
      if (/hero/.test(id)) score += 8;
      score += Math.max(0, 10 - idx);
      return score;
    };

    body.forEach((item, index) => {
      const anchor = String(item?.props?.anchor || "")
        .trim()
        .toLowerCase();
      const key = anchor ? `${anchor}::${dedupeKind(item)}` : "";
      if (!key) {
        dedupedBody.push(item);
        return;
      }
      const existingIndex = anchorIndex.get(key);
      if (existingIndex === undefined) {
        anchorIndex.set(key, dedupedBody.length);
        dedupedBody.push(item);
        return;
      }
      if (itemScore(item, index) > itemScore(dedupedBody[existingIndex], existingIndex)) {
        dedupedBody[existingIndex] = item;
      }
    });

    if (pagePath === "/contact") {
      const ctaIndexes = dedupedBody
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => isContactLikeBlock(item) || isCtaLikeBlock(item))
        .map(({ index }) => index);
      if (ctaIndexes.length > 1) {
        let keepIndex = ctaIndexes[0];
        ctaIndexes.forEach((candidateIndex) => {
          const item = dedupedBody[candidateIndex];
          const id = String(item?.props?.id || "");
          const anchor = String(item?.props?.anchor || "");
          if (id === "structured-contact-hero" || anchor === "contact-hero") {
            keepIndex = candidateIndex;
          }
        });
        const removeSet = new Set(ctaIndexes.filter((index) => index !== keepIndex));
        const filtered = dedupedBody.filter((_, index) => !removeSet.has(index));
        dedupedBody.splice(0, dedupedBody.length, ...filtered);
      }
    }

    return [...(navbar ? [navbar] : []), ...dedupedBody, ...(footer ? [footer] : [])];
  };

  pagesOut.forEach((page, pageIndex) => {
    const sourcePage = pages[pageIndex] ?? pages[0];
    if (!sourcePage || !Array.isArray(page.data.content)) return;
    page.data.content = page.data.content.map((item: any, itemIndex: number) => {
      if (!item || typeof item !== "object") return item;
      const existingProps = item.props && typeof item.props === "object" ? item.props : {};
      const sanitizedExistingProps = sanitizeGeneratedProps(existingProps, {
        prompt: state.prompt ?? "",
        designNorthStar: designNorthStar as Record<string, unknown>,
        profileId: templateResolution.profileId ?? null,
      }) as Record<string, unknown>;
      if (isContactLikeBlock(item) || isCtaLikeBlock(item)) {
        if (shouldPreserveTemplateExclusiveChrome && isTemplateExclusiveBlock(item)) {
          const themedProps = harmonizeBlockThemeProps(
            String(item.type || ""),
            sanitizedExistingProps,
            theme as Record<string, unknown>,
            itemIndex,
            state.prompt ?? ""
          );
          const preservedAnchor = isContactLikeBlock(item) ? "contact" : "footer-cta";
          return {
            ...item,
            props: ensureAnchor(
              ensurePropsId(
                sanitizeSemanticProps(
                  sanitizeInternalHrefsInProps(themedProps, linkGraph),
                  linkGraph,
                  page.path || "/"
                ) as Record<string, unknown>,
                String(sanitizedExistingProps.id || `${preservedAnchor}:${page.path ?? pageIndex}:${itemIndex}`)
              ),
              preservedAnchor
            ),
          };
        }
        const variant = isContactLikeBlock(item) ? "contact" : "cta";
        const syntheticContext = buildSyntheticSectionContext(
          pageIndex,
          variant === "contact" ? "contact" : "footer-cta",
          variant === "contact" ? (localeDefaults.useChinese ? "联系" : "Contact") : "CTA",
          variant === "contact"
            ? localeDefaults.useChinese
              ? "提供咨询与线索收集入口。"
              : "Provide contact and consultation pathways."
            : localeDefaults.useChinese
              ? "引导访客完成下一步转化。"
              : "Prompt the visitor to take the next step."
        );
        const fallback = buildDeterministicFallbackBlock(
          syntheticContext,
          state.prompt ?? "",
          designNorthStar as Record<string, unknown>,
          theme as Record<string, unknown>,
          { skipRegistry: true }
        );
        const mergedProps = mergeThemeDrivenBlockProps(
          fallback.props as Record<string, unknown>,
          sanitizedExistingProps,
          variant
        );
        const themedProps = harmonizeBlockThemeProps(
          fallback.type,
          mergedProps,
          theme as Record<string, unknown>,
          itemIndex,
          state.prompt ?? ""
        );
        const normalizedProps = normalizeBlockProps(
          fallback.type,
          sanitizeSemanticProps(sanitizeInternalHrefsInProps(themedProps, linkGraph), linkGraph, page.path || "/") as Record<
            string,
            unknown
          >,
          {
            logChanges: true,
            summary: normalizationSummary,
          }
        );
        const fallbackId =
          typeof sanitizedExistingProps.id === "string" && String(sanitizedExistingProps.id).trim()
            ? String(sanitizedExistingProps.id)
            : `${variant}:${page.path ?? pageIndex}:${itemIndex}`;
        return {
          ...item,
          type: fallback.type,
          props: ensureAnchor(
            ensurePropsId(normalizedProps, fallbackId),
            variant === "contact" ? "contact" : "footer-cta"
          ),
        };
      }
      if (localeDefaults.useChinese && isTemplateExclusiveBlock(item)) {
        const typeToken = String(item.type || "");
        const idToken = String(sanitizedExistingProps.id || "");
        const inferredKind = inferTemplateRefinementSectionKind(typeToken, idToken);
        const sectionLabelMap: Record<string, string> = {
          navigation: "导航",
          hero: "首屏",
          story: "内容",
          approach: "能力",
          products: "产品",
          socialproof: "案例",
          cta: "转化",
          footer: "页脚",
        };
        const sectionIntentMap: Record<string, string> = {
          navigation: "提供全局导航入口。",
          hero: "呈现页面核心价值。",
          story: "说明品牌与方案要点。",
          approach: "展示能力优势与实施路径。",
          products: "展示核心产品与参数亮点。",
          socialproof: "展示案例与客户背书。",
          cta: "引导访客完成下一步转化。",
          footer: "提供页脚信息与法务链接。",
        };
        const fallbackKind =
          inferredKind ||
          (/social|proof|testimonial|logo|case/i.test(typeToken)
            ? "socialproof"
            : /product|catalog|pricing|plan|cards/i.test(typeToken)
              ? "products"
              : /feature|approach|metric|capabilit|process/i.test(typeToken)
                ? "approach"
                : /hero|masthead|banner/i.test(typeToken)
                  ? "hero"
                  : /story|content|about|editorial/i.test(typeToken)
                    ? "story"
                    : "story");
        const syntheticContext = buildSyntheticSectionContext(
          pageIndex,
          String(sanitizedExistingProps.anchor || sanitizedExistingProps.id || `${page.path}:${itemIndex}`),
          sectionLabelMap[fallbackKind] || "内容",
          sectionIntentMap[fallbackKind] || "说明页面核心信息。"
        );
        const fallback = buildDeterministicFallbackBlock(
          syntheticContext,
          state.prompt ?? "",
          designNorthStar as Record<string, unknown>,
          theme as Record<string, unknown>,
          { skipRegistry: true }
        );
        const themedProps = harmonizeBlockThemeProps(
          fallback.type,
          fallback.props as Record<string, unknown>,
          theme as Record<string, unknown>,
          itemIndex,
          state.prompt ?? ""
        );
        const normalizedProps = normalizeBlockProps(
          fallback.type,
          sanitizeSemanticProps(sanitizeInternalHrefsInProps(themedProps, linkGraph), linkGraph, page.path || "/") as Record<
            string,
            unknown
          >,
          {
            logChanges: true,
            summary: normalizationSummary,
          }
        );
        const fallbackId =
          typeof sanitizedExistingProps.id === "string" && String(sanitizedExistingProps.id).trim()
            ? String(sanitizedExistingProps.id)
            : `${fallbackKind}:${page.path ?? pageIndex}:${itemIndex}`;
        const anchor =
          typeof sanitizedExistingProps.anchor === "string" && String(sanitizedExistingProps.anchor).trim()
            ? String(sanitizedExistingProps.anchor)
            : String((fallback.props as Record<string, unknown>).anchor || "section");
        return {
          ...item,
          type: fallback.type,
          props: ensureAnchor(ensurePropsId(normalizedProps, fallbackId), anchor),
        };
      }
      const themedProps = harmonizeBlockThemeProps(
        String(item.type || ""),
        sanitizedExistingProps,
        theme as Record<string, unknown>,
        itemIndex,
        state.prompt ?? ""
      );
      return {
        ...item,
        props: sanitizeSemanticProps(
          sanitizeInternalHrefsInProps(themedProps, linkGraph),
          linkGraph,
          page.path || "/"
        ) as Record<string, unknown>,
      };
    });
  });

  pagesOut.forEach((page, pageIndex) => {
    const sourcePage = pages[pageIndex] ?? pages[0];
    if (!sourcePage || !Array.isArray(page.data.content)) return;
    const fallbackNavbarProps = buildNavbarProps(sourcePage, theme, linkGraph, state.prompt ?? "");
    const fallbackFooterProps = buildFooterProps(sourcePage, theme, linkGraph, state.prompt ?? "");
    const navbarId =
      typeof (fallbackNavbarProps as Record<string, unknown>).id === "string"
        ? String((fallbackNavbarProps as Record<string, unknown>).id)
        : "navbar-global";
    const footerId =
      typeof (fallbackFooterProps as Record<string, unknown>).id === "string"
        ? String((fallbackFooterProps as Record<string, unknown>).id)
        : "footer-global";
    const canonicalNavbar = {
      type: navbarComponentName,
      props: ensureAnchor(
        ensurePropsId(
          normalizeBlockProps(
            navbarComponentName,
            applyLinkGraphToNavbarProps({ ...(fallbackNavbarProps as Record<string, unknown>) }, linkGraph),
            { logChanges: true, summary: normalizationSummary }
          ),
          navbarId
        ),
        "top"
      ),
      _key: `navbar:${page.path ?? pageIndex}:canonical`,
    };
    const canonicalFooter = {
      type: footerFallbackComponentName,
      props: ensureAnchor(
        ensurePropsId(
          normalizeBlockProps(
            footerFallbackComponentName,
            applyLinkGraphToFooterProps({ ...(fallbackFooterProps as Record<string, unknown>) }, linkGraph),
            { logChanges: true, summary: normalizationSummary }
          ),
          footerId
        ),
        "footer"
      ),
      _key: `footer:${page.path ?? pageIndex}:canonical`,
    };
    const hrefRank = (href: string) => {
      const normalized = normalizePromptPagePath(String(href || "/"));
      return navTypeRank.get(inferEnterprisePageTypeFromPath(normalized)) ?? 99;
    };
    const buildOrderedNavLinks = () => {
      const graphLinks = Array.isArray(linkGraph.navigationLinks) ? linkGraph.navigationLinks : [];
      const normalizedLinks = graphLinks
        .map((link: any) => {
          const rawHref = String(link?.href || "").trim();
          const href = rawHref.startsWith("/") ? normalizePromptPagePath(rawHref) : rawHref;
          if (!href || /^#/.test(href)) return null;
          if (href === "/privacy" || href === "/terms") return null;
          const rawLabel =
            String(link?.label || "").trim() ||
            String(pageNameByPath.get(href) || "").trim() ||
            defaultPageLabelForPath(href, state.prompt ?? "");
          const label = resolveLocalizedPageLabel(rawLabel, href, state.prompt ?? "");
          return {
            ...link,
            href,
            label,
            variant: String(link?.variant || "link"),
          };
        })
        .filter((link): link is { label: string; href: string; variant: string } => Boolean(link));
      const deduped = Array.from(
        normalizedLinks.reduce((acc, link) => {
          if (!acc.has(link.href)) acc.set(link.href, link);
          return acc;
        }, new Map<string, { label: string; href: string; variant: string }>())
      ).map((entry) => entry[1]);
      return deduped
        .sort((left, right) => {
          const rankDiff = hrefRank(left.href) - hrefRank(right.href);
          if (rankDiff !== 0) return rankDiff;
          if (left.href === "/" || right.href === "/") return left.href === "/" ? -1 : 1;
          return left.href.localeCompare(right.href);
        })
        .map((link) => ({ ...link, variant: "link" as const }));
    };
    const finalizeTemplateNavbarProps = (props: Record<string, unknown>) => {
      const fallbackNav = { ...(fallbackNavbarProps as Record<string, unknown>) };
      const orderedLinks = buildOrderedNavLinks();
      const compactNavText = orderedLinks.map((link: any) => String(link?.label || "")).filter(Boolean).join(" | ");
      const brandText = String(
        ((designNorthStar as any)?.brand as string) ||
          extractBrandNameFromPromptLite(state.prompt ?? "") ||
          (fallbackNav as any).logoText ||
          props.logoText ||
          "Brand"
      );
      const primaryCta =
        String(structuredBrief?.heroCtas?.[0] || "").trim() ||
        String((fallbackNav as any).ctatexttext || "").trim() ||
        localeDefaults.contact;
      props.logo = (fallbackNav as any).logo || { alt: brandText };
      props.logoText = brandText;
      props.logotext = brandText;
      props.logotexttext = brandText;
      props.brandtext = brandText.toUpperCase();
      props.links = orderedLinks;
      props.ctas = [];
      props.navtext = compactNavText;
      props.navhref = "/";
      props.toplinkstext = compactNavText;
      props.toplinkshref = "/";
      props.actionstext = primaryCta;
      props.actionshref = "/contact";
      props.ctahtxttext = primaryCta;
      props.ctahtxthref = "/contact";
      props.logintxttext = localeDefaults.contact;
      props.logintxthref = "/contact";
      props.searchtxttext = "";
      props.searchtxthref = "/";
      props.langtxttext = localeDefaults.languageTag;
      props.langtxthref = "/";
      props.utilitytext = localeDefaults.utility;
      props.utilityhref = "/";
      return props;
    };
    const finalizeTemplateFooterProps = (props: Record<string, unknown>) => {
      const fallbackFooter = { ...(fallbackFooterProps as Record<string, unknown>) };
      const footerBrand = String(
        ((designNorthStar as any)?.brand as string) ||
          extractBrandNameFromPromptLite(state.prompt ?? "") ||
          (fallbackFooter as any).logoText ||
          "Brand"
      );
      const uppercaseFooterBrand = footerBrand.toUpperCase();
      const existingColumns = Array.isArray((fallbackFooter as any).columns) ? (fallbackFooter as any).columns : [];
      const footerColumns =
        Array.isArray(linkGraph.footerColumns) && linkGraph.footerColumns.length > 0
          ? linkGraph.footerColumns.map((column) => ({
              title: String(column?.title || ""),
              links: Array.isArray(column?.links)
                ? column.links.map((link) => ({
                    label: String(link?.label || ""),
                    href: String(link?.href || "/"),
                    variant: (link?.variant as any) || "link",
                  }))
                : [],
            }))
          : existingColumns.length > 0
          ? existingColumns
          : (() => {
              const orderedLinks = buildOrderedNavLinks();
              const productLinks = orderedLinks.filter((link) => {
                const pageType = inferEnterprisePageTypeFromPath(link.href);
                return pageType === "products" || pageType === "solutions" || pageType === "cases";
              });
              const companyLinks = orderedLinks.filter((link) => {
                const pageType = inferEnterprisePageTypeFromPath(link.href);
                return pageType === "about" || pageType === "contact" || pageType === "support";
              });
              const legalLinks = orderedLinks.filter((link) => {
                const pageType = inferEnterprisePageTypeFromPath(link.href);
                return pageType === "legal";
              });
              return [
                {
                  title: localeDefaults.productsTitle,
                  links: productLinks.slice(0, 3),
                },
                {
                  title: localeDefaults.company,
                  links: companyLinks.slice(0, 3),
                },
                {
                  title: localeDefaults.legalTitle,
                  links: legalLinks.length
                    ? legalLinks.slice(0, 2)
                    : [{ label: localeDefaults.privacy, href: "/privacy", variant: "link" }],
                },
              ].filter((column) => Array.isArray(column.links) && column.links.length > 0);
            })();
      const flattenedFooterLinks = footerColumns.flatMap((column: any) => column.links || []);
      const copyrightText = String(
        structuredBrief?.copyright ||
        (state.prompt ?? "").match(/Copyright\s*(?:©|&copy;)?\s*\d{4}[^\n]*/i)?.[0] ||
          (fallbackFooter as any).copytext ||
          (fallbackFooter as any).legal ||
          localeDefaults.defaultRights(footerBrand)
      );
      props.logoText = footerBrand;
      props.flogotext = footerBrand;
      props.ftlogotext = footerBrand;
      props.footerBrandtext = uppercaseFooterBrand;
      props.brandtext = uppercaseFooterBrand;
      props.columns = footerColumns;
      props.legal = copyrightText;
      props.copytext = copyrightText;
      props.fcopytext = copyrightText;
      props.fcopyhref = "/privacy";
      footerColumns.slice(0, 4).forEach((column: any, index: number) => {
        const slot = index + 1;
        const firstLink = (column.links || [])[0];
        props[`fcol${slot}text`] = column.title;
        props[`fcol${slot}href`] = firstLink?.href || "/";
        props[`col${slot}titletext`] = column.title;
        props[`col${slot}titlehref`] = firstLink?.href || "/";
        props[`col${slot}texttext`] = (column.links || []).map((link) => link.label).filter(Boolean).join(" | ");
        props[`col${slot}texthref`] = firstLink?.href || "/";
      });
      props.footercompanytext = String(
        structuredBrief?.address ||
          (fallbackFooter as any).footercompanytext ||
          (fallbackFooter as any).footeraddresstext ||
          localeDefaults.addressFallback
      );
      props.footercompanyhref = "/about";
      props.footeraddresstext = String(
        structuredBrief?.address ||
          (fallbackFooter as any).footeraddresstext ||
          localeDefaults.addressFallback
      );
      props.footeraddresshref = "/about";
      props.footercontacttext = String(
        structuredBrief?.whatsapp ||
          structuredBrief?.email ||
          (fallbackFooter as any).footercontacttext ||
          localeDefaults.contact
      );
      props.footercontacthref = "/contact";
      props.fdesctext = flattenedFooterLinks.map((link) => link.label).filter(Boolean).join(" • ");
      props.fdeschref = "/contact";
      return props;
    };
    const content = page.data.content.filter(Boolean);
    const shouldPreserveTemplateChrome =
      activeSectionGenerationStrategy === "template_first" && Boolean(templateResolution.profileId);
    const existingTemplateNavbar = shouldPreserveTemplateChrome
      ? content.find((item: any) => isNavbarLikeBlock(item) && isTemplateExclusiveBlock(item))
      : null;
    const existingTemplateFooter = shouldPreserveTemplateChrome
      ? content.find((item: any) => isFooterLikeBlock(item) && isTemplateExclusiveBlock(item))
      : null;
    const preservedNavbar =
      existingTemplateNavbar && typeof existingTemplateNavbar === "object"
        ? {
            ...existingTemplateNavbar,
            props: ensureAnchor(
              ensurePropsId(
                finalizeTemplateNavbarProps(
                  sanitizeSemanticProps(
                    sanitizeInternalHrefsInProps(
                      sanitizeGeneratedProps(
                      { ...((existingTemplateNavbar as any).props || {}) },
                      {
                        prompt: state.prompt ?? "",
                        designNorthStar: designNorthStar as Record<string, unknown>,
                        profileId: templateResolution.profileId ?? null,
                      }
                      ) as Record<string, unknown>,
                      linkGraph
                    ),
                    linkGraph,
                    page.path || "/"
                  ) as Record<string, unknown>
                ),
                String(((existingTemplateNavbar as any)?.props?.id as string) || "navbar-template")
              ),
              "top"
            ),
            _key: `navbar:${page.path ?? pageIndex}:canonical`,
          }
        : canonicalNavbar;
    const preservedFooter =
      existingTemplateFooter && typeof existingTemplateFooter === "object"
        ? {
            ...existingTemplateFooter,
            props: ensureAnchor(
              ensurePropsId(
                finalizeTemplateFooterProps(
                  sanitizeSemanticProps(
                    sanitizeInternalHrefsInProps(
                      sanitizeGeneratedProps(
                      { ...((existingTemplateFooter as any).props || {}) },
                      {
                        prompt: state.prompt ?? "",
                        designNorthStar: designNorthStar as Record<string, unknown>,
                        profileId: templateResolution.profileId ?? null,
                      }
                      ) as Record<string, unknown>,
                      linkGraph
                    ),
                    linkGraph,
                    page.path || "/"
                  ) as Record<string, unknown>
                ),
                String(((existingTemplateFooter as any)?.props?.id as string) || "footer-template")
              ),
              "footer"
            ),
            _key: `footer:${page.path ?? pageIndex}:canonical`,
          }
        : canonicalFooter;
    const body = content.filter(
      (item: any) =>
        item &&
        !isNavbarLikeBlock(item) &&
        !isFooterLikeBlock(item) &&
        !String(item?._key || "").startsWith("navbar:") &&
        !String(item?._key || "").startsWith("footer:")
    );
    const nonThemeDrivenBody = body.filter((item: any) => !isContactLikeBlock(item) && !isCtaLikeBlock(item));
    const themeDrivenBody = body.filter((item: any) => isContactLikeBlock(item) || isCtaLikeBlock(item));

    if (page.path === "/contact") {
      const contactContext = buildSyntheticSectionContext(
        pageIndex,
        "contact",
        localeDefaults.useChinese ? "联系" : "Contact",
        localeDefaults.useChinese ? "提供咨询与线索收集入口。" : "Provide contact and consultation pathways."
      );
      const fallbackContact = buildDeterministicFallbackBlock(
        contactContext,
        state.prompt ?? "",
        designNorthStar as Record<string, unknown>,
        theme as Record<string, unknown>,
        { skipRegistry: true }
      );
      const existingLeadCapture = themeDrivenBody.find((item: any) =>
        /leadcapturecta/i.test(String(item?.type || ""))
      );
      const baseContactBlock =
        existingLeadCapture ??
        {
          type: fallbackContact.type,
          props: fallbackContact.props,
          _key: `${page.path}:contact:canonical`,
        };
      const contactProps =
        baseContactBlock?.props && typeof baseContactBlock.props === "object"
          ? { ...(baseContactBlock.props as Record<string, unknown>) }
          : {};
      if (typeof structuredBrief?.contactTitle === "string" && structuredBrief.contactTitle.trim()) {
        contactProps.title = structuredBrief.contactTitle.trim();
      }
      if (typeof structuredBrief?.consentText === "string" && structuredBrief.consentText.trim()) {
        contactProps.note = structuredBrief.consentText.trim();
      }
      contactProps.showForm = true;
      if (typeof contactProps.submitLabel !== "string" || !String(contactProps.submitLabel).trim()) {
        contactProps.submitLabel = localeDefaults.useChinese ? "提交询盘" : "Submit Request";
      }
      Object.assign(contactProps, enforceContactTextStyleProps(contactProps));
      const contactBlock = {
        ...baseContactBlock,
        type: "LeadCaptureCTA",
        props: contactProps,
      };
      page.data.content = dedupeComposedPageContent(
        [preservedNavbar, ...nonThemeDrivenBody, contactBlock, preservedFooter],
        page.path || "/"
      );
      return;
    }

    const ctaBlock = themeDrivenBody.length > 0 ? themeDrivenBody[themeDrivenBody.length - 1] : null;
    if (nonThemeDrivenBody.length === 0) {
      const pageToken = toSlug(page.path || `page-${pageIndex + 1}`) || `page-${pageIndex + 1}`;
      const pagePath = normalizePromptPagePath(String(page.path || "/"));
      const pageType = inferEnterprisePageTypeFromPath(pagePath);
      const recoveryPlanByPageType: Record<string, Array<{ kind: string; label: string; intent: string }>> = {
        home: [
          {
            kind: "hero",
            label: "Hero",
            intent: localeDefaults.useChinese ? "呈现核心价值与行业定位。" : "Present value proposition and market focus.",
          },
          {
            kind: "products",
            label: "Products",
            intent: localeDefaults.useChinese ? "展示核心产品与参数卖点。" : "Show core products and specification highlights.",
          },
          {
            kind: "socialproof",
            label: "Trust",
            intent: localeDefaults.useChinese ? "展示客户案例与交付证明。" : "Provide customer proof and delivery evidence.",
          },
        ],
        products: [
          {
            kind: "hero",
            label: "Catalog Hero",
            intent: localeDefaults.useChinese ? "引导产品选型与参数比对。" : "Guide product selection and spec comparison.",
          },
          {
            kind: "products",
            label: "Catalog",
            intent: localeDefaults.useChinese ? "提供结构化机型目录。" : "Provide a structured model catalog.",
          },
          {
            kind: "approach",
            label: "Capabilities",
            intent: localeDefaults.useChinese ? "补充工艺能力与交付优势。" : "Add process capability and delivery strengths.",
          },
        ],
        solutions: [
          {
            kind: "hero",
            label: "Solutions Hero",
            intent: localeDefaults.useChinese ? "聚焦行业场景与方案价值。" : "Highlight scenario fit and solution value.",
          },
          {
            kind: "approach",
            label: "Approach",
            intent: localeDefaults.useChinese ? "给出问题-方法-结果的方案路径。" : "Show problem-method-outcome approach.",
          },
          {
            kind: "story",
            label: "Execution Story",
            intent: localeDefaults.useChinese ? "说明落地流程与保障机制。" : "Describe delivery flow and safeguards.",
          },
        ],
        cases: [
          {
            kind: "hero",
            label: "Cases Hero",
            intent: localeDefaults.useChinese ? "引导浏览应用案例场景。" : "Guide users into application case stories.",
          },
          {
            kind: "socialproof",
            label: "Case Results",
            intent: localeDefaults.useChinese ? "展示案例结果与量化收益。" : "Present case outcomes and quantified impact.",
          },
          {
            kind: "products",
            label: "Related Products",
            intent: localeDefaults.useChinese ? "关联案例对应机型与能力。" : "Map cases to relevant products and capabilities.",
          },
        ],
        about: [
          {
            kind: "hero",
            label: "About Hero",
            intent: localeDefaults.useChinese ? "突出公司定位与发展方向。" : "Highlight company positioning and direction.",
          },
          {
            kind: "story",
            label: "Company Story",
            intent: localeDefaults.useChinese ? "补充发展历程与组织能力。" : "Add company history and organization capability.",
          },
          {
            kind: "approach",
            label: "Core Capabilities",
            intent: localeDefaults.useChinese ? "展示制造、研发与服务能力。" : "Show manufacturing, R&D, and service capabilities.",
          },
        ],
        legal: [
          {
            kind: "story",
            label: "Legal Content",
            intent: localeDefaults.useChinese ? "提供法律与隐私相关条款正文。" : "Provide legal and privacy policy content.",
          },
        ],
      };
      const typeOverrideByKind = (kind: string) => {
        if (kind === "hero") {
          if (pageType === "products" || pageType === "about" || pageType === "support") return "HeroCentered";
          return "HeroSplit";
        }
        if (kind === "products") return "CardsGrid";
        if (kind === "approach") return "FeatureGrid";
        if (kind === "socialproof") return "TestimonialsGrid";
        if (kind === "story") return "ContentStory";
        return "ContentStory";
      };
      const recoveryPlan =
        recoveryPlanByPageType[pageType] ||
        (pageType === "contact"
          ? []
          : [
              {
                kind: "hero",
                label: "Hero",
                intent: localeDefaults.useChinese ? "呈现页面核心价值。" : "Present page value proposition.",
              },
              {
                kind: "story",
                label: "Story",
                intent: localeDefaults.useChinese ? "说明核心差异化能力。" : "Explain core differentiation.",
              },
              {
                kind: "approach",
                label: "Highlights",
                intent: localeDefaults.useChinese ? "展示关键能力亮点。" : "Show capability highlights.",
              },
            ]);
      const recoveredBodyBlocks = recoveryPlan.map((entry, index) => {
        const fallback = buildDeterministicFallbackBlock(
          buildSyntheticSectionContext(
            pageIndex,
            `${pageToken}-${entry.kind}-${index + 1}`,
            entry.label,
            entry.intent
          ),
          state.prompt ?? "",
          designNorthStar as Record<string, unknown>,
          theme as Record<string, unknown>,
          { skipRegistry: true }
        );
        const props =
          fallback.props && typeof fallback.props === "object"
            ? ({ ...(fallback.props as Record<string, unknown>) } as Record<string, unknown>)
            : {};
        if (typeof props.id !== "string" || !props.id.trim()) {
          props.id = `${entry.kind}-${pageToken}-recovered-${index + 1}`;
        }
        if (typeof props.anchor !== "string" || !props.anchor.trim()) {
          props.anchor = entry.kind === "socialproof" ? "social-proof" : entry.kind;
        }
        return {
          type: typeOverrideByKind(entry.kind),
          props,
          _key: `${page.path}:${entry.kind}:recovered:${index}`,
        };
      });
      const shouldAddRecoveredCta = pageType !== "legal" && pageType !== "contact";
      const ctaFallback =
        shouldAddRecoveredCta
          ? ctaBlock ?? {
              type: "LeadCaptureCTA",
              props: {
                id: `${pageToken}-cta-recovered`,
                anchor: "footer-cta",
                title: localeDefaults.useChinese ? "立即开启项目" : "Start your project",
                subtitle: localeDefaults.useChinese
                  ? "与团队沟通，获取匹配业务场景的方案。"
                  : "Talk with our team and get a tailored plan.",
                cta: {
                  label: localeDefaults.useChinese ? "联系销售" : "Contact Sales",
                  href: "/contact",
                  variant: "primary",
                },
                variant: "card",
              },
              _key: `${page.path}:cta:recovered`,
            }
          : null;
      page.data.content = dedupeComposedPageContent(
        [preservedNavbar, ...recoveredBodyBlocks, ...(ctaFallback ? [ctaFallback] : []), preservedFooter],
        page.path || "/"
      );
      logWarn(`${logPrefix} builder:page_body_recovered`, {
        pagePath: page.path,
        pageType,
        reason: "empty_non_theme_body",
        recoveredKinds: recoveryPlan.map((entry) => entry.kind),
      });
      return;
    }
    page.data.content = dedupeComposedPageContent(
      [preservedNavbar, ...nonThemeDrivenBody, ...(ctaBlock ? [ctaBlock] : []), preservedFooter],
      page.path || "/"
    );
  });

  const templateExclusiveTypes = new Set<string>();
  pagesOut.forEach((page) => {
    page.data.content.forEach((item: any) => {
      const originalType = typeof item?.type === "string" ? item.type : "";
      if (!/^TemplateExclusive/i.test(originalType)) return;
      templateExclusiveTypes.add(originalType);
      const nextProps = item?.props && typeof item.props === "object" ? { ...item.props } : {};
      nextProps.__publishedOriginalType = originalType;
      item.props = nextProps;
    });
  });

  if (templateExclusiveTypes.size > 0) {
    const resolvedTemplateExclusiveComponents = await Promise.all(
      Array.from(templateExclusiveTypes).map((type) => resolveTemplateExclusiveRuntimeComponent(type))
    );
    resolvedTemplateExclusiveComponents.forEach((component) => {
      if (!component) return;
      const existing = componentsMap.get(component.name);
      if (existing && existing.code !== component.code) {
        errors.push(`builder_component_conflict:${component.name}`);
        return;
      }
      if (!existing) {
        componentsMap.set(component.name, component);
      }
    });
  }

  const needsFallbackComponent = pagesOut.some((page) =>
    page.data.content.some((item: any) => item?.type === fallbackComponentName)
  );
  const needsFooterFallbackComponent = pagesOut.some((page) =>
    page.data.content.some((item: any) => item?.type === footerFallbackComponentName)
  );

  if (needsFallbackComponent) {
    const existing = componentsMap.get(fallbackComponentName);
    if (existing && existing.code !== fallbackComponentCode) {
      errors.push(`builder_component_conflict:${fallbackComponentName}`);
    } else if (!existing) {
      componentsMap.set(fallbackComponentName, { name: fallbackComponentName, code: fallbackComponentCode });
    }
  }
  if (needsFooterFallbackComponent || injectedFooterBlocks > 0) {
    const existing = componentsMap.get(footerFallbackComponentName);
    if (existing && existing.code !== footerFallbackComponentCode) {
      errors.push(`builder_component_conflict:${footerFallbackComponentName}`);
    } else if (!existing) {
      componentsMap.set(footerFallbackComponentName, {
        name: footerFallbackComponentName,
        code: footerFallbackComponentCode,
      });
    }
  }
  if (injectedCtaBlocks > 0) {
    logInfo(`${logPrefix} builder:cta_injected_summary`, {
      pages: injectedCtaBlocks,
      reason: "missing_cta_block",
    });
  }

  const summaryText = formatSummary(normalizationSummary);
  if (summaryText) {
    logInfo(`${logPrefix} design-system:summary`, { summary: summaryText });
  }
  if (demotedThemeDrivenBlocks > 0) {
    logInfo(`${logPrefix} builder:theme_driven_demoted`, {
      count: demotedThemeDrivenBlocks,
    });
  }

  const report = guardian.postGenerateCheck(pagesOut);
  logInfo(`${logPrefix} guardian:postcheck`, {
    score: report.score,
    issues: report.issues.slice(0, 10),
    suggestions: report.suggestions,
  });
  if (planning) {
    await planning.markPostcheckComplete();
  }

  const shouldPreserveTemplateTheme =
    activeSectionGenerationStrategy === "template_first" && Boolean(templateResolution.profileId);
  let lockedTheme = shouldPreserveTemplateTheme
    ? ({ ...(theme && typeof theme === "object" ? (theme as Record<string, unknown>) : {}) } as Record<string, unknown>)
    : lockThemeByVisualHint(
        theme && typeof theme === "object" ? (theme as Record<string, unknown>) : {},
        state.prompt ?? ""
      );
  if (structuredBrief?.palette) {
    const currentPalette =
      lockedTheme?.palette && typeof lockedTheme.palette === "object"
        ? (lockedTheme.palette as Record<string, unknown>)
        : {};
    lockedTheme = {
      ...lockedTheme,
      mode: structuredBrief.mode || lockedTheme?.mode,
      palette: {
        ...currentPalette,
        ...structuredBrief.palette,
      },
      primaryColor: structuredBrief.palette.primary,
    };
  }
  pagesOut.forEach((page) => {
    const root = page?.data?.root;
    const rootProps = root?.props && typeof root.props === "object" ? root.props : {};
    const title =
      typeof (rootProps as Record<string, unknown>).title === "string" &&
      String((rootProps as Record<string, unknown>).title).trim()
        ? String((rootProps as Record<string, unknown>).title).trim()
        : String(page?.name || "Page");
    page.data.root = {
      ...(root && typeof root === "object" ? root : {}),
      props: {
        title,
        ...rootProps,
        theme: lockedTheme,
      },
    };
  });

  const shouldApplyStrictStructuredOverrides =
    Boolean(structuredBrief) ||
    looksLikeEnterpriseWebsite({ prompt: state.prompt ?? "", pages: pagesOut as any[] }) ||
    !llmProviders.length ||
    activeSectionGenerationStrategy === "template_first";
  if (shouldApplyStrictStructuredOverrides) {
    pagesOut = applyStructuredBriefOverrides(
      pagesOut,
      state.prompt ?? "",
      templateResolution.profileId ?? null,
      state.structuredInput ?? null
    );
  } else {
    logInfo(`${logPrefix} builder:structured_brief_override_skipped`, {
      reason: "llm_available_and_non_template_first",
      selectedStrategy: activeSectionGenerationStrategy,
    });
  }
  pagesOut = applyVisualMediaCoverage(pagesOut, state.prompt ?? "");
  pagesOut = sanitizeFinalPagesOutput(pagesOut, {
    prompt: state.prompt ?? "",
    designNorthStar: designNorthStar ?? undefined,
    profileId: templateResolution.profileId ?? null,
  });
  const promptTokenForCoverage = String(state.prompt || "").toLowerCase();
  const promptRequestsProductsCoverage =
    /(?:\bproducts?\b|\bcatalog\b|\bportfolio\b|\bsku\b|\bmachine\b|产品|机床|设备|机型|目录)/.test(
      promptTokenForCoverage
    );
  const promptRequestsSocialProofCoverage =
    /(?:\bcases?\b|\bcase\s*stud(?:y|ies)\b|\btestimonial(?:s)?\b|\breview(?:s)?\b|\bproof\b|\bcertification(?:s)?\b|案例|客户|口碑|资质|认证)/.test(
      promptTokenForCoverage
    );
  const promptRequestsCtaCoverage =
    /(?:\bcta\b|\bcall[\s-]?to[\s-]?action\b|\bget[\s-]?quote\b|\bbook\b|\bcontact(?:\s+sales)?\b|\brequest\b|行动召唤|立即咨询|立即联系|获取报价|预约|提交线索|联系我们)/.test(
      promptTokenForCoverage
    );
  const shouldEnforceEnterpriseHomeCoverage = looksLikeEnterpriseWebsite({
    prompt: state.prompt ?? "",
    pages: pagesOut as any[],
  });
  logInfo(`${logPrefix} builder:coverage_flags`, {
    products: promptRequestsProductsCoverage,
    socialproof: promptRequestsSocialProofCoverage,
    cta: promptRequestsCtaCoverage,
    enterprise: shouldEnforceEnterpriseHomeCoverage,
    pageCount: pagesOut.length,
  });
  const inferGeneratedSectionKind = (item: any): string => {
    const token = `${String(item?.type || "")} ${String(item?.props?.id || "")} ${String(item?.props?.anchor || "")}`.toLowerCase();
    if (/navigation|navbar|header|topnav|menu/.test(token)) return "navigation";
    if (/hero|masthead|banner|intro/.test(token)) return "hero";
    if (/story|content|timeline|about|mission/.test(token)) return "story";
    if (/approach|feature|process|workflow|capability|faq/.test(token)) return "approach";
    if (/product|catalog|showcase|pricing|plan/.test(token)) return "products";
    if (/social|proof|testimonial|logo|certification|case/.test(token)) return "socialproof";
    if (/contact|lead|form|quote/.test(token)) return "contact";
    if (/cta|calltoaction|call-to-action/.test(token)) return "cta";
    if (/footer|legal|copyright/.test(token)) return "footer";
    return "other";
  };
  const hasCoverageKindOnPage = (
    blocks: Array<{ type?: string; props?: Record<string, unknown> }>,
    kind: "products" | "socialproof" | "cta"
  ) => {
    return blocks.some((item) => {
      const typeToken = String(item?.type || "").toLowerCase();
      const idToken = String(item?.props?.id || "").toLowerCase();
      const anchorToken = String(item?.props?.anchor || "").toLowerCase();
      const variantToken = String(item?.props?.variant || "").toLowerCase();
      const token = `${typeToken} ${idToken} ${anchorToken} ${variantToken}`;
      if (kind === "products") {
        return /(product|catalog|showcase|pricing|plan|machine|sku)/.test(token);
      }
      if (kind === "cta") {
        const ctaToken = `${typeToken} ${idToken} ${anchorToken}`;
        if (/(navigation|navbar|header|menu|footer|copyright)/.test(typeToken)) return false;
        return /(cta|calltoaction|footercta|leadcapture|contactcta|quote)/.test(ctaToken);
      }
      return /(social|proof|testimonial|review|logo|trust|partner|certification)/.test(token);
    });
  };
  const ensurePromptCoverageKind = (
    inputPages: typeof pagesOut,
    kind: "products" | "socialproof" | "cta"
  ) => {
    const homeIndex = inputPages.findIndex((page) => normalizePromptPagePath(String(page?.path || "/")) === "/");
    const targetPageIndex = homeIndex >= 0 ? homeIndex : 0;
    const targetPage = inputPages[targetPageIndex];
    if (!targetPage) return inputPages;
    const targetContent = Array.isArray(targetPage?.data?.content) ? targetPage.data.content : [];
    const hasKindOnTargetPage =
      hasCoverageKindOnPage(targetContent as any[], kind) ||
      targetContent.some((item: any) => inferGeneratedSectionKind(item) === kind);
    if (hasKindOnTargetPage) return inputPages;
    const syntheticContext = buildSyntheticSectionContext(
      targetPageIndex,
      kind === "products" ? "products-coverage" : kind === "socialproof" ? "socialproof-coverage" : "cta-coverage",
      kind === "products" ? "Products" : kind === "socialproof" ? "Testimonials" : "FooterCTA",
      kind === "products"
        ? "Provide product coverage required by prompt."
        : kind === "socialproof"
          ? "Provide social proof coverage required by prompt."
          : "Provide a conversion CTA section required by prompt."
    );
    if (!syntheticContext) return inputPages;
    const fallback = buildDeterministicFallbackBlock(
      syntheticContext,
      state.prompt ?? "",
      designNorthStar as Record<string, unknown>,
      theme as Record<string, unknown>,
      { skipRegistry: true }
    );
    const coverageKey = `coverage:${kind}:${targetPage.path || targetPageIndex}`;
    const coverageBlock = {
      type: fallback.type,
      props: ensureAnchor(
        ensurePropsId(
          normalizeBlockProps(fallback.type, (fallback.props ?? {}) as Record<string, unknown>, {
            logChanges: true,
            summary: normalizationSummary,
          }),
          `${kind}-coverage`
        ),
        kind === "products" ? "products" : kind === "socialproof" ? "social-proof" : "cta"
      ),
      _key: coverageKey,
    } as any;
    if (fallback.type === fallbackComponentName && !componentsMap.has(fallbackComponentName)) {
      componentsMap.set(fallbackComponentName, { name: fallbackComponentName, code: fallbackComponentCode });
    }
    const content = Array.isArray(targetPage?.data?.content) ? [...targetPage.data.content] : [];
    const insertIndex = content.findIndex((item: any) => isCtaLikeBlock(item) || isFooterLikeBlock(item));
    if (insertIndex >= 0) {
      content.splice(insertIndex, 0, coverageBlock);
    } else {
      content.push(coverageBlock);
    }
    const nextPages = [...inputPages];
    nextPages[targetPageIndex] = {
      ...targetPage,
      data: {
        ...targetPage.data,
        content: dedupeComposedPageContent(content, targetPage.path || "/"),
      },
    };
    logWarn(`${logPrefix} builder:coverage_injected`, {
      pagePath: targetPage.path,
      kind,
      blockType: fallback.type,
    });
    return nextPages;
  };
  if (promptRequestsProductsCoverage || shouldEnforceEnterpriseHomeCoverage) {
    pagesOut = ensurePromptCoverageKind(pagesOut, "products");
  }
  if (promptRequestsSocialProofCoverage || shouldEnforceEnterpriseHomeCoverage) {
    pagesOut = ensurePromptCoverageKind(pagesOut, "socialproof");
  }
  if (promptRequestsCtaCoverage || shouldEnforceEnterpriseHomeCoverage) {
    pagesOut = ensurePromptCoverageKind(pagesOut, "cta");
  }
  const inferPlannedSectionKind = (section: { type?: string; id?: string }) => {
    const token = `${String(section?.type || "")} ${String(section?.id || "")}`.toLowerCase();
    if (/navigation|navbar|header|topnav|menu/.test(token)) return "navigation";
    if (/hero|masthead|banner|intro/.test(token)) return "hero";
    if (/story|content|timeline|about|mission/.test(token)) return "story";
    if (/approach|feature|process|workflow|capability|faq/.test(token)) return "approach";
    if (/product|catalog|showcase|pricing|plan/.test(token)) return "products";
    if (/social|proof|testimonial|logo|certification/.test(token)) return "socialproof";
    if (/contact|lead|form|quote/.test(token)) return "contact";
    if (/cta|calltoaction|call-to-action/.test(token)) return "cta";
    if (/footer|legal|copyright/.test(token)) return "footer";
    return "other";
  };
  const normalizePairPath = (value: unknown) => {
    const raw = String(value || "").trim();
    if (!raw) return "/";
    const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
    return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
  };
  const plannedRequiredKindsByPath = new Map<string, string[]>();
  pages.forEach((page) => {
    const path = normalizePairPath(page?.path || "/");
    const kinds = Array.from(
      new Set(
        (Array.isArray(page?.sections) ? page.sections : [])
          .map((section) => inferPlannedSectionKind({ type: section?.type, id: section?.id }))
          .filter((kind) => kind !== "other")
      )
    );
    plannedRequiredKindsByPath.set(path, kinds);
  });
  const outputLanguageForPageContract = resolveOutputLanguage(state.prompt ?? "");
  const pageContractReports: Array<{
    path: string;
    pageType: string;
    pass: boolean;
    issueCount: number;
    errorCount: number;
    warningCount: number;
  }> = [];
  pagesOut = pagesOut.map((page, pageIndex) => {
    const pagePath = normalizePairPath(page?.path || "/");
    const requiredSectionKinds = plannedRequiredKindsByPath.get(pagePath) || [];
    const pageContract = evaluateGeneratedPageContract({
      page,
      requiredSectionKinds,
      outputLanguage: outputLanguageForPageContract,
      expectedProductCount: resolveExpectedProductCountForPath({
        path: pagePath,
        structuredInput: state.structuredInput ?? null,
      }),
      expectedCaseCount: resolveExpectedCaseCountForPath({
        path: pagePath,
        structuredInput: state.structuredInput ?? null,
      }),
    });
    const pageErrors = pageContract.issues.filter((issue) => issue.severity === "error");
    const pageWarnings = pageContract.issues.filter((issue) => issue.severity === "warning");
    pageContractReports.push({
      path: pagePath,
      pageType: pageContract.pageType,
      pass: pageContract.pass,
      issueCount: pageContract.issues.length,
      errorCount: pageErrors.length,
      warningCount: pageWarnings.length,
    });
    pageWarnings.forEach((issue) => {
      logWarn(`${logPrefix} builder:page_contract_warning`, {
        path: pagePath,
        pageType: pageContract.pageType,
        code: issue.code,
        message: issue.message,
        details: issue.details,
      });
    });
    if (pageErrors.length === 0) return page;

    pageErrors.forEach((issue) => {
      logWarn(`${logPrefix} builder:page_contract_error`, {
        path: pagePath,
        pageType: pageContract.pageType,
        code: issue.code,
        message: issue.message,
        details: issue.details,
      });
    });
    errors.push(
      `page_contract_failed:${pagePath}:${pageErrors.map((issue) => issue.code).join("|") || "unknown"}`
    );

    const sourceContexts = contentSections.filter((context) => normalizePairPath(context.pagePath) === pagePath);
    if (!sourceContexts.length) return page;

    const existingContent = Array.isArray(page?.data?.content) ? page.data.content : [];
    const chromeBlocks = existingContent.filter((item: any) => isNavbarLikeBlock(item) || isFooterLikeBlock(item));
    const fallbackBlocks = sourceContexts.map((context) => {
      const fallback = buildDeterministicFallbackBlock(
        context,
        resolvePromptForPagePath(context.pagePath),
        designNorthStar as Record<string, unknown>,
        theme as Record<string, unknown>
      );
      if (fallback.type === fallbackComponentName) {
        const existing = componentsMap.get(fallbackComponentName);
        if (!existing) {
          componentsMap.set(fallbackComponentName, { name: fallbackComponentName, code: fallbackComponentCode });
        }
      }
      return {
        type: fallback.type,
        props: ensureAnchor(
          ensurePropsId(
            normalizeBlockProps(fallback.type, (fallback.props ?? {}) as Record<string, unknown>, {
              logChanges: true,
              summary: normalizationSummary,
            }),
            buildSectionKey(context)
          ),
          context.section.id
        ),
        _key: `${buildSectionKey(context)}:page-contract-recovery`,
      } as any;
    });

    const recoveredContent = dedupeComposedPageContent(
      [...chromeBlocks, ...fallbackBlocks],
      pagePath
    );
    logWarn(`${logPrefix} builder:page_contract_recovered`, {
      path: pagePath,
      pageType: pageContract.pageType,
      errors: pageErrors.map((issue) => issue.code),
      recoveredBlocks: recoveredContent.length,
    });
    return {
      ...page,
      data: {
        root:
          page?.data?.root && typeof page.data.root === "object"
            ? page.data.root
            : { props: { title: page.name, theme } },
        content: recoveredContent,
      },
    };
  });
  const pageContractFailedCount = pageContractReports.filter((item) => !item.pass).length;
  if (pageContractFailedCount > 0) {
    logWarn(`${logPrefix} builder:page_contract_gate`, {
      failedPages: pageContractFailedCount,
      totalPages: pageContractReports.length,
      failedPaths: pageContractReports.filter((item) => !item.pass).map((item) => item.path),
    });
  } else {
    logInfo(`${logPrefix} builder:page_contract_gate`, {
      failedPages: 0,
      totalPages: pageContractReports.length,
    });
  }
  // Re-enforce homepage semantic coverage after page-level recovery,
  // because recovery may replace generated content with deterministic blocks.
  if (promptRequestsProductsCoverage || shouldEnforceEnterpriseHomeCoverage) {
    pagesOut = ensurePromptCoverageKind(pagesOut, "products");
  }
  if (promptRequestsSocialProofCoverage || shouldEnforceEnterpriseHomeCoverage) {
    pagesOut = ensurePromptCoverageKind(pagesOut, "socialproof");
  }
  if (promptRequestsCtaCoverage || shouldEnforceEnterpriseHomeCoverage) {
    pagesOut = ensurePromptCoverageKind(pagesOut, "cta");
  }
  // Recovery can replace rich content with deterministic minimal blocks.
  // Re-apply structured enrichment and media coverage to keep density stable.
  if (pageContractFailedCount > 0 && shouldApplyStrictStructuredOverrides) {
    pagesOut = applyStructuredBriefOverrides(
      pagesOut,
      state.prompt ?? "",
      templateResolution.profileId ?? null,
      state.structuredInput ?? null
    );
    pagesOut = applyVisualMediaCoverage(pagesOut, state.prompt ?? "");
    logInfo(`${logPrefix} builder:post_contract_reenrichment`, {
      failedPages: pageContractFailedCount,
      pages: pagesOut.length,
    });
  }
  const enforceContactLeadCaptureOnPages = (inputPages: typeof pagesOut) =>
    inputPages.map((page) => {
      const pagePath = normalizePairPath(page?.path || "/");
      if (pagePath !== "/contact") return page;
      const content = Array.isArray(page?.data?.content) ? page.data.content : [];
      const navbar = content.find((item: any) => isNavbarLikeBlock(item));
      const footer = [...content].reverse().find((item: any) => isFooterLikeBlock(item));
      const body = content.filter((item: any) => !isNavbarLikeBlock(item) && !isFooterLikeBlock(item));
      const existingLeadCapture = body.find((item: any) => /leadcapturecta/i.test(String(item?.type || "")));
      const baseProps =
        existingLeadCapture?.props && typeof existingLeadCapture.props === "object"
          ? ({ ...(existingLeadCapture.props as Record<string, unknown>) } as Record<string, unknown>)
          : ({} as Record<string, unknown>);
      const contactProps = enforceContactTextStyleProps({
        ...baseProps,
        id:
          typeof baseProps.id === "string" && baseProps.id.trim()
            ? baseProps.id.trim()
            : "contact-form-main",
        anchor:
          typeof baseProps.anchor === "string" && baseProps.anchor.trim()
            ? baseProps.anchor.trim()
            : "contact",
        variant: "contact",
        showForm: true,
        title:
          typeof baseProps.title === "string" && baseProps.title.trim()
            ? baseProps.title.trim()
            : localeDefaults.useChinese
              ? "联系我们"
              : "Contact Our Team",
        subtitle:
          typeof baseProps.subtitle === "string" && baseProps.subtitle.trim()
            ? baseProps.subtitle.trim()
            : localeDefaults.useChinese
              ? "请提交需求信息，我们会尽快与您联系。"
              : "Share your requirements and we will follow up shortly.",
        cta:
          baseProps.cta && typeof baseProps.cta === "object"
            ? baseProps.cta
            : {
                label: localeDefaults.contact,
                href: "/contact",
                variant: "primary",
              },
        submitLabel:
          typeof baseProps.submitLabel === "string" && baseProps.submitLabel.trim()
            ? baseProps.submitLabel.trim()
            : localeDefaults.useChinese
              ? "提交询盘"
              : "Submit Request",
      });
      const contactBlock = {
        ...(existingLeadCapture && typeof existingLeadCapture === "object" ? existingLeadCapture : {}),
        type: "LeadCaptureCTA",
        props: ensureAnchor(ensurePropsId(contactProps, "contact-form-main"), "contact"),
        _key: `${pagePath}:contact:hard_gate`,
      } as any;
      const filteredBody = body.filter((item: any) => !isContactLikeBlock(item) && !isCtaLikeBlock(item));
      const rebuiltContent = dedupeComposedPageContent(
        [...(navbar ? [navbar] : []), ...filteredBody, contactBlock, ...(footer ? [footer] : [])],
        pagePath
      );
      return {
        ...page,
        data: {
          root:
            page?.data?.root && typeof page.data.root === "object"
              ? page.data.root
              : { props: { title: page.name, theme } },
          content: rebuiltContent,
        },
      };
    });
  pagesOut = enforceContactLeadCaptureOnPages(pagesOut);
  // Final hard pass: recovery/injection steps above may re-introduce template residue or stale hrefs.
  pagesOut = sanitizeFinalPagesOutput(pagesOut, {
    prompt: state.prompt ?? "",
    designNorthStar: designNorthStar ?? undefined,
    profileId: templateResolution.profileId ?? null,
  });
  const finalAvailablePaths = new Set(
    pagesOut
      .map((page) => normalizePromptPagePath(String(page.path || "/")))
      .filter((path) => path.startsWith("/"))
  );
  pagesOut = pagesOut.map((page) => ({
    ...page,
    data: {
      ...page.data,
      content: coerceContentInternalHrefsToAvailablePaths(
        Array.isArray(page?.data?.content) ? page.data.content : [],
        finalAvailablePaths
      ) as any,
    },
  }));
  const contractValidation = pageBuildMode
    ? { pass: true, issues: [] as ReturnType<typeof validateGeneratedSiteContract>["issues"] }
    : validateGeneratedSiteContract({
        prompt: state.prompt ?? "",
        pages: pagesOut as any[],
      });
  if (pageBuildMode) {
    logInfo(`${logPrefix} builder:contract_gate`, {
      pass: true,
      issueCount: 0,
      skipped: true,
      reason: "page_build_mode",
    });
  } else {
    logInfo(`${logPrefix} builder:contract_gate`, {
      pass: contractValidation.pass,
      issueCount: contractValidation.issues.length,
      errors: contractValidation.issues.filter((issue) => issue.severity === "error").length,
      warnings: contractValidation.issues.filter((issue) => issue.severity === "warning").length,
    });
    if (!contractValidation.pass) {
      errors.push(
        `contract_gate_failed:errors=${contractValidation.issues.filter((issue) => issue.severity === "error").length}:warnings=${contractValidation.issues.filter((issue) => issue.severity === "warning").length}`
      );
    }
    const contractWarnings = contractValidation.issues.filter((issue) => issue.severity === "warning");
    if (contractWarnings.length > 0) {
      contractWarnings.slice(0, 12).forEach((issue) => {
        logWarn(`${logPrefix} builder:contract_warning`, {
          code: issue.code,
          message: issue.message,
          details: issue.details,
        });
      });
    }
  }

  const qaReport = pageBuildMode
    ? {
        pass: true,
        coverageScore: 1,
        linkIntegrityScore: 1,
        themeConsistencyScore: 1,
        semanticFidelityScore: 1,
        overallScore: 1,
        details: {
          missingPages: [],
          brokenLinks: [],
          inconsistentThemePages: [],
          semanticHitPages: [],
          sourceBrandLeakPages: [],
          templateCopyPages: [],
          criticalDuplicatePairs: [],
        },
      }
    : evaluateGenerationQa({
        siteBlueprint,
        pages: pagesOut,
        linkGraph,
        prompt: state.prompt ?? "",
        thresholds: {
          coverage: Number(process.env.BUILDER_QA_COVERAGE_THRESHOLD || 0.85),
          linkIntegrity: Number(process.env.BUILDER_QA_LINK_THRESHOLD || 0.95),
          themeConsistency: Number(process.env.BUILDER_QA_THEME_THRESHOLD || 0.9),
          semantic: Number(process.env.BUILDER_QA_SEMANTIC_THRESHOLD || 0.9),
          overall: Number(process.env.BUILDER_QA_OVERALL_THRESHOLD || 0.9),
        },
      });
  if (pageBuildMode) {
    logInfo(`${logPrefix} builder:qa_gate`, {
      pass: true,
      skipped: true,
      reason: "page_build_mode",
    });
  } else {
    logInfo(`${logPrefix} builder:qa_gate`, {
      pass: qaReport.pass,
      coverageScore: qaReport.coverageScore,
      linkIntegrityScore: qaReport.linkIntegrityScore,
      themeConsistencyScore: qaReport.themeConsistencyScore,
      semanticFidelityScore: qaReport.semanticFidelityScore,
      overallScore: qaReport.overallScore,
      missingPages: qaReport.details.missingPages.join(","),
      brokenLinks: qaReport.details.brokenLinks.length,
      inconsistentThemePages: qaReport.details.inconsistentThemePages.join(","),
      semanticHitPages: qaReport.details.semanticHitPages.join(","),
      sourceBrandLeakPages: qaReport.details.sourceBrandLeakPages.join(","),
      templateCopyPages: (qaReport.details as any).templateCopyPages?.join(",") || "",
      criticalDuplicatePairs: (qaReport.details as any).criticalDuplicatePairs?.join(",") || "",
    });
    if (!qaReport.pass) {
      errors.push(
        `qa_gate_failed:coverage=${qaReport.coverageScore.toFixed(3)}:links=${qaReport.linkIntegrityScore.toFixed(3)}:theme=${qaReport.themeConsistencyScore.toFixed(3)}:semantic=${qaReport.semanticFidelityScore.toFixed(3)}:overall=${qaReport.overallScore.toFixed(3)}`
      );
    }
  }

  const generatedPaths = new Set(
    pagesOut
      .map((page) => (typeof page.path === "string" ? page.path : ""))
      .filter((path) => path && path.startsWith("/"))
  );
  const sanitizedMatchedPagePaths = (templateResolution.diagnostics.matchedPagePaths ?? []).filter((path) =>
    generatedPaths.has(path)
  );
  const adaptation = buildTemplateAdaptationSummary({
    prompt: state.prompt,
    profileId: templateResolution.profileId ?? null,
    pages: pagesOut,
  });
  const adaptationErrorCount = adaptation.findings.filter((finding) => finding.severity === "error").length;
  const adaptationWarningCount = adaptation.findings.filter((finding) => finding.severity === "warning").length;

  return {
    components: Array.from(componentsMap.values()),
    pages: pagesOut,
    theme: lockedTheme,
    globalChrome,
    siteBlueprint,
    qaReport,
    resolvedByLayer: {
      strategy: sectionGenerationStrategy,
      requestedStrategy: requestedSectionGenerationStrategy,
      selectedStrategy: activeSectionGenerationStrategy,
      templatePlanProfile: templateResolution.profileId ?? null,
      skeleton: siteBlueprint.skeleton,
      navLinks: linkGraph.navigationLinks.length,
      footerColumns: linkGraph.footerColumns.length,
      harmonizedNavbarBlocks,
      harmonizedFooterBlocks,
      resolutionLayer: templateResolution.layer,
      matchedPagePaths: sanitizedMatchedPagePaths,
      matchedPageCoverage: templateResolution.diagnostics.matchedPageCoverage,
      templateKinds: templateResolution.diagnostics.templateKinds,
      styleFamily: templateResolution.siteStyleShell?.styleFamily ?? null,
      motionProfile: templateResolution.siteStyleShell?.motionProfile ?? null,
      globalChrome,
      adaptation: {
        scenario: adaptation.scenario,
        templateFamily: adaptation.templateFamily,
        referenceMode: adaptation.referenceMode,
        errorCount: adaptationErrorCount,
        warningCount: adaptationWarningCount,
        findings: adaptation.findings,
        pageContracts: adaptation.pageContracts,
      },
      qa: {
        pass: qaReport.pass,
        coverageScore: qaReport.coverageScore,
        linkIntegrityScore: qaReport.linkIntegrityScore,
        themeConsistencyScore: qaReport.themeConsistencyScore,
        semanticFidelityScore: qaReport.semanticFidelityScore,
        overallScore: qaReport.overallScore,
      },
      contract: {
        pass: contractValidation.pass,
        normalizationIssueCount: contractNormalizationIssues.length,
        validationIssueCount: contractValidation.issues.length,
        pageIssueCount: pageContractReports.reduce((sum, item) => sum + item.issueCount, 0),
        pageFailedCount: pageContractReports.filter((item) => !item.pass).length,
        pageReports: pageContractReports,
        normalizationIssues: contractNormalizationIssues,
        validationIssues: contractValidation.issues,
      },
      scopedRag: scopedRagDiagnostics,
      skillOrchestration: {
        applied: skillOrchestrationApplied,
        suggestion: skillOrchestrationSuggestion,
        diagnostics: skillOrchestrationDiagnostics,
      },
    },
    errors,
  };
}

const hitlEnabled = parseEnvBoolean(process.env.BUILDER_HITL_ENABLED, false);
const hitlRequireApproval = parseEnvBoolean(process.env.BUILDER_HITL_REQUIRE_APPROVAL, false);

const shouldRunHitl = (state: GraphState) => {
  if (!hitlEnabled) return false;
  const blueprint =
    state.blueprint && typeof state.blueprint === "object"
      ? (state.blueprint as Record<string, unknown>)
      : null;
  if (blueprint && blueprint.__hitlApproved === true) return false;
  const manifest = state.manifest ?? {};
  const hitlConfig =
    manifest && typeof manifest === "object" && manifest.hitl && typeof manifest.hitl === "object"
      ? (manifest.hitl as Record<string, unknown>)
      : null;
  if (hitlConfig && hitlConfig.enabled === false) return false;
  const allowInterrupt = hitlConfig ? hitlConfig.mode === "interrupt" : false;
  if (!allowInterrupt) return false;
  return true;
};

const normalizePlannerPagePath = (value: unknown) => resolveCanonicalRoute(normalizePromptPagePath(String(value || "/")));

const inferPlannerSectionKind = (section: { type?: string; id?: string; intent?: string }) => {
  const token = `${String(section?.type || "")} ${String(section?.id || "")} ${String(section?.intent || "")}`
    .toLowerCase()
    .trim();
  if (/navigation|navbar|header|topnav|menu/.test(token)) return "navigation";
  if (/hero|masthead|banner|intro|pagehero/.test(token)) return "hero";
  if (/story|narrative|mission|vision|timeline|about/.test(token)) return "story";
  if (/approach|feature|capability|process|workflow|benefit|faq/.test(token)) return "approach";
  if (/product|catalog|collection|showcase|pricing|plan|machine|equipment/.test(token)) return "products";
  if (/social|proof|testimonial|review|trust|logo|partner|certification|case/.test(token)) return "socialproof";
  if (/contact|lead|inquiry|form|quote/.test(token)) return "contact";
  if (/cta|call.?to.?action|footercta|getstarted|start/.test(token)) return "cta";
  if (/footer|legal|copyright|bottom/.test(token)) return "footer";
  return "other";
};

const buildPlannerRagQueries = (input: {
  prompt: string;
  pagePath: string;
  pageName: string;
  pageType: ReturnType<typeof inferEnterprisePageTypeFromPath>;
  requiredSectionKinds: string[];
}) => {
  const useChinese = shouldUseChineseContent(input.prompt);
  const pageLabel = `${input.pageName || input.pagePath} ${input.pagePath}`.trim();
  const baseQueries = useChinese
    ? [`${input.prompt} ${pageLabel} 核心信息`, `${input.prompt} ${pageLabel} 参数 案例 资质`, `${pageLabel} 常见问题 联系方式`]
    : [
        `${input.prompt} ${pageLabel} company profile`,
        `${input.prompt} ${pageLabel} products specs case studies`,
        `${pageLabel} FAQ contact`,
      ];
  const pageSpecificQueries =
    input.pageType === "products"
      ? useChinese
        ? [`${input.prompt} 产品参数 型号 规格`, `${input.prompt} 产品应用场景 客户案例`]
        : [`${input.prompt} product specs model lineup`, `${input.prompt} product applications customer cases`]
      : input.pageType === "solutions"
        ? useChinese
          ? [`${input.prompt} 解决方案 流程 收益`, `${input.prompt} 行业痛点 交付成果`]
          : [`${input.prompt} solution workflow measurable outcomes`, `${input.prompt} industry pain points delivery results`]
        : input.pageType === "cases"
          ? useChinese
            ? [`${input.prompt} 应用案例 客户成果`, `${input.prompt} 案例 数据 成效`]
            : [`${input.prompt} application cases customer outcomes`, `${input.prompt} case metrics result impact`]
          : input.pageType === "about"
            ? useChinese
              ? [`${input.prompt} 公司简介 发展历程 资质认证`, `${input.prompt} 团队能力 交付规模`]
              : [`${input.prompt} company profile history certifications`, `${input.prompt} team capability delivery scale`]
            : input.pageType === "contact"
              ? useChinese
                ? [`${input.prompt} 联系方式 地址 电话 邮箱`, `${input.prompt} 询盘表单 字段 建议`]
                : [`${input.prompt} contact details address phone email`, `${input.prompt} quote form fields recommendations`]
              : input.pageType === "support"
                ? useChinese
                  ? [`${input.prompt} 售后支持 服务政策 FAQ`, `${input.prompt} 响应时间 保修范围`]
                  : [`${input.prompt} after-sales support policy FAQ`, `${input.prompt} response time warranty scope`]
                : input.pageType === "legal"
                  ? useChinese
                    ? [`${input.prompt} 隐私政策 条款 合规`, `${input.prompt} 数据处理 用户权利`]
                    : [`${input.prompt} privacy policy terms compliance`, `${input.prompt} data processing user rights`]
                  : [];
  const kindLabelMap = useChinese
    ? {
        navigation: "导航",
        hero: "首屏",
        story: "品牌故事",
        approach: "能力介绍",
        products: "产品展示",
        socialproof: "案例与背书",
        contact: "联系与表单",
        cta: "行动号召",
        footer: "页脚",
      }
    : {
        navigation: "navigation",
        hero: "hero section",
        story: "brand story",
        approach: "capabilities",
        products: "product showcase",
        socialproof: "proof and testimonials",
        contact: "contact and form",
        cta: "call to action",
        footer: "footer",
      };
  const sectionKindQueries = input.requiredSectionKinds.slice(0, 4).map((kind) => {
    const mapped = (kindLabelMap as Record<string, string>)[kind] || kind;
    return useChinese
      ? `${input.prompt} ${pageLabel} ${mapped} 内容素材`
      : `${input.prompt} ${pageLabel} ${mapped} content sources`;
  });
  return Array.from(new Set([...pageSpecificQueries, ...sectionKindQueries, ...baseQueries]))
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 8);
};

const resolveStructuredProductCount = (structuredInput: StructuredSiteInput | null | undefined) =>
  Array.isArray(structuredInput?.products) ? structuredInput!.products!.filter(Boolean).length : 0;

const resolveStructuredCaseCount = (structuredInput: StructuredSiteInput | null | undefined) =>
  Array.isArray(structuredInput?.cases) ? structuredInput!.cases!.filter(Boolean).length : 0;

const resolveExpectedProductCountForPath = (input: {
  path: string;
  structuredInput: StructuredSiteInput | null | undefined;
}) => {
  const total = resolveStructuredProductCount(input.structuredInput);
  if (total <= 0) return 0;
  const normalizedPath = normalizePromptPagePath(String(input.path || "/"));
  if (!normalizedPath.startsWith("/products")) return 0;
  const pageSize = clampPositiveInt(
    Number(input.structuredInput?.catalogPageSize || process.env.BUILDER_CATALOG_PAGE_SIZE || 12),
    12,
    6,
    24
  );
  if (normalizedPath === "/products") {
    return Math.min(total, pageSize);
  }
  const pageMatch = normalizedPath.match(/^\/products\/page-(\d+)$/i);
  if (pageMatch) {
    const pageIndex = Math.max(2, Number(pageMatch[1] || 2));
    const consumed = (pageIndex - 1) * pageSize;
    const remaining = Math.max(0, total - consumed);
    return Math.min(pageSize, remaining);
  }
  return 0;
};

const resolveExpectedCaseCountForPath = (input: {
  path: string;
  structuredInput: StructuredSiteInput | null | undefined;
}) => {
  const total = resolveStructuredCaseCount(input.structuredInput);
  if (total <= 0) return 0;
  const pageType = inferEnterprisePageTypeFromPath(normalizePromptPagePath(String(input.path || "/")));
  return pageType === "cases" ? total : 0;
};

const resolvePageBuildStrategy = (
  pageType: ReturnType<typeof inferEnterprisePageTypeFromPath>,
  plannerStrategy: SectionGenerationStrategy
): SectionGenerationStrategy => {
  if (pageType === "contact" || pageType === "legal") return "template_first";
  if (
    plannerStrategy === "template_first" &&
    (pageType === "home" ||
      pageType === "about" ||
      pageType === "products" ||
      pageType === "solutions" ||
      pageType === "cases" ||
      pageType === "support")
  ) {
    return "hybrid";
  }
  return plannerStrategy;
};

const emitGenerationProgress = (
  reporter: GenerationProgressReporter | undefined,
  stage: string,
  detail?: Record<string, unknown>
) => {
  if (!reporter) return;
  try {
    reporter({ stage, ...(detail && Object.keys(detail).length > 0 ? { detail } : {}) });
  } catch (error: any) {
    logWarn(`${logPrefix} generation:progress_report_failed`, {
      stage,
      message: error?.message ?? String(error),
    });
  }
};

const normalizeTemplateResolutionLayer = (value: unknown): LayeredTemplateResolution["layer"] => {
  const token = String(value || "").trim().toLowerCase();
  if (token === "full-site" || token === "page" || token === "section" || token === "block" || token === "llm") {
    return token as LayeredTemplateResolution["layer"];
  }
  return "llm";
};

const resolvePlannerGlobalChrome = (input: {
  templateResolution: LayeredTemplateResolution;
  fallback?: GlobalChromeContract | null;
}): GlobalChromeContract => {
  const fallback = input.fallback ?? {
    navigationBlockType: navbarComponentName,
    footerBlockType: footerFallbackComponentName,
    motionProfile: "subtle" as const,
  };
  const shell =
    input.templateResolution?.siteStyleShell && typeof input.templateResolution.siteStyleShell === "object"
      ? input.templateResolution.siteStyleShell
      : null;
  const normalizeMotion = (value: unknown): GlobalChromeContract["motionProfile"] => {
    const token = String(value || "").trim().toLowerCase();
    if (token === "none" || token === "subtle" || token === "showcase" || token === "immersive") {
      return token as GlobalChromeContract["motionProfile"];
    }
    return fallback.motionProfile;
  };
  const normalizeType = (value: unknown, defaultValue: string) => {
    const token = String(value || "").trim();
    return token && /^[A-Za-z][A-Za-z0-9_]*$/.test(token) ? token : defaultValue;
  };
  return {
    navigationBlockType: normalizeType(shell?.navigationBlockType, fallback.navigationBlockType),
    footerBlockType: normalizeType(shell?.footerBlockType, fallback.footerBlockType),
    motionProfile: normalizeMotion(shell?.motionProfile),
  };
};

const prepareBlueprintForPlanner = (input: {
  prompt: string;
  pages: ReturnType<typeof normalizePages>;
  requestedStrategy: SectionGenerationStrategy;
  lockApprovedPages?: boolean;
}): {
  pages: ReturnType<typeof normalizePages>;
  selectedStrategy: SectionGenerationStrategy;
  templateResolution: LayeredTemplateResolution;
  globalChrome: GlobalChromeContract;
  contractNormalizationIssues: Array<Record<string, unknown>>;
  skillOrchestration: {
    applied: boolean;
    suggestion: SectionGenerationStrategy | null;
    diagnostics: Record<string, unknown>;
  };
} => {
  const prompt = String(input.prompt || "");
  const lockApprovedPages = input.lockApprovedPages === true;
  let pages = normalizePages({ pages: input.pages as any });
  const plannerDiagnostics: Record<string, unknown> = {
    initialPages: pages.length,
    lockApprovedPages,
  };
  const requestedPages = lockApprovedPages ? [] : extractRequestedPagesFromPrompt(prompt);
  const structuredBrief = parseStructuredBrief(prompt);
  const hasStructuredNavContract = !lockApprovedPages && (structuredBrief?.nav?.length ?? 0) >= 3;
  const hasStructuredCatalogContract =
    !lockApprovedPages &&
    (hasStructuredCatalogContractSignal(structuredBrief) || hasStructuredCatalogContractSignalFromPrompt(prompt));
  plannerDiagnostics.requestedPages = requestedPages.length;
  plannerDiagnostics.hasStructuredNavContract = hasStructuredNavContract;
  plannerDiagnostics.hasStructuredCatalogContract = hasStructuredCatalogContract;
  if (requestedPages.length) {
    const byPath = new Map(pages.map((page) => [normalizePromptPagePath(String(page.path || "/")), page] as const));
    requestedPages.forEach((requested) => {
      if (byPath.has(requested.path)) return;
      byPath.set(requested.path, {
        path: requested.path,
        name: requested.name,
        sections: [],
      } as any);
    });
    pages = normalizePages({ pages: Array.from(byPath.values()) });
  }
  plannerDiagnostics.afterRequestedMergePages = pages.length;
  if (requestedPages.length >= 3 || hasStructuredNavContract) {
    const explicitPathSet = new Set<string>(["/"]);
    requestedPages.forEach((requested) => explicitPathSet.add(normalizePromptPagePath(String(requested.path || "/"))));
    if (Array.isArray(structuredBrief?.nav)) {
      structuredBrief.nav.forEach((label) => explicitPathSet.add(inferRequestedPagePathFromLabel(label)));
    }
    if (Array.isArray(structuredBrief?.footerLinks)) {
      structuredBrief.footerLinks.forEach((label) => explicitPathSet.add(inferRequestedPagePathFromLabel(label)));
    }
    explicitPathSet.add("/privacy");
    if (/(terms?|条款|服务条款|legal|tos)/i.test(prompt)) {
      explicitPathSet.add("/terms");
    }
    pages = normalizePages({
      pages: pages.filter((page) => explicitPathSet.has(normalizePromptPagePath(String(page.path || "/")))),
    });
  }
  plannerDiagnostics.afterExplicitFilterPages = pages.length;
  const plannerEnterpriseLike = looksLikeEnterpriseWebsite({ prompt, pages });
  plannerDiagnostics.enterpriseLike = plannerEnterpriseLike;
  if (!lockApprovedPages && plannerEnterpriseLike) {
    const existingPaths = new Set(pages.map((page) => normalizePromptPagePath(String(page.path || "/"))));
    const extraPages: Array<Record<string, unknown>> = [];
    if (!existingPaths.has("/privacy")) {
      extraPages.push({
        path: "/privacy",
        name: shouldUseChineseContent(prompt) ? "隐私政策" : "Privacy",
        sections: [],
      });
    }
    if (/(terms?|条款|服务条款|legal|tos)/i.test(prompt) && !existingPaths.has("/terms")) {
      extraPages.push({
        path: "/terms",
        name: shouldUseChineseContent(prompt) ? "服务条款" : "Terms",
        sections: [],
      });
    }
    if (extraPages.length > 0) {
      pages = normalizePages({
        pages: [...pages, ...(extraPages as any[])],
      });
    }
  }
  if (!lockApprovedPages && plannerEnterpriseLike) {
    if (hasStructuredCatalogContract) {
      pages = normalizePages({
        pages: ensureStructuredDualChainPages(pages as any[], prompt, structuredBrief),
      });
    } else if (requestedPages.length < 3 && !hasStructuredNavContract) {
      pages = normalizePages({
        pages: ensureEnterpriseSitePages(
          pages as any,
          (definition) =>
            ({
              path: definition.path,
              name: definition.name,
              sections: [],
            }) as any,
          {
            prompt,
            allowCoreProduct: /(core[-\s]?product|核心产品|旗舰产品|明星产品)/i.test(prompt),
          }
        ) as any,
      });
    }
  }
  plannerDiagnostics.afterEnterpriseEnsurePages = pages.length;
  logInfo(`${logPrefix} planner:pre_contract`, plannerDiagnostics);
  const contractNormalizationIssues: Array<Record<string, unknown>> = [];
  let selectedStrategy = input.requestedStrategy;
  let skillOrchestrationApplied = false;
  let skillOrchestrationSuggestion: SectionGenerationStrategy | null = null;
  let skillOrchestrationDiagnostics: Record<string, unknown> = {};

  const preTemplateContractNormalization = normalizePagesBySiteContract(pages as any[], { prompt });
  preTemplateContractNormalization.issues.forEach((issue) => {
    contractNormalizationIssues.push({ stage: "planner_pre_template", ...issue });
  });
  pages = normalizePages({ pages: preTemplateContractNormalization.pages as any });

  const skillOrchestration = orchestrateTemplateAndSectionCandidates({
    prompt,
    pages,
    strategy: selectedStrategy,
  });
  pages = normalizePages({ pages: skillOrchestration.pages as any });
  skillOrchestrationSuggestion = skillOrchestration.strategySuggestion;
  skillOrchestrationDiagnostics = {
    ...skillOrchestration.diagnostics,
    strategySuggestion: skillOrchestrationSuggestion,
  };
  if (skillOrchestrationSuggestion && skillOrchestrationSuggestion !== selectedStrategy) {
    const canOverrideStrategy =
      selectedStrategy === "hybrid" ||
      (selectedStrategy === "template_first" &&
        allowTemplateFirstUpshift &&
        (skillOrchestrationSuggestion === "hybrid" || skillOrchestrationSuggestion === "llm_first"));
    if (canOverrideStrategy) {
      selectedStrategy = skillOrchestrationSuggestion;
      skillOrchestrationApplied = true;
    }
  }

  const outputLanguage = resolveOutputLanguage(prompt);
  if (
    forceHybridForZhEnterpriseWhenTemplateFirst &&
    outputLanguage === "zh-CN" &&
    selectedStrategy === "template_first" &&
    looksLikeEnterpriseWebsite({ prompt, pages })
  ) {
    selectedStrategy = "hybrid";
    skillOrchestrationApplied = true;
  }

  let templateResolution = resolveTemplatePlan({
    prompt,
    pages,
    strategy: selectedStrategy,
  });
  pages = normalizePages({ pages: templateResolution.pages as any });

  const postTemplateContractNormalization = normalizePagesBySiteContract(pages as any[], { prompt });
  postTemplateContractNormalization.issues.forEach((issue) => {
    contractNormalizationIssues.push({ stage: "planner_post_template", ...issue });
  });
  pages = normalizePages({ pages: postTemplateContractNormalization.pages as any });
  if (!lockApprovedPages && plannerEnterpriseLike && hasStructuredCatalogContract) {
    pages = normalizePages({
      pages: ensureStructuredDualChainPages(pages as any[], prompt, structuredBrief),
    });
  }

  templateResolution = {
    ...templateResolution,
    layer: normalizeTemplateResolutionLayer(templateResolution.layer),
    pages,
  };

  return {
    pages,
    selectedStrategy,
    templateResolution,
    globalChrome: resolvePlannerGlobalChrome({ templateResolution }),
    contractNormalizationIssues,
    skillOrchestration: {
      applied: skillOrchestrationApplied,
      suggestion: skillOrchestrationSuggestion,
      diagnostics: skillOrchestrationDiagnostics,
    },
  };
};

async function sitePlannerNode(state: GraphState) {
  const blueprint = (state.blueprint ?? {}) as ArchitectBlueprint;
  let pages = normalizePages(blueprint);
  if (!pages.length) {
    const fallback = buildFallbackBlueprint(state.prompt ?? "");
    pages = normalizePages(fallback);
  }
  const prompt = String(state.prompt ?? "");
  const requestedStrategy = state.generationStrategy ?? sectionGenerationStrategy;
  const plannerPrepared = prepareBlueprintForPlanner({
    prompt,
    pages,
    requestedStrategy,
    lockApprovedPages: (blueprint as any)?.__hitlApproved === true,
  });
  pages = plannerPrepared.pages;
  const plannerPreparation: PlannerPreparationMetadata = {
    prepared: true,
    requestedStrategy,
    selectedStrategy: plannerPrepared.selectedStrategy,
    templatePlanProfile: plannerPrepared.templateResolution.profileId ?? null,
    resolutionLayer: plannerPrepared.templateResolution.layer,
    matchedPagePaths: plannerPrepared.templateResolution.diagnostics.matchedPagePaths ?? [],
    matchedPageCoverage: plannerPrepared.templateResolution.diagnostics.matchedPageCoverage ?? 0,
    templateKinds: plannerPrepared.templateResolution.diagnostics.templateKinds ?? [],
    styleFamily: plannerPrepared.templateResolution.siteStyleShell?.styleFamily ?? null,
    motionProfile: plannerPrepared.templateResolution.siteStyleShell?.motionProfile ?? null,
    globalChrome: plannerPrepared.globalChrome,
    contractNormalizationIssues: plannerPrepared.contractNormalizationIssues,
    skillOrchestration: plannerPrepared.skillOrchestration,
    pages,
  };
  const plannerPreparedBlueprint: ArchitectBlueprint = {
    ...(blueprint ?? {}),
    pages,
    __plannerPreparation: plannerPreparation,
  } as ArchitectBlueprint;
  const pageJobs: PageBuildJob[] = pages.map((page, pageIndex) => {
    const pagePath = normalizePlannerPagePath(page.path || "/");
    const pageName = String(page.name || (pageIndex === 0 ? "Home" : `Page ${pageIndex + 1}`));
    const pageType = inferEnterprisePageTypeFromPath(pagePath);
    const plannedKinds = Array.from(
      new Set(
        (Array.isArray(page.sections) ? page.sections : [])
          .map((section) =>
            inferPlannerSectionKind({
              type: section?.type,
              id: section?.id,
              intent: section?.intent,
            })
          )
          .filter((kind) => kind !== "other")
      )
    );
    const requiredSectionKinds = Array.from(
      new Set([...(resolveRequiredSectionKindsByPageType(pageType) || []), ...plannedKinds])
    );
    return {
      pageIndex,
      pagePath,
      pageName,
      pageType,
      requiredSectionKinds,
      ragQueries: buildPlannerRagQueries({
        prompt,
        pagePath,
        pageName,
        pageType,
        requiredSectionKinds,
      }),
      hardness: PAGE_HARDNESS_RULES_BY_TYPE[pageType] || PAGE_HARDNESS_RULES_BY_TYPE.generic,
      page: {
        ...page,
        path: pagePath,
        name: pageName,
      },
      strategy: resolvePageBuildStrategy(pageType, plannerPrepared.selectedStrategy),
    } as PageBuildJob;
  });

  let effectiveJobs = pageJobs;
  if (shouldRunHitl(state)) {
    const resume = interrupt<{
      stage: "site_planner";
      message: string;
      pages: Array<{
        path: string;
        name: string;
        pageType: string;
        sectionCount: number;
        requiredSectionKinds: string[];
        ragQueryCount: number;
      }>;
    }, { approved?: boolean; pages?: Array<{ path: string; name?: string }> | null }>({
      stage: "site_planner",
      message: "Confirm or revise site structure before page fan-out",
      pages: pageJobs.map((job) => ({
        path: job.pagePath,
        name: job.pageName,
        pageType: job.pageType,
        sectionCount: Array.isArray(job.page.sections) ? job.page.sections.length : 0,
        requiredSectionKinds: job.requiredSectionKinds,
        ragQueryCount: job.ragQueries.length,
      })),
    });
    if (hitlRequireApproval && (!resume || resume.approved !== true)) {
      throw new Error("hitl_site_plan_not_approved");
    }
    if (resume && Array.isArray(resume.pages) && resume.pages.length > 0) {
      const byPath = new Map(pageJobs.map((job) => [normalizePlannerPagePath(job.pagePath), job] as const));
      effectiveJobs = resume.pages
        .map((entry, index) => {
          const path = normalizePlannerPagePath(entry.path || "/");
          const matched = byPath.get(path);
          if (!matched) return null;
          const name = String(entry.name || matched.pageName || (index === 0 ? "Home" : `Page ${index + 1}`));
          return {
            ...matched,
            pageIndex: index,
            pagePath: path,
            pageName: name,
            page: {
              ...matched.page,
              path,
              name,
            },
          } as PageBuildJob;
        })
        .filter((item): item is PageBuildJob => Boolean(item));
      if (!effectiveJobs.length) effectiveJobs = pageJobs;
    }
  }

  logInfo(`${logPrefix} planner:site`, {
    pages: effectiveJobs.length,
    strategy: plannerPrepared.selectedStrategy,
    hitl: shouldRunHitl(state),
    pageTypes: effectiveJobs.map((job) => `${job.pagePath}:${job.pageType}`),
    ragQueries: effectiveJobs.reduce((sum, job) => sum + job.ragQueries.length, 0),
    prepared: true,
    layer: plannerPreparation.resolutionLayer,
    profileId: plannerPreparation.templatePlanProfile,
    matchedPageCoverage: plannerPreparation.matchedPageCoverage,
    globalChrome: plannerPreparation.globalChrome,
  });

  if (state.planning) {
    await state.planning.markBlueprintComplete(
      plannerPreparedBlueprint as Record<string, unknown>,
      effectiveJobs.map((job) => ({
        path: job.pagePath,
        name: job.pageName,
        sections: Array.isArray(job.page.sections) ? job.page.sections : [],
      }))
    );
  }

  return {
    blueprint: plannerPreparedBlueprint as Record<string, unknown>,
    globalChrome: plannerPreparation.globalChrome,
    generationStrategy: plannerPrepared.selectedStrategy,
    pageBuildJobs: effectiveJobs,
    pageBuildResults: [],
    currentPageJob: null,
    pageBuildMode: null,
    resolvedByLayer: {
      ...(state.resolvedByLayer ?? {}),
      plannerPreparation: {
        prepared: true,
        selectedStrategy: plannerPreparation.selectedStrategy,
        resolutionLayer: plannerPreparation.resolutionLayer,
        matchedPageCoverage: plannerPreparation.matchedPageCoverage,
        templatePlanProfile: plannerPreparation.templatePlanProfile,
        globalChrome: plannerPreparation.globalChrome,
        skillOrchestration: plannerPreparation.skillOrchestration,
      },
    },
  };
}

export type SitePlanPreviewPage = {
  path: string;
  name: string;
  pageType: ReturnType<typeof inferEnterprisePageTypeFromPath>;
  sectionCount: number;
  requiredSectionKinds: string[];
  ragQueryCount: number;
  strategy: SectionGenerationStrategy;
};

export type SitePlanPreviewResult = {
  pages: SitePlanPreviewPage[];
  globalChrome: GlobalChromeContract;
  requestedStrategy: SectionGenerationStrategy;
  selectedStrategy: SectionGenerationStrategy;
  resolutionLayer: LayeredTemplateResolution["layer"];
  templatePlanProfile: string | null;
  matchedPageCoverage: number;
};

export const previewP2WSitePlan = (input: {
  prompt: string;
  blueprint?: Record<string, unknown>;
  requestedStrategy?: SectionGenerationStrategy;
}): SitePlanPreviewResult => {
  const prompt = String(input.prompt ?? "");
  const sourceBlueprint = (input.blueprint ?? {}) as ArchitectBlueprint;
  let pages = normalizePages(sourceBlueprint);
  if (!pages.length) {
    const fallback = buildFallbackBlueprint(prompt);
    pages = normalizePages(fallback);
  }
  const requestedStrategy = input.requestedStrategy ?? sectionGenerationStrategy;
  const plannerPrepared = prepareBlueprintForPlanner({
    prompt,
    pages,
    requestedStrategy,
  });
  const previewJobs: SitePlanPreviewPage[] = plannerPrepared.pages.map((page, pageIndex) => {
    const pagePath = normalizePlannerPagePath(page.path || "/");
    const pageName = String(page.name || (pageIndex === 0 ? "Home" : `Page ${pageIndex + 1}`));
    const pageType = inferEnterprisePageTypeFromPath(pagePath);
    const plannedKinds = Array.from(
      new Set(
        (Array.isArray(page.sections) ? page.sections : [])
          .map((section) =>
            inferPlannerSectionKind({
              type: section?.type,
              id: section?.id,
              intent: section?.intent,
            })
          )
          .filter((kind) => kind !== "other")
      )
    );
    const requiredSectionKinds = Array.from(
      new Set([...(resolveRequiredSectionKindsByPageType(pageType) || []), ...plannedKinds])
    );
    return {
      path: pagePath,
      name: pageName,
      pageType,
      sectionCount: Array.isArray(page.sections) ? page.sections.length : 0,
      requiredSectionKinds,
      ragQueryCount: buildPlannerRagQueries({
        prompt,
        pagePath,
        pageName,
        pageType,
        requiredSectionKinds,
      }).length,
      strategy: resolvePageBuildStrategy(pageType, plannerPrepared.selectedStrategy),
    };
  });
  return {
    pages: previewJobs,
    globalChrome: plannerPrepared.globalChrome,
    requestedStrategy,
    selectedStrategy: plannerPrepared.selectedStrategy,
    resolutionLayer: plannerPrepared.templateResolution.layer,
    templatePlanProfile: plannerPrepared.templateResolution.profileId ?? null,
    matchedPageCoverage: Number(plannerPrepared.templateResolution.diagnostics.matchedPageCoverage ?? 0),
  };
};

const routePlannerToPageBuilders = (state: GraphState) => {
  const jobs = Array.isArray(state.pageBuildJobs) ? state.pageBuildJobs : [];
  if (!jobs.length) return "globalAssembler";
  const resolvePageBuilderNodeName = (pageType: string) => {
    switch (String(pageType || "generic")) {
      case "home":
        return "pageBuilderHome";
      case "products":
        return "pageBuilderProducts";
      case "solutions":
        return "pageBuilderSolutions";
      case "cases":
        return "pageBuilderCases";
      case "about":
        return "pageBuilderAbout";
      case "contact":
        return "pageBuilderContact";
      case "support":
        return "pageBuilderSupport";
      case "legal":
        return "pageBuilderLegal";
      case "pricing":
        return "pageBuilderPricing";
      case "blog":
        return "pageBuilderBlog";
      default:
        return "pageBuilderGeneric";
    }
  };
  return jobs.map(
    (job) =>
      new Send(resolvePageBuilderNodeName(job.pageType), {
        prompt: state.prompt ?? "",
        manifest: state.manifest ?? {},
        structuredInput: state.structuredInput ?? null,
        pageTypeSkillsEnabled: state.pageTypeSkillsEnabled ?? null,
        singleCandidateOnly: state.singleCandidateOnly ?? false,
        generationStrategy: state.generationStrategy ?? sectionGenerationStrategy,
        skillContext: state.skillContext ?? { architect: "", builder: "" },
        designSystemContext: state.designSystemContext ?? { master: "", pages: {} },
        blueprint: state.blueprint ?? {},
        globalChrome: state.globalChrome ?? {
          navigationBlockType: navbarComponentName,
          footerBlockType: footerFallbackComponentName,
          motionProfile: "subtle",
        },
        pageBuildJobs: jobs,
        currentPageJob: job,
        pageBuildMode: { enabled: true, path: job.pagePath },
      })
  );
};

const PageBuilderSubgraphState = Annotation.Root({
  prompt: Annotation<string>,
  manifest: Annotation<Record<string, unknown>>,
  structuredInput: Annotation<StructuredSiteInput | null>({
    value: (_left, right) => right,
    default: () => null,
  }),
  pageTypeSkillsEnabled: Annotation<boolean | null>({
    value: (_left, right) => right,
    default: () => null,
  }),
  singleCandidateOnly: Annotation<boolean>({
    value: (_left, right) => Boolean(right),
    default: () => false,
  }),
  generationStrategy: Annotation<SectionGenerationStrategy>({
    value: (_left, right) => right,
    default: () => sectionGenerationStrategy,
  }),
  skillContext: Annotation<{ architect: string; builder: string }>({
    value: (_left, right) => right,
    default: () => ({ architect: "", builder: "" }),
  }),
  designSystemContext: Annotation<DesignSystemContext>({
    value: (_left, right) => right,
    default: () => ({ master: "", pages: {} }),
  }),
  globalChrome: Annotation<GlobalChromeContract>({
    value: (_left, right) => right,
    default: () => ({
      navigationBlockType: navbarComponentName,
      footerBlockType: footerFallbackComponentName,
      motionProfile: "subtle",
    }),
  }),
  blueprint: Annotation<Record<string, unknown>>({
    value: (_left, right) => right,
    default: () => ({}),
  }),
  pageJob: Annotation<PageBuildJob | null>({
    value: (_left, right) => right,
    default: () => null,
  }),
  scopedPrompt: Annotation<string>({
    value: (_left, right) => right,
    default: () => "",
  }),
  scopedRagDiagnostics: Annotation<Record<string, unknown>>({
    value: (_left, right) => right,
    default: () => ({}),
  }),
  generatedResult: Annotation<PageBuildResult | null>({
    value: (_left, right) => right,
    default: () => null,
  }),
  result: Annotation<PageBuildResult | null>({
    value: (_left, right) => right,
    default: () => null,
  }),
});

type PageBuilderSubgraphStateType = typeof PageBuilderSubgraphState.State;

async function pageBuilderScopedRagNode(state: PageBuilderSubgraphStateType) {
  const pageJob = state.pageJob;
  if (!pageJob) {
    return { scopedPrompt: String(state.prompt ?? "").trim(), scopedRagDiagnostics: {} };
  }
  const pageTypeSkill = buildPageTypeSkillDirective({
    pagePath: pageJob.pagePath,
    pageName: pageJob.pageName,
    prompt: state.prompt ?? "",
    pageTypeSkillsEnabled: state.pageTypeSkillsEnabled ?? undefined,
  });
  const scopedRag = await buildScopedRagContextByPage({
    prompt: state.prompt ?? "",
    pages: [{ path: pageJob.pagePath, name: pageJob.pageName, queryHints: pageJob.ragQueries }],
    structuredInput: state.structuredInput ?? null,
    knowledgeBaseClient,
    enabled: enableScopedRag,
    concurrency: 1,
  });
  const scopedForPage = scopedRag.byPath[pageJob.pagePath];
  const scopedFactPack = scopedForPage?.context
    ? `\n\n# Page Scoped Fact Pack\n${scopedForPage.context}`
    : "";
  const outputLanguage = resolveOutputLanguage(String(state.prompt ?? ""));
  const expectedProductCount = resolveExpectedProductCountForPath({
    path: pageJob.pagePath,
    structuredInput: state.structuredInput ?? null,
  });
  const expectedCaseCount = resolveExpectedCaseCountForPath({
    path: pageJob.pagePath,
    structuredInput: state.structuredInput ?? null,
  });
  const hardGateHints: string[] = [];
  const pageType = pageTypeSkill.pageType;
  if (["home", "products", "solutions", "cases"].includes(pageType)) {
    hardGateHints.push(
      outputLanguage === "zh-CN"
        ? "至少包含 1 个媒体驱动区块（FeatureWithMedia/Gallery/Carousel/含图片媒体字段）。"
        : "Include at least one media-forward section (FeatureWithMedia/Gallery/Carousel or image/media fields)."
    );
  }
  if (pageType === "products") {
    const minProducts = Math.max(6, Number(expectedProductCount || 0));
    hardGateHints.push(
      outputLanguage === "zh-CN"
        ? `产品列表至少 ${minProducts} 条，每条含“名称 + 参数/型号 + 场景/卖点 + CTA”。`
        : `Render at least ${minProducts} products, each with name + spec/model + scenario/benefit + CTA.`
    );
  }
  if (pageType === "solutions") {
    hardGateHints.push(
      outputLanguage === "zh-CN"
        ? "解决方案至少 3 个方法要点，且包含问题-方法-结果链路。"
        : "Provide at least 3 approach points in a problem -> method -> outcome chain."
    );
  }
  if (pageType === "cases") {
    const minCases = Math.max(3, Number(expectedCaseCount || 0));
    hardGateHints.push(
      outputLanguage === "zh-CN"
        ? `案例至少 ${minCases} 条，每条含客户背景、挑战、方案与量化结果。`
        : `Provide at least ${minCases} cases, each with client context, challenge, solution, and measurable outcome.`
    );
  }
  if (pageType === "contact") {
    hardGateHints.push(
      outputLanguage === "zh-CN"
        ? "必须有可提交表单与明确响应承诺；联系区禁止渐变文字。"
        : "Contact page must include a submittable form and response-time promise; gradient text is forbidden in contact area."
    );
  }
  hardGateHints.push(
    outputLanguage === "zh-CN"
      ? "禁止模板占位文案与同构复用；使用事实包信息扩写，不得只做泛化句。"
      : "No template placeholder copy or isomorphic reuse; expand with fact-pack evidence instead of generic filler."
  );
  const pageScopedPrompt = `${String(state.prompt ?? "").trim()}

# Page Builder Skill
- skill: ${pageTypeSkill.skillName}
- pageType: ${pageTypeSkill.pageType}
- guidance: ${pageTypeSkill.guidance}

# Page Contract
- requiredSectionKinds: ${pageJob.requiredSectionKinds.join(", ") || "none"}
- navVariant: ${pageJob.hardness.nav.variant}
- heroComposition: ${pageJob.hardness.hero.compositionPreset}
- repeatBudget: ${JSON.stringify(pageJob.hardness.sectionRepeatBudget || {})}
- ragQueries: ${pageJob.ragQueries.join(" | ") || "none"}

# Hard Gates To Satisfy
${hardGateHints.map((hint) => `- ${hint}`).join("\n")}${scopedFactPack}`.trim();
  return {
    scopedPrompt: pageScopedPrompt,
    scopedRagDiagnostics: {
      summary: scopedRag.summary,
      page: scopedForPage
        ? {
            path: scopedForPage.path,
            pageType: scopedForPage.pageType,
            requiredFields: scopedForPage.requiredFields,
            coveredFields: scopedForPage.coveredFields,
            missingFields: scopedForPage.missingFields,
            queryCount: scopedForPage.queryCount,
            sourceCount: scopedForPage.sourceCount,
            used: scopedForPage.used,
            queries: scopedForPage.queries,
          }
        : null,
      planner: {
        pageType: pageJob.pageType,
        requiredSectionKinds: pageJob.requiredSectionKinds,
        ragQueries: pageJob.ragQueries,
      },
    },
  };
}

async function pageBuilderGenerateNode(state: PageBuilderSubgraphStateType) {
  const pageJob = state.pageJob;
  if (!pageJob) {
    return { generatedResult: null };
  }
  const pageTypeSkill = buildPageTypeSkillDirective({
    pagePath: pageJob.pagePath,
    pageName: pageJob.pageName,
    prompt: state.prompt ?? "",
    pageTypeSkillsEnabled: state.pageTypeSkillsEnabled ?? undefined,
  });
  const sourceBlueprint = (state.blueprint ?? {}) as ArchitectBlueprint;
  const singlePageBlueprint: ArchitectBlueprint = {
    ...sourceBlueprint,
    pages: [
      {
        ...pageJob.page,
        path: pageJob.pagePath,
        name: pageJob.pageName,
      },
    ],
  };
  const buildResult = await builderNode({
    prompt: String(state.scopedPrompt || state.prompt || ""),
    manifest: state.manifest ?? {},
    structuredInput: state.structuredInput ?? null,
    pageTypeSkillsEnabled: state.pageTypeSkillsEnabled ?? null,
    singleCandidateOnly: state.singleCandidateOnly ?? false,
    blueprint: singlePageBlueprint as Record<string, unknown>,
    generationStrategy: state.generationStrategy ?? sectionGenerationStrategy,
    planning: null,
    skillContext: state.skillContext ?? { architect: "", builder: "" },
    designSystemContext: state.designSystemContext ?? { master: "", pages: {} },
    components: [],
    pages: [],
    theme: {},
    siteBlueprint: {},
    resolvedByLayer: {},
    qaReport: {},
    globalChrome: state.globalChrome ?? {
      navigationBlockType: navbarComponentName,
      footerBlockType: footerFallbackComponentName,
      motionProfile: "subtle",
    },
    pageBuildJobs: [pageJob],
    currentPageJob: pageJob,
    pageBuildResults: [],
    pageBuildMode: { enabled: true, path: pageJob.pagePath },
    errors: [],
  } as GraphState);
  const generatedPages = Array.isArray((buildResult as any)?.pages) ? ((buildResult as any).pages as any[]) : [];
  const matchedPage =
    generatedPages.find((page) => normalizePlannerPagePath(page?.path || "/") === pageJob.pagePath) ??
    generatedPages[0] ??
    {
      path: pageJob.pagePath,
      name: pageJob.pageName,
      data: { root: { props: { title: pageJob.pageName } }, content: [] },
    };
  const policyAppliedPage =
    matchedPage && typeof matchedPage === "object"
      ? applyPageTypeSkillPolicyToPage({
          pagePath: pageJob.pagePath,
          prompt: state.prompt ?? "",
          page: matchedPage as Record<string, unknown>,
          pageTypeSkillsEnabled: state.pageTypeSkillsEnabled ?? undefined,
        })
      : (matchedPage as Record<string, unknown>);
  const result: PageBuildResult = {
    pageIndex: pageJob.pageIndex,
    pagePath: pageJob.pagePath,
    pageName: String((policyAppliedPage as any)?.name || matchedPage?.name || pageJob.pageName),
    page: policyAppliedPage as Record<string, unknown>,
    components: Array.isArray((buildResult as any)?.components) ? ((buildResult as any).components as any[]) : [],
    errors: Array.isArray((buildResult as any)?.errors) ? ((buildResult as any).errors as string[]) : [],
    resolvedByLayer:
      (buildResult as any)?.resolvedByLayer && typeof (buildResult as any).resolvedByLayer === "object"
        ? {
            ...((buildResult as any).resolvedByLayer as Record<string, unknown>),
            pageTypeSkill: {
              pageType: pageTypeSkill.pageType,
              skillName: pageTypeSkill.skillName,
            },
            scopedRagSubgraph:
              state.scopedRagDiagnostics && typeof state.scopedRagDiagnostics === "object"
                ? state.scopedRagDiagnostics
                : {},
          }
        : {},
    qaReport:
      (buildResult as any)?.qaReport && typeof (buildResult as any).qaReport === "object"
        ? ((buildResult as any).qaReport as Record<string, unknown>)
        : {},
    theme:
      (buildResult as any)?.theme && typeof (buildResult as any).theme === "object"
        ? ((buildResult as any).theme as Record<string, unknown>)
        : {},
  };
  return { generatedResult: result };
}

const inferPageContractKind = (block: Record<string, unknown>): string => {
  const props =
    block?.props && typeof block.props === "object" ? (block.props as Record<string, unknown>) : {};
  const token = `${String(block?.type || "")} ${String(props.id || "")} ${String(props.anchor || "")}`
    .toLowerCase()
    .trim();
  if (!token) return "other";
  if (/navigation|navbar|header|topnav|menu/.test(token)) return "navigation";
  if (/hero|masthead|banner|intro/.test(token)) return "hero";
  if (/story|content|timeline|about/.test(token)) return "story";
  if (/approach|feature|process|workflow|capability|faq/.test(token)) return "approach";
  if (/product|catalog|showcase|pricing/.test(token)) return "products";
  if (/social|proof|testimonial|logo|certification/.test(token)) return "socialproof";
  if (/contact|lead|form|quote/.test(token)) return "contact";
  if (/cta|calltoaction|call-to-action/.test(token)) return "cta";
  if (/footer|copyright|legal/.test(token)) return "footer";
  return "other";
};

const buildPageContractRecoveryCopy = (
  kind: string,
  outputLanguage: "zh-CN" | "en-US"
): { title: string; subtitle: string } => {
  const zh: Record<string, { title: string; subtitle: string }> = {
    navigation: { title: "导航", subtitle: "快速访问核心页面。" },
    hero: { title: "核心价值", subtitle: "聚焦业务价值、交付能力与行动入口。" },
    story: { title: "业务概述", subtitle: "面向目标客户说明能力边界与服务范围。" },
    approach: { title: "解决路径", subtitle: "以问题、方法与结果构建可执行方案。" },
    products: { title: "产品与参数", subtitle: "提供型号、参数与应用场景的结构化信息。" },
    socialproof: { title: "案例与背书", subtitle: "展示客户场景、成果数据与可信证明。" },
    contact: { title: "联系我们", subtitle: "提交需求后由工程团队尽快响应。" },
    cta: { title: "立即咨询", subtitle: "获取报价、方案与交付计划。" },
    footer: { title: "页脚信息", subtitle: "提供隐私、条款与联系入口。" },
  };
  const en: Record<string, { title: string; subtitle: string }> = {
    navigation: { title: "Navigation", subtitle: "Quick links to key pages." },
    hero: { title: "Core Value", subtitle: "Highlight value, capability, and conversion action." },
    story: { title: "Business Overview", subtitle: "Explain scope and delivery confidence for target buyers." },
    approach: { title: "Execution Approach", subtitle: "Present problem, method, and measurable outcomes." },
    products: { title: "Products & Specs", subtitle: "Provide structured model, spec, and scenario information." },
    socialproof: { title: "Proof & Cases", subtitle: "Show customer context, outcomes, and trust evidence." },
    contact: { title: "Contact", subtitle: "Share requirements and the team will follow up quickly." },
    cta: { title: "Get Quote", subtitle: "Request pricing, solution, and delivery plan." },
    footer: { title: "Footer", subtitle: "Provide legal and contact access points." },
  };
  const map = outputLanguage === "zh-CN" ? zh : en;
  return map[kind] || (outputLanguage === "zh-CN"
    ? { title: "业务信息", subtitle: "该区块用于补齐页面结构。" }
    : { title: "Business Content", subtitle: "This block is used to restore page structure." });
};

const recoverPageForContract = (input: {
  page: Record<string, unknown>;
  path: string;
  requiredSectionKinds: string[];
  outputLanguage: "zh-CN" | "en-US";
  prompt: string;
  expectedProductCount?: number;
  expectedCaseCount?: number;
  structuredProducts?: StructuredProductRecord[];
  structuredCases?: StructuredCaseRecord[];
}): Record<string, unknown> => {
  const page = input.page && typeof input.page === "object" ? ({ ...input.page } as Record<string, unknown>) : {};
  const data =
    page.data && typeof page.data === "object" ? ({ ...(page.data as Record<string, unknown>) } as Record<string, unknown>) : {};
  const rawContent = Array.isArray(data.content) ? ([...(data.content as unknown[])] as Record<string, unknown>[]) : [];
  const sanitizedContent = rawContent
    .map((block) => {
      if (!block || typeof block !== "object") return null;
      const next = { ...(block as Record<string, unknown>) };
      const props =
        next.props && typeof next.props === "object" ? ({ ...(next.props as Record<string, unknown>) } as Record<string, unknown>) : {};
      next.props = sanitizeGeneratedProps(props, {
        prompt: input.prompt,
        pagePath: input.path,
      }) as Record<string, unknown>;
      if (/contact|lead|quote|cta/i.test(`${String(next.type || "")} ${String((next.props as any)?.id || "")}`)) {
        next.props = enforceContactTextStyleProps(next.props as Record<string, unknown>);
      }
      return next;
    })
    .filter((item): item is Record<string, unknown> => Boolean(item));
  const fallbackSeed =
    sanitizedContent.find((item) => !isNavbarLikeBlock(item as any) && !isFooterLikeBlock(item as any)) ??
    sanitizedContent[0] ??
    ({ type: "ContentStory", props: {} } as Record<string, unknown>);
  const resolveRecoveryBlockType = (kind: string) => {
    switch (kind) {
      case "navigation":
        return "Navbar";
      case "hero":
        return "HeroSplit";
      case "story":
        return "ContentStory";
      case "approach":
        return "FeatureGrid";
      case "products":
        return "CardsGrid";
      case "socialproof":
        return "TestimonialsGrid";
      case "contact":
        return "LeadCaptureCTA";
      case "cta":
        return "LeadCaptureCTA";
      case "footer":
        return footerFallbackComponentName;
      default:
        return String(fallbackSeed?.type || "ContentStory");
    }
  };
  const presentKinds = new Set(sanitizedContent.map((item) => inferPageContractKind(item)));
  const requiredKinds = Array.from(new Set(input.requiredSectionKinds.filter(Boolean)));
  const recoveredContent = [...sanitizedContent];

  requiredKinds.forEach((kind) => {
    if (presentKinds.has(kind)) return;
    const seedProps =
      fallbackSeed.props && typeof fallbackSeed.props === "object"
        ? ({ ...(fallbackSeed.props as Record<string, unknown>) } as Record<string, unknown>)
        : {};
    const copy = buildPageContractRecoveryCopy(kind, input.outputLanguage);
    let nextProps: Record<string, unknown> = {
      ...seedProps,
      id: `${kind}-recovered`,
      anchor: kind === "socialproof" ? "social-proof" : kind,
      title: copy.title,
      subtitle: copy.subtitle,
    };
    if (kind === "contact") {
      nextProps = enforceContactTextStyleProps({
        ...nextProps,
        variant: "contact",
        showForm: true,
        cta: { label: input.outputLanguage === "zh-CN" ? "立即咨询" : "Contact", href: "/contact", variant: "primary" },
      });
    }
    const nextBlock: Record<string, unknown> = {
      ...fallbackSeed,
      type: resolveRecoveryBlockType(kind),
      props: nextProps,
    };
    if (kind === "navigation") {
      recoveredContent.unshift(nextBlock);
    } else if (kind === "footer") {
      recoveredContent.push(nextBlock);
    } else {
      const footerIndex = recoveredContent.findIndex((item) => inferPageContractKind(item) === "footer");
      if (footerIndex >= 0) recoveredContent.splice(footerIndex, 0, nextBlock);
      else recoveredContent.push(nextBlock);
    }
    presentKinds.add(kind);
  });

  const recoveredWithIds = ensureUniqueIdsForPageContent(
    recoveredContent as Array<{ type?: string; props?: Record<string, unknown> }>,
    input.path
  );

  const ensureProductsCoverage = (
    items: Array<{ type?: string; props?: Record<string, unknown> }>
  ): Array<{ type?: string; props?: Record<string, unknown> }> => {
    const expected = Math.max(0, Number(input.expectedProductCount ?? 0));
    if (expected <= 0) return items;
    const productIndex = items.findIndex((item) => {
      const token = `${String(item?.type || "")} ${String(item?.props?.id || "")} ${String(item?.props?.anchor || "")}`.toLowerCase();
      return /product|catalog|cardsgrid|pricing|plan/.test(token);
    });
    if (productIndex < 0) return items;
    const block = items[productIndex];
    const props = block?.props && typeof block.props === "object" ? ({ ...(block.props as Record<string, unknown>) } as Record<string, unknown>) : {};
    const currentItems = Array.isArray(props.items) ? ([...(props.items as unknown[])] as Record<string, unknown>[]) : [];
    if (currentItems.length >= expected) return items;
    const structured = Array.isArray(input.structuredProducts) ? input.structuredProducts : [];
    const language = input.outputLanguage;
    while (currentItems.length < expected) {
      const source = structured[currentItems.length];
      currentItems.push({
        title:
          String(source?.name || "").trim() ||
          (language === "zh-CN" ? `产品 ${currentItems.length + 1}` : `Product ${currentItems.length + 1}`),
        description:
          String(source?.summary || source?.model || "").trim() ||
          (language === "zh-CN" ? "参数信息完善中" : "Specification details available on request"),
        cta: {
          label: language === "zh-CN" ? "查看详情" : "View Details",
          href: "/products",
          variant: "link",
        },
      });
    }
    props.items = currentItems;
    const next = [...items];
    next[productIndex] = {
      ...(block as Record<string, unknown>),
      props,
    } as any;
    return next;
  };
  const recoveredWithProducts = ensureProductsCoverage(
    recoveredWithIds as Array<{ type?: string; props?: Record<string, unknown> }>
  );
  const pageType = inferEnterprisePageTypeFromPath(normalizePromptPagePath(String(input.path || "/")));

  const ensureApproachCoverage = (
    items: Array<{ type?: string; props?: Record<string, unknown> }>
  ): Array<{ type?: string; props?: Record<string, unknown> }> => {
    if (pageType !== "solutions") return items;
    const minPoints = 3;
    const approachIndex = items.findIndex((item) => {
      const token = `${String(item?.type || "")} ${String(item?.props?.id || "")} ${String(item?.props?.anchor || "")}`.toLowerCase();
      return /approach|feature|benefit|process|capability|workflow/.test(token);
    });
    if (approachIndex < 0) return items;
    const block = items[approachIndex];
    const props = block?.props && typeof block.props === "object" ? ({ ...(block.props as Record<string, unknown>) } as Record<string, unknown>) : {};
    const listKeys = ["items", "points", "features", "benefits", "steps", "list"];
    const listKey = listKeys.find((key) => Array.isArray(props[key])) || "items";
    const currentItems = Array.isArray(props[listKey]) ? ([...(props[listKey] as unknown[])] as Record<string, unknown>[]) : [];
    const language = input.outputLanguage;
    while (currentItems.length < minPoints) {
      const idx = currentItems.length + 1;
      currentItems.push({
        title: language === "zh-CN" ? `方案要点 ${idx}` : `Solution Point ${idx}`,
        description:
          language === "zh-CN" ? "聚焦交付效率、质量稳定与成本优化。" : "Focused on delivery speed, quality stability, and cost efficiency.",
      });
    }
    props[listKey] = currentItems;
    const next = [...items];
    next[approachIndex] = {
      ...(block as Record<string, unknown>),
      props,
    } as any;
    return next;
  };

  const ensureCasesCoverage = (
    items: Array<{ type?: string; props?: Record<string, unknown> }>
  ): Array<{ type?: string; props?: Record<string, unknown> }> => {
    const expected = Math.max(0, Number(input.expectedCaseCount ?? 0));
    if (expected <= 0 || pageType !== "cases") return items;
    const casesIndex = items.findIndex((item) => {
      const token = `${String(item?.type || "")} ${String(item?.props?.id || "")} ${String(item?.props?.anchor || "")}`.toLowerCase();
      return /social|proof|testimonial|case|application|project|story/.test(token);
    });
    if (casesIndex < 0) return items;
    const block = items[casesIndex];
    const props = block?.props && typeof block.props === "object" ? ({ ...(block.props as Record<string, unknown>) } as Record<string, unknown>) : {};
    const listKeys = ["items", "cases", "stories", "testimonials", "entries", "projects", "results", "slides"];
    const listKey = listKeys.find((key) => Array.isArray(props[key])) || "items";
    const currentItems = Array.isArray(props[listKey]) ? ([...(props[listKey] as unknown[])] as Record<string, unknown>[]) : [];
    const structured = Array.isArray(input.structuredCases) ? input.structuredCases : [];
    const language = input.outputLanguage;
    while (currentItems.length < expected) {
      const source = structured[currentItems.length];
      const index = currentItems.length + 1;
      currentItems.push({
        title:
          String(source?.title || "").trim() || (language === "zh-CN" ? `案例 ${index}` : `Case ${index}`),
        description:
          String(source?.result || source?.solution || source?.problem || "").trim() ||
          (language === "zh-CN" ? "展示关键成果与交付数据。" : "Showcasing measurable outcomes and delivery impact."),
      });
    }
    props[listKey] = currentItems;
    const next = [...items];
    next[casesIndex] = {
      ...(block as Record<string, unknown>),
      props,
    } as any;
    return next;
  };

  const recoveredWithApproach = ensureApproachCoverage(
    recoveredWithProducts as Array<{ type?: string; props?: Record<string, unknown> }>
  );
  const recoveredWithCases = ensureCasesCoverage(
    recoveredWithApproach as Array<{ type?: string; props?: Record<string, unknown> }>
  );
  const hasMediaSignalForContractRecovery = (
    items: Array<{ type?: string; props?: Record<string, unknown> }>
  ) =>
    items.some((item) => {
      const token = `${String(item?.type || "")} ${String(item?.props?.id || "")} ${String(item?.props?.anchor || "")}`
        .toLowerCase()
        .trim();
      if (!token) return false;
      if (/(withmedia|gallery|carousel|slider|video|image|photo|showcase|mosaic|splithero)/.test(token)) {
        return true;
      }
      const props = item?.props && typeof item.props === "object" ? (item.props as Record<string, unknown>) : {};
      return Object.entries(props).some(([key, value]) => {
        if (!/(?:image|img|media|photo|cover|thumbnail|poster|video|background)/i.test(key)) return false;
        if (typeof value === "string") return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return Boolean(value && typeof value === "object");
      });
    });
  const ensureVisualCoverage = (
    items: Array<{ type?: string; props?: Record<string, unknown> }>
  ): Array<{ type?: string; props?: Record<string, unknown> }> => {
    if (!["home", "products", "solutions", "cases"].includes(pageType)) return items;
    if (hasMediaSignalForContractRecovery(items)) return items;
    const language = input.outputLanguage;
    const visualBlock = {
      type: "FeatureWithMedia",
      props: {
        id: `${pageType}-media-recovered`,
        anchor: `${pageType}-visual`,
        title: language === "zh-CN" ? "视觉展示" : "Visual Showcase",
        subtitle:
          language === "zh-CN"
            ? "补齐页面视觉表达，突出产品与应用场景。"
            : "Restores visual expression for products and application scenarios.",
        mediaType: "image",
        mediaPosition: "right",
      },
    };
    const next = [...items];
    const footerIndex = next.findIndex((item) => inferPageContractKind(item as any) === "footer");
    if (footerIndex >= 0) {
      next.splice(footerIndex, 0, visualBlock);
    } else {
      next.push(visualBlock);
    }
    return next;
  };
  const recoveredWithVisualCoverage = ensureVisualCoverage(
    recoveredWithCases as Array<{ type?: string; props?: Record<string, unknown> }>
  );

  return {
    ...page,
    path: input.path,
    data: {
      ...data,
      content: recoveredWithVisualCoverage,
    },
  };
};

async function pageBuilderContractNode(state: PageBuilderSubgraphStateType) {
  const pageJob = state.pageJob;
  const generatedResult = state.generatedResult;
  if (!pageJob || !generatedResult) {
    return { result: generatedResult ?? null };
  }
  const outputLanguage = resolveOutputLanguage(String(state.prompt ?? ""));
  const expectedProductCount = resolveExpectedProductCountForPath({
    path: pageJob.pagePath,
    structuredInput: state.structuredInput ?? null,
  });
  const expectedCaseCount = resolveExpectedCaseCountForPath({
    path: pageJob.pagePath,
    structuredInput: state.structuredInput ?? null,
  });
  let finalPage = generatedResult.page as any;
  let report = evaluateGeneratedPageContract({
    page: generatedResult.page as any,
    requiredSectionKinds: pageJob.requiredSectionKinds,
    outputLanguage,
    expectedProductCount,
      expectedCaseCount,
    });
  // Upstream pageBuildMode can emit transient page_contract_failed entries that
  // should be replaced by the final decision from this dedicated contract node.
  const upstreamErrors = Array.isArray(generatedResult.errors) ? generatedResult.errors : [];
  const errors = upstreamErrors.filter((entry) => !/^page_contract_failed:/i.test(String(entry || "")));
  let pageErrors = report.issues.filter((issue) => issue.severity === "error");
  let recoveryApplied = false;
  let recoveryPass = false;
  if (pageErrors.length > 0) {
    const recoveredPage = recoverPageForContract({
      page: generatedResult.page as Record<string, unknown>,
      path: pageJob.pagePath,
      requiredSectionKinds: pageJob.requiredSectionKinds,
      outputLanguage,
      prompt: String(state.prompt ?? ""),
      expectedProductCount,
      expectedCaseCount,
      structuredProducts: Array.isArray(state.structuredInput?.products)
        ? state.structuredInput?.products
        : [],
      structuredCases: Array.isArray(state.structuredInput?.cases)
        ? state.structuredInput?.cases
        : [],
    });
    const recoveredReport = evaluateGeneratedPageContract({
      page: recoveredPage as any,
      requiredSectionKinds: pageJob.requiredSectionKinds,
      outputLanguage,
      expectedProductCount,
      expectedCaseCount,
    });
    const recoveredErrors = recoveredReport.issues.filter((issue) => issue.severity === "error");
    recoveryApplied = true;
    if (recoveredErrors.length <= pageErrors.length) {
      finalPage = recoveredPage;
      report = recoveredReport;
      pageErrors = recoveredErrors;
    }
    recoveryPass = recoveredErrors.length === 0;
  }
  if (pageErrors.length > 0) {
    errors.push(
      `page_contract_failed:${pageJob.pagePath}:${pageErrors.map((issue) => issue.code).join("|") || "unknown"}`
    );
  }
  const resolvedByLayer = {
    ...((generatedResult.resolvedByLayer as Record<string, unknown> | undefined) ?? {}),
    pageContract: {
      path: pageJob.pagePath,
      pageType: report.pageType,
      pass: report.pass,
      issueCount: report.issues.length,
      errorCount: pageErrors.length,
      warningCount: report.issues.filter((issue) => issue.severity === "warning").length,
      requiredSectionKinds: pageJob.requiredSectionKinds,
      recoveryApplied,
      recoveryPass,
    },
  };
  return {
    result: {
      ...generatedResult,
      page: finalPage,
      errors,
      resolvedByLayer,
    },
  };
}

const PAGE_BUILDER_SUBGRAPH_TYPES = [
  "home",
  "products",
  "solutions",
  "cases",
  "about",
  "contact",
  "support",
  "legal",
  "pricing",
  "blog",
  "generic",
] as const;

type PageBuilderSubgraphType = (typeof PAGE_BUILDER_SUBGRAPH_TYPES)[number];

const createPageBuilderSubgraph = () =>
  new StateGraph(PageBuilderSubgraphState)
    .addNode("scopedRag", pageBuilderScopedRagNode)
    .addNode("generate", pageBuilderGenerateNode)
    .addNode("pageContract", pageBuilderContractNode)
    .addEdge(START, "scopedRag")
    .addEdge("scopedRag", "generate")
    .addEdge("generate", "pageContract")
    .addEdge("pageContract", END)
    .compile();

const pageBuilderSubgraphByType = Object.fromEntries(
  PAGE_BUILDER_SUBGRAPH_TYPES.map((pageType) => [pageType, createPageBuilderSubgraph()])
) as Record<PageBuilderSubgraphType, ReturnType<typeof createPageBuilderSubgraph>>;

const resolvePageBuilderSubgraphType = (value: unknown): PageBuilderSubgraphType => {
  const token = String(value || "generic").trim().toLowerCase();
  return (PAGE_BUILDER_SUBGRAPH_TYPES as readonly string[]).includes(token)
    ? (token as PageBuilderSubgraphType)
    : "generic";
};

async function pageBuilderNode(
  state: GraphState,
  expectedType: PageBuilderSubgraphType = "generic"
): Promise<Partial<GraphState>> {
  const pageJob = state.currentPageJob;
  if (!pageJob) return {};
  const actualType = resolvePageBuilderSubgraphType(pageJob.pageType);
  const subgraphType = expectedType === "generic" ? actualType : expectedType;
  const pageBuilderSubgraph = pageBuilderSubgraphByType[subgraphType] ?? pageBuilderSubgraphByType.generic;
  logInfo(`${logPrefix} page_builder:start`, {
    pagePath: pageJob.pagePath,
    pageIndex: pageJob.pageIndex,
    pageType: actualType,
    subgraphType,
    requiredSectionKinds: pageJob.requiredSectionKinds,
    ragQueryCount: Array.isArray(pageJob.ragQueries) ? pageJob.ragQueries.length : 0,
  });
  const subgraphResult = await pageBuilderSubgraph.invoke({
    prompt: state.prompt ?? "",
    manifest: state.manifest ?? {},
    structuredInput: state.structuredInput ?? null,
    pageTypeSkillsEnabled: state.pageTypeSkillsEnabled ?? null,
    singleCandidateOnly: state.singleCandidateOnly ?? false,
    generationStrategy: pageJob.strategy ?? state.generationStrategy ?? sectionGenerationStrategy,
    skillContext: state.skillContext ?? { architect: "", builder: "" },
    designSystemContext: state.designSystemContext ?? { master: "", pages: {} },
    globalChrome: state.globalChrome ?? {
      navigationBlockType: navbarComponentName,
      footerBlockType: footerFallbackComponentName,
      motionProfile: "subtle",
    },
    blueprint: state.blueprint ?? {},
    pageJob,
  });
  const pageResult =
    subgraphResult?.result && typeof subgraphResult.result === "object"
      ? (subgraphResult.result as PageBuildResult)
      : null;
  if (!pageResult) {
    return {
      pageBuildResults: [],
    };
  }
  logInfo(`${logPrefix} page_builder:ok`, {
    pagePath: pageResult.pagePath,
    pageIndex: pageResult.pageIndex,
    pageType: actualType,
    subgraphType,
    errors: pageResult.errors.length,
  });
  return {
    pageBuildResults: [pageResult],
  };
}

const typedPageBuilderNode =
  (expectedType: PageBuilderSubgraphType) =>
  async (state: GraphState): Promise<Partial<GraphState>> => {
    const actualType = resolvePageBuilderSubgraphType(state.currentPageJob?.pageType || "generic");
    if (expectedType !== "generic" && actualType !== expectedType) {
      logWarn(`${logPrefix} page_builder:type_mismatch`, {
        expectedType,
        actualType,
        pagePath: state.currentPageJob?.pagePath || "/",
      });
    }
    return pageBuilderNode(state, expectedType);
  };

const dedupeComponentsByName = (components: Array<{ name: string; code: string }>) => {
  const seen = new Set<string>();
  const output: Array<{ name: string; code: string }> = [];
  components.forEach((component) => {
    const name = String(component?.name || "").trim();
    const code = String(component?.code || "").trim();
    if (!name || !code || seen.has(name)) return;
    seen.add(name);
    output.push({ name, code });
  });
  return output;
};

async function globalAssemblerNode(state: GraphState) {
  const expectedJobs = Array.isArray(state.pageBuildJobs) ? state.pageBuildJobs.length : 0;
  const completedJobs = Array.isArray(state.pageBuildResults) ? state.pageBuildResults.length : 0;
  if (expectedJobs > 0 && completedJobs < expectedJobs) {
    logInfo(`${logPrefix} assembler:waiting`, {
      expectedJobs,
      completedJobs,
    });
    return {};
  }
  const results = Array.isArray(state.pageBuildResults) ? state.pageBuildResults : [];
  if (!results.length) {
    logWarn(`${logPrefix} assembler:empty_results_fallback`, { reason: "page_build_results_empty" });
    return builderNode({
      ...state,
      pageBuildMode: null,
      currentPageJob: null,
      pageBuildResults: [],
    } as GraphState);
  }
  const sorted = [...results].sort((a, b) => a.pageIndex - b.pageIndex);
  const dedupedByPath = new Map<string, PageBuildResult>();
  sorted.forEach((item) => {
    const key = normalizePlannerPagePath(item.pagePath || (item.page as any)?.path || "/");
    if (!dedupedByPath.has(key)) dedupedByPath.set(key, item);
  });
  const mergedResults = Array.from(dedupedByPath.values());
  const mergedPages = mergedResults.map((item, index) => {
    const pageRecord =
      item.page && typeof item.page === "object" ? ({ ...(item.page as Record<string, unknown>) } as Record<string, unknown>) : {};
    const path = normalizePlannerPagePath((pageRecord.path as string) || item.pagePath || "/");
    const name = String((pageRecord.name as string) || item.pageName || (index === 0 ? "Home" : `Page ${index + 1}`));
    const root =
      pageRecord.data &&
      typeof pageRecord.data === "object" &&
      (pageRecord.data as Record<string, unknown>).root &&
      typeof (pageRecord.data as Record<string, unknown>).root === "object"
        ? ((pageRecord.data as Record<string, unknown>).root as Record<string, unknown>)
        : { props: { title: name, theme: item.theme ?? {} } };
    const content =
      pageRecord.data &&
      typeof pageRecord.data === "object" &&
      Array.isArray((pageRecord.data as Record<string, unknown>).content)
        ? (((pageRecord.data as Record<string, unknown>).content as unknown[]) ?? [])
        : [];
    return {
      path,
      name,
      sections: Array.isArray(pageRecord.sections) ? (pageRecord.sections as ArchitectSection[]) : [],
      data: {
        root,
        content,
      },
    };
  });
  const mergedTheme =
    mergedResults.find((item) => item.theme && Object.keys(item.theme).length > 0)?.theme ??
    ((((state.blueprint as ArchitectBlueprint)?.theme || {}) as Record<string, unknown>) ?? {});
  const plannerPreparation =
    state.blueprint &&
    typeof state.blueprint === "object" &&
    (state.blueprint as any).__plannerPreparation &&
    typeof (state.blueprint as any).__plannerPreparation === "object"
      ? ((state.blueprint as any).__plannerPreparation as PlannerPreparationMetadata)
      : null;
  const plannerGlobalChrome = plannerPreparation?.globalChrome ?? state.globalChrome ?? {
    navigationBlockType: navbarComponentName,
    footerBlockType: footerFallbackComponentName,
    motionProfile: "subtle" as const,
  };
  const siteBlueprint = buildSiteBlueprint({
    profileId: null,
    prompt: state.prompt ?? "",
    pages: mergedPages.map((page) => ({
      path: page.path,
      name: page.name,
      sections: Array.isArray(page.sections) ? page.sections : [],
    })),
  });
  const linkGraph = buildSiteLinkGraph(siteBlueprint, state.prompt ?? "");
  const components = dedupeComponentsByName(
    mergedResults.flatMap((item) =>
      Array.isArray(item.components)
        ? item.components
            .map((component) => ({
              name: String((component as any)?.name || ""),
              code: String((component as any)?.code || ""),
            }))
            .filter((component) => component.name && component.code)
        : []
    )
  );
  const availableChromeTypes = new Set<string>([
    navbarComponentName,
    footerFallbackComponentName,
    ...components.map((component) => component.name),
  ]);
  const globalChrome: GlobalChromeContract = {
    navigationBlockType: availableChromeTypes.has(plannerGlobalChrome.navigationBlockType)
      ? plannerGlobalChrome.navigationBlockType
      : navbarComponentName,
    footerBlockType: availableChromeTypes.has(plannerGlobalChrome.footerBlockType)
      ? plannerGlobalChrome.footerBlockType
      : footerFallbackComponentName,
    motionProfile: plannerGlobalChrome.motionProfile ?? "subtle",
  };
  const globalNavLinks = (() => {
    const source = Array.isArray(linkGraph.navigationLinks) ? linkGraph.navigationLinks : [];
    const links = source
      .map((link) => {
        const href = normalizePlannerPagePath(String(link?.href || "/"));
        if (!href.startsWith("/")) return null;
        if (inferEnterprisePageTypeFromPath(href) === "legal") return null;
        const label = resolveLocalizedPageLabel(
          String(link?.label || "").trim() || defaultPageLabelForPath(href, state.prompt ?? ""),
          href,
          state.prompt ?? ""
        );
        return { label, href, variant: "link" as const };
      })
      .filter((item): item is { label: string; href: string; variant: "link" } => Boolean(item));
    const deduped = Array.from(
      links.reduce((acc, item) => {
        if (!acc.has(item.href)) acc.set(item.href, item);
        return acc;
      }, new Map<string, { label: string; href: string; variant: "link" }>())
    ).map((entry) => entry[1]);
    if (!deduped.some((item) => item.href === "/")) {
      deduped.unshift({
        label: resolveLocalizedPageLabel(defaultPageLabelForPath("/", state.prompt ?? ""), "/", state.prompt ?? ""),
        href: "/",
        variant: "link",
      });
    }
    return deduped.slice(0, 8);
  })();
  const globalNavText = globalNavLinks.map((item) => item.label).filter(Boolean).join(" | ");
  const canonicalBrandName =
    sanitizeBrandCandidate(extractBrandNameFromPromptShared(state.prompt ?? "")) ||
    sanitizeBrandCandidate(extractBrandNameFromPromptLite(state.prompt ?? "")) ||
    (resolveOutputLanguage(state.prompt ?? "") === "zh-CN" ? "本公司" : "Company");
  const normalizePageContentForAssembler = (pagePath: string, content: unknown[]) => {
    const safe = (Array.isArray(content) ? content : []).filter(Boolean) as Array<Record<string, unknown>>;
    const navbar = safe.find((item) => isNavbarLikeBlock(item as any));
    const footer = [...safe].reverse().find((item) => isFooterLikeBlock(item as any));
    const body = safe.filter((item) => !isNavbarLikeBlock(item as any) && !isFooterLikeBlock(item as any));
    const dedupedBody: Array<Record<string, unknown>> = [];
    const byKey = new Map<string, number>();
    const scoreItem = (item: Record<string, unknown>, idx: number) => {
      const props = item?.props && typeof item.props === "object" ? (item.props as Record<string, unknown>) : {};
      const id = String(props.id || "");
      let score = 0;
      if (id.startsWith("structured-")) score += 20;
      if (/hero/i.test(String(item.type || ""))) score += 10;
      score += Math.max(0, 8 - idx);
      return score;
    };
    body.forEach((item, idx) => {
      const props = item?.props && typeof item.props === "object" ? (item.props as Record<string, unknown>) : {};
      const anchor = String(props.anchor || "").trim().toLowerCase();
      const kind = inferPageContractKind(item);
      const key = `${anchor || "no-anchor"}::${kind}`;
      const existing = byKey.get(key);
      if (existing === undefined) {
        byKey.set(key, dedupedBody.length);
        dedupedBody.push(item);
        return;
      }
      if (scoreItem(item, idx) > scoreItem(dedupedBody[existing], existing)) {
        dedupedBody[existing] = item;
      }
    });
    if (pagePath === "/contact") {
      const heroIndexes = dedupedBody
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => /hero|masthead|banner/i.test(String(item?.type || "")))
        .map(({ index }) => index);
      if (heroIndexes.length > 0 && heroIndexes[0] !== 0) {
        const firstHero = dedupedBody[heroIndexes[0]];
        const nextBody = dedupedBody.filter((_, index) => index !== heroIndexes[0]);
        dedupedBody.splice(0, dedupedBody.length, firstHero, ...nextBody);
      }
    }
    const pageType = inferEnterprisePageTypeFromPath(normalizePlannerPagePath(pagePath || "/"));
    if (pageType === "legal") {
      const storyBlock =
        dedupedBody.find((item) => inferPageContractKind(item) === "story") ??
        dedupedBody.find((item) => /contentstory/i.test(String(item?.type || ""))) ??
        dedupedBody[0];
      return [...(navbar ? [navbar] : []), ...(storyBlock ? [storyBlock] : []), ...(footer ? [footer] : [])];
    }
    return [...(navbar ? [navbar] : []), ...dedupedBody, ...(footer ? [footer] : [])];
  };
  const assembledAvailablePaths = new Set(
    mergedPages.map((entry) => normalizePlannerPagePath(String(entry.path || "/")))
  );
  let pagesOut = mergedPages.map((page) => {
    const content = Array.isArray((page as any)?.data?.content) ? ((page as any).data.content as any[]) : [];
    const chromeAlignedContent = content.map((item) => {
      if (!item || typeof item !== "object") return item;
      if (isNavbarLikeBlock(item as any)) {
        const sourceProps =
          (item as any).props && typeof (item as any).props === "object"
            ? ({ ...((item as any).props as Record<string, unknown>) } as Record<string, unknown>)
            : {};
        sourceProps.links = globalNavLinks;
        sourceProps.navlinks = globalNavLinks;
        sourceProps.navItems = globalNavLinks;
        sourceProps.menuItems = globalNavLinks;
        sourceProps.navtext = globalNavText;
        sourceProps.toplinkstext = globalNavText;
        sourceProps.logoText = canonicalBrandName;
        sourceProps.logotext = canonicalBrandName;
        sourceProps.brandtext = canonicalBrandName.toUpperCase();
        return {
          ...(item as any),
          type: globalChrome.navigationBlockType,
          props: sourceProps,
        };
      }
      if (isFooterLikeBlock(item as any)) {
        const sourceProps =
          (item as any).props && typeof (item as any).props === "object"
            ? ({ ...((item as any).props as Record<string, unknown>) } as Record<string, unknown>)
            : {};
        sourceProps.logoText = canonicalBrandName;
        sourceProps.ftlogotext = canonicalBrandName;
        sourceProps.flogotext = canonicalBrandName;
        if (typeof sourceProps.legal !== "string" || !String(sourceProps.legal).trim()) {
          sourceProps.legal =
            resolveOutputLanguage(state.prompt ?? "") === "zh-CN"
              ? `© ${new Date().getFullYear()} ${canonicalBrandName} 版权所有`
              : `© ${new Date().getFullYear()} ${canonicalBrandName}. All rights reserved.`;
        }
        return {
          ...(item as any),
          type: globalChrome.footerBlockType,
          props: sourceProps,
        };
      }
      return item;
    });
    return {
      path: page.path,
      name: page.name,
      data: {
        root:
          (page as any)?.data?.root && typeof (page as any).data.root === "object"
            ? (page as any).data.root
            : { props: { title: page.name, theme: mergedTheme } },
        content: coerceContentInternalHrefsToAvailablePaths(
          normalizePageContentForAssembler(page.path, chromeAlignedContent),
          assembledAvailablePaths
        ),
      },
    };
  });
  pagesOut = sanitizeFinalPagesOutput(pagesOut as GeneratedPage[], {
    prompt: state.prompt ?? "",
    designNorthStar: mergedTheme as Record<string, unknown>,
    profileId: null,
  }) as typeof pagesOut;
  pagesOut = applyVisualMediaCoverage(pagesOut as GeneratedPage[], state.prompt ?? "") as typeof pagesOut;
  const finalAssembledPaths = new Set(
    pagesOut.map((entry) => normalizePlannerPagePath(String(entry.path || "/")))
  );
  pagesOut = pagesOut.map((page) => ({
    ...page,
    data: {
      ...(page as any).data,
      content: coerceContentInternalHrefsToAvailablePaths(
        Array.isArray((page as any)?.data?.content) ? ((page as any).data.content as any[]) : [],
        finalAssembledPaths
      ) as any,
    },
  }));
  const outputLanguage = resolveOutputLanguage(state.prompt ?? "");
  const requiredKindsByPath = new Map<string, string[]>(
    (Array.isArray(state.pageBuildJobs) ? state.pageBuildJobs : []).map((job) => [
      normalizePlannerPagePath(job.pagePath || "/"),
      Array.isArray(job.requiredSectionKinds) ? job.requiredSectionKinds : [],
    ])
  );
  const pageContractReports = pagesOut.map((page) =>
    evaluateGeneratedPageContract({
      page,
      requiredSectionKinds: requiredKindsByPath.get(normalizePlannerPagePath(page.path || "/")) || [],
      outputLanguage,
      expectedProductCount: resolveExpectedProductCountForPath({
        path: String(page.path || "/"),
        structuredInput: state.structuredInput ?? null,
      }),
      expectedCaseCount: resolveExpectedCaseCountForPath({
        path: String(page.path || "/"),
        structuredInput: state.structuredInput ?? null,
      }),
    })
  );
  const contractValidation = validateGeneratedSiteContract({
    prompt: state.prompt ?? "",
    pages: pagesOut as any[],
  });
  const qaReport = evaluateGenerationQa({
    siteBlueprint,
    pages: pagesOut,
    linkGraph,
    prompt: state.prompt ?? "",
    thresholds: {
      coverage: Number(process.env.BUILDER_QA_COVERAGE_THRESHOLD || 0.85),
      linkIntegrity: Number(process.env.BUILDER_QA_LINK_THRESHOLD || 0.95),
      themeConsistency: Number(process.env.BUILDER_QA_THEME_THRESHOLD || 0.9),
      semantic: Number(process.env.BUILDER_QA_SEMANTIC_THRESHOLD || 0.9),
      overall: Number(process.env.BUILDER_QA_OVERALL_THRESHOLD || 0.9),
    },
  });
  const adaptation = buildTemplateAdaptationSummary({
    prompt: state.prompt,
    profileId: null,
    pages: pagesOut,
  });
  const adaptationErrorCount = adaptation.findings.filter((finding) => finding.severity === "error").length;
  const adaptationWarningCount = adaptation.findings.filter((finding) => finding.severity === "warning").length;
  const errors = mergedResults.flatMap((item) =>
    Array.isArray(item.errors)
      ? item.errors
          .filter((entry) => typeof entry === "string" && entry.trim().length > 0)
          .map((entry) => `page_builder_error:${item.pagePath}:${entry}`)
      : []
  );
  if (!contractValidation.pass) {
    errors.push(
      `contract_gate_failed:errors=${contractValidation.issues.filter((issue) => issue.severity === "error").length}:warnings=${contractValidation.issues.filter((issue) => issue.severity === "warning").length}`
    );
  }
  if (!qaReport.pass) {
    errors.push(
      `qa_gate_failed:coverage=${qaReport.coverageScore.toFixed(3)}:links=${qaReport.linkIntegrityScore.toFixed(3)}:theme=${qaReport.themeConsistencyScore.toFixed(3)}:semantic=${qaReport.semanticFidelityScore.toFixed(3)}:overall=${qaReport.overallScore.toFixed(3)}`
    );
  }
  logInfo(`${logPrefix} assembler:ok`, {
    pages: pagesOut.length,
    components: components.length,
    contractPass: contractValidation.pass,
    qaPass: qaReport.pass,
  });
  return {
    components,
    pages: pagesOut,
    theme: mergedTheme,
    globalChrome,
    siteBlueprint,
    qaReport,
    resolvedByLayer: {
      strategy: sectionGenerationStrategy,
      requestedStrategy: state.generationStrategy ?? sectionGenerationStrategy,
      selectedStrategy: state.generationStrategy ?? sectionGenerationStrategy,
      templatePlanProfile: null,
      skeleton: siteBlueprint.skeleton,
      navLinks: linkGraph.navigationLinks.length,
      footerColumns: linkGraph.footerColumns.length,
      harmonizedNavbarBlocks: pagesOut.length,
      harmonizedFooterBlocks: pagesOut.length,
      resolutionLayer: "page",
      matchedPagePaths: pagesOut.map((page) => page.path),
      matchedPageCoverage: 1,
      templateKinds: [],
      styleFamily: null,
      motionProfile: globalChrome.motionProfile,
      globalChrome,
      adaptation: {
        scenario: adaptation.scenario,
        templateFamily: adaptation.templateFamily,
        referenceMode: adaptation.referenceMode,
        errorCount: adaptationErrorCount,
        warningCount: adaptationWarningCount,
        findings: adaptation.findings,
        pageContracts: adaptation.pageContracts,
      },
      qa: {
        pass: qaReport.pass,
        coverageScore: qaReport.coverageScore,
        linkIntegrityScore: qaReport.linkIntegrityScore,
        themeConsistencyScore: qaReport.themeConsistencyScore,
        semanticFidelityScore: qaReport.semanticFidelityScore,
        overallScore: qaReport.overallScore,
      },
      contract: {
        pass: contractValidation.pass,
        normalizationIssueCount: 0,
        validationIssueCount: contractValidation.issues.length,
        pageIssueCount: pageContractReports.reduce((sum, report) => sum + report.issues.length, 0),
        pageFailedCount: pageContractReports.filter((report) => !report.pass).length,
        pageReports: pageContractReports.map((report, index) => ({
          path: pagesOut[index]?.path || "/",
          pageType: report.pageType,
          pass: report.pass,
          issueCount: report.issues.length,
          errorCount: report.issues.filter((issue) => issue.severity === "error").length,
          warningCount: report.issues.filter((issue) => issue.severity === "warning").length,
        })),
        normalizationIssues: [],
        validationIssues: contractValidation.issues,
      },
      scopedRag: {
        enabled: enableScopedRag,
        fanOutMode: true,
        pageCount: pagesOut.length,
      },
      skillOrchestration: {
        applied: true,
        suggestion: state.generationStrategy ?? sectionGenerationStrategy,
        diagnostics: {
          mode: "send_fanout",
          pageBuilderSubgraph: "typed_registry",
          jobs: Array.isArray(state.pageBuildJobs) ? state.pageBuildJobs.length : 0,
          completed: Array.isArray(state.pageBuildResults) ? state.pageBuildResults.length : 0,
        },
      },
    },
    errors,
  };
}

type GenerationCandidateResult = {
  blueprint?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  pages?: any[];
  components?: any[];
  siteBlueprint?: Record<string, unknown>;
  qaReport?: Record<string, unknown>;
  resolvedByLayer?: Record<string, unknown>;
  errors?: string[];
};

const resolveCandidateStrategiesForPrompt = (
  prompt: string,
  preferredGenerationStrategy?: SectionGenerationStrategy
): SectionGenerationStrategy[] => {
  if (preferredGenerationStrategy) {
    return [parseSectionGenerationStrategy(preferredGenerationStrategy, sectionGenerationStrategy)];
  }
  if (!enableMultiCandidateSelection) return [sectionGenerationStrategy];
  const rawPrompt = String(prompt || "");
  if (multiCandidateMaxPromptChars > 0 && rawPrompt.length > multiCandidateMaxPromptChars) {
    return ["template_first"];
  }
  const requestedPages = extractRequestedPagesFromPrompt(prompt);
  const brief = parseStructuredBrief(prompt);
  const detailed = isDetailedDesignBrief(prompt);
  const matchedProfile = selectStyleProfile(prompt);
  const explicitReference =
    /\b(?:like|inspired by|based on|similar to|reference(?:d)? from|modeled on)\b/i.test(String(prompt || "")) ||
    /\buse\s+[A-Za-z0-9\u4e00-\u9fff][^,.;\n]{1,50}\s+as\s+(?:the\s+)?(?:(?:visual\s+style|visual\s+template|template|style|visual)\s+)?(?:reference|base)\b/i.test(
      String(prompt || "")
    );
  const promptDemandsNovelArtDirection = /(?:avant[-\s]?garde|editorial|art[-\s]?direction|unexpected|surprising|highly original|experimental)/i.test(
    String(prompt || "")
  );
  const promptHasStructuredContentDemand = Boolean(
    requestedPages.length ||
      brief?.nav?.length ||
      brief?.heroTitle ||
      brief?.productItems?.length ||
      brief?.featureItems?.length ||
      brief?.caseItems?.length
  );
  const hasRichStructuredMultiPageDemand = promptHasStructuredContentDemand && requestedPages.length >= 5;
  if (hasRichStructuredMultiPageDemand) {
    return ["template_first"];
  }

  let preferred: SectionGenerationStrategy[] = configuredCandidateStrategies;
  if (detailed) {
    preferred = configuredDetailedCandidateStrategies;
  } else if (!matchedProfile) {
    preferred = ["hybrid", "llm_first", "template_first"];
  } else if (explicitReference || promptHasStructuredContentDemand) {
    preferred = ["template_first", "hybrid", "llm_first"];
  } else if (promptDemandsNovelArtDirection) {
    preferred = ["hybrid", "llm_first", "template_first"];
  }

  return Array.from(new Set([sectionGenerationStrategy, ...preferred]));
};

const layerPreferenceScore = (layer: unknown) => {
  switch (String(layer || "")) {
    case "full-site":
      return 0.04;
    case "page":
      return 0.03;
    case "section":
      return 0.02;
    case "block":
      return 0.01;
    case "llm":
    default:
      return 0;
  }
};

const fallbackErrorCount = (errors: unknown) =>
  Array.isArray(errors)
    ? errors.filter((item) => typeof item === "string" && /^builder_section_fallback:/.test(item)).length
    : 0;

const totalErrorCount = (errors: unknown) =>
  Array.isArray(errors) ? errors.filter((item) => typeof item === "string" && item.trim()).length : 0;

const adaptationIssueCounts = (resolvedByLayer: unknown) => {
  const resolved =
    resolvedByLayer && typeof resolvedByLayer === "object" ? (resolvedByLayer as Record<string, unknown>) : {};
  const adaptation =
    resolved.adaptation && typeof resolved.adaptation === "object"
      ? (resolved.adaptation as Record<string, unknown>)
      : {};
  return {
    errorCount: Number(adaptation.errorCount || 0),
    warningCount: Number(adaptation.warningCount || 0),
  };
};

const scoreGenerationCandidate = (result: GenerationCandidateResult) => {
  const qa = result?.qaReport && typeof result.qaReport === "object" ? (result.qaReport as Record<string, unknown>) : {};
  const resolved =
    result?.resolvedByLayer && typeof result.resolvedByLayer === "object"
      ? (result.resolvedByLayer as Record<string, unknown>)
      : {};
  const overall = Number(qa.overallScore || 0);
  const semantic = Number(qa.semanticFidelityScore || 0);
  const coverage = Number(qa.coverageScore || 0);
  const links = Number(qa.linkIntegrityScore || 0);
  const theme = Number(qa.themeConsistencyScore || 0);
  const matchedPageCoverage = Number(resolved.matchedPageCoverage || 0);
  const passBonus = qa.pass ? 10 : 0;
  const layerBonus = layerPreferenceScore(resolved.resolutionLayer);
  const fallbackPenalty = fallbackErrorCount(result?.errors) * 0.05;
  const errorPenalty = totalErrorCount(result?.errors) * 0.01;
  const adaptationCounts = adaptationIssueCounts(result?.resolvedByLayer);
  const adaptationPenalty = adaptationCounts.errorCount * 0.3 + adaptationCounts.warningCount * 0.05;
  const score =
    passBonus +
    overall * 4 +
    semantic * 1.5 +
    coverage * 1.25 +
    links * 1 +
    theme * 0.75 +
    matchedPageCoverage * 0.5 +
    layerBonus -
    adaptationPenalty -
    fallbackPenalty -
    errorPenalty;

  return {
    score: Number(score.toFixed(4)),
    pass: Boolean(qa.pass),
    overallScore: overall,
    semanticScore: semantic,
    coverageScore: coverage,
    linkScore: links,
    themeScore: theme,
    matchedPageCoverage,
    layer: String(resolved.resolutionLayer || ""),
    adaptationErrorCount: adaptationCounts.errorCount,
    adaptationWarningCount: adaptationCounts.warningCount,
    fallbackCount: fallbackErrorCount(result?.errors),
    errorCount: totalErrorCount(result?.errors),
  };
};

const shouldShortCircuitCandidateSelection = (
  prompt: string,
  result: GenerationCandidateResult,
  score: ReturnType<typeof scoreGenerationCandidate>
) => {
  const explicitTemplatePrompt =
    hasExplicitTemplateReference(prompt);
  if (!score.pass) return false;
  if (score.overallScore < 0.98) return false;
  if (score.semanticScore < 0.95 || score.coverageScore < 0.95 || score.linkScore < 0.95 || score.themeScore < 0.95)
    return false;
  if (score.adaptationErrorCount > 0) return false;
  if (score.errorCount > 0 || score.fallbackCount > 0) return false;
  const resolved =
    result?.resolvedByLayer && typeof result.resolvedByLayer === "object"
      ? (result.resolvedByLayer as Record<string, unknown>)
      : {};
  const resolutionLayer = String(resolved.resolutionLayer || "");
  if (explicitTemplatePrompt) {
    return resolutionLayer === "full-site" || resolutionLayer === "page" || resolutionLayer === "section";
  }

  const hasTemplatePlanProfile = typeof resolved.templatePlanProfile === "string" && resolved.templatePlanProfile.trim().length > 0;
  const matchedPageCoverage = Number(resolved.matchedPageCoverage || 0);
  const sitePages = normalizePages((result?.siteBlueprint as Record<string, unknown>) ?? {});
  const singlePageSite = sitePages.length <= 1;
  const genericWebsiteIntent =
    hasTemplateSeedableBuildIntent(prompt) ||
    looksLikeEnterpriseWebsite({
      prompt,
      pages: sitePages,
    });

  if (!genericWebsiteIntent || !hasTemplatePlanProfile) return false;
  if (resolutionLayer === "full-site" && matchedPageCoverage >= 0.85) return true;
  if (singlePageSite && (resolutionLayer === "page" || resolutionLayer === "section")) return true;
  if (matchedPageCoverage < 0.85) return false;
  return resolutionLayer === "full-site";
};

export async function generateP2WProject(input: {
  prompt: string;
  manifest: Record<string, unknown>;
  structuredInput?: StructuredSiteInput;
  pageTypeSkillsEnabled?: boolean;
  planning?: { dir: string; requestId?: string; batchSize?: number };
  preferredGenerationStrategy?: SectionGenerationStrategy;
  singleCandidateOnly?: boolean;
  blueprintOverride?: Record<string, unknown>;
  progressReporter?: GenerationProgressReporter;
}) {
  const effectivePrompt = String(input.prompt ?? "");
  const reportProgress = (stage: string, detail?: Record<string, unknown>) =>
    emitGenerationProgress(input.progressReporter, stage, detail);
  logInfo(`${logPrefix} serper:fact_pack`, {
    mode: "scoped",
    enabled: true,
    note: "Global fact pack is disabled; page-scoped retrieval runs in builder stage.",
  });
  const [skillContext, designSystemContext] = await Promise.all([
    loadSkillContext(),
    loadDesignSystemContext(),
  ]);

  const wrapTypedPageBuilderNodeWithProgress = (nodeType: PageBuilderSubgraphType) => {
    const baseNode = typedPageBuilderNode(nodeType);
    return async (state: GraphState): Promise<Partial<GraphState>> => {
      const pagePath = String(state.currentPageJob?.pagePath || "/");
      const pageType = resolvePageBuilderSubgraphType(state.currentPageJob?.pageType || nodeType);
      reportProgress("page_builder_started", {
        nodeType,
        pagePath,
        pageType,
      });
      const output = await baseNode(state);
      const result =
        Array.isArray(output?.pageBuildResults) && output.pageBuildResults.length > 0
          ? output.pageBuildResults.find((entry) => entry.pagePath === pagePath) || output.pageBuildResults[0]
          : null;
      reportProgress("page_builder_completed", {
        nodeType,
        pagePath,
        pageType,
        errorCount: Array.isArray(result?.errors) ? result.errors.length : 0,
      });
      return output;
    };
  };

  const graph = new StateGraph(State)
    .addNode("sitePlanner", async (state: GraphState): Promise<Partial<GraphState>> => {
      reportProgress("planner_started", {
        promptLength: String(state.prompt || "").length,
      });
      const output = await sitePlannerNode(state);
      reportProgress("planner_completed", {
        pageJobCount: Array.isArray(output?.pageBuildJobs) ? output.pageBuildJobs.length : 0,
      });
      return output;
    })
    .addNode("pageBuilderHome", wrapTypedPageBuilderNodeWithProgress("home"))
    .addNode("pageBuilderProducts", wrapTypedPageBuilderNodeWithProgress("products"))
    .addNode("pageBuilderSolutions", wrapTypedPageBuilderNodeWithProgress("solutions"))
    .addNode("pageBuilderCases", wrapTypedPageBuilderNodeWithProgress("cases"))
    .addNode("pageBuilderAbout", wrapTypedPageBuilderNodeWithProgress("about"))
    .addNode("pageBuilderContact", wrapTypedPageBuilderNodeWithProgress("contact"))
    .addNode("pageBuilderSupport", wrapTypedPageBuilderNodeWithProgress("support"))
    .addNode("pageBuilderLegal", wrapTypedPageBuilderNodeWithProgress("legal"))
    .addNode("pageBuilderPricing", wrapTypedPageBuilderNodeWithProgress("pricing"))
    .addNode("pageBuilderBlog", wrapTypedPageBuilderNodeWithProgress("blog"))
    .addNode("pageBuilderGeneric", wrapTypedPageBuilderNodeWithProgress("generic"))
    .addNode("globalAssembler", async (state: GraphState): Promise<Partial<GraphState>> => {
      reportProgress("assembler_started", {
        pageResultCount: Array.isArray(state.pageBuildResults) ? state.pageBuildResults.length : 0,
      });
      const output = await globalAssemblerNode(state);
      reportProgress("assembler_completed", {
        pageCount: Array.isArray(output?.pages) ? output.pages.length : 0,
        errorCount: Array.isArray(output?.errors) ? output.errors.length : 0,
      });
      return output;
    })
    .addEdge(START, "sitePlanner")
    .addConditionalEdges("sitePlanner", routePlannerToPageBuilders)
    .addEdge("pageBuilderHome", "globalAssembler")
    .addEdge("pageBuilderProducts", "globalAssembler")
    .addEdge("pageBuilderSolutions", "globalAssembler")
    .addEdge("pageBuilderCases", "globalAssembler")
    .addEdge("pageBuilderAbout", "globalAssembler")
    .addEdge("pageBuilderContact", "globalAssembler")
    .addEdge("pageBuilderSupport", "globalAssembler")
    .addEdge("pageBuilderLegal", "globalAssembler")
    .addEdge("pageBuilderPricing", "globalAssembler")
    .addEdge("pageBuilderBlog", "globalAssembler")
    .addEdge("pageBuilderGeneric", "globalAssembler")
    .addEdge("globalAssembler", END)
    .compile();

  const planning = input.planning?.dir
      ? await PlanningFiles.init({
        rootDir: input.planning.dir,
        prompt: effectivePrompt,
        requestId: input.planning.requestId,
        batchSize: input.planning.batchSize,
      })
    : null;
  let candidateStrategies = resolveCandidateStrategiesForPrompt(
    effectivePrompt,
    input.preferredGenerationStrategy
  );
  if (input.singleCandidateOnly) {
    candidateStrategies = [candidateStrategies[0] ?? sectionGenerationStrategy];
  }
  const runPlanning = candidateStrategies.length > 1 ? null : planning;
  const baseInput = {
    prompt: effectivePrompt,
    manifest: input.manifest,
    structuredInput: input.structuredInput ?? null,
    pageTypeSkillsEnabled:
      typeof input.pageTypeSkillsEnabled === "boolean" ? input.pageTypeSkillsEnabled : null,
    singleCandidateOnly: Boolean(input.singleCandidateOnly),
    planning: runPlanning,
    skillContext,
    designSystemContext,
    blueprint: input.blueprintOverride ?? planning?.getBlueprint() ?? undefined,
  };

  const primaryStrategy = candidateStrategies[0] ?? sectionGenerationStrategy;
  reportProgress("candidate_started", { strategy: primaryStrategy, order: 1 });
  const primaryResult = await graph.invoke({
    ...baseInput,
    generationStrategy: primaryStrategy,
  });
  reportProgress("candidate_completed", {
    strategy: primaryStrategy,
    order: 1,
    errorCount: totalErrorCount(primaryResult?.errors),
  });

  const candidates: Array<{
    strategy: SectionGenerationStrategy;
    result: GenerationCandidateResult;
    score: ReturnType<typeof scoreGenerationCandidate>;
  }> = [
    {
      strategy: candidateStrategies[0] ?? sectionGenerationStrategy,
      result: primaryResult,
      score: scoreGenerationCandidate(primaryResult),
    },
  ];
  const shortCircuitSelection =
    candidateStrategies.length > 1 &&
    shouldShortCircuitCandidateSelection(effectivePrompt, primaryResult, candidates[0].score);

  const reusableBlueprint =
    primaryResult?.blueprint && typeof primaryResult.blueprint === "object"
      ? (primaryResult.blueprint as Record<string, unknown>)
      : baseInput.blueprint;

  if (!shortCircuitSelection) {
    for (const strategy of candidateStrategies.slice(1)) {
      reportProgress("candidate_started", { strategy, order: candidates.length + 1 });
      const candidateResult = await graph.invoke({
        ...baseInput,
        planning: null,
        blueprint: reusableBlueprint,
        generationStrategy: strategy,
      });
      reportProgress("candidate_completed", {
        strategy,
        order: candidates.length + 1,
        errorCount: totalErrorCount(candidateResult?.errors),
      });
      candidates.push({
        strategy,
        result: candidateResult,
        score: scoreGenerationCandidate(candidateResult),
      });
    }
  }

  candidates.sort((left, right) => {
    if (Number(right.score.pass) !== Number(left.score.pass)) return Number(right.score.pass) - Number(left.score.pass);
    if (right.score.score !== left.score.score) return right.score.score - left.score.score;
    if (right.score.errorCount !== left.score.errorCount) return left.score.errorCount - right.score.errorCount;
    return candidateStrategies.indexOf(left.strategy) - candidateStrategies.indexOf(right.strategy);
  });

  const selected = candidates[0];
  const candidateSelection = {
    enabled: candidateStrategies.length > 1,
    shortCircuited: shortCircuitSelection,
    triedStrategies: candidateStrategies,
    selectedStrategy: selected?.strategy ?? sectionGenerationStrategy,
    candidates: candidates.map((entry) => ({
      strategy: entry.strategy,
      score: entry.score.score,
      pass: entry.score.pass,
      overallScore: entry.score.overallScore,
      semanticScore: entry.score.semanticScore,
      coverageScore: entry.score.coverageScore,
      linkScore: entry.score.linkScore,
      themeScore: entry.score.themeScore,
      matchedPageCoverage: entry.score.matchedPageCoverage,
      layer: entry.score.layer,
      adaptationErrorCount: entry.score.adaptationErrorCount,
      adaptationWarningCount: entry.score.adaptationWarningCount,
      fallbackCount: entry.score.fallbackCount,
      errorCount: entry.score.errorCount,
      profileId:
        entry.result?.resolvedByLayer && typeof entry.result.resolvedByLayer === "object"
          ? (entry.result.resolvedByLayer as Record<string, unknown>).templatePlanProfile ?? null
          : null,
    })),
  };

  logInfo(`${logPrefix} generation:candidate_selection`, candidateSelection);
  reportProgress("candidate_selection_completed", {
    selectedStrategy: selected?.strategy ?? sectionGenerationStrategy,
    candidateCount: candidates.length,
  });

  const result = {
    ...(selected?.result ?? primaryResult),
    resolvedByLayer: {
      ...(((selected?.result ?? primaryResult).resolvedByLayer &&
      typeof (selected?.result ?? primaryResult).resolvedByLayer === "object"
        ? (selected?.result ?? primaryResult).resolvedByLayer
        : {}) as Record<string, unknown>),
      candidateSelection,
    },
  };

  const payload = {
    blueprint: result.blueprint ?? {},
    theme: result.theme ?? (result.blueprint as any)?.theme ?? {},
    pages: result.pages ?? [],
    components: result.components ?? [],
    siteBlueprint: result.siteBlueprint ?? {},
    qaReport: result.qaReport ?? {},
    resolvedByLayer: result.resolvedByLayer ?? {},
    errors: result.errors ?? [],
  };
  reportProgress("generation_graph_completed", {
    pageCount: Array.isArray(payload.pages) ? payload.pages.length : 0,
    componentCount: Array.isArray(payload.components) ? payload.components.length : 0,
    errorCount: totalErrorCount(payload.errors),
  });
  return payload;
}
