"use client";

import React from "react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/cn";
import { BaseBlockProps, LinkProps, maxWidthClass } from "@/components/blocks/shared";

type DesignerHeroEditorialProps = BaseBlockProps & {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  detail?: string;
  ctas?: LinkProps[];
  meshImageSrc?: string;
  previewImageSrc?: string;
  mobilePreviewImageSrc?: string;
  previewImageAlt?: string;
};

export function DesignerHeroEditorialBlock({
  id,
  anchor,
  maxWidth = "xl",
  eyebrow = "Since 2003",
  title,
  subtitle,
  detail,
  ctas = [],
  meshImageSrc,
  previewImageSrc,
  mobilePreviewImageSrc,
  previewImageAlt = "Portfolio preview",
}: DesignerHeroEditorialProps) {
  const primary = ctas[0] || { label: "View Work", href: "#projects", variant: "primary" };
  const secondary = ctas[1] || { label: "Read Story", href: "#about", variant: "secondary" };

  return (
    <section
      id={anchor}
      data-block="DesignerHeroEditorial"
      data-block-id={id}
      className="relative overflow-hidden border-b border-black/10 bg-[#f3f4f6] py-16 md:py-20"
    >
      {meshImageSrc ? (
        <img
          src={meshImageSrc}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 object-cover opacity-45 md:h-[520px] md:w-[520px]"
          loading="lazy"
        />
      ) : null}
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-4 lg:pt-24">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8b9099]">{eyebrow}</p>
            {subtitle ? <p className="max-w-[300px] text-sm leading-6 text-[#606572]">{subtitle}</p> : null}
            {detail ? <p className="max-w-[300px] text-sm leading-6 text-[#606572]">{detail}</p> : null}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="rounded-md bg-[#11131a] px-5 text-white hover:bg-black">
                <a href={primary.href}>{primary.label}</a>
              </Button>
              <Button asChild variant="secondary" className="rounded-md border-[#c7cad2] bg-white px-5 text-[#11131a] hover:bg-[#eef0f4]">
                <a href={secondary.href}>{secondary.label}</a>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="max-w-[700px] text-[44px] font-semibold leading-[0.92] tracking-[-0.03em] text-[#10131a] md:text-[78px]">
              {title}
            </h1>
            {previewImageSrc ? (
              <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                <img
                  src={previewImageSrc}
                  alt={previewImageAlt}
                  className="hidden h-[330px] w-full object-cover md:block"
                  loading="lazy"
                />
                <img
                  src={mobilePreviewImageSrc || previewImageSrc}
                  alt={previewImageAlt}
                  className="h-[230px] w-full object-cover md:hidden"
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
