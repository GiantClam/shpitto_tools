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
  "id": "EEe3G",
  "name": "Hero",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 48,
    "alignItems": "center",
    "padding": "64px 56px",
    "width": "100%"
  },
  "children": [
    {
      "type": "frame",
      "id": "znrx9",
      "name": "left",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 24,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "BNgTk",
          "name": "eye",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#97A0AE",
            "fontFamily": "DM Sans",
            "fontSize": 12,
            "fontWeight": "600",
            "letterSpacing": 1.6,
            "width": "100%"
          },
          "children": [],
          "textProp": "eyetext"
        },
        {
          "type": "text",
          "id": "4Ce9i",
          "name": "hed",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FAFAF9",
            "fontFamily": "Fraunces",
            "fontSize": 64,
            "fontWeight": "600",
            "lineHeight": 0.98,
            "width": "100%"
          },
          "children": [],
          "textProp": "hedtext"
        },
        {
          "type": "text",
          "id": "8T35i",
          "name": "sub",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#AEB7C6",
            "fontFamily": "DM Sans",
            "fontSize": 16,
            "fontWeight": "normal",
            "lineHeight": 1.55,
            "width": "100%"
          },
          "children": [],
          "textProp": "subtext"
        },
        {
          "type": "frame",
          "id": "xOY17",
          "name": "actions",
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
              "id": "o97QZ",
              "name": "cta1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "0px 28px",
                "height": 54,
                "borderRadius": 999,
                "background": "#2B67F6",
                "border": "1px solid #4F84FF"
              },
              "children": [
                {
                  "type": "text",
                  "id": "XD2Lj",
                  "name": "cta1t",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "DM Sans",
                    "fontSize": 14,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "cta1ttext"
                }
              ],
              "hrefProp": "cta1href"
            },
            {
              "type": "frame",
              "id": "uzAKP",
              "name": "cta2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "0px 28px",
                "height": 54,
                "borderRadius": 999,
                "background": "#121722",
                "border": "1px solid #303849"
              },
              "children": [
                {
                  "type": "text",
                  "id": "gwrZl",
                  "name": "cta2t",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D6DEEA",
                    "fontFamily": "DM Sans",
                    "fontSize": 14,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "cta2ttext"
                }
              ],
              "hrefProp": "cta2href"
            }
          ]
        },
        {
          "type": "text",
          "id": "LR55V",
          "name": "cred",
          "style": {
            "boxSizing": "border-box",
            "opacity": 0.8,
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "DM Sans",
            "fontSize": 12,
            "fontWeight": "600",
            "letterSpacing": 1,
            "width": "100%"
          },
          "children": [],
          "textProp": "credtext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "fyFhx",
      "name": "visual",
      "style": {
        "boxSizing": "border-box",
        "width": 584,
        "height": 438,
        "borderRadius": 24,
        "border": "1px solid #23324F",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover"
      },
      "children": [],
      "imageProp": "visualimagesrc"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "EEe3G",
  "eyetext": "SMART TELESCOPES / AUTONOMOUS STARGAZING",
  "hedtext": "See galaxies and nebulae from your backyard.",
  "subtext": "Unistellar smart telescopes align themselves, suppress light pollution, and reveal deep-sky detail live in minutes, even under city skies.",
  "cta1href": "/view-all-smart-telescopes",
  "cta1ttext": "View All Smart Telescopes",
  "cta2href": "/compare-models",
  "cta2ttext": "Compare Models",
  "credtext": "4.7★ average rating • App-guided setup • Planetarium-grade optics",
  "visualimagesrc": "https://images.unsplash.com/photo-1554212114-d6dad12fbc02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
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

export default function TemplateExclusiveUnistellarHomeSmartTelescopesHeroHeropenAlt1({ id, eyetext, hedtext, subtext, cta1href, cta1ttext, cta2href, cta2ttext, credtext, visualimagesrc, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, eyetext, hedtext, subtext, cta1href, cta1ttext, cta2href, cta2ttext, credtext, visualimagesrc });
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