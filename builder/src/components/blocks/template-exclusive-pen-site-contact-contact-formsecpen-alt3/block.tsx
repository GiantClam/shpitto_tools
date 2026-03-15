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

const SECTION_KIND = "contact";
const SECTION_TREE = {
  "type": "frame",
  "id": "ngYuv",
  "name": "formSec",
  "style": {
    "boxSizing": "border-box",
    "width": 1440,
    "height": 1510,
    "background": "#FFFFFF",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "frame",
      "id": "B5lSQ",
      "name": "leftCol",
      "style": {
        "boxSizing": "border-box",
        "width": 760,
        "height": 1345,
        "background": "#FFFFFF",
        "position": "absolute",
        "overflow": "hidden",
        "left": 56,
        "top": 80
      },
      "children": [
        {
          "type": "text",
          "id": "Y3Whv",
          "name": "f1l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B5565",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "textProp": "f1ltext"
        },
        {
          "type": "rectangle",
          "id": "DhwIy",
          "name": "f1",
          "style": {
            "boxSizing": "border-box",
            "width": 720,
            "height": 44,
            "background": "#F3F5F8",
            "position": "absolute",
            "left": 0,
            "top": 26
          },
          "children": []
        },
        {
          "type": "text",
          "id": "DiM88",
          "name": "f2l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B5565",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 86
          },
          "children": [],
          "textProp": "f2ltext"
        },
        {
          "type": "rectangle",
          "id": "AkL7p",
          "name": "f2",
          "style": {
            "boxSizing": "border-box",
            "width": 720,
            "height": 44,
            "background": "#F3F5F8",
            "position": "absolute",
            "left": 0,
            "top": 112
          },
          "children": []
        },
        {
          "type": "text",
          "id": "q9kSy",
          "name": "f3l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B5565",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 172
          },
          "children": [],
          "textProp": "f3ltext"
        },
        {
          "type": "rectangle",
          "id": "x55sS",
          "name": "f3",
          "style": {
            "boxSizing": "border-box",
            "width": 720,
            "height": 44,
            "background": "#F3F5F8",
            "position": "absolute",
            "left": 0,
            "top": 198
          },
          "children": []
        },
        {
          "type": "text",
          "id": "wIbjM",
          "name": "f4l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B5565",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 258
          },
          "children": [],
          "textProp": "f4ltext"
        },
        {
          "type": "rectangle",
          "id": "NsAGF",
          "name": "f4",
          "style": {
            "boxSizing": "border-box",
            "width": 720,
            "height": 44,
            "background": "#F3F5F8",
            "position": "absolute",
            "left": 0,
            "top": 284
          },
          "children": []
        },
        {
          "type": "text",
          "id": "xIspZ",
          "name": "f5l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B5565",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 344
          },
          "children": [],
          "textProp": "f5ltext"
        },
        {
          "type": "rectangle",
          "id": "oyjoM",
          "name": "f5",
          "style": {
            "boxSizing": "border-box",
            "width": 720,
            "height": 44,
            "background": "#F3F5F8",
            "position": "absolute",
            "left": 0,
            "top": 370
          },
          "children": []
        },
        {
          "type": "text",
          "id": "zQJNi",
          "name": "f6l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B5565",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 430
          },
          "children": [],
          "textProp": "f6ltext"
        },
        {
          "type": "rectangle",
          "id": "t0QBO",
          "name": "f6",
          "style": {
            "boxSizing": "border-box",
            "width": 720,
            "height": 44,
            "background": "#F3F5F8",
            "position": "absolute",
            "left": 0,
            "top": 456
          },
          "children": []
        },
        {
          "type": "text",
          "id": "sXi1E",
          "name": "f7l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B5565",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 516
          },
          "children": [],
          "textProp": "f7ltext"
        },
        {
          "type": "rectangle",
          "id": "LIyIU",
          "name": "f7",
          "style": {
            "boxSizing": "border-box",
            "width": 720,
            "height": 44,
            "background": "#F3F5F8",
            "position": "absolute",
            "left": 0,
            "top": 542
          },
          "children": []
        },
        {
          "type": "text",
          "id": "LCvug",
          "name": "f8l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B5565",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 602
          },
          "children": [],
          "textProp": "f8ltext"
        },
        {
          "type": "rectangle",
          "id": "PVnag",
          "name": "f8",
          "style": {
            "boxSizing": "border-box",
            "width": 720,
            "height": 44,
            "background": "#F3F5F8",
            "position": "absolute",
            "left": 0,
            "top": 628
          },
          "children": []
        },
        {
          "type": "text",
          "id": "4Iz9J",
          "name": "commentL",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B5565",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 688
          },
          "children": [],
          "textProp": "commentltext"
        },
        {
          "type": "rectangle",
          "id": "yvFkk",
          "name": "commentBox",
          "style": {
            "boxSizing": "border-box",
            "width": 720,
            "height": 120,
            "background": "#F3F5F8",
            "position": "absolute",
            "left": 0,
            "top": 714
          },
          "children": []
        },
        {
          "type": "text",
          "id": "ganCP",
          "name": "checkT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B5565",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "500",
            "lineHeight": 1.55,
            "width": 720,
            "position": "absolute",
            "left": 0,
            "top": 856
          },
          "children": [],
          "textProp": "checkttext"
        },
        {
          "type": "rectangle",
          "id": "KxOcu",
          "name": "submit",
          "style": {
            "boxSizing": "border-box",
            "width": 84,
            "height": 32,
            "borderRadius": 3,
            "background": "#FFFFFF",
            "border": "1px solid #9AA6BA",
            "position": "absolute",
            "left": 0,
            "top": 1074
          },
          "children": []
        },
        {
          "type": "text",
          "id": "Ppp8I",
          "name": "submitT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2A313C",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "position": "absolute",
            "left": 21,
            "top": 1082
          },
          "children": [],
          "textProp": "submitttext"
        },
        {
          "type": "frame",
          "id": "3by5J",
          "name": "offBlock",
          "style": {
            "boxSizing": "border-box",
            "width": 524,
            "height": 783,
            "background": "#101722",
            "position": "absolute",
            "overflow": "hidden",
            "left": 805,
            "top": 564
          },
          "children": [
            {
              "type": "text",
              "id": "PLMh0",
              "name": "offTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Inter",
                "fontSize": 42,
                "fontWeight": "500",
                "position": "absolute",
                "left": 40,
                "top": 68
              },
              "children": [],
              "textProp": "offtitletext"
            },
            {
              "type": "text",
              "id": "nVz8K",
              "name": "redT",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Inter",
                "fontSize": 26,
                "fontWeight": "600",
                "position": "absolute",
                "left": 40,
                "top": 140
              },
              "children": [],
              "textProp": "redttext"
            },
            {
              "type": "text",
              "id": "OL2zU",
              "name": "redD",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C0CEE8",
                "fontFamily": "Inter",
                "fontSize": 18,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 396,
                "position": "absolute",
                "left": 40,
                "top": 176
              },
              "children": [],
              "textProp": "reddtext"
            },
            {
              "type": "text",
              "id": "6qp5z",
              "name": "mcT",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Inter",
                "fontSize": 26,
                "fontWeight": "600",
                "position": "absolute",
                "left": 40,
                "top": 346
              },
              "children": [],
              "textProp": "mcttext"
            },
            {
              "type": "text",
              "id": "GGgUe",
              "name": "mcD",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C0CEE8",
                "fontFamily": "Inter",
                "fontSize": 18,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 396,
                "position": "absolute",
                "left": 40,
                "top": 382
              },
              "children": [],
              "textProp": "mcdtext"
            },
            {
              "type": "text",
              "id": "DW81F",
              "name": "wdT",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Inter",
                "fontSize": 26,
                "fontWeight": "600",
                "position": "absolute",
                "left": 40,
                "top": 552
              },
              "children": [],
              "textProp": "wdttext"
            },
            {
              "type": "text",
              "id": "OJKYZ",
              "name": "wdD",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C0CEE8",
                "fontFamily": "Inter",
                "fontSize": 18,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 396,
                "position": "absolute",
                "left": 40,
                "top": 588
              },
              "children": [],
              "textProp": "wddtext"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "Mu0vE",
      "name": "rightCol",
      "style": {
        "boxSizing": "border-box",
        "width": 524,
        "height": 553,
        "background": "#090D15",
        "position": "absolute",
        "overflow": "hidden",
        "left": 860,
        "top": 80
      },
      "children": [
        {
          "type": "text",
          "id": "d25q6",
          "name": "infoTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Inter",
            "fontSize": 42,
            "fontWeight": "500",
            "position": "absolute",
            "left": 40,
            "top": 42
          },
          "children": [],
          "textProp": "infotitletext"
        },
        {
          "type": "text",
          "id": "0b6Ya",
          "name": "salesT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Inter",
            "fontSize": 26,
            "fontWeight": "600",
            "position": "absolute",
            "left": 40,
            "top": 142
          },
          "children": [],
          "textProp": "salesttext"
        },
        {
          "type": "text",
          "id": "nO252",
          "name": "salesL",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#B8C7E6",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "600",
            "position": "absolute",
            "left": 40,
            "top": 182
          },
          "children": [],
          "textProp": "salesltext"
        },
        {
          "type": "text",
          "id": "cnK8t",
          "name": "trainT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Inter",
            "fontSize": 26,
            "fontWeight": "600",
            "position": "absolute",
            "left": 40,
            "top": 236
          },
          "children": [],
          "textProp": "trainttext"
        },
        {
          "type": "text",
          "id": "2PrTy",
          "name": "trainL",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#B8C7E6",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "600",
            "position": "absolute",
            "left": 40,
            "top": 276
          },
          "children": [],
          "textProp": "trainltext"
        },
        {
          "type": "text",
          "id": "sHJsf",
          "name": "supT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Inter",
            "fontSize": 26,
            "fontWeight": "600",
            "position": "absolute",
            "left": 40,
            "top": 332
          },
          "children": [],
          "textProp": "supttext"
        },
        {
          "type": "text",
          "id": "h1hnk",
          "name": "supL",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#B8C7E6",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "600",
            "position": "absolute",
            "left": 40,
            "top": 372
          },
          "children": [],
          "textProp": "supltext"
        },
        {
          "type": "text",
          "id": "tKpbf",
          "name": "mediaT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Inter",
            "fontSize": 26,
            "fontWeight": "600",
            "position": "absolute",
            "left": 40,
            "top": 428
          },
          "children": [],
          "textProp": "mediattext"
        },
        {
          "type": "text",
          "id": "4chY0",
          "name": "mediaL",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#B8C7E6",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "600",
            "position": "absolute",
            "left": 40,
            "top": 468
          },
          "children": [],
          "textProp": "medialtext"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "ngYuv",
  "f1ltext": "First Name *",
  "f2ltext": "Last Name *",
  "f3ltext": "Business Email *",
  "f4ltext": "Region *",
  "f5ltext": "Country *",
  "f6ltext": "Company Name *",
  "f7ltext": "Job Title *",
  "f8ltext": "Business Phone *",
  "commentltext": "How can we help? *",
  "checkttext": "Area of key focus about us? *\n☐ Business New Inquiries    \n☐ Military & Government\n☐ Product Inquiries         \n☐ Existing Customer\n☐ Connectivity Services     \n☐ Partner",
  "submitttext": "Submit",
  "offtitletext": "Offices",
  "redttext": "Redmond",
  "reddtext": "Kymeta Corporation\n12277 134th Court NE\nRedmond, WA 98052\nUnited States",
  "mcttext": "McLean",
  "mcdtext": "Kymeta Government and Defense\n2000 Corporate Ridge Rd, Suite 525\nMcLean, VA 22102\nUnited States",
  "wdttext": "Woodinville",
  "wddtext": "Kymeta Corporation\n14120 NE 200th St\nWoodinville, WA 98072\nUnited States",
  "infotitletext": "Contact information",
  "salesttext": "Sales",
  "salesltext": "sales@kymetacorp.com",
  "trainttext": "Training",
  "trainltext": "training@kymetacorp.com",
  "supttext": "Service & Support",
  "supltext": "support@kymetacorp.com",
  "mediattext": "Media inquiries",
  "medialtext": "media@kymetacorp.com"
};
const DEFAULT_THEME = {
  "mode": "light",
  "fontHeading": "Inter",
  "fontBody": "Inter",
  "motion": "subtle",
  "fontFamilies": [
    "Inter"
  ],
  "palette": {
    "bg": "#FFFFFF",
    "text": "#FFFFFF",
    "primary": "#FFFFFF",
    "accent": "#FFFFFF",
    "neutral": "#E5E7EB",
    "textSecondary": "#4B5563"
  },
  "primaryColor": "#FFFFFF",
  "layoutRules": {
    "maxWidth": "1400px",
    "sectionPadding": "py-24",
    "grid": "12-col"
  },
  "tokens": {
    "surface": "solid",
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
const NAV_ACTIVE_COLOR = "var(--pen-theme-text, #0D6E6E)";
const NAV_INACTIVE_COLOR = "var(--pen-theme-text-secondary, #888888)";
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

export default function TemplateExclusivePenSiteContactContactFormsecpenAlt3({ id, f1ltext, f2ltext, f3ltext, f4ltext, f5ltext, f6ltext, f7ltext, f8ltext, commentltext, checkttext, submitttext, offtitletext, redttext, reddtext, mcttext, mcdtext, wdttext, wddtext, infotitletext, salesttext, salesltext, trainttext, trainltext, supttext, supltext, mediattext, medialtext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, f1ltext, f2ltext, f3ltext, f4ltext, f5ltext, f6ltext, f7ltext, f8ltext, commentltext, checkttext, submitttext, offtitletext, redttext, reddtext, mcttext, mcdtext, wdttext, wddtext, infotitletext, salesttext, salesltext, trainttext, trainltext, supttext, supltext, mediattext, medialtext });
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