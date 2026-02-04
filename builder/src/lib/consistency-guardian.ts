type ThemeContract = {
  voice?: string;
  tokens?: {
    primary?: string;
    accent?: string;
    neutral?: string;
    bg?: string;
    text?: string;
    textSecondary?: string;
    metallic?: string;
    radiusScale?: string;
    shadowScale?: string;
  };
  layoutRules?: {
    maxWidth?: string;
    sectionPadding?: string;
    grid?: string;
    sectionAlignOverrides?: Record<string, "start" | "center">;
  };
  motionRules?: {
    durationBase?: number;
    easing?: string;
    distanceScale?: string;
    intensity?: string;
  };
  breakoutBudget?: {
    allowedSections?: string[];
    colorBoost?: number;
    motionBoost?: number;
    layoutVariants?: string[];
  };
};

type LayoutPattern = {
  id: string;
  category: "hero" | "content" | "cards" | "list";
  description: string;
  constraints: Record<string, string | number | boolean>;
};

type ValidationResult = {
  passed: boolean;
  errors: string[];
  warnings: string[];
};

type ConsistencyReport = {
  timestamp: string;
  score: number;
  checks: Record<string, unknown>;
  issues: string[];
  suggestions: string[];
};

type CreativeFreedom = {
  score: number;
  allowed: {
    icons: string[];
    animations: string[];
    microInteractions: string[];
  };
  forbidden: {
    colors: boolean;
    fonts: boolean;
    spacing: boolean;
    layout: boolean;
  };
};

type CreativeGuidance = {
  stunningEffects: string[];
  animationHints: string[];
  visualPriority: string;
  freedom: CreativeFreedom;
};

const DEFAULT_THEME_CONTRACT: Required<ThemeContract> = {
  voice: "minimal",
  tokens: {
    primary: "primary",
    accent: "accent",
    neutral: "neutral",
    bg: "background",
    text: "foreground",
    textSecondary: "muted-foreground",
    metallic: "metallic",
    radiusScale: "md",
    shadowScale: "soft",
  },
  layoutRules: {
    maxWidth: "1200px",
    sectionPadding: "py-20",
    grid: "12-col",
  },
  motionRules: {
    durationBase: 0.6,
    easing: "easeOut",
    distanceScale: "md",
    intensity: "subtle",
  },
  breakoutBudget: {
    allowedSections: ["hero", "showcase"],
    colorBoost: 1.3,
    motionBoost: 1.5,
    layoutVariants: ["asymmetric", "full-bleed"],
  },
};

export const LAYOUT_PATTERNS: Record<string, LayoutPattern> = {
  heroCentered: {
    id: "hero-centered",
    category: "hero",
    description: "Centered hero with balanced copy and media",
    constraints: { maxContentWidth: "800px", textAlign: "center", mediaPosition: "below" },
  },
  heroSplit: {
    id: "hero-split",
    category: "hero",
    description: "Split hero content/media",
    constraints: { grid: "1fr 1fr", gap: "var(--space-8)", contentAlign: "left" },
  },
  contentSingle: {
    id: "content-single",
    category: "content",
    description: "Single column text",
    constraints: { maxWidth: "720px", margin: "0 auto" },
  },
  contentTwoCol: {
    id: "content-two",
    category: "content",
    description: "Two column content",
    constraints: { grid: "1fr 1fr", gap: "var(--space-12)" },
  },
  cardsGrid3: {
    id: "cards-3col",
    category: "cards",
    description: "3 column cards grid",
    constraints: { columns: 3, maxItems: 9 },
  },
  cardsGrid4: {
    id: "cards-4col",
    category: "cards",
    description: "4 column cards grid",
    constraints: { columns: 4, maxItems: 8 },
  },
  listRows: {
    id: "list-rows",
    category: "list",
    description: "Vertical list",
    constraints: { layout: "rows", maxItems: 6 },
  },
};

export const CREATIVE_FREEDOM_MAP: Record<string, CreativeFreedom> = {
  Button: {
    score: 60,
    allowed: {
      icons: ["lucide", "custom-svg"],
      animations: ["scale", "glow", "ripple"],
      microInteractions: ["hover-lift", "active-press"],
    },
    forbidden: { colors: true, fonts: true, spacing: false, layout: true },
  },
  HeroSplit: {
    score: 40,
    allowed: {
      icons: [],
      animations: ["fade-in", "slide-in"],
      microInteractions: [],
    },
    forbidden: { colors: true, fonts: true, spacing: true, layout: false },
  },
  CardsGrid: {
    score: 50,
    allowed: {
      icons: ["lucide"],
      animations: ["stagger", "lift"],
      microInteractions: ["hover-lift"],
    },
    forbidden: { colors: true, fonts: true, spacing: true, layout: false },
  },
};

const STUNNING_EFFECTS = [
  "glow-button",
  "glass-card",
  "stagger-entrance",
  "gradient-text",
  "hover-lift",
];

const resolveSectionImportance = (sectionId?: string) => {
  if (!sectionId) return "medium";
  if (/hero|showcase|product|catalog|pricing|cta/i.test(sectionId)) return "high";
  if (/faq|footer|info/i.test(sectionId)) return "low";
  return "medium";
};

const normalizeThemeContract = (contract: ThemeContract | undefined) => {
  const next = {
    ...DEFAULT_THEME_CONTRACT,
    ...contract,
    tokens: { ...DEFAULT_THEME_CONTRACT.tokens, ...(contract?.tokens ?? {}) },
    layoutRules: { ...DEFAULT_THEME_CONTRACT.layoutRules, ...(contract?.layoutRules ?? {}) },
    motionRules: { ...DEFAULT_THEME_CONTRACT.motionRules, ...(contract?.motionRules ?? {}) },
    breakoutBudget: { ...DEFAULT_THEME_CONTRACT.breakoutBudget, ...(contract?.breakoutBudget ?? {}) },
  };
  return next;
};

const validateThemeContract = (contract: ThemeContract | undefined): ValidationResult => {
  const next = normalizeThemeContract(contract);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!next.voice) errors.push("themeContract.voice missing");
  if (!next.tokens?.primary || !next.tokens?.accent) errors.push("themeContract.tokens missing");
  if (!next.layoutRules?.maxWidth || !next.layoutRules?.sectionPadding) {
    warnings.push("themeContract.layoutRules incomplete");
  }
  if (!next.motionRules?.durationBase) warnings.push("themeContract.motionRules missing duration");
  return { passed: errors.length === 0, errors, warnings };
};

const pickLayoutPattern = (sectionType?: string, layoutHint?: Record<string, unknown>): LayoutPattern => {
  const type = (sectionType ?? "").toLowerCase();
  const structure = String(layoutHint?.structure ?? "");
  if (type.includes("hero")) {
    return structure === "dual" || structure === "split" ? LAYOUT_PATTERNS.heroSplit : LAYOUT_PATTERNS.heroCentered;
  }
  if (type.includes("cards") || type.includes("features") || type.includes("testimonials")) {
    return LAYOUT_PATTERNS.cardsGrid3;
  }
  if (structure === "single") return LAYOUT_PATTERNS.contentSingle;
  if (structure === "dual") return LAYOUT_PATTERNS.contentTwoCol;
  return LAYOUT_PATTERNS.contentSingle;
};

const buildVariantRules = (blockType?: string) => {
  const type = (blockType ?? "").toLowerCase();
  if (type.includes("cardsgrid")) return { variants: ["2col", "3col", "4col"], maxItems: 8 };
  if (type.includes("featuregrid")) return { variants: ["2col", "3col", "4col"], maxItems: 6 };
  if (type.includes("testimonialsgrid")) return { variants: ["2col", "3col"], maxItems: 6 };
  if (type.includes("pricingcards")) return { variants: ["2up", "3up", "withToggle"], maxItems: 3 };
  if (type.includes("faq")) return { variants: ["singleOpen", "multiOpen"], maxItems: 8 };
  return { variants: ["default"], maxItems: 6 };
};

const buildCreativeGuidance = (section: { id?: string; type?: string } | undefined): CreativeGuidance => {
  const importance = resolveSectionImportance(section?.id);
  const visualPriority = importance === "high" ? "highlight" : importance === "low" ? "supporting" : "balanced";
  const effects =
    importance === "high"
      ? STUNNING_EFFECTS.slice(0, 4)
      : importance === "low"
        ? STUNNING_EFFECTS.slice(0, 2)
        : STUNNING_EFFECTS.slice(0, 3);
  const animationHints =
    importance === "high" ? ["stagger-entrance", "parallax", "hover-lift"] : ["fade-in", "hover-lift"];
  const freedom = CREATIVE_FREEDOM_MAP[section?.type ?? ""] ?? {
    score: 45,
    allowed: { icons: ["lucide"], animations: ["fade-in"], microInteractions: ["hover-lift"] },
    forbidden: { colors: true, fonts: true, spacing: true, layout: false },
  };
  return { stunningEffects: effects, animationHints, visualPriority, freedom };
};

const collectSpacingViolations = (props: Record<string, unknown>) => {
  const issues: string[] = [];
  Object.entries(props).forEach(([key, value]) => {
    if (!/(padding|margin|gap)/i.test(key)) return;
    const num =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value.match(/([\d.]+)/)?.[1])
          : NaN;
    if (!Number.isFinite(num)) return;
    if (num % 4 !== 0) issues.push(`spacing:${key}:${num}`);
  });
  return issues;
};

const collectColorViolations = (props: Record<string, unknown>) => {
  const issues: string[] = [];
  Object.entries(props).forEach(([key, value]) => {
    if (!/(color|background|border)/i.test(key)) return;
    if (typeof value === "string" && /^#|^rgb|^hsl/i.test(value)) {
      issues.push(`color:${key}:${value}`);
    }
  });
  return issues;
};

const collectLayoutViolations = (props: Record<string, unknown>) => {
  const issues: string[] = [];
  const align = props.align;
  if (align && align !== "left" && align !== "center") {
    issues.push(`align:${String(align)}`);
  }
  const maxWidth = props.maxWidth;
  if (maxWidth && !["lg", "xl", "2xl"].includes(String(maxWidth))) {
    issues.push(`maxWidth:${String(maxWidth)}`);
  }
  return issues;
};

const evaluateStunningScore = (sections: Array<{ type?: string; props?: Record<string, unknown> }>) => {
  let animation = 0;
  let texture = 0;
  let interaction = 0;
  let whitespace = 0;
  const total = Math.max(1, sections.length);
  sections.forEach((section) => {
    const props = section.props ?? {};
    if (props.motionPreset || props.motion) animation += 1;
    if (props.background === "gradient" || props.background === "muted") texture += 1;
    if (props.emphasis === "high") interaction += 1;
    if (props.paddingY === "lg") whitespace += 1;
  });
  const animationScore = Math.round((animation / total) * 100);
  const textureScore = Math.round((texture / total) * 100);
  const interactionScore = Math.round((interaction / total) * 100);
  const whitespaceScore = Math.round((whitespace / total) * 100);
  const totalScore = Math.round(
    animationScore * 0.25 + textureScore * 0.2 + interactionScore * 0.2 + whitespaceScore * 0.2
  );
  return {
    total: Math.min(100, totalScore),
    breakdown: {
      animation: animationScore,
      texture: textureScore,
      interaction: interactionScore,
      whitespace: whitespaceScore,
    },
  };
};

export class ConsistencyGuardian {
  preGenerateValidation(themeContract: ThemeContract | undefined): ValidationResult {
    return validateThemeContract(themeContract);
  }

  postGenerateCheck(pages: Array<{ name: string; data: { content?: Array<{ type?: string; props?: Record<string, unknown> }> } }>): ConsistencyReport {
    const issues: string[] = [];
    const sections = pages.flatMap((page) => page.data.content ?? []);
    sections.forEach((section) => {
      if (!section?.props) return;
      issues.push(...collectSpacingViolations(section.props));
      issues.push(...collectColorViolations(section.props));
      issues.push(...collectLayoutViolations(section.props));
    });
    const score = evaluateStunningScore(sections);
    const suggestions: string[] = [];
    if (score.breakdown.animation < 50) suggestions.push("Add stagger/reveal motion presets");
    if (score.breakdown.whitespace < 50) suggestions.push("Increase section padding to lg");
    return {
      timestamp: new Date().toISOString(),
      score: score.total,
      checks: score,
      issues,
      suggestions,
    };
  }

  buildConstraints(
    section: { type?: string; layoutHint?: Record<string, unknown> } | undefined,
    themeContract?: ThemeContract
  ) {
    const layoutPattern = pickLayoutPattern(section?.type, section?.layoutHint);
    const variantRules = buildVariantRules(section?.type);
    const normalizedContract = normalizeThemeContract(themeContract);
    return {
      tokens: normalizedContract.tokens,
      layoutRules: normalizedContract.layoutRules,
      componentVariants: variantRules,
      layoutPattern,
      maxItems: { default: variantRules.maxItems },
    };
  }

  buildCreativeGuidance(section: { id?: string; type?: string } | undefined): CreativeGuidance {
    return buildCreativeGuidance(section);
  }

  normalizeThemeContract(contract: ThemeContract | undefined) {
    return normalizeThemeContract(contract);
  }
}
