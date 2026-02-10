import React from "react";

import { cn } from "@/lib/cn";

type TextRevealProps = {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  delayMs?: number;
  as?: React.ElementType;
};

export function TextReveal({ text, children, className, delayMs = 0, as = "span" }: TextRevealProps) {
  const Tag = as as any;
  const content = text ?? children;
  return (
    <Tag
      className={cn("inline-block", className)}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <span className="text-reveal inline-block">{content}</span>
    </Tag>
  );
}
