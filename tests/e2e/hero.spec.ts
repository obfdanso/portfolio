import { expect, test } from "@playwright/test";

const TEXT = "Front-end developer building fast, accessible interfaces.";

test("the headline reads as one sentence", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: TEXT })).toBeVisible();
  const selected = await page.getByRole("heading", { level: 1 }).evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    return selection.toString();
  });
  expect(selected.replace(/\s+/g, " ").trim()).toBe(TEXT);
});

test("the words rise on transform only, never fading", async ({ page }) => {
  await page.goto("/");
  const words = page.locator(".hero-word__inner");
  await expect(words).toHaveCount(6);
  await expect(words.first()).toHaveCSS("animation-name", "word-rise");
  const fades = await words
    .first()
    .evaluate((el) =>
      el
        .getAnimations()
        .some((a) => (a.effect as KeyframeEffect).getKeyframes().some((k) => "opacity" in k)),
    );
  expect(fades).toBe(false);
});

test.describe("hero, reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the words sit still", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hero-word__inner").first()).toHaveCSS("animation-name", "none");
  });
});
