"use client";

import type React from "react";

type PenThemeInput = Record<string, any> | null | undefined;

type PenThemeResolved = {
  mode: string;
  fontHeading: string;
  fontBody: string;
  primaryColor: string;
  palette: {
    bg: string;
    text: string;
    primary: string;
    accent: string;
    neutral: string;
    textSecondary: string;
  };
};

const DEFAULT_THEME: PenThemeResolved = {
  mode: "light",
  fontHeading: "Inter",
  fontBody: "Inter",
  primaryColor: "#4F77FF",
  palette: {
    bg: "#F3F3EF",
    text: "#111111",
    primary: "#4F77FF",
    accent: "#F46E35",
    neutral: "#E5E7EB",
    textSecondary: "#4B5563",
  },
};

const parseHexColor = (value = "") => {
  const raw = String(value || "").trim();
  const match = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  const hex = match[1].length === 3 ? match[1].split("").map((entry) => entry + entry).join("") : match[1];
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

const isDarkColor = (value = "") => {
  const parsed = parseHexColor(value);
  if (!parsed) return false;
  const toLinear = (n: number) => {
    const c = n / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * toLinear(parsed.r) + 0.7152 * toLinear(parsed.g) + 0.0722 * toLinear(parsed.b);
  return lum < 0.42;
};

const isNeutralColor = (value = "") => {
  const parsed = parseHexColor(value);
  if (!parsed) return false;
  const spread = Math.max(parsed.r, parsed.g, parsed.b) - Math.min(parsed.r, parsed.g, parsed.b);
  return spread < 18;
};

const contrastColor = (value = "", light = "#F9F6EE", dark = "#111111") =>
  isDarkColor(value) ? light : dark;

export const resolvePenTheme = (themeInput: PenThemeInput): PenThemeResolved => {
  const source = themeInput && typeof themeInput === "object" ? themeInput : {};
  const paletteSource = source.palette && typeof source.palette === "object" ? source.palette : {};
  const primary = String(paletteSource.primary || source.primaryColor || DEFAULT_THEME.palette.primary);
  const accent = String(paletteSource.accent || primary || DEFAULT_THEME.palette.accent);
  return {
    mode: String(source.mode || DEFAULT_THEME.mode),
    fontHeading: String(source.fontHeading || DEFAULT_THEME.fontHeading),
    fontBody: String(source.fontBody || source.fontHeading || DEFAULT_THEME.fontBody),
    primaryColor: String(source.primaryColor || primary),
    palette: {
      bg: String(paletteSource.bg || DEFAULT_THEME.palette.bg),
      text: String(paletteSource.text || DEFAULT_THEME.palette.text),
      primary,
      accent,
      neutral: String(paletteSource.neutral || DEFAULT_THEME.palette.neutral),
      textSecondary: String(paletteSource.textSecondary || DEFAULT_THEME.palette.textSecondary),
    },
  };
};

export const buildPenThemeCssVars = (themeInput: PenThemeInput): React.CSSProperties => {
  const theme = resolvePenTheme(themeInput);
  const inverseSurface = isDarkColor(theme.palette.text) ? theme.palette.text : theme.palette.primary;
  return {
    "--pen-theme-bg": theme.palette.bg,
    "--pen-theme-text": theme.palette.text,
    "--pen-theme-primary": theme.palette.primary,
    "--pen-theme-accent": theme.palette.accent,
    "--pen-theme-neutral": theme.palette.neutral,
    "--pen-theme-text-secondary": theme.palette.textSecondary,
    "--pen-theme-on-primary": contrastColor(theme.palette.primary),
    "--pen-theme-on-accent": contrastColor(theme.palette.accent),
    "--pen-theme-inverse-surface": inverseSurface,
    "--pen-theme-on-inverse": contrastColor(inverseSurface),
    "--pen-font-heading": theme.fontHeading,
    "--pen-font-body": theme.fontBody,
  } as React.CSSProperties;
};

type ThemeStyleNode = {
  type?: string;
  name?: string;
  imageProp?: string;
};

type ApplyStyleOptions = {
  node?: ThemeStyleNode | null;
  parentNode?: ThemeStyleNode | null;
  keyPath?: string;
  sectionKindToken?: string;
  isHeadingLike?: boolean;
};

const resolveThemeColorSlot = (
  rawColor: string,
  propName: string,
  options: ApplyStyleOptions
) => {
  const propToken = String(propName || "").trim().toLowerCase();
  const nodeName = String(options.node?.name || "").trim().toLowerCase();
  const parentName = String(options.parentNode?.name || "").trim().toLowerCase();
  const sectionKindToken = String(options.sectionKindToken || "").trim().toLowerCase();
  const isRoot = options.keyPath === "root";
  const isTextProp = propToken === "color";
  const isBackgroundProp = propToken.includes("background");
  const isBorderProp = propToken.includes("border");
  const buttonLike =
    /(?:btn|button|cta|chip|pill|tag|badge)/.test(nodeName) ||
    /(?:btn|button|cta|chip|pill|tag|badge)/.test(parentName) ||
    /(?:quote|catalog|whatsapp|submit|send|buy|shop)/.test(nodeName);

  if (isRoot && isBackgroundProp) {
    if (sectionKindToken === "navigation" || sectionKindToken === "socialproof") return "bg";
    if (sectionKindToken === "footer") return "inverse-surface";
    if (sectionKindToken === "hero") return "primary";
    if (isNeutralColor(rawColor)) return "bg";
    return isDarkColor(rawColor) ? "primary" : "neutral";
  }

  if (isBackgroundProp) {
    if (buttonLike) return "accent";
    if (sectionKindToken === "footer") return "inverse-surface";
    if (sectionKindToken === "navigation") return "bg";
    if (isNeutralColor(rawColor)) return "neutral";
    return isDarkColor(rawColor) ? "primary" : "accent";
  }

  if (isTextProp) {
    if (buttonLike) return "on-accent";
    if (sectionKindToken === "footer") return "on-inverse";
    if (sectionKindToken === "hero" && options.isHeadingLike) return "on-primary";
    if (sectionKindToken === "navigation") {
      if (/logo/.test(nodeName)) return "text";
      return "text-secondary";
    }
    if (isDarkColor(rawColor)) return "text";
    if (isNeutralColor(rawColor)) return "text-secondary";
    return "on-primary";
  }

  if (isBorderProp) {
    if (buttonLike) return "accent";
    return "neutral";
  }

  return null;
};

export const applyPenThemeToStyleObject = (
  style: Record<string, any>,
  options: ApplyStyleOptions
) => {
  for (const [styleKey, styleValue] of Object.entries(style || {})) {
    if (styleKey === "fontFamily" && typeof styleValue === "string" && styleValue.trim()) {
      style[styleKey] = options.isHeadingLike
        ? `var(--pen-font-heading, ${styleValue})`
        : `var(--pen-font-body, ${styleValue})`;
      continue;
    }
    if (typeof styleValue !== "string" || !/#(?:[0-9a-f]{3}|[0-9a-f]{6})\b/i.test(styleValue)) {
      continue;
    }
    style[styleKey] = styleValue.replace(/#(?:[0-9a-f]{3}|[0-9a-f]{6})\b/gi, (match) => {
      const slot = resolveThemeColorSlot(match, styleKey, options);
      if (!slot) return match;
      return `var(--pen-theme-${slot}, ${match})`;
    });
  }
  return style;
};
