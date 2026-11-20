import React from "react";
import { motion } from "framer-motion";
import { ProfileType } from "../../@types/about";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";
import { fadeUp, inView, stagger } from "../../utils/animations";
import { ScrambleText } from "../motion";

export const About: React.FC<{ profile: ProfileType }> = ({ profile }) => {
  const [first, ...rest] = profile.about ?? [];

  return (
    <section id="about" aria-labelledby="about-title" className="container-site relative scroll-mt-20 pt-28 md:pt-40">
      <SectionHeader
        index="03"
        eyebrow="About"
        id="about-title"
        title="About"
        note="the whole system, not just the stack"
      />

      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-8 md:col-start-4">
          {first && (
            <Reveal>
              <p className="text-2xl font-normal leading-[1.4] tracking-[-0.01em] text-ink sm:text-[1.8rem]">{first}</p>
            </Reveal>
          )}
          <div className="mt-8 space-y-6 md:columns-2 md:gap-10 md:space-y-0">
            {rest.map((paragraph, i) => (
              <Reveal key={i} delay={0.05 * (i + 1)}>
                <p className="leading-relaxed text-muted md:mb-6 md:break-inside-avoid">{paragraph}</p>
              </Reveal>
            ))}
          </div>
          {profile.education?.length ? (
            <Reveal>
              <dl className="mt-10 grid gap-x-6 gap-y-1 border-t border-line pt-5 sm:grid-cols-[8rem_1fr]">
                <dt className="font-mono text-label uppercase tracking-[0.05em] text-muted">Education</dt>
                {profile.education.map((e) => (
                  <dd key={e.qualification} className="text-ink sm:col-start-2">
                    {e.qualification}
                    <span className="text-muted">, {e.institution}</span>
                  </dd>
                ))}
              </dl>
            </Reveal>
          ) : null}
        </div>
      </div>

      {profile.principles?.length ? (
        <div className="mt-20 md:mt-28">
          <Reveal>
            <p className="eyebrow">How I work</p>
          </Reveal>
          <motion.ol
            className="mt-6 grid border-t border-line sm:grid-cols-2 lg:grid-cols-4"
            variants={stagger(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
          >
            {profile.principles.map((p, i) => (
              <motion.li
                key={p.title}
                variants={fadeUp}
                className={`group relative border-b border-line py-8 sm:pr-6 lg:border-b-0 ${
                  i > 0 ? "lg:border-l lg:pl-6" : ""
                } ${i % 2 === 1 ? "sm:border-l sm:pl-6 lg:pl-6" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-px w-0 bg-accent transition-[width] duration-700 ease-editorial group-hover:w-full"
                />
                <ScrambleText text={String(i + 1).padStart(2, "0")} delay={i * 120} className="font-mono text-meta text-accent" />
                <h3 className="mt-4 font-display text-xl font-semibold uppercase tracking-[-0.01em] text-ink transition-transform duration-500 ease-editorial group-hover:translate-x-1">{p.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{p.text}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      ) : null}
    </section>
  );
};
