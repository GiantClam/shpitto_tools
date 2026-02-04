# Findings & Decisions
<!-- 
  WHAT: Your knowledge base for the task. Stores everything you discover and decide.
  WHY: Context windows are limited. This file is your "external memory" - persistent and unlimited.
  WHEN: Update after ANY discovery, especially after 2 view/browser/search operations (2-Action Rule).
-->

## Requirements
<!-- 
  WHAT: What the user asked for, broken down into specific requirements.
  WHY: Keeps requirements visible so you don't forget what you're building.
  WHEN: Fill this in during Phase 1 (Requirements & Discovery).
  EXAMPLE:
    - Command-line interface
    - Add tasks
    - List all tasks
    - Delete tasks
    - Python implementation
-->
<!-- Captured from user request -->
- Fix P2W output issues for run `p2w_1770027393929` (global dark background, section layout/spacing issues, broken TrustLogos, CTA button padding, Footer layout).
- Address root causes in generation pipeline to avoid recurrence, especially on desktop.
- Implement recommended fixes (prompt/normalization/guardian) after confirming theme direction.

## Research Findings
<!-- 
  WHAT: Key discoveries from web searches, documentation reading, or exploration.
  WHY: Multimodal content (images, browser results) doesn't persist. Write it down immediately.
  WHEN: After EVERY 2 view/browser/search operations, update this section (2-Action Rule).
  EXAMPLE:
    - Python's argparse module supports subcommands for clean CLI design
    - JSON module handles file persistence easily
    - Standard pattern: python script.py <command> [args]
-->
<!-- Key discoveries during exploration -->
- Planning templates are available at `/Users/beihuang/.codex/skills/planning-with-files/templates/`.
- `CLAUDE_PLUGIN_ROOT` is not set in this environment (session-catchup script failed when referenced).
- Target document located at `docs/Planning-with-Files集成方案.md`.
- Planning-with-Files model: three files (`task_plan.md`, `findings.md`, `progress.md`) + workflow to re-read on context overflow.
- Integration proposal suggests a PlanningAgent to initialize files, update progress, complete phases, and recover state.
- Suggested batching strategy: generate sections in batches (3-5) with phase tracking; re-read files before each batch for quality stability.
- P2W generation is triggered in `builder/src/app/api/creation/route.ts` and passes `manifest` from `@/skills/manifest.json` into `generateP2WProject`.
- Skills manifest lives at `builder/src/skills/manifest.json` and is a static list of Magic UI + shadcn + libraries.
- No existing planning-with-files references found in `asset-factory/pipelines` or `asset-factory/asset-factory` via initial search.
- Pipeline entrypoint appears to be `asset-factory/pipelines/run.py`, orchestrating capture/extract/map/build steps.
- planning-with-files repo provides multi-IDE skill folders (including `.opencode/skills/planning-with-files`) plus root `templates/` and `scripts/` used by hooks. citeturn1view0
- P2W generation uses a graph in `builder/src/lib/agent/p2w-graph.ts` with `architect` → `builder` nodes and section-level concurrency; normalization + guardian checks happen after section build.
- Local repo has a `skills/` collection (including planning-with-files) and README documents copying skills into `~/.opencode/skills/` plus mixed trigger usage. 
- Repo `skills/` directory includes `planning-with-files` and other skill packs, with SKILL.md content aligning to the 3-file pattern and activation rules.
- Implemented PlanningFiles helper + p2w graph integration to write per-run planning files and checkpoints.
- Creation API now supports planning persistence per run and resume via `resumeId` (plan files stored under `asset-factory/out/p2w/<id>`).
- 信息增强Agent方案文档位于 `docs/信息增强Agent完整方案.md`。
- 信息增强方案包含：Extractor → Enricher（检索/行业知识）→ Conversational Guide（可选）→ Requirement Generator。
- 方案给出完整流程与集成示例（generate_with_enrichment.py），并强调生成 requirement_doc 后交给 Planner。
- 需求文档生成器要求输出 product_overview / target_audience / website_goals / required_sections / design_direction，并强制包含 Hero。
- 资产管线使用 OpenRouter（见 `asset-factory/pipelines/llm_filler.py`）并已加载 .env 以供 LLM 调用。
- 已新增 PlanningAgent 相关模块（extract/enrich/requirement）并在 `asset-factory/pipelines/run.py` 增加 `--plan-input/--plan-output`。
- P2W output `asset-factory/out/p2w/p2w_1770027393929/result.json` shows global `theme.mode: dark` with `themeContract.tokens.bg: #0A0A0A` and sections generated under `pages[0].data.content`.
- Sections present in that run: HeroSilenceRedefined, PhilosophySection, CoreFeaturesSection, CraftShowcase, ExperienceScenes, SpecsSection, TrustLogos, CTASection, FooterMinimal.
- All generated section components in this run hardcode dark backgrounds (e.g., `bg-[#0A0A0A]`), suggesting theme contract values are inlined into component code rather than using neutral theme classes.
- PhilosophySection renders centered text but lacks any min-height or spacing beyond section padding; no height scaling for emphasis.
- ExperienceScenes uses a stacked list of cards with left image / right text grid, which matches the “普通左图右文列表” complaint.
- CraftShowcase uses a 12-col grid but all items are full width on small screens; layout may feel left-heavy on large screens due to col-span mix and no balancing wrapper.
- CTASection hardcodes `px-12 py-6` on both buttons, causing excessive vertical padding and narrow horizontal rhythm compared to container spacing.
- `buildThemeClassMap` defines per-style `styleTokens.section` (e.g., minimal uses `bg-background`, tech uses `bg-slate-950/60`), but current generated components ignore these tokens and inline hard-coded colors.
- Builder prompts are assembled in `builder/src/lib/agent/prompts` via `buildBuilderUserPrompt`, fed `themeClassMap` (sans variants) and `themeContract`.
- Builder prompt already instructs to avoid inline styles and to use Theme Class Map (sectionPadding/container/heading/body), but generated components still contain inline styles and custom hard-coded colors.
- ConsistencyGuardian `normalizeThemeContract` only merges defaults and does not sanitize tokens (e.g., `bg`/`text`) or adapt theme mode; no safeguard against unintended dark themes.
- Blueprint layoutHint mappings for the problematic run: Philosophy (CN01, single/center), CoreFeatures (F02 bento, triple), CraftShowcase (G01 masonry, split), ExperienceScenes (G03 stacked, dual), Specs (S01 two-col), Trust (L01 marquee), CTA (C02 centered), Footer (FT01 columns).
- Composition preset G03 is defined as "Gallery stacked" with `list: rows` + required `space-y-4`, which explains the ordinary left-image/right-text list style in ExperienceScenes.
- Magic UI `Marquee` component expects an `items` prop and is a named export; TrustLogos currently imports it as default and passes children, which would render nothing.
- `applyCompositionDefaults` forces preset layout when `layoutHint.compositionPreset` is provided, so architect-selected G03 rows will override any list/card intent unless we remap the preset.
- Implemented plan: add user-driven theme inference in `p2w-graph.ts` (applyUserThemeIntent) and update architect prompt to avoid prebuilt palettes; assetPromptPack now references user/brand palette.
- Added section-specific prompt rules (min-height for philosophy, grid-flow-dense for features, non-list showcase, specs table alignment, Marquee usage, CTA padding, footer spacing) and composition preset tweaks (F02/G01/CN01 required classes, G03 override for experience scenes).
- User confirmed global palette may be inferred from user info; applyUserThemeIntent now infers base palette from prompt + designNorthStar when no explicit colors are provided.
- Regenerated P2W with the provided prompt; persisted run `p2w_1770033727360` uses a light neutral theme (`bg: #F5F7FA`, `text: #111827`) and has `errors: []`.
- Manually updated `LifestyleScenarios` in that run to use a 3-column grid (avoid left-image/right-text list layout).
- Updated themeContract to use semantic tokens (no RGB/hex) and moved actual palette values to `theme.palette`.
- Updated `p2w_1770033727360/result.json` to store palette under `theme.palette` and replace themeContract tokens with semantic names.

## Technical Decisions
<!-- 
  WHAT: Architecture and implementation choices you've made, with reasoning.
  WHY: You'll forget why you chose a technology or approach. This table preserves that knowledge.
  WHEN: Update whenever you make a significant technical choice.
  EXAMPLE:
    | Use JSON for storage | Simple, human-readable, built-in Python support |
    | argparse with subcommands | Clean CLI: python todo.py add "task" |
-->
<!-- Decisions made with rationale -->
| Decision | Rationale |
|----------|-----------|
| Use local templates from skill path | `CLAUDE_PLUGIN_ROOT` unset; direct path is reliable |
| Persist per-run planning files under `asset-factory/out/p2w/<id>` | Keeps planning tied to generation output and recoverable |
| Add `planning_state.json` checkpoint | Machine-readable resume without parsing markdown |

## Issues Encountered
<!-- 
  WHAT: Problems you ran into and how you solved them.
  WHY: Similar to errors in task_plan.md, but focused on broader issues (not just code errors).
  WHEN: Document when you encounter blockers or unexpected challenges.
  EXAMPLE:
    | Empty file causes JSONDecodeError | Added explicit empty file check before json.load() |
-->
<!-- Errors and how they were resolved -->
| Issue | Resolution |
|-------|------------|
| session-catchup.py path resolution failed | Used direct templates path under ~/.codex/skills |
| git status failed (not a git repository) | Skipped git status |

## Resources
<!-- 
  WHAT: URLs, file paths, API references, documentation links you've found useful.
  WHY: Easy reference for later. Don't lose important links in context.
  WHEN: Add as you discover useful resources.
  EXAMPLE:
    - Python argparse docs: https://docs.python.org/3/library/argparse.html
    - Project structure: src/main.py, src/utils.py
-->
<!-- URLs, file paths, API references -->
- `/Users/beihuang/.codex/skills/planning-with-files/templates/task_plan.md`
- `/Users/beihuang/.codex/skills/planning-with-files/templates/findings.md`
- `/Users/beihuang/.codex/skills/planning-with-files/templates/progress.md`
- `docs/Planning-with-Files集成方案.md`

## Visual/Browser Findings
<!-- 
  WHAT: Information you learned from viewing images, PDFs, or browser results.
  WHY: CRITICAL - Visual/multimodal content doesn't persist in context. Must be captured as text.
  WHEN: IMMEDIATELY after viewing images or browser results. Don't wait!
  EXAMPLE:
    - Screenshot shows login form has email and password fields
    - Browser shows API returns JSON with "status" and "data" keys
-->
<!-- CRITICAL: Update after every 2 view/browser operations -->
<!-- Multimodal content must be captured as text immediately -->
-

---
<!-- 
  REMINDER: The 2-Action Rule
  After every 2 view/browser/search operations, you MUST update this file.
  This prevents visual information from being lost when context resets.
-->
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*

- Session-catchup failed because CLAUDE_PLUGIN_ROOT is unset; need to locate scripts manually.
- Session-catchup script ran with no output; proceed with current working state.
- p2w_1770109698412 blueprint shows core-features and specs align left; trust indicators use local award-*.svg filenames; lifestyle scenes uses carousel layout hint.
- Composition presets: F01/F02/S01 align=start by default; G02 carousel preset has no required classes (likely missing actual carousel enforcement).
- NavbarBlock nav/cta gaps depend on CSS vars (--space-4/--space-2). If vars undefined, gaps collapse -> links squeezed.
- LeadCaptureCTABlock relies on Button default size; secondary styling only when cta.variant is set.
- ConsistencyGuardian lacks checks for carousel usage, heading alignment consistency, or image URL reachability; only validates prop formats.
- No Carousel component in magic-exports; manifest only includes magic/shadcn exports, so G02 lacks carousel control.
- normalizeTrustLogosMarquee hardcodes logo.url; mismatch with logo.image/src likely causes broken images. Lifestyle scenes normalization replaces layout with grid, preventing carousel usage.
- normalizePages applies composition preset defaults after normalizeLayoutHint; F01/F02/S01 default align likely causes left alignment.
- collectLayoutIssues skips align check for cards/tiles/rows, so heading alignment issues pass; should tighten.
- Layout issues trigger regeneration; add carousel/alignment checks in collectLayoutIssues to enforce fixes.
- Hero blocks use Button default size and CSS-var gaps; update to size=lg and fixed gap classes.
- LeadCaptureCTA/FeatureWithMedia blocks use CSS var gaps and default button size; update to fixed gaps and size=lg.
- Internal creation-client uses default button size; pricing-cards uses default button size. If default size increases, may need size=sm for internal UI.
- Carousel now exported in magic-exports and referenced in runtime module map.
- normalizeGeneratedComponentCode updated with carousel guard, design showcase grid/border adjustments, CTA size/secondary, comparison badge class injection.
- Many blocks still use CSS var --space-* for gaps; if vars missing, spacing can collapse. Consider replacing or defining vars.
- Defined --space-* CSS vars in sandbox theme CSS to backfill spacing tokens used by blocks.
- Implemented SceneSwitcher (auto Tabs/Carousel) and enforced in builder prompts/validator for scene sections.
- Added sectionAlignOverrides + alignLocked pipeline so alignment is a design constraint, not validator style enforcement.
- Technical solution doc updated to document sectionAlignOverrides and SceneSwitcher.
- Added SceneSwitcher to skills manifest so it is advertised to the LLM.
- Run `p2w_1770198778476` blueprint shows `coreValue` (F01) and `usageScenarios` (G03) layoutHint align=center with compositionPreset set; layout errors are for `corevalue/usagescenarios` align start missing, implying `applyCompositionDefaults` likely overwrote align to preset start while `alignLocked` stayed true.
- Run `p2w_1770201390942` failed `design-showcase` and `scene-showcase` layout; blueprint uses `design-showcase` G01 and `scene-showcase` G03 with scene-switcher intent, but `upgradeShowcasePreset` upgrades G03 to G01 when context contains “scene”, which conflicts with desired SceneSwitcher (G02) and triggers missing preset classes.
- Run `p2w_1770213779892` failed `immersive-gallery` with parse error; logs show toolUsed response where `component` is a string containing JSON-like text (backtick code) instead of an object, causing normalizeSectionPayload to reject it (`builder_section_invalid` → `builder_section_failed:parse`).
- Run `p2w_1770215219340` failed `design-showcase` layout with issue `align start missing`; `alignLocked` was being set whenever align was present, which over-enforced align even for tile grids. Align lock should only be set via explicit `alignLocked` or sectionAlignOverrides.
- Run `p2w_1770216068018` failed `product-catalog` + `contact-form` parse; logs show empty responses (`contentLength: 0` or `{}`) and malformed JSON (code with unescaped quotes/markdown). Root fix: retry on empty/{} and enforce strict JSON tool output before parse failure.
