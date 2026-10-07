import { expect, test } from "@playwright/test";
import { resume } from "@/content/resume";

const ITEMS = resume.skills
  .filter((g) => ["Front-end", "Mobile and desktop"].includes(g.group))
  .flatMap((g) => g.items);

test.describe("tech marquee", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("lists each tool once for assistive technology", async ({ page }) => {
    await page.goto("/");
    const band = page.getByRole("region", { name: "Tools I build with" });
    await expect(band.getByRole("listitem")).toHaveText(ITEMS);
  });

  test("drifts, and pauses under the mouse", async ({ page }) => {
    await page.goto("/");
    const track = page.locator(".marquee__track");
    await expect(track).toHaveCSS("animation-name", "marquee");
    // The track never stops moving, so point at the still band around it.
    await page.locator(".marquee").scrollIntoViewIfNeeded();
    const band = await page.locator(".marquee").boundingBox();
    await page.mouse.move(band!.x + band!.width / 2, band!.y + band!.height / 2);
    await expect(track).toHaveCSS("animation-play-state", "paused");
  });
});

test("is not rendered until it nears the screen", async ({ page }) => {
  // Regression: the endless band below the hero cost the home page about
  // five Lighthouse points while it was still off-screen.
  await page.goto("/");
  await expect(page.locator(".marquee")).toHaveCSS("content-visibility", "auto");
});

test.describe("tech marquee, phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("does not make the page scroll sideways", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});

test.describe("tech marquee, reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("sits still as a plain list", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".marquee__track")).toHaveCSS("animation-name", "none");
    await expect(page.locator('.marquee__list[aria-hidden="true"]')).toBeHidden();
  });
});
