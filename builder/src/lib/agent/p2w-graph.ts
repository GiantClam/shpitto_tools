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
import { resolveSectionTemplateBlock, selectStyleProfile } from "@/lib/agent/section-template-registry";

const State = Annotation.Root({
  prompt: Annotation<string>,
  manifest: Annotation<Record<string, unknown>>,
  blueprint: Annotation<Record<string, unknown>>,
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
  | { status: "ok"; component: SectionComponent; block: SectionBlock }
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
const defaultMaxPages = Number(process.env.CREATION_MAX_PAGES || 1);
const defaultMaxSectionsPerPage = Number(process.env.CREATION_MAX_SECTIONS_PER_PAGE || 6);
const defaultMaxSectionsTotal = Number(process.env.CREATION_MAX_SECTIONS_TOTAL || 10);
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

const useCompactDesignSystemForBuilder = parseEnvBoolean(
  process.env.BUILDER_USE_COMPACT_DESIGN_SYSTEM_PROMPT,
  true
);
const sectionGenerationStrategy = parseSectionGenerationStrategy(
  process.env.BUILDER_SECTION_GENERATION_STRATEGY,
  "hybrid"
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
        { title: "Premium Towels", desc: "Fast sampling and custom branding." },
        { title: "Bathrobes", desc: "Hotel-grade fabrics and stitching." },
        { title: "Bath Mats", desc: "High-absorbency, anti-slip options." },
        { title: "Beach Towels", desc: "Vibrant prints for resort programs." },
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
      : ["NASA", "SpaceX", "Uber", "VISA", "Airbnb", "Meta"];
    const fallbackTestimonials = safeTestimonials.length
      ? safeTestimonials
      : [
          {
            name: "Alexander Vane",
            role: "CEO at Aura",
            quote:
              "Sixtine didn't just design a house; they curated a lifestyle.",
          },
          {
            name: "Isabelle Dubois",
            role: "Founder of ArtHouse",
            quote:
              "An absolute masterclass in restraint and elegance for premium spaces.",
          },
        ];
    return (
      <section id={anchor} className="py-20 bg-muted/30">
        <div className="mx-auto w-full max-w-[1200px] px-6 space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Collaborators</p>
            <h2 className="font-heading text-3xl md:text-4xl tracking-tight">{title || "Building for world-class innovators"}</h2>
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
        links: [{ label: "Privacy", href: "#privacy" }, { label: "Sitemap", href: "#top" }]
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
  if (
    normalized.includes("breton.it") ||
    /\bbreton\b/.test(normalized) ||
    /\bindustrial\b/.test(normalized)
  ) {
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

const normalizePages = (blueprint: ArchitectBlueprint | Record<string, unknown>) => {
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
  const maxPages = clampPositiveInt(defaultMaxPages, 3, 1, 10);
  const maxSectionsPerPage = clampPositiveInt(defaultMaxSectionsPerPage, 6, 1, 12);
  const maxSectionsTotal = clampPositiveInt(defaultMaxSectionsTotal, 10, 1, 24);
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
  return limitedPages;
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
  approach: [/approach|metric|stats|feature|value|process|capability|benefit|numbers?/],
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

const sectionMatchesTemplateKind = (section: ArchitectSection, kind: TemplatePlanSectionKind) => {
  const token = `${section.type ?? ""} ${section.id ?? ""} ${section.intent ?? ""}`.toLowerCase();
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

  const nextPages = pages.map((page) => {
    const sourceSections = Array.isArray(page.sections) ? page.sections : [];
    const used = new Set<number>();
    const planned = orderedKinds.map((kind) => {
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
      styleDNA: isMedical ? ["clinical", "precise", "trustworthy"] : ["clean", "modern", "high-clarity"],
      typographyScale: "clear hierarchy",
      visualHierarchy: "headline-first",
      imageMood: isMedical ? "clean laboratory and clinical scenes" : "clean product photography",
      industry: isMedical ? "medical-diagnostics" : "technology",
      coreProducts: isMedical ? ["diagnostic tests", "lab services", "screening"] : ["core service", "platform", "support"],
    },
    theme: {
      mode: "light",
      radius: "0.5rem",
      fontHeading: "Manrope",
      fontBody: "Manrope",
      motion: "subtle",
      tokens: { surface: "card", border: "soft", shadow: "soft", accent: "flat" },
      themeContract: {
        voice: isMedical ? "tech" : "minimal",
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
  { words: ["gold", "golden", "brass", "bronze", "champagne"], hex: "#D4AF37" },
  { words: ["silver", "chrome", "platinum", "steel"], hex: "#C0C0C0" },
  { words: ["blue", "navy", "indigo", "azure", "cobalt"], hex: "#2563EB" },
  { words: ["green", "emerald", "olive", "mint"], hex: "#10B981" },
  { words: ["red", "crimson", "scarlet", "ruby"], hex: "#EF4444" },
  { words: ["orange", "amber", "tangerine", "coral"], hex: "#F97316" },
  { words: ["purple", "violet", "lavender", "plum"], hex: "#8B5CF6" },
  { words: ["pink", "rose", "magenta"], hex: "#EC4899" },
  { words: ["brown", "tan", "beige", "sand", "taupe"], hex: "#C2A37A" },
  { words: ["gray", "grey", "slate", "graphite", "charcoal"], hex: "#6B7280" },
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
  ];
  const warmScore = warmKeywords.filter((word) => hasKeyword(context, word)).length;
  const coolScore = coolKeywords.filter((word) => hasKeyword(context, word)).length;
  if (warmScore > coolScore) return "warm";
  if (coolScore > warmScore) return "cool";
  return "neutral";
};

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
    labeledColors.accent || explicitColors[1] || explicitColors[0] || existingPalette.accent || fallbackPrimary;
  const primary = labeledColors.accent || fallbackPrimary || accent;
  if (primary) nextPalette.primary = primary;
  if (accent) nextPalette.accent = accent;
  if (!nextPalette.primary) nextPalette.primary = nextPalette.text;
  if (!nextPalette.accent) nextPalette.accent = nextPalette.textSecondary;

  Object.keys(TOKEN_NAME_MAP).forEach((key) => {
    tokens[key] = TOKEN_NAME_MAP[key];
  });

  const nextTheme = {
    ...theme,
    mode,
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

const buildNavbarLinks = (page: ReturnType<typeof normalizePages>[number]) => {
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
      return { label: compacted || "Section", href: `#${section.id}` };
    });
  return links.length ? links : [{ label: "Home", href: "#top" }];
};

const buildNavbarCtas = (page: ReturnType<typeof normalizePages>[number]) => {
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
  return [{ label, href: `#${target.id}`, variant: "primary" }];
};

const buildNavbarProps = (
  page: ReturnType<typeof normalizePages>[number],
  theme: Record<string, unknown>
) => {
  const headingFont = typeof (theme as any)?.fontHeading === "string" ? (theme as any).fontHeading : undefined;
  const bodyFont = typeof (theme as any)?.fontBody === "string" ? (theme as any).fontBody : undefined;
  const nameSeed = typeof page.name === "string" ? page.name : page.path || "home";
  const idSuffix = normalizeKey(nameSeed) || "home";
  const links = buildNavbarLinks(page);
  const ctas = buildNavbarCtas(page) ?? [];
  const hasChildren = links.some(
    (link) => Array.isArray((link as any).children) && (link as any).children.length > 0
  );
  const variant = ctas.length ? "withCTA" : hasChildren ? "withDropdown" : "simple";
  return {
    id: `navbar-${idSuffix}`,
    anchor: "top",
    logo: { alt: page.name || "Site" },
    links,
    ctas,
    variant,
    sticky: true,
    paddingY: "sm",
    maxWidth: "xl",
    headingFont,
    bodyFont,
  };
};

const buildFooterColumns = (page: ReturnType<typeof normalizePages>[number]) => {
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
      links: [
        { label: "Privacy", href: "#privacy", variant: "link" as const },
        { label: "Sitemap", href: "#top", variant: "link" as const },
      ],
    },
  ];
};

const buildFooterProps = (
  page: ReturnType<typeof normalizePages>[number],
  theme: Record<string, unknown>
) => {
  const headingFont = typeof (theme as any)?.fontHeading === "string" ? (theme as any).fontHeading : undefined;
  const bodyFont = typeof (theme as any)?.fontBody === "string" ? (theme as any).fontBody : undefined;
  const nameSeed = typeof page.name === "string" ? page.name : page.path || "home";
  const idSuffix = normalizeKey(nameSeed) || "home";
  return {
    id: `footer-${idSuffix}`,
    anchor: "footer",
    logoText: page.name || "Company",
    columns: buildFooterColumns(page),
    legal: `© ${new Date().getFullYear()} ${page.name || "Company"}. All rights reserved.`,
    headingFont,
    bodyFont,
    variant: "multiColumn" as const,
    paddingY: "md" as const,
    maxWidth: "xl" as const,
  };
};

const isFooterLikeBlock = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  const type = typeof item?.type === "string" ? item.type.toLowerCase() : "";
  const anchor = typeof item?.props?.anchor === "string" ? item.props.anchor.toLowerCase() : "";
  const id = typeof item?.props?.id === "string" ? item.props.id.toLowerCase() : "";
  const variant = typeof item?.props?.variant === "string" ? item.props.variant.toLowerCase() : "";
  if (type === errorComponentName.toLowerCase()) {
    return false;
  }
  if (type === fallbackComponentName.toLowerCase()) {
    return (
      anchor.includes("footer") ||
      id.includes("footer") ||
      variant === "cta" ||
      (Array.isArray((item?.props as any)?.footerLinks) && (item?.props as any).footerLinks.length > 0) ||
      Boolean((item?.props as any)?.legal)
    );
  }
  return type.includes("footer") || anchor.includes("footer") || id.includes("footer");
};

const isCtaLikeBlock = (item: { type?: string; props?: Record<string, unknown> } | undefined) => {
  const type = typeof item?.type === "string" ? item.type.toLowerCase() : "";
  const anchor = typeof item?.props?.anchor === "string" ? item.props.anchor.toLowerCase() : "";
  const id = typeof item?.props?.id === "string" ? item.props.id.toLowerCase() : "";
  const variant = typeof item?.props?.variant === "string" ? item.props.variant.toLowerCase() : "";
  if (type === errorComponentName.toLowerCase()) {
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

const buildDeterministicFallbackBlock = (
  context: SectionContext,
  prompt: string
): SectionBlock => {
  const token = sectionToken(context);
  const shortPrompt = trimLine(prompt, "Industrial Automation Platform", 68);
  const siteTitle = trimLine(prompt, "Breton-style industrial homepage", 52);
  const idBase = `${toSlug(context.section.type || "section") || "section"}-${context.sectionIndex + 1}`;
  const anchor = context.section.id;
  const registryTemplate = resolveSectionTemplateBlock({
    prompt,
    pageName: context.pageName,
    sectionType: context.section.type,
    sectionId: context.section.id,
    sectionIntent: context.section.intent,
    idBase,
    anchor,
  });
  if (registryTemplate) {
    return registryTemplate;
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
    return {
      type: "HeroSplit",
      props: {
        id: idBase,
        anchor,
        eyebrow: "Industrial Solutions",
        title: shortPrompt,
        subtitle:
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
    return {
      type: "CardsGrid",
      props: {
        id: idBase,
        anchor,
        title: "Product Lines",
        subtitle: "Modular machines for cutting, finishing, and automated handling.",
        variant: "product",
        columns: "3col",
        density: "normal",
        cardStyle: "solid",
        maxWidth: "xl",
        items: [
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
        ],
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
        title: "What collaborators say",
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
    return {
      type: "ContentStory",
      props: {
        id: idBase,
        anchor,
        title: "Our Story",
        subtitle: "A concise narrative that connects brand intent, craft, and client outcomes.",
        body: "We combine strategic clarity, visual refinement, and execution discipline to create enduring digital experiences.",
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
    return {
      type: "LeadCaptureCTA",
      props: {
        id: idBase,
        anchor,
        title: "Talk to our team",
        subtitle: "Share your production goals and receive a tailored implementation plan.",
        cta: { label: "Contact Sales", href: "mailto:sales@example.com", variant: "primary" },
        note: siteTitle,
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
        title: "Key Capabilities",
        subtitle: "Designed for uptime, precision, and scalable production.",
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
      title: shortPrompt,
      subtitle: "Structured fallback section generated locally to keep the page usable.",
      body: "Regenerate when the model endpoint is stable to replace this with a richer, custom section.",
      ctas: [{ label: "Regenerate", href: "#top", variant: "primary" }],
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
  options?: { preferLlmForDesignFidelity?: boolean }
) => {
  if (sectionGenerationStrategy === "template_first") return true;

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
  if (sectionGenerationStrategy === "llm_first") return Boolean(hintTemplatePreferred);
  return Boolean(explicitTokenMatch || variantMatch);
};

const shouldTemplateRecoverFromFailure = (
  context: SectionContext,
  failureType: FailureType,
  options?: { preferLlmForDesignFidelity?: boolean }
) => {
  if (sectionGenerationStrategy === "llm_first") return false;
  if (!templateRecoveryFailureTypes.has(String(failureType))) return false;
  if (sectionGenerationStrategy === "template_first") return true;
  return shouldTemplateFirstForSection(context, options);
};

const createTemplateSectionResult = (
  context: SectionContext,
  prompt: string,
  _designNorthStar?: Record<string, unknown>,
  _theme?: Record<string, unknown>
): BuilderSectionResult => {
  const templateBlock = buildDeterministicFallbackBlock(context, prompt);
  return {
    status: "ok",
    component: { name: fallbackComponentName, code: fallbackComponentCode },
    block: { type: templateBlock.type, props: templateBlock.props },
  };
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
  const designSystemPrompt = buildDesignSystemPromptContext(state.designSystemContext);
  const basePrompt = buildArchitectUserPrompt(state.prompt ?? "", state.manifest ?? {});
  const prompt = designSystemPrompt ? `${basePrompt}\n\n${designSystemPrompt}` : basePrompt;
  const system = applySkillContext(architectSystemPrompt, state.skillContext?.architect ?? "");
  const retryPrompt = `${prompt}\n\n重要：必须返回完整 JSON，不允许返回 {} 或空数组。至少包含 1 个 page 与 1 个 section。`;
  const compactPrompt = `${prompt}\n\n重要：输出必须是紧凑 JSON（无多余解释）。propsHints 只保留 3-5 个短字段，列表最多 6 项；每页不超过 6 个 section，避免长文案与深层嵌套。`;
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
  const blueprint = (state.blueprint ?? {}) as ArchitectBlueprint;
  let pages = normalizePages(blueprint);
  const templatePlan = applyTemplateFirstSectionPlan(pages, state.prompt ?? "");
  pages = templatePlan.pages;
  const allSections = flattenSections(pages);
  const theme =
    blueprint?.theme && typeof blueprint.theme === "object" ? blueprint.theme : {};
  let themeContract = (theme?.themeContract as ThemeContract) ?? {};
  const planning = state.planning ?? null;
  const completedSectionKeys = planning?.getCompletedSectionKeys() ?? new Set<string>();
  const savedSectionOutputs = planning?.getSectionOutputs() ?? [];
  const sections = completedSectionKeys.size
    ? allSections.filter((context) => !completedSectionKeys.has(buildSectionKey(context)))
    : allSections;
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
    pendingSections: sections.length,
    compactDesignSystemPrompt: useCompactDesignSystemForBuilder,
    sectionGenerationStrategy,
    templateFirstSections: templateFirstSectionTokens.join(","),
    llmFirstSections: llmFirstSectionTokens.join(","),
    templateFirstVariants: Array.from(templateFirstVariantTokens).join(","),
    retryMode: builderRetryMode,
    sectionMaxAttempts: effectiveSectionMaxAttempts,
    networkRetryAttempts: configuredNetworkRetryAttempts,
    builderRecoveryMaxTokens,
    refinementEnabled: enableBuilderRefinement,
    repairEnabled: enableBuilderRepair,
    templatePlanProfile: templatePlan.profileId,
  });
  if (templatePlan.profileId) {
    logInfo(`${logPrefix} builder:template_plan_applied`, {
      profileId: templatePlan.profileId,
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

  if (allSections.length === 0) {
    const emptyPages = pages.map((page) => ({
      path: page.path,
      name: page.name,
      data: {
        content: [],
        root: { props: { title: page.name, theme, ...(page.root?.props ?? {}) } },
      },
    }));
    return { components: [], pages: emptyPages, theme, errors };
  }

  const maxConcurrency = Number.isFinite(defaultSectionConcurrency)
    ? Math.max(1, defaultSectionConcurrency)
    : 3;

  const preferLlmForDesignFidelity = isDetailedDesignBrief(state.prompt ?? "");
  if (preferLlmForDesignFidelity) {
    logInfo(`${logPrefix} builder:quality_mode`, {
      mode: "detailed_design_brief",
      strategy: sectionGenerationStrategy,
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
    const templatePrimary = shouldTemplateFirstForSection(context, { preferLlmForDesignFidelity });
    if (templatePrimary && !enableTemplateShadowRun) {
      logInfo(`${logPrefix} builder:section:template_primary`, {
        ...baseInfo,
        strategy: sectionGenerationStrategy,
        variant: templateVariant,
      });
      return createTemplateSectionResult(
        context,
        state.prompt ?? "",
        designNorthStar as Record<string, unknown>,
        theme as Record<string, unknown>
      );
    }
    if (templatePrimary && enableTemplateShadowRun) {
      logInfo(`${logPrefix} builder:section:template_shadow_start`, {
        ...baseInfo,
        strategy: sectionGenerationStrategy,
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
              strategy: sectionGenerationStrategy,
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
      block: buildDeterministicFallbackBlock(context, state.prompt ?? ""),
      error: "builder_section_failed",
      failureType: "unknown",
    };
  });

  const needsAutoNavbarByPage = pages.map((page) => !pageHasNavigationSection(page));
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
  const pagesOut = pages.map((page) => ({
    path: page.path,
    name: page.name,
    data: {
      content: [] as Array<{ type: string; props: Record<string, unknown> }>,
      root: { props: { title: page.name, theme, ...(page.root?.props ?? {}) } },
    },
  }));
  const existingKeys = new Set<string>();
  const pageIndexByPath = new Map<string, number>();
  pagesOut.forEach((page, index) => {
    if (page.path) pageIndexByPath.set(page.path, index);
  });
  pagesOut.forEach((page, index) => {
    const source = pages[index];
    if (!source) return;
    if (!needsAutoNavbarByPage[index]) return;
    const key = `navbar:${page.path ?? index}`;
    if (existingKeys.has(key)) return;
    const baseProps = buildNavbarProps(source, theme);
    const normalizedProps = normalizeBlockProps(navbarComponentName, baseProps, {
      logChanges: true,
      summary: normalizationSummary,
    });
    const propsWithId = ensurePropsId(normalizedProps, baseProps.id);
    const propsWithAnchor = ensureAnchor(propsWithId, "top");
    page.data.content.unshift({
      type: navbarComponentName,
      props: propsWithAnchor,
      _key: key,
    } as any);
    existingKeys.add(key);
  });
  if (savedSectionOutputs.length) {
    savedSectionOutputs.forEach((output) => {
      const pageIndex = pageIndexByPath.get(output.pagePath ?? "");
      const page = typeof pageIndex === "number" ? pagesOut[pageIndex] : undefined;
      if (!page || existingKeys.has(output.key)) return;
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
      const fallback = buildDeterministicFallbackBlock(context, state.prompt ?? "");
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
          const refinePrompt = `${prompt}\n\n# Refinement Pass\n上一次输出为空或未通过校验。请返回一个简洁、可运行且满足 layoutHint 的 section。必须输出严格 JSON（component + block）。`;
          const compactRefinePrompt = `${compactPrompt}\n\n# Refinement Pass\n上一次输出为空或未通过校验。请返回一个简洁、可运行且满足 layoutHint 的 section。必须输出严格 JSON（component + block）。`;
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
      [...(Array.isArray(sourcePage.sections) ? sourcePage.sections : [])].reverse().find((section) =>
        isCtaLikeSection(section)
      ) ?? null;
    const sectionId = toSlug(sourceSection?.id || "footer-cta") || "footer-cta";
    const sectionType = typeof sourceSection?.type === "string" && sourceSection.type.trim() ? sourceSection.type : "CTABanner";
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
    const baseBlock = buildDeterministicFallbackBlock(ctaContext, state.prompt ?? "");
    const normalizedProps = normalizeBlockProps(baseBlock.type, baseBlock.props, {
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
      reason: "missing_cta_block",
      cta_injected: true,
    });
  });

  let injectedFooterBlocks = 0;
  pagesOut.forEach((page, pageIndex) => {
    const content = Array.isArray(page.data.content) ? page.data.content : [];
    if (pageHasFooterBlock(content as any)) return;
    const sourcePage = pages[pageIndex];
    if (!sourcePage) return;
    const key = `footer:${page.path ?? pageIndex}:injected`;
    if (existingKeys.has(key)) return;

    const baseProps = buildFooterProps(sourcePage, theme);
    const normalizedProps = normalizeBlockProps(footerFallbackComponentName, baseProps, {
      logChanges: true,
      summary: normalizationSummary,
    });
    const propsWithId = ensurePropsId(normalizedProps, baseProps.id);
    const propsWithAnchor = ensureAnchor(propsWithId, "footer");
    page.data.content.push({
      type: footerFallbackComponentName,
      props: propsWithAnchor,
      _key: key,
    } as any);
    existingKeys.add(key);
    injectedFooterBlocks += 1;
    logInfo(`${logPrefix} builder:footer_injected`, {
      pagePath: page.path,
      pageName: page.name,
      reason: "missing_footer_block",
      footer_injected: true,
    });
  });

  const needsFallbackComponent = pagesOut.some((page) =>
    page.data.content.some((item: any) => item?.type === fallbackComponentName)
  );
  if (needsFallbackComponent) {
    const existing = componentsMap.get(fallbackComponentName);
    if (existing && existing.code !== fallbackComponentCode) {
      errors.push(`builder_component_conflict:${fallbackComponentName}`);
    } else if (!existing) {
      componentsMap.set(fallbackComponentName, { name: fallbackComponentName, code: fallbackComponentCode });
    }
  }
  if (injectedFooterBlocks > 0) {
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

  const report = guardian.postGenerateCheck(pagesOut);
  logInfo(`${logPrefix} guardian:postcheck`, {
    score: report.score,
    issues: report.issues.slice(0, 10),
    suggestions: report.suggestions,
  });
  if (planning) {
    await planning.markPostcheckComplete();
  }

  return {
    components: Array.from(componentsMap.values()),
    pages: pagesOut,
    theme,
    errors,
  };
}

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

  const result = await graph.invoke({
    prompt: input.prompt,
    manifest: input.manifest,
    planning,
    skillContext,
    designSystemContext,
    blueprint: planning?.getBlueprint() ?? undefined,
  });

  return {
    blueprint: result.blueprint ?? {},
    theme: result.theme ?? (result.blueprint as any)?.theme ?? {},
    pages: result.pages ?? [],
    components: result.components ?? [],
    errors: result.errors ?? [],
  };
}
