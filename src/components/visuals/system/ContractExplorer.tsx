import React, { useState } from "react";
import { Figure, Segmented } from "./Figure";

/**
 * Interactive version of Synthetic Instinct's action rule. The logic below is
 * the system's own `evaluateCandidate` branch, reproduced exactly:
 *
 *   INVALID data or a failed authoritative gate      -> BLOCK
 *   DEGRADED data and an AUTO / MICRO_AUTO request   -> MANUAL
 *   otherwise                                        -> the requested action
 *
 * Failed advisory gates only add reason codes. Gate codes are shown as
 * placeholders; the real codes are not published.
 */

const QUALITY = ["VALID", "DEGRADED", "INVALID"] as const;
const GATE = ["pass", "fail"] as const;
const REQUESTED = ["WATCH", "MANUAL", "MICRO_AUTO", "AUTO"] as const;

type Quality = (typeof QUALITY)[number];
type Gate = (typeof GATE)[number];
type Requested = (typeof REQUESTED)[number];

const resolve = (q: Quality, auth: Gate, requested: Requested) => {
  if (q === "INVALID" || auth === "fail") return { action: "BLOCK", line: 0 } as const;
  if (q === "DEGRADED" && (requested === "AUTO" || requested === "MICRO_AUTO")) return { action: "MANUAL", line: 1 } as const;
  return { action: requested, line: 2 } as const;
};

const explain = (q: Quality, auth: Gate, adv: Gate, requested: Requested, action: string) => {
  if (action === "BLOCK") {
    const why = [q === "INVALID" && "the data is invalid", auth === "fail" && "an authoritative gate failed"].filter(Boolean).join(" and ");
    return `Blocked because ${why}. The requested ${requested} does not matter: nothing downstream may act on it.`;
  }
  if (action !== requested) return `Degraded data cannot keep an automatic action, so ${requested} is reduced to manual review.`;
  if (adv === "fail") return `The advisory gate failure is recorded as a reason code, but advisory gates never block. ${requested} stands.`;
  return `Data is ${q.toLowerCase()} and every gate passed, so the strategy's ${requested} request stands.`;
};

const CODE = [
  ["if", "(data == INVALID || authoritativeFailed)", "→ BLOCK"],
  ["else if", "(data == DEGRADED && requested ∈ {AUTO, MICRO_AUTO})", "→ MANUAL"],
  ["else", "", "→ requested"],
] as const;

export const ContractExplorer: React.FC = () => {
  const [quality, setQuality] = useState<Quality>("DEGRADED");
  const [auth, setAuth] = useState<Gate>("pass");
  const [adv, setAdv] = useState<Gate>("fail");
  const [requested, setRequested] = useState<Requested>("AUTO");

  const { action, line } = resolve(quality, auth, requested);
  const reasons = [
    quality === "INVALID" && { code: "DATA_INVALID", real: true },
    quality === "DEGRADED" && { code: "DATA_DEGRADED", real: true },
    auth === "fail" && { code: "authoritative gate code", real: false },
    adv === "fail" && { code: "advisory gate code", real: false },
  ].filter(Boolean) as Array<{ code: string; real: boolean }>;
  const automatic = action === "AUTO" || action === "MICRO_AUTO";

  return (
    <Figure
      title="candidate contract"
      meta="evaluate(candidate) → action"
      label="Interactive decision contract: choose data quality, gate results and the requested action to see the resolved action tier."
      caption="Interactive. The rule is the system's own action rule, reproduced exactly; gate codes are placeholders."
    >
      <div className="grid gap-px bg-line md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* inputs */}
        <div className="space-y-5 bg-surface p-4 sm:p-5">
          <Segmented label="Data quality" options={QUALITY} value={quality} onChange={setQuality} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Segmented label="Authoritative gates" options={GATE} value={auth} onChange={setAuth} />
            <Segmented label="Advisory gates" options={GATE} value={adv} onChange={setAdv} />
          </div>
          <Segmented label="Strategy requests" options={REQUESTED} value={requested} onChange={setRequested} />
        </div>

        {/* result */}
        <div className="flex flex-col bg-canvas/60 p-4 sm:p-5">
          <p className="font-mono text-label uppercase tracking-[0.05em] text-muted">Resolved action</p>
          <p aria-live="polite" className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {action !== requested && action !== "BLOCK" && (
              <s className="font-mono text-xl text-faint">{requested}</s>
            )}
            <span
              className={`font-mono text-3xl font-medium tracking-[-0.01em] sm:text-4xl ${
                action === "BLOCK" ? "text-muted" : automatic ? "text-accent" : "text-ink"
              }`}
            >
              {action}
            </span>
          </p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{explain(quality, auth, adv, requested, action)}</p>

          <div className="mt-5">
            <p className="font-mono text-label uppercase tracking-[0.05em] text-muted">Reason codes</p>
            <ul className="mt-2 flex min-h-[1.9rem] flex-wrap gap-1.5">
              {reasons.length === 0 ? (
                <li className="font-mono text-meta text-muted">none</li>
              ) : (
                reasons.map((r) => (
                  <li
                    key={r.code}
                    className={`border px-1.5 py-1 font-mono text-label leading-none ${
                      r.real ? "border-faint uppercase text-ink" : "border-dashed border-line italic text-muted"
                    }`}
                  >
                    {r.code}
                  </li>
                ))
              )}
            </ul>
          </div>

          <ol className="mt-5 border-t border-line pt-3 font-mono text-label leading-relaxed sm:text-meta">
            {CODE.map(([kw, cond, out], i) => (
              <li
                key={kw}
                className={`-mx-2 flex flex-wrap gap-x-1.5 px-2 py-1 transition-colors duration-300 ${
                  i === line ? "bg-ink/[0.07] text-ink" : "text-muted"
                }`}
              >
                <span className={i === line ? "text-accent" : ""}>{kw}</span>
                {cond && <span className="min-w-0 break-words">{cond}</span>}
                <span className={i === line ? "text-ink" : ""}>{out}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Figure>
  );
};
