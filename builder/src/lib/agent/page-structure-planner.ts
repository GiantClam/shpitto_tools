import { ProjectDesignSpec } from './design-spec-generator';
import { DesignContext } from './design-context-loader';
import { DesignSystem } from './design-md-parser';

export type SectionType = 
  | 'hero' 
  | 'features' 
  | 'pricing' 
  | 'testimonials' 
  | 'cta' 
  | 'faq' 
  | 'footer' 
  | 'nav' 
  | 'content'
  | 'gallery'
  | 'stats'
  | 'team'
  | 'contact'
  | 'pricing-table'
  | 'comparison'
  | 'timeline'
  | 'trust-logos';

export interface Section {
  name: string;
  type: SectionType;
  order: number;
  required: boolean;
  description?: string;
}

export interface PageStructure {
  pageName: string;
  pagePath: string;
  sections: Section[];
  navigation: NavigationConfig;
  footer: FooterConfig;
}

export interface NavigationConfig {
  type: 'horizontal' | 'vertical' | 'hamburger';
  items: NavItem[];
  logo?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface FooterConfig {
  type: 'simple' | 'complex';
  columns: string[];
  socialLinks?: string[];
  copyright?: string;
}

export interface StructureConfirmation {
  page: PageStructure;
  canProceed: boolean;
  suggestions: string[];
}

export async function planPageStructure(
  pageName: string,
  pagePath: string,
  designSpec: ProjectDesignSpec,
  requirements?: string
): Promise<PageStructure> {
  const ds = designSpec.appliedDesignSystem;
  const suggestedSections = inferSectionsFromDesign(ds, requirements);
  
  return {
    pageName,
    pagePath,
    sections: suggestedSections,
    navigation: inferNavigation(ds, pageName),
    footer: inferFooter(ds),
  };
}

function inferSectionsFromDesign(ds: DesignSystem, requirements?: string): Section[] {
  const sections: Section[] = [
    { name: 'Hero', type: 'hero', order: 1, required: true }
  ];

  const visualLower = ds.visualTheme.toLowerCase();
  const isFeatureRich = 
    visualLower.includes('feature-rich') || 
    visualLower.includes('dense') ||
    visualLower.includes('comprehensive');

  if (isFeatureRich) {
    sections.push(
      { name: 'Features', type: 'features', order: 2, required: false },
      { name: 'Stats', type: 'stats', order: 3, required: false }
    );
  }

  if (requirements?.toLowerCase().includes('pricing')) {
    sections.push(
      { name: 'Pricing', type: 'pricing', order: 4, required: false }
    );
  }

  if (requirements?.toLowerCase().includes('testimonial')) {
    sections.push(
      { name: 'Testimonials', type: 'testimonials', order: 5, required: false }
    );
  }

  if (requirements?.toLowerCase().includes('faq')) {
    sections.push(
      { name: 'FAQ', type: 'faq', order: 6, required: false }
    );
  }

  if (requirements?.toLowerCase().includes('team')) {
    sections.push(
      { name: 'Team', type: 'team', order: 7, required: false }
    );
  }

  if (requirements?.toLowerCase().includes('gallery') || requirements?.toLowerCase().includes('showcase')) {
    sections.push(
      { name: 'Gallery', type: 'gallery', order: 8, required: false }
    );
  }

  sections.push(
    { name: 'CTA', type: 'cta', order: 99, required: true }
  );

  return sections;
}

function inferNavigation(ds: DesignSystem, pageName: string): NavigationConfig {
  const layoutWidth = parseInt(ds.layout.maxWidth) || 1200;
  
  if (layoutWidth < 800) {
    return { 
      type: 'hamburger', 
      items: [
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Contact', href: '/contact' },
      ]
    };
  }
  
  return {
    type: 'horizontal',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ]
  };
}

function inferFooter(ds: DesignSystem): FooterConfig {
  return {
    type: 'simple',
    columns: ['Links', 'Resources', 'Company', 'Legal'],
    socialLinks: ['twitter', 'github', 'linkedin'],
    copyright: `© ${new Date().getFullYear()} All rights reserved.`,
  };
}

export function validatePageStructure(structure: PageStructure): StructureConfirmation {
  const suggestions: string[] = [];
  let canProceed = true;

  if (!structure.sections.find(s => s.type === 'hero')) {
    suggestions.push('建议添加 Hero section 作为首屏');
    canProceed = false;
  }

  if (!structure.sections.find(s => s.type === 'cta')) {
    suggestions.push('建议添加 CTA section 促进转化');
  }

  if (structure.sections.length > 10) {
    suggestions.push('页面 section 较多，考虑拆分为多个页面');
  }

  const hasNav = structure.navigation.items.length > 0;
  if (!hasNav) {
    suggestions.push('建议添加导航 items');
  }

  return { page: structure, canProceed, suggestions };
}

export function reorderSections(structure: PageStructure): PageStructure {
  const sorted = {
    ...structure,
    sections: [...structure.sections].sort((a, b) => a.order - b.order),
  };
  return sorted;
}

export function addSection(structure: PageStructure, section: Section): PageStructure {
  return {
    ...structure,
    sections: [...structure.sections, section],
  };
}

export function removeSection(structure: PageStructure, sectionName: string): PageStructure {
  return {
    ...structure,
    sections: structure.sections.filter(s => s.name !== sectionName),
  };
}

export function updateSection(structure: PageStructure, sectionName: string, updates: Partial<Section>): PageStructure {
  return {
    ...structure,
    sections: structure.sections.map(s => 
      s.name === sectionName ? { ...s, ...updates } : s
    ),
  };
}
