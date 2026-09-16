import { expect, test } from "@playwright/test";

const FILLED = {
  name: "Ama",
  email: "ama@example.com",
  message: "I would like to talk to you about a frontend role.",
};

function formAlert(page: import("@playwright/test").Page) {
  // Scoped to the form: Next's route announcer also carries role="alert".
  return page.locator("form").getByRole("alert");
}

async function fill(page: import("@playwright/test").Page) {
  await page.getByLabel("Name").fill(FILLED.name);
  await page.getByLabel("Email").fill(FILLED.email);
  await page.getByLabel("Message").fill(FILLED.message);
}

test("shows a validation error for a short message", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Ama");
  await page.getByLabel("Email").fill("ama@example.com");
  await page.getByLabel("Message").fill("hi");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(formAlert(page)).toContainText(/ten characters/i);
});

test("shows a validation error for a malformed email", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Ama");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Message").fill(FILLED.message);
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(formAlert(page)).toContainText(/valid email/i);
});

test("shows a success state when the api accepts the message", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }),
  );
  await page.goto("/contact");
  await fill(page);
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByRole("status")).toContainText(/message sent/i);
});

test("keeps what the user typed when the api fails", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: '{"error":"Could not send the message. Please email me directly."}',
    }),
  );
  await page.goto("/contact");
  await fill(page);
  await page.getByRole("button", { name: /send message/i }).click();

  await expect(formAlert(page)).toContainText(/could not send/i);
  await expect(page.getByLabel("Message")).toHaveValue(FILLED.message);
  await expect(page.getByLabel("Email")).toHaveValue(FILLED.email);
});

test("surfaces the rate limit message", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: '{"error":"Too many messages. Please try again later, or email me directly."}',
    }),
  );
  await page.goto("/contact");
  await fill(page);
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(formAlert(page)).toContainText(/too many messages/i);
});

test("always shows the direct email address", async ({ page }) => {
  await page.goto("/contact");
  const mailto = page.getByRole("link", { name: "ddanso3000@gmail.com" });
  await expect(mailto).toBeVisible();
  await expect(mailto).toHaveAttribute("href", "mailto:ddanso3000@gmail.com");
});

test("no page exposes the old university address", async ({ page }) => {
  for (const route of ["/", "/projects", "/about", "/resume", "/contact"]) {
    await page.goto(route);
    await expect(page.getByText(/st\.knust\.edu\.gh/i)).toHaveCount(0);
  }
});

test("the resume page carries no contact block", async ({ page }) => {
  await page.goto("/resume");
  await expect(page.getByText(/prefer to talk/i)).toHaveCount(0);
});

test("posts to the api without javascript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/contact");

  const form = page.locator("form");
  await expect(form).toHaveAttribute("action", "/api/contact");
  await expect(form).toHaveAttribute("method", "post");
  await context.close();
});

test("hides the honeypot from assistive technology", async ({ page }) => {
  await page.goto("/contact");
  const honeypot = page.locator('input[name="website"]');
  await expect(honeypot).toBeHidden();
  await expect(honeypot).toHaveAttribute("tabindex", "-1");
});

test("offers a downloadable resume", async ({ page }) => {
  await page.goto("/resume");
  await expect(page.getByRole("link", { name: /download pdf/i })).toHaveAttribute(
    "href",
    "/resume.pdf",
  );
});

test("the about page renders without a photo", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();
  await expect(page.getByText("Frontend Engineer").first()).toBeVisible();
});

test("the footer offers contact routes on every page", async ({ page }) => {
  for (const route of ["/", "/projects", "/about", "/resume"]) {
    await page.goto(route);
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: /contact/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /github/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /linkedin/i })).toHaveCount(0);
  }
});
