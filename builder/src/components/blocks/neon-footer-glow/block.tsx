"use client";

import React from "react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/cn";
import { BaseBlockProps, LinkProps, maxWidthClass } from "@/components/blocks/shared";

type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

type NeonFooterGlowProps = BaseBlockProps & {
  title?: string;
  subtitle?: string;
  primaryCta?: LinkProps;
  secondaryCta?: LinkProps;
  legal?: string;
  columns?: FooterColumn[];
};

export function NeonFooterGlowBlock({
  id,
  anchor,
  maxWidth = "xl",
  title = "Join our newsletter",
  subtitle = "Get strategic updates on digital media growth, automation, and creator insights.",
  primaryCta,
  secondaryCta,
  legal = "© 2026 All rights reserved.",
  columns = [],
}: NeonFooterGlowProps) {
  const main = primaryCta || { label: "Get Started", href: "#contact", variant: "primary" };
  const ghost = secondaryCta || { label: "Learn More", href: "#features", variant: "secondary" };
  const footerColumns =
    columns.length > 0
      ? columns.slice(0, 4)
      : [
          { title: "Platform", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }] },
          { title: "Resources", links: [{ label: "Docs", href: "#docs" }, { label: "Status", href: "#status" }] },
          { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Contact", href: "#contact" }] },
        ];

  return (
    <footer
      id={anchor}
      data-block="NeonFooterGlow"
      data-block-id={id}
      className="relative overflow-hidden bg-[#04070d] pb-10 pt-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_120%,rgba(249,115,22,0.45),transparent_55%),radial-gradient(80%_80%_at_20%_120%,rgba(250,204,21,0.25),transparent_52%)]" />
      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="rounded-[28px] border border-[#2b3346] bg-[#0a111d]/70 p-8">
          <h2 className="text-5xl font-semibold tracking-tight text-[#f8fafe]">{title}</h2>
          <p className="mt-3 max-w-3xl text-lg text-[#9ca6ba]">{subtitle}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-[#f97316] px-8 text-[#1d1309] hover:bg-[#fb8f3e]">
              <a href={main.href}>{main.label}</a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full border-[#38445b] bg-[#111a2b] px-8 text-[#ecf0f8] hover:bg-[#1a2536]">
              <a href={ghost.href}>{ghost.label}</a>
            </Button>
          </div>
        </div>
        <div className="mt-10 grid gap-6 border-t border-[#1f2737] pt-8 text-sm text-[#98a3b7] sm:grid-cols-3">
          {footerColumns.map((column, index) => (
            <div key={`${column.title}-${index}`}>
              <h3 className="text-sm font-semibold text-[#e9edf6]">{column.title}</h3>
              <div className="mt-3 space-y-2">
                {column.links.map((link, linkIndex) => (
                  <a key={`${link.label}-${linkIndex}`} href={link.href} className="block hover:text-[#f3a357]">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-[#6f7c95]">{legal}</p>
      </div>
    </footer>
  );
}
