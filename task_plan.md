# Task Plan

## Goal
Implement whole-site template support while preserving existing single-page template entrypoints and behavior.

## Phases
1. Analyze template selection + page planning flow in `template-factory`, `section-template-registry`, and `p2w-graph`.
2. Extend template-factory output schema to include optional multi-page template metadata (from crawl/defaults).
3. Extend style-profile registry schema/validation to load multi-page metadata without breaking legacy profiles.
4. Update template-first page planning in `p2w-graph` to consume per-page template plans and synthesize missing pages.
5. Verify TypeScript/checks and run a focused generation dry run.

## Status
- [x] Phase 1
- [x] Phase 2
- [x] Phase 3
- [x] Phase 4
- [x] Phase 5

## Constraints
- Preserve current CLI/manifest behavior when multi-page metadata is absent.
- Keep `/creation/sandbox` and `/render` inputs backward-compatible.
- Avoid changing unrelated files.
