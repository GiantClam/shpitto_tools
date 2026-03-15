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

const SECTION_KIND = "approach";
const SECTION_TREE = {
  "type": "frame",
  "id": "beG82",
  "name": "main",
  "style": {
    "boxSizing": "border-box",
    "width": 1440,
    "height": 1650,
    "background": "#ECEDEE",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "text",
      "id": "bKMhU",
      "name": "secTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2A313C",
        "fontFamily": "Inter",
        "fontSize": 54,
        "fontWeight": "500",
        "position": "absolute",
        "left": 431,
        "top": 106
      },
      "children": [],
      "textProp": "sectitletext"
    },
    {
      "type": "frame",
      "id": "kgeM6",
      "name": "secC1",
      "style": {
        "boxSizing": "border-box",
        "width": 664,
        "height": 300,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover",
        "position": "absolute",
        "left": 56,
        "top": 340
      },
      "children": [],
      "imageProp": "secc1imagesrc"
    },
    {
      "type": "text",
      "id": "plfL7",
      "name": "secC1T",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#5B6472",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "lineHeight": 1.45,
        "width": 635,
        "position": "absolute",
        "left": 56,
        "top": 690
      },
      "children": [],
      "textProp": "secc1ttext"
    },
    {
      "type": "frame",
      "id": "xjiGA",
      "name": "secC2",
      "style": {
        "boxSizing": "border-box",
        "width": 664,
        "height": 300,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover",
        "position": "absolute",
        "left": 720,
        "top": 340
      },
      "children": [],
      "imageProp": "secc2imagesrc"
    },
    {
      "type": "text",
      "id": "iUuEv",
      "name": "secC2T",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#5B6472",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "lineHeight": 1.45,
        "width": 664,
        "position": "absolute",
        "left": 720,
        "top": 690
      },
      "children": [],
      "textProp": "secc2ttext"
    },
    {
      "type": "text",
      "id": "u7cqN",
      "name": "emTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2A313C",
        "fontFamily": "Inter",
        "fontSize": 54,
        "fontWeight": "500",
        "position": "absolute",
        "left": 447,
        "top": 888
      },
      "children": [],
      "textProp": "emtitletext"
    },
    {
      "type": "frame",
      "id": "YtyZR",
      "name": "emC1",
      "style": {
        "boxSizing": "border-box",
        "width": 664,
        "height": 300,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover",
        "position": "absolute",
        "left": 56,
        "top": 1110
      },
      "children": [],
      "imageProp": "emc1imagesrc"
    },
    {
      "type": "frame",
      "id": "JjXA1",
      "name": "emC2",
      "style": {
        "boxSizing": "border-box",
        "width": 664,
        "height": 300,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover",
        "position": "absolute",
        "left": 720,
        "top": 1110
      },
      "children": [],
      "imageProp": "emc2imagesrc"
    },
    {
      "type": "text",
      "id": "roKpL",
      "name": "emC1T",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#5B6472",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "lineHeight": 1.45,
        "width": 635,
        "position": "absolute",
        "left": 56,
        "top": 1460
      },
      "children": [],
      "textProp": "emc1ttext"
    },
    {
      "type": "text",
      "id": "W8cp8",
      "name": "emC2T",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#5B6472",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "lineHeight": 1.45,
        "width": 635,
        "position": "absolute",
        "left": 720,
        "top": 1460
      },
      "children": [],
      "textProp": "emc2ttext"
    },
    {
      "type": "text",
      "id": "JLgTq",
      "name": "recTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2A313C",
        "fontFamily": "Inter",
        "fontSize": 32,
        "fontWeight": "500",
        "position": "absolute",
        "left": 56,
        "top": 1516
      },
      "children": [],
      "textProp": "rectitletext"
    },
    {
      "type": "text",
      "id": "v1oqd",
      "name": "recTag",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#7C8AA1",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "600",
        "position": "absolute",
        "left": 56,
        "top": 1562
      },
      "children": [],
      "textProp": "rectagtext"
    },
    {
      "type": "text",
      "id": "JC4Gz",
      "name": "secDesc",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#5B6472",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "500",
        "lineHeight": 1.45,
        "textAlign": "center",
        "width": 758,
        "position": "absolute",
        "left": 341,
        "top": 211
      },
      "children": [],
      "textProp": "secdesctext"
    },
    {
      "type": "text",
      "id": "2RaLS",
      "name": "sec1Title",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2A313C",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "600",
        "position": "absolute",
        "left": 56,
        "top": 660
      },
      "children": [],
      "textProp": "sec1titletext"
    },
    {
      "type": "rectangle",
      "id": "qjg8H",
      "name": "sec1Btn",
      "style": {
        "boxSizing": "border-box",
        "width": 92,
        "height": 24,
        "borderRadius": 3,
        "background": "#F1F4FA",
        "border": "1px solid #8AA3D3",
        "position": "absolute",
        "left": 56,
        "top": 770
      },
      "children": [],
      "hrefProp": "sec1btnhref"
    },
    {
      "type": "text",
      "id": "jBoOs",
      "name": "sec1BtnText",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2E446D",
        "fontFamily": "Inter",
        "fontSize": 11,
        "fontWeight": "600",
        "position": "absolute",
        "left": 71,
        "top": 775
      },
      "children": [],
      "textProp": "sec1btntexttext",
      "hrefProp": "sec1btntexthref"
    },
    {
      "type": "text",
      "id": "bvXh7",
      "name": "sec2Title",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2A313C",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "600",
        "position": "absolute",
        "left": 720,
        "top": 660
      },
      "children": [],
      "textProp": "sec2titletext"
    },
    {
      "type": "rectangle",
      "id": "Jj3eO",
      "name": "sec2Btn",
      "style": {
        "boxSizing": "border-box",
        "width": 68,
        "height": 24,
        "borderRadius": 3,
        "background": "#F1F4FA",
        "border": "1px solid #8AA3D3",
        "position": "absolute",
        "left": 720,
        "top": 770
      },
      "children": [],
      "hrefProp": "sec2btnhref"
    },
    {
      "type": "text",
      "id": "lqijC",
      "name": "sec2BtnText",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2E446D",
        "fontFamily": "Inter",
        "fontSize": 11,
        "fontWeight": "600",
        "position": "absolute",
        "left": 736,
        "top": 775
      },
      "children": [],
      "textProp": "sec2btntexttext",
      "hrefProp": "sec2btntexthref"
    },
    {
      "type": "text",
      "id": "XqUf3",
      "name": "emDesc",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#5B6472",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "500",
        "lineHeight": 1.45,
        "textAlign": "center",
        "width": 883,
        "position": "absolute",
        "left": 278,
        "top": 986
      },
      "children": [],
      "textProp": "emdesctext"
    },
    {
      "type": "text",
      "id": "ASvLz",
      "name": "em1Title",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2A313C",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "600",
        "position": "absolute",
        "left": 56,
        "top": 1430
      },
      "children": [],
      "textProp": "em1titletext"
    },
    {
      "type": "rectangle",
      "id": "RrdiU",
      "name": "em1Btn",
      "style": {
        "boxSizing": "border-box",
        "width": 100,
        "height": 24,
        "borderRadius": 3,
        "background": "#F1F4FA",
        "border": "1px solid #8AA3D3",
        "position": "absolute",
        "left": 56,
        "top": 1560
      },
      "children": [],
      "hrefProp": "em1btnhref"
    },
    {
      "type": "text",
      "id": "HRN4D",
      "name": "em1BtnText",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2E446D",
        "fontFamily": "Inter",
        "fontSize": 11,
        "fontWeight": "600",
        "position": "absolute",
        "left": 62,
        "top": 1565
      },
      "children": [],
      "textProp": "em1btntexttext",
      "hrefProp": "em1btntexthref"
    },
    {
      "type": "text",
      "id": "Cux2l",
      "name": "em2Title",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2A313C",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "600",
        "position": "absolute",
        "left": 720,
        "top": 1430
      },
      "children": [],
      "textProp": "em2titletext"
    },
    {
      "type": "rectangle",
      "id": "SQRdp",
      "name": "em2Btn",
      "style": {
        "boxSizing": "border-box",
        "width": 62,
        "height": 24,
        "borderRadius": 3,
        "background": "#F1F4FA",
        "border": "1px solid #8AA3D3",
        "position": "absolute",
        "left": 720,
        "top": 1560
      },
      "children": [],
      "hrefProp": "em2btnhref"
    },
    {
      "type": "text",
      "id": "NTd5R",
      "name": "em2BtnText",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#2E446D",
        "fontFamily": "Inter",
        "fontSize": 11,
        "fontWeight": "600",
        "position": "absolute",
        "left": 730,
        "top": 1565
      },
      "children": [],
      "textProp": "em2btntexttext",
      "hrefProp": "em2btntexthref"
    },
    {
      "type": "frame",
      "id": "48VrQ",
      "name": "recSec",
      "style": {
        "boxSizing": "border-box",
        "width": 1440,
        "height": 674,
        "background": "#ffffff",
        "position": "absolute",
        "overflow": "hidden",
        "left": 0,
        "top": 1650
      },
      "children": [
        {
          "type": "text",
          "id": "K05E0",
          "name": "recTitle2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2A313C",
            "fontFamily": "Inter",
            "fontSize": 54,
            "fontWeight": "500",
            "lineHeight": 1.05,
            "position": "absolute",
            "left": 56,
            "top": 104
          },
          "children": [],
          "textProp": "rectitle2text"
        },
        {
          "type": "rectangle",
          "id": "F8cEG",
          "name": "recBtn2",
          "style": {
            "boxSizing": "border-box",
            "width": 116,
            "height": 36,
            "borderRadius": 3,
            "background": "#F5F8FD",
            "border": "1px solid #8AA3D3",
            "position": "absolute",
            "left": 56,
            "top": 286
          },
          "children": [],
          "hrefProp": "recbtn2href"
        },
        {
          "type": "text",
          "id": "2J7hg",
          "name": "recBtn2T",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2E446D",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "position": "absolute",
            "left": 74,
            "top": 296
          },
          "children": [],
          "textProp": "recbtn2ttext",
          "hrefProp": "recbtn2thref"
        },
        {
          "type": "frame",
          "id": "Au6tc",
          "name": "recRight",
          "style": {
            "boxSizing": "border-box",
            "width": 744,
            "height": 620,
            "position": "absolute",
            "overflow": "hidden",
            "left": 640,
            "top": 72
          },
          "children": [
            {
              "type": "frame",
              "id": "qN1vZ",
              "name": "recRow1",
              "style": {
                "boxSizing": "border-box",
                "width": 744,
                "height": 290,
                "position": "absolute",
                "overflow": "hidden",
                "left": 0,
                "top": 0
              },
              "children": [
                {
                  "type": "frame",
                  "id": "ZIllw",
                  "name": "r1img",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 220,
                    "height": 140,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover",
                    "position": "absolute",
                    "left": 0,
                    "top": 20
                  },
                  "children": [],
                  "imageProp": "r1imgimagesrc"
                },
                {
                  "type": "text",
                  "id": "UuGs9",
                  "name": "r1t",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2A313C",
                    "fontFamily": "Inter",
                    "fontSize": 34,
                    "fontWeight": "600",
                    "position": "absolute",
                    "left": 260,
                    "top": 20
                  },
                  "children": [],
                  "textProp": "r1ttext"
                },
                {
                  "type": "text",
                  "id": "eFfFH",
                  "name": "r1d",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4E5663",
                    "fontFamily": "Inter",
                    "fontSize": 13,
                    "fontWeight": "500",
                    "lineHeight": 1.45,
                    "width": 460,
                    "position": "absolute",
                    "left": 260,
                    "top": 72
                  },
                  "children": [],
                  "textProp": "r1dtext"
                },
                {
                  "type": "text",
                  "id": "yAfSd",
                  "name": "r1l",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2A313C",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "position": "absolute",
                    "left": 260,
                    "top": 191
                  },
                  "children": [],
                  "textProp": "r1ltext"
                }
              ]
            },
            {
              "type": "line",
              "id": "hGVLG",
              "name": "div1",
              "style": {
                "boxSizing": "border-box"
              },
              "children": []
            },
            {
              "type": "frame",
              "id": "VXPxD",
              "name": "recRow2",
              "style": {
                "boxSizing": "border-box",
                "width": 744,
                "height": 290,
                "position": "absolute",
                "overflow": "hidden",
                "left": 0,
                "top": 324
              },
              "children": [
                {
                  "type": "frame",
                  "id": "1zrUZ",
                  "name": "r2img",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 220,
                    "height": 140,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover",
                    "position": "absolute",
                    "left": 0,
                    "top": 20
                  },
                  "children": [],
                  "imageProp": "r2imgimagesrc"
                },
                {
                  "type": "text",
                  "id": "oFEXZ",
                  "name": "r2t",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2A313C",
                    "fontFamily": "Inter",
                    "fontSize": 34,
                    "fontWeight": "600",
                    "position": "absolute",
                    "left": 260,
                    "top": 20
                  },
                  "children": [],
                  "textProp": "r2ttext"
                },
                {
                  "type": "text",
                  "id": "MeOoP",
                  "name": "r2d",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4E5663",
                    "fontFamily": "Inter",
                    "fontSize": 13,
                    "fontWeight": "500",
                    "lineHeight": 1.45,
                    "width": 460,
                    "position": "absolute",
                    "left": 260,
                    "top": 72
                  },
                  "children": [],
                  "textProp": "r2dtext"
                },
                {
                  "type": "text",
                  "id": "k1Mdi",
                  "name": "r2l",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2A313C",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700",
                    "position": "absolute",
                    "left": 260,
                    "top": 199
                  },
                  "children": [],
                  "textProp": "r2ltext"
                }
              ]
            },
            {
              "type": "line",
              "id": "OK9U4",
              "name": "div2",
              "style": {
                "boxSizing": "border-box"
              },
              "children": []
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "ptbvQ",
      "name": "trustSec",
      "style": {
        "boxSizing": "border-box",
        "width": 1440,
        "height": 806,
        "background": "#FFFFFF",
        "position": "absolute",
        "overflow": "hidden",
        "left": 0,
        "top": 2324
      },
      "children": [
        {
          "type": "text",
          "id": "DUJQp",
          "name": "trustTag",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F8BC0",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "700",
            "position": "absolute",
            "left": 56,
            "top": 70
          },
          "children": [],
          "textProp": "trusttagtext"
        },
        {
          "type": "text",
          "id": "aDMDs",
          "name": "trustTitle2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2A313C",
            "fontFamily": "Inter",
            "fontSize": 54,
            "fontWeight": "500",
            "lineHeight": 1.02,
            "width": 620,
            "position": "absolute",
            "left": 56,
            "top": 106
          },
          "children": [],
          "textProp": "trusttitle2text"
        },
        {
          "type": "rectangle",
          "id": "X9nmD",
          "name": "btnNews",
          "style": {
            "boxSizing": "border-box",
            "width": 160,
            "height": 34,
            "borderRadius": 3,
            "background": "#F5F8FD",
            "border": "1px solid #8AA3D3",
            "position": "absolute",
            "left": 1090,
            "top": 156
          },
          "children": [],
          "hrefProp": "btnnewshref"
        },
        {
          "type": "text",
          "id": "WwSkp",
          "name": "btnNewsT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2E446D",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "position": "absolute",
            "left": 1114,
            "top": 166
          },
          "children": [],
          "textProp": "btnnewsttext",
          "hrefProp": "btnnewsthref"
        },
        {
          "type": "rectangle",
          "id": "Lu08J",
          "name": "btnRes",
          "style": {
            "boxSizing": "border-box",
            "width": 118,
            "height": 34,
            "borderRadius": 3,
            "background": "#F5F8FD",
            "border": "1px solid #8AA3D3",
            "position": "absolute",
            "left": 1266,
            "top": 156
          },
          "children": [],
          "hrefProp": "btnreshref"
        },
        {
          "type": "text",
          "id": "loQy9",
          "name": "btnResT",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2E446D",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "position": "absolute",
            "left": 1285,
            "top": 166
          },
          "children": [],
          "textProp": "btnresttext",
          "hrefProp": "btnresthref"
        },
        {
          "type": "frame",
          "id": "qRR7U",
          "name": "card1",
          "style": {
            "boxSizing": "border-box",
            "width": 432,
            "height": 430,
            "position": "absolute",
            "overflow": "hidden",
            "left": 56,
            "top": 266
          },
          "children": [
            {
              "type": "frame",
              "id": "V90Gm",
              "name": "c1img",
              "style": {
                "boxSizing": "border-box",
                "width": 432,
                "height": 240,
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
              "type": "rectangle",
              "id": "UY5wB",
              "name": "c1badge",
              "style": {
                "boxSizing": "border-box",
                "width": 50,
                "height": 20,
                "borderRadius": 2,
                "background": "#FFFFFFCC",
                "position": "absolute",
                "left": 12,
                "top": 12
              },
              "children": []
            },
            {
              "type": "text",
              "id": "IMSha",
              "name": "c1badgeT",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2A313C",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "700",
                "position": "absolute",
                "left": 22,
                "top": 17
              },
              "children": [],
              "textProp": "c1badgettext"
            },
            {
              "type": "text",
              "id": "zoREk",
              "name": "c1t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2A313C",
                "fontFamily": "Inter",
                "fontSize": 28,
                "fontWeight": "600",
                "lineHeight": 1.15,
                "width": 420,
                "position": "absolute",
                "left": 0,
                "top": 258
              },
              "children": [],
              "textProp": "c1ttext"
            },
            {
              "type": "text",
              "id": "4v9Ex",
              "name": "c1d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#4E5663",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "500",
                "lineHeight": 1.4,
                "width": 420,
                "position": "absolute",
                "left": 0,
                "top": 336
              },
              "children": [],
              "textProp": "c1dtext"
            },
            {
              "type": "text",
              "id": "rILPK",
              "name": "c1l",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2A313C",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "700",
                "position": "absolute",
                "left": 0,
                "top": 408
              },
              "children": [],
              "textProp": "c1ltext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "44wZx",
          "name": "card2",
          "style": {
            "boxSizing": "border-box",
            "width": 432,
            "height": 430,
            "position": "absolute",
            "overflow": "hidden",
            "left": 504,
            "top": 266
          },
          "children": [
            {
              "type": "frame",
              "id": "utElD",
              "name": "c2img",
              "style": {
                "boxSizing": "border-box",
                "width": 432,
                "height": 240,
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
              "type": "rectangle",
              "id": "LI2PQ",
              "name": "c2badge",
              "style": {
                "boxSizing": "border-box",
                "width": 64,
                "height": 20,
                "borderRadius": 2,
                "background": "#FFFFFFCC",
                "position": "absolute",
                "left": 12,
                "top": 12
              },
              "children": []
            },
            {
              "type": "text",
              "id": "i0NPz",
              "name": "c2badgeT",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2A313C",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "700",
                "position": "absolute",
                "left": 22,
                "top": 17
              },
              "children": [],
              "textProp": "c2badgettext"
            },
            {
              "type": "text",
              "id": "RBA7h",
              "name": "c2t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2A313C",
                "fontFamily": "Inter",
                "fontSize": 28,
                "fontWeight": "600",
                "lineHeight": 1.15,
                "width": 420,
                "position": "absolute",
                "left": 0,
                "top": 258
              },
              "children": [],
              "textProp": "c2ttext"
            },
            {
              "type": "text",
              "id": "9crCP",
              "name": "c2d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#4E5663",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "500",
                "lineHeight": 1.4,
                "width": 420,
                "position": "absolute",
                "left": 0,
                "top": 350
              },
              "children": [],
              "textProp": "c2dtext"
            },
            {
              "type": "text",
              "id": "LM5tt",
              "name": "c2l",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2A313C",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "700",
                "position": "absolute",
                "left": 0,
                "top": 408
              },
              "children": [],
              "textProp": "c2ltext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "PhOCr",
          "name": "card3",
          "style": {
            "boxSizing": "border-box",
            "width": 432,
            "height": 430,
            "position": "absolute",
            "overflow": "hidden",
            "left": 952,
            "top": 266
          },
          "children": [
            {
              "type": "frame",
              "id": "zYPS2",
              "name": "c3img",
              "style": {
                "boxSizing": "border-box",
                "width": 432,
                "height": 240,
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
              "type": "rectangle",
              "id": "x7doK",
              "name": "c3badge",
              "style": {
                "boxSizing": "border-box",
                "width": 46,
                "height": 20,
                "borderRadius": 2,
                "background": "#FFFFFFCC",
                "position": "absolute",
                "left": 12,
                "top": 12
              },
              "children": []
            },
            {
              "type": "text",
              "id": "EUUVV",
              "name": "c3badgeT",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2A313C",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "700",
                "position": "absolute",
                "left": 22,
                "top": 17
              },
              "children": [],
              "textProp": "c3badgettext"
            },
            {
              "type": "text",
              "id": "VbKdD",
              "name": "c3t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2A313C",
                "fontFamily": "Inter",
                "fontSize": 28,
                "fontWeight": "600",
                "lineHeight": 1.1,
                "width": 420,
                "position": "absolute",
                "left": 0,
                "top": 256
              },
              "children": [],
              "textProp": "c3ttext"
            },
            {
              "type": "text",
              "id": "kHo6k",
              "name": "c3d",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#4E5663",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "500",
                "lineHeight": 1.4,
                "width": 420,
                "position": "absolute",
                "left": 0,
                "top": 350
              },
              "children": [],
              "textProp": "c3dtext"
            },
            {
              "type": "text",
              "id": "DQ2CS",
              "name": "c3l",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2A313C",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "700",
                "position": "absolute",
                "left": 0,
                "top": 408
              },
              "children": [],
              "textProp": "c3ltext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "beG82",
  "sectitletext": "Security & intelligence",
  "secc1imagesrc": "https://images.unsplash.com/photo-1708794758085-b733c022008c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMjAwOTF8&ixlib=rb-4.1.0&q=80&w=1080",
  "secc1ttext": "Our technology delivers mobility, adaptive intelligence and resilient communications for security missions. Always-on solutions can be rapidly deployed or withdrawn, ensuring uptime demands of covert and sensitive missions.",
  "secc2imagesrc": "https://images.unsplash.com/photo-1668482667997-66dcc3e4042d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMjAwOTJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "secc2ttext": "Our security-grade mobile satellite network provides in-demand connections to remote and challenging border environments while maintaining command continuity and response capabilities with full mission videos and data transmission.",
  "emtitletext": "Emergency response",
  "emc1imagesrc": "https://images.unsplash.com/photo-1647211547055-59d8a38bb23e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMjAwOTN8&ixlib=rb-4.1.0&q=80&w=1080",
  "emc2imagesrc": "https://images.unsplash.com/photo-1638826861945-9225b594fea3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMjAwOTR8&ixlib=rb-4.1.0&q=80&w=1080",
  "emc1ttext": "Kymeta technology provides emergency responders with flexible, resilient communications in crisis situations. Our network offerings, terminal and services solutions offer an adaptable, easy-to-deploy communications environment when in extreme need. This robust communication infrastructure supports first responders, enhancing their ability to coordinate lifesaving efforts and improve emergency response effectiveness.",
  "emc2ttext": "In times of fire and crisis, Kymeta is ready to deploy terminals offer firefighters and command centers with minimal power requirements. Our technology provides exceptional high-volume data transfer and low-latency sharing and voice communication to enhance situational awareness and firefighting capabilities, even in the most demanding environments.",
  "rectitletext": "Recommended products",
  "rectagtext": "Hardware",
  "secdesctext": "Kymeta provides robust hybrid connectivity and real-time command insight for defense missions, border security and intelligence operations. Our adaptive solutions ensure critical data and communication remain secure and accessible in dynamic situations.",
  "sec1titletext": "Security & intelligence agencies",
  "sec1btnhref": "/",
  "sec1btntexttext": "Intelligence",
  "sec1btntexthref": "/",
  "sec2titletext": "Border security",
  "sec2btnhref": "/",
  "sec2btntexttext": "Border",
  "sec2btntexthref": "/",
  "emdesctext": "Kymeta empowers emergency responders with resilient access to easy-to-deploy solutions during crises. Our rapidly adaptive network and communications solutions enable front-line teams and command center operations with continuous situational awareness and response effectiveness.",
  "em1titletext": "Emergency services",
  "em1btnhref": "/",
  "em1btntexttext": "First responders",
  "em1btntexthref": "/",
  "em2titletext": "Wildfire fighting",
  "em2btnhref": "/",
  "em2btntexttext": "Wildfire",
  "em2btntexthref": "/",
  "rectitle2text": "Recommended\nproducts",
  "recbtn2href": "/",
  "recbtn2ttext": "All Products",
  "recbtn2thref": "/products",
  "r1imgimagesrc": "https://images.unsplash.com/photo-1582719471216-d2e7e332e19c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMjA1MTN8&ixlib=rb-4.1.0&q=80&w=1080",
  "r1ttext": "Osprey u8",
  "r1dtext": "Empowering defense and government operators with resilient, fully-integrated Multi-Orbit and Multi-Network connectivity in an easy-to-use terminal. Built to MIL-STD with embedded A-PNT and GNSS-denied capabilities.",
  "r1ltext": "Learn more",
  "r2imgimagesrc": "https://images.unsplash.com/photo-1596532271345-ff45865793d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMjA1MTR8&ixlib=rb-4.1.0&q=80&w=1080",
  "r2ttext": "Goshawk u8",
  "r2dtext": "Able to switch dynamically between LEO, GEO and cellular networks, this turnkey terminal easily integrates with existing systems. Robust and durable hardware suitable for security and intelligence agencies.",
  "r2ltext": "Learn more",
  "trusttagtext": "RELATED NEWS & RESOURCES",
  "trusttitle2text": "Trusted for mission-\ncritical operations",
  "btnnewshref": "/",
  "btnnewsttext": "All News & Insights",
  "btnnewsthref": "/",
  "btnreshref": "/",
  "btnresttext": "All Resources",
  "btnresthref": "/",
  "c1imgimagesrc": "https://images.unsplash.com/photo-1759746503130-a2093e32860b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMjA1NDl8&ixlib=rb-4.1.0&q=80&w=1080",
  "c1badgettext": "Videos",
  "c1ttext": "Kymeta Osprey™ u8: Mission-Ready Multi-Orbit Terminal",
  "c1dtext": "The Kymeta Osprey™ u8 – hybrid-GEO-LEO and bundled services is the first truly turnkey solution developed for military and government users to take full advantage of multi-orbit and multi...",
  "c1ltext": "Watch now",
  "c2imgimagesrc": "https://images.unsplash.com/photo-1759167625074-4c61493a8c40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMjA1NTB8&ixlib=rb-4.1.0&q=80&w=1080",
  "c2badgettext": "Use Cases",
  "c2ttext": "The Kymeta Osprey™ u8 Advancing On-The-Move",
  "c2dtext": "U.S. Army's I/IIA C5 Executive Communications Team transforms the Stryker Combat Vehicle into a fully functional mobile command post with on-the-move communications capability",
  "c2ltext": "Download",
  "c3imgimagesrc": "https://images.unsplash.com/photo-1512818908771-583ff7531c14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMyMjA1NzZ8&ixlib=rb-4.1.0&q=80&w=1080",
  "c3badgettext": "News",
  "c3ttext": "Kymeta Unveils its Second Multi-Orbit",
  "c3dtext": "Leading the way in the Multi-X Revolution the Kymeta Goshawk u8, a hybrid GEO-LEO antenna, is in production.",
  "c3ltext": "Read more"
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

export default function TemplateExclusivePenSiteApplicationApproachMainpenAlt3({ id, sectitletext, secc1imagesrc, secc1ttext, secc2imagesrc, secc2ttext, emtitletext, emc1imagesrc, emc2imagesrc, emc1ttext, emc2ttext, rectitletext, rectagtext, secdesctext, sec1titletext, sec1btnhref, sec1btntexttext, sec1btntexthref, sec2titletext, sec2btnhref, sec2btntexttext, sec2btntexthref, emdesctext, em1titletext, em1btnhref, em1btntexttext, em1btntexthref, em2titletext, em2btnhref, em2btntexttext, em2btntexthref, rectitle2text, recbtn2href, recbtn2ttext, recbtn2thref, r1imgimagesrc, r1ttext, r1dtext, r1ltext, r2imgimagesrc, r2ttext, r2dtext, r2ltext, trusttagtext, trusttitle2text, btnnewshref, btnnewsttext, btnnewsthref, btnreshref, btnresttext, btnresthref, c1imgimagesrc, c1badgettext, c1ttext, c1dtext, c1ltext, c2imgimagesrc, c2badgettext, c2ttext, c2dtext, c2ltext, c3imgimagesrc, c3badgettext, c3ttext, c3dtext, c3ltext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, sectitletext, secc1imagesrc, secc1ttext, secc2imagesrc, secc2ttext, emtitletext, emc1imagesrc, emc2imagesrc, emc1ttext, emc2ttext, rectitletext, rectagtext, secdesctext, sec1titletext, sec1btnhref, sec1btntexttext, sec1btntexthref, sec2titletext, sec2btnhref, sec2btntexttext, sec2btntexthref, emdesctext, em1titletext, em1btnhref, em1btntexttext, em1btntexthref, em2titletext, em2btnhref, em2btntexttext, em2btntexthref, rectitle2text, recbtn2href, recbtn2ttext, recbtn2thref, r1imgimagesrc, r1ttext, r1dtext, r1ltext, r2imgimagesrc, r2ttext, r2dtext, r2ltext, trusttagtext, trusttitle2text, btnnewshref, btnnewsttext, btnnewsthref, btnreshref, btnresttext, btnresthref, c1imgimagesrc, c1badgettext, c1ttext, c1dtext, c1ltext, c2imgimagesrc, c2badgettext, c2ttext, c2dtext, c2ltext, c3imgimagesrc, c3badgettext, c3ttext, c3dtext, c3ltext });
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