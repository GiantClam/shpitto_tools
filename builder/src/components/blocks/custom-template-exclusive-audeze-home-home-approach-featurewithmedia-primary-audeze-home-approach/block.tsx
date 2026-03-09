"use client";

import React from "react";
import * as BaseBlockModule from "@/components/blocks/feature-with-media/block";

const DEFAULT_PROPS = {
  "variant": "simple",
  "paddingY": "md",
  "maxWidth": "2xl",
  "mediaPosition": "left",
  "background": "image",
  "headingFont": "Barlow Condensed",
  "bodyFont": "Manrope",
  "headingSize": "sm",
  "bodySize": "md",
  "align": "left",
  "items": [],
  "title": "Audiophile Headphones",
  "subtitle": "Our world-leading gaming headsets deliver unparalleled audio quality, far beyond the competition, immersing you deeply in vast realms of vivid detail and clarit",
  "body": "Our world-leading gaming headsets deliver unparalleled audio quality, far beyond the competition, immersing you deeply in vast realms of vivid detail and clarity.",
  "backgroundOverlay": "rgba(2, 8, 18, 0.08)",
  "contentTone": "light",
  "textPanel": true,
  "textPanelBackground": "rgba(10, 16, 30, 0.44)",
  "textPanelBorderColor": "rgba(255,255,255,0.16)",
  "textPanelPadding": "md",
  "textPanelRadius": "md",
  "textPanelMaxWidth": "lg",
  "ctas": [
    {
      "label": "Shop Category",
      "href": "/collections/accessories",
      "variant": "primary"
    }
  ],
  "backgroundBlur": 0,
  "surfaceTone": "dark",
  "referenceSliceMode": false,
  "backgroundGradient": "linear-gradient(180deg,#f3f4f6 0%,#e5e7eb 100%)",
  "motionMode": "off",
  "backgroundMedia": {
    "kind": "image",
    "src": "https://www.audeze.com/cdn/shop/files/SLAM2_2000x.jpg?v=1744253058",
    "alt": "Audeze 耳机 | 无损音频 | 平面磁性技术 approach background"
  }
};

const resolveBlockComponent = (moduleExports) => {
  if (typeof moduleExports?.default === "function") return moduleExports.default;
  for (const candidate of Object.values(moduleExports || {})) {
    if (typeof candidate === "function") return candidate;
  }
  return null;
};

const BaseBlock = resolveBlockComponent(BaseBlockModule);

export default function CustomTemplateExclusiveAudezeHomeHomeApproachFeaturewithmediaPrimary_audeze_home_approach({
  variant,
  paddingY,
  maxWidth,
  mediaPosition,
  background,
  headingFont,
  bodyFont,
  headingSize,
  bodySize,
  align,
  items,
  title,
  subtitle,
  body,
  backgroundOverlay,
  contentTone,
  textPanel,
  textPanelBackground,
  textPanelBorderColor,
  textPanelPadding,
  textPanelRadius,
  textPanelMaxWidth,
  ctas,
  backgroundBlur,
  surfaceTone,
  referenceSliceMode,
  backgroundGradient,
  motionMode,
  backgroundMedia,
  ...rest
}) {

  if (!BaseBlock) return null;
  const mergedProps = {
    ...DEFAULT_PROPS,
    ...(typeof variant === "undefined" ? {} : { variant }),
    ...(typeof paddingY === "undefined" ? {} : { paddingY }),
    ...(typeof maxWidth === "undefined" ? {} : { maxWidth }),
    ...(typeof mediaPosition === "undefined" ? {} : { mediaPosition }),
    ...(typeof background === "undefined" ? {} : { background }),
    ...(typeof headingFont === "undefined" ? {} : { headingFont }),
    ...(typeof bodyFont === "undefined" ? {} : { bodyFont }),
    ...(typeof headingSize === "undefined" ? {} : { headingSize }),
    ...(typeof bodySize === "undefined" ? {} : { bodySize }),
    ...(typeof align === "undefined" ? {} : { align }),
    ...(typeof items === "undefined" ? {} : { items }),
    ...(typeof title === "undefined" ? {} : { title }),
    ...(typeof subtitle === "undefined" ? {} : { subtitle }),
    ...(typeof body === "undefined" ? {} : { body }),
    ...(typeof backgroundOverlay === "undefined" ? {} : { backgroundOverlay }),
    ...(typeof contentTone === "undefined" ? {} : { contentTone }),
    ...(typeof textPanel === "undefined" ? {} : { textPanel }),
    ...(typeof textPanelBackground === "undefined" ? {} : { textPanelBackground }),
    ...(typeof textPanelBorderColor === "undefined" ? {} : { textPanelBorderColor }),
    ...(typeof textPanelPadding === "undefined" ? {} : { textPanelPadding }),
    ...(typeof textPanelRadius === "undefined" ? {} : { textPanelRadius }),
    ...(typeof textPanelMaxWidth === "undefined" ? {} : { textPanelMaxWidth }),
    ...(typeof ctas === "undefined" ? {} : { ctas }),
    ...(typeof backgroundBlur === "undefined" ? {} : { backgroundBlur }),
    ...(typeof surfaceTone === "undefined" ? {} : { surfaceTone }),
    ...(typeof referenceSliceMode === "undefined" ? {} : { referenceSliceMode }),
    ...(typeof backgroundGradient === "undefined" ? {} : { backgroundGradient }),
    ...(typeof motionMode === "undefined" ? {} : { motionMode }),
    ...(typeof backgroundMedia === "undefined" ? {} : { backgroundMedia }),
    ...rest,
  };
  return React.createElement(BaseBlock, mergedProps);
}