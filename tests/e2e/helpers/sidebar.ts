import type { Page } from "@playwright/test";

/** Clicks a desktop sidebar link. */
export async function clickSidebarLink(page: Page, label: string) {
  const nav = page.getByRole("complementary", { name: /main/i });
  await nav.getByRole("link", { name: label, exact: true }).click();
}
