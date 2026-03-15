// @ts-nocheck
"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TextReveal } from "@/components/magic/text-reveal";
import { useMotionMode } from "@/components/theme/motion";
import { useInViewReveal } from "@/lib/motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  Minus,
  Play,
  Plus,
  Search,
  Sparkles,
  Wifi,
  X,
} from "lucide-react";

const SECTION_KIND = "footer";
const SECTION_TREE = {
  "type": "frame",
  "id": "4ry2q",
  "name": "Footer",
  "style": {
    "boxSizing": "border-box",
    "width": 1440,
    "height": 589,
    "background": "#3F464D",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "rectangle",
      "id": "d2dd1",
      "name": "footerLogo",
      "style": {
        "boxSizing": "border-box",
        "width": 102,
        "height": 48,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "contain",
        "position": "absolute",
        "left": 56,
        "top": 58
      },
      "children": [],
      "imageProp": "footerlogoimagesrc"
    },
    {
      "type": "text",
      "id": "kYF2J",
      "name": "footerCompany",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Heebo",
        "fontSize": 18,
        "fontWeight": "700",
        "width": 240,
        "position": "absolute",
        "left": 56,
        "top": 128
      },
      "children": [],
      "textProp": "footercompanytext",
      "hrefProp": "footercompanyhref"
    },
    {
      "type": "text",
      "id": "WgPav",
      "name": "footerAddress",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#D6DBDF",
        "fontFamily": "Heebo",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 260,
        "position": "absolute",
        "left": 56,
        "top": 170
      },
      "children": [],
      "textProp": "footeraddresstext",
      "hrefProp": "footeraddresshref"
    },
    {
      "type": "text",
      "id": "Bz4TB",
      "name": "footerContact",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#D6DBDF",
        "fontFamily": "Heebo",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 320,
        "position": "absolute",
        "left": 56,
        "top": 252
      },
      "children": [],
      "textProp": "footercontacttext",
      "hrefProp": "footercontacthref"
    },
    {
      "type": "text",
      "id": "45e6r",
      "name": "col1Title",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Heebo",
        "fontSize": 17,
        "fontWeight": "700",
        "width": 80,
        "position": "absolute",
        "left": 430,
        "top": 70
      },
      "children": [],
      "textProp": "col1titletext",
      "hrefProp": "col1titlehref"
    },
    {
      "type": "text",
      "id": "JucKC",
      "name": "col1Text",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#CFD5DA",
        "fontFamily": "Heebo",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 140,
        "position": "absolute",
        "left": 430,
        "top": 104
      },
      "children": [],
      "textProp": "col1texttext",
      "hrefProp": "col1texthref"
    },
    {
      "type": "text",
      "id": "jn0DA",
      "name": "col2Title",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Heebo",
        "fontSize": 17,
        "fontWeight": "700",
        "width": 80,
        "position": "absolute",
        "left": 640,
        "top": 70
      },
      "children": [],
      "textProp": "col2titletext",
      "hrefProp": "col2titlehref"
    },
    {
      "type": "text",
      "id": "0mHaP",
      "name": "col2Text",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#CFD5DA",
        "fontFamily": "Heebo",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 180,
        "position": "absolute",
        "left": 640,
        "top": 104
      },
      "children": [],
      "textProp": "col2texttext",
      "hrefProp": "col2texthref"
    },
    {
      "type": "text",
      "id": "1JDyQ",
      "name": "col3Title",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Heebo",
        "fontSize": 17,
        "fontWeight": "700",
        "width": 80,
        "position": "absolute",
        "left": 850,
        "top": 70
      },
      "children": [],
      "textProp": "col3titletext",
      "hrefProp": "col3titlehref"
    },
    {
      "type": "text",
      "id": "p6n24",
      "name": "col3Text",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#CFD5DA",
        "fontFamily": "Heebo",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 170,
        "position": "absolute",
        "left": 850,
        "top": 104
      },
      "children": [],
      "textProp": "col3texttext",
      "hrefProp": "col3texthref"
    },
    {
      "type": "text",
      "id": "4PemL",
      "name": "col4Title",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Heebo",
        "fontSize": 17,
        "fontWeight": "700",
        "width": 80,
        "position": "absolute",
        "left": 1060,
        "top": 70
      },
      "children": [],
      "textProp": "col4titletext",
      "hrefProp": "col4titlehref"
    },
    {
      "type": "text",
      "id": "47Q6l",
      "name": "col4Text",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#CFD5DA",
        "fontFamily": "Heebo",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 120,
        "position": "absolute",
        "left": 1060,
        "top": 104
      },
      "children": [],
      "textProp": "col4texttext",
      "hrefProp": "col4texthref"
    },
    {
      "type": "rectangle",
      "id": "qoSnl",
      "name": "footerSep",
      "style": {
        "boxSizing": "border-box",
        "width": 1360,
        "height": 1,
        "background": "#59626A",
        "position": "absolute",
        "left": 40,
        "top": 448
      },
      "children": []
    },
    {
      "type": "text",
      "id": "cuxL4",
      "name": "langText",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#D3D9DE",
        "fontFamily": "Heebo",
        "fontSize": 12,
        "fontWeight": "500",
        "width": 360,
        "position": "absolute",
        "left": 560,
        "top": 480
      },
      "children": [],
      "textProp": "langtexttext",
      "hrefProp": "langtexthref"
    },
    {
      "type": "ellipse",
      "id": "y1WhD",
      "name": "social1",
      "style": {
        "boxSizing": "border-box"
      },
      "children": []
    },
    {
      "type": "ellipse",
      "id": "KudmN",
      "name": "social2",
      "style": {
        "boxSizing": "border-box"
      },
      "children": []
    },
    {
      "type": "ellipse",
      "id": "mrMUa",
      "name": "social3",
      "style": {
        "boxSizing": "border-box"
      },
      "children": []
    },
    {
      "type": "ellipse",
      "id": "V59wB",
      "name": "social4",
      "style": {
        "boxSizing": "border-box"
      },
      "children": []
    },
    {
      "type": "rectangle",
      "id": "YBedq",
      "name": "footerStripe",
      "style": {
        "boxSizing": "border-box",
        "width": 240,
        "height": 40,
        "background": "#F5C400",
        "position": "absolute",
        "left": 56,
        "top": 490
      },
      "children": []
    },
    {
      "type": "text",
      "id": "R1r1W",
      "name": "footerCopy",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B9C0C6",
        "fontFamily": "Heebo",
        "fontSize": 12,
        "fontWeight": "normal",
        "width": 420,
        "position": "absolute",
        "left": 56,
        "top": 551
      },
      "children": [],
      "textProp": "footercopytext",
      "hrefProp": "footercopyhref"
    },
    {
      "type": "text",
      "id": "pHcLF",
      "name": "mapPin",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#D6DBDF",
        "fontFamily": "Heebo",
        "fontSize": 16,
        "fontWeight": "500",
        "position": "absolute",
        "left": 58,
        "top": 406
      },
      "children": [],
      "textProp": "mappintext",
      "hrefProp": "mappinhref"
    },
    {
      "type": "text",
      "id": "f38Un",
      "name": "mapText",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#D6DBDF",
        "fontFamily": "Heebo",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 120,
        "position": "absolute",
        "left": 90,
        "top": 408
      },
      "children": [],
      "textProp": "maptexttext",
      "hrefProp": "maptexthref"
    },
    {
      "type": "text",
      "id": "AErY1",
      "name": "col2SubTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Heebo",
        "fontSize": 17,
        "fontWeight": "700",
        "width": 120,
        "position": "absolute",
        "left": 640,
        "top": 286
      },
      "children": [],
      "textProp": "col2subtitletext",
      "hrefProp": "col2subtitlehref"
    },
    {
      "type": "text",
      "id": "4c3zy",
      "name": "col2SubText",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#CFD5DA",
        "fontFamily": "Heebo",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 190,
        "position": "absolute",
        "left": 640,
        "top": 320
      },
      "children": [],
      "textProp": "col2subtexttext",
      "hrefProp": "col2subtexthref"
    },
    {
      "type": "text",
      "id": "OHMZi",
      "name": "langZH",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#F5C400",
        "fontFamily": "Heebo",
        "fontSize": 12,
        "fontWeight": "700",
        "position": "absolute",
        "left": 1114,
        "top": 480
      },
      "children": [],
      "textProp": "langzhtext",
      "hrefProp": "langzhhref"
    },
    {
      "type": "text",
      "id": "mwGlK",
      "name": "social1Icon",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#4A5055",
        "fontFamily": "Heebo",
        "fontSize": 18,
        "fontWeight": "700",
        "position": "absolute",
        "left": 1271,
        "top": 478
      },
      "children": [],
      "textProp": "social1icontext",
      "hrefProp": "social1iconhref"
    },
    {
      "type": "text",
      "id": "QO7tp",
      "name": "social2Icon",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#4A5055",
        "fontFamily": "Heebo",
        "fontSize": 14,
        "fontWeight": "700",
        "position": "absolute",
        "left": 1316,
        "top": 478
      },
      "children": [],
      "textProp": "social2icontext",
      "hrefProp": "social2iconhref"
    },
    {
      "type": "text",
      "id": "9vUaj",
      "name": "social3Icon",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#4A5055",
        "fontFamily": "Heebo",
        "fontSize": 13,
        "fontWeight": "700",
        "position": "absolute",
        "left": 1366,
        "top": 479
      },
      "children": [],
      "textProp": "social3icontext",
      "hrefProp": "social3iconhref"
    },
    {
      "type": "text",
      "id": "FcL1Y",
      "name": "social4Icon",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#4A5055",
        "fontFamily": "Heebo",
        "fontSize": 16,
        "fontWeight": "700",
        "position": "absolute",
        "left": 1413,
        "top": 477
      },
      "children": [],
      "textProp": "social4icontext",
      "hrefProp": "social4iconhref"
    },
    {
      "type": "rectangle",
      "id": "fAy6c",
      "name": "stripeLogo",
      "style": {
        "boxSizing": "border-box",
        "width": 72,
        "height": 28,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "contain",
        "position": "absolute",
        "left": 62,
        "top": 496
      },
      "children": [],
      "imageProp": "stripelogoimagesrc"
    },
    {
      "type": "text",
      "id": "21AsC",
      "name": "stripeText",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#4A5055",
        "fontFamily": "Heebo",
        "fontSize": 12,
        "fontWeight": "700",
        "position": "absolute",
        "left": 140,
        "top": 503
      },
      "children": [],
      "textProp": "stripetexttext",
      "hrefProp": "stripetexthref"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "4ry2q",
  "footerlogoimagesrc": "/Users/andai007/Desktop/shpitto_tools-main/assets/fpt218/logo-fpt.png",
  "footercompanytext": "FPT Industrie Spa",
  "footercompanyhref": "/",
  "footeraddresstext": "Via Enrico Fermi, 18\n30036 S. Maria di Sala (Ve), Italia",
  "footeraddresshref": "/",
  "footercontacttext": "电话号码. +39 041 5768111 / Fax +39 041 487528\ninfocom@fptindustrie.com\nsales@fptindustrie.com\nservice@fptindustrie.com",
  "footercontacthref": "/",
  "col1titletext": "企业",
  "col1titlehref": "/",
  "col1texttext": "企业\n历史\n企业系统\nItalian Style\n我们的认证\nGovernance",
  "col1texthref": "/",
  "col2titletext": "产品",
  "col2titlehref": "/",
  "col2texttext": "镗床\n卧式铣床\n立式铣床\n车削中心\nT 型铣床\nFriction Stir Welding\nAccessories",
  "col2texthref": "/",
  "col3titletext": "行业",
  "col3titlehref": "/",
  "col3texttext": "能源\n通用机械\n航空航天\n模板&模具\n汽车\n铁路\n石油&天然气\n土方工程\n船舶\n防务",
  "col3texthref": "/",
  "col4titletext": "技术",
  "col4titlehref": "/",
  "col4texttext": "FPT 世界\n通信\n联系方式\n加入我们",
  "col4texthref": "/",
  "langtexttext": "IT   EN   DE   FR   ES   PT   SV   RU   KO   ZH   AR",
  "langtexthref": "/",
  "footercopytext": "© 2026 FPT Industrie Spa   隐私政策   Cookie 政策   条款",
  "footercopyhref": "/",
  "mappintext": "◉",
  "mappinhref": "/",
  "maptexttext": "在地图上显示",
  "maptexthref": "/",
  "col2subtitletext": "补充技术",
  "col2subtitlehref": "/",
  "col2subtexttext": "FAST MILL Clamping\nSystem\nMARES PLATFORM 4.0+\nFRICTION STIR WELDING\nPRODUCTS",
  "col2subtexthref": "/",
  "langzhtext": "ZH",
  "langzhhref": "/",
  "social1icontext": "f",
  "social1iconhref": "/",
  "social2icontext": "in",
  "social2iconhref": "/",
  "social3icontext": "▶",
  "social3iconhref": "/",
  "social4icontext": "◎",
  "social4iconhref": "/",
  "stripelogoimagesrc": "/Users/andai007/Desktop/shpitto_tools-main/assets/fpt218/logo-fpt.png",
  "stripetexttext": "THE ITALIAN STYLE",
  "stripetexthref": "/italian-style"
};
const DEFAULT_THEME = {
  "mode": "dark",
  "fontHeading": "Heebo",
  "fontBody": "Heebo",
  "motion": "subtle",
  "fontFamilies": [
    "Heebo",
    "Inter"
  ],
  "palette": {
    "bg": "#000000",
    "text": "#FFFFFF",
    "primary": "#4F77FF",
    "accent": "#4F77FF",
    "neutral": "#1F2937",
    "textSecondary": "#9CA3AF"
  },
  "primaryColor": "#4F77FF",
  "layoutRules": {
    "maxWidth": "1400px",
    "sectionPadding": "py-24",
    "grid": "12-col"
  },
  "tokens": {
    "surface": "glass",
    "border": "soft",
    "shadow": "dramatic",
    "accent": "glow"
  }
};
const LAYOUT_CONTEXT = {
  "pageWidth": 1440,
  "pagePaddingLeft": 0,
  "pagePaddingRight": 0,
  "pagePaddingTop": 0,
  "pagePaddingBottom": 0,
  "sectionGapAfter": 0
};
const NAV_ACTIVE_COLOR = "var(--pen-theme-text, #F5C400)";
const NAV_INACTIVE_COLOR = "var(--pen-theme-text-secondary, #FFFFFF)";
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };
const PEN_RUNTIME_MOTION_STYLE = "@keyframes pen-media-breathe{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-8px,0) scale(1.035)}}.pen-product-card-hover{transform-origin:center center}.pen-product-card-hover:hover{transform:translate3d(0,-4px,0) scale(1.012);border-color:#FFFFFF!important;box-shadow:0 12px 30px rgba(0,0,0,.32)}";

const assignDefined = (target, patch) => {
  for (const [key, value] of Object.entries(patch || {})) {
    if (typeof value !== "undefined") target[key] = value;
  }
  return target;
};

const resolveMotionMode = (providerMode, overrideMode) => {
  const token = String(overrideMode || providerMode || "subtle").trim().toLowerCase();
  if (token === "off" || token === "subtle" || token === "showcase") return token;
  return "subtle";
};

const resolveSectionMotionProfile = (sectionKindToken = "", motionMode = "subtle") => {
  if (motionMode === "off") {
    return {
      level: "off",
      revealPreset: "fadeIn",
      delayStep: 0,
      textReveal: false,
      mediaBreathe: false,
      contentStagger: false,
    };
  }
  if (sectionKindToken === "hero") {
    return {
      level: "showcase",
      revealPreset: "fadeIn",
      delayStep: motionMode === "showcase" ? 95 : 75,
      textReveal: true,
      mediaBreathe: false,
      contentStagger: true,
    };
  }
  if (sectionKindToken === "navigation" || sectionKindToken === "footer") {
    return {
      level: "off",
      revealPreset: "fadeIn",
      delayStep: 0,
      textReveal: false,
      mediaBreathe: false,
      contentStagger: false,
    };
  }
  return {
    level: motionMode === "showcase" ? "showcase" : "stagger",
    revealPreset: "stagger",
    delayStep: motionMode === "showcase" ? 72 : 56,
    textReveal: true,
    mediaBreathe: false,
    contentStagger: true,
  };
};

const resolveDelayMs = (keyPath = "", sectionMotion) => {
  const match = String(keyPath || "").match(/-(\d+)$/);
  const index = Number(match?.[1] || 0);
  const step = Number(sectionMotion?.delayStep || 0);
  if (!(step > 0)) return 0;
  return Math.min(420, index * step);
};

const resolveFontSize = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const resolveNumericDimension = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const parseThemeHexColor = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const match = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((entry) => entry + entry)
          .join("")
      : match[1];
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

const isThemeDarkColor = (value = "") => {
  const parsed = parseThemeHexColor(value);
  if (!parsed) return false;
  const toLinear = (n) => {
    const c = n / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * toLinear(parsed.r) + 0.7152 * toLinear(parsed.g) + 0.0722 * toLinear(parsed.b);
  return lum < 0.42;
};

const isThemeNeutralColor = (value = "") => {
  const parsed = parseThemeHexColor(value);
  if (!parsed) return false;
  const spread = Math.max(parsed.r, parsed.g, parsed.b) - Math.min(parsed.r, parsed.g, parsed.b);
  return spread < 18;
};

const pickThemeContrastColor = (value = "", light = "#F9F6EE", dark = "#111111") =>
  isThemeDarkColor(value) ? light : dark;

const resolveThemePalette = (themeInput = null) => {
  const baseTheme = DEFAULT_THEME && typeof DEFAULT_THEME === "object" ? DEFAULT_THEME : {};
  const inputTheme = themeInput && typeof themeInput === "object" ? themeInput : {};
  const basePalette = baseTheme.palette && typeof baseTheme.palette === "object" ? baseTheme.palette : {};
  const inputPalette = inputTheme.palette && typeof inputTheme.palette === "object" ? inputTheme.palette : {};
  const primary = String(inputPalette.primary || inputTheme.primaryColor || basePalette.primary || "#4F77FF");
  const accent = String(inputPalette.accent || primary || basePalette.accent || "#F46E35");
  return {
    ...baseTheme,
    ...inputTheme,
    palette: {
      bg: String(inputPalette.bg || basePalette.bg || "#F3F3EF"),
      text: String(inputPalette.text || basePalette.text || "#111111"),
      primary,
      accent,
      neutral: String(inputPalette.neutral || basePalette.neutral || "#E5E7EB"),
      textSecondary: String(inputPalette.textSecondary || basePalette.textSecondary || "#4B5563"),
    },
    fontHeading: String(inputTheme.fontHeading || baseTheme.fontHeading || "Inter"),
    fontBody: String(inputTheme.fontBody || baseTheme.fontBody || inputTheme.fontHeading || baseTheme.fontHeading || "Inter"),
  };
};

const buildThemeCssVars = (themeInput = null) => {
  const resolvedTheme = resolveThemePalette(themeInput);
  const palette = resolvedTheme.palette || {};
  const inverseSurface = isThemeDarkColor(palette.text) ? palette.text : palette.primary;
  return {
    "--pen-theme-bg": palette.bg,
    "--pen-theme-text": palette.text,
    "--pen-theme-primary": palette.primary,
    "--pen-theme-accent": palette.accent,
    "--pen-theme-neutral": palette.neutral,
    "--pen-theme-text-secondary": palette.textSecondary,
    "--pen-theme-on-primary": pickThemeContrastColor(palette.primary),
    "--pen-theme-on-accent": pickThemeContrastColor(palette.accent),
    "--pen-theme-inverse-surface": inverseSurface,
    "--pen-theme-on-inverse": pickThemeContrastColor(inverseSurface),
    "--pen-font-heading": resolvedTheme.fontHeading,
    "--pen-font-body": resolvedTheme.fontBody,
  };
};

const normalizeNavPath = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  if (/^(?:mailto:|tel:|javascript:|data:)/i.test(raw)) return "";
  if (raw.startsWith("#")) return "/";
  try {
    const parsed = new URL(raw, "https://template.local");
    let pathname = String(parsed.pathname || "/").replace(/\/+/g, "/");
    if (pathname !== "/") pathname = pathname.replace(/\/+$/g, "");
    return pathname || "/";
  } catch {
    return "/";
  }
};

const normalizePreviewPagePath = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw || raw === "home" || raw === "index") return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
};

const resolveRuntimeCurrentPath = (merged, pathname, searchParams) => {
  const explicitPath = String(merged?.currentPath || "").trim();
  if (explicitPath) return explicitPath;
  const pageParamRaw = String(searchParams?.get?.("page") || "").trim();
  if (pageParamRaw) return normalizePreviewPagePath(pageParamRaw);
  return pathname || "/";
};

const isHeadingLikeTextNode = (node) => {
  const lowerName = String(node?.name || "").trim().toLowerCase();
  if (/(title|headline|hero|eyebrow|heading)/.test(lowerName)) return true;
  return resolveFontSize(node?.style?.fontSize) >= 22;
};

const getNodeNameToken = (node) => String(node?.name || "").trim().toLowerCase();

const shouldApplyStoryTrackMotion = () => false;

const shouldApplyStoryCardHover = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "story") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  const name = getNodeNameToken(node);
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  return /(?:card|cards|grid|tile)/.test(name) && childCount > 0;
};

const shouldApplyStoryCardFloat = () => false;

const shouldApplyProductsCardHover = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "products") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  const name = getNodeNameToken(node);
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  const borderToken = String(node?.style?.border || "").trim();
  const borderLike = /(?:^|\s)(?:\d+(?:\.\d+)?)px\s/.test(borderToken);
  return /(?:productcard|product-card|card|tile|panel)/.test(name) && childCount > 0 && borderLike;
};

const resolveThemeColorSlot = (rawColor, propName, node, parentNode, keyPath, sectionKindToken) => {
  const propToken = String(propName || "").trim().toLowerCase();
  const nodeName = getNodeNameToken(node);
  const parentName = getNodeNameToken(parentNode);
  const isRoot = keyPath === "root";
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
    if (isThemeNeutralColor(rawColor)) return "bg";
    return isThemeDarkColor(rawColor) ? "primary" : "neutral";
  }

  if (isBackgroundProp) {
    if (buttonLike) return "accent";
    if (sectionKindToken === "footer") return "inverse-surface";
    if (sectionKindToken === "navigation") return "bg";
    if (isThemeNeutralColor(rawColor)) return "neutral";
    return isThemeDarkColor(rawColor) ? "primary" : "accent";
  }

  if (isTextProp) {
    if (buttonLike) return "on-accent";
    if (sectionKindToken === "footer") return "on-inverse";
    if (sectionKindToken === "hero" && !/label|caption|meta|legal/.test(nodeName)) return "on-primary";
    if (sectionKindToken === "navigation") {
      if (/logo/.test(nodeName)) return "text";
      return "text-secondary";
    }
    if (isThemeDarkColor(rawColor)) return "text";
    if (isThemeNeutralColor(rawColor)) return "text-secondary";
    return "on-primary";
  }

  if (isBorderProp) {
    if (buttonLike) return "accent";
    return "neutral";
  }

  return null;
};

const applyThemeToStyleValue = (rawValue, propName, node, parentNode, keyPath, sectionKindToken) => {
  if (typeof rawValue !== "string" || !/#(?:[0-9a-f]{3}|[0-9a-f]{6})/i.test(rawValue)) return rawValue;
  return rawValue.replace(/#(?:[0-9a-f]{3}|[0-9a-f]{6})/gi, (match) => {
    const slot = resolveThemeColorSlot(match, propName, node, parentNode, keyPath, sectionKindToken);
    if (!slot) return match;
    return `var(--pen-theme-${slot}, ${match})`;
  });
};

const buildNodeClassName = (node, sectionMotion, sectionKindToken) => {
  if (!sectionMotion || sectionMotion.level === "off") return "";
  const classes = [];
  if (node?.hrefProp) classes.push("hover-lift");
  if (node?.type === "frame" && node?.imageProp) classes.push("will-change-transform");
  if (shouldApplyStoryCardHover(node, sectionKindToken)) classes.push("hover-lift");
  if (shouldApplyProductsCardHover(node, sectionKindToken)) classes.push("pen-product-card-hover");
  if (shouldApplyStoryTrackMotion(node, sectionKindToken)) classes.push("will-change-transform", "pen-track-slide");
  return classes.join(" ");
};

const resolveResponsiveFixedWidth = (rawWidth) => {
  const numericWidth = resolveNumericDimension(rawWidth);
  if (!(Number.isFinite(numericWidth) && numericWidth > 0)) return null;
  if (numericWidth < 360) return null;
  return `min(100%, ${Math.round(numericWidth)}px)`;
};

const shouldConvertRowFillToFlex = (parentNode, childIndex, style) => {
  const parentDirection = String(parentNode?.style?.flexDirection || "").trim().toLowerCase();
  if (parentDirection !== "row") return false;
  const currentWidth = String(style?.width || "").trim();
  if (currentWidth !== "100%") return false;
  if (style?.flex) return false;
  const siblings = Array.isArray(parentNode?.children) ? parentNode.children : [];
  return siblings.some((sibling, siblingIndex) => {
    if (siblingIndex === childIndex) return false;
    return resolveNumericDimension(sibling?.style?.width) > 0;
  });
};

const buildNodeStyle = (
  node,
  merged,
  sectionMotion,
  sectionKindToken,
  keyPath,
  currentPathToken = "/",
  parentNode = null,
  childIndex = 0
) => {
  const style = { ...(node?.style || {}) };
  for (const [styleKey, styleValue] of Object.entries(style)) {
    if (styleKey === "fontFamily" && typeof styleValue === "string" && styleValue.trim()) {
      style[styleKey] = isHeadingLikeTextNode(node)
        ? "var(--pen-font-heading, " + styleValue + ")"
        : "var(--pen-font-body, " + styleValue + ")";
      continue;
    }
    style[styleKey] = applyThemeToStyleValue(styleValue, styleKey, node, parentNode, keyPath, sectionKindToken);
  }
  const rawHref = node?.hrefProp ? String(merged?.[node.hrefProp] || "").trim() : "";
  if (keyPath === "root") {
    const rawRootWidth = style?.width;
    const shouldNormalizeRootWidth =
      (typeof rawRootWidth === "number" && Number.isFinite(rawRootWidth) && rawRootWidth > 0) ||
      (typeof rawRootWidth === "string" && /^\d+(?:\.\d+)?$/.test(rawRootWidth.trim()));
    if (shouldNormalizeRootWidth) {
      const numericRootWidth = Number(rawRootWidth);
      style.maxWidth = style.maxWidth || numericRootWidth;
      style.width = "100%";
      style.marginLeft = style.marginLeft || "auto";
      style.marginRight = style.marginRight || "auto";
    }
    const rootDirection = String(style?.flexDirection || "").trim().toLowerCase();
    if (rootDirection === "row" && sectionKindToken !== "navigation" && sectionKindToken !== "footer") {
      style.flexWrap = style.flexWrap || "wrap";
    }
  }
  if (keyPath !== "root" && !style.maxWidth) {
    const responsiveFixedWidth = resolveResponsiveFixedWidth(style?.width);
    if (responsiveFixedWidth) {
      style.width = responsiveFixedWidth;
    }
  }
  if (shouldConvertRowFillToFlex(parentNode, childIndex, style)) {
    style.width = "auto";
    style.flex = style.flex || "1 1 0";
    if (typeof style.minWidth === "undefined") style.minWidth = 0;
  }
  if (node?.imageProp) {
    const src = String(merged?.[node.imageProp] || "").trim();
    if (src) {
      style.backgroundImage = `url(${src})`;
    }
  }
  if (rawHref) {
    style.textDecoration = style.textDecoration || "none";
    if (!style.color) style.color = "inherit";
    if (node?.type === "frame" && !style.display) {
      style.display = "inline-block";
    }
  }
  if (sectionKindToken === "navigation" && node?.type === "text" && rawHref) {
    const hrefPathToken = normalizeNavPath(rawHref);
    const isActiveNavItem = Boolean(hrefPathToken) && hrefPathToken === currentPathToken;
    style.color = isActiveNavItem ? NAV_ACTIVE_COLOR : NAV_INACTIVE_COLOR;
    if (isActiveNavItem) {
      style.fontWeight = style.fontWeight || "600";
    } else if (typeof style.opacity === "undefined") {
      style.opacity = 0.96;
    }
  }
  const motionLevel = sectionMotion?.level || "off";
  if (motionLevel !== "off") {
    const delayMs = resolveDelayMs(keyPath, sectionMotion);
    style.transition = style.transition || "opacity 560ms var(--ease-smooth), transform 560ms var(--ease-smooth), box-shadow 300ms var(--ease-smooth)";
    if (delayMs > 0) style.transitionDelay = style.transitionDelay || `${delayMs}ms`;
    if (
      Boolean(sectionMotion?.mediaBreathe) &&
      node?.imageProp &&
      !style.animation &&
      (!style.transform || String(style.transform).trim() === "")
    ) {
      style.animation = "pen-media-breathe 8s var(--ease-smooth, ease) infinite";
      style.transformOrigin = style.transformOrigin || "50% 50%";
    }
    if (shouldApplyStoryTrackMotion(node, sectionKindToken) && !style.animation) {
      const animationName = motionLevel === "showcase" ? "pen-track-slide-x-showcase" : "pen-track-slide-x-subtle";
      const duration = motionLevel === "showcase" ? "10s" : "14s";
      style.animation = `${animationName} ${duration} var(--ease-smooth, ease-in-out) infinite`;
      style.willChange = style.willChange || "transform";
      style.transformOrigin = style.transformOrigin || "center center";
    }
    if (shouldApplyStoryCardFloat(node, sectionKindToken) && !style.animation) {
      const duration = motionLevel === "showcase" ? "4.2s" : "5.6s";
      style.animation = `pen-card-float ${duration} var(--ease-smooth, ease-in-out) infinite`;
      style.willChange = style.willChange || "transform";
      style.transformOrigin = style.transformOrigin || "50% 55%";
    }
    if (Boolean(sectionMotion?.contentStagger)) {
      // Keep static visual fidelity: stagger only via transition delay, not enter keyframes.
      if (delayMs > 0) style.transitionDelay = style.transitionDelay || `${delayMs}ms`;
    }
  }
  return style;
};

const renderTextContent = (node, merged, keyPath, sectionMotion) => {
  const textValue = String(merged?.[node?.textProp] ?? "");
  if (!textValue || !sectionMotion || sectionMotion.level === "off") return textValue;
  if (!sectionMotion.textReveal) return textValue;
  if (!isHeadingLikeTextNode(node)) return textValue;
  return React.createElement(
    TextReveal,
    {
      as: "span",
      className: "inline-block",
      delayMs: resolveDelayMs(keyPath, sectionMotion),
    },
    textValue
  );
};

const renderNode = (
  node,
  merged,
  sectionMotion,
  sectionKindToken,
  key = "root",
  ancestorHasLink = false,
  currentPathToken = "/",
  parentNode = null,
  childIndex = 0
) => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(
    node,
    merged,
    sectionMotion,
    sectionKindToken,
    key,
    currentPathToken,
    parentNode,
    childIndex
  );
  const className = buildNodeClassName(node, sectionMotion, sectionKindToken) || undefined;
  const href = node?.hrefProp ? String(merged?.[node.hrefProp] || "").trim() : "";
  const shouldRenderLink = Boolean(href) && !ancestorHasLink;
  if (node.type === "icon_font") {
    const Icon = node?.iconName ? ICONS[node.iconName] : null;
    if (Icon) {
      return React.createElement(Icon, {
        key,
        className,
        style,
        "data-pen-node": node.id || undefined,
      });
    }
    return React.createElement(
      "span",
      {
        key,
        className,
        style,
        "data-pen-node": node.id || undefined,
      },
      String(node?.iconGlyph || "")
    );
  }
  if (node.type === "text") {
    const Tag = shouldRenderLink ? "a" : "div";
    return React.createElement(
      Tag,
      {
        key,
        href: shouldRenderLink ? href : undefined,
        className,
        style,
        "data-pen-node": node.id || undefined,
      },
      renderTextContent(node, merged, key, sectionMotion)
    );
  }
  const Tag = shouldRenderLink ? "a" : "div";
  return React.createElement(
    Tag,
    {
      key,
      href: shouldRenderLink ? href : undefined,
      className,
      style,
      "data-pen-node": node.id || undefined,
    },
    ...(Array.isArray(node.children)
      ? node.children.map((child, index) =>
          renderNode(
            child,
            merged,
            sectionMotion,
            sectionKindToken,
            `${key}-${index}`,
            ancestorHasLink || shouldRenderLink,
            currentPathToken,
            node,
            index
          )
        )
      : [])
  );
};

export default function TemplateExclusivePenSiteHomeFooterFooterpenAlt8({ id, footerlogoimagesrc, footercompanytext, footercompanyhref, footeraddresstext, footeraddresshref, footercontacttext, footercontacthref, col1titletext, col1titlehref, col1texttext, col1texthref, col2titletext, col2titlehref, col2texttext, col2texthref, col3titletext, col3titlehref, col3texttext, col3texthref, col4titletext, col4titlehref, col4texttext, col4texthref, langtexttext, langtexthref, footercopytext, footercopyhref, mappintext, mappinhref, maptexttext, maptexthref, col2subtitletext, col2subtitlehref, col2subtexttext, col2subtexthref, langzhtext, langzhhref, social1icontext, social1iconhref, social2icontext, social2iconhref, social3icontext, social3iconhref, social4icontext, social4iconhref, stripelogoimagesrc, stripetexttext, stripetexthref, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, footerlogoimagesrc, footercompanytext, footercompanyhref, footeraddresstext, footeraddresshref, footercontacttext, footercontacthref, col1titletext, col1titlehref, col1texttext, col1texthref, col2titletext, col2titlehref, col2texttext, col2texthref, col3titletext, col3titlehref, col3texttext, col3texthref, col4titletext, col4titlehref, col4texttext, col4texthref, langtexttext, langtexthref, footercopytext, footercopyhref, mappintext, mappinhref, maptexttext, maptexthref, col2subtitletext, col2subtitlehref, col2subtexttext, col2subtexthref, langzhtext, langzhhref, social1icontext, social1iconhref, social2icontext, social2iconhref, social3icontext, social3iconhref, social4icontext, social4iconhref, stripelogoimagesrc, stripetexttext, stripetexthref });
  assignDefined(merged, rest);
  const runtimeCurrentPath = resolveRuntimeCurrentPath(merged, pathname, searchParams);
  const currentPathToken = normalizeNavPath(runtimeCurrentPath || "/");
  const effectiveMotionMode = resolveMotionMode(providerMotionMode, merged?.motionMode);
  const sectionKindToken = String(SECTION_KIND || "").trim().toLowerCase();
  const sectionMotion = resolveSectionMotionProfile(sectionKindToken, effectiveMotionMode);
  const reveal = useInViewReveal({
    preset: sectionMotion?.revealPreset === "fadeIn" ? "fadeIn" : "stagger",
    once: true,
    enabled: sectionMotion?.level !== "off",
  });
  const sectionClassName = sectionMotion?.level === "off"
    ? "w-full"
    : ["w-full", reveal.className].filter(Boolean).join(" ");
  const sectionStyle = sectionMotion?.level === "off" ? undefined : reveal.style;
  const layoutStyle: React.CSSProperties = {
    boxSizing: "border-box",
  };
  const pageWidth = Number(LAYOUT_CONTEXT?.pageWidth || 0);
  const pagePaddingLeft = Number(LAYOUT_CONTEXT?.pagePaddingLeft || 0);
  const pagePaddingRight = Number(LAYOUT_CONTEXT?.pagePaddingRight || 0);
  const pagePaddingTop = Number(LAYOUT_CONTEXT?.pagePaddingTop || 0);
  const pagePaddingBottom = Number(LAYOUT_CONTEXT?.pagePaddingBottom || 0);
  const sectionGapAfter = Number(LAYOUT_CONTEXT?.sectionGapAfter || 0);
  if (Number.isFinite(pageWidth) && pageWidth > 0) {
    layoutStyle.width = "100%";
    layoutStyle.maxWidth = pageWidth;
    layoutStyle.marginLeft = "auto";
    layoutStyle.marginRight = "auto";
  }
  const responsiveEdgePadding = (value) => {
    if (!(Number.isFinite(value) && value > 0)) return 0;
    const safeValue = Math.round(value);
    const safeWidth = Number.isFinite(pageWidth) && pageWidth > 0 ? pageWidth : 0;
    if (safeWidth > 0) {
      const ratioVw = Math.max(1.4, Math.min(6.8, (safeValue / safeWidth) * 100));
      const minPx = Math.max(12, Math.min(24, Math.round(safeValue * 0.35)));
      return `clamp(${minPx}px, ${ratioVw.toFixed(3)}vw, ${safeValue}px)`;
    }
    return safeValue;
  };
  if (Number.isFinite(pagePaddingLeft) && pagePaddingLeft > 0) layoutStyle.paddingLeft = responsiveEdgePadding(pagePaddingLeft);
  if (Number.isFinite(pagePaddingRight) && pagePaddingRight > 0) layoutStyle.paddingRight = responsiveEdgePadding(pagePaddingRight);
  if (Number.isFinite(pagePaddingTop) && pagePaddingTop > 0) layoutStyle.paddingTop = pagePaddingTop;
  if (Number.isFinite(pagePaddingBottom) && pagePaddingBottom > 0) layoutStyle.paddingBottom = pagePaddingBottom;
  if (Number.isFinite(sectionGapAfter) && sectionGapAfter > 0) layoutStyle.marginBottom = sectionGapAfter;
  const themeVars = buildThemeCssVars(merged?.theme);
  const mergedSectionStyle = sectionStyle ? { ...layoutStyle, ...themeVars, ...sectionStyle } : { ...layoutStyle, ...themeVars };
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": SECTION_KIND,
      className: sectionClassName,
      style: mergedSectionStyle,
      ref: sectionMotion?.level === "off" ? undefined : reveal.ref,
    },
    ...(sectionMotion?.level !== "off"
      ? [React.createElement("style", { key: "pen-motion-style" }, PEN_RUNTIME_MOTION_STYLE)]
      : []),
    renderNode(SECTION_TREE, merged, sectionMotion, sectionKindToken, "root", false, currentPathToken)
  );
}