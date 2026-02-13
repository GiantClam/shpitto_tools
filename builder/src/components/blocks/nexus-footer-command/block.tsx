"use client";

import React from "react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/cn";
import { BaseBlockProps, LinkProps, maxWidthClass } from "@/components/blocks/shared";

type FooterColumn = {
  title?: string;
  links?: Array<{ label?: string; href?: string }>;
};

type NexusFooterCommandProps = BaseBlockProps & {
  title?: string;
  subtitle?: string;
  primaryCta?: LinkProps | LinkProps[];
  secondaryCta?: LinkProps | LinkProps[];
  columns?: FooterColumn[];
  legal?: string;
};

export function NexusFooterCommandBlock({
  id,
  anchor,
  maxWidth = "xl",
  title = "Ready to streamline your workflow?",
  subtitle = "Join high-performance engineering teams using Nexus to orchestrate product delivery.",
  primaryCta,
  secondaryCta,
  columns = [],
  legal = "© 2024 Nexus Inc. All rights reserved.",
}: NexusFooterCommandProps) {
  const main = (Array.isArray(primaryCta) ? primaryCta[0] : primaryCta) || {
    label: "Start building for free",
    href: "#contact",
    variant: "primary" as const,
  };
  const ghost = (Array.isArray(secondaryCta) ? secondaryCta[0] : secondaryCta) || {
    label: "Contact Sales",
    href: "#contact",
    variant: "secondary" as const,
  };

  const footerColumns = (columns.length
    ? columns
    : [
        { title: "Product", links: [{ label: "Features", href: "#services" }, { label: "Integrations", href: "#services" }] },
        { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Careers", href: "#about" }] },
        { title: "Resources", links: [{ label: "Community", href: "#resources" }, { label: "Help Center", href: "#resources" }] },
        { title: "Legal", links: [{ label: "Privacy Policy", href: "#legal" }, { label: "Terms of Service", href: "#legal" }] },
      ]
  ).slice(0, 4);

  return (
    <footer
      id={anchor}
      data-block="NexusFooterCommand"
      data-block-id={id}
      className="relative overflow-hidden bg-[#030508] pb-10 pt-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_10%,rgba(248,200,75,0.14),transparent_55%),radial-gradient(80%_70%_at_85%_100%,rgba(248,200,75,0.22),transparent_55%)]" />

      <div className={cn("relative z-10 mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <div className="rounded-[26px] border border-[#202732] bg-[#090d14]/92 px-6 py-10 sm:px-10">
          <h2 className="text-[40px] font-semibold tracking-tight text-[#f4f6fa] sm:text-[56px]">{title}</h2>
          <p className="mt-3 max-w-3xl text-lg text-[#9ca3af]">{subtitle}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="ghost" size="lg" className="rounded-full bg-[#f8c84b] px-8 text-[#17120a] hover:bg-[#ffdd7a]">
              <a href={main.href}>{main.label}</a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full border border-[#2c323b] bg-[#10151d] px-8 text-[#e5e7eb] hover:bg-[#151b24]">
              <a href={ghost.href}>{ghost.label}</a>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 border-t border-[#171d27] pt-8 text-sm text-[#9ca3af] sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((column, index) => (
            <div key={`${column.title}-${index}`}>
              <h3 className="text-sm font-semibold text-[#edf1f6]">{column.title}</h3>
              <div className="mt-3 space-y-2">
                {(column.links || []).slice(0, 6).map((link, linkIndex) => (
                  <a
                    key={`${link.label}-${linkIndex}`}
                    href={String(link?.href || "#")}
                    className="block transition-colors hover:text-[#ffdd7a]"
                  >
                    {link?.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-[#151b24] pt-4 text-xs text-[#6b7280]">{legal}</div>
      </div>
    </footer>
  );
}
