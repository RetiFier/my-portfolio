import React from "react";
import { motion } from "framer-motion";
import { ArchitectureLayer } from "../../@types/project";
import { EASE, inView } from "../../utils/animations";

/**
 * Layered architecture diagram generated from a case study's `architecture`
 * data, so diagrams stay in sync with the written content.
 */
export const ArchitectureDiagram: React.FC<{ layers: ArchitectureLayer[]; title: string }> = ({ layers, title }) => (
  <figure aria-label={`${title} architecture, from top to bottom`} className="border border-line bg-surface/60 p-4 sm:p-8">
    <ol className="relative">
      {layers.map((layer, i) => (
        <motion.li
          key={layer.label}
          className="relative grid gap-4 pb-8 last:pb-0 md:grid-cols-12 md:gap-6"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
        >
          {i < layers.length - 1 && (
            <span aria-hidden="true" className="absolute bottom-0 left-[11px] top-7 w-px bg-line md:left-[11px]" />
          )}
          <div className="flex items-start gap-4 md:col-span-4">
            <span className="relative z-10 mt-1 flex h-[23px] w-[23px] shrink-0 items-center justify-center border border-faint bg-canvas font-mono text-label text-muted">
              {i + 1}
            </span>
            <div>
              <p className="font-display text-lg font-[760] [font-stretch:104%] uppercase tracking-[-0.01em] text-ink">{layer.label}</p>
              {layer.detail && <p className="mt-1 text-sm leading-relaxed text-muted">{layer.detail}</p>}
            </div>
          </div>
          <ul className="grid gap-2 pl-[39px] sm:grid-cols-3 md:col-span-8 md:pl-0">
            {layer.nodes?.map((node) => (
              <li
                key={node}
                className="border border-line bg-canvas/70 px-3.5 py-3 font-mono text-meta leading-snug text-ink/85 transition-colors hover:border-accent"
              >
                {node}
              </li>
            ))}
          </ul>
        </motion.li>
      ))}
    </ol>
  </figure>
);
