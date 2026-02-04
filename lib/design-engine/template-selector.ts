/**
 * Smart Template Selector
 * Uses design spec to find and score templates from the template library
 */

import type { DesignSpec } from './knowledge-base'
import type { Template } from './template-types'

export interface TemplateScore {
  template: Template
  score: number
  matchReasons: string[]
  missingComponents: string[]
  customizationNotes: string[]
}

export interface SelectorConfig {
  minScore?: number
  maxResults?: number
  preferCrawled?: boolean
  preferRecent?: boolean
}

const DEFAULT_CONFIG: SelectorConfig = {
  minScore: 50,
  maxResults: 5,
  preferCrawled: false,
  preferRecent: false
}

/**
 * Score a template against a design spec
 */
function scoreTemplate(template: Template, spec: DesignSpec): TemplateScore {
  let score = 0
  const matchReasons: string[] = []
  const missingComponents: string[] = []
  const customizationNotes: string[] = []

  // 1. Color matching (0-25 points)
  const colorScore = scoreColorMatch(template, spec, matchReasons)
  score += colorScore

  // 2. Typography matching (0-20 points)
  const typeScore = scoreTypographyMatch(template, spec, matchReasons)
  score += typeScore

  // 3. Layout matching (0-20 points)
  const layoutScore = scoreLayoutMatch(template, spec, matchReasons)
  score += layoutScore

  // 4. Component matching (0-25 points)
  const componentScore = scoreComponentMatch(template, spec, missingComponents, customizationNotes)
  score += componentScore

  // 5. Theme matching (0-10 points)
  const themeScore = scoreThemeMatch(template, spec, matchReasons)
  score += themeScore

  return {
    template,
    score,
    matchReasons,
    missingComponents,
    customizationNotes
  }
}

function scoreColorMatch(template: Template, spec: DesignSpec, reasons: string[]): number {
  let score = 0
  const templatePalette = template.visual_spec?.palette
  const specPalette = spec.colors.palette

  if (!templatePalette) return score

  // Primary color matching
  if (templatePalette.primary) {
    const templatePrimary = templatePalette.primary.toLowerCase()
    const specPrimary = specPalette.primary.toLowerCase()
    
    if (templatePrimary === specPrimary) {
      score += 10
      reasons.push('Primary color matches exactly')
    } else if (templatePrimary.includes(specPrimary.slice(1)) || specPrimary.includes(templatePrimary.slice(1))) {
      score += 5
      reasons.push('Primary color is similar')
    } else {
      customizationNotes.push(`Change primary color from ${templatePalette.primary} to ${specPalette.primary}`)
    }
  }

  // Theme matching
  const templateTheme = template.visual_spec?.theme || 'light'
  if (templateTheme === spec.colors.theme) {
    score += 10
    reasons.push(`Theme (${templateTheme}) matches`)
  } else {
    customizationNotes.push(`Convert theme from ${templateTheme} to ${spec.colors.theme}`)
  }

  // Accent color presence
  if (templatePalette.accent) {
    score += 5
    reasons.push('Has accent color defined')
  }

  return score
}

function scoreTypographyMatch(template: Template, spec: DesignSpec, reasons: string[]): number {
  let score = 0
  const templateType = template.visual_spec?.typography
  const specType = spec.typography

  if (!templateType) return score

  // Font family matching
  const templateFont = (templateType.font || '').toLowerCase()
  const specFont = specType.heading.family.toLowerCase()
  
  if (templateFont.includes(specFont) || specFont.includes(templateFont)) {
    score += 10
    reasons.push(`Font (${templateType.font}) aligns with spec`)
  } else {
    customizationNotes.push(`Replace font ${templateType.font} with ${specType.heading.family}`)
  }

  // Typography scale matching
  const templateHeading = parseInt(templateType.heading) || 48
  const specHeading = parseInt(specType.heading.heading) || 48
  
  if (Math.abs(templateHeading - specHeading) < 8) {
    score += 5
    reasons.push('Heading size is appropriate')
  } else {
    customizationNotes.push(`Adjust heading from ${templateHeading}px to ${specHeading}px`)
  }

  // Font pairing style
  if (templateType.font && specType.fontPairing) {
    const pairingMap: Record<string, string[]> = {
      modern: ['inter', 'dm sans', 'plus jakarta'],
      tech: ['space grotesk', 'inter', 'jetbrains'],
      classic: ['playfair', 'merriweather', 'lora'],
      elegant: ['cormorant', 'bodoni', 'cinzel'],
      friendly: ['nunito', 'quicksand', 'fredoka']
    }
    
    const specPairing = pairingMap[specType.fontPairing] || []
    if (specPairing.some(f => templateFont.includes(f))) {
      score += 5
      reasons.push('Font pairing style matches')
    }
  }

  return score
}

function scoreLayoutMatch(template: Template, spec: DesignSpec, reasons: string[]): number {
  let score = 0
  const templateLayout = template.visual_spec?.layout
  const specLayout = spec.layout

  if (!templateLayout) return score

  // Border radius matching
  const templateRadius = templateLayout.radius || 'md'
  if (templateRadius === spec.components.borderRadius) {
    score += 8
    reasons.push(`Border radius (${templateRadius}) matches`)
  } else {
    customizationNotes.push(`Change border radius from ${templateRadius} to ${spec.components.borderRadius}`)
  }

  // Grid presence
  if (templateLayout.has_grid) {
    score += 6
    reasons.push('Template uses grid layout')
  }

  // Flexbox presence
  if (templateLayout.has_flex) {
    score += 6
    reasons.push('Template uses flexbox for components')
  }

  // Visual density matching
  const density = templateLayout.density || templateLayout.visual_density || 'balanced'
  const specDensity = specLayout.visualDensity
  
  if (density === specDensity) {
    score += 4
    reasons.push(`Visual density (${density}) matches`)
  }

  return score
}

function scoreComponentMatch(
  template: Template,
  spec: DesignSpec,
  missing: string[],
  notes: string[]
): number {
  let score = 0
  const templatePuck = template.puck_data
  const specComponents = spec.components

  if (!templatePuck?.content) return score

  const templateComponents = templatePuck.content.map((c: any) => c.type || c.component)

  // Define ideal components by spec
  const idealComponents = getIdealComponents(spec, specComponents)

  // Score based on component match
  let matches = 0
  for (const ideal of idealComponents) {
    const hasMatch = templateComponents.some((tc: string) => 
      tc.toLowerCase().includes(ideal.toLowerCase()) ||
      ideal.toLowerCase().includes(tc.toLowerCase())
    )
    
    if (hasMatch) {
      matches++
      score += 3
    } else {
      missing.push(ideal)
    }
  }

  if (matches > 0) {
    notes.push(`Template has ${matches}/${idealComponents.length} ideal components`)
  }

  // Bonus for hero component
  if (templateComponents.some((c: string) => c.toLowerCase().includes('hero'))) {
    score += 5
    reasons.push('Has hero section')
  }

  // Bonus for CTA component
  if (templateComponents.some((c: string) => c.toLowerCase().includes('cta'))) {
    score += 4
    reasons.push('Has call-to-action section')
  }

  // Bonus for responsive consideration
  if (templatePuck.root?.props?.responsive !== undefined) {
    score += 3
    reasons.push('Has responsive design')
  }

  return score
}

function getIdealComponents(spec: DesignSpec, components: any): string[] {
  const { industry, content } = {} as any // Would use actual requirements
  
  const componentMap: Record<string, string[]> = {
    saas: ['Hero', 'FeatureGrid', 'Testimonials', 'PricingTable', 'FAQ', 'CTA'],
    ecommerce: ['Hero', 'ProductGrid', 'ProductCard', 'Cart', 'FeaturedProducts'],
    portfolio: ['Hero', 'Gallery', 'ProjectCard', 'About', 'Contact'],
    blog: ['Hero', 'ArticleList', 'Sidebar', 'Newsletter', 'RelatedPosts'],
    landing: ['Hero', 'FeatureHighlight', 'SocialProof', 'CTA', 'TrustBadges'],
    documentation: ['SidebarNav', 'ContentBlock', 'CodeBlock', 'Search', 'Breadcrumb'],
    corporate: ['Hero', 'AboutSection', 'TeamGrid', 'ServicesList', 'ContactForm']
  }

  return componentMap[industry] || ['Hero', 'FeatureGrid', 'CTA']
}

function scoreThemeMatch(template: Template, spec: DesignSpec, reasons: string[]): number {
  let score = 0
  
  // Check template source
  if (template.template_source === 'crawled') {
    score += 5
    reasons.push('Template is from real website')
  } else if (template.template_source === 'library') {
    score += 3
    reasons.push('Template is from curated library')
  }

  // Check template type
  if (template.template_type === spec.layout.container) {
    score += 5
  }

  return score
}

/**
 * Smart Template Selector class
 */
export class SmartTemplateSelector {
  private templates: Template[]
  private config: SelectorConfig

  constructor(templates: Template[], config: Partial<SelectorConfig> = {}) {
    this.templates = templates
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Select best matching templates for a design spec
   */
  select(spec: DesignSpec): TemplateScore[] {
    // Score all templates
    const scored = this.templates.map(t => scoreTemplate(t, spec))

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score)

    // Filter by minimum score
    const filtered = scored.filter(s => s.score >= (this.config.minScore || 0))

    // Limit results
    return filtered.slice(0, this.config.maxResults || 5)
  }

  /**
   * Get a single best match
   */
  getBestMatch(spec: DesignSpec): TemplateScore | null {
    const results = this.select(spec)
    return results[0] || null
  }

  /**
   * Get customization instructions for a template
   */
  getCustomizationInstructions(score: TemplateScore): string[] {
    const instructions: string[] = []

    // Add customization notes
    for (const note of score.customizationNotes) {
      instructions.push(note)
    }

    // Add component recommendations
    for (const missing of score.missingComponents) {
      instructions.push(`Add ${missing} component`)
    }

    // Add color adjustments
    if (score.matchReasons.some(r => r.includes('color'))) {
      instructions.push('Apply color palette from design spec')
    }

    // Add typography updates
    if (score.matchReasons.some(r => r.includes('font'))) {
      instructions.push('Update typography scale from design spec')
    }

    return instructions
  }

  /**
   * Generate a custom template based on design spec
   */
  generateCustomTemplate(spec: DesignSpec): any {
    const components = this.generateComponentsFromSpec(spec)

    return {
      name: `Custom ${spec.colors.theme} ${spec.typography.fontPairing} Design`,
      template_type: 'custom',
      template_kind: 'landing',
      template_source: 'generated',
      puck_data: {
        root: {
          props: {
            title: 'New Site',
            branding: {
              name: 'Brand',
              colors: spec.colors.palette,
              style: {
                typography: spec.typography.heading.family,
                borderRadius: spec.components.borderRadius
              }
            }
          }
        },
        content: components
      },
      visual_spec: {
        typography: {
          heading: `${spec.typography.heading.weight} ${spec.typography.heading.family}`,
          body: spec.typography.body.family
        },
        layout: {
          radius: spec.components.borderRadius,
          has_grid: true,
          has_flex: true,
          visual_density: spec.layout.visualDensity
        },
        theme: spec.colors.theme,
        palette: spec.colors.palette,
        align: spec.layout.alignment
      },
      interaction_spec: {
        animations: spec.effects.animations
      },
      copy_spec: {
        tone: spec.colors.colorSystem
      }
    }
  }

  private generateComponentsFromSpec(spec: DesignSpec): any[] {
    const components: any[] = []

    // Always start with hero
    components.push({
      type: 'Hero',
      props: {
        title: 'Welcome',
        description: 'Your compelling headline goes here',
        theme: spec.colors.theme,
        align: spec.layout.alignment,
        effect: spec.effects.gradients !== 'none' ? 'gradient' : 'none'
      }
    })

    // Add features based on industry
    components.push({
      type: 'FeatureGrid',
      props: {
        title: 'Key Features',
        items: [
          { title: 'Feature 1', description: 'Description of feature 1' },
          { title: 'Feature 2', description: 'Description of feature 2' },
          { title: 'Feature 3', description: 'Description of feature 3' }
        ],
        columns: spec.layout.gridColumns >= 12 ? 3 : 2
      }
    })

    // Add social proof
    components.push({
      type: 'Testimonials',
      props: {
        title: 'What People Say',
        items: [
          { content: 'Great product!', author: 'Customer 1', role: 'CEO' }
        ]
      }
    })

    // Add CTA
    components.push({
      type: 'CTA',
      props: {
        title: 'Ready to Get Started?',
        description: 'Join thousands of satisfied customers today.',
        buttonText: 'Get Started',
        theme: spec.colors.theme
      }
    })

    return components
  }
}

/**
 * Convenience function to select templates
 */
export function selectTemplates(
  templates: Template[],
  spec: DesignSpec,
  config?: Partial<SelectorConfig>
): TemplateScore[] {
  const selector = new SmartTemplateSelector(templates, config)
  return selector.select(spec)
}
