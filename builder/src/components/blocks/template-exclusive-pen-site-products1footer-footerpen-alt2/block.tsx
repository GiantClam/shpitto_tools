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

const SECTION_KIND = "footer";
const SECTION_TREE = {
  "type": "frame",
  "id": "0FZnn",
  "name": "footer",
  "style": {
    "boxSizing": "border-box",
    "width": 1440,
    "height": 700,
    "background": "#333538",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "frame",
      "id": "J3Y57",
      "name": "c1",
      "style": {
        "boxSizing": "border-box",
        "width": 350,
        "height": 84,
        "borderRadius": 2,
        "background": "#333538",
        "border": "1px solid #6a6d72",
        "position": "absolute",
        "overflow": "hidden",
        "left": 72,
        "top": 74
      },
      "children": [
        {
          "type": "text",
          "id": "ygowA",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#f2f2f2",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "500",
            "width": 220,
            "position": "absolute",
            "left": 58,
            "top": 26
          },
          "children": [],
          "textProp": "ygowatext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "bzjje",
      "name": "c2",
      "style": {
        "boxSizing": "border-box",
        "width": 350,
        "height": 84,
        "borderRadius": 2,
        "background": "#333538",
        "border": "1px solid #6a6d72",
        "position": "absolute",
        "overflow": "hidden",
        "left": 72,
        "top": 176
      },
      "children": [
        {
          "type": "text",
          "id": "eN0vT",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#f2f2f2",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "500",
            "width": 220,
            "position": "absolute",
            "left": 58,
            "top": 26
          },
          "children": [],
          "textProp": "en0vttext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "ss1Qb",
      "name": "c3",
      "style": {
        "boxSizing": "border-box",
        "width": 350,
        "height": 84,
        "borderRadius": 2,
        "background": "#333538",
        "border": "1px solid #6a6d72",
        "position": "absolute",
        "overflow": "hidden",
        "left": 72,
        "top": 278
      },
      "children": [
        {
          "type": "text",
          "id": "1E5hl",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#f2f2f2",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "500",
            "width": 220,
            "position": "absolute",
            "left": 58,
            "top": 26
          },
          "children": [],
          "textProp": "e5hltext"
        }
      ]
    },
    {
      "type": "text",
      "id": "BYtfH",
      "name": "col2t",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#f2f2f2",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "500",
        "width": 220,
        "position": "absolute",
        "left": 460,
        "top": 74
      },
      "children": [],
      "textProp": "col2ttext",
      "hrefProp": "col2thref"
    },
    {
      "type": "text",
      "id": "cgX84",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 220,
        "position": "absolute",
        "left": 460,
        "top": 146
      },
      "children": [],
      "textProp": "cgx84text",
      "hrefProp": "cgx84href"
    },
    {
      "type": "text",
      "id": "kGDwL",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 260,
        "position": "absolute",
        "left": 460,
        "top": 186
      },
      "children": [],
      "textProp": "kgdwltext",
      "hrefProp": "kgdwlhref"
    },
    {
      "type": "text",
      "id": "PVXsG",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 180,
        "position": "absolute",
        "left": 460,
        "top": 226
      },
      "children": [],
      "textProp": "pvxsgtext",
      "hrefProp": "pvxsghref"
    },
    {
      "type": "text",
      "id": "9IdhP",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 240,
        "position": "absolute",
        "left": 460,
        "top": 266
      },
      "children": [],
      "textProp": "idhptext",
      "hrefProp": "idhphref"
    },
    {
      "type": "text",
      "id": "fKnQq",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 220,
        "position": "absolute",
        "left": 460,
        "top": 306
      },
      "children": [],
      "textProp": "fknqqtext",
      "hrefProp": "fknqqhref"
    },
    {
      "type": "text",
      "id": "LKE0A",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#f2f2f2",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "500",
        "width": 300,
        "position": "absolute",
        "left": 720,
        "top": 74
      },
      "children": [],
      "textProp": "lke0atext",
      "hrefProp": "lke0ahref"
    },
    {
      "type": "text",
      "id": "0DsRu",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 280,
        "position": "absolute",
        "left": 720,
        "top": 146
      },
      "children": [],
      "textProp": "dsrutext",
      "hrefProp": "dsruhref"
    },
    {
      "type": "text",
      "id": "j8BxH",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 280,
        "position": "absolute",
        "left": 720,
        "top": 186
      },
      "children": [],
      "textProp": "j8bxhtext",
      "hrefProp": "j8bxhhref"
    },
    {
      "type": "text",
      "id": "jw89N",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 280,
        "position": "absolute",
        "left": 720,
        "top": 226
      },
      "children": [],
      "textProp": "jw89ntext",
      "hrefProp": "jw89nhref"
    },
    {
      "type": "text",
      "id": "Cw1EJ",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 340,
        "position": "absolute",
        "left": 720,
        "top": 266
      },
      "children": [],
      "textProp": "cw1ejtext",
      "hrefProp": "cw1ejhref"
    },
    {
      "type": "text",
      "id": "aPsu1",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 280,
        "position": "absolute",
        "left": 720,
        "top": 306
      },
      "children": [],
      "textProp": "apsu1text",
      "hrefProp": "apsu1href"
    },
    {
      "type": "text",
      "id": "BHDNq",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 280,
        "position": "absolute",
        "left": 720,
        "top": 346
      },
      "children": [],
      "textProp": "bhdnqtext",
      "hrefProp": "bhdnqhref"
    },
    {
      "type": "text",
      "id": "yX6gd",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 280,
        "position": "absolute",
        "left": 720,
        "top": 386
      },
      "children": [],
      "textProp": "yx6gdtext",
      "hrefProp": "yx6gdhref"
    },
    {
      "type": "text",
      "id": "I4kml",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 280,
        "position": "absolute",
        "left": 720,
        "top": 426
      },
      "children": [],
      "textProp": "i4kmltext",
      "hrefProp": "i4kmlhref"
    },
    {
      "type": "text",
      "id": "kr6Fn",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 280,
        "position": "absolute",
        "left": 720,
        "top": 466
      },
      "children": [],
      "textProp": "kr6fntext",
      "hrefProp": "kr6fnhref"
    },
    {
      "type": "text",
      "id": "RzkdY",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 280,
        "position": "absolute",
        "left": 720,
        "top": 506
      },
      "children": [],
      "textProp": "rzkdytext",
      "hrefProp": "rzkdyhref"
    },
    {
      "type": "text",
      "id": "XIiVt",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#f2f2f2",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "500",
        "width": 220,
        "position": "absolute",
        "left": 1110,
        "top": 74
      },
      "children": [],
      "textProp": "xiivttext",
      "hrefProp": "xiivthref"
    },
    {
      "type": "text",
      "id": "2Ruhi",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 250,
        "position": "absolute",
        "left": 1110,
        "top": 146
      },
      "children": [],
      "textProp": "ruhitext",
      "hrefProp": "ruhihref"
    },
    {
      "type": "text",
      "id": "jwuxQ",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 250,
        "position": "absolute",
        "left": 1110,
        "top": 186
      },
      "children": [],
      "textProp": "jwuxqtext",
      "hrefProp": "jwuxqhref"
    },
    {
      "type": "text",
      "id": "Ztsyf",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 250,
        "position": "absolute",
        "left": 1110,
        "top": 226
      },
      "children": [],
      "textProp": "ztsyftext",
      "hrefProp": "ztsyfhref"
    },
    {
      "type": "text",
      "id": "ciwjH",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 250,
        "position": "absolute",
        "left": 1110,
        "top": 266
      },
      "children": [],
      "textProp": "ciwjhtext",
      "hrefProp": "ciwjhhref"
    },
    {
      "type": "text",
      "id": "6l3xZ",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 250,
        "position": "absolute",
        "left": 1110,
        "top": 306
      },
      "children": [],
      "textProp": "l3xztext",
      "hrefProp": "l3xzhref"
    },
    {
      "type": "text",
      "id": "dkM2c",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 250,
        "position": "absolute",
        "left": 1110,
        "top": 346
      },
      "children": [],
      "textProp": "dkm2ctext",
      "hrefProp": "dkm2chref"
    },
    {
      "type": "text",
      "id": "7zTmY",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 280,
        "position": "absolute",
        "left": 1110,
        "top": 386
      },
      "children": [],
      "textProp": "ztmytext",
      "hrefProp": "ztmyhref"
    },
    {
      "type": "text",
      "id": "o5npR",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 250,
        "position": "absolute",
        "left": 1110,
        "top": 426
      },
      "children": [],
      "textProp": "o5nprtext",
      "hrefProp": "o5nprhref"
    },
    {
      "type": "text",
      "id": "Nbcwe",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d8d8d8",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "normal",
        "width": 250,
        "position": "absolute",
        "left": 1110,
        "top": 466
      },
      "children": [],
      "textProp": "nbcwetext",
      "hrefProp": "nbcwehref"
    },
    {
      "type": "line",
      "id": "cxstO",
      "name": "lineF",
      "style": {
        "boxSizing": "border-box"
      },
      "children": []
    },
    {
      "type": "text",
      "id": "dhspb",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#b6b8bc",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "normal",
        "width": 720,
        "position": "absolute",
        "left": 72,
        "top": 636
      },
      "children": [],
      "textProp": "dhspbtext",
      "hrefProp": "dhspbhref"
    },
    {
      "type": "text",
      "id": "Y4Ewx",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#b6b8bc",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "normal",
        "width": 560,
        "position": "absolute",
        "left": 870,
        "top": 636
      },
      "children": [],
      "textProp": "y4ewxtext",
      "hrefProp": "y4ewxhref"
    },
    {
      "type": "frame",
      "id": "xWqbn",
      "name": "yellow",
      "style": {
        "boxSizing": "border-box",
        "width": 1440,
        "height": 12,
        "background": "#f4c300",
        "position": "absolute",
        "left": 0,
        "top": 688
      },
      "children": []
    },
    {
      "type": "text",
      "id": "rEeTC",
      "name": "social",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#d7d9dc",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "600",
        "textAlign": "center",
        "width": 160,
        "position": "absolute",
        "left": 72,
        "top": 538
      },
      "children": [],
      "textProp": "socialtext",
      "hrefProp": "socialhref"
    },
    {
      "type": "frame",
      "id": "n8ehO",
      "name": "fb",
      "style": {
        "boxSizing": "border-box",
        "width": 130,
        "height": 38,
        "borderRadius": 4,
        "background": "#333538",
        "border": "1px solid #6a6d72",
        "position": "absolute",
        "overflow": "hidden",
        "left": 265,
        "top": 528
      },
      "children": [
        {
          "type": "text",
          "id": "LG5RV",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#f2f2f2",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "600",
            "textAlign": "center",
            "width": 100,
            "position": "absolute",
            "left": 16,
            "top": 12
          },
          "children": [],
          "textProp": "lg5rvtext"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "0FZnn",
  "ygowatext": "Chat with Experts",
  "en0vttext": "(833) 893-1514",
  "e5hltext": "Message Sales",
  "col2ttext": "Need Help?",
  "col2thref": "/",
  "cgx84text": "Customer Support",
  "cgx84href": "/contact",
  "kgdwltext": "Frequently Asked Questions",
  "kgdwlhref": "/",
  "pvxsgtext": "Track Order",
  "pvxsghref": "/",
  "idhptext": "Returns & Cancellations",
  "idhphref": "/",
  "fknqqtext": "Safety Data Sheets",
  "fknqqhref": "/",
  "lke0atext": "Popular Categories",
  "lke0ahref": "/",
  "dsrutext": "O.D. and I.D. Turning",
  "dsruhref": "/",
  "j8bxhtext": "Modular Drills",
  "j8bxhhref": "/",
  "jw89ntext": "Solid Carbide Drills",
  "jw89nhref": "/",
  "cw1ejtext": "High-Performance Solid Carbide End Mills",
  "cw1ejhref": "/",
  "apsu1text": "0°/90° Shoulder Mills",
  "apsu1href": "/",
  "bhdnqtext": "Indexable Milling",
  "bhdnqhref": "/",
  "yx6gdtext": "Solid End Milling",
  "yx6gdhref": "/",
  "i4kmltext": "Grooving and Cut-Off",
  "i4kmlhref": "/",
  "kr6fntext": "Indexable Drilling",
  "kr6fnhref": "/",
  "rzkdytext": "Profiling",
  "rzkdyhref": "/",
  "xiivttext": "About Us",
  "xiivthref": "/about",
  "ruhitext": "About Kennametal",
  "ruhihref": "/about",
  "jwuxqtext": "Kennametal Careers",
  "jwuxqhref": "/",
  "ztsyftext": "Investor Relations",
  "ztsyfhref": "/",
  "ciwjhtext": "History",
  "ciwjhhref": "/",
  "l3xztext": "Events",
  "l3xzhref": "/",
  "dkm2ctext": "Corporate News",
  "dkm2chref": "/",
  "ztmytext": "Doing Business with Kennametal",
  "ztmyhref": "/",
  "o5nprtext": "Ethics & Compliance",
  "o5nprhref": "/",
  "nbcwetext": "Certificates",
  "nbcwehref": "/",
  "dhspbtext": "2026 Terms & Conditions of Use | Conditions of Sale | Data Privacy Policy | Sitemap",
  "dhspbhref": "/privacy",
  "y4ewxtext": "Kennametal Inc. 525 William Penn Place Suite 3300, Pittsburgh, PA 15219",
  "y4ewxhref": "/",
  "socialtext": "f   in   yt   ig",
  "socialhref": "/",
  "lg5rvtext": "Give Feedback"
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
const NAV_ACTIVE_COLOR = "var(--pen-theme-text, #b6b8bc)";
const NAV_INACTIVE_COLOR = "var(--pen-theme-text-secondary, #f2f2f2)";
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

export default function TemplateExclusivePenSiteProducts1FooterFooterpenAlt2({ id, ygowatext, en0vttext, e5hltext, col2ttext, col2thref, cgx84text, cgx84href, kgdwltext, kgdwlhref, pvxsgtext, pvxsghref, idhptext, idhphref, fknqqtext, fknqqhref, lke0atext, lke0ahref, dsrutext, dsruhref, j8bxhtext, j8bxhhref, jw89ntext, jw89nhref, cw1ejtext, cw1ejhref, apsu1text, apsu1href, bhdnqtext, bhdnqhref, yx6gdtext, yx6gdhref, i4kmltext, i4kmlhref, kr6fntext, kr6fnhref, rzkdytext, rzkdyhref, xiivttext, xiivthref, ruhitext, ruhihref, jwuxqtext, jwuxqhref, ztsyftext, ztsyfhref, ciwjhtext, ciwjhhref, l3xztext, l3xzhref, dkm2ctext, dkm2chref, ztmytext, ztmyhref, o5nprtext, o5nprhref, nbcwetext, nbcwehref, dhspbtext, dhspbhref, y4ewxtext, y4ewxhref, socialtext, socialhref, lg5rvtext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, ygowatext, en0vttext, e5hltext, col2ttext, col2thref, cgx84text, cgx84href, kgdwltext, kgdwlhref, pvxsgtext, pvxsghref, idhptext, idhphref, fknqqtext, fknqqhref, lke0atext, lke0ahref, dsrutext, dsruhref, j8bxhtext, j8bxhhref, jw89ntext, jw89nhref, cw1ejtext, cw1ejhref, apsu1text, apsu1href, bhdnqtext, bhdnqhref, yx6gdtext, yx6gdhref, i4kmltext, i4kmlhref, kr6fntext, kr6fnhref, rzkdytext, rzkdyhref, xiivttext, xiivthref, ruhitext, ruhihref, jwuxqtext, jwuxqhref, ztsyftext, ztsyfhref, ciwjhtext, ciwjhhref, l3xztext, l3xzhref, dkm2ctext, dkm2chref, ztmytext, ztmyhref, o5nprtext, o5nprhref, nbcwetext, nbcwehref, dhspbtext, dhspbhref, y4ewxtext, y4ewxhref, socialtext, socialhref, lg5rvtext });
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