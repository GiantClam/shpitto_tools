/**
 * Design Decision Engine
 * Transforms user requirements into complete design specifications
 */

import type {
  Industry,
  Audience,
  BrandPersonality,
  Complexity,
  DesignSpec,
  ColorSpec,
  TypographySpec,
  LayoutSpec,
  SpacingSpec,
  ComponentSpec,
  EffectSpec
} from './knowledge-base'
import {
  designKnowledge,
  getIndustryKnowledge,
  getAudienceModifier,
  getBrandColors,
  getTypographyRules
} from './knowledge-base'

export interface UserRequirements {
  industry: Industry
  audience: Audience
  brandPersonality: BrandPersonality
  complexity: Complexity
  content?: {
    hasBlog?: boolean
    hasEcommerce?: boolean
    hasDocumentation?: boolean
    hasTeam?: boolean
    hasTestimonials?: boolean
    hasPricing?: boolean
    hasFAQ?: boolean
    hasPortfolio?: boolean
  }
  preferences?: {
    darkMode?: boolean
    preferredColors?: string[]
    preferredFonts?: string[]
    avoidColors?: string[]
  }
}

export interface DesignDecisionResult {
  spec: DesignSpec
  reasoning: DesignReasoning
  recommendations: string[]
  nextSteps: string[]
}

export interface DesignReasoning {
  colorChoice: string
  typographyChoice: string
  layoutChoice: string
  componentStrategy: string
  accessibilityConsiderations: string
}

export class DesignDecisionEngine {
  private requirements: UserRequirements

  constructor(requirements: UserRequirements) {
    this.requirements = requirements
  }

  /**
   * Main entry point - generate complete design spec
   */
  generateDesignSpec(): DesignDecisionResult {
    const colorSpec = this.generateColorSpec()
    const typographySpec = this.generateTypographySpec(colorSpec.colorSystem)
    const layoutSpec = this.generateLayoutSpec()
    const spacingSpec = this.generateSpacingSpec()
    const componentSpec = this.generateComponentSpec()
    const effectSpec = this.generateEffectSpec()

    const spec: DesignSpec = {
      colors: colorSpec,
      typography: typographySpec,
      layout: layoutSpec,
      spacing: spacingSpec,
      components: componentSpec,
      effects: effectSpec
    }

    return {
      spec,
      reasoning: this.generateReasoning(spec),
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps()
    }
  }

  /**
   * Generate color scheme based on industry, brand personality, and preferences
   */
  private generateColorSpec(): ColorSpec {
    const { industry, brandPersonality, preferences } = this.requirements
    const industryKnowledge = getIndustryKnowledge(industry)
    
    // Get brand personality colors
    let primaryOptions = getBrandColors(brandPersonality)
    
    // If industry has specific colors, blend them
    if (brandPersonality === 'tech' || industry === 'saas' || industry === 'gaming') {
      primaryOptions = [...primaryOptions, ...industryKnowledge.colors]
    }

    // Select primary color
    let primary = primaryOptions[0]
    if (preferences?.preferredColors?.length) {
      const match = primaryOptions.find(c => 
        preferences.preferredColors!.some(pc => c.toLowerCase().includes(pc.toLowerCase()))
      )
      primary = match || primary
    } else if (preferences?.avoidColors?.length) {
      const avoid = preferences.avoidColors
      const available = primaryOptions.filter(c => 
        !avoid.some(a => c.toLowerCase().includes(a.toLowerCase()))
      )
      primary = available[0] || primary
    }

    // Generate harmonious palette
    const palette = this.generateHarmoniousPalette(primary, brandPersonality)

    // Determine color system
    const colorSystem = this.determineColorSystem(brandPersonality)

    // Determine theme
    const theme = preferences?.darkMode 
      ? 'dark' 
      : this.determineTheme(industry, brandPersonality)

    return {
      palette,
      theme,
      colorSystem,
      accessibility: this.determineAccessibility()
    }
  }

  /**
   * Generate a harmonious color palette from a primary color
   */
  private generateHarmoniousPalette(primary: string, personality: BrandPersonality): ColorSpec['palette'] {
    // Base colors
    const backgrounds = {
      light: ['#FFFFFF', '#F8FAFC', '#F1F5F9'],
      dark: ['#0F172A', '#1E293B', '#020617']
    }

    const texts = {
      light: ['#0F172A', '#1E293B', '#334155'],
      dark: ['#F8FAFC', '#F1F5F9', '#E2E8F0']
    }

    const muted = {
      light: ['#94A3B8', '#64748B', '#475569'],
      dark: ['#64748B', '#94A3B8', '#CBD5E1']
    }

    // Generate secondary and accent from primary
    const secondary = this.shiftHue(primary, 30)
    const accent = this.shiftHue(primary, -30)

    const isDark = personality === 'luxury' || personality === 'minimal' || personality === 'tech'
    const bg = isDark ? backgrounds.dark[1] : backgrounds.light[1]
    const text = isDark ? texts.dark[0] : texts.light[0]
    const mtd = isDark ? muted.dark[0] : muted.light[0]

    return {
      primary,
      secondary,
      accent,
      background: bg,
      text,
      muted: mtd
    }
  }

  /**
   * Shift hue of a hex color
   */
  private shiftHue(hex: string, degrees: number): string {
    const hsl = this.hexToHSL(hex)
    hsl.h = (hsl.h + degrees + 360) % 360
    return this.hslToHex(hsl.h, hsl.s, hsl.l)
  }

  private hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return { h: 0, s: 0, l: 0 }
    
    let r = parseInt(result[1], 16) / 255
    let g = parseInt(result[2], 16) / 255
    let b = parseInt(result[3], 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  private hslToHex(h: number, s: number, l: number): string {
    s /= 100
    l /= 100
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  private determineColorSystem(personality: BrandPersonality): ColorSpec['colorSystem'] {
    const mapping: Record<BrandPersonality, ColorSpec['colorSystem']> = {
      trustworthy: 'neutral',
      innovative: 'vibrant',
      playful: 'vibrant',
      luxury: 'muted',
      minimal: 'neutral',
      bold: 'vibrant',
      friendly: 'warm',
      professional: 'neutral',
      eco: 'warm',
      tech: 'cool',
      premium: 'muted'
    }
    return mapping[personality] || 'neutral'
  }

  private determineTheme(industry: Industry, personality: BrandPersonality): 'light' | 'dark' | 'auto' {
    const darkIndustries = ['gaming', 'entertainment', 'tech', 'luxury']
    const lightIndustries = ['blog', 'documentation', 'ecommerce', 'food']
    
    if (darkIndustries.includes(industry)) return 'dark'
    if (lightIndustries.includes(industry)) return 'light'
    if (personality === 'minimal' || personality === 'luxury') return 'dark'
    return 'auto'
  }

  private determineAccessibility(): 'wcag-aa' | 'wcag-aaa' {
    // Default to AA, upgrade to AAA for healthcare/government
    const aaaIndustries = ['healthcare', 'government', 'education']
    return aaaIndustries.includes(this.requirements.industry) ? 'wcag-aaa' : 'wcag-aa'
  }

  /**
   * Generate typography specification
   */
  private generateTypographySpec(colorSystem: ColorSpec['colorSystem']): TypographySpec {
    const { industry, audience, brandPersonality } = this.requirements
    
    // Get base typography style from industry
    const industryKnowledge = getIndustryKnowledge(industry)
    const styleRules = getTypographyRules(industryKnowledge.typography)
    
    // Apply audience modifiers
    const audienceMod = getAudienceModifier(audience)
    
    // Determine font pairing style
    const pairingStyle = this.determinePairingStyle(brandPersonality, industry)
    
    // Select fonts
    const headingFont = styleRules.heading[0]
    const bodyFont = styleRules.body[0]
    
    // Adjust weights based on personality
    const headingWeight = this.determineHeadingWeight(brandPersonality)
    const bodyWeight = this.determineBodyWeight(industry)
    
    return {
      heading: {
        family: headingFont,
        weight: headingWeight,
        lineHeight: 1.2,
        letterSpacing: brandPersonality === 'tech' ? -0.02 : 0
      },
      body: {
        family: bodyFont,
        weight: bodyWeight,
        lineHeight: 1.6,
        letterSpacing: 0
      },
      mono: audience === 'technical' ? { family: 'JetBrains Mono' } : undefined,
      fontPairing: pairingStyle
    }
  }

  private determinePairingStyle(personality: BrandPersonality, industry: Industry): TypographySpec['fontPairing'] {
    const mapping: Record<string, TypographySpec['fontPairing']> = {
      tech: 'tech',
      finance: 'classic',
      creative: 'modern',
      luxury: 'elegant',
      minimal: 'modern',
      friendly: 'friendly'
    }
    return mapping[personality] || mapping[industry] || 'modern'
  }

  private determineHeadingWeight(personality: BrandPersonality): number {
    const weights: Record<BrandPersonality, number> = {
      trustworthy: 700,
      innovative: 700,
      playful: 600,
      luxury: 500,
      minimal: 600,
      bold: 800,
      friendly: 600,
      professional: 700,
      eco: 600,
      tech: 700,
      premium: 500
    }
    return weights[personality] || 700
  }

  private determineBodyWeight(industry: Industry): number {
    const lightIndustries = ['fashion', 'luxury', 'travel']
    return lightIndustries.includes(industry) ? 300 : 400
  }

  /**
   * Generate layout specification
   */
  private generateLayoutSpec(): LayoutSpec {
    const { industry, complexity, content } = this.requirements
    const industryKnowledge = getIndustryKnowledge(industry)
    const layoutRules = designKnowledge.layoutRules[industry] || designKnowledge.layoutRules.other
    
    const audienceMod = getAudienceModifier(this.requirements.audience)
    
    return {
      container: layoutRules.container as LayoutSpec['container'],
      gridColumns: this.requirements.industry === 'documentation' ? 12 : (layoutRules.gridColumns as number),
      aspectRatios: {
        hero: industry === 'landing' ? '16:9' : '21:9',
        card: content?.hasEcommerce ? '1:1' : '4:3',
        image: '16:9'
      },
      alignment: layoutRules.alignment[0] as 'left' | 'center',
      visualDensity: (audienceMod.layout?.density || layoutRules.density) as 'airy' | 'balanced' | 'compact'
    }
  }

  /**
   * Generate spacing specification
   */
  private generateSpacingSpec(): SpacingSpec {
    const { industry, audience } = this.requirements
    const audienceMod = getAudienceModifier(audience)
    
    // Technical audiences prefer compact, creative prefer airy
    const baseScale = audience === 'technical' 
      ? 'compact' 
      : audience === 'creative' 
        ? 'spacious' 
        : 'comfortable'
    
    const scales = {
      compact: { base: 4, section: 48, block: 16, inline: 8 },
      comfortable: { base: 8, section: 80, block: 24, inline: 12 },
      spacious: { base: 8, section: 120, block: 32, inline: 16 }
    }
    
    const scale = scales[baseScale as keyof typeof scales]
    
    return {
      scale: baseScale as 'compact' | 'comfortable' | 'spacious',
      baseUnit: scale.base,
      layout: {
        section: scale.section,
        block: scale.block,
        inline: scale.inline
      }
    }
  }

  /**
   * Generate component specification
   */
  private generateComponentSpec(): ComponentSpec {
    const { industry, brandPersonality } = this.requirements
    
    const radiusMapping: Record<BrandPersonality, ComponentSpec['borderRadius']> = {
      trustworthy: 'md',
      innovative: 'md',
      playful: 'lg',
      luxury: 'sm',
      minimal: 'none',
      bold: 'xl',
      friendly: 'lg',
      professional: 'md',
      eco: 'md',
      tech: 'md',
      premium: 'sm'
    }
    
    const buttonMapping: Record<BrandPersonality, ComponentSpec['buttonStyle']> = {
      trustworthy: 'fill',
      innovative: 'soft',
      playful: 'fill',
      luxury: 'outline',
      minimal: 'ghost',
      bold: 'fill',
      friendly: 'soft',
      professional: 'fill',
      eco: 'soft',
      tech: 'fill',
      premium: 'outline'
    }
    
    const cardMapping: Record<Industry, ComponentSpec['cardStyle']> = {
      saas: 'elevated',
      ecommerce: 'bordered',
      portfolio: 'flat',
      blog: 'bordered',
      landing: 'elevated',
      documentation: 'flat',
      corporate: 'bordered',
      entertainment: 'elevated',
      education: 'bordered',
      healthcare: 'elevated',
      finance: 'bordered',
      gaming: 'elevated',
      fashion: 'flat',
      food: 'bordered',
      travel: 'elevated',
      realestate: 'bordered',
      nonprofit: 'bordered',
      government: 'flat',
      other: 'bordered'
    }
    
    return {
      borderRadius: radiusMapping[brandPersonality] || 'md',
      buttonStyle: buttonMapping[brandPersonality] || 'fill',
      cardStyle: cardMapping[industry] || 'bordered',
      navigationStyle: this.determineNavStyle(industry)
    }
  }

  private determineNavStyle(industry: Industry): ComponentSpec['navigationStyle'] {
    const sidebarIndustries = ['documentation', 'enterprise', 'saas']
    const hamburgerIndustries = ['entertainment', 'gaming', 'fashion']
    
    if (sidebarIndustries.includes(industry)) return 'sidebar'
    if (hamburgerIndustries.includes(industry)) return 'hamburger'
    return 'horizontal'
  }

  /**
   * Generate effect specification
   */
  private generateEffectSpec(): EffectSpec {
    const { brandPersonality, industry } = this.requirements
    
    const effectMapping: Record<BrandPersonality, Partial<EffectSpec>> = {
      trustworthy: { shadows: 'subtle', animations: 'subtle', gradients: 'none' },
      innovative: { shadows: 'medium', animations: 'moderate', gradients: 'subtle' },
      playful: { shadows: 'medium', animations: 'moderate', gradients: 'bold' },
      luxury: { shadows: 'subtle', animations: 'subtle', gradients: 'subtle' },
      minimal: { shadows: 'none', animations: 'none', gradients: 'none' },
      bold: { shadows: 'strong', animations: 'moderate', gradients: 'bold' },
      friendly: { shadows: 'subtle', animations: 'moderate', gradients: 'subtle' },
      professional: { shadows: 'subtle', animations: 'subtle', gradients: 'none' },
      eco: { shadows: 'subtle', animations: 'subtle', gradients: 'subtle' },
      tech: { shadows: 'medium', animations: 'moderate', gradients: 'subtle' },
      premium: { shadows: 'subtle', animations: 'subtle', gradients: 'subtle' }
    }
    
    const defaults: EffectSpec = {
      shadows: 'subtle',
      blurs: 'none',
      animations: 'subtle',
      gradients: 'none'
    }
    
    return { ...defaults, ...effectMapping[brandPersonality] }
  }

  /**
   * Generate reasoning for design decisions
   */
  private generateReasoning(spec: DesignSpec): DesignReasoning {
    const { industry, audience, brandPersonality } = this.requirements
    
    return {
      colorChoice: `Selected ${spec.colors.palette.primary} as primary to convey ${brandPersonality} personality in ${industry} industry`,
      typographyChoice: `Used ${spec.typography.heading.family} for headings to create ${spec.typography.fontPairing} visual hierarchy`,
      layoutChoice: `${spec.layout.container} container with ${spec.layout.visualDensity} density suits ${audience} audience`,
      componentStrategy: `Chose ${spec.components.cardStyle} cards and ${spec.components.buttonStyle} buttons to match ${brandPersonality} brand`,
      accessibilityConsiderations: `Designed for ${spec.colors.accessibility} compliance with ${spec.colors.colorSystem} color system`
    }
  }

  /**
   * Generate recommendations based on the design
   */
  private generateRecommendations(): string[] {
    const { industry, brandPersonality } = this.requirements
    const recommendations: string[] = []
    
    // Industry-specific recommendations
    if (industry === 'saas') {
      recommendations.push('Include social proof elements (logos, testimonials)')
      recommendations.push('Add feature comparison table')
    }
    
    if (industry === 'ecommerce') {
      recommendations.push('Optimize product images for fast loading')
      recommendations.push('Implement clear pricing display')
      recommendations.push('Add trust badges near checkout')
    }
    
    if (industry === 'blog') {
      recommendations.push('Focus on readable typography and line length')
      recommendations.push('Add estimated reading time')
      recommendations.push('Include table of contents for long articles')
    }
    
    if (industry === 'portfolio') {
      recommendations.push('Showcase work with large visuals')
      recommendations.push('Keep navigation minimal')
      recommendations.push('Add case study format')
    }
    
    // Personality-based recommendations
    if (brandPersonality === 'minimal') {
      recommendations.push('Use ample whitespace')
      recommendations.push('Limit color palette to 2-3 colors')
      recommendations.push('Use simple, clear iconography')
    }
    
    if (brandPersonality === 'bold') {
      recommendations.push('Use high contrast CTAs')
      recommendations.push('Consider asymmetric layouts')
      recommendations.push('Use strong typography hierarchy')
    }
    
    return recommendations
  }

  /**
   * Generate next steps for implementation
   */
  private generateNextSteps(): string[] {
    const { content, complexity } = this.requirements
    
    return [
      'Create component library based on design spec',
      'Build responsive grid system',
      'Implement color tokens and typography scale',
      'Develop animation transitions',
      'Test across devices and browsers',
      ...(complexity === 'complex' ? ['Set up design system documentation', 'Create component storybook'] : [])
    ]
  }
}

/**
 * Convenience function to generate design spec from requirements
 */
export function generateDesignSpec(requirements: UserRequirements): DesignDecisionResult {
  const engine = new DesignDecisionEngine(requirements)
  return engine.generateDesignSpec()
}
