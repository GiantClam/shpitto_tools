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

const SECTION_KIND = "story";
const SECTION_TREE = {
  "type": "frame",
  "id": "pZAGp",
  "name": "blogMain",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 24,
    "padding": "40px 0px",
    "width": 1160
  },
  "children": [
    {
      "type": "frame",
      "id": "MX9Og",
      "name": "blogTitleRow",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "alignItems": "flex-end",
        "width": "100%",
        "height": 82
      },
      "children": [
        {
          "type": "text",
          "id": "HhOmo",
          "name": "blogTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#111111",
            "fontFamily": "Lora",
            "fontSize": 40,
            "fontWeight": "500",
            "letterSpacing": -0.5,
            "lineHeight": 1,
            "width": 520
          },
          "children": [],
          "textProp": "blogtitletext"
        },
        {
          "type": "text",
          "id": "Bk6SI",
          "name": "blogSub",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#555555",
            "fontFamily": "Inter",
            "fontSize": 14,
            "lineHeight": 1.2,
            "textAlign": "right",
            "width": 420
          },
          "children": [],
          "textProp": "blogsubtext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "89xjH",
      "name": "blogFilter",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 12,
        "alignItems": "center",
        "width": "100%",
        "height": 56
      },
      "children": [
        {
          "type": "frame",
          "id": "jUAnA",
          "name": "blogFilterAll",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "width": 92,
            "height": 40,
            "background": "#FFFFFF",
            "border": "1px solid #D7D7D3"
          },
          "children": [
            {
              "type": "text",
              "id": "KHVla",
              "name": "blogFilterAllTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#555555",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1.2,
                "textAlign": "center",
                "width": 50
              },
              "children": [],
              "textProp": "blogfilteralltxttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "Kxgvu",
          "name": "blogFilter1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "width": 120,
            "height": 40,
            "background": "#0D6E6E",
            "border": "1px solid #0D6E6E",
            "boxShadow": "0px 6px 16px #0D6E6E22"
          },
          "children": [
            {
              "type": "text",
              "id": "lIRvW",
              "name": "blogFilter1Txt",
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
                "width": 84
              },
              "children": [],
              "textProp": "blogfilter1txttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "9sJnb",
          "name": "blogFilter2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "width": 140,
            "height": 40,
            "background": "#F1F7F7",
            "border": "1px solid #8BB8B8"
          },
          "children": [
            {
              "type": "text",
              "id": "CFiXa",
              "name": "blogFilter2Txt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F4C4C",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1.2,
                "textAlign": "center",
                "width": 98
              },
              "children": [],
              "textProp": "blogfilter2txttext"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "YRy0G",
      "name": "blogHero",
      "style": {
        "boxSizing": "border-box",
        "width": "100%",
        "height": 460,
        "background": "#FFFFFF",
        "border": "1px solid #E5E5E5"
      },
      "children": [
        {
          "type": "frame",
          "id": "MfDvB",
          "name": "blogHeroImage",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "width": 660,
            "height": "100%",
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [],
          "imageProp": "blogheroimageimagesrc"
        },
        {
          "type": "frame",
          "id": "pA7VC",
          "name": "blogHeroBody",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 16,
            "justifyContent": "center",
            "padding": "32px 28px",
            "width": "100%",
            "height": "100%",
            "background": "#FFFFFF"
          },
          "children": [
            {
              "type": "text",
              "id": "o5rcS",
              "name": "blogHeroTag",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#0066CC",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "600",
                "letterSpacing": 1.6,
                "width": 220
              },
              "children": [],
              "textProp": "blogherotagtext"
            },
            {
              "type": "text",
              "id": "ShB02",
              "name": "blogHeroHead",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#111111",
                "fontFamily": "Lora",
                "fontSize": 34,
                "fontWeight": "500",
                "letterSpacing": -1,
                "lineHeight": 1,
                "width": "100%"
              },
              "children": [],
              "textProp": "blogheroheadtext"
            },
            {
              "type": "text",
              "id": "hOpwl",
              "name": "blogHeroMeta",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#555555",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "500",
                "width": "100%"
              },
              "children": [],
              "textProp": "blogherometatext"
            },
            {
              "type": "frame",
              "id": "iqP2E",
              "name": "blogHeroBtn",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 168,
                "height": 40,
                "background": "#111111"
              },
              "children": [
                {
                  "type": "text",
                  "id": "5smjz",
                  "name": "blogHeroBtnTxt",
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
                    "width": 98
                  },
                  "children": [],
                  "textProp": "blogherobtntxttext"
                }
              ],
              "hrefProp": "blogherobtnhref"
            },
            {
              "type": "frame",
              "id": "3jZTC",
              "name": "heroRevealState",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 176,
                "height": 28,
                "borderRadius": 999,
                "background": "#EEF5F5",
                "border": "1px solid #C9DDDD"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Di9rv",
                  "name": "revealChipTxt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D6E6E",
                    "fontFamily": "JetBrains Mono",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.1,
                    "textAlign": "center",
                    "width": 132
                  },
                  "children": [],
                  "textProp": "revealchiptxttext"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "ZK1IT",
      "name": "blogGrid",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 16,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "yGgle",
          "name": "blogColL",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "6mpZe",
              "name": "post1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "padding": "16px",
                "width": "100%",
                "height": 420,
                "background": "#FFFFFF",
                "border": "1px solid #E5E5E5"
              },
              "children": [
                {
                  "type": "text",
                  "id": "sV2fp",
                  "name": "post1Index",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#999999",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.6,
                    "width": 60
                  },
                  "children": [],
                  "textProp": "post1indextext"
                },
                {
                  "type": "frame",
                  "id": "AEJGf",
                  "name": "post1Img",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 120,
                    "borderRadius": 8,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "post1imgimagesrc"
                },
                {
                  "type": "text",
                  "id": "iRxS8",
                  "name": "post1Title",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#111111",
                    "fontFamily": "Lora",
                    "fontSize": 22,
                    "fontWeight": "500",
                    "lineHeight": 1.1,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post1titletext"
                },
                {
                  "type": "text",
                  "id": "PjJGL",
                  "name": "post1Meta",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#6D6C6A",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "normal",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post1metatext"
                },
                {
                  "type": "text",
                  "id": "psi7D",
                  "name": "post1Desc",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#555555",
                    "fontFamily": "Inter",
                    "fontSize": 14,
                    "fontWeight": "normal",
                    "lineHeight": 1.4,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post1desctext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "dQhXB",
              "name": "post2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "padding": "16px",
                "width": "100%",
                "height": 420,
                "background": "#FCFDFC",
                "border": "1px solid #0D6E6E",
                "boxShadow": "0px 14px 30px #0D6E6E1F"
              },
              "children": [
                {
                  "type": "text",
                  "id": "t7QyC",
                  "name": "post2Index",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#999999",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.6,
                    "width": 60
                  },
                  "children": [],
                  "textProp": "post2indextext"
                },
                {
                  "type": "frame",
                  "id": "6tjOJ",
                  "name": "post2Img",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 120,
                    "borderRadius": 8,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "post2imgimagesrc"
                },
                {
                  "type": "text",
                  "id": "eMaDw",
                  "name": "post2Title",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#111111",
                    "fontFamily": "Lora",
                    "fontSize": 22,
                    "fontWeight": "500",
                    "lineHeight": 1.1,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post2titletext"
                },
                {
                  "type": "text",
                  "id": "g2vLt",
                  "name": "post2Meta",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#6D6C6A",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "normal",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post2metatext"
                },
                {
                  "type": "text",
                  "id": "uI5U6",
                  "name": "post2Desc",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#555555",
                    "fontFamily": "Inter",
                    "fontSize": 14,
                    "fontWeight": "normal",
                    "lineHeight": 1.4,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post2desctext"
                },
                {
                  "type": "frame",
                  "id": "nLkVE",
                  "name": "hoverChip",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 76,
                    "height": 26,
                    "borderRadius": 999,
                    "background": "#0D6E6E"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "5eCin",
                      "name": "hoverChipTxt",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#FFFFFF",
                        "fontFamily": "JetBrains Mono",
                        "fontSize": 10,
                        "fontWeight": "600",
                        "letterSpacing": 1.2,
                        "textAlign": "center",
                        "width": 48
                      },
                      "children": [],
                      "textProp": "hoverchiptxttext"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "eTDdx",
          "name": "blogColR",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "7dIWU",
              "name": "post3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "padding": "16px",
                "width": "100%",
                "height": 420,
                "background": "#FFFFFF",
                "border": "1px solid #E5E5E5"
              },
              "children": [
                {
                  "type": "text",
                  "id": "xoRGB",
                  "name": "post3Index",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#999999",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.6,
                    "width": 60
                  },
                  "children": [],
                  "textProp": "post3indextext"
                },
                {
                  "type": "frame",
                  "id": "18cyU",
                  "name": "post3Img",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 120,
                    "borderRadius": 8,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "post3imgimagesrc"
                },
                {
                  "type": "text",
                  "id": "5uSp3",
                  "name": "post3Title",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#111111",
                    "fontFamily": "Lora",
                    "fontSize": 22,
                    "fontWeight": "500",
                    "lineHeight": 1.1,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post3titletext"
                },
                {
                  "type": "text",
                  "id": "yREEE",
                  "name": "post3Meta",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#6D6C6A",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "normal",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post3metatext"
                },
                {
                  "type": "text",
                  "id": "RDKyX",
                  "name": "post3Desc",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#555555",
                    "fontFamily": "Inter",
                    "fontSize": 14,
                    "fontWeight": "normal",
                    "lineHeight": 1.4,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post3desctext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "7v4Hv",
              "name": "post4",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "padding": "16px",
                "width": "100%",
                "height": 420,
                "background": "#FFFFFF",
                "border": "1px solid #E5E5E5"
              },
              "children": [
                {
                  "type": "text",
                  "id": "tJYaS",
                  "name": "post4Index",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#999999",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "letterSpacing": 1.6,
                    "width": 60
                  },
                  "children": [],
                  "textProp": "post4indextext"
                },
                {
                  "type": "frame",
                  "id": "3z27i",
                  "name": "post4Img",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 120,
                    "borderRadius": 8,
                    "backgroundRepeat": "no-repeat",
                    "backgroundPosition": "center",
                    "backgroundSize": "cover"
                  },
                  "children": [],
                  "imageProp": "post4imgimagesrc"
                },
                {
                  "type": "text",
                  "id": "xEhTq",
                  "name": "post4Title",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#111111",
                    "fontFamily": "Lora",
                    "fontSize": 22,
                    "fontWeight": "500",
                    "lineHeight": 1.1,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post4titletext"
                },
                {
                  "type": "text",
                  "id": "uhPAG",
                  "name": "post4Meta",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#6D6C6A",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "normal",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post4metatext"
                },
                {
                  "type": "text",
                  "id": "YZot6",
                  "name": "post4Desc",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#555555",
                    "fontFamily": "Inter",
                    "fontSize": 14,
                    "fontWeight": "normal",
                    "lineHeight": 1.4,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "post4desctext"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "QYUPM",
      "name": "blogDigest",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 12,
        "justifyContent": "center",
        "padding": "24px 28px",
        "width": "100%",
        "height": 180,
        "background": "#111111"
      },
      "children": [
        {
          "type": "text",
          "id": "CWvOE",
          "name": "digestTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Space Grotesk",
            "fontSize": 30,
            "fontWeight": "600",
            "letterSpacing": -0.5,
            "width": "100%"
          },
          "children": [],
          "textProp": "digesttitletext"
        },
        {
          "type": "text",
          "id": "2wHWO",
          "name": "digestSub",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#D6D6D6",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "normal",
            "lineHeight": 1.3,
            "width": "100%"
          },
          "children": [],
          "textProp": "digestsubtext"
        },
        {
          "type": "frame",
          "id": "fOgbK",
          "name": "digestBtn",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "width": 170,
            "height": 40,
            "background": "#FFFFFF"
          },
          "children": [
            {
              "type": "text",
              "id": "XCr9Q",
              "name": "digestBtnTxt",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#111111",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "600",
                "letterSpacing": 1.2
              },
              "children": [],
              "textProp": "digestbtntxttext"
            }
          ],
          "hrefProp": "digestbtnhref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "t9Pmr",
      "name": "blogPager",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "alignItems": "center",
        "padding": "0px 4px",
        "width": "100%",
        "height": 48,
        "borderTop": "1px solid #E5E5E5"
      },
      "children": [
        {
          "type": "text",
          "id": "Pl9ym",
          "name": "blogPagerTxt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#555555",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "width": 260
          },
          "children": [],
          "textProp": "blogpagertxttext"
        },
        {
          "type": "frame",
          "id": "y4op7",
          "name": "blogPagerControls",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 8,
            "alignItems": "center",
            "width": 236,
            "height": 32
          },
          "children": [
            {
              "type": "frame",
              "id": "HBxv0",
              "name": "pagerPrev",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 54,
                "height": 32,
                "background": "#F4F4F1",
                "border": "1px solid #E2E2DE"
              },
              "children": [
                {
                  "type": "text",
                  "id": "jzG1y",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#999999",
                    "fontFamily": "JetBrains Mono",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "textAlign": "center",
                    "width": 24
                  },
                  "children": [],
                  "textProp": "jzg1ytext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "F1DkY",
              "name": "pagerPage1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 32,
                "height": 32,
                "background": "#FFFFFF",
                "border": "1px solid #D9D9D4"
              },
              "children": [
                {
                  "type": "text",
                  "id": "ZuHcg",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#555555",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "600",
                    "textAlign": "center",
                    "width": 10
                  },
                  "children": [],
                  "textProp": "zuhcgtext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "tap8t",
              "name": "pagerPage2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 32,
                "height": 32,
                "background": "#111111"
              },
              "children": [
                {
                  "type": "text",
                  "id": "nWgAg",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "600",
                    "textAlign": "center",
                    "width": 10
                  },
                  "children": [],
                  "textProp": "nwgagtext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "1QXLO",
              "name": "pagerPage3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 32,
                "height": 32,
                "background": "#FFFFFF",
                "border": "1px solid #D9D9D4"
              },
              "children": [
                {
                  "type": "text",
                  "id": "6G2pt",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#555555",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "600",
                    "textAlign": "center",
                    "width": 10
                  },
                  "children": [],
                  "textProp": "g2pttext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "jU2nd",
              "name": "pagerNext",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 54,
                "height": 32,
                "background": "#F7F7F5",
                "border": "1px solid #C9D7D7"
              },
              "children": [
                {
                  "type": "text",
                  "id": "r821D",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D6E6E",
                    "fontFamily": "JetBrains Mono",
                    "fontSize": 10,
                    "fontWeight": "600",
                    "textAlign": "center",
                    "width": 24
                  },
                  "children": [],
                  "textProp": "r821dtext"
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
  "id": "pZAGp",
  "blogtitletext": "Journal & Stories",
  "blogsubtext": "Insights on sound engineering, craft, and listening rituals.",
  "blogfilteralltxttext": "ALL",
  "blogfilter1txttext": "PRODUCTS",
  "blogfilter2txttext": "ENGINEERING",
  "blogheroimageimagesrc": "https://images.unsplash.com/photo-1745910020846-3d4d0088d24d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgwNjJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "blogherotagtext": "01  FEATURED ARTICLE",
  "blogheroheadtext": "The Art of Tuning: Building a Listening Experience That Lasts",
  "blogherometatext": "By Editorial Team  ·  Jan 21, 2026  ·  8 min read",
  "blogherobtnhref": "/read-article",
  "blogherobtntxttext": "READ ARTICLE",
  "revealchiptxttext": "Reveal on Enter",
  "post1indextext": "02",
  "post1imgimagesrc": "https://images.unsplash.com/photo-1754512286124-4fe9baf415d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgwNjN8&ixlib=rb-4.1.0&q=80&w=1080",
  "post1titletext": "How We Evaluate Acoustic Detail Across Genres",
  "post1metatext": "Jan 14, 2026  ·  Product & Craft",
  "post1desctext": "Our test workflow blends objective measurements with long-session listening notes to ensure balanced performance.",
  "post2indextext": "03",
  "post2imgimagesrc": "https://images.unsplash.com/photo-1672760559118-afd0612c511e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgwNjR8&ixlib=rb-4.1.0&q=80&w=1080",
  "post2titletext": "Studio Notes: Materials That Shape Signature Sound",
  "post2metatext": "Jan 09, 2026  ·  Engineering",
  "post2desctext": "From machined aluminum to lambskin leather, every material contributes to comfort and resonance behavior.",
  "hoverchiptxttext": "HOVER",
  "post3indextext": "04",
  "post3imgimagesrc": "https://images.unsplash.com/photo-1665939108838-090b40c527a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgwNjV8&ixlib=rb-4.1.0&q=80&w=1080",
  "post3titletext": "Listening Sessions: Curated Tracks for New Headphones",
  "post3metatext": "Jan 03, 2026  ·  Community",
  "post3desctext": "A practical playlist to check bass extension, vocal intimacy, and high-frequency smoothness.",
  "post4indextext": "05",
  "post4imgimagesrc": "https://images.unsplash.com/photo-1660628618928-6b0ce7f8bdd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgwNjV8&ixlib=rb-4.1.0&q=80&w=1080",
  "post4titletext": "Field Report: Touring With MW Series",
  "post4metatext": "Dec 28, 2025  ·  Travel & Use Cases",
  "post4desctext": "Early draft for long-haul travel testing. Final listening graphs and battery logs are being edited.",
  "digesttitletext": "Get stories in your inbox",
  "digestsubtext": "Monthly notes on design, engineering, and listening culture.",
  "digestbtnhref": "/subscribe",
  "digestbtntxttext": "Subscribe",
  "blogpagertxttext": "Showing 1-5 of 32 articles",
  "jzg1ytext": "PREV",
  "zuhcgtext": "1",
  "nwgagtext": "2",
  "g2pttext": "3",
  "r821dtext": "NEXT"
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

export default function TemplateExclusivePenSiteMasterdynamicBlogStoryBlogmainpenAlt1({ id, blogtitletext, blogsubtext, blogfilteralltxttext, blogfilter1txttext, blogfilter2txttext, blogheroimageimagesrc, blogherotagtext, blogheroheadtext, blogherometatext, blogherobtnhref, blogherobtntxttext, revealchiptxttext, post1indextext, post1imgimagesrc, post1titletext, post1metatext, post1desctext, post2indextext, post2imgimagesrc, post2titletext, post2metatext, post2desctext, hoverchiptxttext, post3indextext, post3imgimagesrc, post3titletext, post3metatext, post3desctext, post4indextext, post4imgimagesrc, post4titletext, post4metatext, post4desctext, digesttitletext, digestsubtext, digestbtnhref, digestbtntxttext, blogpagertxttext, jzg1ytext, zuhcgtext, nwgagtext, g2pttext, r821dtext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, blogtitletext, blogsubtext, blogfilteralltxttext, blogfilter1txttext, blogfilter2txttext, blogheroimageimagesrc, blogherotagtext, blogheroheadtext, blogherometatext, blogherobtnhref, blogherobtntxttext, revealchiptxttext, post1indextext, post1imgimagesrc, post1titletext, post1metatext, post1desctext, post2indextext, post2imgimagesrc, post2titletext, post2metatext, post2desctext, hoverchiptxttext, post3indextext, post3imgimagesrc, post3titletext, post3metatext, post3desctext, post4indextext, post4imgimagesrc, post4titletext, post4metatext, post4desctext, digesttitletext, digestsubtext, digestbtnhref, digestbtntxttext, blogpagertxttext, jzg1ytext, zuhcgtext, nwgagtext, g2pttext, r821dtext });
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