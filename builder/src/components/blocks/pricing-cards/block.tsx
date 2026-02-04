"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/atoms/card";
import { Check } from "lucide-react";
import { useMotionMode } from "@/components/theme/motion";

import {
  BaseBlockProps,
  LinkProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";
import { pricingGridClass, pricingSectionClass } from "./variants";

export type PricingPlan = {
  name: string;
  price: string;
  period?: "mo" | "yr";
  features: string[];
  cta: LinkProps;
  highlighted?: boolean;
};

export type PricingCardsProps = BaseBlockProps & {
  title?: string;
  billingToggle?: boolean;
  plans: PricingPlan[];
};

export type PricingCardsVariant = "2up" | "3up" | "withToggle";

export function PricingCardsBlock({
  id,
  anchor,
  paddingY = "lg",
  background = "none",
  backgroundMedia,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  align = "center",
  maxWidth = "xl",
  emphasis = "normal",
  title,
  billingToggle = false,
  plans,
  headingFont,
  bodyFont,
  variant = "3up",
}: PricingCardsProps & { variant?: PricingCardsVariant }) {
  const motionMode = useMotionMode();
  const motionClass =
    motionMode === "off"
      ? ""
      : "transition-all duration-300 hover:-translate-y-1 hover:shadow-md";
  const [billing, setBilling] = useState<"mo" | "yr">("mo");
  const backgroundStyle = {
    ...(backgroundMediaStyle(background, backgroundMedia) || {}),
    ...(backgroundGradientStyle(background, backgroundGradient) || {}),
  };
  const overlayStyle = backgroundOverlayStyle(
    backgroundOverlay,
    backgroundOverlayOpacity,
    backgroundBlur
  );
  const backgroundVideo = backgroundVideoSource(background, backgroundMedia);
  const hasBackgroundVideo = Boolean(backgroundVideo?.src);
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;

  const displayPlans = useMemo(() => {
    if (!billingToggle) return plans;
    return plans.map((p) => ({ ...p, period: p.period ?? billing }));
  }, [plans, billingToggle, billing]);

  return (
    <section
      id={anchor}
      data-block="PricingCards"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        pricingSectionClass({ paddingY, background }),
        hasBackgroundVideo ? "relative overflow-hidden" : ""
      )}
      style={backgroundStyle}
    >
      {hasBackgroundVideo ? (
        <video
          src={backgroundVideo?.src}
          poster={backgroundVideo?.poster}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : null}
      {overlayStyle ? (
        <div className="absolute inset-0" style={{ ...overlayStyle, zIndex: 1 }} />
      ) : null}
      <div
        className={cn(
          "mx-auto px-4 sm:px-6",
          maxWidthClass(maxWidth),
          hasBackgroundVideo ? "relative z-10" : ""
        )}
      >
        <div className={cn("mb-10", align === "center" ? "text-center" : "text-left")}>
          {title ? (
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={headingStyle}>
              {title}
            </h2>
          ) : null}

          {billingToggle ? (
            <div className="mt-6 inline-flex rounded-lg border border-border p-1">
              <button
                type="button"
                onClick={() => setBilling("mo")}
                className={cn(
                  "rounded-md px-3 py-1 text-sm",
                  billing === "mo"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
                style={bodyStyle}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("yr")}
                className={cn(
                  "rounded-md px-3 py-1 text-sm",
                  billing === "yr"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
                style={bodyStyle}
              >
                Yearly
              </button>
            </div>
          ) : null}
        </div>

        <div
          className={pricingGridClass({ variant: billingToggle ? "withToggle" : variant })}
          style={{ gap: "var(--space-3)" }}
        >
          {displayPlans.slice(0, 4).map((p, idx) => (
            <Card
              key={idx}
              className={cn(
                "border-border bg-background/60",
                p.highlighted && "border-primary shadow-sm",
                emphasis === "high" ? "card-glass hover-lift" : "",
                motionClass
              )}
            >
              <CardHeader className="space-y-3">
                <CardTitle className="text-base" style={headingStyle}>
                  {p.name}
                </CardTitle>
                <div>
                  <div className="text-3xl font-semibold tracking-tight" style={headingStyle}>
                    {p.price}
                  </div>
                  {p.period ? (
                    <div className="mt-1 text-sm text-muted-foreground" style={bodyStyle}>
                      per {p.period === "mo" ? "month" : "year"}
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  {p.features.slice(0, 12).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span style={bodyStyle}>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={p.cta.variant === "secondary" ? "secondary" : "default"}
                  data-emphasis={emphasis}
                >
                  <a href={p.cta.href} className={cn(emphasis === "high" && p.highlighted ? "btn-glow" : "")}>
                    {p.cta.label}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
