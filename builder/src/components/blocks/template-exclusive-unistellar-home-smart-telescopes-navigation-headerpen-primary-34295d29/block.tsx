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

const SECTION_KIND = "navigation";
const SECTION_TREE = {
  "type": "frame",
  "id": "esrC3",
  "name": "Header",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "justifyContent": "space-between",
    "alignItems": "center",
    "padding": "0px 56px",
    "width": "100%",
    "height": 88,
    "background": "#0B0B0E",
    "borderBottom": "1px solid #2A2A2E"
  },
  "children": [
    {
      "type": "text",
      "id": "N6kRf",
      "name": "logo",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 26,
        "fontWeight": "600",
        "letterSpacing": -0.3,
        "width": 180
      },
      "children": [],
      "textProp": "logotext",
      "hrefProp": "logohref"
    },
    {
      "type": "frame",
      "id": "8C9VP",
      "name": "navLinks",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 24,
        "justifyContent": "center",
        "alignItems": "center",
        "width": 620
      },
      "children": [
        {
          "type": "text",
          "id": "DCurs",
          "name": "nh",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "nhtext",
          "hrefProp": "nhhref"
        },
        {
          "type": "text",
          "id": "ZNuzG",
          "name": "ns",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FAFAF9",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "600"
          },
          "children": [],
          "textProp": "nstext",
          "hrefProp": "nshref"
        },
        {
          "type": "text",
          "id": "0nYmd",
          "name": "nb",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "nbtext",
          "hrefProp": "nbhref"
        },
        {
          "type": "text",
          "id": "9XOtg",
          "name": "nt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "nttext",
          "hrefProp": "nthref"
        },
        {
          "type": "text",
          "id": "IK3A1",
          "name": "nr",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "nrtext",
          "hrefProp": "nrhref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "4W5L6",
      "name": "headerBtn",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "center",
        "alignItems": "center",
        "padding": "10px 18px",
        "borderRadius": 999,
        "background": "#121722",
        "border": "1px solid #303849"
      },
      "children": [
        {
          "type": "text",
          "id": "l3wgE",
          "name": "btnt",
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
          "textProp": "btnttext"
        }
      ],
      "hrefProp": "headerbtnhref"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "esrC3",
  "logotext": "UNISTELLAR",
  "logohref": "/unistellar",
  "nhtext": "Home",
  "nhhref": "/",
  "nstext": "Smart Telescopes",
  "nshref": "/smart-telescopes",
  "nbtext": "Smart Binoculars",
  "nbhref": "/smart-binoculars",
  "nttext": "Technologies",
  "nthref": "/technologies",
  "nrtext": "Reviews",
  "nrhref": "/reviews",
  "headerbtnhref": "/support-portal",
  "btnttext": "Support Portal"
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

export default function TemplateExclusiveUnistellarHomeSmartTelescopesNavigationHeaderpenPrimary({ id, logotext, logohref, nhtext, nhhref, nstext, nshref, nbtext, nbhref, nttext, nthref, nrtext, nrhref, headerbtnhref, btnttext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, logotext, logohref, nhtext, nhhref, nstext, nshref, nbtext, nbhref, nttext, nthref, nrtext, nrhref, headerbtnhref, btnttext });
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