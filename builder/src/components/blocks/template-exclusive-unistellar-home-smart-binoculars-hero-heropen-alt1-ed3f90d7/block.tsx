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
  "id": "iCkVz",
  "name": "Hero",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 56,
    "alignItems": "center",
    "padding": "80px 56px 72px 56px",
    "width": "100%",
    "background": "linear-gradient(180deg, #111826 0%, #060A14 100%)"
  },
  "children": [
    {
      "type": "frame",
      "id": "9N8Gl",
      "name": "heroCopy",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 28,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "wRbvg",
          "name": "heroKicker",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#97A0AE",
            "fontFamily": "DM Sans",
            "fontSize": 12,
            "fontWeight": "600",
            "letterSpacing": 1.6
          },
          "children": [],
          "textProp": "herokickertext"
        },
        {
          "type": "text",
          "id": "VMN7J",
          "name": "heroTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FAFAF9",
            "fontFamily": "Fraunces",
            "fontSize": 62,
            "fontWeight": "600",
            "letterSpacing": -0.6,
            "lineHeight": 0.98,
            "width": "100%"
          },
          "children": [],
          "textProp": "herotitletext"
        },
        {
          "type": "text",
          "id": "2Ph8n",
          "name": "heroBody",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#AEB7C6",
            "fontFamily": "DM Sans",
            "fontSize": 16,
            "lineHeight": 1.55,
            "width": "100%"
          },
          "children": [],
          "textProp": "herobodytext"
        },
        {
          "type": "frame",
          "id": "DlOMw",
          "name": "heroActions",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 16
          },
          "children": [
            {
              "type": "frame",
              "id": "boLnx",
              "name": "btnPrimary",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 8,
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "0px 24px",
                "height": 48,
                "background": "#1B2742"
              },
              "children": [
                {
                  "type": "text",
                  "id": "hNk3A",
                  "name": "btnPrimaryText",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0A0A0A",
                    "fontFamily": "DM Sans",
                    "fontSize": 12,
                    "fontWeight": "600",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "btnprimarytexttext"
                }
              ],
              "hrefProp": "btnprimaryhref"
            },
            {
              "type": "frame",
              "id": "UGJYL",
              "name": "btnGhost",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 8,
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "0px 24px",
                "height": 48,
                "background": "#080D18",
                "border": "1px solid #FFFFFF"
              },
              "children": [
                {
                  "type": "text",
                  "id": "jb9hS",
                  "name": "btnGhostText",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "DM Sans",
                    "fontSize": 12,
                    "fontWeight": "600",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "btnghosttexttext"
                }
              ],
              "hrefProp": "btnghosthref"
            }
          ]
        },
        {
          "type": "text",
          "id": "jxKqT",
          "name": "heroTrust",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#444444",
            "fontFamily": "DM Sans",
            "fontSize": 11,
            "fontWeight": "600",
            "letterSpacing": 1,
            "width": "100%"
          },
          "children": [],
          "textProp": "herotrusttext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "wSiCB",
      "name": "heroVisual",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "width": 560,
        "height": 420,
        "border": "1px solid #1B2538",
        "boxShadow": "0px 20px 40px #000000AA"
      },
      "children": [
        {
          "type": "frame",
          "id": "YpRCX",
          "name": "heroImage",
          "style": {
            "boxSizing": "border-box",
            "width": "100%",
            "height": "100%",
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [],
          "imageProp": "heroimageimagesrc"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "iCkVz",
  "herokickertext": "SMART BINOCULARS / ENVISION",
  "herotitletext": "See the night with observatory intelligence in your hands.",
  "herobodytext": "Find galaxies, nebulae, and hidden sky detail in seconds through adaptive optics and guided live targeting built for serious exploration.",
  "btnprimaryhref": "/reserve-now",
  "btnprimarytexttext": "RESERVE NOW",
  "btnghosthref": "/watch-film",
  "btnghosttexttext": "WATCH FILM",
  "herotrusttext": "Trusted by 10,000+ observers across 60 countries",
  "heroimageimagesrc": "https://images.unsplash.com/photo-1612153085153-b409481892e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxOTA3MDR8&ixlib=rb-4.1.0&q=80&w=1080"
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

export default function TemplateExclusiveUnistellarHomeSmartBinocularsHeroHeropenAlt1({ id, herokickertext, herotitletext, herobodytext, btnprimaryhref, btnprimarytexttext, btnghosthref, btnghosttexttext, herotrusttext, heroimageimagesrc, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, herokickertext, herotitletext, herobodytext, btnprimaryhref, btnprimarytexttext, btnghosthref, btnghosttexttext, herotrusttext, heroimageimagesrc });
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