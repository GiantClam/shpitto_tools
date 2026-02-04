"use client";

import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/cn";

import {
  BaseBlockProps,
  LinkProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";
import { HeroBackdrop } from "@/components/blocks/motion";
import { useMotionMode } from "@/components/theme/motion";
import { heroCenteredClass } from "./variants";

export type HeroCenteredProps = BaseBlockProps & {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctas: LinkProps[];
  media?: { kind: "image" | "video"; src: string; alt?: string };
  badges?: { text: string }[];
  headingSize?: "sm" | "md" | "lg";
  bodySize?: "sm" | "md" | "lg";
};

export function HeroCenteredBlock({
  id,
  anchor,
  align = "center",
  ctas,
  title,
  subtitle,
  eyebrow,
  media,
  badges,
  paddingY = "lg",
  background = "none",
  backgroundMedia,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  maxWidth = "xl",
  emphasis = "normal",
  headingFont,
  bodyFont,
  headingSize,
  bodySize,
  variant,
}: HeroCenteredProps & { variant?: "textOnly" | "withMedia" | "withBadges" }) {
  const hasMedia = Boolean(media);
  const hasBadges = Boolean(badges?.length);
  const motionMode = useMotionMode();
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

  return (
    <section
      id={anchor}
      data-block="HeroCentered"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        heroCenteredClass({ paddingY, background }),
        "relative overflow-hidden"
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
      {emphasis === "high" && motionMode !== "off" ? <HeroBackdrop /> : null}
      <div className={cn("mx-auto px-4 sm:px-6 relative z-10", maxWidthClass(maxWidth))}>
        <div className={cn(align === "center" ? "text-center" : "text-left")}>
          {eyebrow ? (
            <p className="text-sm text-muted-foreground" style={bodyStyle}>
              {eyebrow}
            </p>
          ) : null}

          <h1
            className={cn(
              "mt-3 font-semibold tracking-tight",
              headingClass,
              emphasis === "high" && "sm:text-6xl",
              headingEffect
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

          {hasBadges ? (
            <div
              className={cn(
                "mt-6 flex flex-wrap gap-2",
                align === "center" ? "justify-center" : "justify-start"
              )}
            >
              {badges?.slice(0, 6).map((badge, index) => (
                <span
                  key={index}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  style={bodyStyle}
                >
                  {badge.text}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {hasMedia ? (
          <div className="mt-10">
            {media?.kind === "image" ? (
              <img
                src={media.src}
                alt={media.alt ?? ""}
                className="w-full rounded-[calc(var(--radius)+4px)] border border-border shadow-sm"
                loading="lazy"
              />
            ) : (
              <video
                src={media?.src}
                controls
                className="w-full rounded-[calc(var(--radius)+4px)] border border-border shadow-sm"
              />
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
