// @ts-nocheck
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
  "id": "EESxw",
  "name": "policyWrap",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 28,
    "padding": "48px 56px 64px 56px",
    "width": "100%"
  },
  "children": [
    {
      "type": "frame",
      "id": "ifd4t",
      "name": "hero",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 18,
        "padding": "36px",
        "width": "100%",
        "borderRadius": 20,
        "background": "linear-gradient(180deg, #10182D 0%, #08111F 100%)",
        "border": "1.5px solid #23324F"
      },
      "children": [
        {
          "type": "text",
          "id": "PIaVd",
          "name": "heroKicker",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#9DB0D4",
            "fontFamily": "Manrope",
            "fontSize": 11,
            "fontWeight": "600",
            "letterSpacing": 1.2
          },
          "children": [],
          "textProp": "herokickertext"
        },
        {
          "type": "text",
          "id": "8n8Gz",
          "name": "heroTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#FAFCFF",
            "fontFamily": "Space Grotesk",
            "fontSize": 40,
            "fontWeight": "700",
            "letterSpacing": -0.8
          },
          "children": [],
          "textProp": "herotitletext"
        },
        {
          "type": "text",
          "id": "jmXVJ",
          "name": "heroCopy",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#C5CEE2",
            "fontFamily": "Manrope",
            "fontSize": 15,
            "lineHeight": 1.55,
            "width": 820
          },
          "children": [],
          "textProp": "herocopytext"
        },
        {
          "type": "frame",
          "id": "d7ZPr",
          "name": "heroMeta",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 14,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "lzuSr",
              "name": "effectiveCard",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "padding": "18px",
                "width": "100%",
                "borderRadius": 14,
                "background": "#101A30",
                "border": "1px solid #23324F"
              },
              "children": [
                {
                  "type": "text",
                  "id": "kWZ7u",
                  "name": "effectiveLabel",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7F95B8",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1.2
                  },
                  "children": [],
                  "textProp": "effectivelabeltext"
                },
                {
                  "type": "text",
                  "id": "b4x9F",
                  "name": "effectiveBody",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#EDF4FF",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "effectivebodytext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "CK8g7",
              "name": "scopeCard",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "padding": "18px",
                "width": "100%",
                "borderRadius": 14,
                "background": "#101A30",
                "border": "1px solid #23324F"
              },
              "children": [
                {
                  "type": "text",
                  "id": "GblZa",
                  "name": "scopeLabel",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7F95B8",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1.2
                  },
                  "children": [],
                  "textProp": "scopelabeltext"
                },
                {
                  "type": "text",
                  "id": "ENUSm",
                  "name": "scopeBody",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#EDF4FF",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "fontWeight": "600",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "scopebodytext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "8vg8N",
              "name": "responseCard",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "padding": "18px",
                "width": "100%",
                "borderRadius": 14,
                "background": "#101A30",
                "border": "1px solid #23324F"
              },
              "children": [
                {
                  "type": "text",
                  "id": "7Kcci",
                  "name": "responseLabel",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7F95B8",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1.2
                  },
                  "children": [],
                  "textProp": "responselabeltext"
                },
                {
                  "type": "text",
                  "id": "CXvWL",
                  "name": "responseBody",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#EDF4FF",
                    "fontFamily": "Manrope",
                    "fontSize": 15,
                    "fontWeight": "600",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "responsebodytext"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "KuD9O",
      "name": "content",
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
          "id": "gowaR",
          "name": "indexRail",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 18,
            "padding": "24px",
            "width": 320,
            "borderRadius": 20,
            "background": "linear-gradient(180deg, #0D1524 0%, #08111F 100%)",
            "border": "1.5px solid #23324F"
          },
          "children": [
            {
              "type": "text",
              "id": "sLbp0",
              "name": "indexTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#9DB0D4",
                "fontFamily": "Manrope",
                "fontSize": 11,
                "fontWeight": "600",
                "letterSpacing": 1.2
              },
              "children": [],
              "textProp": "indextitletext"
            },
            {
              "type": "text",
              "id": "c4Xtd",
              "name": "indexList",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#E3EBFA",
                "fontFamily": "Manrope",
                "fontSize": 13,
                "fontWeight": "500",
                "lineHeight": 1.9,
                "width": "100%"
              },
              "children": [],
              "textProp": "indexlisttext"
            },
            {
              "type": "frame",
              "id": "5yskC",
              "name": "appliesCard",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "padding": "16px",
                "width": "100%",
                "borderRadius": 12,
                "background": "#0D1728",
                "border": "1px solid #243754"
              },
              "children": [
                {
                  "type": "text",
                  "id": "3Q98c",
                  "name": "appliesLabel",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7F95B8",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1.2
                  },
                  "children": [],
                  "textProp": "applieslabeltext"
                },
                {
                  "type": "text",
                  "id": "9DEVJ",
                  "name": "appliesBody",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#C9D7EE",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "fontWeight": "normal",
                    "lineHeight": 1.5,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "appliesbodytext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "S6wCT",
              "name": "contactCard",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "padding": "16px",
                "width": "100%",
                "borderRadius": 12,
                "background": "#0D1728",
                "border": "1px solid #243754"
              },
              "children": [
                {
                  "type": "text",
                  "id": "8Py58",
                  "name": "contactLabel",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#7F95B8",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1.2
                  },
                  "children": [],
                  "textProp": "contactlabeltext"
                },
                {
                  "type": "text",
                  "id": "Uo7yW",
                  "name": "contactBody",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#C9D7EE",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "fontWeight": "normal",
                    "lineHeight": 1.5,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "contactbodytext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "57iIB",
          "name": "main",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 20,
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "YZGRr",
              "name": "summaryRow",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 12,
                "width": "100%"
              },
              "children": [
                {
                  "type": "frame",
                  "id": "p9nbN",
                  "name": "privacyCard",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 10,
                    "padding": "20px",
                    "width": "100%",
                    "borderRadius": 16,
                    "background": "#101A30",
                    "border": "1px solid #23324F"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "tuONB",
                      "name": "privacyLabel",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#9DB0D4",
                        "fontFamily": "Manrope",
                        "fontSize": 11,
                        "fontWeight": "600",
                        "letterSpacing": 1.2
                      },
                      "children": [],
                      "textProp": "privacylabeltext"
                    },
                    {
                      "type": "text",
                      "id": "W82E3",
                      "name": "privacyBody",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#D5DEEF",
                        "fontFamily": "Manrope",
                        "fontSize": 13,
                        "lineHeight": 1.5,
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "privacybodytext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "zVCMn",
                  "name": "termsCard",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 10,
                    "padding": "20px",
                    "width": "100%",
                    "borderRadius": 16,
                    "background": "#101A30",
                    "border": "1px solid #23324F"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "PhFRN",
                      "name": "termsLabel",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#9DB0D4",
                        "fontFamily": "Manrope",
                        "fontSize": 11,
                        "fontWeight": "600",
                        "letterSpacing": 1.2
                      },
                      "children": [],
                      "textProp": "termslabeltext"
                    },
                    {
                      "type": "text",
                      "id": "rmeTg",
                      "name": "termsBody",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#D5DEEF",
                        "fontFamily": "Manrope",
                        "fontSize": 13,
                        "lineHeight": 1.5,
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "termsbodytext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "Ccbzb",
                  "name": "rightsCard",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 8,
                    "padding": "20px",
                    "width": "100%",
                    "borderRadius": 16,
                    "background": "#0A1424",
                    "border": "1.5px solid #243754"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "mkYtO",
                      "name": "rightsLabel",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#9DB0D4",
                        "fontFamily": "Manrope",
                        "fontSize": 11,
                        "fontWeight": "600",
                        "letterSpacing": 1.2
                      },
                      "children": [],
                      "textProp": "rightslabeltext"
                    },
                    {
                      "type": "text",
                      "id": "pWC7f",
                      "name": "rightsBody",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#D5DEEF",
                        "fontFamily": "Manrope",
                        "fontSize": 13,
                        "fontWeight": "normal",
                        "lineHeight": 1.5,
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "rightsbodytext"
                    }
                  ]
                }
              ]
            },
            {
              "type": "frame",
              "id": "maGoQ",
              "name": "sections",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 14,
                "width": "100%"
              },
              "children": [
                {
                  "type": "frame",
                  "id": "3M9o7",
                  "name": "section-data-collect",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 10,
                    "padding": "20px",
                    "width": "100%",
                    "borderRadius": 16,
                    "background": "#0A1424",
                    "border": "1px solid #243754"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "6KiEO",
                      "name": "sectionTitle",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#F8FBFF",
                        "fontFamily": "Space Grotesk",
                        "fontSize": 21,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "sectiontitletext"
                    },
                    {
                      "type": "text",
                      "id": "sANOY",
                      "name": "sectionBody",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#C5CEE2",
                        "fontFamily": "Manrope",
                        "fontSize": 14,
                        "fontWeight": "normal",
                        "lineHeight": 1.55,
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "sectionbodytext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "CARgf",
                  "name": "section-data-use",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 10,
                    "padding": "20px",
                    "width": "100%",
                    "borderRadius": 16,
                    "background": "#0A1424",
                    "border": "1px solid #243754"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "KXuOW",
                      "name": "sectionTitle",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#F8FBFF",
                        "fontFamily": "Space Grotesk",
                        "fontSize": 21,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "sectiontitletext2"
                    },
                    {
                      "type": "text",
                      "id": "2cjqV",
                      "name": "sectionBody",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#C5CEE2",
                        "fontFamily": "Manrope",
                        "fontSize": 14,
                        "fontWeight": "normal",
                        "lineHeight": 1.55,
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "sectionbodytext2"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "zqqQI",
                  "name": "section-sharing",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 10,
                    "padding": "20px",
                    "width": "100%",
                    "borderRadius": 16,
                    "background": "#0A1424",
                    "border": "1px solid #243754"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "oDohT",
                      "name": "sectionTitle",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#F8FBFF",
                        "fontFamily": "Space Grotesk",
                        "fontSize": 21,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "sectiontitletext3"
                    },
                    {
                      "type": "text",
                      "id": "RNtlR",
                      "name": "sectionBody",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#C5CEE2",
                        "fontFamily": "Manrope",
                        "fontSize": 14,
                        "fontWeight": "normal",
                        "lineHeight": 1.55,
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "sectionbodytext3"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "GAy0N",
                  "name": "section-security",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 10,
                    "padding": "20px",
                    "width": "100%",
                    "borderRadius": 16,
                    "background": "#0A1424",
                    "border": "1px solid #243754"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "ECq32",
                      "name": "sectionTitle",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#F8FBFF",
                        "fontFamily": "Space Grotesk",
                        "fontSize": 21,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "sectiontitletext4"
                    },
                    {
                      "type": "text",
                      "id": "7CfXK",
                      "name": "sectionBody",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#C5CEE2",
                        "fontFamily": "Manrope",
                        "fontSize": 14,
                        "fontWeight": "normal",
                        "lineHeight": 1.55,
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "sectionbodytext4"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "37WsQ",
                  "name": "section-rights",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 10,
                    "padding": "20px",
                    "width": "100%",
                    "borderRadius": 16,
                    "background": "#0A1424",
                    "border": "1px solid #243754"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "6B5EZ",
                      "name": "sectionTitle",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#F8FBFF",
                        "fontFamily": "Space Grotesk",
                        "fontSize": 21,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "sectiontitletext5"
                    },
                    {
                      "type": "text",
                      "id": "Esobu",
                      "name": "sectionBody",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#C5CEE2",
                        "fontFamily": "Manrope",
                        "fontSize": 14,
                        "fontWeight": "normal",
                        "lineHeight": 1.55,
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "sectionbodytext5"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "F2Wqg",
                  "name": "section-terms-notices",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 10,
                    "padding": "20px",
                    "width": "100%",
                    "borderRadius": 16,
                    "background": "#0A1424",
                    "border": "1px solid #243754"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "3gpXK",
                      "name": "sectionTitle",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#F8FBFF",
                        "fontFamily": "Space Grotesk",
                        "fontSize": 21,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "sectiontitletext6"
                    },
                    {
                      "type": "text",
                      "id": "aiUTp",
                      "name": "sectionBody",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#C5CEE2",
                        "fontFamily": "Manrope",
                        "fontSize": 14,
                        "fontWeight": "normal",
                        "lineHeight": 1.55,
                        "width": "100%"
                      },
                      "children": [],
                      "textProp": "sectionbodytext6"
                    }
                  ]
                }
              ]
            },
            {
              "type": "frame",
              "id": "lXx0X",
              "name": "legalNotice",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 8,
                "padding": "18px 20px",
                "width": "100%",
                "borderRadius": 16,
                "background": "linear-gradient(180deg, #13203A 0%, #0A1224 100%)",
                "border": "1px solid #2A3C61"
              },
              "children": [
                {
                  "type": "text",
                  "id": "uw8o1",
                  "name": "legalNoticeTitle",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9DB0D4",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1.2
                  },
                  "children": [],
                  "textProp": "legalnoticetitletext"
                },
                {
                  "type": "text",
                  "id": "Bz6Aq",
                  "name": "legalNoticeBody",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#D5DEEF",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "lineHeight": 1.5,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "legalnoticebodytext"
                },
                {
                  "type": "text",
                  "id": "djskj",
                  "name": "noticeMeta",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#93A8CA",
                    "fontFamily": "Manrope",
                    "fontSize": 12,
                    "fontWeight": "normal",
                    "lineHeight": 1.45,
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "noticemetatext"
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
  "id": "EESxw",
  "herokickertext": "POLICY CENTER",
  "herotitletext": "Policies, terms, and data stewardship",
  "herocopytext": "This page explains how Unistellar handles personal information, governs purchases and platform use, and updates customers when legal or operational terms change across hardware, apps, and connected services.",
  "effectivelabeltext": "EFFECTIVE",
  "effectivebodytext": "February 27, 2026",
  "scopelabeltext": "COVERAGE",
  "scopebodytext": "Web, app, commerce, and telescope services",
  "responselabeltext": "REQUESTS",
  "responsebodytext": "Legal and privacy inquiries reviewed within 30 days",
  "indextitletext": "ON THIS PAGE",
  "indexlisttext": "01  Overview & Scope\n02  Privacy Commitments\n03  Data We Collect\n04  How We Use Data\n05  Sharing & Processors\n06  Retention, Security & Transfers\n07  Your Rights & Choices\n08  Terms, Notices & Updates",
  "applieslabeltext": "APPLIES TO",
  "appliesbodytext": "Customers, community users, prospects, and visitors interacting with Unistellar websites, applications, support channels, and device-connected experiences.",
  "contactlabeltext": "NEED HELP?",
  "contactbodytext": "Email legal@unistellar.com for formal notices, privacy requests, or accessibility concerns related to this policy center.",
  "privacylabeltext": "PRIVACY STANDARD",
  "privacybodytext": "We collect only the information required to support accounts, commerce, connected devices, and service reliability, and we do not sell personal information.",
  "termslabeltext": "TERMS STANDARD",
  "termsbodytext": "Use of Unistellar products and services is governed by clear rules for acceptable use, billing, fulfillment, warranty limits, and dispute handling.",
  "rightslabeltext": "USER RIGHTS",
  "rightsbodytext": "Qualified users can request access, correction, deletion, portability, or processing restrictions in line with applicable law.",
  "sectiontitletext": "03. Data We Collect",
  "sectionbodytext": "We collect the information needed to create accounts, process telescope orders, deliver software updates, and support observational sessions. This can include identifiers such as name and email address, payment and shipping details, device identifiers, diagnostic logs, telescope telemetry, support correspondence, and engagement history across web and mobile experiences.\n\nWe intentionally limit collection to information that helps us operate the service, meet legal obligations, investigate misuse, and improve reliability for connected hardware and companion applications.",
  "sectiontitletext2": "04. How We Use Data",
  "sectionbodytext2": "Collected information is used to authenticate users, fulfill purchases, ship hardware, activate warranties, provide customer support, maintain service performance, and send operational messages tied to an account or transaction. Usage data also helps us understand reliability trends, improve firmware quality, and refine scientific discovery features.\n\nWhere consent is required for optional marketing, analytics, or personalized experiences, we rely on that consent and provide controls for withdrawal or preference changes.",
  "sectiontitletext3": "05. Sharing and Processors",
  "sectionbodytext3": "We share data with carefully selected service providers that help us run payments, cloud hosting, logistics, customer support, diagnostics, and communications. These providers are contractually restricted to using information only for the services they perform on our behalf and must apply appropriate confidentiality and security measures.\n\nWe may also disclose information when required by law, to respond to valid legal requests, to enforce our agreements, or to protect the rights, safety, and integrity of our customers, employees, and platform.",
  "sectiontitletext4": "06. Retention, Security, and Transfers",
  "sectionbodytext4": "Personal information is retained only for as long as needed to provide services, support purchases, maintain records, resolve disputes, satisfy legal obligations, and defend claims. We apply administrative, technical, and organizational safeguards designed to protect account data, transactional records, and connected-device information from unauthorized access, loss, misuse, or disclosure.\n\nWhen information moves across borders, we use recognized transfer mechanisms such as standard contractual clauses or equivalent safeguards to preserve privacy rights and enforceable protections.",
  "sectiontitletext5": "07. Your Rights and Choices",
  "sectionbodytext5": "Depending on your jurisdiction, you may have the right to request access to personal data, correct inaccurate information, delete eligible records, object to certain processing, request portability, or limit how your information is used. Account owners can also manage some preferences directly through product settings, browser controls, and unsubscribe links where available.\n\nWe review verified requests in line with applicable law and may ask for additional information when necessary to protect account security or clarify the scope of a request.",
  "sectiontitletext6": "08. Terms, Notices, and Policy Updates",
  "sectionbodytext6": "Your use of Unistellar websites, software, connected services, and hardware purchases is also governed by the commercial and contractual terms that apply at checkout, during account creation, and within product experiences. Those terms cover account responsibilities, acceptable use, billing, fulfillment, warranty limitations, dispute procedures, and service availability.\n\nWe may revise this policy center from time to time to reflect legal, operational, or product changes. Material updates are posted here with a new effective date, and continued use after an update may constitute acceptance where permitted by law.",
  "legalnoticetitletext": "CONTACT, NOTICE, AND VERSIONING",
  "legalnoticebodytext": "Privacy requests, legal notices, and accessibility-related inquiries can be sent to legal@unistellar.com. We retain prior versions of this policy center for transparency, auditability, and reference when material updates are issued.",
  "noticemetatext": "Archived versions are maintained when required for compliance, customer communication, or dispute resolution."
};
const LAYOUT_CONTEXT = {
  "pagePaddingLeft": 0,
  "pagePaddingRight": 0,
  "pagePaddingTop": 0,
  "pagePaddingBottom": 0,
  "sectionGapAfter": 0
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

const renderNode = (node, merged, sectionMotion, sectionKindToken, key = "root", ancestorHasLink = false) => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged, sectionMotion, sectionKindToken, key);
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
            ancestorHasLink || shouldRenderLink
          )
        )
      : [])
  );
};

export default function TemplateExclusiveUnistellarHomePolicyStoryPolicywrappenAlt1({ id, herokickertext, herotitletext, herocopytext, effectivelabeltext, effectivebodytext, scopelabeltext, scopebodytext, responselabeltext, responsebodytext, indextitletext, indexlisttext, applieslabeltext, appliesbodytext, contactlabeltext, contactbodytext, privacylabeltext, privacybodytext, termslabeltext, termsbodytext, rightslabeltext, rightsbodytext, sectiontitletext, sectionbodytext, sectiontitletext2, sectionbodytext2, sectiontitletext3, sectionbodytext3, sectiontitletext4, sectionbodytext4, sectiontitletext5, sectionbodytext5, sectiontitletext6, sectionbodytext6, legalnoticetitletext, legalnoticebodytext, noticemetatext, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, herokickertext, herotitletext, herocopytext, effectivelabeltext, effectivebodytext, scopelabeltext, scopebodytext, responselabeltext, responsebodytext, indextitletext, indexlisttext, applieslabeltext, appliesbodytext, contactlabeltext, contactbodytext, privacylabeltext, privacybodytext, termslabeltext, termsbodytext, rightslabeltext, rightsbodytext, sectiontitletext, sectionbodytext, sectiontitletext2, sectionbodytext2, sectiontitletext3, sectionbodytext3, sectiontitletext4, sectionbodytext4, sectiontitletext5, sectionbodytext5, sectiontitletext6, sectionbodytext6, legalnoticetitletext, legalnoticebodytext, noticemetatext });
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
  const layoutStyle: React.CSSProperties = {
    boxSizing: "border-box",
  };
  const pagePaddingLeft = Number(LAYOUT_CONTEXT?.pagePaddingLeft || 0);
  const pagePaddingRight = Number(LAYOUT_CONTEXT?.pagePaddingRight || 0);
  const pagePaddingTop = Number(LAYOUT_CONTEXT?.pagePaddingTop || 0);
  const pagePaddingBottom = Number(LAYOUT_CONTEXT?.pagePaddingBottom || 0);
  const sectionGapAfter = Number(LAYOUT_CONTEXT?.sectionGapAfter || 0);
  if (Number.isFinite(pagePaddingLeft) && pagePaddingLeft > 0) layoutStyle.paddingLeft = pagePaddingLeft;
  if (Number.isFinite(pagePaddingRight) && pagePaddingRight > 0) layoutStyle.paddingRight = pagePaddingRight;
  if (Number.isFinite(pagePaddingTop) && pagePaddingTop > 0) layoutStyle.paddingTop = pagePaddingTop;
  if (Number.isFinite(pagePaddingBottom) && pagePaddingBottom > 0) layoutStyle.paddingBottom = pagePaddingBottom;
  if (Number.isFinite(sectionGapAfter) && sectionGapAfter > 0) layoutStyle.marginBottom = sectionGapAfter;
  const mergedSectionStyle = sectionStyle ? { ...layoutStyle, ...sectionStyle } : layoutStyle;
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": SECTION_KIND,
      className: sectionClassName,
      style: mergedSectionStyle,
    },
    ...(sectionMotion?.level !== "off"
      ? [React.createElement("style", { key: "pen-motion-style" }, PEN_RUNTIME_MOTION_STYLE)]
      : []),
    renderNode(SECTION_TREE, merged, sectionMotion, sectionKindToken, "root", false)
  );
}