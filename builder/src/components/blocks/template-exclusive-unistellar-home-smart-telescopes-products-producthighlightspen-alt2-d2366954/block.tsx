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

const SECTION_KIND = "products";
const SECTION_TREE = {
  "type": "frame",
  "id": "BU419",
  "name": "Product Highlights",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 20,
    "padding": "28px 56px",
    "width": "100%"
  },
  "children": [
    {
      "type": "text",
      "id": "IMoX0",
      "name": "ht",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 30,
        "fontWeight": "600",
        "width": "100%"
      },
      "children": [],
      "textProp": "httext"
    },
    {
      "type": "frame",
      "id": "OKTGw",
      "name": "grid",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 16,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "lXvei",
          "name": "c1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "padding": "18px",
            "width": "100%",
            "borderRadius": 16,
            "background": "#0F172B",
            "border": "1px solid #23324F"
          },
          "children": [
            {
              "type": "text",
              "id": "D4f8b",
              "name": "c1n",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Fraunces",
                "fontSize": 24,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "c1ntext"
            },
            {
              "type": "text",
              "id": "KFiTE",
              "name": "c1d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AEB7C6",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.55,
                "width": "100%"
              },
              "children": [],
              "textProp": "c1dtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "xHOWn",
          "name": "c2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "padding": "18px",
            "width": "100%",
            "borderRadius": 16,
            "background": "#0F172B",
            "border": "1px solid #23324F"
          },
          "children": [
            {
              "type": "text",
              "id": "9qNJ1",
              "name": "c2n",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Fraunces",
                "fontSize": 24,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "c2ntext"
            },
            {
              "type": "text",
              "id": "Ik6YJ",
              "name": "c2d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AEB7C6",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.55,
                "width": "100%"
              },
              "children": [],
              "textProp": "c2dtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "0J9AE",
          "name": "c3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "padding": "18px",
            "width": "100%",
            "borderRadius": 16,
            "background": "#0F172B",
            "border": "1px solid #23324F"
          },
          "children": [
            {
              "type": "text",
              "id": "1hoDp",
              "name": "c3n",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Fraunces",
                "fontSize": 24,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "c3ntext"
            },
            {
              "type": "text",
              "id": "KfpYw",
              "name": "c3d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AEB7C6",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.55,
                "width": "100%"
              },
              "children": [],
              "textProp": "c3dtext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "BU419",
  "httext": "PRODUCT HIGHLIGHTS",
  "c1ntext": "Autonomous alignment",
  "c1dtext": "Set the telescope down, launch the app, and start observing without manual star-hopping.",
  "c2ntext": "Deep-sky enhancement",
  "c2dtext": "Real-time image stacking pulls nebulae and galaxies through light pollution and uneven seeing.",
  "c3ntext": "Shared sky intelligence",
  "c3dtext": "Observation data connects with a wider community, helping users validate targets and discover more nights worth keeping."
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

export default function TemplateExclusiveUnistellarHomeSmartTelescopesProductsProducthighlightspenAlt2({ id, httext, c1ntext, c1dtext, c2ntext, c2dtext, c3ntext, c3dtext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, httext, c1ntext, c1dtext, c2ntext, c2dtext, c3ntext, c3dtext });
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