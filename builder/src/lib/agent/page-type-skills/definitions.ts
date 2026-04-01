export type SkillDirectiveEntry = {
  skillName: string;
  guidance: {
    en: string;
    zh: string;
  };
};

export const PAGE_TYPE_SKILL_DIRECTIVES: Record<string, SkillDirectiveEntry> = {
  home: {
    skillName: "home-page-skill",
    guidance: {
      en: "Build a high-impact home page from evidence first: summarize fact-pack into company proof points, then compose hero + capabilities + proof + CTA with non-repetitive copy and one media-forward section.",
      zh: "首页先做事实提炼：先把事实包整理为公司背书要点，再生成 Hero + 能力 + 证据 + CTA；文案禁止同构复用，且必须包含至少一个媒体驱动区块。",
    },
  },
  products: {
    skillName: "product-page-skill",
    guidance: {
      en: "Prioritize selection-readiness: group products by category, render dense specs (model/parameters/scenario), keep comparison-friendly layout, and give inquiry CTA for every product item.",
      zh: "产品页以“可选型”为第一目标：按类别分组，密集呈现型号/参数/场景，支持对比阅读，并为每个产品条目提供询价 CTA。",
    },
  },
  solutions: {
    skillName: "solution-page-skill",
    guidance: {
      en: "Frame solutions as problem -> method -> measurable outcome, include at least three approach points, and map each point to delivery evidence instead of generic claims.",
      zh: "解决方案页按“问题-方法-结果”线性组织，至少给出 3 个方法要点，并把每个要点映射到交付证据，禁止泛化空话。",
    },
  },
  cases: {
    skillName: "case-page-skill",
    guidance: {
      en: "Case page must be evidence-led: each case includes customer context, challenge, solution process, and quantified outcome with clear information hierarchy.",
      zh: "案例页必须证据驱动：每个案例包含客户背景、挑战、方案过程与量化结果，并保持清晰的信息层级。",
    },
  },
  about: {
    skillName: "about-page-skill",
    guidance: {
      en: "Build trust with concrete assets: timeline, certifications, team capability, service footprint, and avoid generic self-introduction wording.",
      zh: "关于页用可验证资产建立信任：历程、资质、团队能力、服务覆盖，避免泛化自我介绍文案。",
    },
  },
  contact: {
    skillName: "contact-page-skill",
    guidance: {
      en: "Contact page is conversion-critical: enforce short actionable form, clear channels, response-time promise, and no gradient text in lead-capture area.",
      zh: "联系页是转化核心：强制使用可提交的简洁表单、清晰渠道、响应承诺，线索区禁止渐变文字。",
    },
  },
  support: {
    skillName: "support-page-skill",
    guidance: {
      en: "Support page should be task-oriented: FAQ clusters, service policy, and direct escalation channel.",
      zh: "支持页应任务导向：FAQ 分组、服务政策、快速升级通道。",
    },
  },
  legal: {
    skillName: "legal-page-skill",
    guidance: {
      en: "Legal page should be plain and compliant: clear hierarchy, policy clauses, effective date, and contact for legal requests.",
      zh: "法务页面应简洁合规：结构清晰、条款完整、注明生效日期和法务联系方式。",
    },
  },
  generic: {
    skillName: "generic-page-skill",
    guidance: {
      en: "Generate this page with clear hierarchy and non-repetitive content relative to other pages.",
      zh: "生成该页面时需保持层级清晰，并与其他页面内容去重，避免同构。",
    },
  },
};

export const PAGE_TYPE_SKILL_POLICIES: Record<
  string,
  {
    navVariant?: "simple" | "withDropdown" | "withCTA";
    heroRhythm?: "slow" | "medium" | "fast";
    heroMotion?: "fadeUp" | "fadeIn" | "stagger";
    forceLeadCaptureSafe?: boolean;
    productGridColumns?: "2col" | "3col" | "4col";
  }
> = {
  home: { navVariant: "withCTA", heroRhythm: "slow", heroMotion: "stagger" },
  products: { navVariant: "withDropdown", productGridColumns: "3col", heroRhythm: "medium", heroMotion: "fadeUp" },
  solutions: { navVariant: "withDropdown", heroRhythm: "medium", heroMotion: "fadeIn" },
  cases: { navVariant: "withDropdown", heroRhythm: "medium", heroMotion: "stagger" },
  about: { navVariant: "simple", heroRhythm: "slow", heroMotion: "fadeIn" },
  contact: { navVariant: "withCTA", forceLeadCaptureSafe: true, heroRhythm: "fast", heroMotion: "fadeUp" },
  support: { navVariant: "simple", heroRhythm: "medium", heroMotion: "fadeIn" },
  legal: { navVariant: "simple", heroRhythm: "slow", heroMotion: "fadeIn" },
  generic: { navVariant: "simple", heroRhythm: "medium", heroMotion: "fadeUp" },
};
