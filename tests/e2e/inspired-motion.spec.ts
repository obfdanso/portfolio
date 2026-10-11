import { expect, test } from "@playwright/test";
import { SITE } from "@/lib/site";

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
  test("says welcome, then settles on the name", async ({ page }) => {
    await page.goto("/");
    const words = page.locator(".greeting__word");
    await expect(words).toHaveText(["Welcome", "Bonne arrivée", "Akwaaba"]);
    await expect(words.first()).toHaveCSS("animation-name", "greet-pass");
    const name = page.locator(".greeting__name");
    await expect(name).toHaveText(SITE.name);
    // Three greetings of 1.6s each, then the name: about 5.2s in all. It ends
    // finished and held in place by its fill.
    await expect.poll(() => name.evaluate(progressOf, "greet-settle"), { timeout: 10_000 }).toBe(1);
    expect(
      await name.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).isIdentity),
    ).toBe(true);
  });

  test("never fades, so nothing waits on it to be read", async ({ page }) => {
    await page.goto("/");
    const fades = await page
      .locator(".greeting > *")
      .evaluateAll((els) =>
        els.some((el) =>
          el
            .getAnimations()
            .some((a) => (a.effect as KeyframeEffect).getKeyframes().some((k) => "opacity" in k)),
        ),
      );
    expect(fades).toBe(false);
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

  test("the greeting is skipped and the name simply sits there", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".greeting__word").first()).toBeHidden();
    await expect(page.locator(".greeting__name")).toHaveCSS("animation-name", "none");
    await expect(page.locator(".greeting__name")).toBeVisible();
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
