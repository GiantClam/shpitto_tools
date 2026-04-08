import { ConfirmationItem } from './design-system-selector';
import { PageStructure } from './page-structure-planner';
import { QAReport } from './design-qa-gate';
import { PreviewResult } from './visual-preview';

export type ConfirmationStep = 
  | 'design-selection'
  | 'design-confirmation'
  | 'page-structure'
  | 'page-preview'
  | 'qa-report';

export interface ConfirmationRequest<T = unknown> {
  step: ConfirmationStep;
  data: T;
}

export interface ConfirmationResponse<T = unknown> {
  approved: boolean;
  step: ConfirmationStep;
  data?: T;
  overrides?: Record<string, unknown>;
  feedback?: string;
}

export type ConfirmationHandler<T = unknown> = (
  data: T
) => Promise<ConfirmationResponse<T>>;

export class ConfirmationManager {
  private stepHistory: ConfirmationResponse[] = [];
  private handlers: Map<ConfirmationStep, ConfirmationHandler> = new Map();
  private pendingConfirmations: Map<ConfirmationStep, unknown> = new Map();

  constructor() {
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers(): void {
    this.registerHandler('design-selection', async (data) => {
      return {
        approved: false,
        step: 'design-selection',
        feedback: 'Default handler - requires UI integration',
      };
    });

    this.registerHandler('design-confirmation', async (data) => {
      return {
        approved: false,
        step: 'design-confirmation',
        feedback: 'Default handler - requires UI integration',
      };
    });

    this.registerHandler('page-structure', async (data) => {
      return {
        approved: false,
        step: 'page-structure',
        feedback: 'Default handler - requires UI integration',
      };
    });

    this.registerHandler('page-preview', async (data) => {
      return {
        approved: false,
        step: 'page-preview',
        feedback: 'Default handler - requires UI integration',
      };
    });

    this.registerHandler('qa-report', async (data) => {
      return {
        approved: false,
        step: 'qa-report',
        feedback: 'Default handler - requires UI integration',
      };
    });
  }

  registerHandler<T>(step: ConfirmationStep, handler: ConfirmationHandler<T>): void {
    this.handlers.set(step, handler as ConfirmationHandler);
  }

  async requestConfirmation<T>(request: ConfirmationRequest<T>): Promise<ConfirmationResponse<T>> {
    const handler = this.handlers.get(request.step);
    
    if (!handler) {
      throw new Error(`No handler registered for step: ${request.step}`);
    }

    this.pendingConfirmations.set(request.step, request.data);

    try {
      const response = await handler(request.data) as ConfirmationResponse<T>;
      this.stepHistory.push(response);
      this.pendingConfirmations.delete(request.step);
      return response;
    } catch (error) {
      this.pendingConfirmations.delete(request.step);
      throw error;
    }
  }

  getHistory(): ConfirmationResponse[] {
    return [...this.stepHistory];
  }

  getLastResponse(): ConfirmationResponse | undefined {
    return this.stepHistory[this.stepHistory.length - 1];
  }

  canProceedToNextStep(): boolean {
    const last = this.getLastResponse();
    return last?.approved ?? false;
  }

  isStepComplete(step: ConfirmationStep): boolean {
    return this.stepHistory.some(r => r.step === step && r.approved);
  }

  getStepData(step: ConfirmationStep): unknown | undefined {
    return this.pendingConfirmations.get(step);
  }

  reset(): void {
    this.stepHistory = [];
    this.pendingConfirmations.clear();
  }
}

export interface DesignSelectionData {
  brands: Array<{
    name: string;
    description: string;
    suitableFor?: string;
  }>;
  userPrompt: string;
}

export interface DesignConfirmationData {
  items: ConfirmationItem[];
  designSystemName: string;
}

export interface PageStructureData {
  structure: PageStructure;
  pageName: string;
}

export interface PagePreviewData {
  previews: PreviewResult[];
  pageName: string;
}

export interface QAReportData {
  report: QAReport;
  pageName: string;
}

export function createConfirmationManager(
  overrides?: Partial<Record<ConfirmationStep, ConfirmationHandler>>
): ConfirmationManager {
  const manager = new ConfirmationManager();
  
  if (overrides) {
    for (const [step, handler] of Object.entries(overrides)) {
      if (handler) {
        manager.registerHandler(step as ConfirmationStep, handler);
      }
    }
  }
  
  return manager;
}

export function formatConfirmationRequest(step: ConfirmationStep, data: unknown): string {
  switch (step) {
    case 'design-selection':
      const selData = data as DesignSelectionData;
      return `Design Selection: ${selData.brands.length} brands available for "${selData.userPrompt}"`;
    
    case 'design-confirmation':
      const confData = data as DesignConfirmationData;
      return `Design Confirmation: ${confData.items.length} items to confirm for ${confData.designSystemName}`;
    
    case 'page-structure':
      const structData = data as PageStructureData;
      return `Page Structure: ${structData.structure.sections.length} sections for ${structData.pageName}`;
    
    case 'page-preview':
      const previewData = data as PagePreviewData;
      return `Page Preview: ${previewData.previews.length} previews for ${previewData.pageName}`;
    
    case 'qa-report':
      const qaData = data as QAReportData;
      return `QA Report: Score ${qaData.report.score}% for ${qaData.pageName}`;
  }
}
