# Findings

- The current builder-side LC-CNC shaping mostly lives in `/Users/beihuang/.codex/worktrees/2cb1/shpitto_tools/builder/src/lib/agent/p2w-graph.ts` and covers structured-brief parsing, page-specific copy overrides, and image semantic rewriting.
- `template-factory` already had the right publish pattern: `style-profiles.generated.json` plus sibling sidecars such as `template-exclusive-components.generated.json` and `template-block-catalog.generated.json`.
- The migration can be done safely by adding one more sibling sidecar rather than changing existing profile semantics.
- Implemented in this phase:
  - `run-template-factory` now emits `templateGenerationContracts` into run/publish library payloads.
  - `run-template-factory` now writes `template-generation-contracts.generated.json` next to the existing generated assets.
  - `section-template-registry.ts` now loads generation contracts from the library payload or sidecar and can derive fallback contracts from `styleProfiles/pageSpecs` if the new sidecar is absent.
  - `p2w-graph.ts` now resolves page intent through `resolvePublishedPageGenerationContract(...)` before path-only fallback, so builder begins consuming published page contracts instead of relying purely on local path heuristics.
- The enriched contract now carries ordered section semantics: `kind`, `blockType`, `source`, `editableFields`, optional `baseBlockType`, and semantic fields `slotId`, `role`, `imageIntent`, plus shared `navigation/footer` contracts.
- `template-from-pen` had a duplicate publish path that originally skipped generation-contract emission; that path is now patched so PEN-first publishing produces the same contract metadata as the main run path.
- Builder-side image rewriting is now partially contract-driven: published `imageIntent` values such as `cnc-hero`, `cnc-product`, and `cnc-case` are consumed during structured-brief overrides instead of relying only on page-path heuristics.
- Builder-side template shaping no longer depends primarily on source-template page paths; the remaining runtime adaptation now keys off published section semantics (`role`, `slotId`, `imageIntent`).
- Publish-time page classification needed one more fix: source `pageSpec.pageType` sometimes carried the literal value `generic`, which masked better path/title classification. The publish pipeline now treats `generic` as fallback-only and reclassifies from path/title.
- After that fix, the published Unistellar contracts expose non-generic semantics for the major subpages:
  - smart telescopes/binoculars as `products`
  - technologies as `solutions`
  - use-cases/reviews as `cases`
- At this point, the remaining prompt-specific copy generation still belongs in builder by design, because it depends on user input at creation time; the site/template-specific structure and image semantics are now published assets rather than local heuristics.
