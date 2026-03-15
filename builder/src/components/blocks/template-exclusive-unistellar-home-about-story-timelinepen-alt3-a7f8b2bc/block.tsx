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

export default function TemplateExclusiveUnistellarHomeAboutStoryTimelinepenAlt3({ id, timelineeyebrowtext, timelinetitletext, timelineintrotext, step1numtext, step1yeartext, step1titletext, step1texttext, step1metatext, step2numtext, step2yeartext, step2titletext, step2texttext, step2metatext, step3numtext, step3yeartext, step3titletext, step3texttext, step3metatext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, timelineeyebrowtext, timelinetitletext, timelineintrotext, step1numtext, step1yeartext, step1titletext, step1texttext, step1metatext, step2numtext, step2yeartext, step2titletext, step2texttext, step2metatext, step3numtext, step3yeartext, step3titletext, step3texttext, step3metatext });
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