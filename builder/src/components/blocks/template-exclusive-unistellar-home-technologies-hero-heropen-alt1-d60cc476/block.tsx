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
  "id": "mV6rq",
  "name": "hero",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 44,
    "alignItems": "center",
    "padding": "56px 80px 72px 80px",
    "width": "100%"
  },
  "children": [
    {
      "type": "frame",
      "id": "zHBtO",
      "name": "left",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 20,
        "padding": "20px 8px 20px 0px",
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "GAQLu",
          "name": "badge",
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
          "textProp": "badgetext"
        },
        {
          "type": "text",
          "id": "3mjfj",
          "name": "ht",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FAFAF9",
            "fontFamily": "Fraunces",
            "fontSize": 68,
            "fontWeight": "600",
            "lineHeight": 0.96,
            "width": "100%"
          },
          "children": [],
          "textProp": "httext"
        },
        {
          "type": "text",
          "id": "fMZwT",
          "name": "hs",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#AEB7C6",
            "fontFamily": "DM Sans",
            "fontSize": 16,
            "fontWeight": "normal",
            "lineHeight": 1.55,
            "width": "100%"
          },
          "children": [],
          "textProp": "hstext"
        },
        {
          "type": "frame",
          "id": "xeBJo",
          "name": "actions",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 14
          },
          "children": [
            {
              "type": "frame",
              "id": "6GVnP",
              "name": "cta1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "0px 28px",
                "height": 54,
                "borderRadius": 999,
                "background": "#2B67F6",
                "border": "1px solid #4F84FF"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Ehxel",
                  "name": "cta1t",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "DM Sans",
                    "fontSize": 14,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "cta1ttext"
                }
              ],
              "hrefProp": "cta1href"
            },
            {
              "type": "frame",
              "id": "knBm7",
              "name": "cta2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "0px 28px",
                "height": 54,
                "borderRadius": 999,
                "background": "#121722",
                "border": "1px solid #303849"
              },
              "children": [
                {
                  "type": "text",
                  "id": "2UpI4",
                  "name": "cta2t",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D6DEEA",
                    "fontFamily": "DM Sans",
                    "fontSize": 14,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "cta2ttext"
                }
              ],
              "hrefProp": "cta2href"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "DpKtf",
      "name": "visual",
      "style": {
        "boxSizing": "border-box",
        "width": 560,
        "height": 580,
        "borderRadius": 28,
        "border": "1px solid #3A3A3C",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover",
        "overflow": "hidden"
      },
      "children": [],
      "imageProp": "visualimagesrc"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "mV6rq",
  "badgetext": "TECHNOLOGY / REAL-TIME IMAGE SCIENCE",
  "httext": "Technology that reveals the universe in real time.",
  "hstext": "Unistellar combines autonomous optics, intelligent signal processing, and collaborative sky data to make deep-sky exploration immediate and breathtaking.",
  "cta1href": "/explore-the-stack",
  "cta1ttext": "Explore the stack",
  "cta2href": "/compare-outcomes",
  "cta2ttext": "Compare outcomes",
  "visualimagesrc": "/generated-pen-assets/unistellar-home/images/generated-1772189083782.png"
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

export default function TemplateExclusiveUnistellarHomeTechnologiesHeroHeropenAlt1({ id, badgetext, httext, hstext, cta1href, cta1ttext, cta2href, cta2ttext, visualimagesrc, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, badgetext, httext, hstext, cta1href, cta1ttext, cta2href, cta2ttext, visualimagesrc });
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