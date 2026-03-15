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

const SECTION_KIND = "story";
const SECTION_TREE = {
  "type": "frame",
  "id": "5jOQ4",
  "name": "BlogMain",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 36,
    "padding": "24px 92px 46px 92px",
    "width": "100%"
  },
  "children": [
    {
      "type": "frame",
      "id": "bjz85",
      "name": "feat1",
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
          "id": "U9Sgy",
          "name": "feat1Img",
          "style": {
            "boxSizing": "border-box",
            "width": 520,
            "height": 280,
            "borderRadius": 2,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [],
          "imageProp": "feat1imgimagesrc"
        },
        {
          "type": "frame",
          "id": "oYX3A",
          "name": "feat1Text",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "justifyContent": "center",
            "width": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "RghSP",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1E252D",
                "fontFamily": "Inter",
                "fontSize": 56,
                "fontWeight": "700",
                "lineHeight": 0.95,
                "width": 430
              },
              "children": [],
              "textProp": "rghsptext"
            },
            {
              "type": "text",
              "id": "fxt71",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A9198",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "fxt71text"
            },
            {
              "type": "text",
              "id": "85BRP",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#4F565E",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal",
                "width": 430
              },
              "children": [],
              "textProp": "brptext"
            },
            {
              "type": "frame",
              "id": "q2mQe",
              "name": "b1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 94,
                "height": 30,
                "borderRadius": 16,
                "border": "1px solid #8D9298"
              },
              "children": [
                {
                  "type": "text",
                  "id": "g8kS2",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2F353B",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "g8ks2text"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "ILrKz",
      "name": "feat2",
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
          "id": "LMkGF",
          "name": "feat2Text",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "justifyContent": "center",
            "width": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "2r6kW",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1E252D",
                "fontFamily": "Inter",
                "fontSize": 52,
                "fontWeight": "700",
                "lineHeight": 0.95,
                "width": 430
              },
              "children": [],
              "textProp": "r6kwtext"
            },
            {
              "type": "text",
              "id": "E7NtU",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A9198",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "normal"
              },
              "children": [],
              "textProp": "e7ntutext"
            },
            {
              "type": "text",
              "id": "b6akC",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#4F565E",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "normal",
                "width": 430
              },
              "children": [],
              "textProp": "b6akctext"
            },
            {
              "type": "frame",
              "id": "0uWI1",
              "name": "b2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 94,
                "height": 30,
                "borderRadius": 16,
                "border": "1px solid #8D9298"
              },
              "children": [
                {
                  "type": "text",
                  "id": "nTqg2",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2F353B",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "ntqg2text"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "c1vp1",
          "name": "feat2Img",
          "style": {
            "boxSizing": "border-box",
            "width": 520,
            "height": 280,
            "borderRadius": 2,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [],
          "imageProp": "feat2imgimagesrc"
        }
      ]
    },
    {
      "type": "frame",
      "id": "DexWC",
      "name": "PostGrid",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 22,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "flEGn",
          "name": "row1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 20,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "GvSMW",
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
                  "type": "frame",
                  "id": "E9k23",
                  "name": "img1",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 190,
                    "borderRadius": 2,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "img1imagesrc"
                },
                {
                  "type": "text",
                  "id": "LsaEe",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2B3138",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "lsaeetext"
                },
                {
                  "type": "text",
                  "id": "iMRB8",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7E858D",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "imrb8text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "rEunh",
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
                  "type": "frame",
                  "id": "P7WBt",
                  "name": "img2",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 190,
                    "borderRadius": 2,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "img2imagesrc"
                },
                {
                  "type": "text",
                  "id": "swIMT",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2B3138",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "swimttext"
                },
                {
                  "type": "text",
                  "id": "cRFQe",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7E858D",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "crfqetext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "3mKFM",
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
                  "type": "frame",
                  "id": "sqItX",
                  "name": "img3",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 190,
                    "borderRadius": 2,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "img3imagesrc"
                },
                {
                  "type": "text",
                  "id": "zW96N",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2B3138",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "zw96ntext"
                },
                {
                  "type": "text",
                  "id": "M28xT",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7E858D",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "m28xttext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "qkqAm",
          "name": "row2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 20,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "sYGbk",
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
                  "type": "frame",
                  "id": "LGuy5",
                  "name": "img4",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 190,
                    "borderRadius": 2,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "img4imagesrc"
                },
                {
                  "type": "text",
                  "id": "cT8LD",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2B3138",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "ct8ldtext"
                },
                {
                  "type": "text",
                  "id": "o9jVf",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7E858D",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "o9jvftext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "9FUJ8",
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
                  "type": "frame",
                  "id": "hYbmA",
                  "name": "img5",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 190,
                    "borderRadius": 2,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "img5imagesrc"
                },
                {
                  "type": "text",
                  "id": "6cJpx",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2B3138",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "cjpxtext"
                },
                {
                  "type": "text",
                  "id": "WAs8A",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7E858D",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "was8atext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "g3Z1f",
              "name": "c6",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "width": "100%"
              },
              "children": [
                {
                  "type": "frame",
                  "id": "3NuHi",
                  "name": "img6",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 190,
                    "borderRadius": 2,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "img6imagesrc"
                },
                {
                  "type": "text",
                  "id": "VUyNW",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2B3138",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "vuynwtext"
                },
                {
                  "type": "text",
                  "id": "WMZii",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7E858D",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "wmziitext"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "lzIE8",
      "name": "pager",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 14,
        "justifyContent": "center",
        "alignItems": "center",
        "width": "100%",
        "height": 30
      },
      "children": [
        {
          "type": "text",
          "id": "L3HUj",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#98A0A8",
            "fontFamily": "Inter",
            "fontSize": 10,
            "fontWeight": "600"
          },
          "children": [],
          "textProp": "l3hujtext"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "5jOQ4",
  "feat1imgimagesrc": "https://images.unsplash.com/photo-1594047686814-9f74e5c56ccd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMxMjA1NTh8&ixlib=rb-4.1.0&q=80&w=1080",
  "rghsptext": "Updates and\nlivestream",
  "fxt71text": "News | Feb 26 2026",
  "brptext": "We have a roundup of announcements and updates from this week.",
  "g8ks2text": "Read More",
  "r6kwtext": "Linux Gaming\nwith Framework",
  "e7ntutext": "News | Feb 26 2026",
  "b6akctext": "One of the most common questions we see is Linux support. Today we share progress and setup tips.",
  "ntqg2text": "Read More",
  "feat2imgimagesrc": "https://images.unsplash.com/photo-1673552408313-6ebe5a43ccd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMxMjA1NTl8&ixlib=rb-4.1.0&q=80&w=1080",
  "img1imagesrc": "https://images.unsplash.com/photo-1633078951287-d23cbd2c3b54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMxMjA1ODZ8&ixlib=rb-4.1.0&q=80&w=1080",
  "lsaeetext": "In stock on Framework Desktop and updates on the industry-wide silicon crunch",
  "imrb8text": "News | Dec 22 2025",
  "img2imagesrc": "https://images.unsplash.com/photo-1649190754785-ddb26686610f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMxMjA1ODd8&ixlib=rb-4.1.0&q=80&w=1080",
  "swimttext": "Memory and storage aftermarket stocks and options",
  "crfqetext": "News | Nov 12 2025",
  "img3imagesrc": "https://images.unsplash.com/photo-1611353286721-0a3d076f9efa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMxMjA1ODh8&ixlib=rb-4.1.0&q=80&w=1080",
  "zw96ntext": "More updates from Framework Laptop 16 in stock",
  "m28xttext": "News | Nov 10 2025",
  "img4imagesrc": "https://images.unsplash.com/photo-1770319810923-2944895fb5cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMxMjA2NDB8&ixlib=rb-4.1.0&q=80&w=1080",
  "ct8ldtext": "Framework sponsorships update",
  "o9jvftext": "News | Oct 14 2025",
  "img5imagesrc": "https://images.unsplash.com/photo-1746005718013-b24074afb701?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMxMjA2NDF8&ixlib=rb-4.1.0&q=80&w=1080",
  "cjpxtext": "Enabling a sustainable repair ecosystem",
  "was8atext": "Release | Sep 26 2025",
  "img6imagesrc": "https://images.unsplash.com/photo-1769085795297-b45cc8c92f5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMxMjA2NDJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "vuynwtext": "Introducing new Framework Laptop 16 with Ryzen 9",
  "wmziitext": "News | Aug 16 2025",
  "l3hujtext": "1 2 3 4 5 6 7 8 9 10 11"
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
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };
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

const BLOG_PAGE_SIZE = 4;

const slugifyArticleToken = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const resolveBlogCategory = (meta = "") => {
  const raw = String(meta || "").split("|")[0]?.trim().toLowerCase() || "news";
  if (raw.startsWith("release")) return "release";
  if (raw.startsWith("review")) return "reviews";
  if (raw.startsWith("environment")) return "environment";
  return "news";
};

const buildBlogHref = ({ article = "", category = "all", page = 1 } = {}) => {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  params.set("blogPage", String(Math.max(1, page)));
  if (article) params.set("article", slugifyArticleToken(article));
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
};

const buildFrameworkBlogPosts = (merged) => {
  const posts = [
    {
      title: merged.rghsptext,
      meta: merged.fxt71text,
      description: merged.brptext,
      imageSrc: merged.feat1imgimagesrc,
    },
    {
      title: merged.r6kwtext,
      meta: merged.e7ntutext,
      description: merged.b6akctext,
      imageSrc: merged.feat2imgimagesrc,
    },
    {
      title: merged.lsaeetext,
      meta: merged.imrb8text,
      imageSrc: merged.img1imagesrc,
    },
    {
      title: merged.swimttext,
      meta: merged.crfqetext,
      imageSrc: merged.img2imagesrc,
    },
    {
      title: merged.zw96ntext,
      meta: merged.m28xttext,
      imageSrc: merged.img3imagesrc,
    },
    {
      title: merged.ct8ldtext,
      meta: merged.o9jvftext,
      imageSrc: merged.img4imagesrc,
    },
    {
      title: merged.cjpxtext,
      meta: merged.was8atext,
      imageSrc: merged.img5imagesrc,
    },
    {
      title: merged.vuynwtext,
      meta: merged.wmziitext,
      imageSrc: merged.img6imagesrc,
    },
  ];

  return posts
    .map((post) => ({
      ...post,
      category: resolveBlogCategory(post.meta),
      href: buildBlogHref({ article: post.title, category: resolveBlogCategory(post.meta), page: 1 }),
    }))
    .filter((post) => post.title && post.imageSrc);
};

const renderBlogFeature = (post, reverse = false) => {
  const mediaStyle: React.CSSProperties = {
    width: "min(100%, 520px)",
    minHeight: 280,
    borderRadius: 2,
    backgroundImage: `url(${post.imageSrc})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    flex: "1 1 520px",
  };
  const textStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 14,
    flex: "1 1 360px",
    minWidth: 0,
  };
  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: reverse ? "row-reverse" : "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: 36,
    width: "100%",
  };

  return (
    <div style={wrapperStyle} key={post.href}>
      <a href={post.href} style={mediaStyle} aria-label={post.title} />
      <div style={textStyle}>
        <a
          href={post.href}
          style={{
            margin: 0,
            color: "#1E252D",
            fontFamily: "Inter",
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 0.95,
            textDecoration: "none",
            maxWidth: 440,
          }}
        >
          {post.title}
        </a>
        <div style={{ color: "#8A9198", fontFamily: "Inter", fontSize: 13 }}>{post.meta}</div>
        <div style={{ color: "#4F565E", fontFamily: "Inter", fontSize: 17, lineHeight: 1.55, maxWidth: 500 }}>
          {post.description}
        </div>
        <a
          href={post.href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 108,
            height: 34,
            borderRadius: 999,
            border: "1px solid #8D9298",
            color: "#2F353B",
            fontFamily: "Inter",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Read More
        </a>
      </div>
    </div>
  );
};

export default function TemplateExclusivePenSiteBlogStoryBlogmainpenAlt2({ id, feat1imgimagesrc, rghsptext, fxt71text, brptext, g8ks2text, r6kwtext, e7ntutext, b6akctext, ntqg2text, feat2imgimagesrc, img1imagesrc, lsaeetext, imrb8text, img2imagesrc, swimttext, crfqetext, img3imagesrc, zw96ntext, m28xttext, img4imagesrc, ct8ldtext, o9jvftext, img5imagesrc, cjpxtext, was8atext, img6imagesrc, vuynwtext, wmziitext, l3hujtext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, feat1imgimagesrc, rghsptext, fxt71text, brptext, g8ks2text, r6kwtext, e7ntutext, b6akctext, ntqg2text, feat2imgimagesrc, img1imagesrc, lsaeetext, imrb8text, img2imagesrc, swimttext, crfqetext, img3imagesrc, zw96ntext, m28xttext, img4imagesrc, ct8ldtext, o9jvftext, img5imagesrc, cjpxtext, was8atext, img6imagesrc, vuynwtext, wmziitext, l3hujtext });
  assignDefined(merged, rest);
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
  const currentCategory = String(searchParams?.get("category") || "all").trim().toLowerCase() || "all";
  const rawPage = Number.parseInt(String(searchParams?.get("blogPage") || "1"), 10);
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const allPosts = buildFrameworkBlogPosts(merged);
  const filteredPosts =
    currentCategory === "all" ? allPosts : allPosts.filter((post) => post.category === currentCategory);
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / BLOG_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * BLOG_PAGE_SIZE;
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + BLOG_PAGE_SIZE);
  const featuredPosts = visiblePosts.slice(0, 2);
  const gridPosts = visiblePosts.slice(2);

  return (
    <section id={merged.id || DEFAULT_PROPS.id} data-pen-section-kind={SECTION_KIND} className="w-full" style={layoutStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 36, width: "100%" }}>
        {featuredPosts.map((post, index) => renderBlogFeature(post, index % 2 === 1))}
        {gridPosts.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 22,
              width: "100%",
            }}
          >
            {gridPosts.map((post) => (
              <a
                key={post.href}
                href={post.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    minHeight: 190,
                    borderRadius: 2,
                    backgroundImage: `url(${post.imageSrc})`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                  }}
                />
                <div style={{ color: "#2B3138", fontFamily: "Inter", fontSize: 18, fontWeight: 700, lineHeight: 1.25 }}>
                  {post.title}
                </div>
                <div style={{ color: "#7E858D", fontFamily: "Inter", fontSize: 12 }}>{post.meta}</div>
              </a>
            ))}
          </div>
        ) : null}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            const href = buildBlogHref({ category: currentCategory, page });
            const isActive = page === safePage;
            return (
              <a
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                style={{
                  minWidth: 34,
                  height: 34,
                  padding: "0 10px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: isActive ? "1px solid #1E252D" : "1px solid #C8CDD3",
                  background: isActive ? "#1E252D" : "transparent",
                  color: isActive ? "#FFFFFF" : "#66707A",
                  textDecoration: "none",
                  fontFamily: "Inter",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {page}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
