import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/** Thin reading-progress bar pinned to the top edge. */
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      className="no-print fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent xl:hidden"
      style={{ scaleX }}
    />
  );
};
