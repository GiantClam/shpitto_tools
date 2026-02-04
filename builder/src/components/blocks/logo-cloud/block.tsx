"use client";

import React from "react";
import { cn } from "@/lib/cn";
import {
  BaseBlockProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";
import { useMotionMode } from "@/components/theme/motion";
import { logoCloudSectionClass, logoGridClass } from "./variants";

export type LogoItem = { src: string; alt: string };

export type LogoCloudProps = BaseBlockProps & {
  title?: string;
  logos: LogoItem[];
};

export type LogoCloudVariant = "grid" | "marquee";

export function LogoCloudBlock({
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
  logos,
  emphasis = "normal",
  variant = "grid",
}: LogoCloudProps & { variant?: LogoCloudVariant }) {
  const motionMode = useMotionMode();
  const marqueeEnabled = variant === "marquee" && motionMode !== "off";
  const items = marqueeEnabled ? [...logos, ...logos] : logos;
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
      data-block="LogoCloud"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        logoCloudSectionClass({ paddingY, background }),
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
          <p
            className={cn(
              "mb-6 text-center text-sm text-muted-foreground",
              emphasis === "high" ? "text-gradient" : ""
            )}
          >
            {title}
          </p>
        ) : null}
        <div className={cn(marqueeEnabled && "overflow-hidden")}>
          <div
            className={cn(
              "items-center",
              marqueeEnabled ? "flex gap-10 animate-marquee" : logoGridClass({ variant })
            )}
            style={{ gap: "var(--space-4)" }}
          >
            {items.slice(0, 20).map((logo, idx) => (
              <img
                key={idx}
                src={logo.src}
                alt={logo.alt}
                className={cn(
                  "h-8 w-auto opacity-70",
                  emphasis === "high" ? "hover-lift" : ""
                )}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
