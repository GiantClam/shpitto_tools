// @ts-nocheck
"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "4ZrqV",
  "name": "cards",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 20,
    "padding": "8px 56px 56px 56px",
    "width": "100%",
    "background": "#060A14"
  },
  "children": [
    {
      "type": "frame",
      "id": "svUKg",
      "name": "row1",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 20,
        "width": "100%",
        "height": 320
      },
      "children": [
        {
          "type": "frame",
          "id": "IcbQG",
          "name": "c1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "justifyContent": "flex-end",
            "padding": "20px",
            "width": "100%",
            "height": "100%",
            "borderRadius": 16,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [
            {
              "type": "text",
              "id": "ZzODI",
              "name": "c1t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 24,
                "fontWeight": "700",
                "lineHeight": 1.15,
                "width": "100%"
              },
              "children": [],
              "textProp": "c1ttext"
            },
            {
              "type": "text",
              "id": "mcfUq",
              "name": "c1k",
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
              "textProp": "c1ktext"
            }
          ],
          "imageProp": "c1imagesrc"
        },
        {
          "type": "frame",
          "id": "f0fWs",
          "name": "c2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "justifyContent": "flex-end",
            "padding": "20px",
            "width": "100%",
            "height": "100%",
            "borderRadius": 16,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [
            {
              "type": "text",
              "id": "bm3I8",
              "name": "c2t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 24,
                "fontWeight": "700",
                "lineHeight": 1.15,
                "width": "100%"
              },
              "children": [],
              "textProp": "c2ttext"
            },
            {
              "type": "text",
              "id": "xaKDp",
              "name": "c2k",
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
              "textProp": "c2ktext"
            }
          ],
          "imageProp": "c2imagesrc"
        },
        {
          "type": "frame",
          "id": "s3WHW",
          "name": "c3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "justifyContent": "flex-end",
            "padding": "20px",
            "width": "100%",
            "height": "100%",
            "borderRadius": 16,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [
            {
              "type": "text",
              "id": "6AdmA",
              "name": "c3t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 24,
                "fontWeight": "700",
                "lineHeight": 1.15,
                "width": "100%"
              },
              "children": [],
              "textProp": "c3ttext"
            },
            {
              "type": "text",
              "id": "aCVW7",
              "name": "c3k",
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
              "textProp": "c3ktext"
            }
          ],
          "imageProp": "c3imagesrc"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "4ZrqV",
  "c1imagesrc": "https://images.unsplash.com/photo-1667415382888-0f16395c5b63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxOTA5MzF8&ixlib=rb-4.1.0&q=80&w=1080",
  "c1ttext": "Beginner’s Guide to Deep-Sky Objects",
  "c1ktext": "Guide",
  "c2imagesrc": "https://images.unsplash.com/photo-1698677364351-944694896038?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxOTA5MzJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "c2ttext": "Citizen Science Missions You Can Join",
  "c2ktext": "Science",
  "c3imagesrc": "https://images.unsplash.com/photo-1606141174452-2c575f4a326d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxOTA5MzJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "c3ttext": "Astrophotography Tips from the Community",
  "c3ktext": "Community"
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

export default function TemplateExclusiveUnistellarHomeBlogProductsCardspenAlt3({ id, c1imagesrc, c1ttext, c1ktext, c2imagesrc, c2ttext, c2ktext, c3imagesrc, c3ttext, c3ktext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, c1imagesrc, c1ttext, c1ktext, c2imagesrc, c2ttext, c2ktext, c3imagesrc, c3ttext, c3ktext });
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