"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type AtomicTextProps = {
  id: string;
  text: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  emphasis?: "normal" | "high";
};

export function AtomicTextBlock({
  id,
  text,
  size = "md",
  align = "left",
  emphasis = "normal",
}: AtomicTextProps) {
  const sizeClass =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";
  return (
    <div
      data-block="AtomicText"
      data-block-id={id}
      className={cn(align === "center" ? "text-center" : "text-left")}
    >
      <p className={cn(sizeClass, emphasis === "high" ? "text-gradient" : "")}>
        {text}
      </p>
    </div>
  );
}
