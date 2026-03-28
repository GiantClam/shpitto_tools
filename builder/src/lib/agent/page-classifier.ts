import {
  ENTERPRISE_PAGE_TYPES,
  LABEL_HOME_PATTERN,
  LABEL_PATH_RULES,
  PAGE_PATH_SCORING_RULES,
  PAGE_TOKEN_SCORING_RULES,
} from "@/lib/agent/page-rule-matrix";

export type EnterprisePageType =
  | "home"
  | "products"
  | "solutions"
  | "cases"
  | "about"
  | "contact"
  | "pricing"
  | "support"
  | "blog"
  | "legal"
  | "generic";

export type PageClassification = {
  pageType: EnterprisePageType;
  confidence: number;
  scores: Record<EnterprisePageType, number>;
  matchedSignals: string[];
};

type ClassificationInput = {
  path?: string;
  name?: string;
  label?: string;
};

const normalizeToken = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const normalizeSitePath = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "home" || raw === "index") return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
};

const addScore = (
  scores: Record<EnterprisePageType, number>,
  key: EnterprisePageType,
  weight: number,
  matchedSignals: string[],
  signal: string
) => {
  scores[key] += weight;
  matchedSignals.push(signal);
};

export const classifyEnterprisePageType = (input: ClassificationInput): PageClassification => {
  const path = normalizeToken(normalizeSitePath(input.path));
  const name = normalizeToken(input.name);
  const label = normalizeToken(input.label);
  const joined = `${path} ${name} ${label}`;

  const scores = ENTERPRISE_PAGE_TYPES.reduce(
    (acc, pageType) => ({
      ...acc,
      [pageType]: pageType === "generic" ? 0.1 : 0,
    }),
    {} as Record<EnterprisePageType, number>
  );
  const matchedSignals: string[] = [];
  PAGE_PATH_SCORING_RULES.forEach((rule) => {
    if (!rule.pattern.test(path)) return;
    addScore(scores, rule.pageType, rule.weight, matchedSignals, rule.signal);
  });
  PAGE_TOKEN_SCORING_RULES.forEach((rule) => {
    if (!rule.pattern.test(joined)) return;
    addScore(scores, rule.pageType, rule.weight, matchedSignals, rule.signal);
  });

  const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = ordered[0] as [EnterprisePageType, number];
  const second = ordered[1] as [EnterprisePageType, number] | undefined;
  const margin = Math.max(0, top[1] - Number(second?.[1] ?? 0));
  const confidence = Math.max(0, Math.min(1, top[1] <= 0 ? 0 : margin / Math.max(top[1], 1)));

  return {
    pageType: top[0],
    confidence,
    scores,
    matchedSignals,
  };
};

export const inferEnterprisePageTypeFromPath = (path: string): EnterprisePageType =>
  classifyEnterprisePageType({ path }).pageType;

export const resolveEnterprisePagePathFromLabel = (label: string) => {
  const normalized = normalizeToken(label);
  if (!normalized) return "/";
  if (LABEL_HOME_PATTERN.test(normalized)) return "/";
  for (const rule of LABEL_PATH_RULES) {
    if (rule.pattern.test(normalized)) return rule.path;
  }
  return "/";
};
