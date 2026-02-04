# Task Plan: P2W Output Quality Fixes
<!-- 
  WHAT: This is your roadmap for the entire task. Think of it as your "working memory on disk."
  WHY: After 50+ tool calls, your original goals can get forgotten. This file keeps them fresh.
  WHEN: Create this FIRST, before starting any work. Update after each phase completes.
-->

## Goal
<!-- 
  WHAT: One clear sentence describing what you're trying to achieve.
  WHY: This is your north star. Re-reading this keeps you focused on the end state.
  EXAMPLE: "Create a Python CLI todo app with add, list, and delete functionality."
-->
Fix P2W-generated website quality issues (layout, spacing, theming, component usage) and add root-cause safeguards in the generator so these issues don’t recur, especially on desktop.

## Current Phase
<!-- 
  WHAT: Which phase you're currently working on (e.g., "Phase 1", "Phase 3").
  WHY: Quick reference for where you are in the task. Update this as you progress.
-->
Phase 4

## Phases
<!-- 
  WHAT: Break your task into 3-7 logical phases. Each phase should be completable.
  WHY: Breaking work into phases prevents overwhelm and makes progress visible.
  WHEN: Update status after completing each phase: pending → in_progress → complete
-->

### Phase 1: Requirements & Discovery
<!-- 
  WHAT: Understand what needs to be done and gather initial information.
  WHY: Starting without understanding leads to wasted effort. This phase prevents that.
-->
- [x] Review generated output run `p2w_1770027393929`
- [x] Identify section-level issues and potential root causes
- [x] Document findings in findings.md
- **Status:** complete
<!-- 
  STATUS VALUES:
  - pending: Not started yet
  - in_progress: Currently working on this
  - complete: Finished this phase
-->

### Phase 2: Planning & Structure
<!-- 
  WHAT: Decide how you'll approach the problem and what structure you'll use.
  WHY: Good planning prevents rework. Document decisions so you remember why you chose them.
-->
- [x] Decide fixes at prompt/normalization/guardian layers
- [x] Confirm desired global theme direction
- **Status:** complete

### Phase 3: Implementation
<!-- 
  WHAT: Actually build/create/write the solution.
  WHY: This is where the work happens. Break into smaller sub-tasks if needed.
-->
- [x] Update architect/builder prompts or normalization rules
- [x] Patch component code post-processing for known issues
- [x] Update guardian checks for layout/theme regressions
- **Status:** complete

### Phase 4: Testing & Verification
<!-- 
  WHAT: Verify everything works and meets requirements.
  WHY: Catching issues early saves time. Document test results in progress.md.
-->
- [x] Regenerate a P2W run and compare output
- [ ] Validate section fixes on desktop
- [ ] Document test results in progress.md
- **Status:** in_progress

### Phase 5: Delivery
<!-- 
  WHAT: Final review and handoff to user.
  WHY: Ensures nothing is forgotten and deliverables are complete.
-->
- [ ] Summarize fixes and residual risks
- [ ] Deliver summary to user
- **Status:** pending

## Key Questions
<!-- 
  WHAT: Important questions you need to answer during the task.
  WHY: These guide your research and decision-making. Answer them as you go.
  EXAMPLE: 
    1. Should tasks persist between sessions? (Yes - need file storage)
    2. What format for storing tasks? (JSON file)
-->
1. What global theme direction should replace the current dark palette (light neutral vs warm vs brand-defined)?
2. Which fixes should be enforced via prompts vs post-processing normalization?
3. How strict should new guardian checks be (auto-repair vs warning-only)?

## Decisions Made
<!-- 
  WHAT: Technical and design decisions you've made, with the reasoning behind them.
  WHY: You'll forget why you made choices. This table helps you remember and justify decisions.
  WHEN: Update whenever you make a significant choice (technology, approach, structure).
  EXAMPLE:
    | Use JSON for storage | Simple, human-readable, built-in Python support |
-->
| Decision | Rationale |
|----------|-----------|
| Add Carousel component to magic exports and enforce G02 carousel checks | G02 lacked control; enforce real carousel usage for scenes |
| Add SceneSwitcher component (auto Tabs/Carousel) for scene sections | Centralizes scene switching logic and reduces LLM layout drift |
| Move alignment enforcement into design constraints (sectionAlignOverrides + alignLocked) | Ensures validator checks consistency without forcing style |
| Tighten media URL validation to http(s) | Prevents 404s from local/placeholder logo paths |
| Inject CTA size=lg + secondary variant for CTA sections | Ensures CTA padding and secondary affordance consistently |

## Errors Encountered
<!-- 
  WHAT: Every error you encounter, what attempt number it was, and how you resolved it.
  WHY: Logging errors prevents repeating the same mistakes. This is critical for learning.
  WHEN: Add immediately when an error occurs, even if you fix it quickly.
  EXAMPLE:
    | FileNotFoundError | 1 | Check if file exists, create empty list if not |
    | JSONDecodeError | 2 | Handle empty file case explicitly |
-->
| Error | Attempt | Resolution |
|-------|---------|------------|
| session-catchup.py failed: CLAUDE_PLUGIN_ROOT not set | 1 | Located templates directly under /Users/beihuang/.codex/skills/planning-with-files |
| session-catchup.py failed: CLAUDE_PLUGIN_ROOT not set | 2 | Proceeded without catchup script and logged result |
| session-catchup.py failed: CLAUDE_PLUGIN_ROOT not set | 3 | Proceeded without catchup script and logged result |
| git status failed: not a git repository | 1 | Proceeded without git status |
| OPENROUTER connection error during P2W regen | 1 | Retried generation; succeeded on next run |
| rg flag error when searching --space- | 1 | Re-ran search with escaped pattern |
| rg flag error when searching --space-1 | 1 | Re-ran search with escaped pattern |

## Notes
<!-- 
  REMINDERS:
  - Update phase status as you progress: pending → in_progress → complete
  - Re-read this plan before major decisions (attention manipulation)
  - Log ALL errors - they help avoid repetition
  - Never repeat a failed action - mutate your approach instead
-->
- Update phase status as you progress: pending → in_progress → complete
- Re-read this plan before major decisions (attention manipulation)
- Log ALL errors - they help avoid repetition
