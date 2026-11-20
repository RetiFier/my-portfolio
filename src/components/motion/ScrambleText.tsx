import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface ScrambleTextProps {
  text: string;
  className?: string;
  /** Total decode time in ms. */
  duration?: number;
  delay?: number;
  /** "view" decodes when scrolled into view; "mount" decodes right after hydration. */
  trigger?: "view" | "mount";
}

/**
 * Decodes text from random glyphs, once. Intended for monospaced labels only.
 * Server HTML (and the first client render) is the final text, so nothing is
 * missing before JavaScript runs; screen readers get the real text only.
 */
export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  className,
  duration = 650,
  delay = 0,
  trigger = "view",
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const [display, setDisplay] = useState(text);
  const played = useRef(false);

  useEffect(() => {
    if (played.current || reduce) return;
    if (trigger === "view" && !inView) return;
    played.current = true;

    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const progress = Math.min(1, (t - start) / duration);
      const revealed = Math.floor(progress * text.length);
      setDisplay(
        text
          .split("")
          .map((ch, i) => (i < revealed || !/[a-z0-9]/i.test(ch) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join("")
      );
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      setDisplay(text);
    };
  }, [inView, reduce, text, trigger, duration, delay]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="glyph whitespace-pre" data-g={display} />
    </span>
  );
};
