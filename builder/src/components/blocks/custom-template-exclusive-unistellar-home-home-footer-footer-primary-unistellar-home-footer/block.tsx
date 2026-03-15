// @ts-nocheck
"use client";

import React from "react";
import * as BaseBlockModule from "@/components/blocks/footer/block";

const DEFAULT_PROPS = {
  "variant": "multiColumn",
  "paddingY": "md",
  "maxWidth": "xl",
  "background": "gradient",
  "backgroundGradient": "linear-gradient(180deg,#000000 0%,#000000 100%)",
  "surfaceTone": "dark",
  "headingFont": "Manrope",
  "bodyFont": "Work Sans",
  "bodySize": "md",
  "backgroundOverlay": "",
  "backgroundOverlayOpacity": 0,
  "backgroundBlur": 0,
  "logoText": "Unistellar",
  "columns": [
    {
      "title": "Company",
      "links": [
        {
          "label": "ODYSSEY Range",
          "href": "/odyssey"
        },
        {
          "label": "ENVISION Smart Binoculars",
          "href": "/envision"
        },
        {
          "label": "Unistellar App",
          "href": "/"
        },
        {
          "label": "Users Gallery",
          "href": "/gallery"
        },
        {
          "label": "Citizen Science",
          "href": "/citizen-science"
        },
        {
          "label": "About",
          "href": "/about"
        },
        {
          "label": "Press Portal",
          "href": "/press-portal"
        },
        {
          "label": "Education Program",
          "href": "/education-program"
        }
      ]
    },
    {
      "title": "Resources",
      "links": [
        {
          "label": "EXPERT Range",
          "href": "/expert"
        },
        {
          "label": "Compare",
          "href": "/compare"
        },
        {
          "label": "Technologies",
          "href": "/technologies"
        },
        {
          "label": "Use Cases",
          "href": "/"
        },
        {
          "label": "Blog",
          "href": "/blog"
        },
        {
          "label": "Resellers",
          "href": "/resellers"
        },
        {
          "label": "Affiliates",
          "href": "/affiliate-program"
        },
        {
          "label": "Hospitality Program",
          "href": "/hospitality-program"
        }
      ]
    },
    {
      "title": "Legal",
      "links": [
        {
          "label": "Legal Notice",
          "href": "/legal-notice"
        }
      ]
    }
  ],
  "legal": "© 2026 All rights reserved.",
  "referenceSliceMinHeight": 687,
  "referenceSliceMode": false,
  "motionMode": "off"
};

const resolveBlockComponent = (moduleExports) => {
  if (typeof moduleExports?.default === "function") return moduleExports.default;
  for (const candidate of Object.values(moduleExports || {})) {
    if (typeof candidate === "function") return candidate;
  }
  return null;
};

const BaseBlock = resolveBlockComponent(BaseBlockModule);

export default function CustomTemplateExclusiveUnistellarHomeHomeFooterFooterPrimary_unistellar_home_footer({
  variant,
  paddingY,
  maxWidth,
  background,
  backgroundGradient,
  surfaceTone,
  headingFont,
  bodyFont,
  bodySize,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  logoText,
  columns,
  legal,
  referenceSliceMinHeight,
  referenceSliceMode,
  motionMode,
  ...rest
}) {

  if (!BaseBlock) return null;
  const mergedProps = {
    ...DEFAULT_PROPS,
    ...(typeof variant === "undefined" ? {} : { variant }),
    ...(typeof paddingY === "undefined" ? {} : { paddingY }),
    ...(typeof maxWidth === "undefined" ? {} : { maxWidth }),
    ...(typeof background === "undefined" ? {} : { background }),
    ...(typeof backgroundGradient === "undefined" ? {} : { backgroundGradient }),
    ...(typeof surfaceTone === "undefined" ? {} : { surfaceTone }),
    ...(typeof headingFont === "undefined" ? {} : { headingFont }),
    ...(typeof bodyFont === "undefined" ? {} : { bodyFont }),
    ...(typeof bodySize === "undefined" ? {} : { bodySize }),
    ...(typeof backgroundOverlay === "undefined" ? {} : { backgroundOverlay }),
    ...(typeof backgroundOverlayOpacity === "undefined" ? {} : { backgroundOverlayOpacity }),
    ...(typeof backgroundBlur === "undefined" ? {} : { backgroundBlur }),
    ...(typeof logoText === "undefined" ? {} : { logoText }),
    ...(typeof columns === "undefined" ? {} : { columns }),
    ...(typeof legal === "undefined" ? {} : { legal }),
    ...(typeof referenceSliceMinHeight === "undefined" ? {} : { referenceSliceMinHeight }),
    ...(typeof referenceSliceMode === "undefined" ? {} : { referenceSliceMode }),
    ...(typeof motionMode === "undefined" ? {} : { motionMode }),
    ...rest,
  };
  return React.createElement(BaseBlock, mergedProps);
}