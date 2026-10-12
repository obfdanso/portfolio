/**
 * The pages visited in this tab, so the back button can name the page it
 * returns to, the way an iPhone's does. Kept in sessionStorage: it survives a
 * reload and is forgotten with the tab.
 */
type TrailEntry = { path: string; title: string };

const KEY = "nav-trail";
const LIMIT = 50;

/**
 * The trail after arriving at `entry`. Arriving where you just were (a
 * reload) changes nothing; arriving at the page before it is a step back, so
 * the current page comes off; anywhere else goes on top.
 */
export function step(trail: TrailEntry[], entry: TrailEntry): TrailEntry[] {
  if (trail.at(-1)?.path === entry.path) return trail;
  if (trail.at(-2)?.path === entry.path) return trail.slice(0, -1);
  return [...trail, entry].slice(-LIMIT);
}

/** Where back goes when this tab has no earlier page on the site. */
export function parentOf(path: string): TrailEntry {
  return path.startsWith("/projects/")
    ? { path: "/projects", title: "Projects" }
    : { path: "/", title: "Home" };
}

const NAMES: Record<string, string> = {
  "/": "Home",
  "/projects": "Projects",
  "/about": "About",
  "/resume": "Resume",
  "/skills": "Skills",
  "/contact": "Contact",
};

/** A page's short name: its sidebar label, or its heading for a case study. */
export function nameOf(path: string, heading: string | null | undefined): string {
  return NAMES[path] ?? heading?.trim() ?? "Back";
}

// A tiny external store, so components read the trail without setting state
// in an effect. The server has no trail: it renders the parent fallback.
let previous: TrailEntry | null = null;
const listeners = new Set<() => void>();

function load(): TrailEntry[] {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TrailEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * True when this page load came from outside the site: a typed address, a
 * bookmark, or a link from elsewhere. Reloads and the browser's own back and
 * forward keep the trail; a fresh arrival starts a new one, so the button
 * never steps back to a page from an earlier visit.
 */
function arrivedFromElsewhere(): boolean {
  const navigation = performance.getEntriesByType("navigation")[0] as
    PerformanceNavigationTiming | undefined;
  if (navigation && navigation.type !== "navigate") return false;
  try {
    return new URL(document.referrer).origin !== window.location.origin;
  } catch {
    return true;
  }
}

let firstOfPageLoad = true;

export function record(entry: TrailEntry): void {
  let start = load();
  if (firstOfPageLoad) {
    firstOfPageLoad = false;
    if (arrivedFromElsewhere()) start = [];
  }
  const trail = step(start, entry);
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(trail));
  } catch {
    // Storage blocked: back still works, it just falls back to the parent.
  }
  previous = trail.at(-2) ?? null;
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getPrevious = () => previous;
export const getServerPrevious = () => null;
