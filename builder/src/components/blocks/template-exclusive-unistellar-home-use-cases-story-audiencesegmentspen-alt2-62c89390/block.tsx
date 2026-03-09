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
  "id": "3utqR",
  "name": "Audience Segments",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 22,
    "padding": "56px",
    "width": "100%",
    "background": "#08111F"
  },
  "children": [
    {
      "type": "frame",
      "id": "eE4LD",
      "name": "audHead",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 12,
        "alignItems": "center"
      },
      "children": [
        {
          "type": "rectangle",
          "id": "UXGQU",
          "name": "audBar",
          "style": {
            "boxSizing": "border-box"
          },
          "children": []
        },
        {
          "type": "text",
          "id": "hDqfm",
          "name": "audLabel",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#9db0d4",
            "fontFamily": "Manrope",
            "fontSize": 12,
            "fontWeight": "600",
            "letterSpacing": 1.4
          },
          "children": [],
          "textProp": "audlabeltext"
        }
      ]
    },
    {
      "type": "text",
      "id": "PitSi",
      "name": "audTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#FFFFFF",
        "fontFamily": "Space Grotesk",
        "fontSize": 32,
        "fontWeight": "700",
        "letterSpacing": -0.8,
        "lineHeight": 1,
        "width": "100%"
      },
      "children": [],
      "textProp": "audtitletext"
    },
    {
      "type": "frame",
      "id": "Zhczc",
      "name": "audGrid",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 14,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "mA8QI",
          "name": "audCard1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "padding": "22px 18px",
            "width": "100%",
            "borderRadius": 22,
            "background": "#101725",
            "border": "1px solid #243754"
          },
          "children": [
            {
              "type": "text",
              "id": "0FlR7",
              "name": "audCard1Tag",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9db0d4",
                "fontFamily": "Space Grotesk",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1.2
              },
              "children": [],
              "textProp": "audcard1tagtext"
            },
            {
              "type": "text",
              "id": "n75az",
              "name": "audCard1Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 18,
                "fontWeight": "700",
                "lineHeight": 1.1,
                "width": "100%"
              },
              "children": [],
              "textProp": "audcard1titletext"
            },
            {
              "type": "text",
              "id": "VOnQs",
              "name": "audCard1Body",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#B2BED3",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "audcard1bodytext"
            },
            {
              "type": "text",
              "id": "SDcyg",
              "name": "audCard1Meta",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C9D2E7",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "600",
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "audcard1metatext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "0aC9r",
          "name": "audCard2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "padding": "22px 18px",
            "width": "100%",
            "borderRadius": 22,
            "background": "#101725",
            "border": "1px solid #243754"
          },
          "children": [
            {
              "type": "text",
              "id": "V9aYR",
              "name": "audCard2Tag",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9db0d4",
                "fontFamily": "Space Grotesk",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1.2
              },
              "children": [],
              "textProp": "audcard2tagtext"
            },
            {
              "type": "text",
              "id": "v2BKA",
              "name": "audCard2Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 18,
                "fontWeight": "700",
                "lineHeight": 1.1,
                "width": "100%"
              },
              "children": [],
              "textProp": "audcard2titletext"
            },
            {
              "type": "text",
              "id": "iGgSF",
              "name": "audCard2Body",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#B2BED3",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "audcard2bodytext"
            },
            {
              "type": "text",
              "id": "OcKRp",
              "name": "audCard2Meta",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C9D2E7",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "600",
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "audcard2metatext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "JGyOy",
          "name": "audCard3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "padding": "22px 18px",
            "width": "100%",
            "borderRadius": 22,
            "background": "#101725",
            "border": "1px solid #243754"
          },
          "children": [
            {
              "type": "text",
              "id": "0ncLS",
              "name": "audCard3Tag",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9db0d4",
                "fontFamily": "Space Grotesk",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1.2
              },
              "children": [],
              "textProp": "audcard3tagtext"
            },
            {
              "type": "text",
              "id": "5gM3A",
              "name": "audCard3Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Space Grotesk",
                "fontSize": 18,
                "fontWeight": "700",
                "lineHeight": 1.1,
                "width": "100%"
              },
              "children": [],
              "textProp": "audcard3titletext"
            },
            {
              "type": "text",
              "id": "s13KH",
              "name": "audCard3Body",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#B2BED3",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "audcard3bodytext"
            },
            {
              "type": "text",
              "id": "N68lk",
              "name": "audCard3Meta",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C9D2E7",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "600",
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "audcard3metatext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "3utqR",
  "audlabeltext": "AUDIENCE SEGMENTS",
  "audtitletext": "START WITH THE EXPERIENCE THAT MATCHES YOUR AMBITION",
  "audcard1tagtext": "BEGINNERS",
  "audcard1titletext": "START YOUR FIRST DEEP-SKY SESSION WITH CONFIDENCE",
  "audcard1bodytext": "Guided setup, object suggestions, and instant enhancement make your first nights productive and exciting.",
  "audcard1metatext": "Best for: solo buyers, first setup nights, quick confidence.",
  "audcard2tagtext": "COMMUNITIES",
  "audcard2titletext": "LEAD CLUB NIGHTS WITH SHAREABLE MOMENTS",
  "audcard2bodytext": "Coordinate sessions, showcase real-time views, and keep everyone engaged even under imperfect skies.",
  "audcard2metatext": "Best for: public demos, astronomy clubs, family observing sessions.",
  "audcard3tagtext": "EXPERTS",
  "audcard3titletext": "GO DEEPER ON FAINT TARGETS WITH CONSISTENT QUALITY",
  "audcard3bodytext": "Fine-grained control and smart amplification let you capture elusive structures night after night.",
  "audcard3metatext": "Best for: repeat capture nights, portable rigs, dark-sky trips."
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

export default function TemplateExclusiveUnistellarHomeUseCasesStoryAudiencesegmentspenAlt2({ id, audlabeltext, audtitletext, audcard1tagtext, audcard1titletext, audcard1bodytext, audcard1metatext, audcard2tagtext, audcard2titletext, audcard2bodytext, audcard2metatext, audcard3tagtext, audcard3titletext, audcard3bodytext, audcard3metatext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, audlabeltext, audtitletext, audcard1tagtext, audcard1titletext, audcard1bodytext, audcard1metatext, audcard2tagtext, audcard2titletext, audcard2bodytext, audcard2metatext, audcard3tagtext, audcard3titletext, audcard3bodytext, audcard3metatext });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "story",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}