# Template Fidelity Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `template_fidelity` mode that deterministically replays pen bundle templates, emits structure diff + screenshot diff + template-integrity reports, and prevents non-passing templates from entering the shared library.

**Architecture:** Extend the simplified pen-first template-factory workflow instead of reviving the unreachable legacy fidelity path. The new mode will operate artifact-by-artifact on a pen bundle, reuse the existing section-diff logic and screenshot/diff utilities, emit a run-scoped fidelity report, and feed the resulting per-template pass/fail state into the publish step.

**Tech Stack:** Node.js ESM, existing template-factory CLI config modules, Playwright, pngjs, pixelmatch, JSON run artifacts.

---

### Task 1: Add CLI/config support for `template_fidelity`

**Files:**
- Modify: `builder/template-factory/config/schema.mjs`
- Modify: `builder/template-factory/config/resolve-options.mjs`
- Modify: `builder/template-factory/config/defaults.mjs`

**Step 1: Add the new mode and fidelity-specific option slots**

Add normalization support for:
- `template-fidelity`
- `template_fidelity`

Add option slots for:
- replay case file / case id
- screenshot similarity threshold
- structure mismatch threshold
- full publish-on-pass behavior

**Step 2: Keep defaults deterministic**

Use stable defaults that do not depend on runtime randomness:
- strict pass/fail thresholds
- explicit replay-case selection behavior
- fixed renderer / motion-off assumptions where relevant

### Task 2: Implement run-scoped template fidelity evaluation

**Files:**
- Modify: `builder/template-factory/run-template-factory.mjs`

**Step 1: Build a per-artifact fidelity evaluator**

For each artifact:
- export payload
- reuse `section-diff-report.json`
- render source/payload screenshots deterministically
- compute screenshot diff artifacts and similarity
- compute template-integrity checks

**Step 2: Emit report artifacts**

Write:
- per-template fidelity details
- aggregate `template-fidelity-report.json`
- paths to section diff / screenshot diff / integrity rows

### Task 3: Wire template publish to the fidelity gate

**Files:**
- Modify: `builder/template-factory/run-template-factory.mjs`
- Modify: `builder/template-factory/README.md`

**Step 1: Run fidelity automatically before publish**

For `template-publish`, evaluate fidelity before merge/publish.

**Step 2: Enforce “pass before ingest”**

Only passing templates may be included in the run library merge. If none pass, fail the publish.

**Step 3: Surface publish outcomes clearly**

Write a publish summary that includes:
- requested templates
- passed templates
- blocked templates
- report paths

### Task 4: Verify end to end

**Files:**
- Test via CLI commands against a targeted pen file or bundle

**Step 1: Run syntax checks**

Run:
- `node --check builder/template-factory/config/schema.mjs`
- `node --check builder/template-factory/config/resolve-options.mjs`
- `node --check builder/template-factory/run-template-factory.mjs`

**Step 2: Run a targeted fidelity-only smoke**

Run the new mode against a minimal pen input or bundle and confirm:
- report files exist
- diffs are produced
- pass/fail is deterministic across reruns

**Step 3: Run a publish-path smoke**

Run a `template-publish --no-publish` or equivalent dry publish path and verify the new gate blocks or filters failing templates correctly.
