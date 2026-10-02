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

test("links bitby to its source, with no live link", async ({ page }) => {
  await page.goto("/projects/bitby");
  await expect(page.getByRole("link", { name: /live site/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^source$/i }).first()).toHaveAttribute(
    "href",
    "https://github.com/obfdanso/bitby",
  );
});

test("bitby shows a coming-soon panel in place of a player", async ({ page }) => {
  await page.goto("/projects/bitby");
  await expect(page.getByText(/screen recording coming soon/i)).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /view the source/i })).toHaveAttribute(
    "href",
    "https://github.com/obfdanso/bitby",
  );
});

test("the coming-soon panel animates", async ({ page }) => {
  await page.goto("/projects/bitby");
  const ring = page.locator(".recording-soon__ring").first();
  await expect(ring).toHaveCSS("animation-name", "recording-ripple");
});

test.describe("coming-soon panel, reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("holds still and stays readable", async ({ page }) => {
    await page.goto("/projects/bitby");
    await expect(page.locator(".recording-soon__ring").first()).toHaveCSS("animation-name", "none");
    await expect(page.locator(".recording-soon__disc")).toHaveCSS("animation-name", "none");
    await expect(page.getByText(/screen recording coming soon/i)).toBeVisible();
  });
});

test("any embedded recording is lazy and actually playable", async ({ page, request }) => {
  // Holds for whichever project carries a recording, so it keeps working once
  // bitby's video lands.
  for (const slug of SLUGS) {
    await page.goto(`/projects/${slug}`);
    const video = page.locator("video");
    if ((await video.count()) === 0) continue;

    await expect(video).toHaveAttribute("preload", "none");
    const src = await video.locator("source").getAttribute("src");
    const response = await request.get(src!);
    expect(response.status(), `${slug} video must exist`).toBe(200);
  }
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
