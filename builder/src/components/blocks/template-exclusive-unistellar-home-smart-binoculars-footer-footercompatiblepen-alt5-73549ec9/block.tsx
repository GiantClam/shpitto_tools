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
  "id": "tZMLV",
  "name": "Footer Compatible",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 24,
    "padding": "36px 56px",
    "width": "100%",
    "background": "linear-gradient(180deg, #0D1524 0%, #09101A 100%)",
    "borderTop": "1px solid #2A2A2E"
  },
  "children": [
    {
      "type": "frame",
      "id": "Xt0sF",
      "name": "Footer Top",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "alignItems": "center",
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "BeCrz",
          "name": "Footer Brand Stack",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": 440
          },
          "children": [
            {
              "type": "text",
              "id": "4IC6K",
              "name": "Footer Brand",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Fraunces",
                "fontSize": 28,
                "fontWeight": "600",
                "letterSpacing": -0.3
              },
              "children": [],
              "textProp": "footerBrandtext"
            },
            {
              "type": "text",
              "id": "4bdOr",
              "name": "Footer Description",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8E8E93",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": 440
              },
              "children": [],
              "textProp": "footerDescriptiontext",
              "hrefProp": "footerDescriptionhref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "tpFys",
          "name": "Footer CTA",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "padding": "12px 18px",
            "height": 46,
            "borderRadius": 999,
            "background": "#121722",
            "border": "1px solid #303849"
          },
          "children": [
            {
              "type": "text",
              "id": "1Sotp",
              "name": "Footer CTA Text",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D6DEEA",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "footerCtaTexttext"
            }
          ],
          "hrefProp": "footerCtahref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "J59xR",
      "name": "Footer Links Row",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 40,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "bh4ee",
          "name": "Product Links",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": 220
          },
          "children": [
            {
              "type": "text",
              "id": "JRF6j",
              "name": "Product Heading",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "productHeadingtext"
            },
            {
              "type": "text",
              "id": "aYFmN",
              "name": "Product Smart Telescopes",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "productSmartTelescopestext",
              "hrefProp": "productSmartTelescopeshref"
            },
            {
              "type": "text",
              "id": "rVjWz",
              "name": "Product Smart Binoculars",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "productSmartBinocularstext",
              "hrefProp": "productSmartBinocularshref"
            },
            {
              "type": "text",
              "id": "4swXc",
              "name": "Product App Software",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "productAppSoftwaretext",
              "hrefProp": "productAppSoftwarehref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "wvdnW",
          "name": "Company Links",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": 220
          },
          "children": [
            {
              "type": "text",
              "id": "vm2pS",
              "name": "Company Heading",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "companyHeadingtext"
            },
            {
              "type": "text",
              "id": "kT035",
              "name": "Company About",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "companyAbouttext",
              "hrefProp": "companyAbouthref"
            },
            {
              "type": "text",
              "id": "nnDB0",
              "name": "Company Technologies",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "companyTechnologiestext",
              "hrefProp": "companyTechnologieshref"
            },
            {
              "type": "text",
              "id": "m6PAt",
              "name": "Company Contact",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "companyContacttext",
              "hrefProp": "companyContacthref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "LKmqy",
          "name": "Resource Links",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": 220
          },
          "children": [
            {
              "type": "text",
              "id": "bnOYC",
              "name": "Resource Heading",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "resourceHeadingtext"
            },
            {
              "type": "text",
              "id": "Jnazo",
              "name": "Resource Knowledge Base",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "resourceKnowledgeBasetext",
              "hrefProp": "resourceKnowledgeBasehref"
            },
            {
              "type": "text",
              "id": "SV72d",
              "name": "Resource Warranty",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "resourceWarrantytext",
              "hrefProp": "resourceWarrantyhref"
            },
            {
              "type": "text",
              "id": "WTXfT",
              "name": "Resource Privacy",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "resourcePrivacytext",
              "hrefProp": "resourcePrivacyhref"
            },
            {
              "type": "text",
              "id": "A7RDf",
              "name": "Resource Product Updates",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "resourceProductUpdatestext",
              "hrefProp": "resourceProductUpdateshref"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "w6Q2r",
      "name": "Footer Bottom",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "alignItems": "center",
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "mvzJH",
          "name": "Footer Copyright",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 12,
            "fontWeight": "normal"
          },
          "children": [],
          "textProp": "footerCopyrighttext"
        },
        {
          "type": "frame",
          "id": "iS0Xy",
          "name": "Footer Utility Links",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 24
          },
          "children": [
            {
              "type": "text",
              "id": "U1Klk",
              "name": "Regional Support",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#97A0AE",
                "fontFamily": "DM Sans",
                "fontSize": 12,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "regionalSupporttext"
            },
            {
              "type": "text",
              "id": "WIsBG",
              "name": "Demo Appointments",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#97A0AE",
                "fontFamily": "DM Sans",
                "fontSize": 12,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "demoAppointmentstext",
              "hrefProp": "demoAppointmentshref"
            },
            {
              "type": "text",
              "id": "sufFL",
              "name": "Press Partnerships",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#97A0AE",
                "fontFamily": "DM Sans",
                "fontSize": 12,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "pressPartnershipstext",
              "hrefProp": "pressPartnershipshref"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "tZMLV",
  "footerBrandtext": "UNISTELLAR",
  "footerDescriptiontext": "Precision instruments, guided support, and a global team helping curious observers get more from every clear night.",
  "footerDescriptionhref": "/precision-instruments-guided-support-and-a-global-team-helping-curious-observers",
  "footerCtahref": "/open-support-portal",
  "footerCtaTexttext": "Open Support Portal",
  "productHeadingtext": "PRODUCT",
  "productSmartTelescopestext": "Smart Telescopes",
  "productSmartTelescopeshref": "/smart-telescopes",
  "productSmartBinocularstext": "Smart Binoculars",
  "productSmartBinocularshref": "/smart-binoculars",
  "productAppSoftwaretext": "App & Software",
  "productAppSoftwarehref": "/app-software",
  "companyHeadingtext": "COMPANY",
  "companyAbouttext": "About Unistellar",
  "companyAbouthref": "/about-unistellar",
  "companyTechnologiestext": "Technologies",
  "companyTechnologieshref": "/technologies",
  "companyContacttext": "Contact",
  "companyContacthref": "/contact",
  "resourceHeadingtext": "RESOURCES",
  "resourceKnowledgeBasetext": "Knowledge Base",
  "resourceKnowledgeBasehref": "/knowledge-base",
  "resourceWarrantytext": "Warranty",
  "resourceWarrantyhref": "/warranty",
  "resourcePrivacytext": "Privacy Policy",
  "resourcePrivacyhref": "/privacy-policy",
  "resourceProductUpdatestext": "Product Updates",
  "resourceProductUpdateshref": "/product-updates",
  "footerCopyrighttext": "© 2026 Unistellar. Built for curious minds under dark skies.",
  "regionalSupporttext": "Regional Support",
  "demoAppointmentstext": "Demo Appointments",
  "demoAppointmentshref": "/demo-appointments",
  "pressPartnershipstext": "Press & Partnerships",
  "pressPartnershipshref": "/press-partnerships"
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

export default function TemplateExclusiveUnistellarHomeSmartBinocularsFooterFootercompatiblepenAlt5({ id, footerBrandtext, footerDescriptiontext, footerDescriptionhref, footerCtahref, footerCtaTexttext, productHeadingtext, productSmartTelescopestext, productSmartTelescopeshref, productSmartBinocularstext, productSmartBinocularshref, productAppSoftwaretext, productAppSoftwarehref, companyHeadingtext, companyAbouttext, companyAbouthref, companyTechnologiestext, companyTechnologieshref, companyContacttext, companyContacthref, resourceHeadingtext, resourceKnowledgeBasetext, resourceKnowledgeBasehref, resourceWarrantytext, resourceWarrantyhref, resourcePrivacytext, resourcePrivacyhref, resourceProductUpdatestext, resourceProductUpdateshref, footerCopyrighttext, regionalSupporttext, demoAppointmentstext, demoAppointmentshref, pressPartnershipstext, pressPartnershipshref, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, footerBrandtext, footerDescriptiontext, footerDescriptionhref, footerCtahref, footerCtaTexttext, productHeadingtext, productSmartTelescopestext, productSmartTelescopeshref, productSmartBinocularstext, productSmartBinocularshref, productAppSoftwaretext, productAppSoftwarehref, companyHeadingtext, companyAbouttext, companyAbouthref, companyTechnologiestext, companyTechnologieshref, companyContacttext, companyContacthref, resourceHeadingtext, resourceKnowledgeBasetext, resourceKnowledgeBasehref, resourceWarrantytext, resourceWarrantyhref, resourcePrivacytext, resourcePrivacyhref, resourceProductUpdatestext, resourceProductUpdateshref, footerCopyrighttext, regionalSupporttext, demoAppointmentstext, demoAppointmentshref, pressPartnershipstext, pressPartnershipshref });
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