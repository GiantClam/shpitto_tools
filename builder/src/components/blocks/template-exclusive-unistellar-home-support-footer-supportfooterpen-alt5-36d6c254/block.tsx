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

const SECTION_KIND = "footer";
const SECTION_TREE = {
  "type": "frame",
  "id": "lmZtc",
  "name": "supportFooter",
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
      "id": "VeQOA",
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
          "id": "Lkvms",
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
              "id": "heNDp",
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
              "id": "kplsq",
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
          "id": "X8zsd",
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
              "id": "rODT1",
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
                  "id": "L0tUy",
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
                  "id": "RC0ep",
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
                  "id": "kbxMO",
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
                  "id": "MLxtR",
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
              "id": "5573M",
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
                  "id": "MPLWy",
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
                  "id": "Sk2e6",
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
                  "id": "RO2qN",
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
                  "id": "hPYDU",
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
              "id": "bza0v",
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
                  "id": "ZdaZ7",
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
                  "id": "xuPnr",
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
                  "id": "D7HeH",
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
                  "id": "9L9Ys",
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
              "id": "MwwNB",
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
                  "id": "oY50P",
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
                  "id": "Zvn6Q",
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
                  "id": "LFBoW",
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
                  "id": "Q8RFR",
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
      "id": "pLIFJ",
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
          "id": "Dkge0",
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
          "id": "Ir7Gj",
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
              "id": "dwpMb",
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
              "id": "DAP1F",
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
  "id": "lmZtc",
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

export default function TemplateExclusiveUnistellarHomeSupportFooterSupportfooterpenAlt5({ id, ftlogotext, ftdesctext, ftdeschref, titletext, smarttelescopestext, smarttelescopeshref, smartbinocularstext, smartbinocularshref, accessoriestext, accessorieshref, titletext2, helpcentertext, helpcenterhref, manualstext, manualshref, contacttext, contacthref, titletext3, abouttext, abouthref, presstext, presshref, careerstext, careershref, titletext4, eventstext, eventshref, blogtext, bloghref, partnerstext, partnershref, copytext, privacypolicytext, termstext, termshref, ...rest }) {
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
    renderNode(SECTION_TREE, merged, sectionMotion, "root")
  );
}