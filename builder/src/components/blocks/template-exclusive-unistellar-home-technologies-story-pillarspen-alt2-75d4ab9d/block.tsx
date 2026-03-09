"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "MIH01",
  "name": "pillars",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 26,
    "padding": "48px 80px 56px 80px",
    "width": "100%"
  },
  "children": [
    {
      "type": "text",
      "id": "rxLDm",
      "name": "pl",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#97A0AE",
        "fontFamily": "DM Sans",
        "fontSize": 12,
        "fontWeight": "600",
        "letterSpacing": 1.6
      },
      "children": [],
      "textProp": "pltext"
    },
    {
      "type": "text",
      "id": "zmxC9",
      "name": "pt",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 52,
        "fontWeight": "600",
        "lineHeight": 1,
        "width": "100%"
      },
      "children": [],
      "textProp": "pttext"
    },
    {
      "type": "frame",
      "id": "oYyy3",
      "name": "pg",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 18,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "IYWt2",
          "name": "p1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "padding": "24px 22px",
            "width": "100%",
            "borderRadius": 20,
            "background": "#242426",
            "border": "1px solid #3A3A3C"
          },
          "children": [
            {
              "type": "text",
              "id": "QQFfm",
              "name": "p1t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Fraunces",
                "fontSize": 26,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "p1ttext"
            },
            {
              "type": "text",
              "id": "GEW3l",
              "name": "p1d",
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
              "textProp": "p1dtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "gbwzO",
          "name": "p2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "padding": "24px 22px",
            "width": "100%",
            "borderRadius": 20,
            "background": "#242426",
            "border": "1px solid #3A3A3C"
          },
          "children": [
            {
              "type": "text",
              "id": "a2q1j",
              "name": "p2t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Fraunces",
                "fontSize": 26,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "p2ttext"
            },
            {
              "type": "text",
              "id": "yWVB1",
              "name": "p2d",
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
              "textProp": "p2dtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "X3wv7",
          "name": "p3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "padding": "24px 22px",
            "width": "100%",
            "borderRadius": 20,
            "background": "linear-gradient(135deg, #1D2433 0%, #141C2B 100%)",
            "border": "1px solid #2F3F5B"
          },
          "children": [
            {
              "type": "text",
              "id": "XWcOE",
              "name": "p3t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Fraunces",
                "fontSize": 26,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "p3ttext"
            },
            {
              "type": "text",
              "id": "OabGJ",
              "name": "p3d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F5F5F0",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.55,
                "width": "100%"
              },
              "children": [],
              "textProp": "p3dtext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "MIH01",
  "pltext": "TECHNOLOGY PILLARS",
  "pttext": "Three integrated systems. One seamless cosmic experience.",
  "p1ttext": "Autonomous tracking",
  "p1dtext": "Mount, align, and stay locked on target without manual correction.",
  "p2ttext": "Signal enhancement",
  "p2dtext": "Software-driven stacking restores detail from noisy urban skies in real time.",
  "p3ttext": "Shared observation data",
  "p3dtext": "Networked observations create richer context and better validation for every session."
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

export default function TemplateExclusiveUnistellarHomeTechnologiesStoryPillarspenAlt2({ id, pltext, pttext, p1ttext, p1dtext, p2ttext, p2dtext, p3ttext, p3dtext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, pltext, pttext, p1ttext, p1dtext, p2ttext, p2dtext, p3ttext, p3dtext });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "story",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}