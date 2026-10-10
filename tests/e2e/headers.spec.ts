import { expect, test } from "@playwright/test";

const EXPECTED = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "x-frame-options",
];

const CASE_STUDIES = ["medispace", "pos", "bitby", "intercli", "smartsocket"];

test("serves the security headers on pages", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  for (const name of EXPECTED) expect(headers[name], name).toBeTruthy();
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["content-security-policy"]).not.toContain("unsafe-eval");
});

test("serves the security headers on the contact API", async ({ request }) => {
  // A unique address keeps this out of the shared rate-limit bucket.
  const response = await request.post("/api/contact", {
    data: {},
    headers: { "x-forwarded-for": "203.0.113.50" },
  });
  expect(response.status()).toBe(400);
  for (const name of EXPECTED) expect(response.headers()[name], name).toBeTruthy();
});

test("no case study is broken by the policy, including the one with video", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  for (const slug of CASE_STUDIES) {
    await page.goto(`/projects/${slug}`, { waitUntil: "networkidle" });
  }

  expect(errors).toEqual([]);
});

test("the no-JavaScript contact form still posts", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  // Stand in for the API so no real email is sent. CSP form-action is checked
  // by the browser before the request leaves, so a blocked post never arrives.
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<p>ok</p>" }),
  );

  await page.goto("/contact");
  await page.fill('input[name="name"]', "Ama");
  await page.fill('input[name="email"]', "ama@example.com");
  await page.fill('textarea[name="message"]', "Hello, I have a role for you.");

  const posted = page.waitForRequest(
    (request) => request.url().endsWith("/api/contact") && request.method() === "POST",
  );
  await page.locator('form button[type="submit"]').click();
  await posted;

  await context.close();
});

const ROUTES = [
  "/",
  "/projects",
  "/about",
  "/resume",
  "/skills",
  "/contact",
  ...CASE_STUDIES.map((slug) => `/projects/${slug}`),
];

test("no route trips the security policy, even silently", async ({ page }) => {
  // A violation that a library catches never reaches the console, but Chrome
  // still files it in the Issues panel, and Lighthouse counts it against Best
  // Practices. Zod's eval probe on /contact was exactly that.
  const cdp = await page.context().newCDPSession(page);
  const violations: string[] = [];
  cdp.on("Audits.issueAdded", ({ issue }) => {
    if (issue.code === "ContentSecurityPolicyIssue") {
      const details = issue.details.contentSecurityPolicyIssueDetails;
      violations.push(`${page.url()}: ${details?.contentSecurityPolicyViolationType}`);
    }
  });
  await cdp.send("Audits.enable");

  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "networkidle" });
  }

  expect(violations).toEqual([]);
});
