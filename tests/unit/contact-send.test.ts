// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Resend is replaced so each test decides what the email service answers.
const send = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

const { POST } = await import("@/app/api/contact/route");
const { __resetRateLimit } = await import("@/lib/rate-limit");

const VALID = { name: "Ama", email: "ama@example.com", message: "Hello, I liked your work." };

function post(body: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

/** The body a browser sends when the form posts without JavaScript. */
function postForm(fields: Record<string, string>, ip = "1.2.3.4") {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": ip },
    body: new URLSearchParams(fields).toString(),
  });
}

describe("POST /api/contact, sending", () => {
  beforeEach(() => {
    __resetRateLimit();
    send.mockReset();
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_TO_EMAIL", "inbox@example.com");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("says the message was sent when Resend accepts it", async () => {
    send.mockResolvedValue({ data: { id: "1" }, error: null, headers: null });
    const response = await POST(post(VALID));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ to: "inbox@example.com", replyTo: VALID.email }),
    );
  });

  it("sends a form post on to a page that confirms the message was sent", async () => {
    // Without JavaScript the browser follows this redirect, so the page it
    // lands on is the only confirmation the visitor gets.
    send.mockResolvedValue({ data: { id: "1" }, error: null, headers: null });
    const response = await POST(postForm({ ...VALID, website: "" }));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/contact/sent");
  });

  it("answers a failed form post with a page a person can read, not JSON", async () => {
    // The form skips the browser's own validation, so without JavaScript a
    // mistyped email reaches the API, and its answer is what the visitor sees.
    const response = await POST(postForm({ ...VALID, email: "not-an-email", website: "" }));
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain("text/html");
    const page = await response.text();
    expect(page).toContain("Please enter a valid email address");
    expect(page).toContain('href="/contact"');
  });

  it("tells a form post in a page when the email service fails", async () => {
    send.mockResolvedValue({
      data: null,
      error: { name: "invalid_api_key", message: "API key is invalid" },
      headers: null,
    });
    const response = await POST(postForm({ ...VALID, website: "" }));
    expect(response.status).toBe(502);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(await response.text()).toContain("Could not send the message");
  });

  it("sends nothing for a filled honeypot, and lets the bot think it worked", async () => {
    // An error would tell a bot which field gave it away.
    const response = await POST(post({ ...VALID, website: "spam.example" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();

    const form = await POST(postForm({ ...VALID, website: "spam.example" }));
    expect(form.status).toBe(303);
    expect(send).not.toHaveBeenCalled();
  });

  it("never claims success when Resend rejects the message", async () => {
    // Resend reports rejections in the result instead of throwing.
    send.mockResolvedValue({
      data: null,
      error: { name: "invalid_api_key", message: "API key is invalid" },
      headers: null,
    });
    const response = await POST(post(VALID));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "Could not send the message. Please email me directly.",
    });
  });

  it("fails cleanly when the inbox is not configured", async () => {
    vi.stubEnv("CONTACT_TO_EMAIL", "");
    const response = await POST(post(VALID));
    expect(response.status).toBe(502);
    expect(send).not.toHaveBeenCalled();
  });

  it("does not count invalid attempts against the hourly limit", async () => {
    send.mockResolvedValue({ data: { id: "1" }, error: null, headers: null });
    for (let i = 0; i < 5; i += 1) {
      const bad = await POST(post({ ...VALID, email: "not-an-email" }));
      expect(bad.status).toBe(400);
    }
    const good = await POST(post(VALID));
    expect(good.status).toBe(200);
  });

  it("still stops a fourth message within the hour", async () => {
    send.mockResolvedValue({ data: { id: "1" }, error: null, headers: null });
    for (let i = 0; i < 3; i += 1) expect((await POST(post(VALID))).status).toBe(200);
    expect((await POST(post(VALID))).status).toBe(429);
  });
});
