import { beforeEach, describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";
import { __resetRateLimit, checkRateLimit } from "@/lib/rate-limit";

const valid = { name: "Ama", email: "ama@example.com", message: "Hello, I have a role for you." };

describe("contactSchema", () => {
  it("accepts a well-formed message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a malformed email", () => {
    expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("rejects an empty name", () => {
    expect(contactSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects a message under ten characters", () => {
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
  });

  it("rejects a message over two thousand characters", () => {
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(2001) }).success).toBe(false);
  });

  it("treats a filled honeypot as invalid", () => {
    expect(contactSchema.safeParse({ ...valid, website: "spam.example" }).success).toBe(false);
  });

  it("accepts an empty honeypot", () => {
    expect(contactSchema.safeParse({ ...valid, website: "" }).success).toBe(true);
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => __resetRateLimit());

  it("allows the first three requests from a key", () => {
    expect(checkRateLimit("1.1.1.1", 0)).toBe(true);
    expect(checkRateLimit("1.1.1.1", 0)).toBe(true);
    expect(checkRateLimit("1.1.1.1", 0)).toBe(true);
  });

  it("blocks the fourth within the window", () => {
    for (let i = 0; i < 3; i += 1) checkRateLimit("1.1.1.1", 0);
    expect(checkRateLimit("1.1.1.1", 0)).toBe(false);
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 3; i += 1) checkRateLimit("1.1.1.1", 0);
    expect(checkRateLimit("2.2.2.2", 0)).toBe(true);
  });

  it("allows again once the window has passed", () => {
    for (let i = 0; i < 3; i += 1) checkRateLimit("1.1.1.1", 0);
    expect(checkRateLimit("1.1.1.1", 3_600_001)).toBe(true);
  });

  it("does not let a blocked key extend its own window", () => {
    for (let i = 0; i < 3; i += 1) checkRateLimit("1.1.1.1", 0);
    // Hammering while blocked must not push the window forward.
    for (let i = 0; i < 10; i += 1) checkRateLimit("1.1.1.1", 1000);
    expect(checkRateLimit("1.1.1.1", 3_600_001)).toBe(true);
  });
});
