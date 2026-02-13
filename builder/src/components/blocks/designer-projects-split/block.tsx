"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { BaseBlockProps, maxWidthClass } from "@/components/blocks/shared";

type ProjectItem = {
  title: string;
  summary?: string;
  href?: string;
  image?: { src?: string; alt?: string };
  imageSrc?: string;
  imageAlt?: string;
};

type DesignerProjectsSplitProps = BaseBlockProps & {
  title: string;
  subtitle?: string;
  items?: ProjectItem[];
};

export function DesignerProjectsSplitBlock({
  id,
  anchor,
  maxWidth = "xl",
  title,
  subtitle,
  items = [],
}: DesignerProjectsSplitProps) {
  const rows =
    items.length > 0
      ? items.slice(0, 3)
      : [
          {
            title: "SaaS Dashboard",
            summary: "A product analytics dashboard focused on clarity, trust, and retention.",
          },
          {
            title: "Fashion Platform",
            summary: "A conversion-first ecommerce redesign with improved storytelling and flow.",
          },
        ];

  return (
    <section
      id={anchor}
      data-block="DesignerProjectsSplit"
      data-block-id={id}
      className="border-b border-black/10 bg-[#f3f4f6] py-16 md:py-20"
    >
      <div className={cn("mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8b9099]">Work</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#11131a] md:text-4xl">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-[760px] text-base text-[#646b78]">{subtitle}</p> : null}
        </div>

        <div className="space-y-4">
          {rows.map((item, index) => {
            const src = item.image?.src || item.imageSrc;
            const alt = item.image?.alt || item.imageAlt || item.title;
            return (
              <article
                key={`${item.title}-${index}`}
                className="grid gap-4 rounded-xl border border-black/10 bg-white p-4 md:grid-cols-[1fr_340px] md:items-center"
              >
                <div>
                  <h3 className="text-2xl font-semibold text-[#11131a]">{item.title}</h3>
                  {item.summary ? <p className="mt-2 max-w-[620px] text-sm leading-6 text-[#646b78]">{item.summary}</p> : null}
                  <a href={item.href || "#"} className="mt-3 inline-flex text-xs font-medium text-[#11131a] underline-offset-2 hover:underline">
                    View Case Study
                  </a>
                </div>
                {src ? (
                  <div className="overflow-hidden rounded-lg border border-black/10 bg-[#f8f8fa]">
                    <img src={src} alt={alt} className="h-[180px] w-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  <div className="h-[180px] rounded-lg border border-dashed border-black/15 bg-[#f8f8fa]" />
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
