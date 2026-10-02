import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/projects", "/projects/medispace", "/about", "/resume", "/contact"];

test("the hero enters with a staggered load animation", async ({ page }) => {
  await page.goto("/");

  const items = page.locator(".enter");
  await expect(items.first()).toBeVisible();

  const delays = await items.evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).animationDelay),
  );

  // Staggered, not simultaneous: more than one distinct delay on the page.
  expect(new Set(delays).size).toBeGreaterThan(1);
  expect(delays.every((d) => d !== "")).toBe(true);
});

test("entrance animations finish opaque", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByRole("heading", { level: 1 });
  await expect(hero).toBeVisible();

  // Past the longest delay plus duration.
  await page.waitForTimeout(900);
  const opacity = await hero.evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe("1");
});

test("buttons lift on hover and press on active", async ({ page }) => {
  await page.goto("/");
  const button = page.getByRole("link", { name: /see the work/i });

  const resting = await button.evaluate((el) => getComputedStyle(el).transform);
  await button.hover();
  await page.waitForTimeout(220);
  const hovered = await button.evaluate((el) => getComputedStyle(el).transform);

  expect(hovered).not.toBe(resting);
  expect(hovered).not.toBe("none");
});

test("the transition uses the brand easing and a permitted duration", async ({ page }) => {
  await page.goto("/");
  const button = page.getByRole("link", { name: /see the work/i });

  // toHaveCSS retries until styles settle. A one-shot evaluate() read raced
  // stylesheet application under full parallel load and saw the initial "ease".
  await expect(button).toHaveCSS(
    "transition-timing-function",
    /cubic-bezier\(0\.22, 1, 0\.36, 1\)/,
  );

  const durations = await button.evaluate((el) =>
    getComputedStyle(el)
      .transitionDuration.split(",")
      .map((d) => d.trim()),
  );
  // Only the three interaction tokens are permitted.
  for (const d of durations) {
    expect(["0.12s", "0.24s", "0.4s"]).toContain(d);
  }
});

test("nav items respond to hover", async ({ page }) => {
  await page.goto("/");
  const item = page.getByRole("complementary", { name: /main/i }).getByRole("link", {
    name: "Projects",
    exact: true,
  });

  await item.hover();
  await page.waitForTimeout(260);
  const transform = await item.evaluate((el) => getComputedStyle(el).transform);
  expect(transform).not.toBe("none");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("disables entrance animations without hiding content", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);

      const entries = page.locator(".enter");
      const count = await entries.count();
      if (count === 0) continue;

      const states = await entries.evaluateAll((els) =>
        els.map((el) => {
          const s = getComputedStyle(el);
          return { animation: s.animationName, opacity: s.opacity };
        }),
      );

      for (const s of states) {
        expect(s.animation, `${route} should not animate entrances`).toBe("none");
        // The important half: content must still be visible.
        expect(s.opacity, `${route} content must stay visible`).toBe("1");
      }
    }
  });

  test("disables button hover motion", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("link", { name: /see the work/i });
    await button.hover();
    await page.waitForTimeout(200);

    const transform = await button.evaluate((el) => getComputedStyle(el).transform);
    expect(transform).toBe("none");
  });

  test("keeps the heading readable on every route", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
});

test("no page heading fades in from transparent", async ({ page }) => {
  // Regression: animating the h1 from opacity 0 disqualified it as a Largest
  // Contentful Paint candidate, so Lighthouse reported NO_LCP and scored
  // performance at zero. Headings may travel, but must paint opaque.
  for (const route of ROUTES) {
    await page.goto(route);

    const animatesOpacity = await page.getByRole("heading", { level: 1 }).evaluate((el) => {
      const name = getComputedStyle(el).animationName;
      if (name === "none") return false;

      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const rule of Array.from(rules)) {
          if (!(rule instanceof CSSKeyframesRule) || rule.name !== name) continue;
          for (const frame of Array.from(rule.cssRules)) {
            if (/[{;\s]opacity\s*:/.test(frame.cssText)) return true;
          }
        }
      }
      return false;
    });

    expect(animatesOpacity, `${route}: h1 must not fade in — it costs LCP`).toBe(false);
  }
});

test("entrance animations never shift layout", async ({ page }) => {
  await page.goto("/");

  // Only opacity and transform may be animated; anything else risks CLS.
  const props = await page.evaluate(() => {
    const banned = ["width", "height", "top", "left", "right", "bottom", "margin", "padding"];
    const offenders: string[] = [];

    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSKeyframesRule)) continue;
        if (!/^(enter|menu)-/.test(rule.name)) continue;
        for (const frame of Array.from(rule.cssRules)) {
          for (const property of banned) {
            if (new RegExp(`[{;\\s]${property}\\s*:`).test(frame.cssText)) {
              offenders.push(`${rule.name}: ${property}`);
            }
          }
        }
      }
    }
    return offenders;
  });

  expect(props).toEqual([]);
});

test.describe("entrance on navigation", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  async function clickSidebar(page: import("@playwright/test").Page, label: string, path: RegExp) {
    await page
      .getByRole("complementary", { name: /main/i })
      .getByRole("link", { name: label, exact: true })
      .click();
    await expect(page).toHaveURL(path);
  }

  test("a fresh visit keeps the full staggered entrance", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-navigated");
    const delays = await page
      .locator("main .enter")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationDelay));
    expect(new Set(delays).size).toBeGreaterThan(1);
  });

  test("pages reached by a click swap in quickly, with no stagger", async ({ page }) => {
    await page.goto("/");
    await clickSidebar(page, "About", /\/about$/);
    await expect(page.locator("html")).toHaveAttribute("data-navigated", "");

    const timing = await page.locator("main .enter").evaluateAll((els) =>
      els.map((el) => {
        const s = getComputedStyle(el);
        return { delay: s.animationDelay, duration: s.animationDuration };
      }),
    );
    expect(timing.length).toBeGreaterThan(0);
    for (const t of timing) {
      expect(t.delay).toBe("0s");
      expect(t.duration).toBe("0.12s");
    }
  });

  test("headings still travel without fading after a navigation", async ({ page }) => {
    await page.goto("/");
    await clickSidebar(page, "Resume", /\/resume$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
      "animation-name",
      "enter-quick-solid",
    );
  });

  test("the back button counts as a navigation", async ({ page }) => {
    await page.goto("/");
    await clickSidebar(page, "Projects", /\/projects$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    // Every entry, not just the first: the first one has no stagger delay
    // anyway, so checking it alone passed before this was implemented.
    const delays = await page
      .locator("main .enter")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationDelay));
    expect(delays.length).toBeGreaterThan(1);
    expect(new Set(delays)).toEqual(new Set(["0s"]));
  });

  test("a reload restores the full entrance", async ({ page }) => {
    await page.goto("/");
    await clickSidebar(page, "About", /\/about$/);
    await expect(page.locator("html")).toHaveAttribute("data-navigated", "");
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-navigated");
  });

  test("an external or in-page link does not count as a navigation", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter"); // the skip link, an in-page anchor
    await expect(page.locator("html")).not.toHaveAttribute("data-navigated");
  });
});

test.describe("entrance on navigation, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("stays off after a navigation", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("complementary", { name: /main/i })
      .getByRole("link", { name: "About", exact: true })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("main .enter").first()).toHaveCSS("animation-name", "none");
  });
});

test.describe("taps on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("links and buttons skip the double-tap-to-zoom wait", async ({ page }) => {
    // touch-action: manipulation tells the browser a tap is never the first
    // half of a double-tap zoom, so it can act on the tap immediately.
    await page.goto("/");
    const actions = await page
      .locator("a, button")
      .evaluateAll((els) => [...new Set(els.map((el) => getComputedStyle(el).touchAction))]);
    expect(actions).toEqual(["manipulation"]);
  });
});
