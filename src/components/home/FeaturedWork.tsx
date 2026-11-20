import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ProjectType } from "../../@types/project";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";
import { TechList } from "../ui/TechList";
import { ArrowLink } from "../ui/ArrowLink";
import { BrowserFrame } from "../visuals/BrowserFrame";
import { DecisionTrace } from "../visuals/DecisionTrace";
import { ScrambleText, Wipe } from "../motion";

const visualFor = (project: ProjectType) => {
  if (project.image?.childImageSharp) {
    return (
      <BrowserFrame
        image={project.image}
        url={project.url}
        alt={`The ${project.name} homepage, showing a chapter page with a Story Doctor continuity alert`}
      />
    );
  }
  if (project.slug === "synthetic-instinct") return <DecisionTrace />;
  return null;
};

const FeaturedProject: React.FC<{ project: ProjectType; index: number }> = ({ project, index }) => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [32, -32]);
  const flip = index % 2 === 1;
  const hasCaseStudy = Boolean(project.caseStudy);

  return (
    <article
      ref={ref}
      aria-labelledby={`project-${project.slug}`}
      className="grid items-center gap-10 border-t border-line py-14 md:py-20 lg:grid-cols-12 lg:gap-14"
    >
      <Reveal className={`lg:col-span-5 ${flip ? "lg:order-2 lg:col-start-8" : ""}`}>
        <div className="flex items-center gap-3 font-mono text-meta text-muted">
          <ScrambleText text={String(index + 1).padStart(2, "0")} className="text-accent" />
          <motion.span
            className="h-px w-8 origin-left bg-line"
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
          />
          <ScrambleText text={project.category ?? ""} delay={150} />
        </div>

        <h3 id={`project-${project.slug}`} className="display mt-6 text-[2.6rem] text-ink sm:text-5xl lg:text-[2.9rem] xl:text-6xl">
          {project.name}
        </h3>
        {project.tagline && <p className="mt-3 text-lg text-ink/90">{project.tagline}</p>}

        <div className="mt-5 flex flex-wrap gap-2 font-mono text-meta">
          {project.status && (
            <span className={`tag ${project.status.startsWith("Live") ? "border-accent/60 text-accent" : ""}`}>
              <span aria-hidden="true">/</span>
              {project.status}
            </span>
          )}
          {project.period && <span className="tag">{project.period}</span>}
        </div>

        {project.summary && <p className="mt-6 max-w-prose leading-relaxed text-muted">{project.summary}</p>}

        {project.highlights?.length ? (
          <div className="mt-8">
            <p className="eyebrow">Engineering focus</p>
            <ul className="mt-4 space-y-3">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-[0.95rem] leading-relaxed text-ink/90">
                  <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <TechList items={project.technologies} className="mt-8" />

        <div className="mt-9 flex flex-wrap items-center gap-3">
          {hasCaseStudy && (
            <ArrowLink to={`/work/${project.slug}/`} variant="primary">
              Read the case study
            </ArrowLink>
          )}
          {project.url && (
            <ArrowLink to={project.url} variant="ghost" ariaLabel={`Visit ${project.name}`}>
              Visit site
            </ArrowLink>
          )}
          {project.repo && (
            <ArrowLink to={project.repo} variant="ghost">
              Source
            </ArrowLink>
          )}
        </div>
      </Reveal>

      <motion.div style={{ y }} className={`lg:col-span-7 ${flip ? "lg:order-1 lg:col-start-1" : ""}`}>
        <Wipe delay={0.05}>
          {visualFor(project)}
        </Wipe>
      </motion.div>
    </article>
  );
};

export const FeaturedWork: React.FC<{ projects: ProjectType[] }> = ({ projects }) => (
  <section id="work" aria-labelledby="work-title" className="container-site scroll-mt-20 pt-28 md:pt-40">
    <SectionHeader
      index="01"
      eyebrow="Selected work"
      id="work-title"
      title="Selected work"
      note="built and run / every layer"
      lead="Two independent systems where I own every layer, from the data model to deployment. Each has a technical case study covering the problem, architecture, decisions and tradeoffs."
    />
    <div>
      {projects.map((p, i) => (
        <FeaturedProject key={p.slug} project={p} index={i} />
      ))}
    </div>
  </section>
);
