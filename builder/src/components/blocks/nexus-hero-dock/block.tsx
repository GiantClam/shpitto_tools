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
  backgroundOverlay?: string;
  backgroundMedia?: { kind?: "image" | "video"; src?: string; alt?: string };
  media?: { kind?: "image" | "video"; src?: string; alt?: string };
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
  backgroundOverlay,
  backgroundMedia,
  media,
}: NexusHeroDockProps) {
  const resolvedImage = heroImageSrc || media?.src || backgroundMedia?.src;
  const resolvedMobileImage = mobileHeroImageSrc || resolvedImage;
  const resolvedAlt = heroImageAlt || media?.alt || backgroundMedia?.alt || "Nexus hero visual";
  const primary = ctas[0] || { label: "Get Started", href: "#contact", variant: "primary" };
  const secondary = ctas[1] || { label: "View Docs", href: "#resources", variant: "secondary" };

  return (
    <section
      id={anchor}
      data-block="NexusHeroDock"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#1b2028] bg-[#040507] py-20 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(248,200,75,0.2),transparent_36%),linear-gradient(180deg,#050608_0%,#07090d_54%,#05070b_100%)]" />
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
            <span className="inline-flex rounded-full border border-[#2a2f37] bg-[#0c0f14] px-4 py-2 text-xs uppercase tracking-[0.12em] text-[#d8dde5]">
              {badge}
            </span>
            <h1 className="max-w-[760px] text-[52px] font-semibold leading-[0.94] tracking-[-0.03em] text-[#f5f6f8] sm:text-[80px]">
              {title}
            </h1>
            {subtitle ? <p className="max-w-[620px] text-xl text-[#9ca3af]">{subtitle}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="ghost" size="lg" className="rounded-md bg-[#f8c84b] px-7 text-[#17120a] hover:bg-[#ffdd7a]">
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
                  className="hidden h-[320px] w-full object-cover opacity-90 md:block"
                  loading="lazy"
                />
                <img
                  src={resolvedMobileImage}
                  alt={resolvedAlt}
                  className="h-[260px] w-full object-cover opacity-90 md:hidden"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_12%,rgba(248,200,75,0.33),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(4,8,16,0.5)_100%)]" />
              </div>
            ) : null}
            <aside className={cn(
              "rounded-2xl border border-[#2a3039] bg-[#0a0d14]/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.7)]",
              resolvedImage ? "mt-4 md:absolute md:right-5 md:top-7 md:mt-0 md:w-[320px]" : ""
            )}>
              <span className="inline-flex rounded-md border border-[#333943] bg-[#12151d] px-3 py-1 text-xs uppercase tracking-[0.08em] text-[#d1d5db]">
                {panelTag}
              </span>
              <h3 className="mt-5 text-4xl font-semibold text-[#f7f8fa]">{panelTitle}</h3>
              <p className="mt-2 text-base text-[#9ca3af]">{panelSubtitle}</p>
              <div className="mt-6 flex items-end gap-3">
                <span className="text-6xl font-semibold text-[#f8fafc]">{statValue}</span>
                <span className="mb-2 rounded-md border border-[#4a3e1b] bg-[#17130a] px-3 py-1 text-sm text-[#f8c84b]">{statDelta}</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
