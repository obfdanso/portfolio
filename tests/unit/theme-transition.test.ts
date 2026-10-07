import { afterEach, describe, expect, it, vi } from "vitest";
import { revealGeometry, switchTheme } from "@/lib/theme-transition";

describe("revealGeometry", () => {
  it("centres the circle on the button", () => {
    const { x, y } = revealGeometry(
      { left: 20, top: 800, width: 80, height: 30 },
      { width: 1440, height: 900 },
    );
    expect(x).toBe(60);
    expect(y).toBe(815);
  });

  it("reaches the farthest corner of the viewport", () => {
    const { r } = revealGeometry(
      { left: 20, top: 800, width: 80, height: 30 },
      { width: 1440, height: 900 },
    );
    // Farthest corner from (60, 815) is (1440, 0).
    expect(r).toBeCloseTo(Math.hypot(1380, 815), 5);
  });
});

describe("switchTheme", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.classList.remove("theme-reveal");
  });

  it("keeps the reveal class through a second quick switch", async () => {
    // Each fake transition finishes only when we say so, like a real one
    // that gets skipped when a second transition starts.
    const finishers: Array<() => void> = [];
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: (apply: () => void) => {
        apply();
        let finish!: () => void;
        const finished = new Promise<void>((resolve) => (finish = resolve));
        finishers.push(finish);
        return { finished, ready: Promise.resolve(), updateCallbackDone: Promise.resolve() };
      },
    });
    const origin = document.createElement("button");
    const root = document.documentElement;

    switchTheme(() => {}, origin);
    switchTheme(() => {}, origin);
    finishers[0]();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(root.classList.contains("theme-reveal")).toBe(true);

    finishers[1]();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(root.classList.contains("theme-reveal")).toBe(false);
  });
});
