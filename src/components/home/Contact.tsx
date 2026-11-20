import React, { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { FiCheck, FiCopy } from "react-icons/fi";
import { ProfileType } from "../../@types/about";
import { Reveal } from "../ui/Reveal";
import { ArrowLink } from "../ui/ArrowLink";
import { ScrambleText, Typer } from "../motion";

interface ContactProps {
  profile: ProfileType;
  linkedin: string | null;
  github: string | null;
}

export const Contact: React.FC<ContactProps> = ({ profile, linkedin, github }) => {
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end end"] });
  const nameY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [140, 0]);
  const nameOpacity = useTransform(scrollYProgress, [0.35, 1], reduce ? [1, 1] : [0, 1]);

  const copy = async () => {
    if (!profile.email) return;
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-title"
      className="relative mt-16 scroll-mt-20 overflow-hidden border-t border-line md:mt-20"
    >
      <div
        aria-hidden="true"
        className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:linear-gradient(to_top,black,transparent_70%)]"
      />
      <div className="container-site relative pb-10 pt-24 md:pt-36">
        <Reveal>
          <p className="eyebrow flex items-center gap-2">
            <span className="tag">
              <ScrambleText text="05" className="text-accent" />
            </span>
            <ScrambleText text="Contact" delay={120} />
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            id="contact-title"
            className="display mt-8 max-w-6xl text-[2.5rem] text-ink sm:text-7xl lg:text-[6.4rem]"
          >
            Let's build <Typer words={["the whole system.", "the interface.", "the API.", "the data layer.", "the pipeline."]} />
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-prose text-lg leading-relaxed text-muted">
            I'm interested in full-stack, backend and product engineering roles, and in contract work on SaaS and
            AI-powered products. The fastest way to reach me is email.
          </p>
        </Reveal>

        {profile.email && (
          <Reveal delay={0.15} className="mt-12 flex max-w-3xl flex-col border border-line sm:flex-row sm:items-stretch">
            <span aria-hidden="true" className="flex items-center border-b border-line bg-ink px-4 py-3 font-mono text-meta uppercase tracking-[0.06em] text-canvas sm:border-b-0 sm:border-r">
              mailto://
            </span>
            <a
              href={`mailto:${profile.email}`}
              className="group flex flex-1 items-center px-4 py-4 font-mono text-lg text-ink transition-colors hover:text-accent sm:text-2xl"
            >
              <span className="break-all">{profile.email}</span>
            </a>
            <button
              type="button"
              onClick={copy}
              className="flex items-center justify-center gap-2 border-t border-line px-5 py-3 font-mono text-meta uppercase tracking-[0.06em] text-muted transition-colors hover:bg-ink hover:text-canvas sm:border-l sm:border-t-0"
            >
              {copied ? <FiCheck aria-hidden="true" className="h-3.5 w-3.5 text-accent" /> : <FiCopy aria-hidden="true" className="h-3.5 w-3.5" />}
              <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
            </button>
          </Reveal>
        )}

        <Reveal delay={0.2} className="mt-14 flex flex-wrap gap-3">
          {linkedin && (
            <ArrowLink to={linkedin} variant="ghost">
              LinkedIn
            </ArrowLink>
          )}
          {github && (
            <ArrowLink to={github} variant="ghost">
              GitHub
            </ArrowLink>
          )}
          <ArrowLink to="/resume/" variant="primary">
            View résumé
          </ArrowLink>
        </Reveal>

        <motion.p
          aria-hidden="true"
          style={{ y: nameY, opacity: nameOpacity }}
          className="display no-print pointer-events-none mt-24 select-none whitespace-nowrap text-[12.5vw] text-ink/[0.13] md:mt-32 xl:text-[10.5rem]"
        >
          {profile.fname} {profile.lname}
        </motion.p>
      </div>
    </section>
  );
};
