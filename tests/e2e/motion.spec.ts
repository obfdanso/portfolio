import { expect, test } from "@playwright/test";

// Entrance animations are covered in animation.spec.ts, across every route.
// This file covers the scroll-driven reveal and content-without-JS guarantees.

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

test("the hero headline is readable even with motion enabled", async ({ page }) => {
  await page.goto("/");
  // Guards against the mask reveal leaving content stuck at opacity 0 if the
  // animation never runs.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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

test("every project from the content directory is listed", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "MediSpace" })).toBeVisible();
  await expect(page.getByRole("link", { name: "POS" })).toBeVisible();
  await expect(page.getByRole("link", { name: "bitby" })).toBeVisible();
});

test("no drafting notes leak into the rendered page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/TO CONFIRM/)).toHaveCount(0);
});
