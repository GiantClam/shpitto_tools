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
  logo?: { src?: string; alt?: string } | string;
  links: NavbarLink[];
  ctas?: LinkProps[];
  sticky?: boolean;
  surfaceTone?: "default" | "dark";
  referenceSliceMode?: boolean;
  referenceSliceMinHeight?: number;
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
  surfaceTone = "default",
  referenceSliceMode = false,
  referenceSliceMinHeight,
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
  const logoObject = typeof logo === "object" && logo ? logo : null;
  const logoText = typeof logo === "string" ? logo : logoObject?.alt;
  const rootLabel = (logoText || "Site").trim() || "Site";
  const showCtas = (variant === "withCTA" || variant === "simple") && (ctas?.length ?? 0) > 0;
  const showDropdowns = variant === "withDropdown";
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;
  const isDarkSurface = surfaceTone === "dark";
  const rootTextClass = isDarkSurface ? "text-zinc-100" : "text-foreground";
  const mutedTextClass = isDarkSurface ? "text-zinc-300" : "text-muted-foreground";
  const navLinkClass = isDarkSurface
    ? "text-[11px] font-medium uppercase tracking-[0.08em] hover-underline text-zinc-100/90"
    : "text-sm font-medium hover-underline text-foreground";
  const dropdownPanelClass = isDarkSurface
    ? "border-zinc-700/80 bg-zinc-900/95 text-zinc-200 shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
    : "border-border/70 bg-background/95 text-foreground shadow-[0_12px_24px_rgba(15,23,42,0.18)]";
  const dropdownLinkClass = isDarkSurface
    ? "text-zinc-200/90 hover:text-zinc-50"
    : "text-foreground/85 hover:text-foreground";
  const backgroundClass =
    background === "muted"
      ? "bg-muted"
      : background === "gradient"
        ? "bg-gradient-to-b from-background to-muted"
        : "bg-background";
  const explicitReferenceSliceMinHeight = Math.round(Number(referenceSliceMinHeight) || 0);
  const fallbackReferenceSliceHeight = referenceSliceMode &&
    background === "image" &&
    backgroundMedia?.kind === "image" &&
    backgroundMedia?.src
      ? 56
      : 0;
  const referenceSliceHeight = Math.max(explicitReferenceSliceMinHeight, fallbackReferenceSliceHeight);
  const referenceSliceStyle =
    referenceSliceHeight > 0
      ? { minHeight: `${Math.max(40, referenceSliceHeight)}px` }
      : undefined;

  return (
    <header
      id={anchor}
      data-block="Navbar"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        "w-full border-b",
        isDarkSurface ? "border-zinc-700/60" : "border-border/60",
        backgroundClass,
        paddingY === "sm" ? (isDarkSurface ? "py-2.5" : "py-3") : paddingY === "md" ? "py-4" : "py-6",
        sticky ? "sticky top-0 z-40" : "",
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
          "mx-auto flex items-center px-4 sm:px-6",
          showCtas ? "justify-between" : "justify-start",
          maxWidthClass(maxWidth),
          hasBackgroundVideo ? "relative z-10" : ""
        )}
      >
        <div className="flex items-center gap-3">
          {logoObject?.src ? (
            <img src={logoObject.src} alt={logoObject.alt || "Logo"} className="h-8 w-auto" />
          ) : (
            <span className={cn("text-base font-semibold", rootTextClass)} style={headingStyle}>
              {rootLabel}
            </span>
          )}
        </div>
        <nav className={cn("hidden md:flex items-center", showCtas ? "gap-6" : "ml-10 gap-7")} style={bodyStyle}>
          {links.slice(0, 8).map((link, index) => {
            const children = Array.isArray(link.children) ? link.children.slice(0, 8) : [];
            const hasDropdown = showDropdowns && children.length > 0;
            return (
              <div key={index} className={cn("relative", hasDropdown ? "group" : "")}>
                <a
                  href={link.href}
                  className={cn(navLinkClass, hasDropdown ? "inline-flex items-center gap-1" : "")}
                  style={bodyStyle}
                >
                  {link.label}
                </a>
                {hasDropdown ? (
                  <div
                    className={cn(
                      "pointer-events-none absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-md border p-3 opacity-0 translate-y-1 transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0",
                      dropdownPanelClass
                    )}
                    style={bodyStyle}
                  >
                    <div className="flex flex-col gap-2">
                      {children.map((child, childIndex) => (
                        <a
                          key={childIndex}
                          href={child.href}
                          className={cn("text-xs", dropdownLinkClass)}
                          style={bodyStyle}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
        {showCtas ? (
          <div className="hidden md:flex items-center gap-3 ml-auto" style={bodyStyle}>
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
