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
  "id": "QNHgo",
  "name": "foot",
  "style": {
    "boxSizing": "border-box",
    "width": 1200,
    "height": 978,
    "background": "#040608",
    "position": "relative",
    "overflow": "hidden"
  },
  "children": [
    {
      "type": "text",
      "id": "IYuhC",
      "name": "logo",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#F2F5F8",
        "fontFamily": "Inter",
        "fontSize": 34,
        "fontWeight": "700",
        "position": "absolute",
        "left": 32,
        "top": 84
      },
      "children": [],
      "textProp": "logotext"
    },
    {
      "type": "text",
      "id": "vUoVn",
      "name": "stay",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#F2F5F8",
        "fontFamily": "Inter",
        "fontSize": 54,
        "fontWeight": "700",
        "lineHeight": 1.04,
        "width": 420,
        "position": "absolute",
        "left": 32,
        "top": 146
      },
      "children": [],
      "textProp": "staytext",
      "hrefProp": "stayhref"
    },
    {
      "type": "text",
      "id": "bzlP7",
      "name": "desc",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B3BCC7",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "500",
        "lineHeight": 1.4,
        "width": 380,
        "position": "absolute",
        "left": 32,
        "top": 240
      },
      "children": [],
      "textProp": "desctext",
      "hrefProp": "deschref"
    },
    {
      "type": "text",
      "id": "DcRSy",
      "name": "mail",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#8E99A7",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "500",
        "position": "absolute",
        "left": 32,
        "top": 392
      },
      "children": [],
      "textProp": "mailtext",
      "hrefProp": "mailhref"
    },
    {
      "type": "frame",
      "id": "Zd6Mu",
      "name": "line1",
      "style": {
        "boxSizing": "border-box",
        "width": 420,
        "height": 1,
        "background": "#2A3038",
        "position": "absolute",
        "left": 32,
        "top": 430
      },
      "children": []
    },
    {
      "type": "text",
      "id": "kDtYY",
      "name": "name",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#8E99A7",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "500",
        "position": "absolute",
        "left": 32,
        "top": 462
      },
      "children": [],
      "textProp": "nametext",
      "hrefProp": "namehref"
    },
    {
      "type": "frame",
      "id": "9fIhW",
      "name": "line2",
      "style": {
        "boxSizing": "border-box",
        "width": 420,
        "height": 1,
        "background": "#2A3038",
        "position": "absolute",
        "left": 32,
        "top": 500
      },
      "children": []
    },
    {
      "type": "text",
      "id": "E8efS",
      "name": "org",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#8E99A7",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "500",
        "position": "absolute",
        "left": 32,
        "top": 532
      },
      "children": [],
      "textProp": "orgtext",
      "hrefProp": "orghref"
    },
    {
      "type": "frame",
      "id": "0IzlV",
      "name": "line3",
      "style": {
        "boxSizing": "border-box",
        "width": 420,
        "height": 1,
        "background": "#2A3038",
        "position": "absolute",
        "left": 32,
        "top": 570
      },
      "children": []
    },
    {
      "type": "frame",
      "id": "S10FF",
      "name": "chk",
      "style": {
        "boxSizing": "border-box",
        "width": 26,
        "height": 26,
        "borderRadius": 6,
        "background": "#F5F7FA",
        "position": "absolute",
        "left": 32,
        "top": 608
      },
      "children": []
    },
    {
      "type": "text",
      "id": "cbVDF",
      "name": "agree",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B3BCC7",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "500",
        "lineHeight": 1.45,
        "width": 360,
        "position": "absolute",
        "left": 70,
        "top": 606
      },
      "children": [],
      "textProp": "agreetext",
      "hrefProp": "agreehref"
    },
    {
      "type": "frame",
      "id": "UJKBU",
      "name": "subBtn",
      "style": {
        "boxSizing": "border-box",
        "width": 150,
        "height": 50,
        "borderRadius": 12,
        "background": "#FF6A00",
        "position": "absolute",
        "overflow": "hidden",
        "left": 32,
        "top": 720
      },
      "children": [
        {
          "type": "text",
          "id": "uYJgG",
          "name": "subTxt",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FFFFFF",
            "fontFamily": "Inter",
            "fontSize": 24,
            "fontWeight": "700",
            "position": "absolute",
            "left": 15,
            "top": 10
          },
          "children": [],
          "textProp": "subtxttext"
        }
      ],
      "hrefProp": "subbtnhref"
    },
    {
      "type": "text",
      "id": "8Wj6s",
      "name": "rh1",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#F2F5F8",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "700",
        "position": "absolute",
        "left": 472,
        "top": 84
      },
      "children": [],
      "textProp": "rh1text",
      "hrefProp": "rh1href"
    },
    {
      "type": "text",
      "id": "8WQiR",
      "name": "qh1",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#F2F5F8",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "700",
        "position": "absolute",
        "left": 652,
        "top": 84
      },
      "children": [],
      "textProp": "qh1text",
      "hrefProp": "qh1href"
    },
    {
      "type": "text",
      "id": "sWbbc",
      "name": "ph1",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#F2F5F8",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "700",
        "position": "absolute",
        "left": 812,
        "top": 84
      },
      "children": [],
      "textProp": "ph1text",
      "hrefProp": "ph1href"
    },
    {
      "type": "text",
      "id": "3L20l",
      "name": "ch1",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#F2F5F8",
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": "700",
        "position": "absolute",
        "left": 962,
        "top": 84
      },
      "children": [],
      "textProp": "ch1text",
      "hrefProp": "ch1href"
    },
    {
      "type": "text",
      "id": "noANL",
      "name": "r1",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 472,
        "top": 146
      },
      "children": [],
      "textProp": "r1text",
      "hrefProp": "r1href"
    },
    {
      "type": "text",
      "id": "XPnvb",
      "name": "r2",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 472,
        "top": 188
      },
      "children": [],
      "textProp": "r2text",
      "hrefProp": "r2href"
    },
    {
      "type": "text",
      "id": "LQxPg",
      "name": "r3",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 472,
        "top": 230
      },
      "children": [],
      "textProp": "r3text",
      "hrefProp": "r3href"
    },
    {
      "type": "text",
      "id": "bhyJx",
      "name": "r4",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 472,
        "top": 272
      },
      "children": [],
      "textProp": "r4text",
      "hrefProp": "r4href"
    },
    {
      "type": "text",
      "id": "wOucx",
      "name": "r5",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 472,
        "top": 314
      },
      "children": [],
      "textProp": "r5text",
      "hrefProp": "r5href"
    },
    {
      "type": "text",
      "id": "xAx3l",
      "name": "r6",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 472,
        "top": 356
      },
      "children": [],
      "textProp": "r6text",
      "hrefProp": "r6href"
    },
    {
      "type": "text",
      "id": "mYvuP",
      "name": "r7",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 472,
        "top": 398
      },
      "children": [],
      "textProp": "r7text",
      "hrefProp": "r7href"
    },
    {
      "type": "text",
      "id": "6jh7L",
      "name": "r8",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 472,
        "top": 440
      },
      "children": [],
      "textProp": "r8text",
      "hrefProp": "r8href"
    },
    {
      "type": "text",
      "id": "UBm4K",
      "name": "q1",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 652,
        "top": 146
      },
      "children": [],
      "textProp": "q1text",
      "hrefProp": "q1href"
    },
    {
      "type": "text",
      "id": "tVupX",
      "name": "q2",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 652,
        "top": 188
      },
      "children": [],
      "textProp": "q2text",
      "hrefProp": "q2href"
    },
    {
      "type": "text",
      "id": "z0WqT",
      "name": "q3",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 652,
        "top": 230
      },
      "children": [],
      "textProp": "q3text",
      "hrefProp": "q3href"
    },
    {
      "type": "text",
      "id": "geIFP",
      "name": "q4",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 652,
        "top": 272
      },
      "children": [],
      "textProp": "q4text",
      "hrefProp": "q4href"
    },
    {
      "type": "text",
      "id": "qoDMb",
      "name": "q5",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 652,
        "top": 314
      },
      "children": [],
      "textProp": "q5text",
      "hrefProp": "q5href"
    },
    {
      "type": "text",
      "id": "E90Hq",
      "name": "p1",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 812,
        "top": 146
      },
      "children": [],
      "textProp": "p1text",
      "hrefProp": "p1href"
    },
    {
      "type": "text",
      "id": "C7kFI",
      "name": "p2",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 812,
        "top": 188
      },
      "children": [],
      "textProp": "p2text",
      "hrefProp": "p2href"
    },
    {
      "type": "text",
      "id": "E4FAD",
      "name": "p3",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 812,
        "top": 230
      },
      "children": [],
      "textProp": "p3text",
      "hrefProp": "p3href"
    },
    {
      "type": "text",
      "id": "RfDNy",
      "name": "p4",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 812,
        "top": 272
      },
      "children": [],
      "textProp": "p4text",
      "hrefProp": "p4href"
    },
    {
      "type": "text",
      "id": "d7E43",
      "name": "p5",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 812,
        "top": 314
      },
      "children": [],
      "textProp": "p5text",
      "hrefProp": "p5href"
    },
    {
      "type": "text",
      "id": "mjRGo",
      "name": "c1",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 962,
        "top": 146
      },
      "children": [],
      "textProp": "c1text",
      "hrefProp": "c1href"
    },
    {
      "type": "text",
      "id": "50mK3",
      "name": "c2",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 962,
        "top": 184
      },
      "children": [],
      "textProp": "c2text",
      "hrefProp": "c2href"
    },
    {
      "type": "text",
      "id": "j2GsB",
      "name": "c3",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 962,
        "top": 222
      },
      "children": [],
      "textProp": "c3text",
      "hrefProp": "c3href"
    },
    {
      "type": "text",
      "id": "yZzmI",
      "name": "c4",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 962,
        "top": 260
      },
      "children": [],
      "textProp": "c4text",
      "hrefProp": "c4href"
    },
    {
      "type": "text",
      "id": "MQgyh",
      "name": "c5",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 962,
        "top": 298
      },
      "children": [],
      "textProp": "c5text",
      "hrefProp": "c5href"
    },
    {
      "type": "text",
      "id": "d17Bs",
      "name": "c6",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 962,
        "top": 336
      },
      "children": [],
      "textProp": "c6text",
      "hrefProp": "c6href"
    },
    {
      "type": "text",
      "id": "Omk3r",
      "name": "c7",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#B8C1CC",
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": "500",
        "position": "absolute",
        "left": 962,
        "top": 374
      },
      "children": [],
      "textProp": "c7text",
      "hrefProp": "c7href"
    },
    {
      "type": "frame",
      "id": "JOuTH",
      "name": "div2",
      "style": {
        "boxSizing": "border-box",
        "width": 1136,
        "height": 1,
        "background": "#232A33",
        "position": "absolute",
        "left": 32,
        "top": 850
      },
      "children": []
    },
    {
      "type": "text",
      "id": "2tDuA",
      "name": "copy",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#6E7886",
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": "500",
        "position": "absolute",
        "left": 32,
        "top": 890
      },
      "children": [],
      "textProp": "copytext",
      "hrefProp": "copyhref"
    },
    {
      "type": "text",
      "id": "RUixA",
      "name": "mailI",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#8F98A5",
        "fontFamily": "Inter",
        "fontSize": 24,
        "fontWeight": "600",
        "position": "absolute",
        "left": 1012,
        "top": 885
      },
      "children": [],
      "textProp": "mailitext",
      "hrefProp": "mailihref"
    },
    {
      "type": "text",
      "id": "vz9wR",
      "name": "inI",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#8F98A5",
        "fontFamily": "Inter",
        "fontSize": 24,
        "fontWeight": "700",
        "position": "absolute",
        "left": 1052,
        "top": 885
      },
      "children": [],
      "textProp": "initext",
      "hrefProp": "inihref"
    },
    {
      "type": "text",
      "id": "9ilgl",
      "name": "xI",
      "style": {
        "boxSizing": "border-box",
        "margin": 0,
        "whiteSpace": "pre-line",
        "color": "#8F98A5",
        "fontFamily": "Inter",
        "fontSize": 24,
        "fontWeight": "700",
        "position": "absolute",
        "left": 1088,
        "top": 885
      },
      "children": [],
      "textProp": "xitext",
      "hrefProp": "xihref"
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "QNHgo",
  "logotext": "IONQ",
  "staytext": "Stay up to date.",
  "stayhref": "/",
  "desctext": "To keep up with our latest news and announcements, please fill out the form below.",
  "deschref": "/blog",
  "mailtext": "Your email",
  "mailhref": "/contact",
  "nametext": "Your name",
  "namehref": "/",
  "orgtext": "Your organization",
  "orghref": "/",
  "agreetext": "I agree to receive periodic updates from IonQ about its hardware, services, and other programs.",
  "agreehref": "/about",
  "subbtnhref": "/",
  "subtxttext": "Subscribe",
  "rh1text": "Resources",
  "rh1href": "/",
  "qh1text": "Quantum cloud",
  "qh1href": "/",
  "ph1text": "IonQ products",
  "ph1href": "/product",
  "ch1text": "Company",
  "ch1href": "/",
  "r1text": "Our roadmap",
  "r1href": "/",
  "r2text": "Our technology",
  "r2href": "/technology",
  "r3text": "Blog",
  "r3href": "/blog",
  "r4text": "Publications",
  "r4href": "/",
  "r5text": "Newsroom",
  "r5href": "/blog",
  "r6text": "News & media",
  "r6href": "/blog",
  "r7text": "Shop",
  "r7href": "/product",
  "r8text": "Subscribe",
  "r8href": "/",
  "q1text": "Get started",
  "q1href": "/",
  "q2text": "Docs & guides",
  "q2href": "/",
  "q3text": "Partnerships",
  "q3href": "/",
  "q4text": "Research credits",
  "q4href": "/",
  "q5text": "Early access",
  "q5href": "/",
  "p1text": "IonQ Tempo",
  "p1href": "/",
  "p2text": "IonQ Forte Enterprise",
  "p2href": "/",
  "p3text": "IonQ Forte",
  "p3href": "/",
  "p4text": "IonQ Aria",
  "p4href": "/",
  "p5text": "IonQ Harmony",
  "p5href": "/",
  "c1text": "Contact",
  "c1href": "/contact",
  "c2text": "Data protection addendum",
  "c2href": "/",
  "c3text": "Privacy policy",
  "c3href": "/",
  "c4text": "Terms of service",
  "c4href": "/",
  "c5text": "Supplier code of conduct",
  "c5href": "/",
  "c6text": "Global export compliance",
  "c6href": "/",
  "c7text": "Quality",
  "c7href": "/",
  "copytext": "Copyright © 2017-2026 IonQ, Inc. All Rights Reserved.",
  "copyhref": "/",
  "mailitext": "✉",
  "mailihref": "/",
  "initext": "in",
  "inihref": "/",
  "xitext": "X",
  "xihref": "/"
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
    "bg": "#0A0C10",
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
const NAV_ACTIVE_COLOR = "var(--pen-theme-text, #8E99A7)";
const NAV_INACTIVE_COLOR = "var(--pen-theme-text-secondary, #F2F5F8)";
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

export default function TemplateExclusivePenSiteProductFooterFootpenAlt4({ id, logotext, staytext, stayhref, desctext, deschref, mailtext, mailhref, nametext, namehref, orgtext, orghref, agreetext, agreehref, subbtnhref, subtxttext, rh1text, rh1href, qh1text, qh1href, ph1text, ph1href, ch1text, ch1href, r1text, r1href, r2text, r2href, r3text, r3href, r4text, r4href, r5text, r5href, r6text, r6href, r7text, r7href, r8text, r8href, q1text, q1href, q2text, q2href, q3text, q3href, q4text, q4href, q5text, q5href, p1text, p1href, p2text, p2href, p3text, p3href, p4text, p4href, p5text, p5href, c1text, c1href, c2text, c2href, c3text, c3href, c4text, c4href, c5text, c5href, c6text, c6href, c7text, c7href, copytext, copyhref, mailitext, mailihref, initext, inihref, xitext, xihref, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, logotext, staytext, stayhref, desctext, deschref, mailtext, mailhref, nametext, namehref, orgtext, orghref, agreetext, agreehref, subbtnhref, subtxttext, rh1text, rh1href, qh1text, qh1href, ph1text, ph1href, ch1text, ch1href, r1text, r1href, r2text, r2href, r3text, r3href, r4text, r4href, r5text, r5href, r6text, r6href, r7text, r7href, r8text, r8href, q1text, q1href, q2text, q2href, q3text, q3href, q4text, q4href, q5text, q5href, p1text, p1href, p2text, p2href, p3text, p3href, p4text, p4href, p5text, p5href, c1text, c1href, c2text, c2href, c3text, c3href, c4text, c4href, c5text, c5href, c6text, c6href, c7text, c7href, copytext, copyhref, mailitext, mailihref, initext, inihref, xitext, xihref });
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