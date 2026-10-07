import { expect, test } from "@playwright/test";
import { recordTransitions, recorded } from "./helpers/view-transitions";

test("theme choice persists across reload without a flash", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /theme/i }).click();
  await page.getByRole("menuitem", { name: /^light$/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("defaults to dark when the system prefers dark", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await context.close();
});

test.describe("theme menu closes when you move on", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const menu = (page: import("@playwright/test").Page) => page.getByRole("menu");

  test("clicking elsewhere closes it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /theme/i }).click();
    await expect(menu(page)).toBeVisible();
    await page.mouse.click(900, 450);
    await expect(menu(page)).toBeHidden();
  });

  test("Escape closes it and returns focus to the button", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: /theme/i });
    await button.click();
    await expect(menu(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu(page)).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("moving the mouse away from it closes it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("menuitem", { name: /^dark$/i }).hover();
    await expect(menu(page)).toBeVisible();
    await page.mouse.move(900, 450, { steps: 5 });
    await expect(menu(page)).toBeHidden();
  });

  test("crossing from the button to the menu keeps it open", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /theme/i }).hover();
    await page.getByRole("button", { name: /theme/i }).click();
    // Travel up through the small gap between the button and the menu.
    await page.getByRole("menuitem", { name: /^light$/i }).hover();
    await page.waitForTimeout(300);
    await expect(menu(page)).toBeVisible();
    await page.getByRole("menuitem", { name: /^light$/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});

test.describe("theme menu on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("a tap opens it and it stays open until a choice or a tap elsewhere", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).tap();
    await page.getByRole("button", { name: /theme/i }).tap();
    await page.waitForTimeout(300);
    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByRole("menuitem", { name: /^dark$/i }).tap();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});

test.describe("theme circle reveal", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("choosing a theme reveals it in a circle from the button", async ({ page }) => {
    await page.goto("/");
    await recordTransitions(page);
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("menuitem", { name: /^light$/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect
      .poll(() => recorded(page))
      .toContain("::view-transition-new(root)|400|theme-circle");
  });

  test("the menu is gone before the reveal starts", async ({ page }) => {
    await page.goto("/");
    const states: boolean[] = [];
    await page.exposeFunction("__menuOpen", (open: boolean) => states.push(open));
    await page.evaluate(() => {
      const original = document.startViewTransition.bind(document);
      document.startViewTransition = ((arg: Parameters<typeof original>[0]) => {
        (window as unknown as { __menuOpen: (o: boolean) => void }).__menuOpen(
          !!document.querySelector('[role="menu"]'),
        );
        return original(arg);
      }) as typeof document.startViewTransition;
    });
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("menuitem", { name: /^dark$/i }).click();
    await expect.poll(() => states.length).toBeGreaterThan(0);
    expect(states[0]).toBe(false);
  });
});

test.describe("theme circle reveal, timing", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  /** Wraps startViewTransition so each call records `label` from inside it. */
  async function spy(page: import("@playwright/test").Page) {
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { __log: string[] }).__log = log;
      const root = () => document.documentElement;
      const original = document.startViewTransition.bind(document);
      document.startViewTransition = ((arg: () => void | Promise<void>) => {
        const transition = original(async () => {
          await arg();
          log.push(`after:${root().dataset.theme}|${root().style.colorScheme}`);
        });
        transition.ready
          .then(() => log.push(`ready:${root().classList.contains("theme-reveal")}`))
          .catch(() => log.push("ready:skipped"));
        return transition;
      }) as typeof document.startViewTransition;
    });
  }
  const log = (page: import("@playwright/test").Page) =>
    page.evaluate(() => (window as unknown as { __log: string[] }).__log);

  test("the new theme is fully applied before the circle is drawn", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("theme", "dark"));
    await page.goto("/");
    await spy(page);
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("menuitem", { name: /^light$/i }).click();
    await expect.poll(() => log(page)).toContain("after:light|light");
  });
});

test.describe("theme circle reveal, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("switches instantly", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const w = window as unknown as { __vtCalls: number };
      w.__vtCalls = 0;
      const original = document.startViewTransition.bind(document);
      document.startViewTransition = ((arg: Parameters<typeof original>[0]) => {
        w.__vtCalls += 1;
        return original(arg);
      }) as typeof document.startViewTransition;
    });
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("menuitem", { name: /^light$/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as unknown as { __vtCalls: number }).__vtCalls)).toBe(
      0,
    );
  });
});
