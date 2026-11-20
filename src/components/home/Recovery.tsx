import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { FiCode } from "react-icons/fi";
import { ProfileType } from "../../@types/about";
import { EASE } from "../../utils/animations";
import { Reveal } from "../ui/Reveal";
import { explore } from "../../hooks/useExplore";
import {
  BROKEN,
  isReady,
  Level,
  MEMORY_LIMIT_MIB,
  Phase,
  reconcile,
  Scenario,
  ScenarioId,
  SCENARIOS,
  STABLE,
  trafficTick,
} from "./recoverySequence";
import source from "./recoverySequence.ts?raw";

interface LogLine {
  id: number;
  time: string;
  level: Level;
  source: string;
  msg: string;
}

interface Report {
  id: string;
  scenario: Scenario;
  detectedMs: number;
  downtimeMs: number;
  failed: number;
  restarts: number;
}

interface Tick {
  total: number;
  errors: number;
}

const TICK_MS = 45;
const TRAFFIC_MS = 500;
const BARS = 48;
const GLYPHS = "#$%&*+=?@01<>/\\{}[]";

/** Recovery track: what the reader sees the supervisor walk through. */
const TRACK: Array<{ label: string; phases: Phase[] }> = [
  { label: "Detect", phases: ["degraded"] },
  { label: "Down", phases: ["down"] },
  { label: "Recover", phases: ["restarting", "rollback"] },
  { label: "Reconcile", phases: ["reconciling"] },
  { label: "Ready", phases: ["healthy"] },
];

const pad = (n: number, w = 2) => String(n).padStart(w, "0");
const clock = () => new Date().toISOString().slice(11, 23);
const fmtUptime = (s: number) => `${pad(Math.floor(s / 60) % 100)}:${pad(s % 60)}`;

/** Small seeded PRNG so the first traffic history is identical on server and client. */
const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const initialTraffic = (): Tick[] => {
  const rand = seeded(7);
  return Array.from({ length: BARS }, () => trafficTick("running", rand));
};

/**
 * "Own it in production" as a working incident: the heading is the service.
 * Pick a failure (kill -9, out of memory, bad deploy) and the supervisor walks
 * it through detection, restart or rollback, state restore and readiness,
 * with logs, simulated traffic and an incident report at the end. Scenarios
 * live in ./recoverySequence.ts, which "View source" shows verbatim. The
 * heading text is in the document once (sr-only); visible letters are glyphs.
 */
export const Recovery: React.FC<{ principles: ProfileType["principles"] }> = ({ principles }) => {
  const principleIndex = principles?.findIndex((p) => /production/i.test(p.title)) ?? -1;
  const principle = principleIndex >= 0 ? principles?.[principleIndex] : undefined;
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useInView(sectionRef, { margin: "200px 0px 200px 0px" });

  const [phase, setPhase] = useState<Phase>("running");
  const [scenario, setScenario] = useState<ScenarioId | null>(null);
  const [restored, setRestored] = useState(0);
  const [scatter, setScatter] = useState<Array<{ x: number; y: number; r: number }>>([]);
  const [noise, setNoise] = useState(0);
  const [log, setLog] = useState<LogLine[]>([]);
  const [traffic, setTraffic] = useState<Tick[]>(initialTraffic);
  const [memory, setMemory] = useState(176);
  const [version, setVersion] = useState(STABLE);
  const [pid, setPid] = useState(4821);
  const [, setRestarts] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [showSource, setShowSource] = useState(false);

  const timers = useRef<number[]>([]);
  const phaseRef = useRef<Phase>("running");
  const scenarioRef = useRef<ScenarioId | null>(null);
  const pidRef = useRef(4821);
  const versionRef = useRef(STABLE);
  const upSince = useRef(0);
  const started = useRef(0);
  const firstAlert = useRef<number | null>(null);
  const downAt = useRef<number | null>(null);
  const failed = useRef(0);
  const restartsInIncident = useRef(0);
  const logId = useRef(0);
  const logEnd = useRef<HTMLOListElement>(null);

  const [heading, rest] = useMemo(() => {
    const text = principle?.text ?? "";
    const i = text.indexOf(". ");
    return i === -1 ? [text, ""] : [text.slice(0, i + 1), text.slice(i + 2)];
  }, [principle]);
  const words = heading.split(" ");
  const committed = heading.replace(/ /g, "").length;
  const up = phase === "running" || phase === "healthy";
  const busy = scenario !== null;

  const go = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  // Uptime of the current process.
  useEffect(() => {
    if (!up) return;
    if (!upSince.current) upSince.current = performance.now();
    const tick = () => setUptime(Math.floor((performance.now() - upSince.current) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [up]);

  // Simulated traffic and memory, only while the section is near the viewport.
  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => {
      const t = trafficTick(phaseRef.current, Math.random);
      if (scenarioRef.current) failed.current += t.errors;
      setTraffic((prev) => [...prev.slice(1 - BARS), t]);
      setMemory((m) => {
        if (scenarioRef.current === "oom" && phaseRef.current === "degraded")
          return Math.min(MEMORY_LIMIT_MIB, m + (MEMORY_LIMIT_MIB - m) * 0.35 + 12);
        if (phaseRef.current === "down" || phaseRef.current === "restarting") return 0;
        return Math.round(Math.max(150, Math.min(205, (m || 160) + (Math.random() - 0.5) * 10)));
      });
    }, TRAFFIC_MS);
    return () => window.clearInterval(id);
  }, [visible]);

  // Visual noise for degraded states (memory jitter, corrupted render).
  useEffect(() => {
    if (phase !== "degraded" || reduce) return;
    const id = window.setInterval(() => setNoise((n) => n + 1), 110);
    return () => window.clearInterval(id);
  }, [phase, reduce]);

  useEffect(() => {
    logEnd.current?.scrollTo({ top: logEnd.current.scrollHeight });
  }, [log]);

  if (!principle || !heading) return null;

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  const push = (level: Level, src: string, msg: string) => {
    if (level !== "INFO" && firstAlert.current === null) firstAlert.current = performance.now() - started.current;
    setLog((l) => [...l.slice(-40), { id: logId.current++, time: clock(), level, source: src, msg }]);
  };

  const trigger = (s: Scenario) => {
    if (busy) return;
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    started.current = performance.now();
    firstAlert.current = null;
    downAt.current = null;
    failed.current = 0;
    restartsInIncident.current = 0;
    scenarioRef.current = s.id;
    setScenario(s.id);
    setReport(null);
    setRestored(0);
    setScatter(
      Array.from({ length: committed }, () => ({
        x: (Math.random() - 0.5) * 160,
        y: 40 + Math.random() * 220,
        r: (Math.random() - 0.5) * 120,
      })),
    );

    s.steps.forEach((step) =>
      later(step.at, () => {
        if (step.effect === "newPid") {
          pidRef.current = 4000 + Math.floor(Math.random() * 5000);
          setPid(pidRef.current);
          restartsInIncident.current += 1;
          setRestarts((n) => n + 1);
        }
        if (step.effect === "memoryReset") setMemory(150);
        if (step.effect === "badVersion") {
          versionRef.current = BROKEN;
          setVersion(BROKEN);
        }
        if (step.effect === "goodVersion") {
          versionRef.current = STABLE;
          setVersion(STABLE);
          pidRef.current = 4000 + Math.floor(Math.random() * 5000);
          setPid(pidRef.current);
        }
        if (step.phase) {
          if (step.phase === "down" && downAt.current === null) downAt.current = performance.now();
          go(step.phase);
        }
        push(step.level, step.source, step.msg({ pid: pidRef.current, chars: committed, version: versionRef.current }));
      }),
    );

    const last = s.steps[s.steps.length - 1].at;
    let n = 0;
    const tick = () => {
      const r = reconcile(n, committed);
      n = r.restored;
      setRestored(n);
      if (!r.done) later(TICK_MS, tick);
      else
        later(250, () => {
          if (!isReady(n, committed)) return;
          push("INFO", "probe", "readiness probe passed, traffic resumed");
          upSince.current = performance.now();
          setUptime(0);
          go("healthy");
          const now = performance.now();
          setReport({
            id: `INC-${pad(Math.floor(Math.random() * 9000) + 1000, 4)}`,
            scenario: s,
            detectedMs: firstAlert.current ?? 0,
            downtimeMs: downAt.current ? now - downAt.current : 0,
            failed: failed.current,
            restarts: restartsInIncident.current,
          });
          scenarioRef.current = null;
          setScenario(null);
          explore.unlock("recover");
        });
    };
    later(last + 300, tick);
  };

  // Readouts derived from the simulation.
  const recent = traffic.slice(-10);
  const sum = recent.reduce((a, t) => ({ total: a.total + t.total, errors: a.errors + t.errors }), { total: 0, errors: 0 });
  const errorRate = sum.total ? (sum.errors / sum.total) * 100 : 0;
  const peak = Math.max(30, ...traffic.map((t) => t.total));
  const activeTrack = TRACK.findIndex((t) => t.phases.includes(phase));
  const scatteredPhase = phase === "down" || phase === "restarting" || phase === "rollback" || phase === "reconciling";
  let charIndex = 0;

  return (
    <section ref={sectionRef} aria-labelledby="recovery-title" className="container-site relative scroll-mt-20 pt-28 md:pt-40">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Statement + controls */}
        <div className="lg:col-span-6 xl:col-span-7">
          <Reveal>
            <p className="eyebrow flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="tag tabular-nums">
                <span className="text-accent">{pad(principleIndex + 1)}</span>
                <span className="text-faint">/</span>
                <span>{pad(principles?.length ?? 0)}</span>
              </span>
              <span>Principle / {principle.title}</span>
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="recovery-title" className="display mt-6 text-[clamp(2.75rem,11vw,4.5rem)] text-ink lg:text-[4.6rem] xl:text-[6.2rem]">
              <span className="sr-only">{heading}</span>
              <span aria-hidden="true">
                {words.map((word, w) => (
                  <React.Fragment key={w}>
                    {w > 0 && " "}
                    <span className="inline-block whitespace-nowrap">
                      {word.split("").map((ch) => {
                        const i = charIndex++;
                        const lost = scatteredPhase && i >= restored;
                        const s = scatter[i];
                        const corrupt = phase === "degraded" && scenario === "deploy" && (i * 7 + noise) % 5 === 0;
                        const jitter =
                          phase === "degraded" && scenario === "oom" && !reduce
                            ? `translate(${((i * 13 + noise * 7) % 7) - 3}px, ${((i * 11 + noise * 5) % 7) - 3}px)`
                            : null;
                        return (
                          <span
                            key={i}
                            data-g={corrupt ? GLYPHS[(i + noise) % GLYPHS.length] : ch}
                            className={`glyph inline-block will-change-transform ${lost ? "pointer-events-none text-faint/40" : ""} ${
                              corrupt || (i === restored - 1 && phase === "reconciling") ? "text-accent" : ""
                            }`}
                            style={{
                              transform: lost && s && !reduce ? `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg)` : jitter ?? "none",
                              transition: lost
                                ? "transform 0.9s cubic-bezier(0.55, 0, 0.9, 0.4), color 0.3s"
                                : jitter
                                  ? "none"
                                  : "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s",
                            }}
                          />
                        );
                      })}
                    </span>
                  </React.Fragment>
                ))}
              </span>
            </h2>
          </Reveal>
          {rest && (
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted">{rest}</p>
            </Reveal>
          )}

          <Reveal delay={0.15} className="mt-8">
            <p className="font-mono text-label uppercase tracking-[0.05em] text-muted">Trigger an incident</p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Incident scenarios">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => trigger(s)}
                  disabled={busy}
                  aria-pressed={scenario === s.id}
                  className={`inline-flex min-h-[2.75rem] items-center gap-2 border px-4 py-2.5 font-mono text-meta transition-colors disabled:cursor-wait ${
                    scenario === s.id ? "border-accent bg-accent text-canvas" : "border-line text-ink hover:border-ink disabled:opacity-50"
                  }`}
                >
                  <span aria-hidden="true" className={scenario === s.id ? "text-canvas/70" : "text-faint"}>
                    $
                  </span>
                  {s.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowSource((v) => !v)}
                aria-expanded={showSource}
                aria-controls="recovery-source"
                className="inline-flex min-h-[2.75rem] items-center gap-2 px-3 py-2.5 font-mono text-meta text-muted transition-colors hover:text-ink"
              >
                <FiCode aria-hidden="true" className="h-4 w-4" />
                {showSource ? "Hide source" : "View source"}
              </button>
            </div>
            <p className="mt-4 max-w-[34rem] text-[0.95rem] leading-relaxed text-muted">
              The heading is the service. Break it the way production breaks, and watch detection, restart or rollback,
              state restore and the readiness check play out, then read the incident report.
            </p>
          </Reveal>
        </div>

        {/* Service dashboard */}
        <Reveal delay={0.1} className="lg:col-span-6 lg:self-end xl:col-span-5">
          <div className="border border-line bg-surface/70">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <p className="font-mono text-label uppercase tracking-[0.05em] text-ink">
                heading.service <span className="text-faint">/ pid {pid}</span>
              </p>
              <span
                aria-live="polite"
                className={`px-1.5 py-0.5 font-mono text-label uppercase tracking-[0.05em] ${
                  phase === "down" ? "bg-accent text-canvas" : up ? "bg-ink text-canvas" : "border border-accent text-accent"
                }`}
              >
                {phase === "running" ? "healthy" : phase}
              </span>
            </div>

            <dl className="grid grid-cols-2 border-b border-line sm:grid-cols-4">
              {[
                { k: "Uptime", v: up ? fmtUptime(uptime) : "--:--", warn: false },
                { k: "Version", v: version, warn: version === BROKEN },
                { k: "Memory", v: memory ? `${Math.round(memory)} MiB` : "--", warn: memory > MEMORY_LIMIT_MIB * 0.8 },
                { k: "Errors", v: `${errorRate.toFixed(1)}%`, warn: errorRate > 5 },
              ].map((m, i) => (
                <div
                  key={m.k}
                  className={`min-w-0 border-line px-4 py-3 ${i % 2 === 1 ? "border-l" : ""} ${i > 1 ? "border-t sm:border-t-0" : ""} ${
                    i === 2 ? "sm:border-l" : ""
                  }`}
                >
                  <dt className="font-mono text-label uppercase tracking-[0.05em] text-muted">{m.k}</dt>
                  <dd className={`mt-1 truncate font-mono text-base tabular-nums ${m.warn ? "text-accent" : "text-ink"}`}>{m.v}</dd>
                </div>
              ))}
            </dl>

            {/* Traffic */}
            <div className="border-b border-line px-4 py-4">
              <div className="flex items-baseline justify-between gap-3 font-mono text-label uppercase tracking-[0.05em] text-muted">
                <span>Requests / 500ms</span>
                <span className="flex gap-3">
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="h-2 w-2 bg-ink/70" /> ok
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="h-2 w-2 bg-accent" /> failed
                  </span>
                </span>
              </div>
              <svg aria-hidden="true" viewBox={`0 0 ${BARS * 4} 48`} preserveAspectRatio="none" className="mt-3 block h-14 w-full">
                {traffic.map((t, i) => {
                  const h = (t.total / peak) * 46;
                  const e = (t.errors / peak) * 46;
                  return (
                    <g key={i}>
                      <rect x={i * 4} y={48 - h} width={3} height={Math.max(0, h - e)} className="fill-ink/60" />
                      {e > 0 && <rect x={i * 4} y={48 - e} width={3} height={e} className="fill-accent" />}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Recovery track */}
            <ol aria-label="Recovery steps" className="grid grid-cols-5 gap-x-1.5 px-4 py-4">
              {TRACK.map((t, i) => {
                const active = i === activeTrack && phase !== "running";
                const done = phase !== "running" && activeTrack > i;
                return (
                  <li key={t.label} aria-current={active ? "step" : undefined} className="min-w-0">
                    <span
                      aria-hidden="true"
                      className={`block h-[3px] transition-colors duration-300 ${
                        active ? (t.label === "Ready" ? "bg-ink" : "bg-accent") : done ? "bg-ink/70" : "bg-line"
                      }`}
                    />
                    <span
                      className={`mt-2 block truncate font-mono text-label uppercase transition-colors ${
                        active ? "text-ink" : done ? "text-muted" : "text-faint"
                      }`}
                    >
                      {t.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </Reveal>
      </div>

      {/* Logs + incident report */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <div className="border border-line bg-surface/70">
            <p className="flex items-center justify-between border-b border-line px-4 py-3 font-mono text-label uppercase tracking-[0.05em] text-muted">
              <span className="text-ink">Logs</span>
              <span>tail -f / UTC</span>
            </p>
            <ol ref={logEnd} aria-label="Service logs" className="h-[15rem] space-y-1 overflow-y-auto px-4 py-3 font-mono text-meta leading-snug">
              {log.length === 0 ? (
                <li className="text-muted">
                  <span className="text-faint">$</span> waiting for events. Trigger an incident to see the supervisor work.
                </li>
              ) : (
                log.map((l) => (
                  <motion.li
                    key={l.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-[6.25rem_3.25rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[6.25rem_3.25rem_5.5rem_minmax(0,1fr)]"
                  >
                    <span className="tabular-nums text-faint">{l.time}</span>
                    <span className={l.level === "ERROR" ? "text-accent" : l.level === "WARN" ? "text-ink" : "text-muted"}>{l.level}</span>
                    <span className="hidden text-muted sm:block">{l.source}</span>
                    <span className={`col-span-3 break-words sm:col-span-1 ${l.level === "ERROR" ? "text-accent" : "text-ink/90"}`}>
                      <span className="text-muted sm:hidden">{l.source}: </span>
                      {l.msg}
                    </span>
                  </motion.li>
                ))
              )}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={0.05} className="lg:col-span-5">
          <div className="h-full border border-line bg-surface/70">
            <p className="flex items-center justify-between border-b border-line px-4 py-3 font-mono text-label uppercase tracking-[0.05em] text-muted">
              <span className="text-ink">Incident report</span>
              <span>{report ? `${report.id} / resolved` : "none open"}</span>
            </p>
            {report ? (
              <motion.dl
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 px-4 py-4 text-[0.95rem] sm:grid-cols-[7.5rem_minmax(0,1fr)]"
              >
                {[
                  ["Trigger", `$ ${report.scenario.label}`],
                  ["Cause", report.scenario.cause],
                  ["Detected", `${(report.detectedMs / 1000).toFixed(2)}s after start`],
                  ["Downtime", `${(report.downtimeMs / 1000).toFixed(2)}s`],
                  ["Failed reqs", `${report.failed} (simulated)`],
                  ["Restarts", String(report.restarts)],
                  ["Mitigation", report.scenario.mitigation],
                  ["Follow-up", report.scenario.followUp],
                ].map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt className="font-mono text-label uppercase leading-6 tracking-[0.05em] text-muted">{k}</dt>
                    <dd className="leading-6 text-ink">{v}</dd>
                  </React.Fragment>
                ))}
              </motion.dl>
            ) : (
              <p className="px-4 py-4 text-[0.95rem] leading-relaxed text-muted">
                Every incident ends with a short report: what broke, how fast it was detected, how long it was down, what
                fixed it and what should change so it does not happen again.
              </p>
            )}
          </div>
        </Reveal>
      </div>

      <p className="mt-4 font-mono text-label uppercase tracking-[0.05em] text-faint">
        Simulation in your browser. No real servers, users or traffic are involved.
      </p>

      <AnimatePresence initial={false}>
        {showSource && (
          <motion.div
            id="recovery-source"
            key="source"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-6 border border-line bg-surface">
              <p className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-3 font-mono text-label uppercase tracking-[0.05em] text-muted">
                <span className="break-all text-ink">src/components/home/recoverySequence.ts</span>
                <span>the code running this demo</span>
              </p>
              <pre className="max-h-[28rem] overflow-auto px-4 py-4 font-mono text-meta leading-relaxed text-ink/90">
                <code>
                  {source
                    .replace(/\r\n/g, "\n")
                    .trimEnd()
                    .split("\n")
                    .map((line, i) => (
                      <span key={i} className="grid grid-cols-[2.5rem_1fr]">
                        <span aria-hidden="true" className="select-none text-faint">
                          {i + 1}
                        </span>
                        <span className={/^\s*(\/\/|\/\*|\*)/.test(line) ? "text-muted" : undefined}>{line || " "}</span>
                      </span>
                    ))}
                </code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
