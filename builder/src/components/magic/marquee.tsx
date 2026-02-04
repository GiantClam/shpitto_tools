import React from "react";

import { cn } from "@/lib/cn";

type MarqueeProps = {
  items: Array<string | React.ReactNode>;
  className?: string;
  speed?: number;
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
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
