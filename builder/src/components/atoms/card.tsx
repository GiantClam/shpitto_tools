import React from "react";

import { cn } from "@/lib/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, style, ...props }: CardProps) {
  const hasExplicitBackgroundClass = typeof className === "string" && /\bbg-[^\s]+/.test(className);
  const mergedStyle = hasExplicitBackgroundClass
    ? style
    : { background: "var(--card, hsl(var(--background)))", ...(style ?? {}) };
  return (
    <div
      className={cn(
        "rounded-[calc(var(--radius)+2px)] border border-border bg-background shadow-sm",
        className
      )}
      {...props}
      style={mergedStyle}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardProps) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }: CardProps) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
