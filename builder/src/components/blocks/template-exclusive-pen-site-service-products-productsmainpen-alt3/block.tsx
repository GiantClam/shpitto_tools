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
  "id": "InpIs",
  "name": "productsMain",
  "style": {
    "boxSizing": "border-box",
    "width": 1440,
    "height": 810,
    "background": "#ffffff",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "text",
      "id": "DiHuZ",
      "name": "tag",
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
        "top": 42
      },
      "children": [],
      "textProp": "tagtext"
    },
    {
      "type": "text",
      "id": "OCZls",
      "name": "title",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2e2e2e",
        "fontFamily": "Inter",
        "fontSize": 40,
        "fontWeight": "600",
        "width": 530,
        "position": "absolute",
        "left": 80,
        "top": 92
      },
      "children": [],
      "textProp": "titletext"
    },
    {
      "type": "text",
      "id": "lO31p",
      "name": "sub",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#6f6f6f",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "textAlign": "center",
        "width": 1280,
        "position": "absolute",
        "left": 80,
        "top": 132
      },
      "children": [],
      "textProp": "subtext"
    },
    {
      "type": "frame",
      "id": "nUymy",
      "name": "grid",
      "style": {
        "boxSizing": "border-box",
        "width": 1280,
        "height": 500,
        "background": "#ffffff",
        "position": "absolute",
        "overflow": "hidden",
        "left": 80,
        "top": 288
      },
      "children": [
        {
          "type": "frame",
          "id": "U4fCF",
          "name": "c1",
          "style": {
            "boxSizing": "border-box",
            "width": 406,
            "height": 230,
            "borderRadius": 6,
            "background": "#ffffff",
            "border": "1px solid #d9d9d9",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 0
          },
          "children": [
            {
              "type": "frame",
              "id": "A7nzE",
              "name": "i1",
              "style": {
                "boxSizing": "border-box",
                "width": 406,
                "height": 90,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 38
              },
              "children": [],
              "imageProp": "i1imagesrc"
            },
            {
              "type": "text",
              "id": "JZvGN",
              "name": "t1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2f2f2f",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "600",
                "width": 300,
                "position": "absolute",
                "left": 12,
                "top": 11
              },
              "children": [],
              "textProp": "t1text"
            },
            {
              "type": "text",
              "id": "ekcpP",
              "name": "d1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#666666",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "lineHeight": 1.25,
                "width": 382,
                "position": "absolute",
                "left": 12,
                "top": 140
              },
              "children": [],
              "textProp": "d1text"
            },
            {
              "type": "text",
              "id": "Dl00U",
              "name": "l1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#434343",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "width": 140,
                "position": "absolute",
                "left": 16,
                "top": 204
              },
              "children": [],
              "textProp": "l1text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "4hMkA",
          "name": "c2",
          "style": {
            "boxSizing": "border-box",
            "width": 406,
            "height": 230,
            "borderRadius": 6,
            "background": "#ffffff",
            "border": "1px solid #d9d9d9",
            "position": "absolute",
            "overflow": "hidden",
            "left": 437,
            "top": 0
          },
          "children": [
            {
              "type": "frame",
              "id": "ienKQ",
              "name": "i2",
              "style": {
                "boxSizing": "border-box",
                "width": 406,
                "height": 90,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 38
              },
              "children": [],
              "imageProp": "i2imagesrc"
            },
            {
              "type": "text",
              "id": "wmq9O",
              "name": "t2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2f2f2f",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "600",
                "width": 280,
                "position": "absolute",
                "left": 12,
                "top": 11
              },
              "children": [],
              "textProp": "t2text"
            },
            {
              "type": "text",
              "id": "wwlCF",
              "name": "d2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#666666",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "lineHeight": 1.25,
                "width": 382,
                "position": "absolute",
                "left": 12,
                "top": 140
              },
              "children": [],
              "textProp": "d2text"
            },
            {
              "type": "text",
              "id": "Avp0W",
              "name": "l2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#434343",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "width": 140,
                "position": "absolute",
                "left": 16,
                "top": 204
              },
              "children": [],
              "textProp": "l2text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "TVkYc",
          "name": "c3",
          "style": {
            "boxSizing": "border-box",
            "width": 406,
            "height": 230,
            "borderRadius": 6,
            "background": "#ffffff",
            "border": "1px solid #d9d9d9",
            "position": "absolute",
            "overflow": "hidden",
            "left": 874,
            "top": 0
          },
          "children": [
            {
              "type": "frame",
              "id": "zMJyd",
              "name": "i3",
              "style": {
                "boxSizing": "border-box",
                "width": 406,
                "height": 90,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 38
              },
              "children": [],
              "imageProp": "i3imagesrc"
            },
            {
              "type": "text",
              "id": "yVq3K",
              "name": "t3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2f2f2f",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "600",
                "width": 320,
                "position": "absolute",
                "left": 12,
                "top": 11
              },
              "children": [],
              "textProp": "t3text"
            },
            {
              "type": "text",
              "id": "854tR",
              "name": "d3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#666666",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "lineHeight": 1.25,
                "width": 382,
                "position": "absolute",
                "left": 12,
                "top": 140
              },
              "children": [],
              "textProp": "d3text"
            },
            {
              "type": "text",
              "id": "D2LoY",
              "name": "l3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#434343",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "width": 140,
                "position": "absolute",
                "left": 16,
                "top": 204
              },
              "children": [],
              "textProp": "l3text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "6xLfB",
          "name": "c4",
          "style": {
            "boxSizing": "border-box",
            "width": 406,
            "height": 230,
            "borderRadius": 6,
            "background": "#ffffff",
            "border": "1px solid #d9d9d9",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 254
          },
          "children": [
            {
              "type": "frame",
              "id": "kT01i",
              "name": "i4",
              "style": {
                "boxSizing": "border-box",
                "width": 406,
                "height": 90,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 38
              },
              "children": [],
              "imageProp": "i4imagesrc"
            },
            {
              "type": "text",
              "id": "ozZ7J",
              "name": "t4",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2f2f2f",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "600",
                "width": 300,
                "position": "absolute",
                "left": 12,
                "top": 11
              },
              "children": [],
              "textProp": "t4text"
            },
            {
              "type": "text",
              "id": "hhyYH",
              "name": "d4",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#666666",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "lineHeight": 1.25,
                "width": 382,
                "position": "absolute",
                "left": 12,
                "top": 140
              },
              "children": [],
              "textProp": "d4text"
            },
            {
              "type": "text",
              "id": "OvhI9",
              "name": "l4",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#434343",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "width": 140,
                "position": "absolute",
                "left": 16,
                "top": 204
              },
              "children": [],
              "textProp": "l4text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "mP8xZ",
          "name": "c5",
          "style": {
            "boxSizing": "border-box",
            "width": 406,
            "height": 230,
            "borderRadius": 6,
            "background": "#ffffff",
            "border": "1px solid #d9d9d9",
            "position": "absolute",
            "overflow": "hidden",
            "left": 437,
            "top": 254
          },
          "children": [
            {
              "type": "frame",
              "id": "wt4Ek",
              "name": "i5",
              "style": {
                "boxSizing": "border-box",
                "width": 406,
                "height": 90,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 38
              },
              "children": [],
              "imageProp": "i5imagesrc"
            },
            {
              "type": "text",
              "id": "onNTj",
              "name": "t5",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2f2f2f",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "600",
                "width": 280,
                "position": "absolute",
                "left": 12,
                "top": 11
              },
              "children": [],
              "textProp": "t5text"
            },
            {
              "type": "text",
              "id": "qYY8U",
              "name": "d5",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#666666",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "lineHeight": 1.25,
                "width": 382,
                "position": "absolute",
                "left": 12,
                "top": 140
              },
              "children": [],
              "textProp": "d5text"
            },
            {
              "type": "text",
              "id": "YbD8z",
              "name": "l5",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#434343",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "width": 140,
                "position": "absolute",
                "left": 16,
                "top": 204
              },
              "children": [],
              "textProp": "l5text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "fMIjM",
          "name": "c6",
          "style": {
            "boxSizing": "border-box",
            "width": 406,
            "height": 230,
            "borderRadius": 6,
            "background": "#ffffff",
            "border": "1px solid #d9d9d9",
            "position": "absolute",
            "overflow": "hidden",
            "left": 874,
            "top": 254
          },
          "children": [
            {
              "type": "frame",
              "id": "kW0ll",
              "name": "i6",
              "style": {
                "boxSizing": "border-box",
                "width": 406,
                "height": 90,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 38
              },
              "children": [],
              "imageProp": "i6imagesrc"
            },
            {
              "type": "text",
              "id": "9ErT0",
              "name": "t6",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2f2f2f",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "600",
                "width": 280,
                "position": "absolute",
                "left": 12,
                "top": 11
              },
              "children": [],
              "textProp": "t6text"
            },
            {
              "type": "text",
              "id": "09sD5",
              "name": "d6",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#666666",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "lineHeight": 1.25,
                "width": 382,
                "position": "absolute",
                "left": 12,
                "top": 140
              },
              "children": [],
              "textProp": "d6text"
            },
            {
              "type": "text",
              "id": "T433m",
              "name": "l6",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#434343",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "width": 140,
                "position": "absolute",
                "left": 16,
                "top": 204
              },
              "children": [],
              "textProp": "l6text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "U30tP",
          "name": "c7",
          "style": {
            "boxSizing": "border-box",
            "width": 406,
            "height": 230,
            "borderRadius": 6,
            "background": "#ffffff",
            "border": "1px solid #d9d9d9",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 530
          },
          "children": [
            {
              "type": "frame",
              "id": "PO6L3",
              "name": "i7",
              "style": {
                "boxSizing": "border-box",
                "width": 400,
                "height": 92,
                "background": "#f2f2f2",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": []
            },
            {
              "type": "text",
              "id": "y3nt5",
              "name": "t7",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2f2f2f",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "700",
                "width": 220,
                "position": "absolute",
                "left": 16,
                "top": 108
              },
              "children": [],
              "textProp": "t7text"
            },
            {
              "type": "text",
              "id": "jw74T",
              "name": "d7",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#666666",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "lineHeight": 1.25,
                "width": 374,
                "position": "absolute",
                "left": 16,
                "top": 132
              },
              "children": [],
              "textProp": "d7text"
            },
            {
              "type": "text",
              "id": "1HsLn",
              "name": "l7",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#434343",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "width": 140,
                "position": "absolute",
                "left": 16,
                "top": 204
              },
              "children": [],
              "textProp": "l7text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "MufLY",
          "name": "c8",
          "style": {
            "boxSizing": "border-box",
            "width": 406,
            "height": 230,
            "borderRadius": 6,
            "background": "#ffffff",
            "border": "1px solid #d9d9d9",
            "position": "absolute",
            "overflow": "hidden",
            "left": 437,
            "top": 530
          },
          "children": [
            {
              "type": "frame",
              "id": "hMwnX",
              "name": "i8",
              "style": {
                "boxSizing": "border-box",
                "width": 400,
                "height": 92,
                "background": "#f2f2f2",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": []
            },
            {
              "type": "text",
              "id": "k3FXN",
              "name": "t8",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2f2f2f",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "700",
                "width": 280,
                "position": "absolute",
                "left": 16,
                "top": 108
              },
              "children": [],
              "textProp": "t8text"
            },
            {
              "type": "text",
              "id": "0zlta",
              "name": "d8",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#666666",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "lineHeight": 1.25,
                "width": 374,
                "position": "absolute",
                "left": 16,
                "top": 132
              },
              "children": [],
              "textProp": "d8text"
            },
            {
              "type": "text",
              "id": "VfIKE",
              "name": "l8",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#434343",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "width": 140,
                "position": "absolute",
                "left": 16,
                "top": 204
              },
              "children": [],
              "textProp": "l8text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "vy6AQ",
          "name": "c9",
          "style": {
            "boxSizing": "border-box",
            "width": 406,
            "height": 230,
            "borderRadius": 6,
            "background": "#ffffff",
            "border": "1px solid #d9d9d9",
            "position": "absolute",
            "overflow": "hidden",
            "left": 874,
            "top": 530
          },
          "children": [
            {
              "type": "frame",
              "id": "IFvu8",
              "name": "i9",
              "style": {
                "boxSizing": "border-box",
                "width": 400,
                "height": 92,
                "background": "#f2f2f2",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": []
            },
            {
              "type": "text",
              "id": "VioUW",
              "name": "t9",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2f2f2f",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "700",
                "width": 280,
                "position": "absolute",
                "left": 16,
                "top": 108
              },
              "children": [],
              "textProp": "t9text"
            },
            {
              "type": "text",
              "id": "OGj4x",
              "name": "d9",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#666666",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "lineHeight": 1.25,
                "width": 374,
                "position": "absolute",
                "left": 16,
                "top": 132
              },
              "children": [],
              "textProp": "d9text"
            },
            {
              "type": "text",
              "id": "NCnGj",
              "name": "l9",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#434343",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "width": 140,
                "position": "absolute",
                "left": 16,
                "top": 204
              },
              "children": [],
              "textProp": "l9text"
            }
          ]
        }
      ]
    },
    {
      "type": "ellipse",
      "id": "jnkfl",
      "name": "dot1",
      "style": {
        "boxSizing": "border-box"
      },
      "children": []
    },
    {
      "type": "ellipse",
      "id": "1C8YY",
      "name": "dot2",
      "style": {
        "boxSizing": "border-box"
      },
      "children": []
    },
    {
      "type": "frame",
      "id": "3J8ZC",
      "name": "heroBtn",
      "style": {
        "boxSizing": "border-box",
        "width": 130,
        "height": 34,
        "borderRadius": 2,
        "background": "#f4c300",
        "position": "absolute",
        "overflow": "hidden",
        "left": 80,
        "top": 214
      },
      "children": [
        {
          "type": "text",
          "id": "Mh9xL",
          "name": "heroBtnTxt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1f1f1f",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "width": 100,
            "position": "absolute",
            "left": 18,
            "top": 10
          },
          "children": [],
          "textProp": "herobtntxttext"
        }
      ],
      "hrefProp": "herobtnhref"
    },
    {
      "type": "frame",
      "id": "JVMOG",
      "name": "heroImg",
      "style": {
        "boxSizing": "border-box",
        "width": 1280,
        "height": 170,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover",
        "position": "absolute",
        "left": 80,
        "top": 80
      },
      "children": [],
      "imageProp": "heroimgimagesrc"
    },
    {
      "type": "text",
      "id": "GJErP",
      "name": "secTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#333333",
        "fontFamily": "Inter",
        "fontSize": 32,
        "fontWeight": "500",
        "width": 640,
        "position": "absolute",
        "left": 80,
        "top": 360
      },
      "children": [],
      "textProp": "sectitletext"
    },
    {
      "type": "text",
      "id": "4UBAW",
      "name": "secDesc",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#6f6f6f",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "lineHeight": 1.35,
        "width": 1230,
        "position": "absolute",
        "left": 80,
        "top": 418
      },
      "children": [],
      "textProp": "secdesctext"
    },
    {
      "type": "text",
      "id": "sXiOI",
      "name": "ctaLink",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#767676",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "normal",
        "textAlign": "center",
        "width": 236,
        "position": "absolute",
        "left": 602,
        "top": 892
      },
      "children": [],
      "textProp": "ctalinktext"
    },
    {
      "type": "frame",
      "id": "HeZI6",
      "name": "heroPanel",
      "style": {
        "boxSizing": "border-box",
        "width": 420,
        "height": 170,
        "background": "#f2f2f2dd",
        "position": "absolute",
        "overflow": "hidden",
        "left": 80,
        "top": 80
      },
      "children": [
        {
          "type": "text",
          "id": "Nj4FS",
          "name": "heroTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#3a3a3a",
            "fontFamily": "Inter",
            "fontSize": 40,
            "fontWeight": "500",
            "width": 170,
            "position": "absolute",
            "left": 18,
            "top": 22
          },
          "children": [],
          "textProp": "herotitletext"
        },
        {
          "type": "text",
          "id": "Y4svH",
          "name": "heroDesc",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5f5f5f",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 360,
            "position": "absolute",
            "left": 18,
            "top": 76
          },
          "children": [],
          "textProp": "herodesctext"
        },
        {
          "type": "frame",
          "id": "KfNyF",
          "name": "heroBtn2",
          "style": {
            "boxSizing": "border-box",
            "width": 128,
            "height": 30,
            "borderRadius": 2,
            "background": "#f4c300",
            "position": "absolute",
            "overflow": "hidden",
            "left": 18,
            "top": 128
          },
          "children": [
            {
              "type": "text",
              "id": "HRMfW",
              "name": "heroBtnTxt2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1f1f1f",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "600",
                "width": 90,
                "position": "absolute",
                "left": 26,
                "top": 9
              },
              "children": [],
              "textProp": "herobtntxt2text"
            }
          ],
          "hrefProp": "herobtn2href"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "InpIs",
  "tagtext": "Services",
  "titletext": "Underground Mining\nTooling and Wear Solutions",
  "subtext": "With Kennametal tooling, you will run longer, cut faster and machine with greater precision. All Kennametal products are designed to face the most demanding conditions and protect your operation against downtime. Check out our latest offerings.",
  "i1imagesrc": "https://images.unsplash.com/photo-1738162837335-3745e5d16c09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTE0Mzl8&ixlib=rb-4.1.0&q=80&w=1080",
  "t1text": "Collaboration Space",
  "d1text": "Experience a new level of manufacturing with Kennametal's machine and process optimization services for your machining needs in one place.",
  "l1text": "View Categories  >",
  "i2imagesrc": "https://images.unsplash.com/photo-1764336312138-14a5368a6cd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTE0Mzl8&ixlib=rb-4.1.0&q=80&w=1080",
  "t2text": "Online Services",
  "d2text": "Kennametal's suite of digital tools makes it easier to do business with us. Explore advanced capabilities and increase your productivity at your facility.",
  "l2text": "View Categories  >",
  "i3imagesrc": "https://images.unsplash.com/photo-1639091824355-48221063de7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTE0NDB8&ixlib=rb-4.1.0&q=80&w=1080",
  "t3text": "Technical Support Service",
  "d3text": "Kennametal's Technical Support Service offers immediate and responsive application support to improve metal cutting challenges.",
  "l3text": "View Categories  >",
  "i4imagesrc": "https://images.unsplash.com/photo-1716703742196-9986679eb03f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTE0NzF8&ixlib=rb-4.1.0&q=80&w=1080",
  "t4text": "ToolBOSS Machines",
  "d4text": "Kennametal's ToolBOSS solutions drive smarter inventory control and accountability in facilities with secure vending and inventory capabilities.",
  "l4text": "View Categories  >",
  "i5imagesrc": "https://images.unsplash.com/photo-1537402006040-bb6fb35ef422?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTE0NzF8&ixlib=rb-4.1.0&q=80&w=1080",
  "t5text": "Carbide Recycling",
  "d5text": "Kennametal recycles hard scrap carbide by reclaiming cobalt. All it takes from us to get it started is your scrap carbide to us, and we can pay your carbide.",
  "l5text": "View Categories  >",
  "i6imagesrc": "https://images.unsplash.com/photo-1759159091728-e2c87b9d9315?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTE0NzJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "t6text": "Tool Reconditioning",
  "d6text": "Kennametal's expert reconditioning services offer a cost-effective option to restore your worn tools and bring them back to their original performance.",
  "l6text": "View Categories  >",
  "t7text": "KenCast™",
  "d7text": "We understand the importance of preserving your tooling. KenCast wear parts are proven in traditional abrasive abrasion and high impact applications.",
  "l7text": "View Categories  >",
  "t8text": "CLAN",
  "d8text": "Kennametal's cutting-edge tooling and CLAN are designed with engineering productivity and longevity in mind.",
  "l8text": "View Categories  >",
  "t9text": "Accessories",
  "d9text": "Dynamically engineered accessory solutions provide options and value where your operation needs productivity.",
  "l9text": "View Categories  >",
  "herobtnhref": "/contact",
  "herobtntxttext": "Contact an Expert",
  "heroimgimagesrc": "https://images.unsplash.com/photo-1697181775774-c87e11b0a521?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyOTEzNzR8&ixlib=rb-4.1.0&q=80&w=1080",
  "sectitletext": "Tooling solutions to let you dig deeper",
  "secdesctext": "At Kennametal, we continuously design and manufacture solutions for the harshest underground mining applications. Our wear solutions and advanced tooling systems are developed for continuous miner drums and longwall shearer drums, and include complete systems for crushers, conical picks and bits, radials, cutting systems, roof bits, drilling systems, KenCast, CLAN and accessories.",
  "ctalinktext": "Our skilled staff is ready to help.",
  "herotitletext": "Services",
  "herodesctext": "Kennametal offers a range of services to support our tooling solutions, from help choosing the right tool to restoring your tools and recycling scrap carbide.",
  "herobtn2href": "/contact",
  "herobtntxt2text": "Contact an Expert"
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

export default function TemplateExclusivePenSiteServiceProductsProductsmainpenAlt3({ id, tagtext, titletext, subtext, i1imagesrc, t1text, d1text, l1text, i2imagesrc, t2text, d2text, l2text, i3imagesrc, t3text, d3text, l3text, i4imagesrc, t4text, d4text, l4text, i5imagesrc, t5text, d5text, l5text, i6imagesrc, t6text, d6text, l6text, t7text, d7text, l7text, t8text, d8text, l8text, t9text, d9text, l9text, herobtnhref, herobtntxttext, heroimgimagesrc, sectitletext, secdesctext, ctalinktext, herotitletext, herodesctext, herobtn2href, herobtntxt2text, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, tagtext, titletext, subtext, i1imagesrc, t1text, d1text, l1text, i2imagesrc, t2text, d2text, l2text, i3imagesrc, t3text, d3text, l3text, i4imagesrc, t4text, d4text, l4text, i5imagesrc, t5text, d5text, l5text, i6imagesrc, t6text, d6text, l6text, t7text, d7text, l7text, t8text, d8text, l8text, t9text, d9text, l9text, herobtnhref, herobtntxttext, heroimgimagesrc, sectitletext, secdesctext, ctalinktext, herotitletext, herodesctext, herobtn2href, herobtntxt2text });
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