"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";

type CarouselProps = {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  showControls?: boolean;
};

export function Carousel({
  items,
  className,
  itemClassName,
  showControls = true,
}: CarouselProps) {
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  const scrollBy = React.useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.clientWidth || 0;
    track.scrollBy({ left: direction * width * 0.85, behavior: "smooth" });
  }, []);

  if (!items?.length) return null;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        className={cn(
          "flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "snap-start shrink-0 w-[80%] md:w-[60%] lg:w-[45%]",
              itemClassName
            )}
          >
            {item}
          </div>
        ))}
      </div>
      {showControls && items.length > 1 ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
          <button
            type="button"
            className="pointer-events-auto ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur hover:bg-background"
            onClick={() => scrollBy(-1)}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="pointer-events-auto mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur hover:bg-background"
            onClick={() => scrollBy(1)}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
