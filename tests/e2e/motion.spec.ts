import { expect, test } from "@playwright/test";
import { getFrontendProjects } from "@/lib/content";

// Entrance animations are covered in animation.spec.ts, across every route.
// This file covers the scroll-driven reveal, the scroll-linked hue shift, and
// what renders without JavaScript.

test("reveals are visible under reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");

  const opacity = await page
    .locator(".reveal")
    .first()
    .evaluate((el) => getComputedStyle(el).opacity);

  expect(opacity).toBe("1");
  await context.close();
});

test("the scroll-linked hue shift is disabled under reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");

  const animationName = await page
    .locator(".mesh--scroll-linked")
    .evaluate((el) => getComputedStyle(el).animationName);

  expect(animationName).toBe("none");
  await context.close();
});

test("section numerals render their final value without javascript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 2, name: /selected work/i })).toContainText("01");
  await context.close();
});

test("Selected work lists the front-end projects and not intercli", async ({ page }) => {
  await page.goto("/");
  const work = page.locator("section", {
    has: page.getByRole("heading", { level: 2, name: /selected work/i }),
  });
  for (const title of ["MediSpace", "POS", "bitby", "Smart Socket"]) {
    await expect(work.getByRole("link", { name: title, exact: true })).toBeVisible();
  }
  await expect(work.getByRole("link", { name: "intercli", exact: true })).toHaveCount(0);
  await expect(work.getByRole("article")).toHaveCount(getFrontendProjects().length);
});

test("a project card lifts on hover", async ({ page }) => {
  // Regression: the scroll reveal animated `transform` with fill both, which
  // overrode the hover lift on every revealed card.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const card = page.getByRole("article").first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await card.hover();
  await expect
    .poll(() => card.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).f))
    .toBeLessThan(0);
});
