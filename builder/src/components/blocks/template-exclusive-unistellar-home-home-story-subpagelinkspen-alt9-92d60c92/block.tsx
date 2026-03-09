"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "nIxWL",
  "name": "Subpage Links",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 14,
    "justifyContent": "center",
    "padding": "20px 40px",
    "width": "100%",
    "background": "#060A14"
  },
  "children": [
    {
      "type": "frame",
      "id": "rPBVk",
      "name": "lk1",
      "style": {
        "boxSizing": "border-box",
        "padding": "10px 16px",
        "borderRadius": 999,
        "background": "#1B2742"
      },
      "children": [
        {
          "type": "text",
          "id": "9n6dT",
          "name": "chip1",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#E5ECFB",
            "fontFamily": "Manrope",
            "fontSize": 13,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "chip1text"
        }
      ]
    },
    {
      "type": "frame",
      "id": "bPWdv",
      "name": "lk2",
      "style": {
        "boxSizing": "border-box",
        "padding": "10px 16px",
        "borderRadius": 999,
        "background": "#1B2742"
      },
      "children": [
        {
          "type": "text",
          "id": "iwVnP",
          "name": "chip2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#E5ECFB",
            "fontFamily": "Manrope",
            "fontSize": 13,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "chip2text"
        }
      ]
    },
    {
      "type": "frame",
      "id": "VUO3A",
      "name": "lk3",
      "style": {
        "boxSizing": "border-box",
        "padding": "10px 16px",
        "borderRadius": 999,
        "background": "#1B2742"
      },
      "children": [
        {
          "type": "text",
          "id": "OKpNI",
          "name": "chip3",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#E5ECFB",
            "fontFamily": "Manrope",
            "fontSize": 13,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "chip3text"
        }
      ]
    },
    {
      "type": "frame",
      "id": "mJDS5",
      "name": "lk4",
      "style": {
        "boxSizing": "border-box",
        "padding": "10px 16px",
        "borderRadius": 999,
        "background": "#1B2742"
      },
      "children": [
        {
          "type": "text",
          "id": "yyFTb",
          "name": "chip4",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#E5ECFB",
            "fontFamily": "Manrope",
            "fontSize": 13,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "chip4text"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "nIxWL",
  "chip1text": "Smart Telescopes Page",
  "chip2text": "Smart Binoculars Page",
  "chip3text": "Technologies Page",
  "chip4text": "Reviews Page"
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

export default function TemplateExclusiveUnistellarHomeHomeStorySubpagelinkspenAlt9({ id, chip1text, chip2text, chip3text, chip4text, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, chip1text, chip2text, chip3text, chip4text });
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