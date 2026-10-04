import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const spot = (el: Element) => (el as HTMLElement).style.getPropertyValue("--spot-x");

test.describe("cursor spotlight", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("follows the mouse across a card", async ({ page }) => {
    await page.goto("/projects");
    const card = page.getByRole("article").first();
    await card.hover({ position: { x: 40, y: 120 } });
    await expect
      .poll(() =>
        card.evaluate((el) => parseFloat((el as HTMLElement).style.getPropertyValue("--spot-x"))),
      )
      .toBeCloseTo(40, -0.5);

    await card.hover({ position: { x: 200, y: 120 } });
    await expect
      .poll(() =>
        card.evaluate((el) => parseFloat((el as HTMLElement).style.getPropertyValue("--spot-x"))),
      )
      .toBeCloseTo(200, -0.5);
  });

  test("covers evidence cards and the skills call to action", async ({ page }) => {
    await page.goto("/skills");
    await expect(page.locator("main a.spotlight").first()).toBeVisible();
    await page.goto("/");
    await expect(
      page.locator(".spotlight", { has: page.getByRole("link", { name: "See my other skills" }) }),
    ).toHaveCount(1);
  });

  test("ignores touch pointers", async ({ page }) => {
    await page.goto("/projects");
    const card = page.getByRole("article").first();
    await card.dispatchEvent("pointermove", {
      pointerType: "touch",
      clientX: 100,
      clientY: 300,
      bubbles: true,
    });
    await page.waitForTimeout(100);
    expect(await card.evaluate(spot)).toBe("");
  });

  test("a hovered card stays accessible", async ({ page }) => {
    for (const theme of ["dark", "light"]) {
      await page.addInitScript((t) => window.localStorage.setItem("theme", t), theme);
      await page.goto("/projects");
      await page
        .getByRole("article")
        .first()
        .hover({ position: { x: 120, y: 200 } });
      await page.waitForTimeout(300);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      expect(results.violations, theme).toEqual([]);
    }
  });
});

test.describe("cursor spotlight, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("stays off", async ({ page }) => {
    await page.goto("/projects");
    const card = page.getByRole("article").first();
    await card.hover({ position: { x: 40, y: 120 } });
    await page.waitForTimeout(100);
    expect(await card.evaluate(spot)).toBe("");
  });
});
