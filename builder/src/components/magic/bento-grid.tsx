import React from "react";

import { cn } from "@/lib/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type BentoItem = {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  className?: string;
};

type BentoGridProps = {
  items: BentoItem[];
  className?: string;
};

export function BentoGrid({ items, className }: BentoGridProps) {
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {safeItems.map((item, index) => (
        <Card
          key={`${item.title}-${index}`}
          className={cn("border-border/60 bg-background/60 backdrop-blur", item.className)}
        >
          <CardHeader className="space-y-2">
            {item.eyebrow ? (
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {item.eyebrow}
              </p>
            ) : null}
            <div className="flex items-center gap-3">
              {item.icon ? (
                <span className="text-primary/80">{item.icon}</span>
              ) : null}
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </div>
          </CardHeader>
          {item.description ? (
            <CardContent className="text-sm text-muted-foreground">
              {item.description}
            </CardContent>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

export function BentoCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn("border-border/60 bg-background/60 backdrop-blur", className)}
      {...props}
    />
  );
}
