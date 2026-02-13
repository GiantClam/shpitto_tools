"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { BaseBlockProps, maxWidthClass } from "@/components/blocks/shared";

type DesignerQuoteBandProps = BaseBlockProps & {
  eyebrow?: string;
  quote: string;
  author?: string;
  role?: string;
};

export function DesignerQuoteBandBlock({
  id,
  anchor,
  maxWidth = "xl",
  eyebrow = "Testimonial",
  quote,
  author,
  role,
}: DesignerQuoteBandProps) {
  return (
    <section
      id={anchor}
      data-block="DesignerQuoteBand"
      data-block-id={id}
      className="border-b border-black/10 bg-[#f3f4f6] py-16 md:py-20"
    >
      <div className={cn("mx-auto px-4 sm:px-6", maxWidthClass(maxWidth))}>
        <p className="text-center text-[11px] uppercase tracking-[0.22em] text-[#8b9099]">{eyebrow}</p>
        <blockquote className="mx-auto mt-4 max-w-[920px] text-center text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#151821] md:text-[54px]">
          {quote}
        </blockquote>
        {(author || role) ? (
          <p className="mt-4 text-center text-sm text-[#646b78]">
            {[author, role].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
