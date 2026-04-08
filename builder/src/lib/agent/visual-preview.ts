import { promises as fs } from 'fs';
import path from 'path';
import { ComponentCode } from './design-executor';
import { ProjectDesignSpec } from './design-spec-generator';
import { DesignContext } from './design-context-loader';

export interface PreviewResult {
  pageName: string;
  screenshotPath?: string;
  htmlPath?: string;
  issues: string[];
}

export interface HtmlPreviewOptions {
  includeReact?: boolean;
  includeTailwind?: boolean;
  width?: number;
  height?: number;
}

export async function generatePreview(
  pageName: string,
  components: ComponentCode[],
  designSpec: ProjectDesignSpec,
  context: DesignContext,
  options: HtmlPreviewOptions = {}
): Promise<PreviewResult> {
  const issues: string[] = [];
  
  const tempDir = path.join(process.cwd(), 'temp', 'previews');
  await fs.mkdir(tempDir, { recursive: true });
  
  const htmlPath = path.join(tempDir, `${pageName}-preview.html`);
  const html = buildPreviewHtml(pageName, components, designSpec, context, options);
  
  try {
    await fs.writeFile(htmlPath, html, 'utf-8');
  } catch (error) {
    issues.push(`Failed to write HTML: ${String(error)}`);
  }

  return {
    pageName,
    htmlPath,
    issues,
  };
}

function buildPreviewHtml(
  pageName: string,
  components: ComponentCode[],
  designSpec: ProjectDesignSpec,
  context: DesignContext,
  options: HtmlPreviewOptions
): string {
  const ds = designSpec.appliedDesignSystem;
  const cssVars = buildCssVariables(context);
  const tailwindConfig = buildTailwindConfig(context);
  const componentCode = components.map(c => c.code).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageName} Preview - ${ds.name}</title>
  ${options.includeTailwind !== false ? `
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: ${tailwindConfig}
      }
    }
  </script>
  ` : ''}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { 
      margin: 0; 
      font-family: ${context.typography.fontFamilies[0] || 'Inter, sans-serif'};
      background: #fff;
    }
    ${cssVars}
  </style>
</head>
<body>
  <div id="root">
    ${components.map(c => `<div class="section" data-name="${c.name}">${c.code}</div>`).join('\n')}
  </div>
  ${options.includeReact !== false ? `
  <script src="https://unpkg.com/react@18/umd-react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd-react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel" data-type="module">
    ${componentCode}
  </script>
  ` : ''}
</body>
</html>`;
}

function buildCssVariables(context: DesignContext): string {
  const vars: string[] = [];
  
  vars.push(':root {');
  for (const [key, value] of Object.entries(context.colors.cssVariables)) {
    vars.push(`  ${key}: ${value};`);
  }
  vars.push('}');
  
  return vars.join('\n');
}

function buildTailwindConfig(context: DesignContext): string {
  const colors: Record<string, string> = {};
  
  context.colors.primary.forEach((c, i) => {
    colors[`primary-${i}`] = c.value;
  });
  
  context.colors.accent.forEach((c, i) => {
    colors[`accent-${i}`] = c.value;
  });
  
  context.colors.neutral.forEach((c, i) => {
    colors[`neutral-${i}`] = c.value;
  });

  return JSON.stringify({
    colors,
    fontFamily: {
      sans: context.typography.fontFamilies,
    },
    extend: {
      spacing: {
        base: `${context.spacing.base}px`,
      },
      boxShadow: context.shadows.levels,
      borderRadius: context.layout.borderRadius,
      maxWidth: {
        site: context.layout.maxWidth,
      },
    },
  }, null, 2);
}

export async function captureScreenshot(
  htmlPath: string,
  outputPath: string,
  viewport?: { width: number; height: number }
): Promise<void> {
  const { chromium } = await import('playwright');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  if (viewport) {
    await page.setViewportSize(viewport);
  }
  
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: outputPath, fullPage: true });
  
  await browser.close();
}

export async function generatePreviewWithScreenshots(
  pageName: string,
  components: ComponentCode[],
  designSpec: ProjectDesignSpec,
  context: DesignContext
): Promise<PreviewResult> {
  const previewResult = await generatePreview(pageName, components, designSpec, context);
  
  if (previewResult.htmlPath) {
    const screenshotDir = path.dirname(previewResult.htmlPath);
    const screenshotPath = path.join(screenshotDir, `${pageName}-screenshot.png`);
    
    try {
      await captureScreenshot(previewResult.htmlPath, screenshotPath, { width: 1280, height: 800 });
      previewResult.screenshotPath = screenshotPath;
    } catch (error) {
      previewResult.issues.push(`Screenshot capture failed: ${String(error)}`);
    }
  }
  
  return previewResult;
}

export async function cleanupPreviews(tempDir?: string): Promise<void> {
  const dir = tempDir || path.join(process.cwd(), 'temp', 'previews');
  
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}
