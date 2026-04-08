import { promises as fs } from 'fs';
import path from 'path';

export interface DesignToken {
  name: string;
  value: string;
  description?: string;
}

export interface ColorPalette {
  primary: DesignToken[];
  accent: DesignToken[];
  neutral: DesignToken[];
  semantic: DesignToken[];
  shadows: DesignToken[];
}

export interface TypographyRule {
  role: string;
  font: string;
  size: string;
  weight: number;
  lineHeight: string;
  letterSpacing: string;
  notes?: string;
}

export interface ComponentStyle {
  type: string;
  properties: Record<string, string>;
  states?: Record<string, Record<string, string>>;
}

export interface LayoutPrinciples {
  spacing: number[];
  grid: string;
  maxWidth: string;
  borderRadius: Record<string, string>;
}

export interface ResponsiveBreakpoint {
  name: string;
  width: string;
  changes: string;
}

export interface DesignSystem {
  name: string;
  visualTheme: string;
  colors: ColorPalette;
  typography: TypographyRule[];
  components: ComponentStyle[];
  layout: LayoutPrinciples;
  shadows: Record<string, string>;
  responsive: {
    breakpoints: ResponsiveBreakpoint[];
    strategy: string;
  };
  dosAndDonts: {
    dos: string[];
    donts: string[];
  };
  agentPrompts: string[];
  raw: string;
}

const DESIGN_SYSTEMS_PATH = 'builder/design-systems/design-md';

export async function listAvailableBrands(): Promise<string[]> {
  const dir = path.join(process.cwd(), DESIGN_SYSTEMS_PATH);
  const entries = await fs.readdir(dir);
  return entries.filter(e => !e.startsWith('.'));
}

export async function loadDesignSystem(brand: string): Promise<DesignSystem> {
  const filePath = path.join(process.cwd(), DESIGN_SYSTEMS_PATH, brand, 'DESIGN.md');
  const content = await fs.readFile(filePath, 'utf-8');
  return parseDesignMd(content, brand);
}

export async function designSystemExists(brand: string): Promise<boolean> {
  const filePath = path.join(process.cwd(), DESIGN_SYSTEMS_PATH, brand, 'DESIGN.md');
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseDesignMd(content: string, name: string): DesignSystem {
  const sections = content.split(/^## \d+\. /m).filter(Boolean);
  
  const visualTheme = extractSection(sections, 'Visual Theme');
  const colorSection = extractSection(sections, 'Color Palette');
  const typographySection = extractSection(sections, 'Typography Rules');
  const componentSection = extractSection(sections, 'Component Stylings');
  const layoutSection = extractSection(sections, 'Layout Principles');
  const depthSection = extractSection(sections, 'Depth');
  const dosDontsSection = extractSection(sections, "Do's and Don'ts");
  const responsiveSection = extractSection(sections, 'Responsive Behavior');
  const agentGuideSection = extractSection(sections, 'Agent Prompt Guide');

  return {
    name,
    visualTheme: parseVisualTheme(visualTheme),
    colors: parseColors(colorSection),
    typography: parseTypography(typographySection),
    components: parseComponents(componentSection),
    layout: parseLayout(layoutSection),
    shadows: parseShadows(depthSection),
    responsive: parseResponsive(responsiveSection),
    dosAndDonts: parseDosDonts(dosDontsSection),
    agentPrompts: parseAgentPrompts(agentGuideSection),
    raw: content,
  };
}

function extractSection(sections: string[], keyword: string): string {
  const idx = sections.findIndex(s => s.toLowerCase().startsWith(keyword.toLowerCase()));
  return idx >= 0 ? sections[idx] : '';
}

function parseVisualTheme(section: string): string {
  const lines = section.split('\n').filter(l => !l.startsWith('#') && !l.startsWith('**Key'));
  return lines.join(' ').trim();
}

function parseColors(section: string): ColorPalette {
  const colors: ColorPalette = {
    primary: [],
    accent: [],
    neutral: [],
    semantic: [],
    shadows: [],
  };

  const colorBlocks = section.split(/### /).filter(Boolean);
  
  for (const block of colorBlocks) {
    const lines = block.split('\n').filter(l => l.trim());
    if (!lines[0]) continue;
    
    const category = lines[0].toLowerCase();
    const isPrimary = category.includes('primary') || category.includes('black') || category.includes('white');
    const isAccent = category.includes('accent') || category.includes('workflow') || category.includes('interactive');
    const isNeutral = category.includes('neutral') || category.includes('gray');
    const isShadow = category.includes('shadow') || category.includes('depth');

    for (const line of lines.slice(1)) {
      const match = line.match(/\*\*([^*]+)\*\*\s*\((\#[^\)]+)\)(?::\s*(.+))?/);
      if (match) {
        const token: DesignToken = {
          name: match[1].trim(),
          value: match[2].trim(),
          description: match[3]?.trim(),
        };
        
        if (isShadow) {
          colors.shadows.push(token);
        } else if (isPrimary) {
          colors.primary.push(token);
        } else if (isAccent) {
          colors.accent.push(token);
        } else if (isNeutral) {
          colors.neutral.push(token);
        } else {
          colors.semantic.push(token);
        }
      }
    }
  }

  return colors;
}

function parseTypography(section: string): TypographyRule[] {
  const rules: TypographyRule[] = [];
  
  const tableMatch = section.match(/\| Role[\s\S]*?\|[\s\S]*?\|[\s\S]*?\|/);
  if (tableMatch) {
    const rows = tableMatch[0].split('\n').filter(r => r.includes('|') && !r.includes('---'));
    
    for (const row of rows.slice(1)) {
      const cells = row.split('|').filter(c => c.trim() && !c.includes('Role'));
      if (cells.length >= 7) {
        rules.push({
          role: cells[1].trim(),
          font: cells[2].trim(),
          size: cells[3].trim(),
          weight: parseInt(cells[4].trim()) || 400,
          lineHeight: cells[5].trim(),
          letterSpacing: cells[6].trim(),
          notes: cells[7]?.trim(),
        });
      }
    }
  }

  return rules;
}

function parseComponents(section: string): ComponentStyle[] {
  const components: ComponentStyle[] = [];
  
  const componentBlocks = section.split(/(?=\n### )/);
  
  for (const block of componentBlocks) {
    const titleMatch = block.match(/### (.+)/);
    if (titleMatch) {
      const type = titleMatch[1].toLowerCase();
      const properties: Record<string, string> = {};
      
      const propMatches = block.matchAll(/-\s*\*\*([^*]+)\*\*:\s*`([^`]+)`/g);
      for (const m of propMatches) {
        properties[m[1].trim()] = m[2].trim();
      }
      
      if (Object.keys(properties).length > 0) {
        components.push({ type, properties });
      }
    }
  }
  
  return components;
}

function parseLayout(section: string): LayoutPrinciples {
  const layout: LayoutPrinciples = {
    spacing: [1, 2, 4, 8, 16, 32, 64],
    grid: '12-column',
    maxWidth: '1200px',
    borderRadius: {},
  };

  const spacingMatch = section.match(/Base unit:\s*(\d+)px/i);
  if (spacingMatch) {
    const base = parseInt(spacingMatch[1]);
    layout.spacing = [1, 2, base, base * 2, base * 4, base * 8];
  }

  const maxWidthMatch = section.match(/Max content width:\s*[^0-9]*([0-9]+)px/i);
  if (maxWidthMatch) {
    layout.maxWidth = `${maxWidthMatch[1]}px`;
  }

  const radiusBlocks = section.match(/Radius Scale[\s\S]*?(?=###|$)/i);
  if (radiusBlocks) {
    const radiusMatches = radiusBlocks[0].matchAll(/-\s*(.+?):\s*(\d+)px/g);
    for (const m of radiusMatches) {
      layout.borderRadius[m[1].trim()] = `${m[2]}px`;
    }
  }

  return layout;
}

function parseShadows(section: string): Record<string, string> {
  const shadows: Record<string, string> = {};
  
  const shadowMatches = section.matchAll(/-\s*\*\*([^*]+)\*\*\s*\( ([^)]+) \):/g);
  for (const m of shadowMatches) {
    shadows[m[1].trim()] = m[2].trim();
  }

  return shadows;
}

function parseResponsive(section: string): { breakpoints: ResponsiveBreakpoint[]; strategy: string } {
  const breakpoints: ResponsiveBreakpoint[] = [];
  const strategy = '';

  const tableMatch = section.match(/\| Name[\s\S]*?\|[\s\S]*?\|[\s\S]*?\|/);
  if (tableMatch) {
    const rows = tableMatch[0].split('\n').filter(r => r.includes('|') && !r.includes('---'));
    
    for (const row of rows.slice(1)) {
      const cells = row.split('|').filter(c => c.trim() && !c.includes('Name'));
      if (cells.length >= 4) {
        breakpoints.push({
          name: cells[1].trim(),
          width: cells[2].trim(),
          changes: cells[3].trim(),
        });
      }
    }
  }

  return { breakpoints, strategy };
}

function parseDosDonts(section: string): { dos: string[]; donts: string[] } {
  const dos: string[] = [];
  const donts: string[] = [];
  
  const doMatches = section.matchAll(/^### Do\s*([\s\S]*?)(?=### Don't|$)/gi);
  for (const m of doMatches) {
    const items = m[1].matchAll(/-\s*(.+)/g);
    for (const item of items) {
      dos.push(item[1].trim());
    }
  }

  const dontMatches = section.matchAll(/^### Don't\s*([\s\S]*?)(?=### Do|$)/gi);
  for (const m of dontMatches) {
    const items = m[1].matchAll(/-\s*(.+)/g);
    for (const item of items) {
      donts.push(item[1].trim());
    }
  }

  return { dos, donts };
}

function parseAgentPrompts(section: string): string[] {
  if (!section) return [];
  
  const prompts: string[] = [];
  const exampleBlocks = section.match(/```[\s\S]*?```/g);
  if (exampleBlocks) {
    for (const block of exampleBlocks) {
      prompts.push(block.replace(/```\w*\n?/g, '').trim());
    }
  }
  
  return prompts;
}

export function getColorPaletteForCss(ds: DesignSystem): Record<string, string> {
  const vars: Record<string, string> = {};
  
  ds.colors.primary.forEach((c, i) => {
    vars[`--color-primary-${i}`] = c.value;
    const varName = c.name.toLowerCase().replace(/\s+/g, '-');
    vars[`--color-${varName}`] = c.value;
  });
  
  ds.colors.accent.forEach((c, i) => {
    const varName = c.name.toLowerCase().replace(/\s+/g, '-');
    vars[`--color-accent-${varName}`] = c.value;
  });
  
  ds.colors.neutral.forEach((c, i) => {
    const varName = c.name.toLowerCase().replace(/\s+/g, '-');
    vars[`--color-neutral-${varName}`] = c.value;
  });
  
  return vars;
}

export function getTypographyHierarchyForCss(ds: DesignSystem): Record<string, string> {
  const vars: Record<string, string> = {};
  
  ds.typography.forEach((t) => {
    const varName = t.role.toLowerCase().replace(/\s+/g, '-');
    vars[`--font-${varName}`] = `${t.font} ${t.size}/${t.lineHeight} weight=${t.weight} tracking=${t.letterSpacing}`;
  });
  
  return vars;
}
