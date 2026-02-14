"use client";

import React from "react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/cn";
import { BaseBlockProps, LinkProps, maxWidthClass } from "@/components/blocks/shared";

type NexusNavPulseProps = BaseBlockProps & {
  logoText?: string;
  links?: Array<{ label?: string; href?: string }>;
  cta?: LinkProps | LinkProps[];
  sticky?: boolean;
  accentTone?: "gold" | "green";
};

export function NexusNavPulseBlock({
  id,
  anchor,
  maxWidth = "xl",
  logoText = "Nexus",
  links = [],
  cta,
  sticky = true,
  accentTone = "gold",
}: NexusNavPulseProps) {
  const navItems = (links.length ? links : [
    { label: "Home", href: "#top" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ])
    .map((item) => ({
      label: String(item?.label || "").trim(),
      href: String(item?.href || "#").trim() || "#",
    }))
    .filter((item) => item.label)
    .slice(0, 6);

  const action = (Array.isArray(cta) ? cta[0] : cta) || {
    label: "Get Started",
    href: "#contact",
    variant: "primary" as const,
  };
  const ctaClass =
    accentTone === "green"
      ? "rounded-md bg-[#00ff00] px-4 text-[#001400] hover:bg-[#00ff00]"
      : "rounded-md bg-[#f8c84b] px-4 text-[#17120a] hover:bg-[#ffdd7a]";

  return (
    <header
      id={anchor}
      data-block="NexusNavPulse"
      data-block-id={id}
      className={cn(
        "z-40 w-full border-b border-[#1b1f26] bg-[#050608]/92 backdrop-blur-md",
        sticky ? "sticky top-0" : ""
      )}
    >
      <div className={cn("mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6", maxWidthClass(maxWidth))}>
        <a href="#top" className="text-sm font-semibold tracking-wide text-[#f5f6f8]">
          {logoText}
        </a>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((item, index) => (
            <a
              key={`${item.label}-${index}`}
              href={item.href}
              className="text-xs font-medium uppercase tracking-[0.1em] text-[#9da3af] transition-colors hover:text-[#f5f6f8]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button asChild variant="ghost" size="sm" className={ctaClass}>
          <a href={action.href}>{action.label}</a>
        </Button>
      </div>
    </header>
  );
}
