import { expect, test } from "@playwright/test";

test("serves a sitemap listing every project", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);

  const body = await response.text();
  for (const slug of ["medispace", "pos", "bitby"]) {
    expect(body).toContain(`/projects/${slug}`);
  }
});

test("serves robots.txt pointing at the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("sitemap.xml");
});

test("gives each case study its own title and description", async ({ page }) => {
  await page.goto("/projects/medispace");
  await expect(page).toHaveTitle(/MediSpace/);

  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description).toMatch(/medication/i);
});

test("embeds Person structured data", async ({ page }) => {
  await page.goto("/");
  const json = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(json ?? "{}");

  expect(data["@type"]).toBe("Person");
  expect(data.jobTitle).toBe("Frontend Engineer");
  expect(data.jobTitle).not.toMatch(/full[- ]stack/i);
});

test("generates a social card for the site and each case study", async ({ request }) => {
  for (const path of [
    "/opengraph-image",
    "/projects/medispace/opengraph-image",
    "/projects/bitby/opengraph-image",
  ]) {
    const response = await request.get(path);
    expect(response.status(), `${path} should render`).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
});

test("declares an open graph image on the home page", async ({ page }) => {
  await page.goto("/");
  const og = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(og).toContain("opengraph-image");
});
