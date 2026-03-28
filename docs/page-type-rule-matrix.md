# 页面类型-规则矩阵（企业官网生成）

> 目标：为后续多 Skill 编排提供稳定的“页面类型 -> 生成规则 -> 组件约束 -> 质量门禁”映射，降低同构感并保持 Puck 可编辑性。

## 1. 页面类型总览

| 页面类型 | 典型路由 | 业务目标 | 主转化动作 |
|---|---|---|---|
| Home | `/` | 品牌首屏与全站分发 | Quote / Catalog |
| Core Product | `/core-product` | 单旗舰机型深描 | WhatsApp Quote |
| Products | `/products` `/3c-machines` | 产品族列表与参数筛选 | Request Catalog |
| Solutions | `/solutions` `/custom-solutions` | 按行业/流程给方案 | Discuss Solution |
| Cases | `/cases` | 应用案例与结果证明 | View Case / Contact |
| About | `/about` | 公司资质与可信背书 | Contact |
| Contact | `/contact` | 线索采集与快速响应 | Submit Request |
| Legal | `/privacy` `/terms` | 合规披露 | - |

## 2. 结构骨架矩阵（防同构）

| 页面类型 | Navbar 密度 | Hero 形态 | 首屏节奏 | 中部主骨架（顺序） | 分栏比例 |
|---|---|---|---|---|---|
| Home | `withCTA` + `xl` | `HeroSplit` | 慢节奏（品牌叙事） | Hero -> Products -> Features -> Proof -> CTA | `4/4/4` |
| Core Product | `withDropdown` + `2xl` | `HeroSplit`（偏规格） | 中节奏（参数导向） | Hero -> Story -> Specs -> Proof -> Product Snapshot | `1 + 3` |
| Products | `withDropdown` + `2xl` | `HeroSplit`（目录导向） | 中节奏 | Hero -> Catalog -> Specs -> Buyer Proof | `4/3/2` |
| Solutions | `withCTA` + `2xl` | `FeatureWithMedia reverse` | 快节奏（方法/流程） | Hero -> Categories -> Offers -> Implementation Proof | `3/3/2` |
| Cases | `simple` + `lg` | `FeatureWithMedia split` | 快节奏（结果先行） | Hero -> Feedback -> Case Gallery -> Metrics | `2/2/3` |
| About | `simple` + `xl` | `FeatureWithMedia simple` | 慢节奏（信任建立） | Hero -> Story -> Certifications -> Capability Cards | `2/2/2` |
| Contact | `withCTA` + `lg` | `LeadCaptureCTA card` | 快节奏（提交优先） | Hero(Form) -> Quote Requirements -> Channels | `1/2/3` |
| Legal | `simple` | 无强 Hero | 低节奏 | Policy Content | `1` |

## 3. 组件与字段约束矩阵（Puck 兼容）

| 页面类型 | 必选区块 | 可选区块 | 关键字段硬约束 |
|---|---|---|---|
| Home | Navbar, Hero, Products, Footer | Features, Proof, CTA | Hero title/subtitle/cta 必须来自 brief |
| Core Product | Navbar, Hero, Story, Footer | Specs, Proof | 单机型主卡至少 1 张，不允许回退成通用产品墙 |
| Products | Navbar, Hero, Catalog, Footer | Specs, Proof | 商品卡 3-8 张，禁止空卡/占位文案 |
| Solutions | Navbar, Hero, Categories, Footer | Process, Proof | 至少 1 个流程/方法区块 |
| Cases | Navbar, Hero, CaseGallery, Footer | Metrics, Proof | 案例项至少 2 条，不能与 Products 文案重复 |
| About | Navbar, Hero, Story, Footer | Certifications | 资质/团队/规模至少命中 1 类 |
| Contact | Navbar, LeadCapture, Footer | Channels, FAQ | 表单字段固定：Name/Company/Email/WhatsApp/Model/Qty/Deadline + Consent |
| Legal | Navbar, Content, Footer | - | 禁止营销 CTA 混入正文 |

## 4. 去重与一致性规则

| 规则类别 | 规则 |
|---|---|
| 路由去重 | 显式 Nav >= 3 时，禁注入默认企业页；同义路由归一（Products/Core Product、Solutions/Cases 分离） |
| 页面内去重 | 同一页面按“角色 + 标题语义 + 列表语义”做签名去重，不仅靠 anchor |
| 跨页去重 | 内页两两 role-shape 相似度 >= 0.95 记为告警（发布前门禁） |
| 文案保真 | 用户显式文案优先级最高：`user brief > structured parse > template default` |
| 主题一致 | palette/font/motion 必须全站一致，允许仅页面节奏不同 |

## 5. 多 Skill 编排建议（扩展用）

| Agent | 责任 | 输入 | 输出 |
|---|---|---|---|
| Architect Agent | 站点结构与页面分类 | prompt + structured brief | sitemap + page contracts |
| Theme Agent | 主题圣经与 token | brand + industry + style | theme contract |
| Home Skill | 首页叙事 | home contract + theme | home blocks |
| Product Skill | 产品页 | product contract + theme | catalog/spec/proof blocks |
| Solution Skill | 方案页 | solution contract + theme | process/offer blocks |
| Case Skill | 案例页 | case contract + theme | case/proof blocks |
| About Skill | 关于页 | about contract + theme | story/cert blocks |
| Contact Skill | 线索页 | contact contract + theme | lead form + channels blocks |
| Assembler Agent | 汇编与去重 | skill outputs + guards | Puck-compatible payload |
| QA Agent | 发布门禁 | payload + thresholds | pass/fail + report |

## 6. 质量门禁（商用标准）

| 指标 | 通过阈值 |
|---|---|
| 页面覆盖率 | >= 0.85 |
| 链接完整性 | >= 0.95 |
| 主题一致性 | >= 0.90 |
| 中部区块密度 | >= 0.75 |
| 语义保真度 | >= 0.90 |
| 总分 | >= 0.90 |

## 7. 新增页面类型接入流程

1. 在页面分类层新增 `pageType` 与路由映射。  
2. 定义该类型的 Navbar/Hero/中部骨架节奏与分栏。  
3. 注册对应 Skill 输入输出契约（section kinds + required fields）。  
4. 加入页面内/跨页去重白名单与黑名单。  
5. 增加回归用例（strategy + browser）并更新阈值。  
6. 确认输出仍可在 Puck Editor 中直接编辑。  

## 8. 代码配置映射（DSL）

- 当前矩阵 DSL 文件：`/Users/beihuang/.codex/worktrees/7bc2/shpitto_tools/builder/src/lib/agent/page-rule-matrix.ts`
- 生效模块：
  - `page-classifier`（页面分类、label->path 映射）
  - `skill-orchestrator`（section 优先级、策略建议）
- 扩展规则时优先改 DSL，不改 `p2w-graph` 主流程代码。
