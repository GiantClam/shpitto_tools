"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/atoms/button";
import {
  BaseBlockProps,
  LinkProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";
import { useMotionMode } from "@/components/theme/motion";
import { featureWithMediaSectionClass } from "./variants";

type FeatureWithMediaItem = {
  title: string;
  desc?: string;
};

type FeatureWithMediaMedia = {
  kind: "image" | "video";
  src: string;
  alt?: string;
};

export type FeatureWithMediaProps = BaseBlockProps & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  contentTone?: "default" | "light";
  textPanel?: boolean;
  textPanelBackground?: string;
  textPanelBorderColor?: string;
  textPanelPadding?: "sm" | "md" | "lg";
  textPanelRadius?: "sm" | "md" | "lg";
  textPanelMaxWidth?: "sm" | "md" | "lg" | "xl";
  ctas?: LinkProps[];
  items?: FeatureWithMediaItem[];
  media?: FeatureWithMediaMedia;
  mediaSrc?: string;
  mediaAlt?: string;
  mediaKind?: "image" | "video";
  referenceSliceMode?: boolean;
  referenceSliceMinHeight?: number;
};

export type FeatureWithMediaVariant = "simple" | "split" | "reverse";

export function FeatureWithMediaBlock({
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
  eyebrow,
  title,
  subtitle,
  body,
  contentTone = "default",
  textPanel = false,
  textPanelBackground = "",
  textPanelBorderColor = "",
  textPanelPadding = "md",
  textPanelRadius = "md",
  textPanelMaxWidth = "lg",
  ctas,
  items,
  media,
  mediaSrc,
  mediaAlt,
  mediaKind = "image",
  referenceSliceMode = false,
  referenceSliceMinHeight,
  headingFont,
  bodyFont,
  emphasis = "normal",
  variant = "split",
}: FeatureWithMediaProps & { variant?: FeatureWithMediaVariant }) {
  const motionMode = useMotionMode();
  const motionClass =
    motionMode === "off" ? "" : "transition-all duration-300 hover:-translate-y-1 hover:shadow-md";
  const resolvedMedia =
    media ?? (mediaSrc ? { kind: mediaKind, src: mediaSrc, alt: mediaAlt } : undefined);
  const hasMedia = Boolean(resolvedMedia?.src);
  const derivedTitle =
    title ??
    (anchor
      ? anchor.length <= 3
        ? anchor.toUpperCase()
        : anchor
            .replace(/-/g, " ")
            .replace(/\b\w/g, (match) => match.toUpperCase())
      : undefined);
  const layoutClass =
    variant === "simple" || !hasMedia
      ? "flex flex-col"
      : "grid md:grid-cols-2 md:items-center";
  const textOrderClass = variant === "reverse" ? "md:order-2" : "md:order-1";
  const mediaOrderClass = variant === "reverse" ? "md:order-1" : "md:order-2";
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
  const isLightTone = contentTone === "light";
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;
  const textPanelPaddingClass =
    textPanelPadding === "sm" ? "p-4 sm:p-5" : textPanelPadding === "lg" ? "p-7 sm:p-8" : "p-5 sm:p-6";
  const textPanelRadiusClass =
    textPanelRadius === "sm" ? "rounded-lg" : textPanelRadius === "lg" ? "rounded-2xl" : "rounded-xl";
  const textPanelMaxWidthClass =
    textPanelMaxWidth === "sm"
      ? "max-w-xl"
      : textPanelMaxWidth === "md"
      ? "max-w-2xl"
      : textPanelMaxWidth === "lg"
      ? "max-w-3xl"
      : "max-w-4xl";
  const textPanelStyle =
    textPanel || textPanelBackground
      ? {
          background: textPanelBackground || (isLightTone ? "rgba(9, 14, 26, 0.46)" : "rgba(255, 255, 255, 0.62)"),
          border: `1px solid ${textPanelBorderColor || (isLightTone ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.12)")}`,
          backdropFilter: "blur(2px)",
        }
      : undefined;
  const explicitReferenceSliceMinHeight = Math.round(Number(referenceSliceMinHeight) || 0);
  const fallbackReferenceSliceHeight = referenceSliceMode &&
    background === "image" &&
    backgroundMedia?.kind === "image" &&
    backgroundMedia?.src
      ? 420
      : 0;
  const referenceSliceHeight = Math.max(explicitReferenceSliceMinHeight, fallbackReferenceSliceHeight);
  const referenceSliceStyle =
    referenceSliceHeight > 0
      ? { minHeight: `${Math.max(120, referenceSliceHeight)}px` }
      : undefined;

  return (
    <section
      id={anchor}
      data-block="FeatureWithMedia"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        featureWithMediaSectionClass({ paddingY, background }),
        hasBackgroundVideo ? "relative overflow-hidden" : ""
      )}
      style={{ ...backgroundStyle, ...(referenceSliceStyle || {}) }}
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
      <div
        className={cn(
          "mx-auto px-4 sm:px-6",
          maxWidthClass(maxWidth),
          hasBackgroundVideo ? "relative z-10" : ""
        )}
      >
        <div className={layoutClass} style={{ gap: "var(--space-4)" }}>
          <div
            className={cn(
              textOrderClass,
              align === "center" ? "text-center" : "text-left",
              isLightTone ? "text-white" : "",
              textPanel ? textPanelMaxWidthClass : ""
            )}
          >
            <div
              className={cn(textPanel ? `${textPanelPaddingClass} ${textPanelRadiusClass}` : "")}
              style={textPanelStyle}
            >
              {eyebrow ? (
                <p className={cn("text-sm", isLightTone ? "text-white/70" : "text-muted-foreground")} style={bodyStyle}>
                  {eyebrow}
                </p>
              ) : null}
              {derivedTitle ? (
                <h2
                  className={cn(
                    "mt-3 text-2xl font-semibold tracking-tight sm:text-3xl",
                    emphasis === "high" &&
                      !textPanel &&
                      !isLightTone &&
                      String(background || "").trim().toLowerCase() !== "image"
                      ? "text-gradient"
                      : "",
                    isLightTone ? "text-white" : ""
                  )}
                  style={headingStyle}
                >
                  {derivedTitle}
                </h2>
              ) : null}
              {subtitle ? (
                <p className={cn("mt-3 text-base sm:text-lg", isLightTone ? "text-white/90" : "text-muted-foreground")} style={bodyStyle}>
                  {subtitle}
                </p>
              ) : null}
              {body ? (
                <p className={cn("mt-4 text-base", isLightTone ? "text-white/90" : "text-muted-foreground")} style={bodyStyle}>
                  {body}
                </p>
              ) : null}
              {items?.length ? (
                <div className="mt-6 space-y-4">
                  {items.slice(0, 6).map((item, idx) => (
                    <div key={idx}>
                      <div className={cn("text-sm font-medium", isLightTone ? "text-white" : "")} style={headingStyle}>
                        {item.title}
                      </div>
                      {item.desc ? (
                        <p className={cn("mt-1 text-sm", isLightTone ? "text-white/85" : "text-muted-foreground")} style={bodyStyle}>
                          {item.desc}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
              {ctas?.length ? (
                <div
                  className={cn(
                    "mt-6 flex flex-wrap gap-4",
                    align === "center" ? "justify-center" : "justify-start"
                  )}
                >
                  {ctas.slice(0, 2).map((cta, idx) => (
                    <Button
                      key={idx}
                      asChild
                      variant={cta.variant === "secondary" ? "secondary" : "default"}
                      className={cn(emphasis === "high" && idx === 0 ? "btn-glow" : "")}
                      size="lg"
                    >
                      <a href={cta.href}>{cta.label}</a>
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {hasMedia ? (
            <div
              className={cn(
                mediaOrderClass,
                motionClass,
                emphasis === "high" ? "card-glass hover-lift" : ""
              )}
            >
              {resolvedMedia?.kind === "video" ? (
                <video
                  src={resolvedMedia.src}
                  controls
                  className="w-full rounded-[calc(var(--radius)+4px)] border border-border shadow-sm"
                />
              ) : (
                <img
                  src={resolvedMedia?.src}
                  alt={resolvedMedia?.alt ?? ""}
                  className="w-full rounded-[calc(var(--radius)+4px)] border border-border shadow-sm"
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
