import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Figure, Segmented } from "./Figure";

/**
 * The five ports between Synthetic Instinct's decision core and the outside
 * world, with the live and replay adapter behind each one. Switching modes
 * swaps every adapter; the decision core in the middle does not change.
 */

const MODES = ["live", "replay"] as const;
type Mode = (typeof MODES)[number];

const PORTS: Array<{ port: string; live: string; replay: string }> = [
  { port: "Clock", live: "system time", replay: "monotonic replay clock" },
  { port: "Market data", live: "exchange reads; read-only, future candles excluded", replay: "recorded events in receive-time order" },
  { port: "Account", live: "account snapshot; degraded until reconciled", replay: "simulated account" },
  { port: "Execution", live: "execution gateway + durable intent ledger", replay: "simulated execution with fill models" },
  { port: "Decision journal", live: "append-only database events", replay: "in-memory journal" },
];

export const PortsSwitch: React.FC = () => {
  const [mode, setMode] = useState<Mode>("live");

  return (
    <Figure
      title="ports and adapters"
      meta={`mode ${mode}`}
      label="Ports diagram. Switch between live and replay to see which adapter sits behind each port."
      caption="Switch modes: every adapter changes, the decision core does not. Simulated adapters are never wired into live trading."
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-4 py-3">
        <Segmented label="Run mode" options={MODES} value={mode} onChange={setMode} />
        <p className="font-mono text-label uppercase tracking-[0.05em] text-muted">snapshots carry VALID · DEGRADED · INVALID</p>
      </div>

      <div className="grid gap-px bg-line md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        {/* the unchanging core */}
        <div className="flex flex-col justify-center bg-canvas/60 p-4 sm:p-5">
          <p className="font-mono text-label uppercase tracking-[0.05em] text-muted">Decision core</p>
          <p className="mt-2 font-display text-xl font-semibold uppercase tracking-[-0.01em] text-ink">Same code in both modes</p>
          <ol className="mt-4 space-y-1.5 font-mono text-meta text-ink/90">
            {["evaluate candidates", "rank once", "emit ordered trace", "submit intents"].map((s, i) => (
              <li key={s} className="flex gap-2">
                <span className="tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        {/* ports */}
        <ul className="bg-surface">
          {PORTS.map((p) => (
            <li
              key={p.port}
              className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-3 border-t border-line px-4 py-3 first:border-t-0 sm:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <span className="font-mono text-label uppercase tracking-[0.04em] text-muted">{p.port}</span>
              <span className="block overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mode}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className={`block font-mono text-meta ${mode === "live" ? "text-ink" : "text-accent"}`}
                  >
                    {mode === "live" ? p.live : p.replay}
                  </motion.span>
                </AnimatePresence>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Figure>
  );
};
