"use client";

import React from "react";
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
  "id": "UPfp6",
  "name": "supMain",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 32,
    "padding": "32px 0px",
    "width": 1160
  },
  "children": [
    {
      "type": "text",
      "id": "Cy29P",
      "name": "supTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#111111",
        "fontFamily": "Lora",
        "fontSize": 40,
        "fontWeight": "500",
        "letterSpacing": -0.5,
        "width": "100%"
      },
      "children": [],
      "textProp": "suptitletext"
    },
    {
      "type": "frame",
      "id": "ic41s",
      "name": "supHeroImage",
      "style": {
        "boxSizing": "border-box",
        "width": "100%",
        "height": 220,
        "borderRadius": 8,
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center",
        "backgroundSize": "cover"
      },
      "children": [],
      "imageProp": "supheroimageimagesrc"
    },
    {
      "type": "frame",
      "id": "heOzS",
      "name": "supSearchWrap",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 12,
        "width": "100%",
        "height": 64
      },
      "children": [
        {
          "type": "frame",
          "id": "WQxAt",
          "name": "supSearch",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "space-between",
            "alignItems": "center",
            "padding": "0px 16px",
            "width": "100%",
            "height": "100%",
            "background": "#FCFEFE",
            "border": "2px solid #0D6E6E",
            "boxShadow": "0px 0px 0px 4px #0D6E6E18"
          },
          "children": [
            {
              "type": "text",
              "id": "SKgNN",
              "name": "supSearchTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#356D6D",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "normal",
                "width": 500
              },
              "children": [],
              "textProp": "supsearchtxttext"
            },
            {
              "type": "frame",
              "id": "Zig4h",
              "name": "focusChip",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "0px 10px",
                "width": 74,
                "height": 28,
                "borderRadius": 999,
                "background": "#E6F4F4"
              },
              "children": [
                {
                  "type": "text",
                  "id": "vZgnk",
                  "name": "focusTxt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D6E6E",
                    "fontFamily": "JetBrains Mono",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.2,
                    "textAlign": "center",
                    "width": 54
                  },
                  "children": [],
                  "textProp": "focustxttext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "gUvAd",
          "name": "supBtn",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "width": 180,
            "height": "100%",
            "background": "#111111"
          },
          "children": [
            {
              "type": "text",
              "id": "aNI3F",
              "name": "supBtnTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FFFFFF",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1.2,
                "textAlign": "center",
                "width": 90
              },
              "children": [],
              "textProp": "supbtntxttext"
            }
          ],
          "hrefProp": "supbtnhref"
        }
      ]
    },
    {
      "type": "text",
      "id": "yiySj",
      "name": "supEntryTitle",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#1A1A1A",
        "fontFamily": "Bricolage Grotesque",
        "fontSize": 18,
        "fontWeight": "700",
        "width": "100%"
      },
      "children": [],
      "textProp": "supentrytitletext"
    },
    {
      "type": "frame",
      "id": "QsO3H",
      "name": "supQuick",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 16,
        "width": "100%",
        "height": 300
      },
      "children": [
        {
          "type": "frame",
          "id": "DO38B",
          "name": "quick1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 8,
            "padding": "14px",
            "width": "100%",
            "height": "100%",
            "background": "#FFF9E1",
            "border": "2px solid #D97706",
            "boxShadow": "0px 12px 32px #D9770626"
          },
          "children": [
            {
              "type": "frame",
              "id": "DFGKz",
              "name": "quick1Image",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 92,
                "borderRadius": 12,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "quick1imageimagesrc"
            },
            {
              "type": "text",
              "id": "gMLxK",
              "name": "quick1Idx",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D97706",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1,
                "width": 120
              },
              "children": [],
              "textProp": "quick1idxtext"
            },
            {
              "type": "text",
              "id": "XPTno",
              "name": "quick1Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#111111",
                "fontFamily": "Bricolage Grotesque",
                "fontSize": 22,
                "fontWeight": "500",
                "width": "100%"
              },
              "children": [],
              "textProp": "quick1titletext"
            },
            {
              "type": "text",
              "id": "QeHjp",
              "name": "quick1Desc",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6B7280",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "normal",
                "width": "100%"
              },
              "children": [],
              "textProp": "quick1desctext"
            },
            {
              "type": "frame",
              "id": "FcB1K",
              "name": "hoverCta",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "space-between",
                "alignItems": "center",
                "padding": "0px 12px",
                "width": "100%",
                "height": 36,
                "borderRadius": 10,
                "background": "#111111"
              },
              "children": [
                {
                  "type": "text",
                  "id": "ueFSh",
                  "name": "hoverCtaTxt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "600",
                    "width": 130
                  },
                  "children": [],
                  "textProp": "hoverctatxttext"
                },
                {
                  "type": "text",
                  "id": "ADbTo",
                  "name": "hoverCtaArrow",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "JetBrains Mono",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.1,
                    "textAlign": "right",
                    "width": 28
                  },
                  "children": [],
                  "textProp": "hoverctaarrowtext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "2ZoxQ",
          "name": "quick2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 8,
            "padding": "14px",
            "width": "100%",
            "height": "100%",
            "background": "#FFFFFF",
            "border": "1px solid #E5E5E5"
          },
          "children": [
            {
              "type": "frame",
              "id": "Xt6QD",
              "name": "quick2Image",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 92,
                "borderRadius": 12,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "quick2imageimagesrc"
            },
            {
              "type": "text",
              "id": "Pa7nn",
              "name": "quick2Idx",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6366F1",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1,
                "width": 140
              },
              "children": [],
              "textProp": "quick2idxtext"
            },
            {
              "type": "text",
              "id": "vxyUT",
              "name": "quick2Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#111111",
                "fontFamily": "Bricolage Grotesque",
                "fontSize": 22,
                "fontWeight": "500",
                "width": "100%"
              },
              "children": [],
              "textProp": "quick2titletext"
            },
            {
              "type": "text",
              "id": "kIMOn",
              "name": "quick2Desc",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6B7280",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "normal",
                "width": "100%"
              },
              "children": [],
              "textProp": "quick2desctext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "0GIf5",
          "name": "quick3",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 8,
            "padding": "14px",
            "width": "100%",
            "height": "100%",
            "background": "#F0FDF4",
            "border": "1px solid #22C55E"
          },
          "children": [
            {
              "type": "frame",
              "id": "fjYQ7",
              "name": "quick3Image",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 92,
                "borderRadius": 12,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "quick3imageimagesrc"
            },
            {
              "type": "text",
              "id": "hUH0A",
              "name": "quick3Idx",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#22C55E",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1,
                "width": 170
              },
              "children": [],
              "textProp": "quick3idxtext"
            },
            {
              "type": "text",
              "id": "OdKWy",
              "name": "quick3Title",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#111111",
                "fontFamily": "Bricolage Grotesque",
                "fontSize": 22,
                "fontWeight": "500",
                "width": "100%"
              },
              "children": [],
              "textProp": "quick3titletext"
            },
            {
              "type": "text",
              "id": "KvbUQ",
              "name": "quick3Desc",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6B7280",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "normal",
                "width": "100%"
              },
              "children": [],
              "textProp": "quick3desctext"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "9sWMN",
      "name": "supBody",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 16,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "s9MJT",
          "name": "bodyToggle",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 10,
            "alignItems": "center",
            "width": "100%",
            "height": 44
          },
          "children": [
            {
              "type": "frame",
              "id": "X9lMo",
              "name": "bodyToggleActive",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "0px 18px",
                "width": 154,
                "height": 44,
                "borderRadius": 999,
                "background": "#111111"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Off1r",
                  "name": "bodyToggleActiveTxt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "JetBrains Mono",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.1,
                    "textAlign": "center",
                    "width": 118
                  },
                  "children": [],
                  "textProp": "bodytoggleactivetxttext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "Yhy1l",
              "name": "bodyToggleInactive",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "padding": "0px 18px",
                "width": 144,
                "height": 44,
                "borderRadius": 999,
                "background": "#ECEDE8"
              },
              "children": [
                {
                  "type": "text",
                  "id": "yJIXH",
                  "name": "bodyToggleInactiveTxt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#6A6A64",
                    "fontFamily": "JetBrains Mono",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.1,
                    "textAlign": "center",
                    "width": 108
                  },
                  "children": [],
                  "textProp": "bodytoggleinactivetxttext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "lEiEv",
          "name": "supTickets",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "width": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "0sNQf",
              "name": "supTicketsHead",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#111111",
                "fontFamily": "Bricolage Grotesque",
                "fontSize": 24,
                "fontWeight": "500",
                "width": "100%"
              },
              "children": [],
              "textProp": "supticketsheadtext"
            },
            {
              "type": "frame",
              "id": "O9uKN",
              "name": "ticket1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "padding": "14px",
                "width": "100%",
                "height": 132,
                "background": "#FFFFFF",
                "border": "1px solid #E5E5E5"
              },
              "children": [
                {
                  "type": "text",
                  "id": "HazQD",
                  "name": "ticket1Top",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#111111",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.2,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "ticket1toptext"
                },
                {
                  "type": "text",
                  "id": "Fz5ea",
                  "name": "ticket1Stat",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1A8754",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "500",
                    "width": 220
                  },
                  "children": [],
                  "textProp": "ticket1stattext"
                },
                {
                  "type": "text",
                  "id": "qLPcB",
                  "name": "ticket1Msg",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#555555",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "normal",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "ticket1msgtext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "juQqm",
              "name": "ticket2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "padding": "14px",
                "width": "100%",
                "height": 132,
                "background": "#FFFFFF",
                "border": "1px solid #E5E5E5"
              },
              "children": [
                {
                  "type": "text",
                  "id": "1H3wj",
                  "name": "ticket2Top",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#111111",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.2,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "ticket2toptext"
                },
                {
                  "type": "text",
                  "id": "ilDTQ",
                  "name": "ticket2Stat",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#C41E3A",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "500",
                    "width": 220
                  },
                  "children": [],
                  "textProp": "ticket2stattext"
                },
                {
                  "type": "text",
                  "id": "1mf04",
                  "name": "ticket2Msg",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#555555",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "normal",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "ticket2msgtext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "1EyCm",
          "name": "supFAQ",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "GSIPs",
              "name": "faqTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1A1A1A",
                "fontFamily": "Bricolage Grotesque",
                "fontSize": 24,
                "fontWeight": "700",
                "width": "100%"
              },
              "children": [],
              "textProp": "faqtitletext"
            },
            {
              "type": "frame",
              "id": "197LR",
              "name": "faq1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "padding": "16px",
                "width": "100%",
                "height": 120,
                "borderRadius": 16,
                "background": "#FFFFFF",
                "border": "1px solid #0D6E6E",
                "boxShadow": "0px 10px 24px #0D6E6E12"
              },
              "children": [
                {
                  "type": "text",
                  "id": "3cwRi",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1A1A1A",
                    "fontFamily": "DM Sans",
                    "fontSize": 15,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "cwritext"
                },
                {
                  "type": "text",
                  "id": "pOjMs",
                  "name": "faqMeta",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D6E6E",
                    "fontFamily": "JetBrains Mono",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.1,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "faqmetatext"
                },
                {
                  "type": "text",
                  "id": "A3noo",
                  "name": "faqAnswer",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5A5A55",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "normal",
                    "lineHeight": 1.5,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "faqanswertext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "jkHHI",
              "name": "faq2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "alignItems": "center",
                "padding": "0px 16px",
                "width": "100%",
                "height": 60,
                "borderRadius": 16,
                "background": "#F6F7F8"
              },
              "children": [
                {
                  "type": "text",
                  "id": "VykPX",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1A1A1A",
                    "fontFamily": "DM Sans",
                    "fontSize": 15,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "vykpxtext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "pluqb",
              "name": "faq3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "alignItems": "center",
                "padding": "0px 16px",
                "width": "100%",
                "height": 60,
                "borderRadius": 16,
                "background": "#F6F7F8"
              },
              "children": [
                {
                  "type": "text",
                  "id": "4NW1B",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1A1A1A",
                    "fontFamily": "DM Sans",
                    "fontSize": 15,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "nw1btext"
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
  "id": "UPfp6",
  "suptitletext": "Support Center",
  "supheroimageimagesrc": "https://images.unsplash.com/photo-1704440278730-b420f5892700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgwNjV8&ixlib=rb-4.1.0&q=80&w=1080",
  "supsearchtxttext": "Search by order number, product, or issue |",
  "focustxttext": "FOCUS",
  "supbtnhref": "/start-chat",
  "supbtntxttext": "START CHAT",
  "supentrytitletext": "Support Entrances",
  "quick1imageimagesrc": "https://images.unsplash.com/photo-1639049346921-2c3410e97ed7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgwNjZ8&ixlib=rb-4.1.0&q=80&w=1080",
  "quick1idxtext": "PRIMARY ENTRY · HOVER",
  "quick1titletext": "Warranty & Repairs",
  "quick1desctext": "Submit claims, check parts coverage, and track approval progress.",
  "hoverctatxttext": "Open claim flow",
  "hoverctaarrowtext": "NEXT",
  "quick2imageimagesrc": "https://images.unsplash.com/photo-1758523670564-d1d6a734dc0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgwNjZ8&ixlib=rb-4.1.0&q=80&w=1080",
  "quick2idxtext": "SECONDARY ENTRY",
  "quick2titletext": "Orders & Returns",
  "quick2desctext": "Track shipment status or start a return in one place.",
  "quick3imageimagesrc": "https://images.unsplash.com/photo-1765020553734-2c050ddb9494?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgwNjd8&ixlib=rb-4.1.0&q=80&w=1080",
  "quick3idxtext": "FASTEST ENTRY",
  "quick3titletext": "Live Chat Support",
  "quick3desctext": "Connect with a specialist for pairing, firmware, and setup issues.",
  "bodytoggleactivetxttext": "REQUESTS ACTIVE",
  "bodytoggleinactivetxttext": "FAQ TAB",
  "supticketsheadtext": "Recent Requests",
  "ticket1toptext": "#84211  ·  Replacement Ear Pads",
  "ticket1stattext": "Status: In Progress",
  "ticket1msgtext": "Our service team confirmed inventory and is preparing shipment details.",
  "ticket2toptext": "#84170  ·  Bluetooth Connectivity",
  "ticket2stattext": "Status: Waiting for Reply",
  "ticket2msgtext": "Please upload a short pairing video from iOS settings so we can isolate the issue.",
  "faqtitletext": "Popular Help Topics",
  "cwritext": "How do I reset Bluetooth pairing?",
  "faqmetatext": "REVEAL STATE · STEP 1 OF 3",
  "faqanswertext": "Hold the headset power switch for 8 seconds until the indicator flashes red and white, then reopen Bluetooth settings to pair again.",
  "vykpxtext": "How long does warranty validation take?",
  "nw1btext": "Where can I download firmware updates?"
};
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };
const PEN_RUNTIME_MOTION_STYLE = "@keyframes pen-media-breathe{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-8px,0) scale(1.035)}}@keyframes pen-track-slide-x-subtle{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-32px,0,0)}}@keyframes pen-track-slide-x-showcase{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-52px,0,0)}}@keyframes pen-card-float{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-10px,0)}}";

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
      mediaBreathe: true,
      contentStagger: true,
    };
  }
  if (sectionKindToken === "navigation" || sectionKindToken === "footer") {
    return {
      level: "subtle",
      revealPreset: "fadeIn",
      delayStep: 20,
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

const buildNodeClassName = (node, sectionMotion, sectionKindToken) => {
  if (!sectionMotion || sectionMotion.level === "off") return "";
  const classes = [];
  if (node?.hrefProp) classes.push("hover-lift");
  if (node?.type === "frame" && node?.imageProp) classes.push("will-change-transform");
  if (shouldApplyStoryCardHover(node, sectionKindToken)) classes.push("hover-lift");
  if (shouldApplyStoryTrackMotion(node, sectionKindToken)) classes.push("will-change-transform", "pen-track-slide");
  return classes.join(" ");
};

const buildNodeStyle = (node, merged, sectionMotion, sectionKindToken, keyPath) => {
  const style = { ...(node?.style || {}) };
  if (node?.imageProp) {
    const src = String(merged?.[node.imageProp] || "").trim();
    if (src) {
      style.backgroundImage = `url(${src})`;
    }
  }
  if (node?.hrefProp) {
    style.textDecoration = style.textDecoration || "none";
    if (!style.color) style.color = "inherit";
    if (node?.type === "frame" && !style.display) {
      style.display = "inline-block";
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

const renderNode = (node, merged, sectionMotion, sectionKindToken, key = "root") => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged, sectionMotion, sectionKindToken, key);
  const className = buildNodeClassName(node, sectionMotion, sectionKindToken) || undefined;
  const href = node?.hrefProp ? String(merged?.[node.hrefProp] || "").trim() : "";
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
    const Tag = href ? "a" : "div";
    return React.createElement(
      Tag,
      {
        key,
        href: href || undefined,
        className,
        style,
        "data-pen-node": node.id || undefined,
      },
      renderTextContent(node, merged, key, sectionMotion)
    );
  }
  const Tag = href ? "a" : "div";
  return React.createElement(
    Tag,
    {
      key,
      href: href || undefined,
      className,
      style,
      "data-pen-node": node.id || undefined,
    },
    ...(Array.isArray(node.children)
      ? node.children.map((child, index) => renderNode(child, merged, sectionMotion, sectionKindToken, `${key}-${index}`))
      : [])
  );
};

export default function TemplateExclusivePenSiteMasterdynamicSupportContactSupmainpenAlt1({ id, suptitletext, supheroimageimagesrc, supsearchtxttext, focustxttext, supbtnhref, supbtntxttext, supentrytitletext, quick1imageimagesrc, quick1idxtext, quick1titletext, quick1desctext, hoverctatxttext, hoverctaarrowtext, quick2imageimagesrc, quick2idxtext, quick2titletext, quick2desctext, quick3imageimagesrc, quick3idxtext, quick3titletext, quick3desctext, bodytoggleactivetxttext, bodytoggleinactivetxttext, supticketsheadtext, ticket1toptext, ticket1stattext, ticket1msgtext, ticket2toptext, ticket2stattext, ticket2msgtext, faqtitletext, cwritext, faqmetatext, faqanswertext, vykpxtext, nw1btext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, suptitletext, supheroimageimagesrc, supsearchtxttext, focustxttext, supbtnhref, supbtntxttext, supentrytitletext, quick1imageimagesrc, quick1idxtext, quick1titletext, quick1desctext, hoverctatxttext, hoverctaarrowtext, quick2imageimagesrc, quick2idxtext, quick2titletext, quick2desctext, quick3imageimagesrc, quick3idxtext, quick3titletext, quick3desctext, bodytoggleactivetxttext, bodytoggleinactivetxttext, supticketsheadtext, ticket1toptext, ticket1stattext, ticket1msgtext, ticket2toptext, ticket2stattext, ticket2msgtext, faqtitletext, cwritext, faqmetatext, faqanswertext, vykpxtext, nw1btext });
  assignDefined(merged, rest);
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
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": SECTION_KIND,
      className: sectionClassName,
      style: sectionStyle,
    },
    ...(sectionMotion?.level !== "off"
      ? [React.createElement("style", { key: "pen-motion-style" }, PEN_RUNTIME_MOTION_STYLE)]
      : []),
    renderNode(SECTION_TREE, merged, sectionMotion, sectionKindToken, "root")
  );
}