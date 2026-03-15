// @ts-nocheck
"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "BU419",
  "name": "Product Highlights",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 20,
    "padding": "28px 56px",
    "width": "100%"
  },
  "children": [
    {
      "type": "text",
      "id": "IMoX0",
      "name": "ht",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 30,
        "fontWeight": "600",
        "width": "100%"
      },
      "children": [],
      "textProp": "httext"
    },
    {
      "type": "frame",
      "id": "OKTGw",
      "name": "grid",
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
          "id": "lXvei",
          "name": "c1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "padding": "18px",
            "width": "100%",
            "borderRadius": 16,
            "background": "#0F172B",
            "border": "1px solid #23324F"
          },
          "children": [
            {
              "type": "text",
              "id": "D4f8b",
              "name": "c1n",
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
              "textProp": "c1ntext"
            },
            {
              "type": "text",
              "id": "KFiTE",
              "name": "c1d",
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
              "textProp": "c1dtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "xHOWn",
          "name": "c2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "padding": "18px",
            "width": "100%",
            "borderRadius": 16,
            "background": "#0F172B",
            "border": "1px solid #23324F"
          },
          "children": [
            {
              "type": "text",
              "id": "9qNJ1",
              "name": "c2n",
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
              "textProp": "c2ntext"
            },
            {
              "type": "text",
              "id": "Ik6YJ",
              "name": "c2d",
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
              "textProp": "c2dtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "0J9AE",
          "name": "c3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "padding": "18px",
            "width": "100%",
            "borderRadius": 16,
            "background": "#0F172B",
            "border": "1px solid #23324F"
          },
          "children": [
            {
              "type": "text",
              "id": "1hoDp",
              "name": "c3n",
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
              "textProp": "c3ntext"
            },
            {
              "type": "text",
              "id": "KfpYw",
              "name": "c3d",
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
              "textProp": "c3dtext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "BU419",
  "httext": "PRODUCT HIGHLIGHTS",
  "c1ntext": "Autonomous alignment",
  "c1dtext": "Set the telescope down, launch the app, and start observing without manual star-hopping.",
  "c2ntext": "Deep-sky enhancement",
  "c2dtext": "Real-time image stacking pulls nebulae and galaxies through light pollution and uneven seeing.",
  "c3ntext": "Shared sky intelligence",
  "c3dtext": "Observation data connects with a wider community, helping users validate targets and discover more nights worth keeping."
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

export default function TemplateExclusiveUnistellarHomeSmartTelescopesProductsProducthighlightspenAlt2({ id, httext, c1ntext, c1dtext, c2ntext, c2dtext, c3ntext, c3dtext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, httext, c1ntext, c1dtext, c2ntext, c2dtext, c3ntext, c3dtext });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "products",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}