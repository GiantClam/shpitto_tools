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
  "id": "EEe3G",
  "name": "Hero",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 48,
    "alignItems": "center",
    "padding": "64px 56px",
    "width": "100%"
  },
  "children": [
    {
      "type": "frame",
      "id": "znrx9",
      "name": "left",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 24,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "BNgTk",
          "name": "eye",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#97A0AE",
            "fontFamily": "DM Sans",
            "fontSize": 12,
            "fontWeight": "600",
            "letterSpacing": 1.6,
            "width": "100%"
          },
          "children": [],
          "textProp": "eyetext"
        },
        {
          "type": "text",
          "id": "4Ce9i",
          "name": "hed",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FAFAF9",
            "fontFamily": "Fraunces",
            "fontSize": 64,
            "fontWeight": "600",
            "lineHeight": 0.98,
            "width": "100%"
          },
          "children": [],
          "textProp": "hedtext"
        },
        {
          "type": "text",
          "id": "8T35i",
          "name": "sub",
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
          "textProp": "subtext"
        },
        {
          "type": "frame",
          "id": "xOY17",
          "name": "actions",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 14,
            "alignItems": "center"
          },
          "children": [
            {
              "type": "frame",
              "id": "o97QZ",
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
                  "id": "XD2Lj",
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
              "id": "uzAKP",
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
                  "id": "gwrZl",
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
        },
        {
          "type": "text",
          "id": "LR55V",
          "name": "cred",
          "style": {
            "boxSizing": "border-box",
            "opacity": 0.8,
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "DM Sans",
            "fontSize": 12,
            "fontWeight": "600",
            "letterSpacing": 1,
            "width": "100%"
          },
          "children": [],
          "textProp": "credtext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "fyFhx",
      "name": "visual",
      "style": {
        "boxSizing": "border-box",
        "width": 584,
        "height": 438,
        "borderRadius": 24,
        "border": "1px solid #23324F",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover"
      },
      "children": [],
      "imageProp": "visualimagesrc"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "EEe3G",
  "eyetext": "SMART TELESCOPES / AUTONOMOUS STARGAZING",
  "hedtext": "See galaxies and nebulae from your backyard.",
  "subtext": "Unistellar smart telescopes align themselves, suppress light pollution, and reveal deep-sky detail live in minutes, even under city skies.",
  "cta1href": "/view-all-smart-telescopes",
  "cta1ttext": "View All Smart Telescopes",
  "cta2href": "/compare-models",
  "cta2ttext": "Compare Models",
  "credtext": "4.7★ average rating • App-guided setup • Planetarium-grade optics",
  "visualimagesrc": "https://images.unsplash.com/photo-1554212114-d6dad12fbc02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
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

export default function TemplateExclusiveUnistellarHomeSmartTelescopesHeroHeropenAlt1({ id, eyetext, hedtext, subtext, cta1href, cta1ttext, cta2href, cta2ttext, credtext, visualimagesrc, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, eyetext, hedtext, subtext, cta1href, cta1ttext, cta2href, cta2ttext, credtext, visualimagesrc });
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