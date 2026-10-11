import { expect, test } from "@playwright/test";
import { recordTransitions, recorded } from "./helpers/view-transitions";
import { clickSidebarLink } from "./helpers/sidebar";

/** The top edge of each sidebar link, in list order. */
const tops = (page: import("@playwright/test").Page) =>
  page
    .getByRole("complementary", { name: /main/i })
    .locator(".nav-deck .nav-item")
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

test.describe("sidebar deck", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("rests as a deck with the current page in front", async ({ page }) => {
    await page.goto("/resume");
    await page.mouse.move(900, 450);
    const nav = page.getByRole("complementary", { name: /main/i });
    const cards = nav.locator(".nav-deck__card");
    // Everything slides up into the first slot...
    await expect
      .poll(async () => {
        const t = await tops(page);
        return Math.max(...t) - Math.min(...t);
      })
      .toBeLessThan(2);
    // ...where only the current page's card shows, edges peeking below it.
    await expect(nav.locator(".nav-deck__card[data-front]")).toHaveCount(1);
    await expect(nav.locator(".nav-deck__card[data-front]")).toContainText("Resume");
    const opacities = await cards.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).opacity),
    );
    expect(opacities).toEqual(["0", "0", "0", "1"]);
    // The hidden links stay in the accessibility tree.
    await expect(nav.getByRole("link", { name: "Home", exact: true })).toHaveCount(1);
  });

  test("fans out in the usual order on hover, and on keyboard focus", async ({ page }) => {
    await page.goto("/resume");
    const nav = page.getByRole("complementary", { name: /main/i });
    await nav.locator(".nav-deck").hover();
    await expect.poll(() => spread(page)).toBe(true);

    await page.mouse.move(900, 450);
    await nav.getByRole("link", { name: "Home", exact: true }).focus();
    await expect.poll(() => spread(page)).toBe(true);
  });
});

test.describe("sidebar deck after moving around", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("folds back into a deck after a link is clicked", async ({ page }) => {
    // Regression: the clicked link kept focus, which held the deck open.
    await page.goto("/");
    await clickSidebarLink(page, "Projects");
    await expect(page).toHaveURL(/\/projects$/);
    await page.mouse.move(900, 450);
    await expect
      .poll(async () => {
        const t = await tops(page);
        return Math.max(...t) - Math.min(...t);
      })
      .toBeLessThan(30);
  });

  test("pages with no link of their own keep a readable plain list", async ({ page }) => {
    for (const route of ["/skills", "/contact"]) {
      await page.goto(route);
      await page.mouse.move(900, 450);
      const nav = page.getByRole("complementary", { name: /main/i });
      await expect(nav.locator(".nav-deck"), route).toHaveCount(0);
      const labels = await nav
        .locator(".nav-item__label")
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
      expect(labels, route).toEqual(["1", "1", "1", "1"]);
    }
  });
});

test.describe("sidebar deck, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("is a plain list", async ({ page }) => {
    await page.goto("/resume");
    await page.mouse.move(900, 450);
    expect(await spread(page)).toBe(true);
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
