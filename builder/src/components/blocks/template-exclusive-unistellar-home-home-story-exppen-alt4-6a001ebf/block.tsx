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
  "id": "4ymMS",
  "name": "exp",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 32,
    "padding": "72px",
    "width": "100%",
    "height": 820,
    "background": "#0D0D0D"
  },
  "children": [
    {
      "type": "frame",
      "id": "RTkby",
      "name": "expTop",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 16,
        "alignItems": "center",
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "FdTKp",
          "name": "expTag",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#9DB0D4",
            "fontFamily": "Manrope",
            "fontSize": 14,
            "fontWeight": "600",
            "letterSpacing": 1.4,
            "textAlign": "center"
          },
          "children": [],
          "textProp": "exptagtext"
        },
        {
          "type": "text",
          "id": "anqjw",
          "name": "expTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#F5F4F2",
            "fontFamily": "Space Grotesk",
            "fontSize": 64,
            "fontWeight": "600",
            "letterSpacing": -0.5,
            "lineHeight": 0.95,
            "textAlign": "center",
            "width": "100%"
          },
          "children": [],
          "textProp": "exptitletext"
        },
        {
          "type": "text",
          "id": "e9xL2",
          "name": "expBody",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#8A8A8A",
            "fontFamily": "Manrope",
            "fontSize": 24,
            "fontStyle": "italic",
            "lineHeight": 1.45,
            "textAlign": "center",
            "width": "100%"
          },
          "children": [],
          "textProp": "expbodytext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "Gjw1O",
      "name": "expMedia",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 16,
        "width": "100%",
        "height": "100%",
        "background": "#0D0D0D"
      },
      "children": [
        {
          "type": "frame",
          "id": "y3AK7",
          "name": "expCarousel",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 20,
            "width": "100%",
            "height": 330,
            "overflow": "hidden"
          },
          "children": [
            {
              "type": "frame",
              "id": "PAIMw",
              "name": "capture01",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "flex-end",
                "padding": "16px",
                "width": 352,
                "height": "100%",
                "border": "1px solid #1F1F1F",
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [
                {
                  "type": "text",
                  "id": "nxxdG",
                  "name": "cap1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#F5F4F2",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 12,
                    "letterSpacing": 2
                  },
                  "children": [],
                  "textProp": "cap1text"
                },
                {
                  "type": "text",
                  "id": "dYUZU",
                  "name": "captureMeta01",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9DB0D4",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "capturemeta01text"
                }
              ],
              "imageProp": "capture01imagesrc"
            },
            {
              "type": "frame",
              "id": "09uIH",
              "name": "capture02",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "flex-end",
                "padding": "16px",
                "width": 312,
                "height": "100%",
                "border": "1px solid #1F1F1F",
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [
                {
                  "type": "text",
                  "id": "mqsAe",
                  "name": "cap2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#F5F4F2",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 12,
                    "letterSpacing": 2
                  },
                  "children": [],
                  "textProp": "cap2text"
                },
                {
                  "type": "text",
                  "id": "NZDTt",
                  "name": "captureMeta02",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9DB0D4",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "capturemeta02text"
                }
              ],
              "imageProp": "capture02imagesrc"
            },
            {
              "type": "frame",
              "id": "AnaiU",
              "name": "capture03",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "flex-end",
                "padding": "16px",
                "width": 312,
                "height": "100%",
                "border": "1px solid #1F1F1F",
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [
                {
                  "type": "text",
                  "id": "DbGR7",
                  "name": "cap3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#F5F4F2",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 12,
                    "letterSpacing": 2
                  },
                  "children": [],
                  "textProp": "cap3text"
                },
                {
                  "type": "text",
                  "id": "FbtBL",
                  "name": "captureMeta03",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9DB0D4",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "capturemeta03text"
                }
              ],
              "imageProp": "capture03imagesrc"
            }
          ]
        },
        {
          "type": "frame",
          "id": "au2vV",
          "name": "expProgress",
          "style": {
            "boxSizing": "border-box",
            "width": "100%",
            "height": 2,
            "background": "#1F1F1F"
          },
          "children": [
            {
              "type": "frame",
              "id": "i0bVG",
              "name": "expProgressActive",
              "style": {
                "boxSizing": "border-box",
                "width": 420,
                "height": "100%",
                "background": "#2B67F6"
              },
              "children": []
            }
          ]
        },
        {
          "type": "frame",
          "id": "YkdED",
          "name": "expMetaRow",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "space-between",
            "alignItems": "center",
            "width": "100%",
            "height": 32
          },
          "children": [
            {
              "type": "text",
              "id": "CZ2RR",
              "name": "expMetaCopy",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A8A8A",
                "fontFamily": "Manrope",
                "fontSize": 16,
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "expmetacopytext"
            },
            {
              "type": "frame",
              "id": "jLV3l",
              "name": "expMetaRight",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 12,
                "alignItems": "center"
              },
              "children": [
                {
                  "type": "text",
                  "id": "D70vX",
                  "name": "expCounter",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9DB0D4",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "letterSpacing": 2
                  },
                  "children": [],
                  "textProp": "expcountertext"
                },
                {
                  "type": "text",
                  "id": "eVecY",
                  "name": "expNavHint",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#F5F4F2",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "letterSpacing": 2
                  },
                  "children": [],
                  "textProp": "expnavhinttext"
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
  "id": "4ymMS",
  "exptagtext": "THE EXPERIENCE",
  "exptitletext": "ASTROPHOTOGRAPHY\nCAPTURE RESULTS",
  "expbodytext": "Swipe through real captures made with Unistellar smart telescopes. From lunar textures to deep-sky nebulae, every frame reveals detail your eyes cannot see alone.",
  "capture01imagesrc": "https://images.unsplash.com/photo-1741016825495-1faf2afc19d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODgwNTF8&ixlib=rb-4.1.0&q=80&w=1080",
  "cap1text": "ORION NEBULA / 10M STACK",
  "capturemeta01text": "EQUINOX 2 / 96 FRAMES",
  "capture02imagesrc": "https://images.unsplash.com/photo-1713327656692-2db767c3b8de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODgwNTJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "cap2text": "MOON CRATERS / HIGH RES",
  "capturemeta02text": "DARK SKY / 2.8 SEC EXP",
  "capture03imagesrc": "https://images.unsplash.com/photo-1662328766056-7a61a2017fd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODgwNTJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "cap3text": "ANDROMEDA / LIVE ENHANCED",
  "capturemeta03text": "AUTONOMOUS STACK / LIVE",
  "expmetacopytext": "Horizontally compare adjacent captures to spot contrast, detail, and processing differences.",
  "expcountertext": "03 / 03",
  "expnavhinttext": "DRAG HORIZONTALLY"
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

export default function TemplateExclusiveUnistellarHomeHomeStoryExppenAlt4({ id, exptagtext, exptitletext, expbodytext, capture01imagesrc, cap1text, capturemeta01text, capture02imagesrc, cap2text, capturemeta02text, capture03imagesrc, cap3text, capturemeta03text, expmetacopytext, expcountertext, expnavhinttext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, exptagtext, exptitletext, expbodytext, capture01imagesrc, cap1text, capturemeta01text, capture02imagesrc, cap2text, capturemeta02text, capture03imagesrc, cap3text, capturemeta03text, expmetacopytext, expcountertext, expnavhinttext });
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