"use client";

import React from "react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/cn";
import { maxWidthClass, BaseBlockProps, LinkProps } from "@/components/blocks/shared";

type PricingItem = {
  name: string;
  price: string;
};

type NeonPricingSplitProps = BaseBlockProps & {
  title: string;
  subtitle?: string;
  items?: PricingItem[];
  featuredName?: string;
  featuredPrice?: string;
  features?: Array<string | { label?: string }>;
  cta?: LinkProps;
  backgroundImageSrc?: string;
  mobileBackgroundImageSrc?: string;
};

export function NeonPricingSplitBlock({
  id,
  anchor,
  maxWidth = "xl",
  title,
  subtitle,
  items = [],
  featuredName = "Creator",
  featuredPrice = "$29.00 / mo",
  features = [],
  cta,
  backgroundImageSrc,
  mobileBackgroundImageSrc,
}: NeonPricingSplitProps) {
  const plans =
    items.length > 0
      ? items.slice(0, 4)
      : [
          { name: "Creator", price: "$29" },
          { name: "Pro Growth", price: "$79" },
          { name: "Agency", price: "$199" },
        ];
  const bullets =
    features.length > 0
      ? features
          .map((feature) => (typeof feature === "string" ? feature : feature?.label || ""))
          .filter((feature) => Boolean(feature))
          .slice(0, 6)
      : ["AI campaign orchestration", "Multi-channel scheduler", "Attribution insights", "Priority support"];
  const action = cta || { label: "Start Free Trial", href: "#contact", variant: "primary" };

  return (
    <section
      id={anchor}
      data-block="NeonPricingSplit"
      data-block-id={id}
      className="relative overflow-hidden border-b border-[#1d2535] bg-[#070d16] py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_32%,rgba(249,115,22,0.2),transparent_45%),linear-gradient(180deg,#070d16_0%,#0a1220_100%)]" />
      {backgroundImageSrc ? (
        <>
          <img
            src={backgroundImageSrc}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-20 mix-blend-screen md:block"
          />
          <img
            src={mobileBackgroundImageSrc || backgroundImageSrc}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen md:hidden"
          />
        </>
      ) : null}
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[#f59e0b]">Pricing</p>
          <h2 className="mt-2 text-5xl font-semibold tracking-tight text-[#f7f9fe]">{title}</h2>
          {subtitle ? <p className="mt-3 text-lg text-[#9ba4b6]">{subtitle}</p> : null}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
          <div className="space-y-3 rounded-3xl border border-[#283249] bg-[#0d1627]/90 p-5">
            {plans.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-xl border border-[#222d42] bg-[#0f192b] px-5 py-4 text-sm">
                <span className="text-[#dfe5f2]">{item.name}</span>
                <span className="font-semibold text-[#f7aa5f]">{item.price}</span>
              </div>
            ))}
          </div>
          <aside className="relative rounded-3xl border border-[#f59e0b] bg-[linear-gradient(180deg,#151013_0%,#0f1728_100%)] p-7 shadow-[0_20px_70px_rgba(249,115,22,0.2)]">
            <div className="pointer-events-none absolute -left-10 top-1/2 hidden h-px w-10 bg-gradient-to-r from-[#f59e0b]/0 to-[#f59e0b]/80 lg:block" />
            <div className="pointer-events-none absolute -left-11 top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.75)] lg:block" />
            <div className="flex items-center justify-between">
              <span className="text-base text-[#f2f5fb]">{featuredName}</span>
              <span className="text-2xl font-semibold text-[#ffd7a8]">{featuredPrice}</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-[#aeb6c6]">
              {bullets.map((feature, index) => (
                <li key={`${feature}-${index}`} className="flex gap-2">
                  <span className="text-[#f59e0b]">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-7 w-full rounded-full bg-[#f97316] text-[#1d1309] hover:bg-[#fb8f3e]">
              <a href={action.href}>{action.label}</a>
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
