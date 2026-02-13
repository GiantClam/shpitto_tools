"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { maxWidthClass, BaseBlockProps } from "@/components/blocks/shared";

type NeonFeatureItem = {
  title: string;
  description?: string;
  badge?: string;
  highlight?: boolean;
  image?: { src?: string; alt?: string };
  imageSrc?: string;
  imageAlt?: string;
};

type NeonFeatureCardsProps = BaseBlockProps & {
  title: string;
  subtitle?: string;
  items?: NeonFeatureItem[];
  eyebrow?: string;
  highlightMode?: "first" | "none";
};

export function NeonFeatureCardsBlock({
  id,
  anchor,
  maxWidth = "xl",
  title,
  subtitle,
  items = [],
  eyebrow = "Wave 02",
  highlightMode = "first",
}: NeonFeatureCardsProps) {
  const cards =
    items.length > 0
      ? items.slice(0, 4)
      : [
          { title: "Predictive Intelligence", description: "Model outcomes before spend.", highlight: true },
          { title: "Autonomous Velocity", description: "Orchestrate publishing with adaptive timing." },
          { title: "Safety by Design", description: "Brand-safe automation with policy guardrails." },
          { title: "Omnichannel Scale", description: "Coordinate every channel from one control layer." },
        ];

  return (
    <section
      id={anchor}
      data-block="NeonFeatureCards"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#1b2230] bg-[#070d16] py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.22),transparent_45%),linear-gradient(180deg,#090f1b_0%,#0a121f_100%)]" />
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[#f59e0b]">{eyebrow}</p>
          <h2 className="mt-2 text-5xl font-semibold tracking-tight text-[#f7f9fe]">{title}</h2>
          {subtitle ? <p className="mt-3 text-lg text-[#98a3b7]">{subtitle}</p> : null}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {cards.map((item, index) => {
            const imageSrc = item.imageSrc || item.image?.src;
            const imageAlt = item.imageAlt || item.image?.alt || item.title;
            const highlight = Boolean(item.highlight || (highlightMode !== "none" && index === 0));
            return (
              <article
                key={`${item.title}-${index}`}
                className={cn(
                  "rounded-[26px] border p-7 transition-transform duration-300 hover:-translate-y-1",
                  highlight
                    ? "border-[#f59e0b] bg-[linear-gradient(180deg,#f97316_0%,#ea580c_100%)] text-[#1e1209] shadow-[0_20px_60px_rgba(249,115,22,0.3)]"
                    : "border-[#273146] bg-[#0d1524]/90 text-[#e6ebf5]"
                )}
              >
                {item.badge ? (
                  <span className={cn("inline-flex rounded-full border px-2 py-1 text-xs", highlight ? "border-[#7a3c0f]/40 bg-[#fcb46e]/30" : "border-[#38445b] bg-[#141f31]")}>
                    {item.badge}
                  </span>
                ) : null}
                {imageSrc ? (
                  <div className="mb-5 overflow-hidden rounded-2xl border border-[#273146] bg-[#0c1421]">
                    <img src={imageSrc} alt={imageAlt} className="h-36 w-full object-cover opacity-95" loading="lazy" />
                  </div>
                ) : null}
                <h3 className="mt-5 text-4xl font-semibold leading-tight">{item.title}</h3>
                {item.description ? (
                  <p className={cn("mt-4 text-base", highlight ? "text-[#3a2412]" : "text-[#9aa4b8]")}>{item.description}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
