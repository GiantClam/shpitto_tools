// @ts-nocheck
"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "9sT19",
  "name": "hero2",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 20,
    "justifyContent": "center",
    "alignItems": "center",
    "padding": "70px 72px",
    "width": "100%",
    "height": 520,
    "backgroundRepeat": "no-repeat",
    "backgroundPosition": "center",
    "backgroundSize": "cover"
  },
  "children": [
    {
      "type": "text",
      "id": "3nNq6",
      "name": "h2tag",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#9FB0CF",
        "fontFamily": "Manrope",
        "fontSize": 14,
        "letterSpacing": 1.5,
        "textAlign": "center"
      },
      "children": [],
      "textProp": "h2tagtext"
    },
    {
      "type": "text",
      "id": "wGCwk",
      "name": "h2",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 56,
        "fontWeight": "700",
        "letterSpacing": -0.6,
        "lineHeight": 1.05,
        "textAlign": "center",
        "width": 800
      },
      "children": [],
      "textProp": "h2text"
    },
    {
      "type": "text",
      "id": "Ykpo2",
      "name": "h2desc",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#C9D2E7",
        "fontFamily": "Manrope",
        "fontSize": 18,
        "lineHeight": 1.45,
        "textAlign": "center",
        "width": 780
      },
      "children": [],
      "textProp": "h2desctext"
    },
    {
      "type": "frame",
      "id": "bYmuu",
      "name": "h2Actions",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 14,
        "alignItems": "center"
      },
      "children": [
        {
          "type": "frame",
          "id": "ZWJ6S",
          "name": "hero2a",
          "style": {
            "boxSizing": "border-box",
            "padding": "14px 22px",
            "borderRadius": 999,
            "background": "#FFFFFF"
          },
          "children": [
            {
              "type": "text",
              "id": "SIgR0",
              "name": "hero2at",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#0B1020",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "hero2attext"
            }
          ]
        }
      ]
    }
  ],
  "imageProp": "hero2imagesrc"
};
const DEFAULT_PROPS = {
  "id": "9sT19",
  "hero2imagesrc": "https://images.unsplash.com/photo-1625492600712-84d1b02dc263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODczNTJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "h2tagtext": "ENVISION Smart Binoculars",
  "h2text": "Augmented Reality Powered Binoculars",
  "h2desctext": "Overlaying contextual information directly into your natural field of view, ENVISION enhances day and night exploration.",
  "hero2attext": "Learn More"
};

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

export default function TemplateExclusiveUnistellarHomeHomeHeroHero2penAlt2({ id, hero2imagesrc, h2tagtext, h2text, h2desctext, hero2attext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, hero2imagesrc, h2tagtext, h2text, h2desctext, hero2attext });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "hero",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}