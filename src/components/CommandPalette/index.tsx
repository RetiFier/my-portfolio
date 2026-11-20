import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { graphql, navigate, useStaticQuery } from "gatsby";
import { AnimatePresence, motion } from "framer-motion";
import { navSections } from "../../theme/navSections";
import { useSiteData } from "../../hooks/useSiteData";
import { EASE } from "../../utils/animations";
import { goToSection as scrollToSection, isTyping } from "../../utils/goToSection";
import { toast } from "../Toaster";
import { explore } from "../../hooks/useExplore";
import { toggleExplorePanel, toggleMinimap } from "../Explore";
import { downloadResume } from "../../theme/resume";

/** Open the palette from anywhere (e.g. a button) without prop drilling. */
export const openCommandPalette = () => window.dispatchEvent(new CustomEvent("palette:open"));

interface Command {
  id: string;
  group: "Go to" | "Case studies" | "Actions" | "Explore" | "Elsewhere";
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
}

/**
 * ⌘K / Ctrl+K (or "/") command palette: jump to sections and case studies,
 * open the résumé, copy the email address, open profiles.
 * A modal dialog with a combobox + listbox; focus returns to the trigger on close.
 */
export const CommandPalette: React.FC<{ isHome: boolean }> = ({ isHome }) => {
  const { profile, linkedin, github } = useSiteData();
  const data = useStaticQuery<{ projects: { nodes: Array<{ slug: string; name: string; caseStudy: { problem: string[] | null } | null }> } }>(graphql`
    query PaletteProjects {
      projects: allProjectYaml(filter: { tier: { eq: "featured" } }, sort: { order: ASC }) {
        nodes {
          slug
          name
          caseStudy {
            problem
          }
        }
      }
    }
  `);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => returnFocus.current?.focus?.(), 0);
  }, []);

  const goToSection = useCallback((id: string) => scrollToSection(id, isHome), [isHome]);

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      ...navSections.map((s, i) => ({
        id: `go-${s.id}`,
        group: "Go to" as const,
        label: s.label,
        hint: String(i + 1).padStart(2, "0"),
        keywords: `section ${s.id}`,
        run: () => goToSection(s.id),
      })),
      {
        id: "top",
        group: "Go to",
        label: "Back to top",
        keywords: "home start",
        run: () => (isHome ? window.scrollTo({ top: 0, behavior: "smooth" }) : navigate("/")),
      },
      ...data.projects.nodes
        .filter((p) => p.caseStudy?.problem?.length)
        .map((p) => ({
          id: `case-${p.slug}`,
          group: "Case studies" as const,
          label: p.name,
          hint: `/work/${p.slug}`,
          keywords: "project case study work",
          run: () => navigate(`/work/${p.slug}/`),
        })),
      { id: "resume", group: "Actions", label: "Open résumé", hint: "/resume", keywords: "cv resume", run: () => navigate("/resume/") },
      {
        id: "resume-pdf",
        group: "Actions",
        label: "Download résumé (PDF)",
        keywords: "cv resume pdf download",
        run: downloadResume,
      },
    ];
    if (profile.email) {
      const email = profile.email;
      list.push({
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: email,
        keywords: "mail contact",
        run: () => {
          navigator.clipboard?.writeText(email).then(
            () => toast("Email copied"),
            () => {
              window.location.href = `mailto:${email}`;
            },
          );
        },
      });
    }
    list.push(
      { id: "map", group: "Explore", label: "Toggle page map", hint: "M", keywords: "minimap overview", run: toggleMinimap },
      {
        id: "panel",
        group: "Explore",
        label: "Toggle controls and progress",
        hint: "?",
        keywords: "keys keyboard shortcuts trophies help",
        run: toggleExplorePanel,
      },
      {
        id: "shortcuts",
        group: "Explore",
        label: "Turn single-key shortcuts on or off",
        keywords: "keyboard disable enable j k",
        run: () => {
          const on = !explore.get().shortcuts;
          explore.setShortcuts(on);
          toast(on ? "Single-key shortcuts on" : "Single-key shortcuts off");
        },
      },
      ...(isHome
        ? [{ id: "tour", group: "Explore" as const, label: "Restart the tour", keywords: "intro help", run: () => explore.restartTour() }]
        : []),
      { id: "reset", group: "Explore", label: "Reset progress", keywords: "clear trophies", run: () => explore.reset() },
    );
    if (linkedin)
      list.push({ id: "linkedin", group: "Elsewhere", label: "LinkedIn", hint: "↗", run: () => window.open(linkedin, "_blank", "noopener") });
    if (github) list.push({ id: "github", group: "Elsewhere", label: "GitHub", hint: "↗", run: () => window.open(github, "_blank", "noopener") });
    return list;
  }, [data, goToSection, isHome, linkedin, github, profile.email]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.group} ${c.keywords ?? ""} ${c.hint ?? ""}`.toLowerCase().includes(q));
  }, [commands, query]);

  // Global shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(document.activeElement);
      if (combo || (slash && !open)) {
        e.preventDefault();
        if (!open) returnFocus.current = document.activeElement as HTMLElement;
        setOpen((v) => !v);
      }
    };
    const onOpen = () => {
      returnFocus.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
    };
  }, [open]);

  // Reset + lock scroll while open
  useEffect(() => {
    if (!open) return;
    explore.unlock("palette");
    setQuery("");
    setCursor(0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const runAt = (i: number) => {
    const cmd = results[i];
    if (!cmd) return;
    close();
    // Run after the dialog unmounts so scroll locking is released first.
    window.setTimeout(cmd.run, 10);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (results.length ? (c + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(cursor);
    } else if (e.key === "Tab") {
      // Focus stays in the dialog: the input is the only tab stop; options use arrows.
      e.preventDefault();
    }
  };

  let lastGroup = "";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="no-print fixed inset-0 z-[90] flex items-start justify-center bg-canvas/70 px-4 pt-[12vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="palette-title"
              className="w-full max-w-xl border border-line bg-surface shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              onKeyDown={onKeyDown}
            >
              <h2 id="palette-title" className="sr-only">
                Command menu
              </h2>
              <div className="flex items-center gap-3 border-b border-line px-4">
                <span aria-hidden="true" className="font-mono text-sm text-accent">
                  &gt;
                </span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  aria-activedescendant={results[cursor] ? `palette-${results[cursor].id}` : undefined}
                  aria-autocomplete="list"
                  className="h-14 w-full bg-transparent font-mono text-sm text-ink outline-none placeholder:text-faint"
                />
                <span className="kbd">esc</span>
              </div>
              <ul ref={listRef} id="palette-list" role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto py-2">
                {results.length === 0 && <li className="px-4 py-6 font-mono text-sm text-faint">No matches.</li>}
                {results.map((c, i) => {
                  const header = c.group !== lastGroup ? c.group : null;
                  lastGroup = c.group;
                  const active = i === cursor;
                  return (
                    <React.Fragment key={c.id}>
                      {header && (
                        <li role="presentation" className="px-4 pb-1 pt-3 font-mono text-label uppercase tracking-[0.05em] text-faint">
                          / {header}
                        </li>
                      )}
                      <li
                        id={`palette-${c.id}`}
                        role="option"
                        aria-selected={active}
                        data-index={i}
                        onMouseMove={() => setCursor(i)}
                        onClick={() => runAt(i)}
                        className={`mx-2 flex cursor-pointer items-center justify-between gap-4 px-3 py-2.5 text-sm ${
                          active ? "bg-ink text-canvas" : "text-ink"
                        }`}
                      >
                        <span>{c.label}</span>
                        {c.hint && (
                          <span className={`truncate font-mono text-label ${active ? "text-canvas/70" : "text-faint"}`}>{c.hint}</span>
                        )}
                      </li>
                    </React.Fragment>
                  );
                })}
              </ul>
              <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-label uppercase tracking-[0.05em] text-faint">
                <span>
                  <span className="kbd">↑</span> <span className="kbd">↓</span> move
                </span>
                <span>
                  <span className="kbd">↵</span> run
                </span>
                <span className="ml-auto">{results.length} results</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};
