"use client";

import React from "react";

import { cn } from "@/lib/cn";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel } from "@/components/magic/carousel";

type SceneItem = {
  id?: string;
  title: string;
  description?: string;
  image?: string;
  eyebrow?: string;
};

type SceneSwitcherProps = {
  items: SceneItem[];
  variant?: "auto" | "tabs" | "carousel";
  className?: string;
  cardClassName?: string;
};

export function SceneSwitcher({
  items,
  variant = "auto",
  className,
  cardClassName,
}: SceneSwitcherProps) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!safeItems.length) return null;
  const mode =
    variant === "auto" ? (safeItems.length <= 3 ? "tabs" : "carousel") : variant;

  if (mode === "carousel") {
    return (
      <Carousel
        className={className}
        items={safeItems.map((item, index) => (
          <Card
            key={item.id ?? `scene-${index}`}
            className={cn("overflow-hidden bg-card/60", cardClassName)}
          >
            <CardContent className="p-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-56 w-full object-cover md:h-64"
                  loading="lazy"
                />
              ) : null}
              <div className="space-y-2 p-6">
                {item.eyebrow ? (
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {item.eyebrow}
                  </p>
                ) : null}
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      />
    );
  }

  const defaultValue = safeItems[0]?.id ?? "scene-0";

  return (
    <Tabs defaultValue={defaultValue} className={cn("w-full", className)}>
      <TabsList
        className="mx-auto mb-6 grid w-full max-w-3xl"
        style={{ gridTemplateColumns: `repeat(${safeItems.length}, minmax(0, 1fr))` }}
      >
        {safeItems.map((item, index) => {
          const value = item.id ?? `scene-${index}`;
          return (
            <TabsTrigger key={value} value={value} className="text-xs uppercase tracking-[0.2em]">
              {item.title}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {safeItems.map((item, index) => {
        const value = item.id ?? `scene-${index}`;
        return (
          <TabsContent key={value} value={value} className="m-0">
            <Card className={cn("overflow-hidden bg-card/60", cardClassName)}>
              <CardContent className="p-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-72 w-full object-cover md:h-96"
                    loading="lazy"
                  />
                ) : null}
                <div className="space-y-2 p-6 md:p-8">
                  {item.eyebrow ? (
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.eyebrow}
                    </p>
                  ) : null}
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="text-base text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
