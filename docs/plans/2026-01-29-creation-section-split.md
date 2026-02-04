# Creation Section-Split Generation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split creation generation by section (theme once, sections in parallel), enforce consistent theme, and eliminate JSON parse failures by reducing output size.

**Architecture:** First run Architect to produce `theme + pages + sections`. Then run Builder per section with shared theme + manifest + section intent, collecting `{componentName, code, config/defaultProps}`. Finally assemble `pages[].data.content` from per-section outputs and return a compact, parse-stable response.

**Tech Stack:** Next.js app routes, LangGraph, OpenRouter (Anthropic SDK), Puck, TypeScript.

---

### Task 1: Define section-level schema and response types

**Files:**
- Modify: `builder/src/lib/agent/prompts.ts`
- Modify: `builder/src/lib/agent/p2w-graph.ts`

**Step 1: Write the failing test**

Create a small script to validate parsing with a section-only response (or add a minimal inline test function inside `p2w-graph.ts` and run it manually). Since no test harness exists, skip formal tests and do a manual parse check in dev logs.

**Step 2: Update prompts**

- Architect output: include `pages[].sections[]` with `id`, `type`, `intent`, `propsHints` (optional).
- Builder output: **single section** response schema:
  ```json
  {
    "component": { "name": "...", "code": "...", "defaultProps": { ... } },
    "block": { "type": "ComponentName", "props": { ... } }
  }
  ```

**Step 3: Run dev server and validate log output**

Run: `npm run dev` in `builder` and trigger one request.
Expected: Prompt text indicates single-section output.

**Step 4: Commit**

```bash
git add builder/src/lib/agent/prompts.ts builder/src/lib/agent/p2w-graph.ts
git commit -m "feat: add section-level generation schema"
```

---

### Task 2: Implement Architect → Section list extraction

**Files:**
- Modify: `builder/src/lib/agent/p2w-graph.ts`

**Step 1: Implement minimal changes**
- Keep Architect JSON parse as-is.
- Extract `theme` and `pages[].sections[]` into a normalized internal structure.

**Step 2: Verify by logging**
- Log number of pages + sections.

**Step 3: Commit**

```bash
git add builder/src/lib/agent/p2w-graph.ts
git commit -m "feat: normalize architect sections"
```

---

### Task 3: Add Builder-per-section generation and assembly

**Files:**
- Modify: `builder/src/lib/agent/p2w-graph.ts`

**Step 1: Implement per-section builder call**
- Create a function `buildSection(section, theme, manifest)` that returns `{component, block}`.
- Use shared `theme` from architect, pass into each builder prompt.
- Use `Promise.allSettled` with max concurrency (optional config `OPENROUTER_MAX_CONCURRENCY`, default 3).

**Step 2: Assemble pages**
- Map `pages[].sections[]` to `content[]` blocks with returned `component.name`.
- Collect `components[]` from all sections, dedupe by name.

**Step 3: Handle partial failures**
- If a section fails, add an error entry and skip block; continue others.

**Step 4: Commit**

```bash
git add builder/src/lib/agent/p2w-graph.ts
git commit -m "feat: generate per-section and assemble pages"
```

---

### Task 4: Update API response + UI expectations

**Files:**
- Modify: `builder/src/app/api/creation/route.ts`
- Modify: `builder/src/app/creation/creation-client.tsx`

**Step 1: Ensure response structure unchanged externally**
- Keep existing `components` + `pages` fields so UI still works.

**Step 2: Confirm UI still renders**
- Creation UI should still receive `components[]` and `pages[]`.

**Step 3: Commit**

```bash
git add builder/src/app/api/creation/route.ts builder/src/app/creation/creation-client.tsx
git commit -m "chore: keep creation response compatible"
```

---

### Task 5: Verification

**Files:**
- Modify: `builder/src/lib/agent/p2w-graph.ts` (if needed)
- Modify: `builder/src/app/api/creation/route.ts` (if needed)

**Step 1: Run dev server**
Run: `npm run dev`

**Step 2: Trigger one generation**
- Verify logs show `architect:ok`, `builder:ok` for each section.
- Verify response has non-empty `components` and `pages`.

**Step 3: Run build**
Run: `npm run build`
Expected: success.

**Step 4: Commit (if changes)**
```bash
git add -A
git commit -m "test: verify section-split generation"
```
