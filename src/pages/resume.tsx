import React, { useCallback, useEffect, useMemo, useState } from "react";
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import { FiArrowLeft, FiCopy, FiDownload, FiPrinter, FiX } from "react-icons/fi";
import { Seo } from "../components/Seo";
import { CommandPalette } from "../components/CommandPalette";
import { Toaster, toast } from "../components/Toaster";
import { CountUp, YearOdometer } from "../components/motion";
import { ProfileType, SocialType } from "../@types/about";
import { JobType } from "../@types/job";
import { ProjectType } from "../@types/project";
import {
  currentYearMonth,
  formatRange,
  formatYearMonth,
  parseYearMonth,
  roleDuration,
  toMonthIndex,
  yearsSince,
} from "../utils/dates";
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
const pad = (n: number) => String(n).padStart(2, "0");

/** Screen-only entrance delay; the animation itself is defined in global.css. */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

const SECTIONS = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Selected projects" },
  { id: "skills", label: "Skills" },
];

const H2: React.FC<{ id: string; index: string; children: React.ReactNode; delay: number }> = ({ id, index, children, delay }) => (
  <div className="print-keep-next mb-3 print:mb-2">
    <h2
      id={id}
      className="resume-rise flex scroll-mt-24 items-baseline gap-2 pb-1.5 font-mono text-label uppercase tracking-[0.05em] text-ink print:text-[0.7rem]"
      style={d(delay)}
    >
      <span className="text-accent">{index}</span>
      <span aria-hidden="true" className="text-faint">
        /
      </span>
      {children}
    </h2>
    {/* In normal flow (not positioned) so the PDF text layer keeps reading order. */}
    <div aria-hidden="true" className="resume-rule h-px bg-ink/80" style={d(delay + 80)} />
  </div>
);

const Marker: React.FC<{ lit?: boolean }> = ({ lit }) => (
  <span
    aria-hidden="true"
    className={`mt-[0.72em] h-px shrink-0 bg-accent transition-all duration-300 ${lit ? "w-4" : "w-2.5"} print:w-2.5`}
  />
);

/* ------------------------------------------------------------------ */

interface StripProps {
  jobs: JobType[];
  now: Date;
  active: string | null;
  onHover: (id: string | null) => void;
  /** Roles that do not use the selected technology are dimmed (screen only). */
  matches: (job: JobType) => boolean;
}

/**
 * Career span: every role as a bar on one time axis, stacked into lanes so
 * concurrent roles read as concurrent. Roles without a confirmed end date get
 * a start marker only. Decorative (the list below carries the same facts) and
 * text-free, so it adds nothing to the PDF text layer.
 */
const CareerStrip: React.FC<StripProps> = ({ jobs, now, active, onHover, matches }) => {
  const chronological = [...jobs].sort((a, b) => a.fromDate.localeCompare(b.fromDate));
  const start = toMonthIndex(parseYearMonth(chronological[0].fromDate));
  const end = toMonthIndex(currentYearMonth(now));
  const span = Math.max(1, end - start + 1);
  const pct = (m: number) => Math.min(100, Math.max(0, ((m - start) / span) * 100));

  const lanes: number[] = [];
  const bars = chronological.map((job) => {
    const from = toMonthIndex(parseYearMonth(job.fromDate));
    const openEnded = !job.toDate && !job.current;
    const to = job.toDate ? toMonthIndex(parseYearMonth(job.toDate)) : openEnded ? from : end;
    let lane = lanes.findIndex((lastEnd) => lastEnd < from);
    if (lane === -1) {
      lane = lanes.length;
      lanes.push(to);
    } else lanes[lane] = to;
    return { job, lane, left: pct(from), width: openEnded ? 0 : Math.max(0.8, pct(to + 1) - pct(from)), openEnded };
  });

  const firstYear = parseYearMonth(chronological[0].fromDate).year;
  const lastYear = currentYearMonth(now).year;
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i).filter(
    (y) => toMonthIndex({ year: y, month: 1 }) >= start,
  );
  const laneH = 9;

  return (
    <div aria-hidden="true" className="resume-rise print-avoid-break mt-4 print:mt-2.5" style={d(520)}>
      <div className="flex items-baseline justify-between font-mono text-label uppercase tracking-[0.05em] text-muted print:text-[0.66rem]">
        <span>Career span</span>
        <span className="tabular-nums">
          {firstYear} – {lastYear}
        </span>
      </div>
      <div className="relative mt-2 border-b border-ink/70 print:mt-1.5" style={{ height: lanes.length * laneH + 6 }}>
        {years.map((y) => (
          <span
            key={y}
            className="absolute bottom-0 top-0 w-px bg-line"
            style={{ left: `${pct(toMonthIndex({ year: y, month: 1 }))}%` }}
          />
        ))}
        {bars.map(({ job, lane, left, width, openEnded }, i) => {
          const lit = active === job.id;
          const dim = !matches(job) ? "opacity-20 print:opacity-100" : "";
          const style: React.CSSProperties = { left: `${left}%`, top: 3 + lane * laneH, ...d(620 + i * 70) };
          return openEnded ? (
            <span
              key={job.id}
              onMouseEnter={() => onHover(job.id)}
              onMouseLeave={() => onHover(null)}
              className={`absolute h-[6px] w-[3px] transition-opacity duration-300 ${lit ? "bg-accent" : "bg-ink"} ${dim}`}
              style={style}
            />
          ) : (
            <span
              key={job.id}
              onMouseEnter={() => onHover(job.id)}
              onMouseLeave={() => onHover(null)}
              className={`resume-bar absolute h-[6px] transition-[background-color,opacity] duration-300 ${
                lit ? "bg-accent" : job.current ? "bg-accent/80" : "bg-ink"
              } ${dim}`}
              style={{ ...style, width: `${width}%` }}
            />
          );
        })}
        <span className="absolute -bottom-1 right-0 top-0 w-px bg-accent" />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

/** Contents and reading progress beside the sheet on wide screens. */
const Rail: React.FC<{ onCopy: () => void }> = ({ onCopy }) => {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
        setProgress(p);
        // Last heading above the top third of the screen; the last section is
        // short and may never get there, so the end of the page selects it.
        let current = SECTIONS[0].id;
        for (const s of SECTIONS) {
          const el = document.getElementById(s.id);
          if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = s.id;
        }
        setActive(p > 0.985 ? SECTIONS[SECTIONS.length - 1].id : current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <nav
      aria-label="Résumé sections"
      className="no-print fixed top-28 hidden w-44 xl:block"
      style={{ left: "max(1.5rem, calc(50% - 105mm - 13rem))" }}
    >
      <p className="font-mono text-label uppercase tracking-[0.05em] text-muted">/ Contents</p>
      <ol className="mt-3 border-l border-line">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={`-ml-px flex gap-2 border-l py-1.5 pl-3 font-mono text-meta transition-colors duration-300 ${
                active === s.id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <span className={active === s.id ? "text-accent" : "text-faint"}>{pad(i + 1)}</span>
              {s.label}
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-6" aria-hidden="true">
        <div className="flex justify-between font-mono text-label uppercase tracking-[0.05em] text-muted">
          <span>Read</span>
          <span className="tabular-nums">{pad(Math.round(progress * 100))}%</span>
        </div>
        <div className="mt-2 h-px bg-line">
          <div className="h-px origin-left bg-accent" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="mt-6 inline-flex items-center gap-2 font-mono text-label uppercase tracking-[0.05em] text-muted transition-colors hover:text-accent"
      >
        <FiCopy aria-hidden="true" className="h-3.5 w-3.5" /> Copy as plain text
      </button>
    </nav>
  );
};

/* ------------------------------------------------------------------ */

/**
 * Technologies as "A / B / C". The separators stay plain text nodes so the
 * PDF and copied text read exactly as before; the selected technology is
 * highlighted on screen only.
 */
const TechLine: React.FC<{ items: string[]; stack: string | null; className?: string }> = ({ items, stack, className = "" }) => (
  <p className={`mt-1 font-mono text-label text-muted print:text-[0.68rem] ${className}`}>
    {items.map((t, i) => (
      <React.Fragment key={t}>
        {i > 0 && " / "}
        <span
          className={
            t === stack
              ? "bg-accent px-0.5 text-canvas print:bg-transparent print:px-0 print:text-inherit"
              : undefined
          }
        >
          {t}
        </span>
      </React.Fragment>
    ))}
  </p>
);

/** A role's position on the shared career axis, drawn small beside its dates. */
const RoleTrack: React.FC<{ job: JobType; start: number; end: number; lit: boolean }> = ({ job, start, end, lit }) => {
  const span = Math.max(1, end - start + 1);
  const pct = (m: number) => Math.min(100, Math.max(0, ((m - start) / span) * 100));
  const from = toMonthIndex(parseYearMonth(job.fromDate));
  const openEnded = !job.toDate && !job.current;
  const to = job.toDate ? toMonthIndex(parseYearMonth(job.toDate)) : end;
  const left = pct(from);
  return (
    <span aria-hidden="true" className="relative hidden h-[5px] w-14 shrink-0 self-center bg-line sm:inline-block print:h-[4px] print:w-8">
      {openEnded ? (
        <span className={`absolute -top-[2px] h-[9px] w-[2px] ${lit ? "bg-accent" : "bg-ink"}`} style={{ left: `${left}%` }} />
      ) : (
        <span
          className={`absolute inset-y-0 transition-colors duration-200 ${lit ? "bg-accent" : job.current ? "bg-accent/80" : "bg-ink"}`}
          style={{ left: `${left}%`, width: `${Math.max(4, pct(to + 1) - left)}%` }}
        />
      )}
    </span>
  );
};

interface Tally {
  name: string;
  roles: number;
  projects: number;
}

/** How many roles and listed projects use each technology, most used first. */
const tallyStack = (jobs: JobType[], projects: ProjectType[]): Tally[] => {
  const map = new Map<string, Tally>();
  const get = (name: string) => {
    let t = map.get(name);
    if (!t) map.set(name, (t = { name, roles: 0, projects: 0 }));
    return t;
  };
  jobs.forEach((j) => j.technologies?.forEach((t) => get(t).roles++));
  projects.forEach((p) => p.technologies?.forEach((t) => get(t).projects++));
  return [...map.values()].sort(
    (a, b) => b.roles + b.projects - (a.roles + a.projects) || b.roles - a.roles || a.name.localeCompare(b.name),
  );
};

/** The role whose block is at the reading line (or the last one passed). */
const useRoleInView = (jobs: JobType[]) => {
  const [id, setId] = useState<string>(jobs[0]?.id ?? "");
  useEffect(() => {
    let raf = 0;
    const check = () => {
      let current = jobs[0]?.id ?? "";
      for (const j of jobs) {
        const el = document.getElementById(`resume-role-${j.id}`);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = j.id;
      }
      setId(current);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [jobs]);
  return id;
};

interface InspectorProps {
  jobs: JobType[];
  now: Date;
  focusId: string;
  tallies: Tally[];
  stack: string | null;
  onStack: (name: string | null) => void;
}

/**
 * Right-hand panel on wide screens: the role being read (start year rolls as
 * you scroll) and a stack index that filters the sheet by technology.
 */
const Inspector: React.FC<InspectorProps> = ({ jobs, now, focusId, tallies, stack, onStack }) => {
  const index = Math.max(0, jobs.findIndex((j) => j.id === focusId));
  const job = jobs[index];
  const max = Math.max(1, ...tallies.map((t) => t.roles + t.projects));
  const shown = tallies.filter((t) => t.roles + t.projects > 1 || t.name === stack);
  if (!job) return null;
  const duration = roleDuration(job, now);
  const year = String(parseYearMonth(job.fromDate).year);

  return (
    <aside
      aria-label="Role in view and stack filter"
      className="no-print fixed top-28 hidden max-h-[calc(100vh-8rem)] w-52 overflow-y-auto xl:block"
      style={{ right: "max(1.5rem, calc(50% - 105mm - 15rem))" }}
    >
      <p className="font-mono text-label uppercase tracking-[0.05em] text-muted">/ In view</p>
      <div className="mt-2 border-t border-line pt-3">
        <p className="font-display text-[3.4rem] font-extrabold leading-none tracking-[-0.03em] text-ink" style={{ fontStretch: "104%" }}>
          <YearOdometer value={year} />
        </p>
        <p className="mt-2 font-mono text-label uppercase tracking-[0.05em] text-muted">
          <span className="text-accent">{pad(index + 1)}</span> / {pad(jobs.length)} /{" "}
          {job.current ? "current" : job.toDate ? `to ${parseYearMonth(job.toDate).year}` : "start date"}
        </p>
        <p className="mt-2 text-[0.9rem] font-medium leading-snug text-ink">{job.jobTitle}</p>
        <p className="text-meta text-muted">{job.company.name}</p>
        <p className="mt-1 font-mono text-label tabular-nums text-muted">
          {formatRange(job)}
          {duration && ` / ${duration}`}
        </p>
      </div>

      <div className="mt-7 flex items-baseline justify-between">
        <p className="font-mono text-label uppercase tracking-[0.05em] text-muted">/ Stack</p>
        {stack ? (
          <button
            type="button"
            onClick={() => onStack(null)}
            className="inline-flex items-center gap-1 font-mono text-label uppercase tracking-[0.05em] text-accent hover:text-ink"
          >
            <FiX aria-hidden="true" className="h-3 w-3" /> Clear
          </button>
        ) : (
          <span className="font-mono text-label text-faint">roles + projects</span>
        )}
      </div>
      <ul className="mt-2 border-t border-line">
        {shown.map((t) => {
          const on = stack === t.name;
          const total = t.roles + t.projects;
          return (
            <li key={t.name}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onStack(on ? null : t.name)}
                className={`group grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2 border-b border-line/70 py-1.5 text-left transition-colors ${
                  on ? "text-accent" : "text-ink hover:text-accent"
                }`}
              >
                <span className="truncate font-mono text-meta">{t.name}</span>
                <span className="font-mono text-label tabular-nums text-muted">
                  {t.roles}
                  <span className="text-faint">+</span>
                  {t.projects}
                </span>
                <span aria-hidden="true" className="col-span-2 mt-1 block h-[2px] bg-line">
                  <span
                    className={`block h-full origin-left transition-colors ${on ? "bg-accent" : "bg-ink/60 group-hover:bg-accent"}`}
                    style={{ width: `${(total / max) * 100}%` }}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[0.75rem] leading-snug text-muted">
        Counts are roles + projects on this page. Select one to highlight where it was used.
      </p>
    </aside>
  );
};

/** The same filter as a scrolling chip row for narrower screens. */
const StackChips: React.FC<{ tallies: Tally[]; stack: string | null; onStack: (name: string | null) => void }> = ({
  tallies,
  stack,
  onStack,
}) => (
  <div className="no-print mx-auto mb-4 max-w-[210mm] xl:hidden">
    <div className="flex items-center gap-2 overflow-x-auto px-5 pb-1 sm:px-0 [scrollbar-width:none]">
      <span className="shrink-0 font-mono text-label uppercase tracking-[0.05em] text-muted">Stack / roles+projects</span>
      {tallies
        .filter((t) => t.roles + t.projects > 1)
        .map((t) => {
          const on = stack === t.name;
          return (
            <button
              key={t.name}
              type="button"
              aria-pressed={on}
              onClick={() => onStack(on ? null : t.name)}
              className={`shrink-0 border px-2.5 py-1 font-mono text-label transition-colors ${
                on ? "border-accent bg-accent text-canvas" : "border-line text-ink hover:border-ink"
              }`}
            >
              {t.name}{" "}
              <span className={on ? "text-canvas/80" : "text-muted"}>
                {t.roles}+{t.projects}
              </span>
            </button>
          );
        })}
    </div>
  </div>
);

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
  out.push([profile.profession, profile.focus?.length ? profile.focus.join(", ") : null].filter(Boolean).join(" / "));
  out.push(contact.map((c) => c.label).join(" / "));
  const summary = profile.resumeSummary || profile.intro;
  if (summary) out.push("", summary);
  out.push("", "EXPERIENCE");
  jobs.forEach((job) => {
    const duration = roleDuration(job, now);
    out.push("", [job.jobTitle, job.company.name, job.employmentType].filter(Boolean).join(" / "));
    out.push([formatRange(job), duration].filter(Boolean).join(" / "));
    if (job.highlights?.length) job.highlights.forEach((h) => out.push(`- ${h}`));
    else if (job.summary) out.push(job.summary);
    if (job.technologies?.length) out.push(`Technologies: ${job.technologies.join(", ")}`);
  });
  if (projects.length) {
    out.push("", "SELECTED PROJECTS");
    projects.forEach((p) => {
      out.push("", [p.name, p.tagline].filter(Boolean).join(" / ") + (p.url ? ` (${pretty(p.url)})` : ""));
      if (p.highlights?.length) out.push(`${p.highlights.slice(0, 3).join(". ")}.`);
      else if (p.summary) out.push(p.summary);
      if (p.technologies?.length) out.push(`Technologies: ${p.technologies.join(", ")}`);
    });
  }
  if (profile.skillGroups?.length) {
    out.push("", "SKILLS");
    profile.skillGroups.forEach((g) => out.push(`${g.title}: ${g.items?.join(", ") ?? ""}`));
  }
  return out.join("\n");
};

/**
 * Scroll reveal for blocks below the first screen. Server HTML (and print)
 * always shows everything; blocks are hidden only after mount, only on
 * screen with motion allowed, and only while they are still out of view.
 */
const useRevealBelowFold = () => {
  useEffect(() => {
    if (!window.matchMedia("screen and (prefers-reduced-motion: no-preference)").matches) return;
    let waiting = Array.from(document.querySelectorAll<HTMLElement>(".resume-sheet .resume-rise")).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight * 0.92,
    );
    if (!waiting.length) return;
    waiting.forEach((el) => el.classList.add("resume-wait"));
    let raf = 0;
    // A scroll check rather than IntersectionObserver, so blocks jumped over by
    // an anchor link (never intersecting) are revealed too.
    const check = () => {
      let n = 0;
      waiting = waiting.filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.top > window.innerHeight * 0.94) return true;
        el.classList.remove("resume-wait");
        if (r.bottom > 0) {
          el.style.setProperty("--d", `${n++ * 70}ms`);
          el.classList.add("resume-in");
        }
        return false;
      });
      if (!waiting.length) window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    const revealAll = () => waiting.forEach((el) => el.classList.remove("resume-wait"));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("beforeprint", revealAll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeprint", revealAll);
    };
  }, []);
};

/* ------------------------------------------------------------------ */

/**
 * Résumé generated from the same YAML as the site, designed to print on A4.
 * static/Reti-Fier-Resume.pdf is produced from this page (see README). Motion is
 * screen-only and never applies in print or under reduced motion.
 */
const ResumePage: React.FC<PageProps<ResumeData>> = ({ data }) => {
  const { now } = useSiteData();
  const profile = data.profile.nodes[0].profile;
  const siteUrl = data.site.siteMetadata.siteUrl;
  const jobs = data.job.nodes;
  const projects = useMemo(() => data.project.nodes.filter((p) => p.tier !== "archive").slice(0, 3), [data.project.nodes]);
  const updated = formatYearMonth(now.toISOString().slice(0, 7));
  const featured = data.project.nodes.filter((p) => p.tier === "featured").length;
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [stack, setStack] = useState<string | null>(null);
  const roleInView = useRoleInView(jobs);
  const tallies = useMemo(() => tallyStack(jobs, projects), [jobs, projects]);
  const matchesJob = useCallback((job: JobType) => !stack || !!job.technologies?.includes(stack), [stack]);
  // Applied to children (see .resume-dim in global.css): the blocks themselves
  // run an entrance animation whose fill would override their own opacity.
  const dimClass = (match: boolean) => (match ? "" : "resume-dim");
  useRevealBelowFold();

  // Bring the first matching entry into view if none is on screen.
  useEffect(() => {
    if (!stack) return;
    const els = jobs
      .filter((j) => j.technologies?.includes(stack))
      .map((j) => document.getElementById(`resume-role-${j.id}`))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const onScreen = els.some((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 80 && r.top < window.innerHeight - 80;
    });
    if (!onScreen) els[0].scrollIntoView({ behavior: "smooth", block: "center" });
  }, [stack, jobs]);

  useEffect(() => {
    if (!stack) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStack(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stack]);

  const chronological = useMemo(() => [...jobs].sort((a, b) => a.fromDate.localeCompare(b.fromDate)), [jobs]);
  const axisStart = toMonthIndex(parseYearMonth(chronological[0].fromDate));
  const axisEnd = toMonthIndex(currentYearMonth(now));

  const stats = [
    profile.careerStart && {
      value: yearsSince(profile.careerStart, now),
      suffix: "+",
      label: "Years engineering",
      detail: `since ${profile.careerStart.slice(0, 4)}`,
    },
    { value: jobs.length, suffix: "", label: "Roles", detail: "full-time, contract, freelance" },
    featured > 0 && { value: featured, suffix: "", label: "Independent systems", detail: "designed and built end to end" },
    profile.skillGroups?.length && {
      value: profile.skillGroups.length,
      suffix: "",
      label: "Capability areas",
      detail: "frontend to infrastructure",
    },
  ].filter(Boolean) as Array<{ value: number; suffix: string; label: string; detail: string }>;

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

  return (
    <div className="min-h-screen bg-canvas py-6 print:bg-white print:py-0 sm:py-10">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-5 sm:px-0">
        <Link to="/" className="tap inline-flex items-center gap-2 font-mono text-small text-muted hover:text-ink">
          <FiArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Back to portfolio
        </Link>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copyText} className={`${btn} xl:hidden`}>
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

      <StackChips tallies={tallies} stack={stack} onStack={setStack} />

      <Rail onCopy={copyText} />
      <Inspector jobs={jobs} now={now} focusId={activeRole ?? roleInView} tallies={tallies} stack={stack} onStack={setStack} />

      <main
        id="main-content"
        className="paper resume-sheet relative mx-auto max-w-[210mm] overflow-hidden px-6 py-10 text-[0.875rem] leading-[1.55] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] print:max-w-none print:overflow-visible print:px-0 print:py-0 print:text-[0.8rem] print:leading-[1.4] print:shadow-none sm:px-[16mm] sm:py-[14mm]"
      >
        <span aria-hidden="true" className="resume-scan no-print pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-accent" />

        <header>
          <p className="resume-rise flex justify-between gap-4 font-mono text-label uppercase tracking-[0.05em] text-muted print:text-[0.66rem]" style={d(80)}>
            <span>Résumé / updated {updated}</span>
            <span aria-hidden="true" className="no-print hidden sm:inline">
              A4 / generated from site content
            </span>
          </p>

          <h1
            className="resume-rise mt-3 font-display text-[2.6rem] font-extrabold uppercase leading-[0.9] tracking-[-0.02em] sm:text-[3.1rem] print:text-[2.6rem]"
            style={{ ...d(140), fontStretch: "104%" }}
          >
            {profile.fname} {profile.lname}
            <span aria-hidden="true" className="caret no-print ml-2 inline-block h-[0.66em] w-[0.34em] bg-accent align-baseline" />
          </h1>
          <p className="resume-rise mt-2.5 text-[1.05rem] font-medium print:mt-1.5 print:text-[0.95rem]" style={d(220)}>
            {profile.profession}
            {profile.focus?.length ? <span className="font-normal text-muted"> / {profile.focus.join(", ")}</span> : null}
          </p>

          <ul
            className="resume-rise mt-4 flex flex-wrap gap-x-2 gap-y-0.5 border-y-2 print:mt-3 print:py-1.5 border-ink py-2 font-mono text-meta text-muted print:text-[0.7rem]"
            style={d(300)}
          >
            {contact.map((c, i) => (
              <li key={c.href} className="flex gap-2">
                {i > 0 && (
                  <span aria-hidden="true" className="text-faint">
                    /
                  </span>
                )}
                <a href={c.href} className="text-ink hover:text-accent">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>

          {stats.length > 0 && (
            <dl className="mt-4 grid grid-cols-2 border-b border-line pb-4 print:mt-2.5 print:pb-2 sm:grid-cols-4">
              {stats.map((st, i) => (
                <div
                  key={st.label}
                  className={`resume-rise flex flex-col py-1 ${i > 0 ? "sm:border-l sm:border-line sm:pl-4" : ""}`}
                  style={d(360 + i * 60)}
                >
                  <dt className="order-2 font-mono text-label uppercase tracking-[0.05em] text-ink print:text-[0.66rem]">{st.label}</dt>
                  <dd
                    className="order-1 font-display text-[1.9rem] font-extrabold leading-none tracking-[-0.02em] print:text-[1.3rem]"
                    style={{ fontStretch: "104%" }}
                  >
                    {/* Screen counts up; print always shows the final figure. */}
                    <span className="print:hidden">
                      <CountUp value={st.value} delay={0.45 + i * 0.08} duration={1.1} maxStartMs={4000} />
                      {st.suffix}
                    </span>
                    <span className="hidden print:inline">
                      {st.value}
                      {st.suffix}
                    </span>
                  </dd>
                  <dd className="order-3 font-mono text-label text-muted print:hidden">{st.detail}</dd>
                </div>
              ))}
            </dl>
          )}

          <CareerStrip jobs={jobs} now={now} active={activeRole} onHover={setActiveRole} matches={matchesJob} />
        </header>

        {(profile.resumeSummary || profile.intro) && (
          <section className="resume-rise mt-5 print:mt-3" style={d(600)}>
            <p className="text-[0.95rem] leading-relaxed print:text-[0.84rem] print:leading-[1.5]">{profile.resumeSummary || profile.intro}</p>
          </section>
        )}

        <section className="mt-6 print:mt-3">
          <H2 id="experience" index="01" delay={660}>
            Experience
          </H2>
          <ol className="space-y-4 print:space-y-1.5">
            {jobs.map((job, i) => {
              const duration = roleDuration(job, now);
              const lit = activeRole === job.id;
              return (
                <li
                  key={job.id}
                  id={`resume-role-${job.id}`}
                  className={`resume-rise group ${dimClass(matchesJob(job))}`}
                  style={d(740 + i * 60)}
                  onMouseEnter={() => setActiveRole(job.id)}
                  onMouseLeave={() => setActiveRole(null)}
                >
                  <div className="print-keep-next flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-[0.95rem] font-semibold print:text-[0.92rem]">
                      <span
                        className={`mr-2 font-mono text-label font-normal transition-colors duration-200 print:text-[0.66rem] ${
                          lit ? "text-accent" : "text-faint"
                        }`}
                      >
                        {pad(i + 1)}
                      </span>
                      {job.jobTitle}
                      <span className="font-normal text-muted"> / {job.company.name}</span>
                      {job.employmentType && <span className="font-normal text-faint"> / {job.employmentType}</span>}
                    </h3>
                    <div className="flex items-baseline gap-3 print:gap-2">
                      <RoleTrack job={job} start={axisStart} end={axisEnd} lit={lit} />
                      <p className="font-mono text-meta tabular-nums text-muted print:text-[0.7rem]">
                        {formatRange(job)}
                        {duration && <span className="text-faint"> / {duration}</span>}
                      </p>
                    </div>
                  </div>
                  {job.highlights?.length ? (
                    <ul className={`mt-1.5 space-y-0.5 ${job.technologies?.length ? "print-keep-next" : ""}`}>
                      {job.highlights.map((h) => (
                        <li key={h} className="print-avoid-break flex gap-2.5">
                          <Marker lit={lit} />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  ) : job.summary ? (
                    <p className="mt-1">{job.summary}</p>
                  ) : null}
                  {job.technologies?.length ? <TechLine items={job.technologies} stack={stack} /> : null}
                </li>
              );
            })}
          </ol>
        </section>

        <section className="print-avoid-break mt-6 print:mt-4">
          <H2 id="projects" index="02" delay={940}>
            Selected projects
          </H2>
          <ul className="space-y-3 print:space-y-2">
            {projects.map((p, i) => (
              <li
                key={p.slug}
                className={`resume-rise ${dimClass(!stack || !!p.technologies?.includes(stack))}`}
                style={d(1000 + i * 60)}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-[0.95rem] font-semibold print:text-[0.92rem]">
                    {p.name}
                    {p.tagline && <span className="font-normal text-muted"> / {p.tagline}</span>}
                  </h3>
                  <p className="font-mono text-meta text-muted print:text-[0.7rem]">{p.url ? pretty(p.url) : p.status}</p>
                </div>
                {p.highlights?.length ? (
                  <p className="mt-1">{p.highlights.slice(0, 3).join(". ")}.</p>
                ) : p.summary ? (
                  <p className="mt-1">{p.summary}</p>
                ) : null}
                {p.technologies?.length ? <TechLine items={p.technologies} stack={stack} /> : null}
              </li>
            ))}
          </ul>
        </section>

        {profile.skillGroups?.length ? (
          <section className="mt-6 print:mt-4">
            <H2 id="skills" index="03" delay={1120}>
              Skills
            </H2>
            <dl className="resume-rise grid gap-x-6 gap-y-1.5 print:gap-y-1 sm:grid-cols-[10.5rem_1fr]" style={d(1180)}>
              {profile.skillGroups.map((g) => (
                <React.Fragment key={g.title}>
                  <dt className="font-semibold">{g.title}</dt>
                  <dd className="text-muted">{g.items?.join(", ")}</dd>
                </React.Fragment>
              ))}
            </dl>
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
    description="Résumé of Reti Fier, full-stack software engineer: experience, selected projects and skills."
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
          careerStart
          focus
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
