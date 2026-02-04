import React from "react";

import { cn } from "@/lib/cn";

type ParticlesProps = {
  children?: React.ReactNode;
  className?: string;
  density?: number;
  color?: string;
};

export function Particles({
  children,
  className,
  density = 64,
  color = "rgba(255,255,255,0.35)",
}: ParticlesProps) {
  const backgroundImage = `radial-gradient(circle at 1px 1px, ${color} 1px, transparent 0)`;
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ backgroundImage, backgroundSize: `${density}px ${density}px` }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
