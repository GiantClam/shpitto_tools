"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import {
  BaseBlockProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";
import { caseStudiesGridClass, caseStudiesSectionClass } from "./variants";

export type CaseStudy = {
  title: string;
  summary?: string;
  href: string;
  cover?: { src: string; alt: string };
  tags?: string[];
};

export type CaseStudiesProps = BaseBlockProps & {
  title?: string;
  items: CaseStudy[];
};

export type CaseStudiesVariant = "cards" | "list";

export function CaseStudiesBlock({
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
  title,
  items,
  emphasis = "normal",
  variant = "cards",
}: CaseStudiesProps & { variant?: CaseStudiesVariant }) {
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
      data-block="CaseStudies"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        caseStudiesSectionClass({ paddingY, background }),
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
            <h2
              className={cn(
                "text-2xl font-semibold tracking-tight sm:text-3xl",
                emphasis === "high" ? "text-gradient" : ""
              )}
            >
              {title}
            </h2>
          </div>
        ) : null}

        <div className={caseStudiesGridClass({ variant })}>
          {items.slice(0, 6).map((item, idx) => (
            <Card
              key={idx}
              className={cn(
                "border-border bg-background/60",
                emphasis === "high" ? "card-glass hover-lift" : ""
              )}
            >
              {item.cover ? (
                <img
                  src={item.cover.src}
                  alt={item.cover.alt}
                  className="h-40 w-full rounded-t-[calc(var(--radius)+2px)] object-cover"
                />
              ) : null}
              <CardHeader className="space-y-2">
                <CardTitle className="text-base">{item.title}</CardTitle>
                {item.tags?.length ? (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {item.tags.slice(0, 4).map((tag, tagIdx) => (
                      <span key={tagIdx} className="rounded-full border border-border px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </CardHeader>
              {item.summary ? (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.summary}</p>
                  <a
                    href={item.href}
                    className={cn(
                      "mt-3 inline-block text-sm text-primary",
                      emphasis === "high" ? "hover-underline" : ""
                    )}
                  >
                    Read more
                  </a>
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
