"use client";

import React from "react";
import { cn } from "@/lib/cn";

const DEFAULT_PROPS = {
  "variant": "textOnly",
  "align": "center",
  "headingSize": "sm",
  "bodySize": "md",
  "paddingY": "md",
  "maxWidth": "2xl",
  "background": "image",
  "ctas": [],
  "headingFont": "Manrope",
  "bodyFont": "IBM Plex Sans",
  "eyebrow": "Our Story",
  "title": "The Ultimate Stargazing Experience",
  "subtitle": "Augmented Reality Powered Binoculars",
  "body": "The Ultimate Stargazing Experience",
  "referenceSliceMode": false,
  "backgroundGradient": "linear-gradient(180deg,#f3f4f6 0%,#e5e7eb 100%)",
  "backgroundOverlay": "rgba(2, 8, 18, 0.18)",
  "backgroundBlur": 0,
  "motionMode": "off",
  "backgroundMedia": {
    "kind": "image",
    "src": "https://www.unistellar.com/wp-content/uploads/2024/04/citizen-science.jpg",
    "alt": "The Ultimate Stargazing Experience"
  },
  "surfaceTone": "dark",
  "contentTone": "light",
  "media": {
    "kind": "image",
    "src": "https://www.unistellar.com/wp-content/uploads/2024/04/citizen-science.jpg",
    "alt": "The Ultimate Stargazing Experience"
  }
};

const assignDefined = (target, patch) => {
  for (const [key, value] of Object.entries(patch || {})) {
    if (typeof value !== "undefined") target[key] = value;
  }
  return target;
};

const maxWidthClassFor = (value) => {
  const token = String(value || "").trim();
  if (token === "sm") return "max-w-screen-sm";
  if (token === "md") return "max-w-screen-md";
  if (token === "lg") return "max-w-screen-lg";
  if (token === "2xl") return "max-w-screen-2xl";
  if (token === "full") return "max-w-none";
  return "max-w-screen-xl";
};

const paddingClassFor = (value) => {
  const token = String(value || "").trim();
  if (token === "sm") return "py-12";
  if (token === "lg") return "py-20";
  return "py-16";
};

const headingClassFor = (value) => {
  const token = String(value || "").trim();
  if (token === "sm") return "text-3xl sm:text-4xl";
  if (token === "lg") return "text-5xl sm:text-6xl";
  return "text-4xl sm:text-5xl";
};

const bodyClassFor = (value) => {
  const token = String(value || "").trim();
  if (token === "sm") return "text-sm sm:text-base";
  if (token === "lg") return "text-lg sm:text-xl";
  return "text-base sm:text-lg";
};

export default function CustomTemplateExclusiveUnistellarHomeHomeStoryHerocenteredPrimary_unistellar_home_story({
  id,
  anchor,
  variant,
  title,
  subtitle,
  body,
  eyebrow,
  ctas,
  links,
  items,
  backgroundMedia,
  background,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  paddingY,
  headingFont,
  bodyFont,
  headingSize,
  bodySize,
  maxWidth,
  align,
  surfaceTone,
  motionMode,
  referenceSliceMode,
  referenceSliceMinHeight,
  ...rest
}) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, {
    id,
    anchor,
    variant,
    title,
    subtitle,
    body,
    eyebrow,
    ctas,
    links,
    items,
    backgroundMedia,
    background,
    backgroundGradient,
    backgroundOverlay,
    backgroundOverlayOpacity,
    backgroundBlur,
    paddingY,
    headingFont,
    bodyFont,
    headingSize,
    bodySize,
    maxWidth,
    align,
    surfaceTone,
    motionMode,
    referenceSliceMode,
    referenceSliceMinHeight,
  });
  assignDefined(merged, rest);

  const hasImage = typeof merged.backgroundMedia?.src === "string" && merged.backgroundMedia.src.trim().length > 0;
  const textLight = String(merged.surfaceTone || "").trim().toLowerCase() === "dark";
  const rawOverlayColor = String(merged.backgroundOverlay || "").trim();
  const overlayColor = rawOverlayColor || (textLight ? "rgba(2,8,18,0.18)" : "rgba(255,255,255,0.36)");
  const parsedOverlayOpacity = Number(merged.backgroundOverlayOpacity);
  const overlayOpacity = Number.isFinite(parsedOverlayOpacity)
    ? Math.max(0, Math.min(100, parsedOverlayOpacity)) / 100
    : 1;
  const alignCenter = String(merged.align || "").trim().toLowerCase() === "center";
  const minHeight = Math.max(260, Number(merged.referenceSliceMinHeight || 0) || 300);
  const cards = Array.isArray(merged.items) ? merged.items : [];
  const headingStyle = merged.headingFont ? { fontFamily: String(merged.headingFont) } : undefined;
  const bodyStyle = merged.bodyFont ? { fontFamily: String(merged.bodyFont) } : undefined;
  const headingClass = headingClassFor(merged.headingSize);
  const bodyClass = bodyClassFor(merged.bodySize);

  return (
    <section
      id={merged.anchor || merged.id || undefined}
      data-block="CustomTemplateExclusiveUnistellarHomeHomeStoryHerocenteredPrimary_unistellar_home_story"
      className={cn("relative overflow-hidden", paddingClassFor(merged.paddingY))}
      style={{ minHeight: minHeight + "px" }}
    >
      {hasImage ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url(" + merged.backgroundMedia.src + ")",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {overlayColor ? <div className="absolute inset-0" style={{ background: overlayColor, opacity: overlayOpacity }} /> : null}
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: String(merged.backgroundGradient || "linear-gradient(180deg,#ffffff 0%,#f5f5f5 100%)"),
          }}
        />
      )}
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClassFor(merged.maxWidth))}>
        <div className={cn("flex flex-col gap-4", alignCenter ? "items-center text-center" : "items-start text-left")}>
          {merged.eyebrow ? (
            <p className={cn("text-sm tracking-wide", textLight ? "text-zinc-200" : "text-zinc-600")} style={bodyStyle}>
              {String(merged.eyebrow)}
            </p>
          ) : null}
          <h2
            className={cn("max-w-4xl font-semibold tracking-tight", headingClass, textLight ? "text-zinc-100" : "text-zinc-900")}
            style={headingStyle}
          >
            {String(merged.title || "")}
          </h2>
          {merged.subtitle ? (
            <p className={cn("max-w-4xl leading-relaxed", bodyClass, textLight ? "text-zinc-200" : "text-zinc-700")} style={bodyStyle}>
              {String(merged.subtitle)}
            </p>
          ) : null}
          {merged.body && String(merged.body) !== String(merged.subtitle || "") ? (
            <p className={cn("max-w-4xl leading-relaxed", bodyClass, textLight ? "text-zinc-300" : "text-zinc-700")} style={bodyStyle}>
              {String(merged.body)}
            </p>
          ) : null}
          {cards.length ? (
            <div className="mt-4 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.slice(0, 6).map((item, index) => (
                <article
                  key={String(item?.title || index)}
                  className={cn(
                    "rounded-lg border px-4 py-4",
                    textLight ? "border-zinc-300/25 bg-zinc-900/30 text-zinc-100" : "border-zinc-300 bg-white/90 text-zinc-900"
                  )}
                >
                  <h3 className="text-base font-semibold" style={headingStyle}>{String(item?.title || "Item")}</h3>
                  {item?.description ? <p className={cn("mt-2 text-sm", textLight ? "text-zinc-300" : "text-zinc-600")} style={bodyStyle}>{String(item.description)}</p> : null}
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}