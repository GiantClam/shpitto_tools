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
  "id": "OnJeq",
  "name": "Use Case Hero",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 56,
    "alignItems": "center",
    "padding": "64px 56px 60px 56px",
    "width": "100%",
    "height": 612,
    "background": "linear-gradient(180deg, #111826 0%, #060A14 100%)"
  },
  "children": [
    {
      "type": "frame",
      "id": "MIFxr",
      "name": "heroCopy",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 18,
        "justifyContent": "center",
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "LmxGl",
          "name": "heroTag",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 12,
            "alignItems": "center"
          },
          "children": [
            {
              "type": "rectangle",
              "id": "LXNoy",
              "name": "heroBar",
              "style": {
                "boxSizing": "border-box",
                "width": 3,
                "height": 14,
                "background": "#2b67f6"
              },
              "children": []
            },
            {
              "type": "text",
              "id": "PlQho",
              "name": "heroTagTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9db0d4",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "600",
                "letterSpacing": 1.4
              },
              "children": [],
              "textProp": "herotagtxttext"
            }
          ]
        },
        {
          "type": "text",
          "id": "94H8L",
          "name": "heroTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Space Grotesk",
            "fontSize": 50,
            "fontWeight": "700",
            "letterSpacing": -1.2,
            "lineHeight": 0.95,
            "width": "100%"
          },
          "children": [],
          "textProp": "herotitletext"
        },
        {
          "type": "text",
          "id": "lzwnR",
          "name": "heroSub",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C8D0E2",
            "fontFamily": "Manrope",
            "fontSize": 16,
            "fontWeight": "500",
            "lineHeight": 1.45,
            "width": "100%"
          },
          "children": [],
          "textProp": "herosubtext"
        },
        {
          "type": "frame",
          "id": "W0ek3",
          "name": "heroCtas",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 12
          },
          "children": [
            {
              "type": "frame",
              "id": "eh7bn",
              "name": "ctaPrimary",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "14px 22px",
                "borderRadius": 999,
                "background": "#FFFFFF",
                "border": "1px solid #FFFFFF"
              },
              "children": [
                {
                  "type": "text",
                  "id": "GYFO3",
                  "name": "ctaPrimaryTxt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0B1020",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 11,
                    "fontWeight": "700",
                    "letterSpacing": 1.2
                  },
                  "children": [],
                  "textProp": "ctaprimarytxttext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "Ks483",
              "name": "ctaSecondary",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "14px 22px",
                "borderRadius": 999,
                "background": "#101624",
                "border": "1px solid #2F3D5C"
              },
              "children": [
                {
                  "type": "text",
                  "id": "wRgBc",
                  "name": "ctaSecondaryTxt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#E7EEF9",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1.2
                  },
                  "children": [],
                  "textProp": "ctasecondarytxttext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "GZsoB",
          "name": "heroTrustRow",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 12
          },
          "children": [
            {
              "type": "frame",
              "id": "jbAyB",
              "name": "trustChip1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "alignItems": "center",
                "padding": "10px 16px",
                "borderRadius": 999,
                "background": "#0D1320",
                "border": "1px solid #202B40"
              },
              "children": [
                {
                  "type": "text",
                  "id": "aztXB",
                  "name": "trustChip1Txt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#E5EAF5",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.1
                  },
                  "children": [],
                  "textProp": "trustchip1txttext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "nirhm",
              "name": "trustChip2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "alignItems": "center",
                "padding": "10px 16px",
                "borderRadius": 999,
                "background": "#0D1320",
                "border": "1px solid #202B40"
              },
              "children": [
                {
                  "type": "text",
                  "id": "q73gK",
                  "name": "trustChip2Txt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#E5EAF5",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.1
                  },
                  "children": [],
                  "textProp": "trustchip2txttext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "z6ERX",
              "name": "trustChip3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "alignItems": "center",
                "padding": "10px 16px",
                "borderRadius": 999,
                "background": "#0D1320",
                "border": "1px solid #202B40"
              },
              "children": [
                {
                  "type": "text",
                  "id": "tRlsL",
                  "name": "trustChip3Txt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#E5EAF5",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.1
                  },
                  "children": [],
                  "textProp": "trustchip3txttext"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "8oOrn",
      "name": "heroMedia",
      "style": {
        "boxSizing": "border-box",
        "width": 500,
        "height": 404,
        "borderRadius": 24,
        "border": "1px solid #23324F",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover"
      },
      "children": [],
      "imageProp": "heromediaimagesrc"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "OnJeq",
  "herotagtxttext": "REAL WORLD OUTCOMES",
  "herotitletext": "CHOOSE THE OBSERVING STORY THAT FITS THE WAY YOU EXPLORE",
  "herosubtext": "See how beginners, club hosts, and advanced astrophotographers use Unistellar to move from setup uncertainty to memorable nights under the stars.",
  "ctaprimarytxttext": "EXPLORE STORIES",
  "ctasecondarytxttext": "COMPARE USE CASES",
  "trustchip1txttext": "FAST FIRST-SESSION GUIDANCE",
  "trustchip2txttext": "SHARED LIVE VIEWS",
  "trustchip3txttext": "DEEPER TARGET RECOVERY",
  "heromediaimagesrc": "https://images.unsplash.com/photo-1719820390502-e0823fcc739d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxOTA5NzJ8&ixlib=rb-4.1.0&q=80&w=1080"
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

export default function TemplateExclusiveUnistellarHomeUseCasesHeroUsecaseheropenAlt1({ id, herotagtxttext, herotitletext, herosubtext, ctaprimarytxttext, ctasecondarytxttext, trustchip1txttext, trustchip2txttext, trustchip3txttext, heromediaimagesrc, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, herotagtxttext, herotitletext, herosubtext, ctaprimarytxttext, ctasecondarytxttext, trustchip1txttext, trustchip2txttext, trustchip3txttext, heromediaimagesrc });
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