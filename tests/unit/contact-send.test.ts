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
