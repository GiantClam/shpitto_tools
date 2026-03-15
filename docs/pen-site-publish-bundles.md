# Pen Site Publish Bundles

This bridge turns the generated pen template corpus into publish inputs that the existing builder pen-first workflow can consume directly.

## Goal

Publish by `site`, not by loose `variant`.

- One site bundle groups desktop/mobile artifacts together when both exist.
- Desktop-only source sites still expose both responsive modes:
  - `desktop`: exact source
  - `mobile`: responsive builder output derived from desktop

## Generate Bundles

```bash
node scripts/generate_pen_site_publish_bundles.mjs
```

Outputs:

- `template-factory/generated/pen-site-publish-bundles/manifest.json`
- `template-factory/generated/pen-site-publish-bundles/sites/<site>/site.pen-bundle.json`
- `template-factory/generated/pen-site-publish-bundles/sites/<site>/site.pen-review.json`
- `template-factory/generated/pen-site-publish-bundles/sites/<site>/site.publish.ready.json`

## Verify Bundles

```bash
node scripts/verify_pen_site_publish_bundles.mjs
```

Verification checks:

- bundle/review/readiness files exist
- bundle artifacts match the expected exact-template variants
- every site advertises both responsive modes
- desktop/mobile paired sites contain both artifacts
- desktop-only sites declare mobile delivery as `responsive-derived-from-desktop`
- all referenced pen files and payload files exist
- review items are approved
- source quality gates are still green

## Smoke Publish A Bundle

Use the wrapper script to confirm the existing builder publish flow can consume the generated bundle format:

```bash
node scripts/smoke_publish_pen_site_bundles.mjs --site-id analogue
```

This runs `builder/template-factory` in `--no-publish` mode and writes:

- `template-factory/generated/pen-site-publish-bundles/smoke-publish.json`

## Publish A Site Bundle

The existing builder publish tool already accepts bundle JSON with an `artifacts` array.

Example:

```bash
cd builder
npm run template:factory -- \
  --mode template-from-pen \
  --run-id tf-analogue-site \
  --pen-file /Users/beihuang/.codex/worktrees/266d/shpitto_tools/template-factory/generated/pen-site-publish-bundles/sites/analogue/site.pen-bundle.json \
  --pen-review-file /Users/beihuang/.codex/worktrees/266d/shpitto_tools/template-factory/generated/pen-site-publish-bundles/sites/analogue/site.pen-review.json
```

This keeps the current builder workflow unchanged while making desktop/mobile pairing explicit at the publish boundary.

## Publish All Site Bundles

```bash
node scripts/publish_pen_site_bundles_to_builder_library.mjs
```

This script:

- backs up the current builder library files
- publishes all 16 site bundles through the existing `template:factory` command
- writes `template-factory/generated/pen-site-publish-bundles/publish-report.json`
- writes `builder/template-factory/library/pen-site-registry.generated.json`

`pen-site-registry.generated.json` is the site-level grouping layer that preserves `site -> variants` after publish so desktop/mobile relationships remain explicit even though the published profile library is variant-oriented.
