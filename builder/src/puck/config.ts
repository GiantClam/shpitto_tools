import React from "react";
import type { Config } from "@measured/puck";
import { HeroCenteredBlock } from "@/components/blocks/hero-centered/block";
import { HeroSplitBlock } from "@/components/blocks/hero-split/block";
import { FeatureGridBlock } from "@/components/blocks/feature-grid/block";
import { FeatureWithMediaBlock } from "@/components/blocks/feature-with-media/block";
import { PricingCardsBlock } from "@/components/blocks/pricing-cards/block";
import { FAQAccordionBlock } from "@/components/blocks/faq-accordion/block";
import { FooterBlock } from "@/components/blocks/footer/block";
import { LogoCloudBlock } from "@/components/blocks/logo-cloud/block";
import { TestimonialsGridBlock } from "@/components/blocks/testimonials-grid/block";
import { CaseStudiesBlock } from "@/components/blocks/case-studies/block";
import { LeadCaptureCTABlock } from "@/components/blocks/lead-capture-cta/block";
import { CardsGridBlock } from "@/components/blocks/cards-grid/block";
import { NavbarBlock } from "@/components/blocks/navbar/block";
import { AtomicTextBlock } from "@/components/blocks/atomic-text/block";
import { AtomicButtonBlock } from "@/components/blocks/atomic-button/block";
import { AtomicImageBlock } from "@/components/blocks/atomic-image/block";
import {
  booleanField,
  listField,
  selectField,
  textField,
  textareaField,
} from "@/puck/field-adapters";

const renderBlock = (Block: React.ComponentType<any>) => (props: any) =>
  React.createElement(Block, props);

export const puckConfig: Config = {
  components: {
    AtomicText: {
      render: renderBlock(AtomicTextBlock),
      defaultProps: { id: "atom-text-1", text: "Sample text", size: "md", align: "left" },
      fields: {
        text: textField("Text"),
        size: selectField("Size", ["sm", "md", "lg"]),
        align: selectField("Align", ["left", "center"]),
      },
    },
    AtomicButton: {
      render: renderBlock(AtomicButtonBlock),
      defaultProps: { id: "atom-button-1", label: "Click", href: "#", variant: "primary" },
      fields: {
        label: textField("Label"),
        href: textField("Href"),
        variant: selectField("Variant", ["primary", "secondary", "link"]),
      },
    },
    AtomicImage: {
      render: renderBlock(AtomicImageBlock),
      defaultProps: { id: "atom-image-1", src: "/assets/placeholder.png", alt: "", rounded: true },
      fields: {
        src: textField("Src"),
        alt: textField("Alt"),
        width: textField("Width"),
        height: textField("Height"),
        rounded: booleanField("Rounded"),
      },
    },
    Navbar: {
      render: renderBlock(NavbarBlock),
      defaultProps: {
        id: "Navbar-1",
        logo: { src: "", alt: "Site" },
        links: [
          { label: "Home", href: "#top" },
          { label: "Solutions", href: "#solutions" },
          { label: "Products", href: "#products" },
          { label: "News", href: "#news" },
        ],
        ctas: [{ label: "Contact", href: "#contact", variant: "primary" }],
        sticky: true,
        paddingY: "sm",
        maxWidth: "xl",
      },
      fields: {
        variant: selectField("Variant", ["simple", "withDropdown", "withCTA"]),
        sticky: booleanField("Sticky"),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        links: listField("Links", {
          label: textField("Label"),
          href: textField("Href"),
        }),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
      },
    },
    HeroCentered: {
      render: renderBlock(HeroCenteredBlock),
      defaultProps: {
        id: "hero-01",
        title: "Build faster with reusable blocks",
        subtitle: "shadcn/ui + Magic UI + Puck, fully owned components.",
        ctas: [{ label: "Get started", href: "#pricing", variant: "primary" }],
        align: "center",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        eyebrow: textField("Eyebrow"),
        align: selectField("Align", ["left", "center"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        headingSize: selectField("Heading Size", ["sm", "md", "lg"]),
        bodySize: selectField("Body Size", ["sm", "md", "lg"]),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
      },
    },
    HeroSplit: {
      render: renderBlock(HeroSplitBlock),
      defaultProps: {
        id: "hero-split-1",
        title: "Build faster with reusable blocks",
        subtitle: "Pair a strong message with a supporting media asset.",
        ctas: [{ label: "Get started", href: "#pricing", variant: "primary" }],
        mediaPosition: "right",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        mediaPosition: selectField("Media Position", ["left", "right"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        headingSize: selectField("Heading Size", ["sm", "md", "lg"]),
        bodySize: selectField("Body Size", ["sm", "md", "lg"]),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
      },
    },
    FeatureGrid: {
      render: renderBlock(FeatureGridBlock),
      defaultProps: {
        id: "FeatureGrid-1",
        title: "Features",
        items: [
          { title: "Fast", desc: "Ship quickly with a stable block library.", icon: "rocket" },
          { title: "Maintainable", desc: "Schemas + variants keep assets clean.", icon: "shield" },
          { title: "Flexible", desc: "Swap theme tokens without rewriting UI.", icon: "sparkles" },
        ],
        variant: "3col",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        variant: selectField("Columns", ["2col", "3col", "4col"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        items: listField("Items", {
          title: textField("Title"),
          desc: textareaField("Description"),
          icon: textField("Icon Key"),
        }),
      },
    },
    FeatureWithMedia: {
      render: renderBlock(FeatureWithMediaBlock),
      defaultProps: {
        id: "FeatureWithMedia-1",
        title: "Feature with media",
        subtitle: "Pair supporting copy with an image or video.",
        body: "Explain the value proposition and guide users to the next step.",
        ctas: [{ label: "Learn more", href: "#", variant: "primary" }],
        variant: "split",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        body: textareaField("Body"),
        variant: selectField("Layout", ["simple", "split", "reverse"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
        items: listField("Items", {
          title: textField("Title"),
          desc: textareaField("Description"),
        }),
        mediaSrc: textField("Media Src"),
        mediaAlt: textField("Media Alt"),
        mediaKind: selectField("Media Kind", ["image", "video"]),
      },
    },
    PricingCards: {
      render: renderBlock(PricingCardsBlock),
      defaultProps: {
        id: "PricingCards-1",
        title: "Pricing",
        billingToggle: false,
        plans: [
          {
            name: "Starter",
            price: "$19",
            period: "mo",
            features: ["Feature A", "Feature B", "Email support"],
            cta: { label: "Choose Starter", href: "#", variant: "secondary" },
          },
          {
            name: "Pro",
            price: "$49",
            period: "mo",
            highlighted: true,
            features: ["Everything in Starter", "Advanced analytics", "Priority support"],
            cta: { label: "Choose Pro", href: "#", variant: "primary" },
          },
        ],
        variant: "2up",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        billingToggle: booleanField("Billing Toggle"),
        variant: selectField("Layout", ["2up", "3up", "withToggle"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        plans: listField("Plans", {
          name: textField("Name"),
          price: textField("Price"),
          period: selectField("Period", ["mo", "yr"]),
          highlighted: booleanField("Highlighted"),
        }),
      },
    },
    FAQAccordion: {
      render: renderBlock(FAQAccordionBlock),
      defaultProps: {
        id: "FAQAccordion-1",
        title: "FAQ",
        items: [
          { q: "Can I import JSON into Puck?", a: "Yes. The page data is stored as structured JSON." },
          { q: "Is this maintainable long term?", a: "Yes. Blocks are versioned and schema-validated." },
          { q: "Can I turn off animations?", a: "Yes. Motion mode can be disabled globally." },
        ],
        variant: "singleOpen",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        variant: selectField("Mode", ["singleOpen", "multiOpen"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        items: listField("Items", {
          q: textField("Question"),
          a: textareaField("Answer"),
        }),
      },
    },
    Footer: {
      render: renderBlock(FooterBlock),
      defaultProps: {
        id: "Footer-1",
        columns: [
          {
            title: "Product",
            links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }],
          },
          {
            title: "Company",
            links: [{ label: "About", href: "#" }, { label: "Contact", href: "#" }],
          },
          {
            title: "Legal",
            links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }],
          },
        ],
        variant: "multiColumn",
        paddingY: "md",
        maxWidth: "xl",
      },
      fields: {
        variant: selectField("Layout", ["simple", "multiColumn"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        legal: textField("Legal"),
        columns: listField("Columns", {
          title: textField("Title"),
        }),
      },
    },
    LogoCloud: {
      render: renderBlock(LogoCloudBlock),
      defaultProps: {
        id: "LogoCloud-1",
        title: "Trusted by teams",
        logos: [
          { src: "/assets/logo-1.svg", alt: "Logo" },
          { src: "/assets/logo-2.svg", alt: "Logo" },
          { src: "/assets/logo-3.svg", alt: "Logo" },
        ],
        variant: "grid",
        paddingY: "md",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        variant: selectField("Variant", ["grid", "marquee"]),
      },
    },
    TestimonialsGrid: {
      render: renderBlock(TestimonialsGridBlock),
      defaultProps: {
        id: "Testimonials-1",
        title: "What customers say",
        items: [
          { quote: "Great experience.", name: "Alex", role: "Founder" },
          { quote: "Loved the workflow.", name: "Sam", role: "Product" },
        ],
        variant: "2col",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        variant: selectField("Variant", ["2col", "3col"]),
      },
    },
    CaseStudies: {
      render: renderBlock(CaseStudiesBlock),
      defaultProps: {
        id: "CaseStudies-1",
        title: "Case Studies",
        items: [
          { title: "Case Study A", summary: "Summary", href: "#" },
          { title: "Case Study B", summary: "Summary", href: "#" },
        ],
        variant: "cards",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        variant: selectField("Variant", ["cards", "list"]),
      },
    },
    LeadCaptureCTA: {
      render: renderBlock(LeadCaptureCTABlock),
      defaultProps: {
        id: "LeadCaptureCTA-1",
        title: "Talk to the team",
        subtitle: "Share a few details and we will follow up.",
        cta: { label: "Request Demo", href: "#", variant: "primary" },
        variant: "banner",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        variant: selectField("Variant", ["banner", "card"]),
      },
    },
    CardsGrid: {
      render: renderBlock(CardsGridBlock),
      defaultProps: {
        id: "CardsGrid-1",
        title: "Highlights",
        subtitle: "Flexible cards for products, people, or media.",
        variant: "product",
        columns: "3col",
        density: "normal",
        cardStyle: "glass",
        imagePosition: "top",
        imageSize: "md",
        imageShape: "rounded",
        headingSize: "md",
        bodySize: "md",
        items: [
          {
            title: "Card title",
            subtitle: "Short subtitle",
            description: "Add supporting copy for the card.",
            image: { src: "/assets/placeholder.png", alt: "Card image" },
          },
          {
            title: "Card title",
            subtitle: "Short subtitle",
            description: "Add supporting copy for the card.",
            image: { src: "/assets/placeholder.png", alt: "Card image" },
          },
          {
            title: "Card title",
            subtitle: "Short subtitle",
            description: "Add supporting copy for the card.",
            image: { src: "/assets/placeholder.png", alt: "Card image" },
          },
        ],
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        variant: selectField("Variant", ["product", "person", "media", "imageText", "poster"]),
        columns: selectField("Columns", ["2col", "3col", "4col"]),
        density: selectField("Density", ["compact", "normal", "spacious"]),
        cardStyle: selectField("Card Style", ["glass", "solid", "muted"]),
        imagePosition: selectField("Image Position", ["top", "left", "right"]),
        imageSize: selectField("Image Size", ["sm", "md", "lg"]),
        imageShape: selectField("Image Shape", ["square", "rounded", "circle"]),
        headingSize: selectField("Heading Size", ["sm", "md", "lg"]),
        bodySize: selectField("Body Size", ["sm", "md", "lg"]),
        headingFont: textField("Heading Font"),
        bodyFont: textField("Body Font"),
        textAlign: selectField("Text Align", ["left", "center"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        items: listField("Items", {
          title: textField("Title"),
          subtitle: textField("Subtitle"),
          description: textareaField("Description"),
          eyebrow: textField("Eyebrow"),
          tag: textField("Tag"),
          meta: textField("Meta"),
          price: textField("Price"),
          role: textField("Role"),
          imageSrc: textField("Image Src"),
          imageAlt: textField("Image Alt"),
        }),
      },
    },
  },
};
