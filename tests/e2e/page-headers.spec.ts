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

  test("About's header matches Resume's in size and colour", async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/resume");
      const resume = await page.locator("main .mesh-host").first().boundingBox();
      await page.goto("/about");
      const header = page.locator("main .mesh-host").first();
      const about = await header.boundingBox();
      expect(Math.abs(about!.height - resume!.height), `${viewport.width}px`).toBeLessThan(24);
      // The site's own teal and emerald: no hue shift.
      await expect(header.locator(".mesh")).toHaveCSS("filter", "hue-rotate(0deg)");
    }
  });

  test("every inner page opens on the same gradient header", async ({ page }) => {
    await page.goto("/resume");
    const resume = await page.locator("main .mesh-host").first().boundingBox();
    for (const route of ["/about", "/projects", "/skills", "/contact"]) {
      await page.goto(route);
      const header = page.locator("main .mesh-host").first();
      const box = await header.boundingBox();
      expect(Math.abs(box!.height - resume!.height), route).toBeLessThan(24);
      await expect(header.locator(".mesh"), route).toHaveCSS("filter", "hue-rotate(0deg)");
    }
    // Case studies carry more in their header, so they may run taller.
    for (const slug of ["smartsocket", "intercli", "medispace"]) {
      await page.goto(`/projects/${slug}`);
      const box = await page.locator("main .mesh-host").first().boundingBox();
      expect(box!.height, slug).toBeGreaterThanOrEqual(resume!.height - 24);
    }
  });
});
