import { expect, test } from "@playwright/test";

// The line that draws itself down the left as you scroll, on every long page
// (Danso's call, 2026-10-12). It replaced the reading bar along the top.

const lineProgress = (el: Element) => {
  const animation = el
    .getAnimations({ subtree: true })
    .find((a) => (a as CSSAnimation).animationName === "line-draw");
  return animation?.effect?.getComputedTiming().progress ?? -1;
};

const PAGES = ["/projects/medispace", "/projects/smartsocket", "/skills", "/resume"];

test.describe("scroll line", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const route of PAGES) {
    test(`draws down the left as ${route} is read, and finishes by the end`, async ({ page }) => {
      await page.goto(route);
      const line = page.locator("main .scroll-line").last();
      await expect(line).toHaveCount(1);
      expect(await line.evaluate(lineProgress)).toBeLessThan(0.2);
      await page.evaluate(() =>
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
      );
      await expect.poll(() => line.evaluate(lineProgress)).toBeGreaterThan(0.99);
    });
  }

  test("the reading bar along the top is gone everywhere", async ({ page }) => {
    for (const route of ["/", "/projects", "/about", ...PAGES]) {
      await page.goto(route);
      await expect(page.locator(".reading-progress"), route).toHaveCount(0);
    }
  });
});

test.describe("scroll line, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("is simply drawn in full", async ({ page }) => {
    await page.goto("/projects/medispace");
    const line = page.locator("main .scroll-line");
    expect(await line.evaluate((el) => getComputedStyle(el, "::after").animationName)).toBe("none");
    expect(await line.evaluate((el) => getComputedStyle(el, "::after").transform)).toBe("none");
  });
});
