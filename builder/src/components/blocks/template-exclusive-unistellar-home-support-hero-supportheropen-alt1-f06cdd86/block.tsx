// @ts-nocheck
"use client";

import React from "react";
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

const SECTION_KIND = "hero";
const SECTION_TREE = {
  "type": "frame",
  "id": "HgVkZ",
  "name": "Support Hero",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 32,
    "padding": "72px 72px 56px 72px",
    "width": "100%",
    "height": 680,
    "background": "linear-gradient(180deg, #13203A 0%, #060A14 100%)"
  },
  "children": [
    {
      "type": "frame",
      "id": "wMKok",
      "name": "heroTop",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 36,
        "width": "100%",
        "height": 468
      },
      "children": [
        {
          "type": "frame",
          "id": "PBzRm",
          "name": "heroLeft",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 18,
            "justifyContent": "center",
            "width": "100%",
            "height": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "gNYMv",
              "name": "heroEyebrow",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 10,
                "alignItems": "center",
                "width": 360,
                "height": 16
              },
              "children": [
                {
                  "type": "frame",
                  "id": "ET2zN",
                  "name": "eyebrowLine",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 32,
                    "height": 2,
                    "background": "#2B67F6"
                  },
                  "children": []
                },
                {
                  "type": "text",
                  "id": "6J0h1",
                  "name": "eyebrowLabel",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8DA0C2",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1.8
                  },
                  "children": [],
                  "textProp": "eyebrowlabeltext"
                }
              ]
            },
            {
              "type": "text",
              "id": "LUyS4",
              "name": "heroTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 62,
                "fontWeight": "700",
                "letterSpacing": -1.4,
                "lineHeight": 1,
                "width": "100%"
              },
              "children": [],
              "textProp": "herotitletext"
            },
            {
              "type": "text",
              "id": "VFsiN",
              "name": "heroSub",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#A7B3CC",
                "fontFamily": "Manrope",
                "fontSize": 16,
                "lineHeight": 1.42,
                "width": 600
              },
              "children": [],
              "textProp": "herosubtext"
            },
            {
              "type": "frame",
              "id": "GeIhn",
              "name": "heroSearch",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "space-between",
                "alignItems": "center",
                "padding": "0px 18px",
                "width": 640,
                "height": 54,
                "borderRadius": 8,
                "background": "#09111F",
                "border": "1px solid #22324A"
              },
              "children": [
                {
                  "type": "text",
                  "id": "AyPbm",
                  "name": "searchPrompt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7E8CA8",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "searchprompttext"
                },
                {
                  "type": "frame",
                  "id": "SyMlR",
                  "name": "searchBadge",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 98,
                    "height": 28,
                    "borderRadius": 999,
                    "background": "#152746"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "HEBHg",
                      "name": "searchBadgeText",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#E5ECFB",
                        "fontFamily": "Manrope",
                        "fontSize": 10,
                        "fontWeight": "700",
                        "letterSpacing": 1
                      },
                      "children": [],
                      "textProp": "searchbadgetexttext"
                    }
                  ]
                }
              ]
            },
            {
              "type": "frame",
              "id": "Pois7",
              "name": "heroMeta",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 18,
                "alignItems": "center",
                "width": 620,
                "height": 18
              },
              "children": [
                {
                  "type": "text",
                  "id": "MLngq",
                  "name": "metaA",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#E5ECFB",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "metaatext"
                },
                {
                  "type": "text",
                  "id": "of3Lq",
                  "name": "metaB",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8DA0C2",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "metabtext"
                },
                {
                  "type": "text",
                  "id": "bRrwt",
                  "name": "metaC",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8DA0C2",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "metactext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "HLyDJ",
          "name": "heroRight",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "padding": "22px",
            "width": 420,
            "height": "100%",
            "borderRadius": 12,
            "background": "#09111F",
            "border": "1px solid #22324A"
          },
          "children": [
            {
              "type": "frame",
              "id": "H4fe1",
              "name": "rightTop",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "AD1Dl",
                  "name": "rightLabel",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8DA0C2",
                    "fontFamily": "Manrope",
                    "fontSize": 10,
                    "fontWeight": "700",
                    "letterSpacing": 1.5
                  },
                  "children": [],
                  "textProp": "rightlabeltext"
                },
                {
                  "type": "text",
                  "id": "vRbcJ",
                  "name": "rightTitle",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 24,
                    "fontWeight": "700",
                    "letterSpacing": -0.5,
                    "lineHeight": 1.15,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "righttitletext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "rGGSW",
              "name": "lane1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "padding": "16px",
                "width": "100%",
                "height": 108,
                "borderRadius": 10,
                "background": "#111826",
                "border": "1px solid #2A2F45"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Yr9lP",
                  "name": "t1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "t1text"
                },
                {
                  "type": "text",
                  "id": "S3pLE",
                  "name": "d1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8A8A8A",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "lineHeight": 1.38,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "d1text"
                },
                {
                  "type": "text",
                  "id": "nDhn8",
                  "name": "foot1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8DA0C2",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "foot1text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "Kqasi",
              "name": "lane2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "padding": "16px",
                "width": "100%",
                "height": 108,
                "borderRadius": 10,
                "background": "#111826",
                "border": "1px solid #2A2F45"
              },
              "children": [
                {
                  "type": "text",
                  "id": "5RmZF",
                  "name": "t2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "t2text"
                },
                {
                  "type": "text",
                  "id": "RTy9G",
                  "name": "d2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8A8A8A",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "lineHeight": 1.38,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "d2text"
                },
                {
                  "type": "text",
                  "id": "IQy9q",
                  "name": "foot2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8DA0C2",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "foot2text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "WPH3c",
              "name": "lane3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "padding": "18px",
                "width": "100%",
                "height": 108,
                "borderRadius": 16,
                "background": "#13203A",
                "border": "1px solid #2A3C61"
              },
              "children": [
                {
                  "type": "text",
                  "id": "UUIbe",
                  "name": "t3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "t3text"
                },
                {
                  "type": "text",
                  "id": "y5lCH",
                  "name": "d3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#A7B3CC",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "lineHeight": 1.38,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "d3text"
                },
                {
                  "type": "text",
                  "id": "BQXfF",
                  "name": "foot3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#E5ECFB",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "foot3text"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "foSh6",
      "name": "heroBottom",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "alignItems": "center",
        "padding": "0px 24px",
        "width": "100%",
        "height": 56,
        "borderRadius": 12,
        "background": "#08111F",
        "border": "1px solid #1B2538"
      },
      "children": [
        {
          "type": "text",
          "id": "l1bBX",
          "name": "heroBottomText",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#A7B3CC",
            "fontFamily": "Manrope",
            "fontSize": 13,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "herobottomtexttext"
        },
        {
          "type": "text",
          "id": "ewtzD",
          "name": "heroBottomTag",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#8DA0C2",
            "fontFamily": "Manrope",
            "fontSize": 11,
            "fontWeight": "700",
            "letterSpacing": 1
          },
          "children": [],
          "textProp": "herobottomtagtext"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "HgVkZ",
  "eyebrowlabeltext": "SUPPORT MISSION CONTROL",
  "herotitletext": "Get back under the stars faster.",
  "herosubtext": "From first-night setup to transfer diagnostics, every support path is organized to get your telescope running with confidence.",
  "searchprompttext": "Search setup, connectivity, imaging, ownership and account help",
  "searchbadgetexttext": "SEARCH",
  "metaatext": "24h first-response target",
  "metabtext": "Weekly live onboarding",
  "metactext": "Step-by-step field guides",
  "rightlabeltext": "FASTEST PATHS",
  "righttitletext": "Choose the support lane that matches your moment.",
  "t1text": "First-light setup",
  "d1text": "Unboxing, alignment, firmware checks, and app pairing before your first session.",
  "foot1text": "Start with checklist",
  "t2text": "Image and tracking quality",
  "d2text": "Fix focus drift, field rotation, dew interruptions, and capture consistency in the field.",
  "foot2text": "Open imaging guides",
  "t3text": "Ownership and transfer",
  "d3text": "Coverage questions, account changes, and telescope transfer support for new owners.",
  "foot3text": "Review policy steps",
  "herobottomtexttext": "Support is structured around the three moments that matter most: launch, observe, and keep ownership seamless.",
  "herobottomtagtext": "Field-ready guidance"
};
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };
const PEN_RUNTIME_MOTION_STYLE = "@keyframes pen-media-breathe{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-8px,0) scale(1.035)}}@keyframes pen-track-slide-x-subtle{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-32px,0,0)}}@keyframes pen-track-slide-x-showcase{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-52px,0,0)}}@keyframes pen-card-float{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-10px,0)}}";

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
      mediaBreathe: true,
      contentStagger: true,
    };
  }
  if (sectionKindToken === "navigation" || sectionKindToken === "footer") {
    return {
      level: "subtle",
      revealPreset: "fadeIn",
      delayStep: 20,
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

const isHeadingLikeTextNode = (node) => {
  const lowerName = String(node?.name || "").trim().toLowerCase();
  if (/(title|headline|hero|eyebrow|heading)/.test(lowerName)) return true;
  return resolveFontSize(node?.style?.fontSize) >= 22;
};

const getNodeNameToken = (node) => String(node?.name || "").trim().toLowerCase();

const shouldApplyStoryTrackMotion = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "story") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  const name = getNodeNameToken(node);
  const direction = String(node?.style?.flexDirection || "").trim().toLowerCase();
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  const rowLike = /(?:row|track|carousel|strip|rail)/.test(name);
  return direction === "row" && (rowLike || childCount >= 2);
};

const shouldApplyStoryCardHover = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "story") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  const name = getNodeNameToken(node);
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  return /(?:card|cards|grid|tile)/.test(name) && childCount > 0;
};

const shouldApplyStoryCardFloat = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "story") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  if (!node?.imageProp) return false;
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  if (childCount < 1) return false;
  const width = resolveNumericDimension(node?.style?.width);
  const height = resolveNumericDimension(node?.style?.height);
  const cardLikeWidth = width > 0 ? width <= 460 : true;
  const cardLikeHeight = height > 0 ? height >= 220 : true;
  return cardLikeWidth && cardLikeHeight;
};

const buildNodeClassName = (node, sectionMotion, sectionKindToken) => {
  if (!sectionMotion || sectionMotion.level === "off") return "";
  const classes = [];
  if (node?.hrefProp) classes.push("hover-lift");
  if (node?.type === "frame" && node?.imageProp) classes.push("will-change-transform");
  if (shouldApplyStoryCardHover(node, sectionKindToken)) classes.push("hover-lift");
  if (shouldApplyStoryTrackMotion(node, sectionKindToken)) classes.push("will-change-transform", "pen-track-slide");
  return classes.join(" ");
};

const buildNodeStyle = (node, merged, sectionMotion, sectionKindToken, keyPath) => {
  const style = { ...(node?.style || {}) };
  if (node?.imageProp) {
    const src = String(merged?.[node.imageProp] || "").trim();
    if (src) {
      style.backgroundImage = `url(${src})`;
    }
  }
  if (node?.hrefProp) {
    style.textDecoration = style.textDecoration || "none";
    if (!style.color) style.color = "inherit";
    if (node?.type === "frame" && !style.display) {
      style.display = "inline-block";
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

const renderNode = (node, merged, sectionMotion, sectionKindToken, key = "root") => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged, sectionMotion, sectionKindToken, key);
  const className = buildNodeClassName(node, sectionMotion, sectionKindToken) || undefined;
  const href = node?.hrefProp ? String(merged?.[node.hrefProp] || "").trim() : "";
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
    const Tag = href ? "a" : "div";
    return React.createElement(
      Tag,
      {
        key,
        href: href || undefined,
        className,
        style,
        "data-pen-node": node.id || undefined,
      },
      renderTextContent(node, merged, key, sectionMotion)
    );
  }
  const Tag = href ? "a" : "div";
  return React.createElement(
    Tag,
    {
      key,
      href: href || undefined,
      className,
      style,
      "data-pen-node": node.id || undefined,
    },
    ...(Array.isArray(node.children)
      ? node.children.map((child, index) => renderNode(child, merged, sectionMotion, sectionKindToken, `${key}-${index}`))
      : [])
  );
};

export default function TemplateExclusiveUnistellarHomeSupportHeroSupportheropenAlt1({ id, eyebrowlabeltext, herotitletext, herosubtext, searchprompttext, searchbadgetexttext, metaatext, metabtext, metactext, rightlabeltext, righttitletext, t1text, d1text, foot1text, t2text, d2text, foot2text, t3text, d3text, foot3text, herobottomtexttext, herobottomtagtext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, eyebrowlabeltext, herotitletext, herosubtext, searchprompttext, searchbadgetexttext, metaatext, metabtext, metactext, rightlabeltext, righttitletext, t1text, d1text, foot1text, t2text, d2text, foot2text, t3text, d3text, foot3text, herobottomtexttext, herobottomtagtext });
  assignDefined(merged, rest);
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
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": SECTION_KIND,
      className: sectionClassName,
      style: sectionStyle,
    },
    ...(sectionMotion?.level !== "off"
      ? [React.createElement("style", { key: "pen-motion-style" }, PEN_RUNTIME_MOTION_STYLE)]
      : []),
    renderNode(SECTION_TREE, merged, sectionMotion, sectionKindToken, "root")
  );
}