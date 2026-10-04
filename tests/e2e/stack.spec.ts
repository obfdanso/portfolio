import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const card = (page: Page, title: string) =>
  page.getByRole("article").filter({ has: page.getByRole("link", { name: title, exact: true }) });

test.describe("stack disclosure", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("starts closed with the tags hidden", async ({ page }) => {
    await page.goto("/projects");
    const smart = card(page, "Smart Socket");
    await expect(smart.locator("details")).not.toHaveAttribute("open", "");
    await expect(smart.getByText("Jetpack Compose", { exact: true })).toBeHidden();
  });

  test("opens on click without leaving the page, and turns the chevron", async ({ page }) => {
    await page.goto("/projects");
    const smart = card(page, "Smart Socket");
    await smart.locator("summary").click();

    await expect(page).toHaveURL(/\/projects$/);
    await expect(smart.locator("details")).toHaveAttribute("open", "");
    for (const tag of ["TypeScript", "Kotlin", "WPF"]) {
      await expect(smart.getByText(tag, { exact: true })).toBeVisible();
    }
    await expect
      .poll(() =>
        smart
          .locator(".stack-disclosure__chevron")
          .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a),
      )
      .toBeCloseTo(-1, 1);

    await smart.locator("summary").click();
    await expect(smart.locator("details")).not.toHaveAttribute("open", "");
  });

  test("opens from the keyboard", async ({ page }) => {
    await page.goto("/projects");
    const smart = card(page, "Smart Socket");
    await smart.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/projects$/);
    await expect(smart.locator("details")).toHaveAttribute("open", "");
  });

  test("an open stack is accessible in both themes", async ({ page }) => {
    for (const theme of ["dark", "light"]) {
      await page.addInitScript((t) => window.localStorage.setItem("theme", t), theme);
      await page.goto("/projects");
      for (const summary of await page.locator("article summary").all()) {
        await summary.click();
      }
      // Wait for the staggered pop-in to finish before measuring contrast.
      await expect(page.locator(".stack-disclosure__tag").last()).toHaveCSS("opacity", "1");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      expect(results.violations, theme).toEqual([]);
    }
  });
});

test.describe("stack disclosure, phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("a tap on Stack opens it on a phone", async ({ page }) => {
    await page.goto("/projects");
    const smart = card(page, "Smart Socket");
    await smart.locator("summary").scrollIntoViewIfNeeded();
    await smart.locator("summary").tap();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(smart.locator("details")).toHaveAttribute("open", "");
  });
});

test.describe("stack disclosure, reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("tags appear without the pop-in", async ({ page }) => {
    await page.goto("/projects");
    const smart = card(page, "Smart Socket");
    await smart.locator("summary").click();
    await expect(smart.locator(".stack-disclosure__tag").first()).toHaveCSS(
      "animation-name",
      "none",
    );
  });
});
