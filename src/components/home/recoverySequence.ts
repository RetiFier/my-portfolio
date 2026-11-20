/**
 * Incident scenarios behind the "Own it in production" demo on the home page.
 * Nothing here talks to a server: the heading is the "service", traffic is
 * generated in the browser, and these steps drive what the supervisor does.
 * This file is shown on the page exactly as written (imported with ?raw).
 */
export type Phase =
  | "running" // serving traffic
  | "degraded" // up, but unhealthy (memory pressure, bad render)
  | "down" // process gone, requests fail
  | "restarting" // supervisor bringing a new process up
  | "rollback" // deploy failed its health checks, previous version going back
  | "reconciling" // new process restoring state from the last checkpoint
  | "healthy"; // readiness probe passing again

export type Level = "INFO" | "WARN" | "ERROR";
export type ScenarioId = "sigkill" | "oom" | "deploy";

export interface Step {
  /** Milliseconds after the incident starts. */
  at: number;
  phase?: Phase;
  level: Level;
  source: "supervisor" | "app" | "probe" | "deploy";
  msg: (ctx: { pid: number; chars: number; version: string }) => string;
  /** Side effects the UI applies at this step. */
  effect?: "newPid" | "memoryReset" | "badVersion" | "goodVersion";
}

export interface Scenario {
  id: ScenarioId;
  label: string;
  cause: string;
  mitigation: string;
  followUp: string;
  steps: Step[];
}

export const STABLE = "v1.4.0";
export const BROKEN = "v1.4.1";
export const MEMORY_LIMIT_MIB = 512;

/** Exponential restart backoff, as most supervisors do it: 0.5s, 1s, 2s ... capped at 8s. */
export const backoff = (attempt: number) => Math.min(500 * 2 ** attempt, 8000);

export const SCENARIOS: Scenario[] = [
  {
    id: "sigkill",
    label: "kill -9",
    cause: "Process killed by SIGKILL (exit 137)",
    mitigation: "Supervisor restart, state restored from checkpoint",
    followUp: "None needed: recovery was automatic",
    steps: [
      { at: 0, phase: "down", level: "ERROR", source: "supervisor", msg: ({ pid }) => `heading[${pid}] killed by signal 9 (SIGKILL), exit code 137` },
      { at: 200, level: "WARN", source: "probe", msg: () => "readiness probe failed: connection refused" },
      { at: 600, phase: "restarting", level: "INFO", source: "supervisor", msg: () => `restarting heading (attempt 1, backoff ${backoff(0)}ms)` },
      { at: 1100, level: "INFO", source: "app", effect: "newPid", msg: ({ pid, version }) => `heading[${pid}] started, ${version}` },
      { at: 1400, phase: "reconciling", level: "INFO", source: "app", msg: ({ chars }) => `restoring state from last checkpoint (${chars} chars)` },
    ],
  },
  {
    id: "oom",
    label: "out of memory",
    cause: "Heap grew past the 512 MiB limit and the process was OOMKilled",
    mitigation: "Supervisor restart with a fresh heap",
    followUp: "Cap the render cache; alert at 80% of the memory limit",
    steps: [
      { at: 0, phase: "degraded", level: "WARN", source: "app", msg: () => "heap usage climbing: render cache is not being evicted" },
      { at: 900, level: "WARN", source: "probe", msg: () => "p95 latency 840ms, above the 500ms threshold" },
      { at: 1700, phase: "down", level: "ERROR", source: "supervisor", msg: ({ pid }) => `heading[${pid}] OOMKilled: exceeded ${MEMORY_LIMIT_MIB} MiB, exit code 137` },
      { at: 2200, phase: "restarting", level: "INFO", source: "supervisor", msg: () => `restarting heading (attempt 1, backoff ${backoff(0)}ms)` },
      { at: 2700, level: "INFO", source: "app", effect: "newPid", msg: ({ pid, version }) => `heading[${pid}] started, ${version}` },
      { at: 2750, level: "INFO", source: "app", effect: "memoryReset", msg: () => "heap reset" },
      { at: 3000, phase: "reconciling", level: "INFO", source: "app", msg: ({ chars }) => `restoring state from last checkpoint (${chars} chars)` },
    ],
  },
  {
    id: "deploy",
    label: "bad deploy",
    cause: `${BROKEN} read a field that is undefined on first render`,
    mitigation: `Automatic rollback to ${STABLE} after 3 failed health checks`,
    followUp: `Block ${BROKEN}; add a test for the missing field before redeploying`,
    steps: [
      { at: 0, phase: "degraded", level: "INFO", source: "deploy", effect: "badVersion", msg: () => `rolling out ${BROKEN} (1 of 1 instances)` },
      { at: 500, phase: "down", level: "ERROR", source: "app", msg: () => "TypeError: Cannot read properties of undefined (reading 'title') at renderHeading" },
      { at: 600, level: "ERROR", source: "supervisor", msg: ({ pid }) => `heading[${pid}] exited with code 1` },
      { at: 1000, phase: "restarting", level: "WARN", source: "supervisor", effect: "newPid", msg: () => `crash loop: restarting (attempt 1, backoff ${backoff(0)}ms)` },
      { at: 1500, level: "ERROR", source: "app", msg: () => "TypeError: Cannot read properties of undefined (reading 'title')" },
      { at: 1900, level: "WARN", source: "supervisor", effect: "newPid", msg: () => `crash loop: restarting (attempt 2, backoff ${backoff(1)}ms)` },
      { at: 2900, level: "ERROR", source: "app", msg: () => "TypeError: Cannot read properties of undefined (reading 'title')" },
      { at: 3100, phase: "rollback", level: "WARN", source: "deploy", msg: () => `health check failed 3/3, rolling back to ${STABLE}` },
      { at: 3700, level: "INFO", source: "app", effect: "goodVersion", msg: ({ pid }) => `heading[${pid}] started, ${STABLE}` },
      { at: 4000, phase: "reconciling", level: "INFO", source: "app", msg: ({ chars }) => `restoring state from last checkpoint (${chars} chars)` },
    ],
  },
];

/** One character per tick until the view matches the committed state again. */
export const reconcile = (restored: number, committed: number) => {
  const next = Math.min(committed, restored + 1);
  return { restored: next, done: next === committed };
};

/** Readiness: passes only when every character is back where it was committed. */
export const isReady = (restored: number, committed: number) => restored === committed;

/** Requests in one 500ms window: steady traffic with noise; all fail while the process can't serve. */
export const trafficTick = (phase: Phase, rand: () => number) => {
  const total = Math.round(20 + rand() * 9);
  const serving = phase === "running" || phase === "healthy";
  const failing = phase === "down" || phase === "restarting" || phase === "rollback" || phase === "reconciling";
  const errors = failing ? total : phase === "degraded" ? Math.round(total * (0.1 + rand() * 0.2)) : serving && rand() > 0.97 ? 1 : 0;
  return { total, errors };
};
