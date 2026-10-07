import { expect, test } from "@playwright/test";

const offset = (el: Element) => getComputedStyle(el).translate;

/** The hero buttons slide in on load; measure them once they've arrived. */
const settled = (page: import("@playwright/test").Page) =>
  page.waitForFunction(() =>
    document
      .getAnimations()
      .filter((a) =>
        ((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest(".enter"),
      )
      .every((a) => a.playState === "finished"),
  );

test.describe("magnetic buttons", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("a call to action leans toward the mouse and settles when it leaves", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: "See the work" });
    await expect(cta).toHaveClass(/magnetic/);
    await settled(page);
    const box = await cta.boundingBox();
    // Inside the pill, right of and below centre (its rounded corners aren't hit).
    await page.mouse.move(box!.x + box!.width - 28, box!.y + box!.height / 2 + 10, { steps: 4 });
    const pulled = async () => (await cta.evaluate(offset)).split(" ").map(parseFloat);
    // Wait for the eased pull to settle near its target.
    await expect.poll(async () => (await pulled())[0]).toBeGreaterThan(2);
    const [x, y] = await pulled();
    expect(x).toBeGreaterThan(0);
    expect(x).toBeLessThanOrEqual(6);
    expect(y).toBeGreaterThan(0);

    await page.mouse.move(900, 800, { steps: 4 });
    await expect
      .poll(() => cta.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--mag-x")))
      .toBe("");
  });

  test("still navigates when clicked", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "See the work" }).click();
    await expect(page).toHaveURL(/\/projects$/);
  });

  test("covers the other calls to action", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Get in touch" }).first()).toHaveClass(/magnetic/);
    await expect(page.getByRole("link", { name: "See my other skills" })).toHaveClass(/magnetic/);
  });
});

test.describe("magnetic buttons, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("stay put", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: "See the work" });
    await settled(page);
    const box = await cta.boundingBox();
    await page.mouse.move(box!.x + box!.width - 28, box!.y + box!.height / 2, { steps: 4 });
    await page.waitForTimeout(200);
    expect(await cta.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--mag-x"))).toBe(
      "",
    );
  });
});
