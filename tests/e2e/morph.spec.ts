import { expect, test } from "@playwright/test";
import { recordTransitions, recorded } from "./helpers/view-transitions";

test.describe("card-to-page morph", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("a card's cover and title morph into the case study", async ({ page }) => {
    await page.goto("/projects");
    await recordTransitions(page);
    await page.getByRole("link", { name: "POS", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/pos$/);

    await expect
      .poll(() => recorded(page))
      .toContain("::view-transition-group(project-cover-pos)|400");
    await expect
      .poll(() => recorded(page))
      .toContain("::view-transition-group(project-title-pos)|400");
  });

  test("the list works after going back", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("link", { name: "POS", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/pos$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/projects$/);

    // No overlay left catching clicks: the next card still navigates.
    await page.getByRole("link", { name: "MediSpace", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/medispace$/);
  });
});

test.describe("card-to-page morph, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("the morph is instant", async ({ page }) => {
    await page.goto("/projects");
    await recordTransitions(page);
    await page.getByRole("link", { name: "POS", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/pos$/);
    await expect(page.getByRole("heading", { level: 1, name: "POS" })).toBeVisible();
    expect(await recorded(page)).not.toContain("project-cover-pos)|400");
  });
});
