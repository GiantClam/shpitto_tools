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
  "id": "6bBvy",
  "name": "main",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "row",
    "gap": 36,
    "width": "100%",
    "height": 980
  },
  "children": [
    {
      "type": "frame",
      "id": "kWUh2",
      "name": "gal",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 16,
        "width": 760,
        "height": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "lYS8A",
          "name": "galHero",
          "style": {
            "boxSizing": "border-box",
            "width": "100%",
            "height": 640,
            "border": "1px solid #D7E7E4",
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center",
            "backgroundSize": "cover",
            "overflow": "hidden",
            "position": "relative"
          },
          "children": [
            {
              "type": "frame",
              "id": "sMzRy",
              "name": "heroChip",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 10,
                "alignItems": "center",
                "padding": "0px 12px",
                "width": 176,
                "height": 34,
                "borderRadius": 999,
                "background": "#FFFFFFCC",
                "border": "1px solid #D7E7E4",
                "position": "absolute",
                "left": 24,
                "top": 24
              },
              "children": [
                {
                  "type": "frame",
                  "id": "y2I5T",
                  "name": "heroChipDot",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 8,
                    "height": 8,
                    "borderRadius": 999,
                    "background": "#0D6E6E"
                  },
                  "children": []
                },
                {
                  "type": "text",
                  "id": "GLufI",
                  "name": "heroChipTxt",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D0D0D",
                    "fontFamily": "JetBrains Mono",
                    "fontSize": 11,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "herochiptxttext"
                }
              ],
              "hrefProp": "herochiphref"
            },
            {
              "type": "frame",
              "id": "eBqWx",
              "name": "heroPager",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "gap": 8,
                "alignItems": "center",
                "padding": "0px 10px",
                "width": 220,
                "height": 32,
                "borderRadius": 999,
                "background": "#111111B8",
                "position": "absolute",
                "left": 24,
                "top": 584
              },
              "children": [
                {
                  "type": "frame",
                  "id": "38ik0",
                  "name": "bar1",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 84,
                    "height": 4,
                    "borderRadius": 999,
                    "background": "#FFFFFF"
                  },
                  "children": []
                },
                {
                  "type": "frame",
                  "id": "Zwoe9",
                  "name": "bar2",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 52,
                    "height": 4,
                    "borderRadius": 999,
                    "background": "#FFFFFF4D"
                  },
                  "children": []
                },
                {
                  "type": "frame",
                  "id": "snoAo",
                  "name": "bar3",
                  "style": {
                    "boxSizing": "border-box",
                    "width": 52,
                    "height": 4,
                    "borderRadius": 999,
                    "background": "#FFFFFF4D"
                  },
                  "children": []
                }
              ]
            }
          ],
          "imageProp": "galheroimagesrc"
        },
        {
          "type": "frame",
          "id": "wLdiJ",
          "name": "galRow",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 16,
            "width": "100%",
            "height": "100%"
          },
          "children": [
            {
              "type": "frame",
              "id": "wfCKH",
              "name": "g1",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "center",
                "alignItems": "center",
                "width": "100%",
                "height": "100%",
                "border": "2px solid #0D6E6E",
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "boxShadow": "0px 10px 24px #0D6E6E26"
              },
              "children": [],
              "imageProp": "g1imagesrc"
            },
            {
              "type": "frame",
              "id": "iqaD5",
              "name": "g2",
              "style": {
                "boxSizing": "border-box",
                "opacity": 0.88,
                "width": "100%",
                "height": "100%",
                "border": "1px solid #E2D9CF",
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover",
                "overflow": "hidden",
                "position": "relative"
              },
              "children": [
                {
                  "type": "frame",
                  "id": "JUjyA",
                  "name": "thumbHover",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "width": 148,
                    "height": 36,
                    "borderRadius": 999,
                    "background": "#111111CC",
                    "position": "absolute",
                    "left": 18,
                    "top": 118
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "SD1yw",
                      "name": "thumbHoverTxt",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#FFFFFF",
                        "fontFamily": "JetBrains Mono",
                        "fontSize": 11,
                        "fontWeight": "500"
                      },
                      "children": [],
                      "textProp": "thumbhovertxttext"
                    }
                  ]
                }
              ],
              "imageProp": "g2imagesrc"
            },
            {
              "type": "frame",
              "id": "975ej",
              "name": "g3",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "justifyContent": "center",
                "alignItems": "center",
                "width": "100%",
                "height": "100%",
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "g3imagesrc"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "kbwCQ",
      "name": "info",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "column",
        "gap": 20,
        "width": "100%",
        "height": "100%"
      },
      "children": [
        {
          "type": "text",
          "id": "fmWyZ",
          "name": "series",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#7A7A7A",
            "fontFamily": "Inter",
            "fontSize": 12,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "seriestext"
        },
        {
          "type": "text",
          "id": "h8UOM",
          "name": "ptitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#0D0D0D",
            "fontFamily": "Space Grotesk",
            "fontSize": 46,
            "fontWeight": "500",
            "letterSpacing": -1,
            "lineHeight": 1.08,
            "width": "100%"
          },
          "children": [],
          "textProp": "ptitletext"
        },
        {
          "type": "text",
          "id": "z9HXi",
          "name": "price",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#0D0D0D",
            "fontFamily": "Space Grotesk",
            "fontSize": 36,
            "fontWeight": "600",
            "letterSpacing": -1
          },
          "children": [],
          "textProp": "pricetext"
        },
        {
          "type": "text",
          "id": "KbzGc",
          "name": "desc",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#7A7A7A",
            "fontFamily": "Inter",
            "fontSize": 15,
            "fontWeight": "normal",
            "lineHeight": 1.5,
            "width": "100%"
          },
          "children": [],
          "textProp": "desctext"
        },
        {
          "type": "text",
          "id": "ofNNF",
          "name": "optTitle",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#0D0D0D",
            "fontFamily": "Inter",
            "fontSize": 13,
            "fontWeight": "500"
          },
          "children": [],
          "textProp": "opttitletext"
        },
        {
          "type": "frame",
          "id": "hnxr7",
          "name": "optRow",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 10
          },
          "children": [
            {
              "type": "frame",
              "id": "S0vgT",
              "name": "sw1",
              "style": {
                "boxSizing": "border-box",
                "width": 28,
                "height": 28,
                "background": "#0D0D0D",
                "border": "1px solid #0D0D0D"
              },
              "children": []
            },
            {
              "type": "frame",
              "id": "e4c0c",
              "name": "sw2",
              "style": {
                "boxSizing": "border-box",
                "width": 28,
                "height": 28,
                "background": "#D9D9D6",
                "border": "1px solid #E8E8E8"
              },
              "children": []
            },
            {
              "type": "frame",
              "id": "T5zXT",
              "name": "sw3",
              "style": {
                "boxSizing": "border-box",
                "width": 28,
                "height": 28,
                "background": "#B28E6B",
                "border": "1px solid #E8E8E8"
              },
              "children": []
            }
          ]
        },
        {
          "type": "frame",
          "id": "ncEcz",
          "name": "qty",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 12,
            "alignItems": "center"
          },
          "children": [
            {
              "type": "text",
              "id": "5KLOI",
              "name": "qtyL",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#0D0D0D",
                "fontFamily": "Inter",
                "fontSize": 13,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "qtyltext"
            },
            {
              "type": "frame",
              "id": "MRtM4",
              "name": "qtyBox",
              "style": {
                "boxSizing": "border-box",
                "padding": "8px 16px",
                "border": "1px solid #E8E8E8"
              },
              "children": [
                {
                  "type": "text",
                  "id": "f3EV3",
                  "name": "qtyT",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D0D0D",
                    "fontFamily": "Inter",
                    "fontSize": 14,
                    "fontWeight": "normal"
                  },
                  "children": [],
                  "textProp": "qtyttext"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "dedXV",
          "name": "act",
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
              "id": "DsZTx",
              "name": "buy",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "row",
                "justifyContent": "center",
                "padding": "14px 20px",
                "width": "100%",
                "borderRadius": 14,
                "background": "linear-gradient(90deg, #146F70 0%, #0A5657 100%)",
                "boxShadow": "0px 10px 24px #0D6E6E33"
              },
              "children": [
                {
                  "type": "text",
                  "id": "B6cWC",
                  "name": "buyT",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 13,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "buyttext"
                }
              ],
              "hrefProp": "buyhref"
            },
            {
              "type": "frame",
              "id": "UVHbW",
              "name": "wish",
              "style": {
                "boxSizing": "border-box",
                "padding": "14px 20px",
                "borderRadius": 14,
                "background": "#F2F4F3",
                "border": "1px solid #BFD4D1",
                "boxShadow": "0px 1px 0px #FFFFFFCC"
              },
              "children": [
                {
                  "type": "text",
                  "id": "Sswgi",
                  "name": "wishT",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#0D6E6E",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 13,
                    "fontWeight": "500"
                  },
                  "children": [],
                  "textProp": "wishttext"
                }
              ],
              "hrefProp": "wishhref"
            }
          ]
        },
        {
          "type": "text",
          "id": "7xOjB",
          "name": "ship",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#7A7A7A",
            "fontFamily": "Inter",
            "fontSize": 13,
            "fontWeight": "normal",
            "lineHeight": 1.5,
            "width": "100%"
          },
          "children": [],
          "textProp": "shiptext"
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "6bBvy",
  "galheroimagesrc": "https://images.unsplash.com/photo-1725303174950-79be9bbd834d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgwNzl8&ixlib=rb-4.1.0&q=80&w=1080",
  "herochiptxttext": "image switch / active",
  "herochiphref": "/",
  "g1imagesrc": "https://images.unsplash.com/photo-1737651704014-ed9e926333cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgxMDF8&ixlib=rb-4.1.0&q=80&w=1080",
  "g2imagesrc": "https://images.unsplash.com/photo-1600019155294-22661a9105f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgxMDJ8&ixlib=rb-4.1.0&q=80&w=1080",
  "thumbhovertxttext": "hover preview",
  "g3imagesrc": "https://images.unsplash.com/photo-1752650736141-2e7c25e10583?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIyMDgxMDN8&ixlib=rb-4.1.0&q=80&w=1080",
  "seriestext": "OVER-EAR SERIES",
  "ptitletext": "MW75 Active Noise-Cancelling Wireless Headphones",
  "pricetext": "$599",
  "desctext": "Adaptive Active Noise-Cancellation with 32-hour battery life, crystal-clear voice microphones, and memory foam ear pads.",
  "opttitletext": "Color",
  "qtyltext": "Quantity",
  "qtyttext": "1",
  "buyttext": "Add to Cart →",
  "buyhref": "/",
  "wishttext": "Wishlist Added",
  "wishhref": "/",
  "shiptext": "Free domestic shipping. 30-day return policy. 2-year limited warranty."
};
const LAYOUT_CONTEXT = {
  "pageWidth": 1440,
  "pagePaddingLeft": 72,
  "pagePaddingRight": 72,
  "pagePaddingTop": 0,
  "pagePaddingBottom": 0,
  "sectionGapAfter": 48
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

export default function TemplateExclusivePenSiteMasterdynamicProductStoryMainpenAlt1({ id, galheroimagesrc, herochiptxttext, herochiphref, g1imagesrc, g2imagesrc, thumbhovertxttext, g3imagesrc, seriestext, ptitletext, pricetext, desctext, opttitletext, qtyltext, qtyttext, buyttext, buyhref, wishttext, wishhref, shiptext, ...rest }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, galheroimagesrc, herochiptxttext, herochiphref, g1imagesrc, g2imagesrc, thumbhovertxttext, g3imagesrc, seriestext, ptitletext, pricetext, desctext, opttitletext, qtyltext, qtyttext, buyttext, buyhref, wishttext, wishhref, shiptext });
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
  const mergedSectionStyle = sectionStyle ? { ...layoutStyle, ...sectionStyle } : layoutStyle;
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