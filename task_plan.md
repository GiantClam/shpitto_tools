# Task Plan

## Goal
Read all `.pen` files under `/Users/beihuang/Documents/opencode/shpitto_tools/pen`, including desktop-only sites, and generate exact-match, skinnable full-site templates organized by `site -> page -> section -> block`, with strict per-file validation against the source `.pen` plus Pencil-backed verification wherever the desktop bridge is available.

## Phases
1. Confirm full corpus coverage, including paired and desktop-only `.pen` files.
2. Define an exact template schema that preserves raw document/page/section/block structure while still exposing theme tokens and catalogs.
3. Implement a batch generator that emits per-variant exact templates, per-site bundles, and global `site/page/section/block` catalogs.
4. Implement strict validation that rebuilds expected output from source `.pen` and compares hashes, counts, pages, sections, and blocks for every file.
5. Restore Pencil-backed verification by diagnosing the desktop launch path and wiring it into the validation flow.
6. Run full generation and full validation across all 27 `.pen` files and record any remaining gaps.
7. Operationalize the pipeline for repeatable release: parameterized paths, optional structural-only validation, full Pencil-backed release gate, and a manual self-hosted workflow.
8. Upgrade the site-level sandbox runtime so exact templates can be previewed as real multi-page sites with working navigation/footer links, preserved visual parity, and defensible motion.
9. Audit all 27 variant previews for navigation/footer coverage, invalid-link cleanup, style parity, and runtime motion support.
10. Add a reusable skinnable-template layer so all exact templates expose editable theme, copy, image, link, and style slots and the renderer can apply overrides directly.
11. Wire the skinnable layer into sandbox preview so page-level slots can be edited live against the exact rendered site output.
12. Generate commercial-ready publish bundles so each site ships as a unified desktop/mobile template input for the existing builder publish flow.
13. Publish the 16 site bundles into the builder shared library and harden natural-language template selection so explicit brand prompts reliably hit the intended site template while defaulting to desktop unless mobile is requested.
14. Reuse the existing builder orchestration layers to add multi-strategy candidate selection (`template_first` / `hybrid` / `llm_first`) with QA-based best-result selection and visible resolution diagnostics.
15. Strengthen automatic candidate routing heuristics and wire the new multi-candidate path into existing regression tooling with pen-published brand prompt coverage.
16. Run live strategy regressions against the published pen-template library, tune candidate scoring/routing based on failures, and verify the automatic path is strong enough for commercial use.
17. Harden generic/non-brand prompt routing so common commercial prompts (industrial, SaaS, luxury editorial) resolve to the right published template family and bypass unnecessary architect latency when template confidence is high.
18. Close the remaining generic commercial gap by fixing sector-specific selector drift (finance, ecommerce, education, wellness, travel, developer tooling) and ensuring prompt-required `approach` sections survive both `page` and `full-site` template resolution.
19. Productize template adaptation for known template families and known commercial scenarios so generation can reuse template visuals while auditing out brand residue, semantically wrong block reuse, and page-contract violations.
20. Wire template-adaptation diagnostics into payload audit, save/generate routes, and candidate scoring so bad template adaptations are blocked or penalized before reaching preview/persist.
21. Verify the new adaptation gate with fresh typecheck plus positive/negative API smokes against the LC-CNC Breton site.
22. Expand template adaptation beyond `breton / pamamachinetools / sandvik + industrial` to additional published families (`sixtine`, `ionq`, `framework`, `transpa-rent`) and non-industrial scenarios (`luxury_editorial`, `ai_saas`, `developer_tooling`, `design_led_ecommerce`).
23. Validate the expanded rules with deterministic save-route positive/negative fixtures so each new family/scenario pair proves both pass and fail paths.
24. Extend adaptation-family coverage to the remaining high-value published consumer/luxury brands (`pagani`, `nothing-tech`, `vanmoof`, `analogue`, `teenage-engineering`) and verify family-specific residue/mismatch blocking.
25. Extend adaptation-family coverage to the remaining enterprise/technology/audio/mobility families (`carbon3d`, `plexus`, `ridecake`, `siemens`, `audeze`, `devialet`, `unistellar`, `masterdynamic`) and broaden scenario inference for additive manufacturing, premium audio, and smart-telescope commerce prompts.
26. Add a reusable save-route adaptation fixture runner and verify the full supported family matrix with fresh production build/start plus positive/negative payload persistence checks.
27. Remove the last family-specific home-assembly gap by changing industrial template normalization from narrow original-block-name matching to family-agnostic structural slot matching, then re-verify across multiple template families with fresh prompt-driven generations.

## Status
- [x] Phase 1
- [x] Phase 2
- [x] Phase 3
- [x] Phase 4
- [x] Phase 5
- [x] Phase 6
- [x] Phase 7
- [x] Phase 8
- [x] Phase 9
- [x] Phase 10
- [x] Phase 11
- [x] Phase 12
- [x] Phase 13
- [x] Phase 14
- [x] Phase 15
- [x] Phase 16
- [x] Phase 17
- [x] Phase 18
- [x] Phase 19
- [x] Phase 20
- [x] Phase 21
- [x] Phase 22
- [x] Phase 23
- [x] Phase 24
- [x] Phase 25
- [x] Phase 26
- [x] Phase 27

## Constraints
- All 27 `.pen` files must be included. Desktop-only sites cannot be skipped.
- Template output must preserve page and section structure exactly enough to support byte-stable structural validation.
- Keep outputs skinnable by extracting reusable theme tokens instead of only raw style literals.
- Pencil verification is required, but current app launch behavior differs depending on launch path and must be stabilized before claiming end-to-end validation.
- The pipeline must be runnable on other machines, so hard-coded worktree output paths and source-directory assumptions need CLI or env overrides.
- The sandbox preview must remain visually faithful to the source `.pen` pages while still supporting real navigation behavior. Any interaction enhancement that changes the default rendered pixels is a regression.
- Some source `.pen` files encode navigation/footer as plain text rather than explicit link nodes. Recovering clickable behavior from those cases requires inference or runtime overlays; if inference is wrong, functional preview quality regresses.

## Current State
- Exact-template generator and validator exist under `scripts/`.
- Full corpus generation already ran once into `template-factory/generated/pen-exact-templates`.
- Structural validation passes for all 27 files.
- Site-level templates, bundles, and global `site/page/section/block` catalogs validate cleanly.
- Pencil-backed validation also passes for all 27 files after:
  - binding `batch_get.filePath`
  - enabling `includePathGeometry: true` in the Pencil export request
  - projecting source trees with observed Pencil defaults when the source omits scalar fields
- Release automation now exists as:
  - `node scripts/generate_pen_exact_templates.mjs --source-dir ... --out-dir ...`
  - `node scripts/validate_pen_exact_templates.mjs --source-dir ... --skip-pencil`
  - `node scripts/validate_pen_exact_templates.mjs --source-dir ... --require-pencil`
  - `node scripts/release_pen_exact_templates.mjs --source-dir ... --out-dir ...`
- Visual validation now also passes for the full corpus:
  - 261/261 template pages produced `source-render.png`, `template-render.png`, `diff.png`, and `report.json`
  - aggregated visual manifest: `template-factory/generated/pen-exact-templates/visual-validation/manifest.json`
  - `passedPages: 261`
  - `failedPages: 0`
  - `averageSimilarity: 1`
  - `minSimilarity: 1`
- Visual release gating uses `source-render` parity as the hard pass/fail check. Pencil screenshots are retained as optional references only because `get_screenshot` is too lossy and thumbnail-like to serve as a reliable image oracle for exact-release decisions.
- A first pass of site-level sandbox payload generation now exists:
  - `scripts/generate_pen_site_sandbox_payloads.mjs`
  - `template-factory/generated/pen-exact-templates/site-sandbox-payloads.json`
  - one sandbox payload per variant under `asset-factory/out/p2w/pen-exact-site-*/sandbox/payload.json`
- Current site sandbox payloads already:
  - render full-size pages instead of thumbnail comparison HTML
  - rewrite explicit internal page links to valid `/creation/sandbox?...page=...` URLs
  - strip unresolved invalid hrefs
- A first full audit also exists:
  - `scripts/audit_pen_site_templates.mjs`
  - `template-factory/generated/pen-exact-templates/site-template-audit.json`
- Current audit result shows the remaining gap clearly:
  - explicit invalid links are cleaned (`invalidLinkVariants: 0`)
  - navigation/page coverage is still incomplete across all 27 variants
  - footer coverage is incomplete on 18 variants
  - motion support fails on all 27 variants because the current runtime is only a raw page preview wrapper
- Site-runtime repair is now implemented and the audit gate is green:
  - 27/27 variants pass navigation/footer coverage, invalid-link cleanup, and motion checks in `site-template-audit.json`
- Remaining open work is limited to browser-level hit-testing stability on overlay-dense home pages during Playwright automation. This does not change the generated sandbox URLs or the audit result, but it still affects the confidence level of fully automated end-to-end click replay.
- A skinnable layer now exists for the full corpus under `template-factory/generated/pen-skinnable-templates`, backed by renderer-level `overrideMap` support.
- The next gap is runtime consumption: skinnable slots are generated and verified offline, but sandbox preview does not yet expose them as a live editing surface for users.
- Sandbox preview now consumes page-level skinnable metadata directly from `payload.json`, exposes a live skinning drawer in preview mode, persists per-page drafts to localStorage, and patches the exact iframe DOM in place for text, image, link, and style slots.
- The existing builder publish flow already accepts multi-artifact pen bundle JSON, so the cleanest commercial bridge is to generate per-site publish bundles that group desktop/mobile variants into one publish input instead of publishing raw variant files separately.
- Site-level publish bundles now exist for all 16 sites, with paired desktop/mobile artifacts grouped together where available and explicit responsive fallback metadata for the 5 desktop-only sites.
- The 16 site bundles are now published into the builder shared library, and builder-style-profile selection has been hardened so explicit brand prompts such as `like Pagani`, `inspired by VanMoof`, `like Kymeta`, and `like Fptindustrie` resolve to the intended published pen-derived templates instead of older semantic matches.
- The builder generation stack already contained most of the “arbitrary prompt” architecture:
  - architect blueprint generation
  - structured brief parsing
  - site planner
  - template-plan resolver
  - link-graph normalization
  - QA gate
  - repair/refinement passes
  The missing commercial step was orchestration: evaluating more than one generation strategy and selecting the best candidate instead of relying on a single global strategy.
- Candidate selection now also has prompt-aware routing heuristics:
  - explicit brand/template prompts bias toward `template_first + hybrid`
  - prompts with no strong template hit bias toward `hybrid + llm_first`
  - detailed long-form briefs still evaluate all three strategies
  - a dedicated pen-brand regression prompt set now exists for comparing the new automatic path against older fixed strategies
- Live regression hardening is now in place for the published pen-template library:
  - strategy comparison auto-loads env from the current builder worktree plus sibling/main worktrees, so regressions no longer fail in worktree sessions just because `.env.local` is missing locally
  - strong brand/reference prompts can bypass the heavy architect LLM path and seed the blueprint directly from the published template library
  - multi-candidate selection now short-circuits when the first candidate already has near-perfect QA with zero fallback/error cost
  - template-exclusive published sections are now injected as runtime components so sandbox previews no longer show `Missing block renderer` for pen-derived hero/story sections
- A dedicated LC-CNC site generator now exists at `scripts/generate_lc_cnc_site.mjs` and has been rewritten to use Breton as the visual/template base:
  - home hero uses `TemplateExclusivePenSiteHomeHeroHeropenPrimary_369485b5`
  - core visual/product/stats/editorial sections reuse Breton template-exclusive runtime blocks
  - navigation, page hero, certification, contact capture, and footer are custom blocks styled to the same Breton system so the site can support LC-CNC's actual information architecture and quote flow
- Generic routing hardening is now underway:
- Generic commercial routing and section-coverage hardening is now complete:
  - selector matching now supports CJK tokens instead of stripping Chinese prompt/profile keywords out of comparison logic
  - taxonomy matching now uses semantic token inclusion rather than pure ASCII substring matching, which avoids false positives such as short tokens (`app`, `ai`) matching unrelated English words
  - industrial/B2B prompts now bias toward profiles with stronger industrial semantics plus `products/solutions/support` coverage
  - technology/SaaS prompts now penalize obvious consumer-hardware templates and bias toward profiles with software/platform/support/blog signals
  - the architect template-seed fast path is no longer limited to explicit `like X` prompts; it also activates for high-coverage site templates when the prompt clearly asks for a website/homepage/company site
  - fallback blueprint generation now distinguishes `industrial-manufacturing` from generic `technology`, so downstream section generation gets more appropriate industry language
  - sector-specific selector heuristics now also cover:
    - `finance` -> `ionq-desktop`
    - `ecommerce` -> `transpa-rent-desktop`
    - `education` -> `framework-new-desktop`
    - `wellness` -> `auto_sixtine-reference`
    - `travel` -> `pagani-desktop`
    - `developer-tooling` -> `framework-new-desktop`
  - `template-resolver.ts` now merges prompt-driven section kinds into `page`/`full-site` plans, so explicit `approach / metrics / capabilities / 价值点 / 指标` requests are no longer lost when the matched home template lacks a native approach section
  - `p2w-graph.ts` carries the same prompt-driven `approach` semantics for consistency across section planning and candidate scoring
  - fresh creation baseline now passes all 10 generic commercial cases:
    - report: `builder/regression/reports/creation-baseline-20260312-212941.json`
    - `successRate = 100%`
    - `failed = 0`
    - `fallbackRate = 0`
    - `timeoutRate = 0`
- Generic performance hardening also closed the last known long-tail homepage expansion bug:
  - `builder/src/lib/agent/enterprise-site-structure.ts`
    - enterprise detection now requires explicit page/route-level multipage intent instead of broad section-level keywords
  - targeted verification:
    - ecommerce homepage prompt no longer expands to enterprise site pages
    - industrial multi-page prompt still expands correctly
  - fresh baseline report: `builder/regression/reports/creation-baseline-20260312-215001.json`
    - `passed = 10/10`
    - `successRate = 100%`
    - `fallbackRate = 0%`
    - `timeoutRate = 0%`
    - `ecommerce-brand = 1.65s`
    - `agency-portfolio = 8.56s`
    - `industrial-b2b = 6.62s`
- Expanded commercial prompt coverage is now in place:
  - added `builder/regression/prompts.commercial-expanded.json` with `26` verified cases across generic, bilingual, brand, mobile, and multipage prompts
  - extended `builder/regression/run-creation-baseline.mjs` to support assertion checks (`expectedProfileId`, resolution layer, page count, short-circuiting) plus site-scope category validation
- The remaining large-suite failures were real runtime defects, not noisy assertions:
  - `framework-new` lost its homepage products block because `style-family-block` fallback selected a `kymeta` product block whose type included `contact`, and post-processing demoted it as a contact block
  - `fintech-app` selected `pagani-desktop` on the Chinese finance prompt because finance scoring underweighted tech-heavy enterprise profiles when there was no explicit brand/reference match
- Both defects are now fixed:
  - `builder/src/lib/agent/section-template-registry.ts`
    - block-level fallback scoring now applies kind-fit bonuses so `products` resolution prefers product/catalog blocks over contact-shaped siblings
    - finance scoring now boosts technology-forward enterprise profiles and penalizes zero-finance/zero-tech luxury mismatches
  - `builder/src/lib/agent/p2w-graph.ts`
    - `isContactLikeBlock` / `isCtaLikeBlock` now explicitly exclude product/catalog block types so product blocks are not swallowed during canonical nav/body/footer assembly
- Fresh large-scale regression result:
  - command: `cd builder && node regression/run-creation-baseline.mjs --base-url http://localhost:3110 --prompts regression/prompts.commercial-expanded.json`
  - report: `builder/regression/reports/creation-baseline-20260312-222408.json`
  - summary:
    - `passed = 26/26`
    - `successRate = 100%`
    - `fallbackRate = 0%`
    - `timeoutRate = 0%`
    - `assertionFailureRate = 0%`
- Additional publish-library breadth validation is now in place:
  - added `builder/regression/prompts.commercial-scale.json` with `28` extra cases covering the remaining published pen sites, mobile variants, bilingual brand prompts, and niche generic intents (`3D printing`, `satellite connectivity`, `retro-tech`, `premium audio`, `design-led ecommerce`)
  - this second suite forced broader selector and planner hardening beyond the first 26-case commercial set
- New selector/planner hardening completed:
  - `builder/src/lib/agent/section-template-registry.ts`
    - Chinese explicit reference parsing now supports `类似 X / 像 X / 参考 X / 对标 X`
    - added specialized intent routing for:
      - additive manufacturing -> `carbon3d`
      - satellite connectivity -> `kymeta`
      - retro editorial tech -> `analogue`
      - premium audio hardware -> `teenage-engineering`
      - design-led lifestyle ecommerce -> `transpa-rent`
  - `builder/src/lib/agent/template-resolver.ts`
  - `builder/src/lib/agent/p2w-graph.ts`
    - prompt-driven `approach` vocabulary now also includes `technology / technical / tech highlights / 技术 / 科技`
- Fresh second-suite regression:
  - command: `cd builder && node regression/run-creation-baseline.mjs --base-url http://localhost:3110 --prompts regression/prompts.commercial-scale.json`
  - report: `builder/regression/reports/creation-baseline-20260312-224645.json`
  - summary:
    - `passed = 28/28`
    - `successRate = 100%`
    - `fallbackRate = 0%`
    - `timeoutRate = 0%`
    - `assertionFailureRate = 0%`
- Current combined commercial regression coverage:
  - `54/54` prompts passed across the two latest suites
  - aggregate token usage:
    - `input = 368797`
    - `output = 72329`
  - only remaining commercial risk signal from validation is performance:
    - `kymeta-brand-cn-multipage = 241913ms`
    - `usageInputTokens = 348303`
    - `usageOutputTokens = 69572`
    - correctness passed, but this is still a release-grade latency outlier
- Release-grade hardening completed after the commercial suites:
  - `builder/src/lib/agent/p2w-graph.ts`
    - Chinese explicit-reference detection now reaches candidate short-circuit logic, so `类似 Kymeta` multipage prompts no longer fall through to a slow second strategy pass
  - targeted API verification for the Chinese Kymeta multipage prompt now returns:
    - `profile = kymeta-desktop`
    - `selectedStrategy = template_first`
    - `shortCircuited = true`
    - `elapsedMs ≈ 7486`
- Build/type bottleneck is now structurally resolved instead of merely bypassed:
  - `builder/template-factory/materialize-custom-components.mjs`
    - generated `template-exclusive-*` blocks are no longer registered as hundreds of static imports in `src/puck/config.generated.ts`
    - the generator now emits:
      - `src/puck/config.generated.ts` using a single runtime renderer
      - `src/puck/template-exclusive-runtime.generated.json` with `SECTION_TREE / DEFAULT_PROPS / DEFAULT_THEME / LAYOUT_CONTEXT`
  - `builder/src/components/blocks/template-exclusive-runtime/block.tsx`
    - new shared runtime renderer for pen/template-exclusive sections
  - `builder/tsconfig.json`
    - excludes old generated `template-exclusive-*` and `custom-template-exclusive-*` block directories from the TS program
- Fresh verification after the runtime-registry refactor:
  - `cd builder && npx tsc --noEmit --extendedDiagnostics`
    - passes in `3.17s`
    - `Memory used = 509853K`
  - `cd builder && npm run build`
    - clean success
    - Next compile `9.2s`
    - lint/type gate passes
    - page data / static page generation / build traces / final optimization all complete
    - process exits with code `0`

## LC-CNC Site Task
1. Reuse builder-native blocks to assemble an English industrial website for LC-CNC instead of relying on prompt-only generation.
2. Generate a deterministic site payload with real routes, valid nav/footer links, and a proper quote-capture experience.
3. Save the site as a local `p2w` project so `/creation/sandbox` can preview it immediately.
4. Run syntax, route, and browser-level smoke verification before handing off the preview URL.

## Commercial Gate Follow-up
1. Re-run fresh commercial validation on the current build instead of relying on older reports.
2. Fix any real blockers in prompt->template sanitation or adaptation contracts until the full commercial suites are green.
3. Re-verify `build`, `tsc`, adaptation save fixtures, and both commercial prompt suites on the same fresh production server.

## Family-Agnostic Interior Assembly
1. Extend the same family-agnostic assembly policy used for home pages to `products / solutions / cases / about / contact`.
2. Normalize interior page skeletons by role and position instead of template-family block names, so every published family receives the same optimization strength.
3. Remove duplicate canonical interior sections after normalization and re-verify fresh prompt generations across `sandvik / breton / pama / pagani`.

## Interior Regression Gate
1. Extend the creation baseline runner with per-page shape assertions so interior assembly can fail the release gate directly from `/api/creation` results.
2. Add a dedicated cross-family fixture set for `sandvik / breton / pama / pagani` using the structured LC-CNC industrial prompt shape that exercises normalized inner pages.
3. Wire the new fixture set into builder package scripts and docs, then verify `build`, `tsc`, and the new baseline gate on a fresh prod server.
