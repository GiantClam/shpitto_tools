"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { maxWidthClass, BaseBlockProps } from "@/components/blocks/shared";

type MetricRow = {
  label: string;
  value: string;
};

type NeonMetricsOrbitProps = BaseBlockProps & {
  title: string;
  subtitle?: string;
  metrics?: MetricRow[];
  chips?: Array<string | { label?: string }>;
};

export function NeonMetricsOrbitBlock({
  id,
  anchor,
  maxWidth = "xl",
  title,
  subtitle,
  metrics = [],
  chips = [],
}: NeonMetricsOrbitProps) {
  const rows =
    metrics.length > 0
      ? metrics.slice(0, 4)
      : [
          { label: "Campaign Velocity", value: "96k / week" },
          { label: "Reach Lift", value: "+842%" },
          { label: "Brand-safe Coverage", value: "99.2%" },
        ];
  const orbitChips = (chips.length > 0 ? chips : ["TikTok", "Instagram", "YouTube", "X", "LinkedIn", "Reddit"])
    .map((chip) => (typeof chip === "string" ? chip : chip?.label || ""))
    .filter((chip) => Boolean(chip))
    .slice(0, 6);

  return (
    <section
      id={anchor}
      data-block="NeonMetricsOrbit"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#1d2331] bg-[#080d16] py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(249,115,22,0.16),transparent_40%),linear-gradient(180deg,#0a111d_0%,#0b1523_100%)]" />
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#f59e0b]">Platform</p>
            <h2 className="mt-2 text-5xl font-semibold tracking-tight text-[#f5f7fc]">{title}</h2>
            {subtitle ? <p className="mt-3 text-lg text-[#9ba4b6]">{subtitle}</p> : null}
          </div>
          <a
            href="#features"
            className="hidden rounded-full border border-[#374255] bg-[#111927] px-5 py-2 text-sm text-[#e5eaf4] hover:bg-[#1a2536] sm:inline-flex"
          >
            Discover
          </a>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-[#2a3547] bg-[#0d1625]/90 p-6">
            <div className="space-y-3">
              {rows.map((row, index) => (
                <div key={`${row.label}-${index}`} className="flex items-center justify-between border-b border-[#202b3d] pb-3 text-sm last:border-b-0 last:pb-0">
                  <span className="text-[#9ba4b6]">{row.label}</span>
                  <span className="text-base font-semibold text-[#edf1fa]">{row.value}</span>
                </div>
              ))}
            </div>
          </article>
          <article className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-3xl border border-[#2a3547] bg-[#0b131f]/90">
            <div className="pointer-events-none absolute h-48 w-48 rounded-full border border-[#f97316]/30" />
            <div className="pointer-events-none absolute h-28 w-28 rounded-full border border-[#f59e0b]/50" />
            <div className="pointer-events-none absolute h-6 w-6 rounded-full bg-[#f97316] shadow-[0_0_32px_rgba(249,115,22,0.7)]" />
            {orbitChips.map((chip, index) => {
              const angle = (index / orbitChips.length) * Math.PI * 2;
              const x = Math.cos(angle) * 88;
              const y = Math.sin(angle) * 88;
              return (
                <span
                  key={`${chip}-${index}`}
                  className="absolute rounded-full border border-[#2e394d] bg-[#0f1828]/90 px-3 py-1 text-xs text-[#d6dbe8]"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  {chip}
                </span>
              );
            })}
          </article>
        </div>
      </div>
    </section>
  );
}
