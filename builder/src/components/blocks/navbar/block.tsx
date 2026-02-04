"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/atoms/button";
import {
  BaseBlockProps,
  LinkProps,
  backgroundMediaStyle,
  backgroundOverlayStyle,
  backgroundVideoSource,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";

export type NavbarLink = {
  label: string;
  href: string;
  children?: NavbarLink[];
};

export type NavbarProps = BaseBlockProps & {
  logo?: { src?: string; alt?: string };
  links: NavbarLink[];
  ctas?: LinkProps[];
  sticky?: boolean;
};

export type NavbarVariant = "simple" | "withDropdown" | "withCTA";

export function NavbarBlock({
  id,
  anchor,
  paddingY = "sm",
  background = "none",
  backgroundMedia,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  maxWidth = "xl",
  headingFont,
  bodyFont,
  logo,
  links,
  ctas,
  sticky,
  variant = "simple",
}: NavbarProps & { variant?: NavbarVariant }) {
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
  const rootLabel = (logo?.alt || "Site").trim() || "Site";
  const showCtas = (variant === "withCTA" || variant === "simple") && (ctas?.length ?? 0) > 0;
  const showDropdowns = variant === "withDropdown";
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;
  const backgroundClass =
    background === "muted"
      ? "bg-muted"
      : background === "gradient"
        ? "bg-gradient-to-b from-background to-muted"
        : "bg-background";

  return (
    <header
      id={anchor}
      data-block="Navbar"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        "w-full border-b border-border/60",
        backgroundClass,
        paddingY === "sm" ? "py-3" : paddingY === "md" ? "py-4" : "py-6",
        sticky ? "sticky top-0 z-40" : "",
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
          "mx-auto flex items-center justify-between px-4 sm:px-6",
          maxWidthClass(maxWidth),
          hasBackgroundVideo ? "relative z-10" : ""
        )}
      >
        <div className="flex items-center gap-3">
          {logo?.src ? (
            <img src={logo.src} alt={logo.alt || "Logo"} className="h-8 w-auto" />
          ) : (
            <span className="text-base font-semibold" style={headingStyle}>
              {rootLabel}
            </span>
          )}
        </div>
        <nav className="hidden md:flex items-center gap-6" style={bodyStyle}>
          {links.slice(0, 8).map((link, index) => (
            <div key={index} className="flex flex-col">
              <a
                href={link.href}
                className="text-sm font-medium text-foreground hover-underline"
                style={bodyStyle}
              >
                {link.label}
              </a>
              {showDropdowns && link.children?.length ? (
                <div className="mt-2 flex flex-col text-xs text-muted-foreground" style={{ gap: "var(--space-1)" }}>
                  {link.children.slice(0, 6).map((child, childIndex) => (
                    <a
                      key={childIndex}
                      href={child.href}
                      className="text-xs text-muted-foreground"
                      style={bodyStyle}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        {showCtas ? (
          <div className="hidden md:flex items-center gap-3" style={bodyStyle}>
            {ctas?.slice(0, 2).map((cta, idx) => (
              <Button
                key={idx}
                asChild
                variant={cta.variant === "secondary" ? "secondary" : "default"}
                size="sm"
              >
                <a href={cta.href}>{cta.label}</a>
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
