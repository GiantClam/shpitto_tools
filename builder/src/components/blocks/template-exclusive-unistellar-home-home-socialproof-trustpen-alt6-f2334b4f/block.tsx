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

const SECTION_KIND = "socialproof";
const SECTION_TREE = {
  "type": "frame",
  "id": "YVija",
  "name": "trust",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 20,
    "alignItems": "center",
    "padding": "56px 72px",
    "width": "100%",
    "background": "#0A0A0A"
  },
  "children": [
    {
      "type": "text",
      "id": "0YdFy",
      "name": "trustT",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 40,
        "fontWeight": "600",
        "letterSpacing": -0.5
      },
      "children": [],
      "textProp": "trustttext"
    },
    {
      "type": "text",
      "id": "PnXnr",
      "name": "trustD",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#CCCCCC",
        "fontFamily": "Manrope",
        "fontSize": 16,
        "lineHeight": 1.4,
        "textAlign": "center",
        "width": "100%"
      },
      "children": [],
      "textProp": "trustdtext"
    },
    {
      "type": "frame",
      "id": "fhPfA",
      "name": "partnerWall",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 12,
        "padding": "6px 0px",
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "qbo6J",
          "name": "partnerRowA",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 12,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "L7WhS",
              "name": "cardA1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "14px 20px",
                "width": "100%",
                "borderRadius": 8,
                "border": "1px solid #2A2A2A"
              },
              "children": [
                {
                  "type": "text",
                  "id": "1svjF",
                  "name": "labelA1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "fontWeight": "500",
                    "letterSpacing": 0.8
                  },
                  "children": [],
                  "textProp": "labela1text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "umtxf",
              "name": "cardA2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "14px 20px",
                "width": "100%",
                "borderRadius": 8,
                "border": "1px solid #2A2A2A"
              },
              "children": [
                {
                  "type": "text",
                  "id": "CfC9V",
                  "name": "labelA2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "fontWeight": "500",
                    "letterSpacing": 0.8
                  },
                  "children": [],
                  "textProp": "labela2text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "0UbIh",
              "name": "cardA3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "14px 20px",
                "width": "100%",
                "borderRadius": 8,
                "border": "1px solid #2A2A2A"
              },
              "children": [
                {
                  "type": "text",
                  "id": "g0JNG",
                  "name": "labelA3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "fontWeight": "500",
                    "letterSpacing": 0.8
                  },
                  "children": [],
                  "textProp": "labela3text"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "HUhhZ",
          "name": "partnerRowB",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 12,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "EQtXm",
              "name": "cardB1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "14px 20px",
                "width": "100%",
                "borderRadius": 8,
                "border": "1px solid #2A2A2A"
              },
              "children": [
                {
                  "type": "text",
                  "id": "STTIp",
                  "name": "labelB1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#CCCCCC",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "fontWeight": "500",
                    "letterSpacing": 0.8
                  },
                  "children": [],
                  "textProp": "labelb1text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "d6PEu",
              "name": "cardB2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "14px 20px",
                "width": "100%",
                "borderRadius": 8,
                "border": "1px solid #2A2A2A"
              },
              "children": [
                {
                  "type": "text",
                  "id": "fHqoY",
                  "name": "labelB2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#CCCCCC",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "fontWeight": "500",
                    "letterSpacing": 0.8
                  },
                  "children": [],
                  "textProp": "labelb2text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "zUHAQ",
              "name": "cardB3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "14px 20px",
                "width": "100%",
                "borderRadius": 8,
                "border": "1px solid #2A2A2A"
              },
              "children": [
                {
                  "type": "text",
                  "id": "MMDPo",
                  "name": "labelB3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#CCCCCC",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "fontWeight": "500",
                    "letterSpacing": 0.8
                  },
                  "children": [],
                  "textProp": "labelb3text"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "YVija",
  "trustttext": "Trusted by Leading Partners",
  "trustdtext": "A trusted ecosystem of observatories, publishers, and research organizations building with Unistellar.",
  "labela1text": "◼ NASA",
  "labela2text": "◼ SETI",
  "labela3text": "◼ SPACE.COM",
  "labelb1text": "◻ ASTRONOMY",
  "labelb2text": "◻ JPL",
  "labelb3text": "◻ SKY & TELESCOPE"
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

export default function TemplateExclusiveUnistellarHomeHomeSocialproofTrustpenAlt6({ id, trustttext, trustdtext, labela1text, labela2text, labela3text, labelb1text, labelb2text, labelb3text, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, trustttext, trustdtext, labela1text, labela2text, labela3text, labelb1text, labelb2text, labelb3text });
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