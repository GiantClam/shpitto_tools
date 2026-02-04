---
name: "website-generation-workflow"
description: "Defines the end-to-end website generation workflow. Invoke when generating multi-section pages or full websites."
---

# 网站生成工作流

## 适用场景

需要从需求到交付的完整生成流程，包括规划、设计系统、批量生成与验证。

## 必须遵守的阶段

### Phase 0：信息增强

1. 提取用户目标、行业、目标受众、关键卖点、页面结构
2. 标记缺失关键信息并补齐
3. 形成结构化需求摘要

质量门禁：关键信息完整或置信度 > 0.8

### Phase 1：规划与设计系统

1. 创建/更新 planning files（task_plan、findings、progress）
2. 生成设计系统：颜色、排版、间距、圆角、阴影、容器规则
3. 验证设计系统可落地且无硬编码

质量门禁：设计系统验证通过

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
