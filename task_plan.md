# Task Plan

## Goal
Add a `template_fidelity` runtime mode to the pen-first template factory so a bundle of six templates can be replayed deterministically against the same use case, producing structure diffs, screenshot diffs, and template-integrity reports, with library ingestion blocked unless a template passes the report gate.

## Phases
1. Confirm the current pen-first publish path, current quality gates, and reusable diff/screenshot utilities.
2. Define the `template_fidelity` mode contract, report schema, and publish-gating behavior.
3. Implement CLI/config support for `template_fidelity` and fidelity-related options.
4. Implement deterministic replay + structural diff + screenshot diff generation for pen bundle artifacts.
5. Implement per-template integrity scoring and pass/fail evaluation.
6. Wire the publish path to filter or block non-passing templates before library merge.
7. Run targeted verification and record produced artifacts, pass/fail behavior, and remaining gaps.

## Status
- [x] Phase 1
- [x] Phase 2
- [x] Phase 3
- [x] Phase 4
- [x] Phase 5
- [x] Phase 6
- [x] Phase 7

## Constraints
- The active workflow is the simplified pen-first path in `builder/template-factory/run-template-factory.mjs`; older fullsite branches are effectively unreachable and should not be used as the main execution path.
- The fidelity mode must stay deterministic: same input bundle + same replay case should produce stable payload, structure diff, screenshot diff, and verdict outputs.
- The report must be concrete enough to gate publish automatically, not just descriptive.
- Publish behavior must enforce “only passing templates can enter the library”.
- Reuse existing repo primitives where possible: pen section diff logic, visual diff utilities, and current run artifact layout.

## Current State
- `template-publish` currently loads a pen file/bundle, exports payloads, runs a link-safety quality gate, materializes components, and merges all resulting profiles into `builder/template-factory/library/style-profiles.generated.json`.
- `buildRunLibraryFromPenBundle()` already writes:
  - `pen-export/<case>/payload.json`
  - `pen-export/<case>/section-diff-report.json`
  - `pen-quality-gate-report.json`
- Structural section diff logic already exists in `buildPenSectionDiffReport()`.
- Screenshot capture and diff primitives already exist in:
  - `builder/regression/run-strategy-comparison.mjs`
  - `visual-qa/scripts/validate-pen-exact-visuals.mjs`
- Current publish path has no template-fidelity replay stage, and the only hard gate before publish is the link-safety `pen-quality-gate-report.json`.
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
