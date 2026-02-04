"use client";

import React from "react";
import { cn } from "@/lib/cn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/atoms/accordion";
import {
  BaseBlockProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";
import { useMotionMode } from "@/components/theme/motion";
import { faqSectionClass } from "./variants";

export type FAQItem = { q: string; a: string };

export type FAQAccordionProps = BaseBlockProps & {
  title?: string;
  items: FAQItem[];
};

export type FAQVariant = "singleOpen" | "multiOpen";

export function FAQAccordionBlock({
  id,
  anchor,
  paddingY = "lg",
  background = "none",
  backgroundMedia,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  align = "left",
  maxWidth = "xl",
  emphasis = "normal",
  title,
  items,
  headingFont,
  bodyFont,
  variant = "singleOpen",
}: FAQAccordionProps & { variant?: FAQVariant }) {
  const motionMode = useMotionMode();
  const motionClass =
    motionMode === "off" ? "" : "transition-colors duration-300";
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
  return (
    <section
      id={anchor}
      data-block="FAQAccordion"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        faqSectionClass({ paddingY, background }),
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
        {title ? (
          <div className={cn("mb-8", align === "center" ? "text-center" : "text-left")}>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={headingStyle}>
              {title}
            </h2>
          </div>
        ) : null}

        <Accordion
          type={variant === "multiOpen" ? "multiple" : "single"}
          collapsible={variant !== "multiOpen"}
          className="w-full"
        >
          {items.slice(0, 12).map((it, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className={cn("border-border", motionClass)}
            >
              <AccordionTrigger
                className={cn("text-left", emphasis === "high" ? "hover-underline" : "")}
                style={bodyStyle}
              >
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground" style={bodyStyle}>
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
