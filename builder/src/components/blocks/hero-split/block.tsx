"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/atoms/button";
import { useMotionMode } from "@/components/theme/motion";
import { useParallaxY } from "@/lib/motion";
import {
  BaseBlockProps,
  LinkProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";
import { heroSplitClass } from "./variants";

export type HeroSplitProps = BaseBlockProps & {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctas: LinkProps[];
  media?: { kind: "image" | "video"; src: string; alt?: string };
  heroSlides?: Array<{
    src: string;
    mobileSrc?: string;
    alt?: string;
    label?: string;
  }>;
  heroCarouselAutoplayMs?: number;
  mediaPosition?: "left" | "right";
  headingSize?: "sm" | "md" | "lg";
  bodySize?: "sm" | "md" | "lg";
};

export function HeroSplitBlock({
  id,
  anchor,
  paddingY = "lg",
  background = "none",
  backgroundMedia,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  align = "left",
  maxWidth = "xl",
  emphasis = "normal",
  eyebrow,
  title,
  subtitle,
  ctas,
  media,
  heroSlides = [],
  heroCarouselAutoplayMs = 4500,
  mediaPosition = "right",
  headingFont,
  bodyFont,
  headingSize,
  bodySize,
  variant,
}: HeroSplitProps & { variant?: "image" | "video" | "screenshot" }) {
  const motionMode = useMotionMode();
  const parallax = useParallaxY({
    enabled: motionMode !== "off",
    intensity: 0.18,
    clamp: 90,
  });
  const motionClass =
    motionMode === "off"
      ? ""
      : "transition-all duration-300 hover:-translate-y-1 hover:shadow-md";
  const backgroundStyle = {
    ...(backgroundMediaStyle(background, backgroundMedia) || {}),
    ...(backgroundGradientStyle(background, backgroundGradient) || {}),
  };
  const overlayStyle = backgroundOverlayStyle(
    backgroundOverlay,
    backgroundOverlayOpacity,
    backgroundBlur
  );
  const backgroundVideo = backgroundVideoSource(background, backgroundMedia);
  const hasBackgroundVideo = Boolean(backgroundVideo?.src);
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;
  const headingClass =
    headingSize === "sm"
      ? "text-3xl sm:text-4xl"
      : headingSize === "lg"
      ? "text-5xl sm:text-6xl"
      : "text-4xl sm:text-5xl";
  const headingEffect = emphasis === "high" ? "text-gradient" : "";
  const bodyClass =
    bodySize === "sm" ? "text-sm sm:text-base" : bodySize === "lg" ? "text-lg sm:text-xl" : "text-base sm:text-lg";
  const slides = React.useMemo(
    () =>
      (Array.isArray(heroSlides) ? heroSlides : []).filter(
        (slide) => typeof slide?.src === "string" && slide.src.trim().length > 0
      ),
    [heroSlides]
  );
  const [activeSlide, setActiveSlide] = React.useState(0);
  React.useEffect(() => {
    setActiveSlide(0);
  }, [slides.length]);
  React.useEffect(() => {
    if (slides.length < 2) return;
    const intervalMs = Number(heroCarouselAutoplayMs) > 1200 ? Number(heroCarouselAutoplayMs) : 4500;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [slides.length, heroCarouselAutoplayMs]);
  const currentSlide = slides[activeSlide] || null;
  const resolvedMedia =
    currentSlide?.src && media?.kind !== "video"
      ? { kind: "image" as const, src: currentSlide.src, alt: currentSlide.alt || media?.alt || "" }
      : media;
  const hasMedia = Boolean(resolvedMedia?.src);
  const dynamicBackgroundStyle =
    !hasMedia && currentSlide?.src
      ? {
          backgroundImage: `url(${currentSlide.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : undefined;

  const textOrderClass = mediaPosition === "left" ? "md:order-2" : "md:order-1";
  const mediaOrderClass = mediaPosition === "left" ? "md:order-1" : "md:order-2";

  return (
    <section
      id={anchor}
      data-block="HeroSplit"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(heroSplitClass({ paddingY, background }), "relative overflow-hidden")}
      style={{ ...backgroundStyle, ...(dynamicBackgroundStyle || {}) }}
    >
      {hasBackgroundVideo ? (
        <video
          src={backgroundVideo?.src}
          poster={backgroundVideo?.poster}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : null}
      {overlayStyle ? (
        <div className="absolute inset-0" style={{ ...overlayStyle, zIndex: 1 }} />
      ) : null}
      <div className={cn("mx-auto px-4 sm:px-6 relative z-10", maxWidthClass(maxWidth))}>
        <div className={cn("grid gap-8", hasMedia ? "md:grid-cols-2 md:items-center" : "")}>
          <div className={cn(textOrderClass, align === "center" ? "text-center" : "text-left")}>
            {eyebrow ? (
              <p className="text-sm text-muted-foreground" style={bodyStyle}>
                {eyebrow}
              </p>
            ) : null}
            <h1
              className={cn(
                "mt-3 font-semibold tracking-tight",
                headingClass,
                headingEffect,
                motionMode !== "off" ? "animate-in fade-in slide-in-from-bottom-2" : ""
              )}
              style={headingStyle}
            >
              {title}
            </h1>
            {subtitle ? (
              <p className={cn("mt-4 text-muted-foreground", bodyClass)} style={bodyStyle}>
                {subtitle}
              </p>
            ) : null}
            <div
              className={cn(
                "mt-6 flex flex-wrap gap-4",
                align === "center" ? "justify-center" : "justify-start"
              )}
            >
              {ctas?.slice(0, 2).map((cta, idx) => (
                <Button
                  key={cta.label}
                  asChild
                  variant={cta.variant === "secondary" ? "secondary" : "default"}
                  className={cn(motionClass, emphasis === "high" && idx === 0 ? "btn-glow" : "")}
                  size="lg"
                >
                  <a href={cta.href}>{cta.label}</a>
                </Button>
              ))}
            </div>
            {!hasMedia && slides.length > 1 ? (
              <div className={cn("mt-5 flex flex-wrap items-center gap-2", align === "center" ? "justify-center" : "justify-start")}>
                {slides.map((slide, index) => (
                  <button
                    key={`${slide.src}-${index}`}
                    type="button"
                    aria-label={slide.label || `Slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full border transition",
                      index === activeSlide ? "border-primary bg-primary" : "border-border bg-transparent"
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
          {resolvedMedia?.src ? (
            <div
              className={cn(mediaOrderClass, motionMode !== "off" ? "will-change-transform" : "")}
              style={parallax.style}
            >
              {resolvedMedia.kind === "video" ? (
                <video
                  src={resolvedMedia.src}
                  controls
                  className="w-full rounded-[calc(var(--radius)+6px)] border border-border shadow-sm"
                />
              ) : (
                <>
                  <img
                    src={resolvedMedia.src}
                    alt={resolvedMedia.alt ?? ""}
                    className="w-full rounded-[calc(var(--radius)+6px)] border border-border shadow-sm"
                    loading="lazy"
                  />
                  {slides.length > 1 ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {slides.map((slide, index) => (
                        <button
                          key={`${slide.src}-${index}`}
                          type="button"
                          aria-label={slide.label || `Slide ${index + 1}`}
                          onClick={() => setActiveSlide(index)}
                          className={cn(
                            "h-2.5 w-2.5 rounded-full border transition",
                            index === activeSlide
                              ? "border-primary bg-primary"
                              : "border-border bg-transparent"
                          )}
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
