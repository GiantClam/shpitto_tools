"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "OWa63",
  "name": "cta",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "justifyContent": "space-between",
    "alignItems": "center",
    "padding": "28px 30px",
    "width": "100%",
    "borderRadius": 24,
    "background": "linear-gradient(135deg, #1E2738 0%, #131C2C 100%)",
    "border": "1px solid #2F3F5B"
  },
  "children": [
    {
      "type": "frame",
      "id": "jZRYC",
      "name": "ctac",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 12,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "FlIyc",
          "name": "ctah",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FAFAF9",
            "fontFamily": "Fraunces",
            "fontSize": 34,
            "fontWeight": "600"
          },
          "children": [],
          "textProp": "ctahtext"
        },
        {
          "type": "text",
          "id": "mrylj",
          "name": "ctad",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#AEB7C6",
            "fontFamily": "DM Sans",
            "fontSize": 15,
            "fontWeight": "normal",
            "lineHeight": 1.55,
            "width": "100%"
          },
          "children": [],
          "textProp": "ctadtext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "6otaR",
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
          "id": "rzs1i",
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
  "id": "OWa63",
  "ctahref": "/see-what-makes-the-stack-work-together",
  "ctahtext": "See what makes the stack work together",
  "ctadtext": "Review the product line and choose the hardware that matches your observing style.",
  "ctabttext": "View smart telescopes"
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

export default function TemplateExclusiveUnistellarHomeTechnologiesCtaCtapenAlt4({ id, ctahref, ctahtext, ctadtext, ctabttext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, ctahref, ctahtext, ctadtext, ctabttext });
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