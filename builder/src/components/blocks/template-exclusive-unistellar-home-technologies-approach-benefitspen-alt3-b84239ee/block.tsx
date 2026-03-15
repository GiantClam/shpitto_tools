// @ts-nocheck
"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "Cjc8L",
  "name": "benefits",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 18,
    "padding": "8px 80px 56px 80px",
    "width": "100%"
  },
  "children": [
    {
      "type": "text",
      "id": "tv6Su",
      "name": "bh",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 44,
        "fontWeight": "600",
        "lineHeight": 1,
        "width": "100%"
      },
      "children": [],
      "textProp": "bhtext"
    },
    {
      "type": "frame",
      "id": "qdKFk",
      "name": "metrics",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 16,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "jTS9m",
          "name": "m1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 8,
            "padding": "20px",
            "width": "100%",
            "borderRadius": 20,
            "background": "#242426",
            "border": "1px solid #3A3A3C"
          },
          "children": [
            {
              "type": "text",
              "id": "biPSw",
              "name": "m1n",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Fraunces",
                "fontSize": 24,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "m1ntext"
            },
            {
              "type": "text",
              "id": "y2KSl",
              "name": "m1d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AEB7C6",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.55,
                "width": "100%"
              },
              "children": [],
              "textProp": "m1dtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "WzI4S",
          "name": "m2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 8,
            "padding": "20px",
            "width": "100%",
            "borderRadius": 20,
            "background": "#242426",
            "border": "1px solid #3A3A3C"
          },
          "children": [
            {
              "type": "text",
              "id": "b8xYp",
              "name": "m2n",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Fraunces",
                "fontSize": 24,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "m2ntext"
            },
            {
              "type": "text",
              "id": "0uOd1",
              "name": "m2d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#AEB7C6",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.55,
                "width": "100%"
              },
              "children": [],
              "textProp": "m2dtext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "Cjc8L",
  "bhtext": "Why observers switch to the Unistellar stack",
  "m1ntext": "Faster first light",
  "m1dtext": "Users spend less time calibrating and more time observing.",
  "m2ntext": "Sharper detail",
  "m2dtext": "Enhanced imaging recovers structure that conventional setups miss in bright conditions."
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

export default function TemplateExclusiveUnistellarHomeTechnologiesApproachBenefitspenAlt3({ id, bhtext, m1ntext, m1dtext, m2ntext, m2dtext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, bhtext, m1ntext, m1dtext, m2ntext, m2dtext });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "approach",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}