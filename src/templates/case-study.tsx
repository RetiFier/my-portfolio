import React, { useEffect } from "react";
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Layout } from "../components/Layout";
import { Seo } from "../components/Seo";
import { Reveal } from "../components/ui/Reveal";
import { TechList } from "../components/ui/TechList";
import { ArrowLink } from "../components/ui/ArrowLink";
import { ScrambleText, SplitText } from "../components/motion";
import { BrowserFrame } from "../components/visuals/BrowserFrame";
import { DecisionTrace } from "../components/visuals/DecisionTrace";
import { ArchitectureDiagram } from "../components/visuals/ArchitectureDiagram";
import { CaseStudy, ProjectType } from "../@types/project";
import { explore } from "../hooks/useExplore";

type CaseStudyProject = Omit<ProjectType, "caseStudy"> & { caseStudy: CaseStudy };

interface CaseStudyData {
  project: CaseStudyProject;
  next: { slug: string; name: string; tagline: string | null } | null;
}

const sections = [
  { id: "problem", label: "Problem" },
  { id: "approach", label: "Approach" },
  { id: "architecture", label: "Architecture" },
  { id: "decisions", label: "Key decisions" },
  { id: "tradeoffs", label: "Tradeoffs" },
  { id: "outcomes", label: "Outcomes" },
];

const Block: React.FC<{ id: string; index: number; title: string; children: React.ReactNode }> = ({
  id,
  index,
  title,
  children,
}) => (
  <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 border-t border-line pb-16 pt-8 md:pb-20">
    <Reveal>
      <p className="tag">
        <ScrambleText text={String(index).padStart(2, "0")} className="text-accent" />
      </p>
      <h2 id={`${id}-title`} className="display mt-4 text-4xl text-ink sm:text-5xl">
        {title}
      </h2>
    </Reveal>
    <div className="mt-8">{children}</div>
  </section>
);

const Paragraphs: React.FC<{ items?: string[] | null }> = ({ items }) => (
  <div className="max-w-prose space-y-5">
    {items?.map((p, i) => (
      <Reveal key={i} delay={i * 0.05}>
        <p className="text-lg leading-relaxed text-muted">{p}</p>
      </Reveal>
    ))}
  </div>
);

const CaseStudyPage: React.FC<PageProps<CaseStudyData>> = ({ data, location }) => {
  // Counts toward the visitor's exploration progress (stored in their browser only).
  useEffect(() => {
    explore.markCase(data.project.slug);
  }, [data.project.slug]);
  const { project, next } = data;
  const cs = project.caseStudy;

  const meta = [
    { label: "Role", value: project.role },
    { label: "Period", value: project.period },
    { label: "Status", value: project.status },
    { label: "Type", value: project.category },
  ].filter((m) => m.value);

  const visual = project.image?.childImageSharp ? (
    <BrowserFrame image={project.image} url={project.url} alt={`The ${project.name} homepage`} />
  ) : project.slug === "synthetic-instinct" ? (
    <div className="mx-auto max-w-4xl">
      <DecisionTrace />
    </div>
  ) : null;

  const present = sections.filter((s) => {
    const value = cs[s.id as keyof CaseStudy];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });

  return (
    <Layout pathname={location.pathname}>
      <article>
        <header className="container-site pt-28 md:pt-36">
          <div className="rise">
            <Link
              to="/#work"
              className="inline-flex items-center gap-2 font-mono text-small text-muted transition-colors hover:text-ink"
            >
              <FiArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> All work
            </Link>
          </div>
          <p className="rise eyebrow mt-10" style={{ animationDelay: "60ms" }}>
            Case study <span className="text-faint">/</span> {project.category}
          </p>
          <h1 className="display mt-4 text-[11vw] text-ink sm:text-[10vw] lg:text-[8rem] xl:text-[9rem]">
            <SplitText text={project.name} mode="css" delay={0.1} stagger={0.03} />
          </h1>
          {project.tagline && (
            <p className="rise mt-6 max-w-3xl text-2xl leading-snug tracking-[-0.01em] text-muted sm:text-3xl" style={{ animationDelay: "200ms" }}>
              {project.tagline}
            </p>
          )}

          <dl className="rise mt-12 grid grid-cols-2 border-t border-line md:grid-cols-4" style={{ animationDelay: "280ms" }}>
            {meta.map((m, i) => (
              <div key={m.label} className={`py-5 pr-4 ${i % 2 === 1 ? "border-l border-line pl-4" : ""} ${i > 1 ? "border-t border-line md:border-t-0" : ""} ${i === 2 ? "md:border-l md:pl-4" : ""}`}>
                <dt className="eyebrow">{m.label}</dt>
                <dd className="mt-2 text-[0.95rem] text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>

          <div className="rise mt-6 flex flex-wrap gap-3" style={{ animationDelay: "340ms" }}>
            {project.url && (
              <ArrowLink to={project.url} variant="primary">
                Visit {project.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </ArrowLink>
            )}
            {project.repo && (
              <ArrowLink to={project.repo} variant="ghost">
                Source code
              </ArrowLink>
            )}
          </div>
        </header>

        {visual && (
          <div className="container-site mt-16 md:mt-20">
            <Reveal>{visual}</Reveal>
          </div>
        )}

        <div className="container-site mt-20 grid gap-12 md:mt-28 lg:grid-cols-12">
          <aside className="no-print hidden lg:col-span-3 lg:block">
            <nav aria-label="Case study sections" className="sticky top-28">
              <p className="eyebrow">Contents</p>
              <ol className="mt-4 space-y-2 border-l border-line">
                {present.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-1 pl-4 text-sm text-muted transition-colors hover:border-accent hover:text-ink">
                      <span className="mr-2 font-mono text-label text-faint">{String(i + 1).padStart(2, "0")}</span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ol>
              <div className="mt-10">
                <p className="eyebrow">Stack</p>
                <TechList items={project.technologies} className="mt-4" />
              </div>
            </nav>
          </aside>

          <div className="lg:col-span-9">
            {present.map((s, i) => {
              const index = i + 1;
              switch (s.id) {
                case "problem":
                  return (
                    <Block key={s.id} id={s.id} index={index} title="The problem">
                      <Paragraphs items={cs.problem} />
                    </Block>
                  );
                case "approach":
                  return (
                    <Block key={s.id} id={s.id} index={index} title="Approach">
                      <Paragraphs items={cs.approach} />
                    </Block>
                  );
                case "architecture":
                  return (
                    <Block key={s.id} id={s.id} index={index} title="Architecture">
                      <ArchitectureDiagram layers={cs.architecture ?? []} title={project.name} />
                    </Block>
                  );
                case "decisions":
                  return (
                    <Block key={s.id} id={s.id} index={index} title="Key decisions">
                      <ol className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
                        {cs.decisions?.map((d, di) => (
                          <Reveal
                            as="li"
                            key={d.title}
                            delay={di * 0.05}
                            className="bg-canvas p-6 transition-colors hover:bg-surface sm:p-7 md:[&:last-child:nth-child(odd)]:col-span-2"
                          >
                            <span className="tag">D{String(di + 1).padStart(2, "0")}</span>
                            <h3 className="mt-4 font-display text-lg font-semibold uppercase tracking-[-0.01em] text-ink">{d.title}</h3>
                            <p className="mt-3 leading-relaxed text-muted">{d.detail}</p>
                          </Reveal>
                        ))}
                      </ol>
                    </Block>
                  );
                case "tradeoffs":
                  return (
                    <Block key={s.id} id={s.id} index={index} title="Tradeoffs">
                      <ul className="max-w-prose space-y-4">
                        {cs.tradeoffs?.map((t) => (
                          <Reveal as="li" key={t} className="flex gap-4 text-lg leading-relaxed text-muted">
                            <span aria-hidden="true" className="mt-[0.4em] font-mono text-sm text-accent">⇄</span>
                            {t}
                          </Reveal>
                        ))}
                      </ul>
                    </Block>
                  );
                case "outcomes":
                  return (
                    <Block key={s.id} id={s.id} index={index} title="Where it stands">
                      <ul className="max-w-prose space-y-4">
                        {cs.outcomes?.map((o) => (
                          <Reveal as="li" key={o} className="flex gap-4 text-lg leading-relaxed text-ink/90">
                            <span aria-hidden="true" className="mt-[0.85em] h-px w-4 shrink-0 bg-accent" />
                            {o}
                          </Reveal>
                        ))}
                      </ul>
                      {cs.note && (
                        <p className="mt-10 max-w-prose border border-line border-l-accent bg-surface/60 p-5 text-sm leading-relaxed text-muted">
                          {cs.note}
                        </p>
                      )}
                    </Block>
                  );
                default:
                  return null;
              }
            })}

            <div className="border-t border-line pt-8 lg:hidden">
              <p className="eyebrow">Stack</p>
              <TechList items={project.technologies} className="mt-4" />
            </div>
          </div>
        </div>

        {next && next.slug !== project.slug && (
          <div className="container-site mt-16 md:mt-24">
            <Link
              to={`/work/${next.slug}/`}
              className="group block border-t border-line py-12 transition-colors md:py-16"
            >
              <p className="eyebrow">Next case study</p>
              <p className="display mt-4 flex items-center gap-4 text-5xl text-ink transition-colors group-hover:text-accent sm:text-7xl">
                {next.name}
                <FiArrowRight aria-hidden="true" className="h-8 w-8 transition-transform duration-500 group-hover:translate-x-2" />
              </p>
              {next.tagline && <p className="mt-3 text-muted">{next.tagline}</p>}
            </Link>
          </div>
        )}
      </article>
    </Layout>
  );
};

export default CaseStudyPage;

export const Head: HeadFC<CaseStudyData> = ({ data, location }) => (
  <Seo
    title={`${data.project.name} case study`}
    description={`${data.project.tagline ?? ""} Problem, architecture, key decisions and tradeoffs.`.trim()}
    pathname={location.pathname}
    type="article"
    breadcrumbs={[
      { name: "Work", path: "/#work" },
      { name: data.project.name, path: location.pathname },
    ]}
  />
);

export const query = graphql`
  query CaseStudy($slug: String!, $nextSlug: String!) {
    project: projectYaml(slug: { eq: $slug }) {
      slug
      tier
      order
      name
      tagline
      category
      status
      period
      year
      role
      url
      repo
      summary
      highlights
      technologies
      image {
        childImageSharp {
          gatsbyImageData(layout: CONSTRAINED, width: 1600, quality: 82, placeholder: BLURRED)
        }
      }
      caseStudy {
        problem
        approach
        architecture {
          label
          nodes
          detail
        }
        decisions {
          title
          detail
        }
        tradeoffs
        outcomes
        note
      }
    }
    next: projectYaml(slug: { eq: $nextSlug }) {
      slug
      name
      tagline
    }
  }
`;
