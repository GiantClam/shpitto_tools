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
  cta: LinkProps;
  note?: string;
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
  emphasis = "normal",
  variant = "banner",
}: LeadCaptureCTAProps & { variant?: LeadCaptureVariant }) {
  const content = (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2
          className={cn(
            "text-2xl font-semibold tracking-tight sm:text-3xl",
            emphasis === "high" ? "text-gradient" : ""
          )}
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
        variant={cta.variant === "secondary" ? "secondary" : "default"}
        className={cn(emphasis === "high" ? "btn-glow" : "")}
        size="lg"
      >
        <a href={cta.href}>{cta.label}</a>
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
