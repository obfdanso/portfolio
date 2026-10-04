import { expect, test } from "@playwright/test";
import { loadProjects } from "@/lib/content";

// Every page a visitor can reach, case studies included.
const ROUTES = [
  "/",
  "/projects",
  "/about",
  "/resume",
  "/skills",
  "/contact",
  ...loadProjects().map((project) => `/projects/${project.slug}`),
];

test("no page shows an em dash, in its text, tab title or link preview", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const text = await page.evaluate(() =>
      [
        document.title,
        document.body.innerText,
        ...Array.from(document.querySelectorAll("meta")).map((m) => m.content),
      ].join("\n"),
    );
    expect(text, route).not.toContain("—");
  }
});
