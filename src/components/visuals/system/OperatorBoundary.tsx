import React, { useState } from "react";
import { Figure, Segmented, usePlayback } from "./Figure";

/**
 * Trust boundaries between the web command center and the trading process,
 * following the system's command-center architecture note. Routes, header
 * names and hosts are deliberately left out.
 */

const MODES = ["read", "guarded action"] as const;
type Mode = (typeof MODES)[number];

interface Hop {
  node: string;
  role: string;
  check: string;
}

const READ: Hop[] = [
  { node: "Browser", role: "operator's session", check: "talks only to its own origin" },
  { node: "Web server", role: "Next.js, no trading code", check: "service credential + verified operator session" },
  { node: "Operator API", role: "bot process", check: "rate-limited per session; output schema-validated; private, no-store" },
  { node: "Read models", role: "account snapshot, journal, incidents", check: "missing evidence stays UNKNOWN" },
];

const ACTION: Hop[] = [
  { node: "Browser", role: "operator confirms", check: "talks only to its own origin" },
  { node: "Web server", role: "Next.js, no trading code", check: "service credential + verified operator session" },
  { node: "Operator API", role: "bot process", check: "idempotency key and correlation ID on every action" },
  { node: "Bot authority", role: "risk, mode, incidents", check: "order and position actions re-read fresh state and must match the fingerprint the operator saw" },
  { node: "Execution gateway", role: "the only order path", check: "every exchange mutation passes through here" },
];

export const OperatorBoundary: React.FC = () => {
  const [mode, setMode] = useState<Mode>("read");
  const hops = mode === "read" ? READ : ACTION;
  const { ref, frame } = usePlayback(hops.length, 600, mode);

  return (
    <Figure
      title="command center boundary"
      meta={mode}
      label="Diagram of the trust boundaries a read and a guarded action cross, from the browser to the execution gateway."
      caption="Simplified. Each boundary lists what is checked there; the web app never holds an exchange client or trading logic."
    >
      <div ref={ref}>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-4 py-3">
          <Segmented label="Request" options={MODES} value={mode} onChange={setMode} />
          <p className="max-w-[18rem] font-mono text-label uppercase leading-snug tracking-[0.04em] text-muted">
            unlinked backend → explicit unlinked state, never sample data
          </p>
        </div>

        <ol className="px-4 py-4">
          {hops.map((h, i) => {
            const reached = frame > i;
            const current = frame === i + 1;
            return (
              <li key={`${mode}-${h.node}`} className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 pb-4 last:pb-0">
                {i < hops.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-[11px] top-6 w-px transition-colors duration-500 ${frame > i + 1 ? "bg-accent" : "bg-line"}`}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`relative z-10 mt-0.5 flex h-[23px] w-[23px] items-center justify-center border font-mono text-label transition-colors duration-300 ${
                    current ? "border-accent bg-accent text-canvas" : reached ? "border-ink bg-canvas text-ink" : "border-line bg-canvas text-faint"
                  }`}
                >
                  {i + 1}
                </span>
                <div className={`grid gap-x-6 gap-y-1 transition-opacity duration-300 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] ${reached ? "opacity-100" : "opacity-40"}`}>
                  <p>
                    <span className="font-display text-lg font-[760] [font-stretch:104%] uppercase tracking-[-0.01em] text-ink">{h.node}</span>
                    <span className="mt-0.5 block font-mono text-label uppercase text-muted">{h.role}</span>
                  </p>
                  <p className="font-mono text-meta text-ink/85">{h.check}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="border-t border-line bg-canvas/60 px-4 py-3 font-mono text-meta text-muted">
          <span className="text-ink">Telegram bot</span> · commands, alerts and confirmations reach the same bot authority
          through an authenticated webhook and an operator allowlist.
        </p>
      </div>
    </Figure>
  );
};
