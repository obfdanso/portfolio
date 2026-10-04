import { expect, test } from "@playwright/test";

const SECTIONS = [
  { title: "Backend", level: "Working knowledge" },
  { title: "Databases and SQL", level: "Working knowledge" },
  { title: "Networking", level: "Good knowledge" },
  { title: "AI tools", level: "Proficient" },
];

test.describe("skills page", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("is titled and headed for what it holds", async ({ page }) => {
    await page.goto("/skills");
    await expect(page).toHaveTitle(/^Skills/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Beyond the front end" }),
    ).toBeVisible();
  });

  test("shows the four sections in order, each with its level", async ({ page }) => {
    await page.goto("/skills");
    const headings = page.getByRole("heading", { level: 2 });
    await expect(headings).toHaveText(SECTIONS.map((s) => s.title));

    for (const { title, level } of SECTIONS) {
      const section = page.getByRole("region", { name: title });
      await expect(section.getByText(level, { exact: true })).toBeVisible();
    }
  });

  test("links each piece of evidence to its proof", async ({ page }) => {
    await page.goto("/skills");
    const expected: Array<[string, RegExp, string]> = [
      ["Backend", /POS/, "/projects/pos"],
      ["Databases and SQL", /POS/, "/projects/pos"],
      ["Networking", /intercli/, "/projects/intercli"],
      ["AI tools", /This site/, "https://github.com/obfdanso/portfolio"],
      ["AI tools", /intercli/, "/projects/intercli"],
      ["AI tools", /Smart Socket/, "/projects/smartsocket"],
    ];
    for (const [section, name, href] of expected) {
      await expect(
        page.getByRole("region", { name: section }).getByRole("link", { name }),
      ).toHaveAttribute("href", href);
    }
  });

  test("still reaches intercli's case study", async ({ page }) => {
    await page.goto("/skills");
    await page
      .getByRole("region", { name: "Networking" })
      .getByRole("link", { name: /intercli/ })
      .click();
    await expect(page).toHaveURL(/\/projects\/intercli$/);
    await expect(page.getByRole("heading", { level: 1, name: "intercli" })).toBeVisible();
  });

  test("has no skills link in the sidebar", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("complementary", { name: /main/i });
    await expect(nav.getByRole("link", { name: /skills/i })).toHaveCount(0);
  });

  test("highlights no sidebar section", async ({ page }) => {
    await page.goto("/skills");
    const nav = page.getByRole("complementary", { name: /main/i });
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(0);
  });

  test("sections travel in without fading", async ({ page }) => {
    // Regression: a fading reveal caught at the fold left its text half
    // transparent, and the contrast audit failed on whichever section sat there.
    await page.goto("/skills");
    const names = await page
      .locator("main .reveal")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(new Set(names)).toEqual(new Set(["reveal-in-solid"]));
  });

  for (const route of ["/", "/projects"]) {
    test(`the call to action on ${route} leads to the skills page`, async ({ page }) => {
      await page.goto(route);
      await page.getByRole("main").getByRole("link", { name: "See my other skills" }).click();
      await expect(page).toHaveURL(/\/skills$/);
      await expect(
        page.getByRole("heading", { level: 1, name: "Beyond the front end" }),
      ).toBeVisible();
    });
  }

  test("the home call to action follows Selected work", async ({ page }) => {
    await page.goto("/");
    const work = page.locator("section", {
      has: page.getByRole("heading", { level: 2, name: /selected work/i }),
    });
    await expect(work.getByRole("link", { name: "See my other skills" })).toBeVisible();
  });

  test("a section can be linked to directly", async ({ page }) => {
    await page.goto("/skills#networking");
    await expect(page.getByRole("heading", { level: 2, name: "Networking" })).toBeInViewport();
  });
});

test.describe("skills page, phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("does not scroll sideways on a phone", async ({ page }) => {
    await page.goto("/skills");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });

  test("a deep link clears the top bar", async ({ page }) => {
    await page.goto("/skills#networking");
    const heading = page.getByRole("heading", { level: 2, name: "Networking" });
    await expect(heading).toBeInViewport();

    // The site scrolls smoothly, so wait for the jump to settle before
    // measuring; a mid-scroll reading would pass for the wrong reason.
    await expect
      .poll(async () => {
        const before = await page.evaluate(() => window.scrollY);
        await page.waitForTimeout(100);
        return before === (await page.evaluate(() => window.scrollY));
      })
      .toBe(true);

    // The mobile top bar is the only <header> in the layout.
    const barBox = await page.locator("header").first().boundingBox();
    const headingBox = await heading.boundingBox();
    expect(headingBox!.y).toBeGreaterThanOrEqual(barBox!.y + barBox!.height);
  });
});

test.describe("skills page, reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("every section is fully visible under reduced motion", async ({ page }) => {
    await page.goto("/skills");
    const opacities = await page
      .locator("main .reveal")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    expect(opacities).toHaveLength(SECTIONS.length);
    expect(new Set(opacities)).toEqual(new Set(["1"]));
  });
});
