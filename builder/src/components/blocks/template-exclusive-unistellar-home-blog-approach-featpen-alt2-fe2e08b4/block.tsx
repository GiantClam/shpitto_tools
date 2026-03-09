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
  "id": "nWr7r",
  "name": "feat",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 22,
    "padding": "48px 56px",
    "width": "100%",
    "height": 440,
    "background": "#060A14"
  },
  "children": [
    {
      "type": "frame",
      "id": "C6LNF",
      "name": "featImg",
      "style": {
        "boxSizing": "border-box",
        "width": 620,
        "height": "100%",
        "borderRadius": 18,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover"
      },
      "children": [],
      "imageProp": "featimgimagesrc"
    },
    {
      "type": "frame",
      "id": "9zIi5",
      "name": "featCopy",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 14,
        "justifyContent": "center",
        "width": "100%",
        "height": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "ek1FP",
          "name": "featK",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#9DB0D4",
            "fontFamily": "Manrope",
            "fontSize": 13,
            "fontWeight": "normal"
          },
          "children": [],
          "textProp": "featktext"
        },
        {
          "type": "text",
          "id": "zbhuN",
          "name": "featT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Space Grotesk",
            "fontSize": 40,
            "fontWeight": "700",
            "lineHeight": 1.08,
            "width": "100%"
          },
          "children": [],
          "textProp": "featttext"
        },
        {
          "type": "text",
          "id": "h7rOD",
          "name": "featD",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C5CEE2",
            "fontFamily": "Manrope",
            "fontSize": 16,
            "fontWeight": "normal",
            "lineHeight": 1.45,
            "width": "100%"
          },
          "children": [],
          "textProp": "featdtext"
        },
        {
          "type": "frame",
          "id": "P1PbS",
          "name": "featBtn",
          "style": {
            "boxSizing": "border-box",
            "padding": "12px 18px",
            "borderRadius": 999,
            "background": "#FFFFFF"
          },
          "children": [
            {
              "type": "text",
              "id": "2zkHL",
              "name": "featBtnT",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#0B1020",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "featbtnttext"
            }
          ],
          "hrefProp": "featbtnhref"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "nWr7r",
  "featimgimagesrc": "https://images.unsplash.com/photo-1598630342142-09dd46a89395?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxOTA5MzB8&ixlib=rb-4.1.0&q=80&w=1080",
  "featktext": "Featured",
  "featttext": "How Smart Binoculars Are Changing Night Exploration",
  "featdtext": "A closer look at AR overlays, intuitive guidance, and what they unlock for first-time skywatchers.",
  "featbtnhref": "/read-featured-story",
  "featbtnttext": "Read Featured Story"
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

export default function TemplateExclusiveUnistellarHomeBlogApproachFeatpenAlt2({ id, featimgimagesrc, featktext, featttext, featdtext, featbtnhref, featbtnttext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, featimgimagesrc, featktext, featttext, featdtext, featbtnhref, featbtnttext });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "approach",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}