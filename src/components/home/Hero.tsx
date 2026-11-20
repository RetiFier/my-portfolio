import React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ProfileType } from "../../@types/about";
import { JobType } from "../../@types/job";
import { yearsSince, formatYearMonth } from "../../utils/dates";
import { ArrowLink } from "../ui/ArrowLink";
import { useSiteData } from "../../hooks/useSiteData";
import { CountUp, Marquee, ScrambleText, SplitText, SystemField } from "../motion";

interface HeroProps {
  profile: ProfileType;
  jobs: JobType[];
  /** Number of featured independent systems, from project.yaml. */
  productCount: number;
}

const delay = (ms: number): React.CSSProperties => ({ animationDelay: `${ms}ms` });

const HEADLINE = "Engineering software from architecture to production.";

export const Hero: React.FC<HeroProps> = ({ profile, jobs, productCount }) => {
  const { now } = useSiteData();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  // Only an inner wrapper moves; the #hero section itself is never transformed.
  const headY = useTransform(scrollY, [0, 700], reduce ? [0, 0] : [0, -60]);
  const headOpacity = useTransform(scrollY, [0, 650], reduce ? [1, 1] : [1, 0.25]);

  const years = profile.careerStart ? yearsSince(profile.careerStart, now) : null;
  const since = profile.careerStart ? formatYearMonth(profile.careerStart).split(" ")[1] : null;
  const current = jobs.find((j) => j.current);
  const previous = [...jobs]
    .filter((j) => j.toDate)
    .sort((a, b) => (b.toDate as string).localeCompare(a.toDate as string))[0];

  const stats = [
    years !== null && { value: years, suffix: "+", label: "Years engineering", detail: since ? `since ${since}` : "" },
    { value: jobs.length, suffix: "", label: "Roles", detail: "full-time, contract, freelance" },
    productCount > 0 && { value: productCount, suffix: "", label: "Independent systems", detail: "designed and built end to end" },
    profile.skillGroups?.length && { value: profile.skillGroups.length, suffix: "", label: "Capability areas", detail: "frontend to infrastructure" },
  ].filter(Boolean) as Array<{ value: number; suffix: string; label: string; detail: string }>;

  const tickerItems = Array.from(new Set((profile.skillGroups ?? []).flatMap((g) => g.items ?? [])));
  const build = now.toISOString().slice(0, 10).replace(/-/g, ".");

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative isolate overflow-hidden pt-24 md:pt-32">
      <div
        aria-hidden="true"
        className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />

      <div className="container-site relative">
        <div className="rise flex flex-wrap items-center justify-between gap-3 font-mono text-meta uppercase tracking-[0.05em] text-muted" style={delay(0)}>
          {profile.availability && (
            <p className="tag normal-case tracking-normal">
              <span aria-hidden="true" className="text-accent">
                /
              </span>
              <ScrambleText text={profile.availability} trigger="mount" delay={250} duration={900} />
            </p>
          )}
          <p className="text-faint" aria-hidden="true">
            build {build}
          </p>
        </div>

        <motion.div style={{ y: headY, opacity: headOpacity }}>
          <h1 id="hero-title" className="mt-10 md:mt-14">
            <span className="rise eyebrow block text-muted" style={delay(60)}>
              {profile.fname} {profile.lname} <span className="text-faint">/</span> {profile.profession}
            </span>
            <span className="sr-only">: </span>
            <span className="display mt-5 block text-[9.2vw] text-ink sm:text-[8.6vw] lg:text-[5.4rem] xl:text-[6.4rem]">
              <SplitText text={HEADLINE} mode="css" delay={0.12} stagger={0.016} />
              <span
                aria-hidden="true"
                className="caret rise ml-[0.08em] inline-block h-[0.72em] w-[0.38em] bg-accent align-baseline"
                style={delay(1100)}
              />
            </span>
          </h1>
        </motion.div>

        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            {profile.intro && (
              <p className="rise max-w-[34rem] text-lg leading-relaxed text-muted sm:text-xl" style={delay(700)}>
                {profile.intro}
              </p>
            )}

            <div className="rise mt-9 flex flex-wrap items-center gap-3" style={delay(800)}>
              <ArrowLink to="#work" variant="primary">
                Explore work
              </ArrowLink>
              <ArrowLink to="#experience" variant="ghost">
                Experience
              </ArrowLink>
              <ArrowLink to="#contact" variant="text" className="px-3 py-3">
                Get in touch
              </ArrowLink>
            </div>

            <dl className="rise mt-10 space-y-2 border-l border-line pl-4 font-mono text-meta" style={delay(900)}>
              {current && (
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-accent">now</dt>
                  <dd className="text-ink">
                    {current.jobTitle} <span className="text-faint">/ {current.employmentType}</span>
                  </dd>
                </div>
              )}
              {previous && (
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-faint">prev</dt>
                  <dd className="text-muted">
                    {previous.jobTitle} <span className="text-faint">/ {previous.company.name}</span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rise lg:col-span-7" style={delay(500)}>
            <SystemField />
          </div>
        </div>

        <dl className="relative mt-16 grid grid-cols-2 md:mt-20 lg:grid-cols-4">
          <span aria-hidden="true" className="draw-x absolute inset-x-0 top-0 h-px bg-line" style={delay(900)} />
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`rise flex flex-col border-line py-7 pr-4 ${i % 2 === 1 ? "border-l pl-4 sm:pl-6" : ""} ${
                i > 1 ? "border-t lg:border-t-0" : ""
              } ${i === 2 ? "lg:border-l lg:pl-6" : ""}`}
              style={delay(1000 + i * 90)}
            >
              <dt className="eyebrow order-2 mt-4">
                <ScrambleText text={s.label} trigger="mount" delay={1100 + i * 120} />
              </dt>
              <dd className="display order-1 text-6xl text-ink sm:text-7xl">
                <CountUp value={s.value} delay={1 + i * 0.1} maxStartMs={2500} />
                {s.suffix}
              </dd>
              {s.detail && <dd className="order-3 mt-1 font-mono text-meta text-faint">{s.detail}</dd>}
            </div>
          ))}
        </dl>
      </div>

      {tickerItems.length > 0 && (
        <Marquee
          items={tickerItems}
          className="border-y border-line py-4 font-mono text-meta uppercase tracking-[0.06em] text-muted"
        />
      )}
    </section>
  );
};
