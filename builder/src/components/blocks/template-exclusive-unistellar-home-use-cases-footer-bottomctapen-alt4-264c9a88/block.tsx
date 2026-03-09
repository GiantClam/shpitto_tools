"use client";

import React from "react";
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

const SECTION_TREE = {
  "type": "frame",
  "id": "N4eH8",
  "name": "Bottom CTA",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 16,
    "alignItems": "center",
    "padding": "48px 56px",
    "width": "100%",
    "background": "linear-gradient(180deg, #111826 0%, #060A14 100%)",
    "borderTop": "1px solid #22324A",
    "borderBottom": "1px solid #22324A"
  },
  "children": [
    {
      "type": "text",
      "id": "1CG0u",
      "name": "ctaTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 32,
        "fontWeight": "700",
        "letterSpacing": -1,
        "lineHeight": 1,
        "textAlign": "center",
        "width": 900
      },
      "children": [],
      "textProp": "ctatitletext"
    },
    {
      "type": "text",
      "id": "QmS3m",
      "name": "ctaSub",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#C8D0E2",
        "fontFamily": "Manrope",
        "fontSize": 15,
        "fontWeight": "500",
        "lineHeight": 1.45,
        "textAlign": "center",
        "width": 700
      },
      "children": [],
      "textProp": "ctasubtext"
    },
    {
      "type": "frame",
      "id": "usdDi",
      "name": "ctaBtn",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "center",
        "alignItems": "center",
        "padding": "14px 24px",
        "borderRadius": 999,
        "background": "#FFFFFF",
        "border": "1px solid #FFFFFF"
      },
      "children": [
        {
          "type": "text",
          "id": "YOX9a",
          "name": "ctaBtnTxt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#0B1020",
            "fontFamily": "Space Grotesk",
            "fontSize": 11,
            "fontWeight": "700",
            "letterSpacing": 1.3
          },
          "children": [],
          "textProp": "ctabtntxttext",
          "hrefProp": "ctabtntxthref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "tZduX",
      "name": "ctaTrustRow",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 10
      },
      "children": [
        {
          "type": "frame",
          "id": "M34zG",
          "name": "ctaChip1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "alignItems": "center",
            "padding": "10px 16px",
            "borderRadius": 999,
            "background": "#13203A",
            "border": "1px solid #2A3C61"
          },
          "children": [
            {
              "type": "text",
              "id": "0ZjSW",
              "name": "ctaChip1Txt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D8E2F4",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "600",
                "letterSpacing": 0.5
              },
              "children": [],
              "textProp": "ctachip1txttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "NtaUs",
          "name": "ctaChip2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "alignItems": "center",
            "padding": "10px 16px",
            "borderRadius": 999,
            "background": "#13203A",
            "border": "1px solid #2A3C61"
          },
          "children": [
            {
              "type": "text",
              "id": "Ek5HF",
              "name": "ctaChip2Txt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D8E2F4",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "600",
                "letterSpacing": 0.5
              },
              "children": [],
              "textProp": "ctachip2txttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "NC6EX",
          "name": "ctaChip3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "alignItems": "center",
            "padding": "10px 16px",
            "borderRadius": 999,
            "background": "#13203A",
            "border": "1px solid #2A3C61"
          },
          "children": [
            {
              "type": "text",
              "id": "6oMNW",
              "name": "ctaChip3Txt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D8E2F4",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "600",
                "letterSpacing": 0.5
              },
              "children": [],
              "textProp": "ctachip3txttext"
            }
          ]
        }
      ]
    }
  ],
  "hrefProp": "bottomCtahref"
};
const DEFAULT_PROPS = {
  "id": "N4eH8",
  "bottomCtahref": "/ready-to-turn-tonight-into-your-first-great-observing-story",
  "ctatitletext": "READY TO TURN TONIGHT INTO YOUR FIRST GREAT OBSERVING STORY?",
  "ctasubtext": "Choose the setup that matches your skill level, get guided quickly, and build momentum with every clear sky window.",
  "ctabtntxttext": "BOOK A PERSONAL DEMO",
  "ctabtntxthref": "/book-a-personal-demo",
  "ctachip1txttext": "MATCHED TO YOUR EXPERIENCE LEVEL",
  "ctachip2txttext": "PERSONALIZED PRODUCT WALKTHROUGH",
  "ctachip3txttext": "QUICK START RECOMMENDATIONS"
};
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };

const assignDefined = (target, patch) => {
  for (const [key, value] of Object.entries(patch || {})) {
    if (typeof value !== "undefined") target[key] = value;
  }
  return target;
};

const buildNodeStyle = (node, merged) => {
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
  return style;
};

const renderNode = (node, merged, key = "root") => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged);
  const href = node?.hrefProp ? String(merged?.[node.hrefProp] || "").trim() : "";
  if (node.type === "icon_font") {
    const Icon = node?.iconName ? ICONS[node.iconName] : null;
    if (Icon) {
      return React.createElement(Icon, {
        key,
        style,
        "data-pen-node": node.id || undefined,
      });
    }
    return React.createElement(
      "span",
      {
        key,
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
        style,
        "data-pen-node": node.id || undefined,
      },
      String(merged?.[node.textProp] ?? "")
    );
  }
  const Tag = href ? "a" : "div";
  return React.createElement(
    Tag,
    {
      key,
      href: href || undefined,
      style,
      "data-pen-node": node.id || undefined,
    },
    ...(Array.isArray(node.children) ? node.children.map((child, index) => renderNode(child, merged, `${key}-${index}`)) : [])
  );
};

export default function TemplateExclusiveUnistellarHomeUseCasesFooterBottomctapenAlt4({ id, bottomCtahref, ctatitletext, ctasubtext, ctabtntxttext, ctabtntxthref, ctachip1txttext, ctachip2txttext, ctachip3txttext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, bottomCtahref, ctatitletext, ctasubtext, ctabtntxttext, ctabtntxthref, ctachip1txttext, ctachip2txttext, ctachip3txttext });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "footer",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}