"use client";

import React from "react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/cn";
import { BaseBlockProps, LinkProps, maxWidthClass } from "@/components/blocks/shared";

type NexusHeroDockProps = BaseBlockProps & {
  badge?: string;
  title: string;
  subtitle?: string;
  ctas?: LinkProps[];
  panelTag?: string;
  panelTitle?: string;
  panelSubtitle?: string;
  statValue?: string;
  statDelta?: string;
  heroImageSrc?: string;
  mobileHeroImageSrc?: string;
  heroImageAlt?: string;
  heroImageHeightScale?: number;
  heroSlides?: Array<{
    src: string;
    mobileSrc?: string;
    alt?: string;
    label?: string;
    panelTag?: string;
    panelTitle?: string;
    panelSubtitle?: string;
    statValue?: string;
    statDelta?: string;
  }>;
  heroCarouselAutoplayMs?: number;
  backgroundOverlay?: string;
  backgroundMedia?: { kind?: "image" | "video"; src?: string; alt?: string };
  media?: { kind?: "image" | "video"; src?: string; alt?: string };
  accentTone?: "gold" | "green";
};

export function NexusHeroDockBlock({
  id,
  anchor,
  maxWidth = "xl",
  title,
  subtitle,
  badge = "Release Orchestration",
  ctas = [],
  panelTag = "Live Rollout",
  panelTitle = "Release Velocity",
  panelSubtitle = "Ship with guardrails and measurable outcomes.",
  statValue = "+842%",
  statDelta = "quarterly lift",
  heroImageSrc,
  mobileHeroImageSrc,
  heroImageAlt = "Nexus hero visual",
  heroImageHeightScale = 1,
  heroSlides = [],
  heroCarouselAutoplayMs = 4500,
  backgroundOverlay,
  backgroundMedia,
  media,
  accentTone = "gold",
}: NexusHeroDockProps) {
  const slides = React.useMemo(
    () =>
      (Array.isArray(heroSlides) ? heroSlides : []).filter(
        (slide) => typeof slide?.src === "string" && slide.src.trim().length > 0
      ),
    [heroSlides]
  );
  const [activeSlide, setActiveSlide] = React.useState(0);
  React.useEffect(() => {
    setActiveSlide(0);
  }, [slides.length]);
  React.useEffect(() => {
    if (slides.length < 2) return;
    const intervalMs = Number(heroCarouselAutoplayMs) > 1200 ? Number(heroCarouselAutoplayMs) : 4500;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [slides.length, heroCarouselAutoplayMs]);

  const currentSlide = slides[activeSlide] || null;
  const resolvedImage = currentSlide?.src || heroImageSrc || media?.src || backgroundMedia?.src;
  const resolvedMobileImage = currentSlide?.mobileSrc || mobileHeroImageSrc || resolvedImage;
  const resolvedAlt = currentSlide?.alt || heroImageAlt || media?.alt || backgroundMedia?.alt || "Nexus hero visual";
  const resolvedPanelTag = currentSlide?.panelTag || panelTag;
  const resolvedPanelTitle = currentSlide?.panelTitle || panelTitle;
  const resolvedPanelSubtitle = currentSlide?.panelSubtitle || panelSubtitle;
  const resolvedStatValue = currentSlide?.statValue || statValue;
  const resolvedStatDelta = currentSlide?.statDelta || statDelta;
  const imageScale = Number.isFinite(heroImageHeightScale) ? Math.max(1, Math.min(3, heroImageHeightScale)) : 1;
  const desktopHeight = Math.round(320 * imageScale);
  const mobileHeight = Math.round(260 * imageScale);
  const primary = ctas[0] || { label: "Get Started", href: "#contact", variant: "primary" };
  const secondary = ctas[1] || { label: "View Docs", href: "#resources", variant: "secondary" };
  const isGreen = accentTone === "green";
  const heroBgClass = isGreen
    ? "bg-[radial-gradient(circle_at_80%_15%,rgba(0,255,0,0.24),transparent_36%),linear-gradient(180deg,#04090a_0%,#071012_54%,#05070b_100%)]"
    : "bg-[radial-gradient(circle_at_80%_15%,rgba(248,200,75,0.2),transparent_36%),linear-gradient(180deg,#050608_0%,#07090d_54%,#05070b_100%)]";
  const badgeClass = isGreen
    ? "border-[#1f3a2a] bg-[#0a1510] text-[#00ff00]"
    : "border-[#2a2f37] bg-[#0c0f14] text-[#d8dde5]";
  const primaryClass = isGreen
    ? "rounded-md bg-[#00ff00] px-7 text-[#001400] hover:bg-[#00ff00]"
    : "rounded-md bg-[#f8c84b] px-7 text-[#17120a] hover:bg-[#ffdd7a]";
  const statDeltaClass = isGreen
    ? "mb-2 rounded-md border border-[#1d5f1d] bg-[#0d1f15] px-3 py-1 text-sm text-[#00ff00]"
    : "mb-2 rounded-md border border-[#4a3e1b] bg-[#17130a] px-3 py-1 text-sm text-[#f8c84b]";
  const panelGlowClass = isGreen
    ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_12%,rgba(0,255,0,0.3),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(4,8,16,0.5)_100%)]"
    : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_12%,rgba(248,200,75,0.33),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(4,8,16,0.5)_100%)]";

  return (
    <section
      id={anchor}
      data-block="NexusHeroDock"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#1b2028] bg-[#040507] py-20 md:py-24"
    >
      <div className={cn("pointer-events-none absolute inset-0", heroBgClass)} />
      {resolvedImage ? (
        <>
          <img
            src={resolvedImage}
            alt={resolvedAlt}
            className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-24 mix-blend-screen md:block"
            loading="lazy"
          />
          <img
            src={resolvedMobileImage}
            alt={resolvedAlt}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-32 mix-blend-screen md:hidden"
            loading="lazy"
          />
        </>
      ) : null}
      {backgroundOverlay ? <div className="pointer-events-none absolute inset-0" style={{ background: backgroundOverlay }} /> : null}
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_520px] lg:items-end">
          <div className="space-y-6">
            <span className={cn("inline-flex rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em]", badgeClass)}>
              {badge}
            </span>
            <h1 className="max-w-[760px] text-[52px] font-semibold leading-[0.94] tracking-[-0.03em] text-[#f5f6f8] sm:text-[80px]">
              {title}
            </h1>
            {subtitle ? <p className="max-w-[620px] text-xl text-[#9ca3af]">{subtitle}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="ghost" size="lg" className={primaryClass}>
                <a href={primary.href}>{primary.label}</a>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-md border border-[#2a2f37] bg-[#0d1016] px-7 text-[#e5e7eb] hover:bg-[#141820]">
                <a href={secondary.href}>{secondary.label}</a>
              </Button>
            </div>
          </div>
          <div className="relative">
            {resolvedImage ? (
              <div className="overflow-hidden rounded-2xl border border-[#242932] bg-[#0a0d13]/95 shadow-[0_24px_72px_rgba(0,0,0,0.7)]">
                <img
                  src={resolvedImage}
                  alt={resolvedAlt}
                  className="hidden w-full object-cover opacity-90 md:block"
                  style={{ height: `${desktopHeight}px` }}
                  loading="lazy"
                />
                <img
                  src={resolvedMobileImage}
                  alt={resolvedAlt}
                  className="w-full object-cover opacity-90 md:hidden"
                  style={{ height: `${mobileHeight}px` }}
                  loading="lazy"
                />
                <div className={panelGlowClass} />
              </div>
            ) : null}
            {slides.length > 1 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={`${slide.src}-${index}`}
                    type="button"
                    aria-label={slide.label || `Slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full border transition",
                      index === activeSlide
                        ? isGreen
                          ? "border-[#00ff00] bg-[#00ff00]"
                          : "border-[#f8c84b] bg-[#f8c84b]"
                        : "border-[#3a404b] bg-[#0f131a]"
                    )}
                  />
                ))}
              </div>
            ) : null}
            <aside className={cn(
              "rounded-2xl border border-[#2a3039] bg-[#0a0d14]/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.7)]",
              resolvedImage ? "mt-4 md:absolute md:right-5 md:top-7 md:mt-0 md:w-[320px]" : ""
            )}>
              <span className="inline-flex rounded-md border border-[#333943] bg-[#12151d] px-3 py-1 text-xs uppercase tracking-[0.08em] text-[#d1d5db]">
                {resolvedPanelTag}
              </span>
              <h3 className="mt-5 text-4xl font-semibold text-[#f7f8fa]">{resolvedPanelTitle}</h3>
              <p className="mt-2 text-base text-[#9ca3af]">{resolvedPanelSubtitle}</p>
              <div className="mt-6 flex items-end gap-3">
                <span className="text-6xl font-semibold text-[#f8fafc]">{resolvedStatValue}</span>
                <span className={statDeltaClass}>{resolvedStatDelta}</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
