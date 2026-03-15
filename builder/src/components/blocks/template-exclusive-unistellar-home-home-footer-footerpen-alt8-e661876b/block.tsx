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
  "id": "HAujr",
  "name": "footer",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 28,
    "padding": "54px 72px",
    "width": "100%",
    "background": "#050914"
  },
  "children": [
    {
      "type": "frame",
      "id": "UZb84",
      "name": "ftTop",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "BzocC",
          "name": "ftBrand",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "width": 300
          },
          "children": [
            {
              "type": "text",
              "id": "IpQgP",
              "name": "ftLogo",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 24,
                "fontWeight": "700",
                "letterSpacing": 1.4
              },
              "children": [],
              "textProp": "ftlogotext"
            },
            {
              "type": "text",
              "id": "JDWlc",
              "name": "ftDesc",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9AA7C1",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "ftdesctext",
              "hrefProp": "ftdeschref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "mLyLT",
          "name": "ftCols",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "space-between",
            "width": 900
          },
          "children": [
            {
              "type": "text",
              "id": "taoZ9",
              "name": "col1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D1DAEB",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.9,
                "width": 190
              },
              "children": [],
              "textProp": "col1text"
            },
            {
              "type": "text",
              "id": "2wmZ5",
              "name": "col2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D1DAEB",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.9,
                "width": 190
              },
              "children": [],
              "textProp": "col2text",
              "hrefProp": "col2href"
            },
            {
              "type": "text",
              "id": "u5xwv",
              "name": "col3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D1DAEB",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.9,
                "width": 190
              },
              "children": [],
              "textProp": "col3text",
              "hrefProp": "col3href"
            },
            {
              "type": "text",
              "id": "hy5iO",
              "name": "col4",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D1DAEB",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.9,
                "width": 190
              },
              "children": [],
              "textProp": "col4text",
              "hrefProp": "col4href"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "ourrl",
      "name": "ftBottom",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "padding": "20px 0px",
        "width": "100%",
        "borderTop": "1px solid #1B2538"
      },
      "children": [
        {
          "type": "text",
          "id": "5nxfC",
          "name": "copy",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#7E8CA8",
            "fontFamily": "Manrope",
            "fontSize": 13
          },
          "children": [],
          "textProp": "copytext"
        },
        {
          "type": "frame",
          "id": "sgqEp",
          "name": "policyLinks",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 20,
            "alignItems": "center"
          },
          "children": [
            {
              "type": "text",
              "id": "wHVvC",
              "name": "policyHome1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#7E8CA8",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "policyhome1text"
            },
            {
              "type": "text",
              "id": "mmPC4",
              "name": "policyHome2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#7E8CA8",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "policyhome2text",
              "hrefProp": "policyhome2href"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "HAujr",
  "ftlogotext": "UNISTELLAR",
  "ftdesctext": "The future of day and night exploration.",
  "ftdeschref": "/the-future-of-day-and-night-exploration",
  "col1text": "Products\nSmart Telescopes\nSmart Binoculars\nAccessories",
  "col2text": "Support\nHelp Center\nManuals\nContact",
  "col2href": "/support",
  "col3text": "Company\nAbout\nPress\nCareers",
  "col3href": "/company",
  "col4text": "Community\nEvents\nBlog\nPartners",
  "col4href": "/community",
  "copytext": "© 2026 Unistellar. All rights reserved.",
  "policyhome1text": "Privacy Policy",
  "policyhome2text": "Terms",
  "policyhome2href": "/terms"
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

export default function TemplateExclusiveUnistellarHomeHomeFooterFooterpenAlt8({ id, ftlogotext, ftdesctext, ftdeschref, col1text, col2text, col2href, col3text, col3href, col4text, col4href, copytext, policyhome1text, policyhome2text, policyhome2href, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, ftlogotext, ftdesctext, ftdeschref, col1text, col2text, col2href, col3text, col3href, col4text, col4href, copytext, policyhome1text, policyhome2text, policyhome2href });
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