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
  "id": "ddmQa",
  "name": "footerCopyB",
  "style": {
    "boxSizing": "border-box",
    "width": "100%",
    "height": 460,
    "background": "#9ba0a5",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "frame",
      "id": "ffoLH",
      "name": "footerTop",
      "style": {
        "boxSizing": "border-box",
        "width": 1211,
        "height": 340,
        "position": "absolute",
        "overflow": "hidden",
        "left": 104,
        "top": 58
      },
      "children": [
        {
          "type": "frame",
          "id": "PY81o",
          "name": "leftCol",
          "style": {
            "boxSizing": "border-box",
            "width": 420,
            "height": 360,
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 0
          },
          "children": [
            {
              "type": "frame",
              "id": "prX7B",
              "name": "leftBlock1",
              "style": {
                "boxSizing": "border-box",
                "width": 420,
                "height": 170,
                "position": "absolute",
                "overflow": "hidden",
                "left": 0,
                "top": 0
              },
              "children": [
                {
                  "type": "text",
                  "id": "LLf4J",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#f2f3f4",
                    "fontFamily": "Inter",
                    "fontSize": 24,
                    "fontWeight": "700",
                    "position": "absolute",
                    "left": 0,
                    "top": 0
                  },
                  "children": [],
                  "textProp": "llf4jtext"
                },
                {
                  "type": "frame",
                  "id": "l8CZj",
                  "name": "portfolioLinks",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 8,
                    "width": 420,
                    "position": "absolute",
                    "left": 0,
                    "top": 40
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "ua6tV",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "ua6tvtext"
                    },
                    {
                      "type": "text",
                      "id": "dJdYS",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "djdystext",
                      "hrefProp": "djdyshref"
                    },
                    {
                      "type": "text",
                      "id": "WOHYB",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "wohybtext",
                      "hrefProp": "wohybhref"
                    },
                    {
                      "type": "text",
                      "id": "ayE03",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "aye03text",
                      "hrefProp": "aye03href"
                    }
                  ]
                }
              ]
            },
            {
              "type": "frame",
              "id": "kEjmU",
              "name": "leftBlock2",
              "style": {
                "boxSizing": "border-box",
                "width": 420,
                "height": 160,
                "position": "absolute",
                "overflow": "hidden",
                "left": 0,
                "top": 190
              },
              "children": [
                {
                  "type": "text",
                  "id": "2g8ki",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#f2f3f4",
                    "fontFamily": "Inter",
                    "fontSize": 24,
                    "fontWeight": "700",
                    "position": "absolute",
                    "left": 0,
                    "top": 0
                  },
                  "children": [],
                  "textProp": "g8kitext"
                },
                {
                  "type": "frame",
                  "id": "HvYUq",
                  "name": "investorLinks",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 8,
                    "width": 420,
                    "position": "absolute",
                    "left": 0,
                    "top": 40
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "6Rj4V",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "rj4vtext"
                    },
                    {
                      "type": "text",
                      "id": "XdFIO",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "xdfiotext",
                      "hrefProp": "xdfiohref"
                    },
                    {
                      "type": "text",
                      "id": "VDnZs",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "vdnzstext",
                      "hrefProp": "vdnzshref"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "y80bP",
          "name": "midCol",
          "style": {
            "boxSizing": "border-box",
            "width": 420,
            "height": 360,
            "position": "absolute",
            "overflow": "hidden",
            "left": 470,
            "top": 0
          },
          "children": [
            {
              "type": "frame",
              "id": "FGMwI",
              "name": "midBlock1",
              "style": {
                "boxSizing": "border-box",
                "width": 420,
                "height": 170,
                "position": "absolute",
                "overflow": "hidden",
                "left": 0,
                "top": 0
              },
              "children": [
                {
                  "type": "text",
                  "id": "IIoDs",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#f2f3f4",
                    "fontFamily": "Inter",
                    "fontSize": 24,
                    "fontWeight": "700",
                    "position": "absolute",
                    "left": 0,
                    "top": 0
                  },
                  "children": [],
                  "textProp": "iiodstext"
                },
                {
                  "type": "frame",
                  "id": "X26hv",
                  "name": "aboutLinks",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 8,
                    "width": 420,
                    "position": "absolute",
                    "left": 0,
                    "top": 40
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "wUQvD",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "wuqvdtext"
                    },
                    {
                      "type": "text",
                      "id": "q23wx",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "q23wxtext",
                      "hrefProp": "q23wxhref"
                    },
                    {
                      "type": "text",
                      "id": "753p6",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "p6text",
                      "hrefProp": "p6href"
                    },
                    {
                      "type": "text",
                      "id": "YFrS2",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "yfrs2text",
                      "hrefProp": "yfrs2href"
                    }
                  ]
                }
              ]
            },
            {
              "type": "frame",
              "id": "YaUhL",
              "name": "midBlock2",
              "style": {
                "boxSizing": "border-box",
                "width": 420,
                "height": 160,
                "position": "absolute",
                "overflow": "hidden",
                "left": 0,
                "top": 190
              },
              "children": [
                {
                  "type": "text",
                  "id": "vqJG2",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#f2f3f4",
                    "fontFamily": "Inter",
                    "fontSize": 24,
                    "fontWeight": "700",
                    "position": "absolute",
                    "left": 0,
                    "top": 0
                  },
                  "children": [],
                  "textProp": "vqjg2text"
                },
                {
                  "type": "frame",
                  "id": "GMfoQ",
                  "name": "legalLinks",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 8,
                    "width": 420,
                    "position": "absolute",
                    "left": 0,
                    "top": 40
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "mYnbE",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "mynbetext"
                    },
                    {
                      "type": "text",
                      "id": "EytLe",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "eytletext",
                      "hrefProp": "eytlehref"
                    },
                    {
                      "type": "text",
                      "id": "eoZSE",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "eozsetext",
                      "hrefProp": "eozsehref"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "L7M8g",
          "name": "rightCol",
          "style": {
            "boxSizing": "border-box",
            "width": 440,
            "height": 360,
            "position": "absolute",
            "overflow": "hidden",
            "left": 940,
            "top": 0
          },
          "children": [
            {
              "type": "text",
              "id": "XuYFL",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#f2f3f4",
                "fontFamily": "Inter",
                "fontSize": 24,
                "fontWeight": "normal",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": [],
              "textProp": "xuyfltext"
            },
            {
              "type": "text",
              "id": "QmLlT",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#eceef0",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "position": "absolute",
                "left": 0,
                "top": 36
              },
              "children": [],
              "textProp": "qmllttext",
              "hrefProp": "qmllthref"
            },
            {
              "type": "frame",
              "id": "a6I0V",
              "name": "iconsRow",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 8,
                "position": "absolute",
                "left": 0,
                "top": 62
              },
              "children": [
                {
                  "type": "frame",
                  "id": "j1vcg",
                  "name": "icon1",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 24,
                    "height": 24,
                    "borderRadius": 12,
                    "border": "1.5px solid #eceef0"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "Grzm4",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 6,
                        "fontWeight": "700"
                      },
                      "children": [],
                      "textProp": "grzm4text"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "RCj59",
                  "name": "icon2",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 24,
                    "height": 24,
                    "borderRadius": 12,
                    "border": "1.5px solid #eceef0"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "5ITOc",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 7,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "itoctext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "Ea2Ft",
                  "name": "icon3",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 24,
                    "height": 24,
                    "borderRadius": 12,
                    "border": "1.5px solid #eceef0"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "QcryF",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 8,
                        "fontWeight": "700"
                      },
                      "children": [],
                      "textProp": "qcryftext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "6CsdC",
                  "name": "icon4",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 24,
                    "height": 24,
                    "borderRadius": 12,
                    "border": "1.5px solid #eceef0"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "NMWoE",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 8,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "nmwoetext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "S6pce",
                  "name": "icon5",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 24,
                    "height": 24,
                    "borderRadius": 12,
                    "border": "1.5px solid #eceef0"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "Rasdv",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#eceef0",
                        "fontFamily": "Inter",
                        "fontSize": 7,
                        "fontWeight": "normal"
                      },
                      "children": [],
                      "textProp": "rasdvtext"
                    }
                  ]
                }
              ]
            },
            {
              "type": "frame",
              "id": "DJdLD",
              "name": "contactBtn",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 90,
                "height": 24,
                "borderRadius": 12,
                "border": "1.5px solid #eceef0",
                "position": "absolute",
                "left": 0,
                "top": 98
              },
              "children": [
                {
                  "type": "text",
                  "id": "eqlfD",
                  "name": "contactText",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#eceef0",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "contacttexttext"
                }
              ],
              "hrefProp": "contactbtnhref"
            },
            {
              "type": "frame",
              "id": "m5eur",
              "name": "addressLines",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "width": 440,
                "position": "absolute",
                "left": 0,
                "top": 136
              },
              "children": [
                {
                  "type": "text",
                  "id": "J6VXb",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#eceef0",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "j6vxbtext"
                },
                {
                  "type": "text",
                  "id": "rxs7y",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#eceef0",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "rxs7ytext",
                  "hrefProp": "rxs7yhref"
                },
                {
                  "type": "text",
                  "id": "VeYde",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#eceef0",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "veydetext",
                  "hrefProp": "veydehref"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "F08om",
      "name": "footerBottomRed",
      "style": {
        "boxSizing": "border-box",
        "width": 1445,
        "height": 40,
        "background": "#ed0c0f",
        "position": "absolute",
        "overflow": "hidden",
        "left": 0,
        "top": 420
      },
      "children": [
        {
          "type": "text",
          "id": "C0cgH",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#ffffff",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "500",
            "position": "absolute",
            "left": 16,
            "top": 12
          },
          "children": [],
          "textProp": "c0cghtext"
        },
        {
          "type": "text",
          "id": "6T2ys",
          "name": "",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#ffffff",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "500",
            "position": "absolute",
            "left": 1320,
            "top": 12
          },
          "children": [],
          "textProp": "t2ystext",
          "hrefProp": "t2yshref"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "ddmQa",
  "llf4jtext": "Portfolio",
  "ua6tvtext": "Product Finder",
  "djdystext": "Brands",
  "djdyshref": "/",
  "wohybtext": "Industries",
  "wohybhref": "/oerlikon-industries",
  "aye03text": "Innovation",
  "aye03href": "/",
  "g8kitext": "Investors & Media",
  "rj4vtext": "Reports & Publications",
  "xdfiotext": "Press Releases",
  "xdfiohref": "/",
  "vdnzstext": "Share Information",
  "vdnzshref": "/",
  "iiodstext": "About Us",
  "wuqvdtext": "Careers",
  "q23wxtext": "Job Openings",
  "q23wxhref": "/",
  "p6text": "Locations",
  "p6href": "/",
  "yfrs2text": "Company Profile",
  "yfrs2href": "/",
  "vqjg2text": "Legal & Data Protection",
  "mynbetext": "Privacy & Cookie Policy",
  "eytletext": "Terms of Use & Legal Notice",
  "eytlehref": "/",
  "eozsetext": "Whistleblowing",
  "eozsehref": "/",
  "xuyfltext": "Current Share Price",
  "qmllttext": "Mar 12, 2026 09:38 am   3.96 CHF   -0.01 (-0.35%)",
  "qmllthref": "/",
  "grzm4text": "in",
  "itoctext": "▶",
  "qcryftext": "f",
  "nmwoetext": "◎",
  "rasdvtext": "▢",
  "contactbtnhref": "/",
  "contacttexttext": "Contact",
  "j6vxbtext": "OC Oerlikon Corporation AG, Pfäffikon",
  "rxs7ytext": "Churerstrasse 120 CH-8808 Pfäffikon SZ,",
  "rxs7yhref": "/",
  "veydetext": "Switzerland",
  "veydehref": "/",
  "c0cghtext": "© Copyright 2026 OC Oerlikon Management AG",
  "t2ystext": "Back to top ^",
  "t2yshref": "/"
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
    "bg": "#f4f4f4",
    "text": "#FFFFFF",
    "primary": "#e3000f",
    "accent": "#e3000f",
    "neutral": "#E5E7EB",
    "textSecondary": "#4B5563"
  },
  "primaryColor": "#e3000f",
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
const NAV_ACTIVE_COLOR = "var(--pen-theme-text, #eceef0)";
const NAV_INACTIVE_COLOR = "var(--pen-theme-text-secondary, #ffffff)";
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

export default function TemplateExclusivePenSiteOerlikonRDFooterFootercopybpenAlt10({ id, llf4jtext, ua6tvtext, djdystext, djdyshref, wohybtext, wohybhref, aye03text, aye03href, g8kitext, rj4vtext, xdfiotext, xdfiohref, vdnzstext, vdnzshref, iiodstext, wuqvdtext, q23wxtext, q23wxhref, p6text, p6href, yfrs2text, yfrs2href, vqjg2text, mynbetext, eytletext, eytlehref, eozsetext, eozsehref, xuyfltext, qmllttext, qmllthref, grzm4text, itoctext, qcryftext, nmwoetext, rasdvtext, contactbtnhref, contacttexttext, j6vxbtext, rxs7ytext, rxs7yhref, veydetext, veydehref, c0cghtext, t2ystext, t2yshref, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, llf4jtext, ua6tvtext, djdystext, djdyshref, wohybtext, wohybhref, aye03text, aye03href, g8kitext, rj4vtext, xdfiotext, xdfiohref, vdnzstext, vdnzshref, iiodstext, wuqvdtext, q23wxtext, q23wxhref, p6text, p6href, yfrs2text, yfrs2href, vqjg2text, mynbetext, eytletext, eytlehref, eozsetext, eozsehref, xuyfltext, qmllttext, qmllthref, grzm4text, itoctext, qcryftext, nmwoetext, rasdvtext, contactbtnhref, contacttexttext, j6vxbtext, rxs7ytext, rxs7yhref, veydetext, veydehref, c0cghtext, t2ystext, t2yshref });
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