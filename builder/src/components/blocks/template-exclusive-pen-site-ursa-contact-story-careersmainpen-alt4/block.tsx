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
  "id": "HjWOo",
  "name": "careers_main",
  "style": {
    "boxSizing": "border-box",
    "width": 1440,
    "height": 1902,
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "text",
      "id": "77gLt",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#F3F7FC",
        "fontFamily": "Inter",
        "fontSize": 40,
        "fontWeight": "800",
        "position": "absolute",
        "left": 509,
        "top": 34
      },
      "children": [],
      "textProp": "glttext"
    },
    {
      "type": "frame",
      "id": "QMZcj",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 300,
        "height": 140,
        "background": "#0A0F17",
        "border": "1px solid #2B3341",
        "position": "absolute",
        "overflow": "hidden",
        "left": 234,
        "top": 128
      },
      "children": [
        {
          "type": "text",
          "id": "4nSkX",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#E6EDF8",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "700",
            "position": "absolute",
            "left": 24,
            "top": 34
          },
          "children": [],
          "textProp": "nskxtext"
        },
        {
          "type": "text",
          "id": "Uyiot",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#AEB9C8",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "500",
            "position": "absolute",
            "left": 24,
            "top": 94
          },
          "children": [],
          "textProp": "uyiottext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "WAoss",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 300,
        "height": 140,
        "background": "#0A0F17",
        "border": "1px solid #2B3341",
        "position": "absolute",
        "overflow": "hidden",
        "left": 570,
        "top": 128
      },
      "children": [
        {
          "type": "text",
          "id": "VnBpu",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#E6EDF8",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "700",
            "position": "absolute",
            "left": 24,
            "top": 34
          },
          "children": [],
          "textProp": "vnbputext"
        },
        {
          "type": "text",
          "id": "Q4OLr",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#AEB9C8",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "500",
            "position": "absolute",
            "left": 24,
            "top": 94
          },
          "children": [],
          "textProp": "q4olrtext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "rjX6g",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 300,
        "height": 140,
        "background": "#0A0F17",
        "border": "1px solid #2B3341",
        "position": "absolute",
        "overflow": "hidden",
        "left": 906,
        "top": 128
      },
      "children": [
        {
          "type": "text",
          "id": "2nhQW",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#E6EDF8",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "700",
            "position": "absolute",
            "left": 24,
            "top": 34
          },
          "children": [],
          "textProp": "nhqwtext"
        },
        {
          "type": "text",
          "id": "oQfvL",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#AEB9C8",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "500",
            "position": "absolute",
            "left": 24,
            "top": 94
          },
          "children": [],
          "textProp": "oqfvltext"
        }
      ]
    },
    {
      "type": "text",
      "id": "QnWOC",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#F3F7FC",
        "fontFamily": "Inter",
        "fontSize": 40,
        "fontWeight": "800",
        "position": "absolute",
        "left": 558,
        "top": 320
      },
      "children": [],
      "textProp": "qnwoctext"
    },
    {
      "type": "rectangle",
      "id": "e3gRe",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 1120,
        "height": 1,
        "background": "#2A3240",
        "position": "absolute",
        "left": 160,
        "top": 402
      },
      "children": []
    },
    {
      "type": "text",
      "id": "qZtFE",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#9EABBD",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "600",
        "position": "absolute",
        "left": 190,
        "top": 420
      },
      "children": [],
      "textProp": "qztfetext"
    },
    {
      "type": "text",
      "id": "x7Xvb",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#9EABBD",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "600",
        "position": "absolute",
        "left": 980,
        "top": 420
      },
      "children": [],
      "textProp": "x7xvbtext"
    },
    {
      "type": "rectangle",
      "id": "nPygY",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 1120,
        "height": 1,
        "background": "#1E2632",
        "position": "absolute",
        "left": 160,
        "top": 454
      },
      "children": []
    },
    {
      "type": "text",
      "id": "4KLa0",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#E5ECF6",
        "fontFamily": "Inter",
        "fontSize": 15,
        "fontWeight": "500",
        "position": "absolute",
        "left": 190,
        "top": 474
      },
      "children": [],
      "textProp": "kla0text"
    },
    {
      "type": "text",
      "id": "7rJ55",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B7C2D1",
        "fontFamily": "Inter",
        "fontSize": 15,
        "fontWeight": "500",
        "position": "absolute",
        "left": 980,
        "top": 474
      },
      "children": [],
      "textProp": "rj55text"
    },
    {
      "type": "rectangle",
      "id": "T6Ofe",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 1120,
        "height": 1,
        "background": "#1E2632",
        "position": "absolute",
        "left": 160,
        "top": 510
      },
      "children": []
    },
    {
      "type": "text",
      "id": "jYQ3N",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#E5ECF6",
        "fontFamily": "Inter",
        "fontSize": 15,
        "fontWeight": "500",
        "position": "absolute",
        "left": 190,
        "top": 530
      },
      "children": [],
      "textProp": "jyq3ntext"
    },
    {
      "type": "text",
      "id": "nmdu8",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B7C2D1",
        "fontFamily": "Inter",
        "fontSize": 15,
        "fontWeight": "500",
        "position": "absolute",
        "left": 980,
        "top": 530
      },
      "children": [],
      "textProp": "nmdu8text"
    },
    {
      "type": "rectangle",
      "id": "fBiwb",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 1120,
        "height": 1,
        "background": "#1E2632",
        "position": "absolute",
        "left": 160,
        "top": 566
      },
      "children": []
    },
    {
      "type": "text",
      "id": "n1dno",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#E5ECF6",
        "fontFamily": "Inter",
        "fontSize": 15,
        "fontWeight": "500",
        "position": "absolute",
        "left": 190,
        "top": 586
      },
      "children": [],
      "textProp": "n1dnotext"
    },
    {
      "type": "text",
      "id": "ay4Od",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B7C2D1",
        "fontFamily": "Inter",
        "fontSize": 15,
        "fontWeight": "500",
        "position": "absolute",
        "left": 980,
        "top": 586
      },
      "children": [],
      "textProp": "ay4odtext"
    },
    {
      "type": "rectangle",
      "id": "FFHD2",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 1120,
        "height": 1,
        "background": "#1E2632",
        "position": "absolute",
        "left": 160,
        "top": 622
      },
      "children": []
    },
    {
      "type": "text",
      "id": "oezzK",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#E5ECF6",
        "fontFamily": "Inter",
        "fontSize": 15,
        "fontWeight": "500",
        "position": "absolute",
        "left": 190,
        "top": 642
      },
      "children": [],
      "textProp": "oezzktext"
    },
    {
      "type": "text",
      "id": "Rxm1S",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B7C2D1",
        "fontFamily": "Inter",
        "fontSize": 15,
        "fontWeight": "500",
        "position": "absolute",
        "left": 980,
        "top": 642
      },
      "children": [],
      "textProp": "rxm1stext"
    },
    {
      "type": "rectangle",
      "id": "frCba",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 1120,
        "height": 1,
        "background": "#1E2632",
        "position": "absolute",
        "left": 160,
        "top": 678
      },
      "children": []
    },
    {
      "type": "text",
      "id": "aHlgx",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#E5ECF6",
        "fontFamily": "Inter",
        "fontSize": 15,
        "fontWeight": "500",
        "position": "absolute",
        "left": 190,
        "top": 698
      },
      "children": [],
      "textProp": "ahlgxtext"
    },
    {
      "type": "text",
      "id": "DzLfD",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B7C2D1",
        "fontFamily": "Inter",
        "fontSize": 15,
        "fontWeight": "500",
        "position": "absolute",
        "left": 980,
        "top": 698
      },
      "children": [],
      "textProp": "dzlfdtext"
    },
    {
      "type": "text",
      "id": "U2fIU",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#F3F7FC",
        "fontFamily": "Inter",
        "fontSize": 40,
        "fontWeight": "800",
        "position": "absolute",
        "left": 632,
        "top": 818
      },
      "children": [],
      "textProp": "u2fiutext"
    },
    {
      "type": "ellipse",
      "id": "2nul3",
      "name": "",
      "style": {
        "boxSizing": "border-box"
      },
      "children": []
    },
    {
      "type": "ellipse",
      "id": "RlB7m",
      "name": "",
      "style": {
        "boxSizing": "border-box"
      },
      "children": []
    },
    {
      "type": "ellipse",
      "id": "SBybF",
      "name": "",
      "style": {
        "boxSizing": "border-box"
      },
      "children": []
    },
    {
      "type": "text",
      "id": "K4Zgq",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#D6DFEC",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "600",
        "position": "absolute",
        "left": 470,
        "top": 1150
      },
      "children": [],
      "textProp": "k4zgqtext"
    },
    {
      "type": "text",
      "id": "70bum",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#D6DFEC",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "600",
        "position": "absolute",
        "left": 788,
        "top": 1150
      },
      "children": [],
      "textProp": "bumtext"
    },
    {
      "type": "text",
      "id": "KsQmR",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#F3F7FC",
        "fontFamily": "Inter",
        "fontSize": 40,
        "fontWeight": "800",
        "position": "absolute",
        "left": 619,
        "top": 1358
      },
      "children": [],
      "textProp": "ksqmrtext"
    },
    {
      "type": "frame",
      "id": "CBGD3",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 480,
        "height": 350,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover",
        "position": "absolute",
        "left": 185,
        "top": 1459
      },
      "children": [],
      "imageProp": "cbgd3imagesrc"
    },
    {
      "type": "text",
      "id": "yMHBm",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#D2DCEC",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "500",
        "lineHeight": 1.5,
        "width": 500,
        "position": "absolute",
        "left": 735,
        "top": 1493
      },
      "children": [],
      "textProp": "ymhbmtext"
    },
    {
      "type": "rectangle",
      "id": "xsmWv",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 520,
        "height": 42,
        "background": "#0B1018",
        "border": "1px solid #2E3745",
        "position": "absolute",
        "left": 735,
        "top": 1583
      },
      "children": []
    },
    {
      "type": "text",
      "id": "JCzsX",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#8F9DB0",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "500",
        "position": "absolute",
        "left": 753,
        "top": 1596
      },
      "children": [],
      "textProp": "jczsxtext"
    },
    {
      "type": "rectangle",
      "id": "EY2uA",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 520,
        "height": 42,
        "background": "#0B1018",
        "border": "1px solid #2E3745",
        "position": "absolute",
        "left": 735,
        "top": 1639
      },
      "children": []
    },
    {
      "type": "text",
      "id": "ix97y",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#8F9DB0",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "500",
        "position": "absolute",
        "left": 753,
        "top": 1652
      },
      "children": [],
      "textProp": "ix97ytext"
    },
    {
      "type": "rectangle",
      "id": "Qtnla",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 520,
        "height": 74,
        "background": "#0B1018",
        "border": "1px solid #2E3745",
        "position": "absolute",
        "left": 735,
        "top": 1695
      },
      "children": []
    },
    {
      "type": "text",
      "id": "66UgP",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#8F9DB0",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "500",
        "position": "absolute",
        "left": 753,
        "top": 1723
      },
      "children": [],
      "textProp": "ugptext"
    },
    {
      "type": "rectangle",
      "id": "S3d4z",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "width": 260,
        "height": 40,
        "background": "#F15A24",
        "position": "absolute",
        "left": 995,
        "top": 1789
      },
      "children": []
    },
    {
      "type": "text",
      "id": "LLzD5",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#0B1018",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "800",
        "position": "absolute",
        "left": 1093,
        "top": 1798
      },
      "children": [],
      "textProp": "llzd5text"
    },
    {
      "type": "text",
      "id": "KLoVN",
      "name": "",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#D6DFEC",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "600",
        "position": "absolute",
        "left": 637,
        "top": 1000
      },
      "children": [],
      "textProp": "klovntext"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "HjWOo",
  "glttext": "FEATURED POSITIONS",
  "nskxtext": "Senior Additive Technician",
  "uyiottext": "Colorado",
  "vnbputext": "Propulsion Engineer",
  "q4olrtext": "Colorado",
  "nhqwtext": "Strategic Program Manager",
  "oqfvltext": "Colorado",
  "qnwoctext": "OPEN POSITIONS",
  "qztfetext": "Role",
  "x7xvbtext": "Location",
  "kla0text": "Director of Manufacturing Development",
  "rj55text": "Berthoud, CO",
  "jyq3ntext": "Additive Quality Engineer",
  "nmdu8text": "Berthoud, CO",
  "n1dnotext": "Advanced Propulsion Program Director",
  "ay4odtext": "Berthoud, CO",
  "oezzktext": "GNC Engineer",
  "rxm1stext": "Long Beach, CA",
  "ahlgxtext": "Senior Test Technician",
  "dzlfdtext": "Pueblo, CO",
  "u2fiutext": "BENEFITS",
  "k4zgqtext": "Financial Security",
  "bumtext": "Paid Time Off",
  "ksqmrtext": "CONTACT",
  "cbgd3imagesrc": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80",
  "ymhbmtext": "Let us know your background and interests.\nOur team will follow up with relevant roles.",
  "jczsxtext": "Name",
  "ix97ytext": "Email",
  "ugptext": "Message",
  "llzd5text": "Submit",
  "klovntext": "Health & Care"
};
const DEFAULT_THEME = {
  "mode": "dark",
  "fontHeading": "Inter",
  "fontBody": "Inter",
  "motion": "subtle",
  "fontFamilies": [
    "Inter"
  ],
  "palette": {
    "bg": "#06080D",
    "text": "#F3F5F7",
    "primary": "#4F77FF",
    "accent": "#4F77FF",
    "neutral": "#1F2937",
    "textSecondary": "#9CA3AF"
  },
  "primaryColor": "#4F77FF",
  "layoutRules": {
    "maxWidth": "1400px",
    "sectionPadding": "py-24",
    "grid": "12-col"
  },
  "tokens": {
    "surface": "glass",
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

export default function TemplateExclusivePenSiteUrsaContactStoryCareersmainpenAlt4({ id, glttext, nskxtext, uyiottext, vnbputext, q4olrtext, nhqwtext, oqfvltext, qnwoctext, qztfetext, x7xvbtext, kla0text, rj55text, jyq3ntext, nmdu8text, n1dnotext, ay4odtext, oezzktext, rxm1stext, ahlgxtext, dzlfdtext, u2fiutext, k4zgqtext, bumtext, ksqmrtext, cbgd3imagesrc, ymhbmtext, jczsxtext, ix97ytext, ugptext, llzd5text, klovntext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, glttext, nskxtext, uyiottext, vnbputext, q4olrtext, nhqwtext, oqfvltext, qnwoctext, qztfetext, x7xvbtext, kla0text, rj55text, jyq3ntext, nmdu8text, n1dnotext, ay4odtext, oezzktext, rxm1stext, ahlgxtext, dzlfdtext, u2fiutext, k4zgqtext, bumtext, ksqmrtext, cbgd3imagesrc, ymhbmtext, jczsxtext, ix97ytext, ugptext, llzd5text, klovntext });
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