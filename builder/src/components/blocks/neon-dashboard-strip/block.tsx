"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { BaseBlockProps, maxWidthClass } from "@/components/blocks/shared";

type LabelValue = { label?: string; value?: string };

type NeonDashboardStripProps = BaseBlockProps & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tabs?: Array<string | { label?: string }>;
  metrics?: LabelValue[];
  kpis?: LabelValue[];
  dashboardImageSrc?: string;
  mobileDashboardImageSrc?: string;
  dashboardImageAlt?: string;
};

const normalizeTabs = (tabs: Array<string | { label?: string }> | undefined) =>
  (Array.isArray(tabs) ? tabs : ["Overview", "Campaigns", "Insights", "Safety", "AI"])
    .map((item) => (typeof item === "string" ? item : item?.label || ""))
    .filter((item) => Boolean(item))
    .slice(0, 6);

const normalizeRows = (rows: LabelValue[] | undefined, fallback: LabelValue[]) =>
  (Array.isArray(rows) && rows.length > 0 ? rows : fallback).slice(0, 6);

export function NeonDashboardStripBlock({
  id,
  anchor,
  maxWidth = "xl",
  eyebrow = "Wave 01",
  title = "Scale your reach instantly",
  subtitle = "Precision targeting, automated workflows, and brand safety controls.",
  tabs,
  metrics,
  kpis,
  dashboardImageSrc,
  mobileDashboardImageSrc,
  dashboardImageAlt = "Automation dashboard",
}: NeonDashboardStripProps) {
  const navTabs = normalizeTabs(tabs);
  const leftRows = normalizeRows(metrics, [
    { label: "Campaign Velocity", value: "+842%" },
    { label: "Total Reach", value: "2.4M" },
    { label: "Safety Score", value: "99.2%" },
  ]);
  const rightRows = normalizeRows(kpis, [
    { label: "Live Campaigns", value: "54" },
    { label: "Active Markets", value: "16" },
    { label: "Avg CTR", value: "4.8%" },
  ]);

  return (
    <section
      id={anchor}
      data-block="NeonDashboardStrip"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#1d2331] bg-[#070d16] py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(249,115,22,0.18),transparent_38%),linear-gradient(180deg,#0a101a_0%,#090f18_100%)]" />
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#f59e0b]">{eyebrow}</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-[#f4f7ff] md:text-5xl">{title}</h2>
            {subtitle ? <p className="mt-2 text-base text-[#99a3b8]">{subtitle}</p> : null}
          </div>
          <a
            href="#features"
            className="hidden rounded-full border border-[#36435b] bg-[#111827] px-5 py-2 text-sm text-[#e5eaf4] hover:bg-[#1a2438] sm:inline-flex"
          >
            Case Study
          </a>
        </div>

        <article className="overflow-hidden rounded-[28px] border border-[#2b3447] bg-[#0a111d]/95">
          <div className="flex items-center gap-3 border-b border-[#1c2638] px-4 py-3">
            {navTabs.map((tab, index) => (
              <span
                key={`${tab}-${index}`}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  index === 0
                    ? "border-[#f97316]/40 bg-[#2b1c0d] text-[#f8b26c]"
                    : "border-[#2b3548] bg-[#0f1625] text-[#aab3c5]"
                )}
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="grid gap-4 p-4 lg:grid-cols-[220px_1fr_220px]">
            <aside className="space-y-3 rounded-2xl border border-[#212b3d] bg-[#0d1524] p-3">
              {leftRows.map((row, index) => (
                <div key={`${row.label}-${index}`} className="rounded-lg border border-[#1f2a3b] bg-[#0a111d] px-3 py-2">
                  <p className="text-[11px] text-[#8f9ab0]">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#edf1fb]">{row.value}</p>
                </div>
              ))}
            </aside>

            <div className="relative overflow-hidden rounded-2xl border border-[#233047] bg-[#0b1423] p-4">
              {dashboardImageSrc ? (
                <>
                  <img
                    src={dashboardImageSrc}
                    alt={dashboardImageAlt}
                    className="hidden h-[260px] w-full rounded-xl object-cover opacity-85 md:block"
                    loading="lazy"
                  />
                  <img
                    src={mobileDashboardImageSrc || dashboardImageSrc}
                    alt={dashboardImageAlt}
                    className="h-[260px] w-full rounded-xl object-cover opacity-85 md:hidden"
                    loading="lazy"
                  />
                </>
              ) : (
                <div className="h-[260px] rounded-xl bg-[linear-gradient(135deg,#0f1829_0%,#0a121f_45%,#151010_100%)]" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(249,115,22,0.26),transparent_35%)]" />
            </div>

            <aside className="space-y-3 rounded-2xl border border-[#212b3d] bg-[#0d1524] p-3">
              {rightRows.map((row, index) => (
                <div key={`${row.label}-${index}`} className="rounded-lg border border-[#1f2a3b] bg-[#0a111d] px-3 py-2">
                  <p className="text-[11px] text-[#8f9ab0]">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#edf1fb]">{row.value}</p>
                </div>
              ))}
            </aside>
          </div>
        </article>
      </div>
    </section>
  );
}
