import React, { useEffect, useMemo, useRef, useState } from "react";
import { graphql, HeadFC, navigate, PageProps, useStaticQuery } from "gatsby";
import { Layout } from "../components/Layout";
import { Seo } from "../components/Seo";
import { ArrowLink } from "../components/ui/ArrowLink";
import { YearOdometer } from "../components/motion";
import { useSiteData } from "../hooks/useSiteData";
import { downloadResume } from "../theme/resume";
import { navSections } from "../theme/navSections";

type Line = { kind: "in" | "out" | "err" | "dim" | "link"; text: string; href?: string };

const COMMANDS: Array<{ name: string; help: string }> = [
  { name: "help", help: "list commands" },
  { name: "ls", help: "list every page on this site" },
  { name: "open", help: "open <path>, e.g. open /resume/" },
  { name: "whoami", help: "who built this" },
  { name: "resume", help: "open the résumé (resume --pdf downloads it)" },
  { name: "contact", help: "how to reach me" },
  { name: "home", help: "back to the portfolio" },
  { name: "clear", help: "clear the screen" },
];

/** Edit distance, for "did you mean". */
const distance = (a: string, b: string) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
};

const normalise = (p: string) => {
  const clean = p.trim().replace(/^\/?/, "/").replace(/\/?$/, "/").replace(/\/{2,}/g, "/");
  return clean === "//" ? "/" : clean;
};

/**
 * 404 as a terminal: the status rolls from 200 to 404, a request trace shows
 * the path that missed, the closest real routes are suggested, and a small
 * shell (help, ls, open, whoami, resume, contact) gets the visitor anywhere.
 * Routes come from the built site, so suggestions are always real pages.
 */
const NotFoundPage: React.FC<PageProps> = ({ location }) => {
  const { site, profile, fullName, linkedin, github } = useSiteData();
  const data = useStaticQuery<{ allSitePage: { nodes: Array<{ path: string }> } }>(graphql`
    query NotFoundRoutes {
      allSitePage {
        nodes {
          path
        }
      }
    }
  `);
  const routes = useMemo(
    () =>
      data.allSitePage.nodes
        .map((n) => n.path)
        .filter((p) => !/404|offline|dev-/.test(p))
        .sort((a, b) => a.length - b.length || a.localeCompare(b)),
    [data],
  );

  // The requested path is only known in the browser (the HTML is shared by every missing URL).
  const [path, setPath] = useState("/404/");
  const [code, setCode] = useState("404");
  const [rollIn, setRollIn] = useState(false);
  const [renderMs, setRenderMs] = useState<number | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const history = useRef<string[]>([]);
  const historyAt = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  // Pages plus the home page's section anchors, ranked by how close they are
  // to the missing path; a route whose segment starts with a typed segment
  // ("/wor/" -> "work") ranks first.
  const suggestions = useMemo(() => {
    const target = normalise(path.split(/[?#]/)[0]).toLowerCase();
    const typed = target.split("/").filter(Boolean);
    const candidates = [...routes, ...navSections.map((s) => `/#${s.id}`)];
    const score = (r: string) => {
      const segments = r.toLowerCase().split(/[/#]/).filter(Boolean);
      const prefix = typed.some((t) => t.length >= 2 && segments.some((seg) => seg.startsWith(t) || t.startsWith(seg)));
      return distance(target, r.toLowerCase()) - (prefix ? 10 : 0) + (r === "/" ? 2 : 0);
    };
    return candidates
      .map((r) => ({ r, d: score(r) }))
      .sort((a, b) => a.d - b.d || a.r.length - b.r.length)
      .slice(0, 3)
      .map((x) => x.r);
  }, [path, routes]);

  useEffect(() => {
    setPath(location.pathname + location.search);
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav && nav.responseEnd > 0) setRenderMs(Math.round(nav.responseEnd - nav.requestStart));
    // Roll the status from 200 to 404 (skipped when motion is reduced).
    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      setCode("200");
      const id = window.setTimeout(() => {
        setRollIn(true);
        setCode("404");
      }, 350);
      if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
      return () => window.clearTimeout(id);
    }
    setRollIn(true);
    return undefined;
  }, [location.pathname, location.search]);

  useEffect(() => {
    screenRef.current?.scrollTo({ top: screenRef.current.scrollHeight });
  }, [lines]);

  const print = (...add: Line[]) => setLines((l) => [...l, ...add].slice(-80));

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    history.current = [cmd, ...history.current].slice(0, 30);
    historyAt.current = -1;
    const [name, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");
    const echo: Line = { kind: "in", text: cmd };

    switch (name.toLowerCase()) {
      case "help":
        print(echo, ...COMMANDS.map((c) => ({ kind: "out" as const, text: `${c.name.padEnd(9)}${c.help}` })));
        break;
      case "ls":
        print(echo, ...routes.map((r) => ({ kind: "link" as const, text: r, href: r })));
        break;
      case "cd":
      case "open": {
        if (!arg) {
          print(echo, { kind: "err", text: `${name}: missing path. Try "ls".` });
          break;
        }
        const target = normalise(arg);
        if (routes.includes(target)) {
          print(echo, { kind: "dim", text: `GET ${target} 200` });
          navigate(target);
        } else {
          const near = routes.map((r) => ({ r, d: distance(target, r) })).sort((a, b) => a.d - b.d)[0];
          print(echo, { kind: "err", text: `${name}: ${target}: no such page` }, ...(near ? [{ kind: "out" as const, text: `did you mean ${near.r} ?` }] : []));
        }
        break;
      }
      case "whoami":
        print(echo, { kind: "out", text: `${fullName}, ${profile.profession}` }, { kind: "dim", text: site.description });
        break;
      case "resume":
      case "cv":
        if (args.includes("--pdf")) {
          print(echo, { kind: "dim", text: "downloading Reti-Fier-Resume.pdf" });
          downloadResume();
        } else {
          print(echo, { kind: "dim", text: "GET /resume/ 200" });
          navigate("/resume/");
        }
        break;
      case "contact":
      case "email":
        print(
          echo,
          ...(profile.email ? [{ kind: "link" as const, text: profile.email, href: `mailto:${profile.email}` }] : []),
          ...(linkedin ? [{ kind: "link" as const, text: linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: linkedin }] : []),
          ...(github ? [{ kind: "link" as const, text: github.replace(/^https?:\/\/(www\.)?/, ""), href: github }] : []),
        );
        break;
      case "home":
      case "exit":
      case "cd..":
        navigate("/");
        break;
      case "clear":
        setLines([]);
        break;
      case "sudo":
        print(echo, { kind: "err", text: "permission denied. This incident will be reported (to nobody)." });
        break;
      case "rm":
        print(echo, { kind: "err", text: "rm: refusing to remove a page that does not exist" });
        break;
      default:
        print(echo, { kind: "err", text: `command not found: ${name}. Try "help".` });
    }
  };

  const complete = () => {
    const [name, ...rest] = input.split(" ");
    if (rest.length === 0) {
      const match = COMMANDS.map((c) => c.name).filter((c) => c.startsWith(name.toLowerCase()));
      if (match.length === 1) setInput(`${match[0]} `);
      else if (match.length > 1) print({ kind: "dim", text: match.join("  ") });
      return;
    }
    const partial = rest.join(" ");
    const match = routes.filter((r) => r.startsWith(normalise(partial).replace(/\/$/, "")) || r.startsWith(partial));
    if (match.length === 1) setInput(`${name} ${match[0]}`);
    else if (match.length > 1) print({ kind: "dim", text: match.join("  ") });
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run(input);
      setInput("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(-1, Math.min(history.current.length - 1, historyAt.current + (e.key === "ArrowUp" ? 1 : -1)));
      historyAt.current = next;
      setInput(next === -1 ? "" : history.current[next]);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const host = site.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <Layout pathname={location.pathname} showProgress={false}>
      <section className="container-site grid min-h-[85vh] content-center gap-12 pb-16 pt-28 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p className="rise eyebrow">
            HTTP <span className="text-faint">/</span> route not found
          </p>
          <p className="display mt-6 text-[clamp(6rem,30vw,11rem)] leading-none text-ink lg:text-[12rem]" aria-hidden="true">
            <YearOdometer value={code} animate={rollIn} stagger={110} />
          </p>
          <h1 className="rise mt-6 font-display text-3xl font-[760] [font-stretch:104%] uppercase leading-tight tracking-[-0.01em] text-ink sm:text-4xl" style={{ animationDelay: "120ms" }}>
            404: this route doesn't exist
          </h1>
          <p className="rise mt-4 max-w-prose text-lg leading-relaxed text-muted" style={{ animationDelay: "200ms" }}>
            The page moved or never existed. The terminal knows every real page: type <span className="kbd">help</span>, or use
            one of the links below.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "260ms" }}>
            <ArrowLink to="/" variant="primary">
              Back to the portfolio
            </ArrowLink>
            <ArrowLink to="/resume/" variant="ghost">
              Résumé
            </ArrowLink>
          </div>
        </div>

        <div className="rise lg:col-span-7" style={{ animationDelay: "160ms" }}>
          <div
            className="flex h-[30rem] flex-col border border-line bg-surface/80 sm:h-[34rem]"
            onClick={() => {
              if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
            }}
          >
            <p className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 font-mono text-label uppercase tracking-[0.05em] text-muted">
              <span className="text-ink">guest@{host}</span>
              <span>zsh / 80x24</span>
            </p>

            <div ref={screenRef} className="flex-1 overflow-y-auto px-4 py-4 font-mono text-meta leading-relaxed" aria-live="polite">
              {/* Request trace for the path that missed */}
              <p className="text-ink">
                <span className="text-accent">$</span> curl -I https://{host}
                <span className="break-all">{path}</span>
              </p>
              <p className="text-accent">HTTP/2 404</p>
              <p className="text-muted">content-type: text/html; charset=utf-8</p>
              <p className="text-muted">x-matched-route: none</p>
              {renderMs !== null && <p className="text-muted">x-response-time: {renderMs}ms</p>}
              <p className="mt-3 text-ink">
                <span className="text-accent">$</span> grep -i &quot;did you mean&quot; routes.txt
              </p>
              <ul className="mt-1">
                {suggestions.map((r) => (
                  <li key={r}>
                    <a
                      href={r}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(r);
                      }}
                      className="text-ink underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent"
                    >
                      {r}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-muted">Type &quot;help&quot; for commands. Tab completes, arrow keys walk history.</p>

              {lines.map((l, i) =>
                l.kind === "in" ? (
                  <p key={i} className="mt-2 text-ink">
                    <span className="text-accent">$</span> {l.text}
                  </p>
                ) : l.kind === "link" && l.href ? (
                  <p key={i}>
                    <a
                      href={l.href}
                      onClick={(e) => {
                        if (l.href?.startsWith("/")) {
                          e.preventDefault();
                          navigate(l.href);
                        }
                      }}
                      className="text-ink underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent"
                    >
                      {l.text}
                    </a>
                  </p>
                ) : (
                  <p
                    key={i}
                    className={`whitespace-pre-wrap break-words ${
                      l.kind === "err" ? "text-accent" : l.kind === "dim" ? "text-muted" : "text-ink/90"
                    }`}
                  >
                    {l.text}
                  </p>
                ),
              )}
            </div>

            <label className="flex items-center gap-2 border-t border-line px-4 py-3 font-mono text-meta">
              <span aria-hidden="true" className="text-accent">
                $
              </span>
              <span className="sr-only">Terminal command</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                enterKeyHint="go"
                placeholder="help"
                className="min-w-0 flex-1 bg-transparent text-ink caret-accent outline-none placeholder:text-faint"
              />
              <button
                type="button"
                onClick={() => {
                  run(input || "help");
                  setInput("");
                }}
                className="border border-line px-2.5 py-1 text-label uppercase tracking-[0.05em] text-muted transition-colors hover:border-ink hover:text-ink"
              >
                Run
              </button>
            </label>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFoundPage;

export const Head: HeadFC = ({ location }) => <Seo title="Page not found" pathname={location.pathname} noindex />;
