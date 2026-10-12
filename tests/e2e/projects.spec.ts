import { expect, test } from "@playwright/test";
import { getFrontendProjects } from "@/lib/content";
import { waitForHydration } from "./helpers/hydration";

// Read from the content folder by category, so adding a project needs no test
// edits. intercli is "other" and appears only on the skills page.
const PROJECT_COUNT = getFrontendProjects().length;

/** The filter is folded behind a "Stack" pill; open it before using it. */
const openFilter = (page: import("@playwright/test").Page) =>
  page.locator(".filter-disclosure summary").click();

test.describe("project index", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("lists every front-end project", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("article")).toHaveCount(PROJECT_COUNT);
  });

  test("offers no filter for a stack only intercli uses", async ({ page }) => {
    await page.goto("/projects");
    await openFilter(page);
    for (const tag of ["C++", "OpenSSL", "CMake"]) {
      await expect(page.getByRole("button", { name: tag, exact: true })).toHaveCount(0);
    }
  });

  test("folds the stack filter behind a Stack pill until it is clicked", async ({ page }) => {
    await page.goto("/projects");
    const filters = page.getByRole("group", { name: "Filter by stack" });
    await expect(filters).toBeHidden();
    await openFilter(page);
    await expect(filters).toBeVisible();
    await expect(filters.getByRole("button", { name: "All", exact: true })).toBeVisible();
  });

  test("the Stack pill names the active filter while closed", async ({ page }) => {
    await page.goto("/projects");
    await openFilter(page);
    await page.getByRole("button", { name: "TypeScript", exact: true }).click();
    const summary = page.locator(".filter-disclosure summary");
    await expect(summary).toHaveText(/Stack\s*· TypeScript/);
    await summary.click();
    await expect(page.getByRole("group", { name: "Filter by stack" })).toBeHidden();
    await expect(summary).toHaveText(/· TypeScript/);
  });

  test("leaves intercli off the list", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("link", { name: "intercli", exact: true })).toHaveCount(0);
  });

  test("filters by stack tag and can be cleared", async ({ page }) => {
    await page.goto("/projects");
    await openFilter(page);
    await page.getByRole("button", { name: "TypeScript", exact: true }).click();
    // Only the projects that use the tag remain. The filter updates inside a
    // view transition, so wait for it to settle.
    const typescript = getFrontendProjects().filter((p) => p.stack.includes("TypeScript"));
    const shown = page.getByRole("article");
    await expect(shown).toHaveCount(typescript.length);
    const titles = await shown.locator("h2").allTextContents();
    expect(titles.sort()).toEqual(typescript.map((p) => p.title).sort());

    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(PROJECT_COUNT);
  });

  test("marks the active filter for assistive technology", async ({ page }) => {
    await page.goto("/projects");
    await openFilter(page);
    const all = page.getByRole("button", { name: "All", exact: true });
    await expect(all).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "JavaScript", exact: true }).click();
    await expect(all).toHaveAttribute("aria-pressed", "false");
  });

  test("the arrow keys step through the cards", async ({ page }) => {
    await page.goto("/projects");
    await waitForHydration(page);

    const firstCardLink = page.getByRole("article").nth(0).getByRole("link").first();
    await firstCardLink.focus();
    await page.keyboard.press("ArrowRight");

    await expect(page.getByRole("article").nth(1).getByRole("link").first()).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await expect(firstCardLink).toBeFocused();
  });

  test("Tab stays on the middle card; the dots reach the rest", async ({ page }) => {
    // As on the home page: the cards either side keep their name and buttons
    // hidden until they slide to the middle.
    await page.goto("/projects");
    const middle = page.locator(".carousel__slide[data-current]");
    await middle.getByRole("link").first().focus();
    const links = await middle.getByRole("link").count();
    for (let i = 1; i < links; i += 1) await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: /^Show / }).first()).toBeFocused();
  });

  test("the arrow keys hold at the ends", async ({ page }) => {
    await page.goto("/projects");
    await waitForHydration(page);

    const firstCardLink = page.getByRole("article").nth(0).getByRole("link").first();
    await firstCardLink.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(firstCardLink).toBeFocused();
  });

  test("is a carousel across the page, like the home page", async ({ page }) => {
    await page.goto("/projects");
    const carousel = page.getByRole("region", { name: "Projects" });
    const track = carousel.locator(".carousel__track");
    expect(await track.evaluate((el) => getComputedStyle(el).overflowX)).toBe("auto");
    await expect(carousel.locator(".carousel__dot")).toHaveCount(PROJECT_COUNT);
    await carousel.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.mouse.move(5, 5);
    const dot = carousel.locator(".carousel__dot[aria-current]");
    const first = await dot.getAttribute("aria-label");
    await expect.poll(() => dot.getAttribute("aria-label"), { timeout: 9_000 }).not.toBe(first);
  });

  test("a new filter starts the carousel over from its first card", async ({ page }) => {
    await page.goto("/projects");
    const carousel = page.getByRole("region", { name: "Projects" });
    await carousel.getByRole("button", { name: "Show bitby" }).click();
    await expect(carousel.locator(".carousel__dot[aria-current]")).toHaveAccessibleName(
      "Show bitby",
    );
    await openFilter(page);
    await page.getByRole("button", { name: "TypeScript", exact: true }).click();
    await expect(carousel.locator(".carousel__slide").first()).toHaveAttribute(
      "data-current",
      "true",
    );
  });
});

test.describe("project index, narrow", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("stays a swipeable carousel on a phone", async ({ page }) => {
    await page.goto("/projects");
    const track = page.getByRole("region", { name: "Projects" }).locator(".carousel__track");
    expect(await track.evaluate((el) => getComputedStyle(el).overflowX)).toBe("auto");
  });
});

test.describe("project index, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("never moves on its own under reduced motion", async ({ page }) => {
    await page.goto("/projects");
    const carousel = page.getByRole("region", { name: "Projects" });
    await carousel.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.mouse.move(5, 5);
    const dot = carousel.locator(".carousel__dot[aria-current]");
    const first = await dot.getAttribute("aria-label");
    await page.waitForTimeout(6_500);
    await expect(dot).toHaveAttribute("aria-label", first!);
  });
});
