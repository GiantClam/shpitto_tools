"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import {
  BaseBlockProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";
import { testimonialsGridClass, testimonialsSectionClass } from "./variants";

export type Testimonial = {
  quote: string;
  name: string;
  role?: string;
  avatar?: { src: string; alt: string };
};

export type TestimonialsGridProps = BaseBlockProps & {
  title?: string;
  items: Testimonial[];
};

export type TestimonialsVariant = "2col" | "3col";

export function TestimonialsGridBlock({
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
  items,
  headingFont,
  bodyFont,
  variant = "2col",
}: TestimonialsGridProps & { variant?: TestimonialsVariant }) {
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
      data-block="TestimonialsGrid"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        testimonialsSectionClass({ paddingY, background }),
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
        {title ? (
          <div className={cn("mb-10", align === "center" ? "text-center" : "text-left")}>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={headingStyle}>
              {title}
            </h2>
          </div>
        ) : null}

        <div className={testimonialsGridClass({ variant })} style={{ gap: "var(--space-3)" }}>
          {items.slice(0, 6).map((item, idx) => (
            <Card
              key={idx}
              className={cn(
                "border-border bg-background/60",
                emphasis === "high" ? "card-glass hover-lift" : ""
              )}
            >
              <CardHeader className="flex items-center" style={{ gap: "var(--space-2)" }}>
                {item.avatar ? (
                  <img
                    src={item.avatar.src}
                    alt={item.avatar.alt}
                    className="h-10 w-10 rounded-full"
                  />
                ) : null}
                <div>
                  <div className="text-sm font-medium text-foreground" style={headingStyle}>
                    {item.name}
                  </div>
                  {item.role ? (
                    <div className="text-xs text-muted-foreground" style={bodyStyle}>
                      {item.role}
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground" style={bodyStyle}>
                  {item.quote}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
