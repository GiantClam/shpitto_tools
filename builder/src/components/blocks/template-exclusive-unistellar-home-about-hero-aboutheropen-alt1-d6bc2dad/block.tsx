// @ts-nocheck
"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "Hg8U1",
  "name": "About Hero",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 36,
    "alignItems": "center",
    "padding": "56px 56px 48px 56px",
    "width": "100%",
    "height": 560,
    "background": "linear-gradient(180deg, #10182D 0%, #060A14 100%)"
  },
  "children": [
    {
      "type": "frame",
      "id": "Sdn30",
      "name": "heroLeft",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 20,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "ukK42",
          "name": "heroEyebrow",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#9DB0D4",
            "fontFamily": "Manrope",
            "fontSize": 12,
            "fontWeight": "500",
            "letterSpacing": 2,
            "width": "100%"
          },
          "children": [],
          "textProp": "heroeyebrowtext"
        },
        {
          "type": "text",
          "id": "HJtDf",
          "name": "heroTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Space Grotesk",
            "fontSize": 60,
            "fontWeight": "600",
            "letterSpacing": -1,
            "lineHeight": 1,
            "width": "100%"
          },
          "children": [],
          "textProp": "herotitletext"
        },
        {
          "type": "text",
          "id": "AJZ8x",
          "name": "heroBody",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#9AAACA",
            "fontFamily": "Manrope",
            "fontSize": 16,
            "fontWeight": "normal",
            "lineHeight": 1.42,
            "width": "100%"
          },
          "children": [],
          "textProp": "herobodytext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "slntS",
      "name": "Hero Story Image",
      "style": {
        "boxSizing": "border-box",
        "width": 520,
        "height": 372,
        "borderRadius": 16,
        "border": "1px solid #31435F",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover"
      },
      "children": [],
      "imageProp": "heroStoryImageimagesrc"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "Hg8U1",
  "heroeyebrowtext": "OUR STORY",
  "herotitletext": "We build telescopes that make the universe feel personal.",
  "herobodytext": "Unistellar started with one belief: space should not belong only to observatories. We design autonomous instruments and a global citizen-science network so anyone can discover, capture, and contribute from their own backyard.",
  "heroStoryImageimagesrc": "https://images.unsplash.com/photo-1697451735065-f23cbfc6b218?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxOTA4NjZ8&ixlib=rb-4.1.0&q=80&w=1080"
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

export default function TemplateExclusiveUnistellarHomeAboutHeroAboutheropenAlt1({ id, heroeyebrowtext, herotitletext, herobodytext, heroStoryImageimagesrc, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, heroeyebrowtext, herotitletext, herobodytext, heroStoryImageimagesrc });
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