import { expect, test } from "@playwright/test";
import { recordTransitions, recorded } from "./helpers/view-transitions";

test.describe("sliding sidebar indicator", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the highlight glides to the new section", async ({ page }) => {
    await page.goto("/");
    await recordTransitions(page);
    await page
      .getByRole("complementary", { name: /main/i })
      .getByRole("link", { name: "About", exact: true })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    await expect.poll(() => recorded(page)).toContain("::view-transition-group(nav-highlight)|400");
  });

  test("the highlight sits on the active link", async ({ page }) => {
    await page.goto("/resume");
    const nav = page.getByRole("complementary", { name: /main/i });
    const link = await nav.getByRole("link", { name: "Resume", exact: true }).boundingBox();
    const glow = await nav.locator(".nav-highlight").boundingBox();
    expect(Math.abs(glow!.y - link!.y)).toBeLessThanOrEqual(1);
    await expect(nav.locator(".nav-highlight")).toHaveCount(1);
  });
});

test.describe("sliding sidebar indicator, phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the mobile menu does not glide", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.locator("#mobile-nav .nav-highlight")).toHaveCount(0);
  });
});
