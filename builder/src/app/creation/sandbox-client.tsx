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
import type { SandboxPageSkinnable } from "@/lib/sandbox-payload";

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

const buildGoogleFontsImport = (fontHeading: string, fontBody: string) => {
  const families = Array.from(new Set([extractFontFamily(fontHeading), extractFontFamily(fontBody)].filter(Boolean)));
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
  const fontImport = buildGoogleFontsImport(fontHeading, fontBody);
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
  page: { data: Data; skinnable?: SandboxPageSkinnable };
  availablePagePaths?: string[];
  theme?: Record<string, any>;
  pageIndex?: number;
};

type CreationSandboxClientProps = {
  initialPayload?: SandboxLoadPayload;
};

type SkinDraftState = {
  text: Record<string, string>;
  image: Record<string, string>;
  link: Record<string, string>;
  style: Record<string, string>;
};

const createEmptySkinDraft = (): SkinDraftState => ({
  text: {},
  image: {},
  link: {},
  style: {},
});

const toCssPx = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? `${value}px` : "");

const normalizeStylePadding = (value: unknown) => {
  if (!Array.isArray(value) || !value.length) return "";
  if (value.length === 1 && typeof value[0] === "number") return `${value[0]}px`;
  if (value.length === 2 && value.every((item) => typeof item === "number")) {
    return `${value[0]}px ${value[1]}px`;
  }
  if (value.length === 4 && value.every((item) => typeof item === "number")) {
    return `${value[0]}px ${value[1]}px ${value[2]}px ${value[3]}px`;
  }
  return "";
};

const alignKeyword = (value?: unknown) =>
  ({
    start: "flex-start",
    end: "flex-end",
    center: "center",
    stretch: "stretch",
    space_between: "space-between",
    space_around: "space-around",
    space_evenly: "space-evenly",
  })[String(value || "").trim().toLowerCase()] || "";

const imageFitMode = (value?: unknown) =>
  ({
    fill: "cover",
    fit: "contain",
    stretch: "100% 100%",
  })[String(value || "").trim().toLowerCase()] || "cover";

const escapeCssSelector = (value: string) => {
  if (typeof window !== "undefined" && window.CSS?.escape) return window.CSS.escape(value);
  return value.replace(/["\\]/g, "\\$&");
};

const cloneJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const deepMergePlainObject = (base: Record<string, unknown>, patch: Record<string, unknown>) => {
  const next: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      next[key] &&
      typeof next[key] === "object" &&
      !Array.isArray(next[key])
    ) {
      next[key] = deepMergePlainObject(next[key] as Record<string, unknown>, value as Record<string, unknown>);
      continue;
    }
    next[key] = value;
  }
  return next;
};

const linearGradientFromFill = (fill: Record<string, unknown>) => {
  const colors = Array.isArray(fill.colors) ? fill.colors : [];
  if (!colors.length) return "";
  const rotation = typeof fill.rotation === "number" ? fill.rotation : 180;
  const stops = colors
    .map((entry) => {
      if (!entry || typeof entry !== "object") return "";
      const color = String((entry as Record<string, unknown>).color || "").trim();
      const position = Number((entry as Record<string, unknown>).position || 0);
      if (!color) return "";
      return `${color} ${Math.round(position * 10000) / 100}%`;
    })
    .filter(Boolean);
  if (!stops.length) return "";
  return `linear-gradient(${rotation}deg, ${stops.join(", ")})`;
};

const skinStorageKey = (siteKey: string, pageId: string) => `creation-sandbox-skin:${siteKey}:${pageId}`;

const defaultStyleDraft = (defaults?: Record<string, unknown>) => JSON.stringify(defaults || {}, null, 2);

const loadDraftFromStorage = (siteKey: string, pageId: string): SkinDraftState => {
  if (typeof window === "undefined" || !siteKey || !pageId) return createEmptySkinDraft();
  try {
    const raw = window.localStorage.getItem(skinStorageKey(siteKey, pageId));
    if (!raw) return createEmptySkinDraft();
    const parsed = JSON.parse(raw) as Partial<SkinDraftState>;
    return {
      text: parsed?.text && typeof parsed.text === "object" ? { ...(parsed.text as Record<string, string>) } : {},
      image: parsed?.image && typeof parsed.image === "object" ? { ...(parsed.image as Record<string, string>) } : {},
      link: parsed?.link && typeof parsed.link === "object" ? { ...(parsed.link as Record<string, string>) } : {},
      style: parsed?.style && typeof parsed.style === "object" ? { ...(parsed.style as Record<string, string>) } : {},
    };
  } catch {
    return createEmptySkinDraft();
  }
};

const persistDraftToStorage = (siteKey: string, pageId: string, draft: SkinDraftState) => {
  if (typeof window === "undefined" || !siteKey || !pageId) return;
  try {
    window.localStorage.setItem(skinStorageKey(siteKey, pageId), JSON.stringify(draft));
  } catch {}
};

const removeDraftSlot = (
  draft: SkinDraftState,
  group: keyof SkinDraftState,
  slotId: string
): SkinDraftState => {
  const nextGroup = { ...draft[group] };
  delete nextGroup[slotId];
  return { ...draft, [group]: nextGroup };
};

const findPenNode = (doc: Document, nodeId: string) =>
  doc.querySelector<HTMLElement>(`[data-pen-node="${escapeCssSelector(nodeId)}"]`);

const isTextNodeType = (nodeType?: string) => nodeType === "text" || nodeType === "icon_font";

const applyFillStyle = (element: HTMLElement, fill: unknown, nodeType?: string) => {
  if (typeof fill === "string") {
    if (isTextNodeType(nodeType)) {
      element.style.color = fill;
    } else {
      element.style.background = fill;
      element.style.removeProperty("background-image");
    }
    return;
  }
  if (!fill || typeof fill !== "object") return;
  const nextFill = fill as Record<string, unknown>;
  if (nextFill.type === "image") {
    const url = String(nextFill.url || "").trim();
    if (url) {
      element.style.backgroundImage = `url("${url.replace(/"/g, "%22")}")`;
    } else {
      element.style.removeProperty("background-image");
    }
    element.style.backgroundRepeat = "no-repeat";
    element.style.backgroundPosition = "center center";
    element.style.backgroundSize = imageFitMode(nextFill.mode);
    return;
  }
  if (nextFill.type === "gradient") {
    const gradient = linearGradientFromFill(nextFill);
    if (gradient) element.style.backgroundImage = gradient;
  }
};

const applyStrokeStyle = (element: HTMLElement, stroke: unknown) => {
  if (!stroke || typeof stroke !== "object") return;
  const nextStroke = stroke as Record<string, unknown>;
  const fill = String(nextStroke.fill || "").trim();
  const thickness = Number(nextStroke.thickness || 0);
  if (fill && Number.isFinite(thickness) && thickness > 0) {
    element.style.border = `${thickness}px solid ${fill}`;
  }
};

const applyEffectStyle = (element: HTMLElement, effect: unknown) => {
  if (!effect || typeof effect !== "object") return;
  const nextEffect = effect as Record<string, unknown>;
  if (nextEffect.type !== "shadow") return;
  const offset = nextEffect.offset && typeof nextEffect.offset === "object"
    ? (nextEffect.offset as Record<string, unknown>)
    : {};
  const offsetX = Number(offset.x || 0);
  const offsetY = Number(offset.y || 0);
  const blur = Number(nextEffect.blur || 0);
  const color = String(nextEffect.color || "").trim();
  if (color) {
    element.style.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`;
  }
};

const applyStyleObject = (element: HTMLElement, stylePatch: Record<string, unknown>, nodeType?: string) => {
  if ("fill" in stylePatch) applyFillStyle(element, stylePatch.fill, nodeType);
  if ("stroke" in stylePatch) applyStrokeStyle(element, stylePatch.stroke);
  if ("effect" in stylePatch) applyEffectStyle(element, stylePatch.effect);
  if ("cornerRadius" in stylePatch) element.style.borderRadius = toCssPx(stylePatch.cornerRadius);
  if ("padding" in stylePatch) element.style.padding = normalizeStylePadding(stylePatch.padding);
  if ("gap" in stylePatch) element.style.gap = toCssPx(stylePatch.gap);
  if ("layout" in stylePatch) {
    const layout = String(stylePatch.layout || "").trim();
    if (layout === "vertical" || layout === "horizontal") {
      element.style.display = "flex";
      element.style.flexDirection = layout === "vertical" ? "column" : "row";
    }
  }
  if ("justifyContent" in stylePatch) element.style.justifyContent = alignKeyword(stylePatch.justifyContent);
  if ("alignItems" in stylePatch) element.style.alignItems = alignKeyword(stylePatch.alignItems);
  if ("width" in stylePatch) {
    element.style.width = stylePatch.width === "fill_container" ? "100%" : toCssPx(stylePatch.width) || String(stylePatch.width || "");
  }
  if ("height" in stylePatch) {
    element.style.height = stylePatch.height === "fill_container" ? "100%" : toCssPx(stylePatch.height) || String(stylePatch.height || "");
  }
  if ("opacity" in stylePatch && stylePatch.opacity !== undefined && stylePatch.opacity !== null) {
    element.style.opacity = String(stylePatch.opacity);
  }
  if ("rotation" in stylePatch && stylePatch.rotation !== undefined && stylePatch.rotation !== null) {
    const rotation = Number(stylePatch.rotation);
    if (Number.isFinite(rotation)) {
      const unit = Math.abs(rotation) <= Math.PI * 2 ? "rad" : "deg";
      element.style.transform = `rotate(${rotation}${unit})`;
      element.style.transformOrigin = "top left";
    }
  }
  if ("fontFamily" in stylePatch && stylePatch.fontFamily) {
    element.style.fontFamily = `"${String(stylePatch.fontFamily)}", "Helvetica Neue", Arial, sans-serif`;
  }
  if ("fontSize" in stylePatch) element.style.fontSize = toCssPx(stylePatch.fontSize);
  if ("fontWeight" in stylePatch && stylePatch.fontWeight) element.style.fontWeight = String(stylePatch.fontWeight);
  if ("lineHeight" in stylePatch && stylePatch.lineHeight !== undefined && stylePatch.lineHeight !== null) {
    const lineHeight = Number(stylePatch.lineHeight);
    element.style.lineHeight =
      Number.isFinite(lineHeight) && lineHeight <= 4 ? String(lineHeight) : toCssPx(stylePatch.lineHeight);
  }
  if ("letterSpacing" in stylePatch) element.style.letterSpacing = toCssPx(stylePatch.letterSpacing);
  if ("textAlign" in stylePatch && stylePatch.textAlign) element.style.textAlign = String(stylePatch.textAlign);
  if ("textAlignVertical" in stylePatch && stylePatch.textAlignVertical) {
    element.style.display = "flex";
    element.style.alignItems =
      ({
        top: "flex-start",
        middle: "center",
        center: "center",
        bottom: "flex-end",
      })[String(stylePatch.textAlignVertical || "").trim().toLowerCase()] || element.style.alignItems;
  }
};

const applySkinnableDraftToDocument = (
  doc: Document,
  skinnable: SandboxPageSkinnable,
  draft: SkinDraftState
) => {
  const styleErrors: Record<string, string> = {};

  for (const slot of skinnable.editable.styleSlots || []) {
    const element = findPenNode(doc, slot.nodeId);
    if (!element) continue;
    const raw = draft.style[slot.slotId];
    const base = cloneJson(slot.defaults || {});
    let next = base;
    if (typeof raw === "string" && raw.trim()) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          next = deepMergePlainObject(base, parsed);
        }
      } catch (error) {
        styleErrors[slot.slotId] = error instanceof Error ? error.message : "Invalid JSON";
      }
    }
    applyStyleObject(element, next, slot.nodeType);
  }

  for (const slot of skinnable.editable.textSlots || []) {
    const element = findPenNode(doc, slot.nodeId);
    if (!element) continue;
    element.textContent = draft.text[slot.slotId] ?? slot.defaultValue;
  }

  for (const slot of skinnable.editable.imageSlots || []) {
    const element = findPenNode(doc, slot.nodeId);
    if (!element) continue;
    const url = (draft.image[slot.slotId] ?? slot.defaultUrl).trim();
    if (url) {
      element.style.backgroundImage = `url("${url.replace(/"/g, "%22")}")`;
      element.style.backgroundRepeat = "no-repeat";
      element.style.backgroundPosition = "center center";
      element.style.backgroundSize = imageFitMode(slot.defaultMode);
    } else {
      element.style.removeProperty("background-image");
    }
  }

  for (const slot of skinnable.editable.linkSlots || []) {
    const element = findPenNode(doc, slot.nodeId);
    if (!element) continue;
    const href = (draft.link[slot.slotId] ?? slot.defaultHref).trim();
    if (element instanceof HTMLAnchorElement) {
      if (href) element.setAttribute("href", href);
      else element.removeAttribute("href");
    }
  }

  return { styleErrors };
};

const buildSkinOverrideExport = (skinnable: SandboxPageSkinnable, draft: SkinDraftState) => {
  const overrideMap: Record<string, Record<string, unknown>> = {};
  for (const slot of skinnable.editable.textSlots || []) {
    const next = draft.text[slot.slotId];
    if (typeof next === "string" && next !== slot.defaultValue) {
      overrideMap[slot.nodeId] = { ...(overrideMap[slot.nodeId] || {}), content: next };
    }
  }
  for (const slot of skinnable.editable.imageSlots || []) {
    const next = draft.image[slot.slotId];
    if (typeof next === "string" && next !== slot.defaultUrl) {
      overrideMap[slot.nodeId] = {
        ...(overrideMap[slot.nodeId] || {}),
        fill: {
          type: "image",
          url: next,
          mode: slot.defaultMode || "fill",
        },
      };
    }
  }
  for (const slot of skinnable.editable.linkSlots || []) {
    const next = draft.link[slot.slotId];
    if (typeof next === "string" && next !== slot.defaultHref) {
      overrideMap[slot.nodeId] = { ...(overrideMap[slot.nodeId] || {}), href: next };
    }
  }
  for (const slot of skinnable.editable.styleSlots || []) {
    const raw = draft.style[slot.slotId];
    if (!raw || raw === defaultStyleDraft(slot.defaults)) continue;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        overrideMap[slot.nodeId] = deepMergePlainObject(
          (overrideMap[slot.nodeId] || {}) as Record<string, unknown>,
          parsed
        );
      }
    } catch {}
  }
  return overrideMap;
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
  const [skinnable, setSkinnable] = React.useState<SandboxPageSkinnable | null>(null);
  const [skinOpen, setSkinOpen] = React.useState(false);
  const [skinFilter, setSkinFilter] = React.useState("");
  const [skinDraft, setSkinDraft] = React.useState<SkinDraftState>(createEmptySkinDraft);
  const [skinStyleErrors, setSkinStyleErrors] = React.useState<Record<string, string>>({});
  const [skinCopied, setSkinCopied] = React.useState(false);
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
        const primitiveArrayFields = detectPrimitiveArrayFields(component.code);
        if (primitiveArrayFields.length) {
          primitiveArrayFieldsByType.set(component.name, primitiveArrayFields);
        }
        if ((nextConfig.components as Record<string, unknown>)[component.name]) {
          return;
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

      const rawContent = Array.isArray((payload.page as any)?.data?.content)
        ? ((payload.page as any).data.content as Array<{ type?: unknown }>)
        : [];
      const requiredTypes = Array.from(
        new Set(
          rawContent
            .map((item) => (typeof item?.type === "string" ? item.type.trim() : ""))
            .filter(Boolean)
        )
      );
      const missingTypes = requiredTypes.filter((type) => !(nextConfig.components as Record<string, unknown>)[type]);
      missingTypes.forEach((type) => {
        (nextConfig.components as Record<string, any>)[type] = {
          render: createMissingBlockComponent(type),
          fields: {},
          defaultProps: { id: `${type}-missing`, anchor: `${type}-missing` },
        };
      });
      if (missingTypes.length) {
        failures.push(...missingTypes.map((type) => `${type}:missing_renderer`));
      }

      if (failures.length) {
        postToHost({ type: "puck:compile", payload: { failures } });
      }
      const coercedPageData = coercePageDataArrays(payload.page.data, primitiveArrayFieldsByType);
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
      setThemeCss(buildThemeCss(payload.theme));
      setMotionMode((payload.theme?.motion as any) || "showcase");
      setSkinnable(payload.page.skinnable || null);
      document.documentElement.classList.toggle("dark", payload.theme?.mode === "dark");
    },
    [postToHost]
  );

  React.useEffect(() => {
    if (!initialPayload) return;
    applyLoadPayload(initialPayload);
  }, [applyLoadPayload, initialPayload]);

  React.useEffect(() => {
    if (!skinnable?.pageId || !siteKey) {
      setSkinDraft(createEmptySkinDraft());
      setSkinStyleErrors({});
      return;
    }
    setSkinDraft(loadDraftFromStorage(siteKey, skinnable.pageId));
    setSkinStyleErrors({});
    setSkinCopied(false);
    setSkinFilter("");
  }, [siteKey, skinnable?.pageId]);

  React.useEffect(() => {
    if (isEdit || !skinnable?.pageId || !siteKey) return;
    persistDraftToStorage(siteKey, skinnable.pageId, skinDraft);
  }, [isEdit, siteKey, skinnable?.pageId, skinDraft]);

  React.useEffect(() => {
    if (isEdit || !skinnable) return;
    let cancelled = false;
    let attempts = 0;
    const applyToFrame = () => {
      if (cancelled) return true;
      const frame = document.querySelector<HTMLIFrameElement>('iframe[data-pen-preview-frame="true"]');
      const doc = frame?.contentDocument;
      if (!frame || !doc || !doc.body) return false;
      const result = applySkinnableDraftToDocument(doc, skinnable, skinDraft);
      if (!cancelled) setSkinStyleErrors(result.styleErrors);
      return true;
    };
    const onLoad = () => {
      applyToFrame();
    };
    const interval = window.setInterval(() => {
      attempts += 1;
      if (applyToFrame() || attempts > 40) window.clearInterval(interval);
    }, 150);
    const frame = document.querySelector<HTMLIFrameElement>('iframe[data-pen-preview-frame="true"]');
    frame?.addEventListener("load", onLoad);
    window.requestAnimationFrame(() => {
      applyToFrame();
    });
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      frame?.removeEventListener("load", onLoad);
    };
  }, [isEdit, pageKey, skinnable, skinDraft, data]);

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

  const filteredTextSlots = (skinnable?.editable.textSlots || []).filter((slot) =>
    slot.label.toLowerCase().includes(skinFilter.trim().toLowerCase())
  );
  const filteredImageSlots = (skinnable?.editable.imageSlots || []).filter((slot) =>
    slot.label.toLowerCase().includes(skinFilter.trim().toLowerCase())
  );
  const filteredLinkSlots = (skinnable?.editable.linkSlots || []).filter((slot) =>
    slot.label.toLowerCase().includes(skinFilter.trim().toLowerCase())
  );
  const filteredStyleSlots = (skinnable?.editable.styleSlots || []).filter((slot) =>
    slot.label.toLowerCase().includes(skinFilter.trim().toLowerCase())
  );

  const handleCopyOverrides = React.useCallback(async () => {
    if (!skinnable || typeof window === "undefined" || !navigator.clipboard) return;
    const overrideMap = buildSkinOverrideExport(skinnable, skinDraft);
    await navigator.clipboard.writeText(JSON.stringify(overrideMap, null, 2));
    setSkinCopied(true);
    window.setTimeout(() => setSkinCopied(false), 1200);
  }, [skinnable, skinDraft]);

  const handleResetAllSkins = React.useCallback(() => {
    setSkinDraft(createEmptySkinDraft());
    setSkinStyleErrors({});
  }, []);

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
      {!isEdit && skinnable ? (
        <>
          <button
            type="button"
            onClick={() => setSkinOpen((open) => !open)}
            className="fixed bottom-5 right-5 z-[60] rounded-full border border-slate-300 bg-white/92 px-4 py-2 text-sm font-medium text-slate-900 shadow-lg backdrop-blur"
          >
            {skinOpen ? "Hide Skins" : "Open Skins"}
          </button>
          {skinOpen ? (
            <aside className="fixed right-0 top-0 z-[55] h-screen w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white/96 p-5 shadow-2xl backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Skinnable Preview</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950">{skinnable.pageName}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Text {skinnable.counts?.textSlotCount || 0} · Images {skinnable.counts?.imageSlotCount || 0} · Links{" "}
                    {skinnable.counts?.linkSlotCount || 0} · Styles {skinnable.counts?.styleSlotCount || 0}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSkinOpen(false)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyOverrides}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  {skinCopied ? "Copied" : "Copy overrideMap"}
                </button>
                <button
                  type="button"
                  onClick={handleResetAllSkins}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Reset all
                </button>
              </div>

              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Filter</span>
                <input
                  value={skinFilter}
                  onChange={(event) => setSkinFilter(event.target.value)}
                  placeholder="Search slots"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0"
                />
              </label>

              <details className="mt-5" open>
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  Text slots ({filteredTextSlots.length})
                </summary>
                <div className="mt-3 space-y-4">
                  {filteredTextSlots.map((slot) => (
                    <label key={slot.slotId} className="block rounded-2xl border border-slate-200 p-3">
                      <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        {slot.label}
                      </span>
                      <textarea
                        rows={3}
                        value={skinDraft.text[slot.slotId] ?? slot.defaultValue}
                        onChange={(event) =>
                          setSkinDraft((draft) => ({
                            ...draft,
                            text: { ...draft.text, [slot.slotId]: event.target.value },
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSkinDraft((draft) => removeDraftSlot(draft, "text", slot.slotId))}
                        className="mt-2 text-xs font-medium text-slate-500"
                      >
                        Reset
                      </button>
                    </label>
                  ))}
                </div>
              </details>

              <details className="mt-5" open>
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  Image slots ({filteredImageSlots.length})
                </summary>
                <div className="mt-3 space-y-4">
                  {filteredImageSlots.map((slot) => (
                    <label key={slot.slotId} className="block rounded-2xl border border-slate-200 p-3">
                      <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        {slot.label}
                      </span>
                      <input
                        value={skinDraft.image[slot.slotId] ?? slot.defaultUrl}
                        onChange={(event) =>
                          setSkinDraft((draft) => ({
                            ...draft,
                            image: { ...draft.image, [slot.slotId]: event.target.value },
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSkinDraft((draft) => removeDraftSlot(draft, "image", slot.slotId))}
                        className="mt-2 text-xs font-medium text-slate-500"
                      >
                        Reset
                      </button>
                    </label>
                  ))}
                </div>
              </details>

              <details className="mt-5">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  Link slots ({filteredLinkSlots.length})
                </summary>
                <div className="mt-3 space-y-4">
                  {filteredLinkSlots.map((slot) => (
                    <label key={slot.slotId} className="block rounded-2xl border border-slate-200 p-3">
                      <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        {slot.label}
                      </span>
                      <input
                        value={skinDraft.link[slot.slotId] ?? slot.defaultHref}
                        onChange={(event) =>
                          setSkinDraft((draft) => ({
                            ...draft,
                            link: { ...draft.link, [slot.slotId]: event.target.value },
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSkinDraft((draft) => removeDraftSlot(draft, "link", slot.slotId))}
                        className="mt-2 text-xs font-medium text-slate-500"
                      >
                        Reset
                      </button>
                    </label>
                  ))}
                </div>
              </details>

              <details className="mt-5">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  Style slots ({filteredStyleSlots.length})
                </summary>
                <div className="mt-3 space-y-4">
                  {filteredStyleSlots.map((slot) => (
                    <label key={slot.slotId} className="block rounded-2xl border border-slate-200 p-3">
                      <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        {slot.label}
                      </span>
                      <textarea
                        rows={8}
                        value={skinDraft.style[slot.slotId] ?? defaultStyleDraft(slot.defaults)}
                        onChange={(event) =>
                          setSkinDraft((draft) => ({
                            ...draft,
                            style: { ...draft.style, [slot.slotId]: event.target.value },
                          }))
                        }
                        className={`mt-2 w-full rounded-xl border px-3 py-2 text-xs text-slate-900 outline-none ${
                          skinStyleErrors[slot.slotId] ? "border-red-400 bg-red-50" : "border-slate-300"
                        }`}
                      />
                      {skinStyleErrors[slot.slotId] ? (
                        <p className="mt-2 text-xs text-red-600">{skinStyleErrors[slot.slotId]}</p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setSkinDraft((draft) => removeDraftSlot(draft, "style", slot.slotId))}
                        className="mt-2 text-xs font-medium text-slate-500"
                      >
                        Reset
                      </button>
                    </label>
                  ))}
                </div>
              </details>
            </aside>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
