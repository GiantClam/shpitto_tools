import React from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "secondary" | "outline";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const baseClasses =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-muted text-foreground",
  outline: "border border-border text-foreground",
};

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span className={cn(baseClasses, variantClasses[variant], className)} {...props} />
  );
}
