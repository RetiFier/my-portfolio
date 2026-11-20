import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { JobType } from "../../@types/job";
import { currentYearMonth, formatRange, formatYearMonth, parseYearMonth, toMonthIndex } from "../../utils/dates";
import { EASE } from "../../utils/animations";
import { useSiteData } from "../../hooks/useSiteData";

interface CareerTimelineProps {
  jobs: JobType[];
  /** Role currently in view (or last selected); highlighted in the index. */
  activeId: string | null;
  onSelect: (id: string) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Compact year range for the index: "2023 – 2025", "2026 – now", "2022" or "start 2022". */
const shortRange = (job: JobType): string => {
  const from = parseYearMonth(job.fromDate).year;
  if (job.toDate) {
    const to = parseYearMonth(job.toDate).year;
    return from === to ? String(from) : `${from} – ${to}`;
  }
  return job.current ? `${from} – now` : `start ${from}`;
};

/**
 * Career index: every role as a labelled row with its own track on a shared
 * time axis, so overlapping roles read as concurrent rather than summed.
 * The row for the role being read below is highlighted and the axis cursor
 * moves to its start month. Roles without a confirmed end date show a start
 * marker only.
 */
export const CareerTimeline: React.FC<CareerTimelineProps> = ({ jobs, activeId, onSelect }) => {
  const { now: buildDate } = useSiteData();
  const reduce = useReducedMotion();
  const chronological = [...jobs].sort((a, b) => a.fromDate.localeCompare(b.fromDate));
  const start = toMonthIndex(parseYearMonth(chronological[0].fromDate));
  const end = toMonthIndex(currentYearMonth(buildDate));
  const span = Math.max(1, end - start + 1);
  const pct = (m: number) => Math.min(100, Math.max(0, ((m - start) / span) * 100));

  const firstYear = parseYearMonth(chronological[0].fromDate).year;
  const lastYear = currentYearMonth(buildDate).year;
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);

  const active = jobs.find((j) => j.id === activeId) ?? null;
  const cursor = active ? pct(toMonthIndex(parseYearMonth(active.fromDate))) : 100;
  const cursorLabel = active ? formatYearMonth(active.fromDate) : "now";

  return (
    <div className="border border-line bg-surface/70">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="font-mono text-label uppercase tracking-[0.05em] text-ink">Career index</p>
        <p className="font-mono text-label tabular-nums text-muted">
          {pad(jobs.length)} roles / {firstYear} – {lastYear}
        </p>
      </div>

      <ol>
        {jobs.map((job, i) => {
          const from = toMonthIndex(parseYearMonth(job.fromDate));
          const openEnded = !job.toDate && !job.current;
          const to = job.toDate ? toMonthIndex(parseYearMonth(job.toDate)) : end;
          const left = pct(from);
          const width = Math.max(1.5, pct(to + 1) - left);
          const isActive = activeId === job.id;
          return (
            <li key={job.id} className="border-b border-line/70 last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect(job.id)}
                aria-current={isActive ? "true" : undefined}
                aria-label={`${job.jobTitle}, ${job.company.name}, ${formatRange(job)}. Show role.`}
                className={`group relative grid w-full grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3 px-4 py-2.5 text-left transition-colors duration-300 ${
                  isActive ? "bg-ink/[0.05]" : "hover:bg-ink/[0.03]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 w-[2px] origin-top bg-accent transition-transform duration-500 ${
                    isActive ? "scale-y-100" : "scale-y-0"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`font-mono text-label tabular-nums transition-colors ${isActive ? "text-accent" : "text-faint"}`}
                >
                  {pad(i + 1)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.9375rem] font-medium leading-snug text-ink">{job.company.name}</span>
                  <span className="block truncate text-meta text-muted">
                    {job.jobTitle}
                  </span>
                </span>
                <span
                  className={`font-mono text-label tabular-nums transition-colors ${
                    isActive ? "text-ink" : "text-muted group-hover:text-ink"
                  }`}
                >
                  {shortRange(job)}
                </span>

                {/* Track on the shared axis */}
                <span aria-hidden="true" className="relative col-start-2 col-end-4 mt-2 block h-[3px] bg-line">
                  {openEnded ? (
                    <span
                      className={`absolute -top-[3px] h-[9px] w-[3px] transition-colors ${isActive ? "bg-accent" : "bg-muted"}`}
                      style={{ left: `${left}%` }}
                    />
                  ) : (
                    <motion.span
                      className={`absolute inset-y-0 origin-left transition-colors duration-300 ${
                        isActive ? "bg-accent" : job.current ? "bg-ink" : "bg-muted/70 group-hover:bg-ink/80"
                      }`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.15 + i * 0.07, ease: EASE }}
                    />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Shared axis with a cursor at the start of the role in view */}
      <div aria-hidden="true" className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 border-t border-line px-4 pb-2.5 pt-8">
        <span className="font-mono text-label text-faint">t</span>
        <div className="relative h-5">
          <span className="absolute inset-x-0 top-0 h-px bg-faint/60" />
          {years.map((y) => {
            const left = pct(y * 12);
            if (y * 12 < start) return null;
            return (
              <span key={y} className="absolute top-0" style={{ left: `${left}%` }}>
                <span className="absolute top-0 h-1.5 w-px bg-faint" />
                {left < 94 && (
                  <span className="absolute top-2 -translate-x-1/2 font-mono text-label tabular-nums text-muted">
                    {`’${String(y).slice(2)}`}
                  </span>
                )}
              </span>
            );
          })}
          <motion.span
            className="absolute -top-6 bottom-auto"
            initial={false}
            animate={{ left: `${cursor}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 }}
          >
            <span className="absolute top-0 h-7 w-px bg-accent" />
            <span
              className={`absolute top-0 whitespace-nowrap bg-accent px-1 font-mono text-label uppercase leading-[1.1rem] text-canvas ${
                cursor > 70 ? "right-0" : "left-0"
              }`}
            >
              {cursorLabel}
            </span>
          </motion.span>
        </div>
      </div>
    </div>
  );
};
