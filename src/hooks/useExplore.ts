import { useEffect, useSyncExternalStore } from "react";
import { navSections } from "../theme/navSections";
import { toast } from "../components/Toaster";

/**
 * Per-visitor exploration progress: sections visited, case studies read and
 * trophies for using the site's own controls. Stored only in this browser
 * (localStorage, versioned key); it is a convenience, never sent anywhere.
 * The server snapshot is always empty, so server HTML and the first client
 * render match; saved progress loads after mount.
 */

export const TROPHIES = [
  { id: "palette", label: "Opened the command menu", hint: "Press / or Ctrl K" },
  { id: "keys", label: "Moved with the keyboard", hint: "Press J or K" },
  { id: "map", label: "Opened the page map", hint: "Press M" },
  { id: "case", label: "Read a case study", hint: "Open a project" },
  { id: "trace", label: "Saw a restart reconciled", hint: "Watch the scan cycle" },
  { id: "recover", label: "Killed the process and watched it recover", hint: "Find the kill switch" },
  { id: "sections", label: "Visited every section", hint: "Scroll the whole page" },
] as const;

export type TrophyId = (typeof TROPHIES)[number]["id"];

interface ExploreState {
  v: 1;
  sections: string[];
  cases: string[];
  trophies: TrophyId[];
  shortcuts: boolean;
  tourDone: boolean;
}

const KEY = "rf.explore.v1";
const EMPTY: ExploreState = { v: 1, sections: [], cases: [], trophies: [], shortcuts: true, tourDone: false };

let state: ExploreState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

const save = () => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: progress lasts for this page view only */
  }
};

const set = (next: ExploreState) => {
  state = next;
  save();
  emit();
};

const hydrate = () => {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.v === 1) {
        const known = new Set<string>(TROPHIES.map((t) => t.id));
        state = {
          ...EMPTY,
          ...parsed,
          sections: Array.isArray(parsed.sections) ? parsed.sections.filter((s: unknown) => typeof s === "string") : [],
          cases: Array.isArray(parsed.cases) ? parsed.cases.filter((s: unknown) => typeof s === "string") : [],
          trophies: Array.isArray(parsed.trophies) ? parsed.trophies.filter((t: string) => known.has(t)) : [],
          shortcuts: parsed.shortcuts !== false,
          tourDone: parsed.tourDone === true,
        };
      }
    }
  } catch {
    state = EMPTY;
  }
  emit();
};

const pad = (n: number) => String(n).padStart(2, "0");

export const explore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  unlock(id: TrophyId) {
    hydrate();
    if (state.trophies.includes(id)) return;
    const trophies = [...state.trophies, id];
    set({ ...state, trophies });
    const t = TROPHIES.find((x) => x.id === id);
    if (t) toast(t.label, `trophy ${pad(trophies.length)} / ${pad(TROPHIES.length)}`);
  },
  markSection(id: string) {
    hydrate();
    if (!navSections.some((s) => s.id === id) || state.sections.includes(id)) return;
    set({ ...state, sections: [...state.sections, id] });
    if (navSections.every((s) => state.sections.includes(s.id))) explore.unlock("sections");
  },
  markCase(slug: string) {
    hydrate();
    if (!state.cases.includes(slug)) set({ ...state, cases: [...state.cases, slug] });
    explore.unlock("case");
  },
  setShortcuts(on: boolean) {
    hydrate();
    set({ ...state, shortcuts: on });
  },
  finishTour() {
    hydrate();
    if (!state.tourDone) set({ ...state, tourDone: true });
  },
  restartTour() {
    hydrate();
    set({ ...state, tourDone: false });
    window.dispatchEvent(new CustomEvent("tour:restart"));
  },
  reset() {
    hydrate();
    set({ ...EMPTY, shortcuts: state.shortcuts, tourDone: state.tourDone });
    toast("Progress cleared");
  },
};

const serverSnapshot = () => EMPTY;

/** Subscribe to exploration progress (empty until saved progress loads after mount). */
export const useExplore = () => {
  const snapshot = useSyncExternalStore(explore.subscribe, explore.get, serverSnapshot);
  useEffect(() => {
    hydrate();
  }, []);
  return snapshot;
};
