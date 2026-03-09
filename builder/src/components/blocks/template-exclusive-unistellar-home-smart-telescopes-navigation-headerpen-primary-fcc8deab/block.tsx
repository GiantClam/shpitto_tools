"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "esrC3",
  "name": "Header",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "justifyContent": "space-between",
    "alignItems": "center",
    "padding": "0px 56px",
    "width": "100%",
    "height": 88,
    "background": "#0B0B0E"
  },
  "children": [
    {
      "type": "text",
      "id": "N6kRf",
      "name": "logo",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Fraunces",
        "fontSize": 26,
        "fontWeight": "600",
        "letterSpacing": -0.3,
        "width": 180
      },
      "children": [],
      "textProp": "logotext",
      "hrefProp": "logohref"
    },
    {
      "type": "frame",
      "id": "8C9VP",
      "name": "navLinks",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 24,
        "justifyContent": "center",
        "alignItems": "center",
        "width": 620
      },
      "children": [
        {
          "type": "text",
          "id": "DCurs",
          "name": "nh",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "nhtext",
          "hrefProp": "nhhref"
        },
        {
          "type": "text",
          "id": "ZNuzG",
          "name": "ns",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FAFAF9",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "600"
          },
          "children": [],
          "textProp": "nstext",
          "hrefProp": "nshref"
        },
        {
          "type": "text",
          "id": "0nYmd",
          "name": "nb",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "nbtext",
          "hrefProp": "nbhref"
        },
        {
          "type": "text",
          "id": "9XOtg",
          "name": "nt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "nttext",
          "hrefProp": "nthref"
        },
        {
          "type": "text",
          "id": "IK3A1",
          "name": "nr",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "nrtext",
          "hrefProp": "nrhref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "4W5L6",
      "name": "headerBtn",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "center",
        "alignItems": "center",
        "padding": "10px 18px",
        "borderRadius": 999,
        "background": "#121722",
        "border": "1px solid #303849"
      },
      "children": [
        {
          "type": "text",
          "id": "l3wgE",
          "name": "btnt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#D6DEEA",
            "fontFamily": "DM Sans",
            "fontSize": 13,
            "fontWeight": "600"
          },
          "children": [],
          "textProp": "btnttext",
          "hrefProp": "btnthref"
        }
      ],
      "hrefProp": "headerbtnhref"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "esrC3",
  "logotext": "UNISTELLAR",
  "logohref": "/unistellar",
  "nhtext": "Home",
  "nhhref": "/",
  "nstext": "Smart Telescopes",
  "nshref": "/smart-telescopes",
  "nbtext": "Smart Binoculars",
  "nbhref": "/smart-binoculars",
  "nttext": "Technologies",
  "nthref": "/technologies",
  "nrtext": "Reviews",
  "nrhref": "/reviews",
  "headerbtnhref": "/support-portal",
  "btnttext": "Support Portal",
  "btnthref": "/support-portal"
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

export default function TemplateExclusiveUnistellarHomeSmartTelescopesNavigationHeaderpenPrimary({ id, logotext, logohref, nhtext, nhhref, nstext, nshref, nbtext, nbhref, nttext, nthref, nrtext, nrhref, headerbtnhref, btnttext, btnthref, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, logotext, logohref, nhtext, nhhref, nstext, nshref, nbtext, nbhref, nttext, nthref, nrtext, nrhref, headerbtnhref, btnttext, btnthref });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "navigation",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}