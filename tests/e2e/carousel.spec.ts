import { expect, test, type Page } from "@playwright/test";
import { getFrontendProjects } from "@/lib/content";

const COUNT = getFrontendProjects().length;

const carousel = (page: Page) => page.getByRole("region", { name: "Selected work" });
const currentDot = (page: Page) => carousel(page).locator(".carousel__dot[aria-current]");

/** Brings the carousel on screen with the mouse well away from it. */
async function showCarousel(page: Page) {
  await page.goto("/");
  await carousel(page).evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await page.mouse.move(5, 5);
}

test.describe("project carousel", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("shows every front-end project as a slide", async ({ page }) => {
    await showCarousel(page);
    await expect(carousel(page).getByRole("article")).toHaveCount(COUNT);
    await expect(carousel(page).locator(".carousel__dot")).toHaveCount(COUNT);
    await expect(currentDot(page)).toHaveAccessibleName(/^Show /);
  });

  test("slides to the next project on its own", async ({ page }) => {
    await showCarousel(page);
    const first = await currentDot(page).getAttribute("aria-label");
    await expect
      .poll(() => currentDot(page).getAttribute("aria-label"), { timeout: 9_000 })
      .not.toBe(first);
  });

  test("the dots go straight to a project", async ({ page }) => {
    await showCarousel(page);
    const last = getFrontendProjects().at(-1)!.title;
    await carousel(page)
      .getByRole("button", { name: `Show ${last}` })
      .click();
    await expect(currentDot(page)).toHaveAccessibleName(`Show ${last}`);
  });

  test("the pause button stops it", async ({ page }) => {
    await showCarousel(page);
    await carousel(page).getByRole("button", { name: "Pause the slideshow" }).click();
    await expect(carousel(page).getByRole("button", { name: "Play the slideshow" })).toBeVisible();
    // Move focus and the mouse out too, so only the pause is holding it.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.mouse.move(5, 5);
    const held = await currentDot(page).getAttribute("aria-label");
    await page.waitForTimeout(6_500);
    await expect(currentDot(page)).toHaveAttribute("aria-label", held!);
  });

  test("holds still while the mouse is over it", async ({ page }) => {
    await showCarousel(page);
    await carousel(page).locator(".carousel__slide[data-current]").hover();
    const held = await currentDot(page).getAttribute("aria-label");
    await page.waitForTimeout(6_500);
    await expect(currentDot(page)).toHaveAttribute("aria-label", held!);
  });

  test("leaves the screenshot clear, with the name and actions below it", async ({ page }) => {
    await showCarousel(page);
    const slide = carousel(page).locator(".carousel__slide[data-current]");
    const media = await slide.locator(".carousel__media").boundingBox();
    const title = await slide.getByRole("heading").boundingBox();
    expect(title!.y).toBeGreaterThanOrEqual(media!.y + media!.height);
    await expect(slide.getByRole("link", { name: "Case study" })).toBeVisible();
    await expect(slide.getByRole("link", { name: "Source" })).toBeVisible();
  });

  test("a slide opens its case study", async ({ page }) => {
    await showCarousel(page);
    await carousel(page).getByRole("button", { name: "Pause the slideshow" }).click();
    const slide = carousel(page).locator(".carousel__slide[data-current]");
    const title = await slide.getByRole("heading").innerText();
    await slide.getByRole("link", { name: "Case study" }).click();
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  });
});

test.describe("project carousel, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("never moves on its own", async ({ page }) => {
    await showCarousel(page);
    const first = await currentDot(page).getAttribute("aria-label");
    await page.waitForTimeout(6_500);
    await expect(currentDot(page)).toHaveAttribute("aria-label", first!);
  });
});
