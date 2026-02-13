"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { BaseBlockProps, maxWidthClass } from "@/components/blocks/shared";

type CapabilityItem = {
  title: string;
  description?: string;
  image?: { src?: string; alt?: string };
  imageSrc?: string;
  imageAlt?: string;
  ctaLabel?: string;
};

type DesignerCapabilitiesStripProps = BaseBlockProps & {
  title: string;
  subtitle?: string;
  items?: CapabilityItem[];
};

export function DesignerCapabilitiesStripBlock({
  id,
  anchor,
  maxWidth = "xl",
  title,
  subtitle,
  items = [],
}: DesignerCapabilitiesStripProps) {
  const cards =
    items.length > 0
      ? items.slice(0, 3)
      : [
          { title: "UI/UX Design", description: "Product-level UX architecture and interaction systems." },
          { title: "Web Development", description: "Frontend implementation with reliability and polish." },
          { title: "Brand Identity", description: "Visual identity systems that scale across products." },
        ];

  return (
    <section
      id={anchor}
      data-block="DesignerCapabilitiesStrip"
      data-block-id={id}
      className="border-b border-black/10 bg-[#f3f4f6] py-16 md:py-20"
    >
      <div className={cn("mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8b9099]">Capabilities</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#11131a] md:text-4xl">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-[760px] text-base text-[#646b78]">{subtitle}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((item, index) => {
            const src = item.image?.src || item.imageSrc;
            const alt = item.image?.alt || item.imageAlt || item.title;
            return (
              <article key={`${item.title}-${index}`} className="rounded-xl border border-black/10 bg-white p-4">
                {src ? (
                  <div className="mb-3 overflow-hidden rounded-lg border border-black/10 bg-[#f8f8fa]">
                    <img src={src} alt={alt} className="h-[110px] w-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  <div className="mb-3 h-[110px] rounded-lg border border-dashed border-black/15 bg-[#f8f8fa]" />
                )}
                <h3 className="text-lg font-semibold text-[#11131a]">{item.title}</h3>
                {item.description ? <p className="mt-1 text-sm leading-6 text-[#646b78]">{item.description}</p> : null}
                <a href="#" className="mt-3 inline-flex text-xs font-medium text-[#11131a] underline-offset-2 hover:underline">
                  {item.ctaLabel || "Learn more"}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
