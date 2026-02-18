#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { SECTION_BLOCK_REGISTRY, getAlternativeVariants } from "./variant-registry.mjs";
import { buildCustomSectionPrompt, buildPuckFieldsForCustomComponent } from "./generate-custom-section.mjs";
import { materializeFromPayload, writeGeneratedConfig } from "./materialize-custom-components.mjs";
import { resolveCliOptions } from "./config/resolve-options.mjs";
import { evaluateRunGates } from "./gates/evaluate-run-gates.mjs";
import { selectRequiredCases, selectRequiredPagesForSite } from "./regression/select-required-cases.mjs";

const ROOT = process.cwd();
const SCRIPTS_DIR = path.resolve(ROOT, "..", "scripts");
const FACTORY_DIR = path.join(ROOT, "template-factory");
const RUNS_DIR = path.join(FACTORY_DIR, "runs");
const LIB_DIR = path.join(FACTORY_DIR, "library");
const PUBLIC_TEMPLATE_ASSETS_DIR = path.join(ROOT, "public", "assets", "template-factory");
const DEFAULT_MANIFEST = path.join(FACTORY_DIR, "sites.example.json");
const DEFAULT_PUBLISH_PATH = path.join(LIB_DIR, "style-profiles.generated.json");
const DEFAULT_TEMPLATE_FIRST_GROUP = "C_template_first";
const DEFAULT_PREVIEW_BASE_URL = process.env.TEMPLATE_FACTORY_PREVIEW_BASE_URL || "http://127.0.0.1:3110";
const DEFAULT_PREVIEW_START_COMMAND = "cd builder && npm run dev -- -p 3110";
const HYBRID_CRAWL_SCRIPT = path.join(SCRIPTS_DIR, "crawlers", "hybrid_crawl_pipeline.py");
const DEFAULT_HTTP_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const DISABLE_SITE_FINGERPRINT_ROUTING = process.env.TEMPLATE_FACTORY_DISABLE_SITE_FINGERPRINT_ROUTING !== "0";

const SECTION_KINDS = [
  "navigation",
  "hero",
  "story",
  "approach",
  "socialproof",
  "products",
  "contact",
  "cta",
  "footer",
];

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "into",
  "about",
  "have",
  "will",
  "are",
  "was",
  "were",
  "you",
  "our",
  "their",
  "has",
  "had",
  "make",
  "build",
  "create",
  "generate",
  "homepage",
  "website",
]);

const BRAND_PROTECTED_KEYS = new Set([
  "id",
  "template_id",
  "site_id",
  "url",
  "href",
  "src",
  "imageSrc",
  "desktopScreenshot",
  "mobileScreenshot",
  "desktop_screenshot",
  "mobile_screenshot",
  "source_url",
  "sourceUrl",
  "desktop_url",
  "desktopUrl",
  "mobile_url",
  "mobileUrl",
  "source_images",
  "sourceImages",
  "manifestPath",
  "runId",
  "logPath",
  "reportPath",
  "screenshot",
  "preview",
  "filePath",
  "requestId",
  "responseId",
  "caseId",
]);

const isLikelyUrlOrAssetPath = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return false;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return true;
  if (/^\/assets\//i.test(raw)) return true;
  if (/^[a-zA-Z]:[\\/]/.test(raw)) return true;
  return false;
};

const replaceBrandToken = (value) =>
  String(value || "").replace(/aura/gi, (match) => {
    if (match === match.toUpperCase()) return "SHPITTO";
    if (match[0] === match[0].toUpperCase()) return "Shpitto";
    return "shpitto";
  });

const rewriteBrandTextDeep = (value, key = "") => {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteBrandTextDeep(item, key));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = rewriteBrandTextDeep(v, k);
    }
    return out;
  }
  if (typeof value === "string") {
    if (BRAND_PROTECTED_KEYS.has(key)) return value;
    if (isLikelyUrlOrAssetPath(value)) return value;
    return replaceBrandToken(value);
  }
  return value;
};

const RECIPES = {
  designer_portfolio_minimal: {
    id: "designer_portfolio_minimal",
    styleLabels: ["designer-portfolio", "minimal", "editorial", "light", "monochrome"],
    paletteProfile: "light-neutral",
    typographySignature: "high-contrast sans + editorial display",
    layoutPatterns: [
      "minimal-nav",
      "asymmetric-hero",
      "profile-story-split",
      "capabilities-card-grid",
      "recent-projects-list",
      "testimonial-quote-band",
      "minimal-footer",
    ],
    componentSignature: [
      "Navbar",
      "DesignerHeroEditorial",
      "FeatureWithMedia",
      "DesignerCapabilitiesStrip",
      "DesignerProjectsSplit",
      "DesignerQuoteBand",
      "LeadCaptureCTA",
      "Footer",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "products", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: {
          variant: "withCTA",
          sticky: true,
          paddingY: "sm",
          maxWidth: "xl",
          background: "none",
          logo: "Nava moon",
          links: [
            { label: "Home", href: "#top", variant: "link" },
            { label: "Services", href: "#capabilities", variant: "link" },
            { label: "About", href: "#about", variant: "link" },
            { label: "Contact", href: "#contact", variant: "link" },
          ],
          ctas: [{ label: "Get Started", href: "#contact", variant: "primary" }],
        },
      },
      hero: {
        blockType: "DesignerHeroEditorial",
        defaults: {
          paddingY: "lg",
          headingSize: "lg",
          bodySize: "sm",
          maxWidth: "xl",
          eyebrow: "Since 2003",
          title: "the future of design & content",
          subtitle:
            "A multidisciplinary creative practice crafting visual systems, product interfaces, and narrative-first brand experiences.",
          detail:
            "Design direction, product systems, and frontend delivery across high-growth digital products.",
          ctas: [
            { label: "View Work", href: "#projects", variant: "primary" },
            { label: "Read Story", href: "#about", variant: "secondary" },
          ],
        },
      },
      story: {
        blockType: "FeatureWithMedia",
        defaults: {
          variant: "split",
          paddingY: "lg",
          maxWidth: "xl",
          background: "none",
          eyebrow: "Profile",
          title: "Design Engineer",
          subtitle: "I build elegant product experiences and scalable brand systems.",
          body:
            "Across UI/UX, interaction, and frontend delivery, each project is shaped by clarity, craftsmanship, and long-term maintainability.",
          ctas: [{ label: "See full story", href: "#about", variant: "secondary" }],
        },
      },
      approach: {
        blockType: "DesignerCapabilitiesStrip",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Capabilities",
          subtitle: "Digital design, development, and growth services with a product mindset.",
          items: [
            { title: "UI/UX Design", description: "Research-driven interfaces for web and mobile products.", ctaLabel: "Read more" },
            { title: "Web Development", description: "Modern frontend architecture with production-ready quality.", ctaLabel: "Read more" },
            { title: "Brand Identity", description: "Visual language systems that scale across digital touchpoints.", ctaLabel: "Read more" },
          ],
        },
      },
      products: {
        blockType: "DesignerProjectsSplit",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Recent Projects",
          subtitle: "A selection of latest design and development work.",
          items: [
            {
              title: "SaaS Dashboard",
              summary: "A product analytics dashboard focused on clarity, trust, and retention.",
              href: "#projects",
              tags: ["SaaS", "Dashboard"],
            },
            {
              title: "Fashion Platform",
              summary: "A conversion-first ecommerce redesign with improved storytelling and flow.",
              href: "#projects",
              tags: ["Ecommerce", "Platform"],
            },
          ],
        },
      },
      socialproof: {
        blockType: "DesignerQuoteBand",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          eyebrow: "Testimonial",
          quote:
            "\"Working with Jeremi was a game-changer. He translated our vision into a polished product and delivered beyond expectations.\"",
          author: "Client",
          role: "Founder",
        },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: {
          variant: "banner",
          paddingY: "md",
          maxWidth: "xl",
          title: "Have a project in mind?",
          subtitle: "Share a few details and get a structured implementation plan.",
          cta: { label: "Start a Conversation", href: "#contact", variant: "primary" },
        },
      },
      footer: {
        blockType: "Footer",
        defaults: {
          variant: "multiColumn",
          paddingY: "md",
          maxWidth: "xl",
          background: "none",
          logoText: "Nava moon",
          columns: [
            { title: "Explore", links: [{ label: "Home", href: "#top" }, { label: "Projects", href: "#projects" }] },
            { title: "Services", links: [{ label: "Capabilities", href: "#capabilities" }, { label: "About", href: "#about" }] },
            { title: "Legal", links: [{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }] },
          ],
          legal: "© 2026 Nava moon. All rights reserved.",
        },
      },
    },
  },
  editorial_luxury: {
    id: "editorial_luxury",
    styleLabels: ["editorial", "luxury", "minimal", "warm-neutral"],
    paletteProfile: "warm-neutral",
    typographySignature: "serif-display + sans-body",
    layoutPatterns: [
      "hero-editorial-split",
      "story-sticky-media",
      "metrics-two-col",
      "social-proof-grid",
      "dark-footer-cta",
    ],
    componentSignature: [
      "Navbar",
      "HeroSplit",
      "ContentStory",
      "FeatureGrid",
      "TestimonialsGrid",
      "LeadCaptureCTA",
      "Footer",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: { variant: "withCTA", sticky: true, paddingY: "sm", maxWidth: "xl" },
      },
      hero: {
        blockType: "HeroSplit",
        defaults: { mediaPosition: "right", paddingY: "lg", headingSize: "lg", maxWidth: "xl" },
      },
      story: {
        blockType: "ContentStory",
        defaults: { variant: "split", paddingY: "lg", maxWidth: "xl" },
      },
      approach: {
        blockType: "FeatureGrid",
        defaults: { variant: "3col", paddingY: "lg", maxWidth: "xl" },
      },
      socialproof: {
        blockType: "TestimonialsGrid",
        defaults: { variant: "2col", paddingY: "lg", maxWidth: "xl" },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: { variant: "banner", paddingY: "lg", maxWidth: "xl" },
      },
      footer: {
        blockType: "Footer",
        defaults: { variant: "multiColumn", paddingY: "md", maxWidth: "xl" },
      },
    },
  },
  industrial_precision: {
    id: "industrial_precision",
    styleLabels: ["industrial", "precision", "b2b", "clean"],
    paletteProfile: "steel-neutral",
    typographySignature: "sans-bold + sans-body",
    layoutPatterns: ["hero-split", "metrics-grid", "product-cards", "trust-grid", "banner-cta"],
    componentSignature: [
      "Navbar",
      "HeroSplit",
      "FeatureGrid",
      "CardsGrid",
      "TestimonialsGrid",
      "LeadCaptureCTA",
      "Footer",
    ],
    requiredCategories: ["navigation", "hero", "approach", "products", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: { variant: "withCTA", sticky: true, paddingY: "sm", maxWidth: "xl" },
      },
      hero: {
        blockType: "HeroSplit",
        defaults: { mediaPosition: "right", paddingY: "lg", headingSize: "md", maxWidth: "xl" },
      },
      approach: {
        blockType: "FeatureGrid",
        defaults: { variant: "3col", paddingY: "lg", maxWidth: "xl" },
      },
      products: {
        blockType: "CardsGrid",
        defaults: { variant: "product", columns: "3col", density: "normal", paddingY: "lg", maxWidth: "xl" },
      },
      socialproof: {
        blockType: "TestimonialsGrid",
        defaults: { variant: "2col", paddingY: "lg", maxWidth: "xl" },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: { variant: "banner", paddingY: "lg", maxWidth: "xl" },
      },
      footer: {
        blockType: "Footer",
        defaults: { variant: "multiColumn", paddingY: "md", maxWidth: "xl" },
      },
    },
  },
  enterprise_blue_cyan: {
    id: "enterprise_blue_cyan",
    styleLabels: ["enterprise", "industrial", "deep-blue", "cyan", "technology", "multi-page"],
    paletteProfile: "deep-blue-cyan",
    typographySignature: "clean-sans + strong-heading",
    layoutPatterns: ["mega-nav", "hero-background-text", "feature-grid", "product-cards", "banner-cta", "structured-footer"],
    componentSignature: ["Navbar", "HeroSplit", "FeatureGrid", "CardsGrid", "TestimonialsGrid", "LeadCaptureCTA", "Footer"],
    requiredCategories: ["navigation", "hero", "story", "approach", "products", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: {
          variant: "withDropdown",
          sticky: true,
          paddingY: "sm",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#03122e 0%,#071b45 100%)",
          backgroundOverlay: "rgba(2,10,24,0.24)",
        },
      },
      hero: {
        blockType: "HeroSplit",
        defaults: {
          mediaPosition: "right",
          paddingY: "lg",
          headingSize: "lg",
          bodySize: "md",
          maxWidth: "2xl",
          background: "image",
          backgroundOverlay: "rgba(3, 16, 40, 0.58)",
        },
      },
      story: {
        blockType: "FeatureGrid",
        defaults: {
          variant: "4col",
          paddingY: "md",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#04152f 0%,#071d43 100%)",
        },
      },
      approach: {
        blockType: "FeatureGrid",
        defaults: {
          variant: "3col",
          paddingY: "lg",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#071d43 0%,#082752 100%)",
        },
      },
      products: {
        blockType: "CardsGrid",
        defaults: {
          variant: "imageText",
          columns: "3col",
          density: "normal",
          cardStyle: "solid",
          imagePosition: "top",
          imageShape: "rounded",
          paddingY: "lg",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#051a3a 0%,#08234c 100%)",
        },
      },
      socialproof: {
        blockType: "TestimonialsGrid",
        defaults: {
          variant: "3col",
          paddingY: "lg",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#04152f 0%,#061f45 100%)",
        },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: {
          variant: "banner",
          paddingY: "md",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#07214b 0%,#092a5a 100%)",
          titleColor: "#e6faff",
          ctaBackgroundColor: "#00c6d8",
          ctaTextColor: "#031628",
          ctaClassName: "!bg-[#00c6d8] !text-[#031628] hover:!bg-[#00d7e8]",
        },
      },
      footer: {
        blockType: "Footer",
        defaults: {
          variant: "multiColumn",
          paddingY: "md",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#03122e 0%,#020a1d 100%)",
        },
      },
    },
  },
  nexus_engineering_neon: {
    id: "nexus_engineering_neon",
    styleLabels: ["dark", "nexus", "engineering", "precision", "infra", "product", "gold-accent"],
    paletteProfile: "dark-neon-gold",
    typographySignature: "bold-sans + compact-sans",
    layoutPatterns: [
      "minimal-nav-dark",
      "hero-product-orchestration",
      "dashboard-ops-strip",
      "feature-card-grid-dark",
      "dashboard-case-study",
      "proof-showcase-dark",
      "workflow-footer-glow",
    ],
    componentSignature: [
      "NexusNavPulse",
      "NexusHeroDock",
      "NexusCapabilityStrip",
      "NexusOpsMatrix",
      "NexusControlPanel",
      "NexusProofMosaic",
      "NexusFooterCommand",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "products", "socialproof", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "NexusNavPulse",
        defaults: {
          sticky: true,
          maxWidth: "xl",
          logoText: "Nexus",
          links: [
            { label: "Home", href: "#top" },
            { label: "Services", href: "#services" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Get Started", href: "#contact", variant: "primary" },
        },
      },
      hero: {
        blockType: "NexusHeroDock",
        defaults: {
          maxWidth: "xl",
          badge: "Release Orchestration",
          title: "Nexus is a precision tool for orchestrating product releases",
          subtitle: "Ship with velocity while maintaining reliability, policy control, and measurable rollout quality.",
          panelTag: "Live Rollout",
          panelTitle: "Release Velocity",
          panelSubtitle: "Automated orchestration across environments and teams.",
          statValue: "+842%",
          statDelta: "vs baseline",
          background: "none",
          backgroundOverlay: "rgba(4,9,17,0.28)",
          ctas: [
            { label: "Explore Platform", href: "#services", variant: "primary" },
            { label: "View Metrics", href: "#proof", variant: "secondary" },
          ],
        },
      },
      story: {
        blockType: "NexusCapabilityStrip",
        defaults: {
          maxWidth: "xl",
          eyebrow: "Key Capabilities",
          title: "Engineered for modern product teams",
          subtitle: "Designed for scale, precision, and reliable execution.",
          items: [
            {
              title: "Precision Targeting",
              description: "Model workload placement and route policies around intent and business goals.",
            },
            {
              title: "Automated Workflows",
              description: "Ship faster with deterministic rollout stages and controls.",
            },
            {
              title: "Brand Safety",
              description: "Guardrails and policy checks keep changes reliable by default.",
            },
          ],
        },
      },
      approach: {
        blockType: "NexusOpsMatrix",
        defaults: {
          maxWidth: "xl",
          eyebrow: "Wave 01",
          title: "Deploy with velocity, scale without ceremony.",
          subtitle: "Control release workflows without adding operational drag.",
          items: [
            { title: "Zero-config infrastructure", description: "Provision workers, routes, and policies in one surface." },
            { title: "Traffic-aware scaling", description: "Continuously adapt workloads to demand signals." },
            {
              title: "Precision analytics",
              description: "Observe every deploy in real time: rollout health and regional error budgets.",
              imageSrc: "/assets/template-factory/nexus-engineering-aura-ref/slices/desktop-approach.png",
              imageAlt: "Precision analytics",
            },
            {
              title: "Unified workflow control",
              description: "Feature flags, canary rollouts, and instant rollback from one surface.",
              imageSrc: "/assets/template-factory/nexus-engineering-aura-ref/slices/mobile-approach.png",
              imageAlt: "Unified workflow control",
            },
          ],
        },
      },
      products: {
        blockType: "NexusControlPanel",
        defaults: {
          maxWidth: "xl",
          eyebrow: "Wave 02",
          title: "AI-assisted product orchestration",
          subtitle: "Guide releases with context-aware automation and operator oversight.",
          tabs: [{ label: "Pipelines" }, { label: "Signals" }, { label: "Budgets" }, { label: "Teams" }],
          metrics: [
            { label: "Release Success", value: "99.4%" },
            { label: "Error Budget Burn", value: "-42%" },
            { label: "Mean Restore Time", value: "2m 18s" },
          ],
          kpis: [
            { label: "Active Pipelines", value: "128" },
            { label: "Guardrail Rules", value: "73" },
            { label: "AI Recommendations", value: "312" },
          ],
          dashboardImageSrc: "/assets/template-factory/nexus-engineering-aura-ref/slices/desktop-products.png",
          mobileDashboardImageSrc: "/assets/template-factory/nexus-engineering-aura-ref/slices/mobile-products.png",
          dashboardImageAlt: "AI-assisted product orchestration",
        },
      },
      socialproof: {
        blockType: "NexusProofMosaic",
        defaults: {
          maxWidth: "xl",
          title: "Ship Faster with Nexus",
          subtitle: "Teams report higher confidence and lower operational load after rollout.",
          quote:
            "Nexus gave us a single control plane for releases. We moved faster while reducing incident pressure across teams.",
          author: "Claire",
          role: "Engineering Lead",
        },
      },
      footer: {
        blockType: "NexusFooterCommand",
        defaults: {
          maxWidth: "xl",
          title: "Ready to streamline your workflow?",
          subtitle: "Join high-performance engineering teams using Nexus to orchestrate delivery from idea to shipping.",
          primaryCta: { label: "Start building for free", href: "#contact", variant: "primary" },
          secondaryCta: { label: "Contact Sales", href: "#contact", variant: "secondary" },
          columns: [
            { title: "Product", links: [{ label: "Features", href: "#services" }, { label: "Integrations", href: "#services" }] },
            { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Careers", href: "#about" }] },
            { title: "Resources", links: [{ label: "Community", href: "#resources" }, { label: "Help Center", href: "#resources" }] },
            { title: "Legal", links: [{ label: "Privacy Policy", href: "#legal" }, { label: "Terms of Service", href: "#legal" }] },
          ],
          legal: "© 2024 Nexus Inc. All rights reserved.",
        },
      },
    },
  },
  social_automation_neon: {
    id: "social_automation_neon",
    styleLabels: ["dark", "neon", "orange-accent", "growth", "saas"],
    paletteProfile: "dark-neon-orange",
    typographySignature: "bold-sans + display-sans",
    layoutPatterns: [
      "hero-beam-split",
      "dashboard-strip",
      "metrics-orbit-dual",
      "feature-cards-neon",
      "pricing-split-neon",
      "footer-glow-band",
    ],
    componentSignature: [
      "Navbar",
      "NeonHeroBeam",
      "NeonDashboardStrip",
      "NeonMetricsOrbit",
      "NeonFeatureCards",
      "NeonResultsShowcase",
      "NeonPricingSplit",
      "NeonFooterGlow",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "products", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: {
          variant: "withCTA",
          sticky: true,
          paddingY: "sm",
          maxWidth: "xl",
          background: "gradient",
          links: [
            { label: "Platform", href: "#platform", variant: "link" },
            { label: "Features", href: "#features", variant: "link" },
            { label: "Pricing", href: "#pricing", variant: "link" },
            { label: "Resources", href: "#resources", variant: "link" },
          ],
          ctas: [{ label: "Get Started", href: "#pricing", variant: "primary" }],
        },
      },
      hero: {
        blockType: "NeonHeroBeam",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          badge: "Social Growth, Autopilot Mode",
          title: "Social Reach. Automated Growth. Viral Results.",
          subtitle: "Scale campaigns with AI workflows, predictive insights, and measurable growth velocity.",
          panelTag: "Viral Result",
          panelTitle: "Growth Velocity",
          panelSubtitle: "Automated engagement hitting viral peaks.",
          statValue: "+842%",
          statDelta: "vs last week",
          ctas: [
            { label: "Explore Platform", href: "#platform", variant: "primary" },
            { label: "View Metrics", href: "#metrics", variant: "secondary" },
          ],
        },
      },
      story: {
        blockType: "NeonDashboardStrip",
        defaults: {
          paddingY: "md",
          maxWidth: "xl",
          eyebrow: "Wave 01",
          title: "Scale your reach instantly",
          subtitle: "Precision targeting, automated workflows, and brand safety controls.",
          tabs: [{ label: "Overview" }, { label: "Campaigns" }, { label: "Insights" }, { label: "Safety" }, { label: "AI" }],
          metrics: [
            { label: "Campaign Velocity", value: "+842%" },
            { label: "Total Reach", value: "2.4M" },
            { label: "Safety Score", value: "99.2%" },
          ],
          kpis: [
            { label: "Live Campaigns", value: "54" },
            { label: "Active Markets", value: "16" },
            { label: "Avg CTR", value: "4.8%" },
          ],
        },
      },
      approach: {
        blockType: "NeonMetricsOrbit",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Scale your reach instantly",
          subtitle: "Precision targeting, automated workflows, and brand safety controls.",
          metrics: [
            { label: "Campaign Velocity", value: "96k / week" },
            { label: "Reach Lift", value: "+842%" },
            { label: "Brand-safe Coverage", value: "99.2%" },
          ],
          chips: [{ label: "TikTok" }, { label: "Instagram" }, { label: "YouTube" }, { label: "X" }],
        },
      },
      products: {
        blockType: "NeonFeatureCards",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Engineered for exponential growth",
          subtitle: "Modular capability blocks for velocity, safety, and omnichannel scale.",
          items: [
            { title: "Predictive Intelligence", description: "Model outcomes before spend.", highlight: true },
            { title: "Autonomous Velocity", description: "Orchestrate publishing with adaptive timing." },
            { title: "Safety by Design", description: "Brand-safe automation with policy guardrails." },
            { title: "Omnichannel Scale", description: "Coordinate every channel from one control layer." },
          ],
        },
      },
      socialproof: {
        blockType: "NeonResultsShowcase",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Real results. Real growth.",
          subtitle: "Proof that strategy and structure drive meaningful outcomes.",
          quote: "We watched 56 creators double qualified reach while cutting manual operations effort in half.",
          author: "Claire",
          role: "Growth Director",
        },
      },
      cta: {
        blockType: "NeonPricingSplit",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Unlock viral growth",
          subtitle: "Choose your plan and activate automation in minutes.",
          items: [
            { name: "Creator", price: "$29" },
            { name: "Pro Growth", price: "$79" },
            { name: "Agency", price: "$199" },
          ],
          featuredName: "Creator",
          featuredPrice: "$29.00 / mo",
          features: [
            { label: "AI campaign orchestration" },
            { label: "Multi-channel scheduler" },
            { label: "Attribution insights" },
            { label: "Priority support" },
          ],
          cta: { label: "Start Free Trial", href: "#pricing", variant: "primary" },
        },
      },
      footer: {
        blockType: "NeonFooterGlow",
        defaults: {
          paddingY: "md",
          maxWidth: "xl",
          title: "Join our newsletter",
          subtitle: "Get strategic updates on digital media growth, automation, and creator insights.",
          primaryCta: { label: "Get Started", href: "#contact", variant: "primary" },
          secondaryCta: { label: "Learn More", href: "#features", variant: "secondary" },
          columns: [
            { title: "Platform", links: [{ label: "Capabilities", href: "#features" }, { label: "Pricing", href: "#pricing" }] },
            { title: "Resources", links: [{ label: "Docs", href: "#docs" }, { label: "Status", href: "#status" }] },
            { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Contact", href: "#contact" }] },
          ],
        },
      },
    },
  },
  powerbeat_fitness_neon: {
    id: "powerbeat_fitness_neon",
    styleLabels: ["fitness", "performance", "dark", "neon-green", "strength", "sport"],
    paletteProfile: "dark-neon-green",
    typographySignature: "bold-sans + athletic-condensed",
    imageLibrary: {
      hero: [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=2000&q=80",
      ],
      story: [
        "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=80",
      ],
      approach: [
        "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1600&q=80",
      ],
      products: [
        "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=600&q=80",
      ],
      socialproof: [
        "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80",
      ],
      cta: [
        "https://images.unsplash.com/photo-1470468969717-61d5d54fd036?auto=format&fit=crop&w=1400&q=80",
      ],
      footer: [
        "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1400&q=80",
      ],
    },
    layoutPatterns: [
      "minimal-dark-nav",
      "hero-athlete-overlay",
      "performance-proof-strip",
      "capability-cards-dark",
      "collection-cards-gallery",
      "community-testimonials-grid",
      "banner-cta-dark",
      "compact-footer-dark",
    ],
    componentSignature: [
      "NexusNavPulse",
      "NexusHeroDock",
      "FeatureGrid",
      "NexusCapabilityStrip",
      "CardsGrid",
      "TestimonialsGrid",
      "LeadCaptureCTA",
      "Footer",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "products", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "NexusNavPulse",
        defaults: {
          sticky: true,
          maxWidth: "xl",
          accentTone: "green",
          logoText: "PowerBeat",
          links: [
            { label: "Products", href: "#products" },
            { label: "Features", href: "#approach" },
            { label: "Reviews", href: "#socialproof" },
            { label: "Resources", href: "#footer" },
          ],
          cta: { label: "Shop Now", href: "#products", variant: "primary" },
        },
      },
      hero: {
        blockType: "NexusHeroDock",
        defaults: {
          maxWidth: "xl",
          accentTone: "green",
          heroImageHeightScale: 2,
          badge: "Premium Sports Equipment",
          title: "Forged for Intensity. Built for Growth.",
          subtitle: "Elevate your training with precision-engineered systems and relentless performance design.",
          panelTag: "Training Metrics",
          panelTitle: "Move Better",
          panelSubtitle: "Optimized strength workflows and intelligent training progression.",
          statValue: "+30%",
          statDelta: "mode",
          backgroundOverlay: "rgba(2, 10, 8, 0.45)",
          ctas: [
            { label: "Shop Equipment", href: "#products", variant: "primary" },
            { label: "View Features", href: "#approach", variant: "secondary" },
          ],
        },
      },
      story: {
        blockType: "FeatureGrid",
        defaults: {
          variant: "4col",
          paddingY: "md",
          maxWidth: "xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#050709 0%,#080d10 100%)",
          title: "Trusted by Performance Teams",
          subtitle: "Purpose-built equipment stacks for serious athletes and modern studios.",
          items: [
            { title: "Molecule Lab", desc: "Elite conditioning cycles.", icon: "sparkles" },
            { title: "Apex", desc: "Strength and movement science.", icon: "shield" },
            { title: "Velocity", desc: "Speed and reaction programs.", icon: "chart" },
            { title: "Titan", desc: "Durability-first hardware.", icon: "layers" },
          ],
        },
      },
      approach: {
        blockType: "NexusCapabilityStrip",
        defaults: {
          maxWidth: "xl",
          accentTone: "green",
          eyebrow: "Performance DNA",
          title: "Engineered for Human Potential",
          subtitle: "We don't just build gear. We optimize your movement and progression ecosystem.",
          items: [
            { title: "Military-grade Durability", description: "Heavy-duty frames and tested stress resistance for high-volume training." },
            { title: "Ergonomic Precision", description: "Biomechanics-tuned geometry for safer, stronger, repeatable motion." },
            { title: "Anywhere. Anytime", description: "Modular systems designed for gyms, studios, and home training setups." },
          ],
        },
      },
      products: {
        blockType: "CardsGrid",
        defaults: {
          anchor: "products",
          paddingY: "lg",
          maxWidth: "xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#050709 0%,#0a0f14 100%)",
          title: "The Collection",
          subtitle: "Minimalist design. Maximum output. Choose your weapon.",
          variant: "imageText",
          columns: "3col",
          featureFirst: true,
          density: "normal",
          cardStyle: "glass",
          imagePosition: "top",
          imageShape: "rounded",
          headingSize: "md",
          bodySize: "sm",
          items: [
            {
              title: "Resistance Series",
              description: "Our professional-grade gym machines are built to withstand the toughest workouts.",
              cta: { label: "Shop Now", href: "#products", variant: "primary" },
            },
            {
              title: "Cardio Sprint",
              description: "Lightweight cardio rigs engineered for interval intensity and repeatable output.",
              cta: { label: "Shop Now", href: "#products", variant: "primary" },
            },
            {
              title: "Performance Agent",
              description: "High-performance systems for athletes who push the limit.",
              cta: { label: "Shop Now", href: "#products", variant: "primary" },
            },
          ],
        },
      },
      socialproof: {
        blockType: "TestimonialsGrid",
        defaults: {
          anchor: "socialproof",
          variant: "3col",
          paddingY: "lg",
          maxWidth: "xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#06080d 0%,#090e13 100%)",
          title: "Community Feedback",
          items: [
            { quote: "This gear changed our studio's performance baseline in weeks.", name: "Maya", role: "Head Coach" },
            { quote: "Design quality is on another level. Durable, clean, and seriously effective.", name: "Leo", role: "Gym Owner" },
            { quote: "From setup to daily use, every detail feels intentional and athlete-first.", name: "Rina", role: "Athlete" },
          ],
        },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: {
          variant: "banner",
          paddingY: "md",
          maxWidth: "xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#070b10 0%,#07090c 100%)",
          title: "Ready to Level Up?",
          titleClassName: "!text-[#00ff00]",
          titleColor: "rgb(0 255 0 / var(--tw-bg-opacity, 1))",
          subtitle: "Join thousands of athletes training smarter with premium sports systems.",
          cta: { label: "Get Your Gear", href: "#products", variant: "primary" },
          ctaBackgroundColor: "rgb(0 255 0 / var(--tw-bg-opacity, 1))",
          ctaTextColor: "#001400",
          ctaClassName: "!bg-[#00ff00] !text-[#001400] hover:!bg-[#00ff00]",
          note: "Built for consistency, speed, and measurable progress.",
        },
      },
      footer: {
        blockType: "Footer",
        defaults: {
          anchor: "footer",
          variant: "multiColumn",
          paddingY: "md",
          maxWidth: "xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#040608 0%,#020304 100%)",
          logoText: "PowerBeat",
          columns: [
            { title: "Shop", links: [{ label: "Collections", href: "#products" }, { label: "Best Sellers", href: "#products" }] },
            { title: "Company", links: [{ label: "About", href: "#story" }, { label: "Contact", href: "#footer" }] },
            { title: "Resources", links: [{ label: "Support", href: "#footer" }, { label: "Terms", href: "#footer" }] },
          ],
          socials: [
            { type: "x", href: "#" },
            { type: "instagram", href: "#" },
            { type: "youtube", href: "#" },
          ],
          legal: "© 2026 PowerBeat. All rights reserved.",
        },
      },
    },
  },
  modern_saas: {
    id: "modern_saas",
    styleLabels: ["saas", "modern", "conversion", "clean"],
    paletteProfile: "cool-neutral",
    typographySignature: "sans-display + sans-body",
    layoutPatterns: ["hero-split", "feature-grid", "trust-grid", "cta-banner"],
    componentSignature: ["Navbar", "HeroSplit", "FeatureGrid", "TestimonialsGrid", "LeadCaptureCTA", "Footer"],
    requiredCategories: ["navigation", "hero", "approach", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: { variant: "withCTA", sticky: true, paddingY: "sm", maxWidth: "xl" },
      },
      hero: {
        blockType: "HeroSplit",
        defaults: { mediaPosition: "right", paddingY: "lg", headingSize: "md", maxWidth: "xl" },
      },
      approach: {
        blockType: "FeatureGrid",
        defaults: { variant: "3col", paddingY: "lg", maxWidth: "xl" },
      },
      socialproof: {
        blockType: "TestimonialsGrid",
        defaults: { variant: "2col", paddingY: "lg", maxWidth: "xl" },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: { variant: "banner", paddingY: "lg", maxWidth: "xl" },
      },
      footer: {
        blockType: "Footer",
        defaults: { variant: "multiColumn", paddingY: "md", maxWidth: "xl" },
      },
    },
  },
  calm_service: {
    id: "calm_service",
    styleLabels: ["wellness", "hospitality", "calm", "service"],
    paletteProfile: "soft-neutral",
    typographySignature: "serif-accent + sans-body",
    layoutPatterns: ["hero-split", "story-split", "feature-grid", "testimonial-grid", "banner-cta"],
    componentSignature: [
      "Navbar",
      "HeroSplit",
      "ContentStory",
      "FeatureGrid",
      "TestimonialsGrid",
      "LeadCaptureCTA",
      "Footer",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: { variant: "withCTA", sticky: true, paddingY: "sm", maxWidth: "xl" },
      },
      hero: {
        blockType: "HeroSplit",
        defaults: { mediaPosition: "right", paddingY: "lg", headingSize: "md", maxWidth: "xl" },
      },
      story: {
        blockType: "ContentStory",
        defaults: { variant: "split", paddingY: "lg", maxWidth: "xl" },
      },
      approach: {
        blockType: "FeatureGrid",
        defaults: { variant: "3col", paddingY: "lg", maxWidth: "xl" },
      },
      socialproof: {
        blockType: "TestimonialsGrid",
        defaults: { variant: "2col", paddingY: "lg", maxWidth: "xl" },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: { variant: "banner", paddingY: "lg", maxWidth: "xl" },
      },
      footer: {
        blockType: "Footer",
        defaults: { variant: "multiColumn", paddingY: "md", maxWidth: "xl" },
      },
    },
  },
  beauty_salon_serene: {
    id: "beauty_salon_serene",
    styleLabels: ["beauty-salon", "wellness", "editorial", "soft-beige", "service-booking"],
    paletteProfile: "soft-beige-neutral",
    typographySignature: "elegant-sans + clean-body",
    layoutPatterns: [
      "minimal-nav-light",
      "hero-split-portrait",
      "service-cards-grid",
      "contrast-feature-with-media",
      "faq-single-open",
      "consultation-split",
      "blog-cards-strip",
      "compact-multicol-footer",
    ],
    componentSignature: [
      "Navbar",
      "HeroSplit",
      "CardsGrid",
      "FeatureWithMedia",
      "FAQAccordion",
      "FeatureWithMedia",
      "CardsGrid",
      "LeadCaptureCTA",
      "Footer",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "products", "socialproof", "contact", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: {
          variant: "withCTA",
          sticky: true,
          paddingY: "sm",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#fafaf9 0%,#f6f6f4 100%)",
          logo: "BEAUTY SALON BANGKOK",
          links: [
            { label: "Home", href: "#top", variant: "link" },
            { label: "Services", href: "#services", variant: "link" },
            { label: "Blog", href: "#blog", variant: "link" },
            { label: "Contact", href: "#contact", variant: "link" },
          ],
          ctas: [{ label: "Book Now", href: "#contact", variant: "primary" }],
        },
      },
      hero: {
        blockType: "HeroSplit",
        defaults: {
          paddingY: "md",
          maxWidth: "2xl",
          align: "left",
          mediaPosition: "right",
          headingSize: "lg",
          bodySize: "md",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#fafaf9 0%,#f6f6f4 100%)",
          title: "Discover the best in beauty & wellness.",
          subtitle: "Premium beauty services for every need. Experience care, style, and confidence.",
          media: {
            kind: "image",
            src: "https://beautybodybangkok.com/wp-content/uploads/2024/06/beautiful-young-woman-smiling.webp",
            alt: "Beauty salon portrait",
          },
          ctas: [
            { label: "Book Appointment", href: "#contact", variant: "primary" },
            { label: "Our Services", href: "#services", variant: "secondary" },
          ],
        },
      },
      story: {
        blockType: "CardsGrid",
        defaults: {
          anchor: "services",
          paddingY: "md",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#fafaf9 0%,#f6f6f4 100%)",
          title: "Our Services",
          subtitle: "Tailored treatments for every style and skin journey.",
          variant: "imageText",
          columns: "3col",
          density: "normal",
          cardStyle: "solid",
          imagePosition: "top",
          imageShape: "rounded",
          headingSize: "sm",
          bodySize: "sm",
          items: [
            {
              title: "Hair Services",
              description: "Cut, style, treatment, and finishing by experienced stylists.",
              imageSrc: "https://beautybodybangkok.com/wp-content/uploads/2024/06/lady-giving-a-hair-cut.webp",
              imageAlt: "Hair service",
            },
            {
              title: "Nail Services",
              description: "Manicure and pedicure care with hygiene-first detail.",
              imageSrc: "https://beautybodybangkok.com/wp-content/uploads/2024/06/lady-hand-with-nails-done-after-manicure.webp",
              imageAlt: "Nail service",
            },
            {
              title: "Makeup Services",
              description: "Event-ready and daily makeup with personalized looks.",
              imageSrc: "https://beautybodybangkok.com/wp-content/uploads/2024/06/Waxing-Services.webp",
              imageAlt: "Makeup and beauty service",
            },
            {
              title: "Massage Services",
              description: "Relaxing body treatments for stress and recovery.",
              imageSrc: "https://beautybodybangkok.com/wp-content/uploads/2024/06/foot-massage-and-head-massage-at-the-same-time.webp",
              imageAlt: "Massage service",
            },
            {
              title: "Facial Care",
              description: "Customized facials for hydration, balance, and glow.",
              imageSrc:
                "https://beautybodybangkok.com/wp-content/uploads/2024/06/Beautician-with-a-brush-applies-a-white-moisturizing-mask-to-the-face-of-a-young-girl-client-in-a-sp_1.webp",
              imageAlt: "Facial treatment",
            },
            {
              title: "Skincare Services",
              description: "Professional routines for long-term skin health.",
              imageSrc: "https://beautybodybangkok.com/wp-content/uploads/2024/06/pedicure-chair-in-a-beauty-salon.webp",
              imageAlt: "Skincare service",
            },
          ],
        },
      },
      approach: {
        blockType: "FeatureWithMedia",
        defaults: {
          anchor: "why-choose-us",
          variant: "split",
          paddingY: "md",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#18181b 0%,#18181b 100%)",
          contentTone: "light",
          media: {
            kind: "image",
            src: "https://beautybodybangkok.com/wp-content/uploads/2024/06/beauty-body-bangkok-salon.webp",
            alt: "Salon interior",
          },
          eyebrow: "Why Choose Us",
          title: "Why Choose Beauty Body Bangkok?",
          subtitle: "Professional care with modern techniques and warm, attentive service.",
          body: "From expert stylists to premium products and flexible booking, each visit is built around comfort and confidence.",
          items: [],
          ctas: [{ label: "Book Appointment", href: "#contact", variant: "secondary" }],
        },
      },
      products: {
        blockType: "FAQAccordion",
        defaults: {
          anchor: "faq",
          paddingY: "md",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#fafaf9 0%,#f6f6f4 100%)",
          title: "Frequently Asked Questions",
          variant: "singleOpen",
          items: [
            { q: "What are your opening hours?", a: "We are open daily, including weekends. Please check current hours before visiting." },
            { q: "Do I need to book in advance?", a: "Advance booking is recommended for preferred time slots and specialist services." },
            { q: "What products do you use?", a: "We use salon-grade products selected for safety, performance, and skin compatibility." },
            { q: "Can I request a specific stylist?", a: "Yes. Mention your preferred stylist while booking and we will arrange it when available." },
            { q: "Do you offer consultation before treatment?", a: "Yes. We provide consultation to align treatment plans with your goals." },
          ],
        },
      },
      socialproof: {
        blockType: "FeatureWithMedia",
        defaults: {
          anchor: "consultation",
          variant: "reverse",
          paddingY: "md",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#fafaf9 0%,#f6f6f4 100%)",
          media: {
            kind: "image",
            src: "https://beautybodybangkok.com/wp-content/uploads/2024/06/pedicure-chair-in-a-beauty-salon.webp",
            alt: "Consultation area",
          },
          eyebrow: "Consultation",
          title: "Free Consultation.",
          subtitle: "Book a short session to match services with your needs and schedule.",
          body: "Our team helps you choose the right treatment path before your first appointment.",
          items: [],
          ctas: [{ label: "Book a Consultation", href: "#contact", variant: "primary" }],
        },
      },
      contact: {
        blockType: "CardsGrid",
        defaults: {
          anchor: "blog",
          paddingY: "md",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#fafaf9 0%,#f6f6f4 100%)",
          title: "Latest from the Blog",
          subtitle: "Trends, care routines, and practical beauty advice from our team.",
          variant: "imageText",
          columns: "3col",
          density: "compact",
          cardStyle: "solid",
          imagePosition: "top",
          imageShape: "rounded",
          headingSize: "sm",
          bodySize: "sm",
          items: [
            {
              title: "Discover Why Thai Massage is Loved",
              description: "Explore the history and wellness benefits of traditional Thai massage.",
              tag: "Massage",
              imageSrc: "https://beautybodybangkok.com/wp-content/uploads/2024/09/the-origin-of-thai-massage-768x432.webp",
              imageAlt: "Thai massage guide",
            },
            {
              title: "Eyelash Extensions in Bangkok",
              description: "A practical guide to styles, retention, and aftercare.",
              tag: "Eyelash",
              imageSrc:
                "https://beautybodybangkok.com/wp-content/uploads/2024/09/stunning-womans-long-eyelashes-768x432.webp",
              imageAlt: "Eyelash extension close-up",
            },
            {
              title: "How to Choose the Right Salon",
              description: "Checklist for selecting a reliable salon with the right specialists.",
              tag: "Salon",
              imageSrc: "https://beautybodybangkok.com/wp-content/uploads/2024/06/image-7-768x384.jpeg",
              imageAlt: "Salon styling scene",
            },
          ],
        },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: {
          anchor: "book-now",
          variant: "card",
          paddingY: "sm",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#fafaf9 0%,#f6f6f4 100%)",
          title: "Ready for your next appointment?",
          subtitle: "Choose your preferred service and reserve a time in minutes.",
          cta: { label: "Book Now", href: "#contact", variant: "primary" },
          note: "Same-day slots available for selected services.",
        },
      },
      footer: {
        blockType: "Footer",
        defaults: {
          anchor: "contact",
          variant: "multiColumn",
          paddingY: "md",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg,#fafaf9 0%,#f6f6f4 100%)",
          logoText: "BEAUTY SALON BANGKOK",
          columns: [
            { title: "Services", links: [{ label: "Hair", href: "#services" }, { label: "Nails", href: "#services" }, { label: "Facial", href: "#services" }] },
            { title: "Company", links: [{ label: "About", href: "#why-choose-us" }, { label: "Blog", href: "#blog" }, { label: "Contact", href: "#contact" }] },
            { title: "Legal", links: [{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }] },
          ],
          legal: "© 2026 Beauty Salon Bangkok. All rights reserved.",
        },
      },
    },
  },
};

const slug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const parseArgs = (argv) =>
  resolveCliOptions(argv, {
    root: ROOT,
    defaultManifest: DEFAULT_MANIFEST,
    defaultTemplateFirstGroup: DEFAULT_TEMPLATE_FIRST_GROUP,
    defaultPreviewBaseUrl: DEFAULT_PREVIEW_BASE_URL,
  });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatElapsed = (ms) => {
  const total = Math.max(0, Math.floor(Number(ms) || 0));
  const sec = Math.floor(total / 1000);
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  if (min > 0) return `${min}m${String(rem).padStart(2, "0")}s`;
  return `${rem}s`;
};

const runWithProgress = async (label, work, options = {}) => {
  const heartbeatMs = Math.max(5000, Math.floor(Number(options.heartbeatMs) || 20000));
  const started = Date.now();
  const prefix = options.prefix ? `${options.prefix} ` : "";
  console.log(`${prefix}${label} ...`);
  const timer = setInterval(() => {
    const elapsed = formatElapsed(Date.now() - started);
    console.log(`${prefix}${label} in progress (${elapsed})`);
  }, heartbeatMs);

  try {
    const result = await work();
    clearInterval(timer);
    const elapsed = formatElapsed(Date.now() - started);
    console.log(`${prefix}${label} done (${elapsed})`);
    return result;
  } catch (error) {
    clearInterval(timer);
    const elapsed = formatElapsed(Date.now() - started);
    console.error(`${prefix}${label} failed (${elapsed})`);
    throw error;
  }
};

const runWithSemaphore = async (semaphore, work) => {
  if (!semaphore) return work();
  await semaphore.acquire();
  try {
    return await work();
  } finally {
    semaphore.release();
  }
};

const runSiteWithRetries = async ({
  site,
  siteIndex,
  sites,
  options,
  execute,
}) => {
  const maxAttempts = Math.max(1, Math.floor(Number(options?.siteRetryCount || 0)) + 1);
  const retryDelayMs = Math.max(0, Math.floor(Number(options?.siteRetryDelayMs || 0)));
  const breakerThreshold = Math.max(1, Math.floor(Number(options?.siteCircuitBreakerThreshold || 1)));
  const prefix = `[template-factory][${siteIndex + 1}/${sites.length}][${site?.id || "site"}]`;

  let failureCount = 0;
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      if (attempt > 1) {
        console.log(`${prefix} retry attempt ${attempt}/${maxAttempts}`);
      }
      return await execute({ attempt, maxAttempts });
    } catch (error) {
      lastError = error;
      failureCount += 1;
      const message = error instanceof Error ? error.message : String(error);
      const breakerReached = failureCount >= breakerThreshold;
      const canRetry = attempt < maxAttempts && !breakerReached;
      console.warn(
        `${prefix} attempt ${attempt}/${maxAttempts} failed: ${message}${breakerReached ? " (circuit-breaker reached)" : ""}`
      );
      if (!canRetry) break;
      if (retryDelayMs > 0) {
        await wait(retryDelayMs);
      }
    }
  }
  throw lastError || new Error(`${prefix} failed`);
};

const normalizePreviewBaseUrl = (raw) => {
  try {
    const parsed = new URL(raw);
    return parsed.origin;
  } catch {
    return DEFAULT_PREVIEW_BASE_URL;
  }
};

const rebaseToPreviewOrigin = (rawUrl, previewOrigin) => {
  if (!rawUrl) return "";
  try {
    const input = new URL(rawUrl);
    const base = new URL(previewOrigin);
    return `${base.origin}${input.pathname}${input.search}${input.hash}`;
  } catch {
    return rawUrl;
  }
};

const canReachUrl = async (url, timeoutMs = 1500) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    clearTimeout(timeout);
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
};

const ensurePreviewServer = async ({ previewBaseUrl }) => {
  const origin = normalizePreviewBaseUrl(previewBaseUrl);
  const reachable = await canReachUrl(origin, 1500);
  if (reachable) {
    return { origin, reachable: true, started: false, logPath: null, mode: "existing" };
  }

  const parsed = new URL(origin);
  const port = Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80));
  const startLogPath = `/tmp/template-factory-preview-${port}.log`;
  const startCmd = `cd ${JSON.stringify(ROOT)} && nohup npm run dev -- -p ${Math.floor(port)} > ${JSON.stringify(
    startLogPath
  )} 2>&1 < /dev/null &`;

  const tryStartAndWait = async (modeLabel, attempts = 30) => {
    await runShell(startCmd, { cwd: ROOT, allowFailure: true });
    for (let i = 0; i < attempts; i += 1) {
      if (await canReachUrl(origin, 1500)) {
        return { origin, reachable: true, started: true, logPath: startLogPath, mode: modeLabel };
      }
      await wait(1000);
    }
    return null;
  };

  const fastStart = await tryStartAndWait("dev");
  if (fastStart) return fastStart;

  return {
    origin,
    reachable: false,
    started: true,
    logPath: startLogPath,
    mode: "failed",
  };
};

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const runShell = (cmd, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn("zsh", ["-lc", cmd], {
      cwd: options.cwd || ROOT,
      env: { ...process.env, ...(options.env || {}) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let killed = false;
    const timeoutMs = options.timeoutMs || 0;
    let timer = null;
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        killed = true;
        child.kill("SIGTERM");
        setTimeout(() => {
          try { child.kill("SIGKILL"); } catch {}
        }, 5000);
      }, timeoutMs);
    }
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (killed && options.allowFailure) {
        resolve({ code: code ?? 1, stdout, stderr: stderr + "\n[runShell] killed: timeout exceeded" });
        return;
      }
      if (code !== 0 && !options.allowFailure) {
        reject(new Error(`Command failed (${code}): ${cmd}\n${stderr || stdout}`));
        return;
      }
      resolve({ code: code ?? 0, stdout, stderr });
    });
  });

const readJsonIfExists = async (filePath) => {
  if (!filePath) return null;
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const parseJsonLine = (value) => {
  const text = String(value || "").trim();
  if (!text) return null;
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (!line.startsWith("{")) continue;
    try {
      return JSON.parse(line);
    } catch {
      continue;
    }
  }
  return null;
};

const normalizeColorToken = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const rgba = raw.match(/^rgba?\(([^)]+)\)$/i);
  if (rgba) {
    const channels = rgba[1].split(",").map((item) => Number(item.trim())).filter((item) => Number.isFinite(item));
    if (channels.length >= 3) {
      const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
      return `#${toHex(channels[0])}${toHex(channels[1])}${toHex(channels[2])}`;
    }
  }
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    const token = raw.slice(1).toLowerCase();
    return `#${token[0]}${token[0]}${token[1]}${token[1]}${token[2]}${token[2]}`;
  }
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
  return "";
};

const mergeThemeColors = (summary, styleFused) => {
  const existing = Array.isArray(summary?.themeColors) ? summary.themeColors : [];
  const fusedColors = Array.isArray(styleFused?.tokens?.colors)
    ? styleFused.tokens.colors.map((entry) => normalizeColorToken(entry?.value || entry)).filter(Boolean)
    : [];
  const merged = dedupeUrls([...existing, ...fusedColors], 20);
  return merged;
};

const runHybridCrawlerPipeline = async ({ site, ingestDir, maxPages, maxDepth, timeoutMs = 20000, preferLanguage = "en" }) => {
  if (!site?.url) return { ok: false, reason: "missing_url" };
  const scriptExists = await fs
    .access(HYBRID_CRAWL_SCRIPT)
    .then(() => true)
    .catch(() => false);
  if (!scriptExists) {
    return { ok: false, reason: "script_missing", error: `Missing script: ${HYBRID_CRAWL_SCRIPT}` };
  }
  const outputDir = path.join(ingestDir, "hybrid");
  await ensureDir(outputDir);
  const cmd = [
    "python3",
    JSON.stringify(HYBRID_CRAWL_SCRIPT),
    "--url",
    JSON.stringify(site.url),
    "--output-dir",
    JSON.stringify(outputDir),
    "--max-pages",
    String(Math.max(1, Math.floor(Number(maxPages) || 1))),
    "--max-depth",
    String(Math.max(0, Math.floor(Number(maxDepth) || 0))),
    "--concurrency",
    "3",
    "--timeout-ms",
    String(Math.max(1000, Math.floor(Number(timeoutMs) || 20000))),
    "--prefer-language",
    String(preferLanguage || "en"),
  ].join(" ");

  const pipelineTimeoutMs = Math.max(60000, Math.floor(Number(maxPages) || 1) * timeoutMs * 2 + 120000);
  const result = await runShell(cmd, { cwd: ROOT, allowFailure: true, timeoutMs: pipelineTimeoutMs });
  const parsed = parseJsonLine(result.stdout) || parseJsonLine(result.stderr);
  if (result.code !== 0 || !parsed?.ok) {
    return {
      ok: false,
      reason: "execution_failed",
      code: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
      parsed,
    };
  }

  const crawlReport = await readJsonIfExists(parsed.crawl_report_path);
  const crawlResult = await readJsonIfExists(parsed.crawl_result_path);
  const visualAnalysis = await readJsonIfExists(parsed.visual_analysis_path);
  const styleFused = await readJsonIfExists(parsed.style_fused_path);

  return {
    ok: true,
    outputDir,
    crawlReport,
    crawlResult,
    visualAnalysis,
    styleFused,
    paths: {
      crawlReportPath: parsed.crawl_report_path || path.join(outputDir, "crawl_report.json"),
      crawlResultPath: parsed.crawl_result_path || path.join(outputDir, "crawl_result.json"),
      visualAnalysisPath: parsed.visual_analysis_path || path.join(outputDir, "visual_analysis.json"),
      styleFusedPath: parsed.style_fused_path || path.join(outputDir, "style_fused.json"),
    },
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
  };
};

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  values.push(current.trim());
  return values;
};

const parseCsvManifest = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const sites = [];
  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] || "";
    });
    sites.push(item);
  }
  return sites;
};

const parseBool = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return false;
  const token = value.trim().toLowerCase();
  return token === "1" || token === "true" || token === "yes" || token === "y";
};

const parsePositiveInt = (value, fallback) => {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return n > 0 ? n : fallback;
};

const parseNonNegativeInt = (value, fallback) => {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return n >= 0 ? n : fallback;
};

const normalizeSite = (raw, index) => {
  const id = slug(raw.id || raw.site_id || raw.name || `site-${index + 1}`);
  const url = typeof raw.url === "string" ? raw.url.trim() : "";
  const prompt = typeof raw.prompt === "string" ? raw.prompt.trim() : "";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  const desktopScreenshot =
    typeof raw.desktopScreenshot === "string"
      ? raw.desktopScreenshot
      : typeof raw.desktop_screenshot === "string"
        ? raw.desktop_screenshot
        : "";
  const mobileScreenshot =
    typeof raw.mobileScreenshot === "string"
      ? raw.mobileScreenshot
      : typeof raw.mobile_screenshot === "string"
        ? raw.mobile_screenshot
        : "";
  const imageSourcePolicyRaw =
    typeof raw.imageSourcePolicy === "string"
      ? raw.imageSourcePolicy
      : typeof raw.image_source_policy === "string"
        ? raw.image_source_policy
        : "";
  const imageSourcePolicy = String(imageSourcePolicyRaw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z_]+/g, "_");
  const disableScreenshotImages = parseBool(
    raw.disableScreenshotImages ?? raw.disable_screenshot_images ?? false
  );
  const crawlSite = parseBool(raw.crawlSite ?? raw.crawl_site ?? false);
  const crawlMaxPages = parsePositiveInt(raw.crawlMaxPages ?? raw.crawl_max_pages, 0);
  const crawlMaxDepth = parseNonNegativeInt(raw.crawlMaxDepth ?? raw.crawl_max_depth, -1);
  const crawlCapturePages = parseNonNegativeInt(raw.crawlCapturePages ?? raw.crawl_capture_pages, -1);
  const maxDiscoveredPages = parsePositiveInt(raw.maxDiscoveredPages ?? raw.max_discovered_pages, 0);
  const maxNavLinks = parsePositiveInt(raw.maxNavLinks ?? raw.max_nav_links, 0);
  const mustIncludePatternsRaw = Array.isArray(raw.mustIncludePatterns)
    ? raw.mustIncludePatterns
    : Array.isArray(raw.must_include_patterns)
      ? raw.must_include_patterns
      : typeof raw.mustIncludePatterns === "string"
        ? raw.mustIncludePatterns.split(",")
        : typeof raw.must_include_patterns === "string"
          ? raw.must_include_patterns.split(",")
          : [];
  const mustIncludePatterns = mustIncludePatternsRaw.map((entry) => String(entry || "").trim()).filter(Boolean);
  const antiCrawlPrecheck = parseBool(raw.antiCrawlPrecheck ?? raw.anti_crawl_precheck ?? true);
  const antiCrawlTimeoutMs = parsePositiveInt(raw.antiCrawlTimeoutMs ?? raw.anti_crawl_timeout_ms, 0);
  const fidelityModeRaw =
    typeof raw.fidelityMode === "string"
      ? raw.fidelityMode
      : typeof raw.fidelity_mode === "string"
        ? raw.fidelity_mode
        : "";
  const fidelityMode = String(fidelityModeRaw || "").trim().toLowerCase() === "strict" ? "strict" : "standard";
  const fidelityThreshold = parseNonNegativeInt(raw.fidelityThreshold ?? raw.fidelity_threshold, -1);
  const fidelityPageThreshold = parseNonNegativeInt(raw.fidelityPageThreshold ?? raw.fidelity_page_threshold, -1);
  const requiredPagesPerSite = parsePositiveInt(raw.requiredPagesPerSite ?? raw.required_pages_per_site, 0);
  const fidelityEnforcementRaw =
    typeof raw.fidelityEnforcement === "string"
      ? raw.fidelityEnforcement
      : typeof raw.fidelity_enforcement === "string"
        ? raw.fidelity_enforcement
        : "";
  const fidelityEnforcement = String(fidelityEnforcementRaw || "").trim().toLowerCase() === "fail" ? "fail" : "warn";
  const specialRules = raw?.specialRules && typeof raw.specialRules === "object" ? raw.specialRules : {};
  const featureToggles = raw?.featureToggles && typeof raw.featureToggles === "object" ? raw.featureToggles : {};

  return {
    id: id || `site-${index + 1}`,
    url,
    prompt,
    description,
    desktopScreenshot: desktopScreenshot.trim(),
    mobileScreenshot: mobileScreenshot.trim(),
    imageSourcePolicy,
    disableScreenshotImages,
    crawlSite,
    crawlMaxPages,
    crawlMaxDepth,
    crawlCapturePages,
    maxDiscoveredPages,
    maxNavLinks,
    mustIncludePatterns,
    antiCrawlPrecheck,
    antiCrawlTimeoutMs,
    fidelityMode,
    fidelityThreshold,
    fidelityPageThreshold,
    requiredPagesPerSite,
    fidelityEnforcement,
    specialRules,
    featureToggles,
  };
};

const normalizeRulePath = (pathValue) => {
  const normalized = normalizeTemplatePagePath(pathValue || "/");
  return normalized.toLowerCase();
};

const isBlogLikePath = (pathValue) => {
  const p = normalizeRulePath(pathValue);
  return p.includes("/blogs/") || p.includes("/blog/") || /\/technology\/?$/.test(p) || p.includes("/technology/");
};

const isProductLikePath = (pathValue) => {
  const p = normalizeRulePath(pathValue);
  return p.includes("/products/") || p.includes("/headphones/") || p.includes("/collections/");
};

const isSupportLikePath = (pathValue) => {
  const p = normalizeRulePath(pathValue);
  return p.includes("/support") || p.includes("/help") || p.includes("/downloads") || p.includes("/docs") || p.includes("/contact");
};

const tokenizeSimilarityText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);

const buildSimilarityTokenSet = ({ site, summary, context }) => {
  const parts = [
    site?.url || "",
    site?.description || "",
    site?.prompt || "",
    summary?.title || "",
    ...(Array.isArray(summary?.h1) ? summary.h1 : []),
    ...(Array.isArray(summary?.h2) ? summary.h2 : []),
    context?.currentPath || "",
  ];
  const tokens = new Set();
  for (const part of parts) {
    for (const token of tokenizeSimilarityText(part)) tokens.add(token);
  }
  return tokens;
};

const rankGalleryBySimilarity = (gallery = [], tokenSet = new Set()) => {
  const ranked = [];
  for (const src of Array.isArray(gallery) ? gallery : []) {
    const value = String(src || "").trim();
    if (!/^https?:\/\//i.test(value)) continue;
    const srcTokens = tokenizeSimilarityText(value);
    const score = srcTokens.reduce((acc, token) => acc + (tokenSet.has(token) ? 1 : 0), 0);
    ranked.push({ src: value, score });
  }
  ranked.sort((a, b) => b.score - a.score);
  return {
    matched: ranked.filter((row) => row.score > 0).map((row) => row.src),
    all: ranked.map((row) => row.src),
  };
};

const applySiteSpecialRulesToPages = ({ site, pages = [], crawl = null }) => {
  if (!Array.isArray(pages) || !pages.length) {
    return {
      pages: [],
      failed: [],
      notes: [],
    };
  }

  const notes = [
    "Global rule: e-commerce routes are display-only and keep one representative product template page.",
    "Global rule: blog/technology/article routes use markdown-friendly content format.",
    "Global rule: support/help routes are content-only; download/cart/checkout flows are excluded.",
    "Global rule: extraction-failed pages are omitted from templates and recorded in extraction_failures.",
    "Global rule: repeated page structures (article/blog/product) keep one representative template page.",
  ];

  const failed = [];
  const crawlErrors = Array.isArray(crawl?.errors) ? crawl.errors : [];
  for (const err of crawlErrors) {
    const pathValue = routePathFromUrl(err?.url || "");
    failed.push({
      path: pathValue,
      reason: String(err?.error || "crawl_failed"),
      url: String(err?.url || ""),
      source: "crawl_error",
    });
  }

  const enriched = pages.map((page) => {
    const path = normalizeTemplatePagePath(page?.path || "/");
    const next = {
      ...page,
      required_categories: Array.isArray(page?.required_categories) ? [...page.required_categories] : [],
      special_rules: {
        ...(page?.special_rules && typeof page.special_rules === "object" ? page.special_rules : {}),
      },
    };

    if (path === "/") {
      next.special_rules.navMegaMenu = true;
      next.special_rules.navMenuPresentation = "image_text_dropdown";
    }

    const pageType = classifyTemplatePageType(path, String(page?.name || ""));
    if (pageType === "blog" || isBlogLikePath(path)) {
      next.special_rules.contentFormat = "markdown";
      next.special_rules.blogMode = true;
      next.required_categories = unique(["navigation", "hero", "story", "footer"].filter(Boolean));
    }

    if (pageType === "contact" || isSupportLikePath(path)) {
      next.special_rules.supportContentOnly = true;
      next.special_rules.excludeDownloads = true;
      next.special_rules.excludeCommerce = true;
      next.required_categories = unique(["navigation", "hero", "story", "contact", "footer"].filter(Boolean));
    }

    if (pageType === "products" || isProductLikePath(path)) {
      next.special_rules.ecommerceDisplayOnly = true;
      next.special_rules.excludeCart = true;
      next.special_rules.excludeCheckout = true;
    }

    return next;
  });

  const filteredByFlow = enriched.filter((page) => {
    const path = normalizeTemplatePagePath(page?.path || "/");
    const token = path.toLowerCase();
    if (/(^|\/)cart(\/|$)|(^|\/)checkout(\/|$)|(^|\/)account(\/|$)|(^|\/)orders?(\/|$)/.test(token)) {
      failed.push({
        path,
        reason: "excluded_flow_cart_checkout_account",
        url: "",
        source: "global_rule",
      });
      return false;
    }
    if (isLikelyDownloadPath(path)) {
      failed.push({
        path,
        reason: "excluded_download_flow",
        url: "",
        source: "global_rule",
      });
      return false;
    }
    return true;
  });

  const dedupeByTemplateType = new Set(["products", "blog"]);
  const seenType = new Set();
  const filtered = filteredByFlow.filter((page) => {
    const path = normalizeTemplatePagePath(page?.path || "/");
    const pageType = classifyTemplatePageType(path, String(page?.name || ""));
    if (!dedupeByTemplateType.has(pageType)) return true;
    if (!seenType.has(pageType)) {
      seenType.add(pageType);
      return true;
    }
    failed.push({
      path,
      reason: `excluded_by_template_structure_dedupe_${pageType}`,
      url: "",
      source: "global_rule",
    });
    return false;
  });

  return { pages: filtered, failed, notes };
};

const loadManifest = async (manifestPath) => {
  const ext = path.extname(manifestPath).toLowerCase();
  if (ext === ".csv") {
    const rows = await parseCsvManifest(manifestPath);
    return rows.map((row, index) => normalizeSite(row, index)).filter((item) => item.url || item.prompt);
  }

  const raw = await fs.readFile(manifestPath, "utf8");
  const parsed = JSON.parse(raw);
  const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.sites) ? parsed.sites : [];
  return rows.map((row, index) => normalizeSite(row, index)).filter((item) => item.url || item.prompt);
};

const stripHtml = (value) =>
  String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractFirstMatches = (html, regex, limit = 8) => {
  const out = [];
  let match;
  while ((match = regex.exec(html)) && out.length < limit) {
    const value = stripHtml(match[1] || "");
    if (value) out.push(value);
  }
  return out;
};

const toAbsoluteUrl = (value, baseUrl) => {
  const raw = String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/&#x2f;/gi, "/")
    .replace(/&#47;/gi, "/")
    .trim();
  if (!raw || raw.startsWith("data:") || raw.startsWith("blob:")) return "";
  try {
    return new URL(raw, baseUrl).toString();
  } catch {
    return "";
  }
};

const dedupeUrls = (items, limit = 24) => {
  const seen = new Set();
  const out = [];
  for (const item of items || []) {
    const next = String(item || "").trim();
    if (!next) continue;
    const key = next
      .toLowerCase()
      .replace(/&amp;/g, "&")
      .replace(/%2c/g, ",")
      .replace(/%2f/g, "/")
      .replace(/%3a/g, ":");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(next);
    if (out.length >= limit) break;
  }
  return out;
};

const extractImageUrls = (html, pageUrl) => {
  const candidates = [];
  const collect = (value) => {
    const next = toAbsoluteUrl(value, pageUrl);
    if (!next) return;
    candidates.push(next);
  };

  let match;
  const metaRegex = /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
  while ((match = metaRegex.exec(html))) collect(match[1] || "");

  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = imgRegex.exec(html))) collect(match[1] || "");

  const srcSetRegex = /<(?:img|source)[^>]+srcset=["']([^"']+)["'][^>]*>/gi;
  while ((match = srcSetRegex.exec(html))) {
    const srcSet = String(match[1] || "");
    const parts = srcSet
      .split(",")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [src, descriptor] = chunk.split(/\s+/, 2);
        const width = descriptor && /w$/i.test(descriptor) ? Number(descriptor.replace(/[^\d.]/g, "")) : 0;
        const density = descriptor && /x$/i.test(descriptor) ? Number(descriptor.replace(/[^\d.]/g, "")) : 0;
        return { src: src || "", score: width > 0 ? width : density > 0 ? density * 1000 : 1 };
      })
      .sort((a, b) => b.score - a.score);
    const best = parts[0]?.src || "";
    collect(best);
  }

  return dedupeUrls(candidates, 40);
};

const dedupeLinkItems = (items, limit = 24) => {
  const seen = new Set();
  const out = [];
  for (const item of Array.isArray(items) ? items : []) {
    const label = String(item?.label || "").replace(/\s+/g, " ").trim();
    const href = String(item?.href || "").trim();
    if (!label || !href) continue;
    const key = `${label.toLowerCase()}::${href.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, href });
    if (out.length >= limit) break;
  }
  return out;
};

const extractAnchorPairs = (html, pageUrl, limit = 80) => {
  const pairs = [];
  let match;
  const hrefRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = hrefRegex.exec(String(html || ""))) && pairs.length < limit) {
    const label = stripHtml(match[2] || "").replace(/\s+/g, " ").trim();
    const href = toAbsoluteUrl(match[1] || "", pageUrl);
    if (!label || !href) continue;
    pairs.push({ label, href });
  }
  return dedupeLinkItems(pairs, limit);
};

const extractFooterLinks = (html, pageUrl, rootOrigin) => {
  const text = String(html || "");
  if (!text) return [];
  const footerMatch = text.match(/<footer[\s\S]*?<\/footer>/i);
  const footerHtml = footerMatch?.[0] || "";
  const scoped = footerHtml || text.slice(Math.max(0, text.length - 120000));
  const pairs = extractAnchorPairs(scoped, pageUrl, 80);
  const normalized = pairs
    .map((pair) => {
      const href = normalizeInternalPageUrl(pair.href, rootOrigin, pageUrl);
      if (!href) return null;
      return {
        label: pair.label,
        href: routePathFromUrl(href),
      };
    })
    .filter(Boolean);
  return dedupeLinkItems(normalized, 24);
};

const detectHeaderMenuDepth = (html) => {
  const top = String(html || "").slice(0, 160000);
  if (!top) return 1;
  const navMatch = top.match(/<nav[\s\S]*?<\/nav>/i);
  const navHtml = navMatch?.[0] || top.slice(0, 80000);
  const nestedList = /<ul[\s\S]*?<ul/i.test(navHtml) || /<li[\s\S]*?<ul/i.test(navHtml);
  const hasAriaPopup = /aria-haspopup=["'](?:true|menu)["']/i.test(navHtml) || /role=["']menu["']/i.test(navHtml);
  if (nestedList || hasAriaPopup) return 2;
  return 1;
};

const normalizeHeroPresentation = (value) => {
  const mode = String(value?.mode || "unknown").toLowerCase();
  const normalizedMode = mode === "background_text" || mode === "split" ? mode : "unknown";
  return {
    mode: normalizedMode,
    hasHeading: Boolean(value?.hasHeading),
    hasForegroundImage: Boolean(value?.hasForegroundImage),
    hasBackgroundImage: Boolean(value?.hasBackgroundImage),
  };
};

const detectHeroPresentation = (html) => {
  const top = String(html || "").slice(0, 180000);
  if (!top) return normalizeHeroPresentation(null);
  const heroMatch =
    top.match(/<(?:section|div|main)[^>]*(?:hero|masthead|banner|showcase)[^>]*>[\s\S]{0,60000}?<\/(?:section|div|main)>/i) ||
    top.match(/<main[\s\S]{0,120000}<\/main>/i);
  const heroHtml = heroMatch?.[0] || top.slice(0, 100000);
  const hasHeading = /<h1[\s>]/i.test(heroHtml);
  const hasForegroundImage = /<(img|picture|video)\b/i.test(heroHtml);
  const hasBackgroundImage =
    /background(?:-image)?\s*:/i.test(heroHtml) ||
    /(hero-bg|hero-background|shero|masthead-media|bg-image)/i.test(heroHtml);
  const mode = hasHeading && (hasBackgroundImage || hasForegroundImage) ? "background_text" : "split";
  return normalizeHeroPresentation({
    mode,
    hasHeading,
    hasForegroundImage,
    hasBackgroundImage,
  });
};

const HERO_CAROUSEL_LIBRARY_PATTERNS = [
  /swiper/i,
  /splide/i,
  /flickity/i,
  /slick-slider/i,
  /keen-slider/i,
  /owl-carousel/i,
  /\bcarousel\b/i,
  /\bslider\b/i,
];

const HERO_CONTEXT_PATTERNS = [/hero/i, /masthead/i, /banner/i, /showcase/i];

const isLikelyDecorativeImage = (urlValue) => {
  const value = String(urlValue || "").toLowerCase();
  if (!value) return true;
  if (/\.(svg|ico)(?:$|\?)/i.test(value)) return true;
  if (/(logo|favicon|icon|sprite|avatar|placeholder)/i.test(value)) return true;
  return false;
};

const extractCarouselCandidatesFromHtml = (html, pageUrl) => {
  const markup = String(html || "");
  if (!markup) return [];
  const sections = [];
  const segmentRegex =
    /<(?:section|div|main)[^>]*(?:hero|banner|masthead|showcase|carousel|slider|swiper|splide|slick|flickity|keen)[^>]*>[\s\S]{0,32000}?<\/(?:section|div|main)>/gi;
  let match;
  while ((match = segmentRegex.exec(markup))) {
    const segment = String(match[0] || "");
    if (segment) sections.push(segment);
    if (sections.length >= 6) break;
  }
  if (!sections.length) {
    sections.push(markup.slice(0, 120000));
  }

  const candidates = [];
  for (const segment of sections) {
    const urls = extractImageUrls(segment, pageUrl);
    candidates.push(...urls);
  }
  return dedupeUrls(
    candidates.filter((urlValue) => !isLikelyDecorativeImage(urlValue)),
    24
  );
};

const detectHeroCarousel = (html, pageUrl) => {
  const markup = String(html || "");
  if (!markup) {
    return { enabled: false, signalCount: 0, signals: [], images: [] };
  }

  const topChunk = markup.slice(0, 150000);
  const signals = [];

  const hasLibraryHint = HERO_CAROUSEL_LIBRARY_PATTERNS.some((pattern) => pattern.test(topChunk));
  if (hasLibraryHint) signals.push("library");

  const hasSlideAria = /aria-roledescription=["']slide["']/i.test(topChunk);
  if (hasSlideAria) signals.push("aria-slide");

  const hasIndicators =
    (topChunk.match(/(carousel-indicators|swiper-pagination|data-slide|go to slide|slick-dots)/gi) || []).length >= 2;
  if (hasIndicators) signals.push("indicators");

  const hasHeroContext = HERO_CONTEXT_PATTERNS.some((pattern) => pattern.test(topChunk));
  const hasSlideToken = /\b(slide|slides|carousel|slider)\b/i.test(topChunk);
  if (hasHeroContext && hasSlideToken) signals.push("hero-context");

  const images = extractCarouselCandidatesFromHtml(topChunk, pageUrl);
  if (images.length >= 2) signals.push("multi-image");

  const enabled =
    signals.includes("hero-context") && (signals.includes("library") || signals.includes("indicators") || images.length >= 2);

  return {
    enabled,
    signalCount: signals.length,
    signals,
    images: enabled ? images : [],
  };
};

const normalizeHeroCarousel = (value) => {
  const enabled = Boolean(value?.enabled);
  const signalCount = Number(value?.signalCount || 0);
  const signals = Array.isArray(value?.signals) ? dedupeTextValues(value.signals, 8) : [];
  const images = dedupeUrls(
    Array.isArray(value?.images)
      ? value.images.filter((item) => /^https?:\/\//i.test(String(item || "").trim()))
      : [],
    12
  );
  return { enabled, signalCount, signals, images };
};

const mergeHeroCarouselSignals = (values = []) => {
  const normalized = values.map((item) => normalizeHeroCarousel(item));
  const enabled = normalized.some((item) => item.enabled);
  const signalCount = Math.max(0, ...normalized.map((item) => Number(item.signalCount || 0)));
  const signals = dedupeTextValues(normalized.flatMap((item) => item.signals || []), 12);
  const images = dedupeUrls(normalized.flatMap((item) => item.images || []), 12);
  return { enabled, signalCount, signals, images };
};

const ANTI_CRAWL_BODY_PATTERNS = [
  /access denied/i,
  /attention required/i,
  /forbidden/i,
  /bot detection/i,
  /captcha/i,
  /verify you are human/i,
  /request blocked/i,
  /security check/i,
  /automated queries/i,
];

const hasAntiCrawlSignals = (value) => {
  const text = String(value || "");
  return ANTI_CRAWL_BODY_PATTERNS.some((pattern) => pattern.test(text));
};

const precheckAntiCrawl = async ({ url, timeoutMs = 25000, userAgent = DEFAULT_HTTP_USER_AGENT }) => {
  if (!url) {
    return { checked: false, blocked: false, reason: "empty_url", status: 0, url: "", finalUrl: "" };
  }
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "user-agent": userAgent,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    const status = Number(res.status || 0);
    const server = String(res.headers.get("server") || "");
    const referenceError = String(res.headers.get("x-reference-error") || "");
    const contentType = String(res.headers.get("content-type") || "").toLowerCase();
    const isHtmlLike =
      !contentType || contentType.includes("text/html") || contentType.includes("application/xhtml+xml");
    const body = isHtmlLike ? String(await res.text()).slice(0, 8000) : "";
    const blockedStatus = status === 401 || status === 403 || status === 429 || status === 451;
    const blockedByHeader =
      Boolean(referenceError) || /akamai|cloudflare|imperva|sucuri/i.test(server);
    const blockedByBody = hasAntiCrawlSignals(body);
    const blocked = blockedStatus || (blockedByHeader && blockedByBody);

    return {
      checked: true,
      blocked,
      status,
      url,
      finalUrl: String(res.url || url),
      reason: blocked
        ? blockedStatus
          ? `http_${status}`
          : blockedByBody
            ? "anti_crawl_page_detected"
            : "anti_crawl_header_detected"
        : "ok",
      server,
      referenceError,
      bodySignals: blockedByBody,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      checked: true,
      blocked: true,
      status: 0,
      url,
      finalUrl: "",
      reason: "network_error_or_blocked",
      error: message,
    };
  }
};

const fetchHtmlSummary = async (url) => {
  if (!url)
    return {
      title: "",
      h1: [],
      h2: [],
      links: [],
      images: [],
      footerLinks: [],
      navMenuDepth: 1,
      heroPresentation: normalizeHeroPresentation(null),
      heroCarousel: normalizeHeroCarousel(null),
    };
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": DEFAULT_HTTP_USER_AGENT },
    });
    clearTimeout(timeout);
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = stripHtml(titleMatch?.[1] || "");
    const h1 = extractFirstMatches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi, 4);
    const h2 = extractFirstMatches(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi, 8);
    const links = extractFirstMatches(html, /<a[^>]*>([\s\S]*?)<\/a>/gi, 10);
    const images = extractImageUrls(html, url);
    const rootOrigin = (() => {
      try {
        return new URL(url).origin;
      } catch {
        return "";
      }
    })();
    const footerLinks = rootOrigin ? extractFooterLinks(html, url, rootOrigin) : [];
    const navMenuDepth = detectHeaderMenuDepth(html);
    const heroPresentation = detectHeroPresentation(html);
    const heroCarousel = detectHeroCarousel(html, url);
    const themeColors = extractThemeColorsFromHtml(html);
    return {
      title,
      h1,
      h2,
      links,
      images,
      footerLinks,
      navMenuDepth,
      heroPresentation,
      heroCarousel,
      themeColors,
      htmlChars: html.length,
      status: res.status,
    };
  } catch (error) {
    return {
      title: "",
      h1: [],
      h2: [],
      links: [],
      images: [],
      footerLinks: [],
      navMenuDepth: 1,
      heroPresentation: normalizeHeroPresentation(null),
      heroCarousel: normalizeHeroCarousel(null),
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const dedupeTextValues = (items, limit = 24) => {
  const seen = new Set();
  const out = [];
  for (const item of items || []) {
    const next = String(item || "").replace(/\s+/g, " ").trim();
    if (!next || seen.has(next)) continue;
    seen.add(next);
    out.push(next);
    if (out.length >= limit) break;
  }
  return out;
};

const detectUrlLanguage = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "neutral";
  if (/[?&](?:lang|locale)=zh(?:-[a-z]{2})?\b/.test(raw)) return "zh";
  if (/[?&](?:lang|locale)=en(?:-[a-z]{2})?\b/.test(raw)) return "en";
  if (/\/(?:zh|zh-cn|zh-hans|zh-hant)(?:\/|$)/.test(raw)) return "zh";
  if (/\/(?:en|en-us|en-gb|global\/en)(?:\/|$)/.test(raw)) return "en";
  return "neutral";
};

const extractHrefValues = (html) => {
  const hrefs = [];
  let match;
  const hrefRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  while ((match = hrefRegex.exec(String(html || "")))) {
    const href = String(match[1] || "").trim();
    if (href) hrefs.push(href);
  }
  return hrefs;
};

const resolvePreferredSiteUrl = async ({ url, timeoutMs = 10000 }) => {
  if (!url) return { url: "", reason: "missing" };
  let entry;
  try {
    entry = new URL(url);
  } catch {
    return { url, reason: "invalid_url" };
  }

  const rootOrigin = entry.origin;
  const normalizedEntry = normalizeInternalPageUrl(entry.toString(), rootOrigin, rootOrigin) || entry.toString();

  const fetchHtml = async (targetUrl) => {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(targetUrl, {
        signal: ctrl.signal,
        redirect: "follow",
        headers: { 
          "user-agent": DEFAULT_HTTP_USER_AGENT,
          "accept": "text/html,application/xhtml+xml",
        },
      });
      clearTimeout(timeout);
      const html = await res.text();
      return html;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  };

  try {
    const html = await fetchHtml(normalizedEntry);
    const normalizedLinks = dedupeUrls(
      extractHrefValues(html)
        .map((href) => normalizeInternalPageUrl(href, rootOrigin, normalizedEntry))
        .filter(Boolean),
      300
    );

    const englishLinks = normalizedLinks.filter((item) => detectUrlLanguage(item) === "en");
    if (englishLinks.length) {
      const best = englishLinks.sort((a, b) => a.length - b.length)[0];
      return { url: best, reason: "english" };
    }

    const chineseLinks = normalizedLinks.filter((item) => detectUrlLanguage(item) === "zh");
    if (chineseLinks.length) {
      const best = chineseLinks.sort((a, b) => a.length - b.length)[0];
      return { url: best, reason: "chinese_fallback" };
    }
  } catch (err) {
    return { url: normalizedEntry, reason: "probe_failed", error: String(err) };
  }

  return { url: normalizedEntry, reason: "entry_default" };
};

const SKIPPED_CRAWL_EXT_RE =
  /\.(?:jpg|jpeg|png|gif|webp|svg|ico|css|js|mjs|map|pdf|zip|rar|7z|mp4|webm|mp3|wav|woff|woff2|ttf|otf|xml|rss|txt)$/i;

const normalizeInternalPageUrl = (value, rootOrigin, baseUrl = rootOrigin) => {
  try {
    const absolute = new URL(String(value || "").trim(), baseUrl);
    if (!/^https?:$/i.test(absolute.protocol)) return "";
    if (absolute.origin !== rootOrigin) return "";
    if (SKIPPED_CRAWL_EXT_RE.test(absolute.pathname || "")) return "";
    absolute.hash = "";
    absolute.search = "";
    if (absolute.pathname !== "/") {
      absolute.pathname = absolute.pathname.replace(/\/+$/g, "") || "/";
    }
    return absolute.toString();
  } catch {
    return "";
  }
};

const extractInternalPageLinks = (html, pageUrl, rootOrigin) => {
  const urls = [];
  let match;
  const hrefRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  while ((match = hrefRegex.exec(html))) {
    const normalized = normalizeInternalPageUrl(match[1] || "", rootOrigin, pageUrl);
    if (normalized) urls.push(normalized);
  }
  return dedupeUrls(urls, 200);
};

const fetchPageWithLinks = async ({ url, rootOrigin, timeoutMs = 15000 }) => {
  const result = {
    url,
    status: 0,
    title: "",
    h1: [],
    h2: [],
    links: [],
    images: [],
    footerLinks: [],
    navMenuDepth: 1,
    heroPresentation: normalizeHeroPresentation(null),
    heroCarousel: normalizeHeroCarousel(null),
    htmlChars: 0,
    internalLinks: [],
    error: "",
  };
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": DEFAULT_HTTP_USER_AGENT },
    });
    clearTimeout(timeout);
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    result.status = Number(res.status || 0);
    result.title = stripHtml(titleMatch?.[1] || "");
    result.h1 = extractFirstMatches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi, 6);
    result.h2 = extractFirstMatches(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi, 10);
    result.links = extractFirstMatches(html, /<a[^>]*>([\s\S]*?)<\/a>/gi, 24);
    result.images = extractImageUrls(html, url);
    result.footerLinks = extractFooterLinks(html, url, rootOrigin);
    result.navMenuDepth = detectHeaderMenuDepth(html);
    result.heroPresentation = detectHeroPresentation(html);
    result.heroCarousel = detectHeroCarousel(html, url);
    result.htmlChars = html.length;
    result.internalLinks = extractInternalPageLinks(html, url, rootOrigin);
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
};

const detectCrawlAntiCrawl = (page) => {
  const status = Number(page?.status || 0);
  if (status === 401 || status === 403 || status === 429 || status === 451) {
    return { blocked: true, reason: `http_${status}` };
  }
  const text = [page?.title, ...(page?.h1 || []), ...(page?.h2 || []), ...(page?.links || [])]
    .map((item) => String(item || ""))
    .join(" ");
  if (hasAntiCrawlSignals(text)) {
    return { blocked: true, reason: "anti_crawl_content_detected" };
  }
  const errorText = String(page?.error || "");
  if (/403|429|forbidden|captcha|access denied|blocked|cloudflare|akamai/i.test(errorText)) {
    return { blocked: true, reason: "anti_crawl_error_detected" };
  }
  return { blocked: false, reason: "ok" };
};

const crawlSitePages = async ({
  entryUrl,
  maxPages = 16,
  maxDepth = 1,
  timeoutMs = 15000,
}) => {
  if (!entryUrl) return null;
  let entry;
  try {
    entry = new URL(entryUrl);
  } catch {
    return {
      enabled: true,
      entryUrl,
      pages: [],
      errors: [{ url: entryUrl, error: "invalid_entry_url" }],
      stats: { discovered: 0, crawled: 0, failed: 1 },
    };
  }

  const rootOrigin = entry.origin;
  const startUrl = normalizeInternalPageUrl(entry.toString(), rootOrigin, rootOrigin) || entry.toString();
  const queue = [{ url: startUrl, depth: 0, from: "" }];
  const seen = new Set([startUrl]);
  const dedupeKinds = new Set(["products", "blog"]);
  const dedupeKindTaken = new Set();
  let dedupeSkipped = 0;

  const classifyDedupeKindFromPath = (pathValue) => {
    const path = normalizeTemplatePagePath(pathValue || "/").toLowerCase();
    if (
      /\/products?\//.test(path) ||
      /\/shop\//.test(path) ||
      /\/store\//.test(path) ||
      /\/collections?\//.test(path)
    ) {
      return "products";
    }
    if (
      /\/blog\//.test(path) ||
      /\/blogs\//.test(path) ||
      /\/article\//.test(path) ||
      /\/articles\//.test(path) ||
      /\/news\//.test(path) ||
      /\/journal\//.test(path) ||
      /\/insight\//.test(path) ||
      /\/technology\//.test(path)
    ) {
      return "blog";
    }
    return "generic";
  };

  const pages = [];
  const errors = [];
  let antiCrawl = null;

  while (queue.length && pages.length < maxPages) {
    const current = queue.shift();
    if (!current) break;
    const page = await fetchPageWithLinks({
      url: current.url,
      rootOrigin,
      timeoutMs,
    });
    pages.push({
      url: current.url,
      depth: current.depth,
      from: current.from,
      status: page.status,
      title: page.title,
      h1: page.h1,
      h2: page.h2,
      links: page.links,
      images: page.images,
      footerLinks: page.footerLinks,
      navMenuDepth: page.navMenuDepth,
      heroPresentation: normalizeHeroPresentation(page.heroPresentation),
      heroCarousel: page.heroCarousel,
      htmlChars: page.htmlChars,
      internalLinksCount: page.internalLinks.length,
      error: page.error || "",
    });
    const antiCrawlCheck = detectCrawlAntiCrawl(page);
    if (antiCrawlCheck.blocked) {
      antiCrawl = {
        url: current.url,
        status: Number(page.status || 0),
        reason: antiCrawlCheck.reason,
      };
      errors.push({ url: current.url, error: antiCrawlCheck.reason });
      break;
    }
    if (page.error) {
      errors.push({ url: current.url, error: page.error });
      continue;
    }
    if (current.depth >= maxDepth) continue;
    for (const nextUrl of page.internalLinks) {
      if (seen.has(nextUrl)) continue;
      const nextPath = routePathFromUrl(nextUrl);
      const nextKind = classifyDedupeKindFromPath(nextPath);
      if (dedupeKinds.has(nextKind) && dedupeKindTaken.has(nextKind)) {
        dedupeSkipped += 1;
        continue;
      }
      if (dedupeKinds.has(nextKind)) dedupeKindTaken.add(nextKind);
      seen.add(nextUrl);
      queue.push({ url: nextUrl, depth: current.depth + 1, from: current.url });
      if (seen.size >= maxPages * 12) break;
    }
  }

  return {
    enabled: true,
    entryUrl: startUrl,
    origin: rootOrigin,
    maxPages,
    maxDepth,
    discoveredUrls: Array.from(seen),
    stats: {
      discovered: seen.size,
      crawled: pages.length,
      failed: errors.length,
      dedupeSkipped,
    },
    pages,
    errors,
    blocked: Boolean(antiCrawl),
    antiCrawl,
  };
};

const mergeSummaryWithCrawl = (summary, crawl) => {
  if (!crawl?.pages?.length) return summary;
  const successful = crawl.pages.filter((page) => !page.error);
  if (!successful.length) return summary;
  const inferNavDepthFromUrls = () => {
    const urls = [
      ...(Array.isArray(crawl?.discoveredUrls) ? crawl.discoveredUrls : []),
      ...successful.map((page) => page?.url),
    ]
      .map((item) => String(item || "").trim())
      .filter(Boolean);
    const firstSegments = new Map();
    for (const rawUrl of urls) {
      let path = "/";
      try {
        const parsed = new URL(rawUrl);
        path = normalizeTemplatePagePath(parsed.pathname || "/");
      } catch {
        continue;
      }
      const segments = path.split("/").filter(Boolean);
      if (segments.length && /^[a-z]{2}(?:-[a-z]{2})?$/i.test(segments[0])) {
        segments.shift();
      }
      if (!segments.length) continue;
      const first = segments[0];
      const next = firstSegments.get(first) || new Set();
      if (segments[1]) next.add(segments[1]);
      firstSegments.set(first, next);
    }
    const topLevelCount = firstSegments.size;
    const hasSecondLevelBreadth = Array.from(firstSegments.values()).some((set) => set.size >= 2);
    return topLevelCount >= 3 && hasSecondLevelBreadth ? 2 : 1;
  };
  const homePage = successful[0] || null;
  const mergedHeroCarousel = mergeHeroCarouselSignals([
    summary?.heroCarousel,
    homePage?.heroCarousel,
    ...successful.map((page) => page?.heroCarousel),
  ]);
  const baseHeroPresentation = normalizeHeroPresentation(
    homePage?.heroPresentation || summary?.heroPresentation || null
  );
  const mergedHeroPresentation =
    baseHeroPresentation.mode === "split" &&
    !baseHeroPresentation.hasHeading &&
    (Boolean(mergedHeroCarousel?.enabled) || successful.some((page) => Array.isArray(page?.images) && page.images.length > 0))
      ? normalizeHeroPresentation({
          mode: "background_text",
          hasHeading: true,
          hasForegroundImage: true,
          hasBackgroundImage: true,
        })
      : baseHeroPresentation;
  const navMenuDepth = Math.max(
    Number(summary?.navMenuDepth || 1),
    inferNavDepthFromUrls(),
    ...successful.map((page) => Number(page?.navMenuDepth || 1))
  );
  const footerLinks = dedupeLinkItems(
    [
      ...(Array.isArray(summary?.footerLinks) ? summary.footerLinks : []),
      ...successful.flatMap((page) => (Array.isArray(page?.footerLinks) ? page.footerLinks : [])),
    ],
    24
  );
  return {
    ...summary,
    h1: dedupeTextValues([
      ...(Array.isArray(summary?.h1) ? summary.h1 : []),
      ...successful.flatMap((page) => page.h1 || []),
    ], 12),
    h2: dedupeTextValues([
      ...(Array.isArray(summary?.h2) ? summary.h2 : []),
      ...successful.flatMap((page) => page.h2 || []),
    ], 16),
    links: dedupeTextValues([
      ...(Array.isArray(summary?.links) ? summary.links : []),
      ...successful.flatMap((page) => page.links || []),
    ], 24),
    images: dedupeUrls(
      [
        ...(Array.isArray(summary?.images) ? summary.images : []),
        ...successful.flatMap((page) => page.images || []),
      ],
      80
    ),
    footerLinks,
    navMenuDepth,
    heroPresentation: mergedHeroPresentation,
    heroCarousel: mergedHeroCarousel,
    crawl: {
      crawledPages: successful.length,
      discoveredPages: Number(crawl?.stats?.discovered || 0),
      failedPages: Number(crawl?.stats?.failed || 0),
    },
  };
};

const routePathFromUrl = (value) => {
  try {
    const parsed = new URL(String(value || "").trim());
    const pathname = parsed.pathname || "/";
    const normalized = pathname.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  } catch {
    return "/";
  }
};

const routeSlugFromPath = (pathValue) => {
  const pathToken = normalizeTemplatePagePath(pathValue);
  if (pathToken === "/") return "home";
  const token = pathToken
    .replace(/^\//, "")
    .split("/")
    .filter(Boolean)
    .join("-");
  return slug(token) || "page";
};

const routeNameFromPath = (pathValue) => {
  const normalized = normalizeTemplatePagePath(pathValue);
  if (normalized === "/") return "Home";
  const leaf = normalized.split("/").filter(Boolean).pop() || "Page";
  return leaf
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
};

const buildPageAssetContext = ({ images = [], desktopUrl = "", mobileUrl = "" }) => {
  const sourceImages = dedupeUrls(
    (Array.isArray(images) ? images : []).filter((item) => /^https?:\/\//i.test(String(item || "").trim())),
    40
  );
  const pick = (index) => sourceImages[index] || sourceImages[0] || desktopUrl || mobileUrl || "";
  const desktopHero = pick(0);
  const mobileHero = pick(1) || desktopHero;
  const desktopBase = desktopUrl || desktopHero || "";
  const mobileBase = mobileUrl || mobileHero || desktopBase;

  return {
    desktopUrl: desktopBase,
    mobileUrl: mobileBase,
    sourceImages,
    slices: {
      desktop: {
        hero: desktopHero || desktopBase,
        story: pick(1) || desktopHero || desktopBase,
        approach: pick(2) || pick(1) || desktopBase,
        products: pick(3) || pick(2) || desktopBase,
        socialproof: pick(4) || pick(3) || desktopBase,
        cta: pick(5) || pick(4) || desktopBase,
        footer: pick(6) || pick(5) || desktopBase,
      },
      mobile: {
        hero: mobileHero || mobileBase,
        story: pick(2) || mobileHero || mobileBase,
        approach: pick(3) || pick(2) || mobileBase,
        products: pick(4) || pick(3) || mobileBase,
        socialproof: pick(5) || pick(4) || mobileBase,
        cta: pick(6) || pick(5) || mobileBase,
        footer: pick(7) || pick(6) || mobileBase,
      },
    },
  };
};

const getFileSize = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return Number(stats.size || 0);
  } catch {
    return 0;
  }
};

const isLikelyBlankScreenshot = async (filePath) => {
  // Empirical guard: blank PNGs captured by chromium are often ~4KB.
  const size = await getFileSize(filePath);
  return size > 0 && size <= 12000;
};

const choosePreferredScreenshot = async (candidates) => {
  let best = null;
  let bestScore = -1;
  for (const candidate of candidates) {
    if (!candidate) continue;
    const size = await getFileSize(candidate);
    if (!size) continue;
    const isBlankLike = size <= 12000;
    const score = (isBlankLike ? 0 : 1_000_000) + size;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
};

const captureWithBrowser = async ({ url, outPath, mobile, browser, waitMs = 3500, timeoutMs = 90000 }) => {
  const device = mobile ? ' --device "iPhone 13"' : "";
  const browserArg = browser ? ` --browser ${browser}` : "";
  const cmd = `cd ${JSON.stringify(
    ROOT
  )} && npx playwright screenshot --full-page${browserArg}${device} --wait-for-timeout ${Math.floor(
    waitMs
  )} ${JSON.stringify(url)} ${JSON.stringify(outPath)}`;
  await runShell(cmd, { cwd: ROOT, timeoutMs });
};

const captureWithPuppeteer = async ({ url, outPath, mobile, timeoutMs = 90000 }) => {
  const mod = await import("puppeteer");
  const puppeteer = mod?.default ?? mod;
  if (!puppeteer?.launch) {
    throw new Error("puppeteer_launch_unavailable");
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    if (mobile) {
      await page.setViewport({
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });
    } else {
      await page.setViewport({
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
      });
    }

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: Math.max(5000, Math.floor(timeoutMs * 0.5)) });
    await page.waitForTimeout(3000);

    // Trigger lazy sections by scrolling through the page once.
    await page.evaluate(async () => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      if (maxScroll <= 0) return;
      const step = Math.max(320, Math.floor(window.innerHeight * 0.75));
      let y = 0;
      let guard = 0;
      while (y < maxScroll && guard < 120) {
        y = Math.min(maxScroll, y + step);
        window.scrollTo({ top: y, behavior: "instant" });
        await sleep(140);
        guard += 1;
      }
      await sleep(1200);
      window.scrollTo({ top: 0, behavior: "instant" });
      await sleep(300);
    });

    await page.screenshot({ path: outPath, fullPage: true });
  } finally {
    await browser.close();
  }
};

const captureScreenshot = async ({ url, outPath, mobile = false, timeoutMs = 90000 }) => {
  if (!url) return null;
  await ensureDir(path.dirname(outPath));

  try {
    await captureWithPuppeteer({ url, outPath, mobile, timeoutMs });
  } catch {
    await captureWithBrowser({ url, outPath, mobile, browser: "chromium", waitMs: 3500, timeoutMs });
    if (await isLikelyBlankScreenshot(outPath)) {
      await captureWithBrowser({ url, outPath, mobile, browser: "webkit", waitMs: 5000, timeoutMs });
    }
  }

  return outPath;
};

const safeCopy = async (fromPath, toPath) => {
  if (!fromPath) return null;
  const absolute = path.isAbsolute(fromPath) ? fromPath : path.join(ROOT, fromPath);
  try {
    await ensureDir(path.dirname(toPath));
    await fs.copyFile(absolute, toPath);
    return toPath;
  } catch {
    return null;
  }
};

const publishReferenceAssets = async ({ siteId, desktopSource, mobileSource }) => {
  const normalizedId = slug(siteId || "site") || "site";
  const targetDir = path.join(PUBLIC_TEMPLATE_ASSETS_DIR, normalizedId);
  await ensureDir(targetDir);

  const copyToPublic = async (sourcePath, stem) => {
    if (!sourcePath) return null;
    const ext = path.extname(sourcePath) || ".png";
    const targetPath = path.join(targetDir, `${stem}${ext}`);
    await fs.copyFile(sourcePath, targetPath);
    return `/assets/template-factory/${normalizedId}/${stem}${ext}`;
  };

  try {
    const desktopUrl = await copyToPublic(desktopSource, "desktop-reference");
    const mobileUrl = await copyToPublic(mobileSource, "mobile-reference");
    return { desktopUrl, mobileUrl };
  } catch {
    return { desktopUrl: null, mobileUrl: null };
  }
};

const publishCrawledPageAssets = async ({ siteId, routeSlug, desktopSource, mobileSource }) => {
  const normalizedId = slug(siteId || "site") || "site";
  const normalizedRoute = slug(routeSlug || "page") || "page";
  const targetDir = path.join(PUBLIC_TEMPLATE_ASSETS_DIR, normalizedId, "pages", normalizedRoute);
  await ensureDir(targetDir);

  const copyToPublic = async (sourcePath, stem) => {
    if (!sourcePath) return null;
    const ext = path.extname(sourcePath) || ".png";
    const targetPath = path.join(targetDir, `${stem}${ext}`);
    await fs.copyFile(sourcePath, targetPath);
    return `/assets/template-factory/${normalizedId}/pages/${normalizedRoute}/${stem}${ext}`;
  };

  try {
    const desktopUrl = await copyToPublic(desktopSource, "desktop-reference");
    const mobileUrl = await copyToPublic(mobileSource, "mobile-reference");
    return { desktopUrl, mobileUrl };
  } catch {
    return { desktopUrl: null, mobileUrl: null };
  }
};

const captureScreenshotSafe = async ({ url, outPath, mobile, timeoutMs = 90000 }) => {
  try {
    return await captureScreenshot({ url, outPath, mobile, timeoutMs });
  } catch {
    return null;
  }
};

const buildCrawledPageAssetPack = async ({
  siteId,
  crawl,
  ingestDir,
  captureLimit = 12,
  screenshotTimeoutMs = 90000,
  screenshotSemaphore = null,
  logPrefix = "[template-factory]",
}) => {
  if (!crawl?.enabled) return null;

  const SKIP_ROUTE_PATTERNS = [
    /(^|\/)login(\/|$)/i,
    /(^|\/)auth(\/|$)/i,
    /(^|\/)signin(\/|$)/i,
    /(^|\/)signup(\/|$)/i,
    /(^|\/)account(\/|$)/i,
    /(^|\/)cart(\/|$)/i,
    /(^|\/)checkout(\/|$)/i,
    /(^|\/)orders?(\/|$)/i,
    /(^|\/)policies(\/|$)/i,
    /(^|\/)privacy(\/|$)/i,
    /(^|\/)terms(\/|$)/i,
    /(^|\/)legal(\/|$)/i,
    /(^|\/)cookie(?:s|-policy)?(\/|$)/i,
  ];

  const classifyRouteTemplateKind = (pathValue) => {
    const p = normalizeTemplatePagePath(pathValue || "/").toLowerCase();
    if (/(^|\/)products?(\/|$)|(^|\/)collections?(\/|$)|(^|\/)shop(\/|$)|(^|\/)store(\/|$)/.test(p)) return "products";
    if (/(^|\/)blogs?(\/|$)|(^|\/)articles?(\/|$)|(^|\/)news(\/|$)|(^|\/)journal(\/|$)|(^|\/)insights?(\/|$)|(^|\/)technology(\/|$)/.test(p)) return "blog";
    return "generic";
  };

  const pagesDir = path.join(ingestDir, "pages");
  await ensureDir(pagesDir);
  const filterStats = {
    totalCandidates: Array.isArray(crawl?.pages) ? crawl.pages.length : 0,
    excludedByErrorOrStatus: 0,
    excludedByRoutePolicy: 0,
    excludedByDownloadPolicy: 0,
    excludedByTemplateDedupe: 0,
  };

  const successfulPagesRaw = [];
  for (const page of Array.isArray(crawl?.pages) ? crawl.pages : []) {
    if (!page || page.error || !Number(page.status || 0) > 0 || Number(page.status || 0) >= 500) {
      filterStats.excludedByErrorOrStatus += 1;
      continue;
    }
    const routePath = routePathFromUrl(page.url);
    const routeFiltered = SKIP_ROUTE_PATTERNS.some((pattern) => pattern.test(routePath));
    if (routeFiltered) {
      filterStats.excludedByRoutePolicy += 1;
      continue;
    }
    if (isLikelyDownloadPath(routePath)) {
      filterStats.excludedByDownloadPolicy += 1;
      continue;
    }
    successfulPagesRaw.push(page);
  }

  const successfulPages = [];
  const keepOneKinds = new Set(["products", "blog"]);
  const seenKinds = new Set();
  for (const page of successfulPagesRaw) {
    const routePath = routePathFromUrl(page.url);
    const kind = classifyRouteTemplateKind(routePath);
    if (keepOneKinds.has(kind)) {
      if (seenKinds.has(kind)) {
        filterStats.excludedByTemplateDedupe += 1;
        continue;
      }
      seenKinds.add(kind);
    }
    successfulPages.push(page);
  }

  console.log(
    `${logPrefix} crawl asset filter stats: total=${filterStats.totalCandidates}, kept=${successfulPages.length}, excluded=status_or_error:${filterStats.excludedByErrorOrStatus}, route_policy:${filterStats.excludedByRoutePolicy}, download_policy:${filterStats.excludedByDownloadPolicy}, template_dedupe:${filterStats.excludedByTemplateDedupe}`
  );
  if (!successfulPages.length) {
    const emptyPack = {
      generatedAt: new Date().toISOString(),
      entryUrl: crawl?.entryUrl || "",
      pageCount: 0,
      pages: [],
    };
    const manifestPath = path.join(pagesDir, "pages.json");
    await fs.writeFile(manifestPath, JSON.stringify(emptyPack, null, 2));
    return { manifestPath, pages: [], byPath: new Map() };
  }

  const pages = [];
  const byPath = new Map();

  const limit = Math.max(0, Math.floor(Number(captureLimit) || 0));
  const total = successfulPages.length;

  for (const [index, page] of successfulPages.entries()) {
    const routePath = routePathFromUrl(page.url);
    if (byPath.has(routePath)) continue;
    const routeSlug = routeSlugFromPath(routePath) || `page-${index + 1}`;
    const pageDir = path.join(pagesDir, routeSlug);
    await ensureDir(pageDir);

    const desktopPath = path.join(pageDir, "desktop.auto.png");
    const mobilePath = path.join(pageDir, "mobile.auto.png");
    const shouldCapture = index < limit;
    console.log(
      `${logPrefix} page asset ${index + 1}/${total} route=${routePath} capture=${shouldCapture ? "yes" : "no"}`
    );
    const desktopShot = shouldCapture
      ? await runWithSemaphore(screenshotSemaphore, () =>
          captureScreenshotSafe({
            url: page.url,
            outPath: desktopPath,
            mobile: false,
            timeoutMs: screenshotTimeoutMs,
          })
        )
      : null;
    const mobileShot = shouldCapture
      ? await runWithSemaphore(screenshotSemaphore, () =>
          captureScreenshotSafe({
            url: page.url,
            outPath: mobilePath,
            mobile: true,
            timeoutMs: screenshotTimeoutMs,
          })
        )
      : null;
    const published = await publishCrawledPageAssets({
      siteId,
      routeSlug,
      desktopSource: desktopShot,
      mobileSource: mobileShot,
    });

    const summary = {
      title: String(page.title || "").trim(),
      h1: Array.isArray(page.h1) ? page.h1 : [],
      h2: Array.isArray(page.h2) ? page.h2 : [],
      links: Array.isArray(page.links) ? page.links : [],
      images: Array.isArray(page.images) ? page.images : [],
      footerLinks: dedupeLinkItems(Array.isArray(page.footerLinks) ? page.footerLinks : [], 24),
      navMenuDepth: Number(page.navMenuDepth || 1),
      heroPresentation: normalizeHeroPresentation(page.heroPresentation),
      heroCarousel: normalizeHeroCarousel(page.heroCarousel),
      htmlChars: Number(page.htmlChars || 0),
      internalLinksCount: Number(page.internalLinksCount || 0),
      status: Number(page.status || 0),
    };
    const assetContext = buildPageAssetContext({
      images: summary.images,
      desktopUrl: published.desktopUrl || "",
      mobileUrl: published.mobileUrl || "",
    });

    const pageRecord = {
      path: routePath,
      name: routeNameFromPath(routePath),
      url: String(page.url || "").trim(),
      depth: Number(page.depth || 0),
      status: Number(page.status || 0),
      from: String(page.from || "").trim(),
      summary,
      screenshots: {
        desktopPath: desktopShot || null,
        mobilePath: mobileShot || null,
      },
      publishedAssets: published,
      assetContext,
    };
    await fs.writeFile(path.join(pageDir, "summary.json"), JSON.stringify(pageRecord, null, 2));
    pages.push(pageRecord);
    byPath.set(routePath, pageRecord);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    entryUrl: crawl?.entryUrl || "",
    homePath: pages[0]?.path || "/",
    pageCount: pages.length,
    filterStats,
    pages,
  };
  const manifestPath = path.join(pagesDir, "pages.json");
  await fs.writeFile(manifestPath, JSON.stringify(payload, null, 2));
  return { manifestPath, pages, byPath, homePath: payload.homePath };
};

const getImageDimensions = async (filePath) => {
  if (!filePath) return null;
  try {
    const cmd = `/usr/bin/sips -g pixelWidth -g pixelHeight ${JSON.stringify(filePath)}`;
    const { stdout } = await runShell(cmd, { cwd: ROOT });
    const widthMatch = stdout.match(/pixelWidth:\s*(\d+)/);
    const heightMatch = stdout.match(/pixelHeight:\s*(\d+)/);
    const width = Number(widthMatch?.[1] || 0);
    const height = Number(heightMatch?.[1] || 0);
    if (!width || !height) return null;
    return { width, height };
  } catch {
    return null;
  }
};

const createImageSlice = async ({ sourcePath, targetPath, topRatio, heightRatio, leftRatio = 0, widthRatio = 1 }) => {
  const dims = await getImageDimensions(sourcePath);
  if (!dims) return null;
  const cropHeight = Math.max(64, Math.min(dims.height, Math.round(dims.height * heightRatio)));
  const cropWidth = Math.max(64, Math.min(dims.width, Math.round(dims.width * widthRatio)));
  const maxTop = Math.max(0, dims.height - cropHeight);
  const maxLeft = Math.max(0, dims.width - cropWidth);
  const topFromTop = Math.max(0, Math.min(maxTop, Math.round(dims.height * topRatio)));
  const leftFromLeft = Math.max(0, Math.min(maxLeft, Math.round(dims.width * leftRatio)));
  await ensureDir(path.dirname(targetPath));
  const cmd = `python3 - <<'PY'
from PIL import Image
src = ${JSON.stringify(sourcePath)}
dst = ${JSON.stringify(targetPath)}
top = int(${topFromTop})
left = int(${leftFromLeft})
crop_h = int(${cropHeight})
crop_w = int(${cropWidth})
img = Image.open(src)
w, h = img.size
top = max(0, min(h - 1, top))
left = max(0, min(w - 1, left))
bottom = max(top + 1, min(h, top + crop_h))
right = max(left + 1, min(w, left + crop_w))
img.crop((left, top, right, bottom)).save(dst)
PY`;
  await runShell(cmd, { cwd: ROOT });
  return targetPath;
};

const createReferenceSlices = async ({ siteId, desktopSource, mobileSource, preset }) => {
  const normalizedId = slug(siteId || "site") || "site";
  const targetDir = path.join(PUBLIC_TEMPLATE_ASSETS_DIR, normalizedId, "slices");
  await ensureDir(targetDir);

  const isDesignerPreset = preset === "designer_portfolio_minimal";
  const isNexusPreset = preset === "nexus_engineering_neon";
  const isBeautyPreset = preset === "beauty_salon_serene";
  const isPowerbeatPreset = preset === "powerbeat_fitness_neon";
  const desktopRatios = isDesignerPreset
    ? {
        hero: { top: 0.0, height: 0.16 },
        story: { top: 0.16, height: 0.2 },
        approach: { top: 0.34, height: 0.2 },
        products: { top: 0.52, height: 0.2 },
        socialproof: { top: 0.73, height: 0.11 },
        cta: { top: 0.84, height: 0.08 },
        footer: { top: 0.91, height: 0.09 },
      }
    : isNexusPreset
      ? {
          hero: { top: 0.0, height: 0.2 },
          story: { top: 0.2, height: 0.14 },
          approach: { top: 0.34, height: 0.23 },
          products: { top: 0.57, height: 0.16 },
          socialproof: { top: 0.73, height: 0.12 },
          cta: { top: 0.85, height: 0.06 },
          footer: { top: 0.9, height: 0.1 },
        }
    : isBeautyPreset
      ? {
          hero: { top: 0.0, height: 0.2, left: 0.52, width: 0.46 },
          story: { top: 0.2, height: 0.22 },
          approach: { top: 0.42, height: 0.15 },
          products: { top: 0.57, height: 0.12 },
          socialproof: { top: 0.69, height: 0.14 },
          cta: { top: 0.83, height: 0.08 },
          footer: { top: 0.91, height: 0.09 },
        }
    : isPowerbeatPreset
      ? {
          hero: { top: 0.0, height: 0.24 },
          story: { top: 0.24, height: 0.08 },
          approach: { top: 0.32, height: 0.16 },
          products: { top: 0.48, height: 0.2 },
          socialproof: { top: 0.68, height: 0.14 },
          cta: { top: 0.82, height: 0.08 },
          footer: { top: 0.9, height: 0.1 },
        }
    : {
        hero: { top: 0.0, height: 0.26 },
        story: { top: 0.18, height: 0.22 },
        approach: { top: 0.37, height: 0.18 },
        products: { top: 0.54, height: 0.18 },
        socialproof: { top: 0.72, height: 0.12 },
        cta: { top: 0.82, height: 0.1 },
        footer: { top: 0.9, height: 0.1 },
      };
  const mobileRatios = isDesignerPreset
    ? {
        hero: { top: 0.0, height: 0.18 },
        story: { top: 0.18, height: 0.2 },
        approach: { top: 0.37, height: 0.2 },
        products: { top: 0.56, height: 0.2 },
        socialproof: { top: 0.75, height: 0.1 },
        cta: { top: 0.84, height: 0.08 },
        footer: { top: 0.91, height: 0.09 },
      }
    : isNexusPreset
      ? {
          hero: { top: 0.0, height: 0.24 },
          story: { top: 0.24, height: 0.14 },
          approach: { top: 0.38, height: 0.2 },
          products: { top: 0.58, height: 0.16 },
          socialproof: { top: 0.74, height: 0.12 },
          cta: { top: 0.86, height: 0.05 },
          footer: { top: 0.91, height: 0.09 },
        }
    : isBeautyPreset
      ? {
          hero: { top: 0.0, height: 0.22 },
          story: { top: 0.22, height: 0.24 },
          approach: { top: 0.46, height: 0.14 },
          products: { top: 0.6, height: 0.11 },
          socialproof: { top: 0.71, height: 0.14 },
          cta: { top: 0.85, height: 0.07 },
          footer: { top: 0.92, height: 0.08 },
        }
    : isPowerbeatPreset
      ? {
          hero: { top: 0.0, height: 0.25 },
          story: { top: 0.25, height: 0.08 },
          approach: { top: 0.33, height: 0.18 },
          products: { top: 0.51, height: 0.18 },
          socialproof: { top: 0.69, height: 0.14 },
          cta: { top: 0.83, height: 0.08 },
          footer: { top: 0.91, height: 0.09 },
        }
    : {
        hero: { top: 0.0, height: 0.28 },
        story: { top: 0.2, height: 0.22 },
        approach: { top: 0.42, height: 0.16 },
        products: { top: 0.57, height: 0.18 },
        socialproof: { top: 0.74, height: 0.11 },
        cta: { top: 0.84, height: 0.08 },
        footer: { top: 0.91, height: 0.09 },
      };

  const desktop = {};
  const mobile = {};

  if (desktopSource) {
    for (const [key, ratio] of Object.entries(desktopRatios)) {
      const outPath = path.join(targetDir, `desktop-${key}.png`);
      const result = await createImageSlice({
        sourcePath: desktopSource,
        targetPath: outPath,
        topRatio: ratio.top,
        heightRatio: ratio.height,
        leftRatio: ratio.left ?? 0,
        widthRatio: ratio.width ?? 1,
      });
      if (result) desktop[key] = `/assets/template-factory/${normalizedId}/slices/desktop-${key}.png`;
    }
  }

  if (mobileSource) {
    for (const [key, ratio] of Object.entries(mobileRatios)) {
      const outPath = path.join(targetDir, `mobile-${key}.png`);
      const result = await createImageSlice({
        sourcePath: mobileSource,
        targetPath: outPath,
        topRatio: ratio.top,
        heightRatio: ratio.height,
        leftRatio: ratio.left ?? 0,
        widthRatio: ratio.width ?? 1,
      });
      if (result) mobile[key] = `/assets/template-factory/${normalizedId}/slices/mobile-${key}.png`;
    }
  }

  return { desktop, mobile };
};

const textTokens = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item && item.length > 2);

const chooseRecipe = ({ prompt, title, url, siteId = "" }) => {
  const joined = `${prompt} ${title} ${url} ${siteId}`.toLowerCase();
  const has = (pattern) => pattern.test(joined);
  const siteFingerprint = `${siteId} ${url}`.toLowerCase();
  const host = hostFromUrl(url);

  // Strong explicit routing by source identity first.
  if (!DISABLE_SITE_FINGERPRINT_ROUTING) {
    if (/designer-portfolio-81|nava-moon|nava moon/.test(siteFingerprint)) {
      return RECIPES.designer_portfolio_minimal;
    }
    if (/nexus-engineering|nexusengineering|nexus/.test(siteFingerprint)) {
      return RECIPES.nexus_engineering_neon;
    }
    if (/social-automation|socialautomation|luma/.test(siteFingerprint)) {
      return RECIPES.social_automation_neon;
    }
    if (/beauty-salon-29|beautysalon29|beauty-salon|beauty salon bangkok/.test(siteFingerprint)) {
      return RECIPES.beauty_salon_serene;
    }
    if (/use-this-image-90|usethisimage90|powerbeat/.test(siteFingerprint)) {
      return RECIPES.powerbeat_fitness_neon;
    }
    if (/siemens|siemens-home|xcelerator|simatic|gridscale/.test(siteFingerprint) || /(^|\.)siemens\.com$/i.test(host)) {
      return RECIPES.enterprise_blue_cyan;
    }
  }

  if (has(/designer-portfolio-81|designer portfolio 81|nava moon|future of design content/i)) {
    return RECIPES.designer_portfolio_minimal;
  }
  if (has(/nexus|release orchestration|orchestrating product releases|ship faster/)) return RECIPES.nexus_engineering_neon;
  if (has(/siemens|xcelerator|simatic|gridscale|digital twin|industrial ai/)) return RECIPES.enterprise_blue_cyan;
  if (has(/industrial|manufactur|factory|equipment|b2b|automation|engineering/)) return RECIPES.industrial_precision;
  if (
    has(/social-automation|social automation|viral|growth velocity|reach automation|creator ai|luma/i) ||
    (has(/social|creator|campaign|viral|growth/) && has(/neon|orange glow|autopilot|automation/))
  ) {
    return RECIPES.social_automation_neon;
  }
  if (has(/sixtine|gallery|editorial|luxury|spatial|interior/)) return RECIPES.editorial_luxury;
  if (has(/beauty salon|beauty-salon|wellness salon|spa salon|salon bangkok|free consultation|nail services/)) {
    return RECIPES.beauty_salon_serene;
  }
  if (has(/forged for intensity|built for growth|engineered for human potential|community feedback|ready to level up|powerbeat|fitness/)) {
    return RECIPES.powerbeat_fitness_neon;
  }
  if (has(/wellness|clinic|hospitality|travel|hotel|retreat/)) return RECIPES.calm_service;
  if (has(/saas|ai|developer|fintech|platform|cloud|tooling|software/)) return RECIPES.modern_saas;
  return RECIPES.modern_saas;
};

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const HERO_CAROUSEL_CAPABLE_BLOCKS = new Set(["NexusHeroDock", "HeroSplit", "NeonHeroBeam"]);

/**
 * Extract brand/theme colors from HTML inline styles, CSS custom properties,
 * and meta theme-color tags. Returns an array of hex color strings.
 */
const extractThemeColorsFromHtml = (html) => {
  if (!html) return [];
  const colors = [];
  // 1. meta theme-color
  const metaMatch = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i);
  if (metaMatch?.[1]) colors.push(metaMatch[1].trim());
  // 2. CSS custom properties (--primary, --brand, --accent, --color-primary, etc.)
  const cssVarRegex = /--(?:primary|brand|accent|color-primary|theme-color|main-color|brand-color)\s*:\s*([^;}\n]+)/gi;
  let match;
  while ((match = cssVarRegex.exec(html)) && colors.length < 12) {
    const val = match[1].trim();
    if (/^#[0-9a-f]{3,8}$/i.test(val) || /^rgb/i.test(val)) colors.push(val);
  }
  // 3. Prominent background-color in header/nav/hero areas
  const headerChunk = html.slice(0, 80000);
  const bgColorRegex = /(?:header|nav|hero|banner)[^}]{0,2000}?background(?:-color)?\s*:\s*(#[0-9a-f]{3,8})/gi;
  while ((match = bgColorRegex.exec(headerChunk)) && colors.length < 16) {
    colors.push(match[1].trim());
  }
  // 4. Inline style brand colors on prominent elements
  const inlineRegex = /style=["'][^"']*(?:background|color)\s*:\s*(#[0-9a-f]{3,8})/gi;
  while ((match = inlineRegex.exec(headerChunk)) && colors.length < 20) {
    const hex = match[1].trim().toLowerCase();
    // Skip near-black, near-white, and gray colors
    if (/^#(?:0{3,6}|f{3,6}|(?:(?:[0-9a-f])\1{2,5}))$/i.test(hex)) continue;
    colors.push(hex);
  }
  return [...new Set(colors.map(c => c.toLowerCase()))];
};

const inferPaletteProfileFromVisualSignature = (visualSignature, htmlColors = []) => {
  const isDark = Boolean(visualSignature?.isDark);
  const colors = Array.isArray(visualSignature?.dominantColors)
    ? visualSignature.dominantColors.map((item) => String(item || "").toLowerCase())
    : [];
  const allColors = [...colors, ...htmlColors.map(c => String(c || "").toLowerCase())];
  const joined = allColors.join(" ");
  const blueCyan =
    /#0|#1|#2|#3/.test(joined) &&
    allColors.some((hex) => /^#?[0-9a-f]{6}$/i.test(hex || ""));
  // Detect teal/cyan brand color (like Siemens #009999)
  const hasTeal = allColors.some((hex) => {
    const m = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!m) return false;
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    return g > 100 && b > 100 && r < 80 && Math.abs(g - b) < 60;
  });
  // Pick the first non-gray, non-black, non-white color as accent
  const extractedAccent = allColors.find((hex) => {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return false;
    const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!m) return false;
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    // Skip near-gray (low saturation) and near-black/white
    if (max - min < 30) return false;
    if (max < 30 || min > 225) return false;
    return true;
  });

  if (isDark && (blueCyan || hasTeal)) {
    return {
      paletteProfile: "deep-blue-cyan",
      navGradient: "linear-gradient(180deg,#03122e 0%,#071b45 100%)",
      bodyGradient: "linear-gradient(180deg,#04152f 0%,#08234c 100%)",
      footerGradient: "linear-gradient(180deg,#03122e 0%,#020a1d 100%)",
      overlayStrong: "rgba(3, 16, 40, 0.58)",
      overlaySoft: "rgba(2,10,24,0.24)",
      accent: extractedAccent || (hasTeal ? "#009999" : "#00c6d8"),
      accentText: "#031628",
    };
  }
  if (isDark) {
    return {
      paletteProfile: "dark-neutral",
      navGradient: "linear-gradient(180deg,#0b1220 0%,#111827 100%)",
      bodyGradient: "linear-gradient(180deg,#0f172a 0%,#111827 100%)",
      footerGradient: "linear-gradient(180deg,#0a1020 0%,#060a16 100%)",
      overlayStrong: "rgba(9, 16, 30, 0.56)",
      overlaySoft: "rgba(8,10,16,0.2)",
      accent: extractedAccent || "#38bdf8",
      accentText: "#08111e",
    };
  }
  return {
    paletteProfile: "cool-neutral",
    navGradient: "linear-gradient(180deg,#e8f1ff 0%,#d7ebff 100%)",
    bodyGradient: "linear-gradient(180deg,#f7fbff 0%,#edf6ff 100%)",
    footerGradient: "linear-gradient(180deg,#e7f2ff 0%,#dcecff 100%)",
    overlayStrong: "rgba(230, 240, 255, 0.32)",
    overlaySoft: "rgba(235,240,248,0.18)",
    accent: extractedAccent || "#0ea5e9",
    accentText: "#031628",
  };
};

const evaluateRecipeFit = ({ recipe, summary = {}, visualSignature = null, site }) => {
  const mismatches = [];
  let score = 0;
  const navDepth = Number(summary?.navMenuDepth || 1);
  const heroPresentation = normalizeHeroPresentation(summary?.heroPresentation);
  const hasHeroCarousel =
    Boolean(summary?.heroCarousel?.enabled) &&
    Array.isArray(summary?.heroCarousel?.images) &&
    summary.heroCarousel.images.length >= 2;
  const navBlock = String(recipe?.sectionSpecs?.navigation?.blockType || "");
  const navVariant = String(recipe?.sectionSpecs?.navigation?.defaults?.variant || "");
  const heroBlock = String(recipe?.sectionSpecs?.hero?.blockType || "");
  const heroBackground = String(recipe?.sectionSpecs?.hero?.defaults?.background || "");
  const footerBlock = String(recipe?.sectionSpecs?.footer?.blockType || "");
  const footerLinksCount = Array.isArray(summary?.footerLinks) ? summary.footerLinks.length : 0;
  const host = hostFromUrl(site?.url || "");
  const wantsBlueCyan = /(^|\.)siemens\.com$/i.test(host) || recipe?.id === "enterprise_blue_cyan";
  const paletteToken = `${recipe?.paletteProfile || ""} ${(recipe?.styleLabels || []).join(" ")}`.toLowerCase();

  if (navDepth >= 2) {
    if (navBlock === "Navbar" && navVariant === "withDropdown") score += 2;
    else mismatches.push("navigation_depth");
  } else {
    score += 1;
  }

  if (heroPresentation.mode === "background_text") {
    if (heroBlock === "HeroSplit" && (heroBackground === "image" || !heroBackground)) score += 2;
    else mismatches.push("hero_background_text");
  } else {
    score += 1;
  }

  if (hasHeroCarousel) {
    if (HERO_CAROUSEL_CAPABLE_BLOCKS.has(heroBlock)) score += 2;
    else mismatches.push("hero_carousel");
  } else {
    score += 1;
  }

  if (footerLinksCount >= 6) {
    if (footerBlock === "Footer") score += 1;
    else mismatches.push("footer_structure");
  } else {
    score += 1;
  }

  if (wantsBlueCyan) {
    if (/blue|cyan|navy|enterprise/.test(paletteToken)) score += 2;
    else mismatches.push("palette_blue_cyan");
  } else if (visualSignature) {
    score += 1;
  }

  const needsDynamic = mismatches.length >= 2 || score < 6;
  return { score, mismatches, needsDynamic };
};

const synthesizeDynamicRecipe = ({ site, baseRecipe, summary = {}, visualSignature = null, fit = null }) => {
  const next = cloneJson(baseRecipe || RECIPES.modern_saas);
  const host = hostFromUrl(site?.url || "");
  const suffix = slug(host || site?.id || "site") || "site";
  const htmlColors = Array.isArray(summary?.themeColors) ? summary.themeColors : [];
  const palette = inferPaletteProfileFromVisualSignature(visualSignature, htmlColors);
  const navDepth = Number(summary?.navMenuDepth || 1);
  const heroPresentation = normalizeHeroPresentation(summary?.heroPresentation);
  const hasHeroCarousel =
    Boolean(summary?.heroCarousel?.enabled) &&
    Array.isArray(summary?.heroCarousel?.images) &&
    summary.heroCarousel.images.length >= 2;
  const footerLinksCount = Array.isArray(summary?.footerLinks) ? summary.footerLinks.length : 0;

  next.id = `dynamic_${baseRecipe?.id || "recipe"}_${suffix}`;
  next.styleLabels = unique([
    ...(Array.isArray(baseRecipe?.styleLabels) ? baseRecipe.styleLabels : []),
    "dynamic-synthesized",
    palette.paletteProfile,
  ]);
  next.paletteProfile = palette.paletteProfile;
  next.layoutPatterns = unique([
    ...(Array.isArray(baseRecipe?.layoutPatterns) ? baseRecipe.layoutPatterns : []),
    navDepth >= 2 ? "mega-nav" : "",
    hasHeroCarousel ? "hero-carousel" : "",
    heroPresentation.mode === "background_text" ? "hero-background-text" : "",
  ]);

  next.sectionSpecs = next.sectionSpecs && typeof next.sectionSpecs === "object" ? next.sectionSpecs : {};

  const navSpec = next.sectionSpecs.navigation || { blockType: "Navbar", defaults: {} };
  if (navDepth >= 2) navSpec.blockType = "Navbar";
  navSpec.defaults = {
    ...(navSpec.defaults || {}),
    sticky: true,
    maxWidth: navSpec.defaults?.maxWidth || "2xl",
    variant: navDepth >= 2 ? "withDropdown" : navSpec.defaults?.variant || "withCTA",
    background: "gradient",
    backgroundGradient: navSpec.defaults?.backgroundGradient || palette.navGradient,
    backgroundOverlay: navSpec.defaults?.backgroundOverlay || palette.overlaySoft,
  };
  next.sectionSpecs.navigation = navSpec;

  const heroSpec = next.sectionSpecs.hero || { blockType: "HeroSplit", defaults: {} };
  if ((heroPresentation.mode === "background_text" || hasHeroCarousel) && !HERO_CAROUSEL_CAPABLE_BLOCKS.has(heroSpec.blockType)) {
    heroSpec.blockType = "HeroSplit";
  }
  heroSpec.defaults = {
    ...(heroSpec.defaults || {}),
    maxWidth: heroSpec.defaults?.maxWidth || "2xl",
    paddingY: heroSpec.defaults?.paddingY || "lg",
  };
  if (heroPresentation.mode === "background_text" || hasHeroCarousel) {
    heroSpec.blockType = "HeroSplit";
    heroSpec.defaults.background = "image";
    heroSpec.defaults.backgroundOverlay = heroSpec.defaults?.backgroundOverlay || palette.overlayStrong;
  }
  next.sectionSpecs.hero = heroSpec;

  const footerSpec = next.sectionSpecs.footer || { blockType: "Footer", defaults: {} };
  footerSpec.blockType = "Footer";
  footerSpec.defaults = {
    ...(footerSpec.defaults || {}),
    variant: "multiColumn",
    maxWidth: footerSpec.defaults?.maxWidth || "2xl",
    background: "gradient",
    backgroundGradient: footerSpec.defaults?.backgroundGradient || palette.footerGradient,
  };
  if (footerLinksCount >= 6) {
    footerSpec.defaults.columns = undefined;
  }
  next.sectionSpecs.footer = footerSpec;

  const ctaSpec = next.sectionSpecs.cta;
  if (ctaSpec?.defaults && typeof ctaSpec.defaults === "object") {
    ctaSpec.defaults.ctaBackgroundColor = ctaSpec.defaults.ctaBackgroundColor || palette.accent;
    ctaSpec.defaults.ctaTextColor = ctaSpec.defaults.ctaTextColor || palette.accentText;
    ctaSpec.defaults.ctaClassName =
      ctaSpec.defaults.ctaClassName || `!bg-[${palette.accent}] !text-[${palette.accentText}]`;
  }

  next._dynamic = {
    synthesizedAt: new Date().toISOString(),
    baseRecipeId: baseRecipe?.id || "",
    fitScore: Number(fit?.score || 0),
    mismatches: Array.isArray(fit?.mismatches) ? fit.mismatches : [],
  };
  return next;
};

const resolveRecipeForSite = ({ site, summary, visualSignature }) => {
  const baseRecipe = chooseRecipe({
    prompt: site?.prompt,
    title: summary?.title,
    url: site?.url,
    siteId: site?.id,
  });
  const fit = evaluateRecipeFit({ recipe: baseRecipe, summary, visualSignature, site });
  if (!fit.needsDynamic) {
    return { recipe: baseRecipe, fit, synthesized: false, baseRecipeId: baseRecipe.id };
  }
  const dynamicRecipe = synthesizeDynamicRecipe({
    site,
    baseRecipe,
    summary,
    visualSignature,
    fit,
  });
  return { recipe: dynamicRecipe, fit, synthesized: true, baseRecipeId: baseRecipe.id };
};

const identityTokens = (value) => {
  const raw = String(value || "").toLowerCase().trim();
  if (!raw) return [];
  const parts = raw
    .replace(/https?:\/\//g, " ")
    .replace(/[^a-z0-9.-]+/g, " ")
    .split(/[\s.-]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
  const joined = parts.join("");
  return unique([joined, ...parts].filter((item) => item && item.length > 2));
};

const buildKeywords = ({ site, recipe, summary }) => {
  const host = (() => {
    try {
      return new URL(site.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const rawTokens = textTokens(
    [site.prompt, site.description, summary.title, ...summary.h1, ...summary.h2, host, site.id, ...recipe.styleLabels].join(
      " "
    )
  );

  const filtered = rawTokens.filter((token) => !STOPWORDS.has(token));
  const identity = unique([...identityTokens(site.id), ...identityTokens(host)]);
  return unique([...identity, ...filtered]).slice(0, 24);
};

const buildIndexCard = ({ site, recipe, summary, evidence }) => {
  const keywords = buildKeywords({ site, recipe, summary });
  const useCases = unique([
    site.description || "",
    ...recipe.styleLabels,
    recipe.id.includes("industrial") ? "b2b-website" : "brand-website",
  ]).filter(Boolean);

  return {
    template_id: `auto_${site.id}`,
    source: {
      url: site.url || "",
      site_id: site.id,
      title: summary.title || site.id,
    },
    style_labels: recipe.styleLabels,
    palette_profile: recipe.paletteProfile,
    typography_signature: recipe.typographySignature,
    layout_patterns: recipe.layoutPatterns,
    component_signature: recipe.componentSignature,
    suitable_use_cases: useCases,
    confidence_overall: 0.72,
    evidence_type: unique([
      site.url ? "url" : "",
      evidence?.desktop ? "screenshot_desktop" : "",
      evidence?.mobile ? "screenshot_mobile" : "",
      summary.title ? "html_snapshot" : "",
    ]).filter(Boolean),
    keywords,
  };
};

const splitTitleCandidates = (value) =>
  String(value || "")
    .split(/\s*[|•·]\s*|\s[-–—]\s/g)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);

const firstNonEmpty = (values, fallback = "") => {
  for (const value of Array.isArray(values) ? values : []) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (text) return text;
  }
  return fallback;
};

const summaryHeadline = (summary, fallback = "") =>
  firstNonEmpty([
    ...(Array.isArray(summary?.h1) ? summary.h1 : []),
    ...splitTitleCandidates(summary?.title || ""),
  ], fallback);

const summarySubhead = (summary, fallback = "") =>
  firstNonEmpty([
    ...(Array.isArray(summary?.h2) ? summary.h2 : []),
    ...splitTitleCandidates(summary?.title || "").slice(1),
    ...(Array.isArray(summary?.links) ? summary.links : []),
  ], fallback);

/**
 * Return a section-specific headline by picking from different h2 entries
 * instead of always returning h1[0] for every section.
 * sectionIndex: 0=hero, 1=story, 2=approach, 3=products, 4=socialproof, etc.
 */
const sectionSpecificHeadline = (summary, sectionIndex = 0, fallback = "") => {
  const h1 = Array.isArray(summary?.h1) ? summary.h1 : [];
  const h2 = Array.isArray(summary?.h2) ? summary.h2 : [];
  const titleParts = splitTitleCandidates(summary?.title || "");
  // Hero (index 0) gets h1[0]; other sections pick from h2 pool
  if (sectionIndex === 0) {
    return firstNonEmpty([...h1, ...titleParts], fallback);
  }
  // For non-hero sections, pick a distinct h2 entry offset by sectionIndex
  const pool = [...h2, ...titleParts.slice(1), ...h1];
  const offset = Math.max(0, sectionIndex - 1);
  if (pool.length > offset) {
    return pool[offset] || fallback;
  }
  return pool[0] || fallback;
};

const sectionSpecificSubhead = (summary, sectionIndex = 0, fallback = "") => {
  const h2 = Array.isArray(summary?.h2) ? summary.h2 : [];
  const links = Array.isArray(summary?.links) ? summary.links : [];
  const titleParts = splitTitleCandidates(summary?.title || "").slice(1);
  const pool = [...h2, ...titleParts, ...links];
  // Pick a different subhead for each section
  const offset = Math.min(sectionIndex, pool.length - 1);
  if (pool.length > offset && offset >= 0) {
    return pool[offset] || fallback;
  }
  return pool[0] || fallback;
};

const summaryItems = (summary, maxItems = 3) => {
  const seeds = dedupeTextValues(
    [
      ...(Array.isArray(summary?.h2) ? summary.h2 : []),
      ...(Array.isArray(summary?.links) ? summary.links : []),
      ...(Array.isArray(summary?.h1) ? summary.h1 : []),
    ],
    18
  ).filter((text) => text.length >= 8 && text.length <= 140);
  return seeds.slice(0, maxItems).map((seed, index) => {
    const parts = seed.split(/[:.]/).map((part) => part.trim()).filter(Boolean);
    const title = (parts[0] || seed).slice(0, 56);
    const desc = (parts.slice(1).join(". ") || seed).slice(0, 128);
    return {
      title: title || `Item ${index + 1}`,
      description: desc || "Explore more details.",
      desc: desc || "Explore more details.",
      cta: { label: "Learn More", href: "#" },
    };
  });
};

const decodeHtmlEntities = (value) =>
  String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const normalizeTextLine = (value) => decodeHtmlEntities(String(value || "").replace(/\s+/g, " ").trim());

const isWeakHeroTitleCandidate = (value) => {
  const text = normalizeTextLine(value);
  if (!text) return true;
  if (/\bhome\b/i.test(text)) return true;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 2 && !/[\d-]/.test(text)) return true;
  const token = slug(text);
  if (!token || token.length < 5) return true;
  return false;
};

const heroTitleCandidatesFromPageSpec = (pageSpec) => {
  const summary = pageSpec?.summary && typeof pageSpec.summary === "object" ? pageSpec.summary : {};
  const pathName = String(pageSpec?.name || "").trim();
  const title = String(summary?.title || "").trim();
  const h1 = Array.isArray(summary?.h1) ? summary.h1 : [];
  const h2 = Array.isArray(summary?.h2) ? summary.h2 : [];
  const titleParts = splitTitleCandidates(title);
  return dedupeTextValues(
    [
      ...h1,
      ...titleParts,
      pathName,
      ...h2,
    ]
      .map((entry) => normalizeTextLine(entry))
      .filter((entry) => entry.length >= 6),
    16
  ).filter((entry) => !isWeakHeroTitleCandidate(entry));
};

const heroSubtitleCandidatesFromPageSpec = (pageSpec, heroTitle = "") => {
  const summary = pageSpec?.summary && typeof pageSpec.summary === "object" ? pageSpec.summary : {};
  const title = String(summary?.title || "").trim();
  const h1 = Array.isArray(summary?.h1) ? summary.h1 : [];
  const h2 = Array.isArray(summary?.h2) ? summary.h2 : [];
  const titleParts = splitTitleCandidates(title).slice(1);
  const heroToken = slug(normalizeTextLine(heroTitle));
  return dedupeTextValues(
    [
      ...h2,
      ...titleParts,
      ...h1,
    ]
      .map((entry) => normalizeTextLine(entry))
      .filter((entry) => entry.length >= 8)
      .filter((entry) => slug(entry) !== heroToken),
    16
  );
};

const enforceDistinctHeroes = (pageSpecs = []) => {
  const usedHeroTokens = new Set();
  const nextSpecs = [];

  for (const pageSpec of Array.isArray(pageSpecs) ? pageSpecs : []) {
    if (!pageSpec || typeof pageSpec !== "object") {
      nextSpecs.push(pageSpec);
      continue;
    }
    const nextPage = JSON.parse(JSON.stringify(pageSpec));
    const heroDefaults = nextPage?.section_specs?.hero?.defaults;
    if (!heroDefaults || typeof heroDefaults !== "object") {
      nextSpecs.push(nextPage);
      continue;
    }

    const existingTitle = normalizeTextLine(heroDefaults.title || "");
    const existingTitleToken = slug(existingTitle);
    const needsTitleRefresh = !existingTitleToken || usedHeroTokens.has(existingTitleToken);

    if (needsTitleRefresh) {
      const titleCandidates = heroTitleCandidatesFromPageSpec(nextPage);
      const pickedTitle =
        titleCandidates.find((candidate) => {
          const token = slug(candidate);
          return token && !usedHeroTokens.has(token);
        }) ||
        titleCandidates[0] ||
        existingTitle ||
        normalizeTextLine(nextPage?.name || "Overview");
      heroDefaults.title = pickedTitle.slice(0, 110);
    }

    const finalTitle = normalizeTextLine(heroDefaults.title || existingTitle || "");
    const finalTitleToken = slug(finalTitle);
    if (finalTitleToken) usedHeroTokens.add(finalTitleToken);

    const existingSubtitle = normalizeTextLine(heroDefaults.subtitle || "");
    const subtitleCandidates = heroSubtitleCandidatesFromPageSpec(nextPage, finalTitle);
    if (!existingSubtitle || slug(existingSubtitle) === finalTitleToken) {
      const pickedSubtitle = subtitleCandidates[0] || existingSubtitle;
      if (pickedSubtitle) heroDefaults.subtitle = pickedSubtitle.slice(0, 170);
    }

    nextSpecs.push(nextPage);
  }

  return nextSpecs;
};

const pageDepth = (pathValue) => normalizeTemplatePagePath(pathValue).split("/").filter(Boolean).length;

const isLocaleRootPath = (pathValue) => /^\/[a-z]{2}(?:-[a-z]{2})?$/i.test(normalizeTemplatePagePath(pathValue));

const pageCategory = (pathValue) => {
  const path = normalizeTemplatePagePath(pathValue).toLowerCase();
  if (path === "/" || isLocaleRootPath(path)) return "home";
  if (path.includes("/products/")) return "products";
  if (path.includes("/industries/")) return "industries";
  if (path.includes("/company/insights/")) return "insights";
  if (path.includes("/company/")) return "company";
  if (path.includes("/services/")) return "services";
  if (path.includes("/support/") || path.includes("/contact/")) return "contact";
  if (path.includes("/resources/") || path.includes("/news/") || path.includes("/blog/")) return "resources";
  return "other";
};

const navLabelFromPage = (page) => {
  const category = pageCategory(page?.path || "/");
  if (category === "home") return "Home";
  if (category === "products") return "Products";
  if (category === "industries") return "Industries";
  if (category === "insights") return "Insights";
  if (category === "company") return "Company";
  if (category === "services") return "Services";
  if (category === "contact") return "Contact";
  if (category === "resources") return "Resources";
  const fallback = String(page?.name || "").replace(/\s+/g, " ").trim();
  return fallback.slice(0, 28) || formatTemplatePageName(page?.path || "/");
};

const normalizePatternMatcher = (pattern) => {
  const token = String(pattern || "").trim();
  if (!token) return null;
  if (token.startsWith("/") && token.lastIndexOf("/") > 0) {
    const last = token.lastIndexOf("/");
    const body = token.slice(1, last);
    const flags = token.slice(last + 1) || "i";
    try {
      return new RegExp(body, flags.includes("i") ? flags : `${flags}i`);
    } catch {
      return null;
    }
  }
  const escaped = token
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  try {
    return new RegExp(escaped, "i");
  } catch {
    return null;
  }
};

const extractSpecialRuleValue = (site, key) => {
  const specialRules = site?.specialRules && typeof site.specialRules === "object" ? site.specialRules : {};
  if (specialRules[key] !== undefined) return specialRules[key];
  const snake = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
  if (specialRules[snake] !== undefined) return specialRules[snake];
  return undefined;
};

const resolveDiscoveryPolicy = ({ site = {}, options = {} }) => {
  const siteMaxDiscoveredPages =
    Number(site?.maxDiscoveredPages || 0) > 0
      ? Math.floor(Number(site.maxDiscoveredPages))
      : Number(extractSpecialRuleValue(site, "maxDiscoveredPages") || 0) > 0
        ? Math.floor(Number(extractSpecialRuleValue(site, "maxDiscoveredPages")))
        : 0;
  const siteMaxNavLinks =
    Number(site?.maxNavLinks || 0) > 0
      ? Math.floor(Number(site.maxNavLinks))
      : Number(extractSpecialRuleValue(site, "maxNavLinks") || 0) > 0
        ? Math.floor(Number(extractSpecialRuleValue(site, "maxNavLinks")))
        : 0;
  const globalMaxDiscoveredPages = Math.max(4, Math.floor(Number(options?.maxDiscoveredPages || 0) || 24));
  const globalMaxNavLinks = Math.max(3, Math.floor(Number(options?.maxNavLinks || 0) || 8));
  const mergedPatterns = [
    ...(Array.isArray(options?.mustIncludePatterns) ? options.mustIncludePatterns : []),
    ...(Array.isArray(site?.mustIncludePatterns) ? site.mustIncludePatterns : []),
    ...(Array.isArray(extractSpecialRuleValue(site, "mustIncludePatterns"))
      ? extractSpecialRuleValue(site, "mustIncludePatterns")
      : typeof extractSpecialRuleValue(site, "mustIncludePatterns") === "string"
        ? String(extractSpecialRuleValue(site, "mustIncludePatterns")).split(",")
        : []),
  ]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);
  const uniquePatterns = Array.from(new Set(mergedPatterns));
  const mustIncludeMatchers = uniquePatterns.map((entry) => normalizePatternMatcher(entry)).filter(Boolean);
  return {
    maxDiscoveredPages: siteMaxDiscoveredPages > 0 ? siteMaxDiscoveredPages : globalMaxDiscoveredPages,
    maxNavLinks: siteMaxNavLinks > 0 ? siteMaxNavLinks : globalMaxNavLinks,
    maxDiscoverySeedScan: Math.max(80, (siteMaxDiscoveredPages > 0 ? siteMaxDiscoveredPages : globalMaxDiscoveredPages) * 20),
    mustIncludePatterns: uniquePatterns,
    mustIncludeMatchers,
  };
};

const matchesMustIncludePolicy = ({ pathValue = "/", name = "", raw = "", policy = null }) => {
  const matchers = Array.isArray(policy?.mustIncludeMatchers) ? policy.mustIncludeMatchers : [];
  if (!matchers.length) return false;
  const haystack = `${normalizeTemplatePagePath(pathValue)} ${String(name || "")} ${String(raw || "")}`;
  return matchers.some((matcher) => {
    try {
      return matcher.test(haystack);
    } catch {
      return false;
    }
  });
};

const buildNavigationFromSitePages = (sitePages = [], currentPath = "/", navigationPolicy = {}) => {
  const uniquePages = [];
  const seen = new Set();
  for (const page of Array.isArray(sitePages) ? sitePages : []) {
    const path = normalizeTemplatePagePath(page?.path || "/");
    if (seen.has(path)) continue;
    seen.add(path);
    uniquePages.push({
      path,
      name: String(page?.name || "").trim() || formatTemplatePageName(path),
    });
  }
  if (!uniquePages.length) return null;

  const categoryOrder = ["home", "products", "industries", "company", "insights", "services", "resources", "contact", "other"];
  const bestByCategory = new Map();
  for (const page of uniquePages) {
    const category = pageCategory(page.path);
    const current = bestByCategory.get(category);
    if (!current) {
      bestByCategory.set(category, page);
      continue;
    }
    const nextScore = pageDepth(page.path) * 10 + page.name.length;
    const currentScore = pageDepth(current.path) * 10 + current.name.length;
    if (nextScore < currentScore) bestByCategory.set(category, page);
  }

  const navCandidates = categoryOrder
    .map((category) => {
      const page = bestByCategory.get(category);
      if (!page) return null;
      return { category, page };
    })
    .filter(Boolean);

  const links = [];
  const usedLabels = new Set();
  let hasDropdown = false;
  const maxNavLinks = Math.max(3, Math.floor(Number(navigationPolicy?.maxNavLinks || 0) || 6));
  for (const candidate of navCandidates) {
    const page = candidate.page;
    const category = candidate.category;
    const label = navLabelFromPage(page);
    const key = slug(label);
    if (!key || usedLabels.has(key)) continue;
    usedLabels.add(key);
    const childPages =
      category === "home"
        ? []
        : uniquePages
            .filter((item) => item.path !== page.path && pageCategory(item.path) === category)
            .slice(0, 5);
    const children = childPages.map((child) => ({
      label: navLabelFromPage(child),
      href: child.path,
    }));
    if (children.length) hasDropdown = true;
    links.push({
      label,
      href: page.path,
      variant: "link",
      ...(children.length ? { children } : {}),
    });
    if (links.length >= maxNavLinks) break;
  }

  const contactPage = uniquePages.find((page) => pageCategory(page.path) === "contact") || uniquePages.find((page) =>
    /contact|quote|support|get[-\s]?in[-\s]?touch|help/.test(`${page.path} ${page.name}`.toLowerCase())
  );
  const fallbackTarget = uniquePages.find((page) => page.path !== currentPath) || uniquePages[0];
  const ctaTarget = contactPage || fallbackTarget;

  return {
    links,
    hasDropdown,
    ctas: ctaTarget
      ? [{ label: contactPage ? "Contact" : "Explore", href: ctaTarget.path, variant: "primary" }]
      : [],
  };
};

const buildFooterColumnsFromSitePages = (sitePages = [], footerLinks = [], navigationPolicy = {}) => {
  const normalizedFooterLinks = dedupeLinkItems(footerLinks, 24);
  if (normalizedFooterLinks.length >= 4) {
    const columns = [
      { title: "Company", links: [] },
      { title: "Resources", links: [] },
      { title: "Legal", links: [] },
    ];
    for (const link of normalizedFooterLinks) {
      const token = `${link.label} ${link.href}`.toLowerCase();
      if (/privacy|terms|legal|compliance|cookie|policy|imprint/.test(token)) {
        columns[2].links.push(link);
      } else if (/support|help|resource|download|docs|insight|news/.test(token)) {
        columns[1].links.push(link);
      } else {
        columns[0].links.push(link);
      }
    }
    return columns.filter((column) => column.links.length > 0);
  }

  const pages = [];
  const seen = new Set();
  for (const page of Array.isArray(sitePages) ? sitePages : []) {
    const path = normalizeTemplatePagePath(page?.path || "/");
    if (path === "/" || seen.has(path)) continue;
    seen.add(path);
    pages.push({
      label: String(page?.name || "").trim() || formatTemplatePageName(path),
      href: path,
    });
  }
  if (!pages.length) return null;

  const columns = [
    { title: "Company", links: [] },
    { title: "Explore", links: [] },
    { title: "Support", links: [] },
  ];
  const maxFooterLinks = Math.max(8, Math.floor(Number(navigationPolicy?.maxNavLinks || 0) || 8) * 2);
  for (const [index, page] of pages.slice(0, maxFooterLinks).entries()) {
    columns[index % columns.length].links.push(page);
  }
  return columns.filter((column) => column.links.length > 0);
};

const SECTION_KIND_INDEX = { hero: 0, story: 1, approach: 2, products: 3, socialproof: 4, cta: 5, footer: 6, navigation: 7, contact: 5 };

const buildSectionDefaults = (kind, spec, site, summary, assetContext = {}, recipe = null, context = {}) => {
  const pageTitle = summary.title || site.id || "Site";
  const promptLine = site.prompt || site.description || "";
  const defaults = { ...(spec.defaults || {}) };
  const blockType = String(spec?.blockType || "");
  const currentPath = normalizeTemplatePagePath(context?.currentPath || "/");
  const sitePages = Array.isArray(context?.sitePages) ? context.sitePages : [];
  const discoveryPolicy = context?.discoveryPolicy && typeof context.discoveryPolicy === "object" ? context.discoveryPolicy : {};
  const sectionIdx = SECTION_KIND_INDEX[kind] ?? 0;
  const pageHeadline = sectionSpecificHeadline(summary, sectionIdx, promptLine || `Welcome to ${pageTitle}`);
  const pageSubhead = sectionSpecificSubhead(
    summary,
    sectionIdx,
    site.description || `Designed for ${pageTitle} with a high-consistency block architecture.`
  );
  const imageSourcePolicy = String(site?.imageSourcePolicy || "").trim().toLowerCase();
  const disableScreenshotImages =
    Boolean(site?.disableScreenshotImages) ||
    imageSourcePolicy === "gallery_or_source" ||
    imageSourcePolicy === "source_or_gallery";
  const sourceImages = Array.isArray(summary?.images)
    ? summary.images.filter((item) => /^https?:\/\//i.test(String(item || "").trim()))
    : [];
  const galleryBySection = recipe && typeof recipe === "object" ? recipe.imageLibrary || {} : {};
  const similarityTokens = buildSimilarityTokenSet({ site, summary, context });

  const poolFor = (sectionKey) => {
    const gallery = Array.isArray(galleryBySection?.[sectionKey]) ? galleryBySection[sectionKey] : [];
    const rankedGallery = rankGalleryBySimilarity(gallery, similarityTokens);
    const galleryOrdered = rankedGallery.matched.length ? rankedGallery.matched : rankedGallery.all;
    if (imageSourcePolicy === "source_or_gallery") return [...sourceImages, ...galleryOrdered];
    return [...galleryOrdered, ...sourceImages];
  };
  const imageFor = (sectionKey, index = 0) => {
    const pool = poolFor(sectionKey).filter((item) => /^https?:\/\//i.test(String(item || "").trim()));
    if (!pool.length) return "";
    return pool[Math.max(0, index) % pool.length];
  };
  const anyImage =
    imageFor("hero", 0) ||
    imageFor("story", 0) ||
    imageFor("approach", 0) ||
    imageFor("products", 0) ||
    imageFor("socialproof", 0) ||
    imageFor("cta", 0) ||
    imageFor("footer", 0);

  const resolvedAssets = disableScreenshotImages
    ? {
        ...assetContext,
        desktopUrl: anyImage,
        mobileUrl: imageFor("hero", 1) || anyImage,
        slices: {
          desktop: {
            hero: imageFor("hero", 0) || anyImage,
            story: imageFor("story", 0) || imageFor("hero", 0) || anyImage,
            approach: imageFor("approach", 0) || imageFor("story", 0) || anyImage,
            products: imageFor("products", 0) || imageFor("story", 0) || anyImage,
            socialproof: imageFor("socialproof", 0) || imageFor("products", 0) || anyImage,
            cta: imageFor("cta", 0) || imageFor("socialproof", 0) || anyImage,
            footer: imageFor("footer", 0) || imageFor("cta", 0) || anyImage,
          },
          mobile: {
            hero: imageFor("hero", 1) || imageFor("hero", 0) || anyImage,
            story: imageFor("story", 1) || imageFor("story", 0) || imageFor("hero", 0) || anyImage,
            approach: imageFor("approach", 1) || imageFor("approach", 0) || anyImage,
            products: imageFor("products", 1) || imageFor("products", 0) || anyImage,
            socialproof: imageFor("socialproof", 1) || imageFor("socialproof", 0) || anyImage,
            cta: imageFor("cta", 1) || imageFor("cta", 0) || anyImage,
            footer: imageFor("footer", 1) || imageFor("footer", 0) || anyImage,
          },
        },
      }
    : assetContext;

  const desktopSlices = resolvedAssets?.slices?.desktop ?? {};
  const mobileSlices = resolvedAssets?.slices?.mobile ?? {};
  const desktopAsset = resolvedAssets?.desktopUrl || "";
  const mobileAsset = resolvedAssets?.mobileUrl || "";
  const heroPresentation = normalizeHeroPresentation(summary?.heroPresentation);
  const heroCarousel = normalizeHeroCarousel(summary?.heroCarousel);
  const carouselCapableHeroBlocks = new Set(["NexusHeroDock", "HeroSplit", "NeonHeroBeam"]);
  const heroSlideCandidates = dedupeUrls(
    [
      ...(Array.isArray(heroCarousel?.images) ? heroCarousel.images : []),
      ...poolFor("hero").filter((item) => /^https?:\/\//i.test(String(item || "").trim())),
      ...sourceImages,
    ],
    12
  );
  const generatedHeroSlides = heroSlideCandidates.slice(0, 6).map((src, index) => ({
    src,
    mobileSrc: src,
    alt: `${pageTitle} hero slide ${index + 1}`,
    label: `Slide ${index + 1}`,
  }));

  if (kind === "navigation") {
    defaults.logo = defaults.logo || pageTitle.split("|")[0].trim().slice(0, 48) || "Site";
    const navFromSitePages = buildNavigationFromSitePages(sitePages, currentPath, {
      maxNavLinks: discoveryPolicy.maxNavLinks,
    });
    if (navFromSitePages?.hasDropdown) {
      defaults.variant = "withDropdown";
    } else if (!defaults.variant) {
      defaults.variant = "withCTA";
    }
    defaults.links =
      defaults.links ||
      navFromSitePages?.links ||
      ["Home", "Services", "About", "Contact"].map((label, index) => ({
        label,
        href: index === 0 ? "#top" : `#${slug(label)}`,
        variant: "link",
      }));
    defaults.ctas = defaults.ctas || navFromSitePages?.ctas || [{ label: "Get Started", href: "#contact", variant: "primary" }];
    if (navFromSitePages?.hasDropdown) {
      defaults.variant = "withDropdown";
      defaults.menuStyle = "image_text";
      defaults.multiLevel = true;
    }
  }

  if (kind === "hero") {
    defaults.title = defaults.title || pageHeadline.slice(0, 96);
    defaults.subtitle = defaults.subtitle || pageSubhead.slice(0, 160);
    const navFromSitePages = buildNavigationFromSitePages(sitePages, currentPath, {
      maxNavLinks: discoveryPolicy.maxNavLinks,
    });
    defaults.ctas = defaults.ctas || navFromSitePages?.ctas || [{ label: "Get Started", href: "#contact", variant: "primary" }];
    // Only apply carousel slides on the homepage or locale root, not on subpages
    const isHomePage = currentPath === "/" || isLocaleRootPath(currentPath);
    const shouldUseCarousel =
      isHomePage &&
      carouselCapableHeroBlocks.has(blockType) && Boolean(heroCarousel.enabled) && generatedHeroSlides.length >= 2;
    if (shouldUseCarousel) {
      const existingSlides = Array.isArray(defaults.heroSlides)
        ? defaults.heroSlides.filter((slide) => typeof slide?.src === "string" && slide.src.trim())
        : [];
      defaults.heroSlides = existingSlides.length >= 2 ? existingSlides : generatedHeroSlides;
      defaults.heroCarouselAutoplayMs = Number(defaults.heroCarouselAutoplayMs || 4500);
    } else if (!isHomePage) {
      // Subpages should not inherit homepage carousel slides
      delete defaults.heroSlides;
      delete defaults.heroCarouselAutoplayMs;
    }
    if (desktopAsset) {
      const shouldBackgroundHero =
        heroPresentation.mode === "background_text" ||
        (blockType === "HeroSplit" && Boolean(heroCarousel.enabled) && generatedHeroSlides.length >= 2);
      if (shouldBackgroundHero) {
        defaults.background = "image";
        const firstSlideSrc =
          (Array.isArray(defaults.heroSlides) ? defaults.heroSlides[0]?.src : "") || desktopSlices.hero || desktopAsset;
        defaults.backgroundMedia = {
          kind: "image",
          src: firstSlideSrc,
          alt: `${pageTitle} hero background`,
        };
        defaults.backgroundOverlay = defaults.backgroundOverlay || "rgba(4, 14, 36, 0.58)";
        if (blockType === "HeroSplit") {
          defaults.media = undefined;
        }
      }
      if (blockType === "NexusHeroDock") {
        const firstSlide = Array.isArray(defaults.heroSlides) ? defaults.heroSlides[0] : null;
        defaults.heroImageSrc = defaults.heroImageSrc || firstSlide?.src || desktopSlices.hero || desktopAsset;
        defaults.mobileHeroImageSrc =
          defaults.mobileHeroImageSrc || firstSlide?.mobileSrc || mobileSlices.hero || mobileAsset || defaults.heroImageSrc;
        defaults.heroImageAlt = defaults.heroImageAlt || `${pageTitle} hero visual`;
        return defaults;
      }
      const usesImageBackground = !defaults.background || defaults.background === "image";
      if (!defaults.background && !defaults.backgroundMedia && !defaults.media) {
        defaults.background = "image";
      }
      if (usesImageBackground) {
        defaults.backgroundMedia = defaults.backgroundMedia || {
          kind: "image",
          src: desktopSlices.hero || desktopAsset,
          alt: `${pageTitle} reference`,
        };
        defaults.backgroundOverlay = defaults.backgroundOverlay || "rgba(5,8,18,0.55)";
      }
      const shouldUseSplitMedia = !(
        (heroPresentation.mode === "background_text" ||
          (blockType === "HeroSplit" && Boolean(heroCarousel.enabled) && generatedHeroSlides.length >= 2)) &&
        blockType === "HeroSplit"
      );
      if (shouldUseSplitMedia) {
        defaults.media =
          defaults.media ||
          ((Array.isArray(defaults.heroSlides) ? defaults.heroSlides[0]?.src : "") || desktopSlices.hero || desktopAsset
            ? {
                kind: "image",
                src: (Array.isArray(defaults.heroSlides) ? defaults.heroSlides[0]?.src : "") || desktopSlices.hero || desktopAsset,
                alt: `${pageTitle} hero visual`,
              }
            : undefined);
      }
      if (blockType === "DesignerHeroEditorial") {
        defaults.meshImageSrc = defaults.meshImageSrc || desktopSlices.hero || desktopAsset;
        defaults.previewImageSrc = defaults.previewImageSrc || desktopSlices.story || desktopAsset;
        defaults.mobilePreviewImageSrc =
          defaults.mobilePreviewImageSrc || mobileSlices.hero || mobileAsset || defaults.previewImageSrc;
      }
    }
  }

  if (kind === "story") {
    defaults.eyebrow = defaults.eyebrow || "Our Story";
    defaults.title = defaults.title || sectionSpecificHeadline(summary, SECTION_KIND_INDEX.story, `Why ${pageTitle}`).slice(0, 92);
    defaults.subtitle = defaults.subtitle || sectionSpecificSubhead(summary, SECTION_KIND_INDEX.story, "Crafted experiences, measured outcomes, and durable visual language.").slice(0, 180);
    defaults.body =
      defaults.body ||
      firstNonEmpty(
        [
          ...(Array.isArray(summary?.h2) ? summary.h2 : []),
          ...(Array.isArray(summary?.links) ? summary.links : []),
        ],
        "This section is generated from source page signals."
      ).slice(0, 220);
    defaults.ctas = defaults.ctas || [{ label: "Explore", href: "#", variant: "link" }];
    if (isBlogLikePath(currentPath)) {
      defaults.contentFormat = "markdown";
      defaults.markdownEnabled = true;
      defaults.variant = defaults.variant || "editorial";
    }
    if ((blockType === "ContentStory" || blockType === "NeonDashboardStrip" || blockType === "NexusControlPanel") && desktopAsset && !defaults.dashboardImageSrc) {
      defaults.dashboardImageSrc = desktopSlices.story || desktopAsset;
      defaults.dashboardImageAlt = defaults.dashboardImageAlt || `${pageTitle} dashboard visual`;
    }
    if ((blockType === "ContentStory" || blockType === "FeatureWithMedia") && !defaults.media?.src && desktopSlices.story) {
      defaults.media = { kind: "image", src: desktopSlices.story, alt: `${pageTitle} story visual` };
    }
    if ((blockType === "ContentStory" || blockType === "FeatureWithMedia") && !defaults.mediaSrc && desktopSlices.story) {
      defaults.mediaSrc = desktopSlices.story;
      defaults.mediaAlt = defaults.mediaAlt || `${pageTitle} story visual`;
    }
    if (blockType === "CardsGrid" && desktopAsset && Array.isArray(defaults.items)) {
      defaults.items = defaults.items.map((item, index) => {
        const next = { ...(item || {}) };
        const hasImage =
          Boolean(next.image?.src) ||
          (typeof next.imageSrc === "string" && next.imageSrc.trim().length > 0) ||
          Boolean(next.cover?.src);
        if (hasImage) return next;
        const src =
          index % 2 === 0
            ? desktopSlices.story || desktopAsset
            : mobileSlices.story || mobileAsset || desktopSlices.story || desktopAsset;
        next.image = { src, alt: next.title || `Service ${index + 1}` };
        next.imageSrc = src;
        next.imageAlt = next.title || `Service ${index + 1}`;
        return next;
      });
    }
  }

  if (kind === "approach") {
    defaults.title = defaults.title || sectionSpecificHeadline(summary, SECTION_KIND_INDEX.approach, "Key Capabilities").slice(0, 88);
    defaults.subtitle = defaults.subtitle || sectionSpecificSubhead(summary, SECTION_KIND_INDEX.approach, "Designed for scale, precision, and reliable execution.").slice(0, 160);
    const seededItems = summaryItems(summary, 3);
    defaults.items =
      defaults.items ||
      (seededItems.length
        ? seededItems.map((item, index) => ({
            title: item.title,
            desc: item.desc,
            description: item.description,
            icon: ["layers", "shield", "chart"][index % 3],
          }))
        : [
            { title: "Process", desc: "Structured delivery with measurable checkpoints.", icon: "layers" },
            { title: "Quality", desc: "Design and implementation quality gates.", icon: "shield" },
            { title: "Impact", desc: "Outcome-focused iteration loop.", icon: "chart" },
          ]);
    if (desktopSlices.approach && Array.isArray(defaults.items) && blockType !== "NexusOpsMatrix") {
      defaults.items = defaults.items.map((item, index) => ({
        ...(item || {}),
        image:
          item?.image ||
          (blockType === "DesignerCapabilitiesStrip"
            ? undefined
            : {
                src: index === 0 ? desktopSlices.approach : mobileSlices.approach || desktopSlices.approach,
                alt: item?.title || `Capability ${index + 1}`,
              }),
        imageSrc:
          item?.imageSrc ||
          (index === 0 ? desktopSlices.approach : mobileSlices.approach || desktopSlices.approach),
        imageAlt: item?.imageAlt || item?.title || `Capability ${index + 1}`,
      }));
    }
    if ((blockType === "FeatureWithMedia" || blockType === "ContentStory") && !defaults.media?.src) {
      const src = desktopSlices.approach || desktopAsset;
      if (src) {
        defaults.media = { kind: "image", src, alt: `${pageTitle} approach visual` };
        defaults.mediaSrc = defaults.mediaSrc || src;
        defaults.mediaAlt = defaults.mediaAlt || `${pageTitle} approach visual`;
      }
    }
    if (blockType === "FeatureWithMedia" && defaults.background === "image" && desktopSlices.approach && !defaults.backgroundMedia) {
      defaults.backgroundMedia = {
        kind: "image",
        src: desktopSlices.approach,
        alt: `${pageTitle} section background`,
      };
    }
  }

  if (kind === "products") {
    defaults.title = defaults.title || sectionSpecificHeadline(summary, SECTION_KIND_INDEX.products, "Product Portfolio").slice(0, 92);
    defaults.subtitle = defaults.subtitle || sectionSpecificSubhead(summary, SECTION_KIND_INDEX.products, "Modular blocks tailored to your site objectives.").slice(0, 180);
    if (classifyTemplatePageType(currentPath, String(summary?.title || "")) === "products" || isProductLikePath(currentPath)) {
      defaults.commerceMode = "display_only";
      defaults.hideCart = true;
      defaults.hideCheckout = true;
      defaults.hideBuyNow = true;
    }
    if ((blockType === "NeonDashboardStrip" || blockType === "NexusControlPanel") && desktopAsset) {
      defaults.dashboardImageSrc = defaults.dashboardImageSrc || desktopSlices.products || desktopSlices.story || desktopAsset;
      defaults.mobileDashboardImageSrc =
        defaults.mobileDashboardImageSrc || mobileSlices.products || mobileAsset || defaults.dashboardImageSrc;
      defaults.dashboardImageAlt = defaults.dashboardImageAlt || `${pageTitle} dashboard visual`;
    }
    const seededItems = summaryItems(summary, 3);
    defaults.items =
      defaults.items ||
      (seededItems.length
        ? seededItems.map((item) => ({
            title: item.title,
            description: item.description,
            summary: item.description,
            cta: { label: "Details", href: "#" },
          }))
        : [
            { title: "Primary Offer", description: "High-demand offer package.", cta: { label: "Details", href: "#" } },
            { title: "Growth Offer", description: "Expanded capabilities and integrations.", cta: { label: "Details", href: "#" } },
            { title: "Enterprise Offer", description: "Full-service delivery and support.", cta: { label: "Details", href: "#" } },
          ]);
    if (desktopAsset && Array.isArray(defaults.items) && (blockType === "CardsGrid" || blockType === "CaseStudies" || blockType === "DesignerProjectsSplit")) {
      defaults.items = defaults.items.map((item, index) => {
        const next = { ...(item || {}) };
        const productImageForIndex =
          imageFor("products", index) ||
          imageFor("story", index) ||
          imageFor("approach", index) ||
          desktopSlices.products ||
          desktopAsset;
        const hasImage =
          Boolean(next.image?.src) ||
          (typeof next.imageSrc === "string" && next.imageSrc.trim().length > 0) ||
          Boolean(next.cover?.src);
        if (!hasImage && !next?.noImage) {
          const src = productImageForIndex;
          if (blockType !== "DesignerProjectsSplit") {
            next.image = { src, alt: next.title || `Visual ${index + 1}` };
            next.cover = { src, alt: next.title || `Visual ${index + 1}` };
          }
          next.imageSrc = src;
          next.imageAlt = next.title || `Visual ${index + 1}`;
        }
        return next;
      });
    }
  }

  if (kind === "socialproof") {
    if (blockType === "DesignerQuoteBand") {
      defaults.quote =
        defaults.quote ||
        "\"Working with Jeremi was a game-changer. He translated our vision into a polished product and delivered beyond expectations.\"";
      defaults.author = defaults.author || "Client";
      defaults.role = defaults.role || "Founder";
    } else {
      defaults.title = defaults.title || "Building for world-class innovators";
      defaults.items =
        defaults.items ||
        [
          { quote: "They curated a lifestyle, not only a space.", name: "Alexander Vane", role: "CEO" },
          { quote: "A masterclass in restraint and elegance.", name: "Isabelle Dubois", role: "Founder" },
        ];
      if ((blockType === "TestimonialsGrid" || blockType === "NeonResultsShowcase" || blockType === "NexusProofMosaic") && desktopAsset && !defaults.imageSrc) {
        defaults.imageSrc = desktopSlices.socialproof || desktopAsset;
        defaults.imageAlt = defaults.imageAlt || "Results visual";
      }
      if (blockType === "TestimonialsGrid" && mobileAsset && Array.isArray(defaults.items)) {
        defaults.items = defaults.items.map((item, index) => ({
          ...(item || {}),
          avatar:
            item?.avatar && typeof item.avatar === "object"
              ? item.avatar
              : {
                  src: mobileSlices.socialproof || mobileAsset,
                  alt: item?.name || `Avatar ${index + 1}`,
                },
        }));
      }
      if ((blockType === "FeatureWithMedia" || blockType === "ContentStory") && !defaults.media?.src) {
        const src = desktopSlices.socialproof || desktopAsset;
        if (src) {
          defaults.media = { kind: "image", src, alt: `${pageTitle} social proof visual` };
          defaults.mediaSrc = defaults.mediaSrc || src;
          defaults.mediaAlt = defaults.mediaAlt || `${pageTitle} social proof visual`;
        }
      }
    }
  }

  if (kind === "contact") {
    if ((blockType === "FeatureWithMedia" || blockType === "ContentStory") && !defaults.media?.src) {
      const src = desktopSlices.cta || desktopSlices.footer || desktopAsset;
      if (src) {
        defaults.media = { kind: "image", src, alt: `${pageTitle} contact visual` };
        defaults.mediaSrc = defaults.mediaSrc || src;
        defaults.mediaAlt = defaults.mediaAlt || `${pageTitle} contact visual`;
      }
    }
    if (blockType === "CardsGrid" && desktopAsset && Array.isArray(defaults.items)) {
      defaults.items = defaults.items.map((item, index) => {
        const next = { ...(item || {}) };
        const hasImage =
          Boolean(next.image?.src) ||
          (typeof next.imageSrc === "string" && next.imageSrc.trim().length > 0) ||
          Boolean(next.cover?.src);
        if (hasImage) return next;
        const src =
          index % 2 === 0
            ? desktopSlices.cta || desktopSlices.footer || desktopAsset
            : mobileSlices.cta || mobileSlices.footer || mobileAsset || desktopSlices.cta || desktopAsset;
        next.image = { src, alt: next.title || `Article ${index + 1}` };
        next.imageSrc = src;
        next.imageAlt = next.title || `Article ${index + 1}`;
        return next;
      });
    }
    if (classifyTemplatePageType(currentPath, String(summary?.title || "")) === "contact" || isSupportLikePath(currentPath)) {
      defaults.supportContentOnly = true;
      defaults.excludeDownloads = true;
      defaults.excludeCommerce = true;
    }
  }

  if (kind === "cta") {
    defaults.title = defaults.title || sectionSpecificHeadline(summary, SECTION_KIND_INDEX.cta, "Ready to define your space?").slice(0, 88);
    defaults.subtitle = defaults.subtitle || sectionSpecificSubhead(summary, SECTION_KIND_INDEX.cta, "Book a private consultation or browse the lookbook.").slice(0, 170);
    const navFromSitePages = buildNavigationFromSitePages(sitePages, currentPath, {
      maxNavLinks: discoveryPolicy.maxNavLinks,
    });
    defaults.cta = defaults.cta || navFromSitePages?.ctas?.[0] || { label: "Inquire Now", href: "#contact", variant: "primary" };
  }

  if (kind === "footer") {
    defaults.logoText = defaults.logoText || pageTitle.split("|")[0].trim().slice(0, 24) || "Site";
    defaults.columns =
      defaults.columns ||
      buildFooterColumnsFromSitePages(
        sitePages,
        Array.isArray(summary?.footerLinks) ? summary.footerLinks : [],
        { maxNavLinks: discoveryPolicy.maxNavLinks }
      ) || [
      { title: "Company", links: [{ label: "About", href: "#" }, { label: "Contact", href: "#" }] },
      { title: "Studio", links: [{ label: "Approach", href: "#" }, { label: "Projects", href: "#" }] },
      { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
    ];
    defaults.legal = defaults.legal || "© 2026 All rights reserved.";
    if (desktopSlices.footer && !defaults.backgroundMedia && blockType === "NeonFooterGlow") {
      defaults.background = "image";
      defaults.backgroundMedia = {
        kind: "image",
        src: desktopSlices.footer,
        alt: `${pageTitle} footer visual`,
      };
      defaults.backgroundOverlay = defaults.backgroundOverlay || "rgba(0,0,0,0.15)";
    }
  }

  return defaults;
};

const normalizeTemplatePagePath = (value) => {
  const rawInput = String(value || "").trim();
  if (!rawInput) return "/";
  let raw = rawInput;
  if (/^https?:\/\//i.test(rawInput)) {
    try {
      raw = new URL(rawInput).pathname || "/";
    } catch {
      raw = rawInput;
    }
  }
  const withoutHash = raw.split("#")[0] || "";
  const withoutQuery = withoutHash.split("?")[0] || "";
  const withSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  const normalized = withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
  return normalized === "" ? "/" : normalized;
};

const formatTemplatePageName = (pathValue, fallback = "Page") => {
  const path = normalizeTemplatePagePath(pathValue);
  if (path === "/") return "Home";
  const leaf = path.split("/").filter(Boolean).pop() || fallback;
  return leaf
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
};

const toKebab = (value) =>
  String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const toPascal = (value) =>
  String(value || "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join("");

const TEMPLATE_EXCLUSIVE_IMPORT_BLOCK_ALIAS = {
  ContentStory: "feature-with-media",
};

const resolveTemplateExclusiveKebabName = (baseBlockType, availableBlockFolders = new Set()) => {
  const raw = String(baseBlockType || "").trim();
  if (!raw) return "";
  const alias = TEMPLATE_EXCLUSIVE_IMPORT_BLOCK_ALIAS[raw];
  if (alias) return alias;
  const kebab = toKebab(raw);
  if (!kebab) return "";
  if (!availableBlockFolders.size) return kebab;
  return availableBlockFolders.has(kebab) ? kebab : "";
};

const buildTemplateExclusiveComponentName = ({ siteId, pagePath = "/", sectionKind, baseBlockType, rank = 0 }) => {
  const siteToken = toPascal(siteId || "site") || "Site";
  const pageToken =
    normalizeTemplatePagePath(pagePath || "/") === "/" ? "Home" : toPascal(normalizeTemplatePagePath(pagePath).replace(/\//g, " "));
  const sectionToken = toPascal(sectionKind || "section") || "Section";
  const blockToken = toPascal(baseBlockType || "Block") || "Block";
  const rankToken = rank > 0 ? `Alt${rank}` : "Primary";
  return `TemplateExclusive${siteToken}${pageToken}${sectionToken}${blockToken}${rankToken}`.slice(0, 120);
};

const isValidIdentifier = (value) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(String(value || ""));

const buildTemplateExclusiveFieldCode = (defaults = {}) => {
  const lines = [`        id: textField("Id"),`];
  for (const [key, value] of Object.entries(defaults || {})) {
    if (key === "id" || !isValidIdentifier(key)) continue;
    if (typeof value === "boolean") {
      lines.push(`        ${key}: booleanField("${toPascal(key)}"),`);
      continue;
    }
    if (typeof value === "string" || typeof value === "number") {
      lines.push(`        ${key}: textField("${toPascal(key)}"),`);
    }
  }
  return lines.join("\n");
};

const normalizeTemplateVariantCandidates = (entry) => {
  const candidates = Array.isArray(entry?.template_variant?.candidates) ? entry.template_variant.candidates : [];
  return candidates
    .map((candidate) => {
      const blockType = String(candidate?.block_type || "").trim();
      const defaults = candidate?.defaults && typeof candidate.defaults === "object" ? candidate.defaults : {};
      if (!blockType) return null;
      return {
        block_type: blockType,
        defaults,
        source: String(candidate?.source || "").trim(),
        rank: Number.isFinite(Number(candidate?.rank)) ? Number(candidate.rank) : null,
        description: String(candidate?.description || "").trim(),
      };
    })
    .filter(Boolean);
};

const injectTemplateExclusiveComponents = ({ processed = [], availableBlockFolders = new Set() }) => {
  const componentMap = new Map();
  const componentUsage = [];

  const registerComponent = ({ siteId, pagePath, sectionKind, blockType, defaults, rank = 0, source = "" }) => {
    const kebabName = resolveTemplateExclusiveKebabName(blockType, availableBlockFolders);
    if (!kebabName) return null;
    const name = buildTemplateExclusiveComponentName({
      siteId,
      pagePath,
      sectionKind,
      baseBlockType: blockType,
      rank,
    });
    const component = {
      name,
      kebabName,
      fieldCode: buildTemplateExclusiveFieldCode(defaults),
      defaultProps: { id: `${name}-1`, ...(defaults || {}) },
      templateExclusive: {
        siteId,
        pagePath: normalizeTemplatePagePath(pagePath || "/"),
        sectionKind,
        baseBlockType: String(blockType || ""),
        source: source || "template_exclusive",
        rank: rank > 0 ? rank : 0,
      },
    };
    if (!componentMap.has(name)) componentMap.set(name, component);
    componentUsage.push(component.templateExclusive);
    return name;
  };

  const mutateSectionEntry = ({ siteId, pagePath, sectionKind, entry }) => {
    if (!entry || typeof entry !== "object") return;
    const baseType = String(entry.block_type || "").trim();
    const defaults = entry.defaults && typeof entry.defaults === "object" ? cloneJson(entry.defaults) : {};
    if (!baseType) return;

    const primaryName = registerComponent({
      siteId,
      pagePath,
      sectionKind,
      blockType: baseType,
      defaults,
      rank: 0,
      source: "primary",
    });
    if (!primaryName) return;

    entry.template_exclusive = {
      component_name: primaryName,
      base_block_type: baseType,
    };
    entry.block_type = primaryName;

    const candidates = normalizeTemplateVariantCandidates(entry);
    if (candidates.length) {
      const patchedCandidates = [];
      for (const [index, candidate] of candidates.entries()) {
        const candidateName = registerComponent({
          siteId,
          pagePath,
          sectionKind,
          blockType: candidate.block_type,
          defaults: cloneJson(candidate.defaults),
          rank: index + 1,
          source: candidate.source || "candidate",
        });
        if (!candidateName) continue;
        patchedCandidates.push({
          ...candidate,
          block_type: candidateName,
          template_exclusive: {
            component_name: candidateName,
            base_block_type: candidate.block_type,
          },
        });
      }
      if (patchedCandidates.length) {
        entry.template_variant = {
          ...(entry.template_variant && typeof entry.template_variant === "object" ? entry.template_variant : {}),
          candidates: patchedCandidates,
        };
      }
    }
  };

  for (const item of processed) {
    const siteId = String(item?.site?.id || "");
    const specPack = item?.specPack;
    if (!siteId || !specPack || typeof specPack !== "object") continue;
    const rootSpecs = specPack?.section_specs && typeof specPack.section_specs === "object" ? specPack.section_specs : {};
    for (const [sectionKind, entry] of Object.entries(rootSpecs)) {
      mutateSectionEntry({ siteId, pagePath: "/", sectionKind, entry });
    }
    const pageSpecs = Array.isArray(specPack?.page_specs) ? specPack.page_specs : [];
    for (const page of pageSpecs) {
      const pagePath = normalizeTemplatePagePath(page?.path || "/");
      const sectionSpecs = page?.section_specs && typeof page.section_specs === "object" ? page.section_specs : {};
      for (const [sectionKind, entry] of Object.entries(sectionSpecs)) {
        mutateSectionEntry({ siteId, pagePath, sectionKind, entry });
      }
    }
  }

  return {
    components: Array.from(componentMap.values()),
    usage: componentUsage,
  };
};

const mergeTemplateExclusiveComponents = (existing = [], incoming = []) => {
  const merged = new Map();
  for (const row of Array.isArray(existing) ? existing : []) {
    const name = String(row?.name || "").trim();
    if (!name) continue;
    merged.set(name, row);
  }
  for (const row of Array.isArray(incoming) ? incoming : []) {
    const name = String(row?.name || "").trim();
    if (!name) continue;
    merged.set(name, row);
  }
  return Array.from(merged.values());
};

const classifyTemplatePageType = (pathValue, title = "") => {
  const path = normalizeTemplatePagePath(pathValue);
  const token = `${path} ${title}`.toLowerCase();
  if (path === "/") return "home";
  if (/privacy|terms|policy|legal|cookies?/.test(token)) return "legal";
  if (/blog|journal|news|insight|article|resource|press|media|technology/.test(token)) return "blog";
  if (/career|careers|job|jobs|vacanc|hiring|talent/.test(token)) return "careers";
  if (/product|products|shop|store|catalog|collection|pricing|plans?|portfolio/.test(token)) return "products";
  if (/service|services|solution|capabilit|offer|program|work/.test(token)) return "services";
  if (/contact|book|booking|appointment|get[-\s]?in[-\s]?touch|inquiry|quote|support|help/.test(token)) return "contact";
  if (/about|company|team|mission|vision|story|studio|who[-\s]?we[-\s]?are/.test(token)) return "about";
  return "generic";
};

const SITE_PAGE_KIND_PRESETS = {
  home: ["navigation", "hero", "story", "approach", "products", "socialproof", "cta", "footer"],
  about: ["navigation", "hero", "story", "approach", "socialproof", "cta", "footer"],
  services: ["navigation", "hero", "story", "approach", "products", "cta", "footer"],
  products: ["navigation", "hero", "products", "story", "cta", "footer"],
  contact: ["navigation", "hero", "contact", "cta", "footer"],
  blog: ["navigation", "hero", "story", "products", "footer"],
  careers: ["navigation", "hero", "story", "approach", "cta", "footer"],
  legal: ["navigation", "story", "footer"],
  generic: ["navigation", "hero", "story", "approach", "cta", "footer"],
};

const resolveTemplatePageKinds = ({ pageType, recipe }) => {
  const availableKinds = new Set(Object.keys(recipe?.sectionSpecs || {}));
  const fallbackKinds = (Array.isArray(recipe?.requiredCategories) ? recipe.requiredCategories : []).filter((kind) =>
    availableKinds.has(kind)
  );
  const preset = Array.isArray(SITE_PAGE_KIND_PRESETS[pageType]) ? SITE_PAGE_KIND_PRESETS[pageType] : SITE_PAGE_KIND_PRESETS.generic;
  const kinds = preset.filter((kind) => availableKinds.has(kind));
  if (kinds.length) return unique(kinds);
  if (fallbackKinds.length) return unique(fallbackKinds);
  const minimal = ["navigation", "hero", "footer"].filter((kind) => availableKinds.has(kind));
  if (minimal.length) return minimal;
  return Array.from(availableKinds).slice(0, 4);
};

const buildSitePagesFromCrawl = ({ recipe, summary, crawl, discoveryPolicy = null }) => {
  if (!crawl?.enabled) return [];

  const policy =
    discoveryPolicy && typeof discoveryPolicy === "object"
      ? discoveryPolicy
      : { maxDiscoveredPages: 12, maxDiscoverySeedScan: 120, mustIncludeMatchers: [] };
  const maxDiscoveredPages = Math.max(4, Math.floor(Number(policy.maxDiscoveredPages || 0) || 12));
  const maxDiscoverySeedScan = Math.max(
    maxDiscoveredPages * 5,
    Math.floor(Number(policy.maxDiscoverySeedScan || 0) || 120)
  );

  const pageMap = new Map();
  const upsert = ({ pathValue, name, pageType, source, forceInclude = false, raw = "" }) => {
    const path = normalizeTemplatePagePath(pathValue);
    const kinds = resolveTemplatePageKinds({ pageType, recipe });
    if (!kinds.length) return;
    const forced = Boolean(forceInclude) || matchesMustIncludePolicy({ pathValue: path, name, raw, policy });
    const current = pageMap.get(path);
    const next = {
      path,
      name: String(name || "").trim() || formatTemplatePageName(path),
      required_categories: kinds,
      source,
      forceInclude: forced,
    };
    if (!current) {
      pageMap.set(path, next);
      return;
    }
    // Prefer crawl-derived naming over default naming for the same path.
    if (current.source === "default" && source === "crawl") {
      pageMap.set(path, { ...current, ...next, forceInclude: current.forceInclude || next.forceInclude });
      return;
    }
    if (forced && !current.forceInclude) pageMap.set(path, { ...current, forceInclude: true });
  };

  upsert({ pathValue: "/", name: "Home", pageType: "home", source: "default" });

  const crawledPages = Array.isArray(crawl?.pages) ? crawl.pages : [];
  const homeTitleToken = slug(String(summary?.title || "").split(/[|•·]/)[0] || "");
  for (const page of crawledPages) {
    if (!page || page.error) continue;
    const status = Number(page.status || 0);
    if (status >= 500) continue;
    let pagePath = "/";
    try {
      const parsed = new URL(String(page.url || "").trim());
      pagePath = normalizeTemplatePagePath(parsed.pathname || "/");
    } catch {
      continue;
    }
    const title = String(page.title || "").trim();
    const titleParts = splitTitleCandidates(title);
    const titleSeed =
      titleParts.find((part) => {
        const token = slug(part);
        return token && token !== homeTitleToken;
      }) ||
      titleParts[0] ||
      "";
    const pageType = classifyTemplatePageType(pagePath, title);
    upsert({
      pathValue: pagePath,
      name: titleSeed || formatTemplatePageName(pagePath),
      pageType,
      source: "crawl",
      raw: page.url,
    });
  }

  const discoveredUrls = Array.isArray(crawl?.discoveredUrls) ? crawl.discoveredUrls : [];
  for (const rawUrl of discoveredUrls.slice(0, maxDiscoverySeedScan)) {
    let pagePath = "/";
    try {
      const parsed = new URL(String(rawUrl || "").trim());
      pagePath = normalizeTemplatePagePath(parsed.pathname || "/");
    } catch {
      continue;
    }
    const existing = pageMap.get(pagePath);
    if (existing) continue;
    const pageType = classifyTemplatePageType(pagePath, "");
    upsert({
      pathValue: pagePath,
      name: formatTemplatePageName(pagePath),
      pageType,
      source: "crawl_discovered",
      raw: rawUrl,
    });
  }

  const summaryLinks = Array.isArray(summary?.links) ? summary.links : [];
  for (const rawLink of summaryLinks.slice(0, maxDiscoverySeedScan)) {
    const raw = String(rawLink || "").trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) continue;
    let pagePath = "";
    if (raw.startsWith("/")) {
      pagePath = normalizeTemplatePagePath(raw);
    } else if (/^https?:\/\//i.test(raw)) {
      try {
        pagePath = normalizeTemplatePagePath(new URL(raw).pathname || "/");
      } catch {
        pagePath = "";
      }
    } else {
      continue;
    }
    if (!pagePath) continue;
    const existing = pageMap.get(pagePath);
    if (existing) continue;
    upsert({
      pathValue: pagePath,
      name: formatTemplatePageName(pagePath),
      pageType: classifyTemplatePageType(pagePath, ""),
      source: "summary_links",
      raw,
    });
  }

  if (pageMap.size <= 1) {
    upsert({ pathValue: "/about", name: "About", pageType: "about", source: "default" });
    upsert({ pathValue: "/services", name: "Services", pageType: "services", source: "default" });
    upsert({ pathValue: "/contact", name: "Contact", pageType: "contact", source: "default" });
  }

  const orderedPaths = ["/", "/about", "/services", "/products", "/contact", "/blog"];
  const pages = Array.from(pageMap.values()).sort((a, b) => {
    const ai = orderedPaths.indexOf(a.path);
    const bi = orderedPaths.indexOf(b.path);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.path.localeCompare(b.path);
  });

  const selected = [];
  const selectedPaths = new Set();
  const pushPage = (entry) => {
    if (!entry?.path || selectedPaths.has(entry.path)) return;
    selectedPaths.add(entry.path);
    selected.push(entry);
  };

  for (const p of orderedPaths) {
    const found = pages.find((entry) => entry.path === p);
    if (found) pushPage(found);
  }
  for (const page of pages.filter((entry) => entry.forceInclude)) pushPage(page);
  for (const page of pages) {
    if (selected.length >= maxDiscoveredPages && !page.forceInclude) continue;
    pushPage(page);
  }

  return selected.map((page) => ({
    path: page.path,
    name: page.name,
    required_categories: page.required_categories,
  }));
};

const isLikelyDownloadPath = (pathValue) => {
  const p = normalizeTemplatePagePath(pathValue || "/").toLowerCase();
  return /\.(zip|dmg|exe|msi|pkg|pdf|iso|rar|7z|tar|gz)$/.test(p) || /\/download[s]?\//.test(p);
};

const stripLocalePrefix = (pathValue) => {
  const normalized = normalizeTemplatePagePath(pathValue || "/");
  const stripped = normalized.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/i, "");
  return stripped || "/";
};

const buildRouteAliasMap = (sitePages = []) => {
  const aliasMap = new Map();
  const setAlias = (token, routePath) => {
    const normalizedToken = slug(String(token || ""));
    const normalizedPath = normalizeTemplatePagePath(routePath);
    if (!normalizedToken || !normalizedPath) return;
    if (!aliasMap.has(normalizedToken)) aliasMap.set(normalizedToken, normalizedPath);
  };

  setAlias("home", "/");
  setAlias("index", "/");
  setAlias("top", "/");

  for (const page of Array.isArray(sitePages) ? sitePages : []) {
    const routePath = normalizeTemplatePagePath(page?.path || "/");
    const routePathLocaleLess = stripLocalePrefix(routePath);
    const name = String(page?.name || "").trim();
    const leaf = routePath.split("/").filter(Boolean).pop() || "";
    const segmentTokens = routePath.split("/").filter(Boolean);
    const segmentTokensLocaleLess = routePathLocaleLess.split("/").filter(Boolean);
    setAlias(name, routePath);
    setAlias(routePath, routePath);
    setAlias(routePathLocaleLess, routePath);
    setAlias(leaf, routePath);
    for (const segment of segmentTokens) setAlias(segment, routePath);
    for (const segment of segmentTokensLocaleLess) setAlias(segment, routePath);
  }
  return aliasMap;
};

const rewriteAnchorHrefToRoute = (href, aliasMap, routeContext = {}) => {
  const raw = String(href || "").trim();
  if (!raw) return href;
  if (/^(javascript:|data:)/i.test(raw)) return href;
  if (raw.startsWith("#")) {
    const token = raw.slice(1).trim();
    if (!token) return "/";
    const lookup = slug(token);
    return aliasMap.get(lookup) || raw;
  }
  if (raw.startsWith("/")) {
    const normalizedPath = normalizeTemplatePagePath(raw);
    const aliased = aliasMap.get(slug(normalizedPath)) || aliasMap.get(slug(stripLocalePrefix(normalizedPath)));
    return aliased || normalizedPath;
  }
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      const inputHost = parsed.host.toLowerCase();
      const targetHost = String(routeContext?.siteHost || "").toLowerCase();
      if (targetHost && inputHost !== targetHost) return href;
      const normalizedPath = normalizeTemplatePagePath(parsed.pathname || "/");
      const aliased = aliasMap.get(slug(normalizedPath)) || aliasMap.get(slug(stripLocalePrefix(normalizedPath)));
      return aliased || normalizedPath;
    } catch {
      return href;
    }
  }
  if (/^\.{1,2}\//.test(raw)) return href;
  return href;
};

const rewriteAnchorLinksDeep = (value, aliasMap, routeContext = {}) => {
  if (Array.isArray(value)) return value.map((item) => rewriteAnchorLinksDeep(item, aliasMap, routeContext));
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === "href" && typeof v === "string") {
      out[k] = rewriteAnchorHrefToRoute(v, aliasMap, routeContext);
      continue;
    }
    out[k] = rewriteAnchorLinksDeep(v, aliasMap, routeContext);
  }
  return out;
};

const collectHrefRowsDeep = (value, scope = "$", rows = []) => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectHrefRowsDeep(item, `${scope}[${index}]`, rows));
    return rows;
  }
  if (!value || typeof value !== "object") return rows;
  for (const [key, next] of Object.entries(value)) {
    const nextScope = `${scope}.${key}`;
    if (key === "href" && typeof next === "string") {
      rows.push({ href: next, scope: nextScope });
      continue;
    }
    collectHrefRowsDeep(next, nextScope, rows);
  }
  return rows;
};

const buildLinkReport = ({ site = {}, specPack = {}, sitePages = [] }) => {
  const siteHost = (() => {
    try {
      return new URL(String(site?.url || "")).host.toLowerCase();
    } catch {
      return "";
    }
  })();
  const routePathSet = new Set(["/"]);
  for (const page of Array.isArray(sitePages) ? sitePages : []) {
    const normalized = normalizeTemplatePagePath(page?.path || "/");
    routePathSet.add(normalized);
    routePathSet.add(stripLocalePrefix(normalized));
  }

  const rows = [];
  const rootSpecs = specPack?.section_specs && typeof specPack.section_specs === "object" ? specPack.section_specs : {};
  for (const [sectionKind, entry] of Object.entries(rootSpecs)) {
    collectHrefRowsDeep(entry?.defaults || {}, `root.${sectionKind}`, rows);
  }
  const pageSpecs = Array.isArray(specPack?.page_specs) ? specPack.page_specs : [];
  for (const page of pageSpecs) {
    const pagePath = normalizeTemplatePagePath(page?.path || "/");
    const sections = page?.section_specs && typeof page.section_specs === "object" ? page.section_specs : {};
    for (const [sectionKind, entry] of Object.entries(sections)) {
      collectHrefRowsDeep(entry?.defaults || {}, `page:${pagePath}.${sectionKind}`, rows);
    }
  }

  const problems = [];
  let empty = 0;
  let invalidScheme = 0;
  let internalTotal = 0;
  let internalValid = 0;
  let internalMissing = 0;
  let externalTotal = 0;

  for (const row of rows) {
    const href = String(row.href || "").trim();
    if (!href) {
      empty += 1;
      problems.push({ type: "empty", scope: row.scope, href });
      continue;
    }
    if (/^(javascript:|data:)/i.test(href)) {
      invalidScheme += 1;
      problems.push({ type: "invalid_scheme", scope: row.scope, href });
      continue;
    }
    if (href.startsWith("#")) continue;
    if (href.startsWith("/")) {
      internalTotal += 1;
      const normalized = normalizeTemplatePagePath(href);
      const valid = routePathSet.has(normalized) || routePathSet.has(stripLocalePrefix(normalized));
      if (valid) internalValid += 1;
      else {
        internalMissing += 1;
        problems.push({ type: "internal_missing", scope: row.scope, href: normalized });
      }
      continue;
    }
    if (/^https?:\/\//i.test(href)) {
      try {
        const parsed = new URL(href);
        const host = parsed.host.toLowerCase();
        if (siteHost && host === siteHost) {
          internalTotal += 1;
          const normalized = normalizeTemplatePagePath(parsed.pathname || "/");
          const valid = routePathSet.has(normalized) || routePathSet.has(stripLocalePrefix(normalized));
          if (valid) internalValid += 1;
          else {
            internalMissing += 1;
            problems.push({ type: "internal_missing", scope: row.scope, href: normalized });
          }
        } else {
          externalTotal += 1;
        }
      } catch {
        externalTotal += 1;
      }
      continue;
    }
    externalTotal += 1;
  }

  const stats = {
    totalLinks: rows.length,
    internalTotal,
    internalValid,
    internalMissing,
    internalSuccessRate: internalTotal > 0 ? Number(((internalValid / internalTotal) * 100).toFixed(2)) : 100,
    externalTotal,
    empty,
    invalidScheme,
    passed: internalMissing === 0 && empty === 0 && invalidScheme === 0,
  };

  return {
    generatedAt: new Date().toISOString(),
    siteId: String(site?.id || ""),
    siteUrl: String(site?.url || ""),
    stats,
    problems: problems.slice(0, 500),
  };
};

const normalizeSectionKind = (value) => {
  const token = String(value || "")
    .trim()
    .toLowerCase();
  return SECTION_KINDS.includes(token) ? token : null;
};

const normalizeRequiredCategories = (value) =>
  (Array.isArray(value) ? value : [])
    .map((entry) => normalizeSectionKind(entry))
    .filter(Boolean);

const isObjectRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const TEMPLATE_VARIANT_META_KEYS = new Set([
  "blockType",
  "block_type",
  "componentName",
  "component_name",
  "defaults",
  "variantProps",
  "variant_props",
  "name",
  "description",
  "note",
]);

const normalizeTemplateVariantEntry = (value) => {
  if (typeof value === "string" && value.trim()) {
    return { blockType: value.trim(), defaults: {} };
  }
  if (!isObjectRecord(value)) return null;

  const blockTypeCandidates = [
    value.blockType,
    value.block_type,
    value.componentName,
    value.component_name,
  ];
  const blockType =
    blockTypeCandidates.find((entry) => typeof entry === "string" && entry.trim())?.trim() || "";

  const inlineDefaults = {};
  for (const [key, entry] of Object.entries(value)) {
    if (TEMPLATE_VARIANT_META_KEYS.has(key)) continue;
    if (entry === undefined) continue;
    inlineDefaults[key] = entry;
  }
  const defaultsFromWrapper =
    (isObjectRecord(value.defaults) && value.defaults) ||
    (isObjectRecord(value.variantProps) && value.variantProps) ||
    (isObjectRecord(value.variant_props) && value.variant_props) ||
    {};
  const defaults = { ...inlineDefaults, ...defaultsFromWrapper };

  if (!blockType && !Object.keys(defaults).length) return null;
  return { blockType, defaults };
};

const normalizeTemplateVariantEntries = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeTemplateVariantEntry(entry))
      .filter((entry) => Boolean(entry));
  }
  const single = normalizeTemplateVariantEntry(value);
  return single ? [single] : [];
};

const resolveTemplateVariantRuleSources = (site) => {
  const specialRules = isObjectRecord(site?.specialRules) ? site.specialRules : {};
  const globalRules =
    (isObjectRecord(specialRules.templateBlockVariants) && specialRules.templateBlockVariants) ||
    (isObjectRecord(specialRules.template_block_variants) && specialRules.template_block_variants) ||
    {};
  const pageRules =
    (isObjectRecord(specialRules.pageTemplateBlockVariants) && specialRules.pageTemplateBlockVariants) ||
    (isObjectRecord(specialRules.page_template_block_variants) && specialRules.page_template_block_variants) ||
    {};

  return { globalRules, pageRules };
};

const findPageTemplateVariantRules = (pageRules, currentPath = "/") => {
  if (!isObjectRecord(pageRules)) return null;
  const normalizedPath = normalizeTemplatePagePath(currentPath || "/");
  let wildcard = null;
  for (const [rulePath, ruleSet] of Object.entries(pageRules)) {
    if (!isObjectRecord(ruleSet)) continue;
    const token = String(rulePath || "").trim();
    if (token === "*") {
      wildcard = ruleSet;
      continue;
    }
    if (normalizeTemplatePagePath(token) === normalizedPath) {
      return ruleSet;
    }
  }
  return wildcard;
};

const resolveSectionSpecForSiteVariant = ({ site, kind, baseSpec, currentPath = "/" }) => {
  const fallback = {
    blockType: String(baseSpec?.blockType || ""),
    defaults: { ...(baseSpec?.defaults || {}) },
    variantScopes: [],
    variantCandidates: [],
  };
  if (!fallback.blockType) return fallback;

  const { globalRules, pageRules } = resolveTemplateVariantRuleSources(site);
  const normalizedPath = normalizeTemplatePagePath(currentPath || "/");
  const pageRuleSet = findPageTemplateVariantRules(pageRules, normalizedPath);
  const scopes = [];
  const overrideDefaults = {};
  let overrideBlockType = "";
  const variantCandidates = [];
  const candidateKeys = new Set();

  const pushVariantCandidate = (candidate) => {
    if (!isObjectRecord(candidate)) return;
    const blockType = typeof candidate.block_type === "string" ? candidate.block_type.trim() : "";
    if (!blockType) return;
    const defaults = isObjectRecord(candidate.defaults) ? candidate.defaults : {};
    const source = typeof candidate.source === "string" ? candidate.source.trim() : "";
    const rank = Number.isFinite(candidate.rank) ? Number(candidate.rank) : undefined;
    const description = typeof candidate.description === "string" ? candidate.description.trim() : "";
    const key = `${blockType}:${JSON.stringify(defaults)}`;
    if (candidateKeys.has(key)) return;
    candidateKeys.add(key);
    variantCandidates.push({
      block_type: blockType,
      defaults,
      ...(source ? { source } : {}),
      ...(Number.isFinite(rank) ? { rank } : {}),
      ...(description ? { description } : {}),
    });
  };

  const applyRuleSet = (ruleSet, scopeLabel) => {
    if (!isObjectRecord(ruleSet)) return;
    const entries = normalizeTemplateVariantEntries(ruleSet[kind]);
    if (!entries.length) return;
    const primary = entries[0];
    if (primary.blockType) overrideBlockType = primary.blockType;
    if (primary.defaults && Object.keys(primary.defaults).length) {
      Object.assign(overrideDefaults, primary.defaults);
    }
    for (const [index, entry] of entries.entries()) {
      pushVariantCandidate({
        block_type: entry.blockType || fallback.blockType,
        defaults: entry.defaults || {},
        source: scopeLabel,
        rank: index + 1,
      });
    }
    scopes.push(scopeLabel);
  };

  applyRuleSet(globalRules, "global");
  applyRuleSet(pageRuleSet, `page:${normalizedPath}`);

  if (!scopes.length) return fallback;
  const selectedBlockType = overrideBlockType || fallback.blockType;
  const selectedDefaults = { ...fallback.defaults, ...overrideDefaults };
  const registryAlternatives = getAlternativeVariants(kind, selectedBlockType, selectedDefaults).slice(0, 8);
  for (const [index, alt] of registryAlternatives.entries()) {
    pushVariantCandidate({
      block_type: alt.blockType,
      defaults: alt.variantProps || {},
      source: "registry_alternative",
      rank: index + 1,
      description: alt.description || "",
    });
  }
  return {
    blockType: selectedBlockType,
    defaults: selectedDefaults,
    variantScopes: scopes,
    variantCandidates,
  };
};

const buildTemplateVariantMeta = (resolvedSpec) => {
  const scopes = Array.isArray(resolvedSpec?.variantScopes) ? resolvedSpec.variantScopes.filter(Boolean) : [];
  const candidates = Array.isArray(resolvedSpec?.variantCandidates)
    ? resolvedSpec.variantCandidates.filter((entry) => isObjectRecord(entry))
    : [];
  if (!scopes.length && !candidates.length) return null;
  return {
    ...(scopes.length ? { scopes } : {}),
    ...(candidates.length ? { candidates } : {}),
  };
};

/**
 * Build a synthetic page summary from the page name/path when no crawl data
 * is available. This prevents every uncrawled page from inheriting the
 * homepage h1/h2 verbatim.
 */
const buildSyntheticPageSummary = (page, globalSummary) => {
  const pageName = String(page?.name || "").trim() || formatTemplatePageName(page?.path || "/");
  const globalTitle = String(globalSummary?.title || "").split(/[|•·]/)[0].trim();
  const brandName = globalTitle || "Site";
  return {
    ...globalSummary,
    title: `${pageName} | ${brandName}`,
    h1: [pageName],
    h2: [
      `Explore ${pageName} solutions`,
      `Learn more about ${pageName}`,
      `${pageName} overview`,
    ],
    // Keep global images/footerLinks/navMenuDepth for layout consistency
    heroPresentation: normalizeHeroPresentation({ mode: "split", hasHeading: true, hasForegroundImage: false, hasBackgroundImage: false }),
    heroCarousel: normalizeHeroCarousel(null),
  };
};

const buildPageSpecsFromSitePages = ({
  site,
  recipe,
  summary,
  assets = {},
  sitePages = [],
  crawlAssetPack = null,
  discoveryPolicy = null,
}) => {
  const routeAliasMap = buildRouteAliasMap(sitePages);
  const routeContext = {
    siteHost: (() => {
      try {
        return new URL(String(site?.url || "")).host || "";
      } catch {
        return "";
      }
    })(),
  };
  const crawledPages = Array.isArray(crawlAssetPack?.pages) ? crawlAssetPack.pages : [];
  const pageAssetMap = new Map(
    crawledPages.map((page) => [
      normalizeTemplatePagePath(page?.path || "/"),
      page,
    ])
  );
  const homeFallbackPath = normalizeTemplatePagePath(crawlAssetPack?.homePath || "/");
  const homeFallbackAsset = pageAssetMap.get(homeFallbackPath) || crawledPages[0] || null;

  return sitePages
    .map((page) => {
      const path = normalizeTemplatePagePath(page?.path || "/");
      const requiredCategories = normalizeRequiredCategories(page?.required_categories);
      if (!requiredCategories.length) return null;
      const pageAsset = pageAssetMap.get(path) || (path === "/" ? homeFallbackAsset : null);
      // For pages with crawl data, merge with global summary.
      // For uncrawled pages, build a synthetic summary from the page name
      // instead of falling back to the homepage content.
      const pageSummary = pageAsset?.summary
        ? { ...summary, ...pageAsset.summary }
        : (path === "/" ? summary : buildSyntheticPageSummary(page, summary));
      const pageAssets = pageAsset?.assetContext || assets || {};
      const sectionSpecs = {};
      for (const kind of requiredCategories) {
        const spec = recipe?.sectionSpecs?.[kind];
        if (!spec) continue;
        const resolvedSpec = resolveSectionSpecForSiteVariant({
          site,
          kind,
          baseSpec: spec,
          currentPath: path,
        });
        const variantMeta = buildTemplateVariantMeta(resolvedSpec);
        sectionSpecs[kind] = {
          block_type: resolvedSpec.blockType,
          defaults: buildSectionDefaults(kind, resolvedSpec, site, pageSummary, pageAssets, recipe, {
            currentPath: path,
            sitePages,
            discoveryPolicy,
          }),
          ...(variantMeta ? { template_variant: variantMeta } : {}),
        };
      }
      for (const kind of Object.keys(sectionSpecs)) {
        const entry = sectionSpecs[kind];
        if (!entry?.defaults || typeof entry.defaults !== "object") continue;
        entry.defaults = rewriteAnchorLinksDeep(entry.defaults, routeAliasMap, routeContext);
      }
      if (!Object.keys(sectionSpecs).length) return null;

      return {
        path,
        name: String(page?.name || "").trim() || formatTemplatePageName(path),
        source_url: String(pageAsset?.url || "").trim(),
        required_categories: requiredCategories,
        summary: {
          title: String(pageSummary?.title || "").trim(),
          h1: Array.isArray(pageSummary?.h1) ? pageSummary.h1 : [],
          h2: Array.isArray(pageSummary?.h2) ? pageSummary.h2 : [],
          links: Array.isArray(pageSummary?.links) ? pageSummary.links : [],
          images: Array.isArray(pageSummary?.images) ? pageSummary.images : [],
          footerLinks: dedupeLinkItems(Array.isArray(pageSummary?.footerLinks) ? pageSummary.footerLinks : [], 24),
          navMenuDepth: Number(pageSummary?.navMenuDepth || 1),
          heroPresentation: normalizeHeroPresentation(pageSummary?.heroPresentation),
          heroCarousel: normalizeHeroCarousel(pageSummary?.heroCarousel),
        },
        page_assets: {
          desktop_url: String(pageAssets?.desktopUrl || "").trim(),
          mobile_url: String(pageAssets?.mobileUrl || "").trim(),
          source_images: dedupeUrls(
            Array.isArray(pageAssets?.sourceImages) ? pageAssets.sourceImages : pageSummary?.images || [],
            24
          ),
        },
        section_specs: sectionSpecs,
      };
    })
    .filter(Boolean);
};

const buildSpecPack = ({ site, recipe, summary, assets = {}, crawl = null, crawlAssetPack = null, options = {} }) => {
  const discoveryPolicy = resolveDiscoveryPolicy({ site, options });
  const generatedSitePages = buildSitePagesFromCrawl({ recipe, summary, crawl, discoveryPolicy });
  const specialRuleResult = applySiteSpecialRulesToPages({
    site,
    pages: generatedSitePages,
    crawl,
  });
  const successfulPathSet = new Set(
    (Array.isArray(crawl?.pages) ? crawl.pages : [])
      .filter((page) => page && !page.error && Number(page.status || 0) < 500)
      .map((page) => routePathFromUrl(page.url))
  );
  const sitePages = Array.isArray(specialRuleResult?.pages) ? specialRuleResult.pages : generatedSitePages;
  const extractionFailures = [
    ...(Array.isArray(specialRuleResult?.failed) ? specialRuleResult.failed : []),
    ...sitePages
      .filter((page) => page?.path && page.path !== "/" && !successfulPathSet.has(normalizeTemplatePagePath(page.path)))
      .map((page) => ({
        path: normalizeTemplatePagePath(page.path),
        reason: "excluded_not_extracted",
        url: "",
        source: "special_rule",
      })),
  ].filter((row, index, arr) => arr.findIndex((x) => `${x.path}:${x.reason}` === `${row.path}:${row.reason}`) === index);

  const filteredSitePages = sitePages.filter((page) => {
    if (!page?.path) return false;
    const normalizedPath = normalizeTemplatePagePath(page.path);
    if (normalizedPath === "/") return true;
    return successfulPathSet.has(normalizedPath);
  });
  const sectionSpecs = {};
  for (const kind of SECTION_KINDS) {
    const spec = recipe.sectionSpecs[kind];
    if (!spec) continue;
    const resolvedSpec = resolveSectionSpecForSiteVariant({
      site,
      kind,
      baseSpec: spec,
      currentPath: "/",
    });
    const variantMeta = buildTemplateVariantMeta(resolvedSpec);
    sectionSpecs[kind] = {
      block_type: resolvedSpec.blockType,
      defaults: buildSectionDefaults(kind, resolvedSpec, site, summary, assets, recipe, {
        currentPath: "/",
        sitePages,
        discoveryPolicy,
      }),
      ...(variantMeta ? { template_variant: variantMeta } : {}),
    };
  }
  const routeAliasMap = buildRouteAliasMap(filteredSitePages);
  const routeContext = {
    siteHost: (() => {
      try {
        return new URL(String(site?.url || "")).host || "";
      } catch {
        return "";
      }
    })(),
  };
  for (const kind of Object.keys(sectionSpecs)) {
    const entry = sectionSpecs[kind];
    if (!entry?.defaults || typeof entry.defaults !== "object") continue;
    entry.defaults = rewriteAnchorLinksDeep(entry.defaults, routeAliasMap, routeContext);
  }
  const pageSpecs = buildPageSpecsFromSitePages({
    site,
    recipe,
    summary,
    assets,
    sitePages: filteredSitePages,
    crawlAssetPack,
    discoveryPolicy,
  });
  const normalizedPageSpecs = enforceDistinctHeroes(pageSpecs);
  const linkReport = buildLinkReport({
    site,
    sitePages: filteredSitePages,
    specPack: {
      section_specs: sectionSpecs,
      page_specs: normalizedPageSpecs,
    },
  });

  return {
    template_id: `auto_${site.id}`,
    recipe_id: recipe.id,
    section_specs: sectionSpecs,
    fallback_rules: {
      missing_socialproof: "use_testimonials_grid_min_2",
      missing_cta_secondary: "hide_secondary_button",
    },
    density_limits: {
      nav_items_max: 6,
      hero_cta_max: 2,
      testimonials_min: 2,
      cards_max: 8,
    },
    required_categories: recipe.requiredCategories,
    ...(filteredSitePages.length ? { site_pages: filteredSitePages } : {}),
    ...(normalizedPageSpecs.length ? { page_specs: normalizedPageSpecs } : {}),
    link_integrity: linkReport.stats,
    ...(extractionFailures.length ? { extraction_failures: extractionFailures } : {}),
    ...(Array.isArray(specialRuleResult?.notes) && specialRuleResult.notes.length
      ? { special_notes: specialRuleResult.notes }
      : {}),
  };
};

const specPackToStyleProfile = ({ site, indexCard, specPack }) => {
  const templates = {};
  for (const kind of Object.keys(specPack.section_specs || {})) {
    const entry = specPack.section_specs[kind];
    if (!entry?.block_type || !entry?.defaults) continue;
    templates[kind] = {
      type: entry.block_type,
      props: entry.defaults,
    };
  }
  const pageSpecs = Array.isArray(specPack?.page_specs)
    ? specPack.page_specs
        .map((page) => {
          const path = normalizeTemplatePagePath(page?.path || "/");
          const name = String(page?.name || "").trim() || formatTemplatePageName(path);
          const requiredCategories = normalizeRequiredCategories(page?.required_categories);
          if (!requiredCategories.length) return null;
          const pageTemplates = {};
          const pageSectionSpecs = page?.section_specs && typeof page.section_specs === "object" ? page.section_specs : {};
          for (const kind of Object.keys(pageSectionSpecs || {})) {
            const normalizedKind = normalizeSectionKind(kind);
            const entry = pageSectionSpecs?.[kind];
            if (!normalizedKind || !entry?.block_type || !entry?.defaults) continue;
            pageTemplates[normalizedKind] = {
              type: entry.block_type,
              props: entry.defaults,
            };
          }
          for (const kind of requiredCategories) {
            if (pageTemplates[kind] || !templates[kind]) continue;
            pageTemplates[kind] = JSON.parse(JSON.stringify(templates[kind]));
          }
          return {
            path,
            name,
            requiredCategories,
            templates: pageTemplates,
          };
        })
        .filter(Boolean)
    : [];

  const siteTemplates = Array.isArray(specPack?.site_pages)
    ? specPack.site_pages
        .map((page) => {
          const path = normalizeTemplatePagePath(page?.path || "/");
          const name = String(page?.name || "").trim() || formatTemplatePageName(path);
          const requiredCategories = normalizeRequiredCategories(page?.required_categories);
          if (!requiredCategories.length) return null;
          return { path, name, requiredCategories };
        })
        .filter(Boolean)
    : pageSpecs.map((page) => ({
        path: page.path,
        name: page.name,
        requiredCategories: page.requiredCategories,
      }));

  return {
    id: indexCard.template_id,
    name: site.description || site.id,
    keywords: unique([
      ...(indexCard.keywords?.length ? indexCard.keywords : [site.id]),
      buildProfileSelectorToken(indexCard.template_id || site.id),
      indexCard.template_id,
      site.id,
    ]),
    templates,
    ...(pageSpecs.length ? { pageSpecs } : {}),
    ...(siteTemplates.length ? { siteTemplates } : {}),
  };
};

const profileNumericField = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const computeCoverageScore = (specPack) => {
  const sitePages = Array.isArray(specPack?.site_pages) ? specPack.site_pages : [];
  const pageSpecs = Array.isArray(specPack?.page_specs) ? specPack.page_specs : [];
  const coverageRate = sitePages.length > 0 ? Math.min(100, (pageSpecs.length / sitePages.length) * 100) : pageSpecs.length > 0 ? 100 : 0;
  const roleKinds = new Set();
  for (const page of sitePages) {
    const pagePath = normalizeTemplatePagePath(page?.path || "/");
    const role = classifyTemplatePageType(pagePath, String(page?.name || ""));
    if (role === "home" || role === "contact") roleKinds.add(role);
    if (role === "products" || role === "services" || role === "blog") roleKinds.add("listing");
    if (pagePath !== "/" && pagePath.split("/").filter(Boolean).length >= 2) roleKinds.add("detail");
  }
  const roleScore = (roleKinds.size / 4) * 100;
  return Number((coverageRate * 0.7 + roleScore * 0.3).toFixed(2));
};

const computeLinkIntegrityScore = (linkReport = null, specPack = null) => {
  const stats = linkReport?.stats || specPack?.link_integrity || null;
  if (!stats) return 0;
  const internalSuccess = Number(stats.internalSuccessRate || 0);
  const emptyPenalty = Math.max(0, Number(stats.empty || 0)) * 2;
  const invalidPenalty = Math.max(0, Number(stats.invalidScheme || 0)) * 5;
  const missingPenalty = Math.max(0, Number(stats.internalMissing || 0)) * 2;
  const raw = internalSuccess - emptyPenalty - invalidPenalty - missingPenalty;
  return Number(Math.max(0, Math.min(100, raw)).toFixed(2));
};

const computeQualityScore = ({ coverageScore, linkIntegrityScore, fidelitySimilarity }) => {
  const coverage = profileNumericField(coverageScore);
  const link = profileNumericField(linkIntegrityScore);
  const fidelity = profileNumericField(fidelitySimilarity, NaN);
  if (!Number.isFinite(fidelity)) {
    return Number((coverage * 0.55 + link * 0.45).toFixed(2));
  }
  return Number((fidelity * 0.55 + coverage * 0.25 + link * 0.2).toFixed(2));
};

const mergeProfiles = (existingProfiles, incomingProfiles) => {
  const map = new Map();
  for (const profile of existingProfiles || []) {
    if (!profile?.id) continue;
    map.set(String(profile.id), profile);
  }
  for (const profile of incomingProfiles || []) {
    if (!profile?.id) continue;
    const id = String(profile.id);
    const current = map.get(id);
    if (!current) {
      map.set(id, profile);
      continue;
    }
    const currentQuality = profileNumericField(current?.qualityScore, -1);
    const nextQuality = profileNumericField(profile?.qualityScore, -1);
    if (nextQuality > currentQuality) {
      map.set(id, profile);
      continue;
    }
    if (nextQuality < currentQuality) {
      continue;
    }
    const currentCreated = Date.parse(String(current?.createdAt || "")) || 0;
    const nextCreated = Date.parse(String(profile?.createdAt || "")) || 0;
    if (nextCreated >= currentCreated) {
      map.set(id, profile);
    }
  }
  return Array.from(map.values());
};

const buildRunLibraryOutput = ({
  processed = [],
  runId = "",
  manifestPath = "",
  fidelityRows = [],
  templateExclusiveComponents = [],
}) => {
  const fidelityByCase = new Map(
    (Array.isArray(fidelityRows) ? fidelityRows : []).map((row) => [String(row?.caseId || ""), row])
  );
  const profiles = (Array.isArray(processed) ? processed : []).map((item) => {
    const caseId = String(item?.site?.id || "");
    const fidelityRow = fidelityByCase.get(caseId) || null;
    const fidelitySimilarity = parseSimilarityNumber(fidelityRow?.similarity);
    const coverageScore = computeCoverageScore(item?.specPack);
    const linkIntegrityScore = computeLinkIntegrityScore(item?.linkReport, item?.specPack);
    const qualityScore = computeQualityScore({
      coverageScore,
      linkIntegrityScore,
      fidelitySimilarity,
    });
    const sourceDomain = hostFromUrl(item?.site?.url || "");
    const metadata = {
      qualityScore,
      coverageScore,
      linkIntegrityScore,
      sourceDomain,
      version: `run-${runId}`,
      createdAt: new Date().toISOString(),
    };
    const sanitizedSite = rewriteBrandTextDeep(item.site || {});
    const profile = rewriteBrandTextDeep(
      specPackToStyleProfile({
        site: sanitizedSite,
        indexCard: item.indexCard,
        specPack: item.specPack,
      })
    );
    const enriched = {
      ...profile,
      ...metadata,
    };
    item.styleProfile = enriched;
    item.assetScores = metadata;
    return enriched;
  });

  return {
    generatedAt: new Date().toISOString(),
    runId,
    manifestPath,
    profileCount: profiles.length,
    profiles,
    templateExclusiveComponents: templateExclusiveComponents.map((component) => ({
      name: component.name,
      kebabName: component.kebabName,
      defaultProps: component.defaultProps,
      templateExclusive: component.templateExclusive,
    })),
  };
};

const mergeAndPublishRunLibrary = async ({
  runLibrary,
  allowPublish,
  runId,
}) => {
  if (!allowPublish) {
    return {
      publishPath: "",
      publishTemplateExclusiveComponentsPath: "",
      published: false,
      reason: "publish_disabled_or_blocked",
    };
  }

  let existingProfiles = [];
  let existingTemplateExclusiveComponents = [];
  try {
    const raw = await fs.readFile(DEFAULT_PUBLISH_PATH, "utf8");
    const parsed = JSON.parse(raw);
    existingProfiles = Array.isArray(parsed?.profiles) ? parsed.profiles : [];
    existingTemplateExclusiveComponents = Array.isArray(parsed?.templateExclusiveComponents)
      ? parsed.templateExclusiveComponents
      : [];
  } catch {
    existingProfiles = [];
    existingTemplateExclusiveComponents = [];
  }

  const mergedProfiles = mergeProfiles(existingProfiles, runLibrary.profiles);
  const mergedTemplateExclusiveComponents = mergeTemplateExclusiveComponents(
    existingTemplateExclusiveComponents,
    runLibrary.templateExclusiveComponents
  );
  const published = {
    generatedAt: new Date().toISOString(),
    sourceRunId: runId,
    profileCount: mergedProfiles.length,
    profiles: mergedProfiles,
    templateExclusiveComponentCount: mergedTemplateExclusiveComponents.length,
    templateExclusiveComponents: mergedTemplateExclusiveComponents,
  };
  await fs.writeFile(DEFAULT_PUBLISH_PATH, JSON.stringify(published, null, 2));
  let publishTemplateExclusiveComponentsPath = "";
  if (mergedTemplateExclusiveComponents.length) {
    publishTemplateExclusiveComponentsPath = path.join(LIB_DIR, "template-exclusive-components.generated.json");
    await fs.writeFile(
      publishTemplateExclusiveComponentsPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          sourceRunId: runId,
          count: mergedTemplateExclusiveComponents.length,
          components: mergedTemplateExclusiveComponents,
        },
        null,
        2
      )
    );
  }
  return {
    publishPath: DEFAULT_PUBLISH_PATH,
    publishTemplateExclusiveComponentsPath,
    published: true,
    reason: "ok",
  };
};

const toRequiredCategories = (specPack) =>
  Array.isArray(specPack?.required_categories) ? specPack.required_categories.filter(Boolean) : [];

const toSiteRoutes = (specPack) => {
  const fromPageSpecs = Array.isArray(specPack?.page_specs)
    ? specPack.page_specs.map((page) => normalizeTemplatePagePath(page?.path || "/"))
    : [];
  const fromSitePages = Array.isArray(specPack?.site_pages)
    ? specPack.site_pages.map((page) => normalizeTemplatePagePath(page?.path || "/"))
    : [];
  return unique([...fromPageSpecs, ...fromSitePages]).slice(0, 16);
};

const buildProfileSelectorToken = (value) => {
  const token = slug(String(value || "").trim());
  return token ? `profile_selector_${token}` : "profile_selector_default";
};

const hostFromUrl = (value) => {
  try {
    return new URL(String(value || "").trim()).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
};

const buildRouteBlueprint = (specPack) => {
  const pages = Array.isArray(specPack?.page_specs) ? specPack.page_specs : [];
  if (!pages.length) return "";
  const lines = pages
    .slice(0, 12)
    .map((page) => {
      const path = normalizeTemplatePagePath(page?.path || "/");
      const kinds = normalizeRequiredCategories(page?.required_categories);
      if (!kinds.length) return "";
      return `${path}: ${kinds.join(" > ")}`;
    })
    .filter(Boolean);
  return lines.join("; ");
};

const buildPageContentBlueprint = (specPack) => {
  const pages = Array.isArray(specPack?.page_specs) ? specPack.page_specs : [];
  if (!pages.length) return "";
  return pages
    .slice(0, 10)
    .map((page) => {
      const path = normalizeTemplatePagePath(page?.path || "/");
      const name = String(page?.name || "").trim() || formatTemplatePageName(path);
      const heroTitle = String(page?.section_specs?.hero?.defaults?.title || "").replace(/\s+/g, " ").trim();
      const heroSubtitle = String(page?.section_specs?.hero?.defaults?.subtitle || "").replace(/\s+/g, " ").trim();
      return `${path} => ${name}${heroTitle ? ` | hero: ${heroTitle}` : ""}${heroSubtitle ? ` | sub: ${heroSubtitle}` : ""}`;
    })
    .join("; ");
};

const extractImageVisualSignature = async (imagePath) => {
  if (!imagePath) return null;
  try {
    const cmd = `python3 - <<'PY'
import json
from PIL import Image, ImageStat
path = ${JSON.stringify(imagePath)}
img = Image.open(path).convert("RGB").resize((320, 320))
palette_img = img.convert("P", palette=Image.ADAPTIVE, colors=6).convert("RGB")
colors = palette_img.getcolors(320 * 320) or []
colors = sorted(colors, key=lambda x: x[0], reverse=True)[:6]
hexes = []
for count, rgb in colors:
    hexes.append("#%02x%02x%02x" % rgb)
stat = ImageStat.Stat(img)
mean = stat.mean if stat.mean else [0,0,0]
luminance = (0.2126 * mean[0] + 0.7152 * mean[1] + 0.0722 * mean[2]) / 255.0
print(json.dumps({
  "dominantColors": hexes,
  "luminance": round(float(luminance), 4),
  "isDark": bool(luminance < 0.5)
}))
PY`;
    const { stdout } = await runShell(cmd, { cwd: ROOT });
    const parsed = JSON.parse(String(stdout || "").trim());
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

const buildRepairHint = (repairContext) => {
  if (!repairContext || typeof repairContext !== "object") return "";
  const attempt = Number(repairContext.attempt || 0);
  const similarity = Number(repairContext.similarity);
  const threshold = Number(repairContext.threshold);
  const gap = Number(repairContext.gap);
  const parts = [];
  if (attempt > 0) parts.push(`Repair attempt #${attempt}.`);
  if (Number.isFinite(similarity) && Number.isFinite(threshold)) {
    parts.push(`Previous similarity=${similarity.toFixed(2)}; target>=${threshold.toFixed(2)}.`);
  }
  if (Number.isFinite(gap) && gap > 0) parts.push(`Close at least ${gap.toFixed(2)} points.`);

  // Section-level repair hints
  const sectionHints = Array.isArray(repairContext.sectionHints) ? repairContext.sectionHints : [];
  if (sectionHints.length) {
    parts.push("Per-section issues:");
    for (const hint of sectionHints.slice(0, 6)) {
      const sim = typeof hint.similarity === "number" ? ` (similarity=${hint.similarity.toFixed(1)})` : "";
      parts.push(`  - ${hint.sectionType || hint.sectionKind}${sim}: ${hint.issue || "low fidelity, try alternative variant or custom component"}`);
    }
  }
  const issueSummary = repairContext?.issueSummary && typeof repairContext.issueSummary === "object" ? repairContext.issueSummary : {};
  const layoutCount = Number(issueSummary.layout || 0);
  const colorCount = Number(issueSummary.color || 0);
  const copyDensityCount = Number(issueSummary.copy_density || 0);
  if (layoutCount > 0 || colorCount > 0 || copyDensityCount > 0) {
    parts.push(
      `Failure categories: layout=${layoutCount}, color=${colorCount}, copy_density=${copyDensityCount}.`
    );
  }
  if (layoutCount > 0) {
    parts.push("Layout repair priority: restore section order, hero/nav/footer hierarchy, and spacing rhythm to match source.");
  }
  if (colorCount > 0) {
    parts.push("Color repair priority: align dominant palette, contrast, and surface accents to source screenshot mood.");
  }
  if (copyDensityCount > 0) {
    parts.push("Copy-density repair priority: align heading length, paragraph density, and CTA count with source.");
  }

  parts.push(
    "Preserve route structure, but tighten spacing scale, color tokens, typography weight, and hero/image composition toward source.",
    "Generate custom React components for sections that don't match well with standard blocks. Ensure all text content is passed via props for Puck editor editability."
  );
  return parts.join(" ");
};

const buildRegressionPrompt = ({ site, indexCard, specPack, summary, visualSignature = null, repairContext = null }) => {
  const basePrompt = site.prompt || site.description || `Generate homepage for ${site.id}`;
  const host = hostFromUrl(site.url);
  const routes = toSiteRoutes(specPack);
  const routeBlueprint = buildRouteBlueprint(specPack);
  const pageBlueprint = buildPageContentBlueprint(specPack);
  const selectorToken = buildProfileSelectorToken(indexCard?.template_id || site.id);
  const routeLine =
    routes.length > 1
      ? `Build a multi-page site with routes: ${routes.join(", ")}. Keep navigation and CTA links using these routes (not only hash anchors).`
      : "Build the homepage first, with production-ready sections and coherent brand style.";
  const pageCountLine = routes.length > 1 ? `Total routes to realize: ${routes.length}.` : "";
  const blueprintLine = routeBlueprint ? `Route section blueprint: ${routeBlueprint}.` : "";
  const identityHints = unique(
    [site.id, host, indexCard?.template_id, indexCard?.source?.title]
      .map((item) => String(item || "").trim())
      .filter(Boolean)
  );
  const hintLine = identityHints.length
    ? `Template identity hints: ${identityHints.join(" | ")}.`
    : "";
  const hostToken = hostFromUrl(site.url);
  const isAudezeHost = /(^|\.)audeze\.com$/i.test(hostToken);
  const navDepth = Number(summary?.navMenuDepth || 1);
  const heroMode = normalizeHeroPresentation(summary?.heroPresentation)?.mode;
  const hasHeroCarousel =
    Boolean(summary?.heroCarousel?.enabled) &&
    Array.isArray(summary?.heroCarousel?.images) &&
    summary.heroCarousel.images.length >= 2;

  // Build per-section spec hints for higher fidelity generation
  const sectionSpecs = specPack?.section_specs && typeof specPack.section_specs === "object" ? specPack.section_specs : {};
  const sectionSpecLines = Object.entries(sectionSpecs)
    .slice(0, 10)
    .map(([kind, spec]) => {
      if (!spec?.block_type) return "";
      const defaults = spec.defaults || {};
      const variant = defaults.variant ? ` variant=${defaults.variant}` : "";
      const bg = defaults.background ? ` bg=${defaults.background}` : "";
      const title = defaults.title ? ` title="${String(defaults.title).slice(0, 60)}"` : "";
      const itemCount = Array.isArray(defaults.items) ? ` items=${defaults.items.length}` : "";
      return `  ${kind}: ${spec.block_type}${variant}${bg}${title}${itemCount}`;
    })
    .filter(Boolean);
  const sectionSpecBlock = sectionSpecLines.length
    ? `Section specifications (match these exactly):\n${sectionSpecLines.join("\n")}`
    : "";

  // Build alternative variant hints from registry
  const alternativeHints = Object.entries(sectionSpecs)
    .slice(0, 8)
    .map(([kind, spec]) => {
      if (!spec?.block_type) return "";
      const alts = getAlternativeVariants(kind, spec.block_type);
      if (!alts.length) return "";
      const altNames = alts.slice(0, 4).map((a) => `${a.blockType}(${Object.entries(a.variantProps || {}).map(([k, v]) => `${k}=${v}`).join(",") || "default"})`).join(", ");
      return `  ${kind}: alternatives=[${altNames}]`;
    })
    .filter(Boolean);
  const alternativeBlock = alternativeHints.length
    ? `If a section doesn't match the source well, consider these alternatives:\n${alternativeHints.join("\n")}`
    : "";

  const visualHints = [
    `Style constraints: palette=${String(indexCard?.palette_profile || "").trim() || "source-driven"}, typography=${String(
      indexCard?.typography_signature || ""
    ).trim() || "source-driven"}.`,
    `Layout motifs: ${Array.isArray(indexCard?.layout_patterns) ? indexCard.layout_patterns.slice(0, 8).join(", ") : ""}.`,
    Array.isArray(summary?.h1) && summary.h1.length ? `Primary copy cues (H1): ${summary.h1.slice(0, 4).join(" | ")}.` : "",
    Array.isArray(summary?.h2) && summary.h2.length ? `Secondary copy cues (H2): ${summary.h2.slice(0, 6).join(" | ")}.` : "",
    pageBlueprint ? `Per-page copy blueprint: ${pageBlueprint}` : "",
    visualSignature?.dominantColors?.length
      ? `Source visual fingerprint: dominant colors=${visualSignature.dominantColors.join(", ")}, luminance=${String(
          visualSignature.luminance
        )}, darkTheme=${String(Boolean(visualSignature.isDark))}.`
      : "",
    navDepth > 1
      ? "Navigation structure requirement: build multi-level menu (dropdown/mega-menu) with visible child links, not flat single-level nav."
      : "",
    heroMode === "background_text"
      ? "Hero structure requirement: use background-image + text overlay composition first (not a plain split with detached card)."
      : "",
    hasHeroCarousel
      ? "Hero interaction requirement: if source hero rotates, implement hero carousel/slide switching with source-like images."
      : "",
    /(^|\.)siemens\.com$/i.test(hostToken)
      ? "Brand palette requirement: deep navy + cyan + white (avoid generic grayscale or random accent colors)."
      : "",
    isAudezeHost
      ? "Audeze extraction constraints: keep multi-level dropdown navigation and preserve menu children; support image+text style menu cues in nav content model."
      : "",
    isAudezeHost
      ? "Audeze extraction constraints: include one representative product detail page for display only; do NOT include cart/checkout/e-commerce actions."
      : "",
    isAudezeHost
      ? "Audeze extraction constraints: technology/blog routes should use markdown-friendly content flow (article-like structure)."
      : "",
    isAudezeHost
      ? "Audeze extraction constraints: support routes are content-only; remove download workflows and executable/file-download interactions."
      : "",
    sectionSpecBlock,
    alternativeBlock,
    buildRepairHint(repairContext),
  ]
    .filter(Boolean)
    .join("\n");
  return [
    `Template selector token: ${selectorToken}.`,
    basePrompt,
    routeLine,
    pageCountLine,
    blueprintLine,
    hintLine,
    visualHints,
    "Match the source site with high fidelity: theme colors, section ordering, copy tone, spacing rhythm, and block hierarchy should closely follow source references.",
    "Generate custom React components when needed to achieve pixel-accurate section rendering. All text content must be passed via props for Puck editor editability.",
  ]
    .filter(Boolean)
    .join("\n");
};

const runRegression = async ({
  runDir,
  sites,
  renderer,
  groups,
  maxCases,
  regressionTimeoutMs,
  attempt = 0,
  repairContextByCase = new Map(),
}) => {
  const promptsPath = path.join(runDir, attempt > 0 ? `regression-prompts.attempt-${attempt}.json` : "regression-prompts.json");
  const payload = {
    version: "1.0.0",
    cases: sites.map((item) => ({
      id: item.site.id,
      description: item.site.description || item.site.id,
      requiredCategories: toRequiredCategories(item.specPack),
      routes: toSiteRoutes(item.specPack),
      prompt: buildRegressionPrompt({
        site: item.site,
        indexCard: item.indexCard,
        specPack: item.specPack,
        summary: item.summary,
        visualSignature: item.visualSignature || null,
        repairContext: repairContextByCase.get(String(item.site?.id || "")) || null,
      }),
    })),
  };
  await fs.writeFile(promptsPath, JSON.stringify(payload, null, 2));

  const args = [
    "node regression/run-strategy-comparison.mjs",
    `--prompts ${JSON.stringify(promptsPath)}`,
    `--renderer ${renderer}`,
  ];
  if (groups) args.push(`--groups ${JSON.stringify(groups)}`);
  if (maxCases > 0) args.push(`--max-cases ${Math.floor(maxCases)}`);

  const cmd = `cd ${JSON.stringify(ROOT)} && ${args.join(" ")}`;
  const { stdout, stderr } = await runShell(cmd, {
    cwd: ROOT,
    timeoutMs: Number(regressionTimeoutMs) > 0 ? Math.floor(Number(regressionTimeoutMs)) : 0,
  });
  const out = `${stdout}\n${stderr}`;
  const match = out.match(/\[done\] report\(json\):\s+(.+)\s*$/m);
  const reportPath = match?.[1]?.trim() || "";

  return {
    promptsPath,
    reportPath,
    rawOutput: out,
  };
};

const runSingleSiteRegression = async ({
  siteItem,
  runDir,
  renderer,
  port,
  regressionTimeoutMs,
  attempt = 0,
  repairContext = null,
}) => {
  const caseId = String(siteItem?.site?.id || "");
  if (!caseId) {
    return { ok: false, caseId: "", error: "missing_case_id" };
  }

  const promptsDir = path.join(runDir, "pipeline-regression");
  await ensureDir(promptsDir);
  const promptsPath = path.join(
    promptsDir,
    attempt > 0 ? `${caseId}.attempt-${attempt}.json` : `${caseId}.json`
  );

  const payload = {
    version: "1.0.0",
    cases: [
      {
        id: caseId,
        description: siteItem.site.description || caseId,
        requiredCategories: toRequiredCategories(siteItem.specPack),
        routes: toSiteRoutes(siteItem.specPack),
        prompt: buildRegressionPrompt({
          site: siteItem.site,
          indexCard: siteItem.indexCard,
          specPack: siteItem.specPack,
          summary: siteItem.summary,
          visualSignature: siteItem.visualSignature || null,
          repairContext,
        }),
      },
    ],
  };
  await fs.writeFile(promptsPath, JSON.stringify(payload, null, 2));

  const args = [
    "node regression/run-strategy-comparison.mjs",
    `--prompts ${JSON.stringify(promptsPath)}`,
    `--renderer ${renderer}`,
    `--groups ${JSON.stringify(DEFAULT_TEMPLATE_FIRST_GROUP)}`,
    "--max-cases 1",
  ];

  const env = {};
  if (port && port !== 3110) {
    env.STRATEGY_COMPARE_PORT = String(port);
  }

  const cmd = `cd ${JSON.stringify(ROOT)} && ${args.join(" ")}`;
  const { stdout, stderr } = await runShell(cmd, {
    cwd: ROOT,
    env,
    timeoutMs: Number(regressionTimeoutMs) > 0 ? Math.floor(Number(regressionTimeoutMs)) : 0,
  });
  const out = `${stdout}\n${stderr}`;
  const match = out.match(/\[done\] report\(json\):\s+(.+)\s*$/m);
  const reportPath = match?.[1]?.trim() || "";

  let result = {
    ok: Boolean(reportPath),
    caseId,
    promptsPath,
    reportPath,
    rawOutput: out,
    error: reportPath ? null : "missing_report",
  };

  if (reportPath) {
    try {
      const raw = await fs.readFile(reportPath, "utf8");
      const report = JSON.parse(raw);
      const groups = Array.isArray(report?.groups) ? report.groups : [];
      const targetGroup = groups.find((g) => String(g?.id || "") === DEFAULT_TEMPLATE_FIRST_GROUP);
      const rows = Array.isArray(targetGroup?.results) ? targetGroup.results : [];
      const caseRow = rows.find((r) => String(r?.caseId || "") === caseId);
      if (caseRow) {
        result.ok = Boolean(caseRow.ok);
        result.screenshot = caseRow.screenshot || "";
        result.url = caseRow.url || "";
        result.durationMs = caseRow.durationMs || 0;
        result.errors = caseRow.errors || [];
        result.pageScreenshots = Array.isArray(caseRow.pageScreenshots) ? caseRow.pageScreenshots : [];
      }
    } catch {
      result.error = "failed_to_parse_report";
    }
  }

  return result;
};

const collectTemplateFirstPreviewLinks = async ({ reportPath, previewBaseUrl }) => {
  if (!reportPath) return [];
  const raw = await fs.readFile(reportPath, "utf8");
  const report = JSON.parse(raw);
  const groups = Array.isArray(report?.groups) ? report.groups : [];
  const targetGroup = groups.find((group) => String(group?.id || "") === DEFAULT_TEMPLATE_FIRST_GROUP);
  const rows = Array.isArray(targetGroup?.results) ? targetGroup.results : [];
  const previewOrigin = normalizePreviewBaseUrl(previewBaseUrl);

  const links = [];
  for (const row of rows) {
    if (!row?.ok || typeof row?.url !== "string" || !row.url.trim()) continue;
    const baseUrl = rebaseToPreviewOrigin(String(row.url), previewOrigin);
    const caseId = String(row.caseId || "");
    if (!caseId || !baseUrl) continue;

    let parsedUrl;
    try {
      parsedUrl = new URL(baseUrl);
    } catch {
      parsedUrl = null;
    }

    const siteKey = parsedUrl?.searchParams?.get("siteKey") || "";
    let payloadPages = [];
    if (siteKey) {
      const sandboxPayloadPath = path.join(
        ROOT,
        "..",
        "asset-factory",
        "out",
        siteKey,
        "sandbox",
        "payload.json"
      );
      try {
        const payloadRaw = await fs.readFile(sandboxPayloadPath, "utf8");
        const payload = JSON.parse(payloadRaw);
        payloadPages = Array.isArray(payload?.pages) ? payload.pages : [];
      } catch {
        payloadPages = [];
      }
    }

    const pageEntries = payloadPages
      .map((page) => ({
        pagePath: normalizeTemplatePagePath(page?.path || "/"),
        pageName: String(page?.name || "").trim() || formatTemplatePageName(page?.path || "/"),
      }))
      .filter((page, index, arr) => arr.findIndex((item) => item.pagePath === page.pagePath) === index);

    const pageScreenshots = Array.isArray(row?.pageScreenshots) ? row.pageScreenshots : [];

    if (pageEntries.length > 1 && parsedUrl) {
      for (const page of pageEntries) {
        const pageParam = page.pagePath === "/" ? "home" : page.pagePath;
        const nextUrl = new URL(parsedUrl.toString());
        nextUrl.searchParams.set("page", pageParam);
        const pageShot = pageScreenshots.find(
          (shot) => normalizeTemplatePagePath(shot?.pagePath || "/") === page.pagePath
        );
        links.push({
          groupId: DEFAULT_TEMPLATE_FIRST_GROUP,
          caseId,
          pagePath: page.pagePath,
          pageName: page.pageName,
          responseId: row.responseId || null,
          requestId: row.requestId || null,
          url: nextUrl.toString(),
          screenshot: typeof pageShot?.screenshot === "string" ? pageShot.screenshot : "",
        });
      }
      continue;
    }

    links.push({
      groupId: DEFAULT_TEMPLATE_FIRST_GROUP,
      caseId,
      pagePath: "/",
      pageName: "Home",
      responseId: row.responseId || null,
      requestId: row.requestId || null,
      url: baseUrl,
      screenshot: typeof row.screenshot === "string" ? row.screenshot : "",
    });
  }

  const dedup = new Map();
  for (const row of links) {
    dedup.set(`${row.caseId}:${row.pagePath}:${row.url}`, row);
  }
  return Array.from(dedup.values());
};

const collectPreviewLinksFromRunArtifacts = async ({ runDir, processed, previewBaseUrl }) => {
  const previewOrigin = normalizePreviewBaseUrl(previewBaseUrl);
  const links = [];
  for (const item of Array.isArray(processed) ? processed : []) {
    const siteId = String(item?.site?.id || "").trim();
    if (!siteId) continue;
    const pages =
      (Array.isArray(item?.specPack?.page_specs) ? item.specPack.page_specs : [])
        .map((page) => ({
          path: normalizeTemplatePagePath(page?.path || "/"),
          name: String(page?.name || "").trim() || formatTemplatePageName(page?.path || "/"),
        }))
        .filter((page, index, arr) => arr.findIndex((entry) => entry.path === page.path) === index) || [];
    const fallbackPages = pages.length
      ? pages
      : [{ path: "/", name: "Home" }];
    for (const page of fallbackPages) {
      const pageParam = page.path === "/" ? "home" : page.path;
      links.push({
        groupId: DEFAULT_TEMPLATE_FIRST_GROUP,
        caseId: siteId,
        pagePath: page.path,
        pageName: page.name,
        responseId: null,
        requestId: null,
        url: `${previewOrigin}/creation/sandbox?mode=preview&siteKey=${encodeURIComponent(siteId)}&page=${encodeURIComponent(
          pageParam
        )}`,
        screenshot: "",
      });
    }
  }
  const dedup = new Map();
  for (const row of links) {
    dedup.set(`${row.caseId}:${row.pagePath}:${row.url}`, row);
  }
  return Array.from(dedup.values());
};

const computeImageSimilarity = async (referencePath, candidatePath) => {
  if (!referencePath || !candidatePath) return null;
  try {
    const cmd = `python3 - <<'PY'
from PIL import Image, ImageChops, ImageStat
ref = ${JSON.stringify(referencePath)}
cand = ${JSON.stringify(candidatePath)}
size = (360, 360)
img_ref = Image.open(ref).convert("RGB").resize(size)
img_cand = Image.open(cand).convert("RGB").resize(size)
diff = ImageChops.difference(img_ref, img_cand)
stat = ImageStat.Stat(diff)
mad = sum(stat.mean) / len(stat.mean) if stat.mean else 255.0
sim = max(0.0, 100.0 * (1.0 - (mad / 255.0)))
print(f"{sim:.2f}")
PY`;
    const { stdout } = await runShell(cmd, { cwd: ROOT });
    const score = Number(String(stdout || "").trim());
    return Number.isFinite(score) ? score : null;
  } catch {
    return null;
  }
};

const parseSimilarityNumber = (value) =>
  typeof value === "number" && Number.isFinite(value)
    ? value
    : typeof value === "string" && value.trim() && Number.isFinite(Number(value))
      ? Number(value)
      : null;

const clamp01 = (value, fallback = 0) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
};

const combineSimilarityScores = ({ visualSimilarity = null, structureSimilarity = null, structureWeight = 0.2 }) => {
  const visual = parseSimilarityNumber(visualSimilarity);
  const structure = parseSimilarityNumber(structureSimilarity);
  if (visual === null && structure === null) return null;
  if (visual !== null && structure === null) return Number(visual.toFixed(2));
  if (visual === null && structure !== null) return Number(structure.toFixed(2));
  const weight = clamp01(structureWeight, 0.2);
  return Number((visual * (1 - weight) + structure * weight).toFixed(2));
};

const resolveExpectedSectionsForPath = (item, pagePath) => {
  const normalizedPath = normalizePagePathForFidelity(pagePath);
  const specPack = item?.specPack && typeof item.specPack === "object" ? item.specPack : {};
  const rootSectionSpecs = specPack?.section_specs && typeof specPack.section_specs === "object" ? specPack.section_specs : {};
  const pageSpecs = Array.isArray(specPack?.page_specs) ? specPack.page_specs : [];
  const pageSpec = pageSpecs.find((entry) => normalizePagePathForFidelity(entry?.path || "/") === normalizedPath) || null;
  const expectedCategories = normalizeRequiredCategories(pageSpec?.required_categories);
  const expectedFromRoot = normalizeRequiredCategories(specPack?.required_categories);
  const expectedKinds = expectedCategories.length
    ? expectedCategories
    : normalizedPath === "/"
      ? expectedFromRoot
      : [];
  const pageSectionSpecs =
    pageSpec?.section_specs && typeof pageSpec.section_specs === "object"
      ? pageSpec.section_specs
      : normalizedPath === "/"
        ? rootSectionSpecs
        : {};
  return {
    expectedKinds,
    expectedSectionSpecs: pageSectionSpecs,
  };
};

const inferSectionKindFromScreenshot = (section) => {
  const idToken = String(section?.id || "").trim();
  const idKind = normalizeSectionKind(idToken);
  if (idKind) return idKind;
  const typeToken = String(section?.type || "").trim();
  const typeKind = normalizeSectionKind(typeToken);
  if (typeKind) return typeKind;
  const guessSource = slug(`${idToken} ${typeToken}`);
  for (const kind of SECTION_KINDS) {
    if (guessSource.includes(kind)) return kind;
  }
  return null;
};

const computePageStructureSimilarity = ({ expectedKinds = [], expectedSectionSpecs = {}, sectionScreenshots = [] }) => {
  const expected = normalizeRequiredCategories(expectedKinds);
  const expectedSet = new Set(expected);
  const expectedCount = expected.length;
  const actualKinds = (Array.isArray(sectionScreenshots) ? sectionScreenshots : [])
    .map((section) => inferSectionKindFromScreenshot(section))
    .filter(Boolean);
  const actualCount = actualKinds.length;
  if (!expectedCount && !actualCount) {
    return {
      similarity: null,
      comparable: false,
      expectedCount: 0,
      actualCount: 0,
      missingKinds: [],
      matchedKinds: [],
      reason: "no_expected_or_actual_sections",
    };
  }

  if (!expectedCount && actualCount) {
    return {
      similarity: 82,
      comparable: true,
      expectedCount: 0,
      actualCount,
      missingKinds: [],
      matchedKinds: Array.from(new Set(actualKinds)),
      reason: "no_expected_sections_fallback",
    };
  }

  if (!actualCount) {
    return {
      similarity: 0,
      comparable: true,
      expectedCount,
      actualCount: 0,
      missingKinds: expected,
      matchedKinds: [],
      reason: "no_actual_sections",
    };
  }

  const matchedKinds = expected.filter((kind) => actualKinds.includes(kind));
  const missingKinds = expected.filter((kind) => !actualKinds.includes(kind));
  const coverageScore = expectedCount > 0 ? (matchedKinds.length / expectedCount) * 100 : 100;

  let orderedMatches = 0;
  let lastIndex = -1;
  for (const kind of expected) {
    const idx = actualKinds.indexOf(kind);
    if (idx >= 0 && idx >= lastIndex) {
      orderedMatches += 1;
      lastIndex = idx;
    }
  }
  const orderScore = expectedCount > 0 ? (orderedMatches / expectedCount) * 100 : 100;
  const countGap = Math.abs(actualCount - expectedCount);
  const countScore = Math.max(0, 100 - countGap * 18);

  const similarity = Number((coverageScore * 0.55 + orderScore * 0.3 + countScore * 0.15).toFixed(2));

  const expectedBlockTypes = Object.entries(expectedSectionSpecs || {})
    .map(([kind, spec]) => ({ kind: normalizeSectionKind(kind), type: String(spec?.block_type || "").trim() }))
    .filter((entry) => entry.kind && entry.type);

  return {
    similarity,
    comparable: true,
    expectedCount,
    actualCount,
    missingKinds,
    matchedKinds,
    expectedBlockTypes,
    reason: "ok",
  };
};

const classifyFidelityIssue = ({ visualSimilarity = null, structureSimilarity = null, structureMeta = null }) => {
  const visual = parseSimilarityNumber(visualSimilarity);
  const structure = parseSimilarityNumber(structureSimilarity);
  if (structure !== null && structure < 62) return "layout";
  if (structureMeta?.missingKinds?.length) return "layout";
  if (visual !== null && visual < 70 && (structure === null || visual + 8 < structure)) return "color";
  return "copy_density";
};

const evaluateCaseFidelityFromPageScreenshots = async ({
  item,
  pageScreenshots = [],
  crawlPagesByPath = new Map(),
  structureWeight = 0.2,
}) => {
  const pageRows = [];
  for (const pageShot of Array.isArray(pageScreenshots) ? pageScreenshots : []) {
    const pagePath = normalizePagePathForFidelity(pageShot?.pagePath || "/");
    const candidatePath = typeof pageShot?.screenshot === "string" ? pageShot.screenshot.trim() : "";
    if (!candidatePath) continue;

    let referencePath = "";
    if (pagePath === "/") {
      referencePath = String(item?.referenceDesktopPath || "").trim();
    }
    if (!referencePath) {
      const crawlPage = crawlPagesByPath.get(pagePath);
      referencePath = String(crawlPage?.screenshots?.desktopPath || crawlPage?.publishedAssets?.desktopPath || "").trim();
    }
    if (!referencePath) continue;

    const visualSimilarity = await computeImageSimilarity(referencePath, candidatePath);
    const weight = PAGE_FIDELITY_WEIGHTS[pagePath] ?? DEFAULT_PAGE_FIDELITY_WEIGHT;
    const sectionScreenshots = Array.isArray(pageShot?.sectionScreenshots) ? pageShot.sectionScreenshots : [];
    const expected = resolveExpectedSectionsForPath(item, pagePath);
    const structureMeta = computePageStructureSimilarity({
      expectedKinds: expected.expectedKinds,
      expectedSectionSpecs: expected.expectedSectionSpecs,
      sectionScreenshots,
    });
    const structureSimilarity = parseSimilarityNumber(structureMeta?.similarity);
    const similarity = combineSimilarityScores({
      visualSimilarity,
      structureSimilarity,
      structureWeight,
    });
    const issueType = classifyFidelityIssue({
      visualSimilarity,
      structureSimilarity,
      structureMeta,
    });

    pageRows.push({
      caseId: String(item?.site?.id || ""),
      pagePath,
      referencePath,
      screenshotPath: candidatePath,
      visualSimilarity,
      structureSimilarity,
      similarity,
      weight,
      issueType,
      sectionDetails: sectionScreenshots
        .map((section) => ({
          sectionId: section?.id || "",
          sectionType: section?.type || "",
          sectionIndex: section?.index ?? -1,
          screenshotPath: section?.screenshotPath || "",
          bounds: section?.bounds || null,
          similarity: null,
          referencePath: "",
        }))
        .filter((section) => section.screenshotPath),
      structure: structureMeta,
    });
  }

  const numericCombined = pageRows.filter((row) => parseSimilarityNumber(row.similarity) !== null);
  const numericVisual = pageRows.filter((row) => parseSimilarityNumber(row.visualSimilarity) !== null);
  const numericStructure = pageRows.filter((row) => parseSimilarityNumber(row.structureSimilarity) !== null);
  const weighted = (rows, key) => {
    const valid = rows.filter((row) => parseSimilarityNumber(row?.[key]) !== null);
    if (!valid.length) return null;
    const weightedSum = valid.reduce((acc, row) => acc + Number(row[key]) * Number(row.weight || 1), 0);
    const totalWeight = valid.reduce((acc, row) => acc + Number(row.weight || 1), 0);
    return totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : null;
  };

  return {
    pageRows,
    pageCount: pageRows.length,
    similarity: weighted(numericCombined, "similarity"),
    visualSimilarity: weighted(numericVisual, "visualSimilarity"),
    structureSimilarity: weighted(numericStructure, "structureSimilarity"),
  };
};

const PAGE_FIDELITY_WEIGHTS = { "/": 2.0 };
const DEFAULT_PAGE_FIDELITY_WEIGHT = 1.0;

const normalizePagePathForFidelity = (raw) => {
  const trimmed = String(raw || "").trim().replace(/\/+$/, "") || "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const evaluateVisualFidelity = async ({ reportPath, processed, options = {} }) => {
  if (!reportPath) {
    return {
      available: false,
      overallSimilarity: null,
      rows: [],
      pageRows: [],
      reason: "missing_regression_report",
    };
  }
  const raw = await fs.readFile(reportPath, "utf8");
  const report = JSON.parse(raw);
  const groups = Array.isArray(report?.groups) ? report.groups : [];
  const targetGroup = groups.find((group) => String(group?.id || "") === DEFAULT_TEMPLATE_FIRST_GROUP);
  const rows = Array.isArray(targetGroup?.results) ? targetGroup.results : [];
  const processedByCase = new Map(
    (Array.isArray(processed) ? processed : []).map((item) => [String(item?.site?.id || ""), item])
  );

  const scoredRows = [];
  const allPageRows = [];
  const structureWeight = clamp01(options?.fidelityStructureWeight, 0.2);

  for (const row of rows) {
    const caseId = String(row?.caseId || "");
    if (!caseId) continue;
    const item = processedByCase.get(caseId);
    if (!item) continue;

    const pageScreenshots = Array.isArray(row?.pageScreenshots) ? row.pageScreenshots : [];
    const crawlAssetPack = item?.crawlAssetPack || null;
    const crawlPagesByPath = crawlAssetPack?.byPath || (
      crawlAssetPack?.pages
        ? new Map((Array.isArray(crawlAssetPack.pages) ? crawlAssetPack.pages : []).map(
            (p) => [normalizePagePathForFidelity(p?.path || "/"), p]
          ))
        : new Map()
    );

    if (pageScreenshots.length > 0 && crawlPagesByPath.size > 0) {
      const evaluated = await evaluateCaseFidelityFromPageScreenshots({
        item,
        pageScreenshots,
        crawlPagesByPath,
        structureWeight,
      });

      allPageRows.push(...evaluated.pageRows);
      scoredRows.push({
        caseId,
        referencePath: String(item?.referenceDesktopPath || "").trim(),
        screenshotPath: pageScreenshots[0]?.screenshot || "",
        similarity: evaluated.similarity,
        visualSimilarity: evaluated.visualSimilarity,
        structureSimilarity: evaluated.structureSimilarity,
        pageCount: evaluated.pageCount,
        pageDetails: evaluated.pageRows,
      });
    } else {
      const referencePath = String(item?.referenceDesktopPath || "").trim();
      const screenshotPath = typeof row?.screenshot === "string" ? row.screenshot.trim() : "";
      const visualSimilarity = await computeImageSimilarity(referencePath, screenshotPath);
      const similarity = combineSimilarityScores({
        visualSimilarity,
        structureSimilarity: null,
        structureWeight,
      });
      scoredRows.push({
        caseId,
        referencePath,
        screenshotPath,
        similarity,
        visualSimilarity,
        structureSimilarity: null,
        pageCount: 0,
        pageDetails: [],
      });
    }
  }

  const numeric = scoredRows
    .map((row) => row.similarity)
    .filter((score) => typeof score === "number" && Number.isFinite(score));
  const overallSimilarity = numeric.length
    ? Number((numeric.reduce((acc, score) => acc + score, 0) / numeric.length).toFixed(2))
    : null;
  return {
    available: numeric.length > 0,
    overallSimilarity,
    rows: scoredRows,
    pageRows: allPageRows,
    reason: numeric.length > 0 ? "ok" : "no_comparable_rows",
  };
};

const resolveFidelitySettings = (site, options) => {
  const globalMode = String(options?.fidelityMode || "").trim().toLowerCase() === "strict" ? "strict" : "standard";
  const siteMode = String(site?.fidelityMode || "").trim().toLowerCase() === "strict" ? "strict" : "standard";
  const mode = globalMode === "strict" || siteMode === "strict" ? "strict" : "standard";
  const strictAvgMin = Math.max(0, Math.min(100, Math.floor(Number(options?.strictAvgSimilarityMin) || 85)));
  const strictPageMin = Math.max(0, Math.min(100, Math.floor(Number(options?.strictPageSimilarityMin) || 78)));
  const siteThresholdRaw = Number(site?.fidelityThreshold);
  const globalThresholdRaw = Number(options?.fidelityThreshold);
  const thresholdBase = Number.isFinite(siteThresholdRaw) && siteThresholdRaw >= 0 ? siteThresholdRaw : globalThresholdRaw;
  const thresholdRaw = Math.max(0, Math.min(100, Math.floor(Number.isFinite(thresholdBase) ? thresholdBase : 72)));
  const threshold = mode === "strict" ? Math.max(strictAvgMin, thresholdRaw) : thresholdRaw;
  const sitePageThresholdRaw = Number(site?.fidelityPageThreshold);
  const pageThresholdBase =
    Number.isFinite(sitePageThresholdRaw) && sitePageThresholdRaw >= 0 ? sitePageThresholdRaw : strictPageMin;
  const pageThresholdRaw = Math.max(0, Math.min(100, Math.floor(Number(pageThresholdBase) || strictPageMin)));
  const pageThreshold = mode === "strict" ? Math.max(strictPageMin, pageThresholdRaw) : pageThresholdRaw;
  const requiredPagesPerSiteBase =
    Number.isFinite(Number(site?.requiredPagesPerSite)) && Number(site?.requiredPagesPerSite) > 0
      ? Number(site.requiredPagesPerSite)
      : Number(options?.requiredPagesPerSite || 4);
  const requiredPagesPerSite = Math.max(1, Math.min(12, Math.floor(Number(requiredPagesPerSiteBase) || 4)));
  const globalEnforcement = String(options?.fidelityEnforcement || "").trim().toLowerCase() === "fail" ? "fail" : "warn";
  const siteEnforcement = String(site?.fidelityEnforcement || "").trim().toLowerCase() === "fail" ? "fail" : "warn";
  const enforcement = siteEnforcement === "fail" ? "fail" : globalEnforcement;
  return { mode, threshold, pageThreshold, enforcement, requiredPagesPerSite };
};

const evaluateFidelityRowsAgainstPolicies = ({
  fidelityRows = [],
  fidelityByCase,
  strictCaseIds = [],
  strictFailCaseIds = [],
  strictRequiredPageCases = [],
  options = {},
}) => {
  const structureWeight = clamp01(options?.fidelityStructureWeight, 0.2);
  const normalizedRows = (Array.isArray(fidelityRows) ? fidelityRows : []).map((row) => {
    const caseId = String(row?.caseId || "");
    const config = fidelityByCase.get(caseId) || {
      mode: "standard",
      threshold: Number(options?.fidelityThreshold || 72),
      pageThreshold: Number(options?.strictPageSimilarityMin || 78),
      enforcement: options?.fidelityEnforcement || "warn",
    };
    const similarityRaw =
      parseSimilarityNumber(row?.similarity) ??
      combineSimilarityScores({
        visualSimilarity: row?.visualSimilarity,
        structureSimilarity: row?.structureSimilarity,
        structureWeight,
      });
    const similarity = parseSimilarityNumber(similarityRaw);
    const comparable = similarity !== null;
    const pass = comparable && similarity >= Number(config.threshold || 0);
    const pageThreshold = Math.max(0, Math.min(100, Number(config.pageThreshold || 0)));
    const pageDetails = (Array.isArray(row?.pageDetails) ? row.pageDetails : []).map((page) => {
      const pagePath = normalizePagePathForFidelity(page?.pagePath || "/");
      const pageSimilarityRaw =
        parseSimilarityNumber(page?.similarity) ??
        combineSimilarityScores({
          visualSimilarity: page?.visualSimilarity,
          structureSimilarity: page?.structureSimilarity,
          structureWeight,
        });
      const pageSimilarity = parseSimilarityNumber(pageSimilarityRaw);
      const pageComparable = pageSimilarity !== null;
      const pagePass = pageComparable && pageSimilarity >= pageThreshold;
      const issueType =
        String(page?.issueType || "").trim() ||
        classifyFidelityIssue({
          visualSimilarity: page?.visualSimilarity,
          structureSimilarity: page?.structureSimilarity,
          structureMeta: page?.structure || null,
        });
      return {
        ...page,
        pagePath,
        similarity: pageSimilarity,
        comparable: pageComparable,
        threshold: pageThreshold,
        pass: pagePass,
        issueType,
      };
    });
    return {
      ...row,
      caseId,
      similarity,
      mode: config.mode,
      threshold: Number(config.threshold || 0),
      pageThreshold,
      enforcement: config.enforcement || "warn",
      comparable,
      pass,
      pageDetails,
    };
  });

  const rowByCase = new Map(normalizedRows.map((row) => [String(row.caseId || ""), row]));
  const strictFidelityFailures = normalizedRows.filter((row) => row.mode === "strict" && row.comparable && !row.pass);
  const blockingFidelityFailures = strictFidelityFailures.filter((row) => row.enforcement === "fail");
  const strictFidelityMissing = strictCaseIds.filter((caseId) => !normalizedRows.some((row) => row.caseId === caseId && row.comparable));
  const blockingMissing = strictFidelityMissing.filter((caseId) => strictFailCaseIds.includes(caseId));

  const requiredCases = (Array.isArray(strictRequiredPageCases) ? strictRequiredPageCases : [])
    .map((entry) => ({
      id: String(entry?.id || ""),
      caseId: String(entry?.caseId || ""),
      pagePath: normalizePagePathForFidelity(entry?.pagePath || "/"),
      pageName: String(entry?.pageName || "").trim() || formatTemplatePageName(entry?.pagePath || "/"),
      role: String(entry?.role || "generic"),
      reason: String(entry?.reason || "selected"),
    }))
    .filter((entry) => entry.id && entry.caseId);

  const strictPageFidelityFailures = [];
  const strictPageFidelityMissing = [];
  for (const required of requiredCases) {
    const caseRow = rowByCase.get(required.caseId);
    if (!caseRow || !caseRow.comparable) {
      strictPageFidelityMissing.push({
        ...required,
        issue: "case_not_comparable",
        enforcement: strictFailCaseIds.includes(required.caseId) ? "fail" : "warn",
      });
      continue;
    }
    const pageRow = (Array.isArray(caseRow.pageDetails) ? caseRow.pageDetails : []).find(
      (entry) => normalizePagePathForFidelity(entry?.pagePath || "/") === required.pagePath
    );
    if (!pageRow || !pageRow.comparable) {
      strictPageFidelityMissing.push({
        ...required,
        issue: "page_not_comparable",
        enforcement: caseRow.enforcement || "warn",
      });
      continue;
    }
    if (!pageRow.pass) {
      strictPageFidelityFailures.push({
        ...required,
        similarity: pageRow.similarity,
        threshold: pageRow.threshold,
        issueType: pageRow.issueType || "copy_density",
        visualSimilarity: parseSimilarityNumber(pageRow.visualSimilarity),
        structureSimilarity: parseSimilarityNumber(pageRow.structureSimilarity),
        enforcement: caseRow.enforcement || "warn",
      });
    }
  }

  const blockingPageFidelityFailures = strictPageFidelityFailures.filter((row) => row.enforcement === "fail");
  const blockingPageMissing = strictPageFidelityMissing.filter((row) => row.enforcement === "fail");
  const fidelityGateWouldFail =
    strictFidelityFailures.length > 0 ||
    strictFidelityMissing.length > 0 ||
    strictPageFidelityFailures.length > 0 ||
    strictPageFidelityMissing.length > 0;
  const fidelityGatePassed =
    blockingFidelityFailures.length === 0 &&
    blockingMissing.length === 0 &&
    blockingPageFidelityFailures.length === 0 &&
    blockingPageMissing.length === 0;

  return {
    fidelityRowsEvaluated: normalizedRows,
    strictFidelityFailures,
    blockingFidelityFailures,
    strictFidelityMissing,
    strictPageFidelityFailures,
    strictPageFidelityMissing,
    blockingPageFidelityFailures,
    blockingPageMissing,
    fidelityGateWouldFail,
    fidelityGatePassed,
    blockingMissing,
  };
};

const evaluateRegressionOutcome = async ({
  reportPath,
  processed,
  fidelityByCase,
  strictCaseIds,
  strictFailCaseIds,
  strictRequiredPageCases,
  options,
}) => {
  const score = await scoreRegressionReport(reportPath);
  const fidelity = await evaluateVisualFidelity({
    reportPath,
    processed,
    options,
  });
  const policyEval = evaluateFidelityRowsAgainstPolicies({
    fidelityRows: Array.isArray(fidelity?.rows) ? fidelity.rows : [],
    fidelityByCase,
    strictCaseIds,
    strictFailCaseIds,
    strictRequiredPageCases,
    options,
  });

  return {
    score,
    fidelity,
    ...policyEval,
  };
};

const repairActionsForIssue = (issueType) => {
  if (issueType === "layout") {
    return [
      "Restore section order and hierarchy (nav/hero/content/cta/footer) to match source.",
      "Adjust spacing scale and block proportions using source screenshot as baseline.",
      "Use more suitable block variant/custom component when section structure is mismatched.",
    ];
  }
  if (issueType === "color") {
    return [
      "Align palette and surface contrast with source dominant colors.",
      "Correct background/overlay tint and CTA emphasis color usage.",
      "Ensure image treatment and gradient tone are source-consistent.",
    ];
  }
  return [
    "Align heading/body text density and line lengths with source.",
    "Reduce or expand CTA/button count to match source content rhythm.",
    "Adjust cards/testimonials/item count to source-like information density.",
  ];
};

const buildFidelityManualFixTasks = ({
  fidelityRows,
  missingCaseIds,
  failedPageCases = [],
  missingPageCases = [],
  previewLinks,
}) => {
  const casePreview = new Map();
  for (const link of Array.isArray(previewLinks) ? previewLinks : []) {
    const caseId = String(link?.caseId || "");
    if (!caseId || casePreview.has(caseId)) continue;
    casePreview.set(caseId, String(link?.url || ""));
  }

  const rows = Array.isArray(fidelityRows) ? fidelityRows : [];
  const lowSimilarityTasks = rows
    .filter((row) => row?.mode === "strict" && row?.comparable && !row?.pass)
    .map((row) => {
      const similarity = Number(row?.similarity);
      const threshold = Number(row?.threshold || 0);
      const delta = Number.isFinite(similarity) ? Number((threshold - similarity).toFixed(2)) : null;
      return {
        caseId: String(row.caseId || ""),
        issue: "low_similarity",
        mode: row.mode,
        enforcement: row.enforcement || "warn",
        similarity: Number.isFinite(similarity) ? similarity : null,
        threshold,
        gap: delta,
        previewUrl: casePreview.get(String(row.caseId || "")) || "",
        actions: [
          "Align hero background/media and section ordering to source screenshots first.",
          "Reuse source-like images and preserve source card/image aspect ratios.",
          "Correct nav/footer copy, CTA color, and spacing rhythm to match source.",
        ],
      };
    })
    .sort((a, b) => (Number(b.gap) || 0) - (Number(a.gap) || 0));

  const pageFailureTasks = (Array.isArray(failedPageCases) ? failedPageCases : [])
    .map((row) => {
      const similarity = Number(row?.similarity);
      const threshold = Number(row?.threshold || 0);
      const issueType = String(row?.issueType || "copy_density");
      const gap = Number.isFinite(similarity) ? Number((threshold - similarity).toFixed(2)) : null;
      return {
        caseId: String(row?.caseId || ""),
        pagePath: normalizeTemplatePagePath(row?.pagePath || "/"),
        pageName: String(row?.pageName || "").trim() || formatTemplatePageName(row?.pagePath || "/"),
        issue: "low_page_similarity",
        issueType,
        mode: "strict",
        enforcement: String(row?.enforcement || "warn"),
        similarity: Number.isFinite(similarity) ? similarity : null,
        threshold,
        gap,
        previewUrl: casePreview.get(String(row?.caseId || "")) || "",
        actions: repairActionsForIssue(issueType),
      };
    })
    .sort((a, b) => (Number(b.gap) || 0) - (Number(a.gap) || 0));

  const missingTasks = (Array.isArray(missingCaseIds) ? missingCaseIds : []).map((caseId) => ({
    caseId: String(caseId || ""),
    issue: "missing_comparison",
    mode: "strict",
    enforcement: "warn",
    similarity: null,
    threshold: null,
    gap: null,
    previewUrl: casePreview.get(String(caseId || "")) || "",
    actions: [
      "Ensure regression run produced screenshot path for this case.",
      "Verify source reference desktop screenshot exists and is readable.",
    ],
  }));

  const missingPageTasks = (Array.isArray(missingPageCases) ? missingPageCases : []).map((row) => ({
    caseId: String(row?.caseId || ""),
    pagePath: normalizeTemplatePagePath(row?.pagePath || "/"),
    pageName: String(row?.pageName || "").trim() || formatTemplatePageName(row?.pagePath || "/"),
    issue: "missing_page_comparison",
    mode: "strict",
    enforcement: String(row?.enforcement || "warn"),
    similarity: null,
    threshold: null,
    gap: null,
    previewUrl: casePreview.get(String(row?.caseId || "")) || "",
    actions: [
      "Ensure this required page route is generated and reachable in preview.",
      "Capture page screenshot and include section screenshots for this route.",
    ],
  }));

  return [...lowSimilarityTasks, ...pageFailureTasks, ...missingTasks, ...missingPageTasks];
};

const scoreRegressionReport = async (reportPath) => {
  if (!reportPath) {
    return {
      ok: false,
      message: "missing_regression_report",
      groups: [],
    };
  }

  const raw = await fs.readFile(reportPath, "utf8");
  const report = JSON.parse(raw);
  const groups = Array.isArray(report?.groups) ? report.groups : [];
  const summary = groups.map((group) => {
    const rows = Array.isArray(group?.results) ? group.results : [];
    const total = rows.length || 1;
    const passed = Number(group?.passed || 0);
    const errorRows = rows.filter((row) => Array.isArray(row?.errors) && row.errors.length > 0).length;
    const fallbackRows = rows.filter((row) =>
      (Array.isArray(row?.errors) ? row.errors : []).some((err) => String(err).includes("builder_section_fallback"))
    ).length;
    const passRate = passed / total;
    const errorRate = errorRows / total;
    const fallbackRate = fallbackRows / total;
    const avgDurationMs = Number(group?.avgDurationMs || 0);
    const latencyPenalty = Math.min(1, avgDurationMs / 180000);
    const score = Math.round(passRate * 60 + (1 - errorRate) * 20 + (1 - fallbackRate) * 15 + (1 - latencyPenalty) * 5);
    return {
      id: group.id,
      label: group.label,
      total,
      passed,
      passRate: Number((passRate * 100).toFixed(1)),
      errorRate: Number((errorRate * 100).toFixed(1)),
      fallbackRate: Number((fallbackRate * 100).toFixed(1)),
      avgDurationMs: Math.round(avgDurationMs),
      score,
    };
  });

  const overall = summary.length
    ? Math.round(summary.reduce((acc, item) => acc + item.score, 0) / summary.length)
    : 0;

  return {
    ok: true,
    overallScore: overall,
    groups: summary,
  };
};

const processSiteWithPipelineRegression = async ({
  site,
  siteIndex,
  sites,
  options,
  runDir,
  siteRoot,
  availablePorts,
  screenshotSemaphore,
  crawlSemaphore,
  regressionSemaphore,
  fidelityByCase,
}) => {
  const sitePrefix = `[template-factory][${siteIndex + 1}/${sites.length}][${site.id}]`;
  const siteStartedAt = Date.now();
  const siteForRun = { ...site };
  console.log(`${sitePrefix} start url=${siteForRun.url || "(no-url)"}`);
  const siteDir = path.join(siteRoot, site.id);
  const ingestDir = path.join(siteDir, "ingest");
  const extractedDir = path.join(siteDir, "extracted");
  await ensureDir(ingestDir);
  await ensureDir(extractedDir);

  const antiCrawlPrecheckEnabled =
    Boolean(siteForRun.url) &&
    !options.skipIngest &&
    options.antiCrawlPrecheck &&
    site.antiCrawlPrecheck !== false;
  const antiCrawlTimeoutMs =
    Number(site.antiCrawlTimeoutMs || 0) > 0
      ? Math.floor(Number(site.antiCrawlTimeoutMs))
      : Math.max(1000, Math.floor(Number(options.antiCrawlTimeoutMs || 0) || 25000));
  const antiCrawlPrecheck = antiCrawlPrecheckEnabled
    ? await runWithProgress(
        "anti-crawl precheck",
        () =>
          precheckAntiCrawl({
            url: siteForRun.url,
            timeoutMs: antiCrawlTimeoutMs,
          }),
        { prefix: sitePrefix, heartbeatMs: 15000 }
      )
    : {
        checked: false,
        blocked: false,
        reason: antiCrawlPrecheckEnabled ? "skipped" : "disabled",
        status: 0,
        url: siteForRun.url || "",
        finalUrl: "",
      };
  await fs.writeFile(path.join(ingestDir, "anti-crawl-precheck.json"), JSON.stringify(antiCrawlPrecheck, null, 2));
  if (antiCrawlPrecheckEnabled && antiCrawlPrecheck.blocked) {
    const details = antiCrawlPrecheck.reason || "anti_crawl_detected";
    throw new Error(
      `[template-factory] anti-crawl detected for ${site.id} (${siteForRun.url}) during precheck: ${details}. Template generation terminated.`
    );
  }
  if (antiCrawlPrecheckEnabled) {
    console.log(
      `[template-factory] anti-crawl precheck ${site.id}: status=${antiCrawlPrecheck.status || 0}, result=${antiCrawlPrecheck.reason}`
    );
  }

  let desktopShot = null;
  let mobileShot = null;

  if (!options.skipIngest) {
    if (siteForRun.url) {
      desktopShot = await runWithSemaphore(screenshotSemaphore, () =>
        runWithProgress(
          "capture desktop screenshot",
          () =>
            captureScreenshot({
              url: siteForRun.url,
              outPath: path.join(ingestDir, "desktop.auto.png"),
              mobile: false,
              timeoutMs: options.screenshotTimeoutMs,
            }),
          { prefix: sitePrefix, heartbeatMs: 12000 }
        )
      );
      mobileShot = await runWithSemaphore(screenshotSemaphore, () =>
        runWithProgress(
          "capture mobile screenshot",
          () =>
            captureScreenshot({
              url: siteForRun.url,
              outPath: path.join(ingestDir, "mobile.auto.png"),
              mobile: true,
              timeoutMs: options.screenshotTimeoutMs,
            }),
          { prefix: sitePrefix, heartbeatMs: 12000 }
        )
      );
    }
  }

  const copiedDesktop = await safeCopy(site.desktopScreenshot, path.join(ingestDir, "desktop.reference.png"));
  const copiedMobile = await safeCopy(site.mobileScreenshot, path.join(ingestDir, "mobile.reference.png"));
  const preferredDesktop = await choosePreferredScreenshot([copiedDesktop, desktopShot]);
  const preferredMobile = await choosePreferredScreenshot([copiedMobile, mobileShot]);
  const publishedAssets = await publishReferenceAssets({
    siteId: site.id,
    desktopSource: preferredDesktop,
    mobileSource: preferredMobile,
  });
  const visualSignature = await extractImageVisualSignature(preferredDesktop || copiedDesktop || desktopShot || "");
  const crawlEnabled = Boolean(siteForRun.url) && !options.skipIngest && (options.crawlSite || siteForRun.crawlSite || site.crawlSite);
  const crawlMaxPages =
    Number(site.crawlMaxPages || 0) > 0
      ? Math.floor(Number(site.crawlMaxPages))
      : Math.max(1, Math.floor(Number(options.crawlMaxPages || 0) || 0));
  const crawlMaxDepth =
    Number(site.crawlMaxDepth) >= 0
      ? Math.floor(Number(site.crawlMaxDepth))
      : Math.max(0, Math.floor(Number(options.crawlMaxDepth || 0) || 0));
  const crawlCapturePages =
    Number(site.crawlCapturePages) >= 0
      ? Math.floor(Number(site.crawlCapturePages))
      : Math.max(0, Math.floor(Number(options.crawlCapturePages || 0) || 0));
  let crawlReport = null;
  let crawlAssetPack = null;
  let crawlPipeline = null;
  if (crawlEnabled) {
    await runWithSemaphore(crawlSemaphore, async () => {
      crawlPipeline = await runWithProgress(
        `hybrid crawl pipeline (pages=${crawlMaxPages}, depth=${crawlMaxDepth})`,
        () =>
            runHybridCrawlerPipeline({
              site: siteForRun,
              ingestDir,
              maxPages: crawlMaxPages,
              maxDepth: crawlMaxDepth,
              timeoutMs: options.crawlTimeoutMs,
          }),
        { prefix: sitePrefix, heartbeatMs: 25000 }
      );
      if (crawlPipeline?.ok && crawlPipeline.crawlReport) {
        crawlReport = crawlPipeline.crawlReport;
      } else {
        if (crawlPipeline && !crawlPipeline.ok) {
          const reason = crawlPipeline.reason || "hybrid_pipeline_failed";
          console.warn(`[template-factory] hybrid crawl pipeline fallback for ${site.id}: ${reason}`);
        }
        crawlReport = await runWithProgress(
          `fallback crawl (pages=${crawlMaxPages}, depth=${crawlMaxDepth})`,
          () =>
            crawlSitePages({
              entryUrl: siteForRun.url,
              maxPages: crawlMaxPages,
              maxDepth: crawlMaxDepth,
              timeoutMs: options.crawlTimeoutMs,
            }),
          { prefix: sitePrefix, heartbeatMs: 25000 }
        );
      }
    });
  }
  if (crawlReport?.blocked) {
    await fs.writeFile(path.join(ingestDir, "crawl.json"), JSON.stringify(crawlReport, null, 2));
    const reason = crawlReport?.antiCrawl?.reason || "anti_crawl_detected";
    throw new Error(
      `[template-factory] anti-crawl detected for ${site.id} (${siteForRun.url}) during crawl: ${reason}. Template generation terminated.`
    );
  }
  crawlAssetPack = crawlReport
    ? await runWithProgress(
        "build crawled page asset pack",
        () =>
          buildCrawledPageAssetPack({
            siteId: site.id,
            crawl: crawlReport,
            ingestDir,
            captureLimit: crawlCapturePages,
            screenshotTimeoutMs: options.screenshotTimeoutMs,
            screenshotSemaphore,
            logPrefix: sitePrefix,
          }),
        { prefix: sitePrefix, heartbeatMs: 25000 }
      )
    : null;
  if (crawlReport) {
    await fs.writeFile(path.join(ingestDir, "crawl.json"), JSON.stringify(crawlReport, null, 2));
    console.log(
      `[template-factory] crawl ${site.id}: pages=${crawlReport?.stats?.crawled || 0}, discovered=${crawlReport?.stats?.discovered || 0}, failed=${crawlReport?.stats?.failed || 0}`
    );
  }
  const summary = await runWithProgress("fetch html summary", () => fetchHtmlSummary(siteForRun.url), {
    prefix: sitePrefix,
    heartbeatMs: 12000,
  });
  const mergedSummary = crawlReport ? mergeSummaryWithCrawl(summary, crawlReport) : summary;
  if (crawlPipeline?.ok) {
    const mergedThemeColors = mergeThemeColors(mergedSummary, crawlPipeline.styleFused);
    if (mergedThemeColors.length) mergedSummary.themeColors = mergedThemeColors;
  }
  const resolvedRecipe = resolveRecipeForSite({
    site: siteForRun,
    summary: mergedSummary,
    visualSignature,
  });
  const recipe = resolvedRecipe.recipe;
  const referenceSlices = await runWithProgress(
    "create reference slices",
    () =>
      createReferenceSlices({
        siteId: site.id,
        desktopSource: preferredDesktop,
        mobileSource: preferredMobile,
        preset: recipe?.id,
      }),
    { prefix: sitePrefix, heartbeatMs: 15000 }
  );
  if (resolvedRecipe.synthesized) {
    console.log(
      `[template-factory] dynamic recipe synthesized for ${site.id}: base=${resolvedRecipe.baseRecipeId}, score=${resolvedRecipe.fit.score}, mismatches=${resolvedRecipe.fit.mismatches.join(
        ","
      )}`
    );
  }
  await fs.writeFile(
    path.join(ingestDir, "summary.json"),
    JSON.stringify(
      {
        site: siteForRun,
        urlUsed: siteForRun.url,
        screenshots: {
          desktopAuto: desktopShot,
          mobileAuto: mobileShot,
          desktopReference: copiedDesktop,
          mobileReference: copiedMobile,
          desktopPreferred: preferredDesktop,
          mobilePreferred: preferredMobile,
        },
        publishedAssets,
        referenceSlices,
        antiCrawlPrecheck: {
          enabled: antiCrawlPrecheckEnabled,
          path: path.join(ingestDir, "anti-crawl-precheck.json"),
          ...antiCrawlPrecheck,
        },
        recipeResolution: {
          selectedRecipeId: recipe.id,
          synthesized: Boolean(resolvedRecipe.synthesized),
          baseRecipeId: resolvedRecipe.baseRecipeId,
          fitScore: resolvedRecipe.fit?.score ?? null,
          fitMismatches: Array.isArray(resolvedRecipe.fit?.mismatches) ? resolvedRecipe.fit.mismatches : [],
        },
        htmlSummary: mergedSummary,
        crawl: crawlReport
          ? {
              enabled: true,
              path: path.join(ingestDir, "crawl.json"),
              pagesPath: crawlAssetPack?.manifestPath || "",
              pageAssets: Array.isArray(crawlAssetPack?.pages) ? crawlAssetPack.pages.length : 0,
              ...crawlReport.stats,
            }
          : { enabled: false },
        hybridPipeline: crawlPipeline?.ok
          ? {
              enabled: true,
              outputDir: crawlPipeline.outputDir,
              crawlResultPath: crawlPipeline.paths?.crawlResultPath || "",
              crawlReportPath: crawlPipeline.paths?.crawlReportPath || "",
              visualAnalysisPath: crawlPipeline.paths?.visualAnalysisPath || "",
              styleFusedPath: crawlPipeline.paths?.styleFusedPath || "",
              warnings: Array.isArray(crawlPipeline.warnings) ? crawlPipeline.warnings : [],
            }
          : {
              enabled: false,
              reason: crawlPipeline?.reason || "disabled_or_fallback",
            },
      },
      null,
      2
    )
  );

  const indexCardRaw = buildIndexCard({
    site: siteForRun,
    recipe,
    summary: mergedSummary,
    evidence: {
      desktop: Boolean(desktopShot || copiedDesktop || site.desktopScreenshot),
      mobile: Boolean(mobileShot || copiedMobile || site.mobileScreenshot),
    },
  });
  const specPackRaw = buildSpecPack({
    site: siteForRun,
    recipe,
    summary: mergedSummary,
    assets: { ...publishedAssets, slices: referenceSlices },
    crawl: crawlReport,
    crawlAssetPack,
    options,
  });
  const indexCard = rewriteBrandTextDeep(indexCardRaw);
  const specPack = rewriteBrandTextDeep(specPackRaw);
  const linkReport = buildLinkReport({
    site: siteForRun,
    specPack,
    sitePages: Array.isArray(specPack?.site_pages) ? specPack.site_pages : [],
  });
  const sanitizedSite = rewriteBrandTextDeep(siteForRun);
  const styleProfile = rewriteBrandTextDeep(specPackToStyleProfile({ site: sanitizedSite, indexCard, specPack }));

  await fs.writeFile(path.join(extractedDir, "index-card.json"), JSON.stringify(indexCard, null, 2));
  await fs.writeFile(path.join(extractedDir, "spec-pack.json"), JSON.stringify(specPack, null, 2));
  await fs.writeFile(path.join(extractedDir, "style-profile.json"), JSON.stringify(styleProfile, null, 2));
  await fs.writeFile(path.join(extractedDir, "link-report.json"), JSON.stringify(linkReport, null, 2));

  const processedItem = {
    site: siteForRun,
    indexCard,
    specPack,
    styleProfile,
    siteDir,
    summary: mergedSummary,
    recipeResolution: {
      selectedRecipeId: recipe.id,
      synthesized: Boolean(resolvedRecipe.synthesized),
      baseRecipeId: resolvedRecipe.baseRecipeId,
      fitScore: resolvedRecipe.fit?.score ?? null,
      fitMismatches: Array.isArray(resolvedRecipe.fit?.mismatches) ? resolvedRecipe.fit.mismatches : [],
    },
    visualSignature,
    referenceDesktopPath: preferredDesktop || copiedDesktop || desktopShot || "",
    referenceMobilePath: preferredMobile || copiedMobile || mobileShot || "",
    crawlAssetPack: crawlAssetPack || null,
    linkReport,
  };

  console.log(
    `${sitePrefix} processed recipe=${recipe.id} elapsed=${formatElapsed(Date.now() - siteStartedAt)}`
  );

  if (!options.fastMode && options.pipelineParallel) {
    await regressionSemaphore.acquire();
    const assignedPort = availablePorts.pop() || 3111;
    try {
      console.log(`${sitePrefix} starting pipeline regression on port ${assignedPort}`);
      
      const fidelityConfig = fidelityByCase.get(String(site.id)) || {
        mode: options.fidelityMode,
        threshold: options.fidelityThreshold,
        pageThreshold: options.strictPageSimilarityMin,
        enforcement: options.fidelityEnforcement,
        requiredPagesPerSite: options.requiredPagesPerSite,
      };
      const strictRequiredPagesForCase =
        String(fidelityConfig.mode || "").toLowerCase() === "strict"
          ? selectRequiredPagesForSite({
              siteItem: processedItem,
              maxPagesPerSite: Number(fidelityConfig.requiredPagesPerSite || options.requiredPagesPerSite || 4),
            })
          : [];
      
      const maxRepairIterations = Math.max(0, Math.min(5, Number(options.autoRepairIterations || 0)));
      let repairContext = null;
      let regressionResult = null;
      let similarity = null;
      let fidelityPass = false;
      let visualSimilarity = null;
      let structureSimilarity = null;
      let pageDetails = [];
      let failedRequiredPages = [];
      let missingRequiredPages = [];

      for (let attempt = 0; attempt <= maxRepairIterations; attempt += 1) {
        console.log(`${sitePrefix} regression attempt ${attempt + 1}/${maxRepairIterations + 1} on port ${assignedPort}`);
        
        regressionResult = await runWithProgress(
          `run single-site regression attempt ${attempt + 1}/${maxRepairIterations + 1}`,
          () =>
            runSingleSiteRegression({
              siteItem: processedItem,
              runDir,
              renderer: options.renderer,
              port: assignedPort,
              regressionTimeoutMs: options.regressionTimeoutMs,
              attempt,
              repairContext,
            }),
          { prefix: sitePrefix, heartbeatMs: 30000 }
        );

        if (!regressionResult?.ok || !regressionResult?.reportPath) {
          console.log(`${sitePrefix} regression failed, no report generated`);
          break;
        }

        const pageScreenshots = Array.isArray(regressionResult?.pageScreenshots) ? regressionResult.pageScreenshots : [];
        const crawlPagesByPath = crawlAssetPack?.byPath || (
          crawlAssetPack?.pages
            ? new Map((Array.isArray(crawlAssetPack.pages) ? crawlAssetPack.pages : []).map(
                (p) => [normalizePagePathForFidelity(p?.path || "/"), p]
              ))
            : new Map()
        );

        let fidelityResult = null;
        let fidelityVisual = null;
        let fidelityStructure = null;
        let fidelityPageDetails = [];
        if (pageScreenshots.length > 0 && crawlPagesByPath.size > 0) {
          const evaluated = await evaluateCaseFidelityFromPageScreenshots({
            item: processedItem,
            pageScreenshots,
            crawlPagesByPath,
            structureWeight: options.fidelityStructureWeight,
          });
          fidelityResult = evaluated.similarity;
          fidelityVisual = evaluated.visualSimilarity;
          fidelityStructure = evaluated.structureSimilarity;
          fidelityPageDetails = evaluated.pageRows;
          console.log(
            `${sitePrefix} per-page fidelity combined=${fidelityResult ?? "n/a"} visual=${fidelityVisual ?? "n/a"} structure=${fidelityStructure ?? "n/a"}`
          );
        } else {
          fidelityVisual = await computeImageSimilarity(
            processedItem.referenceDesktopPath,
            regressionResult.screenshot
          );
          fidelityResult = combineSimilarityScores({
            visualSimilarity: fidelityVisual,
            structureSimilarity: null,
            structureWeight: options.fidelityStructureWeight,
          });
          fidelityPageDetails = [];
        }
        similarity = fidelityResult;
        visualSimilarity = fidelityVisual;
        structureSimilarity = fidelityStructure;
        pageDetails = fidelityPageDetails;
        const avgPass = typeof similarity === "number" && similarity >= Number(fidelityConfig.threshold || 0);
        failedRequiredPages = [];
        missingRequiredPages = [];
        if (String(fidelityConfig.mode || "").toLowerCase() === "strict" && strictRequiredPagesForCase.length) {
          const pageByPath = new Map(
            (Array.isArray(pageDetails) ? pageDetails : []).map((entry) => [
              normalizePagePathForFidelity(entry?.pagePath || "/"),
              entry,
            ])
          );
          for (const required of strictRequiredPagesForCase) {
            const pagePath = normalizePagePathForFidelity(required?.path || "/");
            const pageRow = pageByPath.get(pagePath);
            if (!pageRow || parseSimilarityNumber(pageRow?.similarity) === null) {
              missingRequiredPages.push({
                caseId: String(site.id || ""),
                pagePath,
                pageName: String(required?.name || "").trim() || formatTemplatePageName(pagePath),
                role: String(required?.role || "generic"),
                issue: "page_not_comparable",
                enforcement: fidelityConfig.enforcement || "warn",
              });
              continue;
            }
            if (Number(pageRow.similarity) < Number(fidelityConfig.pageThreshold || 0)) {
              failedRequiredPages.push({
                caseId: String(site.id || ""),
                pagePath,
                pageName: String(required?.name || "").trim() || formatTemplatePageName(pagePath),
                role: String(required?.role || "generic"),
                similarity: Number(pageRow.similarity),
                threshold: Number(fidelityConfig.pageThreshold || 0),
                issueType: String(pageRow?.issueType || "copy_density"),
                enforcement: fidelityConfig.enforcement || "warn",
              });
            }
          }
        }
        fidelityPass = avgPass && failedRequiredPages.length === 0 && missingRequiredPages.length === 0;

        console.log(
          `${sitePrefix} regression attempt ${attempt + 1} similarity=${similarity ?? "n/a"} threshold=${fidelityConfig.threshold} pageThreshold=${fidelityConfig.pageThreshold} pageFailures=${failedRequiredPages.length} pageMissing=${missingRequiredPages.length} pass=${fidelityPass}`
        );

        if (fidelityPass || attempt >= maxRepairIterations) {
          break;
        }

        repairContext = {
          attempt: attempt + 1,
          threshold: Number(fidelityConfig.threshold || 0),
          similarity,
          gap: Number((Number(fidelityConfig.threshold || 0) - (similarity || 0)).toFixed(2)),
          issueSummary: failedRequiredPages.reduce(
            (acc, row) => ({ ...acc, [row.issueType || "copy_density"]: Number(acc[row.issueType || "copy_density"] || 0) + 1 }),
            {}
          ),
          sectionHints: failedRequiredPages.slice(0, 6).map((row) => ({
            sectionType: row.pagePath,
            sectionKind: row.pageName,
            similarity: row.similarity,
            issue: row.issueType || "low fidelity",
          })),
        };
      }

      processedItem.pipelineRegression = {
        ok: regressionResult?.ok || false,
        reportPath: regressionResult?.reportPath || "",
        screenshot: regressionResult?.screenshot || "",
        url: regressionResult?.url || "",
        similarity,
        visualSimilarity,
        structureSimilarity,
        pageDetails,
        threshold: fidelityConfig.threshold,
        pageThreshold: fidelityConfig.pageThreshold,
        pass: fidelityPass,
        requiredPages: strictRequiredPagesForCase.map((row) => ({
          path: normalizeTemplatePagePath(row?.path || "/"),
          name: String(row?.name || "").trim() || formatTemplatePageName(row?.path || "/"),
          role: String(row?.role || "generic"),
        })),
        failedPages: failedRequiredPages,
        missingPages: missingRequiredPages,
        mode: fidelityConfig.mode,
        enforcement: fidelityConfig.enforcement,
        port: assignedPort,
      };
    } finally {
      availablePorts.push(assignedPort);
      regressionSemaphore.release();
    }
  }

  return processedItem;
};

class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.currentCount = 0;
    this.waitQueue = [];
  }

  acquire() {
    return new Promise((resolve) => {
      if (this.currentCount < this.maxConcurrency) {
        this.currentCount += 1;
        resolve();
      } else {
        this.waitQueue.push(resolve);
      }
    });
  }

  release() {
    const next = this.waitQueue.shift();
    if (next) {
      next();
    } else {
      this.currentCount = Math.max(0, this.currentCount - 1);
    }
  }
}

const main = async () => {
  const runStartedAt = Date.now();
  const options = parseArgs(process.argv);

  const runMain = async () => {
    const manifestPath = options.manifest;
    const sites = await loadManifest(manifestPath);
    if (!sites.length) {
      throw new Error(`No valid sites in manifest: ${manifestPath}`);
    }

    const runDir = path.join(RUNS_DIR, options.runId);
    const siteRoot = path.join(runDir, "sites");
    await ensureDir(siteRoot);
    await ensureDir(LIB_DIR);

    console.log(
      `[template-factory] run start id=${options.runId} sites=${sites.length} crawlSite=${options.crawlSite} fastMode=${options.fastMode} pipelineParallel=${options.pipelineParallel} maxDiscoveredPages=${options.maxDiscoveredPages} maxNavLinks=${options.maxNavLinks} strictAvgMin=${options.strictAvgSimilarityMin} strictPageMin=${options.strictPageSimilarityMin}`
    );

    const processed = [];
    const fidelityByCaseBySiteId = new Map(
      sites.map((site) => [String(site?.id || ""), resolveFidelitySettings(site, options)])
    );
    const screenshotSemaphore = new Semaphore(Math.max(1, Number(options.screenshotConcurrency || 1)));
    const crawlSemaphore = new Semaphore(Math.max(1, Number(options.crawlConcurrency || 1)));
    const regressionConcurrency = Math.max(1, Number(options.regressionConcurrency || 1));
    const regressionSemaphore = new Semaphore(regressionConcurrency);
    const availablePorts = [];
    for (let i = 0; i < regressionConcurrency; i += 1) {
      availablePorts.push(3111 + i);
    }

    if (options.pipelineParallel && !options.fastMode) {
      const pipelineConcurrency = Math.max(1, Number(options.pipelineParallelConcurrency || 1));
      console.log(
        `[template-factory] pipeline parallel enabled: pipeline=${pipelineConcurrency} screenshot=${options.screenshotConcurrency} crawl=${options.crawlConcurrency} regression=${options.regressionConcurrency} ports=${availablePorts.join(",")}`
      );
      const orderedResults = new Array(sites.length).fill(null);
      let nextSiteIndex = 0;
      const workerCount = Math.min(pipelineConcurrency, sites.length);
      const workers = Array.from({ length: workerCount }, async () => {
        while (true) {
          const siteIndex = nextSiteIndex;
          nextSiteIndex += 1;
          if (siteIndex >= sites.length) break;
          const site = sites[siteIndex];
          try {
            orderedResults[siteIndex] = await runSiteWithRetries({
              site,
              siteIndex,
              sites,
              options,
              execute: () =>
                processSiteWithPipelineRegression({
                  site,
                  siteIndex,
                  sites,
                  options,
                  runDir,
                  siteRoot,
                  availablePorts,
                  screenshotSemaphore,
                  crawlSemaphore,
                  regressionSemaphore,
                  fidelityByCase: fidelityByCaseBySiteId,
                }),
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[template-factory][${siteIndex + 1}/${sites.length}][${site.id}] failed: ${errorMessage}`);
            orderedResults[siteIndex] = null;
          }
        }
      });
      await Promise.all(workers);
      for (const item of orderedResults) {
        if (item) processed.push(item);
      }
    } else {
      for (const [siteIndex, site] of sites.entries()) {
        const item = await runSiteWithRetries({
          site,
          siteIndex,
          sites,
          options,
          execute: () =>
            processSiteWithPipelineRegression({
              site,
              siteIndex,
              sites,
              options,
              runDir,
              siteRoot,
              availablePorts,
              screenshotSemaphore,
              crawlSemaphore,
              regressionSemaphore,
              fidelityByCase: fidelityByCaseBySiteId,
            }),
        });
        if (item) processed.push(item);
      }
    }

  let templateExclusiveComponents = [];
  let templateExclusiveUsage = [];
  let templateExclusiveComponentsPath = null;
  if (options.templateExclusiveBlocks !== false && processed.length) {
    const blocksDir = path.join(ROOT, "src", "components", "blocks");
    let availableFolders = [];
    try {
      const entries = await fs.readdir(blocksDir, { withFileTypes: true });
      availableFolders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    } catch {
      availableFolders = [];
    }
    const injected = injectTemplateExclusiveComponents({
      processed,
      availableBlockFolders: new Set(availableFolders),
    });
    templateExclusiveComponents = injected.components;
    templateExclusiveUsage = injected.usage;

    for (const item of processed) {
      const sanitizedSite = rewriteBrandTextDeep(item.site || {});
      item.styleProfile = rewriteBrandTextDeep(
        specPackToStyleProfile({
          site: sanitizedSite,
          indexCard: item.indexCard,
          specPack: item.specPack,
        })
      );
      const siteId = String(item?.site?.id || "");
      item.templateExclusiveComponents = templateExclusiveComponents.filter(
        (component) => String(component?.templateExclusive?.siteId || "") === siteId
      );
      const extractedDir = path.join(item.siteDir, "extracted");
      await fs.writeFile(path.join(extractedDir, "spec-pack.json"), JSON.stringify(item.specPack, null, 2));
      await fs.writeFile(path.join(extractedDir, "style-profile.json"), JSON.stringify(item.styleProfile, null, 2));
    }

    if (templateExclusiveComponents.length) {
      templateExclusiveComponentsPath = path.join(runDir, "template-exclusive-components.json");
      await fs.writeFile(
        templateExclusiveComponentsPath,
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            runId: options.runId,
            count: templateExclusiveComponents.length,
            components: templateExclusiveComponents.map((component) => ({
              name: component.name,
              kebabName: component.kebabName,
              defaultProps: component.defaultProps,
              templateExclusive: component.templateExclusive,
            })),
            usage: templateExclusiveUsage,
          },
          null,
          2
        )
      );
      console.log(
        `[template-factory] template-exclusive components: ${templateExclusiveComponents.length} → ${templateExclusiveComponentsPath}`
      );
    }
  }

  const runLibraryPath = path.join(runDir, "style-profiles.generated.json");
  let runLibrary = null;
  let publishPath = "";
  let publishTemplateExclusiveComponentsPath = "";

  let templateExclusiveConfigSeeded = false;
  if (templateExclusiveComponents.length) {
    await writeGeneratedConfig(templateExclusiveComponents);
    templateExclusiveConfigSeeded = true;
    console.log(
      `[template-factory] seeded config.generated.ts with template-exclusive components=${templateExclusiveComponents.length} (for regression compatibility)`
    );
  }

  let regression = null;
  let regressionElapsedMs = 0;
  let score = null;
  let fidelity = null;
  let fidelityReportPath = null;
  let fidelityGatePassed = null;
  let fidelityGateWouldFail = null;
  let strictFidelityFailures = [];
  let strictFidelityMissing = [];
  let strictPageFidelityFailures = [];
  let strictPageFidelityMissing = [];
  let blockingFidelityFailures = [];
  let blockingPageFidelityFailures = [];
  let fidelityRowsEvaluated = [];
  let regressionAttempts = [];
  let manualFixesPath = null;
  let manualFixes = [];
  let previewLinks = [];
  let previewServer = null;
  const fidelityByCase = new Map(processed.map((item) => [String(item.site?.id || ""), resolveFidelitySettings(item.site, options)]));
  const requiredCasesSelection = selectRequiredCases({
    processed,
    fidelityByCase,
    maxPagesPerSite: Number(options.requiredPagesPerSite || 4),
  });
  const strictCaseIds = Array.isArray(requiredCasesSelection.strictCaseIds) ? requiredCasesSelection.strictCaseIds : [];
  const strictRequiredPageCases = Array.isArray(requiredCasesSelection.requiredPageCases)
    ? requiredCasesSelection.requiredPageCases
    : [];
  const strictFailCaseIds = strictCaseIds.filter((id) => (fidelityByCase.get(id)?.enforcement || "warn") === "fail");
  if (options.fastMode && strictCaseIds.length) {
    console.log(
      `[template-factory] warning: strict fidelity enabled for ${strictCaseIds.length} case(s) but --fast skips regression; similarity is not evaluated in this run.`
    );
  }

  if (options.requestedSkipRegression) {
    console.log("[template-factory] --skip-regression is ignored: template-first regression is mandatory after publish.");
  }
  if (options.groups && options.groups.trim() && options.groups.trim() !== DEFAULT_TEMPLATE_FIRST_GROUP) {
    console.log(
      `[template-factory] groups overridden to ${DEFAULT_TEMPLATE_FIRST_GROUP} (requested=${options.groups.trim()}).`
    );
  }

  if (options.pipelineParallel && !options.fastMode) {
    const regressionStartedAt = Date.now();
    console.log("[template-factory] pipeline parallel mode: regression already completed during site processing");
    const pipelineFidelityRows = processed
      .filter((item) => item?.pipelineRegression)
      .map((item) => ({
        caseId: String(item.site?.id || ""),
        referencePath: item.referenceDesktopPath,
        screenshotPath: item.pipelineRegression.screenshot,
        similarity: item.pipelineRegression.similarity,
        visualSimilarity: item.pipelineRegression.visualSimilarity,
        structureSimilarity: item.pipelineRegression.structureSimilarity,
        pageDetails: Array.isArray(item.pipelineRegression.pageDetails) ? item.pipelineRegression.pageDetails : [],
        mode: item.pipelineRegression.mode,
        threshold: item.pipelineRegression.threshold,
        pageThreshold: item.pipelineRegression.pageThreshold,
        enforcement: item.pipelineRegression.enforcement,
        comparable: typeof item.pipelineRegression.similarity === "number",
        pass: item.pipelineRegression.pass,
      }));

    const numericSimilarities = pipelineFidelityRows
      .map((row) => row.similarity)
      .filter((s) => typeof s === "number");
    const overallSimilarity = numericSimilarities.length
      ? Number((numericSimilarities.reduce((a, b) => a + b, 0) / numericSimilarities.length).toFixed(2))
      : null;

    fidelity = {
      available: numericSimilarities.length > 0,
      overallSimilarity,
      rows: pipelineFidelityRows,
      reason: numericSimilarities.length > 0 ? "ok" : "no_comparable_rows",
    };
    const policyEval = evaluateFidelityRowsAgainstPolicies({
      fidelityRows: pipelineFidelityRows,
      fidelityByCase,
      strictCaseIds,
      strictFailCaseIds,
      strictRequiredPageCases,
      options,
    });
    fidelityRowsEvaluated = policyEval.fidelityRowsEvaluated;
    strictFidelityFailures = policyEval.strictFidelityFailures;
    blockingFidelityFailures = policyEval.blockingFidelityFailures;
    strictFidelityMissing = policyEval.strictFidelityMissing;
    strictPageFidelityFailures = policyEval.strictPageFidelityFailures;
    strictPageFidelityMissing = policyEval.strictPageFidelityMissing;
    blockingPageFidelityFailures = policyEval.blockingPageFidelityFailures;
    fidelityGateWouldFail = policyEval.fidelityGateWouldFail;
    fidelityGatePassed = policyEval.fidelityGatePassed;

    const fidelityReport = {
      generatedAt: new Date().toISOString(),
      runId: options.runId,
      ...fidelity,
      rows: fidelityRowsEvaluated,
      attempts: [],
      strict: {
        requiredCases: strictRequiredPageCases.map((entry) => entry.id),
        requiredCaseSites: strictCaseIds,
        requiredCaseDetails: strictRequiredPageCases,
        missingComparableCases: strictFidelityMissing,
        failedCases: strictFidelityFailures,
        missingComparablePages: strictPageFidelityMissing,
        failedPages: strictPageFidelityFailures,
        gatePassed: fidelityGatePassed,
        gateWouldFail: fidelityGateWouldFail,
        blockingRequiredCases: strictFailCaseIds,
        blockingMissingComparableCases: policyEval.blockingMissing,
        blockingFailedCases: blockingFidelityFailures,
        blockingMissingComparablePages: policyEval.blockingPageMissing,
        blockingFailedPages: blockingPageFidelityFailures,
      },
    };
    fidelityReportPath = path.join(runDir, "fidelity-report.json");
    await fs.writeFile(fidelityReportPath, JSON.stringify(fidelityReport, null, 2));

    previewLinks = [];
    for (const item of processed) {
      if (item?.pipelineRegression?.url) {
        previewLinks.push({
          groupId: DEFAULT_TEMPLATE_FIRST_GROUP,
          caseId: String(item.site?.id || ""),
          pagePath: "/",
          pageName: "Home",
          responseId: null,
          requestId: null,
          url: item.pipelineRegression.url,
          screenshot: item.pipelineRegression.screenshot,
        });
      }
    }

    if (previewLinks.length) {
      await fs.writeFile(path.join(runDir, "preview-links.json"), JSON.stringify(previewLinks, null, 2));
      if (options.launchPreviewServer) {
        previewServer = await ensurePreviewServer({ previewBaseUrl: options.previewBaseUrl });
      } else {
        previewServer = { origin: normalizePreviewBaseUrl(options.previewBaseUrl), reachable: false, started: false };
      }
    }

    manualFixes = buildFidelityManualFixTasks({
      fidelityRows: fidelityRowsEvaluated,
      missingCaseIds: strictFidelityMissing,
      failedPageCases: strictPageFidelityFailures,
      missingPageCases: strictPageFidelityMissing,
      previewLinks,
    });
    manualFixesPath = path.join(runDir, "manual-fix-tasks.json");
    await fs.writeFile(manualFixesPath, JSON.stringify(manualFixes, null, 2));
    regressionElapsedMs = Date.now() - regressionStartedAt;
  } else if (!options.fastMode) {
    const regressionStartedAt = Date.now();
    const maxRepairIterations = Math.max(0, Math.min(5, Number(options.autoRepairIterations || 0)));
    let repairContextByCase = new Map();

    for (let attempt = 0; attempt <= maxRepairIterations; attempt += 1) {
      console.log(`[template-factory] regression attempt ${attempt + 1}/${maxRepairIterations + 1} start`);
      regression = await runWithProgress(
        `run regression attempt ${attempt + 1}/${maxRepairIterations + 1}`,
        () =>
          runRegression({
            runDir,
            sites: processed,
            renderer: options.renderer,
            groups: DEFAULT_TEMPLATE_FIRST_GROUP,
            maxCases: options.maxCases,
            regressionTimeoutMs: options.regressionTimeoutMs,
            attempt,
            repairContextByCase,
          }),
        { prefix: "[template-factory]", heartbeatMs: 30000 }
      );
      if (!regression.reportPath) break;

      const outcome = await runWithProgress(
        `evaluate regression attempt ${attempt + 1}/${maxRepairIterations + 1}`,
        () =>
          evaluateRegressionOutcome({
            reportPath: regression.reportPath,
            processed,
            fidelityByCase,
            strictCaseIds,
            strictFailCaseIds,
            strictRequiredPageCases,
            options,
          }),
        { prefix: "[template-factory]", heartbeatMs: 20000 }
      );
      score = outcome.score;
      fidelity = outcome.fidelity;
      fidelityRowsEvaluated = outcome.fidelityRowsEvaluated;
      strictFidelityFailures = outcome.strictFidelityFailures;
      blockingFidelityFailures = outcome.blockingFidelityFailures;
      strictFidelityMissing = outcome.strictFidelityMissing;
      strictPageFidelityFailures = outcome.strictPageFidelityFailures;
      strictPageFidelityMissing = outcome.strictPageFidelityMissing;
      blockingPageFidelityFailures = outcome.blockingPageFidelityFailures;
      fidelityGateWouldFail = outcome.fidelityGateWouldFail;
      fidelityGatePassed = outcome.fidelityGatePassed;

      regressionAttempts.push({
        attempt,
        reportPath: regression.reportPath,
        overallSimilarity: outcome.fidelity?.overallSimilarity ?? null,
        strictFailures: strictFidelityFailures.length,
        strictMissing: strictFidelityMissing.length,
        strictPageFailures: strictPageFidelityFailures.length,
        strictPageMissing: strictPageFidelityMissing.length,
      });
      console.log(
        `[template-factory] regression attempt ${attempt + 1} summary similarity=${
          outcome.fidelity?.overallSimilarity ?? "n/a"
        } strictFailures=${strictFidelityFailures.length} strictMissing=${strictFidelityMissing.length} strictPageFailures=${strictPageFidelityFailures.length} strictPageMissing=${strictPageFidelityMissing.length}`
      );

      const shouldRepair =
        attempt < maxRepairIterations &&
        strictCaseIds.length > 0 &&
        (
          strictFidelityFailures.length > 0 ||
          strictFidelityMissing.length > 0 ||
          strictPageFidelityFailures.length > 0 ||
          strictPageFidelityMissing.length > 0
        );
      if (!shouldRepair) break;

      const nextRepair = new Map();
      for (const row of strictFidelityFailures) {
        const threshold = Number(row?.threshold || 0);
        const similarity = Number(row?.similarity || 0);
        // Collect section-level hints for repair
        const pageDetails = Array.isArray(row?.pageDetails) ? row.pageDetails : [];
        const sectionHints = [];
        for (const pageRow of pageDetails) {
          const sections = Array.isArray(pageRow?.sectionDetails) ? pageRow.sectionDetails : [];
          for (const section of sections) {
            if (typeof section.similarity === "number" && section.similarity < threshold) {
              sectionHints.push({
                sectionType: section.sectionType || "",
                sectionKind: section.sectionId || "",
                similarity: section.similarity,
                issue: "low fidelity",
              });
            }
          }
        }
        nextRepair.set(String(row.caseId || ""), {
          attempt: attempt + 1,
          threshold,
          similarity,
          gap: Number((threshold - similarity).toFixed(2)),
          sectionHints,
        });
      }
      for (const pageFailure of strictPageFidelityFailures) {
        const caseId = String(pageFailure?.caseId || "");
        if (!caseId) continue;
        const existing = nextRepair.get(caseId) || {
          attempt: attempt + 1,
          threshold: Number(pageFailure?.threshold || options?.strictPageSimilarityMin || 78),
          similarity: null,
          gap: null,
          sectionHints: [],
          issueSummary: {},
        };
        existing.sectionHints = [
          ...(Array.isArray(existing.sectionHints) ? existing.sectionHints : []),
          {
            sectionType: pageFailure.pagePath || "",
            sectionKind: pageFailure.pageName || "",
            similarity: pageFailure.similarity,
            issue: pageFailure.issueType || "low fidelity",
          },
        ].slice(0, 10);
        const issueKey = String(pageFailure.issueType || "copy_density");
        existing.issueSummary = {
          ...(existing.issueSummary || {}),
          [issueKey]: Number(existing.issueSummary?.[issueKey] || 0) + 1,
        };
        if (typeof pageFailure.similarity === "number") {
          const diff = Number(pageFailure.threshold || 0) - Number(pageFailure.similarity || 0);
          if (!Number.isFinite(existing.gap) || diff > Number(existing.gap || 0)) {
            existing.gap = Number(diff.toFixed(2));
          }
          if (!Number.isFinite(existing.similarity)) {
            existing.similarity = Number(pageFailure.similarity);
          }
        }
        nextRepair.set(caseId, existing);
      }
      for (const caseId of strictFidelityMissing) {
        if (!nextRepair.has(String(caseId || ""))) {
          nextRepair.set(String(caseId || ""), {
            attempt: attempt + 1,
            threshold: Number(options.fidelityThreshold || 0),
            similarity: null,
            gap: null,
            issueSummary: { layout: 1 },
            sectionHints: [],
          });
        }
      }
      for (const pageMissing of strictPageFidelityMissing) {
        const caseId = String(pageMissing?.caseId || "");
        if (!caseId) continue;
        if (!nextRepair.has(caseId)) {
          nextRepair.set(caseId, {
            attempt: attempt + 1,
            threshold: Number(options.strictPageSimilarityMin || 78),
            similarity: null,
            gap: null,
            issueSummary: { layout: 1 },
            sectionHints: [],
          });
          continue;
        }
        const existing = nextRepair.get(caseId);
        existing.issueSummary = {
          ...(existing.issueSummary || {}),
          layout: Number(existing.issueSummary?.layout || 0) + 1,
        };
        nextRepair.set(caseId, existing);
      }
      repairContextByCase = nextRepair;
      console.log(
        `[template-factory] auto-repair retry ${attempt + 1}/${maxRepairIterations}: strict_failures=${strictFidelityFailures.length}, missing=${strictFidelityMissing.length}, page_failures=${strictPageFidelityFailures.length}, page_missing=${strictPageFidelityMissing.length}`
      );
    }

    if (score) {
      await fs.writeFile(path.join(runDir, "scorecard.json"), JSON.stringify(score, null, 2));
    }
    if (regressionAttempts.length) {
      await fs.writeFile(path.join(runDir, "regression-attempts.json"), JSON.stringify(regressionAttempts, null, 2));
    }
    if (regression?.reportPath && fidelity) {
      const blockingMissing = strictFidelityMissing.filter((caseId) => strictFailCaseIds.includes(caseId));
      const blockingPageMissing = strictPageFidelityMissing.filter((row) => row.enforcement === "fail");
      const fidelityReport = {
        generatedAt: new Date().toISOString(),
        runId: options.runId,
        ...fidelity,
        rows: fidelityRowsEvaluated,
        attempts: regressionAttempts,
        strict: {
          requiredCases: strictRequiredPageCases.map((entry) => entry.id),
          requiredCaseSites: strictCaseIds,
          requiredCaseDetails: strictRequiredPageCases,
          missingComparableCases: strictFidelityMissing,
          failedCases: strictFidelityFailures,
          missingComparablePages: strictPageFidelityMissing,
          failedPages: strictPageFidelityFailures,
          gatePassed: fidelityGatePassed,
          gateWouldFail: fidelityGateWouldFail,
          blockingRequiredCases: strictFailCaseIds,
          blockingMissingComparableCases: blockingMissing,
          blockingFailedCases: blockingFidelityFailures,
          blockingMissingComparablePages: blockingPageMissing,
          blockingFailedPages: blockingPageFidelityFailures,
        },
      };
      fidelityReportPath = path.join(runDir, "fidelity-report.json");
      await fs.writeFile(fidelityReportPath, JSON.stringify(fidelityReport, null, 2));

      // Generate custom component manifests for each processed site
      // (Aggressive strategy: generate for every section to maximize fidelity)
      const customComponentManifests = [];
      for (const item of processed) {
        const siteId = String(item?.site?.id || "");
        if (!siteId) continue;
        const specPack = item?.specPack;
        const sectionSpecs = specPack?.section_specs && typeof specPack.section_specs === "object" ? specPack.section_specs : {};
        const pageSpecs = Array.isArray(specPack?.page_specs) ? specPack.page_specs : [];

        // Collect section-level fidelity data from the report
        const fidelityRow = fidelityRowsEvaluated.find((r) => String(r?.caseId || "") === siteId);
        const pageDetails = Array.isArray(fidelityRow?.pageDetails) ? fidelityRow.pageDetails : [];
        const sectionFidelityMap = new Map();
        for (const pageRow of pageDetails) {
          const sections = Array.isArray(pageRow?.sectionDetails) ? pageRow.sectionDetails : [];
          for (const section of sections) {
            const key = `${pageRow.pagePath || "/"}:${section.sectionType || section.sectionId || ""}`;
            sectionFidelityMap.set(key, section);
          }
        }

        // Build custom component prompts for homepage sections
        const siteManifest = {
          siteId,
          sections: [],
        };
        for (const [kind, spec] of Object.entries(sectionSpecs)) {
          if (!spec?.block_type || !spec?.defaults) continue;
          const prompt = buildCustomSectionPrompt({
            sectionKind: kind,
            sectionType: spec.block_type,
            defaults: spec.defaults,
            summary: item.summary || {},
            sourceScreenshotUrl: item.referenceDesktopPath || "",
            visualSignature: item.visualSignature || null,
          });
          const puckFields = buildPuckFieldsForCustomComponent(spec.defaults);
          siteManifest.sections.push({
            sectionKind: kind,
            blockType: spec.block_type,
            customComponentName: `Custom${spec.block_type}_${slug(siteId)}_${kind}`,
            prompt,
            puckFields,
            defaults: spec.defaults,
            alternatives: getAlternativeVariants(kind, spec.block_type),
          });
        }

        // Also build for page-specific sections
        for (const page of pageSpecs) {
          const pagePath = normalizeTemplatePagePath(page?.path || "/");
          if (pagePath === "/") continue; // Already handled above
          const pageSectionSpecs = page?.section_specs && typeof page.section_specs === "object" ? page.section_specs : {};
          for (const [kind, spec] of Object.entries(pageSectionSpecs)) {
            if (!spec?.block_type || !spec?.defaults) continue;
            const prompt = buildCustomSectionPrompt({
              sectionKind: kind,
              sectionType: spec.block_type,
              defaults: spec.defaults,
              summary: page.summary || item.summary || {},
              sourceScreenshotUrl: "",
              visualSignature: item.visualSignature || null,
            });
            const puckFields = buildPuckFieldsForCustomComponent(spec.defaults);
            siteManifest.sections.push({
              pagePath,
              sectionKind: kind,
              blockType: spec.block_type,
              customComponentName: `Custom${spec.block_type}_${slug(siteId)}_${slug(pagePath)}_${kind}`,
              prompt,
              puckFields,
              defaults: spec.defaults,
              alternatives: getAlternativeVariants(kind, spec.block_type),
            });
          }
        }

        if (siteManifest.sections.length) {
          customComponentManifests.push(siteManifest);
        }
      }

      if (customComponentManifests.length) {
        const manifestPath = path.join(runDir, "custom-component-manifests.json");
        await fs.writeFile(manifestPath, JSON.stringify(customComponentManifests, null, 2));
        console.log(
          `[template-factory] custom component manifests: ${customComponentManifests.length} sites, ${customComponentManifests.reduce((acc, m) => acc + m.sections.length, 0)} sections → ${manifestPath}`
        );
      }

      previewLinks = await collectTemplateFirstPreviewLinks({
        reportPath: regression.reportPath,
        previewBaseUrl: options.previewBaseUrl,
      });
      if (!previewLinks.length) {
        previewLinks = await collectPreviewLinksFromRunArtifacts({
          runDir,
          processed,
          previewBaseUrl: options.previewBaseUrl,
        });
      }
      if (previewLinks.length) {
        await fs.writeFile(path.join(runDir, "preview-links.json"), JSON.stringify(previewLinks, null, 2));
        if (options.launchPreviewServer) {
          previewServer = await ensurePreviewServer({ previewBaseUrl: options.previewBaseUrl });
        } else {
          previewServer = { origin: normalizePreviewBaseUrl(options.previewBaseUrl), reachable: false, started: false };
        }
      }
      manualFixes = buildFidelityManualFixTasks({
        fidelityRows: fidelityRowsEvaluated,
        missingCaseIds: strictFidelityMissing,
        failedPageCases: strictPageFidelityFailures,
        missingPageCases: strictPageFidelityMissing,
        previewLinks,
      });
      manualFixesPath = path.join(runDir, "manual-fix-tasks.json");
      await fs.writeFile(manualFixesPath, JSON.stringify(manualFixes, null, 2));
    }
    regressionElapsedMs = Date.now() - regressionStartedAt;
  } else {
    previewLinks = await collectPreviewLinksFromRunArtifacts({
      runDir,
      processed,
      previewBaseUrl: options.previewBaseUrl,
    });
    if (previewLinks.length) {
      await fs.writeFile(path.join(runDir, "preview-links.json"), JSON.stringify(previewLinks, null, 2));
      if (options.launchPreviewServer) {
        previewServer = await ensurePreviewServer({ previewBaseUrl: options.previewBaseUrl });
      } else {
        previewServer = { origin: normalizePreviewBaseUrl(options.previewBaseUrl), reachable: false, started: false };
      }
    }
  }

  // Materialize custom components from payload.json → static .tsx files + Puck config
  let materializedComponents = [];
  let generatedConfigComponents = [];
  try {
    const namingRegistry = new Map();
    for (const item of processed) {
      const siteId = String(item?.site?.id || "");
      if (!siteId) continue;
      const siteKey = `bench_${slug(options.runId)}_${DEFAULT_TEMPLATE_FIRST_GROUP}_${slug(siteId)}`;
      const payloadPath = path.join(ROOT, "..", "asset-factory", "out", siteKey, "sandbox", "payload.json");
      try {
        await fs.access(payloadPath);
      } catch {
        // Also try without bench_ prefix
        const altSiteKey = siteId;
        const altPayloadPath = path.join(ROOT, "..", "asset-factory", "out", altSiteKey, "sandbox", "payload.json");
        try {
          await fs.access(altPayloadPath);
          const result = await materializeFromPayload(altPayloadPath, altSiteKey, { namingRegistry });
          if (result.components.length) {
            materializedComponents.push(...result.components);
            console.log(
              `[template-factory] materialized ${result.components.length} components from ${altSiteKey}`
            );
          }
          continue;
        } catch {
          continue;
        }
      }
      const result = await materializeFromPayload(payloadPath, siteKey, { namingRegistry });
      if (result.components.length) {
        materializedComponents.push(...result.components);
        console.log(
          `[template-factory] materialized ${result.components.length} components from ${siteKey}`
        );
      }
    }
    generatedConfigComponents = mergeTemplateExclusiveComponents(materializedComponents, templateExclusiveComponents);
    if (generatedConfigComponents.length) {
      await writeGeneratedConfig(generatedConfigComponents);
      const materializeReport = {
        generatedAt: new Date().toISOString(),
        runId: options.runId,
        components: generatedConfigComponents.map((c) => {
          if (c?.templateExclusive) {
            return {
              name: c.name,
              blockDir: c.blockDir || `@/components/blocks/${c.kebabName}/block`,
              collisionFrom: c.collisionFrom || null,
              signature: c.signature || null,
              configEntry: true,
              source: "template_exclusive",
              templateExclusive: c.templateExclusive,
            };
          }
          return {
            name: c.name,
            blockDir: c.blockDir,
            collisionFrom: c.collisionFrom || null,
            signature: c.signature || null,
            configEntry: c.configEntry ? true : false,
            source: "payload_materialized",
          };
        }),
      };
      await fs.writeFile(
        path.join(runDir, "materialized-components.json"),
        JSON.stringify(materializeReport, null, 2)
      );
      console.log(
        `[template-factory] generated config components=${generatedConfigComponents.length} (materialized=${materializedComponents.length}, template-exclusive=${templateExclusiveComponents.length}) → src/puck/config.generated.ts`
      );
    }
  } catch (materializeErr) {
    console.warn(
      `[template-factory] component materialization failed (non-fatal): ${materializeErr?.message || materializeErr}`
    );
  }

  const blockingMissingCases = strictFidelityMissing.filter((caseId) => strictFailCaseIds.includes(caseId));
  const blockingMissingPages = strictPageFidelityMissing.filter((row) => row.enforcement === "fail");
  const gateReport = evaluateRunGates({
    runId: options.runId,
    options: {
      fidelityMode: options.fidelityMode,
      strictRequiredCasesPolicy: options.strictRequiredCasesPolicy,
    },
    fidelity: {
      overallSimilarity: fidelity?.overallSimilarity ?? null,
    },
    strict: {
      requiredCases: strictRequiredPageCases.map((entry) => entry.id),
      requiredCaseSites: strictCaseIds,
      missingComparableCases: strictFidelityMissing,
      failedCases: strictFidelityFailures,
      missingComparablePages: strictPageFidelityMissing,
      failedPages: strictPageFidelityFailures,
      blockingRequiredCases: strictFailCaseIds,
      blockingMissingComparableCases: blockingMissingCases,
      blockingFailedCases: blockingFidelityFailures,
      blockingMissingComparablePages: blockingMissingPages,
      blockingFailedPages: blockingPageFidelityFailures,
    },
  });
  const gateReportPath = path.join(runDir, "gate-report.json");
  await fs.writeFile(gateReportPath, JSON.stringify(gateReport, null, 2));

  runLibrary = buildRunLibraryOutput({
    processed,
    runId: options.runId,
    manifestPath,
    fidelityRows: fidelityRowsEvaluated,
    templateExclusiveComponents,
  });
  await fs.writeFile(runLibraryPath, JSON.stringify(runLibrary, null, 2));

  const publishResult = await mergeAndPublishRunLibrary({
    runLibrary,
    allowPublish: Boolean(options.publish) && Boolean(gateReport.gatePassed),
    runId: options.runId,
  });
  publishPath = publishResult.publishPath;
  publishTemplateExclusiveComponentsPath = publishResult.publishTemplateExclusiveComponentsPath;
  if (options.publish && !gateReport.gatePassed) {
    console.warn("[template-factory] publish skipped: run gate not passed.");
  }

  const summary = {
    runId: options.runId,
    manifestPath,
    sites: processed.length,
    crawlSite: options.crawlSite,
    crawlMaxPages: options.crawlMaxPages,
    crawlMaxDepth: options.crawlMaxDepth,
    crawlCapturePages: options.crawlCapturePages,
    maxDiscoveredPages: options.maxDiscoveredPages,
    maxNavLinks: options.maxNavLinks,
    mustIncludePatterns: options.mustIncludePatterns,
    antiCrawlPrecheck: options.antiCrawlPrecheck,
    antiCrawlTimeoutMs: options.antiCrawlTimeoutMs,
    fastMode: options.fastMode,
    fidelityMode: options.fidelityMode,
    fidelityThreshold: options.fidelityThreshold,
    strictAvgSimilarityMin: options.strictAvgSimilarityMin,
    strictPageSimilarityMin: options.strictPageSimilarityMin,
    fidelityStructureWeight: options.fidelityStructureWeight,
    requiredPagesPerSite: options.requiredPagesPerSite,
    fidelityEnforcement: options.fidelityEnforcement,
    strictRequiredCasesPolicy: options.strictRequiredCasesPolicy,
    templateExclusiveBlocks: options.templateExclusiveBlocks,
    autoRepairIterations: options.autoRepairIterations,
    pixelMode: options.pixelMode,
    pipelineParallelConcurrency: options.pipelineParallelConcurrency,
    screenshotConcurrency: options.screenshotConcurrency,
    crawlConcurrency: options.crawlConcurrency,
    regressionConcurrency: options.regressionConcurrency,
    screenshotTimeoutMs: options.screenshotTimeoutMs,
    crawlTimeoutMs: options.crawlTimeoutMs,
    siteRetryCount: options.siteRetryCount,
    siteRetryDelayMs: options.siteRetryDelayMs,
    siteCircuitBreakerThreshold: options.siteCircuitBreakerThreshold,
    regressionTimeoutMs: options.regressionTimeoutMs,
    regressionElapsedMs,
    regressionElapsed: formatElapsed(regressionElapsedMs),
    runDir,
    runLibraryPath,
    publishPath,
    publishTemplateExclusiveComponentsPath,
    publishReason: publishResult.reason,
    regressionPromptsPath: regression?.promptsPath || null,
    regressionReportPath: regression?.reportPath || null,
    regressionAttemptsPath: regressionAttempts.length ? path.join(runDir, "regression-attempts.json") : null,
    scorecardPath: score ? path.join(runDir, "scorecard.json") : null,
    overallScore: score?.overallScore ?? null,
    fidelityReportPath,
    overallSimilarity: fidelity?.overallSimilarity ?? null,
    fidelityGatePassed,
    fidelityGateWouldFail,
    runGatePassed: gateReport.gatePassed,
    gateReportPath,
    templateExclusiveComponentsPath,
    templateExclusiveComponentCount: templateExclusiveComponents.length,
    templateExclusiveConfigSeeded,
    generatedConfigComponentCount: generatedConfigComponents.length,
    strictFidelityFailures,
    strictFidelityMissing,
    strictPageFidelityFailures,
    strictPageFidelityMissing,
    strictRequiredPageCases,
    blockingFidelityFailures,
    blockingPageFidelityFailures,
    manualFixesPath,
    manualFixesCount: manualFixes.length,
    previewBaseUrl: normalizePreviewBaseUrl(options.previewBaseUrl),
    previewLinksPath: previewLinks.length ? path.join(runDir, "preview-links.json") : null,
    previewLinks,
    previewServer,
    previewStartCommand: DEFAULT_PREVIEW_START_COMMAND,
    extractionFailures: processed.flatMap((item) => {
      const rows = Array.isArray(item?.specPack?.extraction_failures) ? item.specPack.extraction_failures : [];
      return rows.map((row) => ({
        caseId: String(item?.site?.id || ""),
        path: String(row?.path || ""),
        reason: String(row?.reason || "unknown"),
        source: String(row?.source || ""),
        url: String(row?.url || ""),
      }));
    }),
    linkIntegrity: processed.map((item) => ({
      caseId: String(item?.site?.id || ""),
      stats: item?.linkReport?.stats || null,
    })),
  };

  await fs.writeFile(path.join(runDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(
    `[template-factory] run finished id=${options.runId} elapsed=${formatElapsed(Date.now() - runStartedAt)} summary=${path.join(
      runDir,
      "summary.json"
    )}`
  );
  if (strictCaseIds.length && fidelityGateWouldFail) {
    const failedDetail = strictFidelityFailures
      .map((row) => `${row.caseId}(${row.similarity} < ${row.threshold})`)
      .join(", ");
    const missingDetail = strictFidelityMissing.join(", ");
    const failedPageDetail = strictPageFidelityFailures
      .map((row) => `${row.caseId}${row.pagePath}(${row.similarity} < ${row.threshold})`)
      .join(", ");
    const missingPageDetail = strictPageFidelityMissing
      .map((row) => `${row.caseId}${row.pagePath}`)
      .join(", ");
    console.log(
      `[template-factory] fidelity warning: strict targets below threshold. failed=[${failedDetail || "none"}], missing=[${missingDetail || "none"}], failedPages=[${failedPageDetail || "none"}], missingPages=[${missingPageDetail || "none"}].`
    );
  }

  console.log("\n[template-factory] done");
  console.log(`[template-factory] runDir: ${runDir}`);
  console.log(`[template-factory] run library: ${runLibraryPath}`);
  if (publishPath) console.log(`[template-factory] published library: ${publishPath}`);
  if (publishTemplateExclusiveComponentsPath) {
    console.log(`[template-factory] published template-exclusive components: ${publishTemplateExclusiveComponentsPath}`);
  }
  if (regression?.reportPath) console.log(`[template-factory] regression report: ${regression.reportPath}`);
  if (score?.overallScore !== undefined && score?.overallScore !== null) {
    console.log(`[template-factory] overall score: ${score.overallScore}`);
  }
  if (previewServer?.origin) {
    const status = previewServer.reachable ? "ready" : "unreachable";
    const mode = previewServer.mode || (previewServer.started ? "started" : "existing");
    console.log(`[template-factory] preview server: ${previewServer.origin} (${status}, ${mode})`);
    if (previewServer.logPath) {
      console.log(`[template-factory] preview server log: ${previewServer.logPath}`);
    }
  }
  if (previewLinks.length) {
    console.log("[template-factory] template-first preview links:");
    for (const row of previewLinks) {
      console.log(`  - ${row.caseId}: ${row.url}`);
    }
    console.log(`[template-factory] if links are not reachable, run: ${DEFAULT_PREVIEW_START_COMMAND}`);
  }
  if (!gateReport.gatePassed) {
    const issues = Array.isArray(gateReport.issues) ? gateReport.issues : [];
    const detail = issues.map((issue) => `${issue.code}:${issue.message}`).join("; ");
    throw new Error(`[template-factory] run gate failed (${gateReportPath}) ${detail}`);
  }
  };

  if (Number(options.totalTimeoutMs) > 0) {
    const timeoutMs = Math.floor(Number(options.totalTimeoutMs));
    console.log(`[template-factory] total timeout set: ${formatElapsed(timeoutMs)}`);
    let timeoutId = null;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`Total timeout exceeded: ${formatElapsed(timeoutMs)}`)), timeoutMs);
    });
    try {
      await Promise.race([runMain(), timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
    return;
  }

  await runMain();
};

main().catch((error) => {
  const message = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
  console.error(`[template-factory:fatal] ${message}`);
  process.exit(1);
});
