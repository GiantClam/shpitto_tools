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

const SECTION_KIND = "products";
const SECTION_TREE = {
  "type": "frame",
  "id": "Dw6YH",
  "name": "product",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 40,
    "padding": "36px 28px",
    "width": "100%",
    "background": "#0A0A0A"
  },
  "children": [
    {
      "type": "frame",
      "id": "ndrAi",
      "name": "productRow1",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 44,
        "justifyContent": "center",
        "width": "100%",
        "height": 690
      },
      "children": [
        {
          "type": "frame",
          "id": "aMVdh",
          "name": "productCard01",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "width": 360,
            "height": 690,
            "border": "1px solid #FFFFFF"
          },
          "children": [
            {
              "type": "frame",
              "id": "sKK0o",
              "name": "productImage01",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 450,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "productimage01imagesrc"
            },
            {
              "type": "frame",
              "id": "vP0ep",
              "name": "productInfo01",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "alignItems": "center",
                "padding": "20px",
                "width": "100%",
                "height": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "fjiSL",
                  "name": "prodTag01",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9DB0D4",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "prodtag01text"
                },
                {
                  "type": "text",
                  "id": "RYZjg",
                  "name": "prodTitle01",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 32,
                    "fontWeight": "700",
                    "letterSpacing": -0.3,
                    "lineHeight": 1,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "prodtitle01text"
                },
                {
                  "type": "text",
                  "id": "obXXE",
                  "name": "prodDesc01",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#777777",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "lineHeight": 1.5,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "proddesc01text"
                },
                {
                  "type": "frame",
                  "id": "wQTRL",
                  "name": "prodBtn01",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "padding": "0px 14px",
                    "height": 30,
                    "background": "#2B67F6"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "3BEQ4",
                      "name": "prodBtnLabel01",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#0A0A0A",
                        "fontFamily": "Manrope",
                        "fontSize": 11,
                        "fontWeight": "600",
                        "letterSpacing": 1
                      },
                      "children": [],
                      "textProp": "prodbtnlabel01text"
                    }
                  ],
                  "hrefProp": "prodbtn01href"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "ACAGB",
          "name": "productCard02",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "width": 360,
            "height": 690,
            "border": "1px solid #333333"
          },
          "children": [
            {
              "type": "frame",
              "id": "1r4G1",
              "name": "productImage02",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 450,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "productimage02imagesrc"
            },
            {
              "type": "frame",
              "id": "xQgYr",
              "name": "productInfo02",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "alignItems": "center",
                "padding": "20px",
                "width": "100%",
                "height": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "4q7b8",
                  "name": "prodTag02",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9DB0D4",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "prodtag02text"
                },
                {
                  "type": "text",
                  "id": "V7EIL",
                  "name": "prodTitle02",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 32,
                    "fontWeight": "700",
                    "letterSpacing": -0.3,
                    "lineHeight": 1,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "prodtitle02text"
                },
                {
                  "type": "text",
                  "id": "E7wnC",
                  "name": "prodDesc02",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#777777",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "lineHeight": 1.5,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "proddesc02text"
                },
                {
                  "type": "frame",
                  "id": "ZEkN6",
                  "name": "prodBtn02",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "padding": "0px 14px",
                    "height": 30,
                    "background": "#27272A",
                    "border": "1px solid #FFFFFF"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "vKXOp",
                      "name": "prodBtnLabel02",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#FFFFFF",
                        "fontFamily": "Manrope",
                        "fontSize": 11,
                        "fontWeight": "600",
                        "letterSpacing": 1
                      },
                      "children": [],
                      "textProp": "prodbtnlabel02text"
                    }
                  ],
                  "hrefProp": "prodbtn02href"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "0ASlF",
      "name": "productRow2",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 44,
        "justifyContent": "center",
        "width": "100%",
        "height": 690
      },
      "children": [
        {
          "type": "frame",
          "id": "MiLWi",
          "name": "productCard03",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "width": 360,
            "height": 690,
            "border": "1px solid #333333"
          },
          "children": [
            {
              "type": "frame",
              "id": "0o4OH",
              "name": "productImage03",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 450,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "productimage03imagesrc"
            },
            {
              "type": "frame",
              "id": "b1048",
              "name": "productInfo03",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "alignItems": "center",
                "padding": "20px",
                "width": "100%",
                "height": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "WNW6u",
                  "name": "prodTag03",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9DB0D4",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "prodtag03text"
                },
                {
                  "type": "text",
                  "id": "zsO6Y",
                  "name": "prodTitle03",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 32,
                    "fontWeight": "700",
                    "letterSpacing": -0.3,
                    "lineHeight": 1,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "prodtitle03text"
                },
                {
                  "type": "text",
                  "id": "60mvT",
                  "name": "prodDesc03",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#777777",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "lineHeight": 1.5,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "proddesc03text"
                },
                {
                  "type": "frame",
                  "id": "XmivC",
                  "name": "prodBtn03",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "padding": "0px 14px",
                    "height": 30,
                    "background": "#27272A",
                    "border": "1px solid #FFFFFF"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "akfaj",
                      "name": "prodBtnLabel03",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#FFFFFF",
                        "fontFamily": "Manrope",
                        "fontSize": 11,
                        "fontWeight": "600",
                        "letterSpacing": 1
                      },
                      "children": [],
                      "textProp": "prodbtnlabel03text"
                    }
                  ],
                  "hrefProp": "prodbtn03href"
                }
              ]
            }
          ]
        },
        {
          "type": "frame",
          "id": "zTml6",
          "name": "productCard04",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "width": 360,
            "height": 690,
            "border": "1px solid #FFFFFF"
          },
          "children": [
            {
              "type": "frame",
              "id": "7iH4b",
              "name": "productImage04",
              "style": {
                "boxSizing": "border-box",
                "width": "100%",
                "height": 450,
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "center",
                "backgroundSize": "cover"
              },
              "children": [],
              "imageProp": "productimage04imagesrc"
            },
            {
              "type": "frame",
              "id": "wi99M",
              "name": "productInfo04",
              "style": {
                "boxSizing": "border-box",
                "display": "flex",
                "flexDirection": "column",
                "gap": 10,
                "alignItems": "center",
                "padding": "20px",
                "width": "100%",
                "height": "100%"
              },
              "children": [
                {
                  "type": "text",
                  "id": "IZXAC",
                  "name": "prodTag04",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#9DB0D4",
                    "fontFamily": "Manrope",
                    "fontSize": 11,
                    "fontWeight": "600",
                    "letterSpacing": 1
                  },
                  "children": [],
                  "textProp": "prodtag04text"
                },
                {
                  "type": "text",
                  "id": "YxF2i",
                  "name": "prodTitle04",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#FFFFFF",
                    "fontFamily": "Space Grotesk",
                    "fontSize": 32,
                    "fontWeight": "700",
                    "letterSpacing": -0.3,
                    "lineHeight": 1,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "prodtitle04text"
                },
                {
                  "type": "text",
                  "id": "SotBz",
                  "name": "prodDesc04",
                  "style": {
                    "boxSizing": "border-box",
                    "margin": 0,
                    "whiteSpace": "pre-line",
                    "color": "#777777",
                    "fontFamily": "Manrope",
                    "fontSize": 13,
                    "lineHeight": 1.5,
                    "textAlign": "center",
                    "width": "100%"
                  },
                  "children": [],
                  "textProp": "proddesc04text"
                },
                {
                  "type": "frame",
                  "id": "TQ23z",
                  "name": "prodBtn04",
                  "style": {
                    "boxSizing": "border-box",
                    "display": "flex",
                    "flexDirection": "row",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "padding": "0px 14px",
                    "height": 30,
                    "background": "#2B67F6"
                  },
                  "children": [
                    {
                      "type": "text",
                      "id": "vPvN3",
                      "name": "prodBtnLabel04",
                      "style": {
                        "boxSizing": "border-box",
                        "margin": 0,
                        "whiteSpace": "pre-line",
                        "color": "#0A0A0A",
                        "fontFamily": "Manrope",
                        "fontSize": 11,
                        "fontWeight": "600",
                        "letterSpacing": 1
                      },
                      "children": [],
                      "textProp": "prodbtnlabel04text"
                    }
                  ],
                  "hrefProp": "prodbtn04href"
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
  "id": "Dw6YH",
  "productimage01imagesrc": "https://images.unsplash.com/photo-1739450543338-663204eb8888?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODg0Njl8&ixlib=rb-4.1.0&q=80&w=1080",
  "prodtag01text": "01  ODYSSEY PRO",
  "prodtitle01text": "Deep-space clarity\nin one tap",
  "proddesc01text": "Ultra-low-light optics and AI noise suppression for sharp celestial detail.",
  "prodbtn01href": "/view-specs",
  "prodbtnlabel01text": "VIEW SPECS",
  "productimage02imagesrc": "https://images.unsplash.com/photo-1760551601203-12eddfb62216?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODg0NzB8&ixlib=rb-4.1.0&q=80&w=1080",
  "prodtag02text": "02  ENVISION",
  "prodtitle02text": "AR overlays for\ninstant target lock",
  "proddesc02text": "Contextual overlays track motion vectors and highlight mission-critical zones.",
  "prodbtn02href": "/see-demo",
  "prodbtnlabel02text": "SEE DEMO",
  "productimage03imagesrc": "https://images.unsplash.com/photo-1694627110385-d0e3dfb258f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODg0OTN8&ixlib=rb-4.1.0&q=80&w=1080",
  "prodtag03text": "03  EQUINOX",
  "prodtitle03text": "Cinema-grade\nnight capture",
  "proddesc03text": "HDR stacking and thermal stabilization for crisp footage after sunset.",
  "prodbtn03href": "/explore",
  "prodbtnlabel03text": "EXPLORE",
  "productimage04imagesrc": "https://images.unsplash.com/photo-1730292422953-8b20263e406f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzIxODg0OTR8&ixlib=rb-4.1.0&q=80&w=1080",
  "prodtag04text": "04  AURORA",
  "prodtitle04text": "Portable precision\nfor every trail",
  "proddesc04text": "Rugged body, long-range sensor fusion, and one-hand operation in motion.",
  "prodbtn04href": "/buy-now",
  "prodbtnlabel04text": "BUY NOW"
};
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };
const PEN_RUNTIME_MOTION_STYLE = "@keyframes pen-media-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}";

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

const resolveDelayMs = (keyPath = "", motionMode = "subtle") => {
  const match = String(keyPath || "").match(/-(\d+)$/);
  const index = Number(match?.[1] || 0);
  const step = motionMode === "showcase" ? 80 : 45;
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

const isHeadingLikeTextNode = (node) => {
  const lowerName = String(node?.name || "").trim().toLowerCase();
  if (/(title|headline|hero|eyebrow|heading)/.test(lowerName)) return true;
  return resolveFontSize(node?.style?.fontSize) >= 22;
};

const buildNodeClassName = (node, motionMode) => {
  if (motionMode === "off") return "";
  const classes = [];
  if (node?.hrefProp) classes.push("hover-lift");
  if (node?.type === "frame" && node?.imageProp) classes.push("will-change-transform");
  return classes.join(" ");
};

const buildNodeStyle = (node, merged, motionMode, keyPath) => {
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
  if (motionMode !== "off") {
    const delayMs = resolveDelayMs(keyPath, motionMode);
    style.transition = style.transition || "opacity 560ms var(--ease-smooth), transform 560ms var(--ease-smooth), box-shadow 300ms var(--ease-smooth)";
    if (delayMs > 0) style.transitionDelay = style.transitionDelay || `${delayMs}ms`;
    if (
      motionMode === "showcase" &&
      node?.imageProp &&
      !style.animation &&
      (!style.transform || String(style.transform).trim() === "")
    ) {
      style.animation = "pen-media-breathe 8s var(--ease-smooth, ease) infinite";
      style.transformOrigin = style.transformOrigin || "50% 50%";
    }
  }
  return style;
};

const renderTextContent = (node, merged, keyPath, motionMode) => {
  const textValue = String(merged?.[node?.textProp] ?? "");
  if (!textValue || motionMode === "off") return textValue;
  if (!isHeadingLikeTextNode(node)) return textValue;
  return React.createElement(
    TextReveal,
    {
      as: "span",
      className: "inline-block",
      delayMs: resolveDelayMs(keyPath, motionMode),
    },
    textValue
  );
};

const renderNode = (node, merged, motionMode, key = "root") => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged, motionMode, key);
  const className = buildNodeClassName(node, motionMode) || undefined;
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
      renderTextContent(node, merged, key, motionMode)
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
      ? node.children.map((child, index) => renderNode(child, merged, motionMode, `${key}-${index}`))
      : [])
  );
};

export default function TemplateExclusiveUnistellarHomeHomeProductsProductpenAlt3({ id, productimage01imagesrc, prodtag01text, prodtitle01text, proddesc01text, prodbtn01href, prodbtnlabel01text, productimage02imagesrc, prodtag02text, prodtitle02text, proddesc02text, prodbtn02href, prodbtnlabel02text, productimage03imagesrc, prodtag03text, prodtitle03text, proddesc03text, prodbtn03href, prodbtnlabel03text, productimage04imagesrc, prodtag04text, prodtitle04text, proddesc04text, prodbtn04href, prodbtnlabel04text, ...rest }) {
  const providerMotionMode = useMotionMode();
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, productimage01imagesrc, prodtag01text, prodtitle01text, proddesc01text, prodbtn01href, prodbtnlabel01text, productimage02imagesrc, prodtag02text, prodtitle02text, proddesc02text, prodbtn02href, prodbtnlabel02text, productimage03imagesrc, prodtag03text, prodtitle03text, proddesc03text, prodbtn03href, prodbtnlabel03text, productimage04imagesrc, prodtag04text, prodtitle04text, proddesc04text, prodbtn04href, prodbtnlabel04text });
  assignDefined(merged, rest);
  const effectiveMotionMode = resolveMotionMode(providerMotionMode, merged?.motionMode);
  const sectionKindToken = String(SECTION_KIND || "").trim().toLowerCase();
  const reveal = useInViewReveal({
    preset: sectionKindToken === "hero" ? "fadeIn" : "fadeUp",
    once: true,
    enabled: effectiveMotionMode !== "off",
  });
  const sectionClassName = effectiveMotionMode === "off"
    ? "w-full"
    : ["w-full", reveal.className].filter(Boolean).join(" ");
  const sectionStyle = effectiveMotionMode === "off" ? undefined : reveal.style;
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": SECTION_KIND,
      className: sectionClassName,
      style: sectionStyle,
    },
    ...(effectiveMotionMode !== "off"
      ? [React.createElement("style", { key: "pen-motion-style" }, PEN_RUNTIME_MOTION_STYLE)]
      : []),
    renderNode(SECTION_TREE, merged, effectiveMotionMode, "root")
  );
}