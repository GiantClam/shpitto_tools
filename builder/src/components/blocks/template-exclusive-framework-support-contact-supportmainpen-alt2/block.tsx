"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TextReveal } from "@/components/magic/text-reveal";
import { useMotionMode } from "@/components/theme/motion";
import { applyPenThemeToStyleObject, buildPenThemeCssVars } from "@/components/blocks/_shared/pen-theme";
import { useInViewReveal } from "@/lib/motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquare,
  Minus,
  Play,
  Plus,
  Search,
  Sparkles,
  Wrench,
  Wifi,
  X,
} from "lucide-react";

const SECTION_KIND = "contact";
const SECTION_TREE = {
  "type": "frame",
  "id": "Gbj9A",
  "name": "SupportMain",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 38,
    "padding": "36px 110px 52px 110px",
    "width": "100%",
    "background": "#F3F3EF"
  },
  "children": [
    {
      "type": "frame",
      "id": "VKhzL",
      "name": "TopGrid",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 36,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "BVz3z",
          "name": "KBRow",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 54,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "5EjuM",
              "name": "KBLeft",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "padding": "0px 0px 0px 4px",
                "width": 556
              },
              "children": [
                {
                  "type": "text",
                  "id": "3Pqir",
                  "name": "kbTitle",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1F2737",
                    "fontFamily": "Inter",
                    "fontSize": 38,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "kbtitletext"
                },
                {
                  "type": "text",
                  "id": "hDOfc",
                  "name": "kbDesc",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#6A6F74",
                    "fontFamily": "Inter",
                    "fontSize": 13,
                    "fontWeight": "normal",
                    "lineHeight": 1.45,
                    "width": 510
                  },
                  "children": [],
                  "textProp": "kbdesctext"
                },
                {
                  "type": "frame",
                  "id": "pz6Kc",
                  "name": "kbLinks",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "padding": "8px 0px 0px 0px",
                    "width": 510
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "bDAcy",
                      "name": "kbL1",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#2C3037",
                        "fontFamily": "Inter",
                        "fontSize": 11,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "kbl1text"
                    },
                    {
                      "type": "frame",
                      "id": "KmYpj",
                      "name": "kbSep1",
                      "style": {
                        "boxSizing": "border-box",
                        "width": "100%",
                        "height": 1,
                        "background": "#CACFD3"
                      },
                      "children": []
                    },
                    {
                      "type": "text",
                      "id": "KmgCF",
                      "name": "kbL2",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#2C3037",
                        "fontFamily": "Inter",
                        "fontSize": 11,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "kbl2text"
                    },
                    {
                      "type": "frame",
                      "id": "P9NIU",
                      "name": "kbSep2",
                      "style": {
                        "boxSizing": "border-box",
                        "width": "100%",
                        "height": 1,
                        "background": "#CACFD3"
                      },
                      "children": []
                    },
                    {
                      "type": "text",
                      "id": "cs35u",
                      "name": "kbL3",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#2C3037",
                        "fontFamily": "Inter",
                        "fontSize": 11,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "kbl3text"
                    },
                    {
                      "type": "frame",
                      "id": "By2RC",
                      "name": "kbSep3",
                      "style": {
                        "boxSizing": "border-box",
                        "width": "100%",
                        "height": 1,
                        "background": "#CACFD3"
                      },
                      "children": []
                    }
                  ]
                }
              ]
            },
            {
              "type": "frame",
              "id": "TldaS",
              "name": "KBIconCard",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 12,
                "justifyContent": "center",
                "alignItems": "center",
                "width": 520,
                "height": 250,
                "background": "#DFEAEC"
              },
              "children": [
                {
                  "type": "icon_font",
                  "id": "VYue1",
                  "name": "msgIcon",
                  "style": {
                    "boxSizing": "border-box",
                    "color": "#2E353D",
                    "width": 70,
                    "height": 70,
                    "display": "inline-flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "flexShrink": 0,
                    "fontSize": 70
                  },
                  "children": [],
                  "iconGlyph": "message-square"
                },
                {
                  "type": "icon_font",
                  "id": "eKLFU",
                  "name": "searchIcon",
                  "style": {
                    "boxSizing": "border-box",
                    "color": "#2E353D",
                    "width": 44,
                    "height": 44,
                    "display": "inline-flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "flexShrink": 0,
                    "fontSize": 44
                  },
                  "children": [],
                  "iconName": "Search"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "GQtJA",
          "name": "CommunityRow",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 54,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "z0u4u",
              "name": "CommunityImage",
              "style": {
                "boxSizing": "border-box",
                "width": 520,
                "height": 276,
                "borderRadius": 2,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "communityimageimagesrc"
            },
            {
              "type": "frame",
              "id": "OmuGG",
              "name": "CommunityText",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "justifyContent": "center",
                "width": 520
              },
              "children": [
                {
                  "type": "text",
                  "id": "58f9m",
                  "name": "commTitle",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1F2737",
                    "fontFamily": "Inter",
                    "fontSize": 40,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "commtitletext"
                },
                {
                  "type": "text",
                  "id": "v85jD",
                  "name": "commDesc",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#6A6F74",
                    "fontFamily": "Inter",
                    "fontSize": 13,
                    "fontWeight": "normal",
                    "lineHeight": 1.45,
                    "width": 470
                  },
                  "children": [],
                  "textProp": "commdesctext"
                },
                {
                  "type": "frame",
                  "id": "6PHT8",
                  "name": "askBtn",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 136,
                    "height": 34,
                    "borderRadius": 17,
                    "background": "#F26B2D"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "e3AEE",
                      "name": "askTxt",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#121416",
                        "fontFamily": "Inter",
                        "fontSize": 10,
                        "fontWeight": "700"
                      },
                      "children": [],
                      "textProp": "asktxttext"
                    }
                  ],
                  "hrefProp": "askbtnhref"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "6ZrMx",
      "name": "GuidesSection",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 18,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "o0Zeb",
          "name": "GuidesHead",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "space-between",
            "alignItems": "center",
            "width": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "85vVo",
              "name": "guidesTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F2737",
                "fontFamily": "Inter",
                "fontSize": 40,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "guidestitletext"
            },
            {
              "type": "frame",
              "id": "5hRC3",
              "name": "viewBtn",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 122,
                "height": 34,
                "borderRadius": 17,
                "border": "1px solid #A6A9AE"
              },
              "children": [
                {
                  "type": "text",
                  "id": "mLR9N",
                  "name": "viewTxt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#44484D",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "viewtxttext"
                }
              ],
              "hrefProp": "viewbtnhref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "t1DVu",
          "name": "GuideCards",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 19,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "5DEan",
              "name": "card1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "width": 394
              },
              "children": [
                {
                  "type": "frame",
                  "id": "a77fC",
                  "name": "img1",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 394,
                    "height": 170,
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
                  "id": "ok16w",
                  "name": "cap1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#30343A",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal",
                    "lineHeight": 1.35,
                    "width": 394
                  },
                  "children": [],
                  "textProp": "cap1text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "JbNQP",
              "name": "card2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "width": 394
              },
              "children": [
                {
                  "type": "frame",
                  "id": "Ffvyh",
                  "name": "img2",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 394,
                    "height": 170,
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
                  "id": "nXvsF",
                  "name": "cap2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#30343A",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal",
                    "lineHeight": 1.35,
                    "width": 394
                  },
                  "children": [],
                  "textProp": "cap2text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "WG35z",
              "name": "card3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "width": 394
              },
              "children": [
                {
                  "type": "frame",
                  "id": "nZDoT",
                  "name": "img3",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 394,
                    "height": 170,
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
                  "id": "P7JQZ",
                  "name": "cap3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#30343A",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal",
                    "lineHeight": 1.35,
                    "width": 394
                  },
                  "children": [],
                  "textProp": "cap3text"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "wOJxc",
      "name": "SupportCTA",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 14,
        "alignItems": "center",
        "padding": "28px 0px 0px 0px",
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "qAkQy",
          "name": "ctaIconWrap",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "width": 48,
            "height": 48,
            "borderRadius": 24,
            "background": "#F26B2D"
          },
          "children": [
            {
              "type": "icon_font",
              "id": "wPChw",
              "name": "ctaIcon",
              "style": {
                "boxSizing": "border-box",
                "color": "#FFFFFF",
                "width": 24,
                "height": 24,
                "display": "inline-flex",
                "alignItems": "center",
                "justifyContent": "center",
                "flexShrink": 0,
                "fontSize": 24
              },
              "children": [],
              "iconGlyph": "wrench"
            }
          ]
        },
        {
          "type": "text",
          "id": "6t6KD",
          "name": "ctaTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2737",
            "fontFamily": "Inter",
            "fontSize": 38,
            "fontWeight": "700",
            "lineHeight": 1.05,
            "textAlign": "center",
            "width": 410
          },
          "children": [],
          "textProp": "ctatitletext"
        },
        {
          "type": "frame",
          "id": "ZGfmh",
          "name": "submitBtn",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "width": 142,
            "height": 34,
            "borderRadius": 17,
            "background": "#F26B2D"
          },
          "children": [
            {
              "type": "text",
              "id": "hawQ7",
              "name": "submitTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#121416",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "submittxttext"
            }
          ],
          "hrefProp": "submitbtnhref"
        },
        {
          "type": "frame",
          "id": "VVzq1",
          "name": "connectBtn",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "width": 170,
            "height": 34,
            "borderRadius": 17,
            "border": "1px solid #A6A9AE"
          },
          "children": [
            {
              "type": "text",
              "id": "5YFwm",
              "name": "connectTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#44484D",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "connecttxttext"
            }
          ],
          "hrefProp": "connectbtnhref"
        },
        {
          "type": "frame",
          "id": "chJ7r",
          "name": "divWrap",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "alignItems": "center",
            "width": "100%",
            "height": 8
          },
          "children": [
            {
              "type": "frame",
              "id": "wqP0q",
              "name": "sep",
              "style": {
                "boxSizing": "border-box",
                "width": 420,
                "height": 1,
                "background": "#EF8C64"
              },
              "children": []
            },
            {
              "type": "frame",
              "id": "xqp3l",
              "name": "divBase",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 1,
                "background": "#D9DCDF"
              },
              "children": []
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "Gbj9A",
  "kbtitletext": "Knowledge Base",
  "kbdesctext": "A collection of frequently asked questions around ordering, product specs, software debugging, and troubleshooting.",
  "kbl1text": "Orders & Shipping",
  "kbl2text": "Account & Profile",
  "kbl3text": "Products",
  "communityimageimagesrc": "https://images.unsplash.com/photo-1618410325698-018bb3eb2318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMwNzg2MzN8&ixlib=rb-4.1.0&q=80&w=1080",
  "commtitletext": "Community",
  "commdesctext": "A community forum where users can ask questions, get advice, and brainstorm projects, and participate in discussions topics around Framework products.",
  "askbtnhref": "/",
  "asktxttext": "Ask the Community",
  "guidestitletext": "Setup, Upgrade, and Repair Guides",
  "viewbtnhref": "/",
  "viewtxttext": "View All Guides",
  "img1imagesrc": "https://images.unsplash.com/photo-1586952518485-11b180e92764?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMwNzg2MzF8&ixlib=rb-4.1.0&q=80&w=1080",
  "cap1text": "Framework Laptop 13 DIY (Intel Core Ultra Series 1) Quick Start / Editor's Guide, Black Edition",
  "img2imagesrc": "https://images.unsplash.com/photo-1666430163005-3cd92302a865?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMwNzg2MzR8&ixlib=rb-4.1.0&q=80&w=1080",
  "cap2text": "Mainboard Replacements Guide",
  "img3imagesrc": "https://images.unsplash.com/photo-1559163454-e7d1e00a4e54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMwNzg2NDJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "cap3text": "Framework Laptop 13 Fully DIY Quick Start Guide",
  "ctatitletext": "Still have questions?\nWe are here to help!",
  "submitbtnhref": "/support",
  "submittxttext": "Submit support request",
  "connectbtnhref": "/",
  "connecttxttext": "Connect with the Business team"
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
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, MessageSquare, Minus, Play, Plus, Search, Sparkles, Wifi, Wrench, X };
const GLYPH_ICONS = {
  "message-square": MessageSquare,
  wrench: Wrench,
};
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
  applyPenThemeToStyleObject(style, {
    node,
    parentNode,
    keyPath,
    sectionKindToken,
    isHeadingLike: isHeadingLikeTextNode(node),
  });
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
    const glyphToken = String(node?.iconGlyph || "").trim().toLowerCase();
    const Icon = (node?.iconName ? ICONS[node.iconName] : null) || GLYPH_ICONS[glyphToken];
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

export default function TemplateExclusiveFrameworkSupportContactSupportmainpenAlt2({ id, kbtitletext, kbdesctext, kbl1text, kbl2text, kbl3text, communityimageimagesrc, commtitletext, commdesctext, askbtnhref, asktxttext, guidestitletext, viewbtnhref, viewtxttext, img1imagesrc, cap1text, img2imagesrc, cap2text, img3imagesrc, cap3text, ctatitletext, submitbtnhref, submittxttext, connectbtnhref, connecttxttext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, kbtitletext, kbdesctext, kbl1text, kbl2text, kbl3text, communityimageimagesrc, commtitletext, commdesctext, askbtnhref, asktxttext, guidestitletext, viewbtnhref, viewtxttext, img1imagesrc, cap1text, img2imagesrc, cap2text, img3imagesrc, cap3text, ctatitletext, submitbtnhref, submittxttext, connectbtnhref, connecttxttext });
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
  const themeVars = buildPenThemeCssVars(merged?.theme);
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
