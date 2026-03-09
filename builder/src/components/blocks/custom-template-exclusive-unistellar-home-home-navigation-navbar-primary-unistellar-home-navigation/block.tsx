"use client";

import React from "react";
import * as BaseBlockModule from "@/components/blocks/navbar/block";

const DEFAULT_PROPS = {
  "variant": "withDropdown",
  "sticky": true,
  "paddingY": "sm",
  "maxWidth": "xl",
  "background": "gradient",
  "backgroundGradient": "linear-gradient(180deg,rgb(0,0,0) 0%,rgb(0,0,0) 100%)",
  "backgroundOverlay": "",
  "multiLevel": true,
  "menuStyle": "image_text",
  "headingFont": "Manrope",
  "bodyFont": "Work Sans",
  "bodySize": "md",
  "logo": {
    "alt": "Unistellar"
  },
  "surfaceTone": "dark",
  "backgroundOverlayOpacity": 0,
  "backgroundBlur": 0,
  "referenceSliceMinHeight": 68,
  "links": [
    {
      "label": "Smart Telescopes",
      "href": "/",
      "variant": "link"
    },
    {
      "label": "Smart Binoculars",
      "href": "/envision",
      "variant": "link"
    },
    {
      "label": "Reviews",
      "href": "/reviews",
      "variant": "link"
    },
    {
      "label": "Technologies",
      "href": "/technologies",
      "variant": "link"
    },
    {
      "label": "Use Cases",
      "href": "/",
      "variant": "link"
    },
    {
      "label": "All Smart Telescopes",
      "href": "/all-smart-telescopes",
      "variant": "link"
    },
    {
      "label": "ODYSSEY Range",
      "href": "/odyssey",
      "variant": "link"
    }
  ],
  "ctas": [
    {
      "label": "Contact",
      "href": "/contact",
      "variant": "primary"
    }
  ],
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

export default function CustomTemplateExclusiveUnistellarHomeHomeNavigationNavbarPrimary_unistellar_home_navigation({
  variant,
  sticky,
  paddingY,
  maxWidth,
  background,
  backgroundGradient,
  backgroundOverlay,
  multiLevel,
  menuStyle,
  headingFont,
  bodyFont,
  bodySize,
  logo,
  surfaceTone,
  backgroundOverlayOpacity,
  backgroundBlur,
  referenceSliceMinHeight,
  links,
  ctas,
  referenceSliceMode,
  motionMode,
  ...rest
}) {

  if (!BaseBlock) return null;
  const mergedProps = {
    ...DEFAULT_PROPS,
    ...(typeof variant === "undefined" ? {} : { variant }),
    ...(typeof sticky === "undefined" ? {} : { sticky }),
    ...(typeof paddingY === "undefined" ? {} : { paddingY }),
    ...(typeof maxWidth === "undefined" ? {} : { maxWidth }),
    ...(typeof background === "undefined" ? {} : { background }),
    ...(typeof backgroundGradient === "undefined" ? {} : { backgroundGradient }),
    ...(typeof backgroundOverlay === "undefined" ? {} : { backgroundOverlay }),
    ...(typeof multiLevel === "undefined" ? {} : { multiLevel }),
    ...(typeof menuStyle === "undefined" ? {} : { menuStyle }),
    ...(typeof headingFont === "undefined" ? {} : { headingFont }),
    ...(typeof bodyFont === "undefined" ? {} : { bodyFont }),
    ...(typeof bodySize === "undefined" ? {} : { bodySize }),
    ...(typeof logo === "undefined" ? {} : { logo }),
    ...(typeof surfaceTone === "undefined" ? {} : { surfaceTone }),
    ...(typeof backgroundOverlayOpacity === "undefined" ? {} : { backgroundOverlayOpacity }),
    ...(typeof backgroundBlur === "undefined" ? {} : { backgroundBlur }),
    ...(typeof referenceSliceMinHeight === "undefined" ? {} : { referenceSliceMinHeight }),
    ...(typeof links === "undefined" ? {} : { links }),
    ...(typeof ctas === "undefined" ? {} : { ctas }),
    ...(typeof referenceSliceMode === "undefined" ? {} : { referenceSliceMode }),
    ...(typeof motionMode === "undefined" ? {} : { motionMode }),
    ...rest,
  };
  return React.createElement(BaseBlock, mergedProps);
}