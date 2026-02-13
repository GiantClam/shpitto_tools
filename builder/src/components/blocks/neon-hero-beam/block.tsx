"use client";

import React from "react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/cn";
import { BaseBlockProps, LinkProps, maxWidthClass } from "@/components/blocks/shared";

type NeonHeroBeamProps = BaseBlockProps & {
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

export function NeonHeroBeamBlock({
  id,
  anchor,
  maxWidth = "xl",
  title,
  subtitle,
  badge = "Social Growth, Autopilot Mode",
  ctas = [],
  panelTag = "Viral Result",
  panelTitle = "Growth Velocity",
  panelSubtitle = "Automated engagement hitting viral peaks.",
  statValue = "+842%",
  statDelta = "vs last week",
  heroImageSrc,
  mobileHeroImageSrc,
  heroImageAlt = "Hero visual",
  backgroundOverlay,
  backgroundMedia,
  media,
}: NeonHeroBeamProps) {
  const resolvedImage = heroImageSrc || media?.src || backgroundMedia?.src;
  const resolvedMobileImage = mobileHeroImageSrc || resolvedImage;
  const resolvedAlt = heroImageAlt || media?.alt || backgroundMedia?.alt || "Hero visual";
  const primary = ctas[0] || { label: "Explore Platform", href: "#platform", variant: "primary" };
  const secondary = ctas[1] || { label: "View Metrics", href: "#metrics", variant: "secondary" };

  return (
    <section
      id={anchor}
      data-block="NeonHeroBeam"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#2a1a10] bg-[#06080f] py-20 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(249,115,22,0.24),transparent_38%),linear-gradient(180deg,#07090f_0%,#0a1528_55%,#1c2a40_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-[280px] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(255,170,30,0.9),rgba(245,120,10,0.45)_32%,rgba(0,0,0,0)_72%)] blur-[1px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-[120px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[#ffe87a] to-transparent opacity-80" />
      {resolvedImage ? (
        <>
          <img
            src={resolvedImage}
            alt={resolvedAlt}
            className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-25 mix-blend-screen md:block"
            loading="lazy"
          />
          <img
            src={resolvedMobileImage}
            alt={resolvedAlt}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-screen md:hidden"
            loading="lazy"
          />
        </>
      ) : null}
      {backgroundOverlay ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: backgroundOverlay }}
        />
      ) : null}
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_420px] lg:items-end">
          <div className="max-w-[760px] space-y-7">
            <div className="inline-flex rounded-xl border border-[#3b2717] bg-[#12161f]/80 px-4 py-2 text-sm text-[#f0d7bf]">
              {badge}
            </div>
            <h1 className="max-w-[780px] text-[52px] font-semibold uppercase leading-[0.96] tracking-[-0.03em] text-[#f7f8fc] sm:text-[84px]">
              {title}
            </h1>
            {subtitle ? <p className="max-w-[640px] text-xl text-[#aeb5c3]">{subtitle}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-[#f97316] px-8 text-[#17100a] hover:bg-[#fb8f3e]">
                <a href={primary.href}>{primary.label}</a>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-full border-[#3b4658] bg-[#0f141f] px-8 text-[#e7ecf6] hover:bg-[#1a2231]">
                <a href={secondary.href}>{secondary.label}</a>
              </Button>
            </div>
          </div>
          <aside className="rounded-[28px] border border-[#f59e0b] bg-[linear-gradient(180deg,#111621_0%,#0a0f18_100%)] p-6 shadow-[0_20px_70px_rgba(249,115,22,0.22)]">
            <span className="inline-flex rounded-md border border-[#3f2d1e] bg-[#22170f] px-3 py-1 text-xs uppercase tracking-[0.08em] text-[#f6b06d]">
              {panelTag}
            </span>
            <h3 className="mt-6 text-4xl font-semibold text-[#f9fbff]">{panelTitle}</h3>
            <p className="mt-2 text-base text-[#9ea8ba]">{panelSubtitle}</p>
            <div className="mt-6 flex items-center gap-3">
              <span className="text-6xl font-semibold text-[#fff1de]">{statValue}</span>
              <span className="rounded-md bg-[#2e1b0d] px-3 py-1 text-sm text-[#f9a350]">{statDelta}</span>
            </div>
            <svg className="mt-8 h-24 w-full" viewBox="0 0 320 90" fill="none" preserveAspectRatio="none">
              <path d="M0 76 C 48 76, 60 54, 102 56 C 158 60, 186 30, 226 34 C 268 37, 292 16, 320 12" stroke="#f97316" strokeWidth="3" />
              <circle cx="320" cy="12" r="4" fill="#ffedd5" />
            </svg>
            <Button asChild size="lg" className="mt-7 w-full rounded-full bg-[#f97316] text-[#1c1208] hover:bg-[#fb8f3e]">
              <a href="#pricing">Analyze Trends</a>
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
