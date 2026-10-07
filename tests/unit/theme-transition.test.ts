import { describe, expect, it } from "vitest";
import { revealGeometry } from "@/lib/theme-transition";

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
