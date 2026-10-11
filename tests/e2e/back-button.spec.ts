import { expect, test, type Page } from "@playwright/test";
import { clickSidebarLink } from "./helpers/sidebar";

const back = (page: Page) => page.getByRole("link", { name: /^Back to / });

const sidebar = (page: Page, label: string) => clickSidebarLink(page, label);

test.describe("back button", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("is not on the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main h1")).toBeVisible();
    await expect(back(page)).toHaveCount(0);
  });

  test("names the page it returns to and goes back to it", async ({ page }) => {
    await page.goto("/");
    await sidebar(page, "About");
    await expect(page).toHaveURL(/\/about$/);
    await sidebar(page, "Resume");
    await expect(page).toHaveURL(/\/resume$/);

    await expect(back(page)).toHaveAccessibleName("Back to About");
    await back(page).click();
    await expect(page).toHaveURL(/\/about$/);

    // One step further back is Home, like an iPhone's stack.
    await expect(back(page)).toHaveAccessibleName("Back to Home");
    await back(page).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("names a case study by its title", async ({ page }) => {
    await page.goto("/projects");
    await page
      .getByRole("region", { name: "Projects" })
      .getByRole("button", { name: "Show POS" })
      .click();
    await page.getByRole("link", { name: "POS", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/pos$/);
    await sidebar(page, "Resume");
    await expect(back(page)).toHaveAccessibleName("Back to POS");
  });

  test("arriving straight on a page, it goes up a level instead of off the site", async ({
    page,
  }) => {
    await page.goto("/projects/medispace");
    await expect(back(page)).toHaveAccessibleName("Back to Projects");
    await back(page).click();
    await expect(page).toHaveURL(/\/projects$/);

    await page.goto("/resume");
    await expect(back(page)).toHaveAccessibleName("Back to Home");
    await back(page).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("is a back arrow in a round glass bubble, like iOS", async ({ page }) => {
    await page.goto("/about");
    const button = back(page);
    await expect(button).toHaveText("");
    await expect(button.locator("svg")).toBeVisible();
    const box = await button.boundingBox();
    expect(Math.round(box!.width)).toBe(Math.round(box!.height));
    const style = await button.evaluate((el) => {
      const s = getComputedStyle(el);
      return { radius: s.borderTopLeftRadius, backdrop: s.backdropFilter };
    });
    expect(parseFloat(style.radius)).toBeGreaterThanOrEqual(box!.width / 2);
    expect(style.backdrop).toContain("blur");
  });

  test("sits at the left, clear of the sidebar", async ({ page }) => {
    await page.goto("/about");
    const sidebar = await page.getByRole("complementary", { name: /main/i }).boundingBox();
    const button = await back(page).boundingBox();
    const gap = button!.x - (sidebar!.x + sidebar!.width);
    expect(gap).toBeGreaterThanOrEqual(16);
    expect(gap).toBeLessThanOrEqual(48);
    // Left of the page's own text, not lined up with it.
    const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
    expect(button!.x).toBeLessThan(heading!.x);
  });
});

test.describe("back button without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("is a plain link up a level", async ({ page }) => {
    await page.goto("/projects/medispace");
    await expect(back(page)).toHaveAttribute("href", "/projects");
  });
});

test.describe("back button on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("sits below the top bar, clear of the menu", async ({ page }) => {
    await page.goto("/about");
    const header = await page.getByRole("banner").boundingBox();
    const button = await back(page).boundingBox();
    expect(button!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
  });
});
