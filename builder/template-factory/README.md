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

## Run

Useful flags:

- `--mode pen-review|template-publish|template-from-pen`
- `--pen-file <path>`: reviewed `.pen` file, pen bundle, or single-site `*.pen.source.json`
- `--pen-review-file <path>`: 审核文件路径（默认与 pen 文件同目录自动推断）
- `--pen-review-status pending|approved|rejected`: 写审核状态
- `--no-publish`: only write run-scoped artifacts, do not merge into shared library
- Pencil desktop MCP is read from `~/.claude.json` via `template-factory/pencil-export-payload.mjs`

推荐两阶段流程（PEN -> 模板）:

```bash
# 1) 标记人工审核结果
cd builder
npm run template:factory -- \
  --mode pen-review \
  --pen-file template-factory/runs/manual/pen/unistellar-home.pen \
  --pen-review-file template-factory/runs/manual/pen-review.manual.json \
  --pen-review-status approved

# 2) 基于已审核 PEN 发布模板资产
npm run template:factory -- \
  --mode template-from-pen \
  --run-id tf-unistellar-template-from-pen \
  --pen-file template-factory/runs/manual/pen/unistellar-home.pen \
  --pen-review-file template-factory/runs/manual/pen-review.manual.json
```

## Outputs

- Run artifacts: `template-factory/runs/<run-id>/`
- Exported pen payloads: `template-factory/runs/<run-id>/pen-export/<site-id>/`
- Run-scoped style library: `template-factory/runs/<run-id>/style-profiles.generated.json`
- Pen review file: custom `--pen-review-file`
- Published library: `template-factory/library/style-profiles.generated.json`
- Publish summary: `template-factory/runs/<run-id>/pen-publish-summary.json`
- Materialized component manifest: `template-factory/runs/<run-id>/materialized-components.json`

## Integration

`builder/src/lib/agent/section-template-registry.ts` now auto-loads the published library file.

Override library path with:

```bash
BUILDER_TEMPLATE_LIBRARY_PATH=template-factory/library/style-profiles.generated.json
```
