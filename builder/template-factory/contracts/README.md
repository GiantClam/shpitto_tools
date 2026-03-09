# Template Asset Contracts (Corporate v1)

This folder defines the baseline protocol for corporate website template assets.

## Protocol assets

- `page-types.corporate.v1.json`: allowed page type enum.
- `home-skeletons.corporate.v1.json`: allowed home skeleton enum.
- `section-taxonomy.corporate.v1.json`: allowed section taxonomy enum.
- `review-status.v1.json`: template lifecycle status enum.
- `template-meta.schema.v1.json`: template meta shape.
- `dedup-fingerprint.schema.v1.json`: dedup fingerprint shape.

## Runtime integration

`template-factory/contracts/index.mjs` builds and validates:

- `template_asset_manifest`
- `dedup_fingerprints`
- `asset_contract_report`

Contract evaluation also supports runtime signals:

- `fidelitySimilarity` + `fidelityThreshold` (from regression)
- review lifecycle transition check (`fromStatus -> status`)

These are written into:

- `template-factory/runs/<run-id>/sites/<site-id>/extracted/template-asset-manifest.json`
- `template-factory/runs/<run-id>/sites/<site-id>/extracted/dedup-fingerprints.json`
- `template-factory/runs/<run-id>/sites/<site-id>/extracted/asset-contract-report.json`

Run gate threshold:

- `--gate-min-asset-contract-score` (default `85`)
