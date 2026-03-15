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

const SECTION_KIND = "story";
const SECTION_TREE = {
  "type": "frame",
  "id": "njHvx",
  "name": "Story Cards",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 22,
    "padding": "56px",
    "width": "100%",
    "background": "#060A14"
  },
  "children": [
    {
      "type": "frame",
      "id": "Zm7Lh",
      "name": "storyHead",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 12,
        "alignItems": "center"
      },
      "children": [
        {
          "type": "rectangle",
          "id": "cMyEr",
          "name": "storyBar",
          "style": {
            "boxSizing": "border-box",
            "width": 3,
            "height": 14,
            "background": "#2b67f6"
          },
          "children": []
        },
        {
          "type": "text",
          "id": "LD2SH",
          "name": "storyLabel",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#9db0d4",
            "fontFamily": "Manrope",
            "fontSize": 12,
            "fontWeight": "600",
            "letterSpacing": 1.4
          },
          "children": [],
          "textProp": "storylabeltext"
        }
      ]
    },
    {
      "type": "text",
      "id": "3kNSV",
      "name": "storyTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 32,
        "fontWeight": "700",
        "letterSpacing": -0.8,
        "lineHeight": 1,
        "width": "100%"
      },
      "children": [],
      "textProp": "storytitletext"
    },
    {
      "type": "text",
      "id": "e7QV3",
      "name": "storySub",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#C8D0E2",
        "fontFamily": "Manrope",
        "fontSize": 15,
        "fontWeight": "500",
        "lineHeight": 1.45,
        "width": "100%"
      },
      "children": [],
      "textProp": "storysubtext"
    },
    {
      "type": "frame",
      "id": "Ssf6p",
      "name": "storyGrid",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 14,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "RJFE7",
          "name": "storyCard1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "width": "100%",
            "borderRadius": 22,
            "background": "#0E1624",
            "border": "1px solid #22324A"
          },
          "children": [
            {
              "type": "frame",
              "id": "KPkU5",
              "name": "storyImg1",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 210,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "storyimg1imagesrc"
            },
            {
              "type": "text",
              "id": "IRCtB",
              "name": "storyTag1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9db0d4",
                "fontFamily": "Space Grotesk",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1.2
              },
              "children": [],
              "textProp": "storytag1text"
            },
            {
              "type": "text",
              "id": "MgB9g",
              "name": "storyTitle1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 18,
                "fontWeight": "700",
                "lineHeight": 1.1,
                "width": "100%"
              },
              "children": [],
              "textProp": "storytitle1text"
            },
            {
              "type": "text",
              "id": "PPXk8",
              "name": "storyBody1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#A0A0A0",
                "fontFamily": "Space Grotesk",
                "fontSize": 13,
                "fontWeight": "500",
                "lineHeight": 1.35,
                "width": "100%"
              },
              "children": [],
              "textProp": "storybody1text"
            },
            {
              "type": "text",
              "id": "nIXW8",
              "name": "storyQuote1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F4F7FF",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "600",
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "storyquote1text"
            },
            {
              "type": "frame",
              "id": "HJk4n",
              "name": "storyFooter1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "space-between",
                "alignItems": "center",
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "wsXBa",
                  "name": "storyLink1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9db0d4",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 11,
                    "fontWeight": "700",
                    "letterSpacing": 1.1
                  },
                  "children": [],
                  "textProp": "storylink1text"
                },
                {
                  "type": "text",
                  "id": "MYsvW",
                  "name": "storyMetric1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#AFC5FF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 10,
                    "fontWeight": "700",
                    "letterSpacing": 1.1
                  },
                  "children": [],
                  "textProp": "storymetric1text"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "ghiwd",
          "name": "storyCard2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "width": "100%",
            "borderRadius": 22,
            "background": "#0E1624",
            "border": "1px solid #22324A"
          },
          "children": [
            {
              "type": "frame",
              "id": "ajmu3",
              "name": "storyImg2",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 210,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "storyimg2imagesrc"
            },
            {
              "type": "text",
              "id": "hj4sr",
              "name": "storyTag2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9db0d4",
                "fontFamily": "Space Grotesk",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1.2
              },
              "children": [],
              "textProp": "storytag2text"
            },
            {
              "type": "text",
              "id": "1d2qg",
              "name": "storyTitle2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 18,
                "fontWeight": "700",
                "lineHeight": 1.1,
                "width": "100%"
              },
              "children": [],
              "textProp": "storytitle2text"
            },
            {
              "type": "text",
              "id": "zxF3O",
              "name": "storyBody2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#A0A0A0",
                "fontFamily": "Space Grotesk",
                "fontSize": 13,
                "fontWeight": "500",
                "lineHeight": 1.35,
                "width": "100%"
              },
              "children": [],
              "textProp": "storybody2text"
            },
            {
              "type": "text",
              "id": "M7t3E",
              "name": "storyQuote2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F4F7FF",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "600",
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "storyquote2text"
            },
            {
              "type": "frame",
              "id": "BruFW",
              "name": "storyFooter2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "space-between",
                "alignItems": "center",
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "jIsNS",
                  "name": "storyLink2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9db0d4",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 11,
                    "fontWeight": "700",
                    "letterSpacing": 1.1
                  },
                  "children": [],
                  "textProp": "storylink2text"
                },
                {
                  "type": "text",
                  "id": "FkNeF",
                  "name": "storyMetric2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#AFC5FF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 10,
                    "fontWeight": "700",
                    "letterSpacing": 1.1
                  },
                  "children": [],
                  "textProp": "storymetric2text"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "QEA3L",
          "name": "storyCard3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "width": "100%",
            "borderRadius": 22,
            "background": "#0E1624",
            "border": "1px solid #22324A"
          },
          "children": [
            {
              "type": "frame",
              "id": "w8A7i",
              "name": "storyImg3",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 210,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "storyimg3imagesrc"
            },
            {
              "type": "text",
              "id": "ZwwVU",
              "name": "storyTag3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9db0d4",
                "fontFamily": "Space Grotesk",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1.2
              },
              "children": [],
              "textProp": "storytag3text"
            },
            {
              "type": "text",
              "id": "lX9Az",
              "name": "storyTitle3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 18,
                "fontWeight": "700",
                "lineHeight": 1.1,
                "width": "100%"
              },
              "children": [],
              "textProp": "storytitle3text"
            },
            {
              "type": "text",
              "id": "AIrof",
              "name": "storyBody3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#A0A0A0",
                "fontFamily": "Space Grotesk",
                "fontSize": 13,
                "fontWeight": "500",
                "lineHeight": 1.35,
                "width": "100%"
              },
              "children": [],
              "textProp": "storybody3text"
            },
            {
              "type": "text",
              "id": "7DWZB",
              "name": "storyQuote3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F4F7FF",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "600",
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "storyquote3text"
            },
            {
              "type": "frame",
              "id": "Gk0By",
              "name": "storyFooter3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "space-between",
                "alignItems": "center",
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "CLlb9",
                  "name": "storyLink3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9db0d4",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 11,
                    "fontWeight": "700",
                    "letterSpacing": 1.1
                  },
                  "children": [],
                  "textProp": "storylink3text"
                },
                {
                  "type": "text",
                  "id": "dHtww",
                  "name": "storyMetric3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#AFC5FF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 10,
                    "fontWeight": "700",
                    "letterSpacing": 1.1
                  },
                  "children": [],
                  "textProp": "storymetric3text"
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
  "id": "njHvx",
  "storylabeltext": "FIELD STORIES",
  "storytitletext": "REAL OBSERVERS. CLEAR NIGHTS. STRONGER REASONS TO STEP OUTSIDE.",
  "storysubtext": "Each field story shows a different path into the sky, with practical wins, emotional payoff, and a reason to come back tomorrow night.",
  "storyimg1imagesrc": "https://images.unsplash.com/photo-1712959112486-bb6db674578f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxOTA5NzN8&ixlib=rb-4.1.0&q=80&w=1080",
  "storytag1text": "REMOTE DESERT SESSION",
  "storytitle1text": "MAYA CAPTURED THE VEIL NEBULA IN HER FIRST MONTH",
  "storybody1text": "With guided alignment and auto-enhancement, she moved from phone photos to crisp deep-sky detail in three nights.",
  "storyquote1text": "\"I stopped worrying about setup and finally spent my time discovering.\"",
  "storylink1text": "READ STORY 01",
  "storymetric1text": "FIRST MONTH WIN",
  "storyimg2imagesrc": "https://images.unsplash.com/photo-1537151179283-9b6aeb737922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxOTA5NzR8&ixlib=rb-4.1.0&q=80&w=1080",
  "storytag2text": "CITY BALCONY",
  "storytitle2text": "JON TURNED HEAVY LIGHT POLLUTION INTO LIVE PLANETARY SHOWS",
  "storybody2text": "He hosts weekly rooftop sessions where friends track Jupiter bands and lunar shadows through a single smart setup.",
  "storyquote2text": "\"Now every rooftop gathering ends with someone asking when we can do it again.\"",
  "storylink2text": "READ STORY 02",
  "storymetric2text": "WEEKLY COMMUNITY RITUAL",
  "storyimg3imagesrc": "https://images.unsplash.com/photo-1594755048873-640521e9db74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxOTA5NzR8&ixlib=rb-4.1.0&q=80&w=1080",
  "storytag3text": "ASTROPHOTOGRAPHY CREW",
  "storytitle3text": "ELENA'S TEAM BUILT A PORTABLE WORKFLOW FOR DARK-SKY WEEKENDS",
  "storybody3text": "They now document targets faster, compare capture quality onsite, and spend more time observing than troubleshooting.",
  "storyquote3text": "\"We spend less time calibrating gear and more time comparing what we found.\"",
  "storylink3text": "READ STORY 03",
  "storymetric3text": "FASTER CAPTURE WORKFLOW"
};
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };
const PEN_RUNTIME_MOTION_STYLE = "@keyframes pen-media-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}";

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

const resolveDelayMs = (keyPath = "", motionMode = "subtle") => {
  const match = String(keyPath || "").match(/-(\d+)$/);
  const index = Number(match?.[1] || 0);
  const step = motionMode === "showcase" ? 80 : 45;
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

const isHeadingLikeTextNode = (node) => {
  const lowerName = String(node?.name || "").trim().toLowerCase();
  if (/(title|headline|hero|eyebrow|heading)/.test(lowerName)) return true;
  return resolveFontSize(node?.style?.fontSize) >= 22;
};

const buildNodeClassName = (node, motionMode) => {
  if (motionMode === "off") return "";
  const classes = [];
  if (node?.hrefProp) classes.push("hover-lift");
  if (node?.type === "frame" && node?.imageProp) classes.push("will-change-transform");
  return classes.join(" ");
};

const buildNodeStyle = (node, merged, motionMode, keyPath) => {
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
  if (motionMode !== "off") {
    const delayMs = resolveDelayMs(keyPath, motionMode);
    style.transition = style.transition || "opacity 560ms var(--ease-smooth), transform 560ms var(--ease-smooth), box-shadow 300ms var(--ease-smooth)";
    if (delayMs > 0) style.transitionDelay = style.transitionDelay || `${delayMs}ms`;
    if (
      motionMode === "showcase" &&
      node?.imageProp &&
      !style.animation &&
      (!style.transform || String(style.transform).trim() === "")
    ) {
      style.animation = "pen-media-breathe 8s var(--ease-smooth, ease) infinite";
      style.transformOrigin = style.transformOrigin || "50% 50%";
    }
  }
  return style;
};

const renderTextContent = (node, merged, keyPath, motionMode) => {
  const textValue = String(merged?.[node?.textProp] ?? "");
  if (!textValue || motionMode === "off") return textValue;
  if (!isHeadingLikeTextNode(node)) return textValue;
  return React.createElement(
    TextReveal,
    {
      as: "span",
      className: "inline-block",
      delayMs: resolveDelayMs(keyPath, motionMode),
    },
    textValue
  );
};

const renderNode = (node, merged, motionMode, key = "root") => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged, motionMode, key);
  const className = buildNodeClassName(node, motionMode) || undefined;
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
      renderTextContent(node, merged, key, motionMode)
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
      ? node.children.map((child, index) => renderNode(child, merged, motionMode, `${key}-${index}`))
      : [])
  );
};

export default function TemplateExclusiveUnistellarHomeUseCasesStoryStorycardspenAlt3({ id, storylabeltext, storytitletext, storysubtext, storyimg1imagesrc, storytag1text, storytitle1text, storybody1text, storyquote1text, storylink1text, storymetric1text, storyimg2imagesrc, storytag2text, storytitle2text, storybody2text, storyquote2text, storylink2text, storymetric2text, storyimg3imagesrc, storytag3text, storytitle3text, storybody3text, storyquote3text, storylink3text, storymetric3text, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, storylabeltext, storytitletext, storysubtext, storyimg1imagesrc, storytag1text, storytitle1text, storybody1text, storyquote1text, storylink1text, storymetric1text, storyimg2imagesrc, storytag2text, storytitle2text, storybody2text, storyquote2text, storylink2text, storymetric2text, storyimg3imagesrc, storytag3text, storytitle3text, storybody3text, storyquote3text, storylink3text, storymetric3text });
  assignDefined(merged, rest);
  const effectiveMotionMode = resolveMotionMode(providerMotionMode, merged?.motionMode);
  const sectionKindToken = String(SECTION_KIND || "").trim().toLowerCase();
  const reveal = useInViewReveal({
    preset: sectionKindToken === "hero" ? "fadeIn" : "fadeUp",
    once: true,
    enabled: effectiveMotionMode !== "off",
  });
  const sectionClassName = effectiveMotionMode === "off"
    ? "w-full"
    : ["w-full", reveal.className].filter(Boolean).join(" ");
  const sectionStyle = effectiveMotionMode === "off" ? undefined : reveal.style;
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": SECTION_KIND,
      className: sectionClassName,
      style: sectionStyle,
    },
    ...(effectiveMotionMode !== "off"
      ? [React.createElement("style", { key: "pen-motion-style" }, PEN_RUNTIME_MOTION_STYLE)]
      : []),
    renderNode(SECTION_TREE, merged, effectiveMotionMode, "root")
  );
}