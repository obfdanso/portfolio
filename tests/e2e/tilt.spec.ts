import { expect, test } from "@playwright/test";

const tilt = (el: Element) => [
  parseFloat((el as HTMLElement).style.getPropertyValue("--tilt-x")),
  parseFloat((el as HTMLElement).style.getPropertyValue("--tilt-y")),
];

test.describe("card tilt", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("a card leans toward the mouse", async ({ page }) => {
    await page.goto("/projects");
    const card = page.getByRole("article").first();
    const box = await card.boundingBox();
    await card.hover({ position: { x: box!.width - 10, y: 10 } });
    await expect.poll(async () => (await card.evaluate(tilt))[0]).toBeGreaterThan(0.8);
    const [x, y] = await card.evaluate(tilt);
    expect(x).toBeGreaterThan(0.8);
    expect(y).toBeLessThan(-0.8);
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).transform))
      .toMatch(/^matrix3d/);
  });

  test("a click near the corner still opens the case study", async ({ page }) => {
    await page.goto("/projects");
    const card = page.getByRole("article").first();
    const box = await card.boundingBox();
    await card.hover({ position: { x: box!.width - 14, y: box!.height - 14 } });
    await page.waitForTimeout(200);
    await card.click({ position: { x: box!.width - 14, y: box!.height / 2 } });
    await expect(page).toHaveURL(/\/projects\/[a-z-]+$/);
  });
});

test.describe("card tilt, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("cards stay flat", async ({ page }) => {
    await page.goto("/projects");
    const card = page.getByRole("article").first();
    await card.hover({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(150);
    expect(
      await card.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--tilt-x")),
    ).toBe("");
  });
});
