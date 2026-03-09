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
  "id": "1HQuF",
  "name": "contactFooter",
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
      "id": "mlseU",
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
          "id": "2MVYq",
          "name": "ftBrand",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "alignItems": "center",
            "width": 300
          },
          "children": [
            {
              "type": "text",
              "id": "b8NW0",
              "name": "ftLogo",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 24,
                "fontWeight": "700",
                "letterSpacing": 1.4,
                "textAlign": "center"
              },
              "children": [],
              "textProp": "ftlogotext"
            },
            {
              "type": "text",
              "id": "TtPMY",
              "name": "ftDesc",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9AA7C1",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.5,
                "textAlign": "center",
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
          "id": "8Qd9i",
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
              "type": "frame",
              "id": "GxHKQ",
              "name": "Products",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "width": 190
              },
              "children": [
                {
                  "type": "text",
                  "id": "Gc0LA",
                  "name": "title",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8FA0BF",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "titletext"
                },
                {
                  "type": "text",
                  "id": "3UQyW",
                  "name": "smartTelescopes",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "smarttelescopestext",
                  "hrefProp": "smarttelescopeshref"
                },
                {
                  "type": "text",
                  "id": "3l9Yr",
                  "name": "smartBinoculars",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "smartbinocularstext",
                  "hrefProp": "smartbinocularshref"
                },
                {
                  "type": "text",
                  "id": "MNSuM",
                  "name": "accessories",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "accessoriestext",
                  "hrefProp": "accessorieshref"
                }
              ]
            },
            {
              "type": "frame",
              "id": "LVG4k",
              "name": "Support",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "width": 190
              },
              "children": [
                {
                  "type": "text",
                  "id": "hLEWC",
                  "name": "title",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8FA0BF",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "titletext2"
                },
                {
                  "type": "text",
                  "id": "cO8iF",
                  "name": "helpCenter",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "helpcentertext",
                  "hrefProp": "helpcenterhref"
                },
                {
                  "type": "text",
                  "id": "aAw1C",
                  "name": "manuals",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "manualstext",
                  "hrefProp": "manualshref"
                },
                {
                  "type": "text",
                  "id": "EmX6h",
                  "name": "contact",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "contacttext",
                  "hrefProp": "contacthref"
                }
              ]
            },
            {
              "type": "frame",
              "id": "as9zq",
              "name": "Company",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "width": 190
              },
              "children": [
                {
                  "type": "text",
                  "id": "B5KLV",
                  "name": "title",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8FA0BF",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "titletext3"
                },
                {
                  "type": "text",
                  "id": "6GIcm",
                  "name": "about",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "abouttext",
                  "hrefProp": "abouthref"
                },
                {
                  "type": "text",
                  "id": "v68iv",
                  "name": "press",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "presstext",
                  "hrefProp": "presshref"
                },
                {
                  "type": "text",
                  "id": "tIyTW",
                  "name": "careers",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "careerstext",
                  "hrefProp": "careershref"
                }
              ]
            },
            {
              "type": "frame",
              "id": "fnw6A",
              "name": "Community",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "width": 190
              },
              "children": [
                {
                  "type": "text",
                  "id": "mR9Cj",
                  "name": "title",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8FA0BF",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "titletext4"
                },
                {
                  "type": "text",
                  "id": "q5YKK",
                  "name": "events",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "eventstext",
                  "hrefProp": "eventshref"
                },
                {
                  "type": "text",
                  "id": "fybwu",
                  "name": "blog",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "blogtext",
                  "hrefProp": "bloghref"
                },
                {
                  "type": "text",
                  "id": "hH6KY",
                  "name": "partners",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D1DAEB",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "partnerstext",
                  "hrefProp": "partnershref"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "2lySI",
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
          "id": "HSGBg",
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
          "id": "j5nlN",
          "name": "policyLinks",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 20
          },
          "children": [
            {
              "type": "text",
              "id": "Q4Sgq",
              "name": "privacyPolicy",
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
              "textProp": "privacypolicytext"
            },
            {
              "type": "text",
              "id": "IFf6Z",
              "name": "terms",
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
              "textProp": "termstext",
              "hrefProp": "termshref"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "1HQuF",
  "ftlogotext": "UNISTELLAR",
  "ftdesctext": "The future of day and night exploration.",
  "ftdeschref": "/the-future-of-day-and-night-exploration",
  "titletext": "Products",
  "smarttelescopestext": "Smart Telescopes",
  "smarttelescopeshref": "/smart-telescopes",
  "smartbinocularstext": "Smart Binoculars",
  "smartbinocularshref": "/smart-binoculars",
  "accessoriestext": "Accessories",
  "accessorieshref": "/accessories",
  "titletext2": "Support",
  "helpcentertext": "Help Center",
  "helpcenterhref": "/help-center",
  "manualstext": "Manuals",
  "manualshref": "/manuals",
  "contacttext": "Contact",
  "contacthref": "/contact",
  "titletext3": "Company",
  "abouttext": "About",
  "abouthref": "/about",
  "presstext": "Press",
  "presshref": "/press",
  "careerstext": "Careers",
  "careershref": "/careers",
  "titletext4": "Community",
  "eventstext": "Events",
  "eventshref": "/events",
  "blogtext": "Blog",
  "bloghref": "/blog",
  "partnerstext": "Partners",
  "partnershref": "/partners",
  "copytext": "© 2026 Unistellar. All rights reserved.",
  "privacypolicytext": "Privacy Policy",
  "termstext": "Terms",
  "termshref": "/terms"
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
      mediaBreathe: false,
      contentStagger: true,
    };
  }
  if (sectionKindToken === "navigation" || sectionKindToken === "footer") {
    return {
      level: "off",
      revealPreset: "fadeIn",
      delayStep: 0,
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

const renderNode = (node, merged, sectionMotion, sectionKindToken, key = "root", ancestorHasLink = false) => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged, sectionMotion, sectionKindToken, key);
  const className = buildNodeClassName(node, sectionMotion, sectionKindToken) || undefined;
  const href = node?.hrefProp ? String(merged?.[node.hrefProp] || "").trim() : "";
  const shouldRenderLink = Boolean(href) && !ancestorHasLink;
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
    const Tag = shouldRenderLink ? "a" : "div";
    return React.createElement(
      Tag,
      {
        key,
        href: shouldRenderLink ? href : undefined,
        className,
        style,
        "data-pen-node": node.id || undefined,
      },
      renderTextContent(node, merged, key, sectionMotion)
    );
  }
  const Tag = shouldRenderLink ? "a" : "div";
  return React.createElement(
    Tag,
    {
      key,
      href: shouldRenderLink ? href : undefined,
      className,
      style,
      "data-pen-node": node.id || undefined,
    },
    ...(Array.isArray(node.children)
      ? node.children.map((child, index) =>
          renderNode(
            child,
            merged,
            sectionMotion,
            sectionKindToken,
            `${key}-${index}`,
            ancestorHasLink || shouldRenderLink
          )
        )
      : [])
  );
};

export default function TemplateExclusiveUnistellarHomeContactFooterContactfooterpenAlt3({ id, ftlogotext, ftdesctext, ftdeschref, titletext, smarttelescopestext, smarttelescopeshref, smartbinocularstext, smartbinocularshref, accessoriestext, accessorieshref, titletext2, helpcentertext, helpcenterhref, manualstext, manualshref, contacttext, contacthref, titletext3, abouttext, abouthref, presstext, presshref, careerstext, careershref, titletext4, eventstext, eventshref, blogtext, bloghref, partnerstext, partnershref, copytext, privacypolicytext, termstext, termshref, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, ftlogotext, ftdesctext, ftdeschref, titletext, smarttelescopestext, smarttelescopeshref, smartbinocularstext, smartbinocularshref, accessoriestext, accessorieshref, titletext2, helpcentertext, helpcenterhref, manualstext, manualshref, contacttext, contacthref, titletext3, abouttext, abouthref, presstext, presshref, careerstext, careershref, titletext4, eventstext, eventshref, blogtext, bloghref, partnerstext, partnershref, copytext, privacypolicytext, termstext, termshref });
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
    renderNode(SECTION_TREE, merged, sectionMotion, sectionKindToken, "root", false)
  );
}