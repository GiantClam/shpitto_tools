"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { maxWidthClass, BaseBlockProps } from "@/components/blocks/shared";

type NeonResultsShowcaseProps = BaseBlockProps & {
  title: string;
  subtitle?: string;
  quote?: string;
  author?: string;
  role?: string;
  imageSrc?: string;
  mobileImageSrc?: string;
  imageAlt?: string;
};

export function NeonResultsShowcaseBlock({
  id,
  anchor,
  maxWidth = "xl",
  title,
  subtitle,
  quote = "We watched 56 creators double qualified reach while cutting manual operations effort in half.",
  author = "Claire",
  role = "Growth Director",
  imageSrc,
  mobileImageSrc,
  imageAlt = "Client portrait",
}: NeonResultsShowcaseProps) {
  return (
    <section
      id={anchor}
      data-block="NeonResultsShowcase"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#1d2636] bg-[#080d16] py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_28%,rgba(249,115,22,0.16),transparent_42%),linear-gradient(180deg,#080d16_0%,#080f1a_100%)]" />
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#f59e0b]">Wave 03</p>
            <h2 className="mt-2 text-5xl font-semibold tracking-tight text-[#f7f9fe]">{title}</h2>
            {subtitle ? <p className="mt-3 text-lg text-[#9ba4b6]">{subtitle}</p> : null}
          </div>
          <a
            href="#contact"
            className="hidden rounded-full border border-[#354156] bg-[#10192a] px-5 py-2 text-sm text-[#e5eaf4] hover:bg-[#1a2536] sm:inline-flex"
          >
            See More
          </a>
        </div>
        <article className="grid overflow-hidden rounded-[30px] border border-[#2a3547] bg-[#0d1625]/90 md:grid-cols-[1.1fr_420px]">
          <div className="p-8 md:p-10">
            <span className="inline-flex rounded-full border border-[#43301f] bg-[#1e140d] px-3 py-1 text-xs text-[#f6b06d]">Success Story</span>
            <p className="mt-6 text-2xl leading-relaxed text-[#f2f5fb]">{quote}</p>
            <div className="mt-7">
              <p className="text-base font-semibold text-[#f7f9fe]">{author}</p>
              <p className="text-sm text-[#9ba4b6]">{role}</p>
            </div>
          </div>
          <div className="relative min-h-[260px] border-l border-[#243247]">
            {imageSrc ? (
              <>
                <img src={imageSrc} alt={imageAlt} className="hidden h-full w-full object-cover md:block" loading="lazy" />
                <img
                  src={mobileImageSrc || imageSrc}
                  alt={imageAlt}
                  className="h-full w-full object-cover md:hidden"
                  loading="lazy"
                />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.35),#0c1322)] text-[#f8be84]">
                Visual
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.3),transparent_55%)]" />
          </div>
        </article>
      </div>
    </section>
  );
}
