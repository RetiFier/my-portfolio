import { Variants } from "framer-motion";

/**
 * Shared motion vocabulary. Movement is short (≤ 20px) and runs once;
 * Layout wraps everything in <MotionConfig reducedMotion="user">, so these
 * collapse to simple fades for visitors who prefer reduced motion.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

export const stagger = (staggerChildren = 0.07, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

/** Masked line reveal used for display headings. */
export const lineReveal: Variants = {
  hidden: { y: "105%" },
  visible: { y: "0%", transition: { duration: 0.8, ease: EASE } },
};

export const inView = { once: true, margin: "0px 0px -12% 0px" } as const;

/** Hairline that draws from left to right. */
export const drawX: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.1, ease: EASE } },
};

/** Display heading wiped in from the bottom edge; clip is removed afterwards so descenders never crop. */
export const clipUp: Variants = {
  hidden: { clipPath: "inset(0% 0% 100% 0%)", y: 36, opacity: 0 },
  visible: {
    clipPath: "inset(0% 0% 0% 0%)",
    y: 0,
    opacity: 1,
    transition: { duration: 1.05, ease: EASE },
    transitionEnd: { clipPath: "none" },
  },
};
