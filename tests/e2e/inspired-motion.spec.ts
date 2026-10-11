import { expect, test } from "@playwright/test";
import { SITE } from "@/lib/site";
import { clickSidebarLink } from "./helpers/sidebar";

// Motion drawn from the portfolio sites Danso picked out (2026-10-11): the
// greeting, the mouse-led hero and scroll-lit text.

// Takes the animation name as an argument: Playwright sends only the
// function's source to the page, so a closed-over name would be lost.
const progressOf = (el: Element, name: string) => {
  const animation = el.getAnimations().find((a) => (a as CSSAnimation).animationName === name);
  return animation?.effect?.getComputedTiming().progress ?? -1;
};

// The computed `translate` keeps percentages as written, so a percentage is
// resolved against the element's own box to give pixels.
const translateX = (el: Element) => {
  const [x = "0"] = getComputedStyle(el).translate.split(" ");
  const value = parseFloat(x) || 0;
  return x.endsWith("%") ? (value / 100) * (el as HTMLElement).offsetWidth : value;
};

test.describe("hero greeting", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("says welcome big, white and glowing, then the hero moves in", async ({ page }) => {
    await page.goto("/");
    const words = page.locator(".greeting__word");
    await expect(words).toHaveText(["Welcome"]);
    const letters = page.locator(".greeting__letter");
    await expect(letters).toHaveCount(7);
    await expect(letters.first()).toHaveCSS("animation-name", "letter-in, letter-out");
    // Transform and opacity only: an animated blur dropped frames on a
    // modest GPU for as long as it played.
    const blurs = await letters.evaluateAll((els) =>
      els.some((el) =>
        el
          .getAnimations()
          .some((a) => (a.effect as KeyframeEffect).getKeyframes().some((k) => "filter" in k)),
      ),
    );
    expect(blurs).toBe(false);
    const layer = page.locator(".greeting-layer");
    const h1 = page.getByRole("heading", { level: 1 });
    const size = (el: Element) => parseFloat(getComputedStyle(el).fontSize);
    expect(await layer.evaluate(size)).toBeGreaterThan(await h1.evaluate(size));
    await expect(layer).toHaveCSS("color", "rgb(255, 255, 255)");
    expect(await layer.evaluate((el) => getComputedStyle(el).textShadow)).not.toBe("none");

    // While it plays, the headline's words wait fully below their masks.
    const firstWord = page.locator(".hero-word__inner").first();
    expect(
      await firstWord.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).f),
    ).toBeGreaterThan(40);

    // Welcome for about 2.5s, then the hero: all settled by about 3.5s.
    await expect
      .poll(() => firstWord.evaluate(progressOf, "word-rise"), { timeout: 10_000 })
      .toBe(1);
    await expect(page.getByRole("link", { name: "See the work" })).toBeVisible();
  });

  test("Danso's name is no longer in the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main section").first().getByText(SITE.name)).toHaveCount(0);
  });

  test("plays once per visit, and again after a refresh", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".greeting-layer")).toHaveCount(1);
    await clickSidebarLink(page, "About");
    await expect(page).toHaveURL(/\/about$/);
    await clickSidebarLink(page, "Home");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".greeting-layer")).toHaveCount(0);
    await expect(page.locator(".greeting-stage")).toHaveCount(0);

    await page.reload();
    await expect(page.locator(".greeting-layer")).toHaveCount(1);
  });
});

test.describe("hero follows the mouse", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the blobs lean toward the cursor, by different amounts", async ({ page }) => {
    await page.goto("/");
    const mesh = page.locator(".mesh--follow");
    await page.mouse.move(1400, 100, { steps: 4 });
    await expect
      .poll(() =>
        mesh.evaluate((el) => parseFloat((el as HTMLElement).style.getPropertyValue("--follow-x"))),
      )
      .toBeGreaterThan(0.8);

    const lime = page.locator(".mesh--follow .mesh__blob--lime");
    const emerald = page.locator(".mesh--follow .mesh__blob--emerald");
    await expect.poll(() => lime.evaluate(translateX)).toBeGreaterThan(20);
    // The emerald leans the other way, which is what gives the wash depth.
    await expect.poll(() => emerald.evaluate(translateX)).toBeLessThan(-20);
  });

  test("ignores touch pointers", async ({ page }) => {
    await page.goto("/");
    const mesh = page.locator(".mesh--follow");
    await mesh.dispatchEvent("pointermove", {
      pointerType: "touch",
      clientX: 1400,
      clientY: 100,
      bubbles: true,
    });
    await page.waitForTimeout(100);
    expect(
      await mesh.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--follow-x")),
    ).toBe("");
  });
});

test.describe("scroll-lit About text", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const viewport of [
    { width: 1440, height: 1400 },
    { width: 390, height: 844 },
  ]) {
    test(`every word is lit by the bottom of the page at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect
        .poll(() => page.locator(".scroll-lit__word").last().evaluate(progressOf, "word-light"))
        .toBe(1);
    });
  }

  test("starts muted and lights up word by word as it scrolls up", async ({ page }) => {
    await page.goto("/");
    const words = page.locator(".scroll-lit__word");
    await expect(words.first()).toHaveCSS("animation-name", "word-light");
    const last = words.last();
    expect(await last.evaluate(progressOf, "word-light")).toBeLessThan(0.05);

    await page.locator(".scroll-lit").evaluate((el) => el.scrollIntoView({ block: "center" }));
    // Halfway up the screen, the first words are lit.
    await expect.poll(() => words.first().evaluate(progressOf, "word-light")).toBe(1);

    // It sits near the end of the page; the last word must be lit by the bottom.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => last.evaluate(progressOf, "word-light")).toBe(1);
  });

  test("still reads as one paragraph", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator(".scroll-lit").evaluate((el) => el.textContent);
    expect(text).toMatch(/^I am a computer science student at KNUST\. I care about/);
  });
});

test.describe("inspired motion, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("the greeting is skipped and the hero is simply there", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".greeting-layer")).toBeHidden();
    await expect(page.locator(".hero-word__inner").first()).toHaveCSS("animation-name", "none");
    await expect(page.getByRole("link", { name: "See the work" })).toBeVisible();
  });

  test("the hero ignores the mouse", async ({ page }) => {
    await page.goto("/");
    await page.mouse.move(1400, 100, { steps: 4 });
    await page.waitForTimeout(100);
    expect(
      await page
        .locator(".mesh--follow")
        .evaluate((el) => (el as HTMLElement).style.getPropertyValue("--follow-x")),
    ).toBe("");
  });

  test("scroll effects hold still", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".scroll-lit__word").first()).toHaveCSS("animation-name", "none");
  });
});
