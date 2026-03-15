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

const SECTION_KIND = "products";
const SECTION_TREE = {
  "type": "frame",
  "id": "YR5zB",
  "name": "productsMain",
  "style": {
    "boxSizing": "border-box",
    "width": 1440,
    "height": 1336,
    "background": "#ffffff",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "frame",
      "id": "S7o9R",
      "name": "p1Img",
      "style": {
        "boxSizing": "border-box",
        "width": 560,
        "height": 320,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover",
        "position": "absolute",
        "left": 76,
        "top": 120,
        "boxShadow": "0px 14px 34px #0F172A33"
      },
      "children": [],
      "imageProp": "p1imgimagesrc"
    },
    {
      "type": "frame",
      "id": "V1Suo",
      "name": "p1Card",
      "style": {
        "boxSizing": "border-box",
        "width": 760,
        "height": 250,
        "background": "#F5F6F8",
        "position": "absolute",
        "overflow": "hidden",
        "left": 556,
        "top": 150,
        "boxShadow": "0px 16px 40px #0F172A1F"
      },
      "children": [
        {
          "type": "icon_font",
          "id": "0sxHz",
          "name": "p1icon",
          "style": {
            "boxSizing": "border-box",
            "color": "#2F456C",
            "width": 28,
            "height": 28,
            "display": "inline-flex",
            "alignItems": "center",
            "justifyContent": "center",
            "flexShrink": 0,
            "fontSize": 28,
            "position": "absolute",
            "left": 64,
            "top": 48
          },
          "children": [],
          "iconGlyph": "broadcast"
        },
        {
          "type": "text",
          "id": "fyeBl",
          "name": "p1title",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2937",
            "fontFamily": "Inter",
            "fontSize": 34,
            "fontWeight": "500",
            "position": "absolute",
            "left": 100,
            "top": 48
          },
          "children": [],
          "textProp": "p1titletext"
        },
        {
          "type": "text",
          "id": "3dyfL",
          "name": "p1desc",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5B6472",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "500",
            "lineHeight": 1.5,
            "width": 620,
            "position": "absolute",
            "left": 64,
            "top": 94
          },
          "children": [],
          "textProp": "p1desctext"
        },
        {
          "type": "rectangle",
          "id": "qlrET",
          "name": "p1btn",
          "style": {
            "boxSizing": "border-box",
            "width": 148,
            "height": 34,
            "borderRadius": 2,
            "background": "#EEF2F7",
            "border": "1px solid #8AA3D3",
            "position": "absolute",
            "left": 64,
            "top": 184
          },
          "children": [],
          "hrefProp": "p1btnhref"
        },
        {
          "type": "text",
          "id": "CooLa",
          "name": "p1btnT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2E446D",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 82,
            "top": 194
          },
          "children": [],
          "textProp": "p1btnttext",
          "hrefProp": "p1btnthref"
        },
        {
          "type": "text",
          "id": "7gfsQ",
          "name": "p1cat",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5E81C5",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "700",
            "letterSpacing": 0.8,
            "position": "absolute",
            "left": 64,
            "top": 20
          },
          "children": [],
          "textProp": "p1cattext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "ag2Vy",
      "name": "p2Card",
      "style": {
        "boxSizing": "border-box",
        "width": 760,
        "height": 250,
        "background": "#F5F6F8",
        "position": "absolute",
        "overflow": "hidden",
        "left": 84,
        "top": 550,
        "boxShadow": "0px 16px 40px #0F172A1F"
      },
      "children": [
        {
          "type": "icon_font",
          "id": "kHTVA",
          "name": "p2icon",
          "style": {
            "boxSizing": "border-box",
            "color": "#2F456C",
            "width": 28,
            "height": 28,
            "display": "inline-flex",
            "alignItems": "center",
            "justifyContent": "center",
            "flexShrink": 0,
            "fontSize": 28,
            "position": "absolute",
            "left": 64,
            "top": 48
          },
          "children": [],
          "iconGlyph": "broadcast"
        },
        {
          "type": "text",
          "id": "ERTSF",
          "name": "p2title",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2937",
            "fontFamily": "Inter",
            "fontSize": 34,
            "fontWeight": "500",
            "position": "absolute",
            "left": 100,
            "top": 48
          },
          "children": [],
          "textProp": "p2titletext"
        },
        {
          "type": "text",
          "id": "aWEWx",
          "name": "p2desc",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5B6472",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "500",
            "lineHeight": 1.5,
            "width": 466,
            "position": "absolute",
            "left": 64,
            "top": 94
          },
          "children": [],
          "textProp": "p2desctext"
        },
        {
          "type": "rectangle",
          "id": "MxUSk",
          "name": "p2btn",
          "style": {
            "boxSizing": "border-box",
            "width": 166,
            "height": 34,
            "borderRadius": 2,
            "background": "#EEF2F7",
            "border": "1px solid #8AA3D3",
            "position": "absolute",
            "left": 64,
            "top": 184
          },
          "children": [],
          "hrefProp": "p2btnhref"
        },
        {
          "type": "text",
          "id": "JkkuX",
          "name": "p2btnT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2E446D",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 82,
            "top": 194
          },
          "children": [],
          "textProp": "p2btnttext",
          "hrefProp": "p2btnthref"
        },
        {
          "type": "text",
          "id": "b2Nsu",
          "name": "p2cat",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5E81C5",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "700",
            "letterSpacing": 0.8,
            "position": "absolute",
            "left": 64,
            "top": 20
          },
          "children": [],
          "textProp": "p2cattext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "F52EC",
      "name": "p2Img",
      "style": {
        "boxSizing": "border-box",
        "width": 688,
        "height": 330,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover",
        "position": "absolute",
        "left": 636,
        "top": 506,
        "boxShadow": "0px 14px 34px #0F172A33"
      },
      "children": [],
      "imageProp": "p2imgimagesrc"
    },
    {
      "type": "frame",
      "id": "UqfS8",
      "name": "p3Img",
      "style": {
        "boxSizing": "border-box",
        "width": 560,
        "height": 320,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover",
        "position": "absolute",
        "left": 76,
        "top": 948,
        "boxShadow": "0px 14px 34px #0F172A33"
      },
      "children": [],
      "imageProp": "p3imgimagesrc"
    },
    {
      "type": "frame",
      "id": "W7JMy",
      "name": "p3Card",
      "style": {
        "boxSizing": "border-box",
        "width": 760,
        "height": 250,
        "background": "#F5F6F8",
        "position": "absolute",
        "overflow": "hidden",
        "left": 556,
        "top": 980,
        "boxShadow": "0px 16px 40px #0F172A1F"
      },
      "children": [
        {
          "type": "text",
          "id": "1tInt",
          "name": "p3cat",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5E81C5",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "700",
            "letterSpacing": 0.8,
            "position": "absolute",
            "left": 64,
            "top": 20
          },
          "children": [],
          "textProp": "p3cattext"
        },
        {
          "type": "icon_font",
          "id": "8Qx3J",
          "name": "p3icon",
          "style": {
            "boxSizing": "border-box",
            "color": "#2F456C",
            "width": 28,
            "height": 28,
            "display": "inline-flex",
            "alignItems": "center",
            "justifyContent": "center",
            "flexShrink": 0,
            "fontSize": 28,
            "position": "absolute",
            "left": 64,
            "top": 48
          },
          "children": [],
          "iconGlyph": "broadcast"
        },
        {
          "type": "text",
          "id": "V5FyV",
          "name": "p3title",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2937",
            "fontFamily": "Inter",
            "fontSize": 34,
            "fontWeight": "500",
            "position": "absolute",
            "left": 100,
            "top": 48
          },
          "children": [],
          "textProp": "p3titletext"
        },
        {
          "type": "text",
          "id": "XxJzG",
          "name": "p3desc",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5B6472",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "500",
            "lineHeight": 1.5,
            "width": 620,
            "position": "absolute",
            "left": 64,
            "top": 94
          },
          "children": [],
          "textProp": "p3desctext"
        },
        {
          "type": "rectangle",
          "id": "ZXr36",
          "name": "p3btn",
          "style": {
            "boxSizing": "border-box",
            "width": 162,
            "height": 34,
            "borderRadius": 2,
            "background": "#EEF2F7",
            "border": "1px solid #8AA3D3",
            "position": "absolute",
            "left": 64,
            "top": 184
          },
          "children": [],
          "hrefProp": "p3btnhref"
        },
        {
          "type": "text",
          "id": "XCVKK",
          "name": "p3btnT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2E446D",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 82,
            "top": 194
          },
          "children": [],
          "textProp": "p3btnttext",
          "hrefProp": "p3btnthref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "YTNlj",
      "name": "accessoriesSection",
      "style": {
        "boxSizing": "border-box",
        "width": 1440,
        "height": 790,
        "background": "#ffffffff",
        "position": "absolute",
        "overflow": "hidden",
        "left": 0,
        "top": 1336
      },
      "children": [
        {
          "type": "frame",
          "id": "ysqOE",
          "name": "accLeft",
          "style": {
            "boxSizing": "border-box",
            "width": 500,
            "height": 820,
            "position": "absolute",
            "overflow": "hidden",
            "left": 38,
            "top": 0
          },
          "children": [
            {
              "type": "text",
              "id": "aStuc",
              "name": "accTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#101828",
                "fontFamily": "Inter",
                "fontSize": 54,
                "width": 551,
                "position": "absolute",
                "left": 0,
                "top": 92
              },
              "children": [],
              "textProp": "acctitletext"
            },
            {
              "type": "rectangle",
              "id": "Q7GlL",
              "name": "accBtn",
              "style": {
                "boxSizing": "border-box",
                "width": 120,
                "height": 36,
                "borderRadius": 5,
                "background": "#F6F8FC",
                "border": "1px solid #85A5D8",
                "position": "absolute",
                "left": 0,
                "top": 250
              },
              "children": [],
              "hrefProp": "accbtnhref"
            },
            {
              "type": "text",
              "id": "oy4DA",
              "name": "accBtnText",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F2937",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "500",
                "position": "absolute",
                "left": 15,
                "top": 260
              },
              "children": [],
              "textProp": "accbtntexttext",
              "hrefProp": "accbtntexthref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "Ig6RC",
          "name": "accRight",
          "style": {
            "boxSizing": "border-box",
            "width": 748,
            "height": 740,
            "position": "absolute",
            "overflow": "hidden",
            "left": 626,
            "top": 40
          },
          "children": [
            {
              "type": "frame",
              "id": "BEmYf",
              "name": "accRow1",
              "style": {
                "boxSizing": "border-box",
                "width": 748,
                "height": 210,
                "position": "absolute",
                "overflow": "hidden",
                "left": 0,
                "top": 0
              },
              "children": [
                {
                  "type": "frame",
                  "id": "sEm3D",
                  "name": "acc1Img",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 210,
                    "height": 178,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover",
                    "position": "absolute",
                    "left": 0,
                    "top": 8
                  },
                  "children": [],
                  "imageProp": "acc1imgimagesrc"
                },
                {
                  "type": "text",
                  "id": "pNttF",
                  "name": "acc1Title",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#101828",
                    "fontFamily": "Inter",
                    "fontSize": 22,
                    "fontWeight": "500",
                    "position": "absolute",
                    "left": 250,
                    "top": 8
                  },
                  "children": [],
                  "textProp": "acc1titletext"
                },
                {
                  "type": "text",
                  "id": "QMGm1",
                  "name": "acc1Desc",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#374151",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "lineHeight": 1.45,
                    "width": 488,
                    "position": "absolute",
                    "left": 250,
                    "top": 64
                  },
                  "children": [],
                  "textProp": "acc1desctext"
                }
              ]
            },
            {
              "type": "line",
              "id": "knLdU",
              "name": "accLine1",
              "style": {
                "boxSizing": "border-box"
              },
              "children": []
            },
            {
              "type": "frame",
              "id": "zgOnd",
              "name": "accRow2",
              "style": {
                "boxSizing": "border-box",
                "width": 748,
                "height": 210,
                "position": "absolute",
                "overflow": "hidden",
                "left": 0,
                "top": 252
              },
              "children": [
                {
                  "type": "frame",
                  "id": "yrvQy",
                  "name": "acc2Img",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 210,
                    "height": 178,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover",
                    "position": "absolute",
                    "left": 0,
                    "top": 8
                  },
                  "children": [],
                  "imageProp": "acc2imgimagesrc"
                },
                {
                  "type": "text",
                  "id": "ajAGM",
                  "name": "acc2Title",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#101828",
                    "fontFamily": "Inter",
                    "fontSize": 22,
                    "fontWeight": "500",
                    "position": "absolute",
                    "left": 250,
                    "top": 8
                  },
                  "children": [],
                  "textProp": "acc2titletext"
                },
                {
                  "type": "text",
                  "id": "DTrTa",
                  "name": "acc2Desc",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#374151",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "lineHeight": 1.45,
                    "width": 488,
                    "position": "absolute",
                    "left": 250,
                    "top": 64
                  },
                  "children": [],
                  "textProp": "acc2desctext"
                }
              ]
            },
            {
              "type": "line",
              "id": "8BMxI",
              "name": "accLine2",
              "style": {
                "boxSizing": "border-box"
              },
              "children": []
            },
            {
              "type": "frame",
              "id": "yky8p",
              "name": "accRow3",
              "style": {
                "boxSizing": "border-box",
                "width": 748,
                "height": 210,
                "position": "absolute",
                "overflow": "hidden",
                "left": 0,
                "top": 504
              },
              "children": [
                {
                  "type": "frame",
                  "id": "z8GyS",
                  "name": "acc3Img",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 210,
                    "height": 178,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover",
                    "position": "absolute",
                    "left": 0,
                    "top": 8
                  },
                  "children": [],
                  "imageProp": "acc3imgimagesrc"
                },
                {
                  "type": "text",
                  "id": "aATt0",
                  "name": "acc3Title",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#101828",
                    "fontFamily": "Inter",
                    "fontSize": 22,
                    "fontWeight": "500",
                    "position": "absolute",
                    "left": 250,
                    "top": 8
                  },
                  "children": [],
                  "textProp": "acc3titletext"
                },
                {
                  "type": "text",
                  "id": "X6aEC",
                  "name": "acc3Desc",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#374151",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "lineHeight": 1.45,
                    "width": 488,
                    "position": "absolute",
                    "left": 250,
                    "top": 64
                  },
                  "children": [],
                  "textProp": "acc3desctext"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "YR5zB",
  "p1imgimagesrc": "https://images.unsplash.com/photo-1521540216272-a50305cd4421?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHNlYXJjaHwxfHx0YWN0aWNhbCUyMHZlaGljbGV8ZW58MHx8fHwxNzczMjcyMTA4fDA&ixlib=rb-4.1.0&q=80&w=1600",
  "p1titletext": "OSPREY.",
  "p1desctext": "The Kymeta Osprey is all-purpose defense and government operation with resilient, integrated, and always-connected communications-on-the-move capabilities.",
  "p1btnhref": "/",
  "p1btnttext": "Explore the Osprey u8",
  "p1btnthref": "/",
  "p1cattext": "MILITARY & GOVERNMENT",
  "p2titletext": "GOSHAWK.",
  "p2desctext": "Able to switch dynamically between LEO, GEO and cellular networks, this turnkey satellite user terminal offers enterprise uptime, robust and durable hardware suitable for security and intelligence agencies.",
  "p2btnhref": "/",
  "p2btnttext": "Discover the Goshawk u8",
  "p2btnthref": "/",
  "p2cattext": "MILITARY & GOVERNMENT",
  "p2imgimagesrc": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHNlYXJjaHwxfHxyb2FkJTIwdHJ1Y2t8ZW58MHx8fHwxNzczMjcyMTI3fDA&ixlib=rb-4.1.0&q=80&w=1600",
  "p3imgimagesrc": "https://images.unsplash.com/photo-1509391366360-2e959784a276?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHNlYXJjaHwxfHxzYXRlbGxpdGUlMjBkaXNofGVufDB8fHx8MTc3MzI3MjE0M3ww&ixlib=rb-4.1.0&q=80&w=1600",
  "p3cattext": "LAND CONNECTIVITY",
  "p3titletext": "PEREGRINE.",
  "p3desctext": "Stay connected even in rough conditions on the open ocean. Instant waterway, or more flow. The Peregrine u8 seamlessly integrates with your vessel's IT infrastructure.",
  "p3btnhref": "/",
  "p3btnttext": "More about Peregrine u8",
  "p3btnthref": "/about",
  "acctitletext": "Popular accessories",
  "accbtnhref": "/",
  "accbtntexttext": "All Accessories",
  "accbtntexthref": "/",
  "acc1imgimagesrc": "https://images.unsplash.com/photo-1552331110-899d3be50233?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMTk0Mjd8&ixlib=rb-4.1.0&q=80&w=1080",
  "acc1titletext": "Transport Cases",
  "acc1desctext": "Hard-shell cases with tie-down points safely and securely transport terminal systems. Rugged construction ensures reliable protection during transport.",
  "acc2imgimagesrc": "https://images.unsplash.com/photo-1665865455078-4f9f8e2259db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMTk0Mjh8&ixlib=rb-4.1.0&q=80&w=1080",
  "acc2titletext": "Mounting Systems",
  "acc2desctext": "Mounting systems attach terminal hardware to poles, roof racks, and marine vessels so equipment is secured for stationary or on-the-move operation.",
  "acc3imgimagesrc": "https://images.unsplash.com/photo-1742188251966-29e76e721c7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMTk0Mjl8&ixlib=rb-4.1.0&q=80&w=1080",
  "acc3titletext": "Power Supplies",
  "acc3desctext": "AC and DC power kits include everything needed to connect terminal systems to vehicle or building power infrastructure."
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
    "bg": "#FFFFFF",
    "text": "#FFFFFF",
    "primary": "#4F77FF",
    "accent": "#4F77FF",
    "neutral": "#E5E7EB",
    "textSecondary": "#4B5563"
  },
  "primaryColor": "#4F77FF",
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
const NAV_ACTIVE_COLOR = "var(--pen-theme-text, #2E446D)";
const NAV_INACTIVE_COLOR = "var(--pen-theme-text-secondary, #1F2937)";
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
            index
          )
        )
      : [])
  );
};

export default function TemplateExclusivePenSiteProductsProductsProductsmainpenAlt5({ id, p1imgimagesrc, p1titletext, p1desctext, p1btnhref, p1btnttext, p1btnthref, p1cattext, p2titletext, p2desctext, p2btnhref, p2btnttext, p2btnthref, p2cattext, p2imgimagesrc, p3imgimagesrc, p3cattext, p3titletext, p3desctext, p3btnhref, p3btnttext, p3btnthref, acctitletext, accbtnhref, accbtntexttext, accbtntexthref, acc1imgimagesrc, acc1titletext, acc1desctext, acc2imgimagesrc, acc2titletext, acc2desctext, acc3imgimagesrc, acc3titletext, acc3desctext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, p1imgimagesrc, p1titletext, p1desctext, p1btnhref, p1btnttext, p1btnthref, p1cattext, p2titletext, p2desctext, p2btnhref, p2btnttext, p2btnthref, p2cattext, p2imgimagesrc, p3imgimagesrc, p3cattext, p3titletext, p3desctext, p3btnhref, p3btnttext, p3btnthref, acctitletext, accbtnhref, accbtntexttext, accbtntexthref, acc1imgimagesrc, acc1titletext, acc1desctext, acc2imgimagesrc, acc2titletext, acc2desctext, acc3imgimagesrc, acc3titletext, acc3desctext });
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