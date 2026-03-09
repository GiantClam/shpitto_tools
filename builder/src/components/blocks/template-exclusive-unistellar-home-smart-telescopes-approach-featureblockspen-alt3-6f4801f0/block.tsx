"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "wWOIV",
  "name": "Feature Blocks",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 24,
    "padding": "40px 56px",
    "width": "100%",
    "background": "#080D18"
  },
  "children": [
    {
      "type": "text",
      "id": "uvWoD",
      "name": "ft",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 28,
        "fontWeight": "600",
        "width": "100%"
      },
      "children": [],
      "textProp": "fttext"
    },
    {
      "type": "frame",
      "id": "CSGBM",
      "name": "fb1",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 24,
        "alignItems": "center",
        "padding": "24px",
        "width": "100%",
        "borderRadius": 24,
        "background": "#101A30",
        "border": "1px solid #23324F"
      },
      "children": [
        {
          "type": "frame",
          "id": "Ytrbe",
          "name": "fb1t",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 8,
            "width": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "tYPh7",
              "name": "fb1h",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Fraunces",
                "fontSize": 32,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "fb1htext"
            },
            {
              "type": "text",
              "id": "rcUoT",
              "name": "fb1d",
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
              "textProp": "fb1dtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "pFRrK",
          "name": "fb1m",
          "style": {
            "boxSizing": "border-box",
            "width": 420,
            "height": 240,
            "borderRadius": 20,
            "border": "1px solid #3F3F46",
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [],
          "imageProp": "fb1mimagesrc"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "wWOIV",
  "fttext": "WHY UNISTELLAR FEELS LIKE A SMARTER NIGHT SKY",
  "fb1htext": "Fast setup, no mechanical friction",
  "fb1dtext": "The experience removes the ceremony that usually blocks new observers: alignment, tracking, and image capture all happen in a guided flow.",
  "fb1mimagesrc": "https://images.unsplash.com/photo-1531870095880-cac1a675e830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
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

export default function TemplateExclusiveUnistellarHomeSmartTelescopesApproachFeatureblockspenAlt3({ id, fttext, fb1htext, fb1dtext, fb1mimagesrc, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, fttext, fb1htext, fb1dtext, fb1mimagesrc });
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