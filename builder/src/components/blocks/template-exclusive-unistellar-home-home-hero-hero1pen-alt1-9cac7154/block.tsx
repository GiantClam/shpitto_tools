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
  "id": "fPwLp",
  "name": "hero1",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 20,
    "justifyContent": "center",
    "alignItems": "center",
    "padding": "80px 72px",
    "width": "100%",
    "height": 620,
    "backgroundRepeat": "no-repeat",
    "backgroundPosition": "center",
    "backgroundSize": "cover"
  },
  "children": [
    {
      "type": "text",
      "id": "NkVbB",
      "name": "h1tag",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#A7B3CC",
        "fontFamily": "Manrope",
        "fontSize": 14,
        "letterSpacing": 1.6,
        "textAlign": "center"
      },
      "children": [],
      "textProp": "h1tagtext"
    },
    {
      "type": "text",
      "id": "NzqU2",
      "name": "h1",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 62,
        "fontWeight": "700",
        "letterSpacing": -0.8,
        "textAlign": "center"
      },
      "children": [],
      "textProp": "h1text"
    },
    {
      "type": "text",
      "id": "f8juI",
      "name": "h1desc",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#C8D0E2",
        "fontFamily": "Manrope",
        "fontSize": 19,
        "lineHeight": 1.5,
        "textAlign": "center",
        "width": 760
      },
      "children": [],
      "textProp": "h1desctext"
    },
    {
      "type": "frame",
      "id": "slPvi",
      "name": "h1Actions",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 14,
        "alignItems": "center"
      },
      "children": [
        {
          "type": "frame",
          "id": "xdIRZ",
          "name": "learnBtn",
          "style": {
            "boxSizing": "border-box",
            "padding": "14px 22px",
            "borderRadius": 999,
            "background": "#FFFFFF"
          },
          "children": [
            {
              "type": "text",
              "id": "DlGuO",
              "name": "learnTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#0B1020",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "learntxttext"
            }
          ],
          "hrefProp": "learnbtnhref"
        },
        {
          "type": "frame",
          "id": "msiK4",
          "name": "orderBtn",
          "style": {
            "boxSizing": "border-box",
            "padding": "14px 22px",
            "borderRadius": 999,
            "background": "#1D4ED8",
            "border": "1px solid #93C5FD"
          },
          "children": [
            {
              "type": "text",
              "id": "jtPQ7",
              "name": "orderTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "ordertxttext"
            }
          ],
          "hrefProp": "orderbtnhref"
        }
      ]
    }
  ],
  "imageProp": "hero1imagesrc"
};
const DEFAULT_PROPS = {
  "id": "fPwLp",
  "hero1imagesrc": "https://images.unsplash.com/photo-1501523321-8ecb927b4be6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODczNDh8&ixlib=rb-4.1.0&q=80&w=1080",
  "h1tagtext": "Unistellar Smart Telescopes",
  "h1text": "The Ultimate Stargazing Experience",
  "h1desctext": "From distant galaxies, nebulae and clusters to nearby solar system planets, experience the universe in extraordinary clarity.",
  "learnbtnhref": "/learn-more",
  "learntxttext": "Learn More",
  "orderbtnhref": "/order-yours",
  "ordertxttext": "Order Yours"
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

export default function TemplateExclusiveUnistellarHomeHomeHeroHero1penAlt1({ id, hero1imagesrc, h1tagtext, h1text, h1desctext, learnbtnhref, learntxttext, orderbtnhref, ordertxttext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, hero1imagesrc, h1tagtext, h1text, h1desctext, learnbtnhref, learntxttext, orderbtnhref, ordertxttext });
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