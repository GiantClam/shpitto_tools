"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "pjqth",
  "name": "CTA",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 20,
    "alignItems": "center",
    "padding": "52px 56px",
    "width": "100%",
    "background": "#0A1224",
    "border": "1px solid #23324F"
  },
  "children": [
    {
      "type": "text",
      "id": "Cr5Wb",
      "name": "ctah",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 54,
        "fontWeight": "600",
        "lineHeight": 1,
        "textAlign": "center",
        "width": 980
      },
      "children": [],
      "textProp": "ctahtext"
    },
    {
      "type": "frame",
      "id": "nzLtn",
      "name": "ctab",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "center",
        "alignItems": "center",
        "padding": "0px 28px",
        "height": 54,
        "borderRadius": 999,
        "background": "#2B67F6",
        "border": "1px solid #4F84FF"
      },
      "children": [
        {
          "type": "text",
          "id": "LC9TM",
          "name": "ctabt",
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
          "textProp": "ctabttext"
        }
      ]
    }
  ],
  "hrefProp": "ctahref"
};
const DEFAULT_PROPS = {
  "id": "pjqth",
  "ctahref": "/your-next-discovery-is-tonight",
  "ctahtext": "Your next discovery is tonight",
  "ctabttext": "Book a guided demo"
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

export default function TemplateExclusiveUnistellarHomeSmartTelescopesCtaCtapenAlt4({ id, ctahref, ctahtext, ctabttext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, ctahref, ctahtext, ctabttext });
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