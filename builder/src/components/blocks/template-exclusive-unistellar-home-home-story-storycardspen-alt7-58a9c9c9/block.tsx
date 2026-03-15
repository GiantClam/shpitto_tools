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
  "id": "ACD1Y",
  "name": "storyCards",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 24,
    "alignItems": "center",
    "padding": "64px 72px",
    "width": "100%",
    "background": "#05070D"
  },
  "children": [
    {
      "type": "text",
      "id": "DEwJH",
      "name": "storyTag",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#8FA1C2",
        "fontFamily": "Manrope",
        "fontSize": 13,
        "letterSpacing": 1.2,
        "textAlign": "center"
      },
      "children": [],
      "textProp": "storytagtext"
    },
    {
      "type": "text",
      "id": "B7bIJ",
      "name": "storyTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 48,
        "fontWeight": "700",
        "letterSpacing": -0.5,
        "lineHeight": 1.08,
        "textAlign": "center",
        "width": 980
      },
      "children": [],
      "textProp": "storytitletext"
    },
    {
      "type": "frame",
      "id": "9HbRK",
      "name": "grid",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 28,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "neOmr",
          "name": "row1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 40,
            "justifyContent": "center",
            "width": "100%",
            "height": 570
          },
          "children": [
            {
              "type": "frame",
              "id": "BdSPG",
              "name": "science",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "flex-end",
                "alignItems": "center",
                "padding": "24px",
                "width": 320,
                "height": "100%",
                "borderRadius": 18,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [
                {
                  "type": "text",
                  "id": "oxZ7F",
                  "name": "scienceT",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 30,
                    "fontWeight": "700",
                    "letterSpacing": -0.3,
                    "textAlign": "center"
                  },
                  "children": [],
                  "textProp": "sciencettext"
                },
                {
                  "type": "text",
                  "id": "uKkdv",
                  "name": "scienceD",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D8DFEE",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "lineHeight": 1.4,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "sciencedtext"
                }
              ],
              "imageProp": "scienceimagesrc"
            },
            {
              "type": "frame",
              "id": "5fYL2",
              "name": "blog",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "flex-end",
                "alignItems": "center",
                "padding": "24px",
                "width": 320,
                "height": "100%",
                "borderRadius": 18,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [
                {
                  "type": "text",
                  "id": "DWe8c",
                  "name": "blogT",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 30,
                    "fontWeight": "700",
                    "letterSpacing": -0.3,
                    "textAlign": "center"
                  },
                  "children": [],
                  "textProp": "blogttext"
                },
                {
                  "type": "text",
                  "id": "qzvyL",
                  "name": "blogD",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D8DFEE",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "lineHeight": 1.4,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "blogdtext"
                }
              ],
              "imageProp": "blogimagesrc"
            }
          ]
        },
        {
          "type": "frame",
          "id": "iydXY",
          "name": "row2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 40,
            "justifyContent": "center",
            "width": "100%",
            "height": 570
          },
          "children": [
            {
              "type": "frame",
              "id": "veayk",
              "name": "tech",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "flex-end",
                "alignItems": "center",
                "padding": "24px",
                "width": 320,
                "height": "100%",
                "borderRadius": 18,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [
                {
                  "type": "text",
                  "id": "q0IMW",
                  "name": "techT",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 30,
                    "fontWeight": "700",
                    "letterSpacing": -0.3,
                    "textAlign": "center"
                  },
                  "children": [],
                  "textProp": "techttext"
                },
                {
                  "type": "text",
                  "id": "VNyqZ",
                  "name": "techD",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D8DFEE",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "lineHeight": 1.4,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "techdtext"
                }
              ],
              "imageProp": "techimagesrc"
            },
            {
              "type": "frame",
              "id": "3gy26",
              "name": "gallery",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "flex-end",
                "alignItems": "center",
                "padding": "24px",
                "width": 320,
                "height": "100%",
                "borderRadius": 18,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [
                {
                  "type": "text",
                  "id": "jD9nV",
                  "name": "galleryT",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 30,
                    "fontWeight": "700",
                    "letterSpacing": -0.3,
                    "textAlign": "center"
                  },
                  "children": [],
                  "textProp": "galleryttext"
                },
                {
                  "type": "text",
                  "id": "w4oBt",
                  "name": "galleryD",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D8DFEE",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "lineHeight": 1.4,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "gallerydtext"
                }
              ],
              "imageProp": "galleryimagesrc"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "ACD1Y",
  "storytagtext": "Explore More",
  "storytitletext": "Science, Stories, Technology and Gallery",
  "scienceimagesrc": "https://images.unsplash.com/photo-1709141428202-e21518e6481f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODgwNjZ8&ixlib=rb-4.1.0&q=80&w=1080",
  "sciencettext": "Science",
  "sciencedtext": "Citizen science missions and discoveries powered by Unistellar observers.",
  "blogimagesrc": "https://images.unsplash.com/photo-1743662431955-93dc29e1bf17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODgwNjd8&ixlib=rb-4.1.0&q=80&w=1080",
  "blogttext": "Blog",
  "blogdtext": "Updates, tutorials, and stories from explorers around the world.",
  "techimagesrc": "https://images.unsplash.com/photo-1693168390145-269901213505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODgwODZ8&ixlib=rb-4.1.0&q=80&w=1080",
  "techttext": "Technology",
  "techdtext": "Enhanced vision, autonomous tracking, and immersive augmented overlays.",
  "galleryimagesrc": "https://images.unsplash.com/photo-1596272862901-92e415f2da84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODgwNjh8&ixlib=rb-4.1.0&q=80&w=1080",
  "galleryttext": "Gallery",
  "gallerydtext": "A curated collection of astrophotography and observation highlights."
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

export default function TemplateExclusiveUnistellarHomeHomeStoryStorycardspenAlt7({ id, storytagtext, storytitletext, scienceimagesrc, sciencettext, sciencedtext, blogimagesrc, blogttext, blogdtext, techimagesrc, techttext, techdtext, galleryimagesrc, galleryttext, gallerydtext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, storytagtext, storytitletext, scienceimagesrc, sciencettext, sciencedtext, blogimagesrc, blogttext, blogdtext, techimagesrc, techttext, techdtext, galleryimagesrc, galleryttext, gallerydtext });
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