import { inferEnterprisePageTypeFromPath } from "@/lib/agent/page-classifier";
import { resolveOutputLanguage } from "@/lib/agent/language";
import {
  PAGE_TYPE_SKILL_DIRECTIVES,
  PAGE_TYPE_SKILL_POLICIES,
} from "@/lib/agent/page-type-skills/definitions";

export type PageTypeSkillDirective = {
  pageType: string;
  skillName: string;
  guidance: string;
};

export type PageTypeSkillPolicy = {
  pageType: string;
  navVariant?: "simple" | "withDropdown" | "withCTA";
  heroRhythm?: "slow" | "medium" | "fast";
  heroMotion?: "fadeUp" | "fadeIn" | "stagger";
  forceLeadCaptureSafe?: boolean;
  productGridColumns?: "2col" | "3col" | "4col";
};

const zh = (en: string, cn: string, language: "zh-CN" | "en-US") => (language === "zh-CN" ? cn : en);
const parseEnvBoolean = (value: string | undefined, fallback: boolean) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};
const resolvePageTypeSkillsEnabled = (override?: boolean) =>
  typeof override === "boolean"
    ? override
    : parseEnvBoolean(process.env.BUILDER_PAGE_TYPE_SKILLS_ENABLED, true);

export const buildPageTypeSkillDirective = (input: {
  pagePath: string;
  pageName?: string;
  prompt?: string;
  pageTypeSkillsEnabled?: boolean;
}): PageTypeSkillDirective => {
  const pageType = inferEnterprisePageTypeFromPath(input.pagePath || "/");
  const language = resolveOutputLanguage(String(input.prompt || ""));
  if (!resolvePageTypeSkillsEnabled(input.pageTypeSkillsEnabled)) {
    const fallback = PAGE_TYPE_SKILL_DIRECTIVES.generic;
    return {
      pageType,
      skillName: fallback.skillName,
      guidance: zh(fallback.guidance.en, fallback.guidance.zh, language),
    };
  }
  const entry = PAGE_TYPE_SKILL_DIRECTIVES[pageType] || PAGE_TYPE_SKILL_DIRECTIVES.generic;
  return {
    pageType,
    skillName: entry.skillName,
    guidance: zh(entry.guidance.en, entry.guidance.zh, language),
  };
};

const clonePage = <T extends Record<string, unknown>>(page: T): T =>
  JSON.parse(JSON.stringify(page)) as T;

const toContentList = (page: Record<string, unknown>) => {
  const data = page?.data && typeof page.data === "object" ? (page.data as Record<string, unknown>) : null;
  const content = data && Array.isArray(data.content) ? (data.content as Array<Record<string, unknown>>) : [];
  return content;
};

const inferPolicyBlockRole = (block: Record<string, unknown>) => {
  const type = String(block?.type || "").toLowerCase();
  const props = block?.props && typeof block.props === "object" ? (block.props as Record<string, unknown>) : {};
  const token = `${type} ${String(props.id || "").toLowerCase()} ${String(props.anchor || "").toLowerCase()}`.trim();
  if (!token) return "other";
  if (/navbar|navigation|header|topnav|menu/.test(token)) return "navigation";
  if (/hero|masthead|banner|intro/.test(token)) return "hero";
  if (/footer|copyright|legal/.test(token)) return "footer";
  if (/approach|feature|process|workflow|capability|faq/.test(token)) return "approach";
  if (/product|catalog|showcase|pricing/.test(token)) return "products";
  if (/social|proof|testimonial|logo|certification|case|project|application/.test(token)) return "socialproof";
  if (/story|content|timeline|about|team|news|blog|resource/.test(token)) return "story";
  if (/contact|lead|form|quote/.test(token)) return "contact";
  if (/cta|calltoaction|call-to-action/.test(token)) return "cta";
  return "other";
};

const resolveRolePriorityByPageType = (pageType: string): Record<string, number> => {
  switch (pageType) {
    case "products":
      return {
        products: 1,
        approach: 2,
        socialproof: 3,
        story: 4,
        contact: 5,
        cta: 6,
        other: 7,
      };
    case "solutions":
      return {
        approach: 1,
        story: 2,
        socialproof: 3,
        products: 4,
        contact: 5,
        cta: 6,
        other: 7,
      };
    case "cases":
      return {
        socialproof: 1,
        story: 2,
        approach: 3,
        products: 4,
        contact: 5,
        cta: 6,
        other: 7,
      };
    case "about":
      return {
        story: 1,
        socialproof: 2,
        approach: 3,
        products: 4,
        contact: 5,
        cta: 6,
        other: 7,
      };
    case "contact":
      return {
        contact: 1,
        cta: 2,
        story: 3,
        socialproof: 4,
        approach: 5,
        products: 6,
        other: 7,
      };
    case "home":
      return {
        story: 1,
        products: 2,
        socialproof: 3,
        approach: 4,
        cta: 5,
        contact: 6,
        other: 7,
      };
    default:
      return {
        story: 1,
        approach: 2,
        products: 3,
        socialproof: 4,
        contact: 5,
        cta: 6,
        other: 7,
      };
  }
};

const resolvePageTypeSkillPolicy = (input: {
  pagePath: string;
  prompt?: string;
}): PageTypeSkillPolicy => {
  const pageType = inferEnterprisePageTypeFromPath(input.pagePath || "/");
  const policy = PAGE_TYPE_SKILL_POLICIES[pageType] || PAGE_TYPE_SKILL_POLICIES.generic;
  return {
    pageType,
    ...policy,
  };
};

export const applyPageTypeSkillPolicyToPage = (input: {
  pagePath: string;
  prompt?: string;
  page: Record<string, unknown>;
  pageTypeSkillsEnabled?: boolean;
}): Record<string, unknown> => {
  if (!resolvePageTypeSkillsEnabled(input.pageTypeSkillsEnabled)) {
    return clonePage(input.page);
  }
  const language = resolveOutputLanguage(String(input.prompt || ""));
  const safeContactLabel = language === "zh-CN" ? "联系我们" : "Contact";
  const policy = resolvePageTypeSkillPolicy({ pagePath: input.pagePath, prompt: input.prompt });
  const nextPage = clonePage(input.page);
  const content = toContentList(nextPage);
  if (!Array.isArray(content) || content.length === 0) return nextPage;
  const contentWithMeta = content.map((block, index) => ({ block, index, role: inferPolicyBlockRole(block) }));
  const rolePriority = resolveRolePriorityByPageType(policy.pageType);

  contentWithMeta.forEach(({ block }) => {
    if (!block || typeof block !== "object") return;
    const type = String(block.type || "");
    const props =
      block.props && typeof block.props === "object" ? ({ ...(block.props as Record<string, unknown>) } as Record<string, unknown>) : {};
    const lowerType = type.toLowerCase();

    if (/navbar|navigation/.test(lowerType) && policy.navVariant) {
      props.variant = policy.navVariant;
    }

    if (/hero/.test(lowerType)) {
      if (policy.heroRhythm) props.rhythm = policy.heroRhythm;
      if (policy.heroMotion) props.motionPreset = policy.heroMotion;
    }

    if ((/cardsgrid|productcatalog|productshowcase/.test(lowerType) || lowerType.includes("product")) && policy.productGridColumns) {
      props.columns = policy.productGridColumns;
      if (!props.variant) props.variant = "product";
    }

    if (policy.forceLeadCaptureSafe && /leadcapture|contact/.test(lowerType)) {
      props.forbidGradientText = true;
      props.emphasis = "normal";
      if (!props.cta || typeof props.cta !== "object") {
        props.cta = { label: safeContactLabel, href: "/contact", variant: "primary" };
      } else {
        const cta = { ...(props.cta as Record<string, unknown>) };
        if (typeof cta.href !== "string" || !cta.href.trim()) cta.href = "/contact";
        if (typeof cta.label !== "string" || !cta.label.trim()) cta.label = safeContactLabel;
        if (typeof cta.variant !== "string") cta.variant = "primary";
        props.cta = cta;
      }
    }

    block.props = props;
  });

  const navigationBlocks = contentWithMeta.filter((entry) => entry.role === "navigation").map((entry) => entry.block);
  const heroBlocks = contentWithMeta.filter((entry) => entry.role === "hero").map((entry) => entry.block);
  const footerBlocks = contentWithMeta.filter((entry) => entry.role === "footer").map((entry) => entry.block);
  const middleBlocks = contentWithMeta
    .filter((entry) => !["navigation", "hero", "footer"].includes(entry.role))
    .sort((left, right) => {
      const leftWeight = rolePriority[left.role] ?? rolePriority.other ?? 99;
      const rightWeight = rolePriority[right.role] ?? rolePriority.other ?? 99;
      if (leftWeight !== rightWeight) return leftWeight - rightWeight;
      return left.index - right.index;
    })
    .map((entry) => entry.block);
  const reordered = [...navigationBlocks, ...heroBlocks, ...middleBlocks, ...footerBlocks];
  const data = nextPage?.data && typeof nextPage.data === "object" ? (nextPage.data as Record<string, unknown>) : null;
  if (data) {
    data.content = reordered;
    nextPage.data = data;
  }

  return nextPage;
};
