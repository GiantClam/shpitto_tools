import React from "react";

import { cn } from "@/lib/cn";

type MarqueeProps = {
  items: Array<
    | string
    | React.ReactNode
    | { id?: string | number; content?: React.ReactNode; label?: React.ReactNode; value?: React.ReactNode; name?: string }
  >;
  className?: string;
  speed?: number;
};

const normalizeMarqueeItem = (item: MarqueeProps["items"][number]): React.ReactNode => {
  if (typeof item === "string" || typeof item === "number" || React.isValidElement(item)) {
    return item;
  }
  if (item && typeof item === "object") {
    if ("content" in item && item.content != null) return item.content;
    if ("label" in item && item.label != null) return item.label;
    if ("value" in item && item.value != null) return item.value;
    if ("name" in item && item.name != null) return item.name;
  }
  return null;
};

export function Marquee({ items, className, speed = 28 }: MarqueeProps) {
  const safeItems = Array.isArray(items) ? items : [];
  const duration = `${speed}s`;
  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className="flex w-max animate-marquee gap-6"
        style={{ animationDuration: duration }}
      >
        {safeItems.concat(safeItems).map((item, index) => (
          <div key={`marquee-${index}`} className="flex items-center text-sm text-muted-foreground">
            {normalizeMarqueeItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
