type PlannerSectionLike = {
  id?: string;
  type?: string;
  intent?: string;
};

type PlannerPageLike = {
  path?: string;
  name?: string;
  sections?: PlannerSectionLike[];
};

export type SiteBlueprintPage = {
  path: string;
  name: string;
  sectionTokens: string[];
};

export type SiteBlueprint = {
  profileId: string | null;
  skeleton:
    | "trust-first"
    | "product-first"
    | "solution-first"
    | "authority-heavy"
    | "conversion-driven";
  pages: SiteBlueprintPage[];
};

const normalizePagePath = (value: unknown) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || raw === "home" || raw === "index") return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const compact = withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
  return compact || "/";
};

const normalizePageName = (value: unknown, fallbackIndex: number, path: string) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (raw) return raw;
  if (path === "/") return "Home";
  return `Page ${fallbackIndex + 1}`;
};

const sectionToken = (section: PlannerSectionLike) =>
  `${section.type ?? ""} ${section.id ?? ""} ${section.intent ?? ""}`.toLowerCase();

const inferSkeleton = (homePage: SiteBlueprintPage | undefined): SiteBlueprint["skeleton"] => {
  if (!homePage) return "trust-first";
  const joined = homePage.sectionTokens.join(" ");
  if (/(pricing|faq|offer|trial|signup|newsletter|lead|cta)/.test(joined)) return "conversion-driven";
  if (/(product|catalog|collection|showcase|spec|feature)/.test(joined)) return "product-first";
  if (/(solution|usecase|industry|workflow|process)/.test(joined)) return "solution-first";
  if (/(authority|certificate|timeline|history|leadership|team)/.test(joined)) return "authority-heavy";
  return "trust-first";
};

export const buildSiteBlueprint = (input: {
  profileId?: string | null;
  prompt?: string;
  pages: PlannerPageLike[];
}): SiteBlueprint => {
  const brandName = extractBrandNameFromPrompt(String(input.prompt || ""));
  const profileBrandToken = String(input.profileId || "")
    .split(/[-_:/]/)
    .find((token) => token.trim().length >= 4)
    ?.trim()
    .toLowerCase();
  const byPath = new Map<string, SiteBlueprintPage>();
  (Array.isArray(input.pages) ? input.pages : []).forEach((page, index) => {
    const path = normalizePagePath(page?.path);
    if (byPath.has(path)) return;
    let name = normalizePageName(page?.name, index, path);
    if (path === "/") {
      name = "Home";
    } else if (brandName && profileBrandToken && new RegExp(profileBrandToken, "i").test(name)) {
      name = name.replace(new RegExp(profileBrandToken, "ig"), brandName).trim();
    }
    const sections = Array.isArray(page?.sections) ? page.sections : [];
    const sectionTokens = sections.map((section) => sectionToken(section)).filter(Boolean);
    byPath.set(path, { path, name, sectionTokens });
  });
  const pages = Array.from(byPath.values()).sort((left, right) => {
    if (left.path === "/" && right.path !== "/") return -1;
    if (right.path === "/" && left.path !== "/") return 1;
    return left.path.localeCompare(right.path);
  });
  const skeleton = inferSkeleton(pages.find((page) => page.path === "/") ?? pages[0]);
  return {
    profileId: input.profileId ?? null,
    skeleton,
    pages,
  };
};
import { extractBrandNameFromPrompt } from "@/lib/agent/brand-utils";
