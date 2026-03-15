import fs from "node:fs/promises";
import path from "node:path";

const SITE_KEY = "lc-cnc-industrial-sea";
const REPO_ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const OUT_DIR = path.join(REPO_ROOT, "asset-factory", "out", "p2w", SITE_KEY);
const SANDBOX_DIR = path.join(OUT_DIR, "sandbox");

const WHATSAPP_NUMBER = "+86-158-1370-3777";
const WHATSAPP_LINK = "https://wa.me/8615813703777?text=Hello%20LC-CNC%2C%20I%20want%20a%20quote%20for%203C%20CNC%20machines.";
const CATALOG_LINK = "/contact#quote-form";
const CONTACT_EMAIL = "sales@lc-cnc.com";
const CONTACT_ADDRESS = "Bao'an, Shenzhen, China";
const YEAR = "2024";

const ASSET_BASE = "/assets/lc-cnc";
const assets = {
  logo: `${ASSET_BASE}/lc-cnc-wordmark.svg`,
  hero: `${ASSET_BASE}/factory-workshop.jpg`,
  phone: `${ASSET_BASE}/cnc-closeup-1.jpg`,
  laptop: `${ASSET_BASE}/cnc-closeup-2.jpg`,
  camera: `${ASSET_BASE}/cnc-closeup-3.jpg`,
  keypad: `${ASSET_BASE}/cnc-closeup-4.jpg`,
};

const theme = {
  mode: "light",
  motion: "subtle",
  radius: "0.25rem",
  fontHeading: "Helvetica Neue",
  fontBody: "Helvetica Neue",
  palette: {
    background: "#ececec",
    foreground: "#202329",
    primary: "#b00046",
    accent: "#f3efe8",
    muted: "#dedbd6",
    border: "#c6c0b8",
  },
};

const navLinks = [
  { label: "Home", href: "/" },
  { label: "3C Machines", href: "/3c-machines" },
  { label: "Custom Solutions", href: "/custom-solutions" },
  { label: "Cases", href: "/cases" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const templateBlocks = {
  homeHero: "TemplateExclusivePenSiteHomeHeroHeropenPrimary_369485b5",
  industries: "TemplateExclusivePenSiteHomeStoryIndustriespenAlt1",
  numbers: "TemplateExclusivePenSiteHomeStoryNumberspenAlt8",
  editorial: "TemplateExclusivePenSiteHomeCtaNewsfrombretonworldpenAlt7",
};

const safeBuiltinBlocks = new Set(Object.values(templateBlocks));

const navbarCode = String.raw`"use client";

import * as React from "react";

export const config = {
  fields: {
    brand: { type: "text" },
  },
};

export default function LCCncBretonNavbar(props) {
  const {
    brand = "LC-CNC™",
    logoSrc = "",
    links = [],
    whatsappHref = "#",
  } = props || {};

  const safeLinks = Array.isArray(links) ? links.slice(0, 6) : [];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#b00046]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-8 px-6 py-5 text-white">
        <a href="/" className="flex min-w-0 items-center gap-4">
          {logoSrc ? (
            <img src={logoSrc} alt={brand} className="h-9 w-auto object-contain" />
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center border border-white/35 text-[12px] font-semibold tracking-[0.18em]">
              LC
            </span>
          )}
          <span className="text-[18px] font-semibold tracking-[0.12em]">{brand}</span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {safeLinks.map((link) => (
            <a
              key={link?.href || link?.label}
              href={link?.href || "/"}
              className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/90 transition-colors hover:text-white"
            >
              {link?.label || ""}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="/contact"
            className="hidden rounded-full border border-white/35 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10 md:inline-flex"
          >
            Request Catalog
          </a>
          <a
            href={whatsappHref}
            className="inline-flex rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b00046] transition-transform hover:-translate-y-0.5"
          >
            WhatsApp Quote
          </a>
        </div>
      </div>
    </header>
  );
}
`;

const pageHeroCode = String.raw`"use client";

import * as React from "react";

export const config = {
  fields: {
    eyebrow: { type: "text" },
    title: { type: "text" },
    subtitle: { type: "textarea" },
  },
};

export default function LCCncBretonPageHero(props) {
  const {
    eyebrow = "LC-CNC",
    title = "Industrial Page",
    subtitle = "",
    imageSrc = "",
    imageAlt = "",
    stats = [],
  } = props || {};

  const safeStats = Array.isArray(stats) ? stats.slice(0, 4) : [];

  return (
    <section className="border-b border-[#cfc8bf] bg-[#ececec]">
      <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:py-20">
        <div className="space-y-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b00046]">{eyebrow}</p>
          <h1 className="max-w-4xl text-[46px] font-semibold leading-[1.02] tracking-tight text-[#202329] md:text-[64px]">
            {title}
          </h1>
          {subtitle ? <p className="max-w-3xl text-[17px] leading-8 text-[#5b6069]">{subtitle}</p> : null}
          <div className="grid gap-3 md:grid-cols-2">
            {safeStats.map((item) => (
              <div key={item?.label || item?.value} className="border border-[#c7c0b7] bg-white px-5 py-4">
                <p className="text-[32px] font-semibold tracking-tight text-[#202329]">{item?.value || "--"}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6a6f76]">{item?.label || ""}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden border border-[#b9b3ab] bg-[#d7d4cf]">
          {imageSrc ? (
            <img src={imageSrc} alt={imageAlt || title} className="h-[420px] w-full object-cover object-center lg:h-[520px]" />
          ) : (
            <div className="h-[420px] w-full bg-[#d7d4cf] lg:h-[520px]" />
          )}
        </div>
      </div>
    </section>
  );
}
`;

const cardGridCode = String.raw`"use client";

import * as React from "react";

export const config = {
  fields: {
    title: { type: "text" },
    subtitle: { type: "textarea" },
  },
};

export default function LCCncBretonCardGrid(props) {
  const {
    title = "",
    subtitle = "",
    cards = [],
    tone = "light",
    columns = 4,
  } = props || {};

  const safeCards = Array.isArray(cards) ? cards : [];
  const gridCols =
    columns === 2
      ? "lg:grid-cols-2"
      : columns === 3
        ? "md:grid-cols-2 xl:grid-cols-3"
        : "md:grid-cols-2 xl:grid-cols-4";
  const dark = tone === "dark";

  return (
    <section className={dark ? "bg-[#202329] text-white" : "bg-[#ececec] text-[#202329]"}>
      <div className="mx-auto w-full max-w-[1400px] px-6 py-20">
        <div className="max-w-4xl space-y-4">
          {title ? <h2 className="text-[34px] font-semibold tracking-tight md:text-[44px]">{title}</h2> : null}
          {subtitle ? (
            <p className={dark ? "max-w-3xl text-[16px] leading-7 text-[#c7ccd3]" : "max-w-3xl text-[16px] leading-7 text-[#5b6069]"}>
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className={"mt-10 grid gap-5 " + gridCols}>
          {safeCards.map((card, index) => (
            <article
              key={card?.title || index}
              className={dark ? "border border-white/12 bg-white/[0.03]" : "border border-[#cac3bb] bg-white"}
            >
              {card?.imageSrc ? (
                <img src={card.imageSrc} alt={card.imageAlt || card.title || ""} className="h-56 w-full object-cover object-center" />
              ) : null}
              <div className="space-y-4 p-6">
                {card?.tag ? (
                  <p className={dark ? "text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b6c9]" : "text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b00046]"}>
                    {card.tag}
                  </p>
                ) : null}
                <h3 className="text-[22px] font-semibold tracking-tight">{card?.title || ""}</h3>
                {card?.subtitle ? (
                  <p className={dark ? "text-[14px] font-medium text-white/80" : "text-[14px] font-medium text-[#30343a]"}>
                    {card.subtitle}
                  </p>
                ) : null}
                {card?.description ? (
                  <p className={dark ? "text-[14px] leading-6 text-[#c7ccd3]" : "text-[14px] leading-6 text-[#5b6069]"}>
                    {card.description}
                  </p>
                ) : null}
                {card?.meta ? (
                  <div className={dark ? "border-t border-white/10 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d9dde2]" : "border-t border-[#dfd8d0] pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6a6f76]"}>
                    {card.meta}
                  </div>
                ) : null}
                {card?.ctaLabel ? (
                  <a
                    href={card?.ctaHref || "#"}
                    className={dark ? "inline-flex border border-white/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10" : "inline-flex border border-[#b00046] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b00046] transition-colors hover:bg-[#b00046] hover:text-white"}
                  >
                    {card.ctaLabel}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

const certificationCode = String.raw`"use client";

import * as React from "react";
import { BadgeCheck, FileCheck2, ShieldCheck } from "lucide-react";

const ICONS = {
  "ISO 9001": BadgeCheck,
  CE: ShieldCheck,
  SGS: FileCheck2,
};

export const config = {
  fields: {
    title: { type: "text" },
  },
};

export default function LCCncBretonCertificationStrip(props) {
  const {
    title = "Certifications",
    items = [],
  } = props || {};

  const safeItems = Array.isArray(items) ? items.slice(0, 4) : [];

  return (
    <section className="border-y border-[#cfc8bf] bg-[#f3efe8]">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-14">
        <div className="mb-8 flex items-center gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b00046]">{title}</p>
          <div className="h-px flex-1 bg-[#d8d0c7]" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {safeItems.map((item) => {
            const Icon = ICONS[item?.label] || BadgeCheck;
            return (
              <div key={item?.label} className="flex items-center gap-4 border border-[#cbc4bc] bg-white px-5 py-4">
                <div className="flex h-11 w-11 items-center justify-center border border-[#cbc4bc] text-[#b00046]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#202329]">{item?.label || ""}</p>
                  <p className="mt-1 text-[13px] text-[#6a6f76]">{item?.meta || ""}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`;

const caseStripCode = String.raw`"use client";

import * as React from "react";

export const config = {
  fields: {
    title: { type: "text" },
    subtitle: { type: "textarea" },
  },
};

export default function LCCncCaseStrip(props) {
  const {
    title = "Case strip",
    subtitle = "",
    items = [],
  } = props || {};

  const safeItems = Array.isArray(items) ? items.slice(0, 4) : [];

  return (
    <section className="border-y border-[#cfc8bf] bg-[#f3efe8]">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b00046]">Case strip</p>
            <h2 className="text-[32px] font-semibold tracking-tight text-[#202329] md:text-[40px]">{title}</h2>
            {subtitle ? <p className="max-w-md text-[15px] leading-7 text-[#5b6069]">{subtitle}</p> : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {safeItems.map((item, index) => (
              <a
                key={item?.title || index}
                href={item?.href || "#"}
                className="group border border-[#cbc4bc] bg-white p-5 transition-transform hover:-translate-y-1"
              >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b00046]">{item?.tag || ("CASE 0" + (index + 1))}</p>
                <p className="mt-5 text-[21px] font-semibold leading-[1.15] tracking-tight text-[#202329]">{item?.title || ""}</p>
                <p className="mt-3 text-[14px] leading-6 text-[#5b6069]">{item?.summary || ""}</p>
                <div className="mt-6 flex items-center justify-between border-t border-[#e4ddd4] pt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70757d]">{item?.meta || "Machining case"}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b00046]">View</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;

const floatingWhatsappCode = String.raw`"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";

export const config = {
  fields: {
    href: { type: "text" },
    label: { type: "text" },
  },
};

export default function LCCncFloatingWhatsApp(props) {
  const {
    href = "https://wa.me/8615813703777",
    label = "WhatsApp LC-CNC",
  } = props || {};

  return (
    <a
      href={href}
      aria-label={label}
      className="fixed bottom-6 right-6 z-[70] inline-flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0c1a11] shadow-[0_20px_50px_rgba(0,0,0,0.28)] transition-transform hover:-translate-y-0.5"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
`;

const factoryStoryCode = String.raw`"use client";

import * as React from "react";

export const config = {
  fields: {
    eyebrow: { type: "text" },
    title: { type: "text" },
    subtitle: { type: "textarea" },
  },
};

export default function LCCncFactoryStorySection(props) {
  const {
    eyebrow = "Factory Story",
    title = "",
    subtitle = "",
    image = {},
    metrics = [],
    notes = [],
  } = props || {};

  const safeMetrics = Array.isArray(metrics) ? metrics.slice(0, 4) : [];
  const safeNotes = Array.isArray(notes) ? notes.slice(0, 4) : [];

  return (
    <section className="bg-[#ececec]">
      <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-6 py-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="overflow-hidden border border-[#bdb6ad] bg-[#d9d5cf]">
          {image?.src ? (
            <img src={image.src} alt={image.alt || title} className="h-[460px] w-full object-cover object-center" />
          ) : (
            <div className="h-[460px] w-full bg-[#d9d5cf]" />
          )}
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b00046]">{eyebrow}</p>
            <h2 className="text-[34px] font-semibold leading-[1.05] tracking-tight text-[#202329] md:text-[48px]">{title}</h2>
            {subtitle ? <p className="max-w-2xl text-[16px] leading-7 text-[#5b6069]">{subtitle}</p> : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {safeMetrics.map((item) => (
              <div key={item?.label || item?.value} className="border border-[#cac3bb] bg-white px-5 py-5">
                <p className="text-[34px] font-semibold tracking-tight text-[#202329]">{item?.value || "--"}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6a6f76]">{item?.label || ""}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3">
            {safeNotes.map((item) => (
              <div key={item?.title || item?.body} className="border border-[#cac3bb] bg-white px-5 py-4">
                <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#202329]">{item?.title || ""}</p>
                <p className="mt-2 text-[14px] leading-6 text-[#5b6069]">{item?.body || ""}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;

const solutionsRailCode = String.raw`"use client";

import * as React from "react";

export const config = {
  fields: {
    eyebrow: { type: "text" },
    title: { type: "text" },
    subtitle: { type: "textarea" },
  },
};

export default function LCCncSolutionsRail(props) {
  const {
    eyebrow = "Program Flow",
    title = "",
    subtitle = "",
    steps = [],
  } = props || {};

  const safeSteps = Array.isArray(steps) ? steps.slice(0, 4) : [];

  return (
    <section className="bg-[#202329] text-white">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-20">
        <div className="max-w-3xl space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b6c9]">{eyebrow}</p>
          <h2 className="text-[34px] font-semibold tracking-tight md:text-[44px]">{title}</h2>
          {subtitle ? <p className="text-[16px] leading-7 text-[#c7ccd3]">{subtitle}</p> : null}
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {safeSteps.map((step, index) => (
            <div key={step?.title || index} className="border border-white/10 bg-white/[0.04] px-5 py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b6c9]">
                {step?.tag || ("STEP 0" + (index + 1))}
              </p>
              <p className="mt-5 text-[22px] font-semibold tracking-tight text-white">{step?.title || ""}</p>
              <p className="mt-4 text-[14px] leading-6 text-[#c7ccd3]">{step?.description || ""}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

const ctaBandCode = String.raw`"use client";

import * as React from "react";

export const config = {
  fields: {
    title: { type: "text" },
    subtitle: { type: "textarea" },
  },
};

export default function LCCncCtaBand(props) {
  const {
    title = "",
    subtitle = "",
    primaryLabel = "Get Quote on WhatsApp",
    primaryHref = "#",
    secondaryLabel = "Request Catalog",
    secondaryHref = "#",
  } = props || {};

  return (
    <section className="bg-[#202329] text-white">
      <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-6 py-18 lg:grid-cols-[1.1fr_auto] lg:items-center">
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b6c9]">Commercial CTA</p>
          <h2 className="max-w-3xl text-[34px] font-semibold tracking-tight md:text-[44px]">{title}</h2>
          {subtitle ? <p className="max-w-2xl text-[16px] leading-7 text-[#c7ccd3]">{subtitle}</p> : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={primaryHref} className="inline-flex border border-[#b00046] bg-[#b00046] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            {primaryLabel}
          </a>
          <a href={secondaryHref} className="inline-flex border border-white/25 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            {secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
`;

const contactCaptureCode = String.raw`"use client";

import * as React from "react";
import { ArrowRight, MessageCircleMore } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "@/components/ui-exports";

export const config = {
  fields: {
    title: { type: "text" },
    subtitle: { type: "textarea" },
    whatsappHref: { type: "text" },
    whatsappLabel: { type: "text" },
    email: { type: "text" },
    address: { type: "text" },
  },
};

export default function LCCncContactCapture(props) {
  const {
    title = "Quick Quote Form",
    subtitle = "",
    whatsappHref = "#",
    whatsappLabel = "",
    email = "",
    address = "",
  } = props || {};

  return (
    <section id="quote-form" className="bg-[#ececec]">
      <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-6 py-20 lg:grid-cols-[0.88fr_1.12fr]">
        <Card className="overflow-hidden border-[#343942] bg-[#202329] text-white">
          <CardHeader className="space-y-4 border-b border-white/10 pb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b6c9]">WhatsApp-first support</p>
            <CardTitle className="text-[32px] font-semibold tracking-tight">{title}</CardTitle>
            <p className="text-[15px] leading-7 text-[#c7ccd3]">
              {subtitle || "Share model, quantity, and delivery target. LC-CNC replies with process guidance and production timing."}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <a
              href={whatsappHref}
              className="flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:bg-white/[0.08]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-[#0c1a11]">
                  <MessageCircleMore className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em]">Get Quote on WhatsApp</p>
                  <p className="text-[13px] text-[#c7ccd3]">{whatsappLabel}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#c7ccd3]" />
            </a>
            <div className="grid gap-3 text-[14px] leading-6 text-[#c7ccd3]">
              <div className="border border-white/10 px-4 py-4">10-Day sample path with fixture and spindle review.</div>
              <div className="border border-white/10 px-4 py-4">15-Day shipment planning for Southeast Asia launch windows.</div>
              <div className="border border-white/10 px-4 py-4">Direct Shenzhen factory coordination for engineering and export documents.</div>
            </div>
            <div className="space-y-1 text-[13px] text-[#c7ccd3]">
              <p>Email: {email}</p>
              <p>Address: {address}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#cbc4bc] bg-white shadow-[0_24px_60px_rgba(40,33,26,0.08)]">
          <CardHeader className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b00046]">Quick Quote Form</p>
            <CardTitle className="text-[30px] tracking-tight text-[#202329]">Tell us your machine program</CardTitle>
            <p className="text-[15px] leading-7 text-[#5b6069]">
              Name, company, machine model, quantity, and deadline are enough for us to return a practical machine path.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Name" />
              <Input placeholder="Company" />
              <Input placeholder="Email" />
              <Input placeholder="WhatsApp" />
              <Input placeholder="Machine Model" />
              <Input placeholder="Quantity" />
            </div>
            <Input placeholder="Deadline" />
            <Textarea rows={5} placeholder="Part material, finish target, fixture request, and shipping destination." />
            <label className="flex items-start gap-3 border border-[#d8d2ca] bg-[#f5f1ea] px-4 py-3 text-[14px] text-[#5b6069]">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#c7c0b7]" />
              <span>I agree to receive follow-up via WhatsApp.</span>
            </label>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-none bg-[#b00046] px-6 text-white hover:bg-[#96003d]">
                <a href={whatsappHref}>Submit via WhatsApp</a>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-none border border-[#b00046] px-6 text-[#b00046]">
                <a href={"mailto:" + email}>Send by Email</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
`;

const footerCode = String.raw`"use client";

import * as React from "react";

export const config = {
  fields: {
    brand: { type: "text" },
  },
};

export default function LCCncBretonFooter(props) {
  const {
    brand = "LC-CNC™",
    logoSrc = "",
    columns = [],
    legal = "",
  } = props || {};

  const safeColumns = Array.isArray(columns) ? columns.slice(0, 4) : [];

  return (
    <footer className="bg-[#202329] text-white">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-16">
        <div className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            {logoSrc ? (
              <img src={logoSrc} alt={brand} className="h-10 w-auto object-contain" />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center border border-white/20 text-[12px] font-semibold tracking-[0.18em]">
                LC
              </span>
            )}
            <p className="text-[18px] font-semibold tracking-[0.14em]">{brand}</p>
            <p className="max-w-sm text-[14px] leading-7 text-[#c7ccd3]">
              Precision 3C CNC machine centers from Shenzhen for Southeast Asia manufacturing teams.
            </p>
          </div>
          {safeColumns.map((column, index) => (
            <div key={column?.title || index} className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b6c9]">{column?.title || ""}</p>
              <div className="grid gap-3">
                {(Array.isArray(column?.links) ? column.links : []).map((link) => (
                  <a
                    key={link?.href || link?.label}
                    href={link?.href || "/"}
                    className="text-[14px] leading-6 text-[#d9dde2] transition-colors hover:text-white"
                  >
                    {link?.label || ""}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 pt-6 text-[12px] text-[#aeb5bd] md:flex-row md:items-center md:justify-between">
          <p>{legal}</p>
          <p>Industrial product site built for direct B2B inquiries.</p>
        </div>
      </div>
    </footer>
  );
}
`;

const productCards = [
  {
    tag: "Phone Frame",
    title: "3C Phone-Frame Center",
    subtitle: "Rigid aluminum frame machining",
    description: "Built for slim-profile phone frames with stable contouring, clean pocket finish, and repeatable anodized surface control.",
    meta: "Travel 800 x 550 x 350 mm • 24T ATC • +/-0.005 mm repeatability",
    imageSrc: assets.phone,
    imageAlt: "Phone frame machining center",
    ctaLabel: "Get Quote on WhatsApp",
    ctaHref: WHATSAPP_LINK,
  },
  {
    tag: "Laptop Shell",
    title: "3C Laptop-Shell Center",
    subtitle: "Large-format shell milling",
    description: "Configured for magnesium and aluminum shells with thin-wall support, fast roughing, and stable chip evacuation.",
    meta: "Travel 1000 x 650 x 400 mm • 15k spindle • shell fixture-ready",
    imageSrc: assets.laptop,
    imageAlt: "Laptop shell machining center",
    ctaLabel: "Request Catalog",
    ctaHref: CATALOG_LINK,
  },
  {
    tag: "Camera Bezel",
    title: "3C Camera-Bezel Center",
    subtitle: "Micro-feature bezel accuracy",
    description: "Optimized for ring and bezel features with fine finishing cycles and cosmetic-grade surface consistency.",
    meta: "Travel 600 x 420 x 300 mm • 20-tool ATC • fine-finish cycle",
    imageSrc: assets.camera,
    imageAlt: "Camera bezel machining center",
    ctaLabel: "Get Quote on WhatsApp",
    ctaHref: WHATSAPP_LINK,
  },
  {
    tag: "Keypad",
    title: "3C Keypad Center",
    subtitle: "Compact high-output line",
    description: "Configured for keypad and button arrays with multi-up fixtures, quick tool change, and dependable unattended runs.",
    meta: "Travel 500 x 380 x 280 mm • compact footprint • automation-ready",
    imageSrc: assets.keypad,
    imageAlt: "Keypad machining center",
    ctaLabel: "Discuss Your Project",
    ctaHref: "/contact#quote-form",
  },
];

const caseCards = [
  {
    tag: "Phone Display Frame",
    title: "Phone Display Frame Machining",
    description: "Controlled cosmetic edge quality for anodized frames while keeping takt time suitable for regional launch schedules.",
    meta: "Frame rigidity • edge finish • launch timing",
    imageSrc: assets.phone,
    imageAlt: "Phone display frame machining",
    ctaLabel: "Talk to LC-CNC",
    ctaHref: WHATSAPP_LINK,
  },
  {
    tag: "Laptop Shell",
    title: "Laptop Shell Machining",
    description: "Balanced thin-wall stability, chip evacuation, and fixture repeatability across larger shell dimensions.",
    meta: "Long travel • shell fixture • stable output",
    imageSrc: assets.laptop,
    imageAlt: "Laptop shell machining",
    ctaLabel: "Review Similar Program",
    ctaHref: "/contact#quote-form",
  },
  {
    tag: "Camera Bezel",
    title: "Camera Bezel Machining",
    description: "Maintained fine radius quality and glossy surface consistency for visual-finish critical camera bezel parts.",
    meta: "Micro-feature control • premium finish",
    imageSrc: assets.camera,
    imageAlt: "Camera bezel machining",
    ctaLabel: "Discuss Bezel Program",
    ctaHref: WHATSAPP_LINK,
  },
  {
    tag: "Phone Keypad",
    title: "Phone Keypad Machining",
    description: "Configured multi-up machining with repeat-order efficiency and short takt time for high-mix keypad programs.",
    meta: "Multi-up fixtures • compact cell",
    imageSrc: assets.keypad,
    imageAlt: "Phone keypad machining",
    ctaLabel: "Request Quote",
    ctaHref: CATALOG_LINK,
  },
];

const caseStripItems = [
  {
    tag: "CASE 01",
    title: "Phone Display Frame Machining",
    summary: "Cosmetic edge control with launch-driven sample and shipment timing.",
    meta: "Phone frame",
    href: "/cases",
  },
  {
    tag: "CASE 02",
    title: "Laptop Shell Machining",
    summary: "Thin-wall stability and fixture repeatability for larger shell dimensions.",
    meta: "Laptop shell",
    href: "/cases",
  },
  {
    tag: "CASE 03",
    title: "Camera Bezel Machining",
    summary: "Micro-feature finish control for bezel rings and cosmetic surfaces.",
    meta: "Camera bezel",
    href: "/cases",
  },
  {
    tag: "CASE 04",
    title: "Phone Keypad Machining",
    summary: "Compact multi-up machining path for repeat-order keypad programs.",
    meta: "Keypad",
    href: "/cases",
  },
];

const solutionCards = [
  {
    tag: "Custom Fixturing",
    title: "Fixture concepts around part geometry",
    description: "Vacuum, multi-up, and quick-change fixture schemes shaped around your part family instead of generic catalog tables.",
  },
  {
    tag: "Spindle Package",
    title: "Speed and rigidity matched to the finish target",
    description: "We size spindle, tool-change logic, and cutting strategy against material, detail geometry, and takt expectations.",
  },
  {
    tag: "Automation",
    title: "Robot loading and compact cells",
    description: "For repeat order programs, LC-CNC can map pallet, loading, and handling concepts before final machine release.",
  },
  {
    tag: "10-Day Sample",
    title: "Short commercial validation loop",
    description: "Engineering review, sample path, and delivery planning are compressed into a direct factory workflow for SEA buyers.",
  },
];

const privacyCards = [
  {
    title: "Inquiry details",
    description: "Name, company, email, WhatsApp, machine interest, quantity, and deadline are used only to prepare your quotation response.",
  },
  {
    title: "Follow-up",
    description: "If you opt in, LC-CNC may contact you through WhatsApp or email about your machine request and related project updates.",
  },
  {
    title: "Commercial handling",
    description: "We do not use inquiry data for unrelated marketing lists. Data is handled for direct factory communication only.",
  },
];

const buildRoot = (title) => ({
  props: {
    title,
    theme,
  },
});

const buildNavbar = () => ({
  type: "LCCncBretonNavbar",
  props: {
    id: "navbar",
    brand: "LC-CNC™",
    logoSrc: "",
    links: navLinks,
    whatsappHref: WHATSAPP_LINK,
  },
});

const buildFooter = () => ({
  type: "LCCncBretonFooter",
  props: {
    id: "footer",
    brand: "LC-CNC™",
    logoSrc: "",
    columns: [
      {
        title: "Products",
        links: [
          { label: "3C Machines", href: "/3c-machines" },
          { label: "Custom Solutions", href: "/custom-solutions" },
          { label: "Cases", href: "/cases" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Request Catalog", href: "/contact#quote-form" },
          { label: "WhatsApp", href: WHATSAPP_LINK },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Privacy", href: "/privacy" },
          { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
        ],
      },
    ],
    legal: `WhatsApp: ${WHATSAPP_NUMBER} • Email: ${CONTACT_EMAIL} • Address: ${CONTACT_ADDRESS} • Copyright © ${YEAR} LC-CNC. All rights reserved.`,
  },
});

const buildFloatingWhatsapp = () => ({
  type: "LCCncFloatingWhatsApp",
  props: {
    id: "floating-whatsapp",
    href: WHATSAPP_LINK,
    label: "WhatsApp LC-CNC",
  },
});

const buildCtaBand = (id, title, subtitle) => ({
  type: "LCCncCtaBand",
  props: {
    id,
    title,
    subtitle,
    primaryLabel: "Get Quote on WhatsApp",
    primaryHref: WHATSAPP_LINK,
    secondaryLabel: "Request Catalog",
    secondaryHref: CATALOG_LINK,
  },
});

const buildPageHero = (id, eyebrow, title, subtitle, imageSrc, stats) => ({
  type: "LCCncBretonPageHero",
  props: {
    id,
    eyebrow,
    title,
    subtitle,
    imageSrc,
    imageAlt: title,
    stats,
  },
});

const certificationBlock = {
  type: "LCCncBretonCertificationStrip",
  props: {
    id: "certifications",
    title: "Certification",
    items: [
      { label: "ISO 9001", meta: "Quality management system" },
      { label: "CE", meta: "Machine conformity support" },
      { label: "SGS", meta: "Audit-ready factory materials" },
    ],
  },
};

const contactBlock = {
  type: "LCCncContactCapture",
  props: {
    id: "contact-capture",
    title: "Quick Quote Form",
    subtitle: "Share material, machine model, quantity, and deadline. LC-CNC replies with process guidance and delivery planning for Southeast Asia projects.",
    whatsappHref: WHATSAPP_LINK,
    whatsappLabel: WHATSAPP_NUMBER,
    email: CONTACT_EMAIL,
    address: CONTACT_ADDRESS,
  },
};

const pages = [
  {
    path: "/",
    name: "Home",
    data: {
      content: [
        buildNavbar(),
        {
          type: templateBlocks.homeHero,
          props: {
            id: "home-hero",
            heroBgimagesrc: assets.hero,
            heroEyebrowtext: "SHENZHEN CNC FACTORY • SINCE 2013",
            heroLogoimagesrc: assets.logo,
            heroTitletext: "Precision 3C CNC Machines for Southeast Asia",
            heroSubtext: "10-Day Prototype • 15-Day Delivery • 24/7 WhatsApp Support",
            heroCta1Boxhref: WHATSAPP_LINK,
            heroCta1Texttext: "Get Quote on WhatsApp",
            heroCta1Texthref: WHATSAPP_LINK,
            heroCta2Boxhref: CATALOG_LINK,
            heroCta2Texttext: "Request Catalog",
            heroCta2Texthref: CATALOG_LINK,
            scrollIndicatorLabeltext: "Explore Machines",
          },
        },
        {
          type: templateBlocks.industries,
          props: {
            id: "home-visual-machine-grid",
            indTitletext: "3C machine families",
            indImg0imagesrc: assets.phone,
            indT0text: "3C Phone-Frame Center",
            indImg1imagesrc: assets.laptop,
            indT1text: "3C Laptop-Shell Center",
            indImg2imagesrc: assets.camera,
            indT2text: "3C Camera-Bezel Center",
            indImg3imagesrc: assets.keypad,
            indT3text: "3C Keypad Center",
          },
        },
        {
          type: "LCCncBretonCardGrid",
          props: {
            id: "home-product-specs",
            title: "Product grid",
            subtitle: "Industrial grey-and-white product lineup built around fixture stability, cosmetic finish control, and export-ready delivery.",
            cards: productCards,
            columns: 4,
          },
        },
        {
          type: templateBlocks.numbers,
          props: {
            id: "home-features",
            numTitletext: "Why SEA buyers move fast with LC-CNC",
            numCopytext: "Shorter sampling loops, cleaner communication, and direct factory response for 3C production programs.",
            numV0text: "10-Day",
            numL0text: "Sample path",
            numV1text: "15-Day",
            numL1text: "Shipment planning",
            numV2text: "24/7",
            numL2text: "WhatsApp support",
            numV3text: "SEA",
            numL3text: "Regional focus",
          },
        },
        {
          type: "LCCncCaseStrip",
          props: {
            id: "home-case-strip",
            title: "Application cases",
            subtitle: "Four machining scenarios that industrial buyers in Southeast Asia usually ask to validate first.",
            items: caseStripItems,
          },
        },
        {
          type: "LCCncBretonCardGrid",
          props: {
            id: "home-case-grid",
            title: "Reference cases",
            subtitle: "Outcome-oriented application logic for phone frames, laptop shells, camera bezels, and keypad components.",
            cards: caseCards,
            columns: 2,
          },
        },
        {
          type: "LCCncFactoryStorySection",
          props: {
            id: "home-about",
            eyebrow: "About LC-CNC",
            title: "LC-CNC, Shenzhen since 2013",
            subtitle: "ISO-certified plant, 30+ R&D engineers, and 200+ installed across Southeast Asia.",
            image: { src: assets.hero, alt: "LC-CNC factory workshop" },
            metrics: [
              { value: "2013", label: "Shenzhen since" },
              { value: "30+", label: "R&D engineers" },
              { value: "200+", label: "Installed across SEA" },
              { value: "ISO", label: "Certified plant" },
            ],
            notes: [
              { title: "Factory-first communication", body: "Machine recommendation starts from part geometry, spindle choice, and fixture logic instead of a generic brochure reply." },
              { title: "Export-ready execution", body: "Commercial documents, delivery planning, and support handoff are prepared for Southeast Asia buyers." },
              { title: "Industrial product focus", body: "The site and machine lineup are built around concrete 3C machining use cases rather than broad corporate positioning." },
            ],
          },
        },
        certificationBlock,
        contactBlock,
        buildFloatingWhatsapp(),
        buildFooter(),
      ],
      root: buildRoot("LC-CNC | Home"),
    },
  },
  {
    path: "/3c-machines",
    name: "3C Machines",
    data: {
      content: [
        buildNavbar(),
        buildPageHero(
          "machines-hero",
          "3C CNC PRODUCT LINE",
          "3C CNC Machine Centers Built for Cosmetic Metal Parts",
          "Phone frames, laptop shells, camera bezels, and keypad components with production-ready spindle, fixture, and handling options.",
          assets.phone,
          [
            { value: "4", label: "Machine lines" },
            { value: "+/-0.005 mm", label: "Repeatability" },
            { value: "15k", label: "Top spindle" },
            { value: "SEA", label: "Export focus" },
          ]
        ),
        {
          type: templateBlocks.industries,
          props: {
            id: "machines-visual",
            indTitletext: "Machine lineup",
            indImg0imagesrc: assets.phone,
            indT0text: "Phone-frame center",
            indImg1imagesrc: assets.laptop,
            indT1text: "Laptop-shell center",
            indImg2imagesrc: assets.camera,
            indT2text: "Camera-bezel center",
            indImg3imagesrc: assets.keypad,
            indT3text: "Keypad center",
          },
        },
        {
          type: "LCCncBretonCardGrid",
          props: {
            id: "machines-specs",
            title: "Detailed machine parameters",
            subtitle: "Each platform is configured around travel range, spindle speed, fixture architecture, and finish stability for 3C parts.",
            cards: productCards,
            columns: 2,
          },
        },
        {
          type: templateBlocks.numbers,
          props: {
            id: "machines-values",
            numTitletext: "What buyers evaluate first",
            numCopytext: "We configure around production fit, not generic catalog specs.",
            numV0text: "Travel",
            numL0text: "Sized for 3C envelopes",
            numV1text: "Spindle",
            numL1text: "Matched to finish target",
            numV2text: "Fixture",
            numL2text: "Vacuum and multi-up ready",
            numV3text: "Automation",
            numL3text: "Scalable output path",
          },
        },
        buildCtaBand(
          "machines-cta",
          "Need the right machine model for your 3C part?",
          "Send part material, part size, and daily output target. We recommend the machine platform and sampling path."
        ),
        buildFloatingWhatsapp(),
        buildFooter(),
      ],
      root: buildRoot("LC-CNC | 3C Machines"),
    },
  },
  {
    path: "/custom-solutions",
    name: "Custom Solutions",
    data: {
      content: [
        buildNavbar(),
        buildPageHero(
          "solutions-hero",
          "CUSTOM SOLUTIONS",
          "Custom Fixturing, Spindle Packages, and Automation Integration",
          "A factory-led workflow for buyers who need the machine package shaped around part geometry, finish targets, and launch timing.",
          assets.camera,
          [
            { value: "10-Day", label: "Sample path" },
            { value: "Fixture", label: "Custom fixturing" },
            { value: "Spindle", label: "Package selection" },
            { value: "Automation", label: "Line integration" },
          ]
        ),
        {
          type: "LCCncBretonCardGrid",
          props: {
            id: "solutions-grid",
            title: "Capability scope",
            subtitle: "We tailor the machine package to the part, output target, and operator flow.",
            cards: solutionCards,
            columns: 2,
          },
        },
        {
          type: "LCCncSolutionsRail",
          props: {
            id: "solutions-flow",
            eyebrow: "10-day sample workflow",
            title: "From part brief to shipment planning",
            subtitle: "A short factory-led program for prototype validation and commercial handoff.",
            steps: [
              {
                tag: "DAY 1-2",
                title: "Part brief intake",
                description: "Collect CAD references, material, tolerance, finish target, and desired shipment window.",
              },
              {
                tag: "DAY 3-4",
                title: "Machine and fixture plan",
                description: "Select the machine platform, spindle range, fixture concept, and handling path.",
              },
              {
                tag: "DAY 5-7",
                title: "Sample validation",
                description: "Review finish, takt time, and process stability with direct commercial feedback.",
              },
              {
                tag: "DAY 8-10",
                title: "Shipment handoff",
                description: "Lock configuration, export documents, commissioning scope, and SEA delivery slot.",
              },
            ],
          },
        },
        buildCtaBand(
          "solutions-cta",
          "Share your 3C part and line target",
          "We turn it into a machine package with fixture logic, sample timing, and Southeast Asia delivery planning."
        ),
        buildFloatingWhatsapp(),
        buildFooter(),
      ],
      root: buildRoot("LC-CNC | Custom Solutions"),
    },
  },
  {
    path: "/cases",
    name: "Cases",
    data: {
      content: [
        buildNavbar(),
        buildPageHero(
          "cases-hero",
          "APPLICATION CASES",
          "Reference Cases for Phone, Laptop, Camera, and Keypad Machining",
          "A grayscale industrial overview of the part programs buyers ask about first, tied to fixture logic, finish expectations, and delivery speed.",
          assets.laptop,
          [
            { value: "4", label: "Case families" },
            { value: "3C", label: "Part focus" },
            { value: "Finish", label: "Cosmetic control" },
            { value: "SEA", label: "Deployment region" },
          ]
        ),
        {
          type: "LCCncCaseStrip",
          props: {
            id: "cases-top-strip",
            title: "Case slider",
            subtitle: "A quick view of the part families that shape fixture logic, finish control, and production timing.",
            items: caseStripItems,
          },
        },
        {
          type: "LCCncBretonCardGrid",
          props: {
            id: "cases-grid",
            title: "Case library",
            subtitle: "Part geometry, finish expectation, and delivery speed determine the machine package and fixture strategy.",
            cards: caseCards,
            columns: 2,
          },
        },
        buildCtaBand(
          "cases-cta",
          "Need a similar machining case for your part family?",
          "Tell us the part type and target volume. We map the case logic to your machine recommendation."
        ),
        buildFloatingWhatsapp(),
        buildFooter(),
      ],
      root: buildRoot("LC-CNC | Cases"),
    },
  },
  {
    path: "/about",
    name: "About",
    data: {
      content: [
        buildNavbar(),
        buildPageHero(
          "about-hero",
          "ABOUT LC-CNC",
          "Factory Credibility for CNC Buyers Across Southeast Asia",
          "LC-CNC has operated from Shenzhen since 2013, combining engineering depth, export experience, and ISO-controlled production for industrial machine buyers.",
          assets.hero,
          [
            { value: "2013", label: "Founded" },
            { value: "30+", label: "R&D engineers" },
            { value: "200+", label: "Installed across SEA" },
            { value: "ISO", label: "Certified plant" },
          ]
        ),
        {
          type: "LCCncFactoryStorySection",
          props: {
            id: "about-story",
            eyebrow: "Factory Story",
            title: "Operational snapshot built for export-focused CNC delivery",
            subtitle: "Instead of a generic brochure page, we show the factory in the terms industrial buyers actually evaluate: engineering depth, installed base, and execution reliability.",
            image: { src: assets.hero, alt: "LC-CNC factory engineering" },
            metrics: [
              { value: "2013", label: "Shenzhen since" },
              { value: "30+", label: "R&D engineers" },
              { value: "200+", label: "Installed across SEA" },
              { value: "ISO", label: "Controlled plant" },
            ],
            notes: [
              { title: "Engineering-first quotation", body: "LC-CNC starts from spindle, fixture, and takt discussion instead of only sending a catalog sheet." },
              { title: "Export-ready coordination", body: "Commercial documents, installation references, and delivery planning are prepared for Southeast Asia buyers." },
              { title: "Factory-floor validation", body: "Assembly, sample review, and final inspection remain within one Shenzhen operation before shipment." },
            ],
          },
        },
        certificationBlock,
        buildCtaBand(
          "about-cta",
          "Need a factory partner for 3C CNC programs?",
          "Talk with LC-CNC about sample schedule, machine package, and the delivery window for your Southeast Asia program."
        ),
        buildFloatingWhatsapp(),
        buildFooter(),
      ],
      root: buildRoot("LC-CNC | About"),
    },
  },
  {
    path: "/contact",
    name: "Contact",
    data: {
      content: [
        buildNavbar(),
        buildPageHero(
          "contact-hero",
          "CONTACT LC-CNC",
          "Talk to LC-CNC About Your 3C CNC Program",
          "WhatsApp-first sales support, fast machine guidance, and direct factory coordination from Shenzhen.",
          assets.camera,
          [
            { value: "24/7", label: "WhatsApp support" },
            { value: "Shenzhen", label: "Factory base" },
            { value: "Quote", label: "Fast response" },
            { value: "SEA", label: "Regional buyers" },
          ]
        ),
        contactBlock,
        buildFloatingWhatsapp(),
        buildFooter(),
      ],
      root: buildRoot("LC-CNC | Contact"),
    },
  },
  {
    path: "/privacy",
    name: "Privacy",
    data: {
      content: [
        buildNavbar(),
        buildPageHero(
          "privacy-hero",
          "PRIVACY",
          "Privacy for Sales Inquiries and Project Follow-Up",
          "LC-CNC uses your inquiry details only to respond with machine recommendations, quotations, and project follow-up.",
          assets.keypad,
          [
            { value: "B2B", label: "Inquiry scope" },
            { value: "Direct", label: "Factory follow-up" },
            { value: "No Spam", label: "Commercial use only" },
            { value: "Consent", label: "WhatsApp-based" },
          ]
        ),
        {
          type: "LCCncBretonCardGrid",
          props: {
            id: "privacy-cards",
            title: "What we collect and why",
            subtitle: "This page is intentionally short and operational: only the data needed for direct machine inquiry handling is collected.",
            cards: privacyCards,
            columns: 3,
          },
        },
        buildFloatingWhatsapp(),
        buildFooter(),
      ],
      root: buildRoot("LC-CNC | Privacy"),
    },
  },
];

const components = [
  { name: "LCCncBretonNavbar", code: navbarCode },
  { name: "LCCncBretonPageHero", code: pageHeroCode },
  { name: "LCCncBretonCardGrid", code: cardGridCode },
  { name: "LCCncBretonCertificationStrip", code: certificationCode },
  { name: "LCCncCaseStrip", code: caseStripCode },
  { name: "LCCncFloatingWhatsApp", code: floatingWhatsappCode },
  { name: "LCCncFactoryStorySection", code: factoryStoryCode },
  { name: "LCCncSolutionsRail", code: solutionsRailCode },
  { name: "LCCncCtaBand", code: ctaBandCode },
  { name: "LCCncContactCapture", code: contactCaptureCode },
  { name: "LCCncBretonFooter", code: footerCode },
];

const result = {
  prompt:
    "Generate an English industrial website for LC-CNC using Breton as the visual template base. Prioritize template-derived sections and direct content replacement over AI freeform generation.",
  blueprint: {
    pages: pages.map((page) => ({
      path: page.path,
      name: page.name,
      sections: page.data.content.map((block, index) => ({
        id: String(block.props?.id || `${page.name.toLowerCase()}-${index}`),
        type: String(block.type),
        intent: String(block.props?.title || block.props?.eyebrow || block.type),
      })),
    })),
  },
  theme,
  components,
  pages,
  errors: [],
};

const sandboxPayload = {
  components,
  pages,
  theme,
};

const validateSitePayload = () => {
  const customNames = new Set(components.map((component) => component.name));
  const pagePaths = new Set();

  for (const page of pages) {
    if (pagePaths.has(page.path)) {
      throw new Error(`Duplicate page path: ${page.path}`);
    }
    pagePaths.add(page.path);
    const content = Array.isArray(page?.data?.content) ? page.data.content : [];
    for (const block of content) {
      const type = String(block?.type || "").trim();
      if (!type) throw new Error(`Empty block type on page ${page.path}`);
      if (!safeBuiltinBlocks.has(type) && !customNames.has(type)) {
        throw new Error(`Unknown block type "${type}" on page ${page.path}`);
      }
    }
  }
};

const main = async () => {
  validateSitePayload();
  await fs.mkdir(SANDBOX_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, "result.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(SANDBOX_DIR, "payload.json"), `${JSON.stringify(sandboxPayload, null, 2)}\n`, "utf8");
  console.log(
    JSON.stringify(
      {
        siteKey: SITE_KEY,
        outDir: OUT_DIR,
        previewUrl: `http://localhost:3110/creation/sandbox?mode=preview&siteKey=${encodeURIComponent(SITE_KEY)}&page=%2F`,
        pageCount: pages.length,
      },
      null,
      2
    )
  );
};

await main();
