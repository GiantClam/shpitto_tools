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
  "id": "EDr1s",
  "name": "aboutCta",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 16,
    "alignItems": "center",
    "padding": "48px 56px 52px 56px",
    "width": "100%",
    "background": "#0A1224",
    "border": "1px solid #23324F"
  },
  "children": [
    {
      "type": "text",
      "id": "iJvzy",
      "name": "ctaEyebrow",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#9EB4DB",
        "fontFamily": "Manrope",
        "fontSize": 12,
        "fontWeight": "500",
        "letterSpacing": 1.6,
        "textAlign": "center",
        "width": 720
      },
      "children": [],
      "textProp": "ctaeyebrowtext"
    },
    {
      "type": "text",
      "id": "LtRnx",
      "name": "ctaHead",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 50,
        "fontWeight": "600",
        "letterSpacing": -1,
        "lineHeight": 1.03,
        "textAlign": "center",
        "width": 920
      },
      "children": [],
      "textProp": "ctaheadtext"
    },
    {
      "type": "text",
      "id": "ETK5u",
      "name": "ctaBody",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#AEB8CE",
        "fontFamily": "Manrope",
        "fontSize": 14,
        "fontWeight": "normal",
        "lineHeight": 1.5,
        "textAlign": "center",
        "width": 760
      },
      "children": [],
      "textProp": "ctabodytext"
    },
    {
      "type": "frame",
      "id": "8zhGH",
      "name": "ctaButtons",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 12
      },
      "children": [
        {
          "type": "frame",
          "id": "ot9vQ",
          "name": "ctaBtnPrimary",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "padding": "0px 28px",
            "height": 54,
            "background": "#2B67F6",
            "border": "1px solid #4F84FF"
          },
          "children": [
            {
              "type": "text",
              "id": "oz5iq",
              "name": "ctaTxtPrimary",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "600",
                "letterSpacing": 1.1,
                "textAlign": "center",
                "width": 240
              },
              "children": [],
              "textProp": "ctatxtprimarytext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "HW9Mj",
          "name": "ctaBtnSecondary",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "padding": "0px 28px",
            "height": 54,
            "background": "#FFFFFF",
            "border": "1px solid #000000ff"
          },
          "children": [
            {
              "type": "text",
              "id": "YfAna",
              "name": "ctaTxtSecondary",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#000000ff",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "600",
                "letterSpacing": 1.1,
                "textAlign": "center",
                "width": 220
              },
              "children": [],
              "textProp": "ctatxtsecondarytext"
            }
          ]
        }
      ],
      "hrefProp": "ctabuttonshref"
    },
    {
      "type": "frame",
      "id": "ovI0f",
      "name": "subCtas",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 8
      },
      "children": [
        {
          "type": "frame",
          "id": "JIDOf",
          "name": "sub1",
          "style": {
            "boxSizing": "border-box",
            "padding": "10px 14px",
            "background": "#0F1520",
            "border": "1px solid #31435F"
          },
          "children": [
            {
              "type": "text",
              "id": "kG51h",
              "name": "sub1t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#E5ECFB",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "600",
                "textAlign": "center",
                "width": 150
              },
              "children": [],
              "textProp": "sub1ttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "nPel8",
          "name": "sub2",
          "style": {
            "boxSizing": "border-box",
            "padding": "10px 14px",
            "background": "#2B67F6",
            "border": "1px solid #4F84FF"
          },
          "children": [
            {
              "type": "text",
              "id": "sbPgW",
              "name": "sub2t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#DDE7FF",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "600",
                "textAlign": "center",
                "width": 170
              },
              "children": [],
              "textProp": "sub2ttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "yMD0g",
          "name": "sub3",
          "style": {
            "boxSizing": "border-box",
            "padding": "10px 14px",
            "background": "#1B2742",
            "border": "1px solid #344866"
          },
          "children": [
            {
              "type": "text",
              "id": "USopW",
              "name": "sub3t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9FB5E7",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "600",
                "textAlign": "center",
                "width": 160
              },
              "children": [],
              "textProp": "sub3ttext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "EDr1s",
  "ctaeyebrowtext": "NEXT STEP / 04",
  "ctaheadtext": "Join the next generation of observers and contribute to a more connected night sky.",
  "ctabodytext": "Whether you are buying your first smart telescope or comparing models for a serious upgrade, Unistellar gives you a path from first light to meaningful discovery.",
  "ctabuttonshref": "/explore-products",
  "ctatxtprimarytext": "EXPLORE PRODUCTS",
  "ctatxtsecondarytext": "TALK TO AN EXPERT",
  "sub1ttext": "Compare models",
  "sub2ttext": "Find an observing event",
  "sub3ttext": "Read customer stories"
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

export default function TemplateExclusiveUnistellarHomeAboutStoryAboutctapenAlt5({ id, ctaeyebrowtext, ctaheadtext, ctabodytext, ctabuttonshref, ctatxtprimarytext, ctatxtsecondarytext, sub1ttext, sub2ttext, sub3ttext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, ctaeyebrowtext, ctaheadtext, ctabodytext, ctabuttonshref, ctatxtprimarytext, ctatxtsecondarytext, sub1ttext, sub2ttext, sub3ttext });
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