"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/blocks/icon-map/icon";
import { useMotionMode } from "@/components/theme/motion";
import { useInViewReveal } from "@/lib/motion";

import {
  BaseBlockProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";
import { featureGridClass, featureGridSectionClass } from "./variants";

export type FeatureGridItem = {
  title: string;
  desc?: string;
  icon?: string;
};

export type FeatureGridProps = BaseBlockProps & {
  title?: string;
  subtitle?: string;
  items: FeatureGridItem[];
};

export type FeatureGridVariant = "2col" | "3col" | "4col";

export function FeatureGridBlock({
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
  title,
  subtitle,
  items,
  headingFont,
  bodyFont,
  variant = "3col",
}: FeatureGridProps & { variant?: FeatureGridVariant }) {
  const motionMode = useMotionMode();
  const reveal = useInViewReveal<HTMLDivElement>({
    preset: "stagger",
    once: true,
    enabled: motionMode !== "off",
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
  return (
    <section
      id={anchor}
      data-block="FeatureGrid"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        featureGridSectionClass({ paddingY, background }),
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
        {title || subtitle ? (
          <div className={cn("mb-10", align === "center" ? "text-center" : "text-left")}>
            {title ? (
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={headingStyle}>
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-3 text-base text-muted-foreground sm:text-lg" style={bodyStyle}>
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div ref={reveal.ref} className={featureGridClass({ variant })} style={{ gap: "var(--space-3)" }}>
          {items.slice(0, 12).map((it, idx) => (
            <Card
              key={idx}
              className={cn(
                "border-border bg-background/60",
                emphasis === "high" ? "card-glass hover-lift" : "",
                motionClass,
                reveal.className
              )}
              style={
                reveal.style
                  ? { ...reveal.style, transitionDelay: `${idx * 60}ms` }
                  : undefined
              }
            >
              <CardHeader className="space-y-3">
                {it.icon ? (
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                    <Icon name={it.icon} className="h-5 w-5" />
                  </div>
                ) : null}
                <CardTitle className="text-base" style={headingStyle}>
                  {it.title}
                </CardTitle>
              </CardHeader>
              {it.desc ? (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground" style={bodyStyle}>
                    {it.desc}
                  </p>
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
