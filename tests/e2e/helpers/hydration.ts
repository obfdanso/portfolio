import type { Page } from "@playwright/test";

/**
 * Waits until React has hydrated the page, so its event handlers are live.
 * The back button records each page in the tab's trail from an effect, and
 * effects only run once hydration is done, so the trail appearing is the
 * signal. A test that presses keys sooner can beat React to it.
 */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => window.sessionStorage.getItem("nav-trail") !== null);
}
