import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";
import { JobType } from "../../@types/job";
import { formatRange, parseYearMonth, roleDuration, yearsSince } from "../../utils/dates";
import { EASE } from "../../utils/animations";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";
import { TechList } from "../ui/TechList";
import { ArrowLink } from "../ui/ArrowLink";
import { CareerTimeline } from "./CareerTimeline";
import { useSiteData } from "../../hooks/useSiteData";
import { CountUp, YearOdometer } from "../motion";

const CompanyMark: React.FC<{ job: JobType }> = ({ job }) => {
  const logo = job.company.logo?.childImageSharp ? getImage(job.company.logo.childImageSharp.gatsbyImageData) : undefined;
  if (logo) {
    return (
      <GatsbyImage
        image={logo}
        alt=""
        className="h-9 w-9 shrink-0 overflow-hidden border border-line bg-ink/90 grayscale"
        imgClassName="object-contain p-1"
      />
    );
  }
  return (
    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center border border-line font-mono text-sm text-muted">
      {job.company.name.charAt(0)}
    </span>
  );
};

const Role: React.FC<{ job: JobType; open: boolean; onToggle: () => void }> = ({ job, open, onToggle }) => {
  const { now } = useSiteData();
  const duration = roleDuration(job, now);
  const panelId = `role-panel-${job.id}`;
  const meta = [job.employmentType, job.workplace].filter(Boolean).join(" / ");
  const ref = useRef<HTMLLIElement>(null);
  const lit = useInView(ref, { once: true, margin: "0px 0px -45% 0px" });

  return (
    <li ref={ref} id={`role-${job.id}`} className="relative scroll-mt-28 border-t border-line">
      {/* Spine marker: lights up as the drawn spine reaches this role */}
      <span aria-hidden="true" className="absolute -left-7 top-[2.45rem] -translate-x-1/2 lg:-left-12">
        <motion.span
          className={`block h-2.5 w-2.5 border transition-[background-color,border-color,box-shadow] duration-500 ${
            lit ? "border-accent bg-accent" : "border-faint bg-canvas"
          }`}
          initial={false}
          animate={{ scale: lit ? 1 : 0.7 }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </span>
      <motion.div
        className="grid gap-4 py-8 md:grid-cols-12 md:gap-6"
        initial={{ opacity: 0, x: -28 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="md:col-span-4">
          <p className="font-mono text-small text-ink">{formatRange(job)}</p>
          {duration && <p className="mt-1 font-mono text-meta text-muted">{duration}</p>}
          {job.current && (
            <span className="tag mt-3 border-accent/60 text-accent">
              <span aria-hidden="true">/</span> Current
            </span>
          )}
        </div>

        <div className="md:col-span-8">
          <div className="flex items-start gap-4">
            <CompanyMark job={job} />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[1.75rem]">{job.jobTitle}</h3>
              <p className="mt-1 text-[0.95rem] text-muted">
                {job.company.url ? (
                  <a
                    href={job.company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline inline-flex items-center gap-1 text-ink/90 hover:text-ink"
                  >
                    {job.company.name}
                    <FiArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <span className="text-ink/90">{job.company.name}</span>
                )}
                {meta && <span className="text-faint"> / {meta}</span>}
              </p>
            </div>
          </div>

          {job.summary && <p className="mt-5 max-w-prose leading-relaxed text-muted">{job.summary}</p>}

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="tap group mt-5 inline-flex items-center gap-2 font-mono text-small text-ink/90 transition-colors hover:text-accent"
          >
            <FiPlus
              aria-hidden="true"
              className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
            />
            {open ? "Hide details" : "Responsibilities & stack"}
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={panelId}
                key="panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="pt-5">
                  {job.highlights?.length ? (
                    <ul className="space-y-2.5">
                      {job.highlights.map((h) => (
                        <li key={h} className="flex gap-3 leading-relaxed text-ink/90">
                          <span aria-hidden="true" className="mt-[0.75em] h-px w-3 shrink-0 bg-accent" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <TechList items={job.technologies} className="mt-5" />
                  {job.note && <p className="mt-4 text-sm text-muted">{job.note}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </li>
  );
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Start year of the role being read, rolling as the reader moves through the
 * list. Every label is arithmetic on YAML dates: "year N" counts calendar
 * years from the first role, and open-ended roles never claim "now".
 */
const YearInView: React.FC<{ jobs: JobType[]; activeId: string | null; firstYear: number }> = ({ jobs, activeId, firstYear }) => {
  const index = Math.max(0, jobs.findIndex((j) => j.id === activeId));
  const job = jobs[index];
  if (!job) return null;
  const year = parseYearMonth(job.fromDate).year;
  const status = job.current ? "to now" : job.toDate ? `to ${parseYearMonth(job.toDate).year}` : "start date only";
  return (
    <div className="mb-6 border-b border-line pb-5">
      <p className="flex items-baseline justify-between font-mono text-label uppercase tracking-[0.05em] text-muted">
        <span>Role in view</span>
        <span className="tabular-nums">
          <span className="text-accent">{pad(index + 1)}</span> / {pad(jobs.length)}
        </span>
      </p>
      <p className="display mt-3 text-[5.5rem] text-ink xl:text-[7rem]">
        <YearOdometer value={String(year)} />
      </p>
      <p className="mt-3 flex flex-wrap gap-x-3 font-mono text-label uppercase tracking-[0.05em] text-muted">
        <span>Year {year - firstYear + 1} of career</span>
        <span aria-hidden="true" className="text-faint">/</span>
        <span>{status}</span>
      </p>
      <p className="mt-1.5 truncate text-[0.95rem] text-ink">
        {job.jobTitle} <span className="text-muted">/ {job.company.name}</span>
      </p>
    </div>
  );
};

export const Experience: React.FC<{ jobs: JobType[]; linkedin: string | null }> = ({ jobs, linkedin }) => {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(jobs.slice(0, 2).map((j) => j.id)));
  const [activeId, setActiveId] = useState<string | null>(null);
  const { now } = useSiteData();
  const earliest = [...jobs].sort((a, b) => a.fromDate.localeCompare(b.fromDate))[0];
  const years = earliest ? yearsSince(earliest.fromDate, now) : 0;
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 60%", "end 60%"] });
  const drawn = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 120, damping: 30 });

  // Follow the role being read: the index row and axis cursor track it.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = jobs.map((j) => document.getElementById(`role-${j.id}`)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveId(e.target.id.replace(/^role-/, ""));
      },
      { rootMargin: "-38% 0px -58% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [jobs]);

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const select = (id: string) => {
    setActiveId(id);
    setOpenIds((prev) => new Set(prev).add(id));
    document.getElementById(`role-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="experience" aria-labelledby="experience-title" className="container-site relative isolate scroll-mt-20 pt-20 md:pt-28">
      <SectionHeader
        index="02"
        eyebrow="Experience"
        id="experience-title"
        title="Experience"
        note={
          <>
            <CountUp value={years} />+ yrs / product, platform, data
          </>
        }
        lead="From React and React Native interfaces to AI platforms, blockchain tooling and backend systems. The most recent work is open below; every role expands to show responsibilities and stack."
      />

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:top-28 lg:[@media(min-height:800px)]:sticky">
            <Reveal className="hidden lg:block">
              <YearInView
                jobs={jobs}
                activeId={activeId}
                firstYear={earliest ? parseYearMonth(earliest.fromDate).year : 0}
              />
            </Reveal>
            <Reveal>
              <CareerTimeline jobs={jobs} activeId={activeId} onSelect={select} />
            </Reveal>
            <Reveal delay={0.1} className="mt-6 flex flex-wrap gap-3">
              <ArrowLink to="/resume/" variant="ghost">
                Résumé
              </ArrowLink>
              {linkedin && (
                <ArrowLink to={linkedin} variant="text" className="px-3 py-3">
                  LinkedIn
                </ArrowLink>
              )}
            </Reveal>
          </div>
        </div>

        <ol ref={listRef} className="relative pl-7 lg:col-span-8 lg:pl-12">
          <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-line" />
          <motion.span
            aria-hidden="true"
            style={{ scaleY: reduce ? 1 : drawn }}
            className="absolute bottom-0 left-0 top-0 w-px origin-top bg-accent"
          />
          {jobs.map((job) => (
            <Role key={job.id} job={job} open={openIds.has(job.id)} onToggle={() => toggle(job.id)} />
          ))}
        </ol>
      </div>
    </section>
  );
};
