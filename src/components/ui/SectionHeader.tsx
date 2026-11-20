import React from "react";
import { motion } from "framer-motion";
import { drawX, fadeIn, fadeUp, inView, stagger } from "../../utils/animations";
import { ScrambleText, SplitText } from "../motion";

interface SectionHeaderProps {
  index: string;
  eyebrow: string;
  /** Plain text so it can be split per character. */
  title: string;
  /** Small mono annotation set after the title. */
  note?: React.ReactNode;
  lead?: React.ReactNode;
  id?: string;
}

/**
 * Section opener: the rule draws in, the index decodes, the heavy title rises
 * character by character and the mono note and lead follow.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ index, eyebrow, title, note, lead, id }) => (
  <motion.header
    className="relative mb-12 grid gap-6 pt-5 md:mb-16 md:grid-cols-12"
    initial="hidden"
    whileInView="visible"
    viewport={inView}
    variants={stagger(0.12)}
  >
    <motion.span aria-hidden="true" variants={drawX} className="absolute inset-x-0 top-0 h-px origin-left bg-line" />
    <motion.p variants={fadeUp} className="eyebrow flex items-center gap-2 md:col-span-3">
      <span className="tag">
        <ScrambleText text={index} className="text-accent" />
      </span>
      <ScrambleText text={eyebrow} delay={120} />
    </motion.p>
    <div className="md:col-span-9">
      <h2 id={id} className="display text-[2.2rem] text-ink sm:text-6xl md:text-5xl lg:text-[4.4rem] xl:text-[5.2rem]">
        <SplitText text={title} />
        {note && (
          <>
            {" "}
            <motion.span variants={fadeIn} className="annot">
              {note}
            </motion.span>
          </>
        )}
      </h2>
      {lead && (
        <motion.p variants={fadeUp} className="mt-7 max-w-prose text-lg leading-relaxed text-muted">
          {lead}
        </motion.p>
      )}
    </div>
  </motion.header>
);
