// @ts-nocheck
"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "3vVDg",
  "name": "navBlog",
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
      "id": "RCksu",
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
      "id": "RnY9O",
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
          "id": "8FHZn",
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
          "textProp": "fhzntext",
          "hrefProp": "fhznhref"
        },
        {
          "type": "text",
          "id": "epQxY",
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
          "textProp": "epqxytext",
          "hrefProp": "epqxyhref"
        },
        {
          "type": "text",
          "id": "CqffS",
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
          "textProp": "cqffstext",
          "hrefProp": "cqffshref"
        },
        {
          "type": "text",
          "id": "3xXcB",
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
          "textProp": "xxcbtext",
          "hrefProp": "xxcbhref"
        },
        {
          "type": "text",
          "id": "7jGph",
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
          "textProp": "jgphtext",
          "hrefProp": "jgphhref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "FCuLh",
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
          "id": "HQrMW",
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
  "id": "3vVDg",
  "logotext": "UNISTELLAR",
  "logohref": "/unistellar",
  "fhzntext": "Smart Telescopes",
  "fhznhref": "/smart-telescopes",
  "epqxytext": "Smart Binoculars",
  "epqxyhref": "/smart-binoculars",
  "cqffstext": "Reviews",
  "cqffshref": "/reviews",
  "xxcbtext": "Technologies",
  "xxcbhref": "/technologies",
  "jgphtext": "Use Cases",
  "jgphhref": "/use-cases",
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

export default function TemplateExclusiveUnistellarHomeBlogNavigationNavblogpenPrimary({ id, logotext, logohref, fhzntext, fhznhref, epqxytext, epqxyhref, cqffstext, cqffshref, xxcbtext, xxcbhref, jgphtext, jgphhref, ctahref, ctatexttext, ctatexthref, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, logotext, logohref, fhzntext, fhznhref, epqxytext, epqxyhref, cqffstext, cqffshref, xxcbtext, xxcbhref, jgphtext, jgphhref, ctahref, ctatexttext, ctatexthref });
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