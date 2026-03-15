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

const SECTION_KIND = "contact";
const SECTION_TREE = {
  "type": "frame",
  "id": "rJJKK",
  "name": "Help Topics",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 24,
    "padding": "56px 72px 60px 72px",
    "width": "100%",
    "height": 820,
    "background": "#070D18"
  },
  "children": [
    {
      "type": "frame",
      "id": "NOfbS",
      "name": "topicsHead",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 12,
        "width": 500
      },
      "children": [
        {
          "type": "frame",
          "id": "s5Qft",
          "name": "topicsLabelRow",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 12,
            "alignItems": "center",
            "width": 280,
            "height": 16
          },
          "children": [
            {
              "type": "frame",
              "id": "SJQb7",
              "name": "topicsLine",
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
              "id": "RxBGW",
              "name": "topicsLabel",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8DA0C2",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "700",
                "letterSpacing": 1.8
              },
              "children": [],
              "textProp": "topicslabeltext"
            }
          ]
        },
        {
          "type": "text",
          "id": "8qpVA",
          "name": "topicsTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Space Grotesk",
            "fontSize": 38,
            "fontWeight": "700",
            "letterSpacing": -1.4,
            "lineHeight": 1.08,
            "width": 500
          },
          "children": [],
          "textProp": "topicstitletext"
        }
      ]
    },
    {
      "type": "text",
      "id": "JYCoT",
      "name": "topicsIntro",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#A7B3CC",
        "fontFamily": "Manrope",
        "fontSize": 15,
        "lineHeight": 1.42,
        "width": 700
      },
      "children": [],
      "textProp": "topicsintrotext"
    },
    {
      "type": "frame",
      "id": "hgykg",
      "name": "topicsGrid",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 20,
        "width": "100%",
        "height": 480
      },
      "children": [
        {
          "type": "frame",
          "id": "MS2xg",
          "name": "col1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 20,
            "width": "100%",
            "height": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "FMn4x",
              "name": "card1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "padding": "20px",
                "width": "100%",
                "height": 230,
                "borderRadius": 12,
                "background": "#0B1220",
                "border": "1px solid #243047"
              },
              "children": [
                {
                  "type": "text",
                  "id": "zLSdc",
                  "name": "card1K",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2B67F6",
                    "fontFamily": "Manrope",
                    "fontSize": 10,
                    "fontWeight": "700",
                    "letterSpacing": 1.5
                  },
                  "children": [],
                  "textProp": "card1ktext"
                },
                {
                  "type": "text",
                  "id": "lQstI",
                  "name": "card1T",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 22,
                    "fontWeight": "700",
                    "letterSpacing": -0.5,
                    "lineHeight": 1.12,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "card1ttext"
                },
                {
                  "type": "text",
                  "id": "PovWE",
                  "name": "card1D",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8A8A8A",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "lineHeight": 1.4,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "card1dtext"
                },
                {
                  "type": "text",
                  "id": "pi9UN",
                  "name": "card1F",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "card1ftext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "OZLhK",
              "name": "card2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "padding": "20px",
                "width": "100%",
                "height": 230,
                "borderRadius": 12,
                "background": "#101826",
                "border": "1px solid #243047"
              },
              "children": [
                {
                  "type": "text",
                  "id": "dS8t7",
                  "name": "card2K",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2B67F6",
                    "fontFamily": "Manrope",
                    "fontSize": 10,
                    "fontWeight": "700",
                    "letterSpacing": 1.5
                  },
                  "children": [],
                  "textProp": "card2ktext"
                },
                {
                  "type": "text",
                  "id": "G53NC",
                  "name": "card2T",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 22,
                    "fontWeight": "700",
                    "letterSpacing": -0.5,
                    "lineHeight": 1.12,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "card2ttext"
                },
                {
                  "type": "text",
                  "id": "QUWJi",
                  "name": "card2D",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8A8A8A",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "lineHeight": 1.4,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "card2dtext"
                },
                {
                  "type": "text",
                  "id": "RH4D8",
                  "name": "card2F",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "card2ftext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "jOqWG",
          "name": "col2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 20,
            "width": "100%",
            "height": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "SDEIS",
              "name": "card3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "padding": "20px",
                "width": "100%",
                "height": 230,
                "borderRadius": 12,
                "background": "#0B1220",
                "border": "1px solid #243047"
              },
              "children": [
                {
                  "type": "text",
                  "id": "oYz5m",
                  "name": "card3K",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2B67F6",
                    "fontFamily": "Manrope",
                    "fontSize": 10,
                    "fontWeight": "700",
                    "letterSpacing": 1.5
                  },
                  "children": [],
                  "textProp": "card3ktext"
                },
                {
                  "type": "text",
                  "id": "8VHK0",
                  "name": "card3T",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 22,
                    "fontWeight": "700",
                    "letterSpacing": -0.5,
                    "lineHeight": 1.12,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "card3ttext"
                },
                {
                  "type": "text",
                  "id": "ocjN6",
                  "name": "card3D",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8A8A8A",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "lineHeight": 1.4,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "card3dtext"
                },
                {
                  "type": "text",
                  "id": "EKY92",
                  "name": "card3F",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "card3ftext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "lRUu0",
              "name": "card4",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "padding": "20px",
                "width": "100%",
                "height": 230,
                "borderRadius": 12,
                "background": "#0E1526",
                "border": "1px solid #243047"
              },
              "children": [
                {
                  "type": "text",
                  "id": "3Zlay",
                  "name": "card4K",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2B67F6",
                    "fontFamily": "Manrope",
                    "fontSize": 10,
                    "fontWeight": "700",
                    "letterSpacing": 1.5
                  },
                  "children": [],
                  "textProp": "card4ktext"
                },
                {
                  "type": "text",
                  "id": "F8ZEl",
                  "name": "card4T",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 22,
                    "fontWeight": "700",
                    "letterSpacing": -0.5,
                    "lineHeight": 1.12,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "card4ttext"
                },
                {
                  "type": "text",
                  "id": "aT7SI",
                  "name": "card4D",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8A8A8A",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "lineHeight": 1.4,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "card4dtext"
                },
                {
                  "type": "text",
                  "id": "MCLOa",
                  "name": "card4F",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "card4ftext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "rfolp",
          "name": "col3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "padding": "20px",
            "width": 280,
            "height": "100%",
            "borderRadius": 12,
            "background": "#0A0F1C",
            "border": "1px solid #1B2538"
          },
          "children": [
            {
              "type": "text",
              "id": "z8rIY",
              "name": "col3K",
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
              "textProp": "col3ktext"
            },
            {
              "type": "text",
              "id": "oBRC6",
              "name": "step1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "600",
                "lineHeight": 1.35,
                "width": "100%"
              },
              "children": [],
              "textProp": "step1text"
            },
            {
              "type": "text",
              "id": "YbCAM",
              "name": "step2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#A7B3CC",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "lineHeight": 1.4,
                "width": "100%"
              },
              "children": [],
              "textProp": "step2text"
            },
            {
              "type": "text",
              "id": "9fsz0",
              "name": "step3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#A7B3CC",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "lineHeight": 1.4,
                "width": "100%"
              },
              "children": [],
              "textProp": "step3text"
            },
            {
              "type": "frame",
              "id": "8zWar",
              "name": "step4",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "justifyContent": "center",
                "padding": "0px 16px",
                "width": "100%",
                "height": 86,
                "borderRadius": 12,
                "background": "#13203A",
                "border": "1px solid #2A3C61"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Giu3l",
                  "name": "step4A",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "700",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "step4atext"
                },
                {
                  "type": "text",
                  "id": "1OcEq",
                  "name": "step4B",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#DCE7FF",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "fontWeight": "500",
                    "lineHeight": 1.35,
                    "width": 200
                  },
                  "children": [],
                  "textProp": "step4btext"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "rJJKK",
  "topicslabeltext": "HELP TOPICS",
  "topicstitletext": "Support organized by what is blocking the next observation.",
  "topicsintrotext": "Move from immediate setup issues to image refinement and long-term ownership questions without losing context or momentum.",
  "card1ktext": "01 / GET STARTED",
  "card1ttext": "First-light setup checklist",
  "card1dtext": "Use this path for unboxing, balancing, firmware status, Wi-Fi pairing, and verifying your first target alignment.",
  "card1ftext": "Includes app pairing and session prep",
  "card2ktext": "02 / FIELD TROUBLESHOOTING",
  "card2ttext": "Wi-Fi, power, and live-session recovery",
  "card2dtext": "Reconnect during an active night, stabilize battery behavior, and get observing resumed before conditions change.",
  "card2ftext": "Fast steps for in-field fixes",
  "card3ktext": "03 / IMAGE QUALITY",
  "card3ttext": "Focus, tracking, and image optimization",
  "card3dtext": "Improve stars, framing, and consistency with practical fixes for focus drift, dew, motion, and target visibility.",
  "card3ftext": "Best for advanced observing sessions",
  "card4ktext": "04 / ACCOUNT & ACCESS",
  "card4ttext": "Transfers, ownership, and coverage",
  "card4dtext": "Manage account changes, understand support eligibility, and complete telescope transfers without losing setup history.",
  "card4ftext": "Policy guidance with next actions",
  "col3ktext": "SUPPORT FLOW",
  "step1text": "1. Start with the checklist that matches your issue.",
  "step2text": "2. Follow the resources in order so setup, diagnostics, and app changes stay synchronized.",
  "step3text": "3. Escalate to the support team when your session still cannot continue or ownership needs manual review.",
  "step4atext": "Escalation window",
  "step4btext": "Send session logs and issue details when you need a human review."
};
const LAYOUT_CONTEXT = {
  "pagePaddingLeft": 0,
  "pagePaddingRight": 0,
  "pagePaddingTop": 0,
  "pagePaddingBottom": 0,
  "sectionGapAfter": 0
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

const renderNode = (node, merged, sectionMotion, sectionKindToken, key = "root", ancestorHasLink = false) => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged, sectionMotion, sectionKindToken, key);
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
            ancestorHasLink || shouldRenderLink
          )
        )
      : [])
  );
};

export default function TemplateExclusiveUnistellarHomeSupportContactHelptopicspenAlt2({ id, topicslabeltext, topicstitletext, topicsintrotext, card1ktext, card1ttext, card1dtext, card1ftext, card2ktext, card2ttext, card2dtext, card2ftext, card3ktext, card3ttext, card3dtext, card3ftext, card4ktext, card4ttext, card4dtext, card4ftext, col3ktext, step1text, step2text, step3text, step4atext, step4btext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, topicslabeltext, topicstitletext, topicsintrotext, card1ktext, card1ttext, card1dtext, card1ftext, card2ktext, card2ttext, card2dtext, card2ftext, card3ktext, card3ttext, card3dtext, card3ftext, card4ktext, card4ttext, card4dtext, card4ftext, col3ktext, step1text, step2text, step3text, step4atext, step4btext });
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
  const layoutStyle: React.CSSProperties = {
    boxSizing: "border-box",
  };
  const pagePaddingLeft = Number(LAYOUT_CONTEXT?.pagePaddingLeft || 0);
  const pagePaddingRight = Number(LAYOUT_CONTEXT?.pagePaddingRight || 0);
  const pagePaddingTop = Number(LAYOUT_CONTEXT?.pagePaddingTop || 0);
  const pagePaddingBottom = Number(LAYOUT_CONTEXT?.pagePaddingBottom || 0);
  const sectionGapAfter = Number(LAYOUT_CONTEXT?.sectionGapAfter || 0);
  if (Number.isFinite(pagePaddingLeft) && pagePaddingLeft > 0) layoutStyle.paddingLeft = pagePaddingLeft;
  if (Number.isFinite(pagePaddingRight) && pagePaddingRight > 0) layoutStyle.paddingRight = pagePaddingRight;
  if (Number.isFinite(pagePaddingTop) && pagePaddingTop > 0) layoutStyle.paddingTop = pagePaddingTop;
  if (Number.isFinite(pagePaddingBottom) && pagePaddingBottom > 0) layoutStyle.paddingBottom = pagePaddingBottom;
  if (Number.isFinite(sectionGapAfter) && sectionGapAfter > 0) layoutStyle.marginBottom = sectionGapAfter;
  const mergedSectionStyle = sectionStyle ? { ...layoutStyle, ...sectionStyle } : layoutStyle;
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": SECTION_KIND,
      className: sectionClassName,
      style: mergedSectionStyle,
    },
    ...(sectionMotion?.level !== "off"
      ? [React.createElement("style", { key: "pen-motion-style" }, PEN_RUNTIME_MOTION_STYLE)]
      : []),
    renderNode(SECTION_TREE, merged, sectionMotion, sectionKindToken, "root", false)
  );
}