import { expect, test } from "@playwright/test";

const SLUGS = ["medispace", "pos", "bitby"];

test("renders the MediSpace case study with all five sections", async ({ page }) => {
  await page.goto("/projects/medispace");
  await expect(page.getByRole("heading", { level: 1, name: "MediSpace" })).toBeVisible();

  for (const heading of ["Context", "My role", "Key decisions", "The hard part", "Outcome"]) {
    await expect(
      page.getByRole("heading", { level: 2, name: new RegExp(heading, "i") }),
    ).toBeVisible();
  }
});

test("tints the case study gradient with the project hue", async ({ page }) => {
  await page.goto("/projects/pos");
  const hue = await page
    .locator(".mesh")
    .first()
    .evaluate((el) => getComputedStyle(el).getPropertyValue("--mesh-hue"));
  expect(hue.trim()).toBe("24deg");
});

test("links MediSpace to its live site", async ({ page }) => {
  await page.goto("/projects/medispace");
  const link = page.getByRole("link", { name: /live site/i }).first();
  await expect(link).toHaveAttribute("href", "https://medi-space-xzz7.vercel.app");
});

test("offers no live link for a repo-only project", async ({ page }) => {
  await page.goto("/projects/pos");
  await expect(page.getByRole("link", { name: /live site/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^source$/i }).first()).toBeVisible();
});

test("shows a recording, not a live link, for bitby", async ({ page }) => {
  await page.goto("/projects/bitby");
  await expect(page.locator("video")).toBeVisible();
  await expect(page.getByRole("link", { name: /live site/i })).toHaveCount(0);
});

test("does not preload the bitby recording", async ({ page }) => {
  await page.goto("/projects/bitby");
  await expect(page.locator("video")).toHaveAttribute("preload", "none");
});

test("states bitby's non-affiliation", async ({ page }) => {
  await page.goto("/projects/bitby");
  await expect(
    page.getByText(/not affiliated with, endorsed by, or connected to Binance/i),
  ).toBeVisible();
});

test("leaks no drafting notes into any rendered case study", async ({ page }) => {
  for (const slug of SLUGS) {
    await page.goto(`/projects/${slug}`);
    await expect(page.getByText(/TO CONFIRM/)).toHaveCount(0);
  }
});

test("states the contribution scope on every case study", async ({ page }) => {
  // Scope differs per project, so assert the actual claim rather than a single
  // phrase. POS was a solo build including backend integration; claiming
  // "frontend only" there would contradict its own case study.
  const SCOPE: Record<string, RegExp> = {
    medispace: /frontend only/i,
    pos: /frontend and backend integration/i,
    bitby: /frontend only/i,
  };

  for (const slug of SLUGS) {
    await page.goto(`/projects/${slug}`);
    await expect(page.getByText(SCOPE[slug]).first()).toBeVisible();
  }
});

test("an unknown slug returns 404 with a route back", async ({ page }) => {
  const response = await page.goto("/projects/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /all projects/i })).toBeVisible();
});

test("an unknown top-level route returns 404", async ({ page }) => {
  const response = await page.goto("/nope");
  expect(response?.status()).toBe(404);
});

test("gives each case study its own title and description", async ({ page }) => {
  await page.goto("/projects/medispace");
  await expect(page).toHaveTitle(/MediSpace/);
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description).toMatch(/medication/i);
});
