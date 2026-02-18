# AI 网站克隆与资产提取系统
## 完整技术方案 v2.0

**基于行业最佳实践的端到端解决方案**

---

## 目录

1. [执行摘要](#1-执行摘要)
2. [系统架构总览](#2-系统架构总览)
3. [数据产物分层](#3-数据产物分层)
4. [实施路径（分阶段落地）](#4-实施路径分阶段落地)
5. [技术栈与依赖](#5-技术栈与依赖)
6. [完整目录结构](#6-完整目录结构)
7. [关键模块详解](#7-关键模块详解)
8. [质量保证体系](#8-质量保证体系)
9. [使用指南](#9-使用指南)
10. [风险与缓解策略](#10-风险与缓解策略)
11. [未来扩展规划](#11-未来扩展规划)
12. [附录](#12-附录)

---

## 1. 执行摘要

本方案提供了一套完整的网站克隆与资产提取系统，旨在从目标网站自动提取设计系统、组件库和内容资产，并生成可在其他 AI 项目中复用的高质量模板。系统采用**"结构化约束 + 视觉反馈驱动"**的工程化路径，避免了传统 AI 生成方案中的"一次性生成"陷阱。

### 1.1 核心价值主张

- **高保真还原**：通过多层次采集策略，实现 90%+ 的视觉一致性
- **资产化复用**：生成可跨项目复用的原子组件和模板库，支持快速定制
- **自动化闭环**：集成视觉 QA 与自动修复，减少 70% 的人工调整时间
- **设计系统提取**：自动识别并归一化设计 tokens，确保品牌一致性

### 1.2 行业对标

| 维度 | 本方案 | Builder.io | Relume | Vercel v0 |
|------|---------|-----------|--------|-----------|
| **组件数量** | 20+ Block<br/>30+ Atomic | 自动索引 | 1000+ | shadcn 全集 |
| **样式提取** | ✅ Tailwind 归一化 | ✅ Design Tokens | ✅ 全局样式 | ✅ Tailwind |
| **布局识别** | ✅ CV + 拓扑分类 | ✅ CV + DOM | ✅ AI 分类 | ❌ 依赖提示 |
| **语义标注** | ✅ 完整标注 | ✅ 完整 | ✅ 2.0 突破 | ⚠️ 有限 |
| **视觉验证** | ✅ Diff + 归因 | ❌ 无 | ❌ 无 | ✅ 实时预览 |
| **自动修复** | ✅ 闭环迭代 | ❌ 手动 | ❌ 手动 | ✅ Quick Edit |

**评分：8.5/10** - 在视觉验证和自动修复方面领先行业，但需补充设计系统提取和语义化标注能力。

---

## 2. 系统架构总览

系统采用分层架构设计，每层职责清晰，支持独立优化和扩展。核心流程包括：**采集（Capture）→ 理解（Understand）→ 资产化（Assetize）→ 验证（Verify）→ 迭代（Iterate）**。

### 2.1 架构层次

#### A. 采集层（Capture Layer）

**技术栈**：Playwright + Chrome DevTools Protocol

**核心产物**：
- 全页与区块级截图（4K 分辨率）
- DOM snapshot 与结构化布局信息
- Computed styles 统计与 CSS 变量映射
- Atoms 原子节点（文本/图片/链接/按钮）
- 媒体资源（视频/背景图/SVG）与占位符生成

**降噪策略**：
- 禁用动画和过渡效果
- 固定 viewport（Desktop: 1440px, Mobile: 375px）
- 触发懒加载并等待网络空闲
- 捕获伪元素样式（::before/::after）

#### B. 理解层（Understand Layer）

**技术栈**：Crawl4AI + Custom NLP Pipeline

**核心产物**：
- 清洗后的 Markdown 与结构化文本
- 主题 tokens 采样（颜色/字体/间距/阴影/圆角）
- CSS 框架识别（Tailwind/Bootstrap/Custom）
- 布局拓扑分类（F型/Z型/居中/栅格）

#### C. 资产化层（Assetize Layer）

**核心产物**：
- **atoms_dsl（结构化中间层）**：面向组件的原子 JSON，驱动 props 生成
- **Block 注册表**：20+ 高复用组件（Hero/Feature/Cards/Pricing/FAQ 等）
- **Atomic 组件库**：Button/Badge/Card/Image/Media 等可组合单元
- **Theme 系统**：Tailwind-ready tokens 与 CSS 变量映射

#### D. 验证层（Verify Layer）

- 视觉回归测试（原站 vs Puck 渲染）
- Pixelmatch diff 生成与相似度评分
- 差异归因（结构/tokens/内容）
- 多端测试（Desktop/Mobile/Tablet）

#### E. 迭代层（Iterate Layer）

- 自动修复循环（最多 3 次迭代）
- 人工评审闸门（针对 missing_block/broken_images）
- 版本管理（puck.iter.*.json）

---

## 3. 数据产物分层

| 层次 | 产物 | 说明 |
|------|------|------|
| **原始采集层** | DOM snapshot<br/>全页/区块截图<br/>atoms.json | Playwright 采集的原始数据，包含完整的 DOM 结构、计算样式和媒体资源 |
| **理解抽取层** | Markdown 结构<br/>theme tokens<br/>computed_styles | Crawl4AI 提取的文本结构和样式统计，用于后续分析 |
| **结构化中间层** | atoms_dsl.json<br/>layout_topology | 面向组件的原子 JSON，包含布局拓扑信息，直接驱动 props 生成 |
| **构建输出层** | page.json<br/>sections.json<br/>theme.css | Puck 可渲染的配置文件，可直接用于页面构建和编辑 |
| **验证评估层** | visual-qa 报告<br/>diff 图像<br/>attribution.json | 视觉对比结果、差异归因和修复建议 |

---

## 4. 实施路径（分阶段落地）

本方案采用渐进式实施策略，确保每个阶段都能交付可验证的价值。**总周期约 21 天**，可根据资源情况调整。

### Phase 0：快速止血（1-3 天）

**目标**：解决当前最严重的视觉偏差问题，提升首屏还原度至 70%+

#### 核心任务

**1. 启用高保真模式**
- 保留所有媒体资源（不压缩/不占位）
- 禁用 destyle 预处理
- 捕获伪元素背景（::before/::after）

**2. Capture 优先合并策略**
- Capture 数据覆盖 Extract 结果
- 保留真实 computed styles
- 视频背景使用 data-src 属性

**3. CSS 变量映射（新增）**
- 识别 --primary/--secondary 等全局变量
- 生成变量依赖图
- 支持一键换肤

**4. CSS 框架识别（新增）**
- 检测 Tailwind/Bootstrap/Bulma 等
- 为后续归一化提供依据

```python
def capture_with_css_variables(url):
    """Phase 0: 高保真采集 + CSS 变量映射"""
    page = await browser.new_page()
    
    # 1. 禁用样式降噪
    await page.add_init_script("""
        window.DISABLE_DESTYLE = true;
        window.PRESERVE_MEDIA = true;
    """)
    
    # 2. 捕获 CSS 变量
    css_vars = await page.evaluate("""
        () => {
            const styles = getComputedStyle(document.documentElement);
            const vars = {};
            for (let i = 0; i < styles.length; i++) {
                const prop = styles[i];
                if (prop.startsWith('--')) {
                    vars[prop] = styles.getPropertyValue(prop).trim();
                }
            }
            return vars;
        }
    """)
    
    # 3. 识别 CSS 框架
    framework = detect_css_framework(page)
    
    return {
        "css_variables": css_vars,
        "framework": framework,  # "tailwind" | "bootstrap" | "custom"
        "screenshots": {...},
        "dom": {...}
    }
```

#### 验收标准

| 指标 | 目标值 |
|------|--------|
| 首屏背景一致性 | 提升至 80%+（当前约 50%） |
| 关键媒体不丢失 | 视频/大图 100% 保留 |
| CSS 变量完整性 | 识别率 > 90% |
| 框架识别准确度 | > 95%（基于已知网站测试） |

---

### Phase 1：拆分升级（3-7 天）

**目标**：将 Section 拆分准确度从 60% 提升至 90%+，确保区块边界与原站一致

#### 核心任务

**1. 视觉分区算法**
- 替换 'main > *' 选择器为智能分区
- 基于 vertical gap（>100px）切分
- 识别语义边界（<section>/<article> 标签）
- 处理嵌套布局（Grid/Flex）

**2. 布局拓扑识别（新增）**
- 使用 CV 模型分类布局类型
- 标注：F型/Z型/居中/左右分栏/栅格
- 为 Phase 2 映射提供语义提示

**3. 输出标准化**
- 生成 section_groups.json
- 包含 bbox/screenshot/layout_type
- 支持人工校正接口

```python
def split_sections_with_topology(page_screenshot, dom):
    """Phase 1: 视觉分区 + 布局拓扑识别"""
    
    # 1. 视觉分区（基于截图 + DOM）
    gaps = detect_vertical_gaps(page_screenshot, threshold=100)
    semantic_boundaries = find_semantic_tags(dom, ['section', 'article', 'main'])
    
    sections = []
    for i, (start, end) in enumerate(merge_boundaries(gaps, semantic_boundaries)):
        section_img = crop_screenshot(page_screenshot, start, end)
        
        # 2. 布局拓扑分类（新增）
        layout_type = classify_layout_topology(section_img)
        # 返回：{"type": "left_text_right_media", "grid": {"cols": 3}, ...}
        
        sections.append({
            "id": f"section_{i}",
            "bbox": {"top": start, "bottom": end},
            "screenshot": section_img,
            "layout_topology": layout_type,  # 新增
            "dom_nodes": extract_nodes(dom, start, end)
        })
    
    return {"sections": sections}

def classify_layout_topology(section_img):
    """使用 CV 模型分类布局"""
    features = extract_visual_features(section_img)
    
    if features['has_large_image_left'] and features['text_right']:
        return {"type": "left_media_right_text", "hierarchy": "media_dominant"}
    elif features['centered_text'] and not features['has_images']:
        return {"type": "centered_text", "hierarchy": "text_only"}
    # ... 更多规则
    
    return {"type": "unknown", "hierarchy": "mixed"}
```

#### 验收标准

| 指标 | 目标值 |
|------|--------|
| Section 数量准确度 | ± 1 个（与原站对比） |
| 边界位置偏差 | < 50px |
| 布局类型识别 | > 85% 准确度 |
| Mapping 偏差下降 | 从 40% 降至 20% |

---

### Phase 1.5：设计系统提取（新增，2-3 天）

**目标**：提取完整设计系统，为 Phase 2 的 Tailwind 归一化和 Phase 3 的跨站复用奠定基础

#### 核心任务

**1. Token 提取与归一化**
- **颜色系统**：Primary/Secondary/Accent + 语义色
- **间距刻度**：识别使用的 spacing scale（4/8/16/24...）
- **排版系统**：字体族/字号层级/行高/字重
- **阴影/圆角**：提取并聚类相似值

**2. Pattern Library**
- 识别常见组合模式（如"标题+副标题+CTA"）
- 生成 pattern spec（可直接用于新项目）

**3. 输出标准化**
- theme/tokens.json（完整 token 定义）
- theme/tailwind.config.js（可直接使用）
- patterns/*.pattern.json（可复用模式）

```python
def extract_design_system(computed_styles_stats, css_variables):
    """Phase 1.5: 设计系统提取"""
    
    # 1. 颜色系统提取
    colors = cluster_colors(computed_styles_stats['color'])
    color_tokens = {
        "primary": detect_primary_color(colors, css_variables),
        "secondary": detect_secondary_color(colors),
        "accent": detect_accent_color(colors),
        "semantic": {
            "success": find_semantic_color(colors, "green"),
            "warning": find_semantic_color(colors, "yellow"),
            "error": find_semantic_color(colors, "red")
        }
    }
    
    # 2. 间距刻度识别
    spacing_values = extract_spacing(computed_styles_stats)
    spacing_scale = detect_spacing_scale(spacing_values)
    # 例如：[4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
    
    # 3. 排版系统
    typography = {
        "fontFamily": {
            "sans": detect_primary_font(computed_styles_stats),
            "serif": detect_serif_font(computed_styles_stats),
            "mono": detect_mono_font(computed_styles_stats)
        },
        "fontSize": cluster_font_sizes(computed_styles_stats['fontSize']),
        "fontWeight": extract_used_weights(computed_styles_stats),
        "lineHeight": calculate_line_height_scale(computed_styles_stats)
    }
    
    # 4. 生成 Tailwind 配置
    tailwind_config = generate_tailwind_config({
        "colors": color_tokens,
        "spacing": spacing_scale,
        "typography": typography,
        "borderRadius": cluster_values(computed_styles_stats['borderRadius']),
        "boxShadow": extract_shadows(computed_styles_stats)
    })
    
    return {
        "tokens": {...},
        "tailwind_config": tailwind_config,
        "patterns": extract_patterns(sections)
    }
```

#### 验收标准

| 指标 | 目标值 |
|------|--------|
| Token 提取完整性 | 覆盖 95%+ 使用场景 |
| Tailwind 配置可用性 | 可直接用于新项目构建 |
| 间距刻度识别 | 准确识别 base unit（4px/8px） |
| Pattern 识别数量 | > 5 个可复用模式 |

---

### Phase 2：模板能力升级（7-14 天）

**目标**：补齐高频场景的 Block 变体，提升结构匹配度至 80%+，并实现 Tailwind 归一化

#### 核心任务

**1. 新增高 ROI 变体**
- **HeroVideo**：视频背景 + overlay + gradient
- **MediaBackdropSection**：背景图/渐变 + 前景卡片
- **CardsGrid Enhanced**：新闻卡片/产品卡片/团队卡片
- **InteractiveTimeline**：垂直/水平时间线

**2. Tailwind 归一化（新增）**
- 强制将像素值映射为 Tailwind 类
- 示例：padding: 41px → py-10
- 生成干净、可维护的 props

**3. 语义化标注（新增）**
- 为每个 Block 添加 semantic 字段
- 标注：intent/tone/conversion_goal/industry

```javascript
// Phase 2: Tailwind 归一化示例
function normalizeTailwind(rawStyles, designTokens) {
  const mapper = new TailwindMapper(designTokens);
  
  return {
    // 间距归一化
    padding: mapper.spacing(rawStyles.padding),
    // 41px → "10" (Tailwind py-10 = 2.5rem = 40px，最接近)
    
    // 颜色归一化  
    backgroundColor: mapper.color(rawStyles.backgroundColor),
    // #2563EB → "blue-600"
    
    // 字号归一化
    fontSize: mapper.fontSize(rawStyles.fontSize),
    // 18px → "lg" (Tailwind text-lg = 1.125rem = 18px)
    
    // 圆角归一化
    borderRadius: mapper.borderRadius(rawStyles.borderRadius),
    // 12px → "xl" (Tailwind rounded-xl = 0.75rem = 12px)
  };
}

// Block 语义化标注示例
const blockMetadata = {
  "HeroVideo": {
    "semantic": {
      "intent": "product_launch",
      "tone": "professional_tech",
      "conversion_goal": "video_play",
      "industry": ["saas", "tech", "startup"]
    },
    "usage_context": "首屏，适合需要强烈视觉冲击的场景",
    "variants": ["center", "split", "fullscreen"]
  }
}
```

#### 验收标准

| 指标 | 目标值 |
|------|--------|
| 新增 Block 覆盖率 | 覆盖 80%+ 高频场景 |
| Tailwind 归一化率 | > 95%（所有 props） |
| 语义标注完整性 | 所有 Block 均有 semantic 字段 |
| 结构匹配度提升 | 从 60% 提升至 80%+ |

---

### Phase 3：Atomic 组件资产化（14-21 天）

**目标**：构建可跨项目复用的原子组件库，支持灵活组合和智能匹配

#### 核心任务

**1. Atomic 组件提取**
- **Button**：变体（primary/secondary/ghost）+ 尺寸 + 状态
- **Badge/Tag**：样式变体 + 图标支持
- **Card**：基础卡片 + 头部/内容/底部 slot
- **Image/Media**：响应式 + 占位符 + 懒加载
- **Input/Form**：表单元素 + 验证状态

**2. 语义索引系统（新增）**
- 为每个资产生成 embedding 向量
- 标注：industry/tone/conversion_goal
- 支持语义搜索（"我要一个高端金融风的 Hero"）

**3. 资产库架构**

```
/asset-library/
  /patterns/                 # 跨站点通用模式
    hero-cta.pattern.json
    feature-3col.pattern.json
  /components/               # 组件库索引
    /CardsGrid/
      metadata.json          # 使用统计、适用场景
      variants/
        3col-image-top.json
        4col-icon-left.json
    /Hero/
      metadata.json
      variants/
        video-background.json
        split-media.json
  /themes/                   # 主题聚类
    /saas-minimal/
      tokens.json
      components/            # 该主题下的组件
    /ecommerce-vibrant/
  /content-templates/        # 文案模板（已参数化）
    hero-headlines.json
    cta-copy.json
```

**4. 元数据规范**

```json
{
  "id": "hero-saas-001",
  "sourceUrl": "https://example.com",
  "extractedAt": "2026-01-27T10:30:00Z",
  "category": "hero",
  "tags": ["saas", "gradient-bg", "center-aligned", "video"],
  "complexity": "medium",
  "usageCount": 0,
  "qualityScore": 0.92,
  "responsive": true,
  "accessibility": "AA",
  "dependencies": ["Button", "Container", "GradientOverlay"],
  "semantic": {
    "intent": "product_launch",
    "tone": "professional_tech",
    "conversion_goal": "video_play",
    "industry": ["saas", "tech"]
  },
  "embedding": [0.123, -0.456, ...],
  "variants": [
    {
      "id": "hero-saas-001-v1",
      "description": "居中布局",
      "props": {...}
    }
  ]
}
```

#### 验收标准

| 指标 | 目标值 |
|------|--------|
| Atomic 组件数量 | > 30 个（覆盖常见场景） |
| 语义索引准确度 | > 85%（基于测试查询） |
| 跨项目复用成功率 | > 80%（需要的调整 < 20%） |
| 元数据完整性 | 100%（所有必填字段） |

---

### Phase 4：视觉 QA 闭环（持续优化）

**目标**：建立自动化验证与修复流程，将视觉一致性提升至 90%+，并减少 70% 人工调整时间

#### 核心任务

**1. 多端视觉测试**
- Desktop: 1440px, 1920px
- Mobile: 375px, 414px
- Tablet: 768px, 1024px

**2. 差异归因系统**
- **结构差异**：missing_block / bbox_shift / hierarchy_mismatch
- **Token 差异**：font/color/spacing/shadow 偏差
- **内容差异**：broken_images / failed_requests / text_overflow

**3. 自动修复策略**
- **规则修复**：简单 token 调整（颜色/间距）
- **LLM 修复**：复杂结构调整（需要上下文理解）
- **人工闸门**：missing_block 或 broken_images 触发

**4. 停止条件**
- Desktop + Mobile 均达目标相似度（> 90%）
- 提升不足（MIN_IMPROVEMENT < 2%）
- 触发人工评审
- 达到最大迭代次数（3 次）

```typescript
// Phase 4: 自动修复闭环
async function autoRepairLoop(siteKey: string, page: string) {
  let iteration = 0;
  const MAX_ITERATIONS = 3;
  const TARGET_SIMILARITY = 0.90;
  const MIN_IMPROVEMENT = 0.02;
  
  let prevSimilarity = 0;
  
  while (iteration < MAX_ITERATIONS) {
    // 1. 视觉对比
    const diffResult = await runVisualQA(siteKey, page);
    
    // 2. 检查停止条件
    if (diffResult.similarity.desktop > TARGET_SIMILARITY && 
        diffResult.similarity.mobile > TARGET_SIMILARITY) {
      console.log('✅ 达到目标相似度');
      break;
    }
    
    if (Math.abs(diffResult.similarity.desktop - prevSimilarity) < MIN_IMPROVEMENT) {
      console.log('⚠️ 提升不足，停止迭代');
      break;
    }
    
    // 3. 差异归因
    const attribution = await attributeDifferences(diffResult);
    
    // 4. 触发人工评审闸门
    if (attribution.critical_issues.length > 0) {
      console.log('🚨 发现关键问题，需要人工评审');
      await notifyHumanReview(attribution.critical_issues);
      break;
    }
    
    // 5. 生成修复方案
    const patch = await generatePatch(attribution);
    
    // 6. 应用修复
    await applyPatch(siteKey, page, patch, iteration);
    
    prevSimilarity = diffResult.similarity.desktop;
    iteration++;
  }
  
  return { finalSimilarity: diffResult.similarity, iterations: iteration };
}
```

#### 验收标准

| 指标 | 目标值 |
|------|--------|
| Desktop 相似度 | > 90% |
| Mobile 相似度 | > 90% |
| 自动修复成功率 | > 70%（无需人工） |
| 平均迭代次数 | < 2 次 |

---

## 5. 技术栈与依赖

| 类别 | 技术 | 用途 |
|------|------|------|
| **前端渲染** | Next.js 14<br/>React 18<br/>Tailwind CSS<br/>shadcn/ui | 页面渲染、组件系统、样式框架和 UI 组件库 |
| **编辑器** | Puck Editor<br/>Magic UI | 可视化编辑和动效组件 |
| **爬取采集** | Playwright<br/>Crawl4AI<br/>Chrome DevTools Protocol | 页面采集、DOM 分析、截图生成和文本提取 |
| **视觉处理** | OpenCV<br/>pixelmatch<br/>pngjs<br/>sharp | 图像处理、像素对比、布局识别 |
| **AI/ML** | OpenRouter<br/>Sentence Transformers<br/>CLIP | LLM 结构化输出、语义搜索、视觉分类 |
| **数据处理** | Python 3.11+<br/>Node.js 18+<br/>TypeScript | Pipeline 脚本、数据转换、类型安全 |
| **存储** | JSON<br/>File System<br/>SQLite (可选) | 资产存储、元数据索引 |

---

## 6. 完整目录结构

```
/shipitto-toolchain/
├── asset-factory/              # 资产工厂（核心流水线）
│   ├── blocks/                 # Block 注册表
│   │   ├── registry.json       # 所有 Block 定义
│   │   ├── variants/           # Block 变体 prompts
│   │   └── schemas/            # Block Props JSON Schema
│   ├── pipelines/              # 流水线脚本
│   │   ├── capture.py          # Phase 0 采集
│   │   ├── extract.py          # Phase 1 理解
│   │   ├── design_system.py    # Phase 1.5 设计系统提取（新增）
│   │   ├── map.py              # Phase 2 映射
│   │   ├── build.py            # Phase 2 构建
│   │   └── verify.py           # Phase 4 验证
│   ├── utils/
│   │   ├── tailwind_mapper.py  # Tailwind 归一化（新增）
│   │   ├── layout_classifier.py # 布局拓扑识别（新增）
│   │   └── semantic_indexer.py # 语义索引（新增）
│   └── out/                    # 站点资产输出
│       └── <site_key>/
│           ├── capture/        # 原始采集
│           ├── atoms/          # atoms_dsl
│           ├── extract/        # 文本结构
│           ├── design-system/  # 设计系统（新增）
│           │   ├── tokens.json
│           │   ├── tailwind.config.js
│           │   └── patterns/
│           ├── pages/          # Puck JSON
│           ├── theme/          # Theme tokens
│           ├── visual-qa/      # QA 结果
│           └── work/           # 迭代版本

├── asset-library/              # 跨站点资产库（新增）
│   ├── patterns/               # 通用模式
│   ├── components/             # 组件索引
│   │   ├── CardsGrid/
│   │   │   ├── metadata.json
│   │   │   └── variants/
│   │   └── Hero/
│   ├── themes/                 # 主题聚类
│   └── content-templates/      # 文案模板

├── builder/                    # Puck 渲染器
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/          # shadcn wrappers
│   │   │   └── blocks/         # Block 实现
│   │   ├── puck/               # Puck config
│   │   └── app/
│   │       ├── editor/         # 编辑器
│   │       └── render/         # 渲染端点
│   └── public/theme/           # Global theme

├── visual-qa/                  # 视觉 QA 工具
│   └── scripts/
│       ├── capture.ts          # 截图采集
│       ├── diff.ts             # pixelmatch diff
│       ├── attribution.ts      # 差异归因
│       └── run-loop.ts         # 自动修复闭环

└── scripts/
    ├── run_excel_pipeline.py   # Excel 批量处理
    └── search_assets.py        # 资产搜索 API（新增）
```

---

## 7. 关键模块详解

### 7.1 Tailwind 归一化引擎

```python
class TailwindMapper:
    """将像素值映射为 Tailwind 类"""
    
    def __init__(self, design_tokens):
        self.spacing_scale = design_tokens['spacing']  # [4,8,16,24,32,48,64,96,128]
        self.color_tokens = design_tokens['colors']
        self.font_sizes = design_tokens['typography']['fontSize']
    
    def spacing(self, px_value: int) -> str:
        """
        将像素值映射为最接近的 Tailwind spacing
        41px → "10" (Tailwind: 2.5rem = 40px)
        """
        rem_value = px_value / 16
        tailwind_value = round(rem_value * 4)  # Tailwind 以 0.25rem 为单位
        return str(tailwind_value)
    
    def color(self, hex_color: str) -> str:
        """
        将 hex 颜色映射为 Tailwind 颜色
        #2563EB → "blue-600"
        """
        # 1. 检查是否匹配 theme tokens
        if hex_color in self.color_tokens:
            return self.color_tokens[hex_color]
        
        # 2. 计算与 Tailwind 默认调色板的距离
        closest_color = find_closest_tailwind_color(hex_color)
        return closest_color  # e.g., "blue-600"
    
    def fontSize(self, px_value: int) -> str:
        """18px → "lg" (Tailwind: 1.125rem = 18px)"""
        size_map = {12: "xs", 14: "sm", 16: "base", 18: "lg", 20: "xl", 24: "2xl"}
        return size_map.get(px_value, "base")
    
    def borderRadius(self, px_value: int) -> str:
        """12px → "xl" (Tailwind: 0.75rem = 12px)"""
        radius_map = {2: "sm", 4: "", 6: "md", 8: "lg", 12: "xl", 16: "2xl", 9999: "full"}
        return radius_map.get(px_value, "")

# 使用示例
def normalize_block_props(raw_props, design_tokens):
    mapper = TailwindMapper(design_tokens)
    
    normalized = {
        "padding": {
            "top": mapper.spacing(raw_props['paddingTop']),
            "bottom": mapper.spacing(raw_props['paddingBottom'])
        },
        "backgroundColor": mapper.color(raw_props['backgroundColor']),
        "fontSize": mapper.fontSize(raw_props['fontSize']),
        "borderRadius": mapper.borderRadius(raw_props['borderRadius'])
    }
    
    return normalized
```

### 7.2 语义索引与搜索

```python
from sentence_transformers import SentenceTransformer
import numpy as np

class SemanticAssetSearch:
    """基于语义的资产搜索引擎"""
    
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.asset_index = []  # [(asset_id, embedding, metadata), ...]
    
    def index_asset(self, asset_id, description, metadata):
        """为资产生成 embedding 并索引"""
        # 组合文本
        text = f"{description} {metadata.get('tags', [])} {metadata.get('semantic', {}).get('tone', '')}"
        embedding = self.model.encode(text)
        
        self.asset_index.append({
            "id": asset_id,
            "embedding": embedding,
            "metadata": metadata
        })
    
    def search(self, query, top_k=5, filters=None):
        """
        语义搜索
        query: "我要一个高端金融风的 Hero 区块，带视频背景"
        filters: {"category": "hero", "responsive": true}
        """
        # 1. 生成查询 embedding
        query_embedding = self.model.encode(query)
        
        # 2. 计算相似度
        results = []
        for item in self.asset_index:
            # 应用过滤器
            if filters and not self._match_filters(item['metadata'], filters):
                continue
            
            similarity = np.dot(query_embedding, item['embedding'])
            results.append({
                "id": item['id'],
                "similarity": float(similarity),
                "metadata": item['metadata']
            })
        
        # 3. 排序并返回
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]
    
    def _match_filters(self, metadata, filters):
        for key, value in filters.items():
            if metadata.get(key) != value:
                return False
        return True

# 使用示例
searcher = SemanticAssetSearch()

# 索引资产
searcher.index_asset(
    "hero-saas-001",
    "Video background hero with gradient overlay",
    {
        "category": "hero",
        "tags": ["saas", "video", "gradient"],
        "semantic": {"tone": "professional_tech", "industry": ["saas"]},
        "responsive": True
    }
)

# 搜索
results = searcher.search(
    "我要一个专业科技风格的首屏，带视频",
    filters={"category": "hero", "responsive": True}
)
# 返回：[{"id": "hero-saas-001", "similarity": 0.82, ...}]
```

### 7.3 布局拓扑识别

```python
import cv2
import numpy as np

class LayoutTopologyClassifier:
    """识别区块的布局拓扑类型"""
    
    def classify(self, section_img_path):
        """
        分类布局类型
        返回：{"type": "left_media_right_text", "grid": {...}, "hierarchy": "..."}
        """
        img = cv2.imread(section_img_path)
        
        # 1. 检测图像区域
        image_regions = self._detect_images(img)
        
        # 2. 检测文本块
        text_blocks = self._detect_text_blocks(img)
        
        # 3. 计算布局特征
        features = {
            "has_large_image": any(r['area'] > img.shape[0] * img.shape[1] * 0.3 for r in image_regions),
            "image_left": any(r['center_x'] < img.shape[1] * 0.4 for r in image_regions),
            "image_right": any(r['center_x'] > img.shape[1] * 0.6 for r in image_regions),
            "centered_text": self._is_centered(text_blocks, img.shape[1]),
            "grid_layout": self._detect_grid(image_regions + text_blocks)
        }
        
        # 4. 规则分类
        if features['image_left'] and features['has_large_image']:
            return {
                "type": "left_media_right_text",
                "hierarchy": "media_dominant",
                "grid": None
            }
        elif features['image_right'] and features['has_large_image']:
            return {
                "type": "right_media_left_text",
                "hierarchy": "media_dominant",
                "grid": None
            }
        elif features['centered_text'] and not features['has_large_image']:
            return {
                "type": "centered_text",
                "hierarchy": "text_only",
                "grid": None
            }
        elif features['grid_layout']:
            return {
                "type": "grid",
                "hierarchy": "balanced",
                "grid": features['grid_layout']  # {"cols": 3, "rows": 2}
            }
        else:
            return {
                "type": "mixed",
                "hierarchy": "unknown",
                "grid": None
            }
    
    def _detect_images(self, img):
        """使用边缘检测识别图像区域"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        regions = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            if w * h > 10000:  # 过滤小区域
                regions.append({
                    "bbox": (x, y, w, h),
                    "area": w * h,
                    "center_x": x + w / 2,
                    "center_y": y + h / 2
                })
        return regions
    
    def _is_centered(self, blocks, img_width):
        """检查文本是否居中"""
        if not blocks:
            return False
        avg_center = np.mean([b['center_x'] for b in blocks])
        return abs(avg_center - img_width / 2) < img_width * 0.1
    
    def _detect_grid(self, elements):
        """检测是否为网格布局"""
        if len(elements) < 4:
            return None
        
        # 简化版：检查元素是否等间距排列
        x_positions = sorted([e['center_x'] for e in elements])
        gaps = [x_positions[i+1] - x_positions[i] for i in range(len(x_positions)-1)]
        
        if np.std(gaps) < 50:  # 间距标准差小于 50px
            cols = len(set([int(e['center_x'] / 200) for e in elements]))
            rows = len(set([int(e['center_y'] / 200) for e in elements]))
            return {"cols": cols, "rows": rows}
        
        return None
```

### 7.4 整站模板静态组件注册（与单页模板对齐）

为保证整站模板在生产环境具备可构建、可部署、可编辑能力，新增并落地静态组件注册链路：

`LLM 生成组件代码 -> 写入 src/components/blocks/*/block.tsx -> 注册到 src/puck/config.ts -> next build`

#### 关键设计

1. **物化入口（template-factory）**
   - 从 `payload.json` 读取 `components[].code`
   - 写入 `builder/src/components/blocks/<kebab-name>/block.tsx`
   - 生成 `builder/src/puck/config.generated.ts`
2. **Puck 注册合并**
   - `builder/src/puck/config.ts` 静态导入 `./config.generated`
   - 通过 `Object.assign(puckConfig.components, generatedComponents)` 合并
   - 提供空的 `config.generated.ts` 兜底，避免首次构建时模块缺失
3. **冲突治理（多站/多页）**
   - 同名同代码：去重
   - 同名不同代码：自动追加哈希后缀（如 `_a1b2c3d4`）
   - 输出 `collisionFrom/signature` 便于追踪

#### 验收标准

| 维度 | 评估 |
|------|------|
| 视觉保真度 | 高（同样由 LLM 生成组件） |
| Puck 编辑 | ✅ `fields/defaultProps` 显式注册 |
| 构建时可用 | ✅ 标准 Next.js 构建链路 |
| Cloudflare Pages | ✅ `next build` 后可衔接静态部署 |
| 首屏性能 | ✅ 无运行时 JIT 编译开销 |
| SSR/SSG | ✅ `<Render config={config} data={data} />` |

---

## 8. 质量保证体系

### 8.1 多维度质量评估

| 维度 | 指标 | 目标值 |
|------|------|--------|
| **视觉质量** | 像素相似度<br/>结构一致性<br/>响应式表现 | > 90% (Desktop)<br/>> 90% (Mobile)<br/>完美适配 3 种断点 |
| **代码质量** | Tailwind 覆盖率<br/>Schema 合规性<br/>组件复杂度 | > 95%<br/>100%<br/>Cyclomatic < 10 |
| **性能** | Pipeline 耗时<br/>渲染速度<br/>资源大小 | < 5 分钟/站<br/>LCP < 2.5s<br/>JS Bundle < 200KB |
| **可用性** | 无障碍性<br/>浏览器兼容<br/>错误率 | WCAG AA<br/>Chrome/Safari/Firefox<br/>< 5% |
| **复用性** | 跨项目适配率<br/>主题切换成功率<br/>文档完整性 | > 80%<br/>> 95%<br/>100% |

### 8.2 测试策略

- **单元测试**：所有 utils 模块（Tailwind mapper/Layout classifier）
- **集成测试**：Pipeline 端到端流程（Capture → Build → Verify）
- **视觉回归测试**：每个 Block 的标准样例（Golden Master）
- **性能测试**：Pipeline 耗时（目标：单站 < 5 分钟）

---

## 9. 使用指南

### 9.1 快速开始

```bash
# 1. 安装依赖
npm install
pip install -r requirements.txt

# 2. 单站点提取
python3 asset-factory/pipelines/run.py \
  --url https://example.com \
  --output-key demo

# 3. 启动渲染服务
cd builder
npm run dev

# 4. 查看结果
open http://localhost:3000/render?siteKey=demo&page=home

# 5. 运行视觉 QA
cd visual-qa
SITE_KEY=demo \
ORIGINAL_URL="https://example.com" \
RENDER_URL="http://localhost:3000/render?siteKey=demo" \
node --loader ts-node/esm scripts/run-with-attribution.ts
```

### 9.2 批量处理（Excel）

```bash
# Excel 格式要求
# | Site Name | URL                    | Priority |
# | Demo      | https://example.com    | High     |

python3 scripts/run_excel_pipeline.py \
  --excel sites.xlsx \
  --sheet "Sites" \
  --parallel 3  # 并发数

# 输出：
# - asset-factory/out/<siteKey>/
# - output/reports/excel_pipeline_report.json
```

### 9.3 资产搜索与复用

```python
from scripts.search_assets import AssetSearchEngine

# 初始化搜索引擎
search = AssetSearchEngine()
search.load_index()  # 加载已索引的资产

# 语义搜索
results = search.search(
    query="我需要一个高端金融风格的首屏，带大图背景",
    category="hero",
    filters={"responsive": True, "accessibility": "AA"}
)

# 结果：
# [
#   {
#     "id": "hero-finance-001",
#     "similarity": 0.89,
#     "metadata": {...},
#     "preview_url": "..."
#   }
# ]

# 预览资产
preview_url = search.preview(
    asset_id="hero-finance-001",
    theme="custom-theme-001"
)

# 复用资产到新项目
search.export_asset(
    asset_id="hero-finance-001",
    target_project="/path/to/new-project",
    adapt_theme=True  # 自动适配新主题
)
```

### 9.4 整站模板静态组件物化（Builder）

```bash
# 在 builder 目录执行
cd builder

# 1) 从 template-factory 某次 run 结果物化静态组件
node template-factory/materialize-custom-components.mjs \
  --run-dir template-factory/runs/<run-id>

# 2) 验证生产构建
npm run build
```

如需覆盖已存在 block 文件：

```bash
node template-factory/materialize-custom-components.mjs \
  --run-dir template-factory/runs/<run-id> \
  --overwrite
```

---

## 10. 风险与缓解策略

| 风险 | 影响 | 可能性 | 缓解策略 |
|------|------|--------|---------|
| JS-heavy 网站 DOM 不稳定 | 高 | 中 | 依赖截图分割 + computed styles，而非 DOM 结构 |
| 模板数量爆炸 | 中 | 高 | 强制 Block 变体上限（< 20），使用 Atomic 组合替代 |
| LLM 成本过高 | 中 | 中 | 优先使用规则引擎，LLM 仅用于复杂场景 |
| 视觉还原度不达标 | 高 | 低 | 视觉闭环迭代 + 人工评审闸门 |
| 跨站点复用失败 | 中 | 中 | Tailwind 归一化 + 语义索引 + 主题适配 |
| 性能瓶颈 | 低 | 中 | 并行处理 + 增量更新 + 缓存策略 |
| 无障碍性不足 | 中 | 中 | 自动化检测（axe-core）+ 人工审查 |

---

## 11. 未来扩展规划

### 11.1 短期（3 个月内）

- 支持更多 CSS 框架（Material UI/Ant Design）
- 增加 Block 数量至 50+
- 优化性能（Pipeline 耗时减少 50%）
- Web UI 界面（替代命令行）

### 11.2 中期（6 个月内）

- AI 辅助优化：基于转化数据推荐布局
- 协作功能：设计师标注系统 + 评论
- 版本控制：资产变更历史 + 回滚
- API 服务化：提供 RESTful API

### 11.3 长期（12 个月内）

- 跨平台支持：Flutter/React Native 组件生成
- 设计师工具集成：Figma/Sketch 插件
- 商业化支持：付费组件库 + SaaS 服务
- 多语言支持：内容自动翻译 + 本地化

---

## 12. 附录

### 附录 A：Block 注册表示例

```json
{
  "blocks": [
    {
      "id": "HeroVideo",
      "category": "hero",
      "description": "Video background hero with overlay",
      "variants": ["center", "split", "fullscreen"],
      "props_schema": "schemas/blocks/hero-video.v1.json",
      "semantic": {
        "intent": "product_launch",
        "tone": ["professional", "tech", "modern"],
        "conversion_goal": "video_play",
        "industry": ["saas", "tech", "startup"]
      },
      "dependencies": ["Button", "Container", "VideoBackground", "GradientOverlay"],
      "responsive": true,
      "accessibility": "AA"
    },
    {
      "id": "CardsGrid",
      "category": "feature",
      "description": "Grid of feature/product/news cards",
      "variants": ["3col", "4col", "masonry"],
      "props_schema": "schemas/blocks/cards-grid.v1.json",
      "semantic": {
        "intent": "feature_showcase",
        "tone": ["informative", "organized"],
        "conversion_goal": "engagement",
        "industry": ["all"]
      },
      "dependencies": ["Card", "Image", "Badge"],
      "responsive": true,
      "accessibility": "AA"
    }
  ]
}
```

### 附录 B：Theme Tokens 规范

```json
{
  "colors": {
    "primary": {
      "50": "#EFF6FF",
      "600": "#2563EB",
      "900": "#1E3A8A"
    },
    "semantic": {
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444"
    }
  },
  "spacing": {
    "base": 4,
    "scale": [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
  },
  "typography": {
    "fontFamily": {
      "sans": ["Inter", "system-ui", "sans-serif"],
      "serif": ["Merriweather", "Georgia", "serif"],
      "mono": ["Fira Code", "monospace"]
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.25,
      "normal": 1.5,
      "relaxed": 1.75
    }
  },
  "borderRadius": {
    "sm": "0.125rem",
    "md": "0.375rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "full": "9999px"
  },
  "boxShadow": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
  }
}
```

### 附录 C：参考资源

- **Anthropic Claude Documentation**: https://docs.anthropic.com
- **Puck Editor**: https://puckeditor.com
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Playwright**: https://playwright.dev
- **Crawl4AI**: https://github.com/unclecode/crawl4ai
- **Sentence Transformers**: https://www.sbert.net

---

## 文档信息

- **版本**：2.0
- **更新日期**：2026-01-28
- **作者**：技术团队
- **状态**：已发布

---

**如有疑问，请联系技术团队**
