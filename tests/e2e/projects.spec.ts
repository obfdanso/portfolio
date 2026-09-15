import { expect, test } from "@playwright/test";

test.describe("project index", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("lists every project", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("article")).toHaveCount(3);
  });

  test("filters by stack tag and can be cleared", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("button", { name: "TypeScript", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("article")).toContainText("MediSpace");

    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(3);
  });

  test("marks the active filter for assistive technology", async ({ page }) => {
    await page.goto("/projects");
    const all = page.getByRole("button", { name: "All", exact: true });
    await expect(all).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "JavaScript", exact: true }).click();
    await expect(all).toHaveAttribute("aria-pressed", "false");
  });

  test("exposes visible previous and next controls", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("button", { name: /previous project/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /next project/i })).toBeVisible();
  });

  test("moves focus through the rail with the arrow keys", async ({ page }) => {
    await page.goto("/projects");

    const firstCardLink = page.getByRole("article").nth(0).getByRole("link").first();
    await firstCardLink.focus();
    await page.keyboard.press("ArrowRight");

    await expect(page.getByRole("article").nth(1).getByRole("link").first()).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await expect(firstCardLink).toBeFocused();
  });

  test("does not run off the ends of the rail", async ({ page }) => {
    await page.goto("/projects");

    const firstCardLink = page.getByRole("article").nth(0).getByRole("link").first();
    await firstCardLink.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(firstCardLink).toBeFocused();
  });

  test("scrolls horizontally on a wide viewport", async ({ page }) => {
    await page.goto("/projects");
    const overflow = await page
      .getByRole("list", { name: /projects/i })
      .evaluate((el) => getComputedStyle(el).overflowX);
    expect(overflow).toBe("auto");
  });
});

test.describe("project index, narrow", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("collapses to a vertical grid", async ({ page }) => {
    await page.goto("/projects");
    const overflow = await page
      .getByRole("list", { name: /projects/i })
      .evaluate((el) => getComputedStyle(el).overflowX);
    expect(overflow).toBe("visible");
  });
});

test.describe("project index, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("collapses to a vertical grid", async ({ page }) => {
    await page.goto("/projects");
    const snap = await page
      .getByRole("list", { name: /projects/i })
      .evaluate((el) => getComputedStyle(el).scrollSnapType);
    expect(snap).toBe("none");
  });
});
