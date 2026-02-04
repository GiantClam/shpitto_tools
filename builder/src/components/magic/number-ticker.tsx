import React from "react";

import { cn } from "@/lib/cn";

type NumberTickerProps = {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

export function NumberTicker({
  value,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const safeValue = Number.isFinite(value) ? value : 0;
    const startValue = displayValue;
    const start = performance.now();

    let rafId = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + (safeValue - startValue) * eased;
      setDisplayValue(nextValue);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  const formatted =
    decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <span className={cn("tabular-nums tracking-tight", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
