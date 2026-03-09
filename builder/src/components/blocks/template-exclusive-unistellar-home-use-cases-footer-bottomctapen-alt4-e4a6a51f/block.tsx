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
  "id": "N4eH8",
  "name": "Bottom CTA",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 16,
    "alignItems": "center",
    "padding": "48px 56px",
    "width": "100%",
    "background": "linear-gradient(180deg, #111826 0%, #060A14 100%)",
    "borderTop": "1px solid #22324A",
    "borderBottom": "1px solid #22324A"
  },
  "children": [
    {
      "type": "text",
      "id": "1CG0u",
      "name": "ctaTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 32,
        "fontWeight": "700",
        "letterSpacing": -1,
        "lineHeight": 1,
        "textAlign": "center",
        "width": 900
      },
      "children": [],
      "textProp": "ctatitletext"
    },
    {
      "type": "text",
      "id": "QmS3m",
      "name": "ctaSub",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#C8D0E2",
        "fontFamily": "Manrope",
        "fontSize": 15,
        "fontWeight": "500",
        "lineHeight": 1.45,
        "textAlign": "center",
        "width": 700
      },
      "children": [],
      "textProp": "ctasubtext"
    },
    {
      "type": "frame",
      "id": "usdDi",
      "name": "ctaBtn",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "center",
        "alignItems": "center",
        "padding": "14px 24px",
        "borderRadius": 999,
        "background": "#FFFFFF",
        "border": "1px solid #FFFFFF"
      },
      "children": [
        {
          "type": "text",
          "id": "YOX9a",
          "name": "ctaBtnTxt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#0B1020",
            "fontFamily": "Space Grotesk",
            "fontSize": 11,
            "fontWeight": "700",
            "letterSpacing": 1.3
          },
          "children": [],
          "textProp": "ctabtntxttext",
          "hrefProp": "ctabtntxthref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "tZduX",
      "name": "ctaTrustRow",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 10
      },
      "children": [
        {
          "type": "frame",
          "id": "M34zG",
          "name": "ctaChip1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "alignItems": "center",
            "padding": "10px 16px",
            "borderRadius": 999,
            "background": "#13203A",
            "border": "1px solid #2A3C61"
          },
          "children": [
            {
              "type": "text",
              "id": "0ZjSW",
              "name": "ctaChip1Txt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D8E2F4",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "600",
                "letterSpacing": 0.5
              },
              "children": [],
              "textProp": "ctachip1txttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "NtaUs",
          "name": "ctaChip2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "alignItems": "center",
            "padding": "10px 16px",
            "borderRadius": 999,
            "background": "#13203A",
            "border": "1px solid #2A3C61"
          },
          "children": [
            {
              "type": "text",
              "id": "Ek5HF",
              "name": "ctaChip2Txt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D8E2F4",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "600",
                "letterSpacing": 0.5
              },
              "children": [],
              "textProp": "ctachip2txttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "NC6EX",
          "name": "ctaChip3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "alignItems": "center",
            "padding": "10px 16px",
            "borderRadius": 999,
            "background": "#13203A",
            "border": "1px solid #2A3C61"
          },
          "children": [
            {
              "type": "text",
              "id": "6oMNW",
              "name": "ctaChip3Txt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D8E2F4",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "600",
                "letterSpacing": 0.5
              },
              "children": [],
              "textProp": "ctachip3txttext"
            }
          ]
        }
      ]
    }
  ],
  "hrefProp": "bottomCtahref"
};
const DEFAULT_PROPS = {
  "id": "N4eH8",
  "bottomCtahref": "/ready-to-turn-tonight-into-your-first-great-observing-story",
  "ctatitletext": "READY TO TURN TONIGHT INTO YOUR FIRST GREAT OBSERVING STORY?",
  "ctasubtext": "Choose the setup that matches your skill level, get guided quickly, and build momentum with every clear sky window.",
  "ctabtntxttext": "BOOK A PERSONAL DEMO",
  "ctabtntxthref": "/book-a-personal-demo",
  "ctachip1txttext": "MATCHED TO YOUR EXPERIENCE LEVEL",
  "ctachip2txttext": "PERSONALIZED PRODUCT WALKTHROUGH",
  "ctachip3txttext": "QUICK START RECOMMENDATIONS"
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

export default function TemplateExclusiveUnistellarHomeUseCasesFooterBottomctapenAlt4({ id, bottomCtahref, ctatitletext, ctasubtext, ctabtntxttext, ctabtntxthref, ctachip1txttext, ctachip2txttext, ctachip3txttext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, bottomCtahref, ctatitletext, ctasubtext, ctabtntxttext, ctabtntxthref, ctachip1txttext, ctachip2txttext, ctachip3txttext });
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