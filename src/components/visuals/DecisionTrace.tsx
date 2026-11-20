import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { explore } from "../../hooks/useExplore";

/**
 * Visual for Synthetic Instinct: one scan cycle replayed as a console trace.
 *
 * The rules are the system's own decision contract:
 * - INVALID data or a failed authoritative gate always resolves to BLOCK;
 * - DEGRADED data cannot keep an automatic action (AUTO / MICRO_AUTO -> MANUAL);
 * - advisory gate failures are recorded but never block;
 * - one deterministic rank, with blocked candidates sorted last;
 * - order intents move PENDING -> IN_PROGRESS with a single claimant; an intent
 *   left in progress by a restart is reported UNKNOWN for reconciliation, and a
 *   repeated intent returns its stored outcome without a new order.
 *
 * Candidates are placeholders. No symbols, prices, sizes or results are shown.
 */

type Quality = "VALID" | "DEGRADED" | "INVALID";
type Action = "BLOCK" | "WATCH" | "MANUAL" | "MICRO_AUTO" | "AUTO";
type Gates = "pass" | "auth" | "adv";

interface Candidate {
  id: string;
  quality: Quality;
  gates: Gates;
  requested: Exclude<Action, "BLOCK">;
  /** Position by ranking value before blocking (lower ranks higher). */
  value: number;
}

interface LaneStep {
  label: string;
  tone: "state" | "fault" | "final";
}

interface Cycle {
  candidates: Candidate[];
  lane: LaneStep[];
  note: string;
}

const CYCLES: Cycle[] = [
  {
    candidates: [
      { id: "cand-a", quality: "VALID", gates: "pass", requested: "AUTO", value: 1 },
      { id: "cand-b", quality: "DEGRADED", gates: "pass", requested: "AUTO", value: 2 },
      { id: "cand-c", quality: "VALID", gates: "auth", requested: "AUTO", value: 0 },
      { id: "cand-d", quality: "VALID", gates: "adv", requested: "WATCH", value: 3 },
      { id: "cand-e", quality: "INVALID", gates: "pass", requested: "MANUAL", value: 4 },
    ],
    lane: [
      { label: "PENDING", tone: "state" },
      { label: "IN_PROGRESS", tone: "state" },
      { label: "ACCEPTED", tone: "state" },
      { label: "FILLED", tone: "final" },
    ],
    note: "one claimant moves the intent through the ledger",
  },
  {
    candidates: [
      { id: "cand-a", quality: "VALID", gates: "pass", requested: "MANUAL", value: 0 },
      { id: "cand-b", quality: "VALID", gates: "pass", requested: "MICRO_AUTO", value: 1 },
      { id: "cand-c", quality: "INVALID", gates: "pass", requested: "AUTO", value: 2 },
      { id: "cand-d", quality: "DEGRADED", gates: "adv", requested: "MICRO_AUTO", value: 3 },
      { id: "cand-e", quality: "VALID", gates: "pass", requested: "WATCH", value: 4 },
    ],
    lane: [
      { label: "PENDING", tone: "state" },
      { label: "IN_PROGRESS", tone: "state" },
      { label: "RESTART", tone: "fault" },
      { label: "UNKNOWN", tone: "final" },
    ],
    note: "never retried automatically: reconciliation required",
  },
  {
    candidates: [
      { id: "cand-a", quality: "DEGRADED", gates: "pass", requested: "WATCH", value: 2 },
      { id: "cand-b", quality: "VALID", gates: "pass", requested: "AUTO", value: 0 },
      { id: "cand-c", quality: "VALID", gates: "auth", requested: "MANUAL", value: 1 },
      { id: "cand-d", quality: "VALID", gates: "pass", requested: "WATCH", value: 3 },
      { id: "cand-e", quality: "INVALID", gates: "adv", requested: "AUTO", value: 4 },
    ],
    lane: [
      { label: "SAME INTENT", tone: "state" },
      { label: "STORED OUTCOME", tone: "final" },
    ],
    note: "replayed from the ledger: no second order",
  },
];

/** The contract's action rule. */
const resolve = (c: Candidate): Action => {
  if (c.quality === "INVALID" || c.gates === "auth") return "BLOCK";
  if (c.quality === "DEGRADED" && (c.requested === "AUTO" || c.requested === "MICRO_AUTO")) return "MANUAL";
  return c.requested;
};

const rankOrder = (cands: Candidate[]) =>
  [...cands].sort(
    (a, b) => Number(resolve(a) === "BLOCK") - Number(resolve(b) === "BLOCK") || a.value - b.value || a.id.localeCompare(b.id),
  );

const STEPS = ["evaluate", "rank", "execute", "journal"] as const;
const ROWS = 5;
const RANK_PHASE = ROWS + 1;
const laneStart = RANK_PHASE + 1;
const finalPhase = (cycle: Cycle) => laneStart + cycle.lane.length;

const durationFor = (phase: number, cycle: Cycle): number => {
  if (phase === 0) return 700;
  if (phase <= ROWS) return 520;
  if (phase === RANK_PHASE) return 1100;
  if (phase < finalPhase(cycle)) return 750;
  return 3200;
};

const gatesLabel: Record<Gates, string> = { pass: "3/3", auth: "auth ×", adv: "adv ~" };

const pad = (n: number, w = 4) => String(n).padStart(w, "0");

export const DecisionTrace: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "-10% 0px -10% 0px" });
  const [visible, setVisible] = useState(true);
  const [started, setStarted] = useState(false);
  // Server render and reduced motion show a complete first cycle.
  const [state, setState] = useState({ cycle: 0, phase: finalPhase(CYCLES[0]) });

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (inView && !reduce && !started) {
      setStarted(true);
      setState({ cycle: 0, phase: 0 });
    }
  }, [inView, reduce, started]);

  useEffect(() => {
    if (!started || reduce || !inView || !visible) return;
    const cycle = CYCLES[state.cycle];
    const t = window.setTimeout(() => {
      setState((s) =>
        s.phase >= finalPhase(CYCLES[s.cycle]) ? { cycle: (s.cycle + 1) % CYCLES.length, phase: 0 } : { ...s, phase: s.phase + 1 },
      );
    }, durationFor(state.phase, cycle));
    return () => window.clearTimeout(t);
  }, [started, reduce, inView, visible, state]);

  // Trophy: the visitor watched the restart cycle reach UNKNOWN (reconciliation).
  useEffect(() => {
    if (started && state.cycle === 1 && state.phase >= finalPhase(CYCLES[1])) explore.unlock("trace");
  }, [started, state]);

  const cycle = CYCLES[state.cycle];
  const { phase } = state;
  const ranked = phase >= RANK_PHASE;
  const rows = ranked ? rankOrder(cycle.candidates) : cycle.candidates;
  const rankOf = useMemo(() => new Map(rankOrder(cycle.candidates).map((c, i) => [c.id, i + 1])), [cycle]);
  const executing = rankOrder(cycle.candidates).find((c) => {
    const a = resolve(c);
    return a === "AUTO" || a === "MICRO_AUTO";
  });
  const laneShown = Math.max(0, phase - laneStart + 1);
  const stepIndex = phase <= ROWS ? 0 : phase === RANK_PHASE ? 1 : phase < finalPhase(cycle) ? 2 : 3;

  // Ordered trace for this cycle, derived from the phase.
  const trace: Array<{ text: string; strong?: boolean }> = [];
  cycle.candidates.forEach((c, i) => {
    if (phase > i + 1 || ranked) trace.push({ text: `eval   ${c.id}  ${c.quality.padEnd(8)} ${resolve(c)}` });
  });
  if (ranked) trace.push({ text: `rank   ${ROWS} candidates, blocked last` });
  cycle.lane.slice(0, laneShown).forEach((s) => trace.push({ text: `intent ${executing?.id ?? ""}  ${s.label}`, strong: s.tone !== "state" }));
  if (phase >= finalPhase(cycle)) trace.push({ text: "journal decision.lifecycle_changed", strong: true });
  const base = state.cycle * 16;
  const tail = trace.map((t, i) => ({ ...t, seq: base + i + 1 })).slice(-4);

  return (
    <figure className="relative overflow-hidden border border-line bg-surface">
      <figcaption className="sr-only">
        Illustration of one scan cycle in Synthetic Instinct. Each candidate is evaluated for data quality and gates;
        invalid data or a failed authoritative gate blocks it, degraded data reduces automatic actions to manual review,
        candidates are ranked once with blocked candidates last, and the top automatic candidate becomes an order intent
        that moves through a durable ledger. Candidates are placeholders, not market data.
      </figcaption>

      <div ref={ref} aria-hidden="true" className="font-mono">
        {/* title bar */}
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-label uppercase tracking-[0.05em]">
          <span className="text-ink">scan cycle</span>
          <span className="tabular-nums text-muted">
            cycle {pad(state.cycle + 1, 2)} / {pad(CYCLES.length, 2)}
          </span>
        </div>

        {/* pipeline steps */}
        <ol className="grid grid-cols-4 border-b border-line text-label uppercase tracking-[0.04em]">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={`border-line px-2 py-2 transition-colors duration-300 sm:px-3 ${i > 0 ? "border-l" : ""} ${
                i === stepIndex ? "bg-ink text-canvas" : i < stepIndex ? "text-ink" : "text-faint"
              }`}
            >
              <span className="hidden tabular-nums opacity-70 sm:inline">{pad(i + 1, 2)} </span>
              {s}
            </li>
          ))}
        </ol>

        {/* candidate table */}
        <div className="px-4 pt-3 text-meta">
          <div className="grid grid-cols-[3.2rem_4.3rem_3rem_minmax(0,1fr)_1.5rem] gap-x-1.5 pb-2 text-label uppercase text-faint sm:gap-x-2 sm:grid-cols-[5rem_6rem_4.5rem_minmax(0,1fr)_2.5rem]">
            <span>cand</span>
            <span>data</span>
            <span>gates</span>
            <span>action</span>
            <span className="text-right">rank</span>
          </div>
          <ul>
            {rows.map((c, i) => {
              const inputIndex = cycle.candidates.indexOf(c);
              const resolved = ranked || phase > inputIndex + 1;
              const evaluating = !ranked && phase === inputIndex + 1;
              const action = resolve(c);
              const overridden = action !== c.requested && action !== "BLOCK";
              const isExec = executing?.id === c.id && phase >= laneStart;
              return (
                <motion.li
                  key={`${state.cycle}-${c.id}`}
                  layout={!reduce}
                  transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  className={`relative grid grid-cols-[3.2rem_4.3rem_3rem_minmax(0,1fr)_1.5rem] items-center gap-x-1.5 border-t border-line/70 py-2 text-label sm:gap-x-2 sm:text-meta sm:grid-cols-[5rem_6rem_4.5rem_minmax(0,1fr)_2.5rem] ${
                    evaluating ? "bg-ink/[0.06]" : ""
                  }`}
                >
                  <span
                    className={`absolute -left-4 inset-y-0 w-[2px] bg-accent transition-opacity duration-300 ${isExec ? "opacity-100" : "opacity-0"}`}
                  />
                  <span className={isExec ? "text-accent" : "text-ink"}>{c.id}</span>
                  <span
                    className={
                      !resolved ? "text-faint" : c.quality === "VALID" ? "text-ink" : c.quality === "DEGRADED" ? "text-muted" : "text-muted line-through"
                    }
                  >
                    {resolved ? c.quality : evaluating ? "reading" : "--"}
                  </span>
                  <span className={!resolved ? "text-faint" : c.gates === "auth" ? "text-ink" : "text-muted"}>
                    {resolved ? gatesLabel[c.gates] : "--"}
                  </span>
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                    {!resolved ? (
                      <span className="text-faint">--</span>
                    ) : action === "BLOCK" ? (
                      <span className="bg-line px-1 text-muted">BLOCK</span>
                    ) : (
                      <>
                        {overridden && <s className="text-faint">{c.requested}</s>}
                        <span className={action === "AUTO" || action === "MICRO_AUTO" ? "text-accent" : "text-ink"}>
                          {action}
                        </span>
                      </>
                    )}
                  </span>
                  <span className="text-right tabular-nums text-muted">{ranked ? pad(rankOf.get(c.id) ?? 0, 2) : "--"}</span>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* execution lane */}
        <div className="mt-3 border-t border-line px-4 py-3">
          <div className="flex items-center justify-between gap-3 text-label uppercase">
            <span className="text-faint">intent ledger</span>
            <span className="text-muted">{executing && phase >= laneStart ? executing.id : "waiting"}</span>
          </div>
          <ol className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-label uppercase">
            {cycle.lane.map((s, i) => {
              const shown = i < laneShown;
              const current = shown && i === laneShown - 1;
              return (
                <li key={`${state.cycle}-${s.label}`} className="flex items-center gap-1.5">
                  {i > 0 && <span className={`transition-colors ${shown ? "text-muted" : "text-line"}`}>→</span>}
                  <span
                    className={`border px-1.5 py-1 leading-none transition-colors duration-300 ${
                      !shown
                        ? "border-line text-faint"
                        : s.tone === "fault"
                          ? "border-dashed border-muted text-muted"
                          : current
                            ? "border-accent text-accent"
                            : "border-faint text-ink"
                    }`}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className={`mt-2 text-label text-muted transition-opacity duration-500 ${phase >= finalPhase(cycle) ? "opacity-100" : "opacity-0"}`}>
            {cycle.note}
          </p>
        </div>

        {/* trace tail */}
        <div className="border-t border-line bg-canvas/60 px-4 py-3 text-label">
          <ul className="min-h-[4.4rem] space-y-0.5">
            {tail.map((t, i) => (
              <li
                key={t.seq}
                className={`overflow-hidden text-ellipsis whitespace-pre ${i === tail.length - 1 ? "text-ink" : t.strong ? "text-muted" : "text-faint"}`}
              >
                <span className="tabular-nums text-faint">{pad(t.seq)}</span> {t.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="border-t border-line px-4 py-2.5 text-meta text-muted [text-wrap:pretty]">
        Illustrative cycle. The states and rules follow the system's decision contract; candidates are placeholders, not
        market data.
      </p>
    </figure>
  );
};
