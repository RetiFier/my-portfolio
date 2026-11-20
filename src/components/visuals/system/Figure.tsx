import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Shared frame for the case-study system figures: a mono title bar, the body
 * and a caption that says what the figure is (and is not) showing.
 */
export const Figure: React.FC<{
  title: string;
  meta?: React.ReactNode;
  caption: string;
  label: string;
  children: React.ReactNode;
}> = ({ title, meta, caption, label, children }) => (
  <figure aria-label={label} className="border border-line bg-surface">
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line px-4 py-2.5 font-mono text-label uppercase tracking-[0.05em]">
      <span className="text-ink">{title}</span>
      {meta && <span className="tabular-nums text-muted">{meta}</span>}
    </div>
    {children}
    <figcaption className="border-t border-line px-4 py-2.5 text-meta text-muted [text-wrap:pretty]">{caption}</figcaption>
  </figure>
);

/** Square segmented control used by the interactive figures. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  render?: (v: T) => React.ReactNode;
}) {
  return (
    <div role="group" aria-label={label} className="min-w-0">
      <p className="font-mono text-label uppercase tracking-[0.05em] text-muted">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {options.map((o) => {
          const on = o === value;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o)}
              className={`border px-2.5 py-2 font-mono text-label uppercase leading-none tracking-[0.04em] transition-colors duration-200 ${
                on ? "border-ink bg-ink text-canvas" : "border-line text-muted hover:border-ink/60 hover:text-ink"
              }`}
            >
              {render ? render(o) : o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Steps through `total` frames while the figure is on screen. Server render
 * and reduced motion get the finished state (`total`), so nothing is hidden
 * without JavaScript. `restart()` replays from the first frame.
 */
export function usePlayback(total: number, stepMs: number, key: unknown = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "-15% 0px -15% 0px" });
  const [frame, setFrame] = useState(total);
  const [armed, setArmed] = useState(false);

  // Start from zero the first time the figure is seen...
  useEffect(() => {
    if (!reduce && inView && !armed) {
      setArmed(true);
      setFrame(0);
    }
  }, [reduce, inView, armed]);

  // ...and again whenever the caller's `key` (e.g. the chosen scenario) changes.
  useEffect(() => {
    setFrame(reduce || !armed ? total : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (reduce || !armed || !inView || frame >= total) return;
    const t = window.setTimeout(() => setFrame((f) => f + 1), stepMs);
    return () => window.clearTimeout(t);
  }, [reduce, armed, inView, frame, total, stepMs]);

  return {
    ref,
    frame,
    done: frame >= total,
    restart: () => setFrame(reduce ? total : 0),
  };
}
