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

  const textOrderClass = mediaPosition === "left" ? "md:order-2" : "md:order-1";
  const mediaOrderClass = mediaPosition === "left" ? "md:order-1" : "md:order-2";

  return (
    <section
      id={anchor}
      data-block="HeroSplit"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(heroSplitClass({ paddingY, background }), "relative overflow-hidden")}
      style={backgroundStyle}
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
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
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
          </div>
          {media?.src ? (
            <div
              className={cn(mediaOrderClass, motionMode !== "off" ? "will-change-transform" : "")}
              style={parallax.style}
            >
              {media.kind === "video" ? (
                <video
                  src={media.src}
                  controls
                  className="w-full rounded-[calc(var(--radius)+6px)] border border-border shadow-sm"
                />
              ) : (
                <img
                  src={media.src}
                  alt={media.alt ?? ""}
                  className="w-full rounded-[calc(var(--radius)+6px)] border border-border shadow-sm"
                  loading="lazy"
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
