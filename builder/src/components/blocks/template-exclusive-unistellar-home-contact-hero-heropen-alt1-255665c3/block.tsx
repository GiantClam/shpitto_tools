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
  "id": "Hq4qb",
  "name": "Hero",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 18,
    "justifyContent": "center",
    "padding": "56px",
    "width": "100%",
    "height": 396,
    "background": "linear-gradient(180deg, #111826 0%, #060A14 100%)"
  },
  "children": [
    {
      "type": "text",
      "id": "uqOoT",
      "name": "heroTag",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#97A0AE",
        "fontFamily": "Manrope",
        "fontSize": 12,
        "fontWeight": "600",
        "letterSpacing": 1.4
      },
      "children": [],
      "textProp": "herotagtext"
    },
    {
      "type": "text",
      "id": "Nl2xa",
      "name": "heroTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FAFAF9",
        "fontFamily": "Space Grotesk",
        "fontSize": 54,
        "fontWeight": "600",
        "letterSpacing": -0.5,
        "lineHeight": 1.05,
        "width": 900
      },
      "children": [],
      "textProp": "herotitletext"
    },
    {
      "type": "text",
      "id": "Bi0Dt",
      "name": "heroSub",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#A9B2C3",
        "fontFamily": "Manrope",
        "fontSize": 16,
        "fontWeight": "normal",
        "lineHeight": 1.5,
        "width": 700
      },
      "children": [],
      "textProp": "herosubtext"
    },
    {
      "type": "frame",
      "id": "ga6Uo",
      "name": "Hero Actions",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 12
      },
      "children": [
        {
          "type": "frame",
          "id": "Durwt",
          "name": "Primary CTA",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "padding": "14px 20px",
            "height": 48,
            "borderRadius": 999,
            "background": "#2B67F6",
            "border": "1px solid #5D8FFF"
          },
          "children": [
            {
              "type": "text",
              "id": "eDthA",
              "name": "Primary CTA Text",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "primaryCtaTexttext"
            }
          ],
          "hrefProp": "primaryCtahref"
        },
        {
          "type": "frame",
          "id": "olH6R",
          "name": "Secondary CTA",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "padding": "14px 20px",
            "height": 48,
            "borderRadius": 999,
            "background": "#FFFFFF",
            "border": "1px solid #DCE7FF"
          },
          "children": [
            {
              "type": "text",
              "id": "LadSB",
              "name": "Secondary CTA Text",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#0B1020",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "secondaryCtaTexttext"
            }
          ],
          "hrefProp": "secondaryCtahref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "jhTvR",
      "name": "Hero Trust Row",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 12
      },
      "children": [
        {
          "type": "frame",
          "id": "OFKrx",
          "name": "Promise Pill",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 8,
            "alignItems": "center",
            "padding": "10px 14px",
            "height": 40,
            "borderRadius": 999,
            "background": "#101722",
            "border": "1px solid #253248"
          },
          "children": [
            {
              "type": "text",
              "id": "B4hNb",
              "name": "Promise Text",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D3DBE8",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "promiseTexttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "oDwTQ",
          "name": "Coverage Pill",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 8,
            "alignItems": "center",
            "padding": "10px 14px",
            "height": 40,
            "borderRadius": 999,
            "background": "#101722",
            "border": "1px solid #253248"
          },
          "children": [
            {
              "type": "text",
              "id": "GZyEj",
              "name": "Coverage Text",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8E8E93",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "coverageTexttext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "Hq4qb",
  "herotagtext": "CONTACT UNISTELLAR",
  "herotitletext": "Reach the right Unistellar team before your next night under the stars.",
  "herosubtext": "Get product guidance, plan a concierge onboarding call, or coordinate demos and institutional support without bouncing between inboxes.",
  "primaryCtahref": "/book-a-concierge-call",
  "primaryCtaTexttext": "Book a Concierge Call",
  "secondaryCtahref": "/find-regional-support",
  "secondaryCtaTexttext": "Find Regional Support",
  "promiseTexttext": "Replies within one business day",
  "coverageTexttext": "Sales, setup, institutions, and press"
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

export default function TemplateExclusiveUnistellarHomeContactHeroHeropenAlt1({ id, herotagtext, herotitletext, herosubtext, primaryCtahref, primaryCtaTexttext, secondaryCtahref, secondaryCtaTexttext, promiseTexttext, coverageTexttext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, herotagtext, herotitletext, herosubtext, primaryCtahref, primaryCtaTexttext, secondaryCtahref, secondaryCtaTexttext, promiseTexttext, coverageTexttext });
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