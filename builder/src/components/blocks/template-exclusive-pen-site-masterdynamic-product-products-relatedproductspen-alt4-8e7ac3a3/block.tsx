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

const SECTION_KIND = "products";
const SECTION_TREE = {
  "type": "frame",
  "id": "plmCu",
  "name": "relatedProducts",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 24,
    "width": "100%",
    "height": 760
  },
  "children": [
    {
      "type": "frame",
      "id": "RTB0V",
      "name": "featuredHead",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 8,
        "justifyContent": "center",
        "width": "100%",
        "height": 84
      },
      "children": [
        {
          "type": "text",
          "id": "LwVum",
          "name": "featuredK",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#7A7A7A",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "featuredktext"
        },
        {
          "type": "text",
          "id": "aXaqy",
          "name": "featuredT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#0D0D0D",
            "fontFamily": "Space Grotesk",
            "fontSize": 40,
            "fontWeight": "500",
            "letterSpacing": -1
          },
          "children": [],
          "textProp": "featuredttext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "4tRhi",
      "name": "featuredGrid",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 20,
        "width": "100%",
        "height": 520
      },
      "children": [
        {
          "type": "frame",
          "id": "FCWed",
          "name": "productCardA",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "width": "100%",
            "height": "100%",
            "background": "#FFFFFF",
            "border": "1px solid #E8E8E8"
          },
          "children": [
            {
              "type": "frame",
              "id": "tmv84",
              "name": "productImageA",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 360,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "productimageaimagesrc"
            },
            {
              "type": "frame",
              "id": "3YD0T",
              "name": "productCopyA",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "padding": "20px",
                "width": "100%",
                "height": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "s0EcJ",
                  "name": "productNameA",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D0D0D",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 22,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "productnameatext"
                },
                {
                  "type": "text",
                  "id": "RoUvg",
                  "name": "productTypeA",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7A7A7A",
                    "fontFamily": "Inter",
                    "fontSize": 14
                  },
                  "children": [],
                  "textProp": "producttypeatext"
                },
                {
                  "type": "text",
                  "id": "WTcvq",
                  "name": "productPriceA",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D0D0D",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 16,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "productpriceatext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "t9zw4",
          "name": "productCardB",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "width": "100%",
            "height": "100%",
            "borderRadius": 20,
            "background": "#FFFCFA",
            "border": "1px solid #C9DDD9",
            "boxShadow": "0px 18px 40px #1A3C381A"
          },
          "children": [
            {
              "type": "frame",
              "id": "WBNSA",
              "name": "productImageB",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 360,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "overflow": "hidden",
                "position": "relative"
              },
              "children": [
                {
                  "type": "frame",
                  "id": "DYTT0",
                  "name": "cardBadge",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 92,
                    "height": 30,
                    "borderRadius": 999,
                    "background": "#FFFFFFD9",
                    "border": "1px solid #D9E6E3",
                    "position": "absolute",
                    "left": 18,
                    "top": 18
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "K8MO6",
                      "name": "cardBadgeTxt",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#0D6E6E",
                        "fontFamily": "JetBrains Mono",
                        "fontSize": 11,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "cardbadgetxttext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "FmQSQ",
                  "name": "cardCta",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 160,
                    "height": 36,
                    "borderRadius": 999,
                    "background": "#111111CC",
                    "position": "absolute",
                    "left": 18,
                    "top": 306
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "Esq3R",
                      "name": "cardCtaTxt",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#FFFFFF",
                        "fontFamily": "Space Grotesk",
                        "fontSize": 13,
                        "fontWeight": "500"
                      },
                      "children": [],
                      "textProp": "cardctatxttext"
                    }
                  ]
                }
              ],
              "imageProp": "productimagebimagesrc"
            },
            {
              "type": "frame",
              "id": "fX48v",
              "name": "productCopyB",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "padding": "20px",
                "width": "100%",
                "height": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "MOZHr",
                  "name": "productNameB",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D0D0D",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 22,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "productnamebtext"
                },
                {
                  "type": "text",
                  "id": "xkxbh",
                  "name": "productTypeB",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7A7A7A",
                    "fontFamily": "Inter",
                    "fontSize": 14
                  },
                  "children": [],
                  "textProp": "producttypebtext"
                },
                {
                  "type": "text",
                  "id": "Zcysq",
                  "name": "productPriceB",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D0D0D",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 16,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "productpricebtext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "p3B3d",
          "name": "productCardC",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "width": "100%",
            "height": "100%",
            "background": "#FFFFFF",
            "border": "1px solid #E8E8E8"
          },
          "children": [
            {
              "type": "frame",
              "id": "jNzaU",
              "name": "productImageC",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 360,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "productimagecimagesrc"
            },
            {
              "type": "frame",
              "id": "TXH6L",
              "name": "productCopyC",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "padding": "20px",
                "width": "100%",
                "height": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Vw4WM",
                  "name": "productNameC",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D0D0D",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 22,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "productnamectext"
                },
                {
                  "type": "text",
                  "id": "QHThu",
                  "name": "productTypeC",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7A7A7A",
                    "fontFamily": "Inter",
                    "fontSize": 14
                  },
                  "children": [],
                  "textProp": "producttypectext"
                },
                {
                  "type": "text",
                  "id": "gVyqG",
                  "name": "productPriceC",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D0D0D",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 16,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "productpricectext"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "OgVfw",
      "name": "featuredBottom",
      "style": {
        "boxSizing": "border-box",
        "width": "100%",
        "height": "100%",
        "position": "relative"
      },
      "children": [
        {
          "type": "frame",
          "id": "Hxd7K",
          "name": "lifestyleStrip",
          "style": {
            "boxSizing": "border-box",
            "width": 1296,
            "height": 132,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "lifestylestripimagesrc"
        },
        {
          "type": "text",
          "id": "FSSDq",
          "name": "lifestyleStripTxt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Space Grotesk",
            "fontSize": 24,
            "fontWeight": "500",
            "position": "absolute",
            "left": 28,
            "top": 52
          },
          "children": [],
          "textProp": "lifestylestriptxttext"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "plmCu",
  "featuredktext": "RECOMMENDED",
  "featuredttext": "You May Also Like",
  "productimageaimagesrc": "https://images.unsplash.com/photo-1600365966065-703b4c4441c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgxMTR8&ixlib=rb-4.1.0&q=80&w=1080",
  "productnameatext": "MW75",
  "producttypeatext": "Wireless Headphones",
  "productpriceatext": "$599",
  "productimagebimagesrc": "https://images.unsplash.com/photo-1614113489855-66422ad300a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgxMjB8&ixlib=rb-4.1.0&q=80&w=1080",
  "cardbadgetxttext": "card hover",
  "cardctatxttext": "Quick view",
  "productnamebtext": "MH40",
  "producttypebtext": "On-Ear Headphones",
  "productpricebtext": "$399",
  "productimagecimagesrc": "https://images.unsplash.com/photo-1578281821295-a9ce331975b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgxMjJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "productnamectext": "MW08 Sport",
  "producttypectext": "Active Noise-Cancelling Earphones",
  "productpricectext": "$349",
  "lifestylestripimagesrc": "https://images.unsplash.com/photo-1630421006905-3dc6383d3c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgxMjV8&ixlib=rb-4.1.0&q=80&w=1080",
  "lifestylestriptxttext": "Engineered in New York. Tuned for the modern city."
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

export default function TemplateExclusivePenSiteMasterdynamicProductProductsRelatedproductspenAlt4({ id, featuredktext, featuredttext, productimageaimagesrc, productnameatext, producttypeatext, productpriceatext, productimagebimagesrc, cardbadgetxttext, cardctatxttext, productnamebtext, producttypebtext, productpricebtext, productimagecimagesrc, productnamectext, producttypectext, productpricectext, lifestylestripimagesrc, lifestylestriptxttext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, featuredktext, featuredttext, productimageaimagesrc, productnameatext, producttypeatext, productpriceatext, productimagebimagesrc, cardbadgetxttext, cardctatxttext, productnamebtext, producttypebtext, productpricebtext, productimagecimagesrc, productnamectext, producttypectext, productpricectext, lifestylestripimagesrc, lifestylestriptxttext });
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