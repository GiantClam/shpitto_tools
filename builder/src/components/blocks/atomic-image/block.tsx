"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type AtomicImageProps = {
  id: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  rounded?: boolean;
  emphasis?: "normal" | "high";
};

export function AtomicImageBlock({
  id,
  src,
  alt = "",
  width,
  height,
  rounded = true,
  emphasis = "normal",
}: AtomicImageProps) {
  const style = width && height ? { width, height } : undefined;
  return (
    <div data-block="AtomicImage" data-block-id={id}>
      <img
        src={src}
        alt={alt}
        style={style}
        className={cn(
          "block max-w-full",
          rounded ? "rounded-[calc(var(--radius)+4px)]" : "rounded-none",
          emphasis === "high" ? "hover-lift" : ""
        )}
        loading="lazy"
      />
    </div>
  );
}
