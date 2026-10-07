import { expect, test } from "@playwright/test";

const progress = (el: Element) => {
  const animation = el
    .getAnimations()
    .find((a) => (a as CSSAnimation).animationName === "text-fill");
  return animation?.effect?.getComputedTiming().progress ?? -1;
};

test.describe("headings fill as you scroll", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("Selected work fills in once it is in view", async ({ page }) => {
    await page.goto("/");
    const label = page.locator(".fill-on-scroll", { hasText: "Selected work" });
    await expect(label).toHaveCSS("animation-name", "text-fill");
    await label.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect.poll(() => label.evaluate(progress)).toBeGreaterThan(0.95);
    await expect(page.getByRole("heading", { level: 2, name: /selected work/i })).toBeVisible();
  });
});

test.describe("headings fill, reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("are simply solid", async ({ page }) => {
    await page.goto("/");
    const label = page.locator(".fill-on-scroll").first();
    await expect(label).toHaveCSS("animation-name", "none");
    expect(await label.evaluate((el) => getComputedStyle(el).color)).not.toBe("rgba(0, 0, 0, 0)");
  });
});
