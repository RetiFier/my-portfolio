import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Figure } from "./Figure";

/**
 * Synthetic Instinct's policy rollout: SHADOW -> CANARY -> LIMITED ->
 * EXPANDED -> PRIMARY, one stage per approval. Every advance needs a passing
 * promotion gate, evidence newer than the last change and a named approval;
 * leaving SHADOW also needs at least 48 hours of shadow evidence. A drawdown or
 * tail-risk regression rolls a live stage back to SHADOW automatically.
 * Bar heights are schematic (risk rises with each stage); the real stage
 * limits are not published.
 */

const STAGES = [
  { id: "SHADOW", ceiling: 0, note: "no capital" },
  { id: "CANARY", ceiling: 0.25 },
  { id: "LIMITED", ceiling: 0.5 },
  { id: "EXPANDED", ceiling: 0.75 },
  { id: "PRIMARY", ceiling: 1 },
] as const;

const GATE = ["PROMOTE_TO_CANARY", "MORE_EVIDENCE", "REJECT"] as const;

interface LogLine {
  id: number;
  text: string;
  tone: "ok" | "hold" | "back";
}

export const PromotionLadder: React.FC = () => {
  const [stage, setStage] = useState(0);
  const [log, setLog] = useState<LogLine[]>([
    { id: 0, text: "challenger registered in SHADOW · decisions journaled, no orders", tone: "hold" },
  ]);
  const [seq, setSeq] = useState(1);

  const push = (text: string, tone: LogLine["tone"]) => {
    setLog((l) => [...l.slice(-2), { id: seq, text, tone }]);
    setSeq((s) => s + 1);
  };

  const advance = () => {
    if (stage >= STAGES.length - 1) return;
    const next = STAGES[stage + 1].id;
    push(
      stage === 0
        ? `gate passes · ≥48h shadow evidence · named approval → ${next}`
        : `gate passes · evidence newer than last change · named approval → ${next}`,
      "ok",
    );
    setStage((s) => s + 1);
  };

  const hold = () => push(`gate MORE_EVIDENCE · stays in ${STAGES[stage].id}`, "hold");

  const regress = () => {
    if (stage === 0) {
      push("regression observed in SHADOW · no capital at risk, nothing to roll back", "hold");
      return;
    }
    push(`drawdown / tail-risk regression · automatic rollback ${STAGES[stage].id} → SHADOW`, "back");
    setStage(0);
  };

  return (
    <Figure
      title="policy rollout"
      meta={
        <>
          stage <span className="text-ink">{STAGES[stage].id}</span>
        </>
      }
      label="Policy rollout ladder from shadow to primary, with controls to advance, hold or trigger a rollback."
      caption="Interactive. Stage names, gate outcomes and rollback rules follow the system's rollout controller; bar heights are schematic, showing only that risk rises with each stage."
    >
      <div className="px-3 pb-3 pt-5 sm:px-4">
        <ol className="grid grid-cols-5 items-end gap-1 sm:gap-3">
          {STAGES.map((s, i) => {
            const active = i === stage;
            const passed = i < stage;
            return (
              <li key={s.id} className="flex min-w-0 flex-col">
                <span className="relative block h-28 border-b border-line sm:h-36">
                  <motion.span
                    className={`absolute inset-x-0 bottom-0 ${active ? "bg-accent" : passed ? "bg-ink/35" : "bg-ink/10"}`}
                    initial={false}
                    animate={{ height: `${Math.max(s.ceiling * 100, 3)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  {"note" in s && (
                    <span className="absolute inset-x-0 bottom-2 text-center font-mono text-label uppercase leading-tight text-muted">{s.note}</span>
                  )}
                </span>
                <span
                  className={`mt-2 truncate font-mono text-label uppercase tracking-normal ${
                    active ? "text-accent" : passed ? "text-ink" : "text-muted"
                  }`}
                >
                  {s.id}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-1 font-mono text-label uppercase text-muted">risk ceiling rises per stage · one stage per approval</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={advance}
          disabled={stage >= STAGES.length - 1}
          className="tag py-2 text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Gate passes
        </button>
        <button type="button" onClick={hold} className="tag py-2 transition-colors hover:border-ink/60 hover:text-ink">
          More evidence
        </button>
        <button type="button" onClick={regress} className="tag py-2 transition-colors hover:border-ink/60 hover:text-ink">
          Regression
        </button>
        <span className="ml-auto hidden font-mono text-label uppercase text-muted sm:inline">
          gate: {GATE.join(" · ")}
        </span>
      </div>

      <ul aria-live="polite" className="min-h-[5.6rem] border-t border-line bg-canvas/60 px-4 py-3 font-mono text-label sm:text-meta">
        <AnimatePresence initial={false}>
          {log.map((l, i) => (
            <motion.li
              key={l.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`py-0.5 ${i === log.length - 1 ? (l.tone === "ok" ? "text-accent" : "text-ink") : "text-muted"}`}
            >
              <span className="tabular-nums text-faint">{String(l.id + 1).padStart(3, "0")}</span> {l.text}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Figure>
  );
};
