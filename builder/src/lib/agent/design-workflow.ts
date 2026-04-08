import { Annotation } from '@langchain/langgraph';
import { selectDesignSystem, generateDesignConfirmation, BrandRecommendation } from './design-system-selector';
import { generateProjectDesignSpec, ProjectDesignSpec } from './design-spec-generator';
import { buildDesignContext, designContextToSystemPrompt, DesignContext } from './design-context-loader';
import { planPageStructure, PageStructure, validatePageStructure } from './page-structure-planner';
import { generatePage, generateSite, PageGenerationResult } from './design-executor';
import { generatePreviewWithScreenshots, PreviewResult } from './visual-preview';
import { runDesignQA, QAReport } from './design-qa-gate';
import { ConfirmationManager, DesignSelectionData, DesignConfirmationData, PageStructureData } from './confirmation-manager';

export interface DesignWorkflowState {
  prompt?: string;
  selectedBrands?: BrandRecommendation[];
  selectedBrand?: string;
  designConfirmation?: ReturnType<typeof generateDesignConfirmation> extends Promise<infer T> ? T : never;
  projectDesignSpec?: ProjectDesignSpec;
  designContext?: DesignContext;
  pageStructure?: PageStructure;
  pageGenerationResults?: PageGenerationResult[];
  previewResults?: PreviewResult[];
  qaReports?: QAReport[];
  errors?: string[];
}

export const DesignWorkflowStateAnnotation = Annotation.Root({
  prompt: Annotation<string>,
  selectedBrands: Annotation<BrandRecommendation[]>,
  selectedBrand: Annotation<string>,
  designConfirmation: Annotation<unknown>,
  projectDesignSpec: Annotation<ProjectDesignSpec>,
  designContext: Annotation<DesignContext>,
  pageStructure: Annotation<PageStructure>,
  pageGenerationResults: Annotation<PageGenerationResult[]>,
  previewResults: Annotation<PreviewResult[]>,
  qaReports: Annotation<QAReport[]>,
  errors: Annotation<string[]>,
});

export class DesignWorkflow {
  private confirmationManager: ConfirmationManager;

  constructor(confirmationManager?: ConfirmationManager) {
    this.confirmationManager = confirmationManager || new ConfirmationManager();
  }

  async step1_selectDesignSystem(
    userPrompt: string,
    brands?: BrandRecommendation[]
  ): Promise<{
    brands: BrandRecommendation[];
    allBrands: string[];
  }> {
    if (brands && brands.length > 0) {
      return { brands, allBrands: brands.map(b => b.name) };
    }
    
    return selectDesignSystem(userPrompt);
  }

  async step2_confirmDesignSystem(
    selectedBrand: string,
    userPrompt: string,
    overrides?: Record<string, string>
  ): Promise<{
    designSystem: ProjectDesignSpec;
    confirmationItems: ReturnType<typeof generateDesignConfirmation> extends Promise<infer R> ? R extends { confirmationItems: infer C } ? C : never : never;
  }> {
    const result = await generateDesignConfirmation(selectedBrand, userPrompt);
    
    const spec = generateProjectDesignSpec(
      { primary: result.designSystem },
      result.confirmationItems.map(item => ({
        ...item,
        appliedValue: overrides?.[item.id] || item.current,
      }))
    );

    return {
      designSystem: spec,
      confirmationItems: result.confirmationItems,
    };
  }

  async step3_buildDesignContext(spec: ProjectDesignSpec): Promise<DesignContext> {
    return buildDesignContext(spec);
  }

  async step4_planPageStructure(
    pageName: string,
    pagePath: string,
    spec: ProjectDesignSpec,
    requirements?: string
  ): Promise<PageStructure> {
    return planPageStructure(pageName, pagePath, spec, requirements);
  }

  async step5_generatePages(
    structure: PageStructure,
    spec: ProjectDesignSpec,
    context: DesignContext,
    onProgress?: (page: string, status: 'pending' | 'generating' | 'done' | 'error') => void
  ): Promise<PageGenerationResult[]> {
    const pages = structure.sections.map(section => ({
      pageName: section.name,
      pagePath: structure.pagePath,
      sections: [section.name],
      designSpec: spec,
    }));

    return generateSite(pages, onProgress);
  }

  async step6_generatePreviews(
    results: PageGenerationResult[],
    spec: ProjectDesignSpec,
    context: DesignContext
  ): Promise<PreviewResult[]> {
    const previews: PreviewResult[] = [];

    for (const result of results) {
      if (result.components.length > 0) {
        const preview = await generatePreviewWithScreenshots(
          result.pageName,
          result.components,
          spec,
          context
        );
        previews.push(preview);
      }
    }

    return previews;
  }

  async step7_runQA(
    results: PageGenerationResult[],
    spec: ProjectDesignSpec,
    context: DesignContext
  ): Promise<QAReport[]> {
    const reports: QAReport[] = [];

    for (const result of results) {
      if (result.components.length > 0) {
        const report = await runDesignQA(result, spec, context);
        reports.push(report);
      }
    }

    return reports;
  }

  async runFullWorkflow(
    userPrompt: string,
    selectedBrand?: string,
    requirements?: string,
    options?: {
      skipConfirmation?: boolean;
      skipPreview?: boolean;
      skipQA?: boolean;
    }
  ): Promise<{
    spec: ProjectDesignSpec;
    context: DesignContext;
    structure: PageStructure;
    generationResults: PageGenerationResult[];
    previewResults?: PreviewResult[];
    qaReports?: QAReport[];
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      let brands: BrandRecommendation[] = [];
      
      if (selectedBrand) {
        brands = [{ name: selectedBrand, description: '', suitableFor: '', keyColors: [], typography: '', visualStyle: '' }];
      } else {
        const { brands: recommendedBrands } = await this.step1_selectDesignSystem(userPrompt);
        brands = recommendedBrands;
      }

      const brandToUse = selectedBrand || brands[0]?.name;
      if (!brandToUse) {
        throw new Error('No brand selected');
      }

      const { designSystem: spec } = await this.step2_confirmDesignSystem(
        brandToUse,
        userPrompt
      );

      const context = await this.step3_buildDesignContext(spec);

      const structure = await this.step4_planPageStructure(
        'Generated Page',
        'generated',
        spec,
        requirements
      );

      const generationResults = await this.step5_generatePages(
        structure,
        spec,
        context
      );

      let previewResults: PreviewResult[] | undefined;
      if (!options?.skipPreview) {
        previewResults = await this.step6_generatePreviews(
          generationResults,
          spec,
          context
        );
      }

      let qaReports: QAReport[] | undefined;
      if (!options?.skipQA) {
        qaReports = await this.step7_runQA(
          generationResults,
          spec,
          context
        );
      }

      return {
        spec,
        context,
        structure,
        generationResults,
        previewResults,
        qaReports,
        errors,
      };
    } catch (error) {
      errors.push(String(error));
      throw error;
    }
  }
}

export async function createDesignWorkflow(
  confirmationManager?: ConfirmationManager
): Promise<DesignWorkflow> {
  return new DesignWorkflow(confirmationManager);
}
