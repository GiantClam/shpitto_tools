import { DesignWorkflow } from '../lib/agent/design-workflow';
import { selectDesignSystem } from '../lib/agent/design-system-selector';
import { listAvailableBrands } from '../lib/agent/design-md-parser';

interface CliOptions {
  prompt: string;
  brand?: string;
  output?: string;
  skipPreview?: boolean;
  skipQA?: boolean;
}

export async function runDesignGenerate(options: CliOptions): Promise<void> {
  const { prompt, brand, output = 'output', skipPreview, skipQA } = options;

  console.log('🎨 Design System Website Generator');
  console.log('================================\n');

  let selectedBrand = brand;

  if (!selectedBrand) {
    console.log('📋 Step 1: Recommending design systems...\n');
    const { brands } = await selectDesignSystem(prompt);
    
    if (brands.length === 0) {
      console.log('❌ No suitable design systems found');
      return;
    }

    console.log('Recommended design systems:\n');
    brands.slice(0, 5).forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.name}`);
      console.log(`     ${b.description}`);
      console.log(`     Best for: ${b.suitableFor}\n`);
    });

    const allBrands = await listAvailableBrands();
    console.log(`\nTotal ${allBrands.length} design systems available.`);
    console.log('Use --brand <name> to specify a brand.\n');

    if (brands.length > 0) {
      selectedBrand = brands[0].name;
      console.log(`Using recommended brand: ${selectedBrand}\n`);
    } else {
      return;
    }
  }

  console.log('🚀 Step 2: Running design workflow...\n');

  const workflow = new DesignWorkflow();

  try {
    const result = await workflow.runFullWorkflow(
      prompt,
      selectedBrand,
      prompt,
      { skipPreview, skipQA }
    );

    console.log('✅ Generation complete!\n');

    console.log(`Design System: ${result.spec.sourceDesignSystems.join(', ')}`);
    console.log(`Pages Generated: ${result.generationResults.length}`);
    console.log(`Total Components: ${result.generationResults.reduce((sum, r) => sum + r.components.length, 0)}`);

    if (result.previewResults && result.previewResults.length > 0) {
      console.log(`Previews Generated: ${result.previewResults.length}`);
    }

    if (result.qaReports && result.qaReports.length > 0) {
      const avgScore = result.qaReports.reduce((sum, r) => sum + r.score, 0) / result.qaReports.length;
      console.log(`Average QA Score: ${avgScore.toFixed(0)}%`);
    }

    if (result.errors.length > 0) {
      console.log('\n⚠️ Errors encountered:');
      result.errors.forEach(e => console.log(`  - ${e}`));
    }

    console.log(`\n📁 Output directory: ${output}`);
    console.log('\nDone!');

  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

const args = process.argv.slice(2);

function showHelp(): void {
  console.log(`
Design System Website Generator

Usage:
  node design-generate.js --prompt "Your website description"
  node design-generate.js --prompt "..." --brand vercel
  node design-generate.js --prompt "..." --skip-preview --skip-qa

Options:
  --prompt <text>     Website requirements description (required)
  --brand <name>      Specific design system brand to use
  --output <dir>      Output directory (default: output)
  --skip-preview      Skip preview generation
  --skip-qa          Skip QA checks
  --help             Show this help message
`);
}

async function main(): Promise<void> {
  const options: Partial<CliOptions> = {};
  const skipFlags: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--prompt' || arg === '-p') {
      options.prompt = args[++i];
    } else if (arg === '--brand' || arg === '-b') {
      options.brand = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--skip-preview') {
      options.skipPreview = true;
    } else if (arg === '--skip-qa') {
      options.skipQA = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      return;
    }
  }

  if (!options.prompt) {
    console.error('❌ Error: --prompt is required');
    console.log('\nUse --help for usage information.');
    process.exit(1);
  }

  await runDesignGenerate(options as CliOptions);
}

main().catch(console.error);
