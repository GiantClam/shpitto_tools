import React from "react";

import { cn } from "@/lib/cn";

type GlowCardProps = {
  children?: React.ReactNode;
  className?: string;
  intensity?: "soft" | "medium" | "strong";
};

export function GlowCard({ children, className, intensity = "medium" }: GlowCardProps) {
  const glow =
    intensity === "strong"
      ? "from-primary/40 via-sky-500/30 to-fuchsia-500/40"
      : intensity === "soft"
        ? "from-primary/20 via-sky-400/15 to-fuchsia-400/20"
        : "from-primary/30 via-sky-500/20 to-fuchsia-500/30";

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn("pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r blur-2xl", glow)}
      />
      <div className="relative rounded-3xl border border-border/40 bg-background/80 backdrop-blur">
        {children}
      </div>
    </div>
  );
}
