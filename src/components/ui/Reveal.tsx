import React from "react";
import { motion } from "framer-motion";
import { fadeUp, inView } from "../../utils/animations";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section" | "article" | "header";
}

/** Fades content up once when it scrolls into view. */
export const Reveal: React.FC<RevealProps> = ({ children, className, delay = 0, as = "div" }) => {
  const Component = motion[as];
  return (
    <Component
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
};
