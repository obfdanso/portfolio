import fs from "node:fs";
import { expect, test } from "@playwright/test";

// Read from the content folder, so adding a project needs no test edits.
const PROJECT_COUNT = fs
  .readdirSync("content/projects")
  .filter((file) => file.endsWith(".mdx")).length;

test.describe("project index", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("lists every project", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("article")).toHaveCount(PROJECT_COUNT);
  });

  test("filters by stack tag and can be cleared", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("button", { name: "TypeScript", exact: true }).click();
    // Every remaining card uses the tag, and some were filtered out.
    const shown = page.getByRole("article");
    const count = await shown.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(PROJECT_COUNT);
    for (let i = 0; i < count; i += 1) {
      await expect(
        shown
          .nth(i)
          .getByRole("listitem")
          .filter({ hasText: /^TypeScript$/ }),
      ).toHaveCount(1);
    }

    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(PROJECT_COUNT);
  });

  test("marks the active filter for assistive technology", async ({ page }) => {
    await page.goto("/projects");
    const all = page.getByRole("button", { name: "All", exact: true });
    await expect(all).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "JavaScript", exact: true }).click();
    await expect(all).toHaveAttribute("aria-pressed", "false");
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

  test("reaches every card by tabbing", async ({ page }) => {
    await page.goto("/projects");
    const first = page.getByRole("article").nth(0).getByRole("link").first();
    await first.focus();

    // Tab must walk into the later cards: the rail has no previous/next
    // buttons, so this is the primary keyboard route through it. Stop as soon
    // as focus lands in the last card rather than tabbing a fixed count past it.
    const last = page.getByRole("article").last();
    let reached = false;
    for (let i = 0; i < 25 && !reached; i += 1) {
      await page.keyboard.press("Tab");
      reached = await last.evaluate((el) => el.contains(document.activeElement));
    }
    expect(reached).toBe(true);
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

  test("collapses to a vertical grid on a narrow screen", async ({ page }) => {
    await page.goto("/projects");
    const overflow = await page
      .getByRole("list", { name: /projects/i })
      .evaluate((el) => getComputedStyle(el).overflowX);
    expect(overflow).toBe("visible");
  });
});

test.describe("project index, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("collapses to a vertical grid under reduced motion", async ({ page }) => {
    await page.goto("/projects");
    const snap = await page
      .getByRole("list", { name: /projects/i })
      .evaluate((el) => getComputedStyle(el).scrollSnapType);
    expect(snap).toBe("none");
  });
});
