import React, { useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { navSections } from "../../theme/navSections";
import { useActiveSection } from "../../hooks/useActiveSection";
import { openCommandPalette } from "../CommandPalette";
import { useShortcutLabel } from "../../hooks/useShortcutLabel";

/**
 * Fixed instrument rail on wide screens: current section index, a scroll
 * gauge, the scroll percentage and the command-menu shortcut. Every value is
 * read from the page itself. Hidden below xl and in print.
 */
export const Hud: React.FC<{ isHome: boolean }> = ({ isHome }) => {
  const active = useActiveSection(isHome);
  const { scrollYProgress } = useScroll();
  const gauge = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [pct, setPct] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => setPct(Math.round(v * 100)));
  const shortcut = useShortcutLabel();

  const index = active ? navSections.findIndex((s) => s.id === active) + 1 : 0;
  const label = active ? navSections[index - 1].label : isHome ? "Intro" : "Page";
  const total = navSections.length;

  return (
    <aside
      aria-hidden="true"
      className="no-print pointer-events-none fixed bottom-6 left-4 top-24 z-40 hidden w-8 flex-col items-center justify-between font-mono text-label uppercase tracking-[0.05em] text-faint xl:flex"
    >
      {isHome ? (
        <div className="flex flex-col items-center gap-2 [writing-mode:vertical-rl]">
          <span className="text-ink tabular-nums">
            {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <motion.span key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {label}
          </motion.span>
        </div>
      ) : (
        <span />
      )}

      <div className="relative my-6 w-px flex-1 bg-line">
        <motion.span className="absolute inset-x-0 top-0 h-full origin-top bg-accent" style={{ scaleY: gauge }} />
        {/* section ticks */}
        {isHome &&
          navSections.map((s, i) => (
            <span
              key={s.id}
              className={`absolute -left-[3px] h-px w-[7px] ${i + 1 <= index ? "bg-accent" : "bg-faint"}`}
              style={{ top: `${((i + 1) / (total + 1)) * 100}%` }}
            />
          ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="tabular-nums [writing-mode:vertical-rl]">{String(pct).padStart(3, "0")}%</span>
        <button
          type="button"
          onClick={openCommandPalette}
          tabIndex={-1}
          className="pointer-events-auto border border-line px-1 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent [writing-mode:vertical-rl]"
        >
          {shortcut}
        </button>
      </div>
    </aside>
  );
};
