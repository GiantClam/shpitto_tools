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

const SECTION_KIND = "footer";
const SECTION_TREE = {
  "type": "frame",
  "id": "MBwXH",
  "name": "Footer",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 24,
    "padding": "36px 56px",
    "width": "100%",
    "background": "linear-gradient(180deg, #0D1524 0%, #09101A 100%)",
    "borderTop": "1px solid #2A2A2E"
  },
  "children": [
    {
      "type": "frame",
      "id": "7R68u",
      "name": "ftop",
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
          "id": "TW2dd",
          "name": "brand",
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
          "textProp": "brandtext"
        },
        {
          "type": "frame",
          "id": "dt5z9",
          "name": "contactBtn",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "padding": "12px 18px",
            "height": 46,
            "borderRadius": 999,
            "background": "#121722",
            "border": "1px solid #303849"
          },
          "children": [
            {
              "type": "text",
              "id": "Qk2Oq",
              "name": "contactTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D6DEEA",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "contacttxttext"
            }
          ],
          "hrefProp": "contactbtnhref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "hT01g",
      "name": "linkRow",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 40,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "Etada",
          "name": "col1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "yGmB6",
              "name": "col1h",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "col1htext"
            },
            {
              "type": "text",
              "id": "qjbYA",
              "name": "col1a",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AEB7C6",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "col1atext",
              "hrefProp": "col1ahref"
            },
            {
              "type": "text",
              "id": "cpoyt",
              "name": "col1b",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AEB7C6",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "col1btext",
              "hrefProp": "col1bhref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "4ivOt",
          "name": "col2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "IsQh5",
              "name": "col2h",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "col2htext"
            },
            {
              "type": "text",
              "id": "BFaVV",
              "name": "col2a",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AEB7C6",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "col2atext",
              "hrefProp": "col2ahref"
            },
            {
              "type": "text",
              "id": "hIBoX",
              "name": "col2b",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AEB7C6",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "col2btext",
              "hrefProp": "col2bhref"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "isBk8",
      "name": "bottom",
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
          "id": "ThbjV",
          "name": "copy",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 12,
            "fontWeight": "normal"
          },
          "children": [],
          "textProp": "copytext"
        },
        {
          "type": "frame",
          "id": "ipZRT",
          "name": "util",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 24
          },
          "children": [
            {
              "type": "text",
              "id": "0k9TW",
              "name": "privacy",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6B6B70",
                "fontFamily": "DM Sans",
                "fontSize": 12,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "privacytext"
            },
            {
              "type": "text",
              "id": "7vDfP",
              "name": "legal",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6B6B70",
                "fontFamily": "DM Sans",
                "fontSize": 12,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "legaltext",
              "hrefProp": "legalhref"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "MBwXH",
  "brandtext": "UNISTELLAR",
  "contactbtnhref": "/talk-to-an-expert",
  "contacttxttext": "Talk to an expert",
  "col1htext": "Products",
  "col1atext": "Smart Telescopes",
  "col1ahref": "/smart-telescopes",
  "col1btext": "Smart Binoculars",
  "col1bhref": "/smart-binoculars",
  "col2htext": "Explore",
  "col2atext": "Technologies",
  "col2ahref": "/technologies",
  "col2btext": "Reviews",
  "col2bhref": "/reviews",
  "copytext": "© 2026 Unistellar. Built for curious minds under dark skies.",
  "privacytext": "Privacy",
  "legaltext": "Legal Notice",
  "legalhref": "/legal-notice"
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

export default function TemplateExclusiveUnistellarHomeSmartTelescopesFooterFooterpenAlt5({ id, brandtext, contactbtnhref, contacttxttext, col1htext, col1atext, col1ahref, col1btext, col1bhref, col2htext, col2atext, col2ahref, col2btext, col2bhref, copytext, privacytext, legaltext, legalhref, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, brandtext, contactbtnhref, contacttxttext, col1htext, col1atext, col1ahref, col1btext, col1bhref, col2htext, col2atext, col2ahref, col2btext, col2bhref, copytext, privacytext, legaltext, legalhref });
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