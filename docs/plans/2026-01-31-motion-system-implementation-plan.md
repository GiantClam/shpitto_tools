# Motion Hooks + Global Utilities Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add reusable in-view reveal and parallax motion hooks, plus global CSS utilities, and wire them into the generator/runtime for consistent block-level motion.

**Architecture:** Introduce `@/lib/motion` hooks used by generated blocks, add a small utilities layer in `globals.css`, and expose hooks to the JIT runtime. Update builder prompts to request hooks (advisory) and include them in the component manifest.

**Tech Stack:** Next.js (App Router), React 19, Tailwind CSS, JIT runtime for Puck blocks.

---

### Task 1: Add motion hooks module

**Files:**
- Create: `builder/src/lib/motion.ts`

**Step 1: Write the failing test**
- No test runner is configured in this repo. Skip test creation and proceed with manual verification (documented in Task 5).

**Step 2: Write minimal implementation**
- Add `useInViewReveal` (IntersectionObserver) and `useParallaxY` (scroll/raf) with `enabled`, `once`, and `prefers-reduced-motion` support.

**Step 3: Manual verification**
- Add a short inline usage example in the plan notes (no code change needed).

---

### Task 2: Expose hooks in JIT runtime module map

**Files:**
- Modify: `builder/src/lib/runtime.tsx`

**Step 1: Update moduleMap**
- Import hooks from `@/lib/motion` and add to `moduleMap` under key `"@/lib/motion"` so generated code can `import { useInViewReveal, useParallaxY }`.

---

### Task 3: Add global utility classes for visual polish

**Files:**
- Modify: `builder/src/app/globals.css`

**Step 1: Add root tokens**
- Add easing CSS variables and `scroll-behavior: smooth` with reduced-motion fallback.

**Step 2: Add utilities**
- Add `.radial-glow`, `.surface-glass`, `.perspective-1000`, `.preserve-3d`, `.backface-hidden`, and focus-visible defaults.

---

### Task 4: Update generator prompts + manifest

**Files:**
- Modify: `builder/src/lib/agent/prompts.ts`
- Modify: `builder/src/skills/manifest.json`

**Step 1: Prompt updates**
- In `buildBuilderUserPrompt`, add constraints to prefer `useInViewReveal` for lists/cards and `useParallaxY` for hero presets (H*).

**Step 2: Manifest updates**
- Add library entry for `@/lib/motion` describing the hooks.

---

### Task 5: Verification

**Files:**
- None

**Step 1: Run build**
- Run: `npm run build` in `builder/`
- Expected: build completes without TypeScript or module resolution errors.

**Step 2: Smoke check (manual)**
- Launch `npm run dev` and verify at least one generated section uses the hooks without runtime errors.

---

### Task 6: Commit (optional)

**Step 1: Commit**
- `git add builder/src/lib/motion.ts builder/src/lib/runtime.tsx builder/src/app/globals.css builder/src/lib/agent/prompts.ts builder/src/skills/manifest.json`
- `git commit -m "feat: add motion hooks and global utilities"`
