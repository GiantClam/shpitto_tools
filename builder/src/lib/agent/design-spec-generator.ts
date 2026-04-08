import { promises as fs } from 'fs';
import path from 'path';
import { DesignSystem } from './design-md-parser';
import { ConfirmationItem, DesignSelection } from './design-system-selector';

export interface ProjectDesignSpec {
  version: string;
  sourceDesignSystems: string[];
  appliedDesignSystem: DesignSystem;
  customOverrides: Record<string, string>;
  generatedAt: string;
  confirmedItems: string[];
}

export function generateProjectDesignSpec(
  selection: DesignSelection,
  confirmations: ConfirmationItem[]
): ProjectDesignSpec {
  const appliedDesign = applyConfirmations(selection.primary, confirmations);
  
  return {
    version: '1.0',
    sourceDesignSystems: [selection.primary.name],
    appliedDesignSystem: appliedDesign,
    customOverrides: extractOverrides(confirmations),
    generatedAt: new Date().toISOString(),
    confirmedItems: confirmations.map(c => c.id),
  };
}

function applyConfirmations(
  design: DesignSystem,
  confirmations: ConfirmationItem[]
): DesignSystem {
  const result: DesignSystem = {
    ...design,
    colors: { ...design.colors },
    layout: { ...design.layout },
  };

  for (const conf of confirmations) {
    if (conf.appliedValue && conf.appliedValue !== conf.current) {
      switch (conf.category) {
        case 'color':
          applyColorOverride(result, conf);
          break;
        case 'typography':
          applyTypographyOverride(result, conf);
          break;
        case 'shadow':
          applyShadowOverride(result, conf);
          break;
        case 'layout':
          applyLayoutOverride(result, conf);
          break;
      }
    }
  }

  return result;
}

function applyColorOverride(design: DesignSystem, conf: ConfirmationItem): void {
  if (conf.id === 'primary-color' && design.colors.primary.length > 0) {
    design.colors.primary[0].value = conf.appliedValue || conf.current;
  } else if (conf.id === 'accent-color' && design.colors.accent.length > 0) {
    design.colors.accent[0].value = conf.appliedValue || conf.current;
  }
}

function applyTypographyOverride(design: DesignSystem, conf: ConfirmationItem): void {
  const match = conf.appliedValue?.match(/^(.+?)\s+([\d]+(?:px|rem|em))(?:.*?weight\s+(\d+))?/);
  if (match) {
    const [, font, size, weight] = match;
    const typo = design.typography.find(t => t.role.toLowerCase().includes(conf.id.includes('heading') ? 'heading' : 'body'));
    if (typo) {
      if (font) typo.font = font;
      if (size) typo.size = size;
      if (weight) typo.weight = parseInt(weight);
    }
  }
}

function applyShadowOverride(design: DesignSystem, conf: ConfirmationItem): void {
  if (conf.appliedValue && Object.keys(design.shadows).length > 0) {
    const shadowKeys = Object.keys(design.shadows);
    const originalKey = shadowKeys[0];
    design.shadows[originalKey] = conf.appliedValue;
  }
}

function applyLayoutOverride(design: DesignSystem, conf: ConfirmationItem): void {
  if (conf.id === 'spacing-base') {
    const baseMatch = conf.appliedValue?.match(/(\d+)/);
    if (baseMatch) {
      const base = parseInt(baseMatch[1]);
      design.layout.spacing = [1, 2, base, base * 2, base * 4, base * 8];
    }
  }
}

function extractOverrides(confirmations: ConfirmationItem[]): Record<string, string> {
  const overrides: Record<string, string> = {};
  
  for (const conf of confirmations) {
    if (conf.appliedValue && conf.appliedValue !== conf.current) {
      overrides[conf.id] = conf.appliedValue;
    }
  }
  
  return overrides;
}

export function designSystemToMarkdown(spec: ProjectDesignSpec): string {
  const ds = spec.appliedDesignSystem;
  
  let md = `# Project Design Specification\n\n`;
  md += `> Generated from ${spec.sourceDesignSystems.join(', ')} at ${spec.generatedAt}\n\n`;
  
  md += `## 1. Visual Theme & Atmosphere\n\n${ds.visualTheme}\n\n`;
  
  md += `## 2. Color Palette & Roles\n\n`;
  md += `### Primary Colors\n`;
  for (const color of ds.colors.primary) {
    md += `- **${color.name}** (\`${color.value}\`): ${color.description || ''}\n`;
  }
  md += `\n### Accent Colors\n`;
  for (const color of ds.colors.accent) {
    md += `- **${color.name}** (\`${color.value}\`): ${color.description || ''}\n`;
  }
  md += `\n### Neutral Colors\n`;
  for (const color of ds.colors.neutral) {
    md += `- **${color.name}** (\`${color.value}\`): ${color.description || ''}\n`;
  }
  md += `\n### Semantic Colors\n`;
  for (const color of ds.colors.semantic) {
    md += `- **${color.name}** (\`${color.value}\`): ${color.description || ''}\n`;
  }
  md += `\n`;
  
  md += `## 3. Typography Rules\n\n`;
  md += `### Font Family\n`;
  const primaryFont = ds.typography[0]?.font || 'System';
  const monoFont = ds.typography.find(t => t.role.toLowerCase().includes('mono'))?.font || 'Monospace';
  md += `- **Primary**: \`${primaryFont}\`\n`;
  md += `- **Monospace**: \`${monoFont}\`\n\n`;
  
  md += `### Hierarchy\n\n`;
  md += `| Role | Font | Size | Weight | Line Height | Letter Spacing |\n`;
  md += `|------|------|------|--------|-------------|----------------|\n`;
  for (const t of ds.typography.slice(0, 10)) {
    md += `| ${t.role} | ${t.font} | ${t.size} | ${t.weight} | ${t.lineHeight} | ${t.letterSpacing} |\n`;
  }
  md += `\n`;
  
  md += `## 4. Component Stylings\n\n`;
  for (const comp of ds.components.slice(0, 5)) {
    md += `### ${comp.type}\n`;
    for (const [key, value] of Object.entries(comp.properties)) {
      md += `- **${key}**: \`${value}\`\n`;
    }
    md += `\n`;
  }
  
  md += `## 5. Layout Principles\n\n`;
  md += `### Spacing System\n`;
  md += `Base unit: ${ds.layout.spacing[2] || 8}px\n`;
  md += `Scale: ${ds.layout.spacing.join(', ')}px\n\n`;
  
  md += `### Border Radius\n`;
  for (const [name, value] of Object.entries(ds.layout.borderRadius)) {
    md += `- ${name}: ${value}\n`;
  }
  md += `\n`;
  
  md += `## 6. Shadows & Depth\n\n`;
  for (const [name, value] of Object.entries(ds.shadows)) {
    md += `- **${name}**: \`${value}\`\n`;
  }
  md += `\n`;
  
  md += `## 7. Responsive Behavior\n\n`;
  md += `| Breakpoint | Width | Key Changes |\n`;
  md += `|------------|-------|-------------|\n`;
  for (const bp of ds.responsive.breakpoints.slice(0, 5)) {
    md += `| ${bp.name} | ${bp.width} | ${bp.changes} |\n`;
  }
  md += `\n`;
  
  md += `## 8. Do's and Don'ts\n\n`;
  md += `### Do\n`;
  for (const d of ds.dosAndDonts.dos.slice(0, 5)) {
    md += `- ${d}\n`;
  }
  md += `\n### Don't\n`;
  for (const d of ds.dosAndDonts.donts.slice(0, 5)) {
    md += `- ${d}\n`;
  }
  md += `\n`;
  
  return md;
}

export async function saveProjectDesignSpec(
  spec: ProjectDesignSpec,
  outputPath: string
): Promise<void> {
  const markdown = designSystemToMarkdown(spec);
  await fs.writeFile(outputPath, markdown, 'utf-8');
}

export async function loadProjectDesignSpec(
  specPath: string
): Promise<ProjectDesignSpec | null> {
  try {
    const content = await fs.readFile(specPath, 'utf-8');
    return parseProjectDesignSpec(content);
  } catch {
    return null;
  }
}

function parseProjectDesignSpec(content: string): ProjectDesignSpec | null {
  try {
    const headerMatch = content.match(/Generated from (.+) at (.+)/);
    const sourceMatch = headerMatch?.[1]?.split(', ') || [];
    const generatedAt = headerMatch?.[2] || new Date().toISOString();
    
    return {
      version: '1.0',
      sourceDesignSystems: sourceMatch,
      appliedDesignSystem: {
        name: sourceMatch[0] || 'unknown',
        visualTheme: '',
        colors: { primary: [], accent: [], neutral: [], semantic: [], shadows: [] },
        typography: [],
        components: [],
        layout: { spacing: [1, 2, 4, 8, 16], grid: '12-col', maxWidth: '1200px', borderRadius: {} },
        shadows: {},
        responsive: { breakpoints: [], strategy: '' },
        dosAndDonts: { dos: [], donts: [] },
        agentPrompts: [],
        raw: content,
      },
      customOverrides: {},
      generatedAt,
      confirmedItems: [],
    };
  } catch {
    return null;
  }
}
