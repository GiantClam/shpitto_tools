# Shipitto Pro：工业级网页资产流水线方案

> 目标：从“重建网站”升级为“资产工厂”，实现**高保真、可复用、可商用**的网页资产生产与复用闭环。

---

## 1. 核心逻辑演进：从克隆到资产工厂

原方案关注“复刻目标站”，本方案升级为：

**提取 → 解耦 → 标准化 → 入库 → 复用**

### 1.1 资产解耦架构（Decoupling Architecture）

资产拆分为三层：

- **结构层（Skeleton / Structure）**：Puck JSON 描述的区块布局（sections + props）。
- **表现层（Visual Tokens）**：主题色/字体/圆角/间距等 Token（theme.css + tokens.json）。
- **语义层（Semantic Content）**：业务语义标签（意图、行业、角色）。

> 现状：结构层与表现层已落地；语义层正在增强（atoms_dsl + 意图规则）。

---

## 2. 完整工作流（End‑to‑End Workflow）

### Phase 1：多维度深度采集（Enhanced Capture）

**已实现：**
- Playwright 全页截图 + 区块截图
- DOM snapshot / section bbox
- computed styles 统计
- atoms 原子节点采集（文本/图片/按钮/链接）

**下一步（扩展）：**
1. **Design Token 萃取升级**：
   - 聚类推断“间距系统”（如 8px 倍数）
   - 主色 / 辅色 / 功能色自动识别
2. **原子化截图**：按钮/输入框/卡片等原子级截图（用于 Embedding）
3. **动态交互捕获**：hover、transition、easing 参数采集

---

### Phase 2：结构化理解与 DSL 转化（Understand & Atomize）

**已实现：**
- atoms_dsl 生成（结构化原子层）
- atoms_dsl 驱动 Block 选择与 props 填充
- 规则化意图标注（pricing/faq/trust 等）
- **语义标注器（LLM + 规则混合）**：输出 `semantic.json` + `semantic_panel.html` 便于人工校正

**新增改造要求：**
1. **Semantic Tagger（语义标注器）**：
   - LLM + 规则识别业务语义（如 Product_Hero / Testimonials / Use_Case）
2. **atoms_dsl 升级字段**：
   - `semanticRole`（业务语义）
   - `layoutPattern`（布局模式）
   - `styleIntent`（主按钮/次按钮/弱化文本）
3. **样式归一化（Normalization）**：
   - 将 #3B82F6 等硬编码色映射为 `var(--primary)`

---

### Phase 3：资产入库与索引（Asset Library & Indexing）

**新增模块：**`asset-library/`

功能：
- **特征向量化**：section/卡片截图 → Embedding（CLIP）
- **元数据丰富**：行业 / 风格 / 转化强度 / 复杂度
- **变体归档**：相似区块 → 变体族

> 状态：规划中（本轮暂未落地代码）。

---

### Phase 4：视觉 QA 与自动纠偏闭环（Visual QA Loop）

**已实现：**
- visual‑qa：原站 vs Puck 渲染 diff
- attribution：结构/颜色/内容差异归因
- auto‑repair：修复迭代文件输出并自动回写

**新增改造要求：**
1. **跨主题渲染测试**：三套主题渲染验证鲁棒性
2. **内容溢出测试**：极长/极短文案压测

---

## 3. 核心模块改造细节（落地与规划）

### 3.1 atoms_dsl 结构升级

目标结构示例：

```json
{
  "sectionId": "hero-01",
  "semanticRole": "Product_Hero",
  "layoutPattern": "Split_Right_Image",
  "themeTokens": {
    "colors": { "accent": "var(--brand-primary)" },
    "spacing": "var(--space-md)"
  },
  "atoms": [
    {
      "type": "button",
      "role": "cta-main",
      "computedStyles": { "borderRadius": "8px" },
      "content": "Get Started"
    }
  ]
}
```

**现状：** atoms_dsl 已用于 Cards/Feature/Testimonials/Logo/FAQ/CTA/Pricing/FeatureWithMedia。

**计划增强：** semanticRole + layoutPattern + styleIntent。

---

### 3.2 资产清洗规则（The De‑styler）

新增清洗步骤（在 `build.py` 前）：

- **版权清理**：Logo/品牌图片替换为高质占位
- **字体中性化**：闭源字体映射为系统/Google Fonts
- **资源路径标准化**：绝对 URL → 相对路径

> 状态：规划中。

---

## 4. 商业化复用方案（面向下游 AI 项目）

### 4.1 智能匹配引擎（Matching API）

输入：`行业=SaaS, 风格=科技感, 需要功能=定价表`

输出：
- 匹配的 `Puck JSON 模板`
- 推荐 `Theme JSON`

### 4.2 适配器层（Adapter）

```ts
function adaptAsset(originalBlock, targetTheme) {
  const themedBlock = applyTheme(originalBlock, targetTheme);
  const sanitizedBlock = contentSafetyFilter(themedBlock);
  return sanitizedBlock;
}
```

---

## 5. 可商用保障措施

### 5.1 版权合规闭环

- 资产指纹去重
- 自动差异化（5% 微调圆角/间距）

### 5.2 Human‑in‑the‑Loop

- 提供审核看板：Approve → asset‑library
- 手动校正语义标签/异常组件

### 5.3 多端响应式验证

- 320 / 768 / 1024 / 1440 四端截图 diff

---

## 6. 当前实现的系统架构（与代码一致）

### 6.1 资产分层

- **原始采集层**：DOM、截图、bbox、atoms
- **理解抽取层**：Markdown + computed styles + theme tokens
- **结构化中间层**：atoms_dsl
- **构建输出层**：sections.json + page.json
- **验证评估层**：visual‑qa diff + attribution + auto‑repair iter

### 6.2 资产路径归档

全部资产落在：`asset-factory/out/<site>/`

- `capture/`：截图 + dom + sections + atoms.json
- `atoms/<page>/atoms_dsl.json`
- `extract/`
- `pages/<page>/sections.json` / `page.json`
- `theme/`
- `visual-qa/`
- `work/`（auto‑repair iter）

### 6.3 渲染读取策略

- `/render` 默认读取最新 `work/puck.iter.*.json`
- 无 iter 则回退到 `page.json`

### 6.4 Creation 生成编排（Builder/Architect）

- LangGraph 编排：Architect → Builder → 汇总输出
- Architect 输出：`theme + pages + sections + designNorthStar`（严格 JSON）
- designNorthStar 必须基于用户输入动态生成，禁止硬编码特定行业或示例内容
- Builder 按 section 生成：共享 theme/manifest/designNorthStar/themeClassMap/motionPresets
- 并发控制：`OPENROUTER_MAX_CONCURRENCY`（默认 3）
- Builder 输出格式：两行 NDJSON（component + block）
- 解析与容错：NDJSON 解析 + JSON 抽取兜底
- 结构校验：layoutHint + Composition Preset Rules 验证 grid/gap/对齐
- 对齐约束：从 themeContract.layoutRules.sectionAlignOverrides 注入（按 section type/id），仅在 alignLocked=true 时强校验
- 场景切换：Showcase/Scenes 统一使用 SceneSwitcher（≤3 Tabs，>3 Carousel），避免手写轮播
- 组件 API 约束：在 builder prompt 中显式声明 SceneSwitcher/ComparisonSlider 的 props 形态，避免 LLM 产出错误字段
- 组件兼容层：SceneSwitcher 兼容 label/imageUrl/content；ComparisonSlider 兼容 beforeImage/afterImage 别名，缺失图片时安全返回
- 失败策略：最多 3 次重试；最终失败使用简化修复提示重试
- 失败占位：插入 `CreationErrorSection`，errors 记录 failureType
- 组件去重：按 name 去重，冲突记录 `builder_component_conflict:*`

---

### 6.5 Planning-with-Files 与恢复机制（P2W 生成）

**已落地：**
- P2W 生成阶段输出规划文件：`task_plan.md` / `findings.md` / `progress.md` / `planning_state.json`
- 支持 **resume**：已完成的 sections 通过 `planning_state.json` 跳过，组件与区块可复用
- `planning_state.json` 作为机器可读 checkpoint，避免解析 Markdown

**实现位置：**
- `builder/src/lib/agent/planning-files.ts`：规划文件与 checkpoint 维护
- `builder/src/lib/agent/p2w-graph.ts`：architect/builder 生成前恢复 + 生成后写入
- `builder/src/app/api/creation/route.ts`：支持 `resumeId` 并保证 outDir 持久化

**输出路径：**
- `asset-factory/out/p2w/<id>/planning_state.json`
- `asset-factory/out/p2w/<id>/task_plan.md`
- `asset-factory/out/p2w/<id>/findings.md`
- `asset-factory/out/p2w/<id>/progress.md`

---

## 7. 本轮整改交付清单（已落地）

### 7.1 高保真采集与风格迁移
- capture 优先合并（HIGH_FIDELITY 模式下避免 extract 覆盖真实媒体/样式）
- 伪元素背景 + 渐变采集，支持背景视频/背景图
- computed styles 参与主题 token 与字号蒸馏

### 7.2 视觉拆分与布局拓扑
- 视觉拆分升级：不限于 `main > *`，扩展 selector + 去重
- 产出 `section_groups.json`，含 `layout_type` 与交互热区
- layout_type 参与映射：split/grid → HeroSplit/FeatureWithMedia/CardsGrid

### 7.3 模板能力升级
- **HeroSplit**：新增 block + schema + mapping
- **MediaBackdrop**：CardsGrid/FeatureWithMedia 背景媒体叠层
- **MediaCard**：媒体卡优先使用 images/headings/links
- **SceneSwitcher**：场景切换组件，内置 Tabs/Carousel 策略（按 items 数量自动切换）
- 字体与字号蒸馏：heading/body size 与字体注入

### 7.4 Atomic 资产化（已可用）
- atoms_dsl → atomics.json
- 原子资产入库：`asset-library/atomic`
- Puck 注册 AtomicText / AtomicButton / AtomicImage

### 7.5 多端视觉 QA（已可用）
- desktop + mobile 双端截图与 diff

### 7.6 设计系统强制执行与布局纠偏（已落地）

**生成期（Builder/Agent）**
- 统一 props 归一化：间距/字号/圆角/阴影/颜色映射到规范刻度与 CSS 变量
- 结构化变体规范：CardsGrid / FeatureGrid / Testimonials / Pricing / CaseStudies 等按内容数量自动落到标准列数与 variant
- Hero/CTA/Logo/FAQ/Footer/Navbar 变体自动纠偏（variant 不合法时按内容特征修正）
- 生成期写入归一化摘要日志：`[design-system] normalized props summary`

**运行期（Render / Editor / Creation Sandbox）**
- 渲染前对 Puck data 再次归一化，确保编辑器与渲染结果一致
- 变更 diff 可追踪（每个 block 的 props 归一化前后差异）

**示例日志（摘要 + diff）**
```
[design-system] normalized Footer { background: { from: "#fff", to: "hsl(var(--background))" }, variant: { from: "grid", to: "multiColumn" } }
[design-system] normalized props summary background:4, variant:6, columns:3, paddingY:2
```

**关键规则清单（摘要）**
- Spacing：4px 倍数（4/8/12/16/24/32/48/64/80/96/128）
- Font size：限定 xs/sm/base/lg/xl/2xl/3xl/4xl/5xl/6xl
- Color：HEX/RGB/HSL → CSS 变量（--background/--foreground/--primary/--border）
- Radius：→ `var(--radius)`；Shadow：→ 标准 soft shadow
- Max items：CardsGrid≤8，FeatureGrid≤6，Testimonials≤6，Pricing≤3，CaseStudies≤6，Logo≤16，FAQ≤8，Footer columns≤4

**变体纠偏规则表（摘要）**

| Block | 原始 props 条件 | 纠偏结果 |
|---|---|---|
| HeroCentered | 有 media | `variant=withMedia` |
| HeroCentered | 有 badges 且无 media | `variant=withBadges` |
| HeroCentered | 无 media/无 badges | `variant=textOnly` |
| HeroSplit | media.kind=video | `variant=video` |
| HeroSplit | media.kind=image/缺失 | `variant=image` |
| LeadCaptureCTA | background=muted/gradient 或 emphasis=high | `variant=card` |
| LeadCaptureCTA | 其他 | `variant=banner` |
| LogoCloud | logos≥8 | `variant=marquee` |
| LogoCloud | logos<8 | `variant=grid` |
| Navbar | 有 ctas | `variant=withCTA` |
| Navbar | 有子菜单 | `variant=withDropdown` |
| Navbar | 其他 | `variant=simple` |
| Footer | columns≤2 | `variant=simple` |
| Footer | columns>2 | `variant=multiColumn` |
| FAQAccordion | items≤4 | `variant=singleOpen` |
| FAQAccordion | items>4 | `variant=multiOpen` |
| CardsGrid | columns 非 2/3/4 | 根据 items 数量归一化 |
| FeatureGrid | variant 非 2/3/4 | 根据 items 数量归一化 |
| TestimonialsGrid | variant 非 2/3 | 根据 items 数量归一化 |
| PricingCards | variant 非 2up/3up/withToggle | 根据 plans 数量归一化 |
| CaseStudies | variant 非 cards/list | 根据 items 数量归一化 |

**归一化前后对比示例（文字版）**

```
Before:
  CardsGrid.columns = "5col"
  CardsGrid.items.length = 11
  backgroundColor = "#ffffff"
  borderRadius = "10px"
  boxShadow = "0 12px 40px rgba(0,0,0,0.2)"
After:
  CardsGrid.columns = "4col"
  CardsGrid.items.length = 8
  backgroundColor = "hsl(var(--background))"
  borderRadius = "var(--radius)"
  boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.1)"
```

**实现位置**
- `builder/src/lib/design-system-enforcer.ts`：归一化规则、max-items 约束、summary 输出
- `builder/src/lib/agent/p2w-graph.ts`：生成期归一化 + summary 写入 `builder/logs/creation.log`
- `builder/src/app/render/render-client.tsx`、`builder/src/app/editor/editor-client.tsx`、`builder/src/app/creation/sandbox-client.tsx`：运行期归一化
- `verify_outputs` 聚合相似度结果

### 7.6 Creation 生成编排升级（已落地）
- Architect/Builder 解耦为 section 级生成，减小上下文与输出尺寸
- Builder 输出切换为 NDJSON，配套解析兜底与修复提示
- 加入 layoutHint/Composition Preset Rules 校验，阻断结构不合规输出
- 失败占位组件与错误归因打点，保证页面顺序稳定
- 规划文件 + checkpoint 允许断点续生成（resumeId）

### 7.7 信息增强 PlanningAgent（已落地，单轮）
- Extractor → Enricher → Requirement Generator，一次性完成信息补全
- 生成 `extracted.json` / `enriched.json` / `requirement.json` / `plan.json`
- 通过 `--plan-input/--plan-output` 在 pipeline 入口执行（无多轮对话）

### 7.8 整站模板静态组件注册链路（已落地）

为保证整站模板在生产环境可构建、可部署、可编辑，新增与单页模板一致的静态化链路：

`LLM 生成代码 -> 写入 src/components/blocks/*/block.tsx -> 注册到 puck/config.ts -> next build`

**目标与收益（与单页模板做法对齐）**
- 视觉保真度：高（仍由 LLM 生成组件代码）
- Puck 编辑：`fields/defaultProps` 在配置中显式注册，编辑能力完整
- 构建可用性：标准 Next.js 构建链路可直接消费
- 部署兼容：可直接衔接 Cloudflare Pages 的静态部署流程
- 性能：首屏无运行时 JIT 编译开销
- SSR/SSG：继续使用 `<Render config={config} data={data} />`

**实现要点**
1. **模板工厂主流程接线**
   - `run-template-factory` 在生成完成后调用物化流程：
     - 从 `payload.json` 读取组件代码
     - 写入 `src/components/blocks/<kebab>/block.tsx`
     - 生成并覆盖 `src/puck/config.generated.ts`
2. **Puck 配置合并策略**
   - `src/puck/config.ts` 静态导入 `./config.generated`
   - 使用 `Object.assign(puckConfig.components, generatedComponents)` 合并
   - 新增 `src/puck/config.generated.ts` 空导出兜底，避免首轮无生成文件时报错
3. **多站/多页命名冲突治理**
   - 同名同代码：去重跳过
   - 同名不同代码：自动追加哈希后缀（如 `_a1b2c3d4`）生成新组件名
   - 产出冲突追踪字段：`collisionFrom`、`signature`
4. **构建验证门禁**
   - 脚本语法检查：`node --check`
   - 构建检查：`next build` 必须通过

**关键文件（本次新增/改造）**
- `builder/template-factory/run-template-factory.mjs`
- `builder/template-factory/materialize-custom-components.mjs`
- `builder/src/puck/config.ts`
- `builder/src/puck/config.generated.ts`

---

## 8. 运行指南（Runbook）

### 8.1 高保真采集 + 重建
```bash
python3 asset-factory/pipelines/run.py \
  --url https://kymetacorp.com \
  --fill-props \
  --auto-repair \
  --high-fidelity
```

### 8.2 模板 + Atomic 同步入库
```bash
python3 asset-factory/pipelines/run.py \
  --url https://kymetacorp.com \
  --high-fidelity \
  --library
```

### 8.3 仅生成 Atomic 资产
```bash
python3 asset-factory/pipelines/run.py \
  --url https://kymetacorp.com \
  --high-fidelity \
  --atomics
```

### 8.4 规划文件生成（PlanningAgent）
```bash
python3 asset-factory/pipelines/run.py \
  --url https://kymetacorp.com \
  --plan-input "你的产品需求描述" \
  --plan-output asset-factory/out/kymetacorp.com/planning
```

### 8.5 整站模板静态组件物化与构建验证
```bash
# 在 builder 目录执行
node template-factory/materialize-custom-components.mjs --run-dir template-factory/runs/<run-id>
npm run build
```

如需覆盖已存在 block 文件：
```bash
node template-factory/materialize-custom-components.mjs --run-dir template-factory/runs/<run-id> --overwrite
```

---

## 9. 产物路径清单

- 模板：`asset-factory/out/<site>/pages/<page>/page.json`
- 结构化中间层：`asset-factory/out/<site>/pages/<page>/sections.json`
- 原子资产：`asset-factory/out/<site>/atomics/<page>/atomics.json`
- 资产库：`asset-factory/out/<site>/asset-library/`
- 视觉 QA：`asset-factory/out/<site>/visual-qa/`
- 规划输出：`asset-factory/out/<site>/planning/`（extract/enrich/requirement/plan）
- P2W 规划输出：`asset-factory/out/p2w/<id>/`（task_plan/findings/progress/planning_state）

---

## 10. CLI 参数与环境变量

### 10.1 CLI 参数（asset-factory/pipelines/run.py）
- `--url`：目标 URL（必填）
- `--discover`：自动发现 URL（sitemap/链接）
- `--max-pages`：发现模式页面上限
- `--output`：输出目录（默认 `asset-factory/out`）
- `--registry`：Block registry 路径
- `--fill-props`：启用 LLM props 填充
- `--auto-repair`：启用视觉自动修复
- `--library`：资产入库（模板 + atomic）
- `--atomics`：仅生成/入库 atomic 资产
- `--semantic-override`：语义覆盖文件
- `--high-fidelity`：高保真模式
- `--plan-input`：运行信息增强与规划（单轮）
- `--plan-output`：规划输出目录（默认 `out/<domain>/planning`）

### 10.2 环境变量
- `AUTO_REPAIR=1`
- `HIGH_FIDELITY=1`
- `CAPTURE_KEEP_MEDIA=1`
- `DESTYLE=0`
- `STRUCTURE_REPAIR_MODE=off|reorder|regroup`
- `AUTO_USE_LATEST_ITER=0`
- `VISUAL_QA_TIMEOUT_MS`
- `VISUAL_QA_WAIT_UNTIL`
- `VISUAL_QA_STABILIZE_TIMEOUT_MS`
- `ASSET_LIBRARY=1`
- `ATOMIC_LIBRARY=1`
- `OPENROUTER_MODEL`
- `OPENROUTER_MODEL_FALLBACK`
- `OPENROUTER_MAX_TOKENS`
- `OPENROUTER_MAX_CONCURRENCY`
- `OPENROUTER_TIMEOUT_MS`
- `OPENROUTER_MAX_RETRIES`

---

## 11. 资产字段规范（核心 JSON）

### 11.1 sections.json
- `sections[]`：block 列表
  - `type`/`variant`/`props`
  - `layout_schema` / `layout_type`
  - `semantic_role` / `layout_pattern`
  - `content_constraints`

### 11.2 page.json
- `root.props.branding`：主题色/字体/圆角
- `content[]`：Puck 组件实例
- `meta.font_links` / `meta.font_css`

### 11.3 atoms_dsl.json
- `sections[].semanticRole`
- `sections[].layoutPattern`
- `sections[].atoms[]`（含 normalizedStyles）

### 11.4 atomics.json
- `items[]`：atomic 组件资产
  - `type`/`text`/`href`/`src`
  - `semantic_role` / `layout_pattern`
  - `embeddings.text` / `embeddings.image`

---

## 12. 质量指标与验收标准

### 12.1 视觉一致性
- `visual-qa` similarity ≥ 0.70（MVP）
- 标杆站点 ≥ 0.80

### 12.2 结构一致性
- layout_schema 匹配率 ≥ 0.80
- hero/cta/footer 必须存在

### 12.3 主题一致性
- tokens.json 覆盖 colors/typography/radius
- heading/body 字体匹配率 ≥ 0.80

---

## 13. FAQ / 排障

### 13.1 重建站背景黑屏
- 确认 `--high-fidelity`
- 检查 `capture/sections.json` 是否有 `backgrounds`/`videos`
- 确认 render 是否加载最新 iter

### 13.2 字体不一致
- 检查 `extract/font_links` 与 `meta.font_css`
- 确认 `theme.css` 是否注入

### 13.3 iter 未生效
- 访问 render 时不带 `iter` 参数
- 确认 `AUTO_USE_LATEST_ITER!=0`

### 13.4 diff 结果异常
- 检查 render server 是否正常
- 确认 visual-qa 输出目录存在

---

## 14. 当前功能清单（已落地）

- computed styles + atoms 采集
- atoms_dsl 生成
- atoms_dsl 驱动 props：
  - CardsGrid / FeatureGrid / LogoCloud / TestimonialsGrid
  - PricingCards / FeatureWithMedia / FAQAccordion / LeadCaptureCTA
- CTA 链接过滤、列数推断、文案截断
- visual‑qa 输出迁移到 asset‑factory/out/<site>/visual‑qa
- auto‑repair iter 写入 asset‑factory/out/<site>/work，并自动回写
- Creation 生成：section 级 Builder 并发编排 + NDJSON 输出
- Builder 失败自动修复提示与占位区块兜底

---

## 15. 下一阶段路线图（建议）

1. **Semantic Tagger**（LLM + 规则）
2. **Design Token 聚类**（间距/色板/字体）
3. **资产入库模块（asset‑library）**
4. **跨主题渲染测试 & 内容压测**
5. **Human‑in‑the‑loop 看板**

---

## 16. 总结：商业价值

这套方案可以把“单次重建”升级为“持续进化的资产工厂”。

- **降本**：生成站点优先复用高质量资产
- **增质**：结构 + 风格 + 语义全栈一致
- **可扩展**：资产越多，越接近“行业级设计系统”

> 这将支撑一个可商用的 AI 建站 SaaS 体系。
