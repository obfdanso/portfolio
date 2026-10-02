import { expect, test } from "@playwright/test";

test("gradient blobs hold still under reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");

  const animationName = await page
    .locator(".mesh__blob")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);

  expect(animationName).toBe("none");
  await context.close();
});

test("gradient blobs drift when motion is allowed", async ({ page }) => {
  await page.goto("/");

  const animationName = await page
    .locator(".mesh__blob")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);

  expect(animationName).toBe("mesh-drift-a");
});

test("the gradient is hidden from the accessibility tree", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".mesh")).toHaveAttribute("aria-hidden", "true");
});

test("the gradient animates only transform, never layout properties", async ({ page }) => {
  await page.goto("/");

  // Guards the performance budget: a keyframe touching width/top/left would
  // force layout on every frame.
  const forbidden = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    const banned = ["width", "height", "top", "left", "right", "bottom", "background-position"];
    const offenders: string[] = [];

    for (const sheet of sheets) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSKeyframesRule)) continue;
        if (!rule.name.startsWith("mesh-drift")) continue;
        for (const frame of Array.from(rule.cssRules)) {
          const text = frame.cssText;
          for (const property of banned) {
            if (new RegExp(`[{;\\s]${property}\\s*:`).test(text)) {
              offenders.push(`${rule.name}: ${property}`);
            }
          }
        }
      }
    }
    return offenders;
  });

  expect(forbidden).toEqual([]);
});

test("the blobs are soft without a blur filter", async ({ page }) => {
  // filter: blur(110px) on the blobs doubled the paint cost of every tap and
  // dropped GPU-less phones to about 12 frames a second. The softness now
  // comes from eased gradient stops, which cost nothing to animate.
  await page.goto("/");
  const filters = await page
    .locator(".mesh__blob")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).filter));
  expect(filters.length).toBe(3);
  for (const f of filters) expect(f).toBe("none");
});
