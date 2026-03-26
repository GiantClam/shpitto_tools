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
```

Website refactor baseline (enterprise page-type coverage + required path assertions):

```bash
cd builder
npm run regression:creation:website -- --base-url http://127.0.0.1:3110
```

Browser refactor validation (sandbox runtime rendering + theme consistency checks):

```bash
cd builder
npm run regression:browser:refactor -- --base-url http://127.0.0.1:3110
```

Report outputs are written to `builder/regression/reports/` as JSON and Markdown.

Notes:
- The script expects the Builder app to be running and reachable at `--base-url`.
- It reads token and failure signals from `builder/logs/creation.log`.
- `run-strategy-comparison.mjs` now auto-loads env from the current builder worktree and sibling/main worktrees when shell env is missing.
- Strategy comparison capture modes:
  - `--capture home` for just the home page screenshot
  - `--capture all` for all rendered pages plus section crops
  - `--capture none` to skip screenshots and only validate generation outputs
