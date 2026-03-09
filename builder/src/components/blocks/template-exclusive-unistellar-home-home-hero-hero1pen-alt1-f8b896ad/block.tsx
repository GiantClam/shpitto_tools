"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "fPwLp",
  "name": "hero1",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 20,
    "justifyContent": "center",
    "alignItems": "center",
    "padding": "80px 72px",
    "width": "100%",
    "height": 620,
    "backgroundRepeat": "no-repeat",
    "backgroundPosition": "center",
    "backgroundSize": "cover"
  },
  "children": [
    {
      "type": "text",
      "id": "NkVbB",
      "name": "h1tag",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#A7B3CC",
        "fontFamily": "Manrope",
        "fontSize": 14,
        "letterSpacing": 1.6,
        "textAlign": "center"
      },
      "children": [],
      "textProp": "h1tagtext"
    },
    {
      "type": "text",
      "id": "NzqU2",
      "name": "h1",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 62,
        "fontWeight": "700",
        "letterSpacing": -0.8,
        "textAlign": "center"
      },
      "children": [],
      "textProp": "h1text"
    },
    {
      "type": "text",
      "id": "f8juI",
      "name": "h1desc",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#C8D0E2",
        "fontFamily": "Manrope",
        "fontSize": 19,
        "lineHeight": 1.5,
        "textAlign": "center",
        "width": 760
      },
      "children": [],
      "textProp": "h1desctext"
    },
    {
      "type": "frame",
      "id": "slPvi",
      "name": "h1Actions",
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
          "id": "xdIRZ",
          "name": "learnBtn",
          "style": {
            "boxSizing": "border-box",
            "padding": "14px 22px",
            "borderRadius": 999,
            "background": "#FFFFFF"
          },
          "children": [
            {
              "type": "text",
              "id": "DlGuO",
              "name": "learnTxt",
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
              "textProp": "learntxttext"
            }
          ],
          "hrefProp": "learnbtnhref"
        },
        {
          "type": "frame",
          "id": "msiK4",
          "name": "orderBtn",
          "style": {
            "boxSizing": "border-box",
            "padding": "14px 22px",
            "borderRadius": 999,
            "background": "#1D4ED8",
            "border": "1px solid #93C5FD"
          },
          "children": [
            {
              "type": "text",
              "id": "jtPQ7",
              "name": "orderTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "ordertxttext"
            }
          ],
          "hrefProp": "orderbtnhref"
        }
      ]
    }
  ],
  "imageProp": "hero1imagesrc"
};
const DEFAULT_PROPS = {
  "id": "fPwLp",
  "hero1imagesrc": "https://images.unsplash.com/photo-1501523321-8ecb927b4be6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODczNDh8&ixlib=rb-4.1.0&q=80&w=1080",
  "h1tagtext": "Unistellar Smart Telescopes",
  "h1text": "The Ultimate Stargazing Experience",
  "h1desctext": "From distant galaxies, nebulae and clusters to nearby solar system planets, experience the universe in extraordinary clarity.",
  "learnbtnhref": "/learn-more",
  "learntxttext": "Learn More",
  "orderbtnhref": "/order-yours",
  "ordertxttext": "Order Yours"
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

export default function TemplateExclusiveUnistellarHomeHomeHeroHero1penAlt1({ id, hero1imagesrc, h1tagtext, h1text, h1desctext, learnbtnhref, learntxttext, orderbtnhref, ordertxttext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, hero1imagesrc, h1tagtext, h1text, h1desctext, learnbtnhref, learntxttext, orderbtnhref, ordertxttext });
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