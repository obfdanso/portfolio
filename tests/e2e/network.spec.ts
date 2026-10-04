import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/projects",
  "/projects/medispace",
  "/about",
  "/resume",
  "/skills",
  "/contact",
];

test("no route makes a failing request", async ({ page }) => {
  // A single 404 — a missing favicon, an analytics script that only exists on
  // the host — logs a console error and costs the Lighthouse Best Practices
  // score. This has caught that twice.
  const failures: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });

  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "networkidle" });
  }

  expect(failures).toEqual([]);
});

test("no route logs a console error", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "networkidle" });
  }

  expect(errors).toEqual([]);
});
