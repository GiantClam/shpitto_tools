# Progress

## 2026-03-10
- Started migration of builder-side generation shaping into template-factory publish artifacts.
- Confirmed publish insertion point in `/Users/beihuang/.codex/worktrees/2cb1/shpitto_tools/builder/template-factory/run-template-factory.mjs`.
- Confirmed consumer insertion point in `/Users/beihuang/.codex/worktrees/2cb1/shpitto_tools/builder/src/lib/agent/section-template-registry.ts`.
- Added a new published artifact shape: `template-generation-contracts.generated.json`.
- Extended `run-template-factory` run-library and publish-library outputs to include `templateGenerationContracts` plus the new sidecar file.
- Extended `section-template-registry.ts` to load generation contracts from the library payload or sidecar, with fallback derivation from `styleProfiles/pageSpecs` when no sidecar exists yet.
- Added `resolvePublishedPageGenerationContract(...)` so builder can consume page contracts through the registry instead of inferring everything locally.
- Updated `p2w-graph.ts` structured-brief overrides to resolve page intent via published page contracts before path-based fallback.
- Extended published section contracts with `slotId`, `role`, and `imageIntent` so builder can match sections by semantic slot instead of page-path counters.
- Patched both `run-template-factory` publish paths so PEN-driven publishes also emit the enriched contracts.
- Re-ran `template:factory` from PEN with run id `tf-unistellar-contracts-20260310-r3` and verified the published sidecar contains `slotId`, `role`, and `imageIntent`.
- Updated `p2w-graph.ts` to consume `imageIntent` from the published contract and apply contract-driven image rewriting during structured-brief overrides.
- Refactored builder-side structured brief shaping so core page sections are matched by published `role`/`slotId` instead of `pageType + item.type` branches tied to a specific source template.
- Aligned `template-factory` page-type inference with builder registry semantics and fixed the bug where `pageSpec.pageType = generic` blocked publish-time reclassification.
- Re-ran PEN publish with run id `tf-unistellar-contracts-20260310-r6`; published contracts now classify:
  - `/smart-telescopes -> products`
  - `/smart-binoculars -> products`
  - `/technologies -> solutions`
  - `/use-cases -> cases`
  with non-generic roles such as `product-context`, `solution-context`, and `case-narrative`.
- Verification:
  - `node --check /Users/beihuang/.codex/worktrees/2cb1/shpitto_tools/builder/template-factory/run-template-factory.mjs` passed.
  - `cd /Users/beihuang/.codex/worktrees/2cb1/shpitto_tools/builder && NODE_OPTIONS=--max-old-space-size=8192 npx tsc --noEmit` passed.
  - `cd /Users/beihuang/.codex/worktrees/2cb1/shpitto_tools/builder && npm run build` passed.
  - Live creation smoke passed against `POST http://127.0.0.1:3000/api/creation`, producing `p2w_1773104092898`.
  - Generated output for `p2w_1773104092898` shows contract-driven industrial image URLs applied to home hero/story/products sections.
  - Additional live creation smoke produced `p2w_1773109557215` with the migrated published contracts loaded from the library and QA gate passing.
