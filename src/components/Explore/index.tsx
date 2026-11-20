import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { graphql, useStaticQuery } from "gatsby";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { navSections } from "../../theme/navSections";
import { explore, TROPHIES, useExplore } from "../../hooks/useExplore";
import { useActiveSection } from "../../hooks/useActiveSection";
import { useShortcutLabel } from "../../hooks/useShortcutLabel";
import { goToSection, isTyping, scrollToY } from "../../utils/goToSection";
import { EASE } from "../../utils/animations";

/** Open the controls panel or the page map from anywhere (e.g. the command menu). */
export const toggleExplorePanel = () => window.dispatchEvent(new CustomEvent("explore:panel"));
export const toggleMinimap = () => window.dispatchEvent(new CustomEvent("explore:map"));

const pad = (n: number) => String(n).padStart(2, "0");
const useEase = () => {
  const reduce = useReducedMotion();
  return reduce ? { duration: 0 } : { duration: 0.28, ease: EASE };
};

/** Segmented progress bar: one square cell per item. */
const Cells: React.FC<{ done: number; total: number }> = ({ done, total }) => (
  <span aria-hidden="true" className="flex gap-[3px]">
    {Array.from({ length: total }, (_, i) => (
      <span key={i} className={`h-2 w-2.5 transition-colors duration-500 ${i < done ? "bg-accent" : "bg-line"}`} />
    ))}
  </span>
);

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="kbd">{children}</span>;

/* -------------------------------------------------------------------------- */
/* Controls + progress panel (bottom right)                                    */
/* -------------------------------------------------------------------------- */

const ExplorePanel: React.FC<{ open: boolean; setOpen: (v: boolean) => void; caseTotal: number }> = ({ open, setOpen, caseTotal }) => {
  const s = useExplore();
  const shortcut = useShortcutLabel();
  const transition = useEase();
  const total = navSections.length + caseTotal + TROPHIES.length;
  const done = s.sections.length + Math.min(s.cases.length, caseTotal) + s.trophies.length;

  return (
    <div className="no-print fixed bottom-4 right-4 z-40 hidden w-[17.5rem] lg:block">
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="explore-panel"
            key="panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={transition}
            className="mb-2 border border-line bg-surface/95 font-mono text-label backdrop-blur"
          >
            <dl className="space-y-2 border-b border-line px-4 py-3">
              {[
                { label: "Sections", n: s.sections.length, of: navSections.length },
                { label: "Case studies", n: Math.min(s.cases.length, caseTotal), of: caseTotal },
                { label: "Trophies", n: s.trophies.length, of: TROPHIES.length },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <dt className="uppercase tracking-[0.05em] text-muted">{row.label}</dt>
                  <dd className="flex items-center gap-2.5 tabular-nums text-ink">
                    <Cells done={row.n} total={row.of} />
                    {pad(row.n)} / {pad(row.of)}
                  </dd>
                </div>
              ))}
            </dl>

            <ul aria-label="Trophies" className="space-y-1 border-b border-line px-4 py-3">
              {TROPHIES.map((t) => {
                const got = s.trophies.includes(t.id);
                return (
                  <li key={t.id} className="flex items-baseline justify-between gap-3">
                    <span className={got ? "text-ink" : "text-faint"}>
                      <span aria-hidden="true" className={got ? "text-accent" : ""}>
                        {got ? "[x]" : "[ ]"}
                      </span>{" "}
                      {got ? t.label : t.hint}
                      <span className="sr-only">{got ? ", unlocked" : `, locked: ${t.label}`}</span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="border-b border-line px-4 py-3">
              <p className="mb-2 uppercase tracking-[0.05em] text-muted">Controls</p>
              <ul className={`space-y-1.5 ${s.shortcuts ? "text-ink" : "text-faint"}`}>
                <li className="flex items-center justify-between gap-2">
                  <span>
                    <Key>J</Key> <Key>K</Key>
                  </span>
                  next / previous section
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span>
                    <Key>1</Key>–<Key>5</Key>
                  </span>
                  jump to a section
                </li>
                <li className="flex items-center justify-between gap-2">
                  <Key>M</Key>
                  page map
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span>
                    <Key>/</Key> <Key>{shortcut}</Key>
                  </span>
                  command menu
                </li>
                <li className="flex items-center justify-between gap-2">
                  <Key>?</Key>
                  this panel
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <button
                type="button"
                role="switch"
                aria-checked={s.shortcuts}
                onClick={() => explore.setShortcuts(!s.shortcuts)}
                className="flex items-center gap-2 uppercase tracking-[0.05em] text-muted transition-colors hover:text-ink"
              >
                <span
                  aria-hidden="true"
                  className={`relative inline-block h-3.5 w-7 border transition-colors ${s.shortcuts ? "border-accent" : "border-faint"}`}
                >
                  <span
                    className={`absolute top-[2px] h-2 w-2.5 transition-[left,background-color] duration-300 ${
                      s.shortcuts ? "left-[14px] bg-accent" : "left-[2px] bg-faint"
                    }`}
                  />
                </span>
                Single-key shortcuts
              </button>
              <button
                type="button"
                onClick={() => explore.reset()}
                className="uppercase tracking-[0.05em] text-faint transition-colors hover:text-ink"
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="explore-panel"
        className={`flex w-full items-center justify-between gap-3 border px-4 py-2.5 font-mono text-label uppercase tracking-[0.05em] transition-colors ${
          open ? "border-ink bg-ink text-canvas" : "border-line bg-surface/95 text-ink backdrop-blur hover:border-ink"
        }`}
      >
        <span>
          <span className={open ? "text-canvas/60" : "text-accent"}>/</span> Explore
        </span>
        <span className="flex items-center gap-2 tabular-nums">
          <span className={open ? "text-canvas/70" : "text-muted"}>
            {pad(done)} / {pad(total)}
          </span>
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </span>
      </button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Page map (M)                                                                */
/* -------------------------------------------------------------------------- */

interface Block {
  id: string;
  label: string;
  index: string | null;
  top: number;
  height: number;
}

const measureBlocks = (): { blocks: Block[]; total: number } => {
  const total = document.documentElement.scrollHeight;
  const els = Array.from(document.querySelectorAll<HTMLElement>("main section[id]")).filter(
    (el) => !el.parentElement?.closest("section[id]"),
  );
  const blocks = els.map((el) => {
    const nav = navSections.findIndex((n) => n.id === el.id);
    const labelledBy = el.getAttribute("aria-labelledby");
    const heading = labelledBy ? document.getElementById(labelledBy)?.textContent?.trim() : null;
    const label = el.id === "hero" ? "Intro" : nav >= 0 ? navSections[nav].label : heading || el.id;
    const r = el.getBoundingClientRect();
    return {
      id: el.id,
      label: label.length > 20 ? `${label.slice(0, 19)}…` : label,
      index: nav >= 0 ? pad(nav + 1) : null,
      top: r.top + window.scrollY,
      height: r.height,
    };
  });
  return { blocks, total };
};

const Minimap: React.FC<{ open: boolean; onClose: () => void; isHome: boolean }> = ({ open, onClose, isHome }) => {
  const [{ blocks, total }, setLayout] = useState<{ blocks: Block[]; total: number }>({ blocks: [], total: 1 });
  const [view, setView] = useState({ y: 0, h: 0, pct: 0 });
  const transition = useEase();
  const H = 360;

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => setLayout(measureBlocks());
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        setView({ y: window.scrollY, h: window.innerHeight, pct: Math.round((window.scrollY / max) * 100) });
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const scale = H / Math.max(1, total);
  const center = view.y + view.h / 2;
  const jump = (b: Block) => {
    if (isHome && navSections.some((n) => n.id === b.id)) goToSection(b.id, true);
    else scrollToY(b.top - 80);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          aria-label="Page map"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={transition}
          className="no-print fixed right-4 top-24 z-40 hidden w-[12.5rem] border border-line bg-surface/95 font-mono text-label backdrop-blur lg:block"
        >
          <div className="flex items-center justify-between border-b border-line px-3 py-2 uppercase tracking-[0.05em]">
            <span className="text-ink">Page map</span>
            <button type="button" onClick={onClose} className="text-muted transition-colors hover:text-ink" aria-label="Close page map">
              <span className="kbd">M</span>
            </button>
          </div>
          <div className="relative mx-3 my-3" style={{ height: H }}>
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-line" />
            <ol className="contents">
              {blocks.map((b) => {
                const active = center >= b.top && center < b.top + b.height;
                const h = Math.max(3, b.height * scale - 2);
                return (
                  <li key={b.id} className="absolute inset-x-0" style={{ top: b.top * scale, height: h }}>
                    <button
                      type="button"
                      onClick={() => jump(b)}
                      className={`group flex h-full w-full items-start gap-2 border pl-2 pr-1.5 text-left transition-colors ${
                        active ? "border-ink bg-ink text-canvas" : "border-line text-muted hover:border-faint hover:text-ink"
                      }`}
                    >
                      {h >= 16 && (
                        <span className="flex w-full items-baseline justify-between gap-2 pt-0.5 leading-tight">
                          <span className="truncate">{b.label}</span>
                          {b.index && <span className={`tabular-nums ${active ? "text-canvas/60" : "text-faint"}`}>{b.index}</span>}
                        </span>
                      )}
                      {h < 16 && <span className="sr-only">{b.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ol>
            {/* viewport */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-1.5 -right-1.5 border border-accent"
              style={{ top: view.y * scale, height: Math.max(6, view.h * scale) }}
            />
          </div>
          <div className="flex items-center justify-between border-t border-line px-3 py-2 uppercase tracking-[0.05em] text-muted">
            <span>{pad(blocks.length)} blocks</span>
            <span className="tabular-nums">{String(view.pct).padStart(3, "0")}%</span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

/* -------------------------------------------------------------------------- */
/* First-visit tour                                                            */
/* -------------------------------------------------------------------------- */

const Tour: React.FC<{ isHome: boolean; onOpenPanel: () => void }> = ({ isHome, onOpenPanel }) => {
  const s = useExplore();
  const shortcut = useShortcutLabel();
  const transition = useEase();
  const [eligible, setEligible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    <>
      This site is built to be driven from the keyboard. Press <Key>/</Key> or <Key>{shortcut}</Key> for the command menu.
    </>,
    <>
      <Key>J</Key> and <Key>K</Key> move between sections, <Key>1</Key>–<Key>5</Key> jump straight to one and <Key>M</Key> opens a map
      of the page.
    </>,
    <>
      Progress is tracked bottom right: sections visited, case studies read and a few trophies. Press <Key>?</Key> for every
      control.
    </>,
  ];

  useEffect(() => {
    const ok = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
    setEligible(ok);
    const onRestart = () => {
      setStep(0);
      setVisible(true);
    };
    window.addEventListener("tour:restart", onRestart);
    return () => window.removeEventListener("tour:restart", onRestart);
  }, []);

  useEffect(() => {
    if (!eligible || !isHome || s.tourDone) return;
    const t = window.setTimeout(() => setVisible(true), 1800);
    return () => window.clearTimeout(t);
  }, [eligible, isHome, s.tourDone]);

  const finish = useCallback(() => {
    setVisible(false);
    explore.finishTour();
  }, []);

  const next = useCallback(() => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      finish();
      onOpenPanel();
    }
  }, [step, steps.length, finish, onOpenPanel]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('[aria-modal="true"]')) return;
      if (e.key === "Escape") finish();
      else if (e.key === "Enter" && (document.activeElement === document.body || !document.activeElement)) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, next, finish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="tour-title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={transition}
          className="no-print fixed bottom-4 left-16 z-40 hidden w-[24rem] border border-line bg-surface/95 backdrop-blur lg:block xl:left-20"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2 font-mono text-label uppercase tracking-[0.05em]">
            <p id="tour-title" className="text-ink">
              <span className="text-accent">/</span> Quick tour
            </p>
            <p className="tabular-nums text-muted">
              {pad(step + 1)} / {pad(steps.length)}
            </p>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={step}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={transition}
              className="min-h-[5.25rem] px-4 py-3.5 text-[0.95rem] leading-relaxed text-ink"
            >
              {steps[step]}
            </motion.p>
          </AnimatePresence>
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2 font-mono text-label uppercase tracking-[0.05em]">
            <button type="button" onClick={finish} className="text-muted transition-colors hover:text-ink">
              <span className="kbd">esc</span> skip
            </button>
            <button type="button" onClick={next} className="flex items-center gap-2 text-ink transition-colors hover:text-accent">
              {step < steps.length - 1 ? "next" : "done"} <span className="kbd">↵</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* -------------------------------------------------------------------------- */
/* Root: keyboard controls + the three surfaces                               */
/* -------------------------------------------------------------------------- */

/** Index of the last home section whose top has passed the nav bar, or -1 above the first. */
const currentSectionIndex = () => {
  let current = -1;
  navSections.forEach((s, i) => {
    const el = document.getElementById(s.id);
    if (el && el.getBoundingClientRect().top <= 140) current = i;
  });
  return current;
};

export const Explore: React.FC<{ isHome: boolean }> = ({ isHome }) => {
  const data = useStaticQuery<{ projects: { nodes: Array<{ caseStudy: { problem: string[] | null } | null }> } }>(graphql`
    query ExploreCases {
      projects: allProjectYaml(filter: { tier: { eq: "featured" } }) {
        nodes {
          caseStudy {
            problem
          }
        }
      }
    }
  `);
  const caseTotal = data.projects.nodes.filter((p) => p.caseStudy?.problem?.length).length;
  const [panel, setPanel] = useState(false);
  const [map, setMap] = useState(false);
  const active = useActiveSection(isHome);
  const mapRef = useRef(map);
  mapRef.current = map;

  useEffect(() => {
    if (active) explore.markSection(active);
  }, [active]);

  useEffect(() => {
    if (map) explore.unlock("map");
  }, [map]);

  useEffect(() => {
    const onPanel = () => setPanel((v) => !v);
    const onMap = () => setMap((v) => !v);
    window.addEventListener("explore:panel", onPanel);
    window.addEventListener("explore:map", onMap);
    return () => {
      window.removeEventListener("explore:panel", onPanel);
      window.removeEventListener("explore:map", onMap);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (isTyping(document.activeElement)) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      if (e.key === "Escape") {
        setMap(false);
        setPanel(false);
        return;
      }
      if (!explore.get().shortcuts) return;
      const k = e.key.toLowerCase();
      if ((k === "j" || k === "k") && isHome) {
        e.preventDefault();
        const i = currentSectionIndex() + (k === "j" ? 1 : -1);
        if (i < 0) scrollToY(0);
        else if (i < navSections.length) goToSection(navSections[i].id, true);
        explore.unlock("keys");
      } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= navSections.length) {
        e.preventDefault();
        goToSection(navSections[Number(e.key) - 1].id, isHome);
        explore.unlock("keys");
      } else if (k === "m") {
        e.preventDefault();
        setMap(!mapRef.current);
      } else if (e.key === "?") {
        e.preventDefault();
        setPanel((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isHome]);

  return (
    <>
      <Minimap open={map} onClose={() => setMap(false)} isHome={isHome} />
      <ExplorePanel open={panel} setOpen={setPanel} caseTotal={caseTotal} />
      <Tour isHome={isHome} onOpenPanel={() => setPanel(true)} />
    </>
  );
};
