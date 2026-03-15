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
  "id": "QYYAQ",
  "name": "switchSec",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 24,
    "alignItems": "center",
    "padding": "64px 72px",
    "width": "100%",
    "background": "#0A0A0A"
  },
  "children": [
    {
      "type": "text",
      "id": "EFEZT",
      "name": "switchTag",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#A1A1AA",
        "fontFamily": "Manrope",
        "fontSize": 12,
        "fontWeight": "600",
        "letterSpacing": 1
      },
      "children": [],
      "textProp": "switchtagtext"
    },
    {
      "type": "text",
      "id": "M1ck6",
      "name": "switchTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 52,
        "fontWeight": "600",
        "letterSpacing": -0.5,
        "textAlign": "center",
        "width": "100%"
      },
      "children": [],
      "textProp": "switchtitletext"
    },
    {
      "type": "text",
      "id": "ePqw3",
      "name": "switchSupport",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#D4D4D8",
        "fontFamily": "Manrope",
        "fontSize": 15,
        "lineHeight": 1.5,
        "textAlign": "center",
        "width": "100%"
      },
      "children": [],
      "textProp": "switchsupporttext"
    },
    {
      "type": "frame",
      "id": "6OzWN",
      "name": "cards",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 20,
        "width": "100%",
        "height": 420
      },
      "children": [
        {
          "type": "frame",
          "id": "EVjST",
          "name": "stepCard1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "padding": "12px",
            "width": "100%",
            "height": "100%",
            "borderRadius": 16,
            "background": "#111318",
            "border": "1.5px solid #2A2A2A"
          },
          "children": [
            {
              "type": "frame",
              "id": "iqO7S",
              "name": "stepMedia1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "center",
                "alignItems": "center",
                "width": "100%",
                "height": 250,
                "borderRadius": 12,
                "background": "linear-gradient(180deg, #1B1F2A 0%, #0B0D12 100%)"
              },
              "children": [
                {
                  "type": "icon_font",
                  "id": "zirx9",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "color": "#FFFFFF",
                    "width": 28,
                    "height": 28,
                    "display": "inline-flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "flexShrink": 0,
                    "fontSize": 28
                  },
                  "children": [],
                  "iconName": "Play"
                }
              ]
            },
            {
              "type": "text",
              "id": "12efQ",
              "name": "stepTitle1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 18,
                "fontWeight": "600",
                "letterSpacing": -0.2
              },
              "children": [],
              "textProp": "steptitle1text"
            },
            {
              "type": "text",
              "id": "wUBru",
              "name": "stepDesc1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#A1A1AA",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.4,
                "width": "100%"
              },
              "children": [],
              "textProp": "stepdesc1text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "XjGEB",
          "name": "stepCard2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "padding": "12px",
            "width": "100%",
            "height": "100%",
            "borderRadius": 16,
            "background": "#111318",
            "border": "1.5px solid #2A2A2A"
          },
          "children": [
            {
              "type": "frame",
              "id": "61WRx",
              "name": "stepMedia2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "center",
                "alignItems": "center",
                "width": "100%",
                "height": 250,
                "borderRadius": 12,
                "background": "linear-gradient(180deg, #1B2438 0%, #0B0D12 100%)"
              },
              "children": [
                {
                  "type": "icon_font",
                  "id": "8wTwA",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "color": "#2563EB",
                    "width": 28,
                    "height": 28,
                    "display": "inline-flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "flexShrink": 0,
                    "fontSize": 28
                  },
                  "children": [],
                  "iconName": "Wifi"
                }
              ]
            },
            {
              "type": "text",
              "id": "Y5hTs",
              "name": "stepTitle2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 18,
                "fontWeight": "600",
                "letterSpacing": -0.2
              },
              "children": [],
              "textProp": "steptitle2text"
            },
            {
              "type": "text",
              "id": "mucqF",
              "name": "stepDesc2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#A1A1AA",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.4,
                "width": "100%"
              },
              "children": [],
              "textProp": "stepdesc2text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "QAOb2",
          "name": "stepCard3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "padding": "12px",
            "width": 416,
            "height": "100%",
            "borderRadius": 16,
            "background": "#111318",
            "border": "1.5px solid #2A2A2A"
          },
          "children": [
            {
              "type": "frame",
              "id": "nUYqd",
              "name": "stepMedia3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "center",
                "alignItems": "center",
                "width": "100%",
                "height": 250,
                "borderRadius": 12,
                "background": "linear-gradient(180deg, #1A2130 0%, #0B0D12 100%)"
              },
              "children": [
                {
                  "type": "icon_font",
                  "id": "uVa4k",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "color": "#FFFFFF",
                    "width": 28,
                    "height": 28,
                    "display": "inline-flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "flexShrink": 0,
                    "fontSize": 28
                  },
                  "children": [],
                  "iconName": "Sparkles"
                }
              ]
            },
            {
              "type": "text",
              "id": "jqTBi",
              "name": "stepTitle3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 18,
                "fontWeight": "600",
                "letterSpacing": -0.2
              },
              "children": [],
              "textProp": "steptitle3text"
            },
            {
              "type": "text",
              "id": "0yU2O",
              "name": "stepDesc3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#A1A1AA",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.4,
                "width": "100%"
              },
              "children": [],
              "textProp": "stepdesc3text"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "QYYAQ",
  "switchtagtext": "SWITCH ON • CONNECT • ENJOY",
  "switchtitletext": "See the sky in three simple moves.",
  "switchsupporttext": "Mount your EVSCOPE, pair it instantly, and start guided viewing with cinematic clarity in under a minute.",
  "steptitle1text": "1. Switch on your scope",
  "stepdesc1text": "Power up and lock onto your target in seconds with guided startup prompts.",
  "steptitle2text": "2. Connect in the app",
  "stepdesc2text": "Pair over Wi-Fi and let smart alignment calibrate your viewing session.",
  "steptitle3text": "3. Enjoy guided discovery",
  "stepdesc3text": "Follow overlays and live labels that make every object easy to understand."
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

export default function TemplateExclusiveUnistellarHomeHomeStorySwitchsecpenAlt5({ id, switchtagtext, switchtitletext, switchsupporttext, steptitle1text, stepdesc1text, steptitle2text, stepdesc2text, steptitle3text, stepdesc3text, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, switchtagtext, switchtitletext, switchsupporttext, steptitle1text, stepdesc1text, steptitle2text, stepdesc2text, steptitle3text, stepdesc3text });
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