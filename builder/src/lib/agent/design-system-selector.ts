import { llm } from './graph';
import { listAvailableBrands, loadDesignSystem, DesignSystem } from './design-md-parser';

export interface DesignSelection {
  primary: DesignSystem;
  mixed?: Array<{
    source: 'primary' | string;
    section: string;
    tokens: Partial<DesignSystem>;
  }>;
  customOverrides?: Record<string, string>;
}

export interface BrandRecommendation {
  name: string;
  description: string;
  suitableFor: string;
  keyColors: string[];
  typography: string;
  visualStyle: string;
}

export interface DesignSelectionResult {
  selection: DesignSelection;
  confirmationItems: ConfirmationItem[];
}

export interface ConfirmationItem {
  id: string;
  category: 'color' | 'typography' | 'component' | 'layout' | 'shadow' | 'responsive';
  label: string;
  current: string;
  alternatives?: string[];
  appliedValue?: string;
  description: string;
}

export async function selectDesignSystem(
  userPrompt: string,
  limit: number = 5
): Promise<{
  brands: BrandRecommendation[];
  allBrands: string[];
}> {
  const allBrands = await listAvailableBrands();
  
  if (!llm) {
    throw new Error('LLM client not initialized');
  }

  const prompt = `You are a design system recommendation expert.
Based on the user requirements, recommend the most suitable design systems.

User requirements: ${userPrompt}

Available design systems: ${allBrands.join(', ')}

Analyze each brand and recommend the top ${limit} most suitable ones.
For each recommended brand, provide:
1. brand name (must be one of: ${allBrands.join(', ')})
2. one sentence description
3. suitable use cases
4. key colors (hex codes)
5. typography style
6. visual style summary

Return a JSON object with a "recommendations" array.`;

  const response = await llm.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response');
  }

  try {
    const parsed = JSON.parse(textContent.text);
    const recommendations = parsed.recommendations as BrandRecommendation[];
    return {
      brands: recommendations || [],
      allBrands,
    };
  } catch (error) {
    console.error('Failed to parse recommendations:', error);
    return {
      brands: [],
      allBrands,
    };
  }
}

export async function generateDesignConfirmation(
  selectedBrand: string,
  userRequirements: string
): Promise<{
  designSystem: DesignSystem;
  confirmationItems: ConfirmationItem[];
}> {
  const designSystem = await loadDesignSystem(selectedBrand);
  const confirmationItems: ConfirmationItem[] = [];

  if (designSystem.colors.primary.length > 0) {
    confirmationItems.push({
      id: 'primary-color',
      category: 'color',
      label: 'Primary Color',
      current: designSystem.colors.primary[0].value,
      alternatives: designSystem.colors.primary.slice(0, 5).map(c => c.value),
      description: designSystem.colors.primary[0].description || 'Primary brand color',
    });
  }

  if (designSystem.colors.accent.length > 0) {
    confirmationItems.push({
      id: 'accent-color',
      category: 'color',
      label: 'Accent Color',
      current: designSystem.colors.accent[0].value,
      alternatives: designSystem.colors.accent.slice(0, 5).map(c => c.value),
      description: designSystem.colors.accent[0].description || 'Accent color for CTAs',
    });
  }

  if (designSystem.colors.neutral.length > 0) {
    confirmationItems.push({
      id: 'neutral-color',
      category: 'color',
      label: 'Neutral/Background',
      current: designSystem.colors.neutral.find(c => c.value.includes('ffffff'))?.value || '#ffffff',
      alternatives: designSystem.colors.neutral.slice(0, 3).map(c => c.value),
      description: 'Background and neutral surface colors',
    });
  }

  const headingTypo = designSystem.typography.find(t => 
    t.role.toLowerCase().includes('display') || 
    t.role.toLowerCase().includes('heading') ||
    t.role.toLowerCase().includes('hero')
  );
  if (headingTypo) {
    confirmationItems.push({
      id: 'heading-font',
      category: 'typography',
      label: 'Heading Typography',
      current: `${headingTypo.font} ${headingTypo.size} weight ${headingTypo.weight}`,
      description: headingTypo.notes || 'Font for headings and display text',
    });
  }

  const bodyTypo = designSystem.typography.find(t => 
    t.role.toLowerCase().includes('body')
  );
  if (bodyTypo) {
    confirmationItems.push({
      id: 'body-font',
      category: 'typography',
      label: 'Body Typography',
      current: `${bodyTypo.font} ${bodyTypo.size} weight ${bodyTypo.weight}`,
      description: bodyTypo.notes || 'Font for body text',
    });
  }

  const cardComponent = designSystem.components.find(c => 
    c.type.toLowerCase().includes('card')
  );
  if (cardComponent) {
    confirmationItems.push({
      id: 'card-style',
      category: 'component',
      label: 'Card Style',
      current: JSON.stringify(cardComponent.properties).slice(0, 100),
      description: 'Card component styling',
    });
  }

  confirmationItems.push({
    id: 'spacing-base',
    category: 'layout',
    label: 'Spacing System',
    current: `Base: ${designSystem.layout.spacing[2] || 8}px`,
    description: 'Base spacing unit for the design system',
  });

  const shadowKeys = Object.keys(designSystem.shadows);
  if (shadowKeys.length > 0) {
    confirmationItems.push({
      id: 'shadow-style',
      category: 'shadow',
      label: 'Shadow Style',
      current: shadowKeys[0],
      alternatives: shadowKeys,
      description: 'Shadow-as-border technique',
    });
  }

  return {
    designSystem,
    confirmationItems,
  };
}

export async function mixDesignSystems(
  base: DesignSystem,
  overrides: Array<{ source: DesignSystem; section: 'colors' | 'typography' | 'components' | 'layout' | 'shadows'; weight: number }>
): Promise<DesignSystem> {
  const mixed = { ...base, colors: { ...base.colors }, layout: { ...base.layout } };
  
  for (const override of overrides) {
    switch (override.section) {
      case 'colors':
        mixed.colors = {
          primary: [...base.colors.primary, ...override.source.colors.primary],
          accent: [...base.colors.accent, ...override.source.colors.accent],
          neutral: [...base.colors.neutral, ...override.source.colors.neutral],
          semantic: [...base.colors.semantic, ...override.source.colors.semantic],
          shadows: [...base.colors.shadows, ...override.source.colors.shadows],
        };
        break;
      case 'typography':
        mixed.typography = [...base.typography, ...override.source.typography];
        break;
      case 'shadows':
        mixed.shadows = { ...base.shadows, ...override.source.shadows };
        break;
      case 'layout':
        mixed.layout = { ...base.layout, ...override.source.layout };
        break;
    }
  }
  
  return mixed;
}

export function getDesignSystemPreviewPath(brand: string): string {
  return `builder/design-systems/design-md/${brand}/preview.html`;
}

export function getDesignSystemReadmePath(brand: string): string {
  return `builder/design-systems/design-md/${brand}/README.md`;
}
