import { navigate } from "gatsby";

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll to a home-page section, or navigate home first when on another page.
 * Shared by the command menu, keyboard controls and the minimap.
 */
export const goToSection = (id: string, isHome: boolean) => {
  if (!isHome) {
    navigate(`/#${id}`);
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
};

/** Scroll the window to a y position, respecting reduced motion. */
export const scrollToY = (top: number) =>
  window.scrollTo({ top: Math.max(0, top), behavior: prefersReduced() ? "auto" : "smooth" });

export const isTyping = (el: Element | null) =>
  !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || (el as HTMLElement).isContentEditable);
