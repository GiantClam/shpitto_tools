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

const SECTION_KIND = "cta";
const SECTION_TREE = {
  "type": "frame",
  "id": "6XyDx",
  "name": "newsMain",
  "style": {
    "boxSizing": "border-box",
    "width": 1440,
    "height": 1643,
    "background": "#F3F3F2",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "frame",
      "id": "IVShD",
      "name": "leftCol",
      "style": {
        "boxSizing": "border-box",
        "width": 920,
        "height": 1609,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 32,
        "top": 34
      },
      "children": [
        {
          "type": "text",
          "id": "sIXuC",
          "name": "newsTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1E1E1E",
            "fontFamily": "Inter",
            "fontSize": 48,
            "fontWeight": "600",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "textProp": "newstitletext"
        },
        {
          "type": "frame",
          "id": "LqycN",
          "name": "n1",
          "style": {
            "boxSizing": "border-box",
            "width": 900,
            "height": 148,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 88
          },
          "children": [
            {
              "type": "frame",
              "id": "wW0ha",
              "name": "img1",
              "style": {
                "boxSizing": "border-box",
                "width": 120,
                "height": 120,
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
              "id": "lzgoS",
              "name": "t1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#222222",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "600",
                "lineHeight": 1.25,
                "width": 740,
                "position": "absolute",
                "left": 146,
                "top": 0
              },
              "children": [],
              "textProp": "t1text"
            },
            {
              "type": "text",
              "id": "SslgN",
              "name": "d1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A8A8A",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "position": "absolute",
                "left": 146,
                "top": 78
              },
              "children": [],
              "textProp": "d1text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "iOHRg",
          "name": "n2",
          "style": {
            "boxSizing": "border-box",
            "width": 900,
            "height": 148,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 266
          },
          "children": [
            {
              "type": "frame",
              "id": "oN4q4",
              "name": "img1",
              "style": {
                "boxSizing": "border-box",
                "width": 120,
                "height": 120,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": [],
              "imageProp": "img1imagesrc2"
            },
            {
              "type": "text",
              "id": "fC6Nb",
              "name": "t1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#222222",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "600",
                "width": 740,
                "position": "absolute",
                "left": 146,
                "top": 0
              },
              "children": [],
              "textProp": "t1text2"
            },
            {
              "type": "text",
              "id": "Tv8pY",
              "name": "d1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A8A8A",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "position": "absolute",
                "left": 146,
                "top": 110
              },
              "children": [],
              "textProp": "d1text2"
            },
            {
              "type": "text",
              "id": "wEGZY",
              "name": "desc2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5B5B5B",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "lineHeight": 1.35,
                "width": 700,
                "position": "absolute",
                "left": 146,
                "top": 48
              },
              "children": [],
              "textProp": "desc2text"
            }
          ]
        },
        {
          "type": "frame",
          "id": "oCGpv",
          "name": "n3",
          "style": {
            "boxSizing": "border-box",
            "width": 900,
            "height": 148,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 444
          },
          "children": [
            {
              "type": "frame",
              "id": "VCQ1a",
              "name": "img1",
              "style": {
                "boxSizing": "border-box",
                "width": 120,
                "height": 120,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": [],
              "imageProp": "img1imagesrc3"
            },
            {
              "type": "text",
              "id": "fm6DM",
              "name": "t1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#222222",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "600",
                "width": 740,
                "position": "absolute",
                "left": 146,
                "top": 0
              },
              "children": [],
              "textProp": "t1text3"
            },
            {
              "type": "text",
              "id": "xPNGQ",
              "name": "d1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A8A8A",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "position": "absolute",
                "left": 146,
                "top": 110
              },
              "children": [],
              "textProp": "d1text3"
            }
          ]
        },
        {
          "type": "frame",
          "id": "MjUqx",
          "name": "n4",
          "style": {
            "boxSizing": "border-box",
            "width": 900,
            "height": 148,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 622
          },
          "children": [
            {
              "type": "frame",
              "id": "conkW",
              "name": "img1",
              "style": {
                "boxSizing": "border-box",
                "width": 120,
                "height": 120,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": [],
              "imageProp": "img1imagesrc2"
            },
            {
              "type": "text",
              "id": "DA261",
              "name": "t1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#222222",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "600",
                "width": 740,
                "position": "absolute",
                "left": 146,
                "top": 0
              },
              "children": [],
              "textProp": "t1text4"
            },
            {
              "type": "text",
              "id": "Gqm7i",
              "name": "d1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A8A8A",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "position": "absolute",
                "left": 146,
                "top": 78
              },
              "children": [],
              "textProp": "d1text4"
            }
          ]
        },
        {
          "type": "frame",
          "id": "5Jwe8",
          "name": "n5",
          "style": {
            "boxSizing": "border-box",
            "width": 900,
            "height": 148,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 800
          },
          "children": [
            {
              "type": "frame",
              "id": "aTcJt",
              "name": "img1",
              "style": {
                "boxSizing": "border-box",
                "width": 120,
                "height": 120,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": [],
              "imageProp": "img1imagesrc3"
            },
            {
              "type": "text",
              "id": "IWI2T",
              "name": "t1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#222222",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "600",
                "width": 740,
                "position": "absolute",
                "left": 146,
                "top": 0
              },
              "children": [],
              "textProp": "t1text5"
            },
            {
              "type": "text",
              "id": "4IoPi",
              "name": "d1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A8A8A",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "position": "absolute",
                "left": 146,
                "top": 78
              },
              "children": [],
              "textProp": "d1text5"
            }
          ]
        },
        {
          "type": "frame",
          "id": "B5mPE",
          "name": "n6",
          "style": {
            "boxSizing": "border-box",
            "width": 900,
            "height": 148,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 978
          },
          "children": [
            {
              "type": "frame",
              "id": "38O2c",
              "name": "img1",
              "style": {
                "boxSizing": "border-box",
                "width": 120,
                "height": 120,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": [],
              "imageProp": "img1imagesrc4"
            },
            {
              "type": "text",
              "id": "zQsOM",
              "name": "t1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#222222",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "600",
                "width": 740,
                "position": "absolute",
                "left": 146,
                "top": 0
              },
              "children": [],
              "textProp": "t1text6"
            },
            {
              "type": "text",
              "id": "qW5CV",
              "name": "d1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A8A8A",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "position": "absolute",
                "left": 146,
                "top": 78
              },
              "children": [],
              "textProp": "d1text6"
            }
          ]
        },
        {
          "type": "frame",
          "id": "YqCG2",
          "name": "n7",
          "style": {
            "boxSizing": "border-box",
            "width": 900,
            "height": 148,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 1156
          },
          "children": [
            {
              "type": "frame",
              "id": "UE2ZM",
              "name": "img1",
              "style": {
                "boxSizing": "border-box",
                "width": 120,
                "height": 120,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": [],
              "imageProp": "img1imagesrc4"
            },
            {
              "type": "text",
              "id": "hgs9b",
              "name": "t1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#222222",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "600",
                "width": 740,
                "position": "absolute",
                "left": 146,
                "top": 0
              },
              "children": [],
              "textProp": "t1text7"
            },
            {
              "type": "text",
              "id": "oIfeV",
              "name": "d1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A8A8A",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "position": "absolute",
                "left": 146,
                "top": 95
              },
              "children": [],
              "textProp": "d1text7"
            }
          ]
        },
        {
          "type": "frame",
          "id": "DuY2U",
          "name": "n8",
          "style": {
            "boxSizing": "border-box",
            "width": 900,
            "height": 148,
            "background": "#F3F3F2",
            "position": "absolute",
            "overflow": "hidden",
            "left": 0,
            "top": 1334
          },
          "children": [
            {
              "type": "frame",
              "id": "zv8NR",
              "name": "img1",
              "style": {
                "boxSizing": "border-box",
                "width": 120,
                "height": 120,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "position": "absolute",
                "left": 0,
                "top": 0
              },
              "children": [],
              "imageProp": "img1imagesrc5"
            },
            {
              "type": "text",
              "id": "kXy7P",
              "name": "t1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#222222",
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": "600",
                "width": 740,
                "position": "absolute",
                "left": 146,
                "top": 0
              },
              "children": [],
              "textProp": "t1text8"
            },
            {
              "type": "text",
              "id": "UFRAM",
              "name": "d1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8A8A8A",
                "fontFamily": "Inter",
                "fontSize": 11,
                "fontWeight": "500",
                "position": "absolute",
                "left": 146,
                "top": 95
              },
              "children": [],
              "textProp": "d1text8"
            }
          ]
        },
        {
          "type": "rectangle",
          "id": "KO1Pg",
          "name": "line1",
          "style": {
            "boxSizing": "border-box",
            "width": 900,
            "height": 1,
            "background": "#DFDFDF",
            "position": "absolute",
            "left": 0,
            "top": 1510
          },
          "children": []
        },
        {
          "type": "rectangle",
          "id": "Hpdwl",
          "name": "moreBtn",
          "style": {
            "boxSizing": "border-box",
            "width": 86,
            "height": 30,
            "borderRadius": 2,
            "background": "#EAEAEA",
            "border": "1px solid #D2D2D2",
            "position": "absolute",
            "left": 0,
            "top": 1530
          },
          "children": [],
          "hrefProp": "morebtnhref"
        },
        {
          "type": "text",
          "id": "fIrmi",
          "name": "moreTxt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#484848",
            "fontFamily": "Inter",
            "fontSize": 11,
            "fontWeight": "600",
            "position": "absolute",
            "left": 14,
            "top": 1538
          },
          "children": [],
          "textProp": "moretxttext"
        }
      ]
    },
    {
      "type": "frame",
      "id": "oX2Tr",
      "name": "rightCol",
      "style": {
        "boxSizing": "border-box",
        "width": 380,
        "height": 1450,
        "background": "#F3F3F2",
        "position": "absolute",
        "overflow": "hidden",
        "left": 1010,
        "top": 118
      },
      "children": [
        {
          "type": "text",
          "id": "a4OEX",
          "name": "rcTitle1",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#222222",
            "fontFamily": "Inter",
            "fontSize": 24,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 0
          },
          "children": [],
          "textProp": "rctitle1text"
        },
        {
          "type": "text",
          "id": "KIJwK",
          "name": "rcBody1",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B4B4B",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "500",
            "lineHeight": 1.55,
            "width": 340,
            "position": "absolute",
            "left": 0,
            "top": 44
          },
          "children": [],
          "textProp": "rcbody1text"
        },
        {
          "type": "text",
          "id": "DJ9fk",
          "name": "rcTitle2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#222222",
            "fontFamily": "Inter",
            "fontSize": 24,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 262
          },
          "children": [],
          "textProp": "rctitle2text"
        },
        {
          "type": "text",
          "id": "sV80G",
          "name": "rcBody2",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B4B4B",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "500",
            "lineHeight": 1.55,
            "width": 320,
            "position": "absolute",
            "left": 0,
            "top": 308
          },
          "children": [],
          "textProp": "rcbody2text"
        },
        {
          "type": "text",
          "id": "q2tgD",
          "name": "rcTitle3",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#222222",
            "fontFamily": "Inter",
            "fontSize": 24,
            "fontWeight": "700",
            "position": "absolute",
            "left": 0,
            "top": 392
          },
          "children": [],
          "textProp": "rctitle3text"
        },
        {
          "type": "text",
          "id": "5AEwf",
          "name": "rcBody3",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#4B4B4B",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "500",
            "lineHeight": 1.55,
            "width": 330,
            "position": "absolute",
            "left": 0,
            "top": 440
          },
          "children": [],
          "textProp": "rcbody3text"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "6XyDx",
  "newstitletext": "新闻",
  "img1imagesrc": "https://images.unsplash.com/photo-1726421690313-2e0519335b82?auto=format&fit=crop&w=600&q=80",
  "t1text": "展望2026年，以人才、技术和可持续发展领航新行业",
  "d1text": "2026-10-14",
  "img1imagesrc2": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
  "t1text2": "利用数据驱动，降低制造业对环境的影响",
  "d1text2": "2025-11-17",
  "desc2text": "该新闻介绍了数据在切削领域中的应用，帮助制造商提升资源效率。",
  "img1imagesrc3": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80",
  "t1text3": "超级车铣，“智”造未来。山特维克可乐满领跑直进博览——CIMT 2025精彩回顾",
  "d1text3": "2025-06-10",
  "t1text4": "利用 CoroDrill® Dura 462 拓宽钻孔可能性",
  "d1text4": "2025-05-01",
  "t1text5": "牛逼大盘磨刀加工",
  "d1text5": "2025-03-19",
  "img1imagesrc4": "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=600&q=80",
  "t1text6": "Data drives our sustainable future",
  "d1text6": "2025-02-28",
  "t1text7": "Sandvik Coromant introduces new brand identity",
  "d1text7": "2024-09-17",
  "img1imagesrc5": "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=600&q=80",
  "t1text8": "Celebrating 100 years of cemented carbide",
  "d1text8": "2024-06-27",
  "morebtnhref": "/",
  "moretxttext": "查看更多",
  "rctitle1text": "媒体联系人",
  "rcbody1text": "全球 - 新闻\n姓名\n电子邮件\n电话\n\n新闻\n姓名 and 邮箱\n电话",
  "rctitle2text": "请在此阅读新闻和点击",
  "rcbody2text": "查阅与媒体相关的资产、新闻与品牌资料。",
  "rctitle3text": "山特维克可乐满",
  "rcbody3text": "企业新闻\n欢迎订阅我们的新闻更新，获取最新发布与活动信息。"
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

export default function TemplateExclusivePenSiteSandvikNewsCtaNewsmainpenAlt3({ id, newstitletext, img1imagesrc, t1text, d1text, img1imagesrc2, t1text2, d1text2, desc2text, img1imagesrc3, t1text3, d1text3, t1text4, d1text4, t1text5, d1text5, img1imagesrc4, t1text6, d1text6, t1text7, d1text7, img1imagesrc5, t1text8, d1text8, morebtnhref, moretxttext, rctitle1text, rcbody1text, rctitle2text, rcbody2text, rctitle3text, rcbody3text, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, newstitletext, img1imagesrc, t1text, d1text, img1imagesrc2, t1text2, d1text2, desc2text, img1imagesrc3, t1text3, d1text3, t1text4, d1text4, t1text5, d1text5, img1imagesrc4, t1text6, d1text6, t1text7, d1text7, img1imagesrc5, t1text8, d1text8, morebtnhref, moretxttext, rctitle1text, rcbody1text, rctitle2text, rcbody2text, rctitle3text, rcbody3text });
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