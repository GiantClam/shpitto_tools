// @ts-nocheck
"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "2OQvW",
  "name": "navCase",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "justifyContent": "space-between",
    "alignItems": "center",
    "padding": "0px 40px",
    "width": "100%",
    "height": 84,
    "background": "#080D18"
  },
  "children": [
    {
      "type": "text",
      "id": "gysDv",
      "name": "logo",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Manrope",
        "fontSize": 24,
        "fontWeight": "700",
        "letterSpacing": 1.4
      },
      "children": [],
      "textProp": "logotext",
      "hrefProp": "logohref"
    },
    {
      "type": "frame",
      "id": "Q9Kki",
      "name": "menuLinks",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 28,
        "alignItems": "center"
      },
      "children": [
        {
          "type": "text",
          "id": "WSQ4k",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C4CCDA",
            "fontFamily": "Manrope",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "wsq4ktext",
          "hrefProp": "wsq4khref"
        },
        {
          "type": "text",
          "id": "N5edj",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C4CCDA",
            "fontFamily": "Manrope",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "n5edjtext",
          "hrefProp": "n5edjhref"
        },
        {
          "type": "text",
          "id": "oGvGE",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C4CCDA",
            "fontFamily": "Manrope",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "ogvgetext",
          "hrefProp": "ogvgehref"
        },
        {
          "type": "text",
          "id": "JR51A",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C4CCDA",
            "fontFamily": "Manrope",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "jr51atext",
          "hrefProp": "jr51ahref"
        },
        {
          "type": "text",
          "id": "iT5gF",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C4CCDA",
            "fontFamily": "Manrope",
            "fontSize": 14,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "it5gftext",
          "hrefProp": "it5gfhref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "Ajp0y",
      "name": "cta",
      "style": {
        "boxSizing": "border-box",
        "padding": "14px 22px",
        "borderRadius": 999,
        "background": "#FFFFFF"
      },
      "children": [
        {
          "type": "text",
          "id": "WC2Rc",
          "name": "ctaText",
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
          "textProp": "ctatexttext",
          "hrefProp": "ctatexthref"
        }
      ],
      "hrefProp": "ctahref"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "2OQvW",
  "logotext": "UNISTELLAR",
  "logohref": "/unistellar",
  "wsq4ktext": "Smart Telescopes",
  "wsq4khref": "/smart-telescopes",
  "n5edjtext": "Smart Binoculars",
  "n5edjhref": "/smart-binoculars",
  "ogvgetext": "Reviews",
  "ogvgehref": "/reviews",
  "jr51atext": "Technologies",
  "jr51ahref": "/technologies",
  "it5gftext": "Use Cases",
  "it5gfhref": "/use-cases",
  "ctahref": "/shop",
  "ctatexttext": "Shop",
  "ctatexthref": "/shop"
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

export default function TemplateExclusiveUnistellarHomeUseCasesNavigationNavcasepenPrimary({ id, logotext, logohref, wsq4ktext, wsq4khref, n5edjtext, n5edjhref, ogvgetext, ogvgehref, jr51atext, jr51ahref, it5gftext, it5gfhref, ctahref, ctatexttext, ctatexthref, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, logotext, logohref, wsq4ktext, wsq4khref, n5edjtext, n5edjhref, ogvgetext, ogvgehref, jr51atext, jr51ahref, it5gftext, it5gfhref, ctahref, ctatexttext, ctatexthref });
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