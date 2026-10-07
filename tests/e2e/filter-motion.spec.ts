import { expect, test } from "@playwright/test";
import { getFrontendProjects } from "@/lib/content";
import { recordTransitions, recorded } from "./helpers/view-transitions";

const TS_COUNT = getFrontendProjects().filter((p) => p.stack.includes("TypeScript")).length;

test.describe("animated project filter", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the highlight glides between pills and cards animate", async ({ page }) => {
    await page.goto("/projects");
    await recordTransitions(page);
    await page.getByRole("button", { name: "TypeScript", exact: true }).click();

    await expect
      .poll(() => recorded(page))
      .toContain("::view-transition-group(filter-highlight)|400");
    await expect.poll(() => recorded(page)).toMatch(/\|400\|card-out/);
    await expect(page.getByRole("article")).toHaveCount(TS_COUNT);
  });

  test("two quick clicks land on the second filter", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("button", { name: "TypeScript", exact: true }).click();
    await page.getByRole("button", { name: "JavaScript", exact: true }).click();
    await expect(page.getByRole("button", { name: "JavaScript", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const count = getFrontendProjects().filter((p) => p.stack.includes("JavaScript")).length;
    await expect(page.getByRole("article")).toHaveCount(count);
  });

  test("navigating away runs no card exit", async ({ page }) => {
    await page.goto("/projects");
    await recordTransitions(page);
    await page.getByRole("link", { name: "POS", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/pos$/);
    await expect.poll(() => recorded(page)).toContain("project-cover-pos");
    expect(await recorded(page)).not.toContain("card-out");
  });
});

test.describe("animated project filter, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("filters instantly", async ({ page }) => {
    await page.goto("/projects");
    await recordTransitions(page);
    await page.getByRole("button", { name: "TypeScript", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(TS_COUNT);
    // Wait for the transition to be recorded, then check nothing in it ran
    // at full length.
    await expect.poll(() => recorded(page)).toContain("filter-highlight");
    expect(await recorded(page)).not.toMatch(/\|400\|/);
  });
});
