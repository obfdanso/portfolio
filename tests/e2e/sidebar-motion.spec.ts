import { expect, test } from "@playwright/test";
import { recordTransitions, recorded } from "./helpers/view-transitions";
import { clickSidebarLink } from "./helpers/sidebar";

/** The top edge of each sidebar link, in list order. */
const tops = (page: import("@playwright/test").Page) =>
  page
    .getByRole("complementary", { name: /main/i })
    .locator("nav .nav-item")
    .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));

/** True when the links stand one under another, in order. */
const spread = async (page: import("@playwright/test").Page) => {
  const t = await tops(page);
  return t.every((y, i) => i === 0 || y - t[i - 1] > 40);
};

test.describe("sliding sidebar indicator", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the highlight glides to the new section", async ({ page }) => {
    await page.goto("/");
    await recordTransitions(page);
    await clickSidebarLink(page, "About");
    await expect(page).toHaveURL(/\/about$/);
    await expect.poll(() => recorded(page)).toContain("::view-transition-group(nav-highlight)|400");
  });

  test("the highlight sits on the active link", async ({ page }) => {
    await page.goto("/resume");
    const nav = page.getByRole("complementary", { name: /main/i });
    const link = await nav.getByRole("link", { name: "Resume", exact: true }).boundingBox();
    const glow = await nav.locator(".nav-highlight").boundingBox();
    expect(Math.abs(glow!.y - link!.y)).toBeLessThanOrEqual(1);
    await expect(nav.locator(".nav-highlight")).toHaveCount(1);
  });
});

test.describe("sidebar links", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("shows every link at once, in order, on every page", async ({ page }) => {
    for (const route of ["/", "/resume", "/projects/pos", "/skills"]) {
      await page.goto(route);
      await page.mouse.move(900, 450);
      expect(await spread(page), route).toBe(true);
      const nav = page.getByRole("complementary", { name: /main/i });
      const opacities = await nav
        .locator("nav li")
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
      expect(opacities, route).toEqual(["1", "1", "1", "1"]);
    }
  });
});

test.describe("sliding sidebar indicator, phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the mobile menu does not glide", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.locator("#mobile-nav .nav-highlight")).toHaveCount(0);
  });
});
