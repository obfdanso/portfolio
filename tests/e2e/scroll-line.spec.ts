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

  test("every page marks its sections on the line the way the resume does", async ({ page }) => {
    const dotTimings = async () => {
      await page.goto(page.url());
      return page.locator("main .scroll-dot").count();
    };
    await page.goto("/projects/medispace");
    const caseHeadings = await page.locator("main .scroll-text > h2").count();
    expect(caseHeadings).toBeGreaterThan(3);
    await expect(page.locator("main .scroll-text > h2 .scroll-dot")).toHaveCount(caseHeadings);
    await page.goto("/skills");
    await expect(page.locator("main section .scroll-dot")).toHaveCount(4);
    await page.goto("/resume");
    expect(await dotTimings()).toBeGreaterThan(0);
  });

  test("a heading's dot lights up as it reaches the middle of the screen", async ({ page }) => {
    for (const route of ["/projects/medispace", "/skills"]) {
      await page.goto(route);
      const dot = page.locator("main .scroll-dot").nth(1);
      await expect(dot).toHaveCSS("animation-name", "dot-light");
      const progress = (el: Element) => {
        const a = el.getAnimations().find((x) => (x as CSSAnimation).animationName === "dot-light");
        return a?.effect?.getComputedTiming().progress ?? -1;
      };
      expect(await dot.evaluate(progress), route).toBeLessThan(1);
      await dot.evaluate((el) => el.scrollIntoView({ block: "start", behavior: "instant" }));
      await expect.poll(() => dot.evaluate(progress), { message: route }).toBe(1);
    }
  });

  test("every dot stays on the line, even while its text is still sliding in", async ({ page }) => {
    for (const route of ["/projects/medispace", "/skills", "/resume"]) {
      await page.goto(route);
      const line = page.locator("main .scroll-line").first();
      const lineX = await line.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const after = getComputedStyle(el, "::after");
        return box.left + parseFloat(after.left) + parseFloat(after.width) / 2;
      });
      const dot = line.locator(".scroll-dot").nth(1);
      // Just entering at the bottom of the screen: its text is mid-slide.
      await dot.evaluate((el) => {
        const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight + 60;
        window.scrollTo({ top: y, behavior: "instant" });
      });
      const box = await dot.boundingBox();
      expect(Math.abs(box!.x + box!.width / 2 - lineX), route).toBeLessThan(1.5);
      // And level with the middle of its heading's first line.
      const offset = await dot.evaluate((el) => {
        const heading = el.closest("h2") ?? el.parentElement!.querySelector("h2, h3")!;
        const top = heading.getBoundingClientRect().top;
        const middle = top + parseFloat(getComputedStyle(heading).lineHeight) / 2;
        const d = el.getBoundingClientRect();
        return d.top + d.height / 2 - middle;
      });
      expect(Math.abs(offset), route).toBeLessThan(3);
    }
  });

  test("the text slides in beside the line without ever fading", async ({ page }) => {
    for (const route of ["/projects/medispace", "/skills"]) {
      await page.goto(route);
      const names = await page.evaluate(() =>
        document.getAnimations().map((a) => (a as CSSAnimation).animationName),
      );
      expect(
        names.some((n) => n === "entry-slide" || n === "point-in"),
        route,
      ).toBe(true);
      const fades = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => ["entry-slide", "point-in"].includes((a as CSSAnimation).animationName))
          .some((a) => (a.effect as KeyframeEffect).getKeyframes().some((k) => "opacity" in k)),
      );
      expect(fades, route).toBe(false);
    }
  });

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
