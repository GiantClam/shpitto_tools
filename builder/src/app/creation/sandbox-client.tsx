"use client";

import React from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { Puck, Render, type Config, type Data } from "@measured/puck";
import "@measured/puck/puck.css";

import { compileJIT } from "@/lib/runtime";
import { MotionProvider } from "@/components/theme/motion";
import { normalizePuckData } from "@/lib/design-system-enforcer";
import { puckConfig } from "@/puck/config";
import templateExclusiveCatalog from "../../../template-factory/library/template-exclusive-components.generated.json";
import templateBlockCatalog from "../../../template-factory/library/template-block-catalog.generated.json";

const DEFAULT_THEME_LIGHT = {
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  muted: "210 40% 96%",
  mutedForeground: "215 16% 47%",
  border: "214 32% 91%",
  card: "0 0% 100%",
};

const DEFAULT_THEME_DARK = {
  background: "222 47% 8%",
  foreground: "210 40% 98%",
  muted: "220 15% 16%",
  mutedForeground: "215 20% 65%",
  border: "220 13% 24%",
  card: "222 47% 10%",
};

const GENERIC_FONT_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
]);

const extractFontFamily = (value?: string) => {
  if (!value || typeof value !== "string") return "";
  const first = value.split(",")[0]?.replace(/["']/g, "").trim();
  if (!first) return "";
  if (GENERIC_FONT_FAMILIES.has(first.toLowerCase())) return "";
  return first;
};

type TemplateExclusiveCatalogEntry = {
  name?: string;
  baseBlockType?: string;
  blockType?: string;
  baseType?: string;
  defaultProps?: Record<string, unknown>;
  templateExclusive?: {
    baseBlockType?: string;
  };
};

type TemplateBlockCatalogEntry = {
  blockType?: string;
  kind?: string;
  props?: Record<string, unknown>;
};

const templateExclusiveComponents: TemplateExclusiveCatalogEntry[] = Array.isArray(templateExclusiveCatalog)
  ? (templateExclusiveCatalog as TemplateExclusiveCatalogEntry[])
  : Array.isArray((templateExclusiveCatalog as any)?.components)
    ? ((templateExclusiveCatalog as any).components as TemplateExclusiveCatalogEntry[])
    : [];

const templateExclusiveByName = new Map(
  templateExclusiveComponents
    .filter((entry) => typeof entry?.name === "string" && entry.name.trim())
    .map((entry) => [String(entry.name).trim(), entry] as const)
);

const templateBlockCatalogEntries: TemplateBlockCatalogEntry[] = Array.isArray(templateBlockCatalog)
  ? (templateBlockCatalog as TemplateBlockCatalogEntry[])
  : Array.isArray((templateBlockCatalog as any)?.entries)
    ? ((templateBlockCatalog as any).entries as TemplateBlockCatalogEntry[])
    : [];

const templateBlockKindByType = new Map(
  templateBlockCatalogEntries
    .filter((entry) => typeof entry?.blockType === "string" && entry.blockType.trim())
    .map((entry) => [String(entry.blockType).trim(), String(entry.kind || "").trim().toLowerCase()] as const)
);

const templateBlockPropsByType = new Map(
  templateBlockCatalogEntries
    .filter((entry) => typeof entry?.blockType === "string" && entry.blockType.trim())
    .map((entry) => [String(entry.blockType).trim(), entry.props && typeof entry.props === "object" ? entry.props : {}] as const)
);

const kindToBaseBlockType = (kind: string) => {
  switch (kind) {
    case "navigation":
    case "navbar":
    case "header":
      return "Navbar";
    case "footer":
      return "Footer";
    case "cta":
    case "lead":
      return "LeadCaptureCTA";
    case "socialproof":
    case "social-proof":
    case "trust":
    case "logo":
    case "partner":
      return "LogoCloud";
    case "testimonial":
    case "testimonials":
    case "review":
      return "TestimonialsGrid";
    case "hero":
      return "HeroSplit";
    case "faq":
      return "FAQAccordion";
    case "case":
    case "casestudy":
    case "case-study":
      return "CaseStudies";
    case "story":
    case "products":
    case "showcase":
      return "CardsGrid";
    case "feature":
    case "features":
    case "approach":
      return "FeatureGrid";
    default:
      return "";
  }
};

const inferBaseBlockTypeFromName = (type: string) => {
  const token = String(type || "").toLowerCase();
  if (/(navigation|navbar|header|navpen)/.test(token)) return "Navbar";
  if (/(footer|copyright|legal)/.test(token)) return "Footer";
  if (/(hero|banner|masthead)/.test(token)) return "HeroSplit";
  if (/(cta|leadcapture|lead|contact)/.test(token)) return "LeadCaptureCTA";
  if (/(socialproof|trust|logo|partner)/.test(token)) return "LogoCloud";
  if (/(testimonial|review)/.test(token)) return "TestimonialsGrid";
  if (/(case|study)/.test(token)) return "CaseStudies";
  if (/(faq|accordion)/.test(token)) return "FAQAccordion";
  if (/(products|product|catalog|gallery|showcase|exp|story)/.test(token)) return "CardsGrid";
  if (/(feature|features|approach)/.test(token)) return "FeatureGrid";
  return "";
};

const createTextLogoDataUri = (label: string) => {
  const safe = String(label || "").trim() || "Logo";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="96" viewBox="0 0 320 96"><rect width="320" height="96" rx="14" fill="#0B1020"/><text x="160" y="56" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#F5F7FB" letter-spacing="1.2">${safe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const synthesizeTemplateExclusiveRenderer = (
  type: string,
  components: Record<string, any>,
  sourceProps?: Record<string, any>
) => {
  const originalType =
    typeof sourceProps?.__publishedOriginalType === "string" && sourceProps.__publishedOriginalType.trim()
      ? sourceProps.__publishedOriginalType.trim()
      : type;
  const entry = templateExclusiveByName.get(type) || templateExclusiveByName.get(originalType);
  const directBaseBlockType = String(
    entry?.templateExclusive?.baseBlockType ||
      entry?.baseBlockType ||
      entry?.baseType ||
      entry?.blockType ||
      ""
  ).trim();
  const kindBaseBlockType =
    kindToBaseBlockType(templateBlockKindByType.get(type) || "") ||
    kindToBaseBlockType(templateBlockKindByType.get(originalType) || "");
  const inferredBaseBlockType = inferBaseBlockTypeFromName(originalType || type);
  const baseBlockType = [directBaseBlockType, kindBaseBlockType, inferredBaseBlockType].find((candidate) => {
    const key = String(candidate || "").trim();
    return key && components[key]?.render;
  }) || "";
  if (!baseBlockType) return null;
  const base = components[baseBlockType];
  if (!base?.render) return null;
  return {
    ...base,
    __synthesizedBaseBlockType: baseBlockType,
    defaultProps: {
      ...(base?.defaultProps && typeof base.defaultProps === "object" ? base.defaultProps : {}),
      ...(templateBlockPropsByType.get(type) ?? {}),
      ...(templateBlockPropsByType.get(originalType) ?? {}),
      ...(entry?.defaultProps && typeof entry.defaultProps === "object" ? entry.defaultProps : {}),
      ...(sourceProps && typeof sourceProps === "object" ? sourceProps : {}),
    },
  };
};

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" ? ({ ...(value as Record<string, any>) } as Record<string, any>) : {};

const synthesizeNavLinks = (props: Record<string, any>) => {
  const links = [];
  for (let i = 1; i <= 8; i += 1) {
    const label = String(props[`navl${i}text`] || "").trim();
    const href = String(props[`navl${i}href`] || "").trim();
    if (!label) continue;
    links.push({ label, href: href || "/", variant: "link" });
  }
  return links;
};

const synthesizeFooterColumns = (props: Record<string, any>) => {
  const toColumn = (text: string, href?: string) => {
    const lines = String(text || "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) return null;
    const [title, ...labels] = lines;
    const links = labels.length
      ? labels.map((label) => ({ label, href: href || "/" }))
      : [{ label: title, href: href || "/" }];
    return { title, links };
  };
  const cols = [
    toColumn(String(props.col1text || "")),
    toColumn(String(props.col2text || ""), String(props.col2href || "/")),
    toColumn(String(props.col3text || ""), String(props.col3href || "/")),
    toColumn(String(props.col4text || ""), String(props.col4href || "/")),
  ].filter(Boolean);
  return cols.length ? cols : [{ title: "Pages", links: [{ label: "Home", href: "/" }] }];
};

const adaptSynthesizedProps = (baseBlockType: string, rawProps: unknown) => {
  const props = asRecord(rawProps);
  const originalType = String(props.__publishedOriginalType || "").toLowerCase();
  if (baseBlockType === "Navbar") {
    if (!Array.isArray(props.links)) props.links = synthesizeNavLinks(props);
    if (!Array.isArray(props.ctas)) {
      const label = String(props.ctatexttext || props.ctalabel || "Contact").trim() || "Contact";
      const href = String(props.ctahref || "/").trim() || "/";
      props.ctas = [{ label, href, variant: "primary" }];
    }
  } else if (baseBlockType === "Footer") {
    if (!Array.isArray(props.columns)) props.columns = synthesizeFooterColumns(props);
    if (!Array.isArray(props.socials)) props.socials = [];
  } else if (baseBlockType === "FeatureGrid") {
    if (!Array.isArray(props.items)) props.items = [];
  } else if (baseBlockType === "TestimonialsGrid") {
    if (!Array.isArray(props.items)) props.items = [];
  } else if (baseBlockType === "LeadCaptureCTA") {
    if (!props.cta || typeof props.cta !== "object") {
      const label = String(props.ctatexttext || props.ctabtnprimarytext || "Contact").trim() || "Contact";
      const href = String(props.ctahref || props.ctabtnprimaryhref || "/").trim() || "/";
      props.cta = { label, href, variant: "primary" };
    }
  } else if (baseBlockType === "HeroSplit") {
    if (props.h1text || props.h1desctext || props.hero1imagesrc) {
      props.eyebrow = String(props.h1tagtext || props.eyebrow || "").trim();
      props.title = String(props.h1text || props.title || "").trim() || "Industrial precision";
      props.subtitle = String(props.h1desctext || props.subtitle || "").trim();
      props.background = "image";
      props.backgroundMedia = {
        kind: "image",
        src: String(props.hero1imagesrc || "").trim(),
      };
      props.textPanel = true;
      props.textPanelBackground = "rgba(8, 12, 24, 0.42)";
      props.textPanelBorderColor = "rgba(255,255,255,0.14)";
      props.surfaceTone = "dark";
      props.headingSize = "lg";
      props.bodySize = "md";
    }
    if (props.ordertxttext || props.orderbtnhref || props.learntxttext || props.learnbtnhref || !Array.isArray(props.ctas)) {
      const label = String(props.ordertxttext || props.ctatexttext || "Learn More").trim() || "Learn More";
      const href = String(props.orderbtnhref || props.ctahref || "/").trim() || "/";
      const secondaryLabel = String(props.learntxttext || "").trim();
      const secondaryHref = String(props.learnbtnhref || "").trim();
      props.ctas = [
        secondaryLabel ? { label: secondaryLabel, href: secondaryHref || "/", variant: "secondary" } : null,
        { label, href, variant: "primary" },
      ].filter(Boolean);
    }
  } else if (baseBlockType === "CardsGrid") {
    if (/product/.test(originalType)) {
      const items = [1, 2, 3, 4]
        .map((index) => {
          const title = String(props[`prodtitle0${index}text`] || "").trim();
          if (!title) return null;
          return {
            tag: String(props[`prodtag0${index}text`] || "").trim(),
            title,
            description: String(props[`proddesc0${index}text`] || "").trim(),
            imageSrc: String(props[`productimage0${index}imagesrc`] || "").trim(),
            cta: {
              label: String(props[`prodbtnlabel0${index}text`] || "Learn More").trim(),
              href: String(props[`prodbtn0${index}href`] || "/products").trim() || "/products",
              variant: "primary",
            },
          };
        })
        .filter(Boolean);
      props.title = "Core Product Platforms";
      props.subtitle = "Machine platforms designed for stable accuracy, throughput, and scalable deployment.";
      props.items = items;
      props.variant = "imageText";
      props.columns = "2col";
      props.cardStyle = "glass";
      props.imagePosition = "top";
      props.imageSize = "lg";
      props.textAlign = "left";
    } else if (/story|exp/.test(originalType)) {
      const items = [1, 2, 3]
        .map((index) => {
          const imageSrc = String(props[`capture0${index}imagesrc`] || "").trim();
          if (!imageSrc) return null;
          return {
            title: String(props[`cap${index}text`] || "").trim() || `Capture ${index}`,
            meta: String(props[`capturemeta0${index}text`] || "").trim(),
            imageSrc,
          };
        })
        .filter(Boolean);
      props.title = String(props.exptitletext || props.title || "").trim() || "Capability Highlights";
      props.subtitle = String(props.expbodytext || props.subtitle || "").trim();
      props.items = items;
      props.variant = "media";
      props.columns = "3col";
      props.cardStyle = "glass";
      props.imagePosition = "top";
      props.textAlign = "left";
    }
  }
  else if (baseBlockType === "LogoCloud") {
    const labels = [
      props.labela1text,
      props.labela2text,
      props.labela3text,
      props.labelb1text,
      props.labelb2text,
      props.labelb3text,
    ]
      .map((value) => String(value || "").replace(/^[◼◻]\s*/, "").trim())
      .filter(Boolean);
    props.title = String(props.trustttext || props.title || "").trim();
    props.emphasis = "high";
    props.logos = labels.map((label) => ({ src: createTextLogoDataUri(label), alt: label }));
    props.variant = "grid";
  }
  return props;
};

const hexToHsl = (hex?: string) => {
  if (!hex) return null;
  const normalizedRaw = hex.replace("#", "").trim();
  const normalized =
    normalizedRaw.length === 3
      ? normalizedRaw
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalizedRaw;
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    if (max === g) h = (b - r) / delta + 2;
    if (max === b) h = (r - g) / delta + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const colorToHslTriplet = (value?: string | null) => {
  if (!value || typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.startsWith("#")) return hexToHsl(normalized);
  const hslWrapped = normalized.match(/^hsl\((.+)\)$/i);
  const hslBody = hslWrapped?.[1]?.trim();
  if (hslBody) {
    return hslBody
      .replace(/\s*\/\s*[\d.]+%?\s*$/, "")
      .replace(/,/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(normalized)) return normalized;
  return null;
};

const lightnessFromHslTriplet = (triplet: string) => {
  const parts = triplet.trim().split(/\s+/);
  const lightness = Number(parts[2]?.replace("%", ""));
  return Number.isFinite(lightness) ? lightness : 50;
};

const buildGoogleFontsImport = (fontHeading: string, fontBody: string, fontFamilies?: unknown) => {
  const extraFamilies = Array.isArray(fontFamilies)
    ? fontFamilies
        .map((value) => (typeof value === "string" ? extractFontFamily(value) : ""))
        .filter(Boolean)
    : [];
  const families = Array.from(
    new Set([extractFontFamily(fontHeading), extractFontFamily(fontBody), ...extraFamilies].filter(Boolean))
  );
  if (!families.length) return "";
  const query = families
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@300;400;500;600;700;800`)
    .join("&");
  return `@import url('https://fonts.googleapis.com/css2?${query}&display=swap');`;
};

const buildThemeCss = (theme?: Record<string, any>) => {
  const mode = theme?.mode === "dark" ? "dark" : "light";
  const base = mode === "dark" ? DEFAULT_THEME_DARK : DEFAULT_THEME_LIGHT;
  const palette = theme?.palette && typeof theme.palette === "object" ? (theme.palette as Record<string, any>) : {};
  const background = colorToHslTriplet(palette.bg || palette.background) || base.background;
  const foreground = colorToHslTriplet(palette.text || palette.foreground) || base.foreground;
  const muted = colorToHslTriplet(palette.neutral || palette.muted) || base.muted;
  const mutedForeground = colorToHslTriplet(palette.textSecondary || palette.mutedForeground) || base.mutedForeground;
  const border = colorToHslTriplet(palette.border || palette.neutral) || base.border;
  const card = colorToHslTriplet(palette.card || palette.neutral || palette.bg) || base.card;
  const primary =
    colorToHslTriplet(palette.primary) ||
    colorToHslTriplet(theme?.primaryColor) ||
    (mode === "dark" ? "262 83% 62%" : "222 89% 52%");
  const accent = colorToHslTriplet(palette.accent) || primary;
  const primaryForeground = lightnessFromHslTriplet(primary) > 58 ? "222 47% 11%" : "210 40% 98%";
  const accentForeground = lightnessFromHslTriplet(accent) > 58 ? "222 47% 11%" : "210 40% 98%";
  const radius = theme?.radius || "14px";
  const fontHeading = theme?.fontHeading || "Inter";
  const fontBody = theme?.fontBody || "Inter";
  const fontImport = buildGoogleFontsImport(fontHeading, fontBody, theme?.fontFamilies);
  return `${fontImport}:root{--background:${background};--foreground:${foreground};--muted:${muted};--muted-foreground:${mutedForeground};--border:${border};--primary:${primary};--primary-foreground:${primaryForeground};--accent:${accent};--accent-foreground:${accentForeground};--card:${card};--radius:${radius};--font-heading:${fontHeading};--font-body:${fontBody};--space-1:0.25rem;--space-2:0.5rem;--space-3:0.75rem;--space-4:1rem;--space-6:1.5rem;--space-8:2rem;--space-12:3rem;}body{background:hsl(var(--background));color:hsl(var(--foreground));font-family:var(--font-body),ui-sans-serif,system-ui;} .font-heading{font-family:var(--font-heading),var(--font-body),ui-serif,serif;} .font-body{font-family:var(--font-body),ui-sans-serif,system-ui;}`;
};

const tailwindRuntimeConfigScript = `
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        card: "hsl(var(--card))"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  }
};
console.info("[creation:sandbox] tailwind_runtime_config_loaded", {
  tokens: ["background", "foreground", "muted", "primary", "accent", "border", "card"]
});
`;

type IncomingMessage =
  | {
      type: "puck:load";
      payload: SandboxLoadPayload;
    }
  | { type: "puck:ping" };

type SandboxLoadPayload = {
  components: Array<{ name: string; code: string }>;
  page: { data: Data };
  availablePagePaths?: string[];
  theme?: Record<string, any>;
  pageIndex?: number;
};

type CreationSandboxClientProps = {
  initialPayload?: SandboxLoadPayload;
};

const detectPrimitiveArrayFields = (code: string) => {
  const fields = new Set<string>();
  const pattern = /(\w+)\.map\(\((\w+)(?:\s*,\s*\w+)?\)\s*=>[\s\S]{0,260}\{\2\}/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code)) !== null) {
    const field = match[1]?.trim();
    if (field) fields.add(field);
  }
  return Array.from(fields);
};

const coerceObjectArrayToStringArray = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const next = value
    .map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return "";
      const record = item as Record<string, unknown>;
      const preferredKeys = ["paragraph", "text", "label", "title", "description", "value", "name"];
      for (const key of preferredKeys) {
        const candidate = record[key];
        if (typeof candidate === "string" && candidate.trim()) return candidate;
      }
      const firstString = Object.values(record).find((entry) => typeof entry === "string" && entry.trim());
      return typeof firstString === "string" ? firstString : "";
    })
    .filter((item) => typeof item === "string" && item.trim());
  return next.length ? next : null;
};

const coercePageDataArrays = (
  pageData: Data,
  primitiveArrayFieldsByType: Map<string, string[]>
): Data => {
  if (!primitiveArrayFieldsByType.size) return pageData;
  const cloned = structuredClone(pageData) as Record<string, any>;
  const content = Array.isArray(cloned?.content) ? (cloned.content as Array<Record<string, any>>) : [];
  content.forEach((item) => {
    const type = typeof item?.type === "string" ? item.type : "";
    const props = item?.props;
    if (!type || !props || typeof props !== "object") return;
    const fields = primitiveArrayFieldsByType.get(type);
    if (!fields?.length) return;
    fields.forEach((field) => {
      const coerced = coerceObjectArrayToStringArray((props as Record<string, unknown>)[field]);
      if (coerced) (props as Record<string, unknown>)[field] = coerced;
    });
  });
  return cloned as Data;
};

const createMissingBlockComponent = (blockType: string): React.ComponentType<any> => {
  const MissingBlock: React.FC<{ id?: string; anchor?: string }> = ({ id, anchor }) => (
    <section
      id={anchor}
      data-block={blockType}
      data-block-id={id || `${blockType}-missing`}
      className="mx-auto my-6 w-full max-w-5xl rounded-lg border border-dashed border-amber-400/60 bg-amber-50 px-4 py-3 text-sm text-amber-700"
    >
      Missing block renderer: {blockType}
    </section>
  );
  MissingBlock.displayName = `MissingBlock_${blockType}`;
  return MissingBlock;
};

const normalizePreviewPagePath = (rawPath: string) => {
  const trimmed = String(rawPath || "").trim();
  if (!trimmed || trimmed === "/" || trimmed === "home" || trimmed === "index") return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const normalizePreviewPageParam = (rawPath: string) => {
  const normalized = normalizePreviewPagePath(rawPath);
  return normalized === "/" ? "home" : normalized;
};

const isNonNavigationalHref = (href: string) => {
  const lowered = href.toLowerCase();
  return (
    lowered.startsWith("#") ||
    lowered.startsWith("mailto:") ||
    lowered.startsWith("tel:") ||
    lowered.startsWith("javascript:") ||
    lowered.startsWith("data:")
  );
};

const toSandboxPreviewHref = (
  rawHref: string,
  siteKey: string,
  mode: string,
  currentUrl: URL,
  availablePagePaths: Set<string>
) => {
  if (!rawHref || !siteKey || mode !== "preview") return "";
  const href = rawHref.trim();
  if (!href || isNonNavigationalHref(href)) return "";

  let parsed: URL;
  try {
    parsed = new URL(href, currentUrl.origin);
  } catch {
    return "";
  }

  const candidatePagePath = normalizePreviewPagePath(parsed.pathname);
  const knownPage = availablePagePaths.has(candidatePagePath);
  if (parsed.origin !== currentUrl.origin && !knownPage) {
    return "";
  }
  if (parsed.pathname === "/creation/sandbox" && parsed.searchParams.get("mode") === "preview") {
    return "";
  }
  if (!knownPage && parsed.origin === currentUrl.origin) {
    return "";
  }

  const next = new URL(currentUrl.toString());
  next.pathname = "/creation/sandbox";
  next.searchParams.set("mode", "preview");
  next.searchParams.set("siteKey", siteKey);
  next.searchParams.set("page", normalizePreviewPageParam(candidatePagePath));
  next.hash = parsed.hash || "";
  return next.toString();
};

class BlockErrorBoundary extends React.Component<
  { blockName: string; children: React.ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: { blockName: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : "runtime_error";
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[creation:sandbox] block_runtime_error", {
      block: this.props.blockName,
      message,
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <section className="mx-auto my-6 w-full max-w-5xl rounded-lg border border-dashed border-red-400/60 bg-red-50 px-4 py-3 text-sm text-red-700">
        Block render failed: {this.props.blockName}
        {this.state.message ? ` (${this.state.message})` : ""}
      </section>
    );
  }
}

export default function CreationSandboxClient({ initialPayload }: CreationSandboxClientProps) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "preview";
  const isEdit = mode === "edit";
  const siteKey = searchParams.get("siteKey") || "";
  const [config, setConfig] = React.useState<Config | null>(null);
  const [data, setData] = React.useState<Data | null>(null);
  const [availablePagePaths, setAvailablePagePaths] = React.useState<string[]>([]);
  const [themeCss, setThemeCss] = React.useState<string>("");
  const [motionMode, setMotionMode] = React.useState<"off" | "subtle" | "showcase">("showcase");
  const [pageKey, setPageKey] = React.useState<string>("page-0");
  const pageIndexRef = React.useRef<number>(0);
  const postToHost = React.useCallback((message: unknown) => {
    window.parent?.postMessage(message, "*");
    if (window.opener && window.opener !== window) {
      window.opener.postMessage(message, "*");
    }
  }, []);

  React.useEffect(() => {
    console.info("[creation:sandbox] preview_mode", { mode: isEdit ? "edit" : "preview" });
  }, [isEdit]);

  React.useEffect(() => {
    if (mode !== "preview" || !siteKey) return;
    const availablePathSet = new Set(
      (availablePagePaths.length ? availablePagePaths : ["/"]).map((item) =>
        normalizePreviewPagePath(item)
      )
    );

    const rewriteAnchors = () => {
      const currentUrl = new URL(window.location.href);
      const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'));
      anchors.forEach((anchor) => {
        const original = anchor.getAttribute("href");
        if (!original) return;
        const rewritten = toSandboxPreviewHref(original, siteKey, mode, currentUrl, availablePathSet);
        if (!rewritten) return;
        anchor.setAttribute("href", rewritten);
      });
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      const rewritten = toSandboxPreviewHref(
        href,
        siteKey,
        mode,
        new URL(window.location.href),
        availablePathSet
      );
      if (!rewritten) return;

      event.preventDefault();
      window.location.assign(rewritten);
    };

    rewriteAnchors();
    const observer = new MutationObserver(() => rewriteAnchors());
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", handleClick, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick, true);
    };
  }, [mode, siteKey, availablePagePaths, config, data]);

  const applyLoadPayload = React.useCallback(
    (payload: SandboxLoadPayload) => {
      const isFrameworkPreview = siteKey === "framework";
      pageIndexRef.current = payload.pageIndex ?? 0;
      setPageKey(`page-${pageIndexRef.current}`);
      const nextConfig: Config = {
        components: {
          ...((puckConfig as any)?.components ?? {}),
        },
      };
      const failures: string[] = [];
      const primitiveArrayFieldsByType = new Map<string, string[]>();
      payload.components.forEach((component) => {
        if (isFrameworkPreview && (nextConfig.components as Record<string, unknown>)[component.name]) {
          return;
        }
        const primitiveArrayFields = detectPrimitiveArrayFields(component.code);
        if (primitiveArrayFields.length) {
          primitiveArrayFieldsByType.set(component.name, primitiveArrayFields);
        }
        const compiled = compileJIT(component.code);
        if (!compiled) {
          failures.push(component.name);
          return;
        }
        const Comp = compiled.render as React.ComponentType<any>;
        const WrappedComponent: React.FC<any> = (props) => (
          <BlockErrorBoundary blockName={component.name}>
            <Comp {...props} />
          </BlockErrorBoundary>
        );
        WrappedComponent.displayName = `Wrapped_${component.name}`;
        nextConfig.components[component.name] = {
          ...(compiled.config ?? {}),
          render: WrappedComponent,
        } as any;
      });

      const normalizedTheme =
        isFrameworkPreview && payload.theme && typeof payload.theme === "object"
          ? { ...payload.theme, motion: "off" as const }
          : payload.theme;
      const normalizedPage =
        isFrameworkPreview &&
        payload.page &&
        typeof payload.page === "object" &&
        payload.page.data &&
        typeof payload.page.data === "object"
          ? {
              ...payload.page,
              data: {
                ...payload.page.data,
                root: {
                  ...((payload.page.data as Record<string, any>).root ?? {}),
                  props: {
                    ...(((payload.page.data as Record<string, any>).root as Record<string, any>)?.props ?? {}),
                    theme: {
                      ...((((payload.page.data as Record<string, any>).root as Record<string, any>)?.props?.theme ??
                        {}) as Record<string, any>),
                      ...(normalizedTheme && typeof normalizedTheme === "object" ? normalizedTheme : {}),
                      motion: "off",
                    },
                  },
                },
              },
            }
          : payload.page;

      const rawContent = Array.isArray((normalizedPage as any)?.data?.content)
        ? ((normalizedPage as any).data.content as Array<{ type?: unknown; props?: unknown }>)
        : [];
      const requiredTypes = Array.from(
        new Set(
          rawContent
            .map((item) => (typeof item?.type === "string" ? item.type.trim() : ""))
            .filter(Boolean)
        )
      );
      const sourcePropsByType = new Map<string, Record<string, any>>();
      rawContent.forEach((item) => {
        const type = typeof item?.type === "string" ? item.type.trim() : "";
        const props = item?.props;
        if (!type || sourcePropsByType.has(type) || !props || typeof props !== "object") return;
        sourcePropsByType.set(type, props as Record<string, any>);
      });
      const missingTypes = requiredTypes.filter((type) => !(nextConfig.components as Record<string, unknown>)[type]);
      const synthesizedTypes: string[] = [];
      missingTypes.forEach((type) => {
        const sourceProps = sourcePropsByType.get(type);
        const synthesized = synthesizeTemplateExclusiveRenderer(
          type,
          nextConfig.components as Record<string, any>,
          sourceProps
        );
        if (!synthesized) return;
        const sourceRender = synthesized.render as React.ComponentType<any> | undefined;
        if (!sourceRender) return;
        const synthesizedBaseBlockType = String(
          (synthesized as Record<string, unknown>).__synthesizedBaseBlockType || ""
        ).trim();
        const WrappedSynthesized: React.FC<any> = (props) => (
          <BlockErrorBoundary blockName={type}>
            {React.createElement(
              sourceRender,
              adaptSynthesizedProps(synthesizedBaseBlockType, {
                ...(synthesized.defaultProps && typeof synthesized.defaultProps === "object"
                  ? synthesized.defaultProps
                  : {}),
                ...(props && typeof props === "object" ? props : {}),
              })
            )}
          </BlockErrorBoundary>
        );
        WrappedSynthesized.displayName = `WrappedSynth_${type}`;
        (nextConfig.components as Record<string, any>)[type] = {
          ...synthesized,
          render: WrappedSynthesized,
        };
        synthesizedTypes.push(type);
      });
      const unresolvedMissingTypes = missingTypes.filter((type) => !synthesizedTypes.includes(type));
      unresolvedMissingTypes.forEach((type) => {
        (nextConfig.components as Record<string, any>)[type] = {
          render: createMissingBlockComponent(type),
          fields: {},
          defaultProps: { id: `${type}-missing`, anchor: `${type}-missing` },
        };
      });
      if (unresolvedMissingTypes.length) {
        failures.push(...unresolvedMissingTypes.map((type) => `${type}:missing_renderer`));
      }

      if (failures.length) {
        postToHost({ type: "puck:compile", payload: { failures } });
      }
      const coercedPageData = coercePageDataArrays(normalizedPage.data, primitiveArrayFieldsByType);
      setConfig(nextConfig);
      setData(normalizePuckData(coercedPageData, { logChanges: true }));
      const nextPagePaths = Array.isArray(payload.availablePagePaths)
        ? Array.from(
            new Set(
              payload.availablePagePaths
                .map((value) => normalizePreviewPagePath(String(value || "")))
                .filter(Boolean)
            )
          )
        : ["/"];
      setAvailablePagePaths(nextPagePaths.length ? nextPagePaths : ["/"]);
      setThemeCss(buildThemeCss(normalizedTheme));
      setMotionMode((normalizedTheme?.motion as any) || "showcase");
      document.documentElement.classList.toggle("dark", normalizedTheme?.mode === "dark");
    },
    [postToHost, siteKey]
  );

  React.useEffect(() => {
    if (!initialPayload) return;
    applyLoadPayload(initialPayload);
  }, [applyLoadPayload, initialPayload]);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent<IncomingMessage>) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "puck:load") {
        applyLoadPayload(event.data.payload);
        return;
      }
      if (event.data.type === "puck:ping") {
        postToHost({ type: "puck:ready" });
      }
    };
    window.addEventListener("message", onMessage);
    postToHost({ type: "puck:ready" });
    return () => window.removeEventListener("message", onMessage);
  }, [applyLoadPayload, postToHost]);

  const handlePublish = React.useCallback(
    (nextData: Data) => {
      setData(nextData);
      postToHost({ type: "puck:update", payload: { data: nextData, pageIndex: pageIndexRef.current } });
    },
    [postToHost]
  );

  return (
    <div
      data-sandbox-ready={config && data ? "1" : "0"}
      className={
        isEdit
          ? "h-screen w-screen overflow-hidden bg-background text-foreground"
          : "min-h-screen w-full bg-background text-foreground"
      }
    >
      <Script id="tailwind-runtime-config" strategy="beforeInteractive">
        {tailwindRuntimeConfigScript}
      </Script>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      {themeCss ? <style dangerouslySetInnerHTML={{ __html: themeCss }} /> : null}
      {config && data ? (
        <MotionProvider mode={motionMode}>
          {isEdit ? (
            <Puck
              key={pageKey}
              config={config}
              data={normalizePuckData(data, { logChanges: true })}
              onPublish={handlePublish}
            />
          ) : (
            <main>
              <Render config={config} data={normalizePuckData(data, { logChanges: true }) as any} />
            </main>
          )}
        </MotionProvider>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          等待生成内容…
        </div>
      )}
    </div>
  );
}
