// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/contact/route";
import { __resetRateLimit } from "@/lib/rate-limit";

function post(body: string, contentType: string) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": contentType, "x-forwarded-for": "9.9.9.9" },
    body,
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => __resetRateLimit());

  it("answers malformed JSON with a 400, not a crash", async () => {
    const response = await POST(post("{not json", "application/json"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid submission." });
  });

  it("answers an unreadable form body with a 400", async () => {
    const response = await POST(post("x", "multipart/form-data; boundary=nope"));
    expect(response.status).toBe(400);
  });

  it("still rejects a well-formed body that fails validation", async () => {
    const response = await POST(post(JSON.stringify({ name: "" }), "application/json"));
    expect(response.status).toBe(400);
  });
});
