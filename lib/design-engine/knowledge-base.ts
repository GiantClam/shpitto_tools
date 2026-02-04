/**
 * Design Knowledge Base
 * Contains design rules, principles, and patterns for intelligent design decisions
 */

export type Industry =
  | 'saas'
  | 'ecommerce'
  | 'portfolio'
  | 'blog'
  | 'landing'
  | 'documentation'
  | 'corporate'
  | 'entertainment'
  | 'education'
  | 'healthcare'
  | 'finance'
  | 'gaming'
  | 'fashion'
  | 'food'
  | 'travel'
  | 'realestate'
  | 'nonprofit'
  | 'government'
  | 'other'

export type Audience =
  | 'technical'
  | 'consumer'
  | 'business'
  | 'creative'
  | 'academic'
  | 'general'
  | 'enterprise'
  | 'startup'
  | 'enterprise'
  | 'b2b'

export type BrandPersonality =
  | 'trustworthy'
  | 'innovative'
  | 'playful'
  | 'luxury'
  | 'minimal'
  | 'bold'
  | 'friendly'
  | 'professional'
  | 'eco'
  | 'tech'
  | 'premium'

export type Complexity = 'simple' | 'moderate' | 'complex'

export interface DesignSpec {
  colors: ColorSpec
  typography: TypographySpec
  layout: LayoutSpec
  spacing: SpacingSpec
  components: ComponentSpec
  effects: EffectSpec
}

export interface ColorSpec {
  palette: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    muted: string
  }
  theme: 'light' | 'dark' | 'auto'
  colorSystem: 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted'
  accessibility: 'wcag-aa' | 'wcag-aaa'
}

export interface TypographySpec {
  heading: {
    family: string
    weight: number
    lineHeight: number
    letterSpacing: number
  }
  body: {
    family: string
    weight: number
    lineHeight: number
    letterSpacing: number
  }
  mono?: {
    family: string
  }
  fontPairing: 'classic' | 'modern' | 'tech' | 'elegant' | 'friendly'
}

export interface LayoutSpec {
  container: 'narrow' | 'standard' | 'wide' | 'full'
  gridColumns: number
  aspectRatios: {
    hero: string
    card: string
    image: string
  }
  alignment: 'left' | 'center' | 'right'
  visualDensity: 'airy' | 'balanced' | 'compact'
}

export interface SpacingSpec {
  scale: 'compact' | 'comfortable' | 'spacious'
  baseUnit: number
  layout: {
    section: number
    block: number
    inline: number
  }
}

export interface ComponentSpec {
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  buttonStyle: 'fill' | 'outline' | 'ghost' | 'soft'
  cardStyle: 'flat' | 'elevated' | 'bordered' | 'glass'
  navigationStyle: 'stacked' | 'horizontal' | 'hamburger' | 'sidebar'
}

export interface EffectSpec {
  shadows: 'none' | 'subtle' | 'medium' | 'strong'
  blurs: 'none' | 'subtle' | 'medium'
  animations: 'none' | 'subtle' | 'moderate' | 'rich'
  gradients: 'none' | 'subtle' | 'bold'
}

// ============================================
// COLOR KNOWLEDGE
// ============================================

const COLOR_PSYCHOLOGY: Record<string, { colors: string[]; associations: string[] }> = {
  tech: {
    colors: ['#0066FF', '#7C3AED', '#06B6D4', '#3B82F6'],
    associations: ['innovation', 'trust', 'modernity', 'digital']
  },
  finance: {
    colors: ['#0F766E', '#1E40AF', '#065F46', '#1E3A8A'],
    associations: ['stability', 'trust', 'professionalism', 'wealth']
  },
  healthcare: {
    colors: ['#0891B2', '#059669', '#0284C7', '#0D9488'],
    associations: ['healing', 'trust', 'calm', 'growth']
  },
  eco: {
    colors: ['#059669', '#10B981', '#34D399', '#65A30D'],
    associations: ['nature', 'sustainability', 'growth', 'freshness']
  },
  food: {
    colors: ['#F97316', '#EF4444', '#EAB308', '#84CC16'],
    associations: ['appetite', 'energy', 'warmth', 'freshness']
  },
  luxury: {
    colors: ['#1C1917', '#78716C', '#1F2937', '#111827'],
    associations: ['exclusivity', 'sophistication', 'timeless', 'elegance']
  },
  playful: {
    colors: ['#F472B6', '#A78BFA', '#FBBF24', '#34D399'],
    associations: ['joy', 'creativity', 'energy', 'fun']
  },
  corporate: {
    colors: ['#1E40AF', '#1E3A8A', '#0F172A', '#334155'],
    associations: ['professional', 'trust', 'reliability', 'authority']
  },
  creative: {
    colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4'],
    associations: ['creativity', 'uniqueness', 'vibrancy', 'expression']
  }
}

const BRAND_PERSONALITY_COLORS: Record<BrandPersonality, string[]> = {
  trustworthy: ['#1E40AF', '#1E3A8A', '#0F766E', '#059669'],
  innovative: ['#7C3AED', '#8B5CF6', '#06B6D4', '#3B82F6'],
  playful: ['#F472B6', '#A78BFA', '#FBBF24', '#F97316'],
  luxury: ['#1C1917', '#78716C', '#A8A29E', '#44403C'],
  minimal: ['#000000', '#FFFFFF', '#F3F4F6', '#9CA3AF'],
  bold: ['#DC2626', '#7C2D12', '#4C1D95', '#1D4ED8'],
  friendly: ['#10B981', '#FBBF24', '#F97316', '#8B5CF6'],
  professional: ['#1E3A8A', '#0F172A', '#334155', '#475569'],
  eco: ['#059669', '#10B981', '#34D399', '#65A30D'],
  tech: ['#0066FF', '#7C3AED', '#06B6D4', '#3B82F6'],
  premium: ['#1C1917', '#A8A29E', '#78716C', '#F5F5F4']
}

// ============================================
// TYPOGRAPHY KNOWLEDGE
// ============================================

const TYPOGRAPHY_RULES: Record<string, { heading: string[]; body: string[]; pairing: string[] }> = {
  tech: {
    heading: ['Inter', 'Space Grotesk', 'SF Pro Display', 'Plus Jakarta Sans'],
    body: ['Inter', 'Roboto', 'SF Pro Text', 'Open Sans'],
    pairing: [
      ['Inter', 'Inter'],
      ['Space Grotesk', 'Inter'],
      ['SF Pro Display', 'SF Pro Text']
    ]
  },
  finance: {
    heading: ['Playfair Display', 'Merriweather', 'Libre Baskerville', 'Lora'],
    body: ['Inter', 'Roboto', 'Source Sans Pro', 'Open Sans'],
    pairing: [
      ['Playfair Display', 'Inter'],
      ['Merriweather', 'Source Sans Pro'],
      ['Libre Baskerville', 'Open Sans']
    ]
  },
  creative: {
    heading: ['Space Grotesk', 'Syne', 'Clash Display', 'Satoshi'],
    body: ['Inter', 'DM Sans', 'Satoshi', 'Plus Jakarta Sans'],
    pairing: [
      ['Space Grotesk', 'DM Sans'],
      ['Syne', 'Inter'],
      ['Clash Display', 'Inter']
    ]
  },
  luxury: {
    heading: ['Cormorant Garamond', 'Playfair Display', 'Bodoni Moda', 'Cinzel'],
    body: ['Cormorant Garamond', 'Proza Libre', 'Open Sans', 'Inter'],
    pairing: [
      ['Cormorant Garamond', 'Cormorant Garamond'],
      ['Playfair Display', 'Proza Libre'],
      ['Bodoni Moda', 'Open Sans']
    ]
  },
  minimal: {
    heading: ['Inter', 'DM Sans', 'Plus Jakarta Sans', 'Geist'],
    body: ['Inter', 'DM Sans', 'Geist', 'Plus Jakarta Sans'],
    pairing: [
      ['Inter', 'Inter'],
      ['DM Sans', 'DM Sans'],
      ['Plus Jakarta Sans', 'Plus Jakarta Sans']
    ]
  },
  friendly: {
    heading: ['Nunito', 'Quicksand', 'Fredoka', 'Baloo 2'],
    body: ['Nunito', 'Quicksand', 'Open Sans', 'Lato'],
    pairing: [
      ['Nunito', 'Nunito'],
      ['Quicksand', 'Open Sans'],
      ['Fredoka', 'Lato']
    ]
  },
  academic: {
    heading: ['Merriweather', 'Lora', 'EB Garamond', 'Libre Baskerville'],
    body: ['Inter', 'Source Serif Pro', 'Merriweather', 'Open Sans'],
    pairing: [
      ['Merriweather', 'Inter'],
      ['Lora', 'Source Serif Pro'],
      ['EB Garamond', 'Open Sans']
    ]
  }
}

// ============================================
// LAYOUT KNOWLEDGE
// ============================================

const LAYOUT_RULES: Record<string, { grid: number; container: string; density: string; alignment: string[] }> = {
  saas: { grid: 12, container: 'wide', density: 'balanced', alignment: ['left', 'center'] },
  ecommerce: { grid: 12, container: 'full', density: 'compact', alignment: ['center'] },
  portfolio: { grid: 12, container: 'wide', density: 'airy', alignment: ['center', 'left'] },
  blog: { grid: 8, container: 'standard', density: 'balanced', alignment: ['left'] },
  documentation: { grid: 12, container: 'standard', density: 'compact', alignment: ['left'] },
  corporate: { grid: 12, container: 'standard', density: 'balanced', alignment: ['left', 'center'] },
  landing: { grid: 12, container: 'wide', density: 'airy', alignment: ['center'] },
  entertainment: { grid: 12, container: 'full', density: 'compact', alignment: ['center'] },
  education: { grid: 12, container: 'standard', density: 'balanced', alignment: ['left'] },
  healthcare: { grid: 12, container: 'standard', density: 'airy', alignment: ['left', 'center'] },
  finance: { grid: 12, container: 'standard', density: 'compact', alignment: ['left'] },
  gaming: { grid: 12, container: 'full', density: 'compact', alignment: ['center'] },
  fashion: { grid: 12, container: 'full', density: 'airy', alignment: ['center'] },
  food: { grid: 12, container: 'wide', density: 'balanced', alignment: ['center'] },
  travel: { grid: 12, container: 'full', density: 'airy', alignment: ['center', 'left'] },
  realestate: { grid: 12, container: 'wide', density: 'balanced', alignment: ['left', 'center'] },
  nonprofit: { grid: 12, container: 'standard', density: 'balanced', alignment: ['left', 'center'] },
  government: { grid: 12, container: 'standard', density: 'compact', alignment: ['left'] },
  other: { grid: 12, container: 'standard', density: 'balanced', alignment: ['left', 'center'] }
}

// ============================================
// INDUSTRY-SPECIFIC KNOWLEDGE
// ============================================

const INDUSTRY_KNOWLEDGE: Record<Industry, {
  colors: string[]
  layout: string
  typography: string
  components: string[]
  characteristics: string[]
}> = {
  saas: {
    colors: ['#0066FF', '#7C3AED', '#10B981', '#F59E0B'],
    layout: 'standard',
    typography: 'tech',
    components: ['Hero', 'FeatureGrid', 'Testimonials', 'PricingTable', 'FAQ', 'CTA'],
    characteristics: ['clear-value-prop', 'trust-signals', 'social-proof', 'easy-onboarding']
  },
  ecommerce: {
    colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'],
    layout: 'full',
    typography: 'tech',
    components: ['ProductGrid', 'ProductCard', 'Cart', 'FeaturedProducts', 'Testimonials'],
    characteristics: ['visual-heavy', 'clear-cta', 'trust-badges', 'easy-navigation']
  },
  portfolio: {
    colors: ['#1C1917', '#78716C', '#A8A29E', '#F5F5F4'],
    layout: 'wide',
    typography: 'creative',
    components: ['Hero', 'Gallery', 'ProjectCard', 'About', 'Contact'],
    characteristics: ['visual-heavy', 'minimal-ui', 'focus-content', 'easy-contact']
  },
  blog: {
    colors: ['#1E3A8A', '#0F766E', '#1F2937', '#6B7280'],
    layout: 'standard',
    typography: 'academic',
    components: ['Hero', 'ArticleList', 'Sidebar', 'Newsletter', 'RelatedPosts'],
    characteristics: ['readable', 'scannable', 'shareable', 'seo-friendly']
  },
  landing: {
    colors: ['#0066FF', '#7C3AED', '#10B981', '#F97316'],
    layout: 'wide',
    typography: 'tech',
    components: ['Hero', 'FeatureHighlight', 'SocialProof', 'CTA', 'TrustBadges'],
    characteristics: ['focused', 'persuasive', 'action-oriented', 'minimal-distraction']
  },
  documentation: {
    colors: ['#1E293B', '#475569', '#64748B', '#94A3B8'],
    layout: 'standard',
    typography: 'tech',
    components: ['SidebarNav', 'ContentBlock', 'CodeBlock', 'Breadcrumb', 'Search'],
    characteristics: ['scannable', 'searchable', 'clear-hierarchy', 'easy-navigation']
  },
  corporate: {
    colors: ['#1E3A8A', '#0F172A', '#334155', '#64748B'],
    layout: 'standard',
    typography: 'finance',
    components: ['Hero', 'AboutSection', 'TeamGrid', 'ServicesList', 'ContactForm'],
    characteristics: ['professional', 'trustworthy', 'informative', 'compliant']
  },
  entertainment: {
    colors: ['#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4'],
    layout: 'full',
    typography: 'playful',
    components: ['Hero', 'MediaGrid', 'FeaturedContent', 'Trending', 'Newsletter'],
    characteristics: ['visual-heavy', 'engaging', 'interactive', 'shareable']
  },
  education: {
    colors: ['#059669', '#0891B2', '#1E40AF', '#7C3AED'],
    layout: 'standard',
    typography: 'academic',
    components: ['CourseList', 'InstructorCard', 'Testimonial', 'FAQ', 'CTA'],
    characteristics: ['trustworthy', 'informative', 'community-focused', 'clear-structure']
  },
  healthcare: {
    colors: ['#0891B2', '#059669', '#0284C7', '#0D9488'],
    layout: 'standard',
    typography: 'friendly',
    components: ['Hero', 'ServiceCard', 'DoctorCard', 'Testimonials', 'AppointmentForm'],
    characteristics: ['trustworthy', 'calming', 'accessible', 'compliant']
  },
  finance: {
    colors: ['#0F766E', '#1E40AF', '#065F46', '#1E3A8A'],
    layout: 'standard',
    typography: 'finance',
    components: ['Hero', 'FeatureGrid', 'Stats', 'Testimonials', 'CTA'],
    characteristics: ['secure', 'professional', 'trustworthy', 'compliant']
  },
  gaming: {
    colors: ['#7C2D12', '#4C1D95', '#1D4ED8', '#10B981'],
    layout: 'full',
    typography: 'tech',
    components: ['Hero', 'GameCard', 'Leaderboard', 'StreamPreview', 'Community'],
    characteristics: ['immersive', 'interactive', 'visual-heavy', 'community-driven']
  },
  fashion: {
    colors: ['#1C1917', '#78716C', '#A8A29E', '#F5F5F4'],
    layout: 'full',
    typography: 'luxury',
    components: ['Hero', 'Lookbook', 'ProductGrid', 'Campaign', 'Story'],
    characteristics: ['visual-heavy', 'aspirational', 'minimal-ui', 'story-driven']
  },
  food: {
    colors: ['#F97316', '#EF4444', '#EAB308', '#84CC16'],
    layout: 'wide',
    typography: 'friendly',
    components: ['Hero', 'MenuGrid', 'Gallery', 'Testimonials', 'Reservation'],
    characteristics: ['appetizing', 'visual-heavy', 'easy-ordering', 'localized']
  },
  travel: {
    colors: ['#0891B2', '#06B6D4', '#10B981', '#F59E0B'],
    layout: 'full',
    typography: 'friendly',
    components: ['Hero', 'DestinationCard', 'Itinerary', 'Testimonials', 'Booking'],
    characteristics: ['aspirational', 'visual-heavy', 'inspiring', 'trustworthy']
  },
  realestate: {
    colors: ['#1E40AF', '#0F766E', '#1F2937', '#78716C'],
    layout: 'wide',
    typography: 'corporate',
    components: ['Hero', 'PropertyCard', 'Search', 'MapView', 'AgentCard'],
    characteristics: ['visual-heavy', 'trustworthy', 'searchable', 'informative']
  },
  nonprofit: {
    colors: ['#059669', '#10B981', '#34D399', '#65A30D'],
    layout: 'standard',
    typography: 'friendly',
    components: ['Hero', 'ImpactStats', 'Stories', 'DonateCTA', 'Team'],
    characteristics: ['emotional', 'trustworthy', 'impact-focused', 'community-driven']
  },
  government: {
    colors: ['#1E3A8A', '#0F172A', '#334155', '#475569'],
    layout: 'standard',
    typography: 'corporate',
    components: ['Hero', 'ServiceList', 'News', 'Contact', 'Search'],
    characteristics: ['accessible', 'trustworthy', 'informative', 'compliant']
  },
  other: {
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
    layout: 'standard',
    typography: 'tech',
    components: ['Hero', 'FeatureGrid', 'About', 'Testimonials', 'CTA'],
    characteristics: ['flexible', 'adaptable', 'scalable', 'user-centric']
  }
}

// ============================================
// AUDIENCE ADJUSTMENTS
// ============================================

const AUDIENCE_MODIFIERS: Record<Audience, Partial<{
  typography: { heading: string; body: string }
  layout: { density: string; complexity: string }
  components: string[]
  accessibility: string
}>> = {
  technical: {
    typography: { heading: 'Inter', body: 'JetBrains Mono' },
    layout: { density: 'compact', complexity: 'complex' },
    components: ['CodeBlock', 'APIReference', 'TechnicalDocs'],
    accessibility: 'wcag-aa'
  },
  consumer: {
    typography: { heading: 'Inter', body: 'Open Sans' },
    layout: { density: 'balanced', complexity: 'simple' },
    components: ['SimpleCTA', 'TrustBadges', 'Reviews'],
    accessibility: 'wcag-aa'
  },
  business: {
    typography: { heading: 'Playfair Display', body: 'Inter' },
    layout: { density: 'balanced', complexity: 'moderate' },
    components: ['CaseStudies', 'ROIStats', 'EnterpriseCTA'],
    accessibility: 'wcag-aa'
  },
  creative: {
    typography: { heading: 'Space Grotesk', body: 'DM Sans' },
    layout: { density: 'airy', complexity: 'moderate' },
    components: ['Portfolio', 'Gallery', 'VisualShowcase'],
    accessibility: 'wcag-aa'
  },
  academic: {
    typography: { heading: 'Merriweather', body: 'Source Serif Pro' },
    layout: { density: 'comfortable', complexity: 'moderate' },
    components: ['Citation', 'ReferenceList', 'Abstract'],
    accessibility: 'wcag-aaa'
  },
  general: {
    typography: { heading: 'Inter', body: 'Inter' },
    layout: { density: 'balanced', complexity: 'simple' },
    components: ['SimpleNav', 'ClearCTA', 'FAQ'],
    accessibility: 'wcag-aa'
  },
  enterprise: {
    typography: { heading: 'Inter', body: 'Inter' },
    layout: { density: 'compact', complexity: 'complex' },
    components: ['Dashboard', 'DataViz', 'IntegrationList'],
    accessibility: 'wcag-aa'
  },
  startup: {
    typography: { heading: 'Space Grotesk', body: 'Inter' },
    layout: { density: 'balanced', complexity: 'moderate' },
    components: ['LaunchCountdown', 'EarlyAccess', 'InvestorProof'],
    accessibility: 'wcag-aa'
  },
  b2b: {
    typography: { heading: 'Playfair Display', body: 'Inter' },
    layout: { density: 'balanced', complexity: 'moderate' },
    components: ['ROI', 'CaseStudies', 'Integration', 'DemoCTA'],
    accessibility: 'wcag-aa'
  }
}

// ============================================
// EXPORTS
// ============================================

export const designKnowledge = {
  colorPsychology: COLOR_PSYCHOLOGY,
  brandColors: BRAND_PERSONALITY_COLORS,
  typographyRules: TYPOGRAPHY_RULES,
  layoutRules: LAYOUT_RULES,
  industry: INDUSTRY_KNOWLEDGE,
  audienceModifiers: AUDIENCE_MODIFIERS
}

export function getIndustryKnowledge(industry: Industry) {
  return INDUSTRY_KNOWLEDGE[industry] || INDUSTRY_KNOWLEDGE.other
}

export function getAudienceModifier(audience: Audience) {
  return AUDIENCE_MODIFIERS[audience] || {}
}

export function getBrandColors(personality: BrandPersonality) {
  return BRAND_PERSONALITY_COLORS[personality] || BRAND_PERSONALITY_COLORS.minimal
}

export function getTypographyRules(style: string) {
  return TYPOGRAPHY_RULES[style] || TYPOGRAPHY_RULES.tech
}
