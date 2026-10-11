import { expect, test } from "@playwright/test";

test.describe("page headers", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("Projects and Resume open on the gradient, like the home page", async ({ page }) => {
    for (const route of ["/projects", "/resume"]) {
      await page.goto(route);
      const header = page.locator("main .mesh-host").first();
      await expect(header.locator(".mesh"), route).toHaveCount(1);
      await expect(header.getByRole("heading", { level: 1 }), route).toBeVisible();
    }
  });

  test("the Projects header is as tall as the Resume header", async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/resume");
      const resume = await page.locator("main .mesh-host").first().boundingBox();
      await page.goto("/projects");
      const projects = await page.locator("main .mesh-host").first().boundingBox();
      expect(Math.abs(projects!.height - resume!.height), `${viewport.width}px`).toBeLessThan(24);
    }
  });

  test("About's gradient is as tall as the home hero", async ({ page }) => {
    await page.goto("/");
    const home = await page.locator("main .mesh-host").first().boundingBox();
    await page.goto("/about");
    const about = await page.locator("main .mesh-host").first().boundingBox();
    expect(Math.abs(about!.height - home!.height)).toBeLessThanOrEqual(2);
  });
});
