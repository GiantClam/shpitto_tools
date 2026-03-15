// @ts-nocheck
"use client";

import React from "react";
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

const SECTION_TREE = {
  "type": "frame",
  "id": "tZMLV",
  "name": "Footer Compatible",
  "style": {
    "boxSizing": "border-box",
    "display": "flex",
    "flexDirection": "column",
    "gap": 24,
    "padding": "36px 56px",
    "width": "100%",
    "background": "linear-gradient(180deg, #0D1524 0%, #09101A 100%)",
    "borderTop": "1px solid #2A2A2E"
  },
  "children": [
    {
      "type": "frame",
      "id": "Xt0sF",
      "name": "Footer Top",
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
          "type": "frame",
          "id": "BeCrz",
          "name": "Footer Brand Stack",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": 440
          },
          "children": [
            {
              "type": "text",
              "id": "4IC6K",
              "name": "Footer Brand",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#FAFAF9",
                "fontFamily": "Fraunces",
                "fontSize": 28,
                "fontWeight": "600",
                "letterSpacing": -0.3
              },
              "children": [],
              "textProp": "footerBrandtext"
            },
            {
              "type": "text",
              "id": "4bdOr",
              "name": "Footer Description",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#8E8E93",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "normal",
                "lineHeight": 1.5,
                "width": 440
              },
              "children": [],
              "textProp": "footerDescriptiontext",
              "hrefProp": "footerDescriptionhref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "tpFys",
          "name": "Footer CTA",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "justifyContent": "center",
            "alignItems": "center",
            "padding": "12px 18px",
            "height": 46,
            "borderRadius": 999,
            "background": "#121722",
            "border": "1px solid #303849"
          },
          "children": [
            {
              "type": "text",
              "id": "1Sotp",
              "name": "Footer CTA Text",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#D6DEEA",
                "fontFamily": "DM Sans",
                "fontSize": 13,
                "fontWeight": "600"
              },
              "children": [],
              "textProp": "footerCtaTexttext"
            }
          ],
          "hrefProp": "footerCtahref"
        }
      ]
    },
    {
      "type": "frame",
      "id": "J59xR",
      "name": "Footer Links Row",
      "style": {
        "boxSizing": "border-box",
        "display": "flex",
        "flexDirection": "row",
        "gap": 40,
        "width": "100%"
      },
      "children": [
        {
          "type": "frame",
          "id": "bh4ee",
          "name": "Product Links",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": 220
          },
          "children": [
            {
              "type": "text",
              "id": "JRF6j",
              "name": "Product Heading",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "productHeadingtext"
            },
            {
              "type": "text",
              "id": "aYFmN",
              "name": "Product Smart Telescopes",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "productSmartTelescopestext",
              "hrefProp": "productSmartTelescopeshref"
            },
            {
              "type": "text",
              "id": "rVjWz",
              "name": "Product Smart Binoculars",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "productSmartBinocularstext",
              "hrefProp": "productSmartBinocularshref"
            },
            {
              "type": "text",
              "id": "4swXc",
              "name": "Product App Software",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "productAppSoftwaretext",
              "hrefProp": "productAppSoftwarehref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "wvdnW",
          "name": "Company Links",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": 220
          },
          "children": [
            {
              "type": "text",
              "id": "vm2pS",
              "name": "Company Heading",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "companyHeadingtext"
            },
            {
              "type": "text",
              "id": "kT035",
              "name": "Company About",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "companyAbouttext",
              "hrefProp": "companyAbouthref"
            },
            {
              "type": "text",
              "id": "nnDB0",
              "name": "Company Technologies",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "companyTechnologiestext",
              "hrefProp": "companyTechnologieshref"
            },
            {
              "type": "text",
              "id": "m6PAt",
              "name": "Company Contact",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "companyContacttext",
              "hrefProp": "companyContacthref"
            }
          ]
        },
        {
          "type": "frame",
          "id": "LKmqy",
          "name": "Resource Links",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "column",
            "gap": 10,
            "width": 220
          },
          "children": [
            {
              "type": "text",
              "id": "bnOYC",
              "name": "Resource Heading",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "700"
              },
              "children": [],
              "textProp": "resourceHeadingtext"
            },
            {
              "type": "text",
              "id": "Jnazo",
              "name": "Resource Knowledge Base",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "resourceKnowledgeBasetext",
              "hrefProp": "resourceKnowledgeBasehref"
            },
            {
              "type": "text",
              "id": "SV72d",
              "name": "Resource Warranty",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "resourceWarrantytext",
              "hrefProp": "resourceWarrantyhref"
            },
            {
              "type": "text",
              "id": "WTXfT",
              "name": "Resource Privacy",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "resourcePrivacytext",
              "hrefProp": "resourcePrivacyhref"
            },
            {
              "type": "text",
              "id": "A7RDf",
              "name": "Resource Product Updates",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#C4CCDA",
                "fontFamily": "DM Sans",
                "fontSize": 14,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "resourceProductUpdatestext",
              "hrefProp": "resourceProductUpdateshref"
            }
          ]
        }
      ]
    },
    {
      "type": "frame",
      "id": "w6Q2r",
      "name": "Footer Bottom",
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
          "id": "mvzJH",
          "name": "Footer Copyright",
          "style": {
            "boxSizing": "border-box",
            "margin": 0,
            "whiteSpace": "pre-line",
            "color": "#6B6B70",
            "fontFamily": "DM Sans",
            "fontSize": 12,
            "fontWeight": "normal"
          },
          "children": [],
          "textProp": "footerCopyrighttext"
        },
        {
          "type": "frame",
          "id": "iS0Xy",
          "name": "Footer Utility Links",
          "style": {
            "boxSizing": "border-box",
            "display": "flex",
            "flexDirection": "row",
            "gap": 24
          },
          "children": [
            {
              "type": "text",
              "id": "U1Klk",
              "name": "Regional Support",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#97A0AE",
                "fontFamily": "DM Sans",
                "fontSize": 12,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "regionalSupporttext"
            },
            {
              "type": "text",
              "id": "WIsBG",
              "name": "Demo Appointments",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#97A0AE",
                "fontFamily": "DM Sans",
                "fontSize": 12,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "demoAppointmentstext",
              "hrefProp": "demoAppointmentshref"
            },
            {
              "type": "text",
              "id": "sufFL",
              "name": "Press Partnerships",
              "style": {
                "boxSizing": "border-box",
                "margin": 0,
                "whiteSpace": "pre-line",
                "color": "#97A0AE",
                "fontFamily": "DM Sans",
                "fontSize": 12,
                "fontWeight": "500"
              },
              "children": [],
              "textProp": "pressPartnershipstext",
              "hrefProp": "pressPartnershipshref"
            }
          ]
        }
      ]
    }
  ]
};
const DEFAULT_PROPS = {
  "id": "tZMLV",
  "footerBrandtext": "UNISTELLAR",
  "footerDescriptiontext": "Precision instruments, guided support, and a global team helping curious observers get more from every clear night.",
  "footerDescriptionhref": "/precision-instruments-guided-support-and-a-global-team-helping-curious-observers",
  "footerCtahref": "/open-support-portal",
  "footerCtaTexttext": "Open Support Portal",
  "productHeadingtext": "PRODUCT",
  "productSmartTelescopestext": "Smart Telescopes",
  "productSmartTelescopeshref": "/smart-telescopes",
  "productSmartBinocularstext": "Smart Binoculars",
  "productSmartBinocularshref": "/smart-binoculars",
  "productAppSoftwaretext": "App & Software",
  "productAppSoftwarehref": "/app-software",
  "companyHeadingtext": "COMPANY",
  "companyAbouttext": "About Unistellar",
  "companyAbouthref": "/about-unistellar",
  "companyTechnologiestext": "Technologies",
  "companyTechnologieshref": "/technologies",
  "companyContacttext": "Contact",
  "companyContacthref": "/contact",
  "resourceHeadingtext": "RESOURCES",
  "resourceKnowledgeBasetext": "Knowledge Base",
  "resourceKnowledgeBasehref": "/knowledge-base",
  "resourceWarrantytext": "Warranty",
  "resourceWarrantyhref": "/warranty",
  "resourcePrivacytext": "Privacy Policy",
  "resourcePrivacyhref": "/privacy-policy",
  "resourceProductUpdatestext": "Product Updates",
  "resourceProductUpdateshref": "/product-updates",
  "footerCopyrighttext": "© 2026 Unistellar. Built for curious minds under dark skies.",
  "regionalSupporttext": "Regional Support",
  "demoAppointmentstext": "Demo Appointments",
  "demoAppointmentshref": "/demo-appointments",
  "pressPartnershipstext": "Press & Partnerships",
  "pressPartnershipshref": "/press-partnerships"
};
const ICONS = { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, Minus, Play, Plus, Search, Sparkles, Wifi, X };

const assignDefined = (target, patch) => {
  for (const [key, value] of Object.entries(patch || {})) {
    if (typeof value !== "undefined") target[key] = value;
  }
  return target;
};

const buildNodeStyle = (node, merged) => {
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
  return style;
};

const renderNode = (node, merged, key = "root") => {
  if (!node || typeof node !== "object") return null;
  const style = buildNodeStyle(node, merged);
  const href = node?.hrefProp ? String(merged?.[node.hrefProp] || "").trim() : "";
  if (node.type === "icon_font") {
    const Icon = node?.iconName ? ICONS[node.iconName] : null;
    if (Icon) {
      return React.createElement(Icon, {
        key,
        style,
        "data-pen-node": node.id || undefined,
      });
    }
    return React.createElement(
      "span",
      {
        key,
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
        style,
        "data-pen-node": node.id || undefined,
      },
      String(merged?.[node.textProp] ?? "")
    );
  }
  const Tag = href ? "a" : "div";
  return React.createElement(
    Tag,
    {
      key,
      href: href || undefined,
      style,
      "data-pen-node": node.id || undefined,
    },
    ...(Array.isArray(node.children) ? node.children.map((child, index) => renderNode(child, merged, `${key}-${index}`)) : [])
  );
};

export default function TemplateExclusiveUnistellarHomeSmartBinocularsFooterFootercompatiblepenAlt5({ id, footerBrandtext, footerDescriptiontext, footerDescriptionhref, footerCtahref, footerCtaTexttext, productHeadingtext, productSmartTelescopestext, productSmartTelescopeshref, productSmartBinocularstext, productSmartBinocularshref, productAppSoftwaretext, productAppSoftwarehref, companyHeadingtext, companyAbouttext, companyAbouthref, companyTechnologiestext, companyTechnologieshref, companyContacttext, companyContacthref, resourceHeadingtext, resourceKnowledgeBasetext, resourceKnowledgeBasehref, resourceWarrantytext, resourceWarrantyhref, resourcePrivacytext, resourcePrivacyhref, resourceProductUpdatestext, resourceProductUpdateshref, footerCopyrighttext, regionalSupporttext, demoAppointmentstext, demoAppointmentshref, pressPartnershipstext, pressPartnershipshref, ...rest }) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, { id, footerBrandtext, footerDescriptiontext, footerDescriptionhref, footerCtahref, footerCtaTexttext, productHeadingtext, productSmartTelescopestext, productSmartTelescopeshref, productSmartBinocularstext, productSmartBinocularshref, productAppSoftwaretext, productAppSoftwarehref, companyHeadingtext, companyAbouttext, companyAbouthref, companyTechnologiestext, companyTechnologieshref, companyContacttext, companyContacthref, resourceHeadingtext, resourceKnowledgeBasetext, resourceKnowledgeBasehref, resourceWarrantytext, resourceWarrantyhref, resourcePrivacytext, resourcePrivacyhref, resourceProductUpdatestext, resourceProductUpdateshref, footerCopyrighttext, regionalSupporttext, demoAppointmentstext, demoAppointmentshref, pressPartnershipstext, pressPartnershipshref });
  assignDefined(merged, rest);
  return React.createElement(
    "section",
    {
      id: merged.id || DEFAULT_PROPS.id,
      "data-pen-section-kind": "footer",
      className: "w-full",
    },
    renderNode(SECTION_TREE, merged, "root")
  );
}