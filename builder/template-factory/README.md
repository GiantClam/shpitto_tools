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

## Outputs

- Run artifacts: `template-factory/runs/<run-id>/`
- Published library: `template-factory/library/style-profiles.generated.json`
- Preview links: `template-factory/runs/<run-id>/preview-links.json`
- Regression report: `builder/regression/strategy-comparison/compare-*.json`
- Regression screenshots: `builder/regression/strategy-comparison/screenshots/<group>/`

## Integration

`builder/src/lib/agent/section-template-registry.ts` now auto-loads the published library file.

Override library path with:

```bash
BUILDER_TEMPLATE_LIBRARY_PATH=template-factory/library/style-profiles.generated.json
```
