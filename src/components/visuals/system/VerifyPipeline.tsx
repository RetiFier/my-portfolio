import React from "react";
import { Figure, usePlayback } from "./Figure";

/**
 * The checks Synthetic Instinct's single verification command runs, in its
 * order, ending in the report it writes. No durations or counts are shown:
 * this is the shape of the gate, not a recorded run.
 */

const CHECKS: Array<{ name: string; what: string }> = [
  { name: "type-check", what: "production code" },
  { name: "type-check:tests", what: "test code, compiled separately" },
  { name: "lint", what: "quiet mode, errors fail" },
  { name: "audit:architecture", what: "module boundary rules" },
  { name: "audit:dead-code", what: "unreferenced exports and files" },
  { name: "openapi:check", what: "operator API schema drift" },
  { name: "test", what: "full suite, open handles detected" },
  { name: "build", what: "bot" },
  { name: "web:type-check", what: "command center" },
  { name: "web:test", what: "command center" },
  { name: "web:build", what: "command center" },
];

export const VerifyPipeline: React.FC = () => {
  const { ref, frame, done, restart } = usePlayback(CHECKS.length + 1, 260);

  return (
    <Figure
      title="npm run verify"
      meta={done ? "report written" : `${Math.min(frame, CHECKS.length)} / ${CHECKS.length}`}
      label="The verification command's checks in order, ending in a report tied to the commit."
      caption="The gate's structure, in its real order. Illustrative run: no timings or test counts are shown."
    >
      <div ref={ref}>
        <ol className="grid font-mono text-label sm:grid-cols-2 sm:text-meta">
          {CHECKS.map((c, i) => {
            const state = frame > i ? "pass" : frame === i ? "run" : "queued";
            return (
              <li
                key={c.name}
                className="grid grid-cols-[1.6rem_minmax(0,1fr)_auto] items-baseline gap-x-2 border-b border-line px-4 py-2 sm:[&:nth-child(even)]:border-l"
              >
                <span className="tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className={state === "queued" ? "text-muted" : "text-ink"}>{c.name}</span>
                  <span className="block truncate text-muted">{c.what}</span>
                </span>
                <span
                  className={`border px-1.5 py-0.5 text-label uppercase leading-none transition-colors duration-200 ${
                    state === "pass" ? "border-faint text-ink" : state === "run" ? "border-accent text-accent" : "border-line text-faint"
                  }`}
                >
                  {state}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="flex flex-wrap items-center justify-between gap-3 bg-canvas/60 px-4 py-3">
          <p className={`font-mono text-meta transition-colors duration-300 ${done ? "text-ink" : "text-faint"}`}>
            verification-report.json <span className="text-muted">· commit · branch · dirty flag · lockfile sha-256 · node version</span>
          </p>
          <button type="button" onClick={restart} className="tag shrink-0 py-2 transition-colors hover:border-ink/60 hover:text-ink">
            Run again
          </button>
        </div>
      </div>
    </Figure>
  );
};
