// @ts-nocheck
"use client";

import React from "react";
import { cn } from "@/lib/cn";

const DEFAULT_PROPS = {
  "heroSlides": [],
  "paddingY": "lg",
  "headingSize": "lg",
  "maxWidth": "xl",
  "headingFont": "Manrope",
  "bodyFont": "Work Sans",
  "bodySize": "sm",
  "title": "Smart Telescopes",
  "subtitle": "Augmented Reality Powered Binoculars",
  "surfaceTone": "dark",
  "contentTone": "light",
  "background": "gradient",
  "ctas": [
    {
      "label": "Contact",
      "href": "/contact",
      "variant": "primary"
    }
  ],
  "align": "left",
  "backgroundOverlay": "",
  "referenceSliceMinHeight": 1100,
  "backgroundBlur": 0,
  "referenceSliceMode": false,
  "backgroundGradient": "linear-gradient(180deg,#f3f4f6 0%,#e5e7eb 100%)",
  "motionMode": "off",
  "media": {
    "kind": "image",
    "src": "https://www.unistellar.com/wp-content/uploads/2026/01/telescope-desktop-hero-scaled.jpg",
    "alt": "Smart Telescopes"
  },
  "mediaPosition": "right"
};

const assignDefined = (target, patch) => {
  for (const [key, value] of Object.entries(patch || {})) {
    if (typeof value !== "undefined") target[key] = value;
  }
  return target;
};

const clamp = (value, min, max) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
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

const textPanelPaddingClassFor = (value) => {
  const token = String(value || "").trim();
  if (token === "sm") return "p-4 sm:p-5";
  if (token === "lg") return "p-7 sm:p-8";
  return "p-5 sm:p-6";
};

const textPanelRadiusClassFor = (value) => {
  const token = String(value || "").trim();
  if (token === "sm") return "rounded-lg";
  if (token === "lg") return "rounded-2xl";
  return "rounded-xl";
};

const textPanelMaxWidthClassFor = (value) => {
  const token = String(value || "").trim();
  if (token === "sm") return "max-w-xl";
  if (token === "md") return "max-w-2xl";
  if (token === "lg") return "max-w-3xl";
  return "max-w-4xl";
};

const resolveSlides = (heroSlides, backgroundMedia, title, subtitle, ctas) => {
  const rows = Array.isArray(heroSlides)
    ? heroSlides.filter((slide) => typeof slide?.src === "string" && slide.src.trim().length > 0)
    : [];
  if (rows.length) return rows;
  const defaultRows = Array.isArray(DEFAULT_PROPS.heroSlides)
    ? DEFAULT_PROPS.heroSlides.filter((slide) => typeof slide?.src === "string" && slide.src.trim().length > 0)
    : [];
  if (defaultRows.length >= 2) return defaultRows;
  if (backgroundMedia && typeof backgroundMedia.src === "string" && backgroundMedia.src.trim()) {
    return [
      {
        src: backgroundMedia.src,
        alt: backgroundMedia.alt || String(title || ""),
        title: title || "",
        subtitle: subtitle || "",
        ctas: Array.isArray(ctas) ? ctas : [],
      },
    ];
  }
  return defaultRows;
};

export default function CustomTemplateExclusiveUnistellarHomeHomeHeroHerosplitPrimary_unistellar_home_hero({
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
  heroSlides,
  heroCarouselAutoplayMs,
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
  mediaPosition,
  surfaceTone,
  textPanel,
  textPanelBackground,
  textPanelBorderColor,
  textPanelPadding,
  textPanelRadius,
  textPanelMaxWidth,
  motionMode,
  referenceSliceMode,
  referenceSliceMinHeight,
  ...rest
}) {
  const merged = assignDefined({ ...DEFAULT_PROPS }, {
    id,
    anchor,
    title,
    subtitle,
    body,
    eyebrow,
    ctas,
    links,
    items,
    heroSlides,
    heroCarouselAutoplayMs,
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
    mediaPosition,
    surfaceTone,
    textPanel,
    textPanelBackground,
    textPanelBorderColor,
    textPanelPadding,
    textPanelRadius,
    textPanelMaxWidth,
    motionMode,
    referenceSliceMode,
    referenceSliceMinHeight,
  });
  assignDefined(merged, rest);

  const slides = resolveSlides(
    merged.heroSlides,
    merged.backgroundMedia,
    merged.title,
    merged.subtitle,
    merged.ctas
  );
  const [activeSlide, setActiveSlide] = React.useState(0);
  React.useEffect(() => {
    setActiveSlide(0);
  }, [slides.length]);
  React.useEffect(() => {
    if (slides.length < 2) return;
    const intervalMs = Number(merged.heroCarouselAutoplayMs) > 1200 ? Number(merged.heroCarouselAutoplayMs) : 4500;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [slides.length, merged.heroCarouselAutoplayMs]);

  const active = slides[activeSlide] || {};
  const heroTitle = active.title || merged.title || "";
  const heroSubtitle = active.subtitle || merged.subtitle || merged.body || "";
  const heroEyebrow = active.eyebrow || merged.eyebrow || "";
  const heroCtas =
    Array.isArray(active.ctas) && active.ctas.length
      ? active.ctas
      : Array.isArray(merged.ctas)
      ? merged.ctas
      : [];
  const backgroundSrc = String(active.src || merged.backgroundMedia?.src || "").trim();
  const backgroundStyle =
    backgroundSrc
      ? {
          backgroundImage: "url(" + backgroundSrc + ")",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {
          background: String(merged.backgroundGradient || "linear-gradient(180deg,#0b1220 0%,#090d18 100%)"),
        };

  const textPanelEnabled = Boolean(merged.textPanel) || Boolean(merged.textPanelBackground);
  const rawOverlayColor = String(merged.backgroundOverlay || "").trim();
  const parsedOverlayOpacity = Number(merged.backgroundOverlayOpacity);
  const hasExplicitOverlayOpacity = Number.isFinite(parsedOverlayOpacity);
  const overlayColor = rawOverlayColor || (textPanelEnabled ? "" : "rgba(2,8,23,0.22)");
  const overlayOpacity = hasExplicitOverlayOpacity ? clamp(parsedOverlayOpacity, 0, 100) / 100 : 1;
  const overlayBlur = clamp(merged.backgroundBlur ?? 0, 0, 20);
  const textLight = String(merged.surfaceTone || "").trim().toLowerCase() === "dark";
  const sectionMinHeight = Math.max(
    480,
    Number(merged.referenceSliceMinHeight || 0) || (Boolean(merged.referenceSliceMode) ? 780 : 680)
  );
  const alignCenter = String(merged.align || "").trim().toLowerCase() === "center";
  const headingStyle = merged.headingFont ? { fontFamily: String(merged.headingFont) } : undefined;
  const bodyStyle = merged.bodyFont ? { fontFamily: String(merged.bodyFont) } : undefined;
  const headingClass = headingClassFor(merged.headingSize);
  const bodyClass = bodyClassFor(merged.bodySize);
  const textPanelStyle = textPanelEnabled
    ? {
        background: String(
          merged.textPanelBackground ||
            (textLight ? "rgba(9,14,26,0.46)" : "rgba(255,255,255,0.62)")
        ),
        border: "1px solid " + String(merged.textPanelBorderColor || (textLight ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.12)")),
        backdropFilter: "blur(2px)",
      }
    : undefined;

  return (
    <section
      id={merged.anchor || merged.id || undefined}
      data-block="CustomTemplateExclusiveUnistellarHomeHomeHeroHerosplitPrimary_unistellar_home_hero"
      className={cn("relative overflow-hidden", paddingClassFor(merged.paddingY))}
      style={{ minHeight: sectionMinHeight + "px" }}
    >
      <div className="absolute inset-0" style={backgroundStyle} />
      {overlayColor ? (
        <div
          className="absolute inset-0"
          style={{
            background: overlayColor,
            opacity: overlayOpacity,
            backdropFilter: overlayBlur > 0 ? "blur(" + overlayBlur + "px)" : "none",
          }}
        />
      ) : null}
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClassFor(merged.maxWidth))}>
        <div
          className={cn(
            "flex min-h-[inherit] w-full flex-col justify-center gap-6",
            alignCenter ? "items-center text-center" : "items-start text-left"
          )}
          style={{ minHeight: sectionMinHeight + "px" }}
        >
          <div
            className={cn(
              textPanelEnabled ? textPanelPaddingClassFor(merged.textPanelPadding) : "",
              textPanelEnabled ? textPanelRadiusClassFor(merged.textPanelRadius) : "",
              textPanelEnabled ? textPanelMaxWidthClassFor(merged.textPanelMaxWidth) : ""
            )}
            style={textPanelStyle}
          >
            {heroEyebrow ? (
              <p className={cn("text-sm tracking-wide", textLight ? "text-zinc-200" : "text-zinc-700")} style={bodyStyle}>
                {heroEyebrow}
              </p>
            ) : null}
            <h1
              className={cn("max-w-4xl font-semibold tracking-tight", headingClass, textLight ? "text-zinc-100" : "text-zinc-900")}
              style={headingStyle}
            >
              {heroTitle}
            </h1>
            {heroSubtitle ? (
              <p className={cn("max-w-3xl leading-relaxed", bodyClass, textLight ? "text-zinc-200" : "text-zinc-700")} style={bodyStyle}>
                {heroSubtitle}
              </p>
            ) : null}
            {heroCtas.length ? (
              <div className={cn("mt-2 flex flex-wrap gap-3", alignCenter ? "justify-center" : "justify-start")}>
                {heroCtas.slice(0, 2).map((cta, idx) => (
                  <a
                    key={String(cta?.label || idx)}
                    href={toHref(cta?.href)}
                    className={cn(
                      "inline-flex items-center rounded-md px-6 py-3 text-sm font-semibold transition",
                      idx === 0
                        ? "bg-zinc-50 text-zinc-900 hover:bg-zinc-100"
                        : textLight
                        ? "border border-zinc-300/50 bg-transparent text-zinc-100 hover:bg-zinc-900/30"
                        : "border border-zinc-400 bg-transparent text-zinc-900 hover:bg-zinc-100"
                    )}
                  >
                    {String(cta?.label || "Learn more")}
                  </a>
                ))}
              </div>
            ) : null}
            {slides.length > 1 ? (
              <div className={cn("mt-4 flex items-center gap-2", alignCenter ? "justify-center" : "justify-start")}>
                {slides.map((slide, index) => (
                  <button
                    key={String(slide?.src || index)}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={String(slide?.label || "Slide " + (index + 1))}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full border",
                      index === activeSlide
                        ? "border-zinc-50 bg-zinc-50"
                        : textLight
                        ? "border-zinc-200/70 bg-transparent"
                        : "border-zinc-600/50 bg-transparent"
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}