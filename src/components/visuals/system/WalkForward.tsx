import React, { useState } from "react";
import { motion } from "framer-motion";
import { Figure, Segmented, usePlayback } from "./Figure";

/**
 * Purged walk-forward evaluation as Synthetic Instinct's replay module runs
 * it: anchored or rolling windows; training labels that reach into the
 * embargo before a test window are purged; a final holdout is removed before
 * any window is built and is evaluated once, with the selected trial only.
 * Proportions are schematic.
 */

const MODES = ["rolling", "anchored"] as const;
type Mode = (typeof MODES)[number];

const WINDOWS = 4;
const STEP = 12;
const TRAIN = 30;
const PURGE = 3;
const EMBARGO = 3;
const TEST = 12;
const DEV_END = (WINDOWS - 1) * STEP + TRAIN + PURGE + EMBARGO + TEST; // 84
const HOLDOUT_GAP = 3;
const TOTAL = 100;

const hatch = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgb(var(--c-muted) / 0.55) 0 1px, transparent 1px 5px)",
};

const pct = (n: number) => `${(n / TOTAL) * 100}%`;

const Seg: React.FC<{ from: number; width: number; kind: "train" | "purge" | "embargo" | "test"; label?: string }> = ({
  from,
  width,
  kind,
  label,
}) => (
  <span
    className={`absolute inset-y-0 flex items-center overflow-hidden px-1.5 font-mono text-label uppercase leading-none ${
      kind === "train"
        ? "bg-ink/20 text-ink"
        : kind === "test"
          ? "bg-accent text-canvas"
          : kind === "embargo"
            ? "border-y border-dashed border-muted"
            : ""
    }`}
    style={{ left: pct(from), width: pct(width), ...(kind === "purge" ? hatch : {}) }}
  >
    {label && <span className="hidden sm:inline">{label}</span>}
  </span>
);

export const WalkForward: React.FC = () => {
  const [mode, setMode] = useState<Mode>("rolling");
  const { ref, frame } = usePlayback(WINDOWS + 1, 520, mode);

  return (
    <Figure
      title="purged walk-forward"
      meta={`${mode} windows`}
      label="Walk-forward validation diagram with training, purge, embargo and test segments, and a frozen final holdout."
      caption="Schematic proportions. Window rules (purge, embargo, frozen holdout, selection on training data) follow the system's walk-forward module."
    >
      <div ref={ref}>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-4 py-3">
          <Segmented label="Windows" options={MODES} value={mode} onChange={setMode} />
          <ul className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-label uppercase text-muted">
            <li className="flex items-center gap-1.5">
              <span className="h-3 w-5 bg-ink/20" /> train
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-3 w-5" style={hatch} /> purged labels
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-3 w-5 border-y border-dashed border-muted" /> embargo
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-3 w-5 bg-accent" /> test
            </li>
          </ul>
        </div>

        <div className="px-4 py-4">
          <ol className="space-y-2">
            {Array.from({ length: WINDOWS }, (_, i) => {
              const trainStart = mode === "rolling" ? i * STEP : 0;
              const trainEnd = i * STEP + TRAIN;
              return (
                <li key={i} className="grid grid-cols-[2.2rem_minmax(0,1fr)] items-center gap-2">
                  <span className="font-mono text-label tabular-nums text-muted">W{i + 1}</span>
                  <motion.span
                    className="relative block h-7 border-x border-line/60"
                    initial={false}
                    animate={{ opacity: frame > i ? 1 : 0.12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Seg from={trainStart} width={trainEnd - trainStart} kind="train" label={i === 0 || mode === "anchored" ? "train" : undefined} />
                    <Seg from={trainEnd} width={PURGE} kind="purge" />
                    <Seg from={trainEnd + PURGE} width={EMBARGO} kind="embargo" />
                    <Seg from={trainEnd + PURGE + EMBARGO} width={TEST} kind="test" label="test" />
                  </motion.span>
                </li>
              );
            })}
            <li className="grid grid-cols-[2.2rem_minmax(0,1fr)] items-center gap-2 pt-2">
              <span className="font-mono text-label text-muted">HO</span>
              <motion.span
                className="relative block h-9"
                initial={false}
                animate={{ opacity: frame > WINDOWS ? 1 : 0.12 }}
                transition={{ duration: 0.35 }}
              >
                <span
                  className="absolute inset-y-0 flex items-center overflow-hidden whitespace-nowrap border-y border-line px-2 font-mono text-label uppercase text-muted"
                  style={{ left: 0, width: pct(DEV_END) }}
                >
                  <span className="sm:hidden">development windows</span>
                  <span className="hidden sm:inline">development: every variant scored, selection on training data</span>
                </span>
                <span
                  className="absolute inset-y-0 border-y border-dashed border-muted"
                  style={{ left: pct(DEV_END), width: pct(HOLDOUT_GAP) }}
                />
                <span
                  className="absolute inset-y-0 flex items-center justify-center overflow-hidden border border-ink bg-ink/10 font-mono text-label uppercase text-ink"
                  style={{ left: pct(DEV_END + HOLDOUT_GAP), width: pct(TOTAL - DEV_END - HOLDOUT_GAP) }}
                >
                  <span className="hidden sm:inline">holdout</span>
                </span>
              </motion.span>
            </li>
          </ol>
          <div className="mt-3 grid grid-cols-[2.2rem_minmax(0,1fr)] gap-2 font-mono text-label uppercase text-muted">
            <span />
            <span className="flex justify-between border-t border-line pt-1.5">
              <span className="whitespace-nowrap pr-3">time →</span>
              <span className="text-right">holdout: frozen first, used once</span>
            </span>
          </div>
        </div>
      </div>
    </Figure>
  );
};
