// @ts-nocheck
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
  "id": "8Yhnq",
  "name": "Header",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "justifyContent": "space-between",
    "alignItems": "center",
    "padding": "0px 56px",
    "width": "100%",
    "height": 88,
    "background": "#0B0B0E",
    "borderBottom": "1px solid #2A2A2E"
  },
  "children": [
    {
      "type": "text",
      "id": "Gt2W3",
      "name": "logo",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 26,
        "fontWeight": "600",
        "letterSpacing": -0.3,
        "width": 180
      },
      "children": [],
      "textProp": "logotext",
      "hrefProp": "logohref"
    },
    {
      "type": "frame",
      "id": "eFIgT",
      "name": "navLinks",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 24,
        "justifyContent": "center",
        "alignItems": "center",
        "width": 560
      },
      "children": [
        {
          "type": "text",
          "id": "4xtMr",
          "name": "navHome",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "navhometext",
          "hrefProp": "navhomehref"
        },
        {
          "type": "text",
          "id": "lYvZ8",
          "name": "navScopes",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "navscopestext",
          "hrefProp": "navscopeshref"
        },
        {
          "type": "text",
          "id": "AJxM7",
          "name": "navBinocs",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "navbinocstext",
          "hrefProp": "navbinocshref"
        },
        {
          "type": "text",
          "id": "2JYLc",
          "name": "navTech",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "navtechtext",
          "hrefProp": "navtechhref"
        },
        {
          "type": "text",
          "id": "buVAh",
          "name": "navContact",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "navcontacttext",
          "hrefProp": "navcontacthref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "t5dzP",
      "name": "headerBtn",
      "style": {
        "boxSizing": "border-box",
        "padding": "10px 18px",
        "borderRadius": 999,
        "background": "#121722",
        "border": "1px solid #303849"
      },
      "children": [
        {
          "type": "text",
          "id": "EaXYp",
          "name": "headerBtnText",
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
          "textProp": "headerbtntexttext"
        }
      ],
      "hrefProp": "headerbtnhref"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "8Yhnq",
  "logotext": "UNISTELLAR",
  "logohref": "/unistellar",
  "navhometext": "Home",
  "navhomehref": "/",
  "navscopestext": "Smart Telescopes",
  "navscopeshref": "/smart-telescopes",
  "navbinocstext": "Smart Binoculars",
  "navbinocshref": "/smart-binoculars",
  "navtechtext": "Technologies",
  "navtechhref": "/technologies",
  "navcontacttext": "Contact",
  "navcontacthref": "/contact",
  "headerbtnhref": "/support-portal",
  "headerbtntexttext": "Support Portal"
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

export default function TemplateExclusiveUnistellarHomeSmartBinocularsNavigationHeaderpenPrimary({ id, logotext, logohref, navhometext, navhomehref, navscopestext, navscopeshref, navbinocstext, navbinocshref, navtechtext, navtechhref, navcontacttext, navcontacthref, headerbtnhref, headerbtntexttext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, logotext, logohref, navhometext, navhomehref, navscopestext, navscopeshref, navbinocstext, navbinocshref, navtechtext, navtechhref, navcontacttext, navcontacthref, headerbtnhref, headerbtntexttext });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "navigation",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}