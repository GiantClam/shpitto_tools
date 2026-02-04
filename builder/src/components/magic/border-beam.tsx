import React from "react";

import { cn } from "@/lib/cn";

type BorderBeamProps = {
  children?: React.ReactNode;
  className?: string;
};

export function BorderBeam({ children, className }: BorderBeamProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-gradient-to-r from-primary/40 via-sky-400/40 to-fuchsia-400/40 p-[1px]",
        className
      )}
    >
      <div className="rounded-[18px] bg-background/70 backdrop-blur">
        {children}
      </div>
    </div>
  );
}
