import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/projects",
  "/projects/medispace",
  "/projects/bitby",
  "/about",
  "/resume",
  "/skills",
  "/contact",
];
// "best-practice" is included deliberately: heading-order lives there
// rather than under a wcag tag, and Lighthouse checks it. Without this
// the sweep passed while Lighthouse failed.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/**
 * next-themes re-applies the stored theme after hydration, so setting
 * data-theme after load races with it — the "dark" cases were silently
 * auditing light. Seeding localStorage before the document loads is what
 * actually pins the theme.
 */
async function visitThemed(page: import("@playwright/test").Page, route: string, theme: string) {
  await page.addInitScript((t) => window.localStorage.setItem("theme", t), theme);
  await page.goto(route);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

for (const route of ROUTES) {
  for (const theme of ["dark", "light"]) {
    test(`${route} has no accessibility violations in ${theme} mode`, async ({ page }) => {
      await visitThemed(page, route, theme);

      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("the mobile menu is accessible when open", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /open menu/i }).click();

  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(results.violations).toEqual([]);
});

test("the contact form's error state is accessible", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Ama");
  await page.getByLabel("Email").fill("bad");
  await page.getByLabel("Message").fill("Long enough to pass the length check.");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.locator("form").getByRole("alert")).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(results.violations).toEqual([]);
});

test("every page has exactly one h1", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { level: 1 }),
      `${route} should have one h1`,
    ).toHaveCount(1);
  }
});
