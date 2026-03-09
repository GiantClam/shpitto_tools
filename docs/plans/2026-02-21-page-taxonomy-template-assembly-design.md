# 按页面分类驱动的模板提取与组装方案

> 日期：2026-02-21
> 状态：设计稿
> 目标：替代"整站硬匹配"，通过页面分类 → 模板提取 → 设计契约统一 → 组装校验的流程，提升全站复刻的质量与可控性

---

## 1. 问题背景

直接复刻目标 URL 全站存在两个核心困难：

1. **爬取阶段难以抉择有效页面**：目标站点页面数量大，存在大量重复页（分页、参数变体、AB 测试壳），难以自动判断哪些页面值得保留。
2. **各子页面影响整站设计约束**：不同子页面可能由不同团队/时期制作，风格不统一，直接整站匹配会把局部风格冲突放大到全站。

## 2. 核心思路

**分类驱动 + 设计系统约束**，而非整站硬匹配。

```
用户需求分析
    ↓
页面分类树（定义需要哪些类型）
    ↓
各分类候选页筛选（去重 + 评分）
    ↓
分类模板抽取（骨架 + 区块模式）
    ↓
全站设计契约统一（Design Contract）
    ↓
页面组装与一致性校验
    ↓
质量闸门（达标才入库）
```

**优势**：
- 可根据用户需求分析网站需要哪些页面分类，而非被动匹配整站
- 各分类中筛选关联性最高的页面，组合为完整网站
- 设计契约作为"闸门"，确保跨分类风格统一

**优化目标**：一致性优先（宁可慢一点，保证风格统一与可维护性）

---

## 3. 页面分类字典

### 3.1 全量分类定义

| 分类 ID | 名称 | 职责 | 典型区块 |
|---------|------|------|---------|
| `home` | 首页 | 品牌主叙事、导航分发、核心 CTA | Hero, Features, Testimonials, CTA, Footer |
| `product_service_list` | 产品/服务列表 | 产品矩阵、筛选、对比入口 | Filter Bar, Product Grid/List, Pagination |
| `detail` | 详情页 | 产品详情/案例详情/方案详情（统一为 detail） | Gallery, Specs, Description, Related Items |
| `pricing` | 定价页 | 套餐、计费规则、FAQ、对比表 | Pricing Table, Feature Comparison, FAQ |
| `blog_list` | 博客列表 | 内容列表、分类、搜索 | Category Nav, Article Grid, Pagination |
| `blog_detail` | 博客详情 | 文章模板、目录、推荐阅读 | Article Body, TOC, Author, Related Posts |
| `about` | 关于我们 | 品牌故事、团队、里程碑、背书 | Story, Team Grid, Timeline, Partners |
| `contact` | 联系页 | 联系方式、表单、地图、客服入口 | Contact Form, Map, Info Cards |
| `help_faq` | 帮助/FAQ | 帮助中心首页 + FAQ 详情 | Search, Category List, Accordion FAQ |
| `legal` | 法律页 | 隐私政策、条款、Cookie | Long-form Text, TOC, Last Updated |

### 3.2 分类间依赖与组合建议

```
必选组合（最小可用站点）：
  home + product_service_list + detail + contact + legal

内容型站点增强：
  + blog_list + blog_detail

转化型站点增强：
  + pricing + help_faq

品牌增强：
  + about
```

用户需求分析阶段，根据站点类型自动推荐组合，用户可手动增减。

---

## 4. 页面去重规则（3 层指纹）

去重是筛选有效页面的前置步骤，采用三层递进策略，降低误伤。

### 4.1 决策顺序

```
URL 归一化（快速粗筛）
    ↓ 未命中
结构指纹（语义级判重）
    ↓ 未命中
视觉指纹（感知级兜底）
```

### 4.2 各层规则

**Layer 1: URL 归一化**
- 剔除 tracking 参数：`utm_*`, `fbclid`, `gclid`, `ref`, `source`, `campaign`
- 合并尾斜杠：`/about/` == `/about`
- 分页保留主路径：`/blog?page=2` 归一化为 `/blog`（分页内容视为同一模板）
- 锚点剔除：`/pricing#enterprise` → `/pricing`
- 大小写归一化：路径统一小写

**Layer 2: 结构指纹**
- 提取主内容区块序列（忽略 header/footer），生成区块类型签名
- 区块类型示例：`[hero, features_grid, testimonials, cta, pricing_table]`
- 相似度算法：Jaccard 或编辑距离
- 阈值：相似度 > 0.9 判为结构重复

**Layer 3: 视觉指纹**
- 首屏截图（viewport 1440×900）
- 生成 pHash / dHash
- 汉明距离 < 8 判为视觉重复
- 用途：防止"结构微调但视觉本质相同"的页面逃逸

### 4.3 重复保留策略

当一组页面被判为重复时，保留评分最高的一页（评分规则见第 5 节）。

---

## 5. 模板评分表

### 5.1 评分维度与权重（视觉质量加权版）

```
总分 = 代表性(20) + 完整度(15) + 可复用性(15) + 视觉质量(40) - 噪音惩罚(10)
                                                      ↑
                                              视觉质量权重最高
```

| 维度 | 权重 | 评分标准 |
|------|------|---------|
| **代表性** | 20 分 | 是否符合该分类的典型信息架构；区块组合是否为该类页面的"标准范式" |
| **完整度** | 15 分 | 是否包含该分类的关键区块（缺失关键区块扣分） |
| **可复用性** | 15 分 | 组件是否可抽象、可参数化；是否依赖硬编码内容 |
| **视觉质量** | 40 分 | 层级清晰度、留白节奏、可读性、对齐精度、色彩和谐度、字体层级 |
| **噪音惩罚** | -10 分 | 活动弹层、AB 测试壳、强时效内容、异常脚本、Cookie 横幅遮挡 |

### 5.2 视觉质量细分（40 分拆解）

| 子项 | 分值 | 说明 |
|------|------|------|
| 层级清晰度 | 8 | 标题/正文/辅助文字的视觉层级是否分明 |
| 留白与节奏 | 8 | 区块间距是否遵循一致的 spacing scale |
| 对齐精度 | 8 | 元素是否严格对齐栅格，无像素级偏移 |
| 色彩和谐度 | 8 | 配色是否统一，是否存在突兀的颜色跳跃 |
| 字体层级 | 8 | 字号阶梯是否清晰，字重使用是否规范 |

### 5.3 入库阈值

- **入库**：总分 >= 75
- **待优化**：60 <= 总分 < 75（可通过设计契约重映射后再评）
- **丢弃**：总分 < 60

### 5.4 每类保留数量

每个分类保留 Top 3 候选模板（避免单一模板的脆弱性），最终组装时从 Top 3 中选最契合用户需求的。

---

## 6. 设计契约（Design Contract）

设计契约是统一各分类页面风格的核心机制。任何分类模板进入候选库前，必须通过契约校验；不合格则"重映射"（替换组件样式、统一栅格与排版）。

### 6.1 Design Tokens

```json
{
  "colors": {
    "primary": "提取自目标站主色",
    "primary_hover": "主色 hover 变体",
    "secondary": "辅助色",
    "neutral": ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
    "semantic": {
      "success": "",
      "warning": "",
      "error": "",
      "info": ""
    },
    "background": {
      "page": "",
      "surface": "",
      "elevated": ""
    }
  },
  "typography": {
    "font_family": {
      "heading": "",
      "body": "",
      "mono": ""
    },
    "font_size_scale": ["12", "14", "16", "18", "20", "24", "30", "36", "48", "60", "72"],
    "font_weight": ["400", "500", "600", "700"],
    "line_height": {
      "tight": "1.2",
      "normal": "1.5",
      "relaxed": "1.75"
    }
  },
  "spacing_scale": ["0", "4", "8", "12", "16", "20", "24", "32", "40", "48", "64", "80", "96", "128"],
  "border_radius": ["0", "4", "8", "12", "16", "9999"],
  "shadow": {
    "sm": "",
    "md": "",
    "lg": "",
    "xl": ""
  }
}
```

### 6.2 Layout Rules

| 规则 | 值 |
|------|---|
| 容器最大宽度 | 1280px（可配置） |
| 栅格系统 | 12 列 |
| 栅格间距 | 24px（桌面）/ 16px（移动） |
| 断点 | `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px` |
| 区块垂直节奏 | 遵循 spacing_scale，区块间距从 `64px / 80px / 96px` 中选取 |
| 页面内边距 | 桌面 `24px`，移动 `16px` |

### 6.3 Component Spec（组件规范）

每个共享组件定义变体边界：

| 组件 | 允许变体 | 禁止 |
|------|---------|------|
| Button | primary / secondary / ghost / destructive，3 种尺寸 | 自定义颜色、非标圆角 |
| Card | default / elevated / outlined | 非标阴影、非标内边距 |
| Navbar | fixed-top / sticky，透明/实色 | 非标高度、非标字号 |
| Form Input | default / error / disabled，2 种尺寸 | 非标边框色、非标圆角 |
| Footer | simple / multi-column / mega | 非标背景色 |
| Section Header | left-aligned / centered，带/不带副标题 | 非标字号组合 |

### 6.4 Content Rules

| 规则 | 约束 |
|------|------|
| 标题长度 | H1 <= 12 词，H2 <= 20 词 |
| CTA 文案 | 动词开头，<= 5 词 |
| 封面图风格 | 统一宽高比（16:9 或 3:2），统一滤镜/色调 |
| 图标风格 | 统一线条/填充风格，统一尺寸（24px / 32px / 48px） |
| 占位内容 | 使用语义化占位（非 Lorem Ipsum），标注内容类型 |

### 6.5 Motion Rules

| 规则 | 值 |
|------|---|
| 默认时长 | 200ms（微交互）/ 300ms（过渡）/ 500ms（入场） |
| 缓动曲线 | `ease-out`（入场）/ `ease-in-out`（过渡）/ `ease-in`（退场） |
| Hover 效果 | 统一为 opacity / scale / color 变化，不混用 |
| Focus 样式 | 统一 ring 样式（2px offset，primary 色） |

### 6.6 Accessibility Baseline

| 规则 | 标准 |
|------|------|
| 色彩对比度 | 正文 >= 4.5:1，大字 >= 3:1（WCAG AA） |
| 键盘可达 | 所有交互元素可 Tab 到达 |
| 表单标签 | 每个输入必须有关联 label |
| 语义结构 | 正确使用 heading 层级（h1 → h2 → h3） |
| 图片替代文本 | 所有非装饰图片必须有 alt |

---

## 7. 页面拼装策略

### 7.1 拼装原则（避免"拼贴感"）

1. **只用契约合规模板**：未通过设计契约校验的模板不参与拼装
2. **同语义区块替换**：Hero 只能替换 Hero，Pricing Table 只能替换 Pricing Table
3. **跨页面共享组件实例**：不是复制样式，而是引用同一组件定义
4. **先骨架后内容**：先拼 layout + sections 骨架，后填 copy + media 内容
5. **拼装后跑一致性评分**：颜色、字体、间距、组件覆盖率全部量化

### 7.2 拼装流程

```
Step 1: 用户需求 → 确定页面分类组合
Step 2: 每类从 Top 3 候选中选最契合的模板
Step 3: 提取各模板的区块骨架
Step 4: 将区块映射到统一 Design Contract
Step 5: 组装全站骨架（共享 Navbar + Footer）
Step 6: 填充内容（遵循 Content Rules）
Step 7: 一致性评分 + 人工审查
Step 8: 达标 → 入库；不达标 → 回 Step 4 调整
```

### 7.3 区块语义分类（用于同语义替换）

```
导航类：navbar, sidebar, breadcrumb
展示类：hero, features, gallery, stats, timeline
内容类：article_body, description, specs
转化类：pricing_table, cta, contact_form, newsletter
社证类：testimonials, logos, case_studies, reviews
辅助类：faq, help_search, related_items
底部类：footer, legal_links
```

---

## 8. 质量闸门

### 8.1 入库前检查项

| 检查项 | 阈值 | 说明 |
|--------|------|------|
| 视觉一致性分 | >= 85 | 颜色/字体/间距/组件风格的统一度 |
| 组件复用率 | >= 70% | 页面中使用共享组件的比例 |
| 页面类型覆盖率 | 100% | 用户选定的分类必须全部覆盖 |
| 无重复页冲突 | 0 | 同类重复模板不同时入库 |
| 关键流完整性 | 通过 | home → list → detail → contact/pricing 流程可走通 |
| 设计契约合规率 | >= 90% | 所有元素符合 Design Contract 的比例 |
| 响应式完整性 | 通过 | 至少覆盖 mobile + desktop 两个断点 |

### 8.2 一致性评分算法

```
一致性分 = (
    颜色合规率 × 25 +
    字体合规率 × 25 +
    间距合规率 × 20 +
    组件合规率 × 20 +
    布局合规率 × 10
)

合规率 = 符合 Design Contract 的元素数 / 总元素数
```

---

## 9. 与现有系统的集成点

本方案需要与以下现有模块对接：

| 模块 | 集成方式 |
|------|---------|
| `template-factory` | 模板评分、去重、入库流程集成到 template-factory 的处理管线 |
| `asset-library` | Design Tokens 和 Component Spec 存入 asset-library |
| `builder` | 页面拼装策略集成到 builder 的生成流程 |
| `visual-qa` | 一致性评分和质量闸门集成到 visual-qa 的检查流程 |

---

## 10. 执行路线图

| 阶段 | 内容 | 产出 |
|------|------|------|
| P0 | 页面分类字典 + 去重规则实现 | `page_taxonomy.json`, `dedupe_rules.json` |
| P1 | 模板评分体系 + 评分流水线 | `template_score_schema.json`, 评分脚本 |
| P2 | 设计契约定义 + 契约校验器 | `design_contract.json`, 校验工具 |
| P3 | 页面拼装引擎 + 一致性评分 | 拼装流水线, 质量闸门 |
| P4 | 全流程串联 + 端到端测试 | 完整管线, 回归测试 |

---

## 11. 社区最佳实践映射（外部依据）

> 目的：将方案中的关键决策绑定到可验证的行业标准/官方文档，降低“经验拍脑袋”。

| 主题 | 最佳实践 | 在本方案中的落地点 | 参考 |
|------|---------|------------------|------|
| URL 归一化 | 统一大小写、去除 dot-segments、对 unreserved 字符做等价归一化 | Layer 1 URL 归一化规则与 canonical key 生成 | RFC 3986 |
| 重复页规范化 | 使用 `rel="canonical"`、重定向、sitemap 作为 canonical 信号组合 | 候选页规范化优先级：redirect > canonical > sitemap | RFC 6596 + Google Search Central（consolidate duplicate URLs） |
| 抓取边界控制 | 遵守 robots.txt 规则；robots 不等于安全控制 | crawler 访问策略与失败分类（blocked/unreachable） | RFC 9309 + Google Search Central（robots intro） |
| 分类语义信号 | 利用结构化数据中的页面类型与面包屑层级 | 分类器特征：`WebPage` 子类型、`BreadcrumbList` | Schema.org WebPage + Google Breadcrumb structured data |
| 设计令牌标准 | 使用可交换 token 规范，支持主题/多品牌/别名引用 | `design_contract` 按 DTCG 格式组织，统一 token source of truth | W3C DTCG Format Module 2025.10 |
| 视觉回归稳定性 | 同一环境生成 baseline 与 compare，避免跨环境波动 | 评分环境锁定：OS/浏览器/字体/视口固定 | Playwright Visual comparisons |
| 可访问性基线 | 文本对比度与可达性满足 WCAG AA | 质量闸门新增 a11y 失败即阻断 | W3C WCAG Contrast Minimum |

---

## 12. 目标架构（Taxonomy-First Template Assembly）

### 12.1 分层架构

```
Layer A: Crawl & Page Graph
  - URL 发现（sitemap/nav/internal links）
  - robots/canonical/redirect 解析
  - 页面节点建模（内容、结构、视觉、元数据）

Layer B: Taxonomy Classifier
  - 规则 + 轻量模型融合
  - 输出 page_type + confidence + evidence

Layer C: Dedupe & Representative Selector
  - L1 URL 指纹 + L2 结构指纹 + L3 视觉指纹
  - 按分类聚类并选代表页

Layer D: Brand Core Extractor
  - 提取全站统一 Design Contract（tokens + component spec + layout rhythm）

Layer E: Archetype Template Extractor
  - 从代表页抽取分类模板（home/product/blog...）
  - 生成可复用 block 变体（模板专属资产）

Layer F: Site Assembler + Gate
  - 按需求组合分类模板
  - 运行一致性、链路、a11y、视觉 gate
```

### 12.2 关键原则

1. **先统一后拼装**：先抽 Brand Core，再允许分类模板进入组装。  
2. **分类内竞争、分类间约束**：每类 Top-K 竞争，全站共享同一 Design Contract。  
3. **可观测优先**：每个决策（分类、去重、入选、淘汰）必须有可追溯 evidence。  

---

## 13. 数据契约（建议新增）

### 13.1 `page_node.json`

```json
{
  "url": "https://example.com/products/abc",
  "normalized_url": "https://example.com/products/abc",
  "canonical_url": "https://example.com/products/abc",
  "status": 200,
  "robots_allowed": true,
  "redirect_chain": [],
  "metadata": {
    "title": "",
    "h1": [],
    "schema_webpage_type": "ItemPage",
    "breadcrumbs": []
  },
  "signatures": {
    "url_key": "",
    "structure_hash": "",
    "visual_phash": ""
  }
}
```

### 13.2 `taxonomy_result.json`

```json
{
  "url": "https://example.com/products/abc",
  "page_type": "detail",
  "confidence": 0.93,
  "evidence": ["schema:ItemPage", "path:/products/*", "blocks:gallery+specs+cta"]
}
```

### 13.3 `dedupe_cluster.json`

```json
{
  "page_type": "detail",
  "cluster_id": "detail_023",
  "members": ["url1", "url2", "url3"],
  "representative": "url2",
  "reason": "highest_score"
}
```

### 13.4 `brand_contract.json`

```json
{
  "$schema": "https://www.designtokens.org/TR/drafts/format/",
  "tokens": {},
  "layout_rules": {},
  "component_spec": {}
}
```

### 13.5 `assembly_manifest.json`

```json
{
  "site_intent": "conversion_ecommerce",
  "required_page_types": ["home", "product_service_list", "detail", "contact", "legal"],
  "selected_templates": {
    "home": "tpl_home_01",
    "product_service_list": "tpl_plp_02",
    "detail": "tpl_pdp_01"
  },
  "contract_version": "brand_contract_v3"
}
```

---

## 14. 核心算法（落地细化）

### 14.1 分类器（Rule + Model）

`page_type = argmax( rule_score * 0.6 + model_score * 0.4 )`

- Rule 特征：path pattern、schema.org type、breadcrumb 深度、关键区块组合
- Model 特征：标题/小标题语义、DOM section 序列、CTA 语义
- 低置信度（<0.7）进入人工复核池，不直接入模板库

### 14.2 去重聚类

1. URL 归一化聚合（RFC3986）
2. 结构签名相似（Jaccard/Edit distance）
3. 视觉签名兜底（pHash/dHash）
4. 同簇选代表页：  
   `rank = representativeness + completeness + reusability + visual_quality - noise_penalty`

### 14.3 风格统一（防“拼贴感”）

1. Token Lock：全部分类页强制映射同一 `brand_contract.tokens`
2. Component Family Lock：Navbar/Footer/Button/Card 等组件族必须复用同一 spec
3. Rhythm Lock：间距阶梯、容器宽度、断点体系统一
4. Drift Gate：跨页比较颜色/字体/间距/组件合规率，低于阈值自动回退默认变体

### 14.4 链接语义完整性

- 先生成路由骨架（按页面分类）
- 再回填导航/页脚链接
- 语义约束：
  - `uniqueInternalPaths >= min(5, route_count)`
  - `rootPathShare <= 0.4`
  - nav/footer 必须覆盖主路径（home/list/detail/contact/legal）

---

## 15. 实施计划（可执行版）

### P0（1 周）：基线与观测

- 增加 taxonomy/dedupe/assembly 过程日志与中间产物落盘
- 固化评测样本集（Audeze + 3 个行业站）
- 产出：`benchmark-cases.json`、`observability-schema.md`

### P1（1-2 周）：分类器与页面图

- 接入 sitemap、canonical、robots、breadcrumb、schema type 解析
- 实现 page graph 与 page taxonomy v1
- 产出：`page_graph.json`、`taxonomy_result.json`

### P2（1 周）：三层去重与代表页选择

- URL/结构/视觉三层去重
- 分类内 Top-K 候选池（默认 K=3）
- 产出：`dedupe_clusters.json`、`representatives.json`

### P3（1-2 周）：Brand Core & Design Contract

- 提取 token、排版、间距、组件规格
- 生成 DTCG 风格 `brand_contract.json`
- 产出：`brand_contract.json`、`contract_lint_report.json`

### P4（1-2 周）：分类模板抽取与组装

- 按分类抽取 archetype
- 引入 Token/Component/Rhythm 三重锁
- 产出：`archetype_library.json`、`assembly_manifest.json`

### P5（1 周）：质量闸门与回归

- Gate：视觉一致性、链接语义、a11y、关键流可达
- 引入 Playwright 稳定截图基线
- 产出：`gate-report.json`、`fidelity-report.json`

### P6（1 周）：灰度与回滚

- Shadow run（不发布）
- Canary（10%）→ 50% → 100%
- 失败回滚：自动降级到最近稳定模板库版本

---

## 16. 验收标准（建议）

### 16.1 Home-only 开发阶段

- 运行耗时：`<= 3 分钟`
- Home 相似度：`>= 85`
- `semanticCoveragePassed = true`

### 16.2 全站发布阶段

- 关键页（home/list/detail/contact）平均相似度：`>= 82`
- 跨页一致性分：`>= 85`
- 链接语义完整性：
  - `internalSuccessRate >= 98`
  - `rootPathShare <= 0.4`
  - `uniqueInternalPaths >= 5`
- a11y（AA 基线）通过：对比度、键盘可达、语义层级

---

## 17. 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 动态弹窗/AB 壳污染截图 | 降低视觉对齐度 | 统一“截图净化”步骤（关闭弹窗、冻结动画） |
| 多语言路径导致重复激增 | 去重失真 | 引入 locale-aware canonical key |
| 站点反爬策略变化 | 抓取不稳定 | robots 合规 + 限速 + 重试分级 + 失败标注 |
| 分类置信度低 | 错分导致组装错误 | 低置信度人工复核 + 规则回退 |
| 分类模板风格漂移 | 站点“拼贴感” | Token/Component/Rhythm Lock + Drift Gate |

---

## 18. 对当前目标（Audeze）的直接应用建议

1. 先启用 **taxonomy-first** 管线，仅选 `home + product_list + detail + blog_list + support + contact + legal`。  
2. 每类只取 Top-1 代表页入首轮组装，避免噪音扩散。  
3. 先跑 Home-only + home-only-eval 验证 Design Contract 稳定，再放开全站组装。  
4. 对导航启用“二级菜单硬约束”，并将 `rootPathShare` 纳入阻断 gate。  
5. 发布前必须通过：`semanticCoveragePassed=true` 且关键流（home→list→detail→contact）可走通。  

---

## 19. 参考资料

- RFC 3986: URI Generic Syntax — https://datatracker.ietf.org/doc/html/rfc3986  
- RFC 6596: The Canonical Link Relation — https://datatracker.ietf.org/doc/html/rfc6596  
- RFC 9309: Robots Exclusion Protocol — https://datatracker.ietf.org/doc/html/rfc9309  
- Google Search Central: Consolidate duplicate URLs — https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls  
- Google Search Central: robots.txt intro — https://developers.google.com/search/docs/crawling-indexing/robots/intro  
- Google Search Central: Breadcrumb structured data — https://developers.google.com/search/docs/appearance/structured-data/breadcrumb  
- Schema.org WebPage (AboutPage/CollectionPage/ContactPage/ItemPage...) — https://schema.org/WebPage  
- W3C DTCG Format Module 2025.10 — https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/  
- Playwright Visual comparisons — https://playwright.dev/docs/test-snapshots  
- W3C WCAG Contrast Minimum — https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum  
