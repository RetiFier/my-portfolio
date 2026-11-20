import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Figure, usePlayback } from "./Figure";

/**
 * Synthetic Instinct's execution-intent ledger, scenario by scenario. Every
 * step follows the live execution port:
 * - submit stores the intent as PENDING with a SHA-256 fingerprint (put-if-absent);
 * - a different fingerprint under the same ID is rejected (INTENT_ID_CONFLICT);
 * - a stored outcome is returned as-is, with no exchange call;
 * - only one caller can claim PENDING -> IN_PROGRESS; a failed claim returns
 *   UNKNOWN (INTENT_IN_PROGRESS_RECONCILIATION_REQUIRED);
 * - an exception during execution is stored as UNKNOWN (AMBIGUOUS_EXECUTION_RESULT)
 *   after the gateway's read-only client-order-ID lookup;
 * - ACCEPTED (a resting order) is the only stored state that moves later, to
 *   FILLED or FAILED, from the paths that observe the order's outcome.
 */

type State = "PENDING" | "IN_PROGRESS" | "ACCEPTED" | "FILLED" | "FAILED" | "REJECTED" | "UNKNOWN";
type Actor = "strategy" | "ledger" | "gateway" | "exchange" | "process" | "reconcile";

interface Step {
  actor: Actor;
  text: string;
  /** Stored ledger state after this step. */
  state?: State;
  /** Outcome handed back to the caller without changing the stored record. */
  returned?: State;
  code?: string;
  fault?: boolean;
  order?: boolean;
}

interface Scenario {
  id: string;
  label: string;
  steps: Step[];
  result: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "fill",
    label: "Clean fill",
    steps: [
      { actor: "strategy", text: "submit intent (ID derived from the signal)" },
      { actor: "ledger", text: "store if absent, with content fingerprint", state: "PENDING" },
      { actor: "ledger", text: "single claim succeeds", state: "IN_PROGRESS" },
      { actor: "gateway", text: "send order with a stable client order ID", order: true },
      { actor: "exchange", text: "order filled" },
      { actor: "ledger", text: "store terminal outcome", state: "FILLED" },
    ],
    result: "One order, one terminal record.",
  },
  {
    id: "resting",
    label: "Resting limit",
    steps: [
      { actor: "strategy", text: "submit intent" },
      { actor: "ledger", text: "store if absent", state: "PENDING" },
      { actor: "ledger", text: "single claim succeeds", state: "IN_PROGRESS" },
      { actor: "gateway", text: "place limit order", order: true },
      { actor: "exchange", text: "order rests on the book" },
      { actor: "ledger", text: "store outcome", state: "ACCEPTED" },
      { actor: "reconcile", text: "order update or exchange sync sees the fill" },
      { actor: "ledger", text: "only ACCEPTED records may move", state: "FILLED" },
    ],
    result: "Settled later by whichever path observes the outcome; settled records never change again.",
  },
  {
    id: "restart",
    label: "Restart mid-flight",
    steps: [
      { actor: "strategy", text: "submit intent" },
      { actor: "ledger", text: "store if absent", state: "PENDING" },
      { actor: "ledger", text: "single claim succeeds", state: "IN_PROGRESS" },
      { actor: "gateway", text: "order sent", order: true },
      { actor: "process", text: "process restarts before the outcome is stored", fault: true },
      { actor: "strategy", text: "same intent submitted again after boot" },
      { actor: "ledger", text: "claim refused: the record stays IN_PROGRESS", returned: "UNKNOWN", code: "INTENT_IN_PROGRESS_RECONCILIATION_REQUIRED" },
    ],
    result: "Not retried. The exchange may already hold the order, so it goes to reconciliation instead of a second send.",
  },
  {
    id: "ambiguous",
    label: "Ambiguous response",
    steps: [
      { actor: "strategy", text: "submit intent" },
      { actor: "ledger", text: "store if absent", state: "PENDING" },
      { actor: "ledger", text: "single claim succeeds", state: "IN_PROGRESS" },
      { actor: "gateway", text: "order sent", order: true },
      { actor: "exchange", text: "request times out", fault: true },
      { actor: "gateway", text: "read-only lookup by client order ID" },
      { actor: "ledger", text: "still unresolved: store as unknown", state: "UNKNOWN", code: "AMBIGUOUS_EXECUTION_RESULT" },
    ],
    result: "Fails closed: an unclear result is recorded as unknown, never as success or failure.",
  },
  {
    id: "duplicate",
    label: "Duplicate submit",
    steps: [
      { actor: "strategy", text: "same intent, same content, submitted again" },
      { actor: "ledger", text: "fingerprint matches; stored outcome found", state: "FILLED" },
      { actor: "ledger", text: "hand back the stored outcome", returned: "FILLED" },
    ],
    result: "Zero new orders: the earlier outcome is replayed from the ledger.",
  },
  {
    id: "conflict",
    label: "ID conflict",
    steps: [
      { actor: "strategy", text: "reused intent ID with different content" },
      { actor: "ledger", text: "fingerprint does not match the stored intent" },
      { actor: "ledger", text: "reject the call; stored intent untouched", returned: "REJECTED", code: "INTENT_ID_CONFLICT" },
    ],
    result: "Zero new orders, and the original intent is left exactly as it was.",
  },
];

const STATES: State[] = ["PENDING", "IN_PROGRESS", "ACCEPTED", "FILLED", "FAILED", "REJECTED", "UNKNOWN"];

export const IntentLedger: React.FC = () => {
  const [id, setId] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
  const { ref, frame, done, restart } = usePlayback(scenario.steps.length, 650, id);

  const shown = scenario.steps.slice(0, frame);
  const visited = new Set(shown.map((s) => s.state).filter(Boolean) as State[]);
  const current = [...shown].reverse().find((s) => s.state)?.state;
  const orders = shown.filter((s) => s.order).length;

  return (
    <Figure
      title="execution intent ledger"
      meta={
        <>
          orders sent <span className="text-ink">{orders}</span>
        </>
      }
      label="Execution intent ledger. Choose a scenario to see how an order intent moves between states."
      caption="Illustrative. Steps and state names follow the system's execution port; no real orders or symbols are shown."
    >
      <div ref={ref}>
        <div role="group" aria-label="Scenario" className="flex gap-1 overflow-x-auto border-b border-line px-4 py-3 [scrollbar-width:none]">
          {SCENARIOS.map((s) => {
            const on = s.id === id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => (on ? restart() : setId(s.id))}
                className={`shrink-0 border px-2.5 py-2 font-mono text-label uppercase leading-none tracking-[0.04em] transition-colors ${
                  on ? "border-ink bg-ink text-canvas" : "border-line text-muted hover:border-ink/60 hover:text-ink"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* state strip */}
        <ol aria-label="Ledger states" className="flex flex-wrap gap-1.5 border-b border-line px-4 py-3 font-mono text-label uppercase">
          {STATES.map((s) => {
            const isCurrent = s === current;
            const seen = visited.has(s);
            return (
              <li
                key={s}
                className={`border px-1.5 py-1 leading-none transition-colors duration-300 ${
                  isCurrent
                    ? s === "UNKNOWN" || s === "REJECTED"
                      ? "border-dashed border-ink text-ink"
                      : "border-accent text-accent"
                    : seen
                      ? "border-faint text-ink"
                      : "border-line text-faint"
                }`}
              >
                {s}
              </li>
            );
          })}
        </ol>

        {/* step log */}
        <ol className="min-h-[17rem] px-4 py-3 font-mono text-label sm:text-meta">
          <AnimatePresence initial={false}>
            {shown.map((step, i) => (
              <motion.li
                key={`${id}-${i}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-[1.6rem_5.2rem_minmax(0,1fr)] gap-x-2 border-t border-line/60 py-1.5 first:border-t-0 sm:grid-cols-[2rem_6rem_minmax(0,1fr)_auto]"
              >
                <span className="tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-muted">{step.actor}</span>
                <span className={step.fault ? "text-ink underline decoration-dashed underline-offset-4" : "text-ink/90"}>
                  {step.text}
                  {step.code && <span className="mt-0.5 block break-all text-muted">{step.code}</span>}
                </span>
                {(step.state || step.returned) && (
                  <span
                    className={`col-start-3 mt-1 justify-self-start border px-1.5 py-0.5 leading-none sm:col-start-auto sm:mt-0 sm:justify-self-end ${
                      step.returned ? "border-dashed border-muted text-muted" : "border-faint text-ink"
                    }`}
                  >
                    {step.returned ? `returns ${step.returned}` : step.state}
                  </span>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas/60 px-4 py-3">
          <p className={`text-[0.95rem] leading-relaxed text-ink transition-opacity duration-500 ${done ? "opacity-100" : "opacity-0"}`}>
            {scenario.result}
          </p>
          <button
            type="button"
            onClick={restart}
            className="tag shrink-0 py-2 transition-colors hover:border-ink/60 hover:text-ink"
          >
            Replay
          </button>
        </div>
      </div>
    </Figure>
  );
};
