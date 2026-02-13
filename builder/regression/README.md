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

Optional flags:

```bash
node regression/run-creation-baseline.mjs --base-url http://localhost:3000 --max-cases 3
```

Report outputs are written to `builder/regression/reports/` as JSON and Markdown.

Notes:
- The script expects the Builder app to be running and reachable at `--base-url`.
- It reads token and failure signals from `builder/logs/creation.log`.
