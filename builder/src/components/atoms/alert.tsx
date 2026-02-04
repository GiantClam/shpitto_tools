import React from "react";

import { cn } from "@/lib/cn";

type AlertVariant = "default" | "destructive";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

const variantClasses: Record<AlertVariant, string> = {
  default: "border-border bg-muted/30 text-foreground",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function Alert({ variant = "default", className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn("relative w-full rounded-lg border p-4 text-sm", variantClasses[variant], className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1 text-sm font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
