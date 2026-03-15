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
  "id": "fELNe",
  "name": "serviceMain",
  "style": {
    "boxSizing": "border-box",
    "width": 1440,
    "height": 1854,
    "background": "#F3F3F2",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "frame",
      "id": "Sib0t",
      "name": "sideMenu",
      "style": {
        "boxSizing": "border-box",
        "width": 228,
        "height": 980,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 20,
        "top": 54
      },
      "children": [
        {
          "type": "text",
          "id": "I2heN",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#7A7A7A",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "textProp": "i2hentext"
        },
        {
          "type": "text",
          "id": "I7g2G",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 24
          },
          "children": [],
          "textProp": "i7g2gtext"
        },
        {
          "type": "rectangle",
          "id": "FkGXP",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "width": 228,
            "height": 1,
            "background": "#D9D9D9",
            "position": "absolute",
            "left": 0,
            "top": 54
          },
          "children": []
        },
        {
          "type": "text",
          "id": "giJ1V",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 13,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 72
          },
          "children": [],
          "textProp": "gij1vtext"
        },
        {
          "type": "text",
          "id": "7cRBO",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 13,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 112
          },
          "children": [],
          "textProp": "crbotext"
        },
        {
          "type": "text",
          "id": "DSlsS",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 13,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "dslsstext"
        },
        {
          "type": "text",
          "id": "mjS8v",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 13,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 192
          },
          "children": [],
          "textProp": "mjs8vtext"
        },
        {
          "type": "text",
          "id": "0GHfl",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 13,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 232
          },
          "children": [],
          "textProp": "ghfltext"
        },
        {
          "type": "text",
          "id": "Em8nS",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5F5F5F",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 286
          },
          "children": [],
          "textProp": "em8nstext"
        },
        {
          "type": "text",
          "id": "pw0oG",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5F5F5F",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 312
          },
          "children": [],
          "textProp": "pw0ogtext"
        },
        {
          "type": "text",
          "id": "V7YHt",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5F5F5F",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 338
          },
          "children": [],
          "textProp": "v7yhttext"
        }
      ]
    },
    {
      "type": "text",
      "id": "tQWVE",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#1D1D1D",
        "fontFamily": "Inter",
        "fontSize": 50,
        "fontWeight": "600",
        "position": "absolute",
        "left": 284,
        "top": 46
      },
      "children": [],
      "textProp": "tqwvetext"
    },
    {
      "type": "frame",
      "id": "Bxxrd",
      "name": "c1",
      "style": {
        "boxSizing": "border-box",
        "width": 356,
        "height": 282,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 284,
        "top": 126
      },
      "children": [
        {
          "type": "frame",
          "id": "RuTUT",
          "name": "img1",
          "style": {
            "boxSizing": "border-box",
            "width": 356,
            "height": 138,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "img1imagesrc"
        },
        {
          "type": "text",
          "id": "Jw170",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "jw170text"
        },
        {
          "type": "text",
          "id": "OR7ed",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2F2F2F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 356,
            "position": "absolute",
            "left": 0,
            "top": 176
          },
          "children": [],
          "textProp": "or7edtext"
        },
        {
          "type": "text",
          "id": "g3GFq",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F5F43",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 250
          },
          "children": [],
          "textProp": "g3gfqtext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "T14dU",
      "name": "c2",
      "style": {
        "boxSizing": "border-box",
        "width": 356,
        "height": 282,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 658,
        "top": 126
      },
      "children": [
        {
          "type": "frame",
          "id": "0xMfH",
          "name": "img2",
          "style": {
            "boxSizing": "border-box",
            "width": 356,
            "height": 138,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "img2imagesrc"
        },
        {
          "type": "text",
          "id": "5YdH7",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "ydh7text"
        },
        {
          "type": "text",
          "id": "knuMC",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2F2F2F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 356,
            "position": "absolute",
            "left": 0,
            "top": 176
          },
          "children": [],
          "textProp": "knumctext"
        },
        {
          "type": "text",
          "id": "G2EX4",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F5F43",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 250
          },
          "children": [],
          "textProp": "g2ex4text"
        }
      ]
    },
    {
      "type": "frame",
      "id": "MGq0x",
      "name": "c3",
      "style": {
        "boxSizing": "border-box",
        "width": 390,
        "height": 282,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 1032,
        "top": 126
      },
      "children": [
        {
          "type": "frame",
          "id": "ipJ3F",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "width": 390,
            "height": 138,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "ipj3fimagesrc"
        },
        {
          "type": "text",
          "id": "YY8OT",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "yy8ottext"
        },
        {
          "type": "text",
          "id": "RovtF",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2F2F2F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 390,
            "position": "absolute",
            "left": 0,
            "top": 176
          },
          "children": [],
          "textProp": "rovtftext"
        },
        {
          "type": "text",
          "id": "erZhu",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F5F43",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 250
          },
          "children": [],
          "textProp": "erzhutext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "OT5Wt",
      "name": "c4",
      "style": {
        "boxSizing": "border-box",
        "width": 356,
        "height": 282,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 284,
        "top": 430
      },
      "children": [
        {
          "type": "frame",
          "id": "f8WKb",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "width": 356,
            "height": 138,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "f8wkbimagesrc"
        },
        {
          "type": "text",
          "id": "gdvvz",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "gdvvztext"
        },
        {
          "type": "text",
          "id": "ncUm1",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2F2F2F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 356,
            "position": "absolute",
            "left": 0,
            "top": 176
          },
          "children": [],
          "textProp": "ncum1text"
        },
        {
          "type": "text",
          "id": "EfW3N",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F5F43",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 250
          },
          "children": [],
          "textProp": "efw3ntext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "R1n31",
      "name": "c5",
      "style": {
        "boxSizing": "border-box",
        "width": 356,
        "height": 282,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 658,
        "top": 430
      },
      "children": [
        {
          "type": "frame",
          "id": "JN7LR",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "width": 356,
            "height": 138,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "jn7lrimagesrc"
        },
        {
          "type": "text",
          "id": "4RF1S",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "rf1stext"
        },
        {
          "type": "text",
          "id": "IxgAz",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2F2F2F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 356,
            "position": "absolute",
            "left": 0,
            "top": 176
          },
          "children": [],
          "textProp": "ixgaztext"
        },
        {
          "type": "text",
          "id": "7L9Ov",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F5F43",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 250
          },
          "children": [],
          "textProp": "l9ovtext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "aYmsV",
      "name": "c6",
      "style": {
        "boxSizing": "border-box",
        "width": 390,
        "height": 282,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 1032,
        "top": 430
      },
      "children": [
        {
          "type": "frame",
          "id": "Dx8Kk",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "width": 390,
            "height": 138,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "dx8kkimagesrc"
        },
        {
          "type": "text",
          "id": "Ovosb",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "ovosbtext"
        },
        {
          "type": "text",
          "id": "OQKLy",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2F2F2F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 390,
            "position": "absolute",
            "left": 0,
            "top": 176
          },
          "children": [],
          "textProp": "oqklytext"
        },
        {
          "type": "text",
          "id": "Sl5CV",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F5F43",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 250
          },
          "children": [],
          "textProp": "sl5cvtext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "W54cR",
      "name": "c7",
      "style": {
        "boxSizing": "border-box",
        "width": 356,
        "height": 282,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 284,
        "top": 734
      },
      "children": [
        {
          "type": "frame",
          "id": "SufbB",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "width": 356,
            "height": 138,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "sufbbimagesrc"
        },
        {
          "type": "text",
          "id": "GD21K",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "gd21ktext"
        },
        {
          "type": "text",
          "id": "ME5Q2",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2F2F2F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 356,
            "position": "absolute",
            "left": 0,
            "top": 176
          },
          "children": [],
          "textProp": "me5q2text"
        },
        {
          "type": "text",
          "id": "IzScz",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F5F43",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 250
          },
          "children": [],
          "textProp": "izscztext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "4FDdM",
      "name": "c8",
      "style": {
        "boxSizing": "border-box",
        "width": 356,
        "height": 282,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 658,
        "top": 734
      },
      "children": [
        {
          "type": "frame",
          "id": "wuP31",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "width": 356,
            "height": 138,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "wup31imagesrc"
        },
        {
          "type": "text",
          "id": "RwVak",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "rwvaktext"
        },
        {
          "type": "text",
          "id": "FakrC",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2F2F2F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 356,
            "position": "absolute",
            "left": 0,
            "top": 176
          },
          "children": [],
          "textProp": "fakrctext"
        },
        {
          "type": "text",
          "id": "1Ea9U",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F5F43",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 250
          },
          "children": [],
          "textProp": "ea9utext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "s10rp",
      "name": "c9",
      "style": {
        "boxSizing": "border-box",
        "width": 390,
        "height": 282,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 1032,
        "top": 734
      },
      "children": [
        {
          "type": "frame",
          "id": "Ggkzf",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "width": 390,
            "height": 138,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "ggkzfimagesrc"
        },
        {
          "type": "text",
          "id": "ry4v3",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "ry4v3text"
        },
        {
          "type": "text",
          "id": "ow2Ji",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2F2F2F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 390,
            "position": "absolute",
            "left": 0,
            "top": 176
          },
          "children": [],
          "textProp": "ow2jitext"
        },
        {
          "type": "text",
          "id": "yp9Cu",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F5F43",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 250
          },
          "children": [],
          "textProp": "yp9cutext"
        }
      ]
    },
    {
      "type": "text",
      "id": "1VA8r",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#7A7361",
        "fontFamily": "Inter",
        "fontSize": 10,
        "fontWeight": "700",
        "position": "absolute",
        "left": 284,
        "top": 1418
      },
      "children": [],
      "textProp": "va8rtext"
    },
    {
      "type": "text",
      "id": "W42fa",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#1F1F1F",
        "fontFamily": "Inter",
        "fontSize": 44,
        "fontWeight": "600",
        "position": "absolute",
        "left": 284,
        "top": 1438
      },
      "children": [],
      "textProp": "w42fatext"
    },
    {
      "type": "text",
      "id": "eU5mF",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#303030",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "normal",
        "lineHeight": 1.35,
        "width": 650,
        "position": "absolute",
        "left": 284,
        "top": 1508
      },
      "children": [],
      "textProp": "eu5mftext"
    },
    {
      "type": "text",
      "id": "AONwD",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#6F5F43",
        "fontFamily": "Inter",
        "fontSize": 11,
        "fontWeight": "600",
        "position": "absolute",
        "left": 284,
        "top": 1552
      },
      "children": [],
      "textProp": "aonwdtext"
    },
    {
      "type": "frame",
      "id": "Fim0x",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 450,
        "height": 330,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover",
        "position": "absolute",
        "left": 972,
        "top": 1418
      },
      "children": [],
      "imageProp": "fim0ximagesrc"
    },
    {
      "type": "text",
      "id": "MZPnr",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#707070",
        "fontFamily": "Inter",
        "fontSize": 11,
        "fontWeight": "500",
        "position": "absolute",
        "left": 284,
        "top": 1684
      },
      "children": [],
      "textProp": "mzpnrtext"
    },
    {
      "type": "text",
      "id": "IwjZz",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#8D8D8D",
        "fontFamily": "Inter",
        "fontSize": 20,
        "fontWeight": "600",
        "position": "absolute",
        "left": 284,
        "top": 1704
      },
      "children": [],
      "textProp": "iwjzztext"
    },
    {
      "type": "frame",
      "id": "EluQI",
      "name": "c10",
      "style": {
        "boxSizing": "border-box",
        "width": 356,
        "height": 282,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 284,
        "top": 1038
      },
      "children": [
        {
          "type": "frame",
          "id": "j7Tpt",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "width": 356,
            "height": 138,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "j7tptimagesrc"
        },
        {
          "type": "text",
          "id": "K0XNd",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "k0xndtext"
        },
        {
          "type": "text",
          "id": "M0JaQ",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2F2F2F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 356,
            "position": "absolute",
            "left": 0,
            "top": 176
          },
          "children": [],
          "textProp": "m0jaqtext"
        },
        {
          "type": "text",
          "id": "Xgdxo",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F5F43",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 250
          },
          "children": [],
          "textProp": "xgdxotext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "CgI12",
      "name": "c11",
      "style": {
        "boxSizing": "border-box",
        "width": 356,
        "height": 282,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 658,
        "top": 1038
      },
      "children": [
        {
          "type": "frame",
          "id": "MKZ2J",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "width": 356,
            "height": 138,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "imageProp": "mkz2jimagesrc"
        },
        {
          "type": "text",
          "id": "RbK7V",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F1F1F",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 152
          },
          "children": [],
          "textProp": "rbk7vtext"
        },
        {
          "type": "text",
          "id": "Ddxky",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#2F2F2F",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.35,
            "width": 356,
            "position": "absolute",
            "left": 0,
            "top": 176
          },
          "children": [],
          "textProp": "ddxkytext"
        },
        {
          "type": "text",
          "id": "Irn5s",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6F5F43",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 250
          },
          "children": [],
          "textProp": "irn5stext"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "fELNe",
  "i2hentext": "切削优化和应用中的",
  "i7g2gtext": "Sandvik Coromant",
  "gij1vtext": "工艺改进服务",
  "crbotext": "咨询服务",
  "dslsstext": "培训",
  "mjs8vtext": "数字化服务",
  "ghfltext": "刀具服务",
  "em8nstext": "培训",
  "pw0ogtext": "刀具与工艺工程",
  "v7yhttext": "制造优化服务",
  "tqwvetext": "通过服务创造价值",
  "img1imagesrc": "https://images.unsplash.com/photo-1581092160607-ee22731d8c90?auto=format&fit=crop&w=1200&q=80",
  "jw170text": "山特维克可乐满中心",
  "or7edtext": "提供工艺分析、应用优化与实施建议，帮助制造商提升加工稳定性和产出效率。",
  "g3gfqtext": "了解更多  ›",
  "img2imagesrc": "https://images.unsplash.com/photo-1565791380709-49e529af4b06?auto=format&fit=crop&w=1200&q=80",
  "ydh7text": "健康检查服务",
  "knumctext": "通过数据化评估加工系统与刀具参数，识别可量化的质量、效率与成本改进空间。",
  "g2ex4text": "了解更多  ›",
  "ipj3fimagesrc": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  "yy8ottext": "咨询服务",
  "rovtftext": "围绕生产场景提供端到端技术咨询和落地支持。",
  "erzhutext": "了解更多  ›",
  "f8wkbimagesrc": "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=80",
  "gdvvztext": "培训",
  "ncum1text": "为操作员与工程师提供岗位化培训课程与认证。",
  "efw3ntext": "了解更多  ›",
  "jn7lrimagesrc": "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?auto=format&fit=crop&w=1200&q=80",
  "rf1stext": "山特维克可乐满客户服务中心",
  "ixgaztext": "快速响应订单、供货与应用支持需求。",
  "l9ovtext": "了解更多  ›",
  "dx8kkimagesrc": "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1200&q=80",
  "ovosbtext": "库存",
  "oqklytext": "协同库存策略，降低周转成本并提升交付稳定性。",
  "sl5cvtext": "了解更多  ›",
  "sufbbimagesrc": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  "gd21ktext": "工程项目",
  "me5q2text": "贯穿项目启动到量产，提供刀具方案和实施支持。",
  "izscztext": "了解更多  ›",
  "wup31imagesrc": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  "rwvaktext": "刀具库存和ID",
  "fakrctext": "追踪刀具生命周期，提升周转效率与可视化管理。",
  "ea9utext": "了解更多  ›",
  "ggkzfimagesrc": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  "ry4v3text": "定制服务",
  "ow2jitext": "基于应用与材料特性，快速生成可执行的刀具建议。",
  "yp9cutext": "了解更多  ›",
  "va8rtext": "MANUFACTURING WELL-BEING",
  "w42fatext": "健康的刀具带来制造业的成功",
  "eu5mftext": "秉承系统化、长期主义的服务理念，我们为客户提供从策略到执行的完整支持，助力实现制造业的可持续成功。",
  "aonwdtext": "了解更多  ›",
  "fim0ximagesrc": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80",
  "mzpnrtext": "这个服务帮到你了吗？",
  "iwjzztext": "☆ ☆ ☆ ☆ ☆",
  "j7tptimagesrc": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  "k0xndtext": "我们的热等静压刀方案",
  "m0jaqtext": "结合工艺需求提供配套刀具与交付服务，帮助你稳定生产并提升经济性。",
  "xgdxotext": "了解更多  ›",
  "mkz2jimagesrc": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  "rbk7vtext": "Pay per part",
  "ddxkytext": "通过按件计费模型优化刀具成本与库存压力，让生产计划更可控。",
  "irn5stext": "了解更多  ›"
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

export default function TemplateExclusivePenSiteSandvikServiceApproachServicemainpenAlt3({ id, i2hentext, i7g2gtext, gij1vtext, crbotext, dslsstext, mjs8vtext, ghfltext, em8nstext, pw0ogtext, v7yhttext, tqwvetext, img1imagesrc, jw170text, or7edtext, g3gfqtext, img2imagesrc, ydh7text, knumctext, g2ex4text, ipj3fimagesrc, yy8ottext, rovtftext, erzhutext, f8wkbimagesrc, gdvvztext, ncum1text, efw3ntext, jn7lrimagesrc, rf1stext, ixgaztext, l9ovtext, dx8kkimagesrc, ovosbtext, oqklytext, sl5cvtext, sufbbimagesrc, gd21ktext, me5q2text, izscztext, wup31imagesrc, rwvaktext, fakrctext, ea9utext, ggkzfimagesrc, ry4v3text, ow2jitext, yp9cutext, va8rtext, w42fatext, eu5mftext, aonwdtext, fim0ximagesrc, mzpnrtext, iwjzztext, j7tptimagesrc, k0xndtext, m0jaqtext, xgdxotext, mkz2jimagesrc, rbk7vtext, ddxkytext, irn5stext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, i2hentext, i7g2gtext, gij1vtext, crbotext, dslsstext, mjs8vtext, ghfltext, em8nstext, pw0ogtext, v7yhttext, tqwvetext, img1imagesrc, jw170text, or7edtext, g3gfqtext, img2imagesrc, ydh7text, knumctext, g2ex4text, ipj3fimagesrc, yy8ottext, rovtftext, erzhutext, f8wkbimagesrc, gdvvztext, ncum1text, efw3ntext, jn7lrimagesrc, rf1stext, ixgaztext, l9ovtext, dx8kkimagesrc, ovosbtext, oqklytext, sl5cvtext, sufbbimagesrc, gd21ktext, me5q2text, izscztext, wup31imagesrc, rwvaktext, fakrctext, ea9utext, ggkzfimagesrc, ry4v3text, ow2jitext, yp9cutext, va8rtext, w42fatext, eu5mftext, aonwdtext, fim0ximagesrc, mzpnrtext, iwjzztext, j7tptimagesrc, k0xndtext, m0jaqtext, xgdxotext, mkz2jimagesrc, rbk7vtext, ddxkytext, irn5stext });
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