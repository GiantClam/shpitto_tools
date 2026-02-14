# Progress

## 2026-02-14
- Started implementation for whole-site template target.
- Located integration points:
  - `builder/template-factory/run-template-factory.mjs`
  - `builder/src/lib/agent/section-template-registry.ts`
  - `builder/src/lib/agent/p2w-graph.ts`
- Added optional crawl support previously in template-factory (already merged in working tree).
- Added page-template metadata generation in template-factory:
  - `spec_pack.site_pages`
  - `styleProfile.siteTemplates`
- Added schema support in section-template-registry for `siteTemplates/site_templates`.
- Added multi-page template-first planner support in `p2w-graph`:
  - per-page section-kind plan
  - synthesize missing pages from template metadata
  - preserve existing behavior when metadata absent.
- Verification:
  - `node --check builder/template-factory/run-template-factory.mjs` passed
  - `cd builder && npx tsc --noEmit` passed
