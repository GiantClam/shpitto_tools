import { ProjectDesignSpec } from './design-spec-generator';
import { PageGenerationResult, ComponentCode } from './design-executor';
import { DesignContext } from './design-context-loader';

export interface QAReport {
  passed: boolean;
  score: number;
  checks: QACheck[];
  recommendations: string[];
  summary: string;
}

export interface QACheck {
  id: string;
  category: 'color' | 'typography' | 'shadow' | 'spacing' | 'component' | 'accessibility';
  passed: boolean;
  message: string;
  severity: 'critical' | 'major' | 'minor';
  element?: string;
}

export async function runDesignQA(
  result: PageGenerationResult,
  designSpec: ProjectDesignSpec,
  context: DesignContext
): Promise<QAReport> {
  const checks: QACheck[] = [];
  
  checks.push(...checkColors(result.components, context));
  checks.push(...checkTypography(result.components, context));
  checks.push(...checkShadows(result.components, context));
  checks.push(...checkSpacing(result.components, context));
  checks.push(...checkAccessibility(result.components));

  const passedChecks = checks.filter(c => c.passed).length;
  const totalChecks = checks.length;
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  
  const criticalFailed = checks.filter(c => !c.passed && c.severity === 'critical').length;
  const majorFailed = checks.filter(c => !c.passed && c.severity === 'major').length;
  
  const recommendations = checks
    .filter(c => !c.passed && (c.severity === 'critical' || c.severity === 'major'))
    .map(c => c.message);

  const summary = generateSummary(score, criticalFailed, majorFailed, checks.length);

  return {
    passed: score >= 80 && criticalFailed === 0,
    score,
    checks,
    recommendations,
    summary,
  };
}

function checkColors(components: ComponentCode[], context: DesignContext): QACheck[] {
  const checks: QACheck[] = [];
  const validColors = new Set(Object.values(context.colors.hexValues));
  const cssColorVars = new Set(Object.keys(context.colors.cssVariables).map(k => `var(--${k})`));
  
  for (const comp of components) {
    const usedColors = extractColorValues(comp.code);
    
    for (const color of usedColors) {
      const isValidColor = validColors.has(color) || cssColorVars.has(color);
      const isStandardColor = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color);
      
      if (!isValidColor && !isStandardColor) {
        checks.push({
          id: `color-${comp.name}-${color}`,
          category: 'color',
          passed: false,
          message: `Component ${comp.name} uses non-design-system color: ${color}`,
          severity: 'minor',
          element: comp.name,
        });
      }
    }
  }
  
  if (checks.length === 0 && components.length > 0) {
    checks.push({
      id: 'color-valid',
      category: 'color',
      passed: true,
      message: 'All components use design system colors',
      severity: 'minor',
    });
  }
  
  return checks;
}

function checkTypography(components: ComponentCode[], context: DesignContext): QACheck[] {
  const checks: QACheck[] = [];
  const validFontFamilies = new Set(context.typography.fontFamilies);
  
  for (const comp of components) {
    const code = comp.code;
    
    const fontFamilyMatches = code.match(/font-family:\s*[^;]+/gi) || [];
    for (const match of fontFamilyMatches) {
      const fontName = match.replace(/font-family:\s*/i, '').replace(/['"]/g, '').trim();
      if (fontName !== 'inherit' && !validFontFamilies.has(fontName)) {
        checks.push({
          id: `typo-${comp.name}-${fontName}`,
          category: 'typography',
          passed: false,
          message: `Component ${comp.name} uses non-design-system font: ${fontName}`,
          severity: 'minor',
          element: comp.name,
        });
      }
    }
    
    const sizeMatches = code.match(/text-(\d+)|font-size:\s*(\d+)(?:px|rem|em)/gi) || [];
    const validSizes = new Set(context.typography.hierarchy.map(t => t.size));
    for (const match of sizeMatches) {
      const sizeMatch = match.match(/(\d+)(?:px|rem|em)/);
      if (sizeMatch) {
        const size = `${sizeMatch[1]}px`;
        if (!validSizes.has(size) && !['inherit', 'initial'].includes(size)) {
          checks.push({
            id: `typo-size-${comp.name}`,
            category: 'typography',
            passed: false,
            message: `Component ${comp.name} uses size not in design system: ${size}`,
            severity: 'minor',
            element: comp.name,
          });
        }
      }
    }
  }
  
  if (checks.length === 0 && components.length > 0) {
    checks.push({
      id: 'typo-valid',
      category: 'typography',
      passed: true,
      message: 'Typography follows design system',
      severity: 'minor',
    });
  }
  
  return checks;
}

function checkShadows(components: ComponentCode[], context: DesignContext): QACheck[] {
  const checks: QACheck[] = [];
  
  if (context.shadows.technique === 'shadow-as-border') {
    for (const comp of components) {
      const code = comp.code;
      
      if (code.includes('box-shadow') || code.includes('shadow-')) {
        const usesCorrectTechnique = code.includes('0px 0px 0px 1px') || code.includes('shadow-');
        if (!usesCorrectTechnique && code.includes('box-shadow')) {
          checks.push({
            id: `shadow-${comp.name}`,
            category: 'shadow',
            passed: false,
            message: `Component ${comp.name} should use shadow-as-border technique`,
            severity: 'major',
            element: comp.name,
          });
        }
      }
    }
  }
  
  if (checks.length === 0 && components.length > 0) {
    checks.push({
      id: 'shadow-valid',
      category: 'shadow',
      passed: true,
      message: 'Shadow technique follows design system',
      severity: 'minor',
    });
  }
  
  return checks;
}

function checkSpacing(components: ComponentCode[], context: DesignContext): QACheck[] {
  const checks: QACheck[] = [];
  const validSpacings = new Set(context.spacing.scale.map(s => `${s}px`));
  
  for (const comp of components) {
    const code = comp.code;
    
    const spacingMatches = code.match(/(?:margin|padding|gap|space-x|space-y):\s*[^;]+/gi) || [];
    for (const match of spacingMatches) {
      const spacingValue = match.match(/(\d+)(?:px|rem)/);
      if (spacingValue) {
        const size = `${spacingValue[1]}px`;
        if (!validSpacings.has(size) && !['auto', '0', '0px'].includes(size)) {
          checks.push({
            id: `spacing-${comp.name}`,
            category: 'spacing',
            passed: false,
            message: `Component ${comp.name} uses non-standard spacing: ${size}`,
            severity: 'minor',
            element: comp.name,
          });
        }
      }
    }
  }
  
  if (checks.length === 0 && components.length > 0) {
    checks.push({
      id: 'spacing-valid',
      category: 'spacing',
      passed: true,
      message: 'Spacing follows design system',
      severity: 'minor',
    });
  }
  
  return checks;
}

function checkAccessibility(components: ComponentCode[]): QACheck[] {
  const checks: QACheck[] = [];
  
  for (const comp of components) {
    const code = comp.code;
    
    if (code.includes('<button') || code.includes('onClick')) {
      const hasAriaLabel = code.includes('aria-label') || code.includes('aria-labelledby');
      const hasTextContent = code.includes('>Button<') || code.includes('>Submit<') || code.includes('children');
      
      if (!hasAriaLabel && !hasTextContent) {
        checks.push({
          id: `a11y-button-${comp.name}`,
          category: 'accessibility',
          passed: false,
          message: `Component ${comp.name} button may lack accessibility label`,
          severity: 'major',
          element: comp.name,
        });
      }
    }
    
    if (code.includes('<img') || code.includes('Image')) {
      const hasAlt = code.includes('alt=');
      if (!hasAlt) {
        checks.push({
          id: `a11y-img-${comp.name}`,
          category: 'accessibility',
          passed: false,
          message: `Component ${comp.name} image may lack alt text`,
          severity: 'major',
          element: comp.name,
        });
      }
    }
  }
  
  if (checks.length === 0 && components.length > 0) {
    checks.push({
      id: 'a11y-valid',
      category: 'accessibility',
      passed: true,
      message: 'Basic accessibility checks passed',
      severity: 'minor',
    });
  }
  
  return checks;
}

function extractColorValues(code: string): string[] {
  const values: string[] = [];
  
  const hexMatches = code.match(/#[0-9a-fA-F]{3,8}/g) || [];
  values.push(...hexMatches);
  
  const rgbaMatches = code.match(/rgba?\([^)]+\)/g) || [];
  values.push(...rgbaMatches);
  
  const varMatches = code.match(/var\(--[^)]+\)/g) || [];
  values.push(...varMatches);
  
  return values;
}

function generateSummary(score: number, critical: number, major: number, total: number): string {
  if (score >= 90 && critical === 0) {
    return `Excellent! ${total} checks passed with score ${score}%.`;
  } else if (score >= 80 && critical === 0) {
    return `Good quality with score ${score}%. Minor improvements possible.`;
  } else if (critical > 0) {
    return `Needs improvement. ${critical} critical and ${major} major issues found.`;
  } else {
    return `Score ${score}%. ${major} major issues need attention.`;
  }
}

export function qaCheckToHtml(check: QACheck): string {
  const icon = check.passed ? '✅' : '❌';
  const severityBadge = check.severity === 'critical' ? '🔴' : 
                        check.severity === 'major' ? '🟡' : '⚪';
  return `${icon} ${severityBadge} [${check.category}] ${check.message}`;
}

export function qaReportToMarkdown(report: QAReport): string {
  const lines: string[] = [];
  
  lines.push(`# QA Report`);
  lines.push('');
  lines.push(`**Score:** ${report.score}%`);
  lines.push(`**Status:** ${report.passed ? '✅ Passed' : '❌ Failed'}`);
  lines.push('');
  lines.push(`## Summary`);
  lines.push(report.summary);
  lines.push('');
  lines.push(`## Checks`);
  lines.push('');
  
  const byCategory = new Map<string, QACheck[]>();
  for (const check of report.checks) {
    const list = byCategory.get(check.category) || [];
    list.push(check);
    byCategory.set(check.category, list);
  }
  
  for (const [category, checks] of byCategory) {
    lines.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`);
    for (const check of checks) {
      lines.push(qaCheckToHtml(check));
    }
    lines.push('');
  }
  
  if (report.recommendations.length > 0) {
    lines.push(`## Recommendations`);
    for (const rec of report.recommendations) {
      lines.push(`- ${rec}`);
    }
  }
  
  return lines.join('\n');
}
