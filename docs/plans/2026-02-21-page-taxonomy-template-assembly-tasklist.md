# Page Taxonomy Template Assembly - Tasklist

> 日期：2026-02-21  
> 依据：`docs/plans/2026-02-21-page-taxonomy-template-assembly-design.md`  
> 状态：P0/P1/P2/P3/P4/P5 已实施（home-only 对比已验证）

## 目标

将现有“整站硬匹配”升级为“页面分类驱动 + 设计契约统一 + 组装闸门”管线，并先落地 P0/P1 的可运行能力。

## P0 基线与可观测（本轮实施）

- [x] 增加页面分类字典资产（taxonomy dictionary）
- [x] 增加三层去重规则资产（url/structure/visual）
- [x] 增加分类与去重中间产物输出（写入 spec-pack）
- [x] 为后续阶段预留分类证据字段（confidence/evidence）

## P1 分类器与页面图（本轮实施）

- [x] 实现 rule-first 页面分类器（home/product/blog/detail/contact/legal 等）
- [x] 实现去重选择器（URL canonical + 结构指纹 + 每类上限）
- [x] 接入 `buildSpecPack` 主链路（不改外部调用方式）
- [x] 保持 `home-only` 流程兼容

## P2 去重与代表页选择（已实施）

- [x] 接入视觉指纹（dHash）真实图片级去重
- [x] 代表页评分器（representativeness/completeness/reusability/visual）
- [x] 分类内 Top-K 候选池与回退策略

## P3 Design Contract（已实施）

- [x] 统一 tokens 输出为 DTCG 格式
- [x] 合规校验器（颜色/字体/间距/组件）
- [x] 漂移闸门（drift gate）阻断发布

## P4 组装与质量闸门（已实施）

- [x] taxonomy-aware 页面组装清单（assembly manifest）
- [x] 关键链路完整性校验（home→list→detail→contact/pricing）
- [x] a11y 与视觉回归联合闸门

## P5 模板资产协议化（本轮新增实施）

- [x] 新增企业官网模板资产协议（PageType/Skeleton/SectionTaxonomy/ReviewStatus）
- [x] 新增 Template Meta / Dedup Fingerprint 协议 schema 资产
- [x] 新增协议评估器（asset contract report）
- [x] 接入 `run-template-factory` 主链路并写入 extracted 产物
- [x] 接入 run gate（`gateMinAssetContractScore`）

## 本轮验收口径

- 代码可通过语法与 TypeScript 校验
- `spec-pack` 产物包含：
  - `site_pages` 的 taxonomy 注释字段
  - `page_taxonomy` 汇总报告
- `spec-pack` 新增：
  - `design_contract` + `design_contract_compliance`
  - `assembly_manifest` + `key_flow_integrity`
  - `accessibility`
  - `template_asset_manifest` + `dedup_fingerprints` + `asset_contract_report`
- 现有 run 命令无需改动即可运行

## 阶段对比（Audeze Home-only）

- 基线：`tf-audeze-home-only-eval-20260220` → `overallSimilarity=85.85`
- P2：`tf-audeze-home-only-eval-20260221-p2` → `overallSimilarity=85.15`（下降，已继续实施 P3/P4）
- P3/P4：`tf-audeze-home-only-eval-20260221-p34` → `overallSimilarity=85.88`（较基线 +0.03，放行）
