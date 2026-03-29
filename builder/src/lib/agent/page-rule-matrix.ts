import type { EnterprisePageType } from "@/lib/agent/page-classifier";

export type SectionKind =
  | "navigation"
  | "hero"
  | "story"
  | "approach"
  | "products"
  | "socialproof"
  | "contact"
  | "cta"
  | "footer"
  | "other";

type PageScoringRule = {
  pageType: EnterprisePageType;
  weight: number;
  signal: string;
  pattern: RegExp;
};

type LabelPathRule = {
  path: string;
  pattern: RegExp;
};

type SectionKindRule = {
  kind: SectionKind;
  pattern: RegExp;
};

export type StrategySuggestionRule = {
  suggest: "llm_first" | "hybrid" | "template_first";
  allowedCurrent: Array<"llm_first" | "hybrid" | "template_first">;
  minStructuredSignals?: number;
  maxStructuredSignals?: number;
  minHighConfidenceCount?: number;
  requireInteriorPageType?: boolean;
};

export type PageHardnessRule = {
  nav: {
    variant: "simple" | "withDropdown" | "withCTA";
    maxWidth: "lg" | "xl" | "2xl";
    paddingY: "sm" | "md" | "lg";
  };
  hero: {
    compositionPreset: "H01" | "H02" | "H03";
    structure: "single" | "dual" | "triple" | "split";
    density: "compact" | "normal" | "spacious";
    align: "start" | "center";
    media: "none" | "image-left" | "image-right" | "background";
    list: "cards" | "tiles" | "rows";
    motionPreset: "fadeUp" | "fadeIn" | "stagger";
    rhythm: "slow" | "medium" | "fast";
  };
  content: {
    preferredStructure: "single" | "dual" | "triple" | "split";
    preferredList: "cards" | "tiles" | "rows";
  };
  sectionRepeatBudget?: Partial<Record<SectionKind, number>>;
};

export const ENTERPRISE_PAGE_TYPES: EnterprisePageType[] = [
  "home",
  "products",
  "solutions",
  "cases",
  "about",
  "contact",
  "pricing",
  "support",
  "blog",
  "legal",
  "generic",
];

export const PAGE_PATH_SCORING_RULES: PageScoringRule[] = [
  { pageType: "home", weight: 1.5, signal: "path:home", pattern: /^\/(?:|home|index)$/ },
  {
    pageType: "products",
    weight: 1.5,
    signal: "path:products",
    pattern: /\/(?:3c-machines|products?|catalog|machines?|equipment|models?|lineup)(?:\/|$)/,
  },
  {
    pageType: "solutions",
    weight: 1.5,
    signal: "path:solutions",
    pattern: /\/(?:custom-solutions|solutions?|services?|capabilities)(?:\/|$)/,
  },
  { pageType: "cases", weight: 1.5, signal: "path:cases", pattern: /\/(?:cases?|case-studies|applications?)(?:\/|$)/ },
  { pageType: "about", weight: 1.5, signal: "path:about", pattern: /\/(?:about|company|team|story|mission)(?:\/|$)/ },
  { pageType: "contact", weight: 1.5, signal: "path:contact", pattern: /\/(?:contact|quote|consult|get-in-touch)(?:\/|$)/ },
  { pageType: "pricing", weight: 1.5, signal: "path:pricing", pattern: /\/(?:pricing|plans?|quote)(?:\/|$)/ },
  { pageType: "support", weight: 1.5, signal: "path:support", pattern: /\/(?:support|help|faq|docs|documentation)(?:\/|$)/ },
  { pageType: "blog", weight: 1.5, signal: "path:blog", pattern: /\/(?:blog|news|insights?|articles?)(?:\/|$)/ },
  { pageType: "legal", weight: 1.5, signal: "path:legal", pattern: /\/(?:privacy|terms?|policy|legal)(?:\/|$)/ },
];

export const PAGE_TOKEN_SCORING_RULES: PageScoringRule[] = [
  {
    pageType: "products",
    weight: 0.7,
    signal: "token:products",
    pattern: /(products?|catalog|machine|machines|cnc|equipment|机床|设备|产品)/,
  },
  {
    pageType: "solutions",
    weight: 0.7,
    signal: "token:solutions",
    pattern: /(solutions?|solution|workflow|integration|解决方案|方案)/,
  },
  {
    pageType: "cases",
    weight: 0.7,
    signal: "token:cases",
    pattern: /(cases?|applications?|portfolio|客户案例|案例)/,
  },
  {
    pageType: "about",
    weight: 0.7,
    signal: "token:about",
    pattern: /(about|company|history|team|关于|公司|团队)/,
  },
  {
    pageType: "contact",
    weight: 0.7,
    signal: "token:contact",
    pattern: /(contact|quote|whatsapp|get in touch|联系|询价)/,
  },
  {
    pageType: "pricing",
    weight: 0.7,
    signal: "token:pricing",
    pattern: /(pricing|plan|price|定价|价格)/,
  },
  {
    pageType: "support",
    weight: 0.7,
    signal: "token:support",
    pattern: /(support|faq|help|documentation|支持|帮助)/,
  },
  {
    pageType: "blog",
    weight: 0.7,
    signal: "token:blog",
    pattern: /(blog|news|insight|article|博客|新闻|资讯)/,
  },
  {
    pageType: "legal",
    weight: 0.7,
    signal: "token:legal",
    pattern: /(privacy|terms?|policy|legal|隐私|条款)/,
  },
];

export const LABEL_HOME_PATTERN = /^(home|homepage|home page|首页|主页|首屏)$/;

export const LABEL_PATH_RULES: LabelPathRule[] = [
  {
    path: "/products",
    pattern: /(core[-\s]?product|flagship|featured[-\s]?product|核心产品|旗舰产品|明星产品|3c|machine|machines|machining|cnc|catalog|products?|product center|产品中心|产品展示|机床|设备|机型)/,
  },
  { path: "/solutions", pattern: /(custom[-\s]?solutions?|solutions?|解决方案|应用方案|方案中心)/ },
  { path: "/cases", pattern: /(case studies|case study|cases|applications|application cases|案例|应用案例|客户案例)/ },
  { path: "/about", pattern: /(about|about us|company|our story|关于|关于我们|公司简介|公司概况)/ },
  { path: "/contact", pattern: /(contact|contact us|get in touch|quote|询价|联系|联系我们)/ },
  { path: "/pricing", pattern: /(pricing|plans?|tiers?|报价|价格|套餐|定价)/ },
  { path: "/support", pattern: /(support|help|faq|docs|documentation|服务支持|技术支持|售后支持|支持|帮助|文档|常见问题)/ },
  { path: "/blog", pattern: /(blog|news|journal|insights?|articles?|博客|新闻|洞察|资讯)/ },
  { path: "/privacy", pattern: /(privacy|privacy policy|policy|隐私|隐私政策)/ },
  { path: "/terms", pattern: /(terms?|legal|tos|服务条款|使用条款|法律)/ },
];

export const SECTION_KIND_RULES: SectionKindRule[] = [
  { kind: "navigation", pattern: /navigation|navbar|header|topnav|menu/ },
  { kind: "hero", pattern: /hero|masthead|banner|intro|pagehero/ },
  { kind: "story", pattern: /story|narrative|mission|vision|about|editorial|philosophy/ },
  { kind: "approach", pattern: /approach|feature|capability|process|workflow|metric|technology|benefit/ },
  { kind: "products", pattern: /product|catalog|collection|showcase|pricing|plan|gallery|module/ },
  { kind: "socialproof", pattern: /social|proof|testimonial|review|trust|logo|partner/ },
  { kind: "contact", pattern: /contact|lead|inquiry|form|quote/ },
  { kind: "cta", pattern: /cta|call.?to.?action|start|trial|getstarted|footercta/ },
  { kind: "footer", pattern: /footer|legal|copyright|bottom/ },
];

export const SECTION_PRIORITY_BY_PAGE_TYPE: Record<EnterprisePageType, SectionKind[]> = {
  home: ["navigation", "hero", "story", "approach", "products", "socialproof", "cta", "footer"],
  products: ["navigation", "hero", "products", "approach", "socialproof", "contact", "cta", "footer"],
  solutions: ["navigation", "hero", "approach", "products", "story", "socialproof", "contact", "cta", "footer"],
  cases: ["navigation", "hero", "socialproof", "products", "story", "contact", "cta", "footer"],
  about: ["navigation", "hero", "story", "approach", "socialproof", "contact", "cta", "footer"],
  contact: ["navigation", "hero", "contact", "socialproof", "story", "cta", "footer"],
  pricing: ["navigation", "hero", "products", "socialproof", "contact", "cta", "footer"],
  support: ["navigation", "hero", "story", "approach", "contact", "cta", "footer"],
  blog: ["navigation", "hero", "story", "products", "socialproof", "cta", "footer"],
  legal: ["navigation", "story", "footer"],
  generic: ["navigation", "hero", "story", "approach", "products", "socialproof", "contact", "cta", "footer"],
};

export const PAGE_HARDNESS_RULES_BY_TYPE: Record<EnterprisePageType, PageHardnessRule> = {
  home: {
    nav: { variant: "withCTA", maxWidth: "xl", paddingY: "sm" },
    hero: {
      compositionPreset: "H01",
      structure: "split",
      density: "spacious",
      align: "start",
      media: "image-right",
      list: "cards",
      motionPreset: "stagger",
      rhythm: "slow",
    },
    content: { preferredStructure: "triple", preferredList: "cards" },
    sectionRepeatBudget: { navigation: 1, hero: 1, products: 1, approach: 1, socialproof: 1, footer: 1 },
  },
  products: {
    nav: { variant: "withDropdown", maxWidth: "2xl", paddingY: "sm" },
    hero: {
      compositionPreset: "H02",
      structure: "dual",
      density: "normal",
      align: "start",
      media: "image-left",
      list: "rows",
      motionPreset: "fadeUp",
      rhythm: "medium",
    },
    content: { preferredStructure: "dual", preferredList: "rows" },
    sectionRepeatBudget: { navigation: 1, hero: 1, products: 1, approach: 1, socialproof: 1, contact: 1, footer: 1 },
  },
  solutions: {
    nav: { variant: "withCTA", maxWidth: "2xl", paddingY: "md" },
    hero: {
      compositionPreset: "H03",
      structure: "split",
      density: "normal",
      align: "start",
      media: "image-right",
      list: "rows",
      motionPreset: "fadeUp",
      rhythm: "fast",
    },
    content: { preferredStructure: "split", preferredList: "rows" },
    sectionRepeatBudget: { navigation: 1, hero: 1, approach: 1, products: 1, story: 1, contact: 1, footer: 1 },
  },
  cases: {
    nav: { variant: "simple", maxWidth: "lg", paddingY: "md" },
    hero: {
      compositionPreset: "H02",
      structure: "dual",
      density: "normal",
      align: "start",
      media: "image-left",
      list: "tiles",
      motionPreset: "fadeIn",
      rhythm: "fast",
    },
    content: { preferredStructure: "dual", preferredList: "tiles" },
    sectionRepeatBudget: { navigation: 1, hero: 1, products: 1, socialproof: 1, story: 1, footer: 1 },
  },
  about: {
    nav: { variant: "simple", maxWidth: "xl", paddingY: "sm" },
    hero: {
      compositionPreset: "H03",
      structure: "single",
      density: "spacious",
      align: "center",
      media: "background",
      list: "cards",
      motionPreset: "fadeIn",
      rhythm: "slow",
    },
    content: { preferredStructure: "dual", preferredList: "cards" },
    sectionRepeatBudget: { navigation: 1, hero: 1, story: 1, approach: 1, socialproof: 1, footer: 1 },
  },
  contact: {
    nav: { variant: "withCTA", maxWidth: "lg", paddingY: "md" },
    hero: {
      compositionPreset: "H03",
      structure: "single",
      density: "compact",
      align: "start",
      media: "background",
      list: "rows",
      motionPreset: "fadeUp",
      rhythm: "fast",
    },
    content: { preferredStructure: "single", preferredList: "rows" },
    sectionRepeatBudget: { navigation: 1, hero: 1, contact: 1, cta: 1, footer: 1 },
  },
  pricing: {
    nav: { variant: "withCTA", maxWidth: "xl", paddingY: "sm" },
    hero: {
      compositionPreset: "H02",
      structure: "dual",
      density: "normal",
      align: "start",
      media: "image-right",
      list: "cards",
      motionPreset: "fadeUp",
      rhythm: "medium",
    },
    content: { preferredStructure: "triple", preferredList: "cards" },
    sectionRepeatBudget: { navigation: 1, hero: 1, products: 1, socialproof: 1, contact: 1, footer: 1 },
  },
  support: {
    nav: { variant: "simple", maxWidth: "xl", paddingY: "sm" },
    hero: {
      compositionPreset: "H03",
      structure: "single",
      density: "normal",
      align: "start",
      media: "background",
      list: "rows",
      motionPreset: "fadeIn",
      rhythm: "medium",
    },
    content: { preferredStructure: "single", preferredList: "rows" },
    sectionRepeatBudget: { navigation: 1, hero: 1, story: 1, approach: 1, contact: 1, footer: 1 },
  },
  blog: {
    nav: { variant: "simple", maxWidth: "xl", paddingY: "sm" },
    hero: {
      compositionPreset: "H03",
      structure: "single",
      density: "normal",
      align: "start",
      media: "background",
      list: "tiles",
      motionPreset: "fadeIn",
      rhythm: "medium",
    },
    content: { preferredStructure: "triple", preferredList: "tiles" },
    sectionRepeatBudget: { navigation: 1, hero: 1, story: 1, products: 1, socialproof: 1, footer: 1 },
  },
  legal: {
    nav: { variant: "simple", maxWidth: "lg", paddingY: "sm" },
    hero: {
      compositionPreset: "H03",
      structure: "single",
      density: "compact",
      align: "start",
      media: "none",
      list: "rows",
      motionPreset: "fadeIn",
      rhythm: "slow",
    },
    content: { preferredStructure: "single", preferredList: "rows" },
    sectionRepeatBudget: { navigation: 1, story: 1, footer: 1 },
  },
  generic: {
    nav: { variant: "withCTA", maxWidth: "xl", paddingY: "sm" },
    hero: {
      compositionPreset: "H01",
      structure: "dual",
      density: "normal",
      align: "start",
      media: "image-right",
      list: "cards",
      motionPreset: "stagger",
      rhythm: "medium",
    },
    content: { preferredStructure: "dual", preferredList: "cards" },
    sectionRepeatBudget: { navigation: 1, hero: 1, footer: 1, other: 2 },
  },
};

export const STRUCTURED_SIGNAL_PATTERNS: RegExp[] = [
  /(?:^|\n|\r)\s*(?:nav(?:igation)?|menu)\s*[:：]/i,
  /(?:^|\n|\r)\s*(?:hero|hero section)\s*[:：]/i,
  /(?:^|\n|\r)\s*(?:product(?:\s+grid)?|features?|case(?:\s+slider)?|about|contact(?:\s*&\s*capture)?)\s*[:：]/i,
  /(?:^|\n|\r)\s*(?:fields|consent|footer)\s*[:：]/i,
  /(?:^|\n|\r)\s*(?:品牌定位|页面清单|产品清单|案例清单|联系方式(?:与线索字段)?|强烈建议|SEO资产)\s*[:：]/i,
  /(?:^|\n|\r)\s*(?:页眉|首屏|产品模块|核心优势|应用案例|联系我们|页脚|表单字段)\s*[:：]/i,
];

export const STRATEGY_SUGGESTION_RULES: StrategySuggestionRule[] = [
  {
    suggest: "template_first",
    allowedCurrent: ["hybrid", "template_first"],
    minStructuredSignals: 2,
    minHighConfidenceCount: 2,
    requireInteriorPageType: true,
  },
  {
    suggest: "hybrid",
    allowedCurrent: ["template_first"],
    maxStructuredSignals: 0,
  },
];

export const STRATEGY_INTERIOR_PAGE_TYPES: EnterprisePageType[] = ["products", "solutions", "cases", "about", "contact"];
