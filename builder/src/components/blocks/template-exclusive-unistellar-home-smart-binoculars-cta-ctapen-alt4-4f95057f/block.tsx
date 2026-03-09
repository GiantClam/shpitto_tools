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
  "id": "RKKzX",
  "name": "CTA",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 16,
    "alignItems": "center",
    "padding": "48px 56px",
    "width": "100%",
    "background": "#0A1224",
    "borderTop": "1px solid #23324F",
    "borderBottom": "1px solid #23324F"
  },
  "children": [
    {
      "type": "text",
      "id": "QiE4T",
      "name": "ctaKicker",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#97A0AE",
        "fontFamily": "DM Sans",
        "fontSize": 12,
        "fontWeight": "600",
        "letterSpacing": 1.2
      },
      "children": [],
      "textProp": "ctakickertext"
    },
    {
      "type": "text",
      "id": "UsoRT",
      "name": "ctaTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 50,
        "fontWeight": "600",
        "lineHeight": 1.02,
        "textAlign": "center",
        "width": 960
      },
      "children": [],
      "textProp": "ctatitletext"
    },
    {
      "type": "text",
      "id": "CjVrJ",
      "name": "ctaBody",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#C9D3E5",
        "fontFamily": "DM Sans",
        "fontSize": 16,
        "fontWeight": "normal",
        "lineHeight": 1.5,
        "textAlign": "center",
        "width": 860
      },
      "children": [],
      "textProp": "ctabodytext"
    },
    {
      "type": "frame",
      "id": "xqM52",
      "name": "ctaButton",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "center",
        "alignItems": "center",
        "padding": "14px 26px",
        "borderRadius": 999,
        "background": "#2B67F6",
        "border": "1px solid #4F84FF"
      },
      "children": [
        {
          "type": "text",
          "id": "vZDsi",
          "name": "ctaButtonText",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "600"
          },
          "children": [],
          "textProp": "ctabuttontexttext",
          "hrefProp": "ctabuttontexthref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "0UrQg",
      "name": "ctaSub",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 12
      },
      "children": [
        {
          "type": "frame",
          "id": "t4NTM",
          "name": "ctaS1",
          "style": {
            "boxSizing": "border-box",
            "padding": "10px 16px",
            "borderRadius": 999,
            "background": "#F5F7FB",
            "border": "1px solid #C9D7FF"
          },
          "children": [
            {
              "type": "text",
              "id": "HTOjk",
              "name": "ctaS1t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#244DB7",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "ctas1ttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "dxC1f",
          "name": "ctaS2",
          "style": {
            "boxSizing": "border-box",
            "padding": "10px 16px",
            "borderRadius": 999,
            "background": "#EDF3FF",
            "border": "1px solid #C9D7FF"
          },
          "children": [
            {
              "type": "text",
              "id": "bKf4w",
              "name": "ctaS2t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#244DB7",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "ctas2ttext"
            }
          ]
        }
      ]
    }
  ],
  "hrefProp": "ctahref"
};
const DEFAULT_PROPS = {
  "id": "RKKzX",
  "ctahref": "/envision-smart-binoculars",
  "ctakickertext": "ENVISION Smart Binoculars",
  "ctatitletext": "Own the Next Generation of Celestial Observation",
  "ctabodytext": "Reserve Smart Binoculars now and receive concierge onboarding, priority firmware access, and launch pricing.",
  "ctabuttontexttext": "Reserve Envision",
  "ctabuttontexthref": "/reserve-envision",
  "ctas1ttext": "See Specs",
  "ctas2ttext": "Talk to Sales"
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

export default function TemplateExclusiveUnistellarHomeSmartBinocularsCtaCtapenAlt4({ id, ctahref, ctakickertext, ctatitletext, ctabodytext, ctabuttontexttext, ctabuttontexthref, ctas1ttext, ctas2ttext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, ctahref, ctakickertext, ctatitletext, ctabodytext, ctabuttontexttext, ctabuttontexthref, ctas1ttext, ctas2ttext });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "cta",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}