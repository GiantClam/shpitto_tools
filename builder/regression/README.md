# Creation Baseline Regression

Runs fixed prompt cases against `POST /api/creation` and outputs stability metrics:

- success rate
- fallback rate
- timeout rate
- latency (avg/p95)
- token usage totals from `logs/creation.log`

## Usage

```bash
cd builder
npm run regression:creation
```

Family-agnostic interior assembly gate:

```bash
cd builder
npm run regression:creation:interiors -- --base-url http://127.0.0.1:3000
```

This gate fails if published template families stop producing the normalized interior skeletons for:
- `/3c-machines`
- `/custom-solutions`
- `/cases`
- `/about`
- `/contact`

Strategy comparison:

```bash
cd builder
npm run regression:strategy
```

Pen-published brand prompts:

```bash
cd builder
npm run regression:strategy:pen
```

Fast strategy diagnosis without full screenshot overhead:

```bash
cd builder
node regression/run-strategy-comparison.mjs --prompts regression/prompts.pen-published.json --groups AUTO_multi_candidate --max-cases 2 --capture home
```

Template-adaptation save-route fixtures:

```bash
cd builder
npm run regression:adaptation -- --base-url http://127.0.0.1:3000
```

Subset one family:

```bash
cd builder
npm run regression:adaptation -- --base-url http://127.0.0.1:3000 --subset pagani
```

Optional flags:

```bash
node regression/run-creation-baseline.mjs --base-url http://localhost:3000 --max-cases 3
node regression/run-creation-baseline.mjs --request-timeout-ms 45000 --allow-timeout-fallback true
node regression/run-creation-baseline.mjs --stream-progress true --enforce-progress-stages true
node regression/run-creation-baseline.mjs --enforce-publish-ready true --enforce-no-gate-issues true
node regression/run-creation-baseline.mjs --case-id quick-singlepage-smoke
node regression/run-creation-baseline.mjs --case-ids quick-singlepage-smoke,quick-multipage-smoke
```

Case-level request override and terminal-event assertions:

```json
{
  "id": "example-case",
  "prompt": "生成网站...",
  "requestBody": {
    "requestTimeoutMs": 10000,
    "structuredInput": { "catalogPageSize": 6, "products": [] }
  },
  "expectedProgressTerminalEvents": ["pending", "timeout"],
  "requiredPagePaths": ["/", "/products", "/products/page-2"]
}
```

Timeout pagination preservation gate:

```bash
cd builder
node regression/run-creation-baseline.mjs \
  --prompts regression/prompts.timeout-pagination.json \
  --case-id timeout-catalog-pagination-preserved \
  --persist true --request-timeout-ms 10000 --pending-wait-ms 180000 \
  --enforce-progress-stages true --enforce-publish-ready false --enforce-no-gate-issues false
```

Progress stage gate (default enabled in `run-creation-baseline.mjs`):
- The regression now sends `stream=true` and validates SSE progress stages.
- Required core stages: `request_received`, `prompt_parsed`, `structured_input_parsed`, `generation_started`, `planner_started`, `planner_completed`, `page_builder_started`.
- For `complete`: also requires `generation_completed`, `assembler_started`, `assembler_completed` (and `persist_started/persist_completed` when `persist=true`).
- For `pending/timeout`: requires timeout-or-grace stage plus persist progress.
- Missing stages are reported as `assertionFailures` like `progressStageMissing:*` / `progressStageMissingAny:*`.

Website refactor baseline (enterprise page-type coverage + required path assertions):

```bash
cd builder
npm run regression:creation:website -- --base-url http://127.0.0.1:3110
```

Browser refactor validation (sandbox runtime rendering + theme consistency checks):

```bash
cd builder
npm run regression:browser:refactor -- --base-url http://127.0.0.1:3110
node regression/run-browser-refactor-validation.mjs --creation-timeout-ms 45000 --request-timeout-ms 240000
node regression/run-browser-refactor-validation.mjs --enforce-publish-ready true --enforce-no-gate-issues true
node regression/run-browser-refactor-validation.mjs --case-id quick-singlepage-smoke --screenshot-mode on-fail
node regression/run-browser-refactor-validation.mjs --reuse-report regression/reports/creation-baseline-YYYYMMDD-HHMMSS.json
```

`--reuse-report` 是 best-effort：只有对应 `siteKey` 在 `asset-factory/out/p2w/*/result.json` 仍可读取时才会跳过重新生成。

Sandbox URL + navigation consistency check:

```bash
cd builder
npm run regression:sandbox:nav -- --base-url http://127.0.0.1:3000 --site-key p2w_xxx
npm run regression:sandbox:nav -- --reuse-report regression/reports/creation-baseline-YYYYMMDD-HHMMSS.json --case-id lingchuang-structured-cn-e2e
```

This check verifies:
- each sandbox page URL is reachable (`HTTP 200`) and runtime-ready
- final URL matches expected `siteKey/page` exactly
- navigation signature is consistent across pages
- no non-sandbox internal href leaks (e.g. raw `/about` links)

Quick smoke regression (default 1 case, persist=false, fast profile):

```bash
cd builder
npm run regression:quick -- --base-url http://127.0.0.1:3000
```

Default quick prompt set: `regression/prompts.quick.json` (lighter assertions for fast gating, no deep fanout/layer assertions).
Quick mode sends per-request `requestTimeoutMs=45000` and defaults to strict creation gating (`publishStatus=ready` + no gate issues + timeout fallback fails).
`regression:quick` / `regression:quick:browser` 在 browser 校验后会默认追加 sandbox URL + navigation consistency gate。
`regression:quick` 默认只跑 quick 首个 case（单页 smoke），如需多页快测可加 `--max-cases 2`。

Creation-only / Browser-only quick commands:

```bash
cd builder
npm run regression:quick:creation -- --base-url http://127.0.0.1:3000
npm run regression:quick:browser -- --base-url http://127.0.0.1:3000
```

Quick profile options:

```bash
node regression/run-quick-regression.mjs --profile safe       # default, lower risk
node regression/run-quick-regression.mjs --profile aggressive # fastest, disables scoped-rag
node regression/run-quick-regression.mjs --profile none       # no env override
node regression/run-quick-regression.mjs --case-id quick-singlepage-smoke --screenshot-mode none
node regression/run-quick-regression.mjs --browser-only --reuse-report regression/reports/creation-baseline-YYYYMMDD-HHMMSS.json
node regression/run-quick-regression.mjs --allow-timeout-fallback true # optional relaxed mode
node regression/run-quick-regression.mjs --stability-runs 3   # repeat creation quick pass 3x before browser
node regression/run-quick-regression.mjs --skip-nav-consistency # disable sandbox nav/url gate (debug only)
node regression/run-quick-regression.mjs --with-timeout-pagination # append timeout+pagination preservation gate
node regression/run-quick-regression.mjs --with-timeout-pagination --timeout-pagination-prompts regression/prompts.timeout-pagination.json
```

Page-type skill benchmark (A/B against generic mode):

```bash
cd builder
npm run regression:page-type-skill -- --base-url http://127.0.0.1:3000 --max-cases 2
```

The benchmark toggles `BUILDER_PAGE_TYPE_SKILLS_ENABLED` between `0` and `1`, runs `run-creation-baseline.mjs` twice, and writes a comparison report to `regression/reports/page-type-skill-benchmark-*.{json,md}`.

Report outputs are written to `builder/regression/reports/` as JSON and Markdown.

Notes:
- The script expects the Builder app to be running and reachable at `--base-url`.
- It reads token and failure signals from `builder/logs/creation.log`.
- `run-strategy-comparison.mjs` now auto-loads env from the current builder worktree and sibling/main worktrees when shell env is missing.
- Strategy comparison capture modes:
  - `--capture home` for just the home page screenshot
  - `--capture all` for all rendered pages plus section crops
  - `--capture none` to skip screenshots and only validate generation outputs
