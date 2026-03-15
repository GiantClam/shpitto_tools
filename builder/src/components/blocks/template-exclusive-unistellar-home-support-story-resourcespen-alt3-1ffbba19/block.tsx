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
  "id": "cjQmY",
  "name": "Resources",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 20,
    "padding": "44px 72px 56px 72px",
    "width": "100%",
    "height": 420,
    "background": "#060A14"
  },
  "children": [
    {
      "type": "frame",
      "id": "tvyJ1",
      "name": "resHead",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "alignItems": "flex-end",
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "PUSGz",
          "name": "resTitleWrap",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "width": 520
          },
          "children": [
            {
              "type": "frame",
              "id": "BgK8Y",
              "name": "resLabelRow",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 12,
                "alignItems": "center",
                "width": 260,
                "height": 16
              },
              "children": [
                {
                  "type": "frame",
                  "id": "rGxjL",
                  "name": "resLine",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 24,
                    "height": 2,
                    "background": "#2B67F6"
                  },
                  "children": []
                },
                {
                  "type": "text",
                  "id": "NPaX4",
                  "name": "resLabel",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "700",
                    "letterSpacing": 2
                  },
                  "children": [],
                  "textProp": "reslabeltext"
                }
              ]
            },
            {
              "type": "text",
              "id": "qfD27",
              "name": "resTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 32,
                "fontWeight": "700",
                "letterSpacing": -1.1,
                "lineHeight": 1.08,
                "width": 520
              },
              "children": [],
              "textProp": "restitletext"
            }
          ]
        },
        {
          "type": "text",
          "id": "9aW9G",
          "name": "resMeta",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#A7B3CC",
            "fontFamily": "Manrope",
            "fontSize": 12,
            "lineHeight": 1.38,
            "textAlign": "right",
            "width": 220
          },
          "children": [],
          "textProp": "resmetatext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "S3ADF",
      "name": "resRow",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 16,
        "width": "100%",
        "height": 246
      },
      "children": [
        {
          "type": "frame",
          "id": "0KLCO",
          "name": "res1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "padding": "20px",
            "width": "100%",
            "height": "100%",
            "borderRadius": 12,
            "background": "#111826",
            "border": "1px solid #243047"
          },
          "children": [
            {
              "type": "text",
              "id": "kXt89",
              "name": "res1k",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8DA0C2",
                "fontFamily": "Manrope",
                "fontSize": 10,
                "fontWeight": "700",
                "letterSpacing": 1.5
              },
              "children": [],
              "textProp": "res1ktext"
            },
            {
              "type": "text",
              "id": "yYQgS",
              "name": "res1t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 20,
                "fontWeight": "700",
                "letterSpacing": -0.5,
                "lineHeight": 1.12,
                "width": "100%"
              },
              "children": [],
              "textProp": "res1ttext"
            },
            {
              "type": "text",
              "id": "URPqZ",
              "name": "res1d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A8A8A",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "lineHeight": 1.4,
                "width": "100%"
              },
              "children": [],
              "textProp": "res1dtext"
            },
            {
              "type": "text",
              "id": "LDQKl",
              "name": "res1f",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "res1ftext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "wiATV",
          "name": "res2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "padding": "20px",
            "width": "100%",
            "height": "100%",
            "borderRadius": 12,
            "background": "#101826",
            "border": "1px solid #243047"
          },
          "children": [
            {
              "type": "text",
              "id": "7t3rs",
              "name": "res2k",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8DA0C2",
                "fontFamily": "Manrope",
                "fontSize": 10,
                "fontWeight": "700",
                "letterSpacing": 1.5
              },
              "children": [],
              "textProp": "res2ktext"
            },
            {
              "type": "text",
              "id": "Re6EB",
              "name": "res2t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 20,
                "fontWeight": "700",
                "letterSpacing": -0.5,
                "lineHeight": 1.12,
                "width": "100%"
              },
              "children": [],
              "textProp": "res2ttext"
            },
            {
              "type": "text",
              "id": "8zAMW",
              "name": "res2d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A8A8A",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "lineHeight": 1.4,
                "width": "100%"
              },
              "children": [],
              "textProp": "res2dtext"
            },
            {
              "type": "text",
              "id": "57VKm",
              "name": "res2f",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "res2ftext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "penJ0",
          "name": "res3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "padding": "20px",
            "width": 320,
            "height": "100%",
            "borderRadius": 16,
            "background": "#13203A",
            "border": "1px solid #2A3C61"
          },
          "children": [
            {
              "type": "text",
              "id": "2XoUE",
              "name": "res3k",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#E5ECFB",
                "fontFamily": "Manrope",
                "fontSize": 10,
                "fontWeight": "700",
                "letterSpacing": 1.5
              },
              "children": [],
              "textProp": "res3ktext"
            },
            {
              "type": "text",
              "id": "VXDzH",
              "name": "res3t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 22,
                "fontWeight": "700",
                "letterSpacing": -0.5,
                "lineHeight": 1.08,
                "width": "100%"
              },
              "children": [],
              "textProp": "res3ttext"
            },
            {
              "type": "text",
              "id": "sfj4f",
              "name": "res3d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#A7B3CC",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "500",
                "lineHeight": 1.4,
                "width": "100%"
              },
              "children": [],
              "textProp": "res3dtext"
            },
            {
              "type": "text",
              "id": "Psuao",
              "name": "res3f",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "res3ftext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "cjQmY",
  "reslabeltext": "RESOURCES & LEARNING",
  "restitletext": "A clearer ladder from quick fix to expert guidance.",
  "resmetatext": "Use the left-to-right order when you need speed, depth, then personal help.",
  "res1ktext": "QUICK START",
  "res1ttext": "Field manuals and issue checklists",
  "res1dtext": "Start here when you want the fastest answer during setup or a live observing session.",
  "res1ftext": "Open quick-reference docs",
  "res2ktext": "DEEPER LEARNING",
  "res2ttext": "Tutorials, webinars, and workflow best practices",
  "res2dtext": "Build confidence beyond the fix with guided learning on capture quality, target planning, and session habits.",
  "res2ftext": "Browse guided sessions",
  "res3ktext": "HUMAN SUPPORT",
  "res3ttext": "Need a specialist to review your case?",
  "res3dtext": "Escalate with context when self-service is not enough and you need guided diagnostics or ownership review.",
  "res3ftext": "Prepare request details"
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

export default function TemplateExclusiveUnistellarHomeSupportStoryResourcespenAlt3({ id, reslabeltext, restitletext, resmetatext, res1ktext, res1ttext, res1dtext, res1ftext, res2ktext, res2ttext, res2dtext, res2ftext, res3ktext, res3ttext, res3dtext, res3ftext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, reslabeltext, restitletext, resmetatext, res1ktext, res1ttext, res1dtext, res1ftext, res2ktext, res2ttext, res2dtext, res2ftext, res3ktext, res3ttext, res3dtext, res3ftext });
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