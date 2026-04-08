---
name: "website-generation-workflow"
description: "Defines the end-to-end website generation workflow. Invoke when generating multi-section pages or full websites."
---

# 网站生成工作流

## 适用场景

需要从需求到交付的完整生成流程，包括规划、设计系统、批量生成与验证。

## 风格库（强制）

本工作流必须支持并优先使用 `https://github.com/VoltAgent/awesome-design-md` 的动态风格库。

### 动态加载规则

1. 每次开始网站生成前，动态拉取最新 README 与目录树（不得依赖手工静态拷贝）
2. 从风格库提取：`category / styleName / slug / description / DESIGN.md 链接`
3. 生成本地索引目录（见下文）并作为后续风格选择依据
4. 若网络不可达，可降级使用最近一次缓存索引，但需明确标记 `stale-cache`

### 完整索引目录结构（必须生成）

```text
.cache/awesome-design-md/
  index.json
  index.md
  categories/
    <category-slug>.md
  README.source.snapshot.md
```

`index.json` 最少字段：

- `sourceRepo`
- `generatedAt`
- `totalStyles`
- `categories[]`
- `styles[]`（每项含 `name/slug/category/description/designMdUrl/previewUrl`）

### 风格选择规则（必须可追溯）

1. 先用行业、受众、转化目标匹配候选风格（Top 3）
2. 给出每个候选的匹配理由与风险
3. 输出推荐风格 + 排除理由
4. 保存 `style-selection-record`（所用索引版本、候选、最终选择、原因）

## 必须遵守的阶段

### Phase 0：信息增强

1. 提取用户目标、行业、目标受众、关键卖点、页面结构
2. 标记缺失关键信息并补齐
3. 形成结构化需求摘要

质量门禁：关键信息完整或置信度 > 0.8

### Phase 0.5：风格库加载与索引

1. 动态加载 awesome-design-md
2. 构建/更新完整索引目录
3. 生成候选风格并完成风格选择记录

质量门禁：索引可用且风格选择可追溯

### Phase 1：规划与设计系统

1. 创建/更新 planning files（task_plan、findings、progress）
2. 生成设计系统：颜色、排版、间距、圆角、阴影、容器规则
3. 验证设计系统可落地且无硬编码

质量门禁：设计系统验证通过

### Phase 1.6：全站双语文案能力（EN/ZH）

1. 定义默认语言与备用语言（默认 `en`，支持 `zh`）
2. 建立统一 i18n 文案 key（页面级 + 区块级）
3. 顶部导航必须有 EN/ZH 切换入口
4. 核心文案必须双语覆盖（导航、标题、CTA、表单、页脚）
5. 语言切换保持当前路径不变，仅切换文案
6. 用户语言偏好持久化（建议 `localStorage`）

质量门禁：
- 全站关键文案双语覆盖率 = 100%
- 切换后无 key 泄漏、无断链
- 不影响可访问性（`lang` 与 `aria-label` 正确）

### Phase 2：分批生成 Section

1. 每批 3-5 个 Section
2. 生成后立即进行设计系统一致性检查
3. 记录进度与决策
4. 每 3 个 Section 执行一次 Visual QA

质量门禁：设计系统合规率 > 90%

### Phase 3：视觉打磨

1. 统一层级与节奏
2. 加入微交互与轻量动效
3. 交替背景与视觉节拍

质量门禁：视觉一致性 > 85%

### Phase 4：最终验证

1. 断点检查（320/768/1440）
2. 可访问性检查（WCAG AA）
3. 链接/交互可用性
4. 关键性能指标合理

质量门禁：所有检查通过

## 禁止事项

- 跳过规划或设计系统
- 使用硬编码颜色/间距
- 未经过质量门禁直接交付
- 双语能力只在单页生效（必须全站）
- 中英文文案散落硬编码且无统一 key 管理
