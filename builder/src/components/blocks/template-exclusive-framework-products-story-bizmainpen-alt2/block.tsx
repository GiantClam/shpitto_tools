// @ts-nocheck
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
  "id": "eu2qW",
  "name": "BizMain",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 34,
    "padding": "34px 110px 54px 110px",
    "width": "100%"
  },
  "children": [
    {
      "type": "frame",
      "id": "bHCwQ",
      "name": "Customize",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 14,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "jbqs0",
          "name": "cTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2737",
            "fontFamily": "Inter",
            "fontSize": 42,
            "fontWeight": "700",
            "lineHeight": 1.02,
            "width": 560
          },
          "children": [],
          "textProp": "ctitletext"
        },
        {
          "type": "text",
          "id": "bAJCV",
          "name": "cSub",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5C636A",
            "fontFamily": "Inter",
            "fontSize": 14,
            "fontWeight": "normal",
            "lineHeight": 1.45,
            "width": 760
          },
          "children": [],
          "textProp": "csubtext"
        },
        {
          "type": "frame",
          "id": "6nHIG",
          "name": "cGrid",
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
              "id": "1QIYk",
              "name": "cRow1",
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
                  "id": "MH8GM",
                  "name": "c1",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 8,
                    "width": 603
                  },
                  "children": [
                    {
                      "type": "frame",
                      "id": "L5dj2",
                      "name": "c1img",
                      "style": {
                        "boxSizing": "border-box",
                        "width": "100%",
                        "height": 210,
                        "borderRadius": 2,
                        "backgroundRepeat": "no-repeat",
                        "backgroundPosition": "center",
                        "backgroundSize": "cover"
                      },
                      "children": [],
                      "imageProp": "c1imgimagesrc"
                    },
                    {
                      "type": "text",
                      "id": "kPd1r",
                      "name": "c1txt",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#2B3138",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "c1txttext"
                    },
                    {
                      "type": "text",
                      "id": "aCJQh",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#5B6066",
                        "fontFamily": "Inter",
                        "fontSize": 10,
                        "fontWeight": "normal",
                        "lineHeight": 1.35,
                        "width": 298
                      },
                      "children": [],
                      "textProp": "acjqhtext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "VCEle",
                  "name": "c2",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 8,
                    "width": 603
                  },
                  "children": [
                    {
                      "type": "frame",
                      "id": "OrUci",
                      "name": "c2img",
                      "style": {
                        "boxSizing": "border-box",
                        "width": "100%",
                        "height": 210,
                        "borderRadius": 2,
                        "backgroundRepeat": "no-repeat",
                        "backgroundPosition": "center",
                        "backgroundSize": "cover"
                      },
                      "children": [],
                      "imageProp": "c2imgimagesrc"
                    },
                    {
                      "type": "text",
                      "id": "xyl7Q",
                      "name": "c2txt",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#2B3138",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "c2txttext"
                    },
                    {
                      "type": "text",
                      "id": "Ng7Y8",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#5B6066",
                        "fontFamily": "Inter",
                        "fontSize": 10,
                        "fontWeight": "normal",
                        "lineHeight": 1.35,
                        "width": 298
                      },
                      "children": [],
                      "textProp": "ng7y8text"
                    }
                  ]
                }
              ]
            },
            {
              "type": "frame",
              "id": "Y7O7l",
              "name": "cRow2",
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
                  "id": "YgsCW",
                  "name": "c3",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 8,
                    "width": 603
                  },
                  "children": [
                    {
                      "type": "frame",
                      "id": "JlaGN",
                      "name": "c3img",
                      "style": {
                        "boxSizing": "border-box",
                        "width": "100%",
                        "height": 210,
                        "borderRadius": 2,
                        "backgroundRepeat": "no-repeat",
                        "backgroundPosition": "center",
                        "backgroundSize": "cover"
                      },
                      "children": [],
                      "imageProp": "c3imgimagesrc"
                    },
                    {
                      "type": "text",
                      "id": "8uOYw",
                      "name": "c3txt",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#2B3138",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "c3txttext"
                    },
                    {
                      "type": "text",
                      "id": "mYVVr",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#5B6066",
                        "fontFamily": "Inter",
                        "fontSize": 10,
                        "fontWeight": "normal",
                        "lineHeight": 1.35,
                        "width": 298
                      },
                      "children": [],
                      "textProp": "myvvrtext"
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "Xp18f",
                  "name": "c4",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 8,
                    "width": 603
                  },
                  "children": [
                    {
                      "type": "frame",
                      "id": "86GiI",
                      "name": "c4img",
                      "style": {
                        "boxSizing": "border-box",
                        "width": "100%",
                        "height": 210,
                        "borderRadius": 2,
                        "backgroundRepeat": "no-repeat",
                        "backgroundPosition": "center",
                        "backgroundSize": "cover"
                      },
                      "children": [],
                      "imageProp": "c4imgimagesrc"
                    },
                    {
                      "type": "text",
                      "id": "Jt4MA",
                      "name": "c4txt",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#2B3138",
                        "fontFamily": "Inter",
                        "fontSize": 12,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "c4txttext"
                    },
                    {
                      "type": "text",
                      "id": "MCt7J",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#5B6066",
                        "fontFamily": "Inter",
                        "fontSize": 10,
                        "fontWeight": "normal",
                        "lineHeight": 1.35,
                        "width": 298
                      },
                      "children": [],
                      "textProp": "mct7jtext"
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
      "id": "qmDEn",
      "name": "Testimonials",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 14,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "wwaTf",
          "name": "tTitle",
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
          "textProp": "ttitletext"
        },
        {
          "type": "frame",
          "id": "6rI2t",
          "name": "tRow",
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
              "id": "e4atk",
              "name": "t1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "width": 398,
                "borderRadius": 2,
                "background": "#F3F3EF"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Mj0P5",
                  "name": "t1q",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#3F464E",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "normal",
                    "lineHeight": 1.45,
                    "width": 388
                  },
                  "children": [],
                  "textProp": "t1qtext"
                },
                {
                  "type": "text",
                  "id": "5whty",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5E646B",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal",
                    "lineHeight": 1.45,
                    "width": 388
                  },
                  "children": [],
                  "textProp": "whtytext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "PXeWN",
              "name": "t2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "width": 398,
                "borderRadius": 2,
                "background": "#F3F3EF"
              },
              "children": [
                {
                  "type": "text",
                  "id": "gH5se",
                  "name": "t2q",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#3F464E",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "normal",
                    "lineHeight": 1.45,
                    "width": 388
                  },
                  "children": [],
                  "textProp": "t2qtext"
                },
                {
                  "type": "text",
                  "id": "b0iKe",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5E646B",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal",
                    "lineHeight": 1.45,
                    "width": 388
                  },
                  "children": [],
                  "textProp": "b0iketext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "kITM2",
              "name": "t3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "width": 398,
                "borderRadius": 2,
                "background": "#F3F3EF"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Js9jU",
                  "name": "t3q",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#3F464E",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "normal",
                    "lineHeight": 1.45,
                    "width": 388
                  },
                  "children": [],
                  "textProp": "t3qtext"
                },
                {
                  "type": "text",
                  "id": "DOVaX",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5E646B",
                    "fontFamily": "Inter",
                    "fontSize": 10,
                    "fontWeight": "normal",
                    "lineHeight": 1.45,
                    "width": 388
                  },
                  "children": [],
                  "textProp": "dovaxtext"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "vKk3t",
      "name": "Press",
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
          "id": "JbWHU",
          "name": "pTitle",
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
          "textProp": "ptitletext"
        },
        {
          "type": "frame",
          "id": "gqZsd",
          "name": "pRow",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 26,
            "justifyContent": "space-between",
            "width": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "PLXFf",
              "name": "colA",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "alignItems": "center",
                "width": 390
              },
              "children": [
                {
                  "type": "ellipse",
                  "id": "ekBAD",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box"
                  },
                  "children": []
                },
                {
                  "type": "text",
                  "id": "WT1Iu",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#3B82F6",
                    "fontFamily": "Inter",
                    "fontSize": 18,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "wt1iutext"
                },
                {
                  "type": "text",
                  "id": "sNZ8J",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5E646B",
                    "fontFamily": "Inter",
                    "fontSize": 9,
                    "fontWeight": "normal",
                    "lineHeight": 1.35,
                    "textAlign": "center",
                    "width": 260
                  },
                  "children": [],
                  "textProp": "snz8jtext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "xvSVE",
              "name": "colB",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "alignItems": "center",
                "width": 390
              },
              "children": [
                {
                  "type": "frame",
                  "id": "a49Ec",
                  "name": "badgeB",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 40,
                    "height": 40,
                    "borderRadius": 20,
                    "background": "#5B3FFF"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "De4Zx",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#FFFFFF",
                        "fontFamily": "Inter",
                        "fontSize": 9,
                        "fontWeight": "700"
                      },
                      "children": [],
                      "textProp": "de4zxtext"
                    }
                  ]
                },
                {
                  "type": "text",
                  "id": "IyPTL",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5E646B",
                    "fontFamily": "Inter",
                    "fontSize": 9,
                    "fontWeight": "normal",
                    "lineHeight": 1.35,
                    "textAlign": "center",
                    "width": 260
                  },
                  "children": [],
                  "textProp": "iyptltext"
                }
              ]
            },
            {
              "type": "frame",
              "id": "sDb6Y",
              "name": "colC",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "alignItems": "center",
                "width": 390
              },
              "children": [
                {
                  "type": "frame",
                  "id": "GvN8X",
                  "name": "badgeC",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 78,
                    "height": 36,
                    "background": "#0F1113"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "VsSix",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#FFFFFF",
                        "fontFamily": "Inter",
                        "fontSize": 14,
                        "fontWeight": "700"
                      },
                      "children": [],
                      "textProp": "vssixtext"
                    }
                  ]
                },
                {
                  "type": "text",
                  "id": "Pfa7H",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#5E646B",
                    "fontFamily": "Inter",
                    "fontSize": 9,
                    "fontWeight": "normal",
                    "lineHeight": 1.35,
                    "textAlign": "center",
                    "width": 260
                  },
                  "children": [],
                  "textProp": "pfa7htext"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "dPzOY",
      "name": "ValueProps",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 14,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "Gfp6P",
          "name": "vpTitle",
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
          "textProp": "vptitletext"
        },
        {
          "type": "frame",
          "id": "hoHHs",
          "name": "vpRow",
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
              "id": "GgfaX",
              "name": "vp1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "padding": "14px 14px 12px 14px",
                "width": 603,
                "height": 188,
                "background": "#F0D693"
              },
              "children": [
                {
                  "type": "text",
                  "id": "apGg8",
                  "name": "vp1t",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2C3137",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "vp1ttext"
                },
                {
                  "type": "text",
                  "id": "88y1e",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4E545A",
                    "fontFamily": "Inter",
                    "fontSize": 9,
                    "fontWeight": "normal",
                    "lineHeight": 1.3,
                    "width": 560
                  },
                  "children": [],
                  "textProp": "y1etext"
                },
                {
                  "type": "frame",
                  "id": "56iZR",
                  "name": "btn1",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 124,
                    "height": 24,
                    "borderRadius": 12,
                    "border": "1px solid #74787D"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "kBW1V",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#3B4046",
                        "fontFamily": "Inter",
                        "fontSize": 8,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "kbw1vtext"
                    }
                  ],
                  "hrefProp": "btn1href"
                }
              ]
            },
            {
              "type": "frame",
              "id": "3gqkd",
              "name": "vp2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 6,
                "padding": "14px 14px 12px 14px",
                "width": 603,
                "height": 188,
                "background": "#EED7A1"
              },
              "children": [
                {
                  "type": "text",
                  "id": "RgRsX",
                  "name": "vp2t",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#2C3137",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "vp2ttext"
                },
                {
                  "type": "text",
                  "id": "WvjtV",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4E545A",
                    "fontFamily": "Inter",
                    "fontSize": 9,
                    "fontWeight": "normal",
                    "lineHeight": 1.3,
                    "width": 560
                  },
                  "children": [],
                  "textProp": "wvjtvtext"
                },
                {
                  "type": "frame",
                  "id": "6WWWN",
                  "name": "btn2",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 124,
                    "height": 24,
                    "borderRadius": 12,
                    "border": "1px solid #74787D"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "FzhCa",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#3B4046",
                        "fontFamily": "Inter",
                        "fontSize": 8,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "fzhcatext"
                    }
                  ],
                  "hrefProp": "btn2href"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "b7w8p",
      "name": "Stories",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 18,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "tscnH",
          "name": "story1",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": 609
          },
          "children": [
            {
              "type": "frame",
              "id": "PVaxD",
              "name": "story1img",
              "style": {
                "boxSizing": "border-box",
                "width": 609,
                "height": 190,
                "borderRadius": 2,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "story1imgimagesrc"
            },
            {
              "type": "text",
              "id": "faDVK",
              "name": "story1t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#343A40",
                "fontFamily": "Inter",
                "fontSize": 14,
                "fontWeight": "600",
                "lineHeight": 1.4,
                "width": 580
              },
              "children": [],
              "textProp": "story1ttext"
            }
          ]
        },
        {
          "type": "frame",
          "id": "XfXpu",
          "name": "story2",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": 609
          },
          "children": [
            {
              "type": "frame",
              "id": "lYCq6",
              "name": "story2img",
              "style": {
                "boxSizing": "border-box",
                "width": 609,
                "height": 190,
                "borderRadius": 2,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "story2imgimagesrc"
            },
            {
              "type": "text",
              "id": "ExZ7s",
              "name": "story2t",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#343A40",
                "fontFamily": "Inter",
                "fontSize": 14,
                "fontWeight": "600",
                "lineHeight": 1.4,
                "width": 580
              },
              "children": [],
              "textProp": "story2ttext"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "LCg4e",
      "name": "ConnectTeam",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 14,
        "alignItems": "center",
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "729BT",
          "name": "conTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2737",
            "fontFamily": "Inter",
            "fontSize": 42,
            "fontWeight": "700"
          },
          "children": [],
          "textProp": "contitletext"
        },
        {
          "type": "frame",
          "id": "0DjQV",
          "name": "formStack",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 8,
            "width": 640
          },
          "children": [
            {
              "type": "text",
              "id": "QRa76",
              "name": "intro",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#6A7076",
                "fontFamily": "Inter",
                "fontSize": 10,
                "fontWeight": "normal",
                "lineHeight": 1.4,
                "width": 640
              },
              "children": [],
              "textProp": "introtext"
            },
            {
              "type": "frame",
              "id": "UYppe",
              "name": "nameRow",
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
                  "id": "sgcsh",
                  "name": "first",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 4,
                    "width": "100%"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "FylWY",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#4A4F55",
                        "fontFamily": "Inter",
                        "fontSize": 9,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "fylwytext"
                    },
                    {
                      "type": "frame",
                      "id": "jJmA9",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "width": "100%",
                        "height": 22,
                        "borderRadius": 11,
                        "background": "#E9ECEF"
                      },
                      "children": []
                    }
                  ]
                },
                {
                  "type": "frame",
                  "id": "LTwww",
                  "name": "last",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": 4,
                    "width": "100%"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "VaZPr",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#4A4F55",
                        "fontFamily": "Inter",
                        "fontSize": 9,
                        "fontWeight": "600"
                      },
                      "children": [],
                      "textProp": "vazprtext"
                    },
                    {
                      "type": "frame",
                      "id": "y1AMG",
                      "name": "",
                      "style": {
                        "boxSizing": "border-box",
                        "width": "100%",
                        "height": 22,
                        "borderRadius": 11,
                        "background": "#E9ECEF"
                      },
                      "children": []
                    }
                  ]
                }
              ]
            },
            {
              "type": "frame",
              "id": "r2h48",
              "name": "company",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 4,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "ZbkNT",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4A4F55",
                    "fontFamily": "Inter",
                    "fontSize": 9,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "zbknttext"
                },
                {
                  "type": "frame",
                  "id": "3Bsg2",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 22,
                    "borderRadius": 11,
                    "background": "#E9ECEF"
                  },
                  "children": []
                }
              ]
            },
            {
              "type": "frame",
              "id": "9WAkV",
              "name": "email",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 4,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "w2r4V",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4A4F55",
                    "fontFamily": "Inter",
                    "fontSize": 9,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "w2r4vtext"
                },
                {
                  "type": "frame",
                  "id": "R1a4y",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 22,
                    "borderRadius": 11,
                    "background": "#E9ECEF"
                  },
                  "children": []
                }
              ]
            },
            {
              "type": "frame",
              "id": "i4wJI",
              "name": "country",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 4,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "HsfwO",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4A4F55",
                    "fontFamily": "Inter",
                    "fontSize": 9,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "hsfwotext"
                },
                {
                  "type": "frame",
                  "id": "7FSCK",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 22,
                    "borderRadius": 11,
                    "background": "#E9ECEF"
                  },
                  "children": []
                }
              ]
            },
            {
              "type": "frame",
              "id": "lFnHB",
              "name": "role",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 4,
                "width": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "DimYj",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#4A4F55",
                    "fontFamily": "Inter",
                    "fontSize": 9,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "dimyjtext"
                },
                {
                  "type": "frame",
                  "id": "yCAjr",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "width": "100%",
                    "height": 22,
                    "borderRadius": 11,
                    "background": "#E9ECEF"
                  },
                  "children": []
                }
              ]
            },
            {
              "type": "text",
              "id": "ftcqt",
              "name": "check1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#4A4F55",
                "fontFamily": "Inter",
                "fontSize": 9,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "check1text"
            },
            {
              "type": "text",
              "id": "210X1",
              "name": "checks",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5E646B",
                "fontFamily": "Inter",
                "fontSize": 9,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": 640
              },
              "children": [],
              "textProp": "checkstext"
            },
            {
              "type": "text",
              "id": "Ju31d",
              "name": "industry",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#4A4F55",
                "fontFamily": "Inter",
                "fontSize": 9,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "industrytext"
            },
            {
              "type": "frame",
              "id": "DrbPt",
              "name": "industryBox",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 22,
                "borderRadius": 11,
                "background": "#E9ECEF"
              },
              "children": []
            },
            {
              "type": "text",
              "id": "opSxa",
              "name": "notes",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#4A4F55",
                "fontFamily": "Inter",
                "fontSize": 9,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "notestext"
            },
            {
              "type": "frame",
              "id": "sXfaU",
              "name": "notesBox",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 42,
                "borderRadius": 11,
                "background": "#E9ECEF"
              },
              "children": []
            },
            {
              "type": "text",
              "id": "pWT4V",
              "name": "policy",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#7A8086",
                "fontFamily": "Inter",
                "fontSize": 8,
                "fontWeight": "normal",
                "lineHeight": 1.4,
                "width": 640
              },
              "children": [],
              "textProp": "policytext"
            },
            {
              "type": "frame",
              "id": "xYubt",
              "name": "submit",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 64,
                "height": 22,
                "borderRadius": 11,
                "background": "#F26B2D"
              },
              "children": [
                {
                  "type": "text",
                  "id": "8c7r9",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#14171A",
                    "fontFamily": "Inter",
                    "fontSize": 8,
                    "fontWeight": "700"
                  },
                  "children": [],
                  "textProp": "c7r9text"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "6wEsO",
      "name": "ContactSupport",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 22,
        "alignItems": "center",
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "OjHfh",
          "name": "contactLeft",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 12,
            "justifyContent": "center",
            "padding": "26px 24px",
            "width": 500,
            "height": 250,
            "background": "#F6F6F3"
          },
          "children": [
            {
              "type": "text",
              "id": "qxY69",
              "name": "contactTitle",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#1F2737",
                "fontFamily": "Inter",
                "fontSize": 34,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "contacttitletext"
            },
            {
              "type": "text",
              "id": "3q9dJ",
              "name": "contactSub",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#5C636A",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": 430
              },
              "children": [],
              "textProp": "contactsubtext"
            },
            {
              "type": "frame",
              "id": "C80Ug",
              "name": "contactBtn",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "alignItems": "center",
                "width": 110,
                "height": 24,
                "borderRadius": 12,
                "background": "#16181D"
              },
              "children": [
                {
                  "type": "text",
                  "id": "nTHRu",
                  "name": "",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Inter",
                    "fontSize": 8,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "nthrutext"
                }
              ],
              "hrefProp": "contactbtnhref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "IiEs5",
          "name": "contactImg",
          "style": {
            "boxSizing": "border-box",
            "width": 700,
            "height": 250,
            "borderRadius": 2,
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover"
          },
          "children": [],
          "imageProp": "contactimgimagesrc"
        }
      ]
    },
    {
      "type": "frame",
      "id": "iRpxD",
      "name": "FAQ",
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
          "id": "jsTao",
          "name": "faqTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2737",
            "fontFamily": "Inter",
            "fontSize": 44,
            "fontWeight": "700",
            "lineHeight": 1.02,
            "width": 500
          },
          "children": [],
          "textProp": "faqtitletext"
        },
        {
          "type": "frame",
          "id": "nnG1q",
          "name": "faqWrapNew",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 14,
            "width": "100%"
          },
          "children": [
            {
              "type": "text",
              "id": "oyvDB",
              "name": "sec1",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2E3339",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "sec1text"
            },
            {
              "type": "frame",
              "id": "JXHwk",
              "name": "row1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "space-between",
                "alignItems": "center",
                "width": "100%",
                "height": 34,
                "borderBottom": "1px solid #D7DBDE"
              },
              "children": [
                {
                  "type": "text",
                  "id": "zTIcq",
                  "name": "q1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal",
                    "width": 1120
                  },
                  "children": [],
                  "textProp": "q1text"
                },
                {
                  "type": "text",
                  "id": "hI8kJ",
                  "name": "p1",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "p1text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "zIeUO",
              "name": "row2",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "space-between",
                "alignItems": "center",
                "width": "100%",
                "height": 34,
                "borderBottom": "1px solid #D7DBDE"
              },
              "children": [
                {
                  "type": "text",
                  "id": "vp5XA",
                  "name": "q2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal",
                    "width": 1120
                  },
                  "children": [],
                  "textProp": "q2text"
                },
                {
                  "type": "text",
                  "id": "BblE8",
                  "name": "p2",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "p2text"
                }
              ]
            },
            {
              "type": "text",
              "id": "Qn4vu",
              "name": "sec2",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2E3339",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "sec2text"
            },
            {
              "type": "frame",
              "id": "oQZC1",
              "name": "row3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "space-between",
                "alignItems": "center",
                "width": "100%",
                "height": 34,
                "borderBottom": "1px solid #D7DBDE"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Tipwu",
                  "name": "q3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal",
                    "width": 1120
                  },
                  "children": [],
                  "textProp": "q3text"
                },
                {
                  "type": "text",
                  "id": "Y1xv2",
                  "name": "p3",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "p3text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "qcsyJ",
              "name": "row4",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "space-between",
                "alignItems": "center",
                "width": "100%",
                "height": 34,
                "borderBottom": "1px solid #D7DBDE"
              },
              "children": [
                {
                  "type": "text",
                  "id": "m8oOP",
                  "name": "q4",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal",
                    "width": 1120
                  },
                  "children": [],
                  "textProp": "q4text"
                },
                {
                  "type": "text",
                  "id": "1VXgY",
                  "name": "p4",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "p4text"
                }
              ]
            },
            {
              "type": "text",
              "id": "7jOd9",
              "name": "sec3",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#2E3339",
                "fontFamily": "Inter",
                "fontSize": 12,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "sec3text"
            },
            {
              "type": "frame",
              "id": "or8pq",
              "name": "row5",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "space-between",
                "alignItems": "center",
                "width": "100%",
                "height": 34,
                "borderBottom": "1px solid #D7DBDE"
              },
              "children": [
                {
                  "type": "text",
                  "id": "kMNQ2",
                  "name": "q5",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal",
                    "width": 1120
                  },
                  "children": [],
                  "textProp": "q5text"
                },
                {
                  "type": "text",
                  "id": "URJtt",
                  "name": "p5",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "p5text"
                }
              ]
            },
            {
              "type": "frame",
              "id": "SJnQJ",
              "name": "row6",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "space-between",
                "alignItems": "center",
                "width": "100%",
                "height": 34,
                "borderBottom": "1px solid #D7DBDE"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Qaqhf",
                  "name": "q6",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 11,
                    "fontWeight": "normal",
                    "width": 1120
                  },
                  "children": [],
                  "textProp": "q6text"
                },
                {
                  "type": "text",
                  "id": "KbiSI",
                  "name": "p6",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#52585F",
                    "fontFamily": "Inter",
                    "fontSize": 12,
                    "fontWeight": "600"
                  },
                  "children": [],
                  "textProp": "p6text"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "qDW76",
      "name": "Legal",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 8,
        "width": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "pd9tY",
          "name": "legalTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#1F2737",
            "fontFamily": "Inter",
            "fontSize": 22,
            "fontWeight": "700"
          },
          "children": [],
          "textProp": "legaltitletext"
        },
        {
          "type": "text",
          "id": "I4vKX",
          "name": "legalBody",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#5E646B",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "normal",
            "lineHeight": 1.6,
            "width": "100%"
          },
          "children": [],
          "textProp": "legalbodytext"
        },
        {
          "type": "frame",
          "id": "cFvbs",
          "name": "legalSep",
          "style": {
            "boxSizing": "border-box",
            "width": "100%",
            "height": 1,
            "background": "#D7DBDE"
          },
          "children": []
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "eu2qW",
  "ctitletext": "Customize, upgrade,\nrepair: The choice is yours",
  "csubtext": "Standardize devices that can be upgraded and repaired in-house. Reduce e-waste and total cost of ownership.",
  "c1imgimagesrc": "https://images.unsplash.com/photo-1586952518485-11b180e92764?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMwNzg2MzF8&ixlib=rb-4.1.0&q=80&w=1080",
  "c1txttext": "Framework Laptop 13",
  "acjqhtext": "Configure your laptop the way you work. Upgrade and repair when your needs evolve over time.",
  "c2imgimagesrc": "https://images.unsplash.com/photo-1559163454-e7d1e00a4e54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMwNzg2NDJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "c2txttext": "Framework Laptop 16",
  "ng7y8text": "Scale up performance with modular options. Keep devices in service with easy parts replacement.",
  "c3imgimagesrc": "https://images.unsplash.com/photo-1666430163005-3cd92302a865?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMwNzg2MzR8&ixlib=rb-4.1.0&q=80&w=1080",
  "c3txttext": "Framework Desktop",
  "myvvrtext": "Compact desktop power with maintainable internals. Built for long-term fleet reliability.",
  "c4imgimagesrc": "https://images.unsplash.com/photo-1618410325698-018bb3eb2318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMwNzg2MzN8&ixlib=rb-4.1.0&q=80&w=1080",
  "c4txttext": "Expansion modules",
  "mct7jtext": "Choose ports and modules for each role. Swap and customize without replacing the whole device.",
  "ttitletext": "Testimonials",
  "t1qtext": "\"The laptops were exactly what we needed for developers and design teams.\"",
  "whtytext": "Arielle M.\nData Platform Lead",
  "t2qtext": "\"Framework systems simplified IT support and helped reduce e-waste over time.\"",
  "b0iketext": "Marco S.\nDirector, IT Operations",
  "t3qtext": "\"The modular approach gives us confidence that these systems can adapt with our teams.\"",
  "dovaxtext": "Nina C.\nSystems Engineer",
  "ptitletext": "Press reviews",
  "wt1iutext": "IFIXIT",
  "snz8jtext": "\"Outstanding repairability score\"",
  "de4zxtext": "9/10",
  "iyptltext": "The environmental benefits shine",
  "vssixtext": "WSJ",
  "pfa7htext": "Modularity could reshape enterprise devices",
  "vptitletext": "Value propositions",
  "vp1ttext": "Maximize budget, minimize waste",
  "y1etext": "Framework offers a unique approach to supporting IT budgets by keeping devices in service longer through modular upgrades and repairability.",
  "btn1href": "/",
  "kbw1vtext": "Choose Framework",
  "vp2ttext": "Enabling OS choice",
  "wvjtvtext": "Framework supports multiple operating systems with enterprise-ready flexibility for Windows and Linux deployments.",
  "btn2href": "/",
  "fzhcatext": "Choose your OS",
  "story1imgimagesrc": "https://images.unsplash.com/photo-1666430163005-3cd92302a865?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMwNzg2MzR8&ixlib=rb-4.1.0&q=80&w=1080",
  "story1ttext": "How a distributed team standardized Framework devices",
  "story2imgimagesrc": "https://images.unsplash.com/photo-1559163454-e7d1e00a4e54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMwNzg2NDJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "story2ttext": "Rolling out upgrade-ready laptops to business users",
  "contitletext": "Connect with our business team",
  "introtext": "We are excited to hear from businesses and answer all your hardware needs and questions. Please complete this form and our team will get in touch shortly.",
  "fylwytext": "First Name",
  "vazprtext": "Last Name",
  "zbknttext": "Company",
  "w2r4vtext": "Work email",
  "hsfwotext": "Country",
  "dimyjtext": "Program type?",
  "check1text": "How many laptops are you interested in?",
  "checkstext": "• 1-20\n• 21-50\n• 51-100\n• 100+",
  "industrytext": "Industry",
  "notestext": "Notes",
  "policytext": "Framework respects your data and only uses it to provide requested information.",
  "c7r9text": "Submit",
  "contacttitletext": "Contact support",
  "contactsubtext": "Got support questions for your existing fleet?\nOur support team can help.",
  "contactbtnhref": "/support",
  "nthrutext": "Contact support",
  "contactimgimagesrc": "https://images.unsplash.com/photo-1618410325698-018bb3eb2318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzMwNzg2MzN8&ixlib=rb-4.1.0&q=80&w=1080",
  "faqtitletext": "Frequently asked\nquestions",
  "sec1text": "Ordering & shipping",
  "q1text": "Can your company sell in all countries?",
  "p1text": "+",
  "q2text": "Can I purchase with a PO?",
  "p2text": "+",
  "sec2text": "Program & services",
  "q3text": "Does Framework support MDM workflows?",
  "p3text": "+",
  "q4text": "How do I contact enterprise support?",
  "p4text": "+",
  "sec3text": "Product",
  "q5text": "What options are available for pre-deployment setup?",
  "p5text": "+",
  "q6text": "Can device lifecycle services include monthly fleet refreshes?",
  "p6text": "+",
  "legaltitletext": "Legal",
  "legalbodytext": "Availability and lead times vary by region and configuration. Terms and warranty coverage may differ by country.\nPlease contact our team for enterprise deployment details and procurement support."
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

const FORM_INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  minHeight: 42,
  borderRadius: 14,
  border: "1px solid #D6DBE0",
  background: "#E9ECEF",
  color: "#1F2737",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  padding: "10px 14px",
  outline: "none",
};

const FORM_LABEL_STYLE: React.CSSProperties = {
  color: "#4A4F55",
  fontFamily: "Inter, sans-serif",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.3,
};

const FAQ_ANSWERS: Record<string, string> = {
  "Can your company sell in all countries?":
    "Availability varies by country and enterprise procurement rules. Our business team can confirm supported regions, current lead times, and the right ordering path for your market.",
  "Can I purchase with a PO?":
    "Yes. Framework can support purchase-order based procurement for qualified business customers. Share your company details in the contact form and the team will guide you through the process.",
  "Does Framework support MDM workflows?":
    "Framework systems are designed to fit standard enterprise deployment workflows, including imaging, enrollment, and ongoing device management alongside your existing IT stack.",
  "How do I contact enterprise support?":
    "Use the business contact form on this page or the support contact action below. Include your fleet size and deployment timeline so the right team can respond quickly.",
  "What options are available for pre-deployment setup?":
    "Depending on region and program scope, pre-deployment support can include configuration guidance, parts planning, and onboarding help for new fleet rollouts.",
  "Can device lifecycle services include monthly fleet refreshes?":
    "Lifecycle planning can be tailored around refresh cadence, spare parts strategy, and upgrade windows. The business team can work with you on a rollout plan that matches your operating model.",
};

const parseBulletOptions = (value: unknown) =>
  String(value || "")
    .split("\n")
    .map((token) => token.replace(/^[•\-\s]+/, "").trim())
    .filter(Boolean);

function BusinessTeamFormBlock({
  node,
  merged,
  className,
  style,
}: {
  node: Record<string, any>;
  merged: Record<string, any>;
  className?: string;
  style: React.CSSProperties;
}) {
  const quantityOptions = parseBulletOptions(merged.checkstext);
  return (
    <div className={className} style={style} data-pen-node={node.id || undefined}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#1F2737",
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(32px, 3vw, 42px)",
            fontWeight: 700,
            lineHeight: 1.05,
            textAlign: "center",
          }}
        >
          {String(merged.contitletext || "")}
        </div>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: "min(100%, 640px)",
          }}
          onSubmit={(event) => event.preventDefault()}
        >
          <p
            style={{
              margin: 0,
              color: "#6A7076",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            {String(merged.introtext || "")}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={FORM_LABEL_STYLE}>{String(merged.fylwytext || "First Name")}</span>
              <input type="text" name="firstName" style={FORM_INPUT_STYLE} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={FORM_LABEL_STYLE}>{String(merged.vazprtext || "Last Name")}</span>
              <input type="text" name="lastName" style={FORM_INPUT_STYLE} />
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={FORM_LABEL_STYLE}>{String(merged.zbknttext || "Company")}</span>
            <input type="text" name="company" style={FORM_INPUT_STYLE} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={FORM_LABEL_STYLE}>{String(merged.w2r4vtext || "Work email")}</span>
            <input type="email" name="email" style={FORM_INPUT_STYLE} />
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={FORM_LABEL_STYLE}>{String(merged.hsfwotext || "Country")}</span>
              <input type="text" name="country" style={FORM_INPUT_STYLE} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={FORM_LABEL_STYLE}>{String(merged.dimyjtext || "Program type")}</span>
              <select name="programType" style={FORM_INPUT_STYLE} defaultValue="">
                <option value="" disabled>
                  Select an option
                </option>
                <option value="deployment">Deployment</option>
                <option value="upgrade">Upgrade planning</option>
                <option value="procurement">Procurement</option>
                <option value="support">Support</option>
              </select>
            </label>
          </div>

          <fieldset
            style={{
              border: 0,
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <legend style={{ ...FORM_LABEL_STYLE, marginBottom: 2 }}>{String(merged.check1text || "")}</legend>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              {quantityOptions.map((option) => (
                <label
                  key={option}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minHeight: 42,
                    padding: "0 14px",
                    borderRadius: 14,
                    background: "#E9ECEF",
                    color: "#4A4F55",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                  }}
                >
                  <input type="radio" name="quantity" value={option} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={FORM_LABEL_STYLE}>{String(merged.industrytext || "Industry")}</span>
            <input type="text" name="industry" style={FORM_INPUT_STYLE} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={FORM_LABEL_STYLE}>{String(merged.notestext || "Notes")}</span>
            <textarea name="notes" style={{ ...FORM_INPUT_STYLE, minHeight: 112, resize: "vertical" }} />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              color: "#7A8086",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <input type="checkbox" name="policy" style={{ marginTop: 3 }} />
            <span>{String(merged.policytext || "")}</span>
          </label>

          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <button
              type="submit"
              style={{
                minWidth: 108,
                height: 40,
                borderRadius: 20,
                border: 0,
                background: "#F26B2D",
                color: "#14171A",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                padding: "0 18px",
              }}
            >
              {String(merged.c7r9text || "Submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductsFaqBlock({
  node,
  merged,
  className,
  style,
}: {
  node: Record<string, any>;
  merged: Record<string, any>;
  className?: string;
  style: React.CSSProperties;
}) {
  const sections = [
    { title: String(merged.sec1text || ""), questions: [String(merged.q1text || ""), String(merged.q2text || "")] },
    { title: String(merged.sec2text || ""), questions: [String(merged.q3text || ""), String(merged.q4text || "")] },
    { title: String(merged.sec3text || ""), questions: [String(merged.q5text || ""), String(merged.q6text || "")] },
  ].filter((section) => section.title || section.questions.some(Boolean));
  const firstQuestion = sections.flatMap((section) => section.questions).find(Boolean) || "";
  const [openQuestion, setOpenQuestion] = React.useState<string>(firstQuestion);

  return (
    <div className={className} style={style} data-pen-node={node.id || undefined}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        <div
          style={{
            color: "#1F2737",
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(32px, 3.1vw, 44px)",
            fontWeight: 700,
            lineHeight: 1.02,
            whiteSpace: "pre-line",
            maxWidth: 500,
          }}
        >
          {String(merged.faqtitletext || "")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
          {sections.map((section) => (
            <div key={section.title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  color: "#2E3339",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {section.title}
              </div>
              {section.questions.filter(Boolean).map((question) => {
                const isOpen = openQuestion === question;
                return (
                  <div key={question} style={{ borderBottom: "1px solid #D7DBDE" }}>
                    <button
                      type="button"
                      onClick={() => setOpenQuestion(isOpen ? "" : question)}
                      style={{
                        width: "100%",
                        minHeight: 34,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 20,
                        padding: "0 0 10px",
                        border: 0,
                        background: "transparent",
                        color: "#52585F",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 13,
                          lineHeight: 1.5,
                          maxWidth: 1120,
                        }}
                      >
                        {question}
                      </span>
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </button>
                    {isOpen ? (
                      <div
                        style={{
                          padding: "0 0 14px",
                          color: "#6A7076",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 13,
                          lineHeight: 1.6,
                          maxWidth: 980,
                        }}
                      >
                        {FAQ_ANSWERS[question] || "Contact the Framework business team for the latest guidance on this topic."}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  if (String(node?.name || "") === "ConnectTeam") {
    return <BusinessTeamFormBlock key={key} node={node} merged={merged} className={className} style={style} />;
  }
  if (String(node?.name || "") === "FAQ") {
    return <ProductsFaqBlock key={key} node={node} merged={merged} className={className} style={style} />;
  }
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

export default function TemplateExclusiveFrameworkProductsStoryBizmainpenAlt2({ id, ctitletext, csubtext, c1imgimagesrc, c1txttext, acjqhtext, c2imgimagesrc, c2txttext, ng7y8text, c3imgimagesrc, c3txttext, myvvrtext, c4imgimagesrc, c4txttext, mct7jtext, ttitletext, t1qtext, whtytext, t2qtext, b0iketext, t3qtext, dovaxtext, ptitletext, wt1iutext, snz8jtext, de4zxtext, iyptltext, vssixtext, pfa7htext, vptitletext, vp1ttext, y1etext, btn1href, kbw1vtext, vp2ttext, wvjtvtext, btn2href, fzhcatext, story1imgimagesrc, story1ttext, story2imgimagesrc, story2ttext, contitletext, introtext, fylwytext, vazprtext, zbknttext, w2r4vtext, hsfwotext, dimyjtext, check1text, checkstext, industrytext, notestext, policytext, c7r9text, contacttitletext, contactsubtext, contactbtnhref, nthrutext, contactimgimagesrc, faqtitletext, sec1text, q1text, p1text, q2text, p2text, sec2text, q3text, p3text, q4text, p4text, sec3text, q5text, p5text, q6text, p6text, legaltitletext, legalbodytext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, ctitletext, csubtext, c1imgimagesrc, c1txttext, acjqhtext, c2imgimagesrc, c2txttext, ng7y8text, c3imgimagesrc, c3txttext, myvvrtext, c4imgimagesrc, c4txttext, mct7jtext, ttitletext, t1qtext, whtytext, t2qtext, b0iketext, t3qtext, dovaxtext, ptitletext, wt1iutext, snz8jtext, de4zxtext, iyptltext, vssixtext, pfa7htext, vptitletext, vp1ttext, y1etext, btn1href, kbw1vtext, vp2ttext, wvjtvtext, btn2href, fzhcatext, story1imgimagesrc, story1ttext, story2imgimagesrc, story2ttext, contitletext, introtext, fylwytext, vazprtext, zbknttext, w2r4vtext, hsfwotext, dimyjtext, check1text, checkstext, industrytext, notestext, policytext, c7r9text, contacttitletext, contactsubtext, contactbtnhref, nthrutext, contactimgimagesrc, faqtitletext, sec1text, q1text, p1text, q2text, p2text, sec2text, q3text, p3text, q4text, p4text, sec3text, q5text, p5text, q6text, p6text, legaltitletext, legalbodytext });
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
