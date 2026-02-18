# Template Factory 全站一致性落地实施方案（对标 Open Lovable）

日期：2026-02-18  
范围：`builder/template-factory` 全站模板生成、视觉回归、模板资产沉淀

## 0. 结论先行

当前能力已具备“可跑通端到端流程”，但**尚未实现“对任意 URL 稳定生成视觉一致、链接完整的整站模板并沉淀资产”**。

核心依据（当前仓库实测）：
- `audeze-template-v5`：`site_pages=1`、`page_specs=1`，全站覆盖不足（`builder/template-factory/runs/audeze-template-v5/sites/audeze-home/extracted/spec-pack.json`）。
- 相似度波动大：`audeze-template-v1=35.13`、`audeze-template-v5=67.14`、`siemens-template-v6=97.04`（各 run `summary.json`）。
- 严格门禁在部分 run 中未形成有效约束：`strict.requiredCases=[]`（`builder/template-factory/runs/audeze-template-v5/fidelity-report.json`）。

## 1. 对标 Open Lovable 的可迁移思路

Open Lovable 的优势不是“单次生成命中率”，而是：
- 抓取/截图/品牌提取解耦为可重复调用的接口层。
- 生成与应用分阶段，支持迭代修复。
- 配置集中化、provider 抽象明确，便于扩展。

对 `shpitto_tools` 的可实施迁移点：
- 把“抓取、页面发现、规格生成、回归评估、修复、发布”拆为独立阶段并输出标准中间件产物。
- 把硬编码阈值/上限迁移到统一配置与 schema 校验。
- 把门禁从“总体相似度”升级为“全站覆盖 + 链路完整 + 关键页视觉达标”的三维 gate。

## 2. 验收目标（Definition of Done）

### 2.1 全站覆盖
- `site_pages` 覆盖率 >= 90%（基于导航 + sitemap + 内链 BFS 的可达页面集合）。
- `page_specs` 生成率 >= 95%（覆盖页中能生成模板规格的比例）。
- 首页、至少 1 个列表页、至少 1 个详情页、至少 1 个联系/转化页必须存在。

### 2.2 链接完整
- 内链重写成功率 >= 98%。
- 模板内无坏链（同域 4xx/5xx）且无 `javascript:`、空 href 泄漏。
- Header/Footer/Nav 链路可达页占比 >= 95%。

### 2.3 视觉一致
- 关键页（home + top N traffic pages）平均 similarity >= 85。
- 单页 similarity 下限 >= 78（低于即触发自动修复，不允许发布）。
- strict.requiredCases 非空且覆盖关键页集合。

### 2.4 资产沉淀
- 每次 run 产出可复用模板资产包（含版本、域名标签、质量评分、可追溯来源）。
- 仅当质量门禁通过才 publish 到 runtime registry。

## 3. 分阶段实施（可直接排期）

## P0（1-2 天）先把门禁做实，避免“看似成功”

目标：先解决“可观测、可失败、可回归”。

改造项：
- 新增统一配置与 schema：
  - `builder/template-factory/config/defaults.mjs`
  - `builder/template-factory/config/schema.mjs`
  - `builder/template-factory/config/resolve-options.mjs`
- `run-template-factory.mjs` 中 `parseArgs` 下沉到 `resolve-options.mjs`，去除分散默认值。
- 新增 run 级 gate 报告：
  - `builder/template-factory/gates/evaluate-run-gates.mjs`
  - 输出 `runs/<runId>/gate-report.json`
- 将“strict.requiredCases 为空”定义为告警或失败（可配置）。

验收：
- 同一输入重复 3 次，gate 判定结果稳定。
- `summary.json`、`fidelity-report.json`、`gate-report.json` 三者指标一致可追溯。

## P1（3-5 天）补齐全站发现与链接闭环

目标：解决“只生成 1 页”与“链接不完整”。

改造项：
- 模板专属 block 变体能力：
  - 支持按站点/按页面路径覆盖 `section_specs` 的 `block_type` 与 `defaults`。
  - 示例字段：`specialRules.templateBlockVariants`、`specialRules.pageTemplateBlockVariants`。
- 页面发现增强（替换硬上限策略）：
  - 现状硬限制：`pages.slice(0, 12)`、导航 `links.length >= 6`（`builder/template-factory/run-template-factory.mjs`）。
  - 改为配置化：`maxDiscoveredPages`、`maxNavLinks`、`mustIncludePatterns`。
- 新增发现源融合：
  - sitemap.xml、robots.txt、导航 DOM、面包屑、正文内链。
  - 文件建议：`builder/template-factory/discovery/build-site-graph.mjs`
- 强化 alias 与 rewrite：
  - 统一 canonical path 归一化（尾斜杠、query/hash、语言前缀）。
  - 文件建议：`builder/template-factory/routing/alias-map.mjs`
  - 文件建议：`builder/template-factory/routing/rewrite-links.mjs`
- 新增链接验证器：
  - `builder/template-factory/validators/check-site-links.mjs`
  - 产出 `link-report.json`。

验收：
- Audeze/Siemens 两个样本都能稳定生成 >8 页面规格。
- `link-report.json` 内链成功率 >= 98%。

## P2（4-6 天）视觉回归从“均值”升级为“关键页硬约束”

目标：解决“均值看起来可以，但关键页面不一致”。

改造项：
- 关键页集合自动化：
  - 基于 page graph + 模板类别自动生成 requiredCases，禁止空集合。
  - 文件建议：`builder/template-factory/regression/select-required-cases.mjs`
- 回归策略升级：
  - page-level 阈值 + 站点均值双门禁。
  - 引入“结构相似 + 视觉相似”联合评分。
- auto-repair 策略按失败类型分流（排版/配色/文案密度）。

验收：
- 关键页 case 覆盖率 100%（requiredCases 非空且命中关键页）。
- 相似度低于阈值时能自动进入 repair 并输出原因分类。

## P3（2-3 天）模板资产化与发布治理

目标：解决“生成一次可看，复用困难”。

改造项：
- 资产包标准化：
  - 在 `buildRunLibraryOutput`、`mergeAndPublishRunLibrary` 增加字段：
  - `qualityScore`、`coverageScore`、`linkIntegrityScore`、`sourceDomain`、`version`、`createdAt`。
- runtime 加载策略升级：
  - `builder/src/lib/agent/section-template-registry.ts` 增加按质量和域标签选择模板能力。
- 发布策略：
  - gate 未通过禁止写入 `style-profiles.generated.json`。

验收：
- 低质量 run 不进入线上模板库。
- 同域二次生成优先复用高质量历史资产。

## P4（2 天）并发与稳定性（生产化）

目标：解决高并发场景下 ingest/crawl 波动与超时。

改造项：
- 将当前 `Promise.all(processingPromises)` 模式改为“全流程并发池”，不仅限制回归阶段。
- crawl、截图、回归各自配置独立并发与 timeout。
- 新增失败重试与熔断（按 site 粒度）。

验收：
- 20 个站点批处理，失败率与超时率可控并可复跑。
- 运行时资源峰值（CPU/内存/端口）在阈值内。

## 4. 执行清单（按顺序）

1. 完成 P0 并上线 gate-report（先“可失败”）。  
2. 完成 P1，先保证 Audeze 样本覆盖从 1 页提升到 >=8 页。  
3. 完成 P2，保证 requiredCases 不为空并达标。  
4. 完成 P3，把通过 gate 的 run 自动沉淀为模板资产。  
5. 完成 P4，扩展到多站批量稳定运行。  

## 5. 建议验证命令（每阶段固定回归）

```bash
# 1) 单站全流程（标准模式）
node builder/template-factory/run-template-factory.mjs \
  --manifest builder/template-factory/sites.audeze.json \
  --run-id tf-audeze-gate-check \
  --crawl-site \
  --fidelity-mode strict \
  --fidelity-enforcement fail \
  --auto-repair-iterations 2

# 2) 并行多站（压测并发）
node builder/template-factory/run-template-factory.mjs \
  --manifest builder/template-factory/sites.siemens.json \
  --run-id tf-siemens-parallel-check \
  --crawl-site \
  --pipeline-parallel \
  --pipeline-parallel-concurrency 3 \
  --fidelity-mode strict
```

阶段通过判定：
- P0：存在 `gate-report.json` 且 gate 对失败样本能阻断 publish。  
- P1：`spec-pack.json` 的 `site_pages/page_specs` 达到覆盖目标。  
- P2：`fidelity-report.json` 中 strict.requiredCases 非空且达标。  
- P3：`section-template-registry` 可读取新评分字段并生效。  
- P4：并发运行 20 站可稳定完成且可复跑。  

## 6. 风险与降级策略

- 反爬/动态站导致抓取不稳定：保留 screenshot-first fallback，允许基于关键页最小资产包发布。
- 视觉评分误判：保留人工抽检白名单机制，分离 hard fail 与 soft warn。
- 并发导致资源争用：端口池、浏览器池、crawl 池分层限流，不共享单 semaphore。
