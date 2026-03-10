# Task Plan

## Goal
Move builder-side page generation rules into template-factory publish artifacts so template extraction can carry more generation intent by default and builder can consume published contracts instead of growing local hardcoded logic.

## Phases
1. Inspect current builder-side structured-brief and page-override logic and define a minimal shared generation-contract shape.
2. Extend `builder/template-factory/run-template-factory.mjs` to emit run-scoped and published `template-generation-contracts.generated.json` artifacts.
3. Extend `builder/src/lib/agent/section-template-registry.ts` to load and expose published generation contracts.
4. Refactor `builder/src/lib/agent/p2w-graph.ts` to consume published generation contracts before local fallbacks.
5. Verify with build plus a focused creation regression.

## Status
- [x] Phase 1
- [x] Phase 2
- [x] Phase 3
- [x] Phase 4
- [x] Phase 5
- [x] Phase 6

## Completion Note
Publish-time contracts now carry section ordering plus semantic intent (`slotId`, `role`, `imageIntent`), and builder consumes those contracts for page intent and image shaping. Remaining runtime copy filling is prompt-driven and intentionally stays in builder.

## Constraints
- Preserve existing style profile and block catalog behavior when the new generation-contract artifact is absent.
- Keep published assets backward-compatible for current consumers.
- Avoid site-specific hardcoding in the shared contract shape.
