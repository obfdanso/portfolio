import { expect, test } from "@playwright/test";

const scaleX = (el: Element) => new DOMMatrix(getComputedStyle(el).transform).a;

test.describe("reading progress", () => {
  test("fills as a case study is read", async ({ page }) => {
    await page.goto("/projects/medispace");
    const bar = page.locator(".reading-progress");
    await expect(bar).toHaveAttribute("aria-hidden", "true");
    await expect(bar).toHaveCSS("animation-name", "reading-progress");
    expect(await bar.evaluate(scaleX)).toBeLessThan(0.2);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => bar.evaluate(scaleX)).toBeGreaterThan(0.95);
  });

  test("only appears on case studies", async ({ page }) => {
    for (const route of ["/", "/projects", "/skills", "/about"]) {
      await page.goto(route);
      await expect(page.locator(".reading-progress"), route).toHaveCount(0);
    }
  });
});

test.describe("cover wipe", () => {
  test("card covers wipe in; the showcase does not", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator(".card-media").first()).toHaveCSS("animation-name", "media-wipe");
    await page.goto("/projects/medispace");
    await expect(page.locator(".project-showcase")).toHaveCSS("animation-name", "none");
  });
});

test.describe("scroll effects, reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("both hold still", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator(".card-media").first()).toHaveCSS("animation-name", "none");
    await page.goto("/projects/medispace");
    await expect(page.locator(".reading-progress")).toBeHidden();
  });
});
