"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import {
  BaseBlockProps,
  LinkProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";
import { leadCaptureSectionClass } from "./variants";

export type LeadCaptureCTAProps = BaseBlockProps & {
  title: string;
  subtitle?: string;
  cta?: LinkProps | null;
  note?: string;
  titleColor?: string;
  titleClassName?: string;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  ctaClassName?: string;
  referenceSliceMode?: boolean;
  referenceSliceMinHeight?: number;
};

export type LeadCaptureVariant = "banner" | "card";

export function LeadCaptureCTABlock({
  id,
  anchor,
  paddingY = "lg",
  background = "none",
  backgroundMedia,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  maxWidth = "xl",
  title,
  subtitle,
  cta,
  note,
  titleColor,
  titleClassName,
  ctaBackgroundColor,
  ctaTextColor,
  ctaClassName,
  referenceSliceMode = false,
  referenceSliceMinHeight,
  emphasis = "normal",
  variant = "banner",
}: LeadCaptureCTAProps & { variant?: LeadCaptureVariant }) {
  const resolvedCta: LinkProps = {
    label: String(cta?.label || "").trim() || "Contact",
    href: String(cta?.href || "").trim() || "#contact",
    variant: cta?.variant === "secondary" ? "secondary" : cta?.variant === "link" ? "link" : "primary",
  };

  const shouldUseGradientTitle = emphasis === "high" && !titleColor && !titleClassName;
  const content = (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2
          className={cn(
            "text-2xl font-semibold tracking-tight sm:text-3xl",
            shouldUseGradientTitle ? "text-gradient" : "",
            titleClassName
          )}
          style={titleColor ? { color: titleColor } : undefined}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">{subtitle}</p>
        ) : null}
        {note ? <p className="mt-2 text-xs text-muted-foreground">{note}</p> : null}
      </div>
      <Button
        asChild
        variant={resolvedCta.variant === "secondary" ? "secondary" : "default"}
        className={cn(emphasis === "high" ? "btn-glow" : "", ctaClassName)}
        style={
          ctaBackgroundColor || ctaTextColor
            ? {
                backgroundColor: ctaBackgroundColor || undefined,
                color: ctaTextColor || undefined,
              }
            : undefined
        }
        size="lg"
      >
        <a href={resolvedCta.href}>{resolvedCta.label}</a>
      </Button>
    </div>
  );

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
  const explicitReferenceSliceMinHeight = Math.round(Number(referenceSliceMinHeight) || 0);
  const fallbackReferenceSliceHeight = referenceSliceMode &&
    background === "image" &&
    backgroundMedia?.kind === "image" &&
    backgroundMedia?.src
      ? 260
      : 0;
  const referenceSliceHeight = Math.max(explicitReferenceSliceMinHeight, fallbackReferenceSliceHeight);
  const referenceSliceStyle =
    referenceSliceHeight > 0
      ? { minHeight: `${Math.max(96, referenceSliceHeight)}px` }
      : undefined;

  return (
    <section
      id={anchor}
      data-block="LeadCaptureCTA"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        leadCaptureSectionClass({ paddingY, background }),
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
        {variant === "card" ? (
          <Card
            className={cn(
              "border-border bg-background/60 p-6",
              emphasis === "high" ? "card-glass hover-lift" : ""
            )}
          >
            {content}
          </Card>
        ) : (
          content
        )}
      </div>
    </section>
  );
}
