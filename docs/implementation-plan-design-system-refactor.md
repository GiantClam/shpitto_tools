# 实施计划: 基于 awesome-design-md 的网站生成功能重构

**创建时间:** 2026-04-08
**预计总时长:** 约 3.5 小时
**任务总数:** 18 个任务

## 概览

### 阶段划分

| 阶段 | 任务数 | 预计时长 | 依赖 |
|------|--------|----------|------|
| Phase 1: 设计系统准备 | 4 | 20min | 无 |
| Phase 2: 核心模块开发 | 6 | 90min | Phase 1 |
| Phase 3: 工作流集成 | 5 | 60min | Phase 2 |
| Phase 4: 预览与确认 | 3 | 40min | Phase 3 |

### 架构概览

```
用户需求
    ↓
┌─────────────────────────────────────────┐
│  Phase 1: 设计系统选择                   │
│  - 从 awesome-design-md 选择参考网站     │
│  - 或混合多个设计系统                    │
│  - 生成 project DESIGN.md               │
│  - 8 项确认（确认设计系统应用方式）       │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  Phase 2: 页面结构规划                   │
│  - 基于 design spec 确定页面/sections    │
│  - 人工确认页面结构                      │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  Phase 3: Executor 生成                 │
│  - 锁定 DESIGN.md 设计系统              │
│  - 逐页生成 React 组件                  │
│  - 截图预览 + 确认                       │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  Phase 4: Visual QA + 物化              │
└─────────────────────────────────────────┘
```

---

## Phase 1: 设计系统准备

### Task 1.1: 同步 awesome-design-md 最新代码
**预计时长:** 5 分钟
**优先级:** P0
**依赖:** 无

**目标:** 将 awesome-design-md 完整克隆到 builder/design-systems/

**详细步骤:**

1. **检查当前 design-systems 目录状态**
   ```bash
   ls -la builder/design-systems/
   ```

2. **添加 awesome-design-md 作为 submodule 或直接克隆**
   ```bash
   cd builder/design-systems/
   git submodule add https://github.com/VoltAgent/awesome-design-md.git awesome-design-md-full
   ```
   或者如果已有本地克隆:
   ```bash
   cd builder/design-systems/awesome-design-md-full
   git pull origin main
   ```

3. **验证克隆成功**
   ```bash
   ls builder/design-systems/awesome-design-md-full/design-md/ | head -20
   ```

**验证:**
```bash
# 确认 design-md 目录存在且包含多个品牌
ls builder/design-systems/awesome-design-md-full/design-md/ | wc -l
# 应该 > 50
```

**完成标准:**
- [ ] awesome-design-md-full 目录存在
- [ ] 包含 50+ 品牌的 DESIGN.md 文件
- [ ] 每个品牌包含 DESIGN.md, preview.html, preview-dark.html

---

### Task 1.2: 创建 DESIGN.md 解析器
**预计时长:** 8 分钟
**优先级:** P0
**依赖:** Task 1.1

**目标:** 创建 `builder/src/lib/agent/design-md-parser.ts`，解析 DESIGN.md 文件提取设计系统信息

**详细步骤:**

1. **创建解析器文件**
   ```typescript
   // builder/src/lib/agent/design-md-parser.ts
   
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
   
   export interface DesignSystem {
     name: string;
     visualTheme: string;
     colors: ColorPalette;
     typography: TypographyRule[];
     components: ComponentStyle[];
     layout: {
       spacing: number[];
       grid: string;
       maxWidth: string;
     };
     shadows: Record<string, string>;
     responsive: {
       breakpoints: Record<string, string>;
       strategy: string;
     };
     dosAndDonts: {
       dos: string[];
       donts: string[];
     };
     agentPrompts: string[];
     raw: string;
   }
   
   export async function parseDesignMd(content: string): Promise<DesignSystem> {
     // 实现解析逻辑...
   }
   
   export async function loadDesignSystem(brand: string): Promise<DesignSystem> {
     const filePath = `builder/design-systems/awesome-design-md-full/design-md/${brand}/DESIGN.md`;
     const content = await fs.readFile(filePath, 'utf-8');
     return parseDesignMd(content);
   }
   
   export async function listAvailableBrands(): Promise<string[]> {
     const dir = 'builder/design-systems/awesome-design-md-full/design-md/';
     const entries = await fs.readdir(dir);
     return entries.filter(e => {
       const stat = await fs.stat(`${dir}/${e}`);
       return stat.isDirectory();
     });
   }
   ```

2. **实现 parseDesignMd 函数**
   - 按 ## 1-9 分节解析
   - 提取颜色值（hex, rgb, rgba）
   - 提取字体层级表
   - 提取组件样式
   - 提取阴影系统

3. **添加 fs/promises import**
   ```typescript
   import { promises as fs } from 'fs';
   import path from 'path';
   ```

**涉及文件:**
- `builder/src/lib/agent/design-md-parser.ts` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/design-md-parser.ts
```

**完成标准:**
- [ ] 文件创建成功
- [ ] TypeScript 编译通过
- [ ] listAvailableBrands() 返回品牌列表
- [ ] parseDesignMd() 能正确解析 Vercel DESIGN.md

---

### Task 1.3: 创建设计系统选择器 Agent
**预计时长:** 10 分钟
**优先级:** P0
**依赖:** Task 1.2

**目标:** 创建 `builder/src/lib/agent/design-system-selector.ts`，实现设计系统选择和混合逻辑

**详细步骤:**

1. **创建选择器 Agent**
   ```typescript
   // builder/src/lib/agent/design-system-selector.ts
   
   import { loadDesignSystem, listAvailableBrands, DesignSystem, parseDesignMd } from './design-md-parser';
   import { createAgent } from './graph';
   
   export interface DesignSelection {
     primary: DesignSystem;
     mixed?: Array<{
       source: 'primary' | string;
       section: string;
       tokens: Partial<DesignSystem>;
     }>;
     customOverrides?: Record<string, string>;
   }
   
   export interface DesignSelectionResult {
     selection: DesignSelection;
     confirmationItems: ConfirmationItem[];
   }
   
   export interface ConfirmationItem {
     id: string;
     category: 'color' | 'typography' | 'component' | 'layout' | 'shadow' | 'responsive';
     current: string;
     alternatives?: string[];
     appliedValue?: string;
   }
   
   export async function selectDesignSystem(userPrompt: string): Promise<{
     brands: Array<{ name: string; description: string; preview: string }>;
   }> {
     // 1. 获取所有可用品牌
     const brands = await listAvailableBrands();
     
     // 2. 使用 LLM 根据用户需求推荐品牌
     const agent = createAgent('design-selector');
     
     const recommended = await agent.invoke({
       prompt: `用户需求: ${userPrompt}
       
       可用设计系统品牌: ${brands.join(', ')}
       
       请根据用户需求推荐最合适的 3-5 个品牌，每个品牌返回:
       1. 品牌名
       2. 一句话描述特点
       3. 适合的场景
       
       以 JSON 格式返回。`,
       schema: z.object({
         recommendations: z.array(z.object({
           name: z.string(),
           description: z.string(),
           suitableFor: z.string()
         }))
       })
     });
     
     return recommended;
   }
   
   export async function generateDesignConfirmation(
     selectedBrand: string,
     userRequirements: string
   ): Promise<DesignSelectionResult> {
     // 加载选中的设计系统
     const designSystem = await loadDesignSystem(selectedBrand);
     
     // 生成 8 项确认项
     const confirmationItems: ConfirmationItem[] = [];
     
     // 1. 颜色确认
     confirmationItems.push({
       id: 'primary-color',
       category: 'color',
       current: designSystem.colors.primary[0]?.value || '#000000',
       alternatives: designSystem.colors.primary.map(c => c.value)
     });
     
     // 2. 字体确认
     confirmationItems.push({
       id: 'heading-font',
       category: 'typography',
       current: designSystem.typography.find(t => t.role.includes('Display'))?.font || 'Geist',
     });
     
     // ... 生成其他 6 项确认
     
     return {
       selection: { primary: designSystem },
       confirmationItems
     };
   }
   
   export async function mixDesignSystems(
     base: DesignSystem,
     overrides: Array<{ section: string; source: DesignSystem }>
   ): Promise<DesignSystem> {
     // 混合多个设计系统的逻辑
     const mixed = { ...base };
     
     for (const override of overrides) {
       if (override.section === 'colors') {
         mixed.colors = { ...base.colors, ...override.source.colors };
       } else if (override.section === 'typography') {
         mixed.typography = [...base.typography, ...override.source.typography];
       }
       // ... 其他 section 的混合逻辑
     }
     
     return mixed;
   }
   ```

2. **实现确认项生成逻辑**
   - 生成 8 项确认：颜色 (3项)、字体 (2项)、组件 (1项)、布局 (1项)、阴影 (1项)
   - 每项包含当前值和备选值
   - 支持用户选择或自定义

3. **实现混合逻辑**
   - 支持从多个设计系统混合不同 section
   - 保持一致性检查

**涉及文件:**
- `builder/src/lib/agent/design-system-selector.ts` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/design-system-selector.ts
```

**完成标准:**
- [ ] selectDesignSystem() 能返回推荐品牌列表
- [ ] generateDesignConfirmation() 生成 8 项确认
- [ ] mixDesignSystems() 能混合多个设计系统

---

### Task 1.4: 创建 Design Spec 生成器
**预计时长:** 5 分钟
**优先级:** P1
**依赖:** Task 1.3

**目标:** 创建 `builder/src/lib/agent/design-spec-generator.ts`，基于确认结果生成 project DESIGN.md

**详细步骤:**

1. **创建 spec 生成器**
   ```typescript
   // builder/src/lib/agent/design-spec-generator.ts
   
   import { DesignSystem, DesignSelection, ConfirmationItem } from './design-system-selector';
   
   export interface ProjectDesignSpec {
     version: string;
     sourceDesignSystems: string[];
     appliedDesignSystem: DesignSystem;
     customOverrides: Record<string, string>;
     generatedAt: string;
   }
   
   export function generateProjectDesignSpec(
     selection: DesignSelection,
     confirmations: ConfirmationItem[]
   ): ProjectDesignSpec {
     // 应用确认覆盖
     const appliedDesign = applyConfirmations(selection.primary, confirmations);
     
     return {
       version: '1.0',
       sourceDesignSystems: [selection.primary.name],
       appliedDesignSystem: appliedDesign,
       customOverrides: extractOverrides(confirmations),
       generatedAt: new Date().toISOString()
     };
   }
   
   export function designSystemToMarkdown(spec: ProjectDesignSpec): string {
     // 将 DesignSystem 转换回 DESIGN.md 格式
     const ds = spec.appliedDesignSystem;
     
     let md = `# Project Design Specification\n\n`;
     md += `## 1. Visual Theme & Atmosphere\n\n${ds.visualTheme}\n\n`;
     md += `## 2. Color Palette & Roles\n\n`;
     // ... 转换逻辑
     
     return md;
   }
   
   function applyConfirmations(
     design: DesignSystem,
     confirmations: ConfirmationItem[]
   ): DesignSystem {
     // 根据确认项应用覆盖
     const result = { ...design };
     // ... 应用逻辑
     return result;
   }
   ```

**涉及文件:**
- `builder/src/lib/agent/design-spec-generator.ts` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/design-spec-generator.ts
```

**完成标准:**
- [ ] generateProjectDesignSpec() 生成项目 spec
- [ ] designSystemToMarkdown() 转换为 markdown
- [ ] 能保存为项目 DESIGN.md 文件

---

## Phase 2: 核心模块开发

### Task 2.1: 创建 Design Executor Agent
**预计时长:** 15 分钟
**优先级:** P0
**依赖:** Task 1.4

**目标:** 创建 `builder/src/lib/agent/design-executor.ts`，基于 DESIGN.md 生成 React 组件

**详细步骤:**

1. **创建 Executor Agent**
   ```typescript
   // builder/src/lib/agent/design-executor.ts
   
   import { ProjectDesignSpec } from './design-spec-generator';
   import { createAgent } from './graph';
   
   export interface PageGenerationRequest {
     pageName: string;
     pagePath: string;
     sections: string[];
     designSpec: ProjectDesignSpec;
     content?: Record<string, any>;
   }
   
   export interface PageGenerationResult {
     pageName: string;
     components: ComponentCode[];
     errors: string[];
     warnings: string[];
   }
   
   export interface ComponentCode {
     name: string;
     filePath: string;
     code: string;
     styles?: string;
   }
   
   export async function generatePage(
     request: PageGenerationRequest
   ): Promise<PageGenerationResult> {
     const agent = createAgent('design-builder');
     
     // 构建 prompt
     const prompt = buildGenerationPrompt(request);
     
     const result = await agent.invoke({
       prompt,
       designSpec: request.designSpec,
       pageName: request.pageName,
       sections: request.sections
     });
     
     return result;
   }
   
   function buildGenerationPrompt(request: PageGenerationRequest): string {
     const ds = request.designSpec.appliedDesignSystem;
     
     return `
       请根据以下 DESIGN.md 生成页面: ${request.pageName}
       
       ## 设计系统
       
       ${designSystemToContext(ds)}
       
       ## 页面结构
       ${request.sections.map(s => `- ${s}`).join('\n')}
       
       ## 内容要求
       ${JSON.stringify(request.content || {})}
       
       ## 要求
       1. 严格遵循 DESIGN.md 中的:
          - 颜色值（使用 CSS 变量）
          - 字体层级（size, weight, letter-spacing）
          - 阴影系统（使用 shadow-as-border 技术）
          - 组件样式
       2. 使用 React + Tailwind CSS
       3. 每个 section 生成独立组件
       4. 组件文件放在 components/pages/${request.pagePath}/
     `;
   }
   
   function designSystemToContext(ds: any): string {
     // 将 DesignSystem 转换为紧凑的上下文描述
     return `
       颜色系统:
       ${ds.colors.primary.map(c => `- ${c.name}: ${c.value}`).join('\n')}
       
       字体:
       ${ds.typography.slice(0, 5).map(t => 
         `- ${t.role}: ${t.font} ${t.size} weight=${t.weight} tracking=${t.letterSpacing}`
       ).join('\n')}
       
       阴影:
       ${Object.entries(ds.shadows).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
     `;
   }
   
   export async function generateSite(
     pages: PageGenerationRequest[],
     onProgress?: (page: string, status: 'pending' | 'generating' | 'done' | 'error') => void
   ): Promise<PageGenerationResult[]> {
     const results: PageGenerationResult[] = [];
     
     for (const page of pages) {
       onProgress?.(page.pageName, 'generating');
       
       try {
         const result = await generatePage(page);
         results.push(result);
         onProgress?.(page.pageName, 'done');
       } catch (error) {
         results.push({
           pageName: page.pageName,
           components: [],
           errors: [String(error)],
           warnings: []
         });
         onProgress?.(page.pageName, 'error');
       }
     }
     
     return results;
   }
   ```

2. **实现组件代码验证**
   - 使用 @babel/standalone 验证 React 代码语法
   - 检查 Tailwind 类名有效性

3. **实现错误处理和回退**
   - 如果 LLM 生成失败，回退到模板生成
   - 记录错误和警告

**涉及文件:**
- `builder/src/lib/agent/design-executor.ts` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/design-executor.ts
```

**完成标准:**
- [ ] generatePage() 生成单页组件
- [ ] generateSite() 支持多页批量生成
- [ ] 支持进度回调

---

### Task 2.2: 创建设计系统上下文加载器
**预计时长:** 5 分钟
**优先级:** P0
**依赖:** Task 2.1

**目标:** 创建 `builder/src/lib/agent/design-context-loader.ts`，为 LLM 提供设计系统上下文

**详细步骤:**

1. **创建上下文加载器**
   ```typescript
   // builder/src/lib/agent/design-context-loader.ts
   
   import { ProjectDesignSpec } from './design-spec-generator';
   
   export interface DesignContext {
     colors: ColorContext;
     typography: TypographyContext;
     components: ComponentContext;
     spacing: SpacingContext;
     shadows: ShadowContext;
   }
   
   export interface ColorContext {
     cssVariables: Record<string, string>;
     hexValues: Record<string, string>;
   }
   
   export interface TypographyContext {
     fontFamilies: string[];
     hierarchy: Array<{
       name: string;
       fontSize: string;
       fontWeight: number;
       lineHeight: string;
       letterSpacing: string;
     }>;
   }
   
   export interface ComponentContext {
     button: any;
     card: any;
     input: any;
     navigation: any;
   }
   
   export interface SpacingContext {
     scale: number[];
     base: number;
   }
   
   export interface ShadowContext {
     levels: Record<string, string>;
   }
   
   export function buildDesignContext(spec: ProjectDesignSpec): DesignContext {
     const ds = spec.appliedDesignSystem;
     
     return {
       colors: {
         cssVariables: buildColorCssVariables(ds),
         hexValues: buildColorHexMap(ds)
       },
       typography: {
         fontFamilies: extractFontFamilies(ds),
         hierarchy: ds.typography
       },
       components: extractComponentStyles(ds),
       spacing: {
         scale: ds.layout.spacing,
         base: 8
       },
       shadows: {
         levels: ds.shadows
       }
     };
   }
   
   export function designContextToSystemPrompt(context: DesignContext): string {
     return `
       ## 设计系统上下文
       
       ### 颜色 (CSS 变量)
       ${Object.entries(context.colors.cssVariables).map(([k, v]) => `--${k}: ${v};`).join('\n')}
       
       ### 字体层级
       ${context.typography.hierarchy.map(h => 
         `- ${h.name}: ${h.fontSize}/${h.lineHeight} weight=${h.fontWeight} tracking=${h.letterSpacing}`
       ).join('\n')}
       
       ### 阴影系统
       ${Object.entries(context.shadows.levels).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
     `;
   }
   
   function buildColorCssVariables(ds: any): Record<string, string> {
     const vars: Record<string, string> = {};
     // 从 ds.colors 提取并生成 CSS 变量名
     return vars;
   }
   
   function buildColorHexMap(ds: any): Record<string, string> {
     const map: Record<string, string> = {};
     // 从 ds.colors 提取 hex 值
     return map;
   }
   
   function extractFontFamilies(ds: any): string[] {
     // 提取所有字体系列
     return [...new Set(ds.typography.map((t: any) => t.font))];
   }
   
   function extractComponentStyles(ds: any): ComponentContext {
     // 从 ds.components 提取组件样式
     return {
       button: {},
       card: {},
       input: {},
       navigation: {}
     };
   }
   ```

**涉及文件:**
- `builder/src/lib/agent/design-context-loader.ts` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/design-context-loader.ts
```

**完成标准:**
- [ ] buildDesignContext() 正确构建上下文
- [ ] designContextToSystemPrompt() 生成系统 prompt
- [ ] 上下文包含所有必要的设计 token

---

### Task 2.3: 创建 Page Structure Planner
**预计时长:** 10 分钟
**优先级:** P0
**依赖:** Task 2.2

**目标:** 创建 `builder/src/lib/agent/page-structure-planner.ts`，基于设计系统规划页面结构

**详细步骤:**

1. **创建页面结构规划器**
   ```typescript
   // builder/src/lib/agent/page-structure-planner.ts
   
   import { ProjectDesignSpec } from './design-spec-generator';
   import { DesignContext } from './design-context-loader';
   
   export interface Section {
     name: string;
     type: 'hero' | 'features' | 'pricing' | 'testimonials' | 'cta' | 'faq' | 'footer' | 'nav' | 'content';
     order: number;
     required: boolean;
     description?: string;
   }
   
   export interface PageStructure {
     pageName: string;
     pagePath: string;
     sections: Section[];
     navigation: {
       type: 'horizontal' | 'vertical' | 'hamburger';
       items: string[];
     };
     footer: {
       type: 'simple' | 'complex';
       columns: string[];
     };
   }
   
   export interface StructureConfirmation {
     page: PageStructure;
     canProceed: boolean;
     suggestions: string[];
   }
   
   export async function planPageStructure(
     pageName: string,
     pagePath: string,
     designSpec: ProjectDesignSpec,
     requirements?: string
   ): Promise<PageStructure> {
     // 根据设计系统和需求规划页面结构
     const ds = designSpec.appliedDesignSystem;
     
     // 基于设计系统的特点推断合适的 section 类型
     const suggestedSections = inferSectionsFromDesign(ds, requirements);
     
     return {
       pageName,
       pagePath,
       sections: suggestedSections,
       navigation: inferNavigation(ds),
       footer: inferFooter(ds)
     };
   }
   
   function inferSectionsFromDesign(ds: any, requirements?: string): Section[] {
     // 从 DESIGN.md 的 visualTheme 和 layout 推断适合的 sections
     const sections: Section[] = [
       { name: 'Hero', type: 'hero', order: 1, required: true }
     ];
     
     // 根据设计复杂度添加更多 section
     if (ds.visualTheme.includes('feature-rich') || ds.visualTheme.includes('dense')) {
       sections.push(
         { name: 'Features', type: 'features', order: 2, required: false },
         { name: 'Testimonials', type: 'testimonials', order: 3, required: false }
       );
     }
     
     sections.push(
       { name: 'CTA', type: 'cta', order: 99, required: true }
     );
     
     return sections;
   }
   
   function inferNavigation(ds: any): PageStructure['navigation'] {
     // 根据设计系统推断导航类型
     if (ds.layout.maxWidth && parseInt(ds.layout.maxWidth) < 800) {
       return { type: 'hamburger', items: [] };
     }
     return { type: 'horizontal', items: [] };
   }
   
   function inferFooter(ds: any): PageStructure['footer'] {
     return { type: 'simple', columns: ['links', 'social', 'copyright'] };
   }
   
   export function validatePageStructure(structure: PageStructure): StructureConfirmation {
     const suggestions: string[] = [];
     let canProceed = true;
     
     // 验证必须有的 section
     if (!structure.sections.find(s => s.type === 'hero')) {
       suggestions.push('建议添加 Hero section 作为首屏');
       canProceed = false;
     }
     
     if (!structure.sections.find(s => s.type === 'cta')) {
       suggestions.push('建议添加 CTA section 促进转化');
     }
     
     return { page: structure, canProceed, suggestions };
   }
   ```

**涉及文件:**
- `builder/src/lib/agent/page-structure-planner.ts` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/page-structure-planner.ts
```

**完成标准:**
- [ ] planPageStructure() 根据设计系统规划页面
- [ ] validatePageStructure() 验证结构完整性
- [ ] 返回的结构包含 nav, sections, footer

---

### Task 2.4: 创建 Visual Preview 生成器
**预计时长:** 12 分钟
**优先级:** P1
**依赖:** Task 2.3

**目标:** 创建 `builder/src/lib/agent/visual-preview.ts`，生成页面预览截图

**详细步骤:**

1. **创建预览生成器**
   ```typescript
   // builder/src/lib/agent/visual-preview.ts
   
   import { PageGenerationResult } from './design-executor';
   import { ProjectDesignSpec } from './design-spec-generator';
   import { spawn } from 'child_process';
   import path from 'path';
   import fs from 'fs/promises';
   
   export interface PreviewResult {
     pageName: string;
     screenshotPath: string;
     issues: string[];
   }
   
   export async function generatePreview(
     pageName: string,
     components: ComponentCode[],
     designSpec: ProjectDesignSpec
   ): Promise<PreviewResult> {
     // 1. 创建临时 HTML 文件用于预览
     const tempDir = path.join(process.cwd(), 'temp', 'previews');
     await fs.mkdir(tempDir, { recursive: true });
     
     const htmlPath = path.join(tempDir, `${pageName}-preview.html`);
     const html = buildPreviewHtml(pageName, components, designSpec);
     await fs.writeFile(htmlPath, html, 'utf-8');
     
     // 2. 使用 Playwright 截图
     const screenshotPath = path.join(tempDir, `${pageName}-preview.png`);
     
     await captureScreenshot(htmlPath, screenshotPath);
     
     // 3. 检查截图质量
     const issues = await checkPreviewQuality(screenshotPath);
     
     return {
       pageName,
       screenshotPath,
       issues
     };
   }
   
   function buildPreviewHtml(
     pageName: string,
     components: ComponentCode[],
     designSpec: ProjectDesignSpec
   ): string {
     const ds = designSpec.appliedDesignSystem;
     
     // 生成 CSS 变量定义
     const cssVars = buildCssVariables(ds);
     
     // 生成组件代码
     const componentCode = components.map(c => c.code).join('\n\n');
     
     return `
       <!DOCTYPE html>
       <html lang="en">
       <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>${pageName} Preview</title>
         <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
         <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
         <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
         <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
         <style>
           *, *::before, *::after { box-sizing: border-box; }
           body { 
             margin: 0; 
             font-family: ${ds.typography[0]?.font || 'Inter'}, sans-serif;
             background: #fff;
           }
           ${cssVars}
           ${buildTailwindConfig(ds)}
         </style>
       </head>
       <body>
         <div id="root"></div>
         <script type="text/babel">
           ${componentCode}
         </script>
       </body>
       </html>
     `;
   }
   
   function buildCssVariables(ds: any): string {
     const vars: string[] = [];
     
     // 添加颜色变量
     if (ds.colors) {
       ds.colors.primary?.forEach((c: any) => {
         vars.push(`--color-${c.name}: ${c.value};`);
       });
     }
     
     return `:root {\n${vars.join('\n')}\n}`;
   }
   
   async function captureScreenshot(htmlPath: string, outputPath: string): Promise<void> {
     return new Promise((resolve, reject) => {
       // 使用 Playwright 截图
       const script = `
         const { chromium } = require('playwright');
         
         (async () => {
           const browser = await chromium.launch();
           const page = await browser.newPage();
           await page.goto('file://${htmlPath.replace(/\\/g, '\\\\')}');
           await page.waitForTimeout(2000);
           await page.screenshot({ path: '${outputPath.replace(/\\/g, '\\\\')}', fullPage: true });
           await browser.close();
         })();
       `;
       
       const proc = spawn('node', ['-e', script], { cwd: process.cwd() });
       proc.on('close', (code) => {
         if (code === 0) resolve();
         else reject(new Error(`Screenshot failed with code ${code}`));
       });
     });
   }
   
   async function checkPreviewQuality(screenshotPath: string): Promise<string[]> {
     const issues: string[] = [];
     
     // 检查文件是否存在
     try {
       await fs.access(screenshotPath);
     } catch {
       issues.push('截图文件生成失败');
     }
     
     // TODO: 可以使用 pixelmatch 进行视觉回归测试
     
     return issues;
   }
   ```

2. **添加 Playwright 依赖检查**
   - 确保 Playwright 已安装
   - 配置浏览器路径

**涉及文件:**
- `builder/src/lib/agent/visual-preview.ts` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/visual-preview.ts
```

**完成标准:**
- [ ] generatePreview() 生成预览截图
- [ ] buildPreviewHtml() 构建可预览的 HTML
- [ ] checkPreviewQuality() 检查预览质量

---

### Task 2.5: 创建 Design QA Gate
**预计时长:** 8 分钟
**优先级:** P1
**依赖:** Task 2.4

**目标:** 创建 `builder/src/lib/agent/design-qa-gate.ts`，验证生成结果是否符合 DESIGN.md

**详细步骤:**

1. **创建 QA Gate**
   ```typescript
   // builder/src/lib/agent/design-qa-gate.ts
   
   import { ProjectDesignSpec } from './design-spec-generator';
   import { PageGenerationResult, ComponentCode } from './design-executor';
   import { DesignContext } from './design-context-loader';
   
   export interface QAReport {
     passed: boolean;
     score: number;
     checks: QACheck[];
     recommendations: string[];
   }
   
   export interface QACheck {
     id: string;
     category: 'color' | 'typography' | 'shadow' | 'spacing' | 'component';
     passed: boolean;
     message: string;
     severity: 'critical' | 'major' | 'minor';
   }
   
   export async function runDesignQA(
     result: PageGenerationResult,
     designSpec: ProjectDesignSpec,
     context: DesignContext
   ): Promise<QAReport> {
     const checks: QACheck[] = [];
     
     // 1. 颜色检查
     checks.push(...await checkColors(result.components, context));
     
     // 2. 字体层级检查
     checks.push(...await checkTypography(result.components, context));
     
     // 3. 阴影系统检查
     checks.push(...await checkShadows(result.components, context));
     
     // 4. 间距检查
     checks.push(...await checkSpacing(result.components, context));
     
     // 计算分数
     const passedChecks = checks.filter(c => c.passed).length;
     const score = Math.round((passedChecks / checks.length) * 100);
     
     const recommendations = checks
       .filter(c => !c.passed && c.severity === 'major')
       .map(c => c.message);
     
     return {
       passed: score >= 80,
       score,
       checks,
       recommendations
     };
   }
   
   async function checkColors(
     components: ComponentCode[],
     context: DesignContext
   ): Promise<QACheck[]> {
     const checks: QACheck[] = [];
     
     for (const comp of components) {
       const code = comp.code;
       
       // 检查是否使用了设计系统中的颜色
       const usedColors = extractColorValues(code);
       const validColors = Object.values(context.colors.hexValues);
       
       for (const used of usedColors) {
         if (!validColors.includes(used) && !used.startsWith('#')) {
           checks.push({
             id: `color-${comp.name}-${used}`,
             category: 'color',
             passed: false,
             message: `组件 ${comp.name} 使用了非设计系统颜色: ${used}`,
             severity: 'minor'
           });
         }
       }
     }
     
     if (checks.length === 0) {
       checks.push({
         id: 'color-valid',
         category: 'color',
         passed: true,
         message: '所有组件使用了设计系统颜色',
         severity: 'minor'
       });
     }
     
     return checks;
   }
   
   async function checkTypography(
     components: ComponentCode[],
     context: DesignContext
   ): Promise<QACheck[]> {
     const checks: QACheck[] = [];
     
     for (const comp of components) {
       const code = comp.code;
       
       // 检查字体大小是否在设计系统层级内
       const fontSizes = extractFontSizes(code);
       const validSizes = context.typography.hierarchy.map(h => h.fontSize);
       
       // ... 检查逻辑
     }
     
     return checks;
   }
   
   async function checkShadows(
     components: ComponentCode[],
     context: DesignContext
   ): Promise<QACheck[]> {
     const checks: QACheck[] = [];
     
     for (const comp of components) {
       const code = comp.code;
       
       // 检查是否使用了 shadow-as-border 技术
       if (!code.includes('box-shadow') && !code.includes('shadow-')) {
         checks.push({
           id: `shadow-${comp.name}`,
           category: 'shadow',
           passed: false,
           message: `组件 ${comp.name} 未使用阴影系统`,
           severity: 'minor'
         });
       }
     }
     
     return checks;
   }
   
   async function checkSpacing(
     components: ComponentCode[],
     context: DesignContext
   ): Promise<QACheck[]> {
     const checks: QACheck[] = [];
     // 检查间距是否符合 8px 基础网格
     return checks;
   }
   
   function extractColorValues(code: string): string[] {
     const regex = /#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g;
     return code.match(regex) || [];
   }
   
   function extractFontSizes(code: string): string[] {
     const regex = /text-(\d+)|(\d+)px|(\d+)\/(\d+)/g;
     return code.match(regex) || [];
   }
   ```

**涉及文件:**
- `builder/src/lib/agent/design-qa-gate.ts` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/design-qa-gate.ts
```

**完成标准:**
- [ ] runDesignQA() 返回完整的 QA 报告
- [ ] 检查颜色、字体、阴影、间距
- [ ] 分数计算正确

---

### Task 2.6: 创建确认流程管理器
**预计时长:** 8 分钟
**优先级:** P0
**依赖:** Task 2.5

**目标:** 创建 `builder/src/lib/agent/confirmation-manager.ts`，管理 Phase 1-4 的所有确认流程

**详细步骤:**

1. **创建确认管理器**
   ```typescript
   // builder/src/lib/agent/confirmation-manager.ts
   
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
   
   export interface ConfirmationRequest {
     step: ConfirmationStep;
     data: any;
     continue?: boolean;
     overrides?: Record<string, any>;
   }
   
   export interface ConfirmationResponse {
     approved: boolean;
     step: ConfirmationStep;
     data?: any;
     overrides?: Record<string, any>;
     feedback?: string;
   }
   
   export class ConfirmationManager {
     private stepHistory: ConfirmationResponse[] = [];
     
     async requestConfirmation(req: ConfirmationRequest): Promise<ConfirmationResponse> {
       const response = await this.promptUser(req);
       this.stepHistory.push(response);
       return response;
     }
     
     private async promptUser(req: ConfirmationRequest): Promise<ConfirmationResponse> {
       // 根据 step 类型构建确认 UI
       switch (req.step) {
         case 'design-selection':
           return this.promptDesignSelection(req.data);
         case 'design-confirmation':
           return this.promptDesignConfirmation(req.data);
         case 'page-structure':
           return this.promptPageStructure(req.data);
         case 'page-preview':
           return this.promptPagePreview(req.data);
         case 'qa-report':
           return this.promptQAReport(req.data);
       }
     }
     
     private async promptDesignSelection(data: {
       brands: Array<{ name: string; description: string }>;
       userPrompt: string;
     }): Promise<ConfirmationResponse> {
       // TODO: 集成 UI 确认
       // 返回用户选择
       throw new Error('需要用户交互');
     }
     
     private async promptDesignConfirmation(data: {
       items: ConfirmationItem[];
     }): Promise<ConfirmationResponse> {
       throw new Error('需要用户交互');
     }
     
     private async promptPageStructure(data: {
       structure: PageStructure;
     }): Promise<ConfirmationResponse> {
       throw new Error('需要用户交互');
     }
     
     private async promptPagePreview(data: {
       previews: PreviewResult[];
     }): Promise<ConfirmationResponse> {
       throw new Error('需要用户交互');
     }
     
     private async promptQAReport(data: {
       report: QAReport;
     }): Promise<ConfirmationResponse> {
       throw new Error('需要用户交互');
     }
     
     getHistory(): ConfirmationResponse[] {
       return this.stepHistory;
     }
     
     canProceedToNextStep(): boolean {
       const last = this.stepHistory[this.stepHistory.length - 1];
       return last?.approved ?? false;
     }
   }
   ```

**涉及文件:**
- `builder/src/lib/agent/confirmation-manager.ts` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/confirmation-manager.ts
```

**完成标准:**
- [ ] ConfirmationManager 管理所有确认步骤
- [ ] stepHistory 记录所有确认历史
- [ ] canProceedToNextStep() 判断是否可以继续

---

## Phase 3: 工作流集成

### Task 3.1: 修改 p2w-graph.ts 支持新流程
**预计时长:** 15 分钟
**优先级:** P0
**依赖:** Task 2.6

**目标:** 修改 `builder/src/lib/agent/p2w-graph.ts`，集成新的 design-executor 工作流

**详细步骤:**

1. **分析现有 p2w-graph.ts 结构**
   - 读取 p2w-graph.ts 理解现有 StateGraph 结构
   - 识别需要修改的节点和边

2. **添加新的状态字段**
   ```typescript
   // 在 State 定义的末尾添加
   designSelection?: DesignSelection;
   designConfirmation?: ConfirmationItem[];
   projectDesignSpec?: ProjectDesignSpec;
   designContext?: DesignContext;
   ```

3. **添加新的节点**
   ```typescript
   // 添加 design-system-node
   const designSystemNode = async (state: State) => {
     const { prompt, structuredInput } = state;
     
     // 1. 选择设计系统
     const { brands } = await selectDesignSystem(prompt);
     
     // 2. 等待用户选择
     const selection = await confirmationManager.requestConfirmation({
       step: 'design-selection',
       data: { brands }
     });
     
     // 3. 生成设计确认项
     const { confirmationItems } = await generateDesignConfirmation(
       selection.data.selectedBrand,
       prompt
     );
     
     return {
       designSelection: selection.data,
       designConfirmation: confirmationItems
     };
   };
   
   // 添加 design-confirmation-node
   const designConfirmationNode = async (state: State) => {
     const { designSelection, designConfirmation } = state;
     
     // 等待用户确认设计系统
     const confirmed = await confirmationManager.requestConfirmation({
       step: 'design-confirmation',
       data: { items: designConfirmation }
     });
     
     // 生成项目 DESIGN.md
     const spec = generateProjectDesignSpec(
       designSelection,
       confirmed.overrides
     );
     
     const context = buildDesignContext(spec);
     
     return {
       projectDesignSpec: spec,
       designContext: context
     };
   };
   ```

4. **修改边连接**
   - 原流程: START → architect
   - 新流程: START → design-system-node → design-confirmation-node → architect

5. **更新 architect prompt**
   - 添加 designContext 到 system prompt
   - 指示 LLM 遵循 DESIGN.md 规范

**涉及文件:**
- `builder/src/lib/agent/p2w-graph.ts` - 修改

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/p2w-graph.ts
```

**完成标准:**
- [ ] 新增 design-system-node 和 design-confirmation-node
- [ ] 状态包含新的 design 相关字段
- [ ] architect 使用 designContext

---

### Task 3.2: 更新 prompts.ts 添加设计系统 prompt
**预计时长:** 5 分钟
**优先级:** P1
**依赖:** Task 3.1

**目标:** 更新 `builder/src/lib/agent/prompts.ts`，添加设计系统相关 system prompt

**详细步骤:**

1. **添加新的 prompt 模板**
   ```typescript
   // 在 prompts.ts 末尾添加
   
   export const DESIGN_SYSTEM_PROMPTS = {
     selector: `你是一个设计系统推荐专家。
    
    用户需求: {userPrompt}
    
    可用设计系统: {availableBrands}
    
    请根据用户需求，从可用设计系统中推荐最合适的 3-5 个。
    每个品牌返回:
    1. 品牌名
    2. 一句话描述特点
    3. 适合的场景
    
    以 JSON 格式返回。`,
   
     builder: `你是一个 UI 开发专家，负责根据 DESIGN.md 生成 React 组件。
    
    ## 设计系统上下文
    {designContext}
    
    ## 页面要求
    页面名称: {pageName}
    需要的 sections: {sections}
    
    ## 要求
    1. 严格遵循 DESIGN.md 中的设计规范
    2. 使用 React + Tailwind CSS
    3. 每个 section 生成独立组件
    4. 使用 CSS 变量引用颜色，使用设计系统中的字体
    5. 使用 shadow-as-border 技术代替传统 border
    6. 确保组件可复用和可访问
    
    ## 输出格式
    返回组件代码数组，每个组件包含:
    - name: 组件名
    - filePath: 文件路径
    - code: 组件代码`,
   
     qa: `你是一个设计 QA 专家，检查生成的组件是否符合 DESIGN.md 规范。
    
    ## 设计系统
    {designContext}
    
    ## 生成的组件
    {components}
    
    ## 检查项
    1. 颜色: 是否使用了设计系统中的颜色
    2. 字体: 是否遵循字体层级规范
    3. 阴影: 是否使用了 shadow-as-border 技术
    4. 间距: 是否遵循 8px 网格系统
    5. 组件: 是否符合组件样式规范`,
   };
   ```

**涉及文件:**
- `builder/src/lib/agent/prompts.ts` - 修改

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/prompts.ts
```

**完成标准:**
- [ ] 添加 DESIGN_SYSTEM_PROMPTS 对象
- [ ] 包含 selector, builder, qa 三个 prompt 模板

---

### Task 3.3: 添加混合设计系统支持
**预计时长:** 8 分钟
**优先级:** P2
**依赖:** Task 3.1

**目标:** 在 design-system-selector.ts 中增强混合设计系统功能

**详细步骤:**

1. **扩展混合逻辑**
   ```typescript
   // 在 design-system-selector.ts 中添加
   
   export interface MixedDesignSystem {
     base: DesignSystem;
     overrides: Array<{
       source: string;
       section: 'colors' | 'typography' | 'components' | 'layout' | 'shadows';
       weight: number; // 0-1, 混合权重
     }>;
   }
   
   export async function createMixedDesignSystem(
     bases: string[],
     userRequirements: string
   ): Promise<MixedDesignSystem> {
     // 1. 加载多个设计系统
     const designSystems = await Promise.all(
       bases.map(b => loadDesignSystem(b))
     );
     
     // 2. 使用 LLM 分析每个设计系统的优势
     const agent = createAgent('design-mixer');
     
     const analysis = await agent.invoke({
       prompt: `用户需求: ${userRequirements}
       
       设计系统:
       ${designSystems.map((ds, i) => `
         [${i}] ${ds.name}:
         - 颜色: ${ds.colors.primary.slice(0, 3).map(c => c.value).join(', ')}
         - 字体: ${ds.typography[0]?.font}
         - 风格: ${ds.visualTheme.slice(0, 100)}
       `).join('\n')}
       
       请分析每个设计系统的优势，建议如何混合。
       以 JSON 格式返回混合方案。`,
       schema: z.object({
         base: z.number(),
         overrides: z.array(z.object({
           source: z.number(),
           section: z.enum(['colors', 'typography', 'components', 'layout', 'shadows']),
           weight: z.number()
         }))
       })
     });
     
     return {
       base: designSystems[analysis.base],
       overrides: analysis.overrides.map(o => ({
         source: designSystems[o.source].name,
         section: o.section,
         weight: o.weight
       }))
     };
   }
   
   export function mergeDesignSystems(
     base: DesignSystem,
     overrides: Array<{ source: DesignSystem; section: string; weight: number }>
   ): DesignSystem {
     // 实现混合逻辑
     const result = deepClone(base);
     
     for (const override of overrides) {
       switch (override.section) {
         case 'colors':
           mergeColors(result, override.source, override.weight);
           break;
         case 'typography':
           mergeTypography(result, override.source, override.weight);
           break;
         // ... 其他 section
       }
     }
     
     return result;
   }
   ```

**涉及文件:**
- `builder/src/lib/agent/design-system-selector.ts` - 修改

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/design-system-selector.ts
```

**完成标准:**
- [ ] createMixedDesignSystem() 支持多品牌混合
- [ ] mergeDesignSystems() 正确合并设计系统

---

### Task 3.4: 创建 CLI 命令集成
**预计时长:** 10 分钟
**优先级:** P1
**依赖:** Task 3.3

**目标:** 创建 CLI 命令 `design-generate`，测试完整流程

**详细步骤:**

1. **创建 CLI 命令文件**
   ```typescript
   // builder/src/commands/design-generate.ts
   
   import { Command } from 'commander';
   import { selectDesignSystem } from '../lib/agent/design-system-selector';
   import { generateDesignConfirmation, mixDesignSystems } from '../lib/agent/design-system-selector';
   import { planPageStructure } from '../lib/agent/page-structure-planner';
   import { generatePage } from '../lib/agent/design-executor';
   import { generatePreview } from '../lib/agent/visual-preview';
   import { runDesignQA } from '../lib/agent/design-qa-gate';
   import { buildDesignContext } from '../lib/agent/design-context-loader';
   import { generateProjectDesignSpec } from '../lib/agent/design-spec-generator';
   import { ConfirmationManager } from '../lib/agent/confirmation-manager';
   
   export const designGenerateCommand = new Command('design-generate')
     .description('使用 awesome-design-md 设计系统生成网站')
     .argument('<prompt>', '网站需求描述')
     .option('-b, --brand <brand>', '指定设计系统品牌')
     .option('-m, --mix <brands...>', '混合多个设计系统')
     .option('-o, --output <dir>', '输出目录', 'output')
     .action(async (prompt, options) => {
       const confirmationManager = new ConfirmationManager();
       
       console.log('🎨 开始网站生成流程...\n');
       
       // Phase 1: 设计系统选择
       console.log('📋 Phase 1: 设计系统选择');
       let brands;
       if (options.brand) {
         brands = [{ name: options.brand, description: '', suitableFor: '' }];
       } else {
         const result = await selectDesignSystem(prompt);
         brands = result.brands;
       }
       console.log(`推荐品牌: ${brands.map(b => b.name).join(', ')}`);
       // TODO: 等待用户确认
       
       // Phase 2: 页面结构规划
       console.log('\n📋 Phase 2: 页面结构规划');
       // ...
       
       // Phase 3: 生成
       console.log('\n📋 Phase 3: 组件生成');
       // ...
       
       console.log('\n✅ 完成!');
     });
   ```

2. **更新 main.ts 注册命令**
   ```typescript
   // builder/src/main.ts
   
   import { designGenerateCommand } from './commands/design-generate';
   
   program.addCommand(designGenerateCommand);
   ```

**涉及文件:**
- `builder/src/commands/design-generate.ts` - 新增
- `builder/src/main.ts` - 修改

**验证:**
```bash
cd builder && npx tsc --noEmit src/commands/design-generate.ts
```

**完成标准:**
- [ ] design-generate 命令可执行
- [ ] 支持 --brand 指定品牌
- [ ] 支持 --mix 混合品牌

---

### Task 3.5: 创建 Web UI 集成
**预计时长:** 12 分钟
**优先级:** P2
**依赖:** Task 3.4

**目标:** 在 Next.js UI 中集成设计系统选择流程

**详细步骤:**

1. **创建设计系统选择页面**
   ```typescript
   // builder/src/app/design/select/page.tsx
   
   'use client';
   
   import { useState } from 'react';
   import { selectDesignSystem } from '@/lib/agent/design-system-selector';
   
   export default function DesignSelectPage() {
     const [step, setStep] = useState<'input' | 'selection' | 'confirmation'>('input');
     const [prompt, setPrompt] = useState('');
     const [brands, setBrands] = useState<any[]>([]);
     
     const handleSubmit = async () => {
       const result = await selectDesignSystem(prompt);
       setBrands(result.brands);
       setStep('selection');
     };
     
     if (step === 'input') {
       return (
         <div className="max-w-2xl mx-auto p-8">
           <h1>选择设计系统</h1>
           <textarea
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="描述你的网站需求..."
             className="w-full h-32 p-4 border rounded-lg"
           />
           <button onClick={handleSubmit} className="btn-primary">
             推荐设计系统
           </button>
         </div>
       );
     }
     
     if (step === 'selection') {
       return (
         <div className="max-w-4xl mx-auto p-8">
           <h1>推荐的设计系统</h1>
           <div className="grid grid-cols-3 gap-4">
             {brands.map((brand) => (
               <div key={brand.name} className="p-4 border rounded-lg">
                 <h2>{brand.name}</h2>
                 <p>{brand.description}</p>
                 <button onClick={() => setStep('confirmation')}>
                   选择
                 </button>
               </div>
             ))}
           </div>
         </div>
       );
     }
     
     return null;
   }
   ```

**涉及文件:**
- `builder/src/app/design/select/page.tsx` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/app/design/select/page.tsx
```

**完成标准:**
- [ ] 设计系统选择 UI 可用
- [ ] 展示推荐品牌列表
- [ ] 支持选择和确认流程

---

## Phase 4: 预览与确认

### Task 4.1: 集成 Playwright 截图功能
**预计时长:** 10 分钟
**优先级:** P0
**依赖:** Task 3.2

**目标:** 完善 visual-preview.ts 的 Playwright 集成

**详细步骤:**

1. **更新 visual-preview.ts 添加 Playwright 支持**
   ```typescript
   // 在 visual-preview.ts 中添加
   
   import { chromium, Browser, Page } from 'playwright';
   
   export class PlaywrightPreview {
     private browser: Browser | null = null;
     
     async initialize(): Promise<void> {
       this.browser = await chromium.launch({
         headless: true,
         args: ['--no-sandbox', '--disable-setuid-sandbox']
       });
     }
     
     async capturePage(htmlContent: string, outputPath: string): Promise<void> {
       if (!this.browser) {
         await this.initialize();
       }
       
       const page = await this.browser!.newPage();
       await page.setContent(htmlContent, { waitUntil: 'networkidle' });
       await page.waitForTimeout(2000); // 等待动画
       await page.screenshot({ path: outputPath, fullPage: true });
       await page.close();
     }
     
     async close(): Promise<void> {
       if (this.browser) {
         await this.browser.close();
         this.browser = null;
       }
     }
   }
   
   // 更新 generatePreview 使用 PlaywrightPreview
   const playwrightPreview = new PlaywrightPreview();
   
   export async function generatePreview(...): Promise<PreviewResult> {
     // ...
     await captureScreenshot(htmlPath, screenshotPath);
     // ...
   }
   ```

2. **添加错误处理**
   - 处理 Playwright 未安装的情况
   - 提供降级方案

**涉及文件:**
- `builder/src/lib/agent/visual-preview.ts` - 修改

**验证:**
```bash
cd builder && npx tsc --noEmit src/lib/agent/visual-preview.ts
```

**完成标准:**
- [ ] PlaywrightPreview 类正确实现
- [ ] 可以截取页面预览图

---

### Task 4.2: 创建预览对比 UI
**预计时长:** 12 分钟
**优先级:** P1
**依赖:** Task 4.1

**目标:** 创建 UI 展示预览截图并支持对比确认

**详细步骤:**

1. **创建预览对比组件**
   ```typescript
   // builder/src/components/preview-comparison.tsx
   
   'use client';
   
   import { PreviewResult } from '@/lib/agent/visual-preview';
   import Image from 'next/image';
   
   interface PreviewComparisonProps {
     previews: PreviewResult[];
     designSpecName: string;
     onApprove: () => void;
     onReject: (reason: string) => void;
   }
   
   export function PreviewComparison({
     previews,
     designSpecName,
     onApprove,
     onReject
   }: PreviewComparisonProps) {
     return (
       <div className="max-w-6xl mx-auto p-8">
         <div className="mb-8">
           <h1>页面预览确认</h1>
           <p className="text-gray-600">
             设计系统: {designSpecName}
           </p>
         </div>
         
         <div className="space-y-8">
           {previews.map((preview) => (
             <div key={preview.pageName} className="border rounded-lg overflow-hidden">
               <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                 <span className="font-medium">{preview.pageName}</span>
                 {preview.issues.length > 0 && (
                   <span className="text-red-500 text-sm">
                     {preview.issues.length} 个问题
                   </span>
                 )}
               </div>
               
               <div className="relative">
                 <Image
                   src={preview.screenshotPath}
                   alt={`${preview.pageName} preview`}
                   width={1200}
                   height={800}
                   className="w-full"
                 />
               </div>
               
               {preview.issues.length > 0 && (
                 <div className="bg-red-50 px-4 py-2 text-sm text-red-700">
                   {preview.issues.map((issue, i) => (
                     <div key={i}>⚠️ {issue}</div>
                   ))}
                 </div>
               )}
             </div>
           ))}
         </div>
         
         <div className="mt-8 flex gap-4 justify-center">
           <button
             onClick={() => onApprove()}
             className="px-6 py-3 bg-green-600 text-white rounded-lg"
           >
             确认并继续
           </button>
           <button
             onClick={() => onReject('需要修改')}
             className="px-6 py-3 bg-red-600 text-white rounded-lg"
           >
             重新生成
           </button>
         </div>
       </div>
     );
   }
   ```

**涉及文件:**
- `builder/src/components/preview-comparison.tsx` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/components/preview-comparison.tsx
```

**完成标准:**
- [ ] PreviewComparison 组件正确渲染
- [ ] 展示所有页面预览
- [ ] 支持 approve/reject 操作

---

### Task 4.3: 创建 QA 报告展示组件
**预计时长:** 8 分钟
**优先级:** P1
**依赖:** Task 4.2

**目标:** 创建 QA 报告展示组件，呈现质量检查结果

**详细步骤:**

1. **创建 QA 报告组件**
   ```typescript
   // builder/src/components/qa-report.tsx
   
   'use client';
   
   import { QAReport } from '@/lib/agent/design-qa-gate';
   
   interface QAReportProps {
     report: QAReport;
     onFixIssue?: (issueId: string) => void;
   }
   
   export function QAReportView({ report, onFixIssue }: QAReportProps) {
     const scoreColor = report.score >= 80 ? 'text-green-600' : 
                        report.score >= 60 ? 'text-yellow-600' : 'text-red-600';
     
     return (
       <div className="max-w-4xl mx-auto p-8">
         <div className="mb-8 text-center">
           <div className={`text-6xl font-bold ${scoreColor}`}>
             {report.score}%
           </div>
           <p className="text-gray-600 mt-2">
             设计规范符合度
           </p>
           {report.passed ? (
             <span className="inline-block mt-2 px-4 py-1 bg-green-100 text-green-800 rounded-full">
               通过
             </span>
           ) : (
             <span className="inline-block mt-2 px-4 py-1 bg-red-100 text-red-800 rounded-full">
               未通过
             </span>
           )}
         </div>
         
         <div className="space-y-4">
           <h2 className="text-lg font-semibold">检查详情</h2>
           
           {['color', 'typography', 'shadow', 'spacing', 'component'].map(category => {
             const categoryChecks = report.checks.filter(c => c.category === category);
             if (categoryChecks.length === 0) return null;
             
             return (
               <div key={category} className="border rounded-lg">
                 <div className="px-4 py-2 bg-gray-100 font-medium capitalize">
                   {category}
                 </div>
                 <div className="p-4 space-y-2">
                   {categoryChecks.map((check) => (
                     <div
                       key={check.id}
                       className={`flex items-start gap-2 ${
                         check.passed ? 'text-green-700' : 'text-red-700'
                       }`}
                     >
                       <span>{check.passed ? '✅' : '❌'}</span>
                       <span className="flex-1">{check.message}</span>
                       {check.severity === 'critical' && (
                         <span className="text-xs bg-red-200 px-2 py-0.5 rounded">
                           严重
                         </span>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             );
           })}
         </div>
         
         {report.recommendations.length > 0 && (
           <div className="mt-8">
             <h2 className="text-lg font-semibold mb-4">改进建议</h2>
             <ul className="list-disc list-inside space-y-2">
               {report.recommendations.map((rec, i) => (
                 <li key={i} className="text-gray-700">{rec}</li>
               ))}
             </ul>
           </div>
         )}
       </div>
     );
   }
   ```

**涉及文件:**
- `builder/src/components/qa-report.tsx` - 新增

**验证:**
```bash
cd builder && npx tsc --noEmit src/components/qa-report.tsx
```

**完成标准:**
- [ ] QAReportView 组件正确渲染
- [ ] 展示分数和通过状态
- [ ] 分类显示检查详情
- [ ] 显示改进建议

---

## 验证清单

### 代码质量
- [ ] 所有 TypeScript 文件编译通过
- [ ] 无新增 ESLint 错误
- [ ] 遵循现有代码风格

### 功能完整性
- [ ] 可以从 awesome-design-md 选择设计系统
- [ ] 可以混合多个设计系统
- [ ] 可以确认和应用设计系统
- [ ] 可以规划页面结构
- [ ] 可以生成 React 组件
- [ ] 可以生成预览截图
- [ ] 可以运行 QA 检查
- [ ] 可以展示 QA 报告

### 集成测试
- [ ] CLI 命令可执行
- [ ] Web UI 可访问
- [ ] Playwright 截图正常
- [ ] 确认流程可工作

---

## 风险和缓解

| 风险 | 缓解方案 |
|------|----------|
| awesome-design-md submodule 更新冲突 | 使用 git submodule update --init --recursive |
| LLM 生成代码质量不稳定 | QA Gate 设置 80% 通过门槛 |
| 预览截图失败 | 提供降级方案，直接展示 HTML |
| 设计系统混合效果不佳 | 提供预览对比，支持回退 |

---

**准备开始执行？**
输入 `/superpowers:execute-plan` 开始执行
