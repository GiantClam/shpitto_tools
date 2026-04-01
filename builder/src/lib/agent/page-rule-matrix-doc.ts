import { promises as fs } from "fs";
import path from "path";

import {
  ENTERPRISE_PAGE_TYPES,
  PAGE_HARDNESS_RULES_BY_TYPE,
  SECTION_PRIORITY_BY_PAGE_TYPE,
  STRATEGY_INTERIOR_PAGE_TYPES,
  STRATEGY_SUGGESTION_RULES,
} from "@/lib/agent/page-rule-matrix";

type RuleMatrixPayload = {
  generatedAt: string;
  pageTypes: Array<{
    pageType: string;
    sectionPriority: string[];
    nav: {
      variant: string;
      maxWidth: string;
      paddingY: string;
    };
    hero: {
      compositionPreset: string;
      structure: string;
      density: string;
      align: string;
      media: string;
      list: string;
      motionPreset: string;
      rhythm: string;
    };
    content: {
      preferredStructure: string;
      preferredList: string;
    };
    sectionRepeatBudget: Record<string, number>;
  }>;
  strategy: {
    interiorPageTypes: string[];
    suggestionRules: Array<{
      suggest: string;
      allowedCurrent: string[];
      minStructuredSignals?: number;
      maxStructuredSignals?: number;
      minHighConfidenceCount?: number;
      requireInteriorPageType?: boolean;
    }>;
  };
};

const normalizeBudget = (value: unknown) => {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, number>>((acc, [key, item]) => {
    if (!Number.isFinite(Number(item))) return acc;
    acc[key] = Number(item);
    return acc;
  }, {});
};

export const buildPageRuleMatrixPayload = (): RuleMatrixPayload => {
  const pageTypes = ENTERPRISE_PAGE_TYPES.map((pageType) => {
    const rule = PAGE_HARDNESS_RULES_BY_TYPE[pageType] || PAGE_HARDNESS_RULES_BY_TYPE.generic;
    return {
      pageType,
      sectionPriority: SECTION_PRIORITY_BY_PAGE_TYPE[pageType] || SECTION_PRIORITY_BY_PAGE_TYPE.generic || [],
      nav: {
        variant: rule.nav.variant,
        maxWidth: rule.nav.maxWidth,
        paddingY: rule.nav.paddingY,
      },
      hero: {
        compositionPreset: rule.hero.compositionPreset,
        structure: rule.hero.structure,
        density: rule.hero.density,
        align: rule.hero.align,
        media: rule.hero.media,
        list: rule.hero.list,
        motionPreset: rule.hero.motionPreset,
        rhythm: rule.hero.rhythm,
      },
      content: {
        preferredStructure: rule.content.preferredStructure,
        preferredList: rule.content.preferredList,
      },
      sectionRepeatBudget: normalizeBudget(rule.sectionRepeatBudget),
    };
  });
  return {
    generatedAt: new Date().toISOString(),
    pageTypes,
    strategy: {
      interiorPageTypes: STRATEGY_INTERIOR_PAGE_TYPES,
      suggestionRules: STRATEGY_SUGGESTION_RULES.map((rule) => ({
        suggest: rule.suggest,
        allowedCurrent: rule.allowedCurrent,
        minStructuredSignals: rule.minStructuredSignals,
        maxStructuredSignals: rule.maxStructuredSignals,
        minHighConfidenceCount: rule.minHighConfidenceCount,
        requireInteriorPageType: rule.requireInteriorPageType,
      })),
    },
  };
};

const toCell = (value: string) => value.replace(/\|/g, "\\|");

export const buildPageRuleMatrixMarkdown = () => {
  const payload = buildPageRuleMatrixPayload();
  const lines: string[] = [];
  lines.push("# 页面类型-规则矩阵（自动导出）");
  lines.push("");
  lines.push(`- generatedAt: ${payload.generatedAt}`);
  lines.push(`- source: builder/src/lib/agent/page-rule-matrix.ts`);
  lines.push("");
  lines.push("## 页面规则");
  lines.push("");
  lines.push(
    "| pageType | sectionPriority | nav | hero | content | sectionRepeatBudget |"
  );
  lines.push("| --- | --- | --- | --- | --- | --- |");
  payload.pageTypes.forEach((item) => {
    const nav = `variant=${item.nav.variant}, maxWidth=${item.nav.maxWidth}, paddingY=${item.nav.paddingY}`;
    const hero = [
      `preset=${item.hero.compositionPreset}`,
      `structure=${item.hero.structure}`,
      `density=${item.hero.density}`,
      `align=${item.hero.align}`,
      `media=${item.hero.media}`,
      `list=${item.hero.list}`,
      `motion=${item.hero.motionPreset}`,
      `rhythm=${item.hero.rhythm}`,
    ].join(", ");
    const content = `structure=${item.content.preferredStructure}, list=${item.content.preferredList}`;
    const budget = Object.entries(item.sectionRepeatBudget)
      .map(([key, value]) => `${key}:${value}`)
      .join(", ");
    lines.push(
      `| ${toCell(item.pageType)} | ${toCell(item.sectionPriority.join(" > "))} | ${toCell(nav)} | ${toCell(hero)} | ${toCell(content)} | ${toCell(
        budget || "-"
      )} |`
    );
  });
  lines.push("");
  lines.push("## 策略建议规则");
  lines.push("");
  lines.push("| suggest | allowedCurrent | constraints |");
  lines.push("| --- | --- | --- |");
  payload.strategy.suggestionRules.forEach((rule) => {
    const constraints = [
      typeof rule.minStructuredSignals === "number" ? `minStructuredSignals=${rule.minStructuredSignals}` : "",
      typeof rule.maxStructuredSignals === "number" ? `maxStructuredSignals=${rule.maxStructuredSignals}` : "",
      typeof rule.minHighConfidenceCount === "number" ? `minHighConfidenceCount=${rule.minHighConfidenceCount}` : "",
      rule.requireInteriorPageType ? "requireInteriorPageType=true" : "",
    ]
      .filter(Boolean)
      .join(", ");
    lines.push(
      `| ${toCell(rule.suggest)} | ${toCell(rule.allowedCurrent.join(", "))} | ${toCell(constraints || "-")} |`
    );
  });
  lines.push("");
  lines.push(`- interiorPageTypes: ${payload.strategy.interiorPageTypes.join(", ")}`);
  lines.push("");
  return lines.join("\n");
};

export const syncPageRuleMatrixDocFile = async (
  filePath: string
): Promise<{ updated: boolean; path: string }> => {
  const next = buildPageRuleMatrixMarkdown().trimEnd() + "\n";
  let prev = "";
  try {
    prev = await fs.readFile(filePath, "utf8");
  } catch {
    prev = "";
  }
  if (prev === next) {
    return { updated: false, path: filePath };
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, next, "utf8");
  return { updated: true, path: filePath };
};
