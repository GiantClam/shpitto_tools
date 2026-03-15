// @ts-nocheck
"use client";

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  Minus,
  Play,
  Plus,
  Search,
  Sparkles,
  Wifi,
  X,
} from "lucide-react";

const SECTION_TREE = {
  "type": "frame",
  "id": "Sbphd",
  "name": "Contact CTA",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "justifyContent": "center",
    "padding": "28px 72px 60px 72px",
    "width": "100%",
    "background": "#060A14"
  },
  "children": [
    {
      "type": "frame",
      "id": "NZuMy",
      "name": "ctaCard",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "alignItems": "center",
        "padding": "24px 28px",
        "width": "100%",
        "borderRadius": 16,
        "background": "linear-gradient(180deg, #13203A 0%, #0A1224 100%)",
        "border": "1px solid #2A3C61"
      },
      "children": [
        {
          "type": "frame",
          "id": "FixAZ",
          "name": "ctaLeft",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": 760
          },
          "children": [
            {
              "type": "frame",
              "id": "OF0MS",
              "name": "ctaLabelRow",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 12,
                "alignItems": "center",
                "width": 250,
                "height": 16
              },
              "children": [
                {
                  "type": "frame",
                  "id": "97fog",
                  "name": "ctaLine",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 32,
                    "height": 2,
                    "background": "#2B67F6"
                  },
                  "children": []
                },
                {
                  "type": "text",
                  "id": "v2M8m",
                  "name": "ctaLabel",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8DA0C2",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "700",
                    "letterSpacing": 1.8
                  },
                  "children": [],
                  "textProp": "ctalabeltext"
                }
              ]
            },
            {
              "type": "text",
              "id": "HUUSK",
              "name": "ctaTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 32,
                "fontWeight": "700",
                "letterSpacing": -1.1,
                "lineHeight": 1.05,
                "width": 760
              },
              "children": [],
              "textProp": "ctatitletext"
            },
            {
              "type": "text",
              "id": "doIjr",
              "name": "ctaSub",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#A7B3CC",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "lineHeight": 1.4,
                "width": 720
              },
              "children": [],
              "textProp": "ctasubtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "2M3MM",
          "name": "ctaRight",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "alignItems": "flex-end",
            "width": 260
          },
          "children": [
            {
              "type": "frame",
              "id": "Q92H1",
              "name": "ctaBtn",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 200,
                "height": 46,
                "borderRadius": 999,
                "background": "#2B67F6",
                "border": "1px solid #5D8FFF"
              },
              "children": [
                {
                  "type": "text",
                  "id": "1Vs9m",
                  "name": "ctaBtnText",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "ctabtntexttext"
                }
              ],
              "hrefProp": "ctabtnhref"
            },
            {
              "type": "text",
              "id": "SM7ga",
              "name": "ctaMeta",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8DA0C2",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "500",
                "lineHeight": 1.35,
                "textAlign": "right",
                "width": 260
              },
              "children": [],
              "textProp": "ctametatext"
            }
          ]
        }
      ]
    }
  ],
  "hrefProp": "contactCtahref"
};
const DEFAULT_PROPS = {
  "id": "Sbphd",
  "contactCtahref": "/contact-support",
  "ctalabeltext": "CONTACT SUPPORT",
  "ctatitletext": "Bring a human into the loop when the night cannot wait.",
  "ctasubtext": "Share your telescope model, app version, session conditions, and symptoms so our specialists can route you faster.",
  "ctabtnhref": "/contact-support",
  "ctabtntexttext": "Contact support",
  "ctametatext": "Best results come with logs, screenshots, and the last successful session time."
};
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };

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
  if (node.type === "icon_font") {
    const Icon = node?.iconName ? ICONS[node.iconName] : null;
    if (Icon) {
      return React.createElement(Icon, {
        key,
        style,
        "data-pen-node": node.id || undefined,
      });
    }
    return React.createElement(
      "span",
      {
        key,
        style,
        "data-pen-node": node.id || undefined,
      },
      String(node?.iconGlyph || "")
    );
  }
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

export default function TemplateExclusiveUnistellarHomeSupportCtaContactctapenAlt4({ id, contactCtahref, ctalabeltext, ctatitletext, ctasubtext, ctabtnhref, ctabtntexttext, ctametatext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, contactCtahref, ctalabeltext, ctatitletext, ctasubtext, ctabtnhref, ctabtntexttext, ctametatext });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "cta",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}