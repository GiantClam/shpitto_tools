"use client";

import React from "react";

const SECTION_TREE = {
  "type": "frame",
  "id": "cw5PN",
  "name": "Mission Band",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 40,
    "padding": "32px 56px",
    "width": "100%",
    "background": "#0A0F18"
  },
  "children": [
    {
      "type": "frame",
      "id": "CHWK4",
      "name": "missionMeta",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 10,
        "width": 260
      },
      "children": [
        {
          "type": "text",
          "id": "HXndV",
          "name": "missionEyebrow",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#9DB0D4",
            "fontFamily": "Manrope",
            "fontSize": 12,
            "fontWeight": "500",
            "letterSpacing": 1.6,
            "width": "100%"
          },
          "children": [],
          "textProp": "missioneyebrowtext"
        },
        {
          "type": "text",
          "id": "xcYcz",
          "name": "missionTag",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#8DA0C2",
            "fontFamily": "Manrope",
            "fontSize": 12,
            "fontWeight": "600",
            "letterSpacing": 0.8,
            "width": "100%"
          },
          "children": [],
          "textProp": "missiontagtext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "g094x",
      "name": "missionContent",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 14,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "3fx4q",
          "name": "missionHeadline",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Space Grotesk",
            "fontSize": 40,
            "fontWeight": "600",
            "letterSpacing": -1,
            "lineHeight": 1.04,
            "width": "100%"
          },
          "children": [],
          "textProp": "missionheadlinetext"
        },
        {
          "type": "text",
          "id": "VfUb7",
          "name": "missionSupport",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#AEB8CE",
            "fontFamily": "Manrope",
            "fontSize": 15,
            "fontWeight": "normal",
            "lineHeight": 1.5,
            "width": 760
          },
          "children": [],
          "textProp": "missionsupporttext"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "cw5PN",
  "missioneyebrowtext": "MISSION / 01",
  "missiontagtext": "OBSERVE MORE. UNDERSTAND MORE. SHARE MORE.",
  "missionheadlinetext": "Reveal the hidden sky for everyone, then turn each observation into shared scientific progress.",
  "missionsupporttext": "We are building a more human relationship with astronomy: autonomous hardware that removes friction, software that guides discovery, and a network where backyard observers can participate in real research."
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

export default function TemplateExclusiveUnistellarHomeAboutStoryMissionbandpenAlt2({ id, missioneyebrowtext, missiontagtext, missionheadlinetext, missionsupporttext, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, missioneyebrowtext, missiontagtext, missionheadlinetext, missionsupporttext });
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