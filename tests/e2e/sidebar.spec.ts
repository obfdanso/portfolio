import { expect, test } from "@playwright/test";

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

test.describe("desktop sidebar", () => {
  test.use({ viewport: DESKTOP });

  test("shows every section link", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("complementary", { name: /main/i });
    for (const label of ["Home", "Projects", "About", "Resume"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("titles Danso a front-end developer", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("complementary", { name: /main/i });
    await expect(nav.getByText("Front-end Developer", { exact: true })).toBeVisible();
  });

  test("keeps Contact out of the sidebar", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("complementary", { name: /main/i });
    await expect(nav.getByRole("link", { name: /contact/i })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: /get in touch/i })).toHaveCount(0);
  });

  test("routes to contact from the hero call to action", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("main")
      .getByRole("link", { name: /get in touch/i })
      .click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test("leaves only the theme control at the foot of the sidebar", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("complementary", { name: /main/i });
    await expect(nav.getByRole("button", { name: /theme/i })).toBeVisible();
  });

  test("the theme menu opens fully inside the viewport", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /theme/i }).click();

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();

    // Regression: the menu used to open downward from a control pinned to the
    // bottom of the sidebar, so it rendered past the fold and was unreachable.
    const box = await menu.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
  });

  test("every theme option is clickable once open", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /theme/i }).click();
    for (const option of ["light", "dark", "system"]) {
      await expect(
        page.getByRole("menuitem", { name: new RegExp(`^${option}$`, "i") }),
      ).toBeVisible();
    }
  });

  test("marks the current section and only that section", async ({ page }) => {
    await page.goto("/projects");
    const nav = page.getByRole("complementary", { name: /main/i });
    await expect(nav.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(nav.getByRole("link", { name: "Home", exact: true })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("does not mark Home as current on a nested route", async ({ page }) => {
    await page.goto("/about");
    const nav = page.getByRole("complementary", { name: /main/i });
    await expect(nav.getByRole("link", { name: "Home", exact: true })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("navigates between sections", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("complementary", { name: /main/i })
      .getByRole("link", { name: "Resume", exact: true })
      .click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.getByRole("heading", { level: 1, name: "Resume" })).toBeVisible();
  });

  test("the skip link is first in the tab order and moves focus to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("hides the mobile top bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /open menu/i })).toBeHidden();
  });
});

test.describe("mobile top bar", () => {
  test.use({ viewport: PHONE });

  test("collapses the sidebar into a disclosure", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("complementary", { name: /main/i })).toBeHidden();

    const toggle = page.getByRole("button", { name: /open menu/i });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("opens and closes the menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();

    await expect(page.getByRole("button", { name: /close menu/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(page.getByRole("link", { name: "Projects", exact: true })).toBeVisible();

    await page.getByRole("button", { name: /close menu/i }).click();
    await expect(page.getByRole("link", { name: "Projects", exact: true })).toBeHidden();
  });

  test("closes the menu after navigating", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    await page.getByRole("link", { name: "About", exact: true }).click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole("button", { name: /open menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
