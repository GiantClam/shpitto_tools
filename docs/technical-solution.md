# Shipitto Tooling Technical Solution

## Overview

This document describes the end-to-end tooling implemented to:

1. Read source URLs from Excel.
2. Crawl and analyze websites.
3. Generate templates and block assets locally.
4. Rebuild pages with Puck + shadcn/ui blocks.
5. Compare against original websites and output reports.

The solution is built around a structured asset factory pipeline, a block library for rendering, and a visual QA loop for regression and attribution.

## Architecture Summary

### A. Capture

- Playwright renders pages in a controlled environment.
- Outputs: full-page screenshots, DOM snapshots, section bounding boxes, section screenshots.
- Stable capture settings: fixed viewport, animation disabled, lazy-load triggered.

### B. Understand

- Crawl4AI extracts structured content and clean markdown.
- Theme tokens derived from CSS variables or computed styles.

### C. Assetize

- Blocks registry defines an allowed block set (30 MVP blocks).
- Mapping rules choose blocks from DOM + layout + text signals.
- LLM fills block props using structured output schema (optional).

### D. Verify

- Visual QA captures original + Puck render screenshots.
- Pixelmatch generates diff + similarity scores.
- Attribution explains causes (structure/tokens/content) and outputs `attribution.json`.

### E. Iterate

- Optional auto-repair loop applies patch operations and re-runs verification.
- Stop conditions and manual review triggers prevent uncontrolled changes.

## Tech Stack & Choices

### Frontend Rendering

- Next.js App Router
- Tailwind CSS
- shadcn/ui (Radix primitives, owned code)
- Magic UI (optional motion)
- Puck (editor + render configuration)

### Crawling & Analysis

- Playwright: stable screenshots and DOM/box capture
- Crawl4AI: markdown + structured extraction

### Visual QA

- Playwright for screenshots
- pixelmatch for diff
- pngjs for image operations

### LLM Integration

- OpenRouter via structured JSON schema output
- Strict schema validation to prevent invalid props

## Directory Layout

```
/asset-factory/
  /blocks/                 # MVP registry + variant prompts
  /pipelines/              # capture/extract/map/build/verify
  /schemas/                # JSON Schemas (blocks + patch)
  /out/                    # generated site assets

/builder/
  /src/components/atoms/   # shadcn wrappers
  /src/components/blocks/  # block implementations
  /src/components/theme/   # theme.css + motion provider
  /src/puck/               # Puck config + field adapters
  /src/app/editor/         # Puck editor page
  /src/app/render/         # non-editor renderer

/visual-qa/
  /scripts/                # capture/diff/probe/attribution/run-loop
  /out/                    # screenshot + diff output

/scripts/
  run_excel_pipeline.py    # Excel → pipeline → visual QA
```

## Core Pipelines

### Asset Factory Pipeline

Entry: `asset-factory/pipelines/run.py`

Steps:

1. Capture (`capture.py`)
   - Full-page screenshot
   - Section bounding boxes
   - Section screenshots
   - DOM snapshot

2. Extract (`extract.py`)
   - Crawl4AI markdown + headings + paragraphs

3. Map (`map.py`)
   - Rule-based classification
   - Variants via embeddings (OpenRouter)
   - Output `sections.json`

4. Build (`build.py`)
   - Convert sections into Puck JSON
   - Writes `pages/<slug>/page.json`

5. Verify (`verify.py`)
   - Runs pixelmatch when render available
   - Outputs report

### Visual QA Pipeline

Entry: `visual-qa/scripts/run.ts` or `run-with-attribution.ts`

Steps:

1. Capture original
2. Capture Puck render
3. Pixel diff
4. Probe DOM and styles
5. Attribution (structure/tokens/content)

### Auto Repair Loop

Entry: `visual-qa/scripts/run-loop.ts`

Steps:

1. Run diff + attribution
2. Generate patch (rules or LLM)
3. Apply patch to Puck JSON
4. Re-render and re-compare
5. Stop on thresholds or manual review signals

## Key Modules and Functionality

### Capture

- `capture_site(url, output_root, page_slug)`
  - Playwright render
  - Section screenshots + boxes
  - Theme tokens saved to `theme.css` + `tokens.json`

### Mapping

- `classify_section` (rule-based)
  - Outputs candidates with scores/reasons
  - Uses layout + text signals

- `map_sections`
  - Applies candidates
  - Adds variant selection
  - Adds `props` base defaults

### Embeddings

- `get_text_embedding(text)`
- `get_image_embedding(image)`
- `select_variant(block, textEmb, imageEmb)`

### LLM Fill

- `fill_sections(sections_path, schema_dir, prompt, output)`
  - Uses OpenRouter structured output
  - Validates against schema
  - Injects props/variant back into `sections.json`

### Rendering

- `/render` endpoint
  - Loads Puck JSON and renders blocks
  - Uses motion mode from theme

## Schemas

- `schemas/base-block-props.json`
- `schemas/blocks/*.json`
- `schemas/block-selection.v1.json`
- `schemas/patch.v1.json`

Block schemas are versioned (`.v1`) and immutable. Upgrades must introduce `.v2`.

## Attribution & Patch

### Attribution

Outputs `attribution.json` with:

- `structure`: missing blocks, bbox shifts, title shifts
- `tokens`: font/size/color/radius differences
- `content`: broken images, failed requests

### Patch Format

- `setBlockProp` changes `props.*`
- `setThemeToken` changes `root.theme.*`

Only allowlist paths can be modified.

## Business Workflow

1. Excel URL list is the source of truth.
2. Each site is processed and stored locally.
3. Puck JSON is rendered and compared to the original.
4. Attribution informs adjustments.
5. Optional auto-repair iterates until thresholds or review triggers.

## Usage Guide

### 1) Run Excel Pipeline

```
python3 scripts/run_excel_pipeline.py
```

Outputs:

- `asset-factory/out/<siteKey>/pages/<page>/page.json`
- `visual-qa/out/<siteKey>/...`
- `output/reports/excel_pipeline_report.json`

### 2) Asset Factory (single URL)

```
python3 asset-factory/pipelines/run.py --url https://example.com
```

### 3) Visual QA

```
cd visual-qa
npm install

SITE_KEY=demo \
ORIGINAL_URL="https://example.com" \
RENDER_URL="http://localhost:3000/render?siteKey=demo&page=home" \
node --loader ts-node/esm scripts/run-with-attribution.ts
```

### 4) Auto Repair Loop

```
SITE_KEY=demo \
ORIGINAL_URL="https://example.com" \
RENDER_URL_BASE="http://localhost:3000/render" \
PUCK_DATA_PATH="/absolute/path/to/puck.json" \
node --loader ts-node/esm visual-qa/scripts/run-loop.ts
```

## Stop Conditions

- Similarity >= threshold on both desktop + mobile
- Improvement below minimum
- Manual review triggers:
  - missing blocks
  - too many broken images

## Notes and Recommendations

- Keep block schemas immutable once shipped.
- Only add new versions, never edit older versions.
- Always validate LLM output against schema.
- Prefer tokens changes over ad-hoc CSS.
- Keep motion optional and configurable at root level.
