# Template Factory (Pen First)

Pen-first pipeline for producing reusable style templates from reviewed `.pen` files.

## What it does

1. Reads a reviewed `.pen` file.
2. Uses Pencil desktop MCP to export structured payload from the `.pen`.
3. Converts exported pages/sections into `StyleProfile` JSON.
4. Materializes any payload custom components into `src/components/blocks/*`.
5. Publishes merged library to `template-factory/library/style-profiles.generated.json`.

## Supported modes

- `pen-review`: write or update review state for a `.pen`
- `template-from-pen` / `template-publish --pen-file ...`: generate template library from an approved `.pen`

Older URL/crawl/pen-build modes are no longer part of the active workflow.

## Prerequisites

- Run commands from `builder/`
- A local Pencil desktop app is installed
- MCP resolution order:
  - `~/.claude.json` `mcpServers.pencil`
  - fallback binary: `Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64`

## CLI

Entry point:

```bash
cd builder
npm run template:factory -- <flags>
```

Primary flags:

- `--mode pen-review|template-from-pen|template-publish`
- `--run-id <slug>`: stable run folder name under `template-factory/runs/`
- `--pen-file <path>`: `.pen`, pen bundle json, or `*.pen.source.json`
- `--pen-review-file <path>`: explicit review file path; default is inferred beside the pen
- `--pen-review-status pending|approved|rejected`
- `--pen-reviewer <name>`
- `--pen-review-notes <text>`
- `--preview-base-url <origin>`: base origin written into preview links and summaries
- `--no-publish`: build run artifacts only, do not merge into shared library
- `--pencil-command <path>`: override MCP server binary explicitly

Model-oriented command recipes:

### 1. Create or update the human review file

Use this before any publish step.

```bash
cd builder
npm run template:factory -- \
  --mode pen-review \
  --pen-file /abs/path/to/site.pen \
  --pen-review-file /abs/path/to/site.pen-review.manual.json \
  --pen-review-status approved \
  --pen-reviewer codex \
  --pen-review-notes "Approved for template publish after preview review"
```

### 2. Generate a reviewable run without publishing

Use this to verify contracts, generated blocks, and preview output before merging into the shared library.

```bash
cd builder
npm run template:factory -- \
  --mode template-from-pen \
  --run-id tf-my-site-preview \
  --pen-file /abs/path/to/site.pen \
  --pen-review-file /abs/path/to/site.pen-review.manual.json \
  --preview-base-url http://127.0.0.1:3135 \
  --no-publish
```

### 3. Publish an approved pen into the shared template library

`template-from-pen` and `template-publish` use the same pen-first publish path. Use either mode if `--pen-file` is present.

```bash
cd builder
npm run template:factory -- \
  --mode template-from-pen \
  --run-id tf-my-site-release \
  --pen-file /abs/path/to/site.pen \
  --pen-review-file /abs/path/to/site.pen-review.manual.json \
  --preview-base-url http://127.0.0.1:3135
```

### 4. Export a live payload directly from a pen file

This helper is useful when a model needs to inspect the live MCP export before calling the full factory.

```bash
cd builder
node template-factory/pencil-export-payload.mjs \
  --pen-file /abs/path/to/site.pen
```

Expected behavior:

- Opens the specified `.pen` in Pencil MCP
- Reads the active document via `open_document` + `batch_get`
- Emits a payload-shaped JSON summary for downstream use

## Recommended model workflow

1. Run `pen-review` to create or update the review record.
2. Run `template-from-pen --no-publish`.
3. Inspect:
   - `pen-publish-summary.json`
   - generated blocks under `src/components/blocks/template-exclusive-*`
   - preview in `/creation/sandbox` or `/render`
4. If the preview is approved, rerun without `--no-publish`.
5. Commit generated code and library artifacts together.

## Outputs

- Run artifacts: `template-factory/runs/<run-id>/`
- Exported pen payloads: `template-factory/runs/<run-id>/pen-export/<site-id>/`
- Run-scoped style library: `template-factory/runs/<run-id>/style-profiles.generated.json`
- Pen review file: custom `--pen-review-file`
- Published library: `template-factory/library/style-profiles.generated.json`
- Publish summary: `template-factory/runs/<run-id>/pen-publish-summary.json`
- Materialized component manifest: `template-factory/runs/<run-id>/materialized-components.json`
- Generated Puck registry: `src/puck/config.generated.ts`
- Materialized block code: `src/components/blocks/template-exclusive-*/`

## Themeable template behavior

The current pen-first pipeline emits theme-aware templates rather than hard-coded static replicas.

- Theme is extracted from pen and attached to page root and section props
- Materialized blocks resolve colors and fonts through semantic CSS variables
- Published templates can be re-skinned by replacing theme values without regenerating block code
- Preview/runtime prefers the static published block implementation when a renderer already exists

## Integration

`builder/src/lib/agent/section-template-registry.ts` now auto-loads the published library file.

Override library path with:

```bash
BUILDER_TEMPLATE_LIBRARY_PATH=template-factory/library/style-profiles.generated.json
```
