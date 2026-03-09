"use client";

import React from "react";
import { TextReveal } from "@/components/magic/text-reveal";
import { useMotionMode } from "@/components/theme/motion";
import { useInViewReveal } from "@/lib/motion";
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

const SECTION_KIND = "contact";
const SECTION_TREE = {
  "type": "frame",
  "id": "R0Rft",
  "name": "Contact Body",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 24,
    "padding": "32px 56px 56px 56px",
    "width": "100%",
    "background": "#0B0B0E"
  },
  "children": [
    {
      "type": "frame",
      "id": "Qc7fi",
      "name": "Left Column",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 20,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "zXKqF",
          "name": "Contact Methods",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 16,
            "padding": "22px",
            "width": "100%",
            "borderRadius": 20,
            "background": "#14171D",
            "border": "1px solid #272D38"
          },
          "children": [
            {
              "type": "text",
              "id": "csNAv",
              "name": "methodsTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Space Grotesk",
                "fontSize": 28,
                "fontWeight": "600",
                "letterSpacing": -0.5
              },
              "children": [],
              "textProp": "methodstitletext"
            },
            {
              "type": "text",
              "id": "TSo5U",
              "name": "methodsDesc",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8E8E93",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "methodsdesctext"
            },
            {
              "type": "frame",
              "id": "pGKhk",
              "name": "emailRow",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 4,
                "padding": "14px 16px",
                "width": "100%",
                "borderRadius": 16,
                "background": "#1A1A1E",
                "border": "1px solid #2A2A2E"
              },
              "children": [
                {
                  "type": "text",
                  "id": "cueMi",
                  "name": "emailTitle",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FAFAF9",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "emailtitletext"
                },
                {
                  "type": "text",
                  "id": "C1Hbu",
                  "name": "emailValue",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8E8E93",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "emailvaluetext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "cnCi9",
              "name": "phoneRow",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 4,
                "padding": "14px 16px",
                "width": "100%",
                "borderRadius": 16,
                "background": "#1A1A1E",
                "border": "1px solid #2A2A2E"
              },
              "children": [
                {
                  "type": "text",
                  "id": "XV3rW",
                  "name": "phoneTitle",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FAFAF9",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "phonetitletext"
                },
                {
                  "type": "text",
                  "id": "CYbWz",
                  "name": "phoneValue",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8E8E93",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "phonevaluetext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "2dbhh",
              "name": "pressRow",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 4,
                "padding": "14px 16px",
                "width": "100%",
                "borderRadius": 16,
                "background": "#1A1A1E",
                "border": "1px solid #2A2A2E"
              },
              "children": [
                {
                  "type": "text",
                  "id": "a1892",
                  "name": "pressTitle",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FAFAF9",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "presstitletext"
                },
                {
                  "type": "text",
                  "id": "Y7s69",
                  "name": "pressValue",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#8E8E93",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "pressvaluetext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "220yu",
          "name": "Office Info",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 16,
            "padding": "22px",
            "width": "100%",
            "borderRadius": 20,
            "background": "#14171D",
            "border": "1px solid #272D38"
          },
          "children": [
            {
              "type": "text",
              "id": "aCFHr",
              "name": "officeTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Space Grotesk",
                "fontSize": 28,
                "fontWeight": "600",
                "letterSpacing": -0.5
              },
              "children": [],
              "textProp": "officetitletext"
            },
            {
              "type": "text",
              "id": "O3HtJ",
              "name": "officeDesc",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8E8E93",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "officedesctext"
            },
            {
              "type": "text",
              "id": "JWUcz",
              "name": "addressLabel",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6B6B70",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "600",
                "letterSpacing": 1
              },
              "children": [],
              "textProp": "addresslabeltext"
            },
            {
              "type": "text",
              "id": "QAv0t",
              "name": "addressText",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Manrope",
                "fontSize": 15,
                "fontWeight": "normal",
                "lineHeight": 1.45
              },
              "children": [],
              "textProp": "addresstexttext"
            },
            {
              "type": "text",
              "id": "tH7qB",
              "name": "hoursLabel",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6B6B70",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "600",
                "letterSpacing": 1
              },
              "children": [],
              "textProp": "hourslabeltext"
            },
            {
              "type": "text",
              "id": "dLzoW",
              "name": "hoursText",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.45
              },
              "children": [],
              "textProp": "hourstexttext"
            },
            {
              "type": "frame",
              "id": "1uJbP",
              "name": "visitBtn",
              "style": {
                "boxSizing": "border-box",
                "padding": "10px 16px",
                "borderRadius": 999,
                "background": "#FFFFFF",
                "border": "1px solid #DCE7FF"
              },
              "children": [
                {
                  "type": "text",
                  "id": "5rsYE",
                  "name": "visitBtnText",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0B1020",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "visitbtntexttext"
                }
              ],
              "hrefProp": "visitbtnhref"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "OYSQu",
      "name": "Right Column",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 20,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "dekaT",
          "name": "Form CTA",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 16,
            "padding": "22px",
            "width": "100%",
            "borderRadius": 20,
            "background": "linear-gradient(180deg, #182130 0%, #11151D 100%)",
            "border": "1px solid #313C4E"
          },
          "children": [
            {
              "type": "text",
              "id": "mrgls",
              "name": "formTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Space Grotesk",
                "fontSize": 28,
                "fontWeight": "600",
                "letterSpacing": -0.5
              },
              "children": [],
              "textProp": "formtitletext"
            },
            {
              "type": "text",
              "id": "qZkQj",
              "name": "formDesc",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8E8E93",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": "100%"
              },
              "children": [],
              "textProp": "formdesctext"
            },
            {
              "type": "frame",
              "id": "Rusvl",
              "name": "nameField",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "alignItems": "center",
                "padding": "0px 14px",
                "width": "100%",
                "height": 50,
                "borderRadius": 12,
                "background": "#1A1A1E",
                "border": "1px solid #3A3A40"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Tffvl",
                  "name": "nameText",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#6B6B70",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "nametexttext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "uk4m6",
              "name": "emailField",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "alignItems": "center",
                "padding": "0px 14px",
                "width": "100%",
                "height": 50,
                "borderRadius": 12,
                "background": "#1A1A1E",
                "border": "1px solid #3A3A40"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Fh4GG",
                  "name": "emailText",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#6B6B70",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "emailtexttext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "nBVqc",
              "name": "messageField",
              "style": {
                "boxSizing": "border-box",
                "padding": "14px",
                "width": "100%",
                "height": 120,
                "borderRadius": 12,
                "background": "#1A1A1E",
                "border": "1px solid #3A3A40"
              },
              "children": [
                {
                  "type": "text",
                  "id": "8CyQi",
                  "name": "messageText",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#6B6B70",
                    "fontFamily": "Manrope",
                    "fontSize": 14,
                    "fontWeight": "normal",
                    "lineHeight": 1.4,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "messagetexttext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "lSa7O",
              "name": "submitBtn",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": "100%",
                "height": 52,
                "borderRadius": 12,
                "background": "#2B67F6",
                "border": "1px solid #5D8FFF",
                "boxShadow": "0px 8px 24px -4px #2B67F633"
              },
              "children": [
                {
                  "type": "text",
                  "id": "BL3Kh",
                  "name": "submitText",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "submittexttext"
                }
              ]
            },
            {
              "type": "text",
              "id": "Bctio",
              "name": "formHelp",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6B6B70",
                "fontFamily": "Manrope",
                "fontSize": 12,
                "fontWeight": "normal",
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "formhelptext"
            }
          ],
          "hrefProp": "formCtahref"
        },
        {
          "type": "frame",
          "id": "VNMOw",
          "name": "Regional Support",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "padding": "22px",
            "width": "100%",
            "borderRadius": 20,
            "background": "#14171D",
            "border": "1px solid #272D38"
          },
          "children": [
            {
              "type": "text",
              "id": "Z3YXd",
              "name": "quickTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Space Grotesk",
                "fontSize": 22,
                "fontWeight": "600",
                "letterSpacing": -0.4
              },
              "children": [],
              "textProp": "quicktitletext"
            },
            {
              "type": "text",
              "id": "lvJPj",
              "name": "quickDesc",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8E8E93",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.45,
                "width": "100%"
              },
              "children": [],
              "textProp": "quickdesctext"
            },
            {
              "type": "text",
              "id": "13mtV",
              "name": "region1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "region1text"
            },
            {
              "type": "text",
              "id": "I3ROc",
              "name": "region2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "region2text"
            },
            {
              "type": "text",
              "id": "w8mbw",
              "name": "region3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Manrope",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "region3text"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "R0Rft",
  "methodstitletext": "Choose your fastest route",
  "methodsdesctext": "Start with the channel that matches your goal, and we will route you to the right observer, specialist, or support lead.",
  "emailtitletext": "General Inquiries",
  "emailvaluetext": "contact@unistellar.com  ·  Typical reply under 24h",
  "phonetitletext": "Sales & Product Guidance",
  "phonevaluetext": "+1 (415) 555-0196  ·  Mon–Fri, 9am–6pm PST",
  "presstitletext": "Press & Partnerships",
  "pressvaluetext": "press@unistellar.com  ·  partner@unistellar.com",
  "officetitletext": "Visit or book a specialist",
  "officedesctext": "Use our San Francisco office for guided demos, service drop-off, and deeper one-to-one product conversations.",
  "addresslabeltext": "Headquarters",
  "addresstexttext": "Unistellar North America\n548 Market Street, Suite 41012\nSan Francisco, CA 94104",
  "hourslabeltext": "Hours",
  "hourstexttext": "Mon–Fri: 9:00–18:00 PST\nSat: 10:00–14:00 PST (Demo Appointments)",
  "visitbtnhref": "/book-in-person-demo",
  "visitbtntexttext": "Book In-Person Demo",
  "formCtahref": "/talk-to-a-setup-specialist",
  "formtitletext": "Talk to a setup specialist",
  "formdesctext": "Share your observing goals and current gear. We will prepare a tailored recommendation before the call.",
  "nametexttext": "Full name",
  "emailtexttext": "Work email",
  "messagetexttext": "Tell us what you want to observe, your current setup, and your timeline.",
  "submittexttext": "Schedule My Consultation",
  "formhelptext": "You will receive setup guidance, recommended next steps, and optional product updates. No spam, no generic routing.",
  "quicktitletext": "Regional Support",
  "quickdesctext": "For local events, institutional programs, and observatory collaborations.",
  "region1text": "Americas  ·  americas@unistellar.com",
  "region2text": "Europe  ·  europe@unistellar.com",
  "region3text": "Asia Pacific  ·  apac@unistellar.com"
};
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };
const PEN_RUNTIME_MOTION_STYLE = "@keyframes pen-media-breathe{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-8px,0) scale(1.035)}}@keyframes pen-track-slide-x-subtle{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-32px,0,0)}}@keyframes pen-track-slide-x-showcase{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-52px,0,0)}}@keyframes pen-card-float{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-10px,0)}}";

const assignDefined = (target, patch) => {
  for (const [key, value] of Object.entries(patch || {})) {
    if (typeof value !== "undefined") target[key] = value;
  }
  return target;
};

const resolveMotionMode = (providerMode, overrideMode) => {
  const token = String(overrideMode || providerMode || "subtle").trim().toLowerCase();
  if (token === "off" || token === "subtle" || token === "showcase") return token;
  return "subtle";
};

const resolveSectionMotionProfile = (sectionKindToken = "", motionMode = "subtle") => {
  if (motionMode === "off") {
    return {
      level: "off",
      revealPreset: "fadeIn",
      delayStep: 0,
      textReveal: false,
      mediaBreathe: false,
      contentStagger: false,
    };
  }
  if (sectionKindToken === "hero") {
    return {
      level: "showcase",
      revealPreset: "fadeIn",
      delayStep: motionMode === "showcase" ? 95 : 75,
      textReveal: true,
      mediaBreathe: true,
      contentStagger: true,
    };
  }
  if (sectionKindToken === "navigation" || sectionKindToken === "footer") {
    return {
      level: "subtle",
      revealPreset: "fadeIn",
      delayStep: 20,
      textReveal: false,
      mediaBreathe: false,
      contentStagger: false,
    };
  }
  return {
    level: motionMode === "showcase" ? "showcase" : "stagger",
    revealPreset: "stagger",
    delayStep: motionMode === "showcase" ? 72 : 56,
    textReveal: true,
    mediaBreathe: false,
    contentStagger: true,
  };
};

const resolveDelayMs = (keyPath = "", sectionMotion) => {
  const match = String(keyPath || "").match(/-(\d+)$/);
  const index = Number(match?.[1] || 0);
  const step = Number(sectionMotion?.delayStep || 0);
  if (!(step > 0)) return 0;
  return Math.min(420, index * step);
};

const resolveFontSize = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const resolveNumericDimension = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const isHeadingLikeTextNode = (node) => {
  const lowerName = String(node?.name || "").trim().toLowerCase();
  if (/(title|headline|hero|eyebrow|heading)/.test(lowerName)) return true;
  return resolveFontSize(node?.style?.fontSize) >= 22;
};

const getNodeNameToken = (node) => String(node?.name || "").trim().toLowerCase();

const shouldApplyStoryTrackMotion = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "story") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  const name = getNodeNameToken(node);
  const direction = String(node?.style?.flexDirection || "").trim().toLowerCase();
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  const rowLike = /(?:row|track|carousel|strip|rail)/.test(name);
  return direction === "row" && (rowLike || childCount >= 2);
};

const shouldApplyStoryCardHover = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "story") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  const name = getNodeNameToken(node);
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  return /(?:card|cards|grid|tile)/.test(name) && childCount > 0;
};

const shouldApplyStoryCardFloat = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "story") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  if (!node?.imageProp) return false;
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  if (childCount < 1) return false;
  const width = resolveNumericDimension(node?.style?.width);
  const height = resolveNumericDimension(node?.style?.height);
  const cardLikeWidth = width > 0 ? width <= 460 : true;
  const cardLikeHeight = height > 0 ? height >= 220 : true;
  return cardLikeWidth && cardLikeHeight;
};

const buildNodeClassName = (node, sectionMotion, sectionKindToken) => {
  if (!sectionMotion || sectionMotion.level === "off") return "";
  const classes = [];
  if (node?.hrefProp) classes.push("hover-lift");
  if (node?.type === "frame" && node?.imageProp) classes.push("will-change-transform");
  if (shouldApplyStoryCardHover(node, sectionKindToken)) classes.push("hover-lift");
  if (shouldApplyStoryTrackMotion(node, sectionKindToken)) classes.push("will-change-transform", "pen-track-slide");
  return classes.join(" ");
};

const buildNodeStyle = (node, merged, sectionMotion, sectionKindToken, keyPath) => {
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
  const motionLevel = sectionMotion?.level || "off";
  if (motionLevel !== "off") {
    const delayMs = resolveDelayMs(keyPath, sectionMotion);
    style.transition = style.transition || "opacity 560ms var(--ease-smooth), transform 560ms var(--ease-smooth), box-shadow 300ms var(--ease-smooth)";
    if (delayMs > 0) style.transitionDelay = style.transitionDelay || `${delayMs}ms`;
    if (
      Boolean(sectionMotion?.mediaBreathe) &&
      node?.imageProp &&
      !style.animation &&
      (!style.transform || String(style.transform).trim() === "")
    ) {
      style.animation = "pen-media-breathe 8s var(--ease-smooth, ease) infinite";
      style.transformOrigin = style.transformOrigin || "50% 50%";
    }
    if (shouldApplyStoryTrackMotion(node, sectionKindToken) && !style.animation) {
      const animationName = motionLevel === "showcase" ? "pen-track-slide-x-showcase" : "pen-track-slide-x-subtle";
      const duration = motionLevel === "showcase" ? "10s" : "14s";
      style.animation = `${animationName} ${duration} var(--ease-smooth, ease-in-out) infinite`;
      style.willChange = style.willChange || "transform";
      style.transformOrigin = style.transformOrigin || "center center";
    }
    if (shouldApplyStoryCardFloat(node, sectionKindToken) && !style.animation) {
      const duration = motionLevel === "showcase" ? "4.2s" : "5.6s";
      style.animation = `pen-card-float ${duration} var(--ease-smooth, ease-in-out) infinite`;
      style.willChange = style.willChange || "transform";
      style.transformOrigin = style.transformOrigin || "50% 55%";
    }
    if (Boolean(sectionMotion?.contentStagger)) {
      // Keep static visual fidelity: stagger only via transition delay, not enter keyframes.
      if (delayMs > 0) style.transitionDelay = style.transitionDelay || `${delayMs}ms`;
    }
  }
  return style;
};

const renderTextContent = (node, merged, keyPath, sectionMotion) => {
  const textValue = String(merged?.[node?.textProp] ?? "");
  if (!textValue || !sectionMotion || sectionMotion.level === "off") return textValue;
  if (!sectionMotion.textReveal) return textValue;
  if (!isHeadingLikeTextNode(node)) return textValue;
  return React.createElement(
    TextReveal,
    {
      as: "span",
      className: "inline-block",
      delayMs: resolveDelayMs(keyPath, sectionMotion),
    },
    textValue
  );
};

const renderNode = (node, merged, sectionMotion, sectionKindToken, key = "root", ancestorHasLink = false) => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged, sectionMotion, sectionKindToken, key);
  const className = buildNodeClassName(node, sectionMotion, sectionKindToken) || undefined;
  const href = node?.hrefProp ? String(merged?.[node.hrefProp] || "").trim() : "";
  const shouldRenderLink = Boolean(href) && !ancestorHasLink;
  if (node.type === "icon_font") {
    const Icon = node?.iconName ? ICONS[node.iconName] : null;
    if (Icon) {
      return React.createElement(Icon, {
        key,
        className,
        style,
        "data-pen-node": node.id || undefined,
      });
    }
    return React.createElement(
      "span",
      {
        key,
        className,
        style,
        "data-pen-node": node.id || undefined,
      },
      String(node?.iconGlyph || "")
    );
  }
  if (node.type === "text") {
    const Tag = shouldRenderLink ? "a" : "div";
    return React.createElement(
      Tag,
      {
        key,
        href: shouldRenderLink ? href : undefined,
        className,
        style,
        "data-pen-node": node.id || undefined,
      },
      renderTextContent(node, merged, key, sectionMotion)
    );
  }
  const Tag = shouldRenderLink ? "a" : "div";
  return React.createElement(
    Tag,
    {
      key,
      href: shouldRenderLink ? href : undefined,
      className,
      style,
      "data-pen-node": node.id || undefined,
    },
    ...(Array.isArray(node.children)
      ? node.children.map((child, index) =>
          renderNode(
            child,
            merged,
            sectionMotion,
            sectionKindToken,
            `${key}-${index}`,
            ancestorHasLink || shouldRenderLink
          )
        )
      : [])
  );
};

export default function TemplateExclusiveUnistellarHomeContactContactContactbodypenAlt2({ id, methodstitletext, methodsdesctext, emailtitletext, emailvaluetext, phonetitletext, phonevaluetext, presstitletext, pressvaluetext, officetitletext, officedesctext, addresslabeltext, addresstexttext, hourslabeltext, hourstexttext, visitbtnhref, visitbtntexttext, formCtahref, formtitletext, formdesctext, nametexttext, emailtexttext, messagetexttext, submittexttext, formhelptext, quicktitletext, quickdesctext, region1text, region2text, region3text, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, methodstitletext, methodsdesctext, emailtitletext, emailvaluetext, phonetitletext, phonevaluetext, presstitletext, pressvaluetext, officetitletext, officedesctext, addresslabeltext, addresstexttext, hourslabeltext, hourstexttext, visitbtnhref, visitbtntexttext, formCtahref, formtitletext, formdesctext, nametexttext, emailtexttext, messagetexttext, submittexttext, formhelptext, quicktitletext, quickdesctext, region1text, region2text, region3text });
  assignDefined(merged, rest);
  const effectiveMotionMode = resolveMotionMode(providerMotionMode, merged?.motionMode);
  const sectionKindToken = String(SECTION_KIND || "").trim().toLowerCase();
  const sectionMotion = resolveSectionMotionProfile(sectionKindToken, effectiveMotionMode);
  const reveal = useInViewReveal({
    preset: sectionMotion?.revealPreset === "fadeIn" ? "fadeIn" : "stagger",
    once: true,
    enabled: sectionMotion?.level !== "off",
  });
  const sectionClassName = sectionMotion?.level === "off"
    ? "w-full"
    : ["w-full", reveal.className].filter(Boolean).join(" ");
  const sectionStyle = sectionMotion?.level === "off" ? undefined : reveal.style;
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": SECTION_KIND,
      className: sectionClassName,
      style: sectionStyle,
    },
    ...(sectionMotion?.level !== "off"
      ? [React.createElement("style", { key: "pen-motion-style" }, PEN_RUNTIME_MOTION_STYLE)]
      : []),
    renderNode(SECTION_TREE, merged, sectionMotion, sectionKindToken, "root", false)
  );
}