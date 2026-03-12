"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TextReveal } from "@/components/magic/text-reveal";
import { useMotionMode } from "@/components/theme/motion";
import { applyPenThemeToStyleObject, buildPenThemeCssVars } from "@/components/blocks/_shared/pen-theme";
import { useInViewReveal } from "@/lib/motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  HeartHandshake,
  Menu,
  MessageSquare,
  Minus,
  Newspaper,
  Play,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Wifi,
  X,
} from "lucide-react";

const SECTION_KIND = "contact";
const SECTION_TREE = {
  "type": "frame",
  "id": "qJSlC",
  "name": "ContactMain",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 58,
    "padding": "12px 92px 54px 92px",
    "width": "100%"
  },
  "children": [
    {
      "type": "frame",
      "id": "7PBfS",
      "name": "ContactMethods",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 18,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "BbV2b",
          "name": "MethodRow",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 22,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "XIO5u",
              "name": "c1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "width": "100%"
              },
              "children": [
                {
                  "type": "icon_font",
                  "id": "uwbgv",
                  "name": "i1",
                  "style": {
                    "boxSizing": "border-box",
                    "color": "#2F3338",
                    "width": 58,
                    "height": 58,
                    "display": "inline-flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "flexShrink": 0,
                    "fontSize": 58
                  },
                  "children": [],
                  "iconGlyph": "message-square"
                },
                {
                  "type": "text",
                  "id": "hRMUF",
                  "name": "t1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2A2F34",
                    "fontFamily": "Inter",
                    "fontSize": 14,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "t1text"
                },
                {
                  "type": "text",
                  "id": "nTlx0",
                  "name": "l1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4A4F55",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "l1text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "oawY3",
              "name": "c2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "width": "100%"
              },
              "children": [
                {
                  "type": "icon_font",
                  "id": "J7eXs",
                  "name": "i2",
                  "style": {
                    "boxSizing": "border-box",
                    "color": "#2F3338",
                    "width": 58,
                    "height": 58,
                    "display": "inline-flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "flexShrink": 0,
                    "fontSize": 58
                  },
                  "children": [],
                  "iconGlyph": "shopping-bag"
                },
                {
                  "type": "text",
                  "id": "HxIZ0",
                  "name": "t2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2A2F34",
                    "fontFamily": "Inter",
                    "fontSize": 14,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "t2text"
                },
                {
                  "type": "text",
                  "id": "TNEy4",
                  "name": "l2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4A4F55",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "l2text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "5gL2T",
              "name": "c3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "width": "100%"
              },
              "children": [
                {
                  "type": "icon_font",
                  "id": "8z5Ei",
                  "name": "i3",
                  "style": {
                    "boxSizing": "border-box",
                    "color": "#2F3338",
                    "width": 58,
                    "height": 58,
                    "display": "inline-flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "flexShrink": 0,
                    "fontSize": 58
                  },
                  "children": [],
                  "iconGlyph": "newspaper"
                },
                {
                  "type": "text",
                  "id": "PwSBP",
                  "name": "t3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2A2F34",
                    "fontFamily": "Inter",
                    "fontSize": 14,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "t3text"
                },
                {
                  "type": "text",
                  "id": "wCKNH",
                  "name": "l3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4A4F55",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "l3text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "HRUoL",
              "name": "c4",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "width": "100%"
              },
              "children": [
                {
                  "type": "icon_font",
                  "id": "NIF3J",
                  "name": "i4",
                  "style": {
                    "boxSizing": "border-box",
                    "color": "#2F3338",
                    "width": 58,
                    "height": 58,
                    "display": "inline-flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "flexShrink": 0,
                    "fontSize": 58
                  },
                  "children": [],
                  "iconGlyph": "globe"
                },
                {
                  "type": "text",
                  "id": "2441C",
                  "name": "t4",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2A2F34",
                    "fontFamily": "Inter",
                    "fontSize": 14,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "t4text"
                },
                {
                  "type": "text",
                  "id": "o6hGO",
                  "name": "l4",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4A4F55",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "l4text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "30TQN",
              "name": "c5",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "width": "100%"
              },
              "children": [
                {
                  "type": "icon_font",
                  "id": "motAz",
                  "name": "i5",
                  "style": {
                    "boxSizing": "border-box",
                    "color": "#2F3338",
                    "width": 58,
                    "height": 58,
                    "display": "inline-flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "flexShrink": 0,
                    "fontSize": 58
                  },
                  "children": [],
                  "iconGlyph": "heart-handshake"
                },
                {
                  "type": "text",
                  "id": "wuyqO",
                  "name": "t5",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2A2F34",
                    "fontFamily": "Inter",
                    "fontSize": 14,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "t5text"
                },
                {
                  "type": "text",
                  "id": "4UpJV",
                  "name": "l5",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4A4F55",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "l5text"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "UcPOk",
      "name": "Impressum",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 16,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "Sm7WO",
          "name": "impTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2737",
            "fontFamily": "Inter",
            "fontSize": 48,
            "fontWeight": "700"
          },
          "children": [],
          "textProp": "imptitletext"
        },
        {
          "type": "frame",
          "id": "yPXco",
          "name": "impLine",
          "style": {
            "boxSizing": "border-box",
            "width": "100%",
            "height": 1,
            "background": "#D8DCE0"
          },
          "children": []
        },
        {
          "type": "frame",
          "id": "Xjff9",
          "name": "impRow1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 36,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "f4hlX",
              "name": "impC1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "EIyhk",
                  "name": "i11",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2F353B",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "i11text"
                },
                {
                  "type": "text",
                  "id": "lrT2z",
                  "name": "i12",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5A6067",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "i12text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "3Ld7O",
              "name": "impC2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "4Yil1",
                  "name": "i21",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2F353B",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "i21text"
                },
                {
                  "type": "text",
                  "id": "zoSja",
                  "name": "i22",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5A6067",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "i22text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "JLBYC",
              "name": "impC3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "e3gSn",
                  "name": "i31",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2F353B",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "i31text"
                },
                {
                  "type": "text",
                  "id": "UqySO",
                  "name": "i32",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5A6067",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "i32text"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "RQSvZ",
          "name": "impRow2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 36,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "iqpMK",
              "name": "impC4",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Gs34p",
                  "name": "i41",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2F353B",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "i41text"
                },
                {
                  "type": "text",
                  "id": "rjBqW",
                  "name": "i42",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5A6067",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "i42text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "4SnGb",
              "name": "impC5",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "PBXEe",
                  "name": "i51",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2F353B",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "i51text"
                },
                {
                  "type": "text",
                  "id": "mPGF8",
                  "name": "i52",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5A6067",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "i52text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "RsOzl",
              "name": "impC6",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "U6cMf",
                  "name": "i61",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2F353B",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "i61text"
                },
                {
                  "type": "text",
                  "id": "rbZuw",
                  "name": "i62",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5A6067",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "i62text"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "A9sPR",
      "name": "WorkWithUs",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 8,
        "alignItems": "center",
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "koYJ0",
          "name": "workTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2737",
            "fontFamily": "Inter",
            "fontSize": 46,
            "fontWeight": "700"
          },
          "children": [],
          "textProp": "worktitletext"
        },
        {
          "type": "text",
          "id": "aIUeG",
          "name": "workSub",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5A6168",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "normal"
          },
          "children": [],
          "textProp": "worksubtext"
        },
        {
          "type": "text",
          "id": "jgfZB",
          "name": "workLink",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2E3339",
            "fontFamily": "Inter",
            "fontSize": 13,
            "fontWeight": "600"
          },
          "children": [],
          "textProp": "worklinktext"
        },
        {
          "type": "frame",
          "id": "6opog",
          "name": "WorkIllustration",
          "style": {
            "boxSizing": "border-box",
            "width": 640,
            "height": 190,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [],
          "imageProp": "workillustrationimagesrc"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "qJSlC",
  "t1text": "Contact Support",
  "l1text": "Submit a support request",
  "t2text": "Business Ordering",
  "l2text": "framework.for.business",
  "t3text": "Press Inquiries",
  "l3text": "media@frame.work",
  "t4text": "Ask the Community",
  "l4text": "community.frame.work",
  "t5text": "Sponsorships Inquiries",
  "l5text": "Fill out the sponsorship form",
  "imptitletext": "Impressum",
  "i11text": "Company Name",
  "i12text": "Framework* Computer Inc",
  "i21text": "Headquarters Address",
  "i22text": "447 Sutter St, PMB 135, San Francisco, CA 94108-4928, United States",
  "i31text": "Managing Director",
  "i32text": "Nirav Patel",
  "i41text": "Contact",
  "i42text": "media@frame.work, +1 (415) 475-1196",
  "i51text": "VAT number",
  "i52text": "NL864036020B01",
  "i61text": "Trademark",
  "i62text": "Framework® is Registered in U.S. Patent and Trademark Office",
  "worktitletext": "Work with us",
  "worksubtext": "Come join us to remake Consumer Electronics!",
  "worklinktext": "View open jobs",
  "workillustrationimagesrc": "./images/generated-1773120346359.png"
};
const LAYOUT_CONTEXT = {
  "pageWidth": 1440,
  "pagePaddingLeft": 0,
  "pagePaddingRight": 0,
  "pagePaddingTop": 0,
  "pagePaddingBottom": 0,
  "sectionGapAfter": 0
};
const NAV_ACTIVE_COLOR = "#0D6E6E";
const NAV_INACTIVE_COLOR = "#888888";
const ICONS = {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  HeartHandshake,
  Menu,
  MessageSquare,
  Minus,
  Newspaper,
  Play,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Wifi,
  X,
};
const ICON_GLYPH_MAP = {
  "message-square": "MessageSquare",
  "shopping-bag": "ShoppingBag",
  newspaper: "Newspaper",
  globe: "Globe",
  "heart-handshake": "HeartHandshake",
};
const PEN_RUNTIME_MOTION_STYLE = "@keyframes pen-media-breathe{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-8px,0) scale(1.035)}}@keyframes pen-track-slide-x-subtle{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-32px,0,0)}}@keyframes pen-track-slide-x-showcase{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-52px,0,0)}}@keyframes pen-card-float{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-10px,0)}}.pen-product-card-hover{transform-origin:center center}.pen-product-card-hover:hover{transform:translate3d(0,-4px,0) scale(1.012);border-color:#FFFFFF!important;box-shadow:0 12px 30px rgba(0,0,0,.32)}";

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
      mediaBreathe: false,
      contentStagger: true,
    };
  }
  if (sectionKindToken === "navigation" || sectionKindToken === "footer") {
    return {
      level: "off",
      revealPreset: "fadeIn",
      delayStep: 0,
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

const normalizeNavPath = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  if (/^(?:mailto:|tel:|javascript:|data:)/i.test(raw)) return "";
  if (raw.startsWith("#")) return "/";
  try {
    const parsed = new URL(raw, "https://template.local");
    let pathname = String(parsed.pathname || "/").replace(/\/+/g, "/");
    if (pathname !== "/") pathname = pathname.replace(/\/+$/g, "");
    return pathname || "/";
  } catch {
    return "/";
  }
};

const normalizePreviewPagePath = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw || raw === "home" || raw === "index") return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
};

const resolveRuntimeCurrentPath = (merged, pathname, searchParams) => {
  const explicitPath = String(merged?.currentPath || "").trim();
  if (explicitPath) return explicitPath;
  const pageParamRaw = String(searchParams?.get?.("page") || "").trim();
  if (pageParamRaw) return normalizePreviewPagePath(pageParamRaw);
  return pathname || "/";
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

const shouldApplyProductsCardHover = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "products") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  const name = getNodeNameToken(node);
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  const borderToken = String(node?.style?.border || "").trim();
  const borderLike = /(?:^|\s)(?:\d+(?:\.\d+)?)px\s/.test(borderToken);
  return /(?:productcard|product-card|card|tile|panel)/.test(name) && childCount > 0 && borderLike;
};

const buildNodeClassName = (node, sectionMotion, sectionKindToken) => {
  if (!sectionMotion || sectionMotion.level === "off") return "";
  const classes = [];
  if (node?.hrefProp) classes.push("hover-lift");
  if (node?.type === "frame" && node?.imageProp) classes.push("will-change-transform");
  if (shouldApplyStoryCardHover(node, sectionKindToken)) classes.push("hover-lift");
  if (shouldApplyProductsCardHover(node, sectionKindToken)) classes.push("pen-product-card-hover");
  if (shouldApplyStoryTrackMotion(node, sectionKindToken)) classes.push("will-change-transform", "pen-track-slide");
  return classes.join(" ");
};

const resolveResponsiveFixedWidth = (rawWidth) => {
  const numericWidth = resolveNumericDimension(rawWidth);
  if (!(Number.isFinite(numericWidth) && numericWidth > 0)) return null;
  if (numericWidth < 360) return null;
  return `min(100%, ${Math.round(numericWidth)}px)`;
};

const shouldConvertRowFillToFlex = (parentNode, childIndex, style) => {
  const parentDirection = String(parentNode?.style?.flexDirection || "").trim().toLowerCase();
  if (parentDirection !== "row") return false;
  const currentWidth = String(style?.width || "").trim();
  if (currentWidth !== "100%") return false;
  if (style?.flex) return false;
  const siblings = Array.isArray(parentNode?.children) ? parentNode.children : [];
  return siblings.some((sibling, siblingIndex) => {
    if (siblingIndex === childIndex) return false;
    return resolveNumericDimension(sibling?.style?.width) > 0;
  });
};

const buildNodeStyle = (
  node,
  merged,
  sectionMotion,
  sectionKindToken,
  keyPath,
  currentPathToken = "/",
  parentNode = null,
  childIndex = 0
) => {
  const style = { ...(node?.style || {}) };
  applyPenThemeToStyleObject(style, {
    node,
    parentNode,
    keyPath,
    sectionKindToken,
    isHeadingLike: isHeadingLikeTextNode(node),
  });
  const rawHref = node?.hrefProp ? String(merged?.[node.hrefProp] || "").trim() : "";
  if (keyPath === "root") {
    const rawRootWidth = style?.width;
    const shouldNormalizeRootWidth =
      (typeof rawRootWidth === "number" && Number.isFinite(rawRootWidth) && rawRootWidth > 0) ||
      (typeof rawRootWidth === "string" && /^\d+(?:\.\d+)?$/.test(rawRootWidth.trim()));
    if (shouldNormalizeRootWidth) {
      const numericRootWidth = Number(rawRootWidth);
      style.maxWidth = style.maxWidth || numericRootWidth;
      style.width = "100%";
      style.marginLeft = style.marginLeft || "auto";
      style.marginRight = style.marginRight || "auto";
    }
    const rootDirection = String(style?.flexDirection || "").trim().toLowerCase();
    if (rootDirection === "row" && sectionKindToken !== "navigation" && sectionKindToken !== "footer") {
      style.flexWrap = style.flexWrap || "wrap";
    }
  }
  if (keyPath !== "root" && !style.maxWidth) {
    const responsiveFixedWidth = resolveResponsiveFixedWidth(style?.width);
    if (responsiveFixedWidth) {
      style.width = responsiveFixedWidth;
    }
  }
  if (shouldConvertRowFillToFlex(parentNode, childIndex, style)) {
    style.width = "auto";
    style.flex = style.flex || "1 1 0";
    if (typeof style.minWidth === "undefined") style.minWidth = 0;
  }
  if (node?.imageProp) {
    const src = String(merged?.[node.imageProp] || "").trim();
    if (src) {
      style.backgroundImage = `url(${src})`;
    }
  }
  if (rawHref) {
    style.textDecoration = style.textDecoration || "none";
    if (!style.color) style.color = "inherit";
    if (node?.type === "frame" && !style.display) {
      style.display = "inline-block";
    }
  }
  if (sectionKindToken === "navigation" && node?.type === "text" && rawHref) {
    const hrefPathToken = normalizeNavPath(rawHref);
    const isActiveNavItem = Boolean(hrefPathToken) && hrefPathToken === currentPathToken;
    style.color = isActiveNavItem ? NAV_ACTIVE_COLOR : NAV_INACTIVE_COLOR;
    if (isActiveNavItem) {
      style.fontWeight = style.fontWeight || "600";
    } else if (typeof style.opacity === "undefined") {
      style.opacity = 0.96;
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

const renderNode = (
  node,
  merged,
  sectionMotion,
  sectionKindToken,
  key = "root",
  ancestorHasLink = false,
  currentPathToken = "/",
  parentNode = null,
  childIndex = 0
) => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(
    node,
    merged,
    sectionMotion,
    sectionKindToken,
    key,
    currentPathToken,
    parentNode,
    childIndex
  );
  const className = buildNodeClassName(node, sectionMotion, sectionKindToken) || undefined;
  const href = node?.hrefProp ? String(merged?.[node.hrefProp] || "").trim() : "";
  const shouldRenderLink = Boolean(href) && !ancestorHasLink;
  if (node.type === "icon_font") {
    const iconToken = String(node?.iconName || ICON_GLYPH_MAP[String(node?.iconGlyph || "")] || "").trim();
    const Icon = iconToken ? ICONS[iconToken] : null;
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
            ancestorHasLink || shouldRenderLink,
            currentPathToken,
            node,
            index
          )
        )
      : [])
  );
};

export default function TemplateExclusiveFrameworkContactContactContactmainpenAlt2({ id, t1text, l1text, t2text, l2text, t3text, l3text, t4text, l4text, t5text, l5text, imptitletext, i11text, i12text, i21text, i22text, i31text, i32text, i41text, i42text, i51text, i52text, i61text, i62text, worktitletext, worksubtext, worklinktext, workillustrationimagesrc, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, t1text, l1text, t2text, l2text, t3text, l3text, t4text, l4text, t5text, l5text, imptitletext, i11text, i12text, i21text, i22text, i31text, i32text, i41text, i42text, i51text, i52text, i61text, i62text, worktitletext, worksubtext, worklinktext, workillustrationimagesrc });
  assignDefined(merged, rest);
  const runtimeCurrentPath = resolveRuntimeCurrentPath(merged, pathname, searchParams);
  const currentPathToken = normalizeNavPath(runtimeCurrentPath || "/");
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
  const layoutStyle: React.CSSProperties = {
    boxSizing: "border-box",
  };
  const pageWidth = Number(LAYOUT_CONTEXT?.pageWidth || 0);
  const pagePaddingLeft = Number(LAYOUT_CONTEXT?.pagePaddingLeft || 0);
  const pagePaddingRight = Number(LAYOUT_CONTEXT?.pagePaddingRight || 0);
  const pagePaddingTop = Number(LAYOUT_CONTEXT?.pagePaddingTop || 0);
  const pagePaddingBottom = Number(LAYOUT_CONTEXT?.pagePaddingBottom || 0);
  const sectionGapAfter = Number(LAYOUT_CONTEXT?.sectionGapAfter || 0);
  if (Number.isFinite(pageWidth) && pageWidth > 0) {
    layoutStyle.width = "100%";
    layoutStyle.maxWidth = pageWidth;
    layoutStyle.marginLeft = "auto";
    layoutStyle.marginRight = "auto";
  }
  const responsiveEdgePadding = (value) => {
    if (!(Number.isFinite(value) && value > 0)) return 0;
    const safeValue = Math.round(value);
    const safeWidth = Number.isFinite(pageWidth) && pageWidth > 0 ? pageWidth : 0;
    if (safeWidth > 0) {
      const ratioVw = Math.max(1.4, Math.min(6.8, (safeValue / safeWidth) * 100));
      const minPx = Math.max(12, Math.min(24, Math.round(safeValue * 0.35)));
      return `clamp(${minPx}px, ${ratioVw.toFixed(3)}vw, ${safeValue}px)`;
    }
    return safeValue;
  };
  if (Number.isFinite(pagePaddingLeft) && pagePaddingLeft > 0) layoutStyle.paddingLeft = responsiveEdgePadding(pagePaddingLeft);
  if (Number.isFinite(pagePaddingRight) && pagePaddingRight > 0) layoutStyle.paddingRight = responsiveEdgePadding(pagePaddingRight);
  if (Number.isFinite(pagePaddingTop) && pagePaddingTop > 0) layoutStyle.paddingTop = pagePaddingTop;
  if (Number.isFinite(pagePaddingBottom) && pagePaddingBottom > 0) layoutStyle.paddingBottom = pagePaddingBottom;
  if (Number.isFinite(sectionGapAfter) && sectionGapAfter > 0) layoutStyle.marginBottom = sectionGapAfter;
  const themeVars = buildPenThemeCssVars(merged?.theme);
  const mergedSectionStyle = sectionStyle ? { ...layoutStyle, ...themeVars, ...sectionStyle } : { ...layoutStyle, ...themeVars };
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": SECTION_KIND,
      className: sectionClassName,
      style: mergedSectionStyle,
      ref: sectionMotion?.level === "off" ? undefined : reveal.ref,
    },
    ...(sectionMotion?.level !== "off"
      ? [React.createElement("style", { key: "pen-motion-style" }, PEN_RUNTIME_MOTION_STYLE)]
      : []),
    renderNode(SECTION_TREE, merged, sectionMotion, sectionKindToken, "root", false, currentPathToken)
  );
}
