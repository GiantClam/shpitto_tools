"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { BaseBlockProps, maxWidthClass } from "@/components/blocks/shared";

type MatrixItem = {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
};

type NexusOpsMatrixProps = BaseBlockProps & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: MatrixItem[];
};

export function NexusOpsMatrixBlock({
  id,
  anchor,
  maxWidth = "xl",
  eyebrow = "Wave 01",
  title = "Deploy with velocity, scale without ceremony.",
  subtitle = "Control release workflows without adding operational drag.",
  items = [],
}: NexusOpsMatrixProps) {
  const cards = (items.length
    ? items
    : [
        {
          title: "Zero-config infrastructure",
          description: "Describe intent in TypeScript and let Nexus provision workers and policies.",
        },
        {
          title: "Traffic-aware scaling",
          description: "Continuously adapt workloads to demand signals and reduce noisy-neighbor impact.",
        },
        {
          title: "Precision analytics",
          description: "Observe every deploy in real time with rollout health and regional diagnostics.",
        },
        {
          title: "Unified workflow control",
          description: "Manage feature flags, canary rollouts, and instant rollback from one surface.",
        },
      ]
  ).slice(0, 4);

  return (
    <section
      id={anchor}
      data-block="NexusOpsMatrix"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#191e25] bg-[#040609] py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(248,200,75,0.14),transparent_40%),linear-gradient(180deg,#060911_0%,#05070d_100%)]" />
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#f8c84b]">{eyebrow}</p>
        <h2 className="mt-2 text-[34px] font-semibold tracking-tight text-[#f4f6fb] sm:text-[44px]">{title}</h2>
        {subtitle ? <p className="mt-3 max-w-3xl text-base text-[#9ca3af]">{subtitle}</p> : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {cards.map((item, index) => (
            <article key={`${item.title}-${index}`} className="overflow-hidden rounded-3xl border border-[#20252d] bg-[#0a0d13]">
              {item.imageSrc ? (
                <div className="border-b border-[#232831] bg-[#090c12] p-4">
                  <img
                    src={item.imageSrc}
                    alt={item.imageAlt || item.title || "Nexus visual"}
                    className="h-44 w-full rounded-2xl object-cover opacity-95"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <h3 className="text-4xl font-semibold tracking-tight text-[#edf1f7] sm:text-[40px]">{item.title}</h3>
                {item.description ? <p className="mt-3 text-base leading-7 text-[#9ca3af]">{item.description}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
