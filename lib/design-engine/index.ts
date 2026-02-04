/**
 * Design Engine - Main Export
 * A comprehensive system for making intelligent design decisions
 */

export * from './knowledge-base'
export * from './decision-engine'
export * from './template-selector'

import type { DesignSpec, UserRequirements } from './knowledge-base'
import { DesignDecisionEngine, generateDesignSpec } from './decision-engine'
import { SmartTemplateSelector, selectTemplates } from './template-selector'

export interface DesignEngineConfig {
  templateLibrary?: any[]
  minScore?: number
  maxResults?: number
}

/**
 * Main Design Engine class that orchestrates the entire design process
 */
export class DesignEngine {
  private templateSelector?: SmartTemplateSelector

  constructor(config: DesignEngineConfig = {}) {
    if (config.templateLibrary?.length) {
      this.templateSelector = new SmartTemplateSelector(config.templateLibrary, {
        minScore: config.minScore,
        maxResults: config.maxResults
      })
    }
  }

  /**
   * Analyze user requirements and generate design decisions
   */
  analyze(requirements: UserRequirements): DesignAnalysisResult {
    const result = generateDesignSpec(requirements)
    
    return {
      designSpec: result.spec,
      reasoning: result.reasoning,
      recommendations: result.recommendations,
      nextSteps: result.nextSteps,
      requirements
    }
  }

  /**
   * Find matching templates for a design spec
   */
  findTemplates(spec: DesignSpec): any[] {
    if (!this.templateSelector) {
      console.warn('No template library provided to DesignEngine')
      return []
    }
    
    const scores = this.templateSelector.select(spec)
    return scores.map(s => ({
      template: s.template,
      score: s.score,
      matchReasons: s.matchReasons,
      customizationNotes: s.customizationNotes
    }))
  }

  /**
   * Get a single best matching template with customization instructions
   */
  getBestTemplate(spec: DesignSpec): BestTemplateResult | null {
    if (!this.templateSelector) {
      return null
    }

    const score = this.templateSelector.getBestMatch(spec)
    if (!score) return null

    const instructions = this.templateSelector.getCustomizationInstructions(score)

    return {
      template: score.template,
      score: score.score,
      matchReasons: score.matchReasons,
      missingComponents: score.missingComponents,
      customizationInstructions: instructions,
      generatedTemplate: this.templateSelector.generateCustomTemplate(spec)
    }
  }

  /**
   * Generate a complete design solution
   */
  generateSolution(requirements: UserRequirements): DesignSolution {
    const analysis = this.analyze(requirements)
    const bestTemplate = this.getBestTemplate(analysis.designSpec)

    return {
      requirements,
      analysis,
      template: bestTemplate,
      implementation: {
        colors: analysis.designSpec.colors,
        typography: analysis.designSpec.typography,
        layout: analysis.designSpec.layout,
        components: analysis.designSpec.components,
        effects: analysis.designSpec.effects
      }
    }
  }
}

export interface DesignAnalysisResult {
  designSpec: DesignSpec
  reasoning: {
    colorChoice: string
    typographyChoice: string
    layoutChoice: string
    componentStrategy: string
    accessibilityConsiderations: string
  }
  recommendations: string[]
  nextSteps: string[]
  requirements: UserRequirements
}

export interface BestTemplateResult {
  template: any
  score: number
  matchReasons: string[]
  missingComponents: string[]
  customizationInstructions: string[]
  generatedTemplate: any
}

export interface DesignSolution {
  requirements: UserRequirements
  analysis: DesignAnalysisResult
  template: BestTemplateResult | null
  implementation: {
    colors: DesignSpec['colors']
    typography: DesignSpec['typography']
    layout: DesignSpec['layout']
    components: DesignSpec['components']
    effects: DesignSpec['effects']
  }
}

/**
 * Quick design spec generator for common use cases
 */
export const quickDesign = {
  // SaaS product
  saas: (personality: 'innovative' | 'trustworthy' | 'tech' = 'innovative') => 
    generateDesignSpec({
      industry: 'saas',
      audience: 'business',
      brandPersonality: personality,
      complexity: 'moderate',
      content: {
        hasTestimonials: true,
        hasPricing: true,
        hasFAQ: true
      }
    }),

  // E-commerce store
  ecommerce: (personality: 'bold' | 'minimal' | 'friendly' = 'bold') =>
    generateDesignSpec({
      industry: 'ecommerce',
      audience: 'consumer',
      brandPersonality: personality,
      complexity: 'complex',
      content: {
        hasEcommerce: true,
        hasTestimonials: true
      }
    }),

  // Portfolio
  portfolio: (personality: 'creative' | 'minimal' | 'luxury' = 'creative') =>
    generateDesignSpec({
      industry: 'portfolio',
      audience: 'creative',
      brandPersonality: personality,
      complexity: 'simple',
      content: {
        hasPortfolio: true
      }
    }),

  // Blog
  blog: (personality: 'professional' | 'friendly' = 'professional') =>
    generateDesignSpec({
      industry: 'blog',
      audience: 'general',
      brandPersonality: personality,
      complexity: 'simple',
      content: {
        hasBlog: true
      }
    }),

  // Corporate
  corporate: () =>
    generateDesignSpec({
      industry: 'corporate',
      audience: 'business',
      brandPersonality: 'trustworthy',
      complexity: 'moderate',
      content: {
        hasTeam: true,
        hasTestimonials: true
      }
    }),

  // Landing page
  landing: (personality: 'bold' | 'innovative' | 'professional' = 'bold') =>
    generateDesignSpec({
      industry: 'landing',
      audience: 'general',
      brandPersonality: personality,
      complexity: 'simple',
      content: {
        hasTestimonials: true,
        hasFAQ: true
      }
    })
}
