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
  "id": "rlYrR",
  "name": "contactFooter",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 28,
    "padding": "36px 64px 0px 64px",
    "width": "100%",
    "height": 360,
    "background": "#111111",
    "borderTop": "1px solid #2B2B2B"
  },
  "children": [
    {
      "type": "frame",
      "id": "Grg48",
      "name": "footerTop",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 24,
        "width": "100%",
        "height": 220
      },
      "children": [
        {
          "type": "frame",
          "id": "WiDfx",
          "name": "footerBrand",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": "100%",
            "height": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "4SAJI",
              "name": "footerLogo",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F5F5F5",
                "fontFamily": "Newsreader",
                "fontSize": 24,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "footerlogotext"
            },
            {
              "type": "text",
              "id": "PJJY2",
              "name": "footerDesc",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AFAFAF",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "footerdesctext",
              "hrefProp": "footerdeschref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "sQPzx",
          "name": "footerCol1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 8,
            "width": "100%",
            "height": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "bH1zD",
              "name": "footerCol1T",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#888888",
                "fontFamily": "JetBrains Mono",
                "fontSize": 11,
                "fontWeight": "600",
                "letterSpacing": 2
              },
              "children": [],
              "textProp": "footercol1ttext"
            },
            {
              "type": "text",
              "id": "59bKN",
              "name": "footerC11",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AFAFAF",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "footerc11text",
              "hrefProp": "footerc11href"
            },
            {
              "type": "text",
              "id": "BBkPn",
              "name": "footerC12",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AFAFAF",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "footerc12text",
              "hrefProp": "footerc12href"
            },
            {
              "type": "text",
              "id": "9yUkG",
              "name": "footerC13",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AFAFAF",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "footerc13text",
              "hrefProp": "footerc13href"
            }
          ]
        },
        {
          "type": "frame",
          "id": "noyuf",
          "name": "footerCol2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 8,
            "width": "100%",
            "height": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "5TetD",
              "name": "footerCol2T",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#888888",
                "fontFamily": "JetBrains Mono",
                "fontSize": 11,
                "fontWeight": "600",
                "letterSpacing": 2
              },
              "children": [],
              "textProp": "footercol2ttext"
            },
            {
              "type": "text",
              "id": "zX6Rm",
              "name": "footerC21",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AFAFAF",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "footerc21text",
              "hrefProp": "footerc21href"
            },
            {
              "type": "text",
              "id": "GYKn1",
              "name": "footerC22",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AFAFAF",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "footerc22text",
              "hrefProp": "footerc22href"
            },
            {
              "type": "text",
              "id": "iHNeu",
              "name": "footerC23",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AFAFAF",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "footerc23text",
              "hrefProp": "footerc23href"
            }
          ]
        },
        {
          "type": "frame",
          "id": "vrjld",
          "name": "footerCol3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 8,
            "width": "100%",
            "height": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "8SRJo",
              "name": "footerCol3T",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#888888",
                "fontFamily": "JetBrains Mono",
                "fontSize": 11,
                "fontWeight": "600",
                "letterSpacing": 2
              },
              "children": [],
              "textProp": "footercol3ttext"
            },
            {
              "type": "text",
              "id": "r3hl1",
              "name": "footerC31",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AFAFAF",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "footerc31text",
              "hrefProp": "footerc31href"
            },
            {
              "type": "text",
              "id": "6jqnR",
              "name": "footerC32",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AFAFAF",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "footerc32text",
              "hrefProp": "footerc32href"
            },
            {
              "type": "text",
              "id": "EG6xU",
              "name": "footerC33",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AFAFAF",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "footerc33text",
              "hrefProp": "footerc33href"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "U3RUT",
      "name": "footerBottom",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "alignItems": "center",
        "width": "100%",
        "height": 44,
        "borderTop": "1px solid #2B2B2B"
      },
      "children": [
        {
          "type": "text",
          "id": "CxwUK",
          "name": "footerLegal",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#888888",
            "fontFamily": "JetBrains Mono",
            "fontSize": 10,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "footerlegaltext"
        },
        {
          "type": "text",
          "id": "kyFI2",
          "name": "footerTerms",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#888888",
            "fontFamily": "JetBrains Mono",
            "fontSize": 10,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "footertermstext",
          "hrefProp": "footertermshref"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "rlYrR",
  "footerlogotext": "MASTER & DYNAMIC",
  "footerdesctext": "Thoughtfully designed audio tools for your daily rituals.",
  "footerdeschref": "/thoughtfully-designed-audio-tools-for-your-daily-rituals",
  "footercol1ttext": "SHOP",
  "footerc11text": "Headphones",
  "footerc11href": "/headphones",
  "footerc12text": "Earphones",
  "footerc12href": "/earphones",
  "footerc13text": "Speakers",
  "footerc13href": "/speakers",
  "footercol2ttext": "SUPPORT",
  "footerc21text": "Contact",
  "footerc21href": "/contact",
  "footerc22text": "Warranty",
  "footerc22href": "/warranty",
  "footerc23text": "Returns",
  "footerc23href": "/returns",
  "footercol3ttext": "FOLLOW",
  "footerc31text": "Instagram",
  "footerc31href": "/instagram",
  "footerc32text": "YouTube",
  "footerc32href": "/youtube",
  "footerc33text": "X / Twitter",
  "footerc33href": "/x-twitter",
  "footerlegaltext": "© 2026 Master & Dynamic. All Rights Reserved.",
  "footertermstext": "Privacy Policy · Terms",
  "footertermshref": "/privacy-policy-terms"
};
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };
const PEN_RUNTIME_MOTION_STYLE = "@keyframes pen-media-breathe{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-8px,0) scale(1.035)}}@keyframes pen-track-slide-x-subtle{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-32px,0,0)}}@keyframes pen-track-slide-x-showcase{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-52px,0,0)}}@keyframes pen-card-float{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-10px,0)}}";

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

const resolveNumericDimension = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
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

const getNodeNameToken = (node) => String(node?.name || "").trim().toLowerCase();

const shouldApplyStoryTrackMotion = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "story") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  const name = getNodeNameToken(node);
  const direction = String(node?.style?.flexDirection || "").trim().toLowerCase();
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  const rowLike = /(?:row|track|carousel|strip|rail)/.test(name);
  return direction === "row" && (rowLike || childCount >= 2);
};

const shouldApplyStoryCardHover = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "story") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  const name = getNodeNameToken(node);
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  return /(?:card|cards|grid|tile)/.test(name) && childCount > 0;
};

const shouldApplyStoryCardFloat = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "story") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  if (!node?.imageProp) return false;
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  if (childCount < 1) return false;
  const width = resolveNumericDimension(node?.style?.width);
  const height = resolveNumericDimension(node?.style?.height);
  const cardLikeWidth = width > 0 ? width <= 460 : true;
  const cardLikeHeight = height > 0 ? height >= 220 : true;
  return cardLikeWidth && cardLikeHeight;
};

const buildNodeClassName = (node, sectionMotion, sectionKindToken) => {
  if (!sectionMotion || sectionMotion.level === "off") return "";
  const classes = [];
  if (node?.hrefProp) classes.push("hover-lift");
  if (node?.type === "frame" && node?.imageProp) classes.push("will-change-transform");
  if (shouldApplyStoryCardHover(node, sectionKindToken)) classes.push("hover-lift");
  if (shouldApplyStoryTrackMotion(node, sectionKindToken)) classes.push("will-change-transform", "pen-track-slide");
  return classes.join(" ");
};

const buildNodeStyle = (node, merged, sectionMotion, sectionKindToken, keyPath) => {
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
    if (shouldApplyStoryTrackMotion(node, sectionKindToken) && !style.animation) {
      const animationName = motionLevel === "showcase" ? "pen-track-slide-x-showcase" : "pen-track-slide-x-subtle";
      const duration = motionLevel === "showcase" ? "10s" : "14s";
      style.animation = `${animationName} ${duration} var(--ease-smooth, ease-in-out) infinite`;
      style.willChange = style.willChange || "transform";
      style.transformOrigin = style.transformOrigin || "center center";
    }
    if (shouldApplyStoryCardFloat(node, sectionKindToken) && !style.animation) {
      const duration = motionLevel === "showcase" ? "4.2s" : "5.6s";
      style.animation = `pen-card-float ${duration} var(--ease-smooth, ease-in-out) infinite`;
      style.willChange = style.willChange || "transform";
      style.transformOrigin = style.transformOrigin || "50% 55%";
    }
    if (Boolean(sectionMotion?.contentStagger)) {
      // Keep static visual fidelity: stagger only via transition delay, not enter keyframes.
      if (delayMs > 0) style.transitionDelay = style.transitionDelay || `${delayMs}ms`;
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

const renderNode = (node, merged, sectionMotion, sectionKindToken, key = "root") => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged, sectionMotion, sectionKindToken, key);
  const className = buildNodeClassName(node, sectionMotion, sectionKindToken) || undefined;
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
      ? node.children.map((child, index) => renderNode(child, merged, sectionMotion, sectionKindToken, `${key}-${index}`))
      : [])
  );
};

export default function TemplateExclusivePenSiteMasterdynamicContactFooterContactfooterpenAlt3({ id, footerlogotext, footerdesctext, footerdeschref, footercol1ttext, footerc11text, footerc11href, footerc12text, footerc12href, footerc13text, footerc13href, footercol2ttext, footerc21text, footerc21href, footerc22text, footerc22href, footerc23text, footerc23href, footercol3ttext, footerc31text, footerc31href, footerc32text, footerc32href, footerc33text, footerc33href, footerlegaltext, footertermstext, footertermshref, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, footerlogotext, footerdesctext, footerdeschref, footercol1ttext, footerc11text, footerc11href, footerc12text, footerc12href, footerc13text, footerc13href, footercol2ttext, footerc21text, footerc21href, footerc22text, footerc22href, footerc23text, footerc23href, footercol3ttext, footerc31text, footerc31href, footerc32text, footerc32href, footerc33text, footerc33href, footerlegaltext, footertermstext, footertermshref });
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
    renderNode(SECTION_TREE, merged, sectionMotion, sectionKindToken, "root")
  );
}