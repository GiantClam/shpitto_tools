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
  "id": "vEeoQ",
  "name": "section2b",
  "style": {
    "boxSizing": "border-box",
    "width": 1200,
    "height": 980,
    "background": "#F1F2F4",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "text",
      "id": "M3jzS",
      "name": "benefitsTag",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#7F8792",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "600",
        "position": "absolute",
        "left": 62,
        "top": 58
      },
      "children": [],
      "textProp": "benefitstagtext"
    },
    {
      "type": "text",
      "id": "hw4iY",
      "name": "benefitsTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#0F141B",
        "fontFamily": "Inter",
        "fontSize": 62,
        "fontWeight": "700",
        "lineHeight": 1.05,
        "width": 710,
        "position": "absolute",
        "left": 62,
        "top": 92
      },
      "children": [],
      "textProp": "benefitstitletext"
    },
    {
      "type": "text",
      "id": "mdKTg",
      "name": "meetTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#0F141B",
        "fontFamily": "Inter",
        "fontSize": 56,
        "fontWeight": "700",
        "lineHeight": 1.05,
        "width": 1001,
        "position": "absolute",
        "left": 62,
        "top": 430
      },
      "children": [],
      "textProp": "meettitletext"
    },
    {
      "type": "text",
      "id": "H7eX6",
      "name": "meetBody",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#59626E",
        "fontFamily": "Inter",
        "fontSize": 18,
        "fontWeight": "500",
        "lineHeight": 1.4,
        "width": 700,
        "position": "absolute",
        "left": 62,
        "top": 582
      },
      "children": [],
      "textProp": "meetbodytext"
    },
    {
      "type": "frame",
      "id": "D7TCo",
      "name": "meetCta",
      "style": {
        "boxSizing": "border-box",
        "width": 350,
        "height": 50,
        "borderRadius": 10,
        "background": "#FF6A00",
        "position": "absolute",
        "overflow": "hidden",
        "left": 62,
        "top": 664
      },
      "children": [
        {
          "type": "text",
          "id": "l20sg",
          "name": "meetCtaTxt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Inter",
            "fontSize": 18,
            "fontWeight": "700",
            "position": "absolute",
            "left": 26,
            "top": 14
          },
          "children": [],
          "textProp": "meetctatxttext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "t3tkk",
      "name": "benefitCard1",
      "style": {
        "boxSizing": "border-box",
        "width": 344,
        "height": 132,
        "borderRadius": 10,
        "background": "#F1F2F4",
        "border": "1px solid #B8C0CA",
        "position": "absolute",
        "overflow": "hidden",
        "left": 62,
        "top": 224
      },
      "children": [
        {
          "type": "frame",
          "id": "K2KEq",
          "name": "icon1",
          "style": {
            "boxSizing": "border-box",
            "width": 34,
            "height": 24,
            "position": "absolute",
            "overflow": "hidden",
            "left": 24,
            "top": 18
          },
          "children": [
            {
              "type": "rectangle",
              "id": "nwMVJ",
              "name": "i1a",
              "style": {
                "boxSizing": "border-box",
                "width": 20,
                "height": 12,
                "borderRadius": 2,
                "border": "1px solid #FF6A00",
                "position": "absolute",
                "left": 2,
                "top": 6
              },
              "children": []
            },
            {
              "type": "rectangle",
              "id": "ycmmh",
              "name": "i1b",
              "style": {
                "boxSizing": "border-box",
                "width": 20,
                "height": 12,
                "borderRadius": 2,
                "border": "1px solid #8FA0B2",
                "position": "absolute",
                "left": 8,
                "top": 2
              },
              "children": []
            }
          ]
        },
        {
          "type": "text",
          "id": "aM3L9",
          "name": "t1",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1A212B",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 24,
            "top": 56
          },
          "children": [],
          "textProp": "t1text"
        },
        {
          "type": "text",
          "id": "hRtCw",
          "name": "d1",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5E6774",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "500",
            "lineHeight": 1.35,
            "width": 294,
            "position": "absolute",
            "left": 24,
            "top": 88
          },
          "children": [],
          "textProp": "d1text"
        }
      ]
    },
    {
      "type": "frame",
      "id": "WYoiv",
      "name": "benefitCard2",
      "style": {
        "boxSizing": "border-box",
        "width": 344,
        "height": 132,
        "borderRadius": 10,
        "background": "#F1F2F4",
        "border": "1px solid #B8C0CA",
        "position": "absolute",
        "overflow": "hidden",
        "left": 428,
        "top": 224
      },
      "children": [
        {
          "type": "frame",
          "id": "8tkS5",
          "name": "icon2",
          "style": {
            "boxSizing": "border-box",
            "width": 34,
            "height": 28,
            "position": "absolute",
            "overflow": "hidden",
            "left": 24,
            "top": 16
          },
          "children": [
            {
              "type": "ellipse",
              "id": "RRRRk",
              "name": "i2a",
              "style": {
                "boxSizing": "border-box"
              },
              "children": []
            },
            {
              "type": "ellipse",
              "id": "5tR0P",
              "name": "i2b",
              "style": {
                "boxSizing": "border-box"
              },
              "children": []
            }
          ]
        },
        {
          "type": "text",
          "id": "agN8h",
          "name": "t2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1A212B",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 24,
            "top": 56
          },
          "children": [],
          "textProp": "t2text"
        },
        {
          "type": "text",
          "id": "sPoeg",
          "name": "d2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5E6774",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "500",
            "lineHeight": 1.35,
            "width": 294,
            "position": "absolute",
            "left": 24,
            "top": 88
          },
          "children": [],
          "textProp": "d2text"
        }
      ]
    },
    {
      "type": "frame",
      "id": "7f3eu",
      "name": "benefitCard3",
      "style": {
        "boxSizing": "border-box",
        "width": 344,
        "height": 132,
        "borderRadius": 10,
        "background": "#F1F2F4",
        "border": "1px solid #B8C0CA",
        "position": "absolute",
        "overflow": "hidden",
        "left": 794,
        "top": 224
      },
      "children": [
        {
          "type": "frame",
          "id": "NjPA1",
          "name": "icon3",
          "style": {
            "boxSizing": "border-box",
            "width": 34,
            "height": 28,
            "position": "absolute",
            "overflow": "hidden",
            "left": 24,
            "top": 16
          },
          "children": [
            {
              "type": "rectangle",
              "id": "ZtoRV",
              "name": "i3a",
              "style": {
                "boxSizing": "border-box",
                "width": 14,
                "height": 14,
                "borderRadius": 3,
                "border": "1px solid #FF6A00",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": []
            },
            {
              "type": "rectangle",
              "id": "mDWic",
              "name": "i3b",
              "style": {
                "boxSizing": "border-box",
                "width": 14,
                "height": 14,
                "borderRadius": 3,
                "border": "1px solid #8FA0B2",
                "position": "absolute",
                "left": 10,
                "top": 10
              },
              "children": []
            },
            {
              "type": "rectangle",
              "id": "Pli6g",
              "name": "i3c",
              "style": {
                "boxSizing": "border-box",
                "width": 14,
                "height": 14,
                "borderRadius": 3,
                "border": "1px solid #8FA0B2",
                "position": "absolute",
                "left": 20,
                "top": 0
              },
              "children": []
            }
          ]
        },
        {
          "type": "text",
          "id": "jSxvQ",
          "name": "t3",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1A212B",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "700",
            "position": "absolute",
            "left": 24,
            "top": 56
          },
          "children": [],
          "textProp": "t3text"
        },
        {
          "type": "text",
          "id": "6hgEG",
          "name": "d3",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5E6774",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "500",
            "lineHeight": 1.35,
            "width": 294,
            "position": "absolute",
            "left": 24,
            "top": 88
          },
          "children": [],
          "textProp": "d3text"
        }
      ]
    },
    {
      "type": "frame",
      "id": "uZpy8",
      "name": "systemsWrap",
      "style": {
        "boxSizing": "border-box",
        "width": 1076,
        "height": 220,
        "position": "absolute",
        "overflow": "hidden",
        "left": 62,
        "top": 738
      },
      "children": [
        {
          "type": "rectangle",
          "id": "w3ycS",
          "name": "rearSystem",
          "style": {
            "boxSizing": "border-box",
            "width": 300,
            "height": 148,
            "borderRadius": 8,
            "background": "linear-gradient(90deg, #9AA2AB 0%, #5D646E 100%)",
            "position": "absolute",
            "left": 0,
            "top": 48
          },
          "children": []
        },
        {
          "type": "rectangle",
          "id": "GBKob",
          "name": "midSystem",
          "style": {
            "boxSizing": "border-box",
            "width": 520,
            "height": 132,
            "borderRadius": 8,
            "background": "linear-gradient(90deg, #5E6672 0%, #2F3540 100%)",
            "position": "absolute",
            "left": 280,
            "top": 70
          },
          "children": []
        },
        {
          "type": "rectangle",
          "id": "Pda1w",
          "name": "frontSystem",
          "style": {
            "boxSizing": "border-box",
            "width": 548,
            "height": 128,
            "borderRadius": 8,
            "background": "linear-gradient(90deg, #4C535E 0%, #222833 100%)",
            "position": "absolute",
            "left": 400,
            "top": 82
          },
          "children": []
        },
        {
          "type": "rectangle",
          "id": "ltQNc",
          "name": "rightSystem",
          "style": {
            "boxSizing": "border-box",
            "width": 160,
            "height": 122,
            "borderRadius": 8,
            "background": "linear-gradient(90deg, #707782 0%, #3A404A 100%)",
            "position": "absolute",
            "left": 916,
            "top": 84
          },
          "children": []
        },
        {
          "type": "text",
          "id": "dLweg",
          "name": "frontLogo",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#AAB2BD",
            "fontFamily": "Inter",
            "fontSize": 22,
            "fontWeight": "700",
            "position": "absolute",
            "left": 438,
            "top": 96
          },
          "children": [],
          "textProp": "frontlogotext"
        },
        {
          "type": "text",
          "id": "2opye",
          "name": "rearLogo",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#AAB2BD",
            "fontFamily": "Inter",
            "fontSize": 22,
            "fontWeight": "700",
            "position": "absolute",
            "left": 92,
            "top": 66
          },
          "children": [],
          "textProp": "rearlogotext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "rNRFK",
      "name": "BrowseBlog",
      "style": {
        "boxSizing": "border-box",
        "width": 1200,
        "height": 463,
        "background": "#06080C",
        "position": "absolute",
        "overflow": "hidden",
        "left": 0,
        "top": 980
      },
      "children": [
        {
          "type": "text",
          "id": "rpbij",
          "name": "tab1",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FF6A00",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "700",
            "position": "absolute",
            "left": 32,
            "top": 36
          },
          "children": [],
          "textProp": "tab1text"
        },
        {
          "type": "text",
          "id": "O80s4",
          "name": "tab2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#9AA4AF",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "600",
            "position": "absolute",
            "left": 124,
            "top": 36
          },
          "children": [],
          "textProp": "tab2text"
        },
        {
          "type": "text",
          "id": "ciPk4",
          "name": "tab3",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#9AA4AF",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "600",
            "position": "absolute",
            "left": 272,
            "top": 36
          },
          "children": [],
          "textProp": "tab3text"
        },
        {
          "type": "frame",
          "id": "EwBmV",
          "name": "div",
          "style": {
            "boxSizing": "border-box",
            "width": 1136,
            "height": 1,
            "background": "#20252D",
            "position": "absolute",
            "left": 32,
            "top": 64
          },
          "children": []
        },
        {
          "type": "text",
          "id": "7dUwv",
          "name": "head",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#F1F5FA",
            "fontFamily": "Inter",
            "fontSize": 56,
            "fontWeight": "700",
            "position": "absolute",
            "left": 32,
            "top": 98
          },
          "children": [],
          "textProp": "headtext"
        },
        {
          "type": "frame",
          "id": "yenCK",
          "name": "viewBtn",
          "style": {
            "boxSizing": "border-box",
            "width": 154,
            "height": 40,
            "borderRadius": 10,
            "background": "#0C1016",
            "border": "1px solid #586271",
            "position": "absolute",
            "overflow": "hidden",
            "left": 1014,
            "top": 94
          },
          "children": [
            {
              "type": "text",
              "id": "iB13u",
              "name": "viewTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#E7EDF4",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "600",
                "position": "absolute",
                "left": 24,
                "top": 10
              },
              "children": [],
              "textProp": "viewtxttext"
            }
          ],
          "hrefProp": "viewbtnhref"
        },
        {
          "type": "frame",
          "id": "6A2cm",
          "name": "card1",
          "style": {
            "boxSizing": "border-box",
            "width": 368,
            "height": 230,
            "borderRadius": 14,
            "background": "#111A24",
            "border": "1px solid #273241",
            "position": "absolute",
            "overflow": "hidden",
            "left": 32,
            "top": 182
          },
          "children": [
            {
              "type": "text",
              "id": "K9cwr",
              "name": "c1t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F1F5FA",
                "fontFamily": "Inter",
                "fontSize": 17,
                "fontWeight": "700",
                "lineHeight": 1.2,
                "width": 320,
                "position": "absolute",
                "left": 24,
                "top": 22
              },
              "children": [],
              "textProp": "c1ttext"
            },
            {
              "type": "text",
              "id": "djUTu",
              "name": "c1m",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#98A4B2",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "500",
                "position": "absolute",
                "left": 24,
                "top": 172
              },
              "children": [],
              "textProp": "c1mtext"
            },
            {
              "type": "text",
              "id": "ndRDY",
              "name": "c1r",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FF6A00",
                "fontFamily": "Inter",
                "fontSize": 14,
                "fontWeight": "700",
                "position": "absolute",
                "left": 24,
                "top": 198
              },
              "children": [],
              "textProp": "c1rtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "7zm4M",
          "name": "card2",
          "style": {
            "boxSizing": "border-box",
            "width": 368,
            "height": 230,
            "borderRadius": 14,
            "background": "#111A24",
            "border": "1px solid #273241",
            "position": "absolute",
            "overflow": "hidden",
            "left": 416,
            "top": 182
          },
          "children": [
            {
              "type": "text",
              "id": "J4EvR",
              "name": "c2t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F1F5FA",
                "fontFamily": "Inter",
                "fontSize": 17,
                "fontWeight": "700",
                "lineHeight": 1.2,
                "width": 320,
                "position": "absolute",
                "left": 24,
                "top": 22
              },
              "children": [],
              "textProp": "c2ttext"
            },
            {
              "type": "text",
              "id": "VDdeb",
              "name": "c2m",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#98A4B2",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "500",
                "position": "absolute",
                "left": 24,
                "top": 172
              },
              "children": [],
              "textProp": "c2mtext"
            },
            {
              "type": "text",
              "id": "YzabA",
              "name": "c2r",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FF6A00",
                "fontFamily": "Inter",
                "fontSize": 14,
                "fontWeight": "700",
                "position": "absolute",
                "left": 24,
                "top": 198
              },
              "children": [],
              "textProp": "c2rtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "am7nA",
          "name": "card3",
          "style": {
            "boxSizing": "border-box",
            "width": 368,
            "height": 230,
            "borderRadius": 14,
            "background": "#111A24",
            "border": "1px solid #273241",
            "position": "absolute",
            "overflow": "hidden",
            "left": 800,
            "top": 182
          },
          "children": [
            {
              "type": "text",
              "id": "P9JBO",
              "name": "c3t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F1F5FA",
                "fontFamily": "Inter",
                "fontSize": 17,
                "fontWeight": "700",
                "lineHeight": 1.2,
                "width": 320,
                "position": "absolute",
                "left": 24,
                "top": 22
              },
              "children": [],
              "textProp": "c3ttext"
            },
            {
              "type": "text",
              "id": "XATF5",
              "name": "c3m",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#98A4B2",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "500",
                "position": "absolute",
                "left": 24,
                "top": 172
              },
              "children": [],
              "textProp": "c3mtext"
            },
            {
              "type": "text",
              "id": "nE0Hd",
              "name": "c3r",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FF6A00",
                "fontFamily": "Inter",
                "fontSize": 14,
                "fontWeight": "700",
                "position": "absolute",
                "left": 24,
                "top": 198
              },
              "children": [],
              "textProp": "c3rtext"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "vEeoQ",
  "benefitstagtext": "[ Benefits ]",
  "benefitstitletext": "Why trapped ions?",
  "meettitletext": "Meet our newest and most\npowerful quantum computers",
  "meetbodytext": "Our latest systems are built for performance and practicality, enabling partners to solve their largest and most complex real-world business problems.",
  "meetctatxttext": "See our industry-leading systems",
  "t1text": "Ultra-high fidelity",
  "d1text": "Reduced error rates mean fewer corrections and more reliable computations.",
  "t2text": "All-to-all connectivity",
  "d2text": "Every qubit can interact with every other qubit directly.",
  "t3text": "Long coherence",
  "d3text": "Ions can remain in superposition for longer than other qubit types.",
  "frontlogotext": "IONQ",
  "rearlogotext": "IONQ",
  "tab1text": "Our blog",
  "tab2text": "Our publications",
  "tab3text": "News & announcements",
  "headtext": "Browse blogs",
  "viewbtnhref": "/blog",
  "viewtxttext": "View all blogs",
  "c1ttext": "Breaking the decoding\nbottleneck: Fast and accurate\nsoftware decoding for\nQuantum LDPC codes",
  "c1mtext": "@ IonQ Staff",
  "c1rtext": "Read more  ->",
  "c2ttext": "The Birth of Quantum\nComputers: How Dr. Chris\nMonroe Ignited the Quantum\nComputing Revolution",
  "c2mtext": "@ IonQ Staff",
  "c2rtext": "Read more  ->",
  "c3ttext": "Demystifying Logical Qubits\nand Fault Tolerance",
  "c3mtext": "@ IonQ Staff",
  "c3rtext": "Read more  ->"
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
    "bg": "#06080C",
    "text": "#E7EDF4",
    "primary": "#FF6A00",
    "accent": "#FF6A00",
    "neutral": "#1F2937",
    "textSecondary": "#9CA3AF"
  },
  "primaryColor": "#FF6A00",
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
  "pageWidth": 1200,
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

export default function TemplateExclusivePenSiteTechnologyStorySection2bpenAlt5({ id, benefitstagtext, benefitstitletext, meettitletext, meetbodytext, meetctatxttext, t1text, d1text, t2text, d2text, t3text, d3text, frontlogotext, rearlogotext, tab1text, tab2text, tab3text, headtext, viewbtnhref, viewtxttext, c1ttext, c1mtext, c1rtext, c2ttext, c2mtext, c2rtext, c3ttext, c3mtext, c3rtext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, benefitstagtext, benefitstitletext, meettitletext, meetbodytext, meetctatxttext, t1text, d1text, t2text, d2text, t3text, d3text, frontlogotext, rearlogotext, tab1text, tab2text, tab3text, headtext, viewbtnhref, viewtxttext, c1ttext, c1mtext, c1rtext, c2ttext, c2mtext, c2rtext, c3ttext, c3mtext, c3rtext });
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