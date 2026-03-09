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

const SECTION_KIND = "approach";
const SECTION_TREE = {
  "type": "frame",
  "id": "4NeZt",
  "name": "Feature Cards",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 24,
    "padding": "48px 56px",
    "width": "100%",
    "background": "#090E1A"
  },
  "children": [
    {
      "type": "text",
      "id": "BQpKz",
      "name": "featuresEyebrow",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#97A0AE",
        "fontFamily": "DM Sans",
        "fontSize": 12,
        "fontWeight": "600",
        "letterSpacing": 1.4
      },
      "children": [],
      "textProp": "featureseyebrowtext"
    },
    {
      "type": "text",
      "id": "hDEXo",
      "name": "featuresTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 40,
        "fontWeight": "600",
        "lineHeight": 1.02,
        "width": "100%"
      },
      "children": [],
      "textProp": "featurestitletext"
    },
    {
      "type": "text",
      "id": "GPEN9",
      "name": "featuresSub",
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
      "textProp": "featuressubtext"
    },
    {
      "type": "frame",
      "id": "U6bur",
      "name": "featureGrid",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 20,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "MS6ve",
          "name": "card1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "padding": "24px",
            "width": "100%",
            "background": "#0B1220",
            "border": "1px solid #1A2538"
          },
          "children": [
            {
              "type": "text",
              "id": "tVbdR",
              "name": "card1Tag",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9DB0D4",
                "fontFamily": "DM Sans",
                "fontSize": 11,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "card1tagtext"
            },
            {
              "type": "text",
              "id": "MQLn9",
              "name": "card1Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAF8F5",
                "fontFamily": "Fraunces",
                "fontSize": 20,
                "fontWeight": "normal",
                "width": "100%"
              },
              "children": [],
              "textProp": "card1titletext"
            },
            {
              "type": "text",
              "id": "KQrRB",
              "name": "card1Body",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#888888",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "card1bodytext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "duSWc",
          "name": "card2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "padding": "24px",
            "width": "100%",
            "background": "#0B1220",
            "border": "1px solid #1A2538"
          },
          "children": [
            {
              "type": "text",
              "id": "KmLIW",
              "name": "card2Tag",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9DB0D4",
                "fontFamily": "DM Sans",
                "fontSize": 11,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "card2tagtext"
            },
            {
              "type": "text",
              "id": "5Md7g",
              "name": "card2Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAF8F5",
                "fontFamily": "Fraunces",
                "fontSize": 20,
                "fontWeight": "normal",
                "width": "100%"
              },
              "children": [],
              "textProp": "card2titletext"
            },
            {
              "type": "text",
              "id": "xtUrn",
              "name": "card2Body",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#888888",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "card2bodytext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "ERo8c",
          "name": "card3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "padding": "24px",
            "width": "100%",
            "background": "#0B1220",
            "border": "1px solid #1A2538"
          },
          "children": [
            {
              "type": "text",
              "id": "khIQr",
              "name": "card3Tag",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9DB0D4",
                "fontFamily": "DM Sans",
                "fontSize": 11,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "card3tagtext"
            },
            {
              "type": "text",
              "id": "ylcpj",
              "name": "card3Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAF8F5",
                "fontFamily": "Fraunces",
                "fontSize": 20,
                "fontWeight": "normal",
                "width": "100%"
              },
              "children": [],
              "textProp": "card3titletext"
            },
            {
              "type": "text",
              "id": "OX17S",
              "name": "card3Body",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#888888",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "card3bodytext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "4NeZt",
  "featureseyebrowtext": "ENViSION PLATFORM",
  "featurestitletext": "Three Layers of Envisioned Discovery",
  "featuressubtext": "Envision combines adaptive optics, live recognition, and guided storytelling so every session flows from first target to cinematic reveal.",
  "card1tagtext": "SEE",
  "card1titletext": "Adaptive Vision Core",
  "card1bodytext": "Auto-calibrated optics continuously rebalance contrast and glare, keeping faint structure visible as sky conditions shift.",
  "card2tagtext": "KNOW",
  "card2titletext": "Sky Intelligence Engine",
  "card2bodytext": "Real-time recognition identifies objects, events, and context overlays so you understand what you are seeing in the moment.",
  "card3tagtext": "EXPLORE",
  "card3titletext": "Cinematic Guidance Layer",
  "card3bodytext": "A refined guidance flow recommends next-best targets and framing cues, turning each observation into a directed journey."
};
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };
const PEN_RUNTIME_MOTION_STYLE = "@keyframes pen-media-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}@keyframes pen-node-rise{0%{opacity:0;transform:translate3d(0,10px,0)}100%{opacity:1;transform:translate3d(0,0,0)}}";

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
      mediaBreathe: true,
      contentStagger: true,
    };
  }
  if (sectionKindToken === "navigation" || sectionKindToken === "footer") {
    return {
      level: "subtle",
      revealPreset: "fadeIn",
      delayStep: 20,
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

const isHeadingLikeTextNode = (node) => {
  const lowerName = String(node?.name || "").trim().toLowerCase();
  if (/(title|headline|hero|eyebrow|heading)/.test(lowerName)) return true;
  return resolveFontSize(node?.style?.fontSize) >= 22;
};

const buildNodeClassName = (node, sectionMotion) => {
  if (!sectionMotion || sectionMotion.level === "off") return "";
  const classes = [];
  if (node?.hrefProp) classes.push("hover-lift");
  if (node?.type === "frame" && node?.imageProp) classes.push("will-change-transform");
  return classes.join(" ");
};

const buildNodeStyle = (node, merged, sectionMotion, keyPath) => {
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
    if (
      Boolean(sectionMotion?.contentStagger) &&
      !style.animation &&
      String(keyPath || "") !== "root" &&
      (node?.type === "frame" || node?.type === "text")
    ) {
      style.animation = "pen-node-rise 620ms var(--ease-smooth, ease) both";
      if (delayMs > 0) style.animationDelay = style.animationDelay || `${delayMs}ms`;
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

const renderNode = (node, merged, sectionMotion, key = "root") => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged, sectionMotion, key);
  const className = buildNodeClassName(node, sectionMotion) || undefined;
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
      renderTextContent(node, merged, key, sectionMotion)
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
      ? node.children.map((child, index) => renderNode(child, merged, sectionMotion, `${key}-${index}`))
      : [])
  );
};

export default function TemplateExclusiveUnistellarHomeSmartBinocularsApproachFeaturecardspenAlt2({ id, featureseyebrowtext, featurestitletext, featuressubtext, card1tagtext, card1titletext, card1bodytext, card2tagtext, card2titletext, card2bodytext, card3tagtext, card3titletext, card3bodytext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, featureseyebrowtext, featurestitletext, featuressubtext, card1tagtext, card1titletext, card1bodytext, card2tagtext, card2titletext, card2bodytext, card3tagtext, card3titletext, card3bodytext });
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
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": SECTION_KIND,
      className: sectionClassName,
      style: sectionStyle,
    },
    ...(sectionMotion?.level !== "off"
      ? [React.createElement("style", { key: "pen-motion-style" }, PEN_RUNTIME_MOTION_STYLE)]
      : []),
    renderNode(SECTION_TREE, merged, sectionMotion, "root")
  );
}