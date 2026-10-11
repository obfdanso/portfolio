import { expect, test } from "@playwright/test";

test("the gradient blobs hold still", async ({ page }) => {
  // Danso's call, 2026-10-11: the blobs used to drift on a loop, but moving a
  // blurred layer makes the GPU redo the blur every frame. On an Intel UHD
  // 620 the drift kept the GPU about 33% busy; held still, 2.4%. This pins it
  // so a drift is not added back without measuring.
  await page.goto("/");
  const animations = await page
    .locator(".mesh__blob")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  expect(animations).toEqual(["none", "none", "none"]);
});

test("the gradient is hidden from the accessibility tree", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".mesh")).toHaveAttribute("aria-hidden", "true");
});

test("the blobs keep their blur", async ({ page }) => {
  // Danso's call, 2026-10-02: the blurred gradient stays. A blur-free version
  // was faster but read as less soft. This pins the preference so it is not
  // optimised away again without asking.
  await page.goto("/");
  const filters = await page
    .locator(".mesh__blob")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).filter));
  expect(filters.length).toBe(3);
  for (const f of filters) expect(f).toBe("blur(110px)");
});
