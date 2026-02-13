export const architectSystemPrompt = `你是一个拥有 10 年经验的 UI/UX 架构师，擅长从模糊需求中规划网站结构与视觉策略。
基于用户需求产出结构化网站蓝图（多页面），不要输出解释文本，只返回 JSON（不要使用 Markdown 或代码块）。
注意：只输出 theme + pages + sections，不输出任何代码。并提供 themeContract 约束主题一致性与可控突破。
优先包含产品类强表现力模块（例如 ProductCatalog / ProductComparison / SpecsTable / BundleGrid / Filters），并给出 layoutHint。
必须输出 designNorthStar（结构化设计北极星），并确保行业与产品与用户需求一致，禁止跨行业内容。
designNorthStar 的所有内容必须根据用户输入动态推断与生成，禁止照搬示例或硬编码特定行业/品类。
全局基调色必须从用户提供的信息中提取或推断（行业/风格/品牌描述），不允许套用预置默认调色板；若用户未明确颜色，基于行业与 styleDNA 推断，避免默认黑底。
主题色禁止输出具体 RGB/hex，必须通过 paletteRef 的数字索引表达。
themeContract.tokens 只能使用语义 token（如 primary/accent/background/foreground），禁止输出具体 RGB/hex。
若需要统一对齐，请在 themeContract.layoutRules.sectionAlignOverrides 中声明（按 Section 类型或 id）。`;

const compositionPresetCatalog = `# Composition Preset IDs (pick ONE per section)
Hero: H01 (split showcase), H02 (image-led), H03 (centered)
Features: F01 (3-up cards), F02 (bento grid), F03 (icon list)
Gallery/Showcase: G01 (masonry), G02 (carousel), G03 (stacked)
Specs/Comparison: S01 (two-col table), S02 (row cards), CP01 (comparison table)
Products: P01 (catalog grid), P02 (filter + grid), P03 (bundle grid)
Trust/Logos: L01 (logo marquee), L02 (badge grid)
Stats: ST01 (stat tiles), ST02 (stat strip)
Timeline/Process: TL01 (horizontal steps), PR01 (vertical steps)
Testimonials: T01 (card carousel), T02 (quote grid)
Pricing: PRC01 (3-tier grid)
CTA/Lead: C01 (split form), C02 (centered banner), C03 (image + form)
Content/Philosophy: CN01 (centered text block), CN02 (split content + media)
FAQ: Q01 (accordion), Q02 (two-column)
Team: TM01 (profile grid)
Blog/News: B01 (article cards)
Integrations: IN01 (logo grid + steps)
Case Study: CS01 (story split)
Contact: CT01 (form + info), MP01 (map + details), FRM01 (detailed form)
Footer: FT01 (footer columns)`;

const magicComponentApiGuide = `# Magic UI Component APIs (必须遵守)
- SceneSwitcher: <SceneSwitcher items={[{ id?: string, title: string, description?: string, image?: string, eyebrow?: string }]} variant="auto|tabs|carousel" />
  - items 必须使用 title/description/image 字段，禁止 label/content 作为主字段。
- ComparisonSlider: <ComparisonSlider beforeSrc="..." afterSrc="..." beforeAlt="..." afterAlt="..." className="..." />
  - 必需 props: beforeSrc, afterSrc（若已有 beforeImage/afterImage，请映射到 beforeSrc/afterSrc）。`;

export const architectOutputSchema = `{
  "designNorthStar": {
    "styleDNA": ["string", "string", "string"],
    "typographyScale": "string",
    "visualHierarchy": "string",
    "imageMood": "string",
    "industry": "string",
    "coreProducts": ["string", "string", "string"],
    "typeScale": {
      "h1": "text-5xl md:text-7xl",
      "h2": "text-4xl md:text-6xl",
      "h3": "text-2xl md:text-4xl",
      "body": "text-base md:text-lg",
      "small": "text-sm"
    },
    "motionSpec": {
      "duration": "0.6-0.9s",
      "stagger": "0.08-0.16s",
      "easing": "ease-expo-out | ease-smooth"
    }
  },
  "theme": {
    "mode": "dark|light",
    "paletteRef": {
      "primaryIndex": 1,
      "accentIndex": 2
    },
    "radius": "0.5rem",
    "fontHeading": "font name",
    "fontBody": "font name",
    "motion": "showcase|subtle|off",
    "tokens": {
      "surface": "card|glass|solid",
      "border": "soft|strong",
      "shadow": "soft|dramatic",
      "accent": "glow|flat"
    },
    "layoutRules": {
      "maxWidth": "1200px",
      "sectionPadding": "py-20",
      "grid": "12-col",
      "sectionAlignOverrides": {
        "Features": "center",
        "Specs": "center"
      }
    },
    "themeContract": {
      "voice": "minimal|luxury|tech|art|industrial|fashion",
      "tokens": {
        "primary": "primary",
        "accent": "accent",
        "neutral": "neutral",
        "bg": "background",
        "text": "foreground",
        "textSecondary": "muted-foreground",
        "metallic": "metallic",
        "radiusScale": "sm|md|lg",
        "shadowScale": "soft|medium|strong"
      },
      "layoutRules": {
        "maxWidth": "1200px",
        "sectionPadding": "py-20",
        "grid": "12-col",
        "sectionAlignOverrides": {
          "Features": "center",
          "Specs": "center"
        }
      },
      "motionRules": {
        "durationBase": 0.6,
        "easing": "easeOut|easeInOut",
        "distanceScale": "sm|md|lg",
        "intensity": "subtle|showcase"
      },
      "breakoutBudget": {
        "allowedSections": ["hero", "showcase"],
        "colorBoost": 1.3,
        "motionBoost": 1.5,
        "layoutVariants": ["asymmetric", "full-bleed"]
      }
    }
  },
  "pages": [
    {
      "path": "/",
      "name": "Home",
      "sections": [
        {
          "id": "hero",
          "type": "Hero",
          "intent": "展示核心价值，必须震撼",
          "propsHints": { "ctaLabel": "立即开始", "imageStyle": "产品截图" },
          "layoutHint": {
            "structure": "dual",
            "density": "spacious",
            "align": "center",
            "media": "image-right",
            "list": "cards",
            "compositionPreset": "H01"
          }
        }
      ]
    }
  ]
}`;

export const builderSystemPrompt = `你是精通 Magic UI、shadcn/ui、Tailwind CSS 和 Puck 的前端专家。
你的任务是根据单个 section 输出完整可运行的 React 组件代码，并生成该 section 的 Puck block。
必须使用工具输出结构化 JSON，不要输出解释文本（不要使用 Markdown 或代码块）。`;

export const assetPromptPack = `# Asset Prompt Pack
- Image style: follow designNorthStar.imageMood + styleDNA; if missing, infer from user prompt + industry
- Color mood: follow user/brand palette and theme.palette.primary/accent; if none, infer from industry + styleDNA
- Consistency: all product images must share one background style and lighting direction; avoid mixing studio packshot and lifestyle scenes in the same section set
- Background: avoid saturated color backdrops; prefer monochrome or neutral gradients consistent with theme
- Background style: pick ONE and use across all product images (neutral studio solid, controlled lifestyle environment, or low-contrast monochrome gradient)
- Composition: align with product category and visualHierarchy; avoid generic stock look
- PaletteRef: if theme.paletteRef exists, select colors by numeric indices — primary = palette.text[primaryIndex-1], accent = palette.text[accentIndex-1]; do not output any hex, only semantic tokens or palette references
- Avoid: low-res, noisy backgrounds, inconsistent lighting, watermarks`;

type ManifestEntry = { name?: unknown; import?: unknown };

const compactManifestEntries = (entries: unknown) => {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      const name = typeof (entry as ManifestEntry)?.name === "string" ? String((entry as ManifestEntry).name) : "";
      const importPath =
        typeof (entry as ManifestEntry)?.import === "string" ? String((entry as ManifestEntry).import) : "";
      if (!name && !importPath) return null;
      return importPath ? { name, import: importPath } : { name };
    })
    .filter(Boolean);
};

const buildCompactManifest = (manifest: unknown) => {
  const source = manifest as Record<string, unknown>;
  return {
    magic_ui: compactManifestEntries(source?.magic_ui),
    shadcn: compactManifestEntries(source?.shadcn),
    libraries: compactManifestEntries(source?.libraries),
  };
};

const buildMagicImportHints = (manifest: unknown, limit = 20) => {
  const source = manifest as Record<string, unknown>;
  const entries = Array.isArray(source?.magic_ui) ? source.magic_ui : [];
  return entries
    .map((entry) => {
      const name = typeof (entry as ManifestEntry)?.name === "string" ? String((entry as ManifestEntry).name) : "";
      const importPath =
        typeof (entry as ManifestEntry)?.import === "string" ? String((entry as ManifestEntry).import) : "";
      if (!name || !importPath) return null;
      return { name, import: importPath };
    })
    .filter(Boolean)
    .slice(0, limit);
};

const builderPromptUserMaxChars = Number(process.env.BUILDER_PROMPT_USER_MAX_CHARS || 420);

const summarizeUserRequest = (prompt: string, maxChars = builderPromptUserMaxChars) => {
  const lines = String(prompt || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (!lines.length) return "";

  const picked: string[] = [];
  const keywordPattern =
    /(品牌|风格|语气|视觉|配色|字体|行业|产品|受众|目标|section|hero|navigation|footer|cta|social|story)/i;

  for (const line of lines) {
    if (!picked.length) {
      picked.push(line);
      continue;
    }
    if (keywordPattern.test(line)) picked.push(line);
    if (picked.join(" | ").length >= maxChars) break;
    if (picked.length >= 8) break;
  }

  const summary = picked.join(" | ");
  if (summary.length <= maxChars) return summary;
  return `${summary.slice(0, Math.max(0, maxChars - 16))}...[truncated]`;
};

const buildBrandConsistencyBrief = (prompt: string, designNorthStar: unknown, theme: unknown) => {
  const dns = summarizeDesignNorthStar(designNorthStar);
  const themed = summarizeTheme(theme);
  return {
    requestSummary: summarizeUserRequest(prompt),
    styleDNA: Array.isArray((dns as any)?.styleDNA) ? (dns as any).styleDNA.slice(0, 3) : [],
    imageMood: (dns as any)?.imageMood,
    visualHierarchy: (dns as any)?.visualHierarchy,
    industry: (dns as any)?.industry,
    voice: (themed as any)?.themeContract?.voice,
    consistencyGuardrails: [
      "跨 section 保持同一品牌语气与色彩语义",
      "保持统一字体体系与动效节奏",
      "禁止跨行业和与用户意图无关内容",
    ],
  };
};

export function buildArchitectUserPrompt(prompt: string, manifest: unknown) {
  return `用户需求：${prompt}

可用组件清单（精简，仅名称/导入路径）：\n${JSON.stringify(buildCompactManifest(manifest), null, 2)}\n\n${compositionPresetCatalog}\n
输出必须是以下 JSON 结构：\n${architectOutputSchema}`;
}

export type BuilderPromptOptions = {
  prompt: string;
  manifest: unknown;
  theme: unknown;
  designNorthStar?: unknown;
  themeClassMap?: unknown;
  motionPresets?: unknown;
  compositionPreset?: unknown;
  breakoutBudget?: unknown;
  breakoutRequired?: boolean;
  constraints?: unknown;
  creativeGuidance?: unknown;
  page: unknown;
  section: unknown;
  sectionIndex: number;
};

const buildSectionQualityRules = (section: unknown) => {
  const type = typeof (section as any)?.type === "string" ? String((section as any).type) : "";
  const id = typeof (section as any)?.id === "string" ? String((section as any).id) : "";
  const key = `${type} ${id}`.toLowerCase();
  const rules: string[] = [];
  if (/(philosophy|content|story|manifesto)/i.test(key)) {
    rules.push("内容区必须半屏以上高度，使用 min-h-[50vh]+ 并保证留白。");
  }
  if (/(navbar|navigation|nav)/i.test(key)) {
    rules.push("导航链接数量上限 6，短标签优先，链接之间需明显间距（gap >= space-4）。");
    rules.push("导航链接标签最多两个英文单词，避免过长或多词堆叠。");
    rules.push("导航区需保持清晰层级：Logo/链接/CTA 三段分区，避免拥挤。");
  }
  if (/(hero|precision)/i.test(key)) {
    rules.push("主 CTA 按钮需有舒适内边距（py-4 px-8 或等效），避免过小边距。");
  }
  if (/(features|core|value|benefit)/i.test(key)) {
    rules.push("Bento/特性卡片必须使用 grid-flow-dense + auto-rows，保证卡片高度一致、排版清晰。");
    rules.push("卡片圆角与图片圆角必须统一（建议 rounded-2xl/rounded-3xl），文本位置保持一致（优先底部叠层）。");
    rules.push("卡片 hover 需要轻微上浮与阴影增强，图片 hover 轻微放大。");
    rules.push("Bento 卡片统一圆角 24px（rounded-3xl 或等效），禁止混用圆角等级。");
    rules.push("标题对齐必须严格遵守 layoutHint.align（center 必须 text-center，start 不得居中）。");
  }
  if (/(showcase|experience|scene|gallery)/i.test(key)) {
    rules.push("场景展示避免左图右文列表，优先网格/分栏/叠层展示。");
    rules.push("场景图风格必须统一，避免彩色背景与实拍场景混搭。");
    rules.push(
      "若 compositionPreset=G02 或 layoutHint 指向 carousel，必须使用 <SceneSwitcher items={[...]} />（内部自动 Tabs/Carousel），禁止手写轮播。"
    );
    rules.push("场景数量 > 3 时，使用横向滑动容器或轮播结构（overflow-x + snap 或等效），避免静态列表挤压。");
    rules.push("网格展示时必须填满行列，最后一行需调整列数或使用 span 让元素撑满。");
    rules.push("图片圆角与卡片边框样式需统一，避免圆角图片叠加明显边框产生割裂感。");
  }
  if (/(specs|specification|technical)/i.test(key)) {
    rules.push("规格区避免纯表格，优先使用图标 + 大数字 + 简短说明的统计卡片形式。");
    rules.push("核心参数需形成视觉主次（大数字/单位/说明），并使用统一的对齐与间距。");
    rules.push("规格数值优先使用 NumberTicker/AnimatedBeam/ComparisonSlider 等动态组件（若可用），否则用 shadcn/ui + motion 实现动态展示。");
    rules.push("规格区标题对齐必须严格遵守 layoutHint.align（center 必须 text-center，start 不得居中）。");
  }
  if (/(detail|craft|craftsmanship|materials|design)/i.test(key)) {
    rules.push("细节区图片必须提供放大镜交互（悬停放大局部），保持镜片与放大区域风格统一。");
    rules.push("细节区采用网格布局时必须填满行列避免留白，尤其 4 张图时不得出现空白区域。");
    rules.push("细节区网格必须使用 grid-flow-dense 与明确的 col-span/row-span 规则。");
  }
  if (/(comparison|compare|versus)/i.test(key)) {
    rules.push("对比区 Badge 必须使用高对比度标签样式（优先 shadcn Badge），位置采用绝对定位，不影响卡片内部布局。");
  }
  if (/(trust|logo|badge)/i.test(key)) {
    rules.push("Logo 轮播必须使用 <Marquee items={[...]} />，禁止 children 方式。");
    rules.push("图片链接必须为可访问的 https URL，禁止使用占位或无效链接。");
    rules.push("若包含统计卡，必须展示“大数字 + 标签 + 辅助图标”三层信息，不允许只剩文字导致留白。");
    rules.push("认证/证书项图标不得为空；当 icon 缺失时必须自动回退到默认 icon（如 Award）。");
  }
  if (/(cta|lead|contactcta)/i.test(key)) {
    rules.push("CTA 按钮 padding 规范：py-4 px-8（lg:px-10），不要过高纵向间距。");
    rules.push("Secondary CTA 必须具备明显描边或对比底色，确保可点击性可见。");
    rules.push("CTA 按钮必须使用 <Button size=\"lg\">，secondary 使用 variant=\"secondary\"。");
  }
  if (/(footer)/i.test(key)) {
    rules.push("Footer 列间距 >= gap-8，标题/链接层级清晰，避免文字拥挤。");
  }
  if (!rules.length) return "";
  return `# Section Quality Rules\n${rules.map((rule) => `- ${rule}`).join("\n")}\n`;
};

const compactNameList = (entries: unknown, limit = 32) => {
  if (!Array.isArray(entries)) return [];
  const names = entries
    .map((entry) => (typeof (entry as ManifestEntry)?.name === "string" ? String((entry as ManifestEntry).name) : ""))
    .filter(Boolean);
  return Array.from(new Set(names)).slice(0, limit);
};

const buildNameOnlyManifest = (manifest: unknown) => {
  const source = manifest as Record<string, unknown>;
  return {
    magic_ui: compactNameList(source?.magic_ui),
    shadcn: compactNameList(source?.shadcn),
    libraries: compactNameList(source?.libraries, 12),
  };
};

const summarizeDesignNorthStar = (value: unknown) => {
  const source = value as Record<string, unknown>;
  return {
    styleDNA: Array.isArray(source?.styleDNA) ? source.styleDNA : [],
    visualHierarchy: source?.visualHierarchy,
    imageMood: source?.imageMood,
    industry: source?.industry,
    coreProducts: Array.isArray(source?.coreProducts) ? source.coreProducts : [],
  };
};

const summarizeTheme = (value: unknown) => {
  const source = value as Record<string, any>;
  return {
    mode: source?.mode,
    radius: source?.radius,
    fontHeading: source?.fontHeading,
    fontBody: source?.fontBody,
    motion: source?.motion,
    paletteRef: source?.paletteRef,
    themeContract: {
      voice: source?.themeContract?.voice,
      layoutRules: source?.themeContract?.layoutRules,
      tokens: source?.themeContract?.tokens,
    },
  };
};

const summarizeConstraints = (value: unknown) => {
  const source = value as Record<string, any>;
  return {
    tokens: source?.tokens,
    layoutRules: source?.layoutRules,
    maxItems: source?.maxItems,
  };
};

const shouldIncludeAssetPromptPack = (section: unknown) => {
  const type = typeof (section as any)?.type === "string" ? String((section as any).type) : "";
  const id = typeof (section as any)?.id === "string" ? String((section as any).id) : "";
  const token = `${type} ${id}`.toLowerCase();
  return /(hero|showcase|gallery|social|testimonial|story|studio|product|catalog|case|portfolio|cta)/.test(token);
};

export function buildBuilderUserPrompt(options: BuilderPromptOptions) {
  const {
    prompt,
    manifest,
    theme,
    designNorthStar,
    themeClassMap,
    motionPresets,
    compositionPreset,
    breakoutBudget,
    breakoutRequired,
    constraints,
    creativeGuidance,
    page,
    section,
    sectionIndex,
  } = options;
  const sectionRules = buildSectionQualityRules(section);
  const brandBrief = buildBrandConsistencyBrief(prompt, designNorthStar, theme);
  const includeAssetPromptPack = shouldIncludeAssetPromptPack(section);
  const magicImportHints = buildMagicImportHints(manifest);
  return `# Context\n品牌与一致性简报：\n${JSON.stringify(brandBrief, null, 2)}\n\n可用组件（名称）：\n${JSON.stringify(
    buildNameOnlyManifest(manifest),
    null,
    2
  )}\n\nMagic 组件导入映射（必须使用）：\n${JSON.stringify(
    magicImportHints,
    null,
    2
  )}\n\n${magicComponentApiGuide}\n\n设计北极星（摘要）：\n${JSON.stringify(
    summarizeDesignNorthStar(designNorthStar),
    null,
    2
  )}\n\n主题（摘要）：\n${JSON.stringify(
    summarizeTheme(theme),
    null,
    2
  )}\n\n页面：\n${JSON.stringify(
    page,
    null,
    2
  )}\n\nTheme Class Map：\n${JSON.stringify(
    themeClassMap ?? {},
    null,
    2
  )}\n\nMotion Presets：\n${JSON.stringify(
    motionPresets ?? {},
    null,
    2
  )}\n\nComposition Preset Rules：\n${JSON.stringify(
    compositionPreset ?? {},
    null,
    2
  )}\n\nConstraints（摘要）：\n${JSON.stringify(
    summarizeConstraints(constraints),
    null,
    2
  )}\n\nCreative Guidance：\n${JSON.stringify(
    creativeGuidance ?? {},
    null,
    2
  )}\n\n${includeAssetPromptPack ? `${assetPromptPack}\n\n` : ""}# Section Shell (必须严格使用)\n- sectionPadding: ${String((themeClassMap as any)?.sectionPadding ?? "")}\n- container: ${String((themeClassMap as any)?.container ?? "")}\n- heading: ${String((themeClassMap as any)?.heading ?? "")}\n- body: ${String((themeClassMap as any)?.body ?? "")}\n\nSection（序号 ${sectionIndex + 1}）：\n${JSON.stringify(
    section,
    null,
    2
  )}\n\n${sectionRules}# Task\n只生成这个 section 的一个独立组件和对应 Puck block。\n\n# Layout Hint Mapping (必须使用)\n- structure: single | dual | triple | split\n  - single => \"grid grid-cols-1\"\n  - dual => \"grid grid-cols-1 xl:grid-cols-12\"\n  - triple => \"grid grid-cols-1 xl:grid-cols-12\"\n  - split => \"grid grid-cols-1 xl:grid-cols-12\"\n- density: compact | normal | spacious\n  - compact => \"gap-4\"\n  - normal => \"gap-6\"\n  - spacious => \"gap-8\"\n- align: start | center\n  - start => \"items-start\"\n  - center => \"items-center\"\n- list: cards | tiles | rows\n  - cards/tiles => \"grid\" + \"gap-6\" and responsive columns\n  - rows => \"space-y-4\"\n\n# Strict Constraints\n1. 必须使用 shadcn/ui 与 Magic UI 组件，不要使用原生 HTML 标签作为布局组件（允许最外层 Fragment）。\n2. 组件导出 default React 组件，并 export const config = { fields, defaultProps }。\n3. 文案、图片 URL、列表数据必须提升为 props。\n4. Hero/主标题必须使用 <TextReveal>，深色 hero 必须包含 <Particles>。\n5. Tailwind 负责布局与视觉，避免内联样式。\n6. 组件命名唯一、语义化，确保 block.type === component.name。\n7. 所有 list render（map）必须显式添加唯一 key。
8. 默认严格遵守 themeContract（字体/颜色/布局/动效），只有在 breakoutBudget 允许的 section 才能突破。
9. 文案风格必须匹配 themeContract.voice。
10. 必须优先使用 Theme Class Map 与 Motion Presets；className 与动效参数来自映射，不要自创风格。
11. 必须依据 layoutHint 应用 layout classes（见上方映射），不得忽略。
12. Section 外层必须使用 Theme Class Map 的 sectionPadding + container 作为壳（例如 className={themeClassMap.sectionPadding} 与 className={themeClassMap.container}）。
13. 标题必须使用 Theme Class Map 的 heading，正文必须使用 Theme Class Map 的 body。
14. 文案与内容必须与用户行业/产品一致，禁止跨品类或无关领域内容。
15. 标题必须精炼（中文 ≤ 8 字），禁止“重新定义/颠覆/划时代/革命性”等营销词。
16. 仅允许一个品牌强调色，禁止多强调色与高饱和渐变叠加。
17. 深色背景正文禁止使用过细字重（font-thin/font-light），标题至少 font-medium。
18. 必须遵守 Composition Preset Rules（如果存在），不得违背 requiredClasses。
19. 列表/卡片区块优先使用 useInViewReveal（从 @/lib/motion 导入）启用入场；Hero 预设（H*）优先使用 useParallaxY 作用于视觉媒体容器。
20. 若 breakoutRequired=YES，必须在 section outer 或关键容器上使用 breakoutHero / breakoutShowcase / breakoutFullBleed 中至少一个 class。
21. 所有 Link/links/cta/导航/页脚链接必须使用对象格式 { label: string, href: string, variant?: "primary" | "secondary" | "link" }，禁止使用 { link: "..." } 或字符串数组。
22. 高优先级 section 必须从 Theme Class Map.effects 使用至少 1 个效果（glowButton / glassCard / gradientText / hoverLift / hoverUnderline）。
23. 若 Constraints.layoutRules.asymmetricSplit 存在，split/dual 结构必须使用 12 栅格的 5/7 或 7/5 划分。
24. 必须通过工具输出结构化 JSON（component + block），不要输出 NDJSON 或任何解释文本。`;
}

export function buildBuilderCompactUserPrompt(options: BuilderPromptOptions) {
  const {
    prompt,
    manifest,
    theme,
    designNorthStar,
    themeClassMap,
    motionPresets,
    compositionPreset,
    constraints,
    page,
    section,
    sectionIndex,
  } = options;
  const sectionRules = buildSectionQualityRules(section);
  const brandBrief = buildBrandConsistencyBrief(prompt, designNorthStar, theme);
  const magicImportHints = buildMagicImportHints(manifest);
  return `# Compact Tool Context
你必须调用工具 builder_section，并返回严格 JSON（component + block）。

品牌与一致性简报：${JSON.stringify(brandBrief, null, 2)}

可用组件（名称）：${JSON.stringify(buildNameOnlyManifest(manifest), null, 2)}

Magic 组件导入映射（必须使用）：${JSON.stringify(magicImportHints, null, 2)}

${magicComponentApiGuide}

设计北极星（摘要）：${JSON.stringify(summarizeDesignNorthStar(designNorthStar), null, 2)}

主题（摘要）：${JSON.stringify(summarizeTheme(theme), null, 2)}

页面：${JSON.stringify(page, null, 2)}

Section（序号 ${sectionIndex + 1}）：${JSON.stringify(section, null, 2)}

Theme Shell（必须使用）：
- sectionPadding: ${String((themeClassMap as any)?.sectionPadding ?? "")}
- container: ${String((themeClassMap as any)?.container ?? "")}
- heading: ${String((themeClassMap as any)?.heading ?? "")}
- body: ${String((themeClassMap as any)?.body ?? "")}

Motion Presets：${JSON.stringify(motionPresets ?? {}, null, 2)}
Composition Preset：${JSON.stringify(compositionPreset ?? {}, null, 2)}
Constraints（摘要）：${JSON.stringify(summarizeConstraints(constraints), null, 2)}

${sectionRules}# Hard Requirements
1. 必须使用 shadcn/ui 或 Magic UI 组件。
2. 必须导出 default 组件，并导出 config = { fields, defaultProps }。
3. block.type 必须等于 component.name。
4. 外层必须使用 sectionPadding + container，标题使用 heading，正文使用 body。
5. 必须遵守 layoutHint 与 compositionPreset.requiredClasses。
6. 所有 map 渲染必须带 key。
7. 只输出工具 JSON：{ component, block }，不要 Markdown，不要解释文本。

# Layout Hint Mapping
- structure: single | dual | triple | split => single: grid-cols-1；其余使用 xl:grid-cols-12
- density: compact | normal | spacious => gap-4 | gap-6 | gap-8
- align: start | center => items-start | items-center
- list: cards | tiles | rows => cards/tiles 用 grid，rows 用 space-y-4

# Task
只生成这个 section 的独立组件和对应 Puck block。若复杂约束冲突，优先保证组件可运行、结构清晰、输出合法。`;
}
