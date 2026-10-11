import type { Page } from "@playwright/test";

/**
 * Clicks a desktop sidebar link the way a mouse user reaches it. At rest
 * the links sit folded in a deck with only the current page's card showing,
 * so the pointer goes to the list first, which fans it out, and then to the
 * link.
 */
export async function clickSidebarLink(page: Page, label: string) {
  const nav = page.getByRole("complementary", { name: /main/i });
  await nav.locator("nav ul").first().hover();
  await nav.getByRole("link", { name: label, exact: true }).click();
}
