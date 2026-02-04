import React from "react";

import { cn } from "@/lib/cn";
import { Slider } from "@/components/ui/slider";

type ComparisonSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  className?: string;
  imageClassName?: string;
};

export function ComparisonSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "",
  afterAlt = "",
  defaultValue = 50,
  value,
  onValueChange,
  className,
  imageClassName,
}: ComparisonSliderProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const currentValue = typeof value === "number" ? value : internal;
  const clampedValue = Math.min(100, Math.max(0, currentValue));

  return (
    <div className={cn("w-full", className)}>
      <div className="relative overflow-hidden rounded-3xl bg-muted">
        <img
          src={afterSrc}
          alt={afterAlt}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${clampedValue}%` }}
        >
          <img
            src={beforeSrc}
            alt={beforeAlt}
            className={cn("h-full w-full object-cover", imageClassName)}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 left-0"
          style={{ width: `${clampedValue}%` }}
        >
          <div className="absolute inset-y-0 right-0 w-px bg-white/70" />
          <div className="absolute top-1/2 right-0 flex size-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-white/60 bg-black/40 backdrop-blur">
            <div className="h-4 w-px bg-white/70" />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Slider
          value={[clampedValue]}
          max={100}
          min={0}
          onValueChange={(next) => {
            const nextValue = next[0] ?? 0;
            if (typeof value !== "number") {
              setInternal(nextValue);
            }
            onValueChange?.(nextValue);
          }}
        />
      </div>
    </div>
  );
}
