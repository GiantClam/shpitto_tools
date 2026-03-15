// @ts-nocheck
"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "iCkVz",
  "name": "Hero",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 56,
    "alignItems": "center",
    "padding": "80px 56px 72px 56px",
    "width": "100%",
    "background": "linear-gradient(180deg, #111826 0%, #060A14 100%)"
  },
  "children": [
    {
      "type": "frame",
      "id": "9N8Gl",
      "name": "heroCopy",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 28,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "wRbvg",
          "name": "heroKicker",
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
          "textProp": "herokickertext"
        },
        {
          "type": "text",
          "id": "VMN7J",
          "name": "heroTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FAFAF9",
            "fontFamily": "Fraunces",
            "fontSize": 62,
            "fontWeight": "600",
            "letterSpacing": -0.6,
            "lineHeight": 0.98,
            "width": "100%"
          },
          "children": [],
          "textProp": "herotitletext"
        },
        {
          "type": "text",
          "id": "2Ph8n",
          "name": "heroBody",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#AEB7C6",
            "fontFamily": "DM Sans",
            "fontSize": 16,
            "lineHeight": 1.55,
            "width": "100%"
          },
          "children": [],
          "textProp": "herobodytext"
        },
        {
          "type": "frame",
          "id": "DlOMw",
          "name": "heroActions",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 16
          },
          "children": [
            {
              "type": "frame",
              "id": "boLnx",
              "name": "btnPrimary",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 8,
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "0px 24px",
                "height": 48,
                "background": "#1B2742"
              },
              "children": [
                {
                  "type": "text",
                  "id": "hNk3A",
                  "name": "btnPrimaryText",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0A0A0A",
                    "fontFamily": "DM Sans",
                    "fontSize": 12,
                    "fontWeight": "600",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "btnprimarytexttext",
                  "hrefProp": "btnprimarytexthref"
                }
              ],
              "hrefProp": "btnprimaryhref"
            },
            {
              "type": "frame",
              "id": "UGJYL",
              "name": "btnGhost",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 8,
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "0px 24px",
                "height": 48,
                "background": "#080D18",
                "border": "1px solid #FFFFFF"
              },
              "children": [
                {
                  "type": "text",
                  "id": "jb9hS",
                  "name": "btnGhostText",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "DM Sans",
                    "fontSize": 12,
                    "fontWeight": "600",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "btnghosttexttext",
                  "hrefProp": "btnghosttexthref"
                }
              ],
              "hrefProp": "btnghosthref"
            }
          ]
        },
        {
          "type": "text",
          "id": "jxKqT",
          "name": "heroTrust",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#444444",
            "fontFamily": "DM Sans",
            "fontSize": 11,
            "fontWeight": "600",
            "letterSpacing": 1,
            "width": "100%"
          },
          "children": [],
          "textProp": "herotrusttext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "wSiCB",
      "name": "heroVisual",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "width": 560,
        "height": 420,
        "border": "1px solid #1B2538"
      },
      "children": [
        {
          "type": "frame",
          "id": "YpRCX",
          "name": "heroImage",
          "style": {
            "boxSizing": "border-box",
            "width": "100%",
            "height": "100%",
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [],
          "imageProp": "heroimageimagesrc"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "iCkVz",
  "herokickertext": "SMART BINOCULARS / ENVISION",
  "herotitletext": "See the night with observatory intelligence in your hands.",
  "herobodytext": "Find galaxies, nebulae, and hidden sky detail in seconds through adaptive optics and guided live targeting built for serious exploration.",
  "btnprimaryhref": "/reserve-now",
  "btnprimarytexttext": "RESERVE NOW",
  "btnprimarytexthref": "/reserve-now",
  "btnghosthref": "/watch-film",
  "btnghosttexttext": "WATCH FILM",
  "btnghosttexthref": "/watch-film",
  "herotrusttext": "Trusted by 10,000+ observers across 60 countries",
  "heroimageimagesrc": "https://images.unsplash.com/photo-1612153085153-b409481892e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxOTA3MDR8&ixlib=rb-4.1.0&q=80&w=1080"
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

export default function TemplateExclusiveUnistellarHomeSmartBinocularsHeroHeropenAlt1({ id, herokickertext, herotitletext, herobodytext, btnprimaryhref, btnprimarytexttext, btnprimarytexthref, btnghosthref, btnghosttexttext, btnghosttexthref, herotrusttext, heroimageimagesrc, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, herokickertext, herotitletext, herobodytext, btnprimaryhref, btnprimarytexttext, btnprimarytexthref, btnghosthref, btnghosttexttext, btnghosttexthref, herotrusttext, heroimageimagesrc });
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