// @ts-nocheck
"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
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
  "id": "9eoiI",
  "name": "contactMain",
  "style": {
    "boxSizing": "border-box",
    "width": 1440,
    "height": 1552,
    "background": "#ffffff",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "text",
      "id": "sWQvn",
      "name": "crumb",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#9a9a9a",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "normal",
        "width": 120,
        "position": "absolute",
        "left": 80,
        "top": 32
      },
      "children": [],
      "textProp": "crumbtext"
    },
    {
      "type": "text",
      "id": "5vXaa",
      "name": "title",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#3a3a3a",
        "fontFamily": "Inter",
        "fontSize": 30,
        "fontWeight": "500",
        "textAlign": "center",
        "width": 340,
        "position": "absolute",
        "left": 550,
        "top": 80
      },
      "children": [],
      "textProp": "titletext"
    },
    {
      "type": "text",
      "id": "iaKoM",
      "name": "sub",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#666666",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "normal",
        "textAlign": "center",
        "width": 500,
        "position": "absolute",
        "left": 470,
        "top": 116
      },
      "children": [],
      "textProp": "subtext"
    },
    {
      "type": "frame",
      "id": "ARv3l",
      "name": "card1",
      "style": {
        "boxSizing": "border-box",
        "width": 300,
        "height": 250,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 80,
        "top": 175
      },
      "children": [
        {
          "type": "text",
          "id": "ZL6nV",
          "name": "card1t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "width": 120,
            "position": "absolute",
            "left": 32,
            "top": 10
          },
          "children": [],
          "textProp": "card1ttext"
        },
        {
          "type": "text",
          "id": "VK7OR",
          "name": "card1d",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 270,
            "position": "absolute",
            "left": 14,
            "top": 34
          },
          "children": [],
          "textProp": "card1dtext"
        },
        {
          "type": "icon_font",
          "id": "QJhvZ",
          "name": "icon1",
          "style": {
            "boxSizing": "border-box",
            "color": "#9a9a9a",
            "width": 14,
            "height": 14,
            "display": "inline-flex",
            "alignItems": "center",
            "justifyContent": "center",
            "flexShrink": 0,
            "fontSize": 14,
            "position": "absolute",
            "left": 12,
            "top": 12
          },
          "children": [],
          "iconGlyph": "phone"
        }
      ]
    },
    {
      "type": "frame",
      "id": "0zRPK",
      "name": "card2",
      "style": {
        "boxSizing": "border-box",
        "width": 300,
        "height": 250,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 393,
        "top": 175
      },
      "children": [
        {
          "type": "text",
          "id": "gctg7",
          "name": "card2t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "width": 120,
            "position": "absolute",
            "left": 32,
            "top": 10
          },
          "children": [],
          "textProp": "card2ttext"
        },
        {
          "type": "text",
          "id": "MnkCd",
          "name": "card2d",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 270,
            "position": "absolute",
            "left": 14,
            "top": 34
          },
          "children": [],
          "textProp": "card2dtext"
        },
        {
          "type": "icon_font",
          "id": "P62et",
          "name": "icon2",
          "style": {
            "boxSizing": "border-box",
            "color": "#9a9a9a",
            "width": 14,
            "height": 14,
            "display": "inline-flex",
            "alignItems": "center",
            "justifyContent": "center",
            "flexShrink": 0,
            "fontSize": 14,
            "position": "absolute",
            "left": 12,
            "top": 12
          },
          "children": [],
          "iconGlyph": "mail"
        }
      ]
    },
    {
      "type": "frame",
      "id": "N4u0C",
      "name": "card3",
      "style": {
        "boxSizing": "border-box",
        "width": 300,
        "height": 250,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 706,
        "top": 175
      },
      "children": [
        {
          "type": "text",
          "id": "g4tr9",
          "name": "card3t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "width": 120,
            "position": "absolute",
            "left": 32,
            "top": 10
          },
          "children": [],
          "textProp": "card3ttext"
        },
        {
          "type": "text",
          "id": "Ft5iQ",
          "name": "card3d",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 270,
            "position": "absolute",
            "left": 14,
            "top": 34
          },
          "children": [],
          "textProp": "card3dtext"
        },
        {
          "type": "icon_font",
          "id": "VdbVi",
          "name": "icon3",
          "style": {
            "boxSizing": "border-box",
            "color": "#9a9a9a",
            "width": 14,
            "height": 14,
            "display": "inline-flex",
            "alignItems": "center",
            "justifyContent": "center",
            "flexShrink": 0,
            "fontSize": 14,
            "position": "absolute",
            "left": 12,
            "top": 12
          },
          "children": [],
          "iconGlyph": "printer"
        }
      ]
    },
    {
      "type": "frame",
      "id": "TADcZ",
      "name": "card4",
      "style": {
        "boxSizing": "border-box",
        "width": 300,
        "height": 250,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 1019,
        "top": 175
      },
      "children": [
        {
          "type": "text",
          "id": "a2hqw",
          "name": "card4t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "width": 120,
            "position": "absolute",
            "left": 32,
            "top": 10
          },
          "children": [],
          "textProp": "card4ttext"
        },
        {
          "type": "text",
          "id": "OULXf",
          "name": "card4d",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 270,
            "position": "absolute",
            "left": 14,
            "top": 34
          },
          "children": [],
          "textProp": "card4dtext"
        },
        {
          "type": "icon_font",
          "id": "3jCoV",
          "name": "icon4",
          "style": {
            "boxSizing": "border-box",
            "color": "#9a9a9a",
            "width": 14,
            "height": 14,
            "display": "inline-flex",
            "alignItems": "center",
            "justifyContent": "center",
            "flexShrink": 0,
            "fontSize": 14,
            "position": "absolute",
            "left": 12,
            "top": 12
          },
          "children": [],
          "iconGlyph": "mail"
        }
      ]
    },
    {
      "type": "text",
      "id": "LHuNb",
      "name": "sec",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#3a3a3a",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "500",
        "width": 547,
        "position": "absolute",
        "left": 80,
        "top": 470
      },
      "children": [],
      "textProp": "sectext"
    },
    {
      "type": "frame",
      "id": "rNWJw",
      "name": "c1",
      "style": {
        "boxSizing": "border-box",
        "width": 400,
        "height": 260,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 80,
        "top": 514
      },
      "children": [
        {
          "type": "frame",
          "id": "6KMfn",
          "name": "c1img",
          "style": {
            "boxSizing": "border-box",
            "width": 400,
            "height": 74,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "c1imgimagesrc"
        },
        {
          "type": "text",
          "id": "IhAdR",
          "name": "c1t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "width": 220,
            "position": "absolute",
            "left": 14,
            "top": 92
          },
          "children": [],
          "textProp": "c1ttext"
        },
        {
          "type": "text",
          "id": "e5XrO",
          "name": "c1l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "width": 240,
            "position": "absolute",
            "left": 14,
            "top": 126
          },
          "children": [],
          "textProp": "c1ltext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "YujYV",
      "name": "c2",
      "style": {
        "boxSizing": "border-box",
        "width": 400,
        "height": 260,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 520,
        "top": 514
      },
      "children": [
        {
          "type": "frame",
          "id": "YE2Ag",
          "name": "c2img",
          "style": {
            "boxSizing": "border-box",
            "width": 400,
            "height": 74,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "c2imgimagesrc"
        },
        {
          "type": "text",
          "id": "SjGC5",
          "name": "c2t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "width": 220,
            "position": "absolute",
            "left": 14,
            "top": 92
          },
          "children": [],
          "textProp": "c2ttext"
        },
        {
          "type": "text",
          "id": "p2Mou",
          "name": "c2l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "width": 240,
            "position": "absolute",
            "left": 14,
            "top": 126
          },
          "children": [],
          "textProp": "c2ltext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "QfmMs",
      "name": "c3",
      "style": {
        "boxSizing": "border-box",
        "width": 360,
        "height": 260,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 960,
        "top": 514
      },
      "children": [
        {
          "type": "frame",
          "id": "qPE2K",
          "name": "c3img",
          "style": {
            "boxSizing": "border-box",
            "width": 360,
            "height": 74,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "c3imgimagesrc"
        },
        {
          "type": "text",
          "id": "S7xOj",
          "name": "c3t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "width": 220,
            "position": "absolute",
            "left": 14,
            "top": 92
          },
          "children": [],
          "textProp": "c3ttext"
        },
        {
          "type": "text",
          "id": "qhl8D",
          "name": "c3l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "width": 220,
            "position": "absolute",
            "left": 14,
            "top": 126
          },
          "children": [],
          "textProp": "c3ltext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "TL6kB",
      "name": "c4",
      "style": {
        "boxSizing": "border-box",
        "width": 400,
        "height": 260,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 80,
        "top": 794
      },
      "children": [
        {
          "type": "frame",
          "id": "0Xqin",
          "name": "c4img",
          "style": {
            "boxSizing": "border-box",
            "width": 400,
            "height": 74,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "c4imgimagesrc"
        },
        {
          "type": "text",
          "id": "FN6hv",
          "name": "c4t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "width": 280,
            "position": "absolute",
            "left": 14,
            "top": 92
          },
          "children": [],
          "textProp": "c4ttext"
        },
        {
          "type": "text",
          "id": "pPUf5",
          "name": "c4l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "width": 240,
            "position": "absolute",
            "left": 14,
            "top": 126
          },
          "children": [],
          "textProp": "c4ltext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "FBxOX",
      "name": "c5",
      "style": {
        "boxSizing": "border-box",
        "width": 400,
        "height": 260,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 520,
        "top": 794
      },
      "children": [
        {
          "type": "frame",
          "id": "cVv6L",
          "name": "c5img",
          "style": {
            "boxSizing": "border-box",
            "width": 400,
            "height": 74,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "c5imgimagesrc"
        },
        {
          "type": "text",
          "id": "lpwBT",
          "name": "c5t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "width": 300,
            "position": "absolute",
            "left": 14,
            "top": 92
          },
          "children": [],
          "textProp": "c5ttext"
        },
        {
          "type": "text",
          "id": "ZWGRM",
          "name": "c5l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "width": 240,
            "position": "absolute",
            "left": 14,
            "top": 126
          },
          "children": [],
          "textProp": "c5ltext"
        }
      ]
    },
    {
      "type": "text",
      "id": "DngYC",
      "name": "resT",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#3a3a3a",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "500",
        "width": 220,
        "position": "absolute",
        "left": 80,
        "top": 1388
      },
      "children": [],
      "textProp": "resttext"
    },
    {
      "type": "frame",
      "id": "w1Jwq",
      "name": "resBox",
      "style": {
        "boxSizing": "border-box",
        "width": 1260,
        "height": 92,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 80,
        "top": 1420
      },
      "children": [
        {
          "type": "frame",
          "id": "AiL7F",
          "name": "rb1",
          "style": {
            "boxSizing": "border-box",
            "width": 315,
            "height": 92,
            "borderRight": "1px solid #e1e1e1",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 0
          },
          "children": [
            {
              "type": "icon_font",
              "id": "IiFqv",
              "name": "i1",
              "style": {
                "boxSizing": "border-box",
                "color": "#8a8a8a",
                "width": 24,
                "height": 24,
                "display": "inline-flex",
                "alignItems": "center",
                "justifyContent": "center",
                "flexShrink": 0,
                "fontSize": 24,
                "position": "absolute",
                "left": 132,
                "top": 22
              },
              "children": [],
              "iconGlyph": "map-pin"
            },
            {
              "type": "text",
              "id": "NTbHM",
              "name": "t1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6e91b8",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "textAlign": "center",
                "width": 120,
                "position": "absolute",
                "left": 84,
                "top": 54
              },
              "children": [],
              "textProp": "t1text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "2iYJr",
          "name": "rb2",
          "style": {
            "boxSizing": "border-box",
            "width": 315,
            "height": 92,
            "borderRight": "1px solid #e1e1e1",
            "position": "absolute",
            "overflow": "hidden",
            "left": 315,
            "top": 0
          },
          "children": [
            {
              "type": "icon_font",
              "id": "VwTt4",
              "name": "i2",
              "style": {
                "boxSizing": "border-box",
                "color": "#8a8a8a",
                "width": 24,
                "height": 24,
                "display": "inline-flex",
                "alignItems": "center",
                "justifyContent": "center",
                "flexShrink": 0,
                "fontSize": 24,
                "position": "absolute",
                "left": 132,
                "top": 22
              },
              "children": [],
              "iconGlyph": "message-square"
            },
            {
              "type": "text",
              "id": "ZUzMT",
              "name": "t2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6e91b8",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "textAlign": "center",
                "width": 170,
                "position": "absolute",
                "left": 59,
                "top": 54
              },
              "children": [],
              "textProp": "t2text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "ZB4DZ",
          "name": "rb3",
          "style": {
            "boxSizing": "border-box",
            "width": 315,
            "height": 92,
            "borderRight": "1px solid #e1e1e1",
            "position": "absolute",
            "overflow": "hidden",
            "left": 630,
            "top": 0
          },
          "children": [
            {
              "type": "icon_font",
              "id": "U63PZ",
              "name": "i3",
              "style": {
                "boxSizing": "border-box",
                "color": "#8a8a8a",
                "width": 24,
                "height": 24,
                "display": "inline-flex",
                "alignItems": "center",
                "justifyContent": "center",
                "flexShrink": 0,
                "fontSize": 24,
                "position": "absolute",
                "left": 132,
                "top": 22
              },
              "children": [],
              "iconGlyph": "globe"
            },
            {
              "type": "text",
              "id": "gtkgQ",
              "name": "t3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6e91b8",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "textAlign": "center",
                "width": 165,
                "position": "absolute",
                "left": 61,
                "top": 54
              },
              "children": [],
              "textProp": "t3text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "0KYUY",
          "name": "rb4",
          "style": {
            "boxSizing": "border-box",
            "width": 315,
            "height": 92,
            "position": "absolute",
            "overflow": "hidden",
            "left": 945,
            "top": 0
          },
          "children": [
            {
              "type": "icon_font",
              "id": "F9or4",
              "name": "i4",
              "style": {
                "boxSizing": "border-box",
                "color": "#8a8a8a",
                "width": 24,
                "height": 24,
                "display": "inline-flex",
                "alignItems": "center",
                "justifyContent": "center",
                "flexShrink": 0,
                "fontSize": 24,
                "position": "absolute",
                "left": 132,
                "top": 22
              },
              "children": [],
              "iconGlyph": "settings"
            },
            {
              "type": "text",
              "id": "tXnqt",
              "name": "t4",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6e91b8",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "textAlign": "center",
                "width": 120,
                "position": "absolute",
                "left": 84,
                "top": 54
              },
              "children": [],
              "textProp": "t4text"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "Yq5k0",
      "name": "c6",
      "style": {
        "boxSizing": "border-box",
        "width": 360,
        "height": 260,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 960,
        "top": 794
      },
      "children": [
        {
          "type": "frame",
          "id": "w9RM7",
          "name": "c6img",
          "style": {
            "boxSizing": "border-box",
            "width": 360,
            "height": 74,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "c6imgimagesrc"
        },
        {
          "type": "text",
          "id": "YoBSw",
          "name": "c6t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "width": 260,
            "position": "absolute",
            "left": 14,
            "top": 92
          },
          "children": [],
          "textProp": "c6ttext"
        },
        {
          "type": "text",
          "id": "yjtrD",
          "name": "c6l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "width": 220,
            "position": "absolute",
            "left": 14,
            "top": 126
          },
          "children": [],
          "textProp": "c6ltext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "4B7ov",
      "name": "c7",
      "style": {
        "boxSizing": "border-box",
        "width": 400,
        "height": 260,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 80,
        "top": 1074
      },
      "children": [
        {
          "type": "frame",
          "id": "NHTEO",
          "name": "c7img",
          "style": {
            "boxSizing": "border-box",
            "width": 400,
            "height": 74,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "c7imgimagesrc"
        },
        {
          "type": "text",
          "id": "hxntm",
          "name": "c7t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "width": 260,
            "position": "absolute",
            "left": 14,
            "top": 92
          },
          "children": [],
          "textProp": "c7ttext"
        },
        {
          "type": "text",
          "id": "36LTF",
          "name": "c7l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "width": 240,
            "position": "absolute",
            "left": 14,
            "top": 126
          },
          "children": [],
          "textProp": "c7ltext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "h8isI",
      "name": "c8",
      "style": {
        "boxSizing": "border-box",
        "width": 400,
        "height": 260,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 520,
        "top": 1074
      },
      "children": [
        {
          "type": "frame",
          "id": "f9eMK",
          "name": "c8img",
          "style": {
            "boxSizing": "border-box",
            "width": 400,
            "height": 74,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "c8imgimagesrc"
        },
        {
          "type": "text",
          "id": "J6REL",
          "name": "c8t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "width": 280,
            "position": "absolute",
            "left": 14,
            "top": 92
          },
          "children": [],
          "textProp": "c8ttext"
        },
        {
          "type": "text",
          "id": "GbGt6",
          "name": "c8l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "width": 240,
            "position": "absolute",
            "left": 14,
            "top": 126
          },
          "children": [],
          "textProp": "c8ltext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "YxdhN",
      "name": "c9",
      "style": {
        "boxSizing": "border-box",
        "width": 360,
        "height": 260,
        "background": "#ffffff",
        "border": "1px solid #d7d7d7",
        "position": "absolute",
        "overflow": "hidden",
        "left": 960,
        "top": 1074
      },
      "children": [
        {
          "type": "frame",
          "id": "NEWiq",
          "name": "c9img",
          "style": {
            "boxSizing": "border-box",
            "width": 360,
            "height": 74,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "c9imgimagesrc"
        },
        {
          "type": "text",
          "id": "ih6Pz",
          "name": "c9t",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "width": 260,
            "position": "absolute",
            "left": 14,
            "top": 92
          },
          "children": [],
          "textProp": "c9ttext"
        },
        {
          "type": "text",
          "id": "0wIGz",
          "name": "c9l",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#666666",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "normal",
            "width": 220,
            "position": "absolute",
            "left": 14,
            "top": 126
          },
          "children": [],
          "textProp": "c9ltext"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "9eoiI",
  "crumbtext": "Support",
  "titletext": "Customer Support",
  "subtext": "Find customer service centers around the globe.",
  "card1ttext": "Phone",
  "card1dtext": "Phone\n(833) 893-1514\n\nCustomer Service Hours\nMonday - Thursday\n8am - 9pm EST\nFriday\n8am - 7pm EST\n\nAdd to contacts",
  "card2ttext": "Email",
  "card2dtext": "Email\nmetalcutting@kennametal.com\n\nMailing Address\nKennametal Inc\n1600 Technology Way\nLatrobe, PA 15650",
  "card3ttext": "Fax",
  "card3dtext": "Fax\n(800) 456-6622\n\nCustomer Service\nLatrobe, PA\nUnited States",
  "card4ttext": "Email",
  "card4dtext": "Email\nearthcutting@kennametal.com\n\nMailing Address\nKennametal Inc\n1600 Technology Way\nLatrobe, PA 15650",
  "sectext": "Earth Cutting & Wear Solutions Order Support (US Only)",
  "c1imgimagesrc": "https://images.unsplash.com/photo-1736664030438-251abe59a342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTM5NTF8&ixlib=rb-4.1.0&q=80&w=1080",
  "c1ttext": "Mining & Construction",
  "c1ltext": "• Drill bits\n• Cutting systems\n• Conical picks\n• CLAN\n\nPhone: (833) 893-1514\nAdd to contacts",
  "c2imgimagesrc": "https://images.unsplash.com/photo-1731397979951-054128e9c6d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTM5NTF8&ixlib=rb-4.1.0&q=80&w=1080",
  "c2ttext": "Solid Components, Solid",
  "c2ltext": "• Drill bits\n• Wear parts\n• Tool holders\n• Adaptors\n\nPhone: (833) 893-1514\nAdd to contacts",
  "c3imgimagesrc": "https://images.unsplash.com/photo-1747999461210-a56f72294428?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTM5NTJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "c3ttext": "Cutting Tool Matrix",
  "c3ltext": "• Full Matrix\n• Drill Matrix\n• Specialty Matrix\n\nPhone: (833) 893-1514\nAdd to contacts",
  "c4imgimagesrc": "https://images.unsplash.com/photo-1736788265336-6d5ba0cfefe0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTM5NTJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "c4ttext": "Continual Tooling Service",
  "c4ltext": "• Machine tools\n• Coating systems\n• Repair service\n\nPhone: (833) 893-1514\nAdd to contacts",
  "c5imgimagesrc": "https://images.unsplash.com/photo-1503791774117-08c379dd7f7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTM5NTN8&ixlib=rb-4.1.0&q=80&w=1080",
  "c5ttext": "Industrial Knives / New Products",
  "c5ltext": "• Industrial knives\n• Wear products\n• New products\n\nPhone: (833) 893-1514\nAdd to contacts",
  "resttext": "Other Resources",
  "t1text": "Find A Distributor >",
  "t2text": "Frequently Asked Questions >",
  "t3text": "Download Tool Brochures >",
  "t4text": "Kennametal Events >",
  "c6imgimagesrc": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTM5NTR8&ixlib=rb-4.1.0&q=80&w=1080",
  "c6ttext": "Cutting Tool Matrix",
  "c6ltext": "• Full matrix\n• Drill matrix\n• Specialty matrix\n\nPhone: (833) 893-1514\nAdd to contacts",
  "c7imgimagesrc": "https://images.unsplash.com/photo-1690259378861-ac689090a537?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTM5NTV8&ixlib=rb-4.1.0&q=80&w=1080",
  "c7ttext": "Castings Parts & Components",
  "c7ltext": "• Rod forms\n• Powders\n• Castings\n\nPhone: (833) 893-1514\nAdd to contacts",
  "c8imgimagesrc": "https://images.unsplash.com/photo-1762951317733-9e800909e93f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTM5NTV8&ixlib=rb-4.1.0&q=80&w=1080",
  "c8ttext": "Products & Product Protection",
  "c8ltext": "• Engineered products\n• Inserts\n• Tooling components\n\nPhone: (833) 893-1514\nAdd to contacts",
  "c9imgimagesrc": "https://images.unsplash.com/photo-1768508917406-75780a1fb421?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTM5NTZ8&ixlib=rb-4.1.0&q=80&w=1080",
  "c9ttext": "Sintered Advanced Ceramics",
  "c9ltext": "• Components\n• Powders\n• Specialty grades\n\nPhone: (833) 893-1514\nAdd to contacts"
};
const DEFAULT_THEME = {
  "mode": "light",
  "fontHeading": "Inter",
  "fontBody": "Inter",
  "motion": "subtle",
  "fontFamilies": [
    "Inter"
  ],
  "palette": {
    "bg": "#ffffff",
    "text": "#ffffff",
    "primary": "#f4c300",
    "accent": "#f4c300",
    "neutral": "#E5E7EB",
    "textSecondary": "#4B5563"
  },
  "primaryColor": "#f4c300",
  "layoutRules": {
    "maxWidth": "1400px",
    "sectionPadding": "py-24",
    "grid": "12-col"
  },
  "tokens": {
    "surface": "solid",
    "border": "soft",
    "shadow": "dramatic",
    "accent": "glow"
  }
};
const LAYOUT_CONTEXT = {
  "pageWidth": 1440,
  "pagePaddingLeft": 0,
  "pagePaddingRight": 0,
  "pagePaddingTop": 0,
  "pagePaddingBottom": 0,
  "sectionGapAfter": 0
};
const NAV_ACTIVE_COLOR = "var(--pen-theme-text, #0D6E6E)";
const NAV_INACTIVE_COLOR = "var(--pen-theme-text-secondary, #888888)";
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };
const PEN_RUNTIME_MOTION_STYLE = "@keyframes pen-media-breathe{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-8px,0) scale(1.035)}}.pen-product-card-hover{transform-origin:center center}.pen-product-card-hover:hover{transform:translate3d(0,-4px,0) scale(1.012);border-color:#FFFFFF!important;box-shadow:0 12px 30px rgba(0,0,0,.32)}";

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

const parseThemeHexColor = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const match = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((entry) => entry + entry)
          .join("")
      : match[1];
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

const isThemeDarkColor = (value = "") => {
  const parsed = parseThemeHexColor(value);
  if (!parsed) return false;
  const toLinear = (n) => {
    const c = n / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * toLinear(parsed.r) + 0.7152 * toLinear(parsed.g) + 0.0722 * toLinear(parsed.b);
  return lum < 0.42;
};

const isThemeNeutralColor = (value = "") => {
  const parsed = parseThemeHexColor(value);
  if (!parsed) return false;
  const spread = Math.max(parsed.r, parsed.g, parsed.b) - Math.min(parsed.r, parsed.g, parsed.b);
  return spread < 18;
};

const pickThemeContrastColor = (value = "", light = "#F9F6EE", dark = "#111111") =>
  isThemeDarkColor(value) ? light : dark;

const resolveThemePalette = (themeInput = null) => {
  const baseTheme = DEFAULT_THEME && typeof DEFAULT_THEME === "object" ? DEFAULT_THEME : {};
  const inputTheme = themeInput && typeof themeInput === "object" ? themeInput : {};
  const basePalette = baseTheme.palette && typeof baseTheme.palette === "object" ? baseTheme.palette : {};
  const inputPalette = inputTheme.palette && typeof inputTheme.palette === "object" ? inputTheme.palette : {};
  const primary = String(inputPalette.primary || inputTheme.primaryColor || basePalette.primary || "#4F77FF");
  const accent = String(inputPalette.accent || primary || basePalette.accent || "#F46E35");
  return {
    ...baseTheme,
    ...inputTheme,
    palette: {
      bg: String(inputPalette.bg || basePalette.bg || "#F3F3EF"),
      text: String(inputPalette.text || basePalette.text || "#111111"),
      primary,
      accent,
      neutral: String(inputPalette.neutral || basePalette.neutral || "#E5E7EB"),
      textSecondary: String(inputPalette.textSecondary || basePalette.textSecondary || "#4B5563"),
    },
    fontHeading: String(inputTheme.fontHeading || baseTheme.fontHeading || "Inter"),
    fontBody: String(inputTheme.fontBody || baseTheme.fontBody || inputTheme.fontHeading || baseTheme.fontHeading || "Inter"),
  };
};

const buildThemeCssVars = (themeInput = null) => {
  const resolvedTheme = resolveThemePalette(themeInput);
  const palette = resolvedTheme.palette || {};
  const inverseSurface = isThemeDarkColor(palette.text) ? palette.text : palette.primary;
  return {
    "--pen-theme-bg": palette.bg,
    "--pen-theme-text": palette.text,
    "--pen-theme-primary": palette.primary,
    "--pen-theme-accent": palette.accent,
    "--pen-theme-neutral": palette.neutral,
    "--pen-theme-text-secondary": palette.textSecondary,
    "--pen-theme-on-primary": pickThemeContrastColor(palette.primary),
    "--pen-theme-on-accent": pickThemeContrastColor(palette.accent),
    "--pen-theme-inverse-surface": inverseSurface,
    "--pen-theme-on-inverse": pickThemeContrastColor(inverseSurface),
    "--pen-font-heading": resolvedTheme.fontHeading,
    "--pen-font-body": resolvedTheme.fontBody,
  };
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

const shouldApplyStoryTrackMotion = () => false;

const shouldApplyStoryCardHover = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "story") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  const name = getNodeNameToken(node);
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  return /(?:card|cards|grid|tile)/.test(name) && childCount > 0;
};

const shouldApplyStoryCardFloat = () => false;

const shouldApplyProductsCardHover = (node, sectionKindToken = "") => {
  if (sectionKindToken !== "products") return false;
  if (String(node?.type || "").trim().toLowerCase() !== "frame") return false;
  const name = getNodeNameToken(node);
  const childCount = Array.isArray(node?.children) ? node.children.length : 0;
  const borderToken = String(node?.style?.border || "").trim();
  const borderLike = /(?:^|\s)(?:\d+(?:\.\d+)?)px\s/.test(borderToken);
  return /(?:productcard|product-card|card|tile|panel)/.test(name) && childCount > 0 && borderLike;
};

const resolveThemeColorSlot = (rawColor, propName, node, parentNode, keyPath, sectionKindToken) => {
  const propToken = String(propName || "").trim().toLowerCase();
  const nodeName = getNodeNameToken(node);
  const parentName = getNodeNameToken(parentNode);
  const isRoot = keyPath === "root";
  const isTextProp = propToken === "color";
  const isBackgroundProp = propToken.includes("background");
  const isBorderProp = propToken.includes("border");
  const buttonLike =
    /(?:btn|button|cta|chip|pill|tag|badge)/.test(nodeName) ||
    /(?:btn|button|cta|chip|pill|tag|badge)/.test(parentName) ||
    /(?:quote|catalog|whatsapp|submit|send|buy|shop)/.test(nodeName);

  if (isRoot && isBackgroundProp) {
    if (sectionKindToken === "navigation" || sectionKindToken === "socialproof") return "bg";
    if (sectionKindToken === "footer") return "inverse-surface";
    if (sectionKindToken === "hero") return "primary";
    if (isThemeNeutralColor(rawColor)) return "bg";
    return isThemeDarkColor(rawColor) ? "primary" : "neutral";
  }

  if (isBackgroundProp) {
    if (buttonLike) return "accent";
    if (sectionKindToken === "footer") return "inverse-surface";
    if (sectionKindToken === "navigation") return "bg";
    if (isThemeNeutralColor(rawColor)) return "neutral";
    return isThemeDarkColor(rawColor) ? "primary" : "accent";
  }

  if (isTextProp) {
    if (buttonLike) return "on-accent";
    if (sectionKindToken === "footer") return "on-inverse";
    if (sectionKindToken === "hero" && !/label|caption|meta|legal/.test(nodeName)) return "on-primary";
    if (sectionKindToken === "navigation") {
      if (/logo/.test(nodeName)) return "text";
      return "text-secondary";
    }
    if (isThemeDarkColor(rawColor)) return "text";
    if (isThemeNeutralColor(rawColor)) return "text-secondary";
    return "on-primary";
  }

  if (isBorderProp) {
    if (buttonLike) return "accent";
    return "neutral";
  }

  return null;
};

const applyThemeToStyleValue = (rawValue, propName, node, parentNode, keyPath, sectionKindToken) => {
  if (typeof rawValue !== "string" || !/#(?:[0-9a-f]{3}|[0-9a-f]{6})/i.test(rawValue)) return rawValue;
  return rawValue.replace(/#(?:[0-9a-f]{3}|[0-9a-f]{6})/gi, (match) => {
    const slot = resolveThemeColorSlot(match, propName, node, parentNode, keyPath, sectionKindToken);
    if (!slot) return match;
    return `var(--pen-theme-${slot}, ${match})`;
  });
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

const resolveTextLineHeightMultiplier = (value) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 1.2;
};

const estimateAbsoluteTextNodeHeight = (node, merged) => {
  if (String(node?.type || "").trim().toLowerCase() !== "text") return 0;
  const textValue = String(merged?.[node?.textProp] ?? "").trim();
  if (!textValue) return 0;
  const width = Math.max(120, resolveNumericDimension(node?.style?.width) || 0);
  const fontSize = Math.max(14, resolveFontSize(node?.style?.fontSize) || 0);
  const lineHeightMultiplier = resolveTextLineHeightMultiplier(node?.style?.lineHeight);
  const approxCharsPerLine = Math.max(6, Math.floor(width / Math.max(7, fontSize * 0.58)));
  const countWrappedLines = (lineText) => {
    const words = String(lineText || "").split(/s+/).filter(Boolean);
    if (!words.length) return 1;
    let lines = 1;
    let current = words[0];
    for (let index = 1; index < words.length; index += 1) {
      const candidate = current + " " + words[index];
      if (candidate.length > approxCharsPerLine) {
        lines += 1;
        current = words[index];
      } else {
        current = candidate;
      }
    }
    const longestToken = words.reduce((max, token) => Math.max(max, token.length), 0);
    return Math.max(lines, Math.ceil(longestToken / approxCharsPerLine));
  };
  const lines = String(textValue)
    .split(/
+/)
    .reduce((total, lineText) => total + countWrappedLines(lineText), 0);
  return Math.max(fontSize * lineHeightMultiplier, lines * fontSize * lineHeightMultiplier);
};

const buildAbsoluteTextFlowAdjustments = (rootNode, merged, sectionKindToken) => {
  if (sectionKindToken !== "hero") {
    return {
      childTops: {},
      rootMinHeight: 0,
    };
  }
  const children = Array.isArray(rootNode?.children) ? rootNode.children : [];
  const positionedTextNodes = children
    .map((child, index) => ({
      child,
      index,
      top: resolveNumericDimension(child?.style?.top),
      left: resolveNumericDimension(child?.style?.left),
      width: resolveNumericDimension(child?.style?.width),
      fontSize: resolveFontSize(child?.style?.fontSize),
      isAbsolute: String(child?.style?.position || "").trim().toLowerCase() === "absolute",
      isText: String(child?.type || "").trim().toLowerCase() === "text",
    }))
    .filter((entry) => entry.isAbsolute && entry.isText && Number.isFinite(entry.top));
  if (positionedTextNodes.length < 2) {
    return {
      childTops: {},
      rootMinHeight: 0,
    };
  }
  const childTops = {};
  const laneBottoms = new Map();
  const baseRootHeight = resolveNumericDimension(rootNode?.style?.height);
  let maxBottom = baseRootHeight;
  positionedTextNodes
    .sort((left, right) => left.top - right.top || left.left - right.left || left.index - right.index)
    .forEach((entry) => {
      const laneKey = String(Math.round((entry.left || 0) / 24)) + ":" + String(Math.round((entry.width || 0) / 24));
      const previousBottom = Number(laneBottoms.get(laneKey) || entry.top);
      const adjustedTop = Math.max(entry.top, previousBottom);
      if (adjustedTop > entry.top && entry.child?.id) childTops[entry.child.id] = adjustedTop;
      const estimatedHeight = estimateAbsoluteTextNodeHeight(entry.child, merged);
      const gap = Math.max(18, Math.round((entry.fontSize || 16) * 0.45));
      const nextBottom = adjustedTop + estimatedHeight + gap;
      laneBottoms.set(laneKey, nextBottom);
      maxBottom = Math.max(maxBottom, nextBottom + 24);
    });
  return {
    childTops,
    rootMinHeight: Math.max(baseRootHeight, Math.ceil(maxBottom)),
  };
};

const buildNodeStyle = (
  node,
  merged,
  sectionMotion,
  sectionKindToken,
  keyPath,
  currentPathToken = "/",
  parentNode = null,
  childIndex = 0,
  layoutAdjustments = null
) => {
  const style = { ...(node?.style || {}) };
  for (const [styleKey, styleValue] of Object.entries(style)) {
    if (styleKey === "fontFamily" && typeof styleValue === "string" && styleValue.trim()) {
      style[styleKey] = isHeadingLikeTextNode(node)
        ? "var(--pen-font-heading, " + styleValue + ")"
        : "var(--pen-font-body, " + styleValue + ")";
      continue;
    }
    style[styleKey] = applyThemeToStyleValue(styleValue, styleKey, node, parentNode, keyPath, sectionKindToken);
  }
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
    const rootMinHeight = Number(layoutAdjustments?.rootMinHeight || 0);
    if (rootMinHeight > 0) {
      const currentHeight = resolveNumericDimension(style?.height);
      if (!(currentHeight > rootMinHeight)) {
        style.height = rootMinHeight;
      }
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
  if (node?.id && Object.prototype.hasOwnProperty.call(layoutAdjustments?.childTops || {}, node.id)) {
    style.top = Number(layoutAdjustments.childTops[node.id]);
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
  childIndex = 0,
  layoutAdjustments = null
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
    childIndex,
    layoutAdjustments
  );
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
            ancestorHasLink || shouldRenderLink,
            currentPathToken,
            node,
            index,
            layoutAdjustments
          )
        )
      : [])
  );
};

export default function TemplateExclusivePenSiteContactContactContactmainpenAlt3({ id, crumbtext, titletext, subtext, card1ttext, card1dtext, card2ttext, card2dtext, card3ttext, card3dtext, card4ttext, card4dtext, sectext, c1imgimagesrc, c1ttext, c1ltext, c2imgimagesrc, c2ttext, c2ltext, c3imgimagesrc, c3ttext, c3ltext, c4imgimagesrc, c4ttext, c4ltext, c5imgimagesrc, c5ttext, c5ltext, resttext, t1text, t2text, t3text, t4text, c6imgimagesrc, c6ttext, c6ltext, c7imgimagesrc, c7ttext, c7ltext, c8imgimagesrc, c8ttext, c8ltext, c9imgimagesrc, c9ttext, c9ltext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, crumbtext, titletext, subtext, card1ttext, card1dtext, card2ttext, card2dtext, card3ttext, card3dtext, card4ttext, card4dtext, sectext, c1imgimagesrc, c1ttext, c1ltext, c2imgimagesrc, c2ttext, c2ltext, c3imgimagesrc, c3ttext, c3ltext, c4imgimagesrc, c4ttext, c4ltext, c5imgimagesrc, c5ttext, c5ltext, resttext, t1text, t2text, t3text, t4text, c6imgimagesrc, c6ttext, c6ltext, c7imgimagesrc, c7ttext, c7ltext, c8imgimagesrc, c8ttext, c8ltext, c9imgimagesrc, c9ttext, c9ltext });
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
  const themeVars = buildThemeCssVars(merged?.theme);
  const layoutAdjustments = buildAbsoluteTextFlowAdjustments(SECTION_TREE, merged, sectionKindToken);
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
    renderNode(SECTION_TREE, merged, sectionMotion, sectionKindToken, "root", false, currentPathToken, null, 0, layoutAdjustments)
  );
}