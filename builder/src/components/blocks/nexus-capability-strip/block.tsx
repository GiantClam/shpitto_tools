"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { BaseBlockProps, maxWidthClass } from "@/components/blocks/shared";

type CapabilityItem = {
  title?: string;
  description?: string;
  badge?: string;
};

type NexusCapabilityStripProps = BaseBlockProps & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: CapabilityItem[];
};

export function NexusCapabilityStripBlock({
  id,
  anchor,
  maxWidth = "xl",
  eyebrow = "Key Capabilities",
  title = "Engineered for modern product teams",
  subtitle = "Designed for scale, precision, and reliable execution.",
  items = [],
}: NexusCapabilityStripProps) {
  const cards = (items.length
    ? items
    : [
        { title: "Precision targeting", description: "Policy-aware delivery mapped to measurable goals." },
        { title: "Automated workflows", description: "Deterministic rollouts and rollback-ready stages." },
        { title: "Brand safety", description: "Guardrails enforce reliability and compliance by default." },
      ]
  ).slice(0, 4);

  return (
    <section
      id={anchor}
      data-block="NexusCapabilityStrip"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#181d24] bg-[#05070b] py-14"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_14%,rgba(248,200,75,0.16),transparent_40%),linear-gradient(180deg,#070a11_0%,#05070c_100%)]" />
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#f8c84b]">{eyebrow}</p>
        <h2 className="mt-2 text-[36px] font-semibold tracking-tight text-[#f5f7fb] sm:text-[46px]">{title}</h2>
        {subtitle ? <p className="mt-3 max-w-3xl text-base text-[#9ca3af]">{subtitle}</p> : null}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className={cn(
                "rounded-2xl border p-5",
                index === 0
                  ? "border-[#f8c84b]/55 bg-[linear-gradient(140deg,rgba(248,200,75,0.2),rgba(11,13,18,0.96))]"
                  : "border-[#232830] bg-[#0a0d13]"
              )}
            >
              {item.badge ? (
                <span className="inline-flex rounded-md border border-[#313640] bg-[#11141b] px-2 py-1 text-[11px] text-[#d1d5db]">
                  {item.badge}
                </span>
              ) : null}
              <h3 className="mt-3 text-2xl font-semibold text-[#eef2f7]">{item.title}</h3>
              {item.description ? <p className="mt-2 text-sm leading-6 text-[#9ca3af]">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
