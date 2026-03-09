"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "ayGzL",
  "name": "footBlog",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 28,
    "padding": "54px 72px",
    "width": "100%",
    "background": "#050914"
  },
  "children": [
    {
      "type": "frame",
      "id": "By77b",
      "name": "ftTop",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "8lf6p",
          "name": "ftBrand",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "width": 300
          },
          "children": [
            {
              "type": "text",
              "id": "iuC6h",
              "name": "ftLogo",
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
              "textProp": "ftlogotext"
            },
            {
              "type": "text",
              "id": "8icSr",
              "name": "ftDesc",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9AA7C1",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "ftdesctext",
              "hrefProp": "ftdeschref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "0QRm1",
          "name": "ftCols",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "space-between",
            "width": 900
          },
          "children": [
            {
              "type": "text",
              "id": "VN7nX",
              "name": "col1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D1DAEB",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.9,
                "width": 190
              },
              "children": [],
              "textProp": "col1text"
            },
            {
              "type": "text",
              "id": "OoSUq",
              "name": "col2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D1DAEB",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.9,
                "width": 190
              },
              "children": [],
              "textProp": "col2text",
              "hrefProp": "col2href"
            },
            {
              "type": "text",
              "id": "8VXOb",
              "name": "col3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D1DAEB",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.9,
                "width": 190
              },
              "children": [],
              "textProp": "col3text",
              "hrefProp": "col3href"
            },
            {
              "type": "text",
              "id": "xnX9O",
              "name": "col4",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D1DAEB",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.9,
                "width": 190
              },
              "children": [],
              "textProp": "col4text",
              "hrefProp": "col4href"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "iA7nS",
      "name": "ftBottom",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "padding": "20px 0px",
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "mEzGi",
          "name": "copy",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#7E8CA8",
            "fontFamily": "Manrope",
            "fontSize": 13
          },
          "children": [],
          "textProp": "copytext"
        },
        {
          "type": "frame",
          "id": "qWyJ2",
          "name": "policyLinks",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 20,
            "alignItems": "center"
          },
          "children": [
            {
              "type": "text",
              "id": "QgL8G",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#7E8CA8",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "qgl8gtext"
            },
            {
              "type": "text",
              "id": "7vqWU",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#7E8CA8",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "vqwutext",
              "hrefProp": "vqwuhref"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "ayGzL",
  "ftlogotext": "UNISTELLAR",
  "ftdesctext": "The future of day and night exploration.",
  "ftdeschref": "/the-future-of-day-and-night-exploration",
  "col1text": "Products\nSmart Telescopes\nSmart Binoculars\nAccessories",
  "col2text": "Support\nHelp Center\nManuals\nContact",
  "col2href": "/support",
  "col3text": "Company\nAbout\nPress\nCareers",
  "col3href": "/company",
  "col4text": "Community\nEvents\nBlog\nPartners",
  "col4href": "/community",
  "copytext": "© 2026 Unistellar. All rights reserved.",
  "qgl8gtext": "Privacy Policy",
  "vqwutext": "Terms",
  "vqwuhref": "/terms"
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

export default function TemplateExclusiveUnistellarHomeBlogFooterFootblogpenAlt4({ id, ftlogotext, ftdesctext, ftdeschref, col1text, col2text, col2href, col3text, col3href, col4text, col4href, copytext, qgl8gtext, vqwutext, vqwuhref, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, ftlogotext, ftdesctext, ftdeschref, col1text, col2text, col2href, col3text, col3href, col4text, col4href, copytext, qgl8gtext, vqwutext, vqwuhref });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "footer",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}