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
  "id": "Pv50O",
  "name": "contactMain",
  "style": {
    "boxSizing": "border-box",
    "width": 1440,
    "height": 1350,
    "background": "#F3F3F2",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "frame",
      "id": "pazSb",
      "name": "leftFilters",
      "style": {
        "boxSizing": "border-box",
        "width": 180,
        "height": 220,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 24,
        "top": 40
      },
      "children": [
        {
          "type": "text",
          "id": "W14Mh",
          "name": "fltT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#606060",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "textProp": "fltttext"
        },
        {
          "type": "text",
          "id": "Q7foD",
          "name": "flt1",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 34
          },
          "children": [],
          "textProp": "flt1text"
        },
        {
          "type": "rectangle",
          "id": "PRURd",
          "name": "l1",
          "style": {
            "boxSizing": "border-box",
            "width": 150,
            "height": 1,
            "background": "#D6D6D6",
            "position": "absolute",
            "left": 0,
            "top": 58
          },
          "children": []
        },
        {
          "type": "text",
          "id": "d6w4L",
          "name": "flt2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 76
          },
          "children": [],
          "textProp": "flt2text"
        },
        {
          "type": "rectangle",
          "id": "qFtZb",
          "name": "l2",
          "style": {
            "boxSizing": "border-box",
            "width": 150,
            "height": 1,
            "background": "#D6D6D6",
            "position": "absolute",
            "left": 0,
            "top": 100
          },
          "children": []
        }
      ]
    },
    {
      "type": "frame",
      "id": "X646J",
      "name": "contactContent",
      "style": {
        "boxSizing": "border-box",
        "width": 1188,
        "height": 1310,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 220,
        "top": 40
      },
      "children": [
        {
          "type": "text",
          "id": "yDkmz",
          "name": "ctitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 50,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "textProp": "ctitletext"
        },
        {
          "type": "text",
          "id": "0Yksi",
          "name": "sub",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#202020",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 70
          },
          "children": [],
          "textProp": "subtext"
        },
        {
          "type": "rectangle",
          "id": "4hPCl",
          "name": "inp",
          "style": {
            "boxSizing": "border-box",
            "width": 270,
            "height": 30,
            "background": "#F9F9F9",
            "border": "1px solid #CFCFCF",
            "position": "absolute",
            "left": 0,
            "top": 106
          },
          "children": []
        },
        {
          "type": "text",
          "id": "MIRJN",
          "name": "inpTxt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#777777",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "500",
            "position": "absolute",
            "left": 12,
            "top": 114
          },
          "children": [],
          "textProp": "inptxttext"
        },
        {
          "type": "text",
          "id": "kINv3",
          "name": "sec1",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 494
          },
          "children": [],
          "textProp": "sec1text"
        },
        {
          "type": "text",
          "id": "cnGgL",
          "name": "sec2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 809
          },
          "children": [],
          "textProp": "sec2text"
        },
        {
          "type": "text",
          "id": "9CYbL",
          "name": "sec3",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 1028
          },
          "children": [],
          "textProp": "sec3text"
        },
        {
          "type": "frame",
          "id": "EypHA",
          "name": "r1",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 96,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 522
          },
          "children": [
            {
              "type": "text",
              "id": "Xgwbb",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 0,
                "top": 8
              },
              "children": [],
              "textProp": "xgwbbtext"
            },
            {
              "type": "text",
              "id": "zNciU",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5B5B5B",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 220,
                "position": "absolute",
                "left": 0,
                "top": 28
              },
              "children": [],
              "textProp": "znciutext"
            },
            {
              "type": "text",
              "id": "lyOJy",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 300,
                "top": 8
              },
              "children": [],
              "textProp": "lyojytext"
            },
            {
              "type": "text",
              "id": "wTvOu",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5B5B5B",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 220,
                "position": "absolute",
                "left": 300,
                "top": 28
              },
              "children": [],
              "textProp": "wtvoutext"
            },
            {
              "type": "text",
              "id": "rC8er",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 600,
                "top": 8
              },
              "children": [],
              "textProp": "rc8ertext"
            },
            {
              "type": "text",
              "id": "iyMkF",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6A6A6A",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.5,
                "width": 220,
                "position": "absolute",
                "left": 600,
                "top": 28
              },
              "children": [],
              "textProp": "iymkftext"
            },
            {
              "type": "text",
              "id": "nUtkb",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2B2B2B",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "700",
                "lineHeight": 1,
                "position": "absolute",
                "left": 960,
                "top": 34
              },
              "children": [],
              "textProp": "nutkbtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "09eQi",
          "name": "r2",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 96,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 632
          },
          "children": [
            {
              "type": "text",
              "id": "aFnGr",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 0,
                "top": 8
              },
              "children": [],
              "textProp": "afngrtext"
            },
            {
              "type": "text",
              "id": "Ja9oK",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5B5B5B",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 220,
                "position": "absolute",
                "left": 0,
                "top": 28
              },
              "children": [],
              "textProp": "ja9oktext"
            },
            {
              "type": "text",
              "id": "dgjgv",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 300,
                "top": 8
              },
              "children": [],
              "textProp": "dgjgvtext"
            },
            {
              "type": "text",
              "id": "4SDJ2",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5B5B5B",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 220,
                "position": "absolute",
                "left": 300,
                "top": 28
              },
              "children": [],
              "textProp": "sdj2text"
            },
            {
              "type": "text",
              "id": "VWuEn",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 600,
                "top": 8
              },
              "children": [],
              "textProp": "vwuentext"
            },
            {
              "type": "text",
              "id": "UvArx",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6A6A6A",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.5,
                "width": 220,
                "position": "absolute",
                "left": 600,
                "top": 28
              },
              "children": [],
              "textProp": "uvarxtext"
            },
            {
              "type": "text",
              "id": "W0uXc",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2B2B2B",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "700",
                "lineHeight": 1,
                "position": "absolute",
                "left": 960,
                "top": 34
              },
              "children": [],
              "textProp": "w0uxctext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "yqj5k",
          "name": "map",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 300,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 164
          },
          "children": [],
          "imageProp": "mapimagesrc"
        },
        {
          "type": "frame",
          "id": "YFuJs",
          "name": "r8",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 96,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 1074
          },
          "children": [
            {
              "type": "text",
              "id": "y570U",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 0,
                "top": 8
              },
              "children": [],
              "textProp": "y570utext"
            },
            {
              "type": "text",
              "id": "f1xyA",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5B5B5B",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 220,
                "position": "absolute",
                "left": 0,
                "top": 28
              },
              "children": [],
              "textProp": "f1xyatext"
            },
            {
              "type": "text",
              "id": "rNhoq",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 300,
                "top": 8
              },
              "children": [],
              "textProp": "rnhoqtext"
            },
            {
              "type": "text",
              "id": "nVCdd",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5B5B5B",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 220,
                "position": "absolute",
                "left": 300,
                "top": 28
              },
              "children": [],
              "textProp": "nvcddtext"
            },
            {
              "type": "text",
              "id": "I6XZb",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 600,
                "top": 8
              },
              "children": [],
              "textProp": "i6xzbtext"
            },
            {
              "type": "text",
              "id": "GPbQe",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6A6A6A",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.5,
                "width": 220,
                "position": "absolute",
                "left": 600,
                "top": 28
              },
              "children": [],
              "textProp": "gpbqetext"
            },
            {
              "type": "text",
              "id": "4nj0k",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2B2B2B",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "700",
                "lineHeight": 1,
                "position": "absolute",
                "left": 960,
                "top": 34
              },
              "children": [],
              "textProp": "nj0ktext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "xCknl",
          "name": "r9",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 96,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 1184
          },
          "children": [
            {
              "type": "text",
              "id": "JD9YT",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 0,
                "top": 8
              },
              "children": [],
              "textProp": "jd9yttext"
            },
            {
              "type": "text",
              "id": "fAoL5",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5B5B5B",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 220,
                "position": "absolute",
                "left": 0,
                "top": 28
              },
              "children": [],
              "textProp": "faol5text"
            },
            {
              "type": "text",
              "id": "6yGp4",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 300,
                "top": 8
              },
              "children": [],
              "textProp": "ygp4text"
            },
            {
              "type": "text",
              "id": "8oz2C",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5B5B5B",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 220,
                "position": "absolute",
                "left": 300,
                "top": 28
              },
              "children": [],
              "textProp": "oz2ctext"
            },
            {
              "type": "text",
              "id": "GyMuq",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 600,
                "top": 8
              },
              "children": [],
              "textProp": "gymuqtext"
            },
            {
              "type": "text",
              "id": "qgbj0",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6A6A6A",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.5,
                "width": 220,
                "position": "absolute",
                "left": 600,
                "top": 28
              },
              "children": [],
              "textProp": "qgbj0text"
            },
            {
              "type": "text",
              "id": "3w6Hw",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2B2B2B",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "700",
                "lineHeight": 1,
                "position": "absolute",
                "left": 960,
                "top": 34
              },
              "children": [],
              "textProp": "w6hwtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "Gsy1y",
          "name": "r10",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 96,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 854
          },
          "children": [
            {
              "type": "text",
              "id": "nQD5c",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 0,
                "top": 8
              },
              "children": [],
              "textProp": "nqd5ctext"
            },
            {
              "type": "text",
              "id": "5K92w",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5B5B5B",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 220,
                "position": "absolute",
                "left": 0,
                "top": 28
              },
              "children": [],
              "textProp": "k92wtext"
            },
            {
              "type": "text",
              "id": "CyU4u",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 300,
                "top": 8
              },
              "children": [],
              "textProp": "cyu4utext"
            },
            {
              "type": "text",
              "id": "sKoEd",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5B5B5B",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.45,
                "width": 220,
                "position": "absolute",
                "left": 300,
                "top": 28
              },
              "children": [],
              "textProp": "skoedtext"
            },
            {
              "type": "text",
              "id": "FrVby",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F1F1F",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "700",
                "position": "absolute",
                "left": 600,
                "top": 8
              },
              "children": [],
              "textProp": "frvbytext"
            },
            {
              "type": "text",
              "id": "iN5h4",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6A6A6A",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "500",
                "lineHeight": 1.5,
                "width": 220,
                "position": "absolute",
                "left": 600,
                "top": 28
              },
              "children": [],
              "textProp": "in5h4text"
            },
            {
              "type": "text",
              "id": "Zn40l",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2B2B2B",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "700",
                "lineHeight": 1,
                "position": "absolute",
                "left": 960,
                "top": 34
              },
              "children": [],
              "textProp": "zn40ltext"
            }
          ]
        },
        {
          "type": "rectangle",
          "id": "CgPWI",
          "name": "mapBd",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 300,
            "background": "#F7F7F7",
            "border": "1px solid #CFCFCF",
            "position": "absolute",
            "left": 0,
            "top": 164
          },
          "children": []
        },
        {
          "type": "rectangle",
          "id": "bZWcS",
          "name": "ln2",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 1,
            "background": "#E1E1E1",
            "position": "absolute",
            "left": 0,
            "top": 620
          },
          "children": []
        },
        {
          "type": "rectangle",
          "id": "yCarr",
          "name": "ln3",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 1,
            "background": "#E1E1E1",
            "position": "absolute",
            "left": 0,
            "top": 730
          },
          "children": []
        },
        {
          "type": "rectangle",
          "id": "rHsr4",
          "name": "ln4",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 1,
            "background": "#E1E1E1",
            "position": "absolute",
            "left": 0,
            "top": 840
          },
          "children": []
        },
        {
          "type": "rectangle",
          "id": "F1BYa",
          "name": "ln5",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 1,
            "background": "#E1E1E1",
            "position": "absolute",
            "left": 0,
            "top": 950
          },
          "children": []
        },
        {
          "type": "rectangle",
          "id": "4KeKC",
          "name": "ln6",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 1,
            "background": "#E1E1E1",
            "position": "absolute",
            "left": 0,
            "top": 1060
          },
          "children": []
        },
        {
          "type": "rectangle",
          "id": "sho0r",
          "name": "ln7",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 1,
            "background": "#E1E1E1",
            "position": "absolute",
            "left": 0,
            "top": 1170
          },
          "children": []
        },
        {
          "type": "rectangle",
          "id": "Ne7KH",
          "name": "ln8",
          "style": {
            "boxSizing": "border-box",
            "width": 1100,
            "height": 1,
            "background": "#E1E1E1",
            "position": "absolute",
            "left": 0,
            "top": 1280
          },
          "children": []
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "Pv50O",
  "fltttext": "按下列条件",
  "flt1text": "类型",
  "flt2text": "国家/地区",
  "ctitletext": "联系我们",
  "subtext": "查找离您最近的分销商和销售网络",
  "inptxttext": "按国家、城市、邮编搜索",
  "sec1text": "客户联系人",
  "sec2text": "经销商",
  "sec3text": "分销商",
  "xgwbbtext": "客户服务 上海",
  "znciutext": "联系电话\n400-820-2623\nservice@sandvik.com",
  "lyojytext": "销售支持 北京",
  "wtvoutext": "联系电话\n010-88886666\nchina@sandvik.com",
  "rc8ertext": "济南",
  "iymkftext": "📍 地址信息\n☎ 电话\n✉ 邮件",
  "nutkbtext": "sandvik\ncoromant",
  "afngrtext": "客户服务 上海",
  "ja9oktext": "联系电话\n400-820-2623\nservice@sandvik.com",
  "dgjgvtext": "销售支持 北京",
  "sdj2text": "联系电话\n010-88886666\nchina@sandvik.com",
  "vwuentext": "济南",
  "uvarxtext": "📍 地址信息\n☎ 电话\n✉ 邮件",
  "w0uxctext": "sandvik\ncoromant",
  "mapimagesrc": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/China_administrative_blank_map.svg/1280px-China_administrative_blank_map.svg.png",
  "y570utext": "客户服务 上海",
  "f1xyatext": "联系电话\n400-820-2623\nservice@sandvik.com",
  "rnhoqtext": "销售支持 北京",
  "nvcddtext": "联系电话\n010-88886666\nchina@sandvik.com",
  "i6xzbtext": "济南",
  "gpbqetext": "📍 地址信息\n☎ 电话\n✉ 邮件",
  "nj0ktext": "sandvik\ncoromant",
  "jd9yttext": "客户服务 上海",
  "faol5text": "联系电话\n400-820-2623\nservice@sandvik.com",
  "ygp4text": "销售支持 北京",
  "oz2ctext": "联系电话\n010-88886666\nchina@sandvik.com",
  "gymuqtext": "济南",
  "qgbj0text": "📍 地址信息\n☎ 电话\n✉ 邮件",
  "w6hwtext": "sandvik\ncoromant",
  "nqd5ctext": "客户服务 上海",
  "k92wtext": "联系电话\n400-820-2623\nservice@sandvik.com",
  "cyu4utext": "销售支持 北京",
  "skoedtext": "联系电话\n010-88886666\nchina@sandvik.com",
  "frvbytext": "济南",
  "in5h4text": "📍 地址信息\n☎ 电话\n✉ 邮件",
  "zn40ltext": "sandvik\ncoromant"
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
    "bg": "#F3F3F2",
    "text": "#FFFFFF",
    "primary": "#F3F3F2",
    "accent": "#F3F3F2",
    "neutral": "#E5E7EB",
    "textSecondary": "#4B5563"
  },
  "primaryColor": "#F3F3F2",
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

export default function TemplateExclusivePenSiteSandvikContactContactContactmainpenAlt3({ id, fltttext, flt1text, flt2text, ctitletext, subtext, inptxttext, sec1text, sec2text, sec3text, xgwbbtext, znciutext, lyojytext, wtvoutext, rc8ertext, iymkftext, nutkbtext, afngrtext, ja9oktext, dgjgvtext, sdj2text, vwuentext, uvarxtext, w0uxctext, mapimagesrc, y570utext, f1xyatext, rnhoqtext, nvcddtext, i6xzbtext, gpbqetext, nj0ktext, jd9yttext, faol5text, ygp4text, oz2ctext, gymuqtext, qgbj0text, w6hwtext, nqd5ctext, k92wtext, cyu4utext, skoedtext, frvbytext, in5h4text, zn40ltext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, fltttext, flt1text, flt2text, ctitletext, subtext, inptxttext, sec1text, sec2text, sec3text, xgwbbtext, znciutext, lyojytext, wtvoutext, rc8ertext, iymkftext, nutkbtext, afngrtext, ja9oktext, dgjgvtext, sdj2text, vwuentext, uvarxtext, w0uxctext, mapimagesrc, y570utext, f1xyatext, rnhoqtext, nvcddtext, i6xzbtext, gpbqetext, nj0ktext, jd9yttext, faol5text, ygp4text, oz2ctext, gymuqtext, qgbj0text, w6hwtext, nqd5ctext, k92wtext, cyu4utext, skoedtext, frvbytext, in5h4text, zn40ltext });
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