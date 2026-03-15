// @ts-nocheck
"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "xjAR9",
  "name": "hero",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 16,
    "justifyContent": "center",
    "alignItems": "center",
    "padding": "72px",
    "width": "100%",
    "height": 520,
    "background": "linear-gradient(180deg, #10182D 0%, #060A14 100%)"
  },
  "children": [
    {
      "type": "text",
      "id": "AP1m0",
      "name": "heroTag",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#9DB0D4",
        "fontFamily": "Manrope",
        "fontSize": 14,
        "fontWeight": "normal",
        "letterSpacing": 1.2
      },
      "children": [],
      "textProp": "herotagtext"
    },
    {
      "type": "text",
      "id": "6WlxJ",
      "name": "heroTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 56,
        "fontWeight": "700",
        "lineHeight": 1.05,
        "textAlign": "center",
        "width": 980
      },
      "children": [],
      "textProp": "herotitletext"
    },
    {
      "type": "text",
      "id": "aavsW",
      "name": "heroDesc",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#C5CEE2",
        "fontFamily": "Manrope",
        "fontSize": 18,
        "fontWeight": "normal",
        "lineHeight": 1.45,
        "textAlign": "center",
        "width": 860
      },
      "children": [],
      "textProp": "herodesctext"
    },
    {
      "type": "frame",
      "id": "pvWM7",
      "name": "catRow",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 10
      },
      "children": [
        {
          "type": "frame",
          "id": "8zAeC",
          "name": "cat1",
          "style": {
            "boxSizing": "border-box",
            "padding": "8px 14px",
            "borderRadius": 999,
            "background": "#1B2742"
          },
          "children": [
            {
              "type": "text",
              "id": "0NqHW",
              "name": "cat1t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#DDE7FF",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "cat1ttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "i8FFW",
          "name": "cat2",
          "style": {
            "boxSizing": "border-box",
            "padding": "8px 14px",
            "borderRadius": 999,
            "background": "#1B2742"
          },
          "children": [
            {
              "type": "text",
              "id": "ThgUc",
              "name": "cat2t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#DDE7FF",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "cat2ttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "6yKGI",
          "name": "cat3",
          "style": {
            "boxSizing": "border-box",
            "padding": "8px 14px",
            "borderRadius": 999,
            "background": "#1B2742"
          },
          "children": [
            {
              "type": "text",
              "id": "IWBbv",
              "name": "cat3t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#DDE7FF",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "cat3ttext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "xjAR9",
  "herotagtext": "Unistellar Blog",
  "herotitletext": "Stories, Discoveries, and Deep-Sky Insights",
  "herodesctext": "Read product updates, observation guides, and field stories from the Unistellar community.",
  "cat1ttext": "Guides",
  "cat2ttext": "Science",
  "cat3ttext": "Community"
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

export default function TemplateExclusiveUnistellarHomeBlogHeroHeropenAlt1({ id, herotagtext, herotitletext, herodesctext, cat1ttext, cat2ttext, cat3ttext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, herotagtext, herotitletext, herodesctext, cat1ttext, cat2ttext, cat3ttext });
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