import React from "react";

import { cn } from "@/lib/cn";

type TextRevealProps = {
  text: string;
  className?: string;
  delayMs?: number;
  as?: React.ElementType;
};

export function TextReveal({ text, className, delayMs = 0, as = "span" }: TextRevealProps) {
  const Tag = as as any;
  return (
    <Tag
      className={cn("inline-block", className)}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <span className="text-reveal inline-block">{text}</span>
    </Tag>
  );
}
