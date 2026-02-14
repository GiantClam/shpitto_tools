"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { useMotionMode } from "@/components/theme/motion";
import { useInViewReveal } from "@/lib/motion";
import {
  BaseBlockProps,
  LinkProps,
  backgroundMediaStyle,
  backgroundOverlayStyle,
  backgroundVideoSource,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";

type CardImage = { src: string; alt?: string };

export type CardsGridItem = {
  title: string;
  subtitle?: string;
  description?: string;
  eyebrow?: string;
  tag?: string;
  meta?: string;
  price?: string;
  role?: string;
  image?: CardImage;
  imageSrc?: string;
  imageAlt?: string;
  cta?: LinkProps;
};

export type CardsGridProps = BaseBlockProps & {
  title?: string;
  subtitle?: string;
  items: CardsGridItem[];
  variant?: "product" | "person" | "media" | "imageText" | "poster";
  columns?: "2col" | "3col" | "4col";
  density?: "compact" | "normal" | "spacious";
  cardStyle?: "glass" | "solid" | "muted";
  imagePosition?: "top" | "left" | "right";
  imageSize?: "sm" | "md" | "lg";
  imageShape?: "square" | "rounded" | "circle";
  headingSize?: "sm" | "md" | "lg";
  bodySize?: "sm" | "md" | "lg";
  headingFont?: string;
  bodyFont?: string;
  textAlign?: "left" | "center";
  featureFirst?: boolean;
};

const sizeClass = (value?: "sm" | "md" | "lg") => {
  if (value === "sm") return "text-sm";
  if (value === "lg") return "text-xl";
  return "text-base";
};

const imageSizeClass = (value?: "sm" | "md" | "lg") => {
  if (value === "sm") return "h-20 w-20";
  if (value === "lg") return "h-36 w-36";
  return "h-28 w-28";
};

const imageShapeClass = (value?: "square" | "rounded" | "circle") => {
  if (value === "circle") return "rounded-full";
  if (value === "square") return "rounded-none";
  return "rounded-xl";
};

const columnsClass = (value?: "2col" | "3col" | "4col") => {
  if (value === "2col") return "grid-cols-1 sm:grid-cols-2";
  if (value === "4col") return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
};

const densityGapClass = (value?: "compact" | "normal" | "spacious") => {
  if (value === "compact") return "gap-4";
  if (value === "spacious") return "gap-8";
  return "gap-6";
};

const cardStyleClass = (value?: "glass" | "solid" | "muted") => {
  if (value === "solid") return "border-border bg-card";
  if (value === "muted") return "border-border bg-muted/60";
  return "border-border bg-background/60";
};

export function CardsGridBlock({
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
  variant = "product",
  columns = "3col",
  density = "normal",
  cardStyle = "glass",
  imagePosition = "top",
  imageSize = "md",
  imageShape = "rounded",
  headingSize = "md",
  bodySize = "md",
  headingFont,
  bodyFont,
  textAlign,
  featureFirst = false,
}: CardsGridProps) {
  const motionMode = useMotionMode();
  const reveal = useInViewReveal<HTMLDivElement>({
    preset: "stagger",
    once: true,
    enabled: motionMode !== "off",
  });
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
  const computedTextAlign = textAlign ?? align;
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;
  const imageClass = cn("object-cover", imageShapeClass(imageShape));
  const visibleItems = items.slice(0, 12);
  const useFeatureRailLayout =
    variant === "imageText" && featureFirst && columns === "3col" && visibleItems.length === 3;

  return (
    <section
      id={anchor}
      data-block="CardsGrid"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        "w-full",
        paddingY === "sm" ? "py-8" : paddingY === "md" ? "py-12" : "py-20",
        background === "muted" ? "bg-muted" : background === "gradient" ? "bg-gradient-to-b from-background to-muted" : "bg-background",
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
          "mx-auto px-4 sm:px-6 relative z-10",
          maxWidthClass(maxWidth)
        )}
      >
        {title || subtitle ? (
          <div className={cn("mb-10", computedTextAlign === "center" ? "text-center" : "text-left")}>
            {title ? (
              <h2 className={cn("font-semibold tracking-tight", sizeClass(headingSize))} style={headingStyle}>
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className={cn("mt-3 text-muted-foreground", sizeClass(bodySize))} style={bodyStyle}>
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div
          ref={reveal.ref}
          className={cn(
            "grid",
            columnsClass(columns),
            densityGapClass(density),
            useFeatureRailLayout ? "lg:grid-rows-[1.15fr_0.85fr] lg:auto-rows-fr" : ""
          )}
        >
          {visibleItems.map((item, idx) => {
            const resolvedImage =
              item.image?.src || item.imageSrc
                ? {
                    src: item.image?.src || item.imageSrc || "",
                    alt: item.image?.alt || item.imageAlt || item.title,
                  }
                : null;
            const hasImage = Boolean(resolvedImage?.src);
            const isHorizontal = imagePosition === "left" || imagePosition === "right";
            const isFeatureCard = useFeatureRailLayout && idx === 0;
            const isRailTopCard = useFeatureRailLayout && idx === 1;
            const isRailBottomCard = useFeatureRailLayout && idx === 2;
            const isRailCard = isRailTopCard || isRailBottomCard;
            const useRailImageOverlay = isRailCard && hasImage && variant === "imageText";
            return (
              <Card
                key={idx}
                className={cn(
                  cardStyleClass(cardStyle),
                  isFeatureCard ? "sm:col-span-2 lg:col-span-2 lg:row-span-2 overflow-hidden p-0 lg:min-h-[31rem]" : "",
                  isRailTopCard ? "overflow-hidden lg:col-start-3 lg:row-start-1 lg:min-h-[16rem]" : "",
                  isRailBottomCard ? "overflow-hidden lg:col-start-3 lg:row-start-2 lg:min-h-[12rem]" : "",
                  !useFeatureRailLayout && featureFirst && idx === 0 && variant === "imageText" && columns === "3col"
                    ? "sm:col-span-2 lg:col-span-2"
                    : "",
                  cardStyle === "glass" ? "card-glass" : "",
                  emphasis === "high" ? "hover-lift" : "",
                  reveal.className
                )}
                style={
                  reveal.style
                    ? { ...reveal.style, transitionDelay: `${idx * 60}ms` }
                    : undefined
                }
              >
                {isFeatureCard && hasImage ? (
                  <div className="relative h-full min-h-[20rem] sm:min-h-[24rem] lg:min-h-[31rem]">
                    <img
                      src={resolvedImage?.src}
                      alt={resolvedImage?.alt || item.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[linear-gradient(180deg,rgba(3,8,12,0.06)_0%,rgba(3,8,12,0.8)_44%,rgba(2,5,8,0.95)_100%)] p-5 sm:p-6">
                      {item.tag ? (
                        <p className="text-xs uppercase tracking-[0.16em] text-primary">{item.tag}</p>
                      ) : null}
                      <h3 className="mt-2 text-xl font-semibold text-white" style={headingStyle}>
                        {item.title}
                      </h3>
                      {item.description ? (
                        <p className={cn("mt-2 text-sm text-white/70", sizeClass(bodySize))} style={bodyStyle}>
                          {item.description}
                        </p>
                      ) : null}
                      {item.cta ? (
                        <a href={item.cta.href} className="mt-4 inline-block text-sm font-medium text-primary">
                          {item.cta.label}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : useRailImageOverlay ? (
                  <div className="relative h-full min-h-[12rem]">
                    <img
                      src={resolvedImage?.src}
                      alt={resolvedImage?.alt || item.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[linear-gradient(180deg,rgba(3,8,12,0.08)_0%,rgba(3,8,12,0.82)_48%,rgba(2,5,8,0.95)_100%)] p-4">
                      <h3 className="text-base font-semibold text-white" style={headingStyle}>
                        {item.title}
                      </h3>
                      {item.description ? (
                        <p className={cn("mt-1 text-xs text-white/70", sizeClass(bodySize))} style={bodyStyle}>
                          {item.description}
                        </p>
                      ) : null}
                      {item.cta ? (
                        <a href={item.cta.href} className="mt-2 inline-block text-xs font-medium text-primary">
                          {item.cta.label}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      isHorizontal ? "flex gap-4 p-4" : "",
                      isRailCard && hasImage ? "grid h-full grid-rows-[minmax(8.5rem,1fr)_auto]" : ""
                    )}
                  >
                    {hasImage ? (
                      <div
                        className={cn(
                          isHorizontal ? "shrink-0" : "",
                          imagePosition === "right" && "order-2",
                          isRailCard ? "row-start-1 h-full overflow-hidden" : ""
                        )}
                      >
                        <img
                          src={resolvedImage?.src}
                          alt={resolvedImage?.alt || item.title}
                          className={cn(
                          imageClass,
                          isHorizontal
                            ? imageSizeClass(imageSize)
                            : isRailCard
                                ? "h-full min-h-[8.5rem] w-full"
                                : "h-44 w-full",
                          variant === "poster" ? "h-52" : ""
                        )}
                      />
                    </div>
                    ) : null}
                    <div className={cn(isHorizontal ? "flex-1" : "", isRailCard ? "row-start-2" : "")}>
                      <CardHeader className={cn(isHorizontal ? "px-0 pb-2" : "", isRailCard ? "pb-2" : "")}>
                        {item.tag ? (
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.tag}</p>
                        ) : null}
                        {item.eyebrow ? (
                          <p className="text-xs text-muted-foreground">{item.eyebrow}</p>
                        ) : null}
                        <CardTitle
                          className={cn(sizeClass(headingSize))}
                          style={headingStyle}
                        >
                          {item.title}
                        </CardTitle>
                        {item.subtitle ? (
                          <p className={cn("text-muted-foreground", sizeClass(bodySize))} style={bodyStyle}>
                            {item.subtitle}
                          </p>
                        ) : null}
                        {item.role ? (
                          <p className="text-xs text-muted-foreground">{item.role}</p>
                        ) : null}
                        {item.price ? (
                          <p className="text-base font-semibold">{item.price}</p>
                        ) : null}
                      </CardHeader>
                      {item.description ? (
                        <CardContent className={cn(isHorizontal ? "px-0" : "")}>
                          <p className={cn("text-muted-foreground", sizeClass(bodySize))} style={bodyStyle}>
                            {item.description}
                          </p>
                          {item.meta ? (
                            <p className="mt-2 text-xs text-muted-foreground">{item.meta}</p>
                          ) : null}
                          {item.cta ? (
                            <a
                              href={item.cta.href}
                              className="mt-3 inline-block text-sm text-primary"
                            >
                              {item.cta.label}
                            </a>
                          ) : null}
                        </CardContent>
                      ) : null}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
