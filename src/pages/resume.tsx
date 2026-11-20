import React, { useCallback, useMemo } from "react";
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import { FiArrowLeft, FiCopy, FiDownload, FiPrinter } from "react-icons/fi";
import { Seo } from "../components/Seo";
import { CommandPalette } from "../components/CommandPalette";
import { Toaster, toast } from "../components/Toaster";
import { ProfileType, SocialType } from "../@types/about";
import { JobType } from "../@types/job";
import { ProjectType } from "../@types/project";
import { formatRange, roleDuration } from "../utils/dates";
import { useSiteData } from "../hooks/useSiteData";
import { RESUME_FILE, RESUME_PDF } from "../theme/resume";

interface ResumeData {
  site: { siteMetadata: { siteUrl: string } };
  profile: { nodes: Array<{ profile: ProfileType }> };
  social: { nodes: SocialType[] };
  job: { nodes: JobType[] };
  project: { nodes: ProjectType[] };
}

const pretty = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** How many projects the résumé lists (featured first, archive never). Two keeps the PDF at two pages. */
const PROJECT_COUNT = 2;

const H2: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <h2
    id={id}
    className="print-keep-next mb-3 scroll-mt-24 border-b border-ink pb-1 font-mono text-label font-medium uppercase tracking-[0.08em] text-ink print:mb-2 print:text-[0.7rem]"
  >
    {children}
  </h2>
);

const Bullets: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="mt-1.5 space-y-0.5 print:mt-1">
    {items.map((h) => (
      <li key={h} className="print-avoid-break flex gap-2.5">
        <span aria-hidden="true" className="mt-[0.72em] h-px w-2.5 shrink-0 bg-accent" />
        <span>{h}</span>
      </li>
    ))}
  </ul>
);

const Stack: React.FC<{ items: string[] }> = ({ items }) => (
  <p className="mt-1 font-mono text-label text-muted print:text-[0.68rem]">{items.join(", ")}</p>
);

/** One role: title line with dates, then bullets, NDA note and stack. */
const Role: React.FC<{ job: JobType; now: Date; nested?: boolean }> = ({ job, now, nested }) => {
  const duration = roleDuration(job, now);
  const Title = nested ? "h4" : "h3";
  return (
    <>
      <div className="print-keep-next flex flex-wrap items-baseline justify-between gap-x-4">
        <Title className={`text-[0.95rem] print:text-[0.9rem] ${nested ? "font-medium" : "font-semibold"}`}>
          {job.jobTitle}
          {!nested && <span className="font-normal text-muted">, {job.company.name}</span>}
          {job.employmentType && <span className="font-normal text-muted"> ({job.employmentType})</span>}
        </Title>
        <p className="font-mono text-meta tabular-nums text-muted print:text-[0.7rem]">
          {formatRange(job)}
          {duration && <span> ({duration})</span>}
        </p>
      </div>
      {job.highlights?.length ? (
        <Bullets items={job.highlights} />
      ) : job.summary ? (
        <p className="mt-1">{job.summary}</p>
      ) : null}
      {job.note && <p className="mt-1 text-[0.8rem] italic text-muted print:text-[0.72rem]">{job.note}</p>}
      {job.technologies?.length ? <Stack items={job.technologies} /> : null}
    </>
  );
};

/** Consecutive roles at the same company, grouped. */
const groupByCompany = (jobs: JobType[]) =>
  jobs.reduce<JobType[][]>((acc, job) => {
    const last = acc[acc.length - 1];
    if (last && last[0].company.name === job.company.name) last.push(job);
    else acc.push([job]);
    return acc;
  }, []);

/** Trailing full stop for bullet text written without one in the YAML. */
const sentence = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);

/* ------------------------------------------------------------------ */

/** The whole résumé as plain text, for application forms that want a paste. */
const toPlainText = (
  profile: ProfileType,
  contact: Array<{ label: string }>,
  jobs: JobType[],
  projects: ProjectType[],
  now: Date,
): string => {
  const out: string[] = [];
  out.push(`${profile.fname} ${profile.lname}`.toUpperCase());
  out.push(profile.profession);
  if (profile.availability) out.push(profile.availability);
  out.push(contact.map((c) => c.label).join(" | "));
  const summary = profile.resumeSummary || profile.intro;
  if (summary) out.push("", "SUMMARY", summary);
  out.push("", "EXPERIENCE");
  jobs.forEach((job) => {
    const duration = roleDuration(job, now);
    out.push("", [job.jobTitle, job.company.name, job.employmentType].filter(Boolean).join(" | "));
    out.push([formatRange(job), duration].filter(Boolean).join(" | "));
    if (job.highlights?.length) job.highlights.forEach((h) => out.push(`- ${h}`));
    else if (job.summary) out.push(job.summary);
    if (job.note) out.push(job.note);
    if (job.technologies?.length) out.push(`Technologies: ${job.technologies.join(", ")}`);
  });
  if (projects.length) {
    out.push("", "PROJECTS");
    projects.forEach((p) => {
      out.push("", [p.name, p.tagline].filter(Boolean).join(" | ") + (p.url ? ` (${pretty(p.url)})` : ""));
      if (p.highlights?.length) p.highlights.forEach((h) => out.push(`- ${sentence(h)}`));
      else if (p.summary) out.push(p.summary);
      if (p.technologies?.length) out.push(`Technologies: ${p.technologies.join(", ")}`);
    });
  }
  if (profile.skillGroups?.length) {
    out.push("", "SKILLS");
    profile.skillGroups.forEach((g) => out.push(`${g.title}: ${g.items?.join(", ") ?? ""}`));
  }
  if (profile.education?.length) {
    out.push("", "EDUCATION");
    profile.education.forEach((e) => out.push(`${e.qualification}, ${e.institution}`));
  }
  return out.join("\n");
};

/* ------------------------------------------------------------------ */

/**
 * Résumé generated from the same YAML as the site, designed to print on A4.
 * static/Reti-Fier-Resume.pdf is produced from this page (see README). The
 * sheet is deliberately plain: no motion, no decorative charts, one column,
 * so it reads the same on screen, on paper and in applicant tracking systems.
 */
const ResumePage: React.FC<PageProps<ResumeData>> = ({ data }) => {
  const { now } = useSiteData();
  const profile = data.profile.nodes[0].profile;
  const siteUrl = data.site.siteMetadata.siteUrl;
  const jobs = data.job.nodes;
  const groups = useMemo(() => groupByCompany(jobs), [jobs]);
  const projects = useMemo(
    () => data.project.nodes.filter((p) => p.tier !== "archive").slice(0, PROJECT_COUNT),
    [data.project.nodes],
  );

  const contact = useMemo(
    () =>
      [
        profile.email && { label: profile.email, href: `mailto:${profile.email}` },
        { label: pretty(siteUrl), href: siteUrl },
        ...data.social.nodes.map((s) => ({ label: pretty(s.url), href: s.url })),
      ].filter(Boolean) as Array<{ label: string; href: string }>,
    [profile.email, siteUrl, data.social.nodes],
  );

  const copyText = useCallback(() => {
    const text = toPlainText(profile, contact, jobs, projects, now);
    // Fallback for browsers or embedded views that block the async clipboard API.
    const legacyCopy = () => {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      area.remove();
      toast(ok ? "Résumé copied as plain text" : "Copy was blocked by the browser");
    };
    if (!navigator.clipboard?.writeText) {
      legacyCopy();
      return;
    }
    navigator.clipboard.writeText(text).then(() => toast("Résumé copied as plain text"), legacyCopy);
  }, [profile, contact, jobs, projects, now]);

  const btn =
    "inline-flex items-center gap-2 border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.05em] text-ink transition-colors hover:border-ink";
  const summary = profile.resumeSummary || profile.intro;

  return (
    <div className="min-h-screen bg-canvas py-6 print:bg-white print:py-0 sm:py-10">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-5 sm:px-0">
        <Link to="/" className="tap inline-flex items-center gap-2 font-mono text-small text-muted hover:text-ink">
          <FiArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Back to portfolio
        </Link>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copyText} className={btn}>
            <FiCopy aria-hidden="true" className="h-4 w-4" /> Copy text
          </button>
          <button type="button" onClick={() => window.print()} className={`${btn} hidden sm:inline-flex`}>
            <FiPrinter aria-hidden="true" className="h-4 w-4" /> Print
          </button>
          <a
            href={RESUME_PDF}
            download={RESUME_FILE}
            className="inline-flex items-center gap-2 bg-ink px-4 py-2 font-mono text-label uppercase tracking-[0.05em] text-canvas transition-colors hover:bg-accent"
          >
            <FiDownload aria-hidden="true" className="h-4 w-4" /> Download PDF
          </a>
        </div>
      </div>

      <main
        id="main-content"
        className="paper mx-auto max-w-[210mm] px-6 py-10 text-[0.875rem] leading-[1.55] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] print:max-w-none print:px-0 print:py-0 print:text-[0.8rem] print:leading-[1.42] print:shadow-none sm:px-[16mm] sm:py-[14mm]"
      >
        <header>
          <h1
            className="font-display text-[2.4rem] font-extrabold uppercase leading-[0.92] tracking-[-0.02em] sm:text-[2.9rem] print:text-[2.4rem]"
            style={{ fontStretch: "104%" }}
          >
            {profile.fname} {profile.lname}
          </h1>
          <p className="mt-2 text-[1.1rem] font-semibold print:mt-1.5 print:text-[1rem]">{profile.profession}</p>
          {profile.focus?.length ? (
            <p className="mt-0.5 text-muted print:text-[0.82rem]">{profile.focus.join(", ")}</p>
          ) : null}

          {/* Spacing, not separators, so a wrapped line never starts with one. */}
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-0.5 border-y border-ink py-1.5 font-mono text-meta print:mt-2.5 print:gap-x-4 print:text-[0.7rem]">
            {contact.map((c) => (
              <li key={c.href}>
                <a href={c.href} className="text-ink hover:text-accent">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
          {profile.availability && (
            <p className="mt-1.5 font-mono text-label text-accent print:text-[0.68rem]">{profile.availability}</p>
          )}
        </header>

        {summary && (
          <section aria-label="Summary" className="mt-4 print:mt-3">
            <p className="text-[0.95rem] leading-relaxed print:text-[0.84rem] print:leading-[1.5]">{summary}</p>
          </section>
        )}

        <section className="mt-6 print:mt-4">
          <H2 id="experience">Experience</H2>
          <ol className="space-y-4 print:space-y-2">
            {groups.map((roles) =>
              roles.length === 1 ? (
                <li key={roles[0].id}>
                  <Role job={roles[0]} now={now} />
                </li>
              ) : (
                // Several roles at one company read as one block.
                <li key={roles[0].id}>
                  <h3 className="print-keep-next text-[0.95rem] font-semibold print:text-[0.9rem]">{roles[0].company.name}</h3>
                  <ol className="mt-1 space-y-2.5 border-l border-line pl-3 print:space-y-1.5">
                    {roles.map((job) => (
                      <li key={job.id}>
                        <Role job={job} now={now} nested />
                      </li>
                    ))}
                  </ol>
                </li>
              ),
            )}
          </ol>
        </section>

        {projects.length > 0 && (
          <section className="mt-6 print:mt-4">
            <H2 id="projects">Projects</H2>
            <ul className="space-y-4 print:space-y-2">
              {projects.map((p) => (
                <li key={p.slug} className="print-avoid-break">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-[0.95rem] font-semibold print:text-[0.9rem]">
                      {p.name}
                      {p.tagline && <span className="font-normal text-muted"> — {p.tagline}</span>}
                    </h3>
                    <p className="font-mono text-meta text-muted print:text-[0.7rem]">
                      {p.url ? (
                        <a href={p.url} className="text-ink hover:text-accent">
                          {pretty(p.url)}
                        </a>
                      ) : (
                        p.status
                      )}
                    </p>
                  </div>
                  {p.highlights?.length ? (
                    <Bullets items={p.highlights.map(sentence)} />
                  ) : p.summary ? (
                    <p className="mt-1">{p.summary}</p>
                  ) : null}
                  {p.technologies?.length ? <Stack items={p.technologies} /> : null}
                </li>
              ))}
            </ul>
          </section>
        )}

        {profile.skillGroups?.length ? (
          <section className="mt-6 print:mt-4">
            <H2 id="skills">Skills</H2>
            <dl className="space-y-1.5 print:space-y-1">
              {profile.skillGroups.map((g) => (
                // One row per group, so a page break never separates a group from its list.
                <div key={g.title} className="print-avoid-break grid gap-x-6 sm:grid-cols-[10.5rem_1fr]">
                  <dt className="font-semibold">{g.title}</dt>
                  <dd className="text-muted">{g.items?.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {profile.education?.length ? (
          <section className="print-avoid-break mt-6 print:mt-4">
            <H2 id="education">Education</H2>
            <ul className="space-y-1">
              {profile.education.map((e) => (
                <li key={e.qualification}>
                  <span className="font-semibold">{e.qualification}</span>
                  <span className="text-muted">, {e.institution}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <CommandPalette isHome={false} />
      <Toaster />
    </div>
  );
};

export default ResumePage;

export const Head: HeadFC = ({ location }) => (
  <Seo
    title="Résumé"
    description="Résumé of Reti Fier, senior full-stack and product engineer: experience, projects, skills and education."
    pathname={location.pathname}
    type="profile"
    breadcrumbs={[{ name: "Résumé", path: location.pathname }]}
  />
);

export const query = graphql`
  query ResumePage {
    site {
      siteMetadata {
        siteUrl
      }
    }
    profile: allProfileYaml(limit: 1) {
      nodes {
        profile {
          fname
          lname
          profession
          intro
          resumeSummary
          email
          availability
          focus
          education {
            qualification
            institution
          }
          skillGroups {
            title
            items
          }
        }
      }
    }
    social: allSocialYaml {
      nodes {
        name
        url
      }
    }
    job: allJobYaml(sort: { order: ASC }) {
      nodes {
        id
        company {
          name
        }
        jobTitle
        employmentType
        fromDate
        toDate
        current
        summary
        highlights
        technologies
        note
      }
    }
    project: allProjectYaml(sort: { order: ASC }) {
      nodes {
        slug
        tier
        name
        tagline
        status
        url
        summary
        highlights
        technologies
      }
    }
  }
`;
