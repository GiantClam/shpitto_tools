非常好。你前面已经把关键判断都做对了，我来把它们整合成一套 **可落地、可扩展、以“企业官网模板资产化”为核心** 的完整解决方案。

我会按你当前阶段（**30 个企业官网、约 450–600 页素材、优先企业官网、不做电商**）来设计，不搞过度抽象。

---

# 一、目标定义（先统一）

你的系统不是“网站克隆器”，而是：

> **企业官网模板资产工厂（Template Asset Factory）**

核心目标分两阶段：

## Phase 1（当前优先级）

**模板还原度优先（Fidelity First）**

* 每一页模板渲染后与原站对应页面视觉上基本一致
* 模板有商业价值、可用作生成整站的页面资产

## Phase 2（后续优化）

**资产收敛与复用优化（Asset Optimization）**

* block/variant 收敛
* dedup 去重
* 私有 block 生命周期管理
* 自动 patch 闭环优化

> 你现在坚持“先像，再优雅”是对的。
> 但在提取阶段要埋下结构化钩子，避免后期无法整理。

---

# 二、总体架构（你应该建设的系统形态）

## 总体分层（非常关键）

```text
Site Design System（站点级设计系统约束）
  ├─ Theme Tokens（颜色/字体/圆角/阴影/type scale/motion）
  ├─ Layout Constraints（maxWidth/spacing/density）
  └─ Block Variant Mapping（每类 block 的风格映射）
        ↓
Page Templates（页面模板）
  ├─ Skeleton（信息流骨架）
  ├─ Sections（区块序列）
  ├─ Blocks（可包含私有 block）
  ├─ Visual Profile / Style Lock（页面视觉 DNA）
  └─ Puck JSON（可渲染）
        ↓
Template Asset Pipeline（采集-提取-审核-入库）
```

### 为什么要这样分层？

* **模板负责信息结构**
* **Design System 负责整站视觉一致性**
* **Pipeline 负责质量与资产沉淀**

---

# 三、关键原则（你这条路线能跑起来的前提）

## 1）先做单一 Domain：企业官网（Corporate）

不要现在追求通用。

* 结构高度重复
* 风格约束稳定
* 审核成本低
* 模板可复用性高

## 2）模板提取优先“高还原”

允许：

* 页面专有 block（Private Block）
* 页面级 style lock
* 模板级 snapshot

但必须记录：

* skeleton
* section taxonomy
* visual profile
* dedup 指纹

## 3）人参与的是“决策节点”，不是“生产节点”

人工做：

* 页面筛选
* 分类校对
* 模板预览审核
* 是否入库决策

AI 做：

* 页面发现
* 预分类
* section/block 提取
* 模板生成
* 相似度与去重候选

---

# 四、企业官网结构地图（你的核心资产地基）

## 4.1 企业官网 5 大 Home Skeleton（高价值）

你前面已经确认“Skeleton 层”必须存在，下面是标准化版本。

### S1. Trust First（信任优先）

信息流：

* Hero（品牌定位）
* Social Proof（客户/Logo）
* Capability（优势能力）
* Case Study（案例）
* CTA / Contact

### S2. Product First（产品优先）

信息流：

* Hero（产品价值）
* Product Preview
* Features
* Technical / Integrations
* CTA

### S3. Solution First（解决方案优先）

信息流：

* Hero（问题导向）
* Pain Points
* Solutions
* Use Cases
* CTA

### S4. Authority Heavy（权威型）

信息流：

* Hero（品牌）
* Certifications / Authority
* Timeline / History
* Leadership / Team
* Contact

### S5. Conversion Driven（转化型企业站）

信息流：

* Hero（强 CTA）
* Benefits
* Proof
* Pricing-lite / Offer
* FAQ
* CTA

> 你 30 个企业官网的 Home，绝大多数会被压到这 5 类里。

---

## 4.2 企业官网核心 Section Taxonomy（TOP 12）

这是你模板提取和 block 分类的“字典”，必须统一。

1. Hero
2. LogoWall（客户/合作品牌）
3. FeatureGrid（能力/优势）
4. ProductPreview（产品入口）
5. Solutions（解决方案）
6. CaseStudyHighlight（案例）
7. Stats / Numbers（数据证明）
8. Testimonial（客户评价）
9. TeamPreview（团队）
10. FAQ
11. CTA Banner
12. Contact Section（表单+联系方式）

> 模板本质 = 这些 Section 的排列组合 + 视觉节奏。

---

# 五、模板体系设计（Page Template 不再只是“一个页面 JSON”）

你的模板要升级为一个完整对象：

## 5.1 Page Template 数据结构（建议）

```json
{
  "templateId": "corp-home-trust-heavy-001",
  "domain": "corporate",
  "pageType": "home",
  "skeleton": "trust-first",
  "layoutVariant": "trust-heavy",
  "source": {
    "siteId": "site_abc",
    "url": "https://example.com/",
    "capturedAt": "2026-02-21"
  },
  "sections": [
    { "id": "sec1", "type": "Hero", "variantHint": "centered", "visualWeight": "high" },
    { "id": "sec2", "type": "LogoWall", "variantHint": "mono" },
    { "id": "sec3", "type": "FeatureGrid", "variantHint": "3col-minimal" },
    { "id": "sec4", "type": "CaseStudyHighlight", "variantHint": "cards" },
    { "id": "sec5", "type": "CTA", "variantHint": "soft" }
  ],
  "visualProfile": {
    "maxWidth": "xl",
    "sectionSpacing": "lg",
    "density": "medium",
    "typeScaleBucket": "h1:48-56",
    "headlineWeight": "bold",
    "motion": "off",
    "tone": "professional",
    "ctaStyle": "contact"
  },
  "styleLock": {
    "heroHeight": "large",
    "ctaPlacement": "below-fold",
    "proofPriority": "high"
  },
  "puck": {
    "content": [],
    "root": { "theme": {} }
  },
  "qa": {
    "fidelityScore": 0.91,
    "reviewStatus": "approved"
  }
}
```

---

## 5.2 模板 = Blueprint + Blocks + Style Lock

你前面问“如何保证模板像原站”，关键不是只靠 block，而是：

* **Skeleton / Blueprint 保结构**
* **Style Lock 保视觉节奏**
* **Private Block 保特殊结构还原**

---

# 六、Block 体系（允许私有 block，但要受控）

你已经明确：为了模板效果，允许页面提取 section 和 block 变体，允许专有 block。这个判断是对的。

## 6.1 三层 Block 体系（强烈建议）

### Layer 1 — Core Blocks（核心公共层）

高复用、通用：

* Hero / FeatureGrid / CTA / LogoWall / FAQ / ContactForm / Stats / Testimonials...

### Layer 2 — Domain Blocks（企业官网域专属）

企业官网常见但不够通用：

* Certifications
* IndustryTabs
* SolutionFlow
* FactoryGallery
* SpecComparison（非电商商品详情，而是参数/规格展示）

### Layer 3 — Template-Private Blocks（模板私有层）

为高还原服务：

* 仅属于某个模板/页面
* 命名规范化，例如：`private.corp-home-001.hero-special`

---

## 6.2 提取时的 Block 判定决策（非常重要）

每个 section/block 提取后，必须做一个决策：

* `reuse`：复用已有 block + variant
* `new_variant`：已有 block 新增变体
* `new_private`：创建私有 block（仅当无法泛化）

### 规则建议（MVP）

1. 优先匹配 Core
2. 再匹配 Domain
3. 最后才允许 Private

> 这样可以同时满足你“高还原”与未来“资产收敛”。

---

# 七、模板提取方案（从 3–4 个目标网站起步怎么做）

你问过：从三四个目标网站提取分类页面模板，应该如何设计？下面是标准答案。

## 7.1 提取目标不是 HTML，而是 Page Blueprint + Snapshot Template

你真正提取的是：

* 页面结构（Sections 序列）
* 骨架（Skeleton）
* 视觉节奏（Visual Profile）
* 可渲染模板（Puck JSON）

## 7.2 正确提取粒度：Page = Section Sequence

不要：

* 只存整页（复用差）
* 直接拆到原子组件（失去结构）

要做：

* pageType
* skeleton
* sections[]
* styleLock / visualProfile
* blocks（允许 private）

---

## 7.3 从目标网站提模板的标准流程（单页）

1. 页面截图 + 结构抓取（DOM/Markdown）
2. Skeleton 分类（先做）
3. Section 分割 + 分类（Hero / FeatureGrid / CTA…）
4. Block 提取（复用 / 变体 / 私有）
5. 提取 Visual Profile（页面视觉 DNA）
6. 组装 Puck JSON
7. 预览渲染 + 视觉审核
8. Dedup 检查
9. 入库

> 注意顺序：**先 Skeleton，再 Section，再 Block**。
> 这是你避免后续“模板越来越像但结构无法收敛”的关键。

---

# 八、网站采集层（Intake Layer）——解决反爬与页面不全问题

你问得非常到位：反爬和抓取不到预期页面怎么办？答案不是“全自动突破”，而是建设 **Intake Layer**。

## 8.1 结论

> 模板级提取 **必须有人工介入**，但人工做的是“审核与校正”，不是手工抓取。

---

## 8.2 三层抓取策略（Fallback Pipeline）

### Level 1 — 轻量抓取（快）

* Jina Reader / Crawl4AI / Readability
* 用于拿结构、初始页面列表

### Level 2 — Browser 抓取（真实浏览器）

* Playwright / Puppeteer / browser-use
* 用于 JS 动态页面、导航展开、截图

### Level 3 — 人工快照（最终保险）

* 人工打开页面
* 一键保存截图 + HTML snapshot
* 用于反爬严重、登录后页面、动态复杂页面

> 不要执着“自动突破反爬”。你的业务价值在模板资产，不在反爬技术本身。

---

## 8.3 页面发现（避免抓不全）

### A. 导航扩展（Navigation Expansion）

* 解析 header nav / footer links / sitemap
* 自动展开 dropdown / mega menu
* 收集隐藏链接

### B. URL Pattern 猜测（超实用）

企业官网常见路径枚举 probe：

* `/about`, `/company`, `/services`, `/solutions`, `/products`, `/case-study`, `/contact`, `/news`...

### C. AI 预分类过滤

AI 给出：

* pageType
* confidence
* representativeness（代表性）
* contentNoise（噪声）

---

## 8.4 Human Intake（人工审核入口）

人工只做：

* 删除垃圾页面（政策页、活动页、重复页）
* 校对 pageType
* 选择代表页面（尤其产品详情/案例详情页面）

这个步骤 2–5 分钟/站就够了。

---

# 九、模板资产流水线（你描述的流程标准化）

你已经设计出一个非常成熟的流程，我帮你固化成标准 pipeline：

## 9.1 五阶段流水线

```text
1) AI Discover（页面发现与预分类）
2) Human Intake（人工筛选与校对）
3) Template Extraction（模板提取与生成）
4) Visual Review（视觉核对）
5) Asset Approval（入库决策）
```

---

## 9.2 每阶段输出物（建议）

### 1) AI Discover 输出

`discovered_pages.json`

```json
[
  {
    "url": "/about",
    "pageType": "about",
    "confidence": 0.82,
    "representativeness": 0.91,
    "layoutStability": 0.84,
    "contentNoise": 0.12
  }
]
```

### 2) Human Intake 输出

`intake_review.json`

* 勾选页面
* 修正分类
* 标记代表页

### 3) Template Extraction 输出

* `template.json`（Puck）
* `template.meta.json`（skeleton/sections/visualProfile）
* `assets/`
* `mapping.log`

### 4) Visual Review 输出

* 预览链接
* screenshot 对比
* QA report（含 fidelity score）

### 5) Asset Approval 输出

* 状态：draft / reviewed / approved / deprecated
* 入库记录

---

# 十、如何保证整站设计风格和约束一致（你问的核心问题）

这是系统成功与否的关键，你前面问得非常准。

## 10.1 答案：靠 Site Design System（站点级约束），不是靠模板自己协调

模板只负责结构，不负责最终视觉一致性。
整站生成时必须先有一个站点级“设计系统配置”。

---

## 10.2 Site Design System（站点级设计系统）组成

### A. Theme Tokens（强制覆盖）

统一生成并覆盖所有页面模板的视觉 token：

* primary / neutral
* font
* radius
* shadow
* typeScale（h1/h2/base）
* motion

> 模板里的 token 只能作为 fallback。最终以 root.theme 为准。

### B. Layout Constraints（全站布局约束）

统一锁定：

* maxWidth（如 xl）
* sectionPadding（如 lg）
* contentDensity（low/medium/high）

### C. Block Variant Mapping（block 风格映射）

例如企业官网不同风格包：

* Hero → `centered-clean`
* FeatureGrid → `3col-minimal`
* CTA → `soft`
* Stats → `static-no-animation`

---

## 10.3 Site Style Profiles（建议先做 3 套）

针对企业官网，先做 3 套站点风格包：

1. **Corporate Minimal**（工业官网偏多）
2. **Corporate Trust Heavy**（传统企业）
3. **Corporate Modern**（新科技企业）

用户选风格包后：

* 页面模板只作为结构来源
* 渲染时统一覆写 token + variant + spacing
* 整站看起来像同一设计系统产物

---

# 十一、模板还原度（Fidelity）方案——你当前最重要的指标

你明确说了：模板如果不像原站，价值就低。这是完全正确的。

## 11.1 高还原的关键不是“组件完全一样”，而是“视觉节奏一致”

真正影响人眼感知相似度的是：

* 第一屏布局
* 排版节奏（typeScale）
* 间距节奏（spacing rhythm）
* 宽度与密度（maxWidth + density）
* CTA 位置

不是纯组件细节。

---

## 11.2 模板必须保存 Page Visual Profile（页面视觉 DNA）

模板提取时新增一个对象：

* typeScale bucket
* spacing rhythm
* maxWidth
* density
* headline weight
* cta style
* motion level

这就是你的 **styleLock / visualProfile**，用于保证模板渲染时“像”。

---

## 11.3 Fidelity QA（视觉校验）

你前面已经确定要做视觉校验，这个方向非常对。

### 最小可用 QA（MVP）

* 原站截图（desktop + mobile）
* 模板渲染截图（desktop + mobile）
* pixel diff（pixelmatch）
* similarity score

### 不仅做 diff，还要做归因（你前面已经设计了）

归因分三类：

* structure（结构/布局）
* tokens（字体/颜色/圆角/阴影）
* content（资源缺失/字体加载失败/图片坏链）

并支持：

* section/block 级归因（基于 `data-block`, `data-block-id`）
* 后续自动 patch 闭环（只改 props/tokens）

---

# 十二、自动修复闭环（后续增强，但架构要预留）

你前面已经走到很正确的工程形态：

> 截图 → diff → 归因 → patch（只改 props/tokens）→ 再渲染

## 12.1 Patch 的设计原则（非常好）

* 只允许改：

  * `setBlockProp`
  * `setThemeToken`
* 不允许改结构（增删 block、改 type）
* 输出必须结构化（JSON Schema / oneOf）
* patch 在 apply 前做 allowlist 校验

## 12.2 为什么这套闭环特别适合你

因为你的目标是“模板资产化”，不是“一次性生成页面”：

* 可审计
* 可回放
* 可控制风险
* 能逐轮逼近 fidelity

---

# 十三、模板去重层（Dedup Layer）——防止库越做越乱

你已经接受人工审核和入库流程了，接下来必须有 dedup，否则审核会越来越慢。

## 13.1 去重目标不是“完全重复”，而是“近重复”

多数重复是：

* 同 skeleton
* 同 section 序列
* 同布局节奏
* 只是配色/文案/图片不同

## 13.2 单页模板去重指纹（推荐）

### A. Structure Fingerprint（主信号）

* domain
* pageType
* skeleton
* sections 序列

### B. Layout Rhythm Fingerprint（次主信号）

* maxWidth
* spacing bucket
* typeScale bucket
* density
* motion

### C. Visual Hash（兜底信号）

* 首屏截图 pHash / dHash

## 13.3 相似度评分（简单可用）

* Structure 50%
* Layout 30%
* Visual 20%

阈值建议：

* ≥ 0.92：近重复（默认不新增，做 variant）
* 0.85–0.92：人工复核
* < 0.85：新模板

## 13.4 放置位置

Dedup 放在：
**Template Extraction 之后、Visual Review 之前**（降低人工噪声）

---

# 十四、模板生命周期管理（避免“入库即永生”）

模板库状态建议：

* `draft`
* `reviewed`
* `approved`
* `deprecated`

## 为什么必须做？

你后面会遇到：

* 同类模板更好的版本出现
* 某些私有 block 模板无法复用
* 某些模板 fidelity 不稳定

所以模板需要可淘汰、可替换。

---

# 十五、你的当前 MVP 范围（非常具体，能落地）

你现在大概有 30 个目标企业官网，每站 15–20 页。不要全部上来处理。

## 15.1 建议第一阶段只做 3 类 pageType

先从以下三类做提取与模板化闭环：

1. `home`
2. `about`
3. `contact`

### 为什么是这三类？

* 覆盖率高
* 结构相对稳定
* 容易形成 skeleton 与 section taxonomy
* 审核速度快
* 能快速验证 pipeline 完整性

## 15.2 第二阶段再扩展

4. `services / solutions`
5. `product-overview`
6. `product-detail`（企业产品详情，不含电商）
7. `case-study`
8. `news/blog`
9. `careers`

---

# 十六、你现在该建设的“标准协议”（优先级比继续抓更多站更高）

你已经接近临界点了：如果现在不定协议，后面一定混乱。

## 16.1 必须先定的 6 个协议

1. **PageType 枚举**（企业官网版）
2. **Skeleton 枚举**（先 Home 5 类，再扩展到其他 pageType）
3. **Section Taxonomy**（TOP 12 起步）
4. **Template Meta Schema**（skeleton/sections/visualProfile/styleLock）
5. **Block Decision Schema**（reuse/new_variant/new_private）
6. **Review & Approval 状态机**

---

# 十七、推荐实施顺序（按周推进）

## 第 1 周：标准化与 Intake

* 定义 PageType / Skeleton / Section taxonomy
* 搭建 AI Discover + Human Intake 页面（简单列表即可）
* 先处理 3–4 个目标站（Home/About/Contact）

## 第 2 周：模板提取与预览

* 建立模板提取流程（section + block + visualProfile）
* 生成 Puck JSON
* 预览页面渲染与人工 Visual Review

## 第 3 周：Fidelity QA

* 接入截图、pixel diff、基础 report
* 输出 fidelity score（desktop/mobile）

## 第 4 周：Dedup + 入库流程

* 结构/布局指纹去重
* 入库审核状态机
* 模板库列表（按 pageType / skeleton / status 浏览）

## 第 5 周：站点风格一致性（Site Design System）

* 做 3 套 Corporate Style Profiles
* 做 token / layout / block variant 强制覆写
* 验证“跨模板拼整站”一致性

## 第 6 周+：自动归因与 patch 闭环

* section/block 级归因
* patch allowlist
* 迭代修复

---

# 十八、最终生成整站（你想要的产品形态怎么落）

当模板库逐步成型后，整站生成应该是：

## 18.1 用户侧流程（企业官网）

1. 选择 Domain：`corporate`
2. 选择 Site Style：`Minimal / Trust / Modern`
3. 选择站点 Blueprint（例如标准企业官网）
4. 填内容（公司名/服务/案例/联系方式等）
5. 系统为每个 pageType 选模板（先规则，后检索）
6. 统一应用 Site Design System
7. 输出多页 Puck JSON

## 18.2 你系统内部流程

* 按 `pageType + domain + skeleton + styleProfile` 检索模板
* Dedup-aware 候选排序
* 一致性重排（theme/spacing/motion/tone）
* 渲染输出整站

---

# 十九、你这套方案的核心价值（你现在走在正确方向上）

你已经自然形成了一个非常强的路线：

* **高还原优先**（保证模板价值）
* **半自动 + 人工 gate**（保证质量）
* **Skeleton / Section Taxonomy**（控制复杂度）
* **允许 private block**（保证 fidelity）
* **Site Design System 覆写**（保证整站一致性）
* **Dedup + 生命周期**（保证长期可扩展）

这不是“妥协方案”，而是实际能做成产品的方案。

---

# 二十、最后给你的一个执行建议（很重要）

你现在最容易犯的错误是继续扩样本、继续抓网站。

我建议你接下来先做一件事：

> **用 3–4 个目标企业官网，跑通完整流水线（Discover → Intake → Extract → Review → Approve）**

并且只做：

* Home
* About
* Contact

一旦这三类跑通，你整个系统就已经成型了。后面扩 pageType 和模板量只是工程放大，不是方向探索。

---

如果你愿意，我下一步可以直接给你一份 **“企业官网模板资产协议 v1（JSON Schema 草案）”**，包括：

* `PageType` 枚举
* `Skeleton` 枚举
* `SectionTaxonomy`
* `TemplateMeta Schema`
* `ReviewStatus Schema`
* `Dedup Fingerprint Schema`

你们前后端和提取脚本就可以按同一份协议并行开发。

---

# 二十一、结构优先两阶段生成（新增，优先落地）

为解决“图片和动效干扰结构提取，导致模板可用性和评分不稳定”的问题，模板工厂执行顺序升级为 **Structure First → Media Backfill → Motion Backfill**：

## 21.1 阶段 A：结构提取（禁用图片与动效）

目标：先稳定拿到可编辑、可复用的结构资产。

* 禁用 section 截图贴图背景
* 禁用图片/视频字段参与 section 生成（仅保留尺寸与布局）
* 禁用动效（motion off）
* 使用纯色/渐变占位（来自站点主题色或 section 主色）
* 优先确保：skeleton、section 顺序、内容层级、导航/页脚链接语义完整

输出：

* `spec-pack.json`（结构稳定）
* `style-profile.json`（结构版，无图片干扰）

## 21.2 阶段 B：图片回填（相似图/源站原图）

目标：在结构稳定基础上提升视觉相似度。

* 按 section 语义回填图片：`hero/story/approach/products/socialproof/contact`
* 图片来源策略：`source_or_gallery`（优先源图，缺失时相似图库）
* 禁止使用整段 section 截图作为背景填充
* 保留导航与页脚为真实 DOM 结构，不允许“整块贴图”

输出：

* `style-profile.json`（媒体增强版）
* 可交互预览（链接、按钮、导航可点击）

## 21.3 阶段 C：动效回填（最后执行）

目标：在评分稳定后补充轻量动效，避免先加动效造成比对噪声。

* 仅恢复低风险动效（hover、轻量 reveal）
* 禁止影响布局和截图稳定性的强动画
* 支持一键回退到 `motion=off` 做回归比对

## 21.4 默认策略（全站生效）

* 默认开启结构优先管线（对所有站点生效）
* Home 调试场景优先验证结构一致性，再扩展到其他 pageType
* 每阶段必须跑评分回归，分数下降即阻断进入下一阶段

## 21.5 验收门槛（建议）

* 阶段 A：结构相似度优先（section/顺序/语义完整）
* 阶段 B：视觉分数显著上升（目标 `90+`，再冲刺 `95+`）
* 阶段 C：补动效后分数不回退（允许微小波动，但不低于阶段 B）
