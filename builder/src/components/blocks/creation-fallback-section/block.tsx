"use client";

import * as React from "react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "@/components/ui-exports";

export const config = {
  fields: {
    title: { type: "text" },
    subtitle: { type: "text" },
    variant: { type: "select", options: ["content", "catalog", "contact", "cta", "socialProof"] },
    ctaStyle: { type: "select", options: ["auto", "surface", "contrast"] },
    ctaLabel: { type: "text" },
    ctaHref: { type: "text" },
    secondaryCtaLabel: { type: "text" },
    secondaryCtaHref: { type: "text" },
    legal: { type: "text" },
    whatsapp: { type: "text" }
  },
  defaultProps: {
    title: "Section",
    subtitle: "Generated with safe fallback template.",
    variant: "content",
    ctaStyle: "auto",
    ctaLabel: "Contact Sales",
    ctaHref: "#contact",
    secondaryCtaLabel: "",
    secondaryCtaHref: "",
    legal: "",
    whatsapp: ""
  }
};

export default function CreationFallbackSection(props) {
  const {
    anchor = "section",
    title = "Section",
    subtitle = "",
    variant = "content",
    ctaStyle = "auto",
    items = [],
    ctaLabel = "Contact Sales",
    ctaHref = "#contact",
    secondaryCtaLabel = "",
    secondaryCtaHref = "",
    legal = "",
    footerLinks = [],
    logos = [],
    testimonials = [],
    whatsapp = "",
  } = props || {};

  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const safeFooterLinks = Array.isArray(footerLinks) ? footerLinks.slice(0, 4) : [];
  const safeLogos = Array.isArray(logos) ? logos.filter(Boolean).slice(0, 8) : [];
  const safeTestimonials = Array.isArray(testimonials) ? testimonials.filter(Boolean).slice(0, 3) : [];
  const catalogItems = safeItems.length
    ? safeItems.slice(0, 8)
    : [
        { title: "Premium Towels", desc: "Fast sampling and custom branding." },
        { title: "Bathrobes", desc: "Hotel-grade fabrics and stitching." },
        { title: "Bath Mats", desc: "High-absorbency, anti-slip options." },
        { title: "Beach Towels", desc: "Vibrant prints for resort programs." },
      ];

  if (variant === "catalog") {
    return (
      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
            {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {catalogItems.map((item, index) => (
              <Card key={index} className="border-border/70 bg-background/70">
                <CardHeader>
                  <CardTitle className="text-base">{item.title || "Product"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.desc || "Customizable specification available."}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "contact") {
    return (
      <section id="contact" className="py-20">
        <div className="mx-auto w-full max-w-4xl px-6">
          <Card className="border-border/70 bg-background/80">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">Lead Capture</Badge>
              <CardTitle className="text-2xl">{title}</CardTitle>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input placeholder="Name" />
                <Input placeholder="Work Email" />
                <Input placeholder="Company" />
                <Input placeholder="Country" />
              </div>
              <Textarea placeholder="Tell us your product requirements..." rows={5} />
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={ctaHref}>{ctaLabel}</a>
                </Button>
                {whatsapp ? (
                  <Button asChild variant="secondary" size="lg">
                    <a href={whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${String(whatsapp).replace(/[^0-9]/g, "")}`}>WhatsApp</a>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (variant === "cta") {
    const normalizedStyle = ["auto", "surface", "contrast"].includes(String(ctaStyle))
      ? String(ctaStyle)
      : "auto";
    const hasSecondary = Boolean(
      typeof secondaryCtaLabel === "string" &&
        secondaryCtaLabel.trim() &&
        typeof secondaryCtaHref === "string" &&
        secondaryCtaHref.trim()
    );
    const hasMeta = Boolean((typeof legal === "string" && legal.trim()) || safeFooterLinks.length);
    const sectionToneClass =
      normalizedStyle === "contrast"
        ? "bg-foreground text-background"
        : normalizedStyle === "surface"
          ? "bg-muted/40 text-foreground"
          : "bg-background text-foreground";
    const primaryBtnClass =
      normalizedStyle === "contrast"
        ? "rounded-full bg-background text-foreground hover:bg-background/90 px-8"
        : "rounded-full px-8";
    const secondaryBtnClass =
      normalizedStyle === "contrast"
        ? "rounded-full border-background/40 text-background hover:bg-background hover:text-foreground px-8"
        : "rounded-full px-8";

    return (
      <section id={anchor} className={`${sectionToneClass} py-20 md:py-24 lg:py-28`}>
        <div className="mx-auto w-full max-w-[1200px] px-6 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-tight">{title}</h2>
            {subtitle ? (
              <p className={`mx-auto max-w-2xl text-sm md:text-base ${normalizedStyle === "contrast" ? "text-background/75" : "text-muted-foreground"}`}>
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className={`flex flex-col items-center justify-center gap-3 ${hasSecondary ? "sm:flex-row" : ""}`}>
            <Button asChild size="lg" className={primaryBtnClass}>
              <a href={ctaHref}>{ctaLabel}</a>
            </Button>
            {hasSecondary ? (
              <Button asChild size="lg" variant="outline" className={secondaryBtnClass}>
                <a href={secondaryCtaHref}>{secondaryCtaLabel}</a>
              </Button>
            ) : null}
          </div>
          {hasMeta ? (
            <div className={`pt-8 border-t flex flex-col gap-4 text-xs md:flex-row md:items-center md:justify-between ${normalizedStyle === "contrast" ? "border-background/15 text-background/60" : "border-border text-muted-foreground"}`}>
              <span>{legal}</span>
              {safeFooterLinks.length ? (
                <div className="flex items-center justify-center gap-4 md:justify-end">
                  {safeFooterLinks.map((item, index) => (
                    <a
                      key={index}
                      href={item?.href || "#"}
                      className={`transition-colors ${normalizedStyle === "contrast" ? "hover:text-background" : "hover:text-foreground"}`}
                    >
                      {item?.label || "Link"}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (variant === "socialProof") {
    const fallbackLogos = safeLogos.length
      ? safeLogos
      : ["NASA", "SpaceX", "Uber", "VISA", "Airbnb", "Meta"];
    const fallbackTestimonials = safeTestimonials.length
      ? safeTestimonials
      : [
          {
            name: "Alexander Vane",
            role: "CEO at Shpitto",
            quote:
              "Sixtine didn't just design a house; they curated a lifestyle.",
          },
          {
            name: "Isabelle Dubois",
            role: "Founder of ArtHouse",
            quote:
              "An absolute masterclass in restraint and elegance for premium spaces.",
          },
        ];
    return (
      <section id={anchor} className="py-20 bg-muted/30">
        <div className="mx-auto w-full max-w-[1200px] px-6 space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Collaborators</p>
            <h2 className="font-heading text-3xl md:text-4xl tracking-tight">{title || "Building for world-class innovators"}</h2>
            {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-6">
            {fallbackLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center rounded-md border border-border/50 bg-background/60 px-4 py-3 text-sm text-muted-foreground"
              >
                {typeof logo === "string" ? logo : logo?.name || "Brand"}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fallbackTestimonials.map((item, index) => (
              <Card key={index} className="border-border/60 bg-background/80">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">{item?.name || "Client"}</CardTitle>
                  <p className="text-xs text-muted-foreground">{item?.role || "Client"}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item?.quote || "Trusted by teams that expect premium execution and clear outcomes."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="mx-auto w-full max-w-5xl px-6">
        <Card className="border-border/70 bg-background/70">
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
            <Button asChild>
              <a href={ctaHref}>{ctaLabel}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}