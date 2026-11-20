import React from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { ProjectType } from "../../@types/project";
import { Reveal } from "../ui/Reveal";
import { TechList } from "../ui/TechList";

const primaryLink = (p: ProjectType) => p.url || p.repo || null;
const linkLabel = (p: ProjectType) => (p.url ? "Live site" : "Source");

const SelectedCard: React.FC<{ project: ProjectType; delay: number }> = ({ project, delay }) => {
  const href = primaryLink(project);
  return (
    <Reveal delay={delay} className="h-full">
    <article className="brackets group relative flex h-full flex-col border border-line bg-surface/40 p-7 transition-colors duration-300 hover:border-faint hover:bg-surface">
      <div className="flex items-center justify-between font-mono text-meta text-muted">
        <span>{project.category}</span>
        <span>{project.period}</span>
      </div>
      <h3 className="display mt-8 text-3xl text-ink">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0">
            {project.name}
            <span className="sr-only"> ({linkLabel(project)}, opens in a new tab)</span>
          </a>
        ) : (
          project.name
        )}
      </h3>
      {project.tagline && <p className="mt-2 text-ink/85">{project.tagline}</p>}
      {project.summary && <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{project.summary}</p>}
      <div className="mt-auto pt-7">
        <TechList items={project.technologies} />
        {href && (
          <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-ink/90 transition-colors group-hover:text-accent">
            {linkLabel(project)}
            <FiArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </p>
        )}
      </div>
    </article>
    </Reveal>
  );
};

export const MoreProjects: React.FC<{ selected: ProjectType[]; archive: ProjectType[]; github: string | null }> = ({
  selected,
  archive,
  github,
}) => (
  <section aria-labelledby="more-work-title" className="container-site pt-24 md:pt-32">
    <Reveal className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-6">
      <h2 id="more-work-title" className="eyebrow">
        More projects
      </h2>
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="tap link-underline inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          All repositories on GitHub <FiArrowUpRight aria-hidden="true" className="h-4 w-4" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </Reveal>

    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {selected.map((p, i) => (
        <SelectedCard key={p.slug} project={p} delay={i * 0.06} />
      ))}
    </div>

    {archive.length > 0 && (
      <div className="mt-16">
        <Reveal>
          <h3 className="eyebrow">Archive</h3>
        </Reveal>
        <ul className="mt-4">
          {archive.map((p) => {
            const href = primaryLink(p);
            return (
              <Reveal as="li" key={p.slug} className="border-t border-line last:border-b">
                <a
                  href={href ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative isolate grid gap-2 py-5 transition-colors md:grid-cols-12 md:items-baseline md:gap-6"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 -left-4 -right-4 -z-10 origin-left scale-x-0 bg-surface transition-transform duration-500 ease-editorial group-hover:scale-x-100"
                  />
                  <span className="font-mono text-small text-faint md:col-span-1">{p.year}</span>
                  <span className="flex items-center gap-1.5 font-display text-xl font-semibold tracking-[-0.02em] text-ink transition-[color,transform] duration-500 ease-editorial group-hover:translate-x-2 group-hover:text-accent md:col-span-3">
                    {p.name}
                    <FiArrowUpRight aria-hidden="true" className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="text-[0.95rem] leading-relaxed text-muted md:col-span-5">{p.tagline}</span>
                  <span className="font-mono text-meta text-faint md:col-span-3 md:text-right">
                    {p.technologies?.join(" / ")}
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Reveal>
            );
          })}
        </ul>
      </div>
    )}
  </section>
);
