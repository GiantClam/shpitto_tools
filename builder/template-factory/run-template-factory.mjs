#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const FACTORY_DIR = path.join(ROOT, "template-factory");
const RUNS_DIR = path.join(FACTORY_DIR, "runs");
const LIB_DIR = path.join(FACTORY_DIR, "library");
const PUBLIC_TEMPLATE_ASSETS_DIR = path.join(ROOT, "public", "assets", "template-factory");
const DEFAULT_MANIFEST = path.join(FACTORY_DIR, "sites.example.json");
const DEFAULT_PUBLISH_PATH = path.join(LIB_DIR, "style-profiles.generated.json");
const DEFAULT_TEMPLATE_FIRST_GROUP = "C_template_first";
const DEFAULT_PREVIEW_BASE_URL = process.env.TEMPLATE_FACTORY_PREVIEW_BASE_URL || "http://127.0.0.1:3110";
const DEFAULT_PREVIEW_START_COMMAND = "cd builder && npm run dev -- -p 3110";
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

const nowStamp = () => {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(
    d.getSeconds()
  )}`;
};

const slug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const parseArgs = (argv) => {
  const options = {
    manifest: DEFAULT_MANIFEST,
    runId: `tf-${nowStamp()}`,
    skipIngest: false,
    requestedSkipRegression: false,
    publish: true,
    groups: DEFAULT_TEMPLATE_FIRST_GROUP,
    renderer: "sandbox",
    maxCases: 0,
    previewBaseUrl: DEFAULT_PREVIEW_BASE_URL,
    launchPreviewServer: true,
    crawlSite: false,
    crawlMaxPages: 16,
    crawlMaxDepth: 1,
    antiCrawlPrecheck: true,
    antiCrawlTimeoutMs: 25000,
    fastMode: false,
    fidelityMode: "standard",
    fidelityThreshold: 72,
    fidelityEnforcement: "warn",
    autoRepairIterations: 0,
    pixelMode: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--manifest" && next) {
      options.manifest = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--run-id" && next) {
      options.runId = slug(next) || options.runId;
      i += 1;
      continue;
    }
    if (arg === "--groups" && next) {
      options.groups = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--renderer" && next) {
      options.renderer = String(next).trim().toLowerCase() === "render" ? "render" : "sandbox";
      i += 1;
      continue;
    }
    if (arg === "--preview-base-url" && next) {
      options.previewBaseUrl = String(next).trim() || options.previewBaseUrl;
      i += 1;
      continue;
    }
    if (arg === "--max-cases" && next) {
      options.maxCases = Number(next) || 0;
      i += 1;
      continue;
    }
    if (arg === "--skip-ingest") {
      options.skipIngest = true;
      continue;
    }
    if (arg === "--skip-regression") {
      options.requestedSkipRegression = true;
      continue;
    }
    if (arg === "--crawl-site") {
      options.crawlSite = true;
      continue;
    }
    if (arg === "--crawl-max-pages" && next) {
      options.crawlMaxPages = Math.max(1, Math.floor(Number(next) || 0)) || options.crawlMaxPages;
      i += 1;
      continue;
    }
    if (arg === "--crawl-max-depth" && next) {
      options.crawlMaxDepth = Math.max(0, Math.floor(Number(next) || 0));
      i += 1;
      continue;
    }
    if (arg === "--anti-crawl-precheck") {
      options.antiCrawlPrecheck = true;
      continue;
    }
    if (arg === "--no-anti-crawl-precheck") {
      options.antiCrawlPrecheck = false;
      continue;
    }
    if (arg === "--anti-crawl-timeout-ms" && next) {
      options.antiCrawlTimeoutMs = Math.max(1000, Math.floor(Number(next) || 0)) || options.antiCrawlTimeoutMs;
      i += 1;
      continue;
    }
    if (arg === "--fast") {
      options.fastMode = true;
      continue;
    }
    if (arg === "--fidelity-mode" && next) {
      const mode = String(next).trim().toLowerCase();
      options.fidelityMode = mode === "strict" ? "strict" : "standard";
      i += 1;
      continue;
    }
    if (arg === "--fidelity-threshold" && next) {
      const threshold = Math.floor(Number(next));
      if (Number.isFinite(threshold)) {
        options.fidelityThreshold = Math.max(0, Math.min(100, threshold));
      }
      i += 1;
      continue;
    }
    if (arg === "--fidelity-enforcement" && next) {
      const enforcement = String(next).trim().toLowerCase();
      options.fidelityEnforcement = enforcement === "fail" ? "fail" : "warn";
      i += 1;
      continue;
    }
    if (arg === "--auto-repair-iterations" && next) {
      const count = Math.floor(Number(next));
      if (Number.isFinite(count)) {
        options.autoRepairIterations = Math.max(0, Math.min(5, count));
      }
      i += 1;
      continue;
    }
    if (arg === "--pixel-mode") {
      options.pixelMode = true;
      continue;
    }
    if (arg === "--no-publish") {
      options.publish = false;
      continue;
    }
    if (arg === "--no-preview-server") {
      options.launchPreviewServer = false;
      continue;
    }
  }

  if (options.pixelMode) {
    options.fidelityMode = "strict";
    options.fidelityThreshold = Math.max(82, Number(options.fidelityThreshold || 0));
    options.fidelityEnforcement = "warn";
    options.autoRepairIterations = Math.max(2, Number(options.autoRepairIterations || 0));
  }

  return options;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0 && !options.allowFailure) {
        reject(new Error(`Command failed (${code}): ${cmd}\n${stderr || stdout}`));
        return;
      }
      resolve({ code: code ?? 0, stdout, stderr });
    });
  });

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
  const fidelityEnforcementRaw =
    typeof raw.fidelityEnforcement === "string"
      ? raw.fidelityEnforcement
      : typeof raw.fidelity_enforcement === "string"
        ? raw.fidelity_enforcement
        : "";
  const fidelityEnforcement = String(fidelityEnforcementRaw || "").trim().toLowerCase() === "fail" ? "fail" : "warn";

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
    antiCrawlPrecheck,
    antiCrawlTimeoutMs,
    fidelityMode,
    fidelityThreshold,
    fidelityEnforcement,
  };
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

const captureWithBrowser = async ({ url, outPath, mobile, browser, waitMs = 3500 }) => {
  const device = mobile ? ' --device "iPhone 13"' : "";
  const browserArg = browser ? ` --browser ${browser}` : "";
  const cmd = `cd ${JSON.stringify(
    ROOT
  )} && npx playwright screenshot --full-page${browserArg}${device} --wait-for-timeout ${Math.floor(
    waitMs
  )} ${JSON.stringify(url)} ${JSON.stringify(outPath)}`;
  await runShell(cmd, { cwd: ROOT });
};

const captureWithPuppeteer = async ({ url, outPath, mobile }) => {
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

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
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

const captureScreenshot = async ({ url, outPath, mobile = false }) => {
  if (!url) return null;
  await ensureDir(path.dirname(outPath));

  try {
    await captureWithPuppeteer({ url, outPath, mobile });
  } catch {
    await captureWithBrowser({ url, outPath, mobile, browser: "chromium", waitMs: 3500 });
    if (await isLikelyBlankScreenshot(outPath)) {
      await captureWithBrowser({ url, outPath, mobile, browser: "webkit", waitMs: 5000 });
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

const captureScreenshotSafe = async ({ url, outPath, mobile }) => {
  try {
    return await captureScreenshot({ url, outPath, mobile });
  } catch {
    return null;
  }
};

const buildCrawledPageAssetPack = async ({ siteId, crawl, ingestDir }) => {
  if (!crawl?.enabled) return null;

  const pagesDir = path.join(ingestDir, "pages");
  await ensureDir(pagesDir);
  const successfulPages = Array.isArray(crawl?.pages)
    ? crawl.pages.filter((page) => page && !page.error && Number(page.status || 0) > 0 && Number(page.status || 0) < 500)
    : [];
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

  for (const [index, page] of successfulPages.entries()) {
    const routePath = routePathFromUrl(page.url);
    if (byPath.has(routePath)) continue;
    const routeSlug = routeSlugFromPath(routePath) || `page-${index + 1}`;
    const pageDir = path.join(pagesDir, routeSlug);
    await ensureDir(pageDir);

    const desktopPath = path.join(pageDir, "desktop.auto.png");
    const mobilePath = path.join(pageDir, "mobile.auto.png");
    const desktopShot = await captureScreenshotSafe({ url: page.url, outPath: desktopPath, mobile: false });
    const mobileShot = await captureScreenshotSafe({ url: page.url, outPath: mobilePath, mobile: true });
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

const inferPaletteProfileFromVisualSignature = (visualSignature) => {
  const isDark = Boolean(visualSignature?.isDark);
  const colors = Array.isArray(visualSignature?.dominantColors)
    ? visualSignature.dominantColors.map((item) => String(item || "").toLowerCase())
    : [];
  const joined = colors.join(" ");
  const blueCyan =
    /#0|#1|#2|#3/.test(joined) &&
    colors.some((hex) => /^#?[0-9a-f]{6}$/i.test(hex || ""));

  if (isDark && blueCyan) {
    return {
      paletteProfile: "deep-blue-cyan",
      navGradient: "linear-gradient(180deg,#03122e 0%,#071b45 100%)",
      bodyGradient: "linear-gradient(180deg,#04152f 0%,#08234c 100%)",
      footerGradient: "linear-gradient(180deg,#03122e 0%,#020a1d 100%)",
      overlayStrong: "rgba(3, 16, 40, 0.58)",
      overlaySoft: "rgba(2,10,24,0.24)",
      accent: "#00c6d8",
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
      accent: "#38bdf8",
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
    accent: "#0ea5e9",
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
  const palette = inferPaletteProfileFromVisualSignature(visualSignature);
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

const buildNavigationFromSitePages = (sitePages = [], currentPath = "/") => {
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
    if (links.length >= 6) break;
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

const buildFooterColumnsFromSitePages = (sitePages = [], footerLinks = []) => {
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
  for (const [index, page] of pages.slice(0, 12).entries()) {
    columns[index % columns.length].links.push(page);
  }
  return columns.filter((column) => column.links.length > 0);
};

const buildSectionDefaults = (kind, spec, site, summary, assetContext = {}, recipe = null, context = {}) => {
  const pageTitle = summary.title || site.id || "Site";
  const promptLine = site.prompt || site.description || "";
  const defaults = { ...(spec.defaults || {}) };
  const blockType = String(spec?.blockType || "");
  const currentPath = normalizeTemplatePagePath(context?.currentPath || "/");
  const sitePages = Array.isArray(context?.sitePages) ? context.sitePages : [];
  const pageHeadline = summaryHeadline(summary, promptLine || `Welcome to ${pageTitle}`);
  const pageSubhead = summarySubhead(
    summary,
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

  const poolFor = (sectionKey) => {
    const gallery = Array.isArray(galleryBySection?.[sectionKey]) ? galleryBySection[sectionKey] : [];
    if (imageSourcePolicy === "source_or_gallery") return [...sourceImages, ...gallery];
    return [...gallery, ...sourceImages];
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
    const navFromSitePages = buildNavigationFromSitePages(sitePages, currentPath);
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
  }

  if (kind === "hero") {
    defaults.title = defaults.title || pageHeadline.slice(0, 96);
    defaults.subtitle = defaults.subtitle || pageSubhead.slice(0, 160);
    const navFromSitePages = buildNavigationFromSitePages(sitePages, currentPath);
    defaults.ctas = defaults.ctas || navFromSitePages?.ctas || [{ label: "Get Started", href: "#contact", variant: "primary" }];
    const shouldUseCarousel =
      carouselCapableHeroBlocks.has(blockType) && Boolean(heroCarousel.enabled) && generatedHeroSlides.length >= 2;
    if (shouldUseCarousel) {
      const existingSlides = Array.isArray(defaults.heroSlides)
        ? defaults.heroSlides.filter((slide) => typeof slide?.src === "string" && slide.src.trim())
        : [];
      defaults.heroSlides = existingSlides.length >= 2 ? existingSlides : generatedHeroSlides;
      defaults.heroCarouselAutoplayMs = Number(defaults.heroCarouselAutoplayMs || 4500);
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
    defaults.title = defaults.title || summaryHeadline(summary, `Why ${pageTitle}`).slice(0, 92);
    defaults.subtitle = defaults.subtitle || summarySubhead(summary, "Crafted experiences, measured outcomes, and durable visual language.").slice(0, 180);
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
    defaults.title = defaults.title || summaryHeadline(summary, "Key Capabilities").slice(0, 88);
    defaults.subtitle = defaults.subtitle || summarySubhead(summary, "Designed for scale, precision, and reliable execution.").slice(0, 160);
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
    defaults.title = defaults.title || summaryHeadline(summary, "Product Portfolio").slice(0, 92);
    defaults.subtitle = defaults.subtitle || summarySubhead(summary, "Modular blocks tailored to your site objectives.").slice(0, 180);
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
  }

  if (kind === "cta") {
    defaults.title = defaults.title || summaryHeadline(summary, "Ready to define your space?").slice(0, 88);
    defaults.subtitle = defaults.subtitle || summarySubhead(summary, "Book a private consultation or browse the lookbook.").slice(0, 170);
    const navFromSitePages = buildNavigationFromSitePages(sitePages, currentPath);
    defaults.cta = defaults.cta || navFromSitePages?.ctas?.[0] || { label: "Inquire Now", href: "#contact", variant: "primary" };
  }

  if (kind === "footer") {
    defaults.logoText = defaults.logoText || pageTitle.split("|")[0].trim().slice(0, 24) || "Site";
    defaults.columns =
      defaults.columns ||
      buildFooterColumnsFromSitePages(sitePages, Array.isArray(summary?.footerLinks) ? summary.footerLinks : []) || [
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
  const raw = String(value || "").trim();
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
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

const classifyTemplatePageType = (pathValue, title = "") => {
  const path = normalizeTemplatePagePath(pathValue);
  const token = `${path} ${title}`.toLowerCase();
  if (path === "/") return "home";
  if (/privacy|terms|policy|legal|cookies?/.test(token)) return "legal";
  if (/blog|journal|news|insight|article|resource|press|media/.test(token)) return "blog";
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

const buildSitePagesFromCrawl = ({ recipe, summary, crawl }) => {
  if (!crawl?.enabled) return [];

  const pageMap = new Map();
  const upsert = ({ pathValue, name, pageType, source }) => {
    const path = normalizeTemplatePagePath(pathValue);
    const kinds = resolveTemplatePageKinds({ pageType, recipe });
    if (!kinds.length) return;
    const current = pageMap.get(path);
    const next = {
      path,
      name: String(name || "").trim() || formatTemplatePageName(path),
      required_categories: kinds,
      source,
    };
    if (!current) {
      pageMap.set(path, next);
      return;
    }
    // Prefer crawl-derived naming over default naming for the same path.
    if (current.source === "default" && source === "crawl") {
      pageMap.set(path, { ...current, ...next });
    }
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
    });
  }

  const discoveredUrls = Array.isArray(crawl?.discoveredUrls) ? crawl.discoveredUrls : [];
  for (const rawUrl of discoveredUrls.slice(0, 80)) {
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

  return pages.slice(0, 12).map((page) => ({
    path: page.path,
    name: page.name,
    required_categories: page.required_categories,
  }));
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
    const name = String(page?.name || "").trim();
    const leaf = routePath.split("/").filter(Boolean).pop() || "";
    const segmentTokens = routePath.split("/").filter(Boolean);
    setAlias(name, routePath);
    setAlias(routePath, routePath);
    setAlias(leaf, routePath);
    for (const segment of segmentTokens) setAlias(segment, routePath);
  }
  return aliasMap;
};

const rewriteAnchorHrefToRoute = (href, aliasMap) => {
  const raw = String(href || "").trim();
  if (!raw || !raw.startsWith("#")) return href;
  const token = raw.slice(1).trim();
  if (!token) return "/";
  const lookup = slug(token);
  return aliasMap.get(lookup) || raw;
};

const rewriteAnchorLinksDeep = (value, aliasMap) => {
  if (Array.isArray(value)) return value.map((item) => rewriteAnchorLinksDeep(item, aliasMap));
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === "href" && typeof v === "string") {
      out[k] = rewriteAnchorHrefToRoute(v, aliasMap);
      continue;
    }
    out[k] = rewriteAnchorLinksDeep(v, aliasMap);
  }
  return out;
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

const buildPageSpecsFromSitePages = ({
  site,
  recipe,
  summary,
  assets = {},
  sitePages = [],
  crawlAssetPack = null,
}) => {
  const routeAliasMap = buildRouteAliasMap(sitePages);
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
      const pageSummary = pageAsset?.summary ? { ...summary, ...pageAsset.summary } : summary;
      const pageAssets = pageAsset?.assetContext || assets || {};
      const sectionSpecs = {};
      for (const kind of requiredCategories) {
        const spec = recipe?.sectionSpecs?.[kind];
        if (!spec) continue;
        sectionSpecs[kind] = {
          block_type: spec.blockType,
          defaults: buildSectionDefaults(kind, spec, site, pageSummary, pageAssets, recipe, {
            currentPath: path,
            sitePages,
          }),
        };
      }
      for (const kind of Object.keys(sectionSpecs)) {
        const entry = sectionSpecs[kind];
        if (!entry?.defaults || typeof entry.defaults !== "object") continue;
        entry.defaults = rewriteAnchorLinksDeep(entry.defaults, routeAliasMap);
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

const buildSpecPack = ({ site, recipe, summary, assets = {}, crawl = null, crawlAssetPack = null }) => {
  const sitePages = buildSitePagesFromCrawl({ recipe, summary, crawl });
  const sectionSpecs = {};
  for (const kind of SECTION_KINDS) {
    const spec = recipe.sectionSpecs[kind];
    if (!spec) continue;
    sectionSpecs[kind] = {
      block_type: spec.blockType,
      defaults: buildSectionDefaults(kind, spec, site, summary, assets, recipe, {
        currentPath: "/",
        sitePages,
      }),
    };
  }
  const pageSpecs = buildPageSpecsFromSitePages({
    site,
    recipe,
    summary,
    assets,
    sitePages,
    crawlAssetPack,
  });
  const normalizedPageSpecs = enforceDistinctHeroes(pageSpecs);

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
    ...(sitePages.length ? { site_pages: sitePages } : {}),
    ...(normalizedPageSpecs.length ? { page_specs: normalizedPageSpecs } : {}),
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

const mergeProfiles = (existingProfiles, incomingProfiles) => {
  const map = new Map();
  for (const profile of existingProfiles || []) {
    if (!profile?.id) continue;
    map.set(String(profile.id), profile);
  }
  for (const profile of incomingProfiles || []) {
    if (!profile?.id) continue;
    map.set(String(profile.id), profile);
  }
  return Array.from(map.values());
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
  parts.push(
    "Preserve route structure, but tighten spacing scale, color tokens, typography weight, and hero/image composition toward source."
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
  const navDepth = Number(summary?.navMenuDepth || 1);
  const heroMode = normalizeHeroPresentation(summary?.heroPresentation)?.mode;
  const hasHeroCarousel =
    Boolean(summary?.heroCarousel?.enabled) &&
    Array.isArray(summary?.heroCarousel?.images) &&
    summary.heroCarousel.images.length >= 2;
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
  const { stdout, stderr } = await runShell(cmd, { cwd: ROOT });
  const out = `${stdout}\n${stderr}`;
  const match = out.match(/\[done\] report\(json\):\s+(.+)\s*$/m);
  const reportPath = match?.[1]?.trim() || "";

  return {
    promptsPath,
    reportPath,
    rawOutput: out,
  };
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

    if (pageEntries.length > 1 && parsedUrl) {
      for (const page of pageEntries) {
        const pageParam = page.pagePath === "/" ? "home" : page.pagePath;
        const nextUrl = new URL(parsedUrl.toString());
        nextUrl.searchParams.set("page", pageParam);
        links.push({
          groupId: DEFAULT_TEMPLATE_FIRST_GROUP,
          caseId,
          pagePath: page.pagePath,
          pageName: page.pageName,
          responseId: row.responseId || null,
          requestId: row.requestId || null,
          url: nextUrl.toString(),
          screenshot: typeof row.screenshot === "string" ? row.screenshot : "",
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

const evaluateVisualFidelity = async ({ reportPath, processed }) => {
  if (!reportPath) {
    return {
      available: false,
      overallSimilarity: null,
      rows: [],
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
  for (const row of rows) {
    const caseId = String(row?.caseId || "");
    if (!caseId) continue;
    const item = processedByCase.get(caseId);
    if (!item) continue;
    const referencePath = String(item?.referenceDesktopPath || "").trim();
    const screenshotPath = typeof row?.screenshot === "string" ? row.screenshot.trim() : "";
    const similarity = await computeImageSimilarity(referencePath, screenshotPath);
    scoredRows.push({
      caseId,
      referencePath,
      screenshotPath,
      similarity,
    });
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
    reason: numeric.length > 0 ? "ok" : "no_comparable_rows",
  };
};

const resolveFidelitySettings = (site, options) => {
  const globalMode = String(options?.fidelityMode || "").trim().toLowerCase() === "strict" ? "strict" : "standard";
  const siteMode = String(site?.fidelityMode || "").trim().toLowerCase() === "strict" ? "strict" : "standard";
  const mode = globalMode === "strict" || siteMode === "strict" ? "strict" : "standard";
  const siteThresholdRaw = Number(site?.fidelityThreshold);
  const globalThresholdRaw = Number(options?.fidelityThreshold);
  const thresholdBase = Number.isFinite(siteThresholdRaw) && siteThresholdRaw >= 0 ? siteThresholdRaw : globalThresholdRaw;
  const threshold = Math.max(0, Math.min(100, Math.floor(Number.isFinite(thresholdBase) ? thresholdBase : 72)));
  const globalEnforcement = String(options?.fidelityEnforcement || "").trim().toLowerCase() === "fail" ? "fail" : "warn";
  const siteEnforcement = String(site?.fidelityEnforcement || "").trim().toLowerCase() === "fail" ? "fail" : "warn";
  const enforcement = siteEnforcement === "fail" ? "fail" : globalEnforcement;
  return { mode, threshold, enforcement };
};

const evaluateRegressionOutcome = async ({
  reportPath,
  processed,
  fidelityByCase,
  strictCaseIds,
  strictFailCaseIds,
  options,
}) => {
  const score = await scoreRegressionReport(reportPath);
  const fidelity = await evaluateVisualFidelity({
    reportPath,
    processed,
  });
  const fidelityRowsEvaluated = (Array.isArray(fidelity?.rows) ? fidelity.rows : []).map((row) => {
    const config = fidelityByCase.get(String(row.caseId || "")) || {
      mode: "standard",
      threshold: options.fidelityThreshold,
      enforcement: options.fidelityEnforcement,
    };
    const rawSimilarity = row?.similarity;
    const similarity =
      typeof rawSimilarity === "number" && Number.isFinite(rawSimilarity)
        ? rawSimilarity
        : typeof rawSimilarity === "string" && rawSimilarity.trim() && Number.isFinite(Number(rawSimilarity))
          ? Number(rawSimilarity)
          : null;
    const comparable = typeof similarity === "number" && Number.isFinite(similarity);
    const pass = comparable && similarity >= Number(config.threshold || 0);
    return {
      ...row,
      similarity,
      mode: config.mode,
      threshold: Number(config.threshold || 0),
      enforcement: config.enforcement || "warn",
      comparable,
      pass,
    };
  });

  const strictFidelityFailures = fidelityRowsEvaluated.filter((row) => row.mode === "strict" && row.comparable && !row.pass);
  const blockingFidelityFailures = strictFidelityFailures.filter((row) => row.enforcement === "fail");
  const strictFidelityMissing = strictCaseIds.filter(
    (caseId) => !fidelityRowsEvaluated.some((row) => row.caseId === caseId && row.comparable)
  );
  const blockingMissing = strictFidelityMissing.filter((caseId) => strictFailCaseIds.includes(caseId));
  const fidelityGateWouldFail = strictFidelityFailures.length > 0 || strictFidelityMissing.length > 0;
  const fidelityGatePassed = blockingFidelityFailures.length === 0 && blockingMissing.length === 0;

  return {
    score,
    fidelity,
    fidelityRowsEvaluated,
    strictFidelityFailures,
    blockingFidelityFailures,
    strictFidelityMissing,
    fidelityGateWouldFail,
    fidelityGatePassed,
    blockingMissing,
  };
};

const buildFidelityManualFixTasks = ({ fidelityRows, missingCaseIds, previewLinks }) => {
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

  return [...lowSimilarityTasks, ...missingTasks];
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

const main = async () => {
  const options = parseArgs(process.argv);
  const manifestPath = options.manifest;
  const sites = await loadManifest(manifestPath);
  if (!sites.length) {
    throw new Error(`No valid sites in manifest: ${manifestPath}`);
  }

  const runDir = path.join(RUNS_DIR, options.runId);
  const siteRoot = path.join(runDir, "sites");
  await ensureDir(siteRoot);
  await ensureDir(LIB_DIR);

  const processed = [];

  for (const site of sites) {
    const siteDir = path.join(siteRoot, site.id);
    const ingestDir = path.join(siteDir, "ingest");
    const extractedDir = path.join(siteDir, "extracted");
    await ensureDir(ingestDir);
    await ensureDir(extractedDir);

    const antiCrawlPrecheckEnabled =
      Boolean(site.url) &&
      !options.skipIngest &&
      options.antiCrawlPrecheck &&
      site.antiCrawlPrecheck !== false;
    const antiCrawlTimeoutMs =
      Number(site.antiCrawlTimeoutMs || 0) > 0
        ? Math.floor(Number(site.antiCrawlTimeoutMs))
        : Math.max(1000, Math.floor(Number(options.antiCrawlTimeoutMs || 0) || 25000));
    const antiCrawlPrecheck = antiCrawlPrecheckEnabled
      ? await precheckAntiCrawl({
          url: site.url,
          timeoutMs: antiCrawlTimeoutMs,
        })
      : {
          checked: false,
          blocked: false,
          reason: antiCrawlPrecheckEnabled ? "skipped" : "disabled",
          status: 0,
          url: site.url || "",
          finalUrl: "",
        };
    await fs.writeFile(path.join(ingestDir, "anti-crawl-precheck.json"), JSON.stringify(antiCrawlPrecheck, null, 2));
    if (antiCrawlPrecheckEnabled && antiCrawlPrecheck.blocked) {
      const details = antiCrawlPrecheck.reason || "anti_crawl_detected";
      throw new Error(
        `[template-factory] anti-crawl detected for ${site.id} (${site.url}) during precheck: ${details}. Template generation terminated.`
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
      if (site.url) {
        desktopShot = await captureScreenshot({
          url: site.url,
          outPath: path.join(ingestDir, "desktop.auto.png"),
          mobile: false,
        });
        mobileShot = await captureScreenshot({
          url: site.url,
          outPath: path.join(ingestDir, "mobile.auto.png"),
          mobile: true,
        });
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
    const crawlEnabled = Boolean(site.url) && !options.skipIngest && (options.crawlSite || site.crawlSite);
    const crawlMaxPages =
      Number(site.crawlMaxPages || 0) > 0
        ? Math.floor(Number(site.crawlMaxPages))
        : Math.max(1, Math.floor(Number(options.crawlMaxPages || 0) || 0));
    const crawlMaxDepth =
      Number(site.crawlMaxDepth) >= 0
        ? Math.floor(Number(site.crawlMaxDepth))
        : Math.max(0, Math.floor(Number(options.crawlMaxDepth || 0) || 0));
    const crawlReport = crawlEnabled
      ? await crawlSitePages({
          entryUrl: site.url,
          maxPages: crawlMaxPages,
          maxDepth: crawlMaxDepth,
        })
      : null;
    if (crawlReport?.blocked) {
      await fs.writeFile(path.join(ingestDir, "crawl.json"), JSON.stringify(crawlReport, null, 2));
      const reason = crawlReport?.antiCrawl?.reason || "anti_crawl_detected";
      throw new Error(
        `[template-factory] anti-crawl detected for ${site.id} (${site.url}) during crawl: ${reason}. Template generation terminated.`
      );
    }
    const crawlAssetPack = crawlReport
      ? await buildCrawledPageAssetPack({
          siteId: site.id,
          crawl: crawlReport,
          ingestDir,
        })
      : null;
    if (crawlReport) {
      await fs.writeFile(path.join(ingestDir, "crawl.json"), JSON.stringify(crawlReport, null, 2));
      console.log(
        `[template-factory] crawl ${site.id}: pages=${crawlReport?.stats?.crawled || 0}, discovered=${crawlReport?.stats?.discovered || 0}, failed=${crawlReport?.stats?.failed || 0}`
      );
    }
    const summary = await fetchHtmlSummary(site.url);
    const mergedSummary = crawlReport ? mergeSummaryWithCrawl(summary, crawlReport) : summary;
    const resolvedRecipe = resolveRecipeForSite({
      site,
      summary: mergedSummary,
      visualSignature,
    });
    const recipe = resolvedRecipe.recipe;
    const referenceSlices = await createReferenceSlices({
      siteId: site.id,
      desktopSource: preferredDesktop,
      mobileSource: preferredMobile,
      preset: recipe?.id,
    });
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
          site,
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
        },
        null,
        2
      )
    );

    const indexCardRaw = buildIndexCard({
      site,
      recipe,
      summary: mergedSummary,
      evidence: {
        desktop: Boolean(desktopShot || copiedDesktop || site.desktopScreenshot),
        mobile: Boolean(mobileShot || copiedMobile || site.mobileScreenshot),
      },
    });
    const specPackRaw = buildSpecPack({
      site,
      recipe,
      summary: mergedSummary,
      assets: { ...publishedAssets, slices: referenceSlices },
      crawl: crawlReport,
      crawlAssetPack,
    });
    const indexCard = rewriteBrandTextDeep(indexCardRaw);
    const specPack = rewriteBrandTextDeep(specPackRaw);
    const sanitizedSite = rewriteBrandTextDeep(site);
    const styleProfile = rewriteBrandTextDeep(specPackToStyleProfile({ site: sanitizedSite, indexCard, specPack }));

    await fs.writeFile(path.join(extractedDir, "index-card.json"), JSON.stringify(indexCard, null, 2));
    await fs.writeFile(path.join(extractedDir, "spec-pack.json"), JSON.stringify(specPack, null, 2));
    await fs.writeFile(path.join(extractedDir, "style-profile.json"), JSON.stringify(styleProfile, null, 2));

    processed.push({
      site,
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
    });
    console.log(`[template-factory] processed ${site.id} -> recipe=${recipe.id}`);
  }

  const runLibrary = {
    generatedAt: new Date().toISOString(),
    runId: options.runId,
    manifestPath,
    profiles: processed.map((item) => item.styleProfile),
  };

  const runLibraryPath = path.join(runDir, "style-profiles.generated.json");
  await fs.writeFile(runLibraryPath, JSON.stringify(runLibrary, null, 2));

  let publishPath = "";
  if (options.publish) {
    let existingProfiles = [];
    try {
      const raw = await fs.readFile(DEFAULT_PUBLISH_PATH, "utf8");
      const parsed = JSON.parse(raw);
      existingProfiles = Array.isArray(parsed?.profiles) ? parsed.profiles : [];
    } catch {
      existingProfiles = [];
    }

    const mergedProfiles = mergeProfiles(existingProfiles, runLibrary.profiles);
    const published = {
      generatedAt: new Date().toISOString(),
      sourceRunId: options.runId,
      profileCount: mergedProfiles.length,
      profiles: mergedProfiles,
    };
    await fs.writeFile(DEFAULT_PUBLISH_PATH, JSON.stringify(published, null, 2));
    publishPath = DEFAULT_PUBLISH_PATH;
  }

  let regression = null;
  let score = null;
  let fidelity = null;
  let fidelityReportPath = null;
  let fidelityGatePassed = null;
  let fidelityGateWouldFail = null;
  let strictFidelityFailures = [];
  let strictFidelityMissing = [];
  let blockingFidelityFailures = [];
  let fidelityRowsEvaluated = [];
  let regressionAttempts = [];
  let manualFixesPath = null;
  let manualFixes = [];
  let previewLinks = [];
  let previewServer = null;
  const fidelityByCase = new Map(processed.map((item) => [String(item.site?.id || ""), resolveFidelitySettings(item.site, options)]));
  const strictCaseIds = processed
    .map((item) => String(item.site?.id || ""))
    .filter((id) => id && (fidelityByCase.get(id)?.mode || "standard") === "strict");
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
  if (!options.fastMode) {
    const maxRepairIterations = Math.max(0, Math.min(5, Number(options.autoRepairIterations || 0)));
    let repairContextByCase = new Map();

    for (let attempt = 0; attempt <= maxRepairIterations; attempt += 1) {
      regression = await runRegression({
        runDir,
        sites: processed,
        renderer: options.renderer,
        groups: DEFAULT_TEMPLATE_FIRST_GROUP,
        maxCases: options.maxCases,
        attempt,
        repairContextByCase,
      });
      if (!regression.reportPath) break;

      const outcome = await evaluateRegressionOutcome({
        reportPath: regression.reportPath,
        processed,
        fidelityByCase,
        strictCaseIds,
        strictFailCaseIds,
        options,
      });
      score = outcome.score;
      fidelity = outcome.fidelity;
      fidelityRowsEvaluated = outcome.fidelityRowsEvaluated;
      strictFidelityFailures = outcome.strictFidelityFailures;
      blockingFidelityFailures = outcome.blockingFidelityFailures;
      strictFidelityMissing = outcome.strictFidelityMissing;
      fidelityGateWouldFail = outcome.fidelityGateWouldFail;
      fidelityGatePassed = outcome.fidelityGatePassed;

      regressionAttempts.push({
        attempt,
        reportPath: regression.reportPath,
        overallSimilarity: outcome.fidelity?.overallSimilarity ?? null,
        strictFailures: strictFidelityFailures.length,
        strictMissing: strictFidelityMissing.length,
      });

      const shouldRepair =
        attempt < maxRepairIterations &&
        strictCaseIds.length > 0 &&
        (strictFidelityFailures.length > 0 || strictFidelityMissing.length > 0);
      if (!shouldRepair) break;

      const nextRepair = new Map();
      for (const row of strictFidelityFailures) {
        const threshold = Number(row?.threshold || 0);
        const similarity = Number(row?.similarity || 0);
        nextRepair.set(String(row.caseId || ""), {
          attempt: attempt + 1,
          threshold,
          similarity,
          gap: Number((threshold - similarity).toFixed(2)),
        });
      }
      for (const caseId of strictFidelityMissing) {
        if (!nextRepair.has(String(caseId || ""))) {
          nextRepair.set(String(caseId || ""), {
            attempt: attempt + 1,
            threshold: Number(options.fidelityThreshold || 0),
            similarity: null,
            gap: null,
          });
        }
      }
      repairContextByCase = nextRepair;
      console.log(
        `[template-factory] auto-repair retry ${attempt + 1}/${maxRepairIterations}: strict_failures=${strictFidelityFailures.length}, missing=${strictFidelityMissing.length}`
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
      const fidelityReport = {
        generatedAt: new Date().toISOString(),
        runId: options.runId,
        ...fidelity,
        rows: fidelityRowsEvaluated,
        attempts: regressionAttempts,
        strict: {
          requiredCases: strictCaseIds,
          missingComparableCases: strictFidelityMissing,
          failedCases: strictFidelityFailures,
          gatePassed: fidelityGatePassed,
          gateWouldFail: fidelityGateWouldFail,
          blockingRequiredCases: strictFailCaseIds,
          blockingMissingComparableCases: blockingMissing,
          blockingFailedCases: blockingFidelityFailures,
        },
      };
      fidelityReportPath = path.join(runDir, "fidelity-report.json");
      await fs.writeFile(fidelityReportPath, JSON.stringify(fidelityReport, null, 2));
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
        previewLinks,
      });
      manualFixesPath = path.join(runDir, "manual-fix-tasks.json");
      await fs.writeFile(manualFixesPath, JSON.stringify(manualFixes, null, 2));
    }
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

  const summary = {
    runId: options.runId,
    manifestPath,
    sites: processed.length,
    crawlSite: options.crawlSite,
    crawlMaxPages: options.crawlMaxPages,
    crawlMaxDepth: options.crawlMaxDepth,
    antiCrawlPrecheck: options.antiCrawlPrecheck,
    antiCrawlTimeoutMs: options.antiCrawlTimeoutMs,
    fastMode: options.fastMode,
    fidelityMode: options.fidelityMode,
    fidelityThreshold: options.fidelityThreshold,
    fidelityEnforcement: options.fidelityEnforcement,
    autoRepairIterations: options.autoRepairIterations,
    pixelMode: options.pixelMode,
    runDir,
    runLibraryPath,
    publishPath,
    regressionPromptsPath: regression?.promptsPath || null,
    regressionReportPath: regression?.reportPath || null,
    regressionAttemptsPath: regressionAttempts.length ? path.join(runDir, "regression-attempts.json") : null,
    scorecardPath: score ? path.join(runDir, "scorecard.json") : null,
    overallScore: score?.overallScore ?? null,
    fidelityReportPath,
    overallSimilarity: fidelity?.overallSimilarity ?? null,
    fidelityGatePassed,
    fidelityGateWouldFail,
    strictFidelityFailures,
    strictFidelityMissing,
    blockingFidelityFailures,
    manualFixesPath,
    manualFixesCount: manualFixes.length,
    previewBaseUrl: normalizePreviewBaseUrl(options.previewBaseUrl),
    previewLinksPath: previewLinks.length ? path.join(runDir, "preview-links.json") : null,
    previewLinks,
    previewServer,
    previewStartCommand: DEFAULT_PREVIEW_START_COMMAND,
  };

  await fs.writeFile(path.join(runDir, "summary.json"), JSON.stringify(summary, null, 2));
  if (strictCaseIds.length && fidelityGateWouldFail) {
    const failedDetail = strictFidelityFailures
      .map((row) => `${row.caseId}(${row.similarity} < ${row.threshold})`)
      .join(", ");
    const missingDetail = strictFidelityMissing.join(", ");
    console.log(
      `[template-factory] fidelity warning: strict targets below threshold. failed=[${failedDetail || "none"}], missing=[${missingDetail || "none"}].`
    );
  }

  console.log("\n[template-factory] done");
  console.log(`[template-factory] runDir: ${runDir}`);
  console.log(`[template-factory] run library: ${runLibraryPath}`);
  if (publishPath) console.log(`[template-factory] published library: ${publishPath}`);
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
};

main().catch((error) => {
  const message = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
  console.error(`[template-factory:fatal] ${message}`);
  process.exit(1);
});
