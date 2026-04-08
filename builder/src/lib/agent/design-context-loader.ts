import { DesignSystem } from './design-md-parser';
import { ProjectDesignSpec } from './design-spec-generator';
import { MAGIC_UI_COMPONENTS, MagicComponentConfig } from './magic-ui-registry';

export interface DesignContext {
  colors: ColorContext;
  typography: TypographyContext;
  components: ComponentContext;
  spacing: SpacingContext;
  shadows: ShadowContext;
  layout: LayoutContext;
  responsive: ResponsiveContext;
  magicUI: MagicUIContext;
  motion: MotionContext;
}

export interface MagicUIContext {
  availableComponents: MagicComponentConfig[];
  animationComponents: MagicComponentConfig[];
  effectComponents: MagicComponentConfig[];
  interactiveComponents: MagicComponentConfig[];
  layoutComponents: MagicComponentConfig[];
}

export interface MotionContext {
  library: 'framer-motion';
  entranceAnimations: string[];
  continuousAnimations: string[];
  interactionAnimations: string[];
}

export interface ColorContext {
  cssVariables: Record<string, string>;
  hexValues: Record<string, string>;
  primary: Array<{ name: string; value: string }>;
  accent: Array<{ name: string; value: string }>;
  neutral: Array<{ name: string; value: string }>;
}

export interface TypographyContext {
  fontFamilies: string[];
  hierarchy: Array<{
    role: string;
    font: string;
    size: string;
    weight: number;
    lineHeight: string;
    letterSpacing: string;
  }>;
}

export interface ComponentContext {
  button?: Record<string, string>;
  card?: Record<string, string>;
  input?: Record<string, string>;
  navigation?: Record<string, string>;
  [key: string]: Record<string, string> | undefined;
}

export interface SpacingContext {
  scale: number[];
  base: number;
  unit: string;
}

export interface ShadowContext {
  levels: Record<string, string>;
  technique: 'shadow-as-border' | 'traditional';
}

export interface LayoutContext {
  maxWidth: string;
  grid: string;
  borderRadius: Record<string, string>;
}

export interface ResponsiveContext {
  breakpoints: Array<{
    name: string;
    width: string;
    description?: string;
  }>;
}

export function buildDesignContext(spec: ProjectDesignSpec): DesignContext {
  const ds = spec.appliedDesignSystem;
  
  return {
    colors: buildColorContext(ds),
    typography: buildTypographyContext(ds),
    components: buildComponentContext(ds),
    spacing: buildSpacingContext(ds),
    shadows: buildShadowContext(ds),
    layout: buildLayoutContext(ds),
    responsive: buildResponsiveContext(ds),
    magicUI: buildMagicUIContext(),
    motion: buildMotionContext(),
  };
}

function buildMagicUIContext(): MagicUIContext {
  const byCategory = MAGIC_UI_COMPONENTS.reduce((acc, comp) => {
    const list = acc[comp.category] || [];
    list.push(comp);
    acc[comp.category] = list;
    return acc;
  }, {} as Record<string, MagicComponentConfig[]>);

  return {
    availableComponents: MAGIC_UI_COMPONENTS,
    animationComponents: byCategory['animation'] || [],
    effectComponents: byCategory['effect'] || [],
    interactiveComponents: byCategory['interactive'] || [],
    layoutComponents: byCategory['layout'] || [],
  };
}

function buildMotionContext(): MotionContext {
  return {
    library: 'framer-motion',
    entranceAnimations: ['fade-in', 'fade-in-up', 'fade-in-down', 'slide-in-left', 'slide-in-right', 'scale-in'],
    continuousAnimations: ['float', 'pulse', 'bounce', 'spin', 'shimmer', 'glow'],
    interactionAnimations: ['hover-grow', 'hover-shrink', 'hover-glow', 'click-bounce'],
  };
}

function buildColorContext(ds: DesignSystem): ColorContext {
  const cssVariables: Record<string, string> = {};
  const hexValues: Record<string, string> = {};

  ds.colors.primary.forEach((c, i) => {
    cssVariables[`--color-primary-${i}`] = c.value;
    const varName = c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    cssVariables[`--color-${varName}`] = c.value;
    hexValues[c.name] = c.value;
  });

  ds.colors.accent.forEach((c, i) => {
    const varName = c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    cssVariables[`--color-accent-${varName}`] = c.value;
    hexValues[c.name] = c.value;
  });

  ds.colors.neutral.forEach((c, i) => {
    const varName = c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    cssVariables[`--color-neutral-${varName}`] = c.value;
    hexValues[c.name] = c.value;
  });

  return {
    cssVariables,
    hexValues,
    primary: ds.colors.primary.map(c => ({ name: c.name, value: c.value })),
    accent: ds.colors.accent.map(c => ({ name: c.name, value: c.value })),
    neutral: ds.colors.neutral.map(c => ({ name: c.name, value: c.value })),
  };
}

function buildTypographyContext(ds: DesignSystem): TypographyContext {
  const fontFamilies = [...new Set(ds.typography.map(t => t.font))];
  
  const hierarchy = ds.typography.map(t => ({
    role: t.role,
    font: t.font,
    size: t.size,
    weight: t.weight,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
  }));

  return { fontFamilies, hierarchy };
}

function buildComponentContext(ds: DesignSystem): ComponentContext {
  const context: ComponentContext = {};

  for (const comp of ds.components) {
    const type = comp.type.toLowerCase();
    if (type.includes('button')) {
      context.button = comp.properties;
    } else if (type.includes('card')) {
      context.card = comp.properties;
    } else if (type.includes('input') || type.includes('form')) {
      context.input = comp.properties;
    } else if (type.includes('nav') || type.includes('navigation')) {
      context.navigation = comp.properties;
    }
    context[type] = comp.properties;
  }

  return context;
}

function buildSpacingContext(ds: DesignSystem): SpacingContext {
  return {
    scale: ds.layout.spacing,
    base: ds.layout.spacing[2] || 8,
    unit: 'px',
  };
}

function buildShadowContext(ds: DesignSystem): ShadowContext {
  const technique: 'shadow-as-border' | 'traditional' = 
    Object.values(ds.shadows).some(v => v.includes('0px 0px 0px 1px'))
      ? 'shadow-as-border'
      : 'traditional';

  return {
    levels: ds.shadows,
    technique,
  };
}

function buildLayoutContext(ds: DesignSystem): LayoutContext {
  return {
    maxWidth: ds.layout.maxWidth,
    grid: ds.layout.grid,
    borderRadius: ds.layout.borderRadius,
  };
}

function buildResponsiveContext(ds: DesignSystem): ResponsiveContext {
  return {
    breakpoints: ds.responsive.breakpoints.map(bp => ({
      name: bp.name,
      width: bp.width,
      description: bp.changes,
    })),
  };
}

export function designContextToSystemPrompt(context: DesignContext): string {
  const lines: string[] = [];

  lines.push('## Design System Context\n');

  lines.push('### CSS Variables');
  lines.push('```css');
  lines.push(':root {');
  for (const [key, value] of Object.entries(context.colors.cssVariables)) {
    lines.push(`  ${key}: ${value};`);
  }
  lines.push('}');
  lines.push('```\n');

  lines.push('### Color Values');
  for (const color of context.colors.primary.slice(0, 3)) {
    lines.push(`- ${color.name}: ${color.value}`);
  }
  lines.push('');

  lines.push('### Typography');
  for (const t of context.typography.hierarchy.slice(0, 6)) {
    lines.push(`- ${t.role}: ${t.font} ${t.size} weight=${t.weight} tracking=${t.letterSpacing}`);
  }
  lines.push('');

  lines.push('### Shadows');
  for (const [name, value] of Object.entries(context.shadows.levels)) {
    lines.push(`- ${name}: ${value}`);
  }
  lines.push('');

  lines.push('### Spacing');
  lines.push(`Base: ${context.spacing.base}px`);
  lines.push(`Scale: ${context.spacing.scale.join(', ')}px\n`);

  lines.push('### Layout');
  lines.push(`Max width: ${context.layout.maxWidth}`);
  lines.push(`Grid: ${context.layout.grid}\n`);

  return lines.join('\n');
}

export function designContextToJson(context: DesignContext): string {
  return JSON.stringify(context, null, 2);
}

export function extractColorPalette(context: ColorContext): Record<string, string> {
  return { ...context.cssVariables };
}

export function extractTypographyRules(context: TypographyContext): TypographyContext['hierarchy'] {
  return context.hierarchy;
}

export function extractShadowSystem(context: ShadowContext): Record<string, string> {
  return context.levels;
}
