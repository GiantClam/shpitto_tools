"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { BaseBlockProps, maxWidthClass } from "@/components/blocks/shared";

type NexusProofMosaicProps = BaseBlockProps & {
  title?: string;
  subtitle?: string;
  quote?: string;
  author?: string;
  role?: string;
  imageSrc?: string;
  mobileImageSrc?: string;
  imageAlt?: string;
};

export function NexusProofMosaicBlock({
  id,
  anchor,
  maxWidth = "xl",
  title = "Ship faster with Nexus",
  subtitle = "Engineering teams using Nexus report faster delivery with lower incident pressure.",
  quote = "Nexus gave us a single control plane for releases. We moved faster while reducing incident pressure across teams.",
  author = "Claire",
  role = "Engineering Lead",
  imageSrc,
  mobileImageSrc,
  imageAlt = "Nexus deployment proof",
}: NexusProofMosaicProps) {
  return (
    <section
      id={anchor}
      data-block="NexusProofMosaic"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#181d24] bg-[#040609] py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(248,200,75,0.2),transparent_45%),linear-gradient(180deg,#05080f_0%,#05070d_100%)]" />
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#f8c84b]">Wave 03</p>
            <h2 className="mt-2 text-[34px] font-semibold tracking-tight text-[#f5f7fb] sm:text-[44px]">{title}</h2>
            {subtitle ? <p className="mt-2 text-base text-[#9ca3af]">{subtitle}</p> : null}
          </div>
          <a href="#resources" className="rounded-full border border-[#2b3039] bg-[#0f131b] px-4 py-2 text-xs text-[#e5e7eb]">
            See More
          </a>
        </div>

        <article className="grid overflow-hidden rounded-[28px] border border-[#212730] bg-[#090d14] md:grid-cols-[1.05fr_1fr]">
          <div className="p-7 md:p-8">
            <span className="inline-flex rounded-md border border-[#2f343e] bg-[#11151d] px-3 py-1 text-xs text-[#d1d5db]">Success Story</span>
            <p className="mt-5 text-2xl leading-relaxed text-[#eef2f7]">{quote}</p>
            <div className="mt-6">
              <p className="text-base font-semibold text-[#f5f7fa]">{author}</p>
              <p className="text-sm text-[#9ca3af]">{role}</p>
            </div>
          </div>

          <div className="relative min-h-[260px] border-l border-[#202731]">
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
              <div className="h-full w-full bg-[linear-gradient(130deg,#12161d,#0d1118)]" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_22%,rgba(248,200,75,0.28),transparent_52%)]" />
          </div>
        </article>
      </div>
    </section>
  );
}
