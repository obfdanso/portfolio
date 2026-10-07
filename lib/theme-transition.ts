// Counts reveals, so a quick second switch keeps its class when the first
// (skipped) transition finishes.
let latest = 0;

type Rect = { left: number; top: number; width: number; height: number };
type Viewport = { width: number; height: number };

/** The circle starts at the button's centre and must cover the whole screen. */
export function revealGeometry(rect: Rect, viewport: Viewport) {
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const r = Math.hypot(Math.max(x, viewport.width - x), Math.max(y, viewport.height - y));
  return { x, y, r };
}

/**
 * Runs a theme change as a view transition that reveals the new colours in a
 * circle growing from `origin`. Falls back to an instant change without View
 * Transitions support, under reduced motion, or without an origin.
 */
export function switchTheme(apply: () => void, origin: HTMLElement | null): void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce || !origin) {
    apply();
    return;
  }

  const { x, y, r } = revealGeometry(origin.getBoundingClientRect(), {
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const root = document.documentElement;
  root.style.setProperty("--reveal-x", `${x}px`);
  root.style.setProperty("--reveal-y", `${y}px`);
  root.style.setProperty("--reveal-r", `${r}px`);
  root.classList.add("theme-reveal");

  const id = ++latest;
  const transition = document.startViewTransition(apply);
  transition.finished.finally(() => {
    if (id === latest) root.classList.remove("theme-reveal");
  });
}
