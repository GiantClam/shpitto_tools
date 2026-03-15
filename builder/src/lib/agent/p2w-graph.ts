import { promises as fs } from "fs";
import path from "path";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
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
import { resolveTemplatePlan } from "@/lib/agent/template-resolver";
import { evaluateGenerationQa } from "@/lib/agent/qa-gate";
import {
  applyLinkGraphToFooterProps,
  applyLinkGraphToNavbarProps,
  buildSiteLinkGraph,
  sanitizeInternalHrefsInProps,
  type SiteLinkGraph,
} from "@/lib/agent/link-graph";

const State = Annotation.Root({
  prompt: Annotation<string>,
  manifest: Annotation<Record<string, unknown>>,
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
  errors: Annotation<string[]>({ value: (_left, right) => right, default: () => [] }),
});

type GraphState = typeof State.State;

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
const defaultMaxPages = Number(process.env.CREATION_MAX_PAGES || 10);
const defaultMaxSectionsPerPage = Number(process.env.CREATION_MAX_SECTIONS_PER_PAGE || 8);
const defaultMaxSectionsTotal = Number(process.env.CREATION_MAX_SECTIONS_TOTAL || 48);
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
  "template_first"
);
const enableMultiCandidateSelection = parseEnvBoolean(
  process.env.BUILDER_MULTI_CANDIDATE_SELECTION,
  true
);
const configuredCandidateStrategies = parseStrategyList(
  process.env.BUILDER_MULTI_CANDIDATE_STRATEGIES,
  ["template_first", "hybrid"]
);
const configuredDetailedCandidateStrategies = parseStrategyList(
  process.env.BUILDER_MULTI_CANDIDATE_DETAILED_STRATEGIES,
  ["template_first", "hybrid", "llm_first"]
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
  if (Number.isFinite(status) && (status === 401 || status === 402 || status === 403)) {
    return true;
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
    subtitle: "Generated with safe fallback template.",
    variant: "content",
    ctaStyle: "auto",
    ctaLabel: "Contact Sales",
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
    ctaLabel = "Contact Sales",
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
  const catalogItems = safeItems.length
    ? safeItems.slice(0, 8)
    : [
        { title: "5-Axis Machining Center", desc: "Rigid structure and stable accuracy for complex parts." },
        { title: "Drilling & Tapping Center", desc: "Fast cycle times for high-volume precision production." },
        { title: "Horizontal Machining Center", desc: "Efficient chip evacuation for continuous heavy-duty work." },
        { title: "Automation Cell", desc: "Integrated loading and handling for scalable throughput." },
      ];

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
                  <CardTitle className="text-base">{item.title || "Product"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.desc || "Customizable specification available."}</p>
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
              <Badge variant="secondary" className="w-fit">Lead Capture</Badge>
              <CardTitle className="text-2xl">{title}</CardTitle>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input placeholder="Name" />
                <Input placeholder="Work Email" />
                <Input placeholder="Company" />
                <Input placeholder="Country" />
              </div>
              <Textarea placeholder="Tell us your product requirements..." rows={5} />
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={ctaHref}>{ctaLabel}</a>
                </Button>
                {whatsapp ? (
                  <Button asChild variant="secondary" size="lg">
                    <a href={whatsapp.startsWith("http") ? whatsapp : \`https://wa.me/\${String(whatsapp).replace(/[^0-9]/g, "")}\`}>WhatsApp</a>
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
              <a href={ctaHref}>{ctaLabel}</a>
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
                      {item?.label || "Link"}
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
      : ["Automotive", "3C Manufacturing", "Mold", "Aerospace", "General Machinery", "Precision Parts"];
    const fallbackTestimonials = safeTestimonials.length
      ? safeTestimonials
      : [
          {
            name: "Operations Director",
            role: "Automotive Components",
            quote:
              "The line reached stable output quickly and maintained accuracy across multi-shift production.",
          },
          {
            name: "Plant Manager",
            role: "Precision Manufacturing",
            quote:
              "Equipment integration and process support helped us improve cycle time without sacrificing quality.",
          },
        ];
    return (
      <section id={anchor} className="py-20 bg-muted/30">
        <div className="mx-auto w-full max-w-[1200px] px-6 space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Industry trust</p>
            <h2 className="font-heading text-3xl md:text-4xl tracking-tight">{title || "Trusted by production teams with demanding quality targets"}</h2>
            {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-6">
            {fallbackLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center rounded-md border border-border/50 bg-background/60 px-4 py-3 text-sm text-muted-foreground"
              >
                {typeof logo === "string" ? logo : logo?.name || "Brand"}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fallbackTestimonials.map((item, index) => (
              <Card key={index} className="border-border/60 bg-background/80">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">{item?.name || "Client"}</CardTitle>
                  <p className="text-xs text-muted-foreground">{item?.role || "Client"}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item?.quote || "Trusted by teams that expect premium execution and clear outcomes."}
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
              <a href={ctaHref}>{ctaLabel}</a>
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
    legal: "© 2026 All rights reserved.",
    columns: [
      {
        title: "Products",
        links: [{ label: "Catalog", href: "#products" }, { label: "Cases", href: "#cases" }]
      },
      {
        title: "Support",
        links: [{ label: "Contact", href: "#contact" }, { label: "Request Quote", href: "#contact" }]
      },
      {
        title: "Legal",
        links: [{ label: "Privacy", href: "#privacy" }]
      }
    ]
  }
};

export default function CreationFooterFallback(props) {
  const {
    anchor = "footer",
    logoText = "Company",
    legal = "© 2026 All rights reserved.",
    columns = []
  } = props || {};
  const safeColumns = Array.isArray(columns) ? columns.slice(0, 4) : [];

  return (
    <footer id={anchor} className="border-t border-border bg-background py-12">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="text-base font-semibold">{logoText || "Company"}</div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-8 md:grid-cols-3">
            {safeColumns.map((col, index) => (
              <div key={\`${'${index}'}-\${col?.title || "col"}\`}>
                <div className="text-sm font-medium">{col?.title || "Links"}</div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(Array.isArray(col?.links) ? col.links : []).slice(0, 10).map((link, linkIndex) => (
                    <li key={\`${'${index}'}-\${linkIndex}\`}>
                      <a href={link?.href || "#"} className="hover:text-foreground transition-colors">
                        {link?.label || "Link"}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">{legal}</div>
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
    return { path, name, sections, root: page?.root };
  });
  const themeContract = (blueprint as ArchitectBlueprint)?.theme?.themeContract as ThemeContract | undefined;
  const alignedPages = applySectionAlignOverrides(pages, themeContract);
  const originalPageCount = alignedPages.length;
  const originalSectionsTotal = alignedPages.reduce((sum, page) => sum + page.sections.length, 0);
  const maxPages = clampPositiveInt(defaultMaxPages, 6, 1, 24);
  const maxSectionsPerPage = clampPositiveInt(defaultMaxSectionsPerPage, 8, 1, 20);
  const maxSectionsTotal = clampPositiveInt(defaultMaxSectionsTotal, 48, 1, 240);
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
  products: [/product|catalog|collection|pricing|plan|showcase|gallery|module|offer|package/],
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
  const raw = String(prompt || "").trim();
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
  const isMedical = /(medical|health|clinic|diagnostic|hospital|medtech)/i.test(normalized);
  const isIndustrial =
    /(industrial|manufactur|manufacturer|factory|machin|equipment|b2b|automation|cnc|procurement|engineering|工业|制造|制造商|工厂|设备|机械|机床|采购|工程|自动化)/i.test(
      normalized
    );
  const industry = isMedical ? "medical-diagnostics" : isIndustrial ? "industrial-manufacturing" : "technology";
  const styleDNA = isMedical
    ? ["clinical", "precise", "trustworthy"]
    : isIndustrial
      ? ["industrial", "precise", "high-clarity"]
      : ["clean", "modern", "high-clarity"];
  const imageMood = isMedical
    ? "clean laboratory and clinical scenes"
    : isIndustrial
      ? "precision machinery, factory-floor details, and controlled industrial photography"
      : "clean product photography";
  const coreProducts = isMedical
    ? ["diagnostic tests", "lab services", "screening"]
    : isIndustrial
      ? ["industrial equipment", "automation systems", "technical support"]
      : ["core service", "platform", "support"];
  const themeVoice = isMedical ? "tech" : isIndustrial ? "industrial" : "minimal";
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
  if (!selectedProfile || (!explicitTemplatePrompt && !(hasProfileCoverage && genericTemplatePrompt))) return null;

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
  if (looksLikeEnterpriseWebsite({ prompt, pages: seedPages }) && requestedPages.length < 3) {
    seedPages = ensureEnterpriseSitePages(seedPages, (definition) => ({
      path: definition.path,
      name: definition.name,
      sections: [],
    })) as ArchitectPage[];
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
  const brand = structuredBrief?.brand || extractBrandNameFromPromptLite(prompt) || "";

  return {
    ...fallbackBlueprint,
    designNorthStar: {
      ...(fallbackBlueprint.designNorthStar && typeof fallbackBlueprint.designNorthStar === "object"
        ? fallbackBlueprint.designNorthStar
        : {}),
      ...(brand ? { brand } : {}),
      ...(selectedProfile.sourceDomain ? { referenceDomain: selectedProfile.sourceDomain } : {}),
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

const shouldUseChineseContent = (prompt: string) => {
  const raw = String(prompt || "");
  const explicitChinese = /(中文|简体|繁體|繁体|chinese|mandarin|zh-cn|zh-hans|zh-hant)/i.test(raw);
  const explicitEnglish = /(英文|english|en-us|en-gb|\benglish\b)/i.test(raw);
  return explicitChinese && !explicitEnglish;
};

const normalizePromptPagePath = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
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
  const token = normalizedLabel.toLowerCase();
  if (!normalizedLabel) return "/";
  if (/^(home|homepage|home page|首页|主页|首屏)$/.test(token)) return "/";
  if (/(about|about us|company|our story|关于|关于我们|公司简介)/.test(token)) return "/about";
  if (/(contact|contact us|get in touch|quote|询价|联系|联系我们)/.test(token)) return "/contact";
  if (/(privacy|privacy policy|policy|隐私|隐私政策)/.test(token)) return "/privacy";
  if (/(case studies|case study|cases|applications|application cases|案例|应用案例|客户案例)/.test(token)) {
    return "/cases";
  }
  const slug = slugifyRequestedPageLabel(normalizedLabel);
  return normalizePromptPagePath(slug ? `/${slug}` : "/");
};

const derivePageNameFromPath = (path: string) => {
  const normalized = normalizePromptPagePath(path);
  if (normalized === "/") return "Home";
  const token = normalized.split("/").filter(Boolean).pop() || "Page";
  return humanizeLabel(token);
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

const collectRequestedPageLabelsFromPrompt = (prompt: string) => {
  const raw = String(prompt || "");
  const labels: string[] = [];
  const navMatches = Array.from(
    raw.matchAll(
      /(?:^|\n|\r)(?:nav(?:igation)?|menu)\s*[:：]\s*([^\n\r]{1,240})/gi
    )
  );
  navMatches.forEach((match) => {
    labels.push(...splitRequestedPageLabelList(match[1] || ""));
  });

  const explicitPageListMatches = Array.from(
    raw.matchAll(
      /(?:with|including|featuring|contains?)\s+([^.\n\r]{1,240}?)\s+(?:pages|routes)(?=[\s,.;]|$)/gi
    )
  );
  explicitPageListMatches.forEach((match) => {
    labels.push(...splitRequestedPageLabelList(match[1] || ""));
  });

  return labels;
};

const extractRequestedPagesFromPrompt = (prompt: string) => {
  const raw = String(prompt || "");
  const useChinese = shouldUseChineseContent(raw);
  const matches = Array.from(
    raw.matchAll(/(?:^|[\s,，、;；:：(\[（【])\/([a-zA-Z0-9\-\/]*)(?:\s*[（(]([^()（）]{1,40})[)）])?/g)
  );
  const seen = new Set<string>();
  const pages: Array<{ path: string; name: string }> = [];
  const pushPage = (pathValue: string, nameValue: string) => {
    const normalizedPath = normalizePromptPagePath(pathValue);
    if (normalizedPath.length > 80) return;
    if (seen.has(normalizedPath)) return;
    seen.add(normalizedPath);
    const normalizedName = String(nameValue || "").trim();
    pages.push({
      path: normalizedPath,
      name: normalizedName || derivePageNameFromPath(normalizedPath),
    });
  };
  matches.forEach((match) => {
    const pathPart = typeof match[1] === "string" ? match[1] : "";
    if (!pathPart && /https?:\/\//i.test(raw)) {
      const cursor = match.index ?? -1;
      if (cursor >= 0) {
        const neighborhood = raw.slice(Math.max(0, cursor - 12), cursor + 12).toLowerCase();
        if (neighborhood.includes("http://") || neighborhood.includes("https://")) return;
      }
    }
    if (/\./.test(pathPart)) return;
    if (/^(www|http|https|com|cn|net|org)$/i.test(pathPart)) return;
    const normalizedPath = normalizePromptPagePath(pathPart ? `/${pathPart}` : "/");
    const rawName = typeof match[2] === "string" ? match[2].trim() : "";
    const name =
      rawName && (useChinese || !/[\u4e00-\u9fff]/.test(rawName))
        ? rawName.slice(0, 48)
        : derivePageNameFromPath(normalizedPath);
    pushPage(normalizedPath, name || derivePageNameFromPath(normalizedPath));
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

const ensureEnterpriseBlueprintPages = (
  blueprint: ArchitectBlueprint | null | undefined,
  prompt: string
): ArchitectBlueprint | null | undefined => {
  if (!blueprint || typeof blueprint !== "object") return blueprint;
  const requestedPages = extractRequestedPagesFromPrompt(prompt);
  const existingPages = Array.isArray(blueprint.pages) ? blueprint.pages : [];
  if (!looksLikeEnterpriseWebsite({ prompt, pages: existingPages })) return blueprint;
  if (requestedPages.length >= 3) return blueprint;
  const pages = ensureEnterpriseSitePages(existingPages, (definition) => ({
    path: definition.path,
    name: definition.name,
    sections: [],
  }));
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

const extractPromptBrandName = (prompt: string): string => {
  const quoted = prompt.match(/["「]([^"」]{1,40})["」]/);
  if (quoted) return quoted[1].trim();
  const chinese = prompt.match(/为\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s-]{1,30})\s*(?:生成|制作|创建|构建|设计)/i);
  if (chinese) return chinese[1].trim();
  const english = prompt.match(/for\s+([A-Za-z][A-Za-z0-9\s-]{1,40})\s+(?:generate|build|create|design)/i);
  if (english) return english[1].trim();
  const named = prompt.match(/(?:叫|called|named|品牌名?(?:为|是)?)\s*[：:]?\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s]{0,30})/i);
  if (named) return named[1].trim();
  return "";
};

const buildNavbarLinks = (
  page: ReturnType<typeof normalizePages>[number],
  linkGraph?: SiteLinkGraph
) => {
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
      const label = humanizeLabel(String(section.id || section.type || "Section"));
      const compacted = compactNavbarLabel(label);
      return { label: compacted || "Section", href: `#${section.id}`, variant: "link" as const };
    });
  return links.length ? links : [{ label: "Home", href: "#top", variant: "link" as const }];
};

const buildNavbarCtas = (
  page: ReturnType<typeof normalizePages>[number],
  linkGraph?: SiteLinkGraph
) => {
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
    ? "Contact"
    : key.includes("pricing")
      ? "Pricing"
      : key.includes("trial")
        ? "Start Trial"
        : "Get Started";
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
  const links = buildNavbarLinks(page, linkGraph);
  const ctas = buildNavbarCtas(page, linkGraph) ?? [];
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
  linkGraph?: SiteLinkGraph
) => {
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
      title: "Products",
      links: sectionLinks.length
        ? sectionLinks.slice(0, 2)
        : [
            { label: "Catalog", href: "#products", variant: "link" as const },
            { label: "Cases", href: "#cases", variant: "link" as const },
          ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact", href: "#contact", variant: "primary" as const },
        { label: "Request Quote", href: "#contact", variant: "secondary" as const },
      ],
    },
    {
      title: "Legal",
      links: [{ label: "Privacy", href: "#privacy", variant: "link" as const }],
    },
  ];
};

const buildFooterProps = (
  page: ReturnType<typeof normalizePages>[number],
  theme: Record<string, unknown>,
  linkGraph?: SiteLinkGraph,
  prompt?: string
) => {
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
    columns: buildFooterColumns(page, linkGraph),
    legal: `© ${new Date().getFullYear()} ${footerBrand}. All rights reserved.`,
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

const buildDeterministicFallbackBlock = (
  context: SectionContext,
  prompt: string,
  designNorthStar?: Record<string, unknown>,
  theme?: Record<string, unknown>,
  options?: {
    skipRegistry?: boolean;
  }
): SectionBlock => {
  const token = sectionToken(context);
  const promptBrand = extractPromptBrandName(String(prompt || ""));
  const isZhPrompt = shouldUseChineseContent(String(prompt || ""));
  const lowerPrompt = String(prompt || "").toLowerCase();
  const cncIntent =
    /(cnc|machine tool|machine-tools|machining|metal cutting|milling|lathe|spindle|five-axis|5-axis|加工中心|机床|数控|刀具|切削)/i.test(
      lowerPrompt
    );
  const industry =
    typeof designNorthStar?.industry === "string" && designNorthStar.industry.trim()
      ? designNorthStar.industry.trim()
      : isZhPrompt
        ? "行业"
        : "industry";
  const pagePath = String(context.pagePath || "/").toLowerCase();
  const pageKind = pagePath === "/" ? "home" : pagePath.replace(/^\/+/, "").split("/")[0] || "home";
  const shortPrompt = trimLine(prompt, "Industrial Automation Platform", 68);
  const safeHeroTitle = isZhPrompt
    ? `${promptBrand || "企业"}${industry}解决方案`
    : `${promptBrand || "Company"} ${industry} Solutions`;
  const safeSiteTitle = isZhPrompt
    ? `${promptBrand || "企业"} 咨询入口`
    : `${promptBrand || "Company"} Contact`;
  const idBase = `${toSlug(context.section.type || "section") || "section"}-${context.sectionIndex + 1}`;
  const anchor = context.section.id;
  const pageAwareStory =
    cncIntent && !isZhPrompt
      ? {
          home: {
            title: "Built for precision machining",
            subtitle: "From rigid machine structures to automated cells, every system is designed for repeatable output.",
            body: "灵创智能 combines process engineering, spindle know-how, and production-line integration to help factories increase accuracy, stability, and throughput.",
          },
          solutions: {
            title: "Solutions engineered around real production constraints",
            subtitle: "Application-ready machining workflows for complex parts, multi-shift uptime, and scalable automation.",
            body: "We structure each solution around part geometry, takt time, tooling, and downstream quality requirements so each line can ramp with fewer compromises.",
          },
          products: {
            title: "Machine platforms for high-mix precision manufacturing",
            subtitle: "A focused portfolio covering core machining scenarios across drilling, milling, tapping, and flexible automation.",
            body: "Each platform is configured to balance rigidity, cycle time, maintainability, and integration with loaders, robots, spindle systems, and tool magazines.",
          },
          industries: {
            title: "Production scenarios we support",
            subtitle: "Field-proven manufacturing layouts tailored to automotive, 3C, mold, aerospace, and general machinery factories.",
            body: "Our team aligns machine architecture, automation rhythm, and quality checkpoints with each industry's tolerance window and throughput target.",
          },
          cases: {
            title: "Measured outcomes from factory deployments",
            subtitle: "Examples focused on cycle time reduction, yield improvement, and stable multi-line delivery.",
            body: "Case studies show how process tuning, equipment integration, and automation planning improve productivity without compromising part quality.",
          },
          about: {
            title: "Engineering discipline behind the brand",
            subtitle: "A manufacturing partner built around precision, response speed, and long-term service capability.",
            body: "灵创智能 brings together mechanical design, controls integration, and production support to help manufacturers build robust machining capacity.",
          },
          contact: {
            title: "Start with your part, process, and capacity goals",
            subtitle: "We translate machining requirements into practical equipment and automation proposals.",
            body: "Share your part family, takt target, and plant constraints, and our team will outline a deployment path that fits your production environment.",
          },
        }
      : null;
  const pageAwareHero =
    cncIntent && !isZhPrompt
      ? {
          home: {
            eyebrow: "Precision CNC manufacturing",
            title: `${promptBrand || "Lingchuang"} machine tools for high-performance production`,
            subtitle:
              "Five-axis machining centers, drilling and tapping platforms, horizontal machining centers, and automation-ready production cells for modern factories.",
          },
          solutions: {
            eyebrow: "Manufacturing solutions",
            title: "Solutions built around parts, takt time, and uptime",
            subtitle:
              "Integrated machining and automation strategies for automotive, 3C precision manufacturing, mold production, aerospace, and general industrial parts.",
          },
          products: {
            eyebrow: "Product portfolio",
            title: "Machine platforms for precise, stable, scalable output",
            subtitle:
              "Explore machining centers, drilling and tapping systems, automation units, and spindle-tool magazine packages configured for demanding production lines.",
          },
          industries: {
            eyebrow: "Industry applications",
            title: "Configured for the industries that demand repeatable precision",
            subtitle:
              "Production-ready equipment and process layouts tailored to automotive components, consumer electronics, mold making, aerospace, and general machinery.",
          },
          cases: {
            eyebrow: "Customer results",
            title: "Factory deployments that improved cycle time and output quality",
            subtitle:
              "See how equipment upgrades, automation integration, and process optimization delivered measurable gains in throughput, consistency, and flexibility.",
          },
          about: {
            eyebrow: "About Lingchuang",
            title: "Engineering-first manufacturing support from planning to delivery",
            subtitle:
              "A team focused on machine reliability, process fit, and service responsiveness across the full lifecycle of precision production equipment.",
          },
          contact: {
            eyebrow: "Contact Lingchuang",
            title: "Discuss your machining requirements with our engineering team",
            subtitle:
              "Get guidance on machine selection, line planning, automation configuration, spindle systems, and rollout strategy.",
          },
        }
      : null;
  const pageAwareCatalog =
    cncIntent && !isZhPrompt
      ? {
          products: {
            title: "Core Product Platforms",
            subtitle: "Production-ready CNC platforms tuned for 3C machining, precision enclosures, and repeatable factory output.",
            items: [
              {
                title: "5-Axis Machining Center",
                description: "Rigid multi-axis machining for complex aluminum and magnesium parts with stable precision.",
              },
              {
                title: "High-Speed Drilling & Tapping Center",
                description: "Short-cycle drilling, tapping, and finishing for high-volume 3C components and shells.",
              },
              {
                title: "Horizontal Machining Center",
                description: "Reliable chip evacuation and spindle stability for continuous production workloads.",
              },
            ],
          },
          solutions: {
            title: "Custom Solution Packages",
            subtitle: "Integrated machine + tooling + automation packages built around takt time, fixture strategy, and downstream quality.",
            items: [
              {
                title: "Phone Frame Machining Cell",
                description: "Fixtures, spindle tuning, and loader integration configured for thin-wall aluminum frames.",
              },
              {
                title: "Laptop Shell Production Line",
                description: "High-speed drilling, tapping, deburring, and transfer automation for multi-process shell manufacturing.",
              },
              {
                title: "Camera Bezel Finishing Package",
                description: "Precision cutting and polishing-ready workflows for tight-tolerance cosmetic components.",
              },
            ],
          },
          industries: {
            title: "Industries We Serve",
            subtitle: "Factory-ready machine platforms tailored to the tolerance windows, materials, and throughput needs of each segment.",
            items: [
              {
                title: "3C Electronics",
                description: "High-speed machining for phone frames, laptop shells, camera bezels, and keypad components.",
              },
              {
                title: "Automotive Components",
                description: "Stable machining for housings, brackets, and precision structural parts under demanding cycle-time targets.",
              },
              {
                title: "Aerospace & Precision Parts",
                description: "Repeatable machining strategies for complex parts requiring high rigidity and process control.",
              },
            ],
          },
          cases: {
            title: "Deployment Highlights",
            subtitle: "Representative programs showing cycle-time gains, faster ramp-up, and consistent output quality.",
            items: [
              {
                title: "Phone Display Frame Program",
                description: "Reduced changeover friction while maintaining stable precision across high-mix frame variants.",
              },
              {
                title: "Laptop Shell Production Upgrade",
                description: "Improved takt-time consistency with integrated loading and optimized drilling/tapping sequences.",
              },
              {
                title: "Camera Bezel Cell Retrofit",
                description: "Lifted finish quality and throughput through spindle, fixture, and process refinements.",
              },
            ],
          },
        }
      : null;
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
          { label: "Home", href: "#top", variant: "link" },
          { label: "Services", href: "#services", variant: "link" },
          { label: "About", href: "#about", variant: "link" },
          { label: "Contact", href: "#contact", variant: "link" },
        ],
        ctas: [{ label: "Get Started", href: "#contact", variant: "primary" }],
        variant: "simple",
        sticky: true,
        paddingY: "sm",
        maxWidth: "xl",
      },
    };
  }

  if (/hero|pagehero|pageheader/.test(token)) {
    const heroCopy = pageAwareHero?.[pageKind as keyof typeof pageAwareHero];
    return {
      type: "HeroSplit",
      props: {
        id: idBase,
        anchor,
        eyebrow: heroCopy?.eyebrow ?? "Industrial Solutions",
        title: heroCopy?.title ?? safeHeroTitle,
        subtitle:
          heroCopy?.subtitle ??
          "High-performance machinery, precision engineering, and integrated digital workflows for modern factories.",
        ctas: [
          { label: "Explore Products", href: "#products", variant: "primary" },
          { label: "Contact Sales", href: "#contact", variant: "secondary" },
        ],
        mediaPosition: "right",
        paddingY: "lg",
        maxWidth: "xl",
      },
    };
  }

  if (/product|catalog|bundle|comparison/.test(token)) {
    const catalogCopy = pageAwareCatalog?.[pageKind as keyof typeof pageAwareCatalog];
    return {
      type: "CardsGrid",
      props: {
        id: idBase,
        anchor,
        title: catalogCopy?.title ?? (cncIntent && !isZhPrompt ? "Core Product Platforms" : "Product Lines"),
        subtitle:
          catalogCopy?.subtitle ??
          (cncIntent && !isZhPrompt
            ? "Machine tools, spindle systems, and automation units configured for precision manufacturing."
            : "Modular machines for cutting, finishing, and automated handling."),
        variant: "product",
        columns: "3col",
        density: "normal",
        cardStyle: "solid",
        maxWidth: "xl",
        items: (catalogCopy?.items ?? [
          {
            title: "CNC Router Series",
            description: "High-speed milling with repeatable accuracy for industrial workloads.",
            cta: { label: "Details", href: "#", variant: "link" },
          },
          {
            title: "Edge Processing Units",
            description: "Stable edge finishing and profiling for continuous production lines.",
            cta: { label: "Details", href: "#", variant: "link" },
          },
          {
            title: "Automated Cells",
            description: "Integrated robotics and software control for end-to-end throughput.",
            cta: { label: "Details", href: "#", variant: "link" },
          },
        ]).map((item) => ({
          ...item,
          cta: { label: "Learn More", href: "#", variant: "link" as const },
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
        title: "Latest Stories",
        variant: "cards",
        maxWidth: "xl",
        items: [
          {
            title: "Factory throughput increased by 32%",
            summary: "A production line upgrade combining motion control and predictive maintenance.",
            href: "#",
            tags: ["Automation", "Manufacturing"],
          },
          {
            title: "Precision finishing with lower scrap rate",
            summary: "How calibration and tooling strategy improved output quality.",
            href: "#",
            tags: ["Quality", "Operations"],
          },
          {
            title: "Digital twin rollout in phased deployment",
            summary: "Practical adoption path for plant-wide monitoring and diagnostics.",
            href: "#",
            tags: ["Digital Twin", "IIoT"],
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
        title: "Customer Feedback",
        variant: "2col",
        maxWidth: "xl",
        items: [
          {
            quote: "Deployment was fast and the stability under peak load is excellent.",
            name: "Plant Director",
            role: "Heavy Industry",
          },
          {
            quote: "The interface is clean and operators became productive in days.",
            name: "Production Manager",
            role: "Advanced Manufacturing",
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
        title: cncIntent && !isZhPrompt ? "What manufacturing teams say" : "What collaborators say",
        variant: "2col",
        maxWidth: "xl",
        items: [
          {
            quote: "Execution quality and communication remained consistent from concept through delivery.",
            name: "Partner Team",
            role: "Enterprise Client",
          },
          {
            quote: "The result balanced brand expression and conversion clarity with minimal iteration.",
            name: "Design Lead",
            role: "Product Organization",
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
        title: "Trusted by leading teams",
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
    const storyCopy = pageAwareStory?.[pageKind as keyof typeof pageAwareStory];
    return {
      type: "ContentStory",
      props: {
        id: idBase,
        anchor,
        title: storyCopy?.title ?? "Our Story",
        subtitle: storyCopy?.subtitle ?? "A concise narrative that connects brand intent, craft, and client outcomes.",
        body: storyCopy?.body ?? "We combine strategic clarity, visual refinement, and execution discipline to create enduring digital experiences.",
        ctas: [{ label: "Explore More", href: "#", variant: "link" }],
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
        title: "Service Plans",
        variant: "3up",
        maxWidth: "xl",
        plans: [
          {
            name: "Starter",
            price: "$299",
            period: "mo",
            features: ["Remote diagnostics", "Email support", "Weekly reports"],
            cta: { label: "Choose Starter", href: "#contact", variant: "secondary" },
          },
          {
            name: "Pro",
            price: "$699",
            period: "mo",
            highlighted: true,
            features: ["Priority support", "On-site tuning", "Advanced analytics"],
            cta: { label: "Choose Pro", href: "#contact", variant: "primary" },
          },
          {
            name: "Enterprise",
            price: "Custom",
            period: "mo",
            features: ["Dedicated team", "SLA contract", "Custom integration"],
            cta: { label: "Contact Sales", href: "#contact", variant: "link" },
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
        title: "FAQ",
        variant: "singleOpen",
        maxWidth: "xl",
        items: [
          {
            q: "How long does deployment take?",
            a: "Typical setup takes 2 to 6 weeks based on the existing production environment.",
          },
          {
            q: "Do you support existing PLC systems?",
            a: "Yes, we provide integration options for common PLC and MES stacks.",
          },
          {
            q: "Can we start with one line first?",
            a: "Yes, phased rollout is supported to reduce risk and validate ROI early.",
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
      : cncIntent
        ? "Share your part requirements, output targets, and plant constraints to receive a practical machining and automation proposal."
        : `Share your ${industry} goals and receive a tailored implementation plan.`;
    const ctaLabel = isZhPrompt ? "预约咨询" : "Contact Sales";
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
            title: "Products",
            links: [
              { label: "Machines", href: "#" },
              { label: "Automation", href: "#" },
              { label: "Software", href: "#" },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "About", href: "#" },
              { label: "News", href: "#" },
              { label: "Contact", href: "#contact" },
            ],
          },
          {
            title: "Legal",
            links: [
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
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
        title: cncIntent && !isZhPrompt ? "Manufacturing Capabilities" : "Key Capabilities",
        subtitle:
          cncIntent && !isZhPrompt
            ? "Built for rigid machining, predictable uptime, and scalable factory deployment."
            : "Designed for uptime, precision, and scalable production.",
        variant: "3col",
        maxWidth: "xl",
        items: [
          {
            title: "Process Reliability",
            desc: "Stable operation with predictable performance under continuous load.",
            icon: "shield",
          },
          {
            title: "Precision Control",
            desc: "Tight tolerances through calibrated hardware and software workflows.",
            icon: "target",
          },
          {
            title: "Operational Visibility",
            desc: "Actionable monitoring across machine states, maintenance, and throughput.",
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
        : `Built for ${industry} scenarios with a scalable implementation approach.`,
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
      ? intent || "Ready to define your space?"
      : sectionLabel || "Section";
  const subtitle =
    intent ||
    (variant === "cta"
      ? "Book a private consultation or browse our curated portfolio."
      : variant === "socialProof"
        ? "Building trust with collaborators and client stories."
      : "") ||
    (variant === "contact"
      ? "Share your product requirements and we will respond quickly."
      : variant === "catalog"
        ? "Core product lines with customizable specifications."
        : "This section is generated using a resilient fallback template.");
  const ctaLabel = variant === "cta" ? "Inquire Now" : variant === "contact" ? "Send Inquiry" : "Get Started";
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
    formFields: formFields.length ? formFields : ["name", "email", "company", "message"],
    secondaryCtaLabel,
    secondaryCtaHref,
    legal: variant === "cta" ? legal ?? "© 2026 All rights reserved." : legal,
    footerLinks:
      variant === "cta"
        ? footerLinks ??
          [
            { label: "Privacy", href: "#privacy" },
            { label: "Terms", href: "#terms" },
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
  const text = String(prompt || "");
  const quoted = text.match(/["「]([^"」]{1,40})["」]/);
  if (quoted) return quoted[1].trim();
  const labeled = text.match(/Company name\s*[:：]\s*([A-Za-z][A-Za-z0-9&.\s-]{1,40})/i);
  if (labeled) return labeled[1].trim();
  const chinese = text.match(/为\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s-]{1,30})\s*(?:生成|制作|创建|构建|设计)/i);
  if (chinese) return chinese[1].trim();
  const english = text.match(/for\s+([A-Za-z][A-Za-z0-9&.\s-]{1,40})\s+(?:generate|build|create|design)/i);
  if (english) return english[1].trim();
  const englishInline = text.match(/for\s+([A-Za-z][A-Za-z0-9&.\s-]{1,40}?)(?:\s*\(|,|\s+(?:an?|the)\b)/i);
  if (englishInline) return englishInline[1].trim();
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
  const raw = `${String(prompt || "")} ${String(designNorthStar?.industry || "")} ${JSON.stringify(
    designNorthStar?.coreProducts || []
  )}`.toLowerCase();
  const replacements: Array<{ pattern: RegExp; value: string }> = [];
  const cncIntent =
    /(cnc|machine tool|machine-tools|machining|metal cutting|milling|lathe|spindle|five-axis|5-axis|加工中心|机床|数控|刀具|切削)/i.test(
      raw
    );
  if (cncIntent) {
    replacements.push(
      { pattern: /\bsmart telescopes?\b/gi, value: "CNC platforms" },
      { pattern: /\btelescopes?\b/gi, value: "machine tools" },
      { pattern: /\bsmart binoculars?\b/gi, value: "automation modules" },
      { pattern: /\bbinoculars?\b/gi, value: "automation modules" },
      { pattern: /\bstargazing\b/gi, value: "precision manufacturing" },
      { pattern: /\bnight sky\b/gi, value: "factory operations" },
      { pattern: /\bnight skies\b/gi, value: "production environments" },
      { pattern: /\buniverse\b/gi, value: "the shop floor" },
      { pattern: /\bastronom(?:y|er|ers)\b/gi, value: "manufacturing teams" },
      { pattern: /\bspace\b/gi, value: "manufacturing" },
      { pattern: /\bsky\b/gi, value: "shop floor" },
      { pattern: /\bskies\b/gi, value: "production environments" },
      { pattern: /\bbackyard\b/gi, value: "facility" },
      { pattern: /\bobservers?\b/gi, value: "operators" },
      { pattern: /\bobserving\b/gi, value: "machining" },
      { pattern: /\bobservation\b/gi, value: "production monitoring" },
      { pattern: /\bexplorers?\b/gi, value: "manufacturing teams" },
      { pattern: /\bdiscovery\b/gi, value: "deployment" },
      { pattern: /\bdeep-sky\b/gi, value: "precision-process" },
      { pattern: /\bmoon craters?\b/gi, value: "micron tolerances" },
      { pattern: /\bnebulae\b/gi, value: "fine details" },
      { pattern: /\bmachine vision\b/gi, value: "process automation" },
      { pattern: /\bcomputer vision\b/gi, value: "process control" },
      { pattern: /\bai vision\b/gi, value: "CNC automation" },
      { pattern: /\binspection systems?\b/gi, value: "machine platforms" },
      { pattern: /\bedge vision modules?\b/gi, value: "automation modules" },
      { pattern: /\borion\b/gi, value: "5-axis" },
      { pattern: /\bandromeda\b/gi, value: "adaptive control" },
      { pattern: /\bnebula\b/gi, value: "precision" },
      { pattern: /\bgalax(?:y|ies)\b/gi, value: "production lines" },
      { pattern: /\bcosmos\b/gi, value: "factory operations" },
      { pattern: /\bstellar\b/gi, value: "high-performance" },
      { pattern: /\bfirst clear night\b/gi, value: "the first production run" },
      { pattern: /\bfirst-time observer\b/gi, value: "first-line operator" },
      { pattern: /\bastrophotography hobbyist\b/gi, value: "process engineer" },
      { pattern: /\bscience educator\b/gi, value: "production trainer" },
      { pattern: /\boutreach nights\b/gi, value: "factory trials" },
      { pattern: /\bwonder\b/gi, value: "throughput" },
      { pattern: /\bprivate sky rituals\b/gi, value: "single-cell machining workflows" },
      { pattern: /\bguided group experiences\b/gi, value: "multi-line deployment workflows" },
      { pattern: /\binstitution-grade observation workflows\b/gi, value: "plant-wide machining workflows" },
      { pattern: /\bexplain brand narrative and positioning\b/gi, value: "Application-ready deployment frameworks" },
      { pattern: /\balign themselves\b/gi, value: "auto-calibrate" },
      { pattern: /\bsuppress light pollution\b/gi, value: "stabilize production noise" },
      { pattern: /\breveal deep-sky detail live in minutes\b/gi, value: "deliver process visibility in minutes" },
      { pattern: /\bplanetarium-grade optics\b/gi, value: "micron-level engineering" },
      { pattern: /\bcity production environments\b/gi, value: "demanding production environments" },
      { pattern: /\bwhat they were seeing\b/gi, value: "what the machine was doing" },
      { pattern: /\bcommunity manufacturing teams club\b/gi, value: "manufacturing consortium" },
      { pattern: /\bdeep-shop floor\b/gi, value: "process-level" },
      { pattern: /\bobservatories\b/gi, value: "production teams" },
      { pattern: /\bpublishers?\b/gi, value: "manufacturers" },
      { pattern: /\bresearch organizations?\b/gi, value: "industrial partners" },
      { pattern: /\bnasa\b/gi, value: "Automotive OEMs" },
      { pattern: /\bseti\b/gi, value: "Precision Suppliers" },
      { pattern: /\bjpl\b/gi, value: "Aerospace Manufacturers" },
      { pattern: /\bexplore telescopes\b/gi, value: "Explore Solutions" },
      { pattern: /\border yours\b/gi, value: "Request a Quote" },
      { pattern: /\blive enhanced\b/gi, value: "real-time stabilized" },
      { pattern: /\blearn more\b/gi, value: "Learn More" }
    );
  }
  return replacements;
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

const extractLabeledBlock = (value: string, labels: string[]) => {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      String.raw`(?:^|\n)\s*${escaped}\s*[:：]\s*([\s\S]*?)(?=\n\s*(?:[A-Z][A-Za-z0-9 &/+\-]{1,60}|Page-specific intent|Business details|Avoid these failure modes|Home page requirements|Home page content requirements|Routes must be exactly|Navigation must be exactly)\s*[:：]|\n\s*$|$)`,
      "i"
    );
    const match = value.match(pattern);
    const resolved = match?.[1]?.trim();
    if (resolved) return resolved;
  }
  return "";
};

const parseStructuredBrief = (prompt: string): StructuredBrief | null => {
  const header = extractPromptBriefSection(prompt, "Header");
  const hero = extractPromptBriefSection(prompt, "Hero Section");
  const productGrid = extractPromptBriefSection(prompt, "Product Grid");
  const featureStrip = extractPromptBriefSection(prompt, "Features Strip");
  const caseSlider = extractPromptBriefSection(prompt, "Case Slider");
  const about = extractPromptBriefSection(prompt, "About");
  const certification = extractPromptBriefSection(prompt, "Certification");
  const footer = extractPromptBriefSection(prompt, "Footer");
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
  const fallbackBusinessDetails = extractLabeledBlock(prompt, ["Business details"]);
  const fallbackFooter = extractLabeledBlock(prompt, ["Footer"]);
  const logo =
    header.match(/Logo\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    extractFirstLineMatch(prompt, [/Company name\s*[:：]\s*(.+)/i]) ||
    "";
  const nav = parsePipeList(
    header.match(/Nav\s*[:：]\s*(.+)/i)?.[1] ||
      extractFirstLineMatch(prompt, [
        /Navigation(?: must be exactly)?\s*[:：]\s*(.+)/i,
        /Nav\s*[:：]\s*(.+)/i,
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
    extractFirstLineMatch(prompt, [/(?:^|\n)\s*Hero title\s*[:：]\s*(.+)/i, /(?:^|\n)\s*Title\s*[:：]\s*(.+)/i]) ||
    compactHeroTitle;
  const heroSubtitle =
    hero.match(/Sub\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    extractFirstLineMatch(prompt, [
      /(?:^|\n)\s*Hero subtitle\s*[:：]\s*(.+)/i,
      /(?:^|\n)\s*Sub(?:title)?\s*[:：]\s*(.+)/i,
    ]) ||
    compactHeroSubtitle;
  const ctaLine =
    hero.match(/CTA\s*[:：]\s*(.+)/i)?.[1] ||
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
  const combinedProductGrid = [productGrid, fallbackProductGrid].filter(Boolean).join("\n");
  const combinedFeatureStrip = [featureStrip, fallbackFeatureStrip].filter(Boolean).join("\n");
  const combinedCaseSlider = [caseSlider, fallbackCaseSlider].filter(Boolean).join("\n");
  const combinedAbout = [about, fallbackAbout].filter(Boolean).join("\n");
  const combinedCertification = [certification, fallbackCertification].filter(Boolean).join("\n");
  const combinedFooter = [footer, fallbackFooter, fallbackBusinessDetails].filter(Boolean).join("\n");
  if (
    !header &&
    !hero &&
    !productGrid &&
    !featureStrip &&
    !caseSlider &&
    !about &&
    !footer &&
    !heroTitle &&
    !heroSubtitle &&
    !heroCtas.length &&
    !combinedProductGrid &&
    !combinedFeatureStrip &&
    !combinedCaseSlider &&
    !combinedAbout &&
    !combinedFooter
  ) {
    return null;
  }
  const footerLinkLine =
    combinedFooter
      .split(/\n+/)
      .map((line) => line.trim())
      .find((line) => line.includes("|") && !/whatsapp|email|address|copyright/i.test(line)) || "";
  const footerLinks = parsePipeList(footerLinkLine).filter((label) => !/^sitemap$/i.test(label));
  const whatsapp = combinedFooter.match(/WhatsApp\s*[:：]\s*([+0-9-]+)/i)?.[1]?.trim() || "";
  const email = combinedFooter.match(/Email\s*[:：]\s*([^\s]+@[^\s]+)/i)?.[1]?.trim() || "";
  const address = combinedFooter.match(/Address\s*[:：]\s*(.+)/i)?.[1]?.trim() || "";
  const copyright = combinedFooter.match(/Copyright\s*©?\s*\d{4}.*$/im)?.[0]?.trim() || "";
  return {
    brand: logo || extractBrandNameFromPromptLite(prompt) || "Brand",
    nav,
    heroTitle,
    heroSubtitle,
    heroCtas,
    productItems: parseBulletList(combinedProductGrid),
    featureItems: parseBulletList(combinedFeatureStrip),
    caseItems:
      parsePipeList(
        combinedCaseSlider.match(/([A-Za-z0-9&+.,' -]+(?:\s*\|\s*[A-Za-z0-9&+.,' -]+)+)/)?.[1] || ""
      ) || parseBulletList(combinedCaseSlider),
    aboutText: combinedAbout.replace(/\s+/g, " ").trim(),
    certifications: parsePipeList(combinedCertification.replace(/\n/g, " | ")),
    footerLinks,
    whatsapp,
    email,
    address,
    copyright,
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
};

const applyStructuredBriefOverrides = (
  pages: GeneratedPage[],
  prompt: string,
  profileIdHint?: string | null
): GeneratedPage[] => {
  const brief = parseStructuredBrief(prompt);
  if (!brief) return pages;
  const templateFamilyHint = inferTemplateFamily(
    profileIdHint ||
      pages
        .flatMap((page) =>
          Array.isArray(page?.data?.content)
            ? page.data.content.map((item) => `${String(item?.type || "")} ${String(item?.props?.__publishedOriginalType || "")}`)
            : []
        )
        .join(" ")
  );
  const scenarioHint = inferKnownSiteScenario(prompt, []);
  const explicitlyRequestedPages = extractRequestedPagesFromPrompt(prompt);
  const hasExplicitPageContract = explicitlyRequestedPages.length >= 3 || Boolean(brief.nav?.length);
  const hasKnownFamily = templateFamilyHint !== "unknown";
  const shellTone =
    scenarioHint === "design_led_ecommerce" || scenarioHint === "luxury_editorial" ? "light" : "dark";
  const assemblyPolicy = {
    normalizeHeader: hasKnownFamily,
    normalizeFooter: hasKnownFamily,
    ensureContactChannels: hasKnownFamily,
    normalizeHomeHero: hasKnownFamily && scenarioHint === "industrial_manufacturer",
    normalizeHomeProducts:
      hasKnownFamily && (scenarioHint === "industrial_manufacturer" || scenarioHint === "design_led_ecommerce"),
    normalizeHomeFeatures: hasKnownFamily && scenarioHint === "industrial_manufacturer",
    normalizeInteriorPages: hasKnownFamily && scenarioHint === "industrial_manufacturer",
  };
  const preserveEnterpriseCoverage = looksLikeEnterpriseWebsite({
    prompt,
    pages: pages.map((page) => ({ path: page.path, name: page.name })),
  });
  const enterprisePagesByPath = new Map(
    pages.map((page) => [String(page.path || "/").trim() || "/", { path: String(page.path || "/").trim() || "/", name: String(page.name || "").trim() }] as const)
  );
  const enterpriseNavLinks =
    preserveEnterpriseCoverage && !hasExplicitPageContract
      ? ENTERPRISE_SITE_PAGES.map((definition) => {
          const page = enterprisePagesByPath.get(definition.path);
          if (!page) return null;
          return {
            label: page.name || definition.name,
            href: definition.path,
            variant: "link" as const,
          };
        }).filter((item): item is { label: string; href: string; variant: "link" } => Boolean(item))
    : [];
  const enterpriseFooterCols = preserveEnterpriseCoverage
    && !hasExplicitPageContract
    ? (() => {
        const pick = (key: string, fallbackLabel: string, fallbackHref = "/") => {
          const definition = ENTERPRISE_SITE_PAGES.find((page) => page.key === key);
          const href = definition?.path || fallbackHref;
          const page = enterprisePagesByPath.get(href);
          if (!page) return null;
          return {
            label: page.name || fallbackLabel,
            href,
          };
        };
        const overviewLinks = [pick("home", "Home"), pick("core_product", "Core Product"), pick("products", "Products")].filter(
          (item): item is { label: string; href: string } => Boolean(item)
        );
        const solutionLinks = [pick("solutions", "Solutions"), pick("cases", "Cases")].filter(
          (item): item is { label: string; href: string } => Boolean(item)
        );
        const companyLinks = [pick("about", "About"), pick("contact", "Contact")].filter(
          (item): item is { label: string; href: string } => Boolean(item)
        );
        const legalLinks = [pick("privacy", "Privacy")].filter(
          (item): item is { label: string; href: string } => Boolean(item)
        );
        return [
          {
            title: "Overview",
            links: overviewLinks,
          },
          {
            title: "Solutions",
            links: solutionLinks,
          },
          {
            title: "Company",
            links: companyLinks,
          },
          {
            title: "Legal",
            links: legalLinks,
          },
        ].filter((column) => column.links.length > 0);
      })()
    : [];
  const inferEffectiveBlockType = (type: string, originalType = "") => {
    const token = `${String(type || "").trim()} ${String(originalType || "").trim()}`.trim();
    if (!token) return "";
    if (token === "Navbar") return "Navbar";
    if (/(^|[^a-z])(header|navigation|topnav|menu)([^a-z]|$)/i.test(token)) return "Navbar";
    if (token === "CreationFooterFallback" || token === "Footer") return "CreationFooterFallback";
    if (/Hero/i.test(token)) return "HeroSplit";
    if (/Story|Mission|Narrative|About/i.test(token)) return "ContentStory";
    if (/Feature|Approach|Capability|Metric/i.test(token)) return "FeatureGrid";
    if (/Product|Catalog|Collection|Gallery|Showcase/i.test(token)) return "CardsGrid";
    if (/Testimonial|Review|Trust|Logo|Partner|Proof/i.test(token)) return "TestimonialsGrid";
    if (/Contact|Quote|Lead|Cta|CTA/i.test(token)) return "LeadCaptureCTA";
    return String(type || "").trim();
  };
  const inferDisplaySectionKind = (type: string, originalType = "") => {
    const token = inferEffectiveBlockType(type, originalType);
    if (!token) return "";
    if (token === "Navbar") return "navigation";
    if (token === "CreationFooterFallback" || token === "Footer") return "footer";
    if (/Hero/i.test(token)) return "hero";
    if (token === "ContentStory") return "story";
    if (token === "FeatureGrid") return "approach";
    if (token === "CardsGrid" || token === "ProductShowcase") return "products";
    if (token === "TestimonialsGrid" || token === "LogoCloud") return "socialproof";
    if (token === "LeadCaptureCTA") return "cta";
    return "";
  };
  const inferPageTypeFromPath = (pagePath: string) => {
    const normalized = String(pagePath || "/").trim() || "/";
    if (normalized === "/") return "home";
    if (normalized.startsWith("/products") || normalized.startsWith("/3c-machines")) return "products";
    if (
      normalized.startsWith("/solutions") ||
      normalized.startsWith("/custom-solutions") ||
      normalized.startsWith("/industries")
    ) {
      return "solutions";
    }
    if (normalized.startsWith("/cases")) return "cases";
    if (normalized.startsWith("/about")) return "about";
    if (normalized.startsWith("/contact")) return "contact";
    return "generic";
  };
  const navHrefForLabel = (label: string) => {
    const normalized = String(label || "").trim().toLowerCase();
    if (normalized === "home") return "/";
    if (/3c|machine/.test(normalized)) return "/3c-machines";
    if (/custom|solution/.test(normalized)) return "/custom-solutions";
    if (/case/.test(normalized)) return "/cases";
    if (/industr/.test(normalized)) return "/industries";
    if (/about/.test(normalized)) return "/about";
    if (/contact/.test(normalized)) return "/contact";
    return "/";
  };
  const productsHref = navHrefForLabel("3C Machines");
  const solutionsHref = navHrefForLabel("Custom Solutions");
  const lcCncAssetBase = "/assets/lc-cnc";
  const lcCncAssets = {
    hero: `${lcCncAssetBase}/factory-workshop.jpg`,
    phone: `${lcCncAssetBase}/cnc-closeup-1.jpg`,
    laptop: `${lcCncAssetBase}/cnc-closeup-2.jpg`,
    camera: `${lcCncAssetBase}/cnc-closeup-3.jpg`,
    keypad: `${lcCncAssetBase}/cnc-closeup-4.jpg`,
  };
  const buildLcCncSandvikHeroProps = (theme: Record<string, unknown> = {}) => ({
    id: "structured-home-hero",
    anchor: "hero",
    paddingY: "lg",
    maxWidth: "xl",
    align: "left" as const,
    background: "image" as const,
    backgroundMedia: { kind: "image" as const, src: lcCncAssets.hero, alt: "LC-CNC CNC workshop" },
    backgroundOverlay: "solid" as const,
    backgroundOverlayOpacity: 0.58,
    emphasis: "high" as const,
    surfaceTone: "dark" as const,
    textPanel: true,
    textPanelBackground: "rgba(9, 14, 26, 0.58)",
    textPanelBorderColor: "rgba(255,255,255,0.16)",
    textPanelPadding: "lg" as const,
    textPanelRadius: "lg" as const,
    textPanelMaxWidth: "md" as const,
    headingSize: "lg" as const,
    bodySize: "md" as const,
    eyebrow: "LC-CNC Shenzhen Factory Since 2013",
    title: "Precision 3C CNC Centers for Southeast Asia",
    subtitle:
      brief.heroSubtitle || "10-Day Prototype • 15-Day Delivery • 24/7 WhatsApp Support.",
    ctas: [
      { label: brief.heroCtas?.[0] || "Get Quote on WhatsApp", href: "/contact", variant: "primary" as const },
      { label: brief.heroCtas?.[1] || "Request Catalog", href: "/3c-machines", variant: "secondary" as const },
    ],
    mediaPosition: "right" as const,
    theme,
  });
  const buildLcCncNavbarProps = () => ({
    id: "structured-navbar",
    anchor: "top",
    paddingY: "sm" as const,
    maxWidth: "xl" as const,
    background: shellTone === "dark" ? ("gradient" as const) : ("none" as const),
    backgroundGradient:
      shellTone === "dark" ? "linear-gradient(180deg, #0d1623 0%, #111b2a 100%)" : undefined,
    surfaceTone: shellTone === "dark" ? ("dark" as const) : ("default" as const),
    sticky: true,
    logo: brief.brand || "LC-CNC",
    links: navLinks,
    ctas: [{ label: brief.heroCtas?.[0] || "Get Quote on WhatsApp", href: "/contact", variant: "primary" as const }],
    variant: "withCTA" as const,
  });
  const buildLcCncSandvikHomeCardsProps = (theme: Record<string, unknown> = {}) => {
    const products = brief.productItems?.length
      ? brief.productItems
      : ["3C Phone-Frame Center", "3C Laptop-Shell Center", "3C Camera-Bezel Center", "3C Keypad Center"];
    const productImages = [lcCncAssets.phone, lcCncAssets.laptop, lcCncAssets.camera, lcCncAssets.keypad];
    const productDescriptions = [
      "Phone display frame machining with stable tolerance control and fast fixture setup.",
      "Laptop shell machining centers tuned for cosmetic-finish panels and repeatable output.",
      "Camera bezel machining programs optimized for precision edges and reliable throughput.",
      "Compact keypad centers configured for high-mix small-part production lines.",
    ];
    return {
      id: "structured-home-products",
      anchor: "products",
      paddingY: "lg" as const,
      background: "gradient" as const,
      backgroundGradient: "linear-gradient(180deg, #f3f3f2 0%, #e7e2d9 100%)",
      maxWidth: "xl" as const,
      title: "3C CNC Machine Lineup",
      subtitle:
        "Phone-frame, laptop-shell, camera-bezel, and keypad centers configured for stable output, fast sampling, and inquiry-ready support.",
      variant: "imageText" as const,
      columns: "4col" as const,
      density: "normal" as const,
      cardStyle: "solid" as const,
      imagePosition: "top" as const,
      imageShape: "rounded" as const,
      headingSize: "lg" as const,
      bodySize: "sm" as const,
      items: products.slice(0, 4).map((name, index) => ({
        title: name,
        eyebrow: ["Phone Frames", "Laptop Shells", "Camera Bezels", "Keypads"][index] || "3C Machines",
        description: productDescriptions[index] || "Configured for stable output and one-click quotation via WhatsApp.",
        imageSrc: productImages[index] || lcCncAssets.hero,
        imageAlt: name,
        cta: { label: "Get Quote on WhatsApp", href: "/contact", variant: "primary" as const },
      })),
      theme,
    };
  };
  const buildLcCncFeatureWithMediaProps = () => ({
    id: "structured-home-features",
    anchor: "features",
    paddingY: "lg" as const,
    background: "gradient" as const,
    backgroundGradient: "linear-gradient(180deg, #f3f3f2 0%, #ece6dc 100%)",
    maxWidth: "xl" as const,
    variant: "split" as const,
    eyebrow: "Execution differentiators",
    title: "Fast customization, short lead-time, and local support",
    subtitle: "Built for Southeast Asia buyers who need machine decisions to move from quote to shipment without delay.",
    items: [
      { title: "Fast Customization", desc: "10-day sample turnaround with fixture strategy aligned to the part family." },
      { title: "Short Lead-Time", desc: "15-day shipment discipline for pilot and ramp-up schedules." },
      { title: "Local Support", desc: "WhatsApp-first communication plus regional agent coordination." },
    ],
    mediaSrc: lcCncAssets.hero,
    mediaAlt: "LC-CNC factory workshop",
    ctas: [{ label: brief.heroCtas?.[0] || "Get Quote on WhatsApp", href: "/contact", variant: "primary" as const }],
  });
  const buildStructuredInteriorHeroProps = (
    pageType: "products" | "solutions" | "cases" | "about" | "contact",
    theme: Record<string, unknown> = {}
  ) => {
    const definitions = {
      products: {
        anchor: "products-hero",
        eyebrow: "3C machine portfolio",
        title: "3C CNC Machine Platforms",
        subtitle:
          "Phone-frame, laptop-shell, camera-bezel, and keypad centers configured for stable output and short delivery windows.",
      },
      solutions: {
        anchor: "solutions-hero",
        eyebrow: "Custom solutions",
        title: "Custom CNC Solutions for Southeast Asia",
        subtitle:
          "Fixture, spindle, automation, and line-integration packages built around takt time, finish quality, and deployment speed.",
      },
      cases: {
        anchor: "cases-hero",
        eyebrow: "Production case studies",
        title: "Representative 3C machining programs",
        subtitle:
          "Phone frames, laptop shells, camera bezels, and keypad components delivered with repeatable cycle time and cosmetic-finish control.",
      },
      about: {
        anchor: "about-hero",
        eyebrow: brief.brand || "About LC-CNC",
        title: "LC-CNC, Shenzhen since 2013",
        subtitle: brief.aboutText || "ISO-certified plant, 30+ R&D engineers, 200+ installed across SEA.",
      },
      contact: {
        anchor: "contact-hero",
        eyebrow: "Quick quote channel",
        title: "Talk to the LC-CNC commercial team",
        subtitle:
          `WhatsApp ${brief.whatsapp || "+86-158-1370-3777"} • ${brief.email || "sales@lc-cnc.com"} • ${brief.address || "Bao'an, Shenzhen, China"}`.replace(/\s•\s$/, ""),
      },
    } as const;
    const copy = definitions[pageType];
    return {
      id: `structured-${pageType}-hero`,
      anchor: copy.anchor,
      paddingY: "lg",
      maxWidth: "xl",
      align: "left" as const,
      background: "image" as const,
      backgroundMedia: { kind: "image" as const, src: lcCncAssets.hero, alt: "LC-CNC CNC workshop" },
      backgroundOverlay: "solid" as const,
      backgroundOverlayOpacity: 0.56,
      emphasis: "high" as const,
      surfaceTone: "dark" as const,
      textPanel: true,
      textPanelBackground: "rgba(9, 14, 26, 0.58)",
      textPanelBorderColor: "rgba(255,255,255,0.16)",
      textPanelPadding: "lg" as const,
      textPanelRadius: "lg" as const,
      textPanelMaxWidth: "md" as const,
      headingSize: "lg" as const,
      bodySize: "md" as const,
      eyebrow: copy.eyebrow,
      title: copy.title,
      subtitle: copy.subtitle,
      ctas: [
        { label: brief.heroCtas?.[0] || "Get Quote on WhatsApp", href: "/contact", variant: "primary" as const },
        { label: brief.heroCtas?.[1] || "Request Catalog", href: productsHref, variant: "secondary" as const },
      ],
      mediaPosition: "right" as const,
      theme,
    };
  };
  const buildStructuredInteriorCardsProps = (
    pageType: "products" | "solutions" | "cases" | "about",
    theme: Record<string, unknown> = {}
  ) => {
    if (pageType === "products") {
      const products = brief.productItems?.length
        ? brief.productItems
        : ["3C Phone-Frame Center", "3C Laptop-Shell Center", "3C Camera-Bezel Center", "3C Keypad Center"];
      return {
        id: "structured-products-catalog",
        anchor: "product-catalog",
        paddingY: "lg" as const,
        background: "gradient" as const,
        backgroundGradient: "linear-gradient(180deg, #f3f3f2 0%, #e7e2d9 100%)",
        maxWidth: "xl" as const,
        title: "3C Machine Catalog",
        subtitle: "Machine families for phone frames, laptop shells, camera bezels, and keypad components.",
        variant: "imageText" as const,
        columns: "4col" as const,
        density: "normal" as const,
        cardStyle: "solid" as const,
        imagePosition: "top" as const,
        imageShape: "rounded" as const,
        headingSize: "lg" as const,
        bodySize: "sm" as const,
        items: products.slice(0, 4).map((name, index) => ({
          title: name,
          eyebrow: ["Phone Frames", "Laptop Shells", "Camera Bezels", "Keypads"][index] || "3C Machines",
          description: "Core spindle, stroke, and throughput parameters for 3C machining lines.",
          imageSrc: [lcCncAssets.phone, lcCncAssets.laptop, lcCncAssets.camera, lcCncAssets.keypad][index] || lcCncAssets.hero,
          imageAlt: name,
          cta: { label: "Request Catalog", href: "/contact", variant: "primary" as const },
        })),
        theme,
      };
    }
    if (pageType === "solutions") {
      return {
        id: "structured-solutions-cards",
        anchor: "solution-offers",
        paddingY: "lg" as const,
        background: "gradient" as const,
        backgroundGradient: "linear-gradient(180deg, #f3f3f2 0%, #ebe6dd 100%)",
        maxWidth: "xl" as const,
        title: "Custom Solutions",
        subtitle: "Turnkey OEM/ODM lines, custom fixtures, spindle packages, and automation integration.",
        variant: "imageText" as const,
        columns: "4col" as const,
        density: "normal" as const,
        cardStyle: "solid" as const,
        imagePosition: "top" as const,
        imageShape: "rounded" as const,
        headingSize: "lg" as const,
        bodySize: "sm" as const,
        items: [
          "Turnkey 3C production line",
          "Custom fixture engineering",
          "OEM/ODM machine adaptation",
          "Automation integration cell",
        ].map((name, index) => ({
          title: name,
          eyebrow: ["Line design", "Fixture packages", "OEM/ODM", "Automation"][index] || "Custom",
          description: "Configured around takt time, part geometry, and local commissioning needs.",
          imageSrc: [lcCncAssets.hero, lcCncAssets.phone, lcCncAssets.laptop, lcCncAssets.camera][index] || lcCncAssets.hero,
          imageAlt: name,
          cta: { label: "Discuss Solution", href: "/contact", variant: "primary" as const },
        })),
        theme,
      };
    }
    if (pageType === "cases") {
      const cases = brief.caseItems?.length
        ? brief.caseItems
        : ["Phone Display Frame Machining", "Laptop Shell Machining", "Camera Bezel Machining", "Phone Keypad Machining"];
      return {
        id: "structured-cases-gallery",
        anchor: "case-gallery",
        paddingY: "lg" as const,
        background: "gradient" as const,
        backgroundGradient: "linear-gradient(180deg, #f3f3f2 0%, #e7e2d9 100%)",
        maxWidth: "xl" as const,
        title: "Manufacturing Outcomes",
        subtitle: "Programs focused on cycle-time reduction, stable delivery, and finish consistency.",
        variant: "imageText" as const,
        columns: "4col" as const,
        density: "normal" as const,
        cardStyle: "solid" as const,
        imagePosition: "top" as const,
        imageShape: "rounded" as const,
        headingSize: "lg" as const,
        bodySize: "sm" as const,
        items: cases.slice(0, 4).map((name, index) => ({
          title: name,
          eyebrow: "Application Case",
          description: "Application-focused production outcome with controlled tolerance and repeatable output.",
          imageSrc: [lcCncAssets.phone, lcCncAssets.laptop, lcCncAssets.camera, lcCncAssets.keypad][index] || lcCncAssets.hero,
          imageAlt: name,
          cta: { label: "View Case", href: "/cases", variant: "primary" as const },
        })),
        theme,
      };
    }
    return {
      id: "structured-about-capabilities",
      anchor: "capability-cards",
      paddingY: "lg" as const,
      background: "gradient" as const,
      backgroundGradient: "linear-gradient(180deg, #f3f3f2 0%, #ebe6dd 100%)",
      maxWidth: "xl" as const,
      title: "Factory Capability Highlights",
      subtitle: "Engineering depth, factory discipline, and regional support for Southeast Asia.",
      variant: "imageText" as const,
      columns: "4col" as const,
      density: "normal" as const,
      cardStyle: "solid" as const,
      imagePosition: "top" as const,
      imageShape: "rounded" as const,
      headingSize: "lg" as const,
      bodySize: "sm" as const,
      items: [
        "Process engineering and tooling support",
        "Factory commissioning and training",
        "Quality documentation and inspection flow",
        "Regional after-sales response",
      ].map((name, index) => ({
        title: name,
        eyebrow: "Capability",
        description: "Operational capability aligned to multi-site 3C production programs.",
        imageSrc: [lcCncAssets.hero, lcCncAssets.phone, lcCncAssets.laptop, lcCncAssets.camera][index] || lcCncAssets.hero,
        imageAlt: name,
        cta: { label: "Talk to LC-CNC", href: "/contact", variant: "primary" as const },
      })),
      theme,
    };
  };
  const buildStructuredInteriorFeatureProps = (
    pageType: "products" | "solutions" | "cases" | "contact"
  ) => {
    if (pageType === "products") {
      return {
        id: "structured-products-features",
        anchor: "specification-summary",
        paddingY: "md" as const,
        background: "gradient" as const,
        backgroundGradient: "linear-gradient(180deg, #f3f3f2 0%, #ebe6dd 100%)",
        maxWidth: "xl" as const,
        title: "Core Machine Specifications",
        subtitle: "Rigid structure, repeatable accuracy, and deployment-ready configuration options.",
        variant: "3col" as const,
        items: [
          { title: "High-Rigidity Frame", desc: "Stable machining performance for aluminum and magnesium 3C parts." },
          { title: "Flexible Spindle Packages", desc: "Configured for roughing, finishing, and compact-feature processing." },
          { title: "Automation Ready", desc: "Supports loaders, conveyors, and inline inspection expansion." },
        ],
      };
    }
    if (pageType === "solutions") {
      return {
        id: "structured-solutions-features",
        anchor: "solution-categories",
        paddingY: "md" as const,
        background: "gradient" as const,
        backgroundGradient: "linear-gradient(180deg, #f3f3f2 0%, #ebe6dd 100%)",
        maxWidth: "xl" as const,
        title: "Solution Categories",
        subtitle: "Structured offers for OEM/ODM production planning and line adaptation.",
        variant: "3col" as const,
        items: [
          { title: "Turnkey Line Design", desc: "Machine layout, process logic, and ramp-up support for new 3C programs." },
          { title: "Fixture & Tooling Packages", desc: "Custom workholding and cutting strategy matched to the part family." },
          { title: "Automation Integration", desc: "Loading, unloading, transfer, and inspection interfaces for scale." },
        ],
      };
    }
    if (pageType === "cases") {
      return {
        id: "structured-cases-metrics",
        anchor: "case-metrics",
        paddingY: "md" as const,
        background: "gradient" as const,
        backgroundGradient: "linear-gradient(180deg, #f3f3f2 0%, #ebe6dd 100%)",
        maxWidth: "xl" as const,
        title: "Case Performance Signals",
        subtitle: "How factory programs are evaluated after deployment.",
        variant: "3col" as const,
        items: [
          { title: "Cycle Time Reduction", desc: "Measured against the original process baseline and takt target." },
          { title: "Yield Stability", desc: "Tracked across production shifts, changeovers, and operator variation." },
          { title: "Ramp-up Speed", desc: "Focused on time-to-output after installation and process verification." },
        ],
      };
    }
    return {
      id: "structured-contact-channels",
      anchor: "contact-channels",
      paddingY: "md" as const,
      background: "gradient" as const,
      backgroundGradient: "linear-gradient(180deg, #f3f3f2 0%, #ebe6dd 100%)",
      maxWidth: "xl" as const,
      title: "Contact Channels",
      subtitle: "Commercial response routed for Southeast Asia machine procurement.",
      variant: "3col" as const,
      items: [
        { title: "WhatsApp", desc: brief.whatsapp || "+86-158-1370-3777" },
        { title: "Email", desc: brief.email || "sales@lc-cnc.com" },
        { title: "Factory Base", desc: brief.address || "Bao’an, Shenzhen, China" },
      ],
    };
  };
  const buildStructuredInteriorTestimonialsProps = (
    pageType: "products" | "solutions" | "cases" | "about" | "contact"
  ) => {
    if (pageType === "products") {
      return {
        id: "structured-products-proof",
        anchor: "buyer-proof",
        title: "Why Buyers Choose LC-CNC",
        subtitle: "Catalog decisions driven by throughput, uptime, and support responsiveness.",
        variant: "2col" as const,
        maxWidth: "xl" as const,
        items: [
          { name: "Procurement Team", role: "Vietnam", quote: "Machine selection was tied to real part geometry and lead-time targets, not generic specs." },
          { name: "Production Manager", role: "Thailand", quote: "The catalog clearly mapped each platform to cycle time, fixture strategy, and line scalability." },
        ],
      };
    }
    if (pageType === "solutions") {
      return {
        id: "structured-solutions-proof",
        anchor: "implementation-proof",
        title: "Implementation Confidence",
        subtitle: "Programs that need adaptation, not off-the-shelf machine selection.",
        variant: "2col" as const,
        maxWidth: "xl" as const,
        items: [
          { name: "Operations Lead", role: "OEM Program", quote: "The proposed line matched both the part flow and the regional staffing reality." },
          { name: "Engineering Manager", role: "ODM Factory", quote: "Fixture, spindle, and automation decisions were resolved as one system instead of separate vendors." },
        ],
      };
    }
    if (pageType === "cases") {
      return {
        id: "structured-cases-proof",
        anchor: "customer-feedback",
        title: "Customer Feedback",
        subtitle: "Application-specific outcomes from Southeast Asia programs.",
        variant: "2col" as const,
        maxWidth: "xl" as const,
        items: [
          { name: "Phone Display Frame Machining", role: "Vietnam", quote: "The line stabilized output quickly while maintaining the cosmetic finish required for premium devices." },
          { name: "Laptop Shell Machining", role: "Malaysia", quote: "Fixture and process tuning reduced rework and improved delivery confidence across multiple batches." },
        ],
      };
    }
    if (pageType === "about") {
      return {
        id: "structured-about-proof",
        anchor: "certification-proof",
        title: "Certifications",
        subtitle: "Compliance and credibility for export-ready machine programs.",
        variant: "2col" as const,
        maxWidth: "xl" as const,
        items: [
          { name: "ISO 9001", role: "Quality Management", quote: "Documented factory quality control and repeatable process oversight." },
          { name: "CE / SGS", role: "Export Confidence", quote: "Certification support aligned to international shipment and customer review requirements." },
        ],
      };
    }
    return {
      id: "structured-contact-proof",
      anchor: "quote-requirements",
      title: "Quote Preparation",
      subtitle: "The fastest path to an accurate recommendation and lead-time commitment.",
      variant: "2col" as const,
      maxWidth: "xl" as const,
      items: [
        { name: "What to send", role: "Inputs", quote: "Share machine model interest, quantity target, deadline, and part/process context to speed the first response." },
        { name: "How we reply", role: "Commercial flow", quote: "LC-CNC routes inquiry review through WhatsApp and email for faster Southeast Asia quoting cycles." },
      ],
    };
  };
  const buildStructuredAboutStoryProps = () => ({
    id: "structured-about-story",
    anchor: "company-story",
    title: "LC-CNC, Shenzhen since 2013",
    subtitle: brief.aboutText || "ISO-certified plant, 30+ R&D engineers, 200+ installed across SEA.",
    body:
      "LC-CNC combines plant execution, tooling know-how, and field response to support 3C manufacturing programs across Southeast Asia.",
    ctas: [{ label: "Talk to LC-CNC", href: "/contact", variant: "link" as const }],
    variant: "split" as const,
    maxWidth: "xl" as const,
  });
  const interiorAssemblySlots: Record<
    "products" | "solutions" | "cases" | "about" | "contact",
    Array<"hero" | "products" | "features" | "proof" | "story">
  > = {
    products: ["hero", "products", "features", "proof"],
    solutions: ["hero", "features", "products", "proof"],
    cases: ["hero", "products", "features", "proof"],
    about: ["hero", "story", "products", "proof"],
    contact: ["hero", "features", "proof"],
  };
  const buildLcCncFooterProps = () => ({
    id: "structured-footer",
    anchor: "footer",
    paddingY: "md" as const,
    background: "gradient" as const,
    backgroundGradient:
      shellTone === "dark"
        ? "linear-gradient(180deg, #394049 0%, #2c3238 100%)"
        : "linear-gradient(180deg, #f3f3f2 0%, #e6dfd3 100%)",
    maxWidth: "xl" as const,
    surfaceTone: shellTone === "dark" ? ("dark" as const) : ("default" as const),
    logoText: brief.brand || "LC-CNC",
    columns: footerCols,
    legal: brief.copyright || `Copyright © 2024 ${brief.brand || "LC-CNC"}. All rights reserved.`,
  });
  const navLinks =
    enterpriseNavLinks.length
      ? enterpriseNavLinks
      : brief.nav?.length
      ? brief.nav.map((label) => ({ label, href: navHrefForLabel(label), variant: "link" }))
      : [
          { label: "Home", href: "/", variant: "link" },
          { label: "3C Machines", href: productsHref, variant: "link" },
          { label: "Custom Solutions", href: solutionsHref, variant: "link" },
          { label: "Cases", href: "/cases", variant: "link" },
          { label: "About", href: "/about", variant: "link" },
          { label: "Contact", href: "/contact", variant: "link" },
        ];
  const footerCols =
    enterpriseFooterCols.length
      ? enterpriseFooterCols
      : [
          {
            title: "Products",
            links: [
              { label: "3C Machines", href: productsHref },
              { label: "Custom Solutions", href: solutionsHref },
              { label: "Cases", href: "/cases" },
            ],
          },
          {
            title: "Support",
            links: [
              { label: "Contact", href: "/contact" },
              { label: "Request Catalog", href: "/contact" },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "About", href: "/about" },
              { label: "Privacy", href: "/privacy" },
            ],
          },
        ];
  const applyTemplateNavbarBusinessProps = (props: Record<string, unknown>) => {
    const compactNavText = navLinks.map((link) => String(link.label || "")).filter(Boolean).join(" | ");
    props.logo = { alt: brief.brand || "Brand" };
    props.logoText = brief.brand || "Brand";
    props.logotext = brief.brand || "Brand";
    props.logotexttext = brief.brand || "Brand";
    props.brandtext = String(brief.brand || "Brand").toUpperCase();
    props.links = navLinks;
    props.ctas = [];
    props.navtext = compactNavText;
    props.navhref = "/";
    props.toplinkstext = compactNavText;
    props.toplinkshref = "/";
    props.actionstext = brief.heroCtas?.[0] || "Get Quote on WhatsApp";
    props.actionshref = "/contact";
    props.ctahtxttext = brief.heroCtas?.[0] || "Get Quote on WhatsApp";
    props.ctahtxthref = "/contact";
    props.logintxttext = "Contact";
    props.logintxthref = "/contact";
    props.searchtxttext = "";
    props.searchtxthref = "/";
    props.langtxttext = "EN";
    props.langtxthref = "/";
    props.utilitytext = "Industrial CNC systems";
    props.utilityhref = "/";
    return props;
  };
  const applyTemplateFooterBusinessProps = (props: Record<string, unknown>) => {
    const footerBrand = brief.brand || "Brand";
    const uppercaseFooterBrand = footerBrand.toUpperCase();
    const flattenedFooterLinks = footerCols.flatMap((column) => column.links || []);
    const copyrightText = brief.copyright || `© 2024 ${brief.brand || "Brand"}. All rights reserved.`;
    props.logoText = footerBrand;
    props.flogotext = footerBrand;
    props.ftlogotext = footerBrand;
    props.footerBrandtext = uppercaseFooterBrand;
    props.brandtext = uppercaseFooterBrand;
    props.columns = footerCols;
    props.legal = copyrightText;
    props.copytext = copyrightText;
    props.fcopytext = copyrightText;
    props.fcopyhref = "/privacy";
    footerCols.slice(0, 4).forEach((column, index) => {
      const slot = index + 1;
      const firstLink = (column.links || [])[0];
      props[`fcol${slot}text`] = column.title;
      props[`fcol${slot}href`] = firstLink?.href || "/";
      props[`col${slot}titletext`] = column.title;
      props[`col${slot}titlehref`] = firstLink?.href || "/";
      props[`col${slot}texttext`] = (column.links || []).map((link) => link.label).filter(Boolean).join(" | ");
      props[`col${slot}texthref`] = firstLink?.href || "/";
    });
    props.footercompanytext = brief.address || "Bao'an, Shenzhen, China";
    props.footercompanyhref = "/about";
    props.footeraddresstext = brief.address || "Bao'an, Shenzhen, China";
    props.footeraddresshref = "/about";
    props.footercontacttext = brief.whatsapp || brief.email || "Contact";
    props.footercontacthref = "/contact";
    props.fdesctext = flattenedFooterLinks.map((link) => link.label).filter(Boolean).join(" • ");
    props.fdeschref = "/contact";
    return props;
  };
  const requestedPaths: Set<string> | null =
    brief.nav?.length
      ? new Set(
          brief.nav
            .map((label) => navHrefForLabel(label))
            .filter(Boolean)
            .concat(["/"])
        )
      : null;
  const writeTextPair = (
    props: Record<string, unknown>,
    fields: { title?: string; subtitle?: string; eyebrow?: string }
  ) => {
    if (fields.eyebrow) {
      props.eyebrow = fields.eyebrow;
      props.eyetext = fields.eyebrow;
      props.eyebrowtext = fields.eyebrow;
      props.heroeyebrowtext = fields.eyebrow;
      props.missioneyebrowtext = fields.eyebrow;
      props.ctaeyebrowtext = fields.eyebrow;
      props.tagtext = fields.eyebrow;
      props.h1tagtext = fields.eyebrow;
      props.exptagtext = fields.eyebrow;
      props.audlabeltext = fields.eyebrow;
      props.heroKickertext = fields.eyebrow;
      props.headerBrandtext = fields.eyebrow;
      props.storyEyebrowtext = fields.eyebrow;
      props.solutionEyebrowtext = fields.eyebrow;
      props.productsEyebrowtext = fields.eyebrow;
      props.herotagtext = fields.eyebrow;
      props.righttagtext = fields.eyebrow;
    }
    if (fields.title) {
      props.title = fields.title;
      props.titletext = fields.title;
      props.hedtext = fields.title;
      props.h1text = fields.title;
      props.herotitletext = fields.title;
      props.heroTitletext = fields.title;
      props.maintitletext = fields.title;
      props.usetitletext = fields.title;
      props.missionheadlinetext = fields.title;
      props.ctaheadtext = fields.title;
      props.httext = fields.title;
      props.exptitletext = fields.title;
      props.audtitletext = fields.title;
      props.storyTitletext = fields.title;
      props.solutionTitletext = fields.title;
      props.productsTitletext = fields.title;
      props.findTitletext = fields.title;
      props.reviewstitletext = fields.title;
      props.catstitletext = fields.title;
      props.righttitletext = fields.title;
    }
    if (fields.subtitle) {
      props.subtitle = fields.subtitle;
      props.desctext = fields.subtitle;
      props.subtext = fields.subtitle;
      props.h1desctext = fields.subtitle;
      props.herobodytext = fields.subtitle;
      props.herodesctext = fields.subtitle;
      props.heroSubtitletext = fields.subtitle;
      props.usecard1bodytext = fields.subtitle;
      props.usesubtext = fields.subtitle;
      props.missionsupporttext = fields.subtitle;
      props.ctabodytext = fields.subtitle;
      props.hstext = fields.subtitle;
      props.expbodytext = fields.subtitle;
      props.storyCopytext = fields.subtitle;
      props.solutionCopytext = fields.subtitle;
      props.productsCopytext = fields.subtitle;
      props.findCopytext = fields.subtitle;
      props.reviewssubtitletext = fields.subtitle;
    }
  };
  const isLikelyFontFamilyToken = (value: unknown) => {
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 80) return false;
    if (/[.!?]/.test(trimmed)) return false;
    if (/https?:\/\//i.test(trimmed)) return false;
    if (/\b(and|with|for|from|that|this|built|pilot|scale|show|present|brand)\b/i.test(trimmed)) return false;
    return /^[A-Za-z0-9 ,'"-]+$/.test(trimmed);
  };
  const sanitizeThemeTypography = (value: unknown, fallbackFont = "Inter") => {
    if (!value || typeof value !== "object") return value;
    const theme = { ...(value as Record<string, unknown>) };
    if (!isLikelyFontFamilyToken(theme.fontHeading)) theme.fontHeading = fallbackFont;
    if (!isLikelyFontFamilyToken(theme.fontBody)) theme.fontBody = fallbackFont;
    if (Array.isArray(theme.fontFamilies)) {
      const normalizedFamilies = theme.fontFamilies.filter((entry) => isLikelyFontFamilyToken(entry));
      theme.fontFamilies = normalizedFamilies.length ? normalizedFamilies : [fallbackFont];
    } else {
      theme.fontFamilies = [fallbackFont];
    }
    return theme;
  };
  const applyProductCardSeries = (props: Record<string, unknown>, items: string[], brand: string) => {
    items.slice(0, 4).forEach((name, idx) => {
      props[`storyCard${idx}Titletext`] = name;
      props[`storyCard${idx}Bodytext`] = "Core specs, stable output, and one-click quotation via WhatsApp.";
      props[`storyCard${idx}Eyebrowtext`] = brand;
      const slot = idx + 1;
      props[`productCard${slot}Titletext`] = name;
      props[`productCard${slot}Bodytext`] = "Core specs, stable output, and one-click quotation via WhatsApp.";
      props[`productCard${slot}Eyebrowtext`] = brand;
      props[`findCardLabel${idx}text`] = name;
      props[`indT${idx}text`] = name;
      props[`q${slot}text`] = name;
    });
  };
  const applyFeatureSeries = (props: Record<string, unknown>, items: string[]) => {
    items.slice(0, 4).forEach((entry, idx) => {
      const [title, desc] = String(entry || "")
        .split("→")
        .map((part) => part.trim());
      const resolvedTitle = title || entry;
      const resolvedDesc = desc || "";
      props[`findCardLabel${idx}text`] = resolvedTitle;
      const slot = idx + 1;
      props[`a${slot}text`] = resolvedDesc || resolvedTitle;
      props[`t${slot}text`] = resolvedTitle;
      props[`d${slot}text`] = resolvedDesc;
    });
  };
  const sanitizeTemplateExclusiveProps = (
    props: Record<string, unknown>,
    meta: { pageType: string; publishedOriginalType: string }
  ) => {
    const productNames = brief.productItems?.length
      ? brief.productItems
      : ["3C Phone-Frame Center", "3C Laptop-Shell Center", "3C Camera-Bezel Center", "3C Keypad Center"];
    const featureItems = brief.featureItems?.length
      ? brief.featureItems
      : ["Fast Customization → 10-Day Sample", "Short Lead-Time → 15-Day Shipment", "Local Support → WhatsApp + Regional Agent"];
    const navLabels = (brief.nav?.length
      ? brief.nav
      : ["Home", "3C Machines", "Custom Solutions", "Cases", "About", "Contact"]
    ).filter(Boolean);
    const visibleNav = navLabels.filter((label) => !/^home$/i.test(label));
    const aboutSummary =
      brief.aboutText || "ISO-certified plant, 30+ R&D engineers, and 200+ installed systems across Southeast Asia.";
    const featureSummary = featureItems
      .slice(0, 3)
      .map((entry) => entry.split("→").map((part) => part.trim()).filter(Boolean).join(" - "))
      .join(" • ");
    const productFamilies = [
      "Phone Frames",
      "Laptop Shells",
      "Camera Bezels",
      "Keypads",
      "Custom Cells",
    ];
    const placeholders = new Map<string, string>([
      ["Present the core value proposition with a clear headline and primary CTA.", ""],
      ["Present the core value proposition", ""],
      ["Show key differentiators with concise cards.", "Execution differentiators"],
      ["From pilot to scale with measurable outcomes.", "Built around sampling speed, shipment discipline, and local support."],
      ["Display the main product/service catalog with compact cards.", "Request Catalog"],
    ]);
    const walk = (entry: unknown, keyPath: string[]): unknown => {
      if (typeof entry === "string") {
        const trimmed = entry.trim();
        let next = entry;
        if (placeholders.has(trimmed)) next = placeholders.get(trimmed) || "";
        if (/^brand(?:[-\s].*)?$/i.test(trimmed)) next = brief.brand || "LC-CNC™";
        if (/^brand[-\s]/i.test(trimmed)) next = `${brief.brand || "LC-CNC™"} industrial systems`;
        if (/Brand\s+Brand/i.test(trimmed)) next = "3C CNC Machine Lineup";
        if (/Explain Brand narrative/i.test(trimmed)) next = "3C CNC Machine Lineup";
        if (/structured clone pen/i.test(trimmed)) next = aboutSummary;
        if (/^SECTORS$/i.test(trimmed)) next = visibleNav[0] || "3C Machines";
        if (/^HIGH LIFETIME COSTS$/i.test(trimmed)) next = "Laptop Shells";
        if (/^AUTOMATION$/i.test(trimmed)) next = "Camera Bezels";
        const leafKey = String(keyPath[keyPath.length - 1] || "");
        if (/^footerCol1text$/i.test(leafKey)) next = "3C Machines\nCustom Solutions\nCases";
        if (/^footerCol2text$/i.test(leafKey)) next = "About\nContact\nPrivacy";
        if (/^footerCopytext$/i.test(leafKey) || /^copytext$/i.test(leafKey)) next = brief.copyright || aboutSummary;
        if (/^solutionInnerTitletext$/i.test(leafKey)) next = "Execution differentiators";
        if (/^solutionInnerBodytext$/i.test(leafKey)) next = featureSummary || aboutSummary;
        if (/^prodTab1Texttext$/i.test(leafKey)) next = "Phone Frames";
        if (/^prodTab2Texttext$/i.test(leafKey)) next = "Laptop Shells";
        if (/^prodTab3Texttext$/i.test(leafKey)) next = "Camera Bezels";
        if (/^productsCtaTexttext$/i.test(leafKey)) next = brief.heroCtas?.[1] || "Request Catalog";
        if (/^heroCta1Texttext$/i.test(leafKey)) next = brief.heroCtas?.[0] || "Get Quote on WhatsApp";
        if (/^heroCta2Texttext$/i.test(leafKey)) next = brief.heroCtas?.[1] || "Request Catalog";
        if (/^heroSubtext$/i.test(leafKey)) next = brief.heroSubtitle || next;
        if (/^headerMenutext$/i.test(leafKey) || /^homeNavbarMenutext$/i.test(leafKey)) next = "Menu";
        if (/^homeNavbarLangtext$/i.test(leafKey)) next = "EN";
        if (/^homeNavbarSearchtext$/i.test(leafKey)) next = "";
        if (/^chatLabeltext$/i.test(leafKey)) next = "WhatsApp";
        if (/^heroCatLabeltext$/i.test(leafKey)) next = "SEA";
        if (/^heroCatTexttext$/i.test(leafKey)) next = "3C CNC";
        if (/^heroBannerTexttext$/i.test(leafKey)) next = "10-Day Sample • 15-Day Shipment";
        if (/^scrollIndicatorLabeltext$/i.test(leafKey)) next = "Explore";
        if (/^heroCardLeftLabeltext$/i.test(leafKey)) next = "10-Day Sample";
        if (/^heroCardRightLabeltext$/i.test(leafKey)) next = "24/7 WhatsApp";
        if (/^productCard0Titletext$/i.test(leafKey)) next = productNames[3] || productNames[0] || "";
        if (/^productCard0Eyebrowtext$/i.test(leafKey)) next = brief.brand || "LC-CNC™";
        if (/^productCard0Bodytext$/i.test(leafKey)) next = "Core specs, stable output, and one-click quotation via WhatsApp.";
        if (/^productCard0Arrowtext$/i.test(leafKey)) next = "›";
        return next;
      }
      if (Array.isArray(entry)) return entry.map((child, index) => walk(child, [...keyPath, String(index)]));
      if (!entry || typeof entry !== "object") return entry;
      const next: Record<string, unknown> = {};
      Object.entries(entry as Record<string, unknown>).forEach(([key, child]) => {
        next[key] = walk(child, [...keyPath, key]);
      });
      return next;
    };
    const next = walk(props, []) as Record<string, unknown>;
    if (next.theme && typeof next.theme === "object") {
      next.theme = sanitizeThemeTypography(next.theme, "Inter");
    }
    if (/Heropen/i.test(meta.publishedOriginalType)) {
      const fittedSandvikHeroTitle =
        meta.pageType === "home" && templateFamilyHint === "sandvik"
          ? "Precision 3C CNC\nCenters for\nSoutheast Asia"
          : brief.heroTitle || "Precision 3C CNC Machines for Southeast Asia";
      next.homeNavbarSectorstext = visibleNav[0] || "3C Machines";
      next.homeNavbarProductstext = visibleNav[1] || "Custom Solutions";
      next.homeNavbarSupporttext = visibleNav[2] || "Cases";
      next.homeNavbarAbouttext = visibleNav[3] || "About";
      next.homeNavbarContactTexttext = visibleNav[4] || "Contact";
      next.headerBrandtext = brief.brand || "LC-CNC™";
      next.heroKickertext = `${brief.brand || "LC-CNC™"} 3C CNC`;
      next.herotagtext = `${brief.brand || "LC-CNC™"} 3C CNC`;
      next.herotitletext = fittedSandvikHeroTitle;
      next.herodesctext = brief.heroSubtitle || "10-Day Prototype • 15-Day Delivery • 24/7 WhatsApp Support";
      next.herobtntexttext = brief.heroCtas?.[0] || "Get Quote on WhatsApp";
      next.herobtntxttext = brief.heroCtas?.[1] || "Request Catalog";
      next.herobtnhref = "/contact";
      next.herobtntexthref = "/contact";
    }
    if (/StoryCategoriespen/i.test(meta.publishedOriginalType)) {
      next.catstitletext = "3C CNC Machine Lineup";
      next.chip1ttext = productFamilies[0];
      next.chip2ttext = productFamilies[1];
      next.chip3ttext = productFamilies[2];
      next.chip4ttext = productFamilies[3];
      next.chip5ttext = productFamilies[4];
      next.catcard1ttext = productNames[0] || productFamilies[0];
      next.catcard1stext = "Phone display frame machining with stable tolerance control.";
      next.catcard2ttext = productNames[1] || productFamilies[1];
      next.catcard2stext = "Laptop shell centers tuned for cosmetic-finish output.";
      next.catcard3ttext = productNames[2] || productFamilies[2];
      next.catcard3stext = "Camera bezel programs optimized for repeatable throughput.";
      next.card4ttext = productNames[3] || productFamilies[3];
      next.card5ttext = "Custom cells & fixtures";
    }
    if (/Approach|Solutionsection|Findyoursolution/i.test(meta.publishedOriginalType)) {
      next.righttagtext = "Execution differentiators";
      next.righttitletext = "Fast customization, short lead-time, and local support";
      next.solutionInnerTitletext = "Execution differentiators";
      next.solutionInnerBodytext = featureSummary || aboutSummary;
    }
    if (/SandvikProducts.*Productsmainpen/i.test(meta.publishedOriginalType) || /Productssection|ProductsGrid/i.test(meta.publishedOriginalType)) {
      next.titletext = "3C CNC Machine Lineup";
      next.desctext =
        "Phone-frame, laptop-shell, camera-bezel, and keypad centers configured for stable output, fast sampling, and inquiry-ready support.";
      next.alllinktext = `${brief.heroCtas?.[1] || "Request Catalog"} ›`;
      next.g1text = productFamilies[0];
      next.g2text = productFamilies[1];
      next.g3text = productFamilies[2];
      next.g4text = productFamilies[3];
      next.gqtfctext = `${productNames[0] || productFamilies[0]} ›`;
      next.fcyb2text = `${productNames[1] || productFamilies[1]} ›`;
      next.vg0ctext = `${productNames[2] || productFamilies[2]} ›`;
      next.p8bfftext = `${productNames[3] || productFamilies[3]} ›`;
      next.kgejmtext = "10-Day Sample ›";
      next.rgfxktext = "15-Day Shipment ›";
      next.sdttstext = "24/7 WhatsApp Support ›";
      next.ot6wjtext = "Regional Agent Support ›";
      next.ayobqtext = "Fixture customization ›";
      next.lnpyvtext = "Tolerance control ›";
      next.cmttvtext = "Custom line integration ›";
      next.uwtwqtext = `${productFamilies[0]} ›`;
      next.rlhiktext = `${productFamilies[1]} ›`;
      next.k8x22text = `${productFamilies[2]} ›`;
      next.aq6y3text = `${productFamilies[3]} ›`;
      next.kbqwtext = "Custom Solutions ›";
      next.qnibtext = `${brief.heroCtas?.[0] || "Get Quote on WhatsApp"} ›`;
      next.o1z3dtext = `${brief.heroCtas?.[1] || "Request Catalog"} ›`;
      next.cat1imagesrc = lcCncAssets.phone;
      next.cat2imagesrc = lcCncAssets.laptop;
      next.cat3imagesrc = lcCncAssets.camera;
      next.cat4imagesrc = lcCncAssets.keypad;
      next.cat5imagesrc = lcCncAssets.hero;
    }
    return next;
  };
  const enterprisePaths = preserveEnterpriseCoverage
    ? new Set(ENTERPRISE_SITE_PAGES.map((page) => page.path))
    : null;
  const pagesToProcess = requestedPaths
    ? pages.filter((page) => {
        const pagePath = String(page.path || "/");
        return requestedPaths.has(pagePath) || Boolean(enterprisePaths?.has(pagePath));
      })
    : pages;
  return pagesToProcess.map((page) => {
    const pageContract = resolvePublishedPageGenerationContract({
      prompt,
      pagePath: page.path,
      pageName: page.name,
    });
    const inferredPageType = inferPageTypeFromPath(page.path);
    const pageType = inferredPageType !== "generic" ? inferredPageType : pageContract?.page?.pageType || inferredPageType;
    const kindCounters = new Map<string, number>();
    const contractQueues = new Map<string, Array<{ slotId?: string; role?: string; imageIntent?: string }>>();
    for (const section of Array.isArray(pageContract?.page?.sections) ? pageContract.page.sections : []) {
      const key = String(section?.kind || "").trim();
      if (!key) continue;
      const queue = contractQueues.get(key) || [];
      queue.push({ slotId: section.slotId, role: section.role, imageIntent: section.imageIntent });
      contractQueues.set(key, queue);
    }
    const rootTheme =
      page?.data?.root?.props?.theme && typeof page.data.root.props.theme === "object"
        ? (page.data.root.props.theme as Record<string, unknown>)
        : {};
    const rootPalette =
      rootTheme.palette && typeof rootTheme.palette === "object"
        ? (rootTheme.palette as Record<string, unknown>)
        : {};
    const next = {
      ...page,
      data: {
        ...page.data,
        root: {
          ...page.data.root,
          props: {
            ...page.data.root.props,
            theme: {
              ...rootTheme,
              palette: brief.palette ? { ...rootPalette, ...brief.palette } : rootTheme.palette,
              primaryColor: brief.palette?.primary || rootTheme.primaryColor,
            },
          },
        },
        content: page.data.content.map((item) => ({ ...item, props: { ...(item.props || {}) } })),
      },
    };
    let normalizedHomeHero = next.data.content.some(
      (item) => item.type === "HeroSplit" && String(item?.props?.id || "") === "structured-home-hero"
    );
    let normalizedHomeProducts = next.data.content.some(
      (item) => item.type === "CardsGrid" && String(item?.props?.id || "") === "structured-home-products"
    );
    let normalizedHomeFeatures = next.data.content.some(
      (item) => item.type === "FeatureWithMedia" && String(item?.props?.id || "") === "structured-home-features"
    );
    const interiorPageType =
      pageType === "products" || pageType === "solutions" || pageType === "cases" || pageType === "about" || pageType === "contact"
        ? pageType
        : null;
    const normalizedInteriorSlots = new Set(
      next.data.content
        .map((item) => String(item?.props?.id || ""))
        .filter((value) => /^structured-(products|solutions|cases|about|contact)-/.test(value))
    );
    let homeStructuralIndex = 0;
    let interiorStructuralIndex = 0;
    next.data.content.forEach((item) => {
      let publishedOriginalType =
        typeof item?.props?.__publishedOriginalType === "string" ? String(item.props.__publishedOriginalType) : "";
      const rawEffectiveType = inferEffectiveBlockType(item.type, publishedOriginalType);
      const rawInferredKind = inferDisplaySectionKind(item.type, publishedOriginalType);
      const rawKindOrdinal = rawInferredKind ? Number(kindCounters.get(rawInferredKind) || 0) + 1 : 0;
      if (rawInferredKind) kindCounters.set(rawInferredKind, rawKindOrdinal);
      const contractMatch = rawInferredKind ? (contractQueues.get(rawInferredKind) || [])[rawKindOrdinal - 1] || null : null;
      const sectionSlotId =
        contractMatch?.slotId ||
        (rawInferredKind ? `${String(pageType || "generic")}.${rawInferredKind}.${rawKindOrdinal}` : "");
      const sectionRole = contractMatch?.role || "";
      const sectionImageIntent = String(contractMatch?.imageIntent || "").trim();
      const matchesSectionSlot = (...candidates: string[]) =>
        candidates.filter(Boolean).includes(sectionRole) || candidates.filter(Boolean).includes(sectionSlotId);
      const matchesSectionRole = (...roles: string[]) => roles.filter(Boolean).includes(sectionRole);
      const isHomeBodyCandidate =
        pageType === "home" &&
        !["navigation", "footer", "cta"].includes(rawInferredKind) &&
        rawEffectiveType !== "LeadCaptureCTA";
      if (isHomeBodyCandidate) homeStructuralIndex += 1;
      const homeBodySlot = isHomeBodyCandidate ? homeStructuralIndex : 0;
      const isInteriorBodyCandidate =
        interiorPageType !== null &&
        !["navigation", "footer", "cta"].includes(rawInferredKind) &&
        rawEffectiveType !== "LeadCaptureCTA";
      if (isInteriorBodyCandidate) interiorStructuralIndex += 1;
      const interiorBodySlot = isInteriorBodyCandidate ? interiorStructuralIndex : 0;
      if (
        pageType === "home" &&
        assemblyPolicy.normalizeHomeHero &&
        !normalizedHomeHero &&
        (matchesSectionSlot("primary-hero", "page-hero", "home.hero.1") || homeBodySlot === 1)
      ) {
        const existingTheme =
          item?.props?.theme && typeof item.props.theme === "object"
            ? (item.props.theme as Record<string, unknown>)
            : (page?.data?.root?.props?.theme as Record<string, unknown>) || {};
        item.type = "HeroSplit";
        item.props = buildLcCncSandvikHeroProps(existingTheme);
        publishedOriginalType = "";
        normalizedHomeHero = true;
      } else if (assemblyPolicy.normalizeHeader && /Navigation|Headerpen/i.test(publishedOriginalType || String(item.type))) {
        item.type = "Navbar";
        item.props = buildLcCncNavbarProps();
        publishedOriginalType = "";
      } else if (
        pageType === "home" &&
        assemblyPolicy.normalizeHomeProducts &&
        !normalizedHomeProducts &&
        (matchesSectionSlot("featured-products", "home.products.1") || homeBodySlot === 2)
      ) {
        const existingTheme =
          item?.props?.theme && typeof item.props.theme === "object"
            ? (item.props.theme as Record<string, unknown>)
            : (page?.data?.root?.props?.theme as Record<string, unknown>) || {};
        item.type = "CardsGrid";
        item.props = buildLcCncSandvikHomeCardsProps(existingTheme);
        publishedOriginalType = "";
        normalizedHomeProducts = true;
      } else if (
        pageType === "home" &&
        assemblyPolicy.normalizeHomeFeatures &&
        !normalizedHomeFeatures &&
        (matchesSectionSlot("capability-strip", "process-proof", "home.approach.1", "home.approach.2") || homeBodySlot === 3)
      ) {
        item.type = "FeatureWithMedia";
        item.props = buildLcCncFeatureWithMediaProps();
        publishedOriginalType = "";
        normalizedHomeFeatures = true;
      } else if (assemblyPolicy.normalizeFooter && /Footer/i.test(publishedOriginalType || String(item.type))) {
        item.type = "Footer";
        item.props = buildLcCncFooterProps();
        publishedOriginalType = "";
      } else if (interiorPageType && assemblyPolicy.normalizeInteriorPages && interiorBodySlot > 0) {
        const slotKind = interiorAssemblySlots[interiorPageType]?.[interiorBodySlot - 1];
        const slotId = slotKind ? `structured-${interiorPageType}-${slotKind === "products" ? (interiorPageType === "products" ? "catalog" : interiorPageType === "cases" ? "gallery" : interiorPageType === "about" ? "capabilities" : "cards") : slotKind}` : "";
        const existingTheme =
          item?.props?.theme && typeof item.props.theme === "object"
            ? (item.props.theme as Record<string, unknown>)
            : (page?.data?.root?.props?.theme as Record<string, unknown>) || {};
        if (slotKind === "hero" && !normalizedInteriorSlots.has(slotId)) {
          item.type = "HeroSplit";
          item.props = buildStructuredInteriorHeroProps(interiorPageType, existingTheme);
          publishedOriginalType = "";
          normalizedInteriorSlots.add(String(item.props.id || slotId));
        } else if (slotKind === "products" && !normalizedInteriorSlots.has(slotId)) {
          item.type = "CardsGrid";
          item.props = buildStructuredInteriorCardsProps(interiorPageType as "products" | "solutions" | "cases" | "about", existingTheme);
          publishedOriginalType = "";
          normalizedInteriorSlots.add(String(item.props.id || slotId));
        } else if (slotKind === "features" && !normalizedInteriorSlots.has(slotId)) {
          item.type = "FeatureGrid";
          item.props = buildStructuredInteriorFeatureProps(interiorPageType as "products" | "solutions" | "cases" | "contact");
          publishedOriginalType = "";
          normalizedInteriorSlots.add(String(item.props.id || slotId));
        } else if (slotKind === "proof" && !normalizedInteriorSlots.has(slotId)) {
          item.type = "TestimonialsGrid";
          item.props = buildStructuredInteriorTestimonialsProps(interiorPageType);
          publishedOriginalType = "";
          normalizedInteriorSlots.add(String(item.props.id || slotId));
        } else if (slotKind === "story" && !normalizedInteriorSlots.has(slotId)) {
          item.type = "ContentStory";
          item.props = buildStructuredAboutStoryProps();
          publishedOriginalType = "";
          normalizedInteriorSlots.add(String(item.props.id || slotId));
        }
      }
      const effectiveType = inferEffectiveBlockType(item.type, publishedOriginalType);
      const inferredKind = inferDisplaySectionKind(item.type, publishedOriginalType);
      if (effectiveType === "Navbar") {
        applyTemplateNavbarBusinessProps(item.props);
      }
      if (effectiveType === "CreationFooterFallback") {
        applyTemplateFooterBusinessProps(item.props);
      }
      if (effectiveType === "HeroSplit" && matchesSectionSlot("primary-hero", "page-hero", "home.hero.1")) {
        writeTextPair(item.props, {
          eyebrow: brief.brand ? `${brief.brand} 3C CNC` : undefined,
          title: brief.heroTitle || String(item.props.title || ""),
          subtitle: brief.heroSubtitle || String(item.props.subtitle || ""),
        });
        item.props.ctas = [
          { label: brief.heroCtas?.[0] || "Get Quote", href: "/contact", variant: "primary" },
          { label: brief.heroCtas?.[1] || "Request Catalog", href: productsHref, variant: "secondary" },
        ];
        item.props.heroPrimaryTexttext = brief.heroCtas?.[0] || "Get Quote on WhatsApp";
        item.props.heroSecondaryTexttext = brief.heroCtas?.[1] || "Request Catalog";
      }
      if (effectiveType === "HeroSplit" && matchesSectionSlot("about.hero.1", "page-hero") && pageType === "about") {
        writeTextPair(item.props, {
          eyebrow: brief.brand || "About LC-CNC",
          title: "LC-CNC, Shenzhen since 2013",
          subtitle: brief.aboutText || "ISO-certified plant, 30+ R&D engineers, 200+ installed across SEA.",
        });
      }
      if (pageType === "products" && effectiveType === "HeroSplit" && inferredKind === "hero") {
        writeTextPair(item.props, {
          eyebrow: "3C machine portfolio",
          title: "3C CNC Machine Platforms",
          subtitle:
            "Phone-frame, laptop-shell, camera-bezel, and keypad centers configured for stable output and short delivery windows.",
        });
      }
      if (pageType === "solutions" && effectiveType === "HeroSplit" && inferredKind === "hero") {
        writeTextPair(item.props, {
          eyebrow: "Custom solutions",
          title: "Custom CNC Solutions for Southeast Asia",
          subtitle:
            "Fixture, spindle, automation, and line-integration packages built around takt time, finish quality, and deployment speed.",
        });
      }
      if (pageType === "cases" && effectiveType === "HeroSplit" && inferredKind === "hero") {
        writeTextPair(item.props, {
          eyebrow: "Production case studies",
          title: "Representative 3C machining programs",
          subtitle:
            "Phone frames, laptop shells, camera bezels, and keypad components delivered with repeatable cycle time and cosmetic-finish control.",
        });
      }
      if (effectiveType === "FeatureGrid" && matchesSectionSlot("capability-strip", "home.approach.1")) {
        item.props.variant = "4col";
        item.props.title = "LC-CNC, Shenzhen since 2013";
        item.props.subtitle = brief.aboutText || "ISO-certified plant, 30+ R&D engineers, 200+ installed across SEA.";
        item.props.items = [
          { title: "ISO-Certified Plant", desc: "Documented quality control and repeatable factory execution." },
          { title: "30+ R&D Engineers", desc: "Mechanical, tooling, controls, and automation line expertise." },
          { title: "200+ Installed Across SEA", desc: "Regional machine delivery, service, and process support." },
          { title: "Certifications", desc: (brief.certifications || ["ISO 9001", "CE", "SGS"]).join(" • ") },
        ];
      }
      if (effectiveType === "FeatureGrid" && matchesSectionSlot("process-proof", "home.approach.2")) {
        const features = brief.featureItems?.length
          ? brief.featureItems
          : ["Fast Customization → 10-Day Sample", "Short Lead-Time → 15-Day Shipment", "Local Support → WhatsApp + Regional Agent"];
        item.props.title = "Fast Customization, Lead Time, and Local Support";
        item.props.subtitle = "Execution signals that matter to regional buyers.";
        item.props.items = features.slice(0, 3).map((entry) => {
          const [title, desc] = entry.split("→").map((part) => part.trim());
          return { title: title || entry, desc: desc || "" };
        });
      }
      if (effectiveType === "CardsGrid" && matchesSectionSlot("featured-products", "home.products.1")) {
        const products = brief.productItems?.length
          ? brief.productItems
          : ["3C Phone-Frame Center", "3C Laptop-Shell Center", "3C Camera-Bezel Center", "3C Keypad Center"];
        item.props.title = "3C CNC Machine Portfolio";
        item.props.subtitle = "Industrial-grade machine platforms optimized for Southeast Asia 3C manufacturing.";
        item.props.items = products.slice(0, 4).map((name) => ({
          title: name,
          tag: brief.brand || "LC-CNC",
          description: "Core specs, stable output, and one-click quotation via WhatsApp.",
          cta: { label: "WhatsApp Quote", href: "/contact", variant: "primary" },
        }));
      }
      if (effectiveType === "TestimonialsGrid" && matchesSectionSlot("customer-proof", "home.socialproof.1")) {
        const cases = brief.caseItems?.length
          ? brief.caseItems
          : ["Phone Display Frame Machining", "Laptop Shell Machining", "Camera Bezel Machining", "Phone Keypad Machining"];
        item.props.title = "Application Cases";
        item.props.subtitle = "Representative 3C machining applications with stable throughput and finish quality.";
        item.props.items = cases.slice(0, 4).map((name) => ({
          name,
          role: "Application Case",
          quote: "Stable process design, repeatable output, and delivery discipline adapted to the part family.",
        }));
      }
      if (effectiveType === "LeadCaptureCTA" && matchesSectionRole("primary-cta")) {
        item.props.title = "Quick Quote & WhatsApp Contact";
        item.props.subtitle = `WhatsApp ${brief.whatsapp || ""} • ${brief.email || ""} • ${brief.address || ""}`.replace(/\s•\s$/, "");
        item.props.note = "I agree to receive follow-up via WhatsApp.";
        item.props.cta = { label: "Get Quote on WhatsApp", href: "/contact", variant: "primary" };
      }
      if (pageType === "home" && /Heropen/i.test(publishedOriginalType)) {
        const compactHeroTitle =
          /LC-CNC|3C CNC|CNC machine/i.test(brief.brand || "")
            ? "Precision 3C CNC Centers for Southeast Asia"
            : brief.heroTitle || "Precision 3C CNC Machines for Southeast Asia";
        writeTextPair(item.props, {
          eyebrow: brief.brand ? `${brief.brand} Shenzhen Factory Since 2013` : "Shenzhen Factory Since 2013",
          title: compactHeroTitle,
          subtitle: brief.heroSubtitle || "10-Day Prototype • 15-Day Delivery • 24/7 WhatsApp Support",
        });
        item.props.heroPrimaryTexttext = brief.heroCtas?.[0] || "Get Quote on WhatsApp";
        item.props.heroSecondaryTexttext = brief.heroCtas?.[1] || "Request Catalog";
        item.props.headerBrandtext = brief.brand || "LC-CNC™";
        item.props.heroimgimagesrc = lcCncAssets.hero;
      }
      if (pageType === "home" && /Story/i.test(publishedOriginalType)) {
        const products = brief.productItems?.length
          ? brief.productItems
          : ["3C Phone-Frame Center", "3C Laptop-Shell Center", "3C Camera-Bezel Center", "3C Keypad Center"];
        writeTextPair(item.props, {
          eyebrow: "Machine lineup",
          title: "3C CNC Machine Lineup",
          subtitle: "Phone-frame, laptop-shell, camera-bezel, and keypad machining centers built for fast quoting and export-ready delivery.",
        });
        applyProductCardSeries(item.props, products, brief.brand || "LC-CNC");
        item.props.card1imagesrc = lcCncAssets.phone;
        item.props.card2imagesrc = lcCncAssets.laptop;
        item.props.card3imagesrc = lcCncAssets.camera;
        item.props.card4imagesrc = lcCncAssets.keypad;
        item.props.card5imagesrc = lcCncAssets.hero;
        item.props.card6imagesrc = lcCncAssets.phone;
        item.props.catcard1stext = "Phone-frame machining center with stable tolerance control and quick fixture setup.";
        item.props.catcard2stext = "Laptop-shell center tuned for cosmetic-finish panels and repeatable cycle time.";
        item.props.catcard3stext = "Camera-bezel machining programs optimized for precision edges and steady throughput.";
        item.props.card4ttext = "3C Keypad Center";
        item.props.productCard1Bodytext = "Phone-frame machining center with stable tolerance control and quick fixture setup.";
        item.props.productCard2Bodytext = "Laptop-shell center tuned for cosmetic-finish panels and repeatable cycle time.";
        item.props.productCard3Bodytext = "Camera-bezel machining programs optimized for precision edges and steady throughput.";
        item.props.productCard4Bodytext = "Compact keypad machining center for high-mix small-part output.";
      }
      if (pageType === "home" && /Approach|Solutionsection|Findyoursolution/i.test(publishedOriginalType)) {
        const features = brief.featureItems?.length
          ? brief.featureItems
          : ["Fast Customization → 10-Day Sample", "Short Lead-Time → 15-Day Shipment", "Local Support → WhatsApp + Regional Agent"];
        writeTextPair(item.props, {
          eyebrow: "Why buyers choose LC-CNC",
          title: "Fast sample turnaround, shorter lead-time, and WhatsApp-first support",
          subtitle: "Built for Southeast Asia buyers who need machine decisions to move from quote to shipment without delay.",
        });
        applyFeatureSeries(item.props, features);
        item.props.splitimgimagesrc = lcCncAssets.hero;
      }
      if (pageType === "home" && /Productssection|ProductsGrid/i.test(publishedOriginalType)) {
        const products = brief.productItems?.length
          ? brief.productItems
          : ["3C Phone-Frame Center", "3C Laptop-Shell Center", "3C Camera-Bezel Center", "3C Keypad Center"];
        writeTextPair(item.props, {
          eyebrow: "Industrial equipment",
          title: "3C CNC Machine Portfolio",
          subtitle: "Core specs, stable output, and one-click quotation via WhatsApp.",
        });
        applyProductCardSeries(item.props, products, brief.brand || "LC-CNC");
      }
      if (pageType === "home" && effectiveType === "LeadCaptureCTA") {
        item.props.title = "Quick Quote & WhatsApp Contact";
        item.props.subtitle = `WhatsApp ${brief.whatsapp || "+86-158-1370-3777"} • ${brief.email || "sales@lc-cnc.com"} • ${brief.address || "Bao’an, Shenzhen, China"}`;
        item.props.note = "I agree to receive follow-up via WhatsApp.";
        item.props.cta = { label: brief.heroCtas?.[0] || "Get Quote on WhatsApp", href: "/contact", variant: "primary" };
        item.props.variant = "banner";
        item.props.paddingY = "xl";
        item.props.maxWidth = "2xl";
      }
      if (pageType === "home" && assemblyPolicy.normalizeHomeHero && item.type === "HeroSplit" && item.props.id === "structured-home-hero") {
        const existingTheme =
          item?.props?.theme && typeof item.props.theme === "object"
            ? (item.props.theme as Record<string, unknown>)
            : (page?.data?.root?.props?.theme as Record<string, unknown>) || {};
        item.props = {
          ...buildLcCncSandvikHeroProps(existingTheme),
          theme: existingTheme,
        };
      }
      if (pageType === "home" && assemblyPolicy.normalizeHomeProducts && item.type === "CardsGrid" && item.props.id === "structured-home-products") {
        const existingTheme =
          item?.props?.theme && typeof item.props.theme === "object"
            ? (item.props.theme as Record<string, unknown>)
            : (page?.data?.root?.props?.theme as Record<string, unknown>) || {};
        item.props = {
          ...buildLcCncSandvikHomeCardsProps(existingTheme),
          theme: existingTheme,
        };
      }
      if (effectiveType === "CardsGrid" && matchesSectionSlot("product-catalog", "products.products.1")) {
        item.props.title = "3C Machine Catalog";
        item.props.subtitle = "Machine families for phone frames, laptop shells, camera bezels, and keypad components.";
        item.props.items = (brief.productItems?.length ? brief.productItems : ["3C Phone-Frame Center", "3C Laptop-Shell Center", "3C Camera-Bezel Center", "3C Keypad Center"]).map((name) => ({
          title: name,
          description: "Core spindle, stroke, and throughput parameters for 3C machining lines.",
          cta: { label: "Request Catalog", href: "/contact", variant: "primary" },
        }));
      }
      if (pageType === "products" && effectiveType === "ContentStory") {
        writeTextPair(item.props, {
          title: "Configured for high-mix 3C machining lines",
          subtitle:
            "Each machine family is matched to part geometry, spindle demand, fixture strategy, and output rhythm instead of generic spec-sheet positioning.",
        });
      }
      if (effectiveType === "FeatureGrid" && matchesSectionSlot("specification-summary", "products.approach.1")) {
        item.props.title = "Core Machine Specifications";
        item.props.subtitle = "Rigid structure, repeatable accuracy, and deployment-ready configuration options.";
        item.props.items = [
          { title: "High-Rigidity Frame", desc: "Stable machining performance for aluminum and magnesium 3C parts." },
          { title: "Flexible Spindle Packages", desc: "Configured for roughing, finishing, and compact-feature processing." },
          { title: "Automation Ready", desc: "Supports loaders, conveyors, and inline inspection expansion." },
        ];
      }
      if (pageType === "products" && effectiveType === "FeatureGrid") {
        item.props.title = "Core Machine Specifications";
        item.props.subtitle = "Rigidity, spindle flexibility, and automation readiness for Southeast Asia 3C production.";
      }
      if (effectiveType === "TestimonialsGrid" && matchesSectionSlot("buyer-proof", "products.socialproof.1")) {
        item.props.title = "Why Buyers Choose LC-CNC";
        item.props.subtitle = "Catalog decisions driven by throughput, uptime, and support responsiveness.";
        item.props.items = [
          { name: "Procurement Team", role: "Vietnam", quote: "Machine selection was tied to real part geometry and lead-time targets, not generic specs." },
          { name: "Production Manager", role: "Thailand", quote: "The catalog clearly mapped each platform to cycle time, fixture strategy, and line scalability." },
        ];
      }
      if (effectiveType === "CardsGrid" && matchesSectionSlot("solution-offers", "solutions.products.1")) {
        item.props.title = "Custom Solutions";
        item.props.subtitle = "Turnkey OEM/ODM lines, custom fixtures, spindle packages, and automation integration.";
        item.props.items = [
          "Turnkey 3C production line",
          "Custom fixture engineering",
          "OEM/ODM machine adaptation",
          "Automation integration cell",
        ].map((name) => ({
          title: name,
          description: "Configured around takt time, part geometry, and local commissioning needs.",
          cta: { label: "Discuss Solution", href: "/contact", variant: "primary" },
        }));
      }
      if (effectiveType === "FeatureGrid" && matchesSectionSlot("solution-categories", "solutions.approach.1")) {
        item.props.title = "Solution Categories";
        item.props.subtitle = "Structured offers for OEM/ODM production planning and line adaptation.";
        item.props.items = [
          { title: "Turnkey Line Design", desc: "Machine layout, process logic, and ramp-up support for new 3C programs." },
          { title: "Fixture & Tooling Packages", desc: "Custom workholding and cutting strategy matched to the part family." },
          { title: "Automation Integration", desc: "Loading, unloading, transfer, and inspection interfaces for scale." },
        ];
      }
      if (effectiveType === "FeatureGrid" && matchesSectionSlot("delivery-workflow", "solutions.approach.2")) {
        item.props.title = "Delivery Workflow";
        item.props.subtitle = "From inquiry to commissioning with clear checkpoints.";
        item.props.items = [
          { title: "Requirement Review", desc: "Part drawing, takt time, and finish constraints are translated into an equipment concept." },
          { title: "Sample & Validation", desc: "Pilot setup and sample verification de-risk the handoff before shipment." },
          { title: "Shipment & Start-up", desc: "Regional delivery coordination, installation, and production launch support." },
        ];
      }
      if (effectiveType === "TestimonialsGrid" && matchesSectionSlot("implementation-proof", "solutions.socialproof.1")) {
        item.props.title = "Implementation Confidence";
        item.props.subtitle = "Programs that need adaptation, not off-the-shelf machine selection.";
        item.props.items = [
          { name: "Operations Lead", role: "OEM Program", quote: "The proposed line matched both the part flow and the regional staffing reality." },
          { name: "Engineering Manager", role: "ODM Factory", quote: "Fixture, spindle, and automation decisions were resolved as one system instead of separate vendors." },
        ];
      }
      if (pageType === "solutions" && effectiveType === "ContentStory") {
        writeTextPair(item.props, {
          title: "Solutions engineered around output constraints",
          subtitle:
            "We translate part drawings, takt targets, and staffing reality into machine, tooling, and automation decisions that can be commissioned quickly.",
        });
      }
      if (effectiveType === "CardsGrid" && matchesSectionSlot("case-gallery", "cases.products.1")) {
        item.props.title = "Manufacturing Outcomes";
        item.props.subtitle = "Programs focused on cycle-time reduction, stable delivery, and finish consistency.";
        item.props.items = (brief.caseItems?.length ? brief.caseItems : ["Phone Display Frame Machining", "Laptop Shell Machining", "Camera Bezel Machining", "Phone Keypad Machining"]).map((name) => ({
          title: name,
          description: "Application-focused production outcome with controlled tolerance and repeatable output.",
          cta: { label: "View Case", href: "/cases", variant: "primary" },
        }));
      }
      if (effectiveType === "FeatureGrid" && matchesSectionSlot("case-metrics", "cases.approach.1")) {
        item.props.title = "Case Performance Signals";
        item.props.subtitle = "How factory programs are evaluated after deployment.";
        item.props.items = [
          { title: "Cycle Time Reduction", desc: "Measured against the original process baseline and takt target." },
          { title: "Yield Stability", desc: "Tracked across production shifts, changeovers, and operator variation." },
          { title: "Ramp-up Speed", desc: "Focused on time-to-output after installation and process verification." },
        ];
      }
      if (pageType === "cases" && /UseCasesStoryAudienceSegments/i.test(publishedOriginalType)) {
        item.props.audlabeltext = "Case portfolio";
        item.props.audtitletext = "Machining programs delivered across Southeast Asia";
        const caseItems = (brief.caseItems?.length
          ? brief.caseItems
          : ["Phone Display Frame Machining", "Laptop Shell Machining", "Camera Bezel Machining"]) as string[];
        caseItems.slice(0, 3).forEach((name, idx) => {
          const slot = idx + 1;
          item.props[`audcard${slot}tagtext`] = "Case study";
          item.props[`audcard${slot}titletext`] = name;
          item.props[`audcard${slot}bodytext`] =
            "Validated around cycle time, finish quality, and delivery stability after ramp-up.";
          item.props[`audcard${slot}metatext`] = "SEA deployment";
        });
      }
      if (pageType === "cases" && /ReviewsProductsGrid/i.test(publishedOriginalType)) {
        const caseItems = (brief.caseItems?.length
          ? brief.caseItems
          : ["Phone Display Frame Machining", "Laptop Shell Machining", "Camera Bezel Machining", "Phone Keypad Machining"]) as string[];
        caseItems.slice(0, 4).forEach((name, idx) => {
          const slot = idx + 1;
          item.props[`q${slot}text`] = name;
          item.props[`a${slot}text`] = "Cycle time, yield, and finish consistency improved after deployment.";
          item.props[`card${slot}href`] = "/cases";
        });
      }
      if (effectiveType === "TestimonialsGrid" && matchesSectionSlot("customer-feedback", "cases.socialproof.1")) {
        item.props.title = "Customer Feedback";
        item.props.subtitle = "Application-specific outcomes from Southeast Asia programs.";
        item.props.items = [
          { name: "Phone Display Frame Machining", role: "Vietnam", quote: "The line stabilized output quickly while maintaining the cosmetic finish required for premium devices." },
          { name: "Laptop Shell Machining", role: "Malaysia", quote: "Fixture and process tuning reduced rework and improved delivery confidence across multiple batches." },
        ];
      }
      if (pageType === "about" && /AboutHero/i.test(publishedOriginalType)) {
        item.props.heroeyebrowtext = brief.brand || "About LC-CNC";
        item.props.herotitletext = "LC-CNC, Shenzhen since 2013";
        item.props.herobodytext =
          brief.aboutText || "ISO-certified plant, 30+ R&D engineers, and 200+ installed systems across Southeast Asia.";
      }
      if (pageType === "about" && /Missionband/i.test(publishedOriginalType)) {
        item.props.missioneyebrowtext = "Factory capability";
        item.props.missiontagtext = "Factory capability";
        item.props.missionheadlinetext = "Quality discipline, process engineering, and regional support";
        item.props.missionsupporttext =
          "LC-CNC combines plant execution, tooling know-how, and field response to support 3C manufacturing programs across Southeast Asia.";
      }
      if (effectiveType === "ContentStory" && matchesSectionSlot("company-story", "about.story.1")) {
        writeTextPair(item.props, {
          eyebrow: brief.brand || "About LC-CNC",
          title: "LC-CNC, Shenzhen since 2013",
          subtitle: brief.aboutText || String(item.props.subtitle || ""),
        });
      }
      if (effectiveType === "ContentStory" && matchesSectionRole("product-context")) {
        writeTextPair(item.props, {
          title: "Machine platforms for precise, scalable 3C production",
          subtitle:
            "Configured around part geometry, fixture strategy, spindle selection, and line-side automation requirements.",
        });
      }
      if (effectiveType === "ContentStory" && matchesSectionRole("solution-context")) {
        writeTextPair(item.props, {
          title: "Solutions engineered around process, takt time, and deployment constraints",
          subtitle:
            "From requirement review to validation and ramp-up, each solution package is planned around production outcomes.",
        });
      }
      if (effectiveType === "ContentStory" && matchesSectionRole("case-narrative")) {
        writeTextPair(item.props, {
          title: "Representative machining programs across Southeast Asia",
          subtitle:
            "Programs are evaluated by cycle time, yield stability, commissioning speed, and long-run delivery confidence.",
        });
      }
      if (effectiveType === "CardsGrid" && matchesSectionSlot("capability-cards", "about.products.1")) {
        item.props.title = "Factory Capability Highlights";
        item.props.subtitle = "Engineering depth, factory discipline, and regional support for Southeast Asia.";
        item.props.items = [
          "Process engineering and tooling support",
          "Factory commissioning and training",
          "Quality documentation and inspection flow",
          "Regional after-sales response",
        ].map((name) => ({
          title: name,
          description: "Operational capability aligned to multi-site 3C production programs.",
          cta: { label: "Talk to LC-CNC", href: "/contact", variant: "primary" },
        }));
      }
      if (effectiveType === "TestimonialsGrid" && matchesSectionSlot("certification-proof", "about.socialproof.1")) {
        item.props.title = "Certifications";
        item.props.subtitle = (brief.certifications || ["ISO 9001", "CE", "SGS"]).join(" • ");
        item.props.items = (brief.certifications || ["ISO 9001", "CE", "SGS"]).map((name) => ({
          name,
          role: "Certification",
          quote: "Verified manufacturing and quality management standard.",
        }));
      }
      if (pageType === "about" && effectiveType === "TestimonialsGrid") {
        item.props.title = "Certifications";
        item.props.subtitle = (brief.certifications || ["ISO 9001", "CE", "SGS"]).join(" • ");
        item.props.items = (brief.certifications || ["ISO 9001", "CE", "SGS"]).map((name) => ({
          name,
          role: "Certification",
          quote: "Verified manufacturing and quality management standard.",
        }));
      }
      if (effectiveType === "FeatureGrid" && matchesSectionSlot("contact-channels", "contact.approach.1")) {
        item.props.title = "Contact Channels";
        item.props.subtitle = "Commercial response routed for Southeast Asia machine procurement.";
        item.props.items = [
          { title: "WhatsApp", desc: brief.whatsapp || "+86-158-1370-3777" },
          { title: "Email", desc: brief.email || "sales@lc-cnc.com" },
          { title: "Factory Base", desc: brief.address || "Bao’an, Shenzhen, China" },
        ];
      }
      if (effectiveType === "TestimonialsGrid" && matchesSectionSlot("quote-requirements", "contact.socialproof.1")) {
        item.props.title = "Quote Requirements";
        item.props.subtitle = "Prepare these details for a faster response.";
        item.props.items = [
          { name: "Required Fields", role: "Form", quote: "Name, Company, Email, WhatsApp, Machine Model, Quantity, Deadline." },
          { name: "Consent", role: "Follow-up", quote: "I agree to receive follow-up via WhatsApp." },
        ];
      }
      if (effectiveType === "LeadCaptureCTA" && matchesSectionSlot("quote-cta", "contact.cta.1", "catalog-cta", "consultation-cta", "case-cta", "about-cta", "support-cta")) {
        writeTextPair(item.props, {
          title: "Quick Quote Form",
          subtitle: `WhatsApp ${brief.whatsapp || "+86-158-1370-3777"} • ${brief.email || "sales@lc-cnc.com"} • ${brief.address || "Bao’an, Shenzhen, China"}`,
        });
        item.props.note = "I agree to receive follow-up via WhatsApp.";
        item.props.cta = { label: "Get Quote on WhatsApp", href: "/contact", variant: "primary" };
      }
      item.props = sanitizeGeneratedProps(item.props, {
        prompt,
        pagePath: page.path,
        imageIntent: sectionImageIntent,
        profileId: publishedOriginalType,
      }) as Record<string, unknown>;
      item.props = sanitizeTemplateExclusiveProps(item.props, {
        pageType,
        publishedOriginalType,
      });
      if (effectiveType === "Navbar") {
        item.props.logo = { alt: brief.brand || "Brand" };
        item.props.logoText = brief.brand || "Brand";
        item.props.links = navLinks;
        item.props.ctas = [];
      }
      if (effectiveType === "CreationFooterFallback") {
        item.props.logoText = brief.brand || "Brand";
        item.props.ftlogotext = brief.brand || "Brand";
        item.props.columns = footerCols;
        item.props.legal = brief.copyright || `© 2024 ${brief.brand || "Brand"}. All rights reserved.`;
        item.props.copytext = brief.copyright || `© 2024 ${brief.brand || "Brand"}. All rights reserved.`;
      }
      if (pageType === "cases" && /ReviewsHero/i.test(publishedOriginalType)) {
        item.props.tagtext = "Production case studies";
        item.props.httext = "Representative 3C machining programs";
        item.props.hstext =
          "Phone frames, laptop shells, camera bezels, and keypad components delivered with stable cycle time and cosmetic-finish control.";
      }
      if (pageType === "cases" && /UseCasesStoryAudienceSegments/i.test(publishedOriginalType)) {
        const caseItems = (brief.caseItems?.length
          ? brief.caseItems
          : ["Phone Display Frame Machining", "Laptop Shell Machining", "Camera Bezel Machining"]) as string[];
        item.props.audlabeltext = "Case portfolio";
        item.props.audtitletext = "Machining programs delivered across Southeast Asia";
        caseItems.slice(0, 3).forEach((name, idx) => {
          const slot = idx + 1;
          item.props[`audcard${slot}tagtext`] = "Case study";
          item.props[`audcard${slot}titletext`] = name;
          item.props[`audcard${slot}bodytext`] =
            "Validated around cycle time, finish quality, and delivery stability after ramp-up.";
          item.props[`audcard${slot}metatext`] = "SEA deployment";
        });
      }
      if (pageType === "cases" && /ReviewsProductsGrid/i.test(publishedOriginalType)) {
        const caseItems = (brief.caseItems?.length
          ? brief.caseItems
          : ["Phone Display Frame Machining", "Laptop Shell Machining", "Camera Bezel Machining", "Phone Keypad Machining"]) as string[];
        caseItems.slice(0, 4).forEach((name, idx) => {
          const slot = idx + 1;
          item.props[`q${slot}text`] = name;
          item.props[`a${slot}text`] = "Cycle time, yield, and finish consistency improved after deployment.";
          item.props[`card${slot}href`] = "/cases";
        });
      }
      if (pageType === "about" && /AboutHero/i.test(publishedOriginalType)) {
        item.props.heroeyebrowtext = brief.brand || "About LC-CNC";
        item.props.herotitletext = "LC-CNC, Shenzhen since 2013";
        item.props.herobodytext =
          brief.aboutText || "ISO-certified plant, 30+ R&D engineers, and 200+ installed systems across Southeast Asia.";
      }
      if (pageType === "about" && /Missionband/i.test(publishedOriginalType)) {
        item.props.missioneyebrowtext = "Factory capability";
        item.props.missiontagtext = "Factory capability";
        item.props.missionheadlinetext = "Quality discipline, process engineering, and regional support";
        item.props.missionsupporttext =
          "LC-CNC combines plant execution, tooling know-how, and field response to support 3C manufacturing programs across Southeast Asia.";
      }
    });
    if (interiorPageType && assemblyPolicy.normalizeInteriorPages) {
      const targetKinds = new Set(interiorAssemblySlots[interiorPageType]);
      const preferredIndexByKind = new Map<"hero" | "products" | "features" | "proof" | "story", number>();
      next.data.content.forEach((item, index) => {
        const publishedOriginalType =
          typeof item?.props?.__publishedOriginalType === "string" ? String(item.props.__publishedOriginalType) : "";
        const effectiveType = inferEffectiveBlockType(item.type, publishedOriginalType);
        const kind =
          effectiveType === "HeroSplit"
            ? "hero"
            : effectiveType === "CardsGrid"
              ? "products"
              : effectiveType === "FeatureGrid"
                ? "features"
                : effectiveType === "TestimonialsGrid"
                  ? "proof"
                  : effectiveType === "ContentStory"
                    ? "story"
                    : null;
        if (!kind || !targetKinds.has(kind)) return;
        const itemId = String(item?.props?.id || "");
        const isStructuredCanonical = itemId.startsWith(`structured-${interiorPageType}-`);
        if (!preferredIndexByKind.has(kind) || isStructuredCanonical) {
          preferredIndexByKind.set(kind, index);
        }
      });
      next.data.content = next.data.content.filter((item, index) => {
        const publishedOriginalType =
          typeof item?.props?.__publishedOriginalType === "string" ? String(item.props.__publishedOriginalType) : "";
        const effectiveType = inferEffectiveBlockType(item.type, publishedOriginalType);
        const kind =
          effectiveType === "HeroSplit"
            ? "hero"
            : effectiveType === "CardsGrid"
              ? "products"
              : effectiveType === "FeatureGrid"
                ? "features"
                : effectiveType === "TestimonialsGrid"
                  ? "proof"
                  : effectiveType === "ContentStory"
                    ? "story"
                    : null;
        if (!kind) return true;
        if (!targetKinds.has(kind)) return true;
        const preferredIndex = preferredIndexByKind.get(kind);
        return preferredIndex === index;
      });
    }
    if (pageType === "contact" && assemblyPolicy.ensureContactChannels) {
      const hasContactChannels = next.data.content.some(
        (item) =>
          item.type === "FeatureGrid" &&
          (item.props.id === "structured-contact-channels" || item.props.anchor === "contact-channels")
      );
      if (!hasContactChannels) {
        const footerIndex = next.data.content.findIndex(
          (item) => item.type === "Footer" || /Footer/i.test(String(item.props?.__publishedOriginalType || item.type))
        );
        const insertIndex = footerIndex >= 0 ? footerIndex : next.data.content.length;
        next.data.content.splice(insertIndex, 0, {
          type: "FeatureGrid",
          props: {
            id: "structured-contact-channels",
            anchor: "contact-channels",
            paddingY: "md",
            background: "gradient",
            backgroundGradient: "linear-gradient(180deg, #f3f3f2 0%, #ebe6dd 100%)",
            maxWidth: "xl",
            title: "Contact Channels",
            subtitle: "Commercial response routed for Southeast Asia machine procurement.",
            items: [
              { title: "WhatsApp", desc: brief.whatsapp || "+86-158-1370-3777" },
              { title: "Email", desc: brief.email || "sales@lc-cnc.com" },
              { title: "Factory Base", desc: brief.address || "Bao’an, Shenzhen, China" },
            ],
          },
        });
      }
    }
    return next;
  });
};

const hashSemanticImageSeed = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) >>> 0;
  }
  return hash % 997;
};

const finalSemanticImageGallery: Record<string, string[]> = {
  cncHero: [
    "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
  ],
  cncProduct: [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
  ],
  cncCase: [
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1600&q=80",
  ],
  cncIndustry: [
    "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
  ],
  industrial: [
    "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
  ],
  neutral: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80",
  ],
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
  if (!/^https?:\/\//i.test(current)) return "";
  if (/^data:image\//i.test(current) || /\/generated-pen-assets\//i.test(current)) return "";
  const raw = `${String(input.prompt || "")} ${String(input.designNorthStar?.industry || "")} ${JSON.stringify(
    input.designNorthStar?.coreProducts || []
  )}`.toLowerCase();
  const cncIntent =
    /(cnc|machine tool|machine-tools|machining|metal cutting|milling|lathe|spindle|five-axis|5-axis|加工中心|机床|数控|刀具|切削|3c)/i.test(
      raw
    );
  const token = `${pagePath} ${keyPath.join(".")}`.toLowerCase();
  const normalizedIntent = String(input.imageIntent || "").trim().toLowerCase();
  const forcedBucket =
    normalizedIntent === "cnc-hero"
      ? "cncHero"
      : normalizedIntent === "cnc-product"
        ? "cncProduct"
        : normalizedIntent === "cnc-case"
          ? "cncCase"
          : normalizedIntent === "cnc-industry"
            ? "cncIndustry"
            : normalizedIntent === "industrial"
              ? "industrial"
              : normalizedIntent === "neutral"
                ? "neutral"
                : normalizedIntent === "none"
                  ? "none"
                  : "";
  if (forcedBucket === "none") return "";
  let bucket = forcedBucket || (cncIntent ? "cncProduct" : "industrial");
  if (!forcedBucket && cncIntent && (pagePath === "/" || /hero|masthead|banner/.test(token))) bucket = "cncHero";
  else if (!forcedBucket && cncIntent && (/\/cases\b/.test(pagePath) || /case|study|capture/.test(token))) bucket = "cncCase";
  else if (!forcedBucket && cncIntent && (/\/industries\b/.test(pagePath) || /industry|segment|application/.test(token))) bucket = "cncIndustry";
  else if (!forcedBucket && cncIntent && (/\/products\b/.test(pagePath) || /product|catalog|showcase/.test(token))) bucket = "cncProduct";
  const choices = finalSemanticImageGallery[bucket] ?? finalSemanticImageGallery.industrial;
  if (!choices.length) return "";
  const seed = hashSemanticImageSeed(`${pagePath}:${keyPath.join(".")}:${current}`);
  return choices[seed % choices.length];
};

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

const sanitizeFinalPagesOutput = (
  pages: GeneratedPage[],
  input: { prompt: string; designNorthStar?: Record<string, unknown>; profileId?: unknown }
): GeneratedPage[] =>
  pages.map((page) => ({
    ...page,
    data: sanitizeGeneratedProps(page.data, { ...input, pagePath: page.path }) as GeneratedPage["data"],
  }));

const contextualFallbackHref = (
  keyPath: string[],
  currentValue: string,
  graph: SiteLinkGraph,
  pagePath: string
) => {
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
    ((pagePath === "/products" || pagePath === "/3c-machines") && /(href|cta|button|btn|card\d+href)/.test(key));
  const prefersSolutions =
    /(solution|service|capability|workflow|process|automation)/.test(key) ||
    ((pagePath === "/solutions" || pagePath === "/custom-solutions") && /(href|cta|button|btn|card\d+href)/.test(key));
  const prefersIndustries =
    /(industry|application|market|usecard|sector)/.test(key) ||
    (pagePath === "/industries" && /(href|cta|button|btn|card\d+href)/.test(key));
  const prefersCases =
    /(case|study|customer|project|proof|result|card\d+href)/.test(key) ||
    (pagePath === "/cases" && /(href|cta|button|btn)/.test(key));
  const prefersAbout =
    /(about|company|team|story|mission|vision|history)/.test(key) ||
    (pagePath === "/about" && /(href|cta|button|btn)/.test(key));
  const prefersContact =
    /(contact|quote|sales|consult|orderbtn|request|inquire|book|demo)/.test(key) ||
    (pagePath === "/contact" && /(href|cta|button|btn)/.test(key));
  if (prefersProducts && graph.validInternalHrefs.has("/3c-machines")) {
    return "/3c-machines";
  }
  if (prefersProducts && graph.validInternalHrefs.has("/products")) {
    return "/products";
  }
  if (prefersSolutions && graph.validInternalHrefs.has("/custom-solutions")) {
    return "/custom-solutions";
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
  if (leafKey === "href" && pagePath !== "/" && graph.validInternalHrefs.has(pagePath)) {
    return pagePath;
  }
  if (pagePath === "/contact" && graph.validInternalHrefs.has("/contact")) {
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
6. Default output language is English unless the user explicitly requests Chinese
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
      const providerModelName = resolveProviderModel(provider.name, modelName);
      try {
        return await callWithProvider(provider, modelName, providerModelName, tokenBudget);
      } catch (error) {
        if (isAbortLikeError(error)) {
          throw error;
        }
        lastError = error;
        if (providerDisableMs > 0 && isAuthOrQuotaProviderError(error) && llmProviders.length > 1) {
          providerDisabledUntil.set(provider.name, Date.now() + providerDisableMs);
          logWarn(`${logPrefix} request:provider_disabled`, {
            provider: provider.name,
            requestedModel: modelName,
            disableMs: providerDisableMs,
            reason: "auth_or_quota",
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
        const canFallbackToNextProvider = allowProviderFallbackOnAnyError || shouldFallbackToNextProvider(error);
        if (hasNextProvider && !canFallbackToNextProvider) {
          logInfo(`${logPrefix} request:provider_fallback_skipped`, {
            provider: provider.name,
            model: providerModelName,
            requestedModel: modelName,
            mode: crossProviderFallbackMode,
          });
          break;
        }
      }
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
  const templateSeedBlueprint = buildTemplateSeedBlueprint(state.prompt ?? "");
  if (templateSeedBlueprint) {
    let seededBlueprint = applyUserThemeIntent(templateSeedBlueprint, state.prompt ?? "");
    seededBlueprint = applyReferenceBlueprintConstraints(seededBlueprint, state.prompt ?? "");
    seededBlueprint = ensurePromptRequestedPages(seededBlueprint, state.prompt ?? "") as ArchitectBlueprint;
    seededBlueprint = ensureEnterpriseBlueprintPages(seededBlueprint, state.prompt ?? "") as ArchitectBlueprint;
    const seededPages = normalizePages(seededBlueprint);
    logInfo(`${logPrefix} architect:template_seed`, {
      profileId: selectStyleProfile(state.prompt ?? "")?.id ?? null,
      pages: seededPages.length,
      sections: seededPages.reduce((total, page) => total + page.sections.length, 0),
    });
    if (planning) {
      await planning.markArchitectComplete(seededBlueprint as Record<string, unknown>, seededPages);
    }
    return { blueprint: seededBlueprint };
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
    const fallbackRaw = await callLlm({
      system,
      prompt: retryPrompt,
      temperature: 0.35,
      maxTokens: architectMaxTokens,
      allowProviderFallbackOnAnyError: true,
    });
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
      const compactRaw = await callLlm({
        system,
        prompt: compactPrompt,
        temperature: 0.2,
        maxTokens: architectMaxTokens,
        allowProviderFallbackOnAnyError: true,
      });
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
  const pages = normalizePages(blueprint);
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
  const activeSectionGenerationStrategy = state.generationStrategy ?? sectionGenerationStrategy;
  const blueprint = (state.blueprint ?? {}) as ArchitectBlueprint;
  let pages = normalizePages(blueprint);
  const requestedPages = extractRequestedPagesFromPrompt(state.prompt ?? "");
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
  if (looksLikeEnterpriseWebsite({ prompt: state.prompt ?? "", pages }) && requestedPages.length < 3) {
    pages = normalizePages({
      pages: ensureEnterpriseSitePages(pages, (definition) => ({
        path: definition.path,
        name: definition.name,
        sections: [],
      })),
    });
  }
  const templateResolution = resolveTemplatePlan({
    prompt: state.prompt ?? "",
    pages,
    strategy: activeSectionGenerationStrategy,
  });
  pages = normalizePages({ pages: templateResolution.pages as any });
  const siteBlueprint = buildSiteBlueprint({
    profileId: templateResolution.profileId,
    prompt: state.prompt ?? "",
    pages,
  });
  const linkGraph = buildSiteLinkGraph(siteBlueprint);
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
    retryMode: builderRetryMode,
    sectionMaxAttempts: effectiveSectionMaxAttempts,
    networkRetryAttempts: configuredNetworkRetryAttempts,
    builderRecoveryMaxTokens,
    refinementEnabled: enableBuilderRefinement,
    repairEnabled: enableBuilderRepair,
    templatePlanProfile: templateResolution.profileId,
    skeleton: siteBlueprint.skeleton,
    sitePages: siteBlueprint.pages.map((page) => page.path).join(","),
    navLinks: linkGraph.navigationLinks.length,
      resolutionLayer: templateResolution.layer,
      matchedPageCoverage: templateResolution.diagnostics.matchedPageCoverage,
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
    }) => {
      try {
        return await callLlm({
          system,
          prompt: options.prompt,
          temperature: options.temp,
          maxTokens: options.maxTokens ?? builderMaxTokens,
          tools: [builderTool],
          toolChoice: { type: "tool", name: builderTool.name },
          modelOverride: options.modelOverride,
        });
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

    if (!allowNonNetworkRetries) {
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
        });
        if (!isEmptyResponse(compactRaw)) return compactRaw;
        if (fallbackModelDefault && fallbackModelDefault !== primaryModelDefault) {
          const compactFallbackRaw = await callWithBuilderTool({
            prompt: compactRetryPrompt,
            temp: Math.max(0.1, temperature - 0.3),
            maxTokens: builderRecoveryMaxTokens,
            modelOverride: fallbackModelDefault,
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
      const emergencyTextRaw = await callLlm({
        system,
        prompt: emergencyNoToolPrompt,
        temperature: Math.max(0.1, temperature - 0.3),
        maxTokens: builderRecoveryMaxTokens,
      });
      if (!isEmptyResponse(emergencyTextRaw)) return emergencyTextRaw;
      if (fallbackModelDefault && fallbackModelDefault !== primaryModelDefault) {
        const emergencyTextFallbackRaw = await callLlm({
          system,
          prompt: emergencyNoToolPrompt,
          temperature: Math.max(0.1, temperature - 0.3),
          maxTokens: builderRecoveryMaxTokens,
          modelOverride: fallbackModelDefault,
        });
        if (!isEmptyResponse(emergencyTextFallbackRaw)) return emergencyTextFallbackRaw;
      }
      throw Object.assign(new Error("builder_section_empty"), { code: "parse" });
    }

    const retryPrompt = `${promptText}\n\n必须通过工具返回 JSON，不要返回 {} 或空响应。只输出 component + block。`;
    const retryRaw = await callWithBuilderTool({
      prompt: retryPrompt,
      temp: Math.max(0.2, temperature - 0.2),
      maxTokens: builderMaxTokens,
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
      });
      if (!isEmptyResponse(compactRaw)) return compactRaw;
      if (fallbackModelDefault && fallbackModelDefault !== primaryModelDefault) {
        const compactFallbackRaw = await callWithBuilderTool({
          prompt: compactRetryPrompt,
          temp: Math.max(0.1, temperature - 0.3),
          maxTokens: builderRecoveryMaxTokens,
          modelOverride: fallbackModelDefault,
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
      });
      if (!isEmptyResponse(fallbackRaw)) return fallbackRaw;
    }
    const noToolPrompt = `${retryPrompt}\n\n如果工具调用不可用，直接输出严格 JSON（component + block），不要 Markdown 或解释文本。`;
    const textRaw = await callLlm({
      system,
      prompt: noToolPrompt,
      temperature: Math.max(0.1, temperature - 0.3),
      maxTokens: builderRecoveryMaxTokens,
    });
    if (!isEmptyResponse(textRaw)) return textRaw;
    if (fallbackModelDefault && fallbackModelDefault !== primaryModelDefault) {
      const textFallbackRaw = await callLlm({
        system,
        prompt: noToolPrompt,
        temperature: Math.max(0.1, temperature - 0.3),
        maxTokens: builderRecoveryMaxTokens,
        modelOverride: fallbackModelDefault,
      });
      if (!isEmptyResponse(textFallbackRaw)) return textFallbackRaw;
    }
    throw Object.assign(new Error("builder_section_empty"), { code: "parse" });
  };

  const maxConcurrency = Number.isFinite(defaultSectionConcurrency)
    ? Math.max(1, defaultSectionConcurrency)
    : 3;

  const preferLlmForDesignFidelity = isDetailedDesignBrief(state.prompt ?? "");
    if (preferLlmForDesignFidelity) {
      logInfo(`${logPrefix} builder:quality_mode`, {
        mode: "detailed_design_brief",
      strategy: activeSectionGenerationStrategy,
      llmRoutedSections: llmFirstSectionTokens.join(","),
    });
  }

  const results = await runWithConcurrency(sections, maxConcurrency, async (context): Promise<BuilderSectionResult> => {
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
          refinementEnabled: enableTemplateRefinement,
        });
      const baseResult = createTemplateSectionResult(
        context,
        state.prompt ?? "",
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
      if (enableTemplateRefinement && baseResult.status === "ok") {
        const allowRefinementForLayer = templateResolution.layer === "section";
        if (!allowRefinementForLayer) {
          return baseResult;
        }
        const refinedBlock = await refineTemplateWithLlm(
          context,
          state.prompt ?? "",
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
    const maxAttempts = allowNonNetworkRetries
      ? effectiveSectionMaxAttempts
      : effectiveSectionMaxAttempts + configuredNetworkRetryAttempts;
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
        prompt: state.prompt ?? "",
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
        if (!normalized && allowNonNetworkRetries) {
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
            state.prompt ?? "",
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
        if (enableBuilderRepair && isLast && (failureType === "parse" || failureType === "layout")) {
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
          (allowNonNetworkRetries || (!allowNonNetworkRetries && failureType === "network"));
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
              state.prompt ?? "",
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
              state.prompt ?? "",
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
      state.prompt ?? "",
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

  if (refinementCandidates.length && !enableBuilderRefinement) {
    logInfo(`${logPrefix} builder:refine:skipped`, {
      sections: refinementCandidates.length,
      reason: "refinement_disabled",
      retryMode: builderRetryMode,
    });
    refinementCandidates.forEach((candidate) => {
      const context = candidate.context;
      errors.push(`builder_section_fallback:${candidate.failureType}:${context.pagePath}:${context.section.id}`);
    });
  }

  if (refinementCandidates.length && enableBuilderRefinement) {
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
            prompt: state.prompt ?? "",
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
          item.props = ensureAnchor(
            ensurePropsId(
              sanitizeSemanticProps(
                sanitizeInternalHrefsInProps(sanitizedExistingProps, linkGraph),
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
          item.props = ensureAnchor(
            ensurePropsId(
              sanitizeSemanticProps(
                sanitizeInternalHrefsInProps(sanitizedExistingProps, linkGraph),
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
          variant === "contact" ? "Contact" : "CTA",
          variant === "contact" ? "Provide contact and consultation pathways." : "Prompt the visitor to take the next step."
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
          variant === "contact" ? "Contact" : "CTA",
          variant === "contact" ? "Provide contact and consultation pathways." : "Prompt the visitor to take the next step."
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
    const finalizeTemplateNavbarProps = (props: Record<string, unknown>) => {
      const fallbackNav = { ...(fallbackNavbarProps as Record<string, unknown>) };
      const navOrder = new Map([
        ["/", 0],
        ["/3c-machines", 1],
        ["/custom-solutions", 2],
        ["/cases", 3],
        ["/about", 4],
        ["/contact", 5],
        ["/privacy", 6],
      ]);
      const navLabelByHref = new Map([
        ["/", "Home"],
        ["/3c-machines", "3C Machines"],
        ["/custom-solutions", "Custom Solutions"],
        ["/cases", "Cases"],
        ["/about", "About"],
        ["/contact", "Contact"],
      ]);
      const fallbackLinks = Array.isArray((fallbackNav as any).links) ? (fallbackNav as any).links : [];
      const orderedLinks = fallbackLinks
        .filter((link: any) => String(link?.href || "") !== "/privacy")
        .sort((a: any, b: any) => {
          const aRank = navOrder.get(String(a?.href || "")) ?? 999;
          const bRank = navOrder.get(String(b?.href || "")) ?? 999;
          return aRank - bRank;
        })
        .map((link: any) => ({
          ...link,
          label: navLabelByHref.get(String(link?.href || "")) || String(link?.label || ""),
        }));
      const compactNavText = orderedLinks.map((link: any) => String(link?.label || "")).filter(Boolean).join(" | ");
      const brandText = String(
        ((designNorthStar as any)?.brand as string) ||
          extractBrandNameFromPromptLite(state.prompt ?? "") ||
          (fallbackNav as any).logoText ||
          props.logoText ||
          "Brand"
      );
      const primaryCta = /Get Quote on WhatsApp/i.test(state.prompt ?? "")
        ? "Get Quote on WhatsApp"
        : String((fallbackNav as any).ctatexttext || "Contact");
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
      props.logintxttext = "Contact";
      props.logintxthref = "/contact";
      props.searchtxttext = "";
      props.searchtxthref = "/";
      props.langtxttext = "EN";
      props.langtxthref = "/";
      props.utilitytext = "Industrial CNC systems";
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
      const footerColumns = [
        {
          title: "Products",
          links: [
            { label: "3C Machines", href: "/3c-machines" },
            { label: "Custom Solutions", href: "/custom-solutions" },
            { label: "Cases", href: "/cases" },
          ],
        },
        {
          title: "Support",
          links: [
            { label: "Contact", href: "/contact" },
            { label: "Request Catalog", href: "/contact" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "/about" },
            { label: "Privacy", href: "/privacy" },
          ],
        },
      ];
      const flattenedFooterLinks = footerColumns.flatMap((column: any) => column.links || []);
      const copyrightText = String(
        (state.prompt ?? "").match(/Copyright\s*(?:©|&copy;)?\s*\d{4}[^\n]*/i)?.[0] ||
          (fallbackFooter as any).copytext ||
          (fallbackFooter as any).legal ||
          `© 2024 ${footerBrand}. All rights reserved.`
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
      props.footercompanytext = String((fallbackFooter as any).footercompanytext || (fallbackFooter as any).footeraddresstext || "Bao'an, Shenzhen, China");
      props.footercompanyhref = "/about";
      props.footeraddresstext = String((fallbackFooter as any).footeraddresstext || "Bao'an, Shenzhen, China");
      props.footeraddresshref = "/about";
      props.footercontacttext = String((fallbackFooter as any).footercontacttext || "Contact");
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
        "Contact",
        "Provide contact and consultation pathways."
      );
      const fallbackContact = buildDeterministicFallbackBlock(
        contactContext,
        state.prompt ?? "",
        designNorthStar as Record<string, unknown>,
        theme as Record<string, unknown>,
        { skipRegistry: true }
      );
      const contactBlock =
        themeDrivenBody[themeDrivenBody.length - 1] ??
        {
          type: fallbackContact.type,
          props: fallbackContact.props,
          _key: `${page.path}:contact:canonical`,
        };
      page.data.content = [preservedNavbar, ...nonThemeDrivenBody, contactBlock, preservedFooter];
      return;
    }

    const ctaBlock = themeDrivenBody.length > 0 ? themeDrivenBody[themeDrivenBody.length - 1] : null;
    page.data.content = [preservedNavbar, ...nonThemeDrivenBody, ...(ctaBlock ? [ctaBlock] : []), preservedFooter];
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
  const structuredBrief = parseStructuredBrief(state.prompt ?? "");
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

  pagesOut = applyStructuredBriefOverrides(pagesOut, state.prompt ?? "", templateResolution.profileId ?? null);
  pagesOut = sanitizeFinalPagesOutput(pagesOut, {
    prompt: state.prompt ?? "",
    designNorthStar: designNorthStar ?? undefined,
    profileId: templateResolution.profileId ?? null,
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
  });
  if (!qaReport.pass) {
    errors.push(
      `qa_gate_failed:coverage=${qaReport.coverageScore.toFixed(3)}:links=${qaReport.linkIntegrityScore.toFixed(3)}:theme=${qaReport.themeConsistencyScore.toFixed(3)}:semantic=${qaReport.semanticFidelityScore.toFixed(3)}:overall=${qaReport.overallScore.toFixed(3)}`
    );
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
    siteBlueprint,
    qaReport,
    resolvedByLayer: {
      strategy: sectionGenerationStrategy,
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

const resolveCandidateStrategiesForPrompt = (prompt: string): SectionGenerationStrategy[] => {
  if (!enableMultiCandidateSelection) return [sectionGenerationStrategy];
  const requestedPages = extractRequestedPagesFromPrompt(prompt);
  const brief = parseStructuredBrief(prompt);
  const detailed = isDetailedDesignBrief(prompt);
  const matchedProfile = selectStyleProfile(prompt);
  const explicitReference =
    /\b(?:like|inspired by|based on|similar to|reference(?:d)? from|modeled on)\b/i.test(String(prompt || "")) ||
    /\buse\s+[A-Za-z0-9\u4e00-\u9fff][^,.;\n]{1,50}\s+as\s+(?:the\s+)?(?:(?:visual\s+style|visual\s+template|template|style|visual)\s+)?(?:reference|base)\b/i.test(
      String(prompt || "")
    ) ||
    Boolean(extractBrandNameFromPromptLite(prompt));
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
    hasExplicitTemplateReference(prompt) ||
    Boolean(extractBrandNameFromPromptLite(prompt)) ||
    Boolean(parseStructuredBrief(prompt)?.brand) ||
    extractSourceBrandTokens(prompt).length > 0;
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
  planning?: { dir: string; requestId?: string; batchSize?: number };
}) {
  const [skillContext, designSystemContext] = await Promise.all([
    loadSkillContext(),
    loadDesignSystemContext(),
  ]);
  const graph = new StateGraph(State)
    .addNode("architect", architectNode)
    .addNode("builder", builderNode)
    .addEdge(START, "architect")
    .addEdge("architect", "builder")
    .addEdge("builder", END)
    .compile();

  const planning = input.planning?.dir
    ? await PlanningFiles.init({
        rootDir: input.planning.dir,
        prompt: input.prompt,
        requestId: input.planning.requestId,
        batchSize: input.planning.batchSize,
      })
    : null;
  const candidateStrategies = resolveCandidateStrategiesForPrompt(input.prompt);
  const runPlanning = candidateStrategies.length > 1 ? null : planning;
  const baseInput = {
    prompt: input.prompt,
    manifest: input.manifest,
    planning: runPlanning,
    skillContext,
    designSystemContext,
    blueprint: planning?.getBlueprint() ?? undefined,
  };

  const primaryResult = await graph.invoke({
    ...baseInput,
    generationStrategy: candidateStrategies[0] ?? sectionGenerationStrategy,
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
    shouldShortCircuitCandidateSelection(input.prompt, primaryResult, candidates[0].score);

  const reusableBlueprint =
    primaryResult?.blueprint && typeof primaryResult.blueprint === "object"
      ? (primaryResult.blueprint as Record<string, unknown>)
      : baseInput.blueprint;

  if (!shortCircuitSelection) {
    for (const strategy of candidateStrategies.slice(1)) {
      const candidateResult = await graph.invoke({
        ...baseInput,
        planning: null,
        blueprint: reusableBlueprint,
        generationStrategy: strategy,
      });
      candidates.push({
        strategy,
        result: candidateResult,
        score: scoreGenerationCandidate(candidateResult),
      });
    }
  }

  candidates.sort((left, right) => {
    if (right.score.score !== left.score.score) return right.score.score - left.score.score;
    if (Number(right.score.pass) !== Number(left.score.pass)) return Number(right.score.pass) - Number(left.score.pass);
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

  return {
    blueprint: result.blueprint ?? {},
    theme: result.theme ?? (result.blueprint as any)?.theme ?? {},
    pages: result.pages ?? [],
    components: result.components ?? [],
    siteBlueprint: result.siteBlueprint ?? {},
    qaReport: result.qaReport ?? {},
    resolvedByLayer: result.resolvedByLayer ?? {},
    errors: result.errors ?? [],
  };
}
