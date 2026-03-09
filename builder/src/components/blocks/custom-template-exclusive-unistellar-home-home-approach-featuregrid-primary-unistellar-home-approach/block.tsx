"use client";

import React from "react";
import { cn } from "@/lib/cn";

const DEFAULT_PROPS = {
  "variant": "3col",
  "paddingY": "lg",
  "maxWidth": "xl",
  "headingFont": "Manrope",
  "bodyFont": "IBM Plex Sans",
  "bodySize": "lg",
  "surfaceTone": "dark",
  "contentTone": "light",
  "title": "Augmented Reality Powered Binoculars",
  "subtitle": "The Experience",
  "items": [
    {
      "title": "The Ultimate Stargazing Experience",
      "desc": "The Ultimate Stargazing Experience",
      "description": "The Ultimate Stargazing Experience",
      "icon": "layers",
      "imageSrc": "https://www.unistellar.com/wp-content/uploads/2026/01/telescope-desktop-hero-scaled.jpg",
      "imageAlt": "The Ultimate Stargazing Experience",
      "image": {
        "src": "https://www.unistellar.com/wp-content/uploads/2026/01/telescope-desktop-hero-scaled.jpg",
        "alt": "The Ultimate Stargazing Experience"
      }
    },
    {
      "title": "Augmented Reality Powered Binoculars",
      "desc": "Augmented Reality Powered Binoculars",
      "description": "Augmented Reality Powered Binoculars",
      "icon": "shield",
      "imageSrc": "https://www.unistellar.com/wp-content/uploads/2026/02/binoculars-desktop-hero-scaled.jpg",
      "imageAlt": "Augmented Reality Powered Binoculars",
      "image": {
        "src": "https://www.unistellar.com/wp-content/uploads/2026/02/binoculars-desktop-hero-scaled.jpg",
        "alt": "Augmented Reality Powered Binoculars"
      }
    },
    {
      "title": "The Experience",
      "desc": "The Experience",
      "description": "The Experience",
      "icon": "chart",
      "imageSrc": "https://www.unistellar.com/wp-content/uploads/2026/02/telescope-tablet-hero-1.jpg",
      "imageAlt": "The Experience",
      "image": {
        "src": "https://www.unistellar.com/wp-content/uploads/2026/02/telescope-tablet-hero-1.jpg",
        "alt": "The Experience"
      }
    }
  ],
  "referenceSliceMinHeight": 1316,
  "background": "gradient",
  "backgroundGradient": "linear-gradient(180deg,#04152f 0%,#08234c 100%)",
  "referenceSliceMode": false,
  "motionMode": "off"
};

const assignDefined = (target, patch) => {
  for (const [key, value] of Object.entries(patch || {})) {
    if (typeof value !== "undefined") target[key] = value;
  }
  return target;
};

const toHref = (value) => {
  const raw = String(value || "").trim();
  return raw || "#";
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
  if (token === "lg") return "py-24";
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

export default function CustomTemplateExclusiveUnistellarHomeHomeApproachFeaturegridPrimary_unistellar_home_approach({
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
  contentTone,
  mediaPosition,
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
    contentTone,
    mediaPosition,
    motionMode,
    referenceSliceMode,
    referenceSliceMinHeight,
  });
  assignDefined(merged, rest);

  const contentLight =
    String(merged.contentTone || "").trim().toLowerCase() === "light" ||
    String(merged.surfaceTone || "").trim().toLowerCase() === "dark";
  const cards = Array.isArray(merged.items) ? merged.items : [];
  const actions = Array.isArray(merged.ctas) ? merged.ctas : [];
  const minHeight = Math.max(320, Number(merged.referenceSliceMinHeight || 0) || 520);
  const imageSrc = String(merged.backgroundMedia?.src || "").trim();
  const rawOverlayColor = String(merged.backgroundOverlay || "").trim();
  const overlayColor = rawOverlayColor || "rgba(2,8,18,0.20)";
  const parsedOverlayOpacity = Number(merged.backgroundOverlayOpacity);
  const overlayOpacity = Number.isFinite(parsedOverlayOpacity)
    ? Math.max(0, Math.min(100, parsedOverlayOpacity)) / 100
    : 1;
  const headingStyle = merged.headingFont ? { fontFamily: String(merged.headingFont) } : undefined;
  const bodyStyle = merged.bodyFont ? { fontFamily: String(merged.bodyFont) } : undefined;
  const headingClass = headingClassFor(merged.headingSize);
  const bodyClass = bodyClassFor(merged.bodySize);
  const simpleOverlayLayout = String(merged.variant || "").trim().toLowerCase() === "simple" || cards.length === 0;

  return (
    <section
      id={merged.anchor || merged.id || undefined}
      data-block="CustomTemplateExclusiveUnistellarHomeHomeApproachFeaturegridPrimary_unistellar_home_approach"
      className={cn("relative overflow-hidden", paddingClassFor(merged.paddingY))}
      style={{ minHeight: minHeight + "px" }}
    >
      {imageSrc ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url(" + imageSrc + ")",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {overlayColor ? <div className="absolute inset-0" style={{ background: overlayColor, opacity: overlayOpacity }} /> : null}
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: String(merged.backgroundGradient || "linear-gradient(180deg,#0b1220 0%,#111827 100%)") }}
        />
      )}
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClassFor(merged.maxWidth))}>
        {simpleOverlayLayout ? (
          <div className="max-w-3xl">
            {merged.eyebrow ? (
              <p className={cn("text-sm tracking-wide", contentLight ? "text-zinc-200" : "text-zinc-600")} style={bodyStyle}>
                {String(merged.eyebrow)}
              </p>
            ) : null}
            <h2
              className={cn("mt-1 font-semibold tracking-tight", headingClass, contentLight ? "text-zinc-100" : "text-zinc-900")}
              style={headingStyle}
            >
              {String(merged.title || "")}
            </h2>
            {merged.subtitle ? (
              <p className={cn("mt-3 max-w-3xl leading-relaxed", bodyClass, contentLight ? "text-zinc-200" : "text-zinc-700")} style={bodyStyle}>
                {String(merged.subtitle)}
              </p>
            ) : null}
            {merged.body && String(merged.body) !== String(merged.subtitle || "") ? (
              <p className={cn("mt-3 max-w-3xl leading-relaxed", bodyClass, contentLight ? "text-zinc-300" : "text-zinc-700")} style={bodyStyle}>
                {String(merged.body)}
              </p>
            ) : null}
            {actions.length ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {actions.slice(0, 2).map((cta, idx) => (
                  <a
                    key={String(cta?.label || idx)}
                    href={toHref(cta?.href)}
                    className={cn(
                      "inline-flex items-center rounded-md px-5 py-3 text-sm font-semibold transition",
                      idx === 0
                        ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                        : contentLight
                        ? "border border-zinc-300/60 text-zinc-100 hover:bg-zinc-900/35"
                        : "border border-zinc-400 text-zinc-900 hover:bg-zinc-100"
                    )}
                  >
                    {String(cta?.label || "Learn more")}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className={cn("md:col-span-7", String(merged.mediaPosition || "left") === "left" ? "md:order-1" : "md:order-2")}>
              {merged.eyebrow ? (
                <p className={cn("text-sm tracking-wide", contentLight ? "text-zinc-200" : "text-zinc-600")} style={bodyStyle}>
                  {String(merged.eyebrow)}
                </p>
              ) : null}
              <h2
                className={cn("mt-1 font-semibold tracking-tight", headingClass, contentLight ? "text-zinc-100" : "text-zinc-900")}
                style={headingStyle}
              >
                {String(merged.title || "")}
              </h2>
              {merged.subtitle ? (
                <p className={cn("mt-3 max-w-3xl leading-relaxed", bodyClass, contentLight ? "text-zinc-200" : "text-zinc-700")} style={bodyStyle}>
                  {String(merged.subtitle)}
                </p>
              ) : null}
              {merged.body && String(merged.body) !== String(merged.subtitle || "") ? (
                <p className={cn("mt-3 max-w-3xl leading-relaxed", bodyClass, contentLight ? "text-zinc-300" : "text-zinc-700")} style={bodyStyle}>
                  {String(merged.body)}
                </p>
              ) : null}
              {actions.length ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {actions.slice(0, 2).map((cta, idx) => (
                    <a
                      key={String(cta?.label || idx)}
                      href={toHref(cta?.href)}
                      className={cn(
                        "inline-flex items-center rounded-md px-5 py-3 text-sm font-semibold transition",
                        idx === 0
                          ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                          : contentLight
                          ? "border border-zinc-300/60 text-zinc-100 hover:bg-zinc-900/35"
                          : "border border-zinc-400 text-zinc-900 hover:bg-zinc-100"
                      )}
                    >
                      {String(cta?.label || "Learn more")}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <div className={cn("md:col-span-5", String(merged.mediaPosition || "left") === "left" ? "md:order-2" : "md:order-1")}>
              {cards.length ? (
                <div className="grid gap-3">
                  {cards.slice(0, 4).map((item, index) => (
                    <article
                      key={String(item?.title || index)}
                      className={cn(
                        "rounded-lg border px-4 py-3",
                        contentLight ? "border-zinc-300/35 bg-zinc-950/35 text-zinc-100" : "border-zinc-300 bg-white/90 text-zinc-900"
                      )}
                    >
                      <h3 className="text-sm font-semibold" style={headingStyle}>{String(item?.title || "Item")}</h3>
                      {item?.description ? <p className={cn("mt-1 text-xs leading-relaxed", contentLight ? "text-zinc-300" : "text-zinc-600")} style={bodyStyle}>{String(item.description)}</p> : null}
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}