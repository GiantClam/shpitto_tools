"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { BaseBlockProps, maxWidthClass } from "@/components/blocks/shared";

type LabelValue = { label?: string; value?: string };

type NexusControlPanelProps = BaseBlockProps & {
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
  (Array.isArray(tabs) ? tabs : ["Pipelines", "Signals", "Budgets", "Teams"]).map((item) =>
    typeof item === "string" ? item : item?.label || ""
  );

export function NexusControlPanelBlock({
  id,
  anchor,
  maxWidth = "xl",
  eyebrow = "Wave 02",
  title = "AI-assisted product orchestration",
  subtitle = "Guide releases with context-aware automation and operator oversight.",
  tabs,
  metrics = [],
  kpis = [],
  dashboardImageSrc,
  mobileDashboardImageSrc,
  dashboardImageAlt = "Nexus control panel",
}: NexusControlPanelProps) {
  const navTabs = normalizeTabs(tabs).filter(Boolean).slice(0, 5);
  const leftRows = (metrics.length
    ? metrics
    : [
        { label: "Release Success", value: "99.4%" },
        { label: "Error Budget Burn", value: "-42%" },
        { label: "Restore Time", value: "2m 18s" },
      ]
  ).slice(0, 4);
  const rightRows = (kpis.length
    ? kpis
    : [
        { label: "Active Pipelines", value: "128" },
        { label: "Guardrail Rules", value: "73" },
        { label: "AI Recommendations", value: "312" },
      ]
  ).slice(0, 4);

  return (
    <section
      id={anchor}
      data-block="NexusControlPanel"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#181d24] bg-[#040508] py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(248,200,75,0.18),transparent_42%),linear-gradient(180deg,#060a11_0%,#05070b_100%)]" />
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#f8c84b]">{eyebrow}</p>
            <h2 className="mt-2 text-[34px] font-semibold tracking-tight text-[#f4f6fa] sm:text-[44px]">{title}</h2>
            {subtitle ? <p className="mt-2 text-base text-[#9ca3af]">{subtitle}</p> : null}
          </div>
          <a href="#services" className="rounded-full border border-[#2b3039] bg-[#0f1218] px-4 py-2 text-xs text-[#e5e7eb]">
            Case Study
          </a>
        </div>

        <article className="overflow-hidden rounded-[28px] border border-[#20262f] bg-[#090d14]">
          <div className="flex flex-wrap gap-2 border-b border-[#242a32] px-4 py-3">
            {navTabs.map((tab, index) => (
              <span
                key={`${tab}-${index}`}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.08em]",
                  index === 0
                    ? "border-[#f8c84b]/55 bg-[#1a1507] text-[#ffdd7a]"
                    : "border-[#2e333c] bg-[#10141c] text-[#9ca3af]"
                )}
              >
                {tab}
              </span>
            ))}
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-[220px_1fr_220px]">
            <aside className="space-y-3 rounded-2xl border border-[#222831] bg-[#0b0f16] p-3">
              {leftRows.map((row, index) => (
                <div key={`${row.label}-${index}`} className="rounded-lg border border-[#272d36] bg-[#0d1119] px-3 py-2">
                  <p className="text-[11px] text-[#9ca3af]">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#eef2f7]">{row.value}</p>
                </div>
              ))}
            </aside>

            <div className="relative overflow-hidden rounded-2xl border border-[#262d37] bg-[#0a0e15] p-3">
              {dashboardImageSrc ? (
                <>
                  <img
                    src={dashboardImageSrc}
                    alt={dashboardImageAlt}
                    className="hidden h-[260px] w-full rounded-xl object-cover opacity-95 md:block"
                    loading="lazy"
                  />
                  <img
                    src={mobileDashboardImageSrc || dashboardImageSrc}
                    alt={dashboardImageAlt}
                    className="h-[260px] w-full rounded-xl object-cover opacity-95 md:hidden"
                    loading="lazy"
                  />
                </>
              ) : (
                <div className="h-[260px] rounded-xl bg-[linear-gradient(140deg,#0c1018_0%,#12161e_45%,#0f1117_100%)]" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(248,200,75,0.22),transparent_42%)]" />
            </div>

            <aside className="space-y-3 rounded-2xl border border-[#222831] bg-[#0b0f16] p-3">
              {rightRows.map((row, index) => (
                <div key={`${row.label}-${index}`} className="rounded-lg border border-[#272d36] bg-[#0d1119] px-3 py-2">
                  <p className="text-[11px] text-[#9ca3af]">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#eef2f7]">{row.value}</p>
                </div>
              ))}
            </aside>
          </div>
        </article>
      </div>
    </section>
  );
}
