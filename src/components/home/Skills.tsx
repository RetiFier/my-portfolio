import React, { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { SkillGroup } from "../../@types/about";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";
import { EASE } from "../../utils/animations";
import { SkillOrbit } from "../motion/SkillOrbit";

const pad = (n: number) => String(n).padStart(2, "0");

/** Viewport height of scroll spent on each capability area while pinned. */
const STEP_VH = 60;

/* ------------------------------------------------------------------ */

/** Bottom tab with its own progress bar for the pinned view. */
const PinTab: React.FC<{
  i: number;
  n: number;
  title: string;
  active: boolean;
  progress: MotionValue<number>;
  onSelect: (i: number) => void;
}> = ({ i, n, title, active, progress, onSelect }) => {
  const fill = useTransform(progress, [i / n, (i + 1) / n], [0, 1], { clamp: true });
  return (
    <button
      type="button"
      onClick={() => onSelect(i)}
      aria-current={active ? "step" : undefined}
      className="group relative pt-4 text-left"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-line">
        <motion.span style={{ scaleX: fill }} className="absolute inset-0 origin-left bg-accent" />
      </span>
      <span className={`block font-mono text-label tabular-nums ${active ? "text-accent" : "text-faint"}`}>{pad(i + 1)}</span>
      <span
        className={`mt-1 block text-[0.95rem] leading-snug transition-colors ${
          active ? "text-ink" : "text-muted group-hover:text-ink"
        }`}
      >
        {title}
      </span>
    </button>
  );
};

/**
 * Pinned view for tall desktop screens: the section holds still while the
 * reader scrolls through each area, with a progress tab bar at the bottom.
 */
const PinnedCapabilities: React.FC<{ groups: SkillGroup[] }> = ({ groups }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = groups.length;
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(Math.min(n - 1, Math.max(0, Math.floor(p * n)))));
  const current = groups[active];

  const select = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const distance = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.2) / n) * distance, behavior: "smooth" });
  };

  return (
    <div ref={trackRef} className="relative hidden lg:[@media(min-height:800px)]:block" style={{ height: `calc(100vh + ${n * STEP_VH}vh)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center pb-10 pt-24">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <p className="font-mono text-label uppercase tracking-[0.05em] text-muted">
                  <span className="text-accent">{pad(active + 1)}</span> / {pad(n)}
                </p>
                <h3 className="display mt-4 text-[2.2rem] text-ink xl:text-[2.75rem] 2xl:text-[3.25rem]">{current.title}</h3>
                <SkillDetail group={current} compact hideItems />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="lg:col-span-7">
            <SkillOrbit title={current.title} items={current.items ?? []} index={active} total={n} />
          </div>
        </div>
        <nav aria-label="Capability areas" className="mt-8 grid gap-6" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {groups.map((g, i) => (
            <PinTab key={g.title} i={i} n={n} title={g.title} active={i === active} progress={scrollYProgress} onSelect={select} />
          ))}
        </nav>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

/**
 * Capabilities as an index + detail view: each area explains what the work
 * looks like in practice before listing technologies. Tall desktop screens
 * get the pinned view; short desktop screens the tabbed one; small screens
 * show every area in sequence.
 */
export const Skills: React.FC<{ groups: SkillGroup[] }> = ({ groups }) => {
  const [active, setActive] = useState(0);
  const current = groups[active];

  return (
    <section id="skills" aria-labelledby="skills-title" className="container-site relative scroll-mt-20 pt-20 md:pt-28">
      <SectionHeader
        index="04"
        eyebrow="Capabilities"
        id="skills-title"
        title="Capabilities"
        note="grounded in shipped work"
        lead="Technologies matter less than knowing where they fit. Each area below starts with what the work looks like in practice."
      />

      <PinnedCapabilities groups={groups} />

      {/* Short desktop screens: index + detail */}
      <Reveal className="hidden overflow-hidden border border-line lg:grid lg:grid-cols-12 lg:[@media(min-height:800px)]:hidden">
        <div role="tablist" aria-label="Capability areas" aria-orientation="vertical" className="border-r border-line lg:col-span-5">
          {groups.map((g, i) => {
            const selected = i === active;
            return (
              <button
                key={g.title}
                role="tab"
                id={`skill-tab-${i}`}
                aria-selected={selected}
                aria-controls="skill-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const next = (i + (e.key === "ArrowDown" ? 1 : -1) + groups.length) % groups.length;
                    setActive(next);
                    document.getElementById(`skill-tab-${next}`)?.focus();
                  }
                }}
                className={`group relative flex w-full items-baseline gap-5 border-b border-line px-7 py-6 text-left transition-colors duration-300 last:border-b-0 ${
                  selected ? "bg-raised" : "hover:bg-surface"
                }`}
              >
                <span className={`font-mono text-meta ${selected ? "text-accent" : "text-faint"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`font-display text-2xl font-semibold uppercase tracking-[-0.02em] ${selected ? "text-ink" : "text-muted group-hover:text-ink"}`}>
                  {g.title}
                </span>
                {selected && (
                  <motion.span
                    layoutId="skill-indicator"
                    className="absolute inset-y-0 left-0 w-[2px] bg-accent"
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div id="skill-panel" role="tabpanel" aria-labelledby={`skill-tab-${active}`} className="relative min-h-[26rem] p-10 lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <SkillDetail group={current} />
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>

      {/* Mobile / tablet: stacked */}
      <div className="space-y-4 lg:hidden">
        {groups.map((g, i) => (
          <Reveal key={g.title} className="border border-line p-6">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-meta text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-2xl font-semibold uppercase tracking-[-0.02em] text-ink">{g.title}</h3>
            </div>
            <div className="mt-5">
              <SkillDetail group={g} compact />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const SkillDetail: React.FC<{ group: SkillGroup; compact?: boolean; hideItems?: boolean }> = ({ group, compact, hideItems }) => (
  <div className={hideItems ? "mt-6" : undefined}>
    {group.summary && (
      <p className={`${compact ? "text-base" : "text-2xl leading-snug tracking-[-0.01em]"} text-ink`}>{group.summary}</p>
    )}
    {group.practice?.length ? (
      <div className="mt-7">
        <p className="eyebrow">In practice</p>
        <ul className="mt-3 space-y-2.5">
          {group.practice.map((p) => (
            <li key={p} className="flex gap-3 leading-relaxed text-muted">
              <span aria-hidden="true" className="mt-[0.75em] h-px w-3 shrink-0 bg-accent" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    ) : null}
    {group.items?.length && !hideItems ? (
      <ul aria-label={`${group.title} technologies`} className="mt-7 flex flex-wrap gap-2">
        {group.items.map((item) => (
          <li key={item} className="border border-line px-2.5 py-1 font-mono text-meta uppercase tracking-[0.04em] text-ink/85 transition-colors hover:border-ink hover:bg-ink hover:text-canvas">
            {item}
          </li>
        ))}
      </ul>
    ) : null}
  </div>
);
