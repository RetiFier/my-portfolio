import { useEffect, useState } from "react";
import { navSections } from "../theme/navSections";

/**
 * Id of the home-page section the reader is in: the last section whose top
 * has passed the middle of the viewport (null above the first one). Computed
 * from positions on scroll rather than intersection events, so blocks between
 * sections (dividers, the Recovery demo) and anchor jumps that skip sections
 * never leave a stale section highlighted.
 */
export const useActiveSection = (enabled: boolean) => {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const check = () => {
      const line = window.innerHeight * 0.5;
      let current: string | null = null;
      for (const s of navSections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      // At the very bottom the last (short) section may never reach the line.
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atEnd && navSections.length) current = navSections[navSections.length - 1].id;
      setActive(current);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);

  return active;
};
