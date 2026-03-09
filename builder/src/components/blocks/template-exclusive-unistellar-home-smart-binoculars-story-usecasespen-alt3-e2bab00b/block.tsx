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
  "id": "rM7y9",
  "name": "Use Cases",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 28,
    "padding": "36px 56px",
    "width": "100%",
    "background": "#060A14"
  },
  "children": [
    {
      "type": "text",
      "id": "Ncfpd",
      "name": "useTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 44,
        "fontWeight": "600",
        "width": "100%"
      },
      "children": [],
      "textProp": "usetitletext"
    },
    {
      "type": "text",
      "id": "6jAnd",
      "name": "useSub",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#AEB7C6",
        "fontFamily": "DM Sans",
        "fontSize": 15,
        "fontWeight": "normal",
        "lineHeight": 1.55,
        "width": "100%"
      },
      "children": [],
      "textProp": "usesubtext"
    },
    {
      "type": "frame",
      "id": "BoAnA",
      "name": "useGrid",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 16,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "c6KI9",
          "name": "useCard1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "padding": "28px",
            "width": "100%",
            "borderRadius": 20,
            "background": "#0B1220",
            "border": "1px solid #23324F"
          },
          "children": [
            {
              "type": "text",
              "id": "J84xu",
              "name": "useCard1Tag",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9DB0D4",
                "fontFamily": "DM Sans",
                "fontSize": 11,
                "fontWeight": "500",
                "letterSpacing": 3,
                "width": "100%"
              },
              "children": [],
              "textProp": "usecard1tagtext"
            },
            {
              "type": "text",
              "id": "zs0Tq",
              "name": "useCard1Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F5F5F0",
                "fontFamily": "Fraunces",
                "fontSize": 20,
                "fontWeight": "500",
                "width": "100%"
              },
              "children": [],
              "textProp": "usecard1titletext"
            },
            {
              "type": "text",
              "id": "zlMBh",
              "name": "useCard1Body",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6E6E70",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "normal",
                "lineHeight": 1.6,
                "width": "100%"
              },
              "children": [],
              "textProp": "usecard1bodytext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "jJPJi",
          "name": "useCard2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "padding": "24px",
            "width": "100%",
            "borderRadius": 20,
            "background": "#0B1220",
            "border": "1px solid #23324F"
          },
          "children": [
            {
              "type": "text",
              "id": "TBCYd",
              "name": "useCard2Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F5F5F0",
                "fontFamily": "Fraunces",
                "fontSize": 20,
                "fontWeight": "500",
                "width": "100%"
              },
              "children": [],
              "textProp": "usecard2titletext"
            },
            {
              "type": "text",
              "id": "qA5OY",
              "name": "useCard2Body",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6E6E70",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "normal",
                "lineHeight": 1.6,
                "width": "100%"
              },
              "children": [],
              "textProp": "usecard2bodytext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "XSIGn",
          "name": "useCard3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "padding": "24px",
            "width": "100%",
            "borderRadius": 20,
            "background": "#0B1220",
            "border": "1px solid #23324F"
          },
          "children": [
            {
              "type": "text",
              "id": "O4wXp",
              "name": "useCard3Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F5F5F0",
                "fontFamily": "Fraunces",
                "fontSize": 20,
                "fontWeight": "500",
                "width": "100%"
              },
              "children": [],
              "textProp": "usecard3titletext"
            },
            {
              "type": "text",
              "id": "yrCAW",
              "name": "useCard3Body",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6E6E70",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "normal",
                "lineHeight": 1.6,
                "width": "100%"
              },
              "children": [],
              "textProp": "usecard3bodytext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "rM7y9",
  "usetitletext": "One Platform, Every Stage of Night Exploration",
  "usesubtext": "Begin with private sky rituals, scale into guided group experiences, and graduate to institution-grade observation workflows.",
  "usecard1tagtext": "SIGNATURE JOURNEY",
  "usecard1titletext": "Private Sky Rituals",
  "usecard1bodytext": "Transform rooftops and terraces into cinematic observatories with curated object highlights, gentle guidance, and premium optics tuned for calm nightly practice.",
  "usecard2titletext": "Guided Group Nights",
  "usecard2bodytext": "Coordinate clubs, retreats, and hosted events with synchronized targets, shared wayfinding, and effortless facilitation across every participant.",
  "usecard3titletext": "Institutional Research Programs",
  "usecard3bodytext": "Support academic labs and advanced initiatives with cleaner visual output, contextual object intelligence, and repeatable observation standards."
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

export default function TemplateExclusiveUnistellarHomeSmartBinocularsStoryUsecasespenAlt3({ id, usetitletext, usesubtext, usecard1tagtext, usecard1titletext, usecard1bodytext, usecard2titletext, usecard2bodytext, usecard3titletext, usecard3bodytext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, usetitletext, usesubtext, usecard1tagtext, usecard1titletext, usecard1bodytext, usecard2titletext, usecard2bodytext, usecard3titletext, usecard3bodytext });
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