import { llm, llmProviders } from './graph';
import { ProjectDesignSpec } from './design-spec-generator';
import { DesignSystem } from './design-md-parser';
import { MAGIC_UI_COMPONENTS, MAGIC_UI_BY_CATEGORY, ANIMATION_PATTERNS } from './magic-ui-registry';

export interface PageGenerationRequest {
  pageName: string;
  pagePath: string;
  sections: string[];
  designSpec: ProjectDesignSpec;
  content?: Record<string, unknown>;
}

export interface ComponentCode {
  name: string;
  filePath: string;
  code: string;
  styles?: string;
}

export interface PageGenerationResult {
  pageName: string;
  components: ComponentCode[];
  errors: string[];
  warnings: string[];
}

export interface GenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function generatePage(
  request: PageGenerationRequest,
  options: GenerationOptions = {}
): Promise<PageGenerationResult> {
  const { designSpec, pageName, sections, content } = request;
  const ds = designSpec.appliedDesignSystem;
  
  if (!llm) {
    return {
      pageName,
      components: [],
      errors: ['LLM client not initialized'],
      warnings: [],
    };
  }

  const prompt = buildGenerationPrompt(ds, pageName, sections, content);
  
  const model = options.model || 'claude-sonnet-4-20250514';
  
  try {
    const response = await llm.messages.create({
      model,
      max_tokens: options.maxTokens || 8192,
      temperature: options.temperature || 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return {
        pageName,
        components: [],
        errors: ['No text content in response'],
        warnings: [],
      };
    }

    return parseGenerationResponse(textContent.text, pageName, request.pagePath);
  } catch (error) {
    return {
      pageName,
      components: [],
      errors: [String(error)],
      warnings: [],
    };
  }
}

function buildGenerationPrompt(
  ds: DesignSystem,
  pageName: string,
  sections: string[],
  content?: Record<string, unknown>
): string {
  const colorContext = buildColorContext(ds);
  const typographyContext = buildTypographyContext(ds);
  const shadowContext = buildShadowContext(ds);
  const componentContext = buildComponentContext(ds);
  const magicUiContext = buildMagicUiContext();

  return `You are a React UI component generator following a design system with Magic UI animations.

Generate React + Tailwind CSS components for: ${pageName}

## Design System: ${ds.name}

### Colors (use exact values)
${colorContext}

### Typography
${typographyContext}

### Shadows (use shadow-as-border technique)
${shadowContext}

### Component Patterns
${componentContext}

## Magic UI Components (for animations)
${magicUiContext}

## Animation Patterns
- Entrance: fade-in, fade-in-up, slide-in-left, scale-in
- Continuous: float, pulse, shimmer, glow
- Interaction: hover-grow, hover-glow, click-bounce

## Required Sections
${sections.map(s => `- ${s}`).join('\n')}

## Content
${JSON.stringify(content || {}, null, 2)}

## Requirements
1. Use React 18+ with TypeScript
2. Use Tailwind CSS for styling
3. Follow the design system exactly - use the specified colors, fonts, and shadows
4. Use CSS variables for colors where possible
5. Each section should be a separate component
6. Export components as named exports
7. Components should be self-contained with proper props interfaces
8. Use "use client" directive for Next.js App Router compatibility
9. Use Magic UI components for animations when appropriate (TextReveal, NumberTicker, GradientText, etc.)
10. Add motion effects using Framer Motion for entrance animations (fade-in-up on scroll)

## Output Format
Return a JSON object with a "components" array:
{
  "components": [
    {
      "name": "HeroSection",
      "filePath": "components/HeroSection.tsx",
      "code": "// full component code here"
    }
  ]
}

Generate now:`;
}

function buildColorContext(ds: DesignSystem): string {
  const lines: string[] = [];
  
  lines.push('Primary Colors:');
  for (const color of ds.colors.primary.slice(0, 5)) {
    lines.push(`  - ${color.name}: ${color.value}`);
  }
  
  lines.push('\nAccent Colors:');
  for (const color of ds.colors.accent.slice(0, 5)) {
    lines.push(`  - ${color.name}: ${color.value}`);
  }
  
  lines.push('\nNeutral Colors:');
  for (const color of ds.colors.neutral.slice(0, 5)) {
    lines.push(`  - ${color.name}: ${color.value}`);
  }
  
  return lines.join('\n');
}

function buildTypographyContext(ds: DesignSystem): string {
  const lines: string[] = [];
  
  for (const t of ds.typography.slice(0, 8)) {
    lines.push(`- ${t.role}: ${t.font} ${t.size} weight=${t.weight} tracking=${t.letterSpacing} line-height=${t.lineHeight}`);
  }
  
  return lines.join('\n');
}

function buildShadowContext(ds: DesignSystem): string {
  const lines: string[] = [];
  
  for (const [name, value] of Object.entries(ds.shadows)) {
    lines.push(`- ${name}: ${value}`);
  }
  
  return lines.join('\n');
}

function buildMagicUiContext(): string {
  const lines: string[] = [];

  lines.push('Animation Components:');
  for (const comp of MAGIC_UI_BY_CATEGORY['animation'] || []) {
    lines.push(`- ${comp.name}: ${comp.description}`);
    if (comp.animationFeatures) {
      lines.push(`  Features: ${comp.animationFeatures.join(', ')}`);
    }
  }

  lines.push('\nEffect Components:');
  for (const comp of MAGIC_UI_BY_CATEGORY['effect'] || []) {
    lines.push(`- ${comp.name}: ${comp.description}`);
  }

  lines.push('\nInteractive Components:');
  for (const comp of MAGIC_UI_BY_CATEGORY['interactive'] || []) {
    lines.push(`- ${comp.name}: ${comp.description}`);
  }

  lines.push('\nLayout Components:');
  for (const comp of MAGIC_UI_BY_CATEGORY['layout'] || []) {
    lines.push(`- ${comp.name}: ${comp.description}`);
  }

  lines.push('\nMotion Library: Framer Motion (import { motion } from "framer-motion")');
  lines.push('Animation Props: initial, animate, transition, variants');

  return lines.join('\n');
}

function buildComponentContext(ds: DesignSystem): string {
  const lines: string[] = [];
  
  for (const comp of ds.components.slice(0, 5)) {
    lines.push(`### ${comp.type}`);
    for (const [key, value] of Object.entries(comp.properties)) {
      lines.push(`  ${key}: ${value}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

function parseGenerationResponse(
  responseText: string,
  pageName: string,
  pagePath: string
): PageGenerationResult {
  const result: PageGenerationResult = {
    pageName,
    components: [],
    errors: [],
    warnings: [],
  };

  try {
    let jsonStr = responseText.trim();
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*"components"[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    if (parsed.components && Array.isArray(parsed.components)) {
      for (const comp of parsed.components) {
        result.components.push({
          name: comp.name || `Section${result.components.length + 1}`,
          filePath: comp.filePath || `components/${pagePath}/${comp.name || 'Section'}.tsx`,
          code: comp.code || '',
          styles: comp.styles,
        });
      }
    }
  } catch (error) {
    result.errors.push(`Failed to parse response: ${String(error)}`);
    
    const codeBlocks = responseText.match(/```(?:tsx|tsx|jsx|javascript)?\n?([\s\S]*?)```/g);
    if (codeBlocks) {
      for (let i = 0; i < codeBlocks.length; i++) {
        const code = codeBlocks[i].replace(/```(?:tsx|jsx|javascript)?\n?/, '').replace(/```$/, '').trim();
        if (code.length > 100) {
          result.components.push({
            name: `Section${i + 1}`,
            filePath: `components/${pagePath}/Section${i + 1}.tsx`,
            code,
          });
        }
      }
    }
    
    if (result.components.length === 0) {
      result.warnings.push('Could not parse component code from response');
    }
  }

  return result;
}

export async function generateSite(
  pages: PageGenerationRequest[],
  onProgress?: (page: string, status: 'pending' | 'generating' | 'done' | 'error') => void,
  options: GenerationOptions = {}
): Promise<PageGenerationResult[]> {
  const results: PageGenerationResult[] = [];

  for (const page of pages) {
    onProgress?.(page.pageName, 'generating');
    
    try {
      const result = await generatePage(page, options);
      results.push(result);
      onProgress?.(page.pageName, result.errors.length > 0 ? 'error' : 'done');
    } catch (error) {
      results.push({
        pageName: page.pageName,
        components: [],
        errors: [String(error)],
        warnings: [],
      });
      onProgress?.(page.pageName, 'error');
    }
  }

  return results;
}

export async function generateSingleSection(
  sectionName: string,
  designSpec: ProjectDesignSpec,
  context?: Record<string, unknown>
): Promise<ComponentCode> {
  const result = await generatePage({
    pageName: sectionName,
    pagePath: 'components',
    sections: [sectionName],
    designSpec,
    content: context,
  });

  if (result.components.length > 0) {
    return result.components[0];
  }

  return {
    name: sectionName,
    filePath: `components/${sectionName}.tsx`,
    code: `// Error: ${result.errors.join(', ')}`,
  };
}
