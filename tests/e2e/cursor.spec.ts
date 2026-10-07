import { expect, test } from "@playwright/test";

test.describe("hand cursor", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("every clickable button shows the hand", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("button", { name: /theme/i })).toHaveCSS("cursor", "pointer");
    await expect(page.getByRole("button", { name: "All", exact: true })).toHaveCSS(
      "cursor",
      "pointer",
    );
    await expect(page.locator("article summary").first()).toHaveCSS("cursor", "pointer");

    await page.getByRole("button", { name: /theme/i }).click();
    await expect(page.getByRole("menuitem").first()).toHaveCSS("cursor", "pointer");

    await page.goto("/contact");
    await expect(page.getByRole("button", { name: /send message/i })).toHaveCSS(
      "cursor",
      "pointer",
    );
  });

  test("a disabled button does not look clickable", async ({ page }) => {
    await page.goto("/contact");
    const send = page.getByRole("button", { name: /send message/i });
    await send.evaluate((el) => el.setAttribute("disabled", ""));
    await expect(send).toHaveCSS("cursor", "not-allowed");
  });
});
