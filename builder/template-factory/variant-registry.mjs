/**
 * variant-registry.mjs
 *
 * Registry of all block types, their available variants, and layout-affecting props.
 * Used by the template factory to enumerate variant candidates for auto-selection.
 *
 * Each entry maps a section kind to its available block types and their variant options.
 * When a section has low fidelity, the system can try alternative variants/blockTypes.
 */

/** @type {Record<string, { blockType: string, variants: Array<Record<string, unknown>>, description: string }[]>} */
export const SECTION_BLOCK_REGISTRY = {
  navigation: [
    {
      blockType: "Navbar",
      description: "Standard navbar with optional dropdown and CTA",
      variants: [
        { variant: "simple" },
        { variant: "withCTA" },
        { variant: "withDropdown" },
      ],
    },
    {
      blockType: "NexusNavPulse",
      description: "Dark industrial nav with accent glow",
      variants: [{ accentTone: "gold" }, { accentTone: "green" }],
    },
  ],

  hero: [
    {
      blockType: "HeroCentered",
      description: "Centered hero with optional media/badges",
      variants: [
        { variant: "textOnly", headingSize: "lg" },
        { variant: "withMedia", headingSize: "md" },
        { variant: "withBadges", headingSize: "md" },
      ],
    },
    {
      blockType: "HeroSplit",
      description: "Split layout hero with media on one side",
      variants: [
        { mediaPosition: "right", headingSize: "md" },
        { mediaPosition: "left", headingSize: "md" },
        { variant: "screenshot", mediaPosition: "right" },
      ],
    },
    {
      blockType: "NeonHeroBeam",
      description: "Dark neon hero with stats",
      variants: [{}],
    },
    {
      blockType: "NexusHeroDock",
      description: "Industrial hero with panel and stats",
      variants: [{}],
    },
    {
      blockType: "DesignerHeroEditorial",
      description: "Editorial minimal hero for portfolios",
      variants: [{}],
    },
  ],

  story: [
    {
      blockType: "FeatureWithMedia",
      description: "Feature section with media, supports split/reverse",
      variants: [
        { variant: "split", mediaPosition: "right" },
        { variant: "split", mediaPosition: "left" },
        { variant: "reverse", mediaPosition: "right" },
        { variant: "reverse", mediaPosition: "left" },
      ],
    },
    {
      blockType: "FeatureGrid",
      description: "Grid of feature items",
      variants: [
        { variant: "2col" },
        { variant: "3col" },
        { variant: "4col" },
      ],
    },
    {
      blockType: "NeonDashboardStrip",
      description: "Dark dashboard metrics strip",
      variants: [{}],
    },
    {
      blockType: "NexusCapabilityStrip",
      description: "Industrial capability cards",
      variants: [{}],
    },
  ],

  approach: [
    {
      blockType: "FeatureGrid",
      description: "Grid of feature/approach items",
      variants: [
        { variant: "2col" },
        { variant: "3col" },
        { variant: "4col" },
      ],
    },
    {
      blockType: "FeatureWithMedia",
      description: "Feature with media for approach sections",
      variants: [
        { variant: "split", mediaPosition: "right" },
        { variant: "split", mediaPosition: "left" },
        { variant: "reverse" },
      ],
    },
    {
      blockType: "NeonMetricsOrbit",
      description: "Neon metrics orbit visualization",
      variants: [{}],
    },
    {
      blockType: "NexusOpsMatrix",
      description: "Industrial ops matrix grid",
      variants: [{}],
    },
    {
      blockType: "DesignerCapabilitiesStrip",
      description: "Minimal capabilities strip for portfolios",
      variants: [{}],
    },
  ],

  products: [
    {
      blockType: "CardsGrid",
      description: "Versatile card grid with many layout options",
      variants: [
        { variant: "product", columns: "3col", density: "normal" },
        { variant: "product", columns: "4col", density: "compact" },
        { variant: "imageText", columns: "2col", density: "normal" },
        { variant: "imageText", columns: "3col", density: "normal" },
        { variant: "poster", columns: "3col", density: "normal" },
        { variant: "media", columns: "3col", density: "normal" },
        { variant: "person", columns: "3col", density: "normal" },
      ],
    },
    {
      blockType: "FAQAccordion",
      description: "FAQ accordion for product details",
      variants: [
        { variant: "singleOpen" },
        { variant: "multiOpen" },
      ],
    },
    {
      blockType: "NeonFeatureCards",
      description: "Neon feature cards with highlight",
      variants: [{ highlightMode: "first" }, { highlightMode: "none" }],
    },
    {
      blockType: "NexusControlPanel",
      description: "Industrial control panel dashboard",
      variants: [{}],
    },
    {
      blockType: "DesignerProjectsSplit",
      description: "Portfolio projects split layout",
      variants: [{}],
    },
  ],

  socialproof: [
    {
      blockType: "TestimonialsGrid",
      description: "Testimonials in grid layout",
      variants: [
        { variant: "2col", cardStyle: "glass" },
        { variant: "2col", cardStyle: "solid" },
        { variant: "3col", cardStyle: "glass" },
        { variant: "3col", cardStyle: "solid" },
      ],
    },
    {
      blockType: "FeatureWithMedia",
      description: "Social proof with media",
      variants: [
        { variant: "split" },
        { variant: "reverse" },
      ],
    },
    {
      blockType: "LogoCloud",
      description: "Logo cloud for brand trust",
      variants: [
        { variant: "grid" },
        { variant: "marquee" },
      ],
    },
    {
      blockType: "NeonResultsShowcase",
      description: "Neon results/stats showcase",
      variants: [{}],
    },
    {
      blockType: "NexusProofMosaic",
      description: "Industrial proof mosaic",
      variants: [{}],
    },
    {
      blockType: "DesignerQuoteBand",
      description: "Minimal quote band for portfolios",
      variants: [{}],
    },
  ],

  cta: [
    {
      blockType: "LeadCaptureCTA",
      description: "Lead capture CTA section",
      variants: [
        { variant: "banner" },
        { variant: "card" },
      ],
    },
    {
      blockType: "NeonPricingSplit",
      description: "Neon pricing split CTA",
      variants: [{}],
    },
  ],

  footer: [
    {
      blockType: "Footer",
      description: "Standard footer with columns",
      variants: [
        { variant: "simple" },
        { variant: "multiColumn" },
      ],
    },
    {
      blockType: "NeonFooterGlow",
      description: "Dark neon footer with glow",
      variants: [{}],
    },
    {
      blockType: "NexusFooterCommand",
      description: "Industrial command footer",
      variants: [{}],
    },
  ],
};

/**
 * Get all variant candidates for a given section kind.
 * Returns flat array of { blockType, variantProps, description }.
 */
export const getVariantCandidates = (sectionKind) => {
  const entries = SECTION_BLOCK_REGISTRY[sectionKind];
  if (!entries) return [];
  const candidates = [];
  for (const entry of entries) {
    for (const variantProps of entry.variants) {
      candidates.push({
        blockType: entry.blockType,
        variantProps,
        description: entry.description,
      });
    }
  }
  return candidates;
};

/**
 * Get variant candidates excluding the current blockType+variant.
 */
export const getAlternativeVariants = (sectionKind, currentBlockType, currentVariantProps = {}) => {
  const all = getVariantCandidates(sectionKind);
  return all.filter((candidate) => {
    if (candidate.blockType !== currentBlockType) return true;
    // Same blockType: check if variant props differ
    const keys = new Set([...Object.keys(candidate.variantProps), ...Object.keys(currentVariantProps)]);
    for (const key of keys) {
      if (String(candidate.variantProps[key] || "") !== String(currentVariantProps[key] || "")) return true;
    }
    return false;
  });
};
