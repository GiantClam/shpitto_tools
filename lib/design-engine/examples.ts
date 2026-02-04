/**
 * Design Engine Usage Examples
 */

import {
  DesignEngine,
  quickDesign,
  generateDesignSpec,
  type UserRequirements
} from './index'

// ============================================
// EXAMPLE 1: Quick Design for SaaS Product
// ============================================

console.log('='.repeat(60))
console.log('EXAMPLE 1: Quick SaaS Design')
console.log('='.repeat(60))

const saasDesign = quickDesign.saas('innovative')

console.log('\n📐 Design Spec:')
console.log('Theme:', saasDesign.spec.colors.theme)
console.log('Primary Color:', saasDesign.spec.colors.palette.primary)
console.log('Font Pairing:', saasDesign.spec.typography.fontPairing)
console.log('Border Radius:', saasDesign.spec.components.borderRadius)

console.log('\n💡 Reasoning:')
console.log('Color:', saasDesign.reasoning.colorChoice)
console.log('Typography:', saasDesign.reasoning.typographyChoice)
console.log('Layout:', saasDesign.reasoning.layoutChoice)

console.log('\n📝 Recommendations:')
saasDesign.recommendations.forEach((rec, i) => {
  console.log(`  ${i + 1}. ${rec}`)
})

// ============================================
// EXAMPLE 2: Custom Requirements
// ============================================

console.log('\n' + '='.repeat(60))
console.log('EXAMPLE 2: Custom E-commerce Design')
console.log('='.repeat(60))

const customRequirements: UserRequirements = {
  industry: 'ecommerce',
  audience: 'consumer',
  brandPersonality: 'bold',
  complexity: 'complex',
  content: {
    hasEcommerce: true,
    hasTestimonials: true,
    hasFAQ: true
  },
  preferences: {
    darkMode: true,
    preferredColors: ['#DC2626', '#7C2D12'] // Red tones
  }
}

const customDesign = generateDesignSpec(customRequirements)

console.log('\n🎨 Color Palette:')
const palette = customDesign.spec.colors.palette
console.log('  Primary:', palette.primary)
console.log('  Secondary:', palette.secondary)
console.log('  Accent:', palette.accent)
console.log('  Background:', palette.background)
console.log('  Text:', palette.text)

console.log('\n🔤 Typography:')
console.log('  Heading:', customDesign.spec.typography.heading.family, 
  `(${customDesign.spec.typography.heading.weight})`)
console.log('  Body:', customDesign.spec.typography.body.family)

console.log('\n📐 Layout:')
console.log('  Container:', customDesign.spec.layout.container)
console.log('  Grid Columns:', customDesign.spec.layout.gridColumns)
console.log('  Visual Density:', customDesign.spec.layout.visualDensity)

// ============================================
// EXAMPLE 3: Full Design Engine with Templates
// ============================================

console.log('\n' + '='.repeat(60))
console.log('EXAMPLE 3: Design Engine with Template Selection')
console.log('='.repeat(60))

// Mock template library
const templateLibrary = [
  {
    name: 'Modern SaaS Landing',
    slug: 'modern-saas-landing',
    template_type: 'page',
    template_kind: 'landing',
    template_source: 'crawled',
    visual_spec: {
      theme: 'dark',
      palette: { primary: '#0066FF', accent: '#38bdf8', background: '#0f172a' },
      typography: { font: 'Inter' },
      layout: { radius: 'md', has_grid: true, has_flex: true }
    },
    puck_data: {
      content: [
        { type: 'Hero' },
        { type: 'FeatureGrid' },
        { type: 'Testimonials' },
        { type: 'CTA' }
      ]
    }
  },
  {
    name: 'Minimal Portfolio',
    slug: 'minimal-portfolio',
    template_type: 'page',
    template_kind: 'portfolio',
    template_source: 'library',
    visual_spec: {
      theme: 'light',
      palette: { primary: '#1c1917', accent: '#a8a29e', background: '#ffffff' },
      typography: { font: 'DM Sans' },
      layout: { radius: 'none', has_grid: true, has_flex: false }
    },
    puck_data: {
      content: [
        { type: 'Hero' },
        { type: 'Gallery' },
        { type: 'Contact' }
      ]
    }
  }
]

// Initialize engine with templates
const engine = new DesignEngine({
  templateLibrary,
  minScore: 30,
  maxResults: 3
})

// Generate solution
const solution = engine.generateSolution({
  industry: 'saas',
  audience: 'business',
  brandPersonality: 'tech',
  complexity: 'moderate'
})

console.log('\n🎯 Best Matching Template:')
if (solution.template) {
  console.log('  Name:', solution.template.template.name)
  console.log('  Score:', solution.template.score + '/100')
  console.log('  Match Reasons:', solution.template.matchReasons.join(', '))
  console.log('  Customization Instructions:')
  solution.template.customizationInstructions.forEach((inst, i) => {
    console.log(`    ${i + 1}. ${inst}`)
  })
} else {
  console.log('  No matching template found, generating custom...')
  console.log('  (Custom template would be generated)')
}

// ============================================
// EXAMPLE 4: Industry-Specific Design
// ============================================

console.log('\n' + '='.repeat(60))
console.log('EXAMPLE 4: Different Industry Designs')
console.log('='.repeat(60))

const industries = [
  { name: 'Healthcare', req: { industry: 'healthcare' as const, audience: 'general' as const, brandPersonality: 'friendly' as const, complexity: 'moderate' as const } },
  { name: 'Fashion', req: { industry: 'fashion' as const, audience: 'consumer' as const, brandPersonality: 'luxury' as const, complexity: 'simple' as const } },
  { name: 'Gaming', req: { industry: 'gaming' as const, audience: 'consumer' as const, brandPersonality: 'bold' as const, complexity: 'complex' as const } }
]

for (const ind of industries) {
  console.log(`\n🏢 ${ind.name}:`)
  const design = generateDesignSpec(ind.req)
  console.log('  Theme:', design.spec.colors.theme)
  console.log('  Primary:', design.spec.colors.palette.primary)
  console.log('  Font:', design.spec.typography.heading.family)
  console.log('  Border Radius:', design.spec.components.borderRadius)
}

// ============================================
// EXAMPLE 5: Design Spec Output
// ============================================

console.log('\n' + '='.repeat(60))
console.log('EXAMPLE 5: Complete Design Spec (JSON Output)')
console.log('='.repeat(60))

const fullDesign = generateDesignSpec({
  industry: 'saas',
  audience: 'business',
  brandPersonality: 'innovative',
  complexity: 'moderate',
  content: {
    hasTestimonials: true,
    hasPricing: true,
    hasFAQ: true
  }
})

console.log(JSON.stringify({
  colors: fullDesign.spec.colors,
  typography: fullDesign.spec.typography,
  layout: fullDesign.spec.layout,
  spacing: fullDesign.spec.spacing,
  components: fullDesign.spec.components,
  effects: fullDesign.spec.effects
}, null, 2))

console.log('\n✅ Design Engine examples complete!')
