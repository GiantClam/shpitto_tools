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
  "id": "XnkvT",
  "name": "Timeline",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 24,
    "padding": "48px 56px 56px 56px",
    "width": "100%",
    "background": "#060A14"
  },
  "children": [
    {
      "type": "text",
      "id": "a8J13",
      "name": "timelineEyebrow",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#9DB0D4",
        "fontFamily": "Manrope",
        "fontSize": 12,
        "fontWeight": "500",
        "letterSpacing": 1.6,
        "width": "100%"
      },
      "children": [],
      "textProp": "timelineeyebrowtext"
    },
    {
      "type": "text",
      "id": "yGof7",
      "name": "timelineTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 44,
        "fontWeight": "600",
        "letterSpacing": -1,
        "lineHeight": 1.02,
        "width": 860
      },
      "children": [],
      "textProp": "timelinetitletext"
    },
    {
      "type": "text",
      "id": "BmfoS",
      "name": "timelineIntro",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#93A1BD",
        "fontFamily": "Manrope",
        "fontSize": 14,
        "fontWeight": "normal",
        "lineHeight": 1.5,
        "width": 760
      },
      "children": [],
      "textProp": "timelineintrotext"
    },
    {
      "type": "frame",
      "id": "mafmR",
      "name": "Timeline Row",
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
          "id": "VRWOL",
          "name": "step1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 16,
            "padding": "24px",
            "width": "100%",
            "height": 272,
            "background": "#0F1520",
            "border": "1px solid #22314A"
          },
          "children": [
            {
              "type": "text",
              "id": "8hGF7",
              "name": "step1Num",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6E768A",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "500",
                "letterSpacing": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "step1numtext"
            },
            {
              "type": "text",
              "id": "KLivm",
              "name": "step1Year",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9DB0D4",
                "fontFamily": "Manrope",
                "fontSize": 28,
                "fontWeight": "500",
                "letterSpacing": -0.6,
                "width": "100%"
              },
              "children": [],
              "textProp": "step1yeartext"
            },
            {
              "type": "text",
              "id": "IqSHq",
              "name": "step1Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 20,
                "fontWeight": "600",
                "lineHeight": 1.18,
                "width": "100%"
              },
              "children": [],
              "textProp": "step1titletext"
            },
            {
              "type": "text",
              "id": "EeRVc",
              "name": "step1Text",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9FA9BF",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "step1texttext"
            },
            {
              "type": "text",
              "id": "kI9dr",
              "name": "step1Meta",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6E768A",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "500",
                "letterSpacing": 1.2,
                "width": "100%"
              },
              "children": [],
              "textProp": "step1metatext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "717Cb",
          "name": "step2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 16,
            "padding": "24px",
            "width": "100%",
            "height": 300,
            "background": "#0F1520",
            "border": "1px solid #22314A"
          },
          "children": [
            {
              "type": "text",
              "id": "zTQOa",
              "name": "step2Num",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6E768A",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "500",
                "letterSpacing": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "step2numtext"
            },
            {
              "type": "text",
              "id": "dKsin",
              "name": "step2Year",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9DB0D4",
                "fontFamily": "Manrope",
                "fontSize": 28,
                "fontWeight": "500",
                "letterSpacing": -0.6,
                "width": "100%"
              },
              "children": [],
              "textProp": "step2yeartext"
            },
            {
              "type": "text",
              "id": "XnfgW",
              "name": "step2Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 20,
                "fontWeight": "600",
                "lineHeight": 1.18,
                "width": "100%"
              },
              "children": [],
              "textProp": "step2titletext"
            },
            {
              "type": "text",
              "id": "evU14",
              "name": "step2Text",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9FA9BF",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "step2texttext"
            },
            {
              "type": "text",
              "id": "GfpfC",
              "name": "step2Meta",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6E768A",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "500",
                "letterSpacing": 1.2,
                "width": "100%"
              },
              "children": [],
              "textProp": "step2metatext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "TusOa",
          "name": "step3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 16,
            "padding": "24px",
            "width": "100%",
            "height": 272,
            "background": "#0F1520",
            "border": "1px solid #22314A"
          },
          "children": [
            {
              "type": "text",
              "id": "sLWkY",
              "name": "step3Num",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6E768A",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "500",
                "letterSpacing": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "step3numtext"
            },
            {
              "type": "text",
              "id": "wxdar",
              "name": "step3Year",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9DB0D4",
                "fontFamily": "Manrope",
                "fontSize": 28,
                "fontWeight": "500",
                "letterSpacing": -0.6,
                "width": "100%"
              },
              "children": [],
              "textProp": "step3yeartext"
            },
            {
              "type": "text",
              "id": "dlBzw",
              "name": "step3Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 20,
                "fontWeight": "600",
                "lineHeight": 1.18,
                "width": "100%"
              },
              "children": [],
              "textProp": "step3titletext"
            },
            {
              "type": "text",
              "id": "jUPJR",
              "name": "step3Text",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9FA9BF",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "step3texttext"
            },
            {
              "type": "text",
              "id": "HX7Hm",
              "name": "step3Meta",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6E768A",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "500",
                "letterSpacing": 1.2,
                "width": "100%"
              },
              "children": [],
              "textProp": "step3metatext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "XnkvT",
  "timelineeyebrowtext": "TIMELINE / 02",
  "timelinetitletext": "A company shaped by access, engineering discipline, and a community that keeps expanding what citizen astronomy can do.",
  "timelineintrotext": "Each milestone marks a shift from specialist hardware to a more participatory model of discovery, where the telescope becomes both an instrument and a bridge into the night sky.",
  "step1numtext": "01",
  "step1yeartext": "2015",
  "step1titletext": "Unistellar is founded to remove friction from deep-sky exploration.",
  "step1texttext": "The ambition was clear from the start: make professional-grade observing feel intuitive enough for first light in a backyard, not only inside an observatory.",
  "step1metatext": "FOUNDATION / ACCESS",
  "step2numtext": "02",
  "step2yeartext": "2018",
  "step2titletext": "eVscope brings autonomous pointing and enhanced vision into the mainstream.",
  "step2texttext": "Setup becomes faster, guidance becomes smarter, and the gap between curiosity and meaningful observation gets dramatically smaller for new astronomers.",
  "step2metatext": "PRODUCT / ADOPTION",
  "step3numtext": "03",
  "step3yeartext": "TODAY",
  "step3titletext": "A global network of observers contributes to real science from home.",
  "step3texttext": "Thousands of users now capture, learn, and collaborate through Unistellar, proving that access and scientific rigor can reinforce one another instead of competing.",
  "step3metatext": "NETWORK / IMPACT"
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

export default function TemplateExclusiveUnistellarHomeAboutStoryTimelinepenAlt3({ id, timelineeyebrowtext, timelinetitletext, timelineintrotext, step1numtext, step1yeartext, step1titletext, step1texttext, step1metatext, step2numtext, step2yeartext, step2titletext, step2texttext, step2metatext, step3numtext, step3yeartext, step3titletext, step3texttext, step3metatext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, timelineeyebrowtext, timelinetitletext, timelineintrotext, step1numtext, step1yeartext, step1titletext, step1texttext, step1metatext, step2numtext, step2yeartext, step2titletext, step2texttext, step2metatext, step3numtext, step3yeartext, step3titletext, step3texttext, step3metatext });
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