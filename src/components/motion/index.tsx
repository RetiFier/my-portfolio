import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { EASE, inView, stagger } from "../../utils/animations";

export { ScrambleText } from "./ScrambleText";
export { SystemField } from "./SystemField";
export { YearOdometer } from "./YearOdometer";

/* ------------------------------------------------------------------ */

interface CountUpProps {
  value: number;
  duration?: number;
  delay?: number;
  /** Skip the count if hydration happens later than this (ms since navigation), to avoid re-animating visible text. */
  maxStartMs?: number;
  pad?: number;
}

/** Counts up to `value` once in view. Server HTML renders the final number. */
export const CountUp: React.FC<CountUpProps> = ({ value, duration = 1.4, delay = 0, maxStartMs, pad = 0 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true });
  const [n, setN] = useState(value);
  const played = useRef(false);

  useEffect(() => {
    if (!seen || played.current || reduce) return;
    played.current = true;
    if (maxStartMs !== undefined && performance.now() > maxStartMs) return;
    setN(0);
    const controls = animate(0, value, {
      duration,
      delay,
      ease: [...EASE],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => {
      controls.stop();
      setN(value);
    };
  }, [seen, reduce, value, duration, delay, maxStartMs]);

  return (
    <span ref={ref} className="tabular-nums">
      {String(n).padStart(pad, "0")}
    </span>
  );
};

/* ------------------------------------------------------------------ */

const charRise = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 0.75, ease: EASE } },
};

interface SplitTextProps {
  text: string;
  className?: string;
  /** Seconds before the first character moves. */
  delay?: number;
  /**
   * "view": Framer Motion, plays when scrolled into view.
   * "css": pure CSS keyframes, for above-the-fold text that must render without JavaScript.
   */
  mode?: "view" | "css";
  stagger?: number;
}

/**
 * Display text that rises in one character at a time from behind a mask.
 * The plain string is the only text in the document (sr-only); the split
 * characters are aria-hidden glyphs drawn from data attributes.
 */
export const SplitText: React.FC<SplitTextProps> = ({ text, className = "", delay = 0, mode = "view", stagger: gap = 0.02 }) => {
  const words = text.split(" ");
  let index = 0;

  const renderWord = (word: string, wi: number) => (
    <React.Fragment key={wi}>
      <span className="-mb-[0.08em] inline-block overflow-hidden whitespace-nowrap pb-[0.08em] align-bottom">
        {[...word].map((ch, ci) => {
          const i = index++;
          return mode === "css" ? (
            <span
              key={ci}
              data-g={ch}
              className="glyph char-rise inline-block"
              style={{ animationDelay: `${(delay + i * gap) * 1000}ms` }}
            />
          ) : (
            <motion.span key={ci} data-g={ch} variants={charRise} className="glyph inline-block" />
          );
        })}
      </span>
      {wi < words.length - 1 ? " " : null}
    </React.Fragment>
  );

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {mode === "css" ? (
        <span aria-hidden="true">{words.map(renderWord)}</span>
      ) : (
        <motion.span aria-hidden="true" initial="hidden" whileInView="visible" viewport={inView} variants={stagger(gap, delay)}>
          {words.map(renderWord)}
        </motion.span>
      )}
    </span>
  );
};

/* ------------------------------------------------------------------ */

/** Types and deletes a list of phrases behind a block caret. Static first phrase for reduced motion and SSR. */
export const Typer: React.FC<{ words: string[]; className?: string }> = ({ words, className = "" }) => {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [n, setN] = useState(words[0]?.length ?? 0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce || words.length < 2) return;
    const word = words[i];
    let timer: number | undefined;
    if (!deleting && n === word.length) timer = window.setTimeout(() => setDeleting(true), 2400);
    else if (deleting && n === 0) {
      setDeleting(false);
      setI((i + 1) % words.length);
    } else timer = window.setTimeout(() => setN(n + (deleting ? -1 : 1)), deleting ? 32 : 68);
    return () => window.clearTimeout(timer);
  }, [n, deleting, i, reduce, words]);

  return (
    <span className={className}>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden="true">
        <span className="glyph whitespace-pre" data-g={words[i].slice(0, n)} />
        <span className="caret ml-[0.06em] inline-block h-[0.78em] w-[0.42em] translate-y-[0.04em] bg-accent" />
      </span>
    </span>
  );
};

/* ------------------------------------------------------------------ */

/**
 * Reveals a visual top to bottom like a scan: the clip opens while a hairline
 * sweeps down the frame. Always the same element on server and client.
 */
export const Wipe: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = "",
  delay = 0,
}) => (
  <motion.div
    className={`relative ${className}`}
    initial="hidden"
    whileInView="visible"
    viewport={inView}
  >
    <motion.div
      variants={{
        hidden: { clipPath: "inset(0% 0% 100% 0%)" },
        visible: {
          clipPath: "inset(0% 0% 0% 0%)",
          transition: { duration: 1.1, ease: EASE, delay },
          transitionEnd: { clipPath: "none" },
        },
      }}
    >
      {children}
    </motion.div>
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 h-px bg-accent"
      variants={{
        hidden: { top: "0%", opacity: 0 },
        visible: {
          top: ["0%", "100%"],
          opacity: [1, 1, 0],
          transition: { duration: 1.1, ease: EASE, delay },
        },
      }}
    />
  </motion.div>
);

/* ------------------------------------------------------------------ */

interface NextSectionProps {
  /** Label of the section just finished, e.g. "01 / Selected work". */
  from: string;
  /** Label of the next section, e.g. "02 / Experience". */
  to: string;
  href: string;
  className?: string;
}

/** Ruler-style hand-off between sections: ticks draw in and a segment runs toward the next section link. */
export const NextSection: React.FC<NextSectionProps> = ({ from, to, href, className = "" }) => (
  <motion.div
    className={`container-site ${className}`}
    initial="hidden"
    whileInView="visible"
    viewport={inView}
  >
    <div className="flex items-center justify-between gap-4 font-mono text-label uppercase tracking-[0.05em] text-faint">
      <span className="hidden sm:inline">end / {from}</span>
      <a
        href={href}
        className="tap group ml-auto inline-flex items-center gap-2 whitespace-nowrap text-muted transition-colors hover:text-accent"
      >
        next / {to}
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </a>
    </div>
    <div aria-hidden="true" className="relative mt-3 h-3">
      <motion.span
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-line"
        variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 1.2, ease: EASE } } }}
      />
      <motion.span
        className="absolute bottom-0 left-0 h-full w-full"
        style={{
          backgroundImage: "linear-gradient(to right, rgb(var(--c-line)) 1px, transparent 1px)",
          backgroundSize: "24px 100%",
        }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8, delay: 0.5 } } }}
      />
      <span className="ruler-run absolute bottom-0 left-0 h-[3px] w-10 bg-accent" />
    </div>
  </motion.div>
);

/* ------------------------------------------------------------------ */

/** Endless, decorative ticker. Hidden from assistive tech (the content is listed elsewhere). */
export const Marquee: React.FC<{ items: string[]; className?: string; duration?: number }> = ({
  items,
  className = "",
  duration = 70,
}) => {
  if (!items.length) return null;
  const row = (key: string) => (
    <ul key={key} className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap">
          <span className="px-5">{item}</span>
          <span className="text-faint">/</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div aria-hidden="true" className={`marquee no-print flex overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max" style={{ animationDuration: `${duration}s` }}>
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
};
