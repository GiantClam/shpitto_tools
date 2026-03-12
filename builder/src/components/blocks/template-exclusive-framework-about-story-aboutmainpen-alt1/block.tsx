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
  "id": "WDpt7",
  "name": "AboutMain",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 56,
    "alignItems": "center",
    "padding": "48px 0px",
    "width": "100%",
    "background": "#F3F3EF"
  },
  "children": [
    {
      "type": "frame",
      "id": "dWeB7",
      "name": "Hero",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 18,
        "alignItems": "center",
        "width": 1027
      },
      "children": [
        {
          "type": "text",
          "id": "gX6R5",
          "name": "h1",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2737",
            "fontFamily": "Inter",
            "fontSize": 72,
            "fontWeight": "700",
            "lineHeight": 0.95,
            "textAlign": "center",
            "width": 860
          },
          "children": [],
          "textProp": "h1text"
        },
        {
          "type": "frame",
          "id": "6qqjJ",
          "name": "iconRow",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 14,
            "alignItems": "center"
          },
          "children": [
            {
              "type": "ellipse",
              "id": "mOmpR",
              "name": "globe",
              "style": {
                "boxSizing": "border-box"
              },
              "children": []
            },
            {
              "type": "frame",
              "id": "BLfHu",
              "name": "tool",
              "style": {
                "boxSizing": "border-box",
                "width": 12,
                "height": 42,
                "borderRadius": 8,
                "background": "#F46E35"
              },
              "children": []
            }
          ]
        },
        {
          "type": "text",
          "id": "rGjFr",
          "name": "p1",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4C4F53",
            "fontFamily": "Inter",
            "fontSize": 24,
            "fontWeight": "500",
            "lineHeight": 1.35,
            "width": 1012
          },
          "children": [],
          "textProp": "p1text"
        },
        {
          "type": "text",
          "id": "bOVtC",
          "name": "p2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4C4F53",
            "fontFamily": "Inter",
            "fontSize": 15,
            "fontWeight": "normal",
            "lineHeight": 1.45,
            "width": 1015
          },
          "children": [],
          "textProp": "p2text"
        },
        {
          "type": "text",
          "id": "kKlT5",
          "name": "p3",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4C4F53",
            "fontFamily": "Inter",
            "fontSize": 15,
            "fontWeight": "normal",
            "lineHeight": 1.45,
            "width": 1016
          },
          "children": [],
          "textProp": "p3text"
        },
        {
          "type": "text",
          "id": "2Xpmz",
          "name": "p4",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4C4F53",
            "fontFamily": "Inter",
            "fontSize": 15,
            "fontWeight": "normal",
            "lineHeight": 1.45,
            "width": 1014
          },
          "children": [],
          "textProp": "p4text"
        }
      ]
    },
    {
      "type": "frame",
      "id": "T6mK5",
      "name": "Timeline",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 20,
        "width": 1040
      },
      "children": [
        {
          "type": "frame",
          "id": "uUPp5",
          "name": "lineTop",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "alignItems": "center",
            "width": "100%",
            "height": 8
          },
          "children": [
            {
              "type": "frame",
              "id": "Cy5w5",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "width": 22,
                "height": 2,
                "background": "#F46E35"
              },
              "children": []
            },
            {
              "type": "frame",
              "id": "xemwk",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 2,
                "background": "#1F2737"
              },
              "children": []
            }
          ]
        },
        {
          "type": "frame",
          "id": "T2hn5",
          "name": "row1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 8,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "AWErK",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 3,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "nz0Y9",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1F2737",
                    "fontFamily": "Inter",
                    "fontSize": 30,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "nz0y9text"
                },
                {
                  "type": "text",
                  "id": "REjUX",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4C4F53",
                    "fontFamily": "Inter",
                    "fontSize": 6,
                    "fontWeight": "normal",
                    "lineHeight": 1.25,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "rejuxtext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "9IiDk",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 3,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "zlZBC",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1F2737",
                    "fontFamily": "Inter",
                    "fontSize": 30,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "zlzbctext"
                },
                {
                  "type": "text",
                  "id": "hQuk0",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4C4F53",
                    "fontFamily": "Inter",
                    "fontSize": 6,
                    "fontWeight": "normal",
                    "lineHeight": 1.25,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "hquk0text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "Ourfz",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 3,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "pfCsA",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1F2737",
                    "fontFamily": "Inter",
                    "fontSize": 30,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "pfcsatext"
                },
                {
                  "type": "text",
                  "id": "XEHZZ",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4C4F53",
                    "fontFamily": "Inter",
                    "fontSize": 6,
                    "fontWeight": "normal",
                    "lineHeight": 1.25,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "xehzztext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "M83J8",
          "name": "lineMid",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "alignItems": "center",
            "width": "100%",
            "height": 8
          },
          "children": [
            {
              "type": "frame",
              "id": "m513e",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 2,
                "background": "#1F2737"
              },
              "children": []
            },
            {
              "type": "text",
              "id": "GxwGY",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F2737",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "gxwgytext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "TGdZi",
          "name": "row2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 8,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "5zQgc",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 3,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "3bCVn",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1F2737",
                    "fontFamily": "Inter",
                    "fontSize": 30,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "bcvntext"
                },
                {
                  "type": "text",
                  "id": "wVPhO",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4C4F53",
                    "fontFamily": "Inter",
                    "fontSize": 6,
                    "fontWeight": "normal",
                    "lineHeight": 1.25,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "wvphotext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "Fx6s6",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 3,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "g7OZH",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1F2737",
                    "fontFamily": "Inter",
                    "fontSize": 30,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "g7ozhtext"
                },
                {
                  "type": "text",
                  "id": "L7Kp3",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4C4F53",
                    "fontFamily": "Inter",
                    "fontSize": 6,
                    "fontWeight": "normal",
                    "lineHeight": 1.25,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "l7kp3text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "XzsdP",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 3,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "JiEe6",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#1F2737",
                    "fontFamily": "Inter",
                    "fontSize": 30,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "jiee6text"
                },
                {
                  "type": "text",
                  "id": "VteJr",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4C4F53",
                    "fontFamily": "Inter",
                    "fontSize": 6,
                    "fontWeight": "normal",
                    "lineHeight": 1.25,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "vtejrtext"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "nWJCt",
      "name": "Where",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 14,
        "width": 1040
      },
      "children": [
        {
          "type": "text",
          "id": "DL4LO",
          "name": "w1",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2737",
            "fontFamily": "Inter",
            "fontSize": 44,
            "fontWeight": "700",
            "lineHeight": 1,
            "width": 900
          },
          "children": [],
          "textProp": "w1text"
        },
        {
          "type": "text",
          "id": "hLUwG",
          "name": "w2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4C4F53",
            "fontFamily": "Inter",
            "fontSize": 16,
            "fontWeight": "normal",
            "lineHeight": 1.4,
            "width": 900
          },
          "children": [],
          "textProp": "w2text"
        },
        {
          "type": "frame",
          "id": "A1mNq",
          "name": "w3",
          "style": {
            "boxSizing": "border-box",
            "width": "100%",
            "height": 360,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [],
          "imageProp": "w3imagesrc"
        }
      ]
    },
    {
      "type": "frame",
      "id": "p6UXX",
      "name": "Who",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 88,
        "width": 1040
      },
      "children": [
        {
          "type": "frame",
          "id": "KMR5H",
          "name": "leftCol",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 8,
            "width": 220
          },
          "children": [
            {
              "type": "text",
              "id": "aawka",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F2737",
                "fontFamily": "Inter",
                "fontSize": 68,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "aawkatext"
            },
            {
              "type": "text",
              "id": "MQ7TM",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#F46E35",
                "fontFamily": "Inter",
                "fontSize": 68,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "mq7tmtext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "LHlHU",
          "name": "rightCol",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 56,
            "width": 760
          },
          "children": [
            {
              "type": "frame",
              "id": "UHwyB",
              "name": "row1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 34,
                "width": "100%"
              },
              "children": [
                {
                  "type": "frame",
                  "id": "rFm9w",
                  "name": "card1",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 12,
                    "alignItems": "center",
                    "width": "100%"
                  },
                  "children": [
                    {
                      "type": "frame",
                      "id": "itg2i",
                      "name": "avatar1",
                      "style": {
                        "boxSizing": "border-box",
                        "width": 170,
                        "height": 170,
                        "borderRadius": 85,
                        "background": "#F8B91A"
                      },
                      "children": []
                    },
                    {
                      "type": "text",
                      "id": "gfKki",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#24262B",
                        "fontFamily": "Inter",
                        "fontSize": 16,
                        "fontWeight": "700",
                        "lineHeight": 1.55,
                        "textAlign": "center",
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "gfkkitext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "eHQNJ",
                  "name": "card2",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 12,
                    "alignItems": "center",
                    "width": "100%"
                  },
                  "children": [
                    {
                      "type": "frame",
                      "id": "ybdKb",
                      "name": "avatar2",
                      "style": {
                        "boxSizing": "border-box",
                        "width": 170,
                        "height": 170,
                        "borderRadius": 85,
                        "background": "#DED4A7"
                      },
                      "children": []
                    },
                    {
                      "type": "text",
                      "id": "C7mvM",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#24262B",
                        "fontFamily": "Inter",
                        "fontSize": 16,
                        "fontWeight": "700",
                        "lineHeight": 1.55,
                        "textAlign": "center",
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "c7mvmtext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "YOY1K",
                  "name": "card3",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 12,
                    "alignItems": "center",
                    "width": "100%"
                  },
                  "children": [
                    {
                      "type": "frame",
                      "id": "ZWEHB",
                      "name": "avatar3",
                      "style": {
                        "boxSizing": "border-box",
                        "width": 170,
                        "height": 170,
                        "borderRadius": 85,
                        "background": "#FC7A00"
                      },
                      "children": []
                    },
                    {
                      "type": "text",
                      "id": "z6bFH",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#24262B",
                        "fontFamily": "Inter",
                        "fontSize": 16,
                        "fontWeight": "700",
                        "lineHeight": 1.55,
                        "textAlign": "center",
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "z6bfhtext"
                    }
                  ]
                }
              ]
            },
            {
              "type": "frame",
              "id": "IvOFx",
              "name": "row2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 34,
                "width": "100%"
              },
              "children": [
                {
                  "type": "frame",
                  "id": "d1riw",
                  "name": "card4",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 12,
                    "alignItems": "center",
                    "width": "100%"
                  },
                  "children": [
                    {
                      "type": "frame",
                      "id": "Wn3gI",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "width": 170,
                        "height": 170,
                        "borderRadius": 85,
                        "background": "#74C5E8"
                      },
                      "children": []
                    },
                    {
                      "type": "text",
                      "id": "uDgJe",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#24262B",
                        "fontFamily": "Inter",
                        "fontSize": 16,
                        "fontWeight": "700",
                        "lineHeight": 1.55,
                        "textAlign": "center",
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "udgjetext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "wxY7T",
                  "name": "card5",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 12,
                    "alignItems": "center",
                    "width": "100%"
                  },
                  "children": [
                    {
                      "type": "frame",
                      "id": "kfjeq",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "width": 170,
                        "height": 170,
                        "borderRadius": 85,
                        "background": "#EBB7CC"
                      },
                      "children": []
                    },
                    {
                      "type": "text",
                      "id": "0GTwN",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#24262B",
                        "fontFamily": "Inter",
                        "fontSize": 16,
                        "fontWeight": "700",
                        "lineHeight": 1.55,
                        "textAlign": "center",
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "gtwntext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "5MIst",
                  "name": "card6",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 12,
                    "alignItems": "center",
                    "width": "100%"
                  },
                  "children": [
                    {
                      "type": "frame",
                      "id": "dBeCk",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "width": 170,
                        "height": 170,
                        "borderRadius": 85,
                        "background": "#FF1A9A"
                      },
                      "children": []
                    },
                    {
                      "type": "text",
                      "id": "uzSGV",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#24262B",
                        "fontFamily": "Inter",
                        "fontSize": 16,
                        "fontWeight": "700",
                        "lineHeight": 1.55,
                        "textAlign": "center",
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "uzsgvtext"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "ke94j",
      "name": "BottomMedia",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 22,
        "width": 1040
      },
      "children": [
        {
          "type": "frame",
          "id": "y22PE",
          "name": "head",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 20,
            "alignItems": "center",
            "width": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "u0ZLs",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F2737",
                "fontFamily": "Inter",
                "fontSize": 62,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "u0zlstext"
            },
            {
              "type": "frame",
              "id": "J9PWX",
              "name": "",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 240,
                "height": 56,
                "borderRadius": 28,
                "background": "#F3F3EF",
                "border": "2px solid #4A4A4A"
              },
              "children": [
                {
                  "type": "text",
                  "id": "rCa6C",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#333333",
                    "fontFamily": "Inter",
                    "fontSize": 18,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "rca6ctext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "gHjon",
          "name": "posts",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 20,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "S2yd5",
              "name": "p1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "width": "100%"
              },
              "children": [
                {
                  "type": "frame",
                  "id": "Yf7ko",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 260,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "yf7koimagesrc"
                },
                {
                  "type": "text",
                  "id": "xBBo6",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#24262B",
                    "fontFamily": "Inter",
                    "fontSize": 17,
                    "fontWeight": "700",
                    "lineHeight": 1.45,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "xbbo6text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "u7Pd6",
              "name": "p2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "width": "100%"
              },
              "children": [
                {
                  "type": "frame",
                  "id": "nT4bu",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 260,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "nt4buimagesrc"
                },
                {
                  "type": "text",
                  "id": "bnlH2",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#24262B",
                    "fontFamily": "Inter",
                    "fontSize": 17,
                    "fontWeight": "700",
                    "lineHeight": 1.45,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "bnlh2text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "frbxg",
              "name": "p3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "width": "100%"
              },
              "children": [
                {
                  "type": "frame",
                  "id": "G3MKv",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 260,
                    "background": "#FB7147"
                  },
                  "children": []
                },
                {
                  "type": "text",
                  "id": "COAcn",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#24262B",
                    "fontFamily": "Inter",
                    "fontSize": 17,
                    "fontWeight": "700",
                    "lineHeight": 1.45,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "coacntext"
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
  "id": "WDpt7",
  "h1text": "Fix Consumer\nElectronics",
  "p1text": "We're here to remake consumer electronics to respect people and the planet. Unlike most products, ours are open for you to repair, customize, upgrade, and own at the deepest level.",
  "p2text": "Consumer electronics follows a few of the opposite principles of what makes consumer products useful, reliable, and durable over time. We’ve optimized every experience of use and service over product lifecycle and have done this through decisions that increase short-term business metrics while reducing long-term value.",
  "p3text": "It doesn’t have to be this way. There are sensible patterns where products are designed from the start to be repaired and upgraded over years. The constraints in materials, supply chains, and energy use are real, but this is exactly where better design and open standards can create long-term value.",
  "p4text": "Every company can align with this but not every model supports any part of it. We believe that when products are durable, modular, and maintained transparently, customers get better experiences and less waste over time.",
  "nz0y9text": "2020",
  "rejuxtext": "Framework was founded in San Francisco in 2020, with a mission to remake consumer electronics to respect people and the planet.",
  "zlzbctext": "2021",
  "hquk0text": "Framework Laptop shipped with full repairability and expansion support. We launched parts, guides, and upgrades together with the product.",
  "pfcsatext": "2022",
  "xehzztext": "We announced and delivered major upgrades while maintaining compatibility. Core modules and accessories continued to expand.",
  "gxwgytext": "→",
  "bcvntext": "2023",
  "wvphotext": "Introduced more product variants and opened new manufacturing and logistics paths while keeping repair-first principles.",
  "g7ozhtext": "2024",
  "l7kp3text": "Framework Desktop entered development and new ecosystem parts shipped. Community contributions accelerated across regions.",
  "jiee6text": "2025",
  "vtejrtext": "Expanded platform support and scale while preserving the promise of longevity, upgradeability, and transparent documentation.",
  "w1text": "Where we are and where we\nmanufacture",
  "w2text": "We're headquartered in San Francisco, with several offices in Taipei. Most of our manufacturing is in Taiwan, and we have team members in Seattle, EU, and all over the world.",
  "w3imagesrc": "./images/generated-1773114739067.png",
  "aawkatext": "Who",
  "mq7tmtext": "we are",
  "gfkkitext": "Nirav Patel\nFounder\n🌐  in  𝕏",
  "c7mvmtext": "Kieran L\nDirector, Device Software\n🌐  in  𝕏  ◎",
  "z6bfhtext": "Po Yu C\nHead of Industrial Design\nin  𝕏",
  "udgjetext": "Kate C\nTechnical Program Manager\nin",
  "gtwntext": "Mendy N\nChief Operating Officer\nin",
  "uzsgvtext": "Adila L\nSenior Global Supply Manager\nin",
  "u0zlstext": "Latest Updates",
  "rca6ctext": "View More Posts",
  "yf7koimagesrc": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80",
  "xbbo6text": "Updates and livestream\nNews | Feb 26 2026",
  "nt4buimagesrc": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80",
  "bnlh2text": "Linux Gaming with Framework\nNews | Feb 26 2026",
  "coacntext": "In stock on Framework Desktop and updates on the industry-wide silicon crunch\nNews | Dec 22 2025"
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
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };
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

export default function TemplateExclusiveFrameworkAboutStoryAboutmainpenAlt1({ id, h1text, p1text, p2text, p3text, p4text, nz0y9text, rejuxtext, zlzbctext, hquk0text, pfcsatext, xehzztext, gxwgytext, bcvntext, wvphotext, g7ozhtext, l7kp3text, jiee6text, vtejrtext, w1text, w2text, w3imagesrc, aawkatext, mq7tmtext, gfkkitext, c7mvmtext, z6bfhtext, udgjetext, gtwntext, uzsgvtext, u0zlstext, rca6ctext, yf7koimagesrc, xbbo6text, nt4buimagesrc, bnlh2text, coacntext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, h1text, p1text, p2text, p3text, p4text, nz0y9text, rejuxtext, zlzbctext, hquk0text, pfcsatext, xehzztext, gxwgytext, bcvntext, wvphotext, g7ozhtext, l7kp3text, jiee6text, vtejrtext, w1text, w2text, w3imagesrc, aawkatext, mq7tmtext, gfkkitext, c7mvmtext, z6bfhtext, udgjetext, gtwntext, uzsgvtext, u0zlstext, rca6ctext, yf7koimagesrc, xbbo6text, nt4buimagesrc, bnlh2text, coacntext });
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