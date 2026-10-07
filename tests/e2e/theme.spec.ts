import { expect, test } from "@playwright/test";

test("theme choice persists across reload without a flash", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /theme/i }).click();
  await page.getByRole("menuitem", { name: /^light$/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("defaults to dark when the system prefers dark", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await context.close();
});

test.describe("theme menu closes when you move on", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const menu = (page: import("@playwright/test").Page) => page.getByRole("menu");

  test("clicking elsewhere closes it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /theme/i }).click();
    await expect(menu(page)).toBeVisible();
    await page.mouse.click(900, 450);
    await expect(menu(page)).toBeHidden();
  });

  test("Escape closes it and returns focus to the button", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: /theme/i });
    await button.click();
    await expect(menu(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu(page)).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("moving the mouse away from it closes it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("menuitem", { name: /^dark$/i }).hover();
    await expect(menu(page)).toBeVisible();
    await page.mouse.move(900, 450, { steps: 5 });
    await expect(menu(page)).toBeHidden();
  });

  test("crossing from the button to the menu keeps it open", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /theme/i }).hover();
    await page.getByRole("button", { name: /theme/i }).click();
    // Travel up through the small gap between the button and the menu.
    await page.getByRole("menuitem", { name: /^light$/i }).hover();
    await page.waitForTimeout(300);
    await expect(menu(page)).toBeVisible();
    await page.getByRole("menuitem", { name: /^light$/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});

test.describe("theme menu on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("a tap opens it and it stays open until a choice or a tap elsewhere", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).tap();
    await page.getByRole("button", { name: /theme/i }).tap();
    await page.waitForTimeout(300);
    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByRole("menuitem", { name: /^dark$/i }).tap();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
