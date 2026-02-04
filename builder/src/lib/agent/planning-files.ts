import { promises as fs } from "fs";
import path from "path";

export type PlanningStatus = "pending" | "in_progress" | "complete";

export type PlanningPhaseTask = {
  id: string;
  label: string;
  done: boolean;
};

export type PlanningPhase = {
  id: number;
  name: string;
  status: PlanningStatus;
  tasks: PlanningPhaseTask[];
};

export type PlanningProgressEntry = {
  timestamp: string;
  phaseId: number;
  action: string;
  status: "success" | "failed";
};

export type PlanningSectionOutput = {
  key: string;
  pagePath: string;
  pageName: string;
  type: string;
  props: Record<string, unknown>;
  component: { name: string; code: string };
};

export type PlanningSectionFailure = {
  key: string;
  pagePath: string;
  pageName: string;
  type: string;
};

export type PlanningState = {
  version: 1;
  prompt: string;
  requestId?: string;
  createdAt: string;
  currentPhase: number;
  phases: PlanningPhase[];
  progress: PlanningProgressEntry[];
  findings: string[];
  completedSectionKeys: string[];
  sectionOutputs: Record<string, PlanningSectionOutput>;
  blueprint?: Record<string, unknown>;
};

export type PlanningInitOptions = {
  rootDir: string;
  prompt: string;
  requestId?: string;
  batchSize?: number;
};

type PlanningPage = {
  path?: string;
  name?: string;
  sections?: Array<{ id?: string; type?: string }>;
};

const STATE_FILE = "planning_state.json";
const TASK_PLAN_FILE = "task_plan.md";
const FINDINGS_FILE = "findings.md";
const PROGRESS_FILE = "progress.md";

const nowIso = () => new Date().toISOString();

const buildBasePhases = (): PlanningPhase[] => [
  {
    id: 1,
    name: "Requirements & Design System",
    status: "in_progress",
    tasks: [
      { id: "requirements", label: "Capture requirements + constraints", done: false },
      { id: "design-system", label: "Define theme + design system", done: false },
      { id: "blueprint", label: "Generate blueprint + section plan", done: false },
    ],
  },
];

const buildSectionPhases = (
  pages: PlanningPage[],
  batchSize: number,
  startId: number
): PlanningPhase[] => {
  const tasks: PlanningPhaseTask[] = [];
  pages.forEach((page, pageIndex) => {
    const pagePath = page.path ?? "/";
    const sections = Array.isArray(page.sections) ? page.sections : [];
    sections.forEach((section, sectionIndex) => {
      const sectionId = section.id ?? `section-${pageIndex}-${sectionIndex}`;
      const key = `${pagePath}:${sectionId}:${sectionIndex}`;
      const label = `${pagePath} / ${section.type ?? "Section"}`;
      tasks.push({ id: key, label, done: false });
    });
  });

  const phases: PlanningPhase[] = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    phases.push({
      id: startId + phases.length,
      name: `Build Sections ${i + 1}-${Math.min(i + batchSize, tasks.length)}`,
      status: phases.length === 0 ? "in_progress" : "pending",
      tasks: batch,
    });
  }

  if (tasks.length === 0) {
    phases.push({
      id: startId,
      name: "Build Sections",
      status: "pending",
      tasks: [],
    });
  }

  return phases;
};

const buildFinalPhase = (id: number): PlanningPhase => ({
  id,
  name: "Validation & Persist",
  status: "pending",
  tasks: [
    { id: "postcheck", label: "Run postcheck + quality summary", done: false },
    { id: "persist", label: "Persist output artifacts", done: false },
  ],
});

const renderTaskPlan = (state: PlanningState) => {
  const lines: string[] = [];
  lines.push("# Task Plan: P2W Generation");
  lines.push("");
  lines.push("## Goal");
  lines.push(state.prompt || "Generate project");
  lines.push("");
  lines.push("## Current Phase");
  lines.push(`Phase ${state.currentPhase}`);
  lines.push("");
  lines.push("## Phases");
  state.phases.forEach((phase) => {
    lines.push("");
    lines.push(`### Phase ${phase.id}: ${phase.name}`);
    lines.push(`**Status:** ${phase.status}`);
    phase.tasks.forEach((task) => {
      lines.push(`- [${task.done ? "x" : " "}] ${task.label}`);
    });
  });
  lines.push("");
  lines.push("## Notes");
  lines.push("- Planning-with-Files enabled for this run.");
  return lines.join("\n");
};

const renderFindings = (state: PlanningState) => {
  const lines: string[] = [];
  lines.push("# Findings");
  lines.push("");
  lines.push("## Prompt");
  lines.push(state.prompt || "");
  lines.push("");
  lines.push("## Summary");
  if (state.findings.length === 0) {
    lines.push("- No findings recorded yet.");
  } else {
    state.findings.forEach((entry) => lines.push(`- ${entry}`));
  }
  return lines.join("\n");
};

const renderProgress = (state: PlanningState) => {
  const lines: string[] = [];
  lines.push("# Progress Log");
  lines.push("");
  lines.push("## Actions");
  if (state.progress.length === 0) {
    lines.push("- No actions recorded yet.");
  } else {
    state.progress.forEach((entry) => {
      lines.push(
        `- [${entry.timestamp}] Phase ${entry.phaseId}: ${entry.action} (${entry.status})`
      );
    });
  }
  return lines.join("\n");
};

const updatePhaseStatuses = (state: PlanningState) => {
  const firstIncomplete = state.phases.find((phase) => phase.status !== "complete");
  if (firstIncomplete) {
    state.currentPhase = firstIncomplete.id;
    if (firstIncomplete.status === "pending") firstIncomplete.status = "in_progress";
  }
};

export class PlanningFiles {
  private rootDir: string;
  private state: PlanningState;
  private queue: Promise<void> = Promise.resolve();
  private batchSize: number;

  private constructor(rootDir: string, state: PlanningState, batchSize: number) {
    this.rootDir = rootDir;
    this.state = state;
    this.batchSize = batchSize;
  }

  static async init(options: PlanningInitOptions) {
    const rootDir = options.rootDir;
    const batchSize = options.batchSize ?? 3;
    await fs.mkdir(rootDir, { recursive: true });
    const statePath = path.join(rootDir, STATE_FILE);
    let state: PlanningState | null = null;
    try {
      const raw = await fs.readFile(statePath, "utf-8");
      state = JSON.parse(raw) as PlanningState;
    } catch (error) {
      state = null;
    }

    if (!state) {
      state = {
        version: 1,
        prompt: options.prompt,
        requestId: options.requestId,
        createdAt: nowIso(),
        currentPhase: 1,
        phases: buildBasePhases(),
        progress: [],
        findings: [],
        completedSectionKeys: [],
        sectionOutputs: {},
      };
    }

    const planner = new PlanningFiles(rootDir, state, batchSize);
    await planner.ensureFiles();
    return planner;
  }

  getState() {
    return this.state;
  }

  getBlueprint() {
    return this.state.blueprint;
  }

  getCompletedSectionKeys() {
    return new Set(this.state.completedSectionKeys);
  }

  getSectionOutputs() {
    return Object.values(this.state.sectionOutputs);
  }

  async markArchitectComplete(blueprint: Record<string, unknown>, pages: PlanningPage[]) {
    return this.enqueue(async () => {
      this.state.blueprint = blueprint;
      const basePhases = buildBasePhases();
      basePhases[0].tasks = basePhases[0].tasks.map((task) => ({ ...task, done: true }));
      basePhases[0].status = "complete";

      const sectionPhases = buildSectionPhases(pages, this.batchSize, 2);
      const finalPhase = buildFinalPhase(2 + sectionPhases.length);

      this.state.phases = [...basePhases, ...sectionPhases, finalPhase];
      updatePhaseStatuses(this.state);
      this.state.findings.unshift(`Blueprint created with ${pages.length} page(s).`);
      await this.persistAll();
      await this.writeBlueprintFile(blueprint);
      this.appendProgress({
        phaseId: 1,
        action: "Architect completed",
        status: "success",
      });
      await this.persistAll();
    });
  }

  async recordSectionOutput(output: PlanningSectionOutput, status: "success" | "failed") {
    return this.enqueue(async () => {
      if (status === "success") {
        this.state.sectionOutputs[output.key] = output;
        if (!this.state.completedSectionKeys.includes(output.key)) {
          this.state.completedSectionKeys.push(output.key);
        }
        this.markTaskDone(output.key);
      }

      this.appendProgress({
        phaseId: this.state.currentPhase,
        action: `${status === "success" ? "Built" : "Failed"} ${output.type} (${output.pagePath})`,
        status,
      });
      await this.persistAll();
    });
  }

  async recordSectionFailure(failure: PlanningSectionFailure) {
    return this.enqueue(async () => {
      this.appendProgress({
        phaseId: this.state.currentPhase,
        action: `Failed ${failure.type} (${failure.pagePath})`,
        status: "failed",
      });
      await this.persistAll();
    });
  }

  async markPostcheckComplete() {
    return this.enqueue(async () => {
      this.markTaskDone("postcheck");
      updatePhaseStatuses(this.state);
      await this.persistAll();
    });
  }

  async markPersistComplete() {
    return this.enqueue(async () => {
      this.markTaskDone("persist");
      updatePhaseStatuses(this.state);
      await this.persistAll();
    });
  }

  private async ensureFiles() {
    await this.persistAll();
  }

  private async writeBlueprintFile(blueprint: Record<string, unknown>) {
    const blueprintPath = path.join(this.rootDir, "blueprint.json");
    await fs.writeFile(blueprintPath, JSON.stringify(blueprint, null, 2));
  }

  private markTaskDone(taskId: string) {
    const phase = this.state.phases.find((entry) => entry.tasks.some((task) => task.id === taskId));
    if (!phase) return;
    phase.tasks = phase.tasks.map((task) =>
      task.id === taskId ? { ...task, done: true } : task
    );
    if (phase.tasks.length && phase.tasks.every((task) => task.done)) {
      phase.status = "complete";
    } else if (phase.status === "pending") {
      phase.status = "in_progress";
    }
    updatePhaseStatuses(this.state);
  }

  private appendProgress(entry: Omit<PlanningProgressEntry, "timestamp">) {
    this.state.progress.push({
      ...entry,
      timestamp: nowIso(),
    });
  }

  private async persistAll() {
    await this.writeState();
    await this.writeTaskPlan();
    await this.writeFindings();
    await this.writeProgress();
  }

  private async writeState() {
    const statePath = path.join(this.rootDir, STATE_FILE);
    await fs.writeFile(statePath, JSON.stringify(this.state, null, 2));
  }

  private async writeTaskPlan() {
    const taskPlanPath = path.join(this.rootDir, TASK_PLAN_FILE);
    await fs.writeFile(taskPlanPath, renderTaskPlan(this.state));
  }

  private async writeFindings() {
    const findingsPath = path.join(this.rootDir, FINDINGS_FILE);
    await fs.writeFile(findingsPath, renderFindings(this.state));
  }

  private async writeProgress() {
    const progressPath = path.join(this.rootDir, PROGRESS_FILE);
    await fs.writeFile(progressPath, renderProgress(this.state));
  }

  private enqueue(task: () => Promise<void>) {
    this.queue = this.queue.then(task).catch(() => task());
    return this.queue;
  }
}
