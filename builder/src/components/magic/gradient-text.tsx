import React from "react";

import { cn } from "@/lib/cn";

type GradientTextProps = {
  children?: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
};

export function GradientText({
  children,
  className,
  from = "from-primary",
  via = "via-sky-400",
  to = "to-fuchsia-500",
}: GradientTextProps) {
  return (
    <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", from, via, to, className)}>
      {children}
    </span>
  );
}
