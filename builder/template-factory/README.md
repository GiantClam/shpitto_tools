# Template Factory (MVP)

Automated pipeline for producing reusable style templates from batch site inputs.

## What it does

1. Ingests batch `URL + optional screenshots` from a manifest (`.json` or `.csv`).
2. Captures desktop/mobile full-page screenshots (`npx playwright screenshot`).
3. Extracts `index-card` and `spec-pack` per site.
4. Compiles templates into `StyleProfile` JSON.
5. Publishes merged library to `template-factory/library/style-profiles.generated.json`.
6. Automatically runs `C_template_first` regression (`sandbox`) after publish, writes a scorecard, and emits preview links.

## Manifest formats

### JSON

`template-factory/sites.example.json`

Optional per-site template override rules:

- `specialRules.templateBlockVariants`: section-level block override for all pages.
- `specialRules.pageTemplateBlockVariants`: page-path level block override.

Rule shape supports:

- `"<sectionKind>": "BlockType"` (block-only)
- `"<sectionKind>": { "blockType": "BlockType", ...defaultsPatch }`
- `"<sectionKind>": { "defaults": { ...defaultsPatch } }`
- `"<sectionKind>": [ ...variantCandidates ]` (first candidate applied, others exported as template-exclusive candidates)

### CSV

Required headers:

`id,url,description,prompt,desktop_screenshot,mobile_screenshot`

`desktop_screenshot` and `mobile_screenshot` are optional.

## Run

```bash
cd builder
npm run template:factory -- --manifest template-factory/sites.example.json --groups C_template_first --renderer sandbox
```

Useful flags:

- `--skip-ingest`: skip auto screenshot stage
- `--no-publish`: write run artifacts only, do not merge into shared library
- `--max-cases 5`: limit regression cases
- `--preview-base-url http://127.0.0.1:3110`: rebase generated preview links to this origin
- `--no-preview-server`: do not auto-start preview server for generated links
- `--strict-required-cases-policy warn|fail|ignore`: strict 模式下 requiredCases 为空时的门禁策略
- `--no-template-exclusive-blocks`: disable generation of template-exclusive block variants/components
- `--max-discovered-pages 24`: site page discovery upper bound
- `--max-nav-links 8`: max links generated for navigation block defaults
- `--must-include-patterns \"products,blog,/zh-cn\\/.*\"`: force include pages matching pattern(s)
- `--required-pages-per-site 4`: strict mode required key pages selected per site
- `--strict-avg-similarity-min 85`: strict mode minimum site-level average similarity
- `--strict-page-similarity-min 78`: strict mode minimum required-page similarity
- `--fidelity-structure-weight 0.2`: weight of structure similarity in combined score
- `--pipeline-parallel --pipeline-parallel-concurrency 3`: full-flow site worker pool concurrency
- `--screenshot-concurrency 2 --screenshot-timeout-ms 90000`: screenshot stage concurrency and timeout
- `--crawl-concurrency 2 --crawl-timeout-ms 20000`: crawl stage concurrency and request timeout
- `--regression-concurrency 3`: regression stage concurrency (also controls preview port pool)
- `--site-retry-count 1 --site-retry-delay-ms 1500 --site-circuit-breaker-threshold 2`: per-site retry/backoff/circuit-breaker controls

## Outputs

- Run artifacts: `template-factory/runs/<run-id>/`
- Published library: `template-factory/library/style-profiles.generated.json`
- Preview links: `template-factory/runs/<run-id>/preview-links.json`
- Gate report: `template-factory/runs/<run-id>/gate-report.json`
- Template-exclusive components: `template-factory/runs/<run-id>/template-exclusive-components.json`
- Per-site link report: `template-factory/runs/<run-id>/sites/<site-id>/extracted/link-report.json`
- Regression report: `builder/regression/strategy-comparison/compare-*.json`
- Regression screenshots: `builder/regression/strategy-comparison/screenshots/<group>/`

## Integration

`builder/src/lib/agent/section-template-registry.ts` now auto-loads the published library file.

Override library path with:

```bash
BUILDER_TEMPLATE_LIBRARY_PATH=template-factory/library/style-profiles.generated.json
```
