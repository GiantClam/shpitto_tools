// @ts-nocheck
"use client";

import React from "react";
import * as BaseBlockModule from "@/components/blocks/feature-with-media/block";

const DEFAULT_PROPS = {
  "variant": "split",
  "align": "center",
  "headingSize": "lg",
  "bodySize": "sm",
  "paddingY": "md",
  "maxWidth": "2xl",
  "background": "image",
  "ctas": [],
  "mediaPosition": "right",
  "contentTone": "light",
  "textPanel": true,
  "textPanelBackground": "rgba(8, 12, 20, 0.44)",
  "textPanelBorderColor": "rgba(255,255,255,0.16)",
  "headingFont": "Manrope",
  "bodyFont": "Work Sans",
  "surfaceTone": "dark",
  "eyebrow": "Our Story",
  "title": "The Ultimate Stargazing Experience",
  "subtitle": "Augmented Reality Powered Binoculars",
  "body": "The Ultimate Stargazing Experience",
  "referenceSliceMinHeight": 1316,
  "backgroundOverlay": "rgba(2, 8, 18, 0.18)",
  "backgroundBlur": 0,
  "referenceSliceMode": false,
  "backgroundGradient": "linear-gradient(180deg,#f3f4f6 0%,#e5e7eb 100%)",
  "backgroundMedia": {
    "kind": "image",
    "src": "https://www.unistellar.com/wp-content/uploads/2026/02/binoculars-desktop-hero-scaled.jpg",
    "alt": "Unistellar | Award-Winning Smart Telescopes story background"
  },
  "motionMode": "off",
  "media": {
    "kind": "image",
    "src": "https://www.unistellar.com/wp-content/uploads/2026/02/binoculars-desktop-hero-scaled.jpg",
    "alt": "The Ultimate Stargazing Experience"
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

export default function CustomTemplateExclusiveUnistellarHomeHomeStoryFeaturewithmediaPrimary_unistellar_home_story({
  variant,
  align,
  headingSize,
  bodySize,
  paddingY,
  maxWidth,
  background,
  ctas,
  mediaPosition,
  contentTone,
  textPanel,
  textPanelBackground,
  textPanelBorderColor,
  headingFont,
  bodyFont,
  surfaceTone,
  eyebrow,
  title,
  subtitle,
  body,
  referenceSliceMinHeight,
  backgroundOverlay,
  backgroundBlur,
  referenceSliceMode,
  backgroundGradient,
  backgroundMedia,
  motionMode,
  media,
  ...rest
}) {

  if (!BaseBlock) return null;
  const mergedProps = {
    ...DEFAULT_PROPS,
    ...(typeof variant === "undefined" ? {} : { variant }),
    ...(typeof align === "undefined" ? {} : { align }),
    ...(typeof headingSize === "undefined" ? {} : { headingSize }),
    ...(typeof bodySize === "undefined" ? {} : { bodySize }),
    ...(typeof paddingY === "undefined" ? {} : { paddingY }),
    ...(typeof maxWidth === "undefined" ? {} : { maxWidth }),
    ...(typeof background === "undefined" ? {} : { background }),
    ...(typeof ctas === "undefined" ? {} : { ctas }),
    ...(typeof mediaPosition === "undefined" ? {} : { mediaPosition }),
    ...(typeof contentTone === "undefined" ? {} : { contentTone }),
    ...(typeof textPanel === "undefined" ? {} : { textPanel }),
    ...(typeof textPanelBackground === "undefined" ? {} : { textPanelBackground }),
    ...(typeof textPanelBorderColor === "undefined" ? {} : { textPanelBorderColor }),
    ...(typeof headingFont === "undefined" ? {} : { headingFont }),
    ...(typeof bodyFont === "undefined" ? {} : { bodyFont }),
    ...(typeof surfaceTone === "undefined" ? {} : { surfaceTone }),
    ...(typeof eyebrow === "undefined" ? {} : { eyebrow }),
    ...(typeof title === "undefined" ? {} : { title }),
    ...(typeof subtitle === "undefined" ? {} : { subtitle }),
    ...(typeof body === "undefined" ? {} : { body }),
    ...(typeof referenceSliceMinHeight === "undefined" ? {} : { referenceSliceMinHeight }),
    ...(typeof backgroundOverlay === "undefined" ? {} : { backgroundOverlay }),
    ...(typeof backgroundBlur === "undefined" ? {} : { backgroundBlur }),
    ...(typeof referenceSliceMode === "undefined" ? {} : { referenceSliceMode }),
    ...(typeof backgroundGradient === "undefined" ? {} : { backgroundGradient }),
    ...(typeof backgroundMedia === "undefined" ? {} : { backgroundMedia }),
    ...(typeof motionMode === "undefined" ? {} : { motionMode }),
    ...(typeof media === "undefined" ? {} : { media }),
    ...rest,
  };
  return React.createElement(BaseBlock, mergedProps);
}