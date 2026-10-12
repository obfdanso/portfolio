import { expect, test } from "@playwright/test";
import { resume } from "@/content/resume";

// The resume reads as a timeline that responds to scrolling (Danso's call,
// 2026-10-12: "not like scrolling a lecturer's slide").

const progressOf = (el: Element, name: string) => {
  const animation = el.getAnimations().find((a) => (a as CSSAnimation).animationName === name);
  return animation?.effect?.getComputedTiming().progress ?? -1;
};

const lineProgress = (el: Element) => {
  const animation = el
    .getAnimations({ subtree: true })
    .find((a) => (a as CSSAnimation).animationName === "line-draw");
  return animation?.effect?.getComputedTiming().progress ?? -1;
};

test.describe("resume timeline", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("lists every entry as a card on the timeline", async ({ page }) => {
    await page.goto("/resume");
    await expect(page.locator(".resume-entry")).toHaveCount(
      resume.experience.length + resume.education.length,
    );
    for (const entry of resume.experience) {
      await expect(
        page.getByRole("heading", { level: 3, name: `${entry.title} · ${entry.org}` }),
      ).toBeVisible();
    }
  });

  test("the line draws and the dots light up as the page scrolls", async ({ page }) => {
    await page.goto("/resume");
    const timeline = page.locator(".scroll-line").first();
    const lastDot = page.locator(".scroll-line").first().locator(".resume-entry__dot").last();
    expect(await timeline.evaluate(lineProgress)).toBeLessThan(0.5);
    expect(await lastDot.evaluate(progressOf, "dot-light")).toBeLessThan(1);

    await page
      .locator(".scroll-line")
      .first()
      .evaluate((el) => el.scrollIntoView({ block: "end", behavior: "instant" }));
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: "instant" }));
    await expect.poll(() => timeline.evaluate(lineProgress)).toBeGreaterThan(0.9);
    await expect.poll(() => lastDot.evaluate(progressOf, "dot-light")).toBe(1);
  });

  test("moves text without ever fading it, so its contrast holds", async ({ page }) => {
    await page.goto("/resume");
    const fades = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) =>
          ["entry-slide", "point-in", "chip-pop"].includes((a as CSSAnimation).animationName),
        )
        .some((a) => (a.effect as KeyframeEffect).getKeyframes().some((k) => "opacity" in k)),
    );
    expect(fades).toBe(false);
  });

  test("shows the skills as chips", async ({ page }) => {
    await page.goto("/resume");
    const chips = page.locator(".resume-chip");
    await expect(chips).toHaveCount(resume.skills.flatMap((group) => group.items).length);
  });

  test("the download button leans toward the mouse like the other calls to action", async ({
    page,
  }) => {
    await page.goto("/resume");
    await expect(page.getByRole("link", { name: "Download PDF" })).toContainClass("magnetic");
  });
});

test.describe("resume timeline, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("holds still, with the line drawn and the dots lit", async ({ page }) => {
    await page.goto("/resume");
    await expect(page.locator(".resume-entry").first()).toHaveCSS("animation-name", "none");
    await expect(page.locator(".resume-chip").first()).toHaveCSS("animation-name", "none");
    const dot = page.locator(".resume-entry__dot").last();
    expect(await dot.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      await page.evaluate(() => {
        const probe = document.createElement("div");
        probe.style.color = "var(--color-accent)";
        document.body.append(probe);
        return getComputedStyle(probe).color;
      }),
    );
  });
});
