"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "FBWfI",
  "name": "navPolicy",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "justifyContent": "space-between",
    "alignItems": "center",
    "padding": "0px 40px",
    "width": "100%",
    "height": 84,
    "background": "#080D18"
  },
  "children": [
    {
      "type": "text",
      "id": "8QWHw",
      "name": "logo",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Manrope",
        "fontSize": 24,
        "fontWeight": "700",
        "letterSpacing": 1.4
      },
      "children": [],
      "textProp": "logotext",
      "hrefProp": "logohref"
    },
    {
      "type": "frame",
      "id": "Q1g0v",
      "name": "menuLinks",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 28,
        "alignItems": "center"
      },
      "children": [
        {
          "type": "text",
          "id": "7g7ii",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C4CCDA",
            "fontFamily": "Manrope",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "g7iitext",
          "hrefProp": "g7iihref"
        },
        {
          "type": "text",
          "id": "ahwkF",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C4CCDA",
            "fontFamily": "Manrope",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "ahwkftext",
          "hrefProp": "ahwkfhref"
        },
        {
          "type": "text",
          "id": "SeG1m",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C4CCDA",
            "fontFamily": "Manrope",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "seg1mtext",
          "hrefProp": "seg1mhref"
        },
        {
          "type": "text",
          "id": "zOypP",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C4CCDA",
            "fontFamily": "Manrope",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "zoypptext",
          "hrefProp": "zoypphref"
        },
        {
          "type": "text",
          "id": "haTQI",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C4CCDA",
            "fontFamily": "Manrope",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "hatqitext",
          "hrefProp": "hatqihref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "a92i8",
      "name": "cta",
      "style": {
        "boxSizing": "border-box",
        "padding": "14px 22px",
        "borderRadius": 999,
        "background": "#FFFFFF"
      },
      "children": [
        {
          "type": "text",
          "id": "DalbD",
          "name": "ctaText",
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
          "textProp": "ctatexttext",
          "hrefProp": "ctatexthref"
        }
      ],
      "hrefProp": "ctahref"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "FBWfI",
  "logotext": "UNISTELLAR",
  "logohref": "/unistellar",
  "g7iitext": "Smart Telescopes",
  "g7iihref": "/smart-telescopes",
  "ahwkftext": "Smart Binoculars",
  "ahwkfhref": "/smart-binoculars",
  "seg1mtext": "Reviews",
  "seg1mhref": "/reviews",
  "zoypptext": "Technologies",
  "zoypphref": "/technologies",
  "hatqitext": "Use Cases",
  "hatqihref": "/use-cases",
  "ctahref": "/shop",
  "ctatexttext": "Shop",
  "ctatexthref": "/shop"
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

export default function TemplateExclusiveUnistellarHomePolicyNavigationNavpolicypenPrimary({ id, logotext, logohref, g7iitext, g7iihref, ahwkftext, ahwkfhref, seg1mtext, seg1mhref, zoypptext, zoypphref, hatqitext, hatqihref, ctahref, ctatexttext, ctatexthref, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, logotext, logohref, g7iitext, g7iihref, ahwkftext, ahwkfhref, seg1mtext, seg1mhref, zoypptext, zoypphref, hatqitext, hatqihref, ctahref, ctatexttext, ctatexthref });
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